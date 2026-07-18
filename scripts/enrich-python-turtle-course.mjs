import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const htmlPath = join(root, 'python-turtle.html');
let html = readFileSync(htmlPath, 'utf8');

function extractLessons(src) {
  const marker = 'const TURTLE_LESSONS = ';
  const start = src.indexOf(marker);
  if (start < 0) throw new Error('missing TURTLE_LESSONS');
  const arrayStart = start + marker.length;
  let depth = 0, inString = false, quote = '', escape = false, end = -1;
  for (let i = arrayStart; i < src.length; i++) {
    const ch = src[i];
    if (inString) {
      if (escape) escape = false;
      else if (ch === '\\') escape = true;
      else if (ch === quote) inString = false;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { inString = true; quote = ch; continue; }
    if (ch === '[') depth++;
    if (ch === ']') { depth--; if (depth === 0) { end = i + 1; break; } }
  }
  if (end < 0) throw new Error('could not parse lesson array');
  return { start: arrayStart, end, lessons: Function('return ' + src.slice(arrayStart, end))() };
}

const phaseById = (id) => {
  if (id <= 8) return {
    unit: 'יחידה 1 — בלוקים, תנועה וצורות ראשונות',
    approach: 'בלוקים קודם, הצצה קצרה לשורת Python שנוצרה',
    bridge: 'בלוק → שורת קוד מודגשת',
    level: 'בלוקים עם הצצה לקוד'
  };
  if (id <= 15) return {
    unit: 'יחידה 2 — לולאות, משתנים ודפוסים',
    approach: 'בנייה בבלוקים עם קריאת קוד מודרכת',
    bridge: 'משנים ערך אחד ורואים איך הקוד והציור משתנים',
    level: 'בלוקים + קריאת Python'
  };
  if (id <= 22) return {
    unit: 'יחידה 3 — דיבאג, קריאת קוד וחשיבה כמו מתכנתים',
    approach: 'קוראים קוד, מנבאים תוצאה, מתקנים באגים קטנים',
    bridge: 'מהציור בחזרה לקוד: מאתרים את השורה האחראית',
    level: 'קריאה ודיבאג מודרך'
  };
  if (id <= 27) return {
    unit: 'יחידה 4 — כרטיסי קוד אמיתי ופרויקטים מודרכים',
    approach: 'מרכיבים פתרון מבלוקים ומ־snippets קצרים של Python',
    bridge: 'כרטיס קוד אמיתי → שינוי בטוח → הרצה',
    level: 'מעבר לקוד אמיתי'
  };
  return {
    unit: 'יחידה 5 — פרויקט סיום והצגה',
    approach: 'תכנון, בנייה, בדיקות, שיפור והצגה כמו מפתחים צעירים',
    bridge: 'רעיון אישי → אלגוריתם → בלוקים/קוד → תוצר',
    level: 'פרויקט עצמאי מודרך'
  };
};

function vocabularyFor(lesson) {
  const base = [
    ['פקודה', 'הוראה אחת שהצב מבצע, למשל לזוז קדימה או להסתובב.'],
    ['הרצה', 'לחיצה על ▶️ כדי לבדוק מה התוכנית עושה באמת.'],
    ['דיבאג', 'למצוא איפה התוכנית לא עשתה מה שרצינו ולתקן צעד־צעד.']
  ];
  const concept = String(lesson.concept || '');
  const extra = [];
  if (/לולאה|דפוס|repeat/.test(concept) || lesson.blocks?.includes('repeat')) extra.push(['לולאה', 'דרך לבקש מהמחשב לחזור על אותן פקודות כמה פעמים.']);
  if (/משתנה|length/.test(concept) || lesson.blocks?.includes('length')) extra.push(['משתנה', 'שם ששומר ערך, למשל length, כדי להשתמש בו שוב ושוב.']);
  if (/זווית|פניות|כוכב|צורות/.test(concept + lesson.title)) extra.push(['זווית', 'כמה הצב מסתובב אחרי כל קו; הזווית קובעת את הצורה.']);
  if (/עט|צבע/.test(concept + lesson.title)) extra.push(['עט', 'הכלי שמחליט אם הצב משאיר קו, באיזה צבע ובאיזה עובי.']);
  if (lesson.id >= 16) extra.push(['ניבוי', 'לפני הרצה אומרים מה לדעתנו יקרה, ואז בודקים.']);
  if (lesson.id >= 23) extra.push(['snippet', 'חתיכת קוד קצרה שמותר להעתיק, לשנות ולהריץ בביטחון.']);
  return [...extra, ...base].slice(0, 6);
}

function exercisesFor(lesson) {
  const p = lesson.practice || [];
  const titles = [
    'חימום — מריצים ורואים',
    'קוראים את הבלוקים',
    'שינוי קטן ובטוח',
    'מחברים בלוק לקוד',
    'בדיקת מהנדסים',
    'דיבאג מכוון',
    'שדרוג יצירתי',
    'שיתוף והסבר',
    'אתגר למתקדמים',
    'רפלקציה קצרה'
  ];
  const fallback = [
    `בנו גרסה ראשונה של ${lesson.product || lesson.title} והריצו.`,
    `מצאו בקוד את השורה שקשורה ל־${lesson.concept}.`,
    'שנו מספר אחד בלבד והריצו שוב.',
    'שנו צבע או כיוון אחד בלבד ובדקו מה השתנה.',
    'בדקו שני מצבים שונים והשוו ביניהם.',
    'שברו בכוונה ערך אחד, הריצו, ואז תקנו.',
    'הוסיפו פרט אישי קטן לתוצר.',
    'הסבירו לחבר/ה מה הבלוק החשוב ביותר בתוכנית.',
    'בנו גרסה מורכבת יותר בלי להעתיק פתרון מלא.',
    'השלימו משפט: היום למדתי ש־___.׳'
  ];
  const prompts = Array.from({ length: 10 }, (_, i) => p[i] || fallback[i]);
  return prompts.map((prompt, i) => ({
    id: i + 1,
    minutes: ['18–24','24–31','31–39','39–47','47–56','56–64','64–72','72–80','80–86','86–90'][i],
    title: `תרגול ${i + 1} — ${titles[i]}`,
    prompt,
    hint: hintFor(lesson, i),
    check: checkFor(lesson, i),
    commonMistake: mistakeFor(lesson, i)
  }));
}

function hintFor(lesson, i) {
  const hints = [
    'אל תנסו לפתור הכל בבת אחת — גררו בלוק אחד, הריצו, ואז המשיכו.',
    `חפשו איפה מופיע הרעיון המרכזי של השיעור: ${lesson.concept}.`,
    'שינוי טוב הוא שינוי קטן: מספר אחד, צבע אחד או פנייה אחת.',
    'לחצו על בלוק וראו איזו שורת Python נדלקת בקוד.',
    'מהנדסים בודקים לפחות שני מצבים, לא רק הרצה אחת שעבדה במקרה.',
    'אם משהו נשבר — שאלו: האם הבעיה בכיוון, במספר, בלולאה או בסדר הפקודות?',
    'שדרוג יצירתי לא חייב להיות מסובך. לפעמים צבע, עובי או חזרה נוספת מספיקים.',
    'הסבר טוב מתחיל ב: “קודם הצב עושה…, ואז…”.',
    'האתגר פתוח, אבל עדיין צריך להשתמש במושג של השיעור.',
    'רפלקציה קצרה עוזרת לזכור: מה ניסיתי, מה עבד, ומה תיקנתי?'
  ];
  return hints[i];
}

function checkFor(lesson, i) {
  const checks = [
    'יש לפחות פקודת תנועה אחת והציור מופיע על המסך.',
    `התלמיד/ה יודע/ת להצביע על הבלוק או השורה שקשורים ל־${lesson.concept}.`,
    'אחרי שינוי קטן רואים שינוי ברור בתוצאה, בלי לשבור את כל התוכנית.',
    'כאשר בוחרים בלוק, שורת Python המתאימה מודגשת.',
    'התלמיד/ה בדק/ה לפחות שתי הרצות והשווה/השוותה ביניהן.',
    'הבאג תוקן והתלמיד/ה יודע/ת לומר מה הייתה הטעות.',
    `התוצר עדיין קשור למשימה: ${lesson.product || lesson.title}.`,
    'ההסבר כולל רצף: פקודה → תוצאה → תיקון או שיפור.',
    'האתגר משתמש במושג המרכזי ולא רק מוסיף קישוט.',
    'יש משפט סיכום אישי ומדויק.'
  ];
  return checks[i];
}

function mistakeFor(lesson, i) {
  const mistakes = [
    'מנסים לגרור הרבה בלוקים לפני הרצה ראשונה ואז קשה לדעת מה השפיע.',
    'מסתכלים רק על הציור ולא מחברים אותו לקוד שנוצר.',
    'משנים כמה דברים יחד ואז לא יודעים מה גרם לשינוי.',
    'לא שמים לב שהשורה המודגשת בקוד היא חלק מהלמידה, לא קישוט.',
    'בודקים רק מצב אחד ולכן חושבים שהפתרון תמיד עובד.',
    'מוחקים את כל הפתרון במקום לתקן בלוק/ערך קטן.',
    'מוסיפים קישוטים אבל מאבדים את מטרת השיעור.',
    'אומרים “זה עובד” בלי להסביר למה.',
    'קופצים לפתרון מורכב מדי לפני שהבסיס יציב.',
    'מסיימים בלי לנסח מה למדו ומה ירצו לשפר.'
  ];
  return mistakes[i];
}

function flowFor(lesson, phase) {
  return [
    { minutes: '0–8', title: 'פתיחת סיפור ומשימה', teacher: `מציגים את התוצר של היום: ${lesson.product || lesson.title}. שואלים מה הצב צריך לדעת לעשות כדי להגיע לשם.`, students: 'מנבאים אילו פקודות או בלוקים יעזרו ומנסחים יעד קצר.' },
    { minutes: '8–18', title: 'הדגמה קצרה בלי פתרון מלא', teacher: `מדגימים רק התחלה: בלוק אחד או שניים שמראים ${lesson.concept}. לא חושפים את כל הפתרון.`, students: 'עונים מה יקרה בהרצה לפני שלוחצים ▶️.' },
    { minutes: '18–34', title: 'בנייה מודרכת', teacher: 'מובילים את תרגילים 1–3 בקצב כיתה, עם עצירות ניבוי קצרות.', students: 'בונים, מריצים אחרי כל שינוי, ומתקנים אם הצב הלך לכיוון לא צפוי.' },
    { minutes: '34–48', title: 'בלוק → Python', teacher: `מחברים בין הבלוקים לשורות הקוד. מדגישים את הגשר: ${phase.bridge}.`, students: 'לוחצים על בלוק, מוצאים את השורה המודגשת, ומסבירים אותה במילים.' },
    { minutes: '48–64', title: 'תרגול עצמאי', teacher: 'נותנים לתלמידים לעבוד על תרגילים 5–7 בלי להראות פתרון מלא.', students: 'מבצעים שינוי קטן, מריצים, משווים ומתקנים.' },
    { minutes: '64–76', title: 'דיבאג ושיפור', teacher: 'נותנים באג נפוץ אחד ושואלים איך מאתרים אותו בלי למחוק הכל.', students: 'מתקנים מספר/זווית/סדר/לולאה ומסבירים מה השתנה.' },
    { minutes: '76–84', title: 'אתגר יצירתי קצר', teacher: 'פותחים בחירה אישית מוגבלת כדי לשמור על הצלחה: צבע, גודל, דפוס או פרט אישי.', students: 'משדרגים את התוצר בלי לאבד את מושג השיעור.' },
    { minutes: '84–90', title: 'שיתוף וסיכום', teacher: 'מבקשים 2–3 הצגות קצרות ומסכמים במבנה: רעיון → בלוקים → קוד → ציור.', students: 'משלימים משפט: “היום בניתי…, השתמשתי ב־…, ותיקנתי…”.' }
  ];
}

function enrichLesson(lesson) {
  const phase = phaseById(lesson.id);
  return {
    ...lesson,
    unit: phase.unit,
    level: phase.level,
    story: lesson.story || `הצב־רובוט מקבל משימה חדשה במעבדת פייתון: לבנות ${lesson.product || lesson.title} בעזרת פקודות קטנות, הרצות קצרות ותיקונים חכמים.`,
    mission: lesson.mission || `לבנות ${lesson.product || lesson.title} בעזרת ${lesson.concept}, ואז לזהות איך הבלוקים הופכים לקוד Python אמיתי.`,
    outcome: lesson.outcome || `${lesson.product || lesson.title} עובד, עם הסבר קצר של התלמיד/ה על הבלוק החשוב ועל שורת Python אחת.`,
    approach: phase.approach,
    bridge: phase.bridge,
    durationMinutes: 90,
    lessonFlow: flowFor(lesson, phase),
    exercises: exercisesFor(lesson),
    vocabulary: vocabularyFor(lesson),
    successCriteria: [
      `התוצר נראה כמו ${lesson.product || lesson.title} או גרסה אישית שלו.`,
      `נעשה שימוש מודע במושג: ${lesson.concept}.`,
      'התלמיד/ה הריץ/ה יותר מפעם אחת ושיפר/ה אחרי בדיקה.',
      'התלמיד/ה יודע/ת להצביע על בלוק אחד ועל שורת Python שנוצרה ממנו.'
    ],
    teacherQuestions: [
      'מה לדעתכם יקרה לפני שנריץ?',
      'איזה שינוי קטן הכי השפיע על הציור?',
      'איפה בקוד רואים את הבלוק שבחרתם?',
      'אם זה לא עבד — איך יודעים מה לבדוק קודם?'
    ],
    aiHelper: [
      `תן/י רעיון לשדרוג קל של ${lesson.product || lesson.title} בלי לפתור במקום התלמיד/ה.`,
      `הסבר/י לילד/ה בכיתה ה׳ מה זה ${lesson.concept} באמצעות הצב המצייר.`,
      'עזור/עזרי למצוא באג במספר, כיוון, לולאה או סדר פקודות בלי לתת פתרון מלא.'
    ]
  };
}

const { start, end, lessons } = extractLessons(html);
const enriched = lessons.map(enrichLesson);
html = html.slice(0, start) + JSON.stringify(enriched, null, 6) + html.slice(end);

const cssNeedle = '.student-steps li::before{content:\'✓ \';font-weight:900;color:#ea580c}';
const cssAdd = '.lesson-meta{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:10px 0}.lesson-meta div{background:#fff;border:1px solid #fed7aa;border-radius:14px;padding:9px}.lesson-section{margin:10px 0 0;padding:11px 13px;border-radius:16px;line-height:1.6}.lesson-section h3{margin:0 0 7px;font-size:1rem}.story-box{background:#eef2ff;border:1px solid #c7d2fe;color:#312e81}.exercise-card{background:#fff;border:1px solid #fed7aa;border-radius:15px;padding:10px;margin:8px 0}.exercise-card b{display:block;color:#9a3412}.exercise-card small{display:block;color:#64748b;margin-top:5px}.vocab-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.vocab-item{background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:9px}.criteria-list{margin:6px 0 0;padding-right:18px}.criteria-list li{margin:4px 0}';
if (!html.includes('.exercise-card')) html = html.replace(cssNeedle, cssNeedle + cssAdd);

const oldRender = `      const practice = (l.practice || []).map(step=>\`<li>\${escapeHtml(step)}</li>\`).join('');
      const timing = (l.timing || []).map(step=>\`<li>\${escapeHtml(step)}</li>\`).join('');
      const lessonUrl = \`python-turtle.html?lesson=\${l.id}\`;
      const slidesUrl = \`python-turtle-lesson-\${l.id}-slides.html\`;
      missionEl.innerHTML=\`<b>משימה \${l.id}: \${l.title}</b><br>\${escapeHtml(l.goal)}<br><small>מושג: \${escapeHtml(l.concept)} · תוצר: \${escapeHtml(l.product || 'ציור עובד')}</small><div class="lesson-links"><a href="\${lessonUrl}">🔗 לינק לשיעור \${l.id}</a><a class="slides" href="\${slidesUrl}">📽️ מצגת מדריך לשיעור \${l.id}</a></div>\${timing ? \`<div class="lesson-plan"><b>חומר ל־90 דקות:</b><ol>\${timing}</ol></div>\` : ''}\${practice ? \`<ul class="student-steps">\${practice}</ul>\` : ''}<small>טיפ: נסו לבד. כפתור “דוגמה” מציג פתרון רק אם נתקעתם.</small>\`;`;
const newRender = `      const practice = (l.practice || []).map(step=>\`<li>\${escapeHtml(step)}</li>\`).join('');
      const timing = (l.timing || []).map(step=>\`<li>\${escapeHtml(step)}</li>\`).join('');
      const flow = (l.lessonFlow || []).map(step=>\`<li><b>\${escapeHtml(step.minutes)} — \${escapeHtml(step.title)}</b><br><small>מורה: \${escapeHtml(step.teacher)}<br>תלמידים: \${escapeHtml(step.students)}</small></li>\`).join('');
      const exercises = (l.exercises || []).map(ex=>\`<div class="exercise-card"><b>\${escapeHtml(ex.title)}</b><span>\${escapeHtml(ex.prompt)}</span><small>רמז: \${escapeHtml(ex.hint)}<br>בדיקה: \${escapeHtml(ex.check)}<br>טעות נפוצה: \${escapeHtml(ex.commonMistake)}</small></div>\`).join('');
      const vocab = (l.vocabulary || []).map(([term, explanation])=>\`<div class="vocab-item"><b>\${escapeHtml(term)}</b><br><small>\${escapeHtml(explanation)}</small></div>\`).join('');
      const criteria = (l.successCriteria || []).map(item=>\`<li>\${escapeHtml(item)}</li>\`).join('');
      const lessonUrl = \`python-turtle.html?lesson=\${l.id}\`;
      const slidesUrl = \`python-turtle-lesson-\${l.id}-slides.html\`;
      missionEl.innerHTML=\`<b>משימה \${l.id}: \${escapeHtml(l.title)}</b><br>\${escapeHtml(l.mission || l.goal)}<div class="lesson-meta"><div><b>מושג</b><br>\${escapeHtml(l.concept)}</div><div><b>תוצר</b><br>\${escapeHtml(l.product || l.outcome || 'ציור עובד')}</div></div><div class="lesson-links"><a href="\${lessonUrl}">🔗 לינק לשיעור \${l.id}</a><a class="slides" href="\${slidesUrl}">📽️ מצגת מדריך לשיעור \${l.id}</a></div><div class="lesson-section story-box"><h3>סיפור השיעור</h3>\${escapeHtml(l.story || l.goal)}<br><b>תוצאה בסוף:</b> \${escapeHtml(l.outcome || l.product || '')}</div>\${flow ? \`<div class="lesson-plan"><b>חומר ל־90 דקות:</b><ol>\${flow}</ol></div>\` : (timing ? \`<div class="lesson-plan"><b>חומר ל־90 דקות:</b><ol>\${timing}</ol></div>\` : '')}\${exercises ? \`<div class="lesson-section"><h3>תרגולים לשיעור</h3>\${exercises}</div>\` : (practice ? \`<ul class="student-steps">\${practice}</ul>\` : '')}\${vocab ? \`<div class="lesson-section"><h3>מילון מושגים</h3><div class="vocab-grid">\${vocab}</div></div>\` : ''}\${criteria ? \`<div class="lesson-section"><h3>איך יודעים שהצלחנו?</h3><ul class="criteria-list">\${criteria}</ul></div>\` : ''}<small>טיפ: נסו לבד. כפתור “דוגמה” מציג פתרון רק אם נתקעתם.</small>\`;`;
if (!html.includes('תרגולים לשיעור')) {
  if (!html.includes(oldRender)) throw new Error('render block not found');
  html = html.replace(oldRender, newRender);
}

writeFileSync(htmlPath, html);

function escapeHtml(text) {
  return String(text ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

function slideDeck(lesson) {
  const flow = (lesson.lessonFlow || []).map(s => `<li><b>${escapeHtml(s.minutes)} — ${escapeHtml(s.title)}</b><br>${escapeHtml(s.teacher)}</li>`).join('\n');
  const exercises = (lesson.exercises || []).map(ex => `<li><b>${escapeHtml(ex.title)}:</b> ${escapeHtml(ex.prompt)}<br><small>רמז: ${escapeHtml(ex.hint)} | בדיקה: ${escapeHtml(ex.check)}</small></li>`).join('\n');
  const vocab = (lesson.vocabulary || []).map(([t,e]) => `<div class="card"><b>${escapeHtml(t)}</b><p>${escapeHtml(e)}</p></div>`).join('\n');
  const mistakes = (lesson.exercises || []).slice(0, 5).map(ex => `<li>${escapeHtml(ex.commonMistake)}</li>`).join('\n');
  const criteria = (lesson.successCriteria || []).map(c => `<li>${escapeHtml(c)}</li>`).join('\n');
  return `<!DOCTYPE html><html lang="he" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>מצגת מדריך — פייתון מצייר שיעור ${lesson.id}</title><link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700;800;900&display=swap" rel="stylesheet"><style>*{box-sizing:border-box}body{margin:0;font-family:Rubik,Arial,sans-serif;background:linear-gradient(135deg,#0f172a,#1e3a8a 55%,#0f766e);color:#0f172a;overflow:hidden}.deck{width:100vw;height:100vh;display:grid;place-items:center;padding:28px}.slide{display:none;width:min(1120px,100%);min-height:min(690px,calc(100vh - 116px));background:rgba(255,255,255,.97);border-radius:34px;padding:42px;box-shadow:0 28px 80px rgba(0,0,0,.34);overflow:auto}.slide.active{display:flex;flex-direction:column;justify-content:center}.kicker{font-weight:900;color:#0f766e;margin-bottom:10px}.emoji{font-size:5rem}h1{font-size:clamp(2.2rem,6vw,4.5rem);margin:0 0 14px;line-height:1.05}h2{font-size:clamp(1.9rem,5vw,3.4rem);margin:0 0 18px}p,li{font-size:clamp(1.02rem,1.7vw,1.32rem);line-height:1.55}.cards{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}.card{background:#f8fafc;border-right:7px solid #22c55e;border-radius:18px;padding:16px}.note{background:#fff7ed;border-right:7px solid #fb923c;border-radius:18px;padding:14px;margin-top:12px}.nav{position:fixed;inset:auto 24px 24px 24px;display:grid;grid-template-columns:auto 1fr auto;gap:12px;align-items:center;color:white;font-weight:900;pointer-events:none}.nav>*{pointer-events:auto}button,.back{border:0;border-radius:999px;background:white;color:#0f766e;padding:12px 18px;font-weight:900;text-decoration:none;cursor:pointer}small{color:#475569}.counter{justify-self:center;background:rgba(0,0,0,.28);padding:10px 16px;border-radius:999px}@media(max-width:760px){body{overflow:auto}.deck{height:auto;min-height:100svh;padding:12px 10px 88px}.slide{min-height:calc(100svh - 105px);padding:22px 16px;border-radius:22px}.slide.active{justify-content:flex-start}.cards{grid-template-columns:1fr}.nav{inset:auto 10px 10px 10px;display:flex;justify-content:space-between;background:rgba(8,17,31,.65);border-radius:999px;padding:8px}.counter{display:none}button,.back{padding:9px 10px;font-size:.84rem}}@media print{body{background:white;overflow:auto}.nav{display:none}.deck{display:block;height:auto}.slide{display:block;box-shadow:none;border:1px solid #ddd;break-after:page}}</style></head><body><main class="deck" id="deck"><section class="slide active"><div class="emoji">🐢</div><div class="kicker">פייתון מצייר • שיעור ${lesson.id} מתוך 30 • 90 דקות</div><h1>${escapeHtml(lesson.title)}</h1><p>${escapeHtml(lesson.story)}</p></section><section class="slide"><h2>🎯 מטרות ותוצר</h2><div class="cards"><div class="card"><b>מושג מרכזי</b><p>${escapeHtml(lesson.concept)}</p></div><div class="card"><b>תוצר השיעור</b><p>${escapeHtml(lesson.product || lesson.outcome)}</p></div><div class="card"><b>משימה</b><p>${escapeHtml(lesson.mission)}</p></div><div class="card"><b>גישה פדגוגית</b><p>${escapeHtml(lesson.approach)}</p></div></div><div class="note">מבחינת הילדים זה שיעור עצמאי. לא מציגים את כל הסילבוס — רק את המשימה של היום.</div></section><section class="slide"><h2>⏱️ מבנה 90 דקות</h2><ol>${flow}</ol></section><section class="slide"><h2>🧪 הרבה תרגולים לשיעור</h2><ol>${exercises}</ol></section><section class="slide"><h2>📚 מילון מושגים</h2><div class="cards">${vocab}</div></section><section class="slide"><h2>👩‍🏫 דגשי מדריך</h2><ul>${(lesson.teacherTips || []).map(t => `<li>${escapeHtml(t)}</li>`).join('')}</ul><div class="note">עיקרון מוביל: לא מראים פתרון מלא. בונים ביטחון דרך ניסוי, הרצה, ניבוי ותיקון.</div></section><section class="slide"><h2>🛠️ טעויות נפוצות ודיבאג</h2><ul>${mistakes}</ul><div class="note">לא מתקנים לילדים בידיים. שואלים: איפה הצב סטה? איזה בלוק/שורה אחראים לזה?</div></section><section class="slide"><h2>✅ איך יודעים שהצלחנו?</h2><ul>${criteria}</ul></section><section class="slide"><h2>🏁 סיום שיעור</h2><p>כל ילד משלים: “היום בניתי ___, השתמשתי ב־___, ותיקנתי ___.”</p><p><a href="python-turtle.html?lesson=${lesson.id}">פתח את שיעור ${lesson.id} בלומדה</a></p></section></main><nav class="nav"><button onclick="prevSlide()">→ הקודם</button><span class="counter" id="counter"></span><div><button onclick="nextSlide()">הבא ←</button> <a class="back" href="python-turtle.html?lesson=${lesson.id}">ללומדה</a> <a class="back" href="python-turtle-slides.html">אינדקס</a></div></nav><script>let current=0;const slides=[...document.querySelectorAll('.slide')];function render(){slides.forEach((s,i)=>s.classList.toggle('active',i===current));document.getElementById('counter').textContent=(current+1)+' / '+slides.length}function nextSlide(){current=Math.min(current+1,slides.length-1);render()}function prevSlide(){current=Math.max(current-1,0);render()}document.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key===' ')nextSlide();if(e.key==='ArrowRight')prevSlide()});render()</script></body></html>`;
}

for (const lesson of enriched) {
  writeFileSync(join(root, `python-turtle-lesson-${lesson.id}-slides.html`), slideDeck(lesson));
}

// Refresh overview cards with richer fields without changing design too much.
const coursePath = join(root, 'python-turtle-course.html');
let course = readFileSync(coursePath, 'utf8');
const cards = enriched.map(l => `
        <article class="lesson-card">
          <div class="num">${l.id}</div>
          <div class="card-body">
            <h2>${escapeHtml(l.title)}</h2>
            <p class="goal">${escapeHtml(l.mission)}</p>
            <p><b>יחידה:</b> ${escapeHtml(l.unit)}<br><b>מושג:</b> ${escapeHtml(l.concept)} · <b>תוצר:</b> ${escapeHtml(l.product || 'ציור עובד')}</p>
            <div class="chips"><span>${escapeHtml(l.level)}</span>${(l.blocks||[]).slice(0,4).map(b=>`<span>${escapeHtml(b)}</span>`).join('')}</div>
            <div class="links">
              <a class="primary" href="python-turtle.html?lesson=${l.id}">פתחו שיעור ${l.id}</a>
              <a href="python-turtle-lesson-${l.id}-slides.html">מצגת מדריך</a>
            </div>
          </div>
        </article>`).join('');
course = course.replace(/<section class="grid" aria-label="רשימת שיעורי הקורס">[\s\S]*?\n    <\/section>/, `<section class="grid" aria-label="רשימת שיעורי הקורס">${cards}
    </section>`);
writeFileSync(coursePath, course);

console.log(`Enriched ${enriched.length} Python Turtle lessons`);
