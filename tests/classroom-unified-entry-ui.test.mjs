import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(join(root, path), 'utf8');
const entryHtml = read('classroom-entry.html');

assert.ok(entryHtml.includes('id="guest-continue"'), 'guest choice must remain');
assert.ok(entryHtml.includes('id="subscription-continue"'), 'personal subscription choice must remain');
assert.ok(entryHtml.includes('id="classroom-login-form"'), 'one unified classroom form is required');
assert.ok(entryHtml.includes('name="identifier"'));
assert.match(entryHtml, /name="password"[^>]*type="password"[^>]*autocomplete="current-password"/);
assert.ok(entryHtml.includes('id="classroom-password-toggle"'));
assert.equal(entryHtml.includes('id="student-login-form"'), false, 'the entry page must not retain a second student-only form');
assert.ok(entryHtml.includes('js/classroom-entry.js'));
assert.ok(existsSync(join(root, 'js/classroom-entry.js')));
assert.ok(existsSync(join(root, 'classroom-student.html')), 'dedicated classroom student landing page is required');
assert.ok(existsSync(join(root, 'js/classroom-student.js')));

const entryClient = read('js/classroom-entry.js');
const studentHtml = read('classroom-student.html');
const studentClient = read('js/classroom-student.js');
const server = read('server.js');
const classroomApiSource = server.slice(server.indexOf('async function handleClassroomApi'), server.indexOf('const PUBLIC_HTML_PATHS'));
assert.ok(entryClient.includes('/api/classroom/teacher-login'));
assert.ok(entryClient.includes('/api/classroom/student-login'));
assert.equal(entryClient.includes('/api/classroom/login'), false, 'unified UI must reuse the hardened legacy authentication endpoints');
assert.equal(classroomApiSource.includes("if (action === 'login')"), false, 'unified UI must not add a duplicate classroom authentication implementation');
assert.ok(entryClient.includes("location.assign('teacher-classrooms.html')"));
assert.ok(entryClient.includes("location.assign('classroom-student.html')"));
assert.equal(entryClient.includes('data.nextUrl'), false, 'client redirects must not trust a server-controlled URL');
assert.equal(entryClient.includes('innerHTML'), false);
assert.equal(studentClient.includes('innerHTML'), false, 'student data must never be rendered with innerHTML');
assert.equal(studentClient.includes('localStorage'), false, 'classroom credentials belong only in HttpOnly cookies');
assert.ok(studentHtml.includes('id="classroom-student-name"'));
assert.ok(studentHtml.includes('id="classroom-name"'));
assert.ok(studentHtml.includes('id="classroom-student-courses"'));
assert.ok(studentHtml.includes('id="classroom-student-logout"'));

class FakeElement {
  constructor(id = '') {
    this.id = id;
    this.hidden = false;
    this.disabled = false;
    this.href = '';
    this.type = 'button';
    this.textContent = '';
    this.children = [];
    this.listeners = {};
    this.attributes = {};
    this.classList = { toggle() {}, add() {}, remove() {} };
  }
  addEventListener(type, listener) { this.listeners[type] = listener; }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = children; }
  reset() {}
}

function entryVm(loginData, identifier = 'person@example.test') {
  const ids = ['guest-continue', 'subscription-continue', 'classroom-login-form', 'classroom-login-message', 'classroom-password', 'classroom-password-toggle', 'preview-demo-student'];
  const elements = Object.fromEntries(ids.map((id) => [id, new FakeElement(id)]));
  elements['classroom-password'].type = 'password';
  const requests = [];
  const assignments = [];
  const context = {
    document: { body: { dataset: { classroomPage: 'entry' } }, getElementById: (id) => elements[id] || null },
    location: { search: '?next=python-turtle.html', assign: (url) => assignments.push(url) },
    URLSearchParams,
    FormData: class { entries() { return [['identifier', identifier], ['password', 'SecretPass123!']]; } },
    localStorage: { getItem: () => '', removeItem() {} },
    fetch: async (path, options = {}) => {
      requests.push({ path, options });
      if (path === '/api/classroom/me') return { ok: true, json: async () => ({ role: 'guest', subscriptionGateEnabled: true }) };
      if (path === '/api/classroom/preview-demo-student-enabled') return { ok: true, json: async () => ({ enabled: true }) };
      if (path === '/api/classroom/teacher-login' || path === '/api/classroom/student-login') return { ok: true, json: async () => loginData };
      if (path === '/api/classroom/preview-demo-student-login') return { ok: true, json: async () => ({ role: 'student' }) };
      return { ok: true, json: async () => ({ ok: true }) };
    },
    setTimeout,
  };
  vm.runInNewContext(entryClient, context);
  return { elements, requests, assignments };
}

