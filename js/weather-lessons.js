window.WEATHER_SENSORS = {
  rain: { label: 'חיישן גשם', icon: '🌧️', hint: 'בודק אם יורד גשם' },
  sun: { label: 'חיישן שמש', icon: '☀️', hint: 'בודק אם חם או שמשי' },
  wind: { label: 'חיישן רוח', icon: '💨', hint: 'בודק אם יש רוח חזקה' },
  dark: { label: 'חיישן אור', icon: '🌙', hint: 'בודק אם חשוך' },
  cold: { label: 'חיישן קור', icon: '🧊', hint: 'בודק אם קר' },
  noise: { label: 'חיישן רעש', icon: '🔊', hint: 'בודק אם יש רעש חזק' }
};

window.WEATHER_ACTIONS = {
  umbrella: { label: 'לפתוח מטרייה חכמה', icon: '☂️' },
  shade: { label: 'לפתוח הצללה', icon: '⛱️' },
  closeWindow: { label: 'לסגור חלון', icon: '🪟' },
  light: { label: 'להדליק אור', icon: '💡' },
  sweater: { label: 'להציע סוודר', icon: '🧥' },
  quiet: { label: 'להפעיל מצב שקט', icon: '🤫' }
};

window.WEATHER_CONDITIONS = {
  rain: { label: 'אם יורד גשם', icon: '🌧️' },
  sun: { label: 'אם השמש חזקה', icon: '☀️' },
  wind: { label: 'אם יש רוח חזקה', icon: '💨' },
  dark: { label: 'אם חשוך', icon: '🌙' },
  cold: { label: 'אם קר מאוד', icon: '🧊' },
  noise: { label: 'אם יש רעש חזק', icon: '🔊' }
};


window.WEATHER_BUG_PARTS = {
  condition: { label: 'התנאי לא מתאים לסיפור' },
  sensor: { label: 'החיישן לא מזהה את הבעיה' },
  action: { label: 'הפעולה לא פותרת את הבעיה' }
};

window.WEATHER_LESSONS = [
  {
    id: 1,
    emoji: '🌧️',
    title: 'הגשם התחיל בהפסקה',
    unit: 'קלט ופלט',
    concept: 'חיישן גשם',
    scene: 'בחצר בית הספר התחיל גשם קל. סיסי צריכה להפעיל תגובה שתשמור על הילדים יבשים.',
    sensor: 'rain',
    condition: 'rain',
    action: 'umbrella',
    bug: { part: 'sensor', condition: 'rain', sensor: 'sun', action: 'umbrella' },
    result: 'המטרייה החכמה נפתחת והילדים נשארים יבשים.',
    learningNote: 'חיישן הוא קלט: הוא מרגיש משהו בעולם. פעולה היא פלט: הרובוט עושה משהו בתגובה.'
  },
  {
    id: 2,
    emoji: '☀️',
    title: 'יום שמש חם',
    unit: 'בית חכם',
    concept: 'קלט → פעולה',
    scene: 'השמש חזקה מאוד בחלון הכיתה. סיסי רוצה שהכיתה תישאר נעימה.',
    sensor: 'sun',
    condition: 'sun',
    action: 'shade',
    bug: { part: 'condition', condition: 'rain', sensor: 'sun', action: 'shade' },
    result: 'ההצללה נפתחת והכיתה פחות מסנוורת.',
    learningNote: 'אוטומציה טובה מחברת בין מצב בעולם לבין פעולה מתאימה — בלי ללחוץ ידנית כל פעם.'
  },
  {
    id: 3,
    emoji: '💨',
    title: 'רוח חזקה ליד החלון',
    unit: 'שמירה על ציוד',
    concept: 'בחירת פעולה בטוחה',
    scene: 'הרוח מתחזקת והדפים על השולחן מתחילים לעוף. איזו תגובה תעזור?',
    sensor: 'wind',
    condition: 'wind',
    action: 'closeWindow',
    bug: { part: 'action', condition: 'wind', sensor: 'wind', action: 'shade' },
    result: 'החלון נסגר והדפים נשארים במקום.',
    learningNote: 'לא מספיק לזהות חיישן — צריך לבחור פעולה שבאמת פותרת את הבעיה.'
  },
  {
    id: 4,
    emoji: '🌙',
    title: 'הכיתה נהיית חשוכה',
    unit: 'אור וחושך',
    concept: 'תנאי פשוט',
    scene: 'עננים מסתירים את השמש והכיתה חשוכה. סיסי צריכה לעזור לילדים לראות.',
    sensor: 'dark',
    condition: 'dark',
    action: 'light',
    bug: { part: 'sensor', condition: 'dark', sensor: 'noise', action: 'light' },
    result: 'האור נדלק ואפשר להמשיך לעבוד.',
    learningNote: 'כלל אם-אז הוא דרך פשוטה להסביר לרובוט מתי לפעול: אם חשוך — אז מדליקים אור.'
  },
  {
    id: 5,
    emoji: '🧊',
    title: 'בוקר קר במיוחד',
    unit: 'המלצה חכמה',
    concept: 'מערכת ממליצה',
    scene: 'קר מאוד בבוקר וסיסי רוצה להזכיר לילדים להתלבש חם לפני שיוצאים.',
    sensor: 'cold',
    condition: 'cold',
    action: 'sweater',
    bug: { part: 'action', condition: 'cold', sensor: 'cold', action: 'light' },
    result: 'סיסי מציעה לקחת סוודר לפני היציאה.',
    learningNote: 'לא כל פעולה חייבת להזיז מנוע. גם הודעה או המלצה הן פלט של מערכת חכמה.'
  },
  {
    id: 6,
    emoji: '🔊',
    title: 'רעש בזמן עבודה',
    unit: 'כיתה חכמה',
    concept: 'תגובה עדינה',
    scene: 'הרעש בכיתה עולה בזמן עבודה בזוגות. סיסי צריכה להזכיר לכולם לדבר בשקט.',
    sensor: 'noise',
    condition: 'noise',
    action: 'quiet',
    bug: { part: 'condition', condition: 'wind', sensor: 'noise', action: 'quiet' },
    result: 'מופעל סימן שקט והכיתה חוזרת לעבודה רגועה.',
    learningNote: 'מערכת חכמה בכיתה צריכה לעזור בעדינות, לא להפריע. לכן בוחרים פעולה שמתאימה לילדים.'
  }
];

