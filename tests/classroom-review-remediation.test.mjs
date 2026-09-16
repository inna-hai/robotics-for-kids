import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:net';
import { spawn } from 'node:child_process';
import { createHash, randomUUID, scryptSync } from 'node:crypto';
import Database from 'better-sqlite3';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = mkdtempSync(join(tmpdir(), 'classroom-review-remediation-'));
const dbPath = join(dataDir, 'db.sqlite');
const freePort = () => new Promise((resolve, reject) => {
  const socket = createServer();
  socket.once('error', reject);
  socket.listen(0, '127.0.0.1', () => {
    const { port } = socket.address();
    socket.close(() => resolve(port));
  });
});

async function startServer() {
  const port = await freePort();
  const base = `http://127.0.0.1:${port}`;
  const child = spawn(process.execPath, ['server.js'], {
    cwd: root,
    env: { ...process.env, NODE_ENV: 'test', PORT: String(port), ROBOTICS_DATA_DIR: dataDir,
      ROBOTICS_DB_FILE: dbPath, ROBOTICS_CLASSROOM_ADMIN_EMAIL: 'owner@example.test' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let stderr = '';
  child.stderr.on('data', chunk => { stderr += chunk; });
  for (let attempt = 0; attempt < 200; attempt += 1) {
    if (child.exitCode !== null) throw new Error(`server exited: ${stderr}`);
    try { if ((await fetch(`${base}/api/classroom/admin-me`)).ok) return { child, base }; } catch {}
    await new Promise(resolve => setTimeout(resolve, 25));
  }
  throw new Error(`server not ready: ${stderr}`);
}
async function stopServer(child) {
  if (child.exitCode === null) child.kill('SIGTERM');
  await new Promise(resolve => child.exitCode === null ? child.once('exit', resolve) : resolve());
}
async function post(base, path, body, cookie = '') {
  return fetch(`${base}${path}`, { method: 'POST', headers: { 'content-type': 'application/json', ...(cookie ? { cookie } : {}) }, body: JSON.stringify(body) });
}

try {
  let server = await startServer();
  const access = await post(server.base, '/api/classroom/admin-access/request', { email: 'owner@example.test' }).then(r => r.json());
  const redeemed = await post(server.base, '/api/classroom/admin-access/redeem', { email: 'owner@example.test', code: access.testCode });
  const adminCookie = (redeemed.headers.get('set-cookie') || '').split(';')[0];
  const createdResponse = await post(server.base, '/api/classroom/admin/invitations', { name: 'Durable Attempts', email: '  DURABLE@Example.Test  ' }, adminCookie);
  assert.equal(createdResponse.status, 201);
  const created = await createdResponse.json();
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    const wrong = await post(server.base, '/api/classroom/teacher-invitations/redeem', {
      email: ' durable@example.test ', code: `wrong-${attempt}`,
    });
    assert.equal(wrong.status, 401);
    const db = new Database(dbPath, { readonly: true });
    const invitation = db.prepare('SELECT attempts, status FROM classroom_teacher_invitations WHERE id = ?').get(created.invitation.id);
    assert.deepEqual(invitation, { attempts: attempt, status: 'sent' });
    assert.equal(db.prepare(`SELECT COUNT(*) n FROM classroom_credential_audit
      WHERE action='invitation_redeem' AND target_id=? AND outcome='invalid'`).get(created.invitation.id).n, attempt);
    db.close();
  }
  await stopServer(server.child);
  server = await startServer();
  const exhausted = await post(server.base, '/api/classroom/teacher-invitations/redeem', {
    email: 'DURABLE@example.test', code: 'wrong-after-restart',
  });
  assert.equal(exhausted.status, 401);
  const db = new Database(dbPath, { readonly: true });
  assert.deepEqual(db.prepare('SELECT attempts, status FROM classroom_teacher_invitations WHERE id = ?').get(created.invitation.id),
    { attempts: 5, status: 'exhausted' });
  assert.equal(db.prepare(`SELECT outcome FROM classroom_credential_audit WHERE action='invitation_redeem'
    AND target_id=? ORDER BY rowid DESC LIMIT 1`).get(created.invitation.id).outcome, 'exhausted');
  db.close();

  const logout = await post(server.base, '/api/classroom/admin-logout', {}, adminCookie);
  assert.equal(logout.status, 200);
  const logoutDb = new Database(dbPath, { readonly: true });
  assert.equal(logoutDb.prepare(`SELECT outcome FROM classroom_credential_audit
    WHERE action='logout' AND target_type='session' ORDER BY rowid DESC LIMIT 1`).get()?.outcome, 'success');
  logoutDb.close();

  const setup = new Database(dbPath);
  const now = new Date().toISOString();
  const teacherId = randomUUID();
  const classroomId = randomUUID();
  const studentId = randomUUID();
  const salt = '1234567890abcdef1234567890abcdef';
  setup.prepare(`INSERT INTO classroom_teachers
    (id,name,email,password_salt,password_hash,created_at,updated_at) VALUES (?,?,?,?,?,?,?)`)
    .run(teacherId, 'Student Owner', 'student-owner@example.test', salt, scryptSync('unused', salt, 64).toString('hex'), now, now);
  setup.prepare(`INSERT INTO classrooms (id,teacher_id,name,join_code,created_at,updated_at) VALUES (?,?,?,?,?,?)`)
    .run(classroomId, teacherId, 'Limiter Class', 'NORM42', now, now);
  setup.prepare(`INSERT INTO classroom_students
    (id,classroom_id,name,login_salt,login_hash,created_at,updated_at) VALUES (?,?,?,?,?,?,?)`)
    .run(studentId, classroomId, 'Active Student', salt, scryptSync('RIGHT1', salt, 64).toString('hex'), now, now);
  const teacherToken = 'teacher-audit-token';
  setup.prepare(`INSERT INTO classroom_teacher_sessions
    (id,teacher_id,token_hash,created_at,expires_at) VALUES (?,?,?,?,?)`)
    .run(randomUUID(), teacherId, createHash('sha256').update(teacherToken).digest('hex'), now, '2099-01-01T00:00:00.000Z');
  setup.prepare('INSERT INTO teacher_courses (teacher_id,course_id,created_at) VALUES (?,?,?)').run(teacherId, 'sisi', now);
  setup.prepare('INSERT INTO classroom_courses (classroom_id,course_id,created_at) VALUES (?,?,?)').run(classroomId, 'sisi', now);
  setup.close();
  const unknownClass = await post(server.base, '/api/classroom/student-login', { classCode: 'missing', personalCode: 'wrong' });
  assert.equal(unknownClass.status, 401);
  assert.equal((await unknownClass.json()).testWorkFactor, 1,
    'unknown classes must perform one canonical dummy scrypt');
  const activeStudent = await post(server.base, '/api/classroom/student-login', { classCode: ' norm42 ', personalCode: 'wrong' });
  assert.equal(activeStudent.status, 401);
  assert.equal((await activeStudent.json()).testWorkFactor, 1,
    'an existing active student failure must perform the same deterministic work');

  const teacherCookie = `haiTechClassroomToken=${teacherToken}`;
  assert.equal((await post(server.base, `/api/classroom/classes/${classroomId}/students`, { name: '' }, teacherCookie)).status, 400);
  const createdClassResponse = await post(server.base, '/api/classroom/classes', { name: 'Audited Class', courses: ['sisi'] }, teacherCookie);
  assert.equal(createdClassResponse.status, 201);
  const createdClass = await createdClassResponse.json();
  assert.equal((await post(server.base, `/api/classroom/classes/${classroomId}/courses`, { courses: ['sisi'] }, teacherCookie)).status, 200);
  const studentLogin = await post(server.base, '/api/classroom/student-login', { classCode: 'NORM42', personalCode: 'RIGHT1' });
  assert.equal(studentLogin.status, 200);
  const studentCookie = (studentLogin.headers.get('set-cookie') || '').split(';')[0];
  assert.equal((await post(server.base, '/api/classroom/progress', {
    courseId: 'sisi', lessonId: '1', activityId: 'audit-progress', status: 'completed', score: 100,
  }, studentCookie)).status, 200);
  const newAccess = await post(server.base, '/api/classroom/admin-access/request', { email: 'owner@example.test' }).then(r => r.json());
  const newAdmin = await post(server.base, '/api/classroom/admin-access/redeem', { email: 'owner@example.test', code: newAccess.testCode });
  const newAdminCookie = (newAdmin.headers.get('set-cookie') || '').split(';')[0];
  assert.equal((await post(server.base, `/api/classroom/admin/teachers/${teacherId}`, { name: '', email: 'bad' }, newAdminCookie)).status, 400);
  const auditDb = new Database(dbPath, { readonly: true });
  for (const [action, targetType, targetId, outcome] of [
    ['student.create', 'student', 'new', 'invalid'],
    ['classroom.create', 'classroom', createdClass.classroom.id, 'success'],
    ['classroom.courses', 'classroom', classroomId, 'success'],
    ['progress.record', 'progress', studentId, 'success'],
    ['teacher.update', 'teacher', teacherId, 'invalid'],
  ]) {
    assert.equal(auditDb.prepare(`SELECT outcome FROM classroom_management_audit
      WHERE action=? AND target_type=? AND target_id=? ORDER BY rowid DESC LIMIT 1`).get(action, targetType, targetId)?.outcome,
    outcome, `${action} must be audited in the protected operation transaction`);
  }
  auditDb.close();
  await stopServer(server.child);
  console.log('✓ protected classroom mutations and invalid inputs write canonical transactional audits');
  console.log('✓ student login equalizes canonical work for unknown classes and existing active students');
  console.log('✓ wrong invitation codes durably increment and exhaust the current normalized-email invitation across restart');
} finally {
  rmSync(dataDir, { recursive: true, force: true });
}
