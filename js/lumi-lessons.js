const choice = (prompt, hint, answer, options) => ({ prompt, hint, answer, options });
const opt = (id, label, emoji, why) => ({ id, label, emoji, why });
const pat = (prompt, sequence, answer, options, why) => ({ prompt, sequence, answer, options, why });

const animalOptions = [
  opt('fox','שועל','🦊','נכון! בחרנו לפי רמזים ולא לפי ניחוש.'),
  opt('bee','דבורה','🐝','נכון! זיהיתם סימן מתאים.'),
  opt('snail','חילזון','🐌','נכון! השביל הרירי הוא רמז חזק.'),
  opt('bird','ציפור','🐦','נכון! כנפיים ונוצה מובילות לציפור.'),
];
const actionOptions = [
  opt('water','להשקות','💧','נכון! זו הפעולה שמתאימה למצב.'),
  opt('shade','לעשות צל','🌳','נכון! אם חם מדי, צל עוזר.'),
  opt('wait','לחכות','⏳','נכון! לפעמים האלגוריתם צריך לעצור ולבדוק.'),
  opt('collect','לאסוף','🧺','נכון! איסוף מתאים כשהפריט מוכן.'),
];
const debugOptions = [
  opt('swap','להחליף סדר','🔁','נכון! לפעמים הבאג הוא סדר פעולות לא נכון.'),
  opt('remove','להוציא פעולה מיותרת','🧹','נכון! דיבוג כולל ניקוי פעולה שלא עוזרת.'),
  opt('add-check','להוסיף בדיקה','🔎','נכון! תנאי חסר יכול לגרום לטעות.'),
  opt('repeat','לחזור שוב','🔂','נכון! כשיש פעולה חוזרת, לולאה מקצרת.'),
];
const weatherOptions = [
  opt('umbrella','מטרייה','☂️','נכון! אם גשם אז מטרייה.'),
  opt('kite','עפיפון','🪁','נכון! רוח חזקה מתאימה לעפיפון.'),
  opt('hat','כובע','🧢','נכון! שמש חזקה דורשת הגנה.'),
  opt('lamp','מנורה','💡','נכון! חושך מתאים להדלקת אור.'),
];

