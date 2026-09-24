import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:net';
import { spawn } from 'node:child_process';
import Database from 'better-sqlite3';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const serverSource = readFileSync(join(root, 'server.js'), 'utf8');
const adminTeachersGet = serverSource.slice(
  serverSource.indexOf("if (req.method === 'GET' && action === 'admin' && segments[3] === 'teachers' && segments.length === 4)"),
  serverSource.indexOf("if (req.method === 'GET' && action === 'classes' && segments.length === 3)"),
);
assert.match(adminTeachersGet, /withSummerDb\(db => db\.transaction\([\s\S]*requireCurrentClassroomAdmin[\s\S]*\)\.immediate\(\)\)/,
  'administrator teacher-list authorization and data reads must share one immediate transaction');
const teacherClassesGet = serverSource.slice(
  serverSource.indexOf("if (req.method === 'GET' && action === 'classes' && segments.length === 3)"),
  serverSource.indexOf("if (req.method === 'GET' && action === 'classes' && segments[3]", serverSource.indexOf("if (req.method === 'GET' && action === 'classes' && segments.length === 3)")),
);
assert.match(teacherClassesGet, /withSummerDb\(db => db\.transaction\([\s\S]*requireCurrentClassroomTeacher[\s\S]*\)\.immediate\(\)\)/,
  'teacher class authorization and data reads must share one immediate transaction');
const archivedStudentsGet = serverSource.slice(
  serverSource.indexOf("if (req.method === 'GET' && action === 'classes' && segments[3]"),
  serverSource.indexOf("if (req.method === 'GET' && action === 'admin' && segments[3] === 'invitations'"),
);
assert.match(archivedStudentsGet, /withSummerDb\(db => db\.transaction\([\s\S]*requireCurrentClassroomTeacher[\s\S]*\)\.immediate\(\)\)/,
  'teacher archived-student authorization and data reads must share one immediate transaction');
