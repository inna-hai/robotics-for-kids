import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');
const tick = () => new Promise(resolve => setTimeout(resolve, 0));

function badgeHarness({ pathname = '/python-turtle.html', classroomMe, summerToken = '', summerMe }) {
  const nodes = new Map();
  const bodyChildren = [];
  const document = {
    readyState: 'complete',
    head: { appendChild(node) { nodes.set(node.id, node); } },
    body: { appendChild(node) { nodes.set(node.id, node); bodyChildren.push(node); } },
    getElementById(id) { return nodes.get(id) || null; },
    createElement() {
      return {
        id: '', className: '', innerHTML: '', textContent: '',
        setAttribute() {},
        remove() { nodes.delete(this.id); },
      };
    },
  };
  const fetchCalls = [];
  const window = { location: { pathname }, dispatchEvent() {} };
  const context = {
    window,
    document,
    localStorage: { getItem() { return summerToken; } },
    fetch: async (path) => {
      fetchCalls.push(path);
      if (path === '/api/classroom/me') return { ok: true, json: async () => classroomMe };
      if (path === '/api/summer/me') return { ok: true, json: async () => summerMe };
      throw new Error(`unexpected fetch: ${path}`);
    },
    CustomEvent: class { constructor(type, init) { this.type = type; this.detail = init?.detail; } },
  };
  vm.runInNewContext(read('js/user-badge.js'), context);
  return { window, document, nodes, bodyChildren, fetchCalls };
}

{
  const harness = badgeHarness({
    classroomMe: { role: 'student', student: { name: 'נועה' }, classroom: { name: 'כיתה ז1' } },
    summerToken: 'also-a-subscriber',
    summerMe: { mode: 'child', child: { name: 'נועה פרטית' } },
  });
  await tick();
  await tick();
  const badge = harness.nodes.get('hai-user-badge');
  assert.equal(harness.window.HaiAccessContext.mode, 'classroom');
  assert.match(badge.className, /classroom/);
  assert.match(badge.innerHTML, /כיתה ז1/);
  assert.deepEqual(harness.fetchCalls, ['/api/classroom/me'], 'classroom mode must win without mixing subscription identity');
}

{
  const harness = badgeHarness({
    classroomMe: { role: 'guest' },
    summerToken: 'subscriber-token',
    summerMe: { mode: 'child', child: { name: 'דנה' }, user: {} },
  });
  await tick();
  await tick();
  const badge = harness.nodes.get('hai-user-badge');
  assert.equal(harness.window.HaiAccessContext.mode, 'subscription');
  assert.match(badge.className, /subscription/);
  assert.match(badge.innerHTML, /מנוי אישי/);
}

{
  const harness = badgeHarness({ classroomMe: { role: 'guest' } });
  await tick();
  await tick();
  const badge = harness.nodes.get('hai-user-badge');
  assert.equal(harness.window.HaiAccessContext.mode, 'guest');
  assert.match(badge.className, /guest/);
  assert.match(badge.innerHTML, /מצב אורח/);
}

function entryHarness({ classroomLogoutOk = true, classroomMe = { role: 'guest', ok: true, subscriptionGateEnabled: true } } = {}) {
  const listeners = new Map();
  const makeNode = () => ({
    hidden: false, href: '', textContent: '', classList: { toggle() {} },
    addEventListener(type, handler) { listeners.set(`${this.id}:${type}`, handler); },
    reset() {},
  });
  const ids = ['guest-continue', 'subscription-continue', 'student-continue', 'student-login-form', 'student-login-message', 'student-session', 'student-welcome', 'student-logout'];
  const nodes = Object.fromEntries(ids.map(id => [id, Object.assign(makeNode(), { id })]));
  const assigned = [];
  const fetchCalls = [];
  const localStorage = {
    value: 'subscription-token',
    getItem() { return this.value; },
    removeItem() { this.value = ''; },
  };
  const context = {
    window: {},
    document: { body: { dataset: { classroomPage: 'entry' } }, getElementById(id) { return nodes[id]; } },
    location: { search: '?next=python-turtle.html', assign(path) { assigned.push(path); } },
    localStorage,
    URLSearchParams,
    FormData: class { entries() { return []; } },
    fetch: async (path) => {
      fetchCalls.push(path);
      if (path === '/api/classroom/logout' && !classroomLogoutOk) return { ok: false, json: async () => ({ error: 'לא הצלחנו להתנתק מהכיתה.' }) };
      if (path === '/api/summer/me') return { ok: true, json: async () => ({ mode: 'child', child: { name: 'דנה' } }) };
      return { ok: true, json: async () => classroomMe };
    },
  };
  context.window = context;
  vm.runInNewContext(read('js/classroom-platform.js'), context);
  return { nodes, listeners, assigned, fetchCalls, localStorage };
}

