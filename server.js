#!/usr/bin/env node
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Database = require('better-sqlite3');

const ROOT = __dirname;
const PORT = Number(process.env.PORT || process.argv[2] || 3032);
const DATA_DIR = path.join(ROOT, 'data');
const ATTACHMENTS_DIR = path.join(DATA_DIR, 'feedback-attachments');
const FEEDBACK_FILE = path.join(DATA_DIR, 'feedback.jsonl');
const CRAFTOM_EXIT_ATTACHMENTS_DIR = path.join(DATA_DIR, 'craftom-exit-ticket-attachments');
const CRAFTOM_EXIT_TICKETS_FILE = path.join(DATA_DIR, 'craftom-exit-tickets.jsonl');
const KUGEL_SESSION_FILE = path.join(DATA_DIR, 'kugel-lomda-session.json');
const ADMIN_TOKEN_FILE = path.join(DATA_DIR, 'admin-token.txt');
const SUMMER_USERS_FILE = path.join(DATA_DIR, 'summer-users.json');
const SUMMER_DB_FILE = path.join(DATA_DIR, 'summer-subscriptions.sqlite');
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const SUBSCRIPTION_GATE_ENABLED = process.env.ROBOTICS_SUBSCRIPTION_GATE === '1';
const KUGEL_MONITOR_API_URL = (process.env.KUGEL_MONITOR_API_URL || process.env.MINECRAFT_MONITOR_API_URL || 'http://127.0.0.1:3070').replace(/\/+$/, '');
const KUGEL_MONITOR_SERVER_NAME = process.env.KUGEL_MONITOR_SERVER_NAME || 'edu-kugel-holon';
const KUGEL_MINECRAFT_INTERNAL_TOKEN = process.env.CRAFTOM_SCHOOL_WORLD_TOKEN || process.env.KUGEL_MINECRAFT_INTERNAL_TOKEN || process.env.MINECRAFT_INTERNAL_TOKEN || '';
const KUGEL_MINECRAFT_SERVER_NAME = process.env.KUGEL_MINECRAFT_SERVER_NAME || 'Kugel-Holon';
const KUGEL_MINECRAFT_SERVER_HOST = process.env.KUGEL_MINECRAFT_SERVER_HOST || '187.124.181.225';
const KUGEL_MINECRAFT_SERVER_PORT = process.env.KUGEL_MINECRAFT_SERVER_PORT || '20203';
const KUGEL_MINECRAFT_SERVER_ID = process.env.KUGEL_MINECRAFT_SERVER_ID || '6ID56SURLMDS';
const KUGEL_MINECRAFT_ACCESS_CODE = process.env.KUGEL_MINECRAFT_ACCESS_CODE || 'Kugel2026';
const KUGEL_LESSON_WORLD_CONFIG = {
  0: {
    worldId: 'kugel-50-safe-compounds-v3-mazes-8-coins-npc-reset-v1-20260905',
    worldName: 'Kugel 50 Safe Compounds v3 - Mazes, 8 Coins, NPC Reset',
    mode: 'Adventure',
    mission: 'איסוף 8 מטבעות ולחיצה על כפתור סיום',
    startMode: 'reset',
    completionEvents: ['coin_collected', 'finish_button_pressed', 'challenge_report'],
  },
  1: {
    worldId: 'kugel-50-safe-compounds-v3-20260824',
    worldName: 'Kugel 50 Safe Compounds v3 - 2026-08-24',
    mode: 'Creative',
    mission: 'משלוח ראשון במתחם האישי אחרי תרגול התנועה',
    startMode: 'reset',
    completionEvents: ['player_join', 'block_place', 'block_break', 'challenge_report'],
  },
  2: {
    worldId: 'kugel-50-safe-compounds-v3-20260824',
    worldName: 'Kugel 50 Safe Compounds v3 - 2026-08-24',
    mode: 'Creative',
    mission: 'תחילת בנייה במתחם האישי אחרי תרגול התנועה',
    startMode: 'reset',
    completionEvents: ['player_join', 'block_place', 'block_break', 'challenge_report'],
  },
};
const DEFAULT_KUGEL_STUDENTS = ['AmiM', 'NoaK', 'ItayB', 'MayaL', 'OriS'];

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

