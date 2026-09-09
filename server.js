#!/usr/bin/env node
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const net = require('net');
const tls = require('tls');
const Database = require('better-sqlite3');

const ROOT = __dirname;

function loadLocalEnvFile(filename) {
  const envPath = path.join(ROOT, filename);
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match || process.env[match[1]] !== undefined) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[match[1]] = value;
  }
}

loadLocalEnvFile('.env');
loadLocalEnvFile('.env.local');

const PORT = Number(process.env.PORT || process.argv[2] || 3032);
const DATA_DIR = path.join(ROOT, 'data');
const ATTACHMENTS_DIR = path.join(DATA_DIR, 'feedback-attachments');
const FEEDBACK_FILE = path.join(DATA_DIR, 'feedback.jsonl');
const CRAFTOM_EXIT_ATTACHMENTS_DIR = path.join(DATA_DIR, 'craftom-exit-ticket-attachments');
const CRAFTOM_EXIT_TICKETS_FILE = path.join(DATA_DIR, 'craftom-exit-tickets.jsonl');
const ADMIN_TOKEN_FILE = path.join(DATA_DIR, 'admin-token.txt');
const SUMMER_USERS_FILE = path.join(DATA_DIR, 'summer-users.json');
const SUMMER_DB_FILE = process.env.ROBOTICS_DB_FILE || path.join(DATA_DIR, 'summer-subscriptions.sqlite');
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const SUBSCRIPTION_GATE_ENABLED = process.env.ROBOTICS_SUBSCRIPTION_GATE === '1';
const CLASSROOM_COURSE_IDS = ['sensi-city', 'sisi', 'python-turtle', 'webcode', 'minecraft', 'craftom-agent'];
const CLASSROOM_COURSES = new Set(CLASSROOM_COURSE_IDS);
const CLASSROOM_LOGIN_WINDOW_MS = 10 * 60 * 1000;
const CLASSROOM_LOGIN_MAX_FAILURES = 10;
const configuredClassroomLoginMaxKeys = Number(process.env.ROBOTICS_CLASSROOM_LOGIN_MAX_KEYS || 1000);
const CLASSROOM_LOGIN_MAX_KEYS = Number.isInteger(configuredClassroomLoginMaxKeys) && configuredClassroomLoginMaxKeys >= 8
  ? Math.min(configuredClassroomLoginMaxKeys, 10000)
  : 1000;
const classroomLoginFailures = new Map();
const CLASSROOM_TEACHER_INVITE_CODE = String(process.env.ROBOTICS_TEACHER_INVITE_CODE || '');
const CLASSROOM_ADMIN_CODE = String(process.env.ROBOTICS_CLASSROOM_ADMIN_CODE || '');
const CLASSROOM_ADMIN_EMAIL = cleanEmail(process.env.ROBOTICS_CLASSROOM_ADMIN_EMAIL || process.env.ROBOTICS_ADMIN_EMAIL || '');
const MAIL_FROM = String(process.env.ROBOTICS_MAIL_FROM || process.env.SMTP_FROM || process.env.GMAIL_USER || process.env.SMTP_USER || '');
const SMTP_HOST = String(process.env.ROBOTICS_SMTP_HOST || process.env.SMTP_HOST || (process.env.GMAIL_USER ? 'smtp.gmail.com' : ''));
const SMTP_PORT = Number(process.env.ROBOTICS_SMTP_PORT || process.env.SMTP_PORT || (SMTP_HOST ? 465 : 0));
const SMTP_USER = String(process.env.ROBOTICS_SMTP_USER || process.env.SMTP_USER || process.env.GMAIL_USER || '');
const SMTP_PASS = String(process.env.ROBOTICS_SMTP_PASS || process.env.SMTP_PASS || process.env.GMAIL_PASS || '');
const SMTP_SECURE = String(process.env.ROBOTICS_SMTP_SECURE || process.env.SMTP_SECURE || (SMTP_PORT === 465 ? '1' : '')) !== '0';
const PASSWORD_RESET_TTL_MS = 15 * 60 * 1000;
const KUGEL_MONITOR_API_URL = String(process.env.KUGEL_MONITOR_API_URL || '').replace(/\/+$/, '');
const KUGEL_MONITOR_SERVER_NAME = String(process.env.KUGEL_MONITOR_SERVER_NAME || '');
const KUGEL_MINECRAFT_INTERNAL_TOKEN = String(process.env.KUGEL_MINECRAFT_INTERNAL_TOKEN || '');
const KUGEL_MINECRAFT_SERVER_NAME = String(process.env.KUGEL_MINECRAFT_SERVER_NAME || '');
const KUGEL_MINECRAFT_SERVER_HOST = String(process.env.KUGEL_MINECRAFT_SERVER_HOST || '');
const KUGEL_MINECRAFT_SERVER_PORT = String(process.env.KUGEL_MINECRAFT_SERVER_PORT || '');
const KUGEL_MINECRAFT_SERVER_ID = String(process.env.KUGEL_MINECRAFT_SERVER_ID || '');
const KUGEL_MINECRAFT_ACCESS_CODE = String(process.env.KUGEL_MINECRAFT_ACCESS_CODE || '');
const KUGEL_LESSON_ZERO_WORLD_ID = String(process.env.KUGEL_LESSON_ZERO_WORLD_ID || 'kugel-50-safe-compounds-v3-mazes-8-coins-npc-reset-caged-inner-v1-20260905');
const KUGEL_COURSE_ID = 'craftom-agent';
const KUGEL_ACTION_WINDOW_MS = 60 * 1000;
const KUGEL_EVENTS_CACHE_MS = 1000;
const kugelActionWindows = new Map();
const kugelEventCache = new Map();
const kugelMonitorMutationQueues = new Map();
const KUGEL_LESSON_ZERO = Object.freeze({
  id: 0,
  title: 'תרגול Minecraft: מבוך המטבעות',
  summary: 'תרגול פתיחה של תנועה, התמצאות, איסוף שמונה מטבעות ולחיצה על כפתור הסיום.',
  goalCoins: 8,
  worldId: KUGEL_LESSON_ZERO_WORLD_ID,
  mode: 'Adventure',
});

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
};

function send(res, status, body, type = 'application/json; charset=utf-8') {
  res.writeHead(status, {
    'Content-Type': type,
    'Cache-Control': status >= 400 ? 'no-store' : 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(body);
}

function requestUrl(req) {
  const raw = String(req.url || '/');
  const normalized = raw.startsWith('//') ? `/${raw.replace(/^\/+/, '')}` : raw;
  return new URL(normalized || '/', `http://${req.headers.host || 'localhost'}`);
}

function sendWithHeaders(res, status, body, type = 'application/json; charset=utf-8', extraHeaders = {}) {
  res.writeHead(status, {
    'Content-Type': type,
    'Cache-Control': status >= 400 ? 'no-store' : 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...extraHeaders,
  });
  res.end(body);
}

function parseByteRange(rangeHeader, size) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(String(rangeHeader || '').trim());
  if (!match) return null;
  let start;
  let end;
  if (match[1] === '' && match[2] === '') return null;
  if (match[1] === '') {
    const suffixLength = Number(match[2]);
    if (!Number.isInteger(suffixLength) || suffixLength <= 0) return null;
    start = Math.max(size - suffixLength, 0);
    end = size - 1;
  } else {
    start = Number(match[1]);
    end = match[2] === '' ? size - 1 : Number(match[2]);
  }
  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end < start || start >= size) return null;
  return { start, end: Math.min(end, size - 1) };
}

function ensureAdminToken() {
  const configured = cleanText(process.env.FEEDBACK_ADMIN_TOKEN, 200);
  if (configured) return configured;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(ADMIN_TOKEN_FILE)) {
    fs.writeFileSync(ADMIN_TOKEN_FILE, crypto.randomBytes(24).toString('hex') + '\n', { mode: 0o600 });
  }
  return fs.readFileSync(ADMIN_TOKEN_FILE, 'utf8').trim();
}

function isAuthorized(req) {
  const url = requestUrl(req);
  const header = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
  const token = header || url.searchParams.get('token') || req.headers['x-admin-token'];
  if (!token) return false;
  const provided = Buffer.from(String(token));
  const expected = Buffer.from(ensureAdminToken());
  return provided.length === expected.length && crypto.timingSafeEqual(provided, expected);
}

function requireAdmin(req, res) {
  if (isAuthorized(req)) return true;
  send(res, 401, JSON.stringify({ error: 'Unauthorized' }));
  return false;
}

function openSummerDb() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const db = new Database(SUMMER_DB_FILE);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(`
    CREATE TABLE IF NOT EXISTS summer_users (
      id TEXT PRIMARY KEY,
      parent_name TEXT NOT NULL,
      student_name TEXT NOT NULL,
      phone TEXT DEFAULT '',
      email TEXT NOT NULL UNIQUE,
      password_salt TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      subscription_status TEXT NOT NULL DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'past_due', 'cancelled')),
      access_json TEXT NOT NULL DEFAULT '["sensi-city-lesson-1"]',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS summer_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES summer_users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      last_seen_at TEXT,
      revoked_at TEXT
    );

    CREATE TABLE IF NOT EXISTS summer_children (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES summer_users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      access_code TEXT NOT NULL UNIQUE,
      pin_salt TEXT NOT NULL,
      pin_hash TEXT NOT NULL,
      subscription_status TEXT NOT NULL DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'past_due', 'cancelled')),
      access_json TEXT NOT NULL DEFAULT '["sensi-city-lesson-1"]',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS summer_child_sessions (
      id TEXT PRIMARY KEY,
      child_id TEXT NOT NULL REFERENCES summer_children(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      last_seen_at TEXT,
      revoked_at TEXT
    );

    CREATE TABLE IF NOT EXISTS summer_subscription_events (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES summer_users(id) ON DELETE SET NULL,
      provider TEXT NOT NULL,
      provider_event_id TEXT,
      event_type TEXT NOT NULL,
      status TEXT,
      raw_json TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS student_progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES summer_users(id) ON DELETE CASCADE,
      child_id TEXT REFERENCES summer_children(id) ON DELETE CASCADE,
      course_id TEXT NOT NULL,
      lesson_id TEXT NOT NULL,
      activity_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'started' CHECK (status IN ('started', 'completed')),
      score INTEGER DEFAULT 0,
      attempts INTEGER NOT NULL DEFAULT 0,
      metadata_json TEXT NOT NULL DEFAULT '{}',
      started_at TEXT NOT NULL,
      completed_at TEXT,
      updated_at TEXT NOT NULL,
      UNIQUE(child_id, course_id, lesson_id, activity_id)
    );

    CREATE TABLE IF NOT EXISTS classroom_teachers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_salt TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS classroom_teacher_sessions (
      id TEXT PRIMARY KEY,
      teacher_id TEXT NOT NULL REFERENCES classroom_teachers(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      last_seen_at TEXT,
      revoked_at TEXT
    );

    CREATE TABLE IF NOT EXISTS classroom_admin_sessions (
      id TEXT PRIMARY KEY,
      token_hash TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      last_seen_at TEXT,
      revoked_at TEXT
    );

    CREATE TABLE IF NOT EXISTS classroom_admin_credentials (
      id TEXT PRIMARY KEY CHECK (id = 'default'),
      code_salt TEXT NOT NULL,
      code_hash TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS classroom_password_resets (
      id TEXT PRIMARY KEY,
      role TEXT NOT NULL CHECK (role IN ('admin', 'teacher')),
      identifier TEXT NOT NULL,
      target_id TEXT NOT NULL,
      code_hash TEXT NOT NULL,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      used_at TEXT
    );

    CREATE TABLE IF NOT EXISTS classroom_migrations (
      migration_key TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS teacher_courses (
      teacher_id TEXT NOT NULL REFERENCES classroom_teachers(id) ON DELETE CASCADE,
      course_id TEXT NOT NULL CHECK (course_id IN ('sensi-city', 'sisi', 'python-turtle', 'webcode', 'minecraft', 'craftom-agent')),
      created_at TEXT NOT NULL,
      PRIMARY KEY (teacher_id, course_id)
    );

    CREATE TABLE IF NOT EXISTS classrooms (
      id TEXT PRIMARY KEY,
      teacher_id TEXT NOT NULL REFERENCES classroom_teachers(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      join_code TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS classroom_courses (
      classroom_id TEXT NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
      course_id TEXT NOT NULL CHECK (course_id IN ('sensi-city', 'sisi', 'python-turtle', 'webcode', 'minecraft', 'craftom-agent')),
      created_at TEXT NOT NULL,
      PRIMARY KEY (classroom_id, course_id)
    );

    CREATE TABLE IF NOT EXISTS classroom_students (
      id TEXT PRIMARY KEY,
      classroom_id TEXT NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      login_salt TEXT NOT NULL,
      login_hash TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS classroom_student_sessions (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES classroom_students(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      last_seen_at TEXT,
      revoked_at TEXT
    );

    CREATE TABLE IF NOT EXISTS classroom_progress (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES classroom_students(id) ON DELETE CASCADE,
      course_id TEXT NOT NULL,
      lesson_id TEXT NOT NULL,
      activity_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'started' CHECK (status IN ('started', 'completed')),
      score INTEGER NOT NULL DEFAULT 0,
      attempts INTEGER NOT NULL DEFAULT 1,
      metadata_json TEXT NOT NULL DEFAULT '{}',
      started_at TEXT NOT NULL,
      completed_at TEXT,
      updated_at TEXT NOT NULL,
      UNIQUE(student_id, course_id, lesson_id, activity_id)
    );

    CREATE TABLE IF NOT EXISTS kugel_class_sessions (
      classroom_id TEXT PRIMARY KEY REFERENCES classrooms(id) ON DELETE CASCADE,
      lesson_id INTEGER NOT NULL DEFAULT 0 CHECK (lesson_id = 0),
      active INTEGER NOT NULL DEFAULT 0 CHECK (active IN (0, 1)),
      monitor_server_name TEXT NOT NULL,
      world_id TEXT NOT NULL,
      events_since INTEGER NOT NULL,
      launch_token TEXT,
      server_state TEXT NOT NULL DEFAULT 'idle' CHECK (server_state IN ('idle', 'starting', 'running', 'stopping', 'error')),
      server_detail TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS kugel_student_runs (
      student_id TEXT PRIMARY KEY REFERENCES classroom_students(id) ON DELETE CASCADE,
      classroom_id TEXT NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
      lesson_id INTEGER NOT NULL DEFAULT 0 CHECK (lesson_id = 0),
      started_at TEXT,
      reset_at TEXT,
      finished_at TEXT,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_classroom_teachers_email ON classroom_teachers(email);
    CREATE INDEX IF NOT EXISTS idx_classroom_teacher_sessions_token ON classroom_teacher_sessions(token_hash);
    CREATE INDEX IF NOT EXISTS idx_classroom_admin_sessions_token ON classroom_admin_sessions(token_hash);
    CREATE INDEX IF NOT EXISTS idx_classroom_password_resets_lookup ON classroom_password_resets(role, identifier, expires_at);
    CREATE INDEX IF NOT EXISTS idx_teacher_courses_teacher ON teacher_courses(teacher_id);
    CREATE INDEX IF NOT EXISTS idx_classrooms_teacher ON classrooms(teacher_id);
    CREATE INDEX IF NOT EXISTS idx_classrooms_join_code ON classrooms(join_code);
    CREATE INDEX IF NOT EXISTS idx_classroom_courses_classroom ON classroom_courses(classroom_id);
    CREATE INDEX IF NOT EXISTS idx_classroom_students_classroom ON classroom_students(classroom_id);
    CREATE INDEX IF NOT EXISTS idx_classroom_student_sessions_token ON classroom_student_sessions(token_hash);
    CREATE INDEX IF NOT EXISTS idx_classroom_progress_student ON classroom_progress(student_id);
    CREATE INDEX IF NOT EXISTS idx_kugel_student_runs_classroom ON kugel_student_runs(classroom_id);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_kugel_active_monitor_server
      ON kugel_class_sessions(monitor_server_name) WHERE active = 1;
    CREATE INDEX IF NOT EXISTS idx_summer_users_email ON summer_users(email);
    CREATE INDEX IF NOT EXISTS idx_summer_sessions_token_hash ON summer_sessions(token_hash);
    CREATE INDEX IF NOT EXISTS idx_summer_sessions_user_id ON summer_sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_summer_children_user_id ON summer_children(user_id);
    CREATE INDEX IF NOT EXISTS idx_summer_children_access_code ON summer_children(access_code);
    CREATE INDEX IF NOT EXISTS idx_summer_child_sessions_token_hash ON summer_child_sessions(token_hash);
    CREATE INDEX IF NOT EXISTS idx_student_progress_user ON student_progress(user_id);
    CREATE INDEX IF NOT EXISTS idx_student_progress_scope ON student_progress(user_id, course_id, lesson_id);
  `);
  try { db.prepare('ALTER TABLE student_progress ADD COLUMN child_id TEXT REFERENCES summer_children(id) ON DELETE CASCADE').run(); } catch {}
  try { db.prepare('ALTER TABLE classroom_students ADD COLUMN minecraft_player_name TEXT').run(); } catch {}
  try { db.prepare('ALTER TABLE kugel_class_sessions ADD COLUMN launch_token TEXT').run(); } catch {}
  try { db.prepare("ALTER TABLE summer_children ADD COLUMN subscription_status TEXT NOT NULL DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'past_due', 'cancelled'))").run(); } catch {}
  const migrateLegacyClassrooms = db.transaction(() => {
    const migrationKey = 'classroom-courses-backfill-v1';
    if (db.prepare('SELECT 1 FROM classroom_migrations WHERE migration_key = ?').get(migrationKey)) return;
    const legacyClassrooms = db.prepare(`
      SELECT c.id FROM classrooms c
      WHERE NOT EXISTS (SELECT 1 FROM classroom_courses cc WHERE cc.classroom_id = c.id)
    `).all();
    const addLegacyCourse = db.prepare('INSERT OR IGNORE INTO classroom_courses (classroom_id, course_id, created_at) VALUES (?, ?, ?)');
    const migrationTime = new Date().toISOString();
    for (const classroom of legacyClassrooms) {
      for (const courseId of CLASSROOM_COURSE_IDS) addLegacyCourse.run(classroom.id, courseId, migrationTime);
    }
    db.prepare('INSERT INTO classroom_migrations (migration_key, applied_at) VALUES (?, ?)').run(migrationKey, migrationTime);
  });
  migrateLegacyClassrooms();
  const migrateLegacyTeacherCourses = db.transaction(() => {
    const migrationKey = 'teacher-courses-backfill-v1';
    if (db.prepare('SELECT 1 FROM classroom_migrations WHERE migration_key = ?').get(migrationKey)) return;
    const teachers = db.prepare(`
      SELECT t.id
      FROM classroom_teachers t
      WHERE EXISTS (SELECT 1 FROM classrooms c WHERE c.teacher_id = t.id)
        AND NOT EXISTS (SELECT 1 FROM teacher_courses tc WHERE tc.teacher_id = t.id)
    `).all();
    const insert = db.prepare(`
      INSERT OR IGNORE INTO teacher_courses (teacher_id, course_id, created_at)
      SELECT ?, cc.course_id, ?
      FROM classroom_courses cc
      JOIN classrooms c ON c.id = cc.classroom_id
      WHERE c.teacher_id = ?
    `);
    const migrationTime = new Date().toISOString();
    for (const teacher of teachers) insert.run(teacher.id, migrationTime, teacher.id);
    db.prepare('INSERT INTO classroom_migrations (migration_key, applied_at) VALUES (?, ?)').run(migrationKey, migrationTime);
  });
  migrateLegacyTeacherCourses();
  const migrateMinecraftPlayerIndex = db.transaction(() => {
    const migrationKey = 'minecraft-player-nocase-index-v1';
    if (db.prepare('SELECT 1 FROM classroom_migrations WHERE migration_key = ?').get(migrationKey)) return;
    db.prepare('DROP INDEX IF EXISTS idx_classroom_students_minecraft_player').run();
    db.prepare(`
      CREATE UNIQUE INDEX idx_classroom_students_minecraft_player
      ON classroom_students(classroom_id, minecraft_player_name COLLATE NOCASE)
      WHERE minecraft_player_name IS NOT NULL
    `).run();
    db.prepare('INSERT INTO classroom_migrations (migration_key, applied_at) VALUES (?, ?)')
      .run(migrationKey, new Date().toISOString());
  });
  migrateMinecraftPlayerIndex();
  migrateStudentProgressUniqueConstraint(db);
  db.prepare('CREATE INDEX IF NOT EXISTS idx_student_progress_child ON student_progress(child_id)').run();
  try { fs.chmodSync(SUMMER_DB_FILE, 0o600); } catch {}
  return db;
}

