'use strict';

const fs = require('fs');
const crypto = require('crypto');
const Database = require('better-sqlite3');
const { DATA_DIR, SESSION_TTL_MS, SUMMER_DB_FILE, SUMMER_USERS_FILE } = require('./config');
const { cleanText } = require('./http-utils');

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

module.exports = {
  cleanAccessCode,
  cleanEmail,
  createChildRecord,
  createChildSession,
  createSummerSession,
  getDefaultChild,
  getSessionProfileByToken,
  getUserBySessionToken,
  hashPassword,
  listChildrenForUser,
  tokenHash,
  withSummerDb,
};
