const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const MARKETING = path.join(ROOT, 'marketing');
const FPS = Number(process.env.FPS || 10);
const WIDTH = 1280;
const HEIGHT = 720;
const CHROME = process.env.CHROME_BIN || '/snap/bin/chromium';

function resolveModule(name) {
  const bases = [
    path.join(ROOT, 'node_modules'),
    '/home/igrois/.openclaw/workspace/tools/whatsapp/node_modules',
  ];
  for (const base of bases) {
    try {
      return require(require.resolve(name, { paths: [base] }));
    } catch {}
  }
  return require(name);
}

const puppeteer = resolveModule('puppeteer-core');
const ffmpegPath = resolveModule('@ffmpeg-installer/ffmpeg').path;

const videos = [
  {
    id: 'overview',
    title: 'Message Detective',
    file: 'cyber-city-lesson4-overview.mp4',
    accent: '#0f766e',
    icon: '04',
    visual: 'בודקים ניסוח של הודעה',
    bullets: ['מזהים מילים שמעלות סיכון', 'מעמיקים בתנאי if', 'בונים Message Scanner'],
    code: ['msg = input("message: ")', 'if "urgent" in msg:', '    risk += 20'],
    script: [
      '[warm] בשיעור 4 אנחנו הופכים להיות בלשי הודעות.',
      '[clear] הפעם אנחנו לא בודקים רק קישור. אנחנו בודקים איך ההודעה כתובה ומה היא מבקשת מאיתנו לעשות.',
      '[practical] נעמיק בתנאי if, נבדוק מילים בתוך הודעה, ונבנה Message Scanner קטן שמחשב Risk.',
    ],
  },
  {
    id: 'brief',
    title: 'פתיחה',
    file: 'cyber-city-lesson4-brief.mp4',
    accent: '#2563eb',
    icon: '01',
    visual: 'למה בודקים ניסוח',
    bullets: ['לא מגיבים מהר', 'קוראים מה ההודעה מבקשת', 'מחפשים מילים שמעלות סיכון'],
    code: ['read message', 'find signals', 'choose safe action'],
    script: [
      '[warm] בשלב הפתיחה אנחנו מבינים את המשימה.',
      '[clear] לפעמים הודעה מנסה לגרום לנו לפעול מהר, למסור מידע, או להאמין שמשהו דחוף.',
      '[practical] היום נבדוק את הטקסט עצמו ונראה איך Python משתמש בתנאים כדי למצוא סימנים.',
    ],
  },
  {
    id: 'signals',
    title: 'סימני ניסוח',
    file: 'cyber-city-lesson4-signals.mp4',
    accent: '#0891b2',
    icon: '02',
    visual: 'מילים הן ראיות',
    bullets: ['urgent אומר דחיפות', 'gift אומר פרס', 'password אומר מידע רגיש'],
    code: ['urgent', 'gift', 'password'],
    script: [
      '[friendly] בשלב הזה מחפשים סימני ניסוח.',
      '[clear] מילים כמו urgent, gift, verify או password לא אומרות לבד שההודעה מסוכנת, אבל הן ראיות שצריך לבדוק.',
      '[practical] הילד בוחר סימן ומבין מה הוא מוסיף להחלטה.',
    ],
  },
  {
    id: 'conditions',
    title: 'תנאי if',
    file: 'cyber-city-lesson4-conditions.mp4',
    accent: '#7c3aed',
    icon: '03',
    visual: 'אם המילה נמצאת',
    bullets: ['מדביקים הודעת דמו', 'לוחצים על ▶ הרצה', 'רואים אילו תנאים נכונים'],
    code: ['if "urgent" in msg:', '    print("urgent found")', 'if "password" in msg:'],
    script: [
      '[focused] עכשיו מעמיקים בתנאי if.',
      '[clear] תנאי שואל שאלה: האם המילה urgent נמצאת בתוך msg. אם כן, רק אז הקוד מפעיל את השורה שמתחת.',
      '[practical] מדביקים הודעת דמו, לוחצים על כפתור הפליי, ורואים בפלט אילו מילים נמצאו.',
    ],
  },
  {
    id: 'scanner',
    title: 'Message Scanner',
    file: 'cyber-city-lesson4-scanner.mp4',
    accent: '#16a34a',
    icon: 'if',
    visual: 'כמה תנאים ברצף',
    bullets: ['בוחרים תנאי if פשוטים', 'רואים קוד קצר באנגלית', 'Risk עולה לפי מילים שנמצאו'],
    code: ['risk = 0', 'if "gift" in msg:', '    risk += 20'],
    script: [
      '[curious] בשלב הזה בונים Message Scanner.',
      '[clear] לא מוסיפים לולאות ולא רשימות. רק כמה תנאי if ברורים, אחד אחרי השני.',
      '[practical] כל תנאי שמתקיים מוסיף קצת Risk. ככה רואים איך החלטה גדולה נבנית מכמה שאלות קטנות.',
    ],
  },
  {
    id: 'cases',
    title: 'הרצת הודעות',
    file: 'cyber-city-lesson4-cases.mp4',
    accent: '#f59e0b',
    icon: '▶',
    visual: 'בודקים כמה הודעות',
    bullets: ['בוחרים הודעה', 'רואים אילו תנאים הופעלו', 'מחליטים מה עושים'],
    code: ['Risk: 75', 'urgent: found', 'action: check source'],
    script: [
      '[encouraging] עכשיו מריצים את הכלי על כמה הודעות.',
      '[clear] בוחרים הודעה אחת בכל פעם ורואים אילו תנאים הופעלו: urgent, gift, verify, now או password.',
      '[practical] המטרה היא להבין למה ה־Risk יצא ככה, ולא להגיב מהר בלי בדיקה.',
    ],
  },
  {
    id: 'report',
    title: 'דוח סיום',
    file: 'cyber-city-lesson4-report.mp4',
    accent: '#0f766e',
    icon: '✓',
    visual: 'מסבירים את בדיקת ההודעה',
    bullets: ['אילו מילים מצאתי', 'למה זה מעלה Risk', 'מה הפעולה הבטוחה'],
    code: ['checked: message words', 'risk: high', 'action: check source'],
    script: [
      '[warm] בשלב האחרון מסכמים כמו חוקרי סייבר.',
      '[clear] כותבים אילו מילים מצאנו בהודעה, למה הן העלו או לא העלו Risk, ומה הפעולה הבטוחה.',
      '[closing] התוצר של השיעור הוא Message Scanner קצר, והבנה עמוקה יותר של תנאי if.',
    ],
  },
];

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: 'inherit', ...options });
  if (result.status !== 0) throw new Error(`${command} failed: ${args.join(' ')}`);
}

