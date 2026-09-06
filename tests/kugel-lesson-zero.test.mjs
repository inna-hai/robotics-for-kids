import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
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

let gameEvents = [];
let worldOpenDelayMs = 0;
let worldOpenFailuresRemaining = 0;
let freezeDelayMs = 0;
let freezeFailuresRemaining = 0;
const monitorCalls = [];
const monitor = createServer(async (req, res) => {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  const body = raw ? JSON.parse(raw) : {};
  monitorCalls.push({ method: req.method, url: req.url, authorization: req.headers.authorization || '', body });
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'GET' && req.url.startsWith('/api/game-events')) {
    res.end(JSON.stringify({ events: gameEvents }));
    return;
  }
  if (req.headers.authorization !== 'Bearer test-monitor-token') {
    res.statusCode = 401;
    res.end(JSON.stringify({ error: 'unauthorized' }));
    return;
  }
  if (req.url === '/api/internal/craftom-school/world/open' && worldOpenDelayMs) {
    await new Promise((resolve) => setTimeout(resolve, worldOpenDelayMs));
  }
  if (req.url === '/api/internal/craftom-school/world/open' && worldOpenFailuresRemaining > 0) {
    worldOpenFailuresRemaining -= 1;
    res.statusCode = 503;
    res.end(JSON.stringify({ error: 'ambiguous_open_failure' }));
    return;
  }
  if (req.url === '/api/internal/craftom-school/live/freeze') {
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
const child = spawn(process.execPath, ['server.js'], {
  cwd: root,
  env: {
    ...process.env,
    PORT: String(appPort),
    ROBOTICS_DB_FILE: dbFile,
    ROBOTICS_SUBSCRIPTION_GATE: '1',
    ROBOTICS_TEACHER_INVITE_CODE: 'kugel-test-invite',
    ROBOTICS_CLASSROOM_ADMIN_CODE: 'kugel-test-admin',
    KUGEL_MONITOR_API_URL: `http://127.0.0.1:${monitorPort}`,
    KUGEL_MONITOR_SERVER_NAME: 'test-kugel-monitor',
    KUGEL_MINECRAFT_INTERNAL_TOKEN: 'test-monitor-token',
    KUGEL_MINECRAFT_SERVER_NAME: 'Test Minecraft',
    KUGEL_MINECRAFT_SERVER_HOST: '127.0.0.1',
    KUGEL_MINECRAFT_SERVER_PORT: '19132',
    KUGEL_MINECRAFT_SERVER_ID: 'test-server-id',
    KUGEL_MINECRAFT_ACCESS_CODE: 'test-access-code',
    NODE_ENV: 'test',
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let serverOutput = '';
child.stdout.on('data', chunk => { serverOutput += chunk.toString(); });
child.stderr.on('data', chunk => { serverOutput += chunk.toString(); });

try {
  await waitForServer(baseUrl);

  const registerA = await post(baseUrl, '/api/classroom/teacher-register', {
    name: 'מורת קוגל א', email: 'kugel-a@example.test', password: 'SafePass123!', inviteCode: 'kugel-test-invite',
  });
  assert.equal(registerA.status, 201);
  const teacherA = (await registerA.json()).teacher;
  const teacherACookie = cookie(registerA);

  const registerB = await post(baseUrl, '/api/classroom/teacher-register', {
    name: 'מורת קוגל ב', email: 'kugel-b@example.test', password: 'SafePass123!', inviteCode: 'kugel-test-invite',
  });
  assert.equal(registerB.status, 201);
  const teacherB = (await registerB.json()).teacher;
  const teacherBCookie = cookie(registerB);

  const adminLogin = await post(baseUrl, '/api/classroom/admin-login', { code: 'kugel-test-admin' });
  assert.equal(adminLogin.status, 200);
  const adminCookie = cookie(adminLogin);
  for (const teacher of [teacherA, teacherB]) {
    const assignment = await post(baseUrl, `/api/classroom/admin/teachers/${teacher.id}/courses`, { courses: ['sisi', 'craftom-agent'] }, adminCookie);
    assert.equal(assignment.status, 200);
  }

  const createA = await post(baseUrl, '/api/classroom/classes', { name: 'כיתת קוגל א', courses: ['craftom-agent'] }, teacherACookie);
  assert.equal(createA.status, 201);
  const classroomA = (await createA.json()).classroom;
  const createB = await post(baseUrl, '/api/classroom/classes', { name: 'כיתת קוגל ב', courses: ['craftom-agent'] }, teacherBCookie);
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
  const studentACookie = cookie(loginA);
  const loginB = await post(baseUrl, '/api/classroom/student-login', { classCode: classroomB.joinCode, personalCode: studentB.loginCode });
  assert.equal(loginB.status, 200);
  const studentBCookie = cookie(loginB);

  const unauthenticated = await fetch(`${baseUrl}/api/kugel/session?classroomId=${classroomA.id}`);
  assert.equal(unauthenticated.status, 401, 'Kugel session data must require a classroom identity');

  const crossTenant = await fetch(`${baseUrl}/api/kugel/session?classroomId=${classroomA.id}`, { headers: { Cookie: teacherBCookie } });
  assert.equal(crossTenant.status, 404, 'a teacher must not read another teacher classroom');

  const nonKugel = await fetch(`${baseUrl}/api/kugel/session?classroomId=${nonKugelClassroom.id}`, { headers: { Cookie: teacherACookie } });
  assert.equal(nonKugel.status, 403, 'Kugel lesson zero requires the course on the class');

  const studentTeacherAction = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/launch`, {}, studentACookie);
  assert.equal(studentTeacherAction.status, 401, 'a student cannot invoke teacher controls');

  const crossTenantLink = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/students/${studentA.id}/minecraft`, { playerName: 'NoaSecure' }, teacherBCookie);
  assert.equal(crossTenantLink.status, 404);
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

  const launch = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/launch`, {}, teacherACookie);
  assert.equal(launch.status, 200);
  const launchBody = await launch.json();
  assert.equal(launchBody.lesson.id, 0);
  assert.equal(launchBody.session.classroomId, classroomA.id);
  assert.equal(monitorCalls.some(call => call.url === '/api/internal/craftom-school/world/open' && call.authorization === 'Bearer test-monitor-token'), true);
  const duplicateLaunch = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/launch`, {}, teacherACookie);
  assert.equal(duplicateLaunch.status, 409, 'the same class cannot start a second active lease');
  const conflictingLaunch = await post(baseUrl, `/api/kugel/classes/${classroomB.id}/launch`, {}, teacherBCookie);
  assert.equal(conflictingLaunch.status, 409, 'one Minecraft server must not be controlled by two classrooms at once');
  const foreignPlayerMessage = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/message`, { text: 'אסור', scope: 'player', target: 'OtherSecure' }, teacherACookie);
  assert.equal(foreignPlayerMessage.status, 404, 'a teacher must not control a Minecraft player from another class');

  const studentStart = await post(baseUrl, '/api/kugel/student/start', {}, studentACookie);
  assert.equal(studentStart.status, 200);
  const studentStartBody = await studentStart.json();
  assert.equal(studentStartBody.student.id, studentA.id);
  assert.equal(studentStartBody.student.minecraftPlayerName, 'NoaSecure');
  assert.ok(studentStartBody.minecraft.launchUrl.startsWith('minecraftedu://'));

  gameEvents = [
    { id: 40, event_type: 'chat_message', player_name: 'NoaSecure', created_at: new Date().toISOString(), payload: JSON.stringify({ coin_index: 1, coins: 8, finish: true, completed: true }) },
  ];
  const forgedPayloadFinish = await post(baseUrl, '/api/kugel/student/finish', {}, studentACookie);
  assert.equal(forgedPayloadFinish.status, 409, 'unrelated events with forged progress fields must not complete the lesson');

  const otherStudentStart = await post(baseUrl, '/api/kugel/student/start', {}, studentBCookie);
  assert.equal(otherStudentStart.status, 409, 'a student cannot join a class whose teacher has not launched lesson zero');

  const now = new Date().toISOString();
  gameEvents = [
    { id: 1, event_type: 'player_join', player_name: 'NoaSecure', created_at: now, payload: '{}' },
    ...Array.from({ length: 8 }, (_, index) => ({ id: index + 2, event_type: 'coin_collected', player_name: 'NoaSecure', created_at: now, block_id: 'gold_block', payload: JSON.stringify({ coin_index: 1 }) })),
    { id: 10, event_type: 'finish_button_pressed', player_name: 'NoaSecure', created_at: now, payload: JSON.stringify({ completed: true }) },
  ];
  const duplicateCoinsFinish = await post(baseUrl, '/api/kugel/student/finish', {}, studentACookie);
  assert.equal(duplicateCoinsFinish.status, 409, 'repeated reports for one coin must not complete lesson zero');

  const earlyFinishAt = new Date(Date.now() - 100).toISOString();
  const laterCoinAt = new Date().toISOString();
  gameEvents = [
    { id: 50, event_type: 'finish_button_pressed', player_name: 'NoaSecure', created_at: earlyFinishAt, payload: JSON.stringify({ completed: true }) },
    ...Array.from({ length: 8 }, (_, index) => ({ id: 60 + index, event_type: 'coin_collected', player_name: 'NoaSecure', created_at: laterCoinAt, payload: JSON.stringify({ coin_index: index + 1 }) })),
  ];
  const finishBeforeCoins = await post(baseUrl, '/api/kugel/student/finish', {}, studentACookie);
  assert.equal(finishBeforeCoins.status, 409, 'the finish button must be pressed after the eighth distinct coin');

  gameEvents = [
    { id: 11, event_type: 'player_join', player_name: 'NoaSecure', created_at: now, payload: '{}' },
    ...Array.from({ length: 8 }, (_, index) => ({ id: index + 12, event_type: 'coin_collected', player_name: 'NoaSecure', created_at: now, block_id: 'gold_block', payload: JSON.stringify({ coin_index: index + 1 }) })),
    { id: 20, event_type: 'finish_button_pressed', player_name: 'NoaSecure', created_at: now, payload: JSON.stringify({ completed: true }) },
  ];

  const monitorReadsBeforeViews = monitorCalls.filter(call => call.method === 'GET' && call.url.startsWith('/api/game-events')).length;
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
  assert.equal('students' in studentViewBody, false, 'students receive only their own Kugel state');
  assert.equal(JSON.stringify(studentViewBody).includes(studentB.id), false);
  assert.equal(studentViewBody.student.completionRecorded, false, 'verified game events alone must not unlock lesson 1 before progress is persisted');
  const monitorReadsAfterViews = monitorCalls.filter(call => call.method === 'GET' && call.url.startsWith('/api/game-events')).length;
  assert.equal(monitorReadsAfterViews - monitorReadsBeforeViews, 1, 'teacher and student polling must share a short monitor-event cache');

  const finish = await post(baseUrl, '/api/kugel/student/finish', {}, studentACookie);
  assert.equal(finish.status, 200);
  assert.equal((await finish.json()).progress.status, 'completed');
  const finishAgain = await post(baseUrl, '/api/kugel/student/finish', {}, studentACookie);
  assert.equal(finishAgain.status, 200);
  assert.equal((await finishAgain.json()).progress.attempts, 1, 'repeating finish must be idempotent');
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
  assert.equal(monitorCalls.some(call => call.url === '/api/internal/craftom-school/live/message'), true);
  assert.equal(monitorCalls.some(call => call.url === '/api/internal/craftom-school/live/freeze'), true);
  for (let index = 1; index < 28; index += 1) {
    const repeatedMessage = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/message`, { text: `בדיקה ${index}`, scope: 'all' }, teacherACookie);
    assert.equal(repeatedMessage.status, 200);
  }
  const rateLimitedMessage = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/message`, { text: 'יותר מדי', scope: 'all' }, teacherACookie);
  assert.equal(rateLimitedMessage.status, 429, 'Minecraft control endpoints must be rate limited per teacher and class');
  const reset = await post(baseUrl, '/api/kugel/student/reset', {}, studentACookie);
  assert.equal(reset.status, 200);
  const afterReset = await fetch(`${baseUrl}/api/kugel/session`, { headers: { Cookie: studentACookie } });
  assert.equal(afterReset.status, 200);
  assert.equal((await afterReset.json()).student.coins, 0, 'events before reset must not count again');

  const tamperDb = new Database(dbFile);
  tamperDb.prepare('DELETE FROM teacher_courses WHERE teacher_id = ? AND course_id = ?').run(teacherA.id, 'craftom-agent');
  tamperDb.close();
  const inconsistentEntitlement = await fetch(`${baseUrl}/api/kugel/session`, { headers: { Cookie: studentACookie } });
  assert.equal(inconsistentEntitlement.status, 403, 'student access must fail closed if teacher entitlement is missing');
  const restoreTeacherBeforeStop = await post(baseUrl, `/api/classroom/admin/teachers/${teacherA.id}/courses`, { courses: ['sisi', 'craftom-agent'] }, adminCookie);
  assert.equal(restoreTeacherBeforeStop.status, 200);

  const stop = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/stop`, {}, teacherACookie);
  const stopBody = await stop.json();
  assert.equal(stop.status, 200, `${JSON.stringify(stopBody)}\n${serverOutput}`);
  const launchOtherAfterStop = await post(baseUrl, `/api/kugel/classes/${classroomB.id}/launch`, {}, teacherBCookie);
  assert.equal(launchOtherAfterStop.status, 200, 'another class may launch only after the active class releases the server');
  gameEvents = [{ id: 999, event_type: 'coin_collected', player_name: 'NoaSecure', created_at: new Date().toISOString(), payload: JSON.stringify({ coin_index: 1 }) }];
  const stoppedClassView = await fetch(`${baseUrl}/api/kugel/session?classroomId=${classroomA.id}`, { headers: { Cookie: teacherACookie } });
  const stoppedClassBody = await stoppedClassView.json();
  assert.equal(stoppedClassBody.minecraft, null, 'inactive classes must not receive current server connection credentials');
  assert.equal(stoppedClassBody.students.find(item => item.id === studentA.id).coins, 0, 'inactive classes must not poll events from the class that now owns the server');

  const stopOther = await post(baseUrl, `/api/kugel/classes/${classroomB.id}/stop`, {}, teacherBCookie);
  assert.equal(stopOther.status, 200);

  worldOpenFailuresRemaining = 1;
  freezeFailuresRemaining = 1;
  const ambiguousLaunch = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/launch`, {}, teacherACookie);
  assert.equal(ambiguousLaunch.status, 502, 'an ambiguous open failure must report unavailable cleanup');
  const blockedAfterAmbiguousOpen = await post(baseUrl, `/api/kugel/classes/${classroomB.id}/launch`, {}, teacherBCookie);
  assert.equal(blockedAfterAmbiguousOpen.status, 409, 'an ambiguous open plus failed freeze must retain the lease');
  const retryAmbiguousCleanup = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/stop`, {}, teacherACookie);
  assert.equal(retryAmbiguousCleanup.status, 200, 'ambiguous open cleanup must be retriable');
  const launchAfterAmbiguousCleanup = await post(baseUrl, `/api/kugel/classes/${classroomB.id}/launch`, {}, teacherBCookie);
  assert.equal(launchAfterAmbiguousCleanup.status, 200);
  assert.equal((await post(baseUrl, `/api/kugel/classes/${classroomB.id}/stop`, {}, teacherBCookie)).status, 200);

  worldOpenDelayMs = 120;
  freezeDelayMs = 120;
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
  freezeDelayMs = 0;
  const afterStaleLaunch = await fetch(`${baseUrl}/api/kugel/session?classroomId=${classroomA.id}`, { headers: { Cookie: teacherACookie } });
  assert.equal((await afterStaleLaunch.json()).session.active, false);

  const relaunchForFailedStop = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/launch`, {}, teacherACookie);
  assert.equal(relaunchForFailedStop.status, 200);
  freezeFailuresRemaining = 1;
  const failedStop = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/stop`, {}, teacherACookie);
  assert.equal(failedStop.status, 502, 'a failed external freeze must keep a retriable lease');
  const blockedAfterFailedStop = await post(baseUrl, `/api/kugel/classes/${classroomB.id}/launch`, {}, teacherBCookie);
  assert.equal(blockedAfterFailedStop.status, 409, 'another class must remain blocked while cleanup needs retry');
  const retryStop = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/stop`, {}, teacherACookie);
  assert.equal(retryStop.status, 200, 'the same teacher must be able to retry failed cleanup');
  const relaunchBeforeRevoke = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/launch`, {}, teacherACookie);
  assert.equal(relaunchBeforeRevoke.status, 200);
  const freezesBeforeRevoke = monitorCalls.filter(call => call.url === '/api/internal/craftom-school/live/freeze').length;
  freezeDelayMs = 120;
  const revokeKugelPromise = post(baseUrl, `/api/classroom/admin/teachers/${teacherA.id}/courses`, { courses: ['sisi'] }, adminCookie);
  await new Promise((resolve) => setTimeout(resolve, 30));
  const launchDuringRevoke = await post(baseUrl, `/api/kugel/classes/${classroomB.id}/launch`, {}, teacherBCookie);
  assert.equal(launchDuringRevoke.status, 409, 'a class must not acquire the lease while revocation cleanup is running');
  const revokeKugel = await revokeKugelPromise;
  assert.equal(revokeKugel.status, 200);
  const freezesAfterRevoke = monitorCalls.filter(call => call.url === '/api/internal/craftom-school/live/freeze').length;
  assert.equal(freezesAfterRevoke, freezesBeforeRevoke + 1, 'entitlement revocation must freeze the externally running world');
  freezeDelayMs = 0;
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
  freezeDelayMs = 120;
  const classRevokePromise = post(baseUrl, `/api/classroom/classes/${classroomA.id}/courses`, { courses: ['sisi'] }, teacherACookie);
  await new Promise((resolve) => setTimeout(resolve, 30));
  const launchDuringClassRevoke = await post(baseUrl, `/api/kugel/classes/${classroomB.id}/launch`, {}, teacherBCookie);
  assert.equal(launchDuringClassRevoke.status, 409, 'class-course revocation must retain the lease until freeze completes');
  const classRevoke = await classRevokePromise;
  assert.equal(classRevoke.status, 200);
  freezeDelayMs = 0;
  const launchAfterClassRevoke = await post(baseUrl, `/api/kugel/classes/${classroomB.id}/launch`, {}, teacherBCookie);
  assert.equal(launchAfterClassRevoke.status, 200);
  assert.equal((await post(baseUrl, `/api/kugel/classes/${classroomB.id}/stop`, {}, teacherBCookie)).status, 200);
  const restoreClassAgain = await post(baseUrl, `/api/classroom/classes/${classroomA.id}/courses`, { courses: ['craftom-agent'] }, teacherACookie);
  assert.equal(restoreClassAgain.status, 200);
  const restoredView = await fetch(`${baseUrl}/api/kugel/session?classroomId=${classroomA.id}`, { headers: { Cookie: teacherACookie } });
  assert.equal(restoredView.status, 200);
  assert.equal((await restoredView.json()).session.active, false, 'revocation must destroy the old live Minecraft session');

  assert.doesNotMatch(source, /KUGEL_MINECRAFT_ACCESS_CODE\s*=.*\|\|\s*'[^']+'/,
    'Minecraft access codes must not have repository defaults');
  assert.doesNotMatch(source, /KUGEL_MINECRAFT_SERVER_HOST\s*=.*\|\|\s*'[^']+'/,
    'Minecraft hosts must not have repository defaults');
  console.log('✓ secure classroom identities scope Kugel lesson zero and Minecraft controls');
} finally {
  if (child.exitCode === null && child.signalCode === null) {
    child.kill('SIGTERM');
    await new Promise((resolve) => child.once('exit', resolve));
  }
  await new Promise((resolve) => monitor.close(resolve));
  rmSync(tempDir, { recursive: true, force: true });
}
