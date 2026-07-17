window.ESCAPE_KEYS = {
  shapeCircle: { label: 'עיגול', icon: '⭕', group: 'shape' },
  shapeStar: { label: 'כוכב', icon: '⭐', group: 'shape' },
  shapeTriangle: { label: 'משולש', icon: '🔺', group: 'shape' },
  colorBlue: { label: 'כחול', icon: '🔵', group: 'color' },
  colorGreen: { label: 'ירוק', icon: '🟢', group: 'color' },
  colorRed: { label: 'אדום', icon: '🔴', group: 'color' },
  soundBell: { label: 'צלצול', icon: '🔔', group: 'sound' },
  soundDrum: { label: 'תוף', icon: '🥁', group: 'sound' },
  numberTwo: { label: 'מספר 2', icon: '2️⃣', group: 'number' },
  numberThree: { label: 'מספר 3', icon: '3️⃣', group: 'number' }
};

window.ESCAPE_LESSONS = [
  {
    id: 1,
    emoji: '🔐',
    title: 'הדלת עם העיגול הכחול',
    unit: 'תנאי וגם ראשון',
    concept: 'וגם',
    story: 'סיסי עומדת מול דלת קסומה. על הדלת כתוב: נפתחת רק אם הסמל הוא עיגול וגם הצבע כחול.',
    conditionText: 'אם סמל = עיגול וגם צבע = כחול → פתח דלת',
    required: ['shapeCircle', 'colorBlue'],
    distractors: ['shapeStar', 'colorRed'],
    result: 'העיגול הכחול הפעיל את שני התנאים, והדלת נפתחה.',
    learningNote: 'בתנאי עם וגם, שני הדברים חייבים להיות נכונים. אם רק אחד נכון — הדלת נשארת סגורה.'
  },
  {
    id: 2,
    emoji: '⭐',
    title: 'תיבת הכוכב הירוק',
    unit: 'שני תנאים',
    concept: 'בדיקת שני רמזים',
    story: 'תיבה קטנה מחכה לקוד. כתוב עליה: פתחו רק עם כוכב וגם ירוק.',
    conditionText: 'אם סמל = כוכב וגם צבע = ירוק → פתח תיבה',
    required: ['shapeStar', 'colorGreen'],
    distractors: ['shapeCircle', 'colorBlue'],
    result: 'הכוכב הירוק התאים בדיוק, והתיבה נפתחה.',
    learningNote: 'המחשב בודק כל חלק בתנאי. כוכב נכון בלי ירוק — לא מספיק.'
  },
  {
    id: 3,
    emoji: '🔔',
    title: 'שער הצלצול האדום',
    unit: 'חיישן + צבע',
    concept: 'שילוב רמזים',
    story: 'שער באולפן שומע צלילים ורואה צבעים. הוא נפתח רק כשיש צלצול וגם אור אדום.',
    conditionText: 'אם צליל = צלצול וגם צבע = אדום → פתח שער',
    required: ['soundBell', 'colorRed'],
    distractors: ['soundDrum', 'colorGreen'],
    result: 'הצלצול והאור האדום הגיעו יחד, והשער נפתח.',
    learningNote: 'אפשר לחבר תנאים מסוגים שונים: צליל אחד וצבע אחד. שניהם יחד יוצרים החלטה.'
  },
  {
    id: 4,
    emoji: '🔺',
    title: 'מנעול המשולש מספר 3',
    unit: 'צורה + מספר',
    concept: 'תנאי מורכב קל',
    story: 'המנעול הבא דורש צורה ומספר: משולש וגם מספר 3.',
    conditionText: 'אם צורה = משולש וגם מספר = 3 → פתח מנעול',
    required: ['shapeTriangle', 'numberThree'],
    distractors: ['shapeCircle', 'numberTwo'],
    result: 'המשולש והמספר 3 התאימו, והמנעול השתחרר.',
    learningNote: 'תנאי מורכב לא חייב להיות קשה: פשוט בודקים שתי שאלות קטנות.'
  },
  {
    id: 5,
    emoji: '🥁',
    title: 'קיר התוף הירוק',
    unit: 'דיבוג תנאי',
    concept: 'אחד נכון לא מספיק',
    story: 'הקיר מגיב רק אם שומעים תוף וגם האור ירוק. סיסי צריכה לבחור שני רמזים מדויקים.',
    conditionText: 'אם צליל = תוף וגם צבע = ירוק → פתח קיר סודי',
    required: ['soundDrum', 'colorGreen'],
    distractors: ['soundBell', 'colorRed'],
    result: 'התוף והירוק עבדו יחד, והקיר הסודי נפתח.',
    learningNote: 'דיבוג בתנאי וגם: אם המערכת לא נפתחת, בודקים איזה חלק מהתנאי חסר.'
  },
  {
    id: 6,
    emoji: '🧩',
    title: 'החידה האחרונה של סיסי',
    unit: 'אתגר מסכם',
    concept: 'וגם + נימוק',
    story: 'בחדר האחרון צריך לבחור קוד שמכיל כוכב וגם מספר 2. יש הרבה רמזים מבלבלים מסביב.',
    conditionText: 'אם סמל = כוכב וגם מספר = 2 → פתח חדר אחרון',
    required: ['shapeStar', 'numberTwo'],
    distractors: ['shapeTriangle', 'numberThree'],
    result: 'הכוכב והמספר 2 פתחו את החדר האחרון. סיסי הצליחה לצאת!',
    learningNote: 'הילדים כבר בונים תנאי תכנותי אמיתי: אם שני תנאים מתקיימים יחד — הפעולה מתבצעת.'
  }
];
