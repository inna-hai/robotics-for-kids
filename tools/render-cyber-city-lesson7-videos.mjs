import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
const MARKETING = path.join(ROOT, 'marketing');
const FRAME_ROOT = process.env.FRAME_ROOT || '/home/igrois/snap/chromium/common/cyber-city-lesson7-frames';
const FFMPEG = process.env.FFMPEG || path.join(ROOT, 'node_modules/@ffmpeg-installer/linux-x64/ffmpeg');
const CHROMIUM = process.env.CHROMIUM || '/snap/bin/chromium';
const WIDTH = 1280;
const HEIGHT = 720;
const FPS = Number(process.env.FPS || 10);

const videos = [
  {
    slug: 'overview',
    title: 'Ethical Hacker Lab',
    subtitle: 'חושבים כמו תוקף כדי להגן',
    kind: 'overview',
    script: 'בשיעור הזה אנחנו נכנסים למעבדת האקר אתי. לא תוקפים אתרים אמיתיים. בודקים רק מערכת צעצוע שקיבלנו אישור לבדוק. המטרה היא למצוא חולשה, להוכיח אותה בצורה בטוחה, ואז לתקן.'
  },
  {
    slug: 'concepts',
    title: 'שפת האקר אתי',
    subtitle: 'Target, Vulnerability, Exploit, Fix',
    kind: 'concepts',
    script: 'לפני המעבדה לומדים את המילים החשובות. Target הוא היעד שמותר לבדוק. Vulnerability היא חולשה. Exploit הוא שימוש בחולשה כדי להוכיח בעיה. Fix הוא התיקון שמגן על המערכת.'
  },
  {
    slug: 'login',
    title: 'Login Toy',
    subtitle: 'מגלים חולשה במערכת צעצוע',
    kind: 'login',
    script: 'עכשיו בודקים מערכת התחברות צעצוע. יש רמז גלוי, סיסמה קצרה, ואין הגבלת ניסיונות. הילד רואה למה זה מסוכן, ואז בוחר תיקונים שמחזקים את ההגנה.'
  },
  {
    slug: 'terminal',
    title: 'Mini Linux Terminal',
    subtitle: 'קוראים ראיות עם פקודות פשוטות',
    kind: 'terminal',
    script: 'לינוקס נכנס כאן ככלי חקירה קצר. הפקודה ls מציגה קבצים. cat קוראת קובץ. grep מחפשת מילה בתוך קובץ. הכל סימולציה פנימית בתוך הלומדה.'
  },
  {
    slug: 'python',
    title: 'Python Defense Checker',
    subtitle: 'בודקים אם התיקון מספיק חזק',
    kind: 'python',
    script: 'אחרי שבוחרים תיקונים, Python עוזר לבדוק אותם מהר. הוא בודק אורך סיסמה, נעילה אחרי ניסיונות, ורמז שלא מגלה מידע רגיש. ככה הופכים מחשבה הגנתית לכלי.'
  },
  {
    slug: 'report',
    title: 'Ethical Hacker Report',
    subtitle: 'חולשה, הוכחה בטוחה, תיקון',
    kind: 'report',
    script: 'בסוף לא מספיק להגיד מצאתי בעיה. האקר אתי כותב דוח קצר: מה החולשה, איך הוכחנו אותה בלי לפגוע, ומה התיקון שמגן על המערכת.'
  },
  {
    slug: 'concept-ethics',
    title: 'Ethical Hacker',
    subtitle: 'בודקים רק באישור',
    kind: 'ethics',
    script: 'האקר אתי לא מנסה לפגוע. הוא בודק רק מערכת שקיבל אישור לבדוק, בתוך גבולות ברורים, ואז עוזר לתקן את הבעיה.'
  },
  {
    slug: 'concept-target',
    title: 'Target',
    subtitle: 'המערכת שמותר לבדוק',
    kind: 'target',
    script: 'Target הוא היעד של הבדיקה. בשיעור שלנו היעד הוא מערכת צעצוע, לא אתר אמיתי ולא חשבון של אדם אמיתי.'
  },
  {
    slug: 'concept-vulnerability',
    title: 'Vulnerability',
    subtitle: 'חולשה שאפשר לנצל',
    kind: 'vulnerability',
    script: 'Vulnerability היא חולשה. למשל סיסמה קצרה, רמז שמגלה יותר מדי, או מערכת שלא נועלת אחרי הרבה ניסיונות.'
  },
  {
    slug: 'concept-exploit',
    title: 'Exploit',
    subtitle: 'מוכיחים חולשה בסביבה בטוחה',
    kind: 'exploit',
    script: 'Exploit הוא שימוש בחולשה כדי להראות שהיא באמת קיימת. במעבדה שלנו עושים את זה רק בצעצוע, ואז מיד עוברים לתיקון.'
  },
  {
    slug: 'concept-fix',
    title: 'Fix',
    subtitle: 'סוגרים את החולשה',
    kind: 'fix',
    script: 'Fix הוא התיקון. סיסמה חזקה, הגבלת ניסיונות, רמז בטוח, והודעת שגיאה שלא מגלה יותר מדי מידע.'
  },
  {
    slug: 'concept-terminal',
    title: 'Linux Terminal',
    subtitle: 'פקודות קצרות לחקירת ראיות',
    kind: 'terminalConcept',
    script: 'Terminal הוא חלון פקודות. בשיעור נשתמש רק בשלוש פקודות בסיסיות: ls להצגת קבצים, cat לקריאת קובץ, ו grep לחיפוש מילה.'
  }
];