function runCapture(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: 'utf8', ...options });
  if (result.status !== 0) throw new Error(`${command} failed: ${args.join(' ')}`);
  return `${result.stdout || ''}${result.stderr || ''}`;
}

function extractGoogleAiKeys() {
  const keys = new Set();
  for (const key of [process.env.GOOGLE_AI_API_KEY, process.env.GEMINI_API_KEY, process.env.GOOGLE_API_KEY]) {
    if (key) keys.add(key.trim());
  }
  for (const file of [
    '/home/igrois/.openclaw/workspace/TOOLS.md',
    '/home/igrois/.openclaw/workspace/geoscale/backend/.env',
  ]) {
    if (!fs.existsSync(file)) continue;
    const text = fs.readFileSync(file, 'utf8');
    for (const match of text.matchAll(/^(?:GOOGLE_AI_API_KEY|GEMINI_API_KEY|GOOGLE_API_KEY)\s*=\s*['"]?([^'"\s]+)['"]?/gm)) {
      if (match[1]) keys.add(match[1].trim());
    }
    for (const match of text.matchAll(/\bAIza[0-9A-Za-z_-]{30,}\b/g)) {
      keys.add(match[0].trim());
    }
  }
  return Array.from(keys);
}

function wavFromPcm16(pcm, sampleRate = 24000) {
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

function narrationText(video) {
  return `TTS in fluent natural Israeli Hebrew.
Character: a warm Israeli instructor speaking to children age 12 in a cyber course.
Style: clear, short, practical, friendly, classroom instruction. Read only the Hebrew lines. Do not read bracket labels.

${video.script.join('\n')}`;
}

async function createGeminiAudio(video) {
  const base = path.join(MARKETING, `cyber-city-lesson4-${video.id}-leda`);
  const scriptPath = `${base}.txt`;
  const audioPath = `${base}.mp3`;
  const text = narrationText(video);
  const previous = fs.existsSync(scriptPath) ? fs.readFileSync(scriptPath, 'utf8') : null;
  fs.writeFileSync(scriptPath, text);
  if (fs.existsSync(audioPath) && previous === text) return audioPath;

  const keys = extractGoogleAiKeys();
  if (!keys.length) throw new Error('Missing Google AI API key');

  const body = {
    contents: [{ parts: [{ text }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: process.env.CYBER_CITY_TTS_VOICE || 'Leda' },
        },
      },
    },
  };

  let lastError = null;
  for (let index = 0; index < keys.length; index += 1) {
    try {
      console.log(`Creating audio for ${video.id} (${index + 1}/${keys.length})`);
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-preview-tts:generateContent', {
        method: 'POST',
        headers: { 'x-goog-api-key': keys[index], 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await response.json().catch(() => null);
      if (!response.ok) throw new Error(`${response.status} ${JSON.stringify(json).slice(0, 800)}`);
      const data = json?.candidates?.[0]?.content?.parts?.find(part => part.inlineData)?.inlineData?.data;
      if (!data) throw new Error(`No audio data: ${JSON.stringify(json).slice(0, 800)}`);
      const pcm = Buffer.from(data, 'base64');
      const pcmPath = `${base}.pcm`;
      const wavPath = `${base}.wav`;
      fs.writeFileSync(pcmPath, pcm);
      fs.writeFileSync(wavPath, wavFromPcm16(pcm, 24000));
      run(ffmpegPath, ['-y', '-i', wavPath, '-b:a', '160k', audioPath]);
      fs.rmSync(pcmPath, { force: true });
      fs.rmSync(wavPath, { force: true });
      return audioPath;
    } catch (error) {
      lastError = error;
      console.warn(`Gemini TTS key ${index + 1} failed for ${video.id}: ${error.message}`);
    }
  }
  throw lastError;
}

function audioDuration(file) {
  const output = runCapture(ffmpegPath, ['-hide_banner', '-i', file, '-f', 'null', '-']);
  const match = output.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
  if (!match) return 18;
  return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
}

function esc(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[char]));
}

