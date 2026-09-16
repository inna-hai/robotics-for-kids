import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = readFileSync(join(root, 'js/classroom-admin.js'), 'utf8');
class FakeElement {
  constructor(id = '') { this.id = id; this.hidden = id === 'admin-one-time-credential'; this.checked = false; this.textContent = ''; this.value = ''; this.listeners = {}; this.classList = { toggle() {} }; }
  addEventListener(type, listener) { this.listeners[type] = listener; }
  append() {}
  replaceChildren() {}
  setAttribute() {}
  reset() { this.resetCalled = true; }
}
const ids = Object.fromEntries([
  'admin-auth', 'admin-dashboard', 'admin-auth-message', 'admin-message', 'admin-teachers-list',
  'create-invitation-form', 'admin-one-time-credential', 'admin-invitations-list', 'show-archived-teachers',
  'admin-access-request-form', 'admin-access-redeem-form', 'admin-logout', 'admin-rotate',
].map(id => [id, new FakeElement(id)]));
const document = {
  getElementById(id) { return ids[id]; },
  createElement() { return new FakeElement(); },
  querySelector() { return new FakeElement(); },
};
class FakeFormData {
  constructor(form) { this.form = form; }
  entries() { return [['name', 'מורה חדשה'], ['email', 'new@example.test']][Symbol.iterator](); }
  get(name) { return name === 'email' ? 'new@example.test' : ''; }
  getAll() { return []; }
}
let invitationRequests = 0;
const fetch = async (path, options = {}) => {
  if (path === '/api/classroom/admin-me') return { ok: true, json: async () => ({ role: 'guest' }) };
  if (path === '/api/classroom/admin/invitations') {
    invitationRequests += 1;
    if (options.method === 'POST') return { ok: true, json: async () => ({
      testCode: 'GeneratedInvitationCode_123',
      invitation: { id: 'invite-1', name: 'מורה חדשה', email: 'new@example.test', deliveryStatus: 'sent' },
    }) };
    return { ok: false, json: async () => ({ error: 'forced invitation refresh failure' }) };
  }
  throw new Error(`unexpected fetch ${path}`);
};
vm.runInNewContext(source, { document, fetch, FormData: FakeFormData, location: { reload() {} }, encodeURIComponent });
await ids['create-invitation-form'].listeners.submit({ preventDefault() {}, currentTarget: ids['create-invitation-form'] });
assert.equal(ids['admin-one-time-credential'].hidden, false, 'one-time invitation code must be revealed before refresh');
assert.match(ids['admin-one-time-credential'].textContent, /GeneratedInvitationCode_123/);
assert.match(ids['admin-message'].textContent, /נשמרה/, 'message must continue to say invitation mutation succeeded');
assert.match(ids['admin-message'].textContent, /forced invitation refresh failure/, 'message must separately report refresh failure');
console.log('✓ one-time invitation credential survives a failed post-create list refresh');
