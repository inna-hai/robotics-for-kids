import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
const MARKETING = path.join(ROOT, 'marketing');
const FRAME_ROOT = path.join(MARKETING, 'active-course-preview-frames');
const SNAP_ROOT = '/home/igrois/snap/chromium/common/openclaw-active-course-previews';
const WIDTH = 1280;
const HEIGHT = 720;
const FPS = 30;
const FFMPEG = ffmpegInstaller.path;
const CHROMIUM = process.env.CHROMIUM || 'chromium';

const courses = [
  {
    slug: 'sensi-city',
    file: 'sensi-city.html?lesson=1',
    title: 'סנסי בעיר החכמה',
    subtitle: '15 שיעורי רובוטיקה, חיישנים ו־Blockly',
    cover: 'assets/course-covers/sensi-city.svg',
    gradient: ['#2563eb', '#06b6d4'],
    script: [
      '[curious] בקורס סנסי בעיר החכמה, הילדים נכנסים לעולם של רובוטיקה דרך משימות אמיתיות בעיר.',
      '[focused] בכל שיעור הם בונים רצף פקודות ב־Blockly, מפעילים את סנסי, ובודקים אם היא הגיעה למטרה.',
      '[warm] הם לומדים חיישנים, כיוונים, תנאים, לולאות ודיוק — אבל הכל מרגיש כמו משימה משחקית.',
      '[excited] מה שכיף כאן הוא שרואים מיד אם הרובוט הצליח, ואז משפרים את הפתרון כמו מהנדסים קטנים.',
      '[closing] זו לומדה יציבה לפתיחה מהירה: נכנסים, בוחרים שיעור, ומתחילים לתכנת רובוט בעיר חכמה.'
    ],
    points: ['רובוטיקה עם סיפור', 'Blockly וחיישנים', '15 שיעורים מלאים', 'בדיקה מיידית של הפתרון']
  },
  {
    slug: 'sisi',
    file: 'sisi.html',
    title: 'סדרת סיסי לכיתות ב׳',
    subtitle: 'חשיבה אלגוריתמית דרך סיפור ומשחק',
    cover: 'assets/course-covers/sisi.svg',
    gradient: ['#ec4899', '#8b5cf6'],
    script: [
      '[excited] בסדרת סיסי הילדים מתחילים לחשוב כמו מתכנתים, עוד לפני שהם פותחים קוד אמיתי.',
      '[playful] כל משימה היא סיפור קטן: סיסי צריכה להגיע, לאסוף, לבחור דרך, או לפתור בעיה.',
      '[focused] הילדים מסדרים צעדים, בודקים רצף, משתמשים בתנאים ולולאות, ולומדים לתקן טעויות בלי לחץ.',
      '[warm] זה מתאים במיוחד לגילים צעירים, כי הכל ברור, צבעוני, קצר, ומרגיש כמו משחק עם מטרה.',
      '[closing] בסוף הסדרה הילדים כבר מבינים מה זה אלגוריתם, למה סדר חשוב, ואיך בונים פתרון צעד אחרי צעד.'
    ],
    points: ['כיתות ב׳', 'סיפור ומשחק', 'רצפים, תנאים ולולאות', '15 משימות הדרגתיות']
  },
  {
    slug: 'python-turtle',
    file: 'python-turtle.html',
    title: 'Python Turtle',
    subtitle: 'מעבר נעים לקוד אמיתי דרך ציור',
    cover: 'assets/course-covers/python-turtle.svg',
    gradient: ['#ea580c', '#facc15'],
    script: [
      '[curious] ב־Python Turtle הילדים עושים את המעבר מקוביות לקוד אמיתי בצורה רכה וכיפית.',
      '[focused] במקום להתחיל מתיאוריה, הם כותבים פקודות שמזיזות צב, מציירות צורות, צבעים ודפוסים.',
      '[thinking aloud] ככה לומדים משתנים, לולאות ופונקציות דרך משהו שרואים על המסך מיד.',
      '[excited] כל שינוי קטן בקוד משנה את הציור, וזה נותן תחושת הצלחה מאוד מהירה.',
      '[closing] זו לומדה מצוינת לילדים שכבר מוכנים לכתוב Python, אבל עדיין צריכים חוויה ויזואלית וברורה.'
    ],
    points: ['30 שיעורים', 'Python אמיתי', 'ציור וצורות', 'לולאות ופונקציות']
  },
  {
    slug: 'webcode',
    file: 'webcode.html',
    title: 'Web Code',
    subtitle: 'HTML, CSS ו־JavaScript בפרויקטים קטנים',
    cover: 'assets/course-covers/webcode.svg',
    gradient: ['#111827', '#4f46e5'],
    script: [
      '[confident] Web Code הוא המקום שבו ילדים מתחילים לבנות דברים שרואים בדפדפן.',
      '[focused] הם נוגעים ב־HTML, מעצבים עם CSS, ומוסיפים התנהגות עם JavaScript.',
      '[warm] כל שיעור נותן פרויקט קטן וברור: כרטיס, עמוד, כפתור, משחקון או אינטראקציה.',
      '[excited] היתרון הוא שהילדים לא רק לומדים קוד — הם רואים אתר חי שהם יצרו בעצמם.',
      '[closing] זו לומדה פעילה שמתאימה למעבר לעולם ה־Web, עם הרבה מקום ליצירתיות.'
    ],
    points: ['HTML', 'CSS', 'JavaScript', 'פרויקטים בדפדפן']
  },
  {
    slug: 'minecraft',
    file: 'minecraft.html',
    title: 'Minecraft',
    subtitle: 'תכנון, בנייה וחשיבה מערכתית',
    cover: 'assets/course-covers/minecraft.svg',
    gradient: ['#16a34a', '#64748b'],
    script: [
      '[excited] בקורס Minecraft הילדים נכנסים לעולם שהם כבר אוהבים, אבל עובדים בו בצורה מתוכננת.',
      '[focused] הם מקבלים אתגר, חושבים על מבנה, מחלקים משימה לשלבים, ובונים פתרון בתוך עולם מוכר.',
      '[warm] הלמידה כאן היא לא רק בנייה חופשית; היא תכנון, שיתוף פעולה, בדיקה ושיפור.',
      '[curious] זה מקום טוב לחבר בין יצירתיות לבין חשיבה טכנולוגית ומערכתית.',
      '[closing] בסוף הילדים יוצאים עם תוצר שהם יכולים להראות, להסביר, ולשפר כמו פרויקט אמיתי.'
    ],
    points: ['עולם מוכר לילדים', 'תכנון משימות', 'בנייה יצירתית', 'עבודת צוות']
  }
];

