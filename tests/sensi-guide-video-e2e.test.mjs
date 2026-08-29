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
const lesson2VideoBytes = Buffer.from('sensi-lesson-2-guide-video-fixture');
const lesson3VideoBytes = Buffer.from('sensi-lesson-3-guide-video-fixture');
const lesson4VideoBytes = Buffer.from('sensi-lesson-4-guide-video-fixture');
const lesson5VideoBytes = Buffer.from('sensi-lesson-5-guide-video-fixture');
const lesson6VideoBytes = Buffer.from('sensi-lesson-6-guide-video-fixture');
const lesson7VideoBytes = Buffer.from('sensi-lesson-7-guide-video-fixture');

fs.copyFileSync(path.join(ROOT, 'server.js'), path.join(tempRoot, 'server.js'));
fs.copyFileSync(path.join(ROOT, 'teachers.html'), path.join(tempRoot, 'teachers.html'));
fs.cpSync(path.join(ROOT, 'server'), path.join(tempRoot, 'server'), { recursive: true });
fs.mkdirSync(path.join(tempRoot, 'data', 'guide-videos'), { recursive: true });
fs.writeFileSync(path.join(tempRoot, 'data', 'guide-videos', 'sensi-lesson-01-parent-guide.mp4'), videoBytes);
fs.writeFileSync(path.join(tempRoot, 'data', 'guide-videos', 'sensi-lesson-02-parent-guide.mp4'), lesson2VideoBytes);
fs.writeFileSync(path.join(tempRoot, 'data', 'guide-videos', 'sensi-lesson-03-parent-guide.mp4'), lesson3VideoBytes);
fs.writeFileSync(path.join(tempRoot, 'data', 'guide-videos', 'sensi-lesson-04-parent-guide.mp4'), lesson4VideoBytes);
fs.writeFileSync(path.join(tempRoot, 'data', 'guide-videos', 'sensi-lesson-05-parent-guide.mp4'), lesson5VideoBytes);
fs.writeFileSync(path.join(tempRoot, 'data', 'guide-videos', 'sensi-lesson-06-parent-guide.mp4'), lesson6VideoBytes);
fs.writeFileSync(path.join(tempRoot, 'data', 'guide-videos', 'sensi-lesson-07-parent-guide.mp4'), lesson7VideoBytes);

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
  const lesson2VideoUrl = `${base}/api/sensi/guide-videos/lesson-2`;
  const lesson3VideoUrl = `${base}/api/sensi/guide-videos/lesson-3`;
  const lesson4VideoUrl = `${base}/api/sensi/guide-videos/lesson-4`;
  const lesson5VideoUrl = `${base}/api/sensi/guide-videos/lesson-5`;
  const lesson6VideoUrl = `${base}/api/sensi/guide-videos/lesson-6`;
  const lesson7VideoUrl = `${base}/api/sensi/guide-videos/lesson-7`;
  assert.equal((await fetch(videoUrl)).status, 401, 'anonymous viewers must not receive the guide video');
  assert.equal((await fetch(lesson2VideoUrl)).status, 401, 'anonymous viewers must not receive the lesson 2 guide video');
  assert.equal((await fetch(lesson3VideoUrl)).status, 401, 'anonymous viewers must not receive the lesson 3 guide video');
  assert.equal((await fetch(lesson4VideoUrl)).status, 401, 'anonymous viewers must not receive the lesson 4 guide video');
  assert.equal((await fetch(lesson5VideoUrl)).status, 401, 'anonymous viewers must not receive the lesson 5 guide video');
  assert.equal((await fetch(lesson6VideoUrl)).status, 401, 'anonymous viewers must not receive the lesson 6 guide video');
  assert.equal((await fetch(lesson7VideoUrl)).status, 401, 'anonymous viewers must not receive the lesson 7 guide video');
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
  assert.equal((await fetch(lesson4VideoUrl, { headers: authHeaders })).status, 403, 'trial viewers must not receive the lesson 4 guide video');
  assert.equal((await fetch(lesson5VideoUrl, { headers: authHeaders })).status, 403, 'trial viewers must not receive the lesson 5 guide video');
  assert.equal((await fetch(lesson6VideoUrl, { headers: authHeaders })).status, 403, 'trial viewers must not receive the lesson 6 guide video');
  assert.equal((await fetch(lesson7VideoUrl, { headers: authHeaders })).status, 403, 'trial viewers must not receive the lesson 7 guide video');

  const db = new Database(path.join(tempRoot, 'data', 'summer-subscriptions.sqlite'));
  db.prepare("UPDATE summer_children SET subscription_status = 'active', access_json = ?").run(JSON.stringify(['restrict:sensi-city']));
  db.close();

  const rangeResponse = await fetch(videoUrl, { headers: { ...authHeaders, Range: 'bytes=0-4' } });
  assert.equal(rangeResponse.status, 206);
  assert.equal(rangeResponse.headers.get('content-type'), 'video/mp4');
  assert.equal(rangeResponse.headers.get('accept-ranges'), 'bytes');
  assert.equal(rangeResponse.headers.get('content-range'), `bytes 0-4/${videoBytes.length}`);
  assert.deepEqual(Buffer.from(await rangeResponse.arrayBuffer()), videoBytes.subarray(0, 5));

  const lesson2RangeResponse = await fetch(lesson2VideoUrl, { headers: { ...authHeaders, Range: 'bytes=1-6' } });
  assert.equal(lesson2RangeResponse.status, 206);
  assert.equal(lesson2RangeResponse.headers.get('content-range'), `bytes 1-6/${lesson2VideoBytes.length}`);
  assert.deepEqual(Buffer.from(await lesson2RangeResponse.arrayBuffer()), lesson2VideoBytes.subarray(1, 7));

  const lesson3RangeResponse = await fetch(lesson3VideoUrl, { headers: { ...authHeaders, Range: 'bytes=2-8' } });
  assert.equal(lesson3RangeResponse.status, 206);
  assert.equal(lesson3RangeResponse.headers.get('content-range'), `bytes 2-8/${lesson3VideoBytes.length}`);
  assert.deepEqual(Buffer.from(await lesson3RangeResponse.arrayBuffer()), lesson3VideoBytes.subarray(2, 9));

  const lesson4RangeResponse = await fetch(lesson4VideoUrl, { headers: { ...authHeaders, Range: 'bytes=3-9' } });
  assert.equal(lesson4RangeResponse.status, 206);
  assert.equal(lesson4RangeResponse.headers.get('content-range'), `bytes 3-9/${lesson4VideoBytes.length}`);
  assert.deepEqual(Buffer.from(await lesson4RangeResponse.arrayBuffer()), lesson4VideoBytes.subarray(3, 10));

  const lesson5RangeResponse = await fetch(lesson5VideoUrl, { headers: { ...authHeaders, Range: 'bytes=4-10' } });
  assert.equal(lesson5RangeResponse.status, 206);
  assert.equal(lesson5RangeResponse.headers.get('content-range'), `bytes 4-10/${lesson5VideoBytes.length}`);
  assert.deepEqual(Buffer.from(await lesson5RangeResponse.arrayBuffer()), lesson5VideoBytes.subarray(4, 11));

  const lesson6RangeResponse = await fetch(lesson6VideoUrl, { headers: { ...authHeaders, Range: 'bytes=5-11' } });
  assert.equal(lesson6RangeResponse.status, 206);
  assert.equal(lesson6RangeResponse.headers.get('content-range'), `bytes 5-11/${lesson6VideoBytes.length}`);
  assert.deepEqual(Buffer.from(await lesson6RangeResponse.arrayBuffer()), lesson6VideoBytes.subarray(5, 12));

  const lesson7RangeResponse = await fetch(lesson7VideoUrl, { headers: { ...authHeaders, Range: 'bytes=6-12' } });
  assert.equal(lesson7RangeResponse.status, 206);
  assert.equal(lesson7RangeResponse.headers.get('content-range'), `bytes 6-12/${lesson7VideoBytes.length}`);
  assert.deepEqual(Buffer.from(await lesson7RangeResponse.arrayBuffer()), lesson7VideoBytes.subarray(6, 13));

  const teacherGuide = await fetch(`${base}/teachers.html`, { headers: authHeaders });
  assert.equal(teacherGuide.status, 200);
  assert.match(await teacherGuide.text(), /lesson\.guideVideo/);

  console.log('Sensi guide video authorization and range E2E test passed');
} finally {
  await stopServer();
  fs.rmSync(tempRoot, { recursive: true, force: true });
}
