import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import Database from 'better-sqlite3';

const root = new URL('..', import.meta.url).pathname;
const port = 4300 + Math.floor(Math.random() * 1000);
const dataDir = mkdtempSync(join(tmpdir(), 'webcode-quick-class-'));

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
}

const webcode = read('webcode.html');
const quickClassroom = read('quick-classroom.html');
const quickClassroomEmbed = read('js/quick-classroom-embed.js');
const quickClassroomEmbedCss = read('css/quick-classroom-embed.css');
const sisi = read('sisi.html');
const minecraft = read('minecraft.html');
const pythonTurtle = read('python-turtle.html');
const sensiCity = read('sensi-city.html');
const teacher = read('webcode-teacher.html');
const server = read('server.js');

assert.match(webcode, /אני תלמיד\/ה בכיתה/, 'WebCode should expose a student class login path');
assert.match(webcode, /כניסה כאורח|להמשיך מהמקום האחרון|להתחיל שיעור 1/, 'WebCode should keep the guest/local path');
assert.match(webcode, /הסימון שלי/, 'WebCode student login should use a personal marker');
assert.match(webcode, /webcodeRegisterName/, 'WebCode teacher registration should ask for a teacher name');
assert.match(webcode, /webcodeRegisterEmail/, 'WebCode teacher registration should ask for a teacher email');
assert.match(webcode, /webcodeRegisterPassword/, 'WebCode teacher registration should ask for a password');
assert.match(webcode, /webcodeLoginEmail/, 'WebCode should let teachers log in by email');
assert.match(webcode, /\/api\/webcode\/teacher-register/, 'WebCode should create teacher accounts without a class');
assert.match(webcode, /\/api\/webcode\/teacher-login/, 'WebCode should let teachers log in');
assert.match(webcode, /\/api\/webcode\/teacher-class/, 'WebCode should create classes after teacher login');
assert.match(webcode, /\/api\/webcode\/teacher-home/, 'WebCode should load a teacher home with many classes');
assert.match(webcode, /webcodeClassCourse/, 'teacher class creation should require choosing an allowed course');
assert.match(webcode, /webcodeTeacherClasses\.filter/, 'WebCode teacher home should filter listed classes by selected course');
assert.match(webcode, /webcodeClassCourse'\)\?\.addEventListener\('change', renderTeacherClasses\)/, 'WebCode course selector should refresh the class list');
assert.match(quickClassroom, /teacherClasses\.filter/, 'general quick classroom should filter listed classes by selected course');
assert.match(quickClassroom, /classCourse'\)\.addEventListener\('change', renderTeacherClasses\)/, 'general quick classroom selector should refresh the class list');
assert.match(quickClassroom, /requestedCourseId/, 'general quick classroom should accept a course preselection query');
assert.match(webcode, /\/api\/webcode\/student-login/, 'WebCode student login should call the quick WebCode endpoint');
assert.match(quickClassroomEmbed, /\/api\/webcode\/student-login/, 'shared course entry should use the quick classroom student login endpoint');
assert.match(quickClassroomEmbed, /quick-classroom\.html\?course=sisi/, 'shared course entry should deep-link teachers to Sisi class creation');
assert.match(quickClassroomEmbed, /quick-classroom\.html\?course=python-turtle/, 'shared course entry should deep-link teachers to Python class creation');
assert.match(quickClassroomEmbed, /quick-classroom\.html\?course=sensi-city/, 'shared course entry should deep-link teachers to Sensi class creation');
assert.match(quickClassroomEmbed, /quick-classroom\.html\?course=minecraft/, 'shared course entry should deep-link teachers to Minecraft class creation');
assert.match(quickClassroomEmbedCss, /\.qce-panel/, 'shared course entry should include a full panel mode');
assert.match(quickClassroomEmbedCss, /\.qce-dock/, 'shared course entry should include a dock mode for app-like learning screens');
assert.match(quickClassroomEmbedCss, /\.qce-gate/, 'shared course entry should include a gate mode for full-screen learning apps');
assert.match(sisi, /data-course="sisi" data-mode="panel"/, 'Sisi course page should expose embedded classroom login');
assert.match(minecraft, /data-course="minecraft" data-mode="panel"/, 'Minecraft course page should expose embedded classroom login');
assert.match(pythonTurtle, /data-course="python-turtle" data-mode="gate"/, 'Python Turtle app screen should require a classroom decision at entry');
assert.match(sensiCity, /data-course="sensi-city" data-mode="gate"/, 'Sensi app screen should require a classroom decision at entry');
assert.match(sensiCity, /js\/classroom-session\.js/, 'Sensi should save classroom progress after quick-classroom student login');
assert.match(teacher, /כתבי את הקוד על הלוח/, 'teacher dashboard should show the class-code flow');
assert.match(teacher, /setInterval\(\(\) => loadClass\(\)\.catch\(\(\) => \{\}\), 60000\)/, 'teacher dashboard should refresh once a minute');
assert.doesNotMatch(teacher, /!classroomId\s*\|\|\s*!token/, 'teacher dashboard should allow authenticated teacher links without a token');
assert.match(server, /createWebCodeTeacherAccount/, 'server should create WebCode teacher accounts before classes');

const child = spawn(process.execPath, ['server.js'], {
  cwd: root,
  env: {
    ...process.env,
    NODE_ENV: 'test',
    PORT: String(port),
    ROBOTICS_DATA_DIR: dataDir,
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});

async function waitForServer() {
  const deadline = Date.now() + 8000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/api/classroom/me`);
      if (response.ok) return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error('server did not start');
}

async function post(path, body, cookie = '') {
  const response = await fetch(`http://127.0.0.1:${port}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  assert.equal(response.ok, true, data.error || `request failed: ${path}`);
  return { data, cookie: response.headers.get('set-cookie') || '' };
}

try {
  await waitForServer();
  const registered = await post('/api/webcode/teacher-register', {
    name: 'חני',
    email: 'hani@example.test',
    password: 'secret1',
  });
  assert.equal(registered.data.teacher.email, 'hani@example.test');

  const homeBeforeClass = await fetch(`http://127.0.0.1:${port}/api/webcode/teacher-home`, {
    headers: { Cookie: registered.cookie },
  }).then(response => response.json());
  assert.equal(homeBeforeClass.ok, true);
  assert.equal(homeBeforeClass.classes.length, 0, 'teacher account should be created before any class');
  assert.deepEqual(homeBeforeClass.availableCourses.map(course => course.id), ['webcode'], 'new WebCode teachers start with only the default allowed course');

  const created = await post('/api/webcode/teacher-class', { name: 'כיתה מהירה' }, registered.cookie);
  assert.match(created.data.classroom.joinCode, /^\d{4}$/, 'quick class code should be child-friendly digits');
  assert.match(created.data.classroom.teacherUrl, /^\/webcode-teacher\.html\?classroom=/, 'teacher should receive a scoped management link');

  const login = await post('/api/webcode/student-login', {
    classCode: created.data.classroom.joinCode,
    name: 'נועה',
    markerColor: 'blue',
    markerShape: 'circle',
  });
  assert.equal(login.data.student.name, 'נועה');
  assert.equal(login.data.student.marker.shape, 'circle');
  assert.match(login.cookie, /haiTechClassroomToken=/, 'student login should create the existing classroom session cookie');

  await post('/api/classroom/progress', {
    courseId: 'webcode',
    lessonId: '1',
    activityId: 'exercise-1',
    status: 'completed',
    score: 100,
  }, login.cookie);

  const teacherUrl = new URL(`http://127.0.0.1:${port}${created.data.classroom.teacherUrl}`);
  const dashboard = await fetch(`http://127.0.0.1:${port}/api/webcode/quick-class/${teacherUrl.searchParams.get('classroom')}`, {
    headers: { Cookie: registered.cookie },
  }).then(response => response.json());
  assert.equal(dashboard.ok, true);
  assert.equal(dashboard.students.length, 1);
  assert.equal(dashboard.students[0].name, 'נועה');
  assert.ok(dashboard.students[0].progress.some(row => row.activityId === 'exercise-1' && row.status === 'completed'), 'teacher dashboard should show saved progress');

  const second = await post('/api/webcode/teacher-class', { name: 'כיתה שנייה' }, registered.cookie);
  assert.equal(second.data.deliveryStatus, 'sent', 'test mode should email newly created class links');

  const db = new Database(join(dataDir, 'summer-subscriptions.sqlite'));
  db.prepare('INSERT OR IGNORE INTO teacher_courses (teacher_id, course_id, created_at) VALUES (?, ?, ?)')
    .run(registered.data.teacher.id, 'python-turtle', new Date().toISOString());
  db.close();

  const homeAfterAdminGrant = await fetch(`http://127.0.0.1:${port}/api/webcode/teacher-home`, {
    headers: { Cookie: registered.cookie },
  }).then(response => response.json());
  assert.ok(homeAfterAdminGrant.availableCourses.some(course => course.id === 'python-turtle'), 'admin-granted courses should appear in class creation');

  const pythonClass = await post('/api/webcode/teacher-class', { name: 'פייתון צבים', courseId: 'python-turtle' }, registered.cookie);
  assert.equal(pythonClass.data.classroom.course.id, 'python-turtle', 'teacher can create a class for an admin-allowed course');
  const pythonStudent = await post('/api/webcode/student-login', {
    classCode: pythonClass.data.classroom.joinCode,
    name: 'מאיה',
    markerColor: 'green',
    markerShape: 'star',
  });
  assert.equal(pythonStudent.data.startUrl, 'python-turtle.html?lesson=1', 'student login should continue to the selected course');

  await post('/api/classroom/progress', {
    courseId: 'python-turtle',
    lessonId: '1',
    activityId: 'exercise-1',
    status: 'completed',
    score: 100,
  }, pythonStudent.cookie);

  const pythonTeacherUrl = new URL(`http://127.0.0.1:${port}${pythonClass.data.classroom.teacherUrl}`);
  const pythonDashboard = await fetch(`http://127.0.0.1:${port}/api/webcode/quick-class/${pythonTeacherUrl.searchParams.get('classroom')}`, {
    headers: { Cookie: registered.cookie },
  }).then(response => response.json());
  assert.equal(pythonDashboard.classroom.course.id, 'python-turtle');
  assert.ok(pythonDashboard.students[0].progress.some(row => row.courseId === 'python-turtle'), 'course dashboard should show progress for the selected course');

  const loginTeacher = await post('/api/webcode/teacher-login', {
    email: 'hani@example.test',
    password: 'secret1',
  });
  const homeAfterLogin = await fetch(`http://127.0.0.1:${port}/api/webcode/teacher-home`, {
    headers: { Cookie: loginTeacher.cookie },
  }).then(response => response.json());
  assert.equal(homeAfterLogin.classes.length, 3, 'teacher should see many classes after login');
} finally {
  child.kill('SIGTERM');
  rmSync(dataDir, { recursive: true, force: true });
}

console.log('✓ WebCode quick classes create a code-only class, student sub-account, marker, and teacher progress view');
