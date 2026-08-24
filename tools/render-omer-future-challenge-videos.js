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
const MODULE_PATHS = [
  path.join(ROOT, 'node_modules'),
  '/home/igrois/.openclaw/workspace/robotics-for-kids/node_modules',
  '/home/igrois/.openclaw/workspace/english-buddy/node_modules',
];

const puppeteer = resolveModule('puppeteer-core', MODULE_PATHS);
const ffmpegPath = resolveModule('@ffmpeg-installer/ffmpeg', MODULE_PATHS).path;

const FPS = Number(process.env.FPS || 10);
const WIDTH = 1280;
const HEIGHT = 720;
const SPEED = Number(process.env.FINAL_SPEED || 1.08);
const GEMINI_LIVE_MODEL = process.env.SENSI_GEMINI_LIVE_MODEL || 'gemini-3.1-flash-live-preview';
const GEMINI_LIVE_VOICE = process.env.SENSI_GEMINI_LIVE_VOICE || 'Puck';
const GEMINI_LIVE_LANGUAGE = process.env.SENSI_GEMINI_LIVE_LANGUAGE || 'he-IL';

fs.mkdirSync(MARKETING, { recursive: true });

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

async function createGeminiLiveAudioWithKey(genai, apiKey, scriptPath, audioPath) {
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
      turns: geminiLivePrompt(fs.readFileSync(scriptPath, 'utf8')),
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
  const wavPath = audioPath.replace(/\.mp3$/i, '.wav');
  try {
    fs.writeFileSync(wavPath, wavFromPcm16(Buffer.concat(chunks), 24000));
    runFfmpeg(['-y', '-i', wavPath, '-b:a', '160k', audioPath]);
  } finally {
    fs.rmSync(wavPath, { force: true });
  }
}

async function createGeminiLiveAudio(scriptPath, audioPath) {
  if (fs.existsSync(audioPath)) return;
  const genai = resolveModule('@google/genai', MODULE_PATHS);
  const keys = extractGoogleAiKeys();
  if (!keys.length) throw new Error('missing GOOGLE_AI_API_KEY/GEMINI_API_KEY');
  let lastError = null;
  for (let index = 0; index < keys.length; index += 1) {
    try {
      console.log(`Creating Gemini Live narration for ${path.basename(audioPath)} with key ${index + 1}/${keys.length}`);
      await createGeminiLiveAudioWithKey(genai, keys[index], scriptPath, audioPath);
      return;
    } catch (err) {
      lastError = err;
      console.warn(`Gemini Live key ${index + 1}/${keys.length} failed: ${err.message || err}`);
    }
  }
  throw new Error(`Gemini Live failed for all configured keys: ${lastError?.message || lastError}`);
}

