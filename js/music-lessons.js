window.MUSIC_LESSONS = [
  {
    id: 1,
    title: 'שלום, מכונת מוזיקה!',
    emoji: '🎵',
    unit: 'דפוס ראשון',
    mission: 'סיסי שומעת דפוס קצר וצריכה לבנות אותו מחדש לפי הסדר — ואז להסביר מה השתנה בכל צליל.',
    concept: 'רצף פקודות = רצף צלילים',
    teacherFact: 'במוזיקה, כמו בקוד, הסדר חשוב: אותו צליל במקום אחר יוצר תוצאה אחרת.',
    target: ['red', 'blue', 'yellow'],
    thinkingTask: {
      question: 'מה קורה בדפוס הזה?',
      options: [
        { id: 'up', text: 'הצלילים עולים אחד־אחד: דו → רה → מי', good: true },
        { id: 'same', text: 'כל הצלילים אותו דבר', good: false },
        { id: 'back', text: 'הדפוס חוזר אחורה', good: false }
      ],
      success: 'נכון — זה דפוס עולה. סיסי לא רק העתיקה, היא זיהתה כיוון.'
    }
  },
  {
    id: 2,
    title: 'המקצב החוזר',
    emoji: '🥁',
    unit: 'חזרות',
    mission: 'סיסי מגלה שמקצב יכול לחזור פעמיים — בדיוק כמו לולאה בתכנות.',
    concept: 'חזרה על דפוס',
    teacherFact: 'לולאה היא דרך להגיד למחשב: עשה את אותו דבר שוב, בלי לכתוב הכול מחדש.',
    target: ['green', 'green', 'blue', 'green', 'green', 'blue'],
    thinkingTask: {
      question: 'איזו לולאה מתארת את המקצב?',
      options: [
        { id: 'loop-a', text: 'חזור פעמיים: פה, פה, רה', good: true },
        { id: 'loop-b', text: 'חזור שלוש פעמים: רה, פה', good: false },
        { id: 'loop-c', text: 'נגן כל צליל פעם אחת בלבד', good: false }
      ],
      success: 'בדיוק — מצאתם את הלולאה במקום להעתיק שישה צלילים אחד־אחד.'
    }
  },
  {
    id: 3,
    title: 'שיר הרובוטים',
    emoji: '🤖',
    unit: 'תבנית',
    mission: 'סיסי בונה שיר רובוטים קטן: צבע אחד פותח, שני צבעים חוזרים, ואז סיום.',
    concept: 'תבנית: התחלה-אמצע-סוף',
    teacherFact: 'תבנית עוזרת לנו לנחש מה בא אחר כך — במוזיקה, במתמטיקה וגם בקוד.',
    target: ['purple', 'red', 'blue', 'red', 'blue', 'yellow'],
    thinkingTask: {
      question: 'מה החלק שחוזר באמצע השיר?',
      options: [
        { id: 'red-blue', text: 'דו, רה חוזרים פעמיים', good: true },
        { id: 'purple-red', text: 'סול, דו חוזרים פעמיים', good: false },
        { id: 'yellow', text: 'מי חוזר כל הזמן', good: false }
      ],
      success: 'נכון — יש פתיחה, חזרה באמצע, וסיום.'
    }
  },
  {
    id: 4,
    title: 'הדיג׳יי הקטן',
    emoji: '🎧',
    unit: 'שיפור יצירתי',
    mission: 'סיסי צריכה להבין את החוק של הדפוס ואז לבחור איזה צליל שובר או מסיים אותו בכוונה.',
    concept: 'דיוק + יצירתיות',
    teacherFact: 'אחרי שמבינים חוק, אפשר לשנות אותו בכוונה וליצור משהו חדש.',
    target: ['blue', 'yellow', 'blue', 'yellow', 'red'],
    thinkingTask: {
      question: 'למה הצליל האחרון מפתיע?',
      options: [
        { id: 'break', text: 'כי אחרי רה-מי, רה-מי מגיע דו שסוגר את הקטע', good: true },
        { id: 'same', text: 'כי הוא ממשיך בדיוק את אותה חזרה', good: false },
        { id: 'random', text: 'כי אין שום חוק לפניו', good: false }
      ],
      success: 'יפה — הדיג׳יי שובר את החזרה בסוף כדי ליצור סיום.'
    }
  },
  {
    id: 5,
    title: 'אורות במה',
    emoji: '💡',
    unit: 'צליל ואור',
    mission: 'כל צליל מדליק אור בצבע אחר. סיסי מסדרת מופע אורות קצר ובודקת איזה פלט יקרה.',
    concept: 'קלט ופלט',
    teacherFact: 'ברובוטיקה, פקודה יכולה לגרום לפלט: אור, צליל, תנועה או הודעה.',
    target: ['yellow', 'red', 'green', 'blue'],
    thinkingTask: {
      question: 'אם כל צליל מדליק אור, מה הפלט של הדפוס?',
      options: [
        { id: 'output', text: 'מי → דו → פה → רה, באותו סדר של האורות', good: true },
        { id: 'reverse', text: 'רה → פה → דו → מי, הפוך מהדפוס', good: false },
        { id: 'one', text: 'רק האור הראשון נדלק', good: false }
      ],
      success: 'נכון — הפלט יוצא לפי סדר הקלט, כמו ברובוטיקה.'
    }
  },
  {
    id: 6,
    title: 'מצא את הטעות במכונת המוזיקה',
    emoji: '🔎',
    unit: 'דיבוג מתקדם',
    mission: 'סיסי קיבלה דפוס ארוך יותר עם חזרה באמצע. צריך לבנות אותו, ואז לגלות איפה קל לטעות.',
    concept: 'דיבוג: למצוא ולתקן ברצף ארוך',
    teacherFact: 'כשרצף נהיה ארוך, מתכנתים בודקים לפי מקום: צליל ראשון, שני, שלישי — עד שמוצאים את הטעות.',
    target: ['red', 'blue', 'green', 'red', 'blue', 'green', 'purple', 'yellow'],
    thinkingTask: {
      question: 'איזה חלק חוזר לפני הסיום?',
      options: [
        { id: 'loop', text: 'דו, רה, פה חוזרים פעמיים — ואז סול, מי', good: true },
        { id: 'all', text: 'כל שמונת הצלילים הם חזרה אחת זהה', good: false },
        { id: 'none', text: 'אין בכלל חזרה בדפוס', good: false }
      ],
      success: 'מעולה — זה כבר דיבוג אמיתי: מזהים את החזרה ואז בודקים את הסיום.'
    }
  }
];

