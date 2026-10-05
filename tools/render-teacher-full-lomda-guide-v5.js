const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');
const puppeteer = require('puppeteer-core');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

const ROOT = path.resolve(__dirname, '..');
const MARKETING = path.join(ROOT, 'marketing');
const OUT_DIR = path.join(MARKETING, 'teacher-full-lomda-guide-v5-frames');
const AUDIO_DIR = path.join(MARKETING, 'teacher-full-lomda-guide-v5-audio');
const DATA_DIR = path.join('/tmp', `robotics-teacher-full-guide-${Date.now()}`);
const SILENT_MP4 = path.join(MARKETING, 'teacher-full-lomda-guide-v5-silent.mp4');
const AUDIO_M4A = path.join(MARKETING, 'teacher-full-lomda-guide-v5-narration.m4a');
const OUT_MP4 = path.join(MARKETING, 'teacher-full-lomda-guide-v5-synced.mp4');
const PORT = Number(process.env.TEACHER_VIDEO_PORT || 3169);
const BASE = `http://127.0.0.1:${PORT}`;
const FPS = 10;
const CAPTURE_WIDTH = 1600;
const CAPTURE_HEIGHT = 900;
const OUTPUT_WIDTH = 1280;
const OUTPUT_HEIGHT = 720;
const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;
let frame = 0;

const voiceHeader = `TTS in fluent natural Israeli Hebrew.
Character: an adult Israeli female teacher trainer. Calm, clear, professional, reassuring, natural, not salesy.
Style: concise instructional narration for teachers. Match only what is currently visible on screen. Speak at a measured training pace in natural Israeli Hebrew. Do not read punctuation names or bracket labels.
Pronunciation: the Hebrew word "לומדת" or "לוֹמְדַת" must be pronounced "lomdat" / "lohm-DAHT", never "Lomedet". This is a pronunciation instruction only; do not read it aloud.
`;

