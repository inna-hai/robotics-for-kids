window.ART_COLORS = {
  pink: { label: 'ורוד', hex: '#fb7185', emoji: '🌸' },
  yellow: { label: 'צהוב', hex: '#facc15', emoji: '⭐' },
  blue: { label: 'כחול', hex: '#38bdf8', emoji: '💧' },
  green: { label: 'ירוק', hex: '#4ade80', emoji: '🍃' },
  purple: { label: 'סגול', hex: '#a78bfa', emoji: '🔮' },
  orange: { label: 'כתום', hex: '#fb923c', emoji: '🟠' }
};

window.ART_LESSONS = [
  {
    id: 1,
    emoji: '🌸',
    title: 'פרח פיקסלים ראשון',
    unit: 'סטודיו הצבעים',
    concept: 'קואורדינטות',
    mission: 'סיסי רוצה לצייר פרח קטן. בחרו הוראות צבע מדויקות לפי שורה ועמודה.',
    learningNote: 'במחשב כל ציור מורכב מנקודות קטנות. כשנותנים מיקום מדויק וצבע, המחשב יודע בדיוק מה לצייר.',
    size: 4,
    target: [
      { row: 1, col: 2, color: 'pink' },
      { row: 2, col: 1, color: 'pink' },
      { row: 2, col: 2, color: 'yellow' },
      { row: 2, col: 3, color: 'pink' },
      { row: 3, col: 2, color: 'green' }
    ],
    distractors: [
      { row: 4, col: 4, color: 'purple' },
      { row: 1, col: 1, color: 'green' }
    ]
  },
  {
    id: 2,
    emoji: '🚀',
    title: 'טיל קטן לשיגור',
    unit: 'פיקסל ארט',
    concept: 'דיוק בהוראות',
    mission: 'ציירו טיל פשוט: חרטום, גוף ואש. שימו לב שכל צבע נמצא במשבצת הנכונה.',
    learningNote: 'אם שורה או עמודה לא נכונות, הציור משתנה. זה כמו באג קטן בקוד — מאתרים ומתקנים.',
    size: 4,
    target: [
      { row: 1, col: 2, color: 'yellow' },
      { row: 2, col: 2, color: 'blue' },
      { row: 3, col: 1, color: 'purple' },
      { row: 3, col: 2, color: 'blue' },
      { row: 3, col: 3, color: 'purple' },
      { row: 4, col: 2, color: 'orange' }
    ],
    distractors: [
      { row: 4, col: 1, color: 'orange' },
      { row: 1, col: 3, color: 'blue' }
    ]
  },
  {
    id: 3,
    emoji: '🎵',
    title: 'לב מוזיקלי',
    unit: 'דפוס סימטרי',
    concept: 'סימטריה',
    mission: 'בנו לב קטן עם שני צדדים דומים. חפשו זוגות של משבצות שמאזנות אחת את השנייה.',
    learningNote: 'סימטריה היא דפוס. כשמזהים דפוס, אפשר לבנות ציור או קוד בצורה מסודרת יותר.',
    size: 5,
    target: [
      { row: 1, col: 2, color: 'pink' },
      { row: 1, col: 4, color: 'pink' },
      { row: 2, col: 1, color: 'pink' },
      { row: 2, col: 3, color: 'purple' },
      { row: 2, col: 5, color: 'pink' },
      { row: 3, col: 2, color: 'pink' },
      { row: 3, col: 4, color: 'pink' },
      { row: 4, col: 3, color: 'pink' }
    ],
    distractors: [
      { row: 5, col: 5, color: 'yellow' },
      { row: 1, col: 1, color: 'purple' }
    ]
  },
  {
    id: 4,
    emoji: '🏠',
    title: 'בית חכם קטן',
    unit: 'ציור לפי תכנון',
    concept: 'תכנון לפני ביצוע',
    mission: 'ציירו בית מפיקסלים: גג, קירות ודלת. קודם מסתכלים על המטרה, אחר כך בוחרים הוראות.',
    learningNote: 'תוכנית טובה חוסכת ניסיונות. מתכנתים מתכננים את התוצאה לפני שהם מריצים את הקוד.',
    size: 5,
    target: [
      { row: 1, col: 3, color: 'orange' },
      { row: 2, col: 2, color: 'orange' },
      { row: 2, col: 3, color: 'orange' },
      { row: 2, col: 4, color: 'orange' },
      { row: 3, col: 2, color: 'blue' },
      { row: 3, col: 3, color: 'yellow' },
      { row: 3, col: 4, color: 'blue' },
      { row: 4, col: 2, color: 'blue' },
      { row: 4, col: 3, color: 'purple' },
      { row: 4, col: 4, color: 'blue' }
    ],
    distractors: [
      { row: 5, col: 3, color: 'green' },
      { row: 1, col: 2, color: 'yellow' }
    ]
  },
  {
    id: 5,
    emoji: '🐠',
    title: 'דג פיקסלים צבעוני',
    unit: 'ציור ודיבוג',
    concept: 'בדיקה ותיקון',
    mission: 'עזרו לסיסי לצייר דג. אם בחרתם הוראה מיותרת, נקו ונסו שוב — זה דיבוג.',
    learningNote: 'דיבוג הוא חלק רגיל מתכנות: בודקים מה יצא, מוצאים הבדל קטן, ומתקנים בלי להיבהל.',
    size: 5,
    target: [
      { row: 2, col: 2, color: 'blue' },
      { row: 2, col: 3, color: 'blue' },
      { row: 2, col: 4, color: 'yellow' },
      { row: 3, col: 1, color: 'orange' },
      { row: 3, col: 2, color: 'blue' },
      { row: 3, col: 3, color: 'blue' },
      { row: 3, col: 4, color: 'blue' },
      { row: 4, col: 2, color: 'blue' },
      { row: 4, col: 3, color: 'blue' },
      { row: 4, col: 4, color: 'yellow' }
    ],
    distractors: [
      { row: 1, col: 5, color: 'pink' },
      { row: 5, col: 1, color: 'green' }
    ]
  },
  {
    id: 6,
    emoji: '🤖',
    title: 'סיסי מציירת רובוט',
    unit: 'אתגר מסכם',
    concept: 'ספרייטים',
    mission: 'אתגר אחרון: צרו ספרייט רובוט קטן. ספרייט הוא דמות שמחשב יכול להציג ולהזיז.',
    learningNote: 'במשחקים משתמשים בספרייטים: ציורים קטנים שמורכבים מפיקסלים. עכשיו הילדים יצרו ספרייט ראשון משלהם.',
    size: 5,
    target: [
      { row: 1, col: 2, color: 'purple' },
      { row: 1, col: 4, color: 'purple' },
      { row: 2, col: 2, color: 'blue' },
      { row: 2, col: 3, color: 'blue' },
      { row: 2, col: 4, color: 'blue' },
      { row: 3, col: 1, color: 'green' },
      { row: 3, col: 2, color: 'blue' },
      { row: 3, col: 3, color: 'yellow' },
      { row: 3, col: 4, color: 'blue' },
      { row: 3, col: 5, color: 'green' },
      { row: 4, col: 2, color: 'blue' },
      { row: 4, col: 4, color: 'blue' }
    ],
    distractors: [
      { row: 5, col: 3, color: 'orange' },
      { row: 1, col: 3, color: 'pink' }
    ]
  }
];

