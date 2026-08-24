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
const FRAME_DIR = path.join(MARKETING, 'craftom-challenge2-explainer-frames');
const SCRIPT_PATH = path.join(MARKETING, 'craftom-challenge2-explainer-script.txt');
const AUDIO_MP3 = path.join(MARKETING, 'craftom-challenge2-explainer-gemini-live.mp3');
const SILENT_MP4 = path.join(MARKETING, 'craftom-challenge2-explainer-silent.mp4');
const MUXED_MP4 = path.join(MARKETING, 'craftom-challenge2-explainer-gemini-live.mp4');
const FINAL_MP4 = path.join(MARKETING, 'craftom-challenge2-explainer-gemini-live-1.12x.mp4');

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
  overview: asset('assets/craftom/challenges/builder-bridge-4-final.webp'),
  lesson1: asset('assets/craftom/challenges/builder-bridge-1-first-step.webp'),
  lesson2: asset('assets/craftom/challenges/builder-bridge-2-repeat.webp'),
  lesson3: asset('assets/craftom/challenges/builder-bridge-3-pattern.webp'),
  lesson4: asset('assets/craftom/challenges/builder-bridge-4-final.webp'),
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
  const script = `סרטון הסבר לאתגר השני בלומדת קראפטום: גשר הבנאי.

אחרי שאתגר 1 לימד את הילדים רצף פקודות, אתגר 2 לוקח אותם צעד קדימה: לולאות. במקום לכתוב את אותה פעולה שוב ושוב, הילדים מלמדים את ה-Agent לחזור על פעולה קטנה ולבנות גשר.

הסיפור פשוט ומיינקראפטי: בתוך המגרש האישי יש תעלה או נחל קטן. בצד אחד יש נקודת התחלה, בצד השני נקודת יעד, וה-Agent צריך להפוך לבנאי שבונה גשר כדי לעבור.

המטרה התכנותית היא להבין פעולה חוזרת. כל קטע בגשר נבנה מאותו רעיון: ה-Agent מניח בלוק, מתקדם צעד אחד, ושוב מניח בלוק. כשזה חוזר כמה פעמים, נולד גשר.

האתגר מחולק לארבעה מפגשים. בכל מפגש הילדים קודם בונים את הסביבה במיינקראפט, ורק אחר כך כותבים קוד קצר שמפעיל את ה-Agent בתוך מה שהם בנו.

במפגש הראשון, צעד גשר ראשון, הילדים בונים תעלה ושתי גדות. אחר כך הם כותבים פקודה בשם bridge. בתוך הפקודה ה-Agent מניח בלוק אחד ומתקדם צעד אחד. זה עוד לא גשר שלם, אבל זה הצעד הבסיסי שממנו הכול בנוי.

במפגש השני, Repeat במקום לחזור, הילדים רואים שאם כותבים place ואז move שוב ושוב, הקוד נהיה ארוך ומשעמם. אז הם מכניסים את שתי הפעולות לתוך לולאה. הלולאה חוזרת כמה פעמים, וה-Agent בונה קטעי גשר אחד אחרי השני.

במפגש השלישי, דגם חוזר, הגשר כבר לא רק עובד. הוא גם נראה מתוכנן. הילדים מוסיפים מעקה או לפידים בדגם שחוזר על עצמו. כאן הם לומדים שלולאה יכולה לבנות תבנית: רצפה, מעקה, צעד קדימה, ושוב.

במפגש הרביעי, גשר עצמאי, כל ילד מתכנן גשר משלו. הוא בוחר את אורך התעלה, בוחר כמה פעמים הלולאה תרוץ, מריץ, בודק אם הגשר הגיע לצד השני, ומשנה את המספר אם צריך. זה דיבוג אמיתי: משנים דבר אחד, מריצים שוב, ובודקים.

החיבור לקראפטום הוא שמה שקורה במיינקראפט הופך לראיות למורה. קראפטום יכולה לבדוק אם הילד בנה תעלה וגשר, אם ה-Agent הניח בלוקים, אם היו פקודות place ו-move, אם יש סימן ללולאה כמו repeat או for, ואם הילד בדק ותיקן את מספר החזרות.

בסוף אתגר 2 הילד מבין רעיון תכנותי חשוב: כשפעולה חוזרת, לא כותבים אותה שוב ושוב. משתמשים בלולאה. ובמיינקראפט רואים את זה מיד: הלולאה הופכת לבלוקים, והבלוקים הופכים לגשר.`;
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
      .start{background:#a8b1b5}.target{background:#e9eef0}.water{background:#268bd2;color:#fff}.plank{background:#c48a3a}.rail{background:#8b5a2b;color:#fff}.torch{background:#f4c247}.marker{background:#7bdc78}.package{background:#f4c247}.agentCube{background:#f5f5e8;color:#123}
      .agentCube:after{content:"A";font-size:20px}
      #code{position:absolute;left:34px;bottom:34px;width:650px;height:230px;border-radius:22px;background:#0d1728;border:4px solid #68c5ff;box-shadow:0 24px 45px rgba(0,0,0,.35);opacity:0;transform:translateY(18px);transition:.25s;overflow:hidden}
      #code.show{opacity:1;transform:translateY(0)}
      #codeTitle{height:44px;background:#16223a;color:#cdeeff;font-size:22px;font-weight:900;padding:8px 18px}
      #codeLines{direction:ltr;text-align:left;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:21px;line-height:1.35;padding:12px 18px;color:#dbeafe}
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
      <div id="top"><div class="pill" id="pill">אתגר 2</div><div class="pill" id="lesson">גשר הבנאי</div></div>
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
        lesson.textContent = s.lesson || 'גשר הבנאי';
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
        el.className = 'cube ' + (c.type || 'plank');
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
    title: 'מפגש 2.1',
    lesson: 'צעד גשר ראשון',
    image: images.lesson1,
    sub: 'מטרה: להבין שגשר מתחיל מפעולה אחת: להניח בלוק ולהתקדם.',
    build: [
      { type: 'water', x: 168, y: 90 }, { type: 'water', x: 214, y: 90 }, { type: 'water', x: 260, y: 90 }, { type: 'water', x: 306, y: 90 },
      { type: 'water', x: 168, y: 136 }, { type: 'water', x: 214, y: 136 }, { type: 'water', x: 260, y: 136 }, { type: 'water', x: 306, y: 136 },
      { type: 'start', x: 76, y: 150, text: 'התחלה' },
      { type: 'target', x: 404, y: 150, text: 'יעד' },
      { type: 'plank', x: 156, y: 176 },
      { type: 'agentCube', x: 96, y: 112 },
    ],
    code: [
      'player.onChat("bridge", function () {',
      '  agent.teleportToPlayer()',
      '  agent.place(DOWN)',
      '  agent.move(FORWARD, 1)',
      '})',
    ],
    path: [[96,112],[150,112]],
    captions: ['בונים תעלה, התחלה ויעד. הגשר מתחיל בבלוק אחד.', 'כותבים פקודה בשם bridge: place ואז move.', 'מריצים: ה-Agent מניח בלוק ומתקדם צעד.'],
  },
  {
    title: 'מפגש 2.2',
    lesson: 'Repeat במקום לחזור',
    image: images.lesson2,
    sub: 'מטרה: להפוך פעולה שחוזרת כמה פעמים ללולאה אחת.',
    build: [
      { type: 'water', x: 154, y: 84 }, { type: 'water', x: 200, y: 84 }, { type: 'water', x: 246, y: 84 }, { type: 'water', x: 292, y: 84 }, { type: 'water', x: 338, y: 84 },
      { type: 'water', x: 154, y: 130 }, { type: 'water', x: 200, y: 130 }, { type: 'water', x: 246, y: 130 }, { type: 'water', x: 292, y: 130 }, { type: 'water', x: 338, y: 130 },
      { type: 'start', x: 66, y: 152, text: 'התחלה' },
      { type: 'target', x: 430, y: 152, text: 'יעד' },
      { type: 'plank', x: 146, y: 176 }, { type: 'plank', x: 192, y: 176 }, { type: 'plank', x: 238, y: 176 }, { type: 'plank', x: 284, y: 176 },
      { type: 'agentCube', x: 94, y: 112 },
    ],
    code: [
      'for (let i = 0; i < 6; i++) {',
      '  agent.place(DOWN)',
      '  agent.move(FORWARD, 1)',
      '}',
    ],
    path: [[94,112],[146,112],[198,112],[250,112],[302,112],[354,112],[406,112]],
    captions: ['הגשר צריך כמה קטעים זהים, לא קוד ארוך ומשעמם.', 'מכניסים place ו-move לתוך לולאת repeat.', 'מריצים: כל חזרה מוסיפה עוד קטע לגשר.'],
  },
  {
    title: 'מפגש 2.3',
    lesson: 'דגם חוזר',
    image: images.lesson3,
    sub: 'מטרה: לבנות גשר עם תבנית חוזרת, לא רק קו ישר.',
    build: [
      { type: 'water', x: 142, y: 88 }, { type: 'water', x: 188, y: 88 }, { type: 'water', x: 234, y: 88 }, { type: 'water', x: 280, y: 88 }, { type: 'water', x: 326, y: 88 },
      { type: 'water', x: 142, y: 134 }, { type: 'water', x: 188, y: 134 }, { type: 'water', x: 234, y: 134 }, { type: 'water', x: 280, y: 134 }, { type: 'water', x: 326, y: 134 },
      { type: 'plank', x: 130, y: 176 }, { type: 'rail', x: 130, y: 130 }, { type: 'torch', x: 130, y: 84 },
      { type: 'plank', x: 176, y: 176 }, { type: 'plank', x: 222, y: 176 }, { type: 'rail', x: 222, y: 130 }, { type: 'torch', x: 222, y: 84 },
      { type: 'plank', x: 268, y: 176 }, { type: 'plank', x: 314, y: 176 }, { type: 'rail', x: 314, y: 130 }, { type: 'torch', x: 314, y: 84 },
      { type: 'agentCube', x: 94, y: 112 },
    ],
    code: [
      'for (let i = 0; i < 6; i++) {',
      'agent.place(DOWN)',
      'agent.place(LEFT)',
      'agent.move(FORWARD, 1)',
      '}',
    ],
    path: [[94,112],[146,112],[198,112],[250,112],[302,112],[354,112]],
    captions: ['מוסיפים לגשר דגם: רצפה, מעקה, ולפעמים לפיד.', 'בתוך הלולאה חוזרת תבנית, לא רק פעולה אחת.', 'מריצים: הגשר נראה מתוכנן וחוזר על אותו דגם.'],
  },
  {
    title: 'מפגש 2.4',
    lesson: 'גשר עצמאי',
    image: images.lesson4,
    sub: 'מטרה: לבחור אורך, להריץ, לבדוק ולתקן את מספר החזרות.',
    build: [
      { type: 'water', x: 130, y: 84 }, { type: 'water', x: 176, y: 84 }, { type: 'water', x: 222, y: 84 }, { type: 'water', x: 268, y: 84 }, { type: 'water', x: 314, y: 84 }, { type: 'water', x: 360, y: 84 },
      { type: 'water', x: 130, y: 130 }, { type: 'water', x: 176, y: 130 }, { type: 'water', x: 222, y: 130 }, { type: 'water', x: 268, y: 130 }, { type: 'water', x: 314, y: 130 }, { type: 'water', x: 360, y: 130 },
      { type: 'start', x: 56, y: 176, text: 'התחלה' },
      { type: 'plank', x: 122, y: 176 }, { type: 'plank', x: 168, y: 176 }, { type: 'plank', x: 214, y: 176 }, { type: 'plank', x: 260, y: 176 }, { type: 'plank', x: 306, y: 176 }, { type: 'plank', x: 352, y: 176 },
      { type: 'marker', x: 430, y: 176, text: 'בדיקה' },
      { type: 'agentCube', x: 90, y: 112 },
    ],
    code: [
      'let length = 8',
      'for (let i = 0; i < length; i++) {',
      '  agent.place(DOWN)',
      '  agent.move(FORWARD, 1)',
      '}',
      'player.say("הגשר מוכן לבדיקה")',
    ],
    path: [[90,112],[142,112],[194,112],[246,112],[298,112],[350,112],[402,112],[454,112]],
    captions: ['כל תלמיד מתכנן גשר אישי לפי רוחב התעלה שלו.', 'משתמשים במשתנה length כדי לשלוט במספר החזרות.', 'מריצים, בודקים אם הגשר הגיע לצד השני, ומשנים את length.'],
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
    title: 'אתגר 2: גשר הבנאי',
    lesson: 'Craftom Challenges',
    sub: '4 מפגשים שבהם הילדים בונים תעלה וגשר, ואז מלמדים Agent לבנות עם לולאה.',
    caption: 'המטרה: להבין לולאות דרך גשר שנבנה במיינקראפט.',
    small: 'פעולה חוזרת → לולאה → בדיקה → תיקון',
    progress: 0,
  });
  await hold(8);
  await setScene({
    image: images.overview,
    title: 'איך האתגר בנוי?',
    lesson: '4 מפגשים',
    sub: 'כל מפגש מתחיל בבנייה במגרש 50x50, ורק אחר כך עוברים לקוד.',
    caption: 'לא מתחילים מהסבר מופשט על לולאות. מתחילים מגשר שצריך לבנות.',
    small: 'תעלה • גשר • Agent • repeat',
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
      small: 'שלב 3: מריצים ורואים מה ה-Agent עושה',
      showBuild: true,
      showCode: true,
      code: data.code,
      runText: i === 3 ? 'מריצים, בודקים אם הגשר הגיע לצד השני, משנים length ומריצים שוב.' : 'מריצים את הפקודה bridge ורואים את ה-Agent בונה את הגשר.',
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
    sub: 'קראפטום מחפשת ראיות מתוך המשחק: תעלה, גשר, Agent, place, move, repeat ותיקונים.',
    caption: 'המורה רואה מה כל ילד באמת עשה, לא רק מי אמר “סיימתי”.',
    small: 'בנה גשר • השתמש בלולאה • הריץ • בדק • תיקן',
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