const challenges = [
  {
    id: 1,
    title: 'בניין הפלא של עומר',
    image: 'assets/craftom/omer-future/wonder-building.webp',
    color: '#f4c247',
    big: 'מה המקום שהכי חסר לילדים בעומר העתידנית?',
    build: 'מבנה מיוחד לילדים: בית משחקים, מעבדת המצאות, ספריית חלומות או מרכז מפגש.',
    json: 'מבנה שאפשר להיכנס אליו • שלט שם • חדר פנימי • פרט הפתעה',
    lessons: [
      ['1.1', 'בוחרים בניין', 'שם, צורך ו־3 דברים שחייבים להיות בפנים'],
      ['1.2', 'חזית וכניסה', 'קירות, גג, דלת, חלונות ושלט ברור'],
      ['1.3', 'חדר והפתעה', 'חדר שימוש אחד ופרט שילדים יאהבו'],
      ['1.4', 'בדיקה ושיפור', 'נכנסים בעצמנו, בודקים ומשפרים דבר אחד'],
    ],
    script: `סרטון הסבר לאתגר אחד: בניין הפלא של עומר.
באתגר הזה כל צוות עובד בחלקה שלו, ובונה מבנה אחד מיוחד לילדים בעומר העתידנית.
לא מתחילים ממפה מסובכת. מתחילים משאלה שילדים מבינים: איזה מקום היה כיף שיהיה ביישוב?
בשיעור הראשון בוחרים את סוג המבנה, נותנים לו שם, וכותבים שלושה דברים שחייבים להיות בו.
בשיעור השני בונים חזית וכניסה ברורה, עם שלט ושפה עיצובית.
בשיעור השלישי נכנסים פנימה ובונים חדר שימוש: משחק, יצירה, המצאות, ספורט או מפגש.
בשיעור הרביעי הצוות בודק בעצמו אם ילד שנכנס מבין מה עושים שם, ואז משפר דבר אחד.
קראפטום מחפשת ראיות: מבנה שאפשר להיכנס אליו, שלט שם, חדר פנימי, ופרט יצירתי שמראה למה ילדים ירצו להגיע לשם.`,
  },
  {
    id: 2,
    title: 'שכונה שמחברת אנשים',
    image: 'assets/craftom/omer-future/kids-neighborhood.webp',
    color: '#6ee7b7',
    big: 'איך נראית שכונה שילדים באמת רוצים לגור בה?',
    build: 'שכונת ילדים עם בתים, חצר משותפת, דרך לבית ספר ומרחב קהילתי.',
    json: 'בתים • חצר משותפת • שבילים • שלטים שמסבירים שימוש',
    lessons: [
      ['2.1', 'תכנון שכונה', 'מחליטים איפה יהיו בתים, חצר, דרך ומקום מפגש'],
      ['2.2', 'בתים וחצר', 'בונים בתים שונים וחצר משותפת לילדים'],
      ['2.3', 'דרך ומרכז', 'מוסיפים דרך לבית ספר ומרחב קהילתי קטן'],
      ['2.4', 'בדיקה ושיפור', 'בודקים אם ברור איפה גרים, משחקים והולכים'],
    ],
    script: `סרטון הסבר לאתגר שתיים: שכונה שמחברת אנשים.
כאן כל צוות מוסיף לחלקה שלו את אזור החיים של עומר העתידנית.
השאלה לילדים היא פשוטה: אם הייתם גרים פה עם חברים, איפה הבית, איפה נפגשים, ואיך מגיעים לבית הספר?
בשיעור הראשון מתכננים את השכונה ומסמנים אזורים.
בשיעור השני בונים בתים וחצר משותפת, לא בית אחד לבד באמצע שום מקום.
בשיעור השלישי מוסיפים דרך לבית הספר ומקום קהילתי קטן: גן משחקים, מרכז חוגים או פינת מפגש.
בשיעור הרביעי עושים בדיקה עצמית: האם אפשר להבין את השכונה בלי הסבר ארוך?
קראפטום מחפשת ראיות לבתים, מרחב משותף, שבילים ושלטים שמראים שהשכונה היא מערכת של חיים.`,
  },
  {
    id: 3,
    title: 'טבע, מים ואנרגיה בעומר',
    image: 'assets/craftom/omer-future/nature-water-energy.webp',
    color: '#7dd3fc',
    big: 'איך חיים בנוח ביום חם בעומר?',
    build: 'פארק מוצל, נקודת מים, אנרגיה סולארית ותאורה שמתחברת לחלקה.',
    json: 'צל • מים • אנרגיה/תאורה • חיבור למקום אחר • חשיבה על תקלה',
    lessons: [
      ['3.1', 'פארק מוצל', 'בונים מקום מנוחה עם צל וישיבה'],
      ['3.2', 'מים חכמים', 'מוסיפים מקור מים או נקודת שתייה עם הסבר'],
      ['3.3', 'אנרגיה ואור', 'בונים פאנלים, תאורה או תחנת אנרגיה'],
      ['3.4', 'תקלה ושיפור', 'בודקים מה קורה בלי מים, צל או אור ומשפרים'],
    ],
    script: `סרטון הסבר לאתגר שלוש: טבע, מים ואנרגיה בעומר.
באתגר הזה הילדים חושבים כמו מתכנני יישוב מדברי.
לא בונים קישוטים. בונים מערכות שעוזרות לחיות בעומר: צל, מים, אנרגיה ואור.
בשיעור הראשון בונים פארק מוצל או מקום מנוחה שמתאים ליום חם.
בשיעור השני מוסיפים מים: מאגר, תעלה, מזרקה או נקודת שתייה עם הסבר ברור.
בשיעור השלישי מוסיפים אנרגיה ותאורה, למשל פאנלים סולאריים ושביל מואר.
בשיעור הרביעי בודקים תקלה: מה יקרה אם אין מים, אין צל, או אין אור? ואז משפרים חיבור אחד.
קראפטום מחפשת ראיות למערכת משאב, להסבר זרימה, ולחשיבה מערכתית על מה קורה כשחלק אחד לא עובד.`,
  },
  {
    id: 4,
    title: 'רכבת הסיור בעומר העתידנית',
    image: 'assets/craftom/omer-future/tour-train.webp',
    color: '#c4b5fd',
    big: 'איך מציגים את כל החלקה דרך נסיעת רכבת?',
    build: 'רכבת סיור עם תחנת התחלה, מסילה, תחנות הסבר ונסיעת בדיקה.',
    json: 'מסילה/קרוניות • תחנות • שלטי הסבר • שיפור אחרי נסיעה',
    lessons: [
      ['4.1', 'תחנת התחלה', 'בונים תחנה ומחליטים מה המסלול יציג'],
      ['4.2', 'מסילה מחברת', 'מעבירים מסילה ליד לפחות שלושה רכיבי יישוב'],
      ['4.3', 'תחנות ושלטים', 'מוסיפים תחנות הסבר ליד דברים חשובים'],
      ['4.4', 'נסיעה ושיפור', 'נוסעים, רואים איפה מתבלבלים ומשפרים'],
    ],
    script: `סרטון הסבר לאתגר ארבע: רכבת הסיור בעומר העתידנית.
זה האתגר שמחבר את כל מה שהצוות בנה בחלקה שלו.
הילדים מדמיינים שהם מזמינים משפחה וחברים לנסיעת רכבת שמספרת את הסיפור של היישוב.
בשיעור הראשון בונים תחנת התחלה ושלט שמסביר לאן יוצאים.
בשיעור השני בונים מסילה שעוברת ליד המבנה המיוחד, השכונה, הטבע, המים והאנרגיה.
בשיעור השלישי מוסיפים תחנות ושלטים: מה רואים כאן, ולמה זה חשוב לעומר?
בשיעור הרביעי עושים נסיעת בדיקה אמיתית, מגלים איפה המסלול מבלבל, ומשפרים נקודה אחת.
קראפטום מחפשת מסילה או קרוניות, תחנות עם שלטים, ושיפור בעקבות נסיעה. בסוף כל צוות יכול להציג טיול של שתי דקות בחלקה שלו.`,
  },
];

