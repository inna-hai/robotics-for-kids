const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const MARKETING = path.join(ROOT, 'marketing');
const DATA_VIDEOS = path.join(ROOT, 'data', 'guide-videos');
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

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: 'inherit', ...options });
  if (result.status !== 0) throw new Error(`${command} failed: ${args.join(' ')}`);
}

function runCapture(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: 'utf8', ...options });
  if (result.status !== 0) throw new Error(`${command} failed: ${args.join(' ')}`);
  return `${result.stdout || ''}${result.stderr || ''}`;
}

function getLessons() {
  const source = fs.readFileSync(path.join(ROOT, 'js', 'lessons-data.js'), 'utf8');
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(source, context, { filename: 'lessons-data.js' });
  return context.window.SENSI_LESSONS;
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
      if (match[0]) keys.add(match[0].trim());
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

function scriptFor(lesson) {
  const goals = (lesson.learningGoals || []).slice(0, 3).join('; ');
  const tasks = (lesson.studentTasks || []).slice(0, 3).join(' ואז ');
  const exercise = (lesson.programmingExercises || [])[0]?.studentPrompt || lesson.tip || '';
  return `TTS in fluent natural Israeli Hebrew.
Character: a warm Israeli robotics instructor, clear and practical, preparing a parent or teacher for one Sensi Smart City lesson.
Style: natural, energetic, concise. Read only the Hebrew words. Do not read bracket labels.

[warm opening] שיעור ${lesson.id}: ${lesson.title}.
[clear] היום סנסי עובד באזור ${lesson.cityZone || 'בעיר החכמה'}, ומתמודד עם ${lesson.sensorFocus || 'חיישן ומשימה'}.
[story] הסיפור של השיעור פשוט: ${lesson.story}
[focused] המושג התכנותי המרכזי הוא ${lesson.codingConcept || 'בדיקה ותגובה'}.
[practical] מטרות הלמידה: ${goals}.
[demo] בתחילת השיעור פותחים את הלומדה, מראים את הסביבה, ומשנים מצב אחד מול הילדים כדי שיראו מה החיישן מודד.
[build] אחר כך בונים בבלוקים: ${tasks}.
[exercise] בתרגול הראשון המטרה היא: ${exercise}
[teacher tip] כמדריכים, חשוב להריץ, לבדוק, לשאול מה קרה, ורק אז לתקן. לא לתת פתרון מלא מוקדם מדי.
[closing] בסיום הילדים צריכים להסביר במשפט אחד: סנסי בדק משהו, קיבל החלטה, ואז עשה פעולה מתאימה.`;
}

async function createAudio(lesson, scriptPath, audioBase) {
  const audioMp3 = `${audioBase}.mp3`;
  const script = scriptFor(lesson);
  const previous = fs.existsSync(scriptPath) ? fs.readFileSync(scriptPath, 'utf8') : null;
  fs.writeFileSync(scriptPath, script);
  if (previous === script && fs.existsSync(audioMp3)) return audioMp3;

  const keys = extractGoogleAiKeys();
  if (!keys.length) throw new Error('Missing Google AI API key');
  const body = {
    contents: [{ parts: [{ text: script }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: process.env.SENSI_TTS_VOICE || 'Leda' } } },
    },
  };
  let lastError = null;
  for (let i = 0; i < keys.length; i += 1) {
    try {
      console.log(`Creating lesson ${lesson.id} narration (${i + 1}/${keys.length})`);
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-preview-tts:generateContent', {
        method: 'POST',
        headers: { 'x-goog-api-key': keys[i], 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await response.json().catch(() => null);
      if (!response.ok) throw new Error(`${response.status} ${JSON.stringify(json).slice(0, 800)}`);
      const data = json?.candidates?.[0]?.content?.parts?.find((part) => part.inlineData)?.inlineData?.data;
      if (!data) throw new Error(`No audio data: ${JSON.stringify(json).slice(0, 800)}`);
      const wavPath = `${audioBase}.wav`;
      fs.writeFileSync(wavPath, wavFromPcm16(Buffer.from(data, 'base64')));
      run(ffmpegPath, ['-y', '-i', wavPath, '-b:a', '160k', audioMp3]);
      fs.rmSync(wavPath, { force: true });
      return audioMp3;
    } catch (error) {
      lastError = error;
      console.warn(`Gemini TTS key ${i + 1} failed: ${error.message}`);
    }
  }
  throw lastError;
}

function duration(file) {
  const output = runCapture(ffmpegPath, ['-hide_banner', '-i', file, '-f', 'null', '-']);
  const match = output.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]) : 55;
}

