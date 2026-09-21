const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const MARKETING = path.join(ROOT, 'marketing');
const OUT_DIR = path.join(MARKETING, 'cyber-city-lesson1-explainer-frames');
const SCRIPT_PATH = path.join(MARKETING, 'cyber-city-lesson1-explainer-script.txt');
const AUDIO_BASE = path.join(MARKETING, 'cyber-city-lesson1-gemini-leda');
const AUDIO_MP3 = `${AUDIO_BASE}.mp3`;
const SILENT_MP4 = path.join(MARKETING, 'cyber-city-lesson1-explainer-silent.mp4');
const OUT_MP4 = path.join(MARKETING, 'cyber-city-lesson1-explainer.mp4');

const FPS = Number(process.env.FPS || 10);
const WIDTH = 1280;
const HEIGHT = 720;
const CHROME = process.env.CHROME_BIN || '/snap/bin/chromium';

function resolveModule(name) {
  const bases = [
    path.join(ROOT, 'node_modules'),
    '/home/igrois/.openclaw/workspace/robotics-for-kids/node_modules',
    '/home/igrois/.openclaw/workspace/tools/whatsapp/node_modules',
  ];
  for (const base of bases) {
    try {
      return require(require.resolve(name, { paths: [base] }));
    } catch {}
  }
  return require(name);
}

const puppeteer = resolveModule('puppeteer-core');
const ffmpegPath = resolveModule('@ffmpeg-installer/ffmpeg').path;

fs.mkdirSync(MARKETING, { recursive: true });

const script = `TTS in fluent natural Israeli Hebrew.
Character: a warm Israeli instructor, energetic and clear, explaining lesson one of a cyber and AI course for children age 12.
Style: direct to children, practical, curious, concrete, friendly, not salesy. Read only the Hebrew lines. Do not read bracket labels.

[warm] ברוכים הבאים לשיעור הראשון של Cyber AI Builders.
[clear] היום אתם לא רק שומעים על סייבר. אתם עובדים בתוך הלומדה שלנו כמו צוות בדיקה צעיר.
[why] למה בכלל צריך להגן? כי בצד השני יש תוקף שמנסה לגרום למישהו לעשות פעולה לא טובה.
[attacker] לפעמים הוא רוצה סיסמה. לפעמים קוד אימות. לפעמים חשבון משחק, פריט דיגיטלי, או לחיצה על קישור מזויף.
[tricks] הוא לא אומר את זה ישר. הוא מתחזה לתמיכה, מבטיח פרס, יוצר לחץ זמן, או כותב כתובת שנראית כמעט רשמית.
[mission] העבודה שלנו היא לעצור רגע, לבדוק ראיות, ולהחליט מה עושים בצורה בטוחה.
[workflow] בלומדה מתחילים ב-Inbox Simulator. לוחצים על הודעה אחת בכל פעם, קוראים את גוף ההודעה, ומסמנים מה מצאתם.
[questions] בכל הודעה שואלים: מי שלח, מה מבקשים ממני, האם יש קישור, והאם מבקשים סיסמה או קוד אימות.
[url] אחר כך עוברים ל-URL Lab. מפרקים כתובת לחלקים, ומגלים מי הדומיין האמיתי ששולט בקישור.
[important] זו נקודה חשובה: כתובת יכולה להיראות רשמית, אבל הדומיין האמיתי הוא מה שקובע.
[rule] משם עוברים לכלל פשוט: קוד אימות לא מוסרים לאף אחד, וסיסמה לא כותבים מתוך הודעה.
[build] אחרי החקירה בונים Risk Scanner. בוחרים סימנים שמעלים סיכון: שולח לא מוכר, דומיין מתחזה, לחץ זמן, סיסמה או קוד אימות.
[ai] בחלק של AI Safety לומדים איך לשאול בינה מלאכותית בלי לחשוף מידע אישי: דוגמה מדומה כן, צילום עם קוד או פרטים אמיתיים לא.
[hands] לאורך כל השיעור עובדים בידיים: לוחצים, מסמנים, בודקים, מתקנים ומסבירים למה בחרתם.
[result] בסוף יש אתגר מסכם. מקבלים אירוע משולב, מפעילים את הסורק שבניתם, ובוחרים תגובה בטוחה.
[closing] התוצר הוא Cyber Safety Scanner ראשון: כלי קטן שעוזר להבין מה התוקף מנסה לעשות, ואיך אנחנו מגנים בצורה חכמה.`;