function html() {
  return `<!doctype html>
  <html lang="he" dir="rtl">
  <head>
    <meta charset="utf-8">
    <style>
      *{box-sizing:border-box}
      body{margin:0;width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;font-family:Rubik,Arial,sans-serif;background:#07131d;color:#fff;direction:rtl}
      #stage{position:relative;width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;background:#0b1822}
      #bg{position:absolute;inset:0;background-size:cover;background-position:center;filter:saturate(1.12) contrast(1.04);transform:scale(1.05);transition:background-image .2s,transform .9s}
      #shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(3,10,15,.92) 0 32%,rgba(3,10,15,.38) 55%,rgba(3,10,15,.08) 100%)}
      #top{position:absolute;right:34px;top:24px;display:flex;gap:10px;align-items:center}
      .pill{background:#f4c247;color:#172018;border:3px solid rgba(255,255,255,.45);padding:8px 14px;border-radius:999px;font-weight:900;font-size:22px}
      #title{position:absolute;right:36px;top:86px;width:460px;font-size:52px;font-weight:900;line-height:1.04;text-shadow:0 3px 0 rgba(0,0,0,.25)}
      #sub{position:absolute;right:38px;top:210px;width:430px;font-size:25px;line-height:1.36;font-weight:800;color:#e8f7ff}
      #caption{position:absolute;right:36px;bottom:26px;width:540px;background:rgba(7,19,29,.9);border:3px solid var(--accent);border-radius:20px;padding:16px 20px;font-size:29px;line-height:1.25;font-weight:900;box-shadow:0 18px 35px rgba(0,0,0,.35)}
      #caption small{display:block;font-size:20px;color:#bde3ff;margin-top:7px;font-weight:800}
      #visual{position:absolute;left:34px;top:42px;width:650px;height:385px;border-radius:24px;border:4px solid #9bd2ff;background:rgba(221,244,255,.92);background-size:cover;background-position:center;box-shadow:0 24px 45px rgba(0,0,0,.35);overflow:hidden;opacity:0;transform:translateY(18px);transition:.25s}
      #visual.show{opacity:1;transform:translateY(0)}
      #visual:before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.1),rgba(0,0,0,.18) 45%,rgba(6,15,22,.68));}
      #visualTitle{position:absolute;right:20px;top:18px;margin:0;color:#123;font-size:27px;font-weight:900;background:rgba(255,255,255,.9);border-radius:999px;padding:8px 14px}
      #plot{position:absolute;left:24px;right:24px;bottom:26px;height:220px;border:4px solid #31542e;border-radius:16px;background:linear-gradient(135deg,rgba(118,190,90,.78),rgba(82,145,64,.82));overflow:hidden;box-shadow:inset 0 0 0 8px rgba(255,255,255,.13)}
      #plot:before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(90deg,rgba(255,255,255,.13) 0 2px,transparent 2px 40px),repeating-linear-gradient(0deg,rgba(0,0,0,.12) 0 2px,transparent 2px 40px)}
      .piece{position:absolute;width:60px;height:48px;border:3px solid rgba(0,0,0,.33);border-radius:8px;box-shadow:8px 8px 0 rgba(0,0,0,.22);display:flex;align-items:center;justify-content:center;font-weight:900;color:#132;transform:scale(0);opacity:0;transition:.23s;font-size:17px;text-align:center}
      .piece.on{transform:scale(1);opacity:1}
      .building{background:#f59e0b}.room{background:#fde68a}.home{background:#d97706;color:white}.yard{background:#84cc16}.path{background:#d7c48a}.water{background:#38bdf8}.solar{background:#1e40af;color:white}.tree{background:#22c55e}.rail{background:#78716c;color:white}.station{background:#e5e7eb}.sign{background:#fef3c7}.spark{background:#f472b6;color:white}
      #lessons{position:absolute;left:34px;bottom:34px;width:650px;height:230px;border-radius:22px;background:#0d1728;border:4px solid #68c5ff;box-shadow:0 24px 45px rgba(0,0,0,.35);opacity:0;transform:translateY(18px);transition:.25s;padding:16px 18px;display:grid;grid-template-columns:1fr 1fr;gap:10px}
      #lessons.show{opacity:1;transform:translateY(0)}
      .lesson{border:2px solid rgba(157,211,255,.6);border-radius:14px;background:#16223a;padding:8px 10px;font-weight:900;font-size:19px;line-height:1.25;color:#dbeafe}
      .lesson small{display:block;color:#fef08a;font-size:15px;margin-top:4px}
      .lesson.hot{background:var(--accent);color:#142014;border-color:#fff;box-shadow:0 0 0 4px rgba(255,255,255,.18)}
      .lesson.hot small{color:#173018}
      #json{position:absolute;left:736px;bottom:48px;width:480px;min-height:128px;background:rgba(255,255,255,.94);color:#142033;border:4px solid var(--accent);border-radius:20px;padding:16px 20px;font-size:26px;font-weight:900;line-height:1.25;opacity:0;transform:translateY(18px);transition:.25s}
      #json.show{opacity:1;transform:translateY(0)}
      #progress{position:absolute;left:736px;top:452px;width:480px;display:flex;gap:8px;opacity:0;transition:.25s}
      #progress.show{opacity:1}
      .dot{height:14px;flex:1;border-radius:999px;background:#315169;border:2px solid #92d5ff}
      .dot.on{background:var(--accent);border-color:#fff}
    </style>
    <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;700;800;900&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="stage">
      <div id="bg"></div><div id="shade"></div>
      <div id="top"><div class="pill" id="pill">אתגר</div><div class="pill">עומר העתידנית</div></div>
      <div id="title"></div><div id="sub"></div>
      <div id="visual"><h3 id="visualTitle">בונים במיינקראפט</h3><div id="plot"></div></div>
      <div id="lessons"></div>
      <div id="progress"></div>
      <div id="json"></div>
      <div id="caption"></div>
    </div>
    <script>
      const bg = document.getElementById('bg');
      const stage = document.getElementById('stage');
      const title = document.getElementById('title');
      const sub = document.getElementById('sub');
      const caption = document.getElementById('caption');
      const pill = document.getElementById('pill');
      const visual = document.getElementById('visual');
      const plot = document.getElementById('plot');
      const lessons = document.getElementById('lessons');
      const json = document.getElementById('json');
      const progress = document.getElementById('progress');
      window.setScene = (s) => {
        stage.style.setProperty('--accent', s.color || '#f4c247');
        bg.style.backgroundImage = 'url(' + s.image + ')';
        visual.style.backgroundImage = 'url(' + s.image + ')';
        title.textContent = s.title || '';
        sub.textContent = s.sub || '';
        pill.textContent = s.pill || 'אתגר';
        caption.innerHTML = (s.caption || '') + (s.small ? '<small>' + s.small + '</small>' : '');
        visual.classList.toggle('show', !!s.showVisual);
        lessons.classList.toggle('show', !!s.showLessons);
        json.classList.toggle('show', !!s.jsonText);
        json.textContent = s.jsonText || '';
        progress.classList.toggle('show', !!s.progress);
        if (s.progress) {
          progress.innerHTML = [0,1,2,3].map(i => '<div class="dot ' + (i < s.progress ? 'on' : '') + '"></div>').join('');
        }
        if (s.lessons) {
          lessons.innerHTML = s.lessons.map((item, i) => '<div class="lesson ' + (i === s.hotLesson ? 'hot' : '') + '"><span>' + item[0] + ' — ' + item[1] + '</span><small>' + item[2] + '</small></div>').join('');
        }
      };
      window.clearPlot = () => { plot.innerHTML = ''; };
      window.addPiece = (p) => {
        const el = document.createElement('div');
        el.className = 'piece ' + (p.type || 'building');
        el.style.left = p.x + 'px';
        el.style.top = p.y + 'px';
        el.textContent = p.text || '';
        plot.appendChild(el);
        requestAnimationFrame(() => el.classList.add('on'));
      };
    </script>
  </body>
  </html>`;
}

