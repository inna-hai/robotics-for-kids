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
    '/api/internal/craftom-school/v2/live/freeze'].includes(req.url);
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
      ? ['generation', 'lease_id', 'owner_id', 'request_id', 'server', 'start_mode', 'world']
      : req.url.endsWith('/close')
        ? ['generation', 'lease_id', 'owner_id', 'request_id', 'server']
        : req.url.endsWith('/state')
          ? ['request_id', 'server']
          : req.url.endsWith('/events')
            ? ['generation', 'lease_id', 'owner_id', 'request_id', 'server', 'world']
          : req.url.endsWith('/message')
            ? ['generation', 'lease_id', 'owner_id', 'request_id', 'scope', 'server', 'target', 'text']
            : ['generation', 'lease_id', 'mode', 'on', 'owner_id', 'request_id', 'restore', 'scope', 'server', 'target'];
    assert.deepEqual(Object.keys(body).sort(), expectedKeys);
    if (!req.url.endsWith('/state')) {
      assert.equal(typeof body.lease_id, 'string');
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

  const launch = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/launch`, {}, teacherACookie);
  assert.equal(launch.status, 200);
  const launchBody = await launch.json();
  assert.equal(launchBody.lesson.id, 0);
  assert.equal(launchBody.session.classroomId, classroomA.id);
  const firstOpenCall = monitorCalls.find(call => call.url === '/api/internal/craftom-school/v2/world/open');
  assert.ok(firstOpenCall, 'launch must open the world through the monitor');
  assert.equal(firstOpenCall.body.owner_id, classroomA.id);
  const stableLeaseId = firstOpenCall.body.lease_id;
  const firstGeneration = firstOpenCall.body.generation;
  const duplicateLaunch = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/launch`, {}, teacherACookie);
  assert.equal(duplicateLaunch.status, 200, 'the same class can restart its own active lesson zero');
  const lessonOneLaunch = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/lessons/1/launch`, {}, teacherACookie);
  assert.equal(lessonOneLaunch.status, 200, 'the same class can launch lesson one from the teacher board');
  const lessonOneLaunchBody = await lessonOneLaunch.json();
  assert.equal(lessonOneLaunchBody.lesson.id, 1);
  assert.equal(lessonOneLaunchBody.session.lessonId, 1);
  assert.equal(monitorCalls.some(call => call.url === '/api/internal/craftom-school/v2/world/open' && call.body.world === 'kugel-50-safe-compounds-v3-20260824'), true);
  const latestSequentialOpen = monitorCalls.filter(call => call.url === '/api/internal/craftom-school/v2/world/open').at(-1);
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

  await new Promise(resolve => setTimeout(resolve, 1100));
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

  const malformedScope = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/message`, { text: 'טעות', scope: 'typo' }, teacherACookie);
  assert.equal(malformedScope.status, 400, 'unknown control scope must not become a class-wide action');
  const malformedFreeze = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/freeze`, { on: 'false', scope: 'all' }, teacherACookie);
  assert.equal(malformedFreeze.status, 400, 'freeze state must be an actual boolean');
  const message = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/message`, { text: 'כל הכבוד', scope: 'all' }, teacherACookie);
  assert.equal(message.status, 200);
  const freeze = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/freeze`, { on: true, scope: 'all' }, teacherACookie);
  assert.equal(freeze.status, 200);
  assert.equal(monitorCalls.some(call => call.url === '/api/internal/craftom-school/v2/live/message'), true);
  assert.equal(monitorCalls.some(call => call.url === '/api/internal/craftom-school/v2/live/freeze'), true);
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
  assert.equal(resetBody.student.lastDurationMs, finishBody.student.lastDurationMs, 'reset preserves the last completed duration');
  assert.equal(Date.parse(resetBody.student.resetAt) > Date.parse(finishBody.student.finishedAt), true,
    'reset boundary must be strictly later than a consumed completion event within the allowed clock skew');
  assert.equal(resetBody.student.startedAt, null, 'reset opens a fresh attempt boundary');
  assert.equal(resetBody.student.completed, false, 'reset clears current-attempt completion');
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
  const slowerFinishAt = new Date(slowerFinishAtMs).toISOString();
  gameEvents = forLease([
    { id: 200, event_type: 'player_join', player_name: 'NoaSecure', created_at: resetBody.student.resetAt, payload: '{}' },
    ...Array.from({ length: 8 }, (_, index) => ({ id: 201 + index, event_type: 'coin_collected', player_name: 'NoaSecure', created_at: slowerFinishAt, block_id: 'gold_block', payload: JSON.stringify({ coin_index: index + 1 }) })),
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
  assert.equal((await resetDuringFinish.json()).student.attemptCount, 1);
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
