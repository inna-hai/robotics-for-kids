#!/usr/bin/env node
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'robotics-fresh-db-'));
const port = 35000 + Math.floor(Math.random() * 5000);
const base = `http://127.0.0.1:${port}`;
const email = 'fresh-db-test@example.invalid';
const password = 'Temporary-Check-123!';
const childPin = '2468';
fs.copyFileSync(path.join(ROOT, 'server.js'), path.join(tempRoot, 'server.js'));
fs.cpSync(path.join(ROOT, 'server'), path.join(tempRoot, 'server'), { recursive: true });

let child;
let logs = '';

function startServer() {
  logs = '';
  const processHandle = spawn(process.execPath, ['server.js'], {
    cwd: tempRoot,
    env: { ...process.env, PORT: String(port), NODE_PATH: path.join(ROOT, 'node_modules') },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  processHandle.stdout.on('data', chunk => { logs += chunk.toString(); });
  processHandle.stderr.on('data', chunk => { logs += chunk.toString(); });
  return processHandle;
}

async function stopServer() {
  if (!child || child.exitCode !== null) return;
  child.kill('SIGTERM');
  await new Promise(resolve => child.once('exit', resolve));
}

async function waitForServer() {
  const deadline = Date.now() + 8000;
  while (Date.now() < deadline) {
    try {
      await fetch(`${base}/`);
      return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error(`Server did not start:\n${logs}`);
}

async function request(route, { method = 'GET', token = '', body } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers['content-type'] = 'application/json';
  const response = await fetch(`${base}${route}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  return { response, body: await response.json() };
}

try {
  child = startServer();
  await waitForServer();

  const registration = await request('/api/summer/register', {
    method: 'POST',
    body: {
      parentName: 'בדיקת מערכת',
      studentName: 'ילד בדיקה',
      phone: '0000000000',
      email,
      password,
      confirmPassword: password,
    },
  });
  assert.equal(registration.response.status, 201, `registration failed: ${JSON.stringify(registration.body)}\n${logs}`);
  assert.equal(registration.body.mode, 'parent');
  assert.ok(registration.body.token);
  assert.ok(fs.existsSync(path.join(tempRoot, 'data', 'summer-subscriptions.sqlite')));

  const parentLogin = await request('/api/summer/login', {
    method: 'POST',
    body: { email, password },
  });
  assert.equal(parentLogin.response.status, 200, `parent login failed: ${JSON.stringify(parentLogin.body)}`);
  assert.equal(parentLogin.body.mode, 'parent');

  const addedChild = await request('/api/summer/children', {
    method: 'POST',
    token: parentLogin.body.token,
    body: { name: 'ילדת התקדמות', pin: childPin },
  });
  assert.equal(addedChild.response.status, 201, `child creation failed: ${JSON.stringify(addedChild.body)}`);
  assert.ok(addedChild.body.child?.accessCode);

  const childLogin = await request('/api/summer/child-login', {
    method: 'POST',
    body: { accessCode: addedChild.body.child.accessCode, pin: childPin },
  });
  assert.equal(childLogin.response.status, 200, `child login failed: ${JSON.stringify(childLogin.body)}`);
  assert.equal(childLogin.body.mode, 'child');

  const saved = await request('/api/progress', {
    method: 'POST',
    token: childLogin.body.token,
    body: {
      courseId: 'sisi',
      lessonId: 'space',
      activityId: 'mission-1',
      status: 'completed',
      score: 93,
      metadata: { source: 'fresh-database-e2e' },
    },
  });
  assert.equal(saved.response.status, 200, `progress save failed: ${JSON.stringify(saved.body)}\n${logs}`);
  assert.equal(saved.body.progress.status, 'completed');
  assert.equal(saved.body.progress.score, 93);

  await stopServer();
  child = startServer();
  await waitForServer();

  const childLoginAfterRestart = await request('/api/summer/child-login', {
    method: 'POST',
    body: { accessCode: addedChild.body.child.accessCode, pin: childPin },
  });
  assert.equal(childLoginAfterRestart.response.status, 200, `child login after restart failed: ${JSON.stringify(childLoginAfterRestart.body)}\n${logs}`);

  const progress = await request('/api/progress?courseId=sisi&lessonId=space', {
    token: childLoginAfterRestart.body.token,
  });
  assert.equal(progress.response.status, 200, `progress read failed: ${JSON.stringify(progress.body)}`);
  assert.equal(progress.body.progress.length, 1);
  const [savedProgress] = progress.body.progress;
  assert.equal(savedProgress.courseId, 'sisi');
  assert.equal(savedProgress.lessonId, 'space');
  assert.equal(savedProgress.activityId, 'mission-1');
  assert.equal(savedProgress.status, 'completed');
  assert.equal(savedProgress.score, 93);
  assert.equal(savedProgress.attempts, 1);
  assert.deepEqual(savedProgress.metadata, { source: 'fresh-database-e2e' });

  console.log('fresh database auth and progress E2E test passed');
} finally {
  await stopServer();
  fs.rmSync(tempRoot, { recursive: true, force: true });
}