function migrateStudentProgressUniqueConstraint(db) {
  const table = db.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'student_progress'").get();
  if (!table || !String(table.sql || '').includes('UNIQUE(user_id, course_id, lesson_id, activity_id)')) return;
  db.exec(`
    ALTER TABLE student_progress RENAME TO student_progress_legacy_unique;
    CREATE TABLE student_progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES summer_users(id) ON DELETE CASCADE,
      child_id TEXT REFERENCES summer_children(id) ON DELETE CASCADE,
      course_id TEXT NOT NULL,
      lesson_id TEXT NOT NULL,
      activity_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'started' CHECK (status IN ('started', 'completed')),
      score INTEGER DEFAULT 0,
      attempts INTEGER NOT NULL DEFAULT 0,
      metadata_json TEXT NOT NULL DEFAULT '{}',
      started_at TEXT NOT NULL,
      completed_at TEXT,
      updated_at TEXT NOT NULL,
      UNIQUE(child_id, course_id, lesson_id, activity_id)
    );
    INSERT OR IGNORE INTO student_progress (
      id, user_id, child_id, course_id, lesson_id, activity_id, status, score, attempts,
      metadata_json, started_at, completed_at, updated_at
    )
    SELECT id, user_id, child_id, course_id, lesson_id, activity_id, status, score, attempts,
      metadata_json, started_at, completed_at, updated_at
    FROM student_progress_legacy_unique;
    DROP TABLE student_progress_legacy_unique;
  `);
}

function withSummerDb(callback) {
  const db = openSummerDb();
  try {
    migrateSummerUsersJson(db);
    migrateDefaultChildren(db);
    return callback(db);
  } finally {
    db.close();
  }
}

function migrateSummerUsersJson(db) {
  if (!fs.existsSync(SUMMER_USERS_FILE)) return;
  let users = [];
  try {
    const parsed = JSON.parse(fs.readFileSync(SUMMER_USERS_FILE, 'utf8'));
    users = Array.isArray(parsed.users) ? parsed.users : [];
  } catch {
    users = [];
  }
  if (!users.length) return;

  const insert = db.prepare(`
    INSERT OR IGNORE INTO summer_users (
      id, parent_name, student_name, phone, email, password_salt, password_hash,
      subscription_status, access_json, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const tx = db.transaction((items) => {
    for (const user of items) {
      const now = new Date().toISOString();
      const createdAt = user.createdAt || now;
      insert.run(
        user.id || crypto.randomUUID(),
        cleanText(user.parentName, 80) || 'הורה',
        cleanText(user.studentName, 80) || 'ילד/ה',
        cleanText(user.phone, 40),
        cleanEmail(user.email),
        String(user.passwordSalt || crypto.randomBytes(16).toString('hex')),
        String(user.passwordHash || ''),
        ['trial', 'active', 'past_due', 'cancelled'].includes(user.subscriptionStatus) ? user.subscriptionStatus : 'trial',
        JSON.stringify(Array.isArray(user.access) && user.access.length ? user.access : ['sensi-city-lesson-1']),
        createdAt,
        user.updatedAt || createdAt
      );
    }
  });
  tx(users.filter(user => cleanEmail(user.email) && user.passwordHash));
}

function cleanEmail(value) {
  return String(value || '').trim().toLowerCase().slice(0, 180);
}

function emailLooksValid(value) {
  return /^\S+@\S+\.\S+$/.test(cleanEmail(value));
}

function emailDeliveryConfigured() {
  return Boolean(MAIL_FROM && SMTP_HOST && SMTP_PORT);
}

function smtpLine(socket, line) {
  socket.write(`${line}\r\n`);
}

function readSmtpResponse(socket) {
  return new Promise((resolve, reject) => {
    let buffer = '';
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error('SMTP timeout'));
    }, 15000);
    function cleanup() {
      clearTimeout(timer);
      socket.off('data', onData);
      socket.off('error', onError);
    }
    function onError(error) {
      cleanup();
      reject(error);
    }
    function onData(chunk) {
      buffer += chunk.toString('utf8');
      const lines = buffer.split(/\r?\n/).filter(Boolean);
      const last = lines[lines.length - 1] || '';
      if (/^\d{3} /.test(last)) {
        cleanup();
        resolve({ code: Number(last.slice(0, 3)), text: buffer });
      }
    }
    socket.on('data', onData);
    socket.on('error', onError);
  });
}

async function expectSmtp(socket, line, acceptedCodes) {
  if (line) smtpLine(socket, line);
  const response = await readSmtpResponse(socket);
  if (!acceptedCodes.includes(response.code)) throw new Error(`SMTP rejected command with ${response.code}`);
  return response;
}

async function sendEmail({ to, subject, text }) {
  const recipient = cleanEmail(to);
  if (!emailLooksValid(recipient) || !MAIL_FROM || !SMTP_HOST || !SMTP_PORT) {
    throw new Error('שליחת מייל אינה מוגדרת כרגע.');
  }
  const from = MAIL_FROM.includes('<') ? MAIL_FROM : `<${MAIL_FROM}>`;
  const body = [
    `From: ${from}`,
    `To: <${recipient}>`,
    `Subject: =?UTF-8?B?${Buffer.from(subject, 'utf8').toString('base64')}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    text,
  ].join('\r\n');

  let socket = await new Promise((resolve, reject) => {
    const connection = SMTP_SECURE
      ? tls.connect({ host: SMTP_HOST, port: SMTP_PORT, servername: SMTP_HOST }, () => resolve(connection))
      : net.connect({ host: SMTP_HOST, port: SMTP_PORT }, () => resolve(connection));
    connection.setTimeout(20000, () => reject(new Error('SMTP connection timeout')));
    connection.once('error', reject);
  });
  try {
    await expectSmtp(socket, '', [220]);
    await expectSmtp(socket, `EHLO ${SMTP_HOST}`, [250]);
    if (!SMTP_SECURE) {
      await expectSmtp(socket, 'STARTTLS', [220]);
      socket = tls.connect({ socket, servername: SMTP_HOST });
      await expectSmtp(socket, `EHLO ${SMTP_HOST}`, [250]);
    }
    if (SMTP_USER && SMTP_PASS) {
      await expectSmtp(socket, 'AUTH LOGIN', [334]);
      await expectSmtp(socket, Buffer.from(SMTP_USER).toString('base64'), [334]);
      await expectSmtp(socket, Buffer.from(SMTP_PASS).toString('base64'), [235]);
    }
    await expectSmtp(socket, `MAIL FROM:<${MAIL_FROM.replace(/^.*<|>.*$/g, '')}>`, [250]);
    await expectSmtp(socket, `RCPT TO:<${recipient}>`, [250, 251]);
    await expectSmtp(socket, 'DATA', [354]);
    await expectSmtp(socket, `${body}\r\n.`, [250]);
    await expectSmtp(socket, 'QUIT', [221]);
  } finally {
    socket.destroy();
  }
}

function cleanAccessCode(value) {
  return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 24);
}

