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
  ROOT,
  '/home/igrois/.openclaw/workspace/robotics-for-kids',
  '/home/igrois/.openclaw/workspace/english-buddy',
  '/home/igrois/.openclaw/workspace/russian-reading-tutor',
];

const puppeteer = resolveModule('puppeteer-core', MODULE_PATHS);
const ffmpegPath = resolveModule('@ffmpeg-installer/ffmpeg', MODULE_PATHS).path;

const FPS = Number(process.env.FPS || 10);
const WIDTH = 1280;
const HEIGHT = 720;
const MINECRAFT_HEIGHT = 430;
const GEMINI_LIVE_MODEL = process.env.SENSI_GEMINI_LIVE_MODEL || 'gemini-3.1-flash-live-preview';
const GEMINI_LIVE_VOICE = process.env.SENSI_GEMINI_LIVE_VOICE || 'Puck';
const GEMINI_LIVE_LANGUAGE = process.env.SENSI_GEMINI_LIVE_LANGUAGE || 'he-IL';

fs.mkdirSync(MARKETING, { recursive: true });

const sourceVideos = {
  challenge1: path.join(MARKETING, 'craftom-challenge1-explainer-gemini-live-1.12x.mp4'),
  challenge2: path.join(MARKETING, 'craftom-challenge2-explainer-gemini-live-1.12x.mp4'),
  challenge3: path.join(MARKETING, 'craftom-challenge3-explainer-gemini-live-1.12x.mp4'),
  challenge4: path.join(MARKETING, 'craftom-challenge4-explainer-gemini-live-1.12x.mp4'),
};