function run(cmd, args, opts = {}) {
  const result = spawnSync(cmd, args, { encoding: 'utf8', ...opts });
  if (result.status !== 0) {
    throw new Error(`${cmd} failed:\n${result.stdout || ''}\n${result.stderr || ''}`);
  }
  return result;
}

function findApiKeys() {
  const keys = [process.env.GOOGLE_AI_API_KEY, process.env.GEMINI_API_KEY, process.env.GOOGLE_API_KEY].filter(Boolean);
  const envFiles = [
    path.join(ROOT, '.env'),
    '/home/igrois/.openclaw/workspace/geoscale/backend/.env',
  ];
  for (const envPath of envFiles) {
    if (!fs.existsSync(envPath)) continue;
    const text = fs.readFileSync(envPath, 'utf8');
    for (const match of text.matchAll(/^(?:GOOGLE_AI_API_KEY|GEMINI_API_KEY|GOOGLE_API_KEY)\s*=\s*['"]?([^'"\s]+)['"]?/gm)) {
      keys.push(match[1]);
    }
  }
  return [...new Set(keys)];
}

async function createAudio(course) {
  const scriptPath = path.join(MARKETING, `${course.slug}-course-preview-script.txt`);
  const audioBase = path.join(MARKETING, `${course.slug}-course-preview-gemini-leda`);
  const audioPath = `${audioBase}.mp3`;
  const text = [
    'TTS in fluent natural Israeli Hebrew.',
    'Character: a warm, energetic Israeli course narrator for kids and parents. Not robotic. Friendly, clear, and inviting.',
    'Style: short, lively, concrete, with natural pauses. Do not read bracket labels. Bracket labels are acting directions only.',
    '',
    ...course.script
  ].join('\n');
  fs.writeFileSync(scriptPath, text);
  if (fs.existsSync(audioPath)) {
    return { scriptPath, audioPath };
  }

  const keys = findApiKeys();

  const body = {
    contents: [{ parts: [{ text }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: process.env.COURSE_PREVIEW_TTS_VOICE || 'Leda' } }
      }
    }
  };

  let lastError;
  for (const [index, key] of keys.entries()) {
    try {
      console.log(`Creating narration for ${course.slug} (${index + 1}/${keys.length})`);
      const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-preview-tts:generateContent', {
        method: 'POST',
        headers: { 'x-goog-api-key': key, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(`${res.status} ${JSON.stringify(json).slice(0, 1000)}`);
      const data = json?.candidates?.[0]?.content?.parts?.find((part) => part.inlineData)?.inlineData?.data;
      if (!data) throw new Error(`No audio data: ${JSON.stringify(json).slice(0, 1000)}`);
      fs.writeFileSync(`${audioBase}.pcm`, Buffer.from(data, 'base64'));
      run(FFMPEG, ['-y', '-f', 's16le', '-ar', '24000', '-ac', '1', '-i', `${audioBase}.pcm`, `${audioBase}.wav`], { stdio: 'inherit' });
      run(FFMPEG, ['-y', '-i', `${audioBase}.wav`, '-b:a', '160k', audioPath], { stdio: 'inherit' });
      return { scriptPath, audioPath };
    } catch (error) {
      lastError = error;
      console.warn(`Narration failed for ${course.slug} with key ${index + 1}: ${error.message}`);
    }
  }
  console.warn(`Gemini narration unavailable for ${course.slug}; falling back to Edge TTS: ${lastError?.message || 'no key'}`);
  const { EdgeTTS } = require('@andresaya/edge-tts');
  const cleanText = course.script
    .map((line) => line.replace(/^\[[^\]]+\]\s*/, ''))
    .join('\n\n');
  const tts = new EdgeTTS();
  await tts.synthesize(cleanText, 'he-IL-HilaNeural', { rate: '-6%', volume: '+0%' });
  await tts.toFile(audioBase);
  if (!fs.existsSync(audioPath)) {
    const candidate = fs.existsSync(audioBase) ? audioBase : `${audioBase}.mp3`;
    if (candidate !== audioPath && fs.existsSync(candidate)) fs.copyFileSync(candidate, audioPath);
  }
  if (!fs.existsSync(audioPath)) throw new Error(`Edge TTS did not create ${audioPath}`);
  return { scriptPath, audioPath };
}

