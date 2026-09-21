const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const MARKETING = path.join(ROOT, 'marketing');
const OUT_DIR = path.join(MARKETING, 'venture-ai-lesson3-explainer-frames');
const SCRIPT_PATH = path.join(MARKETING, 'venture-ai-lesson3-explainer-script.txt');
const AUDIO_BASE = path.join(MARKETING, 'venture-ai-lesson3-gemini-leda');
const AUDIO_MP3 = `${AUDIO_BASE}.mp3`;
const SILENT_MP4 = path.join(MARKETING, 'venture-ai-lesson3-explainer-silent.mp4');
const OUT_MP4 = path.join(MARKETING, 'venture-ai-lesson3-explainer.mp4');

const FPS = Number(process.env.FPS || 10);
const WIDTH = 1280;
const HEIGHT = 720;
const CHROME = process.env.CHROME_BIN || '/snap/bin/chromium';

function resolveModule(name) {
  const bases = [
    path.join(ROOT, 'node_modules'),
    '/home/igrois/.openclaw/workspace/robotics-for-kids/node_modules',
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

fs.mkdirSync(MARKETING, { recursive: true });

const script = `TTS in fluent natural Israeli Hebrew.
Character: a warm Israeli instructor, energetic and clear, explaining lesson three of an AI entrepreneurship program to school staff and parents.
Style: practical, creative, confident, friendly, not salesy, with natural pauses. Read only the Hebrew lines. Do not read bracket labels.

[warm] מפגש שלישי הוא מפגש הבנייה. כאן התלמידים עוברים מבריף מסודר לאבטיפוס ראשון.
[context] הם לא מתחילים מאפס. כבר במפגש הראשון הם פתחו את אופאל כסוכן בינה מלאכותית שעזר לגבש רעיון, ובמפגש השני הם דייקו בריף.
[clear] עכשיו חוזרים לאופאל, מערכת לבניית סוכנים, אתרים ואפליקציות, ומתחילים להפוך את הבריף למוצר קטן שעובד.
[focused] מתחילים בהסבר קצר על Vibe Coding. זה לא קסם, וזה לא לוחצים כפתור ומקווים לטוב.
[practical] מתארים לאופאל מה רוצים, מקבלים תוצר, בודקים כמו משתמשים אמיתיים, ואז מבקשים תיקון מדויק.
[team] לפני הבנייה מחלקים תפקידים: מוביל אופאל, תוכן, עיצוב, בדיקות ומציג.
[important] זה חשוב, כי אחרת ילד אחד עובד וכל השאר מסתכלים. כאן כל ילד יודע מה האחריות שלו.
[opal] הצוותים מדביקים באופאל את הבריף ממפגש 2: הבעיה, קהל היעד, ה-Must, והמסכים שרוצים לבנות.
[build] עכשיו יוצרים גרסה ראשונה: אפליקציה, אתר או סוכן קטן עם שם מיזם, הסבר קצר, פעולה מרכזית ותוצאה ברורה.
[check] אחרי שיש אבטיפוס, עוצרים ובודקים. האם ברור מה עושים? האם יש פעולה? האם יש תוצאה? האם אין מידע אישי?
[fix] אם משהו לא עובד, לא אומרים לאופאל ״תעשה יותר טוב״. כותבים בקשת תיקון קטנה: שמור על המבנה, אבל שנה רק את הדבר הזה.
[focus] המדריך עוזר לצוותים לא להתפזר: לא עשרים פיצ׳רים, לא החלפת רעיון, ולא בנייה מחדש כל חמש דקות.
[result] בסוף מפגש 3 לכל צוות יש MVP ראשון שאפשר לפתוח, לבדוק ולהציג. הוא לא מושלם, אבל הוא עובד.
[closing] וזה בדיוק מה שצריך. במפגש הרביעי עושים ביקורת עמיתים, משפרים, ומתכוננים לדמו ולפיץ׳.`;

const lessons = [
  {
    id: 1,
    title: 'מרעיון למיזם עם אופאל',
    image: 'assets/venture-ai/meeting-1-city.webp',
    accent: '#1d4ed8',
    caption: 'פותחים אופאל ומגבשים רעיון',
    bullets: ['בעיה קטנה בעיר', 'סוכן AI', 'כרטיס מיזם'],
  },
  {
    id: 2,
    title: 'מדייקים פתרון ובריף',
    image: 'assets/venture-ai/meeting-2-focus.webp',
    accent: '#0891b2',
    caption: 'מצמצמים לפני שבונים',
    bullets: ['Must אחד', '2-3 מסכים', 'בריף לאופאל'],
  },
  {
    id: 3,
    title: 'בונים MVP באופאל',
    image: 'assets/venture-ai/meeting-3-build.webp',
    accent: '#16a34a',
    caption: 'נותנים בריף, בודקים, מתקנים',
    bullets: ['אבטיפוס ראשון', 'בדיקות ידניות', 'שיפורים קטנים'],
  },
  {
    id: 4,
    title: 'דמו ופיץ׳ סיום',
    image: 'assets/venture-ai/meeting-4-demo.webp',
    accent: '#7c3aed',
    caption: 'מציגים תוצר ולא רק רעיון',
    bullets: ['ביקורת עמיתים', 'שיפור אחרון', 'פיץ׳ 90 שניות'],
  },
];

const teamRoles = ['מוביל/ת אופאל', 'תוכן', 'עיצוב', 'בדיקות', 'מציג/ה'];
const outcomes = ['צוות', 'בעיה עירונית', 'בריף', 'MVP', 'דמו'];

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: 'inherit', ...options });
  if (result.status !== 0) throw new Error(`${command} failed: ${args.join(' ')}`);
}