const scenes = [
  {
    id: '01-login',
    caption: 'כניסת מורה',
    sub: 'מתחילים מהמסך האמיתי',
    text: '[warm] ברוכה הבאה. הפעם נראה את הלומדה עצמה: כניסה לממשק המורה, מעבר לכיתה, דוח התקדמות, שיעור אפס, ואז השיעורים והאתגרים הרגילים.',
    visual: 'login',
  },
  {
    id: '02-classes',
    caption: 'הכיתות שלי',
    sub: 'כיתה, קוד כניסה ותלמידים',
    text: '[clear] אחרי הכניסה מגיעים למסך הכיתות. כאן המורה רואה את הכיתה, קוד הכניסה לתלמידים, מספר תלמידים, והלומדה שפתוחה לכיתה.',
    visual: 'classes',
  },
  {
    id: '03-progress',
    caption: 'דוח התקדמות',
    sub: 'תמונת מצב כיתתית',
    text: '[instructional] מהכיתה פותחים את דוח ההתקדמות. הדוח מראה לפי תלמיד ושיעור מי התחיל, מי השלים, מי הגיש, ומי צריך עזרה.',
    visual: 'progress',
  },
  {
    id: '04-management',
    caption: 'לוח ניהול הלומדה',
    sub: 'בחירת שיעור ואתגר',
    text: '[clear] עכשיו עוברים ללוח ניהול הלומדה. זה המסך שבו בוחרים את השיעור, רואים את רצף האתגרים, ומחליטים מה לפתוח בכיתה.',
    visual: 'management',
  },
  {
    id: '05-lesson-zero',
    caption: 'שיעור 0',
    sub: 'כניסה והתארגנות ב-Minecraft',
    text: '[emphasis] שיעור אפס שונה בתפקיד שלו. זה שיעור פתיחה והתארגנות: התלמידים נכנסים ל-Minecraft, מוודאים שהשחקן שלהם משויך נכון, ומתרגלים איסוף מטבעות.',
    visual: 'lesson0-overview',
  },
  {
    id: '06-connection',
    caption: 'חיבור תלמידים',
    sub: 'מי מחובר עכשיו',
    text: '[instructional] באזור המעקב רואים את התלמידים עצמם: מי מחובר עכשיו, מי נראה לאחרונה, ומה שם שחקן ה-Minecraft שמקושר לכל תלמיד.',
    visual: 'lesson0-live',
  },
  {
    id: '07-coins',
    caption: 'איסוף מטבעות',
    sub: 'בר התקדמות אישי',
    text: '[clear] לכל תלמיד מופיע בר התקדמות של המטבעות: מאפס מתוך שמונה ועד שמונה מתוך שמונה. כך המורה רואה בזמן אמת מי מתקדם במשימה.',
    visual: 'lesson0-coins',
  },
  {
    id: '08-finish-reset',
    caption: 'סיום וניסיון חוזר',
    sub: 'זמן ביצוע ו-Try Again',
    text: '[reassuring] כשהתלמיד מסיים, המורה רואה שהמשימה הושלמה ואת זמן הביצוע. אם התלמיד לוחץ Try Again, הניסיון הנוכחי מתחיל מחדש.',
    visual: 'lesson0-coins',
  },
  {
    id: '09-normal-lessons',
    caption: 'שאר השיעורים',
    sub: 'אתגרים סביב חומר נלמד',
    text: '[transition] בשאר השיעורים העבודה עוברת לאתגרים ושיעורים מובנים סביב חומר נלמד: סיפור, משימה, תרגול, בדיקה והגשה.',
    visual: 'lessons',
  },
  {
    id: '10-lesson-management',
    caption: 'ניהול שיעור רגיל',
    sub: 'חומרי הוראה, תצוגה ומשימות',
    text: '[clear] במסך שיעור רגיל המורה רואה את חומרי ההוראה, שלבי השיעור, ותצוגת התלמיד. מכאן נוח להנחות את הכיתה לפי רצף מסודר.',
    visual: 'normal-lesson-management',
  },
  {
    id: '11-preview',
    caption: 'תצוגת תלמיד',
    sub: 'בודקים מראש מה הילדים יראו',
    text: '[instructional] לפני השיעור אפשר לפתוח תצוגת תלמיד ולבדוק את ההוראות, המשימה והחוויה כפי שהתלמידים יראו אותן.',
    visual: 'preview',
  },
  {
    id: '12-student-lesson',
    caption: 'דף התלמיד',
    sub: 'הסבר, משימה ותרגול',
    text: '[clear] בדף התלמיד מופיעים ההסבר, משימת האתגר, והמשך לתרגול. התלמיד מתקדם, והמורה חוזרת לדוח כדי לראות מי התקדם.',
    visual: 'lesson',
  },
  {
    id: '13-slides',
    caption: 'מצגת למורה',
    sub: 'פותחים ומקרינים בכיתה',
    text: '[instructional] לכל שיעור יש גם מצגת מוכנה. אפשר לפתוח אותה, להסביר את המושגים המרכזיים, ואז לשלוח את התלמידים לעבודה.',
    visual: 'slides',
  },
  {
    id: '14-exit',
    caption: 'הגשה וכרטיס יציאה',
    sub: 'בסוף חוזרים לדוח',
    text: '[summary] בסוף השיעור התלמידים מגישים כרטיס יציאה או תוצר. ההגשות חוזרות לדוח ההתקדמות, ושם המורה רואה מי סיים ומי צריך השלמה.',
    visual: 'exit',
  },
  {
    id: '15-summary',
    caption: 'סיכום',
    sub: 'שיעור 0 להתארגנות, השאר ללמידה מובנית',
    text: '[confident ending] זה המבנה: שיעור אפס מיועד לכניסה והתארגנות ב-Minecraft. אחריו ממשיכים לאתגרים ושיעורים מובנים על חומר נלמד, והמורה מלווה דרך המסכים והדוחות.',
    visual: 'progress-return',
  },
];

function cleanDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

function framePath() {
  return path.join(OUT_DIR, `frame-${String(frame++).padStart(5, '0')}.png`);
}

function run(args, options = {}) {
  const result = spawnSync(ffmpegPath, args, { stdio: 'inherit', ...options });
  if (result.status) process.exit(result.status);
}