function jsonResponse(res, status, value) {
  return send(res, status, JSON.stringify(value), 'application/json; charset=utf-8');
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
  try { db.prepare("ALTER TABLE summer_children ADD COLUMN subscription_status TEXT NOT NULL DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'past_due', 'cancelled'))").run(); } catch {}
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

function readBody(req, maxBytes = 64 * 1024) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.setEncoding('utf8');
    req.on('data', chunk => {
      data += chunk;
      if (Buffer.byteLength(data, 'utf8') > maxBytes) {
        reject(new Error('payload_too_large'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function cleanText(value, max = 2000) {
  return String(value || '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

function readJsonFile(file, fallback) {
  try {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJsonFile(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', { mode: 0o600 });
}

function readJsonLines(file) {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map(line => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function nowIso() {
  return new Date().toISOString();
}

function kugelLessonWorld(lessonId) {
  return KUGEL_LESSON_WORLD_CONFIG[Number(lessonId)] || {
    worldId: 'kugel-50-safe-compounds-v3-20260824',
    worldName: 'Kugel 50 Safe Compounds v3 - 2026-08-24',
    mode: 'Creative',
    mission: 'עבודה במתחם האישי והמשך בניית העיר',
    startMode: 'reset',
    completionEvents: ['challenge_report'],
  };
}

function defaultKugelSession() {
  return {
    active: false,
    classroom: 'קוגל ז׳ 1',
    lessonId: 0,
    server: KUGEL_MONITOR_SERVER_NAME,
    serverState: 'idle',
    serverDetail: 'עדיין לא הופעל שיעור',
    monitor: null,
    students: {},
    eventsSince: Math.floor((Date.now() - 60 * 60 * 1000) / 1000),
    updatedAt: nowIso(),
  };
}

function readKugelSession() {
  return { ...defaultKugelSession(), ...readJsonFile(KUGEL_SESSION_FILE, {}) };
}

function writeKugelSession(patch) {
  const next = {
    ...readKugelSession(),
    ...patch,
    updatedAt: nowIso(),
  };
  writeJsonFile(KUGEL_SESSION_FILE, next);
  return next;
}

function parseEventPayload(row) {
  if (!row || !row.payload) return {};
  if (typeof row.payload === 'object') return row.payload;
  try { return JSON.parse(row.payload); } catch { return {}; }
}

function eventMessage(row) {
  const payload = parseEventPayload(row);
  return String(payload.message || payload.text || row.message || '');
}

function eventCompoundId(row) {
  const payload = parseEventPayload(row);
  const value = payload.compound_id ?? payload.compoundId ?? row.compound_id;
  const id = Number(value);
  if (Number.isFinite(id)) return id;
  const pos = payload.player_position || payload.position || {};
  return kugelCompoundIdFromPosition(pos.x ?? row.position_x ?? row.block_x, pos.z ?? row.position_z ?? row.block_z);
}

function kugelCompoundIdFromPosition(xValue, zValue) {
  const x = Number(xValue);
  const z = Number(zValue);
  if (!Number.isFinite(x) || !Number.isFinite(z)) return null;
  const col = Math.round((x + 315) / 70) + 1;
  const row = Math.round((z + 140) / 70) + 1;
  if (col < 1 || col > 10 || row < 1 || row > 5) return null;
  const centerX = -315 + (col - 1) * 70;
  const centerZ = -140 + (row - 1) * 70;
  if (Math.abs(x - centerX) > 30 || Math.abs(z - centerZ) > 30) return null;
  return (row - 1) * 10 + col;
}

function isSystemKugelParticipant(name) {
  const key = normalizeMinecraftName(name);
  if (!key || key === 'server' || key === 'npc' || key === 'clawtest') return true;
  return key.includes('npc') || key === 'kugelguide' || key === 'kugel guide';
}

function sanitizeKugelStudents(students = {}) {
  const clean = {};
  for (const [name, value] of Object.entries(students || {})) {
    if (isSystemKugelParticipant(name)) continue;
    clean[canonicalKugelStudentName(name)] = value;
  }
  return clean;
}

function canonicalKugelStudentName(name) {
  const key = normalizeMinecraftName(name);
  return DEFAULT_KUGEL_STUDENTS.find(item => normalizeMinecraftName(item) === key) || cleanText(name, 80);
}

function savedKugelStudent(students, name) {
  const key = normalizeMinecraftName(name);
  return Object.entries(students || {}).find(([studentName]) => normalizeMinecraftName(studentName) === key)?.[1] || {};
}

function eventCreatedAtMs(row) {
  const value = Number(row && row.created_at || 0);
  if (!value) return null;
  return value > 100000000000 ? value : value * 1000;
}

function normalizeMinecraftName(value) {
  return String(value || '').trim().toLowerCase();
}

function coinProgressFromMessage(message) {
  const match = String(message || '').match(/(?:מטבע נאסף|coin collected)\s*(\d+)\s*\/\s*8/i);
  return match ? Number(match[1]) : 0;
}

function positionBucket(payload) {
  const pos = payload && (payload.player_position || payload.position || {});
  const x = Number(pos.x);
  const z = Number(pos.z);
  if (!Number.isFinite(x) || !Number.isFinite(z)) return '';
  return `${Math.round(x / 3) * 3}:${Math.round(z / 3) * 3}`;
}

function collectibleCoinEstimate(rows) {
  const carpetBlocks = new Map();
  const pressurePlateCoins = new Map();
  for (const row of rows) {
    if (String(row.event_type || '') !== 'agent_break_candidate') continue;
    const blockId = String(row.block_id || '');
    if (blockId === 'minecraft:yellow_carpet') {
      const bucket = `${Math.round(Number(row.block_x ?? row.position_x ?? 0))}:${Math.round(Number(row.block_z ?? row.position_z ?? 0))}`;
      if (!carpetBlocks.has(bucket)) carpetBlocks.set(bucket, row);
    }
    if (blockId === 'minecraft:light_weighted_pressure_plate') {
      const bucket = positionBucket(parseEventPayload(row));
      if (bucket && !pressurePlateCoins.has(bucket)) pressurePlateCoins.set(bucket, row);
    }
  }
  const carpetRows = [...carpetBlocks.values()].sort((a, b) => (eventCreatedAtMs(a) || 0) - (eventCreatedAtMs(b) || 0));
  const pressureRows = [...pressurePlateCoins.values()].sort((a, b) => (eventCreatedAtMs(a) || 0) - (eventCreatedAtMs(b) || 0));
  const rowsByTime = [...carpetRows, ...pressureRows].sort((a, b) => (eventCreatedAtMs(a) || 0) - (eventCreatedAtMs(b) || 0));
  const count = Math.floor(carpetRows.length / 4) + pressureRows.length;
  return {
    count: Math.min(8, count),
    rows: rowsByTime,
  };
}

async function fetchJson(url, options = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    const text = await response.text();
    let data = {};
    try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
    if (!response.ok) {
      const message = data.error || data.message || `HTTP ${response.status}`;
      const error = new Error(message);
      error.status = response.status;
      error.data = data;
      throw error;
    }
    return data;
  } finally {
    clearTimeout(timeout);
  }
}

async function openKugelMinecraftWorld(world, startMode) {
  if (!KUGEL_MINECRAFT_INTERNAL_TOKEN) {
    return { ok: false, skipped: true, error: 'missing_internal_token' };
  }
  return fetchJson(`${KUGEL_MONITOR_API_URL}/api/internal/craftom-school/world/open`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${KUGEL_MINECRAFT_INTERNAL_TOKEN}`,
    },
    body: JSON.stringify({
      server: KUGEL_MONITOR_SERVER_NAME,
      world: world.worldId,
      start_mode: startMode || world.startMode || 'reset',
    }),
  }, 130000);
}

async function postKugelMonitor(pathname, body, timeoutMs = 15000) {
  if (!KUGEL_MINECRAFT_INTERNAL_TOKEN) {
    return { ok: false, skipped: true, error: 'missing_internal_token' };
  }
  return fetchJson(`${KUGEL_MONITOR_API_URL}${pathname}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${KUGEL_MINECRAFT_INTERNAL_TOKEN}`,
    },
    body: JSON.stringify({ server: KUGEL_MONITOR_SERVER_NAME, ...body }),
  }, timeoutMs);
}

async function fetchKugelGameEvents(session) {
  const since = Number(session.eventsSince || 0) || Math.floor((Date.now() - 60 * 60 * 1000) / 1000);
  const params = new URLSearchParams({
    server: KUGEL_MONITOR_SERVER_NAME,
    since: String(since),
    limit: '1000',
  });
  try {
    const data = await fetchJson(`${KUGEL_MONITOR_API_URL}/api/game-events?${params}`, {}, 7000);
    return Array.isArray(data.events) ? data.events : Array.isArray(data.rows) ? data.rows : [];
  } catch (error) {
    return [];
  }
}

function summarizeStudentFromEvents(studentName, rows, fallback = {}) {
  const name = normalizeMinecraftName(studentName);
  const resetAt = fallback.resetAt ? Date.parse(fallback.resetAt) : 0;
  const matching = rows.filter(row => {
    if (normalizeMinecraftName(row.player_name) !== name) return false;
    if (!resetAt) return true;
    return (eventCreatedAtMs(row) || 0) >= resetAt;
  });
  const ordered = [...matching].sort((a, b) => (eventCreatedAtMs(a) || 0) - (eventCreatedAtMs(b) || 0));
  const lastEvent = ordered.at(-1) || null;
  const lastEventAt = eventCreatedAtMs(lastEvent);
  const coinProgress = matching.map(row => coinProgressFromMessage(eventMessage(row)));
  const estimatedCoins = collectibleCoinEstimate(matching);
  const coinEvents = matching.filter(row => {
    const payload = parseEventPayload(row);
    const type = String(row.event_type || '');
    const block = String(row.block_id || '');
    const message = eventMessage(row);
    return type === 'coin_collected' || payload.coin || payload.coin_index || /gold|coin/i.test(block) || /מטבע נאסף|coin collected/i.test(message);
  });
  const finishEvents = matching.filter(row => {
    const payload = parseEventPayload(row);
    const type = String(row.event_type || '');
    const message = eventMessage(row);
    return type === 'finish_button_pressed' ||
      type === 'challenge_report' ||
      payload.completed === true ||
      payload.finish === true ||
      /כל\s*8\s*המטבעות|כפתור הסיום|finish button|all 8/i.test(message);
  });
  const joinEvents = matching.filter(row => ['player_join', 'player_spawn'].includes(String(row.event_type || '')));
  const fallbackStartedAt = !resetAt || Date.parse(fallback.startedAt || '') >= resetAt ? fallback.startedAt : null;
  const fallbackFinishedAt = !resetAt || Date.parse(fallback.finishedAt || '') >= resetAt ? fallback.finishedAt : null;
  const fallbackStartedAtMs = Date.parse(fallbackStartedAt || '') || null;
  const fallbackFinishedAtMs = Date.parse(fallbackFinishedAt || '') || null;
  const startedAt = fallbackStartedAtMs || eventCreatedAtMs(joinEvents[0] || ordered[0]) || null;
  const fallbackCoins = fallbackFinishedAt ? Number(fallback.coins || 0) : 0;
  const coins = Math.min(8, Math.max(fallbackCoins, estimatedCoins.count, coinEvents.length, ...coinProgress));
  const lastCoinAt = eventCreatedAtMs(estimatedCoins.rows.at(-1) || coinEvents.at(-1));
  const coinCompletedAt = coins >= 8 ? lastCoinAt : null;
  const finishedAt = eventCreatedAtMs(finishEvents.at(-1)) || coinCompletedAt || fallbackFinishedAtMs || null;
  const completed = Boolean(finishedAt || (!resetAt && fallback.completed));
  const durationMs = startedAt && finishedAt ? Math.max(0, finishedAt - startedAt) : null;
  const hasLiveConnection = lastEvent && String(lastEvent.event_type || '') !== 'player_leave';
  const connected = Boolean(hasLiveConnection || fallback.connected && !lastEvent);
  return {
    name: studentName,
    connected,
    connectionStatus: connected ? 'מחובר' : 'לא מחובר',
    status: completed ? 'סיים' : matching.length || fallback.startedAt ? 'בתהליך' : 'לא התחיל',
    coins,
    startedAt: startedAt ? new Date(startedAt).toISOString() : fallback.startedAt || null,
    finishedAt: finishedAt ? new Date(finishedAt).toISOString() : fallbackFinishedAt || null,
    lastSeenAt: lastEventAt ? new Date(lastEventAt).toISOString() : null,
    durationSeconds: durationMs === null ? fallback.durationSeconds || null : Math.round(durationMs / 1000),
    eventCount: matching.length,
    completed,
    exitTicket: fallback.exitTicket || null,
  };
}

function minecraftJoinInfo() {
  return {
    serverName: KUGEL_MINECRAFT_SERVER_NAME,
    serverHost: KUGEL_MINECRAFT_SERVER_HOST,
    serverPort: KUGEL_MINECRAFT_SERVER_PORT,
    serverAddress: `${KUGEL_MINECRAFT_SERVER_HOST}:${KUGEL_MINECRAFT_SERVER_PORT}`,
    serverId: KUGEL_MINECRAFT_SERVER_ID,
    accessCode: KUGEL_MINECRAFT_ACCESS_CODE,
    launchUrl: `minecraftedu://?addExternalServer=${encodeURIComponent(KUGEL_MINECRAFT_SERVER_NAME)}|${KUGEL_MINECRAFT_SERVER_HOST}:${KUGEL_MINECRAFT_SERVER_PORT}`,
  };
}

async function kugelSessionView() {
  const session = readKugelSession();
  session.students = sanitizeKugelStudents(session.students);
  const world = kugelLessonWorld(session.lessonId);
  const events = await fetchKugelGameEvents(session);
  const savedStudents = session.students || {};
  const resetByName = new Map(Object.entries(savedStudents).map(([name, value]) => [normalizeMinecraftName(name), Date.parse(value.resetAt || '') || 0]));
  const lessonTickets = readJsonLines(CRAFTOM_EXIT_TICKETS_FILE)
    .filter(item => String(item.courseId || '') === 'craftom-minecraft-grade7')
    .filter(item => Number(item.lessonId) === Number(session.lessonId))
    .filter(item => !isSystemKugelParticipant(item.studentName))
    .filter(item => {
      const resetAt = resetByName.get(normalizeMinecraftName(item.studentName)) || 0;
      return !resetAt || (Date.parse(item.createdAt || '') || 0) >= resetAt;
    })
    .sort((a, b) => (Date.parse(a.createdAt || '') || 0) - (Date.parse(b.createdAt || '') || 0));
  const exitTicketByName = new Map();
  for (const item of lessonTickets) {
    exitTicketByName.set(normalizeMinecraftName(item.studentName), {
      id: item.id,
      studentName: item.studentName,
      answer: item.answer,
      createdAt: item.createdAt,
      photo: item.photo ? {
        name: item.photo.name,
        mime: item.photo.mime,
        size: item.photo.size,
        url: `/api/craftom/exit-ticket/attachments/${encodeURIComponent(path.basename(item.photo.path || ''))}`,
      } : null,
    });
  }
  const names = new Set([...DEFAULT_KUGEL_STUDENTS, ...Object.keys(savedStudents).map(canonicalKugelStudentName)]);
  for (const item of lessonTickets) {
    if (!isSystemKugelParticipant(item.studentName)) names.add(item.studentName);
  }
  for (const row of events) {
    if (!isSystemKugelParticipant(row.player_name)) names.add(row.player_name);
  }
  const students = [...names]
    .filter(name => !isSystemKugelParticipant(name))
    .map(name => summarizeStudentFromEvents(name, events, {
      ...savedKugelStudent(savedStudents, name),
      exitTicket: exitTicketByName.get(normalizeMinecraftName(name)) || null,
    }));
  return {
    ok: true,
    session,
    world,
    minecraft: minecraftJoinInfo(),
    students,
    metrics: {
      connected: students.filter(item => item.connected).length,
      active: students.filter(item => item.status === 'בתהליך').length,
      done: students.filter(item => item.completed).length,
      attention: students.filter(item => item.status === 'בתהליך' && item.coins <= 1 && item.eventCount > 0).length,
    },
    recentEvents: events.slice(0, 30).map(row => ({
      id: row.id,
      type: row.event_type,
      player: row.player_name,
      block: row.block_id,
      createdAt: eventCreatedAtMs(row) ? new Date(eventCreatedAtMs(row)).toISOString() : null,
    })),
  };
}

async function kugelStudentForCompound(compoundId) {
  const id = Number(compoundId);
  if (!Number.isFinite(id)) return null;
  const session = readKugelSession();
  const events = await fetchKugelGameEvents(session);
  const matching = events
    .filter(row => eventCompoundId(row) === id)
    .filter(row => !isSystemKugelParticipant(row.player_name))
    .sort((a, b) => (eventCreatedAtMs(b) || 0) - (eventCreatedAtMs(a) || 0));
  const name = matching[0]?.player_name ? canonicalKugelStudentName(matching[0].player_name) : '';
  return name || null;
}

async function handleKugelApi(req, res) {
  const url = requestUrl(req);
  const pathname = url.pathname;
  try {
    if (req.method === 'GET' && pathname === '/api/kugel/session') {
      return jsonResponse(res, 200, await kugelSessionView());
    }
    const compoundStudentMatch = pathname.match(/^\/api\/kugel\/compounds\/(\d+)\/student$/);
    if (req.method === 'GET' && compoundStudentMatch) {
      const student = await kugelStudentForCompound(compoundStudentMatch[1]);
      return jsonResponse(res, 200, { ok: true, compoundId: Number(compoundStudentMatch[1]), student });
    }
    const launchMatch = pathname.match(/^\/api\/kugel\/lessons\/(\d+)\/launch$/);
    if (req.method === 'POST' && launchMatch) {
      const raw = await readBody(req, 128 * 1024);
      const body = raw ? JSON.parse(raw) : {};
      const lessonId = Number(launchMatch[1]);
      const world = kugelLessonWorld(lessonId);
      const startMode = body.start_mode === 'continue' ? 'continue' : world.startMode || 'reset';
      const sessionBase = writeKugelSession({
        active: true,
        classroom: cleanText(body.classroom, 120) || 'קוגל ז׳ 1',
        lessonId,
        students: startMode === 'reset' ? {} : readKugelSession().students || {},
        server: KUGEL_MONITOR_SERVER_NAME,
        serverState: 'starting',
        serverDetail: `מפעיל את ${world.worldName}`,
        eventsSince: Math.floor(Date.now() / 1000),
      });
      let monitor;
      try {
        monitor = await openKugelMinecraftWorld(world, startMode);
      } catch (error) {
        monitor = { ok: false, error: error.message || 'monitor_failed', data: error.data || null };
      }
      const session = writeKugelSession({
        ...sessionBase,
        monitor,
        serverState: monitor && monitor.ok ? 'running' : 'error',
        serverDetail: monitor && monitor.ok
          ? `העולם הפעיל: ${world.worldName}`
          : `לא הצלחתי להפעיל עולם: ${monitor && monitor.error || 'שגיאה לא ידועה'}`,
      });
      return jsonResponse(res, monitor && monitor.ok ? 200 : 502, {
        ok: Boolean(monitor && monitor.ok),
        session,
        world,
        monitor,
        minecraft: minecraftJoinInfo(),
      });
    }
    const studentStartMatch = pathname.match(/^\/api\/kugel\/students\/([^/]+)\/start$/);
    if (req.method === 'POST' && studentStartMatch) {
      const rawName = cleanText(decodeURIComponent(studentStartMatch[1]), 80);
      if (isSystemKugelParticipant(rawName)) {
        return jsonResponse(res, 200, { ok: true, skipped: true, reason: 'system_participant' });
      }
      const name = canonicalKugelStudentName(rawName);
      const session = readKugelSession();
      session.students = sanitizeKugelStudents(session.students);
      session.students[name] = { ...(session.students[name] || {}), startedAt: nowIso(), connected: true };
      const saved = writeKugelSession(session);
      return jsonResponse(res, 200, { ok: true, minecraft: minecraftJoinInfo(), session: saved });
    }
    const studentFinishMatch = pathname.match(/^\/api\/kugel\/students\/([^/]+)\/finish$/);
    if (req.method === 'POST' && studentFinishMatch) {
      const raw = await readBody(req, 128 * 1024);
      const body = raw ? JSON.parse(raw) : {};
      const rawName = cleanText(decodeURIComponent(studentFinishMatch[1]), 80);
      if (isSystemKugelParticipant(rawName)) {
        return jsonResponse(res, 200, { ok: true, skipped: true, reason: 'system_participant' });
      }
      const name = canonicalKugelStudentName(rawName);
      const session = readKugelSession();
      session.students = sanitizeKugelStudents(session.students);
      const existing = session.students[name] || {};
      const lessonId = Number(body.lessonId ?? session.lessonId);
      if (lessonId === 0) {
        const events = await fetchKugelGameEvents(session);
        const summary = summarizeStudentFromEvents(name, events, existing);
        const completed = summary.coins >= 8;
        session.students[name] = {
          ...existing,
          connected: summary.connected || existing.connected !== false,
          coins: summary.coins,
          completed,
          finishedAt: completed ? nowIso() : null,
        };
      } else {
        session.students[name] = { ...existing, finishedAt: nowIso(), completed: true, coins: 8 };
      }
      const saved = writeKugelSession(session);
      return jsonResponse(res, 200, { ok: true, session: saved });
    }
    const studentResetMatch = pathname.match(/^\/api\/kugel\/students\/([^/]+)\/reset$/);
    if (req.method === 'POST' && studentResetMatch) {
      const raw = await readBody(req, 128 * 1024);
      const body = raw ? JSON.parse(raw) : {};
      const rawName = cleanText(decodeURIComponent(studentResetMatch[1]), 80);
      if (isSystemKugelParticipant(rawName)) {
        const session = readKugelSession();
        session.students = sanitizeKugelStudents(session.students);
        writeKugelSession(session);
        return jsonResponse(res, 200, { ok: true, skipped: true, reason: 'system_participant' });
      }
      const name = canonicalKugelStudentName(rawName);
      const session = readKugelSession();
      session.students = sanitizeKugelStudents(session.students);
      const retryInGame = cleanText(body.source, 80) === 'kugel_maze_npc_retry';
      const resetAt = nowIso();
      session.students[name] = {
        resetAt,
        startedAt: retryInGame ? resetAt : null,
        connected: retryInGame,
        completed: false,
        coins: 0,
      };
      const saved = writeKugelSession(session);
      return jsonResponse(res, 200, { ok: true, session: saved, student: name });
    }
    if (req.method === 'POST' && pathname === '/api/kugel/live/message') {
      const raw = await readBody(req, 128 * 1024);
      const body = raw ? JSON.parse(raw) : {};
      const text = cleanText(body.text, 1000);
      if (!text) return jsonResponse(res, 400, { ok: false, error: 'נא להזין הודעה' });
      const scope = body.scope === 'player' ? 'player' : 'all';
      const target = scope === 'player' ? cleanText(body.target, 80) : '';
      if (scope === 'player' && !target) return jsonResponse(res, 400, { ok: false, error: 'לא נבחר תלמיד' });
      const result = await postKugelMonitor('/api/internal/craftom-school/live/message', { text, scope, target });
      return jsonResponse(res, 200, { ok: true, result });
    }
    if (req.method === 'POST' && pathname === '/api/kugel/live/freeze') {
      const raw = await readBody(req, 128 * 1024);
      const body = raw ? JSON.parse(raw) : {};
      const scope = body.scope === 'player' ? 'player' : 'all';
      const target = scope === 'player' ? cleanText(body.target, 80) : '';
      if (scope === 'player' && !target) return jsonResponse(res, 400, { ok: false, error: 'לא נבחר תלמיד' });
      const result = await postKugelMonitor('/api/internal/craftom-school/live/freeze', {
        scope,
        target,
        on: Boolean(body.on),
        mode: body.mode === 'adventure' ? 'adventure' : 'full',
        restore: body.restore === 'adventure' ? 'adventure' : 'creative',
      });
      return jsonResponse(res, 200, { ok: true, result });
    }
    return jsonResponse(res, 404, { ok: false, error: 'Not found' });
  } catch (error) {
    return jsonResponse(res, 500, { ok: false, error: error.message || 'server_error' });
  }
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
  const attachmentMatch = requestUrl(req).pathname.match(/^\/api\/craftom\/exit-ticket\/attachments\/([^/]+)$/);
  if (req.method === 'GET' && attachmentMatch) {
    const filename = path.basename(decodeURIComponent(attachmentMatch[1]));
    const filePath = path.join(CRAFTOM_EXIT_ATTACHMENTS_DIR, filename);
    if (!filePath.startsWith(CRAFTOM_EXIT_ATTACHMENTS_DIR + path.sep)) return send(res, 403, 'Forbidden', 'text/plain; charset=utf-8');
    if (!fs.existsSync(filePath)) return send(res, 404, 'Not found', 'text/plain; charset=utf-8');
    const ext = path.extname(filePath).toLowerCase();
    const type = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': type,
      'Cache-Control': 'private, max-age=300',
      'X-Content-Type-Options': 'nosniff',
    });
    return fs.createReadStream(filePath).pipe(res);
  }
  if (req.method !== 'POST') return send(res, 405, JSON.stringify({ error: 'Method not allowed' }));
  try {
    const raw = await readBody(req, 7 * 1024 * 1024);
    const body = JSON.parse(raw || '{}');
    const lessonId = cleanText(String(body.lessonId ?? ''), 30);
    const challengeId = cleanText(String(body.challengeId ?? ''), 30);
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
  const profile = getSummerProfileFromRequest(req);
  if (!profile) return send(res, 401, 'Unauthorized', 'text/plain; charset=utf-8');
  if (!isPaidProfile(profile, '/sensi-city.html')) return send(res, 403, 'Forbidden', 'text/plain; charset=utf-8');

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
  const title = trialOnly
    ? 'נרשמים לפני שמתחילים ללמוד'
    : (loggedIn ? 'התוכן הזה נעול למנויים' : 'צריך להתחבר כדי להמשיך');
  const subtitle = trialOnly
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
    <div class="locked-label">${trialOnly ? '3 שיעורים חינם אחרי הרשמה' : 'השיעור הזה נפתח אחרי הפעלת מנוי לילד/ה'}</div>
    <div class="actions">
      ${trialOnly ? '' : '<a class="btn purchase" href="https://mrng.to/fZiL2SITRp">הפעלת מנוי</a>'}
      <a class="btn primary" href="register.html">הרשמה</a>
      <a class="btn alt" href="login.html">כניסה</a>
    </div>
    <div class="note">${trialOnly ? 'ההרשמה פותחת 3 שיעורי חשיבה ותכנות בחינם עם סיסי ושומרת את ההתקדמות לילד/ה.' : 'כדי לפתוח את כל הלומדות צריך מנוי פעיל לילד/ה הספציפי/ת.'}</div>
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
  return injectHeadAssets(html).replace('</body>', '  <script src="/js/user-badge.js?v=20260728-hide-guest-badge"></script>\n</body>');
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

  if (SUBSCRIPTION_GATE_ENABLED && ext === '.html' && isFreeTrialLearningHtml(pathname, url) && !profile) {
    return send(res, 401, lockedPage(pathname, null, { trialOnly: true }), 'text/html; charset=utf-8');
  }

  if (SUBSCRIPTION_GATE_ENABLED && ext === '.html' && isFreeTrialLearningHtml(pathname, url) && profile && profileAccessList(profile).some(item => item.startsWith('restrict:')) && !isPaidProfile(profile, pathname)) {
    return send(res, 402, lockedPage(pathname, profile && profile.user), 'text/html; charset=utf-8');
  }

  if (SUBSCRIPTION_GATE_ENABLED && requiresPaidAccess(pathname, ext, url)) {
    if (!isPaidProfile(profile, pathname)) {
      return send(res, 402, lockedPage(pathname, profile && profile.user), 'text/html; charset=utf-8');
    }
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) return send(res, 404, 'Not found', 'text/plain; charset=utf-8');
    if (ext === '.html') {
      fs.readFile(filePath, 'utf8', (readErr, html) => {
        if (readErr) return send(res, 500, 'Server error', 'text/plain; charset=utf-8');
        const output = SUBSCRIPTION_GATE_ENABLED ? injectUserBadge(html) : injectHeadAssets(html);
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
  if (req.url.startsWith('/api/kugel/')) return handleKugelApi(req, res);
  if (req.url.startsWith('/api/craftom/exit-ticket')) return handleCraftomExitTicket(req, res);
  if (req.url.startsWith('/api/feedback')) return handleFeedback(req, res);
  if (req.url.startsWith('/api/summer/')) return handleSummerAuth(req, res);
  if (req.url.startsWith('/api/progress')) return handleStudentProgress(req, res);
  return serveStatic(req, res);
});

server.listen(PORT, '0.0.0.0', () => {
  ensureAdminToken();
  console.log(`Robotics15 server listening on http://0.0.0.0:${PORT}`);
});