const stations = [
  {
    id: 'brief',
    title: 'פתיחת משימה',
    caption: 'צוות סייבר צעיר מקבל תיק אירוע ראשון',
    accent: '#1d4ed8',
    icon: '◎',
  },
  {
    id: 'inbox',
    title: 'Inbox Simulator',
    caption: 'בודקים הודעות ואוספים ראיות',
    accent: '#0891b2',
    icon: '@',
  },
  {
    id: 'url',
    title: 'URL Lab',
    caption: 'מזהים מי הדומיין האמיתי',
    accent: '#7c3aed',
    icon: '/',
  },
  {
    id: 'otp',
    title: 'קוד אימות וסיסמה',
    caption: 'לא מוסרים קוד ולא כותבים סיסמה מתוך הודעה',
    accent: '#dc2626',
    icon: '#',
  },
  {
    id: 'scanner',
    title: 'Risk Scanner',
    caption: 'בונים כלל שמחשב סיכון',
    accent: '#16a34a',
    icon: '%',
  },
  {
    id: 'ai',
    title: 'AI Safety',
    caption: 'שואלים AI בלי לחשוף מידע אישי',
    accent: '#f59e0b',
    icon: 'AI',
  },
];

const evidence = [
  { label: 'שולח לא מוכר', score: 20 },
  { label: 'דומיין מתחזה', score: 30 },
  { label: 'לחץ זמן', score: 20 },
  { label: 'בקשת סיסמה', score: 35 },
  { label: 'בקשת קוד אימות', score: 40 },
];

const messages = [
  { from: 'ספריית בית הספר', subject: 'תזכורת החזרת ספר', risk: 15, tag: 'נראה תקין' },
  { from: 'City Auth Support', subject: 'דחוף: אשרו קוד אימות', risk: 95, tag: 'חשוד מאוד' },
  { from: 'Game Rewards', subject: 'זכית בפרס!', risk: 90, tag: 'חשוד מאוד' },
];

const attackerCards = [
  { title: 'מה התוקף רוצה?', text: 'סיסמה, קוד אימות, חשבון משחק או לחיצה על קישור' },
  { title: 'איך הוא משכנע?', text: 'מתחזה לתמיכה, מבטיח פרס, או מפעיל לחץ זמן' },
  { title: 'איך מגנים?', text: 'עוצרים, בודקים ראיות, ולא מוסרים מידע רגיש' },
];

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: 'inherit', ...options });
  if (result.status !== 0) throw new Error(`${command} failed: ${args.join(' ')}`);
}

function runCapture(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: 'utf8', ...options });
  if (result.status !== 0) throw new Error(`${command} failed: ${args.join(' ')}`);
  return `${result.stdout || ''}${result.stderr || ''}`;
}