function piecesFor(id) {
  if (id === 1) {
    return [
      { type: 'building', x: 90, y: 116, text: 'מבנה' },
      { type: 'sign', x: 180, y: 154, text: 'שלט' },
      { type: 'room', x: 286, y: 112, text: 'חדר' },
      { type: 'spark', x: 402, y: 88, text: 'הפתעה' },
    ];
  }
  if (id === 2) {
    return [
      { type: 'home', x: 70, y: 120, text: 'בית' },
      { type: 'home', x: 168, y: 78, text: 'בית' },
      { type: 'yard', x: 270, y: 125, text: 'חצר' },
      { type: 'path', x: 390, y: 155, text: 'שביל' },
    ];
  }
  if (id === 3) {
    return [
      { type: 'tree', x: 78, y: 88, text: 'צל' },
      { type: 'water', x: 190, y: 142, text: 'מים' },
      { type: 'solar', x: 310, y: 94, text: 'אנרגיה' },
      { type: 'path', x: 430, y: 160, text: 'אור' },
    ];
  }
  return [
    { type: 'station', x: 58, y: 142, text: 'תחנה' },
    { type: 'rail', x: 168, y: 142, text: 'מסילה' },
    { type: 'rail', x: 278, y: 104, text: 'מסילה' },
    { type: 'sign', x: 410, y: 82, text: 'שלט' },
  ];
}

