#!/usr/bin/env node
'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const ROOT = path.resolve(__dirname, '..');
const DEFAULT_DB = process.env.ROBOTICS_DB_FILE
  || path.join(process.env.ROBOTICS_DATA_DIR || path.join(ROOT, 'data'), 'summer-subscriptions.sqlite');
const COURSE_ID = 'craftom-agent';
const REQUIRED_COLUMNS = [
  'classroom',
  'classroom_code',
  'teacher',
  'teacher_email',
  'student_name',
  'minecraft_upn',
  'minecraft_player',
  'lomda_login_code',
  'status',
];

function usage(exitCode = 0) {
  const stream = exitCode === 0 ? process.stdout : process.stderr;
  stream.write(`Usage:
  node tools/import-classroom-credentials.js <credentials.csv> [options]

Options:
  --db <path>                     SQLite DB path. Defaults to ROBOTICS_DB_FILE or data/summer-subscriptions.sqlite.
  --teacher-password <password>   Password to set only when the teacher does not exist.
  --dry-run                       Validate and summarize without writing to the DB.
  --trust-minecraft-identities    Mark CSV minecraft_upn/player pairs as verified in the classroom DB.
  --help                          Show this help.

Notes:
  - The importer never stores minecraft_password from the CSV.
  - Student lomda_login_code values are stored as salted hashes, not plaintext.
  - Existing teachers keep their current password.
`);
  process.exit(exitCode);
}

function parseArgs(argv) {
  const args = {
    csvPath: '',
    dbPath: DEFAULT_DB,
    dryRun: false,
    teacherPassword: '',
    trustMinecraftIdentities: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--help' || arg === '-h') usage(0);
    if (arg === '--dry-run') {
      args.dryRun = true;
    } else if (arg === '--trust-minecraft-identities') {
      args.trustMinecraftIdentities = true;
    } else if (arg === '--db') {
      args.dbPath = argv[++index] || '';
    } else if (arg === '--teacher-password') {
      args.teacherPassword = argv[++index] || '';
    } else if (arg.startsWith('--')) {
      throw new Error(`Unknown option: ${arg}`);
    } else if (!args.csvPath) {
      args.csvPath = arg;
    } else {
      throw new Error(`Unexpected argument: ${arg}`);
    }
  }
  if (!args.csvPath) usage(1);
  if (!args.dbPath) throw new Error('Missing DB path.');
  return args;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = '';
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (quoted) {
      if (char === '"' && next === '"') {
        value += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        value += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(value);
      value = '';
    } else if (char === '\n') {
      row.push(value);
      if (row.some(cell => cell !== '')) rows.push(row);
      row = [];
      value = '';
    } else if (char !== '\r') {
      value += char;
    }
  }
  row.push(value);
  if (row.some(cell => cell !== '')) rows.push(row);
  if (!rows.length) return [];
  const header = rows[0].map(cell => cell.trim());
  return rows.slice(1).map((cells, rowIndex) => {
    const record = { __line: rowIndex + 2 };
    for (let index = 0; index < header.length; index += 1) {
      record[header[index]] = String(cells[index] || '').trim();
    }
    return record;
  });
}

function hashClassroomSecret(secret, salt) {
  return crypto.scryptSync(String(secret || ''), salt, 64).toString('hex');
}

function cleanEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function requireConsistent(rows, field) {
  const values = [...new Set(rows.map(row => row[field]))];
  if (values.length !== 1) throw new Error(`CSV must contain one ${field}; found ${values.length}.`);
  return values[0];
}