function html(video) {
  return `<!doctype html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box}
body{margin:0;width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;font-family:Rubik,Arial,sans-serif;background:#f7fbff;color:#0f172a;direction:rtl}
#stage{position:relative;width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;background:
 radial-gradient(circle at 12% 18%,rgba(14,165,233,.18),transparent 25%),
 radial-gradient(circle at 86% 14%,rgba(245,158,11,.18),transparent 28%),
 linear-gradient(135deg,#f8fbff 0%,#fff7ed 52%,#eef6ff 100%)}
.brand{position:absolute;right:42px;top:30px;display:flex;gap:12px;align-items:center}
.pill{border-radius:999px;padding:10px 16px;background:#0f172a;color:white;font-weight:900;font-size:20px}
.pill.light{background:white;color:${video.accent};border:2px solid #dbeafe}
.title{position:absolute;right:48px;top:102px;width:510px;font-size:68px;line-height:.96;font-weight:900}
.sub{position:absolute;right:52px;top:252px;width:500px;font-size:30px;line-height:1.28;font-weight:800;color:#334155}
.panel{position:absolute;left:52px;top:58px;width:610px;height:430px;border-radius:28px;background:white;border:4px solid rgba(255,255,255,.95);box-shadow:0 26px 62px rgba(15,23,42,.18);padding:28px;display:grid;grid-template-rows:auto 1fr auto;gap:20px}
.visual{display:flex;align-items:center;gap:18px}
.icon{width:92px;height:92px;border-radius:28px;background:${video.accent};color:white;display:grid;place-items:center;font-size:35px;font-weight:900;direction:ltr;box-shadow:0 18px 32px rgba(15,23,42,.18)}
.visual strong{font-size:39px;line-height:1.02}
.bullets{display:grid;gap:13px;align-content:center}
.bullet{border:3px solid #dbeafe;border-radius:18px;background:#f8fafc;padding:14px 18px;font-size:25px;font-weight:900;color:#1f2937}
.bullet.hot{border-color:${video.accent};background:#eff6ff;color:#0f172a}
.code{direction:ltr;text-align:left;background:#111827;color:#dbeafe;border-radius:18px;padding:18px 20px;font:800 27px/1.35 Consolas,"Courier New",monospace;box-shadow:inset 0 0 0 2px rgba(147,197,253,.28)}
.caption{position:absolute;right:42px;bottom:36px;width:585px;min-height:112px;background:rgba(15,23,42,.94);color:white;border:4px solid ${video.accent};border-radius:24px;padding:18px 22px;font-size:31px;line-height:1.22;font-weight:900;box-shadow:0 22px 50px rgba(15,23,42,.28)}
.caption small{display:block;font-size:21px;margin-top:8px;color:#bfdbfe;font-weight:800}
.meter{position:absolute;right:54px;top:412px;width:492px;height:44px;border-radius:999px;background:white;border:3px solid #dbeafe;overflow:hidden;box-shadow:0 12px 26px rgba(15,23,42,.10)}
.fill{height:100%;width:0;background:linear-gradient(90deg,#22c55e,#f59e0b,#ef4444);transition:.45s}
</style>
</head>
<body>
<div id="stage">
  <div class="brand"><span class="pill">Cyber AI Builders</span><span class="pill light">שיעור 4</span></div>
  <div class="title">${esc(video.title)}</div>
  <div class="sub">${esc(video.visual)}</div>
  <section class="panel">
    <div class="visual"><div class="icon">${esc(video.icon)}</div><strong>${esc(video.visual)}</strong></div>
    <div class="bullets">${video.bullets.map((item, index) => `<div class="bullet ${index === 0 ? 'hot' : ''}" data-bullet="${index}">${esc(item)}</div>`).join('')}</div>
    <pre class="code">${video.code.map(esc).join('\n')}</pre>
  </section>
  <div class="meter"><div class="fill" id="fill"></div></div>
  <div class="caption" id="caption">${esc(video.bullets[0])}<small>שלב ${esc(video.title)} בתוך הלומדה</small></div>
</div>
<script>
const bullets = ${JSON.stringify(video.bullets)};
const accent = ${JSON.stringify(video.accent)};
window.setStep = function(index, progress) {
  document.querySelectorAll('.bullet').forEach((item, i) => item.classList.toggle('hot', i === index));
  document.getElementById('caption').innerHTML = bullets[index] + '<small>שלב ${esc(video.title)} בתוך הלומדה</small>';
  document.getElementById('fill').style.width = progress + '%';
};
</script>
</body>
</html>`;
}

