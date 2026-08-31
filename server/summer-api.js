'use strict';

const crypto = require('crypto');
const { SESSION_TTL_MS } = require('./config');
const { cleanText, readBody, send, sendWithHeaders } = require('./http-utils');
const {
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
} = require('./summer-db');

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

module.exports = {
  getSummerProfileFromRequest,
  handleStudentProgress,
  handleSummerAuth,
};
