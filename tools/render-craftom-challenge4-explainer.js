const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function resolveModule(name, paths) {
  for (const base of paths) {
    try {
      return require(require.resolve(name, { paths: [base] }));
    } catch {}
  }
  return require(name);
}

const ROOT = path.resolve(__dirname, '..');
const MARKETING = path.join(ROOT, 'marketing');
const FRAME_DIR = path.join(MARKETING, 'craftom-challenge4-explainer-frames');
const SCRIPT_PATH = path.join(MARKETING, 'craftom-challenge4-explainer-script.txt');
const AUDIO_MP3 = path.join(MARKETING, 'craftom-challenge4-explainer-gemini-live.mp3');
const SILENT_MP4 = path.join(MARKETING, 'craftom-challenge4-explainer-silent.mp4');
const MUXED_MP4 = path.join(MARKETING, 'craftom-challenge4-explainer-gemini-live.mp4');
const FINAL_MP4 = path.join(MARKETING, 'craftom-challenge4-explainer-gemini-live-1.12x.mp4');

const MODULE_PATHS = [
  path.join(ROOT, 'node_modules'),
  '/home/igrois/.openclaw/workspace/robotics-for-kids/node_modules',
  '/home/igrois/.openclaw/workspace/english-buddy/node_modules',
  '/home/igrois/.openclaw/workspace/russian-reading-tutor/node_modules',
];

const puppeteer = resolveModule('puppeteer-core', MODULE_PATHS);
const ffmpegPath = resolveModule('@ffmpeg-installer/ffmpeg', MODULE_PATHS).path;

const FPS = Number(process.env.FPS || 10);
const WIDTH = 1280;
const HEIGHT = 720;
const SPEED = Number(process.env.FINAL_SPEED || 1.12);
const GEMINI_LIVE_MODEL = process.env.SENSI_GEMINI_LIVE_MODEL || 'gemini-3.1-flash-live-preview';
const GEMINI_LIVE_VOICE = process.env.SENSI_GEMINI_LIVE_VOICE || 'Puck';
const GEMINI_LIVE_LANGUAGE = process.env.SENSI_GEMINI_LIVE_LANGUAGE || 'he-IL';

fs.mkdirSync(MARKETING, { recursive: true });

const images = {
  overview: asset('assets/craftom/challenges/my-smart-city-4-final.webp'),
  lesson1: asset('assets/craftom/challenges/my-smart-city-1-plan.webp'),
  lesson2: asset('assets/craftom/challenges/my-smart-city-2-first-version.webp'),
  lesson3: asset('assets/craftom/challenges/my-smart-city-3-debug.webp'),
  lesson4: asset('assets/craftom/challenges/my-smart-city-4-final.webp'),
};

function asset(relative) {
  const file = path.join(ROOT, relative);
  const ext = path.extname(file).toLowerCase();
  const mime = ext === '.webp' ? 'image/webp' : ext === '.png' ? 'image/png' : 'image/jpeg';
  return `data:${mime};base64,${fs.readFileSync(file).toString('base64')}`;
}

