import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHash, createHmac } from 'node:crypto';
import { createServer, request as httpRequest } from 'node:http';
import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = readFileSync(join(root, 'server.js'), 'utf8');
const tempDir = mkdtempSync(join(tmpdir(), 'kugel-zero-test-'));

function cookie(response) {
  return String(response.headers.get('set-cookie') || '').split(';')[0];
}

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve(server.address().port));
  });
}

async function waitForServer(baseUrl) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/index.html`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error('test server did not start');
}

async function post(baseUrl, path, payload, sessionCookie = '') {
  return fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(sessionCookie ? { Cookie: sessionCookie } : {}),
    },
    body: JSON.stringify(payload),
  });
}

async function postInternal(baseUrl, path, payload) {
  return fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${lifecycleSecret}`,
    },
    body: JSON.stringify(payload),
  });
}

async function getInternal(baseUrl, path, authorized = true) {
  return fetch(`${baseUrl}${path}`, {
    headers: authorized ? { Authorization: `Bearer ${lifecycleSecret}` } : {},
  });
}

async function rawPost(baseUrl, path, body, sessionCookie = '') {
  return fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(sessionCookie ? { Cookie: sessionCookie } : {}) },
    body,
  });
}

function slowPost(baseUrl, requestPath, payload, sessionCookie = '') {
  const url = new URL(requestPath, baseUrl);
  const raw = JSON.stringify(payload);
  let resolveResponse;
  const response = new Promise(resolve => { resolveResponse = resolve; });
  const req = httpRequest(url, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: sessionCookie },
  }, res => {
    const chunks = [];
    res.on('data', chunk => chunks.push(chunk));
    res.on('end', () => resolveResponse({ status: res.statusCode, body: Buffer.concat(chunks).toString('utf8') }));
  });
  const split = Math.max(1, raw.length - 1);
  req.write(raw.slice(0, split));
  return { response, finish: () => req.end(raw.slice(split)) };
}

function countSubmissionFiles(directory) {
  try { return readdirSync(directory, { recursive: true, withFileTypes: true }).filter(entry => entry.isFile()).length; }
  catch { return 0; }
}

