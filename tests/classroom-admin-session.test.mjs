import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:net';
import { spawn } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const tempDir = mkdtempSync(join(tmpdir(), 'classroom-admin-session-'));

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
    ROBOTICS_CLASSROOM_ADMIN_CODE: 'production-cookie-admin-code',
    ROBOTICS_TEACHER_INVITE_CODE: 'production-cookie-invite',
    ROBOTICS_SUBSCRIPTION_GATE: '1',
    NODE_ENV: 'production',
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});

try {
  await waitForServer(baseUrl);
  const validLogin = await fetch(`${baseUrl}/api/classroom/admin-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: 'production-cookie-admin-code' }),
  });
  assert.equal(validLogin.status, 200);
  const cookie = validLogin.headers.get('set-cookie') || '';
  assert.match(cookie, /^haiTechClassroomAdminToken=/);
  assert.match(cookie, /; HttpOnly/i);
  assert.match(cookie, /; SameSite=Strict/i);
  assert.match(cookie, /; Secure/i);
  assert.doesNotMatch(cookie, /haiTechClassroomToken=/);

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const wrong = await fetch(`${baseUrl}/api/classroom/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'wrong-code' }),
    });
    assert.equal(wrong.status, 401);
  }
  const lockedWrong = await fetch(`${baseUrl}/api/classroom/admin-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: 'wrong-code' }),
  });
  assert.equal(lockedWrong.status, 429);
  const lockedCorrect = await fetch(`${baseUrl}/api/classroom/admin-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: 'production-cookie-admin-code' }),
  });
  assert.equal(lockedCorrect.status, 429, 'a correct code must not bypass an active administrator lockout');
  console.log('✓ administrator login lockout and production cookie attributes are enforced');
} finally {
  if (child.exitCode === null && child.signalCode === null) {
    child.kill('SIGTERM');
    await new Promise((resolve) => child.once('exit', resolve));
  }
  rmSync(tempDir, { recursive: true, force: true });
}
