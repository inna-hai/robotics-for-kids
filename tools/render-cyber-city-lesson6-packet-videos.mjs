import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
const MARKETING = path.join(ROOT, 'marketing');
const FRAME_ROOT = process.env.FRAME_ROOT || '/home/igrois/snap/chromium/common/cyber-city-lesson6-packet-frames';
const FFMPEG = process.env.FFMPEG || '/home/igrois/.openclaw/workspace/robotics-for-kids/node_modules/@ffmpeg-installer/linux-x64/ffmpeg';
const CHROMIUM = process.env.CHROMIUM || '/snap/bin/chromium';
const WIDTH = 1280;
const HEIGHT = 720;

const videos = [
  {
    slug: 'overview',
    title: 'Packet Patrol',
    subtitle: 'איך מידע זז באינטרנט',
    script: [
      'ברוכים הבאים לחדר הבקרה של הרשת.',
      'היום אנחנו לא בודקים עוד הודעה חשודה, אלא מסתכלים על הדרך שהמידע עובר.',
      'נראה מקור, יעד, DNS, כתובת IP, פרוטוקול והצפנה.',
      'בסוף נבנה Packet Inspector קטן בפייתון, שעובד על לוגים מסומלצים בלבד.'
    ],
    points: ['Source IP', 'DNS lookup', 'HTTP מול HTTPS', 'Packet Inspector']
  },
  {
    slug: 'brief',
    title: 'משימה 1: חדר בקרה',
    subtitle: 'מה רואה צוות הגנת רשת?',
    script: [
      'חוקר רשת לא מסתפק במה שרואים במסך.',
      'הוא שואל מי שלח את הבקשה, לאן היא נשלחה, ובאיזה פרוטוקול.',
      'בשיעור נעבוד בסביבת אימון סגורה, עם רשומות תעבורה מוכנות.',
      'המטרה היא לקבל החלטת הגנה, לא לנחש.'
    ],
    points: ['מי שלח?', 'לאן נשלח?', 'מוצפן או גלוי?', 'מה עושים עכשיו?']
  },
  {
    slug: 'map',
    title: 'משימה 2: Network Map',
    subtitle: 'מחשב, DNS ושרת יעד',
    script: [
      'כל בקשה מתחילה במחשב של המשתמש.',
      'DNS מתרגם שם אתר לכתובת IP.',
      'אחרי זה הבקשה יוצאת לשרת היעד וחוזרת כתשובה.',
      'ברגע שמבינים את המסלול, הרבה סימנים מתחילים להיות ברורים.'
    ],
    points: ['Laptop', 'DNS', 'Destination IP', 'Response']
  },
  {
    slug: 'packet',
    title: 'משימה 3: Packet Log',
    subtitle: 'קוראים תעבורה כמו חוקרי SOC',
    script: [
      'רשומת תעבורה קצרה יכולה לספר הרבה.',
      'src הוא המקור, dst הוא היעד, proto הוא הפרוטוקול.',
      'path יכול לחשוף פעולה כמו login או download.',
      'encrypted אומר אם התוכן מוגן בדרך או גלוי יותר.'
    ],
    points: ['src', 'dst', 'proto', 'encrypted']
  },
  {
    slug: 'python',
    title: 'משימה 4: Python Inspector',
    subtitle: 'if ו-in על לוג תעבורה',
    script: [
      'עכשיו הופכים את החשיבה לכלי קטן בפייתון.',
      'המשתנה pkt מחזיק רשומת תעבורה.',
      'כל תנאי if בודק סימן אחד בתוך הטקסט.',
      'אם מופיע HTTP, login, password או unknown, ה-Risk עולה.'
    ],
    points: ['pkt', 'if', 'in', 'risk']
  },
  {
    slug: 'cases',
    title: 'משימה 5: הרצה',
    subtitle: 'משווים תעבורה בטוחה וחשודה',
    script: [
      'מריצים את הבודק על כמה רשומות אימון.',
      'כניסה ב-HTTPS לפורטל מוכר מקבלת Risk נמוך יותר.',
      'HTTP גלוי עם login ו-password הוא סימן עצירה.',
      'ככה תלמידים לומדים לראות הבדל אמיתי בין תעבורה מוצפנת לגלויה.'
    ],
    points: ['HTTPS portal', 'DNS query', 'HTTP login', 'Unknown download']
  },
  {
    slug: 'report',
    title: 'משימה 6: דוח הגנה',
    subtitle: 'ממצא, סימנים והחלטה',
    script: [
      'בסוף לא מספיק להגיד מסוכן או בטוח.',
      'צוות הגנה מסביר מה עבר ברשת, אילו סימנים נמצאו, ומה ההחלטה.',
      'הדוח קצר: תעבורה, סימנים, פעולה.',
      'זה ההבדל בין תחושה לבין חקירת סייבר מסודרת.'
    ],
    points: ['מה ראינו?', 'אילו סימנים?', 'מה ההחלטה?', 'Network Defender']
  },
  {
    slug: 'concept-device',
    title: 'מחשב - מושג 1',
    subtitle: 'מאיפה הבקשה מתחילה?',
    script: [
      'מחשב הוא נקודת ההתחלה של הבקשה.',
      'כשילד כותב שם אתר ולוחץ כניסה, המחשב שלו שולח בקשה החוצה.',
      'בלוג רשת נקרא לזה source, כלומר המקור.',
      'במשחק, המחשב צריך להיות ראשון במסלול.'
    ],
    points: ['Student computer', 'source', 'בקשה יוצאת', 'ראשון במסלול']
  },
  {
    slug: 'concept-dns',
    title: 'DNS - מושג 2',
    subtitle: 'ספר הטלפונים של האינטרנט',
    script: [
      'DNS עוזר למחשב להבין לאן ללכת.',
      'אנחנו זוכרים שם אתר, כמו school dot example.',
      'אבל הרשת צריכה כתובת מספרית, כתובת IP.',
      'DNS מתרגם את שם האתר לכתובת שאפשר לשלוח אליה מידע.'
    ],
    points: ['שם אתר', 'שאלה ל-DNS', 'כתובת IP', 'תרגום']
  },
  {
    slug: 'concept-ip',
    title: 'IP - מושג 3',
    subtitle: 'הכתובת שאליה שולחים',
    script: [
      'IP הוא מספר כתובת של מחשב או שרת ברשת.',
      'כמו שבבית יש כתובת, גם לשרת יש כתובת שהרשת יכולה למצוא.',
      'אחרי ש-DNS מצא את הכתובת, הבקשה יודעת לאן לנסוע.',
      'במשחק, IP מגיע אחרי DNS ולפני השרת.'
    ],
    points: ['203.0.113.24', 'כתובת יעד', 'הרשת מוצאת', 'אחרי DNS']
  },
  {
    slug: 'concept-server',
    title: 'שרת - מושג 4',
    subtitle: 'מי מחזיר את האתר?',
    script: [
      'שרת הוא מחשב חזק שמחזיק אתר, משחק או קובץ.',
      'המחשב שלנו שולח אליו בקשה, והשרת מחזיר תשובה.',
      'למשל דף התחברות, תמונה, או הודעה.',
      'במסלול, השרת הוא היעד שמקבל את הבקשה.'
    ],
    points: ['destination', 'מקבל בקשה', 'מחזיר תשובה', 'דף או קובץ']
  },
  {
    slug: 'concept-https',
    title: 'HTTPS - מושג 5',
    subtitle: 'מה מגן על המידע בדרך?',
    script: [
      'HTTPS היא שכבת הגנה לתוכן שעובר בדרך.',
      'אם יש סיסמה או פרטים אישיים, אנחנו רוצים שהם יהיו מוצפנים.',
      'HTTPS לא אומר שכל אתר בטוח, אבל הוא מקשה לקרוא את המידע באמצע.',
      'במשחק, HTTPS הוא ההגנה שמוסיפים למסלול.'
    ],
    points: ['encrypted=true', 'תוכן מוצפן', 'פחות חשוף', 'הגנה בדרך']
  }
];

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: 'inherit', ...options });
  if (result.status !== 0) throw new Error(`${command} failed with ${result.status}`);
}