window.WEATHER_LESSONS.push(
  { id: 7, emoji: '🌦️', title: 'שמש אחרי גשם', unit: 'בחירת חיישן', concept: 'קלט מתאים', scene: 'הגשם נפסק והשמש חזקה בחצר. סיסי צריכה להפעיל פתרון נעים.', sensor: 'sun', condition: 'sun', action: 'shade', bug: { part: 'sensor', condition: 'sun', sensor: 'rain', action: 'shade' }, result: 'ההצללה נפתחת והחצר נעימה.', learningNote: 'בוחרים פעולה לפי הקלט הנוכחי, לא לפי מה שהיה קודם.' },
  { id: 8, emoji: '🌬️', title: 'רוח במסדרון', unit: 'בטיחות', concept: 'תגובה לרוח', scene: 'רוח חזקה טורקת חלון במסדרון. סיסי צריכה להגיב.', sensor: 'wind', condition: 'wind', action: 'closeWindow', bug: { part: 'action', condition: 'wind', sensor: 'wind', action: 'shade' }, result: 'החלון נסגר והמסדרון בטוח.', learningNote: 'חיישן רוח יכול לעזור למערכת לשמור על בטיחות.' },
  { id: 9, emoji: '🌙', title: 'אור בספרייה', unit: 'חיישן אור', concept: 'אם חשוך — הדלק אור', scene: 'הספרייה חשוכה וקשה לקרוא. סיסי בודקת את האור.', sensor: 'dark', condition: 'dark', action: 'light', bug: { part: 'condition', condition: 'sun', sensor: 'dark', action: 'light' }, result: 'האור נדלק והילדים יכולים לקרוא.', learningNote: 'תנאי פשוט מחבר בין מצב לפעולה מתאימה.' },
  { id: 10, emoji: '🧊', title: 'בוקר קר', unit: 'חיישן קור', concept: 'התאמה למזג אוויר', scene: 'בבוקר קר בחצר. סיסי מזכירה להתלבש חם.', sensor: 'cold', condition: 'cold', action: 'sweater', bug: { part: 'sensor', condition: 'cold', sensor: 'dark', action: 'sweater' }, result: 'מופיעה תזכורת לקחת סוודר.', learningNote: 'מערכת טובה עוזרת בזמן הנכון ובעדינות.' },
  { id: 11, emoji: '☔', title: 'ענן הפתעה', unit: 'חיזוי קצר', concept: 'אם גשם — מטרייה', scene: 'טיפות מתחילות לרדת ליד שער בית הספר.', sensor: 'rain', condition: 'rain', action: 'umbrella', bug: { part: 'action', condition: 'rain', sensor: 'rain', action: 'quiet' }, result: 'המטרייה החכמה נפתחת לפני שהילדים נרטבים.', learningNote: 'תגובה מהירה לקלט עוזרת למנוע בעיה ומראה איך חיישן מפעיל פעולה בזמן.' },
  { id: 12, emoji: '🏁', title: 'תחנת מזג אוויר חכמה', unit: 'אתגר סיום', concept: 'חיישן ופעולה מתאימה', scene: 'בכיתה נהיה רעש חזק וקשה לילדים להתרכז. סיסי צריכה לזהות את הרעש ולעזור לכיתה לחזור לעבוד בשקט.', sensor: 'noise', condition: 'noise', action: 'quiet', bug: { part: 'condition', condition: 'dark', sensor: 'noise', action: 'quiet' }, result: 'מצב שקט מופעל והכיתה ממשיכה לעבוד.', learningNote: 'בסיום מחברים קלט, תנאי ופלט למערכת חכמה אחת.' }
);