function duration(audioPath) {
  const result = spawnSync(FFMPEG, ['-hide_banner', '-i', audioPath, '-f', 'null', '-'], { encoding: 'utf8' });
  const output = `${result.stdout || ''}\n${result.stderr || ''}`;
  const match = output.match(/Duration: (\d+):(\d+):(\d+\.\d+)/);
  if (!match) return 42;
  return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
}

function html(course, slide) {
  const [a, b] = course.gradient;
  const coverSvg = fs.readFileSync(path.join(ROOT, course.cover), 'utf8');
  const title = [
    course.title,
    'מה עושים בקורס?',
    'איך זה נראה לילדים?',
    'מה לומדים בדרך?',
    'למי זה מתאים?',
    'פותחים ומתחילים'
  ][slide];
  const body = [
    course.subtitle,
    course.points.slice(0, 2).join(' · '),
    'משימה קצרה, פעולה על המסך, בדיקה ושיפור.',
    course.points.slice(2).join(' · '),
    'לילדים שאוהבים ליצור, לבדוק, לטעות ולשפר.',
    'נכנסים מהקטלוג ובוחרים את נקודת ההתחלה.'
  ][slide];
  const side = [
    'הצצה לקורס',
    'למידה פעילה',
    'חוויה משחקית',
    'כלים טכנולוגיים',
    'קצב הדרגתי',
    'מוכן לפתיחה'
  ][slide];

  return `<!doctype html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8">
<style>
*{box-sizing:border-box}body{margin:0;width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;font-family:Rubik,Arial,sans-serif;background:#f6f8fb;color:#0f172a}
.stage{width:${WIDTH}px;height:${HEIGHT}px;background:linear-gradient(135deg,${a},${b});padding:54px;position:relative;display:grid;grid-template-columns:1.05fr .95fr;gap:38px;align-items:center}
.stage:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 12% 18%,rgba(255,255,255,.28),transparent 24%),radial-gradient(circle at 88% 80%,rgba(255,255,255,.2),transparent 28%)}
.copy,.visual{position:relative;z-index:1}.pill{display:inline-flex;background:rgba(255,255,255,.18);border:2px solid rgba(255,255,255,.3);color:white;border-radius:999px;padding:10px 18px;font-weight:900;font-size:27px;margin-bottom:20px}
h1{margin:0 0 18px;color:white;font-size:64px;line-height:1.05;letter-spacing:0;text-shadow:0 12px 28px rgba(15,23,42,.22)}
p{margin:0;color:#f8fafc;font-size:34px;line-height:1.35;font-weight:800;text-shadow:0 10px 20px rgba(15,23,42,.18)}
.visual-card{background:#fff;border-radius:34px;padding:22px;box-shadow:0 30px 70px rgba(15,23,42,.28);transform:rotate(-1.5deg)}
.cover{display:block;width:100%;border-radius:24px;aspect-ratio:16/9;overflow:hidden;background:linear-gradient(135deg,${a},${b})}
.cover svg{display:block;width:100%;height:100%}
.tags{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}.tag{background:#f8fafc;border:2px solid #e2e8f0;border-radius:999px;padding:9px 14px;font-weight:900;color:#334155;font-size:20px}
.footer{position:absolute;right:54px;bottom:36px;color:rgba(255,255,255,.84);font-size:22px;font-weight:900}
</style>
</head>
<body>
  <main class="stage">
    <section class="copy">
      <div class="pill">${side}</div>
      <h1>${title}</h1>
      <p>${body}</p>
    </section>
    <section class="visual">
      <div class="visual-card">
        <div class="cover">${coverSvg}</div>
        <div class="tags">${course.points.map((point) => `<span class="tag">${point}</span>`).join('')}</div>
      </div>
    </section>
    <div class="footer">hai.tech · robotics15</div>
  </main>
</body>
</html>`;
}

