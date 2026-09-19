import assert from 'node:assert/strict';
import { createHash, createHmac, randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { startFakeMinecraftIdentityVerifier } from '../helpers/fake-minecraft-identity-verifier.mjs';

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
const lifecycleSecret = 'e2e-monitor-token-at-least-32-bytes';
let monitorLease = null;
const monitor = createServer(async (req, res) => {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks);
  const body = raw.length ? JSON.parse(raw.toString('utf8')) : {};
  res.setHeader('Content-Type', 'application/json');
  if (req.url.startsWith('/api/internal/craftom-school/v2/')) {
    const timestamp = String(req.headers['x-hai-timestamp'] || '');
    const requestId = String(req.headers['x-hai-request-id'] || '');
    const canonical = `${timestamp}\nPOST\n${req.url}\n${createHash('sha256').update(raw).digest('hex')}\n${requestId}`;
    const expected = createHmac('sha256', lifecycleSecret).update(canonical).digest('hex');
    if (!/^\d{10}$/.test(timestamp) || requestId !== body.request_id || req.headers['x-hai-signature'] !== expected) {
      res.statusCode = 403;
      return res.end(JSON.stringify({ error: 'forbidden' }));
    }
    if (req.url.endsWith('/world/open')) {
      monitorLease = { server: body.server, lease_id: body.lease_id, generation: body.generation,
        owner_id: body.owner_id, state: 'running', active: true, world: body.world, last_error: null };
    } else if (req.url.endsWith('/world/close')) {
      monitorLease = null;
    } else if (req.url.endsWith('/world/state')) {
      const { owner_id: _ownerId, ...publicLease } = monitorLease || {};
      return res.end(JSON.stringify(monitorLease ? publicLease : {
        server: body.server, lease_id: null, generation: 0, state: 'idle', active: false, world: null, last_error: null,
      }));
    } else if (req.url.endsWith('/world/events')) {
      assert.deepEqual(
        { server: body.server, owner_id: body.owner_id, lease_id: body.lease_id, generation: body.generation, world: body.world },
        { server: monitorLease.server, owner_id: monitorLease.owner_id, lease_id: monitorLease.lease_id,
          generation: monitorLease.generation, world: monitorLease.world },
      );
      return res.end(JSON.stringify({ events }));
    }
    return res.end(JSON.stringify({ ok: true, server: body.server, lease_id: body.lease_id, generation: body.generation }));
  }
  return res.end(JSON.stringify({ ok: true }));
});
const monitorPort = await listen(monitor);
const probe = createServer();
const appPort = await listen(probe);
await new Promise(resolve => probe.close(resolve));
const base = `http://127.0.0.1:${appPort}`;
const verifierSecret = randomBytes(32).toString('hex');
const verifier = await startFakeMinecraftIdentityVerifier({
  secret: verifierSecret,
  responses: new Map([['noa.maze@hai.tech', {
    status: 200,
    body: {
      user: { id: 'e2e-graph-noa', userPrincipalName: 'noa.maze@hai.tech', accountEnabled: true },
      minecraftEducationLicensed: true,
    },
  }]]),
});
const app = spawn(process.execPath, ['server.js'], {
  cwd: root,
  env: {
    ...process.env,
    PORT: String(appPort),
    ROBOTICS_DB_FILE: join(tempDir, 'e2e.sqlite'),
    ROBOTICS_SUBSCRIPTION_GATE: '1',
    ROBOTICS_CLASSROOM_ADMIN_EMAIL: 'owner@example.test',
    ROBOTICS_TEACHER_INVITE_CODE: '',
    ROBOTICS_CLASSROOM_ADMIN_CODE: '',
    ROBOTICS_MINECRAFT_IDENTITY_VERIFIER_URL: verifier.baseUrl,
    ROBOTICS_MINECRAFT_IDENTITY_VERIFIER_SECRET: verifierSecret,
    KUGEL_MONITOR_API_URL: `http://127.0.0.1:${monitorPort}`,
    KUGEL_MONITOR_SERVER_NAME: 'e2e-monitor',
    KUGEL_MINECRAFT_INTERNAL_TOKEN: lifecycleSecret,
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
  const adminRequest = await post(base, '/api/classroom/admin-access/request', { email: 'owner@example.test' });
  const adminCode = (await adminRequest.json()).testCode;
  const admin = await post(base, '/api/classroom/admin-access/redeem', { email: 'owner@example.test', code: adminCode });
  const adminCookie = cookies(admin);
  const invitation = await post(base, '/api/classroom/admin/invitations', {
    name: 'מורת מבוך', email: 'maze@example.test',
  }, adminCookie);
  assert.equal(invitation.status, 201);
  const invitationBody = await invitation.json();
  const redemption = await post(base, '/api/classroom/teacher-invitations/redeem', {
    email: 'maze@example.test', code: invitationBody.testCode,
  });
  assert.equal(redemption.status, 201);
  const redemptionBody = await redemption.json();
  const teacherLogin = await post(base, '/api/classroom/teacher-login', {
    email: 'maze@example.test', password: redemptionBody.temporaryPassword,
  });
  assert.equal(teacherLogin.status, 200);
  const teacherBody = await teacherLogin.json();
  const teacherCookie = cookies(teacherLogin);
  assert.equal((await post(base, `/api/classroom/admin/teachers/${teacherBody.teacher.id}/courses`, { courses: ['craftom-agent'] }, adminCookie)).status, 200);
  const classroomResponse = await post(base, '/api/classroom/classes', { name: 'כיתת המבוך', courses: ['craftom-agent'] }, teacherCookie);
  const classroom = (await classroomResponse.json()).classroom;
  const studentResponse = await post(base, `/api/classroom/classes/${classroom.id}/students`, { name: 'נועה מבוך' }, teacherCookie);
  const student = (await studentResponse.json()).student;

  browser = await chromium.launch({ headless: true });
  const teacherContext = await browser.newContext({ locale: 'he-IL' });
  await teacherContext.addCookies([{ name: 'haiTechClassroomToken', value: cookieValue(teacherCookie), url: base }]);
  const teacherClassroomsPage = await teacherContext.newPage();
  await teacherClassroomsPage.goto(`${base}/teacher-classrooms.html`);
  const identityForm = teacherClassroomsPage.locator('.minecraft-identity-form').first();
  await identityForm.locator('input[name="upn"]').fill('noa.maze@hai.tech');
  await identityForm.locator('input[name="playerName"]').fill('NoaMaze');
  await identityForm.getByRole('button', { name: 'אימות וקישור' }).click();
  await identityForm.getByText(/אומת: noa\.maze@hai\.tech/).waitFor();
  const lessonZeroLink = teacherClassroomsPage.getByRole('link', { name: /ניהול הלומדה:.*Agent/ });
  await lessonZeroLink.waitFor();
  const [teacherPage] = await Promise.all([
    teacherContext.waitForEvent('page'),
    lessonZeroLink.click(),
  ]);
  await teacherPage.waitForLoadState();
  await teacherPage.waitForURL(new RegExp(`/kugel-teacher\\.html\\?classroomId=${classroom.id}$`));
  await teacherPage.waitForFunction((classroomId) => {
    const current = [...document.querySelectorAll('a')].find((link) => link.textContent?.trim() === 'השיעור הנוכחי');
    return current?.href.includes(`classroomId=${classroomId}`) && current.href.includes('lesson=0');
  }, classroom.id);
  await teacherPage.getByRole('link', { name: 'השיעור הנוכחי' }).click();
  await teacherPage.waitForURL(new RegExp(`/kugel-teacher\\.html\\?classroomId=${classroom.id}&lesson=0$`));
  await teacherPage.locator('.teacher-student-board-details summary').click();
  await teacherPage.getByText('נועה מבוך').waitFor();
  const playerInput = teacherPage.locator('input[name="playerName"]');
  await playerInput.fill('NoaMaze');
  await playerInput.locator('xpath=..').getByRole('button', { name: 'שמירת שחקן' }).click();
  await teacherPage.getByText('שם השחקן נשמר.').waitFor();
  await teacherPage.getByRole('button', { name: /פתיחת Minecraft לשיעור 0/ }).click();
  await teacherPage.locator('#teacherStatus').getByText(/עולם (המבוך|שיעור 0) פעיל/).waitFor();
  await teacherPage.getByRole('button', { name: /סיום שיעור 0/ }).waitFor();
  await teacherPage.getByRole('button', { name: /סיום שיעור 0/ }).click();
  await teacherPage.locator('#teacherStatus').getByText(/השיעור הסתיים והשרת שוחרר/).waitFor();
  await teacherPage.getByRole('button', { name: /פתיחת Minecraft לשיעור 0/ }).click();
  await teacherPage.locator('#teacherStatus').getByText(/עולם (המבוך|שיעור 0) פעיל/).waitFor();
  await teacherPage.waitForTimeout(1100);

  const now = new Date().toISOString();
  events = [
    { id: 1, event_type: 'player_join', player_name: 'NoaMaze', created_at: now, payload: '{}' },
    ...Array.from({ length: 8 }, (_, index) => ({ id: index + 2, event_type: 'coin_collected', player_name: 'NoaMaze', created_at: now, block_id: 'gold_block', payload: JSON.stringify({ coin_index: index + 1 }) })),
    { id: 10, event_type: 'finish_button_pressed', player_name: 'NoaMaze', created_at: now, payload: JSON.stringify({ completed: true }) },
  ].map(event => ({ ...event, server: monitorLease.server, owner_id: monitorLease.owner_id, lease_id: monitorLease.lease_id,
    generation: monitorLease.generation, world: monitorLease.world }));
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
  await studentPage.locator('#coinProgress').filter({ hasText: 'ניסיונות: 1' }).waitFor();
  await studentPage.locator('#coinProgress').filter({ hasText: 'זמן אחרון:' }).waitFor();
  await studentPage.locator('#coinProgress').filter({ hasText: 'שיא:' }).waitFor();
  await studentPage.getByRole('link', { name: 'המשך לשיעור 1' }).waitFor({ state: 'visible' });
  console.log('✓ teacher and student complete secure Kugel lesson zero in a real browser');
} finally {
  if (browser) await browser.close();
  if (app.exitCode === null && app.signalCode === null) {
    app.kill('SIGTERM');
    await new Promise(resolve => app.once('exit', resolve));
  }
  await new Promise(resolve => monitor.close(resolve));
  await verifier.close();
  rmSync(tempDir, { recursive: true, force: true });
}