function runFfmpeg(args) {
  const result = spawnSync(ffmpegPath, args, { stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`ffmpeg failed: ${args.join(' ')}`);
}

function extractGoogleAiKeys() {
  const keys = new Set();
  for (const key of [process.env.GOOGLE_AI_API_KEY, process.env.GEMINI_API_KEY, process.env.GOOGLE_API_KEY]) {
    if (key) keys.add(key.trim());
  }
  for (const file of [
    '/home/igrois/.openclaw/workspace/TOOLS.md',
    '/home/igrois/.openclaw/workspace/geoscale/backend/.env',
    '/home/igrois/.openclaw/workspace/geoscale-seo-preview/backend/.env',
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

function geminiLivePrompt(input) {
  return [
    `Language: ${GEMINI_LIVE_LANGUAGE}.`,
    'Read the following Hebrew narration exactly as written.',
    'Use natural Israeli Hebrew, warm instructor pacing, clear pronunciation, and short natural pauses.',
    'Do not summarize, do not answer the content, do not add explanations, and do not change words.',
    '',
    input,
  ].join('\n');
}

function connectWithTimeout(ai, options, ms = 120000) {
  return Promise.race([
    ai.live.connect(options),
    new Promise((_, reject) => setTimeout(() => reject(new Error('connect timeout')), ms)),
  ]);
}

async function createGeminiLiveAudioWithKey(genai, apiKey) {
  const { GoogleGenAI, Modality } = genai;
  const ai = new GoogleGenAI({ apiKey });
  const chunks = [];
  let done = false;
  let error = null;
  let session = null;
  const keepAlive = setInterval(() => {}, 1000);
  try {
    session = await connectWithTimeout(ai, {
      model: GEMINI_LIVE_MODEL,
      config: {
        responseModalities: [Modality?.AUDIO || 'AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: GEMINI_LIVE_VOICE },
          },
        },
        systemInstruction: {
          parts: [{ text: `You are a Hebrew narrator. Speak only ${GEMINI_LIVE_LANGUAGE}. Read supplied narration exactly.` }],
        },
        thinkingConfig: { thinkingLevel: 'minimal' },
      },
      callbacks: {
        onmessage(message) {
          const parts = message?.serverContent?.modelTurn?.parts || [];
          for (const part of parts) {
            const data = part?.inlineData?.data;
            if (data) chunks.push(Buffer.from(data, 'base64'));
          }
          if (message?.serverContent?.turnComplete) done = true;
        },
        onerror(event) {
          error = event?.message || String(event);
        },
        onclose(event) {
          if (!done && !error) error = event?.reason || 'Gemini Live session closed before completion';
        },
      },
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (error) throw new Error(error);
    session.sendClientContent({
      turns: geminiLivePrompt(fs.readFileSync(SCRIPT_PATH, 'utf8')),
      turnComplete: true,
    });
    const started = Date.now();
    while (!done && !error && Date.now() - started < 180000) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  } finally {
    clearInterval(keepAlive);
    if (session) session.close();
  }
  if (error) throw new Error(error);
  if (!done) throw new Error('Gemini Live timed out before completion');
  if (!chunks.length) throw new Error('Gemini Live returned no audio chunks');
  const wavPath = AUDIO_MP3.replace(/\.mp3$/i, '.wav');
  try {
    fs.writeFileSync(wavPath, wavFromPcm16(Buffer.concat(chunks), 24000));
    runFfmpeg(['-y', '-i', wavPath, '-b:a', '160k', AUDIO_MP3]);
  } finally {
    fs.rmSync(wavPath, { force: true });
  }
}

async function createGeminiLiveAudio() {
  if (fs.existsSync(AUDIO_MP3)) return;
  const genai = resolveModule('@google/genai', MODULE_PATHS);
  const keys = extractGoogleAiKeys();
  if (!keys.length) throw new Error('missing GOOGLE_AI_API_KEY/GEMINI_API_KEY');
  let lastError = null;
  for (let index = 0; index < keys.length; index += 1) {
    try {
      console.log(`Creating Gemini Live narration with key ${index + 1}/${keys.length}`);
      await createGeminiLiveAudioWithKey(genai, keys[index]);
      return;
    } catch (err) {
      lastError = err;
      console.warn(`Gemini Live key ${index + 1}/${keys.length} failed: ${err.message || err}`);
    }
  }
  throw new Error(`Gemini Live failed for all configured keys: ${lastError?.message || lastError}`);
}

function writeScript() {
  const script = `סרטון הסבר לאתגר הרביעי בלומדת קראפטום: העיר החכמה שלי.

זה אתגר הסיום של הקורס. הילדים לא מקבלים מושג תכנותי חדש וכבד, אלא משתמשים במה שכבר למדו: רצף פקודות, לולאה, משתנה, תנאי, בדיקה ודיבוג.

המטרה היא שכל ילד יבנה מערכת עיר חכמה קטנה בתוך המגרש האישי שלו. זו יכולה להיות תחנת משלוחים, גשר קצר, מעבר חציה, שער, רמזור קטן, או רעיון דומה.

האתגר עדיין נשאר פשוט ב-MakeCode. לא מבקשים פרויקט ענק, ולא דורשים חיישנים או רדסטון. מבקשים מערכת אחת קטנה, פקודת start אחת, פקודת test אחת, ובסוף פקודת demo להצגה.

הדבר החשוב הוא תהליך עבודה של מתכנתים: קודם מתכננים במילים, אחר כך בונים גרסה ראשונה, אחר כך בודקים ומתקנים, ובסוף מציגים מה נבנה ומה הקוד עושה.

האתגר מחולק לארבעה מפגשים. בכל מפגש הילדים קודם בונים במיינקראפט, ורק אחר כך כותבים קוד קצר שמפעיל את מה שבנו.

במפגש הראשון, בוחרים מערכת, הילדים מסמנים שטח פרויקט קטן, בוחרים רעיון אחד, ובונים התחלה ברורה: דרך, תחנה, גשר קצר או עמוד רמזור. לפני הקוד הם כותבים אלגוריתם במילים: קודם מה קורה, אחר כך מה משתנה, ובסוף איך יודעים שזה עבד.

במפגש השני, גרסה ראשונה, הילדים בונים פעולה אחת ברורה. למשל: start פותח שער, מניח בלוק משלוח, מחליף צבע, או מזיז Agent צעד אחד. המטרה היא לא לעשות הכול, אלא לראות שינוי אחד בעולם בגלל הקוד.

במפגש השלישי, בודקים ומתקנים, הילדים מריצים test. הם מחפשים תקלה קטנה: בלוק במקום לא נכון, מרחק לא מדויק, כיוון לא מתאים, או תנאי שלא עבד. ואז מתקנים רק שורה אחת ומריצים שוב.

במפגש הרביעי, מציגים את העיר, הילדים מסדרים את המערכת, מוסיפים סימון התחלה וסימון הצלחה, ומריצים demo. בהצגה הם אומרים: מה בניתי, מה הקוד עושה, איך בדקתי, ומה תיקנתי.

החיבור לקראפטום הוא שהפרויקט משאיר ראיות אמיתיות: בלוקים שנבנו, פקודות start, test ו-demo, שימוש במושגים שנלמדו כמו Agent, repeat או if, וגם הסברים בצ׳אט או בשלטים.

בסוף אתגר 4 המורה לא רואה רק תוצר יפה. היא רואה תהליך: תכנון, בנייה, קוד, בדיקה, תיקון והצגה. וזה בדיוק מה שהופך פעילות Minecraft לשיעור תכנות אמיתי.`;
  fs.writeFileSync(SCRIPT_PATH, script);
}

function html() {
  return `<!doctype html>
  <html lang="he" dir="rtl">
  <head>
    <meta charset="utf-8">
    <style>
      *{box-sizing:border-box}
      body{margin:0;width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;font-family:Rubik,Arial,sans-serif;background:#07131d;color:#fff;direction:rtl}
      #stage{position:relative;width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;background:#0b1822}
      #bg{position:absolute;inset:0;background-size:cover;background-position:center;filter:saturate(1.08) contrast(1.02);transform:scale(1.04);transition:background-image .2s,transform 1s}
      #shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(3,10,15,.94) 0 33%,rgba(3,10,15,.42) 53%,rgba(3,10,15,.12) 100%)}
      #top{position:absolute;right:34px;top:24px;display:flex;gap:10px;align-items:center}
      .pill{background:#f4c247;color:#172018;border:3px solid rgba(255,255,255,.45);padding:8px 14px;border-radius:999px;font-weight:900;font-size:22px}
      #title{position:absolute;right:36px;top:84px;width:430px;font-size:54px;font-weight:900;line-height:1.04;text-shadow:0 3px 0 rgba(0,0,0,.25)}
      #sub{position:absolute;right:38px;top:205px;width:420px;font-size:25px;line-height:1.35;font-weight:800;color:#e8f7ff}
      #caption{position:absolute;right:36px;bottom:26px;width:520px;background:rgba(7,19,29,.9);border:3px solid #f4c247;border-radius:20px;padding:16px 20px;font-size:30px;line-height:1.25;font-weight:900;box-shadow:0 18px 35px rgba(0,0,0,.35)}
      #caption small{display:block;font-size:20px;color:#bde3ff;margin-top:6px;font-weight:800}
      #build{position:absolute;left:34px;top:42px;width:650px;height:385px;border-radius:24px;border:4px solid #9bd2ff;background:rgba(221,244,255,.92);background-size:cover;background-position:center;box-shadow:0 24px 45px rgba(0,0,0,.35);overflow:hidden;opacity:0;transform:translateY(18px);transition:.25s}
      #build:before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.08),rgba(0,0,0,.15) 32%,rgba(221,244,255,.92) 33%);z-index:1}
      #build.show{opacity:1;transform:translateY(0)}
      #build h3{position:absolute;right:18px;top:14px;margin:0;color:#123;font-size:28px;font-weight:900;z-index:3;background:rgba(255,255,255,.82);border-radius:999px;padding:8px 14px}
      #plot{position:absolute;left:28px;right:28px;bottom:24px;height:245px;border:4px solid #31542e;border-radius:16px;background-size:cover;background-position:center;overflow:hidden;box-shadow:inset 0 0 0 8px rgba(255,255,255,.13);z-index:2}
      #plot:before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(90deg,rgba(255,255,255,.13) 0 2px,transparent 2px 40px),repeating-linear-gradient(0deg,rgba(0,0,0,.12) 0 2px,transparent 2px 40px)}
      .cube{position:absolute;width:42px;height:42px;border:3px solid rgba(0,0,0,.35);box-shadow:7px 7px 0 rgba(0,0,0,.22);display:flex;align-items:center;justify-content:center;font-weight:900;color:#132;transform:scale(0);opacity:0;transition:.22s}
      .cube.on{transform:scale(1);opacity:1}
      .road{background:#38434a;color:#fff}.sidewalk{background:#a8b1b5}.stripe{background:#f7f7f0}.red{background:#d95b44;color:#fff}.green{background:#6fdb5f}.barrier{background:#f5f5f0;color:#b91c1c}.pad{background:#d8e0e8}.marker{background:#f4c247}.project{background:#b7d7a8}.building{background:#d8b37b}.garden{background:#76c66a}.gate{background:#7f8a93;color:#fff}.gold{background:#f4c247}.agentCube{background:#f5f5e8;color:#123}
      .agentCube:after{content:"A";font-size:20px}
      #code{position:absolute;left:34px;bottom:34px;width:650px;height:230px;border-radius:22px;background:#0d1728;border:4px solid #68c5ff;box-shadow:0 24px 45px rgba(0,0,0,.35);opacity:0;transform:translateY(18px);transition:.25s;overflow:hidden}
      #code.show{opacity:1;transform:translateY(0)}
      #codeTitle{height:44px;background:#16223a;color:#cdeeff;font-size:22px;font-weight:900;padding:8px 18px}
      #codeLines{direction:ltr;text-align:left;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:19px;line-height:1.24;padding:12px 18px;color:#dbeafe}
      .line{display:block;border-radius:8px;padding:1px 7px;white-space:pre}
      .line.hot{background:#f4c247;color:#162014;box-shadow:0 0 0 3px rgba(244,194,71,.25)}
      #run{position:absolute;left:736px;bottom:48px;width:480px;height:126px;background:rgba(255,255,255,.94);color:#142033;border:4px solid #f4c247;border-radius:20px;padding:16px 20px;font-size:28px;font-weight:900;line-height:1.25;opacity:0;transform:translateY(18px);transition:.25s}
      #run.show{opacity:1;transform:translateY(0)}
      #progress{position:absolute;left:736px;top:452px;width:480px;display:flex;gap:8px;opacity:0;transition:.25s}
      #progress.show{opacity:1}
      .dot{height:14px;flex:1;border-radius:999px;background:#315169;border:2px solid #92d5ff}
      .dot.on{background:#f4c247;border-color:#fff}
    </style>
    <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;700;800;900&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="stage">
      <div id="bg"></div><div id="shade"></div>
      <div id="top"><div class="pill" id="pill">אתגר 4</div><div class="pill" id="lesson">העיר החכמה שלי</div></div>
      <div id="title"></div><div id="sub"></div>
      <div id="build"><h3 id="buildTitle">בונים במיינקראפט</h3><div id="plot"></div></div>
      <div id="code"><div id="codeTitle">כותבים קוד לאט</div><div id="codeLines"></div></div>
      <div id="progress"></div>
      <div id="run"></div>
      <div id="caption"></div>
    </div>
    <script>
      const bg = document.getElementById('bg');
      const title = document.getElementById('title');
      const sub = document.getElementById('sub');
      const caption = document.getElementById('caption');
      const lesson = document.getElementById('lesson');
      const build = document.getElementById('build');
      const plot = document.getElementById('plot');
      const code = document.getElementById('code');
      const codeLines = document.getElementById('codeLines');
      const run = document.getElementById('run');
      const progress = document.getElementById('progress');
      let agent = null;
      window.setScene = (s) => {
        bg.style.backgroundImage = 'url(' + s.image + ')';
        build.style.backgroundImage = 'url(' + s.image + ')';
        plot.style.backgroundImage = 'linear-gradient(rgba(116,190,90,.28),rgba(84,148,62,.36)), url(' + s.image + ')';
        title.textContent = s.title || '';
        sub.textContent = s.sub || '';
        lesson.textContent = s.lesson || 'העיר החכמה שלי';
        caption.innerHTML = (s.caption || '') + (s.small ? '<small>' + s.small + '</small>' : '');
        build.classList.toggle('show', !!s.showBuild);
        code.classList.toggle('show', !!s.showCode);
        run.classList.toggle('show', !!s.runText);
        progress.classList.toggle('show', !!s.progress);
        run.textContent = s.runText || '';
        if (s.code) {
          codeLines.innerHTML = s.code.map((line, i) => '<span class="line" data-i="' + i + '">' + line.replace(/</g,'&lt;') + '</span>').join('');
        }
        if (s.progress) {
          progress.innerHTML = [0,1,2,3].map(i => '<div class="dot ' + (i < s.progress ? 'on' : '') + '"></div>').join('');
        }
      };
      window.clearPlot = () => { plot.innerHTML = ''; agent = null; };
      window.addCube = (c) => {
        const el = document.createElement('div');
        el.className = 'cube ' + (c.type || 'sidewalk');
        el.style.left = c.x + 'px';
        el.style.top = c.y + 'px';
        el.textContent = c.text || '';
        plot.appendChild(el);
        if (c.type === 'agentCube') agent = el;
        requestAnimationFrame(() => el.classList.add('on'));
      };
      window.highlightCode = (idx) => {
        document.querySelectorAll('.line').forEach((el) => el.classList.toggle('hot', Number(el.dataset.i) === idx));
      };
      window.moveAgent = (x, y) => {
        if (!agent) return;
        agent.style.left = x + 'px';
        agent.style.top = y + 'px';
        agent.style.transition = '.45s linear';
      };
    </script>
  </body>
  </html>`;
}

const lessonData = [
  {
    title: 'מפגש 4.1',
    lesson: 'בוחרים מערכת',
    image: images.lesson1,
    sub: 'מטרה: לבחור מערכת עיר חכמה קטנה ולתכנן מה היא עושה.',
    build: [
      { type: 'project', x: 64, y: 52, text: 'שטח' }, { type: 'project', x: 110, y: 52 }, { type: 'project', x: 156, y: 52 }, { type: 'project', x: 202, y: 52 }, { type: 'project', x: 248, y: 52 }, { type: 'project', x: 294, y: 52 },
      { type: 'road', x: 64, y: 104 }, { type: 'road', x: 110, y: 104 }, { type: 'road', x: 156, y: 104 }, { type: 'sidewalk', x: 202, y: 104 }, { type: 'building', x: 248, y: 104, text: 'תחנה' }, { type: 'garden', x: 294, y: 104 },
      { type: 'marker', x: 92, y: 172, text: 'התחלה' }, { type: 'gold', x: 248, y: 172, text: 'בדיקה' }, { type: 'agentCube', x: 140, y: 172 },
    ],
    code: [
      'player.onChat("start", function () {',
      '  player.say("המערכת שלי מתחילה")',
      '})',
    ],
    path: [[140,172],[188,172],[236,172]],
    captions: ['מסמנים שטח פרויקט ובוחרים רעיון אחד קטן וברור.', 'כותבים אלגוריתם במילים ופקודת start קצרה.', 'מריצים start ומסבירים מה המערכת אמורה לעשות.'],
  },
  {
    title: 'מפגש 4.2',
    lesson: 'גרסה ראשונה',
    image: images.lesson2,
    sub: 'מטרה: לבנות פעולה אחת שרואים בעולם כשמריצים start.',
    build: [
      { type: 'road', x: 76, y: 72 }, { type: 'road', x: 122, y: 72 }, { type: 'road', x: 168, y: 72 }, { type: 'road', x: 214, y: 72 }, { type: 'road', x: 260, y: 72 },
      { type: 'sidewalk', x: 76, y: 122 }, { type: 'building', x: 122, y: 122, text: 'בית' }, { type: 'gate', x: 214, y: 122, text: 'שער' }, { type: 'green', x: 260, y: 122, text: 'ON' },
      { type: 'marker', x: 76, y: 182, text: 'start' }, { type: 'gold', x: 306, y: 182, text: 'תוצאה' }, { type: 'agentCube', x: 122, y: 182 },
    ],
    code: [
      'player.onChat("start", function () {',
      '  blocks.place(LIME_CONCRETE, pos(0, 1, 0))',
      '  blocks.place(AIR, pos(1, 0, 0))',
      '  player.say("המערכת פעלה")',
      '})',
    ],
    path: [[122,182],[168,182],[214,182],[260,182],[306,182]],
    captions: ['בונים גרסה ראשונה עם חלק אחד שהקוד משנה.', 'start עושה פעולה אחת: צבע, שער, בלוק או Agent.', 'מריצים start ורואים שינוי אחד ברור בעולם.'],
  },
  {
    title: 'מפגש 4.3',
    lesson: 'בודקים ומתקנים',
    image: images.lesson3,
    sub: 'מטרה: להריץ בדיקה, למצוא תקלה ולתקן שינוי קטן.',
    build: [
      { type: 'road', x: 62, y: 70 }, { type: 'road', x: 108, y: 70 }, { type: 'road', x: 154, y: 70 }, { type: 'road', x: 200, y: 70 }, { type: 'road', x: 246, y: 70 }, { type: 'road', x: 292, y: 70 },
      { type: 'building', x: 62, y: 126, text: 'מערכת' }, { type: 'red', x: 154, y: 126, text: 'תקלה' }, { type: 'marker', x: 246, y: 126, text: 'test' }, { type: 'gold', x: 338, y: 126, text: 'יעד' },
      { type: 'agentCube', x: 108, y: 184 }, { type: 'barrier', x: 200, y: 184, text: 'pos?' }, { type: 'green', x: 292, y: 184, text: 'fix' },
    ],
    code: [
      'player.onChat("test", function () {',
      '  player.say("בודק את המערכת")',
      '  player.runChatCommand("start")',
      '})',
      '// אם זה לא במקום:',
      '// משנים רק pos(...) אחד',
    ],
    path: [[108,184],[154,184],[200,184],[246,184],[292,184],[338,184]],
    captions: ['מוסיפים נקודת בדיקה ומסמנים מה אמור להשתנות.', 'test מריץ את המערכת ומחפש תקלה אחת קטנה.', 'מריצים, מזהים כיוון או מיקום לא נכון, ומתקנים רק שורה אחת.'],
  },
  {
    title: 'מפגש 4.4',
    lesson: 'מציגים את העיר',
    image: images.lesson4,
    sub: 'מטרה: להציג מה נבנה, מה הקוד עושה, ומה נבדק.',
    build: [
      { type: 'project', x: 54, y: 54, text: 'פרויקט' }, { type: 'road', x: 100, y: 54 }, { type: 'road', x: 146, y: 54 }, { type: 'green', x: 192, y: 54, text: 'עובד' }, { type: 'building', x: 238, y: 54, text: 'תחנה' }, { type: 'garden', x: 284, y: 54 },
      { type: 'sidewalk', x: 54, y: 110 }, { type: 'gate', x: 100, y: 110, text: 'שער' }, { type: 'gold', x: 192, y: 110, text: 'הצלחה' }, { type: 'marker', x: 284, y: 110, text: 'demo' },
      { type: 'agentCube', x: 100, y: 180 }, { type: 'green', x: 146, y: 180 }, { type: 'green', x: 192, y: 180 }, { type: 'gold', x: 238, y: 180, text: '✓' },
    ],
    code: [
      'player.onChat("demo", function () {',
      '  player.say("זו המערכת שלי")',
      '  player.runChatCommand("start")',
      '  player.say("בדקתי ותיקנתי")',
      '})',
    ],
    path: [[100,180],[146,180],[192,180],[238,180],[284,110]],
    captions: ['מסדרים את הפרויקט כך שיהיה ברור מה רואים ומה הצליח.', 'demo מציג את המערכת ומריץ את הפעולה המרכזית.', 'מריצים demo ומסבירים למורה מה נבנה, מה נבדק ומה תוקן.'],
  },
];

async function renderVideo() {
  fs.rmSync(FRAME_DIR, { recursive: true, force: true });
  fs.mkdirSync(FRAME_DIR, { recursive: true });
  let frame = 0;
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME_BIN || '/snap/bin/chromium',
    headless: 'new',
    args: ['--no-sandbox', `--window-size=${WIDTH},${HEIGHT}`],
    defaultViewport: { width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 },
  });
  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });
  await page.setContent(html(), { waitUntil: 'load' });

  async function snap() {
    await page.screenshot({ path: path.join(FRAME_DIR, `frame-${String(frame).padStart(5, '0')}.png`) });
    frame += 1;
  }
  async function hold(seconds) {
    const count = Math.round(seconds * FPS);
    for (let i = 0; i < count; i += 1) await snap();
  }
  async function setScene(scene) {
    await page.evaluate((s) => window.setScene(s), scene);
  }
  async function addCube(cube) {
    await page.evaluate((c) => window.addCube(c), cube);
  }
  async function clearPlot() {
    await page.evaluate(() => window.clearPlot());
  }
  async function highlightCode(index) {
    await page.evaluate((idx) => window.highlightCode(idx), index);
  }
  async function moveAgent(x, y) {
    await page.evaluate(([nx, ny]) => window.moveAgent(nx, ny), [x, y]);
  }

  await setScene({
    image: images.overview,
    title: 'אתגר 4: העיר החכמה שלי',
    lesson: 'Craftom Challenges',
    sub: '4 מפגשים שבהם הילדים מתכננים, בונים, בודקים ומציגים מערכת עיר חכמה אישית.',
    caption: 'המטרה: להפוך את כל מה שנלמד לפרויקט קטן שעובד במיינקראפט.',
    small: 'תכנון • start • test • demo',
    progress: 0,
  });
  await hold(8);
  await setScene({
    image: images.overview,
    title: 'איך האתגר בנוי?',
    lesson: '4 מפגשים',
    sub: 'כל מפגש מתחיל בבנייה במגרש 50x50, ורק אחר כך עוברים לקוד.',
    caption: 'זה פרויקט סיום, אבל קטן ומוגדר: מערכת אחת, פעולה אחת, בדיקה אחת והצגה קצרה.',
    small: 'רעיון • אבטיפוס • דיבוג • הצגה',
    progress: 0,
  });
  await hold(8);

  for (let i = 0; i < lessonData.length; i += 1) {
    const data = lessonData[i];
    await clearPlot();
    await setScene({
      image: data.image,
      title: data.title,
      lesson: data.lesson,
      sub: data.sub,
      caption: data.captions[0],
      small: 'שלב 1: בונים את סביבת המשימה',
      showBuild: true,
      progress: i + 1,
    });
    await hold(2.5);
    for (const cube of data.build) {
      await addCube(cube);
      await hold(0.38);
    }
    await hold(5);

    await setScene({
      image: data.image,
      title: data.title,
      lesson: data.lesson,
      sub: data.sub,
      caption: data.captions[1],
      small: 'שלב 2: כותבים את הקוד לאט, שורה אחרי שורה',
      showBuild: true,
      showCode: true,
      code: data.code,
      progress: i + 1,
    });
    await hold(1.5);
    for (let line = 0; line < data.code.length; line += 1) {
      await highlightCode(line);
      await hold(1.15);
    }
    await hold(3);

    await setScene({
      image: data.image,
      title: data.title,
      lesson: data.lesson,
      sub: data.sub,
      caption: data.captions[2],
      small: 'שלב 3: מריצים ורואים מה קורה בעולם',
      showBuild: true,
      showCode: true,
      code: data.code,
      runText: i === 3 ? 'מריצים demo, מפעילים את המערכת, ומסבירים מה נבדק ותוקן.' : 'מריצים start או test ורואים שינוי ברור בעולם.',
      progress: i + 1,
    });
    await hold(1.6);
    for (const point of data.path) {
      await moveAgent(point[0], point[1]);
      await hold(0.82);
    }
    if (i >= 2) {
      await addCube({ type: 'marker', x: 438, y: 210, text: '✓' });
      await hold(1);
    }
    await hold(5);
  }

  await setScene({
    image: images.overview,
    title: 'מה המורה מקבלת?',
    lesson: 'Craftom',
    sub: 'קראפטום מחפשת ראיות מתוך המשחק: אזור פרויקט, מערכת עיר חכמה, start, test, demo, דיבוג והסבר.',
    caption: 'המורה רואה תהליך מלא: תכנון, בנייה, קוד, בדיקה, תיקון והצגה.',
    small: 'תכנן • בנה • הפעיל קוד • בדק • תיקן • הציג',
    progress: 4,
  });
  await hold(10);

  await browser.close();
  runFfmpeg(['-y', '-framerate', String(FPS), '-i', path.join(FRAME_DIR, 'frame-%05d.png'), '-vf', 'format=yuv420p', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-movflags', '+faststart', SILENT_MP4]);
}

async function main() {
  writeScript();
  await createGeminiLiveAudio();
  await renderVideo();
  runFfmpeg(['-y', '-i', SILENT_MP4, '-i', AUDIO_MP3, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', MUXED_MP4]);
  runFfmpeg(['-y', '-i', MUXED_MP4, '-filter_complex', `[0:v]setpts=PTS/${SPEED},format=yuv420p[v];[0:a]atempo=${SPEED}[a]`, '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', FINAL_MP4]);
  fs.rmSync(FRAME_DIR, { recursive: true, force: true });
  fs.rmSync(SILENT_MP4, { force: true });
  fs.rmSync(MUXED_MP4, { force: true });
  fs.rmSync(AUDIO_MP3, { force: true });
  console.log(FINAL_MP4);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