function validateRows(rows, trustMinecraftIdentities) {
  if (!rows.length) throw new Error('CSV contains no student rows.');
  for (const column of REQUIRED_COLUMNS) {
    if (!(column in rows[0])) throw new Error(`Missing required column: ${column}`);
  }

  const activeRows = rows.filter(row => row.status === 'active');
  if (!activeRows.length) throw new Error('CSV contains no active students.');
  for (const row of activeRows) {
    for (const column of REQUIRED_COLUMNS) {
      if (!row[column]) throw new Error(`Line ${row.__line}: missing ${column}.`);
    }
    if (!/^[A-Z0-9]{6}$/.test(row.lomda_login_code)) {
      throw new Error(`Line ${row.__line}: lomda_login_code must be 6 uppercase letters/digits.`);
    }
    if (!/^[A-Z0-9]{6}$/.test(row.classroom_code)) {
      throw new Error(`Line ${row.__line}: classroom_code must be 6 uppercase letters/digits.`);
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(row.teacher_email)) {
      throw new Error(`Line ${row.__line}: invalid teacher_email.`);
    }
    if (trustMinecraftIdentities && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(row.minecraft_upn)) {
      throw new Error(`Line ${row.__line}: invalid minecraft_upn.`);
    }
    if (trustMinecraftIdentities && !/^[A-Za-z0-9_]{2,32}$/.test(row.minecraft_player)) {
      throw new Error(`Line ${row.__line}: invalid minecraft_player.`);
    }
  }

  for (const field of ['student_name', 'lomda_login_code', 'minecraft_upn', 'minecraft_player']) {
    const seen = new Map();
    for (const row of activeRows) {
      const value = String(row[field] || '').toLowerCase();
      if (!value) continue;
      if (seen.has(value)) throw new Error(`Duplicate ${field}: ${row[field]} on lines ${seen.get(value)} and ${row.__line}.`);
      seen.set(value, row.__line);
    }
  }

  return activeRows;
}

