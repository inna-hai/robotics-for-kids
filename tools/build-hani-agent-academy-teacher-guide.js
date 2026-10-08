const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');
const puppeteer = require('puppeteer-core');

const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.env.GUIDE_PORT || 3172);
const BASE = `http://127.0.0.1:${PORT}`;
const DATA_DIR = path.join('/tmp', `robotics-hani-guide-${Date.now()}`);
const SCREENSHOT_DIR = path.join(ROOT, 'docs', 'screenshots', 'hani-agent-academy-current');
const HTML_PATH = path.join(ROOT, 'docs', 'hani-agent-academy-current-teacher-guide.html');
const PDF_PATH = path.join(ROOT, 'docs', 'hani-agent-academy-current-teacher-guide.pdf');
const STATIC_PDF_PORT = Number(process.env.GUIDE_STATIC_PORT || 3173);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function cleanDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

async function waitForServer(proc) {
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    if (proc.exitCode !== null) throw new Error('Local server exited before it was ready.');
    try {
      const response = await fetch(`${BASE}/teacher-classrooms.html`);
      if (response.ok) return;
    } catch {}
    await sleep(250);
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
      ROBOTICS_DB_FILE: path.join(DATA_DIR, 'guide.sqlite'),
      ROBOTICS_PREVIEW_DEMO_TEACHER: '1',
      KUGEL_PREVIEW_MOCK_MINECRAFT: '1',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  server.stdout.on('data', chunk => process.stdout.write(chunk));
  server.stderr.on('data', chunk => process.stderr.write(chunk));
  await waitForServer(server);
  return server;
}

async function snap(page, name, options = {}) {
  if (options.scrollTop !== undefined) {
    await page.evaluate(y => window.scrollTo(0, y), options.scrollTop);
    await sleep(250);
  }
  if (options.selector) {
    await page.waitForSelector(options.selector, { timeout: 12000 });
  }
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, name),
    fullPage: Boolean(options.fullPage),
  });
}

async function goto(page, url) {
  await page.goto(`${BASE}/${url}`, { waitUntil: 'networkidle2' });
  await sleep(450);
}

async function teacherLogin(page) {
  await page.evaluate(async () => {
    await fetch('/api/classroom/preview-demo-student-login', { method: 'POST', credentials: 'same-origin' });
    await fetch('/api/classroom/preview-demo-teacher-login', { method: 'POST', credentials: 'same-origin' });
  });
}

async function classId(page) {
  await page.waitForSelector('.class-card', { timeout: 12000 });
  return page.$eval('.class-card', el => el.getAttribute('data-class-id'));
}

async function clickByText(page, text) {
  await page.evaluate((wanted) => {
    const items = [...document.querySelectorAll('button, a')];
    const el = items.find(item => item.textContent.trim().includes(wanted));
    if (!el) throw new Error(`Missing button/link: ${wanted}`);
    el.click();
  }, text);
  await sleep(650);
}

async function decorateStudentDetail(page) {
  await page.evaluate(() => {
    const card = document.querySelector('.progress-detail-card');
    if (!card) return;
    const sample = document.createElement('div');
    sample.className = 'guide-sample-submission';
    sample.innerHTML = `
      <article class="stage-report-card stage-photos-card">
        <h4>הצילום מהמשחק</h4>
        <p>הצילום האחרון שהילד שלח ממיינקראפט אחרי לחיצה על כפתור סיום השיעור.</p>
        <div class="stage-photo-gallery">
          <a class="stage-photo-link" href="assets/craftom/challenges/craftom-lesson1-explainer-gemini-live-1.12x-first-frame.webp" target="_blank" rel="noopener">
            <img src="assets/craftom/challenges/craftom-lesson1-explainer-gemini-live-1.12x-first-frame.webp" alt="דוגמת צילום מהמשחק">
          </a>
        </div>
      </article>
      <article class="stage-report-card">
        <h4>קישור קוד שהתקבל בצ׳אט</h4>
        <p><a href="#">https://makecode.com/_demo-link</a></p>
      </article>
      <article class="stage-report-card">
        <h4>דוח שלב</h4>
        <p>המערכת מציגה אם הילד לחץ סיום שיעור, אם הגיע צילום, ואם התקבל קישור לקוד.</p>
      </article>
    `;
    card.append(sample);
  });
  await sleep(250);
}