function findKeys() {
  const keys = [
    process.env.GOOGLE_AI_API_KEY,
    process.env.GEMINI_API_KEY,
    process.env.GOOGLE_API_KEY
  ].filter(Boolean);
  const envFiles = [
    path.join(ROOT, '.env'),
    '/home/igrois/.openclaw/workspace/geoscale/backend/.env'
  ];
  for (const file of envFiles) {
    if (!fs.existsSync(file)) continue;
    const text = fs.readFileSync(file, 'utf8');
    for (const name of ['GOOGLE_AI_API_KEY', 'GEMINI_API_KEY', 'GOOGLE_API_KEY']) {
      const match = text.match(new RegExp(`^${name}=(.+)$`, 'm'));
      if (match) keys.push(match[1].replace(/^["']|["']$/g, '').trim());
    }
  }
  return [...new Set(keys)].filter(Boolean);
}

function esc(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function slideHtml(video, index) {
  const labels = ['מקור', 'DNS', 'יעד', 'בדיקה'];
  const pathText = ['10.0.0.23', 'school.example → IP', '203.0.113.24', 'Packet Risk'][index % 4];
  return `<!doctype html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; }
  body { margin: 0; width: ${WIDTH}px; height: ${HEIGHT}px; overflow: hidden; font-family: Arial, sans-serif; color: #e5f9ff; background: #061826; }
  .frame { position: relative; width: ${WIDTH}px; height: ${HEIGHT}px; padding: 58px 76px; background:
    radial-gradient(circle at 18% 18%, rgba(34,211,238,.34), transparent 28%),
    radial-gradient(circle at 78% 28%, rgba(16,185,129,.28), transparent 30%),
    linear-gradient(135deg, #07111f, #0f766e 58%, #0b1220); }
  .grid { position: absolute; inset: 0; opacity: .2; background-image: linear-gradient(rgba(255,255,255,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.12) 1px, transparent 1px); background-size: 56px 56px; }
  .top { position: relative; display: flex; justify-content: space-between; align-items: flex-start; gap: 30px; }
  .kicker { color: #67e8f9; font-size: 26px; font-weight: 800; letter-spacing: 0; }
  h1 { margin: 16px 0 0; font-size: 68px; line-height: 1.04; letter-spacing: 0; max-width: 720px; }
  h2 { margin: 18px 0 0; font-size: 34px; color: #ccfbf1; letter-spacing: 0; }
  .badge { direction: ltr; border: 2px solid rgba(255,255,255,.24); border-radius: 22px; padding: 20px 26px; background: rgba(8,47,73,.6); min-width: 270px; text-align: center; font-size: 28px; font-weight: 900; color: #fef3c7; }
  .network { position: relative; margin-top: 74px; height: 250px; display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 28px; align-items: center; }
  .node { position: relative; z-index: 2; min-height: 148px; border: 2px solid rgba(255,255,255,.22); border-radius: 26px; background: rgba(15,23,42,.78); padding: 26px; box-shadow: 0 24px 60px rgba(0,0,0,.26); }
  .node b { display: block; font-size: 30px; color: #a7f3d0; margin-bottom: 14px; }
  .node span { direction: ltr; display: block; font-size: 25px; color: #e0f2fe; font-weight: 800; }
  .line { position: absolute; top: 120px; left: 80px; right: 80px; height: 8px; border-radius: 999px; background: linear-gradient(90deg, #22d3ee, #fef3c7, #34d399); box-shadow: 0 0 26px rgba(34,211,238,.55); }
  .packet { position: absolute; top: 94px; right: ${760 - index * 175}px; width: 62px; height: 62px; border-radius: 18px; background: #fef08a; box-shadow: 0 0 28px rgba(254,240,138,.65); border: 4px solid #f59e0b; z-index: 3; }
  .points { position: absolute; right: 76px; left: 76px; bottom: 56px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
  .point { background: rgba(236,253,245,.1); border: 1px solid rgba(167,243,208,.28); border-radius: 18px; min-height: 78px; padding: 18px 20px; font-size: 24px; font-weight: 800; color: #ecfeff; display: flex; align-items: center; justify-content: center; text-align: center; }
  .active { background: rgba(254,243,199,.22); border-color: #fef08a; color: #fef9c3; }
</style>
</head>
<body>
  <section class="frame">
    <div class="grid"></div>
    <div class="top">
      <div>
        <div class="kicker">Cyber AI Builders · Lesson 6</div>
        <h1>${esc(video.title)}</h1>
        <h2>${esc(video.subtitle)}</h2>
      </div>
      <div class="badge">${esc(pathText)}</div>
    </div>
    <div class="network">
      <div class="line"></div>
      <div class="packet"></div>
      ${labels.map((label, i) => `<div class="node"><b>${esc(label)}</b><span>${esc(video.points[i] || '')}</span></div>`).join('')}
    </div>
    <div class="points">
      ${video.points.map((point, i) => `<div class="point ${i === index ? 'active' : ''}">${esc(point)}</div>`).join('')}
    </div>
  </section>
</body>
</html>`;
}

async function createNarration(video, audioPath) {
  const scriptPath = path.join(MARKETING, `cyber-city-lesson6-${video.slug}-packet-script.txt`);
  fs.writeFileSync(scriptPath, video.script.join('\n'));
  if (fs.existsSync(audioPath)) return audioPath;
  const keys = findKeys();
  const prompt = [
    'TTS in fluent natural Israeli Hebrew.',
    'Voice: clear, energetic, serious cyber instructor for kids age 12. No baby language.',
    'Read naturally with short pauses. Do not say punctuation names.',
    '',
    ...video.script
  ].join('\n');
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Leda' } } }
    }
  };
  for (const [index, key] of keys.entries()) {
    try {
      console.log(`TTS ${video.slug} (${index + 1}/${keys.length})`);
      const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-preview-tts:generateContent', {
        method: 'POST',
        headers: { 'x-goog-api-key': key, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(`${res.status} ${JSON.stringify(json).slice(0, 700)}`);
      const data = json?.candidates?.[0]?.content?.parts?.find(part => part.inlineData)?.inlineData?.data;
      if (!data) throw new Error('No audio data');
      const pcm = audioPath.replace(/\.mp3$/, '.pcm');
      const wav = audioPath.replace(/\.mp3$/, '.wav');
      fs.writeFileSync(pcm, Buffer.from(data, 'base64'));
      run(FFMPEG, ['-y', '-f', 's16le', '-ar', '24000', '-ac', '1', '-i', pcm, wav]);
      run(FFMPEG, ['-y', '-i', wav, '-b:a', '160k', audioPath]);
      return audioPath;
    } catch (error) {
      console.warn(`TTS failed for ${video.slug}: ${error.message}`);
    }
  }
  const seconds = Math.max(12, Math.ceil(video.script.join(' ').length / 17));
  console.warn(`Using silent narration for ${video.slug}`);
  run(FFMPEG, ['-y', '-f', 'lavfi', '-i', `anullsrc=channel_layout=mono:sample_rate=24000`, '-t', String(seconds), '-b:a', '96k', audioPath]);
  return audioPath;
}

function renderSlide(video, index, dir) {
  const htmlPath = path.join(dir, `slide-${index}.html`);
  const pngPath = path.join(dir, `slide-${index}.png`);
  fs.writeFileSync(htmlPath, slideHtml(video, index));
  run(CHROMIUM, [
    '--headless',
    '--no-sandbox',
    '--disable-gpu',
    `--window-size=${WIDTH},${HEIGHT}`,
    `--screenshot=${pngPath}`,
    `file://${htmlPath}`
  ]);
  return pngPath;
}

function makeVideo(video, slides, audioPath) {
  const listPath = path.join(FRAME_ROOT, `${video.slug}-concat.txt`);
  const outPath = path.join(MARKETING, `cyber-city-lesson6-${video.slug}.mp4`);
  const posterPath = path.join(MARKETING, `cyber-city-lesson6-${video.slug}-poster.jpg`);
  const duration = video.slug === 'overview' ? 5.25 : 4.25;
  fs.writeFileSync(listPath, [
    ...slides.flatMap(slide => [`file '${slide.replaceAll("'", "'\\''")}'`, `duration ${duration}`]),
    `file '${slides.at(-1).replaceAll("'", "'\\''")}'`
  ].join('\n'));
  run(FFMPEG, ['-y', '-f', 'concat', '-safe', '0', '-i', listPath, '-i', audioPath, '-shortest', '-r', '10', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', outPath]);
  run(FFMPEG, ['-y', '-i', slides[0], '-frames:v', '1', '-q:v', '2', posterPath]);
  return { outPath, posterPath };
}

fs.mkdirSync(MARKETING, { recursive: true });
fs.mkdirSync(FRAME_ROOT, { recursive: true });

const selectedSlug = process.env.VIDEO_SLUG;

for (const video of videos.filter(video => !selectedSlug || video.slug === selectedSlug)) {
  const dir = path.join(FRAME_ROOT, video.slug);
  fs.mkdirSync(dir, { recursive: true });
  const audioPath = path.join(MARKETING, `cyber-city-lesson6-${video.slug}-packet-narration.mp3`);
  await createNarration(video, audioPath);
  const slides = [0, 1, 2, 3].map(index => renderSlide(video, index, dir));
  const { outPath, posterPath } = makeVideo(video, slides, audioPath);
  console.log(`Rendered ${outPath}`);
  console.log(`Poster ${posterPath}`);
}
