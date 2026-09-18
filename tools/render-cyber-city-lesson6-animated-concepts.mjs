import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
const MARKETING = path.join(ROOT, 'marketing');
const FRAME_ROOT = process.env.FRAME_ROOT || '/home/igrois/snap/chromium/common/cyber-city-lesson6-animated-concepts';
const FFMPEG = process.env.FFMPEG || path.join(ROOT, 'node_modules/@ffmpeg-installer/linux-x64/ffmpeg');
const CHROMIUM = process.env.CHROMIUM || '/snap/bin/chromium';
const WIDTH = 1280;
const HEIGHT = 720;
const FPS = Number(process.env.FPS || 10);

const concepts = [
  { slug: 'concept-packet', step: '01', title: 'Packet', subtitle: 'חבילת מידע קטנה בדרך', color: '#f59e0b' },
  { slug: 'concept-device', step: '02', title: 'מחשב / Source', subtitle: 'מאיפה הבקשה מתחילה?', color: '#22d3ee' },
  { slug: 'concept-dns', step: '03', title: 'DNS', subtitle: 'שם אתר הופך לכתובת IP', color: '#34d399' },
  { slug: 'concept-ip', step: '04', title: 'IP', subtitle: 'הכתובת שאליה שולחים', color: '#60a5fa' },
  { slug: 'concept-server', step: '05', title: 'שרת / Destination', subtitle: 'היעד שמחזיר תשובה', color: '#a78bfa' },
  { slug: 'concept-https', step: '06', title: 'HTTPS', subtitle: 'מנהרה מוצפנת למידע', color: '#f472b6' }
];

const selectedSlug = process.env.VIDEO_SLUG;

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: 'inherit', ...options });
  if (result.status !== 0) throw new Error(`${command} failed with ${result.status}`);
}

function ffmpegText(command, args) {
  const result = spawnSync(command, args, { encoding: 'utf8' });
  if (result.status !== 0) return `${result.stdout || ''}\n${result.stderr || ''}`;
  return `${result.stdout || ''}\n${result.stderr || ''}`;
}

function durationOf(file) {
  const text = ffmpegText(FFMPEG, ['-hide_banner', '-i', file]);
  const match = text.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
  if (!match) return 21;
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
  const port = 9400 + Math.floor(Math.random() * 400);
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
  for (let i = 0; i < 50; i++) {
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
  await cdpRequest(ws, 'Emulation.setDeviceMetricsOverride', {
    width: WIDTH,
    height: HEIGHT,
    deviceScaleFactor: 1,
    mobile: false
  });
  await cdpRequest(ws, 'Page.navigate', { url: `data:text/html;charset=utf-8,${encodeURIComponent(baseHtml())}` });
  await sleep(500);
  return { chrome, ws };
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

function opacity(t, start, end) {
  return clamp((t - start) / (end - start));
}

function pt(a, b, t) {
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
}

function pathPoint(points, t) {
  const scaled = clamp(t) * (points.length - 1);
  const index = Math.min(points.length - 2, Math.floor(scaled));
  return pt(points[index], points[index + 1], scaled - index);
}

function roundedRect(x, y, w, h, r, fill, stroke = 'rgba(255,255,255,.24)', extra = '') {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2" ${extra}/>`;
}

function label(x, y, text, size = 32, fill = '#ecfeff', weight = 900, anchor = 'middle') {
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}" font-weight="${weight}" fill="${fill}" font-family="Arial, sans-serif" direction="rtl" unicode-bidi="plaintext">${esc(text)}</text>`;
}

function ltrLabel(x, y, text, size = 29, fill = '#fef3c7', weight = 900, anchor = 'middle') {
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}" font-weight="${weight}" fill="${fill}" font-family="Arial, sans-serif" direction="ltr" unicode-bidi="plaintext">${esc(text)}</text>`;
}