window.MUSIC_NOTES = {
  red: { label: 'דו', icon: '🔴', className: 'red' },
  blue: { label: 'רה', icon: '🔵', className: 'blue' },
  yellow: { label: 'מי', icon: '🟡', className: 'yellow' },
  green: { label: 'פה', icon: '🟢', className: 'green' },
  purple: { label: 'סול', icon: '🟣', className: 'purple' }
};

window.MUSIC_LESSONS.push(
  {
    id: 7,
    title: 'מדרגות צלילים',
    emoji: '🪜',
    unit: 'דפוס עולה ויורד',
    mission: 'סיסי בונה מדרגה מוזיקלית: עולים ואז יורדים. צריך לזהות את הכיוון בכל חלק.',
    concept: 'דפוס עולה ויורד',
    teacherFact: 'דפוס יכול לשנות כיוון. מתכנתים מחפשים את החוק לפני שהם ממשיכים.',
    target: ['red', 'blue', 'yellow', 'blue', 'red'],
    thinkingTask: {
      question: 'איזה חוק מתאים לדפוס?',
      options: [
        { id: 'mountain', text: 'עולים דו-רה-מי ואז יורדים רה-דו', good: true },
        { id: 'same', text: 'כל הצלילים זהים', good: false },
        { id: 'random', text: 'אין כיוון בדפוס', good: false }
      ],
      success: 'נכון — זה דפוס בצורת הר קטן: עליה ואז ירידה.'
    }
  },
  {
    id: 8,
    title: 'הצליל החסר',
    emoji: '❓',
    unit: 'השלמת חוק',
    mission: 'סיסי שומעת דפוס עם חוק ברור וצריכה להשלים את הצליל שמתאים להמשך.',
    concept: 'חיזוי לפי דפוס',
    teacherFact: 'כשמבינים חוק, אפשר לנחש נכון מה יבוא אחר כך — כמו אלגוריתם קטן.',
    target: ['green', 'blue', 'green', 'blue', 'green', 'blue'],
    thinkingTask: {
      question: 'מה החוק שחוזר כאן?',
      options: [
        { id: 'alternate', text: 'פה ואז רה, שוב ושוב', good: true },
        { id: 'green-only', text: 'רק פה חוזר', good: false },
        { id: 'ending', text: 'יש רק צליל סיום בלי חזרה', good: false }
      ],
      success: 'בדיוק — זיהיתם דפוס מתחלף.'
    }
  },
  {
    id: 9,
    title: 'תזמורת תנאים',
    emoji: '🎻',
    unit: 'אם-אז במוזיקה',
    mission: 'סיסי מפעילה צליל גבוה אחרי שני צלילים נמוכים. צריך להבין את התנאי.',
    concept: 'אם יש שני נמוכים — אז צליל גבוה',
    teacherFact: 'תנאי במוזיקה יכול להיות כלל: אם קרה משהו בדפוס, אז מוסיפים תגובה.',
    target: ['red', 'red', 'purple', 'blue', 'blue', 'purple'],
    thinkingTask: {
      question: 'מתי מופיע סול?',
      options: [
        { id: 'after-two', text: 'אחרי שני צלילים זהים', good: true },
        { id: 'start', text: 'רק בתחילת הדפוס', good: false },
        { id: 'never-rule', text: 'בלי קשר למה שהיה לפניו', good: false }
      ],
      success: 'יפה — מצאתם תנאי בתוך רצף מוזיקלי.'
    }
  },
  {
    id: 10,
    title: 'דיבוג בתוף',
    emoji: '🛠️',
    unit: 'מציאת שגיאה',
    mission: 'המקצב כמעט נכון, אבל צריך לבדוק מקום־מקום ולזהות את הדפוס המדויק.',
    concept: 'דיבוג רצף',
    teacherFact: 'בדיבוג לא מנחשים. משווים צעד מול צעד עד שמוצאים איפה הרצף נשבר.',
    target: ['yellow', 'green', 'yellow', 'green', 'yellow', 'red'],
    thinkingTask: {
      question: 'מה מיוחד בצליל האחרון?',
      options: [
        { id: 'break-end', text: 'הוא שובר את מי-פה בסוף כדי לסגור בדו', good: true },
        { id: 'continue', text: 'הוא ממשיך מי-פה כרגיל', good: false },
        { id: 'first', text: 'הוא הצליל הראשון בדפוס', good: false }
      ],
      success: 'נכון — מצאתם את המקום שבו הדפוס משתנה בכוונה.'
    }
  },
  {
    id: 11,
    title: 'לולאה בתוך שיר',
    emoji: '🔁',
    unit: 'חזרה מקוננת פשוטה',
    mission: 'סיסי בונה שיר שבו זוג צלילים חוזר שלוש פעמים ואז מגיע סיום.',
    concept: 'לולאה + סיום',
    teacherFact: 'הרבה שירים בנויים מחזרה ואז סיום קטן שמסמן שהקטע נגמר.',
    target: ['blue', 'purple', 'blue', 'purple', 'blue', 'purple', 'green'],
    thinkingTask: {
      question: 'איזו לולאה יש כאן?',
      options: [
        { id: 'pair-three', text: 'רה-סול חוזרים שלוש פעמים ואז פה', good: true },
        { id: 'all-green', text: 'פה חוזר שבע פעמים', good: false },
        { id: 'no-loop', text: 'אין בכלל חזרה', good: false }
      ],
      success: 'מעולה — זיהיתם לולאה ואז פקודת סיום.'
    }
  },
  {
    id: 12,
    title: 'קונצרט הסיום של סיסי',
    emoji: '🎼',
    unit: 'אתגר סיום',
    mission: 'סיסי משלבת פתיחה, לולאה וסיום בקונצרט קצר. צריך לבנות וגם להסביר.',
    concept: 'אלגוריתם מוזיקלי מלא',
    teacherFact: 'אלגוריתם טוב יכול להיות גם מוזיקלי: פתיחה, חזרה, שינוי וסיום.',
    target: ['red', 'blue', 'yellow', 'blue', 'yellow', 'green', 'purple'],
    thinkingTask: {
      question: 'מה המבנה של הקונצרט?',
      options: [
        { id: 'full', text: 'פתיחה בדו, חזרה רה-מי, ואז פה-סול לסיום', good: true },
        { id: 'only-loop', text: 'רק אותו צליל חוזר כל הזמן', good: false },
        { id: 'reverse', text: 'הכול מנוגן מהסוף להתחלה', good: false }
      ],
      success: 'נהדר — זה אלגוריתם מוזיקלי מלא עם פתיחה, חזרה וסיום.'
    }
  }
);
