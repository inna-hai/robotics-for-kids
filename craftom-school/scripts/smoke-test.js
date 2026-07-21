const assert = require('assert');

const BASE_URL = process.env.BASE_URL || `http://127.0.0.1:${process.env.PORT || 3081}`;

async function request(method, path, body, cookie) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  const setCookie = res.headers.get('set-cookie');
  return { status: res.status, data, cookie: setCookie ? setCookie.split(';')[0] : cookie };
}

async function login(email, password) {
  const response = await request('POST', '/api/login', { email, password });
  assert.equal(response.status, 200, `login failed for ${email}`);
  assert.equal(response.data.ok, true, `login not ok for ${email}`);
  assert(response.cookie, `missing session cookie for ${email}`);
  return response.cookie;
}

async function main() {
  const runId = Date.now();
  const adminCookie = await login('admin@craftom.local', 'admin123');
  const teacherCookie = await login('teacher.demo@craftom.local', 'demo123');
  const studentCookie = await login('student1.demo@craftom.local', 'demo123');
  const secondStudentCookie = await login('student2.demo@craftom.local', 'demo123');

  const newTeacherEmail = `teacher.flow.${runId}@craftom.local`;
  const registerTeacher = await request('POST', '/api/register', {
    account_type: 'teacher',
    name: 'מורת בדיקת זרימה',
    email: newTeacherEmail,
    password: 'demo123',
  });
  assert.equal(registerTeacher.status, 200, 'new teacher should register');
  assert.equal(registerTeacher.data.status, 'pending', 'new teacher should wait for admin approval');
  const pendingLogin = await request('POST', '/api/login', { email: newTeacherEmail, password: 'demo123' });
  assert.equal(pendingLogin.status, 403, 'pending teacher should not login before approval');

  const teacherHome = await request('GET', '/api/teacher/home', null, teacherCookie);
  assert.equal(teacherHome.status, 200, 'teacher home should load');
  assert(teacherHome.data.dashboard.classes.length >= 2, 'teacher should see demo classes');
  assert(teacherHome.data.dashboard.teams.length >= 4, 'teacher should see demo teams');
  assert(teacherHome.data.dashboard.task_overview.length > 0, 'teacher task overview should not be empty');
  assert(teacherHome.data.dashboard.observations.length > 0, 'teacher should see observations');

  const adminBeforeApproval = await request('GET', '/api/teacher/home', null, adminCookie);
  const pendingTeacher = adminBeforeApproval.data.dashboard.pending_teachers.find(t => t.email === newTeacherEmail);
  assert(pendingTeacher, 'admin should see pending teacher');
  const approveTeacher = await request('POST', `/api/admin/teachers/${pendingTeacher.id}/status`, { status: 'active' }, adminCookie);
  assert.equal(approveTeacher.status, 200, 'admin should approve teacher');
  const newTeacherCookie = await login(newTeacherEmail, 'demo123');
  const newClass = await request('POST', '/api/classes', { name: 'כיתת בדיקת זרימה' }, newTeacherCookie);
  assert.equal(newClass.status, 200, 'approved teacher should create class');

  const newStudentEmail = `student.flow.${runId}@craftom.local`;
  const registerStudent = await request('POST', '/api/register', {
    account_type: 'student',
    name: 'תלמיד בדיקת זרימה',
    email: newStudentEmail,
    password: 'demo123',
    class_code: newClass.data.class.code,
  });
  assert.equal(registerStudent.status, 200, 'student should register with class code');
  assert(registerStudent.cookie, 'student registration should create a session cookie');
  const newStudentCookie = registerStudent.cookie;
  const newStudentHome = await request('GET', '/api/student/home', null, newStudentCookie);
  assert.equal(newStudentHome.status, 200, 'new student home should load');
  assert.equal(newStudentHome.data.dashboard.class.code, newClass.data.class.code, 'new student should join created class');

  const newTeam = await request('POST', '/api/teams', { name: 'צוות בדיקת זרימה', class_id: newClass.data.class.id }, newTeacherCookie);
  assert.equal(newTeam.status, 200, 'teacher should create team');
  const joinNewTeam = await request('POST', '/api/student/team/join', { team_code: newTeam.data.team.code }, newStudentCookie);
  assert.equal(joinNewTeam.status, 200, 'student should join matching team');

  const studentHome = await request('GET', '/api/student/home', null, studentCookie);
  assert.equal(studentHome.status, 200, 'student home should load');
  assert.equal(studentHome.data.dashboard.class.code, 'CLASS-DEMO4', 'student should be linked to demo class');
  assert.equal(studentHome.data.dashboard.team.code, 'TEAM-BOLT', 'student should be linked to demo team');
  assert.equal(studentHome.data.dashboard.lessons.find(l => l.number === 2).status, 'completed', 'lesson 2 should be completed for demo student');
  assert.equal(studentHome.data.dashboard.lessons.find(l => l.number === 3).status, 'open', 'lesson 3 should be open for demo class');

  const lockedLesson = await request('GET', '/api/lessons/2', null, newStudentCookie);
  assert.equal(lockedLesson.status, 403, 'new student should not open lesson 2 before teacher unlocks it');

  const lesson2 = await request('GET', '/api/lessons/2', null, studentCookie);
  assert.equal(lesson2.status, 200, 'student should open lesson 2');

  const editableLesson = await request('GET', '/api/teacher/lessons/2/edit', null, teacherCookie);
  assert.equal(editableLesson.status, 200, 'teacher should load lesson editor data');
  const editedLesson = {
    ...editableLesson.data.lesson,
    title: 'אלגוריתם בנייה ראשון - עריכת דמו',
  };
  const editResponse = await request('POST', '/api/teacher/lessons/2/edit', editedLesson, teacherCookie);
  assert.equal(editResponse.status, 200, 'teacher should save lesson editor data');
  assert.equal(editResponse.data.lesson.edited, true, 'edited lesson should be marked edited');
  const editedLessonView = await request('GET', '/api/lessons/2', null, teacherCookie);
  assert.equal(editedLessonView.data.dashboard.lesson.title, editedLesson.title, 'lesson view should use edited lesson title');

  const teamSubmit = await request('POST', '/api/student/tasks/lesson-2-craftom/submit', {
    reflection: 'בדיקת דמו: הצוות התחיל לבנות שביל לפי רצף פעולות.',
  }, studentCookie);
  assert.equal(teamSubmit.status, 200, 'team task submission should work');

  const secondStudentLesson = await request('GET', '/api/lessons/2', null, secondStudentCookie);
  assert.equal(secondStudentLesson.status, 200, 'second team member should open lesson 2');
  const sharedTask = secondStudentLesson.data.dashboard.lesson.tasks.find(t => t.id === 'lesson-2-craftom');
  assert.equal(sharedTask.status, 'submitted', 'team submission should be visible to second team member');

  const feedback = await request('POST', `/api/teacher/submissions/${teamSubmit.data.submission.id}/feedback`, {
    status: 'completed',
    feedback: 'הצוות תיאר את סדר הפעולות בצורה ברורה.',
  }, teacherCookie);
  assert.equal(feedback.status, 200, 'teacher feedback should save');
  assert(feedback.data.submission.feedback.startsWith('כל הכבוד'), 'feedback should be friendly');

  const observation = await request('POST', '/api/teacher/observations', {
    student_id: 4,
    lesson_number: 2,
    metrics: ['collaborated', 'helped_others'],
    note: 'בדיקת דמו: שיתוף פעולה תקין.',
  }, teacherCookie);
  assert.equal(observation.status, 200, 'observation should save');

  const teacherReport = await request('GET', '/api/reports', null, teacherCookie);
  assert.equal(teacherReport.status, 200, 'teacher report should load');
  assert(teacherReport.data.report.summary.submitted_tasks >= 6, 'teacher report should include submissions');
  assert(teacherReport.data.report.teams.reports.length >= 2, 'teacher report should include team reports');
  assert(teacherReport.data.report.summary.observations >= 5, 'teacher report should include observations');

  const studentReport = await request('GET', '/api/reports', null, studentCookie);
  assert.equal(studentReport.status, 200, 'student report should load');
  assert.equal(studentReport.data.report.mode, 'student', 'student report should be personal');
  assert(studentReport.data.report.feedback.length > 0, 'student report should include feedback');

  const classUpdate = await request('POST', '/api/classes/1/open-lesson', { open_lesson: 3 }, teacherCookie);
  assert.equal(classUpdate.status, 200, 'teacher should open lesson 3');
  const unlockedLesson = await request('GET', '/api/lessons/3', null, studentCookie);
  assert.equal(unlockedLesson.status, 200, 'student should open lesson 3 after class unlock');

  const newClassUpdate = await request('POST', `/api/classes/${newClass.data.class.id}/open-lesson`, { open_lesson: 2 }, newTeacherCookie);
  assert.equal(newClassUpdate.status, 200, 'new teacher should unlock lesson 2');
  const newUnlockedLesson = await request('GET', '/api/lessons/2', null, newStudentCookie);
  assert.equal(newUnlockedLesson.status, 200, 'new student should open lesson 2 after teacher unlocks it');

  const adminHome = await request('GET', '/api/teacher/home', null, adminCookie);
  assert.equal(adminHome.status, 200, 'admin dashboard should load');

  console.log('Smoke test passed');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
