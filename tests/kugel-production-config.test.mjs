import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const freePort = () => new Promise((resolve, reject) => {
  const server = createServer();
  server.once('error', reject);
  server.listen(0, '127.0.0.1', () => {
    const { port } = server.address();
    server.close(() => resolve(port));
  });
});
const waitForExit = child => Promise.race([
  new Promise(resolve => child.once('exit', code => resolve({ code }))),
  new Promise(resolve => setTimeout(() => resolve({ running: true }), 1500)),
]);
const waitForServer = async baseUrl => {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(baseUrl, { headers: { 'X-Forwarded-Proto': 'https' } });
      if (response.status) return response;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 25));
  }
  throw new Error('production-like server did not start');
};

const dir = mkdtempSync(join(tmpdir(), 'kugel-production-config-'));
const baseEnv = {
  ...process.env,
  NODE_ENV: 'production',
  ROBOTICS_DATA_DIR: dir,
  ROBOTICS_DB_FILE: join(dir, 'db.sqlite'),
  ROBOTICS_CLASSROOM_ADMIN_EMAIL: 'owner@example.test',
  ROBOTICS_CLASSROOM_ADMIN_CODE: '',
  ROBOTICS_TEACHER_INVITE_CODE: '',
  KUGEL_MONITOR_API_URL: 'https://monitor.example.test',
  KUGEL_MONITOR_EXPECTED_HOST: 'MONITOR.EXAMPLE.TEST.',
  KUGEL_MONITOR_SERVER_NAME: 'production-like-monitor',
  KUGEL_MINECRAFT_INTERNAL_TOKEN: 'production-like-secret-at-least-32-bytes',
  KUGEL_MINECRAFT_SERVER_NAME: 'Minecraft Education',
  KUGEL_MINECRAFT_SERVER_HOST: 'minecraft.example.test',
  KUGEL_MINECRAFT_SERVER_PORT: '19132',
  KUGEL_MINECRAFT_SERVER_ID: 'server-id',
  KUGEL_MINECRAFT_ACCESS_CODE: 'access-code',
};

let missingProxy;
let configured;
try {
  const missingPort = await freePort();
  missingProxy = spawn(process.execPath, ['server.js'], {
    cwd: root,
    env: { ...baseEnv, PORT: String(missingPort), ROBOTICS_HTTPS_REVERSE_PROXY: '' },
    stdio: ['ignore', 'ignore', 'pipe'],
  });
  let missingError = '';
  missingProxy.stderr.on('data', chunk => { missingError += chunk; });
  const missingResult = await waitForExit(missingProxy);
  if (missingResult.running) missingProxy.kill('SIGTERM');
  assert.notEqual(missingResult.running, true,
    'production Kugel configuration must fail preflight when the HTTPS reverse proxy dependency is absent');
  assert.match(missingError, /HTTPS reverse proxy/i);

  const configuredPort = await freePort();
  configured = spawn(process.execPath, ['server.js'], {
    cwd: root,
    env: { ...baseEnv, PORT: String(configuredPort), ROBOTICS_HTTPS_REVERSE_PROXY: '1' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const baseUrl = `http://127.0.0.1:${configuredPort}/index.html`;
  const proxied = await waitForServer(baseUrl);
  assert.notEqual(proxied.status, 426, 'a production-like request marked HTTPS by the loopback proxy is accepted');
  const direct = await fetch(baseUrl);
  assert.equal(direct.status, 426,
    'the production app behind the proxy must reject direct plaintext requests instead of relaxing HTTPS');
  console.log('✓ production Kugel preflight requires an HTTPS loopback reverse proxy');
} finally {
  for (const child of [missingProxy, configured]) {
    if (child && child.exitCode === null && child.signalCode === null) {
      child.kill('SIGTERM');
      await new Promise(resolve => child.once('exit', resolve));
    }
  }
  rmSync(dir, { recursive: true, force: true });
}