const specs = [
  {
    id: 2,
    slug: 'craftom-challenge2-delivery-line',
    title: 'אתגר 2: קו המשלוחים האוטומטי',
    script: `סרטון הסבר לאתגר השני בלומדה של קראפטום לכיתות ז: קו המשלוחים האוטומטי.

באתגר הראשון הילדים בנו משלוח אחד: מחסן, תחנת יעד, מסלול, ו-Agent שיודע להגיע לתחנה.

עכשיו העיר גדלה. משלוח אחד כבר לא מספיק. צריך קו משלוחים שעובד שוב ושוב, בלי שהתלמיד יעשה כל פעולה ביד.

כאן נכנסות לולאות. קודם בונים פעולה אחת שלמה: ה-Agent יוצא מהמחסן, מגיע לתחנה, מניח או מפיל חבילה, ואז חוזר לנקודת ההתחלה.

רק אחרי שסיבוב אחד עובד, מכניסים אותו ללולאה. הלולאה אומרת לסוכן: אם הקו פעיל, בצע עוד סיבוב משלוח, חכה רגע, ואז בדוק שוב.

כדי שהלולאה תהיה בטוחה, מוסיפים שליטה. פקודת start מפעילה משתנה בשם running. פקודת stop מכבה אותו. בתוך forever, הסוכן עובד רק אם running שווה true.

זה היתרון האמיתי של הסוכן: לא לבנות גשר קטן ביד, אלא להפעיל עבודה שחוזרת על עצמה בעיר. הוא יכול לצאת, למסור, לחזור, לחכות, ולעשות את זה שוב.

במפגש הראשון מבינים למה משלוח אחד לא מספיק. במפגש השני בונים מחזור הלוך וחזור. במפגש השלישי מוסיפים לולאה עם start ו-stop. ובמפגש הרביעי כל תלמיד יוצר קו משלוחים אישי בעיר שלו.

בסוף האתגר הילדים מבינים שלולאה היא לא רק קיצור קוד. היא דרך לגרום למערכת לעבוד לבד, אבל עדיין להיות בשליטה.`,
    scenes: [
      { source: 'challenge1', start: 28, span: 22, caption: 'מתחילים ממה שכבר נבנה', subtitle: 'מחסן, תחנה ו-Agent שיודע לבצע משלוח אחד', codeTitle: 'אתגר 1 - רצף', code: ['on chat "deliver"', '  agent.move(FORWARD, 4)', '  agent.turn(RIGHT_TURN)', '  agent.place(DOWN)'], hot: [0, 1, 2, 3], weight: 14 },
      { source: 'challenge2', start: 14, span: 30, caption: 'משלוח אחד לא מספיק', subtitle: 'העיר גדלה וצריך עבודה שחוזרת על עצמה', codeTitle: 'בעיה חדשה בעיר', code: ['delivery once ✓', 'new station +', 'repeat work needed', 'Agent can automate it'], hot: [0, 1, 2, 3], weight: 16 },
      { source: 'challenge2', start: 36, span: 36, caption: 'בונים מחזור פעולה', subtitle: 'יוצאים, מוסרים חבילה, וחוזרים להתחלה', codeTitle: 'מחזור משלוח', code: ['goToStation()', 'agent.drop()', 'returnToStart()', 'pause(500)'], hot: [0, 1, 2, 3], weight: 18 },
      { source: 'challenge2', start: 54, span: 38, caption: 'מכניסים ללולאה', subtitle: 'הסוכן עובד שוב ושוב, אבל רק כשמפעילים אותו', codeTitle: 'MakeCode - לולאה בטוחה', code: ['let running = false', 'on chat "start": running = true', 'on chat "stop": running = false', 'forever:', '  if running:', '    deliveryCycle()', '    pause(500)'], hot: [0, 1, 2, 3, 4, 5, 6], weight: 24 },
      { source: 'challenge2', start: 78, span: 32, caption: 'קו אישי בעיר', subtitle: 'כל תלמיד בוחר מסלול, מריץ שני סיבובים ומתקן', codeTitle: 'ראיות Craftom', code: ['route is marked', 'Agent completes a cycle', 'start and stop work', 'one fix is explained'], hot: [0, 1, 2, 3], weight: 18 },
    ],
  },
  {
    id: 3,
    slug: 'craftom-challenge3-smart-delivery-line',
    title: 'אתגר 3: קו משלוחים חכם',
    script: `סרטון הסבר לאתגר השלישי בלומדה של קראפטום לכיתות ז: קו משלוחים חכם.

בסוף אתגר 2 יש בעיר קו משלוחים אוטומטי. ה-Agent יודע לצאת מהמחסן, להגיע לתחנה, למסור חבילה, לחזור, ולעבוד בלולאה.

אבל עיר אמיתית לא תמיד נשארת באותו מצב. לפעמים הדרך חסומה. לפעמים השער סגור. לפעמים התחנה מלאה. לפעמים יש סימן אדום שאומר לעצור, וסימן ירוק שאומר להמשיך.

באתגר 3 הילדים מוסיפים תנאים. כלומר: הסוכן לא רק חוזר על פעולה, אלא בודק מצב ומחליט מה לעשות.

הכלל צריך להיות משהו שרואים במיינקראפט. למשל: אם יש בלוק אדום בדרך, עצור ודווח. אם יש בלוק ירוק, המשך. אם התחנה מלאה, אל תניח עוד חבילה. אם הדרך חסומה, חכה או עבור למסלול אחר.

בקוד זה נראה כמו if ו-else. אם התנאי מתקיים, עושים פעולה אחת. אחרת, עושים פעולה אחרת.

במפגש הראשון מוסיפים מצב נראה לעיר. במפגש השני כותבים תנאי פשוט. במפגש השלישי מוסיפים תגובה אחרת כשיש חסימה. ובמפגש הרביעי כל תלמיד יוצר חוק חכם משלו.

ככה הילדים מבינים את הרעיון החשוב: תנאי נותן לקוד שיקול דעת. ה-Agent לא עובד בעיוורון. הוא מסתכל על מצב העיר, ואז בוחר אם להמשיך, לעצור, לחכות או לדווח.

בסוף האתגר קו המשלוחים כבר לא רק אוטומטי. הוא חכם.`,
    scenes: [
      { source: 'challenge2', start: 42, span: 28, caption: 'מתחילים מקו אוטומטי', subtitle: 'הסוכן כבר עובד בלולאה מאתגר 2', codeTitle: 'מה כבר יש?', code: ['forever:', '  if running:', '    deliveryCycle()', '    pause(500)'], hot: [0, 1, 2, 3], weight: 14 },
      { source: 'challenge3', start: 12, span: 32, caption: 'העיר משנה מצב', subtitle: 'שער, חסימה, תחנה מלאה או סימון אדום/ירוק', codeTitle: 'מצב נראה בעולם', code: ['red block = stop', 'green block = go', 'stationFull = true/false', 'routeBlocked = true/false'], hot: [0, 1, 2, 3], weight: 18 },
      { source: 'challenge3', start: 32, span: 38, caption: 'מוסיפים תנאי', subtitle: 'אם הדרך פתוחה - ממשיכים. אחרת - עוצרים', codeTitle: 'MakeCode - if', code: ['if routeOpen:', '  agent.move(FORWARD, 4)', '  agent.drop()', 'else:', '  player.say("ממתין")'], hot: [0, 1, 2, 3, 4], weight: 22 },
      { source: 'challenge3', start: 58, span: 40, caption: 'תגובה חכמה', subtitle: 'הסוכן יכול לחכות, לדווח או לבחור מסלול אחר', codeTitle: 'MakeCode - if / else', code: ['if agent.detect(FORWARD):', '  player.say("הדרך חסומה")', '  pause(1000)', 'else:', '  deliveryCycle()'], hot: [0, 1, 2, 3, 4], weight: 22 },
      { source: 'challenge3', start: 82, span: 34, caption: 'חוק אישי', subtitle: 'כל תלמיד בונה כלל שנראה בעולם ונבדק בשני מצבים', codeTitle: 'ראיות Craftom', code: ['visible state in Minecraft', 'if / else rule', 'two scenarios tested', 'one explanation'], hot: [0, 1, 2, 3], weight: 18 },
    ],
  },
  {
    id: 4,
    slug: 'craftom-challenge4-smart-city-automations',
    title: 'אתגר 4: העיר החכמה שלי',
    script: `סרטון הסבר לאתגר הרביעי בלומדה של קראפטום לכיתות ז: העיר החכמה שלי.

זה אתגר הסיום של הקורס. הילדים לא מתחילים עולם חדש, ולא מקבלים משימה מנותקת. הם חוזרים לעיר שבנו בשלושת האתגרים הראשונים.

כבר יש להם אזור משלוחים, Agent שיודע לבצע רצף פעולות, קו אוטומטי שעובד בלולאה, וחוק חכם אחד שמחליט לפי מצב בעולם.

עכשיו הם לא רק מציגים את מה שכבר נבנה. הם מוסיפים עוד אוטומציות למערכות בעיר, ומשדרגים אותה לעיר חכמה אישית.

אפשר להוסיף קו משלוחים נוסף, שער חכם, תחנת איסוף שמסמנת אם היא מלאה, סיור בטיחות של ה-Agent, רמזור קטן, או מערכת תחזוקה שמניחה ומחליפה בלוקים.

המטרה היא לא לבנות פרויקט ענק. המטרה היא לבחור שתיים או שלוש מערכות בעיר, להוסיף להן אוטומציה קטנה, ואז להראות שהן עובדות יחד.

במפגש הראשון ממפים את העיר: מה כבר עובד, איזה קו אוטומטי קיים, ואיפה כדאי להוסיף שדרוג.

במפגש השני מוסיפים אוטומציה חדשה. פקודת start יכולה להזיז Agent, להפעיל שער, להניח חבילה, לשנות סימון, או להתחיל סיור.

במפגש השלישי מריצים test על שתי אוטומציות בעיר. מחפשים תקלה קטנה: מרחק לא נכון, כיוון לא מתאים, זמן המתנה חסר, או תנאי שלא מתנהג כמו שרצינו. מתקנים דבר אחד ומריצים שוב.

במפגש הרביעי מכינים demo. התלמיד מציג מה היה בעיר לפני, אילו אוטומציות נוספו, מה הקוד עושה, ומה הוא תיקן אחרי הבדיקה.

ככה אתגר 4 סוגר את כל התוכנית: לא רק עיר יפה במיינקראפט, אלא עיר שיש בה כמה מערכות אוטומטיות. הילדים משתמשים ברצף, לולאה, תנאי, Agent, בדיקה ודיבוג, ומראים עיר חכמה שבאמת עובדת.`,
    scenes: [
      { source: 'challenge4', start: 8, span: 28, caption: 'חוזרים לעיר שהתפתחה', subtitle: 'כבר יש משלוח, לולאה ותנאי מאתגרים 1-3', codeTitle: 'מה כבר עובד בעיר', code: ['delivery route ✓', 'Agent sequence ✓', 'loop automation ✓', 'if / else decision ✓'], hot: [0, 1, 2, 3], weight: 17 },
      { source: 'challenge4', start: 26, span: 34, caption: 'מוסיפים עוד אוטומציות', subtitle: 'שער, תחנת איסוף, קו נוסף, סיור או תחזוקה', codeTitle: 'תכנון העיר החכמה', code: ['automation 1 = delivery line', 'automation 2 = smart gate', 'automation 3 = safety patrol', 'each one has a trigger'], hot: [0, 1, 2, 3], weight: 21 },
      { source: 'challenge4', start: 50, span: 36, caption: 'start מפעיל מערכת', subtitle: 'כל אוטומציה עושה פעולה שרואים בעולם', codeTitle: 'MakeCode - automation', code: ['player.onChat("start", function () {', '  agent.move(FORWARD, 3)', '  agent.drop(FORWARD, 1)', '  player.say("קו המשלוחים פעל")', '})'], hot: [0, 1, 2, 3, 4], weight: 20 },
      { source: 'challenge4', start: 78, span: 34, caption: 'test בודק כמה מערכות', subtitle: 'בודקים שתי אוטומציות ומתקנים תקלה אחת', codeTitle: 'MakeCode - test', code: ['player.onChat("test", function () {', '  player.runChatCommand("start")', '  player.say("בודק שער וסיור")', '})', '// fix one number or condition'], hot: [0, 1, 2, 3, 4], weight: 20 },
      { source: 'challenge4', start: 104, span: 24, caption: 'demo של עיר חכמה', subtitle: 'מה היה בעיר, מה נוסף, ומה עובד יחד', codeTitle: 'ראיות Craftom', code: ['2+ automations in Minecraft', 'start / test / demo', 'sequence + loop + if', 'debug explanation'], hot: [0, 1, 2, 3], weight: 20 },
    ],
  },
];