const tempDir = mkdtempSync(join(tmpdir(), 'classroom-review-blockers-'));
const dbFile = join(tempDir, 'review.sqlite');
const freePort = () => new Promise((resolve, reject) => {
  const server = createServer(); server.once('error', reject);
  server.listen(0, '127.0.0.1', () => { const { port } = server.address(); server.close(() => resolve(port)); });
});
const request = async (base, path, { cookie = '', body, method } = {}) => {
  const response = await fetch(`${base}${path}`, {
    method: method || (body === undefined ? 'GET' : 'POST'),
    headers: { ...(cookie ? { Cookie: cookie } : {}), ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let data = {}; try { data = await response.json(); } catch {}
  return { response, data };
};
const cookieOf = response => String(response.headers.get('set-cookie') || '').split(';')[0];
const port = await freePort();
const base = `http://127.0.0.1:${port}`;
const child = spawn(process.execPath, ['server.js'], {
  cwd: root,
  env: {
    ...process.env, PORT: String(port), ROBOTICS_DB_FILE: dbFile, NODE_ENV: 'test',
    ROBOTICS_CLASSROOM_ADMIN_EMAIL: 'owner@example.test',
    ROBOTICS_CLASSROOM_ADMIN_CODE: '', ROBOTICS_TEACHER_INVITE_CODE: '',
    ROBOTICS_PREVIEW_DEMO_TEACHER: '1', KUGEL_PREVIEW_MOCK_MINECRAFT: '1',
    KUGEL_MINECRAFT_INTERNAL_TOKEN: 'review-internal-token',
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});
try {
  for (let i = 0; i < 80; i += 1) {
    try { if ((await fetch(`${base}/index.html`)).ok) break; } catch {}
    if (i === 79) throw new Error('server did not start');
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  const adminAccess = await request(base, '/api/classroom/admin-access/request', { body: { email: 'owner@example.test' } });
  const adminLogin = await request(base, '/api/classroom/admin-access/redeem', {
    body: { email: 'owner@example.test', code: adminAccess.data.testCode },
  });
  const adminCookie = cookieOf(adminLogin.response);

  // Supplied admin-create passwords are rejected rather than silently ignored.
  const rejectedPassword = await request(base, '/api/classroom/admin/teachers', {
    cookie: adminCookie, body: { name: 'מורת בדיקה', email: 'review@example.test', password: 'short' },
  });
  assert.equal(rejectedPassword.response.status, 400);
  assert.match(rejectedPassword.data.error, /סיסמה/);
  const invitation = await request(base, '/api/classroom/admin/invitations', {
    cookie: adminCookie, body: { name: 'מורת בדיקה', email: 'review@example.test' },
  });
  const create = await request(base, '/api/classroom/teacher-invitations/redeem', {
    body: { email: 'review@example.test', code: invitation.data.testCode },
  });
  assert.equal(create.response.status, 201);
  assert.equal((await request(base, '/api/classroom/teacher-login', { body: { email: 'review@example.test', password: 'short' } })).response.status, 401);
  const teacherLogin = await request(base, '/api/classroom/teacher-login', { body: { email: 'review@example.test', password: create.data.temporaryPassword } });
  let teacherCookie = cookieOf(teacherLogin.response);
  const teacherId = create.data.teacher.id;
  await request(base, `/api/classroom/admin/teachers/${teacherId}/courses`, { cookie: adminCookie, body: { courses: ['craftom-agent'] } });
  const createdClass = await request(base, '/api/classroom/classes', { cookie: teacherCookie, body: { name: 'כיתת סקירה', courses: ['craftom-agent'] } });
  const classroom = createdClass.data.classroom;
  const createdStudent = await request(base, `/api/classroom/classes/${classroom.id}/students`, { cookie: teacherCookie, body: { name: 'תלמיד פעיל' } });
  const student = createdStudent.data.student;
  const studentLogin = await request(base, '/api/classroom/student-login', { body: { classCode: classroom.joinCode, personalCode: student.loginCode } });
  const studentCookie = cookieOf(studentLogin.response);

  // Active Kugel leases block teacher archive before any DB/session mutation.
  const db = new Database(dbFile);
  const now = new Date().toISOString();
  db.prepare(`INSERT INTO kugel_class_sessions
    (classroom_id, lesson_id, active, monitor_server_name, world_id, events_since, launch_token, server_state, server_detail, created_at, updated_at)
    VALUES (?, 0, 1, ?, 'world', 0, 'lease-token', 'running', '', ?, ?)`)
    .run(classroom.id, `preview-mock-minecraft-${classroom.id}`, now, now);
  db.close();
  const blockedArchive = await request(base, `/api/classroom/admin/teachers/${teacherId}/archive`, { cookie: adminCookie, body: {} });
  assert.equal(blockedArchive.response.status, 409);
  assert.equal((await request(base, '/api/classroom/me', { cookie: teacherCookie })).data.role, 'teacher');
  assert.equal((await request(base, '/api/classroom/me', { cookie: studentCookie })).data.role, 'student');
  const unchanged = new Database(dbFile).prepare('SELECT archived_at, disabled_at FROM classroom_teachers WHERE id = ?').get(teacherId);
  assert.deepEqual(unchanged, { archived_at: null, disabled_at: null });

  const db2 = new Database(dbFile); db2.prepare('DELETE FROM kugel_class_sessions WHERE classroom_id = ?').run(classroom.id); db2.close();
  const archived = await request(base, `/api/classroom/admin/teachers/${teacherId}/archive`, { cookie: adminCookie, body: {} });
  assert.equal(archived.response.status, 200);
  const archivedDb = new Database(dbFile);
  const archivedRow = archivedDb.prepare('SELECT archived_at, disabled_at FROM classroom_teachers WHERE id = ?').get(teacherId);
  assert.ok(archivedRow.archived_at && archivedRow.disabled_at);
  archivedDb.close();
  assert.equal((await request(base, '/api/classroom/me', { cookie: teacherCookie })).data.role, 'guest');
  assert.equal((await request(base, '/api/classroom/me', { cookie: studentCookie })).data.role, 'guest');
  assert.equal((await request(base, '/api/classroom/student-login', { body: { classCode: classroom.joinCode, personalCode: student.loginCode } })).response.status, 401);

  // Teacher restore clears both flags, creates no sessions, and leaves student credentials reusable only after owner restore.
  const restoreTeacher = await request(base, `/api/classroom/admin/teachers/${teacherId}/restore`, { cookie: adminCookie, body: {} });
  assert.equal(restoreTeacher.response.status, 200);
  const restoredDb = new Database(dbFile);
  assert.deepEqual(restoredDb.prepare('SELECT archived_at, disabled_at FROM classroom_teachers WHERE id = ?').get(teacherId), { archived_at: null, disabled_at: null });
  assert.equal(restoredDb.prepare('SELECT COUNT(*) count FROM classroom_teacher_sessions WHERE teacher_id = ? AND revoked_at IS NULL').get(teacherId).count, 0);
  restoredDb.close();
  const relogin = await request(base, '/api/classroom/teacher-login', { body: { email: 'review@example.test', password: create.data.temporaryPassword } });
  teacherCookie = cookieOf(relogin.response);

  // Disabled-only students are hidden from all normal/Kugel views and immutable by management and Minecraft routes.
  const verifiedDb = new Database(dbFile);
  verifiedDb.prepare(`INSERT INTO classroom_minecraft_identities
    (student_id, upn, player_name, status, graph_object_id, source, verified_at, created_at, updated_at)
    VALUES (?, 'review.student@hai.tech', 'ReviewPlayer', 'verified', 'review-graph-object',
      'microsoft-graph-via-monitor', ?, ?, ?)`)
    .run(student.id, now, now, now);
  verifiedDb.prepare('UPDATE classroom_students SET minecraft_player_name = ?, updated_at = ? WHERE id = ?')
    .run('ReviewPlayer', now, student.id);
  verifiedDb.close();
  const link = await request(base, `/api/kugel/classes/${classroom.id}/students/${student.id}/minecraft`, { cookie: teacherCookie, body: { playerName: 'ReviewPlayer' } });
  assert.equal(link.response.status, 200);
  const disabledDb = new Database(dbFile);
  disabledDb.prepare('UPDATE classroom_students SET archived_at = NULL, disabled_at = ? WHERE id = ?').run(new Date().toISOString(), student.id);
  disabledDb.prepare(`INSERT INTO kugel_class_sessions
    (classroom_id, lesson_id, active, monitor_server_name, world_id, events_since, launch_token, server_state, server_detail, created_at, updated_at)
    VALUES (?, 0, 1, ?, 'world', 0, 'lease-two', 'running', '', ?, ?)`)
    .run(classroom.id, `preview-mock-minecraft-${classroom.id}`, now, now);
  disabledDb.close();
  assert.equal((await request(base, '/api/classroom/me', { cookie: studentCookie })).data.role, 'guest');
  const classes = await request(base, '/api/classroom/classes', { cookie: teacherCookie });
  assert.equal(classes.data.classes[0].students.some(row => row.id === student.id), false);
  const archivedStudents = await request(base, `/api/classroom/classes/${classroom.id}/students/archived`, { cookie: teacherCookie });
  assert.equal(archivedStudents.data.students.some(row => row.id === student.id), true);
  const kugelView = await request(base, `/api/kugel/session?classroomId=${classroom.id}`, { cookie: teacherCookie });
  assert.equal(kugelView.data.students.some(row => row.id === student.id), false);
  for (const [path, body] of [
    [`/api/classroom/classes/${classroom.id}/students/${student.id}`, { name: 'שינוי אסור' }],
    [`/api/classroom/classes/${classroom.id}/students/${student.id}/reset`, {}],
    [`/api/classroom/classes/${classroom.id}/students/${student.id}/archive`, {}],
    [`/api/kugel/classes/${classroom.id}/students/${student.id}/minecraft`, { playerName: 'ChangedPlayer' }],
    [`/api/kugel/classes/${classroom.id}/message`, { text: 'אסור', scope: 'player', target: 'ReviewPlayer' }],
    [`/api/kugel/classes/${classroom.id}/freeze`, { scope: 'player', target: 'ReviewPlayer', on: true }],
  ]) assert.equal((await request(base, path, { cookie: teacherCookie, body })).response.status, 404, path);

  // Disabled-only identities appear in archived management and can be restored; admin cannot restore a student under inactive owner.
  const included = await request(base, '/api/classroom/admin/teachers?includeArchived=1', { cookie: adminCookie });
  const includedStudent = included.data.teachers.flatMap(t => t.classes).flatMap(c => c.students).find(s => s.id === student.id);
  assert.ok(includedStudent, 'disabled-only student must appear in archived management data');
  const db3 = new Database(dbFile);
  db3.prepare('UPDATE classroom_teachers SET archived_at = NULL, disabled_at = ? WHERE id = ?').run(new Date().toISOString(), teacherId);
  db3.close();
  assert.equal((await request(base, `/api/classroom/admin/students/${student.id}/restore`, { cookie: adminCookie, body: {} })).response.status, 409);
  const activeList = await request(base, '/api/classroom/admin/teachers', { cookie: adminCookie });
  assert.equal(activeList.data.teachers.some(t => t.id === teacherId), false);
  const inactiveList = await request(base, '/api/classroom/admin/teachers?includeArchived=1', { cookie: adminCookie });
  assert.equal(inactiveList.data.teachers.some(t => t.id === teacherId), true);
  const restoredDisabledTeacher = await request(base, `/api/classroom/admin/teachers/${teacherId}/restore`, { cookie: adminCookie, body: {} });
  assert.equal(restoredDisabledTeacher.response.status, 200);
  assert.equal((await request(base, `/api/classroom/admin/students/${student.id}/restore`, { cookie: adminCookie, body: {} })).response.status, 200);

  // Preview endpoints do not reactivate or log in disabled demo identities.
  const previewTeacher = await request(base, '/api/classroom/preview-demo-teacher-login', { body: {} });
  assert.equal(previewTeacher.response.status, 200);
  const previewStudent = await request(base, '/api/classroom/preview-demo-student-login', { body: {} });
  assert.equal(previewStudent.response.status, 200);
  const previewDb = new Database(dbFile);
  const demoTeacher = previewDb.prepare("SELECT id FROM classroom_teachers WHERE email = 'preview-teacher@hai.tech'").get();
  const demoStudent = previewDb.prepare("SELECT id FROM classroom_students WHERE name = 'הדסה בדיקה'").get();
  previewDb.prepare('UPDATE classroom_teachers SET disabled_at = ? WHERE id = ?').run(new Date().toISOString(), demoTeacher.id);
  previewDb.close();
  assert.equal((await request(base, '/api/classroom/preview-demo-teacher-login', { body: {} })).response.status, 401);
  assert.equal((await request(base, '/api/classroom/preview-demo-student-login', { body: {} })).response.status, 401);
  const previewDb2 = new Database(dbFile);
  previewDb2.prepare('UPDATE classroom_teachers SET disabled_at = NULL WHERE id = ?').run(demoTeacher.id);
  previewDb2.prepare('UPDATE classroom_students SET disabled_at = ? WHERE id = ?').run(new Date().toISOString(), demoStudent.id);
  previewDb2.close();
  assert.equal((await request(base, '/api/classroom/preview-demo-student-login', { body: {} })).response.status, 401);

  console.log('✓ review blockers fail closed for inactivity, descendants, Agent Academy targets, preview, and generated credentials');
} finally {
  if (child.exitCode === null && child.signalCode === null) {
    child.kill('SIGTERM'); await new Promise(resolve => child.once('exit', resolve));
  }
  rmSync(tempDir, { recursive: true, force: true });
}
