import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import Database from 'better-sqlite3';

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
assert.ok(serverJs.includes('process.env.ROBOTICS_CLASSROOM_LOGIN_MAX_KEYS'), 'the limiter cap must be testable with an isolated low bound');
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
const dbFile = join(tempDir, 'classroom.sqlite');
const port = await freePort();
const baseUrl = `http://127.0.0.1:${port}`;
const child = spawn(process.execPath, ['server.js'], {
  cwd: root,
  env: {
    ...process.env,
    PORT: String(port),
    ROBOTICS_DB_FILE: dbFile,
    ROBOTICS_SUBSCRIPTION_GATE: '1',
    ROBOTICS_TEACHER_INVITE_CODE: 'test-teacher-invite-code',
    ROBOTICS_CLASSROOM_ADMIN_CODE: 'test-classroom-admin-code',
    ROBOTICS_CLASSROOM_LOGIN_MAX_KEYS: '8',
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
  const teacherBeforeAssignment = await fetch(`${baseUrl}/api/classroom/me`, { headers: { Cookie: teacherCookie } });
  assert.deepEqual((await teacherBeforeAssignment.json()).teacher.courses, []);

  const classBeforeAssignment = await fetch(`${baseUrl}/api/classroom/classes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: teacherCookie },
    body: JSON.stringify({ name: 'כיתה חסומה', courses: ['python-turtle'] }),
  });
  assert.equal(classBeforeAssignment.status, 403);

  const badAdminLogin = await fetch(`${baseUrl}/api/classroom/admin-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: 'wrong-admin-code' }),
  });
  assert.equal(badAdminLogin.status, 401);

  const adminLogin = await fetch(`${baseUrl}/api/classroom/admin-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: 'test-classroom-admin-code' }),
  });
  assert.equal(adminLogin.status, 200);
  const adminCookie = (adminLogin.headers.get('set-cookie') || '').split(';')[0];
  assert.match(adminCookie, /^haiTechClassroomAdminToken=/);

  const adminTeachers = await fetch(`${baseUrl}/api/classroom/admin/teachers`, { headers: { Cookie: adminCookie } });
  const adminTeachersBody = await adminTeachers.json();
  assert.equal(adminTeachers.status, 200);
  assert.equal(adminTeachersBody.teachers[0].email, 'teacher@example.test');
  assert.deepEqual(adminTeachersBody.teachers[0].courses, []);

  const unauthenticatedTeacherAssignment = await fetch(`${baseUrl}/api/classroom/admin/teachers/${body.teacher.id}/courses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ courses: ['python-turtle'] }),
  });
  assert.equal(unauthenticatedTeacherAssignment.status, 401);

  const assignTeacherCourses = await fetch(`${baseUrl}/api/classroom/admin/teachers/${body.teacher.id}/courses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({ courses: ['craftom-agent', 'webcode', 'python-turtle', 'sisi', 'sensi-city'] }),
  });
  const assignmentBody = await assignTeacherCourses.json();
  assert.equal(assignTeacherCourses.status, 200);
  assert.deepEqual(assignmentBody.teacher.courses, ['sensi-city', 'sisi', 'python-turtle', 'webcode', 'craftom-agent']);

  const teacherAfterAssignment = await fetch(`${baseUrl}/api/classroom/me`, { headers: { Cookie: teacherCookie } });
  assert.deepEqual((await teacherAfterAssignment.json()).teacher.courses, ['sensi-city', 'sisi', 'python-turtle', 'webcode', 'craftom-agent']);
  const invalidTeacherAssignment = await fetch(`${baseUrl}/api/classroom/admin/teachers/${body.teacher.id}/courses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({ courses: ['python-turtle', 'unknown-course'] }),
  });
  assert.equal(invalidTeacherAssignment.status, 400);
  const teacherAfterInvalidAssignment = await fetch(`${baseUrl}/api/classroom/me`, { headers: { Cookie: teacherCookie } });
  assert.deepEqual((await teacherAfterInvalidAssignment.json()).teacher.courses, ['sensi-city', 'sisi', 'python-turtle', 'webcode', 'craftom-agent']);
  console.log('✓ an administrator exclusively assigns the teacher course catalog');

  const createClass = await fetch(`${baseUrl}/api/classroom/classes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: teacherCookie },
    body: JSON.stringify({ name: 'כיתה ז1', courses: ['python-turtle', 'sisi', 'sensi-city', 'webcode'] }),
  });
  const classBody = await createClass.json();
  assert.equal(createClass.status, 201);
  assert.equal(classBody.classroom.name, 'כיתה ז1');
  assert.match(classBody.classroom.joinCode, /^[A-Z0-9]{6}$/);
  assert.deepEqual(classBody.classroom.courses, ['sensi-city', 'sisi', 'python-turtle', 'webcode']);
  console.log('✓ an authenticated teacher can create a class with selected courses');

  const teacherAssignedCourse = await fetch(`${baseUrl}/python-turtle.html`, { headers: { Cookie: teacherCookie }, redirect: 'manual' });
  assert.equal(teacherAssignedCourse.status, 200);
  for (const teacherResource of [
    '/teachers.html',
    '/slides/lesson1.html',
    '/python-turtle-lesson-1-slides.html',
    '/webcode-slides.html',
  ]) {
    const response = await fetch(`${baseUrl}${teacherResource}`, { headers: { Cookie: teacherCookie }, redirect: 'manual' });
    assert.equal(response.status, 200, `${teacherResource} must open for the teacher when its course is assigned`);
  }
  const assignedTeacherVideo = await fetch(`${baseUrl}/api/sensi/guide-videos/lesson-1`, { headers: { Cookie: teacherCookie } });
  assert.equal(assignedTeacherVideo.status, 404, 'assigned Sensi teacher must pass authorization before the missing test video is checked');
  const teacherCourseOutsideClass = await fetch(`${baseUrl}/craftom-agent-academy.html?lesson=1`, { headers: { Cookie: teacherCookie }, redirect: 'manual' });
  assert.equal(teacherCourseOutsideClass.status, 200, 'teacher entitlement must not depend on assigning the course to a class');

  const personalRegistration = await fetch(`${baseUrl}/api/summer/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      parentName: 'הורה מורה',
      studentName: 'ילד מורה',
      email: 'teacher-subscription@example.test',
      password: 'SafePass123!',
      confirmPassword: 'SafePass123!',
    }),
  });
  assert.equal(personalRegistration.status, 201);
  const summerCookie = (personalRegistration.headers.get('set-cookie') || '').split(';')[0];
  const activatePersonal = await fetch(`${baseUrl}/api/summer/activate-subscription`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: summerCookie },
    body: '{}',
  });
  assert.equal(activatePersonal.status, 200);
  const teacherWithSubscription = `${teacherCookie}; ${summerCookie}`;
  const teacherStillRestricted = await fetch(`${baseUrl}/minecraft.html`, { headers: { Cookie: teacherWithSubscription }, redirect: 'manual' });
  assert.equal(teacherStillRestricted.status, 402);
  assert.match(await teacherStillRestricted.text(), /מנהלת המערכת יכולה לפתוח את הלומדה למורה/);
  console.log('✓ a teacher can open only courses assigned by the administrator');

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
  const forbiddenCourseChange = await fetch(`${baseUrl}/api/classroom/classes/${classBody.classroom.id}/courses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: secondTeacherCookie },
    body: JSON.stringify({ courses: ['minecraft'] }),
  });
  assert.equal(forbiddenCourseChange.status, 404);
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
  assert.deepEqual(await guestMe.json(), { ok: true, role: 'guest', subscriptionGateEnabled: true });

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

  const classroomPersonalProgress = await fetch(`${baseUrl}/api/progress`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: studentCookie },
    body: JSON.stringify({ courseId: 'python-turtle', lessonId: '1', activityId: 'exercise-1', status: 'completed', score: 100 }),
  });
  const classroomPersonalProgressBody = await classroomPersonalProgress.json();
  assert.equal(classroomPersonalProgress.status, 200);
  assert.equal(classroomPersonalProgressBody.saved, false);
  assert.equal(classroomPersonalProgressBody.accessMode, 'classroom');
  const classroomPersonalList = await fetch(`${baseUrl}/api/progress?courseId=python-turtle`, { headers: { Cookie: studentCookie } });
  assert.deepEqual(await classroomPersonalList.json(), { ok: true, progress: [], accessMode: 'classroom' });
  console.log('✓ classroom mode cannot also write to personal subscription progress');

  const blockedGuestCourse = await fetch(`${baseUrl}/python-turtle.html`, { redirect: 'manual' });
  assert.equal(blockedGuestCourse.status, 402);
  const classroomCourse = await fetch(`${baseUrl}/python-turtle.html`, { headers: { Cookie: studentCookie }, redirect: 'manual' });
  assert.equal(classroomCourse.status, 200);
  const sisiWeatherLesson = await fetch(`${baseUrl}/weather.html`, { headers: { Cookie: studentCookie }, redirect: 'manual' });
  assert.equal(sisiWeatherLesson.status, 200);
  for (const linkedStudentPage of ['/smart-city.html', '/python-turtle-course.html', '/webcode-share.html']) {
    const response = await fetch(`${baseUrl}${linkedStudentPage}`, { headers: { Cookie: studentCookie }, redirect: 'manual' });
    assert.equal(response.status, 200, `${linkedStudentPage} must open inside its assigned course`);
  }
  const unassignedMinecraft = await fetch(`${baseUrl}/minecraft.html`, { headers: { Cookie: studentCookie }, redirect: 'manual' });
  assert.equal(unassignedMinecraft.status, 402);
  assert.match(await unassignedMinecraft.text(), /הלומדה לא פתוחה לכיתה הזו/);
  const studentWithSubscription = await fetch(`${baseUrl}/minecraft.html`, {
    headers: { Cookie: `${studentCookie}; ${summerCookie}` },
    redirect: 'manual',
  });
  assert.equal(studentWithSubscription.status, 402, 'classroom identity must not use a personal subscription to bypass class assignments');
  for (const studentPath of [
    '/craftom-school/preview/index.html',
    '/craftom-minecraft-lesson-1.html',
    '/craftom-agent-academy.html?lesson=1',
    '/craftom-minecraft-challenge.html?challenge=1',
    '/craftom-minecraft-students.html?challenge=1',
  ]) {
    const craftomStudentPage = await fetch(`${baseUrl}${studentPath}`, { headers: { Cookie: studentCookie }, redirect: 'manual' });
    assert.equal(craftomStudentPage.status, 402, `${studentPath} must stay blocked when Craftom is not assigned to the class`);
  }
  const craftomTeacherSlides = await fetch(`${baseUrl}/craftom-minecraft-slides.html?challenge=1`, { headers: { Cookie: studentCookie }, redirect: 'manual' });
  assert.equal(craftomTeacherSlides.status, 402);
  const unrelatedProtectedPage = await fetch(`${baseUrl}/venture-ai.html`, { headers: { Cookie: studentCookie }, redirect: 'manual' });
  assert.equal(unrelatedProtectedPage.status, 402);
  const teacherMaterials = await fetch(`${baseUrl}/python-turtle-slides.html`, { headers: { Cookie: studentCookie }, redirect: 'manual' });
  assert.equal(teacherMaterials.status, 402);
  console.log('✓ subscription gate admits classroom students without admitting unauthenticated guests');

  const createCraftomClass = await fetch(`${baseUrl}/api/classroom/classes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: teacherCookie },
    body: JSON.stringify({ name: 'כיתת קראפטום', courses: ['craftom-agent'] }),
  });
  const craftomClass = (await createCraftomClass.json()).classroom;
  assert.equal(createCraftomClass.status, 201);
  const addCraftomStudent = await fetch(`${baseUrl}/api/classroom/classes/${craftomClass.id}/students`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: teacherCookie },
    body: JSON.stringify({ name: 'תלמיד קראפטום' }),
  });
  const craftomStudent = (await addCraftomStudent.json()).student;
  assert.equal(addCraftomStudent.status, 201);
  const craftomStudentLogin = await fetch(`${baseUrl}/api/classroom/student-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ classCode: craftomClass.joinCode, personalCode: craftomStudent.loginCode }),
  });
  assert.equal(craftomStudentLogin.status, 200);
  const craftomStudentCookie = (craftomStudentLogin.headers.get('set-cookie') || '').split(';')[0];
  const blockedCraftomLessonOne = await fetch(`${baseUrl}/craftom-minecraft-lesson-1.html`, { headers: { Cookie: craftomStudentCookie }, redirect: 'manual' });
  assert.equal(blockedCraftomLessonOne.status, 423);
  assert.match(await blockedCraftomLessonOne.text(), /כדי לעבור לשיעור 1 צריך להשלים קודם את שיעור 0/);
  const forgedLessonZeroCompletion = await fetch(`${baseUrl}/api/classroom/progress`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: craftomStudentCookie },
    body: JSON.stringify({ courseId: 'craftom-agent', lessonId: '0', activityId: 'minecraft-maze', status: 'completed', score: 100 }),
  });
  assert.equal(forgedLessonZeroCompletion.status, 403, 'generic classroom progress must not unlock Kugel lesson zero');
  const testDb = new Database(dbFile);
  testDb.prepare(`
    INSERT INTO classroom_progress (
      id, student_id, course_id, lesson_id, activity_id, status, score, attempts,
      metadata_json, started_at, completed_at, updated_at
    ) VALUES (?, ?, 'craftom-agent', '0', 'minecraft-maze', 'completed', 100, 1, '{}', ?, ?, ?)
  `).run('test-craftom-zero-complete', craftomStudent.id, new Date().toISOString(), new Date().toISOString(), new Date().toISOString());
  testDb.close();
  const unlockedCraftomLessonOne = await fetch(`${baseUrl}/craftom-minecraft-lesson-1.html`, { headers: { Cookie: craftomStudentCookie }, redirect: 'manual' });
  assert.equal(unlockedCraftomLessonOne.status, 200);
  console.log('✓ Craftom lesson 1 requires verified lesson 0 completion for classroom students');

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

  const updateBeyondTeacherCatalog = await fetch(`${baseUrl}/api/classroom/classes/${classBody.classroom.id}/courses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: teacherCookie },
    body: JSON.stringify({ courses: ['minecraft'] }),
  });
  assert.equal(updateBeyondTeacherCatalog.status, 403);

  const expandTeacherCourses = await fetch(`${baseUrl}/api/classroom/admin/teachers/${body.teacher.id}/courses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({ courses: ['craftom-agent', 'minecraft', 'webcode', 'python-turtle', 'sisi', 'sensi-city'] }),
  });
  assert.equal(expandTeacherCourses.status, 200);

  const updateCourses = await fetch(`${baseUrl}/api/classroom/classes/${classBody.classroom.id}/courses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: teacherCookie },
    body: JSON.stringify({ courses: ['craftom-agent', 'minecraft'] }),
  });
  const updateCoursesBody = await updateCourses.json();
  assert.equal(updateCourses.status, 200);
  assert.deepEqual(updateCoursesBody.classroom.courses, ['minecraft', 'craftom-agent']);
  const updatedStudentPython = await fetch(`${baseUrl}/python-turtle.html`, { headers: { Cookie: studentCookie }, redirect: 'manual' });
  assert.equal(updatedStudentPython.status, 402);
  const updatedStudentCraftom = await fetch(`${baseUrl}/craftom-agent-academy.html?lesson=1`, { headers: { Cookie: studentCookie }, redirect: 'manual' });
  assert.equal(updatedStudentCraftom.status, 423, 'adding Craftom to a class must still require lesson zero before lesson one');
  const updatedTeacherPython = await fetch(`${baseUrl}/python-turtle.html`, { headers: { Cookie: teacherCookie }, redirect: 'manual' });
  assert.equal(updatedTeacherPython.status, 200, 'teacher retains Python access when no class currently uses it');
  const updatedTeacherCraftom = await fetch(`${baseUrl}/craftom-agent-academy.html?lesson=1`, { headers: { Cookie: teacherCookie }, redirect: 'manual' });
  assert.equal(updatedTeacherCraftom.status, 200);
  for (const teacherResource of ['/minecraft-teachers.html', '/minecraft-slides.html?lesson=1', '/craftom-minecraft-slides.html?challenge=1']) {
    const response = await fetch(`${baseUrl}${teacherResource}`, { headers: { Cookie: teacherCookie }, redirect: 'manual' });
    assert.equal(response.status, 200, `${teacherResource} must open for the teacher when its course is assigned`);
  }
  const retainedTeacherVideo = await fetch(`${baseUrl}/api/sensi/guide-videos/lesson-1`, { headers: { Cookie: teacherCookie } });
  assert.equal(retainedTeacherVideo.status, 404, 'teacher keeps Sensi access even after removing it from every class');

  const createSensiOnlyClass = await fetch(`${baseUrl}/api/classroom/classes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: teacherCookie },
    body: JSON.stringify({ name: 'כיתת סנסי בלבד', courses: ['sensi-city'] }),
  });
  const sensiOnlyClassBody = await createSensiOnlyClass.json();
  assert.equal(createSensiOnlyClass.status, 201);

  const reduceTeacherCourses = await fetch(`${baseUrl}/api/classroom/admin/teachers/${body.teacher.id}/courses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({ courses: ['minecraft'] }),
  });
  const reducedTeacherBody = await reduceTeacherCourses.json();
  assert.equal(reduceTeacherCourses.status, 200);
  assert.deepEqual(reducedTeacherBody.teacher.courses, ['minecraft']);
  assert.deepEqual(reducedTeacherBody.affectedClasses.find((item) => item.id === classBody.classroom.id).courses, ['minecraft']);
  assert.deepEqual(reducedTeacherBody.affectedClasses.find((item) => item.id === sensiOnlyClassBody.classroom.id).courses, []);
  const persistedAdminTeachers = await fetch(`${baseUrl}/api/classroom/admin/teachers`, { headers: { Cookie: adminCookie } });
  const persistedAdminTeacher = (await persistedAdminTeachers.json()).teachers.find((item) => item.id === body.teacher.id);
  assert.deepEqual(persistedAdminTeacher.classes.find((item) => item.id === sensiOnlyClassBody.classroom.id).courses, [], 'an intentionally empty class must not receive the one-time legacy backfill again');
  const teacherCraftomAfterRemoval = await fetch(`${baseUrl}/craftom-agent-academy.html?lesson=1`, { headers: { Cookie: teacherCookie }, redirect: 'manual' });
  assert.equal(teacherCraftomAfterRemoval.status, 402);
  const studentCraftomAfterRemoval = await fetch(`${baseUrl}/craftom-agent-academy.html?lesson=1`, { headers: { Cookie: studentCookie }, redirect: 'manual' });
  assert.equal(studentCraftomAfterRemoval.status, 402);
  const removedTeacherVideo = await fetch(`${baseUrl}/api/sensi/guide-videos/lesson-1`, { headers: { Cookie: teacherCookie } });
  assert.equal(removedTeacherVideo.status, 403);
  console.log('✓ removing a teacher entitlement atomically removes it from the teacher’s classes');
  const blockedUnassignedProgress = await fetch(`${baseUrl}/api/classroom/progress`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: studentCookie },
    body: JSON.stringify({ courseId: 'python-turtle', lessonId: 'course', activityId: 'blocked-after-update', status: 'started' }),
  });
  assert.equal(blockedUnassignedProgress.status, 403);
  console.log('✓ course changes immediately update teacher, student, and progress permissions');

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

  const targetedEmail = 'targeted@example.test';
  for (let attempt = 0; attempt < 10; attempt += 1) {
    await fetch(`${baseUrl}/api/classroom/teacher-login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: targetedEmail, password: 'wrong-password' }),
    });
  }
  const targetBeforeFlood = await fetch(`${baseUrl}/api/classroom/teacher-login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: targetedEmail, password: 'wrong-password' }),
  });
  assert.equal(targetBeforeFlood.status, 429);
  const floodStatuses = [];
  for (let index = 0; index < 20; index += 1) {
    const floodAttempt = await fetch(`${baseUrl}/api/classroom/teacher-login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: `flood-${index}@example.test`, password: 'wrong-password' }),
    });
    floodStatuses.push(floodAttempt.status);
  }
  assert.equal(floodStatuses.at(-1), 429, 'unseen identifiers must fail closed after the limiter reaches capacity');
  const targetAfterFlood = await fetch(`${baseUrl}/api/classroom/teacher-login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: targetedEmail, password: 'wrong-password' }),
  });
  assert.equal(targetAfterFlood.status, 429);
  console.log('✓ flooding new limiter keys cannot evict an active lockout');

  const adminLogout = await fetch(`${baseUrl}/api/classroom/admin-logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: '{}',
  });
  assert.equal(adminLogout.status, 200);
  assert.match(adminLogout.headers.get('set-cookie') || '', /Max-Age=0/);
  const adminAfterLogout = await fetch(`${baseUrl}/api/classroom/admin-me`, { headers: { Cookie: adminCookie } });
  assert.equal((await adminAfterLogout.json()).role, 'guest');
  const teachersAfterAdminLogout = await fetch(`${baseUrl}/api/classroom/admin/teachers`, { headers: { Cookie: adminCookie } });
  assert.equal(teachersAfterAdminLogout.status, 401);
  console.log('✓ administrator logout revokes the separate secure session');

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
