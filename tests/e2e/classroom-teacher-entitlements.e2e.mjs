import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:net';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const tempDir = mkdtempSync(join(tmpdir(), 'classroom-entitlements-e2e-'));

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
    ROBOTICS_TEACHER_INVITE_CODE: 'e2e-teacher-invite',
    ROBOTICS_CLASSROOM_ADMIN_CODE: 'e2e-admin-code',
    NODE_ENV: 'test',
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});

let browser;
try {
  await waitForServer(baseUrl);
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(`${baseUrl}/teacher-classrooms.html`);
  await page.locator('#teacher-register-form input[name="name"]').fill('מורת E2E');
  await page.locator('#teacher-register-form input[name="email"]').fill('e2e-teacher@example.test');
  await page.locator('#teacher-register-form input[name="password"]').fill('SafePass123!');
  await page.locator('#teacher-register-form input[name="inviteCode"]').fill('e2e-teacher-invite');
  await page.locator('#teacher-register-form button[type="submit"]').click();
  await page.locator('#teacher-dashboard').waitFor({ state: 'visible' });
  await page.getByText('עדיין לא הוקצו לך לומדות').waitFor();
  assert.equal(await page.locator('#create-class-form button[type="submit"]').isDisabled(), true);

  await page.goto(`${baseUrl}/classroom-admin.html`);
  await page.locator('#admin-login-form input[name="code"]').fill('e2e-admin-code');
  await page.locator('#admin-login-form button[type="submit"]').click();
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

  await classCard.locator('[data-action="add-student"] input[name="name"]').fill('תלמידת E2E');
  const addStudentResponse = page.waitForResponse((response) => response.url().includes('/students') && response.request().method() === 'POST');
  await classCard.locator('button[data-action="add-student"]').click();
  assert.equal((await addStudentResponse).status(), 201);
  let studentRow = classCard.locator('[data-student-id]');
  await studentRow.waitFor();
  await studentRow.locator('input[name="name"]').fill('תלמידת E2E מעודכנת');
  await studentRow.locator('button[data-action="save-student"]').click();
  studentRow = classCard.locator('[data-student-id]');
  await studentRow.waitFor();
  assert.equal(await studentRow.locator('input[name="name"]').inputValue(), 'תלמידת E2E מעודכנת');
  await studentRow.locator('button[data-action="reset-student-code"]').click();
  const codeNotice = classCard.locator('[data-role="student-code-notice"]');
  await codeNotice.waitFor({ state: 'visible' });
  assert.match(await codeNotice.textContent(), /[A-Z0-9]{6}/);
  await studentRow.locator('button[data-action="archive-student"]').click();
  await studentRow.waitFor({ state: 'detached' });
  await classCard.locator('button[data-action="show-archived-students"]').click();
  let ownerArchivedStudent = classCard.locator('.archived-students [data-student-id]');
  await ownerArchivedStudent.waitFor();
  await ownerArchivedStudent.locator('button[data-action="restore-student"]').click();
  studentRow = classCard.locator('.student-row[data-student-id]');
  await studentRow.waitFor();
  await studentRow.locator('button[data-action="archive-student"]').click();
  await studentRow.waitFor({ state: 'detached' });

  await page.goto(`${baseUrl}/classroom-admin.html`);
  await page.locator('#admin-dashboard').waitFor({ state: 'visible' });
  await page.locator('#show-archived-teachers').check();
  const archivedStudent = page.locator('[data-student-id]').filter({ hasText: 'תלמידת E2E מעודכנת' });
  await archivedStudent.waitFor();
  await archivedStudent.locator('button[data-action="restore-student"]').click();
  await archivedStudent.waitFor({ state: 'detached' });

  await page.locator('#create-teacher-form input[name="name"]').fill('מורה שנוצרה בניהול');
  await page.locator('#create-teacher-form input[name="email"]').fill('managed-teacher@example.test');
  await page.locator('#create-teacher-form button[data-action="create-teacher"]').click();
  const passwordNotice = page.locator('#admin-one-time-password');
  await passwordNotice.waitFor({ state: 'visible' });
  const passwordText = await passwordNotice.textContent();
  const temporaryPassword = passwordText.match(/: ([A-Za-z0-9_-]{16,}) /)?.[1];
  assert.ok(temporaryPassword, 'administrator UI must show the generated temporary password once');
  let managedTeacherCard = page.locator('[data-teacher-id]').filter({ hasText: 'מורה שנוצרה בניהול' });
  await managedTeacherCard.locator('input[name="name"]').fill('מורה מנוהלת מעודכנת');
  await managedTeacherCard.locator('button[data-action="save-teacher"]').click();
  managedTeacherCard = page.locator('[data-teacher-id]').filter({ hasText: 'מורה מנוהלת מעודכנת' });
  await managedTeacherCard.locator('button[data-action="archive-teacher"]').click();
  await managedTeacherCard.locator('.archive-state').waitFor();
  await managedTeacherCard.locator('button[data-action="restore-teacher"]').click();
  await managedTeacherCard.locator('button[data-action="save-teacher"]').waitFor();

  await page.goto(`${baseUrl}/teacher-classrooms.html`);
  await page.locator('#teacher-dashboard').waitFor({ state: 'visible' });
  await page.locator('#teacher-logout').click();
  await page.locator('#teacher-login-form').waitFor({ state: 'visible' });
  await page.locator('#teacher-login-form input[name="email"]').fill('managed-teacher@example.test');
  await page.locator('#teacher-login-form input[name="password"]').fill(temporaryPassword);
  await page.locator('#teacher-login-form button[type="submit"]').click();
  await page.locator('#teacher-dashboard').waitFor({ state: 'visible' });
  console.log('✓ management UI creates/edits/archives/restores teachers and edits/resets/archives/restores students');
} finally {
  if (browser) await browser.close();
  if (child.exitCode === null && child.signalCode === null) {
    child.kill('SIGTERM');
    await new Promise((resolve) => child.once('exit', resolve));
  }
  rmSync(tempDir, { recursive: true, force: true });
}
