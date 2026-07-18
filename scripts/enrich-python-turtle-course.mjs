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
    'תרגול דיוק',
    'דיבאג מכוון',
    'שדרוג יצירתי',
    'קריאת Python בקול',
    'עבודה בזוגות',
    'אתגר למתקדמים',
    'בדיקת איכות',
    'הכנה להצגה',
    'רפלקציה קצרה'
  ];
  const fallback = [
    `בנו גרסה ראשונה של ${lesson.product || lesson.title} והריצו.`,
    `מצאו בקוד את השורה שקשורה ל־${lesson.concept}.`,
    'שנו מספר אחד בלבד והריצו שוב. תארו מה השתנה בציור.',
    'לחצו על בלוק אחד ומצאו את שורת ה־Python שהוא יצר.',
    'בדקו שני מצבים שונים והשוו ביניהם לפני שממשיכים.',
    'שפרו דיוק: התאימו אורך, זווית או מספר חזרות עד שהתוצר נראה ברור.',
    'צרו באג קטן בכוונה — מספר לא מתאים, כיוון לא נכון או בלוק חסר — ואז תקנו.',
    'הוסיפו פרט אישי קטן לתוצר בלי לשנות את מטרת השיעור.',
    'קראו בקול 3 שורות Python והסבירו מה הצב עושה בכל אחת.',
    'עבדו בזוג: אחד מנבא מה יקרה, השני מריץ ובודק אם הניבוי נכון.',
    'בנו גרסה מורכבת יותר שמשתמשת במושג המרכזי של השיעור לפחות פעמיים.',
    'בדקו שהתוכנית עובדת אחרי איפוס והרצה מחדש, לא רק פעם אחת.',
    'הכינו משפט הצגה: מה בניתי, באיזה בלוק השתמשתי, ואיפה רואים את זה בקוד.',
    'השלימו משפט: היום למדתי ש־___, ובפעם הבאה אשפר ___.'
  ];
  const prompts = Array.from({ length: 14 }, (_, i) => p[i] || fallback[i]);
  return prompts.map((prompt, i) => ({
    id: i + 1,
    minutes: ['18–23','23–28','28–34','34–40','40–47','47–53','53–60','60–66','66–71','71–76','76–81','81–85','85–88','88–90'][i],
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
    'קראו את הקוד כאילו הוא הוראות לצב, לא כמו טקסט זר.',
    'בזוגות — אחד מדבר ואחד נוגע במחשב, ואז מחליפים.',
    'האתגר פתוח, אבל עדיין צריך להשתמש במושג של השיעור.',
    'בדיקת איכות טובה מתחילה מאיפוס והרצה נקייה.',
    'הצגה קצרה עדיפה על הסבר ארוך ומבולבל.',
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
    'התלמיד/ה קרא/ה 3 שורות Python והסביר/ה אותן במילים.',
    'הזוג ביצע ניבוי ואז בדיקה בפועל.',
    'האתגר משתמש במושג המרכזי ולא רק מוסיף קישוט.',
    'התוכנית עובדת גם אחרי איפוס והרצה מחדש.',
    'יש משפט הצגה שמחבר תוצר, בלוק וקוד.',
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
    'קוראים את הקוד מהר מדי בלי להבין את סדר הפעולות.',
    'בן/בת זוג אחד עושה הכל והשני לא מסביר.',
    'קופצים לפתרון מורכב מדי לפני שהבסיס יציב.',
    'לא מאפסים לפני בדיקה ולכן תוצאה ישנה מבלבלת.',
    'מציגים רק את הציור ולא מסבירים את הקשר לבלוקים ולקוד.',
    'מסיימים בלי לנסח מה למדו ומה ירצו לשפר.'
  ];
  return mistakes[i];
}

function flowFor(lesson, phase) {
  return [
    { minutes: '0–8', title: 'פתיחת סיפור ומשימה', teacher: `מציגים את התוצר של היום: ${lesson.product || lesson.title}. שואלים מה הצב צריך לדעת לעשות כדי להגיע לשם.`, students: 'מנבאים אילו פקודות או בלוקים יעזרו ומנסחים יעד קצר.' },
    { minutes: '8–18', title: 'הדגמה קצרה בלי פתרון מלא', teacher: `מדגימים רק התחלה: בלוק אחד או שניים שמראים ${lesson.concept}. לא חושפים את כל הפתרון.`, students: 'עונים מה יקרה בהרצה לפני שלוחצים ▶️.' },
    { minutes: '18–34', title: 'בנייה מודרכת', teacher: 'מובילים את תרגילים 1–4 בקצב כיתה, עם עצירות ניבוי קצרות.', students: 'בונים, מריצים אחרי כל שינוי, ומתקנים אם הצב הלך לכיוון לא צפוי.' },
    { minutes: '34–48', title: 'בלוק → Python', teacher: `מחברים בין הבלוקים לשורות הקוד. מדגישים את הגשר: ${phase.bridge}.`, students: 'לוחצים על בלוק, מוצאים את השורה המודגשת, ומסבירים אותה במילים.' },
    { minutes: '48–64', title: 'תרגול עצמאי', teacher: 'נותנים לתלמידים לעבוד על תרגילים 5–10 בלי להראות פתרון מלא.', students: 'מבצעים שינוי קטן, מריצים, משווים ומתקנים.' },
    { minutes: '64–76', title: 'דיבאג ושיפור', teacher: 'נותנים באג נפוץ אחד ושואלים איך מאתרים אותו בלי למחוק הכל.', students: 'מתקנים מספר/זווית/סדר/לולאה ומסבירים מה השתנה.' },
    { minutes: '76–84', title: 'אתגר יצירתי קצר', teacher: 'פותחים בחירה אישית מוגבלת כדי לשמור על הצלחה: צבע, גודל, דפוס או פרט אישי.', students: 'משדרגים את התוצר בלי לאבד את מושג השיעור.' },
    { minutes: '84–90', title: 'שיתוף וסיכום', teacher: 'מבקשים 2–3 הצגות קצרות ומסכמים במבנה: רעיון → בלוקים → קוד → ציור.', students: 'משלימים משפט: “היום בניתי…, השתמשתי ב־…, ותיקנתי…”.' }
  ];
}

const playfulOverrides = {
  1: {"unit": "יחידה 1 — הצב מתעורר: צעדים ראשונים בקוד", "title": "הצב הרובוט יוצא למסלול", "concept": "פקודה", "product": "מסלול רובוט קצר", "story": "הצב הרובוט התעורר במעבדת הקוד. הוא לא יודע לזוז לבד — הילדים נותנים לו פקודות קטנות ורואים מיד מה קורה.", "mission": "להזיז את הצב קדימה, לסובב אותו, ולבנות מסלול קטן שמרגיש כמו שליטה ראשונה ברובוט.", "outcome": "מסלול צבעוני קצר עם לפחות שתי פניות והסבר של פקודת forward אחת.", "level": "קליל וחווייתי לגיל 10–11"},
  2: {"unit": "יחידה 1 — הצב מתעורר: צעדים ראשונים בקוד", "title": "מדרגות הקוד", "concept": "סדר פעולות", "product": "מסלול מדרגות", "story": "הצב רוצה לטפס על מדרגות דמיוניות. אם הפקודות לא בסדר — הוא הולך לאיבוד.", "mission": "לבנות מסלול מדרגות בעזרת קדימה, ימינה ושמאלה, ולהבין למה סדר הפקודות משנה.", "outcome": "מדרגות רובוטיות ברורות עם לפחות 4 פניות.", "level": "קליל וחווייתי לגיל 10–11"},
  3: {"unit": "יחידה 1 — הצב מתעורר: צעדים ראשונים בקוד", "title": "מפעל הצורות", "concept": "לולאה", "product": "גלריית צורות", "story": "במפעל הצורות לא מציירים כל צלע ביד. הצב לומד לחזור על פעולה ולייצר צורה מושלמת.", "mission": "ליצור משולש, ריבוע ומשושה בעזרת repeat וזוויות פשוטות.", "outcome": "גלריית 3 צורות שונות עם צבעים.", "level": "קליל וחווייתי לגיל 10–11"},
  4: {"unit": "יחידה 1 — הצב מתעורר: צעדים ראשונים בקוד", "title": "סטודיו צבעים ועובי קו", "concept": "עט וצבע", "product": "ציור צבעוני ראשון", "story": "הצב נכנס לסטודיו אומנות. הפעם לא רק זזים — בוחרים צבעים, עובי קו וסגנון.", "mission": "לשנות צבע, עובי עט, ולהפוך מסלול פשוט לציור אישי.", "outcome": "ציור צבעוני עם לפחות 3 צבעים ושני עוביי קו.", "level": "קליל וחווייתי לגיל 10–11"},
  5: {"unit": "יחידה 1 — הצב מתעורר: צעדים ראשונים בקוד", "title": "טלפורט בלי קו", "concept": "הרמת עט", "product": "שני ציורים נפרדים", "story": "הצב מגלה טריק קסם: אפשר לעבור מקום בלי להשאיר סימן. זה כמו טלפורט בציור.", "mission": "להשתמש בהרם עט והורד עט כדי לצייר שני חלקים נפרדים באותו דף.", "outcome": "שני איים או סמלים נפרדים בלי קו מחבר ביניהם.", "level": "קליל וחווייתי לגיל 10–11"},
  6: {"unit": "יחידה 2 — סטודיו אומנות ודפוסים", "title": "סרגל הקסם length", "concept": "משתנה", "product": "צורה שמשנה גודל", "story": "במקום לשנות הרבה מספרים, הילדים נותנים שם למספר: length. שינוי אחד משנה את כל הציור.", "mission": "להשתמש במשתנה length כדי לשלוט בגודל של צורה שלמה.", "outcome": "אותה צורה בשלושה גדלים שונים בעזרת שינוי אחד.", "level": "קליל וחווייתי לגיל 10–11"},
  7: {"unit": "יחידה 2 — סטודיו אומנות ודפוסים", "title": "גדר צבעונית לעיר", "concept": "דפוס חוזר", "product": "גדר/מסילה חוזרת", "story": "העיר צריכה גדר צבעונית לפארק. הצב בונה יחידה קטנה וחוזר עליה כמו מכונה.", "mission": "לבנות דפוס קצר שחוזר כמה פעמים ולהפוך אותו לגדר או מסילה.", "outcome": "דפוס חוזר שנראה כמו גדר, מסילה או קישוט.", "level": "קליל וחווייתי לגיל 10–11"},
  8: {"unit": "יחידה 2 — סטודיו אומנות ודפוסים", "title": "ספירלת החלל", "concept": "משתנה משתנה", "product": "ספירלה", "story": "הצב טס לחלל ומשאיר אחריו שביל שהולך וגדל. כל סיבוב קצת ארוך יותר.", "mission": "להגדיל את length תוך כדי לולאה וליצור ספירלה מגניבה.", "outcome": "ספירלה צבעונית שמתחילה קטן וגדלה.", "level": "קליל וחווייתי לגיל 10–11"},
  9: {"unit": "יחידה 2 — סטודיו אומנות ודפוסים", "title": "כוכב במהירות האור", "concept": "זוויות", "product": "כוכב", "story": "הצב הופך לאסטרונאוט ומצייר כוכב. אם הזווית לא מדויקת — הכוכב מתפרק.", "mission": "לגלות איך זווית יוצרת כוכב ולשחק עם מספרי פנייה.", "outcome": "כוכב ברור ועוד כוכב ניסיוני.", "level": "קליל וחווייתי לגיל 10–11"},
  10: {"unit": "יחידה 2 — סטודיו אומנות ודפוסים", "title": "חדר בריחה של באגים", "concept": "דיבאג", "product": "ציור מתוקן", "story": "הציור נשבר! הילדים נכנסים לחדר בריחה של באגים ומתקנים מספרים, פניות וסדר פקודות.", "mission": "למצוא באגים קטנים בציור ולתקן בלי למחוק הכל.", "outcome": "לפחות 3 באגים מתוקנים והסבר קצר לכל תיקון.", "level": "קליל וחווייתי לגיל 10–11"},
  11: {"unit": "יחידה 3 — עיר חכמה מצוירת", "title": "מפת שכונה קטנה", "concept": "תכנון מסלול", "product": "מפה פשוטה", "story": "הצב נהיה מתכנן ערים. הוא מצייר רחובות, פינות ושבילים לשכונה קטנה.", "mission": "לתכנן מפה על דף ואז לבנות אותה בקוד עם קווים ופניות.", "outcome": "מפת שכונה עם כביש, פנייה ובית או פארק.", "level": "קליל וחווייתי לגיל 10–11"},
  12: {"unit": "יחידה 3 — עיר חכמה מצוירת", "title": "רמזור וצומת", "concept": "צבעים כמסר", "product": "צומת עם רמזור", "story": "בצומת חכם צבעים הם לא קישוט — הם מסר. אדום, צהוב וירוק עוזרים להבין מה קורה.", "mission": "לצייר צומת פשוט ולהוסיף רמזור צבעוני בעזרת פקודות עט.", "outcome": "צומת עם רמזור ברור בשלושה צבעים.", "level": "קליל וחווייתי לגיל 10–11"},
  13: {"unit": "יחידה 3 — עיר חכמה מצוירת", "title": "שכונת בתים", "concept": "תבנית חוזרת", "product": "רחוב בתים", "story": "במקום לבנות כל בית מחדש, חושבים כמו מתכנתים: בית הוא תבנית שאפשר לחזור עליה.", "mission": "לבנות בית פשוט ואז לשכפל רעיון של בית לאורך רחוב.", "outcome": "רחוב עם לפחות 3 בתים דומים אבל לא זהים.", "level": "קליל וחווייתי לגיל 10–11"},
  14: {"unit": "יחידה 3 — עיר חכמה מצוירת", "title": "פארק הרובוטים", "concept": "קומפוזיציה", "product": "פארק מצויר", "story": "העיר מקבלת פארק: שבילים, עצים, גדר ואולי מזרקה. כל חלק הוא קוד קטן.", "mission": "לחבר כמה צורות ודפוסים לתמונה אחת של פארק.", "outcome": "פארק רובוטים עם 4 פרטים לפחות.", "level": "קליל וחווייתי לגיל 10–11"},
  15: {"unit": "יחידה 3 — עיר חכמה מצוירת", "title": "סמל אישי לעיר", "concept": "מיני־פרויקט", "product": "סמל אישי", "story": "הילדים מעצבים סמל לעיר החכמה שלהם — משהו שמייצג אותם בקוד.", "mission": "לתכנן ולבנות סמל אישי שמשלב צורה, צבע, דפוס ומשתנה.", "outcome": "סמל אישי להצגה קצרה בכיתה.", "level": "קליל וחווייתי לגיל 10–11"},
  16: {"unit": "יחידה 4 — משחקונים ואתגרי רובוט", "title": "מבוך: הצב מחפש בית", "concept": "מסלול ואתגר", "product": "מבוך פשוט", "story": "הצב תקוע במבוך ורוצה להגיע לבית. הילדים כותבים לו הוראות כמו GPS קטן.", "mission": "לבנות מסלול שמוביל את הצב מנקודת התחלה לבית בלי לסטות.", "outcome": "מבוך מצויר עם פתרון מסלול.", "level": "קליל וחווייתי לגיל 10–11"},
  17: {"unit": "יחידה 4 — משחקונים ואתגרי רובוט", "title": "אוצר הכוכבים", "concept": "יעד ומשימה", "product": "מסלול לאוצר", "story": "על הדף מסתתרים כוכבים. הצב צריך להגיע לאוצר ולסמן את הדרך.", "mission": "לתכנן מסלול שמגיע ליעד ומוסיף סימון או כוכב בסוף.", "outcome": "מסלול אוצר עם נקודת התחלה, דרך וסיום.", "level": "קליל וחווייתי לגיל 10–11"},
  18: {"unit": "יחידה 4 — משחקונים ואתגרי רובוט", "title": "מרוץ קווים", "concept": "דיוק ומהירות", "product": "מסלול מרוץ", "story": "הצב משתתף במרוץ קווים. צריך מסלול ברור, סיבובים, וקו סיום.", "mission": "לבנות מסלול מרוץ בעזרת קווים, פניות וסימוני התחלה/סיום.", "outcome": "מסלול מרוץ קטן שאפשר להסביר לחבר.", "level": "קליל וחווייתי לגיל 10–11"},
  19: {"unit": "יחידה 4 — משחקונים ואתגרי רובוט", "title": "קוד סודי בציור", "concept": "סימנים וקוד", "product": "ציור עם מסר סודי", "story": "הצב מצייר סימנים שמסתירים הודעה. הילדים מחברים בין קוד, צבע וצורה.", "mission": "לבנות ציור שבו צבעים או צורות מייצגים מסר פשוט.", "outcome": "מסר סודי מצויר עם מפתח פענוח.", "level": "קליל וחווייתי לגיל 10–11"},
  20: {"unit": "יחידה 4 — משחקונים ואתגרי רובוט", "title": "אתגר העיר: כביש, בית, פארק", "concept": "שילוב מערכות", "product": "מיני־עיר", "story": "הילדים מחברים את מה שלמדו לעיר קטנה: כביש, בית, פארק וסימן אישי.", "mission": "לבנות מיני־עיר בקוד עם כמה חלקים נפרדים.", "outcome": "מיני־עיר עם לפחות 5 רכיבים.", "level": "קליל וחווייתי לגיל 10–11"},
  21: {"unit": "יחידה 5 — אנימציה וסיפור בתנועה", "title": "שמש זורחת בקוד", "concept": "סיפור חזותי", "product": "סצנת זריחה", "story": "הצב מספר סיפור: שמש עולה, שמיים משתנים וקו אופק מופיע.", "mission": "לבנות סצנה שמרגישה כמו רגע בסיפור, לא רק צורה.", "outcome": "ציור זריחה או שקיעה עם רקע, שמש ופרטים.", "level": "קליל וחווייתי לגיל 10–11"},
  22: {"unit": "יחידה 5 — אנימציה וסיפור בתנועה", "title": "מכונית נוסעת בעיר", "concept": "תנועה מדומיינת", "product": "מכונית וכביש", "story": "גם בלי אנימציה אמיתית, אפשר לגרום לציור להרגיש בתנועה: כביש, גלגלים וסימני נסיעה.", "mission": "לצייר מכונית פשוטה על כביש עם סימני תנועה.", "outcome": "סצנת מכונית שנראית כאילו היא נוסעת.", "level": "קליל וחווייתי לגיל 10–11"},
  23: {"unit": "יחידה 5 — אנימציה וסיפור בתנועה", "title": "סיפור בשלושה פריימים", "concept": "רצף", "product": "קומיקס קוד קצר", "story": "הילדים בונים קומיקס קטן: התחלה, אמצע וסוף — כל פריים הוא ציור בקוד.", "mission": "ליצור שלושה אזורים או פריימים שמספרים סיפור קצר.", "outcome": "קומיקס קוד עם 3 פריימים.", "level": "קליל וחווייתי לגיל 10–11"},
  24: {"unit": "יחידה 5 — אנימציה וסיפור בתנועה", "title": "פוסטר אירוע", "concept": "עיצוב בקוד", "product": "פוסטר", "story": "הצב הופך למעצב גרפי: כותרת דמיונית, מסגרת, סמלים וצבעים.", "mission": "לעצב פוסטר לאירוע דמיוני בעזרת צורות, מסגרות וצבעים.", "outcome": "פוסטר קוד לאירוע בכיתה, בעיר או בחלל.", "level": "קליל וחווייתי לגיל 10–11"},
  25: {"unit": "יחידה 5 — אנימציה וסיפור בתנועה", "title": "אתגר חופשי מודרך", "concept": "בחירה", "product": "יצירה אישית", "story": "הילדים בוחרים עולם: חלל, עיר, משחק, חיה, סמל או סיפור — אבל עובדים לפי גבולות ברורים.", "mission": "לבחור רעיון אישי ולבנות אותו בשלבים עם רשימת דרישות קטנה.", "outcome": "יצירה אישית ראשונה עם תכנון ובדיקות.", "level": "קליל וחווייתי לגיל 10–11"},
  26: {"unit": "יחידה 6 — מעבר לקוד אמיתי", "title": "כרטיסי Python אמיתי", "concept": "snippet", "product": "קוד מורכב מכרטיסים", "story": "עכשיו מציצים יותר עמוק: כרטיסי קוד קטנים שאפשר לקרוא, לשנות ולהריץ.", "mission": "להרכיב ציור מכרטיסי Python קצרים ולשנות ערכים בביטחון.", "outcome": "ציור שנבנה מ־snippets עם שינוי אישי.", "level": "קליל וחווייתי לגיל 10–11"},
  27: {"unit": "יחידה 6 — מעבר לקוד אמיתי", "title": "פונקציה קטנה, כוח גדול", "concept": "פונקציה", "product": "תבנית חוזרת", "story": "מתכנתים עצלנים בחכמה: אם יש משהו שחוזר, נותנים לו שם ומשתמשים בו שוב.", "mission": "להבין פונקציה כרעיון: תבנית פעולה שאפשר להפעיל כמה פעמים.", "outcome": "ציור עם תבנית שחוזרת בכמה מקומות.", "level": "קליל וחווייתי לגיל 10–11"},
  28: {"unit": "יחידה 6 — מעבר לקוד אמיתי", "title": "מעבדת שיפורים", "concept": "בדיקות ושיפור", "product": "גרסה משופרת", "story": "כמו מפתחים אמיתיים, לא מסתפקים בגרסה ראשונה. בודקים, מקבלים רעיון ומשפרים.", "mission": "לקחת יצירה קיימת ולשפר אותה לפי רשימת בדיקות.", "outcome": "לפני/אחרי: גרסה משופרת עם הסבר.", "level": "קליל וחווייתי לגיל 10–11"},
  29: {"unit": "יחידה 6 — מעבר לקוד אמיתי", "title": "תכנון פרויקט גמר", "concept": "תכנון", "product": "תוכנית פרויקט", "story": "לפני שבונים פרויקט גדול, מתכננים: מה יהיה במסך, איזה בלוקים צריך, ומה בודקים.", "mission": "לתכנן פרויקט סיום אישי עם סקיצה, רשימת פקודות ויעדי הצלחה.", "outcome": "דף תכנון לפרויקט גמר.", "level": "קליל וחווייתי לגיל 10–11"},
  30: {"unit": "יחידה 6 — מעבר לקוד אמיתי", "title": "פסטיבל פרויקטים", "concept": "פרויקט סיום", "product": "פרויקט גמר קצר", "story": "שיעור חגיגה: כל ילד מציג יצירה אישית — משחקון, עיר, פוסטר, סיפור או ציור קוד.", "mission": "לבנות ולהציג פרויקט אישי שמחבר כמה רעיונות מהקורס.", "outcome": "פרויקט סיום קצר ומוצג בכיתה.", "level": "קליל וחווייתי לגיל 10–11"},
};

function enrichLesson(lesson) {
  lesson = {...lesson, ...(playfulOverrides[lesson.id] || {})};
  const phase = phaseById(lesson.id);
  return {
    ...lesson,
    unit: lesson.unit || phase.unit,
    level: lesson.level || phase.level,
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
  const exerciseChunks = [[0, 5], [5, 10], [10, 14]];
  const exerciseSlides = exerciseChunks.map(([from, to]) => {
    const chunk = (lesson.exercises || []).slice(from, to);
    if (!chunk.length) return '';
    const items = chunk.map(ex => `<li><b>${escapeHtml(ex.title)}:</b> ${escapeHtml(ex.prompt)}<br><small>רמז: ${escapeHtml(ex.hint)}<br>בדיקה: ${escapeHtml(ex.check)}</small></li>`).join('\\n');
    return `<section class="slide exercise-slide"><h2>🧪 הרבה תרגולים לשיעור — ${from + 1}–${from + chunk.length}</h2><ol>${items}</ol></section>`;
  }).join('');
  const vocab = (lesson.vocabulary || []).map(([t,e]) => `<div class="card"><b>${escapeHtml(t)}</b><p>${escapeHtml(e)}</p></div>`).join('\n');
  const mistakes = (lesson.exercises || []).slice(0, 5).map(ex => `<li>${escapeHtml(ex.commonMistake)}</li>`).join('\n');
  const criteria = (lesson.successCriteria || []).map(c => `<li>${escapeHtml(c)}</li>`).join('\n');
  return `<!DOCTYPE html><html lang="he" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>מצגת מדריך — פייתון מצייר שיעור ${lesson.id}</title><link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700;800;900&display=swap" rel="stylesheet"><style>*{box-sizing:border-box}body{margin:0;font-family:Rubik,Arial,sans-serif;background:linear-gradient(135deg,#0f172a,#1e3a8a 55%,#0f766e);color:#0f172a;overflow:hidden}.deck{width:100vw;height:100vh;display:grid;place-items:center;padding:28px}.slide{display:none;width:min(1120px,100%);min-height:min(690px,calc(100vh - 116px));background:rgba(255,255,255,.97);border-radius:34px;padding:42px;box-shadow:0 28px 80px rgba(0,0,0,.34);overflow:auto}.slide.active{display:flex;flex-direction:column;justify-content:center}.kicker{font-weight:900;color:#0f766e;margin-bottom:10px}.emoji{font-size:5rem}h1{font-size:clamp(2.2rem,6vw,4.5rem);margin:0 0 14px;line-height:1.05}h2{font-size:clamp(1.9rem,5vw,3.4rem);margin:0 0 18px}p,li{font-size:clamp(1.02rem,1.7vw,1.32rem);line-height:1.55}.cards{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}.card{background:#f8fafc;border-right:7px solid #22c55e;border-radius:18px;padding:16px}.note{background:#fff7ed;border-right:7px solid #fb923c;border-radius:18px;padding:14px;margin-top:12px}.nav{position:fixed;inset:auto 24px 24px 24px;display:grid;grid-template-columns:auto 1fr auto;gap:12px;align-items:center;color:white;font-weight:900;pointer-events:none}.nav>*{pointer-events:auto}button,.back{border:0;border-radius:999px;background:white;color:#0f766e;padding:12px 18px;font-weight:900;text-decoration:none;cursor:pointer}small{color:#475569}.exercise-slide.active{justify-content:flex-start}.exercise-slide h2{font-size:clamp(1.55rem,3.6vw,2.55rem);margin-bottom:10px}.exercise-slide li{font-size:clamp(.86rem,1.28vw,1.06rem);line-height:1.34;margin-bottom:7px}.exercise-slide small{font-size:.82em;line-height:1.3}.counter{justify-self:center;background:rgba(0,0,0,.28);padding:10px 16px;border-radius:999px}@media(max-width:760px){body{overflow:auto}.deck{height:auto;min-height:100svh;padding:12px 10px 88px}.slide{min-height:calc(100svh - 105px);padding:22px 16px;border-radius:22px}.slide.active{justify-content:flex-start}.cards{grid-template-columns:1fr}.nav{inset:auto 10px 10px 10px;display:flex;justify-content:space-between;background:rgba(8,17,31,.65);border-radius:999px;padding:8px}.counter{display:none}button,.back{padding:9px 10px;font-size:.84rem}}@media print{body{background:white;overflow:auto}.nav{display:none}.deck{display:block;height:auto}.slide{display:block;box-shadow:none;border:1px solid #ddd;break-after:page}}</style></head><body><main class="deck" id="deck"><section class="slide active"><div class="emoji">🐢</div><div class="kicker">פייתון מצייר • שיעור ${lesson.id} מתוך 30 • 90 דקות</div><h1>${escapeHtml(lesson.title)}</h1><p>${escapeHtml(lesson.story)}</p></section><section class="slide"><h2>🎯 מטרות ותוצר</h2><div class="cards"><div class="card"><b>מושג מרכזי</b><p>${escapeHtml(lesson.concept)}</p></div><div class="card"><b>תוצר השיעור</b><p>${escapeHtml(lesson.product || lesson.outcome)}</p></div><div class="card"><b>משימה</b><p>${escapeHtml(lesson.mission)}</p></div><div class="card"><b>גישה פדגוגית</b><p>${escapeHtml(lesson.approach)}</p></div></div><div class="note">מבחינת הילדים זה שיעור עצמאי. לא מציגים את כל הסילבוס — רק את המשימה של היום.</div></section><section class="slide"><h2>⏱️ מבנה 90 דקות</h2><ol>${flow}</ol></section>${exerciseSlides}<section class="slide"><h2>📚 מילון מושגים</h2><div class="cards">${vocab}</div></section><section class="slide"><h2>👩‍🏫 דגשי מדריך</h2><ul>${(lesson.teacherTips || []).map(t => `<li>${escapeHtml(t)}</li>`).join('')}</ul><div class="note">עיקרון מוביל: לא מראים פתרון מלא. בונים ביטחון דרך ניסוי, הרצה, ניבוי ותיקון.</div></section><section class="slide"><h2>🛠️ טעויות נפוצות ודיבאג</h2><ul>${mistakes}</ul><div class="note">לא מתקנים לילדים בידיים. שואלים: איפה הצב סטה? איזה בלוק/שורה אחראים לזה?</div></section><section class="slide"><h2>✅ איך יודעים שהצלחנו?</h2><ul>${criteria}</ul></section><section class="slide"><h2>🏁 סיום שיעור</h2><p>כל ילד משלים: “היום בניתי ___, השתמשתי ב־___, ותיקנתי ___.”</p><p><a href="python-turtle.html?lesson=${lesson.id}">פתח את שיעור ${lesson.id} בלומדה</a></p></section></main><nav class="nav"><button onclick="prevSlide()">→ הקודם</button><span class="counter" id="counter"></span><div><button onclick="nextSlide()">הבא ←</button> <a class="back" href="python-turtle.html?lesson=${lesson.id}">ללומדה</a> <a class="back" href="python-turtle-slides.html">אינדקס</a></div></nav><script>let current=0;const slides=[...document.querySelectorAll('.slide')];function render(){slides.forEach((s,i)=>s.classList.toggle('active',i===current));document.getElementById('counter').textContent=(current+1)+' / '+slides.length}function nextSlide(){current=Math.min(current+1,slides.length-1);render()}function prevSlide(){current=Math.max(current-1,0);render()}document.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key===' ')nextSlide();if(e.key==='ArrowRight')prevSlide()});render()</script></body></html>`;
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
