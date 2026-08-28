#!/usr/bin/env node
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCRIPT = path.join(ROOT, 'scripts', 'backup_sqlite.py');
const scriptSource = fs.readFileSync(SCRIPT, 'utf8');
const checksumPublishIndex = scriptSource.indexOf('os.replace(checksum_temp, checksum_path)');
const directorySyncIndex = scriptSource.indexOf('fsync_directory(backup_dir)', checksumPublishIndex);
const databasePublishIndex = scriptSource.indexOf('os.replace(temp_path, final_path)');
assert.ok(checksumPublishIndex >= 0 && directorySyncIndex > checksumPublishIndex && databasePublishIndex > directorySyncIndex,
  'checksum publication must be directory-fsynced before the database is published');
const pruneStart = scriptSource.indexOf('def prune_backups');
const pruneEnd = scriptSource.indexOf('\n\ndef run(', pruneStart);
const pruneSource = scriptSource.slice(pruneStart, pruneEnd);
const retentionDatabaseDelete = pruneSource.indexOf('old_backup.unlink');
const retentionDatabaseSync = pruneSource.indexOf('fsync_directory(backup_dir)', retentionDatabaseDelete);
const retentionChecksumDelete = pruneSource.indexOf('old_backup.with_name', retentionDatabaseDelete);
const retentionChecksumSync = pruneSource.indexOf('fsync_directory(backup_dir)', retentionChecksumDelete);
assert.ok(retentionDatabaseDelete >= 0 && retentionDatabaseSync > retentionDatabaseDelete
  && retentionChecksumDelete > retentionDatabaseSync && retentionChecksumSync > retentionChecksumDelete,
  'retention must persist database deletion before deleting and persisting its checksum');
const ensureDirectoryStart = scriptSource.indexOf('def ensure_backup_directory');
const ensureDirectoryEnd = scriptSource.indexOf('\n\ndef ', ensureDirectoryStart + 1);
const ensureDirectorySource = scriptSource.slice(ensureDirectoryStart, ensureDirectoryEnd);
const directoryCreateIndex = ensureDirectorySource.indexOf('directory.mkdir');
const createdDirectorySyncIndex = ensureDirectorySource.indexOf('fsync_directory(directory)', directoryCreateIndex);
const parentDirectorySyncIndex = ensureDirectorySource.indexOf('fsync_directory(directory.parent)', createdDirectorySyncIndex);
assert.ok(ensureDirectoryStart >= 0 && directoryCreateIndex >= 0
  && createdDirectorySyncIndex > directoryCreateIndex && parentDirectorySyncIndex > createdDirectorySyncIndex,
  'new backup directories and their parent entries must be fsynced before use');
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'robotics-sqlite-backup-'));
const source = path.join(tempRoot, 'summer-subscriptions.sqlite');
const backupRoot = path.join(tempRoot, 'nested');
const backupProjectDir = path.join(backupRoot, 'robotics-for-kids');
const backupDir = path.join(backupProjectDir, 'sqlite');

function spawnBackup(retention = 2) {
  const previousUmask = process.umask(0o000);
  try {
    return spawnSync('python3', [
      SCRIPT,
      '--source', source,
      '--backup-dir', backupDir,
      '--retention', String(retention),
    ], { encoding: 'utf8' });
  } finally {
    process.umask(previousUmask);
  }
}

function runBackup(retention = 2) {
  const result = spawnBackup(retention);
  assert.equal(result.status, 0, `backup failed:\nstdout=${result.stdout}\nstderr=${result.stderr}`);
  return JSON.parse(result.stdout.trim());
}

function runPythonSqlite(code, ...args) {
  const result = spawnSync('python3', ['-c', code, ...args], { encoding: 'utf8' });
  assert.equal(result.status, 0, `SQLite probe failed:\nstdout=${result.stdout}\nstderr=${result.stderr}`);
  return result.stdout.trim();
}

async function waitForFile(file, timeoutMs = 5000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (fs.existsSync(file)) return;
    await new Promise(resolve => setTimeout(resolve, 20));
  }
  throw new Error(`Timed out waiting for ${file}`);
}

let walWriter = null;
const walReady = path.join(tempRoot, 'wal-ready');
const walStop = path.join(tempRoot, 'wal-stop');