async function renderChallenge(challenge) {
  const slug = `omer-future-challenge${challenge.id}-explainer`;
  const frameDir = path.join(MARKETING, `${slug}-frames`);
  const scriptPath = path.join(MARKETING, `${slug}-script.txt`);
  const audioPath = path.join(MARKETING, `${slug}-gemini-live.mp3`);
  const silentPath = path.join(MARKETING, `${slug}-silent.mp4`);
  const muxedPath = path.join(MARKETING, `${slug}-gemini-live.mp4`);
  const finalPath = path.join(MARKETING, `${slug}-gemini-live-1.08x.mp4`);
  const image = asset(challenge.image);

  fs.writeFileSync(scriptPath, challenge.script);
  await createGeminiLiveAudio(scriptPath, audioPath);

  fs.rmSync(frameDir, { recursive: true, force: true });
  fs.mkdirSync(frameDir, { recursive: true });
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
    await page.screenshot({ path: path.join(frameDir, `frame-${String(frame).padStart(5, '0')}.png`) });
    frame += 1;
  }
  async function hold(seconds) {
    const count = Math.round(seconds * FPS);
    for (let i = 0; i < count; i += 1) await snap();
  }
  async function setScene(scene) {
    await page.evaluate((s) => window.setScene(s), scene);
  }

  const common = { image, color: challenge.color, pill: `אתגר ${challenge.id}` };
  await setScene({
    ...common,
    title: challenge.title,
    sub: challenge.big,
    caption: 'כל צוות עושה את אותו אתגר, אבל בונה בחלקה שלו.',
    small: 'מוגדר מאוד, עם מקום ליצירתיות בתוך Minecraft',
    progress: 0,
  });
  await hold(7);

  await setScene({
    ...common,
    title: 'מה בונים?',
    sub: challenge.build,
    caption: 'התלמידים לא מקבלים נושא פתוח מדי. הם מקבלים תוצר ברור.',
    small: 'אותו רכיב יישוב לכל הצוותים',
    showVisual: true,
    progress: 0,
  });
  await page.evaluate(() => window.clearPlot());
  await hold(1);
  for (const piece of piecesFor(challenge.id)) {
    await page.evaluate((p) => window.addPiece(p), piece);
    await hold(1);
  }
  await hold(5);

  for (let i = 0; i < challenge.lessons.length; i += 1) {
    await setScene({
      ...common,
      title: `שיעור ${challenge.lessons[i][0]}`,
      sub: challenge.lessons[i][1],
      caption: challenge.lessons[i][2],
      small: 'כל אתגר מחולק ל־4 שיעורים של 75 דקות',
      showVisual: true,
      showLessons: true,
      lessons: challenge.lessons,
      hotLesson: i,
      progress: i + 1,
    });
    await hold(8);
  }

  await setScene({
    ...common,
    title: 'JSON הצלחה',
    sub: 'קראפטום לא בודקת רק “סיימתי”. היא מחפשת ראיות מתוך הבנייה וההסבר.',
    caption: 'מה המורה תוכל לראות בדוח?',
    small: 'ראיות בנייה + חשיבה + שיפור',
    showVisual: true,
    jsonText: challenge.json,
    progress: 4,
  });
  await hold(9);

  await browser.close();

  runFfmpeg(['-y', '-framerate', String(FPS), '-i', path.join(frameDir, 'frame-%05d.png'), '-vf', 'format=yuv420p', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-movflags', '+faststart', silentPath]);
  runFfmpeg(['-y', '-i', silentPath, '-i', audioPath, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', muxedPath]);
  runFfmpeg(['-y', '-i', muxedPath, '-filter_complex', `[0:v]setpts=PTS/${SPEED},format=yuv420p[v];[0:a]atempo=${SPEED}[a]`, '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', finalPath]);
  fs.rmSync(frameDir, { recursive: true, force: true });
  fs.rmSync(silentPath, { force: true });
  fs.rmSync(muxedPath, { force: true });
  fs.rmSync(audioPath, { force: true });
  console.log(finalPath);
  return finalPath;
}

async function main() {
  const requested = process.argv.slice(2).map(Number).filter(Boolean);
  const selected = requested.length ? challenges.filter((challenge) => requested.includes(challenge.id)) : challenges;
  const outputs = [];
  for (const challenge of selected) {
    outputs.push(await renderChallenge(challenge));
  }
  console.log(outputs.join('\n'));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