function runCapture(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: 'utf8', ...options });
  if (result.status !== 0) throw new Error(`${command} failed: ${args.join(' ')}`);
  return `${result.stdout || ''}${result.stderr || ''}`;
}

function asset(relative) {
  const file = path.join(ROOT, relative);
  const ext = path.extname(file).toLowerCase();
  const mime = ext === '.webp' ? 'image/webp' : ext === '.png' ? 'image/png' : 'image/jpeg';
  return `data:${mime};base64,${fs.readFileSync(file).toString('base64')}`;
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

async function createGeminiAudio() {
  const previousScript = fs.existsSync(SCRIPT_PATH) ? fs.readFileSync(SCRIPT_PATH, 'utf8') : null;
  fs.writeFileSync(SCRIPT_PATH, script);
  if (fs.existsSync(AUDIO_MP3) && previousScript === script) return;
  const keys = extractGoogleAiKeys();
  if (!keys.length) throw new Error('Missing Google AI API key');
  const body = {
    contents: [{ parts: [{ text: script }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: process.env.VENTURE_AI_TTS_VOICE || 'Leda' },
        },
      },
    },
  };
  let lastError = null;
  for (let index = 0; index < keys.length; index += 1) {
    try {
      console.log(`Creating Gemini TTS audio (${index + 1}/${keys.length})`);
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-preview-tts:generateContent', {
        method: 'POST',
        headers: { 'x-goog-api-key': keys[index], 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await response.json().catch(() => null);
      if (!response.ok) throw new Error(`${response.status} ${JSON.stringify(json).slice(0, 800)}`);
      const data = json?.candidates?.[0]?.content?.parts?.find((part) => part.inlineData)?.inlineData?.data;
      if (!data) throw new Error(`No audio data: ${JSON.stringify(json).slice(0, 800)}`);
      const pcm = Buffer.from(data, 'base64');
      const pcmPath = `${AUDIO_BASE}.pcm`;
      const wavPath = `${AUDIO_BASE}.wav`;
      fs.writeFileSync(pcmPath, pcm);
      fs.writeFileSync(wavPath, wavFromPcm16(pcm, 24000));
      run(ffmpegPath, ['-y', '-i', wavPath, '-b:a', '160k', AUDIO_MP3]);
      fs.rmSync(pcmPath, { force: true });
      fs.rmSync(wavPath, { force: true });
      return;
    } catch (error) {
      lastError = error;
      console.warn(`Gemini TTS key ${index + 1} failed: ${error.message}`);
    }
  }
  throw lastError;
}

function audioDuration(file) {
  const output = runCapture(ffmpegPath, ['-hide_banner', '-i', file, '-f', 'null', '-']);
  const match = output.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
  if (!match) return 90;
  return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
}

function html() {
  const lessonData = lessons.map((lesson) => ({ ...lesson, image: asset(lesson.image) }));
  return `<!doctype html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box}
body{margin:0;width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;font-family:Rubik,Arial,sans-serif;direction:rtl;background:#f6fbff;color:#102033}
#stage{position:relative;width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;background:linear-gradient(135deg,#f7fbff 0%,#fff8ee 46%,#f5f3ff 100%)}
#map{position:absolute;inset:0;opacity:.44;background:
 radial-gradient(circle at 15% 20%,rgba(8,145,178,.20),transparent 24%),
 radial-gradient(circle at 80% 16%,rgba(124,58,237,.17),transparent 28%),
 linear-gradient(90deg,transparent 0 9%,rgba(20,184,166,.18) 9% 10%,transparent 10% 23%,rgba(37,99,235,.14) 23% 24%,transparent 24% 100%),
 linear-gradient(0deg,transparent 0 14%,rgba(245,158,11,.16) 14% 15%,transparent 15% 37%,rgba(20,184,166,.14) 37% 38%,transparent 38% 100%)}
.city-dot{position:absolute;width:16px;height:16px;border-radius:999px;background:#2563eb;box-shadow:0 0 0 8px rgba(37,99,235,.12)}
#brand{position:absolute;right:42px;top:30px;display:flex;gap:12px;align-items:center;z-index:4}
.pill{border-radius:999px;padding:8px 15px;background:#0f172a;color:white;font-weight:900;font-size:20px;box-shadow:0 10px 24px rgba(15,23,42,.16)}
.pill.light{background:white;color:#1d4ed8;border:2px solid #dbeafe}
#title{position:absolute;right:48px;top:94px;width:500px;font-size:66px;line-height:.98;font-weight:900;color:#0f172a;letter-spacing:0}
#subtitle{position:absolute;right:52px;top:252px;width:500px;font-size:30px;line-height:1.32;font-weight:800;color:#244154}
#caption{position:absolute;right:42px;bottom:34px;width:560px;min-height:112px;background:rgba(15,23,42,.94);color:white;border:4px solid var(--accent,#2563eb);border-radius:24px;padding:18px 22px;font-size:31px;line-height:1.2;font-weight:900;box-shadow:0 22px 50px rgba(15,23,42,.28);z-index:10}
#caption small{display:block;font-size:21px;margin-top:8px;color:#bfdbfe;font-weight:800}
#heroVisual{position:absolute;left:48px;top:58px;width:610px;height:420px;border-radius:24px;overflow:hidden;border:4px solid white;box-shadow:0 24px 60px rgba(15,23,42,.18);background:#e9f6ff;transform:translateY(20px);opacity:0;transition:.35s}
#heroVisual.show{transform:translateY(0);opacity:1}
#heroVisual img{width:100%;height:100%;object-fit:cover}
#heroVisual:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(15,23,42,.02),rgba(15,23,42,.46))}
#lessonCards{position:absolute;left:38px;top:50px;width:650px;display:grid;grid-template-columns:1fr 1fr;gap:14px;opacity:0;transform:translateY(20px);transition:.3s}
#lessonCards.show{opacity:1;transform:translateY(0)}
.lesson-card{position:relative;height:286px;border-radius:22px;background:white;overflow:hidden;border:3px solid #dbeafe;box-shadow:0 18px 42px rgba(15,23,42,.14);opacity:.62;transform:scale(.97);transition:.25s}
.lesson-card.hot{opacity:1;transform:scale(1);border-color:var(--accent)}
.lesson-card img{width:100%;height:148px;object-fit:cover;display:block}
.lesson-card .num{position:absolute;top:12px;right:12px;width:46px;height:46px;border-radius:999px;background:var(--accent);color:white;display:grid;place-items:center;font-size:24px;font-weight:900;border:3px solid white}
.lesson-card h3{margin:12px 14px 6px;font-size:23px;line-height:1.05;color:#0f172a}
.lesson-card p{margin:0 14px;font-size:18px;line-height:1.25;font-weight:800;color:#475569}
#team{position:absolute;left:62px;top:82px;width:610px;height:390px;display:grid;grid-template-columns:repeat(5,1fr);gap:10px;align-items:end;opacity:0;transform:translateY(20px);transition:.3s}
#team.show{opacity:1;transform:translateY(0)}
.kid{height:240px;border-radius:60px 60px 20px 20px;background:linear-gradient(180deg,var(--c),#fff);border:4px solid white;box-shadow:0 18px 35px rgba(15,23,42,.18);display:flex;align-items:end;justify-content:center;padding:14px 8px;text-align:center;font-weight:900;font-size:18px;line-height:1.05;color:#132033}
.kid:nth-child(2){height:275px}.kid:nth-child(3){height:315px}.kid:nth-child(4){height:265px}.kid:nth-child(5){height:295px}
#flow{position:absolute;left:48px;bottom:72px;width:640px;display:flex;gap:10px;opacity:0;transition:.3s}
#flow.show{opacity:1}
.flow-step{flex:1;border-radius:18px;padding:13px 10px;background:white;border:3px solid #dbeafe;text-align:center;font-weight:900;color:#0f172a;box-shadow:0 12px 24px rgba(15,23,42,.10)}
.flow-step.on{background:var(--accent);border-color:white;color:white}
#opal{position:absolute;left:84px;top:92px;width:540px;height:348px;border-radius:28px;background:#0f172a;color:white;border:5px solid #67e8f9;box-shadow:0 26px 70px rgba(15,23,42,.28);padding:24px;opacity:0;transform:translateY(20px);transition:.3s}
#opal.show{opacity:1;transform:translateY(0)}
#opal h2{margin:0 0 14px;font-size:38px}
.prompt{background:#1e293b;border:2px solid #334155;border-radius:18px;padding:16px;font-size:22px;line-height:1.35;font-weight:800;white-space:pre-wrap}
#outcomes{position:absolute;left:74px;top:92px;width:560px;height:360px;display:flex;align-items:center;justify-content:center;gap:12px;opacity:0;transform:translateY(20px);transition:.3s}
#outcomes.show{opacity:1;transform:translateY(0)}
.outcome{width:104px;height:104px;border-radius:28px;background:white;border:4px solid var(--accent);display:grid;place-items:center;text-align:center;font-weight:900;font-size:21px;color:#0f172a;box-shadow:0 16px 32px rgba(15,23,42,.14)}
#safety{position:absolute;left:60px;top:82px;width:590px;display:grid;gap:14px;opacity:0;transform:translateY(20px);transition:.3s}
#safety.show{opacity:1;transform:translateY(0)}
.safe{background:white;border:3px solid #bfdbfe;border-radius:20px;padding:16px 18px;font-weight:900;font-size:25px;box-shadow:0 16px 30px rgba(15,23,42,.11)}
</style>
</head>
<body>
<div id="stage">
  <div id="map"></div>
  <div class="city-dot" style="left:885px;top:150px"></div>
  <div class="city-dot" style="left:1020px;top:285px"></div>
  <div class="city-dot" style="left:790px;top:390px"></div>
  <div id="brand"><span class="pill">Venture AI</span><span class="pill light">כיתות ח׳ • 4 מפגשים • אופאל</span></div>
  <div id="title"></div>
  <div id="subtitle"></div>
  <div id="heroVisual"><img id="heroImg"></div>
  <div id="lessonCards"></div>
  <div id="team"></div>
  <div id="flow"></div>
  <div id="opal"><h2>אופאל כסוכן AI</h2><div class="prompt">בעיה בחולון: ___
קהל יעד: ___
Must אחד: ___
2-3 מסכים בלבד
דאטה דמיוני, בלי מידע אישי</div></div>
  <div id="safety"></div>
  <div id="outcomes"></div>
  <div id="caption"></div>
</div>
<script>
const lessons = ${JSON.stringify(lessonData)};
const roles = ${JSON.stringify(teamRoles)};
const outcomes = ${JSON.stringify(outcomes)};
const safety = ['דאטה דמיוני בלבד', 'בלי טלפונים וכתובות', 'לא בונים הכל, בונים MVP', 'בודקים שהאפליקציה באמת עוזרת'];
const qs = id => document.getElementById(id);
const stage = qs('stage');
const heroImg = qs('heroImg');
const title = qs('title');
const subtitle = qs('subtitle');
const caption = qs('caption');
const heroVisual = qs('heroVisual');
const lessonCards = qs('lessonCards');
const team = qs('team');
const flow = qs('flow');
const opal = qs('opal');
const safetyBox = qs('safety');
const outcomesBox = qs('outcomes');
lessonCards.innerHTML = lessons.map((lesson, index) => '<article class="lesson-card" data-id="'+lesson.id+'"><img src="'+lesson.image+'"><span class="num">'+lesson.id+'</span><h3>'+lesson.title+'</h3><p>'+lesson.caption+'</p></article>').join('');
team.innerHTML = roles.map((role, index) => '<div class="kid" style="--c:'+['#bfdbfe','#a7f3d0','#fde68a','#fecaca','#ddd6fe'][index]+'">'+role+'</div>').join('');
flow.innerHTML = lessons.map((lesson) => '<div class="flow-step">'+lesson.id+'<br>'+lesson.title.split(' ')[0]+'</div>').join('');
safetyBox.innerHTML = safety.map(item => '<div class="safe">'+item+'</div>').join('');
outcomesBox.innerHTML = outcomes.map(item => '<div class="outcome">'+item+'</div>').join('');
function hideAll(){
  heroVisual.classList.remove('show');
  lessonCards.classList.remove('show');
  team.classList.remove('show');
  flow.classList.remove('show');
  opal.classList.remove('show');
  safetyBox.classList.remove('show');
  outcomesBox.classList.remove('show');
}
window.scene = (s) => {
  stage.style.setProperty('--accent', s.accent || '#2563eb');
  title.textContent = s.title || '';
  subtitle.textContent = s.subtitle || '';
  caption.innerHTML = (s.caption || '') + (s.small ? '<small>'+s.small+'</small>' : '');
  hideAll();
  if (s.hero !== undefined) {
    heroImg.src = lessons[s.hero].image;
    heroVisual.classList.add('show');
  }
  if (s.team) team.classList.add('show');
  if (s.lessons) lessonCards.classList.add('show');
  if (s.flow) flow.classList.add('show');
  if (s.opal) opal.classList.add('show');
  if (s.safety) safetyBox.classList.add('show');
  if (s.outcomes) outcomesBox.classList.add('show');
  document.querySelectorAll('.lesson-card').forEach((card, index) => card.classList.toggle('hot', index === s.hotLesson));
  document.querySelectorAll('.flow-step').forEach((card, index) => card.classList.toggle('on', index <= (s.flowOn ?? -1)));
};
</script>
</body>
</html>`;
}

async function render() {
  await createGeminiAudio();
  const duration = audioDuration(AUDIO_MP3);
  const baseTimeline = 91;
  const timelineScale = Math.max(1, (duration + 1) / baseTimeline);
  console.log(`Audio duration: ${duration.toFixed(2)}s, hand-synced timeline scale: ${timelineScale.toFixed(2)}`);

  fs.rmSync(OUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });
  let frame = 0;

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', `--window-size=${WIDTH},${HEIGHT}`],
    defaultViewport: { width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 },
  });
  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });
  await page.setContent(html(), { waitUntil: 'load' });

  async function snap() {
    await page.screenshot({ path: path.join(OUT_DIR, `frame-${String(frame).padStart(5, '0')}.png`) });
    frame += 1;
  }

  async function hold(seconds) {
    const count = Math.round(seconds * timelineScale * FPS);
    for (let i = 0; i < count; i += 1) await snap();
  }

  async function scene(data, seconds) {
    await page.evaluate((value) => window.scene(value), data);
    await new Promise((resolve) => setTimeout(resolve, 420));
    await hold(seconds);
  }

  await scene({
    title: 'מפגש 3',
    subtitle: 'בונים MVP באופאל',
    caption: 'המעבר מבריף מסודר לאבטיפוס ראשון.',
    small: 'מפגש הבנייה של Venture AI',
    hero: 2,
    accent: lessons[2].accent,
  }, 8);
  await scene({
    title: 'לא מתחילים מאפס',
    subtitle: 'הרעיון והבריף כבר נבנו בשני המפגשים הראשונים',
    caption: 'אופאל מלווה מהשיעור הראשון: חשיבה, שאלות, רעיון ובריף.',
    small: 'עכשיו ממשיכים מאותה שיחה',
    lessons: true,
    flow: true,
    flowOn: 2,
    hotLesson: 2,
    accent: '#1d4ed8',
  }, 10);
  await scene({
    title: 'חוזרים לאופאל',
    subtitle: 'מערכת לבניית סוכנים, אתרים ואפליקציות',
    caption: 'הצוות הופך את הבריף למוצר קטן שאפשר לפתוח.',
    small: 'סוכן AI שעוזר גם לחשוב וגם לבנות',
    opal: true,
    accent: '#14b8a6',
  }, 9);
  await scene({
    title: 'Vibe Coding',
    subtitle: 'מתארים, בודקים, מתקנים',
    caption: 'זה לא קסם. נותנים הוראה טובה ואז בודקים את התוצאה.',
    small: 'בריף → אבטיפוס → תיקון מדויק',
    hero: 2,
    accent: '#16a34a',
  }, 8);
  await scene({
    title: 'חלוקת תפקידים',
    subtitle: 'כל ילד יודע מה האחריות שלו בצוות',
    caption: 'מוביל אופאל, תוכן, עיצוב, בדיקות ומציג.',
    small: 'כדי שילד אחד לא יעשה הכל לבד',
    team: true,
    accent: '#7c3aed',
  }, 9);
  await scene({
    title: 'פרומפט בנייה',
    subtitle: 'מדביקים באופאל את הבריף ממפגש 2',
    caption: 'בעיה, קהל יעד, Must אחד, ו-2-3 מסכים בלבד.',
    small: 'ממשיכים את העבודה, לא מחליפים רעיון',
    opal: true,
    accent: '#0891b2',
  }, 9);
  await scene({
    title: 'גרסה ראשונה',
    subtitle: 'אפליקציה, אתר או סוכן קטן',
    caption: 'שם מיזם, הסבר קצר, פעולה מרכזית ותוצאה ברורה.',
    small: 'MVP עובד, גם אם הוא לא מושלם',
    hero: 2,
    accent: '#16a34a',
  }, 10);
  await scene({
    title: 'בודקים כמו משתמשים',
    subtitle: 'עוצרים רגע לפני שממשיכים לבנות',
    caption: 'האם ברור מה עושים? האם יש פעולה? האם יש תוצאה?',
    small: 'וגם: אין מידע אישי',
    safety: true,
    accent: '#dc2626',
  }, 10);
  await scene({
    title: 'תיקון מדויק',
    subtitle: 'לא “תעשה יותר טוב”',
    caption: 'שמור על המבנה, אבל שנה רק את הדבר הזה.',
    small: 'תיקון קטן בכל פעם',
    opal: true,
    accent: '#f59e0b',
  }, 8);
  await scene({
    title: 'סיום מפגש 3',
    subtitle: 'MVP ראשון שאפשר לפתוח, לבדוק ולהציג',
    caption: 'במפגש 4 משפרים ומתכוננים לדמו ולפיץ׳.',
    small: 'לא מושלם. עובד.',
    outcomes: true,
    accent: '#16a34a',
  }, 9);

  await browser.close();

  run(ffmpegPath, ['-y', '-framerate', String(FPS), '-i', path.join(OUT_DIR, 'frame-%05d.png'), '-vf', 'format=yuv420p', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-movflags', '+faststart', SILENT_MP4]);
  run(ffmpegPath, ['-y', '-i', SILENT_MP4, '-i', AUDIO_MP3, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', OUT_MP4]);
  fs.rmSync(OUT_DIR, { recursive: true, force: true });
  fs.rmSync(SILENT_MP4, { force: true });
  run(ffmpegPath, ['-hide_banner', '-i', OUT_MP4, '-f', 'null', '-']);
  console.log(OUT_MP4);
}

render().catch((error) => {
  console.error(error);
  process.exit(1);
});
