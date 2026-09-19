import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
const MARKETING = path.join(ROOT, 'marketing');
const FRAME_ROOT = process.env.FRAME_ROOT || '/home/igrois/snap/chromium/common/cyber-city-lesson8-mystery-frames';
const CHROMIUM = process.env.CHROMIUM || '/snap/bin/chromium';
const FFMPEG = process.env.FFMPEG || '/home/igrois/.openclaw/workspace/robotics-for-kids/node_modules/@ffmpeg-installer/linux-x64/ffmpeg';
const WIDTH = 1280;
const HEIGHT = 720;

const videos = [
  ['overview', 'Cyber Mystery Room', 'מי פתח את שער העיר?', ['שער העיר נפתח בלילה.', 'אנחנו לא מנחשים - אנחנו אוספים ראיות.', 'לומדים לוגים, ציר זמן, IOC, טרמינל, Python ו-CTF Flag.', 'בסוף מגישים Incident Report קצר.'], ['Forensics', 'Logs', 'Timeline', 'CTF']],
  ['concepts', 'שפת חדר החקירה', 'שישה מושגים לפני שמתחילים', ['Digital Forensics חוקרת לפי ראיות.', 'Log מספר מה קרה במערכת.', 'Timeline מסדר אירועים בזמן.', 'IOC הוא סימן חשד קטן שמחזק מסקנה.'], ['Forensics', 'Log', 'Timeline', 'IOC']],
  ['evidence', 'Evidence Board', 'כל ראיה עונה על שאלה', ['ראיה טובה עוזרת להבין מה קרה ומתי.', 'פותחים קובצי auth, packet ו-door event.', 'בודקים גם רמז מסוכן והודעה מקודדת.', 'רק ראיה נכונה נכנסת לתיק.'], ['auth.log', 'packet.log', 'door_event', 'encoded_message']],
  ['timeline', 'Timeline Builder', 'סדר האירועים הוא ההוכחה', ['קודם היו כשלונות התחברות.', 'אחר כך הגיעה הצלחה מאותו IP.', 'רק אחרי זה השער נפתח.', 'כך מוכיחים רצף ולא מנחשים.'], ['22:03 failed', '22:07 success', '22:08 gate=open']],
  ['terminal', 'Forensics Terminal', 'מחפשים IOC בקבצים', ['cat מציגה קובץ ראיות.', 'grep מחפשת שורות חשודות.', 'wc סופרת שורות בלוג.', 'בסוף מוצאים FLAG שמוכיח פתרון.'], ['cat', 'grep', 'wc', 'FLAG']],
  ['python', 'Python Evidence Counter', 'בודקים את התיק במספרים', ['Python סופר כמה failed היו.', 'בודק אם הגיעה success אחרי הכשלונות.', 'בודק אם המקור הוא אותו IP.', 'הפלט מחזק את מסקנת החקירה.'], ['failed', 'success', 'same IP', 'case_risk']],
  ['report', 'Incident Report', 'מסקנה לפי ראיות', ['בדוח לא כותבים תחושה.', 'כותבים חשוד, ראיה ותיקון.', 'התיקון מחזיר הגנה לעיר.', 'כך צוות סייבר מסיים חקירה.'], ['מה קרה?', 'איזו ראיה?', 'מה התיקון?']],
  ['concept-forensics', 'Digital Forensics', 'חקירה אחרי אירוע', ['פורנזיקה דיגיטלית בודקת אירוע שכבר קרה.', 'המטרה היא לבנות מסקנה לפי ראיות.', 'לא פורצים למערכת אמיתית.', 'עובדים רק בסביבת אימון.'], ['ראיות', 'בטיחות', 'מסקנה']],
  ['concept-logs', 'Logs', 'רשומות של פעולות', ['לוג הוא שורה שמספרת פעולה.', 'יש בו שעה, משתמש, מקור ותוצאה.', 'לוגים עוזרים להבין מה באמת קרה.', 'בשיעור נקרא לוגים מדומים בלבד.'], ['time', 'user', 'src', 'result']],
  ['concept-timeline', 'Timeline', 'מה קרה קודם?', ['ציר זמן מסדר אירועים לפי שעה.', 'הוא מראה קשר בין פעולה לתוצאה.', 'כשלונות לפני הצלחה הם סימן חשוב.', 'שער שנפתח אחרי login מחזק חשד.'], ['קודם', 'אחר כך', 'רצף']],
  ['concept-ioc', 'IOC', 'Indicator of Compromise', ['IOC הוא סימן קטן שמשהו חשוד קרה.', 'למשל הרבה failed ואז success.', 'או IP לא מוכר בשעה חריגה.', 'מחברים כמה IOC לתמונה אחת.'], ['failed', 'success', 'IP חשוד']],
  ['concept-terminal', 'Forensics Terminal', 'חיפוש בטוח בראיות', ['הטרמינל כאן הוא סימולציה סגורה.', 'cat קוראת קובץ.', 'grep מחפשת מילה.', 'wc סופרת שורות.'], ['cat', 'grep', 'wc']],
  ['concept-ctf', 'CTF Flag', 'דגל מוכיח פתרון', ['CTF הוא Capture The Flag.', 'הדגל נפתח רק כשמצאנו ראיה נכונה.', 'הוא לא פריצה אמיתית.', 'זה פרס חקירה בתוך משחק בטוח.'], ['FLAG{...}', 'הוכחה', 'אתגר']]
].map(([slug, title, subtitle, script, points]) => ({ slug, title, subtitle, script, points }));

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: 'inherit', ...options });
  if (result.status !== 0) throw new Error(`${command} failed with ${result.status}`);
}

