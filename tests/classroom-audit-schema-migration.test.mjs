import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:net';
import { spawn } from 'node:child_process';
import Database from 'better-sqlite3';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const temp = mkdtempSync(join(tmpdir(), 'audit-schema-'));
const freePort = () => new Promise((resolve, reject) => {
  const probe = createServer(); probe.once('error', reject);
  probe.listen(0, '127.0.0.1', () => { const { port } = probe.address(); probe.close(() => resolve(port)); });
});
const envFor = async dbFile => ({ ...process.env, PORT: String(await freePort()), ROBOTICS_DB_FILE: dbFile, NODE_ENV: 'test' });
async function start(dbFile, extraEnv = {}) {
  const env = { ...(await envFor(dbFile)), ...extraEnv };
  const child = spawn(process.execPath, ['server.js'], { cwd: root, env, stdio: ['ignore', 'pipe', 'pipe'] });
  let stderr = ''; child.stderr.on('data', chunk => { stderr += chunk; });
  const base = `http://127.0.0.1:${env.PORT}`;
  for (let i = 0; i < 100; i += 1) {
    if (child.exitCode !== null) return { child, stderr: () => stderr, started: false };
    try {
      if ((await fetch(`${base}/index.html`)).ok) {
        await fetch(`${base}/api/classroom/student-login`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ classCode: 'NONE', personalCode: 'NONE' }),
        });
        if (child.exitCode === null) return { child, stderr: () => stderr, started: true };
      }
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 30));
  }
  return { child, stderr: () => stderr, started: false };
}
async function stop(child) {
  if (child.exitCode === null && child.signalCode === null) {
    child.kill('SIGTERM'); await new Promise(resolve => child.once('exit', resolve));
  }
}
const legacySql = `CREATE TABLE classroom_management_audit (
  id TEXT PRIMARY KEY,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('admin', 'teacher')),
  actor_id TEXT NOT NULL, action TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('teacher', 'student')),
  target_id TEXT NOT NULL, occurred_at TEXT NOT NULL,
  outcome TEXT NOT NULL CHECK (outcome IN ('success', 'denied', 'not_found', 'invalid'))
)`;

try {
  const legacyDbFile = join(temp, 'legacy.sqlite');
  let db = new Database(legacyDbFile);
  db.exec(legacySql);
  db.prepare("INSERT INTO classroom_management_audit VALUES ('legacy-1','admin','a','teacher.create','teacher','t','2026-01-01','success')").run();
  db.close();
  let server = await start(legacyDbFile);
  assert.equal(server.started, true, server.stderr()); await stop(server.child);
  db = new Database(legacyDbFile);
  assert.equal(db.prepare("SELECT action FROM classroom_management_audit WHERE id='legacy-1'").get().action, 'teacher.create');
  const idColumn = db.prepare("PRAGMA table_info('classroom_management_audit')").all().find(row => row.name === 'id');
  assert.equal(idColumn.pk, 1); assert.equal(idColumn.notnull, 1); db.close();
  server = await start(legacyDbFile);
  assert.equal(server.started, true, server.stderr()); await stop(server.child);
  db = new Database(legacyDbFile);
  assert.equal(db.prepare('SELECT COUNT(*) count FROM classroom_management_audit').get().count, 1); db.close();

  const incompatibleFile = join(temp, 'incompatible.sqlite');
  db = new Database(incompatibleFile);
  db.exec(`CREATE TABLE classroom_management_audit (
    id TEXT PRIMARY KEY NOT NULL, actor_type TEXT NOT NULL CHECK(actor_type IN ('admin','teacher','root')),
    actor_id TEXT NOT NULL, action TEXT NOT NULL, target_type TEXT NOT NULL CHECK(target_type IN ('teacher','student')),
    target_id TEXT NOT NULL, occurred_at TEXT NOT NULL, outcome TEXT NOT NULL CHECK(outcome IN ('success','denied','not_found','invalid'))
  )`); db.close();
  server = await start(incompatibleFile);
  assert.equal(server.started, false);
  if (server.child.exitCode === null) await new Promise(resolve => server.child.once('exit', resolve));
  assert.match(server.stderr(), /schema incompatible/);

  const wrongAffinityFile = join(temp, 'wrong-affinity.sqlite');
  db = new Database(wrongAffinityFile);
  db.exec(`CREATE TABLE classroom_management_audit (
    id TEXT PRIMARY KEY NOT NULL, actor_type TEXT NOT NULL CHECK(actor_type IN ('admin','teacher')),
    actor_id INTEGER NOT NULL, action TEXT NOT NULL, target_type TEXT NOT NULL CHECK(target_type IN ('teacher','student')),
    target_id TEXT NOT NULL, occurred_at TEXT NOT NULL, outcome TEXT NOT NULL CHECK(outcome IN ('success','denied','not_found','invalid'))
  )`); db.close();
  server = await start(wrongAffinityFile);
  assert.equal(server.started, false, 'audit startup must reject non-canonical column affinities');
  if (server.child.exitCode === null) await new Promise(resolve => server.child.once('exit', resolve));
  assert.match(server.stderr(), /schema incompatible/);

  const injectedFile = join(temp, 'alter.sqlite');
  db = new Database(injectedFile);
  db.exec(`CREATE TABLE classroom_teachers (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
    password_salt TEXT NOT NULL, password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL, updated_at TEXT NOT NULL
  )`); db.close();
  const hook = join(temp, 'inject-alter.cjs');
  writeFileSync(hook, `const Database=require(${JSON.stringify(join(root, 'node_modules/better-sqlite3'))});\nconst original=Database.prototype.prepare;\nDatabase.prototype.prepare=function(sql,...args){if(String(sql).includes('ALTER TABLE classroom_teachers ADD COLUMN archived_at')){const e=new Error('injected non-duplicate ALTER failure');e.code='SQLITE_IOERR';throw e;}return original.call(this,sql,...args);};\n`);
  server = await start(injectedFile, { NODE_OPTIONS: `--require=${hook}` });
  assert.equal(server.started, false);
  if (server.child.exitCode === null) await new Promise(resolve => server.child.once('exit', resolve));
  assert.match(server.stderr(), /injected non-duplicate ALTER failure/);

  console.log('✓ audit legacy migration is lossless/idempotent and incompatible or failed migrations stop startup');
} finally {
  rmSync(temp, { recursive: true, force: true });
}
