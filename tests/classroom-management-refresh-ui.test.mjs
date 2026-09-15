import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../js/classroom-platform.js', import.meta.url), 'utf8');
const adminSource = readFileSync(new URL('../js/classroom-admin.js', import.meta.url), 'utf8');
assert.equal((source.match(/await loadClasses\(\)/g) || []).length, 2,
  'teacher mutations must refresh only through the guarded refresh helper');
assert.equal((adminSource.match(/await loadTeachers\(\)/g) || []).length, 3,
  'admin mutations must refresh only through guarded helper/create flow, never a mutation catch');
assert.ok(!readFileSync(new URL('../classroom-admin.html', import.meta.url), 'utf8').includes('name="password"'),
  'administrator teacher-create UI must not send a password field');
assert.ok(source.includes('function clearOneTimeStudentCodes()'),
  'teacher UI must centralize removal of one-time credentials from state and every rendered classroom card');
assert.ok((source.match(/clearOneTimeStudentCodes\(\)/g) || []).length >= 4,
  'teacher UI must clear prior credentials before create/reset and on logout');
assert.ok((adminSource.match(/oneTimePassword\.textContent = ''/g) || []).length >= 2,
  'administrator UI must clear stale one-time passwords before another create attempt and on logout');

class FakeElement {
  constructor(tag = 'div', id = '') {
    this.tag = tag; this.id = id; this.children = []; this.listeners = {}; this.dataset = {};
    this.classList = { add() {}, remove() {}, toggle() {} }; this.hidden = false; this.textContent = '';
    this.value = ''; this.checked = false; this.values = {};
  }
  addEventListener(type, fn) { this.listeners[type] = fn; }
  append(...nodes) { this.children.push(...nodes); }
  replaceChildren(...nodes) { this.children = nodes; }
  setAttribute(name, value) {
    if (name === 'data-class-id') this.dataset.classId = value;
    if (name === 'data-action') this.dataset.action = value;
  }
  reset() { this.resetCalled = true; }
}
class FakeFormData {
  constructor(form) { this.form = form; }
  entries() { return Object.entries(this.form.values || {})[Symbol.iterator](); }
  get(name) { return this.form.values?.[name] || ''; }
  getAll(name) { return this.form.values?.[name] || []; }
}

async function runCase(kind) {
  const created = [];
  const ids = Object.fromEntries([
    'teacher-auth', 'teacher-dashboard', 'teacher-auth-message', 'dashboard-message', 'classes-list',
    'teacher-course-catalog', 'teacher-welcome', 'teacher-login-form', 'teacher-register-form',
    'preview-demo-teacher', 'create-class-form', 'teacher-logout',
  ].map(id => [id, new FakeElement('div', id)]));
  ids['create-class-form'].values = { name: 'כיתה', courses: ['craftom-agent'] };
  const submitButton = new FakeElement('button');
  let classLoads = 0;
  const fetch = async (path, options = {}) => {
    if (path === '/api/classroom/me') return { ok: true, json: async () => ({ role: 'teacher', teacher: { name: 'מורה' } }) };
    if (path === '/api/classroom/preview-demo-teacher-enabled') return { ok: true, json: async () => ({ enabled: false }) };
    if (path === '/api/classroom/classes' && !options.body) {
      classLoads += 1;
      if (classLoads > 1) return { ok: false, json: async () => ({ error: 'forced refresh failure' }) };
      return { ok: true, json: async () => ({ teacher: { courses: ['craftom-agent'] }, classes: [{
        id: 'class-1', name: 'כיתה', joinCode: 'ABC', courses: ['craftom-agent'], students: [{ id: 'student-1', name: 'דנה', progress: [] }],
      }] }) };
    }
    if (kind === 'create' && path.endsWith('/students')) return { ok: true, json: async () => ({ student: { id: 'new', name: 'נועה', loginCode: 'CREATE' } }) };
    if (kind === 'reset' && path.endsWith('/students/student-1/reset')) return { ok: true, json: async () => ({ student: { id: 'student-1', name: 'דנה', loginCode: 'RESET1' } }) };
    throw new Error(`unexpected fetch ${path}`);
  };
  const document = {
    body: { dataset: { classroomPage: 'teacher' }, classList: { add() {}, remove() {} } },
    getElementById(id) { return ids[id]; },
    querySelector(selector) { if (selector.includes('create-class-form')) return submitButton; return null; },
    createElement(tag) { const node = new FakeElement(tag); created.push(node); return node; },
  };
  vm.runInNewContext(source, {
    document, fetch, FormData: FakeFormData, URLSearchParams, encodeURIComponent,
    location: { search: '', reload() {}, assign() {} }, history: { replaceState() {} }, localStorage: { getItem() { return ''; }, removeItem() {} },
  });
  for (let i = 0; i < 5; i += 1) await new Promise(resolve => setTimeout(resolve, 0));
  const target = created.find(node => node.dataset.action === (kind === 'create' ? 'add-student' : 'reset-student-code'));
  assert.ok(target, `missing ${kind} action`);
  if (kind === 'create') target.values = { name: 'נועה' };
  await target.listeners[kind === 'create' ? 'submit' : 'click']({ preventDefault() {}, currentTarget: target });
  const notice = created.find(node => String(node.className || '').includes('one-time-code'));
  assert.equal(notice.hidden, false);
  assert.match(notice.textContent, kind === 'create' ? /CREATE/ : /RESET1/);
  assert.match(ids['dashboard-message'].textContent, kind === 'create' ? /נוסף/ : /אופס/);
  assert.match(ids['dashboard-message'].textContent, /forced refresh failure/);
}

await runCase('create');
await runCase('reset');
console.log('✓ student one-time credentials survive failed best-effort refresh after create and reset');
