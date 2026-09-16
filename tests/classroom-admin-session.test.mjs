import assert from 'node:assert/strict';
import { chmodSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:net';
import { spawn } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const tempDir = mkdtempSync(join(tmpdir(), 'classroom-admin-session-'));
const deliveredMail = join(tempDir, 'delivered-mail.json');
const mailer = join(tempDir, 'capture-mailer');
writeFileSync(mailer, `#!/bin/sh\ncat > '${deliveredMail}'\n`, { mode: 0o700 });
chmodSync(mailer, 0o700);

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
  throw new Error('administrator session test server did not start');
}

const port = await freePort();
const baseUrl = `http://127.0.0.1:${port}`;
const child = spawn(process.execPath, ['server.js'], {
  cwd: root,
  env: {
    ...process.env,
    PORT: String(port),
    ROBOTICS_DB_FILE: join(tempDir, 'admin-session.sqlite'),
    ROBOTICS_CLASSROOM_ADMIN_EMAIL: 'owner@example.test',
    ROBOTICS_TEACHER_INVITE_CODE: '',
    ROBOTICS_CLASSROOM_ADMIN_CODE: '',
    ROBOTICS_SUBSCRIPTION_GATE: '1',
    ROBOTICS_CREDENTIAL_MAILER: mailer,
    NODE_ENV: 'production',
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});

try {
  await waitForServer(baseUrl);
  const retiredLogin = await fetch(`${baseUrl}/api/classroom/admin-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: 'production-cookie-admin-code' }),
  });
  assert.equal(retiredLogin.status, 410);
  assert.equal(retiredLogin.headers.get('set-cookie'), null);

  const accessRequest = await fetch(`${baseUrl}/api/classroom/admin-access/request`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'owner@example.test' }),
  });
  assert.equal(accessRequest.status, 202);
  for (let attempt = 0; attempt < 100 && !existsSync(deliveredMail); attempt += 1) {
    await new Promise(resolve => setTimeout(resolve, 20));
  }
  assert.equal(existsSync(deliveredMail), true, 'production mailer must receive the administrator challenge');
  const delivered = JSON.parse(readFileSync(deliveredMail, 'utf8'));
  const redemption = await fetch(`${baseUrl}/api/classroom/admin-access/redeem`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'owner@example.test', code: delivered.code }),
  });
  assert.equal(redemption.status, 200);
  const cookie = redemption.headers.get('set-cookie') || '';
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /SameSite=Strict/);
  assert.match(cookie, /; Secure/);
  console.log('✓ production administrator redemption issues a Secure HttpOnly strict cookie');
  console.log('✓ production starts with one configured identity and legacy shared login cannot issue a cookie');
} finally {
  if (child.exitCode === null && child.signalCode === null) {
    child.kill('SIGTERM');
    await new Promise((resolve) => child.once('exit', resolve));
  }
  rmSync(tempDir, { recursive: true, force: true });
}