function packet(x, y, text, color = '#fef08a', scale = 1) {
  const w = 104 * scale;
  const h = 72 * scale;
  return `
    <g transform="translate(${x - w / 2} ${y - h / 2})">
      ${roundedRect(0, 0, w, h, 16 * scale, color, '#f59e0b')}
      <path d="M${14 * scale} ${18 * scale} H${w - 14 * scale}" stroke="#92400e" stroke-width="${3 * scale}" opacity=".55"/>
      <path d="M${14 * scale} ${35 * scale} H${w - 28 * scale}" stroke="#92400e" stroke-width="${3 * scale}" opacity=".35"/>
      ${ltrLabel(w / 2, 58 * scale, text, 18 * scale, '#78350f', 900)}
    </g>`;
}

function node(x, y, title, sub, color = '#0f172a') {
  return `
    <g>
      ${roundedRect(x - 122, y - 58, 244, 116, 24, 'rgba(15,23,42,.84)', color)}
      ${label(x, y - 10, title, 31, '#e0f2fe')}
      ${ltrLabel(x, y + 30, sub, 23, '#a7f3d0')}
    </g>`;
}

function top(concept) {
  return `
    <rect width="${WIDTH}" height="${HEIGHT}" fill="#061826"/>
    <radialGradient id="g1" cx="18%" cy="18%" r="52%"><stop offset="0%" stop-color="${concept.color}" stop-opacity=".42"/><stop offset="100%" stop-color="${concept.color}" stop-opacity="0"/></radialGradient>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#g1)"/>
    <path d="M0 0H1280V720H0Z" fill="url(#grid)" opacity=".22"/>
    <defs>
      <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
        <path d="M48 0H0V48" fill="none" stroke="#ffffff" stroke-opacity=".28" stroke-width="1"/>
      </pattern>
      <filter id="glow"><feGaussianBlur stdDeviation="8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <marker id="arrow" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto"><path d="M2 2L10 6L2 10Z" fill="#fef3c7"/></marker>
    </defs>
    <text x="80" y="62" font-size="24" font-weight="900" fill="#67e8f9" font-family="Arial, sans-serif">Cyber AI Builders · Lesson 6</text>
    ${label(1180, 64, concept.step, 30, '#fef3c7')}
    ${label(640, 124, concept.title, 58, '#f8fafc')}
    ${label(640, 174, concept.subtitle, 30, '#ccfbf1', 800)}
  `;
}

function timeline(p) {
  const x = 280 + p * 720;
  return `
    <rect x="280" y="662" width="720" height="10" rx="5" fill="rgba(255,255,255,.16)"/>
    <rect x="280" y="662" width="${720 * p}" height="10" rx="5" fill="#fef08a"/>
    <circle cx="${x}" cy="667" r="13" fill="#fef3c7" filter="url(#glow)"/>`;
}

function packetScene(concept, p) {
  const route = [{ x: 210, y: 420 }, { x: 450, y: 420 }, { x: 680, y: 420 }, { x: 920, y: 420 }, { x: 1080, y: 300 }];
  const main = pathPoint(route, ease(p));
  const split = opacity(p, .24, .48);
  const pieces = [0, .05, .1].map((delay, i) => {
    const q = pathPoint(route, ease(clamp(p - delay)));
    return packet(q.x, q.y + i * 14 - 14, ['src', 'dst', 'proto'][i], ['#fef08a', '#bae6fd', '#bbf7d0'][i], .62);
  }).join('');
  return `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
    ${top(concept)}
    <path d="M210 420C360 340 520 500 680 420S940 340 1080 300" fill="none" stroke="#fef3c7" stroke-width="8" stroke-linecap="round" opacity=".45" marker-end="url(#arrow)"/>
    ${node(210, 420, 'מחשב', 'source')}
    ${node(450, 420, 'DNS', 'domain')}
    ${node(680, 420, 'IP', '203.0.113.24')}
    ${node(920, 420, 'שרת', 'destination')}
    ${node(1080, 300, 'תגובה', 'response')}
    <g opacity="${1 - split}">${packet(main.x, main.y, 'PACKET', '#fef08a', 1)}</g>
    <g opacity="${split}">${pieces}</g>
    ${label(640, 560, p < .28 ? 'מידע גדול מתחלק לחבילות קטנות' : p < .62 ? 'כל חבילה נושאת מקור, יעד ופרוטוקול' : 'ככה Packet Log עוזר להבין מה עבר ברשת', 34, '#f8fafc')}
    ${timeline(p)}
  </svg>`;
}