const selectedSlug = process.env.VIDEO_SLUG;

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: 'inherit', ...options });
  if (result.status !== 0) throw new Error(`${command} failed with ${result.status}`);
}

function output(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: 'utf8', ...options });
  return `${result.stdout || ''}\n${result.stderr || ''}`;
}

function loadGeminiKey() {
  if (process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY) return;
  const envPath = '/home/igrois/.openclaw/workspace/geoscale/backend/.env';
  if (!fs.existsSync(envPath)) return;
  const text = fs.readFileSync(envPath, 'utf8');
  const match = text.match(/(?:GOOGLE_AI_API_KEY|GEMINI_API_KEY)\s*=\s*("?)([^"\n\r]+)\1/);
  if (match) process.env.GOOGLE_AI_API_KEY = match[2].trim();
}

function durationOf(file) {
  const text = output(FFMPEG, ['-hide_banner', '-i', file]);
  const match = text.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
  if (!match) return 16;
  return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function cdpRequest(ws, method, params = {}) {
  const id = ++ws._id;
  ws.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      ws._callbacks.delete(id);
      reject(new Error(`CDP timeout: ${method}`));
    }, 30000);
    ws._callbacks.set(id, message => {
      clearTimeout(timeout);
      if (message.error) reject(new Error(`${method}: ${JSON.stringify(message.error)}`));
      else resolve(message.result);
    });
  });
}

async function openChrome() {
  const port = 9600 + Math.floor(Math.random() * 300);
  const chrome = spawn(CHROMIUM, [
    '--headless',
    '--no-sandbox',
    '--disable-gpu',
    '--hide-scrollbars',
    '--mute-audio',
    `--remote-debugging-port=${port}`,
    `--window-size=${WIDTH},${HEIGHT}`,
    'about:blank'
  ], { stdio: 'ignore' });

  let target;
  for (let i = 0; i < 60; i++) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/list`);
      const pages = await response.json();
      target = pages.find(page => page.type === 'page') || pages[0];
      if (target?.webSocketDebuggerUrl) break;
    } catch {
      await sleep(120);
    }
  }
  if (!target?.webSocketDebuggerUrl) {
    chrome.kill();
    throw new Error('Could not connect to Chromium DevTools');
  }

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  ws._id = 0;
  ws._callbacks = new Map();
  ws.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.id && ws._callbacks.has(message.id)) {
      ws._callbacks.get(message.id)(message);
      ws._callbacks.delete(message.id);
    }
  });
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });
  await cdpRequest(ws, 'Page.enable');
  await cdpRequest(ws, 'Runtime.enable');
  await cdpRequest(ws, 'Emulation.setDeviceMetricsOverride', { width: WIDTH, height: HEIGHT, deviceScaleFactor: 1, mobile: false });
  await cdpRequest(ws, 'Page.navigate', { url: `data:text/html;charset=utf-8,${encodeURIComponent(baseHtml())}` });
  await sleep(400);
  return { chrome, ws };
}

function baseHtml() {
  return `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;background:#061826}body{display:grid;place-items:center}</style></head><body></body></html>`;
}