function screenshot(course, slide, output) {
  const htmlPath = path.join(SNAP_ROOT, `${course.slug}-${slide}.html`);
  fs.writeFileSync(htmlPath, html(course, slide));
  run(CHROMIUM, [
    '--headless',
    '--no-sandbox',
    '--disable-gpu',
    `--window-size=${WIDTH},${HEIGHT}`,
    `--screenshot=${output}`,
    `file://${htmlPath}`,
  ], { stdio: 'pipe' });
}

function renderSilent(course, frames, silentPath, audioSeconds) {
  const segment = Math.max(3.2, audioSeconds / frames.length);
  const listPath = path.join(FRAME_ROOT, `${course.slug}-concat.txt`);
  const lines = [];
  for (const frame of frames) {
    lines.push(`file '${frame.replaceAll("'", "'\\''")}'`);
    lines.push(`duration ${segment.toFixed(2)}`);
  }
  lines.push(`file '${frames.at(-1).replaceAll("'", "'\\''")}'`);
  fs.writeFileSync(listPath, `${lines.join('\n')}\n`);
  run(FFMPEG, [
    '-y',
    '-f', 'concat',
    '-safe', '0',
    '-i', listPath,
    '-vf', `fps=${FPS},format=yuv420p`,
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '18',
    '-movflags', '+faststart',
    silentPath,
  ], { stdio: 'inherit' });
}

async function renderCourse(course) {
  fs.mkdirSync(MARKETING, { recursive: true });
  fs.mkdirSync(FRAME_ROOT, { recursive: true });
  fs.mkdirSync(SNAP_ROOT, { recursive: true });
  const frameDir = path.join(FRAME_ROOT, course.slug);
  fs.rmSync(frameDir, { recursive: true, force: true });
  fs.mkdirSync(frameDir, { recursive: true });

  const { audioPath } = await createAudio(course);
  const audioSeconds = duration(audioPath);
  const frames = [];
  for (let slide = 0; slide < 6; slide += 1) {
    const snapPath = path.join(SNAP_ROOT, `${course.slug}-${slide}.png`);
    screenshot(course, slide, snapPath);
    const framePath = path.join(frameDir, `slide-${String(slide).padStart(2, '0')}.png`);
    fs.copyFileSync(snapPath, framePath);
    frames.push(framePath);
  }

  const silentPath = path.join(MARKETING, `${course.slug}-course-preview-silent.mp4`);
  const outPath = path.join(MARKETING, `${course.slug}-course-preview.mp4`);
  renderSilent(course, frames, silentPath, audioSeconds);
  run(FFMPEG, [
    '-y',
    '-i', silentPath,
    '-i', audioPath,
    '-c:v', 'copy',
    '-c:a', 'aac',
    '-b:a', '160k',
    '-shortest',
    '-movflags', '+faststart',
    outPath,
  ], { stdio: 'inherit' });
  run(FFMPEG, ['-hide_banner', '-i', outPath, '-f', 'null', '-'], { stdio: 'inherit' });
  console.log(outPath);
  return outPath;
}

for (const course of courses) {
  await renderCourse(course);
}
