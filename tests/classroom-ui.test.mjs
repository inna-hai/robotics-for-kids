import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const read = (path) => readFileSync(join(root, path), 'utf8');

const index = read('index.html');
const entry = read('classroom-entry.html');
const teacher = read('teacher-classrooms.html');
const client = read('js/classroom-platform.js');
const sessionClient = read('js/classroom-session.js');
const styles = read('css/classroom-platform.css');
const server = read('server.js');
const packageJson = read('package.json');

for (const next of [
  'sensi-city.html?lesson=1',
  'sisi.html',
  'python-turtle.html',
  'webcode.html',
  'minecraft.html',
  'craftom-school/preview/index.html',
]) {
  assert.ok(index.includes(`classroom-entry.html?next=${encodeURIComponent(next)}`), `Missing shared entry link for ${next}`);
}

assert.ok(entry.includes('id="guest-continue"'));
assert.ok(entry.includes('id="student-login-form"'));
assert.ok(entry.includes('id="student-logout"'));
assert.ok(entry.includes('להמשיך בלי התחברות'));
assert.ok(entry.includes('קוד כיתה'));
assert.ok(entry.includes('קוד אישי'));
assert.ok(entry.includes('teacher-classrooms.html'));

assert.ok(teacher.includes('id="teacher-login-form"'));
assert.ok(teacher.includes('id="teacher-register-form"'));
assert.ok(teacher.includes('name="inviteCode"'));
assert.ok(teacher.includes('id="create-class-form"'));
assert.ok(teacher.includes('id="classes-list"'));
assert.ok(teacher.includes('יצירת כיתה'));

assert.ok(client.includes('/api/classroom/teacher-login'));
assert.ok(client.includes('/api/classroom/teacher-register'));
assert.ok(client.includes('/api/classroom/student-login'));
assert.ok(client.includes('/api/classroom/classes'));
assert.ok(client.includes('/api/classroom/logout'));
assert.ok(client.includes("guest.addEventListener('click'"));
assert.ok(client.includes("document.getElementById('student-logout')"));
assert.ok(!client.includes('localStorage'), 'classroom credentials must stay in HttpOnly cookies');
for (const courseId of ['sensi-city', 'sisi', 'python-turtle', 'webcode', 'minecraft', 'craftom-agent']) {
  assert.ok(sessionClient.includes(courseId), `Missing classroom progress adapter for ${courseId}`);
}
assert.ok(sessionClient.includes('|weather|'), 'Sisi weather lesson must be mapped to classroom progress');
assert.ok(sessionClient.includes('/api/classroom/progress'));
assert.ok(sessionClient.includes('hai:classroom-progress'));
assert.ok(server.includes('injectClassroomSession'));
assert.ok(server.includes("'/classroom-entry.html'"));
assert.ok(server.includes("'/teacher-classrooms.html'"));
assert.ok(packageJson.includes('node --check js/classroom-platform.js'));
assert.ok(packageJson.includes('node --check js/classroom-session.js'));
assert.ok(styles.includes('@media'));

const progressRequests = [];
const classroomWindow = { addEventListener() {} };
const classroomLocation = { pathname: '/space.html', search: '', assign() {} };
const classroomContext = {
  window: classroomWindow,
  location: classroomLocation,
  URLSearchParams,
  document: {
    body: { append() {} },
    createElement() { return { setAttribute() {}, style: {}, textContent: '' }; },
  },
  fetch: async (path, options = {}) => {
    if (path === '/api/classroom/me') return { ok: true, json: async () => ({ role: 'student', student: { name: 'דנה' }, classroom: { name: 'כיתה' } }) };
    progressRequests.push(JSON.parse(options.body));
    return { ok: true, json: async () => ({ ok: true }) };
  },
};
vm.runInNewContext(sessionClient, classroomContext);
await new Promise((resolve) => setTimeout(resolve, 0));
assert.equal(progressRequests[0].courseId, 'sisi');
assert.equal(progressRequests[0].lessonId, 'space');
classroomLocation.search = '?lesson=7';
await classroomWindow.ClassroomProgress.save({ activityId: 'lesson-check' });
assert.equal(progressRequests.at(-1).lessonId, '7');

console.log('✓ classroom entry and teacher dashboard cover all six active courses');