window.ART_LESSONS.push(
  { id: 7, emoji: '🦋', title: 'פרפר סימטרי', unit: 'סימטריה', concept: 'קואורדינטות וסימטריה', mission: 'סיסי מציירת פרפר: צד ימין וצד שמאל צריכים להיות דומים.', learningNote: 'סימטריה עוזרת לזהות תבניות בציור ובקוד.', size: 5, target: [{row:1,col:2,color:'purple'},{row:1,col:4,color:'purple'},{row:2,col:2,color:'pink'},{row:2,col:3,color:'yellow'},{row:2,col:4,color:'pink'},{row:3,col:1,color:'blue'},{row:3,col:3,color:'green'},{row:3,col:5,color:'blue'},{row:4,col:2,color:'pink'},{row:4,col:4,color:'pink'}], distractors: [{row:5,col:5,color:'orange'},{row:1,col:1,color:'green'},{row:5,col:3,color:'purple'}] },
  { id: 8, emoji: '🏠', title: 'בית קטן', unit: 'צורות מפיקסלים', concept: 'בניית צורה', mission: 'סיסי בונה בית מפיקסלים: גג, קירות ודלת.', learningNote: 'ציור מחשב בנוי מצעדים קטנים שמרכיבים צורה גדולה.', size: 5, target: [{row:1,col:3,color:'orange'},{row:2,col:2,color:'orange'},{row:2,col:3,color:'orange'},{row:2,col:4,color:'orange'},{row:3,col:2,color:'blue'},{row:3,col:3,color:'blue'},{row:3,col:4,color:'blue'},{row:4,col:2,color:'blue'},{row:4,col:3,color:'yellow'},{row:4,col:4,color:'blue'}], distractors: [{row:5,col:1,color:'pink'},{row:1,col:5,color:'green'},{row:5,col:5,color:'purple'}] },
  { id: 9, emoji: '🌈', title: 'קשת צבעים', unit: 'סדר צבעים', concept: 'רצף חזותי', mission: 'סיסי מציירת קשת קטנה לפי סדר צבעים קבוע.', learningNote: 'גם בציור יש אלגוריתם: צבע אחרי צבע לפי חוק.', size: 5, target: [{row:1,col:1,color:'pink'},{row:1,col:2,color:'orange'},{row:1,col:3,color:'yellow'},{row:1,col:4,color:'green'},{row:1,col:5,color:'blue'},{row:2,col:2,color:'orange'},{row:2,col:3,color:'yellow'},{row:2,col:4,color:'green'},{row:3,col:3,color:'purple'}], distractors: [{row:5,col:1,color:'blue'},{row:4,col:4,color:'pink'},{row:2,col:5,color:'yellow'}] },
  { id: 10, emoji: '🚦', title: 'רמזור פיקסלים', unit: 'סמלים בעיר', concept: 'ייצוג מידע', mission: 'סיסי מציירת רמזור שמייצג שלושה מצבים.', learningNote: 'סמל קטן יכול להעביר מידע ברור למשתמש.', size: 5, target: [{row:1,col:3,color:'pink'},{row:2,col:3,color:'yellow'},{row:3,col:3,color:'green'},{row:4,col:3,color:'blue'},{row:5,col:3,color:'blue'}], distractors: [{row:1,col:1,color:'green'},{row:3,col:5,color:'orange'},{row:5,col:5,color:'purple'}] },
  { id: 11, emoji: '👾', title: 'דמות משחק', unit: 'ספרייטים', concept: 'פיקסל ארט למשחק', mission: 'סיסי יוצרת דמות משחק קטנה עם עיניים וגוף.', learningNote: 'ספרייט במשחק הוא ציור קטן שהקוד יכול להזיז.', size: 5, target: [{row:1,col:2,color:'purple'},{row:1,col:3,color:'purple'},{row:1,col:4,color:'purple'},{row:2,col:1,color:'purple'},{row:2,col:2,color:'yellow'},{row:2,col:3,color:'purple'},{row:2,col:4,color:'yellow'},{row:2,col:5,color:'purple'},{row:3,col:2,color:'blue'},{row:3,col:3,color:'blue'},{row:3,col:4,color:'blue'},{row:4,col:1,color:'green'},{row:4,col:5,color:'green'}], distractors: [{row:5,col:3,color:'orange'},{row:1,col:1,color:'pink'},{row:5,col:5,color:'yellow'}] },
  { id: 12, emoji: '🏁', title: 'גלריית הסיום', unit: 'אתגר סיום', concept: 'תכנון ציור מלא', mission: 'סיסי מתכננת ציור סיום שמשלב צבע, מקום ודפוס.', learningNote: 'באתגר סיום הילדים מתכננים לפני הציור, כמו מתכנתים שמתכננים לפני הקוד.', size: 5, target: [{row:1,col:3,color:'yellow'},{row:2,col:2,color:'green'},{row:2,col:3,color:'green'},{row:2,col:4,color:'green'},{row:3,col:1,color:'blue'},{row:3,col:2,color:'blue'},{row:3,col:3,color:'purple'},{row:3,col:4,color:'blue'},{row:3,col:5,color:'blue'},{row:4,col:2,color:'orange'},{row:4,col:4,color:'orange'},{row:5,col:3,color:'pink'}], distractors: [{row:1,col:1,color:'blue'},{row:5,col:1,color:'green'},{row:5,col:5,color:'purple'}] }
);
