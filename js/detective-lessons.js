window.DETECTIVE_LESSONS = [
  {
    id: 1,
    title: 'מי לקח את הכוכב?',
    emoji: '⭐',
    unit: 'רמז אחד ברור',
    mission: 'סיסי מחפשת מי לקח את הכוכב מהמדף. צריך לבחור את הרמז הנכון ואת הכלל המתאים.',
    concept: 'אם יש רמז — אז מסיקים מסקנה',
    learningNote: 'תנאי בתכנות עובד כמו חקירה: אם משהו נכון, עושים פעולה מתאימה.',
    clues: [
      { id: 'glitter', text: 'יש נצנצים צהובים ליד המדף', good: true },
      { id: 'water', text: 'יש טיפה קטנה ליד הדלת', good: false },
      { id: 'feather', text: 'יש נוצה כחולה על הרצפה', good: false }
    ],
    rules: [
      { id: 'star', text: 'אם יש נצנצים צהובים — הכוכב אצל לולי', good: true },
      { id: 'fish', text: 'אם יש מים — האוצר אצל דגי', good: false },
      { id: 'bird', text: 'אם יש נוצה — המפתח אצל ציפי', good: false }
    ],
    answer: 'לולי לקחה את הכוכב כדי לקשט את הרובוט.',
    suspects: ['לולי', 'דגי', 'ציפי']
  },
  {
    id: 2,
    title: 'הדלת שלא נפתחת',
    emoji: '🚪',
    unit: 'תנאי פשוט',
    mission: 'דלת המעבדה נעולה. סיסי צריכה להבין איזה כרטיס פותח אותה.',
    concept: 'אם צבע מתאים — פותחים',
    learningNote: 'מחשב בודק תנאי בדיוק: אם הכרטיס ירוק, פתח. אם לא, אל תפתח.',
    clues: [
      { id: 'green-card', text: 'על הדלת כתוב: רק כרטיס ירוק פותח', good: true },
      { id: 'red-card', text: 'כרטיס אדום מונח ליד החלון', good: false },
      { id: 'blue-key', text: 'מפתח כחול מצויר על הקיר', good: false }
    ],
    rules: [
      { id: 'open-green', text: 'אם הכרטיס ירוק — פתח את הדלת', good: true },
      { id: 'open-red', text: 'אם הכרטיס אדום — פתח את הדלת', good: false },
      { id: 'open-blue', text: 'אם יש ציור כחול — פתח את הדלת', good: false }
    ],
    answer: 'צריך כרטיס ירוק. זה תנאי מדויק.',
    suspects: ['כרטיס ירוק', 'כרטיס אדום', 'ציור כחול']
  },
  {
    id: 3,
    title: 'הרובוט מצפצף',
    emoji: '📣',
    unit: 'בדיקת סיבה',
    mission: 'הרובוט מצפצף שוב ושוב. סיסי בודקת מה גרם לזה.',
    concept: 'אם חיישן מרגיש — אז מגיבים',
    learningNote: 'חיישן נותן מידע. הקוד מחליט מה לעשות לפי המידע הזה.',
    clues: [
      { id: 'too-close', text: 'הרובוט עומד קרוב מדי לקיר', good: true },
      { id: 'cold', text: 'בחדר קצת קר', good: false },
      { id: 'book', text: 'יש ספר פתוח על השולחן', good: false }
    ],
    rules: [
      { id: 'beep-wall', text: 'אם קרוב לקיר — צפצף והתרחק', good: true },
      { id: 'beep-cold', text: 'אם קר — צפצף ורקוד', good: false },
      { id: 'beep-book', text: 'אם יש ספר — צפצף חזק', good: false }
    ],
    answer: 'החיישן מזהה קיר קרוב, לכן הרובוט מצפצף.',
    suspects: ['קיר', 'קור', 'ספר']
  },
  {
    id: 4,
    title: 'העוגייה הנעלמת',
    emoji: '🍪',
    unit: 'שני רמזים',
    mission: 'עוגייה נעלמה מהצלחת. הפעם צריך לשים לב לרמז הכי מתאים ולא להתבלבל.',
    concept: 'בחירת תנאי מתאים',
    learningNote: 'כשיש כמה אפשרויות, חשוב לבחור את התנאי שבאמת קשור לבעיה.',
    clues: [
      { id: 'crumbs', text: 'יש פירורים ליד הכיסא של מימי', good: true },
      { id: 'pencil', text: 'עיפרון נפל מתחת לשולחן', good: false },
      { id: 'rain', text: 'בחוץ ירד גשם בבוקר', good: false }
    ],
    rules: [
      { id: 'cookie-crumbs', text: 'אם יש פירורים ליד הכיסא — מימי טעמה מהעוגייה', good: true },
      { id: 'cookie-pencil', text: 'אם יש עיפרון — העוגייה בכיתה אחרת', good: false },
      { id: 'cookie-rain', text: 'אם ירד גשם — העוגייה נרטבה', good: false }
    ],
    answer: 'מימי טעמה מהעוגייה והשארה פירורים.',
    suspects: ['מימי', 'עיפרון', 'גשם']
  },
  {
    id: 5,
    title: 'תיקון מכונת המיץ',
    emoji: '🧃',
    unit: 'אם/אחרת',
    mission: 'מכונת המיץ עובדת רק אם הכוס במקום. סיסי צריכה לבחור כלל בטיחות.',
    concept: 'אם התנאי נכון — פעולה; אחרת — עצירה',
    learningNote: 'לפעמים בקוד יש גם אחרת: אם הכוס במקום מזוג, אחרת עצור.',
    clues: [
      { id: 'cup-missing', text: 'אין כוס מתחת למכונה', good: true },
      { id: 'orange', text: 'המיץ בצבע כתום', good: false },
      { id: 'sticker', text: 'על המכונה יש מדבקה יפה', good: false }
    ],
    rules: [
      { id: 'no-cup-stop', text: 'אם אין כוס — אל תמזוג', good: true },
      { id: 'orange-pour', text: 'אם המיץ כתום — מזוג תמיד', good: false },
      { id: 'sticker-pour', text: 'אם יש מדבקה — מזוג מהר', good: false }
    ],
    answer: 'אין כוס, אז המכונה צריכה לעצור ולא למזוג.',
    suspects: ['אין כוס', 'מיץ כתום', 'מדבקה']
  },
  {
    id: 6,
    title: 'תעלומת האור',
    emoji: '💡',
    unit: 'אתגר סיום',
    mission: 'האור נדלק לבד. סיסי צריכה להבין איזה חיישן הפעיל אותו.',
    concept: 'קלט מחיישן → פעולה',
    learningNote: 'מערכת חכמה מקבלת קלט, בודקת תנאי, ואז מבצעת פעולה.',
    clues: [
      { id: 'motion', text: 'מישהו עבר ליד החיישן', good: true },
      { id: 'music', text: 'נשמעה מוזיקה במסדרון', good: false },
      { id: 'flower', text: 'יש עציץ ליד הדלת', good: false }
    ],
    rules: [
      { id: 'motion-light', text: 'אם יש תנועה — הדלק אור', good: true },
      { id: 'music-light', text: 'אם יש מוזיקה — הדלק אור', good: false },
      { id: 'flower-light', text: 'אם יש עציץ — הדלק אור', good: false }
    ],
    answer: 'חיישן התנועה הפעיל את האור.',
    suspects: ['תנועה', 'מוזיקה', 'עציץ']
  }
];