try {
  runPythonSqlite(
    "import sqlite3,sys; c=sqlite3.connect(sys.argv[1]); c.executescript(\"CREATE TABLE learners (id INTEGER PRIMARY KEY, name TEXT NOT NULL); INSERT INTO learners (name) VALUES ('first learner');\"); c.commit(); c.close()",
    source,
  );

  let walStderr = '';
  walWriter = spawn('python3', ['-c',
    "import pathlib,sqlite3,sys,time; c=sqlite3.connect(sys.argv[1]); c.execute('PRAGMA journal_mode=WAL'); c.execute('CREATE TABLE wal_proof (value TEXT NOT NULL)'); c.execute(\"INSERT INTO wal_proof VALUES ('committed while connection open')\"); c.commit(); pathlib.Path(sys.argv[2]).write_text('ready'); stop=pathlib.Path(sys.argv[3]);\nwhile not stop.exists(): time.sleep(0.02)\nc.close()",
    source, walReady, walStop,
  ], { stdio: ['ignore', 'ignore', 'pipe'] });
  walWriter.stderr.on('data', chunk => { walStderr += chunk; });
  const walExit = new Promise(resolve => walWriter.once('exit', (code, signal) => resolve({ code, signal })));
  await waitForFile(walReady);
  assert.ok(fs.existsSync(`${source}-wal`), 'source should have an active WAL during backup');

  const first = runBackup();
  fs.writeFileSync(walStop, 'stop');
  const walOutcome = await walExit;
  assert.deepEqual(walOutcome, { code: 0, signal: null }, `WAL writer failed: ${walStderr}`);
  walWriter = null;
  assert.equal(first.status, 'created');
  assert.equal(first.integrity, 'ok');
  assert.equal(first.retention, 2);
  assert.ok(fs.existsSync(first.backup));
  assert.ok(fs.existsSync(`${first.backup}.sha256`));
  assert.equal(fs.statSync(first.backup).mode & 0o777, 0o600);
  assert.equal(fs.statSync(`${first.backup}.sha256`).mode & 0o777, 0o600);
  assert.equal(fs.statSync(backupDir).mode & 0o777, 0o700);
  assert.equal(fs.statSync(backupProjectDir).mode & 0o777, 0o700);
  assert.equal(fs.statSync(backupRoot).mode & 0o777, 0o700);
  assert.match(first.sha256, /^[a-f0-9]{64}$/);
  const independentlyComputedHash = createHash('sha256').update(fs.readFileSync(first.backup)).digest('hex');
  assert.equal(first.sha256, independentlyComputedHash);
  assert.equal(fs.readFileSync(`${first.backup}.sha256`, 'utf8'), `${independentlyComputedHash}  ${path.basename(first.backup)}\n`);

  const firstProbe = JSON.parse(runPythonSqlite(
    "import json,sqlite3,sys; c=sqlite3.connect(f'file:{sys.argv[1]}?mode=ro',uri=True); print(json.dumps({'integrity':c.execute('PRAGMA integrity_check').fetchone()[0],'names':[r[0] for r in c.execute('SELECT name FROM learners ORDER BY id')],'walProof':c.execute('SELECT value FROM wal_proof').fetchone()[0]})); c.close()",
    first.backup,
  ));
  assert.deepEqual(firstProbe, {
    integrity: 'ok',
    names: ['first learner'],
    walProof: 'committed while connection open',
  });

  runPythonSqlite(
    "import sqlite3,sys; c=sqlite3.connect(sys.argv[1]); c.execute(\"INSERT INTO learners (name) VALUES ('second learner')\"); c.commit(); c.close()",
    source,
  );

  const manualDatabase = path.join(backupDir, 'summer-subscriptions-00000000-manual.sqlite');
  const manualChecksum = `${manualDatabase}.sha256`;
  fs.writeFileSync(manualDatabase, 'manually preserved database');
  fs.writeFileSync(manualChecksum, 'manual checksum');
  const orphanChecksum = path.join(backupDir, 'summer-subscriptions-00000000T000000000000Z.sqlite.sha256');
  fs.writeFileSync(orphanChecksum, 'orphan');
  const staleBase = `.summer-subscriptions-20260828T000000000000Z.sqlite.${'deadbeef'.repeat(4)}.tmp`;
  const staleArtifacts = [staleBase, `${staleBase}-journal`, `${staleBase}-wal`, `${staleBase}-shm`, `${staleBase.replace(/\.tmp$/, '.sha256.tmp')}`];
  const manualHiddenTemp = '.summer-subscriptions-20260828T000000000000Z.sqlite.deadbeef.tmp';
  fs.writeFileSync(path.join(backupDir, manualHiddenTemp), 'manual hidden file');
  for (const artifact of staleArtifacts) {
    fs.writeFileSync(path.join(backupDir, artifact), 'stale');
  }
  runBackup();
  assert.ok(fs.existsSync(manualDatabase), 'retention must not delete a similarly prefixed manual database');
  assert.ok(fs.existsSync(manualChecksum), 'retention must not delete a manual database checksum');
  assert.ok(fs.existsSync(path.join(backupDir, manualHiddenTemp)), 'stale cleanup must preserve near-match manual hidden files');
  assert.ok(!fs.existsSync(orphanChecksum), 'orphan checksum should be removed on the next successful run');
  for (const artifact of staleArtifacts) {
    assert.ok(!fs.existsSync(path.join(backupDir, artifact)), `stale backup artifact should be removed: ${artifact}`);
  }

  const latest = runBackup();
  const backups = fs.readdirSync(backupDir)
    .filter(name => /^summer-subscriptions-\d{8}T\d{12}Z\.sqlite$/.test(name))
    .sort();
  assert.equal(backups.length, 2, 'retention should keep exactly the newest two backups');
  assert.equal(latest.deleted.length, 1);
  for (const backup of backups) {
    assert.ok(fs.existsSync(path.join(backupDir, `${backup}.sha256`)), 'every published backup must have a checksum');
  }
  assert.ok(!fs.existsSync(first.backup), 'oldest backup should be deleted');
  assert.ok(!fs.existsSync(`${first.backup}.sha256`), 'oldest checksum should be deleted with its backup');

  const restored = path.join(tempRoot, 'restored.sqlite');
  fs.copyFileSync(latest.backup, restored);
  const restoredProbe = JSON.parse(runPythonSqlite(
    "import json,sqlite3,sys; c=sqlite3.connect(f'file:{sys.argv[1]}?mode=ro',uri=True); print(json.dumps({'integrity':c.execute('PRAGMA integrity_check').fetchone()[0],'names':[r[0] for r in c.execute('SELECT name FROM learners ORDER BY id')],'walProof':c.execute('SELECT value FROM wal_proof').fetchone()[0]})); c.close()",
    restored,
  ));
  assert.deepEqual(restoredProbe, {
    integrity: 'ok',
    names: ['first learner', 'second learner'],
    walProof: 'committed while connection open',
  });

  const lockPath = path.join(backupDir, '.backup.lock');
  const protectedTarget = path.join(tempRoot, 'must-not-be-touched.txt');
  fs.rmSync(lockPath);
  fs.writeFileSync(protectedTarget, 'unchanged', { mode: 0o644 });
  fs.symlinkSync(protectedTarget, lockPath);
  const symlinkAttempt = spawnBackup();
  assert.notEqual(symlinkAttempt.status, 0, 'backup must reject a symlink lock file');
  assert.equal(fs.readFileSync(protectedTarget, 'utf8'), 'unchanged');
  assert.equal(fs.statSync(protectedTarget).mode & 0o777, 0o644);

  fs.rmSync(lockPath);
  runPythonSqlite("import os,sys; os.mkfifo(sys.argv[1])", lockPath);
  const fifoAttempt = spawnBackup();
  assert.notEqual(fifoAttempt.status, 0, 'backup must reject a non-regular lock file');

  console.log('SQLite backup, retention and restore test passed');
} finally {
  if (walWriter && walWriter.exitCode === null) {
    await new Promise(resolve => {
      walWriter.once('exit', resolve);
      walWriter.kill('SIGKILL');
      setTimeout(resolve, 1000);
    });
  }
  fs.rmSync(tempRoot, { recursive: true, force: true });
}