{
  const harness = entryHarness();
  await tick();
  assert.equal(harness.nodes['guest-continue'].href, 'sisi.html', 'guest must never be linked to a protected requested course');
  await harness.listeners.get('guest-continue:click')({ preventDefault() {} });
  assert.equal(harness.assigned.at(-1), 'sisi.html');
  assert.equal(harness.localStorage.value, '', 'explicit guest mode must clear the subscription identity');
  assert.ok(harness.fetchCalls.includes('/api/classroom/logout'));
  assert.ok(harness.fetchCalls.includes('/api/summer/logout'));
}

{
  const harness = entryHarness({ classroomMe: { role: 'guest', ok: true, subscriptionGateEnabled: false } });
  await tick();
  assert.equal(harness.assigned.at(-1), 'python-turtle.html', 'when the subscription gate is off, requested learning pages open directly for guests');
}

{
  const harness = entryHarness();
  await tick();
  await harness.listeners.get('subscription-continue:click')({ preventDefault() {} });
  assert.equal(harness.assigned.at(-1), 'python-turtle.html', 'an authenticated child subscription keeps the requested course');
  assert.ok(harness.fetchCalls.includes('/api/classroom/logout'), 'subscription mode must leave a previous classroom session');
  assert.ok(harness.fetchCalls.includes('/api/summer/me'));
}

{
  const harness = entryHarness({ classroomLogoutOk: false });
  await tick();
  await harness.listeners.get('subscription-continue:click')({ preventDefault() {} });
  assert.deepEqual(harness.assigned, [], 'failed classroom logout must not pretend subscription mode is active');
  assert.equal(harness.localStorage.value, 'subscription-token', 'a classroom logout error must not destroy the subscription login');
}

const entryHtml = read('classroom-entry.html');
assert.match(entryHtml, /id="subscription-continue"/);
assert.match(entryHtml, /מנוי אישי/);
assert.match(entryHtml, /התנסות כאורח/);
assert.match(entryHtml, /classroom-platform\.js\?v=20260906-guest-direct-1/);
assert.match(read('teacher-classrooms.html'), /classroom-platform\.js\?v=20260906-guest-direct-1/);

const classroomSession = read('js/classroom-session.js');
assert.doesNotMatch(classroomSession, /showStudentBadge/, 'the unified access badge must be the only badge');
assert.match(read('js/user-badge.js'), /\.classroom \.hai-user-dot/, 'classroom mode needs its own visual badge state');
const server = read('server.js');
assert.match(server, /user-badge\.js\?v=20260905-access-modes-1/);
assert.match(server, /classroom-session\.js\?v=20260905-access-modes-1/);
assert.match(server, /const baseOutput = injectUserBadge\(html\);/, 'the unified badge must load even when the subscription gate is disabled');
assert.doesNotMatch(server, /SUBSCRIPTION_GATE_ENABLED \? injectUserBadge\(html\)/);

console.log('✓ classroom, subscription, and guest access modes stay distinct');
console.log('✓ guest entry respects the subscription gate state');