async function ensureLessonBoardHasSampleStudents(page) {
  await page.evaluate(() => {
    const cards = [...document.querySelectorAll('.teacher-student-card')];
    if (!cards.length || cards.length >= 4) return;

    const names = ['נועה כהן', 'איתי לוי', 'מאיה אברהם', 'אריאל אלרז'];
    const statuses = [
      'קישור קוד התקבל',
      'צילום מהמשחק התקבל',
      'דוח שלב התקבל',
      'עובד/ת על MakeCode',
    ];
    const container = cards[0].parentElement;
    if (!container) return;

    for (let i = cards.length; i < 4; i += 1) {
      const clone = cards[0].cloneNode(true);
      clone.dataset.studentId = `guide-sample-${i}`;
      const nameEl = clone.querySelector('.teacher-student-card-name, h3, h4, strong');
      if (nameEl) nameEl.textContent = names[i] || `תלמיד/ה ${i + 1}`;
      const statusEl = clone.querySelector('.teacher-student-card-detail, .lesson-student-status, .student-status, p');
      if (statusEl) statusEl.textContent = statuses[i] || 'סטטוס לדוגמה';
      clone.querySelectorAll('[id]').forEach((el) => {
        el.id = `${el.id}-guide-sample-${i}`;
      });
      container.append(clone);
    }

    document.querySelectorAll('*').forEach((el) => {
      if (el.childElementCount) return;
      el.textContent = el.textContent
        .replace(/1 תלמידים בכיתה/g, '4 תלמידים בכיתה')
        .replace(/1 תלמיד בכיתה/g, '4 תלמידים בכיתה');
    });
  });
  await sleep(250);
}

async function showPythonMode(page) {
  await page.evaluate(() => {
    const pythonButton = document.querySelector('[data-academy-mode="python"]');
    if (pythonButton) pythonButton.click();
  });
  await page.waitForSelector('#academyPython:not([hidden])', { timeout: 12000 }).catch(() => {});
  await sleep(400);
}

async function captureScreenshots() {
  cleanDir(SCREENSHOT_DIR);
  const server = await startServer();
  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: '/snap/bin/chromium',
      headless: 'new',
      timeout: 120000,
      userDataDir: path.join('/tmp', `hani-guide-browser-${Date.now()}`),
      args: ['--no-sandbox', '--disable-dev-shm-usage', '--mute-audio', '--no-first-run'],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1365, height: 900, deviceScaleFactor: 1 });
    page.setDefaultTimeout(20000);

    await goto(page, 'teacher-classrooms.html');
    await snap(page, '01-login.png', { selector: '#teacher-login-form' });

    await teacherLogin(page);
    await goto(page, 'teacher-classrooms.html');
    const id = await classId(page);
    await page.evaluate(async classroomId => {
      await fetch(`/api/kugel/classes/${encodeURIComponent(classroomId)}/lessons/1/open`, { method: 'POST', credentials: 'same-origin' });
    }, id);
    await goto(page, 'teacher-classrooms.html');
    await snap(page, '02-classrooms-lesson-management.png', { selector: '.class-card' });

    await clickByText(page, 'תלמידים וקודים');
    await snap(page, '03-students-codes.png', { selector: '.class-card' });

    await clickByText(page, 'ניהול שיעור');
    await snap(page, '04-lesson-sequence.png', { selector: '.class-card' });

    await goto(page, `agent-academy-teacher.html?classroomId=${encodeURIComponent(id)}`);
    await snap(page, '05-teacher-home.png', { selector: '#teacherHomeOverview' });

    await goto(page, `agent-academy-teacher.html?classroomId=${encodeURIComponent(id)}&lesson=1`);
    await ensureLessonBoardHasSampleStudents(page);
    await snap(page, '06-lesson-board.png', { selector: '#studentMonitor' });

    await page.waitForSelector('.teacher-student-card-summary', { timeout: 12000 });
    await page.click('.teacher-student-card-summary');
    await page.waitForSelector('#teacherStudentDetailDialog[open], #teacherStudentDetailDialog', { timeout: 12000 });
    await decorateStudentDetail(page);
    await snap(page, '07-student-detail-submission.png', { selector: '#teacherStudentDetailDialog' });

    await goto(page, `craftom-minecraft-lesson-1.html?teacherReturn=1&lesson=1&classroomId=${encodeURIComponent(id)}`);
    await snap(page, '08-student-lesson-view.png', { selector: 'main' });

    await goto(page, `craftom-agent-academy.html?lesson=1&teacherReturn=1&classroomId=${encodeURIComponent(id)}`);
    await showPythonMode(page);
    await snap(page, '09-agent-academy-practice.png', { selector: 'main' });

    await goto(page, `craftom-minecraft-slides.html?challenge=1&teacherReturn=1&lesson=1&classroomId=${encodeURIComponent(id)}`);
    await snap(page, '10-teacher-slides.png', { selector: 'main' });
  } finally {
    if (browser) await browser.close();
    server.kill('SIGTERM');
  }
}