function tableExists(db, name) {
  return Boolean(db.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?").get(name));
}

function ensureSchema(db) {
  for (const table of ['classroom_teachers', 'teacher_courses', 'classrooms', 'classroom_courses', 'classroom_students', 'classroom_minecraft_identities']) {
    if (!tableExists(db, table)) throw new Error(`DB is missing ${table}. Start the app once to run migrations, or pass the correct --db path.`);
  }
}

function upsertCourse(db, table, idColumn, idValue, courseId, now) {
  db.prepare(`INSERT OR IGNORE INTO ${table} (${idColumn}, course_id, created_at) VALUES (?, ?, ?)`)
    .run(idValue, courseId, now);
}

function importRows(rows, args) {
  const teacherEmail = cleanEmail(requireConsistent(rows, 'teacher_email'));
  const teacherName = requireConsistent(rows, 'teacher');
  const classroomName = requireConsistent(rows, 'classroom');
  const classroomCode = requireConsistent(rows, 'classroom_code');
  const now = new Date().toISOString();
  const teacherPassword = args.teacherPassword || crypto.randomBytes(18).toString('base64url');

  if (args.dryRun) {
    return {
      dryRun: true,
      dbPath: args.dbPath,
      classroomName,
      classroomCode,
      teacherName,
      teacherEmail,
      students: rows.length,
      trustMinecraftIdentities: args.trustMinecraftIdentities,
      storesMinecraftPasswords: false,
    };
  }

  const db = new Database(args.dbPath);
  try {
    ensureSchema(db);
    const result = db.transaction(() => {
      let teacher = db.prepare('SELECT * FROM classroom_teachers WHERE email = ?').get(teacherEmail);
      let teacherCreated = false;
      if (!teacher) {
        const salt = crypto.randomBytes(16).toString('hex');
        teacher = {
          id: crypto.randomUUID(),
          name: teacherName,
          email: teacherEmail,
          password_salt: salt,
          password_hash: hashClassroomSecret(teacherPassword, salt),
          created_at: now,
          updated_at: now,
        };
        db.prepare(`INSERT INTO classroom_teachers
          (id, name, email, password_salt, password_hash, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)`)
          .run(teacher.id, teacher.name, teacher.email, teacher.password_salt, teacher.password_hash, teacher.created_at, teacher.updated_at);
        teacherCreated = true;
      } else {
        db.prepare('UPDATE classroom_teachers SET name = ?, archived_at = NULL, disabled_at = NULL, updated_at = ? WHERE id = ?')
          .run(teacherName, now, teacher.id);
      }

      upsertCourse(db, 'teacher_courses', 'teacher_id', teacher.id, COURSE_ID, now);

      let classroom = db.prepare('SELECT * FROM classrooms WHERE join_code = ?').get(classroomCode);
      let classroomCreated = false;
      if (classroom && classroom.teacher_id !== teacher.id) {
        throw new Error(`Classroom code ${classroomCode} already belongs to another teacher.`);
      }
      if (!classroom) {
        classroom = {
          id: crypto.randomUUID(),
          teacher_id: teacher.id,
          name: classroomName,
          join_code: classroomCode,
          created_at: now,
          updated_at: now,
        };
        db.prepare(`INSERT INTO classrooms (id, teacher_id, name, join_code, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?)`)
          .run(classroom.id, classroom.teacher_id, classroom.name, classroom.join_code, classroom.created_at, classroom.updated_at);
        classroomCreated = true;
      } else {
        db.prepare('UPDATE classrooms SET name = ?, updated_at = ? WHERE id = ?').run(classroomName, now, classroom.id);
      }

      upsertCourse(db, 'classroom_courses', 'classroom_id', classroom.id, COURSE_ID, now);

      let createdStudents = 0;
      let updatedStudents = 0;
      let importedMinecraftIdentities = 0;
      for (const row of rows) {
        const salt = crypto.randomBytes(16).toString('hex');
        const loginHash = hashClassroomSecret(row.lomda_login_code, salt);
        let student = db.prepare('SELECT * FROM classroom_students WHERE classroom_id = ? AND name = ?')
          .get(classroom.id, row.student_name);
        if (!student) {
          student = { id: crypto.randomUUID() };
          db.prepare(`INSERT INTO classroom_students
            (id, classroom_id, name, login_salt, login_hash, minecraft_player_name, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
            .run(student.id, classroom.id, row.student_name, salt, loginHash, row.minecraft_player, now, now);
          createdStudents += 1;
        } else {
          db.prepare(`UPDATE classroom_students
            SET login_salt = ?, login_hash = ?, minecraft_player_name = ?, archived_at = NULL, disabled_at = NULL, updated_at = ?
            WHERE id = ?`)
            .run(salt, loginHash, row.minecraft_player, now, student.id);
          updatedStudents += 1;
        }

        if (args.trustMinecraftIdentities) {
          const graphObjectId = `csv-import:${crypto.createHash('sha256').update(cleanEmail(row.minecraft_upn)).digest('hex')}`;
          db.prepare(`INSERT INTO classroom_minecraft_identities
            (student_id, upn, player_name, status, graph_object_id, source, verified_at, created_at, updated_at)
            VALUES (?, ?, ?, 'verified', ?, 'microsoft-graph-via-monitor', ?, ?, ?)
            ON CONFLICT(student_id) DO UPDATE SET
              upn = excluded.upn,
              player_name = excluded.player_name,
              status = excluded.status,
              graph_object_id = excluded.graph_object_id,
              source = excluded.source,
              verified_at = excluded.verified_at,
              updated_at = excluded.updated_at`)
            .run(student.id, cleanEmail(row.minecraft_upn), row.minecraft_player, graphObjectId, now, now, now);
          importedMinecraftIdentities += 1;
        }
      }

      return {
        dryRun: false,
        dbPath: args.dbPath,
        classroomName,
        classroomCode,
        teacherName,
        teacherEmail,
        teacherCreated,
        classroomCreated,
        createdStudents,
        updatedStudents,
        importedMinecraftIdentities,
        teacherPassword: teacherCreated ? teacherPassword : '',
        storesMinecraftPasswords: false,
      };
    })();
    return result;
  } finally {
    db.close();
  }
}

function printResult(result) {
  console.log(JSON.stringify({
    ...result,
    teacherPassword: result.teacherPassword ? '[printed-below-once]' : '',
  }, null, 2));
  if (result.teacherPassword) {
    console.log('');
    console.log('Teacher was created. One-time teacher password:');
    console.log(result.teacherPassword);
  }
}

try {
  const args = parseArgs(process.argv.slice(2));
  const csv = fs.readFileSync(args.csvPath, 'utf8').replace(/^\uFEFF/, '');
  const rows = validateRows(parseCsv(csv), args.trustMinecraftIdentities);
  printResult(importRows(rows, args));
} catch (error) {
  console.error(`import_classroom_credentials_error: ${error.message}`);
  process.exit(1);
}