function esc(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function lerp(a, b, t) {
  return a + (b - a) * clamp(t);
}

function ease(t) {
  t = clamp(t);
  return t * t * (3 - 2 * t);
}

function label(x, y, text, size = 34, fill = '#f8fafc', weight = 900, anchor = 'middle') {
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}" font-weight="${weight}" fill="${fill}" font-family="Arial, sans-serif" direction="rtl" unicode-bidi="plaintext">${esc(text)}</text>`;
}

function ltr(x, y, text, size = 28, fill = '#fef3c7', weight = 900, anchor = 'middle') {
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}" font-weight="${weight}" fill="${fill}" font-family="Arial, sans-serif" direction="ltr" unicode-bidi="plaintext">${esc(text)}</text>`;
}

function rect(x, y, w, h, r, fill, stroke = 'rgba(255,255,255,.22)') {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
}

function top(video, p) {
  return `
    <defs>
      <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0H0V48" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="1"/></pattern>
      <filter id="glow"><feGaussianBlur stdDeviation="8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <marker id="arrow" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto"><path d="M2 2L10 6L2 10Z" fill="#fef3c7"/></marker>
    </defs>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="#061826"/>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#grid)" opacity=".72"/>
    <circle cx="${180 + 120 * Math.sin(p * Math.PI * 2)}" cy="120" r="190" fill="#0f766e" opacity=".22"/>
    <circle cx="${1080 - 100 * Math.sin(p * Math.PI * 2)}" cy="92" r="230" fill="#2563eb" opacity=".24"/>
    <text x="70" y="62" font-size="24" font-weight="900" fill="#67e8f9" font-family="Arial, sans-serif">Cyber AI Builders · Lesson 7</text>
    ${label(640, 116, video.title, 56)}
    ${label(640, 166, video.subtitle, 30, '#ccfbf1', 800)}
  `;
}

function node(x, y, title, sub, color = '#0f172a') {
  return `<g>${rect(x - 130, y - 62, 260, 124, 24, 'rgba(15,23,42,.86)', color)}${label(x, y - 8, title, 30, '#e0f2fe')}${ltr(x, y + 32, sub, 22, '#a7f3d0')}</g>`;
}

function pill(x, y, text, fill = '#fef08a', color = '#78350f') {
  const w = Math.max(122, text.length * 17);
  return `<g transform="translate(${x - w / 2} ${y - 24})">${rect(0, 0, w, 48, 999, fill, 'rgba(255,255,255,.35)')}${ltr(w / 2, 32, text, 22, color)}</g>`;
}

function movingDot(x1, y1, x2, y2, p, text = 'test') {
  const t = ease(p);
  const x = lerp(x1, x2, t);
  const y = lerp(y1, y2, t);
  return `<path d="M${x1} ${y1} C${(x1 + x2) / 2} ${y1 - 90}, ${(x1 + x2) / 2} ${y2 + 90}, ${x2} ${y2}" stroke="#fef3c7" stroke-width="5" fill="none" marker-end="url(#arrow)" opacity=".9"/>
    <circle cx="${x}" cy="${y}" r="28" fill="#fef08a" filter="url(#glow)"/>
    ${ltr(x, y + 7, text, 17, '#78350f')}`;
}

