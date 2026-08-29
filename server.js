#!/usr/bin/env node
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = Number(process.env.PORT || process.argv[2] || 3032);
const {
  ADMIN_TOKEN_FILE,
  ATTACHMENTS_DIR,
  DATA_DIR,
  FEEDBACK_FILE,
  ROOT,
} = require('./server/config');
const SUBSCRIPTION_GATE_ENABLED = process.env.ROBOTICS_SUBSCRIPTION_GATE
  ? process.env.ROBOTICS_SUBSCRIPTION_GATE === '1'
  : PORT === 3006;

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

const { cleanText, parseByteRange, readBody, requestUrl, send, sendWithHeaders } = require('./server/http-utils');

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

const { getSummerProfileFromRequest, handleStudentProgress, handleSummerAuth } = require('./server/summer-api');

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
  if (req.url.startsWith('/api/feedback')) return handleFeedback(req, res);
  if (req.url.startsWith('/api/summer/')) return handleSummerAuth(req, res);
  if (req.url.startsWith('/api/progress')) return handleStudentProgress(req, res);
  return serveStatic(req, res);
});

server.listen(PORT, '0.0.0.0', () => {
  ensureAdminToken();
  console.log(`Robotics15 server listening on http://0.0.0.0:${PORT}`);
});
