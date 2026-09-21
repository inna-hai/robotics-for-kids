const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const puppeteer = require('puppeteer-core');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const { EdgeTTS } = require('@andresaya/edge-tts');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'marketing', 'sisi-video-frames-narrated');
const SILENT_MP4 = path.join(ROOT, 'marketing', 'sisi-marketing-demo-human-paced-silent.mp4');
const AUDIO_BASE = path.join(ROOT, 'marketing', 'sisi-marketing-demo-narration');
const AUDIO_MP3 = `${AUDIO_BASE}.mp3`;
const OUT_MP4 = path.join(ROOT, 'marketing', 'sisi-marketing-demo-human-paced-narrated.mp4');
const FPS = 15;
let frame = 0;

function cleanDir(dir) { fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true }); }
function framePath() { return path.join(OUT_DIR, `frame-${String(frame++).padStart(5, '0')}.png`); }
function run(cmd, args) { const r = spawnSync(cmd, args, { stdio: 'inherit' }); if (r.status !== 0) process.exit(r.status || 1); }

(async () => {
  cleanDir(OUT_DIR);
  fs.mkdirSync(path.dirname(OUT_MP4), { recursive: true });
  fs.rmSync(AUDIO_MP3, { force: true });

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium-browser',
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--font-render-hinting=none']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
  await page.goto('http://127.0.0.1:3137/space-play.html?lesson=1', { waitUntil: 'networkidle2' });

  await page.addStyleTag({ content: `
    body{overflow:hidden!important;background:linear-gradient(135deg,#eef7ff,#fff7ed)!important;}
    .hero{display:none!important}.shell{width:1240px!important;margin:0 auto!important}.play-layout{margin-top:18px!important;gap:18px!important;grid-template-columns:minmax(0,1fr) 390px!important;align-items:stretch!important}.game-card,.side-card{box-shadow:0 18px 45px rgba(15,23,42,.14)!important}.platform-home-link,#rfw-launcher{display:none!important}.fact,.space-guide{display:none!important}.grid{max-width:520px!important;margin:0 auto!important}.side-card{max-height:690px!important;overflow:hidden!important}.nav-lessons{display:none!important}
    #marketingCaption{position:fixed;right:36px;bottom:26px;z-index:99999;max-width:760px;background:rgba(15,23,42,.86);color:white;border-radius:24px;padding:16px 22px;font:900 30px/1.25 Rubik,Arial,sans-serif;box-shadow:0 18px 42px rgba(15,23,42,.28);direction:rtl;text-align:right;backdrop-filter:blur(8px)}
    #marketingCaption small{display:block;font-size:17px;font-weight:800;color:#c7f9ff;margin-top:5px}.spotlight{outline:7px solid #facc15!important;box-shadow:0 0 0 12px rgba(250,204,21,.28),0 20px 40px rgba(15,23,42,.22)!important;transition:.2s}.grid.spotlight{border-radius:30px}.program.spotlight,#result.spotlight{border-radius:20px;padding:10px}.control.flash,.btn.flash{animation:pulseMarketing .75s ease 1}@keyframes pulseMarketing{0%,100%{transform:scale(1)}50%{transform:scale(1.07);box-shadow:0 0 0 10px rgba(34,197,94,.24)}}
  `});
  await page.evaluate(() => {
    const c = document.createElement('div');
    c.id = 'marketingCaption';
    c.innerHTML = 'כך עובדת לומדת סיסי <small>הילד בונה פתרון, מריץ, ורואה פידבק מיידי</small>';
    document.body.appendChild(c);
  });

  async function caption(title, sub = '') { await page.evaluate((title, sub) => { document.getElementById('marketingCaption').innerHTML = `${title}${sub ? `<small>${sub}</small>` : ''}`; }, title, sub); }
  async function clearSpot() { await page.evaluate(() => document.querySelectorAll('.spotlight,.flash').forEach(el => el.classList.remove('spotlight','flash'))); }
  async function spot(selector) { await clearSpot(); await page.$eval(selector, el => el.classList.add('spotlight')); }
  async function flash(selector) { await page.$eval(selector, el => el.classList.add('flash')); }
  async function snap() { await page.screenshot({ path: framePath(), type: 'png' }); }
  async function hold(seconds) { for (let i = 0; i < Math.round(seconds * FPS); i++) await snap(); }
  async function waitSnap(ms) { await new Promise(r => setTimeout(r, ms)); await snap(); }

  await caption('משימה אמיתית מתוך סיסי', 'הילד רואה לוח משחק: איפה סיסי מתחילה, ולאן היא צריכה להגיע');
  await spot('.grid');
  await hold(4.0);

  await caption('עכשיו בונים את הפתרון', 'הילד חושב על המסלול, ואז מוסיף פקודה אחרי פקודה');
  await spot('.program');
  await hold(1.3);

  const cmds = ['up','up','up','right','right','right','right'];
  const delays = [0.85, 1.05, 0.75, 1.15, 0.9, 1.25, 0.8];
  for (let i = 0; i < cmds.length; i++) {
    const sel = `[data-cmd="${cmds[i]}"]`;
    await flash(sel);
    await page.click(sel);
    await waitSnap(180);
    await page.evaluate(sel => document.querySelector(sel)?.classList.remove('flash'), sel);
    await hold(delays[i]);
  }

  await caption('הרצף מוכן — לוחצים הרצה', 'הלומדה מריצה את הפקודות כמו קוד, שלב אחרי שלב');
  await clearSpot();
  await flash('#run');
  await hold(1.2);
  await page.click('#run').catch(() => {});
  for (let i = 0; i < Math.round(5.7 * FPS); i++) {
    await new Promise(r => setTimeout(r, 1000 / FPS));
    await snap();
  }

  await caption('פידבק מיידי לתלמיד', 'הילד רואה שסיסי הגיעה ליעד — ואם לא, מתקנים ומנסים שוב');
  await spot('#result');
  await hold(4.3);

  await caption('למידה פעילה, קצרה ומשחקית', 'בונים • מריצים • מקבלים משוב • משתפרים');
  await clearSpot();
  await hold(3.0);

  await browser.close();

  run(ffmpegPath, ['-y', '-framerate', String(FPS), '-i', path.join(OUT_DIR, 'frame-%05d.png'), '-vf', 'format=yuv420p', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-movflags', '+faststart', SILENT_MP4]);

  const narration = 'כאן הילד נכנס למשימה אמיתית מתוך לומדת סיסי. הוא רואה את סיסי על הלוח, מזהה את היעד, ומתכנן את הדרך. עכשיו הוא בונה את הפתרון בעצמו: מוסיף פקודה אחת, עוצר רגע, בודק את הרצף, וממשיך לפקודה הבאה. כשהרצף מוכן, הוא לוחץ על הרצה. סיסי מבצעת את ההוראות שלב אחרי שלב, בדיוק כמו קוד. בסוף הילד מקבל פידבק מיידי: האם הפתרון הצליח, ומה אפשר לתקן אם לא. זו למידה פעילה, קצרה ומשחקית.';
  const tts = new EdgeTTS();
  await tts.synthesize(narration, 'he-IL-HilaNeural', { rate: '-8%', volume: '+0%' });
  await tts.toFile(AUDIO_BASE);

  run(ffmpegPath, ['-y', '-i', SILENT_MP4, '-i', AUDIO_MP3, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart', OUT_MP4]);
  console.log(OUT_MP4);
})();