let gameEvents = [];
let gameEventsDelayMs = 0;
let gameEventsStartedResolve = null;
let gameEventsGate = null;
let nextClassReportPayload = null;
let nextCloseClassStageReportPayload = null;
let worldOpenDelayMs = 0;
let worldOpenStartedResolve = null;
let worldOpenFailuresRemaining = 0;
let worldOpenPreAdoptFailuresRemaining = 0;
let worldOpenAdoptState = 'running';
let worldCloseDelayMs = 0;
let worldCloseFailuresRemaining = 0;
let freezeDelayMs = 0;
let freezeFailuresRemaining = 0;
let freezeStartedResolve = null;
let freezeGate = null;
const monitorCalls = [];
const lifecycleSecret = 'test-monitor-token-at-least-32-bytes';
let monitorWorldLease = null;
const legacyMonitorState = new Map();
let nextMonitorError = null;
let nextMonitorRedirect = false;
const queuedStateResponses = [];
function expectedLifecycleSignature(timestamp, pathname, raw, requestId) {
  const bodyHash = createHash('sha256').update(raw).digest('hex');
  return createHmac('sha256', lifecycleSecret)
    .update(`${timestamp}\nPOST\n${pathname}\n${bodyHash}\n${requestId}`)
    .digest('hex');
}
function forLease(rows, lease = monitorWorldLease) {
  assert.ok(lease, 'a monitor lease is required to tag game events');
  return rows.map(row => ({
    ...row,
    server: 'test-kugel-monitor',
    owner_id: lease.owner_id,
    lease_id: lease.lease_id,
    generation: lease.generation,
    world: lease.world,
  }));
}
const monitor = createServer(async (req, res) => {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  const body = raw ? JSON.parse(raw) : {};
  monitorCalls.push({ method: req.method, url: req.url, headers: req.headers, authorization: req.headers.authorization || '', body, raw });
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'GET' && req.url.startsWith('/api/game-events')) {
    res.end(JSON.stringify({ events: gameEvents }));
    return;
  }
  const signedMutationPath = ['/api/internal/craftom-school/v2/world/open', '/api/internal/craftom-school/v2/world/close',
    '/api/internal/craftom-school/v2/world/state', '/api/internal/craftom-school/v2/world/events',
    '/api/internal/craftom-school/v2/live/message',
    '/api/internal/craftom-school/v2/live/freeze',
    '/api/internal/craftom-school/v2/live/teleport'].includes(req.url);
  if (signedMutationPath) {
    const timestamp = req.headers['x-hai-timestamp'];
    const requestId = req.headers['x-hai-request-id'];
    const signature = req.headers['x-hai-signature'];
    const expected = expectedLifecycleSignature(timestamp, req.url, raw, requestId);
    assert.match(timestamp || '', /^\d{10}$/,
      'lifecycle timestamps must use Unix seconds accepted by the real monitor contract');
    if (req.method !== 'POST' || !timestamp || !requestId || !signature || signature !== expected) {
      res.statusCode = 401;
      res.end(JSON.stringify({ error: 'invalid_lifecycle_signature' }));
      return;
    }
    assert.equal(req.headers.authorization, undefined, 'lifecycle requests use HMAC headers instead of Bearer authentication');
    assert.equal(body.request_id, requestId, 'the signed request ID must also be bound inside the JSON body');
    const expectedKeys = req.url.endsWith('/open')
      ? ['generation', 'lease_id', 'lesson_id', 'owner_id', 'request_id', 'server', 'start_mode', 'teacher_email', 'world']
      : req.url.endsWith('/close')
        ? ['generation', 'lease_id', 'owner_id', 'request_id', 'server']
        : req.url.endsWith('/state')
          ? ['request_id', 'server']
          : req.url.endsWith('/events')
            ? ['generation', 'lease_id', 'owner_id', 'request_id', 'server', 'world']
          : req.url.endsWith('/message')
            ? ['generation', 'lease_id', 'owner_id', 'request_id', 'scope', 'server', 'target', 'text']
            : req.url.endsWith('/teleport')
              ? ['generation', 'lease_id', 'owner_id', 'request_id', 'scope', 'server', 'target']
            : ['generation', 'lease_id', 'mode', 'on', 'owner_id', 'request_id', 'restore', 'scope', 'server', 'target'];
    assert.deepEqual(Object.keys(body).sort(), expectedKeys);
    const alwaysOnEventsProbe = req.url.endsWith('/events') && body.lease_id === null;
    if (!req.url.endsWith('/state') && !alwaysOnEventsProbe) {
      assert.equal(typeof body.lease_id, 'string', `${req.url} must include a concrete lease id, got ${JSON.stringify(body)}`);
      assert.ok(body.lease_id.length > 0);
      assert.equal(Number.isInteger(body.generation), true);
      assert.ok(body.generation > 0);
      assert.equal(typeof body.owner_id, 'string');
      assert.ok(body.owner_id.length > 0);
    }
  } else if (req.headers.authorization !== `Bearer ${lifecycleSecret}`) {
    res.statusCode = 401;
    res.end(JSON.stringify({ error: 'unauthorized' }));
    return;
  }
  if (nextMonitorError) {
    const { status, payload } = nextMonitorError;
    nextMonitorError = null;
    res.statusCode = status;
    res.end(JSON.stringify(payload));
    return;
  }
  if (nextMonitorRedirect) {
    nextMonitorRedirect = false;
    res.statusCode = 302;
    res.setHeader('Location', '/redirect-target');
    res.end();
    return;
  }
  if (req.url === '/api/internal/craftom-school/v2/world/events') {
    if (body.lease_id === null) {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: 'legacy_monitor_events' }));
      return;
    }
    if (gameEventsStartedResolve) { gameEventsStartedResolve(); gameEventsStartedResolve = null; }
    if (gameEventsGate) await gameEventsGate;
    if (gameEventsDelayMs) await new Promise((resolve) => setTimeout(resolve, gameEventsDelayMs));
    res.end(JSON.stringify({ events: gameEvents }));
    return;
  }
  if (req.url === '/api/internal/craftom-school/v2/world/state') {
    if (queuedStateResponses.length) {
      const queued = queuedStateResponses.shift();
      res.end(typeof queued === 'string' ? queued : JSON.stringify(queued));
      return;
    }
    res.end(JSON.stringify(monitorWorldLease
      ? { active: true, state: monitorWorldLease.state || 'running', server: body.server, lease_id: monitorWorldLease.lease_id,
          generation: monitorWorldLease.generation, world: monitorWorldLease.world, last_error: null }
      : { active: false, state: 'idle', server: body.server, lease_id: null, generation: 0, world: null, last_error: null }));
    return;
  }
  if (req.url === '/api/internal/craftom-school/server/status') {
    const legacy = legacyMonitorState.get(body.server);
    res.end(JSON.stringify({
      ok: true,
      running: Boolean(legacy?.running),
      current_world: legacy?.world || 'Kugel-lesson-0',
    }));
    return;
  }
  if (req.url === '/api/internal/craftom-school/server/start') {
    legacyMonitorState.set(body.server, { running: true, world: legacyMonitorState.get(body.server)?.world || 'Kugel-lesson-0' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }
  if (req.url === '/api/internal/craftom-school/worlds/list') {
    res.end(JSON.stringify({ worlds: [
      { name: 'Kugel-lesson-0', kind: 'template', display: 'מבוך שיעור 0' },
      { name: 'kugel-50-safe-compounds-v3-20260824', kind: 'template', display: 'עולם אקדמיית Agent' },
      { name: 'Python-lesson-2', kind: 'template', display: 'עולם פייתון' },
      { name: 'kugel-saved-work', kind: 'work', display: 'שמירה קוגל' },
    ] }));
    return;
  }
  if (req.url === '/api/internal/craftom-school/world/open') {
    legacyMonitorState.set(body.server, { running: true, world: body.world });
    res.end(JSON.stringify({ ok: true }));
    return;
  }
  if (req.url === '/api/internal/craftom-school/world/save') {
    res.end(JSON.stringify({ ok: true, name: body.name }));
    return;
  }
  if (req.url === '/api/internal/craftom-school/world/close') {
    legacyMonitorState.set(body.server, { running: false, world: legacyMonitorState.get(body.server)?.world || 'Kugel-lesson-0' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }
  if (req.url === '/api/internal/craftom-school/kugel/class-report') {
    if (nextClassReportPayload) {
      const payload = nextClassReportPayload;
      nextClassReportPayload = null;
      res.end(JSON.stringify(payload));
      return;
    }
    res.end(JSON.stringify({
      ok: true,
      class_stage_report: {
        lesson_label: `שיעור ${body.lesson_id ?? 0}`,
        generated_at: new Date().toISOString(),
        started_at: new Date(Date.now() - 60000).toISOString(),
        ended_at: new Date().toISOString(),
        report_text: 'דוח סוף שיעור 0 ממוניטור הבדיקה',
        students: [],
      },
    }));
    return;
  }
  if (req.url === '/api/internal/craftom-school/v2/world/open' && worldOpenDelayMs) {
    if (worldOpenStartedResolve) { worldOpenStartedResolve(); worldOpenStartedResolve = null; }
    await new Promise((resolve) => setTimeout(resolve, worldOpenDelayMs));
  }
  if (req.url === '/api/internal/craftom-school/v2/world/open' && worldOpenFailuresRemaining > 0) {
    monitorWorldLease = { lease_id: body.lease_id, owner_id: body.owner_id, generation: body.generation, world: body.world, state: 'error' };
    worldOpenFailuresRemaining -= 1;
    res.statusCode = 503;
    res.end(JSON.stringify({ error: 'ambiguous_open_failure' }));
    return;
  }
  if (req.url === '/api/internal/craftom-school/v2/world/open' && worldOpenPreAdoptFailuresRemaining > 0) {
    if (monitorWorldLease) monitorWorldLease = { ...monitorWorldLease, state: 'running' };
    worldOpenPreAdoptFailuresRemaining -= 1;
    res.statusCode = 503;
    res.end(JSON.stringify({ error: 'open_failed_before_adoption' }));
    return;
  }
  if (req.url === '/api/internal/craftom-school/v2/world/open') {
    if (monitorWorldLease
      && (monitorWorldLease.lease_id !== body.lease_id || monitorWorldLease.owner_id !== body.owner_id
        || body.generation < monitorWorldLease.generation)) {
      res.statusCode = 409;
      res.end(JSON.stringify({ error: 'world_already_leased' }));
      return;
    }
    monitorWorldLease = { lease_id: body.lease_id, owner_id: body.owner_id, generation: body.generation, world: body.world, state: worldOpenAdoptState };
  }
  if (req.url === '/api/internal/craftom-school/v2/world/close') {
    if (worldCloseDelayMs) await new Promise((resolve) => setTimeout(resolve, worldCloseDelayMs));
    if (worldCloseFailuresRemaining > 0) {
      worldCloseFailuresRemaining -= 1;
      res.statusCode = 503;
      res.end(JSON.stringify({ error: 'temporary_close_failure' }));
      return;
    }
    if (monitorWorldLease
      && (monitorWorldLease.lease_id !== body.lease_id || monitorWorldLease.owner_id !== body.owner_id
        || monitorWorldLease.generation !== body.generation)) {
      res.statusCode = 409;
      res.end(JSON.stringify({ error: 'stale_world_lease' }));
      return;
    }
    monitorWorldLease = null;
    if (nextCloseClassStageReportPayload) {
      const payload = nextCloseClassStageReportPayload;
      nextCloseClassStageReportPayload = null;
      gameEvents.unshift({
        id: 900000 + gameEvents.length,
        server_name: body.server,
        server: body.server,
        event_type: 'class_stage_report',
        player_name: null,
        created_at: Math.floor(Date.now() / 1000),
        game_timestamp: new Date().toISOString(),
        payload: JSON.stringify(payload),
      });
    }
  }
  if (req.url === '/api/internal/craftom-school/v2/live/freeze') {
    if (freezeStartedResolve) { freezeStartedResolve(); freezeStartedResolve = null; }
    if (freezeGate) await freezeGate;
    if (freezeDelayMs) await new Promise((resolve) => setTimeout(resolve, freezeDelayMs));
    if (freezeFailuresRemaining > 0) {
      freezeFailuresRemaining -= 1;
      res.statusCode = 503;
      res.end(JSON.stringify({ error: 'temporary_freeze_failure' }));
      return;
    }
  }
  res.end(JSON.stringify({ ok: true }));
});

const monitorPort = await listen(monitor);
const appPort = await new Promise((resolve, reject) => {
  const probe = createServer();
  probe.once('error', reject);
  probe.listen(0, '127.0.0.1', () => {
    const port = probe.address().port;
    probe.close(() => resolve(port));
  });
});
const baseUrl = `http://127.0.0.1:${appPort}`;
const dbFile = join(tempDir, 'classroom.sqlite');
const appEnv = {
  ...process.env,
  PORT: String(appPort),
  ROBOTICS_DATA_DIR: tempDir,
  ROBOTICS_DB_FILE: dbFile,
  ROBOTICS_SUBSCRIPTION_GATE: '1',
  ROBOTICS_CLASSROOM_ADMIN_EMAIL: 'owner@example.test',
  ROBOTICS_TEACHER_INVITE_CODE: '',
  ROBOTICS_CLASSROOM_ADMIN_CODE: '',
  KUGEL_MONITOR_API_URL: `http://127.0.0.1:${monitorPort}`,
  KUGEL_MONITOR_SERVER_NAME: 'test-kugel-monitor',
  KUGEL_MINECRAFT_INTERNAL_TOKEN: lifecycleSecret,
  KUGEL_MINECRAFT_SERVER_NAME: 'Test Minecraft',
  KUGEL_MINECRAFT_SERVER_HOST: '127.0.0.1',
  KUGEL_MINECRAFT_SERVER_PORT: '19132',
  KUGEL_MINECRAFT_SERVER_ID: 'test-server-id',
  KUGEL_MINECRAFT_ACCESS_CODE: 'test-access-code',
  KUGEL_CONNECTED_TTL_MS: '1000',
  KUGEL_TEST_WORLD_OPEN_TIMEOUT_MS: '1000',
  KUGEL_TEST_RECONCILE_GRACE_MS: '600',
  KUGEL_TEST_RECONCILE_INTERVAL_MS: '100',
  NODE_ENV: 'test',
};
const child = spawn(process.execPath, ['server.js'], {
  cwd: root,
  env: appEnv,
  stdio: ['ignore', 'pipe', 'pipe'],
});
let restartedChild = null;
let serverOutput = '';
child.stdout.on('data', chunk => { serverOutput += chunk.toString(); });
child.stderr.on('data', chunk => { serverOutput += chunk.toString(); });

try {
  await waitForServer(baseUrl);

  const spoofedPreviewEnabled = await fetch(`${baseUrl}/api/classroom/preview-demo-student-enabled`, {
    headers: { 'X-Forwarded-Host': 'craftom-tehila-preview.orma-ai.com' },
  });
  assert.equal(spoofedPreviewEnabled.status, 200);
  assert.equal((await spoofedPreviewEnabled.json()).enabled, false, 'an untrusted forwarded host must not enable preview demo authentication');
  const spoofedProtectedPage = await fetch(`${baseUrl}/craftom-school/preview/index.html`, {
    headers: { 'X-Forwarded-Host': 'craftom-tehila-preview.orma-ai.com' },
    redirect: 'manual',
  });
  assert.notEqual(spoofedProtectedPage.status, 200, 'an untrusted forwarded host must not bypass the Craftom subscription gate');

  const adminAccess = await post(baseUrl, '/api/classroom/admin-access/request', { email: 'owner@example.test' });
  const adminAccessBody = await adminAccess.json();
  const adminLogin = await post(baseUrl, '/api/classroom/admin-access/redeem', {
    email: 'owner@example.test', code: adminAccessBody.testCode,
  });
  assert.equal(adminLogin.status, 200);
  const adminCookie = cookie(adminLogin);

  async function inviteTeacher(name, email) {
    const invitation = await post(baseUrl, '/api/classroom/admin/invitations', { name, email }, adminCookie);
    assert.equal(invitation.status, 201);
    const invitationBody = await invitation.json();
    const redemption = await post(baseUrl, '/api/classroom/teacher-invitations/redeem', {
      email, code: invitationBody.testCode,
    });
    assert.equal(redemption.status, 201);
    const redemptionBody = await redemption.json();
    const login = await post(baseUrl, '/api/classroom/teacher-login', {
      email, password: redemptionBody.temporaryPassword,
    });
    assert.equal(login.status, 200);
    return { teacher: redemptionBody.teacher, cookie: cookie(login), password: redemptionBody.temporaryPassword };
  }
  const registeredA = await inviteTeacher('מורת אקדמיית Agent א', 'agent-a@example.test');
  const teacherA = registeredA.teacher;
  let teacherACookie = registeredA.cookie;
  const registeredB = await inviteTeacher('מורת אקדמיית Agent ב', 'agent-b@example.test');
  const teacherB = registeredB.teacher;
  const teacherBCookie = registeredB.cookie;
  for (const teacher of [teacherA, teacherB]) {
    const assignment = await post(baseUrl, `/api/classroom/admin/teachers/${teacher.id}/courses`, { courses: ['sisi', 'craftom-agent'] }, adminCookie);
    assert.equal(assignment.status, 200);
  }

  const createA = await post(baseUrl, '/api/classroom/classes', { name: 'כיתת אקדמיית Agent א', courses: ['craftom-agent'] }, teacherACookie);
  assert.equal(createA.status, 201);
  const classroomA = (await createA.json()).classroom;
  const createB = await post(baseUrl, '/api/classroom/classes', { name: 'כיתת אקדמיית Agent ב', courses: ['craftom-agent'] }, teacherBCookie);
  assert.equal(createB.status, 201);
  const classroomB = (await createB.json()).classroom;
  const createNonKugel = await post(baseUrl, '/api/classroom/classes', { name: 'כיתת סיסי', courses: ['sisi'] }, teacherACookie);
  assert.equal(createNonKugel.status, 201);
  const nonKugelClassroom = (await createNonKugel.json()).classroom;

  const addA = await post(baseUrl, `/api/classroom/classes/${classroomA.id}/students`, { name: 'נועה מאובטחת' }, teacherACookie);
  assert.equal(addA.status, 201);
  const studentA = (await addA.json()).student;
  const addASecond = await post(baseUrl, `/api/classroom/classes/${classroomA.id}/students`, { name: 'תלמיד נוסף' }, teacherACookie);
  assert.equal(addASecond.status, 201);
  const studentASecond = (await addASecond.json()).student;
  const addB = await post(baseUrl, `/api/classroom/classes/${classroomB.id}/students`, { name: 'תלמיד כיתה אחרת' }, teacherBCookie);
  assert.equal(addB.status, 201);
  const studentB = (await addB.json()).student;

  const loginA = await post(baseUrl, '/api/classroom/student-login', { classCode: classroomA.joinCode, personalCode: studentA.loginCode });
  assert.equal(loginA.status, 200);
  let studentACookie = cookie(loginA);
  const loginASecond = await post(baseUrl, '/api/classroom/student-login', { classCode: classroomA.joinCode, personalCode: studentASecond.loginCode });
  assert.equal(loginASecond.status, 200);
  let submissionStudentCookie = cookie(loginASecond);
  const loginB = await post(baseUrl, '/api/classroom/student-login', { classCode: classroomB.joinCode, personalCode: studentB.loginCode });
  assert.equal(loginB.status, 200);
  const studentBCookie = cookie(loginB);

  const unauthenticated = await fetch(`${baseUrl}/api/kugel/session?classroomId=${classroomA.id}`);
  assert.equal(unauthenticated.status, 401, 'Agent Academy session data must require a classroom identity');

  const crossTenant = await fetch(`${baseUrl}/api/kugel/session?classroomId=${classroomA.id}`, { headers: { Cookie: teacherBCookie } });
  assert.equal(crossTenant.status, 404, 'a teacher must not read another teacher classroom');

  const nonKugel = await fetch(`${baseUrl}/api/kugel/session?classroomId=${nonKugelClassroom.id}`, { headers: { Cookie: teacherACookie } });
  assert.equal(nonKugel.status, 403, 'Agent Academy lesson zero requires the course on the class');

  const studentTeacherAction = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/launch`, {}, studentACookie);
  assert.equal(studentTeacherAction.status, 401, 'a student cannot invoke teacher controls');

  const crossTenantLink = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/students/${studentA.id}/minecraft`, { playerName: 'NoaSecure' }, teacherBCookie);
  assert.equal(crossTenantLink.status, 404);
  const identityDb = new Database(dbFile);
  const identityNow = new Date().toISOString();
  const addVerifiedIdentity = identityDb.prepare(`INSERT INTO classroom_minecraft_identities
    (student_id, upn, player_name, status, graph_object_id, source, verified_at, created_at, updated_at)
    VALUES (?, ?, ?, 'verified', ?, 'microsoft-graph-via-monitor', ?, ?, ?)`);
  addVerifiedIdentity.run(studentA.id, 'noa.secure@hai.tech', 'NoaSecure', 'graph-noa-secure', identityNow, identityNow, identityNow);
  addVerifiedIdentity.run(studentB.id, 'other.secure@hai.tech', 'OtherSecure', 'graph-other-secure', identityNow, identityNow, identityNow);
  identityDb.prepare('UPDATE classroom_students SET minecraft_player_name = ?, updated_at = ? WHERE id = ?')
    .run('NoaSecure', identityNow, studentA.id);
  identityDb.prepare('UPDATE classroom_students SET minecraft_player_name = ?, updated_at = ? WHERE id = ?')
    .run('OtherSecure', identityNow, studentB.id);
  identityDb.close();
  const linkPlayer = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/students/${studentA.id}/minecraft`, { playerName: 'NoaSecure' }, teacherACookie);
  assert.equal(linkPlayer.status, 200);
  assert.equal((await linkPlayer.json()).student.minecraftPlayerName, 'NoaSecure');
  const createAlwaysOn = await post(baseUrl, '/api/classroom/classes', { name: 'כיתת קוגל קבועה', courses: ['craftom-agent'] }, teacherACookie);
  assert.equal(createAlwaysOn.status, 201);
  const alwaysOnClassroom = (await createAlwaysOn.json()).classroom;
  const alwaysOnDb = new Database(dbFile);
  alwaysOnDb.prepare('UPDATE classrooms SET join_code = ? WHERE id = ?').run('J8T82C', alwaysOnClassroom.id);
  alwaysOnDb.close();
  const addAlwaysOnStudent = await post(baseUrl, `/api/classroom/classes/${alwaysOnClassroom.id}/students`, { name: 'תלמיד קבוע' }, teacherACookie);
  assert.equal(addAlwaysOnStudent.status, 201);
  const alwaysOnStudent = (await addAlwaysOnStudent.json()).student;
  const alwaysOnIdentityDb = new Database(dbFile);
  alwaysOnIdentityDb.prepare(`INSERT INTO classroom_minecraft_identities
    (student_id, upn, player_name, status, graph_object_id, source, verified_at, created_at, updated_at)
    VALUES (?, ?, ?, 'verified', ?, 'microsoft-graph-via-monitor', ?, ?, ?)`)
    .run(alwaysOnStudent.id, 'always.secure@hai.tech', 'AlwaysSecure', 'graph-always-secure',
    identityNow, identityNow, identityNow);
  alwaysOnIdentityDb.close();
  assert.equal((await post(baseUrl, `/api/kugel/classes/${alwaysOnClassroom.id}/students/${alwaysOnStudent.id}/minecraft`,
    { playerName: 'AlwaysSecure' }, teacherACookie)).status, 200);
  const alwaysOnLinkDb = new Database(dbFile);
  alwaysOnLinkDb.prepare('UPDATE classroom_students SET minecraft_player_name = ?, updated_at = ? WHERE id = ?')
    .run('AlwaysSecure', identityNow, alwaysOnStudent.id);
  alwaysOnLinkDb.close();
  const alwaysOnClassMessage = await post(baseUrl, `/api/kugel/classes/${alwaysOnClassroom.id}/message`,
    { text: 'הודעת מורה לכולם', scope: 'all' }, teacherACookie);
  assert.equal(alwaysOnClassMessage.status, 200, 'always-on mapped classes can send class-wide teacher chat');
  const alwaysOnClassMessageBody = await alwaysOnClassMessage.json();
  assert.equal(alwaysOnClassMessageBody.queued.scope, 'all');
  const alwaysOnClassCommandPoll = await postInternal(baseUrl, '/api/internal/minecraft/live-commands', {
    server: 'edu-kugel-holon',
  });
  assert.equal(alwaysOnClassCommandPoll.status, 200);
  const alwaysOnClassCommandBody = await alwaysOnClassCommandPoll.json();
  assert.equal(alwaysOnClassCommandBody.commands.length, 1, 'class-wide teacher chat is queued for Minecraft-side polling');
  assert.equal(alwaysOnClassCommandBody.commands[0].type, 'message');
  assert.equal(alwaysOnClassCommandBody.commands[0].scope, 'all');
  assert.match(alwaysOnClassCommandBody.commands[0].commandLine, /tellraw @a/);
  await postInternal(baseUrl, '/api/internal/minecraft/live-commands', {
    server: 'edu-kugel-holon',
    ackIds: [alwaysOnClassCommandBody.commands[0].id],
  });
  const alwaysOnPlayerMessage = await post(baseUrl, `/api/kugel/classes/${alwaysOnClassroom.id}/message`,
    { text: 'בדיקת צאט', scope: 'player', target: 'AlwaysSecure' }, teacherACookie);
  assert.equal(alwaysOnPlayerMessage.status, 200, 'always-on mapped classes can send player chat without a stored world lease');
  const alwaysOnLegacyMessage = monitorCalls.find(call => call.url === '/api/internal/craftom-school/live/message'
    && call.body.target === 'AlwaysSecure');
  assert.equal(alwaysOnLegacyMessage?.body.server, 'edu-kugel-holon');
  assert.equal(Object.hasOwn(alwaysOnLegacyMessage.body, 'lease_id'), false, 'always-on live commands use the deployed legacy Monitor contract');
  const alwaysOnCommandPoll = await postInternal(baseUrl, '/api/internal/minecraft/live-commands', {
    server: 'edu-kugel-holon',
  });
  assert.equal(alwaysOnCommandPoll.status, 200);
  const alwaysOnCommandBody = await alwaysOnCommandPoll.json();
  assert.equal(alwaysOnCommandBody.commands.length, 1, 'teacher chat is queued for Minecraft-side polling');
  assert.equal(alwaysOnCommandBody.commands[0].type, 'message');
  assert.equal(alwaysOnCommandBody.commands[0].target, 'AlwaysSecure');
  assert.match(alwaysOnCommandBody.commands[0].commandLine, /tellraw AlwaysSecure/);
  const alwaysOnCommandAck = await postInternal(baseUrl, '/api/internal/minecraft/live-commands', {
    server: 'edu-kugel-holon',
    ackIds: [alwaysOnCommandBody.commands[0].id],
  });
  assert.equal(alwaysOnCommandAck.status, 200);
  assert.equal((await alwaysOnCommandAck.json()).commands.length, 0, 'acked teacher chat is not returned again');
  const alwaysOnStop = await post(baseUrl, `/api/classroom/classes/${alwaysOnClassroom.id}/kugel-server/stop`, {}, teacherACookie);
  assert.equal(alwaysOnStop.status, 200);
  const alwaysOnCloseCall = monitorCalls.filter(call => call.url === '/api/internal/craftom-school/world/close').at(-1);
  assert.equal(alwaysOnCloseCall?.authorization, `Bearer ${lifecycleSecret}`,
    'always-on teacher stop should close the class server through the legacy Monitor Bearer contract');
  assert.equal(alwaysOnCloseCall?.body.server, 'edu-kugel-holon');
  const stoppedAlwaysOnMessage = await post(baseUrl, `/api/kugel/classes/${alwaysOnClassroom.id}/message`,
    { text: 'לא אמור להישלח', scope: 'player', target: 'AlwaysSecure' }, teacherACookie);
  assert.equal(stoppedAlwaysOnMessage.status, 409,
    'a stopped always-on class must not silently fall back to a virtual running session');
  const alwaysOnRestart = await post(baseUrl, `/api/classroom/classes/${alwaysOnClassroom.id}/kugel-server/start`, {}, teacherACookie);
  assert.equal(alwaysOnRestart.status, 200);
  const alwaysOnStartCall = monitorCalls.filter(call => call.url === '/api/internal/craftom-school/server/start').at(-1);
  assert.equal(alwaysOnStartCall?.authorization, `Bearer ${lifecycleSecret}`,
    'always-on teacher start should call the Monitor server/start endpoint');
  assert.equal(alwaysOnStartCall?.body.server, 'edu-kugel-holon');
  const alwaysOnStatus = await post(baseUrl, `/api/classroom/classes/${alwaysOnClassroom.id}/kugel-server/status`, {}, teacherACookie);
  assert.equal(alwaysOnStatus.status, 200);
  assert.equal((await alwaysOnStatus.json()).monitor.currentWorld, 'Kugel-lesson-0');
  const alwaysOnWorlds = await post(baseUrl, `/api/classroom/classes/${alwaysOnClassroom.id}/kugel-server/worlds`, {}, teacherACookie);
  assert.equal(alwaysOnWorlds.status, 200);
  const alwaysOnWorldsBody = await alwaysOnWorlds.json();
  assert.deepEqual(alwaysOnWorldsBody.worlds.map(world => world.name), ['Kugel-lesson-0', 'kugel-50-safe-compounds-v3-20260824']);
  const alwaysOnBlockedWorld = await post(baseUrl, `/api/classroom/classes/${alwaysOnClassroom.id}/kugel-server/open-world`,
    { world: 'kugel-saved-work', startMode: 'reset' }, teacherACookie);
  assert.equal(alwaysOnBlockedWorld.status, 400, 'teacher dashboard must not open hidden monitor worlds');
  const alwaysOnOpenWorld = await post(baseUrl, `/api/classroom/classes/${alwaysOnClassroom.id}/kugel-server/open-world`,
    { world: 'Kugel-lesson-0', startMode: 'reset' }, teacherACookie);
  assert.equal(alwaysOnOpenWorld.status, 200);
  const alwaysOnOpenCall = monitorCalls.filter(call => call.url === '/api/internal/craftom-school/world/open').at(-1);
  assert.equal(alwaysOnOpenCall?.body.server, 'edu-kugel-holon');
  assert.equal(alwaysOnOpenCall?.body.world, 'Kugel-lesson-0');
  assert.equal(alwaysOnOpenCall?.body.start_mode, 'reset');
  assert.equal(alwaysOnOpenCall?.body.lesson_id, 0);
  assert.equal(alwaysOnOpenCall?.body.teacher_email, 'agent-a@example.test');
  const alwaysOnOpenDb = new Database(dbFile, { readonly: true });
  const alwaysOnOpenSession = alwaysOnOpenDb.prepare(`
    SELECT events_since FROM kugel_class_sessions WHERE classroom_id = ?
  `).get(alwaysOnClassroom.id);
  alwaysOnOpenDb.close();
  assert.ok(alwaysOnOpenSession.events_since > 0,
    'opening a reset lesson zero world from the teacher dashboard starts Monitor event tracking at the new run');
  const alwaysOnSaveWorld = await post(baseUrl, `/api/classroom/classes/${alwaysOnClassroom.id}/kugel-server/save-world`,
    { name: 'kugel-holon-work', display: 'שמירת חולון' }, teacherACookie);
  assert.equal(alwaysOnSaveWorld.status, 200);
  const alwaysOnSaveCall = monitorCalls.filter(call => call.url === '/api/internal/craftom-school/world/save').at(-1);
  assert.equal(alwaysOnSaveCall?.body.server, 'edu-kugel-holon');
  assert.equal(alwaysOnSaveCall?.body.name, 'kugel-holon-work');
  const alwaysOnLogin = await post(baseUrl, '/api/classroom/student-login', {
    classCode: 'J8T82C', personalCode: alwaysOnStudent.loginCode,
  });
  assert.equal(alwaysOnLogin.status, 200);
  const alwaysOnStudentCookie = cookie(alwaysOnLogin);
  const alwaysOnCompoundSync = await fetch(`${baseUrl}/api/internal/minecraft/compound-assignments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${lifecycleSecret}` },
    body: JSON.stringify({
      monitor_server_name: 'edu-kugel-holon',
      minecraft_username: 'AlwaysSecure',
      compound_id: 6,
    }),
  });
  assert.equal(alwaysOnCompoundSync.status, 200);
  const alwaysOnCompoundEntry = await post(baseUrl, '/api/kugel/compound-entry', { compoundId: 6 }, alwaysOnStudentCookie);
  assert.equal(alwaysOnCompoundEntry.status, 200, 'Open Lomda compound links resolve the signed-in student in always-on classes without a stored world lease');
  assert.equal((await alwaysOnCompoundEntry.json()).student.id, alwaysOnStudent.id);
  gameEvents = [{
    id: 70,
    server_name: 'edu-kugel-holon',
    event_type: 'coin_collected',
    player_name: 'AlwaysSecure',
    created_at: new Date().toISOString(),
    game_timestamp: new Date().toISOString(),
    payload: JSON.stringify({
      minecraft_username: 'AlwaysSecure',
      compound_id: 7,
      coin_index: 1,
      collected_count: 1,
    }),
  }];
  await new Promise(resolve => setTimeout(resolve, 1100));
  const alwaysOnCompoundEventFallback = await post(baseUrl, '/api/kugel/compound-entry', { compoundId: 7 }, alwaysOnStudentCookie);
  assert.equal(alwaysOnCompoundEventFallback.status, 200,
    'Open Lomda compound links fall back to recent Monitor events when the behavior pack did not sync a compound assignment');
  assert.equal((await alwaysOnCompoundEventFallback.json()).student.id, alwaysOnStudent.id);
  const caseCollision = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/students/${studentASecond.id}/minecraft`, { playerName: 'noasecure' }, teacherACookie);
  assert.equal(caseCollision.status, 409, 'Minecraft player names must be unique case-insensitively inside a class');
  const linkOtherPlayer = await post(baseUrl, `/api/kugel/classes/${classroomB.id}/students/${studentB.id}/minecraft`, { playerName: 'OtherSecure' }, teacherBCookie);
  assert.equal(linkOtherPlayer.status, 200);

  const invalidPlayer = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/students/${studentA.id}/minecraft`, { playerName: '../bad name' }, teacherACookie);
  assert.equal(invalidPlayer.status, 400);

  const invalidJson = await rawPost(baseUrl, `/api/kugel/classes/${classroomA.id}/launch`, '{', teacherACookie);
  assert.equal(invalidJson.status, 400, 'invalid JSON must be a client error');
  const oversizedJson = await rawPost(baseUrl, `/api/kugel/classes/${classroomA.id}/launch`, JSON.stringify({ padding: 'x'.repeat(70 * 1024) }), teacherACookie);
  assert.equal(oversizedJson.status, 413, 'oversized control bodies must be rejected explicitly');

  const teacherSession = await fetch(`${baseUrl}/api/kugel/session?classroomId=${classroomA.id}`, { headers: { Cookie: teacherACookie } });
  assert.equal(teacherSession.status, 200);
  const teacherSessionBody = await teacherSession.json();
  assert.equal(teacherSessionBody.lessons.length, 17, 'teacher mapping board must list Minecraft lessons 0-16');
  for (const lessonId of Array.from({ length: 16 }, (_, index) => index + 1)) {
    assert.equal(teacherSessionBody.lessons.find(lesson => lesson.id === lessonId)?.hasWorld, true, `lesson ${lessonId} must have the shared Agent Academy world`);
  }

  const unauthorizedRubric = await getInternal(baseUrl, '/api/internal/craftom-school/lesson-rubric?lesson_id=1', false);
  assert.equal(unauthorizedRubric.status, 401, 'lesson rubrics for the Monitor must require the internal Minecraft token');
  const invalidRubric = await getInternal(baseUrl, '/api/internal/craftom-school/lesson-rubric?lesson_id=99');
  assert.equal(invalidRubric.status, 400, 'lesson rubric endpoint must reject invalid lesson IDs');
  const lessonOneRubric = await getInternal(baseUrl, '/api/internal/craftom-school/lesson-rubric?lesson_id=1');
  assert.equal(lessonOneRubric.status, 200);
  const lessonOneRubricBody = await lessonOneRubric.json();
  assert.equal(lessonOneRubricBody.lesson_id, 1);
  assert.equal(lessonOneRubricBody.monitor_role, 'scan_world_and_return_structured_raw_data');
  assert.equal(lessonOneRubricBody.code_rubric.owner, 'lomda',
    'the Monitor rubric should keep MakeCode grading ownership in the Lomda');
  assert.equal(lessonOneRubricBody.build_rubric.checks.some(check => check.id === 'straight_path'), true,
    'lesson one build rubric should describe the straight delivery path');
  assert.equal(lessonOneRubricBody.expected_stage_report_fields.includes('snapshot_map'), true,
    'Monitor reports should still return the top-down snapshot map');
  const lessonSixteenRubric = await getInternal(baseUrl, '/api/internal/craftom-school/lesson-rubric?lesson_id=16');
  assert.equal(lessonSixteenRubric.status, 200);
  const lessonSixteenRubricBody = await lessonSixteenRubric.json();
  assert.equal(lessonSixteenRubricBody.build_rubric.checks.some(check => check.id === 'two_or_more_automations'), true,
    'lesson sixteen build rubric should require multiple marked automations for the demo');

  const launch = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/launch`, {}, teacherACookie);
  assert.equal(launch.status, 200);
  const launchBody = await launch.json();
  assert.equal(launchBody.lesson.id, 0);
  assert.equal(launchBody.session.classroomId, classroomA.id);
  const firstOpenCall = monitorCalls.find(call => call.url === '/api/internal/craftom-school/v2/world/open');
  assert.ok(firstOpenCall, 'launch must open the world through the monitor');
  assert.equal(firstOpenCall.body.owner_id, classroomA.id);
  assert.equal(firstOpenCall.body.lesson_id, 0, 'world/open must tell the Monitor which lesson was launched');
  assert.equal(firstOpenCall.body.teacher_email, 'agent-a@example.test', 'world/open may include the launching teacher email for reports');
  const closeLessonZero = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/lessons/0/close`, {}, teacherACookie);
  assert.equal(closeLessonZero.status, 200, 'teacher can close lesson zero without opening lesson one');
  const closeLessonZeroBody = await closeLessonZero.json();
  assert.equal(closeLessonZeroBody.lessonAccess.openedLessonIds.includes(1), false,
    'closing lesson zero must not open lesson one');
  assert.equal(closeLessonZeroBody.classStageReport.reportText, 'דוח סוף שיעור 0 ממוניטור הבדיקה',
    'closing lesson zero should return the Monitor class report for immediate display');
  const closeLessonZeroReportCall = monitorCalls.filter(call => call.url === '/api/internal/craftom-school/kugel/class-report').at(-1);
  assert.equal(closeLessonZeroReportCall?.body.server, 'test-kugel-monitor',
    'closing lesson zero should ask the Monitor to generate the class report');
  const closeLessonZeroWorldCall = monitorCalls.filter(call => call.url === '/api/internal/craftom-school/v2/world/close').at(-1);
  assert.equal(closeLessonZeroWorldCall?.body.lease_id, firstOpenCall.body.lease_id,
    'closing lesson zero should close the active Minecraft lease');
  const relaunchAfterLessonZeroClose = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/launch`, {}, teacherACookie);
  assert.equal(relaunchAfterLessonZeroClose.status, 200, 'teacher can start lesson zero again after closing it');
  nextClassReportPayload = { ok: true, scan: { skipped: 'maze_world' }, lesson: 0 };
  nextCloseClassStageReportPayload = {
    lesson_id: 0,
    lesson_label: 'שיעור 0: מבוך המטבעות',
    generated_at: new Date().toISOString(),
    started_at: new Date(Date.now() - 120000).toISOString(),
    ended_at: new Date().toISOString(),
    report_text: '🎮 סיכום שיעור 0 (מבוך) — כיתה בדיקה\n🕐 09:58–11:08 | ילדים: 1\n────────────\n🏆 *סיימו את המבוך (לפי הזמן הטוב ביותר)*\n🥇 SecondSecure — 3:11 דק׳ (2 סיומים)\n\n👥 *נוכחות*\n• SecondSecure — נכנס 10:01, מחובר 16:49 דק׳\n\n💬 *תקשורת*\nלא נכתבו הודעות צ׳אט בין הילדים.',
    students: [],
  };
  const closeLessonZeroPostCloseReport = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/lessons/0/close`, {}, teacherACookie);
  assert.equal(closeLessonZeroPostCloseReport.status, 200, 'teacher can close lesson zero when the report is generated by shutdown');
  const closeLessonZeroPostCloseReportBody = await closeLessonZeroPostCloseReport.json();
  assert.match(closeLessonZeroPostCloseReportBody.classStageReport.reportText, /סיכום שיעור 0/,
    'lesson zero close should read the class_stage_report event created after Minecraft shuts down');
  assert.deepEqual(closeLessonZeroPostCloseReportBody.classStageReport.lessonZeroSummary, {
    studentCount: 1,
    completedCount: 1,
    presentCount: 1,
    chatMessages: 0,
  }, 'lesson zero class reports should parse activity counts from report_text when Monitor students is empty');
  const resetRunDb = new Database(dbFile);
  resetRunDb.prepare(`
    INSERT INTO kugel_student_runs (
      student_id, classroom_id, lesson_id, started_at, reset_at, finished_at,
      attempt_count, best_time_ms, best_finished_at, last_duration_ms, updated_at
    ) VALUES (?, ?, 0, ?, NULL, ?, 1, 42000, ?, 42000, ?)
    ON CONFLICT(student_id) DO UPDATE SET
      classroom_id = excluded.classroom_id,
      lesson_id = excluded.lesson_id,
      started_at = excluded.started_at,
      finished_at = excluded.finished_at,
      attempt_count = excluded.attempt_count,
      best_time_ms = excluded.best_time_ms,
      best_finished_at = excluded.best_finished_at,
      last_duration_ms = excluded.last_duration_ms,
      updated_at = excluded.updated_at
  `).run(studentA.id, classroomA.id, identityNow, identityNow, identityNow, identityNow);
  resetRunDb.close();
  const relaunchAfterPostCloseReport = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/launch`, { resetLessonZero: true }, teacherACookie);
  assert.equal(relaunchAfterPostCloseReport.status, 200, 'teacher can restart lesson zero after a post-close report');
  const afterResetRunDb = new Database(dbFile);
  assert.equal(afterResetRunDb.prepare('SELECT COUNT(*) count FROM kugel_student_runs WHERE classroom_id = ? AND lesson_id = 0').get(classroomA.id).count, 0,
    'restarting lesson zero from a report should reset previous lesson-zero maze run state');
  afterResetRunDb.close();
  const stableRelaunchOpen = monitorCalls.filter(call => call.url === '/api/internal/craftom-school/v2/world/open').at(-1);
  const stableLeaseId = stableRelaunchOpen.body.lease_id;
  const firstGeneration = stableRelaunchOpen.body.generation;
  const duplicateLaunch = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/launch`, {}, teacherACookie);
  assert.equal(duplicateLaunch.status, 200, 'the same class can restart its own active lesson zero');
  const lessonOneLaunch = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/lessons/1/launch`, {}, teacherACookie);
  assert.equal(lessonOneLaunch.status, 200, 'the same class can launch lesson one from the teacher board');
  const lessonOneLaunchBody = await lessonOneLaunch.json();
  assert.equal(lessonOneLaunchBody.lesson.id, 1);
  assert.equal(lessonOneLaunchBody.session.lessonId, 1);
  assert.equal(monitorCalls.some(call => call.url === '/api/internal/craftom-school/v2/world/open' && call.body.world === 'kugel-50-safe-compounds-v3-20260824'), true);
  const latestSequentialOpen = monitorCalls.filter(call => call.url === '/api/internal/craftom-school/v2/world/open').at(-1);
  assert.equal(latestSequentialOpen.body.lesson_id, 1, 'lesson one launches must identify lesson_id for the Monitor report');
  assert.equal(latestSequentialOpen.body.lease_id, stableLeaseId,
    'same-class sequential lesson switches must reuse the stable lease ID');
  assert.ok(latestSequentialOpen.body.generation > firstGeneration,
    'each same-class world switch must increment the persisted generation');
  worldOpenPreAdoptFailuresRemaining = 1;
  const failedPreAdoptSwitch = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/lessons/2/launch`, {}, teacherACookie);
  assert.equal(failedPreAdoptSwitch.status, 503, 'a switch that fails before adoption preserves the safe Monitor status');
  const afterPreAdoptSwitch = await fetch(`${baseUrl}/api/kugel/session?classroomId=${classroomA.id}`, { headers: { Cookie: teacherACookie } });
  const afterPreAdoptSwitchBody = await afterPreAdoptSwitch.json();
  assert.equal(afterPreAdoptSwitchBody.session.lessonId, 1,
    'the previous lesson must remain active when the monitor stayed on its generation');
  assert.equal(afterPreAdoptSwitchBody.session.serverState, 'running');
  assert.equal(monitorWorldLease.generation, latestSequentialOpen.body.generation,
    'the app must not close the proposed generation when the monitor still runs the previous one');

  worldOpenPreAdoptFailuresRemaining = 1;
  queuedStateResponses.push({
    active: true, state: 'starting', server: 'test-kugel-monitor', lease_id: monitorWorldLease.lease_id,
    generation: monitorWorldLease.generation, world: monitorWorldLease.world, last_error: null,
  });
  const unconfirmedRollbackSwitch = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/lessons/2/launch`, {}, teacherACookie);
  assert.equal(unconfirmedRollbackSwitch.status, 503);
  const unconfirmedRollbackView = await fetch(`${baseUrl}/api/kugel/session?classroomId=${classroomA.id}`, {
    headers: { Cookie: teacherACookie },
  });
  const unconfirmedRollbackBody = await unconfirmedRollbackView.json();
  assert.equal(unconfirmedRollbackBody.session.serverState, 'stopping',
    'a failed switch must stay blocked unless provider state explicitly confirms the previous generation is running');
  assert.equal(unconfirmedRollbackBody.session.lessonId, 2,
    'an unconfirmed provider rollback must not restore the previous lesson locally');
  await new Promise(resolve => setTimeout(resolve, 900));
  const confirmedRollbackView = await fetch(`${baseUrl}/api/kugel/session?classroomId=${classroomA.id}`, {
    headers: { Cookie: teacherACookie },
  });
  const confirmedRollbackBody = await confirmedRollbackView.json();
  assert.equal(confirmedRollbackBody.session.serverState, 'running');
  assert.equal(confirmedRollbackBody.session.lessonId, 1,
    'reconciliation may restore only after provider state explicitly reports the previous generation running');

  worldOpenDelayMs = 1500;
  worldOpenPreAdoptFailuresRemaining = 1;
  const timedOutUnadoptedSwitch = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/lessons/2/launch`, {}, teacherACookie);
  assert.equal(timedOutUnadoptedSwitch.status, 504,
    'a same-class switch that exceeds the client deadline remains ambiguous initially');
  await new Promise(resolve => setTimeout(resolve, 900));
  worldOpenDelayMs = 0;
  const automaticallyRestoredPrevious = await fetch(`${baseUrl}/api/kugel/session?classroomId=${classroomA.id}`, {
    headers: { Cookie: teacherACookie },
  });
  const automaticallyRestoredPreviousBody = await automaticallyRestoredPrevious.json();
  assert.equal(automaticallyRestoredPreviousBody.session.lessonId, 1,
    'automatic reconciliation must restore the exact previous generation when the late open was never adopted');
  assert.equal(automaticallyRestoredPreviousBody.session.serverState, 'running',
    'automatic reconciliation must clear the stopping wedge without restart or another teacher action');

  worldOpenAdoptState = 'starting';
  const nonRunningAdoption = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/lessons/2/launch`, {}, teacherACookie);
  assert.equal(nonRunningAdoption.status, 502, 'an open response is insufficient without exact remote running state');
  const afterNonRunningAdoption = await fetch(`${baseUrl}/api/kugel/session?classroomId=${classroomA.id}`, { headers: { Cookie: teacherACookie } });
  const afterNonRunningAdoptionBody = await afterNonRunningAdoption.json();
  assert.equal(afterNonRunningAdoptionBody.minecraft, null, 'non-running matching state must never expose Minecraft');
  assert.equal(afterNonRunningAdoptionBody.session.active, false, 'non-running adoption must be guarded-closed and confirmed');
  worldOpenAdoptState = 'running';
  const lessonTwoLaunch = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/lessons/2/launch`, {}, teacherACookie);
  assert.equal(lessonTwoLaunch.status, 200, 'the same class can launch lesson two with the shared Agent Academy world');
  const lessonTwoLaunchBody = await lessonTwoLaunch.json();
  assert.equal(lessonTwoLaunchBody.lesson.id, 2);
  assert.equal(lessonTwoLaunchBody.session.lessonId, 2);
  const conflictingLaunch = await post(baseUrl, `/api/kugel/classes/${classroomB.id}/launch`, {}, teacherBCookie);
  assert.equal(conflictingLaunch.status, 409, 'one Minecraft server must not be controlled by two classrooms at once');
  const foreignPlayerMessage = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/message`, { text: 'אסור', scope: 'player', target: 'OtherSecure' }, teacherACookie);
  assert.equal(foreignPlayerMessage.status, 404, 'a teacher must not control a Minecraft player from another class');
  nextMonitorError = { status: 503, payload: { error: 'monitor_busy', retryable: true } };
  const unavailableMessage = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/freeze`, {
    on: true, scope: 'all',
  }, teacherACookie);
  assert.equal(unavailableMessage.status, 503, 'safe Monitor statuses must survive for recovery and HTTP retry semantics');
  const unavailableMessageBody = await unavailableMessage.text();
  assert.doesNotMatch(unavailableMessageBody, /monitor_busy|retryable/,
    'raw Monitor codes and retry metadata must not be exposed to browsers');
  const redirectTargetsBefore = monitorCalls.filter(call => call.url === '/redirect-target').length;
  nextMonitorRedirect = true;
  const redirectedFreeze = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/freeze`, {
    on: false, scope: 'all',
  }, teacherACookie);
  assert.equal(redirectedFreeze.status, 502, 'a rejected Monitor redirect is reported as a generic upstream failure');
  assert.equal(monitorCalls.filter(call => call.url === '/redirect-target').length, redirectTargetsBefore,
    'lifecycle signatures and credentials must never be forwarded to a redirect target');

  const studentStart = await post(baseUrl, '/api/kugel/student/start', {}, studentACookie);
  assert.equal(studentStart.status, 200);
  const studentStartBody = await studentStart.json();
  assert.equal(studentStartBody.lesson.id, 2, 'student start should use the teacher-opened Minecraft lesson');
  assert.equal(studentStartBody.student.lessonId, 2, 'student run should be recorded against the active Minecraft lesson');
  assert.equal(studentStartBody.student.id, studentA.id);
  assert.equal(studentStartBody.student.minecraftPlayerName, 'NoaSecure');
  assert.ok(studentStartBody.minecraft.launchUrl.startsWith('minecraftedu://'));

  const pngBytes = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');
  const pngDataUrl = `data:image/png;base64,${pngBytes.toString('base64')}`;
  const blockedBeforeLessonZero = await post(baseUrl, '/api/craftom/exit-ticket', {
    lessonId: 1,
    challengeId: 1,
    lessonTitle: 'שיעור חסום',
    challengeTitle: 'אתגר חסום',
    exitQuestion: 'מה בנית?',
    answer: 'ניסיון לפני השלמת שיעור האפס',
    photo: { name: 'blocked.png', dataUrl: pngDataUrl },
  }, submissionStudentCookie);
  assert.equal(blockedBeforeLessonZero.status, 423, 'Craftom submissions beyond lesson zero require teacher lesson access');

  const openLessonOneForSubmissions = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/lessons/1/open`, {}, teacherACookie);
  const openLessonOneForSubmissionsBody = await openLessonOneForSubmissions.json();
  assert.equal(openLessonOneForSubmissions.status, 200, 'teacher must open lesson one before students can submit lesson one work');
  assert.deepEqual(openLessonOneForSubmissionsBody.lessonAccess.openedLessonIds, [0, 1]);

  const closeLessonOneForSubmissions = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/lessons/1/close`, {}, teacherACookie);
  const closeLessonOneForSubmissionsBody = await closeLessonOneForSubmissions.json();
  assert.equal(closeLessonOneForSubmissions.status, 200, 'teacher must be able to lock an open lesson again');
  assert.deepEqual(closeLessonOneForSubmissionsBody.lessonAccess.openedLessonIds, [0]);
  assert.equal(closeLessonOneForSubmissionsBody.lessonAccess.lessons.find(lesson => Number(lesson.id) === 1).open, false);

  const blockedAfterLessonLock = await post(baseUrl, '/api/craftom/exit-ticket', {
    lessonId: 1,
    challengeId: 1,
    lessonTitle: 'שיעור נעול',
    challengeTitle: 'אתגר נעול',
    exitQuestion: 'מה בנית?',
    answer: 'ניסיון אחרי נעילה',
    photo: { name: 'locked.png', dataUrl: pngDataUrl },
  }, submissionStudentCookie);
  assert.equal(blockedAfterLessonLock.status, 423, 'locked Craftom lessons should stop accepting new student submissions');

  const reopenLessonOneForSubmissions = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/lessons/1/open`, {}, teacherACookie);
  const reopenLessonOneForSubmissionsBody = await reopenLessonOneForSubmissions.json();
  assert.equal(reopenLessonOneForSubmissions.status, 200, 'teacher must be able to reopen a locked lesson');
  assert.deepEqual(reopenLessonOneForSubmissionsBody.lessonAccess.openedLessonIds, [0, 1]);

  const anonymousSubmission = await post(baseUrl, '/api/craftom/exit-ticket', {
    lessonId: 1,
    answer: 'ללא כניסה',
    photo: { name: 'anonymous.png', dataUrl: pngDataUrl },
  });
  assert.equal(anonymousSubmission.status, 401, 'Craftom submissions require a classroom student session');
  const invalidCraftomSubmission = await post(baseUrl, '/api/craftom/exit-ticket', {
    lessonId: 1,
    challengeId: 1,
    lessonTitle: 'שיעור בדיקה',
    challengeTitle: 'אתגר בדיקה',
    exitQuestion: 'מה בנית?',
    answer: 'בדקתי העלאה',
    photo: { name: 'bad.svg', dataUrl: 'data:image/svg+xml;base64,PHN2Zy8+' },
  }, submissionStudentCookie);
  assert.equal(invalidCraftomSubmission.status, 400, 'Craftom submissions must reject SVG uploads');

  const spoofedCraftomSubmission = await post(baseUrl, '/api/craftom/exit-ticket', {
    lessonId: 1,
    challengeId: 1,
    lessonTitle: 'שיעור בדיקה',
    challengeTitle: 'אתגר בדיקה',
    exitQuestion: 'מה בנית?',
    answer: 'בדקתי קובץ מתחזה',
    photo: { name: 'spoofed.png', dataUrl: `data:image/png;base64,${Buffer.from('<script>alert(1)</script>').toString('base64')}` },
  }, submissionStudentCookie);
  assert.equal(spoofedCraftomSubmission.status, 400, 'Craftom submissions must validate image bytes, not only the declared MIME type');

  const craftomSubmission = await post(baseUrl, '/api/craftom/exit-ticket', {
    lessonId: 1,
    challengeId: 1,
    lessonTitle: 'שיעור בדיקה',
    challengeTitle: 'אתגר בדיקה',
    exitQuestion: 'מה בנית?',
    answer: 'בנינו מסלול קטן ובדקנו שה-Agent מתקדם',
    photo: { name: 'work.png', dataUrl: pngDataUrl },
  }, submissionStudentCookie);
  assert.equal(craftomSubmission.status, 201);
  const craftomSubmissionBody = await craftomSubmission.json();
  assert.equal(craftomSubmissionBody.submission.lessonId, 1);
  assert.equal(craftomSubmissionBody.submission.courseId, 'craftom-agent');
  assert.equal(craftomSubmissionBody.submission.studentId, undefined, 'student submission response must not echo trusted identity fields');
  assert.equal(craftomSubmissionBody.submission.classroomId, undefined, 'student submission response must not echo trusted classroom fields');
  assert.equal(craftomSubmissionBody.submission.replaced, false);
  const attachmentDir = join(tempDir, 'craftom-exit-ticket-attachments');
  const [firstAttachmentName] = readdirSync(attachmentDir);
  assert.equal(statSync(attachmentDir).mode & 0o777, 0o700, 'private Craftom attachment directory must not be readable by other host users');
  assert.equal(statSync(join(attachmentDir, firstAttachmentName)).mode & 0o777, 0o600, 'private Craftom photos must use owner-only permissions');
  const directStaticPhoto = await fetch(`${baseUrl}/data/craftom-exit-ticket-attachments/${encodeURIComponent(firstAttachmentName)}`);
  assert.ok([403, 404].includes(directStaticPhoto.status), 'private Craftom photos must remain blocked from direct static serving');

  const studentOwnSubmissions = await fetch(`${baseUrl}/api/craftom/submissions?lessonId=1`, { headers: { Cookie: submissionStudentCookie } });
  assert.equal(studentOwnSubmissions.status, 200);
  const studentOwnSubmissionsBody = await studentOwnSubmissions.json();
  assert.equal(studentOwnSubmissionsBody.role, 'student');
  assert.equal(studentOwnSubmissionsBody.submissions.length, 1);
  assert.equal(studentOwnSubmissionsBody.submissions[0].id, craftomSubmissionBody.submission.id);
  const anonymousSubmissionList = await fetch(`${baseUrl}/api/craftom/submissions?lessonId=1`);
  assert.equal(anonymousSubmissionList.status, 401, 'Craftom submission lists require a classroom session');
  const invalidLessonSubmissionList = await fetch(`${baseUrl}/api/craftom/submissions?lessonId=not-a-lesson`, { headers: { Cookie: submissionStudentCookie } });
  assert.equal(invalidLessonSubmissionList.status, 400, 'Craftom submission list filters must reject invalid lesson IDs');
  const otherStudentSubmissions = await fetch(`${baseUrl}/api/craftom/submissions?lessonId=1`, { headers: { Cookie: studentACookie } });
  assert.equal(otherStudentSubmissions.status, 200);
  assert.equal((await otherStudentSubmissions.json()).submissions.length, 0, 'students must not list another student’s Craftom submissions');

  const teacherSubmissions = await fetch(`${baseUrl}/api/craftom/submissions?classroomId=${classroomA.id}&lessonId=1`, { headers: { Cookie: teacherACookie } });
  assert.equal(teacherSubmissions.status, 200);
  const teacherSubmissionsBody = await teacherSubmissions.json();
  assert.equal(teacherSubmissionsBody.role, 'teacher');
  assert.equal(teacherSubmissionsBody.submissions.length, 1);
  assert.equal(teacherSubmissionsBody.submissions[0].studentId, studentASecond.id);
  assert.equal(teacherSubmissionsBody.submissions[0].studentName, 'תלמיד נוסף');

  const foreignTeacherSubmissions = await fetch(`${baseUrl}/api/craftom/submissions?classroomId=${classroomA.id}&lessonId=1`, { headers: { Cookie: teacherBCookie } });
  assert.equal(foreignTeacherSubmissions.status, 404, 'a teacher must not read Craftom submissions from another class');
  const missingTeacherClassroom = await fetch(`${baseUrl}/api/craftom/submissions?lessonId=1`, { headers: { Cookie: teacherACookie } });
  assert.equal(missingTeacherClassroom.status, 400, 'teacher Craftom submission reads must name an owned classroom');

  const submissionPhotoUrl = craftomSubmissionBody.submission.photo.url;
  const studentPhoto = await fetch(`${baseUrl}${submissionPhotoUrl}`, { headers: { Cookie: submissionStudentCookie } });
  assert.equal(studentPhoto.status, 200);
  assert.equal(studentPhoto.headers.get('content-type'), 'image/png');
  assert.equal(studentPhoto.headers.get('cache-control'), 'private, no-store');
  assert.deepEqual(Buffer.from(await studentPhoto.arrayBuffer()), pngBytes);
  const anonymousPhoto = await fetch(`${baseUrl}${submissionPhotoUrl}`);
  assert.equal(anonymousPhoto.status, 401, 'Craftom photos must never be available without a classroom session');
  const studentPhotoHead = await fetch(`${baseUrl}${submissionPhotoUrl}`, { method: 'HEAD', headers: { Cookie: submissionStudentCookie } });
  assert.equal(studentPhotoHead.status, 200, 'authorized Craftom photos must support HEAD');
  assert.equal((await studentPhotoHead.arrayBuffer()).byteLength, 0, 'HEAD responses must not include photo bytes');
  const otherStudentPhoto = await fetch(`${baseUrl}${submissionPhotoUrl}`, { headers: { Cookie: studentACookie } });
  assert.equal(otherStudentPhoto.status, 404, 'a student must not read another student Craftom photo');
  const otherTeacherPhoto = await fetch(`${baseUrl}${submissionPhotoUrl}`, { headers: { Cookie: teacherBCookie } });
  assert.equal(otherTeacherPhoto.status, 404, 'a teacher must not read another class Craftom photo');

  const replacementSubmission = await post(baseUrl, '/api/craftom/exit-ticket', {
    lessonId: 1,
    challengeId: 1,
    lessonTitle: 'שיעור בדיקה',
    challengeTitle: 'אתגר בדיקה',
    exitQuestion: 'מה בנית?',
    answer: 'החלפתי תמונה אחרי תיקון קטן',
    photo: { name: 'work-fixed.webp', dataUrl: 'data:image/webp;base64,UklGRhIAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==' },
  }, submissionStudentCookie);
  assert.equal(replacementSubmission.status, 201);
  const replacementSubmissionBody = await replacementSubmission.json();
  assert.equal(replacementSubmissionBody.submission.id, craftomSubmissionBody.submission.id);
  assert.equal(replacementSubmissionBody.submission.replaced, true);
  assert.equal(replacementSubmissionBody.submission.replacementCount, 1);
  assert.equal(readdirSync(join(tempDir, 'craftom-exit-ticket-attachments')).length, 1, 'replacing a Craftom photo must delete the superseded private file');

  const openLessonTwoForSubmissions = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/lessons/2/open`, {}, teacherACookie);
  const openLessonTwoForSubmissionsBody = await openLessonTwoForSubmissions.json();
  assert.equal(openLessonTwoForSubmissions.status, 200, 'teacher must open lesson two before students can submit lesson two work');
  assert.deepEqual(openLessonTwoForSubmissionsBody.lessonAccess.openedLessonIds, [0, 1, 2]);
  const lessonTwoSubmission = await post(baseUrl, '/api/craftom/exit-ticket', {
    lessonId: 2,
    challengeId: 1,
    lessonTitle: 'שיעור שני',
    challengeTitle: 'אתגר ראשון',
    exitQuestion: 'מה שיניתם?',
    answer: 'בדקנו מעקב נפרד לכל שיעור',
    photo: { name: 'lesson-two.png', dataUrl: pngDataUrl },
  }, submissionStudentCookie);
  assert.equal(lessonTwoSubmission.status, 201);
  const openLessonThreeForSlowRace = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/lessons/3/open`, {}, teacherACookie);
  const openLessonThreeForSlowRaceBody = await openLessonThreeForSlowRace.json();
  assert.equal(openLessonThreeForSlowRace.status, 200, 'teacher must open lesson three before students can submit lesson three work');
  assert.deepEqual(openLessonThreeForSlowRaceBody.lessonAccess.openedLessonIds, [0, 1, 2, 3]);
  const filesBeforeSlowArchive = new Set(readdirSync(attachmentDir));
  const slowSubmission = slowPost(baseUrl, '/api/craftom/exit-ticket', {
    lessonId: 3, challengeId: 1, lessonTitle: 'מירוץ גוף איטי', challengeTitle: 'אתגר',
    exitQuestion: 'מה בניתם?', answer: 'הגשה שחייבת להתבטל אחרי ארכוב',
    photo: { name: 'slow-race.png', dataUrl: pngDataUrl },
  }, submissionStudentCookie);
  await new Promise(resolve => setTimeout(resolve, 30));
  const archiveDuringSlowBody = await post(baseUrl, `/api/classroom/classes/${classroomA.id}/students/${studentASecond.id}/archive`, {}, teacherACookie);
  assert.equal(archiveDuringSlowBody.status, 200);
  slowSubmission.finish();
  const rejectedSlowSubmission = await slowSubmission.response;
  assert.ok([401, 409].includes(rejectedSlowSubmission.status), `slow exit ticket must reject after archive: ${rejectedSlowSubmission.status} ${rejectedSlowSubmission.body}`);
  const slowRaceDb = new Database(dbFile);
  assert.equal(slowRaceDb.prepare('SELECT COUNT(*) count FROM craftom_lesson_submissions WHERE student_id = ? AND lesson_id = 3').get(studentASecond.id).count, 0);
  assert.equal(slowRaceDb.prepare("SELECT COUNT(*) count FROM classroom_progress WHERE student_id = ? AND course_id = 'craftom-agent' AND lesson_id = '3' AND activity_id = 'exit-ticket'").get(studentASecond.id).count, 0);
  slowRaceDb.close();
  assert.deepEqual(new Set(readdirSync(attachmentDir)), filesBeforeSlowArchive, 'rejected slow exit ticket must clean its newly written file');
  assert.equal((await post(baseUrl, `/api/classroom/classes/${classroomA.id}/students/${studentASecond.id}/restore`, {}, teacherACookie)).status, 200);
  const reloginSubmissionStudent = await post(baseUrl, '/api/classroom/student-login', { classCode: classroomA.joinCode, personalCode: studentASecond.loginCode });
  assert.equal(reloginSubmissionStudent.status, 200);
  submissionStudentCookie = cookie(reloginSubmissionStudent);
  const lessonOneTeacherView = await fetch(`${baseUrl}/api/kugel/session?classroomId=${classroomA.id}&lessonId=1`, { headers: { Cookie: teacherACookie } });
  assert.equal(lessonOneTeacherView.status, 200);
  const lessonOneTeacherViewBody = await lessonOneTeacherView.json();
  assert.equal(lessonOneTeacherViewBody.trackedLessonId, 1);
  const lessonOneStudent = lessonOneTeacherViewBody.students.find(item => item.id === studentASecond.id);
  assert.equal(lessonOneStudent.submission.lessonId, 1, 'teacher tracking must use the explicitly selected lesson rather than the active Minecraft lesson');
  assert.equal(lessonOneTeacherViewBody.metrics.active, 0, 'historical lesson metrics must not count a run from another lesson');

  const relaunchLessonZero = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/launch`, {}, teacherACookie);
  assert.equal(relaunchLessonZero.status, 200);
  assert.equal((await relaunchLessonZero.json()).lesson.id, 0, 'attempt metrics are recorded only while lesson zero is active');
  const lessonZeroStart = await post(baseUrl, '/api/kugel/student/start', {}, studentACookie);
  assert.equal(lessonZeroStart.status, 200);
  assert.equal((await lessonZeroStart.json()).student.lessonId, 0);

  gameEvents = forLease([
    { id: 40, event_type: 'chat_message', player_name: 'NoaSecure', created_at: new Date().toISOString(), payload: JSON.stringify({ coin_index: 1, coins: 8, finish: true, completed: true }) },
  ]);
  const forgedPayloadFinish = await post(baseUrl, '/api/kugel/student/finish', {}, studentACookie);
  assert.equal(forgedPayloadFinish.status, 409, 'unrelated events with forged progress fields must not complete the lesson');

  const otherStudentStart = await post(baseUrl, '/api/kugel/student/start', {}, studentBCookie);
  assert.equal(otherStudentStart.status, 409, 'a student cannot join a class whose teacher has not launched lesson zero');

  const now = new Date(Date.now() + 5000).toISOString();
  const successfulEventRows = [
    { id: 11, event_type: 'player_join', player_name: 'NoaSecure', created_at: now, payload: '{}' },
    ...Array.from({ length: 8 }, (_, index) => ({ id: index + 12, event_type: 'coin_collected', player_name: 'NoaSecure', created_at: now, block_id: 'gold_block', payload: JSON.stringify({ coin_index: index + 1 }) })),
    { id: 20, event_type: 'finish_button_pressed', player_name: 'NoaSecure', created_at: now, payload: JSON.stringify({ completed: true }) },
  ];
  gameEvents = successfulEventRows;
  const untaggedEventsFinish = await post(baseUrl, '/api/kugel/student/finish', {}, studentACookie);
  assert.equal(untaggedEventsFinish.status, 409, 'provider events without exact lease generation and world tags must be rejected');
  gameEvents = forLease(successfulEventRows).map(row => ({ ...row, generation: row.generation - 1 }));
  const mismatchedGenerationFinish = await post(baseUrl, '/api/kugel/student/finish', {}, studentACookie);
  assert.equal(mismatchedGenerationFinish.status, 409, 'successful events from another generation must be rejected');

  gameEvents = forLease([
    { id: 1, event_type: 'player_join', player_name: 'NoaSecure', created_at: now, payload: '{}' },
    ...Array.from({ length: 8 }, (_, index) => ({ id: index + 2, event_type: 'coin_collected', player_name: 'NoaSecure', created_at: now, block_id: 'gold_block', payload: JSON.stringify({ coin_index: 1 }) })),
    { id: 10, event_type: 'finish_button_pressed', player_name: 'NoaSecure', created_at: now, payload: JSON.stringify({ completed: true }) },
  ]);
  const duplicateCoinsFinish = await post(baseUrl, '/api/kugel/student/finish', {}, studentACookie);
  assert.equal(duplicateCoinsFinish.status, 409, 'repeated reports for one coin must not complete lesson zero');

  const earlyFinishAt = new Date(Date.now() - 100).toISOString();
  const laterCoinAt = new Date().toISOString();
  gameEvents = forLease([
    { id: 50, event_type: 'finish_button_pressed', player_name: 'NoaSecure', created_at: earlyFinishAt, payload: JSON.stringify({ completed: true }) },
    ...Array.from({ length: 8 }, (_, index) => ({ id: 60 + index, event_type: 'coin_collected', player_name: 'NoaSecure', created_at: laterCoinAt, payload: JSON.stringify({ coin_index: index + 1 }) })),
  ]);
  const finishBeforeCoins = await post(baseUrl, '/api/kugel/student/finish', {}, studentACookie);
  assert.equal(finishBeforeCoins.status, 409, 'the finish button must be pressed after the eighth distinct coin');

  gameEvents = forLease(successfulEventRows);

  await new Promise(resolve => setTimeout(resolve, 2500));
  let releaseTeacherViewEvents;
  gameEventsGate = new Promise(resolve => { releaseTeacherViewEvents = resolve; });
  const teacherViewEventsStarted = new Promise(resolve => { gameEventsStartedResolve = resolve; });
  const delayedTeacherView = fetch(`${baseUrl}/api/kugel/session?classroomId=${classroomA.id}`, {
    headers: { Cookie: teacherACookie },
  });
  await teacherViewEventsStarted;
  const revokeTeacherViewDb = new Database(dbFile);
  revokeTeacherViewDb.prepare('DELETE FROM teacher_courses WHERE teacher_id = ? AND course_id = ?')
    .run(teacherA.id, 'craftom-agent');
  revokeTeacherViewDb.close();
  releaseTeacherViewEvents(); gameEventsGate = null;
  const revokedTeacherView = await delayedTeacherView;
  const revokedTeacherViewBody = await revokedTeacherView.text();
  assert.equal(revokedTeacherView.status, 409,
    'teacher session view must reject entitlement revocation while game events are awaited');
  assert.doesNotMatch(revokedTeacherViewBody, /test-access-code|NoaSecure/,
    'rejected teacher view must not return Minecraft credentials or protected class data');
  const restoreTeacherViewDb = new Database(dbFile);
  restoreTeacherViewDb.prepare('INSERT INTO teacher_courses (teacher_id, course_id, created_at) VALUES (?, ?, ?)')
    .run(teacherA.id, 'craftom-agent', new Date().toISOString());
  restoreTeacherViewDb.close();

  await new Promise(resolve => setTimeout(resolve, 1100));
  let releaseStudentViewEvents;
  gameEventsGate = new Promise(resolve => { releaseStudentViewEvents = resolve; });
  const studentViewEventsStarted = new Promise(resolve => { gameEventsStartedResolve = resolve; });
  const delayedStudentView = fetch(`${baseUrl}/api/kugel/session`, { headers: { Cookie: studentACookie } });
  await studentViewEventsStarted;
  const revokeStudentViewDb = new Database(dbFile);
  revokeStudentViewDb.prepare(`UPDATE classroom_student_sessions SET revoked_at = ?
    WHERE student_id = ? AND revoked_at IS NULL`).run(new Date().toISOString(), studentA.id);
  revokeStudentViewDb.close();
  releaseStudentViewEvents(); gameEventsGate = null;
  const revokedStudentView = await delayedStudentView;
  const revokedStudentViewBody = await revokedStudentView.text();
  assert.equal(revokedStudentView.status, 401,
    'student session view must reject session revocation while game events are awaited');
  assert.doesNotMatch(revokedStudentViewBody, /test-access-code|NoaSecure/,
    'rejected student view must not return Minecraft credentials or protected event data');
  const reloginAfterViewRevocation = await post(baseUrl, '/api/classroom/student-login', {
    classCode: classroomA.joinCode, personalCode: studentA.loginCode,
  });
  assert.equal(reloginAfterViewRevocation.status, 200);
  studentACookie = cookie(reloginAfterViewRevocation);

  await new Promise(resolve => setTimeout(resolve, 1100));
  let releaseLeaseChangeViewEvents;
  gameEventsGate = new Promise(resolve => { releaseLeaseChangeViewEvents = resolve; });
  const leaseChangeViewEventsStarted = new Promise(resolve => { gameEventsStartedResolve = resolve; });
  const delayedLeaseChangeView = fetch(`${baseUrl}/api/kugel/session`, { headers: { Cookie: studentACookie } });
  await leaseChangeViewEventsStarted;
  const leaseChangeViewDb = new Database(dbFile);
  const leaseBeforeViewChange = leaseChangeViewDb.prepare(`
    SELECT generation, world_id FROM kugel_class_sessions WHERE classroom_id = ?
  `).get(classroomA.id);
  leaseChangeViewDb.prepare(`UPDATE kugel_class_sessions
    SET generation = generation + 1, world_id = ? WHERE classroom_id = ?`)
    .run('lease-race-world', classroomA.id);
  leaseChangeViewDb.close();
  releaseLeaseChangeViewEvents(); gameEventsGate = null;
  const staleLeaseStudentView = await delayedLeaseChangeView;
  const staleLeaseStudentViewBody = await staleLeaseStudentView.text();
  assert.equal(staleLeaseStudentView.status, 409,
    'student session view must reject an exact lease generation/world change while events are awaited');
  assert.doesNotMatch(staleLeaseStudentViewBody, /test-access-code|NoaSecure/,
    'stale lease view must not return Minecraft credentials or protected event data');
  const restoreLeaseChangeViewDb = new Database(dbFile);
  restoreLeaseChangeViewDb.prepare(`UPDATE kugel_class_sessions SET generation = ?, world_id = ? WHERE classroom_id = ?`)
    .run(leaseBeforeViewChange.generation, leaseBeforeViewChange.world_id, classroomA.id);
  restoreLeaseChangeViewDb.close();

  while (Date.now() % 1000 > 100) await new Promise(resolve => setTimeout(resolve, 10));
  const sameSecondBaselineLaunch = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/lessons/0/launch`, {}, teacherACookie);
  assert.equal(sameSecondBaselineLaunch.status, 200);
  const beforeSameSecondRelaunchDb = new Database(dbFile, { readonly: true });
  const beforeSameSecondRelaunch = beforeSameSecondRelaunchDb.prepare(`
    SELECT launch_token, generation, world_id, events_since FROM kugel_class_sessions WHERE classroom_id = ?
  `).get(classroomA.id);
  beforeSameSecondRelaunchDb.close();
  const sameSecondSuccessRows = successfulEventRows.map(row => ({ ...row, created_at: new Date().toISOString() }));
  gameEvents = forLease(sameSecondSuccessRows);
  const oldGenerationEvents = gameEvents;
  let releaseFinishEvents;
  gameEventsGate = new Promise(resolve => { releaseFinishEvents = resolve; });
  const finishEventsStarted = new Promise(resolve => { gameEventsStartedResolve = resolve; });
  const delayedFinishBeforeSameLessonRelaunch = post(baseUrl, '/api/kugel/student/finish', {}, studentACookie);
  await finishEventsStarted;
  const sameLessonRelaunchPromise = post(baseUrl, `/api/kugel/classes/${classroomA.id}/lessons/0/launch`, {}, teacherACookie);
  let relaunchedGeneration;
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const pollDb = new Database(dbFile, { readonly: true });
    relaunchedGeneration = pollDb.prepare(`
      SELECT generation, world_id, events_since, server_state FROM kugel_class_sessions WHERE classroom_id = ?
    `).get(classroomA.id);
    pollDb.close();
    if (relaunchedGeneration.generation > beforeSameSecondRelaunch.generation
      && relaunchedGeneration.server_state === 'running') break;
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  assert.ok(relaunchedGeneration.generation > beforeSameSecondRelaunch.generation,
    'same-lesson relaunch must advance the persisted generation while finish is delayed');
  assert.equal(relaunchedGeneration.world_id, beforeSameSecondRelaunch.world_id);
  assert.equal(relaunchedGeneration.events_since, beforeSameSecondRelaunch.events_since,
    'the deterministic race must relaunch the same lesson within the same event timestamp second');
  assert.equal(gameEvents, oldGenerationEvents,
    'the provider keeps the old generation successful events visible during the same-second relaunch');
  releaseFinishEvents(); gameEventsGate = null;
  const staleSameLessonFinish = await delayedFinishBeforeSameLessonRelaunch;
  assert.equal(staleSameLessonFinish.status, 409,
    'a finish delayed across a same-lesson same-second relaunch must reject the stale generation');
  assert.equal((await sameLessonRelaunchPromise).status, 200);
  const afterStaleSameLessonFinishDb = new Database(dbFile, { readonly: true });
  const afterStaleSameLessonFinishRun = afterStaleSameLessonFinishDb.prepare(`
    SELECT attempt_count, finished_at FROM kugel_student_runs WHERE student_id = ?
  `).get(studentA.id);
  const afterStaleSameLessonFinishProgress = afterStaleSameLessonFinishDb.prepare(`
    SELECT COUNT(*) count FROM classroom_progress
    WHERE student_id = ? AND course_id = 'craftom-agent' AND lesson_id = '0' AND activity_id = 'minecraft-maze'
  `).get(studentA.id);
  afterStaleSameLessonFinishDb.close();
  assert.deepEqual(afterStaleSameLessonFinishRun, { attempt_count: 0, finished_at: null },
    'stale same-lesson finish must not complete or increment the attempt');
  assert.equal(afterStaleSameLessonFinishProgress.count, 0,
    'stale same-lesson finish must not persist lesson completion');

  const staleEventRead = monitorCalls.findLast(call => call.url === '/api/internal/craftom-school/v2/world/events'
    && call.body.generation === beforeSameSecondRelaunch.generation);
  assert.deepEqual(
    { server: staleEventRead.body.server, owner_id: staleEventRead.body.owner_id, lease_id: staleEventRead.body.lease_id,
      generation: staleEventRead.body.generation, world: staleEventRead.body.world },
    { server: 'test-kugel-monitor', owner_id: classroomA.id, lease_id: beforeSameSecondRelaunch.launch_token,
      generation: beforeSameSecondRelaunch.generation, world: beforeSameSecondRelaunch.world_id },
    'event reads must bind the exact owner, lease, generation, and world in the signed POST body',
  );
  gameEvents = forLease(sameSecondSuccessRows);
  const monitorReadsBeforeViews = monitorCalls.filter(call => call.url === '/api/internal/craftom-school/v2/world/events').length;
  const teacherView = await fetch(`${baseUrl}/api/kugel/session?classroomId=${classroomA.id}`, { headers: { Cookie: teacherACookie } });
  assert.equal(teacherView.status, 200);
  const teacherViewBody = await teacherView.json();
  assert.equal(teacherViewBody.role, 'teacher');
  assert.equal(teacherViewBody.students.length, 2);
  const teacherStudentA = teacherViewBody.students.find(item => item.id === studentA.id);
  assert.equal(teacherStudentA.coins, 8);
  assert.equal(teacherStudentA.completed, true);

  const studentView = await fetch(`${baseUrl}/api/kugel/session`, { headers: { Cookie: studentACookie } });
  assert.equal(studentView.status, 200);
  const studentViewBody = await studentView.json();
  assert.equal(studentViewBody.role, 'student');
  assert.equal(studentViewBody.student.id, studentA.id);
  assert.equal('students' in studentViewBody, false, 'students receive only their own Agent Academy state');
  assert.equal(JSON.stringify(studentViewBody).includes(studentB.id), false);
  assert.equal(studentViewBody.student.completionRecorded, false, 'verified game events alone must not unlock lesson 1 before progress is persisted');
  const monitorReadsAfterViews = monitorCalls.filter(call => call.url === '/api/internal/craftom-school/v2/world/events').length;
  assert.equal(monitorReadsAfterViews - monitorReadsBeforeViews, 1, 'teacher and student polling must share a short monitor-event cache');

  const metricsSchemaDb = new Database(dbFile);
  const runColumns = new Set(metricsSchemaDb.prepare("PRAGMA table_info('kugel_student_runs')").all().map(column => column.name));
  metricsSchemaDb.close();
  assert.deepEqual(
    ['attempt_count', 'best_time_ms', 'best_finished_at', 'last_duration_ms'].filter(column => !runColumns.has(column)),
    [],
    'lesson-zero run metrics must migrate additively on an existing classroom database',
  );

  const firstAttemptDb = new Database(dbFile);
  firstAttemptDb.prepare('UPDATE kugel_student_runs SET started_at = ? WHERE student_id = ?')
    .run(new Date(Date.now() - 2000).toISOString(), studentA.id);
  firstAttemptDb.close();

  const [finish, concurrentFinish] = await Promise.all([
    post(baseUrl, '/api/kugel/student/finish', {}, studentACookie),
    post(baseUrl, '/api/kugel/student/finish', {}, studentACookie),
  ]);
  assert.equal(finish.status, 200);
  assert.equal(concurrentFinish.status, 200);
  const finishBody = await finish.json();
  const concurrentFinishBody = await concurrentFinish.json();
  assert.equal(finishBody.progress.status, 'completed');
  assert.equal(finishBody.student.attemptCount, 1, 'the first valid finish records exactly one completed attempt');
  assert.equal(concurrentFinishBody.student.attemptCount, 1, 'concurrent duplicate finishes remain idempotent');
  assert.equal(Number.isInteger(finishBody.student.lastDurationMs), true, 'a valid finish records its duration');
  assert.equal(finishBody.student.lastDurationMs >= 0, true);
  assert.equal(finishBody.student.bestTimeMs, finishBody.student.lastDurationMs, 'the first duration becomes the personal best');
  assert.equal(Boolean(finishBody.student.bestFinishedAt), true, 'the best attempt records when it finished');
  const finishAgain = await post(baseUrl, '/api/kugel/student/finish', {}, studentACookie);
  assert.equal(finishAgain.status, 200);
  const finishAgainBody = await finishAgain.json();
  assert.equal(finishAgainBody.progress.attempts, 1, 'repeating finish must be idempotent');
  assert.equal(finishAgainBody.student.attemptCount, 1, 'repeating finish must not create another completed attempt');
  const restartAfterFinish = await post(baseUrl, '/api/kugel/student/start', {}, studentACookie);
  assert.equal(restartAfterFinish.status, 200);
  const staleFinishAfterRestart = await post(baseUrl, '/api/kugel/student/finish', {}, studentACookie);
  assert.equal(staleFinishAfterRestart.status, 200, 'opening Minecraft again after completion remains idempotent');
  assert.equal((await staleFinishAfterRestart.json()).student.attemptCount, 1, 'opening Minecraft again must not reuse old events as another attempt');

  const completedAttemptBoundary = finishBody.student.resetAt;
  const completedAttemptFinishedAt = finishBody.student.finishedAt;
  const teacherRelaunchAfterFinish = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/launch`, {}, teacherACookie);
  assert.equal(teacherRelaunchAfterFinish.status, 200);
  const relaunchedAttemptDb = new Database(dbFile);
  const relaunchedAttempt = relaunchedAttemptDb.prepare(`
    SELECT reset_at, finished_at, attempt_count FROM kugel_student_runs WHERE student_id = ?
  `).get(studentA.id);
  relaunchedAttemptDb.close();
  assert.equal(relaunchedAttempt.reset_at, completedAttemptBoundary, 'teacher relaunch must not create a new attempt boundary');
  assert.equal(relaunchedAttempt.finished_at, completedAttemptFinishedAt, 'teacher relaunch must preserve the completed attempt');
  assert.equal(relaunchedAttempt.attempt_count, 1);

  const recordedView = await fetch(`${baseUrl}/api/kugel/session`, { headers: { Cookie: studentACookie } });
  assert.equal((await recordedView.json()).student.completionRecorded, true);
  gameEventsDelayMs = 1800;
  const staleStatusFallbackStartedAt = Date.now();
  const staleStatusFallbackView = await fetch(`${baseUrl}/api/kugel/session?classroomId=${classroomA.id}`, { headers: { Cookie: teacherACookie } });
  const staleStatusFallbackElapsedMs = Date.now() - staleStatusFallbackStartedAt;
  gameEventsDelayMs = 0;
  assert.equal(staleStatusFallbackView.status, 200, 'teacher monitor must load even when live Minecraft events are slow');
  assert.equal(staleStatusFallbackElapsedMs < 5000, true, 'teacher monitor must not wait for the full slow live Minecraft read');
  const staleStatusFallbackBody = await staleStatusFallbackView.json();
  const staleStatusFallbackStudent = staleStatusFallbackBody.students.find(student => student.id === studentA.id);
  assert.equal(staleStatusFallbackStudent.coins, 8, 'teacher monitor falls back to the last recorded lesson-zero result');
  assert.equal(staleStatusFallbackStudent.minecraftStatus, 'completed', 'stored completion remains visible when live Minecraft is unavailable');

  const malformedScope = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/message`, { text: 'טעות', scope: 'typo' }, teacherACookie);
  assert.equal(malformedScope.status, 400, 'unknown control scope must not become a class-wide action');
  const malformedFreeze = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/freeze`, { on: 'false', scope: 'all' }, teacherACookie);
  assert.equal(malformedFreeze.status, 400, 'freeze state must be an actual boolean');
  const message = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/message`, { text: 'כל הכבוד', scope: 'all' }, teacherACookie);
  assert.equal(message.status, 200);
  const freeze = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/freeze`, { on: true, scope: 'all' }, teacherACookie);
  assert.equal(freeze.status, 200);
  const teleport = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/teleport`, { target: 'NoaSecure' }, teacherACookie);
  assert.equal(teleport.status, 200);
  assert.equal(monitorCalls.some(call => call.url === '/api/internal/craftom-school/v2/live/message'), true);
  assert.equal(monitorCalls.some(call => call.url === '/api/internal/craftom-school/v2/live/freeze'), true);
  assert.equal(monitorCalls.some(call => call.url === '/api/internal/craftom-school/v2/live/teleport' && call.body.target === 'NoaSecure'), true);
  for (let index = 1; index < 28; index += 1) {
    const repeatedMessage = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/message`, { text: `בדיקה ${index}`, scope: 'all' }, teacherACookie);
    assert.equal(repeatedMessage.status, 200);
  }
  const rateLimitedMessage = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/message`, { text: 'יותר מדי', scope: 'all' }, teacherACookie);
  assert.equal(rateLimitedMessage.status, 429, 'Minecraft control endpoints must be rate limited per teacher and class');
  const reset = await post(baseUrl, '/api/kugel/student/reset', {}, studentACookie);
  assert.equal(reset.status, 200);
  const resetBody = await reset.json();
  assert.equal(resetBody.student.attemptCount, 1, 'reset preserves completed-attempt history');
  assert.equal(resetBody.student.bestTimeMs, finishBody.student.bestTimeMs, 'reset preserves the personal best');
  assert.equal(resetBody.student.lastDurationMs, null, 'reset clears the current attempt duration shown to teachers and students');
  assert.equal(Date.parse(resetBody.student.resetAt) > Date.parse(finishBody.student.finishedAt), true,
    'reset boundary must be strictly later than a consumed completion event within the allowed clock skew');
  assert.equal(resetBody.student.startedAt, null, 'reset opens a fresh attempt boundary');
  assert.equal(resetBody.student.completed, false, 'reset clears current-attempt completion');
  const dashboardAfterReset = await fetch(`${baseUrl}/api/classroom/classes/${classroomA.id}/progress-dashboard`, { headers: { Cookie: teacherACookie } });
  assert.equal(dashboardAfterReset.status, 200);
  const dashboardAfterResetBody = await dashboardAfterReset.json();
  const dashboardAfterResetStudent = dashboardAfterResetBody.dashboard.students.find(student => student.id === studentA.id);
  assert.equal(dashboardAfterResetStudent.minecraftEmail, 'noa.secure@hai.tech', 'teacher dashboard exposes the verified Minecraft/Microsoft email beside the student identity');
  const resetLessonZero = dashboardAfterResetStudent.lessons.find(lesson => Number(lesson.lessonId) === 0);
  assert.equal(resetLessonZero.overallStatus, 'started', 'teacher dashboard shows retrying students as active instead of never started');
  assert.equal(resetLessonZero.retrying, true, 'teacher dashboard marks a reset completed attempt as retrying');
  assert.equal(resetLessonZero.minecraftStatus, 'started', 'teacher dashboard keeps Minecraft status active after Try Again');
  assert.equal(resetLessonZero.lastDurationMs, null, 'teacher dashboard clears the last duration for a reset current attempt');
  assert.equal(resetLessonZero.minecraftConnection.coinProgress, 0, 'teacher dashboard resets the coin progress bar after Try Again');
  const liveCoinsDb = new Database(dbFile);
  liveCoinsDb.prepare('UPDATE classroom_students SET minecraft_player_name = ?, updated_at = ? WHERE id = ?')
    .run('SecondSecure', new Date().toISOString(), studentASecond.id);
  liveCoinsDb.close();
  const liveCoinsAfterResetAtMs = Date.now() + 1000;
  const liveCoinsAfterResetAt = new Date(liveCoinsAfterResetAtMs).toISOString();
  const liveCoinsFinishedAt = new Date(liveCoinsAfterResetAtMs + 12000).toISOString();
  gameEvents = forLease([
    { id: 180, event_type: 'player_join', player_name: 'SecondSecure', created_at: liveCoinsAfterResetAt, payload: '{}' },
    ...Array.from({ length: 8 }, (_, index) => ({
      id: 181 + index,
      event_type: 'coin_collected',
      player_name: 'SecondSecure',
      created_at: liveCoinsAfterResetAt,
      block_id: 'gold_block',
      payload: JSON.stringify({ coin_index: index + 1 }),
    })),
    { id: 190, event_type: 'finish_button_pressed', player_name: 'SecondSecure', created_at: liveCoinsFinishedAt, payload: '{}' },
  ]);
  await new Promise(resolve => setTimeout(resolve, 1100));
  const teacherLiveCoinsView = await fetch(`${baseUrl}/api/kugel/session?classroomId=${classroomA.id}`, { headers: { Cookie: teacherACookie } });
  assert.equal(teacherLiveCoinsView.status, 200);
  const teacherLiveCoinsStudent = (await teacherLiveCoinsView.json()).students.find(student => student.id === studentASecond.id);
  assert.equal(teacherLiveCoinsStudent.coins, 8);
  assert.equal(teacherLiveCoinsStudent.startedAt, null, 'Minecraft events can arrive even if the student did not open Minecraft from the lomda button');
  assert.equal(teacherLiveCoinsStudent.minecraftStatus, 'completed', 'live Minecraft finish events should mark lesson zero as completed in the teacher monitor');
  assert.equal(teacherLiveCoinsStudent.lastDurationMs, 12000, 'teacher monitor infers duration from Minecraft events when no lomda run exists');
  await new Promise(resolve => setTimeout(resolve, 1100));
  gameEventsDelayMs = 1800;
  const staleLiveEventsView = await fetch(`${baseUrl}/api/kugel/session?classroomId=${classroomA.id}`, { headers: { Cookie: teacherACookie } });
  gameEventsDelayMs = 0;
  assert.equal(staleLiveEventsView.status, 200, 'teacher monitor must reuse recent live statuses when the next live read is slow');
  const staleLiveEventsStudent = (await staleLiveEventsView.json()).students.find(student => student.id === studentASecond.id);
  assert.equal(staleLiveEventsStudent.coins, 8, 'recent live coin status remains visible during monitor slowness');
  assert.equal(staleLiveEventsStudent.minecraftStatus, 'completed', 'recent live completion remains visible during monitor slowness');
  const dashboardLiveCoins = await fetch(`${baseUrl}/api/classroom/classes/${classroomA.id}/progress-dashboard`, { headers: { Cookie: teacherACookie } });
  assert.equal(dashboardLiveCoins.status, 200);
  const dashboardLiveCoinsLessonZero = (await dashboardLiveCoins.json()).dashboard.students
    .find(student => student.id === studentASecond.id).lessons.find(lesson => Number(lesson.lessonId) === 0);
  assert.equal(dashboardLiveCoinsLessonZero.minecraftStatus, 'completed');
  assert.equal(dashboardLiveCoinsLessonZero.overallStatus, 'completed');
  assert.equal(dashboardLiveCoinsLessonZero.minecraftConnection.coins, 8);
  assert.equal(dashboardLiveCoinsLessonZero.lastDurationMs, 12000, 'progress dashboard shows inferred Minecraft finish duration');
  assert.equal(dashboardLiveCoinsLessonZero.bestTimeMs, 12000, 'progress dashboard shows inferred Minecraft best time');
  legacyMonitorState.set('test-kugel-monitor', { running: true, world: 'kugel-50-safe-compounds-v3-20260824' });
  const buildActivityAt = new Date(Date.now() + 1600).toISOString();
  gameEvents = forLease([{
    id: 235,
    event_type: 'player_join',
    player_name: 'SecondSecure',
    created_at: buildActivityAt,
    game_timestamp: buildActivityAt,
    payload: JSON.stringify({ minecraft_username: 'SecondSecure', compound_id: 42 }),
  }, {
    id: 236,
    event_type: 'chat_message',
    player_name: 'SecondSecure',
    created_at: buildActivityAt,
    game_timestamp: buildActivityAt,
    payload: JSON.stringify({ message: '/_abc123' }),
  }, {
    id: 237,
    event_type: 'stage_report',
    player_name: 'SecondSecure',
    created_at: buildActivityAt,
    game_timestamp: buildActivityAt,
    payload: JSON.stringify({
      lesson_label: 'שיעור 1',
      build_verdict: 'טוב',
      build_summary: 'המתחם בנוי ומסודר.',
      code_verdict: 'חסר קישור',
      code_summary: 'לא נשלח קישור MakeCode.',
      teacher_tip: 'לבקש מהילד להסביר את המנגנון.',
      snapshot: { summary: 'רואים מבנה במתחם 42.', blocks_count: 12, holes_count: 2, max_height: 1 },
      snapshot_map: '###\n#S#\n###',
      activity_summary: 'הילד עבד במתחם.',
      activity: {
        agent_placed: 10,
        agent_broken: 0,
        manual_placed: 12,
        manual_broken: 2,
        blocked_break_attempts: 1,
        active_minutes: 8,
        chat_messages: 1,
        teacher_interventions: 0,
      },
      code: {
        url: 'https://makecode.com/_abc123',
        name: 'agent-lesson-1',
        source: 'player.onChat("deliver", function () {\n    agent.teleportToPlayer()\n    agent.move(FORWARD, 5)\n})',
        error: '',
      },
      generated_at: buildActivityAt,
      report_text: 'דוח מלא לתלמיד.',
    }),
  }, {
    id: 238,
    event_type: 'class_stage_report',
    created_at: buildActivityAt,
    game_timestamp: buildActivityAt,
    payload: JSON.stringify({
      lesson_label: 'שיעור 1',
      started_at: buildActivityAt,
      ended_at: buildActivityAt,
      report_text: 'דוח סוף שיעור מלא.',
      students: [{
        lesson_label: 'שיעור 1',
        build_verdict: 'טוב',
        build_summary: 'נועה סיימה מתחם.',
        code_verdict: 'חסר קישור',
        generated_at: buildActivityAt,
      }],
    }),
  }]);
  await new Promise(resolve => setTimeout(resolve, 1100));
  const dashboardBuildMode = await fetch(`${baseUrl}/api/classroom/classes/${classroomA.id}/progress-dashboard`, { headers: { Cookie: teacherACookie } });
  assert.equal(dashboardBuildMode.status, 200);
  const dashboardBuildBody = await dashboardBuildMode.json();
  assert.equal(dashboardBuildBody.dashboard.worldMode, 'build', 'progress dashboard follows the current Monitor world mode');
  const dashboardBuildLessonZero = dashboardBuildBody.dashboard.students
    .find(student => student.id === studentASecond.id).lessons.find(lesson => Number(lesson.lessonId) === 0);
  assert.equal(dashboardBuildLessonZero.minecraftConnection.coins, 0, 'build mode ignores stray coin events');
  assert.equal(dashboardBuildLessonZero.lastDurationMs, null, 'build mode hides last maze duration');
  assert.equal(dashboardBuildLessonZero.bestTimeMs, null, 'build mode hides maze best time');
  assert.equal(dashboardBuildLessonZero.minecraftConnection.connected, true,
    'build mode should still show a fresh Minecraft player event as connected now');
  assert.equal(dashboardBuildLessonZero.minecraftConnection.compoundId, 42,
    'build mode should show the compound number reported by Minecraft events');
  const teacherBuildModeView = await fetch(`${baseUrl}/api/kugel/session?classroomId=${classroomA.id}`, { headers: { Cookie: teacherACookie } });
  assert.equal(teacherBuildModeView.status, 200);
  const teacherBuildModeBody = await teacherBuildModeView.json();
  assert.equal(teacherBuildModeBody.worldMode, 'build', 'teacher monitor receives build mode');
  const teacherBuildModeStudent = teacherBuildModeBody.students.find(student => student.id === studentASecond.id);
  assert.equal(teacherBuildModeStudent.coins, 0, 'teacher monitor ignores maze coin events in build mode');
  assert.equal(teacherBuildModeStudent.lastDurationMs, null, 'teacher monitor hides maze finish times in build mode');
  assert.equal(teacherBuildModeStudent.connected, true,
    'teacher monitor should show build-world player activity as connected now');
  assert.equal(teacherBuildModeStudent.compoundId, 42,
    'teacher monitor should show the active build compound beside the student');
  assert.equal(teacherBuildModeStudent.chatCodeLink.url, 'https://makecode.com/_abc123',
    'teacher monitor should expose the latest MakeCode link sent in Minecraft chat');
  assert.equal(teacherBuildModeStudent.localCodeCheck.status, 'passed',
    'teacher monitor should locally check MakeCode source against the lesson task');
  assert.match(teacherBuildModeStudent.localCodeCheck.summary, /שיעור 1/,
    'local MakeCode checks should identify the lesson being checked');
  assert.equal(teacherBuildModeStudent.stageReport.buildVerdict, 'טוב',
    'teacher monitor should expose the latest stage_report on the student card');
  assert.equal(teacherBuildModeStudent.stageReport.snapshot.blocksCount, 12,
    'teacher monitor should expose structured snapshot block counts for report cards');
  assert.equal(teacherBuildModeStudent.stageReport.snapshot.holesCount, 2,
    'teacher monitor should expose structured snapshot hole counts for report cards');
  assert.equal(teacherBuildModeStudent.stageReport.activity.agentPlaced, 10,
    'teacher monitor should expose structured Agent activity facts for report cards');
  assert.equal(teacherBuildModeStudent.stageReport.activity.activeMinutes, 8,
    'teacher monitor should expose structured active-minute facts for report cards');
  assert.equal(teacherBuildModeStudent.stageReport.snapshotMap, '###\n#S#\n###',
    'teacher monitor should preserve the top-down snapshot map as report text');
  assert.equal(teacherBuildModeStudent.stageReport.code.url, 'https://makecode.com/_abc123',
    'teacher monitor should expose the MakeCode share URL captured from Minecraft chat');
  assert.match(teacherBuildModeStudent.stageReport.code.source, /agent\.move/,
    'teacher monitor should expose the MakeCode source captured by the Monitor');
  assert.equal(teacherBuildModeBody.classStageReport.reportText, 'דוח סוף שיעור מלא.',
    'teacher monitor should expose the latest class_stage_report for the lesson summary');
  assert.equal(teacherBuildModeBody.classStageReport.students.length, 1,
    'class stage reports should expose per-student summaries');
  const teacherLessonZeroHistoryView = await fetch(`${baseUrl}/api/kugel/session?classroomId=${classroomA.id}&lessonId=0`, { headers: { Cookie: teacherACookie } });
  assert.equal(teacherLessonZeroHistoryView.status, 200);
  const teacherLessonZeroHistoryBody = await teacherLessonZeroHistoryView.json();
  assert.equal(teacherLessonZeroHistoryBody.worldMode, 'build', 'current world mode still reflects the active Monitor world');
  assert.equal(teacherLessonZeroHistoryBody.viewMode, 'maze', 'explicit lesson zero teacher view keeps the maze report visible');
  legacyMonitorState.set('test-kugel-monitor', { running: true, world: 'Kugel-lesson-0' });
  const teacherLessonOneWhileMazeWorldView = await fetch(`${baseUrl}/api/kugel/session?classroomId=${classroomA.id}&lessonId=1`, { headers: { Cookie: teacherACookie } });
  assert.equal(teacherLessonOneWhileMazeWorldView.status, 200);
  const teacherLessonOneWhileMazeWorldBody = await teacherLessonOneWhileMazeWorldView.json();
  assert.equal(teacherLessonOneWhileMazeWorldBody.worldMode, 'maze', 'current world mode can still be the lesson-zero maze');
  assert.equal(teacherLessonOneWhileMazeWorldBody.viewMode, 'build', 'explicit lesson one teacher view must not inherit maze metrics from the active world');
  assert.equal(teacherLessonOneWhileMazeWorldBody.lesson.id, 1, 'explicit lesson one teacher view keeps the selected lesson active');
  const teacherLessonOneWhileMazeWorldStudent = teacherLessonOneWhileMazeWorldBody.students.find(student => student.id === studentASecond.id);
  assert.equal(teacherLessonOneWhileMazeWorldStudent.coins, 0, 'lesson one view hides lesson-zero coin progress even when the maze world is active');
  assert.equal(teacherLessonOneWhileMazeWorldStudent.attemptCount, 0, 'lesson one view hides lesson-zero attempts even when the maze world is active');
  assert.equal(teacherLessonOneWhileMazeWorldStudent.lastDurationMs, null, 'lesson one view hides lesson-zero last duration even when the maze world is active');
  assert.equal(teacherLessonOneWhileMazeWorldStudent.bestTimeMs, null, 'lesson one view hides lesson-zero best time even when the maze world is active');
  gameEvents = forLease([
    { id: 220, event_type: 'player_join', player_name: 'SecondSecure', created_at: liveCoinsAfterResetAt, game_timestamp: liveCoinsAfterResetAt, payload: '{}' },
    ...Array.from({ length: 8 }, (_, index) => ({
      id: 221 + index,
      event_type: 'coin_collected',
      player_name: 'SecondSecure',
      created_at: liveCoinsAfterResetAt,
      game_timestamp: liveCoinsAfterResetAt,
      block_id: 'gold_block',
      payload: JSON.stringify({ coin_index: index + 1 }),
    })),
    {
      id: 230,
      event_type: 'finish_button_pressed',
      player_name: 'SecondSecure',
      created_at: liveCoinsFinishedAt,
      game_timestamp: liveCoinsFinishedAt,
      payload: JSON.stringify({
        report_data: {
          started_at_iso: liveCoinsAfterResetAt,
          completed_at_iso: liveCoinsFinishedAt,
          duration_seconds: 45,
          coins_collected: 8,
          total_coins: 8,
        },
      }),
    },
  ]);
  await new Promise(resolve => setTimeout(resolve, 1100));
  const teacherMonitorDurationView = await fetch(`${baseUrl}/api/kugel/session?classroomId=${classroomA.id}`, { headers: { Cookie: teacherACookie } });
  assert.equal(teacherMonitorDurationView.status, 200);
  const teacherMonitorDurationStudent = (await teacherMonitorDurationView.json()).students.find(student => student.id === studentASecond.id);
  assert.equal(teacherMonitorDurationStudent.lastDurationMs, 45000,
    'teacher monitor prefers the explicit duration recorded by the Minecraft monitor finish entry');
  const dashboardMonitorDuration = await fetch(`${baseUrl}/api/classroom/classes/${classroomA.id}/progress-dashboard`, { headers: { Cookie: teacherACookie } });
  assert.equal(dashboardMonitorDuration.status, 200);
  const dashboardMonitorDurationLessonZero = (await dashboardMonitorDuration.json()).dashboard.students
    .find(student => student.id === studentASecond.id).lessons.find(lesson => Number(lesson.lessonId) === 0);
  assert.equal(dashboardMonitorDurationLessonZero.lastDurationMs, 45000,
    'progress dashboard prefers monitor report_data.duration_seconds when present');
  const staleDurationDb = new Database(dbFile);
  staleDurationDb.prepare(`
    INSERT INTO kugel_student_runs (
      student_id, classroom_id, lesson_id, started_at, reset_at, finished_at,
      attempt_count, best_time_ms, best_finished_at, last_duration_ms, updated_at
    )
    VALUES (?, ?, 0, ?, ?, ?, 0, 146000, ?, 797000, ?)
    ON CONFLICT(student_id) DO UPDATE SET
      started_at = excluded.started_at,
      reset_at = excluded.reset_at,
      finished_at = excluded.finished_at,
      attempt_count = excluded.attempt_count,
      best_time_ms = excluded.best_time_ms,
      best_finished_at = excluded.best_finished_at,
      last_duration_ms = excluded.last_duration_ms,
      updated_at = excluded.updated_at
  `).run(
    studentASecond.id,
    classroomA.id,
    liveCoinsAfterResetAt,
    liveCoinsAfterResetAt,
    liveCoinsFinishedAt,
    liveCoinsFinishedAt,
    new Date().toISOString(),
  );
  staleDurationDb.close();
  const dashboardFreshMonitorDuration = await fetch(`${baseUrl}/api/classroom/classes/${classroomA.id}/progress-dashboard`, { headers: { Cookie: teacherACookie } });
  assert.equal(dashboardFreshMonitorDuration.status, 200);
  const dashboardFreshMonitorDurationLessonZero = (await dashboardFreshMonitorDuration.json()).dashboard.students
    .find(student => student.id === studentASecond.id).lessons.find(lesson => Number(lesson.lessonId) === 0);
  assert.equal(dashboardFreshMonitorDurationLessonZero.lastDurationMs, 45000,
    'progress dashboard must show the latest monitor finish duration instead of a stale stored last duration');
  assert.equal(dashboardFreshMonitorDurationLessonZero.bestTimeMs, 45000,
    'progress dashboard must use the best duration across stored and monitor attempts');
  assert.equal(dashboardFreshMonitorDurationLessonZero.attempts, 1,
    'a stored best time must imply at least one completed attempt even if an old row missed attempt_count');
  const secondMonitorAttemptStartedAt = new Date(Date.parse(liveCoinsFinishedAt) + 10000).toISOString();
  const secondMonitorAttemptFinishedAt = new Date(Date.parse(secondMonitorAttemptStartedAt) + 7000).toISOString();
  gameEvents = forLease([
    { id: 300, event_type: 'player_join', player_name: 'SecondSecure', created_at: liveCoinsAfterResetAt, game_timestamp: liveCoinsAfterResetAt, payload: '{}' },
    ...Array.from({ length: 8 }, (_, index) => ({
      id: 301 + index,
      event_type: 'coin_collected',
      player_name: 'SecondSecure',
      created_at: liveCoinsAfterResetAt,
      game_timestamp: liveCoinsAfterResetAt,
      block_id: 'gold_block',
      payload: JSON.stringify({ coin_index: index + 1 }),
    })),
    {
      id: 310,
      event_type: 'finish_button_pressed',
      player_name: 'SecondSecure',
      created_at: liveCoinsFinishedAt,
      game_timestamp: liveCoinsFinishedAt,
      payload: JSON.stringify({
        report_data: {
          started_at_iso: liveCoinsAfterResetAt,
          completed_at_iso: liveCoinsFinishedAt,
          duration_seconds: 797,
          coins_collected: 8,
          total_coins: 8,
        },
      }),
    },
    {
      id: 311,
      event_type: 'chat',
      player_name: 'SecondSecure',
      created_at: secondMonitorAttemptStartedAt,
      game_timestamp: secondMonitorAttemptStartedAt,
      payload: JSON.stringify({ message: 'Mission reset. Start the maze again.' }),
    },
    ...Array.from({ length: 8 }, (_, index) => ({
      id: 312 + index,
      event_type: 'coin_collected',
      player_name: 'SecondSecure',
      created_at: secondMonitorAttemptStartedAt,
      game_timestamp: secondMonitorAttemptStartedAt,
      block_id: 'gold_block',
      payload: JSON.stringify({ coin_index: index + 1 }),
    })),
    {
      id: 320,
      event_type: 'finish_button_pressed',
      player_name: 'SecondSecure',
      created_at: secondMonitorAttemptFinishedAt,
      game_timestamp: secondMonitorAttemptFinishedAt,
      payload: JSON.stringify({
        report_data: {
          started_at_iso: secondMonitorAttemptStartedAt,
          completed_at_iso: secondMonitorAttemptFinishedAt,
          duration_seconds: 107,
          coins_collected: 8,
          total_coins: 8,
        },
      }),
    },
  ]);
  await new Promise(resolve => setTimeout(resolve, 1100));
  const dashboardLatestMonitorAttempt = await fetch(`${baseUrl}/api/classroom/classes/${classroomA.id}/progress-dashboard`, { headers: { Cookie: teacherACookie } });
  assert.equal(dashboardLatestMonitorAttempt.status, 200);
  const dashboardLatestMonitorAttemptLessonZero = (await dashboardLatestMonitorAttempt.json()).dashboard.students
    .find(student => student.id === studentASecond.id).lessons.find(lesson => Number(lesson.lessonId) === 0);
  assert.equal(dashboardLatestMonitorAttemptLessonZero.lastDurationMs, 107000,
    'progress dashboard must show the latest completed monitor attempt after a Minecraft reset');
  assert.equal(dashboardLatestMonitorAttemptLessonZero.bestTimeMs, 107000,
    'progress dashboard must keep best time separate from old slower attempts');
  const minecraftResetAt = new Date(Date.parse(liveCoinsFinishedAt) + 5000).toISOString();
  gameEvents = forLease([
    { id: 220, event_type: 'player_join', player_name: 'SecondSecure', created_at: liveCoinsAfterResetAt, game_timestamp: liveCoinsAfterResetAt, payload: '{}' },
    ...Array.from({ length: 8 }, (_, index) => ({
      id: 221 + index,
      event_type: 'coin_collected',
      player_name: 'SecondSecure',
      created_at: liveCoinsAfterResetAt,
      game_timestamp: liveCoinsAfterResetAt,
      block_id: 'gold_block',
      payload: JSON.stringify({ coin_index: index + 1 }),
    })),
    {
      id: 230,
      event_type: 'finish_button_pressed',
      player_name: 'SecondSecure',
      created_at: liveCoinsFinishedAt,
      game_timestamp: liveCoinsFinishedAt,
      payload: JSON.stringify({
        report_data: {
          started_at_iso: liveCoinsAfterResetAt,
          completed_at_iso: liveCoinsFinishedAt,
          duration_seconds: 45,
          coins_collected: 8,
          total_coins: 8,
        },
      }),
    },
    {
      id: 231,
      event_type: 'maze_reset',
      player_name: 'SecondSecure',
      created_at: minecraftResetAt,
      game_timestamp: minecraftResetAt,
      payload: JSON.stringify({
        minecraft_username: 'SecondSecure',
        compound_id: 32,
        reset_at_iso: minecraftResetAt,
        reset_at_ms: Date.parse(minecraftResetAt),
      }),
    },
  ]);
  await new Promise(resolve => setTimeout(resolve, 1100));
  const teacherMinecraftResetView = await fetch(`${baseUrl}/api/kugel/session?classroomId=${classroomA.id}`, { headers: { Cookie: teacherACookie } });
  assert.equal(teacherMinecraftResetView.status, 200);
  const teacherMinecraftResetStudent = (await teacherMinecraftResetView.json()).students.find(student => student.id === studentASecond.id);
  assert.equal(teacherMinecraftResetStudent.coins, 8,
    'maze_reset from Minecraft keeps the best lesson result visible after a completed attempt');
  assert.equal(teacherMinecraftResetStudent.currentCoins, 0,
    'maze_reset still exposes the clean current attempt separately');
  assert.equal(teacherMinecraftResetStudent.completed, true);
  assert.equal(teacherMinecraftResetStudent.retrying, true);
  assert.equal(teacherMinecraftResetStudent.lastDurationMs, 45000);
  assert.equal(teacherMinecraftResetStudent.bestTimeMs, 45000,
    'maze_reset keeps the previous best time visible');
  assert.equal(teacherMinecraftResetStudent.attemptCount, 1,
    'maze_reset preserves completed-attempt history instead of resetting attempts to zero');
  const dashboardMinecraftReset = await fetch(`${baseUrl}/api/classroom/classes/${classroomA.id}/progress-dashboard`, { headers: { Cookie: teacherACookie } });
  assert.equal(dashboardMinecraftReset.status, 200);
  const dashboardMinecraftResetLessonZero = (await dashboardMinecraftReset.json()).dashboard.students
    .find(student => student.id === studentASecond.id).lessons.find(lesson => Number(lesson.lessonId) === 0);
  assert.equal(dashboardMinecraftResetLessonZero.retrying, true);
  assert.equal(dashboardMinecraftResetLessonZero.attempts, 1,
    'progress dashboard must keep completed-attempt count after a Minecraft reset');
  assert.equal(dashboardMinecraftResetLessonZero.minecraftConnection.coins, 8);
  assert.equal(dashboardMinecraftResetLessonZero.lastDurationMs, 45000);
  assert.equal(dashboardMinecraftResetLessonZero.bestTimeMs, 45000);
  const minecraftChatResetAt = new Date(Date.parse(liveCoinsFinishedAt) + 7000).toISOString();
  gameEvents = forLease([
    { id: 240, event_type: 'player_join', player_name: 'SecondSecure', created_at: liveCoinsAfterResetAt, game_timestamp: liveCoinsAfterResetAt, payload: '{}' },
    ...Array.from({ length: 8 }, (_, index) => ({
      id: 241 + index,
      event_type: 'coin_collected',
      player_name: 'SecondSecure',
      created_at: liveCoinsAfterResetAt,
      game_timestamp: liveCoinsAfterResetAt,
      block_id: 'gold_block',
      payload: JSON.stringify({ coin_index: index + 1 }),
    })),
    {
      id: 250,
      event_type: 'finish_button_pressed',
      player_name: 'SecondSecure',
      created_at: liveCoinsFinishedAt,
      game_timestamp: liveCoinsFinishedAt,
      payload: JSON.stringify({
        report_data: {
          started_at_iso: liveCoinsAfterResetAt,
          completed_at_iso: liveCoinsFinishedAt,
          duration_seconds: 45,
          coins_collected: 8,
          total_coins: 8,
        },
      }),
    },
    {
      id: 251,
      event_type: 'chat',
      player_name: 'SecondSecure',
      created_at: minecraftChatResetAt,
      game_timestamp: minecraftChatResetAt,
      payload: JSON.stringify({
        message: 'sent Actionbar message to <SecondSecure>: Mission reset. Start the maze again.',
        message_type: 'chat',
      }),
    },
  ]);
  await new Promise(resolve => setTimeout(resolve, 1100));
  const teacherMinecraftChatResetView = await fetch(`${baseUrl}/api/kugel/session?classroomId=${classroomA.id}`, { headers: { Cookie: teacherACookie } });
  assert.equal(teacherMinecraftChatResetView.status, 200);
  const teacherMinecraftChatResetStudent = (await teacherMinecraftChatResetView.json()).students.find(student => student.id === studentASecond.id);
  assert.equal(teacherMinecraftChatResetStudent.coins, 8,
    'Monitor chat reset messages keep the best lesson result visible after a completed attempt');
  assert.equal(teacherMinecraftChatResetStudent.currentCoins, 0,
    'Monitor chat reset messages still expose the clean current attempt separately');
  assert.equal(teacherMinecraftChatResetStudent.completed, true);
  assert.equal(teacherMinecraftChatResetStudent.retrying, true);
  assert.equal(teacherMinecraftChatResetStudent.lastDurationMs, 45000);
  assert.equal(teacherMinecraftChatResetStudent.attemptCount, 1,
    'chat reset preserves completed-attempt history instead of resetting attempts to zero');
  const minecraftRetryCoinAt = new Date(Date.parse(liveCoinsFinishedAt) + 10000).toISOString();
  gameEvents = forLease([
    { id: 220, event_type: 'player_join', player_name: 'SecondSecure', created_at: liveCoinsAfterResetAt, game_timestamp: liveCoinsAfterResetAt, payload: '{}' },
    ...Array.from({ length: 8 }, (_, index) => ({
      id: 221 + index,
      event_type: 'coin_collected',
      player_name: 'SecondSecure',
      created_at: liveCoinsAfterResetAt,
      game_timestamp: liveCoinsAfterResetAt,
      block_id: 'gold_block',
      payload: JSON.stringify({ coin_index: index + 1 }),
    })),
    {
      id: 230,
      event_type: 'finish_button_pressed',
      player_name: 'SecondSecure',
      created_at: liveCoinsFinishedAt,
      game_timestamp: liveCoinsFinishedAt,
      payload: JSON.stringify({
        report_data: {
          started_at_iso: liveCoinsAfterResetAt,
          completed_at_iso: liveCoinsFinishedAt,
          duration_seconds: 45,
          coins_collected: 8,
          total_coins: 8,
        },
      }),
    },
    { id: 231, event_type: 'player_join', player_name: 'SecondSecure', created_at: minecraftRetryCoinAt, game_timestamp: minecraftRetryCoinAt, payload: '{}' },
    {
      id: 232,
      event_type: 'coin_collected',
      player_name: 'SecondSecure',
      created_at: minecraftRetryCoinAt,
      game_timestamp: minecraftRetryCoinAt,
      block_id: 'gold_block',
      payload: JSON.stringify({ coin_index: 4, collected_count: 1 }),
    },
  ]);
  await new Promise(resolve => setTimeout(resolve, 2500));
  const teacherMinecraftRetryView = await fetch(`${baseUrl}/api/kugel/session?classroomId=${classroomA.id}`, { headers: { Cookie: teacherACookie } });
  assert.equal(teacherMinecraftRetryView.status, 200);
  const teacherMinecraftRetryStudent = (await teacherMinecraftRetryView.json()).students.find(student => student.id === studentASecond.id);
  assert.equal(teacherMinecraftRetryStudent.coins, 8,
    'a new Minecraft attempt after a finish keeps the best lesson result visible');
  assert.equal(teacherMinecraftRetryStudent.currentCoins, 1,
    'a new Minecraft attempt after a finish exposes the current collected count separately');
  assert.equal(teacherMinecraftRetryStudent.completed, true);
  assert.equal(teacherMinecraftRetryStudent.retrying, true);
  assert.equal(teacherMinecraftRetryStudent.lastDurationMs, 45000);
  assert.equal(teacherMinecraftRetryStudent.bestTimeMs, 45000,
    'a Minecraft-side retry keeps the previous best time visible');
  assert.equal(teacherMinecraftRetryStudent.attemptCount, 1,
    'a retry in progress keeps the previous completed-attempt count until the next finish');
  const dashboardMinecraftRetry = await fetch(`${baseUrl}/api/classroom/classes/${classroomA.id}/progress-dashboard`, { headers: { Cookie: teacherACookie } });
  assert.equal(dashboardMinecraftRetry.status, 200);
  const dashboardMinecraftRetryLessonZero = (await dashboardMinecraftRetry.json()).dashboard.students
    .find(student => student.id === studentASecond.id).lessons.find(lesson => Number(lesson.lessonId) === 0);
  assert.equal(dashboardMinecraftRetryLessonZero.retrying, true);
  assert.equal(dashboardMinecraftRetryLessonZero.attempts, 1,
    'progress dashboard keeps historical attempts while the next attempt is in progress');
  assert.equal(dashboardMinecraftRetryLessonZero.minecraftConnection.coins, 8);
  assert.equal(dashboardMinecraftRetryLessonZero.lastDurationMs, 45000);
  assert.equal(dashboardMinecraftRetryLessonZero.bestTimeMs, 45000);
  const staleConnectionAt = new Date(Date.now() - 1500).toISOString();
  gameEvents = forLease([
    { id: 233, event_type: 'player_join', player_name: 'SecondSecure', created_at: staleConnectionAt, game_timestamp: staleConnectionAt, payload: '{}' },
  ]);
  await new Promise(resolve => setTimeout(resolve, 1100));
  const staleConnectionView = await fetch(`${baseUrl}/api/kugel/session?classroomId=${classroomA.id}`, { headers: { Cookie: teacherACookie } });
  assert.equal(staleConnectionView.status, 200);
  const staleConnectionStudent = (await staleConnectionView.json()).students.find(student => student.id === studentASecond.id);
  assert.equal(staleConnectionStudent.connected, false, 'old Minecraft activity without a leave event must not stay marked as connected now');
  assert.ok(staleConnectionStudent.lastSeenAt, 'old Minecraft activity should still be preserved as last seen');
  const freshAssignmentDb = new Database(dbFile);
  const freshAssignmentAt = new Date().toISOString();
  freshAssignmentDb.prepare(`
    INSERT OR REPLACE INTO kugel_minecraft_compound_assignments (
      id, monitor_server_name, minecraft_username, compound_id, x, y, z,
      last_seen_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'fresh-assignment-after-stale-connection',
    'test-kugel-monitor',
    'SecondSecure',
    18,
    null,
    null,
    null,
    freshAssignmentAt,
    freshAssignmentAt,
    freshAssignmentAt,
  );
  freshAssignmentDb.close();
  const resumedConnectionView = await fetch(`${baseUrl}/api/kugel/session?classroomId=${classroomA.id}`, { headers: { Cookie: teacherACookie } });
  assert.equal(resumedConnectionView.status, 200);
  const resumedConnectionStudent = (await resumedConnectionView.json()).students.find(student => student.id === studentASecond.id);
  assert.equal(resumedConnectionStudent.connected, true, 'fresh compound activity should return a stale student to connected now');
  assert.equal(resumedConnectionStudent.lastSeenAt, freshAssignmentAt, 'fresh compound activity should become the visible last-seen timestamp');
  const resumedDashboard = await fetch(`${baseUrl}/api/classroom/classes/${classroomA.id}/progress-dashboard`, { headers: { Cookie: teacherACookie } });
  assert.equal(resumedDashboard.status, 200);
  const resumedDashboardConnection = (await resumedDashboard.json()).dashboard.students
    .find(student => student.id === studentASecond.id).minecraftConnection;
  assert.equal(resumedDashboardConnection.connected, true, 'teacher progress dashboard should also return the student to connected now');
  assert.equal(resumedDashboardConnection.compoundId, 18);
  gameEvents = [];
  const [concurrentStartA, concurrentStartB] = await Promise.all([
    post(baseUrl, '/api/kugel/student/start', {}, studentACookie),
    post(baseUrl, '/api/kugel/student/start', {}, studentACookie),
  ]);
  assert.equal(concurrentStartA.status, 200);
  assert.equal(concurrentStartB.status, 200);
  const concurrentStartABody = await concurrentStartA.json();
  const concurrentStartBBody = await concurrentStartB.json();
  assert.equal(concurrentStartABody.student.startedAt, concurrentStartBBody.student.startedAt,
    'concurrent starts in one reset boundary must keep one attempt start');
  const afterReset = await fetch(`${baseUrl}/api/kugel/session`, { headers: { Cookie: studentACookie } });
  assert.equal(afterReset.status, 200);
  const afterResetBody = await afterReset.json();
  assert.equal(afterResetBody.student.coins, 0, 'events before reset must not count again');
  assert.equal(afterResetBody.student.attemptCount, 1);

  const slowerFinishAtMs = Date.parse(resetBody.student.resetAt) + Math.max(finishBody.student.bestTimeMs + 5000, 10000);
  const slowerStartAt = new Date(slowerFinishAtMs - 5000).toISOString();
  const slowerFinishAt = new Date(slowerFinishAtMs).toISOString();
  gameEvents = forLease([
    { id: 200, event_type: 'player_join', player_name: 'NoaSecure', created_at: resetBody.student.resetAt, payload: '{}' },
    ...Array.from({ length: 8 }, (_, index) => ({ id: 201 + index, event_type: 'coin_collected', player_name: 'NoaSecure', created_at: slowerStartAt, block_id: 'gold_block', payload: JSON.stringify({ coin_index: index + 1 }) })),
    { id: 210, event_type: 'finish_button_pressed', player_name: 'NoaSecure', created_at: slowerFinishAt, payload: JSON.stringify({ completed: true }) },
  ]);
  await new Promise(resolve => setTimeout(resolve, 1100));
  gameEventsDelayMs = 150;
  const staleFinishDuringResetPromise = post(baseUrl, '/api/kugel/student/finish', {}, studentACookie);
  await new Promise(resolve => setTimeout(resolve, 30));
  const resetDuringFinish = await post(baseUrl, '/api/kugel/student/reset', {}, studentACookie);
  const staleFinishDuringReset = await staleFinishDuringResetPromise;
  gameEventsDelayMs = 0;
  assert.equal(resetDuringFinish.status, 200);
  assert.equal(staleFinishDuringReset.status, 409, 'a finish racing with reset must not complete or count the reset attempt');
  const resetDuringFinishBody = await resetDuringFinish.json();
  assert.equal(resetDuringFinishBody.student.attemptCount, 1);
  const postRaceFinishAtMs = Date.parse(resetDuringFinishBody.student.resetAt) + Math.max(finishBody.student.bestTimeMs + 5000, 10000);
  const postRaceStartAt = new Date(postRaceFinishAtMs - 5000).toISOString();
  const postRaceFinishAt = new Date(postRaceFinishAtMs).toISOString();
  gameEvents = forLease([
    { id: 211, event_type: 'player_join', player_name: 'NoaSecure', created_at: resetDuringFinishBody.student.resetAt, payload: '{}' },
    ...Array.from({ length: 8 }, (_, index) => ({ id: 212 + index, event_type: 'coin_collected', player_name: 'NoaSecure', created_at: postRaceStartAt, block_id: 'gold_block', payload: JSON.stringify({ coin_index: index + 1 }) })),
    { id: 221, event_type: 'finish_button_pressed', player_name: 'NoaSecure', created_at: postRaceFinishAt, payload: JSON.stringify({ completed: true }) },
  ]);
  const slowerFinish = await post(baseUrl, '/api/kugel/student/finish', {}, studentACookie);
  assert.equal(slowerFinish.status, 200);
  const slowerFinishBody = await slowerFinish.json();
  assert.equal(slowerFinishBody.student.attemptCount, 2, 'a valid finish after reset records a new attempt');
  assert.equal(slowerFinishBody.student.lastDurationMs > finishBody.student.lastDurationMs, true, 'last duration reflects the newest completed attempt');
  assert.equal(slowerFinishBody.student.bestTimeMs, finishBody.student.bestTimeMs, 'a slower attempt cannot regress the personal best');
  assert.equal(slowerFinishBody.student.bestFinishedAt, finishBody.student.bestFinishedAt, 'a slower attempt cannot replace the best timestamp');

  const resetBeforeLessonSwitchRace = await post(baseUrl, '/api/kugel/student/reset', {}, studentACookie);
  assert.equal(resetBeforeLessonSwitchRace.status, 200);
  const lessonSwitchBoundary = (await resetBeforeLessonSwitchRace.json()).student.resetAt;
  const lessonSwitchFinishAt = new Date(Date.parse(lessonSwitchBoundary) + 1000).toISOString();
  gameEvents = forLease([
    ...Array.from({ length: 8 }, (_, index) => ({ id: 301 + index, event_type: 'coin_collected', player_name: 'NoaSecure', created_at: lessonSwitchFinishAt, block_id: 'gold_block', payload: JSON.stringify({ coin_index: index + 1 }) })),
    { id: 310, event_type: 'finish_button_pressed', player_name: 'NoaSecure', created_at: lessonSwitchFinishAt, payload: JSON.stringify({ completed: true }) },
  ]);
  await new Promise(resolve => setTimeout(resolve, 1100));
  gameEventsDelayMs = 150;
  const finishDuringLessonSwitchPromise = post(baseUrl, '/api/kugel/student/finish', {}, studentACookie);
  await new Promise(resolve => setTimeout(resolve, 30));
  const switchToLessonOne = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/lessons/1/launch`, {}, teacherACookie);
  const finishDuringLessonSwitch = await finishDuringLessonSwitchPromise;
  gameEventsDelayMs = 0;
  assert.equal(switchToLessonOne.status, 200);
  assert.equal(finishDuringLessonSwitch.status, 409, 'a finish racing with a teacher lesson switch must not persist');
  const lessonSwitchRaceDb = new Database(dbFile);
  const attemptsAfterLessonSwitch = lessonSwitchRaceDb.prepare('SELECT attempt_count FROM kugel_student_runs WHERE student_id = ?').get(studentA.id).attempt_count;
  lessonSwitchRaceDb.close();
  assert.equal(attemptsAfterLessonSwitch, 2, 'a stale lesson-zero finish must not increment attempts');
  const restoreLessonZeroAfterRace = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/lessons/0/launch`, {}, teacherACookie);
  assert.equal(restoreLessonZeroAfterRace.status, 200);

  const resetBeforeArchiveRace = await post(baseUrl, '/api/kugel/student/reset', {}, studentACookie);
  assert.equal(resetBeforeArchiveRace.status, 200);
  const archiveRaceBoundary = (await resetBeforeArchiveRace.json()).student.resetAt;
  assert.equal((await post(baseUrl, '/api/kugel/student/start', {}, studentACookie)).status, 200);
  const archiveRaceFinishAt = new Date(Date.parse(archiveRaceBoundary) + 1000).toISOString();
  gameEvents = forLease([
    ...Array.from({ length: 8 }, (_, index) => ({ id: 401 + index, event_type: 'coin_collected', player_name: 'NoaSecure', created_at: archiveRaceFinishAt, block_id: 'gold_block', payload: JSON.stringify({ coin_index: index + 1 }) })),
    { id: 410, event_type: 'finish_button_pressed', player_name: 'NoaSecure', created_at: archiveRaceFinishAt, payload: JSON.stringify({ completed: true }) },
  ]);
  const beforeArchiveRaceDb = new Database(dbFile);
  const runBeforeArchiveRace = beforeArchiveRaceDb.prepare('SELECT * FROM kugel_student_runs WHERE student_id = ?').get(studentA.id);
  const progressBeforeArchiveRace = beforeArchiveRaceDb.prepare('SELECT * FROM classroom_progress WHERE student_id = ? AND course_id = ?').all(studentA.id, 'craftom-agent');
  beforeArchiveRaceDb.close();
  gameEventsDelayMs = 150;
  const gameEventsStarted = new Promise(resolve => { gameEventsStartedResolve = resolve; });
  const finishDuringArchivePromise = post(baseUrl, '/api/kugel/student/finish', {}, studentACookie);
  await gameEventsStarted;
  const archiveDuringFinish = await post(baseUrl, `/api/classroom/classes/${classroomA.id}/students/${studentA.id}/archive`, {}, teacherACookie);
  assert.equal(archiveDuringFinish.status, 200);
  const finishDuringArchive = await finishDuringArchivePromise;
  gameEventsDelayMs = 0;
  assert.ok([401, 409].includes(finishDuringArchive.status), 'finish must reject an identity archived while monitor events are delayed');
  const afterArchiveRaceDb = new Database(dbFile);
  assert.deepEqual(afterArchiveRaceDb.prepare('SELECT * FROM kugel_student_runs WHERE student_id = ?').get(studentA.id), runBeforeArchiveRace);
  assert.deepEqual(afterArchiveRaceDb.prepare('SELECT * FROM classroom_progress WHERE student_id = ? AND course_id = ?').all(studentA.id, 'craftom-agent'), progressBeforeArchiveRace);
  afterArchiveRaceDb.close();
  assert.equal((await post(baseUrl, `/api/classroom/classes/${classroomA.id}/students/${studentA.id}/restore`, {}, teacherACookie)).status, 200);
  const reloginAfterArchiveRace = await post(baseUrl, '/api/classroom/student-login', { classCode: classroomA.joinCode, personalCode: studentA.loginCode });
  assert.equal(reloginAfterArchiveRace.status, 200);
  studentACookie = cookie(reloginAfterArchiveRace);

  const resetBeforeRelinkRace = await post(baseUrl, '/api/kugel/student/reset', {}, studentACookie);
  assert.equal(resetBeforeRelinkRace.status, 200);
  const relinkRaceBoundary = (await resetBeforeRelinkRace.json()).student.resetAt;
  assert.equal((await post(baseUrl, '/api/kugel/student/start', {}, studentACookie)).status, 200);
  const relinkRaceFinishAt = new Date(Date.parse(relinkRaceBoundary) + 1000).toISOString();
  gameEvents = forLease([
    ...Array.from({ length: 8 }, (_, index) => ({ id: 421 + index, event_type: 'coin_collected', player_name: 'NoaSecure', created_at: relinkRaceFinishAt, block_id: 'gold_block', payload: JSON.stringify({ coin_index: index + 1 }) })),
    { id: 430, event_type: 'finish_button_pressed', player_name: 'NoaSecure', created_at: relinkRaceFinishAt, payload: JSON.stringify({ completed: true }) },
  ]);
  const beforeRelinkRaceDb = new Database(dbFile);
  const runBeforeRelinkRace = beforeRelinkRaceDb.prepare('SELECT * FROM kugel_student_runs WHERE student_id = ?').get(studentA.id);
  const progressBeforeRelinkRace = beforeRelinkRaceDb.prepare('SELECT * FROM classroom_progress WHERE student_id = ? AND course_id = ?').all(studentA.id, 'craftom-agent');
  beforeRelinkRaceDb.close();
  gameEventsDelayMs = 150;
  const relinkEventsStarted = new Promise(resolve => { gameEventsStartedResolve = resolve; });
  const finishDuringRelinkPromise = post(baseUrl, '/api/kugel/student/finish', {}, studentACookie);
  await relinkEventsStarted;
  const relinkDuringFinishDb = new Database(dbFile);
  relinkDuringFinishDb.transaction(() => {
    relinkDuringFinishDb.prepare('UPDATE classroom_minecraft_identities SET player_name = ?, updated_at = ? WHERE student_id = ?')
      .run('RelinkSecure', new Date().toISOString(), studentA.id);
    relinkDuringFinishDb.prepare('UPDATE classroom_students SET minecraft_player_name = ?, updated_at = ? WHERE id = ?')
      .run('RelinkSecure', new Date().toISOString(), studentA.id);
  }).immediate();
  relinkDuringFinishDb.close();
  const finishDuringRelink = await finishDuringRelinkPromise;
  gameEventsDelayMs = 0;
  assert.equal(finishDuringRelink.status, 409, 'finish must reject when the Minecraft player binding changes during monitor delay');
  const afterRelinkRaceDb = new Database(dbFile);
  assert.deepEqual(afterRelinkRaceDb.prepare('SELECT * FROM kugel_student_runs WHERE student_id = ?').get(studentA.id), runBeforeRelinkRace);
  assert.deepEqual(afterRelinkRaceDb.prepare('SELECT * FROM classroom_progress WHERE student_id = ? AND course_id = ?').all(studentA.id, 'craftom-agent'), progressBeforeRelinkRace);
  afterRelinkRaceDb.close();
  const restorePlayerDb = new Database(dbFile);
  restorePlayerDb.transaction(() => {
    restorePlayerDb.prepare('UPDATE classroom_minecraft_identities SET player_name = ?, updated_at = ? WHERE student_id = ?')
      .run('NoaSecure', new Date().toISOString(), studentA.id);
    restorePlayerDb.prepare('UPDATE classroom_students SET minecraft_player_name = ?, updated_at = ? WHERE id = ?')
      .run('NoaSecure', new Date().toISOString(), studentA.id);
  }).immediate();
  restorePlayerDb.close();
  assert.equal((await post(baseUrl, `/api/kugel/classes/${classroomA.id}/students/${studentA.id}/minecraft`, { playerName: 'NoaSecure' }, teacherACookie)).status, 200);

  assert.equal((await post(baseUrl, `/api/kugel/classes/${classroomA.id}/stop`, {}, teacherACookie)).status, 200);
  const raceClassResponse = await post(baseUrl, '/api/classroom/classes', { name: 'כיתת תור פקודות', courses: ['craftom-agent'] }, teacherACookie);
  assert.equal(raceClassResponse.status, 201);
  const raceClass = (await raceClassResponse.json()).classroom;
  const raceStudentResponse = await post(baseUrl, `/api/classroom/classes/${raceClass.id}/students`, { name: 'תלמיד תור' }, teacherACookie);
  const raceStudent = (await raceStudentResponse.json()).student;
  const raceIdentityDb = new Database(dbFile);
  const raceIdentityNow = new Date().toISOString();
  raceIdentityDb.prepare(`INSERT INTO classroom_minecraft_identities
    (student_id, upn, player_name, status, graph_object_id, source, verified_at, created_at, updated_at)
    VALUES (?, 'race.secure@hai.tech', 'RaceSecure', 'verified', 'graph-race-secure',
      'microsoft-graph-via-monitor', ?, ?, ?)`)
    .run(raceStudent.id, raceIdentityNow, raceIdentityNow, raceIdentityNow);
  raceIdentityDb.prepare('UPDATE classroom_students SET minecraft_player_name = ?, updated_at = ? WHERE id = ?')
    .run('RaceSecure', raceIdentityNow, raceStudent.id);
  raceIdentityDb.close();
  assert.equal((await post(baseUrl, `/api/kugel/classes/${raceClass.id}/students/${raceStudent.id}/minecraft`, { playerName: 'RaceSecure' }, teacherACookie)).status, 200);
  assert.equal((await post(baseUrl, `/api/kugel/classes/${raceClass.id}/launch`, {}, teacherACookie)).status, 200);
  let releaseSigningBlocker;
  freezeGate = new Promise(resolve => { releaseSigningBlocker = resolve; });
  const signingBlockerStarted = new Promise(resolve => { freezeStartedResolve = resolve; });
  const signingBlocker = post(baseUrl, `/api/kugel/classes/${raceClass.id}/freeze`, { scope: 'all', target: '', on: true }, teacherACookie);
  await signingBlockerStarted;
  const queuedSignedMessage = post(baseUrl, `/api/kugel/classes/${raceClass.id}/message`,
    { text: 'חתימה טרייה', scope: 'all' }, teacherACookie);
  await new Promise(resolve => setTimeout(resolve, 1100));
  const releaseSecond = Math.floor(Date.now() / 1000);
  releaseSigningBlocker(); freezeGate = null;
  assert.equal((await signingBlocker).status, 200);
  assert.equal((await queuedSignedMessage).status, 200);
  const freshSignedCall = monitorCalls.filter(call => call.url === '/api/internal/craftom-school/v2/live/message'
    && call.body.text === 'חתימה טרייה').at(-1);
  assert.ok(Number(freshSignedCall.headers['x-hai-timestamp']) >= releaseSecond,
    'request_id, body, timestamp, hash, and HMAC must be created only after the per-server queue releases');
  for (const queuedAction of ['message', 'freeze']) {
    let releaseFreeze;
    freezeGate = new Promise(resolve => { releaseFreeze = resolve; });
    const freezeStarted = new Promise(resolve => { freezeStartedResolve = resolve; });
    const blocker = post(baseUrl, `/api/kugel/classes/${raceClass.id}/freeze`, { scope: 'all', target: '', on: true }, teacherACookie);
    await freezeStarted;
    const allCallsBefore = monitorCalls.filter(call => call.url === `/api/internal/craftom-school/v2/live/${queuedAction}` && call.body.scope === 'all').length;
    const queued = queuedAction === 'message'
      ? post(baseUrl, `/api/kugel/classes/${raceClass.id}/message`, { text: 'לא יישלח לכל הכיתה', scope: 'all' }, teacherACookie)
      : post(baseUrl, `/api/kugel/classes/${raceClass.id}/freeze`, { scope: 'all', target: '', on: false }, teacherACookie);
    await new Promise(resolve => setTimeout(resolve, 30));
    const revokeQueuedTeacherDb = new Database(dbFile);
    revokeQueuedTeacherDb.prepare('DELETE FROM teacher_courses WHERE teacher_id = ? AND course_id = ?').run(teacherA.id, 'craftom-agent');
    revokeQueuedTeacherDb.close();
    releaseFreeze(); freezeGate = null;
    assert.equal((await blocker).status, 200);
    const queuedResponse = await queued;
    const queuedBody = await queuedResponse.json();
    assert.ok([403, 409].includes(queuedResponse.status), `queued all-scope ${queuedAction} must be cancelled after entitlement revocation: ${queuedResponse.status} ${JSON.stringify(queuedBody)}`);
    const allCallsAfter = monitorCalls.filter(call => call.url === `/api/internal/craftom-school/v2/live/${queuedAction}` && call.body.scope === 'all').length;
    assert.equal(allCallsAfter, allCallsBefore, `cancelled all-scope ${queuedAction} must not reach the monitor`);
    const restoreQueuedTeacherDb = new Database(dbFile);
    restoreQueuedTeacherDb.prepare('INSERT INTO teacher_courses (teacher_id, course_id, created_at) VALUES (?, ?, ?)').run(teacherA.id, 'craftom-agent', new Date().toISOString());
    restoreQueuedTeacherDb.close();
  }
  for (const queuedAction of ['message', 'freeze']) {
    let releaseFreeze;
    freezeGate = new Promise(resolve => { releaseFreeze = resolve; });
    const freezeStarted = new Promise(resolve => { freezeStartedResolve = resolve; });
    const blocker = post(baseUrl, `/api/kugel/classes/${raceClass.id}/freeze`, { scope: 'all', target: '', on: true }, teacherACookie);
    await freezeStarted;
    const targetCallsBefore = monitorCalls.filter(call => call.url === `/api/internal/craftom-school/v2/live/${queuedAction}` && call.body.scope === 'player').length;
    const queued = queuedAction === 'message'
      ? post(baseUrl, `/api/kugel/classes/${raceClass.id}/message`, { text: 'לא יישלח', scope: 'player', target: 'RaceSecure' }, teacherACookie)
      : post(baseUrl, `/api/kugel/classes/${raceClass.id}/freeze`, { scope: 'player', target: 'RaceSecure', on: true }, teacherACookie);
    await new Promise(resolve => setTimeout(resolve, 30));
    assert.equal((await post(baseUrl, `/api/classroom/classes/${raceClass.id}/students/${raceStudent.id}/archive`, {}, teacherACookie)).status, 200);
    releaseFreeze(); freezeGate = null;
    assert.equal((await blocker).status, 200);
    const queuedResponse = await queued;
    const queuedBody = await queuedResponse.json();
    assert.ok([401, 404, 409].includes(queuedResponse.status), `queued player ${queuedAction} must be cancelled after archive: ${queuedResponse.status} ${JSON.stringify(queuedBody)}`);
    const targetCallsAfter = monitorCalls.filter(call => call.url === `/api/internal/craftom-school/v2/live/${queuedAction}` && call.body.scope === 'player').length;
    assert.equal(targetCallsAfter, targetCallsBefore, `cancelled player ${queuedAction} must not reach the monitor`);
    assert.equal((await post(baseUrl, `/api/classroom/classes/${raceClass.id}/students/${raceStudent.id}/restore`, {}, teacherACookie)).status, 200);
  }

  const raceStudentLogin = await post(baseUrl, '/api/classroom/student-login', {
    classCode: raceClass.joinCode, personalCode: raceStudent.loginCode,
  });
  assert.equal(raceStudentLogin.status, 200);
  let raceStudentCookie = cookie(raceStudentLogin);
  const raceSubmissionDb = new Database(dbFile);
  const submissionsBeforeSlowRace = raceSubmissionDb.prepare('SELECT * FROM craftom_lesson_submissions WHERE student_id = ?').all(raceStudent.id);
  const progressBeforeSlowRace = raceSubmissionDb.prepare('SELECT * FROM classroom_progress WHERE student_id = ?').all(raceStudent.id);
  raceSubmissionDb.close();
  const attachmentDirectory = join(tempDir, 'craftom-exit-ticket-attachments');
  const filesBeforeSlowRace = countSubmissionFiles(attachmentDirectory);
  const slowTicket = slowPost(baseUrl, '/api/craftom/exit-ticket', {
    lessonId: 0, challengeId: 1, lessonTitle: 'מרוץ ארכיון', challengeTitle: 'בדיקה',
    exitQuestion: 'מה בנית?', answer: 'תשובת בדיקת מרוץ',
    photo: { name: 'race.png', dataUrl: pngDataUrl },
  }, raceStudentCookie);
  await new Promise(resolve => setTimeout(resolve, 50));
  assert.equal((await post(baseUrl, `/api/classroom/classes/${raceClass.id}/students/${raceStudent.id}/archive`, {}, teacherACookie)).status, 200);
  slowTicket.finish();
  const rejectedSlowTicket = await slowTicket.response;
  assert.ok([401, 409].includes(rejectedSlowTicket.status), `slow exit ticket must reject archive race: ${rejectedSlowTicket.status} ${rejectedSlowTicket.body}`);
  const afterSlowRaceDb = new Database(dbFile);
  assert.deepEqual(afterSlowRaceDb.prepare('SELECT * FROM craftom_lesson_submissions WHERE student_id = ?').all(raceStudent.id), submissionsBeforeSlowRace);
  assert.deepEqual(afterSlowRaceDb.prepare('SELECT * FROM classroom_progress WHERE student_id = ?').all(raceStudent.id), progressBeforeSlowRace);
  afterSlowRaceDb.close();
  assert.equal(countSubmissionFiles(attachmentDirectory), filesBeforeSlowRace, 'rejected slow submission must remove its newly written file');
  assert.equal((await post(baseUrl, `/api/classroom/classes/${raceClass.id}/students/${raceStudent.id}/restore`, {}, teacherACookie)).status, 200);
  const restoredRaceStudentLogin = await post(baseUrl, '/api/classroom/student-login', {
    classCode: raceClass.joinCode, personalCode: raceStudent.loginCode,
  });
  assert.equal(restoredRaceStudentLogin.status, 200);
  raceStudentCookie = cookie(restoredRaceStudentLogin);

  const teacherEntitlementTicket = slowPost(baseUrl, '/api/craftom/exit-ticket', {
    lessonId: 0, challengeId: 1, lessonTitle: 'מרוץ הרשאת מורה', challengeTitle: 'בדיקה',
    exitQuestion: 'מה בנית?', answer: 'תשובת בדיקת הרשאה',
    photo: { name: 'teacher-entitlement-race.png', dataUrl: pngDataUrl },
  }, raceStudentCookie);
  await new Promise(resolve => setTimeout(resolve, 50));
  const revokeTeacherEntitlementDb = new Database(dbFile);
  revokeTeacherEntitlementDb.prepare('DELETE FROM teacher_courses WHERE teacher_id = ? AND course_id = ?').run(teacherA.id, 'craftom-agent');
  revokeTeacherEntitlementDb.close();
  teacherEntitlementTicket.finish();
  const rejectedTeacherEntitlementTicket = await teacherEntitlementTicket.response;
  assert.ok([403, 409].includes(rejectedTeacherEntitlementTicket.status),
    `slow exit ticket must reject teacher entitlement revocation: ${rejectedTeacherEntitlementTicket.status} ${rejectedTeacherEntitlementTicket.body}`);
  const afterTeacherEntitlementRaceDb = new Database(dbFile);
  assert.deepEqual(afterTeacherEntitlementRaceDb.prepare('SELECT * FROM craftom_lesson_submissions WHERE student_id = ?').all(raceStudent.id), submissionsBeforeSlowRace);
  assert.deepEqual(afterTeacherEntitlementRaceDb.prepare('SELECT * FROM classroom_progress WHERE student_id = ?').all(raceStudent.id), progressBeforeSlowRace);
  afterTeacherEntitlementRaceDb.prepare('INSERT INTO teacher_courses (teacher_id, course_id, created_at) VALUES (?, ?, ?)').run(teacherA.id, 'craftom-agent', new Date().toISOString());
  afterTeacherEntitlementRaceDb.close();
  assert.equal(countSubmissionFiles(attachmentDirectory), filesBeforeSlowRace, 'rejected teacher entitlement race must remove its newly written file');

  const restoreRaceLeaseDb = new Database(dbFile);
  restoreRaceLeaseDb.transaction(() => {
    restoreRaceLeaseDb.prepare('UPDATE kugel_class_sessions SET active = 0, server_state = ? WHERE classroom_id = ?').run('idle', raceClass.id);
    restoreRaceLeaseDb.prepare("UPDATE kugel_class_sessions SET active = 1, server_state = 'running' WHERE classroom_id = ?").run(classroomA.id);
  })();
  restoreRaceLeaseDb.close();
  const restoredLeaseDb = new Database(dbFile, { readonly: true });
  const restoredLease = restoredLeaseDb.prepare(`
    SELECT launch_token, generation FROM kugel_class_sessions WHERE classroom_id = ?
  `).get(classroomA.id);
  restoredLeaseDb.close();
  monitorWorldLease = {
    lease_id: restoredLease.launch_token,
    owner_id: classroomA.id,
    generation: restoredLease.generation,
    world: 'restored-test-world',
  };

  const tamperDb = new Database(dbFile);
  tamperDb.prepare('DELETE FROM teacher_courses WHERE teacher_id = ? AND course_id = ?').run(teacherA.id, 'craftom-agent');
  tamperDb.close();
  const revokedStudentSubmissions = await fetch(`${baseUrl}/api/craftom/submissions`, { headers: { Cookie: submissionStudentCookie } });
  assert.equal(revokedStudentSubmissions.status, 403, 'revoking Craftom entitlement must revoke student submission listing');
  const revokedStudentPhoto = await fetch(`${baseUrl}${submissionPhotoUrl}`, { headers: { Cookie: submissionStudentCookie } });
  assert.equal(revokedStudentPhoto.status, 403, 'revoking Craftom entitlement must revoke student photo access');
  const revokedTeacherPhoto = await fetch(`${baseUrl}${submissionPhotoUrl}`, { headers: { Cookie: teacherACookie } });
  assert.equal(revokedTeacherPhoto.status, 403, 'revoking Craftom entitlement must revoke teacher photo access');
  const inconsistentEntitlement = await fetch(`${baseUrl}/api/kugel/session`, { headers: { Cookie: studentACookie } });
  assert.equal(inconsistentEntitlement.status, 403, 'student access must fail closed if teacher entitlement is missing');
  const restoreTeacherBeforeStop = await post(baseUrl, `/api/classroom/admin/teachers/${teacherA.id}/courses`, { courses: ['sisi', 'craftom-agent'] }, adminCookie);
  assert.equal(restoreTeacherBeforeStop.status, 200);

  const stop = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/stop`, {}, teacherACookie);
  const stopBody = await stop.json();
  assert.equal(stop.status, 200, `${JSON.stringify(stopBody)}\n${serverOutput}`);
  const launchOtherAfterStop = await post(baseUrl, `/api/kugel/classes/${classroomB.id}/launch`, {}, teacherBCookie);
  assert.equal(launchOtherAfterStop.status, 200, 'another class may launch only after the active class releases the server');
  gameEvents = forLease([{ id: 999, event_type: 'coin_collected', player_name: 'NoaSecure', created_at: new Date().toISOString(), payload: JSON.stringify({ coin_index: 1 }) }]);
  const stoppedClassView = await fetch(`${baseUrl}/api/kugel/session?classroomId=${classroomA.id}`, { headers: { Cookie: teacherACookie } });
  const stoppedClassBody = await stoppedClassView.json();
  assert.equal(stoppedClassBody.minecraft, null, 'inactive classes must not receive current server connection credentials');
  assert.equal(stoppedClassBody.students.find(item => item.id === studentA.id).coins, 0, 'inactive classes must not poll events from the class that now owns the server');

  const stopOther = await post(baseUrl, `/api/kugel/classes/${classroomB.id}/stop`, {}, teacherBCookie);
  assert.equal(stopOther.status, 200);

  worldOpenDelayMs = 120;
  const delayedOpenStarted = new Promise(resolve => { worldOpenStartedResolve = resolve; });
  const launchDuringSessionRevocationPromise = post(baseUrl, `/api/kugel/classes/${classroomA.id}/lessons/16/launch`, {}, teacherACookie);
  await delayedOpenStarted;
  const revocationRaceDb = new Database(dbFile);
  const proposedRevokedLease = revocationRaceDb.prepare(`
    SELECT launch_token, generation, world_id FROM kugel_class_sessions WHERE classroom_id = ?
  `).get(classroomA.id);
  revocationRaceDb.prepare(`UPDATE classroom_teacher_sessions SET revoked_at = ?
    WHERE teacher_id = ? AND revoked_at IS NULL`).run(new Date().toISOString(), teacherA.id);
  revocationRaceDb.close();
  const launchDuringSessionRevocation = await launchDuringSessionRevocationPromise.catch(error => {
    throw new Error(`delayed launch request failed: ${error.message}\n${serverOutput}`);
  });
  worldOpenDelayMs = 0;
  assert.ok([401, 409].includes(launchDuringSessionRevocation.status),
    'a launch must reject when its initiating teacher session is revoked while world open is awaited');
  const revokedLaunchStateDb = new Database(dbFile, { readonly: true });
  const revokedLaunchState = revokedLaunchStateDb.prepare(`
    SELECT active, server_state FROM kugel_class_sessions WHERE classroom_id = ?
  `).get(classroomA.id);
  revokedLaunchStateDb.close();
  assert.deepEqual(revokedLaunchState, { active: 0, server_state: 'idle' },
    'a stale activation must release locally only after closing the proposed generation');
  assert.equal(monitorWorldLease, null, 'the proposed world generation must be confirmed closed after session revocation');
  const revokedLaunchClose = monitorCalls.filter(call => call.url === '/api/internal/craftom-school/v2/world/close').at(-1);
  assert.deepEqual(
    { lease_id: revokedLaunchClose.body.lease_id, generation: revokedLaunchClose.body.generation },
    { lease_id: proposedRevokedLease.launch_token, generation: proposedRevokedLease.generation },
    'session-revocation cleanup must guarded-close the exact proposed lease generation',
  );
  const reloginTeacherA = await post(baseUrl, '/api/classroom/teacher-login', {
    email: 'agent-a@example.test', password: registeredA.password,
  });
  assert.equal(reloginTeacherA.status, 200);
  teacherACookie = cookie(reloginTeacherA);

  worldOpenDelayMs = 1500;
  const timedOutLaunch = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/launch`, {}, teacherACookie);
  assert.equal(timedOutLaunch.status, 504, 'a real monitor timeout must fail the launch');
  const timedOutLeaseDb = new Database(dbFile, { readonly: true });
  const timedOutLease = timedOutLeaseDb.prepare('SELECT active, server_state FROM kugel_class_sessions WHERE classroom_id = ?').get(classroomA.id);
  timedOutLeaseDb.close();
  assert.deepEqual(timedOutLease, { active: 1, server_state: 'stopping' },
    'an ambiguous timeout must retain the stopping lease instead of releasing the server');
  assert.equal((await post(baseUrl, `/api/kugel/classes/${classroomB.id}/lessons/2/launch`, {}, teacherBCookie)).status, 409,
    'a competing class stays blocked while timeout cleanup is ambiguous');
  await new Promise(resolve => setTimeout(resolve, 900));
  worldOpenDelayMs = 0;
  const automaticallyCleanedTimeout = await fetch(`${baseUrl}/api/kugel/session?classroomId=${classroomA.id}`, {
    headers: { Cookie: teacherACookie },
  });
  assert.equal((await automaticallyCleanedTimeout.json()).session.active, false,
    'a timed-out fresh open must be reconciled and released automatically after the late request settles');
  assert.equal((await post(baseUrl, `/api/kugel/classes/${classroomB.id}/lessons/2/launch`, {}, teacherBCookie)).status, 200,
    'a competing class may proceed after automatic timeout reconciliation');
  assert.equal((await post(baseUrl, `/api/kugel/classes/${classroomB.id}/stop`, {}, teacherBCookie)).status, 200);

  worldOpenFailuresRemaining = 1;
  worldCloseFailuresRemaining = 1;
  const ambiguousLaunch = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/launch`, {}, teacherACookie);
  assert.equal(ambiguousLaunch.status, 503, 'an ambiguous open failure must preserve unavailable cleanup status');
  const blockedAfterAmbiguousOpen = await post(baseUrl, `/api/kugel/classes/${classroomB.id}/launch`, {}, teacherBCookie);
  assert.equal(blockedAfterAmbiguousOpen.status, 409, 'an ambiguous open plus failed freeze must retain the lease');
  const retryAmbiguousCleanup = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/stop`, {}, teacherACookie);
  assert.equal(retryAmbiguousCleanup.status, 200, 'ambiguous open cleanup must be retriable');
  const launchAfterAmbiguousCleanup = await post(baseUrl, `/api/kugel/classes/${classroomB.id}/launch`, {}, teacherBCookie);
  assert.equal(launchAfterAmbiguousCleanup.status, 200);
  assert.equal((await post(baseUrl, `/api/kugel/classes/${classroomB.id}/stop`, {}, teacherBCookie)).status, 200);

  worldOpenDelayMs = 50;
  worldCloseDelayMs = 120;
  const staleLaunchPromise = post(baseUrl, `/api/kugel/classes/${classroomA.id}/launch`, {}, teacherACookie);
  await new Promise((resolve) => setTimeout(resolve, 30));
  const stopDuringLaunchPromise = post(baseUrl, `/api/kugel/classes/${classroomA.id}/stop`, {}, teacherACookie);
  await new Promise((resolve) => setTimeout(resolve, 30));
  const launchDuringStop = await post(baseUrl, `/api/kugel/classes/${classroomB.id}/launch`, {}, teacherBCookie);
  assert.equal(launchDuringStop.status, 409, 'a class must not acquire the lease while the previous owner is stopping');
  const stopDuringLaunch = await stopDuringLaunchPromise;
  assert.equal(stopDuringLaunch.status, 200);
  const staleLaunch = await staleLaunchPromise;
  assert.equal(staleLaunch.status, 409, 'a completed stale monitor request must not reclaim a released lease');
  worldOpenDelayMs = 0;
  worldCloseDelayMs = 0;
  const afterStaleLaunch = await fetch(`${baseUrl}/api/kugel/session?classroomId=${classroomA.id}`, { headers: { Cookie: teacherACookie } });
  assert.equal((await afterStaleLaunch.json()).session.active, false);

  const relaunchForFailedStop = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/launch`, {}, teacherACookie);
  assert.equal(relaunchForFailedStop.status, 200);
  worldCloseFailuresRemaining = 1;
  const failedStop = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/stop`, {}, teacherACookie);
  assert.equal(failedStop.status, 503, 'a failed guarded close must keep its retriable status and lease');
  const blockedAfterFailedStop = await post(baseUrl, `/api/kugel/classes/${classroomB.id}/launch`, {}, teacherBCookie);
  assert.equal(blockedAfterFailedStop.status, 409, 'another class must remain blocked while cleanup needs retry');
  const retryStop = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/stop`, {}, teacherACookie);
  assert.equal(retryStop.status, 200, 'the same teacher must be able to retry failed cleanup');
  const relaunchBeforeRevoke = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/launch`, {}, teacherACookie);
  assert.equal(relaunchBeforeRevoke.status, 200);
  const closesBeforeRevoke = monitorCalls.filter(call => call.url === '/api/internal/craftom-school/v2/world/close').length;
  worldCloseDelayMs = 120;
  const revokeKugelPromise = post(baseUrl, `/api/classroom/admin/teachers/${teacherA.id}/courses`, { courses: ['sisi'] }, adminCookie);
  await new Promise((resolve) => setTimeout(resolve, 30));
  const launchDuringRevoke = await post(baseUrl, `/api/kugel/classes/${classroomB.id}/launch`, {}, teacherBCookie);
  assert.equal(launchDuringRevoke.status, 409, 'a class must not acquire the lease while revocation cleanup is running');
  const revokeKugel = await revokeKugelPromise;
  assert.equal(revokeKugel.status, 200);
  const closesAfterRevoke = monitorCalls.filter(call => call.url === '/api/internal/craftom-school/v2/world/close').length;
  assert.equal(closesAfterRevoke, closesBeforeRevoke + 1, 'entitlement revocation must guarded-close the externally running world');
  worldCloseDelayMs = 0;
  const launchAfterRevokeCleanup = await post(baseUrl, `/api/kugel/classes/${classroomB.id}/launch`, {}, teacherBCookie);
  assert.equal(launchAfterRevokeCleanup.status, 200, 'the next class may launch after revocation cleanup finishes');
  const stopAfterRevokeCleanup = await post(baseUrl, `/api/kugel/classes/${classroomB.id}/stop`, {}, teacherBCookie);
  assert.equal(stopAfterRevokeCleanup.status, 200);
  assert.equal((await fetch(`${baseUrl}/api/kugel/session?classroomId=${classroomA.id}`, { headers: { Cookie: teacherACookie } })).status, 403);
  assert.equal((await fetch(`${baseUrl}/api/kugel/session`, { headers: { Cookie: studentACookie } })).status, 403);
  const restoreKugel = await post(baseUrl, `/api/classroom/admin/teachers/${teacherA.id}/courses`, { courses: ['sisi', 'craftom-agent'] }, adminCookie);
  assert.equal(restoreKugel.status, 200);
  const restoredClass = await post(baseUrl, `/api/classroom/classes/${classroomA.id}/courses`, { courses: ['craftom-agent'] }, teacherACookie);
  assert.equal(restoredClass.status, 200);
  const launchBeforeClassRevoke = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/launch`, {}, teacherACookie);
  assert.equal(launchBeforeClassRevoke.status, 200);
  worldCloseDelayMs = 120;
  const classRevokePromise = post(baseUrl, `/api/classroom/classes/${classroomA.id}/courses`, { courses: ['sisi'] }, teacherACookie);
  await new Promise((resolve) => setTimeout(resolve, 30));
  const launchDuringClassRevoke = await post(baseUrl, `/api/kugel/classes/${classroomB.id}/launch`, {}, teacherBCookie);
  assert.equal(launchDuringClassRevoke.status, 409, 'class-course revocation must retain the lease until freeze completes');
  const classRevoke = await classRevokePromise;
  assert.equal(classRevoke.status, 200);
  worldCloseDelayMs = 0;
  const launchAfterClassRevoke = await post(baseUrl, `/api/kugel/classes/${classroomB.id}/launch`, {}, teacherBCookie);
  assert.equal(launchAfterClassRevoke.status, 200);
  assert.equal((await post(baseUrl, `/api/kugel/classes/${classroomB.id}/stop`, {}, teacherBCookie)).status, 200);
  const restoreClassAgain = await post(baseUrl, `/api/classroom/classes/${classroomA.id}/courses`, { courses: ['craftom-agent'] }, teacherACookie);
  assert.equal(restoreClassAgain.status, 200);
  const restoredView = await fetch(`${baseUrl}/api/kugel/session?classroomId=${classroomA.id}`, { headers: { Cookie: teacherACookie } });
  assert.equal(restoredView.status, 200);
  assert.equal((await restoredView.json()).session.active, false, 'revocation must destroy the old live Minecraft session');

  worldOpenDelayMs = 50;
  const concurrentSameClassLaunches = await Promise.all([
    post(baseUrl, `/api/kugel/classes/${classroomA.id}/lessons/3/launch`, {}, teacherACookie),
    post(baseUrl, `/api/kugel/classes/${classroomA.id}/lessons/4/launch`, {}, teacherACookie),
  ]);
  worldOpenDelayMs = 0;
  assert.deepEqual(concurrentSameClassLaunches.map(response => response.status).sort(), [200, 409],
    'concurrent same-class opens must not create overlapping generations');
  const storedServerDb = new Database(dbFile);
  storedServerDb.prepare(`UPDATE kugel_class_sessions SET monitor_server_name = ?
    WHERE classroom_id = ? AND active = 1 AND server_state = 'running'`)
    .run('stored-monitor-name', classroomA.id);
  storedServerDb.close();
  const closeCountBeforeStoredName = monitorCalls.filter(call => call.url === '/api/internal/craftom-school/v2/world/close').length;
  assert.equal((await post(baseUrl, `/api/kugel/classes/${classroomA.id}/stop`, {}, teacherACookie)).status, 200);
  const storedNameClose = monitorCalls.filter(call => call.url === '/api/internal/craftom-school/v2/world/close').slice(closeCountBeforeStoredName).at(-1);
  assert.equal(storedNameClose.body.server, 'stored-monitor-name', 'stop must target the server name persisted with the lease');

  const launchBeforeCompoundEntry = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/lessons/5/launch`, {}, teacherACookie);
  assert.equal(launchBeforeCompoundEntry.status, 200);
  const beforeRestartMismatchDb = new Database(dbFile);
  const beforeRestartMismatch = beforeRestartMismatchDb.prepare('SELECT * FROM kugel_class_sessions WHERE classroom_id = ?').get(classroomA.id);
  beforeRestartMismatchDb.prepare(`UPDATE kugel_class_sessions SET
    previous_lesson_id = lesson_id, previous_world_id = world_id,
    previous_events_since = events_since, previous_generation = generation,
    lesson_id = 2, world_id = 'pending-restart-world', generation = generation + 1, server_state = 'starting'
    WHERE classroom_id = ?`).run(classroomA.id);
  beforeRestartMismatchDb.close();
  child.kill('SIGTERM');
  await new Promise(resolve => child.once('exit', resolve));
  const stateReadsBeforeRestart = monitorCalls.filter(call => call.url === '/api/internal/craftom-school/v2/world/state').length;
  restartedChild = spawn(process.execPath, ['server.js'], { cwd: root, env: appEnv, stdio: ['ignore', 'pipe', 'pipe'] });
  restartedChild.stdout.on('data', chunk => { serverOutput += chunk.toString(); });
  restartedChild.stderr.on('data', chunk => { serverOutput += chunk.toString(); });
  await waitForServer(baseUrl);
  assert.ok(monitorCalls.filter(call => call.url === '/api/internal/craftom-school/v2/world/state').length > stateReadsBeforeRestart,
    'restart must reconcile persisted active leases through the signed monitor state endpoint');
  const recoveredAfterRestart = await fetch(`${baseUrl}/api/kugel/session?classroomId=${classroomA.id}`, { headers: { Cookie: teacherACookie } });
  assert.equal(recoveredAfterRestart.status, 200);
  const recoveredAfterRestartBody = await recoveredAfterRestart.json();
  assert.ok(recoveredAfterRestartBody.minecraft, 'a matching entitled monitor lease must recover to running after restart');
  assert.equal(recoveredAfterRestartBody.session.lessonId, beforeRestartMismatch.lesson_id,
    'restart reconciliation must restore the previous generation when the monitor never adopted the proposed switch');
  assert.equal(recoveredAfterRestartBody.session.serverState, 'running');

  restartedChild.kill('SIGTERM');
  await new Promise(resolve => restartedChild.once('exit', resolve));
  const revokedPreviousDb = new Database(dbFile);
  const revokedPrevious = revokedPreviousDb.prepare('SELECT * FROM kugel_class_sessions WHERE classroom_id = ?').get(classroomA.id);
  revokedPreviousDb.prepare(`UPDATE kugel_class_sessions SET
    previous_lesson_id = lesson_id, previous_world_id = world_id,
    previous_events_since = events_since, previous_generation = generation,
    lesson_id = 6, world_id = 'pending-revoked-world', generation = generation + 1, server_state = 'error'
    WHERE classroom_id = ?`).run(classroomA.id);
  revokedPreviousDb.prepare('DELETE FROM classroom_courses WHERE classroom_id = ? AND course_id = ?')
    .run(classroomA.id, 'craftom-agent');
  revokedPreviousDb.close();
  const closesBeforeRevokedPrevious = monitorCalls.filter(call => call.url === '/api/internal/craftom-school/v2/world/close').length;
  restartedChild = spawn(process.execPath, ['server.js'], { cwd: root, env: appEnv, stdio: ['ignore', 'pipe', 'pipe'] });
  restartedChild.stdout.on('data', chunk => { serverOutput += chunk.toString(); });
  restartedChild.stderr.on('data', chunk => { serverOutput += chunk.toString(); });
  await waitForServer(baseUrl);
  const revokedPreviousClose = monitorCalls.filter(call => call.url === '/api/internal/craftom-school/v2/world/close')
    .slice(closesBeforeRevokedPrevious).at(-1);
  assert.equal(revokedPreviousClose?.body.generation, revokedPrevious.generation,
    'revoked restoration must guarded-close the exact remotely running previous generation');
  const revokedPreviousStateDb = new Database(dbFile);
  assert.equal(revokedPreviousStateDb.prepare('SELECT active FROM kugel_class_sessions WHERE classroom_id = ?').get(classroomA.id).active, 0,
    'revoked restoration must release locally only after the previous generation is confirmed closed');
  revokedPreviousStateDb.prepare('INSERT INTO classroom_courses (classroom_id, course_id, created_at) VALUES (?, ?, ?)')
    .run(classroomA.id, 'craftom-agent', new Date().toISOString());
  revokedPreviousStateDb.close();
  assert.equal((await post(baseUrl, `/api/kugel/classes/${classroomA.id}/lessons/6/launch`, {}, teacherACookie)).status, 200);
  monitorWorldLease.state = 'starting';
  restartedChild.kill('SIGTERM');
  await new Promise(resolve => restartedChild.once('exit', resolve));
  restartedChild = spawn(process.execPath, ['server.js'], { cwd: root, env: appEnv, stdio: ['ignore', 'pipe', 'pipe'] });
  restartedChild.stdout.on('data', chunk => { serverOutput += chunk.toString(); });
  restartedChild.stderr.on('data', chunk => { serverOutput += chunk.toString(); });
  await waitForServer(baseUrl);
  const nonRunningStateView = await fetch(`${baseUrl}/api/kugel/session?classroomId=${classroomA.id}`, { headers: { Cookie: teacherACookie } });
  const nonRunningStateBody = await nonRunningStateView.json();
  assert.equal(nonRunningStateBody.minecraft, null, 'a matching but non-running monitor state must never expose Minecraft');
  assert.equal(nonRunningStateBody.session.active, false, 'a matching non-running state must be guarded-closed before release');
  assert.equal((await post(baseUrl, `/api/kugel/classes/${classroomA.id}/lessons/6/launch`, {}, teacherACookie)).status, 200);
  restartedChild.kill('SIGTERM');
  await new Promise(resolve => restartedChild.once('exit', resolve));
  queuedStateResponses.push({
    active: true, state: 'running', server: 'test-kugel-monitor', lease_id: monitorWorldLease.lease_id,
    generation: monitorWorldLease.generation, world: monitorWorldLease.world, last_error: null, unexpected: true,
  });
  restartedChild = spawn(process.execPath, ['server.js'], { cwd: root, env: appEnv, stdio: ['ignore', 'pipe', 'pipe'] });
  restartedChild.stdout.on('data', chunk => { serverOutput += chunk.toString(); });
  restartedChild.stderr.on('data', chunk => { serverOutput += chunk.toString(); });
  await waitForServer(baseUrl);
  const invalidStateView = await fetch(`${baseUrl}/api/kugel/session?classroomId=${classroomA.id}`, { headers: { Cookie: teacherACookie } });
  const invalidStateBody = await invalidStateView.json();
  assert.equal(invalidStateBody.minecraft, null, 'an invalid state schema must never expose Minecraft connection details');
  assert.equal(invalidStateBody.session.serverState, 'error');
  restartedChild.kill('SIGTERM');
  await new Promise(resolve => restartedChild.once('exit', resolve));
  queuedStateResponses.push('{');
  restartedChild = spawn(process.execPath, ['server.js'], { cwd: root, env: appEnv, stdio: ['ignore', 'pipe', 'pipe'] });
  restartedChild.stdout.on('data', chunk => { serverOutput += chunk.toString(); });
  restartedChild.stderr.on('data', chunk => { serverOutput += chunk.toString(); });
  await waitForServer(baseUrl);
  const malformedStateView = await fetch(`${baseUrl}/api/kugel/session?classroomId=${classroomA.id}`, { headers: { Cookie: teacherACookie } });
  assert.equal((await malformedStateView.json()).minecraft, null,
    'malformed lifecycle JSON must fail closed without exposing Minecraft details');
  restartedChild.kill('SIGTERM');
  await new Promise(resolve => restartedChild.once('exit', resolve));
  queuedStateResponses.push(JSON.stringify({ oversized: 'x'.repeat(33 * 1024) }));
  restartedChild = spawn(process.execPath, ['server.js'], { cwd: root, env: appEnv, stdio: ['ignore', 'pipe', 'pipe'] });
  restartedChild.stdout.on('data', chunk => { serverOutput += chunk.toString(); });
  restartedChild.stderr.on('data', chunk => { serverOutput += chunk.toString(); });
  await waitForServer(baseUrl);
  const oversizedStateView = await fetch(`${baseUrl}/api/kugel/session?classroomId=${classroomA.id}`, { headers: { Cookie: teacherACookie } });
  assert.equal((await oversizedStateView.json()).minecraft, null,
    'an oversized lifecycle response must fail closed without exposing Minecraft details');
  restartedChild.kill('SIGTERM');
  await new Promise(resolve => restartedChild.once('exit', resolve));
  restartedChild = spawn(process.execPath, ['server.js'], { cwd: root, env: appEnv, stdio: ['ignore', 'pipe', 'pipe'] });
  restartedChild.stdout.on('data', chunk => { serverOutput += chunk.toString(); });
  restartedChild.stderr.on('data', chunk => { serverOutput += chunk.toString(); });
  await waitForServer(baseUrl);
  const recoveredAfterInvalidStates = await fetch(`${baseUrl}/api/kugel/session?classroomId=${classroomA.id}`, { headers: { Cookie: teacherACookie } });
  assert.ok((await recoveredAfterInvalidStates.json()).minecraft,
    'a later exact running state may safely recover a retained lease');
  const unauthorizedCompoundSync = await post(baseUrl, '/api/internal/minecraft/compound-assignments', {
    minecraft_username: 'NoaSecure',
    compound_id: 5,
  });
  assert.equal(unauthorizedCompoundSync.status, 401, 'compound assignment sync requires the Minecraft internal token');
  const compoundSync = await fetch(`${baseUrl}/api/internal/minecraft/compound-assignments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${lifecycleSecret}` },
    body: JSON.stringify({ minecraft_username: 'NoaSecure', compound_id: 5, x: 10, y: 3, z: 20 }),
  });
  assert.equal(compoundSync.status, 200);
  const anonymousCompoundEntry = await post(baseUrl, '/api/kugel/compound-entry', { compoundId: 5 });
  assert.equal(anonymousCompoundEntry.status, 401, 'compound links must not create a classroom identity for anonymous callers');
  const foreignCompoundEntry = await post(baseUrl, '/api/kugel/compound-entry', { compoundId: 5 }, studentBCookie);
  assert.equal(foreignCompoundEntry.status, 404, 'a compound link must not switch one signed-in student into another student’s session');
  assert.equal(foreignCompoundEntry.headers.get('set-cookie'), null, 'rejected compound entry must not issue a classroom session');
  const compoundEntry = await post(baseUrl, '/api/kugel/compound-entry', { compoundId: 5 }, studentACookie);
  assert.equal(compoundEntry.status, 200, 'the assigned student may use their own NPC compound link');
  const compoundEntryBody = await compoundEntry.json();
  assert.equal(compoundEntryBody.student.id, studentA.id);
  assert.equal(compoundEntryBody.student.minecraftPlayerName, 'NoaSecure');
  assert.equal(compoundEntry.headers.get('set-cookie'), null, 'compound entry must preserve the authenticated student session instead of minting a new one');
  assert.equal((await post(baseUrl, `/api/kugel/classes/${classroomA.id}/stop`, {}, teacherACookie)).status, 200);

  assert.doesNotMatch(source, /startedAt:\s*continuingActiveLesson\s*\?\s*state\.run/,
    'student start must not derive its write from a run row read outside the write transaction');
  assert.match(source, /incrementAttempt:\s*activeLesson\.id === 0[\s\S]{0,140}!Boolean\(currentRun\?\.finished_at\)/,
    'lesson-zero attempts must use the current transactional row and must not be incremented by another lesson');
  assert.doesNotMatch(source, /KUGEL_MINECRAFT_ACCESS_CODE\s*=.*\|\|\s*'[^']+'/,
    'Minecraft access codes must not have repository defaults');
  assert.doesNotMatch(source, /KUGEL_MINECRAFT_SERVER_HOST\s*=.*\|\|\s*'[^']+'/,
    'Minecraft hosts must not have repository defaults');
  const configuredSource = source.slice(source.indexOf('function kugelMinecraftConfigured()'),
    source.indexOf('function kugelMonitorTransportConfigured()'));
  const transportSource = source.slice(source.indexOf('function kugelMonitorTransportConfigured()'),
    source.indexOf('function kugelMonitorServerName()'));
  const evaluateConfiguration = new Function('url', 'expectedHost', 'secret', 'nodeEnv', `
    const KUGEL_PREVIEW_MOCK_MINECRAFT = false;
    const KUGEL_MONITOR_API_URL = url;
    const KUGEL_MONITOR_EXPECTED_HOST = expectedHost;
    const KUGEL_MONITOR_SERVER_NAME = 'configured-server';
    const KUGEL_MINECRAFT_INTERNAL_TOKEN = secret;
    const KUGEL_MINECRAFT_SERVER_NAME = 'Minecraft';
    const KUGEL_MINECRAFT_SERVER_HOST = 'minecraft.example';
    const KUGEL_MINECRAFT_SERVER_PORT = '19132';
    const KUGEL_MINECRAFT_SERVER_ID = 'server-id';
    const KUGEL_MINECRAFT_ACCESS_CODE = 'access-code';
    const process = { env: { NODE_ENV: nodeEnv } };
    ${configuredSource}
    ${transportSource}
    return kugelMinecraftConfigured();
  `);
  assert.equal(evaluateConfiguration('https://monitor.example', 'monitor.example', 'short', 'production'), false,
    'production configuration must reject a weak lifecycle secret');
  assert.equal(evaluateConfiguration('http://monitor.example', 'monitor.example', lifecycleSecret, 'production'), false,
    'production configuration must reject non-HTTPS monitor transport');
  assert.equal(evaluateConfiguration('https://other.example', 'monitor.example', lifecycleSecret, 'production'), false,
    'production configuration must reject an expected-host mismatch');
  assert.equal(evaluateConfiguration('https://monitor.example', '', lifecycleSecret, 'production'), false,
    'production configuration must fail closed when the normalized monitor host pin is absent');
  assert.equal(evaluateConfiguration('https://monitor.example', 'MONITOR.EXAMPLE.', lifecycleSecret, 'production'), true,
    'production host pins must normalize case and one trailing DNS dot');
  assert.equal(evaluateConfiguration('https://monitor.example', 'monitor.example', lifecycleSecret, 'production'), true,
    'production configuration accepts HTTPS with a strong secret and matching pinned host');
  const monitorRequestSource = source.slice(source.indexOf('async function kugelMonitorRequest('),
    source.indexOf('function serializeKugelMonitorMutation('));
  assert.match(monitorRequestSource, /redirect:\s*'error'/,
    'signed monitor fetches must reject redirects rather than forwarding lifecycle credentials');
  assert.match(monitorRequestSource, /monitorStatus\s*=\s*response\.status/,
    'Monitor failures must preserve the safe upstream HTTP status for internal recovery');
  assert.match(monitorRequestSource, /monitorCode\s*=\s*safeMonitorErrorCode/,
    'Monitor failures must preserve a bounded error code for internal recovery');
  assert.match(monitorRequestSource, /monitorRetryable\s*=/,
    'Monitor failures must preserve explicit retryability for internal recovery');
  const deadlineSource = source.slice(source.indexOf('const KUGEL_ACTION_WINDOW_MS'),
    source.indexOf('const kugelActionWindows'));
  const evaluateDeadlines = new Function('process', `${deadlineSource}; return {
    overhead: KUGEL_MONITOR_TIMEOUT_OVERHEAD_MS,
    openMax: KUGEL_MONITOR_PROVIDER_OPEN_MAX_MS, open: KUGEL_WORLD_OPEN_TIMEOUT_MS,
    closeMax: KUGEL_MONITOR_PROVIDER_CLOSE_MAX_MS, close: KUGEL_WORLD_CLOSE_TIMEOUT_MS,
    liveMax: KUGEL_MONITOR_PROVIDER_LIVE_MAX_MS, live: KUGEL_LIVE_COMMAND_TIMEOUT_MS,
    stateMax: KUGEL_MONITOR_PROVIDER_STATE_MAX_MS, state: KUGEL_WORLD_STATE_TIMEOUT_MS,
  };`);
  const productionDeadlines = evaluateDeadlines({ env: { NODE_ENV: 'production' } });
  assert.ok(productionDeadlines.openMax >= 180_000,
    'Monitor open contract budget must be at least 180 seconds');
  assert.ok(productionDeadlines.closeMax >= 180_000,
    'Monitor close contract budget must be at least 180 seconds');
  assert.ok(productionDeadlines.open >= 180_000 + productionDeadlines.overhead,
    'open client deadline must preserve explicit overhead beyond the 180-second Monitor contract');
  assert.ok(productionDeadlines.close >= 180_000 + productionDeadlines.overhead,
    'close client deadline must preserve explicit overhead beyond the 180-second Monitor contract');
  for (const operation of ['open', 'close', 'live', 'state']) {
    assert.ok(productionDeadlines[operation] > productionDeadlines[`${operation}Max`],
      `${operation} client deadline must exceed the Monitor provider maximum plus transport overhead`);
  }
  const deterministicDeadlines = evaluateDeadlines({ env: {
    NODE_ENV: 'test', KUGEL_TEST_WORLD_OPEN_TIMEOUT_MS: '75', KUGEL_TEST_WORLD_CLOSE_TIMEOUT_MS: '76',
    KUGEL_TEST_LIVE_COMMAND_TIMEOUT_MS: '77', KUGEL_TEST_WORLD_STATE_TIMEOUT_MS: '78',
  } });
  assert.deepEqual(
    [deterministicDeadlines.open, deterministicDeadlines.close, deterministicDeadlines.live, deterministicDeadlines.state],
    [75, 76, 77, 78],
    'tests may override operation deadlines deterministically without weakening production budgets',
  );
  console.log('✓ secure classroom identities scope Agent Academy lesson zero and Minecraft controls');
} finally {
  if (child.exitCode === null && child.signalCode === null) {
    child.kill('SIGTERM');
    await new Promise((resolve) => child.once('exit', resolve));
  }
  if (restartedChild && restartedChild.exitCode === null && restartedChild.signalCode === null) {
    restartedChild.kill('SIGTERM');
    await new Promise((resolve) => restartedChild.once('exit', resolve));
  }
  await new Promise((resolve) => monitor.close(resolve));
  rmSync(tempDir, { recursive: true, force: true });
}
