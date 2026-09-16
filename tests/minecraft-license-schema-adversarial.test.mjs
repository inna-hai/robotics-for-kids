import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import Database from 'better-sqlite3';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

async function assertMalformedSchemaFailsBeforeDdl(name, tableDdl, expectedError) {
  const tempDir = mkdtempSync(join(tmpdir(), `minecraft-${name}-schema-`));
  const dbFile = join(tempDir, 'malformed.sqlite');
  try {
    const db = new Database(dbFile);
    db.exec(`
      ${tableDdl}
      CREATE TABLE startup_sentinel (value BLOB NOT NULL);
      INSERT INTO startup_sentinel (value) VALUES (X'001122FF');
    `);
    const before = db.prepare("SELECT type, name, sql FROM sqlite_master WHERE sql IS NOT NULL ORDER BY type, name").all();
    const sentinelBefore = db.prepare("SELECT typeof(value) AS type, hex(value) AS hex FROM startup_sentinel").get();
    db.close();

    const child = spawn(process.execPath, ['server.js'], {
      cwd: root,
      env: {
        ...process.env,
        PORT: '0',
        ROBOTICS_DB_FILE: dbFile,
        ROBOTICS_CLASSROOM_ADMIN_EMAIL: 'owner@example.test',
        ROBOTICS_CLASSROOM_ADMIN_CODE: '',
        ROBOTICS_TEACHER_INVITE_CODE: '',
        NODE_ENV: 'test',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stderr = '';
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    const exitCode = await new Promise((resolve) => child.once('exit', resolve));
    assert.notEqual(exitCode, 0);
    assert.match(stderr, expectedError);

    const afterDb = new Database(dbFile, { readonly: true });
    const after = afterDb.prepare("SELECT type, name, sql FROM sqlite_master WHERE sql IS NOT NULL ORDER BY type, name").all();
    const sentinelAfter = afterDb.prepare("SELECT typeof(value) AS type, hex(value) AS hex FROM startup_sentinel").get();
    afterDb.close();
    assert.deepEqual(after, before);
    assert.deepEqual(sentinelAfter, sentinelBefore);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

await assertMalformedSchemaFailsBeforeDdl('identity', `
  CREATE TABLE classroom_minecraft_identities (
    student_id TEXT PRIMARY KEY NOT NULL,
    upn TEXT NOT NULL,
    player_name TEXT NOT NULL,
    status TEXT NOT NULL,
    graph_object_id TEXT NOT NULL,
    source TEXT NOT NULL,
    verified_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    credential TEXT
  );
`, /classroom_minecraft_identities schema incompatible/);

await assertMalformedSchemaFailsBeforeDdl('request', `
  CREATE TABLE classroom_minecraft_verification_requests (
    request_id TEXT PRIMARY KEY NOT NULL,
    student_id TEXT NOT NULL UNIQUE,
    actor_type TEXT NOT NULL,
    actor_id TEXT NOT NULL,
    upn TEXT NOT NULL,
    player_name TEXT NOT NULL,
    created_at TEXT NOT NULL,
    secret TEXT
  );
`, /classroom_minecraft_verification_requests schema incompatible/);

console.log('✓ malformed Minecraft identity schemas fail before DDL and preserve the database byte contract');
