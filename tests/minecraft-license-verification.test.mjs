import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:net';
import { spawn } from 'node:child_process';
import Database from 'better-sqlite3';
import { startFakeMinecraftIdentityVerifier } from './helpers/fake-minecraft-identity-verifier.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const tempDir = mkdtempSync(join(tmpdir(), 'minecraft-identity-verification-'));
const dbFile = join(tempDir, 'classroom.sqlite');
const verifierSecret = randomBytes(32).toString('hex');

function freePort() {
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.once('error', reject);
    probe.listen(0, '127.0.0.1', () => {
      const { port } = probe.address();
      probe.close(() => resolve(port));
    });
  });
}
async function waitForServer(baseUrl) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try { if ((await fetch(`${baseUrl}/index.html`)).ok) return; } catch {}
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error('classroom server did not start');
}
async function jsonRequest(baseUrl, path, { cookie = '', body } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...(cookie ? { Cookie: cookie } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let data = {};
  try { data = await response.json(); } catch {}
  return { response, data };
}
const cookieOf = (response) => (response.headers.get('set-cookie') || '').split(';')[0];

const verifier = await startFakeMinecraftIdentityVerifier({
  secret: verifierSecret,
  responses: new Map([
    ['student.one@hai.tech', {
      status: 200,
      body: {
        user: { id: 'graph-user-1', userPrincipalName: 'student.one@hai.tech', accountEnabled: true },
        minecraftEducationLicensed: true,
        source: 'microsoft-graph-via-monitor',
      },
    }],
    ['boundary.two@hai.tech', { status: 200, body: { user: { id: 'graph-boundary-two', userPrincipalName: 'boundary.two@hai.tech', accountEnabled: true }, minecraftEducationLicensed: true } }],
    ['boundary.seventeen@hai.tech', { status: 200, body: { user: { id: 'graph-boundary-seventeen', userPrincipalName: 'boundary.seventeen@hai.tech', accountEnabled: true }, minecraftEducationLicensed: true } }],
    ['boundary.thirtytwo@hai.tech', { status: 200, body: { user: { id: 'graph-boundary-thirtytwo', userPrincipalName: 'boundary.thirtytwo@hai.tech', accountEnabled: true }, minecraftEducationLicensed: true } }],
    ['disabled@hai.tech', {
      status: 200,
      body: {
        user: { id: 'graph-disabled', userPrincipalName: 'disabled@hai.tech', accountEnabled: false },
        minecraftEducationLicensed: true,
      },
    }],
    ['unlicensed@hai.tech', {
      status: 200,
      body: {
        user: { id: 'graph-unlicensed', userPrincipalName: 'unlicensed@hai.tech', accountEnabled: true },
        minecraftEducationLicensed: false,
      },
    }],
    ['missing@hai.tech', { status: 404, body: { code: 'user_not_found' } }],
    ['admin.linked@hai.tech', {
      status: 200,
      body: {
        user: { id: 'graph-admin-linked', userPrincipalName: 'admin.linked@hai.tech', accountEnabled: true },
        minecraftEducationLicensed: true,
      },
    }],
    ['legacy-collision@hai.tech', {
      status: 200,
      body: {
        user: { id: 'graph-legacy-collision', userPrincipalName: 'legacy-collision@hai.tech', accountEnabled: true },
        minecraftEducationLicensed: true,
      },
    }],
    ['slow@hai.tech', {
      status: 200, delayMs: 180,
      body: {
        user: { id: 'graph-slow', userPrincipalName: 'slow@hai.tech', accountEnabled: true },
        minecraftEducationLicensed: true,
      },
    }],
    ['fast@hai.tech', {
      status: 200, delayMs: 10,
      body: {
        user: { id: 'graph-fast', userPrincipalName: 'fast@hai.tech', accountEnabled: true },
        minecraftEducationLicensed: true,
      },
    }],
    ['throttled@hai.tech', { status: 429, body: { code: 'rate_limited', internal: 'must-not-leak' } }],
    ['failed@hai.tech', { status: 500, body: { code: 'upstream_failure', internal: 'must-not-leak' } }],
    ['invalid-json@hai.tech', { status: 200, rawBody: '{invalid' }],
    ['empty-body@hai.tech', { status: 200, rawBody: '' }],
    ['oversized@hai.tech', { status: 200, rawBody: 'x'.repeat(33 * 1024) }],
    ['malformed-shape@hai.tech', { status: 200, body: { user: { accountEnabled: true }, minecraftEducationLicensed: true } }],
    ['timeout@hai.tech', {
      status: 200, delayMs: 3400,
      body: {
        user: { id: 'graph-timeout', userPrincipalName: 'timeout@hai.tech', accountEnabled: true },
        minecraftEducationLicensed: true,
      },
    }],
  ]),
});
const port = await freePort();
const baseUrl = `http://127.0.0.1:${port}`;
const serverEnv = {
  ...process.env,
  PORT: String(port),
  ROBOTICS_DB_FILE: dbFile,
  ROBOTICS_CLASSROOM_ADMIN_EMAIL: 'owner@example.test',
  ROBOTICS_CLASSROOM_ADMIN_CODE: '',
  ROBOTICS_TEACHER_INVITE_CODE: '',
  ROBOTICS_MINECRAFT_IDENTITY_VERIFIER_URL: verifier.baseUrl,
  ROBOTICS_MINECRAFT_IDENTITY_VERIFIER_SECRET: verifierSecret,
  NODE_ENV: 'test',
};
const spawnServer = () => spawn(process.execPath, ['server.js'], {
  cwd: root,
  env: serverEnv,
  stdio: ['ignore', 'pipe', 'pipe'],
});
let child = spawnServer();

try {
  await waitForServer(baseUrl);
  const access = await jsonRequest(baseUrl, '/api/classroom/admin-access/request', { body: { email: 'owner@example.test' } });
  const adminLogin = await jsonRequest(baseUrl, '/api/classroom/admin-access/redeem', { body: { email: 'owner@example.test', code: access.data.testCode } });
  const adminCookie = cookieOf(adminLogin.response);
  const invitation = await jsonRequest(baseUrl, '/api/classroom/admin/invitations', {
    cookie: adminCookie, body: { name: 'Owner Teacher', email: 'owner.teacher@example.test' },
  });
  const redemption = await jsonRequest(baseUrl, '/api/classroom/teacher-invitations/redeem', {
    body: { email: 'owner.teacher@example.test', code: invitation.data.testCode },
  });
  const teacherLogin = await jsonRequest(baseUrl, '/api/classroom/teacher-login', {
    body: { email: 'owner.teacher@example.test', password: redemption.data.temporaryPassword },
  });
  const teacherCookie = cookieOf(teacherLogin.response);
  await jsonRequest(baseUrl, `/api/classroom/admin/teachers/${redemption.data.teacher.id}/courses`, {
    cookie: adminCookie, body: { courses: ['minecraft', 'craftom-agent', 'sensi-city'] },
  });
  const classroom = await jsonRequest(baseUrl, '/api/classroom/classes', {
    cookie: teacherCookie, body: { name: 'Minecraft Class', courses: ['craftom-agent'] },
  });
  const student = await jsonRequest(baseUrl, `/api/classroom/classes/${classroom.data.classroom.id}/students`, {
    cookie: teacherCookie, body: { name: 'Student One' },
  });

  const unverifiedLegacyLink = await jsonRequest(baseUrl,
    `/api/kugel/classes/${classroom.data.classroom.id}/students/${student.data.student.id}/minecraft`, {
      cookie: teacherCookie, body: { playerName: 'BypassPlayer' },
    });
  assert.equal(unverifiedLegacyLink.response.status, 409);

  const unverifiedStudent = await jsonRequest(baseUrl,
    `/api/classroom/classes/${classroom.data.classroom.id}/students`, {
      cookie: teacherCookie, body: { name: 'Unverified Student' },
    });
  const unverifiedLogin = await jsonRequest(baseUrl, '/api/classroom/student-login', {
    body: { classCode: classroom.data.classroom.joinCode, personalCode: unverifiedStudent.data.student.loginCode },
  });
  const unverifiedSession = await jsonRequest(baseUrl, '/api/kugel/session', {
    cookie: cookieOf(unverifiedLogin.response),
  });
  assert.equal(unverifiedSession.response.status, 409);

  const adminEntitlementRaceStudent = await jsonRequest(baseUrl,
    `/api/classroom/classes/${classroom.data.classroom.id}/students`, {
      cookie: teacherCookie, body: { name: 'Admin Entitlement Race' },
    });
  const adminEntitlementRace = jsonRequest(baseUrl,
    `/api/classroom/admin/students/${adminEntitlementRaceStudent.data.student.id}/minecraft/verify`, {
      cookie: adminCookie, body: { upn: 'slow@hai.tech', playerName: 'AdminRace' },
    });
  await new Promise((resolve) => setTimeout(resolve, 20));
  assert.equal((await jsonRequest(baseUrl, `/api/classroom/classes/${classroom.data.classroom.id}/courses`, {
    cookie: teacherCookie, body: { courses: ['sensi-city'] },
  })).response.status, 200);
  assert.equal((await adminEntitlementRace).response.status, 409);
  assert.equal((await jsonRequest(baseUrl, `/api/classroom/classes/${classroom.data.classroom.id}/courses`, {
    cookie: teacherCookie, body: { courses: ['craftom-agent'] },
  })).response.status, 200);

  const teacherEntitlementRaceStudent = await jsonRequest(baseUrl,
    `/api/classroom/classes/${classroom.data.classroom.id}/students`, {
      cookie: teacherCookie, body: { name: 'Teacher Entitlement Race' },
    });
  const teacherEntitlementRace = jsonRequest(baseUrl,
    `/api/classroom/classes/${classroom.data.classroom.id}/students/${teacherEntitlementRaceStudent.data.student.id}/minecraft/verify`, {
      cookie: teacherCookie, body: { upn: 'slow@hai.tech', playerName: 'TeacherRace' },
    });
  await new Promise((resolve) => setTimeout(resolve, 20));
  assert.equal((await jsonRequest(baseUrl, `/api/classroom/admin/teachers/${redemption.data.teacher.id}/courses`, {
    cookie: adminCookie, body: { courses: ['sensi-city'] },
  })).response.status, 200);
  assert.equal((await teacherEntitlementRace).response.status, 409);
  assert.equal((await jsonRequest(baseUrl, `/api/classroom/admin/teachers/${redemption.data.teacher.id}/courses`, {
    cookie: adminCookie, body: { courses: ['minecraft', 'craftom-agent', 'sensi-city'] },
  })).response.status, 200);
  assert.equal((await jsonRequest(baseUrl, `/api/classroom/classes/${classroom.data.classroom.id}/courses`, {
    cookie: teacherCookie, body: { courses: ['craftom-agent'] },
  })).response.status, 200);

  const secondInvitation = await jsonRequest(baseUrl, '/api/classroom/admin/invitations', {
    cookie: adminCookie, body: { name: 'Other Teacher', email: 'other.teacher@example.test' },
  });
  const secondRedemption = await jsonRequest(baseUrl, '/api/classroom/teacher-invitations/redeem', {
    body: { email: 'other.teacher@example.test', code: secondInvitation.data.testCode },
  });
  const secondLogin = await jsonRequest(baseUrl, '/api/classroom/teacher-login', {
    body: { email: 'other.teacher@example.test', password: secondRedemption.data.temporaryPassword },
  });
  const foreignCallsBefore = verifier.calls.length;
  const foreignVerification = await jsonRequest(baseUrl,
    `/api/classroom/classes/${classroom.data.classroom.id}/students/${student.data.student.id}/minecraft/verify`, {
      cookie: cookieOf(secondLogin.response), body: { upn: 'student.one@hai.tech', playerName: 'StudentOne' },
    });
  assert.equal(foreignVerification.response.status, 404);
  assert.equal(verifier.calls.length, foreignCallsBefore);

  for (const [upn, playerName] of [
    ['boundary.two@hai.tech', 'A2'],
    ['boundary.seventeen@hai.tech', 'A'.repeat(17)],
    ['boundary.thirtytwo@hai.tech', 'B'.repeat(32)],
  ]) {
    const boundary = await jsonRequest(baseUrl,
      `/api/classroom/classes/${classroom.data.classroom.id}/students/${student.data.student.id}/minecraft/verify`, {
        cookie: teacherCookie, body: { upn, playerName },
      });
    assert.equal(boundary.response.status, 200);
    assert.equal(boundary.data.minecraftIdentity.playerName, playerName);
  }

  const verified = await jsonRequest(baseUrl,
    `/api/classroom/classes/${classroom.data.classroom.id}/students/${student.data.student.id}/minecraft/verify`, {
      cookie: teacherCookie,
      body: { upn: 'student.one@hai.tech', playerName: 'StudentOne' },
    });
  assert.equal(verified.response.status, 200);
  assert.deepEqual(verified.data.minecraftIdentity, {
    upn: 'student.one@hai.tech',
    playerName: 'StudentOne',
    status: 'verified',
    graphObjectId: 'graph-user-1',
    source: 'microsoft-graph-via-monitor',
    verifiedAt: verified.data.minecraftIdentity.verifiedAt,
  });
  const studentOneCall = verifier.calls.find((call) => call.upn === 'student.one@hai.tech');
  assert.ok(studentOneCall);
  assert.equal(studentOneCall.method, 'POST');
  assert.equal(studentOneCall.pathname, '/api/minecraft-identities/verify-existing');
  assert.equal(studentOneCall.signed, true);

  const listed = await jsonRequest(baseUrl, '/api/classroom/classes', { cookie: teacherCookie });
  assert.deepEqual(listed.data.classes[0].students[0].minecraftIdentity, verified.data.minecraftIdentity);
  assert.equal(JSON.stringify(listed.data).includes(verifierSecret), false);

  const disabled = await jsonRequest(baseUrl,
    `/api/classroom/classes/${classroom.data.classroom.id}/students/${student.data.student.id}/minecraft/verify`, {
      cookie: teacherCookie,
      body: { upn: 'disabled@hai.tech', playerName: 'DisabledPlayer' },
    });
  assert.equal(disabled.response.status, 422);
  assert.match(disabled.data.error, /לא נמצא חשבון Microsoft פעיל/);

  for (const upn of ['unlicensed@hai.tech', 'missing@hai.tech']) {
    const rejected = await jsonRequest(baseUrl,
      `/api/classroom/classes/${classroom.data.classroom.id}/students/${student.data.student.id}/minecraft/verify`, {
        cookie: teacherCookie, body: { upn, playerName: 'RejectedPlayer' },
      });
    assert.equal(rejected.response.status, 422);
  }

  const adminVerified = await jsonRequest(baseUrl,
    `/api/classroom/admin/students/${student.data.student.id}/minecraft/verify`, {
      cookie: adminCookie,
      body: { upn: 'admin.linked@hai.tech', playerName: 'AdminLinked' },
    });
  assert.equal(adminVerified.response.status, 200);
  assert.equal(adminVerified.data.minecraftIdentity.graphObjectId, 'graph-admin-linked');

  const beforeInvalidDomainCalls = verifier.calls.length;
  const invalidDomain = await jsonRequest(baseUrl,
    `/api/classroom/admin/students/${student.data.student.id}/minecraft/verify`, {
      cookie: adminCookie, body: { upn: 'student@example.com', playerName: 'WrongDomain' },
    });
  assert.equal(invalidDomain.response.status, 400);
  assert.equal(verifier.calls.length, beforeInvalidDomainCalls);

  for (const [upn, expectedStatus] of [['throttled@hai.tech', 502], ['failed@hai.tech', 502]]) {
    const upstreamFailure = await jsonRequest(baseUrl,
      `/api/classroom/admin/students/${student.data.student.id}/minecraft/verify`, {
        cookie: adminCookie, body: { upn, playerName: 'FailurePlayer' },
      });
    assert.equal(upstreamFailure.response.status, expectedStatus);
    assert.equal(JSON.stringify(upstreamFailure.data).includes('must-not-leak'), false);
  }
  for (const upn of ['invalid-json@hai.tech', 'empty-body@hai.tech', 'oversized@hai.tech', 'malformed-shape@hai.tech']) {
    const invalidResponse = await jsonRequest(baseUrl,
      `/api/classroom/admin/students/${student.data.student.id}/minecraft/verify`, {
        cookie: adminCookie, body: { upn, playerName: 'MalformedPlayer' },
      });
    assert.equal(invalidResponse.response.status, 502);
    assert.deepEqual(invalidResponse.data, { error: 'אימות חשבון Minecraft נכשל.' });
  }
  const timeoutStarted = Date.now();
  const timeoutFailure = await jsonRequest(baseUrl,
    `/api/classroom/admin/students/${student.data.student.id}/minecraft/verify`, {
      cookie: adminCookie, body: { upn: 'timeout@hai.tech', playerName: 'TimeoutPlayer' },
    });
  assert.equal(timeoutFailure.response.status, 502);
  assert.ok(Date.now() - timeoutStarted < 3300, 'verification timeout must be bounded');

  const slowRequest = jsonRequest(baseUrl,
    `/api/classroom/admin/students/${student.data.student.id}/minecraft/verify`, {
      cookie: adminCookie, body: { upn: 'slow@hai.tech', playerName: 'SlowPlayer' },
    });
  await new Promise((resolve) => setTimeout(resolve, 25));
  const fastRequest = jsonRequest(baseUrl,
    `/api/classroom/admin/students/${student.data.student.id}/minecraft/verify`, {
      cookie: adminCookie, body: { upn: 'fast@hai.tech', playerName: 'FastPlayer' },
    });
  const [slowResult, fastResult] = await Promise.all([slowRequest, fastRequest]);
  assert.equal(fastResult.response.status, 200);
  assert.equal(slowResult.response.status, 409);
  assert.equal(fastResult.data.minecraftIdentity.graphObjectId, 'graph-fast');

  const archivedStudent = await jsonRequest(baseUrl, `/api/classroom/classes/${classroom.data.classroom.id}/students`, {
    cookie: teacherCookie, body: { name: 'Archived During Verification' },
  });
  const staleAfterArchive = jsonRequest(baseUrl,
    `/api/classroom/admin/students/${archivedStudent.data.student.id}/minecraft/verify`, {
      cookie: adminCookie, body: { upn: 'slow@hai.tech', playerName: 'ArchiveRace' },
    });
  await new Promise((resolve) => setTimeout(resolve, 20));
  const archived = await jsonRequest(baseUrl,
    `/api/classroom/classes/${classroom.data.classroom.id}/students/${archivedStudent.data.student.id}/archive`, {
      cookie: teacherCookie, body: {},
    });
  assert.equal(archived.response.status, 200);
  assert.equal((await staleAfterArchive).response.status, 409);

  const secondStudent = await jsonRequest(baseUrl, `/api/classroom/classes/${classroom.data.classroom.id}/students`, {
    cookie: teacherCookie, body: { name: 'Student Two' },
  });
  const legacyStudent = await jsonRequest(baseUrl, `/api/classroom/classes/${classroom.data.classroom.id}/students`, {
    cookie: teacherCookie, body: { name: 'Legacy Player Collision' },
  });
  const setupDb = new Database(dbFile);
  setupDb.prepare('UPDATE classroom_students SET minecraft_player_name = ? WHERE id = ?')
    .run('LegacyOnly', legacyStudent.data.student.id);
  const secondIdentityBeforeConflict = setupDb.prepare(`SELECT * FROM classroom_minecraft_identities
    WHERE student_id = ?`).get(secondStudent.data.student.id);
  const secondStudentBeforeConflict = setupDb.prepare(`SELECT minecraft_player_name, updated_at
    FROM classroom_students WHERE id = ?`).get(secondStudent.data.student.id);
  setupDb.close();
  const legacyCollision = await jsonRequest(baseUrl,
    `/api/classroom/admin/students/${secondStudent.data.student.id}/minecraft/verify`, {
      cookie: adminCookie, body: { upn: 'legacy-collision@hai.tech', playerName: 'LegacyOnly' },
    });
  assert.equal(legacyCollision.response.status, 409);
  const collisionDb = new Database(dbFile, { readonly: true });
  assert.deepEqual(collisionDb.prepare('SELECT * FROM classroom_minecraft_identities WHERE student_id = ?')
    .get(secondStudent.data.student.id), secondIdentityBeforeConflict);
  assert.deepEqual(collisionDb.prepare(`SELECT minecraft_player_name, updated_at
    FROM classroom_students WHERE id = ?`).get(secondStudent.data.student.id), secondStudentBeforeConflict);
  collisionDb.close();

  const preservedDb = new Database(dbFile, { readonly: true });
  const identityBeforeTeacherConflict = preservedDb.prepare('SELECT * FROM classroom_minecraft_identities WHERE student_id = ?')
    .get(student.data.student.id);
  const studentBeforeTeacherConflict = preservedDb.prepare(`SELECT minecraft_player_name, updated_at
    FROM classroom_students WHERE id = ?`).get(student.data.student.id);
  preservedDb.close();
  const teacherLegacyCollision = await jsonRequest(baseUrl,
    `/api/classroom/classes/${classroom.data.classroom.id}/students/${student.data.student.id}/minecraft/verify`, {
      cookie: teacherCookie, body: { upn: 'legacy-collision@hai.tech', playerName: 'LegacyOnly' },
    });
  assert.equal(teacherLegacyCollision.response.status, 409);
  const preservedAfterDb = new Database(dbFile, { readonly: true });
  assert.deepEqual(preservedAfterDb.prepare('SELECT * FROM classroom_minecraft_identities WHERE student_id = ?')
    .get(student.data.student.id), identityBeforeTeacherConflict);
  assert.deepEqual(preservedAfterDb.prepare(`SELECT minecraft_player_name, updated_at
    FROM classroom_students WHERE id = ?`).get(student.data.student.id), studentBeforeTeacherConflict);
  preservedAfterDb.close();

  const duplicateIdentity = await jsonRequest(baseUrl,
    `/api/classroom/admin/students/${secondStudent.data.student.id}/minecraft/verify`, {
      cookie: adminCookie, body: { upn: 'fast@hai.tech', playerName: 'FastPlayer' },
    });
  assert.equal(duplicateIdentity.response.status, 409);
  const tenthAttempt = await jsonRequest(baseUrl,
    `/api/classroom/admin/students/${secondStudent.data.student.id}/minecraft/verify`, {
      cookie: adminCookie, body: { upn: 'fast@hai.tech', playerName: 'FastPlayer' },
    });
  assert.equal(tenthAttempt.response.status, 409);
  const callsBeforeThrottle = verifier.calls.length;
  const throttledLocally = await jsonRequest(baseUrl,
    `/api/classroom/admin/students/${secondStudent.data.student.id}/minecraft/verify`, {
      cookie: adminCookie, body: { upn: 'fast@hai.tech', playerName: 'FastPlayer' },
    });
  assert.equal(throttledLocally.response.status, 429);
  assert.equal(verifier.calls.length, callsBeforeThrottle);

  const db = new Database(dbFile, { readonly: true });
  const columns = db.prepare("PRAGMA table_info('classroom_minecraft_identities')").all().map((row) => row.name);
  assert.equal(columns.includes('password'), false);
  assert.equal(columns.includes('token'), false);
  const row = db.prepare('SELECT * FROM classroom_minecraft_identities WHERE student_id = ?').get(student.data.student.id);
  assert.equal(row.upn, 'fast@hai.tech');
  assert.equal(row.player_name, 'FastPlayer');
  assert.equal(row.graph_object_id, 'graph-fast');
  assert.equal(row.status, 'verified');
  assert.equal(JSON.stringify(row).includes(verifierSecret), false);
  const verificationAudits = db.prepare(`SELECT outcome FROM classroom_management_audit
    WHERE action = 'minecraft.identity.verify' AND target_id = ? ORDER BY occurred_at`).all(student.data.student.id);
  assert.deepEqual(verificationAudits.map((audit) => audit.outcome),
    ['denied', 'success', 'success', 'success', 'success', 'denied', 'denied', 'denied', 'success', 'invalid', 'denied', 'denied', 'denied', 'denied', 'denied', 'denied', 'denied', 'success', 'denied']);
  assert.deepEqual(db.prepare(`SELECT outcome FROM classroom_management_audit
    WHERE action = 'minecraft.identity.verify' AND target_id = ?`).all(secondStudent.data.student.id),
    [{ outcome: 'denied' }, { outcome: 'denied' }, { outcome: 'denied' }, { outcome: 'denied' }]);
  for (const raceStudentId of [adminEntitlementRaceStudent.data.student.id, teacherEntitlementRaceStudent.data.student.id]) {
    assert.equal(db.prepare('SELECT COUNT(*) AS count FROM classroom_minecraft_identities WHERE student_id = ?').get(raceStudentId).count, 0);
    assert.deepEqual(db.prepare(`SELECT outcome FROM classroom_management_audit
      WHERE action = 'minecraft.identity.verify' AND target_id = ?`).all(raceStudentId), [{ outcome: 'denied' }]);
  }
  assert.equal(db.prepare('SELECT COUNT(*) AS count FROM classroom_minecraft_verification_requests').get().count, 0);
  db.close();

  const archivedVerifiedByTeacher = await jsonRequest(baseUrl,
    `/api/classroom/classes/${classroom.data.classroom.id}/students/${student.data.student.id}/archive`, {
      cookie: teacherCookie, body: {},
    });
  assert.equal(archivedVerifiedByTeacher.response.status, 200);
  const teacherArchivedRoster = await jsonRequest(baseUrl,
    `/api/classroom/classes/${classroom.data.classroom.id}/students/archived`, { cookie: teacherCookie });
  const teacherArchivedStudent = teacherArchivedRoster.data.students.find((entry) => entry.id === student.data.student.id);
  assert.equal(teacherArchivedStudent.minecraftIdentity.status, 'verified');
  assert.equal(teacherArchivedStudent.minecraftIdentity.graphObjectId, 'graph-fast');
  assert.equal((await jsonRequest(baseUrl,
    `/api/classroom/classes/${classroom.data.classroom.id}/students/${student.data.student.id}/restore`, {
      cookie: teacherCookie, body: {},
    })).response.status, 200);
  const teacherRestoredRoster = await jsonRequest(baseUrl, '/api/classroom/classes', { cookie: teacherCookie });
  const teacherRestoredStudent = teacherRestoredRoster.data.classes.flatMap((entry) => entry.students || [])
    .find((entry) => entry.id === student.data.student.id);
  assert.equal(teacherRestoredStudent.minecraftIdentity.status, 'verified');
  assert.equal(teacherRestoredStudent.minecraftIdentity.graphObjectId, 'graph-fast');
  assert.equal((await jsonRequest(baseUrl,
    `/api/classroom/classes/${classroom.data.classroom.id}/students/${student.data.student.id}/archive`, {
      cookie: teacherCookie, body: {},
    })).response.status, 200);
  const adminArchivedRoster = await jsonRequest(baseUrl, '/api/classroom/admin/teachers?includeArchived=1', { cookie: adminCookie });
  const adminArchivedStudent = adminArchivedRoster.data.teachers
    .flatMap((entry) => entry.classes || []).flatMap((entry) => entry.students || [])
    .find((entry) => entry.id === student.data.student.id);
  assert.equal(adminArchivedStudent.minecraftIdentity.status, 'verified');
  assert.equal(adminArchivedStudent.minecraftIdentity.graphObjectId, 'graph-fast');
  assert.equal((await jsonRequest(baseUrl, `/api/classroom/admin/students/${student.data.student.id}/restore`, {
    cookie: adminCookie, body: {},
  })).response.status, 200);
  const restoredRoster = await jsonRequest(baseUrl, '/api/classroom/classes', { cookie: teacherCookie });
  const restoredStudent = restoredRoster.data.classes.flatMap((entry) => entry.students || [])
    .find((entry) => entry.id === student.data.student.id);
  assert.equal(restoredStudent.minecraftIdentity.status, 'verified');
  assert.equal(restoredStudent.minecraftIdentity.graphObjectId, 'graph-fast');

  child.kill('SIGTERM');
  await new Promise((resolve) => child.once('exit', resolve));
  const abandonedDb = new Database(dbFile);
  const requestColumns = abandonedDb.prepare("PRAGMA table_info('classroom_minecraft_verification_requests')").all()
    .map((column) => column.name);
  if (requestColumns.includes('upn')) {
    abandonedDb.prepare(`INSERT INTO classroom_minecraft_verification_requests
      (request_id, student_id, actor_type, actor_id, upn, player_name, created_at)
      VALUES (?, ?, 'admin', ?, ?, ?, ?)`)
      .run('abandoned-request', secondStudent.data.student.id, 'abandoned-admin', 'abandoned@hai.tech', 'Abandoned', '2000-01-01T00:00:00.000Z');
  } else {
    abandonedDb.prepare(`INSERT INTO classroom_minecraft_verification_requests
      (request_id, student_id, actor_type, actor_id, created_at)
      VALUES (?, ?, 'admin', ?, ?)`)
      .run('abandoned-request', secondStudent.data.student.id, 'abandoned-admin', '2000-01-01T00:00:00.000Z');
  }
  abandonedDb.close();
  child = spawnServer();
  await waitForServer(baseUrl);
  const recoveredDb = new Database(dbFile, { readonly: true });
  assert.equal(recoveredDb.prepare(`SELECT COUNT(*) AS count FROM classroom_minecraft_verification_requests
    WHERE request_id = 'abandoned-request'`).get().count, 0);
  assert.deepEqual(recoveredDb.prepare(`SELECT actor_type, actor_id, target_id, outcome
    FROM classroom_management_audit WHERE action = 'minecraft.identity.verify'
      AND actor_id = 'abandoned-admin' ORDER BY occurred_at DESC LIMIT 1`).get(), {
    actor_type: 'admin', actor_id: 'abandoned-admin', target_id: secondStudent.data.student.id, outcome: 'denied',
  });
  recoveredDb.close();
  console.log('✓ owned teacher links an existing enabled licensed Minecraft identity without storing credentials');
} finally {
  if (child.exitCode === null && child.signalCode === null) {
    child.kill('SIGTERM');
    await new Promise((resolve) => child.once('exit', resolve));
  }
  await verifier.close();
  rmSync(tempDir, { recursive: true, force: true });
}
