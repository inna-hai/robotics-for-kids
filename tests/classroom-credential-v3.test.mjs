import assert from 'node:assert/strict';
import { chmodSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:net';
import { request as httpRequest } from 'node:http';
import { spawn } from 'node:child_process';
import Database from 'better-sqlite3';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const tempDir = mkdtempSync(join(tmpdir(), 'credential-v3-'));
const freePort = () => new Promise((resolve, reject) => {
  const socket = createServer(); socket.once('error', reject);
  socket.listen(0, '127.0.0.1', () => { const { port } = socket.address(); socket.close(() => resolve(port)); });
});
const port = await freePort();
const base = `http://127.0.0.1:${port}`;
const child = spawn(process.execPath, ['server.js'], {
  cwd: root,
  env: { ...process.env, NODE_ENV: 'test', PORT: String(port), ROBOTICS_DATA_DIR: tempDir,
    ROBOTICS_DB_FILE: join(tempDir, 'db.sqlite'), ROBOTICS_CLASSROOM_ADMIN_EMAIL: 'owner@example.test' },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let stderr = '';
child.stderr.on('data', chunk => { stderr += chunk; });
const childExit = new Promise(resolve => child.once('exit', resolve));
async function ready() {
  for (let i = 0; i < 200; i += 1) {
    if (child.exitCode !== null) throw new Error(`server exited early: ${stderr}`);
    try { const r = await fetch(`${base}/api/classroom/admin-me`); if (r.ok) return; } catch {}
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  throw new Error(`server did not become ready: ${stderr}`);
}
async function post(path, body = {}) {
  return fetch(`${base}${path}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
}
try {
  await ready();
  const unknownAdminRequest = await post('/api/classroom/admin-access/request', { email: 'unknown-admin@example.test' });
  assert.equal(unknownAdminRequest.status, 202);
  const unknownAuditDb = new Database(join(tempDir, 'db.sqlite'), { readonly: true });
  assert.equal(unknownAuditDb.prepare(`SELECT outcome FROM classroom_credential_audit
    WHERE action='issuance' AND target_id='unknown' ORDER BY rowid DESC LIMIT 1`).get()?.outcome, 'denied');
  unknownAuditDb.close();
  for (const path of ['/api/classroom/admin-login', '/api/classroom/teacher-register']) {
    const response = await post(path, { code: 'legacy-shared-secret' });
    assert.equal(response.status, 410, `${path} must be permanently gone`);
  }
  console.log('✓ legacy shared credential routes are permanently gone');

  const accessRequest = await post('/api/classroom/admin-access/request', { email: 'owner@example.test' });
  assert.equal(accessRequest.status, 202);
  const accessBody = await accessRequest.json();
  assert.equal(accessBody.ok, true);
  assert.equal(typeof accessBody.testCode, 'string');
  assert.ok(accessBody.testCode.length >= 20);
  const db = new (await import('better-sqlite3')).default(join(tempDir, 'db.sqlite'));
  const identity = db.prepare('SELECT * FROM classroom_admin_identity').get();
  const challenge = db.prepare('SELECT * FROM classroom_admin_challenges').get();
  assert.equal(identity.email, 'owner@example.test');
  assert.equal(identity.credential_version, 1);
  assert.equal(challenge.code_hash.includes(accessBody.testCode), false);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM classroom_admin_identity').get().n, 1);
  db.close();
  console.log('✓ singleton admin bootstrap requests a hash-only one-time access challenge');

  const redemption = await post('/api/classroom/admin-access/redeem', { email: 'owner@example.test', code: accessBody.testCode });
  assert.equal(redemption.status, 200);
  const adminCookie = redemption.headers.get('set-cookie') || '';
  assert.match(adminCookie, /^haiTechClassroomAdminToken=/);
  assert.match(adminCookie, /HttpOnly/);
  assert.match(adminCookie, /SameSite=Strict/);
  const replay = await post('/api/classroom/admin-access/redeem', { email: 'owner@example.test', code: accessBody.testCode });
  assert.equal(replay.status, 401);
  const invalidAdminRedemption = await post('/api/classroom/admin-access/redeem', { email: 'missing@example.test', code: 'invalid-code' });
  assert.equal(invalidAdminRedemption.status, 401);
  const redeemedDb = new Database(join(tempDir, 'db.sqlite'), { readonly: true });
  const session = redeemedDb.prepare('SELECT admin_id, credential_version FROM classroom_admin_sessions').get();
  assert.equal(typeof session.admin_id, 'string');
  assert.equal(session.credential_version, 1);
  assert.ok(redeemedDb.prepare('SELECT used_at FROM classroom_admin_challenges').get().used_at);
  assert.equal(redeemedDb.prepare(`SELECT outcome FROM classroom_credential_audit
    WHERE action = 'redeem' AND outcome = 'replayed' ORDER BY occurred_at DESC LIMIT 1`).get()?.outcome, 'replayed');
  assert.equal(redeemedDb.prepare(`SELECT outcome FROM classroom_credential_audit
    WHERE action = 'redeem' AND outcome = 'invalid' ORDER BY occurred_at DESC LIMIT 1`).get()?.outcome, 'invalid');
  redeemedDb.close();
  const expireChallengeDb = new Database(join(tempDir, 'db.sqlite'));
  expireChallengeDb.prepare(`UPDATE classroom_admin_challenges SET used_at = NULL, revoked_at = NULL,
    expires_at = '2000-01-01T00:00:00.000Z' WHERE id = ?`).run(challenge.id);
  expireChallengeDb.close();
  const expiredAdminRedemption = await post('/api/classroom/admin-access/redeem', { email: 'owner@example.test', code: accessBody.testCode });
  assert.equal(expiredAdminRedemption.status, 401);
  const expiredAuditDb = new Database(join(tempDir, 'db.sqlite'), { readonly: true });
  assert.equal(expiredAuditDb.prepare(`SELECT outcome FROM classroom_credential_audit
    WHERE action = 'redeem' AND target_id = ? ORDER BY occurred_at DESC LIMIT 1`).get(challenge.id)?.outcome, 'expired');
  expiredAuditDb.close();
  console.log('✓ access challenge redeems once into a version-bound secure session');

  const invitationResponse = await fetch(`${base}/api/classroom/admin/invitations`, {
    method: 'POST', credentials: 'same-origin',
    headers: { 'content-type': 'application/json', cookie: adminCookie.split(';')[0] },
    body: JSON.stringify({ name: 'Teacher One', email: 'teacher1@example.test' }),
  });
  assert.equal(invitationResponse.status, 201);
  const invitation = await invitationResponse.json();
  assert.equal(invitation.invitation.email, 'teacher1@example.test');
  assert.equal(invitation.invitation.deliveryStatus, 'sent');
  assert.equal(typeof invitation.testCode, 'string');
  const invitationDb = new Database(join(tempDir, 'db.sqlite'), { readonly: true });
  const storedInvitation = invitationDb.prepare('SELECT * FROM classroom_teacher_invitations WHERE id = ?').get(invitation.invitation.id);
  assert.equal(storedInvitation.code_hash.includes(invitation.testCode), false);
  assert.equal(storedInvitation.status, 'sent');
  invitationDb.close();
  console.log('✓ authenticated administrator creates an email-bound hash-only invitation');

  const invitationListResponse = await fetch(`${base}/api/classroom/admin/invitations`, {
    headers: { cookie: adminCookie.split(';')[0] },
  });
  assert.equal(invitationListResponse.status, 200);
  const invitationList = await invitationListResponse.json();
  assert.equal(invitationList.invitations.length, 1);
  assert.equal(invitationList.invitations[0].id, invitation.invitation.id);
  assert.equal(JSON.stringify(invitationList).includes(invitation.testCode), false);
  assert.equal(Object.hasOwn(invitationList.invitations[0], 'codeHash'), false);
  console.log('✓ durable authorized invitation listing never discloses credentials');

  const redeemInvitation = () => post('/api/classroom/teacher-invitations/redeem', {
    email: 'teacher1@example.test', code: invitation.testCode,
  });
  const redemptionAttempts = await Promise.all([redeemInvitation(), redeemInvitation()]);
  const redemptionStatuses = redemptionAttempts.map(response => response.status).sort();
  assert.deepEqual(redemptionStatuses, [201, 401]);
  const successfulRedemption = redemptionAttempts.find(response => response.status === 201);
  const teacherCredential = await successfulRedemption.json();
  assert.equal(teacherCredential.oneTime, true);
  assert.equal(typeof teacherCredential.temporaryPassword, 'string');
  assert.ok(teacherCredential.temporaryPassword.length >= 20);
  const absentTeacherLogin = await post('/api/classroom/teacher-login', {
    email: 'absent@example.test', password: 'not-the-password',
  });
  assert.equal(absentTeacherLogin.status, 401);
  assert.equal((await absentTeacherLogin.json()).testWorkFactor, 1,
    'absent teacher login must deterministically perform one canonical scrypt');
  const teacherLogin = await post('/api/classroom/teacher-login', {
    email: 'teacher1@example.test', password: teacherCredential.temporaryPassword,
  });
  assert.equal(teacherLogin.status, 200);
  const invalidTeacherLogin = await post('/api/classroom/teacher-login', {
    email: 'teacher1@example.test', password: 'not-the-password',
  });
  assert.equal(invalidTeacherLogin.status, 401);
  assert.equal((await invalidTeacherLogin.json()).testWorkFactor, 1,
    'known and absent teacher failures must expose the same deterministic work factor in test mode');
  for (let attempt = 0; attempt < 9; attempt += 1) {
    assert.equal((await post('/api/classroom/teacher-login', {
      email: 'teacher1@example.test', password: `not-the-password-${attempt}`,
    })).status, 401);
  }
  const throttledTeacherLogin = await post('/api/classroom/teacher-login', {
    email: 'teacher1@example.test', password: 'still-not-the-password',
  });
  assert.equal(throttledTeacherLogin.status, 429);
  const postRedeemDb = new Database(join(tempDir, 'db.sqlite'), { readonly: true });
  assert.equal(postRedeemDb.prepare('SELECT COUNT(*) AS n FROM classroom_teachers WHERE email = ?').get('teacher1@example.test').n, 1);
  assert.equal(postRedeemDb.prepare('SELECT status FROM classroom_teacher_invitations WHERE id = ?').get(invitation.invitation.id).status, 'redeemed');
  assert.equal(postRedeemDb.prepare(`SELECT COUNT(*) AS n FROM classroom_credential_audit
    WHERE action = 'invitation_redeem' AND target_id = ? AND outcome = 'replayed'`).get(invitation.invitation.id).n, 1,
  'the concurrent losing redemption must have a canonical replayed audit');
  assert.ok(postRedeemDb.prepare(`SELECT COUNT(*) AS n FROM classroom_credential_audit
    WHERE action = 'login' AND target_id = ? AND outcome = 'invalid'`).get(teacherCredential.teacher.id).n >= 1);
  assert.equal(postRedeemDb.prepare(`SELECT COUNT(*) AS n FROM classroom_credential_audit
    WHERE action = 'login' AND target_id = ? AND outcome = 'success'`).get(teacherCredential.teacher.id).n, 1);
  assert.equal(postRedeemDb.prepare(`SELECT outcome FROM classroom_credential_audit
    WHERE action = 'login' AND target_id = ? ORDER BY occurred_at DESC LIMIT 1`).get(teacherCredential.teacher.id)?.outcome, 'throttled');
  postRedeemDb.close();
  console.log('✓ invitation redemption is email-bound, concurrent one-time, and discloses a credential once');

  const existingTeacherInvitation = await fetch(`${base}/api/classroom/admin/invitations`, {
    method: 'POST', headers: { 'content-type': 'application/json', cookie: adminCookie.split(';')[0] },
    body: JSON.stringify({ name: 'Duplicate Teacher', email: 'teacher1@example.test' }),
  });
  assert.equal(existingTeacherInvitation.status, 409, 'existing teacher email must be rejected');
  const supersededFirst = await fetch(`${base}/api/classroom/admin/invitations`, {
    method: 'POST', headers: { 'content-type': 'application/json', cookie: adminCookie.split(';')[0] },
    body: JSON.stringify({ name: 'Superseded Teacher', email: 'superseded@example.test' }),
  }).then(response => response.json());
  const supersededSecond = await fetch(`${base}/api/classroom/admin/invitations`, {
    method: 'POST', headers: { 'content-type': 'application/json', cookie: adminCookie.split(';')[0] },
    body: JSON.stringify({ name: 'Current Teacher', email: 'superseded@example.test' }),
  }).then(response => response.json());
  assert.equal((await post('/api/classroom/teacher-invitations/redeem', {
    email: 'superseded@example.test', code: supersededFirst.testCode,
  })).status, 401);
  assert.equal((await post('/api/classroom/teacher-invitations/redeem', {
    email: 'superseded@example.test', code: supersededSecond.testCode,
  })).status, 201, 'new live invitation must redeem even when an older terminal row exists');
  const supersededDb = new Database(join(tempDir, 'db.sqlite'), { readonly: true });
  assert.equal(supersededDb.prepare('SELECT status FROM classroom_teacher_invitations WHERE id = ?').get(supersededFirst.invitation.id).status, 'revoked');
  assert.equal(supersededDb.prepare(`SELECT COUNT(*) AS n FROM classroom_teacher_invitations
    WHERE email = ? AND status IN ('pending','sent','failed','unknown')`).get('superseded@example.test').n, 0);
  supersededDb.close();
  console.log('✓ invitation creation rejects teachers and explicitly supersedes older live invitations');

  const secondInvitationResponse = await fetch(`${base}/api/classroom/admin/invitations`, {
    method: 'POST', headers: { 'content-type': 'application/json', cookie: adminCookie.split(';')[0] },
    body: JSON.stringify({ name: 'Teacher Two', email: 'teacher2@example.test' }),
  });
  const secondInvitation = await secondInvitationResponse.json();
  const resendResponse = await fetch(`${base}/api/classroom/admin/invitations/${secondInvitation.invitation.id}/resend`, {
    method: 'POST', headers: { 'content-type': 'application/json', cookie: adminCookie.split(';')[0] }, body: '{}',
  });
  assert.equal(resendResponse.status, 200);
  const resent = await resendResponse.json();
  assert.equal(resent.invitation.deliveryStatus, 'sent');
  assert.notEqual(resent.testCode, secondInvitation.testCode);
  assert.equal(resent.invitation.deliveryGeneration, 2, 'resend must create a new delivery generation');
  assert.ok(Date.parse(resent.invitation.expiresAt) > Date.parse(secondInvitation.invitation.expiresAt),
    'resend must issue a fresh invitation expiry');
  const oldCodeAfterResend = await post('/api/classroom/teacher-invitations/redeem', {
    email: 'teacher2@example.test', code: secondInvitation.testCode,
  });
  assert.equal(oldCodeAfterResend.status, 401);
  console.log('✓ authenticated resend replaces the one-time invitation credential and reports delivery truthfully');

  const revokeResponse = await fetch(`${base}/api/classroom/admin/invitations/${secondInvitation.invitation.id}/revoke`, {
    method: 'POST', headers: { 'content-type': 'application/json', cookie: adminCookie.split(';')[0] }, body: '{}',
  });
  assert.equal(revokeResponse.status, 200);
  const revokedRedemption = await post('/api/classroom/teacher-invitations/redeem', {
    email: 'teacher2@example.test', code: resent.testCode,
  });
  assert.equal(revokedRedemption.status, 401);
  const revokedList = await fetch(`${base}/api/classroom/admin/invitations`, { headers: { cookie: adminCookie.split(';')[0] } });
  const revokedListBody = await revokedList.json();
  assert.equal(revokedListBody.invitations.find(item => item.id === secondInvitation.invitation.id).status, 'revoked');
  assert.equal((await fetch(`${base}/api/classroom/admin/invitations/${secondInvitation.invitation.id}/revoke`, {
    method: 'POST', headers: { 'content-type': 'application/json', cookie: adminCookie.split(';')[0] }, body: '{}',
  })).status, 404);
  assert.equal((await fetch(`${base}/api/classroom/admin/invitations/${secondInvitation.invitation.id}/resend`, {
    method: 'POST', headers: { 'content-type': 'application/json', cookie: adminCookie.split(';')[0] }, body: '{}',
  })).status, 404);
  const unsuccessfulInvitationAudit = new Database(join(tempDir, 'db.sqlite'), { readonly: true });
  assert.equal(unsuccessfulInvitationAudit.prepare(`SELECT outcome FROM classroom_credential_audit
    WHERE target_id = ? AND action = 'invitation_redeem' ORDER BY rowid DESC LIMIT 1`).get(secondInvitation.invitation.id)?.outcome, 'denied');
  assert.equal(unsuccessfulInvitationAudit.prepare(`SELECT COUNT(*) n FROM classroom_credential_audit
    WHERE target_id = ? AND action IN ('invitation_revoke','invitation_resend') AND outcome = 'invalid'`).get(secondInvitation.invitation.id).n, 2);
  unsuccessfulInvitationAudit.close();
  console.log('✓ authenticated revoke is durable and prevents invitation redemption');

  const limitedInvitationResponse = await fetch(`${base}/api/classroom/admin/invitations`, {
    method: 'POST', headers: { 'content-type': 'application/json', cookie: adminCookie.split(';')[0] },
    body: JSON.stringify({ name: 'Limited Teacher', email: 'limited@example.test' }),
  });
  assert.equal(limitedInvitationResponse.status, 201);
  const limitedStatuses = [];
  for (let attempt = 0; attempt < 11; attempt += 1) {
    limitedStatuses.push((await post('/api/classroom/teacher-invitations/redeem', {
      email: 'limited@example.test', code: `wrong-${attempt}`,
    })).status);
  }
  assert.equal(limitedStatuses.at(-1), 429, 'recipient redemption attempts must be rate limited');
  const throttleAuditDb = new Database(join(tempDir, 'db.sqlite'), { readonly: true });
  const throttledAudit = throttleAuditDb.prepare(`SELECT outcome FROM classroom_credential_audit
    WHERE action = 'invitation_redeem' AND outcome = 'throttled' ORDER BY occurred_at DESC LIMIT 1`).get();
  throttleAuditDb.close();
  assert.equal(throttledAudit?.outcome, 'throttled', 'throttling must be recorded in the canonical audit');
  console.log('✓ invitation redemption has a recipient-scoped failure limit and canonical throttle audit');

  const adminCookieHeader = adminCookie.split(';')[0];
  const rotation = await fetch(`${base}/api/classroom/admin/rotate`, {
    method: 'POST', headers: { 'content-type': 'application/json', cookie: adminCookieHeader }, body: '{}',
  });
  assert.equal(rotation.status, 200);
  const rotationBody = await rotation.json();
  assert.equal(typeof rotationBody.testCode, 'string');
  const staleSession = await fetch(`${base}/api/classroom/admin-me`, { headers: { cookie: adminCookieHeader } });
  assert.equal((await staleSession.json()).role, 'guest');
  const rotatedDb = new Database(join(tempDir, 'db.sqlite'), { readonly: true });
  assert.equal(rotatedDb.prepare('SELECT credential_version FROM classroom_admin_identity').get().credential_version, 2);
  assert.equal(rotatedDb.prepare('SELECT COUNT(*) AS n FROM classroom_admin_sessions WHERE revoked_at IS NULL').get().n, 0);
  assert.equal(rotatedDb.prepare("SELECT COUNT(*) AS n FROM classroom_admin_challenges WHERE purpose = 'rotation' AND used_at IS NULL AND revoked_at IS NULL").get().n, 1);
  rotatedDb.close();
  console.log('✓ rotation atomically increments version, revokes old state, and issues one replacement');
} finally {
  if (child.exitCode === null) child.kill('SIGTERM');
  await childExit;
  rmSync(tempDir, { recursive: true, force: true });
}

const driftDir = mkdtempSync(join(tmpdir(), 'credential-v3-drift-'));
const driftPort = await freePort();
const drift = spawn(process.execPath, ['server.js'], {
  cwd: root,
  env: { ...process.env, NODE_ENV: 'production', PORT: String(driftPort), ROBOTICS_DATA_DIR: driftDir,
    ROBOTICS_DB_FILE: join(driftDir, 'db.sqlite'), ROBOTICS_CLASSROOM_ADMIN_CODE: 'forbidden-legacy-code',
    ROBOTICS_TEACHER_INVITE_CODE: 'forbidden-legacy-invite', ROBOTICS_CLASSROOM_ADMIN_EMAIL: '' },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let driftError = '';
drift.stderr.on('data', chunk => { driftError += chunk; });
const driftExit = new Promise(resolve => drift.once('exit', code => resolve(code)));
const driftResult = await Promise.race([driftExit, new Promise(resolve => setTimeout(() => resolve('running'), 1500))]);
if (driftResult === 'running') drift.kill('SIGTERM');
assert.notEqual(driftResult, 'running', 'production must fail closed instead of accepting legacy/missing identity config');
assert.match(driftError, /credential configuration/i);
rmSync(driftDir, { recursive: true, force: true });
console.log('✓ production fails closed on missing identity or legacy shared credential configuration');

const schemaDir = mkdtempSync(join(tmpdir(), 'credential-v3-schema-'));
const schemaDbPath = join(schemaDir, 'db.sqlite');
const schemaPort = await freePort();
const schemaChild = spawn(process.execPath, ['server.js'], {
  cwd: root,
  env: { ...process.env, NODE_ENV: 'test', PORT: String(schemaPort), ROBOTICS_DATA_DIR: schemaDir,
    ROBOTICS_DB_FILE: schemaDbPath, ROBOTICS_CLASSROOM_ADMIN_EMAIL: 'owner@example.test',
    ROBOTICS_CLASSROOM_ADMIN_CODE: '', ROBOTICS_TEACHER_INVITE_CODE: '' },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let schemaError = '';
schemaChild.stderr.on('data', chunk => { schemaError += chunk; });
for (let i = 0; i < 80; i += 1) {
  if (schemaChild.exitCode !== null) throw new Error(`schema server exited: ${schemaError}`);
  try { const response = await fetch(`http://127.0.0.1:${schemaPort}/api/classroom/admin-me`); if (response.ok) break; } catch {}
  await new Promise(resolve => setTimeout(resolve, 25));
}
schemaChild.kill('SIGTERM');
await new Promise(resolve => schemaChild.once('exit', resolve));
const schemaDb = new Database(schemaDbPath, { readonly: true });
const credentialTables = schemaDb.prepare(`SELECT name FROM sqlite_master WHERE type = 'table' AND name IN
  ('classroom_admin_identity','classroom_admin_challenges','classroom_teacher_invitations','classroom_credential_audit') ORDER BY name`).all().map(row => row.name);
assert.deepEqual(credentialTables, [
  'classroom_admin_challenges', 'classroom_admin_identity', 'classroom_credential_audit', 'classroom_teacher_invitations',
]);
schemaDb.close();

const weakenedDb = new Database(schemaDbPath);
weakenedDb.exec(`
  DROP TABLE classroom_credential_audit;
  CREATE TABLE classroom_credential_audit (
    id TEXT PRIMARY KEY NOT NULL,
    actor_type TEXT NOT NULL CHECK (actor_type IN ('system','admin','teacher')),
    actor_id TEXT NOT NULL,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL CHECK (target_type IN ('admin','invitation','teacher','session','challenge')),
    target_id TEXT NOT NULL,
    outcome TEXT NOT NULL,
    occurred_at TEXT NOT NULL
  );
  CREATE INDEX idx_classroom_credential_audit_target
    ON classroom_credential_audit(target_type, target_id, occurred_at);
`);
weakenedDb.close();
const weakenedPort = await freePort();
const weakenedChild = spawn(process.execPath, ['server.js'], {
  cwd: root,
  env: { ...process.env, NODE_ENV: 'test', PORT: String(weakenedPort), ROBOTICS_DATA_DIR: schemaDir,
    ROBOTICS_DB_FILE: schemaDbPath, ROBOTICS_CLASSROOM_ADMIN_EMAIL: 'owner@example.test',
    ROBOTICS_CLASSROOM_ADMIN_CODE: '', ROBOTICS_TEACHER_INVITE_CODE: '' },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let weakenedError = '';
weakenedChild.stderr.on('data', chunk => { weakenedError += chunk; });
const weakenedExit = new Promise(resolve => weakenedChild.once('exit', code => resolve(code)));
const weakenedResult = await Promise.race([weakenedExit, new Promise(resolve => setTimeout(() => resolve('running'), 1500))]);
if (weakenedResult === 'running') weakenedChild.kill('SIGTERM');
assert.notEqual(weakenedResult, 'running', 'startup must reject weakened credential-audit allowed sets');
assert.match(weakenedError, /schema incompatible/i);
console.log('✓ startup rejects weakened credential-audit allowed sets');

const wrongTypeDb = new Database(schemaDbPath);
wrongTypeDb.exec(`
  DROP TABLE classroom_credential_audit;
  CREATE TABLE classroom_credential_audit (
    id TEXT PRIMARY KEY NOT NULL,
    actor_type TEXT NOT NULL CHECK (actor_type IN ('system','admin','teacher')),
    actor_id INTEGER NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('issuance','delivery','redeem','bootstrap','login','rotation','invitation_create','invitation_list','invitation_resend','invitation_revoke','invitation_redeem')),
    target_type TEXT NOT NULL CHECK (target_type IN ('admin','invitation','teacher','session','challenge')),
    target_id TEXT NOT NULL,
    outcome TEXT NOT NULL CHECK (outcome IN ('success','denied','invalid','throttled','replayed','exhausted','expired','failed','unknown')),
    occurred_at TEXT NOT NULL
  );
  CREATE INDEX idx_classroom_credential_audit_target
    ON classroom_credential_audit(target_type, target_id, occurred_at);
`);
wrongTypeDb.close();
const wrongTypePort = await freePort();
const wrongTypeChild = spawn(process.execPath, ['server.js'], {
  cwd: root,
  env: { ...process.env, NODE_ENV: 'test', PORT: String(wrongTypePort), ROBOTICS_DATA_DIR: schemaDir,
    ROBOTICS_DB_FILE: schemaDbPath, ROBOTICS_CLASSROOM_ADMIN_EMAIL: 'owner@example.test',
    ROBOTICS_CLASSROOM_ADMIN_CODE: '', ROBOTICS_TEACHER_INVITE_CODE: '' },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let wrongTypeError = '';
wrongTypeChild.stderr.on('data', chunk => { wrongTypeError += chunk; });
const wrongTypeExit = new Promise(resolve => wrongTypeChild.once('exit', code => resolve(code)));
const wrongTypeResult = await Promise.race([wrongTypeExit, new Promise(resolve => setTimeout(() => resolve('running'), 1500))]);
if (wrongTypeResult === 'running') wrongTypeChild.kill('SIGTERM');
assert.notEqual(wrongTypeResult, 'running', 'startup must reject noncanonical credential column affinity');
assert.match(wrongTypeError, /schema incompatible/i);
console.log('✓ startup rejects noncanonical credential column affinity');

rmSync(schemaDir, { recursive: true, force: true });
console.log('✓ fresh startup creates the v3 credential schema');

const sourceLimitDir = mkdtempSync(join(tmpdir(), 'credential-v3-source-limit-'));
const sourceLimitPort = await freePort();
const sourceLimitDbPath = join(sourceLimitDir, 'db.sqlite');
const sourceLimitChild = spawn(process.execPath, ['server.js'], {
  cwd: root,
  env: { ...process.env, NODE_ENV: 'test', PORT: String(sourceLimitPort), ROBOTICS_DATA_DIR: sourceLimitDir,
    ROBOTICS_DB_FILE: sourceLimitDbPath, ROBOTICS_CLASSROOM_ADMIN_EMAIL: 'owner@example.test' },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let sourceLimitError = '';
sourceLimitChild.stderr.on('data', chunk => { sourceLimitError += chunk; });
async function postFromSource(path, body, localAddress) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const request = httpRequest({ hostname: '127.0.0.1', port: sourceLimitPort, path, method: 'POST', localAddress,
      headers: { 'content-type': 'application/json', 'content-length': Buffer.byteLength(payload) } }, response => {
      response.resume(); response.once('end', () => resolve(response.statusCode));
    });
    request.once('error', reject); request.end(payload);
  });
}
try {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    if (sourceLimitChild.exitCode !== null) throw new Error(`source limiter server exited: ${sourceLimitError}`);
    try { const response = await fetch(`http://127.0.0.1:${sourceLimitPort}/api/classroom/admin-me`); if (response.ok) break; } catch {}
    await new Promise(resolve => setTimeout(resolve, 25));
  }
  for (let attempt = 0; attempt < 10; attempt += 1) {
    assert.equal(await postFromSource('/api/classroom/admin-access/request', { email: `unknown-${attempt}@example.test` }, '127.0.0.2'), 202);
  }
  assert.equal(await postFromSource('/api/classroom/admin-access/request', { email: 'owner@example.test' }, '127.0.0.2'), 429,
    'one source must be limited before administrator challenge issuance');
  const sourceLimitDb = new Database(sourceLimitDbPath, { readonly: true });
  assert.equal(sourceLimitDb.prepare('SELECT COUNT(*) AS n FROM classroom_admin_challenges').get().n, 0);
  assert.equal(sourceLimitDb.prepare("SELECT COUNT(*) n FROM classroom_credential_audit WHERE action='issuance' AND outcome='throttled'").get().n, 1);
  sourceLimitDb.close();
  console.log('✓ administrator access requests have a pre-issuance source limit');
  for (let attempt = 0; attempt < 10; attempt += 1) {
    assert.equal(await postFromSource('/api/classroom/admin-access/request', { email: 'owner@example.test' }, `127.0.0.${attempt + 3}`), 202);
  }
  assert.equal(await postFromSource('/api/classroom/admin-access/request', { email: 'owner@example.test' }, '127.0.0.13'), 429,
    'one administrator identity must be limited before another challenge is issued');
  const identityLimitDb = new Database(sourceLimitDbPath, { readonly: true });
  assert.equal(identityLimitDb.prepare('SELECT COUNT(*) AS n FROM classroom_admin_challenges').get().n, 10);
  identityLimitDb.close();
  console.log('✓ administrator access requests have a pre-issuance identity limit');
  for (let attempt = 0; attempt < 10; attempt += 1) {
    assert.equal(await postFromSource('/api/classroom/admin-access/redeem', {
      email: `missing-${attempt}@example.test`, code: `wrong-${attempt}`,
    }, '127.0.0.20'), 401);
  }
  assert.equal(await postFromSource('/api/classroom/admin-access/redeem', {
    email: 'owner@example.test', code: 'wrong-final',
  }, '127.0.0.20'), 429, 'one source must be limited before administrator credential hashing');
  console.log('✓ administrator access redemption has a pre-hash source limit');
  for (let attempt = 0; attempt < 10; attempt += 1) {
    assert.equal(await postFromSource('/api/classroom/admin-access/redeem', {
      email: 'owner@example.test', code: `wrong-identity-${attempt}`,
    }, `127.0.0.${attempt + 30}`), 401);
  }
  assert.equal(await postFromSource('/api/classroom/admin-access/redeem', {
    email: 'owner@example.test', code: 'wrong-identity-final',
  }, '127.0.0.40'), 429, 'one administrator identity must be limited before credential hashing');
  console.log('✓ administrator access redemption has a pre-hash identity limit');
  const exhaustedAuditDb = new Database(sourceLimitDbPath, { readonly: true });
  assert.equal(exhaustedAuditDb.prepare(`SELECT outcome FROM classroom_credential_audit
    WHERE action = 'redeem' AND outcome = 'exhausted' ORDER BY occurred_at DESC LIMIT 1`).get()?.outcome, 'exhausted');
  assert.ok(exhaustedAuditDb.prepare("SELECT COUNT(*) n FROM classroom_credential_audit WHERE action='redeem' AND outcome='throttled'").get().n >= 2);
  exhaustedAuditDb.close();
} finally {
  if (sourceLimitChild.exitCode === null) sourceLimitChild.kill('SIGTERM');
  await new Promise(resolve => sourceLimitChild.once('exit', resolve));
  rmSync(sourceLimitDir, { recursive: true, force: true });
}

const timingDir = mkdtempSync(join(tmpdir(), 'credential-v3-timing-'));
const timingPort = await freePort();
const timingMailer = join(timingDir, 'slow-mailer');
writeFileSync(timingMailer, '#!/bin/sh\nsleep 0.3\nexit 0\n', { mode: 0o700 });
chmodSync(timingMailer, 0o700);
const timingChild = spawn(process.execPath, ['server.js'], {
  cwd: root,
  env: { ...process.env, NODE_ENV: 'production', PORT: String(timingPort), ROBOTICS_DATA_DIR: timingDir,
    ROBOTICS_DB_FILE: join(timingDir, 'db.sqlite'), ROBOTICS_CLASSROOM_ADMIN_EMAIL: 'owner@example.test',
    ROBOTICS_CLASSROOM_ADMIN_CODE: '', ROBOTICS_TEACHER_INVITE_CODE: '', ROBOTICS_CREDENTIAL_MAILER: timingMailer },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let timingError = '';
timingChild.stderr.on('data', chunk => { timingError += chunk; });
try {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    if (timingChild.exitCode !== null) throw new Error(`timing server exited: ${timingError}`);
    try { const response = await fetch(`http://127.0.0.1:${timingPort}/api/classroom/admin-me`); if (response.ok) break; } catch {}
    await new Promise(resolve => setTimeout(resolve, 25));
  }
  const timedRequest = async email => {
    const started = performance.now();
    const response = await fetch(`http://127.0.0.1:${timingPort}/api/classroom/admin-access/request`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email }),
    });
    return { status: response.status, body: await response.text(), duration: performance.now() - started };
  };
  const unknownTiming = await timedRequest('unknown@example.test');
  const knownTiming = await timedRequest('owner@example.test');
  assert.deepEqual({ status: knownTiming.status, body: knownTiming.body }, { status: unknownTiming.status, body: unknownTiming.body });
  assert.ok(Math.abs(knownTiming.duration - unknownTiming.duration) < 150,
    `known/unknown response timing diverged across mail delay: ${knownTiming.duration}ms vs ${unknownTiming.duration}ms`);
  console.log('✓ administrator access requests resist identity enumeration across mail delay');
} finally {
  if (timingChild.exitCode === null) timingChild.kill('SIGTERM');
  await new Promise(resolve => timingChild.once('exit', resolve));
  rmSync(timingDir, { recursive: true, force: true });
}

const legacyColumnsDir = mkdtempSync(join(tmpdir(), 'credential-v3-legacy-columns-'));
const legacyColumnsDbPath = join(legacyColumnsDir, 'db.sqlite');
async function spawnCredentialServer(port, dbPath, dataDir = legacyColumnsDir) {
  const server = spawn(process.execPath, ['server.js'], {
    cwd: root,
    env: { ...process.env, NODE_ENV: 'test', PORT: String(port), ROBOTICS_DATA_DIR: dataDir,
      ROBOTICS_DB_FILE: dbPath, ROBOTICS_CLASSROOM_ADMIN_EMAIL: 'owner@example.test' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let error = '';
  server.stderr.on('data', chunk => { error += chunk; });
  for (let attempt = 0; attempt < 200; attempt += 1) {
    if (server.exitCode !== null) return { server, error: () => error, started: false };
    try { const response = await fetch(`http://127.0.0.1:${port}/api/classroom/admin-me`); if (response.ok) return { server, error: () => error, started: true }; } catch {}
    await new Promise(resolve => setTimeout(resolve, 25));
  }
  return { server, error: () => error, started: false };
}
try {
  const initial = await spawnCredentialServer(await freePort(), legacyColumnsDbPath);
  assert.equal(initial.started, true, initial.error());
  initial.server.kill('SIGTERM');
  await new Promise(resolve => initial.server.once('exit', resolve));
  const altered = new Database(legacyColumnsDbPath);
  altered.prepare('ALTER TABLE classroom_admin_sessions ADD COLUMN legacy_secret TEXT').run();
  altered.close();
  const restarted = await spawnCredentialServer(await freePort(), legacyColumnsDbPath);
  assert.equal(restarted.started, false, 'startup must reject unexpected legacy administrator-session columns');
  if (restarted.server.exitCode === null) restarted.server.kill('SIGTERM');
  await new Promise(resolve => restarted.server.exitCode === null ? restarted.server.once('exit', resolve) : resolve());
  assert.match(restarted.error(), /unexpected legacy columns|non-canonical columns/i);
  console.log('✓ startup rejects unexpected legacy administrator-session columns');
} finally {
  rmSync(legacyColumnsDir, { recursive: true, force: true });
}

const defaultSchemaDir = mkdtempSync(join(tmpdir(), 'credential-v3-default-schema-'));
const defaultSchemaDbPath = join(defaultSchemaDir, 'db.sqlite');
try {
  const initial = await spawnCredentialServer(await freePort(), defaultSchemaDbPath, defaultSchemaDir);
  assert.equal(initial.started, true, initial.error());
  initial.server.kill('SIGTERM');
  await new Promise(resolve => initial.server.once('exit', resolve));
  const altered = new Database(defaultSchemaDbPath);
  altered.exec(`
    DROP INDEX idx_classroom_admin_challenges_admin;
    DROP TABLE classroom_admin_challenges;
    CREATE TABLE classroom_admin_challenges (
      id TEXT PRIMARY KEY NOT NULL,
      admin_id TEXT NOT NULL REFERENCES classroom_admin_identity(id) ON DELETE RESTRICT,
      purpose TEXT NOT NULL CHECK (purpose IN ('access', 'rotation')),
      code_hash TEXT NOT NULL UNIQUE,
      credential_version INTEGER NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
      max_attempts INTEGER NOT NULL DEFAULT 4 CHECK (max_attempts BETWEEN 1 AND 10),
      expires_at TEXT NOT NULL,
      used_at TEXT,
      revoked_at TEXT,
      created_at TEXT NOT NULL
    );
    CREATE INDEX idx_classroom_admin_challenges_admin
      ON classroom_admin_challenges(admin_id, purpose, created_at);
  `);
  altered.close();
  const restarted = await spawnCredentialServer(await freePort(), defaultSchemaDbPath, defaultSchemaDir);
  assert.equal(restarted.started, false, 'startup must reject noncanonical credential defaults');
  if (restarted.server.exitCode === null) restarted.server.kill('SIGTERM');
  await new Promise(resolve => restarted.server.exitCode === null ? restarted.server.once('exit', resolve) : resolve());
  assert.match(restarted.error(), /schema incompatible/i);
  console.log('✓ startup rejects noncanonical credential defaults');
} finally {
  rmSync(defaultSchemaDir, { recursive: true, force: true });
}

const legacyRowsDir = mkdtempSync(join(tmpdir(), 'credential-v3-legacy-rows-'));
const legacyRowsDbPath = join(legacyRowsDir, 'db.sqlite');
try {
  const initial = await spawnCredentialServer(await freePort(), legacyRowsDbPath, legacyRowsDir);
  assert.equal(initial.started, true, initial.error());
  initial.server.kill('SIGTERM');
  await new Promise(resolve => initial.server.once('exit', resolve));
  const legacyDb = new Database(legacyRowsDbPath);
  legacyDb.exec(`
    DROP INDEX idx_classroom_admin_sessions_token;
    DROP INDEX idx_classroom_admin_sessions_identity;
    DROP TABLE classroom_admin_sessions;
    CREATE TABLE classroom_admin_sessions (
      id TEXT PRIMARY KEY,
      token_hash TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      last_seen_at TEXT,
      revoked_at TEXT
    );
  `);
  legacyDb.prepare(`INSERT INTO classroom_admin_sessions
    (id, token_hash, created_at, expires_at, last_seen_at, revoked_at) VALUES (?, ?, ?, ?, ?, ?)`)
    .run('legacy-session', 'legacy-token-hash', '2025-01-01T00:00:00.000Z', '2030-01-01T00:00:00.000Z',
      '2025-02-01T00:00:00.000Z', '2025-03-01T00:00:00.000Z');
  const legacyBytes = Buffer.from([0x00, 0xff, 0x41, 0x80]);
  legacyDb.prepare(`INSERT INTO classroom_admin_sessions
    (id, token_hash, created_at, expires_at, last_seen_at, revoked_at) VALUES (?, ?, ?, ?, ?, ?)`)
    .run('legacy-storage-session', legacyBytes, '2025-04-01T00:00:00.000Z', '2030-04-01T00:00:00.000Z', legacyBytes, null);
  const storageBefore = legacyDb.prepare(`SELECT typeof(token_hash) token_type, hex(token_hash) token_hex,
    typeof(last_seen_at) seen_type, hex(last_seen_at) seen_hex FROM classroom_admin_sessions WHERE id = ?`).get('legacy-storage-session');
  const identityBeforeMigration = legacyDb.prepare('SELECT id, credential_version FROM classroom_admin_identity').get();
  legacyDb.close();
  const migrated = await spawnCredentialServer(await freePort(), legacyRowsDbPath, legacyRowsDir);
  assert.equal(migrated.started, true, migrated.error());
  migrated.server.kill('SIGTERM');
  await new Promise(resolve => migrated.server.once('exit', resolve));
  const afterFirst = new Database(legacyRowsDbPath, { readonly: true });
  const migratedRow = afterFirst.prepare('SELECT * FROM classroom_admin_sessions WHERE id = ?').get('legacy-session');
  const storageAfterFirst = afterFirst.prepare(`SELECT typeof(token_hash) token_type, hex(token_hash) token_hex,
    typeof(last_seen_at) seen_type, hex(last_seen_at) seen_hex FROM classroom_admin_sessions WHERE id = ?`).get('legacy-storage-session');
  const migratedLegacyState = afterFirst.prepare('SELECT credential_version, revoked_at FROM classroom_admin_sessions WHERE id = ?').get('legacy-storage-session');
  assert.deepEqual(migratedLegacyState, { credential_version: 0, revoked_at: null },
    'legacy shared-secret sessions must preserve source columns but receive a permanently non-current version');
  assert.equal(afterFirst.prepare(`SELECT COUNT(*) AS n FROM classroom_admin_sessions s
    JOIN classroom_admin_identity a ON a.id = s.admin_id AND a.credential_version = s.credential_version
    WHERE s.id = ? AND s.revoked_at IS NULL`).get('legacy-storage-session').n, 0,
  'an unrevoked legacy shared-secret session must not authorize after migration');
  afterFirst.close();
  assert.deepEqual(storageAfterFirst, storageBefore, 'migration must preserve SQLite storage classes and row bytes');
  assert.deepEqual(migratedRow, {
    id: 'legacy-session', admin_id: identityBeforeMigration.id, token_hash: 'legacy-token-hash',
    credential_version: 0, created_at: '2025-01-01T00:00:00.000Z',
    expires_at: '2030-01-01T00:00:00.000Z', last_seen_at: '2025-02-01T00:00:00.000Z',
    revoked_at: '2025-03-01T00:00:00.000Z',
  });
  const restarted = await spawnCredentialServer(await freePort(), legacyRowsDbPath, legacyRowsDir);
  assert.equal(restarted.started, true, restarted.error());
  restarted.server.kill('SIGTERM');
  await new Promise(resolve => restarted.server.once('exit', resolve));
  const afterSecond = new Database(legacyRowsDbPath, { readonly: true });
  assert.deepEqual(afterSecond.prepare('SELECT * FROM classroom_admin_sessions WHERE id = ?').get('legacy-session'), migratedRow);
  assert.equal(afterSecond.prepare('SELECT COUNT(*) AS n FROM classroom_admin_sessions').get().n, 2);
  assert.deepEqual(afterSecond.prepare(`SELECT typeof(token_hash) token_type, hex(token_hash) token_hex,
    typeof(last_seen_at) seen_type, hex(last_seen_at) seen_hex FROM classroom_admin_sessions WHERE id = ?`).get('legacy-storage-session'), storageBefore);
  afterSecond.close();
  console.log('✓ canonical legacy administrator sessions survive migration and restart byte-for-byte');
} finally {
  rmSync(legacyRowsDir, { recursive: true, force: true });
}
