import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const tempDir = mkdtempSync(join(tmpdir(), 'kugel-zero-e2e-'));
const cookies = response => String(response.headers.get('set-cookie') || '').split(';')[0];
const cookieValue = value => value.slice(value.indexOf('=') + 1);

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve(server.address().port));
  });
}

async function post(base, path, body, cookie = '') {
  return fetch(`${base}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
    body: JSON.stringify(body),
  });
}

let events = [];
const monitor = createServer(async (req, res) => {
  for await (const _chunk of req) { /* consume body */ }
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'GET') res.end(JSON.stringify({ events }));
  else res.end(JSON.stringify({ ok: true }));
});
const monitorPort = await listen(monitor);
const probe = createServer();
const appPort = await listen(probe);
await new Promise(resolve => probe.close(resolve));
const base = `http://127.0.0.1:${appPort}`;
const app = spawn(process.execPath, ['server.js'], {
  cwd: root,
  env: {
    ...process.env,
    PORT: String(appPort),
    ROBOTICS_DB_FILE: join(tempDir, 'e2e.sqlite'),
    ROBOTICS_SUBSCRIPTION_GATE: '1',
    ROBOTICS_TEACHER_INVITE_CODE: 'e2e-invite',
    ROBOTICS_CLASSROOM_ADMIN_CODE: 'e2e-admin',
    KUGEL_MONITOR_API_URL: `http://127.0.0.1:${monitorPort}`,
    KUGEL_MONITOR_SERVER_NAME: 'e2e-monitor',
    KUGEL_MINECRAFT_INTERNAL_TOKEN: 'e2e-monitor-token',
    KUGEL_MINECRAFT_SERVER_NAME: 'E2E Minecraft',
    KUGEL_MINECRAFT_SERVER_HOST: '127.0.0.1',
    KUGEL_MINECRAFT_SERVER_PORT: '19132',
    KUGEL_MINECRAFT_SERVER_ID: 'e2e-server',
    KUGEL_MINECRAFT_ACCESS_CODE: 'e2e-access',
    NODE_ENV: 'test',
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});

async function waitForApp() {
  for (let i = 0; i < 80; i += 1) {
    try { if ((await fetch(`${base}/index.html`)).ok) return; } catch {}
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  throw new Error('Kugel E2E app did not start');
}

let browser;
try {
  await waitForApp();
  const registration = await post(base, '/api/classroom/teacher-register', {
    name: 'מורת מבוך', email: 'maze@example.test', password: 'SafePass123!', inviteCode: 'e2e-invite',
  });
  assert.equal(registration.status, 201);
  const teacherBody = await registration.json();
  const teacherCookie = cookies(registration);
  const admin = await post(base, '/api/classroom/admin-login', { code: 'e2e-admin' });
  const adminCookie = cookies(admin);
  assert.equal((await post(base, `/api/classroom/admin/teachers/${teacherBody.teacher.id}/courses`, { courses: ['craftom-agent'] }, adminCookie)).status, 200);
  const classroomResponse = await post(base, '/api/classroom/classes', { name: 'כיתת המבוך', courses: ['craftom-agent'] }, teacherCookie);
  const classroom = (await classroomResponse.json()).classroom;
  const studentResponse = await post(base, `/api/classroom/classes/${classroom.id}/students`, { name: 'נועה מבוך' }, teacherCookie);
  const student = (await studentResponse.json()).student;

  browser = await chromium.launch({ headless: true });
  const teacherContext = await browser.newContext({ locale: 'he-IL' });
  await teacherContext.addCookies([{ name: 'haiTechClassroomToken', value: cookieValue(teacherCookie), url: base }]);
  const teacherPage = await teacherContext.newPage();
  await teacherPage.goto(`${base}/teacher-classrooms.html`);
  const lessonZeroLink = teacherPage.getByRole('link', { name: /התחלת שיעור 0 ב-Minecraft/ });
  await lessonZeroLink.waitFor();
  await lessonZeroLink.click();
  await teacherPage.waitForURL(new RegExp(`/kugel-teacher\\.html\\?classroomId=${classroom.id}$`));
  await teacherPage.getByText('נועה מבוך').waitFor();
  const playerInput = teacherPage.locator('input[name="playerName"]');
  await playerInput.fill('NoaMaze');
  await playerInput.locator('xpath=..').getByRole('button', { name: 'שמירת שחקן' }).click();
  await teacherPage.getByText('שם השחקן נשמר.').waitFor();
  await teacherPage.getByRole('button', { name: 'התחלת שיעור 0 ופתיחת עולם Minecraft' }).click();
  await teacherPage.locator('#teacherStatus').getByText('עולם המבוך פעיל.').waitFor();
  await teacherPage.getByRole('button', { name: 'התחלת שיעור 0 ופתיחת עולם Minecraft' }).click();
  await teacherPage.locator('#teacherStatus').getByText('עולם המבוך פעיל.').waitFor();
  await teacherPage.waitForTimeout(1100);

  const now = new Date().toISOString();
  events = [
    { id: 1, event_type: 'player_join', player_name: 'NoaMaze', created_at: now, payload: '{}' },
    ...Array.from({ length: 8 }, (_, index) => ({ id: index + 2, event_type: 'coin_collected', player_name: 'NoaMaze', created_at: now, block_id: 'gold_block', payload: JSON.stringify({ coin_index: index + 1 }) })),
    { id: 10, event_type: 'finish_button_pressed', player_name: 'NoaMaze', created_at: now, payload: JSON.stringify({ completed: true }) },
  ];
  await teacherPage.locator('#refreshBoard').click();
  await teacherPage.getByText('8 / 8 מטבעות').waitFor();

  const studentLogin = await post(base, '/api/classroom/student-login', { classCode: classroom.joinCode, personalCode: student.loginCode });
  const studentCookie = cookies(studentLogin);
  const studentContext = await browser.newContext({ locale: 'he-IL' });
  await studentContext.addCookies([{ name: 'haiTechClassroomToken', value: cookieValue(studentCookie), url: base }]);
  const studentPage = await studentContext.newPage();
  await studentPage.goto(`${base}/kugel-student.html`);
  await studentPage.getByText(/שחקן Minecraft: NoaMaze/).waitFor();
  const startStatus = await studentPage.evaluate(async () => (await fetch('/api/kugel/student/start', {
    method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: '{}',
  })).status);
  assert.equal(startStatus, 200);
  await studentPage.getByRole('button', { name: 'בדיקת סיום' }).click();
  await studentPage.getByText('שיעור 0 הושלם. אפשר להמשיך לשיעור 1.').waitFor();
  await studentPage.getByRole('link', { name: 'המשך לשיעור 1' }).waitFor({ state: 'visible' });
  console.log('✓ teacher and student complete secure Kugel lesson zero in a real browser');
} finally {
  if (browser) await browser.close();
  if (app.exitCode === null && app.signalCode === null) {
    app.kill('SIGTERM');
    await new Promise(resolve => app.once('exit', resolve));
  }
  await new Promise(resolve => monitor.close(resolve));
  rmSync(tempDir, { recursive: true, force: true });
}
