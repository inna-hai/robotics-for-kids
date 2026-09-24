#!/usr/bin/env node
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');
const { spawn } = require('child_process');
const Database = require('better-sqlite3');

const ROOT = __dirname;
const PORT = Number(process.env.PORT || process.argv[2] || 3032);
const DEFAULT_DATA_DIR = process.env.NODE_ENV === 'test'
  ? path.join(os.tmpdir(), `robotics-test-data-${process.pid}`)
  : path.join(ROOT, 'data');
const DATA_DIR = process.env.ROBOTICS_DATA_DIR || DEFAULT_DATA_DIR;
const ATTACHMENTS_DIR = path.join(DATA_DIR, 'feedback-attachments');
const FEEDBACK_FILE = path.join(DATA_DIR, 'feedback.jsonl');
const CRAFTOM_EXIT_ATTACHMENTS_DIR = path.join(DATA_DIR, 'craftom-exit-ticket-attachments');
const ADMIN_TOKEN_FILE = path.join(DATA_DIR, 'admin-token.txt');
const SUMMER_USERS_FILE = path.join(DATA_DIR, 'summer-users.json');
const SUMMER_DB_FILE = process.env.ROBOTICS_DB_FILE || path.join(DATA_DIR, 'summer-subscriptions.sqlite');
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const SUBSCRIPTION_GATE_ENABLED = process.env.ROBOTICS_SUBSCRIPTION_GATE === '1';
const SUBSCRIPTION_GATE_OPEN_HOSTS = new Set(
  String(process.env.ROBOTICS_SUBSCRIPTION_GATE_OPEN_HOSTS || 'robotics15.hai.tech')
    .split(',')
    .map(host => host.trim().toLowerCase().replace(/\.$/, ''))
    .filter(Boolean)
);
const CLASSROOM_COURSE_IDS = ['sensi-city', 'sisi', 'python-turtle', 'webcode', 'minecraft', 'craftom-agent'];
const CLASSROOM_COURSES = new Set(CLASSROOM_COURSE_IDS);
const CLASSROOM_LOGIN_WINDOW_MS = 10 * 60 * 1000;
const CLASSROOM_LOGIN_MAX_FAILURES = 10;
const configuredClassroomLoginMaxKeys = Number(process.env.ROBOTICS_CLASSROOM_LOGIN_MAX_KEYS || 1000);
const CLASSROOM_LOGIN_MAX_KEYS = Number.isInteger(configuredClassroomLoginMaxKeys) && configuredClassroomLoginMaxKeys >= 8
  ? Math.min(configuredClassroomLoginMaxKeys, 10000)
  : 1000;
const CLASSROOM_TEACHER_INVITE_CODE = String(process.env.ROBOTICS_TEACHER_INVITE_CODE || '');
const CLASSROOM_ADMIN_CODE = String(process.env.ROBOTICS_CLASSROOM_ADMIN_CODE || '');
const CLASSROOM_ADMIN_EMAIL = String(process.env.ROBOTICS_CLASSROOM_ADMIN_EMAIL || '').trim().toLowerCase();
const CLASSROOM_CHALLENGE_TTL_MS = 15 * 60 * 1000;
const MINECRAFT_IDENTITY_VERIFIER_URL = String(process.env.ROBOTICS_MINECRAFT_IDENTITY_VERIFIER_URL || '').replace(/\/+$/, '');
const MINECRAFT_IDENTITY_VERIFIER_SECRET = String(process.env.ROBOTICS_MINECRAFT_IDENTITY_VERIFIER_SECRET || '');
const MINECRAFT_IDENTITY_VERIFIER_HOST = String(process.env.ROBOTICS_MINECRAFT_IDENTITY_VERIFIER_HOST || '').trim().toLowerCase();
const MINECRAFT_IDENTITY_VERIFY_TIMEOUT_MS = 3000;
function verifyClassroomCredentialConfiguration() {
  if (process.env.NODE_ENV !== 'production') return;
  const validPrivateIdentity = /^\S+@\S+\.\S+$/.test(CLASSROOM_ADMIN_EMAIL);
  if (!validPrivateIdentity || CLASSROOM_ADMIN_CODE || CLASSROOM_TEACHER_INVITE_CODE) {
    throw new Error('classroom credential configuration invalid: configure one administrator email and remove legacy shared secrets');
  }
}
const CLASSROOM_PREVIEW_DEMO_TEACHER = process.env.ROBOTICS_PREVIEW_DEMO_TEACHER === '1';
const KUGEL_PREVIEW_MOCK_MINECRAFT = CLASSROOM_PREVIEW_DEMO_TEACHER && process.env.KUGEL_PREVIEW_MOCK_MINECRAFT === '1';
const KUGEL_MONITOR_API_URL = String(process.env.KUGEL_MONITOR_API_URL || process.env.MINECRAFT_MONITOR_API_URL || '').replace(/\/+$/, '');
const KUGEL_MONITOR_EXPECTED_HOST = String(process.env.KUGEL_MONITOR_EXPECTED_HOST || '').trim().toLowerCase();
const KUGEL_HTTPS_REVERSE_PROXY = process.env.ROBOTICS_HTTPS_REVERSE_PROXY === '1';
const KUGEL_MONITOR_SERVER_NAME = String(process.env.KUGEL_MONITOR_SERVER_NAME || '');
const KUGEL_MINECRAFT_INTERNAL_TOKEN = String(process.env.KUGEL_MINECRAFT_INTERNAL_TOKEN || process.env.CRAFTOM_SCHOOL_WORLD_TOKEN || process.env.MINECRAFT_INTERNAL_TOKEN || '');
const KUGEL_MINECRAFT_SERVER_NAME = String(process.env.KUGEL_MINECRAFT_SERVER_NAME || '');
const KUGEL_MINECRAFT_SERVER_HOST = String(process.env.KUGEL_MINECRAFT_SERVER_HOST || '');
const KUGEL_MINECRAFT_SERVER_PORT = String(process.env.KUGEL_MINECRAFT_SERVER_PORT || '');
const KUGEL_MINECRAFT_SERVER_ID = String(process.env.KUGEL_MINECRAFT_SERVER_ID || '');

const KUGEL_MINECRAFT_ACCESS_CODE = String(process.env.KUGEL_MINECRAFT_ACCESS_CODE || '');
const KUGEL_LESSON_ZERO_WORLD_ID = String(process.env.KUGEL_LESSON_ZERO_WORLD_ID || 'kugel-50-safe-compounds-v3-mazes-8-coins-npc-reset-caged-inner-wood-obstacle-test-v1-20260906');
const KUGEL_AGENT_ACADEMY_WORLD_ID = String(process.env.KUGEL_AGENT_ACADEMY_WORLD_ID || 'kugel-50-safe-compounds-v3-20260824');
const KUGEL_LESSON_ONE_WORLD_ID = String(process.env.KUGEL_LESSON_ONE_WORLD_ID || KUGEL_AGENT_ACADEMY_WORLD_ID);
const KUGEL_PREVIEW_CLASSROOM_ID = String(process.env.KUGEL_PREVIEW_CLASSROOM_ID || '');
const KUGEL_COURSE_ID = 'craftom-agent';
const KUGEL_ACTION_WINDOW_MS = 60 * 1000;
const KUGEL_EVENTS_CACHE_MS = 1000;
const KUGEL_MONITOR_PROVIDER_OPEN_MAX_MS = 180 * 1000;
const KUGEL_MONITOR_PROVIDER_CLOSE_MAX_MS = 180 * 1000;
const KUGEL_MONITOR_PROVIDER_LIVE_MAX_MS = 30 * 1000;
const KUGEL_MONITOR_PROVIDER_STATE_MAX_MS = 15 * 1000;
const KUGEL_MONITOR_TIMEOUT_OVERHEAD_MS = 10 * 1000;
const kugelOperationDeadline = (testVariable, providerMaximum) => process.env.NODE_ENV === 'test'
  ? Math.max(25, Number(process.env[testVariable]) || providerMaximum + KUGEL_MONITOR_TIMEOUT_OVERHEAD_MS)
  : providerMaximum + KUGEL_MONITOR_TIMEOUT_OVERHEAD_MS;
const KUGEL_WORLD_OPEN_TIMEOUT_MS = kugelOperationDeadline('KUGEL_TEST_WORLD_OPEN_TIMEOUT_MS', KUGEL_MONITOR_PROVIDER_OPEN_MAX_MS);
const KUGEL_WORLD_CLOSE_TIMEOUT_MS = kugelOperationDeadline('KUGEL_TEST_WORLD_CLOSE_TIMEOUT_MS', KUGEL_MONITOR_PROVIDER_CLOSE_MAX_MS);
const KUGEL_LIVE_COMMAND_TIMEOUT_MS = kugelOperationDeadline('KUGEL_TEST_LIVE_COMMAND_TIMEOUT_MS', KUGEL_MONITOR_PROVIDER_LIVE_MAX_MS);
const KUGEL_WORLD_STATE_TIMEOUT_MS = kugelOperationDeadline('KUGEL_TEST_WORLD_STATE_TIMEOUT_MS', KUGEL_MONITOR_PROVIDER_STATE_MAX_MS);
const KUGEL_RECONCILE_GRACE_MS = process.env.NODE_ENV === 'test'
  ? Math.max(25, Number(process.env.KUGEL_TEST_RECONCILE_GRACE_MS) || 1000)
  : 15 * 1000;
const KUGEL_RECONCILE_INTERVAL_MS = process.env.NODE_ENV === 'test'
  ? Math.max(25, Number(process.env.KUGEL_TEST_RECONCILE_INTERVAL_MS) || 1000)
  : 30 * 1000;
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
const KUGEL_LESSON_ONE = Object.freeze({
  id: 1,
  title: 'שיעור 1: משלוח ראשון',
  summary: 'בונים מחסן, תחנת יעד ושביל ישר, ומפעילים את ה-Agent למסלול ראשון.',
  worldId: KUGEL_LESSON_ONE_WORLD_ID,
  mode: 'Adventure',
});
const KUGEL_LESSON_TITLES = Object.freeze({
  2: ['מסלול עם פנייה', 'רצף פקודות עם פנייה אחת במסלול המשלוחים.'],
  3: ['החבילה מגיעה', 'ה-Agent מגיע לתחנה ומניח או מסמן חבילה.'],
  4: ['שליח עצמאי', 'מסלול משלוחים אישי עם בדיקה ותיקון.'],
  5: ['משלוח אחד לא מספיק', 'מתחילים לחשוב על עבודה חוזרת ואוטומציה.'],
  6: ['הלוך וחזור', 'מחזור פעולה מלא: יציאה, מסירה וחזרה.'],
  7: ['לולאה עם עצירה', 'לולאה שמופעלת ונעצרת בצורה בטוחה.'],
  8: ['קו אישי בעיר', 'קו משלוחים מחזורי אישי בעיר של התלמידים.'],
  9: ['יש מצב בעיר', 'מצב נראה בעולם שהקוד יכול לבדוק או לייצג.'],
  10: ['אם הדרך פתוחה', 'תנאי if שמחליט לפי מצב הדרך.'],
  11: ['מחכים או עוקפים', 'תגובה אחרת כשהדרך חסומה או לא מוכנה.'],
  12: ['חוק חכם אישי', 'כלל אישי של if/else בתוך העיר.'],
  13: ['ממפים את העיר', 'בחירת מערכות לשדרוג ותכנון אלגוריתם.'],
  14: ['מוסיפים אוטומציה חדשה', 'בנייה או שדרוג של מערכת עירונית אחת.'],
  15: ['מחברים ובודקים', 'בדיקה של שתי אוטומציות ותיקון תקלה.'],
  16: ['דמו עיר חכמה', 'הצגת עיר חכמה עם כמה אוטומציות שעובדות יחד.'],
});
function kugelLessonWorldId(lessonId) {
  if (lessonId === 0) return KUGEL_LESSON_ZERO_WORLD_ID;
  if (lessonId === 1) return KUGEL_LESSON_ONE_WORLD_ID;
  return String(process.env[`KUGEL_LESSON_${lessonId}_WORLD_ID`] || KUGEL_AGENT_ACADEMY_WORLD_ID);
}
const KUGEL_MINECRAFT_LESSONS = Object.freeze(Object.fromEntries([
  [0, KUGEL_LESSON_ZERO],
  [1, KUGEL_LESSON_ONE],
  ...Array.from({ length: 15 }, (_, index) => {
    const id = index + 2;
    const [title, summary] = KUGEL_LESSON_TITLES[id] || [`שיעור ${id}`, 'חיבור Minecraft לשיעור הזה עדיין צריך מיפוי.'];
    return [id, Object.freeze({
      id,
      title: `שיעור ${id}: ${title}`,
      summary,
      worldId: kugelLessonWorldId(id),
      mode: 'Adventure',
    })];
  }),
]));

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
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

function requestHostname(req) {
  const forwardedHost = String(req.headers['x-forwarded-host'] || '').split(',')[0].trim();
  const rawHost = forwardedHost || String(req.headers.host || '');
  return rawHost.trim().toLowerCase().replace(/:\d+$/, '').replace(/\.$/, '');
}

