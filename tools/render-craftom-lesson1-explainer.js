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
const FRAME_DIR = path.join(MARKETING, 'craftom-lesson1-explainer-frames');
const SCRIPT_PATH = path.join(MARKETING, 'craftom-lesson1-explainer-script.txt');
const AUDIO_MP3 = path.join(MARKETING, 'craftom-lesson1-explainer-gemini-live.mp3');
const SILENT_MP4 = path.join(MARKETING, 'craftom-lesson1-explainer-silent.mp4');
const MUXED_MP4 = path.join(MARKETING, 'craftom-lesson1-explainer-gemini-live.mp4');
const FINAL_MP4 = path.join(MARKETING, 'craftom-lesson1-explainer-gemini-live-1.12x.mp4');

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
const SPEED = Number(process.env.FINAL_SPEED || 1);
const GEMINI_LIVE_MODEL = process.env.SENSI_GEMINI_LIVE_MODEL || 'gemini-3.1-flash-live-preview';
const GEMINI_LIVE_VOICE = process.env.SENSI_GEMINI_LIVE_VOICE || 'Puck';
const GEMINI_LIVE_LANGUAGE = process.env.SENSI_GEMINI_LIVE_LANGUAGE || 'he-IL';

fs.mkdirSync(MARKETING, { recursive: true });