function repeatPatternTasks(iconA, iconB, iconC, topic) {
  return [
    pat(`השלימו דפוס ${topic}: מי בא עכשיו?`, [iconA, iconB, iconA, iconB, '?'], iconA, [iconA, iconB, iconC], 'זה דפוס של אחד־אחד.'),
    pat(`לומי רואה דפוס ${topic}. מה חסר?`, [iconA, iconA, iconB, iconA, iconA, '?'], iconB, [iconA, iconB, iconC], 'אחרי שניים זהים מגיע השלישי.'),
    pat('איזה סימן ממשיך את הרצף?', [iconA, iconB, iconC, iconA, iconB, '?'], iconC, [iconA, iconB, iconC], 'הרצף חוזר בשלשות.'),
    pat('מצאו את סוף הדפוס.', [iconB, iconA, iconB, iconA, iconB, '?'], iconA, [iconA, iconB, iconC], 'כל פעם מתחלפים.'),
    pat('מה בא אחרי שתי חזרות?', [iconC, iconC, iconA, iconC, iconC, '?'], iconA, [iconA, iconB, iconC], 'שני פריטים ואז פריט אחר.'),
    pat('איזה פריט משלים לולאה חוזרת?', [iconA, iconB, iconB, iconA, iconB, '?'], iconB, [iconA, iconB, iconC], 'היחידה החוזרת היא אחד ואז שניים.'),
    pat('לומי רוצה לחזות את הצעד הבא.', [iconA, iconC, iconA, iconC, '?'], iconA, [iconA, iconB, iconC], 'הדפוס קופץ בין שני סימנים.'),
    pat('איזה סימן חסר בסוף?', [iconB, iconC, iconC, iconB, iconC, '?'], iconC, [iconA, iconB, iconC], 'אחד ואז שניים.'),
    pat('מצאו חוקיות ברצף.', [iconA, iconA, iconA, iconB, iconA, iconA, iconA, '?'], iconB, [iconA, iconB, iconC], 'שלושה ואז סימן מיוחד.'),
    pat('מה יקרה בתחנה הבאה?', [iconC, iconB, iconA, iconC, iconB, '?'], iconA, [iconA, iconB, iconC], 'הרצף יורד באותו סדר.'),
    pat('בחרו את הסיום הנכון.', [iconB, iconB, iconC, iconB, iconB, '?'], iconC, [iconA, iconB, iconC], 'שתי חזרות ואז סימן אחר.'),
    pat('איזה פריט ישמור על הדפוס?', [iconA, iconB, iconC, iconC, iconA, iconB, '?'], iconC, [iconA, iconB, iconC], 'אחד, אחד, שניים.'),
  ];
}
function conditionTasks(topic, options = weatherOptions) {
  return [
    choice(`אם ${topic} יש גשם — מה הכלל הנכון?`, 'IF rain THEN ?', 'umbrella', options),
    choice(`אם ${topic} יש רוח חזקה — מה כדאי לעשות?`, 'בודקים תנאי ואז פעולה.', 'kite', options),
    choice(`אם ${topic} יש שמש חזקה — איזו פעולה מתאימה?`, 'תנאי: שמש חזקה.', 'hat', options),
    choice(`אם ${topic} נהיה חשוך — מה צריך להפעיל?`, 'IF dark THEN light.', 'lamp', options),
    choice('הכלל אומר: אם יבש — אז משקים. מה הפעולה?', 'זה תנאי קלאסי.', 'water', actionOptions),
    choice('אם הצמח כבר רטוב — מה האלגוריתם צריך לעשות?', 'לא תמיד עושים פעולה; לפעמים בודקים ומחכים.', 'wait', actionOptions),
    choice('אם חם מדי לשתיל — איזו פעולה תעזור?', 'התנאי הוא חום.', 'shade', actionOptions),
    choice('אם הפרי בשל — מה עושים?', 'הפעולה מגיעה רק כשהתנאי מתקיים.', 'collect', actionOptions),
    choice('סדר: בדוק מצב ואז בחר פעולה. מה חסר לפני הפעולה?', 'בתכנות לא מנחשים — בודקים.', 'add-check', debugOptions),
    choice('אם הכלל לא עובד כי אין תנאי — מה התיקון?', 'חסר IF.', 'add-check', debugOptions),
    choice('אם שתי פעולות הפוכות בסדר — מה הדיבוג?', 'סדר פעולות חשוב.', 'swap', debugOptions),
    choice('אם יש פעולה שלא משפיעה בכלל — מה עושים?', 'מנקים קוד מיותר.', 'remove', debugOptions),
  ];
}
function classifyTasks(topic, rightA='fox', rightB='bee', rightC='snail') {
  return [
    choice(`${topic}: עקבות קטנות וזנב ארוך. מי מתאים?`, 'מיון לפי תכונות.', rightA, animalOptions),
    choice(`${topic}: כנפיים וזמזום ליד פרחים. מי מתאים?`, 'בודקים סימנים.', rightB, animalOptions),
    choice(`${topic}: שביל רירי על עלה. מי מתאים?`, 'זה רמז של תנועה איטית.', rightC, animalOptions),
    choice('איזו חיה מתאימה לרמז: נוצה על השביל?', 'נוצה קשורה לכנפיים.', 'bird', animalOptions),
    choice('מי לא שייך לקבוצת “עפים”?', 'מחפשים יוצא דופן.', 'snail', animalOptions),
    choice('מי שייך לקבוצת “פעיל בלילה”?', 'לומי מחפשת חיית לילה.', 'fox', animalOptions),
    choice('איזו חיה מתאימה לפרחים ואבקה?', 'אבקה קשורה לדבורה.', 'bee', animalOptions),
    choice('מי מתאים לקבוצה “זוחלים לאט”?', 'המאפיין הוא קצב תנועה.', 'snail', animalOptions),
    choice('לומי מצאה ציוץ ונוצה. מי הסביר ביותר?', 'משלבים שני רמזים.', 'bird', animalOptions),
    choice('הכלל: אם יש כנפיים וגם ציוץ — בחרו...', 'שני תנאים יחד.', 'bird', animalOptions),
    choice('הכלל: אם יש שביל רירי — בחרו...', 'כלל פשוט של אם־אז.', 'snail', animalOptions),
    choice('הכלל: אם יש זמזום ופרח — בחרו...', 'שני רמזים מובילים לתשובה.', 'bee', animalOptions),
  ];
}
function sequenceTasks(topic) {
  return [
    choice(`${topic}: מה מתקנים כשפעולה 2 צריכה לבוא לפני פעולה 1?`, 'רצף הוא אלגוריתם.', 'swap', debugOptions),
    choice(`${topic}: יש פעולה שלא עושה כלום. מה הדיבוג?`, 'מנקים אלגוריתם.', 'remove', debugOptions),
    choice(`${topic}: אותה פעולה חוזרת 5 פעמים. מה מתאים?`, 'לולאה מקצרת חזרות.', 'repeat', debugOptions),
    choice(`${topic}: האלגוריתם מחליט בלי לבדוק מצב. מה חסר?`, 'צריך תנאי.', 'add-check', debugOptions),
    choice('הצעד הראשון בתכנון הוא...', 'לפני פעולה — מבינים מטרה.', 'add-check', debugOptions),
    choice('אם “אוספים ואז בודקים אם בשל” נכשל — מה הבעיה?', 'בודקים לפני שאוספים.', 'swap', debugOptions),
    choice('אם כתוב “השקה, השקה, השקה” — מה ישפר?', 'חזרה יכולה להפוך ללולאה.', 'repeat', debugOptions),
    choice('אם יש “קפוץ” בלומדת טבע ואין קפיצה — מה עושים?', 'פעולה לא רלוונטית.', 'remove', debugOptions),
    choice('מה יעזור למצוא באג מהר יותר?', 'בודקים שלב־שלב.', 'add-check', debugOptions),
    choice('אם הפעולות נכונות אבל הפוכות — מה התיקון?', 'שינוי סדר.', 'swap', debugOptions),
    choice('אם הילד כתב 6 פעולות זהות — מה הרעיון התכנותי?', 'לולאה.', 'repeat', debugOptions),
    choice('אם כלל פועל גם כשלא צריך — מה חסר?', 'תנאי מדויק.', 'add-check', debugOptions),
  ];
}