function html() {
  const date = '08.10.2026';
  return `<!doctype html>
<html lang="he" dir="rtl">
<head>
  <meta charset="utf-8">
  <title>מדריך מורה - אקדמיית ה-Agent</title>
  <style>
    @page { size: A4; margin: 13mm; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Arial, Helvetica, sans-serif; color: #182235; background: #fff; line-height: 1.55; font-size: 14.5px; }
    .cover { min-height: 252mm; display: flex; flex-direction: column; justify-content: center; gap: 18px; padding: 36px; border: 1px solid #dbe5f1; border-radius: 18px; background: linear-gradient(135deg, #f7fbff, #eef7f2); page-break-after: always; }
    .eyebrow { margin: 0; color: #2563eb; font-weight: 700; }
    h1 { margin: 0; font-size: 42px; line-height: 1.12; color: #0f1f33; }
    .subtitle { max-width: 760px; margin: 0; color: #475569; font-size: 19px; }
    .meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 22px; }
    .meta span { padding: 12px 14px; border-radius: 12px; border: 1px solid #dbe7f5; background: rgba(255,255,255,.82); font-weight: 700; color: #334155; }
    section { margin: 0 0 22px; padding-top: 18px; border-top: 1px solid #e5edf7; page-break-inside: avoid; }
    h2 { margin: 0 0 8px; font-size: 23px; color: #0f172a; break-after: avoid; }
    h3 { margin: 16px 0 6px; font-size: 18px; color: #1e3a8a; break-after: avoid; }
    p { margin: 0 0 8px; }
    ul, ol { margin: 8px 0 12px; padding-right: 24px; }
    li { margin: 4px 0; }
    .note { margin: 10px 0 14px; padding: 12px 14px; border-radius: 12px; border: 1px solid #dbeafe; background: #eff6ff; color: #334155; }
    .quiet { border-color: #e2e8f0; background: #f8fafc; }
    .warning { border-color: #fed7aa; background: #fff7ed; }
    .flow, .time-grid { display: grid; gap: 9px; margin: 12px 0; }
    .flow { grid-template-columns: repeat(4, 1fr); }
    .time-grid { grid-template-columns: 80px 1fr 1fr; }
    .flow div, .time-grid div { padding: 10px; border: 1px solid #dbe7f5; border-radius: 12px; background: #fbfdff; font-weight: 700; color: #1e293b; }
    .time-grid div:nth-child(3n+1) { color: #2563eb; background: #eff6ff; text-align: center; }
    figure { margin: 12px 0 18px; break-inside: avoid; }
    img { display: block; width: 100%; max-height: 148mm; object-fit: contain; border: 1px solid #d6e0ee; border-radius: 12px; background: #f8fafc; }
    .wide img { max-height: 118mm; }
    figcaption { margin-top: 7px; color: #475569; font-size: 13px; }
    code { direction: ltr; unicode-bidi: embed; background: #eef2ff; padding: 1px 5px; border-radius: 5px; color: #1e3a8a; }
    .page-break { page-break-before: always; }
    .checklist { columns: 2; column-gap: 22px; }
    .checklist li { break-inside: avoid; }
  </style>
</head>
<body>
<main>
  <div class="cover">
    <p class="eyebrow">דרך ההייטק · robotics.hai.tech</p>
    <h1>מדריך מורה<br>אקדמיית ה-Agent במיינקראפט</h1>
    <p class="subtitle">איך לעבוד עם הלומדה מהרגע שנכנסים כמורה: פתיחת שיעור, שימוש במצגת, בדיקת תצוגת תלמיד, מעקב אחרי הגשות וצילומים, וסדר שיעור מומלץ.</p>
    <div class="meta">
      <span>קהל יעד: מורת כיתה</span>
      <span>שיעור לדוגמה: שיעור 1</span>
      <span>עודכן: ${date}</span>
    </div>
  </div>

  <section>
    <h2>התמונה הגדולה</h2>
    <p>המורה עובדת משני מסכים עיקריים: <strong>מסך הכיתות</strong>, שבו בוחרים כיתה ופותחים שיעורים, ו<strong>מסך ניהול שיעור</strong>, שבו מנהלים את השיעור החי ורואים את מצב התלמידים.</p>
    <div class="flow">
      <div>1. כניסה כמורה</div>
      <div>2. בחירת כיתה</div>
      <div>3. פתיחת שיעור</div>
      <div>4. מצגת והסבר</div>
    </div>
    <div class="flow">
      <div>5. תלמידים עובדים</div>
      <div>6. מעקב בכרטיסי תלמידים</div>
      <div>7. פירוט הגשות וצילומים</div>
      <div>8. סיכום ובונוס</div>
    </div>
  </section>

  <section>
    <h2>1. כניסה למערכת</h2>
    <ol>
      <li>פותחים את <code>https://robotics.hai.tech/teacher-classrooms.html</code>.</li>
      <li>נכנסים עם המייל והסיסמה של המורה.</li>
      <li>אחרי login מגיעים למסך הכיתות.</li>
    </ol>
    <figure>
      <img src="screenshots/hani-agent-academy-current/01-login.png" alt="מסך login למורה">
      <figcaption>מסך כניסת מורה. אם המורה כבר מחוברת, היא תעבור ישר למסך הכיתות.</figcaption>
    </figure>
  </section>

  <section class="page-break">
    <h2>2. מסך הכיתות: איפה מתחילים שיעור</h2>
    <p>בלשונית הראשונה של כרטיס הכיתה מופיע <strong>ניהול שיעור</strong>. זה המקום שבו פותחים שיעור, נכנסים לעמוד כל השיעורים או לעמוד שיעור מסוים.</p>
    <ol>
      <li>בוחרים את הלומדה <strong>אקדמיית ה-Agent</strong>.</li>
      <li>בוחרים את הכיתה של חני.</li>
      <li>בכרטיס הכיתה, בלשונית <strong>ניהול שיעור</strong>, רואים את רצף השיעורים.</li>
      <li>השיעור הפעיל מסומן בצורה בולטת; שיעורים שכבר עברו מסומנים כעברנו הלאה.</li>
    </ol>
    <figure class="wide">
      <img src="screenshots/hani-agent-academy-current/02-classrooms-lesson-management.png" alt="מסך כיתות בלשונית ניהול שיעור">
      <figcaption>כרטיס הכיתה עם ניהול שיעור. מכאן פותחים שיעור ונכנסים לעמוד השיעור באותו טאב.</figcaption>
    </figure>
  </section>

  <section>
    <h2>3. תלמידים וקודים</h2>
    <p>בלשונית <strong>תלמידים וקודים</strong> רואים מי בכיתה ומה קוד הכניסה שלו. בזמן שיעור רגיל לא צריך לגעת בזה, אלא רק אם תלמיד לא מצליח להיכנס.</p>
    <figure class="wide">
      <img src="screenshots/hani-agent-academy-current/03-students-codes.png" alt="לשונית תלמידים וקודים">
      <figcaption>מקום לבדוק קודי תלמידים ופרטי כניסה. זה לא מסך הניהול השוטף של השיעור.</figcaption>
    </figure>
  </section>

  <section class="page-break">
    <h2>4. דף הבית של אקדמיית ה-Agent</h2>
    <p>כשנכנסים לעמוד כל השיעורים, הרצף מתחיל משיעור 1. שיעור 0 לא מופיע כאן כדי לא לבלבל את המורה במהלך העבודה השוטפת.</p>
    <ul>
      <li>בראש הדף מופיע השיעור הפעיל הגבוה ביותר שפתוח.</li>
      <li>אם שיעור 3 פתוח, הפעולות למעלה יהיו לשיעור 3.</li>
      <li>אם רק שיעור 1 פתוח, הפעולות יהיו לשיעור 1.</li>
    </ul>
    <figure>
      <img src="screenshots/hani-agent-academy-current/05-teacher-home.png" alt="דף הבית של אקדמיית ה-Agent למורה">
      <figcaption>דף הבית של הלומדה למורה: סטטוס השיעור הפעיל, תצוגת תלמיד, מצגת מדריך ורצף השיעורים.</figcaption>
    </figure>
  </section>

  <section>
    <h2>5. מסך ניהול שיעור</h2>
    <p>זה המסך שהמורה משאירה פתוח בזמן השיעור. כאן רואים את הפעולות לשיעור, כפתור רענון ידני, ורשימת תלמידים.</p>
    <ul>
      <li><strong>תצוגת תלמיד</strong> - פותחת למורה איך הדף נראה לילדים.</li>
      <li><strong>מצגת מדריך</strong> - פותחת את המצגת שמקרינים בכיתה.</li>
      <li><strong>כפתור רענון</strong> - לעדכון מיידי, אם רוצים לבדוק עכשיו.</li>
      <li>המסך מתעדכן אוטומטית כל 30 שניות כשהטאב פתוח, וכל 2 דקות כשהטאב ברקע.</li>
    </ul>
    <figure class="wide">
      <img src="screenshots/hani-agent-academy-current/06-lesson-board.png" alt="מסך ניהול שיעור">
      <figcaption>מסך ניהול שיעור 1. הרשימה מציגה את התלמידים, והסטטוסים מתעדכנים בלי לסגור פירוט פתוח.</figcaption>
    </figure>
  </section>

  <section class="page-break">
    <h2>6. איך רואים מה הילדים הגישו</h2>
    <p>פותחים תלמיד מתוך הרשימה. בפירוט התלמיד המורה רואה קישור קוד, דוח שלב, וצילום שהילד צילם בתוך מיינקראפט.</p>
    <ul>
      <li>הילד לא מעלה תמונה ידנית בלומדה.</li>
      <li>בסוף השיעור הילד לוחץ על כפתור סיום שיעור בתוך המתחם שלו במיינקראפט.</li>
      <li>המערכת שולחת ללומדה את הצילום האחרון שהילד צילם במצלמה במשחק.</li>
      <li>אם הילד לחץ סיום כמה פעמים, המורה רואה את האירוע האחרון.</li>
      <li>התמונה האוטומטית מלמעלה לא מוצגת יותר.</li>
    </ul>
    <figure>
      <img src="screenshots/hani-agent-academy-current/07-student-detail-submission.png" alt="פירוט תלמיד עם הגשה ותמונה">
      <figcaption>פירוט תלמיד: כאן מופיעים קישור הקוד, דוח השלב והצילום מתוך מיינקראפט.</figcaption>
    </figure>
  </section>

  <section>
    <h2>7. מה הילדים עושים בשיעור</h2>
    <p>שיעור 1 בנוי כך שהילדים מתחילים באקדמיית ה-Agent, עוברים לתרגול/קוד, ואז מיישמים במיינקראפט בתוך המתחם האישי.</p>
    <ol>
      <li>צופים בהסבר קצר עם המורה במצגת.</li>
      <li>פותחים את דף השיעור.</li>
      <li>נכנסים לתרגול אקדמיית ה-Agent ומבינים את רצף הפקודות.</li>
      <li>עוברים למיינקראפט: פותחים Code Builder עם מקש <strong>C</strong>, בונים את הקוד ב-MakeCode, ומריצים.</li>
      <li>מעתיקים את קישור הקוד, מדביקים בצ׳אט של Minecraft ולוחצים Enter. הקישור נשלח אוטומטית למורה.</li>
      <li>בסוף מצלמים במצלמה במשחק, לוחצים על כפתור סיום שיעור במתחם, והצילום נשלח למורה.</li>
    </ol>
    <figure class="wide">
      <img src="screenshots/hani-agent-academy-current/08-student-lesson-view.png" alt="תצוגת תלמיד שיעור 1">
      <figcaption>תצוגת תלמיד של שיעור 1. זו הדרך של המורה לבדוק מראש מה הילדים יראו.</figcaption>
    </figure>
  </section>

  <section class="page-break">
    <h2>8. אקדמיית ה-Agent והמצגת</h2>
    <p>אקדמיית ה-Agent היא שלב התרגול: הילדים מתרגלים רעיון קטן של קוד לפני שהם בונים במיינקראפט. באקדמיה אפשר לעבוד בבלוקים וגם לעבור לתצוגת <strong>Python</strong>, כדי לראות את אותו פתרון כקוד טקסטואלי. המצגת היא כלי ההובלה של המורה בכיתה.</p>
    <figure class="wide">
      <img src="screenshots/hani-agent-academy-current/09-agent-academy-practice.png" alt="אקדמיית ה-Agent לתלמיד">
      <figcaption>אקדמיית ה-Agent: תרגול הדרגתי לפני המעבר לבנייה בעולם. הילדים יכולים לראות את הפתרון גם כבלוקים וגם כקוד Python.</figcaption>
    </figure>
    <figure class="wide">
      <img src="screenshots/hani-agent-academy-current/10-teacher-slides.png" alt="מצגת מדריך שיעור 1">
      <figcaption>מצגת מדריך: מקרינים בכיתה כדי להסביר את סדר העבודה, Code Builder, צ׳אט וסיום שיעור.</figcaption>
    </figure>
  </section>

  <section>
    <h2>9. מטרת שיעור 1</h2>
    <p><strong>מטרת השיעור:</strong> שהתלמיד יבין שקוד הוא רצף הוראות מדויק ל-Agent: זימון, תנועה קדימה, בדיקת מרחק, תיקון מספר, והגעה ליעד.</p>
    <ul>
      <li>בנייה במיינקראפט: מחסן קטן, תחנת יעד ושביל ישר ביניהם.</li>
      <li>קוד: פקודת chat בשם <code>deliver</code>, זימון Agent, תנועה קדימה במספר צעדים מתאים, והודעת הגעה.</li>
      <li>תוצר למורה: קישור לקוד, צילום מהמשחק, ודוח שלב אם הילד לחץ סיום שיעור.</li>
    </ul>
  </section>

  <section>
    <h2>10. סדר שיעור מומלץ וחלוקת זמנים</h2>
    <div class="time-grid">
      <div>0-5 דק׳</div><div>פתיחה</div><div>מסבירים: היום בונים משלוח ראשון עם Agent. מראים את מטרת השיעור.</div>
      <div>5-15 דק׳</div><div>מצגת מדריך</div><div>מסבירים את רצף העבודה: אקדמיית Agent → Code Builder/MakeCode → Minecraft → סיום שיעור.</div>
      <div>15-30 דק׳</div><div>אקדמיית ה-Agent</div><div>הילדים מתרגלים רצף פקודות קטן ומבינים איך שינוי מספר משנה את תנועת ה-Agent.</div>
      <div>30-50 דק׳</div><div>בנייה במיינקראפט</div><div>כל ילד בונה מחסן, תחנה ושביל ישר במתחם האישי.</div>
      <div>50-65 דק׳</div><div>MakeCode והרצה</div><div>פותחים Code Builder עם C, בונים פקודת deliver, מריצים, מתקנים מרחק.</div>
      <div>65-75 דק׳</div><div>הגשה</div><div>מעתיקים קישור קוד לצ׳אט, מצלמים, לוחצים כפתור סיום שיעור. המורה בודקת בפירוט תלמיד.</div>
      <div>75-90 דק׳</div><div>בונוס וסיכום</div><div>תותחים ממשיכים למשימות בונוס; המורה מסכמת מה למדנו ומי צריך השלמה.</div>
    </div>
  </section>

  <section>
    <h2>11. משימות בנייה כבונוס לתותחים</h2>
    <p>לתלמידים שמסיימים מהר לא נותנים “לחכות”. נותנים הרחבות בנייה שמחזקות את אותו רעיון.</p>
    <ul class="checklist">
      <li>להוסיף שלט למחסן ולתחנת היעד.</li>
      <li>להאריך את השביל ולתקן את מספר הצעדים בקוד.</li>
      <li>לבנות שתי תחנות יעד ולבחור לאן ה-Agent מגיע.</li>
      <li>להוסיף “אזור פריקה” קטן בתחנה.</li>
      <li>להוסיף הודעת סיום אחרת בצ׳אט או ב-player say.</li>
      <li>לשבור בכוונה מספר אחד, להריץ, להסביר מה נשבר ולתקן.</li>
      <li>לעצב את המחסן: דלת, חלון, גג ושביל ברור.</li>
      <li>לצלם תמונת “לפני/אחרי” ולשלוח סיום שיעור שוב.</li>
    </ul>
  </section>

  <section>
    <h2>12. צ׳קליסט קצר למורה</h2>
    <ul class="checklist">
      <li>נכנסתי כמורה למסך הכיתות.</li>
      <li>פתחתי את שיעור 1 או בדקתי שהוא פתוח.</li>
      <li>פתחתי את מצגת המדריך.</li>
      <li>בדקתי תצוגת תלמיד לפני שהילדים התחילו.</li>
      <li>הסברתי לילדים לפתוח Code Builder עם C.</li>
      <li>הסברתי להדביק קישור קוד בצ׳אט Minecraft.</li>
      <li>הסברתי ללחוץ בסוף על כפתור סיום שיעור במתחם.</li>
      <li>פתחתי פירוט תלמיד ובדקתי קישור/צילום/דוח.</li>
    </ul>
    <p class="note quiet">אם הסטטוסים לא מתעדכנים מיד, לוחצים על כפתור הרענון. העדכון האוטומטי רגוע בכוונה כדי לא להכביד על המערכת.</p>
  </section>
</main>
</body>
</html>`;
}