const images = {
  overview: asset('assets/craftom/challenges/craftom-challenge1-explainer-gemini-live-1.12x-first-frame.webp'),
  lesson1: asset('assets/craftom/challenges/craftom-challenge1-explainer-gemini-live-1.12x-first-frame.webp'),
  lesson2: asset('assets/craftom/challenges/craftom-challenge1-explainer-gemini-live-1.12x-first-frame.webp'),
  lesson3: asset('assets/craftom/challenges/craftom-challenge1-explainer-gemini-live-1.12x-first-frame.webp'),
  lesson4: asset('assets/craftom/challenges/craftom-challenge1-explainer-gemini-live-1.12x-first-frame.webp'),
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

function getMediaDurationSeconds(file) {
  const result = spawnSync(ffmpegPath, ['-hide_banner', '-i', file], { encoding: 'utf8' });
  const text = `${result.stdout || ''}\n${result.stderr || ''}`;
  const match = text.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
  if (!match) return null;
  return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
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
  const script = `סרטון הסבר לשיעור הראשון בלומדת קראפטום: משלוח ראשון.

בשיעור הזה הילדים מתחילים ישר בפעולה: קודם עובדים באקדמיית ה-Agent. שם מתרגלים רעיון קטן ובטוח: פקודת צ׳אט בשם deliver, שמזמנת את ה-Agent ומזיזה אותו קדימה.

המטרה של שיעור 1 היא להבין את רעיון התכנות הראשון: רצף פקודות. קוד הוא הוראות מדויקות, לפי סדר. מזמנים את ה-Agent, מזיזים אותו, בודקים לאן הוא הגיע, ומשנים מספר אחד אם צריך.

אחרי שהתרגול באקדמיה עובר, עוברים למיינקראפט. הילדים בונים מחסן קטן, תחנת יעד ושביל ישר ביניהם. זאת משימה קטנה בכוונה, כדי שהילד יבין בדיוק איפה ה-Agent מתחיל ולאן הוא צריך להגיע.

כדי לפתוח את הקוד במיינקראפט לוחצים על המקש C במקלדת. זה פותח את Code Builder. בתוך Code Builder בוחרים MakeCode, ושם מכניסים את אותו רעיון מהאקדמיה: on chat command deliver, ואז agent teleport to player, ואז agent move forward.

כדי להריץ את הפקודה בתוך העולם לוחצים T, כותבים deliver, ואז Enter. עכשיו רואים את ה-Agent זז על השביל. אם הוא נעצר מוקדם מדי או עובר את התחנה, לא מוחקים הכול. משנים רק את המספר בתוך move ומריצים שוב.

אחרי שהקוד מוכן, חשוב שהמערכת תקבל גם את הקישור לקוד. ב-Code Builder או MakeCode פותחים Share, לוחצים Publish או Copy Link, ומעתיקים את הקישור שנוצר. אחר כך חוזרים למיינקראפט, פותחים צ׳אט, מדביקים את הקישור, ולוחצים Enter. ברגע שהקישור נשלח בצ׳אט של Minecraft, הוא עובר אוטומטית למורה.

בסוף השיעור הילד חוזר למתחם שלו במיינקראפט ומחפש כפתור סיום שיעור. הוא לוחץ עליו כדי שהדוח יישלח למורה. רק אחרי שיש קוד, קישור, וכפתור סיום שיעור, שיעור 1 באמת סגור.

המסר לילד פשוט: קודם אקדמיית ה-Agent, אחר כך בנייה במיינקראפט, אחר כך MakeCode, מדביקים את קישור הקוד בצ׳אט של Minecraft, ולוחצים על כפתור סיום השיעור במתחם.`;
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
      .house{background:#b77b42}.station{background:#e9eef0}.path{background:#d7c48a}.package{background:#f4c247}.obstacle{background:#d95b44;color:white}.agentCube{background:#f5f5e8;color:#123}
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
      #keyboard{position:absolute;left:56px;top:58px;width:610px;background:rgba(236,249,255,.96);border:5px solid #9bd2ff;border-radius:24px;padding:22px;box-shadow:0 24px 45px rgba(0,0,0,.35);opacity:0;transform:translateY(18px);transition:.25s;z-index:5}
      #keyboard.show{opacity:1;transform:translateY(0)}
      .keys{direction:ltr;display:grid;grid-template-columns:repeat(10,1fr);gap:9px}
      .key{height:52px;border-radius:12px;border:3px solid #26384d;background:#fff;color:#172033;display:grid;place-items:center;font:900 24px/1 Rubik,Arial,sans-serif;box-shadow:0 6px 0 rgba(15,23,42,.22);transition:.2s}
      .key.hot{background:#f4c247;color:#111827;transform:scale(1.7);z-index:2;box-shadow:0 0 0 8px rgba(244,194,71,.28),0 14px 28px rgba(0,0,0,.28)}
      #keyboardLabel{margin-top:18px;color:#142033;font-size:28px;font-weight:900;text-align:center}
      #sharePanel{position:absolute;left:48px;top:78px;width:630px;background:#0d1728;border:5px solid #68c5ff;border-radius:24px;padding:20px 24px;box-shadow:0 24px 45px rgba(0,0,0,.38);opacity:0;transform:translateY(18px);transition:.25s;z-index:5}
      #sharePanel.show{opacity:1;transform:translateY(0)}
      #sharePanel h3{margin:0 0 12px;color:#d9f99d;font-size:34px}
      #sharePanel p{margin:0 0 10px;font-size:24px;line-height:1.35;font-weight:800;color:#e8f7ff}
      #shareLink{direction:ltr;text-align:left;background:#fff;color:#0f172a;border-radius:14px;padding:12px 14px;font:900 20px/1.2 ui-monospace,SFMono-Regular,Consolas,monospace;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      #finishButton{position:absolute;left:92px;top:116px;width:250px;height:250px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fef3c7,#f97316 62%,#7c2d12);border:9px solid #fff7ed;color:#fff;display:grid;place-items:center;text-align:center;font:900 34px/1.1 Rubik,Arial,sans-serif;box-shadow:0 0 0 10px rgba(249,115,22,.28),0 28px 46px rgba(0,0,0,.38);opacity:0;transform:scale(.75);transition:.25s;z-index:6}
      #finishButton.show{opacity:1;transform:scale(1)}
    </style>
    <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;700;800;900&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="stage">
      <div id="bg"></div><div id="shade"></div>
      <div id="top"><div class="pill" id="pill">אתגר 1</div><div class="pill" id="lesson">הרובוט השליח</div></div>
      <div id="title"></div><div id="sub"></div>
      <div id="build"><h3 id="buildTitle">בונים במיינקראפט</h3><div id="plot"></div></div>
      <div id="code"><div id="codeTitle">כותבים קוד לאט</div><div id="codeLines"></div></div>
      <div id="keyboard"><div class="keys" id="keys"></div><div id="keyboardLabel"></div></div>
      <div id="sharePanel"><h3>מדביקים את הקישור בצ׳אט</h3><p>ב־MakeCode עושים Share / Copy Link, חוזרים למיינקראפט ומדביקים בצ׳אט.</p><div id="shareLink">https://minecraft.makecode.com/...</div></div>
      <div id="finishButton">סיום<br>שיעור</div>
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
      const keyboard = document.getElementById('keyboard');
      const keys = document.getElementById('keys');
      const keyboardLabel = document.getElementById('keyboardLabel');
      const sharePanel = document.getElementById('sharePanel');
      const finishButton = document.getElementById('finishButton');
      const run = document.getElementById('run');
      const progress = document.getElementById('progress');
      let agent = null;
      window.setScene = (s) => {
        bg.style.backgroundImage = 'linear-gradient(180deg,#7dd3fc 0 36%,#4f9b3d 36% 58%,#7a4f2a 58% 100%)';
        build.style.backgroundImage = 'linear-gradient(180deg,#9ee7ff 0 32%,#6fb956 32% 58%,#8b5a2f 58% 100%)';
        plot.style.backgroundImage = 'linear-gradient(135deg,rgba(92,157,65,.92),rgba(56,111,50,.95))';
        title.textContent = s.title || '';
        sub.textContent = s.sub || '';
        lesson.textContent = s.lesson || 'הרובוט השליח';
        caption.innerHTML = (s.caption || '') + (s.small ? '<small>' + s.small + '</small>' : '');
        build.classList.toggle('show', !!s.showBuild);
        code.classList.toggle('show', !!s.showCode);
        keyboard.classList.toggle('show', !!s.key);
        sharePanel.classList.toggle('show', !!s.showShare);
        finishButton.classList.toggle('show', !!s.showFinish);
        run.classList.toggle('show', !!s.runText);
        progress.classList.toggle('show', !!s.progress);
        run.textContent = s.runText || '';
        if (s.code) {
          codeLines.innerHTML = s.code.map((line, i) => '<span class="line" data-i="' + i + '">' + line.replace(/</g,'&lt;') + '</span>').join('');
        }
        if (s.key) {
          const rows = ['QWERTYUIOP','ASDFGHJKL','ZXCVBNM'];
          keys.innerHTML = rows.join('').split('').map(ch => '<div class="key ' + (ch === s.key ? 'hot' : '') + '">' + ch + '</div>').join('');
          keyboardLabel.textContent = s.key === 'C' ? 'לוחצים C כדי לפתוח Code Builder' : 'לוחצים T כדי לפתוח צ׳אט';
        }
        if (s.progress) {
          progress.innerHTML = [0,1,2,3].map(i => '<div class="dot ' + (i < s.progress ? 'on' : '') + '"></div>').join('');
        }
      };
      window.clearPlot = () => { plot.innerHTML = ''; agent = null; };
      window.addCube = (c) => {
        const el = document.createElement('div');
        el.className = 'cube ' + (c.type || 'path');
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
    title: 'מפגש 1.1',
    lesson: 'משלוח ראשון',
    image: images.lesson1,
    sub: 'מטרה: להבין שקוד הוא רצף פקודות פשוט.',
    build: [
      { type: 'house', x: 60, y: 152, text: 'בית' },
      { type: 'path', x: 150, y: 175 }, { type: 'path', x: 196, y: 175 }, { type: 'path', x: 242, y: 175 }, { type: 'path', x: 288, y: 175 },
      { type: 'station', x: 374, y: 152, text: 'יעד' },
      { type: 'agentCube', x: 112, y: 118 },
    ],
    code: [
      'player.onChat("deliver", function () {',
      '  agent.teleportToPlayer()',
      '  agent.move(FORWARD, 5)',
      '  player.say("המשלוח הגיע")',
      '})',
    ],
    path: [[112,118],[170,118],[226,118],[282,118],[338,118],[388,118]],
    captions: ['בונים בית, שביל ישר ותחנת משלוחים.', 'כותבים פקודה אחת: deliver.', 'מריצים: ה-Agent מתקדם עד התחנה.'],
  },
  {
    title: 'מפגש 1.2',
    lesson: 'מסלול עם פנייה',
    image: images.lesson2,
    sub: 'מטרה: להבין שסדר הפעולות משנה את התוצאה.',
    build: [
      { type: 'house', x: 58, y: 178, text: 'בית' },
      { type: 'path', x: 146, y: 198 }, { type: 'path', x: 192, y: 198 }, { type: 'path', x: 238, y: 198 },
      { type: 'path', x: 238, y: 152 }, { type: 'path', x: 238, y: 106 }, { type: 'path', x: 284, y: 106 }, { type: 'path', x: 330, y: 106 },
      { type: 'station', x: 420, y: 82, text: 'יעד' },
      { type: 'agentCube', x: 102, y: 146 },
    ],
    code: [
      'agent.teleportToPlayer()',
      'agent.move(FORWARD, 3)',
      'agent.turn(LEFT_TURN)',
      'agent.move(FORWARD, 2)',
      'player.say("הגעתי לתחנה")',
    ],
    path: [[102,146],[158,146],[214,146],[258,146],[258,100],[314,100],[372,100]],
    captions: ['בונים מסלול בצורת ר, עם פנייה אחת ברורה.', 'הקוד: קדימה, פנייה, ואז עוד קדימה.', 'מריצים ורואים שהסדר חשוב.'],
  },
  {
    title: 'מפגש 1.3',
    lesson: 'סימון תחנות',
    image: images.lesson3,
    sub: 'מטרה: לגרום לקוד לבצע פעולה בעולם.',
    build: [
      { type: 'house', x: 56, y: 164, text: 'בית' },
      { type: 'path', x: 146, y: 186 }, { type: 'path', x: 192, y: 186 }, { type: 'path', x: 238, y: 186 }, { type: 'path', x: 284, y: 186 },
      { type: 'station', x: 388, y: 150, text: 'תחנה' },
      { type: 'package', x: 432, y: 204, text: 'חבילה' },
      { type: 'agentCube', x: 112, y: 132 },
    ],
    code: [
      'agent.move(FORWARD, 5)',
      'agent.place(DOWN)',
      'player.say("המשלוח הגיע לתחנה")',
    ],
    path: [[112,132],[170,132],[226,132],[282,132],[344,132],[408,132]],
    captions: ['מוסיפים מקום פנוי בתחנת היעד.', 'ה-Agent לא רק הולך. הוא מניח בלוק.', 'מריצים: הבלוק מסמן שהמשלוח הגיע.'],
  },
  {
    title: 'מפגש 1.4',
    lesson: 'אתגר שליח עצמאי',
    image: images.lesson4,
    sub: 'מטרה: לתכנן, לבדוק ולתקן לבד.',
    build: [
      { type: 'house', x: 50, y: 182, text: 'בית' },
      { type: 'path', x: 138, y: 202 }, { type: 'path', x: 184, y: 202 }, { type: 'path', x: 230, y: 202 },
      { type: 'obstacle', x: 276, y: 202, text: '!' },
      { type: 'path', x: 230, y: 156 }, { type: 'path', x: 230, y: 110 }, { type: 'path', x: 276, y: 110 }, { type: 'path', x: 322, y: 110 },
      { type: 'station', x: 420, y: 88, text: 'יעד' },
      { type: 'agentCube', x: 104, y: 150 },
    ],
    code: [
      'agent.move(FORWARD, __)',
      'agent.turn(LEFT_TURN)',
      'agent.move(FORWARD, __)',
      'agent.place(DOWN)',
      'player.say("המשלוח הגיע")',
    ],
    path: [[104,150],[158,150],[214,150],[244,150],[244,104],[300,104],[360,104],[420,104]],
    captions: ['כל תלמיד בונה מסלול אישי עם יעד ברור.', 'אין תשובה אחת. משנים מספרים וכיוונים.', 'מריצים, רואים טעות, מתקנים ומנסים שוב.'],
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
    const file = path.join(FRAME_DIR, `frame-${String(frame).padStart(5, '0')}.png`);
    await page.screenshot({ path: file });
    frame += 1;
    return file;
  }
  async function hold(seconds) {
    const count = Math.round(seconds * FPS);
    if (count <= 0) return;
    const source = await snap();
    for (let i = 1; i < count; i += 1) {
      fs.copyFileSync(source, path.join(FRAME_DIR, `frame-${String(frame).padStart(5, '0')}.png`));
      frame += 1;
    }
  }
  async function setScene(scene) {
    await page.evaluate((s) => window.setScene(s), scene);
    await new Promise((resolve) => setTimeout(resolve, 280));
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

  const data = lessonData[0];

  await clearPlot();
  await setScene({
    image: data.image,
    title: 'שיעור 1: משלוח ראשון',
    lesson: 'אקדמיית ה-Agent',
    sub: 'מתחילים בפעולה: פקודת deliver קטנה, בדיקה, ואז עוברים למיינקראפט.',
    caption: 'כבר מהתחלה רואים את המסלול: Agent, שביל ותחנת יעד.',
    small: 'deliver • teleport • move',
    showBuild: true,
    showCode: true,
    code: data.code,
    progress: 1,
  });
  await hold(1);
  for (const cube of data.build) {
    await addCube(cube);
    await hold(0.34);
  }
  await hold(27);

  await setScene({
    image: data.image,
    title: data.title,
    lesson: data.lesson,
    sub: data.sub,
    caption: 'אחרי האקדמיה עוברים למיינקראפט ובונים מחסן, שביל ישר ותחנת משלוחים.',
    small: 'הילד רואה איפה ה-Agent מתחיל ולאן הוא צריך להגיע',
    showBuild: true,
    progress: 1,
  });
  await hold(14);

  await setScene({
    image: data.image,
    title: 'פותחים Code Builder',
    lesson: 'מקש C',
    sub: 'במיינקראפט לוחצים C כדי לפתוח את Code Builder.',
    caption: 'המקש החשוב כאן הוא C.',
    small: 'C → Code Builder → MakeCode',
    key: 'C',
    progress: 1,
  });
  await hold(7.5);

  await setScene({
    image: data.image,
    title: 'MakeCode',
    lesson: 'אותו רעיון בקוד',
    sub: 'מכניסים את פקודת deliver ואת פקודות ה-Agent.',
    caption: 'זה אותו רעיון מהאקדמיה, רק עכשיו בתוך MakeCode של מיינקראפט.',
    small: 'on chat command deliver',
    showCode: true,
    code: data.code,
    progress: 1,
  });
  await hold(1.5);
  for (let line = 0; line < data.code.length; line += 1) {
    await highlightCode(line);
    await hold(1);
  }
  await hold(5.5);

  await setScene({
    image: data.image,
    title: 'מריצים בצ׳אט',
    lesson: 'מקש T',
    sub: 'פותחים צ׳אט, כותבים deliver ולוחצים Enter.',
    caption: 'כדי להריץ את הפקודה בתוך העולם לוחצים T.',
    small: 'T → deliver → Enter',
    key: 'T',
    progress: 1,
  });
  await hold(5.5);

  await setScene({
    image: data.image,
    title: data.title,
    lesson: data.lesson,
    sub: data.sub,
    caption: 'ה-Agent מתקדם על השביל. אם המרחק לא מתאים, משנים רק את המספר בתוך move.',
    small: 'בודקים, מתקנים מספר אחד, ומריצים שוב',
    showBuild: true,
    showCode: true,
    code: data.code,
    runText: 'T → deliver → Enter. ה-Agent מתקדם על השביל עד תחנת המשלוחים.',
    progress: 1,
  });
  await hold(1);
  for (const point of data.path) {
    await moveAgent(point[0], point[1]);
    await hold(0.65);
  }
  await hold(4.5);

  await setScene({
    image: data.image,
    title: 'מדביקים קישור בצ׳אט',
    lesson: 'Share',
    sub: 'ב־MakeCode עושים Share / Copy Link, ואז חוזרים למיינקראפט.',
    caption: 'מדביקים את הקישור בצ׳אט של Minecraft ולוחצים Enter. הוא נשלח אוטומטית למורה.',
    small: 'Share → Copy Link → Minecraft chat → Enter',
    showShare: true,
    progress: 1,
  });
  await hold(21.5);

  await setScene({
    image: images.overview,
    title: 'סיום שיעור',
    lesson: 'שולחים דוח למורה',
    sub: 'בסוף השיעור חוזרים למתחם של הילד במיינקראפט ומחפשים כפתור סיום שיעור.',
    caption: 'לוחצים על כפתור סיום שיעור כדי שהדוח יישלח למורה.',
    small: 'קוד + קישור + כפתור סיום שיעור',
    showFinish: true,
    progress: 1,
  });
  await hold(13);

  await setScene({
    image: images.overview,
    title: 'שיעור 1 נסגר כש...',
    lesson: 'בדיקת הצלחה',
    sub: 'ה-Agent הגיע לתחנה, קישור הקוד הודבק בצ׳אט, וכפתור סיום שיעור נלחץ במתחם.',
    caption: 'זה הסדר: אקדמיה, Minecraft, MakeCode, קישור בצ׳אט, סיום שיעור.',
    small: 'עכשיו המורה מקבלת אוטומטית גם דוח וגם קישור לקוד',
    showFinish: true,
    progress: 1,
  });
  await hold(12);
  const audioDuration = getMediaDurationSeconds(AUDIO_MP3);
  const currentDuration = frame / FPS;
  if (audioDuration && currentDuration < audioDuration + 2) {
    await hold(audioDuration + 2 - currentDuration);
  }

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
  console.log(FINAL_MP4);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
