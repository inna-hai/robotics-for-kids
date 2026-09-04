const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
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
const FRAME_DIR = path.join(MARKETING, 'craftom-program-real-minecraft-frames');
const SOURCE_CLIP_DIR = path.join(MARKETING, 'craftom-program-real-minecraft-source-frames');
const SCRIPT_PATH = path.join(MARKETING, 'craftom-program-real-minecraft-script.txt');
const AUDIO_MP3 = path.join(MARKETING, 'craftom-program-real-minecraft-gemini-live.mp3');
const SILENT_MP4 = path.join(MARKETING, 'craftom-program-real-minecraft-silent.mp4');
const FINAL_MP4 = path.join(MARKETING, 'craftom-program-real-minecraft-gemini-live-1x.mp4');

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

function writeScript() {
  const script = `סרטון הסבר ללומדה של קראפטום לכיתות ז: מה בונים, ואיפה התכנות נכנס.

בתוכנית הזאת הילדים לא לומדים תכנות על מסך ריק. הם בונים עיר במיינקראפט, ואז משתמשים בקוד כדי לגרום ל-Agent לעבוד בתוך העיר הזאת.

בכל שיעור יש שני דברים שרואים יחד: למעלה רואים את העולם במיינקראפט. למטה רואים את הקוד שעושה פעולה בעולם.

בהתחלה הילדים בונים אזור קטן: בית, מחסן, שביל ותחנת משלוחים. אחר כך הם כותבים רצף פקודות. ה-Agent זז קדימה, פונה, מגיע לתחנה ומניח חבילה. ככה מבינים שקוד הוא סדר מדויק של הוראות.

אחרי שיש משלוח ראשון, העיר מתרחבת. עכשיו לא מספיק להפעיל את הסוכן פעם אחת. צריך קו משלוחים שעובד שוב ושוב. כאן נכנסות לולאות: הסוכן יוצא מהמחסן, מגיע לתחנה, מוריד חבילה, חוזר להתחלה, מחכה רגע, ומתחיל שוב.

אבל גם לולאה צריכה שליטה. לכן הילדים מוסיפים התחלה ועצירה: פקודת start מפעילה את הקו, ופקודת stop עוצרת אותו. זה מלמד שאוטומציה טובה היא אוטומציה שאפשר לשלוט בה.

בשלב הבא מוסיפים תנאים. אותו קו משלוחים הופך לקו חכם: אם יש בלוק אדום בדרך, הסוכן עוצר. אם יש אור ירוק, הוא ממשיך. אם התחנה מלאה, הוא לא מניח עוד חבילה. הילדים רואים שהקוד מחליט לפי מה שקורה בעולם.

בסוף התוכנית כל ילד בונה מערכת עיר חכמה משלו: קו משלוחים, סיור בטיחות, תחזוקת תאורה, שער חכם או תחנת בדיקה. הוא צריך להשתמש ברעיונות שלמד: רצף, לולאה, תנאי ודיבוג.

מה שחשוב הוא שהכול קורה במיינקראפט אמיתי. התלמידים בונים משהו מוחשי, ואז הקוד מפעיל אותו. הסוכן לא רק מופיע על המסך. הוא מבצע פעולות: זז, פונה, מניח, חוזר, עוצר ומחליט.

ככה התכנות נכנס לתמונה בצורה טבעית. לא בתור שיעור נפרד, אלא בתור הכלי שגורם לעיר שלהם לעבוד.`;
  fs.writeFileSync(SCRIPT_PATH, script);
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
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: GEMINI_LIVE_VOICE } } },
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
    session.sendClientContent({ turns: geminiLivePrompt(fs.readFileSync(SCRIPT_PATH, 'utf8')), turnComplete: true });
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
  const wavPath = AUDIO_MP3.replace(/\.mp3$/i, '.wav');
  try {
    fs.writeFileSync(wavPath, wavFromPcm16(Buffer.concat(chunks), 24000));
    run(['-y', '-i', wavPath, '-b:a', '160k', AUDIO_MP3]);
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

const scenes = [
  {
    label: 'פתיחה',
    source: 'challenge1',
    start: 5,
    span: 22,
    caption: 'מה בונים בתוכנית?',
    subtitle: 'עיר במיינקראפט שהולכת ומתפתחת',
    codeTitle: 'הרעיון',
    code: ['Minecraft world', '+ MakeCode blocks', '+ Agent actions', '= עיר שעובדת'],
    hot: [0, 1, 2, 3],
    weight: 13,
  },
  {
    label: 'אתגר 1',
    source: 'challenge1',
    start: 24,
    span: 38,
    caption: 'אתגר 1: משלוח ראשון',
    subtitle: 'הסוכן מבצע רצף פקודות בתוך מה שהילדים בנו',
    codeTitle: 'MakeCode - רצף',
    code: ['on chat "deliver"', '  agent.move(FORWARD, 4)', '  agent.turn(RIGHT_TURN)', '  agent.move(FORWARD, 3)', '  agent.place(DOWN)'],
    hot: [0, 1, 2, 3, 4],
    weight: 22,
  },
  {
    label: 'אתגר 2',
    source: 'challenge2',
    start: 22,
    span: 42,
    caption: 'אתגר 2: קו משלוחים אוטומטי',
    subtitle: 'לולאה גורמת לסוכן לעבוד שוב ושוב',
    codeTitle: 'MakeCode - לולאה עם שליטה',
    code: ['on chat "start": running = true', 'on chat "stop": running = false', 'forever:', '  if running:', '    deliver()', '    pause(500)'],
    hot: [0, 2, 3, 4, 5, 1],
    weight: 26,
  },
  {
    label: 'אתגר 3',
    source: 'challenge3',
    start: 24,
    span: 44,
    caption: 'אתגר 3: קו חכם עם תנאים',
    subtitle: 'הסוכן מחליט לפי מה שהוא רואה בדרך',
    codeTitle: 'MakeCode - תנאים',
    code: ['if agent.detect(FORWARD):', '  say("הדרך חסומה")', 'else if stationFull:', '  skipDelivery()', 'else:', '  deliver()'],
    hot: [0, 1, 2, 3, 4, 5],
    weight: 26,
  },
  {
    label: 'אתגר 4',
    source: 'challenge4',
    start: 26,
    span: 46,
    caption: 'אתגר 4: העיר החכמה שלי',
    subtitle: 'כל תלמיד מחבר בנייה, קוד, בדיקה ותיקון',
    codeTitle: 'פרויקט סיום',
    code: ['plan city system', 'build in Minecraft', 'use loop + condition', 'test()', 'fix one thing', 'present()'],
    hot: [0, 1, 2, 3, 4, 5],
    weight: 26,
  },
  {
    label: 'סיום',
    source: 'challenge4',
    start: 78,
    span: 28,
    caption: 'התכנות מפעיל את העיר',
    subtitle: 'הסוכן זז, מניח, חוזר, עוצר ומחליט',
    codeTitle: 'מה רואים בסוף?',
    code: ['sequence ✓', 'loop ✓', 'condition ✓', 'debug ✓', 'smart city ✓'],
    hot: [0, 1, 2, 3, 4],
    weight: 15,
  },
];

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
    #fade{position:absolute;left:0;right:0;top:0;height:${MINECRAFT_HEIGHT}px;background:linear-gradient(180deg,rgba(0,0,0,.04),rgba(0,0,0,.18));pointer-events:none}
    #caption{position:absolute;right:28px;top:26px;max-width:560px;background:rgba(8,18,30,.88);border:3px solid #ffd05a;border-radius:18px;padding:15px 19px;text-align:right;box-shadow:0 18px 45px rgba(0,0,0,.38)}
    #caption h1{margin:0;font-size:34px;line-height:1.12;font-weight:900;letter-spacing:0}
    #caption p{margin:7px 0 0;font-size:20px;line-height:1.3;font-weight:800;color:#dff3ff}
    #lower{position:absolute;left:0;right:0;bottom:0;height:${HEIGHT - MINECRAFT_HEIGHT}px;background:#101b2d;border-top:6px solid #68c5ff;padding:20px 28px 22px}
    #program{width:100%;height:100%;background:#071221;border:3px solid #68c5ff;border-radius:14px;overflow:hidden;direction:ltr;text-align:left;box-shadow:0 16px 35px rgba(0,0,0,.26)}
    #programTitle{height:40px;background:#172946;color:#d8f1ff;font-size:22px;font-weight:900;padding:7px 18px;direction:rtl;text-align:right}
    #code{padding:12px 22px;font:800 23px/1.18 ui-monospace,SFMono-Regular,Consolas,monospace;color:#dbeafe;white-space:pre}
    .line{display:block;border-radius:8px;padding:0 7px;white-space:pre}
    .line.hot{background:#ffd05a;color:#111827;box-shadow:0 0 0 3px rgba(255,208,90,.25)}
  </style>
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
    window.setOverlay = (scene, hotLine, stepIndex) => {
      document.getElementById('capTitle').textContent = scene.caption;
      document.getElementById('capSub').textContent = scene.subtitle;
      document.getElementById('programTitle').textContent = scene.codeTitle;
      document.getElementById('code').innerHTML = scene.code.map((line, i) => '<span class="line ' + (i === hotLine ? 'hot' : '') + '">' + line.replace(/&/g,'&amp;').replace(/</g,'&lt;') + '</span>').join('');
    };
  </script>
</body>
</html>`;
}

async function renderVideo() {
  fs.rmSync(FRAME_DIR, { recursive: true, force: true });
  fs.rmSync(SOURCE_CLIP_DIR, { recursive: true, force: true });
  fs.mkdirSync(FRAME_DIR, { recursive: true });
  fs.mkdirSync(SOURCE_CLIP_DIR, { recursive: true });
  const audioDuration = getMediaDurationSeconds(AUDIO_MP3) || 120;
  const totalWeight = scenes.reduce((sum, scene) => sum + scene.weight, 0);
  const durations = scenes.map(scene => Math.max(7, audioDuration * (scene.weight / totalWeight)));
  const sceneFrames = durations.map(duration => Math.round(duration * FPS));

  for (let sceneIndex = 0; sceneIndex < scenes.length; sceneIndex += 1) {
    const scene = scenes[sceneIndex];
    const outPattern = path.join(SOURCE_CLIP_DIR, `scene-${sceneIndex}-%05d.png`);
    const lastFrame = path.join(SOURCE_CLIP_DIR, `scene-${sceneIndex}-${String(sceneFrames[sceneIndex]).padStart(5, '0')}.png`);
    if (fs.existsSync(lastFrame)) continue;
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
    await page.screenshot({ path: path.join(FRAME_DIR, `frame-${String(frame).padStart(5, '0')}.png`) });
    frame += 1;
  }

  for (let sceneIndex = 0; sceneIndex < scenes.length; sceneIndex += 1) {
    const scene = scenes[sceneIndex];
    const duration = durations[sceneIndex];
    const totalFrames = sceneFrames[sceneIndex];
    const stepIndex = Math.min(3, Math.max(0, sceneIndex - 1));
    for (let i = 0; i < totalFrames; i += 1) {
      const progress = totalFrames <= 1 ? 0 : i / (totalFrames - 1);
      const hot = scene.hot[Math.min(scene.hot.length - 1, Math.floor(progress * scene.hot.length))] ?? 0;
      const shotPath = path.join(SOURCE_CLIP_DIR, `scene-${sceneIndex}-${String(i + 1).padStart(5, '0')}.png`);
      const shot = `data:image/png;base64,${fs.readFileSync(shotPath).toString('base64')}`;
      await page.evaluate((payload) => window.setOverlay(payload.scene, payload.hot, payload.stepIndex), { scene, hot, stepIndex });
      await page.evaluate((src) => window.setShot(src), shot);
      await snap();
    }
  }
  await browser.close();
  run(['-y', '-framerate', String(FPS), '-i', path.join(FRAME_DIR, 'frame-%05d.png'), '-vf', 'format=yuv420p', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-movflags', '+faststart', SILENT_MP4]);
}

async function main() {
  writeScript();
  await createGeminiLiveAudio();
  await renderVideo();
  run(['-y', '-i', SILENT_MP4, '-i', AUDIO_MP3, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', FINAL_MP4]);
  fs.rmSync(FRAME_DIR, { recursive: true, force: true });
  fs.rmSync(SOURCE_CLIP_DIR, { recursive: true, force: true });
  fs.rmSync(SILENT_MP4, { force: true });
  console.log(FINAL_MP4);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