function deviceScene(concept, p) {
  const q = pathPoint([{ x: 300, y: 450 }, { x: 610, y: 400 }, { x: 940, y: 380 }], ease(p));
  const pulse = 1 + Math.sin(p * Math.PI * 8) * .04;
  return `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
    ${top(concept)}
    <g transform="translate(300 430) scale(${pulse}) translate(-300 -430)">
      ${roundedRect(190, 340, 220, 145, 20, 'rgba(8,47,73,.92)', '#22d3ee')}
      <rect x="218" y="365" width="164" height="86" rx="10" fill="#0f172a" stroke="#67e8f9"/>
      ${ltrLabel(300, 418, '10.0.0.23', 25, '#a7f3d0')}
      <path d="M230 500H370L405 540H195Z" fill="#164e63" stroke="#67e8f9"/>
      ${label(300, 590, 'המחשב מתחיל את הבקשה', 30, '#e0f2fe')}
    </g>
    <path d="M410 420C560 330 750 430 940 380" fill="none" stroke="#fef3c7" stroke-width="8" stroke-linecap="round" opacity=".45" marker-end="url(#arrow)"/>
    ${node(940, 380, 'לוג רשת', 'src = source')}
    ${packet(q.x, q.y, 'request', '#bae6fd', .85)}
    ${label(640, 560, p < .42 ? 'Source הוא מי ששלח את הבקשה' : 'במסלול, המחשב תמיד בא ראשון', 36, '#f8fafc')}
    ${timeline(p)}
  </svg>`;
}

function dnsScene(concept, p) {
  const query = pathPoint([{ x: 240, y: 430 }, { x: 540, y: 360 }], ease(opacity(p, 0, .45)));
  const answer = pathPoint([{ x: 540, y: 360 }, { x: 940, y: 430 }], ease(opacity(p, .45, 1)));
  return `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
    ${top(concept)}
    ${node(240, 430, 'מחשב', 'school.example')}
    ${node(540, 360, 'DNS', 'ספר כתובות')}
    ${node(940, 430, 'IP', '203.0.113.24')}
    <path d="M330 405C420 340 460 330 540 360" fill="none" stroke="#fef3c7" stroke-width="8" opacity=".48" marker-end="url(#arrow)"/>
    <path d="M635 365C720 330 820 370 875 405" fill="none" stroke="#34d399" stroke-width="8" opacity=".55" marker-end="url(#arrow)"/>
    ${p < .52 ? packet(query.x, query.y, 'domain?', '#fef08a', .78) : packet(answer.x, answer.y, 'IP!', '#bbf7d0', .78)}
    ${roundedRect(435, 468, 220, 66, 18, 'rgba(236,253,245,.15)', '#34d399')}
    ${ltrLabel(545, 510, 'school.example → 203.0.113.24', 23, '#dcfce7')}
    ${label(640, 590, p < .45 ? 'המחשב שואל: מה הכתובת של שם האתר?' : 'DNS מחזיר כתובת IP שאפשר לשלוח אליה', 34, '#f8fafc')}
    ${timeline(p)}
  </svg>`;
}

