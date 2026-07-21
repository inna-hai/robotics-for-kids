const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'data', 'state.json');

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

function nowMinus(minutes) {
  return Date.now() - minutes * 60 * 1000;
}

function lessonEdit(number, title, concept, product, intro, blocks) {
  return {
    title,
    concept,
    product,
    objective: `התלמידים יבנו תוצר ברור ב-Craftom, יתרגלו ${concept}, ויסבירו מה עבד להם בצוות.`,
    student_intro: intro,
    steps: [
      'פותחים את אתגר היום וקוראים אותו יחד בקול.',
      'מחלקים תפקידים: מתכנן/ת, בנאי/ת, בודק/ת ומציג/ה.',
      'בונים גרסה ראשונה קטנה שעובדת.',
      'בודקים, מתקנים ומשפרים את התוצר.',
      'מגישים רפלקציה קצרה ומכינים הסבר של דקה.',
    ],
    deliverables: [
      product,
      'צילום/תיאור קצר של מה שנבנה',
      'רפלקציה אישית או צוותית לפי סוג המשימה',
    ],
    reflection: [
      'מה הצליח לי היום?',
      'איזה תפקיד לקחתי בצוות?',
      'מה הייתי עושה אחרת בפעם הבאה?',
    ],
    teacher_plan: [
      'פתיחה של 5 דקות עם הצגת אתגר היום.',
      'הדגמה קצרה של מושג התכנות.',
      'עבודה צוותית עם עצירות בדיקה קצרות.',
      'סבב תוצרים וסימון תצפיות שיתוף פעולה.',
    ],
    observation_focus: [
      'מי מסביר לחבר במקום לעשות במקומו',
      'מי מבקש עזרה בזמן',
      'מי חוזר למשימה אחרי תקלה',
      'מי משתף חומרים ורעיונות',
    ],
    content_blocks: blocks,
    craftom_task: product,
    code_task: `להפעיל מנגנון קצר שמדגים ${concept}.`,
    tasks: [
      {
        id: `lesson-${number}-craftom`,
        lesson_number: number,
        type: 'משימת Craftom',
        scope: 'team',
        title: product,
        description: 'בונים יחד את התוצר בעולם Craftom ושומרים על חלוקת תפקידים.',
        reflection_questions: ['מה בניתם?', 'איך חילקתם תפקידים?', 'מה תיקנתם אחרי בדיקה?'],
      },
      {
        id: `lesson-${number}-code`,
        lesson_number: number,
        type: 'משימת תכנות',
        scope: 'team',
        title: `מנגנון ${concept}`,
        description: `יוצרים מנגנון קטן שמראה שימוש ב-${concept}.`,
        reflection_questions: ['איזה חלק בקוד/פקודה הפעיל את המנגנון?', 'איך בדקתם שהוא עובד?'],
      },
      {
        id: `lesson-${number}-reflection`,
        lesson_number: number,
        type: 'רפלקציה',
        scope: 'individual',
        title: 'סיכום אישי קצר',
        description: 'כל תלמיד כותב 2-3 משפטים על העבודה שלו ועל עבודת הצוות.',
        reflection_questions: ['מה למדתי?', 'למי עזרתי או ממי ביקשתי עזרה?', 'מה הצעד הבא שלי?'],
      },
    ],
    updated_at: nowMinus(210),
    updated_by: 2,
  };
}

const demoPassword = hashPassword('demo123');
const adminPassword = hashPassword(process.env.ADMIN_PASSWORD || 'admin123');

