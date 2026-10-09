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
assert.match(webcode, /webcodeTeacherName/, 'WebCode teacher flow should ask for a teacher name');
assert.match(webcode, /webcodeTeacherEmail/, 'WebCode teacher flow should ask for a teacher email');
assert.match(webcode, /\/api\/webcode\/teacher-links/, 'WebCode should let teachers recover management links by email');
assert.match(webcode, /\/api\/webcode\/student-login/, 'WebCode student login should call the quick WebCode endpoint');
assert.match(webcode, /\/api\/webcode\/quick-class/, 'WebCode teacher form should create quick classes');
assert.match(teacher, /כתבי את הקוד על הלוח/, 'teacher dashboard should show the class-code flow');
assert.match(teacher, /setInterval\(\(\) => loadClass\(\)\.catch\(\(\) => \{\}\), 60000\)/, 'teacher dashboard should refresh once a minute');
assert.match(server, /WEBCODE_QUICK_TEACHER_EMAIL/, 'server should isolate WebCode quick classes from regular teacher accounts');

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
  const created = await post('/api/webcode/quick-class', { name: 'כיתה מהירה' });
  assert.match(created.data.classroom.joinCode, /^\d{4}$/, 'quick class code should be child-friendly digits');
  assert.match(created.data.teacherUrl, /^\/webcode-teacher\.html\?classroom=/, 'teacher should receive a scoped management link');

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

  const teacherUrl = new URL(`http://127.0.0.1:${port}${created.data.teacherUrl}`);
  const dashboard = await fetch(`http://127.0.0.1:${port}/api/webcode/quick-class/${teacherUrl.searchParams.get('classroom')}?token=${teacherUrl.searchParams.get('token')}`).then(response => response.json());
  assert.equal(dashboard.ok, true);
  assert.equal(dashboard.students.length, 1);
  assert.equal(dashboard.students[0].name, 'נועה');
  assert.ok(dashboard.students[0].progress.some(row => row.activityId === 'exercise-1' && row.status === 'completed'), 'teacher dashboard should show saved progress');

  const owned = await post('/api/webcode/quick-class', {
    name: 'כיתה עם מורה',
    teacherName: 'חני',
    teacherEmail: 'hani@example.test',
  });
  assert.equal(owned.data.teacher.email, 'hani@example.test');
  assert.equal(owned.data.deliveryStatus, 'sent', 'test mode should report teacher link mail as sent');
  const links = await post('/api/webcode/teacher-links', { email: 'hani@example.test' });
  assert.equal(links.data.deliveryStatus, 'sent');
  assert.equal(links.data.classCount, 1);
} finally {
  child.kill('SIGTERM');
  rmSync(dataDir, { recursive: true, force: true });
}

console.log('✓ WebCode quick classes create a code-only class, student sub-account, marker, and teacher progress view');