function runText(args) {
  const result = spawnSync(ffmpegPath, args, { encoding: 'utf8' });
  if (result.status) process.exit(result.status);
  return result.stderr || result.stdout || '';
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForServer(proc) {
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    if (proc.exitCode !== null) throw new Error('Local server exited before it was ready.');
    try {
      const response = await fetch(`${BASE}/teacher-classrooms.html`);
      if (response.ok) return;
    } catch {}
    await wait(300);
  }
  throw new Error('Timed out waiting for local server.');
}

async function startServer() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const server = spawn(process.execPath, ['server.js'], {
    cwd: ROOT,
    env: {
      ...process.env,
      PORT: String(PORT),
      ROBOTICS_DATA_DIR: DATA_DIR,
      ROBOTICS_DB_FILE: path.join(DATA_DIR, 'teacher-video.sqlite'),
      ROBOTICS_PREVIEW_DEMO_TEACHER: '1',
      KUGEL_PREVIEW_MOCK_MINECRAFT: '1',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  server.stdout.on('data', chunk => process.stdout.write(chunk));
  server.stderr.on('data', chunk => process.stderr.write(chunk));
  await waitForServer(server);
  await fetch(`${BASE}/api/classroom/preview-demo-student-login`, { method: 'POST' }).catch(() => {});
  return server;
}

function escapeText(text) {
  return String(text).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

function audioPath(scene) {
  return path.join(AUDIO_DIR, `${scene.id}.m4a`);
}

function durationOf(file) {
  const output = runText(['-hide_banner', '-i', file, '-f', 'null', '-']);
  const match = output.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
  if (!match) throw new Error(`Could not read duration for ${file}`);
  return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
}

async function generateSceneAudio(scene) {
  const out = audioPath(scene);
  if (fs.existsSync(out)) {
    scene.duration = durationOf(out);
    return;
  }
  if (!apiKey) throw new Error('GOOGLE_AI_API_KEY missing');
  const body = {
    contents: [{ parts: [{ text: `${voiceHeader}\n${scene.text}` }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Leda' } },
      },
    },
  };
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-preview-tts:generateContent', {
    method: 'POST',
    headers: { 'x-goog-api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await response.json().catch(() => null);
  if (!response.ok) throw new Error(`${response.status} ${JSON.stringify(json).slice(0, 1000)}`);
  const data = json?.candidates?.[0]?.content?.parts?.find(part => part.inlineData)?.inlineData?.data;
  if (!data) throw new Error(`No audio data for ${scene.id}`);
  const pcm = out.replace(/\.m4a$/, '.pcm');
  const wav = out.replace(/\.m4a$/, '.wav');
  fs.writeFileSync(pcm, Buffer.from(data, 'base64'));
  run(['-y', '-f', 's16le', '-ar', '24000', '-ac', '1', '-i', pcm, wav]);
  run(['-y', '-i', wav, '-c:a', 'aac', '-b:a', '128k', out]);
  scene.duration = durationOf(out);
}

async function prepareAudio() {
  fs.mkdirSync(AUDIO_DIR, { recursive: true });
  for (const scene of scenes) {
    await generateSceneAudio(scene);
  }
  const concatList = path.join(AUDIO_DIR, 'concat.txt');
  fs.writeFileSync(concatList, scenes.map(scene => `file '${audioPath(scene).replace(/'/g, "'\\''")}'`).join('\n'));
  run(['-y', '-f', 'concat', '-safe', '0', '-i', concatList, '-c', 'copy', AUDIO_M4A]);
}

async function injectCinematicStyle(page) {
  await page.addStyleTag({ content: `
    :root{--gold:#facc15;--ink:#0f172a;--cyan:#06b6d4;--grass:#3f8f2f;--dirt:#7a4b26;--stone:#94a3b8}
    html,body{overflow:hidden!important;background:#f8fafc!important}
    body{font-family:Rubik,Arial,sans-serif!important}
    body:before{content:none!important}
    body:after{content:none!important}
    .platform-home-link,#rfw-launcher,.rfw-button,.rfw-backdrop,#hai-user-badge{display:none!important}
    .teacher-video-shell{position:fixed;inset:0;z-index:2147483000;pointer-events:none;overflow:hidden}
    .teacher-video-caption{display:none!important;position:fixed;left:18px;right:18px;bottom:12px;z-index:2147483640;min-height:36px;background:rgba(15,23,42,.78);color:white;border:1px solid rgba(255,255,255,.18);border-radius:8px;padding:8px 16px;font:900 20px/1.15 Rubik,Arial,sans-serif;direction:rtl;text-align:right;box-shadow:0 12px 28px rgba(15,23,42,.16);backdrop-filter:blur(6px)}
    .teacher-video-caption small{display:inline;margin-inline-start:12px;color:#e0f2fe;font-size:15px;font-weight:800}
    .teacher-video-caption:after{content:none}
    @keyframes beat{0%,100%{opacity:.35;transform:scaleX(.5);transform-origin:right}50%{opacity:1;transform:scaleX(1.55);transform-origin:right}}
    .teacher-video-cover{position:fixed;inset:0;z-index:2147483600;display:grid;place-items:center;direction:rtl;text-align:right;color:white;background:
      linear-gradient(180deg,#6ec6ff 0 42%,#7bc65b 42% 58%,#8b5a2b 58% 100%);padding:62px;overflow:hidden;image-rendering:pixelated}
    .teacher-video-cover:before{content:'';position:absolute;inset:-20%;background-image:
      linear-gradient(rgba(255,255,255,.16) 2px,transparent 2px),
      linear-gradient(90deg,rgba(255,255,255,.16) 2px,transparent 2px),
      repeating-linear-gradient(90deg,rgba(0,0,0,.12) 0 32px,transparent 32px 64px);background-size:64px 64px,64px 64px,128px 128px;transform:rotate(-3deg);animation:gridMove 18s linear infinite}
    @keyframes gridMove{to{transform:rotate(-6deg) translateX(56px)}}
    .teacher-video-cover .inner{position:relative;width:min(960px,100%);background:rgba(20,35,20,.72);border:6px solid #2f1b11;border-radius:10px;padding:34px 38px;box-shadow:0 0 0 6px rgba(250,204,21,.55),0 24px 54px rgba(15,23,42,.35)}
    .teacher-video-cover h1{font:900 62px/1.05 Rubik,Arial,sans-serif;margin:0 0 18px;text-shadow:4px 4px 0 rgba(0,0,0,.32)}
    .teacher-video-cover p{font:800 29px/1.45 Rubik,Arial,sans-serif;margin:0;color:#eaffd6}
    .teacher-video-flow{display:flex;gap:18px;margin-top:34px;flex-wrap:wrap}.teacher-video-flow span{background:linear-gradient(180deg,#5fa946,#3f7d20);border:4px solid #2f1b11;border-radius:6px;padding:11px 16px;font-weight:900;font-size:24px;box-shadow:inset 0 0 0 2px rgba(255,255,255,.16)}
    .teacher-video-spot{outline:3px solid rgba(250,204,21,.92)!important;outline-offset:3px!important;box-shadow:0 0 0 5px rgba(250,204,21,.10)!important;border-radius:8px!important;transition:.35s!important}
    .teacher-video-pointer{display:none!important;position:fixed;z-index:2147483630;width:44px;height:44px;border-radius:999px;background:var(--gold);color:#111827;place-items:center;font:900 20px/1 Rubik,Arial,sans-serif;box-shadow:0 14px 32px rgba(15,23,42,.20);direction:rtl}
    .teacher-video-pointer:after{content:'';position:absolute;left:-22px;top:26px;width:28px;height:6px;border-radius:999px;background:var(--gold);transform:rotate(-24deg)}
    .course-picker,.course-access-form,.class-courses{display:none!important}
    #teacherLiveControls,.teacher-live-controls,.student-row-actions,.teacher-class-message-form,
    [data-live-command],[data-freeze-student],[data-release-student],
    button[id*="freeze" i],button[id*="release" i],button[id*="message" i],
    input[id*="message" i],textarea[id*="message" i]{display:none!important}
    main,.teacher-app,.classroom-shell{max-width:1460px!important;margin-left:auto!important;margin-right:auto!important}
    .teacher-app,.classroom-shell,main{padding-top:10px!important;padding-bottom:28px!important}
    h1{max-width:100%!important;font-size:clamp(30px,4.2vw,46px)!important;line-height:1.1!important;white-space:normal!important;overflow-wrap:break-word!important}
    h2,h3{max-width:100%!important;white-space:normal!important;overflow-wrap:break-word!important}
    body.teacherZoom main,body.teacherZoom .teacher-app,body.teacherZoom .classroom-shell{transform:none!important}
    body.teacherLeft main,body.teacherLeft .teacher-app,body.teacherLeft .classroom-shell{transform:none!important}
    body.teacherRight main,body.teacherRight .teacher-app,body.teacherRight .classroom-shell{transform:none!important}
    body.teacherMuted .teacher-video-caption{opacity:.96}
  ` });
  await page.evaluate(() => {
    if (!document.querySelector('.teacher-video-shell')) {
      const shell = document.createElement('div');
      shell.className = 'teacher-video-shell';
      document.body.appendChild(shell);
    }
    if (!document.querySelector('.teacher-video-caption')) {
      const caption = document.createElement('div');
      caption.className = 'teacher-video-caption';
      document.body.appendChild(caption);
    }
    document.querySelectorAll('#teacherLiveControls,.teacher-live-controls,.student-row-actions,.teacher-class-message-form').forEach(el => {
      el.style.display = 'none';
      el.hidden = true;
    });
    document.querySelectorAll('video').forEach(video => {
      video.pause?.();
      video.removeAttribute('autoplay');
      video.preload = 'metadata';
    });
  });
}

async function caption(page, title, sub = '') {
  await page.evaluate((title, sub) => {
    const el = document.querySelector('.teacher-video-caption');
    if (el) el.innerHTML = `${title}${sub ? `<small>${sub}</small>` : ''}`;
  }, title, sub);
}

async function cover(page, title, sub, flow = []) {
  await page.evaluate((title, sub, flow) => {
    document.querySelectorAll('.teacher-video-cover').forEach(el => el.remove());
    const cover = document.createElement('div');
    cover.className = 'teacher-video-cover';
    cover.innerHTML = `<div class="inner"><h1>${title}</h1><p>${sub}</p>${flow.length ? `<div class="teacher-video-flow">${flow.map(item => `<span>${item}</span>`).join('')}</div>` : ''}</div>`;
    document.body.appendChild(cover);
  }, title, sub, flow);
}

async function removeCover(page) {
  await page.evaluate(() => document.querySelectorAll('.teacher-video-cover').forEach(el => el.remove()));
}

async function clearSpot(page) {
  await page.evaluate(() => {
    document.querySelectorAll('.teacher-video-spot,.teacher-video-pointer').forEach(el => {
      if (el.classList.contains('teacher-video-pointer')) el.remove();
      else el.classList.remove('teacher-video-spot');
    });
  });
}

async function spot(page, selector, pointerText = '') {
  await clearSpot(page);
  await page.evaluate((selector, pointerText) => {
    const el = document.querySelector(selector);
    if (!el) return;
    el.classList.add('teacher-video-spot');
    if (pointerText) {
      const rect = el.getBoundingClientRect();
      const pointer = document.createElement('div');
      pointer.className = 'teacher-video-pointer';
      pointer.textContent = pointerText;
      pointer.style.left = `${Math.max(18, Math.min(window.innerWidth - 78, rect.left + rect.width / 2 - 27))}px`;
      pointer.style.top = `${Math.max(18, rect.top - 70)}px`;
      document.body.appendChild(pointer);
    }
  }, selector, pointerText);
}

async function zoom(page, mode = '') {
  await page.evaluate(mode => {
    document.body.classList.remove('teacherZoom', 'teacherLeft', 'teacherRight');
    if (mode) document.body.classList.add(mode);
  }, mode);
}

async function snap(page) {
  await page.evaluate(() => {
    document.querySelectorAll('.rfw-button,.rfw-backdrop,#hai-user-badge').forEach(el => el.remove());
    document.querySelectorAll('button,a').forEach(el => {
      const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
      if (text.includes('דיווח תקלה') || text === 'דיווח') el.remove();
    });
  }).catch(() => {});
  await page.screenshot({ path: framePath(), type: 'png' });
}

async function hold(page, seconds, opts = {}) {
  const frames = Math.max(1, Math.round(seconds * FPS));
  for (let i = 0; i < frames; i += 1) {
    if (opts.scrollAt && i === Math.round(frames * opts.scrollAt)) {
      await page.evaluate(y => window.scrollBy({ top: y, behavior: 'smooth' }), opts.scrollY || 180).catch(() => {});
    }
    if (opts.pulseAt && i === Math.round(frames * opts.pulseAt)) {
      await page.evaluate(selector => {
        const el = document.querySelector(selector);
        if (!el) return;
        el.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.035)' }, { transform: 'scale(1)' }], { duration: 720, easing: 'ease-out' });
      }, opts.pulseSelector || '.teacher-video-spot').catch(() => {});
    }
    await snap(page);
  }
}

async function goto(page, url) {
  await page.goto(`${BASE}/${url}`, { waitUntil: 'networkidle2' });
  await injectCinematicStyle(page);
}

async function loginTeacher(page) {
  await goto(page, 'teacher-classrooms.html');
  await page.evaluate(async () => {
    const response = await fetch('/api/classroom/preview-demo-teacher-login', { method: 'POST', credentials: 'same-origin' });
    if (!response.ok) throw new Error('preview login failed');
  });
  await page.goto(`${BASE}/teacher-classrooms.html`, { waitUntil: 'networkidle2' });
  await injectCinematicStyle(page);
}

async function progressDashboard(page) {
  const button = await page.$('.progress-dashboard-section button');
  if (button) {
    await button.click();
    await wait(900);
    await injectCinematicStyle(page);
  }
}

async function classId(page) {
  return page.$eval('.class-card', el => el.getAttribute('data-class-id'));
}

async function openTeacherLesson(page, classIdValue, lessonId) {
  await goto(page, `agent-academy-teacher.html?classroomId=${encodeURIComponent(classIdValue)}&lesson=${encodeURIComponent(lessonId)}`);
  await wait(900);
  await injectCinematicStyle(page);
  await page.evaluate(() => {
    document.querySelectorAll('#teacherLiveControls,.teacher-live-controls,.student-row-actions,.teacher-class-message-form').forEach(el => {
      el.style.display = 'none';
      el.hidden = true;
    });
  }).catch(() => {});
}

async function openLessonZeroDetails(page) {
  await page.evaluate(() => {
    document.querySelector('#studentMonitor')?.scrollIntoView({ block: 'center', inline: 'nearest' });
    document.querySelectorAll('details.teacher-student-board-details').forEach(details => {
      details.open = true;
    });
  }).catch(() => {});
  await wait(450);
}

async function renderScene(page, scene, state) {
  const dur = Math.max(2.2, scene.duration + 0.08);
  await caption(page, scene.caption, scene.sub);
  await zoom(page, '');

  if (scene.visual === 'cover') {
    await cover(page, 'ממשק המורה', 'Agent Academy: כיתות, שיעור 0, אתגרים ודוחות', ['כיתה', 'שיעור 0', 'אתגרים', 'דוחות']);
    await hold(page, dur);
    return;
  }
  if (scene.visual === 'cover-flow') {
    await cover(page, 'איך המסלול בנוי?', 'שיעור 0 מתרגל כניסה והתארגנות. אחריו ממשיכים לאתגרים ושיעורים מובנים', ['כניסה', 'Minecraft', 'אתגרים', 'חומר נלמד']);
    await hold(page, dur);
    await removeCover(page);
    return;
  }

  await removeCover(page);

  if (scene.visual === 'login') {
    await goto(page, 'teacher-classrooms.html');
    await caption(page, scene.caption, scene.sub);
    await spot(page, '#teacher-login-form', 'כניסה');
    await zoom(page, 'teacherZoom');
    await hold(page, dur, { pulseAt: 0.55, pulseSelector: '#teacher-login-form' });
    await loginTeacher(page);
    return;
  }

  if (scene.visual === 'classes') {
    await caption(page, scene.caption, scene.sub);
    await spot(page, '.class-card', 'כיתה');
    await zoom(page, 'teacherLeft');
    await hold(page, dur, { scrollAt: 0.62, scrollY: 110 });
    return;
  }

  if (scene.visual === 'progress') {
    await caption(page, scene.caption, scene.sub);
    await spot(page, '.progress-dashboard-section', 'דוח');
    await hold(page, Math.min(1.8, dur * 0.26));
    await progressDashboard(page);
    await page.evaluate(() => {
      document.querySelector('.progress-dashboard-content')?.scrollIntoView({ block: 'center', inline: 'nearest' });
    }).catch(() => {});
    await wait(350);
    await caption(page, scene.caption, scene.sub);
    await spot(page, '.progress-dashboard-content', 'מעקב');
    await zoom(page, 'teacherRight');
    await hold(page, Math.max(2.0, dur - 1.8), { scrollAt: 0.58, scrollY: 160 });
    return;
  }

  if (!state.classId) state.classId = await classId(page);

  if (scene.visual === 'management') {
    await goto(page, `agent-academy-teacher.html?classroomId=${encodeURIComponent(state.classId)}`);
    await caption(page, scene.caption, scene.sub);
    await spot(page, '#teacherHomeOverview', 'לוח');
    await zoom(page, 'teacherLeft');
    await hold(page, dur, { pulseAt: 0.52, pulseSelector: '#teacherHomeOverview' });
    return;
  }

  if (scene.visual === 'lessons') {
    await goto(page, `agent-academy-teacher.html?classroomId=${encodeURIComponent(state.classId)}`);
    await caption(page, scene.caption, scene.sub);
    await spot(page, '#teacherHomeChallenges', 'שיעור');
    await zoom(page, 'teacherRight');
    await hold(page, dur, { scrollAt: 0.45, scrollY: 230 });
    return;
  }

  if (scene.visual === 'lesson0-overview') {
    await openTeacherLesson(page, state.classId, 0);
    await caption(page, scene.caption, scene.sub);
    await spot(page, '#selectedTeacherLesson, #teacherLessonSteps, #teacherMetrics', '0');
    await zoom(page, 'teacherLeft');
    await hold(page, dur, { pulseAt: 0.55, pulseSelector: '#selectedTeacherLesson, #teacherLessonSteps, #teacherMetrics' });
    return;
  }

  if (scene.visual === 'lesson0-live') {
    await openTeacherLesson(page, state.classId, 0);
    await openLessonZeroDetails(page);
    await caption(page, scene.caption, scene.sub);
    await spot(page, '#teacherConnectionSummary, #studentMonitor, .monitor-row', 'חיבור');
    await zoom(page, 'teacherRight');
    await hold(page, dur, { scrollAt: 0.58, scrollY: 150 });
    return;
  }

  if (scene.visual === 'lesson0-coins') {
    await openTeacherLesson(page, state.classId, 0);
    await openLessonZeroDetails(page);
    await caption(page, scene.caption, scene.sub);
    await spot(page, '.coin-progress, #studentMonitor, .monitor-row', 'מטבעות');
    await zoom(page, 'teacherRight');
    await hold(page, dur, { pulseAt: 0.45, pulseSelector: '.coin-progress, #studentMonitor, .monitor-row' });
    return;
  }

  if (scene.visual === 'preview') {
    await caption(page, scene.caption, scene.sub);
    await spot(page, '#teacherHomeStudentPreview', 'צפייה');
    await hold(page, Math.min(1.6, dur * 0.25));
    await goto(page, 'craftom-school/preview/index.html');
    await caption(page, scene.caption, scene.sub);
    await spot(page, 'main', 'תלמיד');
    await zoom(page, 'teacherZoom');
    await hold(page, Math.max(2.0, dur - 1.6));
    return;
  }

  if (scene.visual === 'normal-lesson-management') {
    await openTeacherLesson(page, state.classId, 1);
    await caption(page, scene.caption, scene.sub);
    await spot(page, '#selectedTeacherLesson, #teacherLessonSteps, #teacherChallengeLessons', 'שיעור');
    await zoom(page, 'teacherLeft');
    await hold(page, dur, { scrollAt: 0.5, scrollY: 170 });
    return;
  }

  if (scene.visual === 'lesson') {
    await goto(page, 'craftom-minecraft-lesson-1.html');
    await caption(page, scene.caption, scene.sub);
    await spot(page, 'main', 'Minecraft');
    await zoom(page, 'teacherLeft');
    await hold(page, dur, { scrollAt: 0.55, scrollY: 180 });
    return;
  }

  if (scene.visual === 'slides') {
    await goto(page, 'craftom-minecraft-slides.html?lesson=1');
    await caption(page, scene.caption, scene.sub);
    await spot(page, 'main', 'מצגת');
    await zoom(page, 'teacherZoom');
    await hold(page, dur);
    return;
  }

  if (scene.visual === 'practice') {
    await goto(page, 'craftom-agent-academy.html?lesson=1');
    await caption(page, scene.caption, scene.sub);
    await spot(page, 'main', 'תרגול');
    await zoom(page, 'teacherRight');
    await hold(page, dur);
    return;
  }

  if (scene.visual === 'independent') {
    await goto(page, 'craftom-minecraft-lesson-1.html');
    await caption(page, scene.caption, scene.sub);
    await spot(page, '#agentAcademyCta', 'עצמאי');
    await zoom(page, 'teacherRight');
    await hold(page, dur, { scrollAt: 0.48, scrollY: 240 });
    return;
  }

  if (scene.visual === 'exit') {
    await goto(page, 'craftom-minecraft-lesson-1.html');
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' })).catch(() => {});
    await caption(page, scene.caption, scene.sub);
    await spot(page, '#exitTicketForm', 'הגשה');
    await zoom(page, 'teacherZoom');
    await hold(page, dur);
    return;
  }

  if (scene.visual === 'progress-return') {
    await goto(page, 'teacher-classrooms.html');
    await loginTeacher(page);
    await progressDashboard(page);
    await page.evaluate(() => {
      document.querySelector('.progress-dashboard-content')?.scrollIntoView({ block: 'center', inline: 'nearest' });
    }).catch(() => {});
    await caption(page, scene.caption, scene.sub);
    await spot(page, '.progress-dashboard-content', 'דוח');
    await zoom(page, 'teacherRight');
    await hold(page, dur, { scrollAt: 0.52, scrollY: 180 });
    return;
  }

  if (scene.visual === 'ending') {
    await clearSpot(page);
    await cover(page, 'מסך אחד למורה', 'שיעור 0 למעקב חי • שאר השיעורים ללמידה מסודרת', ['לפני', 'בזמן', 'אחרי']);
    await caption(page, scene.caption, scene.sub);
    await hold(page, dur);
  }
}

(async () => {
  cleanDir(OUT_DIR);
  await prepareAudio();

  const server = await startServer();
  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: '/usr/bin/chromium-browser',
      headless: 'new',
      timeout: 120000,
      userDataDir: path.join('/tmp', `teacher-cinematic-browser-${Date.now()}`),
      args: [
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--disable-extensions',
        '--disable-background-networking',
        '--no-first-run',
        '--noerrdialogs',
        '--font-render-hinting=none',
      ],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: CAPTURE_WIDTH, height: CAPTURE_HEIGHT, deviceScaleFactor: 1 });
    page.setDefaultTimeout(30000);
    await page.setContent('<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"></head><body></body></html>');
    await injectCinematicStyle(page);

    const state = {};
    for (const scene of scenes) {
      await renderScene(page, scene, state);
    }
  } finally {
    if (browser) await browser.close();
    server.kill('SIGTERM');
  }

  run(['-y', '-framerate', String(FPS), '-i', path.join(OUT_DIR, 'frame-%05d.png'), '-vf', `scale=${OUTPUT_WIDTH}:${OUTPUT_HEIGHT}:flags=lanczos,format=yuv420p`, '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-movflags', '+faststart', SILENT_MP4]);
  run(['-y', '-i', SILENT_MP4, '-i', AUDIO_M4A, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', OUT_MP4]);
  spawnSync(ffmpegPath, ['-hide_banner', '-i', OUT_MP4], { stdio: 'inherit' });
  console.log(OUT_MP4);
})();
