import assert from 'node:assert/strict';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { dirname, join, relative } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const sourceRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const reportMessage = `בדיקת דיווח שיעור 0 ${process.pid}`;
const pages = [
  'classroom-admin.html',
  'teacher-classrooms.html',
  'classroom-entry.html',
  'kugel-teacher.html',
  'kugel-student.html',
  'craftom-agent-academy.html',
  ...Array.from({ length: 16 }, (_, index) => `craftom-minecraft-lesson-${index + 1}.html`),
];

async function stopServer(server) {
  if (!server || server.exitCode !== null) return;
  await new Promise(resolve => {
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      clearTimeout(forceTimer);
      clearTimeout(giveUpTimer);
      resolve();
    };
    const forceTimer = setTimeout(() => {
      try {
        if (server.exitCode === null) server.kill('SIGKILL');
      } catch {
        finish();
      }
    }, 3000);
    const giveUpTimer = setTimeout(finish, 5000);
    server.once('exit', finish);
    server.once('close', finish);
    server.once('error', finish);
    try {
      server.kill('SIGTERM');
    } catch {
      finish();
    }
  });
}

let isolatedRoot;
let server;
let browser;
try {
  isolatedRoot = mkdtempSync(join(tmpdir(), 'craftom-feedback-e2e-'));
  cpSync(sourceRoot, isolatedRoot, {
    recursive: true,
    filter(source) {
      const path = relative(sourceRoot, source);
      return path !== '.git'
        && path !== 'node_modules'
        && path !== 'data'
        && !path.startsWith(`.git/`)
        && !path.startsWith(`node_modules/`)
        && !path.startsWith(`data/`);
    },
  });
  mkdirSync(join(isolatedRoot, 'data'), { recursive: true });
  symlinkSync(join(sourceRoot, 'node_modules'), join(isolatedRoot, 'node_modules'), 'dir');

  const isolatedServerPath = join(isolatedRoot, 'server.js');
  const listenSource = "server.listen(PORT, '0.0.0.0', () => {\n  ensureAdminToken();\n  console.log(`Robotics15 server listening on http://0.0.0.0:${PORT}`);\n});";
  const listenReplacement = "server.listen(0, '127.0.0.1', () => {\n  ensureAdminToken();\n  console.log(`E2E_PORT=${server.address().port}`);\n});";
  const isolatedServerSource = readFileSync(isolatedServerPath, 'utf8');
  assert.ok(isolatedServerSource.includes(listenSource), 'isolated test server listen block must be recognizable');
  writeFileSync(isolatedServerPath, isolatedServerSource.replace(listenSource, listenReplacement));

  const dbFile = join(isolatedRoot, 'data', 'test.sqlite');
  const feedbackFile = join(isolatedRoot, 'data', 'feedback.jsonl');
  server = spawn(process.execPath, ['server.js'], {
    cwd: isolatedRoot,
    env: {
      ...process.env,
      ROBOTICS_DB_FILE: dbFile,
      ROBOTICS_SUBSCRIPTION_GATE: '0',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  const port = await new Promise((resolve, reject) => {
    let output = '';
    let settled = false;
    const settle = (action, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      action(value);
    };
    const timeout = setTimeout(() => settle(reject, new Error('Application test server did not report its port')), 10000);
    const inspect = chunk => {
      output += chunk.toString();
      const match = output.match(/E2E_PORT=(\d+)/);
      if (match) settle(resolve, Number(match[1]));
    };
    server.stdout.on('data', inspect);
    server.stderr.on('data', inspect);
    server.once('error', error => settle(reject, error));
    server.once('exit', code => {
      if (!output.match(/E2E_PORT=(\d+)/)) {
        settle(reject, new Error(`Application test server exited before readiness (${code})`));
      }
    });
  });
  const base = `http://127.0.0.1:${port}`;

  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ locale: 'he-IL' });

  for (const pathname of pages) {
    const page = await context.newPage();
    await page.goto(`${base}/${pathname}`, { waitUntil: 'domcontentloaded' });
    await page.locator('.rfw-button').waitFor({ state: 'visible' });
    assert.equal(await page.locator('.rfw-button').textContent(), 'דיווח תקלה / הצעת שיפור', `${pathname} must render the report button`);
    await page.close();
  }

  const mobilePage = await context.newPage();
  await mobilePage.setViewportSize({ width: 390, height: 844 });
  await mobilePage.goto(`${base}/teacher-classrooms.html`, { waitUntil: 'networkidle' });
  const mobileButton = mobilePage.locator('.rfw-button');
  const mobileBadge = mobilePage.locator('#hai-user-badge');
  await mobileButton.waitFor({ state: 'visible' });
  await mobileBadge.waitFor({ state: 'visible' });
  const buttonBox = await mobileButton.boundingBox();
  const badgeBox = await mobileBadge.boundingBox();
  assert.ok(buttonBox && badgeBox && buttonBox.y + buttonBox.height < badgeBox.y, 'the report button must stay above the user badge on mobile');
  await mobileButton.click();
  await mobilePage.locator('.rfw-modal').waitFor({ state: 'visible' });
  await mobilePage.close();

  const page = await context.newPage();
  await page.goto(`${base}/teacher-classrooms.html`, { waitUntil: 'domcontentloaded' });
  await page.locator('.rfw-button').click();
  await page.locator('#rfw-message').fill(reportMessage);
  await page.locator('#rfw-contact').fill('מורת בדיקה');
  const responsePromise = page.waitForResponse(response => response.url().endsWith('/api/feedback') && response.request().method() === 'POST');
  await page.locator('.rfw-submit').click();
  const response = await responsePromise;
  assert.equal(response.status(), 201, 'the real feedback API must accept the report');
  await page.locator('.rfw-msg').filter({ hasText: 'נשלח, תודה!' }).waitFor();

  const records = readFileSync(feedbackFile, 'utf8').split('\n').filter(Boolean).map(line => JSON.parse(line));
  const submitted = records.find(item => item.message === reportMessage);
  assert.ok(submitted, 'the isolated feedback backend must persist the report');
  assert.equal(submitted.kind, 'bug');
  assert.equal(submitted.page, '/teacher-classrooms.html');
  assert.equal(submitted.contact, 'מורת בדיקה');
  console.log(`✓ feedback button renders on ${pages.length} pages and persists the current page in isolation`);
} finally {
  try {
    if (browser) await browser.close();
  } catch {
    // Continue cleanup even if the browser process failed.
  }
  try {
    await stopServer(server);
  } catch {
    // Continue cleanup even if the server process failed.
  }
  if (isolatedRoot) rmSync(isolatedRoot, { recursive: true, force: true });
}
