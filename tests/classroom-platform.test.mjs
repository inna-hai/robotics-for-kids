import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const serverJs = readFileSync(join(root, 'server.js'), 'utf8');

assert.ok(
  serverJs.includes('process.env.ROBOTICS_DB_FILE'),
  'The classroom API test must be able to use an isolated SQLite database via ROBOTICS_DB_FILE',
);
assert.ok(serverJs.includes('function personalLoginCodeExists'), 'student codes must be checked for classroom collisions');
assert.ok(serverJs.includes('generatePersonalLoginCode(db, classroom.id)'), 'student code generation must use the classroom collision check');
assert.ok(serverJs.includes('CLASSROOM_LOGIN_MAX_KEYS'), 'login failure tracking must have a hard memory bound');
assert.ok(serverJs.includes('function pruneClassroomLoginFailures'), 'expired and excess login failure keys must be pruned');

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
  throw new Error('classroom test server did not start');
}

const tempDir = mkdtempSync(join(tmpdir(), 'robotics-classroom-test-'));
const port = await freePort();
const baseUrl = `http://127.0.0.1:${port}`;
const child = spawn(process.execPath, ['server.js'], {
  cwd: root,
  env: {
    ...process.env,
    PORT: String(port),
    ROBOTICS_DB_FILE: join(tempDir, 'classroom.sqlite'),
    ROBOTICS_SUBSCRIPTION_GATE: '1',
    ROBOTICS_TEACHER_INVITE_CODE: 'test-teacher-invite-code',
    NODE_ENV: 'test',
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});

try {
  await waitForServer(baseUrl);
  const registrationWithoutInvite = await fetch(`${baseUrl}/api/classroom/teacher-register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'מורה בדיקה', email: 'blocked@example.test', password: 'SafePass123!' }),
  });
  assert.equal(registrationWithoutInvite.status, 403);

  const response = await fetch(`${baseUrl}/api/classroom/teacher-register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'מורה בדיקה',
      email: 'teacher@example.test',
      password: 'SafePass123!',
      inviteCode: 'test-teacher-invite-code',
    }),
  });
  const body = await response.json();

  assert.equal(response.status, 201);
  assert.equal(body.ok, true);
  assert.equal(body.role, 'teacher');
  assert.equal(body.teacher.email, 'teacher@example.test');
  assert.equal('token' in body, false, 'teacher session token must not be exposed in JSON');
  assert.match(response.headers.get('set-cookie') || '', /haiTechClassroomToken=/);
  console.log('✓ teacher can create a protected classroom account');

  const wrongLogin = await fetch(`${baseUrl}/api/classroom/teacher-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'teacher@example.test', password: 'wrong-password' }),
  });
  assert.equal(wrongLogin.status, 401);

  const login = await fetch(`${baseUrl}/api/classroom/teacher-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'teacher@example.test', password: 'SafePass123!' }),
  });
  const loginBody = await login.json();
  assert.equal(login.status, 200);
  assert.equal(loginBody.role, 'teacher');
  assert.equal('token' in loginBody, false);
  assert.match(login.headers.get('set-cookie') || '', /haiTechClassroomToken=/);
  console.log('✓ teacher login rejects bad credentials and creates a cookie session');

  const unauthenticatedClass = await fetch(`${baseUrl}/api/classroom/classes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'כיתה ז1' }),
  });
  assert.equal(unauthenticatedClass.status, 401);

  const teacherCookie = (login.headers.get('set-cookie') || '').split(';')[0];
  const createClass = await fetch(`${baseUrl}/api/classroom/classes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: teacherCookie },
    body: JSON.stringify({ name: 'כיתה ז1' }),
  });
  const classBody = await createClass.json();
  assert.equal(createClass.status, 201);
  assert.equal(classBody.classroom.name, 'כיתה ז1');
  assert.match(classBody.classroom.joinCode, /^[A-Z0-9]{6}$/);
  console.log('✓ an authenticated teacher can create a class');

  const addStudent = await fetch(`${baseUrl}/api/classroom/classes/${classBody.classroom.id}/students`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: teacherCookie },
    body: JSON.stringify({ name: 'נועה' }),
  });
  const studentBody = await addStudent.json();
  assert.equal(addStudent.status, 201);
  assert.equal(studentBody.student.name, 'נועה');
  assert.match(studentBody.student.loginCode, /^[A-Z0-9]{6}$/);
  assert.equal('loginCodeHash' in studentBody.student, false);
  console.log('✓ a teacher can add a student and receive a one-time personal code');

  const secondTeacher = await fetch(`${baseUrl}/api/classroom/teacher-register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'מורה אחרת', email: 'other@example.test', password: 'OtherSafePass123!', inviteCode: 'test-teacher-invite-code' }),
  });
  const secondTeacherCookie = (secondTeacher.headers.get('set-cookie') || '').split(';')[0];
  const forbiddenRosterChange = await fetch(`${baseUrl}/api/classroom/classes/${classBody.classroom.id}/students`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: secondTeacherCookie },
    body: JSON.stringify({ name: 'תלמיד זר' }),
  });
  assert.equal(forbiddenRosterChange.status, 404);
  console.log('✓ a teacher cannot access another teacher’s class');

  const badStudentLogin = await fetch(`${baseUrl}/api/classroom/student-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ classCode: classBody.classroom.joinCode, personalCode: 'AAAAAA' }),
  });
  assert.equal(badStudentLogin.status, 401);

  const studentLogin = await fetch(`${baseUrl}/api/classroom/student-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ classCode: classBody.classroom.joinCode, personalCode: studentBody.student.loginCode }),
  });
  const studentLoginBody = await studentLogin.json();
  assert.equal(studentLogin.status, 200);
  assert.equal(studentLoginBody.role, 'student');
  assert.equal(studentLoginBody.student.name, 'נועה');
  assert.equal(studentLoginBody.classroom.name, 'כיתה ז1');
  assert.equal('token' in studentLoginBody, false);
  assert.match(studentLogin.headers.get('set-cookie') || '', /haiTechClassroomToken=/);
  console.log('✓ a classroom student can enter with class and personal codes');

  const guestMe = await fetch(`${baseUrl}/api/classroom/me`);
  assert.equal(guestMe.status, 200);
  assert.deepEqual(await guestMe.json(), { ok: true, role: 'guest' });

  const classes = await fetch(`${baseUrl}/api/classroom/classes`, { headers: { Cookie: teacherCookie } });
  const classesBody = await classes.json();
  assert.equal(classes.status, 200);
  assert.equal(classesBody.classes.length, 1);
  assert.equal(classesBody.classes[0].students.length, 1);
  assert.equal(classesBody.classes[0].students[0].name, 'נועה');
  assert.equal('loginHash' in classesBody.classes[0].students[0], false);

  const studentCookie = (studentLogin.headers.get('set-cookie') || '').split(';')[0];
  const studentMe = await fetch(`${baseUrl}/api/classroom/me`, { headers: { Cookie: studentCookie } });
  const studentMeBody = await studentMe.json();
  assert.equal(studentMeBody.role, 'student');
  assert.equal(studentMeBody.student.name, 'נועה');
  console.log('✓ classroom sessions expose only the correct role and roster data');

  const blockedGuestCourse = await fetch(`${baseUrl}/python-turtle.html`, { redirect: 'manual' });
  assert.equal(blockedGuestCourse.status, 402);
  const classroomCourse = await fetch(`${baseUrl}/python-turtle.html`, { headers: { Cookie: studentCookie }, redirect: 'manual' });
  assert.equal(classroomCourse.status, 200);
  const sisiWeatherLesson = await fetch(`${baseUrl}/weather.html`, { headers: { Cookie: studentCookie }, redirect: 'manual' });
  assert.equal(sisiWeatherLesson.status, 200);
  const unrelatedProtectedPage = await fetch(`${baseUrl}/venture-ai.html`, { headers: { Cookie: studentCookie }, redirect: 'manual' });
  assert.equal(unrelatedProtectedPage.status, 402);
  const teacherMaterials = await fetch(`${baseUrl}/python-turtle-slides.html`, { headers: { Cookie: studentCookie }, redirect: 'manual' });
  assert.equal(teacherMaterials.status, 402);
  console.log('✓ subscription gate admits classroom students without admitting unauthenticated guests');

  const guestProgress = await fetch(`${baseUrl}/api/classroom/progress`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ courseId: 'python-turtle', lessonId: 'course', activityId: 'course-open', status: 'started' }),
  });
  assert.equal(guestProgress.status, 401);

  const saveProgress = await fetch(`${baseUrl}/api/classroom/progress`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: studentCookie },
    body: JSON.stringify({ courseId: 'python-turtle', lessonId: 'course', activityId: 'course-open', status: 'started' }),
  });
  assert.equal(saveProgress.status, 200);

  const report = await fetch(`${baseUrl}/api/classroom/classes`, { headers: { Cookie: teacherCookie } });
  const reportBody = await report.json();
  assert.equal(reportBody.classes[0].students[0].progress[0].courseId, 'python-turtle');
  assert.equal(reportBody.classes[0].students[0].progress[0].status, 'started');
  console.log('✓ classroom progress is linked to the signed-in student and visible only to the teacher');

  const completeProgress = await fetch(`${baseUrl}/api/classroom/progress`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: studentCookie },
    body: JSON.stringify({ courseId: 'python-turtle', lessonId: 'course', activityId: 'course-open', status: 'completed', score: 90 }),
  });
  assert.equal(completeProgress.status, 200);
  const restartCompletedProgress = await fetch(`${baseUrl}/api/classroom/progress`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: studentCookie },
    body: JSON.stringify({ courseId: 'python-turtle', lessonId: 'course', activityId: 'course-open', status: 'started', score: 10 }),
  });
  assert.equal(restartCompletedProgress.status, 200);
  const monotonicReport = await fetch(`${baseUrl}/api/classroom/classes`, { headers: { Cookie: teacherCookie } });
  const monotonicBody = await monotonicReport.json();
  assert.equal(monotonicBody.classes[0].students[0].progress[0].status, 'completed');
  assert.equal(monotonicBody.classes[0].students[0].progress[0].score, 90);
  assert.ok(monotonicBody.classes[0].students[0].progress[0].completedAt);
  console.log('✓ completed classroom progress cannot regress back to started');

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const retry = await fetch(`${baseUrl}/api/classroom/student-login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ classCode: classBody.classroom.joinCode, personalCode: 'ZZZZZZ' })
    });
    assert.equal(retry.status, 401);
  }
  const throttled = await fetch(`${baseUrl}/api/classroom/student-login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ classCode: classBody.classroom.joinCode, personalCode: 'ZZZZZZ' })
  });
  assert.equal(throttled.status, 429);
  console.log('✓ repeated classroom login failures are rate limited');

  const logout = await fetch(`${baseUrl}/api/classroom/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: teacherCookie },
    body: '{}',
  });
  assert.equal(logout.status, 200);
  assert.match(logout.headers.get('set-cookie') || '', /Max-Age=0/);
  const afterLogout = await fetch(`${baseUrl}/api/classroom/me`, { headers: { Cookie: teacherCookie } });
  assert.equal((await afterLogout.json()).role, 'guest');
  console.log('✓ classroom logout revokes the server session');
} finally {
  if (child.exitCode === null && child.signalCode === null) {
    child.kill('SIGTERM');
    await new Promise((resolve) => child.once('exit', resolve));
  }
  rmSync(tempDir, { recursive: true, force: true });
}
