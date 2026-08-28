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
fs.copyFileSync(path.join(ROOT, 'server.js'), path.join(tempRoot, 'server.js'));

const child = spawn(process.execPath, ['server.js'], {
  cwd: tempRoot,
  env: {
    ...process.env,
    PORT: String(port),
    NODE_PATH: path.join(ROOT, 'node_modules'),
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let logs = '';
child.stdout.on('data', chunk => { logs += chunk.toString(); });
child.stderr.on('data', chunk => { logs += chunk.toString(); });

async function waitForServer() {
  const deadline = Date.now() + 8000;
  while (Date.now() < deadline) {
    try {
      await fetch(`${base}/`);
      return;
    } catch {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  throw new Error(`Server did not start:\n${logs}`);
}

try {
  await waitForServer();
  const response = await fetch(`${base}/api/summer/register`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      parentName: 'בדיקת מערכת',
      studentName: 'ילד בדיקה',
      phone: '0000000000',
      email: 'fresh-db-test@example.invalid',
      password: 'Temporary-Check-123!',
      confirmPassword: 'Temporary-Check-123!',
    }),
  });
  const body = await response.json();
  assert.equal(response.status, 201, `fresh database registration failed: ${JSON.stringify(body)}\n${logs}`);
  assert.equal(body.ok, true);
  assert.equal(body.mode, 'parent');
  assert.ok(body.token);
  assert.ok(body.child?.id);
  assert.ok(fs.existsSync(path.join(tempRoot, 'data', 'summer-subscriptions.sqlite')));
  console.log('fresh database registration test passed');
} finally {
  child.kill('SIGTERM');
  await new Promise(resolve => child.once('exit', resolve));
  fs.rmSync(tempRoot, { recursive: true, force: true });
}