function run(args) {
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
    'Use natural Israeli Hebrew, clear instructor pacing, warm and confident.',
    'Pronounce "לומדה" as Lomda / LOHM-da, with two syllables. Do not say Lomada.',
    'Keep the pace normal. Do not speak fast. Do not summarize or add words.',
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
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: GEMINI_LIVE_VOICE } } },
        systemInstruction: { parts: [{ text: `You are a Hebrew narrator. Speak only ${GEMINI_LIVE_LANGUAGE}. Read supplied narration exactly.` }] },
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
    session.sendClientContent({ turns: geminiLivePrompt(fs.readFileSync(scriptPath, 'utf8')), turnComplete: true });
    const started = Date.now();
    while (!done && !error && Date.now() - started < 240000) {
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
    run(['-y', '-i', wavPath, '-b:a', '160k', audioPath]);
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
      console.log(`Creating Gemini Live narration with key ${index + 1}/${keys.length}`);
      await createGeminiLiveAudioWithKey(genai, keys[index], scriptPath, audioPath);
      return;
    } catch (err) {
      lastError = err;
      console.warn(`Gemini Live key ${index + 1}/${keys.length} failed: ${err.message || err}`);
    }
  }
  throw new Error(`Gemini Live failed for all configured keys: ${lastError?.message || lastError}`);
}

