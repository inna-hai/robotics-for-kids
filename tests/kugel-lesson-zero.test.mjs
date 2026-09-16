import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
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
let worldOpenDelayMs = 0;
let worldOpenFailuresRemaining = 0;
let freezeDelayMs = 0;
let freezeFailuresRemaining = 0;
let freezeStartedResolve = null;
let freezeGate = null;
const monitorCalls = [];
const monitor = createServer(async (req, res) => {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  const body = raw ? JSON.parse(raw) : {};
  monitorCalls.push({ method: req.method, url: req.url, authorization: req.headers.authorization || '', body });
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'GET' && req.url.startsWith('/api/game-events')) {
    if (gameEventsStartedResolve) { gameEventsStartedResolve(); gameEventsStartedResolve = null; }
    if (gameEventsDelayMs) await new Promise((resolve) => setTimeout(resolve, gameEventsDelayMs));
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
const child = spawn(process.execPath, ['server.js'], {
  cwd: root,
  env: {
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
    return { teacher: redemptionBody.teacher, cookie: cookie(login) };
  }
  const registeredA = await inviteTeacher('מורת קוגל א', 'kugel-a@example.test');
  const teacherA = registeredA.teacher;
  const teacherACookie = registeredA.cookie;
  const registeredB = await inviteTeacher('מורת קוגל ב', 'kugel-b@example.test');
  const teacherB = registeredB.teacher;
  const teacherBCookie = registeredB.cookie;
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
  let studentACookie = cookie(loginA);
  const loginASecond = await post(baseUrl, '/api/classroom/student-login', { classCode: classroomA.joinCode, personalCode: studentASecond.loginCode });
  assert.equal(loginASecond.status, 200);
  let submissionStudentCookie = cookie(loginASecond);
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
  assert.equal(monitorCalls.some(call => call.url === '/api/internal/craftom-school/world/open' && call.authorization === 'Bearer test-monitor-token'), true);
  const duplicateLaunch = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/launch`, {}, teacherACookie);
  assert.equal(duplicateLaunch.status, 200, 'the same class can restart its own active lesson zero');
  const lessonOneLaunch = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/lessons/1/launch`, {}, teacherACookie);
  assert.equal(lessonOneLaunch.status, 200, 'the same class can launch lesson one from the teacher board');
  const lessonOneLaunchBody = await lessonOneLaunch.json();
  assert.equal(lessonOneLaunchBody.lesson.id, 1);
  assert.equal(lessonOneLaunchBody.session.lessonId, 1);
  assert.equal(monitorCalls.some(call => call.url === '/api/internal/craftom-school/world/open' && call.body.world === 'kugel-50-safe-compounds-v3-20260824'), true);
  const lessonTwoLaunch = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/lessons/2/launch`, {}, teacherACookie);
  assert.equal(lessonTwoLaunch.status, 200, 'the same class can launch lesson two with the shared Agent Academy world');
  const lessonTwoLaunchBody = await lessonTwoLaunch.json();
  assert.equal(lessonTwoLaunchBody.lesson.id, 2);
  assert.equal(lessonTwoLaunchBody.session.lessonId, 2);
  const conflictingLaunch = await post(baseUrl, `/api/kugel/classes/${classroomB.id}/launch`, {}, teacherBCookie);
  assert.equal(conflictingLaunch.status, 409, 'one Minecraft server must not be controlled by two classrooms at once');
  const foreignPlayerMessage = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/message`, { text: 'אסור', scope: 'player', target: 'OtherSecure' }, teacherACookie);
  assert.equal(foreignPlayerMessage.status, 404, 'a teacher must not control a Minecraft player from another class');

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
  assert.equal(blockedBeforeLessonZero.status, 423, 'Craftom submissions beyond lesson zero require verified lesson-zero completion');

  const progressDb = new Database(dbFile);
  const completedAt = new Date().toISOString();
  progressDb.prepare(`
    INSERT INTO classroom_progress (
      id, student_id, course_id, lesson_id, activity_id, status, score, attempts,
      metadata_json, started_at, completed_at, updated_at
    ) VALUES (?, ?, 'craftom-agent', '0', 'minecraft-maze', 'completed', 100, 1, '{}', ?, ?, ?)
  `).run('test-lesson-zero-completion', studentASecond.id, completedAt, completedAt, completedAt);
  progressDb.close();

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

  gameEvents = [
    { id: 40, event_type: 'chat_message', player_name: 'NoaSecure', created_at: new Date().toISOString(), payload: JSON.stringify({ coin_index: 1, coins: 8, finish: true, completed: true }) },
  ];
  const forgedPayloadFinish = await post(baseUrl, '/api/kugel/student/finish', {}, studentACookie);
  assert.equal(forgedPayloadFinish.status, 409, 'unrelated events with forged progress fields must not complete the lesson');

  const otherStudentStart = await post(baseUrl, '/api/kugel/student/start', {}, studentBCookie);
  assert.equal(otherStudentStart.status, 409, 'a student cannot join a class whose teacher has not launched lesson zero');

  const now = new Date(Date.now() + 5000).toISOString();
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
  gameEvents = [
    { id: 200, event_type: 'player_join', player_name: 'NoaSecure', created_at: resetBody.student.resetAt, payload: '{}' },
    ...Array.from({ length: 8 }, (_, index) => ({ id: 201 + index, event_type: 'coin_collected', player_name: 'NoaSecure', created_at: slowerFinishAt, block_id: 'gold_block', payload: JSON.stringify({ coin_index: index + 1 }) })),
    { id: 210, event_type: 'finish_button_pressed', player_name: 'NoaSecure', created_at: slowerFinishAt, payload: JSON.stringify({ completed: true }) },
  ];
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
  gameEvents = [
    ...Array.from({ length: 8 }, (_, index) => ({ id: 301 + index, event_type: 'coin_collected', player_name: 'NoaSecure', created_at: lessonSwitchFinishAt, block_id: 'gold_block', payload: JSON.stringify({ coin_index: index + 1 }) })),
    { id: 310, event_type: 'finish_button_pressed', player_name: 'NoaSecure', created_at: lessonSwitchFinishAt, payload: JSON.stringify({ completed: true }) },
  ];
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
  gameEvents = [
    ...Array.from({ length: 8 }, (_, index) => ({ id: 401 + index, event_type: 'coin_collected', player_name: 'NoaSecure', created_at: archiveRaceFinishAt, block_id: 'gold_block', payload: JSON.stringify({ coin_index: index + 1 }) })),
    { id: 410, event_type: 'finish_button_pressed', player_name: 'NoaSecure', created_at: archiveRaceFinishAt, payload: JSON.stringify({ completed: true }) },
  ];
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
  gameEvents = [
    ...Array.from({ length: 8 }, (_, index) => ({ id: 421 + index, event_type: 'coin_collected', player_name: 'NoaSecure', created_at: relinkRaceFinishAt, block_id: 'gold_block', payload: JSON.stringify({ coin_index: index + 1 }) })),
    { id: 430, event_type: 'finish_button_pressed', player_name: 'NoaSecure', created_at: relinkRaceFinishAt, payload: JSON.stringify({ completed: true }) },
  ];
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
  for (const queuedAction of ['message', 'freeze']) {
    let releaseFreeze;
    freezeGate = new Promise(resolve => { releaseFreeze = resolve; });
    const freezeStarted = new Promise(resolve => { freezeStartedResolve = resolve; });
    const blocker = post(baseUrl, `/api/kugel/classes/${raceClass.id}/freeze`, { scope: 'all', target: '', on: true }, teacherACookie);
    await freezeStarted;
    const allCallsBefore = monitorCalls.filter(call => call.url === `/api/internal/craftom-school/live/${queuedAction}` && call.body.scope === 'all').length;
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
    const allCallsAfter = monitorCalls.filter(call => call.url === `/api/internal/craftom-school/live/${queuedAction}` && call.body.scope === 'all').length;
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
    const targetCallsBefore = monitorCalls.filter(call => call.url === `/api/internal/craftom-school/live/${queuedAction}` && call.body.scope === 'player').length;
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
    const targetCallsAfter = monitorCalls.filter(call => call.url === `/api/internal/craftom-school/live/${queuedAction}` && call.body.scope === 'player').length;
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
  assert.equal(rejectedTeacherEntitlementTicket.status, 409, `slow exit ticket must reject teacher entitlement revocation: ${rejectedTeacherEntitlementTicket.status} ${rejectedTeacherEntitlementTicket.body}`);
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

  const launchBeforeCompoundEntry = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/launch`, {}, teacherACookie);
  assert.equal(launchBeforeCompoundEntry.status, 200);
  const unauthorizedCompoundSync = await post(baseUrl, '/api/internal/minecraft/compound-assignments', {
    minecraft_username: 'NoaSecure',
    compound_id: 5,
  });
  assert.equal(unauthorizedCompoundSync.status, 401, 'compound assignment sync requires the Minecraft internal token');
  const compoundSync = await fetch(`${baseUrl}/api/internal/minecraft/compound-assignments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test-monitor-token' },
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
  console.log('✓ secure classroom identities scope Kugel lesson zero and Minecraft controls');
} finally {
  if (child.exitCode === null && child.signalCode === null) {
    child.kill('SIGTERM');
    await new Promise((resolve) => child.once('exit', resolve));
  }
  await new Promise((resolve) => monitor.close(resolve));
  rmSync(tempDir, { recursive: true, force: true });
}
