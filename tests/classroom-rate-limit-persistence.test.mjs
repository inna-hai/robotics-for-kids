import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:net';
import { spawn } from 'node:child_process';
import Database from 'better-sqlite3';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = mkdtempSync(join(tmpdir(), 'classroom-rate-limit-'));
const dbPath = join(dir, 'db.sqlite');
const freePort = () => new Promise((resolve, reject) => {
  const server = createServer();
  server.once('error', reject);
  server.listen(0, '127.0.0.1', () => {
    const { port } = server.address();
    server.close(() => resolve(port));
  });
});

async function startServer() {
  const port = await freePort();
  const base = `http://127.0.0.1:${port}`;
  const child = spawn(process.execPath, ['server.js'], {
    cwd: root,
    env: { ...process.env, NODE_ENV: 'test', PORT: String(port), ROBOTICS_DATA_DIR: dir,
      ROBOTICS_DB_FILE: dbPath, ROBOTICS_CLASSROOM_ADMIN_EMAIL: 'owner@example.test' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let stderr = '';
  child.stderr.on('data', chunk => { stderr += chunk; });
  for (let attempt = 0; attempt < 200; attempt += 1) {
    if (child.exitCode !== null) throw new Error(`server exited: ${stderr}`);
    try { if ((await fetch(`${base}/api/classroom/admin-me`)).ok) return { child, base }; } catch {}
    await new Promise(resolve => setTimeout(resolve, 25));
  }
  throw new Error(`server not ready: ${stderr}`);
}

async function stopServer(child) {
  if (child.exitCode === null) child.kill('SIGTERM');
  await new Promise(resolve => child.exitCode === null ? child.once('exit', resolve) : resolve());
}

async function failedLogin(base) {
  return fetch(`${base}/api/classroom/teacher-login`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'persistent-limit@example.test', password: 'wrong' }),
  });
}

let server;
try {
  server = await startServer();
  for (let attempt = 0; attempt < 10; attempt += 1) {
    assert.equal((await failedLogin(server.base)).status, 401);
  }
  const beforeRestart = new Database(dbPath, { readonly: true });
  assert.deepEqual(beforeRestart.prepare(`SELECT failures FROM classroom_auth_rate_limits
    WHERE limit_key = ?`).get('teacher-login:identity:persistent-limit@example.test'), { failures: 10 });
  beforeRestart.close();

  await stopServer(server.child);
  server = await startServer();
  assert.equal((await failedLogin(server.base)).status, 429,
    'rate limit must survive a real server restart and block before credential work');
  console.log('✓ credential rate limits persist atomically across restart');
} finally {
  if (server?.child) await stopServer(server.child);
  rmSync(dir, { recursive: true, force: true });
}