const teacherEntry = entryVm({ role: 'teacher', nextUrl: 'https://evil.example/' });
await new Promise((resolve) => setTimeout(resolve, 0));
await teacherEntry.elements['classroom-login-form'].listeners.submit({ preventDefault() {}, currentTarget: teacherEntry.elements['classroom-login-form'] });
assert.deepEqual(teacherEntry.assignments, ['teacher-classrooms.html']);
const loginRequest = teacherEntry.requests.find((request) => request.path === '/api/classroom/teacher-login');
assert.deepEqual(JSON.parse(loginRequest.options.body), { email: 'person@example.test', password: 'SecretPass123!' });
assert.equal(loginRequest.options.credentials, 'same-origin');

teacherEntry.elements['classroom-password-toggle'].listeners.click();
assert.equal(teacherEntry.elements['classroom-password'].type, 'text');
assert.equal(teacherEntry.elements['classroom-password-toggle'].attributes['aria-pressed'], 'true');
teacherEntry.elements['classroom-password-toggle'].listeners.click();
assert.equal(teacherEntry.elements['classroom-password'].type, 'password');
assert.equal(teacherEntry.elements['classroom-password-toggle'].attributes['aria-pressed'], 'false');

const studentEntry = entryVm({ role: 'student' }, 'CLASS42');
await new Promise((resolve) => setTimeout(resolve, 0));
await studentEntry.elements['classroom-login-form'].listeners.submit({ preventDefault() {}, currentTarget: studentEntry.elements['classroom-login-form'] });
assert.deepEqual(studentEntry.assignments, ['classroom-student.html']);
const studentLoginRequest = studentEntry.requests.find((request) => request.path === '/api/classroom/student-login');
assert.deepEqual(JSON.parse(studentLoginRequest.options.body), { classCode: 'CLASS42', personalCode: 'SecretPass123!' });
studentEntry.assignments.length = 0;
await studentEntry.elements['preview-demo-student'].listeners.click();
assert.deepEqual(studentEntry.assignments, ['classroom-student.html'], 'preview students must use the dedicated landing page');
console.log('✓ unified classroom entry keeps safe choices, password toggle, and role redirects');

function studentVm(me) {
  const ids = ['classroom-student-name', 'classroom-name', 'classroom-student-courses', 'classroom-student-message', 'classroom-student-logout'];
  const elements = Object.fromEntries(ids.map((id) => [id, new FakeElement(id)]));
  const assignments = [];
  const requests = [];
  const context = {
    document: {
      body: { dataset: { classroomPage: 'student' } },
      getElementById: (id) => elements[id] || null,
      createElement: (tag) => { const element = new FakeElement(); element.tagName = tag.toUpperCase(); return element; },
    },
    location: { assign: (url) => assignments.push(url) },
    fetch: async (path, options = {}) => {
      requests.push({ path, options });
      if (path === '/api/classroom/me') return { ok: true, json: async () => me };
      return { ok: true, json: async () => ({ ok: true }) };
    },
    setTimeout,
  };
  vm.runInNewContext(studentClient, context);
  return { elements, assignments, requests };
}

const studentPage = studentVm({
  role: 'student',
  student: { name: '<img src=x onerror=alert(1)>' },
  classroom: { name: '<script>alert(1)</script>', courses: ['sisi', 'python-turtle', 'unknown-course'] },
});
await new Promise((resolve) => setTimeout(resolve, 0));
assert.equal(studentPage.elements['classroom-student-name'].textContent, '<img src=x onerror=alert(1)>');
assert.equal(studentPage.elements['classroom-name'].textContent, '<script>alert(1)</script>');
assert.deepEqual(studentPage.elements['classroom-student-courses'].children.map((link) => link.textContent), ['סיסי', 'Python Turtle']);
assert.deepEqual(studentPage.elements['classroom-student-courses'].children.map((link) => link.href), ['sisi.html', 'python-turtle.html']);
await studentPage.elements['classroom-student-logout'].listeners.click();
assert.equal(studentPage.requests.at(-1).path, '/api/classroom/logout');
assert.deepEqual(studentPage.assignments, ['classroom-entry.html']);

for (const role of ['guest', 'teacher']) {
  const wrongRole = studentVm({ role });
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.deepEqual(wrongRole.assignments, ['classroom-entry.html']);
}
console.log('✓ student landing page safely renders current entitlements and rejects non-students');