function scene(video, p) {
  if (['overview', 'ethics'].includes(video.kind)) {
    return `${node(260, 390, 'אישור', 'permission', '#22d3ee')}${node(640, 390, 'בדיקה', 'safe test', '#f59e0b')}${node(1020, 390, 'תיקון', 'fix', '#22c55e')}${movingDot(390, 390, 890, 390, p, 'lab')}${label(640, 560, p < .5 ? 'לא נוגעים בעולם האמיתי' : 'בודקים צעצוע ואז מתקנים', 34, '#f8fafc')}`;
  }
  if (['concepts', 'target'].includes(video.kind)) {
    return `${node(300, 410, 'Target', 'toy login', '#38bdf8')}${node(640, 410, 'Vulnerability', 'weak hint', '#f97316')}${node(980, 410, 'Fix', 'lockout', '#22c55e')}${movingDot(300, 535, 980, 535, p, 'check')}`;
  }
  if (['login', 'vulnerability'].includes(video.kind)) {
    return `${rect(420, 250, 440, 300, 22, 'rgba(255,255,255,.94)', '#bfdbfe')}${ltr(640, 302, 'TRAINING LOGIN', 30, '#0f172a')}${ltr(640, 360, 'hint: city + one digit', 28, '#9a3412')}${rect(510, 395, 260, 54, 10, '#f8fafc', '#cbd5e1')}${ltr(640, 430, p < .55 ? 'admin' : 'city7', 30, p < .55 ? '#b91c1c' : '#047857')}${label(640, 585, p < .55 ? 'הרמז חושף יותר מדי' : 'הסיסמה הקצרה מצליחה בצעצוע', 34)}`;
  }
  if (video.kind === 'exploit') {
    return `${node(300, 395, 'חולשה', 'weak hint', '#fb923c')}${movingDot(430, 395, 850, 395, p, 'proof')}${node(990, 395, 'הוכחה בטוחה', 'toy only', '#22c55e')}${label(640, 570, 'Exploit במעבדה מוכיח בעיה, ואז עוצרים ומתקנים', 31)}`;
  }
  if (video.kind === 'fix') {
    const locks = ['min length', '3 tries', 'safe hint'].map((t, i) => pill(400 + i * 240, 415, t, i / 3 < p ? '#bbf7d0' : '#e2e8f0', '#064e3b')).join('');
    return `${rect(250, 260, 780, 310, 28, 'rgba(15,23,42,.76)', '#22c55e')}${label(640, 330, 'סוגרים את החולשה בשכבות הגנה', 34)}${locks}${label(640, 560, 'Fix טוב מקטין סיכון, לא רק משנה צבע במסך', 30, '#ccfbf1')}`;
  }
  if (['terminal', 'terminalConcept'].includes(video.kind)) {
    const line = p < .33 ? '$ ls' : p < .66 ? '$ cat login_policy.txt' : '$ grep hint login_policy.txt';
    const out = p < .33 ? 'login_policy.txt   attempts.log' : p < .66 ? 'max_attempts=unlimited' : 'hint=city + one digit';
    return `${rect(210, 240, 860, 360, 18, '#020617', '#38bdf8')}${ltr(250, 300, line, 28, '#67e8f9', 900, 'start')}${ltr(250, 360, out, 27, '#bbf7d0', 900, 'start')}${label(640, 650, 'טרמינל עוזר למצוא ראיות בקבצים', 31)}`;
  }
  if (video.kind === 'python') {
    const rows = ['if min_length >= 10:', 'if lockout_enabled:', 'if hint_is_safe:'];
    return `${rect(260, 220, 760, 390, 18, '#0f172a', '#60a5fa')}${rows.map((row, i) => ltr(320, 310 + i * 70, row, 29, i / 3 < p ? '#bbf7d0' : '#e2e8f0', 900, 'start')).join('')}${pill(820, 525, `score ${Math.round(80 * p)}`, '#fef08a')}`;
  }
  return `${node(330, 410, 'חולשה', 'weakness', '#fb923c')}${node(640, 410, 'הוכחה', 'safe proof', '#38bdf8')}${node(950, 410, 'תיקון', 'fix', '#22c55e')}${movingDot(460, 530, 820, 530, p, 'report')}${label(640, 620, 'דוח טוב מסביר מה קרה ומה עושים עכשיו', 31)}`;
}

