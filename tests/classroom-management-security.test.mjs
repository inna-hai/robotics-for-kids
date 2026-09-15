import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:net';
import { spawn } from 'node:child_process';
import Database from 'better-sqlite3';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const tempDir = mkdtempSync(join(tmpdir(), 'classroom-management-security-'));
const dbFile = join(tempDir, 'management.sqlite');

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
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try { if ((await fetch(`${baseUrl}/index.html`)).ok) return; } catch {}
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error('management security test server did not start');
}
async function jsonRequest(baseUrl, path, { cookie = '', body, method } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: method || (body === undefined ? 'GET' : 'POST'),
    headers: { ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...(cookie ? { Cookie: cookie } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { response, data: await response.json() };
}
const cookieOf = (response) => (response.headers.get('set-cookie') || '').split(';')[0];
function studentSessionCount(dbFile, studentId) {
  const db = new Database(dbFile);
  try { return db.prepare('SELECT COUNT(*) AS count FROM classroom_student_sessions WHERE student_id = ?').get(studentId).count; }
  finally { db.close(); }
}

const port = await freePort();
const baseUrl = `http://127.0.0.1:${port}`;
const child = spawn(process.execPath, ['server.js'], {
  cwd: root,
  env: { ...process.env, PORT: String(port), ROBOTICS_DB_FILE: dbFile, ROBOTICS_CLASSROOM_ADMIN_CODE: 'management-admin-code', ROBOTICS_TEACHER_INVITE_CODE: 'management-invite', NODE_ENV: 'test' },
  stdio: ['ignore', 'pipe', 'pipe'],
});

try {
  await waitForServer(baseUrl);
  const adminLogin = await jsonRequest(baseUrl, '/api/classroom/admin-login', { body: { code: 'management-admin-code' } });
  const adminCookie = cookieOf(adminLogin.response);
  const db = new Database(dbFile);
  const teacherColumns = db.prepare("PRAGMA table_info('classroom_teachers')").all().map((row) => row.name);
  const studentColumns = db.prepare("PRAGMA table_info('classroom_students')").all().map((row) => row.name);
  assert.ok(teacherColumns.includes('archived_at'));
  assert.ok(teacherColumns.includes('disabled_at'));
  assert.ok(studentColumns.includes('archived_at'));
  assert.ok(studentColumns.includes('disabled_at'));
  assert.ok(db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'classroom_management_audit'").get());
  db.close();

  const deniedCreate = await jsonRequest(baseUrl, '/api/classroom/admin/teachers', { body: { name: 'אסורה', email: 'denied@example.test' } });
  assert.equal(deniedCreate.response.status, 401);
  const suppliedPasswordCreate = await jsonRequest(baseUrl, '/api/classroom/admin/teachers', { cookie: adminCookie, body: { name: 'מורה', email: 'short@example.test', password: 'short' } });
  assert.equal(suppliedPasswordCreate.response.status, 400);
  assert.match(suppliedPasswordCreate.data.error, /סיסמה/);
  const created = await jsonRequest(baseUrl, '/api/classroom/admin/teachers', { cookie: adminCookie, body: { name: 'מורה מנהלת', email: 'admin-created@example.test' } });
  assert.equal(created.response.status, 201);
  assert.equal(created.data.oneTime, true);
  assert.match(created.data.temporaryPassword, /^[A-Za-z0-9_-]{16,}$/);
  assert.equal('temporaryPassword' in created.data.teacher, false);
  const tempPassword = created.data.temporaryPassword;
  const listed = await jsonRequest(baseUrl, '/api/classroom/admin/teachers', { cookie: adminCookie });
  assert.equal(listed.response.status, 200);
  assert.equal(JSON.stringify(listed.data).includes(tempPassword), false);
  assert.equal(listed.data.teachers.some((teacher) => 'password' in teacher || 'temporaryPassword' in teacher), false);
  const stored = new Database(dbFile);
  const teacherRow = stored.prepare('SELECT * FROM classroom_teachers WHERE id = ?').get(created.data.teacher.id);
  assert.equal(Object.values(teacherRow).includes(tempPassword), false);
  const auditText = JSON.stringify(stored.prepare('SELECT * FROM classroom_management_audit').all());
  assert.equal(auditText.includes(tempPassword), false);
  assert.equal(auditText.includes('management-admin-code'), false);
  stored.close();
  console.log('✓ fail-closed migrations and one-time administrator teacher credentials');

  const deniedEdit = await jsonRequest(baseUrl, `/api/classroom/admin/teachers/${created.data.teacher.id}`, { body: { name: 'לא מורשה', email: 'blocked-edit@example.test' } });
  assert.equal(deniedEdit.response.status, 401);
  const edited = await jsonRequest(baseUrl, `/api/classroom/admin/teachers/${created.data.teacher.id}`, { cookie: adminCookie, body: { name: 'מורה מעודכנת', email: 'updated@example.test' } });
  assert.equal(edited.response.status, 200);
  assert.equal(edited.data.teacher.name, 'מורה מעודכנת');
  const teacherLogin = await jsonRequest(baseUrl, '/api/classroom/teacher-login', { body: { email: 'updated@example.test', password: tempPassword } });
  assert.equal(teacherLogin.response.status, 200);
  let teacherCookie = cookieOf(teacherLogin.response);
  const archivedTeacher = await jsonRequest(baseUrl, `/api/classroom/admin/teachers/${created.data.teacher.id}/archive`, { cookie: adminCookie, body: {} });
  assert.equal(archivedTeacher.response.status, 200);
  assert.ok(archivedTeacher.data.teacher.archivedAt);
  assert.equal((await jsonRequest(baseUrl, '/api/classroom/me', { cookie: teacherCookie })).data.role, 'guest');
  assert.equal((await jsonRequest(baseUrl, '/api/classroom/teacher-login', { body: { email: 'updated@example.test', password: tempPassword } })).response.status, 401);
  const activeTeachers = await jsonRequest(baseUrl, '/api/classroom/admin/teachers', { cookie: adminCookie });
  assert.equal(activeTeachers.data.teachers.some((teacher) => teacher.id === created.data.teacher.id), false);
  const allTeachers = await jsonRequest(baseUrl, '/api/classroom/admin/teachers?includeArchived=1', { cookie: adminCookie });
  assert.equal(allTeachers.data.teachers.find((teacher) => teacher.id === created.data.teacher.id).archivedAt !== null, true);
  const restoredTeacher = await jsonRequest(baseUrl, `/api/classroom/admin/teachers/${created.data.teacher.id}/restore`, { cookie: adminCookie, body: {} });
  assert.equal(restoredTeacher.response.status, 200);
  const relogin = await jsonRequest(baseUrl, '/api/classroom/teacher-login', { body: { email: 'updated@example.test', password: tempPassword } });
  assert.equal(relogin.response.status, 200);
  teacherCookie = cookieOf(relogin.response);
  console.log('✓ administrator edit/archive/restore hides teachers and invalidates sessions immediately');

  const assignCourses = await jsonRequest(baseUrl, `/api/classroom/admin/teachers/${created.data.teacher.id}/courses`, { cookie: adminCookie, body: { courses: ['python-turtle'] } });
  assert.equal(assignCourses.response.status, 200);
  const firstClass = await jsonRequest(baseUrl, '/api/classroom/classes', { cookie: teacherCookie, body: { name: 'כיתה מאובטחת', courses: ['python-turtle'] } });
  assert.equal(firstClass.response.status, 201);
  const classId = firstClass.data.classroom.id;
  const studentCreated = await jsonRequest(baseUrl, `/api/classroom/classes/${classId}/students`, { cookie: teacherCookie, body: { name: 'תלמידה ראשונה' } });
  assert.equal(studentCreated.response.status, 201);
  const studentId = studentCreated.data.student.id;
  const originalCode = studentCreated.data.student.loginCode;
  const roster = await jsonRequest(baseUrl, '/api/classroom/classes', { cookie: teacherCookie });
  assert.equal(JSON.stringify(roster.data).includes(originalCode), false);
  assert.equal('loginCode' in roster.data.classes[0].students[0], false);
  const studentLogin = await jsonRequest(baseUrl, '/api/classroom/student-login', { body: { classCode: firstClass.data.classroom.joinCode, personalCode: originalCode } });
  assert.equal(studentLogin.response.status, 200);
  const originalStudentCookie = cookieOf(studentLogin.response);

  const secondTeacher = await jsonRequest(baseUrl, '/api/classroom/teacher-register', { body: { name: 'מורה שנייה', email: 'second@example.test', password: 'SecondPass123!', inviteCode: 'management-invite' } });
  assert.equal(secondTeacher.response.status, 201);
  const secondTeacherCookie = cookieOf(secondTeacher.response);
  for (const path of [
    `/api/classroom/classes/${classId}/students/${studentId}`,
    `/api/classroom/classes/${classId}/students/${studentId}/reset`,
    `/api/classroom/classes/${classId}/students/${studentId}/archive`,
  ]) {
    const denied = await jsonRequest(baseUrl, path, { cookie: secondTeacherCookie, body: path.endsWith(`/${studentId}`) ? { name: 'גניבה' } : {} });
    assert.equal(denied.response.status, 404);
  }
  const editedStudent = await jsonRequest(baseUrl, `/api/classroom/classes/${classId}/students/${studentId}`, { cookie: teacherCookie, body: { name: 'תלמידה מעודכנת' } });
  assert.equal(editedStudent.response.status, 200);
  assert.equal(editedStudent.data.student.name, 'תלמידה מעודכנת');
  const resetStudent = await jsonRequest(baseUrl, `/api/classroom/classes/${classId}/students/${studentId}/reset`, { cookie: teacherCookie, body: {} });
  assert.equal(resetStudent.response.status, 200);
  assert.equal(resetStudent.data.oneTime, true);
  assert.match(resetStudent.data.student.loginCode, /^[A-Z0-9]{6}$/);
  assert.notEqual(resetStudent.data.student.loginCode, originalCode);
  const resetCode = resetStudent.data.student.loginCode;
  assert.equal((await jsonRequest(baseUrl, '/api/classroom/me', { cookie: originalStudentCookie })).data.role, 'guest');
  assert.equal((await jsonRequest(baseUrl, '/api/classroom/student-login', { body: { classCode: firstClass.data.classroom.joinCode, personalCode: originalCode } })).response.status, 401);
  const resetLogin = await jsonRequest(baseUrl, '/api/classroom/student-login', { body: { classCode: firstClass.data.classroom.joinCode, personalCode: resetCode } });
  assert.equal(resetLogin.response.status, 200);
  const resetStudentCookie = cookieOf(resetLogin.response);
  const archiveStudent = await jsonRequest(baseUrl, `/api/classroom/classes/${classId}/students/${studentId}/archive`, { cookie: teacherCookie, body: {} });
  assert.equal(archiveStudent.response.status, 200);
  assert.equal((await jsonRequest(baseUrl, '/api/classroom/me', { cookie: resetStudentCookie })).data.role, 'guest');
  assert.equal((await jsonRequest(baseUrl, '/api/classroom/student-login', { body: { classCode: firstClass.data.classroom.joinCode, personalCode: resetCode } })).response.status, 401);
  const hiddenRoster = await jsonRequest(baseUrl, '/api/classroom/classes', { cookie: teacherCookie });
  assert.equal(hiddenRoster.data.classes[0].students.length, 0);
  const foreignArchivedList = await jsonRequest(baseUrl, `/api/classroom/classes/${classId}/students/archived`, { cookie: secondTeacherCookie });
  assert.equal(foreignArchivedList.response.status, 404);
  const ownerArchivedList = await jsonRequest(baseUrl, `/api/classroom/classes/${classId}/students/archived`, { cookie: teacherCookie });
  assert.equal(ownerArchivedList.response.status, 200);
  assert.equal(ownerArchivedList.data.students[0].id, studentId);
  assert.ok(ownerArchivedList.data.students[0].archivedAt);
  assert.equal('loginCode' in ownerArchivedList.data.students[0], false);
  const foreignRestore = await jsonRequest(baseUrl, `/api/classroom/classes/${classId}/students/${studentId}/restore`, { cookie: secondTeacherCookie, body: {} });
  assert.equal(foreignRestore.response.status, 404);
  const sessionsBeforeOwnerRestore = studentSessionCount(dbFile, studentId);
  const ownerRestore = await jsonRequest(baseUrl, `/api/classroom/classes/${classId}/students/${studentId}/restore`, { cookie: teacherCookie, body: {} });
  assert.equal(ownerRestore.response.status, 200);
  assert.equal(JSON.stringify(ownerRestore.data).includes(resetCode), false);
  assert.equal('loginCode' in ownerRestore.data.student, false);
  const sessionsAfterOwnerRestore = studentSessionCount(dbFile, studentId);
  assert.equal(sessionsAfterOwnerRestore, sessionsBeforeOwnerRestore);
  assert.equal((await jsonRequest(baseUrl, '/api/classroom/student-login', { body: { classCode: firstClass.data.classroom.joinCode, personalCode: originalCode } })).response.status, 401);
  assert.equal((await jsonRequest(baseUrl, '/api/classroom/student-login', { body: { classCode: firstClass.data.classroom.joinCode, personalCode: resetCode } })).response.status, 200);

  const archiveAgain = await jsonRequest(baseUrl, `/api/classroom/classes/${classId}/students/${studentId}/archive`, { cookie: teacherCookie, body: {} });
  assert.equal(archiveAgain.response.status, 200);
  const archivedAdminList = await jsonRequest(baseUrl, '/api/classroom/admin/teachers?includeArchived=1', { cookie: adminCookie });
  const archivedAdminStudent = archivedAdminList.data.teachers
    .flatMap((teacher) => teacher.classes).flatMap((classroom) => classroom.students || [])
    .find((student) => student.id === studentId);
  assert.ok(archivedAdminStudent.archivedAt);
  assert.equal('loginCode' in archivedAdminStudent, false);
  const adminRestore = await jsonRequest(baseUrl, `/api/classroom/admin/students/${studentId}/restore`, { cookie: adminCookie, body: {} });
  assert.equal(adminRestore.response.status, 200);
  assert.equal((await jsonRequest(baseUrl, '/api/classroom/student-login', { body: { classCode: firstClass.data.classroom.joinCode, personalCode: resetCode } })).response.status, 200);
  console.log('✓ owned-student edit/reset/archive/restore boundaries, revocation, hidden roster, and admin restore');

  const finalDb = new Database(dbFile);
  const persistedStudent = finalDb.prepare('SELECT * FROM classroom_students WHERE id = ?').get(studentId);
  assert.equal(Object.values(persistedStudent).includes(resetCode), false);
  const auditRows = finalDb.prepare('SELECT * FROM classroom_management_audit').all();
  assert.ok(auditRows.some((row) => row.action === 'student.reset_code' && row.outcome === 'success'));
  assert.ok(auditRows.some((row) => row.action === 'student.archive' && row.outcome === 'denied'));
  assert.ok(auditRows.some((row) => row.actor_type === 'teacher' && row.action === 'student.restore' && row.outcome === 'success'));
  assert.deepEqual(Object.keys(auditRows[0]).sort(), ['action', 'actor_id', 'actor_type', 'id', 'occurred_at', 'outcome', 'target_id', 'target_type']);
  assert.equal(JSON.stringify(auditRows).includes(resetCode), false);
  assert.equal(JSON.stringify(auditRows).includes(originalCode), false);
  finalDb.close();
  console.log('✓ management audit is non-sensitive and captures outcomes');
} finally {
  if (child.exitCode === null && child.signalCode === null) {
    child.kill('SIGTERM');
    await new Promise((resolve) => child.once('exit', resolve));
  }
  rmSync(tempDir, { recursive: true, force: true });
}
