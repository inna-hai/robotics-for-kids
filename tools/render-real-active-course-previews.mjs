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
Character: a mature Israeli female course narrator. Warm, confident, professional, clear, and pleasant. Not childish, not robotic, not overly dramatic.
Style: polished marketing explainer for parents and schools, with natural pauses and calm energy. Do not read bracket labels. Bracket labels are acting directions only.

[warm] הכירו את WebCode — מסלול שבו ילדים בונים עמודי Web אמיתיים דרך חוויה ברורה ומעשית.
[focused] במקום להתחיל ישר מסינטקס מורכב, הם עובדים עם בלוקים שמייצרים HTML, CSS ו־JavaScript.
[clear] בכל שינוי רואים מיד את התוצאה בתצוגה החיה: כותרת, טקסט, צבעים, כפתור ואינטראקציה.
[confident] בהמשך הילדים פותחים הצצה לקוד, ומבינים איך הבלוקים שהם בנו הופכים לשורות קוד אמיתיות.
[encouraging] הם מריצים, בודקים, מקבלים משוב, מתקנים ומתקדמים שלב אחרי שלב.
[closing] כך WebCode מחבר בין יצירתיות, הבנת קוד ותוצר אמיתי שאפשר לראות בדפדפן.`
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
    body.webcode-video-wide-code .topbar{display:none!important}
    body.webcode-video-wide-code .main{height:100vh!important;grid-template-columns:148px minmax(0,1fr) 328px!important;gap:.55rem!important;padding:.55rem!important}
    body.webcode-video-wide-code .lesson-panel{border-radius:20px!important}
    body.webcode-video-wide-code .lesson-panel .lesson-toggle{padding:.56rem .7rem!important;font-size:.82rem!important}
    body.webcode-video-wide-code .lesson-panel .lesson-toggle-icon{min-width:27px!important;height:27px!important}
    body.webcode-video-wide-code .lesson-panel .info{display:none!important}
    body.webcode-video-wide-code .lesson-panel .exercise-list{padding:.58rem!important;gap:.45rem!important}
    body.webcode-video-wide-code .lesson-panel .exercise{padding:.55rem!important;border-radius:14px!important;font-size:.78rem!important;line-height:1.3!important}
    body.webcode-video-wide-code .lesson-panel .exercise p,
    body.webcode-video-wide-code .lesson-panel .hint,
    body.webcode-video-wide-code .lesson-panel .exercise-controls,
    body.webcode-video-wide-code .lesson-panel .exercise-feedback{display:none!important}
    body.webcode-video-wide-code .lesson-panel .exercise-status{font-size:.66rem!important;padding:.22rem .44rem!important}
    body.webcode-video-wide-code .blockly-top{padding:.48rem .7rem!important;font-size:.9rem!important}
    body.webcode-video-wide-code .blockly-top small{display:none!important}
    body.webcode-video-wide-code .preview-head{padding:.55rem .7rem!important}
    body.webcode-video-wide-code #realPreviewCaption{right:22px!important;bottom:18px!important;max-width:600px!important;font-size:25px!important;border-radius:18px!important;padding:12px 17px!important}
    #realPreviewCaption{position:fixed;right:30px;bottom:24px;z-index:999999;max-width:720px;background:rgba(15,23,42,.88);color:#fff;border-radius:22px;padding:15px 20px;font:900 28px/1.25 Rubik,Arial,sans-serif;text-align:right;direction:rtl;box-shadow:0 18px 45px rgba(15,23,42,.28)}
    #realPreviewCaption small{display:block;color:#bae6fd;font-size:18px;margin-top:5px}
    .real-preview-spot{outline:7px solid #facc15!important;box-shadow:0 0 0 12px rgba(250,204,21,.25),0 18px 42px rgba(15,23,42,.28)!important;border-radius:18px!important}
    #demoCursor{position:fixed;left:0;top:0;z-index:1000000;width:30px;height:30px;transform:translate3d(1120px,92px,0);pointer-events:none;filter:drop-shadow(0 8px 12px rgba(15,23,42,.35));transition:none}
    #demoCursor::before{content:"";position:absolute;left:2px;top:0;width:0;height:0;border-top:26px solid #fff;border-right:16px solid transparent;transform:rotate(-18deg)}
    #demoCursor::after{content:"";position:absolute;left:9px;top:17px;width:17px;height:17px;border-radius:50%;background:#f97316;border:3px solid #fff;box-shadow:0 0 0 0 rgba(249,115,22,.42)}
    #demoCursor.tap::after{animation:cursorTap .42s ease-out}
    @keyframes cursorTap{to{box-shadow:0 0 0 22px rgba(249,115,22,0);transform:scale(.72)}}
    .blocklySelected>.blocklyPath,.blocklySelected>.blocklyPathLight{filter:drop-shadow(0 0 12px rgba(250,204,21,.95))}
  `});
  await page.evaluate(() => {
    if (location.pathname.includes('webcode-play')) document.body.classList.add('webcode-video-wide-code');
    const c = document.createElement('div');
    c.id = 'realPreviewCaption';
    c.innerHTML = 'הצצה מתוך השיעור <small>צילום אמיתי של הלומדה</small>';
    document.body.appendChild(c);
    const cursor = document.createElement('div');
    cursor.id = 'demoCursor';
    document.body.appendChild(cursor);
    window.__demoCursorPos = { x: 1120, y: 92 };
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

async function pointForSelector(page, selector, fallback = { x: 640, y: 360 }) {
  return page.evaluate((selector, fallback) => {
    const el = document.querySelector(selector);
    if (!el) return fallback;
    const rect = el.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }, selector, fallback);
}

async function moveCursor(page, frameDir, frame, target, seconds = 0.65) {
  const to = typeof target === 'string' ? await pointForSelector(page, target) : target;
  const from = await page.evaluate(() => window.__demoCursorPos || { x: 1120, y: 92 });
  const steps = Math.max(1, Math.round(seconds * FPS));
  for (let i = 1; i <= steps; i += 1) {
    const t = i / steps;
    const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    const x = from.x + (to.x - from.x) * eased;
    const y = from.y + (to.y - from.y) * eased;
    await page.evaluate(({ x, y }) => {
      window.__demoCursorPos = { x, y };
      const cursor = document.getElementById('demoCursor');
      if (cursor) cursor.style.transform = `translate3d(${x}px,${y}px,0)`;
    }, { x, y });
    await snap(page, frameDir, frame);
  }
}

async function tapCursor(page, frameDir, frame) {
  await page.evaluate(() => {
    const cursor = document.getElementById('demoCursor');
    cursor?.classList.remove('tap');
    void cursor?.offsetWidth;
    cursor?.classList.add('tap');
  });
  await hold(page, frameDir, frame, 0.45);
}

async function resetWebcodeDemo(page) {
  await page.evaluate(() => {
    blocklyReady = false;
    blocklyWorkspace.clear();
    Blockly.Xml.domToWorkspace(parseBlocklyXml('<xml xmlns="https://developers.google.com/blockly/xml"><block type="page_start" x="130" y="70"></block></xml>'), blocklyWorkspace);
    blocklyReady = true;
    codePeekOpened = false;
    document.getElementById('codePeek').open = false;
    done.clear();
    activeExercise = 1;
    highestUnlockedExercise = 1;
    renderProgress();
    generateCodeFromBlockly();
    saveLessonState();
  });
}

async function enlargeWebcodeBlocks(page) {
  await page.evaluate(() => {
    if (!window.Blockly || !blocklyWorkspace) return;
    try {
      blocklyWorkspace.setScale(1.06);
      Blockly.svgResize(blocklyWorkspace);
      const topBlock = blocklyWorkspace.getTopBlocks(false).find((block) => block.type === 'page_start');
      const blockRoot = topBlock?.getSvgRoot?.();
      const area = document.getElementById('blocklyDiv');
      if (topBlock && blockRoot && area) {
        const blockRect = blockRoot.getBoundingClientRect();
        const areaRect = area.getBoundingClientRect();
        const scale = blocklyWorkspace.scale || 1;
        const desiredRight = areaRect.right - 18;
        const desiredTop = areaRect.top + 58;
        topBlock.moveBy((desiredRight - blockRect.right) / scale, (desiredTop - blockRect.top) / scale);
      }
      setTimeout(() => {
        try {
          blocklyWorkspace.setScale(1.06);
          Blockly.svgResize(blocklyWorkspace);
          const topBlock = blocklyWorkspace.getTopBlocks(false).find((block) => block.type === 'page_start');
          const blockRoot = topBlock?.getSvgRoot?.();
          const area = document.getElementById('blocklyDiv');
          if (topBlock && blockRoot && area) {
            const blockRect = blockRoot.getBoundingClientRect();
            const areaRect = area.getBoundingClientRect();
            const scale = blocklyWorkspace.scale || 1;
            topBlock.moveBy((areaRect.right - 18 - blockRect.right) / scale, (areaRect.top + 58 - blockRect.top) / scale);
          }
        } catch {}
      }, 80);
    } catch {}
  });
}

async function addWebcodeBlock(page, type, fields = {}) {
  return page.evaluate(({ type, fields }) => {
    const block = blocklyWorkspace.newBlock(type);
    Object.entries(fields).forEach(([name, value]) => block.setFieldValue(String(value), name));
    block.initSvg();
    block.render();
    const chain = [];
    let current = blocklyWorkspace.getTopBlocks(false).find(item => item.type === 'page_start');
    while (current) {
      chain.push(current);
      current = current.getNextBlock?.();
    }
    const previous = chain[chain.length - 1];
    previous?.nextConnection?.connect(block.previousConnection);
    generateCodeFromBlockly();
    block.select();
    saveLessonState();
    try {
      blocklyWorkspace.getFlyout?.()?.hide?.();
      blocklyWorkspace.getToolbox?.()?.clearSelection?.();
    } catch {}
    return block.id;
  }, { type, fields });
}

async function updateWebcodeBlock(page, type, field, value) {
  return page.evaluate(({ type, field, value }) => {
    const block = collectPageBlocks().find(item => item.type === type);
    if (!block) return false;
    block.setFieldValue(String(value), field);
    generateCodeFromBlockly();
    block.select();
    saveLessonState();
    try {
      blocklyWorkspace.getFlyout?.()?.hide?.();
      blocklyWorkspace.getToolbox?.()?.clearSelection?.();
    } catch {}
    return true;
  }, { type, field, value });
}

async function previewButtonPoint(page) {
  return page.evaluate(() => {
    const iframe = document.getElementById('preview');
    const button = iframe?.contentDocument?.querySelector('button');
    if (!iframe || !button) return { x: 1080, y: 365 };
    const iframeRect = iframe.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    return {
      x: iframeRect.left + buttonRect.left + buttonRect.width / 2,
      y: iframeRect.top + buttonRect.top + buttonRect.height / 2
    };
  });
}

async function clickPreviewButton(page) {
  await page.evaluate(() => {
    const button = document.getElementById('preview')?.contentDocument?.querySelector('button');
    button?.click();
  });
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
    await resetWebcodeDemo(page);
    await enlargeWebcodeBlocks(page);
    await caption(page, 'בונים עמוד Web אמיתי', 'גוררים בלוקים והתצוגה משתנה תוך כדי');
    await spot(page, '#blocklyDiv, #realBlockly');
    await hold(page, frameDir, frame, 2.2);
    const additions = [
      ['web_title', { TEXT: 'אתר המשחקים שלי' }, 'מוסיפים כותרת', 'הבלוק יוצר כותרת HTML בעמוד'],
      ['web_paragraph', { TEXT: 'אני בונה עמוד Web חי עם בלוקים.' }, 'מוסיפים טקסט', 'הפסקה מופיעה מיד בתצוגה'],
      ['web_emoji', { EMOJI: '🎮' }, 'מוסיפים סמל', 'העמוד כבר מתחיל להרגיש אישי'],
      ['web_theme', { THEME: 'space' }, 'מחליפים עיצוב', 'CSS משנה צבעים וסגנון'],
      ['web_button', { LABEL: 'נסו אותי', MESSAGE: 'הכפתור עובד! זה JavaScript 🎉' }, 'מוסיפים כפתור', 'עכשיו יש גם אינטראקציה']
    ];
    for (const [type, fields, title, sub] of additions) {
      await caption(page, title, sub);
      await moveCursor(page, frameDir, frame, '.blocklyToolboxDiv', 0.45);
      await tapCursor(page, frameDir, frame);
      await moveCursor(page, frameDir, frame, '#blocklyDiv', 0.7);
      await addWebcodeBlock(page, type, fields);
      await enlargeWebcodeBlocks(page);
      await tapCursor(page, frameDir, frame);
      await hold(page, frameDir, frame, 0.9);
    }
    await caption(page, 'משנים טקסט ורואים תוצאה', 'שינוי קטן בבלוק מעדכן את האתר החי');
    await moveCursor(page, frameDir, frame, '#blocklyDiv', 0.5);
    await updateWebcodeBlock(page, 'web_title', 'TEXT', 'עמוד Web שבניתי בעצמי');
    await enlargeWebcodeBlocks(page);
    await tapCursor(page, frameDir, frame);
    await hold(page, frameDir, frame, 1.6);
    await caption(page, 'הכפתור באמת עובד', 'לוחצים בתצוגה וה־JavaScript מגיב');
    await spot(page, '#previewPanel, iframe');
    await moveCursor(page, frameDir, frame, await previewButtonPoint(page), 0.8);
    await clickPreviewButton(page);
    await tapCursor(page, frameDir, frame);
    await hold(page, frameDir, frame, 2.1);
    await caption(page, 'פותחים את הקוד שנוצר', 'רואים ממש HTML, CSS ו־JavaScript');
    await page.evaluate(() => {
      try {
        window.showGeneratedCode?.();
        document.querySelector('#codePeek')?.scrollIntoView({ block: 'nearest' });
      } catch {}
    });
    await spot(page, '#codePeek, .code-box');
    await hold(page, frameDir, frame, 2.4);
    await caption(page, 'HTML בונה את מבנה העמוד', 'הכותרת, הפסקה והכפתור מגיעים מהבלוקים');
    await page.evaluate(() => document.querySelector('.editor-tabs button:nth-child(1)')?.click());
    await moveCursor(page, frameDir, frame, '.editor-tabs button:nth-child(1)', 0.35);
    await tapCursor(page, frameDir, frame);
    await hold(page, frameDir, frame, 2.2);
    await caption(page, 'CSS מעצב את מה שרואים', 'צבעים, ריווחים וצורת הכרטיס');
    await page.evaluate(() => document.querySelector('.editor-tabs button:nth-child(2)')?.click());
    await moveCursor(page, frameDir, frame, '.editor-tabs button:nth-child(2)', 0.45);
    await tapCursor(page, frameDir, frame);
    await hold(page, frameDir, frame, 2.2);
    await caption(page, 'JavaScript מוסיף פעולה', 'הכפתור יודע להגיב ללחיצה');
    await page.evaluate(() => document.querySelector('.editor-tabs button:nth-child(3)')?.click());
    await moveCursor(page, frameDir, frame, '.editor-tabs button:nth-child(3)', 0.45);
    await tapCursor(page, frameDir, frame);
    await hold(page, frameDir, frame, 2.3);
    await caption(page, 'בודקים את התרגיל', 'מקבלים משוב וממשיכים לשלב הבא');
    await spot(page, '#exercises, #feedback');
    await moveCursor(page, frameDir, frame, '.btn.check', 0.75);
    await page.evaluate(() => { try { window.checkExercise?.(); } catch {} });
    await tapCursor(page, frameDir, frame);
    await hold(page, frameDir, frame, 6);
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
  if (course.slug === 'webcode') {
    await page.evaluateOnNewDocument(() => {
      const demoBlocklyXml = `<xml xmlns="https://developers.google.com/blockly/xml">
        <block type="page_start" x="130" y="70">
          <next><block type="web_theme"><field name="THEME">space</field>
            <next><block type="web_title"><field name="TEXT">אתר המשחקים שלי</field>
              <next><block type="web_paragraph"><field name="TEXT">אני בונה עמוד Web חי עם בלוקים, צבעים וכפתור שעובד.</field>
                <next><block type="web_emoji"><field name="EMOJI">🎮</field>
                  <next><block type="web_button"><field name="LABEL">נסו אותי</field><field name="MESSAGE">הכפתור עובד! זה JavaScript 🎉</field>
                    <next><block type="web_footer"><field name="TEXT">נבנה על ידי תלמיד/ה</field></block></next>
                  </block></next>
                </block></next>
              </block></next>
            </block></next>
          </block></next>
        </block>
      </xml>`;
      localStorage.setItem('webcodeLessonState:v9:1', JSON.stringify({
        blocklyXml: demoBlocklyXml,
        activeExercise: 1,
        highestUnlockedExercise: 1,
        done: [],
        codePeekOpened: false,
        checkMemory: {}
      }));
    });
  }
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