function esc(value) {
  return String(value || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function html(lesson) {
  const goals = (lesson.learningGoals || []).slice(0, 4);
  const blocks = (lesson.blocks || []).slice(0, 6);
  return `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;700;800;900&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box} body{margin:0;width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;font-family:Rubik,Arial,sans-serif;direction:rtl;background:#f7fbff;color:#102033}
#stage{position:relative;width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;background:linear-gradient(135deg,#eff6ff,#f8fafc 45%,#ecfeff)}
.scene{position:absolute;inset:0;display:grid;grid-template-columns:1fr 420px;gap:34px;padding:58px;align-items:center;opacity:0;transform:translateY(22px);transition:.45s ease}
.scene.active{opacity:1;transform:translateY(0)}
.panel{background:rgba(255,255,255,.86);border:1px solid #dbeafe;border-radius:24px;padding:30px;box-shadow:0 24px 60px rgba(15,23,42,.14)}
.kicker{font-weight:900;color:#0369a1;margin-bottom:10px;font-size:30px}
h1{font-size:64px;line-height:1.05;margin:0 0 18px;color:#0f172a}
p{font-size:31px;line-height:1.35;margin:0;color:#334155}.small{font-size:24px;color:#475569;margin-top:18px}
.robot{height:520px;border-radius:34px;background:linear-gradient(160deg,#075985,#14b8a6);position:relative;overflow:hidden;box-shadow:0 30px 80px rgba(3,105,161,.28)}
.sun{position:absolute;width:180px;height:180px;border-radius:999px;background:#fde68a;left:55px;top:42px}.road{position:absolute;inset:auto -30px 0 -30px;height:170px;background:#334155;transform:skewY(-6deg)}
.bot{position:absolute;right:142px;bottom:126px;width:180px;height:146px;border-radius:44px 44px 28px 28px;background:#f8fafc;border:8px solid #0f172a;box-shadow:0 16px 0 rgba(15,23,42,.22)}
.bot:before,.bot:after{content:"";position:absolute;top:45px;width:30px;height:30px;border-radius:999px;background:#0ea5e9}.bot:before{right:42px}.bot:after{left:42px}.antenna{position:absolute;right:222px;bottom:258px;width:12px;height:80px;background:#0f172a;border-radius:999px}.antenna:after{content:"";position:absolute;top:-24px;right:-14px;width:40px;height:40px;border-radius:999px;background:#facc15}
.bubble{position:absolute;right:300px;top:74px;max-width:380px;background:white;border-radius:24px;padding:20px 24px;font-size:30px;font-weight:900;color:#0f172a;box-shadow:0 18px 45px rgba(15,23,42,.18)}
ul{margin:14px 0 0;padding:0;list-style:none;display:grid;gap:12px}li{font-size:27px;background:#eef2ff;border-right:8px solid #2563eb;border-radius:16px;padding:12px 16px;font-weight:700}.chip{display:inline-block;background:#ecfeff;border:1px solid #67e8f9;border-radius:999px;padding:10px 16px;margin:7px;font-size:24px;font-weight:800}
.caption{position:absolute;right:52px;bottom:34px;left:52px;background:rgba(15,23,42,.84);color:white;border-radius:22px;padding:20px 28px;font-size:34px;font-weight:900;text-align:right}
</style></head><body><div id="stage">
<section class="scene active" id="s0"><div><div class="kicker">סנסי בעיר החכמה · שיעור ${lesson.id}</div><h1>${esc(lesson.title)}</h1><p>${esc(lesson.story)}</p><div class="small">אזור: ${esc(lesson.cityZone)} · חיישן: ${esc(lesson.sensorFocus)}</div></div><div class="robot"><div class="sun"></div><div class="bubble">שלום! אני סנסי</div><div class="antenna"></div><div class="bot"></div><div class="road"></div></div></section>
<section class="scene" id="s1"><div class="panel"><div class="kicker">מטרות למדריך</div><h1>מה הילדים לומדים?</h1><ul>${goals.map((g) => `<li>${esc(g)}</li>`).join('')}</ul></div><div class="panel"><div class="kicker">מושג תכנותי</div><p>${esc(lesson.codingConcept)}</p><div class="small">${esc(lesson.tip)}</div></div></section>
<section class="scene" id="s2"><div class="panel"><div class="kicker">בלוקים מרכזיים</div><h1>מה בונים?</h1>${blocks.map((b) => `<span class="chip">${esc(b)}</span>`).join('')}</div><div class="panel"><div class="kicker">בדיקה בכיתה</div><p>${esc((lesson.studentTasks || []).slice(0, 3).join(' → '))}</p></div></section>
<section class="scene" id="s3"><div class="panel"><div class="kicker">סיכום</div><h1>בדיקה → החלטה → פעולה</h1><p>בסוף השיעור הילדים מסבירים מה סנסי בדק, איזו החלטה התקבלה, ומה הפעולה שקרתה בעקבותיה.</p></div><div class="robot"><div class="sun"></div><div class="bubble">הרצנו, בדקנו, תיקנו</div><div class="antenna"></div><div class="bot"></div><div class="road"></div></div></section>
<div class="caption" id="caption">סרטון הכנה קצר למדריך ולהורה</div></div>
<script>
window.showScene = (index) => {
  document.querySelectorAll('.scene').forEach((el, i) => el.classList.toggle('active', i === index));
  document.getElementById('caption').textContent = ['פותחים בסיפור של העיר והבעיה', 'מגדירים מטרות וחיישן מרכזי', 'בונים בלוקים ובודקים מצבים', 'מסכמים בשפה של הילדים'][index] || '';
};
</script></body></html>`;
}

async function renderLesson(lesson) {
  fs.mkdirSync(MARKETING, { recursive: true });
  fs.mkdirSync(DATA_VIDEOS, { recursive: true });
  const padded = String(lesson.id).padStart(2, '0');
  const base = path.join(MARKETING, `sensi-lesson-${padded}-parent-guide`);
  const scriptPath = `${base}.txt`;
  const audioMp3 = await createAudio(lesson, scriptPath, base);
  const silentMp4 = `${base}-silent.mp4`;
  const finalMp4 = path.join(DATA_VIDEOS, `sensi-lesson-${padded}-parent-guide.mp4`);
  const framesDir = path.join(MARKETING, `sensi-lesson-${padded}-parent-guide-frames`);
  const audioSeconds = duration(audioMp3);
  const sceneSeconds = [audioSeconds * 0.28, audioSeconds * 0.25, audioSeconds * 0.26, audioSeconds * 0.21];

  fs.rmSync(framesDir, { recursive: true, force: true });
  fs.mkdirSync(framesDir, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', `--window-size=${WIDTH},${HEIGHT}`],
    defaultViewport: { width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 },
  });
  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });
  await page.setContent(html(lesson), { waitUntil: 'load' });
  let frame = 0;
  async function snap() {
    await page.screenshot({ path: path.join(framesDir, `frame-${String(frame).padStart(5, '0')}.png`) });
    frame += 1;
  }
  async function hold(seconds) {
    const count = Math.max(1, Math.round(seconds * FPS));
    for (let i = 0; i < count; i += 1) await snap();
  }
  for (let i = 0; i < sceneSeconds.length; i += 1) {
    await page.evaluate((sceneIndex) => window.showScene(sceneIndex), i);
    await new Promise((resolve) => setTimeout(resolve, 500));
    await hold(sceneSeconds[i]);
  }
  await browser.close();
  run(ffmpegPath, ['-y', '-framerate', String(FPS), '-i', path.join(framesDir, 'frame-%05d.png'), '-vf', 'format=yuv420p', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-movflags', '+faststart', silentMp4]);
  run(ffmpegPath, ['-y', '-i', silentMp4, '-i', audioMp3, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', finalMp4]);
  fs.rmSync(framesDir, { recursive: true, force: true });
  fs.rmSync(silentMp4, { force: true });
  run(ffmpegPath, ['-hide_banner', '-i', finalMp4, '-f', 'null', '-']);
  console.log(finalMp4);
}

async function main() {
  const wanted = (process.argv.slice(2).length ? process.argv.slice(2) : ['5', '11', '14', '15']).map(Number);
  const lessons = getLessons();
  for (const lessonId of wanted) {
    const lesson = lessons.find((item) => item.id === lessonId);
    if (!lesson) throw new Error(`Missing Sensi lesson ${lessonId}`);
    await renderLesson(lesson);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
