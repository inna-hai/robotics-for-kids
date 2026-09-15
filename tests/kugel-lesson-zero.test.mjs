import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
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

async function internalGet(baseUrl, path) {
  return fetch(`${baseUrl}${path}`, {
    headers: { Authorization: 'Bearer test-monitor-token' },
  });
}

async function internalPost(baseUrl, path, payload) {
  return fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test-monitor-token' },
    body: JSON.stringify(payload),
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
  if (req.url === '/api/internal/craftom-school/world/close') {
    if (freezeDelayMs) await new Promise((resolve) => setTimeout(resolve, freezeDelayMs));
    if (freezeFailuresRemaining > 0) {
      freezeFailuresRemaining -= 1;
      res.statusCode = 503;
      res.end(JSON.stringify({ error: 'temporary_close_failure' }));
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
  const teacherALicense = await post(baseUrl, `/api/classroom/admin/teachers/${teacherA.id}/minecraft-license`, {
    playerName: 'TeacherSecureA',
    eduUpn: 'teacher-secure-a@hai.tech',
    status: 'approved',
  }, adminCookie);
  assert.equal(teacherALicense.status, 200);
  const teacherBLicense = await post(baseUrl, `/api/classroom/admin/teachers/${teacherB.id}/minecraft-license`, {
    playerName: 'TeacherSecureB',
    eduUpn: 'teacher-secure-b@hai.tech',
    status: 'approved',
  }, adminCookie);
  assert.equal(teacherBLicense.status, 200);

  const createA = await post(baseUrl, '/api/classroom/classes', { name: 'כיתת קוגל א', courses: ['craftom-agent'] }, teacherACookie);
  assert.equal(createA.status, 201);
  const classroomA = (await createA.json()).classroom;
  const createB = await post(baseUrl, '/api/classroom/classes', { name: 'כיתת קוגל ב', courses: ['craftom-agent'] }, teacherBCookie);
  assert.equal(createB.status, 201);
  const classroomB = (await createB.json()).classroom;
  const createNonKugel = await post(baseUrl, '/api/classroom/classes', { name: 'כיתת סיסי', courses: ['sisi'] }, teacherACookie);
  assert.equal(createNonKugel.status, 201);
  const nonKugelClassroom = (await createNonKugel.json()).classroom;

  const addA = await post(baseUrl, `/api/classroom/classes/${classroomA.id}/students`, { name: 'נועה מאובטחת', playerName: 'NoaSecure1', eduUpn: 'noa-secure-1@hai.tech' }, teacherACookie);
  assert.equal(addA.status, 201);
  const studentA = (await addA.json()).student;
  const addASecond = await post(baseUrl, `/api/classroom/classes/${classroomA.id}/students`, { name: 'תלמיד נוסף', playerName: 'NoaSecure2', eduUpn: 'noa-secure-2@hai.tech' }, teacherACookie);
  assert.equal(addASecond.status, 201);
  const studentASecond = (await addASecond.json()).student;
  const addB = await post(baseUrl, `/api/classroom/classes/${classroomB.id}/students`, { name: 'תלמיד כיתה אחרת', playerName: 'OtherClass1', eduUpn: 'other-class-1@hai.tech' }, teacherBCookie);
  assert.equal(addB.status, 201);
  const studentB = (await addB.json()).student;

  const loginA = await post(baseUrl, '/api/classroom/student-login', { classCode: classroomA.joinCode, personalCode: studentA.loginCode });
  assert.equal(loginA.status, 200);
  const studentACookie = cookie(loginA);
  const loginASecond = await post(baseUrl, '/api/classroom/student-login', { classCode: classroomA.joinCode, personalCode: studentASecond.loginCode });
  assert.equal(loginASecond.status, 200);
  const submissionStudentCookie = cookie(loginASecond);
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
  const lessonOneTeacherView = await fetch(`${baseUrl}/api/kugel/session?classroomId=${classroomA.id}&lessonId=1`, { headers: { Cookie: teacherACookie } });
  assert.equal(lessonOneTeacherView.status, 200);
  const lessonOneTeacherViewBody = await lessonOneTeacherView.json();
  assert.equal(lessonOneTeacherViewBody.trackedLessonId, 1);
  const lessonOneStudent = lessonOneTeacherViewBody.students.find(item => item.id === studentASecond.id);
  assert.equal(lessonOneStudent.submission.lessonId, 1, 'teacher tracking must use the explicitly selected lesson rather than the active Minecraft lesson');
  assert.equal(lessonOneTeacherViewBody.metrics.active, 0, 'historical lesson metrics must not count a run from another lesson');

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

  const reportStartedAt = new Date(Date.now() - 957000).toISOString();
  const reportFinishedAt = new Date().toISOString();
  gameEvents = Array.from({ length: 8 }, (_, index) => ({
    id: 70 + index,
    event_type: 'coin_collected',
    player_name: 'NoaSecure',
    created_at: reportFinishedAt,
    payload: JSON.stringify({ coin_index: index + 1 }),
  }));
  const officialFinish = await fetch(`${baseUrl}/api/kugel/students/NoaSecure/finish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test-monitor-token' },
    body: JSON.stringify({
      report_data: {
        source: 'kugel_maze_static_finish',
        started_at_iso: reportStartedAt,
        completed_at_iso: reportFinishedAt,
        duration_seconds: 957,
        coins_collected: 8,
        total_coins: 8,
      },
    }),
  });
  assert.equal(officialFinish.status, 200, 'official Minecraft finish reports should complete even without a monitor finish event');
  const officialFinishBody = await officialFinish.json();
  assert.equal(officialFinishBody.student.completed, true);
  assert.equal(officialFinishBody.student.lastDurationMs, 957000);
  assert.equal(officialFinishBody.student.bestTimeMs, 957000);

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
  assert.ok(teacherStudentA.startedAt, 'Minecraft activity should mark the student as started even without a lomda start click');

  const studentView = await fetch(`${baseUrl}/api/kugel/session`, { headers: { Cookie: studentACookie } });
  assert.equal(studentView.status, 200);
  const studentViewBody = await studentView.json();
  assert.equal(studentViewBody.role, 'student');
  assert.equal(studentViewBody.student.id, studentA.id);
  assert.equal('students' in studentViewBody, false, 'students receive only their own Kugel state');
  assert.equal(JSON.stringify(studentViewBody).includes(studentB.id), false);
  assert.equal(studentViewBody.student.completionRecorded, true, 'official Minecraft finish reports should persist progress and unlock lesson 1');
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
  const messageActionResponse = await internalGet(baseUrl, '/api/internal/minecraft/actions/next');
  assert.equal(messageActionResponse.status, 200);
  const messageActionBody = await messageActionResponse.json();
  assert.equal(messageActionBody.action.type, 'teacher_message');
  assert.match(messageActionBody.action.payload.command, /^tellraw @a /);
  const messageActionStatus = await internalPost(baseUrl, `/api/internal/minecraft/actions/${messageActionBody.action.id}/status`, { status: 'completed', result: 'ok' });
  assert.equal(messageActionStatus.status, 200);
  const messageOverlayActionResponse = await internalGet(baseUrl, '/api/internal/minecraft/actions/next');
  assert.equal(messageOverlayActionResponse.status, 200);
  const messageOverlayActionBody = await messageOverlayActionResponse.json();
  assert.equal(messageOverlayActionBody.action.type, 'teacher_message_overlay');
  assert.match(messageOverlayActionBody.action.payload.command, /^title @a actionbar /);
  const messageOverlayActionStatus = await internalPost(baseUrl, `/api/internal/minecraft/actions/${messageOverlayActionBody.action.id}/status`, { status: 'completed', result: 'ok' });
  assert.equal(messageOverlayActionStatus.status, 200);
  const freeze = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/freeze`, { on: true, scope: 'all' }, teacherACookie);
  assert.equal(freeze.status, 200);
  const freezeActionResponse = await internalGet(baseUrl, '/api/internal/minecraft/actions/next');
  assert.equal(freezeActionResponse.status, 200);
  const freezeActionBody = await freezeActionResponse.json();
  assert.equal(freezeActionBody.action.type, 'teacher_freeze');
  assert.match(freezeActionBody.action.payload.command, /^(effect|ability) "/);
  for (let index = 1; index < 28; index += 1) {
    const repeatedMessage = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/message`, { text: `בדיקה ${index}`, scope: 'all' }, teacherACookie);
    assert.equal(repeatedMessage.status, 200);
  }
  const rateLimitedMessage = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/message`, { text: 'יותר מדי', scope: 'all' }, teacherACookie);
  assert.equal(rateLimitedMessage.status, 429, 'Minecraft control endpoints must be rate limited per teacher and class');
  gameEvents = [
    { id: 400, event_type: 'player_join', player_name: 'NoaSecure', created_at: new Date(Date.now() + 1000).toISOString(), payload: '{}' },
    { id: 401, event_type: 'coin_collected', player_name: 'NoaSecure', created_at: new Date(Date.now() + 2000).toISOString(), payload: JSON.stringify({ coin_index: 1 }) },
  ];
  const reset = await post(baseUrl, '/api/kugel/student/reset', {}, studentACookie);
  assert.equal(reset.status, 200);
  const afterReset = await fetch(`${baseUrl}/api/kugel/session`, { headers: { Cookie: studentACookie } });
  assert.equal(afterReset.status, 200);
  const afterResetBody = await afterReset.json();
  assert.equal(afterResetBody.student.coins, 0, 'events before reset must not count again');
  assert.equal(afterResetBody.student.connected, true, 'resetting progress must not hide a still-connected player');

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
  assert.equal(failedStop.status, 502, 'a failed external close must keep a retriable lease');
  const blockedAfterFailedStop = await post(baseUrl, `/api/kugel/classes/${classroomB.id}/launch`, {}, teacherBCookie);
  assert.equal(blockedAfterFailedStop.status, 409, 'another class must remain blocked while cleanup needs retry');
  const retryStop = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/stop`, {}, teacherACookie);
  assert.equal(retryStop.status, 200, 'the same teacher must be able to retry failed cleanup');
  const relaunchBeforeRevoke = await post(baseUrl, `/api/kugel/classes/${classroomA.id}/launch`, {}, teacherACookie);
  assert.equal(relaunchBeforeRevoke.status, 200);
  const closesBeforeRevoke = monitorCalls.filter(call => call.url === '/api/internal/craftom-school/world/close').length;
  freezeDelayMs = 120;
  const revokeKugelPromise = post(baseUrl, `/api/classroom/admin/teachers/${teacherA.id}/courses`, { courses: ['sisi'] }, adminCookie);
  await new Promise((resolve) => setTimeout(resolve, 30));
  const launchDuringRevoke = await post(baseUrl, `/api/kugel/classes/${classroomB.id}/launch`, {}, teacherBCookie);
  assert.equal(launchDuringRevoke.status, 409, 'a class must not acquire the lease while revocation cleanup is running');
  const revokeKugel = await revokeKugelPromise;
  assert.equal(revokeKugel.status, 200);
  const closesAfterRevoke = monitorCalls.filter(call => call.url === '/api/internal/craftom-school/world/close').length;
  assert.equal(closesAfterRevoke, closesBeforeRevoke + 1, 'entitlement revocation must close the externally running world');
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
  assert.equal(launchDuringClassRevoke.status, 409, 'class-course revocation must retain the lease until close completes');
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