function generateChildAccessCode(db) {
  for (let i = 0; i < 20; i += 1) {
    const code = `HT${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    if (!db.prepare('SELECT id FROM summer_children WHERE access_code = ?').get(code)) return code;
  }
  return `HT${Date.now().toString(36).toUpperCase()}`;
}

function createChildRecord(db, userId, name, pin, accessJson, subscriptionStatus = 'trial') {
  const now = new Date().toISOString();
  const salt = crypto.randomBytes(16).toString('hex');
  const safeStatus = ['trial', 'active', 'past_due', 'cancelled'].includes(subscriptionStatus) ? subscriptionStatus : 'trial';
  const child = {
    id: crypto.randomUUID(),
    user_id: userId,
    name: cleanText(name, 80) || 'ילד/ה',
    access_code: generateChildAccessCode(db),
    pin_salt: salt,
    pin_hash: hashPassword(String(pin || ''), salt),
    subscription_status: safeStatus,
    access_json: accessJson || JSON.stringify(['sensi-city-lesson-1']),
    created_at: now,
    updated_at: now,
  };
  db.prepare(`
    INSERT INTO summer_children (id, user_id, name, access_code, pin_salt, pin_hash, subscription_status, access_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(child.id, child.user_id, child.name, child.access_code, child.pin_salt, child.pin_hash, child.subscription_status, child.access_json, child.created_at, child.updated_at);
  return child;
}

function migrateDefaultChildren(db) {
  const users = db.prepare(`
    SELECT u.* FROM summer_users u
    LEFT JOIN summer_children c ON c.user_id = u.id
    WHERE c.id IS NULL
  `).all();
  if (!users.length) return;
  const tx = db.transaction((items) => {
    for (const user of items) {
      const child = createChildRecord(db, user.id, user.student_name || 'ילד/ה', crypto.randomInt(1000, 10000).toString(), user.access_json, user.subscription_status);
      db.prepare('UPDATE student_progress SET child_id = ? WHERE user_id = ? AND child_id IS NULL').run(child.id, user.id);
    }
  });
  tx(users);
}

function hashPassword(password, salt) {
  return crypto.createHash('sha256').update(`${salt}:${password}`).digest('hex');
}

function tokenHash(token) {
  return crypto.createHash('sha256').update(String(token || '')).digest('hex');
}

function createSummerSession(db, userId) {
  const token = crypto.randomBytes(32).toString('base64url');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS).toISOString();
  db.prepare(`
    INSERT INTO summer_sessions (id, user_id, token_hash, created_at, expires_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(crypto.randomUUID(), userId, tokenHash(token), now.toISOString(), expiresAt);
  return token;
}

function createChildSession(db, childId) {
  const token = crypto.randomBytes(32).toString('base64url');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS).toISOString();
  db.prepare(`
    INSERT INTO summer_child_sessions (id, child_id, token_hash, created_at, expires_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(crypto.randomUUID(), childId, tokenHash(token), now.toISOString(), expiresAt);
  return token;
}

function getUserBySessionToken(db, token) {
  if (!token) return null;
  const row = db.prepare(`
    SELECT u.*
    FROM summer_sessions s
    JOIN summer_users u ON u.id = s.user_id
    WHERE s.token_hash = ?
      AND s.revoked_at IS NULL
      AND s.expires_at > ?
  `).get(tokenHash(token), new Date().toISOString());
  if (row) {
    db.prepare('UPDATE summer_sessions SET last_seen_at = ? WHERE token_hash = ?').run(new Date().toISOString(), tokenHash(token));
  }
  return row || null;
}

function getChildSessionByToken(db, token) {
  if (!token) return null;
  const row = db.prepare(`
    SELECT c.*, u.id AS parent_id, u.parent_name, u.email, u.phone, u.subscription_status AS parent_subscription_status
    FROM summer_child_sessions s
    JOIN summer_children c ON c.id = s.child_id
    JOIN summer_users u ON u.id = c.user_id
    WHERE s.token_hash = ?
      AND s.revoked_at IS NULL
      AND s.expires_at > ?
  `).get(tokenHash(token), new Date().toISOString());
  if (row) {
    db.prepare('UPDATE summer_child_sessions SET last_seen_at = ? WHERE token_hash = ?').run(new Date().toISOString(), tokenHash(token));
  }
  return row || null;
}

function getSessionProfileByToken(db, token) {
  const user = getUserBySessionToken(db, token);
  if (user) return { kind: 'parent', user, child: getDefaultChild(db, user.id) };
  const child = getChildSessionByToken(db, token);
  if (!child) return null;
  return {
    kind: 'child',
      user: {
        id: child.parent_id,
        parent_name: child.parent_name,
        student_name: child.name,
        email: child.email,
        phone: child.phone,
        subscription_status: child.subscription_status || 'trial',
        access_json: child.access_json,
        created_at: child.created_at,
      },
    child,
  };
}

function getDefaultChild(db, userId) {
  return db.prepare('SELECT * FROM summer_children WHERE user_id = ? ORDER BY created_at LIMIT 1').get(userId) || null;
}

function listChildrenForUser(db, userId) {
  return db.prepare('SELECT * FROM summer_children WHERE user_id = ? ORDER BY created_at').all(userId);
}

function parseCookies(req) {
  return String(req.headers.cookie || '')
    .split(';')
    .map(part => part.trim())
    .filter(Boolean)
    .reduce((cookies, part) => {
      const index = part.indexOf('=');
      if (index === -1) return cookies;
      const key = decodeURIComponent(part.slice(0, index));
      const value = decodeURIComponent(part.slice(index + 1));
      cookies[key] = value;
      return cookies;
    }, {});
}

function getSummerTokenFromRequest(req) {
  const header = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
  if (header) return header;
  const cookies = parseCookies(req);
  return cookies.haiTechSummerToken || '';
}

function getSummerUserFromRequest(req) {
  const token = getSummerTokenFromRequest(req);
  if (!token) return null;
  return withSummerDb(db => {
    const profile = getSessionProfileByToken(db, token);
    return profile ? profile.user : null;
  });
}

function getSummerProfileFromRequest(req) {
  const token = getSummerTokenFromRequest(req);
  if (!token) return null;
  return withSummerDb(db => getSessionProfileByToken(db, token));
}

function sessionCookie(token) {
  const maxAge = Math.floor(SESSION_TTL_MS / 1000);
  return `haiTechSummerToken=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax`;
}

function clearSessionCookie() {
  return 'haiTechSummerToken=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax';
}

function publicSummerUser(user) {
  let access = ['sensi-city-lesson-1'];
  try {
    const parsed = JSON.parse(user.access_json || user.accessJson || '[]');
    if (Array.isArray(parsed) && parsed.length) access = parsed;
  } catch {}
  return {
    id: user.id,
    parentName: user.parent_name || user.parentName,
    studentName: user.student_name || user.studentName,
    email: user.email,
    phone: user.phone || '',
    subscriptionStatus: user.subscription_status || user.subscriptionStatus || 'trial',
    access,
    createdAt: user.created_at || user.createdAt,
  };
}

function publicUserForProfile(profile) {
  const user = publicSummerUser(profile.user);
  if (profile.child) user.subscriptionStatus = profile.child.subscription_status || 'trial';
  return user;
}

function publicChild(child) {
  if (!child) return null;
  let access = ['sensi-city-lesson-1'];
  try {
    const parsed = JSON.parse(child.access_json || '[]');
    if (Array.isArray(parsed) && parsed.length) access = parsed;
  } catch {}
  return {
    id: child.id,
    name: child.name,
    accessCode: child.access_code,
    subscriptionStatus: child.subscription_status || 'trial',
    access,
    createdAt: child.created_at,
    updatedAt: child.updated_at,
  };
}


function progressRowToPublic(row) {
  let metadata = {};
  try { metadata = JSON.parse(row.metadata_json || '{}'); } catch {}
  return {
    courseId: row.course_id,
    lessonId: row.lesson_id,
    activityId: row.activity_id,
    status: row.status,
    score: row.score || 0,
    attempts: row.attempts || 0,
    metadata,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    updatedAt: row.updated_at,
  };
}

function summarizeChildProgress(child, rows) {
  const publicRows = rows.map(progressRowToPublic);
  const completed = publicRows.filter((row) => row.status === 'completed');
  const lastActivityAt = publicRows.reduce((latest, row) => {
    const value = row.updatedAt || row.completedAt || row.startedAt || '';
    return value && value > latest ? value : latest;
  }, '');
  const coursesById = new Map();

  for (const row of publicRows) {
    if (!coursesById.has(row.courseId)) {
      coursesById.set(row.courseId, { courseId: row.courseId, totalActivities: 0, completedActivities: 0, lessons: new Map(), lastActivityAt: '' });
    }
    const course = coursesById.get(row.courseId);
    course.totalActivities += 1;
    if (row.status === 'completed') course.completedActivities += 1;
    const activityAt = row.updatedAt || row.completedAt || row.startedAt || '';
    if (activityAt && activityAt > course.lastActivityAt) course.lastActivityAt = activityAt;

    if (!course.lessons.has(row.lessonId)) {
      course.lessons.set(row.lessonId, { lessonId: row.lessonId, totalActivities: 0, completedActivities: 0, startedActivities: 0, bestScore: 0, attempts: 0, lastActivityAt: '' });
    }
    const lesson = course.lessons.get(row.lessonId);
    lesson.totalActivities += 1;
    if (row.status === 'completed') lesson.completedActivities += 1;
    else lesson.startedActivities += 1;
    lesson.bestScore = Math.max(lesson.bestScore, row.score || 0);
    lesson.attempts += row.attempts || 0;
    if (activityAt && activityAt > lesson.lastActivityAt) lesson.lastActivityAt = activityAt;
  }

  const totalActivities = publicRows.length;
  const completedActivities = completed.length;
  const averageScore = completed.length
    ? Math.round(completed.reduce((sum, row) => sum + (row.score || 0), 0) / completed.length)
    : 0;

  return {
    child: publicChild(child),
    summary: {
      totalActivities,
      completedActivities,
      startedActivities: totalActivities - completedActivities,
      completionPercent: totalActivities ? Math.round((completedActivities / totalActivities) * 100) : 0,
      averageScore,
      lastActivityAt,
    },
    courses: Array.from(coursesById.values()).map((course) => ({
      courseId: course.courseId,
      totalActivities: course.totalActivities,
      completedActivities: course.completedActivities,
      completionPercent: course.totalActivities ? Math.round((course.completedActivities / course.totalActivities) * 100) : 0,
      lastActivityAt: course.lastActivityAt,
      lessons: Array.from(course.lessons.values()).sort((a, b) => a.lessonId.localeCompare(b.lessonId)),
    })).sort((a, b) => (b.lastActivityAt || '').localeCompare(a.lastActivityAt || '')),
    recent: publicRows
      .slice()
      .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))
      .slice(0, 6),
  };
}

async function handleStudentProgress(req, res) {
  const classroomStudent = getClassroomStudentFromRequest(req);
  if (classroomStudent) {
    if (req.method === 'GET') {
      return send(res, 200, JSON.stringify({ ok: true, progress: [], accessMode: 'classroom' }));
    }
    if (req.method === 'POST') {
      req.resume();
      return send(res, 200, JSON.stringify({
        ok: true,
        saved: false,
        accessMode: 'classroom',
        message: 'ההתקדמות נשמרת בדוח הכיתה והמורה תראה אותה במסך הכיתות שלה.',
      }));
    }
    return send(res, 405, JSON.stringify({ error: 'Method not allowed' }));
  }

  const profile = getSummerProfileFromRequest(req);
  const user = profile && profile.user;
  const child = profile && profile.child;
  if (!user || !child) return send(res, 401, JSON.stringify({ error: 'צריך להתחבר כדי לשמור התקדמות.' }));
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (req.method === 'GET') {
    if (profile.kind !== 'child') return send(res, 200, JSON.stringify({ ok: true, progress: [], preview: true }));
    const courseId = cleanText(url.searchParams.get('courseId'), 80);
    const lessonId = cleanText(url.searchParams.get('lessonId'), 80);
    const rows = withSummerDb(db => {
      if (courseId && lessonId) {
        return db.prepare(`
          SELECT * FROM student_progress
          WHERE child_id = ? AND course_id = ? AND lesson_id = ?
          ORDER BY activity_id
        `).all(child.id, courseId, lessonId);
      }
      if (courseId) {
        return db.prepare(`
          SELECT * FROM student_progress
          WHERE child_id = ? AND course_id = ?
          ORDER BY lesson_id, activity_id
        `).all(child.id, courseId);
      }
      return db.prepare(`
        SELECT * FROM student_progress
        WHERE child_id = ?
        ORDER BY course_id, lesson_id, activity_id
      `).all(child.id);
    });
    return send(res, 200, JSON.stringify({ ok: true, progress: rows.map(progressRowToPublic) }));
  }

  if (req.method !== 'POST') return send(res, 405, JSON.stringify({ error: 'Method not allowed' }));

  try {
    const body = JSON.parse(await readBody(req, 64 * 1024) || '{}');
    const courseId = cleanText(body.courseId, 80);
    const lessonId = cleanText(body.lessonId, 80);
    const activityId = cleanText(body.activityId, 80);
    const status = body.status === 'completed' ? 'completed' : 'started';
    const score = Math.max(0, Math.min(100, Number(body.score || 0)));
    if (profile.kind !== 'child') {
      return send(res, 200, JSON.stringify({
        ok: true,
        saved: false,
        preview: true,
        message: 'תצוגת הורה בלבד — התקדמות נשמרת רק בכניסת ילד/ה.',
        progress: { courseId, lessonId, activityId, status, score },
      }));
    }
    if (!courseId || !lessonId || !activityId) return send(res, 400, JSON.stringify({ error: 'חסרים פרטי התקדמות.' }));
    const metadata = body.metadata && typeof body.metadata === 'object' ? body.metadata : {};
    const now = new Date().toISOString();

    const row = withSummerDb(db => {
      const existing = db.prepare(`
        SELECT * FROM student_progress
        WHERE child_id = ? AND course_id = ? AND lesson_id = ? AND activity_id = ?
      `).get(child.id, courseId, lessonId, activityId);
      if (existing) {
        const completedAt = status === 'completed' ? (existing.completed_at || now) : existing.completed_at;
        db.prepare(`
          UPDATE student_progress
          SET status = ?, score = MAX(score, ?), attempts = attempts + 1, metadata_json = ?, completed_at = ?, updated_at = ?
          WHERE id = ?
        `).run(status, score, JSON.stringify(metadata), completedAt, now, existing.id);
        return db.prepare('SELECT * FROM student_progress WHERE id = ?').get(existing.id);
      }
      const id = crypto.randomUUID();
      db.prepare(`
        INSERT INTO student_progress (
          id, user_id, child_id, course_id, lesson_id, activity_id, status, score, attempts,
          metadata_json, started_at, completed_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, user.id, child.id, courseId, lessonId, activityId, status, score, 1, JSON.stringify(metadata), now, status === 'completed' ? now : null, now);
      return db.prepare('SELECT * FROM student_progress WHERE id = ?').get(id);
    });

    return send(res, 200, JSON.stringify({ ok: true, progress: progressRowToPublic(row) }));
  } catch (error) {
    console.error('student_progress_error', error);
    return send(res, 400, JSON.stringify({ error: 'לא הצלחנו לשמור התקדמות.' }));
  }
}

async function handleSummerAuth(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const action = url.pathname.split('/').filter(Boolean)[2];

  if (req.method === 'GET' && action === 'me') {
    const token = getSummerTokenFromRequest(req) || url.searchParams.get('token');
    const profile = withSummerDb(db => getSessionProfileByToken(db, token));
    if (!profile) return send(res, 401, JSON.stringify({ error: 'צריך להתחבר מחדש.' }));
    const children = profile.kind === 'parent' ? withSummerDb(db => listChildrenForUser(db, profile.user.id).map(publicChild)) : [];
    return send(res, 200, JSON.stringify({
      ok: true,
      mode: profile.kind,
      user: publicUserForProfile(profile),
      child: publicChild(profile.child),
      children,
    }));
  }

  if (req.method === 'GET' && action === 'children') {
    const token = getSummerTokenFromRequest(req) || url.searchParams.get('token');
    const result = withSummerDb(db => {
      const user = getUserBySessionToken(db, token);
      if (!user) return null;
      return { user, children: listChildrenForUser(db, user.id).map(publicChild) };
    });
    if (!result) return send(res, 401, JSON.stringify({ error: 'רק הורה מחובר יכול לנהל ילדים.' }));
    return send(res, 200, JSON.stringify({ ok: true, children: result.children }));
  }

  if (req.method === 'GET' && action === 'dashboard') {
    const token = getSummerTokenFromRequest(req) || url.searchParams.get('token');
    const result = withSummerDb(db => {
      const user = getUserBySessionToken(db, token);
      if (!user) return null;
      const children = listChildrenForUser(db, user.id);
      const rows = db.prepare(`
        SELECT * FROM student_progress
        WHERE user_id = ?
        ORDER BY updated_at DESC
      `).all(user.id);
      const rowsByChild = new Map();
      for (const row of rows) {
        const key = row.child_id || '';
        if (!rowsByChild.has(key)) rowsByChild.set(key, []);
        rowsByChild.get(key).push(row);
      }
      return {
        user: publicSummerUser(user),
        children: children.map((child) => summarizeChildProgress(child, rowsByChild.get(child.id) || [])),
      };
    });
    if (!result) return send(res, 401, JSON.stringify({ error: 'רק הורה מחובר יכול לראות התקדמות ילדים.' }));
    return send(res, 200, JSON.stringify({ ok: true, dashboard: result }));
  }

  if (req.method !== 'POST') return send(res, 405, JSON.stringify({ error: 'Method not allowed' }));

  try {
    const body = JSON.parse(await readBody(req, 64 * 1024) || '{}');

    if (action === 'logout') {
      const token = getSummerTokenFromRequest(req);
      if (token) {
        withSummerDb(db => {
          const now = new Date().toISOString();
          const hash = tokenHash(token);
          db.prepare('UPDATE summer_sessions SET revoked_at = ? WHERE token_hash = ?').run(now, hash);
          db.prepare('UPDATE summer_child_sessions SET revoked_at = ? WHERE token_hash = ?').run(now, hash);
        });
      }
      return sendWithHeaders(res, 200, JSON.stringify({ ok: true }), 'application/json; charset=utf-8', {
        'Set-Cookie': clearSessionCookie(),
      });
    }

    if (action === 'register') {
      const parentName = cleanText(body.parentName, 80);
      const studentName = cleanText(body.studentName, 80);
      const phone = cleanText(body.phone, 40);
      const email = cleanEmail(body.email);
      const password = String(body.password || '');
      const confirmPassword = String(body.confirmPassword || '');
      if (parentName.length < 2 || studentName.length < 2) return send(res, 400, JSON.stringify({ error: 'נא למלא שם הורה ושם ילד/ה.' }));
      if (!/^\S+@\S+\.\S+$/.test(email)) return send(res, 400, JSON.stringify({ error: 'כתובת המייל לא תקינה.' }));
      if (password.length < 6) return send(res, 400, JSON.stringify({ error: 'הסיסמה צריכה להכיל לפחות 6 תווים.' }));
      if (confirmPassword && password !== confirmPassword) return send(res, 400, JSON.stringify({ error: 'הסיסמאות לא תואמות. נא להקליד שוב.' }));

      const result = withSummerDb(db => {
        if (db.prepare('SELECT id FROM summer_users WHERE email = ?').get(email)) {
          return { conflict: true };
        }
        const now = new Date().toISOString();
        const salt = crypto.randomBytes(16).toString('hex');
        const user = {
          id: crypto.randomUUID(),
          parent_name: parentName,
          student_name: studentName,
          phone,
          email,
          password_salt: salt,
          password_hash: hashPassword(password, salt),
          subscription_status: 'trial',
          access_json: JSON.stringify(['sensi-city-lesson-1']),
          created_at: now,
          updated_at: now,
        };
        db.prepare(`
          INSERT INTO summer_users (
            id, parent_name, student_name, phone, email, password_salt, password_hash,
            subscription_status, access_json, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          user.id, user.parent_name, user.student_name, user.phone, user.email, user.password_salt,
          user.password_hash, user.subscription_status, user.access_json, user.created_at, user.updated_at
        );
        const child = createChildRecord(db, user.id, studentName, crypto.randomInt(1000, 10000).toString(), user.access_json, 'trial');
        return { user, child, children: listChildrenForUser(db, user.id).map(publicChild), token: createSummerSession(db, user.id) };
      });

      if (result.conflict) return send(res, 409, JSON.stringify({ error: 'כבר יש חשבון עם המייל הזה. אפשר להתחבר.' }));
      return sendWithHeaders(res, 201, JSON.stringify({ ok: true, mode: 'parent', token: result.token, user: publicUserForProfile({ user: result.user, child: result.child }), child: publicChild(result.child), children: result.children }), 'application/json; charset=utf-8', {
        'Set-Cookie': sessionCookie(result.token),
      });
    }

    if (action === 'login') {
      const email = cleanEmail(body.email);
      const password = String(body.password || '');
      const result = withSummerDb(db => {
        const user = db.prepare('SELECT * FROM summer_users WHERE email = ?').get(email);
        if (!user || hashPassword(password, user.password_salt) !== user.password_hash) return null;
        const child = getDefaultChild(db, user.id);
        return { user, child, children: listChildrenForUser(db, user.id).map(publicChild), token: createSummerSession(db, user.id) };
      });
      if (!result) return send(res, 401, JSON.stringify({ error: 'מייל או סיסמה לא נכונים.' }));
      return sendWithHeaders(res, 200, JSON.stringify({ ok: true, mode: 'parent', token: result.token, user: publicUserForProfile({ user: result.user, child: result.child }), child: publicChild(result.child), children: result.children }), 'application/json; charset=utf-8', {
        'Set-Cookie': sessionCookie(result.token),
      });
    }

    if (action === 'activate-subscription') {
      const token = getSummerTokenFromRequest(req);
      const result = withSummerDb(db => {
        const profile = getSessionProfileByToken(db, token);
        if (!profile || !profile.child) return null;
        const now = new Date().toISOString();
        db.prepare('UPDATE summer_children SET subscription_status = ?, updated_at = ? WHERE id = ?')
          .run('active', now, profile.child.id);
        db.prepare('UPDATE summer_users SET subscription_status = ?, updated_at = ? WHERE id = ?')
          .run('active', now, profile.user.id);
        db.prepare(`
          INSERT INTO summer_subscription_events (id, user_id, provider, provider_event_id, event_type, status, raw_json, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          crypto.randomUUID(),
          profile.user.id,
          'morning',
          null,
          'thankyou_return',
          'active',
          JSON.stringify({ childId: profile.child.id, source: 'thankyou', note: 'Activated after Morning thank-you return' }),
          now
        );
        const child = db.prepare('SELECT * FROM summer_children WHERE id = ?').get(profile.child.id);
        return { user: db.prepare('SELECT * FROM summer_users WHERE id = ?').get(profile.user.id), child };
      });
      if (!result) return send(res, 401, JSON.stringify({ error: 'כדי להפעיל את המנוי צריך להתחבר לחשבון שבו נרשמתם.' }));
      return send(res, 200, JSON.stringify({
        ok: true,
        user: publicUserForProfile(result),
        child: publicChild(result.child),
      }));
    }

    if (action === 'children') {
      const token = getSummerTokenFromRequest(req);
      const childName = cleanText(body.name || body.studentName, 80);
      const pin = String(body.pin || '').trim();
      if (childName.length < 2) return send(res, 400, JSON.stringify({ error: 'נא למלא שם ילד/ה.' }));
      if (!/^\d{4,6}$/.test(pin)) return send(res, 400, JSON.stringify({ error: 'ה-PIN צריך להיות 4–6 ספרות.' }));
      const result = withSummerDb(db => {
        const user = getUserBySessionToken(db, token);
        if (!user) return null;
        const child = createChildRecord(db, user.id, childName, pin, user.access_json);
        return { child, children: listChildrenForUser(db, user.id).map(publicChild) };
      });
      if (!result) return send(res, 401, JSON.stringify({ error: 'רק הורה מחובר יכול להוסיף ילדים.' }));
      return send(res, 201, JSON.stringify({ ok: true, child: publicChild(result.child), children: result.children }));
    }

    if (action === 'child-login') {
      const accessCode = cleanAccessCode(body.accessCode || body.code);
      const pin = String(body.pin || '').trim();
      const result = withSummerDb(db => {
        const child = db.prepare('SELECT * FROM summer_children WHERE access_code = ?').get(accessCode);
        if (!child || hashPassword(pin, child.pin_salt) !== child.pin_hash) return null;
        const user = db.prepare('SELECT * FROM summer_users WHERE id = ?').get(child.user_id);
        return { user, child, token: createChildSession(db, child.id) };
      });
      if (!result) return send(res, 401, JSON.stringify({ error: 'קוד ילד או PIN לא נכונים.' }));
      return sendWithHeaders(res, 200, JSON.stringify({
        ok: true,
        mode: 'child',
        token: result.token,
        user: publicUserForProfile({ user: result.user, child: result.child }),
        child: publicChild(result.child),
      }), 'application/json; charset=utf-8', {
        'Set-Cookie': sessionCookie(result.token),
      });
    }

    return send(res, 404, JSON.stringify({ error: 'Not found' }));
  } catch (error) {
    console.error('summer_auth_error', error);
    return send(res, 400, JSON.stringify({ error: 'לא הצלחנו לטפל בבקשה.' }));
  }
}

function hashClassroomSecret(secret, salt) {
  return crypto.scryptSync(String(secret || ''), salt, 64).toString('hex');
}

function classroomInviteMatches(value) {
  if (!CLASSROOM_TEACHER_INVITE_CODE) return false;
  const provided = crypto.createHash('sha256').update(String(value || '')).digest();
  const expected = crypto.createHash('sha256').update(CLASSROOM_TEACHER_INVITE_CODE).digest();
  return crypto.timingSafeEqual(provided, expected);
}

function classroomAdminCodeMatches(value) {
  const raw = String(value || '');
  if (CLASSROOM_ADMIN_CODE) {
    const provided = crypto.createHash('sha256').update(raw).digest();
    const expected = crypto.createHash('sha256').update(CLASSROOM_ADMIN_CODE).digest();
    if (provided.length === expected.length && crypto.timingSafeEqual(provided, expected)) return true;
  }
  return withSummerDb(db => {
    const credential = db.prepare('SELECT code_salt, code_hash FROM classroom_admin_credentials WHERE id = ?').get('default');
    if (!credential) return false;
    const provided = Buffer.from(hashClassroomSecret(raw, credential.code_salt), 'hex');
    const expected = Buffer.from(credential.code_hash, 'hex');
    return provided.length === expected.length && crypto.timingSafeEqual(provided, expected);
  });
}

function createPasswordReset(db, role, identifier, targetId) {
  const now = new Date();
  const code = crypto.randomInt(100000, 1000000).toString();
  db.prepare(`
    INSERT INTO classroom_password_resets (id, role, identifier, target_id, code_hash, created_at, expires_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    crypto.randomUUID(),
    role,
    identifier,
    targetId,
    tokenHash(`${role}:${identifier}:${code}`),
    now.toISOString(),
    new Date(now.getTime() + PASSWORD_RESET_TTL_MS).toISOString(),
  );
  return code;
}

function consumePasswordReset(db, role, identifier, code) {
  const now = new Date().toISOString();
  const reset = db.prepare(`
    SELECT * FROM classroom_password_resets
    WHERE role = ? AND identifier = ? AND used_at IS NULL AND expires_at > ?
    ORDER BY created_at DESC LIMIT 1
  `).get(role, identifier, now);
  if (!reset || reset.code_hash !== tokenHash(`${role}:${identifier}:${String(code || '').trim()}`)) return null;
  db.prepare('UPDATE classroom_password_resets SET used_at = ? WHERE id = ?').run(now, reset.id);
  return reset;
}

function setClassroomAdminCredential(db, code) {
  const now = new Date().toISOString();
  const salt = crypto.randomBytes(16).toString('hex');
  db.prepare(`
    INSERT INTO classroom_admin_credentials (id, code_salt, code_hash, updated_at)
    VALUES ('default', ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET code_salt = excluded.code_salt, code_hash = excluded.code_hash, updated_at = excluded.updated_at
  `).run(salt, hashClassroomSecret(code, salt), now);
}

function classroomLoginKey(req, role, identifier) {
  return `${role}:${req.socket.remoteAddress || 'unknown'}:${String(identifier || '').toLowerCase()}`;
}

function isClassroomLoginLimited(key) {
  pruneClassroomLoginFailures();
  const attempt = classroomLoginFailures.get(key);
  if (!attempt) return classroomLoginFailures.size >= CLASSROOM_LOGIN_MAX_KEYS;
  return attempt.failures >= CLASSROOM_LOGIN_MAX_FAILURES;
}

function pruneClassroomLoginFailures() {
  const now = Date.now();
  for (const [key, attempt] of classroomLoginFailures) {
    if (now - attempt.startedAt >= CLASSROOM_LOGIN_WINDOW_MS) classroomLoginFailures.delete(key);
  }
}

function recordClassroomLoginFailure(key) {
  pruneClassroomLoginFailures();
  const attempt = classroomLoginFailures.get(key);
  if (!attempt && classroomLoginFailures.size >= CLASSROOM_LOGIN_MAX_KEYS) return;
  if (!attempt || Date.now() - attempt.startedAt >= CLASSROOM_LOGIN_WINDOW_MS) {
    classroomLoginFailures.set(key, { failures: 1, startedAt: Date.now() });
    return;
  }
  attempt.failures += 1;
}

function clearClassroomLoginFailures(key) {
  classroomLoginFailures.delete(key);
}

function createClassroomTeacherSession(db, teacherId) {
  const token = crypto.randomBytes(32).toString('base64url');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS).toISOString();
  db.prepare(`
    INSERT INTO classroom_teacher_sessions (id, teacher_id, token_hash, created_at, expires_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(crypto.randomUUID(), teacherId, tokenHash(token), now.toISOString(), expiresAt);
  return token;
}

function createClassroomAdminSession(db) {
  const token = crypto.randomBytes(32).toString('base64url');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS).toISOString();
  db.prepare(`
    INSERT INTO classroom_admin_sessions (id, token_hash, created_at, expires_at)
    VALUES (?, ?, ?, ?)
  `).run(crypto.randomUUID(), tokenHash(token), now.toISOString(), expiresAt);
  return token;
}

function createClassroomStudentSession(db, studentId) {
  const token = crypto.randomBytes(32).toString('base64url');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS).toISOString();
  db.prepare(`
    INSERT INTO classroom_student_sessions (id, student_id, token_hash, created_at, expires_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(crypto.randomUUID(), studentId, tokenHash(token), now.toISOString(), expiresAt);
  return token;
}

function classroomSessionCookie(token) {
  const maxAge = Math.floor(SESSION_TTL_MS / 1000);
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `haiTechClassroomToken=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax${secure}`;
}

function clearClassroomSessionCookie() {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `haiTechClassroomToken=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secure}`;
}

function classroomAdminSessionCookie(token) {
  const maxAge = Math.floor(SESSION_TTL_MS / 1000);
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `haiTechClassroomAdminToken=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Strict${secure}`;
}

function clearClassroomAdminSessionCookie() {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `haiTechClassroomAdminToken=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict${secure}`;
}

function getClassroomAdminFromRequest(req) {
  const token = parseCookies(req).haiTechClassroomAdminToken || '';
  if (!token) return false;
  return withSummerDb(db => {
    const hash = tokenHash(token);
    const session = db.prepare(`
      SELECT id FROM classroom_admin_sessions
      WHERE token_hash = ? AND revoked_at IS NULL AND expires_at > ?
    `).get(hash, new Date().toISOString());
    if (!session) return false;
    db.prepare('UPDATE classroom_admin_sessions SET last_seen_at = ? WHERE token_hash = ?')
      .run(new Date().toISOString(), hash);
    return true;
  });
}

function getClassroomTeacherFromRequest(req) {
  const token = parseCookies(req).haiTechClassroomToken || '';
  if (!token) return null;
  return withSummerDb(db => {
    const teacher = db.prepare(`
      SELECT t.*
      FROM classroom_teacher_sessions s
      JOIN classroom_teachers t ON t.id = s.teacher_id
      WHERE s.token_hash = ? AND s.revoked_at IS NULL AND s.expires_at > ?
    `).get(tokenHash(token), new Date().toISOString());
    if (teacher) {
      db.prepare('UPDATE classroom_teacher_sessions SET last_seen_at = ? WHERE token_hash = ?')
        .run(new Date().toISOString(), tokenHash(token));
    }
    return teacher || null;
  });
}

function getClassroomStudentFromRequest(req) {
  const token = parseCookies(req).haiTechClassroomToken || '';
  if (!token) return null;
  return withSummerDb(db => {
    const student = db.prepare(`
      SELECT s.*, c.name AS classroom_name
      FROM classroom_student_sessions css
      JOIN classroom_students s ON s.id = css.student_id
      JOIN classrooms c ON c.id = s.classroom_id
      WHERE css.token_hash = ? AND css.revoked_at IS NULL AND css.expires_at > ?
    `).get(tokenHash(token), new Date().toISOString());
    if (student) {
      db.prepare('UPDATE classroom_student_sessions SET last_seen_at = ? WHERE token_hash = ?')
        .run(new Date().toISOString(), tokenHash(token));
    }
    return student || null;
  });
}

function cleanClassroomCourses(value) {
  if (!Array.isArray(value)) return null;
  const requested = new Set();
  for (const valueCourseId of value) {
    const courseId = cleanText(valueCourseId, 80);
    if (!CLASSROOM_COURSES.has(courseId)) return null;
    requested.add(courseId);
  }
  return CLASSROOM_COURSE_IDS.filter(courseId => requested.has(courseId));
}

function classroomCourses(db, classroomId) {
  const assigned = new Set(db.prepare('SELECT course_id FROM classroom_courses WHERE classroom_id = ?')
    .all(classroomId).map(row => row.course_id));
  return CLASSROOM_COURSE_IDS.filter(courseId => assigned.has(courseId));
}

function classroomHasCourse(db, classroomId, courseId) {
  return Boolean(db.prepare('SELECT 1 FROM classroom_courses WHERE classroom_id = ? AND course_id = ?')
    .get(classroomId, courseId));
}

function teacherCourses(db, teacherId) {
  const assigned = new Set(db.prepare('SELECT course_id FROM teacher_courses WHERE teacher_id = ?')
    .all(teacherId).map(row => row.course_id));
  return CLASSROOM_COURSE_IDS.filter(courseId => assigned.has(courseId));
}

function teacherHasCourse(db, teacherId, courseId) {
  return Boolean(db.prepare('SELECT 1 FROM teacher_courses WHERE teacher_id = ? AND course_id = ?')
    .get(teacherId, courseId));
}

function teacherCanAssignCourses(db, teacherId, courseIds) {
  const allowed = new Set(teacherCourses(db, teacherId));
  return courseIds.every(courseId => allowed.has(courseId));
}

function replaceTeacherCourses(db, teacherId, courseIds) {
  const now = new Date().toISOString();
  db.prepare('DELETE FROM teacher_courses WHERE teacher_id = ?').run(teacherId);
  const insert = db.prepare('INSERT INTO teacher_courses (teacher_id, course_id, created_at) VALUES (?, ?, ?)');
  for (const courseId of courseIds) insert.run(teacherId, courseId, now);
  if (courseIds.length) {
    const placeholders = courseIds.map(() => '?').join(', ');
    db.prepare(`
      DELETE FROM classroom_courses
      WHERE classroom_id IN (SELECT id FROM classrooms WHERE teacher_id = ?)
        AND course_id NOT IN (${placeholders})
    `).run(teacherId, ...courseIds);
  } else {
    db.prepare('DELETE FROM classroom_courses WHERE classroom_id IN (SELECT id FROM classrooms WHERE teacher_id = ?)').run(teacherId);
  }
  db.prepare(`
    DELETE FROM kugel_student_runs
    WHERE classroom_id IN (
      SELECT c.id FROM classrooms c
      WHERE c.teacher_id = ?
        AND NOT EXISTS (
          SELECT 1 FROM classroom_courses cc
          WHERE cc.classroom_id = c.id AND cc.course_id = ?
        )
    )
  `).run(teacherId, KUGEL_COURSE_ID);
  db.prepare(`
    DELETE FROM kugel_class_sessions
    WHERE active = 0 AND classroom_id IN (
      SELECT c.id FROM classrooms c
      WHERE c.teacher_id = ?
        AND NOT EXISTS (
          SELECT 1 FROM classroom_courses cc
          WHERE cc.classroom_id = c.id AND cc.course_id = ?
        )
    )
  `).run(teacherId, KUGEL_COURSE_ID);
  db.prepare('UPDATE classroom_teachers SET updated_at = ? WHERE id = ?').run(now, teacherId);
}

function replaceClassroomCourses(db, classroomId, courseIds) {
  const now = new Date().toISOString();
  db.prepare('DELETE FROM classroom_courses WHERE classroom_id = ?').run(classroomId);
  const insert = db.prepare('INSERT INTO classroom_courses (classroom_id, course_id, created_at) VALUES (?, ?, ?)');
  for (const courseId of courseIds) insert.run(classroomId, courseId, now);
  if (!courseIds.includes(KUGEL_COURSE_ID)) {
    db.prepare('DELETE FROM kugel_student_runs WHERE classroom_id = ?').run(classroomId);
    db.prepare('DELETE FROM kugel_class_sessions WHERE classroom_id = ? AND active = 0').run(classroomId);
  }
  db.prepare('UPDATE classrooms SET updated_at = ? WHERE id = ?').run(now, classroomId);
}

function generateClassJoinCode(db) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  for (let attempt = 0; attempt < 30; attempt += 1) {
    let code = '';
    for (let index = 0; index < 6; index += 1) code += alphabet[crypto.randomInt(0, alphabet.length)];
    if (!db.prepare('SELECT id FROM classrooms WHERE join_code = ?').get(code)) return code;
  }
  throw new Error('class_code_generation_failed');
}

function personalLoginCodeExists(db, classroomId, code) {
  return db.prepare('SELECT login_salt, login_hash FROM classroom_students WHERE classroom_id = ?')
    .all(classroomId)
    .some(student => {
      const provided = Buffer.from(hashClassroomSecret(code, student.login_salt), 'hex');
      const expected = Buffer.from(student.login_hash, 'hex');
      return provided.length === expected.length && crypto.timingSafeEqual(provided, expected);
    });
}

function generatePersonalLoginCode(db, classroomId) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  for (let attempt = 0; attempt < 30; attempt += 1) {
    let code = '';
    for (let index = 0; index < 6; index += 1) code += alphabet[crypto.randomInt(0, alphabet.length)];
    if (!personalLoginCodeExists(db, classroomId, code)) return code;
  }
  throw new Error('student_code_generation_failed');
}

function classroomProgressPublic(row) {
  return {
    courseId: row.course_id,
    lessonId: row.lesson_id,
    activityId: row.activity_id,
    status: row.status,
    score: row.score || 0,
    attempts: row.attempts || 0,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    updatedAt: row.updated_at,
  };
}

function cleanMinecraftPlayerName(value) {
  const name = String(value || '').trim();
  if (!name) return '';
  return /^[A-Za-z0-9_]{2,32}$/.test(name) ? name : null;
}

function consumeKugelActionLimit(key, maxActions) {
  const now = Date.now();
  const current = kugelActionWindows.get(key);
  if (!current || current.resetAt <= now) {
    kugelActionWindows.set(key, { count: 1, resetAt: now + KUGEL_ACTION_WINDOW_MS });
    if (kugelActionWindows.size > 5000) {
      for (const [storedKey, window] of kugelActionWindows) {
        if (window.resetAt <= now) kugelActionWindows.delete(storedKey);
      }
    }
    return true;
  }
  if (current.count >= maxActions) return false;
  current.count += 1;
  return true;
}

function kugelMinecraftConfigured() {
  return Boolean(
    KUGEL_MONITOR_API_URL
    && KUGEL_MONITOR_SERVER_NAME
    && KUGEL_MINECRAFT_INTERNAL_TOKEN
    && KUGEL_MINECRAFT_SERVER_NAME
    && KUGEL_MINECRAFT_SERVER_HOST
    && KUGEL_MINECRAFT_SERVER_PORT
    && KUGEL_MINECRAFT_SERVER_ID
    && KUGEL_MINECRAFT_ACCESS_CODE,
  );
}

function kugelMinecraftInfo() {
  if (!kugelMinecraftConfigured()) return null;
  return {
    serverName: KUGEL_MINECRAFT_SERVER_NAME,
    serverAddress: `${KUGEL_MINECRAFT_SERVER_HOST}:${KUGEL_MINECRAFT_SERVER_PORT}`,
    serverId: KUGEL_MINECRAFT_SERVER_ID,
    accessCode: KUGEL_MINECRAFT_ACCESS_CODE,
    launchUrl: `minecraftedu://?addExternalServer=${encodeURIComponent(KUGEL_MINECRAFT_SERVER_NAME)}|${KUGEL_MINECRAFT_SERVER_HOST}:${KUGEL_MINECRAFT_SERVER_PORT}`,
  };
}

async function kugelMonitorRequest(pathname, options = {}, timeoutMs = 15000) {
  if (!kugelMinecraftConfigured()) {
    const error = new Error('חיבור Minecraft אינו מוגדר בשרת.');
    error.statusCode = 503;
    throw error;
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${KUGEL_MONITOR_API_URL}${pathname}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${KUGEL_MINECRAFT_INTERNAL_TOKEN}`,
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers || {}),
      },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.error || 'Minecraft monitor request failed');
      error.statusCode = 502;
      throw error;
    }
    return data;
  } finally {
    clearTimeout(timer);
  }
}

function serializeKugelMonitorMutation(serverName, task) {
  const previous = kugelMonitorMutationQueues.get(serverName) || Promise.resolve();
  const current = previous.catch(() => {}).then(task);
  kugelMonitorMutationQueues.set(serverName, current);
  const cleanup = () => {
    if (kugelMonitorMutationQueues.get(serverName) === current) kugelMonitorMutationQueues.delete(serverName);
  };
  current.then(cleanup, cleanup);
  return current;
}

function kugelMonitorMutation(pathname, options = {}, timeoutMs = 15000) {
  return serializeKugelMonitorMutation(KUGEL_MONITOR_SERVER_NAME, () => kugelMonitorRequest(pathname, options, timeoutMs));
}

function kugelEventPayload(row) {
  if (!row?.payload) return {};
  if (typeof row.payload === 'object') return row.payload;
  try { return JSON.parse(row.payload); } catch { return {}; }
}

function kugelEventTime(row) {
  const raw = row?.created_at ?? row?.createdAt ?? row?.timestamp;
  const numeric = Number(raw);
  if (Number.isFinite(numeric) && numeric > 0) return numeric > 1e12 ? numeric : numeric * 1000;
  return Date.parse(String(raw || '')) || 0;
}

async function kugelGameEvents(session, useCache = false) {
  if (!session || !kugelMinecraftConfigured()) return [];
  const cacheKey = `${session.monitor_server_name}:${session.events_since}:${session.launch_token || ''}`;
  const now = Date.now();
  const cached = kugelEventCache.get(cacheKey);
  if (useCache && cached && cached.expiresAt > now) return cached.promise;
  const query = new URLSearchParams({
    server: session.monitor_server_name,
    since: String(session.events_since),
    limit: '1000',
  });
  const promise = kugelMonitorRequest(`/api/game-events?${query}`, {}, 7000)
    .then(data => Array.isArray(data.events) ? data.events : Array.isArray(data.rows) ? data.rows : []);
  if (useCache) {
    kugelEventCache.set(cacheKey, { promise, expiresAt: now + KUGEL_EVENTS_CACHE_MS });
    promise.catch(() => kugelEventCache.delete(cacheKey));
    if (kugelEventCache.size > 1000) {
      for (const [key, entry] of kugelEventCache) if (entry.expiresAt <= now) kugelEventCache.delete(key);
    }
  }
  return promise;
}

function summarizeKugelStudent(student, run, session, events) {
  const playerKey = String(student.minecraft_player_name || '').toLowerCase();
  const resetAt = Date.parse(run?.reset_at || '') || 0;
  const eventFloor = Math.max(Number(session?.events_since || 0) * 1000, resetAt);
  const matching = playerKey
    ? events.filter(row => {
      const payload = kugelEventPayload(row);
      const eventWorld = String(row.world_id || payload.world_id || payload.worldId || '');
      const eventTime = kugelEventTime(row);
      return String(row.player_name || '').toLowerCase() === playerKey
        && eventTime >= eventFloor
        && eventTime <= Date.now() + 30000
        && (!eventWorld || eventWorld === session?.world_id);
    })
    : [];
  const ordered = [...matching].sort((a, b) => kugelEventTime(a) - kugelEventTime(b));
  const uniqueCoinKeys = new Set();
  let coins = 0;
  let goalReachedAt = 0;
  for (const row of ordered) {
    const payload = kugelEventPayload(row);
    if (row.event_type === 'coin_collected') {
      const coinIndex = Number(payload.coin_index ?? payload.coinIndex);
      if (Number.isInteger(coinIndex) && coinIndex >= 1 && coinIndex <= KUGEL_LESSON_ZERO.goalCoins) {
        uniqueCoinKeys.add(`coin:${coinIndex}`);
      }
    }
    coins = Math.min(KUGEL_LESSON_ZERO.goalCoins, uniqueCoinKeys.size);
    if (!goalReachedAt && coins >= KUGEL_LESSON_ZERO.goalCoins) goalReachedAt = kugelEventTime(row);
  }
  const finishEvent = ordered.find(row => (
    row.event_type === 'finish_button_pressed'
    && goalReachedAt > 0
    && kugelEventTime(row) >= goalReachedAt
  ));
  const completed = coins >= KUGEL_LESSON_ZERO.goalCoins && Boolean(finishEvent || run?.finished_at);
  const last = ordered.at(-1);
  const connected = Boolean(last && last.event_type !== 'player_leave');
  return {
    id: student.id,
    name: student.name,
    minecraftPlayerName: student.minecraft_player_name || '',
    connected,
    coins,
    completed,
    startedAt: run?.started_at || null,
    resetAt: run?.reset_at || null,
    finishedAt: completed ? (run?.finished_at || (finishEvent ? new Date(kugelEventTime(finishEvent)).toISOString() : null)) : null,
    lastSeenAt: last ? new Date(kugelEventTime(last)).toISOString() : null,
  };
}

function getTeacherKugelClass(req, classroomId) {
  const teacher = getClassroomTeacherFromRequest(req);
  if (!teacher) return { status: 401, error: 'נדרשת כניסת מורה.' };
  return withSummerDb(db => {
    const classroom = db.prepare('SELECT * FROM classrooms WHERE id = ? AND teacher_id = ?').get(classroomId, teacher.id);
    if (!classroom) return { status: 404, error: 'הכיתה לא נמצאה.' };
    if (!teacherHasCourse(db, teacher.id, KUGEL_COURSE_ID) || !classroomHasCourse(db, classroom.id, KUGEL_COURSE_ID)) {
      return { status: 403, error: 'שיעור Minecraft אינו פתוח לכיתה הזו.' };
    }
    return { teacher, classroom };
  });
}

function getStudentKugelClass(req) {
  const student = getClassroomStudentFromRequest(req);
  if (!student) return { status: 401, error: 'נדרשת כניסת תלמיד/ה לכיתה.' };
  const context = withSummerDb(db => {
    const classroom = db.prepare('SELECT id, name, teacher_id FROM classrooms WHERE id = ?').get(student.classroom_id);
    const allowed = Boolean(
      classroom
      && classroomHasCourse(db, classroom.id, KUGEL_COURSE_ID)
      && teacherHasCourse(db, classroom.teacher_id, KUGEL_COURSE_ID),
    );
    return { classroom, allowed };
  });
  if (!context.allowed) return { status: 403, error: 'שיעור Minecraft אינו פתוח לכיתה הזו.' };
  return { student, classroom: { id: context.classroom.id, name: context.classroom.name } };
}

function kugelSessionPublic(row) {
  return row ? {
    classroomId: row.classroom_id,
    lessonId: row.lesson_id,
    active: Boolean(row.active),
    serverState: row.server_state,
    serverDetail: row.server_detail,
    updatedAt: row.updated_at,
  } : {
    classroomId: null,
    lessonId: 0,
    active: false,
    serverState: 'idle',
    serverDetail: 'המורה עדיין לא הפעילה את שיעור 0.',
    updatedAt: null,
  };
}

async function kugelClassView(context, role, useEventCache = true) {
  const data = withSummerDb(db => {
    const session = db.prepare('SELECT * FROM kugel_class_sessions WHERE classroom_id = ?').get(context.classroom.id);
    const students = db.prepare(`
      SELECT id, classroom_id, name, minecraft_player_name
      FROM classroom_students WHERE classroom_id = ? ORDER BY created_at
    `).all(context.classroom.id);
    const runs = new Map(db.prepare('SELECT * FROM kugel_student_runs WHERE classroom_id = ?').all(context.classroom.id)
      .map(run => [run.student_id, run]));
    const completedStudentIds = new Set(db.prepare(`
      SELECT student_id FROM classroom_progress
      WHERE course_id = ? AND lesson_id = '0' AND activity_id = 'minecraft-maze' AND status = 'completed'
        AND student_id IN (SELECT id FROM classroom_students WHERE classroom_id = ?)
    `).all(KUGEL_COURSE_ID, context.classroom.id).map(row => row.student_id));
    return { session, students, runs, completedStudentIds };
  });
  const ownsRunningWorld = Boolean(data.session?.active && data.session.server_state === 'running');
  const events = ownsRunningWorld ? await kugelGameEvents(data.session, useEventCache) : [];
  const summaries = data.students.map(student => ({
    ...summarizeKugelStudent(student, data.runs.get(student.id), data.session, events),
    completionRecorded: data.completedStudentIds.has(student.id),
  }));
  const session = { ...kugelSessionPublic(data.session), classroomId: context.classroom.id };
  if (role === 'student') {
    const own = summaries.find(student => student.id === context.student.id);
    return {
      ok: true,
      role,
      lesson: KUGEL_LESSON_ZERO,
      classroom: context.classroom,
      session,
      student: own,
      minecraft: ownsRunningWorld ? kugelMinecraftInfo() : null,
    };
  }
  return {
    ok: true,
    role,
    lesson: KUGEL_LESSON_ZERO,
    classroom: { id: context.classroom.id, name: context.classroom.name },
    session,
    students: summaries,
    metrics: {
      connected: summaries.filter(student => student.connected).length,
      active: summaries.filter(student => student.startedAt && !student.completed).length,
      completed: summaries.filter(student => student.completed).length,
      needsHelp: summaries.filter(student => student.startedAt && !student.completed && student.coins <= 1).length,
    },
    minecraft: ownsRunningWorld ? kugelMinecraftInfo() : null,
  };
}

function upsertKugelRun(db, studentId, classroomId, patch) {
  const existing = db.prepare('SELECT * FROM kugel_student_runs WHERE student_id = ?').get(studentId);
  const now = new Date().toISOString();
  const next = {
    started_at: patch.startedAt === undefined ? existing?.started_at || null : patch.startedAt,
    reset_at: patch.resetAt === undefined ? existing?.reset_at || null : patch.resetAt,
    finished_at: patch.finishedAt === undefined ? existing?.finished_at || null : patch.finishedAt,
  };
  db.prepare(`
    INSERT INTO kugel_student_runs (student_id, classroom_id, lesson_id, started_at, reset_at, finished_at, updated_at)
    VALUES (?, ?, 0, ?, ?, ?, ?)
    ON CONFLICT(student_id) DO UPDATE SET
      classroom_id = excluded.classroom_id,
      lesson_id = 0,
      started_at = excluded.started_at,
      reset_at = excluded.reset_at,
      finished_at = excluded.finished_at,
      updated_at = excluded.updated_at
  `).run(studentId, classroomId, next.started_at, next.reset_at, next.finished_at, now);
  return db.prepare('SELECT * FROM kugel_student_runs WHERE student_id = ?').get(studentId);
}

function completeKugelClassroomProgress(db, studentId, summary) {
  const now = new Date().toISOString();
  const metadata = JSON.stringify({ coins: summary.coins, minecraftPlayerName: summary.minecraftPlayerName }).slice(0, 4000);
  const existing = db.prepare(`
    SELECT * FROM classroom_progress
    WHERE student_id = ? AND course_id = ? AND lesson_id = '0' AND activity_id = 'minecraft-maze'
  `).get(studentId, KUGEL_COURSE_ID);
  if (existing) {
    db.prepare(`
      UPDATE classroom_progress SET status = 'completed', score = 100,
        metadata_json = ?, completed_at = COALESCE(completed_at, ?), updated_at = ? WHERE id = ?
    `).run(metadata, now, now, existing.id);
    return db.prepare('SELECT * FROM classroom_progress WHERE id = ?').get(existing.id);
  }
  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO classroom_progress (
      id, student_id, course_id, lesson_id, activity_id, status, score, attempts,
      metadata_json, started_at, completed_at, updated_at
    ) VALUES (?, ?, ?, '0', 'minecraft-maze', 'completed', 100, 1, ?, ?, ?, ?)
  `).run(id, studentId, KUGEL_COURSE_ID, metadata, now, now, now);
  return db.prepare('SELECT * FROM classroom_progress WHERE id = ?').get(id);
}

async function handleKugelApi(req, res) {
  const url = requestUrl(req);
  const pathname = url.pathname;
  try {
    if (req.method === 'GET' && pathname === '/api/kugel/session') {
      const teacher = getClassroomTeacherFromRequest(req);
      if (teacher) {
        const classroomId = cleanText(url.searchParams.get('classroomId'), 80);
        if (!classroomId) return send(res, 400, JSON.stringify({ error: 'חסר מזהה כיתה.' }));
        const context = getTeacherKugelClass(req, classroomId);
        if (context.status) return send(res, context.status, JSON.stringify({ error: context.error }));
        if (!consumeKugelActionLimit(`teacher:${context.teacher.id}:${classroomId}:read`, 120)) {
          return send(res, 429, JSON.stringify({ error: 'יותר מדי רענונים. נסו שוב בעוד דקה.' }));
        }
        return send(res, 200, JSON.stringify(await kugelClassView(context, 'teacher')));
      }
      const context = getStudentKugelClass(req);
      if (context.status) return send(res, context.status, JSON.stringify({ error: context.error }));
      if (!consumeKugelActionLimit(`student:${context.student.id}:read`, 120)) {
        return send(res, 429, JSON.stringify({ error: 'יותר מדי רענונים. נסו שוב בעוד דקה.' }));
      }
      return send(res, 200, JSON.stringify(await kugelClassView(context, 'student')));
    }

    if (req.method !== 'POST') return send(res, 405, JSON.stringify({ error: 'Method not allowed' }));
    const body = JSON.parse(await readBody(req, 64 * 1024) || '{}');
    const linkMatch = pathname.match(/^\/api\/kugel\/classes\/([^/]+)\/students\/([^/]+)\/minecraft$/);
    if (linkMatch) {
      const context = getTeacherKugelClass(req, decodeURIComponent(linkMatch[1]));
      if (context.status) return send(res, context.status, JSON.stringify({ error: context.error }));
      if (!consumeKugelActionLimit(`teacher:${context.teacher.id}:${context.classroom.id}:link`, 60)) {
        return send(res, 429, JSON.stringify({ error: 'יותר מדי פעולות. נסו שוב בעוד דקה.' }));
      }
      const playerName = cleanMinecraftPlayerName(body.playerName);
      if (playerName === null) return send(res, 400, JSON.stringify({ error: 'שם השחקן ב-Minecraft אינו תקין.' }));
      try {
        const student = withSummerDb(db => {
          const row = db.prepare('SELECT id, name FROM classroom_students WHERE id = ? AND classroom_id = ?')
            .get(decodeURIComponent(linkMatch[2]), context.classroom.id);
          if (!row) return null;
          db.prepare('UPDATE classroom_students SET minecraft_player_name = ?, updated_at = ? WHERE id = ?')
            .run(playerName || null, new Date().toISOString(), row.id);
          return { ...row, minecraftPlayerName: playerName };
        });
        if (!student) return send(res, 404, JSON.stringify({ error: 'התלמיד/ה לא נמצא/ה.' }));
        return send(res, 200, JSON.stringify({ ok: true, student }));
      } catch (error) {
        if (String(error.code || '').startsWith('SQLITE_CONSTRAINT')) {
          return send(res, 409, JSON.stringify({ error: 'שם השחקן כבר משויך לתלמיד/ה אחר/ת בכיתה.' }));
        }
        throw error;
      }
    }

    const teacherAction = pathname.match(/^\/api\/kugel\/classes\/([^/]+)\/(launch|stop|message|freeze)$/);
    if (teacherAction) {
      const classroomId = decodeURIComponent(teacherAction[1]);
      const action = teacherAction[2];
      const context = getTeacherKugelClass(req, classroomId);
      if (context.status) return send(res, context.status, JSON.stringify({ error: context.error }));
      const maxActions = action === 'message' || action === 'freeze' ? 30 : 10;
      if (!consumeKugelActionLimit(`teacher:${context.teacher.id}:${classroomId}:${action}`, maxActions)) {
        return send(res, 429, JSON.stringify({ error: 'יותר מדי פעולות. נסו שוב בעוד דקה.' }));
      }
      if (!kugelMinecraftConfigured()) return send(res, 503, JSON.stringify({ error: 'חיבור Minecraft אינו מוגדר בשרת.' }));
      if (action === 'launch') {
        const now = new Date().toISOString();
        const eventsSince = Math.floor(Date.now() / 1000);
        const launchToken = crypto.randomUUID();
        let acquired = false;
        try {
          acquired = withSummerDb(db => db.transaction(() => {
            const activeOwner = db.prepare(`
              SELECT classroom_id FROM kugel_class_sessions
              WHERE active = 1 AND monitor_server_name = ? LIMIT 1
            `).get(KUGEL_MONITOR_SERVER_NAME);
            if (activeOwner) return false;
            db.prepare(`
              INSERT INTO kugel_class_sessions (
                classroom_id, lesson_id, active, monitor_server_name, world_id, events_since, launch_token,
                server_state, server_detail, created_at, updated_at
              ) VALUES (?, 0, 1, ?, ?, ?, ?, 'starting', ?, ?, ?)
              ON CONFLICT(classroom_id) DO UPDATE SET
                lesson_id = 0, active = 1, monitor_server_name = excluded.monitor_server_name,
                world_id = excluded.world_id, events_since = excluded.events_since, launch_token = excluded.launch_token,
                server_state = 'starting', server_detail = excluded.server_detail, updated_at = excluded.updated_at
            `).run(classroomId, KUGEL_MONITOR_SERVER_NAME, KUGEL_LESSON_ZERO.worldId, eventsSince, launchToken, 'מפעיל את עולם המבוך…', now, now);
            const students = db.prepare('SELECT id FROM classroom_students WHERE classroom_id = ?').all(classroomId);
            for (const student of students) upsertKugelRun(db, student.id, classroomId, { startedAt: null, resetAt: now, finishedAt: null });
            return true;
          })());
        } catch (error) {
          if (String(error.code || '').startsWith('SQLITE_CONSTRAINT')) acquired = false;
          else throw error;
        }
        if (!acquired) return send(res, 409, JSON.stringify({ error: 'שרת Minecraft נמצא כעת בשימוש של כיתה אחרת.' }));
        try {
          await kugelMonitorMutation('/api/internal/craftom-school/world/open', {
            method: 'POST',
            body: JSON.stringify({ server: KUGEL_MONITOR_SERVER_NAME, world: KUGEL_LESSON_ZERO.worldId, start_mode: 'reset' }),
          }, 130000);
          const activated = withSummerDb(db => db.prepare(`
            UPDATE kugel_class_sessions SET server_state = 'running', server_detail = ?, updated_at = ?
            WHERE classroom_id = ? AND launch_token = ? AND active = 1 AND server_state = 'starting'
          `).run('עולם המבוך פעיל.', new Date().toISOString(), classroomId, launchToken));
          if (!activated.changes) {
            await kugelMonitorMutation('/api/internal/craftom-school/live/freeze', {
              method: 'POST',
              body: JSON.stringify({ server: KUGEL_MONITOR_SERVER_NAME, scope: 'all', target: '', on: true, mode: 'full', restore: 'adventure' }),
            }).catch(error => console.error('kugel_stale_launch_freeze_error', { message: error.message }));
            return send(res, 409, JSON.stringify({ error: 'הפעלת העולם בוטלה משום שהשיעור שוחרר.' }));
          }
        } catch (error) {
          const stopping = withSummerDb(db => db.prepare(`
            UPDATE kugel_class_sessions SET server_state = 'stopping', server_detail = ?, updated_at = ?
            WHERE classroom_id = ? AND launch_token = ? AND active = 1 AND server_state = 'starting'
          `).run('פתיחת העולם לא אושרה; מקפיא את השרת לפני שחרור…', new Date().toISOString(), classroomId, launchToken));
          if (!stopping.changes) return send(res, 409, JSON.stringify({ error: 'הפעלת העולם כבר בוטלה.' }));
          await kugelMonitorMutation('/api/internal/craftom-school/live/freeze', {
            method: 'POST',
            body: JSON.stringify({ server: KUGEL_MONITOR_SERVER_NAME, scope: 'all', target: '', on: true, mode: 'full', restore: 'adventure' }),
          });
          const released = withSummerDb(db => db.prepare(`
            UPDATE kugel_class_sessions SET active = 0, server_state = 'idle', server_detail = ?, updated_at = ?
            WHERE classroom_id = ? AND launch_token = ? AND active = 1 AND server_state = 'stopping'
          `).run('פתיחת העולם נכשלה והשרת הוקפא ושוחרר.', new Date().toISOString(), classroomId, launchToken));
          if (!released.changes) return send(res, 409, JSON.stringify({ error: 'מצב השרת השתנה בזמן ניקוי פתיחה שנכשלה.' }));
          throw error;
        }
        const view = await kugelClassView(context, 'teacher', false);
        return send(res, 200, JSON.stringify(view));
      }
      if (action === 'stop') {
        const stoppingLease = withSummerDb(db => db.transaction(() => {
          const session = db.prepare('SELECT launch_token FROM kugel_class_sessions WHERE classroom_id = ? AND active = 1').get(classroomId);
          if (!session) return null;
          db.prepare(`
            UPDATE kugel_class_sessions SET server_state = 'stopping', server_detail = ?, updated_at = ?
            WHERE classroom_id = ? AND launch_token = ? AND active = 1
          `).run('עוצר ומקפיא את עולם המבוך…', new Date().toISOString(), classroomId, session.launch_token);
          return session;
        })());
        if (!stoppingLease) return send(res, 409, JSON.stringify({ error: 'אין שיעור פעיל לשחרור.' }));
        await kugelMonitorMutation('/api/internal/craftom-school/live/freeze', {
          method: 'POST',
          body: JSON.stringify({ server: KUGEL_MONITOR_SERVER_NAME, scope: 'all', target: '', on: true, mode: 'full', restore: 'adventure' }),
        });
        const released = withSummerDb(db => db.prepare(`
          UPDATE kugel_class_sessions SET active = 0, server_state = 'idle', server_detail = ?, updated_at = ?
          WHERE classroom_id = ? AND launch_token = ? AND active = 1 AND server_state = 'stopping'
        `).run('השיעור הסתיים והשרת שוחרר לכיתה אחרת.', new Date().toISOString(), classroomId, stoppingLease.launch_token));
        if (!released.changes) return send(res, 409, JSON.stringify({ error: 'מצב השרת השתנה לפני השלמת העצירה.' }));
        return send(res, 200, JSON.stringify({ ok: true, active: false }));
      }
      const activeSession = withSummerDb(db => db.prepare(`
        SELECT classroom_id FROM kugel_class_sessions WHERE classroom_id = ? AND active = 1 AND server_state = 'running'
      `).get(classroomId));
      if (!activeSession) return send(res, 409, JSON.stringify({ error: 'יש להפעיל את שיעור 0 לפני שליחת פקודות ל-Minecraft.' }));
      if (action === 'message') {
        const text = cleanText(body.text, 1000);
        if (!['all', 'player'].includes(body.scope)) return send(res, 400, JSON.stringify({ error: 'טווח ההודעה אינו תקין.' }));
        const scope = body.scope;
        const target = scope === 'player' ? cleanMinecraftPlayerName(body.target) : '';
        if (!text || target === null || (scope === 'player' && !target)) return send(res, 400, JSON.stringify({ error: 'ההודעה או התלמיד אינם תקינים.' }));
        if (scope === 'player') {
          const linked = withSummerDb(db => db.prepare(`
            SELECT id FROM classroom_students WHERE classroom_id = ? AND lower(minecraft_player_name) = lower(?)
          `).get(classroomId, target));
          if (!linked) return send(res, 404, JSON.stringify({ error: 'השחקן אינו משויך לכיתה הזאת.' }));
        }
        const result = await kugelMonitorMutation('/api/internal/craftom-school/live/message', {
          method: 'POST', body: JSON.stringify({ server: KUGEL_MONITOR_SERVER_NAME, text, scope, target }),
        });
        return send(res, 200, JSON.stringify({ ok: true, result }));
      }
      if (!['all', 'player'].includes(body.scope) || typeof body.on !== 'boolean') {
        return send(res, 400, JSON.stringify({ error: 'פקודת העצירה אינה תקינה.' }));
      }
      const scope = body.scope;
      const target = scope === 'player' ? cleanMinecraftPlayerName(body.target) : '';
      if (target === null || (scope === 'player' && !target)) return send(res, 400, JSON.stringify({ error: 'התלמיד אינו תקין.' }));
      if (scope === 'player') {
        const linked = withSummerDb(db => db.prepare(`
          SELECT id FROM classroom_students WHERE classroom_id = ? AND lower(minecraft_player_name) = lower(?)
        `).get(classroomId, target));
        if (!linked) return send(res, 404, JSON.stringify({ error: 'השחקן אינו משויך לכיתה הזאת.' }));
      }
      const result = await kugelMonitorMutation('/api/internal/craftom-school/live/freeze', {
        method: 'POST',
        body: JSON.stringify({ server: KUGEL_MONITOR_SERVER_NAME, scope, target, on: body.on, mode: 'full', restore: 'adventure' }),
      });
      return send(res, 200, JSON.stringify({ ok: true, result }));
    }

    const studentContext = getStudentKugelClass(req);
    if (studentContext.status) return send(res, studentContext.status, JSON.stringify({ error: studentContext.error }));
    if (!['/api/kugel/student/start', '/api/kugel/student/reset', '/api/kugel/student/finish'].includes(pathname)) {
      return send(res, 404, JSON.stringify({ error: 'Not found' }));
    }
    if (!consumeKugelActionLimit(`student:${studentContext.student.id}:lesson-zero`, 30)) {
      return send(res, 429, JSON.stringify({ error: 'יותר מדי פעולות. נסו שוב בעוד דקה.' }));
    }
    const state = withSummerDb(db => ({
      session: db.prepare('SELECT * FROM kugel_class_sessions WHERE classroom_id = ?').get(studentContext.classroom.id),
      student: db.prepare('SELECT * FROM classroom_students WHERE id = ? AND classroom_id = ?').get(studentContext.student.id, studentContext.classroom.id),
      run: db.prepare('SELECT * FROM kugel_student_runs WHERE student_id = ?').get(studentContext.student.id),
    }));
    if (!state.session?.active || state.session.server_state !== 'running') return send(res, 409, JSON.stringify({ error: 'המורה עדיין לא הפעילה את שיעור 0.' }));
    if (!state.student.minecraft_player_name) return send(res, 409, JSON.stringify({ error: 'המורה עדיין לא שייכה את שם השחקן שלך ב-Minecraft.' }));
    if (pathname === '/api/kugel/student/start') {
      const run = withSummerDb(db => upsertKugelRun(db, state.student.id, studentContext.classroom.id, { startedAt: new Date().toISOString(), finishedAt: null }));
      return send(res, 200, JSON.stringify({
        ok: true,
        lesson: KUGEL_LESSON_ZERO,
        student: summarizeKugelStudent(state.student, run, state.session, []),
        minecraft: kugelMinecraftInfo(),
      }));
    }
    if (pathname === '/api/kugel/student/reset') {
      const now = new Date().toISOString();
      const run = withSummerDb(db => upsertKugelRun(db, state.student.id, studentContext.classroom.id, { startedAt: null, resetAt: now, finishedAt: null }));
      return send(res, 200, JSON.stringify({ ok: true, student: summarizeKugelStudent(state.student, run, state.session, []) }));
    }
    const events = await kugelGameEvents(state.session);
    const summary = summarizeKugelStudent(state.student, state.run, state.session, events);
    if (!summary.completed) return send(res, 409, JSON.stringify({ error: 'כדי לסיים צריך לאסוף שמונה מטבעות וללחוץ על כפתור הסיום.' }));
    const progress = withSummerDb(db => db.transaction(() => {
      upsertKugelRun(db, state.student.id, studentContext.classroom.id, { finishedAt: summary.finishedAt || new Date().toISOString() });
      return completeKugelClassroomProgress(db, state.student.id, summary);
    })());
    return send(res, 200, JSON.stringify({ ok: true, progress: classroomProgressPublic(progress), student: summary }));
  } catch (error) {
    console.error('kugel_api_error', { path: pathname, message: error.message, code: error.code || null });
    if (error instanceof SyntaxError) return send(res, 400, JSON.stringify({ error: 'גוף הבקשה אינו JSON תקין.' }));
    if (error.message === 'payload_too_large') return send(res, 413, JSON.stringify({ error: 'גוף הבקשה גדול מדי.' }));
    const status = Number(error.statusCode) || (error.name === 'AbortError' ? 504 : 500);
    return send(res, status, JSON.stringify({ error: status >= 500 ? 'חיבור Minecraft נכשל.' : error.message }));
  }
}

async function handleClassroomApi(req, res) {
  const url = requestUrl(req);
  const segments = url.pathname.split('/').filter(Boolean);
  const action = segments[2];

  if (req.method === 'GET' && action === 'me') {
    const teacher = getClassroomTeacherFromRequest(req);
    if (teacher) return send(res, 200, JSON.stringify({
      ok: true,
      role: 'teacher',
      teacher: {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        courses: withSummerDb(db => teacherCourses(db, teacher.id)),
      },
    }));
    const student = getClassroomStudentFromRequest(req);
    if (student) return send(res, 200, JSON.stringify({
      ok: true,
      role: 'student',
      student: { id: student.id, name: student.name },
      classroom: {
        id: student.classroom_id,
        name: student.classroom_name,
        courses: withSummerDb(db => classroomCourses(db, student.classroom_id)),
      },
    }));
    return send(res, 200, JSON.stringify({ ok: true, role: 'guest', subscriptionGateEnabled: SUBSCRIPTION_GATE_ENABLED }));
  }

  if (req.method === 'GET' && action === 'admin-me') {
    return send(res, 200, JSON.stringify({ ok: true, role: getClassroomAdminFromRequest(req) ? 'admin' : 'guest' }));
  }

  if (req.method === 'GET' && action === 'admin' && segments[3] === 'teachers' && segments.length === 4) {
    if (!getClassroomAdminFromRequest(req)) return send(res, 401, JSON.stringify({ error: 'נדרשת כניסת מנהלת.' }));
    const teachers = withSummerDb(db => db.prepare(`
      SELECT id, name, email, created_at FROM classroom_teachers ORDER BY created_at
    `).all().map(teacher => ({
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
      courses: teacherCourses(db, teacher.id),
      createdAt: teacher.created_at,
      classes: db.prepare('SELECT id, name FROM classrooms WHERE teacher_id = ? ORDER BY created_at').all(teacher.id)
        .map(classroom => ({ id: classroom.id, name: classroom.name, courses: classroomCourses(db, classroom.id) })),
    })));
    return send(res, 200, JSON.stringify({ ok: true, teachers }));
  }

  if (req.method === 'GET' && action === 'classes' && segments.length === 3) {
    const teacher = getClassroomTeacherFromRequest(req);
    if (!teacher) return send(res, 401, JSON.stringify({ error: 'נדרשת כניסת מורה.' }));
    const classes = withSummerDb(db => db.prepare(`
      SELECT * FROM classrooms WHERE teacher_id = ? ORDER BY created_at
    `).all(teacher.id).map(classroom => ({
      id: classroom.id,
      name: classroom.name,
      joinCode: classroom.join_code,
      courses: classroomCourses(db, classroom.id),
      createdAt: classroom.created_at,
      students: db.prepare(`
        SELECT id, name, minecraft_player_name, created_at FROM classroom_students WHERE classroom_id = ? ORDER BY created_at
      `).all(classroom.id).map(student => ({
        id: student.id,
        name: student.name,
        minecraftPlayerName: student.minecraft_player_name || '',
        createdAt: student.created_at,
        progress: db.prepare('SELECT * FROM classroom_progress WHERE student_id = ? ORDER BY updated_at DESC')
          .all(student.id).map(classroomProgressPublic),
      })),
    })));
    return send(res, 200, JSON.stringify({
      ok: true,
      teacher: { id: teacher.id, name: teacher.name, email: teacher.email, courses: withSummerDb(db => teacherCourses(db, teacher.id)) },
      classes,
    }));
  }

  if (req.method !== 'POST') return send(res, 405, JSON.stringify({ error: 'Method not allowed' }));

  try {
    const body = JSON.parse(await readBody(req, 64 * 1024) || '{}');
    if (action === 'forgot-password') {
      const role = String(body.role || '').trim();
      const email = cleanEmail(body.email);
      if (!['admin', 'teacher'].includes(role)) return send(res, 400, JSON.stringify({ error: 'סוג המשתמש אינו תקין.' }));
      if (!emailLooksValid(email)) return send(res, 400, JSON.stringify({ error: 'כתובת המייל לא תקינה.' }));
      if (!emailDeliveryConfigured()) return send(res, 503, JSON.stringify({ error: 'שליחת מייל אינה מוגדרת כרגע.' }));
      if (role === 'admin') {
        if (!CLASSROOM_ADMIN_EMAIL) return send(res, 503, JSON.stringify({ error: 'איפוס מנהלת לא מוגדר כרגע.' }));
        if (email === CLASSROOM_ADMIN_EMAIL) {
          const code = withSummerDb(db => createPasswordReset(db, 'admin', email, 'default'));
          await sendEmail({
            to: email,
            subject: 'קוד איפוס למנהלת hai.tech',
            text: `קוד האימות שלך לאיפוס כניסת מנהלת הוא: ${code}\n\nהקוד תקף ל-15 דקות. אם לא ביקשת איפוס, אפשר להתעלם מהמייל הזה.`,
          });
        }
        return send(res, 200, JSON.stringify({ ok: true, message: 'אם המייל רשום במערכת, נשלח אליו קוד אימות.' }));
      }
      const teacher = withSummerDb(db => db.prepare('SELECT id, name, email FROM classroom_teachers WHERE email = ?').get(email));
      if (teacher) {
        const code = withSummerDb(db => createPasswordReset(db, 'teacher', email, teacher.id));
        await sendEmail({
          to: teacher.email,
          subject: 'קוד איפוס סיסמת מורה hai.tech',
          text: `שלום ${teacher.name},\n\nקוד האימות שלך לאיפוס סיסמת המורה הוא: ${code}\n\nהקוד תקף ל-15 דקות. אם לא ביקשת איפוס, אפשר להתעלם מהמייל הזה.`,
        });
      }
      return send(res, 200, JSON.stringify({ ok: true, message: 'אם המייל רשום במערכת, נשלח אליו קוד אימות.' }));
    }

    if (action === 'reset-password') {
      const role = String(body.role || '').trim();
      const email = cleanEmail(body.email);
      const code = String(body.code || '').trim();
      const password = String(body.password || '');
      if (!['admin', 'teacher'].includes(role)) return send(res, 400, JSON.stringify({ error: 'סוג המשתמש אינו תקין.' }));
      if (!emailLooksValid(email)) return send(res, 400, JSON.stringify({ error: 'כתובת המייל לא תקינה.' }));
      if (!/^\d{6}$/.test(code)) return send(res, 400, JSON.stringify({ error: 'קוד האימות צריך להכיל 6 ספרות.' }));
      if (password.length < 10) return send(res, 400, JSON.stringify({ error: 'הסיסמה החדשה צריכה להכיל לפחות 10 תווים.' }));
      const result = withSummerDb(db => db.transaction(() => {
        const reset = consumePasswordReset(db, role, email, code);
        if (!reset) return null;
        const now = new Date().toISOString();
        const salt = crypto.randomBytes(16).toString('hex');
        if (role === 'admin') {
          if (reset.target_id !== 'default' || email !== CLASSROOM_ADMIN_EMAIL) return null;
          setClassroomAdminCredential(db, password);
          db.prepare('UPDATE classroom_admin_sessions SET revoked_at = ? WHERE revoked_at IS NULL').run(now);
          return { role };
        }
        const teacher = db.prepare('SELECT id, name, email FROM classroom_teachers WHERE id = ? AND email = ?').get(reset.target_id, email);
        if (!teacher) return null;
        db.prepare('UPDATE classroom_teachers SET password_salt = ?, password_hash = ?, updated_at = ? WHERE id = ?')
          .run(salt, hashClassroomSecret(password, salt), now, teacher.id);
        db.prepare('UPDATE classroom_teacher_sessions SET revoked_at = ? WHERE teacher_id = ? AND revoked_at IS NULL').run(now, teacher.id);
        return { role, teacher };
      })());
      if (!result) return send(res, 400, JSON.stringify({ error: 'קוד האימות לא תקין או שפג תוקפו.' }));
      return send(res, 200, JSON.stringify({ ok: true, message: 'הסיסמה עודכנה. אפשר להיכנס מחדש.' }));
    }

    if (action === 'student-code-request') {
      const classCode = cleanAccessCode(body.classCode);
      const studentName = cleanText(body.studentName, 80);
      if (!classCode || studentName.length < 2) return send(res, 400, JSON.stringify({ error: 'נא למלא קוד כיתה ושם תלמיד/ה.' }));
      if (!emailDeliveryConfigured()) return send(res, 503, JSON.stringify({ error: 'שליחת מייל אינה מוגדרת כרגע.' }));
      const context = withSummerDb(db => db.prepare(`
        SELECT s.id, s.name AS student_name, c.name AS classroom_name, c.join_code, t.name AS teacher_name, t.email AS teacher_email
        FROM classroom_students s
        JOIN classrooms c ON c.id = s.classroom_id
        JOIN classroom_teachers t ON t.id = c.teacher_id
        WHERE c.join_code = ? AND lower(s.name) = lower(?)
        LIMIT 1
      `).get(classCode, studentName));
      if (context) {
        await sendEmail({
          to: context.teacher_email,
          subject: `בקשת קוד כניסה מתלמיד/ה בכיתה ${context.classroom_name}`,
          text: `שלום ${context.teacher_name},\n\n${context.student_name} ביקש/ה לקבל שוב את קוד הכניסה האישי לכיתה ${context.classroom_name}.\nקוד הכיתה: ${context.join_code}\n\nהקוד האישי הקיים אינו מוצג במערכת מטעמי אבטחה. אם הוא שמור אצלך בקובץ התלמידים, אפשר להעביר אותו לתלמיד/ה. אם לא, אפשר להיכנס למסך המורה וללחוץ על "יצירת קודי כניסה חדשים לקובץ".\n\nהודעה זו נשלחה אוטומטית ממערכת hai.tech.`,
        });
      }
      return send(res, 200, JSON.stringify({ ok: true, message: 'אם נמצאה התאמה במערכת, נשלחה בקשה למורה.' }));
    }

    if (action === 'admin-login') {
      const loginKey = classroomLoginKey(req, 'classroom-admin', 'global');
      if (isClassroomLoginLimited(loginKey)) {
        return send(res, 429, JSON.stringify({ error: 'יותר מדי ניסיונות. נסו שוב בעוד כמה דקות.' }));
      }
      if (!classroomAdminCodeMatches(body.code)) {
        recordClassroomLoginFailure(loginKey);
        return send(res, 401, JSON.stringify({ error: 'קוד המנהלת אינו נכון.' }));
      }
      clearClassroomLoginFailures(loginKey);
      const token = withSummerDb(db => createClassroomAdminSession(db));
      return sendWithHeaders(res, 200, JSON.stringify({ ok: true, role: 'admin' }), 'application/json; charset=utf-8', {
        'Set-Cookie': classroomAdminSessionCookie(token),
      });
    }

    if (action === 'admin-logout') {
      const token = parseCookies(req).haiTechClassroomAdminToken || '';
      if (token) withSummerDb(db => db.prepare('UPDATE classroom_admin_sessions SET revoked_at = ? WHERE token_hash = ?')
        .run(new Date().toISOString(), tokenHash(token)));
      return sendWithHeaders(res, 200, JSON.stringify({ ok: true }), 'application/json; charset=utf-8', {
        'Set-Cookie': clearClassroomAdminSessionCookie(),
      });
    }

    if (action === 'admin' && segments[3] === 'teachers' && segments[4] && segments[5] === 'courses' && segments.length === 6) {
      if (!getClassroomAdminFromRequest(req)) return send(res, 401, JSON.stringify({ error: 'נדרשת כניסת מנהלת.' }));
      const courses = cleanClassroomCourses(body.courses);
      if (!courses) return send(res, 400, JSON.stringify({ error: 'רשימת הלומדות אינה תקינה.' }));
      const result = withSummerDb(db => {
        const teacher = db.prepare('SELECT id, name, email FROM classroom_teachers WHERE id = ?').get(segments[4]);
        if (!teacher) return null;
        const update = db.transaction(() => {
          const releasedLeases = courses.includes(KUGEL_COURSE_ID) ? [] : db.prepare(`
            SELECT kms.classroom_id, kms.monitor_server_name, kms.launch_token
            FROM kugel_class_sessions kms
            JOIN classrooms c ON c.id = kms.classroom_id
            WHERE c.teacher_id = ? AND kms.active = 1
          `).all(teacher.id);
          for (const lease of releasedLeases) {
            db.prepare(`
              UPDATE kugel_class_sessions SET server_state = 'stopping', server_detail = ?, updated_at = ?
              WHERE classroom_id = ? AND launch_token = ? AND active = 1
            `).run('ההרשאה הוסרה; עולם המבוך בתהליך עצירה…', new Date().toISOString(), lease.classroom_id, lease.launch_token);
          }
          replaceTeacherCourses(db, teacher.id, courses);
          const affectedClasses = db.prepare('SELECT id, name FROM classrooms WHERE teacher_id = ? ORDER BY created_at').all(teacher.id)
            .map(classroom => ({ id: classroom.id, name: classroom.name, courses: classroomCourses(db, classroom.id) }));
          return { teacher: { ...teacher, courses: teacherCourses(db, teacher.id) }, affectedClasses, releasedLeases };
        });
        return update();
      });
      if (!result) return send(res, 404, JSON.stringify({ error: 'המורה לא נמצאה.' }));
      const { releasedLeases, ...publicResult } = result;
      const freezeFailures = [];
      for (const lease of releasedLeases) {
        try {
          await kugelMonitorMutation('/api/internal/craftom-school/live/freeze', {
            method: 'POST',
            body: JSON.stringify({ server: lease.monitor_server_name, scope: 'all', target: '', on: true, mode: 'full', restore: 'adventure' }),
          });
          withSummerDb(db => db.prepare(`
            DELETE FROM kugel_class_sessions
            WHERE classroom_id = ? AND launch_token = ? AND active = 1 AND server_state = 'stopping'
          `).run(lease.classroom_id, lease.launch_token));
        } catch (error) {
          console.error('kugel_entitlement_revoke_freeze_error', { teacherId: segments[4], message: error.message });
          freezeFailures.push(lease.classroom_id);
        }
      }
      return send(res, 200, JSON.stringify({
        ok: true,
        ...publicResult,
        warning: freezeFailures.length ? 'ההרשאה הוסרה. עצירת עולם Minecraft לא הושלמה אוטומטית, אבל הגישה ללומדה חסומה לפי ההרשאות החדשות.' : '',
      }));
    }

    if (action === 'logout') {
      const token = parseCookies(req).haiTechClassroomToken || '';
      if (token) withSummerDb(db => {
        const now = new Date().toISOString();
        const hash = tokenHash(token);
        db.prepare('UPDATE classroom_teacher_sessions SET revoked_at = ? WHERE token_hash = ?').run(now, hash);
        db.prepare('UPDATE classroom_student_sessions SET revoked_at = ? WHERE token_hash = ?').run(now, hash);
      });
      return sendWithHeaders(res, 200, JSON.stringify({ ok: true }), 'application/json; charset=utf-8', {
        'Set-Cookie': clearClassroomSessionCookie(),
      });
    }

    if (action === 'progress') {
      const student = getClassroomStudentFromRequest(req);
      if (!student) return send(res, 401, JSON.stringify({ error: 'נדרשת כניסת תלמיד/ה לכיתה.' }));
      const courseId = cleanText(body.courseId, 80);
      const lessonId = cleanText(body.lessonId, 80);
      const activityId = cleanText(body.activityId, 80);
      const status = body.status === 'completed' ? 'completed' : 'started';
      const score = Math.max(0, Math.min(100, Number(body.score || 0)));
      if (!CLASSROOM_COURSES.has(courseId)) return send(res, 400, JSON.stringify({ error: 'הקורס אינו מוכר.' }));
      if (!withSummerDb(db => classroomHasCourse(db, student.classroom_id, courseId))) {
        return send(res, 403, JSON.stringify({ error: 'הלומדה אינה פתוחה לכיתה הזו.' }));
      }
      if (!lessonId || !activityId) return send(res, 400, JSON.stringify({ error: 'חסרים פרטי התקדמות.' }));
      const metadata = body.metadata && typeof body.metadata === 'object' ? body.metadata : {};
      const metadataJson = JSON.stringify(metadata).slice(0, 4000);
      const row = withSummerDb(db => {
        const now = new Date().toISOString();
        const existing = db.prepare(`
          SELECT * FROM classroom_progress
          WHERE student_id = ? AND course_id = ? AND lesson_id = ? AND activity_id = ?
        `).get(student.id, courseId, lessonId, activityId);
        if (existing) {
          const effectiveStatus = existing.status === 'completed' ? 'completed' : status;
          const completedAt = effectiveStatus === 'completed' ? (existing.completed_at || now) : null;
          db.prepare(`
            UPDATE classroom_progress
            SET status = ?, score = MAX(score, ?), attempts = attempts + 1,
                metadata_json = ?, completed_at = ?, updated_at = ?
            WHERE id = ?
          `).run(effectiveStatus, score, metadataJson, completedAt, now, existing.id);
          return db.prepare('SELECT * FROM classroom_progress WHERE id = ?').get(existing.id);
        }
        const id = crypto.randomUUID();
        db.prepare(`
          INSERT INTO classroom_progress (
            id, student_id, course_id, lesson_id, activity_id, status, score, attempts,
            metadata_json, started_at, completed_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?)
        `).run(id, student.id, courseId, lessonId, activityId, status, score, metadataJson, now, status === 'completed' ? now : null, now);
        return db.prepare('SELECT * FROM classroom_progress WHERE id = ?').get(id);
      });
      return send(res, 200, JSON.stringify({ ok: true, progress: classroomProgressPublic(row) }));
    }

    if (action === 'student-login') {
      const classCode = cleanAccessCode(body.classCode);
      const personalCode = cleanAccessCode(body.personalCode);
      const loginKey = classroomLoginKey(req, 'student', classCode);
      if (isClassroomLoginLimited(loginKey)) {
        return send(res, 429, JSON.stringify({ error: 'יותר מדי ניסיונות. נסו שוב בעוד כמה דקות.' }));
      }
      const result = withSummerDb(db => {
        const classroom = db.prepare('SELECT * FROM classrooms WHERE join_code = ?').get(classCode);
        if (!classroom || !personalCode) return null;
        const students = db.prepare('SELECT * FROM classroom_students WHERE classroom_id = ?').all(classroom.id);
        const student = students.find(candidate => {
          const provided = Buffer.from(hashClassroomSecret(personalCode, candidate.login_salt), 'hex');
          const expected = Buffer.from(candidate.login_hash, 'hex');
          return provided.length === expected.length && crypto.timingSafeEqual(provided, expected);
        });
        if (!student) return null;
        return { classroom, student, token: createClassroomStudentSession(db, student.id) };
      });
      if (!result) {
        recordClassroomLoginFailure(loginKey);
        return send(res, 401, JSON.stringify({ error: 'קוד כיתה או קוד אישי אינם נכונים.' }));
      }
      clearClassroomLoginFailures(loginKey);
      return sendWithHeaders(res, 200, JSON.stringify({
        ok: true,
        role: 'student',
        student: { id: result.student.id, name: result.student.name },
        classroom: {
          id: result.classroom.id,
          name: result.classroom.name,
          courses: withSummerDb(db => classroomCourses(db, result.classroom.id)),
        },
      }), 'application/json; charset=utf-8', {
        'Set-Cookie': classroomSessionCookie(result.token),
      });
    }

    if (action === 'classes' && segments[3] && segments[4] === 'courses' && segments.length === 5) {
      const teacher = getClassroomTeacherFromRequest(req);
      if (!teacher) return send(res, 401, JSON.stringify({ error: 'נדרשת כניסת מורה.' }));
      const courses = cleanClassroomCourses(body.courses);
      if (!courses?.length) return send(res, 400, JSON.stringify({ error: 'בחרו לפחות לומדה אחת תקינה לכיתה.' }));
      const result = withSummerDb(db => {
        const row = db.prepare('SELECT * FROM classrooms WHERE id = ? AND teacher_id = ?').get(segments[3], teacher.id);
        if (!row) return null;
        if (!teacherCanAssignCourses(db, teacher.id, courses)) return { forbidden: true };
        const updateCourses = db.transaction(() => {
          const releasedLease = courses.includes(KUGEL_COURSE_ID) ? null : db.prepare(`
            SELECT classroom_id, monitor_server_name, launch_token
            FROM kugel_class_sessions WHERE classroom_id = ? AND active = 1
          `).get(row.id) || null;
          if (releasedLease) {
            db.prepare(`
              UPDATE kugel_class_sessions SET server_state = 'stopping', server_detail = ?, updated_at = ?
              WHERE classroom_id = ? AND launch_token = ? AND active = 1
            `).run('הרשאת הכיתה הוסרה; עולם המבוך בתהליך עצירה…', new Date().toISOString(), row.id, releasedLease.launch_token);
          }
          replaceClassroomCourses(db, row.id, courses);
          return releasedLease;
        });
        return { classroom: row, releasedLease: updateCourses() };
      });
      if (!result) return send(res, 404, JSON.stringify({ error: 'הכיתה לא נמצאה.' }));
      if (result.forbidden) return send(res, 403, JSON.stringify({ error: 'אפשר לשייך לכיתה רק לומדות שהוקצו לך.' }));
      if (result.releasedLease) {
        let freezeWarning = '';
        try {
          await kugelMonitorMutation('/api/internal/craftom-school/live/freeze', {
            method: 'POST',
            body: JSON.stringify({ server: result.releasedLease.monitor_server_name, scope: 'all', target: '', on: true, mode: 'full', restore: 'adventure' }),
          });
          withSummerDb(db => db.prepare(`
            DELETE FROM kugel_class_sessions
            WHERE classroom_id = ? AND launch_token = ? AND active = 1 AND server_state = 'stopping'
          `).run(result.releasedLease.classroom_id, result.releasedLease.launch_token));
        } catch (error) {
          console.error('kugel_class_course_revoke_freeze_error', { classroomId: segments[3], message: error.message });
          freezeWarning = 'ההרשאה הוסרה. עצירת עולם Minecraft לא הושלמה אוטומטית, אבל הגישה ללומדה חסומה לפי ההרשאות החדשות.';
        }
        result.freezeWarning = freezeWarning;
      }
      const classroom = result.classroom;
      return send(res, 200, JSON.stringify({
        ok: true,
        warning: result.freezeWarning || '',
        classroom: {
          id: classroom.id,
          name: classroom.name,
          joinCode: classroom.join_code,
          courses,
          updatedAt: new Date().toISOString(),
        },
      }));
    }

    if (action === 'classes' && segments[3] && segments[4] === 'students' && segments[5] === 'reset-codes' && segments.length === 6) {
      const teacher = getClassroomTeacherFromRequest(req);
      if (!teacher) return send(res, 401, JSON.stringify({ error: 'נדרשת כניסת מורה.' }));
      const result = withSummerDb(db => db.transaction(() => {
        const classroom = db.prepare('SELECT * FROM classrooms WHERE id = ? AND teacher_id = ?').get(segments[3], teacher.id);
        if (!classroom) return null;
        const now = new Date().toISOString();
        const students = db.prepare('SELECT id, name, minecraft_player_name, created_at FROM classroom_students WHERE classroom_id = ? ORDER BY created_at').all(classroom.id);
        const rows = students.map(student => {
          const loginCode = generatePersonalLoginCode(db, classroom.id);
          const salt = crypto.randomBytes(16).toString('hex');
          db.prepare(`
            UPDATE classroom_students
            SET login_salt = ?, login_hash = ?, updated_at = ?
            WHERE id = ? AND classroom_id = ?
          `).run(salt, hashClassroomSecret(loginCode, salt), now, student.id, classroom.id);
          return {
            id: student.id,
            name: student.name,
            loginCode,
            minecraftPlayerName: student.minecraft_player_name || '',
            createdAt: student.created_at,
            updatedAt: now,
          };
        });
        return {
          classroom: { id: classroom.id, name: classroom.name, joinCode: classroom.join_code },
          students: rows,
        };
      })());
      if (!result) return send(res, 404, JSON.stringify({ error: 'הכיתה לא נמצאה.' }));
      return send(res, 200, JSON.stringify({ ok: true, ...result }));
    }

    if (action === 'classes' && segments[3] && segments[4] === 'students' && segments.length === 5) {
      const teacher = getClassroomTeacherFromRequest(req);
      if (!teacher) return send(res, 401, JSON.stringify({ error: 'נדרשת כניסת מורה.' }));
      const name = cleanText(body.name, 80);
      if (name.length < 2) return send(res, 400, JSON.stringify({ error: 'נא למלא שם תלמיד/ה.' }));
      const result = withSummerDb(db => {
        const classroom = db.prepare('SELECT * FROM classrooms WHERE id = ? AND teacher_id = ?').get(segments[3], teacher.id);
        if (!classroom) return null;
        const now = new Date().toISOString();
        const loginCode = generatePersonalLoginCode(db, classroom.id);
        const salt = crypto.randomBytes(16).toString('hex');
        const student = {
          id: crypto.randomUUID(),
          classroom_id: classroom.id,
          name,
          login_salt: salt,
          login_hash: hashClassroomSecret(loginCode, salt),
          created_at: now,
          updated_at: now,
        };
        db.prepare(`
          INSERT INTO classroom_students (id, classroom_id, name, login_salt, login_hash, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(student.id, student.classroom_id, student.name, student.login_salt, student.login_hash, student.created_at, student.updated_at);
        return { student, loginCode };
      });
      if (!result) return send(res, 404, JSON.stringify({ error: 'הכיתה לא נמצאה.' }));
      return send(res, 201, JSON.stringify({
        ok: true,
        student: { id: result.student.id, name: result.student.name, loginCode: result.loginCode, createdAt: result.student.created_at },
      }));
    }

    if (action === 'classes' && segments.length === 3) {
      const teacher = getClassroomTeacherFromRequest(req);
      if (!teacher) return send(res, 401, JSON.stringify({ error: 'נדרשת כניסת מורה.' }));
      const name = cleanText(body.name, 80);
      if (name.length < 2) return send(res, 400, JSON.stringify({ error: 'נא למלא שם כיתה.' }));
      const courses = cleanClassroomCourses(body.courses);
      if (!courses?.length) return send(res, 400, JSON.stringify({ error: 'בחרו לפחות לומדה אחת תקינה לכיתה.' }));
      const result = withSummerDb(db => {
        if (!teacherCanAssignCourses(db, teacher.id, courses)) return { forbidden: true };
        const createClassroom = db.transaction(() => {
          const now = new Date().toISOString();
          const row = {
            id: crypto.randomUUID(),
            teacher_id: teacher.id,
            name,
            join_code: generateClassJoinCode(db),
            created_at: now,
            updated_at: now,
          };
          db.prepare(`
            INSERT INTO classrooms (id, teacher_id, name, join_code, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
          `).run(row.id, row.teacher_id, row.name, row.join_code, row.created_at, row.updated_at);
          replaceClassroomCourses(db, row.id, courses);
          return row;
        });
        return { classroom: createClassroom() };
      });
      if (result.forbidden) return send(res, 403, JSON.stringify({ error: 'אפשר לשייך לכיתה רק לומדות שהוקצו לך.' }));
      const classroom = result.classroom;
      return send(res, 201, JSON.stringify({
        ok: true,
        classroom: {
          id: classroom.id,
          name: classroom.name,
          joinCode: classroom.join_code,
          courses,
          createdAt: classroom.created_at,
        },
      }));
    }

    if (action === 'teacher-login') {
      const email = cleanEmail(body.email);
      const password = String(body.password || '');
      const loginKey = classroomLoginKey(req, 'teacher', email);
      if (isClassroomLoginLimited(loginKey)) {
        return send(res, 429, JSON.stringify({ error: 'יותר מדי ניסיונות. נסו שוב בעוד כמה דקות.' }));
      }
      const result = withSummerDb(db => {
        const teacher = db.prepare('SELECT * FROM classroom_teachers WHERE email = ?').get(email);
        if (!teacher) return null;
        const provided = Buffer.from(hashClassroomSecret(password, teacher.password_salt), 'hex');
        const expected = Buffer.from(teacher.password_hash, 'hex');
        if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) return null;
        return { teacher, token: createClassroomTeacherSession(db, teacher.id) };
      });
      if (!result) {
        recordClassroomLoginFailure(loginKey);
        return send(res, 401, JSON.stringify({ error: 'מייל או סיסמה לא נכונים.' }));
      }
      clearClassroomLoginFailures(loginKey);
      return sendWithHeaders(res, 200, JSON.stringify({
        ok: true,
        role: 'teacher',
        teacher: {
          id: result.teacher.id,
          name: result.teacher.name,
          email: result.teacher.email,
          courses: withSummerDb(db => teacherCourses(db, result.teacher.id)),
        },
      }), 'application/json; charset=utf-8', {
        'Set-Cookie': classroomSessionCookie(result.token),
      });
    }

    if (action === 'teacher-register') {
      const name = cleanText(body.name, 80);
      const email = cleanEmail(body.email);
      const password = String(body.password || '');
      if (!CLASSROOM_TEACHER_INVITE_CODE) {
        return send(res, 503, JSON.stringify({ error: 'הרשמת מורים אינה פתוחה כרגע.' }));
      }
      const inviteKey = classroomLoginKey(req, 'teacher-invite', 'global');
      if (isClassroomLoginLimited(inviteKey)) {
        return send(res, 429, JSON.stringify({ error: 'יותר מדי ניסיונות. נסו שוב בעוד כמה דקות.' }));
      }
      if (!classroomInviteMatches(body.inviteCode)) {
        recordClassroomLoginFailure(inviteKey);
        return send(res, 403, JSON.stringify({ error: 'קוד ההזמנה למורה אינו נכון.' }));
      }
      clearClassroomLoginFailures(inviteKey);
      if (name.length < 2) return send(res, 400, JSON.stringify({ error: 'נא למלא שם מורה.' }));
      if (!/^\S+@\S+\.\S+$/.test(email)) return send(res, 400, JSON.stringify({ error: 'כתובת המייל לא תקינה.' }));
      if (password.length < 10) return send(res, 400, JSON.stringify({ error: 'הסיסמה צריכה להכיל לפחות 10 תווים.' }));

      const result = withSummerDb(db => {
        if (db.prepare('SELECT id FROM classroom_teachers WHERE email = ?').get(email)) return { conflict: true };
        const now = new Date().toISOString();
        const salt = crypto.randomBytes(16).toString('hex');
        const teacher = {
          id: crypto.randomUUID(),
          name,
          email,
          password_salt: salt,
          password_hash: hashClassroomSecret(password, salt),
          created_at: now,
          updated_at: now,
        };
        db.prepare(`
          INSERT INTO classroom_teachers (id, name, email, password_salt, password_hash, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(teacher.id, teacher.name, teacher.email, teacher.password_salt, teacher.password_hash, teacher.created_at, teacher.updated_at);
        return { teacher, token: createClassroomTeacherSession(db, teacher.id) };
      });

      if (result.conflict) return send(res, 409, JSON.stringify({ error: 'כבר קיים חשבון מורה עם המייל הזה.' }));
      return sendWithHeaders(res, 201, JSON.stringify({
        ok: true,
        role: 'teacher',
        teacher: {
          id: result.teacher.id,
          name: result.teacher.name,
          email: result.teacher.email,
          courses: withSummerDb(db => teacherCourses(db, result.teacher.id)),
        },
      }), 'application/json; charset=utf-8', {
        'Set-Cookie': classroomSessionCookie(result.token),
      });
    }
    return send(res, 404, JSON.stringify({ error: 'Not found' }));
  } catch (error) {
    console.error('classroom_api_error', error);
    return send(res, 400, JSON.stringify({ error: 'לא הצלחנו לטפל בבקשה.' }));
  }
}

function readBody(req, maxBytes = 64 * 1024) {
  return new Promise((resolve, reject) => {
    let data = '';
    let tooLarge = false;
    req.setEncoding('utf8');
    req.on('data', chunk => {
      if (tooLarge) return;
      data += chunk;
      if (Buffer.byteLength(data, 'utf8') > maxBytes) {
        tooLarge = true;
        data = '';
      }
    });
    req.on('end', () => tooLarge ? reject(new Error('payload_too_large')) : resolve(data));
    req.on('error', reject);
  });
}

function cleanText(value, max = 2000) {
  return String(value || '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

function readFeedbackItems() {
  if (!fs.existsSync(FEEDBACK_FILE)) return [];
  return fs.readFileSync(FEEDBACK_FILE, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map(line => {
      try { return JSON.parse(line); } catch { return null; }
    })
    .filter(Boolean)
    .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
}

function writeFeedbackItems(items) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const lines = items.map(item => JSON.stringify(item)).join('\n');
  fs.writeFileSync(FEEDBACK_FILE, lines ? lines + '\n' : '', 'utf8');
}

function saveImageAttachment(feedbackId, attachment) {
  if (!attachment || !attachment.dataUrl) return null;
  const match = String(attachment.dataUrl).match(/^data:(image\/(png|jpeg|jpg|webp|gif));base64,([A-Za-z0-9+/=]+)$/);
  if (!match) throw new Error('invalid_attachment');
  const mime = match[1];
  const subtype = match[2] === 'jpeg' ? 'jpg' : match[2];
  const buffer = Buffer.from(match[3], 'base64');
  if (!buffer.length || buffer.length > 5 * 1024 * 1024) throw new Error('attachment_too_large');
  fs.mkdirSync(ATTACHMENTS_DIR, { recursive: true });
  const safeName = cleanText(attachment.name, 80).replace(/[^\w.א-ת-]+/g, '_') || `image.${subtype}`;
  const filename = `${feedbackId}-${Date.now()}.${subtype}`;
  const fullPath = path.join(ATTACHMENTS_DIR, filename);
  fs.writeFileSync(fullPath, buffer);
  return {
    path: path.relative(ROOT, fullPath),
    name: safeName,
    mime,
    size: buffer.length,
  };
}

function saveCraftomExitTicketImage(submissionId, attachment) {
  if (!attachment || !attachment.dataUrl) throw new Error('missing_photo');
  const match = String(attachment.dataUrl).match(/^data:(image\/(png|jpeg|jpg|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!match) throw new Error('invalid_attachment');
  const mime = match[1];
  const subtype = match[2] === 'jpeg' ? 'jpg' : match[2];
  const buffer = Buffer.from(match[3], 'base64');
  if (!buffer.length || buffer.length > 5 * 1024 * 1024) throw new Error('attachment_too_large');
  fs.mkdirSync(CRAFTOM_EXIT_ATTACHMENTS_DIR, { recursive: true });
  const safeName = cleanText(attachment.name, 80).replace(/[^\w.א-ת-]+/g, '_') || `craftom.${subtype}`;
  const filename = `${submissionId}-${Date.now()}.${subtype}`;
  const fullPath = path.join(CRAFTOM_EXIT_ATTACHMENTS_DIR, filename);
  fs.writeFileSync(fullPath, buffer);
  return {
    path: path.relative(ROOT, fullPath),
    name: safeName,
    mime,
    size: buffer.length,
  };
}

async function handleCraftomExitTicket(req, res) {
  if (req.method !== 'POST') return send(res, 405, JSON.stringify({ error: 'Method not allowed' }));
  try {
    const raw = await readBody(req, 7 * 1024 * 1024);
    const body = JSON.parse(raw || '{}');
    const lessonId = cleanText(body.lessonId, 30);
    const challengeId = cleanText(body.challengeId, 30);
    const lessonTitle = cleanText(body.lessonTitle, 180);
    const challengeTitle = cleanText(body.challengeTitle, 180);
    const studentName = cleanText(body.studentName, 160);
    const answer = cleanText(body.answer, 3000);

    if (!lessonId || !challengeId) return send(res, 400, JSON.stringify({ error: 'חסרים פרטי שיעור.' }));
    if (answer.length < 3) return send(res, 400, JSON.stringify({ error: 'נא לכתוב תשובה קצרה לכרטיס היציאה.' }));

    fs.mkdirSync(DATA_DIR, { recursive: true });
    const id = crypto.randomUUID();
    const photo = saveCraftomExitTicketImage(id, body.photo);
    const item = {
      id,
      courseId: 'craftom-minecraft-grade7',
      lessonId,
      challengeId,
      lessonTitle,
      challengeTitle,
      studentName,
      answer,
      photo,
      userAgent: cleanText(req.headers['user-agent'], 500),
      ip: cleanText(req.headers['x-forwarded-for'] || req.socket.remoteAddress, 120),
      createdAt: new Date().toISOString(),
    };
    fs.appendFileSync(CRAFTOM_EXIT_TICKETS_FILE, JSON.stringify(item) + '\n', 'utf8');
    return send(res, 201, JSON.stringify({ ok: true, id }));
  } catch (error) {
    const status = error.message === 'payload_too_large' || error.message === 'attachment_too_large' ? 413 : 400;
    const messages = {
      missing_photo: 'חובה לצרף תמונה של מה שבניתם במיינקראפט.',
      invalid_attachment: 'אפשר להעלות רק תמונת PNG, JPG או WebP.',
      attachment_too_large: 'התמונה גדולה מדי. אפשר להעלות תמונה עד 5MB.',
      payload_too_large: 'ההגשה גדולה מדי. אפשר להעלות תמונה עד 5MB.',
    };
    return send(res, status, JSON.stringify({ error: messages[error.message] || 'לא הצלחנו לשמור את כרטיס היציאה.' }));
  }
}

async function handleFeedback(req, res) {
  if (req.method !== 'POST') return send(res, 405, JSON.stringify({ error: 'Method not allowed' }));
  try {
    const raw = await readBody(req, 7 * 1024 * 1024);
    const body = JSON.parse(raw || '{}');
    const kind = body.kind === 'feature' ? 'feature' : 'bug';
    const message = cleanText(body.message, 3000);
    const page = cleanText(body.page, 500);
    const lesson = cleanText(body.lesson, 80);
    const contact = cleanText(body.contact, 200);

    if (message.length < 5) {
      return send(res, 400, JSON.stringify({ error: 'נא לכתוב לפחות כמה מילים.' }));
    }

    fs.mkdirSync(DATA_DIR, { recursive: true });
    const id = crypto.randomUUID();
    const attachment = saveImageAttachment(id, body.attachment);
    const item = {
      id,
      kind,
      message,
      page,
      lesson,
      contact,
      attachment,
      userAgent: cleanText(req.headers['user-agent'], 500),
      ip: cleanText(req.headers['x-forwarded-for'] || req.socket.remoteAddress, 120),
      createdAt: new Date().toISOString(),
      status: 'open',
    };
    fs.appendFileSync(FEEDBACK_FILE, JSON.stringify(item) + '\n', 'utf8');
    return send(res, 201, JSON.stringify({ ok: true, id: item.id }));
  } catch (error) {
    const status = error.message === 'payload_too_large' || error.message === 'attachment_too_large' ? 413 : 400;
    const message = status === 413 ? 'התמונה גדולה מדי. אפשר לצרף תמונה עד 5MB.' : 'לא הצלחנו לשמור את הדיווח.';
    return send(res, status, JSON.stringify({ error: message }));
  }
}

async function handleAdminFeedback(req, res) {
  if (!requireAdmin(req, res)) return;
  const url = requestUrl(req);
  const parts = url.pathname.split('/').filter(Boolean);
  const id = parts[3];
  const action = parts[4];

  if (req.method === 'GET' && !id) {
    const items = readFeedbackItems();
    const stats = items.reduce((acc, item) => {
      acc.total += 1;
      acc.byStatus[item.status || 'open'] = (acc.byStatus[item.status || 'open'] || 0) + 1;
      acc.byKind[item.kind || 'bug'] = (acc.byKind[item.kind || 'bug'] || 0) + 1;
      const assignee = item.assignee || 'לא משויך';
      acc.byAssignee[assignee] = (acc.byAssignee[assignee] || 0) + 1;
      return acc;
    }, { total: 0, byStatus: {}, byKind: {}, byAssignee: {} });
    return send(res, 200, JSON.stringify({ ok: true, stats, items }));
  }

  if (req.method === 'GET' && id && action === 'attachment') {
    const item = readFeedbackItems().find(entry => entry.id === id);
    if (!item || !item.attachment || !item.attachment.path) return send(res, 404, 'Not found', 'text/plain; charset=utf-8');
    const fullPath = path.normalize(path.join(ROOT, item.attachment.path));
    if (!fullPath.startsWith(ATTACHMENTS_DIR + path.sep)) return send(res, 403, 'Forbidden', 'text/plain; charset=utf-8');
    if (!fs.existsSync(fullPath)) return send(res, 404, 'Not found', 'text/plain; charset=utf-8');
    res.writeHead(200, {
      'Content-Type': item.attachment.mime || 'application/octet-stream',
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    return fs.createReadStream(fullPath).pipe(res);
  }

  if (req.method === 'PATCH' && id) {
    const raw = await readBody(req, 64 * 1024);
    const body = JSON.parse(raw || '{}');
    const hasStatus = Object.prototype.hasOwnProperty.call(body, 'status');
    const hasAssignee = Object.prototype.hasOwnProperty.call(body, 'assignee');
    const status = hasStatus && ['open', 'in_progress', 'done', 'wont_fix'].includes(body.status) ? body.status : null;
    if (hasStatus && !status) return send(res, 400, JSON.stringify({ error: 'Invalid status' }));
    if (!hasStatus && !hasAssignee) return send(res, 400, JSON.stringify({ error: 'Nothing to update' }));
    const items = readFeedbackItems().sort((a, b) => String(a.createdAt || '').localeCompare(String(b.createdAt || '')));
    const item = items.find(entry => entry.id === id);
    if (!item) return send(res, 404, JSON.stringify({ error: 'Not found' }));
    if (hasStatus) item.status = status;
    if (hasAssignee) {
      const assignee = cleanText(body.assignee, 80);
      if (assignee) item.assignee = assignee;
      else delete item.assignee;
    }
    item.updatedAt = new Date().toISOString();
    writeFeedbackItems(items);
    return send(res, 200, JSON.stringify({ ok: true, item }));
  }

  return send(res, 405, JSON.stringify({ error: 'Method not allowed' }));
}


const PUBLIC_HTML_PATHS = new Set([
  '/index.html',
  '/summer-subscription.html',
  '/summer-account.html',
  '/account.html',
  '/register.html',
  '/login.html',
  '/classroom-entry.html',
  '/teacher-classrooms.html',
  '/classroom-admin.html',
  '/thankyou.html',
  '/about.html',
  '/sisi.html',
  '/lumi.html',
  '/lumi-play.html',
  '/omer-future-craftom.html',
  '/omer-future-craftom-challenge.html',
  '/omer-future-craftom-students.html',
  '/omer-future-craftom-slides.html',
  '/omer-future-craftom-improvement.html',
]);

const FREE_SISI_HTML_PATHS = new Set([
  '/space.html',
  '/space-play.html',
  '/music.html',
  '/music-play.html',
  '/ocean.html',
  '/ocean-play.html',
]);

function isFreeTrialLearningHtml(pathname, url) {
  return FREE_SISI_HTML_PATHS.has(pathname);
}

function profileAccessList(profile) {
  const raw = profile && profile.child && profile.child.access_json;
  try {
    const parsed = JSON.parse(raw || '[]');
    return Array.isArray(parsed) ? parsed.map(item => String(item || '').trim()).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function courseForPaidPath(pathname) {
  if (pathname === '/sensi-city.html' || pathname === '/smart-city.html' || pathname === '/teachers.html' || pathname.startsWith('/slides/')) return 'sensi-city';
  if (pathname === '/space.html' || pathname === '/space-play.html' || pathname === '/music.html' || pathname === '/music-play.html' || pathname === '/ocean.html' || pathname === '/ocean-play.html') return 'sisi-trial';
  if (pathname === '/sensi-classic.html' || pathname === '/sensi-classic-about.html' || pathname === '/sensi-classic-teachers.html' || pathname.startsWith('/sensi-classic-slides/')) return 'sensi-classic';
  if (pathname === '/python-turtle.html' || pathname === '/python-turtle-play.html' || pathname.startsWith('/python-turtle-slides/')) return 'python-turtle';
  if (pathname === '/webmakers.html' || pathname === '/webmakers-play.html') return 'webmakers';
  if (pathname === '/webcode.html' || pathname === '/webcode-play.html') return 'webcode';
  if (pathname === '/pygame.html' || pathname === '/pygame-play.html') return 'pygame';
  if (pathname === '/roblox.html' || pathname === '/roblox-play.html') return 'roblox';
  if (pathname === '/minecraft.html' || pathname === '/minecraft-play.html') return 'minecraft';
  if (pathname === '/gamelab.html' || pathname === '/gamelab-play.html' || pathname === '/gamelab-slides.html') return 'gamelab';
  if (pathname === '/codequest.html' || pathname === '/codequest-play.html') return 'codequest';
  if (pathname === '/money-smart.html' || pathname.startsWith('/money-smart-')) return 'money-smart';
  if (pathname === '/craftom.html' || pathname === '/craftom-play.html') return 'craftom';
  return '';
}

function isPaidProfile(profile, pathname = '') {
  if (!profile || !profile.child || profile.child.subscription_status !== 'active') return false;

  const access = profileAccessList(profile);
  const restricted = access.some(item => item.startsWith('restrict:'));
  if (!restricted) return true;

  const course = courseForPaidPath(pathname);
  if (!course) return false;

  return access.includes(course)
    || access.includes(`${course}:all`)
    || access.includes(`${course}-all`)
    || access.includes(`restrict:${course}`)
    || access.includes('*');
}

function serveSensiGuideVideo(req, res, lessonId) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return send(res, 405, 'Method not allowed', 'text/plain; charset=utf-8');
  }
  const classroomStudent = getClassroomStudentFromRequest(req);
  if (classroomStudent) return send(res, 403, 'Forbidden', 'text/plain; charset=utf-8');
  const classroomTeacher = getClassroomTeacherFromRequest(req);
  if (classroomTeacher) {
    if (!withSummerDb(db => teacherHasCourse(db, classroomTeacher.id, 'sensi-city'))) {
      return send(res, 403, 'Forbidden', 'text/plain; charset=utf-8');
    }
  } else {
    const profile = getSummerProfileFromRequest(req);
    if (!profile) return send(res, 401, 'Unauthorized', 'text/plain; charset=utf-8');
    if (!isPaidProfile(profile, '/sensi-city.html')) return send(res, 403, 'Forbidden', 'text/plain; charset=utf-8');
  }

  const videoFiles = {
    1: 'sensi-lesson-01-parent-guide.mp4',
    2: 'sensi-lesson-02-parent-guide.mp4',
    3: 'sensi-lesson-03-parent-guide.mp4',
    4: 'sensi-lesson-04-parent-guide.mp4',
    5: 'sensi-lesson-05-parent-guide.mp4',
    6: 'sensi-lesson-06-parent-guide.mp4',
    7: 'sensi-lesson-07-parent-guide.mp4',
    8: 'sensi-lesson-08-parent-guide.mp4',
    9: 'sensi-lesson-09-parent-guide.mp4',
    10: 'sensi-lesson-10-parent-guide.mp4',
    11: 'sensi-lesson-11-parent-guide.mp4',
    12: 'sensi-lesson-12-parent-guide.mp4',
    13: 'sensi-lesson-13-parent-guide.mp4',
    14: 'sensi-lesson-14-parent-guide.mp4',
    15: 'sensi-lesson-15-parent-guide.mp4',
  };
  const filename = videoFiles[lessonId];
  if (!filename) return send(res, 404, 'Not found', 'text/plain; charset=utf-8');
  const videoPath = path.join(DATA_DIR, 'guide-videos', filename);
  fs.stat(videoPath, (err, stat) => {
    if (err || !stat.isFile()) return send(res, 404, 'Not found', 'text/plain; charset=utf-8');
    const range = parseByteRange(req.headers.range, stat.size);
    if (req.headers.range && !range) {
      res.writeHead(416, {
        'Content-Range': `bytes */${stat.size}`,
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      });
      return res.end();
    }
    const headers = {
      'Content-Type': 'video/mp4',
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'private, max-age=300',
      'X-Content-Type-Options': 'nosniff',
    };
    if (range) {
      headers['Content-Length'] = range.end - range.start + 1;
      headers['Content-Range'] = `bytes ${range.start}-${range.end}/${stat.size}`;
      res.writeHead(206, headers);
      if (req.method === 'HEAD') return res.end();
      return fs.createReadStream(videoPath, range).pipe(res);
    }
    headers['Content-Length'] = stat.size;
    res.writeHead(200, headers);
    if (req.method === 'HEAD') return res.end();
    return fs.createReadStream(videoPath).pipe(res);
  });
}

function lockedPage(pathname, user, options = {}) {
  const loggedIn = Boolean(user);
  const trialOnly = options.trialOnly === true;
  const classroomRestricted = options.classroomRestricted === true;
  const teacherRestricted = classroomRestricted && options.teacher === true;
  const title = teacherRestricted
    ? 'הלומדה לא הוקצתה למורה'
    : classroomRestricted
    ? 'הלומדה לא פתוחה לכיתה הזו'
    : trialOnly
    ? 'נרשמים לפני שמתחילים ללמוד'
    : (loggedIn ? 'התוכן הזה נעול למנויים' : 'צריך להתחבר כדי להמשיך');
  const subtitle = teacherRestricted
    ? 'מנהלת המערכת יכולה לפתוח את הלומדה למורה. לאחר מכן המורה תוכל לשייך אותה לכיתות לפי הצורך.'
    : classroomRestricted
    ? 'המורה בוחר/ת אילו לומדות פתוחות לכל כיתה. אפשר לחזור לרשימת הלומדות שהוגדרה לכיתה.'
    : trialOnly
    ? 'גם 3 השיעורים החינמיים בסיסי מתחילים אחרי הרשמה קצרה, כדי שנוכל לפתוח ילד/ה, לשמור התקדמות ולתת קוד כניסה אישי.'
    : (loggedIn
      ? 'השיעורים הנעולים נפתחים לפי ילד/ה. לילד/ה שבחרת עדיין אין מנוי פעיל, ולכן 3 שיעורי ההתנסות של חשיבה ותכנות עם סיסי פתוחים כרגע.'
      : 'כדי להתחיל ללמוד צריך להירשם או להתחבר. אחרי הרשמה אפשר להתחיל 3 שיעורי חשיבה ותכנות בחינם עם סיסי, והמשך הסדרה נפתח אחרי הפעלת מנוי לילד/ה.');
  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | hai.tech</title>
  <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700;800;900&display=swap" rel="stylesheet">
  <style>
    *{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;font-family:Rubik,Arial,sans-serif;direction:rtl;color:#102033;background:radial-gradient(circle at 15% 10%,#dbeafe,transparent 28%),radial-gradient(circle at 85% 8%,#fef3c7,transparent 28%),linear-gradient(135deg,#f8fafc,#eef2ff)}.card{width:min(620px,calc(100% - 28px));background:rgba(255,255,255,.96);border:1px solid #e6edf7;border-radius:34px;padding:34px;box-shadow:0 28px 90px rgba(15,23,42,.16);text-align:center}.lock{width:96px;height:96px;margin:0 auto 18px;border-radius:32px;display:grid;place-items:center;font-size:3rem;background:linear-gradient(135deg,#2563eb,#7c3aed);box-shadow:0 18px 44px rgba(37,99,235,.28)}h1{font-size:clamp(2rem,5vw,3.2rem);line-height:1.05;margin:0 0 12px;letter-spacing:-.04em}p{margin:0;color:#526070;font-size:1.12rem}.locked-label{margin:18px auto 0;padding:10px 14px;border-radius:999px;background:#f1f5f9;color:#475569;display:inline-block;font-weight:900}.actions{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:26px}.btn{display:inline-flex;align-items:center;justify-content:center;border-radius:999px;padding:14px 22px;text-decoration:none;font-weight:900}.primary{background:#0f172a;color:#fff}.purchase{background:linear-gradient(135deg,#16a34a,#22c55e);color:#fff;box-shadow:0 16px 36px rgba(22,163,74,.24)}.alt{background:#fff;color:#0f172a;border:1px solid #dbe3ef}.note{margin-top:18px;border:1px solid #bbf7d0;background:#f0fdf4;color:#166534;border-radius:18px;padding:12px 14px;font-weight:800}@media(max-width:560px){.card{padding:26px 20px}.actions .btn{width:100%}}
  </style>
</head>
<body>
  <main class="card">
    <div class="lock">🔒</div>
    <h1>${title}</h1>
    <p>${subtitle}</p>
    <div class="locked-label">${teacherRestricted ? 'גישה לפי הרשאת המנהלת' : (classroomRestricted ? 'גישה לפי הגדרת הכיתה' : (trialOnly ? '3 שיעורים חינם אחרי הרשמה' : 'השיעור הזה נפתח אחרי הפעלת מנוי לילד/ה'))}</div>
    <div class="actions">
      ${classroomRestricted
        ? `<a class="btn primary" href="${options.teacher ? 'teacher-classrooms.html' : 'classroom-entry.html'}">${teacherRestricted ? 'חזרה ללומדות שלי' : 'חזרה ללומדות הכיתה'}</a>`
        : `${trialOnly ? '' : '<a class="btn purchase" href="https://mrng.to/fZiL2SITRp">הפעלת מנוי</a>'}<a class="btn primary" href="register.html">הרשמה</a><a class="btn alt" href="login.html">כניסה</a>`}
    </div>
    <div class="note">${teacherRestricted ? 'רק מנהלת המערכת יכולה לשנות את רשימת הלומדות של המורה.' : (classroomRestricted ? 'רק המורה של הכיתה יכול/ה לשנות את רשימת הלומדות.' : (trialOnly ? 'ההרשמה פותחת 3 שיעורי חשיבה ותכנות בחינם עם סיסי ושומרת את ההתקדמות לילד/ה.' : 'כדי לפתוח את כל הלומדות צריך מנוי פעיל לילד/ה הספציפי/ת.'))}</div>
  </main>
</body>
</html>`;
}

function requiresPaidAccess(pathname, ext, url) {
  if (ext !== '.html') return false;
  if (PUBLIC_HTML_PATHS.has(pathname)) return false;
  if (isFreeTrialLearningHtml(pathname, url)) return false;
  return true;
}

function classroomCourseForPath(pathname) {
  const normalized = String(pathname || '').toLowerCase();
  const basename = path.basename(normalized, path.extname(normalized));
  const craftomStudentPage = normalized === '/craftom-school/preview/index.html'
    || ['craftom-agent-academy', 'craftom-minecraft', 'craftom-minecraft-lesson', 'craftom-minecraft-challenge', 'craftom-minecraft-students'].includes(basename)
    || /^craftom-minecraft-lesson-(?:[1-9]|1[0-6])$/.test(basename);
  if (craftomStudentPage) return 'craftom-agent';
  if (basename === 'kugel-student') return 'craftom-agent';
  if (basename === 'python-turtle' || basename === 'python-turtle-course' || basename.startsWith('python-turtle-play')) return 'python-turtle';
  if (basename === 'webcode' || basename === 'webcode-share' || basename.startsWith('webcode-play')) return 'webcode';
  if (basename === 'minecraft' || basename.startsWith('minecraft-play')) return 'minecraft';
  if (basename === 'sensi-city' || basename === 'smart-city') return 'sensi-city';
  const sisiLessons = ['sisi', 'space', 'music', 'ocean', 'detective', 'kitchen', 'dino', 'art', 'weather', 'factory', 'garden', 'park', 'mail', 'cinema', 'escape', 'finale'];
  if (sisiLessons.some(name => basename === name || basename === `${name}-play` || basename === `${name}-lab`)) return 'sisi';
  return null;
}

function classroomTeacherCourseForPath(pathname) {
  const studentCourse = classroomCourseForPath(pathname);
  if (studentCourse) return studentCourse;
  const normalized = String(pathname || '').toLowerCase();
  const basename = path.basename(normalized, path.extname(normalized));
  if (normalized === '/teachers.html' || /^\/slides\/(?:index|lesson(?:[1-9]|1[0-5])?)\.html$/.test(normalized)) return 'sensi-city';
  if (basename === 'python-turtle-slides' || /^python-turtle-lesson-(?:[1-9]|[12][0-9]|30)-slides$/.test(basename)) return 'python-turtle';
  if (basename === 'webcode-slides') return 'webcode';
  if (basename === 'minecraft-teachers' || basename === 'minecraft-slides') return 'minecraft';
  if (basename === 'craftom-minecraft-slides') return 'craftom-agent';
  if (basename === 'kugel-teacher') return 'craftom-agent';
  return null;
}

function injectHeadAssets(html) {
  if (!html.includes('</head>')) return html;
  let output = html;
  if (!output.includes('rel="icon"')) {
    output = output.replace('</head>', '  <link rel="icon" type="image/svg+xml" href="/favicon.svg">\n  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">\n  <link rel="shortcut icon" href="/favicon.ico">\n</head>');
  }
  return output;
}

function injectUserBadge(html) {
  if (!html.includes('</body>') || html.includes('js/user-badge.js')) return injectHeadAssets(html);
  return injectHeadAssets(html).replace('</body>', '  <script src="/js/user-badge.js?v=20260905-access-modes-1"></script>\n</body>');
}

function injectClassroomSession(html) {
  if (!html.includes('</body>') || html.includes('js/classroom-session.js') || html.includes('js/classroom-platform.js')) return html;
  return html.replace('</body>', '  <script src="/js/classroom-session.js?v=20260905-access-modes-1"></script>\n</body>');
}

function proxyEnglishBuddy(req, res) {
  const originalUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let targetPath = originalUrl.pathname.replace(/^\/english-buddy\/?/, '/');
  if (!targetPath || targetPath === '/') targetPath = '/';
  const targetQuery = originalUrl.search || '';
  const proxyReq = http.request({
    hostname: '127.0.0.1',
    port: 3037,
    method: req.method,
    path: targetPath + targetQuery,
    headers: { ...req.headers, host: '127.0.0.1:3037' },
  }, (proxyRes) => {
    const contentType = String(proxyRes.headers['content-type'] || '');
    if (contentType.includes('text/html')) {
      const chunks = [];
      proxyRes.on('data', chunk => chunks.push(chunk));
      proxyRes.on('end', () => {
        let html = Buffer.concat(chunks).toString('utf8');
        html = html.replaceAll("fetch('/api/tts'", "fetch('/english-buddy/api/tts'")
                   .replaceAll("fetch('/api/stt'", "fetch('/english-buddy/api/stt'")
                   .replaceAll('href="/api/', 'href="/english-buddy/api/')
                   .replaceAll('src="/api/', 'src="/english-buddy/api/');
        res.writeHead(proxyRes.statusCode || 200, {
          ...proxyRes.headers,
          'content-length': Buffer.byteLength(html),
          'cache-control': 'no-cache',
        });
        res.end(html);
      });
      return;
    }
    res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
    proxyRes.pipe(res);
  });
  proxyReq.on('error', () => send(res, 502, 'English Buddy is not available right now', 'text/plain; charset=utf-8'));
  req.pipe(proxyReq);
}

function serveStatic(req, res) {
  const url = requestUrl(req);
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === '/') pathname = '/index.html';
  if (pathname === '/thankyou') pathname = '/thankyou.html';
  const filePath = path.normalize(path.join(ROOT, pathname));
  if (!filePath.startsWith(ROOT + path.sep)) return send(res, 403, 'Forbidden', 'text/plain; charset=utf-8');
  if (filePath === DATA_DIR || filePath.startsWith(DATA_DIR + path.sep)) return send(res, 403, 'Forbidden', 'text/plain; charset=utf-8');
  const ext = path.extname(filePath).toLowerCase();

  const profile = SUBSCRIPTION_GATE_ENABLED ? getSummerProfileFromRequest(req) : null;
  const classroomStudent = SUBSCRIPTION_GATE_ENABLED ? getClassroomStudentFromRequest(req) : null;
  const classroomTeacher = SUBSCRIPTION_GATE_ENABLED && !classroomStudent ? getClassroomTeacherFromRequest(req) : null;
  const classroomCourse = classroomStudent
    ? classroomCourseForPath(pathname)
    : (classroomTeacher ? classroomTeacherCourseForPath(pathname) : null);
  const classroomIdentity = Boolean(classroomStudent || classroomTeacher);
  const classroomAuthorized = Boolean(classroomCourse
    && CLASSROOM_COURSES.has(classroomCourse)
    && withSummerDb(db => classroomStudent
      ? classroomHasCourse(db, classroomStudent.classroom_id, classroomCourse)
      : teacherHasCourse(db, classroomTeacher.id, classroomCourse)));
  const personalAuthorized = !classroomIdentity && isPaidProfile(profile, pathname);

  if (SUBSCRIPTION_GATE_ENABLED && ext === '.html' && classroomCourse && classroomIdentity && !classroomAuthorized) {
    return send(res, 402, lockedPage(pathname, null, { classroomRestricted: true, teacher: Boolean(classroomTeacher) }), 'text/html; charset=utf-8');
  }

  if (SUBSCRIPTION_GATE_ENABLED && ext === '.html' && isFreeTrialLearningHtml(pathname, url) && !profile && !classroomAuthorized) {
    return send(res, 401, lockedPage(pathname, null, { trialOnly: true }), 'text/html; charset=utf-8');
  }

  if (SUBSCRIPTION_GATE_ENABLED && ext === '.html' && isFreeTrialLearningHtml(pathname, url) && profile && profileAccessList(profile).some(item => item.startsWith('restrict:')) && !isPaidProfile(profile, pathname) && !classroomAuthorized) {
    return send(res, 402, lockedPage(pathname, profile && profile.user), 'text/html; charset=utf-8');
  }

  if (SUBSCRIPTION_GATE_ENABLED && requiresPaidAccess(pathname, ext, url)) {
    if (!classroomAuthorized && !personalAuthorized) {
      return send(res, 402, lockedPage(pathname, profile && profile.user), 'text/html; charset=utf-8');
    }
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) return send(res, 404, 'Not found', 'text/plain; charset=utf-8');
    if (ext === '.html') {
      fs.readFile(filePath, 'utf8', (readErr, html) => {
        if (readErr) return send(res, 500, 'Server error', 'text/plain; charset=utf-8');
        const baseOutput = injectUserBadge(html);
        const output = injectClassroomSession(baseOutput);
        send(res, 200, output, 'text/html; charset=utf-8');
      });
      return;
    }
    const type = MIME[ext] || 'application/octet-stream';
    const range = parseByteRange(req.headers.range, stat.size);
    if (req.headers.range && !range) {
      res.writeHead(416, {
        'Content-Range': `bytes */${stat.size}`,
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      });
      res.end();
      return;
    }
    if (range) {
      res.writeHead(206, {
        'Content-Type': type,
        'Content-Length': range.end - range.start + 1,
        'Content-Range': `bytes ${range.start}-${range.end}/${stat.size}`,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=300',
        'X-Content-Type-Options': 'nosniff',
      });
      fs.createReadStream(filePath, range).pipe(res);
      return;
    }
    res.writeHead(200, {
      'Content-Type': type,
      'Content-Length': stat.size,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=300',
      'X-Content-Type-Options': 'nosniff',
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/english-buddy')) return proxyEnglishBuddy(req, res);
  const guideVideoMatch = requestUrl(req).pathname.match(/^\/api\/sensi\/guide-videos\/lesson-(\d+)$/);
  if (guideVideoMatch) return serveSensiGuideVideo(req, res, Number(guideVideoMatch[1]));
  if (req.url.startsWith('/api/admin/feedback')) return handleAdminFeedback(req, res);
  if (req.url.startsWith('/api/craftom/exit-ticket')) return handleCraftomExitTicket(req, res);
  if (req.url.startsWith('/api/feedback')) return handleFeedback(req, res);
  if (req.url.startsWith('/api/summer/')) return handleSummerAuth(req, res);
  if (req.url.startsWith('/api/classroom/')) return handleClassroomApi(req, res);
  if (req.url.startsWith('/api/kugel/')) return handleKugelApi(req, res);
  if (req.url.startsWith('/api/progress')) return handleStudentProgress(req, res);
  return serveStatic(req, res);
});

server.listen(PORT, '0.0.0.0', () => {
  ensureAdminToken();
  console.log(`Robotics15 server listening on http://0.0.0.0:${PORT}`);
});
