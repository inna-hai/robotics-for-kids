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

window.DETECTIVE_LESSONS.push(
  {
    id: 7,
    title: 'מי הפעיל את המאוורר?',
    emoji: '🌀',
    unit: 'חיישן טמפרטורה',
    mission: 'המאוורר נדלק לבד. סיסי בודקת איזה רמז מסביר את הפעולה.',
    concept: 'אם חם — אז מפעילים מאוורר',
    learningNote: 'תנאי עוזר למערכת להגיב רק כשהמצב באמת מתאים.',
    clues: [
      { id: 'hot', text: 'מד הטמפרטורה מראה שחם בכיתה', good: true },
      { id: 'dark', text: 'החדר חשוך', good: false },
      { id: 'quiet', text: 'המסדרון שקט', good: false }
    ],
    rules: [
      { id: 'fan-hot', text: 'אם חם — הפעל מאוורר', good: true },
      { id: 'fan-dark', text: 'אם חשוך — הפעל מאוורר', good: false },
      { id: 'fan-quiet', text: 'אם שקט — הפעל מאוורר', good: false }
    ],
    answer: 'חיישן החום הפעיל את המאוורר.',
    suspects: ['חום', 'חושך', 'שקט']
  },
  {
    id: 8,
    title: 'תעלומת השער הירוק',
    emoji: '🟢',
    unit: 'בדיקת צבע',
    mission: 'שער ירוק נפתח רק לכרטיס מתאים. סיסי צריכה לבחור רמז וכלל.',
    concept: 'אם צבע מתאים — פותחים',
    learningNote: 'מחשב לא מסתפק ב“בערך”. הוא בודק אם הערך שווה בדיוק למה שביקשנו.',
    clues: [
      { id: 'green-ticket', text: 'על הכרטיס מופיע עיגול ירוק', good: true },
      { id: 'yellow-star', text: 'על הרצפה יש כוכב צהוב', good: false },
      { id: 'blue-note', text: 'יש פתק כחול על הקיר', good: false }
    ],
    rules: [
      { id: 'open-green', text: 'אם הכרטיס ירוק — פתח שער', good: true },
      { id: 'open-yellow', text: 'אם יש כוכב צהוב — פתח שער', good: false },
      { id: 'open-blue', text: 'אם יש פתק כחול — פתח שער', good: false }
    ],
    answer: 'הכרטיס הירוק פתח את השער.',
    suspects: ['כרטיס ירוק', 'כוכב צהוב', 'פתק כחול']
  },
  {
    id: 9,
    title: 'הרובוט שנעצר',
    emoji: '🛑',
    unit: 'תנאי עצירה',
    mission: 'הרובוט עצר לפני קיר. סיסי בודקת איזה תנאי שמר עליו.',
    concept: 'אם יש קיר — עצור',
    learningNote: 'תנאי עצירה מונע מהרובוט להמשיך כשזה לא בטוח.',
    clues: [
      { id: 'wall', text: 'חיישן המרחק זיהה קיר קרוב', good: true },
      { id: 'music', text: 'נשמע צליל פעמון', good: false },
      { id: 'flower', text: 'יש פרח ליד הרובוט', good: false }
    ],
    rules: [
      { id: 'stop-wall', text: 'אם יש קיר קרוב — עצור', good: true },
      { id: 'stop-music', text: 'אם יש פעמון — עצור', good: false },
      { id: 'stop-flower', text: 'אם יש פרח — עצור', good: false }
    ],
    answer: 'חיישן המרחק עצר את הרובוט בזמן.',
    suspects: ['קיר', 'פעמון', 'פרח']
  },
  {
    id: 10,
    title: 'מי שלח הודעה?',
    emoji: '💬',
    unit: 'זיהוי אירוע',
    mission: 'המסך הציג הודעת “ברוכים הבאים”. סיסי מחפשת מה הפעיל אותה.',
    concept: 'אירוע גורם לפעולה',
    learningNote: 'אירוע הוא משהו שקורה במערכת ויכול להפעיל קוד.',
    clues: [
      { id: 'button', text: 'מישהו לחץ על כפתור הכניסה', good: true },
      { id: 'paper', text: 'נפל דף מהשולחן', good: false },
      { id: 'rain', text: 'ירד גשם בחוץ', good: false }
    ],
    rules: [
      { id: 'message-button', text: 'אם נלחץ כפתור כניסה — הצג הודעה', good: true },
      { id: 'message-paper', text: 'אם נפל דף — הצג הודעה', good: false },
      { id: 'message-rain', text: 'אם יורד גשם — הצג הודעה', good: false }
    ],
    answer: 'לחיצה על כפתור הכניסה שלחה את ההודעה.',
    suspects: ['כפתור', 'דף', 'גשם']
  },
  {
    id: 11,
    title: 'הקוד הכפול',
    emoji: '🔐',
    unit: 'שני רמזים',
    mission: 'כספת קטנה נפתחת רק כשגם הצבע וגם המספר מתאימים.',
    concept: 'וגם: שני תנאים',
    learningNote: 'לפעמים תנאי אחד לא מספיק. “וגם” אומר ששני הדברים צריכים להיות נכונים יחד.',
    clues: [
      { id: 'red-two', text: 'הקוד הוא אדום ומספר 2', good: true },
      { id: 'red-five', text: 'יש אדום ומספר 5', good: false },
      { id: 'blue-two', text: 'יש כחול ומספר 2', good: false }
    ],
    rules: [
      { id: 'safe-red-two', text: 'אם צבע אדום וגם מספר 2 — פתח כספת', good: true },
      { id: 'safe-red', text: 'אם יש אדום בלבד — פתח כספת', good: false },
      { id: 'safe-two', text: 'אם יש מספר 2 בלבד — פתח כספת', good: false }
    ],
    answer: 'רק אדום ומספר 2 יחד פתחו את הכספת.',
    suspects: ['אדום+2', 'אדום+5', 'כחול+2']
  },
  {
    id: 12,
    title: 'תעלומת הסיום של סיסי',
    emoji: '🏁',
    unit: 'אתגר סיום',
    mission: 'סיסי משלבת רמז, תנאי ופעולה כדי לפתור תעלומה אחרונה.',
    concept: 'חקירה אלגוריתמית מלאה',
    learningNote: 'פתרון טוב מתחיל ברמז נכון, ממשיך בכלל נכון, ומסתיים במסקנה ברורה.',
    clues: [
      { id: 'badge-scan', text: 'תג הכניסה נסרק בשער הראשי', good: true },
      { id: 'window-open', text: 'חלון בכיתה פתוח', good: false },
      { id: 'chair-moved', text: 'כיסא זז מעט', good: false }
    ],
    rules: [
      { id: 'scan-enter', text: 'אם תג נסרק — רשום כניסה', good: true },
      { id: 'window-enter', text: 'אם חלון פתוח — רשום כניסה', good: false },
      { id: 'chair-enter', text: 'אם כיסא זז — רשום כניסה', good: false }
    ],
    answer: 'סריקת התג רשמה את הכניסה במערכת.',
    suspects: ['תג נסרק', 'חלון', 'כיסא']
  }
);