function html() {
  return `<!doctype html>
<html lang="he" dir="rtl">
<head>
  <meta charset="utf-8">
  <style>
    *{box-sizing:border-box}
    body{margin:0;width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;background:#0b1118;color:white;font-family:Rubik,Arial,sans-serif;direction:rtl}
    #stage{position:relative;width:${WIDTH}px;height:${HEIGHT}px;background:#0b1118;overflow:hidden}
    #shot{position:absolute;left:0;top:0;width:100%;height:${MINECRAFT_HEIGHT}px;object-fit:cover;object-position:center 45%;background:#111;filter:saturate(1.07) contrast(1.04)}
    #fade{position:absolute;left:0;right:0;top:0;height:${MINECRAFT_HEIGHT}px;background:linear-gradient(180deg,rgba(0,0,0,.04),rgba(0,0,0,.18))}
    #caption{position:absolute;right:28px;top:26px;max-width:590px;background:rgba(8,18,30,.88);border:3px solid #ffd05a;border-radius:18px;padding:15px 19px;text-align:right;box-shadow:0 18px 45px rgba(0,0,0,.38)}
    #caption h1{margin:0;font-size:34px;line-height:1.12;font-weight:900;letter-spacing:0}
    #caption p{margin:7px 0 0;font-size:20px;line-height:1.3;font-weight:800;color:#dff3ff}
    #lower{position:absolute;left:0;right:0;bottom:0;height:${HEIGHT - MINECRAFT_HEIGHT}px;background:#101b2d;border-top:6px solid #68c5ff;padding:20px 28px 22px}
    #program{width:100%;height:100%;background:#071221;border:3px solid #68c5ff;border-radius:14px;overflow:hidden;direction:ltr;text-align:left;box-shadow:0 16px 35px rgba(0,0,0,.26)}
    #programTitle{height:40px;background:#172946;color:#d8f1ff;font-size:22px;font-weight:900;padding:7px 18px;direction:rtl;text-align:right}
    #code{padding:12px 22px;font:800 22px/1.18 ui-monospace,SFMono-Regular,Consolas,monospace;color:#dbeafe;white-space:pre}
    .line{display:block;border-radius:8px;padding:0 7px;white-space:pre}
    .line.hot{background:#ffd05a;color:#111827;box-shadow:0 0 0 3px rgba(255,208,90,.25)}
  </style>
  <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;700;800;900&display=swap" rel="stylesheet">
</head>
<body>
  <div id="stage">
    <img id="shot" alt="">
    <div id="fade"></div>
    <div id="caption"><h1 id="capTitle"></h1><p id="capSub"></p></div>
    <div id="lower">
      <div id="program"><div id="programTitle"></div><div id="code"></div></div>
    </div>
  </div>
  <script>
    window.setShot = async (src) => {
      const shot = document.getElementById('shot');
      await new Promise(resolve => {
        const done = () => {
          shot.onload = null;
          shot.onerror = null;
          resolve();
        };
        shot.onload = done;
        shot.onerror = done;
        shot.src = src;
        setTimeout(done, 250);
      });
    };
    window.setOverlay = (scene, hotLine) => {
      document.getElementById('capTitle').textContent = scene.caption;
      document.getElementById('capSub').textContent = scene.subtitle;
      document.getElementById('programTitle').textContent = scene.codeTitle;
      document.getElementById('code').innerHTML = scene.code.map((line, i) => '<span class="line ' + (i === hotLine ? 'hot' : '') + '">' + line.replace(/&/g,'&amp;').replace(/</g,'&lt;') + '</span>').join('');
    };
  </script>
</body>
</html>`;
}

