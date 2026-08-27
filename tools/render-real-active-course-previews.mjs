import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import puppeteer from 'puppeteer-core';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
const MARKETING = path.join(ROOT, 'marketing');
const FRAME_ROOT = path.join(MARKETING, 'real-active-course-preview-frames');
const FFMPEG = ffmpegInstaller.path;
const FPS = 15;
const BASE_URL = process.env.PREVIEW_BASE_URL || 'http://127.0.0.1:3137';
const CHROMIUM = process.env.CHROMIUM || '/usr/bin/chromium-browser';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const courses = [
  {
    slug: 'sensi-city',
    url: '/sensi-city.html?lesson=1',
    script: `TTS in fluent natural Israeli Hebrew.
Character: warm, curious Israeli course narrator. Natural, expressive, inviting. Do not read bracket labels.

[warm] כאן לא מסתכלים רק על תמונה של קורס. נכנסים ממש לשיעור של סנסי בעיר החכמה.
[curious] הילדים רואים בעיה בעיר: רחוב חשוך, חיישן אור, ופנס שצריך להידלק בזמן הנכון.
[focused] בצד אחד יש סימולציה חיה של העיר, ובצד השני בונים את ההיגיון עם בלוקים.
[encouraging] הלמידה היא ניסוי: בונים תנאי, מריצים, בודקים מה קרה, ומשפרים את הפתרון.
[closing] ככה רובוטיקה הופכת למשהו ברור: חיישן, החלטה, פעולה, ופידבק מיידי על המסך.`
  },
  {
    slug: 'python-turtle',
    url: '/python-turtle.html',
    script: `TTS in fluent natural Israeli Hebrew.
Character: warm, curious Israeli course narrator. Natural, expressive, inviting. Do not read bracket labels.

[warm] ב־Python Turtle הילדים עוברים מקוביות לקוד אמיתי, אבל דרך ציור שהם רואים מיד.
[curious] גוררים בלוקים, והמערכת מראה איך הם הופכים לשורות Python.
[focused] אחר כך לוחצים על דוגמת הפעלה או הרצת ציור, ורואים את הצב מצייר על המסך.
[encouraging] זה רגע חשוב: הילד משנה פקודה קטנה, מריץ שוב, ומבין מה הקוד שלו עשה.
[closing] ככה לומדים Python בלי לקפוץ ישר לתיאוריה — דרך פעולה, תוצאה, ותיקון.`
  },
  {
    slug: 'webcode',
    url: '/webcode-play.html?lesson=1',
    script: `TTS in fluent natural Israeli Hebrew.
Character: warm, curious Israeli course narrator. Natural, expressive, inviting. Do not read bracket labels.

[warm] ב־Web Code הילדים בונים אתר אמיתי, לא רק קוראים על HTML ו־CSS.
[focused] הם עובדים עם בלוקים, ורואים איך כל בלוק יוצר חלק בעמוד.
[curious] בצד שמאל יש תצוגה חיה: משנים כותרת, צבע או כפתור, ומיד רואים מה נוצר.
[encouraging] אחר כך בודקים את התרגיל, מקבלים משוב, וממשיכים שלב אחרי שלב.
[closing] זו הצצה ללמידה שמחברת בין בלוק, קוד, ותוצר חי בדפדפן.`
  },
  {
    slug: 'minecraft',
    url: '/minecraft-play.html?lesson=1',
    script: `TTS in fluent natural Israeli Hebrew.
Character: warm, playful Israeli course narrator. Natural, expressive, inviting. Do not read bracket labels.

[warm] בקורס Minecraft הילדים לומדים תכנון וקוד בתוך עולם שהם כבר אוהבים.
[curious] השיעור נותן סיפור, מטרה, ובלוקים שמפעילים את דוד בעולם.
[focused] מחברים בלוקים מתחת ל־כאשר לוחצים הרצה, ואז מריצים ורואים את העולם משתנה.
[excited] בלוק אחרי בלוק נבנים מגדל, דרך או משימה, והילדים מבינים את הרצף.
[closing] זה לא רק משחק; זו דרך לראות איך תכנון מדויק הופך לפעולה בתוך עולם חי.`
  }
];

function run(cmd, args, opts = {}) {
  const result = spawnSync(cmd, args, { encoding: 'utf8', ...opts });
  if (result.status !== 0) {
    throw new Error(`${cmd} failed\n${result.stdout || ''}\n${result.stderr || ''}`);
  }
  return result;
}