async function renderVideo(browser, video) {
  const audioPath = await createGeminiAudio(video);
  const duration = audioDuration(audioPath);
  const outDir = path.join(MARKETING, `cyber-city-lesson4-${video.id}-frames`);
  const silentPath = path.join(MARKETING, `cyber-city-lesson4-${video.id}-silent.mp4`);
  const outPath = path.join(MARKETING, video.file);
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });
  await page.setContent(html(video), { waitUntil: 'load' });

  let frame = 0;
  async function snap() {
    await page.screenshot({ path: path.join(outDir, `frame-${String(frame).padStart(5, '0')}.png`) });
    frame += 1;
  }
  async function hold(seconds, step, progress) {
    await page.evaluate((index, width) => window.setStep(index, width), step, progress);
    await new Promise(resolve => setTimeout(resolve, 240));
    const count = Math.max(1, Math.round(seconds * FPS));
    for (let i = 0; i < count; i += 1) await snap();
  }

  const visualDuration = Math.max(14, duration + 0.8);
  await hold(visualDuration * 0.34, 0, 28);
  await hold(visualDuration * 0.33, 1, 62);
  await hold(visualDuration * 0.33, 2, 100);
  await page.close();

  run(ffmpegPath, ['-y', '-framerate', String(FPS), '-i', path.join(outDir, 'frame-%05d.png'), '-vf', 'format=yuv420p', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-movflags', '+faststart', silentPath]);
  run(ffmpegPath, ['-y', '-i', silentPath, '-i', audioPath, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', outPath]);
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.rmSync(silentPath, { force: true });
  run(ffmpegPath, ['-hide_banner', '-i', outPath, '-f', 'null', '-']);
  console.log(outPath);
}

async function main() {
  fs.mkdirSync(MARKETING, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', `--window-size=${WIDTH},${HEIGHT}`],
    defaultViewport: { width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 },
  });
  try {
    for (const video of videos) {
      await renderVideo(browser, video);
    }
  } finally {
    await browser.close();
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