async function writeGuideAndPdf() {
  fs.writeFileSync(HTML_PATH, html());
  const staticServer = http.createServer((req, res) => {
    const requestPath = decodeURIComponent((req.url || '/').split('?')[0]);
    const relativePath = requestPath === '/' ? 'docs/hani-agent-academy-current-teacher-guide.html' : requestPath.replace(/^\/+/, '');
    const filePath = path.resolve(ROOT, relativePath);
    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }
    fs.readFile(filePath, (error, data) => {
      if (error) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      const type = ext === '.html' ? 'text/html; charset=utf-8'
        : ext === '.png' ? 'image/png'
          : ext === '.webp' ? 'image/webp'
            : ext === '.css' ? 'text/css; charset=utf-8'
              : 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': type });
      res.end(data);
    });
  });
  await new Promise(resolve => staticServer.listen(STATIC_PDF_PORT, '127.0.0.1', resolve));
  const browser = await puppeteer.launch({
    executablePath: '/snap/bin/chromium',
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--mute-audio', '--no-first-run'],
  });
  try {
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${STATIC_PDF_PORT}/docs/hani-agent-academy-current-teacher-guide.html`, { waitUntil: 'networkidle0' });
    await page.pdf({
      path: PDF_PATH,
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
    });
  } finally {
    await browser.close();
    await new Promise(resolve => staticServer.close(resolve));
  }
}

(async () => {
  await captureScreenshots();
  await writeGuideAndPdf();
  console.log(HTML_PATH);
  console.log(PDF_PATH);
})().catch(error => {
  console.error(error);
  process.exit(1);
});
