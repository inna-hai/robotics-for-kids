#!/usr/bin/env node
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'sensi-guide-video-'));
const port = 40000 + Math.floor(Math.random() * 5000);
const base = `http://127.0.0.1:${port}`;
const videoBytes = Buffer.from('sensi-guide-video-fixture');

fs.copyFileSync(path.join(ROOT, 'server.js'), path.join(tempRoot, 'server.js'));
fs.copyFileSync(path.join(ROOT, 'teachers.html'), path.join(tempRoot, 'teachers.html'));
fs.cpSync(path.join(ROOT, 'server'), path.join(tempRoot, 'server'), { recursive: true });
fs.mkdirSync(path.join(tempRoot, 'data', 'guide-videos'), { recursive: true });
fs.writeFileSync(path.join(tempRoot, 'data', 'guide-videos', 'sensi-lesson-01-parent-guide.mp4'), videoBytes);

let child;
let logs = '';

async function stopServer() {
  if (!child || child.exitCode !== null) return;
  child.kill('SIGTERM');
  await new Promise(resolve => child.once('exit', resolve));
}

async function waitForServer() {
  const deadline = Date.now() + 8000;
  while (Date.now() < deadline) {
    try {
      await fetch(`${base}/teachers.html`);
      return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error(`Server did not start:\n${logs}`);
}

try {
  child = spawn(process.execPath, ['server.js'], {
    cwd: tempRoot,
    env: {
      ...process.env,
      PORT: String(port),
      NODE_PATH: path.join(ROOT, 'node_modules'),
      ROBOTICS_SUBSCRIPTION_GATE: '1',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stdout.on('data', chunk => { logs += chunk.toString(); });
  child.stderr.on('data', chunk => { logs += chunk.toString(); });
  await waitForServer();

  const videoUrl = `${base}/api/sensi/guide-videos/lesson-1`;
  assert.equal((await fetch(videoUrl)).status, 401, 'anonymous viewers must not receive the guide video');
  assert.equal((await fetch(`${base}/teachers.html`)).status, 402, 'anonymous viewers must not receive the teacher guide');

  const registration = await fetch(`${base}/api/summer/register`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      parentName: 'בדיקת סרטון',
      studentName: 'ילד בדיקה',
      phone: '0000000000',
      email: 'sensi-video@example.invalid',
      password: 'Temporary-Check-123!',
      confirmPassword: 'Temporary-Check-123!',
    }),
  });
  const registrationBody = await registration.json();
  assert.equal(registration.status, 201, `registration failed: ${JSON.stringify(registrationBody)}\n${logs}`);
  const { token } = registrationBody;
  const authHeaders = { Authorization: `Bearer ${token}` };
  assert.equal((await fetch(videoUrl, { headers: authHeaders })).status, 403, 'trial viewers must not receive the paid guide video');

  const db = new Database(path.join(tempRoot, 'data', 'summer-subscriptions.sqlite'));
  db.prepare("UPDATE summer_children SET subscription_status = 'active', access_json = ?").run(JSON.stringify(['restrict:sensi-city']));
  db.close();

  const rangeResponse = await fetch(videoUrl, { headers: { ...authHeaders, Range: 'bytes=0-4' } });
  assert.equal(rangeResponse.status, 206);
  assert.equal(rangeResponse.headers.get('content-type'), 'video/mp4');
  assert.equal(rangeResponse.headers.get('accept-ranges'), 'bytes');
  assert.equal(rangeResponse.headers.get('content-range'), `bytes 0-4/${videoBytes.length}`);
  assert.deepEqual(Buffer.from(await rangeResponse.arrayBuffer()), videoBytes.subarray(0, 5));

  const teacherGuide = await fetch(`${base}/teachers.html`, { headers: authHeaders });
  assert.equal(teacherGuide.status, 200);
  assert.match(await teacherGuide.text(), /lesson\.guideVideo/);

  console.log('Sensi guide video authorization and range E2E test passed');
} finally {
  await stopServer();
  fs.rmSync(tempRoot, { recursive: true, force: true });
}