const state = {
  nextUserId: 10,
  nextClassId: 3,
  nextTeamId: 5,
  nextSubmissionId: 13,
  nextObservationId: 9,
  users: [
    { id: 1, email: 'admin@craftom.local', name: 'מנהלת מערכת', role: 'admin', status: 'active', password_hash: adminPassword, created_at: nowMinus(300) },
    { id: 2, email: 'teacher.demo@craftom.local', name: 'יעל המורה', role: 'teacher', status: 'active', password_hash: demoPassword, created_at: nowMinus(285), reviewed_by: 1, reviewed_at: nowMinus(280) },
    { id: 3, email: 'teacher.pending@craftom.local', name: 'מורה ממתינה', role: 'teacher', status: 'pending', password_hash: demoPassword, created_at: nowMinus(40) },
    { id: 4, email: 'student1.demo@craftom.local', name: 'נועה כהן', role: 'student', status: 'active', class_id: 1, team_id: 1, completed_lessons: [1, 2], password_hash: demoPassword, created_at: nowMinus(250) },
    { id: 5, email: 'student2.demo@craftom.local', name: 'איתי לוי', role: 'student', status: 'active', class_id: 1, team_id: 1, completed_lessons: [1], password_hash: demoPassword, created_at: nowMinus(248) },
    { id: 6, email: 'student3.demo@craftom.local', name: 'רוני אברהם', role: 'student', status: 'active', class_id: 1, team_id: 2, completed_lessons: [1], password_hash: demoPassword, created_at: nowMinus(246) },
    { id: 7, email: 'student4.demo@craftom.local', name: 'דניאל מזרחי', role: 'student', status: 'active', class_id: 1, team_id: 2, completed_lessons: [], password_hash: demoPassword, created_at: nowMinus(244) },
    { id: 8, email: 'student5.demo@craftom.local', name: 'מאיה פרץ', role: 'student', status: 'active', class_id: 2, team_id: 3, completed_lessons: [1], password_hash: demoPassword, created_at: nowMinus(235) },
    { id: 9, email: 'student6.demo@craftom.local', name: 'אורי גולן', role: 'student', status: 'active', class_id: 2, team_id: 3, completed_lessons: [], password_hash: demoPassword, created_at: nowMinus(232) },
  ],
  sessions: [],
  classes: [
    { id: 1, name: 'כיתה ד׳ רובוטיקה - קבוצה א׳', code: 'CLASS-DEMO4', teacher_id: 2, open_lesson: 3, created_at: nowMinus(260) },
    { id: 2, name: 'כיתה ד׳ רובוטיקה - קבוצה ב׳', code: 'CLASS-TEAM2', teacher_id: 2, open_lesson: 2, created_at: nowMinus(238) },
  ],
  teams: [
    { id: 1, name: 'צוות הברקים', code: 'TEAM-BOLT', class_id: 1, teacher_id: 2, created_at: nowMinus(230) },
    { id: 2, name: 'צוות הגשרים', code: 'TEAM-BRIDGE', class_id: 1, teacher_id: 2, created_at: nowMinus(228) },
    { id: 3, name: 'צוות הכוכבים', code: 'TEAM-STAR', class_id: 2, teacher_id: 2, created_at: nowMinus(220) },
    { id: 4, name: 'צוות פתוח להצטרפות', code: 'TEAM-JOIN', class_id: 1, teacher_id: 2, created_at: nowMinus(80) },
  ],
  submissions: [
    { id: 1, student_id: 4, team_id: 1, task_id: 'lesson-1-craftom', lesson_number: 1, task_title: 'בניית אזור אישי עם שלט פתיחה', status: 'completed', reflection: 'בנינו שער פתיחה וצבעים לכל חבר צוות.', feedback: 'כל הכבוד. רואים תכנון משותף וחלוקת תפקידים נעימה.', reviewed_by: 2, created_at: nowMinus(210), updated_at: nowMinus(205) },
    { id: 2, student_id: 4, team_id: 1, task_id: 'lesson-1-code', lesson_number: 1, task_title: 'מנגנון פקודה ראשונה', status: 'completed', reflection: 'הפקודה הציבה בלוק במקום הנכון אחרי שתיקנו את הכיוון.', feedback: 'כל הכבוד. בדקתם, גיליתם טעות ותיקנתם אותה כמו מתכנתים.', reviewed_by: 2, created_at: nowMinus(204), updated_at: nowMinus(198) },
    { id: 3, student_id: 4, team_id: null, task_id: 'lesson-1-reflection', lesson_number: 1, task_title: 'סיכום אישי קצר', status: 'completed', reflection: 'עזרתי לאיתי לבחור מקום לשלט. בפעם הבאה אנסה להסביר לפני שאני בונה.', feedback: 'כל הכבוד. זו רפלקציה שמראה מודעות לעבודת צוות.', reviewed_by: 2, created_at: nowMinus(198), updated_at: nowMinus(194) },
    { id: 4, student_id: 5, team_id: null, task_id: 'lesson-1-reflection', lesson_number: 1, task_title: 'סיכום אישי קצר', status: 'submitted', reflection: 'היה לי קשה בהתחלה, ואז ביקשתי מנועה להסביר לי.', feedback: '', created_at: nowMinus(190), updated_at: nowMinus(190) },
    { id: 5, student_id: 6, team_id: 2, task_id: 'lesson-1-craftom', lesson_number: 1, task_title: 'בניית אזור אישי עם שלט פתיחה', status: 'needs_fix', reflection: 'התחלנו לבנות אבל שכחנו לשים שלט עם שם הצוות.', feedback: 'התחלה טובה. הוסיפו שלט ברור ליד הכניסה ואז שלחו שוב.', reviewed_by: 2, created_at: nowMinus(188), updated_at: nowMinus(180) },
    { id: 6, student_id: 4, team_id: 1, task_id: 'lesson-2-craftom', lesson_number: 2, task_title: 'בניית שביל שמחבר בין אזורי הילדים', status: 'completed', reflection: 'תכננו שביל לפי 5 צעדים וחזרנו על אותו דגם.', feedback: 'כל הכבוד. הרצף ברור ואפשר לעקוב אחריו בקלות.', reviewed_by: 2, created_at: nowMinus(120), updated_at: nowMinus(110) },
    { id: 7, student_id: 4, team_id: 1, task_id: 'lesson-2-code', lesson_number: 2, task_title: 'מנגנון רצף פעולות', status: 'submitted', reflection: 'כתבנו שלבים לפי הסדר: התחלה, אמצע, סיום ובדיקה.', feedback: '', created_at: nowMinus(105), updated_at: nowMinus(105) },
    { id: 8, student_id: 4, team_id: null, task_id: 'lesson-2-reflection', lesson_number: 2, task_title: 'סיכום אישי קצר', status: 'submitted', reflection: 'היום הצלחתי לעצור ולתכנן לפני הבנייה.', feedback: '', created_at: nowMinus(102), updated_at: nowMinus(102) },
    { id: 9, student_id: 6, team_id: 2, task_id: 'lesson-2-craftom', lesson_number: 2, task_title: 'בניית שביל שמחבר בין אזורי הילדים', status: 'in_progress', reflection: 'בנינו חצי שביל ורוצים להוסיף סימני כיוון.', feedback: '', created_at: nowMinus(88), updated_at: nowMinus(88) },
    { id: 10, student_id: 8, team_id: 3, task_id: 'lesson-1-craftom', lesson_number: 1, task_title: 'בניית אזור אישי עם שלט פתיחה', status: 'completed', reflection: 'בנינו שער קטן עם צבעי צוות.', feedback: 'כל הכבוד. התוצר ברור ומזמין.', reviewed_by: 2, created_at: nowMinus(85), updated_at: nowMinus(78) },
    { id: 11, student_id: 8, team_id: null, task_id: 'lesson-1-reflection', lesson_number: 1, task_title: 'סיכום אישי קצר', status: 'completed', reflection: 'נהניתי להיות הבודקת של הצוות.', feedback: 'כל הכבוד. תפקיד הבודקת חשוב מאוד לפני הצגה.', reviewed_by: 2, created_at: nowMinus(76), updated_at: nowMinus(70) },
    { id: 12, student_id: 5, team_id: 1, task_id: 'lesson-3-craftom', lesson_number: 3, task_title: 'בניית כיכר עם תבניות חוזרות', status: 'submitted', reflection: 'התחלנו לבנות דוגמה שחוזרת ארבע פעמים סביב הכיכר.', feedback: '', created_at: nowMinus(30), updated_at: nowMinus(30) },
  ],
  observations: [
    { id: 1, student_id: 4, teacher_id: 2, lesson_number: 1, metrics: ['collaborated', 'asked_for_help', 'returned_to_task'], note: 'נועה ביקשה רמז במקום פתרון מלא וחזרה לעבוד עם הצוות.', created_at: nowMinus(200) },
    { id: 2, student_id: 5, teacher_id: 2, lesson_number: 1, metrics: ['helped_others', 'participated'], note: 'איתי עזר בבדיקת השלטים של הצוות.', created_at: nowMinus(196) },
    { id: 3, student_id: 6, teacher_id: 2, lesson_number: 1, metrics: ['participated'], note: 'רוני השתתפה בתכנון, צריכה חיזוק בבקשת עזרה.', created_at: nowMinus(184) },
    { id: 4, student_id: 7, teacher_id: 2, lesson_number: 1, metrics: ['asked_for_help'], note: 'דניאל ביקש עזרה אחרי שניסה לבד שתי דקות.', created_at: nowMinus(175) },
    { id: 5, student_id: 4, teacher_id: 2, lesson_number: 2, metrics: ['led', 'collaborated'], note: 'נועה הובילה תכנון רצף פעולות קצר לצוות.', created_at: nowMinus(95) },
    { id: 6, student_id: 5, teacher_id: 2, lesson_number: 2, metrics: ['returned_to_task'], note: 'איתי חזר למשימה אחרי תקלה במנגנון.', created_at: nowMinus(92) },
    { id: 7, student_id: 8, teacher_id: 2, lesson_number: 1, metrics: ['participated', 'collaborated'], note: 'מאיה בדקה את התוצר לפני ההגשה.', created_at: nowMinus(82) },
    { id: 8, student_id: 9, teacher_id: 2, lesson_number: 1, metrics: ['avoided'], note: 'אורי צפה מהצד רוב הזמן; כדאי לתת לו תפקיד קטן וברור.', created_at: nowMinus(75) },
  ],
  lesson_edits: {
    1: lessonEdit(1, 'ברוכים הבאים לעיר Craftom', 'פקודה ראשונה', 'שער פתיחה אישי וצוותי', 'היום נכנסים לעיר שלנו, בונים שער קטן, ולומדים איך פקודה אחת יכולה לשנות את העולם.', [
      { id: 'lesson-1-story', type: 'text', title: 'סיפור פתיחה', format: 'טקסט קצר', description: 'העיר החדשה צריכה שער כניסה שמראה מי בנה אותה ומה הכללים הראשונים שלנו.', url: '' },
      { id: 'lesson-1-robi', type: 'robi', title: 'רובי שואל', format: 'שאלת הכנה', description: 'איזו פקודה אחת הייתם רוצים לתת לעולם לפני שמתחילים לבנות?', url: '' },
    ]),
    2: lessonEdit(2, 'שביל לפי אלגוריתם', 'רצף פעולות', 'שביל שמחבר בין אזורי הצוותים', 'היום מתכננים שביל לפני שבונים אותו. אם הסדר ברור, גם חבר צוות אחר יכול להמשיך אותנו.', [
      { id: 'lesson-2-plan', type: 'text', title: 'תכנון לפני בנייה', format: 'צ׳ק ליסט', description: 'כתבו 5 צעדים לבניית השביל ורק אחר כך התחילו לבנות.', url: '' },
      { id: 'lesson-2-craftom', type: 'craftom', title: 'פעילות Craftom', format: 'עולם משותף', description: 'בונים שביל עם התחלה, אמצע, סוף וסימני כיוון ברורים.', url: '' },
    ]),
    3: lessonEdit(3, 'כיכר הלולאות', 'לולאות ודפוסים חוזרים', 'כיכר עם דגם שחוזר לפחות 4 פעמים', 'היום מחפשים משהו שחוזר על עצמו. כשיש דפוס חוזר, אפשר לחשוב כמו מתכנתים ולהשתמש בלולאה.', [
      { id: 'lesson-3-pattern', type: 'text', title: 'מחפשים דפוס', format: 'משימת חיפוש', description: 'מצאו בכיתה או בעולם Craftom דוגמה לדבר שחוזר על עצמו.', url: '' },
      { id: 'lesson-3-build', type: 'craftom', title: 'אתגר הכיכר', format: 'בנייה צוותית', description: 'בנו דגם קטן וחזרו עליו סביב הכיכר בארבעה כיוונים.', url: '' },
    ]),
  },
};

fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2));

console.log(`Demo data written to ${DATA_FILE}`);
console.log('Demo accounts:');
console.log('  admin@craftom.local / admin123');
console.log('  teacher.demo@craftom.local / demo123');
console.log('  teacher.pending@craftom.local / demo123');
console.log('  student1.demo@craftom.local / demo123');
console.log('  student2.demo@craftom.local / demo123');
console.log('  student3.demo@craftom.local / demo123');
console.log('  student5.demo@craftom.local / demo123');
console.log('Class codes: CLASS-DEMO4, CLASS-TEAM2');
console.log('Team codes: TEAM-BOLT, TEAM-BRIDGE, TEAM-STAR, TEAM-JOIN');