function findApiKeys() {
  const keys = [process.env.GOOGLE_AI_API_KEY, process.env.GEMINI_API_KEY, process.env.GOOGLE_API_KEY].filter(Boolean);
  const envPath = '/home/igrois/.openclaw/workspace/geoscale/backend/.env';
  if (fs.existsSync(envPath)) {
    const text = fs.readFileSync(envPath, 'utf8');
    for (const match of text.matchAll(/^(?:GOOGLE_AI_API_KEY|GEMINI_API_KEY|GOOGLE_API_KEY)\s*=\s*['"]?([^'"\s]+)['"]?/gm)) {
      keys.push(match[1]);
    }
  }
  return [...new Set(keys)];
}

async function createNarration(course) {
  fs.mkdirSync(MARKETING, { recursive: true });
  const scriptPath = path.join(MARKETING, `${course.slug}-real-preview-gemini-script.txt`);
  const outBase = path.join(MARKETING, `${course.slug}-real-preview-gemini-leda`);
  const outMp3 = `${outBase}.mp3`;
  fs.writeFileSync(scriptPath, course.script);
  if (fs.existsSync(outMp3) && process.env.FORCE_REAL_PREVIEW_TTS !== '1') {
    return { audioPath: outMp3, provider: 'existing' };
  }

  const body = {
    contents: [{ parts: [{ text: course.script }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Leda' } } }
    }
  };

  let lastError = null;
  for (const key of findApiKeys()) {
    try {
      const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-preview-tts:generateContent', {
        method: 'POST',
        headers: { 'x-goog-api-key': key, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(`${res.status} ${json?.error?.status || ''} ${json?.error?.message || ''}`);
      const data = json?.candidates?.[0]?.content?.parts?.find((part) => part.inlineData)?.inlineData?.data;
      if (!data) throw new Error('Gemini returned no audio');
      fs.writeFileSync(`${outBase}.pcm`, Buffer.from(data, 'base64'));
      run(FFMPEG, ['-y', '-f', 's16le', '-ar', '24000', '-ac', '1', '-i', `${outBase}.pcm`, `${outBase}.wav`], { stdio: 'inherit' });
      run(FFMPEG, ['-y', '-i', `${outBase}.wav`, '-b:a', '160k', outMp3], { stdio: 'inherit' });
      return { audioPath: outMp3, provider: 'gemini' };
    } catch (error) {
      lastError = error;
    }
  }

  if (process.env.ALLOW_EDGE_TTS !== '1') {
    throw new Error(`Gemini TTS unavailable for ${course.slug}: ${lastError?.message || 'no API key'}`);
  }

  const { EdgeTTS } = require('@andresaya/edge-tts');
  const clean = course.script.split('\n').filter((line) => !line.startsWith('TTS ') && !line.startsWith('Character:')).map((line) => line.replace(/^\[[^\]]+\]\s*/, '')).join('\n');
  const tts = new EdgeTTS();
  await tts.synthesize(clean, 'he-IL-HilaNeural', { rate: '-6%', volume: '+0%' });
  await tts.toFile(outBase);
  if (!fs.existsSync(outMp3) && fs.existsSync(outBase)) fs.copyFileSync(outBase, outMp3);
  return { audioPath: outMp3, provider: 'edge-fallback' };
}

function mediaDuration(file) {
  const result = spawnSync(FFMPEG, ['-hide_banner', '-i', file, '-f', 'null', '-'], { encoding: 'utf8' });
  const match = (result.stderr || '').match(/Duration: (\d+):(\d+):(\d+\.\d+)/);
  if (!match) return 34;
  return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
}

async function preparePage(page) {
  await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
  await page.addStyleTag({ content: `
    *{scrollbar-width:none!important}::-webkit-scrollbar{display:none!important}
    #rfw-launcher,.platform-home-link{display:none!important}
    #realPreviewCaption{position:fixed;right:30px;bottom:24px;z-index:999999;max-width:720px;background:rgba(15,23,42,.88);color:#fff;border-radius:22px;padding:15px 20px;font:900 28px/1.25 Rubik,Arial,sans-serif;text-align:right;direction:rtl;box-shadow:0 18px 45px rgba(15,23,42,.28)}
    #realPreviewCaption small{display:block;color:#bae6fd;font-size:18px;margin-top:5px}
    .real-preview-spot{outline:7px solid #facc15!important;box-shadow:0 0 0 12px rgba(250,204,21,.25),0 18px 42px rgba(15,23,42,.28)!important;border-radius:18px!important}
  `});
  await page.evaluate(() => {
    const c = document.createElement('div');
    c.id = 'realPreviewCaption';
    c.innerHTML = 'הצצה מתוך השיעור <small>צילום אמיתי של הלומדה</small>';
    document.body.appendChild(c);
  });
}

async function caption(page, title, sub = '') {
  await page.evaluate((title, sub) => {
    const c = document.getElementById('realPreviewCaption');
    if (c) c.innerHTML = `${title}${sub ? `<small>${sub}</small>` : ''}`;
  }, title, sub);
}

async function spot(page, selector) {
  await page.evaluate((selector) => {
    document.querySelectorAll('.real-preview-spot').forEach((el) => el.classList.remove('real-preview-spot'));
    document.querySelector(selector)?.classList.add('real-preview-spot');
  }, selector);
}

async function clickText(page, text) {
  await page.evaluate((text) => {
    const elements = [...document.querySelectorAll('button,a')];
    const el = elements.find((item) => item.innerText && item.innerText.includes(text));
    el?.click();
  }, text);
}

async function snap(page, frameDir, frame) {
  await page.screenshot({ path: path.join(frameDir, `frame-${String(frame.value++).padStart(5, '0')}.png`), type: 'png' });
}

async function hold(page, frameDir, frame, seconds) {
  const count = Math.round(seconds * FPS);
  for (let i = 0; i < count; i += 1) await snap(page, frameDir, frame);
}

async function courseTimeline(page, course, frameDir, frame) {
  if (course.slug === 'sensi-city') {
    await clickText(page, 'התחילו בשיעור 1');
    await sleep(600);
    await caption(page, 'פותחים שיעור אמיתי בסנסי', 'סיפור עירוני, חיישן אור וסימולציה חיה');
    await spot(page, '.challenge-section, .mission-panel, #lessonDrawer');
    await hold(page, frameDir, frame, 5);
    await caption(page, 'בונים היגיון ב־Blockly', 'הילדים מחברים תנאי ופעולה לרובוט');
    await spot(page, '#blocklyDiv, .blockly-workspace-shell');
    await hold(page, frameDir, frame, 6);
    await caption(page, 'בודקים בסימולציה', 'מריצים, רואים מה קרה, ומשפרים');
    await spot(page, '#simulationCanvas, .simulation-area, canvas');
    await hold(page, frameDir, frame, 7);
    await page.evaluate(() => { try { document.querySelector('#precheckButton')?.click(); } catch {} });
    await caption(page, 'הפידבק עוזר לתקן', 'לא מנחשים — בודקים כמו מהנדסים');
    await hold(page, frameDir, frame, 8);
    return;
  }

  if (course.slug === 'python-turtle') {
    await caption(page, 'גוררים בלוקים ורואים Python', 'הקוד נוצר ליד אזור העבודה');
    await spot(page, '#blocklyDiv, .blockly-area');
    await hold(page, frameDir, frame, 5);
    await caption(page, 'מפעילים דוגמה מתוך השיעור', 'הצב מצייר לפי הפקודות');
    await page.click('#demoBtn').catch(() => {});
    await hold(page, frameDir, frame, 3);
    await spot(page, '#stage, .canvas-card');
    await page.click('#runBtn').catch(() => {});
    await hold(page, frameDir, frame, 10);
    await caption(page, 'משנים, מריצים, ומשווים תוצאה', 'זה המעבר הרך לקוד אמיתי');
    await spot(page, '.code-box, #drawCanvas');
    await hold(page, frameDir, frame, 8);
    return;
  }

  if (course.slug === 'webcode') {
    await caption(page, 'בונים עמוד Web אמיתי', 'Blockly יוצר HTML/CSS/JS');
    await spot(page, '#blocklyDiv, #realBlockly');
    await hold(page, frameDir, frame, 6);
    await page.evaluate(() => { try { window.runCode?.(); } catch {} });
    await caption(page, 'פותחים את הקוד שנוצר', 'רואים ממש HTML, CSS ו־JavaScript');
    await page.evaluate(() => {
      try {
        window.showGeneratedCode?.();
        document.querySelector('#codePeek')?.scrollIntoView({ block: 'nearest' });
      } catch {}
    });
    await spot(page, '#codePeek, .code-box');
    await hold(page, frameDir, frame, 4);
    await caption(page, 'HTML בונה את מבנה העמוד', 'הכותרת, הפסקה והכפתור מגיעים מהבלוקים');
    await page.evaluate(() => document.querySelector('.editor-tabs button:nth-child(1)')?.click());
    await hold(page, frameDir, frame, 4);
    await caption(page, 'CSS מעצב את מה שרואים', 'צבעים, ריווחים וצורת הכרטיס');
    await page.evaluate(() => document.querySelector('.editor-tabs button:nth-child(2)')?.click());
    await hold(page, frameDir, frame, 4);
    await caption(page, 'JavaScript מוסיף פעולה', 'הכפתור יודע להגיב ללחיצה');
    await page.evaluate(() => document.querySelector('.editor-tabs button:nth-child(3)')?.click());
    await hold(page, frameDir, frame, 4);
    await caption(page, 'התצוגה החיה מתעדכנת', 'הילד רואה אתר שהוא בונה בעצמו');
    await spot(page, '#previewPanel, iframe');
    await hold(page, frameDir, frame, 3);
    await caption(page, 'בודקים את התרגיל', 'מקבלים משוב וממשיכים לשלב הבא');
    await spot(page, '#exercises, #feedback');
    await page.evaluate(() => { try { window.checkExercise?.(); } catch {} });
    await hold(page, frameDir, frame, 9);
    return;
  }

  if (course.slug === 'minecraft') {
    await caption(page, 'שיעור Minecraft אמיתי', 'סיפור, מטרה ובלוקים שמפעילים את העולם');
    await spot(page, '#world, .world');
    await hold(page, frameDir, frame, 5);
    await caption(page, 'מחברים בלוקים להרצה', 'כל בלוק הופך לפעולה בעולם');
    await spot(page, '#blocklyDiv, .code-panel');
    await hold(page, frameDir, frame, 5);
    await caption(page, 'לוחצים הרצה ורואים בנייה', 'דוד מדבר, זז, ומניח בלוקים');
    await spot(page, '#world, .world');
    await page.evaluate(() => { try { window.runProgram?.(); } catch {} });
    await hold(page, frameDir, frame, 12);
    await caption(page, 'ככה תכנון הופך לתוצר', 'רצף פעולות ברור בתוך עולם מוכר');
    await hold(page, frameDir, frame, 6);
  }
}

async function renderCourse(course, audioPath) {
  const frameDir = path.join(FRAME_ROOT, course.slug);
  fs.rmSync(frameDir, { recursive: true, force: true });
  fs.mkdirSync(frameDir, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: CHROMIUM,
    headless: 'new',
    timeout: 120000,
    userDataDir: path.join('/tmp', `real-course-preview-${course.slug}-${Date.now()}`),
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--no-first-run', '--noerrdialogs']
  });
  const page = await browser.newPage();
  await page.goto(`${BASE_URL}${course.url}`, { waitUntil: 'networkidle2', timeout: 90000 });
  await preparePage(page);
  const frame = { value: 0 };
  await courseTimeline(page, course, frameDir, frame);
  const audioSeconds = mediaDuration(audioPath);
  const visualSeconds = frame.value / FPS;
  if (visualSeconds < audioSeconds + 0.4) {
    await hold(page, frameDir, frame, audioSeconds + 0.4 - visualSeconds);
  }
  await browser.close();

  const silentPath = path.join(MARKETING, `${course.slug}-real-course-preview-silent.mp4`);
  const outPath = path.join(MARKETING, `${course.slug}-real-course-preview.mp4`);
  run(FFMPEG, ['-y', '-framerate', String(FPS), '-i', path.join(frameDir, 'frame-%05d.png'), '-vf', 'format=yuv420p', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-movflags', '+faststart', silentPath], { stdio: 'inherit' });
  run(FFMPEG, ['-y', '-i', silentPath, '-i', audioPath, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', outPath], { stdio: 'inherit' });
  console.log(`${outPath} (${mediaDuration(outPath).toFixed(1)}s)`);
  return outPath;
}

const outputs = [];
const providers = {};
const selectedCourses = process.env.COURSE ? courses.filter((course) => course.slug === process.env.COURSE) : courses;
for (const course of selectedCourses) {
  const { audioPath, provider } = await createNarration(course);
  providers[course.slug] = provider;
  outputs.push(await renderCourse(course, audioPath));
}

const sisiSource = path.join(MARKETING, 'sisi-marketing-demo-gemini-child8-synced.mp4');
const sisiOutput = path.join(MARKETING, 'sisi-real-course-preview.mp4');
if (fs.existsSync(sisiSource)) {
  fs.copyFileSync(sisiSource, sisiOutput);
  outputs.splice(1, 0, sisiOutput);
  providers.sisi = 'existing-gemini';
}

fs.writeFileSync(path.join(MARKETING, 'real-active-course-preview-manifest.json'), JSON.stringify({ outputs, providers }, null, 2));
console.log(JSON.stringify({ outputs, providers }, null, 2));
