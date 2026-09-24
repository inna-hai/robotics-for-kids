import assert from 'node:assert/strict';
import { chmodSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:net';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const tempDir = mkdtempSync(join(tmpdir(), 'classroom-entitlements-e2e-'));
const mailerMode = join(tempDir, 'mailer-mode');
const mailerCapture = join(tempDir, 'mailer-capture.json');
const controlledMailer = join(tempDir, 'controlled-mailer');
writeFileSync(mailerMode, 'sent');
writeFileSync(controlledMailer, `#!/bin/sh
payload=$(/bin/cat)
/usr/bin/printf '%s' "$payload" > '${mailerCapture}'
mode=$(/bin/cat '${mailerMode}')
[ "$mode" = unknown ] && exit 75
[ "$mode" = failed ] && exit 1
exit 0
`);
chmodSync(controlledMailer, 0o700);
const capturedCode = () => JSON.parse(readFileSync(mailerCapture, 'utf8')).code;

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
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/classroom-admin.html`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error('classroom entitlement E2E server did not start');
}

const port = await freePort();
const baseUrl = `http://127.0.0.1:${port}`;
const child = spawn(process.execPath, ['server.js'], {
  cwd: root,
  env: {
    ...process.env,
    PORT: String(port),
    ROBOTICS_DB_FILE: join(tempDir, 'entitlements.sqlite'),
    ROBOTICS_SUBSCRIPTION_GATE: '1',
    ROBOTICS_CLASSROOM_ADMIN_EMAIL: 'owner@example.test',
    ROBOTICS_TEACHER_INVITE_CODE: '',
    ROBOTICS_CLASSROOM_ADMIN_CODE: '',
    ROBOTICS_CREDENTIAL_MAILER: controlledMailer,
    NODE_ENV: 'test',
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});

let browser;
try {
  await waitForServer(baseUrl);
  const accessRequest = await fetch(`${baseUrl}/api/classroom/admin-access/request`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'owner@example.test' }),
  });
  const accessCode = (await accessRequest.json()).testCode;
  const adminSession = await fetch(`${baseUrl}/api/classroom/admin-access/redeem`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'owner@example.test', code: accessCode }),
  });
  const adminCookie = (adminSession.headers.get('set-cookie') || '').split(';')[0];
  const invitationResponse = await fetch(`${baseUrl}/api/classroom/admin/invitations`, {
    method: 'POST', headers: { 'content-type': 'application/json', cookie: adminCookie },
    body: JSON.stringify({ name: 'מורת E2E', email: 'e2e-teacher@example.test' }),
  });
  const invitation = await invitationResponse.json();
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(`${baseUrl}/teacher-classrooms.html`);
  await page.locator('#teacher-invitation-form input[name="email"]').fill('e2e-teacher@example.test');
  await page.locator('#teacher-invitation-form input[name="code"]').fill(invitation.testCode);
  await page.locator('#teacher-invitation-form button[type="submit"]').click();
  const teacherPasswordNotice = page.locator('#teacher-one-time-password');
  await teacherPasswordNotice.waitFor({ state: 'visible' });
  const teacherPassword = (await teacherPasswordNotice.textContent()).match(/: ([A-Za-z0-9_-]{20,}) /)?.[1];
  assert.ok(teacherPassword, 'invitation redemption UI must retain the one-time teacher password');
  console.log('✓ teacher invitation is redeemed through the real browser UI');

  await page.locator('#teacher-login-form input[name="email"]').fill('e2e-teacher@example.test');
  await page.locator('#teacher-login-form input[name="password"]').fill(teacherPassword);
  await page.locator('#teacher-login-form button[type="submit"]').click();
  await page.locator('#teacher-dashboard').waitFor({ state: 'visible' });
  await page.getByText('עדיין לא הוקצו לך לומדות').waitFor();
  assert.equal(await page.locator('#create-class-form button[type="submit"]').isDisabled(), true);

  await page.goto(`${baseUrl}/classroom-admin.html`);
  await page.locator('#admin-access-request-form input[name="email"]').fill('owner@example.test');
  const browserAccessResponse = page.waitForResponse(response => response.url().endsWith('/api/classroom/admin-access/request'));
  await page.locator('#admin-access-request-form button[type="submit"]').click();
  assert.equal((await browserAccessResponse).status(), 202);
  const uiAccessCode = capturedCode();
  await page.locator('#admin-access-redeem-form input[name="email"]').fill('owner@example.test');
  await page.locator('#admin-access-redeem-form input[name="code"]').fill(uiAccessCode);
  await page.locator('#admin-access-redeem-form button[type="submit"]').click();
  await page.locator('#admin-dashboard').waitFor({ state: 'visible' });
  await page.locator('.class-card input[value="sensi-city"]').check();
  await page.locator('.class-card input[value="craftom-agent"]').check();
  await page.locator('.class-card [data-action="save-teacher-courses"]').click();
  await page.getByText('הרשאות הלומדות של מורת E2E נשמרו.').waitFor();

  await page.goto(`${baseUrl}/teacher-classrooms.html`);
  await page.locator('#teacher-dashboard').waitFor({ state: 'visible' });
  await page.locator('#teacher-course-catalog input[name="courses"]').first().waitFor({ state: 'attached' });
  const teacherValues = await page.locator('#teacher-course-catalog input[name="courses"]').evaluateAll((nodes) => nodes.map((node) => node.value));
  assert.deepEqual(teacherValues, ['sensi-city', 'craftom-agent']);
  assert.equal(await page.locator('#teacher-course-catalog a[href="#classes-list"]').count(), 1);
  await page.locator('#create-class-form input[name="name"]').fill('כיתת E2E');
  await page.locator('#teacher-course-catalog input[value="sensi-city"]').check();
  await page.locator('#create-class-form button[type="submit"]').click();
  await page.getByRole('heading', { name: 'כיתת E2E', exact: true }).waitFor();
  assert.equal(await page.locator('#teacher-course-catalog a[href="#classes-list"]').count(), 1, 'teacher must keep an assigned course link even when no class uses it');

  await page.goto(`${baseUrl}/classroom-admin.html`);
  await page.locator('#admin-dashboard').waitFor({ state: 'visible' });
  await page.locator('.class-card input[value="sensi-city"]').uncheck();
  await page.locator('.class-card [data-action="save-teacher-courses"]').click();
  await page.getByText('הרשאות הלומדות של מורת E2E נשמרו.').waitFor();

  await page.goto(`${baseUrl}/teacher-classrooms.html`);
  await page.locator('#teacher-dashboard').waitFor({ state: 'visible' });
  await page.locator('#teacher-course-catalog input[name="courses"]').first().waitFor({ state: 'attached' });
  const remainingTeacherValues = await page.locator('#teacher-course-catalog input[name="courses"]').evaluateAll((nodes) => nodes.map((node) => node.value));
  assert.deepEqual(remainingTeacherValues, ['craftom-agent']);
  const classCard = page.locator('.class-card').filter({ hasText: 'כיתת E2E' });
  assert.equal(await classCard.locator('.course-links a').count(), 0);
  const classPickerValues = await classCard.locator('.course-access-form input[name="courses"]').evaluateAll((nodes) => nodes.map((node) => node.value));
  assert.deepEqual(classPickerValues, ['craftom-agent']);
  console.log('✓ administrator entitlements control teacher links and class assignments in a real browser');

  await classCard.locator('.students-table-section').waitFor();
  assert.equal(await classCard.locator('button[data-action="add-student"]').count(), 0);
  assert.equal(await classCard.locator('button[data-action="reset-student-code"]').count(), 0);
  assert.equal(await classCard.locator('button[data-action="archive-student"]').count(), 0);
  assert.equal(await classCard.locator('.student-edit-form').count(), 0);
  console.log('✓ teacher classroom roster is read-only in a real browser');

  await page.goto(`${baseUrl}/classroom-admin.html`);
  await page.locator('#admin-dashboard').waitFor({ state: 'visible' });

  await page.locator('#create-invitation-form input[name="name"]').fill('מורה שנוצרה בניהול');
  await page.locator('#create-invitation-form input[name="email"]').fill('managed-teacher@example.test');
  await page.locator('#create-invitation-form button[data-action="create-invitation"]').click();
  const invitationNotice = page.locator('#admin-one-time-credential');
  await invitationNotice.waitFor({ state: 'visible' });
  const invitationText = await invitationNotice.textContent();
  const managedInvitationCode = invitationText.match(/: ([A-Za-z0-9_-]{20,}) /)?.[1];
  assert.ok(managedInvitationCode, 'administrator UI must retain the one-time invitation code');
  const managedTeacherContext = await browser.newContext();
  const managedTeacherPage = await managedTeacherContext.newPage();
  await managedTeacherPage.goto(`${baseUrl}/teacher-classrooms.html`);
  await managedTeacherPage.locator('#teacher-invitation-form input[name="email"]').fill('managed-teacher@example.test');
  await managedTeacherPage.locator('#teacher-invitation-form input[name="code"]').fill(managedInvitationCode);
  await managedTeacherPage.locator('#teacher-invitation-form button[type="submit"]').click();
  const managedPasswordNotice = managedTeacherPage.locator('#teacher-one-time-password');
  await managedPasswordNotice.waitFor({ state: 'visible' });
  const managedTeacherPassword = (await managedPasswordNotice.textContent()).match(/: ([A-Za-z0-9_-]{20,}) /)?.[1];
  assert.ok(managedTeacherPassword, 'teacher UI must retain the administrator-created invitation credential');
  await managedTeacherPage.locator('#teacher-login-form input[name="email"]').fill('managed-teacher@example.test');
  await managedTeacherPage.locator('#teacher-login-form input[name="password"]').fill(managedTeacherPassword);
  await managedTeacherPage.locator('#teacher-login-form button[type="submit"]').click();
  await managedTeacherPage.locator('#teacher-dashboard').waitFor({ state: 'visible' });
  await managedTeacherPage.locator('#teacher-logout').click();
  await managedTeacherPage.locator('#teacher-login-form').waitFor({ state: 'visible' });

  await page.goto(`${baseUrl}/classroom-admin.html`);
  await page.locator('#admin-dashboard').waitFor({ state: 'visible' });
  await page.locator('#show-archived-teachers').check();
  let managedTeacherCard = page.locator('[data-teacher-id]').filter({ hasText: 'managed-teacher@example.test' });
  await managedTeacherCard.locator('input[name="name"]').fill('מורה מנוהלת מעודכנת');
  await managedTeacherCard.locator('button[data-action="save-teacher"]').click();
  await page.getByText('פרטי המורה נשמרו.').waitFor();
  managedTeacherCard = page.locator('[data-teacher-id]').filter({ hasText: 'managed-teacher@example.test' });
  await managedTeacherCard.locator('button[data-action="archive-teacher"]').click();
  await managedTeacherCard.locator('.archive-state').waitFor();
  await managedTeacherCard.locator('button[data-action="restore-teacher"]').click();
  await managedTeacherCard.locator('button[data-action="save-teacher"]').waitFor();

  await managedTeacherPage.goto(`${baseUrl}/teacher-classrooms.html`);
  await managedTeacherPage.locator('#teacher-login-form input[name="email"]').fill('managed-teacher@example.test');
  await managedTeacherPage.locator('#teacher-login-form input[name="password"]').fill(managedTeacherPassword);
  await managedTeacherPage.locator('#teacher-login-form button[type="submit"]').click();
  await managedTeacherPage.locator('#teacher-dashboard').waitFor({ state: 'visible' });
  await managedTeacherContext.close();
  console.log('✓ administrator invitation creation hands off to teacher redemption and login entirely through browser UI');

  await page.goto(`${baseUrl}/classroom-admin.html`);
  await page.locator('#admin-dashboard').waitFor({ state: 'visible' });
  writeFileSync(mailerMode, 'sent');
  const sentRotationResponse = page.waitForResponse(response => response.url().endsWith('/api/classroom/admin/rotate'));
  await page.locator('#admin-rotate').click();
  assert.equal((await sentRotationResponse).status(), 200);
  await page.waitForFunction(() => document.querySelector('#admin-one-time-credential')?.textContent?.includes('קוד הגישה החלופי'));
  assert.match(await page.locator('#admin-one-time-credential').textContent(), /קוד הגישה החלופי/);
  const sentReplacementCode = capturedCode();
  await page.locator('#admin-access-redeem-form input[name="email"]').fill('owner@example.test');
  await page.locator('#admin-access-redeem-form input[name="code"]').fill(sentReplacementCode);
  await page.locator('#admin-access-redeem-form button[type="submit"]').click();
  await page.locator('#admin-dashboard').waitFor({ state: 'visible' });
  console.log('✓ administrator rotation sent delivery is exercised through the real mailer and UI');

  writeFileSync(mailerMode, 'unknown');
  const unknownRotationResponse = page.waitForResponse(response => response.url().endsWith('/api/classroom/admin/rotate'));
  await page.locator('#admin-rotate').click();
  assert.equal((await unknownRotationResponse).status(), 200);
  await page.locator('#admin-auth').waitFor({ state: 'visible' });
  assert.match(await page.locator('#admin-one-time-credential').textContent(), /לא ידוע|לא ודאי/,
    'rotation UI must explain ambiguous delivery instead of claiming that mail was sent');
  console.log('✓ administrator rotation unknown delivery is explicit in the real browser UI');

  const replacementCode = capturedCode();
  await page.locator('#admin-access-redeem-form input[name="email"]').fill('owner@example.test');
  await page.locator('#admin-access-redeem-form input[name="code"]').fill(replacementCode);
  await page.locator('#admin-access-redeem-form button[type="submit"]').click();
  await page.locator('#admin-dashboard').waitFor({ state: 'visible' });
  writeFileSync(mailerMode, 'failed');
  const failedRotationResponse = page.waitForResponse(response => response.url().endsWith('/api/classroom/admin/rotate'));
  await page.locator('#admin-rotate').click();
  assert.equal((await failedRotationResponse).status(), 502);
  await page.locator('#admin-auth').waitFor({ state: 'visible' });
  assert.match(await page.locator('#admin-one-time-credential').textContent(), /נכשלה|כשל/,
    'rotation UI must explain definite delivery failure after the old session is revoked');
  console.log('✓ administrator rotation delivery failure is explicit in the real browser UI');
} finally {
  if (browser) await browser.close();
  if (child.exitCode === null && child.signalCode === null) {
    child.kill('SIGTERM');
    await new Promise((resolve) => child.once('exit', resolve));
  }
  rmSync(tempDir, { recursive: true, force: true });
}
