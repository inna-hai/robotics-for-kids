import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:net';
import { spawn } from 'node:child_process';
import Database from 'better-sqlite3';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const freePort = () => new Promise((resolve, reject) => {
  const socket = createServer(); socket.once('error', reject);
  socket.listen(0, '127.0.0.1', () => { const { port } = socket.address(); socket.close(() => resolve(port)); });
});
async function launch(dbPath) {
  const port = await freePort();
  const child = spawn(process.execPath, ['server.js'], { cwd: root, env: { ...process.env, NODE_ENV: 'test', PORT: String(port),
    ROBOTICS_DB_FILE: dbPath, ROBOTICS_DATA_DIR: dirname(dbPath), ROBOTICS_CLASSROOM_ADMIN_EMAIL: 'owner@example.test' },
  stdio: ['ignore', 'pipe', 'pipe'] });
  let error = ''; child.stderr.on('data', chunk => { error += chunk; });
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (child.exitCode !== null) return { child, started: false, error };
    try { if ((await fetch(`http://127.0.0.1:${port}/api/classroom/admin-me`)).ok) return { child, started: true, error }; } catch {}
    await new Promise(resolve => setTimeout(resolve, 25));
  }
  return { child, started: false, error };
}
async function stop(child) {
  if (child.exitCode === null) { child.kill('SIGTERM'); await new Promise(resolve => child.once('exit', resolve)); }
}