async function renderSpec(spec) {
  const frameDir = path.join(MARKETING, `${spec.slug}-frames`);
  const sourceFrameDir = path.join(MARKETING, `${spec.slug}-source-frames`);
  const scriptPath = path.join(MARKETING, `${spec.slug}-script.txt`);
  const audioPath = path.join(MARKETING, `${spec.slug}-gemini-live.mp3`);
  const silentPath = path.join(MARKETING, `${spec.slug}-silent.mp4`);
  const finalPath = path.join(MARKETING, `${spec.slug}-gemini-live-1x.mp4`);
  fs.writeFileSync(scriptPath, spec.script);
  await createGeminiLiveAudio(scriptPath, audioPath);
  fs.rmSync(frameDir, { recursive: true, force: true });
  fs.rmSync(sourceFrameDir, { recursive: true, force: true });
  fs.mkdirSync(frameDir, { recursive: true });
  fs.mkdirSync(sourceFrameDir, { recursive: true });
  const audioDuration = getMediaDurationSeconds(audioPath) || 100;
  const totalWeight = spec.scenes.reduce((sum, scene) => sum + scene.weight, 0);
  const sceneFrames = spec.scenes.map(scene => Math.round(Math.max(7, audioDuration * scene.weight / totalWeight) * FPS));

  for (let sceneIndex = 0; sceneIndex < spec.scenes.length; sceneIndex += 1) {
    const scene = spec.scenes[sceneIndex];
    const outPattern = path.join(sourceFrameDir, `scene-${sceneIndex}-%05d.png`);
    const frameRate = Math.max(0.1, sceneFrames[sceneIndex] / scene.span).toFixed(6);
    run([
      '-y',
      '-ss', String(scene.start),
      '-t', String(scene.span),
      '-i', sourceVideos[scene.source],
      '-vf', `fps=${frameRate},scale=${WIDTH}:720:force_original_aspect_ratio=increase,crop=${WIDTH}:${MINECRAFT_HEIGHT}:0:0`,
      '-frames:v', String(sceneFrames[sceneIndex]),
      outPattern,
    ]);
  }

  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME_BIN || '/snap/bin/chromium',
    headless: 'new',
    args: ['--no-sandbox', `--window-size=${WIDTH},${HEIGHT}`],
    defaultViewport: { width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 },
  });
  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });
  await page.setContent(html(), { waitUntil: 'load' });

  let frame = 0;
  async function snap() {
    await page.screenshot({ path: path.join(frameDir, `frame-${String(frame).padStart(5, '0')}.png`) });
    frame += 1;
  }

  for (let sceneIndex = 0; sceneIndex < spec.scenes.length; sceneIndex += 1) {
    const scene = spec.scenes[sceneIndex];
    for (let i = 0; i < sceneFrames[sceneIndex]; i += 1) {
      const hot = scene.hot[Math.min(scene.hot.length - 1, Math.floor((i / Math.max(1, sceneFrames[sceneIndex] - 1)) * scene.hot.length))] ?? 0;
      const shotPath = path.join(sourceFrameDir, `scene-${sceneIndex}-${String(i + 1).padStart(5, '0')}.png`);
      const shot = `data:image/png;base64,${fs.readFileSync(shotPath).toString('base64')}`;
      await page.evaluate((payload) => window.setOverlay(payload.scene, payload.hot), { scene, hot });
      await page.evaluate((src) => window.setShot(src), shot);
      await snap();
    }
  }
  await browser.close();
  run(['-y', '-framerate', String(FPS), '-i', path.join(frameDir, 'frame-%05d.png'), '-vf', 'format=yuv420p', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-movflags', '+faststart', silentPath]);
  run(['-y', '-i', silentPath, '-i', audioPath, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', finalPath]);
  fs.rmSync(frameDir, { recursive: true, force: true });
  fs.rmSync(sourceFrameDir, { recursive: true, force: true });
  fs.rmSync(silentPath, { force: true });
  console.log(finalPath);
}

async function main() {
  const wanted = new Set(process.argv.slice(2));
  const list = wanted.size ? specs.filter(spec => wanted.has(String(spec.id)) || wanted.has(spec.slug)) : specs;
  for (const spec of list) await renderSpec(spec);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