function esc(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function html(video, index) {
  const line = video.script[index] || video.script.at(-1);
  return `<!doctype html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8">
<style>
*{box-sizing:border-box}body{margin:0;width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;font-family:Arial,sans-serif;color:#e5f9ff;background:#061826}.frame{position:relative;width:${WIDTH}px;height:${HEIGHT}px;padding:58px 76px;background:radial-gradient(circle at 18% 18%,rgba(34,211,238,.34),transparent 28%),radial-gradient(circle at 78% 28%,rgba(16,185,129,.28),transparent 30%),linear-gradient(135deg,#07111f,#0f766e 58%,#0b1220)}.grid{position:absolute;inset:0;opacity:.2;background-image:linear-gradient(rgba(255,255,255,.12) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.12) 1px,transparent 1px);background-size:56px 56px}.top{position:relative;display:flex;justify-content:space-between;align-items:flex-start;gap:30px}.kicker{color:#67e8f9;font-size:26px;font-weight:800}h1{margin:16px 0 0;font-size:66px;line-height:1.04;max-width:780px}h2{margin:18px 0 0;font-size:34px;color:#ccfbf1}.case{position:relative;margin-top:42px;display:grid;grid-template-columns:1fr 390px;gap:28px;align-items:stretch}.line{border:1px solid rgba(255,255,255,.2);border-radius:18px;padding:28px;background:rgba(2,6,23,.54);box-shadow:0 18px 50px rgba(0,0,0,.22)}.line strong{display:block;font-size:42px;line-height:1.25}.line p{margin:18px 0 0;color:#bae6fd;font-size:26px;font-weight:800;line-height:1.45}.board{display:grid;gap:12px}.card{border:1px solid rgba(255,255,255,.2);border-radius:14px;padding:16px 18px;background:rgba(255,255,255,.11);font-size:25px;font-weight:900}.card:nth-child(${(index%4)+1}){background:rgba(16,185,129,.35);border-color:#6ee7b7}.badge{position:absolute;left:76px;bottom:44px;border-radius:999px;padding:12px 18px;background:#fef3c7;color:#92400e;font-size:24px;font-weight:900}.step{position:absolute;right:76px;bottom:44px;color:#a7f3d0;font-size:25px;font-weight:900;direction:ltr}
</style>
</head>
<body><main class="frame"><div class="grid"></div><section class="top"><div><div class="kicker">Cyber AI Builders · Lesson 8</div><h1>${esc(video.title)}</h1><h2>${esc(video.subtitle)}</h2></div></section><section class="case"><article class="line"><strong>${esc(line)}</strong><p>${esc(video.slug.includes('concept') ? 'מושג סייבר אמיתי בתוך חדר חקירה בטוח.' : 'חוקרים ראיות, לא מנחשים.')}</p></article><aside class="board">${video.points.map(point=>`<div class="card">${esc(point)}</div>`).join('')}</aside></section><div class="badge">Cyber Mystery Room</div><div class="step">${index + 1}/${video.script.length}</div></main></body></html>`;
}

fs.mkdirSync(MARKETING, { recursive: true });
fs.mkdirSync(FRAME_ROOT, { recursive: true });

for (const video of videos) {
  const dir = path.join(FRAME_ROOT, video.slug);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const list = [];
  for (let index = 0; index < video.script.length; index += 1) {
    const htmlFile = path.join(dir, `frame-${index}.html`);
    const pngFile = path.join(dir, `frame-${index}.png`);
    fs.writeFileSync(htmlFile, html(video, index));
    run(CHROMIUM, ['--headless', '--no-sandbox', '--disable-gpu', `--window-size=${WIDTH},${HEIGHT}`, `--screenshot=${pngFile}`, `file://${htmlFile}`]);
    list.push(pngFile);
  }
  const concat = path.join(dir, 'frames.txt');
  fs.writeFileSync(concat, `${list.map(file => `file '${file.replaceAll("'", "'\\''")}'\nduration 2.8`).join('\n')}\nfile '${list.at(-1).replaceAll("'", "'\\''")}'\n`);
  const mp4 = path.join(MARKETING, `cyber-city-lesson8-${video.slug}.mp4`);
  const poster = path.join(MARKETING, `cyber-city-lesson8-${video.slug}-poster.jpg`);
  run(FFMPEG, ['-y', '-f', 'concat', '-safe', '0', '-i', concat, '-vf', 'format=yuv420p', '-r', '30', '-c:v', 'libx264', '-movflags', '+faststart', mp4]);
  run(FFMPEG, ['-y', '-i', list[0], '-frames:v', '1', '-q:v', '2', poster]);
}
