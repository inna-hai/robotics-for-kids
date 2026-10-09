import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const port = 4300 + Math.floor(Math.random() * 1000);
const dataDir = mkdtempSync(join(tmpdir(), 'webcode-quick-class-'));

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
}

const webcode = read('webcode.html');
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
assert.match(webcode, /\/api\/webcode\/student-login/, 'WebCode student login should call the quick WebCode endpoint');
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

  const loginTeacher = await post('/api/webcode/teacher-login', {
    email: 'hani@example.test',
    password: 'secret1',
  });
  const homeAfterLogin = await fetch(`http://127.0.0.1:${port}/api/webcode/teacher-home`, {
    headers: { Cookie: loginTeacher.cookie },
  }).then(response => response.json());
  assert.equal(homeAfterLogin.classes.length, 2, 'teacher should see many classes after login');
} finally {
  child.kill('SIGTERM');
  rmSync(dataDir, { recursive: true, force: true });
}

console.log('✓ WebCode quick classes create a code-only class, student sub-account, marker, and teacher progress view');
