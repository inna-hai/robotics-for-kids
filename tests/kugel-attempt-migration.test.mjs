import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { copyFileSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const serverEntry = resolve(process.env.KUGEL_MIGRATION_SERVER || join(root, 'server.js'));
const tempDir = mkdtempSync(join(tmpdir(), 'kugel-migration-test-'));
const dbFile = join(tempDir, 'classroom.sqlite');
const failedDbFile = join(tempDir, 'failed-classroom.sqlite');
const failureHook = join(tempDir, 'fail-metrics-migration.cjs');
const legacyRun = {
  studentId: 'legacy-student',
  classroomId: 'legacy-classroom',
  startedAt: '2026-09-15T10:00:00.000Z',
  resetAt: '2026-09-15T09:59:00.000Z',
  finishedAt: '2026-09-15T10:05:00.000Z',
  updatedAt: '2026-09-15T10:05:01.000Z',
};

function reservePort() {
  return new Promise((resolvePort, reject) => {
    const probe = createServer();
    probe.once('error', reject);
    probe.listen(0, '127.0.0.1', () => {
      const port = probe.address().port;
      probe.close(() => resolvePort(port));
    });
  });
}

async function waitForServer(baseUrl, child) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (child.exitCode !== null) throw new Error(`migration server exited with ${child.exitCode}`);
    try {
      const response = await fetch(`${baseUrl}/api/kugel/session`, {
        headers: { Cookie: `haiTechClassroomToken=${randomUUID()}` },
      });
      if (response.status === 401) return;
    } catch {}
    await new Promise(resolveWait => setTimeout(resolveWait, 50));
  }
  throw new Error('migration server did not start');
}

async function startCandidate(databaseFile = dbFile, extraEnv = {}) {
  const port = await reservePort();
  const child = spawn(process.execPath, [serverEntry], {
    cwd: root,
    env: {
      ...process.env,
      PORT: String(port),
      ROBOTICS_DATA_DIR: tempDir,
      ROBOTICS_DB_FILE: databaseFile,
      NODE_ENV: 'test',
      ...extraEnv,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  child.stdout.on('data', chunk => { output += chunk.toString(); });
  child.stderr.on('data', chunk => { output += chunk.toString(); });
  try {
    await waitForServer(`http://127.0.0.1:${port}`, child);
  } catch (error) {
    child.kill('SIGTERM');
    throw new Error(`${error.message}\n${output}`);
  }
  return { child, output: () => output };
}

async function stopCandidate(candidate) {
  if (candidate.child.exitCode !== null || candidate.child.signalCode !== null) return;
  await new Promise(resolveExit => {
    candidate.child.once('exit', resolveExit);
    candidate.child.kill('SIGTERM');
  });
}

function assertMigratedRun() {
  const db = new Database(dbFile, { readonly: true });
  const columns = new Set(db.prepare("PRAGMA table_info('kugel_student_runs')").all().map(column => column.name));
  const row = db.prepare('SELECT * FROM kugel_student_runs WHERE student_id = ?').get(legacyRun.studentId);
  db.close();
  assert.deepEqual(
    ['attempt_count', 'best_time_ms', 'best_finished_at', 'last_duration_ms'].filter(column => !columns.has(column)),
    [],
    'candidate startup must add every attempt-metrics column to a legacy run table',
  );
  assert.deepEqual(row, {
    student_id: legacyRun.studentId,
    classroom_id: legacyRun.classroomId,
    lesson_id: 0,
    started_at: legacyRun.startedAt,
    reset_at: legacyRun.resetAt,
    finished_at: legacyRun.finishedAt,
    updated_at: legacyRun.updatedAt,
    attempt_count: 0,
    best_time_ms: null,
    best_finished_at: null,
    last_duration_ms: null,
  }, 'migration must preserve the populated legacy run and initialize only new metrics');
}

const fixtureDb = new Database(dbFile);
fixtureDb.exec(`
  CREATE TABLE classrooms (
    id TEXT PRIMARY KEY,
    teacher_id TEXT NOT NULL,
    name TEXT NOT NULL,
    join_code TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE classroom_students (
    id TEXT PRIMARY KEY,
    classroom_id TEXT NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    login_salt TEXT NOT NULL,
    login_hash TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE kugel_student_runs (
    student_id TEXT PRIMARY KEY REFERENCES classroom_students(id) ON DELETE CASCADE,
    classroom_id TEXT NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
    lesson_id INTEGER NOT NULL DEFAULT 0 CHECK (lesson_id BETWEEN 0 AND 16),
    started_at TEXT,
    reset_at TEXT,
    finished_at TEXT,
    updated_at TEXT NOT NULL
  );
`);
fixtureDb.prepare(`
  INSERT INTO classrooms (id, teacher_id, name, join_code, created_at, updated_at)
  VALUES (?, 'legacy-teacher', 'Legacy class', 'LEGACY', ?, ?)
`).run(legacyRun.classroomId, legacyRun.updatedAt, legacyRun.updatedAt);
fixtureDb.prepare(`
  INSERT INTO classroom_students (id, classroom_id, name, login_salt, login_hash, created_at, updated_at)
  VALUES (?, ?, 'Legacy student', 'salt', 'hash', ?, ?)
`).run(legacyRun.studentId, legacyRun.classroomId, legacyRun.updatedAt, legacyRun.updatedAt);
fixtureDb.prepare(`
  INSERT INTO kugel_student_runs (
    student_id, classroom_id, lesson_id, started_at, reset_at, finished_at, updated_at
  ) VALUES (?, ?, 0, ?, ?, ?, ?)
`).run(
  legacyRun.studentId,
  legacyRun.classroomId,
  legacyRun.startedAt,
  legacyRun.resetAt,
  legacyRun.finishedAt,
  legacyRun.updatedAt,
);
fixtureDb.close();
copyFileSync(dbFile, failedDbFile);
writeFileSync(failureHook, `
const Database = require(${JSON.stringify(join(root, 'node_modules', 'better-sqlite3'))});
const originalPrepare = Database.prototype.prepare;
Database.prototype.prepare = function prepareWithInjectedMigrationFailure(source, ...args) {
  if (String(source).includes('ALTER TABLE kugel_student_runs ADD COLUMN best_time_ms INTEGER')) {
    const error = new Error('injected non-duplicate metrics migration failure');
    error.code = 'SQLITE_ERROR';
    throw error;
  }
  return originalPrepare.call(this, source, ...args);
};
`);

let candidate;
try {
  try {
    candidate = await startCandidate(failedDbFile, {
      NODE_OPTIONS: `${process.env.NODE_OPTIONS || ''} --require=${failureHook}`.trim(),
    });
    assert.fail('candidate startup must fail when a metrics ALTER fails for a non-duplicate reason');
  } catch (error) {
    assert.match(error.message, /injected non-duplicate metrics migration failure/);
  } finally {
    if (candidate) await stopCandidate(candidate);
    candidate = undefined;
  }

  candidate = await startCandidate();
  await stopCandidate(candidate);
  assertMigratedRun();

  candidate = await startCandidate();
  await stopCandidate(candidate);
  assertMigratedRun();

  console.log('✓ lesson-zero metrics migrate populated legacy runs idempotently');
} finally {
  if (candidate) await stopCandidate(candidate);
  rmSync(tempDir, { recursive: true, force: true });
}