function asset(relative) {
  const file = path.join(ROOT, relative);
  const ext = path.extname(file).toLowerCase();
  const mime = ext === '.svg' ? 'image/svg+xml' : ext === '.webp' ? 'image/webp' : ext === '.png' ? 'image/png' : 'image/jpeg';
  return `data:${mime};base64,${fs.readFileSync(file).toString('base64')}`;
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
      keys.add(match[0].trim());
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

async function createGeminiAudio() {
  const previousScript = fs.existsSync(SCRIPT_PATH) ? fs.readFileSync(SCRIPT_PATH, 'utf8') : null;
  fs.writeFileSync(SCRIPT_PATH, script);
  if (fs.existsSync(AUDIO_MP3) && previousScript === script) return;
  const keys = extractGoogleAiKeys();
  if (!keys.length) throw new Error('Missing Google AI API key');
  const body = {
    contents: [{ parts: [{ text: script }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: process.env.CYBER_CITY_TTS_VOICE || 'Leda' },
        },
      },
    },
  };
  let lastError = null;
  for (let index = 0; index < keys.length; index += 1) {
    try {
      console.log(`Creating Gemini TTS audio (${index + 1}/${keys.length})`);
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-preview-tts:generateContent', {
        method: 'POST',
        headers: { 'x-goog-api-key': keys[index], 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await response.json().catch(() => null);
      if (!response.ok) throw new Error(`${response.status} ${JSON.stringify(json).slice(0, 800)}`);
      const data = json?.candidates?.[0]?.content?.parts?.find((part) => part.inlineData)?.inlineData?.data;
      if (!data) throw new Error(`No audio data: ${JSON.stringify(json).slice(0, 800)}`);
      const pcm = Buffer.from(data, 'base64');
      const pcmPath = `${AUDIO_BASE}.pcm`;
      const wavPath = `${AUDIO_BASE}.wav`;
      fs.writeFileSync(pcmPath, pcm);
      fs.writeFileSync(wavPath, wavFromPcm16(pcm, 24000));
      run(ffmpegPath, ['-y', '-i', wavPath, '-b:a', '160k', AUDIO_MP3]);
      fs.rmSync(pcmPath, { force: true });
      fs.rmSync(wavPath, { force: true });
      return;
    } catch (error) {
      lastError = error;
      console.warn(`Gemini TTS key ${index + 1} failed: ${error.message}`);
    }
  }
  throw lastError;
}

function audioDuration(file) {
  const output = runCapture(ffmpegPath, ['-hide_banner', '-i', file, '-f', 'null', '-']);
  const match = output.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
  if (!match) return 86;
  return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
}

function html() {
  const images = {
    cover: asset('assets/course-covers/cyber-city-academy.svg'),
    lab: asset('assets/cyber-city/soc-lab.svg'),
    inbox: asset('assets/cyber-city/inbox-sim.svg'),
    url: asset('assets/cyber-city/url-lab.svg'),
    flow: asset('assets/cyber-city/scanner-flow.svg'),
  };
  return `<!doctype html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box}
body{margin:0;width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;font-family:Rubik,Arial,sans-serif;direction:rtl;background:#f7fbff;color:#0f172a}
#stage{position:relative;width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;background:
 radial-gradient(circle at 12% 18%,rgba(20,184,166,.20),transparent 24%),
 radial-gradient(circle at 83% 15%,rgba(37,99,235,.17),transparent 28%),
 linear-gradient(135deg,#f7fbff 0%,#fff8ee 48%,#f2f7ff 100%)}
#gridBg{position:absolute;inset:0;opacity:.34;background:
 linear-gradient(90deg,transparent 0 7%,rgba(37,99,235,.13) 7% 7.4%,transparent 7.4% 22%,rgba(20,184,166,.15) 22% 22.4%,transparent 22.4%),
 linear-gradient(0deg,transparent 0 12%,rgba(245,158,11,.13) 12% 12.4%,transparent 12.4% 34%,rgba(124,58,237,.11) 34% 34.4%,transparent 34.4%)}
#brand{position:absolute;right:42px;top:28px;display:flex;gap:12px;align-items:center;z-index:5}
.pill{border-radius:999px;padding:9px 16px;background:#0f172a;color:white;font-weight:900;font-size:20px;box-shadow:0 10px 24px rgba(15,23,42,.16)}
.pill.light{background:white;color:#1d4ed8;border:2px solid #dbeafe}
#title{position:absolute;right:48px;top:94px;width:520px;font-size:64px;line-height:.98;font-weight:900;color:#0f172a;letter-spacing:0;z-index:3}
#subtitle{position:absolute;right:52px;top:250px;width:520px;font-size:30px;line-height:1.32;font-weight:800;color:#27445a;z-index:3}
#caption{position:absolute;right:42px;bottom:34px;width:575px;min-height:112px;background:rgba(15,23,42,.94);color:white;border:4px solid var(--accent,#2563eb);border-radius:24px;padding:18px 22px;font-size:31px;line-height:1.2;font-weight:900;box-shadow:0 22px 50px rgba(15,23,42,.28);z-index:20}
#caption small{display:block;font-size:21px;margin-top:8px;color:#bfdbfe;font-weight:800}
.panel{position:absolute;left:46px;top:58px;width:620px;height:418px;border-radius:26px;background:white;border:4px solid rgba(255,255,255,.9);box-shadow:0 24px 62px rgba(15,23,42,.18);overflow:hidden;opacity:0;transform:translateY(18px);transition:.35s;z-index:2}
.panel.show{opacity:1;transform:translateY(0)}
.visualPanel{display:grid;place-items:center;background:linear-gradient(145deg,#e0f2fe,#fef3c7)}
.visualPanel img{width:92%;height:92%;object-fit:contain;filter:drop-shadow(0 22px 30px rgba(15,23,42,.12))}
#stations{display:grid;grid-template-columns:1fr 1fr;gap:14px;padding:24px;background:#f8fbff}
.station{height:174px;border-radius:22px;background:white;border:3px solid #dbeafe;padding:16px;box-shadow:0 14px 28px rgba(15,23,42,.09);display:flex;flex-direction:column;justify-content:space-between;opacity:.72;transform:scale(.97);transition:.25s}
.station.hot{opacity:1;transform:scale(1);border-color:var(--accent);box-shadow:0 18px 38px rgba(37,99,235,.18)}
.station .icon{width:48px;height:48px;border-radius:16px;background:var(--accent);color:white;display:grid;place-items:center;font-size:22px;font-weight:900;direction:ltr}
.station h3{margin:0;font-size:25px;line-height:1.05;color:#102033}
.station p{margin:0;color:#475569;font-size:18px;line-height:1.18;font-weight:800}
#inbox{padding:24px;background:#f8fbff}
.mail{height:100px;margin-bottom:14px;border-radius:20px;background:white;border:3px solid #dbeafe;padding:14px 16px;display:grid;grid-template-columns:1fr 104px;gap:12px;align-items:center;box-shadow:0 14px 25px rgba(15,23,42,.09);opacity:.74;transition:.25s}
.mail.hot{border-color:var(--accent);opacity:1;transform:translateX(8px)}
.mail strong{display:block;font-size:23px}.mail span{display:block;color:#475569;font-weight:800;font-size:18px}.tag{border-radius:999px;padding:8px 10px;text-align:center;background:#eff6ff;color:#1d4ed8;font-weight:900}.tag.danger{background:#fee2e2;color:#991b1b}
#urlBox{padding:28px;background:#0f172a;color:white}
.urlLine{direction:ltr;text-align:left;font:800 30px/1.2 Arial,sans-serif;background:#1e293b;border:2px solid #334155;border-radius:18px;padding:18px;margin:0 0 18px;word-break:break-all}
.parts{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.part{border-radius:18px;background:#1e293b;border:2px solid #334155;padding:16px}
.part.hot{border-color:#facc15;box-shadow:0 0 0 4px rgba(250,204,21,.18)}
.part span{display:block;color:#bae6fd;font-weight:900;font-size:18px}.part strong{font-size:25px;direction:ltr;display:block;text-align:left;margin-top:6px}
#rules{padding:22px;background:#f8fbff}
.rule{height:70px;margin-bottom:12px;border-radius:20px;background:white;border:3px solid #dbeafe;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;box-shadow:0 12px 22px rgba(15,23,42,.08);font-weight:900;font-size:22px}
.rule.on{background:#ecfdf5;border-color:#16a34a;color:#065f46}
.score{direction:ltr;border-radius:999px;padding:7px 12px;background:#0f172a;color:white}
#aiSafety{padding:26px;display:grid;gap:16px;background:#fffbeb}
.safeCard{border-radius:20px;background:white;border:3px solid #fde68a;padding:18px 20px;font-size:26px;font-weight:900;box-shadow:0 14px 26px rgba(15,23,42,.09)}
.safeCard.no{border-color:#fecaca;background:#fff1f2}
#attacker{padding:24px;background:#fff7ed;display:grid;gap:14px}
.attackerCard{border-radius:20px;background:white;border:3px solid #fed7aa;padding:18px 20px;box-shadow:0 14px 26px rgba(15,23,42,.09)}
.attackerCard h3{margin:0 0 8px;font-size:28px;color:#9a3412}.attackerCard p{margin:0;font-size:22px;line-height:1.22;font-weight:900;color:#27384a}
#outcomes{padding:34px;display:flex;align-items:center;justify-content:center;gap:14px;background:#f8fbff}
.outcome{width:112px;height:112px;border-radius:30px;background:white;border:4px solid var(--accent);display:grid;place-items:center;text-align:center;font-weight:900;font-size:21px;line-height:1.05;color:#0f172a;box-shadow:0 16px 32px rgba(15,23,42,.14)}
#riskMeter{position:absolute;right:52px;top:405px;width:500px;height:42px;border-radius:999px;background:white;border:3px solid #dbeafe;overflow:hidden;box-shadow:0 12px 26px rgba(15,23,42,.10);opacity:0;transition:.25s;z-index:8}
#riskMeter.show{opacity:1}
#riskFill{height:100%;width:0;background:linear-gradient(90deg,#22c55e,#f59e0b,#dc2626);transition:.4s}
#riskLabel{position:absolute;right:52px;top:363px;font-size:27px;font-weight:900;color:#0f172a;opacity:0;transition:.25s;z-index:8}
#riskLabel.show{opacity:1}
</style>
</head>
<body>
<div id="stage">
  <div id="gridBg"></div>
  <div id="brand"><span class="pill">Cyber AI Builders</span><span class="pill light">שיעור 1 • 90 דקות</span></div>
  <div id="title"></div>
  <div id="subtitle"></div>
  <div id="caption"></div>
  <div id="coverPanel" class="panel visualPanel"><img src="${images.cover}"></div>
  <div id="labPanel" class="panel visualPanel"><img src="${images.lab}"></div>
  <div id="stationPanel" class="panel"><div id="stations"></div></div>
  <div id="inboxPanel" class="panel"><div id="inbox"></div></div>
  <div id="urlPanel" class="panel"><div id="urlBox"></div></div>
  <div id="rulesPanel" class="panel"><div id="rules"></div></div>
  <div id="aiPanel" class="panel"><div id="aiSafety"></div></div>
  <div id="attackerPanel" class="panel"><div id="attacker"></div></div>
  <div id="outcomePanel" class="panel"><div id="outcomes"></div></div>
  <div id="riskLabel">Risk: <span id="riskText">0%</span></div>
  <div id="riskMeter"><div id="riskFill"></div></div>
</div>
<script>
const stations = ${JSON.stringify(stations)};
const messages = ${JSON.stringify(messages)};
const evidence = ${JSON.stringify(evidence)};
const attackerCards = ${JSON.stringify(attackerCards)};
const panels = ['coverPanel','labPanel','stationPanel','inboxPanel','urlPanel','rulesPanel','aiPanel','attackerPanel','outcomePanel'];
const qs = id => document.getElementById(id);
const title = qs('title');
const subtitle = qs('subtitle');
const caption = qs('caption');
const stage = qs('stage');
const riskMeter = qs('riskMeter');
const riskLabel = qs('riskLabel');
const riskText = qs('riskText');
const riskFill = qs('riskFill');
qs('stations').innerHTML = stations.map((station, index) => '<article class="station" data-i="'+index+'"><div class="icon">'+station.icon+'</div><h3>'+station.title+'</h3><p>'+station.caption+'</p></article>').join('');
qs('inbox').innerHTML = messages.map((mail, index) => '<article class="mail" data-i="'+index+'"><div><span>'+mail.from+'</span><strong>'+mail.subject+'</strong></div><div class="tag '+(mail.risk > 70 ? 'danger' : '')+'">'+mail.tag+'</div></article>').join('');
qs('urlBox').innerHTML = '<div class="urlLine">https://school-login-secure.example/verify</div><div class="parts"><div class="part"><span>protocol</span><strong>https</strong></div><div class="part"><span>brand words</span><strong>school login</strong></div><div class="part hot"><span>real domain</span><strong>example</strong></div><div class="part"><span>path</span><strong>/verify</strong></div></div>';
qs('rules').innerHTML = evidence.map((item, index) => '<div class="rule" data-i="'+index+'"><span>'+item.label+'</span><span class="score">+'+item.score+'%</span></div>').join('');
qs('aiSafety').innerHTML = ['דוגמה מדומה: מותר לשאול', 'פרטים אישיים: לא מעלים', 'צילום עם קוד: לא מעלים', 'דוח בלי שמות אמיתיים: אפשר לבדוק'].map((item, index) => '<div class="safeCard '+(index === 1 || index === 2 ? 'no' : '')+'">'+item+'</div>').join('');
qs('attacker').innerHTML = attackerCards.map(item => '<article class="attackerCard"><h3>'+item.title+'</h3><p>'+item.text+'</p></article>').join('');
qs('outcomes').innerHTML = ['ראיות','דומיין','כלל סיכון','AI בטוח','תגובה'].map(item => '<div class="outcome">'+item+'</div>').join('');
function hideAll(){
  panels.forEach(id => qs(id).classList.remove('show'));
  riskMeter.classList.remove('show');
  riskLabel.classList.remove('show');
}
window.scene = (s) => {
  stage.style.setProperty('--accent', s.accent || '#2563eb');
  title.textContent = s.title || '';
  subtitle.textContent = s.subtitle || '';
  caption.innerHTML = (s.caption || '') + (s.small ? '<small>'+s.small+'</small>' : '');
  hideAll();
  if (s.panel) qs(s.panel).classList.add('show');
  document.querySelectorAll('.station').forEach((el, index) => el.classList.toggle('hot', index === s.hotStation));
  document.querySelectorAll('.mail').forEach((el, index) => el.classList.toggle('hot', index === s.hotMail));
  document.querySelectorAll('.rule').forEach((el, index) => el.classList.toggle('on', index <= (s.rulesOn ?? -1)));
  if (s.risk !== undefined) {
    riskMeter.classList.add('show');
    riskLabel.classList.add('show');
    riskText.textContent = s.risk + '%';
    riskFill.style.width = s.risk + '%';
  }
};
</script>
</body>
</html>`;
}

async function render() {
  await createGeminiAudio();
  const duration = audioDuration(AUDIO_MP3);
  const baseTimeline = 95;
  const timelineScale = Math.max(1, (duration + 1) / baseTimeline);
  console.log(`Audio duration: ${duration.toFixed(2)}s, timeline scale: ${timelineScale.toFixed(2)}`);

  fs.rmSync(OUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });
  let frame = 0;

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', `--window-size=${WIDTH},${HEIGHT}`],
    defaultViewport: { width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 },
  });
  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });
  await page.setContent(html(), { waitUntil: 'load' });

  async function snap() {
    await page.screenshot({ path: path.join(OUT_DIR, `frame-${String(frame).padStart(5, '0')}.png`) });
    frame += 1;
  }

  async function hold(seconds) {
    const count = Math.round(seconds * timelineScale * FPS);
    for (let i = 0; i < count; i += 1) await snap();
  }

  async function scene(data, seconds) {
    await page.evaluate((value) => window.scene(value), data);
    await new Promise((resolve) => setTimeout(resolve, 420));
    await hold(seconds);
  }

  await scene({
    title: 'שיעור 1',
    subtitle: 'בונים סורק סייבר ראשון',
    caption: 'שיעור חקירה ובנייה לגיל 12.',
    small: 'Cyber AI Builders',
    panel: 'coverPanel',
    accent: '#1d4ed8',
  }, 7);
  await scene({
    title: 'עובדים בלומדה',
    subtitle: 'לא רק שומעים על סייבר',
    caption: 'נכנסים לתפקיד צוות בדיקה צעיר ומתחילים ממשימה.',
    small: 'קוראים, לוחצים, מסמנים ובודקים',
    panel: 'labPanel',
    accent: '#0891b2',
  }, 7);
  await scene({
    title: 'למה מגנים?',
    subtitle: 'כי יש מישהו שמנסה לגרום לנו לפעול מהר מדי',
    caption: 'התוקף רוצה פעולה: קוד, סיסמה, חשבון או לחיצה.',
    small: 'קודם מבינים מה הוא מנסה להשיג',
    panel: 'attackerPanel',
    accent: '#f97316',
  }, 9);
  await scene({
    title: 'הצד של התוקף',
    subtitle: 'הוא משתמש בתחבולות, לא בכוח',
    caption: 'פרס, התחזות, לחץ זמן או קישור שנראה כמעט רשמי.',
    small: 'אנחנו לומדים לזהות את הסימנים',
    panel: 'attackerPanel',
    accent: '#dc2626',
  }, 8);
  await scene({
    title: 'מסלול 90 דקות',
    subtitle: 'שש תחנות קצרות וברורות',
    caption: 'תיבת הודעות, כתובות, קוד אימות, מד סיכון ובטיחות בבינה מלאכותית.',
    small: 'כל תחנה מוסיפה כלי אחד',
    panel: 'stationPanel',
    hotStation: 0,
    accent: '#7c3aed',
  }, 7);
  await scene({
    title: 'Inbox Simulator',
    subtitle: 'פותחים הודעה אחת בכל פעם',
    caption: 'קוראים את גוף ההודעה ומסמנים ראיות מתוך הלומדה.',
    small: 'מי שלח, מה מבקשים, האם יש לחץ או מידע רגיש',
    panel: 'inboxPanel',
    hotMail: 1,
    risk: 95,
    accent: '#0891b2',
  }, 8);
  await scene({
    title: 'URL Lab',
    subtitle: 'הדומיין האמיתי קובע',
    caption: 'כתובת יכולה להיראות רשמית, אבל צריך לבדוק מי שולט בקישור.',
    small: 'מפרקים את הכתובת לחלקים',
    panel: 'urlPanel',
    accent: '#7c3aed',
  }, 8);
  await scene({
    title: 'קוד אימות וסיסמה',
    subtitle: 'לא מוסרים קוד, לא כותבים סיסמה מתוך הודעה',
    caption: 'זה בדיוק המקום שבו מבינים למה צריך להגן.',
    small: 'עוצרים, מדווחים, בודקים מקור רשמי',
    panel: 'stationPanel',
    hotStation: 3,
    accent: '#dc2626',
  }, 7);
  await scene({
    title: 'בונים סורק',
    subtitle: 'כל סימן מוסיף Risk',
    caption: 'שולח לא מוכר, דומיין מתחזה, לחץ זמן, סיסמה וקוד אימות.',
    small: 'התוצר מתחיל לעבוד',
    panel: 'rulesPanel',
    rulesOn: 4,
    risk: 100,
    accent: '#16a34a',
  }, 8);
  await scene({
    title: 'AI Safety',
    subtitle: 'שואלים בזהירות',
    caption: 'אפשר לשאול על דוגמה מדומה. לא מעלים פרטים אישיים או קודים.',
    small: 'AI עוזר לחשוב, לא מקבל מידע רגיש',
    panel: 'aiPanel',
    accent: '#f59e0b',
  }, 7);
  await scene({
    title: 'אתגר מסכם',
    subtitle: 'אירוע משולב ותיק ראיות',
    caption: 'הילדים מפעילים את הסורק שבנו ובוחרים תגובה בטוחה.',
    small: 'מחברים את כל התחנות',
    panel: 'outcomePanel',
    accent: '#1d4ed8',
  }, 8);
  await scene({
    title: 'תוצר שיעור 1',
    subtitle: 'Cyber Safety Scanner ראשון',
    caption: 'כלי קטן שמראה מה התוקף מנסה לעשות ואיך מגנים.',
    small: 'בסוף השיעור יודעים לבדוק לפני שלוחצים',
    panel: 'coverPanel',
    risk: 82,
    accent: '#16a34a',
  }, 11);

  await browser.close();

  run(ffmpegPath, ['-y', '-framerate', String(FPS), '-i', path.join(OUT_DIR, 'frame-%05d.png'), '-vf', 'format=yuv420p', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-movflags', '+faststart', SILENT_MP4]);
  run(ffmpegPath, ['-y', '-i', SILENT_MP4, '-i', AUDIO_MP3, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', OUT_MP4]);
  fs.rmSync(OUT_DIR, { recursive: true, force: true });
  fs.rmSync(SILENT_MP4, { force: true });
  run(ffmpegPath, ['-hide_banner', '-i', OUT_MP4, '-f', 'null', '-']);
  console.log(OUT_MP4);
}

render().catch((error) => {
  console.error(error);
  process.exit(1);
});
