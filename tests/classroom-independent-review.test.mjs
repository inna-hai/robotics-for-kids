import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = readFileSync(join(root, 'server.js'), 'utf8');

function route(start, end) {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from + start.length);
  assert.ok(from >= 0 && to > from, `route slice ${start}`);
  return source.slice(from, to);
}

const invitationRedeem = route("if (action === 'teacher-invitations' && segments[3] === 'redeem'", "if (action === 'admin-login')");
assert.match(invitationRedeem, /classroomSourceKey\(req, 'teacher-invitation-redeem'\)/);
assert.match(invitationRedeem, /classroomIdentityKey\('teacher-invitation-redeem', email\)/);
assert.doesNotMatch(invitationRedeem, /classroomLoginKey\(req, 'teacher-invitation'/);

const teacherLogin = route("if (action === 'teacher-login')", "if (action === 'preview-demo-teacher-login')");
assert.match(teacherLogin, /classroomSourceKey\(req, 'teacher-login'\)/);
assert.match(teacherLogin, /classroomIdentityKey\('teacher-login', email\)/);
assert.match(teacherLogin, /DUMMY_CLASSROOM_TEACHER_SALT/);
assert.match(teacherLogin, /hashClassroomSecret\(password, teacher\?\.password_salt \|\| DUMMY_CLASSROOM_TEACHER_SALT\)/);
console.log('✓ invitation redemption and teacher login use independent pre-work limiter keys and canonical dummy scrypt');

for (const [label, start, end, authorizer] of [
  ['progress', "if (action === 'progress')", "if (action === 'student-login')", 'requireCurrentClassroomStudent'],
  ['class course update', "if (action === 'classes' && segments[3] && segments[4] === 'courses'", "if (action === 'classes' && segments[3] && segments[4] === 'students' && segments[5]", 'requireCurrentClassroomTeacher'],
  ['student update', "if (action === 'classes' && segments[3] && segments[4] === 'students' && segments[5] && segments.length === 6)", "if (action === 'classes' && segments[3] && segments[4] === 'students' && segments[5] && ['reset'", 'requireCurrentClassroomTeacher'],
  ['student state mutation', "if (action === 'classes' && segments[3] && segments[4] === 'students' && segments[5] && ['reset'", "if (action === 'classes' && segments[3] && segments[4] === 'students' && segments.length === 5)", 'requireCurrentClassroomTeacher'],
  ['student creation', "if (action === 'classes' && segments[3] && segments[4] === 'students' && segments.length === 5)", "if (action === 'classes' && segments.length === 3)", 'requireCurrentClassroomTeacher'],
  ['class creation', "if (action === 'classes' && segments.length === 3)", "if (action === 'teacher-login')", 'requireCurrentClassroomTeacher'],
]) {
  const handler = route(start, end);
  assert.match(handler, new RegExp(`withSummerDb\\(db => db\\.transaction\\(\\(\\) => \\{[\\s\\S]*${authorizer}[\\s\\S]*\\}\\)\\.immediate\\(\\)\\)`),
    `${label} must revalidate and mutate in one BEGIN IMMEDIATE transaction`);
}
console.log('✓ protected classroom mutations revalidate and mutate inside one immediate transaction');

const invitationCreate = route("if (action === 'admin' && segments[3] === 'invitations' && segments.length === 4)", "if (action === 'admin' && segments[3] === 'rotate'");
assert.match(invitationCreate, /SELECT id FROM classroom_teachers WHERE email = \?/);
assert.match(invitationCreate, /UPDATE classroom_teacher_invitations[\s\S]*status = 'revoked'[\s\S]*email = \?[\s\S]*status IN \('pending','sent','failed','unknown'\)/);
assert.match(invitationCreate, /invitation_create[\s\S]*'invalid'/);
assert.match(invitationRedeem, /WHERE email = \? ORDER BY created_at DESC LIMIT 1/,
  'redemption must select the current normalized-email invitation independently of supplied code');
assert.doesNotMatch(invitationRedeem, /WHERE email = \? AND code_hash = \?/);

const resend = route("if (action === 'admin' && segments[3] === 'invitations' && segments[4]\n      && segments[5] === 'resend'", "if (action === 'admin' && segments[3] === 'invitations' && segments.length === 4)");
assert.match(resend, /const reconciled = db\.prepare\([\s\S]*delivery_generation = \?[\s\S]*if \(reconciled\.changes !== 1\) return \{ stale: true \}/);
assert.match(resend, /if \(reconciliation\.stale\)[\s\S]*409/);
const rotation = route("if (action === 'admin' && segments[3] === 'rotate'", "if (action === 'admin' && segments[3] === 'teachers' && segments.length === 4)");
assert.match(rotation, /reconcileAdminChallengeDelivery\(result\.challengeId, result\.credentialVersion, deliveryStatus\)/);
assert.match(rotation, /if \(reconciliation\.stale\)[\s\S]*409/);
console.log('✓ invitation uniqueness, stale resend reconciliation, and rotation delivery auditing are explicit');

const e2e = readFileSync(join(root, 'tests/e2e/classroom-teacher-entitlements.e2e.mjs'), 'utf8');
assert.doesNotMatch(e2e, /page\.route\(|page\.unroute\(/, 'credential E2E must not intercept application routes');
assert.match(e2e, /#admin-access-request-form[\s\S]*click\(\)/, 'access request must use the real browser form');
assert.match(e2e, /ROBOTICS_CREDENTIAL_MAILER/, 'rotation delivery paths must use a controlled real mailer');
assert.doesNotMatch(e2e, /managedRedemption\s*=\s*await fetch/, 'administrator invitation handoff must not redeem through an API shortcut');
assert.match(e2e, /managedInvitationCode[\s\S]*teacher-invitation-form[\s\S]*managed-teacher@example\.test/,
  'administrator-created invitation must be handed to the teacher redemption UI');
console.log('✓ credential browser E2E uses real forms, routes, and controlled delivery');
