import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = readFileSync(join(root, 'js/classroom-admin.js'), 'utf8');
class FakeElement {
  constructor(id = '') { this.id = id; this.hidden = id === 'admin-one-time-password'; this.checked = false; this.textContent = ''; this.listeners = {}; this.classList = { toggle() {} }; }
  addEventListener(type, listener) { this.listeners[type] = listener; }
  append() {}
  replaceChildren() {}
  setAttribute() {}
  reset() { this.resetCalled = true; }
}
const ids = Object.fromEntries([
  'admin-auth', 'admin-dashboard', 'admin-auth-message', 'admin-message', 'admin-teachers-list',
  'create-teacher-form', 'admin-one-time-password', 'show-archived-teachers', 'admin-login-form', 'admin-logout',
].map(id => [id, new FakeElement(id)]));
const document = {
  getElementById(id) { return ids[id]; },
  createElement() { return new FakeElement(); },
};
class FakeFormData {
  constructor(form) { this.form = form; }
  entries() { return [['name', 'מורה חדשה'], ['email', 'new@example.test']][Symbol.iterator](); }
  get() { return ''; }
  getAll() { return []; }
}
let teacherListRequests = 0;
const fetch = async path => {
  if (path === '/api/classroom/admin-me') return { ok: true, json: async () => ({ role: 'guest' }) };
  if (path === '/api/classroom/admin/teachers') {
    teacherListRequests += 1;
    if (teacherListRequests === 1) return { ok: true, json: async () => ({
      oneTime: true, temporaryPassword: 'GeneratedOnlyPassword_123',
      teacher: { id: 'teacher-1', name: 'מורה חדשה', email: 'new@example.test' },
    }) };
    return { ok: false, json: async () => ({ error: 'forced list refresh failure' }) };
  }
  throw new Error(`unexpected fetch ${path}`);
};
vm.runInNewContext(source, { document, fetch, FormData: FakeFormData, location: { reload() {} }, encodeURIComponent });
await ids['create-teacher-form'].listeners.submit({ preventDefault() {}, currentTarget: ids['create-teacher-form'] });
assert.equal(ids['admin-one-time-password'].hidden, false, 'generated password must be revealed before refresh');
assert.match(ids['admin-one-time-password'].textContent, /GeneratedOnlyPassword_123/);
assert.match(ids['admin-message'].textContent, /נוצר/, 'message must continue to say account creation succeeded');
assert.match(ids['admin-message'].textContent, /forced list refresh failure/, 'message must separately report refresh failure');
console.log('✓ generated teacher password survives a failed post-create list refresh');