function ipScene(concept, p) {
  const q = pathPoint([{ x: 250, y: 470 }, { x: 590, y: 300 }, { x: 1010, y: 420 }], ease(p));
  return `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
    ${top(concept)}
    <path d="M220 500C390 250 780 210 1040 420" fill="none" stroke="#93c5fd" stroke-width="9" stroke-linecap="round" opacity=".45" marker-end="url(#arrow)"/>
    ${node(250, 470, 'מחשב', 'source')}
    <g transform="translate(590 300)">
      <circle r="86" fill="rgba(96,165,250,.2)" stroke="#60a5fa" stroke-width="4"/>
      <path d="M0 -52C31 -52 56 -27 56 4C56 48 0 88 0 88S-56 48 -56 4C-56 -27 -31 -52 0 -52Z" fill="#bfdbfe" stroke="#2563eb" stroke-width="4"/>
      <circle r="18" fill="#1d4ed8"/>
      ${ltrLabel(0, 128, '203.0.113.24', 30, '#fef3c7')}
    </g>
    ${node(1010, 420, 'שרת', 'destination')}
    ${packet(q.x, q.y, 'to IP', '#bfdbfe', .8)}
    ${label(640, 580, p < .5 ? 'IP הוא כמו כתובת יעד ברשת' : 'אחרי שיש כתובת, החבילה יודעת לאן לנסוע', 34, '#f8fafc')}
    ${timeline(p)}
  </svg>`;
}

function serverScene(concept, p) {
  const going = p < .55;
  const requestP = ease(opacity(p, 0, .55));
  const responseP = ease(opacity(p, .55, 1));
  const q = going
    ? pathPoint([{ x: 240, y: 430 }, { x: 650, y: 380 }, { x: 980, y: 410 }], requestP)
    : pathPoint([{ x: 980, y: 410 }, { x: 650, y: 470 }, { x: 240, y: 430 }], responseP);
  return `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
    ${top(concept)}
    ${node(240, 430, 'מחשב', 'request')}
    <path d="M330 420C500 360 760 350 890 400" fill="none" stroke="#fef3c7" stroke-width="8" opacity=".42" marker-end="url(#arrow)"/>
    <g transform="translate(980 410)">
      ${roundedRect(-95, -120, 190, 240, 22, 'rgba(49,46,129,.85)', '#a78bfa')}
      <rect x="-58" y="-80" width="116" height="28" rx="8" fill="#c4b5fd"/>
      <rect x="-58" y="-28" width="116" height="28" rx="8" fill="#c4b5fd"/>
      <rect x="-58" y="24" width="116" height="28" rx="8" fill="#c4b5fd"/>
      ${label(0, 104, 'שרת', 32, '#f8fafc')}
    </g>
    ${packet(q.x, q.y, going ? 'GET' : 'page', going ? '#ddd6fe' : '#bbf7d0', .82)}
    ${label(640, 585, going ? 'השרת מקבל את הבקשה' : 'ואז מחזיר תשובה למחשב', 36, '#f8fafc')}
    ${timeline(p)}
  </svg>`;
}

function httpsScene(concept, p) {
  const q = pathPoint([{ x: 230, y: 430 }, { x: 520, y: 430 }, { x: 910, y: 430 }], ease(p));
  const locked = opacity(p, .25, .62);
  const lockY = 332 - Math.sin(p * Math.PI * 4) * 8;
  return `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
    ${top(concept)}
    ${node(230, 430, 'מחשב', 'password')}
    ${node(910, 430, 'שרת', 'login')}
    <path d="M340 430H800" stroke="#ef4444" stroke-width="12" opacity="${1 - locked}" stroke-linecap="round" marker-end="url(#arrow)"/>
    <path d="M340 430H800" stroke="#34d399" stroke-width="18" opacity="${locked}" stroke-linecap="round" marker-end="url(#arrow)"/>
    <g opacity="${locked}">
      ${roundedRect(420, 365, 300, 130, 36, 'rgba(16,185,129,.18)', '#34d399')}
      <path d="M570 ${lockY}C570 282 610 282 610 ${lockY}V365H570Z" fill="none" stroke="#bbf7d0" stroke-width="14" stroke-linecap="round"/>
      ${roundedRect(535, 360, 110, 92, 18, '#bbf7d0', '#34d399')}
      <circle cx="590" cy="397" r="10" fill="#065f46"/>
      <path d="M590 406V428" stroke="#065f46" stroke-width="7" stroke-linecap="round"/>
    </g>
    ${packet(q.x, q.y, locked > .5 ? '••••' : 'PASS', locked > .5 ? '#bbf7d0' : '#fecaca', .86)}
    ${label(640, 575, locked < .5 ? 'בלי הצפנה, מידע רגיש חשוף יותר בדרך' : 'HTTPS מצפין את התוכן בזמן המעבר', 34, '#f8fafc')}
    ${timeline(p)}
  </svg>`;
}

