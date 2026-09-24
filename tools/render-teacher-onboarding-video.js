const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');
const puppeteer = require('puppeteer-core');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

const ROOT = path.resolve(__dirname, '..');
const MARKETING = path.join(ROOT, 'marketing');
const OUT_DIR = path.join(MARKETING, 'teacher-onboarding-frames');
const AUDIO_MP3 = path.join(MARKETING, 'teacher-onboarding-narration-leda.mp3');
const SILENT_MP4 = path.join(MARKETING, 'teacher-onboarding-silent.mp4');
const OUT_MP4 = path.join(MARKETING, 'teacher-onboarding-guide-v2.mp4');
const DATA_DIR = path.join('/tmp', `robotics-teacher-video-data-${Date.now()}`);
const PORT = Number(process.env.TEACHER_VIDEO_PORT || 3148);
const BASE = `http://127.0.0.1:${PORT}`;
const FPS = 15;
const HOLD_SCALE = Number(process.env.TEACHER_VIDEO_HOLD_SCALE || 1.24);
let frame = 0;

function cleanDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

function framePath() {
  return path.join(OUT_DIR, `frame-${String(frame++).padStart(5, '0')}.png`);
}

function run(args) {
  const result = spawnSync(ffmpegPath, args, { stdio: 'inherit' });
  if (result.status) process.exit(result.status);
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
  const env = {
    ...process.env,
    PORT: String(PORT),
    ROBOTICS_DATA_DIR: DATA_DIR,
    ROBOTICS_DB_FILE: path.join(DATA_DIR, 'teacher-video.sqlite'),
    ROBOTICS_PREVIEW_DEMO_TEACHER: '1',
    KUGEL_PREVIEW_MOCK_MINECRAFT: '1',
  };
  const server = spawn(process.execPath, ['server.js'], {
    cwd: ROOT,
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  server.stdout.on('data', chunk => process.stdout.write(chunk));
  server.stderr.on('data', chunk => process.stderr.write(chunk));
  await waitForServer(server);
  await fetch(`${BASE}/api/classroom/preview-demo-student-login`, { method: 'POST' }).catch(() => {});
  return server;
}

async function setupPage(page) {
  await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
  page.setDefaultTimeout(30000);
}

async function injectOverlay(page) {
  await page.addStyleTag({ content: `
    body{overflow:hidden!important}
    .platform-home-link,#rfw-launcher{display:none!important}
    #teacherVideoCaption{position:fixed;z-index:2147483647;right:26px;bottom:20px;width:min(620px,calc(100vw - 52px));background:rgba(15,23,42,.86);color:white;border-radius:16px;padding:12px 18px 14px;font:900 24px/1.22 Rubik,Arial,sans-serif;direction:rtl;text-align:right;box-shadow:0 16px 36px rgba(15,23,42,.24);backdrop-filter:blur(8px)}
    #teacherVideoCaption small{display:block;margin-top:4px;color:#bae6fd;font-size:15px;font-weight:800}
    #teacherVideoCaption:after{content:'';position:absolute;right:18px;bottom:7px;height:3px;width:72px;border-radius:999px;background:#38bdf8;animation:teacherVideoBeat 1.5s ease-in-out infinite}
    @keyframes teacherVideoBeat{0%,100%{opacity:.35;transform:scaleX(.5);transform-origin:right}50%{opacity:1;transform:scaleX(1.7);transform-origin:right}}
    .teacher-video-spot{outline:6px solid #facc15!important;box-shadow:0 0 0 10px rgba(250,204,21,.24),0 18px 36px rgba(15,23,42,.2)!important;border-radius:16px!important;transition:.2s!important}
    .teacher-video-pointer{position:fixed;z-index:2147483646;width:54px;height:54px;border-radius:999px;background:#facc15;color:#111827;display:grid;place-items:center;font:900 28px/1 Rubik,Arial,sans-serif;box-shadow:0 14px 34px rgba(15,23,42,.25);direction:ltr}
    .teacher-video-pointer:after{content:'';position:absolute;left:-22px;top:26px;width:28px;height:6px;border-radius:999px;background:#facc15;transform:rotate(-24deg)}
    .teacher-video-cover{position:fixed;inset:0;z-index:2147483644;background:linear-gradient(135deg,#0f172a,#155e75 58%,#facc15);color:white;display:grid;place-items:center;direction:rtl;text-align:right;padding:60px}
    .teacher-video-cover .inner{width:min(960px,100%)}.teacher-video-cover h1{font:900 58px/1.08 Rubik,Arial,sans-serif;margin:0 0 18px}.teacher-video-cover p{font:800 27px/1.5 Rubik,Arial,sans-serif;margin:0;color:#e0f2fe}
  ` });
  await page.evaluate(() => {
    if (!document.getElementById('teacherVideoCaption')) {
      const caption = document.createElement('div');
      caption.id = 'teacherVideoCaption';
      caption.innerHTML = 'סביבת המורה <small>מסך אחר מסך, בלי עומס</small>';
      document.body.appendChild(caption);
    }
  });
}

async function caption(page, title, subtitle = '') {
  await page.evaluate((title, subtitle) => {
    const el = document.getElementById('teacherVideoCaption');
    if (el) el.innerHTML = `${title}${subtitle ? `<small>${subtitle}</small>` : ''}`;
  }, title, subtitle);
}

async function clearSpot(page) {
  await page.evaluate(() => {
    document.querySelectorAll('.teacher-video-spot,.teacher-video-pointer').forEach(el => {
      if (el.classList.contains('teacher-video-pointer')) el.remove();
      else el.classList.remove('teacher-video-spot');
    });
  });
}

async function spot(page, selector, pointerText = 'כאן') {
  await clearSpot(page);
  await page.evaluate((selector, pointerText) => {
    const el = document.querySelector(selector);
    if (!el) return;
    el.classList.add('teacher-video-spot');
    const rect = el.getBoundingClientRect();
    const pointer = document.createElement('div');
    pointer.className = 'teacher-video-pointer';
    pointer.textContent = pointerText;
    pointer.style.left = `${Math.max(20, Math.min(window.innerWidth - 80, rect.left + rect.width / 2 - 27))}px`;
    pointer.style.top = `${Math.max(20, rect.top - 70)}px`;
    document.body.appendChild(pointer);
  }, selector, pointerText);
}

async function snap(page) {
  await page.screenshot({ path: framePath(), type: 'png' });
}

async function hold(page, seconds) {
  const total = Math.round(seconds * HOLD_SCALE * FPS);
  for (let i = 0; i < total; i += 1) {
    if (i === Math.floor(total * 0.55)) {
      await page.evaluate(() => {
        window.scrollBy({ top: Math.max(40, window.innerHeight * 0.18), behavior: 'smooth' });
      }).catch(() => {});
    }
    await snap(page);
  }
}

async function goto(page, url, waitUntil = 'networkidle2') {
  await page.goto(`${BASE}/${url}`, { waitUntil });
  await injectOverlay(page);
}

async function loginTeacher(page) {
  await goto(page, 'teacher-classrooms.html');
  await caption(page, 'כניסת מורה', 'נכנסים לחשבון או משתמשים בחשבון בדיקה להדגמה');
  await spot(page, '#teacher-login-form', '1');
  await hold(page, 3.2);
  await page.evaluate(async () => {
    const response = await fetch('/api/classroom/preview-demo-teacher-login', { method: 'POST', credentials: 'same-origin' });
    if (!response.ok) throw new Error('preview login failed');
  });
  await page.goto(`${BASE}/teacher-classrooms.html`, { waitUntil: 'networkidle2' });
  await injectOverlay(page);
}

async function renderTeacherDashboard(page) {
  await caption(page, 'הכיתות שלי', 'קוד כיתה, תלמידים, לומדות, דוח התקדמות וניהול שיעור');
  await spot(page, '.class-card', '2');
  await hold(page, 4.2);

  await caption(page, 'דוח התקדמות לפי שיעור', 'המורה רואה מי התחיל, מי השלים, ומי צריך עזרה');
  await spot(page, '.progress-dashboard-section', 'דוח');
  await hold(page, 1.2);
  await page.click('.progress-dashboard-section button');
  await wait(900);
  await injectOverlay(page);
  await spot(page, '.progress-dashboard-content', 'דוח');
  await hold(page, 5.3);

  await caption(page, 'ניהול הלומדה', 'מכאן עוברים למסך השיעור של אקדמיית ה-Agent');
  await spot(page, '.class-courses a[href^="agent-academy-teacher"]', 'פתחי');
  await hold(page, 2.8);
}

async function renderKugelTeacher(page) {
  const classId = await page.$eval('.class-card', el => el.getAttribute('data-class-id'));
  await goto(page, `agent-academy-teacher.html?classroomId=${encodeURIComponent(classId)}`);
  await caption(page, 'לוח הסדר של המורה', 'בוחרים שיעור, רואים מצב כיתה, ופותחים Minecraft');
  await spot(page, '#teacherHomeOverview', '3');
  await hold(page, 4.6);

  await caption(page, 'בחירת שיעור או אתגר', 'המורה לא בונה שיעור מאפס — הכול כבר מסודר לפי מפגשים');
  await spot(page, '#teacherHomeChallenges', 'שיעור');
  await hold(page, 4.4);

  await caption(page, 'תצוגה מקדימה כתלמיד', 'כדי לראות בדיוק מה הילדים עומדים לראות');
  await spot(page, '#teacherHomeStudentPreview', 'צפייה');
  await hold(page, 3.4);
}

async function renderStudentPreview(page) {
  await goto(page, 'craftom-school/preview/index.html');
  await caption(page, 'מה הילדים רואים?', 'מפת קורס ברורה: אתגרים, שיעורים והתקדמות');
  await spot(page, 'main', 'תלמיד');
  await hold(page, 4.5);

  await goto(page, 'craftom-minecraft-lesson-1.html');
  await caption(page, 'מבנה שיעור קבוע', 'קודם בונים בעולם Minecraft — ורק בסוף תכנות ו-Agent');
  await spot(page, 'main', 'שיעור');
  await hold(page, 4.3);

  await caption(page, 'תרגול משותף בכיתה', 'המורה יכולה להקרין את המסך שלה ולעבור עם הילדים יחד');
  await spot(page, '#agentAcademyCta', 'יחד');
  await hold(page, 4.2);
}

async function renderSlidesAndPractice(page) {
  await goto(page, 'craftom-minecraft-slides.html?lesson=1');
  await caption(page, 'מצגות מוכנות למורה', 'פותחים מצגת, מציגים לכיתה, ואז חוזרים לתרגול');
  await spot(page, 'main', 'מצגת');
  await hold(page, 5.2);

  await goto(page, 'craftom-agent-academy.html?lesson=1');
  await caption(page, 'תרגילי Agent ותכנות', 'ילדים עובדים לבד, והמורה יכולה לבצע איתם ביחד על המסך');
  await spot(page, 'main', 'תרגול');
  await hold(page, 5.0);

  await caption(page, 'כרטיס יציאה בסוף', 'התלמידים מגישים תשובה ותמונה, והמורה רואה בדוח');
  await goto(page, 'craftom-minecraft-lesson-1.html');
  await spot(page, '#exitTicketForm', 'הגשה');
  await hold(page, 4.8);
}

async function cover(page, title, subtitle, seconds) {
  await page.evaluate((title, subtitle) => {
    document.querySelectorAll('.teacher-video-cover').forEach(el => el.remove());
    const cover = document.createElement('div');
    cover.className = 'teacher-video-cover';
    cover.innerHTML = `<div class="inner"><h1>${title}</h1><p>${subtitle}</p></div>`;
    document.body.appendChild(cover);
  }, title, subtitle);
  await hold(page, seconds);
  await page.evaluate(() => document.querySelectorAll('.teacher-video-cover').forEach(el => el.remove()));
}

(async () => {
  if (!fs.existsSync(AUDIO_MP3)) {
    throw new Error(`Missing narration audio: ${AUDIO_MP3}`);
  }
  cleanDir(OUT_DIR);
  fs.mkdirSync(MARKETING, { recursive: true });
  const server = await startServer();
  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: '/usr/bin/chromium-browser',
      headless: 'new',
      timeout: 120000,
      userDataDir: path.join('/tmp', `teacher-onboarding-${Date.now()}`),
      args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--no-first-run', '--noerrdialogs', '--font-render-hinting=none'],
    });
    const page = await browser.newPage();
    await setupPage(page);

    await loginTeacher(page);
    await cover(page, 'לומדת Minecraft לכיתות ז׳-ח׳', 'מסלול גיימינג וחינוך: בונים בעולם Minecraft, ורק בסוף מגיעים לתכנות', 5.2);
    await cover(page, 'סביבת המורה', 'הכול מסודר: כיתה, שיעורים, מצגות, תרגולים ודוח התקדמות', 2.8);
    await renderTeacherDashboard(page);
    await renderKugelTeacher(page);
    await renderStudentPreview(page);
    await renderSlidesAndPractice(page);
    await cover(page, 'למידה עצמית עם מסגרת ברורה', 'Minecraft קודם, תכנות בסוף, וכל ילד מתקדם בקצב אישי', 6.5);
  } finally {
    if (browser) await browser.close();
    server.kill('SIGTERM');
  }

  run(['-y', '-framerate', String(FPS), '-i', path.join(OUT_DIR, 'frame-%05d.png'), '-vf', 'format=yuv420p', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-movflags', '+faststart', SILENT_MP4]);
  run(['-y', '-i', SILENT_MP4, '-i', AUDIO_MP3, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', OUT_MP4]);
  run(['-hide_banner', '-i', OUT_MP4]);
  console.log(OUT_MP4);
})();