function subscriptionGateEnabledForRequest(req) {
  return SUBSCRIPTION_GATE_ENABLED && !SUBSCRIPTION_GATE_OPEN_HOSTS.has(requestHostname(req));
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

function addSqliteColumn(db, sql) {
  try {
    db.prepare(sql).run();
  } catch (error) {
    const duplicateColumn = error?.code === 'SQLITE_ERROR'
      && /^duplicate column name:/i.test(String(error.message || ''));
    if (!duplicateColumn) throw error;
  }
}

function migrateAndVerifyClassroomAdminSessions(db) {
  const columns = db.prepare("PRAGMA table_info('classroom_admin_sessions')").all();
  const canonical = ['id', 'admin_id', 'token_hash', 'credential_version', 'created_at', 'expires_at', 'last_seen_at', 'revoked_at'];
  if (columns.map(column => column.name).join(',') !== canonical.join(',')) {
    const names = new Set(columns.map(column => column.name));
    const requiredLegacy = ['id', 'token_hash', 'created_at', 'expires_at', 'last_seen_at', 'revoked_at'];
    if (columns.length !== requiredLegacy.length || !requiredLegacy.every(name => names.has(name))) {
      throw new Error('classroom_admin_sessions schema incompatible: unexpected legacy columns');
    }
    const identity = db.prepare('SELECT id, credential_version FROM classroom_admin_identity').get();
    const count = db.prepare('SELECT COUNT(*) AS count FROM classroom_admin_sessions').get().count;
    if (count && !identity) return false;
    db.transaction(() => {
      db.prepare('DROP INDEX IF EXISTS idx_classroom_admin_sessions_token').run();
      db.prepare('DROP INDEX IF EXISTS idx_classroom_admin_sessions_identity').run();
      db.prepare('ALTER TABLE classroom_admin_sessions RENAME TO classroom_admin_sessions_legacy_v3').run();
      db.prepare(`CREATE TABLE classroom_admin_sessions (
        id TEXT PRIMARY KEY NOT NULL,
        admin_id TEXT NOT NULL REFERENCES classroom_admin_identity(id) ON DELETE RESTRICT,
        token_hash TEXT NOT NULL UNIQUE,
        credential_version INTEGER NOT NULL CHECK (credential_version >= 0),
        created_at TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        last_seen_at TEXT,
        revoked_at TEXT
      )`).run();
      if (count) {
        db.prepare(`INSERT INTO classroom_admin_sessions
          (id, admin_id, token_hash, credential_version, created_at, expires_at, last_seen_at, revoked_at)
          SELECT id, ?, token_hash, 0, created_at, expires_at, last_seen_at, revoked_at
          FROM classroom_admin_sessions_legacy_v3`).run(identity.id);
      }
      db.prepare('DROP TABLE classroom_admin_sessions_legacy_v3').run();
      db.prepare('CREATE UNIQUE INDEX idx_classroom_admin_sessions_token ON classroom_admin_sessions(token_hash)').run();
      db.prepare('CREATE INDEX idx_classroom_admin_sessions_identity ON classroom_admin_sessions(admin_id, credential_version)').run();
    }).immediate();
  }
  const verified = db.prepare("PRAGMA table_info('classroom_admin_sessions')").all();
  if (verified.map(column => column.name).join(',') !== canonical.join(',')) throw new Error('classroom_admin_sessions schema incompatible: non-canonical columns');
  const expectedTypes = ['TEXT','TEXT','TEXT','INTEGER','TEXT','TEXT','TEXT','TEXT'];
  if (verified.map(column => String(column.type || '').toUpperCase()).join(',') !== expectedTypes.join(',')) {
    throw new Error('classroom_admin_sessions schema incompatible: unexpected column affinities');
  }
  if (verified.some(column => column.dflt_value !== null)) throw new Error('classroom_admin_sessions schema incompatible: unexpected defaults');
  for (const name of ['id', 'admin_id', 'token_hash', 'credential_version', 'created_at', 'expires_at']) {
    if (!verified.find(column => column.name === name)?.notnull) throw new Error(`classroom_admin_sessions schema incompatible: ${name} must be NOT NULL`);
  }
  if (verified[0].pk !== 1) throw new Error('classroom_admin_sessions schema incompatible: id must be primary key');
  const unique = db.prepare("SELECT name FROM pragma_index_list('classroom_admin_sessions') WHERE origin = 'u'").all()
    .map(index => db.prepare('SELECT name FROM pragma_index_info(?) ORDER BY seqno').all(index.name).map(column => column.name));
  if (JSON.stringify(unique) !== JSON.stringify([['token_hash']])) throw new Error('classroom_admin_sessions schema incompatible: token_hash must be UNIQUE');
  const tableSql = normalizedSql(db.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'classroom_admin_sessions'").get()?.sql);
  assertNoUnexpectedChecks('classroom_admin_sessions', tableSql, ['check(credential_version>=0)']);
  const foreignKeys = db.prepare("PRAGMA foreign_key_list('classroom_admin_sessions')").all();
  if (foreignKeys.length !== 1 || foreignKeys[0].from !== 'admin_id' || foreignKeys[0].table !== 'classroom_admin_identity'
    || foreignKeys[0].to !== 'id' || foreignKeys[0].on_delete !== 'RESTRICT') {
    throw new Error('classroom_admin_sessions schema incompatible: missing administrator foreign key');
  }
  return true;
}

function verifyClassroomCredentialSchema(db, { includeAdminSessions = true, allowMissing = false, skipTables = new Set() } = {}) {
  const specifications = {
    classroom_auth_rate_limits: {
      columns: ['limit_key','failures','started_at','updated_at'],
      types: ['TEXT','INTEGER','INTEGER','INTEGER'],
      defaults: [null,null,null,null],
      required: ['limit_key','failures','started_at','updated_at'],
      unique: [],
      foreignKeys: [],
      checks: ['check(failures>=1)'],
    },
    classroom_admin_identity: {
      columns: ['id','email','credential_version','bootstrapped_at','created_at','updated_at'],
      types: ['TEXT','TEXT','INTEGER','TEXT','TEXT','TEXT'],
      defaults: [null,null,'1',null,null,null],
      required: ['id','email','credential_version','created_at','updated_at'],
      unique: [['email']],
      foreignKeys: [],
      checks: ['check(credential_version>=1)'],
    },
    classroom_admin_challenges: {
      columns: ['id','admin_id','purpose','code_hash','credential_version','attempts','max_attempts','expires_at','used_at','revoked_at','created_at'],
      types: ['TEXT','TEXT','TEXT','TEXT','INTEGER','INTEGER','INTEGER','TEXT','TEXT','TEXT','TEXT'],
      defaults: [null,null,null,null,null,'0','5',null,null,null,null],
      required: ['id','admin_id','purpose','code_hash','credential_version','attempts','max_attempts','expires_at','created_at'],
      unique: [['code_hash']],
      foreignKeys: ['admin_id->classroom_admin_identity.id:RESTRICT'],
      checks: ["check(purposein('access','rotation'))",'check(attempts>=0)','check(max_attemptsbetween1and10)'],
    },
    classroom_teacher_invitations: {
      columns: ['id','email','name','code_hash','attempts','max_attempts','status','delivery_status','expires_at','created_by','teacher_id','created_at','updated_at','redeemed_at','revoked_at','delivery_generation'],
      types: ['TEXT','TEXT','TEXT','TEXT','INTEGER','INTEGER','TEXT','TEXT','TEXT','TEXT','TEXT','TEXT','TEXT','TEXT','TEXT','INTEGER'],
      defaults: [null,null,null,null,'0','5',"'pending'","'pending'",null,null,null,null,null,null,null,'1'],
      required: ['id','email','name','code_hash','attempts','max_attempts','status','delivery_status','delivery_generation','expires_at','created_by','created_at','updated_at'],
      unique: [['code_hash']],
      foreignKeys: ['created_by->classroom_admin_identity.id:RESTRICT','teacher_id->classroom_teachers.id:RESTRICT'],
      checks: ["check(statusin('pending','sent','failed','unknown','redeemed','revoked','expired','exhausted'))", "check(delivery_statusin('pending','sent','failed','unknown'))", 'check(delivery_generation>=1)', 'check(attempts>=0)', 'check(max_attemptsbetween1and10)'],
    },
    classroom_credential_audit: {
      columns: ['id','actor_type','actor_id','action','target_type','target_id','outcome','occurred_at'],
      types: ['TEXT','TEXT','TEXT','TEXT','TEXT','TEXT','TEXT','TEXT'],
      defaults: [null,null,null,null,null,null,null,null],
      required: ['id','actor_type','actor_id','action','target_type','target_id','outcome','occurred_at'],
      unique: [],
      foreignKeys: [],
      checks: ["check(actor_typein('system','admin','teacher'))", "check(actionin('issuance','delivery','redeem','bootstrap','login','logout','rotation','invitation_create','invitation_list','invitation_resend','invitation_revoke','invitation_redeem'))", "check(target_typein('admin','invitation','teacher','session','challenge'))", "check(outcomein('success','denied','invalid','throttled','replayed','exhausted','expired','failed','unknown'))"],
    },
  };
  for (const [tableName, specification] of Object.entries(specifications)) {
    if (skipTables.has(tableName)) continue;
    const table = db.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = ?").get(tableName);
    if (!table) {
      if (allowMissing) continue;
      throw new Error(`${tableName} schema incompatible: missing table`);
    }
    const columns = db.prepare(`PRAGMA table_info('${tableName}')`).all();
    if (columns.map(column => column.name).join(',') !== specification.columns.join(',')) {
      throw new Error(`${tableName} schema incompatible: unexpected columns`);
    }
    if (columns.map(column => String(column.type || '').toUpperCase()).join(',') !== specification.types.join(',')) {
      throw new Error(`${tableName} schema incompatible: unexpected column affinities`);
    }
    if (columns.some((column, index) => column.dflt_value !== specification.defaults[index])) {
      throw new Error(`${tableName} schema incompatible: unexpected column defaults`);
    }
    for (const name of specification.required) {
      if (!columns.find(column => column.name === name)?.notnull) throw new Error(`${tableName} schema incompatible: ${name} must be NOT NULL`);
    }
    if (columns[0].pk !== 1) throw new Error(`${tableName} schema incompatible: id must be primary key`);
    const unique = db.prepare(`SELECT name, origin FROM pragma_index_list(?) WHERE origin = 'u'`).all(tableName)
      .map(index => db.prepare('SELECT name FROM pragma_index_info(?) ORDER BY seqno').all(index.name).map(column => column.name));
    if (JSON.stringify(unique.sort()) !== JSON.stringify(specification.unique.sort())) {
      throw new Error(`${tableName} schema incompatible: unexpected UNIQUE constraints`);
    }
    const foreignKeys = db.prepare(`PRAGMA foreign_key_list('${tableName}')`).all()
      .map(key => `${key.from}->${key.table}.${key.to}:${key.on_delete}`).sort();
    if (JSON.stringify(foreignKeys) !== JSON.stringify([...specification.foreignKeys].sort())) {
      throw new Error(`${tableName} schema incompatible: unexpected foreign keys`);
    }
    assertNoUnexpectedChecks(tableName, table.sql, specification.checks);
  }
  const triggers = db.prepare(`SELECT name FROM sqlite_master WHERE type = 'trigger' AND tbl_name IN
    ('classroom_auth_rate_limits','classroom_admin_identity','classroom_admin_challenges','classroom_teacher_invitations','classroom_credential_audit','classroom_admin_sessions')`).all();
  if (triggers.length) throw new Error(`classroom credential schema incompatible: unexpected trigger ${triggers[0].name}`);
  const expectedIndexes = new Map([
    ['idx_classroom_admin_sessions_token', 'createuniqueindexidx_classroom_admin_sessions_tokenonclassroom_admin_sessions(token_hash)'],
    ['idx_classroom_admin_sessions_identity', 'createindexidx_classroom_admin_sessions_identityonclassroom_admin_sessions(admin_id,credential_version)'],
    ['idx_classroom_admin_identity_singleton', 'createuniqueindexidx_classroom_admin_identity_singletononclassroom_admin_identity((1))'],
    ['idx_classroom_admin_challenges_admin', 'createindexidx_classroom_admin_challenges_adminonclassroom_admin_challenges(admin_id,purpose,created_at)'],
    ['idx_classroom_teacher_invitations_email', 'createindexidx_classroom_teacher_invitations_emailonclassroom_teacher_invitations(email,created_at)'],
    ['idx_classroom_teacher_invitations_status', 'createindexidx_classroom_teacher_invitations_statusonclassroom_teacher_invitations(status,expires_at)'],
    ['idx_classroom_credential_audit_target', 'createindexidx_classroom_credential_audit_targetonclassroom_credential_audit(target_type,target_id,occurred_at)'],
  ]);
  const indexTables = new Map([
    ['idx_classroom_admin_sessions_token', 'classroom_admin_sessions'],
    ['idx_classroom_admin_sessions_identity', 'classroom_admin_sessions'],
    ['idx_classroom_admin_identity_singleton', 'classroom_admin_identity'],
    ['idx_classroom_admin_challenges_admin', 'classroom_admin_challenges'],
    ['idx_classroom_teacher_invitations_email', 'classroom_teacher_invitations'],
    ['idx_classroom_teacher_invitations_status', 'classroom_teacher_invitations'],
    ['idx_classroom_credential_audit_target', 'classroom_credential_audit'],
  ]);
  for (const name of [...expectedIndexes.keys()]) {
    const tableName = indexTables.get(name);
    if ((!includeAdminSessions && tableName === 'classroom_admin_sessions') || skipTables.has(tableName)
      || (allowMissing && !db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?").get(tableName))) {
      expectedIndexes.delete(name);
    }
  }
  for (const [name, expected] of expectedIndexes) {
    const row = db.prepare("SELECT sql FROM sqlite_master WHERE type = 'index' AND name = ?").get(name);
    if (!row || normalizedSql(row.sql) !== expected) throw new Error(`classroom credential schema incompatible: index ${name}`);
  }
  const credentialTables = ['classroom_auth_rate_limits','classroom_admin_identity','classroom_admin_challenges','classroom_teacher_invitations','classroom_credential_audit'];
  if (includeAdminSessions) credentialTables.push('classroom_admin_sessions');
  const inspectedTables = credentialTables.filter(tableName => !skipTables.has(tableName)
    && (!allowMissing || db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?").get(tableName)));
  const actualNamedIndexes = inspectedTables.length ? db.prepare(`SELECT name FROM sqlite_master WHERE type = 'index' AND sql IS NOT NULL
    AND tbl_name IN (${inspectedTables.map(() => '?').join(',')})`).all(...inspectedTables).map(row => row.name).sort() : [];
  const allowedNamedIndexes = [...expectedIndexes.keys()].sort();
  if (JSON.stringify(actualNamedIndexes) !== JSON.stringify(allowedNamedIndexes)) {
    throw new Error('classroom credential schema incompatible: unexpected named index');
  }
}

const CLASSROOM_AUDIT_COLUMNS = ['id', 'actor_type', 'actor_id', 'action', 'target_type', 'target_id', 'occurred_at', 'outcome'];
const normalizedSql = sql => String(sql || '').toLowerCase().replace(/\s+/g, '').replace(/"/g, "'");

function verifyClassroomManagementAuditSchema(db) {
  const table = db.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'classroom_management_audit'").get();
  if (!table) throw new Error('classroom_management_audit schema incompatible: missing table');
  const columns = db.prepare("PRAGMA table_info('classroom_management_audit')").all();
  if (columns.map(column => column.name).join(',') !== CLASSROOM_AUDIT_COLUMNS.join(',')) {
    throw new Error('classroom_management_audit schema incompatible: unexpected columns');
  }
  for (const column of columns) {
    if (String(column.type || '').toUpperCase() !== 'TEXT') {
      throw new Error(`classroom_management_audit schema incompatible: ${column.name} must have TEXT affinity`);
    }
    if (!column.notnull) throw new Error(`classroom_management_audit schema incompatible: ${column.name} must be NOT NULL`);
  }
  if (columns.find(column => column.name === 'id')?.pk !== 1) {
    throw new Error('classroom_management_audit schema incompatible: id must be the primary key');
  }
  const sql = normalizedSql(table.sql);
  for (const check of [
    "check(actor_typein('admin','teacher','student'))",
    "check(target_typein('teacher','student','classroom','progress'))",
    "check(outcomein('success','denied','not_found','invalid'))",
  ]) {
    if (!sql.includes(check)) throw new Error(`classroom_management_audit schema incompatible: missing canonical ${check}`);
  }
  const insert = db.prepare(`INSERT INTO classroom_management_audit
    (id, actor_type, actor_id, action, target_type, target_id, occurred_at, outcome)
    VALUES (?, ?, 'schema-check', 'schema.verify', ?, 'schema-check', '1970-01-01T00:00:00.000Z', ?)`);
  db.prepare('SAVEPOINT classroom_audit_schema_check').run();
  try {
    const verificationId = crypto.randomUUID();
    for (const actorType of ['admin', 'teacher', 'student']) {
      for (const targetType of ['teacher', 'student', 'classroom', 'progress']) {
        for (const outcome of ['success', 'denied', 'not_found', 'invalid']) {
          insert.run(`${verificationId}-${actorType}-${targetType}-${outcome}`, actorType, targetType, outcome);
        }
      }
    }
    for (const [actorType, targetType, outcome] of [
      ['root', 'teacher', 'success'], ['admin', 'unknown', 'success'], ['admin', 'teacher', 'other'],
    ]) {
      let rejected = false;
      try { insert.run(crypto.randomUUID(), actorType, targetType, outcome); }
      catch (error) { rejected = String(error.code || '').startsWith('SQLITE_CONSTRAINT'); if (!rejected) throw error; }
      if (!rejected) throw new Error('classroom_management_audit schema incompatible: CHECK accepts a non-canonical value');
    }
  } finally {
    db.prepare('ROLLBACK TO classroom_audit_schema_check').run();
    db.prepare('RELEASE classroom_audit_schema_check').run();
  }
}

function migrateAndVerifyClassroomManagementAudit(db) {
  const table = db.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'classroom_management_audit'").get();
  if (!table) return;
  const columns = db.prepare("PRAGMA table_info('classroom_management_audit')").all();
  const sql = normalizedSql(table.sql);
  const id = columns.find(column => column.name === 'id');
  const legacy = columns.map(column => column.name).join(',') === CLASSROOM_AUDIT_COLUMNS.join(',')
    && id?.pk === 1
    && columns.every(column => String(column.type || '').toUpperCase() === 'TEXT')
    && columns.filter(column => column.name !== 'id').every(column => column.notnull === 1)
    && sql.includes("check(actor_typein('admin','teacher'))")
    && sql.includes("check(target_typein('teacher','student'))")
    && sql.includes("check(outcomein('success','denied','not_found','invalid'))");
  if (legacy) {
    db.transaction(() => {
      db.prepare('ALTER TABLE classroom_management_audit RENAME TO classroom_management_audit_legacy').run();
      db.prepare(`CREATE TABLE classroom_management_audit (
        id TEXT PRIMARY KEY NOT NULL,
        actor_type TEXT NOT NULL CHECK (actor_type IN ('admin', 'teacher', 'student')),
        actor_id TEXT NOT NULL,
        action TEXT NOT NULL,
        target_type TEXT NOT NULL CHECK (target_type IN ('teacher', 'student', 'classroom', 'progress')),
        target_id TEXT NOT NULL,
        occurred_at TEXT NOT NULL,
        outcome TEXT NOT NULL CHECK (outcome IN ('success', 'denied', 'not_found', 'invalid'))
      )`).run();
      db.prepare(`INSERT INTO classroom_management_audit (${CLASSROOM_AUDIT_COLUMNS.join(', ')})
        SELECT ${CLASSROOM_AUDIT_COLUMNS.join(', ')} FROM classroom_management_audit_legacy`).run();
      db.prepare('DROP TABLE classroom_management_audit_legacy').run();
    }).immediate();
  }
  verifyClassroomManagementAuditSchema(db);
}

function assertNoUnexpectedChecks(tableName, sql, expectedChecks) {
  const normalized = normalizedSql(sql);
  for (const check of expectedChecks) {
    if (!normalized.includes(check)) throw new Error(`${tableName} schema incompatible: missing ${check}`);
  }
  if ((normalized.match(/check\(/g) || []).length !== expectedChecks.length) {
    throw new Error(`${tableName} schema incompatible: unexpected CHECK constraint`);
  }
}

function preflightCredentialMigrationSources(db) {
  const legacyCredentialTables = new Set();
  const sessionTable = db.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'classroom_admin_sessions'").get();
  if (sessionTable) {
    const columns = db.prepare("PRAGMA table_info('classroom_admin_sessions')").all();
    const names = columns.map(column => column.name);
    const legacyNames = ['id', 'token_hash', 'created_at', 'expires_at', 'last_seen_at', 'revoked_at'];
    const canonicalNames = ['id', 'admin_id', 'token_hash', 'credential_version', 'created_at', 'expires_at', 'last_seen_at', 'revoked_at'];
    if (names.join(',') !== canonicalNames.join(',') && names.join(',') !== legacyNames.join(',')) {
      throw new Error('classroom_admin_sessions schema incompatible: unexpected legacy columns');
    }
    if (names.join(',') === legacyNames.join(',')) {
      legacyCredentialTables.add('classroom_admin_sessions');
      const types = columns.map(column => String(column.type || '').toUpperCase());
      if (types.some(type => type !== 'TEXT') || columns.some(column => column.dflt_value !== null)
        || columns[0].pk !== 1 || columns[0].notnull !== 0
        || columns.slice(1, 4).some(column => !column.notnull)
        || columns.slice(4).some(column => column.notnull)) {
        throw new Error('classroom_admin_sessions schema incompatible: invalid legacy column contract');
      }
      const unique = db.prepare("SELECT name FROM pragma_index_list('classroom_admin_sessions') WHERE origin = 'u'").all()
        .map(index => db.prepare('SELECT name FROM pragma_index_info(?) ORDER BY seqno').all(index.name).map(column => column.name));
      if (JSON.stringify(unique) !== JSON.stringify([['token_hash']])) throw new Error('classroom_admin_sessions schema incompatible: invalid legacy UNIQUE contract');
      assertNoUnexpectedChecks('classroom_admin_sessions', sessionTable.sql, []);
      const triggers = db.prepare("SELECT name FROM sqlite_master WHERE type = 'trigger' AND tbl_name = 'classroom_admin_sessions'").all();
      if (triggers.length) throw new Error('classroom_admin_sessions schema incompatible: unexpected legacy trigger');
      const indexes = db.prepare("SELECT name, sql FROM sqlite_master WHERE type = 'index' AND tbl_name = 'classroom_admin_sessions' AND sql IS NOT NULL").all();
      for (const index of indexes) {
        if (index.name !== 'idx_classroom_admin_sessions_token'
          || normalizedSql(index.sql) !== 'createindexidx_classroom_admin_sessions_tokenonclassroom_admin_sessions(token_hash)') {
          throw new Error('classroom_admin_sessions schema incompatible: unexpected legacy index');
        }
      }
    } else {
      migrateAndVerifyClassroomAdminSessions(db);
    }
  }

  const invitations = db.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'classroom_teacher_invitations'").get();
  if (invitations) {
    const columns = db.prepare("PRAGMA table_info('classroom_teacher_invitations')").all();
    if (!columns.some(column => column.name === 'delivery_generation')) {
      legacyCredentialTables.add('classroom_teacher_invitations');
      const expected = ['id','email','name','code_hash','attempts','max_attempts','status','delivery_status','expires_at','created_by','teacher_id','created_at','updated_at','redeemed_at','revoked_at'];
      if (columns.map(column => column.name).join(',') !== expected.join(',')) throw new Error('classroom_teacher_invitations schema incompatible before delivery migration');
      const expectedTypes = ['TEXT','TEXT','TEXT','TEXT','INTEGER','INTEGER','TEXT','TEXT','TEXT','TEXT','TEXT','TEXT','TEXT','TEXT','TEXT'];
      const expectedDefaults = [null,null,null,null,'0','5',"'pending'","'pending'",null,null,null,null,null,null,null];
      const required = new Set(['id','email','name','code_hash','attempts','max_attempts','status','delivery_status','expires_at','created_by','created_at','updated_at']);
      if (columns.map(column => String(column.type || '').toUpperCase()).join(',') !== expectedTypes.join(',')
        || columns.some((column, index) => column.dflt_value !== expectedDefaults[index])
        || columns.some(column => Boolean(column.notnull) !== required.has(column.name))
        || columns[0].pk !== 1) {
        throw new Error('classroom_teacher_invitations schema incompatible: invalid columns before delivery migration');
      }
      const unique = db.prepare("SELECT name FROM pragma_index_list('classroom_teacher_invitations') WHERE origin = 'u'").all()
        .map(index => db.prepare('SELECT name FROM pragma_index_info(?) ORDER BY seqno').all(index.name).map(column => column.name));
      if (JSON.stringify(unique) !== JSON.stringify([['code_hash']])) throw new Error('classroom_teacher_invitations schema incompatible: invalid UNIQUE before delivery migration');
      const foreignKeys = db.prepare("PRAGMA foreign_key_list('classroom_teacher_invitations')").all()
        .map(key => `${key.from}->${key.table}.${key.to}:${key.on_delete}`).sort();
      if (JSON.stringify(foreignKeys) !== JSON.stringify(['created_by->classroom_admin_identity.id:RESTRICT','teacher_id->classroom_teachers.id:RESTRICT'])) {
        throw new Error('classroom_teacher_invitations schema incompatible: invalid foreign keys before delivery migration');
      }
      const checks = ["check(statusin('pending','sent','failed','unknown','redeemed','revoked','expired','exhausted'))", "check(delivery_statusin('pending','sent','failed','unknown'))", 'check(attempts>=0)', 'check(max_attemptsbetween1and10)'];
      assertNoUnexpectedChecks('classroom_teacher_invitations', invitations.sql, checks);
      const triggers = db.prepare("SELECT name FROM sqlite_master WHERE type = 'trigger' AND tbl_name = 'classroom_teacher_invitations'").all();
      if (triggers.length) throw new Error('classroom_teacher_invitations schema incompatible: unexpected trigger before delivery migration');
      const namedIndexes = db.prepare("SELECT name, sql FROM sqlite_master WHERE type = 'index' AND tbl_name = 'classroom_teacher_invitations' AND sql IS NOT NULL").all();
      const expectedIndexes = new Map([
        ['idx_classroom_teacher_invitations_email', 'createindexidx_classroom_teacher_invitations_emailonclassroom_teacher_invitations(email,created_at)'],
        ['idx_classroom_teacher_invitations_status', 'createindexidx_classroom_teacher_invitations_statusonclassroom_teacher_invitations(status,expires_at)'],
      ]);
      if (namedIndexes.length !== expectedIndexes.size || namedIndexes.some(index => normalizedSql(index.sql) !== expectedIndexes.get(index.name))) {
        throw new Error('classroom_teacher_invitations schema incompatible: invalid indexes before delivery migration');
      }
    }
  }
  verifyClassroomCredentialSchema(db, { allowMissing: true, skipTables: legacyCredentialTables });
}

function verifyClassroomMinecraftIdentitySchema(db, { allowMissing = false } = {}) {
  const table = db.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'classroom_minecraft_identities'").get();
  if (!table) {
    if (allowMissing) return;
    throw new Error('classroom_minecraft_identities schema incompatible: missing table');
  }
  const expectedColumns = ['student_id','upn','player_name','status','graph_object_id','source','verified_at','created_at','updated_at'];
  const columns = db.prepare("PRAGMA table_info('classroom_minecraft_identities')").all();
  if (columns.map(column => column.name).join(',') !== expectedColumns.join(',')) {
    throw new Error('classroom_minecraft_identities schema incompatible: unexpected columns');
  }
  if (columns.some(column => String(column.type || '').toUpperCase() !== 'TEXT' || column.notnull !== 1 || column.dflt_value !== null)) {
    throw new Error('classroom_minecraft_identities schema incompatible: invalid column contract');
  }
  if (columns[0].pk !== 1 || columns.slice(1).some(column => column.pk !== 0)) {
    throw new Error('classroom_minecraft_identities schema incompatible: invalid primary key');
  }
  const sql = normalizedSql(table.sql);
  for (const contract of [
    "upntextnotnulluniquecollatenocase",
    "player_nametextnotnulluniquecollatenocase",
    "check(statusin('verified'))",
    "graph_object_idtextnotnullunique",
    "check(sourcein('microsoft-graph-via-monitor'))",
  ]) {
    if (!sql.includes(contract)) throw new Error(`classroom_minecraft_identities schema incompatible: missing ${contract}`);
  }
  const foreignKeys = db.prepare("PRAGMA foreign_key_list('classroom_minecraft_identities')").all();
  if (foreignKeys.length !== 1 || foreignKeys[0].from !== 'student_id' || foreignKeys[0].table !== 'classroom_students'
    || foreignKeys[0].to !== 'id' || foreignKeys[0].on_delete !== 'CASCADE') {
    throw new Error('classroom_minecraft_identities schema incompatible: invalid student foreign key');
  }
  const unique = db.prepare("SELECT name FROM pragma_index_list('classroom_minecraft_identities') WHERE origin = 'u'").all()
    .map(index => db.prepare('SELECT name FROM pragma_index_info(?) ORDER BY seqno').all(index.name).map(column => column.name).join(','))
    .sort();
  if (JSON.stringify(unique) !== JSON.stringify(['graph_object_id','player_name','upn'])) {
    throw new Error('classroom_minecraft_identities schema incompatible: invalid unique constraints');
  }
  const explicitIndexes = db.prepare("SELECT name, sql FROM sqlite_master WHERE type = 'index' AND tbl_name = 'classroom_minecraft_identities' AND sql IS NOT NULL").all();
  if (explicitIndexes.length !== 1 || explicitIndexes[0].name !== 'idx_classroom_minecraft_identities_status'
    || normalizedSql(explicitIndexes[0].sql) !== 'createindexidx_classroom_minecraft_identities_statusonclassroom_minecraft_identities(status,verified_at)') {
    throw new Error('classroom_minecraft_identities schema incompatible: invalid indexes');
  }
  const triggers = db.prepare("SELECT name FROM sqlite_master WHERE type = 'trigger' AND tbl_name = 'classroom_minecraft_identities'").all();
  if (triggers.length) throw new Error('classroom_minecraft_identities schema incompatible: unexpected trigger');
}

function verifyClassroomMinecraftVerificationRequestSchema(db, { allowMissing = false } = {}) {
  const table = db.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'classroom_minecraft_verification_requests'").get();
  if (!table) {
    if (allowMissing) return;
    throw new Error('classroom_minecraft_verification_requests schema incompatible: missing table');
  }
  const expectedColumns = ['request_id','student_id','actor_type','actor_id','created_at'];
  const columns = db.prepare("PRAGMA table_info('classroom_minecraft_verification_requests')").all();
  if (columns.map(column => column.name).join(',') !== expectedColumns.join(',')
    || columns.some(column => String(column.type || '').toUpperCase() !== 'TEXT' || column.notnull !== 1 || column.dflt_value !== null)
    || columns[0].pk !== 1 || columns.slice(1).some(column => column.pk !== 0)) {
    throw new Error('classroom_minecraft_verification_requests schema incompatible: invalid column contract');
  }
  const sql = normalizedSql(table.sql);
  if (!sql.includes("check(actor_typein('admin','teacher'))")) {
    throw new Error('classroom_minecraft_verification_requests schema incompatible: invalid actor type');
  }
  const foreignKeys = db.prepare("PRAGMA foreign_key_list('classroom_minecraft_verification_requests')").all();
  if (foreignKeys.length !== 1 || foreignKeys[0].from !== 'student_id' || foreignKeys[0].table !== 'classroom_students'
    || foreignKeys[0].to !== 'id' || foreignKeys[0].on_delete !== 'CASCADE') {
    throw new Error('classroom_minecraft_verification_requests schema incompatible: invalid student foreign key');
  }
  const unique = db.prepare("SELECT name FROM pragma_index_list('classroom_minecraft_verification_requests') WHERE origin = 'u'").all()
    .map(index => db.prepare('SELECT name FROM pragma_index_info(?) ORDER BY seqno').all(index.name).map(column => column.name).join(','));
  if (JSON.stringify(unique) !== JSON.stringify(['student_id'])) {
    throw new Error('classroom_minecraft_verification_requests schema incompatible: invalid unique constraint');
  }
  const explicitIndexes = db.prepare("SELECT name FROM sqlite_master WHERE type = 'index' AND tbl_name = 'classroom_minecraft_verification_requests' AND sql IS NOT NULL").all();
  const triggers = db.prepare("SELECT name FROM sqlite_master WHERE type = 'trigger' AND tbl_name = 'classroom_minecraft_verification_requests'").all();
  if (explicitIndexes.length || triggers.length) {
    throw new Error('classroom_minecraft_verification_requests schema incompatible: unexpected database object');
  }
}

function openSummerDb() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const db = new Database(SUMMER_DB_FILE);
  preflightCredentialMigrationSources(db);
  verifyClassroomMinecraftIdentitySchema(db, { allowMissing: true });
  verifyClassroomMinecraftVerificationRequestSchema(db, { allowMissing: true });
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  const migrateCredentialSchema = db.transaction(() => {
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
      archived_at TEXT,
      disabled_at TEXT,
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

    CREATE TABLE IF NOT EXISTS classroom_auth_rate_limits (
      limit_key TEXT PRIMARY KEY NOT NULL,
      failures INTEGER NOT NULL CHECK (failures >= 1),
      started_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS classroom_admin_identity (
      id TEXT PRIMARY KEY NOT NULL,
      email TEXT NOT NULL UNIQUE,
      credential_version INTEGER NOT NULL DEFAULT 1 CHECK (credential_version >= 1),
      bootstrapped_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS classroom_admin_challenges (
      id TEXT PRIMARY KEY NOT NULL,
      admin_id TEXT NOT NULL REFERENCES classroom_admin_identity(id) ON DELETE RESTRICT,
      purpose TEXT NOT NULL CHECK (purpose IN ('access', 'rotation')),
      code_hash TEXT NOT NULL UNIQUE,
      credential_version INTEGER NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
      max_attempts INTEGER NOT NULL DEFAULT 5 CHECK (max_attempts BETWEEN 1 AND 10),
      expires_at TEXT NOT NULL,
      used_at TEXT,
      revoked_at TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS classroom_teacher_invitations (
      id TEXT PRIMARY KEY NOT NULL,
      email TEXT NOT NULL,
      name TEXT NOT NULL,
      code_hash TEXT NOT NULL UNIQUE,
      attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
      max_attempts INTEGER NOT NULL DEFAULT 5 CHECK (max_attempts BETWEEN 1 AND 10),
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sent','failed','unknown','redeemed','revoked','expired','exhausted')),
      delivery_status TEXT NOT NULL DEFAULT 'pending' CHECK (delivery_status IN ('pending','sent','failed','unknown')),
      expires_at TEXT NOT NULL,
      created_by TEXT NOT NULL REFERENCES classroom_admin_identity(id) ON DELETE RESTRICT,
      teacher_id TEXT REFERENCES classroom_teachers(id) ON DELETE RESTRICT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      redeemed_at TEXT,
      revoked_at TEXT,
      delivery_generation INTEGER NOT NULL DEFAULT 1 CHECK (delivery_generation >= 1)
    );

    CREATE TABLE IF NOT EXISTS classroom_credential_audit (
      id TEXT PRIMARY KEY NOT NULL,
      actor_type TEXT NOT NULL CHECK (actor_type IN ('system','admin','teacher')),
      actor_id TEXT NOT NULL,
      action TEXT NOT NULL CHECK (action IN ('issuance','delivery','redeem','bootstrap','login','logout','rotation','invitation_create','invitation_list','invitation_resend','invitation_revoke','invitation_redeem')),
      target_type TEXT NOT NULL CHECK (target_type IN ('admin','invitation','teacher','session','challenge')),
      target_id TEXT NOT NULL,
      outcome TEXT NOT NULL CHECK (outcome IN ('success','denied','invalid','throttled','replayed','exhausted','expired','failed','unknown')),
      occurred_at TEXT NOT NULL
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
      archived_at TEXT,
      disabled_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS classroom_minecraft_identities (
      student_id TEXT PRIMARY KEY NOT NULL REFERENCES classroom_students(id) ON DELETE CASCADE,
      upn TEXT NOT NULL UNIQUE COLLATE NOCASE,
      player_name TEXT NOT NULL UNIQUE COLLATE NOCASE,
      status TEXT NOT NULL CHECK (status IN ('verified')),
      graph_object_id TEXT NOT NULL UNIQUE,
      source TEXT NOT NULL CHECK (source IN ('microsoft-graph-via-monitor')),
      verified_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS classroom_minecraft_verification_requests (
      request_id TEXT PRIMARY KEY NOT NULL,
      student_id TEXT NOT NULL UNIQUE REFERENCES classroom_students(id) ON DELETE CASCADE,
      actor_type TEXT NOT NULL CHECK (actor_type IN ('admin','teacher')),
      actor_id TEXT NOT NULL,
      created_at TEXT NOT NULL
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

    CREATE TABLE IF NOT EXISTS classroom_management_audit (
      id TEXT PRIMARY KEY NOT NULL,
      actor_type TEXT NOT NULL CHECK (actor_type IN ('admin', 'teacher', 'student')),
      actor_id TEXT NOT NULL,
      action TEXT NOT NULL,
      target_type TEXT NOT NULL CHECK (target_type IN ('teacher', 'student', 'classroom', 'progress')),
      target_id TEXT NOT NULL,
      occurred_at TEXT NOT NULL,
      outcome TEXT NOT NULL CHECK (outcome IN ('success', 'denied', 'not_found', 'invalid'))
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
      lesson_id INTEGER NOT NULL DEFAULT 0 CHECK (lesson_id BETWEEN 0 AND 16),
      active INTEGER NOT NULL DEFAULT 0 CHECK (active IN (0, 1)),
      monitor_server_name TEXT NOT NULL,
      world_id TEXT NOT NULL,
      events_since INTEGER NOT NULL,
      launch_token TEXT,
      generation INTEGER NOT NULL DEFAULT 0 CHECK (generation >= 0),
      previous_lesson_id INTEGER,
      previous_world_id TEXT,
      previous_events_since INTEGER,
      previous_generation INTEGER,
      server_state TEXT NOT NULL DEFAULT 'idle' CHECK (server_state IN ('idle', 'starting', 'running', 'stopping', 'error')),
      server_detail TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS kugel_student_runs (
      student_id TEXT PRIMARY KEY REFERENCES classroom_students(id) ON DELETE CASCADE,
      classroom_id TEXT NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
      lesson_id INTEGER NOT NULL DEFAULT 0 CHECK (lesson_id BETWEEN 0 AND 16),
      started_at TEXT,
      reset_at TEXT,
      finished_at TEXT,
      attempt_count INTEGER NOT NULL DEFAULT 0,
      best_time_ms INTEGER,
      best_finished_at TEXT,
      last_duration_ms INTEGER,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS craftom_lesson_submissions (
      id TEXT PRIMARY KEY,
      classroom_id TEXT NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
      student_id TEXT NOT NULL REFERENCES classroom_students(id) ON DELETE CASCADE,
      course_id TEXT NOT NULL DEFAULT 'craftom-agent',
      lesson_id INTEGER NOT NULL CHECK (lesson_id BETWEEN 0 AND 16),
      challenge_id INTEGER,
      lesson_title TEXT NOT NULL DEFAULT '',
      challenge_title TEXT NOT NULL DEFAULT '',
      exit_question TEXT NOT NULL DEFAULT '',
      exit_answer TEXT NOT NULL,
      image_path TEXT NOT NULL,
      image_name TEXT NOT NULL,
      image_mime TEXT NOT NULL CHECK (image_mime IN ('image/png', 'image/jpeg', 'image/webp')),
      image_size INTEGER NOT NULL,
      replacement_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(student_id, course_id, lesson_id)
    );

    CREATE TABLE IF NOT EXISTS classroom_lesson_access (
      classroom_id TEXT NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
      course_id TEXT NOT NULL DEFAULT 'craftom-agent',
      lesson_id INTEGER NOT NULL CHECK (lesson_id BETWEEN 0 AND 16),
      status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed')),
      opened_by_teacher_id TEXT REFERENCES classroom_teachers(id) ON DELETE SET NULL,
      opened_at TEXT,
      closed_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (classroom_id, course_id, lesson_id)
    );

    CREATE TABLE IF NOT EXISTS kugel_minecraft_compound_assignments (
      id TEXT PRIMARY KEY,
      monitor_server_name TEXT NOT NULL,
      minecraft_username TEXT NOT NULL,
      compound_id INTEGER NOT NULL,
      x INTEGER,
      y INTEGER,
      z INTEGER,
      last_seen_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(monitor_server_name, compound_id)
    );

    CREATE INDEX IF NOT EXISTS idx_classroom_teachers_email ON classroom_teachers(email);
    CREATE INDEX IF NOT EXISTS idx_classroom_teacher_sessions_token ON classroom_teacher_sessions(token_hash);
    CREATE INDEX IF NOT EXISTS idx_classroom_admin_sessions_token ON classroom_admin_sessions(token_hash);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_classroom_admin_identity_singleton ON classroom_admin_identity((1));
    CREATE INDEX IF NOT EXISTS idx_classroom_admin_challenges_admin ON classroom_admin_challenges(admin_id, purpose, created_at);
    CREATE INDEX IF NOT EXISTS idx_classroom_teacher_invitations_email ON classroom_teacher_invitations(email, created_at);
    CREATE INDEX IF NOT EXISTS idx_classroom_teacher_invitations_status ON classroom_teacher_invitations(status, expires_at);
    CREATE INDEX IF NOT EXISTS idx_classroom_credential_audit_target ON classroom_credential_audit(target_type, target_id, occurred_at);
    CREATE INDEX IF NOT EXISTS idx_teacher_courses_teacher ON teacher_courses(teacher_id);
    CREATE INDEX IF NOT EXISTS idx_classrooms_teacher ON classrooms(teacher_id);
    CREATE INDEX IF NOT EXISTS idx_classrooms_join_code ON classrooms(join_code);
    CREATE INDEX IF NOT EXISTS idx_classroom_courses_classroom ON classroom_courses(classroom_id);
    CREATE INDEX IF NOT EXISTS idx_classroom_students_classroom ON classroom_students(classroom_id);
    CREATE INDEX IF NOT EXISTS idx_classroom_minecraft_identities_status ON classroom_minecraft_identities(status, verified_at);
    CREATE INDEX IF NOT EXISTS idx_classroom_student_sessions_token ON classroom_student_sessions(token_hash);
    CREATE INDEX IF NOT EXISTS idx_classroom_progress_student ON classroom_progress(student_id);
    CREATE INDEX IF NOT EXISTS idx_kugel_student_runs_classroom ON kugel_student_runs(classroom_id);
    CREATE INDEX IF NOT EXISTS idx_craftom_submissions_class_lesson ON craftom_lesson_submissions(classroom_id, lesson_id);
    CREATE INDEX IF NOT EXISTS idx_craftom_submissions_student ON craftom_lesson_submissions(student_id);
    CREATE INDEX IF NOT EXISTS idx_classroom_lesson_access_course ON classroom_lesson_access(classroom_id, course_id, status);
    CREATE INDEX IF NOT EXISTS idx_kugel_compound_assignments_player
      ON kugel_minecraft_compound_assignments(monitor_server_name, minecraft_username COLLATE NOCASE);
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
  verifyClassroomMinecraftIdentitySchema(db);
  verifyClassroomMinecraftVerificationRequestSchema(db);
  addSqliteColumn(db, 'ALTER TABLE classroom_teacher_invitations ADD COLUMN delivery_generation INTEGER NOT NULL DEFAULT 1 CHECK (delivery_generation >= 1)');
  migrateAndVerifyClassroomManagementAudit(db);
  const adminSessionsReady = migrateAndVerifyClassroomAdminSessions(db);
  verifyClassroomCredentialSchema(db, { includeAdminSessions: adminSessionsReady });
  if (CLASSROOM_ADMIN_EMAIL) {
    const administrators = db.prepare('SELECT id, email FROM classroom_admin_identity ORDER BY created_at').all();
    if (administrators.length > 1 || (administrators[0] && administrators[0].email !== CLASSROOM_ADMIN_EMAIL)) {
      throw new Error('classroom credential configuration invalid: administrator identity drift');
    }
    if (!administrators.length) {
      const now = new Date().toISOString();
      const adminId = crypto.randomUUID();
      db.transaction(() => {
        db.prepare(`INSERT INTO classroom_admin_identity
          (id, email, credential_version, bootstrapped_at, created_at, updated_at)
          VALUES (?, ?, 1, ?, ?, ?)`)
          .run(adminId, CLASSROOM_ADMIN_EMAIL, now, now, now);
        db.prepare(`INSERT INTO classroom_credential_audit
          (id, actor_type, actor_id, action, target_type, target_id, outcome, occurred_at)
          VALUES (?, 'system', 'startup', 'bootstrap', 'admin', ?, 'success', ?)`)
          .run(crypto.randomUUID(), adminId, now);
      }).immediate();
    }
  }
  if (!adminSessionsReady) migrateAndVerifyClassroomAdminSessions(db);
  verifyClassroomCredentialSchema(db);
  });
  migrateCredentialSchema.immediate();
  db.transaction(() => cleanupExpiredMinecraftVerificationRequests(db)).immediate();
  try { db.prepare('ALTER TABLE student_progress ADD COLUMN child_id TEXT REFERENCES summer_children(id) ON DELETE CASCADE').run(); } catch {}
  try { db.prepare('ALTER TABLE classroom_students ADD COLUMN minecraft_player_name TEXT').run(); } catch {}
  try { db.prepare('ALTER TABLE kugel_class_sessions ADD COLUMN launch_token TEXT').run(); } catch {}
  addSqliteColumn(db, 'ALTER TABLE kugel_class_sessions ADD COLUMN generation INTEGER NOT NULL DEFAULT 0 CHECK (generation >= 0)');
  addSqliteColumn(db, 'ALTER TABLE kugel_class_sessions ADD COLUMN previous_lesson_id INTEGER');
  addSqliteColumn(db, 'ALTER TABLE kugel_class_sessions ADD COLUMN previous_world_id TEXT');
  addSqliteColumn(db, 'ALTER TABLE kugel_class_sessions ADD COLUMN previous_events_since INTEGER');
  addSqliteColumn(db, 'ALTER TABLE kugel_class_sessions ADD COLUMN previous_generation INTEGER');
  addSqliteColumn(db, 'ALTER TABLE classroom_teachers ADD COLUMN archived_at TEXT');
  addSqliteColumn(db, 'ALTER TABLE classroom_teachers ADD COLUMN disabled_at TEXT');
  addSqliteColumn(db, 'ALTER TABLE classroom_students ADD COLUMN archived_at TEXT');
  addSqliteColumn(db, 'ALTER TABLE classroom_students ADD COLUMN disabled_at TEXT');
  addSqliteColumn(db, 'ALTER TABLE kugel_student_runs ADD COLUMN attempt_count INTEGER NOT NULL DEFAULT 0');
  addSqliteColumn(db, 'ALTER TABLE kugel_student_runs ADD COLUMN best_time_ms INTEGER');
  addSqliteColumn(db, 'ALTER TABLE kugel_student_runs ADD COLUMN best_finished_at TEXT');
  addSqliteColumn(db, 'ALTER TABLE kugel_student_runs ADD COLUMN last_duration_ms INTEGER');
  try { db.prepare("ALTER TABLE summer_children ADD COLUMN subscription_status TEXT NOT NULL DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'past_due', 'cancelled'))").run(); } catch {}
  const migrateKugelSessionLessons = db.transaction(() => {
    const migrationKey = 'kugel-class-sessions-lesson-range-v1';
    if (db.prepare('SELECT 1 FROM classroom_migrations WHERE migration_key = ?').get(migrationKey)) return;
    const table = db.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'kugel_class_sessions'").get();
    if (table && String(table.sql || '').includes('CHECK (lesson_id = 0)')) {
      db.prepare('DROP INDEX IF EXISTS idx_kugel_active_monitor_server').run();
      db.prepare('ALTER TABLE kugel_class_sessions RENAME TO kugel_class_sessions_lesson_zero_old').run();
      db.prepare(`
        CREATE TABLE kugel_class_sessions (
          classroom_id TEXT PRIMARY KEY REFERENCES classrooms(id) ON DELETE CASCADE,
          lesson_id INTEGER NOT NULL DEFAULT 0 CHECK (lesson_id BETWEEN 0 AND 16),
          active INTEGER NOT NULL DEFAULT 0 CHECK (active IN (0, 1)),
          monitor_server_name TEXT NOT NULL,
          world_id TEXT NOT NULL,
          events_since INTEGER NOT NULL,
          launch_token TEXT,
          generation INTEGER NOT NULL DEFAULT 0 CHECK (generation >= 0),
          previous_lesson_id INTEGER,
          previous_world_id TEXT,
          previous_events_since INTEGER,
          previous_generation INTEGER,
          server_state TEXT NOT NULL DEFAULT 'idle' CHECK (server_state IN ('idle', 'starting', 'running', 'stopping', 'error')),
          server_detail TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
      `).run();
      db.prepare(`
        INSERT INTO kugel_class_sessions (
          classroom_id, lesson_id, active, monitor_server_name, world_id, events_since, launch_token, generation,
          server_state, server_detail, created_at, updated_at
        )
        SELECT classroom_id, lesson_id, active, monitor_server_name, world_id, events_since, launch_token, 0,
          server_state, server_detail, created_at, updated_at
        FROM kugel_class_sessions_lesson_zero_old
      `).run();
      db.prepare('DROP TABLE kugel_class_sessions_lesson_zero_old').run();
      db.prepare(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_kugel_active_monitor_server
        ON kugel_class_sessions(monitor_server_name) WHERE active = 1
      `).run();
    }
    db.prepare('INSERT INTO classroom_migrations (migration_key, applied_at) VALUES (?, ?)').run(migrationKey, new Date().toISOString());
  });
  migrateKugelSessionLessons();
  const migrateKugelStudentRunLessons = db.transaction(() => {
    const migrationKey = 'kugel-student-runs-lesson-range-v1';
    if (db.prepare('SELECT 1 FROM classroom_migrations WHERE migration_key = ?').get(migrationKey)) return;
    const table = db.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'kugel_student_runs'").get();
    if (table && String(table.sql || '').includes('CHECK (lesson_id = 0)')) {
      db.prepare('DROP INDEX IF EXISTS idx_kugel_student_runs_classroom').run();
      db.prepare('ALTER TABLE kugel_student_runs RENAME TO kugel_student_runs_lesson_zero_old').run();
      db.prepare(`
        CREATE TABLE kugel_student_runs (
          student_id TEXT PRIMARY KEY REFERENCES classroom_students(id) ON DELETE CASCADE,
          classroom_id TEXT NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
          lesson_id INTEGER NOT NULL DEFAULT 0 CHECK (lesson_id BETWEEN 0 AND 16),
          started_at TEXT,
          reset_at TEXT,
          finished_at TEXT,
          attempt_count INTEGER NOT NULL DEFAULT 0,
          best_time_ms INTEGER,
          best_finished_at TEXT,
          last_duration_ms INTEGER,
          updated_at TEXT NOT NULL
        )
      `).run();
      db.prepare(`
        INSERT INTO kugel_student_runs (
          student_id, classroom_id, lesson_id, started_at, reset_at, finished_at,
          attempt_count, best_time_ms, best_finished_at, last_duration_ms, updated_at
        )
        SELECT student_id, classroom_id, lesson_id, started_at, reset_at, finished_at,
          attempt_count, best_time_ms, best_finished_at, last_duration_ms, updated_at
        FROM kugel_student_runs_lesson_zero_old
      `).run();
      db.prepare('DROP TABLE kugel_student_runs_lesson_zero_old').run();
      db.prepare('CREATE INDEX IF NOT EXISTS idx_kugel_student_runs_classroom ON kugel_student_runs(classroom_id)').run();
    }
    db.prepare('INSERT INTO classroom_migrations (migration_key, applied_at) VALUES (?, ?)').run(migrationKey, new Date().toISOString());
  });
  migrateKugelStudentRunLessons();
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
  const kugelRunColumns = new Set(db.prepare("PRAGMA table_info('kugel_student_runs')").all().map(column => column.name));
  const missingKugelMetricColumns = ['attempt_count', 'best_time_ms', 'best_finished_at', 'last_duration_ms']
    .filter(column => !kugelRunColumns.has(column));
  if (missingKugelMetricColumns.length > 0) {
    throw new Error(`kugel_student_runs metrics migration incomplete: missing ${missingKugelMetricColumns.join(', ')}`);
  }
  for (const [tableName, expectedColumns] of [
    ['classroom_teachers', ['archived_at', 'disabled_at']],
    ['classroom_students', ['archived_at', 'disabled_at']],
    ['classroom_management_audit', ['id', 'actor_type', 'actor_id', 'action', 'target_type', 'target_id', 'occurred_at', 'outcome']],
  ]) {
    const columns = new Set(db.prepare(`PRAGMA table_info('${tableName}')`).all().map(column => column.name));
    const missing = expectedColumns.filter(column => !columns.has(column));
    if (missing.length) throw new Error(`${tableName} management migration incomplete: missing ${missing.join(', ')}`);
  }
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
        message: 'ההתקדמות נשמרת בדוח הכיתה ולא במנוי האישי.',
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

const DUMMY_CLASSROOM_TEACHER_SALT = '00000000000000000000000000000000';
const DUMMY_CLASSROOM_TEACHER_HASH = hashClassroomSecret('credential-dummy-teacher', DUMMY_CLASSROOM_TEACHER_SALT);
const DUMMY_CLASSROOM_STUDENT_SALT = '11111111111111111111111111111111';
const DUMMY_CLASSROOM_STUDENT_HASH = hashClassroomSecret('credential-dummy-student', DUMMY_CLASSROOM_STUDENT_SALT);

function createOneTimeCredentialHash(value) {
  const salt = crypto.randomBytes(16).toString('hex');
  return `${salt}:${hashClassroomSecret(value, salt)}`;
}

function oneTimeCredentialMatches(value, encodedHash) {
  const [salt, expectedHex] = String(encodedHash || '').split(':');
  const effectiveSalt = /^[a-f0-9]{32}$/.test(salt || '') ? salt : '00000000000000000000000000000000';
  const expected = /^[a-f0-9]{128}$/.test(expectedHex || '') ? expectedHex : '0'.repeat(128);
  const provided = hashClassroomSecret(value, effectiveSalt);
  return crypto.timingSafeEqual(Buffer.from(provided, 'hex'), Buffer.from(expected, 'hex'));
}

function classroomInviteMatches(value) {
  if (!CLASSROOM_TEACHER_INVITE_CODE) return false;
  const provided = crypto.createHash('sha256').update(String(value || '')).digest();
  const expected = crypto.createHash('sha256').update(CLASSROOM_TEACHER_INVITE_CODE).digest();
  return crypto.timingSafeEqual(provided, expected);
}

function classroomAdminCodeMatches(value) {
  if (!CLASSROOM_ADMIN_CODE) return false;
  const provided = crypto.createHash('sha256').update(String(value || '')).digest();
  const expected = crypto.createHash('sha256').update(CLASSROOM_ADMIN_CODE).digest();
  return crypto.timingSafeEqual(provided, expected);
}

function classroomLoginKey(req, role, identifier) {
  return `${role}:${req.socket.remoteAddress || 'unknown'}:${String(identifier || '').toLowerCase()}`;
}

function classroomSourceKey(req, role) {
  return `${role}:source:${req.socket.remoteAddress || 'unknown'}`;
}

function classroomIdentityKey(role, identifier) {
  return `${role}:identity:${String(identifier || '').toLowerCase()}`;
}

function pruneClassroomLoginFailures(db, now = Date.now()) {
  db.prepare('DELETE FROM classroom_auth_rate_limits WHERE started_at <= ?').run(now - CLASSROOM_LOGIN_WINDOW_MS);
}

function consumeClassroomLoginAttempts(keys, maxFailures = CLASSROOM_LOGIN_MAX_FAILURES) {
  const normalizedKeys = [...new Set(keys.filter(Boolean))];
  return withSummerDb(db => db.transaction(() => {
    const now = Date.now();
    pruneClassroomLoginFailures(db, now);
    const select = db.prepare('SELECT failures FROM classroom_auth_rate_limits WHERE limit_key = ?');
    const rows = normalizedKeys.map(key => ({ key, row: select.get(key) }));
    if (rows.some(({ row }) => row && row.failures >= maxFailures)) return true;
    const existingCount = db.prepare('SELECT COUNT(*) AS count FROM classroom_auth_rate_limits').get().count;
    const missingCount = rows.filter(({ row }) => !row).length;
    if (existingCount + missingCount > CLASSROOM_LOGIN_MAX_KEYS) return true;
    const upsert = db.prepare(`INSERT INTO classroom_auth_rate_limits (limit_key, failures, started_at, updated_at)
      VALUES (?, 1, ?, ?)
      ON CONFLICT(limit_key) DO UPDATE SET failures = failures + 1, updated_at = excluded.updated_at`);
    for (const { key } of rows) upsert.run(key, now, now);
    return false;
  }).immediate());
}

function isClassroomLoginLimited(key) {
  return withSummerDb(db => db.transaction(() => {
    pruneClassroomLoginFailures(db);
    const attempt = db.prepare('SELECT failures FROM classroom_auth_rate_limits WHERE limit_key = ?').get(key);
    if (attempt) return attempt.failures >= CLASSROOM_LOGIN_MAX_FAILURES;
    return db.prepare('SELECT COUNT(*) AS count FROM classroom_auth_rate_limits').get().count >= CLASSROOM_LOGIN_MAX_KEYS;
  }).immediate());
}

function recordClassroomLoginFailure(key) {
  consumeClassroomLoginAttempts([key]);
}

function clearClassroomLoginFailures(key) {
  withSummerDb(db => db.prepare('DELETE FROM classroom_auth_rate_limits WHERE limit_key = ?').run(key));
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

function createClassroomAdminSession(db, adminId, credentialVersion) {
  const token = crypto.randomBytes(32).toString('base64url');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS).toISOString();
  db.prepare(`
    INSERT INTO classroom_admin_sessions
      (id, token_hash, created_at, expires_at, admin_id, credential_version)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(crypto.randomUUID(), tokenHash(token), now.toISOString(), expiresAt, adminId, credentialVersion);
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
    const session = requireCurrentClassroomAdmin(db, req);
    if (!session) return false;
    const hash = tokenHash(token);
    db.prepare('UPDATE classroom_admin_sessions SET last_seen_at = ? WHERE token_hash = ?')
      .run(new Date().toISOString(), hash);
    return session;
  });
}

function requireCurrentClassroomAdmin(db, req) {
  const token = parseCookies(req).haiTechClassroomAdminToken || '';
  if (!token) return null;
  return db.prepare(`
    SELECT s.id, s.admin_id, s.credential_version
    FROM classroom_admin_sessions s
    JOIN classroom_admin_identity a ON a.id = s.admin_id AND a.credential_version = s.credential_version
    WHERE s.token_hash = ? AND s.revoked_at IS NULL AND s.expires_at > ?
  `).get(tokenHash(token), new Date().toISOString()) || null;
}

function requireCurrentClassroomTeacher(db, req) {
  const token = parseCookies(req).haiTechClassroomToken || '';
  if (!token) return null;
  const hash = tokenHash(token);
  const now = new Date().toISOString();
  const teacher = db.prepare(`
    SELECT t.* FROM classroom_teacher_sessions s
    JOIN classroom_teachers t ON t.id = s.teacher_id
    WHERE s.token_hash = ? AND s.revoked_at IS NULL AND s.expires_at > ?
      AND t.archived_at IS NULL AND t.disabled_at IS NULL
  `).get(hash, now);
  if (teacher) db.prepare('UPDATE classroom_teacher_sessions SET last_seen_at = ? WHERE token_hash = ?').run(now, hash);
  return teacher || null;
}

function requireCurrentClassroomStudent(db, req) {
  const token = parseCookies(req).haiTechClassroomToken || '';
  if (!token) return null;
  const hash = tokenHash(token);
  const now = new Date().toISOString();
  const student = db.prepare(`SELECT s.*, c.name AS classroom_name
    FROM classroom_student_sessions css
    JOIN classroom_students s ON s.id = css.student_id
    JOIN classrooms c ON c.id = s.classroom_id
    JOIN classroom_teachers t ON t.id = c.teacher_id
    WHERE css.token_hash = ? AND css.revoked_at IS NULL AND css.expires_at > ?
      AND s.archived_at IS NULL AND s.disabled_at IS NULL
      AND t.archived_at IS NULL AND t.disabled_at IS NULL`).get(hash, now);
  if (student) db.prepare('UPDATE classroom_student_sessions SET last_seen_at = ? WHERE token_hash = ?').run(now, hash);
  return student || null;
}

function recordClassroomManagementAudit(db, actorType, actorId, action, targetType, targetId, outcome) {
  db.prepare(`
    INSERT INTO classroom_management_audit (
      id, actor_type, actor_id, action, target_type, target_id, occurred_at, outcome
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    crypto.randomUUID(), actorType, String(actorId || 'unknown'), action,
    targetType, String(targetId || 'unknown'), new Date().toISOString(), outcome,
  );
}

function finalizeStaleMinecraftVerification(db, actorType, actorId, studentId, requestId) {
  const removed = db.prepare(`DELETE FROM classroom_minecraft_verification_requests
    WHERE student_id = ? AND request_id = ?`).run(studentId, requestId);
  if (removed.changes === 1) {
    recordClassroomManagementAudit(db, actorType, actorId, 'minecraft.identity.verify', 'student', studentId, 'denied');
  }
}

const MINECRAFT_VERIFICATION_REQUEST_TTL_MS = 10 * 60 * 1000;
function cleanupExpiredMinecraftVerificationRequests(db, nowMs = Date.now()) {
  const cutoff = new Date(nowMs - MINECRAFT_VERIFICATION_REQUEST_TTL_MS).toISOString();
  const expired = db.prepare(`SELECT request_id, student_id, actor_type, actor_id
    FROM classroom_minecraft_verification_requests WHERE created_at < ?`).all(cutoff);
  for (const request of expired) {
    const removed = db.prepare('DELETE FROM classroom_minecraft_verification_requests WHERE request_id = ?')
      .run(request.request_id);
    if (removed.changes === 1) {
      recordClassroomManagementAudit(db, request.actor_type, request.actor_id,
        'minecraft.identity.verify', 'student', request.student_id, 'denied');
    }
  }
  return expired.length;
}

function minecraftIdentityPublic(row) {
  if (!row) return null;
  return {
    upn: row.upn,
    playerName: row.player_name,
    status: row.status,
    graphObjectId: row.graph_object_id,
    source: row.source,
    verifiedAt: row.verified_at,
  };
}

function classroomStudentMinecraftIdentity(db, studentId) {
  return minecraftIdentityPublic(db.prepare(`SELECT upn, player_name, status, graph_object_id, source, verified_at
    FROM classroom_minecraft_identities WHERE student_id = ?`).get(studentId));
}

function cleanMinecraftUpn(value) {
  const upn = cleanEmail(value);
  return /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@hai\.tech$/.test(upn) ? upn : '';
}

async function readBoundedJsonResponse(response, maxBytes = 32 * 1024) {
  if (!response.body) throw new Error('empty_verifier_response');
  const reader = response.body.getReader();
  const chunks = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) throw new Error('verifier_response_too_large');
      chunks.push(Buffer.from(value));
    }
  } finally {
    reader.releaseLock();
  }
  return JSON.parse(Buffer.concat(chunks, total).toString('utf8'));
}

async function verifyExistingMinecraftIdentity(upn, playerName) {
  if (!MINECRAFT_IDENTITY_VERIFIER_URL || Buffer.byteLength(MINECRAFT_IDENTITY_VERIFIER_SECRET, 'utf8') < 32) {
    const error = new Error('minecraft_identity_verifier_unavailable');
    error.statusCode = 503;
    throw error;
  }
  let base;
  try { base = new URL(MINECRAFT_IDENTITY_VERIFIER_URL); } catch {
    const error = new Error('minecraft_identity_verifier_url_invalid');
    error.statusCode = 503;
    throw error;
  }
  const invalidBase = base.username || base.password || base.search || base.hash || !['', '/'].includes(base.pathname);
  if (invalidBase || (process.env.NODE_ENV === 'production'
    && (base.protocol !== 'https:' || !MINECRAFT_IDENTITY_VERIFIER_HOST || base.hostname.toLowerCase() !== MINECRAFT_IDENTITY_VERIFIER_HOST))) {
    const error = new Error('minecraft_identity_verifier_insecure');
    error.statusCode = 503;
    throw error;
  }
  if (process.env.NODE_ENV === 'test' && base.protocol === 'http:' && !['127.0.0.1', 'localhost', '::1'].includes(base.hostname)) {
    const error = new Error('minecraft_identity_verifier_test_host_invalid');
    error.statusCode = 503;
    throw error;
  }
  const target = new URL('/api/minecraft-identities/verify-existing', `${base.origin}/`);
  const requestTarget = target.pathname;
  const requestBody = JSON.stringify({ upn, playerName });
  const bodyHash = crypto.createHash('sha256').update(requestBody).digest('hex');
  const timestamp = String(Date.now());
  const signature = crypto.createHmac('sha256', MINECRAFT_IDENTITY_VERIFIER_SECRET)
    .update(`${timestamp}\nPOST\n${requestTarget}\n${bodyHash}`).digest('hex');
  let response;
  try {
    response = await fetch(target, {
      method: 'POST',
      redirect: 'manual',
      signal: AbortSignal.timeout(MINECRAFT_IDENTITY_VERIFY_TIMEOUT_MS),
      body: requestBody,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Hai-Timestamp': timestamp,
        'X-Hai-Signature': `sha256=${signature}`,
      },
    });
  } catch {
    const error = new Error('minecraft_identity_verifier_failed');
    error.statusCode = 502;
    throw error;
  }
  let payload = null;
  try { payload = await readBoundedJsonResponse(response); } catch {
    const error = new Error('minecraft_identity_verifier_invalid_response');
    error.statusCode = 502;
    throw error;
  }
  if (!response.ok) {
    const error = new Error('minecraft_identity_not_verified');
    error.statusCode = response.status === 404 ? 422 : 502;
    throw error;
  }
  const user = payload?.user;
  const payloadShapeValid = payload && typeof payload === 'object' && !Array.isArray(payload)
    && user && typeof user === 'object' && !Array.isArray(user)
    && typeof user.id === 'string' && typeof user.userPrincipalName === 'string'
    && typeof user.accountEnabled === 'boolean'
    && typeof payload.minecraftEducationLicensed === 'boolean';
  const canonicalUpn = payloadShapeValid ? cleanMinecraftUpn(user.userPrincipalName) : '';
  const graphObjectId = payloadShapeValid ? cleanText(user.id, 128) : '';
  if (!payloadShapeValid || !graphObjectId || graphObjectId !== user.id || canonicalUpn !== upn) {
    const error = new Error('minecraft_identity_verifier_invalid_response');
    error.statusCode = 502;
    throw error;
  }
  if (user.accountEnabled !== true || payload.minecraftEducationLicensed !== true) {
    const error = new Error('minecraft_identity_not_verified');
    error.statusCode = 422;
    throw error;
  }
  return { graphObjectId };
}

function auditInvitationFailure(req, action, targetId, outcome = 'invalid') {
  return withSummerDb(db => db.transaction(() => {
    const admin = requireCurrentClassroomAdmin(db, req);
    if (!admin) return false;
    db.prepare(`INSERT INTO classroom_credential_audit
      (id, actor_type, actor_id, action, target_type, target_id, outcome, occurred_at)
      VALUES (?, 'admin', ?, ?, 'invitation', ?, ?, ?)`)
      .run(crypto.randomUUID(), admin.admin_id, action, targetId || 'unknown', outcome, new Date().toISOString());
    return true;
  }).immediate());
}

function generateTemporaryTeacherPassword() {
  return crypto.randomBytes(18).toString('base64url');
}

async function deliverClassroomCredentialEmail(recipient, subject, code) {
  const allowedSubjects = new Set(['הזמנה להוראה ב־HaiTech', 'קוד גישה לניהול HaiTech']);
  if (!allowedSubjects.has(subject)) return 'failed';
  const command = String(process.env.ROBOTICS_CREDENTIAL_MAILER || '').trim();
  if (process.env.NODE_ENV === 'test' && !command) return 'sent';
  if (!command || command.includes('\0')) return 'failed';
  const payload = JSON.stringify({ recipient, subject, code });
  return new Promise(resolve => {
    let settled = false;
    let timedOut = false;
    const finish = outcome => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(outcome);
    };
    let child;
    try {
      child = spawn(command, [], {
        shell: false,
        stdio: ['pipe', 'ignore', 'ignore'],
        env: { PATH: '/usr/bin:/bin', LANG: 'C.UTF-8' },
      });
    } catch {
      resolve('failed');
      return;
    }
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
    }, 10000);
    child.once('error', error => finish(error?.code === 'ETIMEDOUT' ? 'unknown' : 'failed'));
    child.once('close', status => finish(timedOut || status === 75 ? 'unknown' : status === 0 ? 'sent' : 'failed'));
    child.stdin.on('error', () => {});
    child.stdin.end(payload);
  });
}

function reconcileAdminChallengeDelivery(challengeId, credentialVersion, delivery) {
  return withSummerDb(db => db.transaction(() => {
    const deliveredAt = new Date().toISOString();
    const current = db.prepare(`UPDATE classroom_admin_challenges SET attempts = attempts
      WHERE id = ? AND credential_version = ? AND used_at IS NULL AND revoked_at IS NULL
        AND EXISTS (SELECT 1 FROM classroom_admin_identity a
          WHERE a.id = classroom_admin_challenges.admin_id AND a.credential_version = ?)`)
      .run(challengeId, credentialVersion, credentialVersion);
    if (current.changes !== 1) return { stale: true };
    if (delivery === 'failed') {
      const revoked = db.prepare(`UPDATE classroom_admin_challenges SET revoked_at = ?
        WHERE id = ? AND credential_version = ? AND used_at IS NULL AND revoked_at IS NULL`)
        .run(deliveredAt, challengeId, credentialVersion);
      if (revoked.changes !== 1) return { stale: true };
    }
    db.prepare(`INSERT INTO classroom_credential_audit
      (id, actor_type, actor_id, action, target_type, target_id, outcome, occurred_at)
      VALUES (?, 'system', 'mailer', 'delivery', 'challenge', ?, ?, ?)`)
      .run(crypto.randomUUID(), challengeId, delivery === 'sent' ? 'success' : delivery, deliveredAt);
    return { stale: false };
  }).immediate());
}

async function reconcileAdminAccessDelivery(challengeId, credentialVersion, email, code) {
  const delivery = await deliverClassroomCredentialEmail(email, 'קוד גישה לניהול HaiTech', code);
  return reconcileAdminChallengeDelivery(challengeId, credentialVersion, delivery);
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
        AND t.archived_at IS NULL AND t.disabled_at IS NULL
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
      JOIN classroom_teachers t ON t.id = c.teacher_id
      WHERE css.token_hash = ? AND css.revoked_at IS NULL AND css.expires_at > ?
        AND s.archived_at IS NULL AND s.disabled_at IS NULL
        AND t.archived_at IS NULL AND t.disabled_at IS NULL
    `).get(tokenHash(token), new Date().toISOString());
    if (student) {
      db.prepare('UPDATE classroom_student_sessions SET last_seen_at = ? WHERE token_hash = ?')
        .run(new Date().toISOString(), tokenHash(token));
    }
    return student || null;
  });
}

function requireCurrentActiveStudent(db, req, studentId, classroomId) {
  const token = parseCookies(req).haiTechClassroomToken || '';
  const now = new Date().toISOString();
  if (!token) return { status: 401, error: 'נדרשת כניסת תלמיד/ה לכיתה.' };
  const session = db.prepare(`SELECT student_id FROM classroom_student_sessions
    WHERE token_hash = ? AND revoked_at IS NULL AND expires_at > ?`).get(tokenHash(token), now);
  if (!session || session.student_id !== studentId) return { status: 401, error: 'חיבור התלמיד/ה כבר אינו בתוקף.' };
  const active = db.prepare(`SELECT s.id, s.minecraft_player_name, c.teacher_id FROM classroom_students s
    JOIN classrooms c ON c.id = s.classroom_id
    JOIN classroom_teachers t ON t.id = c.teacher_id
    WHERE s.id = ? AND s.classroom_id = ?
      AND s.archived_at IS NULL AND s.disabled_at IS NULL
      AND t.archived_at IS NULL AND t.disabled_at IS NULL`).get(studentId, classroomId);
  return active ? { student: active } : { status: 409, error: 'חשבון התלמיד/ה או המורה הושבת בזמן הפעולה.' };
}

function requireCurrentTeacherClassroom(db, req, teacherId, classroomId) {
  const token = parseCookies(req).haiTechClassroomToken || '';
  const now = new Date().toISOString();
  const teacherSession = token && db.prepare(`SELECT ts.id FROM classroom_teacher_sessions ts
    JOIN classroom_teachers t ON t.id = ts.teacher_id
    WHERE ts.token_hash = ? AND ts.teacher_id = ?
      AND ts.revoked_at IS NULL AND ts.expires_at > ?
      AND t.archived_at IS NULL AND t.disabled_at IS NULL`).get(tokenHash(token), teacherId, now);
  if (!teacherSession) return { status: 401, error: 'חיבור המורה כבר אינו בתוקף.' };
  const classroom = db.prepare('SELECT id FROM classrooms WHERE id = ? AND teacher_id = ?').get(classroomId, teacherId);
  return classroom
    ? { classroom }
    : { status: 404, error: 'הכיתה לא נמצאה.' };
}

function requireCurrentTeacherKugelClass(db, req, teacherId, classroomId) {
  const token = parseCookies(req).haiTechClassroomToken || '';
  const now = new Date().toISOString();
  const active = token && db.prepare(`SELECT c.id FROM classroom_teacher_sessions ts
    JOIN classroom_teachers t ON t.id = ts.teacher_id
    JOIN classrooms c ON c.teacher_id = t.id AND c.id = ?
    JOIN kugel_class_sessions ks ON ks.classroom_id = c.id
      AND ks.active = 1 AND ks.server_state = 'running'
    JOIN teacher_courses tc ON tc.teacher_id = t.id AND tc.course_id = ?
    JOIN classroom_courses cc ON cc.classroom_id = c.id AND cc.course_id = ?
    WHERE ts.token_hash = ? AND ts.teacher_id = ? AND ts.revoked_at IS NULL AND ts.expires_at > ?
      AND t.archived_at IS NULL AND t.disabled_at IS NULL`).get(
    classroomId, KUGEL_COURSE_ID, KUGEL_COURSE_ID, tokenHash(token), teacherId, now,
  );
  return active
    ? { classroom: active }
    : { status: 409, error: 'חיבור המורה, ההרשאה או השיעור הפעיל השתנו בזמן ההמתנה.' };
}

function requireCurrentTeacherKugelEntitlement(db, req, teacherId, classroomId) {
  const token = parseCookies(req).haiTechClassroomToken || '';
  const now = new Date().toISOString();
  const active = token && db.prepare(`SELECT c.id FROM classroom_teacher_sessions ts
    JOIN classroom_teachers t ON t.id = ts.teacher_id
    JOIN classrooms c ON c.teacher_id = t.id AND c.id = ?
    JOIN teacher_courses tc ON tc.teacher_id = t.id AND tc.course_id = ?
    JOIN classroom_courses cc ON cc.classroom_id = c.id AND cc.course_id = ?
    WHERE ts.token_hash = ? AND ts.teacher_id = ? AND ts.revoked_at IS NULL AND ts.expires_at > ?
      AND t.archived_at IS NULL AND t.disabled_at IS NULL`).get(
    classroomId, KUGEL_COURSE_ID, KUGEL_COURSE_ID, tokenHash(token), teacherId, now,
  );
  return active
    ? { classroom: active }
    : { status: 409, error: 'חיבור המורה, הבעלות או הרשאת Minecraft השתנו לפני רכישת החכירה.' };
}

function requireCurrentPlayerTarget(db, req, teacherId, classroomId, target) {
  const classroomAuthorization = requireCurrentTeacherKugelClass(db, req, teacherId, classroomId);
  if (classroomAuthorization.status) return classroomAuthorization;
  const student = db.prepare(`SELECT s.id FROM classroom_students s
    JOIN classrooms c ON c.id = s.classroom_id
    JOIN classroom_teachers t ON t.id = c.teacher_id
    JOIN classroom_minecraft_identities i ON i.student_id = s.id AND i.status = 'verified'
      AND lower(i.player_name) = lower(s.minecraft_player_name)
    WHERE s.classroom_id = ? AND c.teacher_id = ?
      AND s.archived_at IS NULL AND s.disabled_at IS NULL
      AND t.archived_at IS NULL AND t.disabled_at IS NULL
      AND lower(i.player_name) = lower(?)`).get(classroomId, teacherId, target);
  return student ? { student } : { status: 409, error: 'השחקן, ההרשאה או השיעור הפעיל השתנו בזמן ההמתנה.' };
}

function isPreviewDemoStudent(student) {
  return Boolean(
    CLASSROOM_PREVIEW_DEMO_TEACHER
    && student
    && student.name === 'הדסה בדיקה'
    && (!KUGEL_PREVIEW_CLASSROOM_ID || student.classroom_id === KUGEL_PREVIEW_CLASSROOM_ID)
  );
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

function ensurePreviewDemoClassroom(db) {
  const email = 'preview-teacher@hai.tech';
  const now = new Date().toISOString();
  let teacher = db.prepare('SELECT * FROM classroom_teachers WHERE email = ?').get(email);
  if (!teacher) {
    const salt = crypto.randomBytes(16).toString('hex');
    teacher = {
      id: crypto.randomUUID(),
      name: 'מורה בדיקה',
      email,
      password_salt: salt,
      password_hash: hashClassroomSecret(crypto.randomUUID(), salt),
      created_at: now,
      updated_at: now,
    };
    db.prepare(`
      INSERT INTO classroom_teachers (id, name, email, password_salt, password_hash, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(teacher.id, teacher.name, teacher.email, teacher.password_salt, teacher.password_hash, teacher.created_at, teacher.updated_at);
  }
  replaceTeacherCourses(db, teacher.id, CLASSROOM_COURSE_IDS);
  let classroom = KUGEL_PREVIEW_CLASSROOM_ID
    ? db.prepare('SELECT * FROM classrooms WHERE id = ? AND teacher_id = ?').get(KUGEL_PREVIEW_CLASSROOM_ID, teacher.id)
    : null;
  if (!classroom) classroom = db.prepare('SELECT * FROM classrooms WHERE teacher_id = ? ORDER BY created_at LIMIT 1').get(teacher.id);
  if (!classroom) {
    classroom = {
      id: crypto.randomUUID(),
      teacher_id: teacher.id,
      name: 'כיתת בדיקה ל-preview',
      join_code: generateClassJoinCode(db),
      created_at: now,
      updated_at: now,
    };
    db.prepare(`
      INSERT INTO classrooms (id, teacher_id, name, join_code, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(classroom.id, classroom.teacher_id, classroom.name, classroom.join_code, classroom.created_at, classroom.updated_at);
  }
  replaceClassroomCourses(db, classroom.id, [KUGEL_COURSE_ID]);
  return { teacher, classroom };
}

function previewDemoTeacherLogin() {
  if (!CLASSROOM_PREVIEW_DEMO_TEACHER) return null;
  return withSummerDb(db => {
    const result = db.transaction(() => {
      const existing = db.prepare('SELECT archived_at, disabled_at FROM classroom_teachers WHERE email = ?')
        .get('preview-teacher@hai.tech');
      if (existing && (existing.archived_at || existing.disabled_at)) return null;
      return ensurePreviewDemoClassroom(db);
    })();
    if (!result) return null;
    return { ...result, token: createClassroomTeacherSession(db, result.teacher.id) };
  });
}

function previewDemoStudentLogin() {
  if (!CLASSROOM_PREVIEW_DEMO_TEACHER) return null;
  return withSummerDb(db => {
    const createDemo = db.transaction(() => {
      const existingTeacher = db.prepare('SELECT id, archived_at, disabled_at FROM classroom_teachers WHERE email = ?')
        .get('preview-teacher@hai.tech');
      if (existingTeacher && (existingTeacher.archived_at || existingTeacher.disabled_at)) return null;
      const existingStudent = existingTeacher ? db.prepare(`
        SELECT s.archived_at, s.disabled_at
        FROM classroom_students s
        JOIN classrooms c ON c.id = s.classroom_id
        WHERE c.teacher_id = ? AND s.name = ? LIMIT 1
      `).get(existingTeacher.id, 'הדסה בדיקה') : null;
      if (existingStudent && (existingStudent.archived_at || existingStudent.disabled_at)) return null;
      const { teacher, classroom } = ensurePreviewDemoClassroom(db);
      if (teacher.archived_at || teacher.disabled_at) return null;
      const now = new Date().toISOString();
      let student = db.prepare('SELECT * FROM classroom_students WHERE classroom_id = ? AND name = ?')
        .get(classroom.id, 'הדסה בדיקה');
      if (!student) {
        const salt = crypto.randomBytes(16).toString('hex');
        student = {
          id: crypto.randomUUID(),
          classroom_id: classroom.id,
          name: 'הדסה בדיקה',
          login_salt: salt,
          login_hash: hashClassroomSecret(crypto.randomUUID(), salt),
          minecraft_player_name: 'HadasaTest',
          created_at: now,
          updated_at: now,
        };
        db.prepare(`
          INSERT INTO classroom_students (id, classroom_id, name, login_salt, login_hash, minecraft_player_name, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(student.id, student.classroom_id, student.name, student.login_salt, student.login_hash, student.minecraft_player_name, student.created_at, student.updated_at);
      } else if (student.archived_at || student.disabled_at) {
        return null;
      } else if (!student.minecraft_player_name) {
        db.prepare('UPDATE classroom_students SET minecraft_player_name = ?, updated_at = ? WHERE id = ?')
          .run('HadasaTest', now, student.id);
        student = db.prepare('SELECT * FROM classroom_students WHERE id = ?').get(student.id);
      }
      return { classroom, student };
    });
    const result = createDemo();
    return result ? { ...result, token: createClassroomStudentSession(db, result.student.id) } : null;
  });
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

function statusRank(status) {
  return { missing: 0, started: 1, completed: 2 }[status] || 0;
}

function betterLearningStatus(current, next) {
  return statusRank(next) > statusRank(current) ? next : current;
}

function buildCraftomProgressDashboard(db, classroom) {
  const students = db.prepare(`
    SELECT id, name, minecraft_player_name, created_at
    FROM classroom_students
    WHERE classroom_id = ? AND archived_at IS NULL AND disabled_at IS NULL
    ORDER BY created_at
  `).all(classroom.id);
  const lessons = Object.values(KUGEL_MINECRAFT_LESSONS).map(kugelLessonPublic);
  const studentIds = students.map(student => student.id);
  const lessonIds = lessons.map(lesson => String(lesson.id));

  const blankLesson = lesson => ({
    lessonId: lesson.id,
    title: lesson.title,
    academyStatus: 'missing',
    minecraftStatus: 'missing',
    exitTicketStatus: 'missing',
    overallStatus: 'missing',
    attempts: 0,
    bestTimeMs: null,
    lastDurationMs: null,
    updatedAt: null,
    submission: null,
  });

  const byStudent = new Map(students.map(student => [
    student.id,
    {
      id: student.id,
      name: student.name,
      minecraftPlayerName: student.minecraft_player_name || '',
      lessons: Object.fromEntries(lessons.map(lesson => [String(lesson.id), blankLesson(lesson)])),
      totals: { started: 0, completed: 0, submissions: 0, needsAttention: 0 },
    },
  ]));

  if (studentIds.length) {
    const progressRows = db.prepare(`
      SELECT p.*
      FROM classroom_progress p
      JOIN classroom_students s ON s.id = p.student_id
      WHERE s.classroom_id = ? AND p.course_id = ?
        AND s.archived_at IS NULL AND s.disabled_at IS NULL
    `).all(classroom.id, KUGEL_COURSE_ID);
    for (const row of progressRows) {
      if (!lessonIds.includes(String(row.lesson_id))) continue;
      const student = byStudent.get(row.student_id);
      if (!student) continue;
      const lesson = student.lessons[String(row.lesson_id)];
      const completed = row.status === 'completed';
      if (row.activity_id === 'academy-complete') {
        lesson.academyStatus = betterLearningStatus(lesson.academyStatus, completed ? 'completed' : 'started');
      } else if (row.activity_id === 'minecraft-maze' || row.activity_id === 'minecraft') {
        lesson.minecraftStatus = betterLearningStatus(lesson.minecraftStatus, completed ? 'completed' : 'started');
      } else if (row.activity_id === 'exit-ticket') {
        lesson.exitTicketStatus = betterLearningStatus(lesson.exitTicketStatus, completed ? 'completed' : 'started');
      }
      lesson.attempts = Math.max(lesson.attempts, Number(row.attempts || 0));
      lesson.updatedAt = !lesson.updatedAt || String(row.updated_at || '') > lesson.updatedAt
        ? row.updated_at || lesson.updatedAt
        : lesson.updatedAt;
    }

    const runRows = db.prepare(`
      SELECT r.*
      FROM kugel_student_runs r
      JOIN classroom_students s ON s.id = r.student_id
      WHERE r.classroom_id = ? AND s.archived_at IS NULL AND s.disabled_at IS NULL
    `).all(classroom.id);
    for (const run of runRows) {
      if (!lessonIds.includes(String(run.lesson_id))) continue;
      const student = byStudent.get(run.student_id);
      if (!student) continue;
      const lesson = student.lessons[String(run.lesson_id)];
      if (run.started_at) lesson.minecraftStatus = betterLearningStatus(lesson.minecraftStatus, 'started');
      if (run.finished_at) lesson.minecraftStatus = betterLearningStatus(lesson.minecraftStatus, 'completed');
      lesson.attempts = Math.max(lesson.attempts, Number(run.attempt_count || 0));
      lesson.bestTimeMs = run.best_time_ms ?? lesson.bestTimeMs;
      lesson.lastDurationMs = run.last_duration_ms ?? lesson.lastDurationMs;
      lesson.updatedAt = !lesson.updatedAt || String(run.updated_at || '') > lesson.updatedAt
        ? run.updated_at || lesson.updatedAt
        : lesson.updatedAt;
    }

    const submissionRows = db.prepare(`
      SELECT s.*, cs.name AS student_name
      FROM craftom_lesson_submissions s
      JOIN classroom_students cs ON cs.id = s.student_id
      WHERE s.classroom_id = ? AND s.course_id = ?
        AND cs.archived_at IS NULL AND cs.disabled_at IS NULL
    `).all(classroom.id, KUGEL_COURSE_ID);
    for (const row of submissionRows) {
      if (!lessonIds.includes(String(row.lesson_id))) continue;
      const student = byStudent.get(row.student_id);
      if (!student) continue;
      const lesson = student.lessons[String(row.lesson_id)];
      lesson.exitTicketStatus = 'completed';
      lesson.submission = craftomSubmissionPublic(row, 'teacher');
      lesson.updatedAt = !lesson.updatedAt || String(row.updated_at || '') > lesson.updatedAt
        ? row.updated_at || lesson.updatedAt
        : lesson.updatedAt;
    }
  }

  const totals = {
    students: students.length,
    lessons: lessons.length,
    startedStudents: 0,
    completedStudents: 0,
    submissions: 0,
    needsAttention: 0,
  };
  for (const student of byStudent.values()) {
    let studentStarted = false;
    let studentCompleted = false;
    for (const lesson of Object.values(student.lessons)) {
      const started = ['started', 'completed'].includes(lesson.academyStatus)
        || ['started', 'completed'].includes(lesson.minecraftStatus)
        || ['started', 'completed'].includes(lesson.exitTicketStatus)
        || Boolean(lesson.submission);
      const completed = lesson.exitTicketStatus === 'completed'
        || (lesson.lessonId === 0 && lesson.minecraftStatus === 'completed');
      if (started) studentStarted = true;
      if (completed) studentCompleted = true;
      if (lesson.submission) {
        student.totals.submissions += 1;
        totals.submissions += 1;
      }
      lesson.overallStatus = completed ? 'completed' : (started ? 'started' : 'missing');
      if (lesson.overallStatus === 'started') student.totals.started += 1;
      if (lesson.overallStatus === 'completed') student.totals.completed += 1;
      if (lesson.overallStatus !== 'completed' && (lesson.academyStatus === 'started' || lesson.minecraftStatus === 'started')) {
        student.totals.needsAttention += 1;
      }
    }
    if (studentStarted) totals.startedStudents += 1;
    if (studentCompleted) totals.completedStudents += 1;
    if (student.totals.needsAttention > 0) totals.needsAttention += 1;
  }

  return {
    classroom: {
      id: classroom.id,
      name: classroom.name,
      joinCode: classroom.join_code,
    },
    courseId: KUGEL_COURSE_ID,
    lessons,
    totals,
    students: [...byStudent.values()].map(student => ({
      ...student,
      lessons: lessonIds.map(lessonId => student.lessons[lessonId]),
    })),
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
  return KUGEL_PREVIEW_MOCK_MINECRAFT || Boolean(
    KUGEL_MONITOR_API_URL
    && kugelMonitorTransportConfigured()
    && KUGEL_MONITOR_SERVER_NAME
    && KUGEL_MINECRAFT_INTERNAL_TOKEN
    && (process.env.NODE_ENV === 'test' || Buffer.byteLength(KUGEL_MINECRAFT_INTERNAL_TOKEN, 'utf8') >= 32)
    && KUGEL_MINECRAFT_SERVER_NAME
    && KUGEL_MINECRAFT_SERVER_HOST
    && KUGEL_MINECRAFT_SERVER_PORT
    && KUGEL_MINECRAFT_SERVER_ID
    && KUGEL_MINECRAFT_ACCESS_CODE,
  );
}

function kugelMonitorTransportConfigured() {
  let target;
  try { target = new URL(KUGEL_MONITOR_API_URL); } catch { return false; }
  if (target.username || target.password || target.search || target.hash || !['', '/'].includes(target.pathname)) return false;
  const normalizeHost = value => String(value || '').trim().toLowerCase().replace(/\.$/, '');
  const pinnedHost = normalizeHost(KUGEL_MONITOR_EXPECTED_HOST);
  const targetHost = normalizeHost(target.hostname);
  if (process.env.NODE_ENV === 'production' && !pinnedHost) return false;
  if (pinnedHost && targetHost !== pinnedHost) return false;
  if (target.protocol === 'https:') return true;
  return process.env.NODE_ENV === 'test' && target.protocol === 'http:'
    && ['127.0.0.1', 'localhost', '::1'].includes(target.hostname);
}

function verifyKugelProductionConfiguration() {
  if (process.env.NODE_ENV !== 'production' || !KUGEL_MONITOR_API_URL) return;
  if (!KUGEL_HTTPS_REVERSE_PROXY) {
    throw new Error('Agent Academy production configuration requires an HTTPS reverse proxy');
  }
  if (!kugelMinecraftConfigured()) {
    throw new Error('Agent Academy production configuration is incomplete or insecure');
  }
}

function kugelMonitorServerName() {
  return KUGEL_PREVIEW_MOCK_MINECRAFT ? 'preview-mock-minecraft' : KUGEL_MONITOR_SERVER_NAME;
}

function kugelMinecraftInfo() {
  if (!kugelMinecraftConfigured()) return null;
  if (KUGEL_PREVIEW_MOCK_MINECRAFT) {
    return {
      serverName: 'Preview Minecraft',
      serverAddress: 'סביבת בדיקה בלבד',
      serverId: 'preview-demo',
      accessCode: 'preview-only',
      launchUrl: '',
    };
  }
  return {
    serverName: KUGEL_MINECRAFT_SERVER_NAME,
    serverAddress: `${KUGEL_MINECRAFT_SERVER_HOST}:${KUGEL_MINECRAFT_SERVER_PORT}`,
    serverId: KUGEL_MINECRAFT_SERVER_ID,
    accessCode: KUGEL_MINECRAFT_ACCESS_CODE,
    launchUrl: `minecraftedu://?addExternalServer=${encodeURIComponent(KUGEL_MINECRAFT_SERVER_NAME)}|${KUGEL_MINECRAFT_SERVER_HOST}:${KUGEL_MINECRAFT_SERVER_PORT}`,
  };
}

function kugelMinecraftSetupNote() {
  if (KUGEL_PREVIEW_MOCK_MINECRAFT) {
    return 'מצב preview: אפשר לבדוק את זרימת הפעלת Minecraft באתר, בלי להפעיל שרת Minecraft אמיתי.';
  }
  return kugelMinecraftConfigured()
    ? ''
    : 'חיבור Minecraft אינו מוגדר בשרת. יש להשלים הגדרות KUGEL_MONITOR ופרטי שרת Minecraft לפני הפעלת שיעור.';
}

async function kugelMonitorRequest(pathname, options = {}, timeoutMs = 15000) {
  if (KUGEL_PREVIEW_MOCK_MINECRAFT) {
    if (pathname === '/api/internal/craftom-school/v2/world/events') return { events: [] };
    return { ok: true, preview: true };
  }
  if (!kugelMinecraftConfigured()) {
    const error = new Error('חיבור Minecraft אינו מוגדר בשרת.');
    error.statusCode = 503;
    throw error;
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const { omitBearerAuthorization = false, maxResponseBytes = 2 * 1024 * 1024, ...fetchOptions } = options;
    const response = await fetch(`${KUGEL_MONITOR_API_URL}${pathname}`, {
      ...fetchOptions,
      redirect: 'error',
      signal: controller.signal,
      headers: {
        ...(!omitBearerAuthorization ? { 'Authorization': `Bearer ${KUGEL_MINECRAFT_INTERNAL_TOKEN}` } : {}),
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers || {}),
      },
    });
    let data;
    try {
      data = await readBoundedJsonResponse(response, maxResponseBytes);
    } catch {
      const error = new Error('Minecraft monitor returned an invalid or oversized response');
      error.statusCode = 502;
      throw error;
    }
    if (!response.ok) {
      const safeMonitorStatuses = new Set([409, 423, 429, 500, 502, 503, 504]);
      const safeMonitorErrorCode = typeof data.error === 'string' && /^[a-z0-9_]{1,80}$/.test(data.error)
        ? data.error
        : 'monitor_request_failed';
      const error = new Error('Minecraft monitor request failed');
      error.monitorStatus = response.status;
      error.monitorCode = safeMonitorErrorCode;
      error.monitorRetryable = typeof data.retryable === 'boolean'
        ? data.retryable
        : [429, 500, 502, 503, 504].includes(response.status);
      error.statusCode = safeMonitorStatuses.has(response.status) ? response.status : 502;
      throw error;
    }
    return data;
  } catch (error) {
    if (error?.statusCode || ['AbortError', 'TimeoutError'].includes(error?.name)) throw error;
    const transportError = new Error('Minecraft monitor transport failed');
    transportError.statusCode = 502;
    transportError.monitorStatus = null;
    transportError.monitorCode = 'monitor_transport_failed';
    transportError.monitorRetryable = true;
    throw transportError;
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
  return serializeKugelMonitorMutation(kugelMonitorServerName(), () => kugelMonitorRequest(pathname, options, timeoutMs));
}

function kugelWorldLifecycleMutation(pathname, payload, timeoutMs = null) {
  const allowedPaths = new Set([
    '/api/internal/craftom-school/v2/world/open',
    '/api/internal/craftom-school/v2/world/close',
    '/api/internal/craftom-school/v2/world/state',
  ]);
  if (!allowedPaths.has(pathname)) throw new Error('Invalid Minecraft world lifecycle path');
  const operationTimeoutMs = timeoutMs || (pathname.endsWith('/open')
    ? KUGEL_WORLD_OPEN_TIMEOUT_MS
    : pathname.endsWith('/close') ? KUGEL_WORLD_CLOSE_TIMEOUT_MS : KUGEL_WORLD_STATE_TIMEOUT_MS);
  return serializeKugelMonitorMutation(String(payload.server || kugelMonitorServerName()), async () => {
    const response = await kugelSignedMonitorRequest(pathname, payload, operationTimeoutMs);
    return pathname.endsWith('/state') ? validateKugelWorldState(response) : response;
  });
}

function validateKugelWorldState(value) {
  const keys = value && typeof value === 'object' && !Array.isArray(value) ? Object.keys(value).sort() : [];
  const expected = ['active', 'generation', 'last_error', 'lease_id', 'server', 'state', 'world'];
  const boundedString = (item, max) => typeof item === 'string' && item.length > 0 && item.length <= max;
  const nullableBounded = (item, max) => item === null || boundedString(item, max);
  const valid = keys.length === expected.length && keys.every((key, index) => key === expected[index])
    && typeof value.active === 'boolean'
    && boundedString(value.server, 128)
    && ['idle', 'starting', 'running', 'stopping', 'error'].includes(value.state)
    && nullableBounded(value.lease_id, 256)
    && Number.isInteger(value.generation) && value.generation >= 0
    && nullableBounded(value.world, 512)
    && nullableBounded(value.last_error, 2000);
  if (!valid) {
    const error = new Error('Minecraft monitor state response is invalid');
    error.statusCode = 502;
    throw error;
  }
  return value;
}

function kugelSignedMonitorRequest(pathname, payload, timeoutMs = KUGEL_LIVE_COMMAND_TIMEOUT_MS) {
  const requestId = crypto.randomUUID();
  const body = JSON.stringify({ ...payload, request_id: requestId });
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const bodyHash = crypto.createHash('sha256').update(body).digest('hex');
  const canonical = `${timestamp}\nPOST\n${pathname}\n${bodyHash}\n${requestId}`;
  const signature = crypto.createHmac('sha256', KUGEL_MINECRAFT_INTERNAL_TOKEN).update(canonical).digest('hex');
  return kugelMonitorRequest(pathname, {
    method: 'POST',
    body,
    omitBearerAuthorization: Boolean(1),
    maxResponseBytes: 32 * 1024,
    headers: {
      'X-Hai-Timestamp': timestamp,
      'X-Hai-Request-Id': requestId,
      'X-Hai-Signature': signature,
    },
  }, timeoutMs);
}

function acquireKugelWorldLease(req, teacherId, classroomId, lesson, monitorServerName, eventsSince, detail) {
  return withSummerDb(db => db.transaction(() => {
    const authorization = requireCurrentTeacherKugelEntitlement(db, req, teacherId, classroomId);
    if (authorization.status) return { authorizationError: authorization };
    const activeOwner = db.prepare(`
      SELECT classroom_id, lesson_id, world_id, events_since, launch_token, generation, server_state
      FROM kugel_class_sessions
      WHERE active = 1 AND monitor_server_name = ? LIMIT 1
    `).get(monitorServerName);
    if (activeOwner) {
      if (activeOwner.classroom_id !== classroomId
        || activeOwner.server_state !== 'running'
        || !activeOwner.launch_token) return null;
      const changed = db.prepare(`
        UPDATE kugel_class_sessions SET
          previous_lesson_id = lesson_id, previous_world_id = world_id,
          previous_events_since = events_since, previous_generation = generation,
          lesson_id = ?, world_id = ?, events_since = ?, generation = generation + 1,
          server_state = 'starting', server_detail = ?, updated_at = ?
        WHERE classroom_id = ? AND monitor_server_name = ? AND launch_token = ?
          AND generation = ? AND active = 1 AND server_state = 'running'
      `).run(lesson.id, lesson.worldId, eventsSince, detail, new Date().toISOString(), classroomId, monitorServerName,
        activeOwner.launch_token, activeOwner.generation);
      return changed.changes === 1
        ? {
          leaseId: activeOwner.launch_token,
          generation: activeOwner.generation + 1,
          monitorServerName,
          previous: {
            lessonId: activeOwner.lesson_id,
            worldId: activeOwner.world_id,
            eventsSince: activeOwner.events_since,
            generation: activeOwner.generation,
          },
        }
        : null;
    }
    const launchToken = crypto.randomUUID();
    const now = new Date().toISOString();
    const existing = db.prepare(`
      SELECT launch_token, server_state FROM kugel_class_sessions WHERE classroom_id = ?
    `).get(classroomId);
    if (existing) {
      if (existing.server_state !== 'idle') return null;
      const changed = db.prepare(`
        UPDATE kugel_class_sessions SET lesson_id = ?, active = 1, monitor_server_name = ?,
          world_id = ?, events_since = ?, launch_token = ?, generation = 1,
          previous_lesson_id = NULL, previous_world_id = NULL,
          previous_events_since = NULL, previous_generation = NULL, server_state = 'starting',
          server_detail = ?, updated_at = ?
        WHERE classroom_id = ? AND launch_token IS ? AND active = 0 AND server_state = 'idle'
      `).run(lesson.id, monitorServerName, lesson.worldId, eventsSince, launchToken, detail, now,
        classroomId, existing.launch_token);
      return changed.changes === 1 ? { leaseId: launchToken, generation: 1, monitorServerName } : null;
    }
    db.prepare(`
      INSERT INTO kugel_class_sessions (
        classroom_id, lesson_id, active, monitor_server_name, world_id, events_since, launch_token, generation,
        server_state, server_detail, created_at, updated_at
      ) VALUES (?, ?, 1, ?, ?, ?, ?, 1, 'starting', ?, ?, ?)
    `).run(classroomId, lesson.id, monitorServerName, lesson.worldId, eventsSince, launchToken, detail, now, now);
    return { leaseId: launchToken, generation: 1, monitorServerName };
  }).immediate());
}

function kugelLeasePayload(lease, classroomId) {
  return {
    server: lease.monitorServerName,
    lease_id: lease.leaseId,
    generation: lease.generation,
    owner_id: classroomId,
  };
}

async function startKugelWorld(req, teacherId, classroomId, lesson, monitorServerName, detail, runningDetail) {
  let lease;
  try {
    lease = acquireKugelWorldLease(req, teacherId, classroomId, lesson, monitorServerName,
      Math.floor(Date.now() / 1000), detail);
  } catch (error) {
    if (String(error.code || '').startsWith('SQLITE_CONSTRAINT')) lease = null;
    else throw error;
  }
  if (lease?.authorizationError) {
    const error = new Error(lease.authorizationError.error);
    error.statusCode = lease.authorizationError.status;
    throw error;
  }
  if (!lease) return false;
  const leasePayload = kugelLeasePayload(lease, classroomId);
  try {
    await kugelWorldLifecycleMutation('/api/internal/craftom-school/v2/world/open', {
      ...leasePayload, world: lesson.worldId, start_mode: 'reset',
    }, KUGEL_WORLD_OPEN_TIMEOUT_MS);
    const remote = await kugelWorldLifecycleMutation('/api/internal/craftom-school/v2/world/state', {
      server: lease.monitorServerName,
    });
    const remoteRunning = remote.active === true && remote.state === 'running'
      && remote.server === lease.monitorServerName && remote.lease_id === lease.leaseId
      && remote.generation === lease.generation && remote.world === lesson.worldId;
    if (!remoteRunning) {
      const error = new Error('Minecraft monitor did not confirm the exact running lease');
      error.statusCode = 502;
      throw error;
    }
    const activation = withSummerDb(db => db.transaction(() => {
      const authorization = requireCurrentTeacherKugelEntitlement(db, req, teacherId, classroomId);
      const exactStartingLease = db.prepare(`
        SELECT classroom_id FROM kugel_class_sessions
        WHERE classroom_id = ? AND monitor_server_name = ? AND launch_token = ? AND generation = ?
          AND world_id = ? AND lesson_id = ? AND active = 1 AND server_state = 'starting'
      `).get(classroomId, lease.monitorServerName, lease.leaseId, lease.generation, lesson.worldId, lesson.id);
      if (authorization.status || !exactStartingLease) {
        const stopped = exactStartingLease ? db.prepare(`
          UPDATE kugel_class_sessions SET server_state = 'stopping', server_detail = ?, updated_at = ?
          WHERE classroom_id = ? AND monitor_server_name = ? AND launch_token = ? AND generation = ?
            AND world_id = ? AND lesson_id = ? AND active = 1 AND server_state = 'starting'
        `).run('ההרשאה השתנתה בזמן פתיחת העולם; סוגר לפני שחרור…', new Date().toISOString(),
          classroomId, lease.monitorServerName, lease.leaseId, lease.generation, lesson.worldId, lesson.id) : { changes: 0 };
        return { activated: false, mustClose: true };
      }
      const activated = db.prepare(`
        UPDATE kugel_class_sessions SET server_state = 'running', server_detail = ?,
          previous_lesson_id = NULL, previous_world_id = NULL,
          previous_events_since = NULL, previous_generation = NULL, updated_at = ?
        WHERE classroom_id = ? AND monitor_server_name = ? AND launch_token = ? AND generation = ?
          AND world_id = ? AND lesson_id = ? AND active = 1 AND server_state = 'starting'
      `).run(runningDetail, new Date().toISOString(), classroomId, lease.monitorServerName,
        lease.leaseId, lease.generation, lesson.worldId, lesson.id);
      return { activated: activated.changes === 1, mustClose: activated.changes !== 1 };
    }).immediate());
    if (!activation.activated) {
      if (activation.mustClose) {
        await kugelWorldLifecycleMutation('/api/internal/craftom-school/v2/world/close', leasePayload);
        const confirmed = await kugelWorldLifecycleMutation('/api/internal/craftom-school/v2/world/state', {
          server: lease.monitorServerName,
        });
        if (confirmed.active) throw new Error('Minecraft stale activation close was not confirmed');
        withSummerDb(db => db.prepare(`
          UPDATE kugel_class_sessions SET active = 0, server_state = 'idle', server_detail = ?,
            previous_lesson_id = NULL, previous_world_id = NULL,
            previous_events_since = NULL, previous_generation = NULL, updated_at = ?
          WHERE classroom_id = ? AND monitor_server_name = ? AND launch_token = ? AND generation = ?
            AND world_id = ? AND lesson_id = ? AND active = 1 AND server_state = 'stopping'
        `).run('פתיחת העולם בוטלה לאחר שינוי הרשאה והסגירה אושרה.', new Date().toISOString(),
          classroomId, lease.monitorServerName, lease.leaseId, lease.generation, lesson.worldId, lesson.id));
      }
      return false;
    }
    return true;
  } catch (error) {
    const ambiguousTimeout = ['AbortError', 'TimeoutError'].includes(error.name);
    let state = null;
    try {
      state = await kugelWorldLifecycleMutation('/api/internal/craftom-school/v2/world/state', {
        server: lease.monitorServerName,
      });
    } catch {}
    const previousStillRunning = Boolean(!ambiguousTimeout && lease.previous && state?.active === true && state.state === 'running'
      && state.server === lease.monitorServerName && state.lease_id === lease.leaseId
      && state.generation === lease.previous.generation && state.world === lease.previous.worldId);
    if (previousStillRunning) {
      withSummerDb(db => db.prepare(`UPDATE kugel_class_sessions SET
        lesson_id = previous_lesson_id, world_id = previous_world_id, events_since = previous_events_since,
        generation = previous_generation, previous_lesson_id = NULL, previous_world_id = NULL,
        previous_events_since = NULL, previous_generation = NULL,
        server_state = 'running', server_detail = ?, updated_at = ?
        WHERE classroom_id = ? AND monitor_server_name = ? AND launch_token = ? AND generation = ?
          AND active = 1 AND server_state = 'starting' AND previous_generation = ?`)
        .run('העולם הקודם נשאר פעיל לאחר שהמעבר נכשל.', new Date().toISOString(), classroomId,
          lease.monitorServerName, lease.leaseId, lease.generation, lease.previous.generation));
      throw error;
    }
    const stopping = withSummerDb(db => db.prepare(`
      UPDATE kugel_class_sessions SET server_state = 'stopping', server_detail = ?, updated_at = ?
      WHERE classroom_id = ? AND monitor_server_name = ? AND launch_token = ? AND generation = ?
        AND active = 1 AND server_state = 'starting'
    `).run('פתיחת העולם לא אושרה; סוגר את השרת לפני שחרור…', new Date().toISOString(),
      classroomId, lease.monitorServerName, lease.leaseId, lease.generation));
    if (!stopping.changes) return false;
    if (ambiguousTimeout) throw error;
    const proposedGenerationPresent = Boolean(state?.active === true
      && state.server === lease.monitorServerName && state.lease_id === lease.leaseId
      && state.generation === lease.generation && state.world === lesson.worldId);
    if (proposedGenerationPresent || !state) {
      await kugelWorldLifecycleMutation('/api/internal/craftom-school/v2/world/close', leasePayload);
      state = await kugelWorldLifecycleMutation('/api/internal/craftom-school/v2/world/state', {
        server: lease.monitorServerName,
      });
    }
    if (state?.active) throw error;
    const released = withSummerDb(db => db.prepare(`
      UPDATE kugel_class_sessions SET active = 0, server_state = 'idle', server_detail = ?,
        previous_lesson_id = NULL, previous_world_id = NULL,
        previous_events_since = NULL, previous_generation = NULL, updated_at = ?
      WHERE classroom_id = ? AND monitor_server_name = ? AND launch_token = ? AND generation = ?
        AND active = 1 AND server_state = 'stopping'
    `).run('פתיחת העולם נכשלה והשרת נסגר ושוחרר.', new Date().toISOString(),
      classroomId, lease.monitorServerName, lease.leaseId, lease.generation));
    if (!released.changes) return false;
    throw error;
  }
}

async function reconcileKugelWorldLeases({ respectGrace = false } = {}) {
  if (KUGEL_PREVIEW_MOCK_MINECRAFT || !kugelMinecraftConfigured()) return;
  const leases = withSummerDb(db => db.prepare(`
    SELECT kms.*, c.teacher_id,
      EXISTS(SELECT 1 FROM teacher_courses tc WHERE tc.teacher_id = c.teacher_id AND tc.course_id = ?) AS teacher_entitled,
      EXISTS(SELECT 1 FROM classroom_courses cc WHERE cc.classroom_id = c.id AND cc.course_id = ?) AS class_entitled,
      t.archived_at AS teacher_archived_at, t.disabled_at AS teacher_disabled_at
    FROM kugel_class_sessions kms
    JOIN classrooms c ON c.id = kms.classroom_id
    JOIN classroom_teachers t ON t.id = c.teacher_id
    WHERE kms.active = 1
  `).all(KUGEL_COURSE_ID, KUGEL_COURSE_ID));
  for (const lease of leases) {
    if (respectGrace && !['stopping', 'error'].includes(lease.server_state)) continue;
    if (respectGrace && Date.now() - Date.parse(lease.updated_at) < KUGEL_RECONCILE_GRACE_MS) continue;
    try {
      const state = await kugelWorldLifecycleMutation('/api/internal/craftom-school/v2/world/state', {
        server: lease.monitor_server_name,
      });
      const previousMatching = Boolean(state.active && state.state === 'running'
        && state.server === lease.monitor_server_name && state.lease_id === lease.launch_token
        && Number(state.generation) === Number(lease.previous_generation)
        && state.world === lease.previous_world_id);
      const entitled = Boolean(lease.teacher_entitled && lease.class_entitled
        && !lease.teacher_archived_at && !lease.teacher_disabled_at);
      if (previousMatching && entitled && ['starting', 'stopping', 'error'].includes(lease.server_state)) {
        withSummerDb(db => db.prepare(`UPDATE kugel_class_sessions SET
          lesson_id = previous_lesson_id, world_id = previous_world_id, events_since = previous_events_since,
          generation = previous_generation, previous_lesson_id = NULL, previous_world_id = NULL,
          previous_events_since = NULL, previous_generation = NULL,
          server_state = 'running', server_detail = ?, updated_at = ?
          WHERE classroom_id = ? AND monitor_server_name = ? AND launch_token = ? AND generation = ?
            AND active = 1 AND server_state = ? AND previous_generation IS NOT NULL`)
          .run('העולם הקודם שוחזר לאחר הפעלה מחדש.', new Date().toISOString(), lease.classroom_id,
            lease.monitor_server_name, lease.launch_token, lease.generation, lease.server_state));
        continue;
      }
      if (previousMatching && !entitled && ['starting', 'stopping', 'error'].includes(lease.server_state)) {
        await kugelWorldLifecycleMutation('/api/internal/craftom-school/v2/world/close', {
          server: lease.monitor_server_name,
          lease_id: lease.launch_token,
          generation: lease.previous_generation,
          owner_id: lease.classroom_id,
        });
        const confirmed = await kugelWorldLifecycleMutation('/api/internal/craftom-school/v2/world/state', {
          server: lease.monitor_server_name,
        });
        if (confirmed.active) throw new Error('Minecraft previous-generation close was not confirmed');
        withSummerDb(db => db.prepare(`
          UPDATE kugel_class_sessions SET active = 0, server_state = 'idle', server_detail = ?,
            previous_lesson_id = NULL, previous_world_id = NULL,
            previous_events_since = NULL, previous_generation = NULL, updated_at = ?
          WHERE classroom_id = ? AND monitor_server_name = ? AND launch_token = ? AND generation = ?
            AND active = 1 AND server_state = ? AND previous_generation = ?
        `).run('ההרשאה בוטלה; העולם הקודם נסגר ואושר לפני שחרור החכירה.', new Date().toISOString(),
          lease.classroom_id, lease.monitor_server_name, lease.launch_token, lease.generation,
          lease.server_state, lease.previous_generation));
        continue;
      }
      const matching = Boolean(state.active
        && state.server === lease.monitor_server_name
        && state.lease_id === lease.launch_token
        && Number(state.generation) === Number(lease.generation)
        && state.world === lease.world_id);
      const resumableLaunch = lease.server_state !== 'stopping' || lease.previous_generation !== null;
      if (matching && state.state === 'running' && entitled && resumableLaunch
        && ['running', 'starting', 'stopping', 'error'].includes(lease.server_state)) {
        withSummerDb(db => db.prepare(`
          UPDATE kugel_class_sessions SET server_state = 'running', server_detail = ?,
            previous_lesson_id = NULL, previous_world_id = NULL,
            previous_events_since = NULL, previous_generation = NULL, updated_at = ?
          WHERE classroom_id = ? AND monitor_server_name = ? AND launch_token = ? AND generation = ?
            AND active = 1 AND server_state = ?
        `).run('העולם הפעיל שוחזר לאחר הפעלה מחדש.', new Date().toISOString(), lease.classroom_id,
          lease.monitor_server_name, lease.launch_token, lease.generation, lease.server_state));
      } else if (matching && (state.state !== 'running' || lease.server_state === 'stopping' || !entitled)) {
        await kugelWorldLifecycleMutation('/api/internal/craftom-school/v2/world/close', {
          server: lease.monitor_server_name,
          lease_id: lease.launch_token,
          generation: lease.generation,
          owner_id: lease.classroom_id,
        });
        const confirmed = await kugelWorldLifecycleMutation('/api/internal/craftom-school/v2/world/state', {
          server: lease.monitor_server_name,
        });
        if (confirmed.active) throw new Error('Minecraft lease close was not confirmed');
        withSummerDb(db => db.prepare(`
          UPDATE kugel_class_sessions SET active = 0, server_state = 'idle', server_detail = ?, updated_at = ?
          WHERE classroom_id = ? AND monitor_server_name = ? AND launch_token = ? AND generation = ?
            AND active = 1 AND server_state = ?
        `).run('החכירה נסגרה ושוחררה לאחר הפעלה מחדש.', new Date().toISOString(), lease.classroom_id,
          lease.monitor_server_name, lease.launch_token, lease.generation, lease.server_state));
      } else if (!state.active && ['starting', 'stopping', 'error'].includes(lease.server_state)) {
        withSummerDb(db => db.prepare(`
          UPDATE kugel_class_sessions SET active = 0, server_state = 'idle', server_detail = ?, updated_at = ?
          WHERE classroom_id = ? AND monitor_server_name = ? AND launch_token = ? AND generation = ?
            AND active = 1 AND server_state = ?
        `).run('השרת כבר סגור; החכירה שוחררה לאחר הפעלה מחדש.', new Date().toISOString(), lease.classroom_id,
          lease.monitor_server_name, lease.launch_token, lease.generation, lease.server_state));
      } else {
        withSummerDb(db => db.prepare(`
          UPDATE kugel_class_sessions SET server_state = 'error', server_detail = ?, updated_at = ?
          WHERE classroom_id = ? AND monitor_server_name = ? AND launch_token = ? AND generation = ?
            AND active = 1 AND server_state = ?
        `).run('לא ניתן לאמת בבטחה את חכירת עולם Minecraft לאחר הפעלה מחדש.', new Date().toISOString(),
          lease.classroom_id, lease.monitor_server_name, lease.launch_token, lease.generation, lease.server_state));
      }
    } catch (error) {
      withSummerDb(db => db.prepare(`
        UPDATE kugel_class_sessions SET server_state = 'error', server_detail = ?, updated_at = ?
        WHERE classroom_id = ? AND monitor_server_name = ? AND launch_token = ? AND generation = ?
          AND active = 1 AND server_state = ?
      `).run('בדיקת חכירת Minecraft נכשלה; השרת נשאר חסום עד לבירור.', new Date().toISOString(),
        lease.classroom_id, lease.monitor_server_name, lease.launch_token, lease.generation, lease.server_state));
      console.error('kugel_startup_reconciliation_error', { classroomId: lease.classroom_id, message: error.message });
    }
  }
}

function kugelAuthorizedMonitorMutation(req, teacherId, classroomId, target, pathname, command,
  timeoutMs = KUGEL_LIVE_COMMAND_TIMEOUT_MS) {
  const serverName = kugelMonitorServerName();
  return serializeKugelMonitorMutation(serverName, async () => {
    const authorization = withSummerDb(db => {
      const current = target
        ? requireCurrentPlayerTarget(db, req, teacherId, classroomId, target)
        : requireCurrentTeacherKugelClass(db, req, teacherId, classroomId);
      if (current.status) return current;
      const lease = db.prepare(`SELECT monitor_server_name, launch_token, generation
        FROM kugel_class_sessions WHERE classroom_id = ? AND active = 1 AND server_state = 'running'`).get(classroomId);
      return lease ? { lease } : { status: 409, error: 'חכירת Minecraft הפעילה השתנתה בזמן ההמתנה.' };
    });
    if (authorization.status) {
      const error = new Error(authorization.error);
      error.statusCode = authorization.status;
      throw error;
    }
    return kugelSignedMonitorRequest(pathname, {
      server: authorization.lease.monitor_server_name,
      owner_id: classroomId,
      lease_id: authorization.lease.launch_token,
      generation: authorization.lease.generation,
      ...command,
    }, timeoutMs);
  });
}

function kugelLessonById(lessonId) {
  return KUGEL_MINECRAFT_LESSONS[String(lessonId)] || null;
}

function kugelLessonPublic(lesson) {
  return lesson ? {
    id: lesson.id,
    title: lesson.title,
    summary: lesson.summary,
    mode: lesson.mode,
    hasWorld: Boolean(lesson.worldId),
  } : null;
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
  const cacheKey = `${session.monitor_server_name}:${session.classroom_id}:${session.launch_token || ''}:${session.generation}:${session.world_id}`;
  const now = Date.now();
  const cached = kugelEventCache.get(cacheKey);
  if (useCache && cached && cached.expiresAt > now) return cached.promise;
  const expected = {
    server: session.monitor_server_name,
    owner_id: session.classroom_id,
    lease_id: session.launch_token,
    generation: Number(session.generation),
    world: session.world_id,
  };
  const promise = kugelSignedMonitorRequest('/api/internal/craftom-school/v2/world/events', expected, 7000)
    .then(data => {
      const rows = Array.isArray(data.events) ? data.events : [];
      return rows.filter(row => row && typeof row === 'object'
        && row.server === expected.server
        && row.owner_id === expected.owner_id
        && row.lease_id === expected.lease_id
        && Number.isInteger(row.generation) && row.generation === expected.generation
        && row.world === expected.world);
    });
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
    lessonId: Number(run?.lesson_id ?? session?.lesson_id ?? 0),
    connected,
    coins,
    completed,
    startedAt: run?.started_at || null,
    resetAt: run?.reset_at || null,
    finishedAt: completed ? (run?.finished_at || (finishEvent ? new Date(kugelEventTime(finishEvent)).toISOString() : null)) : null,
    attemptCount: Number.isInteger(Number(run?.attempt_count)) ? Number(run.attempt_count) : 0,
    bestTimeMs: run?.best_time_ms !== null && run?.best_time_ms !== undefined
      && Number.isInteger(Number(run.best_time_ms)) && Number(run.best_time_ms) >= 0 ? Number(run.best_time_ms) : null,
    bestFinishedAt: run?.best_finished_at || null,
    lastDurationMs: run?.last_duration_ms !== null && run?.last_duration_ms !== undefined
      && Number.isInteger(Number(run.last_duration_ms)) && Number(run.last_duration_ms) >= 0 ? Number(run.last_duration_ms) : null,
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
    const identity = db.prepare(`SELECT player_name FROM classroom_minecraft_identities
      WHERE student_id = ? AND status = 'verified'`).get(student.id);
    const identityAllowed = Boolean(identity?.player_name && student.minecraft_player_name
      && identity.player_name.toLowerCase() === student.minecraft_player_name.toLowerCase());
    return { classroom, allowed, identityAllowed };
  });
  if (!context.allowed) return { status: 403, error: 'שיעור Minecraft אינו פתוח לכיתה הזו.' };
  return {
    student,
    classroom: { id: context.classroom.id, name: context.classroom.name },
    minecraftIdentityVerified: context.identityAllowed,
  };
}

function requireCurrentKugelView(db, req, context, role, expectedSession) {
  if (role === 'teacher') {
    const authorization = requireCurrentTeacherKugelEntitlement(
      db, req, context.teacher.id, context.classroom.id,
    );
    if (authorization.status) return authorization;
  } else {
    const authorization = requireCurrentActiveStudent(
      db, req, context.student.id, context.classroom.id,
    );
    if (authorization.status) return authorization;
    const entitledIdentity = db.prepare(`SELECT s.id FROM classroom_students s
      JOIN classrooms c ON c.id = s.classroom_id
      JOIN classroom_teachers t ON t.id = c.teacher_id
      JOIN teacher_courses tc ON tc.teacher_id = t.id AND tc.course_id = ?
      JOIN classroom_courses cc ON cc.classroom_id = c.id AND cc.course_id = ?
      JOIN classroom_minecraft_identities i ON i.student_id = s.id AND i.status = 'verified'
        AND lower(i.player_name) = lower(s.minecraft_player_name)
      WHERE s.id = ? AND s.classroom_id = ?
        AND s.archived_at IS NULL AND s.disabled_at IS NULL
        AND t.archived_at IS NULL AND t.disabled_at IS NULL`).get(
      KUGEL_COURSE_ID, KUGEL_COURSE_ID, context.student.id, context.classroom.id,
    );
    if (!entitledIdentity) {
      return { status: 409, error: 'חיבור התלמיד/ה, ההרשאה או שיוך Minecraft השתנו בזמן ההמתנה.' };
    }
  }
  const currentSession = db.prepare('SELECT * FROM kugel_class_sessions WHERE classroom_id = ?')
    .get(context.classroom.id);
  const sameLease = (!expectedSession && !currentSession) || Boolean(expectedSession && currentSession
    && Number(currentSession.active) === Number(expectedSession.active)
    && currentSession.server_state === expectedSession.server_state
    && currentSession.monitor_server_name === expectedSession.monitor_server_name
    && (currentSession.launch_token || null) === (expectedSession.launch_token || null)
    && Number(currentSession.generation) === Number(expectedSession.generation)
    && currentSession.world_id === expectedSession.world_id
    && Number(currentSession.lesson_id) === Number(expectedSession.lesson_id)
    && Number(currentSession.events_since) === Number(expectedSession.events_since));
  return sameLease
    ? { session: currentSession }
    : { status: 409, error: 'חכירת Minecraft השתנתה בזמן טעינת נתוני השיעור.' };
}

function kugelSessionPublic(row) {
  const lesson = kugelLessonById(row?.lesson_id) || KUGEL_LESSON_ZERO;
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
    serverDetail: `המורה עדיין לא הפעילה את ${lesson.id === 0 ? 'שיעור 0' : `שיעור ${lesson.id}`}.`,
    updatedAt: null,
  };
}

async function kugelClassView(req, context, role, useEventCache = true, requestedLessonId = null) {
  const data = withSummerDb(db => {
    const session = db.prepare('SELECT * FROM kugel_class_sessions WHERE classroom_id = ?').get(context.classroom.id);
    const activeLessonId = Number(session?.lesson_id ?? 0);
    const trackedLessonId = Number.isInteger(requestedLessonId) ? requestedLessonId : activeLessonId;
    const students = db.prepare(`
      SELECT id, classroom_id, name, minecraft_player_name
      FROM classroom_students
      WHERE classroom_id = ? AND archived_at IS NULL AND disabled_at IS NULL
      ORDER BY created_at
    `).all(context.classroom.id);
    const runs = new Map(db.prepare('SELECT * FROM kugel_student_runs WHERE classroom_id = ?').all(context.classroom.id)
      .map(run => [run.student_id, run]));
    const completedStudentIds = new Set(db.prepare(`
      SELECT student_id FROM classroom_progress
      WHERE course_id = ? AND lesson_id = '0' AND activity_id = 'minecraft-maze' AND status = 'completed'
      AND student_id IN (
        SELECT id FROM classroom_students
        WHERE classroom_id = ? AND archived_at IS NULL AND disabled_at IS NULL
      )
    `).all(KUGEL_COURSE_ID, context.classroom.id).map(row => row.student_id));
    const progressRows = db.prepare(`
      SELECT * FROM classroom_progress
      WHERE course_id = ? AND lesson_id = ?
        AND student_id IN (
        SELECT id FROM classroom_students
        WHERE classroom_id = ? AND archived_at IS NULL AND disabled_at IS NULL
      )
    `).all(KUGEL_COURSE_ID, String(trackedLessonId), context.classroom.id);
    const progressByStudent = new Map();
    for (const row of progressRows) {
      if (!progressByStudent.has(row.student_id)) progressByStudent.set(row.student_id, new Map());
      progressByStudent.get(row.student_id).set(row.activity_id, row);
    }
    const submissionRows = db.prepare(`
      SELECT s.*, cs.name AS student_name
      FROM craftom_lesson_submissions s
      JOIN classroom_students cs ON cs.id = s.student_id
      WHERE s.classroom_id = ? AND s.course_id = ? AND s.lesson_id = ?
        AND cs.archived_at IS NULL AND cs.disabled_at IS NULL
    `).all(context.classroom.id, KUGEL_COURSE_ID, trackedLessonId);
    const submissions = new Map(submissionRows.map(row => [row.student_id, row]));
    return { session, students, runs, completedStudentIds, progressByStudent, submissions, trackedLessonId };
  });
  const ownsRunningWorld = Boolean(
    data.session?.active
    && data.session.server_state === 'running'
    && data.trackedLessonId === Number(data.session.lesson_id),
  );
  const events = ownsRunningWorld ? await kugelGameEvents(data.session, useEventCache) : [];
  const current = withSummerDb(db => db.transaction(() => (
    requireCurrentKugelView(db, req, context, role, data.session)
  )).immediate());
  if (current.status) {
    const error = new Error(current.error);
    error.statusCode = current.status;
    throw error;
  }
  const summaries = data.students.map(student => ({
    ...summarizeKugelStudent(student, data.runs.get(student.id), data.session, events),
    completionRecorded: data.completedStudentIds.has(student.id),
  })).map(summary => {
    const progress = data.progressByStudent.get(summary.id) || new Map();
    const academy = progress.get('academy-complete');
    const exitTicket = progress.get('exit-ticket');
    const minecraftActivity = progress.get('minecraft-maze');
    const run = data.runs.get(summary.id);
    const trackedLessonId = data.trackedLessonId;
    const runMatchesTrackedLesson = Boolean(run && Number(run.lesson_id) === trackedLessonId);
    const minecraftCompleted = trackedLessonId === 0
      ? Boolean(minecraftActivity?.status === 'completed' || summary.completionRecorded)
      : Boolean(runMatchesTrackedLesson && run.finished_at);
    return {
      ...summary,
      academyStatus: academy?.status || 'missing',
      academyCompletedAt: academy?.completed_at || null,
      minecraftStatus: minecraftCompleted ? 'completed' : (runMatchesTrackedLesson && summary.startedAt ? 'started' : 'missing'),
      exitTicketStatus: exitTicket?.status || 'missing',
      submission: craftomSubmissionPublic(data.submissions.get(summary.id), 'teacher'),
    };
  });
  const session = { ...kugelSessionPublic(data.session), classroomId: context.classroom.id };
  const activeLesson = kugelLessonById(session.lessonId) || KUGEL_LESSON_ZERO;
  if (role === 'student') {
    const own = summaries.find(student => student.id === context.student.id);
    const qaLessonMapping = isPreviewDemoStudent(context.student);
    return {
      ok: true,
      role,
      lesson: activeLesson,
      lessons: qaLessonMapping ? Object.values(KUGEL_MINECRAFT_LESSONS).map(kugelLessonPublic) : [],
      qaLessonMapping,
      classroom: context.classroom,
      session,
      student: own,
      lessonAccess: withSummerDb(db => buildCraftomLessonAccess(db, context.classroom.id)),
      minecraft: ownsRunningWorld ? kugelMinecraftInfo() : null,
    };
  }
  const lessonAccess = withSummerDb(db => buildCraftomLessonAccess(db, context.classroom.id));
  return {
    ok: true,
    role,
    lesson: kugelLessonPublic(activeLesson),
    lessons: Object.values(KUGEL_MINECRAFT_LESSONS).map(kugelLessonPublic),
    lessonAccess,
    teacher: { id: context.teacher.id, name: context.teacher.name },
    classroom: { id: context.classroom.id, name: context.classroom.name },
    trackedLessonId: data.trackedLessonId,
    session,
    students: summaries,
    metrics: {
      connected: summaries.filter(student => student.connected).length,
      active: summaries.filter(student => student.minecraftStatus === 'started').length,
      completed: summaries.filter(student => student.minecraftStatus === 'completed').length,
      needsHelp: summaries.filter(student => student.minecraftStatus === 'started' && data.trackedLessonId === 0 && student.coins <= 1).length,
    },
    minecraftConfigured: kugelMinecraftConfigured(),
    minecraftPreviewMode: KUGEL_PREVIEW_MOCK_MINECRAFT,
    minecraftSetupNote: kugelMinecraftSetupNote(),
    minecraft: ownsRunningWorld ? kugelMinecraftInfo() : null,
  };
}

function upsertKugelRun(db, studentId, classroomId, patch) {
  const existing = db.prepare('SELECT * FROM kugel_student_runs WHERE student_id = ?').get(studentId);
  const now = new Date().toISOString();
  const lessonId = Number.isInteger(Number(patch.lessonId)) ? Number(patch.lessonId) : Number(existing?.lesson_id || 0);
  const startedAt = patch.startedAt === undefined ? existing?.started_at || null : patch.startedAt;
  const resetAt = patch.resetAt === undefined ? existing?.reset_at || null : patch.resetAt;
  const finishedAt = patch.finishedAt === undefined ? existing?.finished_at || null : patch.finishedAt;
  const previousAttempts = Number.isInteger(Number(existing?.attempt_count)) ? Number(existing.attempt_count) : 0;
  const previousBest = existing?.best_time_ms !== null && existing?.best_time_ms !== undefined
    && Number.isInteger(Number(existing.best_time_ms)) && Number(existing.best_time_ms) >= 0
    ? Number(existing.best_time_ms)
    : null;
  let completedDurationMs = null;
  if (patch.incrementAttempt) {
    const startMs = Date.parse(startedAt || resetAt || '');
    const finishMs = Date.parse(finishedAt || '');
    if (Number.isFinite(startMs) && Number.isFinite(finishMs) && finishMs >= startMs) {
      completedDurationMs = finishMs - startMs;
    }
  }
  const improvedBest = completedDurationMs !== null && (previousBest === null || completedDurationMs < previousBest);
  const next = {
    started_at: startedAt,
    reset_at: resetAt,
    finished_at: finishedAt,
    attempt_count: previousAttempts + (patch.incrementAttempt ? 1 : 0),
    best_time_ms: improvedBest ? completedDurationMs : previousBest,
    best_finished_at: improvedBest ? finishedAt : existing?.best_finished_at || null,
    last_duration_ms: completedDurationMs === null ? existing?.last_duration_ms ?? null : completedDurationMs,
  };
  db.prepare(`
    INSERT INTO kugel_student_runs (
      student_id, classroom_id, lesson_id, started_at, reset_at, finished_at,
      attempt_count, best_time_ms, best_finished_at, last_duration_ms, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(student_id) DO UPDATE SET
      classroom_id = excluded.classroom_id,
      lesson_id = excluded.lesson_id,
      started_at = excluded.started_at,
      reset_at = excluded.reset_at,
      finished_at = excluded.finished_at,
      attempt_count = excluded.attempt_count,
      best_time_ms = excluded.best_time_ms,
      best_finished_at = excluded.best_finished_at,
      last_duration_ms = excluded.last_duration_ms,
      updated_at = excluded.updated_at
  `).run(
    studentId, classroomId, lessonId, next.started_at, next.reset_at, next.finished_at,
    next.attempt_count, next.best_time_ms, next.best_finished_at, next.last_duration_ms, now,
  );
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

function cleanKugelCompoundId(value) {
  const id = Number(String(value || '').trim());
  return Number.isInteger(id) && id >= 1 && id <= 500 ? id : null;
}

function isKugelInternalRequest(req) {
  if (!KUGEL_MINECRAFT_INTERNAL_TOKEN) return false;
  const raw = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
  if (!raw) return false;
  const provided = Buffer.from(raw);
  const expected = Buffer.from(KUGEL_MINECRAFT_INTERNAL_TOKEN);
  return provided.length === expected.length && crypto.timingSafeEqual(provided, expected);
}

function upsertKugelCompoundAssignment(db, assignment) {
  const now = new Date().toISOString();
  const serverName = cleanText(assignment.monitor_server_name || assignment.server_name || kugelMonitorServerName(), 80);
  const playerName = cleanMinecraftPlayerName(assignment.minecraft_username || assignment.player_name || assignment.player);
  const compoundId = cleanKugelCompoundId(assignment.compound_id || assignment.compoundId || assignment.compound);
  if (!serverName || !playerName || !compoundId) return null;
  const lastSeenAt = (() => {
    const numeric = Number(assignment.last_seen_at);
    if (Number.isFinite(numeric) && numeric > 0) return new Date(numeric > 1e12 ? numeric : numeric * 1000).toISOString();
    const parsed = Date.parse(String(assignment.last_seen_at || ''));
    return Number.isFinite(parsed) ? new Date(parsed).toISOString() : now;
  })();
  db.prepare(`
    DELETE FROM kugel_minecraft_compound_assignments
    WHERE monitor_server_name = ? AND lower(minecraft_username) = lower(?) AND compound_id != ?
  `).run(serverName, playerName, compoundId);
  db.prepare(`
    INSERT INTO kugel_minecraft_compound_assignments (
      id, monitor_server_name, minecraft_username, compound_id, x, y, z,
      last_seen_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(monitor_server_name, compound_id) DO UPDATE SET
      minecraft_username = excluded.minecraft_username,
      x = excluded.x,
      y = excluded.y,
      z = excluded.z,
      last_seen_at = excluded.last_seen_at,
      updated_at = excluded.updated_at
  `).run(
    crypto.randomUUID(),
    serverName,
    playerName,
    compoundId,
    Number.isFinite(Number(assignment.x)) ? Number(assignment.x) : null,
    Number.isFinite(Number(assignment.y)) ? Number(assignment.y) : null,
    Number.isFinite(Number(assignment.z)) ? Number(assignment.z) : null,
    lastSeenAt,
    now,
    now,
  );
  return db.prepare(`
    SELECT * FROM kugel_minecraft_compound_assignments
    WHERE monitor_server_name = ? AND compound_id = ?
  `).get(serverName, compoundId);
}

function resolveKugelCompoundStudent(db, compoundId) {
  return db.prepare(`
    SELECT
      a.monitor_server_name, a.minecraft_username, a.compound_id, a.last_seen_at,
      s.id AS student_id, s.name AS student_name, s.classroom_id,
      k.world_id, k.server_state
    FROM kugel_minecraft_compound_assignments a
    JOIN kugel_class_sessions k
      ON k.monitor_server_name = a.monitor_server_name
     AND k.active = 1
     AND k.server_state = 'running'
    JOIN classroom_students s
      ON s.classroom_id = k.classroom_id
     AND lower(s.minecraft_player_name) = lower(a.minecraft_username)
     AND s.archived_at IS NULL
     AND s.disabled_at IS NULL
    JOIN classroom_minecraft_identities i
      ON i.student_id = s.id AND i.status = 'verified'
     AND lower(i.player_name) = lower(s.minecraft_player_name)
    WHERE a.monitor_server_name = ? AND a.compound_id = ?
    ORDER BY a.last_seen_at DESC
    LIMIT 1
  `).get(kugelMonitorServerName(), compoundId);
}

async function handleKugelInternalMinecraftApi(req, res) {
  const url = requestUrl(req);
  if (req.method !== 'POST' || url.pathname !== '/api/internal/minecraft/compound-assignments') {
    return send(res, 404, JSON.stringify({ error: 'Not found' }));
  }
  if (!isKugelInternalRequest(req)) return send(res, 401, JSON.stringify({ error: 'Unauthorized' }));
  try {
    const body = JSON.parse(await readBody(req, 64 * 1024) || '{}');
    const row = withSummerDb(db => upsertKugelCompoundAssignment(db, body));
    if (!row) return send(res, 400, JSON.stringify({ error: 'compound assignment payload is invalid' }));
    return send(res, 200, JSON.stringify({ ok: true, assignment: {
      monitorServerName: row.monitor_server_name,
      minecraftUsername: row.minecraft_username,
      compoundId: row.compound_id,
      lastSeenAt: row.last_seen_at,
    } }));
  } catch (error) {
    if (error instanceof SyntaxError) return send(res, 400, JSON.stringify({ error: 'גוף הבקשה אינו JSON תקין.' }));
    console.error('kugel_internal_minecraft_error', { path: url.pathname, message: error.message });
    return send(res, 500, JSON.stringify({ error: 'Minecraft sync failed' }));
  }
}

async function handleKugelApi(req, res) {
  const url = requestUrl(req);
  const pathname = url.pathname;
  try {
    if (req.method === 'GET' && pathname === '/api/kugel/session') {
      const teacher = getClassroomTeacherFromRequest(req);
      if (teacher) {
        const classroomId = cleanText(url.searchParams.get('classroomId'), 80);
        const lessonParam = url.searchParams.get('lessonId');
        const requestedLessonId = lessonParam === null || lessonParam === '' ? null : Number(lessonParam);
        if (!classroomId) return send(res, 400, JSON.stringify({ error: 'חסר מזהה כיתה.' }));
        if (requestedLessonId !== null && (!Number.isInteger(requestedLessonId) || requestedLessonId < 0 || requestedLessonId > 16)) {
          return send(res, 400, JSON.stringify({ error: 'מספר השיעור אינו תקין.' }));
        }
        const context = getTeacherKugelClass(req, classroomId);
        if (context.status) return send(res, context.status, JSON.stringify({ error: context.error }));
        if (!consumeKugelActionLimit(`teacher:${context.teacher.id}:${classroomId}:read`, 120)) {
          return send(res, 429, JSON.stringify({ error: 'יותר מדי רענונים. נסו שוב בעוד דקה.' }));
        }
        return send(res, 200, JSON.stringify(await kugelClassView(req, context, 'teacher', true, requestedLessonId)));
      }
      const context = getStudentKugelClass(req);
      if (context.status) return send(res, context.status, JSON.stringify({ error: context.error }));
      if (!context.minecraftIdentityVerified) {
        return send(res, 409, JSON.stringify({ error: 'נדרש חשבון Microsoft קיים ומאומת עם רישיון Minecraft Education.' }));
      }
      if (!consumeKugelActionLimit(`student:${context.student.id}:read`, 120)) {
        return send(res, 429, JSON.stringify({ error: 'יותר מדי רענונים. נסו שוב בעוד דקה.' }));
      }
      return send(res, 200, JSON.stringify(await kugelClassView(req, context, 'student')));
    }

    if (req.method !== 'POST') return send(res, 405, JSON.stringify({ error: 'Method not allowed' }));
    const body = JSON.parse(await readBody(req, 64 * 1024) || '{}');

    if (pathname === '/api/kugel/compound-entry') {
      const caller = getClassroomStudentFromRequest(req);
      if (!caller) return send(res, 401, JSON.stringify({ error: 'נדרשת כניסת תלמיד/ה.' }));
      if (!consumeKugelActionLimit(`compound-entry:${caller.id}`, 30)) {
        return send(res, 429, JSON.stringify({ error: 'יותר מדי רענונים. נסו שוב בעוד דקה.' }));
      }
      const compoundId = cleanKugelCompoundId(body.compoundId || url.searchParams.get('c') || url.searchParams.get('compound'));
      if (!compoundId) return send(res, 400, JSON.stringify({ error: 'מספר החלקה אינו תקין.' }));
      const match = withSummerDb(db => resolveKugelCompoundStudent(db, compoundId));
      if (!match || match.student_id !== caller.id) {
        return send(res, 404, JSON.stringify({ error: 'לא נמצאה חלקה פעילה שמשויכת לתלמיד/ה המחובר/ת.' }));
      }
      const context = getStudentKugelClass(req);
      if (context.status) return send(res, context.status, JSON.stringify({ error: context.error }));
      const view = await kugelClassView(req, context, 'student', false);
      return send(res, 200, JSON.stringify({
        ...view,
        compound: {
          id: match.compound_id,
          minecraftUsername: match.minecraft_username,
          lastSeenAt: match.last_seen_at,
        },
      }));
    }

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
          const row = db.prepare(`SELECT s.id, s.name, s.minecraft_player_name,
              i.player_name AS verified_player_name
            FROM classroom_students s
            LEFT JOIN classroom_minecraft_identities i
              ON i.student_id = s.id AND i.status = 'verified'
            WHERE s.id = ? AND s.classroom_id = ?
              AND s.archived_at IS NULL AND s.disabled_at IS NULL`)
            .get(decodeURIComponent(linkMatch[2]), context.classroom.id);
          if (!row) return null;
          if (!row.verified_player_name
            || row.verified_player_name.toLowerCase() !== String(playerName || '').toLowerCase()) {
            return { unverified: true };
          }
          return { id: row.id, name: row.name, minecraftPlayerName: row.minecraft_player_name };
        });
        if (!student) return send(res, 404, JSON.stringify({ error: 'התלמיד/ה לא נמצא/ה.' }));
        if (student.unverified) return send(res, 409, JSON.stringify({ error: 'יש לאמת ולקשר חשבון Microsoft מורשה לפני שיוך שחקן Minecraft.' }));
        return send(res, 200, JSON.stringify({ ok: true, student }));
      } catch (error) {
        if (String(error.code || '').startsWith('SQLITE_CONSTRAINT')) {
          return send(res, 409, JSON.stringify({ error: 'שם השחקן כבר משויך לתלמיד/ה אחר/ת בכיתה.' }));
        }
        throw error;
      }
    }

    const teacherOpenLesson = pathname.match(/^\/api\/kugel\/classes\/([^/]+)\/lessons\/([0-9]+)\/open$/);
    if (teacherOpenLesson) {
      const classroomId = decodeURIComponent(teacherOpenLesson[1]);
      const lessonId = Number(teacherOpenLesson[2]);
      if (!Number.isInteger(lessonId) || lessonId < 1 || lessonId > 16) {
        return send(res, 400, JSON.stringify({ error: 'מספר השיעור אינו תקין.' }));
      }
      const context = getTeacherKugelClass(req, classroomId);
      if (context.status) return send(res, context.status, JSON.stringify({ error: context.error }));
      if (!consumeKugelActionLimit(`teacher:${context.teacher.id}:${classroomId}:open-lesson`, 30)) {
        return send(res, 429, JSON.stringify({ error: 'יותר מדי פעולות. נסו שוב בעוד דקה.' }));
      }
      const access = withSummerDb(db => db.transaction(() => {
        const authorization = requireCurrentTeacherKugelEntitlement(db, req, context.teacher.id, classroomId);
        if (authorization.status) return { authorizationError: authorization };
        const opened = craftomOpenedLessonIds(db, classroomId);
        const nextLessonId = nextCraftomLessonToOpen(opened);
        if (lessonId !== nextLessonId) {
          return {
            orderError: nextLessonId
              ? `אפשר לפתוח עכשיו רק את שיעור ${nextLessonId}.`
              : 'כל השיעורים כבר פתוחים לכיתה.',
          };
        }
        const now = new Date().toISOString();
        db.prepare(`
          INSERT INTO classroom_lesson_access (
            classroom_id, course_id, lesson_id, status, opened_by_teacher_id,
            opened_at, closed_at, created_at, updated_at
          ) VALUES (?, ?, ?, 'open', ?, ?, NULL, ?, ?)
          ON CONFLICT(classroom_id, course_id, lesson_id) DO UPDATE SET
            status = 'open',
            opened_by_teacher_id = excluded.opened_by_teacher_id,
            opened_at = COALESCE(classroom_lesson_access.opened_at, excluded.opened_at),
            closed_at = NULL,
            updated_at = excluded.updated_at
        `).run(classroomId, KUGEL_COURSE_ID, lessonId, context.teacher.id, now, now, now);
        return buildCraftomLessonAccess(db, classroomId);
      }).immediate());
      if (access.authorizationError) return send(res, access.authorizationError.status, JSON.stringify({ error: access.authorizationError.error }));
      if (access.orderError) return send(res, 409, JSON.stringify({ error: access.orderError }));
      return send(res, 200, JSON.stringify({ ok: true, lessonAccess: access }));
    }

    const teacherLessonLaunch = pathname.match(/^\/api\/kugel\/classes\/([^/]+)\/lessons\/([0-9]+)\/launch$/);
    if (teacherLessonLaunch) {
      const classroomId = decodeURIComponent(teacherLessonLaunch[1]);
      const lesson = kugelLessonById(teacherLessonLaunch[2]);
      if (!lesson) return send(res, 404, JSON.stringify({ error: 'שיעור Minecraft לא מוגדר.' }));
      if (!lesson.worldId) return send(res, 409, JSON.stringify({ error: 'עדיין לא מוגדר עולם Minecraft לשיעור הזה.' }));
      const context = getTeacherKugelClass(req, classroomId);
      if (context.status) return send(res, context.status, JSON.stringify({ error: context.error }));
      if (!consumeKugelActionLimit(`teacher:${context.teacher.id}:${classroomId}:launch:${lesson.id}`, 10)) {
        return send(res, 429, JSON.stringify({ error: 'יותר מדי פעולות. נסו שוב בעוד דקה.' }));
      }
      if (!kugelMinecraftConfigured()) return send(res, 503, JSON.stringify({ error: 'חיבור Minecraft אינו מוגדר בשרת.' }));
      const monitorServerName = KUGEL_PREVIEW_MOCK_MINECRAFT
        ? `preview-mock-minecraft-${classroomId}`
        : kugelMonitorServerName();
      const started = await startKugelWorld(req, context.teacher.id, classroomId, lesson, monitorServerName,
        `מפעיל את עולם שיעור ${lesson.id}…`, `עולם שיעור ${lesson.id} פעיל.`);
      if (!started) return send(res, 409, JSON.stringify({ error: 'שרת Minecraft נמצא כעת בשימוש או בתהליך מעבר.' }));
      const view = await kugelClassView(req, context, 'teacher', false);
      return send(res, 200, JSON.stringify(view));
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
        const monitorServerName = KUGEL_PREVIEW_MOCK_MINECRAFT
          ? `preview-mock-minecraft-${classroomId}`
          : kugelMonitorServerName();
        const started = await startKugelWorld(req, context.teacher.id, classroomId, KUGEL_LESSON_ZERO, monitorServerName,
          'מפעיל את עולם המבוך…', 'עולם המבוך פעיל.');
        if (!started) return send(res, 409, JSON.stringify({ error: 'שרת Minecraft נמצא כעת בשימוש או בתהליך מעבר.' }));
        const view = await kugelClassView(req, context, 'teacher', false);
        return send(res, 200, JSON.stringify(view));
      }
      if (action === 'stop') {
        const stoppingLease = withSummerDb(db => db.transaction(() => {
          const authorization = requireCurrentTeacherKugelEntitlement(db, req, context.teacher.id, classroomId);
          if (authorization.status) return { authorizationError: authorization };
          const session = db.prepare(`
            SELECT launch_token, generation, monitor_server_name, server_state
            FROM kugel_class_sessions WHERE classroom_id = ? AND active = 1
          `).get(classroomId);
          if (!session) return null;
          const changed = db.prepare(`
            UPDATE kugel_class_sessions SET server_state = 'stopping', server_detail = ?, updated_at = ?
            WHERE classroom_id = ? AND monitor_server_name = ? AND launch_token = ? AND generation = ?
              AND active = 1 AND server_state = ?
          `).run('עוצר וסוגר את עולם המבוך…', new Date().toISOString(), classroomId,
            session.monitor_server_name, session.launch_token, session.generation, session.server_state);
          return changed.changes === 1 ? session : null;
        }).immediate());
        if (stoppingLease?.authorizationError) {
          return send(res, stoppingLease.authorizationError.status,
            JSON.stringify({ error: stoppingLease.authorizationError.error }));
        }
        if (!stoppingLease) return send(res, 409, JSON.stringify({ error: 'אין שיעור פעיל לשחרור.' }));
        await kugelWorldLifecycleMutation('/api/internal/craftom-school/v2/world/close', {
          server: stoppingLease.monitor_server_name,
          lease_id: stoppingLease.launch_token,
          generation: stoppingLease.generation,
          owner_id: classroomId,
        });
        const released = withSummerDb(db => db.prepare(`
          UPDATE kugel_class_sessions SET active = 0, server_state = 'idle', server_detail = ?, updated_at = ?
          WHERE classroom_id = ? AND monitor_server_name = ? AND launch_token = ? AND generation = ?
            AND active = 1 AND server_state = 'stopping'
        `).run('השיעור הסתיים והשרת שוחרר לכיתה אחרת.', new Date().toISOString(), classroomId,
          stoppingLease.monitor_server_name, stoppingLease.launch_token, stoppingLease.generation));
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
            SELECT id FROM classroom_students WHERE classroom_id = ?
              AND archived_at IS NULL AND disabled_at IS NULL
              AND lower(minecraft_player_name) = lower(?)
          `).get(classroomId, target));
          if (!linked) return send(res, 404, JSON.stringify({ error: 'השחקן אינו משויך לכיתה הזאת.' }));
        }
        const result = await kugelAuthorizedMonitorMutation(
          req, context.teacher.id, classroomId, target,
          '/api/internal/craftom-school/v2/live/message', { text, scope, target },
        );
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
          SELECT id FROM classroom_students WHERE classroom_id = ?
            AND archived_at IS NULL AND disabled_at IS NULL
            AND lower(minecraft_player_name) = lower(?)
        `).get(classroomId, target));
        if (!linked) return send(res, 404, JSON.stringify({ error: 'השחקן אינו משויך לכיתה הזאת.' }));
      }
      const result = await kugelAuthorizedMonitorMutation(
        req, context.teacher.id, classroomId, target,
        '/api/internal/craftom-school/v2/live/freeze',
        { scope, target, on: body.on, mode: 'full', restore: 'adventure' },
      );
      return send(res, 200, JSON.stringify({ ok: true, result }));
    }

    const studentContext = getStudentKugelClass(req);
    if (studentContext.status) return send(res, studentContext.status, JSON.stringify({ error: studentContext.error }));
    if (!['/api/kugel/student/start', '/api/kugel/student/reset', '/api/kugel/student/finish'].includes(pathname)) {
      return send(res, 404, JSON.stringify({ error: 'Not found' }));
    }
    if (!studentContext.minecraftIdentityVerified) {
      return send(res, 409, JSON.stringify({ error: 'נדרש חשבון Microsoft קיים ומאומת עם רישיון Minecraft Education.' }));
    }
    if (!consumeKugelActionLimit(`student:${studentContext.student.id}:lesson-zero`, 30)) {
      return send(res, 429, JSON.stringify({ error: 'יותר מדי פעולות. נסו שוב בעוד דקה.' }));
    }
    const state = withSummerDb(db => ({
      session: db.prepare('SELECT * FROM kugel_class_sessions WHERE classroom_id = ?').get(studentContext.classroom.id),
      student: db.prepare(`SELECT * FROM classroom_students
        WHERE id = ? AND classroom_id = ? AND archived_at IS NULL AND disabled_at IS NULL`)
        .get(studentContext.student.id, studentContext.classroom.id),
      run: db.prepare('SELECT * FROM kugel_student_runs WHERE student_id = ?').get(studentContext.student.id),
    }));
    const activeLesson = kugelLessonById(state.session?.lesson_id) || KUGEL_LESSON_ZERO;
    const activeLessonLabel = activeLesson.id === 0 ? 'שיעור 0' : `שיעור ${activeLesson.id}`;
    if (!state.session?.active || state.session.server_state !== 'running') return send(res, 409, JSON.stringify({ error: `המורה עדיין לא הפעילה את ${activeLessonLabel}.` }));
    if (!state.student.minecraft_player_name) return send(res, 409, JSON.stringify({ error: 'המורה עדיין לא שייכה את שם השחקן שלך ב-Minecraft.' }));
    if (pathname === '/api/kugel/student/start') {
      const run = withSummerDb(db => db.transaction(() => {
        const currentRun = db.prepare('SELECT * FROM kugel_student_runs WHERE student_id = ?').get(state.student.id);
        const continuingActiveLesson = Number(currentRun?.lesson_id) === activeLesson.id;
        return upsertKugelRun(db, state.student.id, studentContext.classroom.id, {
          lessonId: activeLesson.id,
          startedAt: continuingActiveLesson ? currentRun?.started_at || new Date().toISOString() : new Date().toISOString(),
          resetAt: continuingActiveLesson ? undefined : null,
          finishedAt: continuingActiveLesson ? currentRun?.finished_at || null : null,
        });
      }).immediate());
      return send(res, 200, JSON.stringify({
        ok: true,
        lesson: kugelLessonPublic(activeLesson),
        student: summarizeKugelStudent(state.student, run, state.session, []),
        minecraft: kugelMinecraftInfo(),
      }));
    }
    if (pathname === '/api/kugel/student/reset') {
      const run = withSummerDb(db => db.transaction(() => {
        const currentRun = db.prepare('SELECT * FROM kugel_student_runs WHERE student_id = ?').get(state.student.id);
        const previousFinishMs = Date.parse(currentRun?.finished_at || '');
        const resetMs = Math.max(Date.now(), Number.isFinite(previousFinishMs) ? previousFinishMs + 1 : 0);
        return upsertKugelRun(db, state.student.id, studentContext.classroom.id, {
          lessonId: activeLesson.id,
          startedAt: null,
          resetAt: new Date(resetMs).toISOString(),
          finishedAt: null,
        });
      }).immediate());
      return send(res, 200, JSON.stringify({ ok: true, student: summarizeKugelStudent(state.student, run, state.session, []) }));
    }
    const events = await kugelGameEvents(state.session);
    const summary = summarizeKugelStudent(state.student, state.run, state.session, events);
    if (!summary.completed) return send(res, 409, JSON.stringify({ error: 'כדי לסיים צריך לאסוף שמונה מטבעות וללחוץ על כפתור הסיום.' }));
    const result = withSummerDb(db => db.transaction(() => {
      const authorization = requireCurrentActiveStudent(db, req, state.student.id, studentContext.classroom.id);
      if (authorization.status) {
        const error = new Error(authorization.error);
        error.statusCode = authorization.status;
        throw error;
      }
      const samePlayerBinding = String(authorization.student.minecraft_player_name || '').toLowerCase()
        === String(state.student.minecraft_player_name || '').toLowerCase();
      const stillEntitled = teacherHasCourse(db, authorization.student.teacher_id, KUGEL_COURSE_ID)
        && classroomHasCourse(db, studentContext.classroom.id, KUGEL_COURSE_ID);
      if (!samePlayerBinding || !stillEntitled) {
        const error = new Error('שיוך השחקן או הרשאת השיעור השתנו בזמן בדיקת הסיום. נסו שוב.');
        error.statusCode = 409;
        throw error;
      }
      const currentSession = db.prepare('SELECT * FROM kugel_class_sessions WHERE classroom_id = ?').get(studentContext.classroom.id);
      const sameSessionGeneration = currentSession
        && Number(currentSession.lesson_id) === Number(state.session.lesson_id)
        && Number(currentSession.active) === 1
        && currentSession.server_state === 'running'
        && (currentSession.launch_token || null) === (state.session.launch_token || null)
        && Number(currentSession.generation) === Number(state.session.generation)
        && currentSession.world_id === state.session.world_id
        && Number(currentSession.events_since) === Number(state.session.events_since);
      if (!sameSessionGeneration) {
        const error = new Error('השיעור הוחלף או הופסק בזמן בדיקת הסיום. נסו שוב.');
        error.statusCode = 409;
        throw error;
      }
      const currentRun = db.prepare('SELECT * FROM kugel_student_runs WHERE student_id = ?').get(state.student.id);
      const sameAttemptBoundary = (currentRun?.reset_at || null) === (state.run?.reset_at || null)
        && Number(currentRun?.lesson_id ?? activeLesson.id) === Number(state.run?.lesson_id ?? activeLesson.id);
      if (!sameAttemptBoundary) {
        const error = new Error('הניסיון אופס או הוחלף בזמן בדיקת הסיום. נסו שוב.');
        error.statusCode = 409;
        throw error;
      }
      const run = upsertKugelRun(db, state.student.id, studentContext.classroom.id, {
        finishedAt: summary.finishedAt || new Date().toISOString(),
        incrementAttempt: activeLesson.id === 0
          && (!currentRun || Number(currentRun.lesson_id) === 0)
          && !Boolean(currentRun?.finished_at),
      });
      const savedSummary = summarizeKugelStudent(state.student, run, state.session, events);
      const progress = completeKugelClassroomProgress(db, state.student.id, savedSummary);
      return { progress, student: savedSummary };
    }).immediate());
    return send(res, 200, JSON.stringify({ ok: true, progress: classroomProgressPublic(result.progress), student: result.student }));
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

  // v3 permanently retires the shared administrator and invitation secrets.
  // Keep explicit tombstones so stale clients cannot fall through to another handler.
  if (req.method === 'POST' && ['admin-login', 'teacher-register'].includes(action)) {
    return send(res, 410, JSON.stringify({ error: 'מסלול הכניסה המשותף הוצא משימוש לצמיתות.' }));
  }

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
      student: { id: student.id, name: student.name, qaLessonMapping: isPreviewDemoStudent(student) },
      classroom: {
        id: student.classroom_id,
        name: student.classroom_name,
        courses: withSummerDb(db => classroomCourses(db, student.classroom_id)),
      },
    }));
    return send(res, 200, JSON.stringify({ ok: true, role: 'guest', subscriptionGateEnabled: subscriptionGateEnabledForRequest(req) }));
  }

  if (req.method === 'GET' && action === 'admin-me') {
    return send(res, 200, JSON.stringify({ ok: true, role: getClassroomAdminFromRequest(req) ? 'admin' : 'guest' }));
  }

  if (req.method === 'GET' && action === 'preview-demo-teacher-enabled') {
    return send(res, 200, JSON.stringify({ ok: true, enabled: CLASSROOM_PREVIEW_DEMO_TEACHER }));
  }

  if (req.method === 'GET' && action === 'preview-demo-student-enabled') {
    return send(res, 200, JSON.stringify({ ok: true, enabled: CLASSROOM_PREVIEW_DEMO_TEACHER }));
  }

  if (req.method === 'GET' && action === 'admin' && segments[3] === 'teachers' && segments.length === 4) {
    const includeArchived = url.searchParams.get('includeArchived') === '1';
    const teachers = withSummerDb(db => db.transaction(() => {
      const admin = requireCurrentClassroomAdmin(db, req);
      if (!admin) return null;
      return db.prepare(`
        SELECT id, name, email, archived_at, disabled_at, created_at FROM classroom_teachers
        WHERE (archived_at IS NULL AND disabled_at IS NULL) OR ? = 1
        ORDER BY created_at
      `).all(includeArchived ? 1 : 0).map(teacher => ({
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        archivedAt: teacher.archived_at || teacher.disabled_at,
        courses: teacherCourses(db, teacher.id),
        createdAt: teacher.created_at,
        classes: db.prepare('SELECT id, name FROM classrooms WHERE teacher_id = ? ORDER BY created_at').all(teacher.id)
          .map(classroom => ({
            id: classroom.id,
            name: classroom.name,
            courses: classroomCourses(db, classroom.id),
            students: db.prepare(`
              SELECT id, name, archived_at, disabled_at FROM classroom_students
              WHERE classroom_id = ? AND ((archived_at IS NULL AND disabled_at IS NULL) OR ? = 1) ORDER BY created_at
            `).all(classroom.id, includeArchived ? 1 : 0).map(student => ({
              id: student.id, name: student.name, archivedAt: student.archived_at || student.disabled_at,
              minecraftIdentity: classroomStudentMinecraftIdentity(db, student.id),
            })),
          })),
      }));
    }).immediate());
    if (!teachers) return send(res, 401, JSON.stringify({ error: 'נדרשת כניסת מנהלת.' }));
    return send(res, 200, JSON.stringify({ ok: true, teachers }));
  }

  if (req.method === 'GET' && action === 'classes' && segments.length === 3) {
    const result = withSummerDb(db => db.transaction(() => {
      const teacher = requireCurrentClassroomTeacher(db, req);
      if (!teacher) return null;
      const classes = db.prepare(`
        SELECT * FROM classrooms
        WHERE teacher_id = ?
        ORDER BY CASE WHEN id = ? THEN 0 ELSE 1 END, created_at
      `).all(teacher.id, KUGEL_PREVIEW_CLASSROOM_ID).map(classroom => ({
        id: classroom.id,
        name: classroom.name,
        joinCode: classroom.join_code,
        courses: classroomCourses(db, classroom.id),
        createdAt: classroom.created_at,
        students: db.prepare(`
          SELECT id, name, minecraft_player_name, created_at FROM classroom_students
          WHERE classroom_id = ? AND archived_at IS NULL AND disabled_at IS NULL ORDER BY created_at
        `).all(classroom.id).map(student => ({
          id: student.id,
          name: student.name,
          minecraftPlayerName: student.minecraft_player_name || '',
          createdAt: student.created_at,
          progress: db.prepare('SELECT * FROM classroom_progress WHERE student_id = ? ORDER BY updated_at DESC')
            .all(student.id).map(classroomProgressPublic),
          minecraftIdentity: classroomStudentMinecraftIdentity(db, student.id),
        })),
      }));
      return { teacher, courses: teacherCourses(db, teacher.id), classes };
    }).immediate());
    if (!result) return send(res, 401, JSON.stringify({ error: 'נדרשת כניסת מורה.' }));
    return send(res, 200, JSON.stringify({
      ok: true,
      teacher: { id: result.teacher.id, name: result.teacher.name, email: result.teacher.email, courses: result.courses },
      classes: result.classes,
    }));
  }

  if (req.method === 'GET' && action === 'classes' && segments[3] && segments[4] === 'progress-dashboard' && segments.length === 5) {
    const result = withSummerDb(db => db.transaction(() => {
      const teacher = requireCurrentClassroomTeacher(db, req);
      if (!teacher) return { denied: true };
      const classroom = db.prepare('SELECT * FROM classrooms WHERE id = ? AND teacher_id = ?').get(segments[3], teacher.id);
      if (!classroom) return { notFound: true };
      if (!teacherHasCourse(db, teacher.id, KUGEL_COURSE_ID) || !classroomHasCourse(db, classroom.id, KUGEL_COURSE_ID)) {
        return { forbidden: true };
      }
      return { dashboard: buildCraftomProgressDashboard(db, classroom) };
    }).immediate());
    if (result.denied) return send(res, 401, JSON.stringify({ error: 'נדרשת כניסת מורה.' }));
    if (result.notFound) return send(res, 404, JSON.stringify({ error: 'הכיתה לא נמצאה.' }));
    if (result.forbidden) return send(res, 403, JSON.stringify({ error: 'אקדמיית ה-Agent אינה פתוחה לכיתה הזו.' }));
    return send(res, 200, JSON.stringify({ ok: true, dashboard: result.dashboard }));
  }

  if (req.method === 'GET' && action === 'classes' && segments[3] && segments[4] === 'students' && segments[5] === 'archived' && segments.length === 6) {
    const result = withSummerDb(db => db.transaction(() => {
      const teacher = requireCurrentClassroomTeacher(db, req);
      if (!teacher) return { denied: true };
      const classroom = db.prepare('SELECT id FROM classrooms WHERE id = ? AND teacher_id = ?').get(segments[3], teacher.id);
      if (!classroom) return { notFound: true };
      const students = db.prepare(`
        SELECT s.id, s.name, s.archived_at, s.disabled_at,
          i.upn, i.player_name, i.status, i.graph_object_id, i.source, i.verified_at
        FROM classroom_students s
        LEFT JOIN classroom_minecraft_identities i ON i.student_id = s.id
        WHERE s.classroom_id = ? AND (s.archived_at IS NOT NULL OR s.disabled_at IS NOT NULL)
        ORDER BY COALESCE(s.archived_at, s.disabled_at) DESC
      `).all(classroom.id).map(student => ({
        id: student.id,
        name: student.name,
        archivedAt: student.archived_at || student.disabled_at,
        minecraftIdentity: minecraftIdentityPublic(student),
      }));
      return { students };
    }).immediate());
    if (result.denied) return send(res, 401, JSON.stringify({ error: 'נדרשת כניסת מורה.' }));
    if (result.notFound) return send(res, 404, JSON.stringify({ error: 'הכיתה לא נמצאה.' }));
    return send(res, 200, JSON.stringify({ ok: true, students: result.students }));
  }

  if (req.method === 'GET' && action === 'admin' && segments[3] === 'invitations' && segments.length === 4) {
    const result = withSummerDb(db => db.transaction(() => {
      const admin = requireCurrentClassroomAdmin(db, req);
      if (!admin) return null;
      const invitations = db.prepare(`SELECT id, email, name, status, delivery_status, delivery_generation, expires_at,
        created_at, updated_at, redeemed_at, revoked_at
        FROM classroom_teacher_invitations ORDER BY created_at DESC`).all().map(row => ({
        id: row.id, email: row.email, name: row.name, status: row.status,
        deliveryStatus: row.delivery_status, deliveryGeneration: row.delivery_generation,
        expiresAt: row.expires_at, createdAt: row.created_at,
        updatedAt: row.updated_at, redeemedAt: row.redeemed_at, revokedAt: row.revoked_at,
      }));
      const now = new Date().toISOString();
      db.prepare(`INSERT INTO classroom_credential_audit
        (id, actor_type, actor_id, action, target_type, target_id, outcome, occurred_at)
        VALUES (?, 'admin', ?, 'invitation_list', 'invitation', 'collection', 'success', ?)`)
        .run(crypto.randomUUID(), admin.admin_id, now);
      return invitations;
    }).immediate());
    if (!result) return send(res, 401, JSON.stringify({ error: 'נדרשת כניסת מנהלת.' }));
    return send(res, 200, JSON.stringify({ ok: true, invitations: result }));
  }

  if (req.method !== 'POST') return send(res, 405, JSON.stringify({ error: 'Method not allowed' }));

  try {
    const body = JSON.parse(await readBody(req, 64 * 1024) || '{}');
    if (action === 'admin-access' && segments[3] === 'request' && segments.length === 4) {
      const email = cleanEmail(body.email);
      const sourceLimitKey = classroomSourceKey(req, 'admin-access-request');
      const identityLimitKey = classroomIdentityKey('admin-access-request', email);
      if (consumeClassroomLoginAttempts([sourceLimitKey, identityLimitKey])) {
        withSummerDb(db => db.transaction(() => {
          const identity = db.prepare('SELECT id FROM classroom_admin_identity WHERE email = ?').get(email);
          db.prepare(`INSERT INTO classroom_credential_audit
            (id, actor_type, actor_id, action, target_type, target_id, outcome, occurred_at)
            VALUES (?, 'system', 'access-request', 'issuance', 'challenge', ?, 'throttled', ?)`)
            .run(crypto.randomUUID(), identity?.id || 'unknown', new Date().toISOString());
        }).immediate());
        return send(res, 429, JSON.stringify({ error: 'יותר מדי ניסיונות. נסו שוב מאוחר יותר.' }));
      }
      const code = crypto.randomBytes(24).toString('base64url');
      const codeHash = createOneTimeCredentialHash(code);
      // Always perform the same hash operation and return the same public response.
      const issued = withSummerDb(db => db.transaction(() => {
        const identity = db.prepare('SELECT id, credential_version FROM classroom_admin_identity WHERE email = ?').get(email);
        if (!identity) {
          db.prepare(`INSERT INTO classroom_credential_audit
            (id, actor_type, actor_id, action, target_type, target_id, outcome, occurred_at)
            VALUES (?, 'system', 'access-request', 'issuance', 'challenge', 'unknown', 'denied', ?)`)
            .run(crypto.randomUUID(), new Date().toISOString());
          return false;
        }
        const now = new Date();
        db.prepare(`UPDATE classroom_admin_challenges SET revoked_at = ?
          WHERE admin_id = ? AND purpose = 'access' AND used_at IS NULL AND revoked_at IS NULL`)
          .run(now.toISOString(), identity.id);
        const challengeId = crypto.randomUUID();
        db.prepare(`INSERT INTO classroom_admin_challenges
          (id, admin_id, purpose, code_hash, credential_version, attempts, max_attempts, expires_at, created_at)
          VALUES (?, ?, 'access', ?, ?, 0, 5, ?, ?)`)
          .run(challengeId, identity.id, codeHash, identity.credential_version,
            new Date(now.getTime() + 15 * 60 * 1000).toISOString(), now.toISOString());
        db.prepare(`INSERT INTO classroom_credential_audit
          (id, actor_type, actor_id, action, target_type, target_id, outcome, occurred_at)
          VALUES (?, 'system', 'access-request', 'issuance', 'challenge', ?, 'success', ?)`)
          .run(crypto.randomUUID(), challengeId, now.toISOString());
        return { challengeId, credentialVersion: identity.credential_version };
      }).immediate());
      if (issued) {
        if (process.env.NODE_ENV === 'test') {
          await reconcileAdminAccessDelivery(issued.challengeId, issued.credentialVersion, email, code);
        } else {
          setImmediate(() => {
            reconcileAdminAccessDelivery(issued.challengeId, issued.credentialVersion, email, code)
              .catch(error => console.error('classroom_admin_access_delivery_error', error));
          });
        }
      }
      const response = { ok: true };
      if (process.env.NODE_ENV === 'test' && issued) response.testCode = code;
      if (process.env.NODE_ENV === 'test') response.testWorkFactor = 1;
      return send(res, 202, JSON.stringify(response));
    }
    if (action === 'admin-access' && segments[3] === 'redeem' && segments.length === 4) {
      const email = cleanEmail(body.email);
      const sourceLimitKey = classroomSourceKey(req, 'admin-access-redeem');
      const identityLimitKey = classroomIdentityKey('admin-access-redeem', email);
      if (consumeClassroomLoginAttempts([sourceLimitKey, identityLimitKey])) {
        withSummerDb(db => db.transaction(() => {
          const identity = db.prepare('SELECT id FROM classroom_admin_identity WHERE email = ?').get(email);
          const challenge = identity && db.prepare(`SELECT id FROM classroom_admin_challenges
            WHERE admin_id = ? ORDER BY created_at DESC LIMIT 1`).get(identity.id);
          db.prepare(`INSERT INTO classroom_credential_audit
            (id, actor_type, actor_id, action, target_type, target_id, outcome, occurred_at)
            VALUES (?, 'admin', ?, 'redeem', 'challenge', ?, 'throttled', ?)`)
            .run(crypto.randomUUID(), identity?.id || email || 'unknown', challenge?.id || 'unknown', new Date().toISOString());
        }).immediate());
        return send(res, 429, JSON.stringify({ error: 'יותר מדי ניסיונות. נסו שוב מאוחר יותר.' }));
      }
      const providedCode = String(body.code || '');
      const now = new Date().toISOString();
      const result = withSummerDb(db => db.transaction(() => {
        const identity = db.prepare('SELECT id, credential_version FROM classroom_admin_identity WHERE email = ?').get(email);
        const challenge = identity ? db.prepare(`SELECT * FROM classroom_admin_challenges
          WHERE admin_id = ? AND purpose IN ('access','rotation')
          ORDER BY created_at DESC LIMIT 1`).get(identity.id) : null;
        const matches = oneTimeCredentialMatches(providedCode, challenge?.code_hash || '');
        const valid = identity && challenge && !challenge.used_at && !challenge.revoked_at
          && challenge.expires_at > now && challenge.attempts < challenge.max_attempts
          && challenge.credential_version === identity.credential_version && matches;
        if (!valid) {
          const replayed = Boolean(challenge && matches && challenge.used_at);
          let exhausted = Boolean(challenge && challenge.attempts >= challenge.max_attempts);
          if (challenge && !challenge.used_at && !challenge.revoked_at && challenge.expires_at > now
            && challenge.attempts < challenge.max_attempts && !matches) {
            const attempts = challenge.attempts + 1;
            db.prepare(`UPDATE classroom_admin_challenges SET attempts = ?,
              revoked_at = CASE WHEN ? >= max_attempts THEN ? ELSE revoked_at END WHERE id = ?`)
              .run(attempts, attempts, now, challenge.id);
            exhausted = attempts >= challenge.max_attempts;
          }
          if (replayed) {
            db.prepare(`INSERT INTO classroom_credential_audit
              (id, actor_type, actor_id, action, target_type, target_id, outcome, occurred_at)
              VALUES (?, 'admin', ?, 'redeem', 'challenge', ?, 'replayed', ?)`)
              .run(crypto.randomUUID(), identity.id, challenge.id, now);
          } else {
            const outcome = challenge && challenge.expires_at <= now ? 'expired' : exhausted ? 'exhausted' : 'invalid';
            db.prepare(`INSERT INTO classroom_credential_audit
              (id, actor_type, actor_id, action, target_type, target_id, outcome, occurred_at)
              VALUES (?, 'admin', ?, 'redeem', 'challenge', ?, ?, ?)`)
              .run(crypto.randomUUID(), identity?.id || email || 'unknown', challenge?.id || 'unknown', outcome, now);
          }
          return null;
        }
        const consumed = db.prepare(`UPDATE classroom_admin_challenges SET used_at = ?
          WHERE id = ? AND used_at IS NULL AND revoked_at IS NULL`).run(now, challenge.id);
        if (consumed.changes !== 1) return null;
        const token = createClassroomAdminSession(db, identity.id, identity.credential_version);
        db.prepare(`INSERT INTO classroom_credential_audit
          (id, actor_type, actor_id, action, target_type, target_id, outcome, occurred_at)
          VALUES (?, 'admin', ?, 'redeem', 'challenge', ?, 'success', ?)`)
          .run(crypto.randomUUID(), identity.id, challenge.id, now);
        return { token };
      }).immediate());
      if (!result) return send(res, 401, JSON.stringify({ error: 'פרטי הגישה אינם תקינים או שפג תוקפם.' }));
      return sendWithHeaders(res, 200, JSON.stringify({ ok: true, role: 'admin' }), 'application/json; charset=utf-8', {
        'Set-Cookie': classroomAdminSessionCookie(result.token),
      });
    }
    if (action === 'teacher-invitations' && segments[3] === 'redeem' && segments.length === 4) {
      const email = cleanEmail(body.email);
      const sourceLimitKey = classroomSourceKey(req, 'teacher-invitation-redeem');
      const identityLimitKey = classroomIdentityKey('teacher-invitation-redeem', email);
      if (consumeClassroomLoginAttempts([sourceLimitKey, identityLimitKey])) {
        withSummerDb(db => db.transaction(() => {
          const invitation = db.prepare(`SELECT id FROM classroom_teacher_invitations
            WHERE email = ? ORDER BY created_at DESC LIMIT 1`).get(email);
          if (invitation) {
            db.prepare(`INSERT INTO classroom_credential_audit
              (id, actor_type, actor_id, action, target_type, target_id, outcome, occurred_at)
              VALUES (?, 'teacher', 'anonymous', 'invitation_redeem', 'invitation', ?, 'throttled', ?)`)
              .run(crypto.randomUUID(), invitation.id, new Date().toISOString());
          }
        }).immediate());
        return send(res, 429, JSON.stringify({ error: 'יותר מדי ניסיונות. נסו שוב מאוחר יותר.' }));
      }
      const providedHash = tokenHash(String(body.code || ''));
      const temporaryPassword = generateTemporaryTeacherPassword();
      const result = withSummerDb(db => db.transaction(() => {
        const now = new Date().toISOString();
        const invitation = db.prepare(`SELECT * FROM classroom_teacher_invitations
          WHERE email = ? ORDER BY created_at DESC LIMIT 1`).get(email);
        const expectedHash = invitation?.code_hash || tokenHash('credential-dummy-invitation');
        const matches = crypto.timingSafeEqual(Buffer.from(providedHash, 'hex'), Buffer.from(expectedHash, 'hex'));
        let outcome = 'invalid';
        if (invitation?.status === 'redeemed' && matches) outcome = 'replayed';
        else if (invitation?.status === 'expired' || (invitation && invitation.expires_at <= now)) outcome = 'expired';
        else if (invitation?.status === 'exhausted' || (invitation && invitation.attempts >= invitation.max_attempts)) outcome = 'exhausted';
        else if (invitation?.status === 'revoked') outcome = 'denied';
        const redeemable = invitation && matches && ['sent', 'unknown'].includes(invitation.status)
          && invitation.expires_at > now && invitation.attempts < invitation.max_attempts;
        if (!redeemable) {
          if (invitation && !matches && ['sent', 'unknown'].includes(invitation.status)) {
            const attempts = invitation.attempts + 1;
            db.prepare(`UPDATE classroom_teacher_invitations SET attempts = ?,
              status = CASE WHEN ? >= max_attempts THEN 'exhausted' ELSE status END, updated_at = ? WHERE id = ?`)
              .run(attempts, attempts, now, invitation.id);
            if (attempts >= invitation.max_attempts) outcome = 'exhausted';
          }
          db.prepare(`INSERT INTO classroom_credential_audit
            (id, actor_type, actor_id, action, target_type, target_id, outcome, occurred_at)
            VALUES (?, 'teacher', ?, 'invitation_redeem', 'invitation', ?, ?, ?)`)
            .run(crypto.randomUUID(), email || 'unknown', invitation?.id || 'unknown', outcome, now);
          return null;
        }
        if (db.prepare('SELECT id FROM classroom_teachers WHERE email = ?').get(email)) return null;
        const teacherId = crypto.randomUUID();
        const salt = crypto.randomBytes(16).toString('hex');
        db.prepare(`INSERT INTO classroom_teachers
          (id, name, email, password_salt, password_hash, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)`)
          .run(teacherId, invitation.name, email, salt, hashClassroomSecret(temporaryPassword, salt), now, now);
        const consumed = db.prepare(`UPDATE classroom_teacher_invitations
          SET status = 'redeemed', teacher_id = ?, redeemed_at = ?, updated_at = ?
          WHERE id = ? AND status IN ('sent','unknown') AND redeemed_at IS NULL`)
          .run(teacherId, now, now, invitation.id);
        if (consumed.changes !== 1) throw new Error('invitation_concurrent_redemption');
        db.prepare(`INSERT INTO classroom_credential_audit
          (id, actor_type, actor_id, action, target_type, target_id, outcome, occurred_at)
          VALUES (?, 'teacher', ?, 'invitation_redeem', 'invitation', ?, 'success', ?)`)
          .run(crypto.randomUUID(), teacherId, invitation.id, now);
        return { teacherId };
      }).immediate());
      if (!result) {
        return send(res, 401, JSON.stringify({ error: 'פרטי ההזמנה אינם תקינים או שפג תוקפם.' }));
      }
      clearClassroomLoginFailures(sourceLimitKey);
      clearClassroomLoginFailures(identityLimitKey);
      return send(res, 201, JSON.stringify({ ok: true, oneTime: true, temporaryPassword,
        teacher: { id: result.teacherId, email } }));
    }
    if (action === 'admin-login') {
      if (!CLASSROOM_ADMIN_CODE) return send(res, 503, JSON.stringify({ error: 'ניהול הרשאות המורים אינו זמין כרגע.' }));
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
      const result = withSummerDb(db => db.transaction(() => {
        const admin = requireCurrentClassroomAdmin(db, req);
        if (!admin) return { denied: true };
        const now = new Date().toISOString();
        const revoked = db.prepare(`UPDATE classroom_admin_sessions SET revoked_at = ?
          WHERE id = ? AND admin_id = ? AND credential_version = ? AND revoked_at IS NULL`)
          .run(now, admin.id, admin.admin_id, admin.credential_version);
        if (revoked.changes !== 1) return { denied: true };
        db.prepare(`INSERT INTO classroom_credential_audit
          (id, actor_type, actor_id, action, target_type, target_id, outcome, occurred_at)
          VALUES (?, 'admin', ?, 'logout', 'session', ?, 'success', ?)`)
          .run(crypto.randomUUID(), admin.admin_id, admin.id, now);
        return { ok: true };
      }).immediate());
      return sendWithHeaders(res, result.ok ? 200 : 401,
        JSON.stringify(result.ok ? { ok: true } : { error: 'נדרשת כניסת מנהלת עדכנית.' }),
        'application/json; charset=utf-8', { 'Set-Cookie': clearClassroomAdminSessionCookie() });
    }

    if (action === 'admin' && segments[3] === 'invitations' && segments[4]
      && segments[5] === 'revoke' && segments.length === 6) {
      const invitationId = segments[4];
      const result = withSummerDb(db => db.transaction(() => {
        const admin = requireCurrentClassroomAdmin(db, req);
        if (!admin) return { denied: true };
        const now = new Date().toISOString();
        const updated = db.prepare(`UPDATE classroom_teacher_invitations
          SET status = 'revoked', revoked_at = ?, updated_at = ?
          WHERE id = ? AND status IN ('pending','sent','failed','unknown')
            AND redeemed_at IS NULL AND revoked_at IS NULL`).run(now, now, invitationId);
        if (updated.changes !== 1) {
          db.prepare(`INSERT INTO classroom_credential_audit
            (id, actor_type, actor_id, action, target_type, target_id, outcome, occurred_at)
            VALUES (?, 'admin', ?, 'invitation_revoke', 'invitation', ?, 'invalid', ?)`)
            .run(crypto.randomUUID(), admin.admin_id, invitationId, now);
          return { notFound: true };
        }
        db.prepare(`INSERT INTO classroom_credential_audit
          (id, actor_type, actor_id, action, target_type, target_id, outcome, occurred_at)
          VALUES (?, 'admin', ?, 'invitation_revoke', 'invitation', ?, 'success', ?)`)
          .run(crypto.randomUUID(), admin.admin_id, invitationId, now);
        return { ok: true };
      }).immediate());
      if (result.denied) return send(res, 401, JSON.stringify({ error: 'נדרשת כניסת מנהלת עדכנית.' }));
      if (result.notFound) return send(res, 404, JSON.stringify({ error: 'ההזמנה אינה זמינה לביטול.' }));
      return send(res, 200, JSON.stringify({ ok: true, invitation: { id: invitationId, status: 'revoked' } }));
    }

    if (action === 'admin' && segments[3] === 'invitations' && segments[4]
      && segments[5] === 'resend' && segments.length === 6) {
      const invitationId = segments[4];
      const code = crypto.randomBytes(24).toString('base64url');
      const invitation = withSummerDb(db => db.transaction(() => {
        const admin = requireCurrentClassroomAdmin(db, req);
        if (!admin) return { denied: true };
        const row = db.prepare(`SELECT id, email, name, status, expires_at, delivery_generation FROM classroom_teacher_invitations
          WHERE id = ? AND status IN ('pending','sent','failed','unknown') AND redeemed_at IS NULL AND revoked_at IS NULL`).get(invitationId);
        if (!row) {
          db.prepare(`INSERT INTO classroom_credential_audit
            (id, actor_type, actor_id, action, target_type, target_id, outcome, occurred_at)
            VALUES (?, 'admin', ?, 'invitation_resend', 'invitation', ?, 'invalid', ?)`)
            .run(crypto.randomUUID(), admin.admin_id, invitationId, new Date().toISOString());
          return { notFound: true };
        }
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
        const deliveryGeneration = row.delivery_generation + 1;
        db.prepare(`UPDATE classroom_teacher_invitations SET code_hash = ?, attempts = 0,
          status = 'pending', delivery_status = 'pending', delivery_generation = ?, expires_at = ?, updated_at = ? WHERE id = ?`)
          .run(tokenHash(code), deliveryGeneration, expiresAt, now.toISOString(), invitationId);
        db.prepare(`INSERT INTO classroom_credential_audit
          (id, actor_type, actor_id, action, target_type, target_id, outcome, occurred_at)
          VALUES (?, 'admin', ?, 'invitation_resend', 'invitation', ?, 'success', ?)`)
          .run(crypto.randomUUID(), admin.admin_id, invitationId, now.toISOString());
        return { ...row, expires_at: expiresAt, delivery_generation: deliveryGeneration };
      }).immediate());
      if (invitation.denied) return send(res, 401, JSON.stringify({ error: 'נדרשת כניסת מנהלת עדכנית.' }));
      if (invitation.notFound) return send(res, 404, JSON.stringify({ error: 'ההזמנה אינה זמינה לשליחה מחדש.' }));
      const deliveryStatus = await deliverClassroomCredentialEmail(invitation.email, 'הזמנה להוראה ב־HaiTech', code);
      const reconciliation = withSummerDb(db => db.transaction(() => {
        const now = new Date().toISOString();
        const reconciled = db.prepare(`UPDATE classroom_teacher_invitations SET status = ?, delivery_status = ?, updated_at = ?
          WHERE id = ? AND status = 'pending' AND delivery_generation = ?`)
          .run(deliveryStatus, deliveryStatus, now, invitationId, invitation.delivery_generation);
        if (reconciled.changes !== 1) return { stale: true };
        db.prepare(`INSERT INTO classroom_credential_audit
          (id, actor_type, actor_id, action, target_type, target_id, outcome, occurred_at)
          VALUES (?, 'system', 'mailer', 'delivery', 'invitation', ?, ?, ?)`)
          .run(crypto.randomUUID(), invitationId, deliveryStatus === 'sent' ? 'success' : deliveryStatus, now);
        return { stale: false };
      }).immediate());
      if (reconciliation.stale) return send(res, 409, JSON.stringify({ error: 'תוצאת המשלוח התיישנה; מצב ההזמנה השתנה.' }));
      const payload = { ok: deliveryStatus === 'sent', invitation: {
        id: invitation.id, email: invitation.email, name: invitation.name,
        status: deliveryStatus, deliveryStatus, deliveryGeneration: invitation.delivery_generation,
        expiresAt: invitation.expires_at,
      } };
      if (process.env.NODE_ENV === 'test') payload.testCode = code;
      return send(res, deliveryStatus === 'failed' ? 502 : 200, JSON.stringify(payload));
    }

    if (action === 'admin' && segments[3] === 'invitations' && segments.length === 4) {
      if (Object.prototype.hasOwnProperty.call(body, 'password')) {
        auditInvitationFailure(req, 'invitation_create', 'new');
        return send(res, 400, JSON.stringify({ error: 'אין לשלוח סיסמה בהזמנה.' }));
      }
      const name = cleanText(body.name, 80);
      const email = cleanEmail(body.email);
      if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email)) {
        auditInvitationFailure(req, 'invitation_create', 'new');
        return send(res, 400, JSON.stringify({ error: 'פרטי ההזמנה אינם תקינים.' }));
      }
      const code = crypto.randomBytes(24).toString('base64url');
      const invitation = withSummerDb(db => db.transaction(() => {
        const now = new Date();
        const administrator = requireCurrentClassroomAdmin(db, req);
        if (!administrator) return null;
        const existingTeacher = db.prepare('SELECT id FROM classroom_teachers WHERE email = ?').get(email);
        if (existingTeacher) {
          db.prepare(`INSERT INTO classroom_credential_audit
            (id, actor_type, actor_id, action, target_type, target_id, outcome, occurred_at)
            VALUES (?, 'admin', ?, 'invitation_create', 'teacher', ?, 'invalid', ?)`)
            .run(crypto.randomUUID(), administrator.admin_id, existingTeacher.id, now.toISOString());
          return { conflict: true };
        }
        db.prepare(`UPDATE classroom_teacher_invitations
          SET status = 'revoked', revoked_at = ?, updated_at = ?
          WHERE email = ? AND status IN ('pending','sent','failed','unknown')
            AND redeemed_at IS NULL AND revoked_at IS NULL`)
          .run(now.toISOString(), now.toISOString(), email);
        const id = crypto.randomUUID();
        db.prepare(`INSERT INTO classroom_teacher_invitations
          (id, email, name, code_hash, attempts, max_attempts, status, delivery_status,
           expires_at, created_by, created_at, updated_at)
          VALUES (?, ?, ?, ?, 0, 5, 'pending', 'pending', ?, ?, ?, ?)`)
          .run(id, email, name, tokenHash(code),
            new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            administrator.admin_id, now.toISOString(), now.toISOString());
        db.prepare(`INSERT INTO classroom_credential_audit
          (id, actor_type, actor_id, action, target_type, target_id, outcome, occurred_at)
          VALUES (?, 'admin', ?, 'invitation_create', 'invitation', ?, 'success', ?)`)
          .run(crypto.randomUUID(), administrator.admin_id, id, now.toISOString());
        return { id, email, name, expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString() };
      }).immediate());
      if (!invitation) return send(res, 401, JSON.stringify({ error: 'נדרשת כניסת מנהלת עדכנית.' }));
      if (invitation.conflict) return send(res, 409, JSON.stringify({ error: 'כבר קיים חשבון מורה עם המייל הזה.' }));
      const deliveryStatus = await deliverClassroomCredentialEmail(email, 'הזמנה להוראה ב־HaiTech', code);
      const status = deliveryStatus;
      const reconciliation = withSummerDb(db => db.transaction(() => {
        const reconciledAt = new Date().toISOString();
        const reconciled = db.prepare(`UPDATE classroom_teacher_invitations SET status = ?, delivery_status = ?, updated_at = ?
          WHERE id = ? AND status = 'pending' AND delivery_status = 'pending' AND delivery_generation = 1`)
          .run(status, deliveryStatus, reconciledAt, invitation.id);
        if (reconciled.changes !== 1) return { stale: true };
        db.prepare(`INSERT INTO classroom_credential_audit
          (id, actor_type, actor_id, action, target_type, target_id, outcome, occurred_at)
          VALUES (?, 'system', 'mailer', 'delivery', 'invitation', ?, ?, ?)`)
          .run(crypto.randomUUID(), invitation.id, deliveryStatus === 'sent' ? 'success' : deliveryStatus, reconciledAt);
        return { stale: false };
      }).immediate());
      if (reconciliation.stale) return send(res, 409, JSON.stringify({ error: 'תוצאת המשלוח התיישנה; מצב ההזמנה השתנה.' }));
      const response = { ok: true, invitation: {
        id: invitation.id, email, name, status, deliveryStatus, deliveryGeneration: 1, expiresAt: invitation.expiresAt,
      } };
      if (process.env.NODE_ENV === 'test') response.testCode = code;
      return send(res, 201, JSON.stringify(response));
    }

    if (action === 'admin' && segments[3] === 'rotate' && segments.length === 4) {
      const rawToken = parseCookies(req).haiTechClassroomAdminToken || '';
      const replacementCode = crypto.randomBytes(24).toString('base64url');
      const replacementHash = createOneTimeCredentialHash(replacementCode);
      const result = withSummerDb(db => db.transaction(() => {
        const now = new Date();
        const session = db.prepare(`SELECT s.id AS session_id, a.id AS admin_id, a.email, a.credential_version
          FROM classroom_admin_sessions s JOIN classroom_admin_identity a ON a.id = s.admin_id
          WHERE s.token_hash = ? AND s.revoked_at IS NULL AND s.expires_at > ?
            AND s.credential_version = a.credential_version`).get(tokenHash(rawToken), now.toISOString());
        if (!session) return null;
        const nextVersion = session.credential_version + 1;
        db.prepare('UPDATE classroom_admin_identity SET credential_version = ?, updated_at = ? WHERE id = ? AND credential_version = ?')
          .run(nextVersion, now.toISOString(), session.admin_id, session.credential_version);
        db.prepare('UPDATE classroom_admin_sessions SET revoked_at = ? WHERE admin_id = ? AND revoked_at IS NULL')
          .run(now.toISOString(), session.admin_id);
        db.prepare('UPDATE classroom_admin_challenges SET revoked_at = ? WHERE admin_id = ? AND revoked_at IS NULL AND used_at IS NULL')
          .run(now.toISOString(), session.admin_id);
        const challengeId = crypto.randomUUID();
        db.prepare(`INSERT INTO classroom_admin_challenges
          (id, admin_id, purpose, code_hash, credential_version, attempts, max_attempts, expires_at, created_at)
          VALUES (?, ?, 'rotation', ?, ?, 0, 5, ?, ?)`)
          .run(challengeId, session.admin_id, replacementHash, nextVersion,
            new Date(now.getTime() + CLASSROOM_CHALLENGE_TTL_MS).toISOString(), now.toISOString());
        db.prepare(`INSERT INTO classroom_credential_audit
          (id, actor_type, actor_id, action, target_type, target_id, outcome, occurred_at)
          VALUES (?, 'admin', ?, 'rotation', 'admin', ?, 'success', ?)`)
          .run(crypto.randomUUID(), session.admin_id, session.admin_id, now.toISOString());
        return { challengeId, credentialVersion: nextVersion, email: session.email };
      }).immediate());
      if (!result) return send(res, 401, JSON.stringify({ error: 'נדרשת כניסת מנהלת עדכנית.' }));
      const deliveryStatus = await deliverClassroomCredentialEmail(result.email, 'קוד גישה לניהול HaiTech', replacementCode);
      const reconciliation = reconcileAdminChallengeDelivery(result.challengeId, result.credentialVersion, deliveryStatus);
      if (reconciliation.stale) {
        return sendWithHeaders(res, 409, JSON.stringify({ error: 'תוצאת המשלוח התיישנה; אתגר הגישה הוחלף או בוטל.' }),
          'application/json; charset=utf-8', { 'Set-Cookie': clearClassroomAdminSessionCookie() });
      }
      const response = { ok: deliveryStatus !== 'failed', oneTime: true, deliveryStatus };
      if (process.env.NODE_ENV === 'test') response.testCode = replacementCode;
      return sendWithHeaders(res, deliveryStatus === 'failed' ? 502 : 200, JSON.stringify(response), 'application/json; charset=utf-8', {
        'Set-Cookie': clearClassroomAdminSessionCookie(),
      });
    }

    if (action === 'admin' && segments[3] === 'teachers' && segments.length === 4) {
      const deprecatedCreate = withSummerDb(db => db.transaction(() => {
        const admin = requireCurrentClassroomAdmin(db, req);
        if (!admin) return { denied: true };
        recordClassroomManagementAudit(db, 'admin', admin.admin_id, 'teacher.create', 'teacher', 'new', 'invalid');
        return { passwordSupplied: Object.prototype.hasOwnProperty.call(body, 'password') };
      }).immediate());
      if (deprecatedCreate.denied) return send(res, 401, JSON.stringify({ error: 'נדרשת כניסת מנהלת.' }));
      if (deprecatedCreate.passwordSupplied) {
        return send(res, 400, JSON.stringify({ error: 'אין לשלוח סיסמה ביצירת מורה; יש ליצור הזמנה הקשורה למייל.' }));
      }
      return send(res, 410, JSON.stringify({ error: 'יצירת חשבון ישירה הוצאה משימוש; יש לשלוח הזמנה למורה.' }));
      /* Legacy implementation remains unreachable during the migration window. */
      const name = cleanText(body.name, 80);
      const email = cleanEmail(body.email);
      if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email)) {
        withSummerDb(db => recordClassroomManagementAudit(db, 'admin', admin.id, 'teacher.create', 'teacher', 'new', 'invalid'));
        return send(res, 400, JSON.stringify({ error: 'פרטי המורה אינם תקינים.' }));
      }
      const temporaryPassword = generateTemporaryTeacherPassword();
      const result = withSummerDb(db => db.transaction(() => {
        const currentAdmin = requireCurrentClassroomAdmin(db, req);
        if (!currentAdmin) return { denied: true };
        if (db.prepare('SELECT id FROM classroom_teachers WHERE email = ?').get(email)) return { conflict: true };
        const now = new Date().toISOString();
        const salt = crypto.randomBytes(16).toString('hex');
        const teacher = { id: crypto.randomUUID(), name, email, created_at: now };
        db.prepare(`
          INSERT INTO classroom_teachers (id, name, email, password_salt, password_hash, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(teacher.id, name, email, salt, hashClassroomSecret(temporaryPassword, salt), now, now);
        recordClassroomManagementAudit(db, 'admin', currentAdmin.admin_id, 'teacher.create', 'teacher', teacher.id, 'success');
        return { teacher };
      }).immediate());
      if (result.denied) return send(res, 401, JSON.stringify({ error: 'נדרשת כניסת מנהלת עדכנית.' }));
      if (result.conflict) {
        withSummerDb(db => recordClassroomManagementAudit(db, 'admin', admin.id, 'teacher.create', 'teacher', 'new', 'invalid'));
        return send(res, 409, JSON.stringify({ error: 'כבר קיים חשבון מורה עם המייל הזה.' }));
      }
      return send(res, 201, JSON.stringify({
        ok: true, oneTime: true, temporaryPassword,
        teacher: { id: result.teacher.id, name, email, courses: [], createdAt: result.teacher.created_at, archivedAt: null },
      }));
    }

    if (action === 'admin' && segments[3] === 'teachers' && segments[4] && segments.length === 5) {
      const teacherId = segments[4];
      const name = cleanText(body.name, 80);
      const email = cleanEmail(body.email);
      const result = withSummerDb(db => db.transaction(() => {
        const currentAdmin = requireCurrentClassroomAdmin(db, req);
        if (!currentAdmin) return { denied: true };
        if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email)) {
          recordClassroomManagementAudit(db, 'admin', currentAdmin.admin_id, 'teacher.update', 'teacher', teacherId, 'invalid');
          return { invalid: true };
        }
        const teacher = db.prepare(`SELECT id FROM classroom_teachers
          WHERE id = ? AND archived_at IS NULL AND disabled_at IS NULL`).get(teacherId);
        if (!teacher) {
          recordClassroomManagementAudit(db, 'admin', currentAdmin.admin_id, 'teacher.update', 'teacher', teacherId, 'not_found');
          return { notFound: true };
        }
        if (db.prepare('SELECT id FROM classroom_teachers WHERE email = ? AND id <> ?').get(email, teacherId)) {
          recordClassroomManagementAudit(db, 'admin', currentAdmin.admin_id, 'teacher.update', 'teacher', teacherId, 'invalid');
          return { conflict: true };
        }
        const now = new Date().toISOString();
        db.prepare('UPDATE classroom_teachers SET name = ?, email = ?, updated_at = ? WHERE id = ?').run(name, email, now, teacherId);
        recordClassroomManagementAudit(db, 'admin', currentAdmin.admin_id, 'teacher.update', 'teacher', teacherId, 'success');
        return { teacher: { id: teacherId, name, email, courses: teacherCourses(db, teacherId), archivedAt: null } };
      }).immediate());
      if (result.denied) return send(res, 401, JSON.stringify({ error: 'נדרשת כניסת מנהלת עדכנית.' }));
      if (result.invalid) return send(res, 400, JSON.stringify({ error: 'פרטי המורה אינם תקינים.' }));
      if (result.notFound) return send(res, 404, JSON.stringify({ error: 'המורה לא נמצאה.' }));
      if (result.conflict) return send(res, 409, JSON.stringify({ error: 'כבר קיים חשבון מורה עם המייל הזה.' }));
      return send(res, 200, JSON.stringify({ ok: true, teacher: result.teacher }));
    }

    if (action === 'admin' && segments[3] === 'teachers' && segments[4] && ['archive', 'restore'].includes(segments[5]) && segments.length === 6) {
      const admin = getClassroomAdminFromRequest(req);
      const teacherId = segments[4];
      const operation = segments[5];
      const auditAction = `teacher.${operation}`;
      if (!admin) {
        return send(res, 401, JSON.stringify({ error: 'נדרשת כניסת מנהלת.' }));
      }
      const result = withSummerDb(db => db.transaction(() => {
        const currentAdmin = requireCurrentClassroomAdmin(db, req);
        if (!currentAdmin) return { denied: true };
        const teacher = db.prepare('SELECT id, name, email, archived_at, disabled_at FROM classroom_teachers WHERE id = ?').get(teacherId);
        const inactive = Boolean(teacher && (teacher.archived_at || teacher.disabled_at));
        if (!teacher || (operation === 'archive' ? inactive : !inactive)) {
          recordClassroomManagementAudit(db, 'admin', currentAdmin.admin_id, auditAction, 'teacher', teacherId, 'not_found');
          return null;
        }
        const now = new Date().toISOString();
        if (operation === 'archive') {
          const activeLease = db.prepare(`
            SELECT 1 FROM kugel_class_sessions ks
            JOIN classrooms c ON c.id = ks.classroom_id
            WHERE c.teacher_id = ? AND ks.active = 1 LIMIT 1
          `).get(teacherId);
          if (activeLease) {
            recordClassroomManagementAudit(db, 'admin', currentAdmin.admin_id, auditAction, 'teacher', teacherId, 'denied');
            return { conflict: true };
          }
          db.prepare('UPDATE classroom_teachers SET archived_at = ?, disabled_at = ?, updated_at = ? WHERE id = ?')
            .run(now, now, now, teacherId);
          db.prepare('UPDATE classroom_teacher_sessions SET revoked_at = ? WHERE teacher_id = ? AND revoked_at IS NULL').run(now, teacherId);
          db.prepare(`
            UPDATE classroom_student_sessions SET revoked_at = ?
            WHERE revoked_at IS NULL AND student_id IN (
              SELECT s.id FROM classroom_students s
              JOIN classrooms c ON c.id = s.classroom_id
              WHERE c.teacher_id = ?
            )
          `).run(now, teacherId);
          teacher.archived_at = now;
          teacher.disabled_at = now;
        } else {
          db.prepare('UPDATE classroom_teachers SET archived_at = NULL, disabled_at = NULL, updated_at = ? WHERE id = ?').run(now, teacherId);
          teacher.archived_at = null;
          teacher.disabled_at = null;
        }
        recordClassroomManagementAudit(db, 'admin', currentAdmin.admin_id, auditAction, 'teacher', teacherId, 'success');
        return teacher;
      }).immediate());
      if (result?.denied) return send(res, 401, JSON.stringify({ error: 'נדרשת כניסת מנהלת עדכנית.' }));
      if (result?.conflict) return send(res, 409, JSON.stringify({ error: 'יש לעצור את שיעור Minecraft הפעיל לפני העברת המורה לארכיון.' }));
      if (!result) return send(res, 404, JSON.stringify({ error: 'המורה לא נמצאה במצב המתאים.' }));
      return send(res, 200, JSON.stringify({ ok: true, teacher: { id: result.id, name: result.name, email: result.email, archivedAt: result.archived_at } }));
    }

    if (action === 'admin' && segments[3] === 'students' && segments[4] && segments[5] === 'restore' && segments.length === 6) {
      const admin = getClassroomAdminFromRequest(req);
      const studentId = segments[4];
      if (!admin) {
        return send(res, 401, JSON.stringify({ error: 'נדרשת כניסת מנהלת.' }));
      }
      const student = withSummerDb(db => db.transaction(() => {
        const currentAdmin = requireCurrentClassroomAdmin(db, req);
        if (!currentAdmin) return { denied: true };
        const row = db.prepare(`
          SELECT s.id, s.name, s.archived_at, s.disabled_at,
            t.archived_at AS teacher_archived_at, t.disabled_at AS teacher_disabled_at
          FROM classroom_students s
          JOIN classrooms c ON c.id = s.classroom_id
          JOIN classroom_teachers t ON t.id = c.teacher_id
          WHERE s.id = ? AND (s.archived_at IS NOT NULL OR s.disabled_at IS NOT NULL)
        `).get(studentId);
        if (!row) {
          recordClassroomManagementAudit(db, 'admin', currentAdmin.admin_id, 'student.restore', 'student', studentId, 'not_found');
          return null;
        }
        if (row.teacher_archived_at || row.teacher_disabled_at) {
          recordClassroomManagementAudit(db, 'admin', currentAdmin.admin_id, 'student.restore', 'student', studentId, 'denied');
          return { ownerInactive: true };
        }
        db.prepare('UPDATE classroom_students SET archived_at = NULL, disabled_at = NULL, updated_at = ? WHERE id = ?').run(new Date().toISOString(), studentId);
        recordClassroomManagementAudit(db, 'admin', currentAdmin.admin_id, 'student.restore', 'student', studentId, 'success');
        return row;
      }).immediate());
      if (student?.denied) return send(res, 401, JSON.stringify({ error: 'נדרשת כניסת מנהלת עדכנית.' }));
      if (student?.ownerInactive) return send(res, 409, JSON.stringify({ error: 'יש לשחזר ולהפעיל את המורה לפני שחזור התלמיד/ה.' }));
      if (!student) return send(res, 404, JSON.stringify({ error: 'התלמיד/ה לא נמצא/ה בארכיון.' }));
      return send(res, 200, JSON.stringify({ ok: true, student: { id: student.id, name: student.name, archivedAt: null } }));
    }

    if (action === 'admin' && segments[3] === 'teachers' && segments[4] && segments[5] === 'courses' && segments.length === 6) {
      if (!getClassroomAdminFromRequest(req)) return send(res, 401, JSON.stringify({ error: 'נדרשת כניסת מנהלת.' }));
      const courses = cleanClassroomCourses(body.courses);
      if (!courses) return send(res, 400, JSON.stringify({ error: 'רשימת הלומדות אינה תקינה.' }));
      const result = withSummerDb(db => db.transaction(() => {
        const currentAdmin = requireCurrentClassroomAdmin(db, req);
        if (!currentAdmin) return { denied: true };
        const teacher = db.prepare('SELECT id, name, email FROM classroom_teachers WHERE id = ? AND archived_at IS NULL AND disabled_at IS NULL').get(segments[4]);
        if (!teacher) return { notFound: true };
        const releasedLeases = courses.includes(KUGEL_COURSE_ID) ? [] : db.prepare(`
          SELECT kms.classroom_id, kms.monitor_server_name, kms.launch_token, kms.generation, kms.server_state
          FROM kugel_class_sessions kms
          JOIN classrooms c ON c.id = kms.classroom_id
          WHERE c.teacher_id = ? AND kms.active = 1
        `).all(teacher.id);
        for (const lease of releasedLeases) {
          db.prepare(`
            UPDATE kugel_class_sessions SET server_state = 'stopping', server_detail = ?, updated_at = ?
            WHERE classroom_id = ? AND monitor_server_name = ? AND launch_token = ? AND generation = ?
              AND active = 1 AND server_state = ?
          `).run('ההרשאה הוסרה; עולם המבוך בתהליך עצירה…', new Date().toISOString(), lease.classroom_id,
            lease.monitor_server_name, lease.launch_token, lease.generation, lease.server_state);
        }
        replaceTeacherCourses(db, teacher.id, courses);
        const affectedClasses = db.prepare('SELECT id, name FROM classrooms WHERE teacher_id = ? ORDER BY created_at').all(teacher.id)
          .map(classroom => ({ id: classroom.id, name: classroom.name, courses: classroomCourses(db, classroom.id) }));
        recordClassroomManagementAudit(db, 'admin', currentAdmin.admin_id, 'teacher.courses', 'teacher', teacher.id, 'success');
        return { teacher: { ...teacher, courses: teacherCourses(db, teacher.id) }, affectedClasses, releasedLeases };
      }).immediate());
      if (result.denied) return send(res, 401, JSON.stringify({ error: 'נדרשת כניסת מנהלת עדכנית.' }));
      if (result.notFound) return send(res, 404, JSON.stringify({ error: 'המורה לא נמצאה.' }));
      const { releasedLeases, ...publicResult } = result;
      for (const lease of releasedLeases) {
        try {
          await kugelWorldLifecycleMutation('/api/internal/craftom-school/v2/world/close', {
            server: lease.monitor_server_name, lease_id: lease.launch_token,
            generation: lease.generation, owner_id: lease.classroom_id,
          });
          withSummerDb(db => db.prepare(`
            UPDATE kugel_class_sessions SET active = 0, server_state = 'idle', server_detail = ?, updated_at = ?
            WHERE classroom_id = ? AND monitor_server_name = ? AND launch_token = ? AND generation = ?
              AND active = 1 AND server_state = 'stopping'
          `).run('ההרשאה הוסרה והשרת שוחרר.', new Date().toISOString(), lease.classroom_id,
            lease.monitor_server_name, lease.launch_token, lease.generation));
        } catch (error) {
          console.error('kugel_entitlement_revoke_freeze_error', { teacherId: segments[4], message: error.message });
          return send(res, 502, JSON.stringify({ error: 'ההרשאה הוסרה, אך עצירת עולם Minecraft נכשלה.' }));
        }
      }
      return send(res, 200, JSON.stringify({ ok: true, ...publicResult }));
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
      const courseId = cleanText(body.courseId, 80);
      const lessonId = cleanText(body.lessonId, 80);
      const activityId = cleanText(body.activityId, 80);
      const status = body.status === 'completed' ? 'completed' : 'started';
      const score = Math.max(0, Math.min(100, Number(body.score || 0)));
      const metadata = body.metadata && typeof body.metadata === 'object' ? body.metadata : {};
      const metadataJson = JSON.stringify(metadata).slice(0, 4000);
      const result = withSummerDb(db => db.transaction(() => {
        const student = requireCurrentClassroomStudent(db, req);
        if (!student) return { denied: true };
        if (!CLASSROOM_COURSES.has(courseId) || !lessonId || !activityId) {
          recordClassroomManagementAudit(db, 'student', student.id, 'progress.record', 'progress', student.id, 'invalid');
          return { invalid: true, invalidCourse: !CLASSROOM_COURSES.has(courseId) };
        }
        if (courseId === KUGEL_COURSE_ID && lessonId === '0' && activityId === 'minecraft-maze' && status === 'completed') {
          recordClassroomManagementAudit(db, 'student', student.id, 'progress.record', 'progress', student.id, 'denied');
          return { kugelDenied: true };
        }
        if (!classroomHasCourse(db, student.classroom_id, courseId)) {
          recordClassroomManagementAudit(db, 'student', student.id, 'progress.record', 'progress', student.id, 'denied');
          return { forbidden: true };
        }
        const numericLessonId = Number(lessonId);
        if (courseId === KUGEL_COURSE_ID
          && Number.isInteger(numericLessonId)
          && numericLessonId > 0
          && !classroomStudentCanAccessCraftomLesson(db, student, numericLessonId)) {
          recordClassroomManagementAudit(db, 'student', student.id, 'progress.record', 'progress', student.id, 'denied');
          return { lessonLocked: true };
        }
        const now = new Date().toISOString();
        const existing = db.prepare(`SELECT * FROM classroom_progress
          WHERE student_id = ? AND course_id = ? AND lesson_id = ? AND activity_id = ?`)
          .get(student.id, courseId, lessonId, activityId);
        if (existing) {
          const effectiveStatus = existing.status === 'completed' ? 'completed' : status;
          const completedAt = effectiveStatus === 'completed' ? (existing.completed_at || now) : null;
          db.prepare(`UPDATE classroom_progress SET status = ?, score = MAX(score, ?), attempts = attempts + 1,
            metadata_json = ?, completed_at = ?, updated_at = ? WHERE id = ?`)
            .run(effectiveStatus, score, metadataJson, completedAt, now, existing.id);
          recordClassroomManagementAudit(db, 'student', student.id, 'progress.record', 'progress', student.id, 'success');
          return { row: db.prepare('SELECT * FROM classroom_progress WHERE id = ?').get(existing.id) };
        }
        const id = crypto.randomUUID();
        db.prepare(`INSERT INTO classroom_progress
          (id, student_id, course_id, lesson_id, activity_id, status, score, attempts,
           metadata_json, started_at, completed_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?)`)
          .run(id, student.id, courseId, lessonId, activityId, status, score, metadataJson, now, status === 'completed' ? now : null, now);
        recordClassroomManagementAudit(db, 'student', student.id, 'progress.record', 'progress', student.id, 'success');
        return { row: db.prepare('SELECT * FROM classroom_progress WHERE id = ?').get(id) };
      }).immediate());
      if (result.denied) return send(res, 401, JSON.stringify({ error: 'נדרשת כניסת תלמיד/ה לכיתה.' }));
      if (result.invalid) return send(res, 400, JSON.stringify({ error: result.invalidCourse ? 'הקורס אינו מוכר.' : 'חסרים פרטי התקדמות.' }));
      if (result.kugelDenied) return send(res, 403, JSON.stringify({ error: 'שיעור 0 מושלם רק אחרי בדיקת Minecraft.' }));
      if (result.lessonLocked) return send(res, 423, JSON.stringify({ error: 'השיעור הזה עדיין לא נפתח לכיתה על ידי המורה.' }));
      if (result.forbidden) return send(res, 403, JSON.stringify({ error: 'הלומדה אינה פתוחה לכיתה הזו.' }));
      return send(res, 200, JSON.stringify({ ok: true, progress: classroomProgressPublic(result.row) }));
    }

    if (action === 'student-login') {
      const classCode = cleanAccessCode(body.classCode);
      const personalCode = cleanAccessCode(body.personalCode);
      const sourceLimitKey = classroomSourceKey(req, 'student-login');
      const identityLimitKey = classroomIdentityKey('student-login', classCode);
      if (consumeClassroomLoginAttempts([sourceLimitKey, identityLimitKey])) {
        return send(res, 429, JSON.stringify({ error: 'יותר מדי ניסיונות. נסו שוב בעוד כמה דקות.' }));
      }
      const result = withSummerDb(db => db.transaction(() => {
        const classroom = db.prepare(`
          SELECT c.* FROM classrooms c
          JOIN classroom_teachers t ON t.id = c.teacher_id
          WHERE c.join_code = ? AND t.archived_at IS NULL AND t.disabled_at IS NULL
        `).get(classCode);
        const students = classroom && personalCode
          ? db.prepare('SELECT * FROM classroom_students WHERE classroom_id = ? AND archived_at IS NULL AND disabled_at IS NULL').all(classroom.id)
          : [];
        const candidates = students.length ? students : [{
          login_salt: DUMMY_CLASSROOM_STUDENT_SALT,
          login_hash: DUMMY_CLASSROOM_STUDENT_HASH,
        }];
        let student = null;
        for (const candidate of candidates) {
          const provided = Buffer.from(hashClassroomSecret(personalCode, candidate.login_salt), 'hex');
          const expected = Buffer.from(candidate.login_hash, 'hex');
          if (provided.length === expected.length && crypto.timingSafeEqual(provided, expected) && students.length) student = candidate;
        }
        if (!classroom || !student) return { failed: true, workFactor: candidates.length };
        return { classroom, student, token: createClassroomStudentSession(db, student.id), workFactor: candidates.length };
      }).immediate());
      if (result.failed) {
        const response = { error: 'קוד כיתה או קוד אישי אינם נכונים.' };
        if (process.env.NODE_ENV === 'test') response.testWorkFactor = result.workFactor;
        return send(res, 401, JSON.stringify(response));
      }
      clearClassroomLoginFailures(sourceLimitKey);
      clearClassroomLoginFailures(identityLimitKey);
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
      const courses = cleanClassroomCourses(body.courses);
      const result = withSummerDb(db => db.transaction(() => {
        const teacher = requireCurrentClassroomTeacher(db, req);
        if (!teacher) return { denied: true };
        if (!courses?.length) {
          recordClassroomManagementAudit(db, 'teacher', teacher.id, 'classroom.courses', 'classroom', segments[3], 'invalid');
          return { invalid: true };
        }
        const row = db.prepare('SELECT * FROM classrooms WHERE id = ? AND teacher_id = ?').get(segments[3], teacher.id);
        if (!row) {
          recordClassroomManagementAudit(db, 'teacher', teacher.id, 'classroom.courses', 'classroom', segments[3], 'not_found');
          return { notFound: true };
        }
        if (!teacherCanAssignCourses(db, teacher.id, courses)) {
          recordClassroomManagementAudit(db, 'teacher', teacher.id, 'classroom.courses', 'classroom', row.id, 'denied');
          return { forbidden: true };
        }
        const releasedLease = courses.includes(KUGEL_COURSE_ID) ? null : db.prepare(`
          SELECT classroom_id, monitor_server_name, launch_token, generation, server_state FROM kugel_class_sessions
          WHERE classroom_id = ? AND active = 1`).get(row.id) || null;
        if (releasedLease) db.prepare(`UPDATE kugel_class_sessions SET server_state = 'stopping', server_detail = ?, updated_at = ?
          WHERE classroom_id = ? AND monitor_server_name = ? AND launch_token = ? AND generation = ?
            AND active = 1 AND server_state = ?`)
          .run('הרשאת הכיתה הוסרה; עולם המבוך בתהליך עצירה…', new Date().toISOString(), row.id,
            releasedLease.monitor_server_name, releasedLease.launch_token, releasedLease.generation, releasedLease.server_state);
        replaceClassroomCourses(db, row.id, courses);
        recordClassroomManagementAudit(db, 'teacher', teacher.id, 'classroom.courses', 'classroom', row.id, 'success');
        return { classroom: row, releasedLease };
      }).immediate());
      if (result.denied) return send(res, 401, JSON.stringify({ error: 'נדרשת כניסת מורה.' }));
      if (result.invalid) return send(res, 400, JSON.stringify({ error: 'בחרו לפחות לומדה אחת תקינה לכיתה.' }));
      if (result.notFound) return send(res, 404, JSON.stringify({ error: 'הכיתה לא נמצאה.' }));
      if (result.forbidden) return send(res, 403, JSON.stringify({ error: 'אפשר לשייך לכיתה רק לומדות שהוקצו לך.' }));
      if (result.releasedLease) {
        try {
          await kugelWorldLifecycleMutation('/api/internal/craftom-school/v2/world/close', {
            server: result.releasedLease.monitor_server_name, lease_id: result.releasedLease.launch_token,
            generation: result.releasedLease.generation, owner_id: result.releasedLease.classroom_id,
          });
          withSummerDb(db => db.prepare(`
            UPDATE kugel_class_sessions SET active = 0, server_state = 'idle', server_detail = ?, updated_at = ?
            WHERE classroom_id = ? AND monitor_server_name = ? AND launch_token = ? AND generation = ?
              AND active = 1 AND server_state = 'stopping'
          `).run('הרשאת הכיתה הוסרה והשרת שוחרר.', new Date().toISOString(),
            result.releasedLease.classroom_id, result.releasedLease.monitor_server_name,
            result.releasedLease.launch_token, result.releasedLease.generation));
        } catch (error) {
          console.error('kugel_class_course_revoke_freeze_error', { classroomId: segments[3], message: error.message });
          return send(res, 502, JSON.stringify({ error: 'ההרשאה הוסרה, אך עצירת עולם Minecraft נכשלה.' }));
        }
      }
      const classroom = result.classroom;
      return send(res, 200, JSON.stringify({
        ok: true,
        classroom: {
          id: classroom.id,
          name: classroom.name,
          joinCode: classroom.join_code,
          courses,
          updatedAt: new Date().toISOString(),
        },
      }));
    }

    if (action === 'admin' && segments[3] === 'students' && segments[4]
      && segments[5] === 'minecraft' && segments[6] === 'verify' && segments.length === 7) {
      const studentId = segments[4];
      const upn = cleanMinecraftUpn(body.upn);
      const playerName = cleanMinecraftPlayerName(body.playerName);
      const requestId = crypto.randomUUID();
      const authorization = withSummerDb(db => db.transaction(() => {
        const admin = requireCurrentClassroomAdmin(db, req);
        if (!admin) return { denied: true };
        if (!upn || !playerName) {
          recordClassroomManagementAudit(db, 'admin', admin.admin_id, 'minecraft.identity.verify', 'student', studentId, 'invalid');
          return { invalid: true };
        }
        const student = db.prepare(`SELECT s.id FROM classroom_students s
          JOIN classrooms c ON c.id = s.classroom_id
          JOIN classroom_teachers t ON t.id = c.teacher_id
          WHERE s.id = ? AND s.archived_at IS NULL AND s.disabled_at IS NULL
            AND t.archived_at IS NULL AND t.disabled_at IS NULL
            AND (EXISTS (SELECT 1 FROM classroom_courses cc WHERE cc.classroom_id = c.id AND cc.course_id = 'minecraft')
              OR EXISTS (SELECT 1 FROM classroom_courses cc WHERE cc.classroom_id = c.id AND cc.course_id = ?))`)
          .get(studentId, KUGEL_COURSE_ID);
        if (!student) {
          recordClassroomManagementAudit(db, 'admin', admin.admin_id, 'minecraft.identity.verify', 'student', studentId, 'not_found');
          return { notFound: true };
        }
        cleanupExpiredMinecraftVerificationRequests(db);
        db.prepare(`INSERT INTO classroom_minecraft_verification_requests
          (request_id, student_id, actor_type, actor_id, created_at)
          VALUES (?, ?, 'admin', ?, ?)
          ON CONFLICT(student_id) DO UPDATE SET request_id = excluded.request_id,
            actor_type = excluded.actor_type, actor_id = excluded.actor_id,
            created_at = excluded.created_at`)
          .run(requestId, studentId, admin.admin_id, new Date().toISOString());
        return { adminId: admin.admin_id, requestId };
      }).immediate());
      if (authorization.denied) return send(res, 401, JSON.stringify({ error: 'נדרשת כניסת מנהלת עדכנית.' }));
      if (authorization.invalid) return send(res, 400, JSON.stringify({ error: 'יש להזין כתובת hai.tech ושם שחקן תקינים.' }));
      if (authorization.notFound) return send(res, 404, JSON.stringify({ error: 'התלמיד/ה לא נמצא/ה בכיתה פעילה עם Minecraft.' }));
      const sourceLimitKey = classroomSourceKey(req, 'minecraft-identity-verify');
      const identityLimitKey = classroomIdentityKey('minecraft-identity-verify', `${authorization.adminId}:${studentId}`);
      if (consumeClassroomLoginAttempts([sourceLimitKey, identityLimitKey], 24)) {
        withSummerDb(db => db.transaction(() => {
          db.prepare('DELETE FROM classroom_minecraft_verification_requests WHERE student_id = ? AND request_id = ?')
            .run(studentId, authorization.requestId);
          recordClassroomManagementAudit(db, 'admin', authorization.adminId, 'minecraft.identity.verify', 'student', studentId, 'denied');
        }).immediate());
        return send(res, 429, JSON.stringify({ error: 'יותר מדי בקשות אימות. נסו שוב מאוחר יותר.' }));
      }

      let external;
      try {
        external = await verifyExistingMinecraftIdentity(upn, playerName);
      } catch (error) {
        const status = Number(error.statusCode) || 502;
        const failure = withSummerDb(db => db.transaction(() => {
          const current = db.prepare(`DELETE FROM classroom_minecraft_verification_requests
            WHERE student_id = ? AND request_id = ?`).run(studentId, authorization.requestId);
          if (current.changes !== 1) return { stale: true };
          const admin = requireCurrentClassroomAdmin(db, req);
          if (admin?.admin_id === authorization.adminId) {
            recordClassroomManagementAudit(db, 'admin', admin.admin_id, 'minecraft.identity.verify', 'student', studentId, 'denied');
          }
          return { stale: false };
        }).immediate());
        if (failure.stale) return send(res, 409, JSON.stringify({ error: 'תוצאת האימות התיישנה; בקשה חדשה יותר כבר נשמרה.' }));
        return send(res, status, JSON.stringify({ error: status === 503
          ? 'אימות חשבון Minecraft אינו זמין כרגע.'
          : status === 422 ? 'לא נמצא חשבון Microsoft פעיל עם רישיון Minecraft Education.'
            : 'אימות חשבון Minecraft נכשל.' }));
      }

      const result = withSummerDb(db => db.transaction(() => {
        const admin = requireCurrentClassroomAdmin(db, req);
        if (!admin || admin.admin_id !== authorization.adminId) return { stale: true };
        const currentRequest = db.prepare(`SELECT request_id FROM classroom_minecraft_verification_requests
          WHERE student_id = ? AND request_id = ?`).get(studentId, authorization.requestId);
        if (!currentRequest) return { stale: true };
        const student = db.prepare(`SELECT s.id, c.id AS classroom_id, c.teacher_id FROM classroom_students s
          JOIN classrooms c ON c.id = s.classroom_id
          JOIN classroom_teachers t ON t.id = c.teacher_id
          WHERE s.id = ? AND s.archived_at IS NULL AND s.disabled_at IS NULL
            AND t.archived_at IS NULL AND t.disabled_at IS NULL`).get(studentId);
        if (!student) return { stale: true };
        const classroomEntitled = classroomHasCourse(db, student.classroom_id, 'minecraft')
          || classroomHasCourse(db, student.classroom_id, KUGEL_COURSE_ID);
        const teacherEntitled = teacherHasCourse(db, student.teacher_id, 'minecraft')
          || teacherHasCourse(db, student.teacher_id, KUGEL_COURSE_ID);
        if (!classroomEntitled || !teacherEntitled) return { stale: true };
        const now = new Date().toISOString();
        try {
          db.transaction(() => {
            db.prepare(`INSERT INTO classroom_minecraft_identities
            (student_id, upn, player_name, status, graph_object_id, source, verified_at, created_at, updated_at)
            VALUES (?, ?, ?, 'verified', ?, 'microsoft-graph-via-monitor', ?, ?, ?)
            ON CONFLICT(student_id) DO UPDATE SET upn = excluded.upn, player_name = excluded.player_name,
              status = excluded.status, graph_object_id = excluded.graph_object_id, source = excluded.source,
              verified_at = excluded.verified_at, updated_at = excluded.updated_at`)
            .run(studentId, upn, playerName, external.graphObjectId, now, now, now);
            db.prepare('UPDATE classroom_students SET minecraft_player_name = ?, updated_at = ? WHERE id = ?')
              .run(playerName, now, studentId);
          })();
        } catch (error) {
          if (String(error.code || '').startsWith('SQLITE_CONSTRAINT')) {
            db.prepare('DELETE FROM classroom_minecraft_verification_requests WHERE student_id = ? AND request_id = ?')
              .run(studentId, authorization.requestId);
            recordClassroomManagementAudit(db, 'admin', admin.admin_id, 'minecraft.identity.verify', 'student', studentId, 'denied');
            return { conflict: true };
          }
          throw error;
        }
        db.prepare('DELETE FROM classroom_minecraft_verification_requests WHERE student_id = ? AND request_id = ?')
          .run(studentId, authorization.requestId);
        recordClassroomManagementAudit(db, 'admin', admin.admin_id, 'minecraft.identity.verify', 'student', studentId, 'success');
        return { identity: classroomStudentMinecraftIdentity(db, studentId) };
      }).immediate());
      if (result.stale) {
        withSummerDb(db => db.transaction(() => {
          finalizeStaleMinecraftVerification(db, 'admin', authorization.adminId, studentId, authorization.requestId);
        }).immediate());
        return send(res, 409, JSON.stringify({ error: 'התלמיד/ה השתנו בזמן האימות.' }));
      }
      if (result.conflict) return send(res, 409, JSON.stringify({ error: 'החשבון או שם השחקן כבר מקושרים לתלמיד/ה אחר/ת.' }));
      return send(res, 200, JSON.stringify({ ok: true, minecraftIdentity: result.identity }));
    }

    if (action === 'classes' && segments[3] && segments[4] === 'students' && segments[5]
      && segments[6] === 'minecraft' && segments[7] === 'verify' && segments.length === 8) {
      const classroomId = segments[3];
      const studentId = segments[5];
      const upn = cleanMinecraftUpn(body.upn);
      const playerName = cleanMinecraftPlayerName(body.playerName);
      const requestId = crypto.randomUUID();
      const authorization = withSummerDb(db => db.transaction(() => {
        const teacher = requireCurrentClassroomTeacher(db, req);
        if (!teacher) return { denied: true };
        if (!upn || !playerName) {
          recordClassroomManagementAudit(db, 'teacher', teacher.id, 'minecraft.identity.verify', 'student', studentId, 'invalid');
          return { invalid: true };
        }
        const classroom = requireCurrentTeacherClassroom(db, req, teacher.id, classroomId);
        if (classroom.status) {
          recordClassroomManagementAudit(db, 'teacher', teacher.id, 'minecraft.identity.verify', 'student', studentId, 'denied');
          return { authorization: classroom };
        }
        if (!classroomHasCourse(db, classroomId, 'minecraft') && !classroomHasCourse(db, classroomId, KUGEL_COURSE_ID)) {
          recordClassroomManagementAudit(db, 'teacher', teacher.id, 'minecraft.identity.verify', 'student', studentId, 'denied');
          return { forbidden: true };
        }
        const student = db.prepare(`SELECT s.id FROM classroom_students s
          JOIN classrooms c ON c.id = s.classroom_id
          WHERE s.id = ? AND s.classroom_id = ? AND c.teacher_id = ?
            AND s.archived_at IS NULL AND s.disabled_at IS NULL`).get(studentId, classroomId, teacher.id);
        if (!student) {
          recordClassroomManagementAudit(db, 'teacher', teacher.id, 'minecraft.identity.verify', 'student', studentId, 'denied');
          return { notFound: true };
        }
        cleanupExpiredMinecraftVerificationRequests(db);
        db.prepare(`INSERT INTO classroom_minecraft_verification_requests
          (request_id, student_id, actor_type, actor_id, created_at)
          VALUES (?, ?, 'teacher', ?, ?)
          ON CONFLICT(student_id) DO UPDATE SET request_id = excluded.request_id,
            actor_type = excluded.actor_type, actor_id = excluded.actor_id,
            created_at = excluded.created_at`)
          .run(requestId, studentId, teacher.id, new Date().toISOString());
        return { teacherId: teacher.id, requestId };
      }).immediate());
      if (authorization.denied) return send(res, 401, JSON.stringify({ error: 'נדרשת כניסת מורה.' }));
      if (authorization.invalid) return send(res, 400, JSON.stringify({ error: 'יש להזין כתובת hai.tech ושם שחקן תקינים.' }));
      if (authorization.authorization) return send(res, authorization.authorization.status, JSON.stringify({ error: authorization.authorization.error }));
      if (authorization.forbidden) return send(res, 403, JSON.stringify({ error: 'Minecraft אינו פתוח לכיתה הזו.' }));
      if (authorization.notFound) return send(res, 404, JSON.stringify({ error: 'התלמיד/ה לא נמצא/ה בכיתה שלך.' }));
      const sourceLimitKey = classroomSourceKey(req, 'minecraft-identity-verify');
      const identityLimitKey = classroomIdentityKey('minecraft-identity-verify', `${authorization.teacherId}:${studentId}`);
      if (consumeClassroomLoginAttempts([sourceLimitKey, identityLimitKey], 24)) {
        withSummerDb(db => db.transaction(() => {
          db.prepare('DELETE FROM classroom_minecraft_verification_requests WHERE student_id = ? AND request_id = ?')
            .run(studentId, authorization.requestId);
          recordClassroomManagementAudit(db, 'teacher', authorization.teacherId, 'minecraft.identity.verify', 'student', studentId, 'denied');
        }).immediate());
        return send(res, 429, JSON.stringify({ error: 'יותר מדי בקשות אימות. נסו שוב מאוחר יותר.' }));
      }

      let external;
      try {
        external = await verifyExistingMinecraftIdentity(upn, playerName);
      } catch (error) {
        const status = Number(error.statusCode) || 502;
        const failure = withSummerDb(db => db.transaction(() => {
          const current = db.prepare(`DELETE FROM classroom_minecraft_verification_requests
            WHERE student_id = ? AND request_id = ?`).run(studentId, authorization.requestId);
          if (current.changes !== 1) return { stale: true };
          const teacher = requireCurrentClassroomTeacher(db, req);
          const owned = teacher && db.prepare(`SELECT s.id FROM classroom_students s
            JOIN classrooms c ON c.id = s.classroom_id
            WHERE s.id = ? AND s.classroom_id = ? AND c.teacher_id = ?`).get(studentId, classroomId, teacher.id);
          if (owned) recordClassroomManagementAudit(db, 'teacher', teacher.id, 'minecraft.identity.verify', 'student', studentId, 'denied');
          return { stale: false };
        }).immediate());
        if (failure.stale) return send(res, 409, JSON.stringify({ error: 'תוצאת האימות התיישנה; בקשה חדשה יותר כבר נשמרה.' }));
        return send(res, status, JSON.stringify({ error: status === 503
          ? 'אימות חשבון Minecraft אינו זמין כרגע.'
          : status === 422 ? 'לא נמצא חשבון Microsoft פעיל עם רישיון Minecraft Education.'
            : 'אימות חשבון Minecraft נכשל.' }));
      }

      const result = withSummerDb(db => db.transaction(() => {
        const teacher = requireCurrentClassroomTeacher(db, req);
        if (!teacher || teacher.id !== authorization.teacherId) return { stale: true };
        const currentRequest = db.prepare(`SELECT request_id FROM classroom_minecraft_verification_requests
          WHERE student_id = ? AND request_id = ?`).get(studentId, authorization.requestId);
        if (!currentRequest) return { stale: true };
        const student = db.prepare(`SELECT s.id FROM classroom_students s
          JOIN classrooms c ON c.id = s.classroom_id
          WHERE s.id = ? AND s.classroom_id = ? AND c.teacher_id = ?
            AND s.archived_at IS NULL AND s.disabled_at IS NULL`).get(studentId, classroomId, teacher.id);
        if (!student) return { stale: true };
        const classroomEntitled = classroomHasCourse(db, classroomId, 'minecraft')
          || classroomHasCourse(db, classroomId, KUGEL_COURSE_ID);
        const teacherEntitled = teacherHasCourse(db, teacher.id, 'minecraft')
          || teacherHasCourse(db, teacher.id, KUGEL_COURSE_ID);
        if (!classroomEntitled || !teacherEntitled) return { stale: true };
        const now = new Date().toISOString();
        try {
          db.transaction(() => {
            db.prepare(`INSERT INTO classroom_minecraft_identities
            (student_id, upn, player_name, status, graph_object_id, source, verified_at, created_at, updated_at)
            VALUES (?, ?, ?, 'verified', ?, 'microsoft-graph-via-monitor', ?, ?, ?)
            ON CONFLICT(student_id) DO UPDATE SET upn = excluded.upn, player_name = excluded.player_name,
              status = excluded.status, graph_object_id = excluded.graph_object_id, source = excluded.source,
              verified_at = excluded.verified_at, updated_at = excluded.updated_at`)
            .run(studentId, upn, playerName, external.graphObjectId, now, now, now);
            db.prepare('UPDATE classroom_students SET minecraft_player_name = ?, updated_at = ? WHERE id = ?')
              .run(playerName, now, studentId);
          })();
        } catch (error) {
          if (String(error.code || '').startsWith('SQLITE_CONSTRAINT')) {
            db.prepare('DELETE FROM classroom_minecraft_verification_requests WHERE student_id = ? AND request_id = ?')
              .run(studentId, authorization.requestId);
            recordClassroomManagementAudit(db, 'teacher', teacher.id, 'minecraft.identity.verify', 'student', studentId, 'denied');
            return { conflict: true };
          }
          throw error;
        }
        db.prepare('DELETE FROM classroom_minecraft_verification_requests WHERE student_id = ? AND request_id = ?')
          .run(studentId, authorization.requestId);
        recordClassroomManagementAudit(db, 'teacher', teacher.id, 'minecraft.identity.verify', 'student', studentId, 'success');
        return { identity: classroomStudentMinecraftIdentity(db, studentId) };
      }).immediate());
      if (result.stale) {
        withSummerDb(db => db.transaction(() => {
          finalizeStaleMinecraftVerification(db, 'teacher', authorization.teacherId, studentId, authorization.requestId);
        }).immediate());
        return send(res, 409, JSON.stringify({ error: 'הכיתה או התלמיד/ה השתנו בזמן האימות.' }));
      }
      if (result.conflict) return send(res, 409, JSON.stringify({ error: 'החשבון או שם השחקן כבר מקושרים לתלמיד/ה אחר/ת.' }));
      return send(res, 200, JSON.stringify({ ok: true, minecraftIdentity: result.identity }));
    }

    if (action === 'classes' && segments[3] && segments[4] === 'students' && segments[5] && segments.length === 6) {
      const classroomId = segments[3];
      const studentId = segments[5];
      const name = cleanText(body.name, 80);
      const student = withSummerDb(db => db.transaction(() => {
        const teacher = requireCurrentClassroomTeacher(db, req);
        if (!teacher) return { denied: true };
        if (name.length < 2) {
          recordClassroomManagementAudit(db, 'teacher', teacher.id, 'student.update', 'student', studentId, 'invalid');
          return { invalid: true };
        }
        const authorization = requireCurrentTeacherClassroom(db, req, teacher.id, classroomId);
        if (authorization.status) return { authorization };
        const row = db.prepare(`
          SELECT s.id FROM classroom_students s
          JOIN classrooms c ON c.id = s.classroom_id
          WHERE s.id = ? AND s.classroom_id = ? AND c.teacher_id = ?
            AND s.archived_at IS NULL AND s.disabled_at IS NULL
        `).get(studentId, classroomId, teacher.id);
        if (!row) {
          recordClassroomManagementAudit(db, 'teacher', teacher.id, 'student.update', 'student', studentId, 'denied');
          return null;
        }
        db.prepare('UPDATE classroom_students SET name = ?, updated_at = ? WHERE id = ?').run(name, new Date().toISOString(), studentId);
        recordClassroomManagementAudit(db, 'teacher', teacher.id, 'student.update', 'student', studentId, 'success');
        return { id: studentId, name };
      }).immediate());
      if (student?.denied) return send(res, 401, JSON.stringify({ error: 'נדרשת כניסת מורה.' }));
      if (student?.invalid) return send(res, 400, JSON.stringify({ error: 'נא למלא שם תלמיד/ה.' }));
      if (student?.authorization) return send(res, student.authorization.status, JSON.stringify({ error: student.authorization.error }));
      if (!student) return send(res, 404, JSON.stringify({ error: 'התלמיד/ה לא נמצא/ה בכיתה שלך.' }));
      return send(res, 200, JSON.stringify({ ok: true, student }));
    }

    if (action === 'classes' && segments[3] && segments[4] === 'students' && segments[5] && ['reset', 'archive', 'restore'].includes(segments[6]) && segments.length === 7) {
      const classroomId = segments[3];
      const studentId = segments[5];
      const operation = segments[6];
      const auditAction = operation === 'reset' ? 'student.reset_code' : `student.${operation}`;
      const result = withSummerDb(db => db.transaction(() => {
        const teacher = requireCurrentClassroomTeacher(db, req);
        if (!teacher) return { denied: true };
        const authorization = requireCurrentTeacherClassroom(db, req, teacher.id, classroomId);
        if (authorization.status) {
          recordClassroomManagementAudit(db, 'teacher', teacher.id, auditAction, 'student', studentId, 'denied');
          return { authorization };
        }
        const activeStudentQuery = `
          SELECT s.id, s.name FROM classroom_students s
          JOIN classrooms c ON c.id = s.classroom_id
          WHERE s.id = ? AND s.classroom_id = ? AND c.teacher_id = ?
            AND s.archived_at IS NULL AND s.disabled_at IS NULL
        `;
        const archivedStudentQuery = `
          SELECT s.id, s.name FROM classroom_students s
          JOIN classrooms c ON c.id = s.classroom_id
          WHERE s.id = ? AND s.classroom_id = ? AND c.teacher_id = ?
            AND (s.archived_at IS NOT NULL OR s.disabled_at IS NOT NULL)
        `;
        const student = db.prepare(operation === 'restore' ? archivedStudentQuery : activeStudentQuery)
          .get(studentId, classroomId, teacher.id);
        if (!student) {
          recordClassroomManagementAudit(db, 'teacher', teacher.id, auditAction, 'student', studentId, 'denied');
          return null;
        }
        const now = new Date().toISOString();
        let loginCode = null;
        if (operation === 'reset') {
          loginCode = generatePersonalLoginCode(db, classroomId);
          const salt = crypto.randomBytes(16).toString('hex');
          db.prepare('UPDATE classroom_students SET login_salt = ?, login_hash = ?, updated_at = ? WHERE id = ?')
            .run(salt, hashClassroomSecret(loginCode, salt), now, studentId);
        } else if (operation === 'archive') {
          db.prepare('UPDATE classroom_students SET archived_at = ?, disabled_at = ?, updated_at = ? WHERE id = ?')
            .run(now, now, now, studentId);
        } else {
          db.prepare('UPDATE classroom_students SET archived_at = NULL, disabled_at = NULL, updated_at = ? WHERE id = ?').run(now, studentId);
        }
        if (operation !== 'restore') {
          db.prepare('UPDATE classroom_student_sessions SET revoked_at = ? WHERE student_id = ? AND revoked_at IS NULL').run(now, studentId);
        }
        recordClassroomManagementAudit(db, 'teacher', teacher.id, auditAction, 'student', studentId, 'success');
        return { student, loginCode, archivedAt: operation === 'archive' ? now : null };
      }).immediate());
      if (result?.denied) return send(res, 401, JSON.stringify({ error: 'נדרשת כניסת מורה.' }));
      if (result?.authorization) return send(res, result.authorization.status, JSON.stringify({ error: result.authorization.error }));
      if (!result) return send(res, 404, JSON.stringify({ error: 'התלמיד/ה לא נמצא/ה בכיתה שלך.' }));
      if (operation === 'reset') {
        return send(res, 200, JSON.stringify({ ok: true, oneTime: true, student: { id: result.student.id, name: result.student.name, loginCode: result.loginCode } }));
      }
      return send(res, 200, JSON.stringify({ ok: true, student: { id: result.student.id, name: result.student.name, archivedAt: result.archivedAt } }));
    }

    if (action === 'classes' && segments[3] && segments[4] === 'students' && segments.length === 5) {
      const name = cleanText(body.name, 80);
      const classroomId = segments[3];
      const result = withSummerDb(db => db.transaction(() => {
        const teacher = requireCurrentClassroomTeacher(db, req);
        if (!teacher) return { denied: true };
        if (name.length < 2) {
          recordClassroomManagementAudit(db, 'teacher', teacher.id, 'student.create', 'student', 'new', 'invalid');
          return { invalid: true };
        }
        const authorization = requireCurrentTeacherClassroom(db, req, teacher.id, classroomId);
        if (authorization.status) return { authorization };
        const classroom = db.prepare('SELECT * FROM classrooms WHERE id = ? AND teacher_id = ?').get(classroomId, teacher.id);
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
        recordClassroomManagementAudit(db, 'teacher', teacher.id, 'student.create', 'student', student.id, 'success');
        return { student, loginCode };
      }).immediate());
      if (result?.denied) return send(res, 401, JSON.stringify({ error: 'נדרשת כניסת מורה.' }));
      if (result?.invalid) return send(res, 400, JSON.stringify({ error: 'נא למלא שם תלמיד/ה.' }));
      if (result?.authorization) return send(res, result.authorization.status, JSON.stringify({ error: result.authorization.error }));
      if (!result) return send(res, 404, JSON.stringify({ error: 'הכיתה לא נמצאה.' }));
      return send(res, 201, JSON.stringify({
        ok: true,
        student: { id: result.student.id, name: result.student.name, loginCode: result.loginCode, createdAt: result.student.created_at },
      }));
    }

    if (action === 'classes' && segments.length === 3) {
      const name = cleanText(body.name, 80);
      const courses = cleanClassroomCourses(body.courses);
      const result = withSummerDb(db => db.transaction(() => {
        const teacher = requireCurrentClassroomTeacher(db, req);
        if (!teacher) return { denied: true };
        if (name.length < 2) {
          recordClassroomManagementAudit(db, 'teacher', teacher.id, 'classroom.create', 'classroom', 'new', 'invalid');
          return { invalidName: true };
        }
        if (!courses?.length) {
          recordClassroomManagementAudit(db, 'teacher', teacher.id, 'classroom.create', 'classroom', 'new', 'invalid');
          return { invalidCourses: true };
        }
        if (!teacherCanAssignCourses(db, teacher.id, courses)) {
          recordClassroomManagementAudit(db, 'teacher', teacher.id, 'classroom.create', 'classroom', 'new', 'denied');
          return { forbidden: true };
        }
        const now = new Date().toISOString();
        const row = {
          id: crypto.randomUUID(), teacher_id: teacher.id, name,
          join_code: generateClassJoinCode(db), created_at: now, updated_at: now,
        };
        db.prepare(`INSERT INTO classrooms (id, teacher_id, name, join_code, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?)`)
          .run(row.id, row.teacher_id, row.name, row.join_code, row.created_at, row.updated_at);
        replaceClassroomCourses(db, row.id, courses);
        recordClassroomManagementAudit(db, 'teacher', teacher.id, 'classroom.create', 'classroom', row.id, 'success');
        return { classroom: row };
      }).immediate());
      if (result.denied) return send(res, 401, JSON.stringify({ error: 'נדרשת כניסת מורה.' }));
      if (result.invalidName) return send(res, 400, JSON.stringify({ error: 'נא למלא שם כיתה.' }));
      if (result.invalidCourses) return send(res, 400, JSON.stringify({ error: 'בחרו לפחות לומדה אחת תקינה לכיתה.' }));
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
      const sourceLimitKey = classroomSourceKey(req, 'teacher-login');
      const identityLimitKey = classroomIdentityKey('teacher-login', email);
      if (consumeClassroomLoginAttempts([sourceLimitKey, identityLimitKey])) {
        withSummerDb(db => db.transaction(() => {
          const teacher = db.prepare('SELECT id FROM classroom_teachers WHERE email = ?').get(email);
          db.prepare(`INSERT INTO classroom_credential_audit
            (id, actor_type, actor_id, action, target_type, target_id, outcome, occurred_at)
            VALUES (?, 'teacher', ?, 'login', 'teacher', ?, 'throttled', ?)`)
            .run(crypto.randomUUID(), teacher?.id || email || 'unknown', teacher?.id || 'unknown', new Date().toISOString());
        }).immediate());
        return send(res, 429, JSON.stringify({ error: 'יותר מדי ניסיונות. נסו שוב בעוד כמה דקות.' }));
      }
      const result = withSummerDb(db => db.transaction(() => {
        const teacher = db.prepare('SELECT * FROM classroom_teachers WHERE email = ? AND archived_at IS NULL AND disabled_at IS NULL').get(email);
        const provided = Buffer.from(hashClassroomSecret(password, teacher?.password_salt || DUMMY_CLASSROOM_TEACHER_SALT), 'hex');
        const expected = Buffer.from(teacher?.password_hash || DUMMY_CLASSROOM_TEACHER_HASH, 'hex');
        if (!teacher) {
          db.prepare(`INSERT INTO classroom_credential_audit
            (id, actor_type, actor_id, action, target_type, target_id, outcome, occurred_at)
            VALUES (?, 'teacher', ?, 'login', 'teacher', 'unknown', 'invalid', ?)`)
            .run(crypto.randomUUID(), email || 'unknown', new Date().toISOString());
          return null;
        }
        if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
          db.prepare(`INSERT INTO classroom_credential_audit
            (id, actor_type, actor_id, action, target_type, target_id, outcome, occurred_at)
            VALUES (?, 'teacher', ?, 'login', 'teacher', ?, 'invalid', ?)`)
            .run(crypto.randomUUID(), teacher.id, teacher.id, new Date().toISOString());
          return null;
        }
        const token = createClassroomTeacherSession(db, teacher.id);
        db.prepare(`INSERT INTO classroom_credential_audit
          (id, actor_type, actor_id, action, target_type, target_id, outcome, occurred_at)
          VALUES (?, 'teacher', ?, 'login', 'teacher', ?, 'success', ?)`)
          .run(crypto.randomUUID(), teacher.id, teacher.id, new Date().toISOString());
        return { teacher, token };
      }).immediate());
      if (!result) {
        const response = { error: 'מייל או סיסמה לא נכונים.' };
        if (process.env.NODE_ENV === 'test') response.testWorkFactor = 1;
        return send(res, 401, JSON.stringify(response));
      }
      clearClassroomLoginFailures(sourceLimitKey);
      clearClassroomLoginFailures(identityLimitKey);
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

    if (action === 'preview-demo-teacher-login') {
      const result = previewDemoTeacherLogin();
      if (!result) return send(res, CLASSROOM_PREVIEW_DEMO_TEACHER ? 401 : 404, JSON.stringify({ error: CLASSROOM_PREVIEW_DEMO_TEACHER ? 'Preview identity is inactive.' : 'Preview demo is not enabled.' }));
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

    if (action === 'preview-demo-student-login') {
      const result = previewDemoStudentLogin();
      if (!result) return send(res, CLASSROOM_PREVIEW_DEMO_TEACHER ? 401 : 404, JSON.stringify({ error: CLASSROOM_PREVIEW_DEMO_TEACHER ? 'Preview identity is inactive.' : 'Preview demo is not enabled.' }));
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
    console.error('classroom_api_error', {
      name: cleanText(error?.name || 'Error', 40),
      code: cleanText(error?.code || '', 60),
      message: cleanText(error?.message || 'request_failed', 160),
    });
    if (error instanceof SyntaxError) return send(res, 400, JSON.stringify({ error: 'גוף הבקשה אינו JSON תקין.' }));
    if (error?.message === 'payload_too_large') return send(res, 413, JSON.stringify({ error: 'גוף הבקשה גדול מדי.' }));
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

function matchesCraftomImageSignature(buffer, mime) {
  if (mime === 'image/png') {
    return buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  }
  if (mime === 'image/jpeg') {
    return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  if (mime === 'image/webp') {
    return buffer.length >= 12 && buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP';
  }
  return false;
}

function saveCraftomExitTicketImage(submissionId, attachment) {
  if (!attachment || !attachment.dataUrl) throw new Error('missing_photo');
  const match = String(attachment.dataUrl).match(/^data:(image\/(png|jpeg|jpg|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!match) throw new Error('invalid_attachment');
  const mime = match[1] === 'image/jpg' ? 'image/jpeg' : match[1];
  const subtype = match[2] === 'jpeg' ? 'jpg' : match[2];
  const buffer = Buffer.from(match[3], 'base64');
  if (!buffer.length || buffer.length > 5 * 1024 * 1024) throw new Error('attachment_too_large');
  if (!matchesCraftomImageSignature(buffer, mime)) throw new Error('invalid_attachment');
  fs.mkdirSync(CRAFTOM_EXIT_ATTACHMENTS_DIR, { recursive: true, mode: 0o700 });
  fs.chmodSync(CRAFTOM_EXIT_ATTACHMENTS_DIR, 0o700);
  const safeName = cleanText(attachment.name, 80).replace(/[^\w.א-ת-]+/g, '_') || `craftom.${subtype}`;
  const filename = `${submissionId}-${Date.now()}.${subtype}`;
  const fullPath = path.join(CRAFTOM_EXIT_ATTACHMENTS_DIR, filename);
  fs.writeFileSync(fullPath, buffer, { mode: 0o600 });
  return {
    path: filename,
    name: safeName,
    mime,
    size: buffer.length,
  };
}

function craftomSubmissionPublic(row, viewer = 'student') {
  if (!row) return null;
  return {
    id: row.id,
    courseId: row.course_id,
    classroomId: viewer === 'teacher' ? row.classroom_id : undefined,
    studentId: viewer === 'teacher' ? row.student_id : undefined,
    studentName: viewer === 'teacher' ? row.student_name : undefined,
    lessonId: Number(row.lesson_id),
    challengeId: row.challenge_id === null || row.challenge_id === undefined ? null : Number(row.challenge_id),
    lessonTitle: row.lesson_title,
    challengeTitle: row.challenge_title,
    exitQuestion: row.exit_question,
    exitAnswer: row.exit_answer,
    photo: {
      url: `/api/craftom/submissions/${encodeURIComponent(row.id)}/photo`,
      name: row.image_name,
      mime: row.image_mime,
      size: row.image_size,
    },
    replaced: Number(row.replacement_count || 0) > 0,
    replacementCount: Number(row.replacement_count || 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function getCraftomSubmissionPhotoPath(row) {
  const filename = path.basename(String(row?.image_path || ''));
  if (!filename || filename !== row.image_path) return null;
  const fullPath = path.join(CRAFTOM_EXIT_ATTACHMENTS_DIR, filename);
  if (!fullPath.startsWith(CRAFTOM_EXIT_ATTACHMENTS_DIR + path.sep)) return null;
  return fullPath;
}

function recordClassroomProgress(db, studentId, courseId, lessonId, activityId, status, score, metadata = {}) {
  const now = new Date().toISOString();
  const existing = db.prepare(`
    SELECT * FROM classroom_progress
    WHERE student_id = ? AND course_id = ? AND lesson_id = ? AND activity_id = ?
  `).get(studentId, courseId, String(lessonId), activityId);
  const metadataJson = JSON.stringify(metadata).slice(0, 4000);
  if (existing) {
    db.prepare(`
      UPDATE classroom_progress SET
        status = ?, score = ?, attempts = attempts + 1, metadata_json = ?,
        completed_at = CASE WHEN ? = 'completed' THEN COALESCE(completed_at, ?) ELSE completed_at END,
        updated_at = ?
      WHERE id = ?
    `).run(status, score, metadataJson, status, now, now, existing.id);
    return db.prepare('SELECT * FROM classroom_progress WHERE id = ?').get(existing.id);
  }
  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO classroom_progress (
      id, student_id, course_id, lesson_id, activity_id, status, score, attempts,
      metadata_json, started_at, completed_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?)
  `).run(id, studentId, courseId, String(lessonId), activityId, status, score, metadataJson, now, status === 'completed' ? now : null, now);
  return db.prepare('SELECT * FROM classroom_progress WHERE id = ?').get(id);
}

async function handleCraftomApi(req, res) {
  const url = requestUrl(req);
  const pathname = url.pathname;
  try {
    const posterMatch = pathname.match(/^\/api\/craftom\/challenge-posters\/([^/]+\.webp)$/);
    if ((req.method === 'GET' || req.method === 'HEAD') && posterMatch) {
      const filename = path.basename(decodeURIComponent(posterMatch[1]));
      if (filename !== decodeURIComponent(posterMatch[1])) return send(res, 400, JSON.stringify({ error: 'Invalid poster.' }));
      const fullPath = path.join(ROOT, 'assets', 'craftom', 'challenges', filename);
      const allowedDir = path.join(ROOT, 'assets', 'craftom', 'challenges');
      if (!fullPath.startsWith(allowedDir + path.sep) || !fs.existsSync(fullPath)) return send(res, 404, JSON.stringify({ error: 'Poster not found.' }));
      const stat = fs.statSync(fullPath);
      res.writeHead(200, {
        'Content-Type': 'image/webp',
        'Content-Length': stat.size,
        'Cache-Control': 'public, max-age=14400',
        'X-Content-Type-Options': 'nosniff',
      });
      if (req.method === 'HEAD') return res.end();
      return fs.createReadStream(fullPath).pipe(res);
    }

    const photoMatch = pathname.match(/^\/api\/craftom\/submissions\/([^/]+)\/photo$/);
    if ((req.method === 'GET' || req.method === 'HEAD') && photoMatch) {
      const id = decodeURIComponent(photoMatch[1]);
      const student = getClassroomStudentFromRequest(req);
      const teacher = getClassroomTeacherFromRequest(req);
      if (!student && !teacher) return send(res, 401, JSON.stringify({ error: 'נדרשת כניסה.' }));
      const row = withSummerDb(db => {
        if (student) {
          return db.prepare('SELECT * FROM craftom_lesson_submissions WHERE id = ? AND student_id = ?').get(id, student.id);
        }
        return db.prepare(`
          SELECT s.* FROM craftom_lesson_submissions s
          JOIN classrooms c ON c.id = s.classroom_id
          WHERE s.id = ? AND c.teacher_id = ?
        `).get(id, teacher.id);
      });
      if (!row) return send(res, 404, JSON.stringify({ error: 'התמונה לא נמצאה.' }));
      if (student) {
        const context = getStudentKugelClass(req);
        if (context.status) return send(res, context.status, JSON.stringify({ error: context.error }));
      } else {
        const context = getTeacherKugelClass(req, row.classroom_id);
        if (context.status) return send(res, context.status, JSON.stringify({ error: context.error }));
      }
      const fullPath = getCraftomSubmissionPhotoPath(row);
      if (!fullPath || !fs.existsSync(fullPath)) return send(res, 404, JSON.stringify({ error: 'קובץ התמונה לא נמצא.' }));
      res.writeHead(200, {
        'Content-Type': row.image_mime,
        'Content-Length': fs.statSync(fullPath).size,
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
        'Content-Disposition': `inline; filename="${encodeURIComponent(row.image_name || 'craftom-work')}"`,
      });
      if (req.method === 'HEAD') return res.end();
      return fs.createReadStream(fullPath).pipe(res);
    }

    if (req.method === 'GET' && pathname === '/api/craftom/submissions') {
      const lessonId = cleanText(url.searchParams.get('lessonId'), 10);
      const classroomId = cleanText(url.searchParams.get('classroomId'), 80);
      const student = getClassroomStudentFromRequest(req);
      const teacher = getClassroomTeacherFromRequest(req);
      if (!student && !teacher) return send(res, 401, JSON.stringify({ error: 'נדרשת כניסה.' }));
      const lessonNumber = lessonId === '' ? null : Number(lessonId);
      if (lessonNumber !== null && (!Number.isInteger(lessonNumber) || lessonNumber < 0 || lessonNumber > 16)) {
        return send(res, 400, JSON.stringify({ error: 'מספר השיעור אינו תקין.' }));
      }
      if (student) {
        const context = getStudentKugelClass(req);
        if (context.status) return send(res, context.status, JSON.stringify({ error: context.error }));
        const rows = withSummerDb(db => db.prepare(`
          SELECT s.* FROM craftom_lesson_submissions s
          WHERE s.student_id = ? AND (? = '' OR s.lesson_id = ?)
          ORDER BY s.lesson_id, s.updated_at DESC
        `).all(context.student.id, lessonId, lessonNumber));
        return send(res, 200, JSON.stringify({ ok: true, role: 'student', submissions: rows.map(row => craftomSubmissionPublic(row, 'student')) }));
      }
      if (teacher) {
        if (!classroomId) return send(res, 400, JSON.stringify({ error: 'חסר מזהה כיתה.' }));
        const context = getTeacherKugelClass(req, classroomId);
        if (context.status) return send(res, context.status, JSON.stringify({ error: context.error }));
        const rows = withSummerDb(db => db.prepare(`
          SELECT s.*, cs.name AS student_name
          FROM craftom_lesson_submissions s
          JOIN classroom_students cs ON cs.id = s.student_id
          WHERE s.classroom_id = ? AND (? = '' OR s.lesson_id = ?)
          ORDER BY s.lesson_id, cs.created_at, s.updated_at DESC
        `).all(context.classroom.id, lessonId, lessonNumber));
        return send(res, 200, JSON.stringify({ ok: true, role: 'teacher', submissions: rows.map(row => craftomSubmissionPublic(row, 'teacher')) }));
      }
    }

    if (req.method === 'POST' && pathname === '/api/craftom/exit-ticket') {
      const studentContext = getStudentKugelClass(req);
      if (studentContext.status) return send(res, studentContext.status, JSON.stringify({ error: studentContext.error }));
      const raw = await readBody(req, 7 * 1024 * 1024);
      const body = JSON.parse(raw || '{}');
      const lessonId = Number(cleanText(body.lessonId, 10));
      const challengeId = Number(cleanText(body.challengeId, 10));
      const lessonTitle = cleanText(body.lessonTitle, 180);
      const challengeTitle = cleanText(body.challengeTitle, 180);
      const exitQuestion = cleanText(body.exitQuestion, 1000);
      const answer = cleanText(body.answer, 3000);

      if (!Number.isInteger(lessonId) || lessonId < 0 || lessonId > 16) return send(res, 400, JSON.stringify({ error: 'מספר השיעור אינו תקין.' }));
      if (body.challengeId !== undefined && (!Number.isInteger(challengeId) || challengeId < 1 || challengeId > 4)) return send(res, 400, JSON.stringify({ error: 'מספר האתגר אינו תקין.' }));
      if (answer.length < 3) return send(res, 400, JSON.stringify({ error: 'נא לכתוב תשובה קצרה לכרטיס היציאה.' }));
      if (lessonId > 0 && !withSummerDb(db => classroomStudentCanAccessCraftomLesson(db, studentContext.student, lessonId))) {
        return send(res, 423, JSON.stringify({ error: 'השיעור הזה עדיין לא נפתח לכיתה על ידי המורה.' }));
      }

      const id = crypto.randomUUID();
      const photo = saveCraftomExitTicketImage(id, body.photo);
      const now = new Date().toISOString();
      let previousPhotoPath = null;
      let saved;
      try {
        saved = withSummerDb(db => db.transaction(() => {
          const authorization = requireCurrentActiveStudent(
            db, req, studentContext.student.id, studentContext.classroom.id,
          );
          if (authorization.status) {
            const error = new Error(authorization.error);
            error.statusCode = authorization.status;
            throw error;
          }
          if (
            !teacherHasCourse(db, authorization.student.teacher_id, KUGEL_COURSE_ID)
            || !classroomHasCourse(db, studentContext.classroom.id, KUGEL_COURSE_ID)
          ) {
            const error = new Error('הרשאת אקדמיית ה-Agent הוסרה בזמן ההגשה.');
            error.statusCode = 409;
            throw error;
          }
          const existing = db.prepare(`
            SELECT * FROM craftom_lesson_submissions
            WHERE student_id = ? AND course_id = ? AND lesson_id = ?
          `).get(studentContext.student.id, KUGEL_COURSE_ID, lessonId);
          if (existing) {
            previousPhotoPath = getCraftomSubmissionPhotoPath(existing);
            db.prepare(`
              UPDATE craftom_lesson_submissions SET
                classroom_id = ?, challenge_id = ?, lesson_title = ?, challenge_title = ?,
                exit_question = ?, exit_answer = ?, image_path = ?, image_name = ?,
                image_mime = ?, image_size = ?, replacement_count = replacement_count + 1,
                updated_at = ?
              WHERE id = ?
            `).run(
              studentContext.classroom.id, Number.isInteger(challengeId) ? challengeId : null,
              lessonTitle, challengeTitle, exitQuestion, answer, photo.path, photo.name,
              photo.mime, photo.size, now, existing.id,
            );
            recordClassroomProgress(db, studentContext.student.id, KUGEL_COURSE_ID, lessonId, 'exit-ticket', 'completed', 100, { submissionId: existing.id });
            return db.prepare('SELECT * FROM craftom_lesson_submissions WHERE id = ?').get(existing.id);
          }
          db.prepare(`
            INSERT INTO craftom_lesson_submissions (
              id, classroom_id, student_id, course_id, lesson_id, challenge_id,
              lesson_title, challenge_title, exit_question, exit_answer,
              image_path, image_name, image_mime, image_size, replacement_count,
              created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
          `).run(
            id, studentContext.classroom.id, studentContext.student.id, KUGEL_COURSE_ID, lessonId,
            Number.isInteger(challengeId) ? challengeId : null, lessonTitle, challengeTitle,
            exitQuestion, answer, photo.path, photo.name, photo.mime, photo.size, now, now,
          );
          recordClassroomProgress(db, studentContext.student.id, KUGEL_COURSE_ID, lessonId, 'exit-ticket', 'completed', 100, { submissionId: id });
          return db.prepare('SELECT * FROM craftom_lesson_submissions WHERE id = ?').get(id);
        }).immediate());
      } catch (error) {
        const unsavedPhotoPath = getCraftomSubmissionPhotoPath({ image_path: photo.path });
        if (unsavedPhotoPath) fs.rmSync(unsavedPhotoPath, { force: true });
        throw error;
      }
      const savedPhotoPath = getCraftomSubmissionPhotoPath(saved);
      if (previousPhotoPath && previousPhotoPath !== savedPhotoPath) {
        try {
          fs.rmSync(previousPhotoPath, { force: true });
        } catch (error) {
          console.error('craftom_submission_old_photo_cleanup_error', error);
        }
      }
      return send(res, 201, JSON.stringify({ ok: true, id: saved.id, submission: craftomSubmissionPublic(saved, 'student') }));
    }

    return send(res, 404, JSON.stringify({ error: 'Not found' }));
  } catch (error) {
    const status = Number(error.statusCode)
      || (error.message === 'payload_too_large' || error.message === 'attachment_too_large' ? 413 : 400);
    const messages = {
      missing_photo: 'חובה לצרף תמונה של מה שבניתם במיינקראפט.',
      invalid_attachment: 'אפשר להעלות רק תמונת PNG, JPG או WebP.',
      attachment_too_large: 'התמונה גדולה מדי. אפשר להעלות תמונה עד 5MB.',
      payload_too_large: 'ההגשה גדולה מדי. אפשר להעלות תמונה עד 5MB.',
    };
    return send(res, status, JSON.stringify({ error: messages[error.message] || (error.statusCode ? error.message : 'לא הצלחנו לשמור את כרטיס היציאה.') }));
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
  '/classroom-student.html',
  '/teacher-classrooms.html',
  '/classroom-admin.html',
  '/thankyou.html',
  '/about.html',
  '/craftom-school/docs/craftom-submissions-summary-2026-09-10.html',
  '/sisi.html',
  '/lumi.html',
  '/lumi-play.html',
  '/omer-future-craftom.html',
  '/omer-future-craftom-challenge.html',
  '/omer-future-craftom-students.html',
  '/omer-future-craftom-slides.html',
  '/omer-future-craftom-improvement.html',
  '/cyber-city-academy.html',
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
  const lessonZeroRequired = options.lessonZeroRequired === true;
  const lessonAccessRequired = options.lessonAccessRequired === true;
  const title = teacherRestricted
    ? 'הלומדה לא הוקצתה למורה'
    : lessonAccessRequired
    ? 'השיעור עדיין לא נפתח לכיתה'
    : lessonZeroRequired
    ? 'שיעור 1 עדיין נעול'
    : classroomRestricted
    ? 'הלומדה לא פתוחה לכיתה הזו'
    : trialOnly
    ? 'נרשמים לפני שמתחילים ללמוד'
    : (loggedIn ? 'התוכן הזה נעול למנויים' : 'צריך להתחבר כדי להמשיך');
  const subtitle = teacherRestricted
    ? 'מנהלת המערכת יכולה לפתוח את הלומדה למורה. לאחר מכן המורה תוכל לשייך אותה לכיתות לפי הצורך.'
    : lessonAccessRequired
    ? 'המורה פותחת את השיעורים לפי הסדר. כשהשיעור הזה ייפתח, הוא יופיע לתלמידים בלומדה.'
    : lessonZeroRequired
    ? 'כדי לעבור לשיעור 1 צריך להשלים קודם את שיעור 0 במיינקראפט. לאחר השלמה מסודרת השיעור הבא ייפתח לתלמיד/ה.'
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
    *{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;font-family:Rubik,Arial,sans-serif;direction:rtl;color:#102033;background:radial-gradient(circle at 15% 10%,#dbeafe,transparent 28%),radial-gradient(circle at 85% 8%,#fef3c7,transparent 28%),linear-gradient(135deg,#f8fafc,#eef2ff)}.locked-wrap{min-height:100vh;display:grid;place-items:center;padding:34px 0}.card{width:min(620px,calc(100% - 28px));background:rgba(255,255,255,.96);border:1px solid #e6edf7;border-radius:34px;padding:34px;box-shadow:0 28px 90px rgba(15,23,42,.16);text-align:center}.lock{width:96px;height:96px;margin:0 auto 18px;border-radius:32px;display:grid;place-items:center;font-size:3rem;background:linear-gradient(135deg,#2563eb,#7c3aed);box-shadow:0 18px 44px rgba(37,99,235,.28)}h1{font-size:clamp(2rem,5vw,3.2rem);line-height:1.05;margin:0 0 12px;letter-spacing:-.04em}p{margin:0;color:#526070;font-size:1.12rem}.locked-label{margin:18px auto 0;padding:10px 14px;border-radius:999px;background:#f1f5f9;color:#475569;display:inline-block;font-weight:900}.actions{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:26px}.btn{display:inline-flex;align-items:center;justify-content:center;border-radius:999px;padding:14px 22px;text-decoration:none;font-weight:900}.primary{background:#0f172a;color:#fff}.purchase{background:linear-gradient(135deg,#16a34a,#22c55e);color:#fff;box-shadow:0 16px 36px rgba(22,163,74,.24)}.alt{background:#fff;color:#0f172a;border:1px solid #dbe3ef}.note{margin-top:18px;border:1px solid #bbf7d0;background:#f0fdf4;color:#166534;border-radius:18px;padding:12px 14px;font-weight:800}@media(max-width:560px){.card{padding:26px 20px}.actions .btn{width:100%}}
  </style>
</head>
<body>
  <div class="locked-wrap">
  <main class="card">
    <div class="lock">🔒</div>
    <h1>${title}</h1>
    <p>${subtitle}</p>
    <div class="locked-label">${teacherRestricted ? 'גישה לפי הרשאת המנהלת' : (lessonAccessRequired ? 'ייפתח על ידי המורה' : (lessonZeroRequired ? 'נפתח אחרי השלמת שיעור 0' : (classroomRestricted ? 'גישה לפי הגדרת הכיתה' : (trialOnly ? '3 שיעורים חינם אחרי הרשמה' : 'השיעור הזה נפתח אחרי הפעלת מנוי לילד/ה'))))}</div>
    <div class="actions">
      ${classroomRestricted || lessonZeroRequired || lessonAccessRequired
        ? `<a class="btn primary" href="${lessonZeroRequired || lessonAccessRequired ? 'kugel-student.html' : (options.teacher ? 'teacher-classrooms.html' : 'classroom-entry.html')}">${lessonZeroRequired || lessonAccessRequired ? 'חזרה ללומדה' : (teacherRestricted ? 'חזרה ללומדות שלי' : 'חזרה ללומדות הכיתה')}</a>`
        : `${trialOnly ? '' : '<a class="btn purchase" href="https://mrng.to/fZiL2SITRp">הפעלת מנוי</a>'}<a class="btn primary" href="register.html">הרשמה</a><a class="btn alt" href="login.html">כניסה</a>`}
    </div>
    <div class="note">${teacherRestricted ? 'רק מנהלת המערכת יכולה לשנות את רשימת הלומדות של המורה.' : (lessonAccessRequired ? 'שיעור 0 פתוח תמיד. שאר השיעורים נפתחים לכיתה על ידי המורה לפי סדר.' : (lessonZeroRequired ? 'המורה יכולה לעקוב אחרי ההתקדמות של שיעור 0 ממסך ניהול הכיתה.' : (classroomRestricted ? 'רק המורה של הכיתה יכול/ה לשנות את רשימת הלומדות.' : (trialOnly ? 'ההרשמה פותחת 3 שיעורי חשיבה ותכנות בחינם עם סיסי ושומרת את ההתקדמות לילד/ה.' : 'כדי לפתוח את כל הלומדות צריך מנוי פעיל לילד/ה הספציפי/ת.'))))}</div>
  </main>
  </div>
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

function requiresCraftomLessonZeroCompletion(pathname, url) {
  const normalized = String(pathname || '').toLowerCase();
  const basename = path.basename(normalized, path.extname(normalized));
  if (/^craftom-minecraft-lesson-(?:[1-9]|1[0-6])$/.test(basename)) return true;
  if (basename === 'craftom-agent-academy') return true;
  if (basename === 'craftom-minecraft-challenge' || basename === 'craftom-minecraft-students') return true;
  if (basename === 'craftom-minecraft' || basename === 'craftom-minecraft-lesson') return true;
  if (normalized === '/craftom-school/preview/index.html') return true;
  const lesson = Number(url.searchParams.get('lesson') || url.searchParams.get('challenge') || url.searchParams.get('mission') || 0);
  return Number.isInteger(lesson) && lesson >= 1;
}

function craftomLessonIdForPath(pathname, url) {
  const normalized = String(pathname || '').toLowerCase();
  const basename = path.basename(normalized, path.extname(normalized));
  if (basename === 'kugel-student') return 0;
  const direct = basename.match(/^craftom-minecraft-lesson-([1-9]|1[0-6])$/);
  if (direct) return Number(direct[1]);
  const lesson = Number(url.searchParams.get('lesson') || url.searchParams.get('mission') || 0);
  if (Number.isInteger(lesson) && lesson >= 1 && lesson <= 16) return lesson;
  const challenge = Number(url.searchParams.get('challenge') || 0);
  if (Number.isInteger(challenge) && challenge >= 1 && challenge <= 4) return ((challenge - 1) * 4) + 1;
  if (basename === 'craftom-agent-academy' || normalized === '/craftom-school/preview/index.html') return 0;
  if (basename === 'craftom-minecraft' || basename === 'craftom-minecraft-lesson' || basename === 'craftom-minecraft-challenge' || basename === 'craftom-minecraft-students') return 1;
  return null;
}

function craftomOpenedLessonIds(db, classroomId) {
  const rows = db.prepare(`
    SELECT lesson_id FROM classroom_lesson_access
    WHERE classroom_id = ? AND course_id = ? AND status = 'open'
  `).all(classroomId, KUGEL_COURSE_ID);
  return new Set([0, ...rows.map(row => Number(row.lesson_id)).filter(Number.isInteger)]);
}

function nextCraftomLessonToOpen(opened) {
  for (let lessonId = 1; lessonId <= 16; lessonId += 1) {
    if (!opened.has(lessonId)) return lessonId;
  }
  return null;
}

function buildCraftomLessonAccess(db, classroomId) {
  const opened = craftomOpenedLessonIds(db, classroomId);
  const nextLessonId = nextCraftomLessonToOpen(opened);
  const lessons = Object.values(KUGEL_MINECRAFT_LESSONS).map(lesson => {
    const lessonId = Number(lesson.id);
    return {
      ...kugelLessonPublic(lesson),
      open: lessonId === 0 || opened.has(lessonId),
      nextToOpen: lessonId === nextLessonId,
      teacherOpen: true,
    };
  });
  return {
    courseId: KUGEL_COURSE_ID,
    openedLessonIds: [...opened].sort((a, b) => a - b),
    nextLessonId,
    allOpen: nextLessonId === null,
    lessons,
  };
}

function classroomStudentCanAccessCraftomLesson(db, student, lessonId) {
  if (!student || !Number.isInteger(Number(lessonId))) return false;
  if (Number(lessonId) === 0) return true;
  if (isPreviewDemoStudent(student)) return true;
  return craftomOpenedLessonIds(db, student.classroom_id).has(Number(lessonId));
}

function classroomStudentCompletedCraftomLessonZero(studentId) {
  return Boolean(withSummerDb(db => db.prepare(`
    SELECT 1 FROM classroom_progress
    WHERE student_id = ? AND course_id = ? AND lesson_id = '0'
      AND activity_id = 'minecraft-maze' AND status = 'completed'
    LIMIT 1
  `).get(studentId, KUGEL_COURSE_ID)));
}

function replaceLastHtmlTag(html, tag, replacement) {
  const index = html.lastIndexOf(tag);
  if (index === -1) return html;
  return html.slice(0, index) + replacement + html.slice(index + tag.length);
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
  return replaceLastHtmlTag(injectHeadAssets(html), '</body>', '  <script src="/js/user-badge.js?v=20260910-compact-teacher-badge-1"></script>\n</body>');
}

function injectClassroomSession(html) {
  if (!html.includes('</body>') || html.includes('js/classroom-session.js') || html.includes('js/classroom-platform.js')) return html;
  return replaceLastHtmlTag(html, '</body>', '  <script src="/js/classroom-session.js?v=20260905-access-modes-1"></script>\n</body>');
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
  if (pathname === '/craftom-school/preview/') pathname = '/craftom-school/preview/index.html';
  if (pathname === '/thankyou') pathname = '/thankyou.html';
  const filePath = path.normalize(path.join(ROOT, pathname));
  if (!filePath.startsWith(ROOT + path.sep)) return send(res, 403, 'Forbidden', 'text/plain; charset=utf-8');
  if (filePath === DATA_DIR || filePath.startsWith(DATA_DIR + path.sep)) return send(res, 403, 'Forbidden', 'text/plain; charset=utf-8');
  const ext = path.extname(filePath).toLowerCase();

  const subscriptionGateEnabled = subscriptionGateEnabledForRequest(req);
  const profile = subscriptionGateEnabled ? getSummerProfileFromRequest(req) : null;
  const classroomStudent = subscriptionGateEnabled ? getClassroomStudentFromRequest(req) : null;
  const classroomTeacher = subscriptionGateEnabled && !classroomStudent ? getClassroomTeacherFromRequest(req) : null;
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

  if (subscriptionGateEnabled && ext === '.html' && classroomCourse && classroomIdentity && !classroomAuthorized) {
    return send(res, 402, lockedPage(pathname, null, { classroomRestricted: true, teacher: Boolean(classroomTeacher) }), 'text/html; charset=utf-8');
  }

  if (
    subscriptionGateEnabled
    && ext === '.html'
    && classroomStudent
    && classroomCourse === KUGEL_COURSE_ID
    && classroomAuthorized
    && requiresCraftomLessonZeroCompletion(pathname, url)
    && !isPreviewDemoStudent(classroomStudent)
    && !withSummerDb(db => classroomStudentCanAccessCraftomLesson(
      db,
      classroomStudent,
      craftomLessonIdForPath(pathname, url) || 1,
    ))
  ) {
    if (String(pathname || '').toLowerCase() === '/craftom-school/preview/index.html') {
      res.writeHead(302, {
        Location: '/kugel-student.html',
        'Cache-Control': 'no-store',
      });
      res.end();
      return;
    }
    return send(res, 423, lockedPage(pathname, null, { lessonAccessRequired: true }), 'text/html; charset=utf-8');
  }

  if (subscriptionGateEnabled && ext === '.html' && isFreeTrialLearningHtml(pathname, url) && !profile && !classroomAuthorized) {
    return send(res, 401, lockedPage(pathname, null, { trialOnly: true }), 'text/html; charset=utf-8');
  }

  if (subscriptionGateEnabled && ext === '.html' && isFreeTrialLearningHtml(pathname, url) && profile && profileAccessList(profile).some(item => item.startsWith('restrict:')) && !isPaidProfile(profile, pathname) && !classroomAuthorized) {
    return send(res, 402, lockedPage(pathname, profile && profile.user), 'text/html; charset=utf-8');
  }

  if (subscriptionGateEnabled && requiresPaidAccess(pathname, ext, url)) {
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

// Fail before schema access or HTTP readiness when production identity configuration drifts.
verifyClassroomCredentialConfiguration();
verifyKugelProductionConfiguration();
// Run all schema creation, migrations, and integrity checks before accepting traffic.
withSummerDb(() => {});

const server = http.createServer((req, res) => {
  if (process.env.NODE_ENV === 'production' && KUGEL_MONITOR_API_URL) {
    const forwardedProtocol = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim().toLowerCase();
    if (forwardedProtocol !== 'https') {
      return send(res, 426, JSON.stringify({ error: 'HTTPS required' }));
    }
  }
  if (req.url.startsWith('/english-buddy')) return proxyEnglishBuddy(req, res);
  const guideVideoMatch = requestUrl(req).pathname.match(/^\/api\/sensi\/guide-videos\/lesson-(\d+)$/);
  if (guideVideoMatch) return serveSensiGuideVideo(req, res, Number(guideVideoMatch[1]));
  if (req.url.startsWith('/api/admin/feedback')) return handleAdminFeedback(req, res);
  if (req.url.startsWith('/api/craftom/')) return handleCraftomApi(req, res);
  if (req.url.startsWith('/api/feedback')) return handleFeedback(req, res);
  if (req.url.startsWith('/api/summer/')) return handleSummerAuth(req, res);
  if (req.url.startsWith('/api/classroom/')) return handleClassroomApi(req, res);
  if (req.url.startsWith('/api/internal/minecraft/')) return handleKugelInternalMinecraftApi(req, res);
  if (req.url.startsWith('/api/kugel/')) return handleKugelApi(req, res);
  if (req.url.startsWith('/api/progress')) return handleStudentProgress(req, res);
  return serveStatic(req, res);
});

reconcileKugelWorldLeases().finally(() => {
  const listenHost = process.env.NODE_ENV === 'production' && KUGEL_MONITOR_API_URL ? '127.0.0.1' : '0.0.0.0';
  server.listen(PORT, listenHost, () => {
    ensureAdminToken();
    console.log(`Robotics15 server listening on http://${listenHost}:${PORT}`);
  });
  const reconciliationTimer = setInterval(() => {
    reconcileKugelWorldLeases({ respectGrace: true }).catch(error => {
      console.error('kugel_periodic_reconciliation_error', { message: error.message });
    });
  }, KUGEL_RECONCILE_INTERVAL_MS);
  reconciliationTimer.unref();
});