window.LUMI_LESSONS = [
  { id:1, icon:'🐾', title:'עקבות ביער', concept:'מיון לפי סימנים', story:'לומי מצאה עקבות ליד הנחל. הילדים ממיינים לפי רמזים כמו מתכנתים שמזהים נתונים.', sticker:'🦊', stickerName:'מדבקת שועל', type:'classify', tasks:classifyTasks('עקבות ביער') },
  { id:2, icon:'🌸', title:'גינת הדפוסים', concept:'רצפים ודפוסים', story:'לומי שותלת גינה וחוזה מה יבוא לפי חוקיות חוזרת.', sticker:'🌻', stickerName:'מדבקת חמנייה', type:'pattern', tasks:repeatPatternTasks('🌷','🌼','🌻','בגינה') },
  { id:3, icon:'☁️', title:'תחנת מזג האוויר', concept:'אם־אז', story:'לומי קוראת מזג אוויר ובונה כללי IF-THEN פשוטים.', sticker:'🌈', stickerName:'מדבקת קשת', type:'condition', tasks:conditionTasks('בתחנה') },
  { id:4, icon:'🦋', title:'פרפרים וצבעים', concept:'קטגוריות ותכונות', story:'ממיינים פרפרים לפי צבע, צורה ודוגמה — כמו סינון דאטה.', sticker:'🦋', stickerName:'מדבקת פרפר', type:'classify', tasks:classifyTasks('פרפרים וצבעים','bee','bird','snail') },
  { id:5, icon:'🪺', title:'קן הציפורים', concept:'סדר פעולות', story:'בונים קן לפי שלבים נכונים ומדבגים סדר שגוי.', sticker:'🐦', stickerName:'מדבקת ציפור', type:'condition', tasks:sequenceTasks('קן הציפורים') },
  { id:6, icon:'🧺', title:'אוסף הזרעים', concept:'דאטה וספירה', story:'לומי אוספת זרעים, מזהה קבוצות ומחליטה מה לעשות עם הנתונים.', sticker:'🌰', stickerName:'מדבקת בלוט', type:'classify', tasks:classifyTasks('אוסף הזרעים') },
  { id:7, icon:'🌙', title:'לילה ביער', concept:'חיפוש לפי רמזים', story:'בלילה רואים מעט מידע, ולכן בודקים רמזים בזהירות.', sticker:'🦉', stickerName:'מדבקת ינשוף', type:'condition', tasks:conditionTasks('בלילה') },
  { id:8, icon:'🐜', title:'שיירת הנמלים', concept:'לולאות', story:'נמלים חוזרות על פעולות. הילדים מזהים מתי צריך לולאה.', sticker:'🐜', stickerName:'מדבקת נמלה', type:'condition', tasks:sequenceTasks('שיירת הנמלים') },
  { id:9, icon:'🏞️', title:'מפת השביל', concept:'תכנון אלגוריתמי', story:'לפני שיוצאים לדרך, מתכננים רצף צעדים ובודקים מכשולים.', sticker:'🧭', stickerName:'מדבקת מצפן', type:'pattern', tasks:repeatPatternTasks('➡️','⬆️','⭐','במסלול') },
  { id:10, icon:'💧', title:'טיפות לנחל', concept:'קלט־פלט', story:'חיישן מים נותן קלט, ולומי בוחרת פעולה מתאימה.', sticker:'💧', stickerName:'מדבקת טיפה', type:'condition', tasks:conditionTasks('בנחל') },
  { id:11, icon:'🍄', title:'יער הפטריות', concept:'תנאי וגם', story:'בוחרים רק כששני תנאים מתקיימים — צבע נכון וגם נקודות נכונות.', sticker:'🍄', stickerName:'מדבקת פטרייה', type:'classify', tasks:classifyTasks('יער הפטריות') },
  { id:12, icon:'🐢', title:'הצב והקצב', concept:'מהירות וזמן', story:'משווים איטי ומהיר, ומבינים למה אלגוריתם לפעמים צריך לחכות.', sticker:'🐢', stickerName:'מדבקת צב', type:'condition', tasks:sequenceTasks('הצב והקצב') },
  { id:13, icon:'🌳', title:'עץ ההחלטות', concept:'עץ תנאים', story:'לומי שואלת שאלה אחרי שאלה עד שמגיעה להחלטה נכונה.', sticker:'🌳', stickerName:'מדבקת עץ', type:'condition', tasks:conditionTasks('בעץ ההחלטות') },
  { id:14, icon:'🧪', title:'מעבדת הטבע', concept:'ניסוי ודיבוג', story:'משנים דבר אחד, בודקים תוצאה ומתקנים באגים.', sticker:'🔬', stickerName:'מדבקת מעבדה', type:'condition', tasks:sequenceTasks('מעבדת הטבע') },
  { id:15, icon:'🌍', title:'שמורת לומי', concept:'פרויקט סיום', story:'מחברים מיון, דפוסים, תנאים ודיבוג כדי לשמור על שמורת טבע.', sticker:'🏆', stickerName:'תג חוקרת טבע', type:'pattern', tasks:repeatPatternTasks('🌱','💧','☀️','בשמורה') },
];
