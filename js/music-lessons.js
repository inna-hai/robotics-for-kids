window.MUSIC_LESSONS = [
  {
    id: 1,
    title: 'שלום, מכונת מוזיקה!',
    emoji: '🎵',
    unit: 'דפוס ראשון',
    mission: 'סיסי שומעת דפוס קצר וצריכה לבנות אותו מחדש לפי הסדר — ואז להסביר מה השתנה בכל צליל.',
    concept: 'רצף פקודות = רצף צלילים',
    teacherFact: 'תווים הם סימנים ושמות שעוזרים למוזיקאים לדעת איזה צליל לנגן. דו, רה, מי, פה וסול הם שמות של תווים. כשמנגנים דו, רה, מי לפי הסדר, הצלילים נשמעים כאילו הם עולים מדרגה. כשמנגנים תווים לפי סדר, נוצרת מנגינה. כמו בקוד, גם במוזיקה הסדר חשוב: אם מחליפים מקום של צליל, המנגינה משתנה.',
    target: ['red', 'blue', 'yellow'],
    thinkingTask: {
      question: 'מה קורה ברצף הזה?',
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
    mission: 'סיסי מציגה מופע אורות קצר. צריך לזהות איזה רצף צלילים מדליק את האורות באותו סדר.',
    concept: 'קלט ופלט',
    teacherFact: 'ברובוטיקה, פקודה יכולה לגרום לפלט: אור, צליל, תנועה או הודעה.',
    target: ['yellow', 'red', 'green', 'blue'],
    thinkingTask: {
      question: 'איך יודעים איזה צליל לבחור לכל אור?',
      options: [
        { id: 'match', text: 'לכל אור יש צליל שמתאים לו', good: true },
        { id: 'random', text: 'בוחרים צלילים בלי קשר לאור', good: false },
        { id: 'first', text: 'כל האורות שייכים לצליל הראשון', good: false }
      ],
      success: 'נכון — פענחתם את הפלט ובניתם את הקלט שמתאים לו.'
    }
  },
  {
    id: 6,
    title: 'מצאו את הצליל שלא מתאים',
    emoji: '🔎',
    unit: 'דיבוג מתקדם',
    mission: 'סיסי בנתה רצף צלילים לפי מתכונת. אבל צליל אחד ברצף לא מתאים למתכונת. מצאו את הצליל שלא מתאים, ובנו למטה את הרצף הנכון.',
    concept: 'דיבוג: למצוא ולתקן טעות אחת',
    teacherFact: 'בדיבוג מחפשים מקום אחד שבו משהו לא מתאים, ואז מתקנים אותו.',
    displayTarget: ['red', 'blue', 'green', 'red', 'yellow', 'green', 'red', 'blue', 'green'],
    target: ['red', 'blue', 'green', 'red', 'blue', 'green', 'red', 'blue', 'green'],
    thinkingTask: {
      question: 'איך מצאתם את הצליל שלא מתאים?',
      options: [
        { id: 'pattern', text: 'בדקנו איזה צליל לא מתאים למתכונת', good: true },
        { id: 'first', text: 'בחרנו תמיד את הצליל הראשון', good: false },
        { id: 'random', text: 'בחרנו צליל בלי לבדוק את הרצף', good: false }
      ],
      success: 'מעולה — מצאתם את המקום שלא מתאים ותיקנתם את הרצף.'
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
    teacherFact: 'צלילים הם כמו מדרגות: יש צלילים נמוכים ויש צלילים גבוהים. כשעוברים מנמוך לגבוה, המנגינה עולה במדרגות. כשעוברים מגבוה לנמוך, המנגינה יורדת במדרגות. מתכנתים מחפשים את החוק לפני שהם ממשיכים.',
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
    mission: 'סיסי התחילה רצף לפי חוק. המשיכו את הרצף למטה לפי החוק שמצאתם.',
    concept: 'חיזוי לפי דפוס',
    teacherFact: 'כשמבינים חוק, אפשר לנחש נכון מה יבוא אחר כך — כמו אלגוריתם קטן.',
    displayTarget: ['green', 'blue', 'green', 'blue'],
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
        { id: 'after-two', text: 'אחרי שני צלילים נמוכים', good: true },
        { id: 'start', text: 'רק בתחילת הדפוס', good: false },
        { id: 'never-rule', text: 'בלי קשר למה שהיה לפניו', good: false }
      ],
      success: 'יפה — מצאתם תנאי בתוך רצף מוזיקלי.'
    }
  },
  {
    id: 10,
    title: 'תקנו את סוף המתכונת',
    emoji: '🛠️',
    unit: 'מציאת שגיאה',
    mission: 'סיסי בנתה רצף לפי מתכונת של 3 צלילים שחוזרת 3 פעמים. משהו ברצף לא מתאים למתכונת. מצאו מה צריך לתקן, ובנו למטה את הרצף הנכון.',
    concept: 'דיבוג רצף לפי מתכונת',
    teacherFact: 'בדיבוג לא רק מסתכלים על הצליל האחרון. מחפשים את המתכונת, ואז בודקים איפה הרצף הפסיק להתאים לה.',
    displayTarget: ['red', 'blue', 'yellow', 'red', 'blue', 'yellow', 'red', 'green', 'purple'],
    target: ['red', 'blue', 'yellow', 'red', 'blue', 'yellow', 'red', 'blue', 'yellow'],
    thinkingTask: {
      question: 'איך ידעתם מה צריך לתקן?',
      options: [
        { id: 'pattern-three', text: 'מצאנו את המתכונת דו-רה-מי ובדקנו מה לא מתאים לה', good: true },
        { id: 'last-only', text: 'בדקנו רק את הצליל האחרון', good: false },
        { id: 'guess', text: 'בחרנו שני צלילים בלי לבדוק את המתכונת', good: false }
      ],
      success: 'נכון — מצאתם את המתכונת ותיקנתם את מה שלא התאים לה.'
    }
  },
  {
    id: 11,
    title: 'לולאה בתוך שיר',
    emoji: '🔁',
    unit: 'חזרה מקוננת פשוטה',
    mission: 'סיסי כתבה שיר עם חלק שחוזר 3 פעמים ואז צליל סיום. בנו למטה את השיר לפי המבנה.',
    concept: 'תרגום לולאה לרצף צלילים',
    teacherFact: 'לולאה עוזרת לבנות רצף ארוך מהוראה קצרה: חוזרים על חלק קטן כמה פעמים, ואז מוסיפים סיום.',
    loopInstruction: {
      repeat: 3,
      pattern: ['blue', 'purple'],
      ending: ['green']
    },
    target: ['blue', 'purple', 'blue', 'purple', 'blue', 'purple', 'green'],
    thinkingTask: {
      question: 'איזו לולאה בניתם?',
      options: [
        { id: 'pair-three', text: 'רה-סול חוזרים שלוש פעמים ואז פה', good: true },
        { id: 'all-green', text: 'פה חוזר שבע פעמים', good: false },
        { id: 'no-loop', text: 'אין בכלל חזרה', good: false }
      ],
      success: 'מעולה — תרגמתם הוראת לולאה לרצף צלילים.'
    }
  },
  {
    id: 12,
    title: 'קונצרט הסיום של סיסי',
    emoji: '🎼',
    unit: 'אתגר סיום',
    mission: 'סיסי כתבה תוכנית לקונצרט: פתיחה, חלק שחוזר פעמיים, ואז סיום. בנו למטה את רצף הצלילים לפי התוכנית.',
    concept: 'אלגוריתם מוזיקלי מלא',
    teacherFact: 'אלגוריתם טוב יכול להיות גם מוזיקלי: מתחילים בפתיחה, חוזרים על חלק קצר, ואז מוסיפים סיום.',
    concertInstruction: {
      opening: ['red'],
      repeat: 2,
      pattern: ['blue', 'yellow'],
      ending: ['green', 'purple']
    },
    target: ['red', 'blue', 'yellow', 'blue', 'yellow', 'green', 'purple'],
    thinkingTask: {
      question: 'מה המבנה של הקונצרט?',
      options: [
        { id: 'full', text: 'פתיחה בדו, חזרה פעמיים על רה-מי, ואז פה-סול לסיום', good: true },
        { id: 'only-loop', text: 'רק אותו צליל חוזר כל הזמן', good: false },
        { id: 'reverse', text: 'הכול מנוגן מהסוף להתחלה', good: false }
      ],
      success: 'נהדר — זה אלגוריתם מוזיקלי מלא עם פתיחה, חזרה וסיום.'
    }
  }
);