const dir = mkdtempSync(join(tmpdir(), 'credential-adversarial-'));
try {
  const canonicalPath = join(dir, 'canonical.sqlite');
  const initial = await launch(canonicalPath); assert.equal(initial.started, true, initial.error); await stop(initial.child);
  const canonical = new Database(canonicalPath);
  canonical.prepare('CREATE INDEX unexpected_credential_index ON classroom_admin_challenges(expires_at)').run();
  canonical.close();
  const indexed = await launch(canonicalPath);
  assert.equal(indexed.started, false, 'unexpected credential indexes must stop startup');
  await stop(indexed.child);
  assert.match(indexed.error, /unexpected named index|schema incompatible/i);
  console.log('✓ startup rejects unexpected credential indexes');

  const legacyPath = join(dir, 'legacy.sqlite');
  const legacy = new Database(legacyPath);
  legacy.exec(`CREATE TABLE classroom_admin_sessions (
    id TEXT PRIMARY KEY, token_hash BLOB NOT NULL UNIQUE, created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL, last_seen_at TEXT, revoked_at TEXT
  );`);
  legacy.close();
  const malformedLegacy = await launch(legacyPath);
  assert.equal(malformedLegacy.started, false, 'malformed legacy session source must fail before DDL');
  await stop(malformedLegacy.child);
  const legacyAfter = new Database(legacyPath, { readonly: true });
  assert.equal(legacyAfter.prepare("SELECT COUNT(*) n FROM sqlite_master WHERE type='table'").get().n, 1,
    'failed legacy preflight must not create any schema');
  legacyAfter.close();
  console.log('✓ legacy administrator-session affinity is rejected before any DDL');

  const invitationPath = join(dir, 'invitation.sqlite');
  const invitation = new Database(invitationPath);
  invitation.exec(`
    CREATE TABLE classroom_teacher_invitations (
      id TEXT PRIMARY KEY NOT NULL, email TEXT NOT NULL, name TEXT NOT NULL,
      code_hash TEXT NOT NULL UNIQUE, attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
      max_attempts INTEGER NOT NULL DEFAULT 5 CHECK (max_attempts BETWEEN 1 AND 10),
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sent','failed','unknown','redeemed','revoked','expired','exhausted')),
      delivery_status TEXT NOT NULL DEFAULT 'pending' CHECK (delivery_status IN ('pending','sent','failed','unknown')),
      expires_at TEXT NOT NULL CHECK (length(expires_at) > 0),
      created_by TEXT NOT NULL REFERENCES classroom_admin_identity(id) ON DELETE RESTRICT,
      teacher_id TEXT REFERENCES classroom_teachers(id) ON DELETE RESTRICT,
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL, redeemed_at TEXT, revoked_at TEXT
    );
    CREATE INDEX idx_classroom_teacher_invitations_email ON classroom_teacher_invitations(email, created_at);
    CREATE INDEX idx_classroom_teacher_invitations_status ON classroom_teacher_invitations(status, expires_at);
  `);
  invitation.close();
  const malformedInvitation = await launch(invitationPath);
  assert.equal(malformedInvitation.started, false, 'extra invitation CHECK must fail before delivery_generation migration');
  await stop(malformedInvitation.child);
  const invitationAfter = new Database(invitationPath, { readonly: true });
  assert.equal(invitationAfter.prepare("SELECT COUNT(*) n FROM pragma_table_info('classroom_teacher_invitations') WHERE name='delivery_generation'").get().n, 0);
  assert.equal(invitationAfter.prepare("SELECT COUNT(*) n FROM sqlite_master WHERE type='table' AND name='summer_users'").get().n, 0);
  invitationAfter.close();
  console.log('✓ invitation migration rejects incompatible CHECKs before ALTER or unrelated DDL');

  const rollbackPath = join(dir, 'rollback.sqlite');
  const rollback = new Database(rollbackPath);
  rollback.exec(`
    CREATE TABLE classroom_teacher_invitations (
      id TEXT PRIMARY KEY NOT NULL, email TEXT NOT NULL, name TEXT NOT NULL,
      code_hash TEXT NOT NULL UNIQUE, attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
      max_attempts INTEGER NOT NULL DEFAULT 5 CHECK (max_attempts BETWEEN 1 AND 10),
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sent','failed','unknown','redeemed','revoked','expired','exhausted')),
      delivery_status TEXT NOT NULL DEFAULT 'pending' CHECK (delivery_status IN ('pending','sent','failed','unknown')),
      expires_at TEXT NOT NULL, created_by TEXT NOT NULL REFERENCES classroom_admin_identity(id) ON DELETE RESTRICT,
      teacher_id TEXT REFERENCES classroom_teachers(id) ON DELETE RESTRICT,
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL, redeemed_at TEXT, revoked_at TEXT
    );
    CREATE INDEX idx_classroom_teacher_invitations_email ON classroom_teacher_invitations(email, created_at);
    CREATE INDEX idx_classroom_teacher_invitations_status ON classroom_teacher_invitations(status, expires_at);
    CREATE TABLE classroom_management_audit (broken TEXT);
    INSERT INTO classroom_management_audit VALUES (X'00FF4180');
  `);
  const beforeSchema = rollback.prepare("SELECT type,name,tbl_name,sql FROM sqlite_master ORDER BY type,name").all();
  const beforeRows = rollback.prepare("SELECT typeof(broken) kind, hex(broken) bytes FROM classroom_management_audit").all();
  rollback.close();
  const rolledBack = await launch(rollbackPath);
  assert.equal(rolledBack.started, false, 'a later schema failure must roll back the valid invitation migration');
  await stop(rolledBack.child);
  const rollbackAfter = new Database(rollbackPath, { readonly: true });
  assert.deepEqual(rollbackAfter.prepare("SELECT type,name,tbl_name,sql FROM sqlite_master ORDER BY type,name").all(), beforeSchema,
    'failed startup must preserve schema byte-for-byte');
  assert.deepEqual(rollbackAfter.prepare("SELECT typeof(broken) kind, hex(broken) bytes FROM classroom_management_audit").all(), beforeRows,
    'failed startup must preserve row storage class and bytes');
  assert.equal(rollbackAfter.prepare("SELECT COUNT(*) n FROM pragma_table_info('classroom_teacher_invitations') WHERE name='delivery_generation'").get().n, 0);
  rollbackAfter.close();
  console.log('✓ credential creation and valid legacy migration roll back byte-for-byte after a later startup failure');
} finally {
  rmSync(dir, { recursive: true, force: true });
}
