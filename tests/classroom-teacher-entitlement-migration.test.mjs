import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:net';
import { spawn } from 'node:child_process';
import Database from 'better-sqlite3';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const tempDir = mkdtempSync(join(tmpdir(), 'teacher-entitlement-migration-'));
const dbFile = join(tempDir, 'legacy.sqlite');

function freePort() {
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.once('error', reject);
    probe.listen(0, '127.0.0.1', () => {
      const { port } = probe.address();
      probe.close(() => resolve(port));
    });
  });
}

async function waitForServer(baseUrl) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/index.html`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error('migration test server did not start');
}

const fixture = new Database(dbFile);
fixture.exec(`
  PRAGMA foreign_keys = ON;
  CREATE TABLE classroom_teachers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_salt TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE classrooms (
    id TEXT PRIMARY KEY,
    teacher_id TEXT NOT NULL REFERENCES classroom_teachers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    join_code TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE classroom_courses (
    classroom_id TEXT NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    PRIMARY KEY (classroom_id, course_id)
  );
`);
const now = new Date().toISOString();
const insertTeacher = fixture.prepare('INSERT INTO classroom_teachers VALUES (?, ?, ?, ?, ?, ?, ?)');
insertTeacher.run('teacher-selected', 'מורה עם בחירה', 'selected@example.test', 'salt', 'hash', now, now);
insertTeacher.run('teacher-old', 'מורה ישנה', 'old@example.test', 'salt', 'hash', now, now);
insertTeacher.run('teacher-empty', 'מורה ללא כיתה', 'empty@example.test', 'salt', 'hash', now, now);
const insertClass = fixture.prepare('INSERT INTO classrooms VALUES (?, ?, ?, ?, ?, ?)');
insertClass.run('class-selected', 'teacher-selected', 'כיתה נבחרת', 'SEL123', now, now);
insertClass.run('class-old', 'teacher-old', 'כיתה ישנה', 'OLD123', now, now);
fixture.prepare('INSERT INTO classroom_courses VALUES (?, ?, ?)').run('class-selected', 'python-turtle', now);
fixture.close();

const port = await freePort();
const baseUrl = `http://127.0.0.1:${port}`;
const child = spawn(process.execPath, ['server.js'], {
  cwd: root,
  env: {
    ...process.env,
    PORT: String(port),
    ROBOTICS_DB_FILE: dbFile,
    ROBOTICS_SUBSCRIPTION_GATE: '1',
    ROBOTICS_TEACHER_INVITE_CODE: 'migration-invite',
    ROBOTICS_CLASSROOM_ADMIN_CODE: 'migration-admin',
    NODE_ENV: 'test',
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});

try {
  await waitForServer(baseUrl);
  const initialize = await fetch(`${baseUrl}/api/classroom/admin-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: 'migration-admin' }),
  });
  assert.equal(initialize.status, 200);
  const migrated = new Database(dbFile, { readonly: true });
  const coursesFor = (teacherId) => migrated.prepare('SELECT course_id FROM teacher_courses WHERE teacher_id = ? ORDER BY course_id')
    .all(teacherId).map((row) => row.course_id);
  assert.deepEqual(coursesFor('teacher-selected'), ['python-turtle']);
  assert.deepEqual(coursesFor('teacher-old'), ['craftom-agent', 'minecraft', 'python-turtle', 'sensi-city', 'sisi', 'webcode']);
  assert.deepEqual(coursesFor('teacher-empty'), []);
  migrated.close();
  console.log('✓ legacy teachers inherit exactly their existing classroom course access');
} finally {
  if (child.exitCode === null && child.signalCode === null) {
    child.kill('SIGTERM');
    await new Promise((resolve) => child.once('exit', resolve));
  }
  rmSync(tempDir, { recursive: true, force: true });
}