function frameSvg(concept, progress) {
  if (concept.slug === 'concept-packet') return packetScene(concept, progress);
  if (concept.slug === 'concept-device') return deviceScene(concept, progress);
  if (concept.slug === 'concept-dns') return dnsScene(concept, progress);
  if (concept.slug === 'concept-ip') return ipScene(concept, progress);
  if (concept.slug === 'concept-server') return serverScene(concept, progress);
  if (concept.slug === 'concept-https') return httpsScene(concept, progress);
  return packetScene(concept, progress);
}

function baseHtml() {
  return `<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;background:#061826}#root{width:${WIDTH}px;height:${HEIGHT}px}</style></head><body><div id="root"></div><script>window.setSvg = svg => { document.getElementById('root').innerHTML = svg; };</script></body></html>`;
}

async function captureFrame(ws, svg, outPath) {
  await cdpRequest(ws, 'Runtime.evaluate', {
    expression: `window.setSvg(${JSON.stringify(svg)})`,
    awaitPromise: false
  });
  const result = await cdpRequest(ws, 'Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: false
  });
  fs.writeFileSync(outPath, Buffer.from(result.data, 'base64'));
}

async function renderConcept(concept, browser) {
  const sourceVideo = path.join(MARKETING, `cyber-city-lesson6-${concept.slug}.mp4`);
  const outPath = path.join(MARKETING, `cyber-city-lesson6-${concept.slug}.mp4`);
  const tempOut = path.join(MARKETING, `cyber-city-lesson6-${concept.slug}-animated.mp4`);
  const silentPath = path.join(MARKETING, `cyber-city-lesson6-${concept.slug}-animated-silent.mp4`);
  const posterPath = path.join(MARKETING, `cyber-city-lesson6-${concept.slug}-poster.jpg`);
  const dir = path.join(FRAME_ROOT, concept.slug);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });

  const duration = durationOf(sourceVideo);
  const frames = Math.ceil(duration * FPS);
  console.log(`Rendering ${concept.slug}: ${frames} frames, ${duration.toFixed(2)}s`);

  for (let i = 0; i < frames; i++) {
    const progress = frames <= 1 ? 1 : i / (frames - 1);
    const svg = frameSvg(concept, progress);
    const out = path.join(dir, `frame-${String(i).padStart(5, '0')}.png`);
    await captureFrame(browser.ws, svg, out);
    if (i % 40 === 0) console.log(`${concept.slug}: ${i}/${frames}`);
  }

  run(FFMPEG, [
    '-y',
    '-framerate', String(FPS),
    '-i', path.join(dir, 'frame-%05d.png'),
    '-vf', 'format=yuv420p',
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '18',
    '-movflags', '+faststart',
    silentPath
  ]);
  run(FFMPEG, [
    '-y',
    '-i', silentPath,
    '-i', sourceVideo,
    '-map', '0:v:0',
    '-map', '1:a:0',
    '-c:v', 'copy',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-shortest',
    '-movflags', '+faststart',
    tempOut
  ]);
  fs.renameSync(tempOut, outPath);
  run(FFMPEG, ['-y', '-i', path.join(dir, 'frame-00000.png'), '-frames:v', '1', '-q:v', '2', posterPath]);
  console.log(`Updated ${outPath}`);
}

fs.mkdirSync(MARKETING, { recursive: true });
fs.mkdirSync(FRAME_ROOT, { recursive: true });

const browser = await openChrome();
try {
  for (const concept of concepts.filter(concept => !selectedSlug || concept.slug === selectedSlug)) {
    await renderConcept(concept, browser);
  }
} finally {
  browser.ws.close();
  browser.chrome.kill();
}
