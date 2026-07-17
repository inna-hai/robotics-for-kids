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