function svgFrame(video, progress) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
    ${top(video, progress)}
    ${scene(video, progress)}
    <rect x="280" y="675" width="720" height="10" rx="5" fill="rgba(255,255,255,.16)"/>
    <rect x="280" y="675" width="${720 * progress}" height="10" rx="5" fill="#fef08a"/>
  </svg>`;
}

function createAudio(video) {
  loadGeminiKey();
  const scriptPath = path.join(MARKETING, `cyber-city-lesson7-${video.slug}-leda.txt`);
  const base = path.join(MARKETING, `cyber-city-lesson7-${video.slug}-leda`);
  const mp3 = `${base}.mp3`;
  fs.writeFileSync(scriptPath, video.script, 'utf8');
  if (fs.existsSync(mp3)) return mp3;
  if (process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY) {
    const result = spawnSync('node', ['tools/generate-gemini-tts.js', scriptPath, base, 'gemini-2.5-pro-preview-tts', 'Leda'], {
      cwd: ROOT,
      stdio: 'inherit',
      env: process.env
    });
    if (result.status === 0 && fs.existsSync(mp3)) return mp3;
  }
  run(FFMPEG, ['-y', '-f', 'lavfi', '-i', 'anullsrc=channel_layout=mono:sample_rate=24000', '-t', '16', '-q:a', '9', '-acodec', 'libmp3lame', mp3]);
  return mp3;
}

async function renderVideo(video, browser) {
  const audio = createAudio(video);
  const duration = Math.max(12, durationOf(audio) + 1.2);
  const frameDir = path.join(FRAME_ROOT, video.slug);
  fs.rmSync(frameDir, { recursive: true, force: true });
  fs.mkdirSync(frameDir, { recursive: true });

  const frames = Math.ceil(duration * FPS);
  for (let i = 0; i < frames; i++) {
    const progress = i / Math.max(1, frames - 1);
    const svg = svgFrame(video, progress);
    await cdpRequest(browser.ws, 'Runtime.evaluate', {
      expression: `document.body.innerHTML = ${JSON.stringify(svg)};`,
      awaitPromise: true
    });
    await sleep(12);
    const capture = await cdpRequest(browser.ws, 'Page.captureScreenshot', { format: 'png', fromSurface: true });
    const file = path.join(frameDir, `frame-${String(i).padStart(4, '0')}.png`);
    fs.writeFileSync(file, Buffer.from(capture.data, 'base64'));
  }

  const silent = path.join(MARKETING, `cyber-city-lesson7-${video.slug}-silent.mp4`);
  const out = path.join(MARKETING, `cyber-city-lesson7-${video.slug}.mp4`);
  const poster = path.join(MARKETING, `cyber-city-lesson7-${video.slug}-poster.jpg`);
  fs.copyFileSync(path.join(frameDir, `frame-${String(Math.min(frames - 1, FPS)).padStart(4, '0')}.png`), poster);
  run(FFMPEG, ['-y', '-framerate', String(FPS), '-i', path.join(frameDir, 'frame-%04d.png'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', silent]);
  run(FFMPEG, ['-y', '-i', silent, '-i', audio, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', out]);
  run(FFMPEG, ['-hide_banner', '-i', out, '-f', 'null', '-']);
  console.log(out);
}

async function main() {
  fs.mkdirSync(MARKETING, { recursive: true });
  fs.mkdirSync(FRAME_ROOT, { recursive: true });
  const selected = selectedSlug ? videos.filter(video => video.slug === selectedSlug) : videos;
  if (!selected.length) throw new Error(`No matching VIDEO_SLUG ${selectedSlug}`);
  const browser = await openChrome();
  try {
    for (const video of selected) {
      console.log(`Rendering ${video.slug}`);
      await renderVideo(video, browser);
    }
  } finally {
    browser.ws.close();
    browser.chrome.kill();
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
