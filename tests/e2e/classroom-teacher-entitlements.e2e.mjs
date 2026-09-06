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
  await page.locator('.class-card button[type="submit"]').click();
  await page.getByText('הרשאות הלומדות של מורת E2E נשמרו.').waitFor();

  await page.goto(`${baseUrl}/teacher-classrooms.html`);
  await page.locator('#teacher-dashboard').waitFor({ state: 'visible' });
  const teacherValues = await page.locator('#teacher-course-catalog input[name="courses"]').evaluateAll((nodes) => nodes.map((node) => node.value));
  assert.deepEqual(teacherValues, ['sensi-city', 'craftom-agent']);
  assert.equal(await page.locator('#teacher-course-catalog a[href="craftom-school/preview/index.html"]').count(), 1);
  await page.locator('#create-class-form input[name="name"]').fill('כיתת E2E');
  await page.locator('#teacher-course-catalog input[value="sensi-city"]').check();
  await page.locator('#create-class-form button[type="submit"]').click();
  await page.getByRole('heading', { name: 'כיתת E2E', exact: true }).waitFor();
  assert.equal(await page.locator('#teacher-course-catalog a[href="craftom-school/preview/index.html"]').count(), 1, 'teacher must keep an assigned course link even when no class uses it');

  await page.goto(`${baseUrl}/classroom-admin.html`);
  await page.locator('#admin-dashboard').waitFor({ state: 'visible' });
  await page.locator('.class-card input[value="sensi-city"]').uncheck();
  await page.locator('.class-card button[type="submit"]').click();
  await page.getByText('הרשאות הלומדות של מורת E2E נשמרו.').waitFor();

  await page.goto(`${baseUrl}/teacher-classrooms.html`);
  await page.locator('#teacher-dashboard').waitFor({ state: 'visible' });
  const remainingTeacherValues = await page.locator('#teacher-course-catalog input[name="courses"]').evaluateAll((nodes) => nodes.map((node) => node.value));
  assert.deepEqual(remainingTeacherValues, ['craftom-agent']);
  const classCard = page.locator('.class-card').filter({ hasText: 'כיתת E2E' });
  assert.equal(await classCard.locator('.course-links a').count(), 0);
  const classPickerValues = await classCard.locator('.course-access-form input[name="courses"]').evaluateAll((nodes) => nodes.map((node) => node.value));
  assert.deepEqual(classPickerValues, ['craftom-agent']);
  console.log('✓ administrator entitlements control teacher links and class assignments in a real browser');
} finally {
  if (browser) await browser.close();
  if (child.exitCode === null && child.signalCode === null) {
    child.kill('SIGTERM');
    await new Promise((resolve) => child.once('exit', resolve));
  }
  rmSync(tempDir, { recursive: true, force: true });
}
