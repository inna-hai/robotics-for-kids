import assert from 'node:assert/strict';
import { chmodSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:net';
import { spawn } from 'node:child_process';
import Database from 'better-sqlite3';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = mkdtempSync(join(tmpdir(), 'classroom-delivery-race-'));
const dbPath = join(dir, 'db.sqlite');
const capturePath = join(dir, 'mail.jsonl');
const mailerPath = join(dir, 'mailer');
writeFileSync(mailerPath, `#!/bin/sh
payload=$(cat)
printf '%s\\n' "$payload" >> ${JSON.stringify(capturePath)}
sleep 0.4
exit 0
`);
chmodSync(mailerPath, 0o700);
const freePort = () => new Promise((resolve, reject) => { const s = createServer(); s.once('error', reject); s.listen(0, '127.0.0.1', () => { const { port } = s.address(); s.close(() => resolve(port)); }); });
const port = await freePort();
const base = `http://127.0.0.1:${port}`;
const child = spawn(process.execPath, ['server.js'], { cwd: root, env: { ...process.env, NODE_ENV: 'production', PORT: String(port),
  ROBOTICS_DATA_DIR: dir, ROBOTICS_DB_FILE: dbPath, ROBOTICS_CLASSROOM_ADMIN_EMAIL: 'owner@example.test',
  ROBOTICS_CLASSROOM_ADMIN_CODE: '', ROBOTICS_TEACHER_INVITE_CODE: '', ROBOTICS_CREDENTIAL_MAILER: mailerPath }, stdio: ['ignore','pipe','pipe'] });
let stderr=''; child.stderr.on('data', c => { stderr += c; });
const post = (path, body, cookie='') => fetch(`${base}${path}`, { method:'POST', headers:{'content-type':'application/json',...(cookie?{cookie}:{})}, body:JSON.stringify(body) });
async function waitForMail(count) {
  for (let i=0;i<300;i+=1) {
    if (existsSync(capturePath)) { const lines=readFileSync(capturePath,'utf8').trim().split('\n').filter(Boolean); if(lines.length>=count) return lines.map(JSON.parse); }
    await new Promise(r=>setTimeout(r,10));
  }
  throw new Error(`mail ${count} missing: ${stderr}`);
}
try {
  for(let i=0;i<200;i+=1){ if(child.exitCode!==null) throw new Error(stderr); try{if((await fetch(`${base}/api/classroom/admin-me`)).ok) break;}catch{} await new Promise(r=>setTimeout(r,25)); }
  assert.equal((await post('/api/classroom/admin-access/request',{email:'owner@example.test'})).status,202);
  const [staleAccessMail]=await waitForMail(1);
  const staleAccessDb=new Database(dbPath);
  const staleAccess=staleAccessDb.prepare("SELECT id FROM classroom_admin_challenges WHERE purpose='access' ORDER BY created_at DESC LIMIT 1").get();
  staleAccessDb.prepare('UPDATE classroom_admin_challenges SET revoked_at=? WHERE id=?').run(new Date().toISOString(),staleAccess.id);
  staleAccessDb.close();
  await new Promise(r=>setTimeout(r,450));
  const staleAccessAfter=new Database(dbPath,{readonly:true});
  assert.equal(staleAccessAfter.prepare("SELECT COUNT(*) n FROM classroom_credential_audit WHERE action='delivery' AND target_id=?").get(staleAccess.id).n,0,
    'stale administrator access delivery must not append a delivery audit');
  staleAccessAfter.close();
  assert.equal((await post('/api/classroom/admin-access/redeem',{email:'owner@example.test',code:staleAccessMail.code})).status,401);

  assert.equal((await post('/api/classroom/admin-access/request',{email:'owner@example.test'})).status,202);
  const accessMails=await waitForMail(2);
  const accessMail=accessMails[1];
  await new Promise(r=>setTimeout(r,450));
  const redeemed=await post('/api/classroom/admin-access/redeem',{email:'owner@example.test',code:accessMail.code});
  assert.equal(redeemed.status,200);
  const cookie=(redeemed.headers.get('set-cookie')||'').split(';')[0];
  const creating=post('/api/classroom/admin/invitations',{name:'Stale Delivery',email:'stale@example.test'},cookie);
  await waitForMail(3);
  const responsiveStarted=Date.now();
  const responsiveAdmin=await fetch(`${base}/api/classroom/admin-me`,{headers:{cookie}});
  assert.equal(responsiveAdmin.status,200);
  assert.ok(Date.now()-responsiveStarted<250,'credential mail delivery must not block unrelated requests');
  const during=new Database(dbPath);
  const invitation=during.prepare("SELECT id FROM classroom_teacher_invitations WHERE email='stale@example.test'").get();
  during.prepare("UPDATE classroom_teacher_invitations SET status='revoked', revoked_at=?, updated_at=? WHERE id=?").run(new Date().toISOString(),new Date().toISOString(),invitation.id);
  during.close();
  const response=await creating;
  assert.equal(response.status,409,'stale initial invitation delivery must not report creation success');
  const after=new Database(dbPath,{readonly:true});
  assert.equal(after.prepare("SELECT status FROM classroom_teacher_invitations WHERE id=?").get(invitation.id).status,'revoked');
  assert.equal(after.prepare("SELECT COUNT(*) n FROM classroom_credential_audit WHERE action='delivery' AND target_id=?").get(invitation.id).n,0,
    'stale initial delivery must not append a delivery audit');
  after.close();

  const rotating=post('/api/classroom/admin/rotate',{},cookie);
  await waitForMail(4);
  const rotationDb=new Database(dbPath);
  const rotation=rotationDb.prepare("SELECT id,credential_version FROM classroom_admin_challenges WHERE purpose='rotation' ORDER BY created_at DESC LIMIT 1").get();
  rotationDb.prepare('UPDATE classroom_admin_challenges SET revoked_at=? WHERE id=?').run(new Date().toISOString(),rotation.id);
  rotationDb.close();
  const rotationResponse=await rotating;
  assert.equal(rotationResponse.status,409,'stale rotation delivery must not report success');
  const rotationAfter=new Database(dbPath,{readonly:true});
  assert.equal(rotationAfter.prepare("SELECT COUNT(*) n FROM classroom_credential_audit WHERE action='delivery' AND target_id=?").get(rotation.id).n,0,
    'stale rotation delivery must not append a delivery audit');
  rotationAfter.close();
  console.log('✓ stale administrator access and rotation mail completions cannot mutate, audit, or report success');
  console.log('✓ stale initial invitation mail completion cannot mutate, audit, or report success');
} finally {
  if(child.exitCode===null) child.kill('SIGTERM');
  await new Promise(r=>child.exitCode===null?child.once('exit',r):r());
  rmSync(dir,{recursive:true,force:true});
}
