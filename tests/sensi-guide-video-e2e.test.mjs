#!/usr/bin/env node
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'sensi-guide-video-'));
const port = 40000 + Math.floor(Math.random() * 5000);
const base = `http://127.0.0.1:${port}`;
const lessonVideos = new Map(
  Array.from({ length: 15 }, (_, index) => {
    const lessonId = index + 1;
    return [lessonId, Buffer.from(`sensi-lesson-${lessonId}-guide-video-fixture`)];
  }),
);

fs.copyFileSync(path.join(ROOT, 'server.js'), path.join(tempRoot, 'server.js'));
fs.copyFileSync(path.join(ROOT, 'teachers.html'), path.join(tempRoot, 'teachers.html'));
if (fs.existsSync(path.join(ROOT, 'server'))) {
  fs.cpSync(path.join(ROOT, 'server'), path.join(tempRoot, 'server'), { recursive: true });
}
fs.mkdirSync(path.join(tempRoot, 'data', 'guide-videos'), { recursive: true });
for (const [lessonId, bytes] of lessonVideos) {
  fs.writeFileSync(
    path.join(tempRoot, 'data', 'guide-videos', `sensi-lesson-${String(lessonId).padStart(2, '0')}-parent-guide.mp4`),
    bytes,
  );
}

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

  for (const [lessonId, bytes] of lessonVideos) {
    const url = `${base}/api/sensi/guide-videos/lesson-${lessonId}`;
    const start = Math.min(lessonId - 1, bytes.length - 2);
    const end = Math.min(start + 5, bytes.length - 1);
    const response = await fetch(url, { headers: { Range: `bytes=${start}-${end}` } });
    assert.equal(response.status, 206, `lesson ${lessonId} should support partial playback`);
    assert.equal(response.headers.get('content-type'), 'video/mp4');
    assert.equal(response.headers.get('accept-ranges'), 'bytes');
    assert.equal(response.headers.get('content-range'), `bytes ${start}-${end}/${bytes.length}`);
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), bytes.subarray(start, end + 1));
  }

  const lesson15HeadResponse = await fetch(`${base}/api/sensi/guide-videos/lesson-15`, { method: 'HEAD' });
  assert.equal(lesson15HeadResponse.status, 200);
  assert.equal(lesson15HeadResponse.headers.get('content-type'), 'video/mp4');
  assert.equal(lesson15HeadResponse.headers.get('accept-ranges'), 'bytes');
  assert.equal(lesson15HeadResponse.headers.get('content-length'), String(lessonVideos.get(15).length));
  assert.equal((await lesson15HeadResponse.arrayBuffer()).byteLength, 0);

  const teacherGuide = await fetch(`${base}/teachers.html`);
  assert.equal(teacherGuide.status, 402);

  console.log('Sensi guide video public playback and range E2E test passed');
} finally {
  await stopServer();
  fs.rmSync(tempRoot, { recursive: true, force: true });
}
