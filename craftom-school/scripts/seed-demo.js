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

const password = hashPassword('demo123');
const adminPassword = hashPassword(process.env.ADMIN_PASSWORD || 'admin123');

const state = {
  nextUserId: 6,
  nextClassId: 2,
  nextTeamId: 3,
  nextSubmissionId: 6,
  nextObservationId: 5,
  users: [
    {
      id: 1,
      email: 'admin@craftom.local',
      name: 'Admin',
      role: 'admin',
      status: 'active',
      password_hash: adminPassword,
      created_at: nowMinus(180),
    },
    {
      id: 2,
      email: 'teacher.demo@craftom.local',
      name: 'מורה דמו',
      role: 'teacher',
      status: 'active',
      password_hash: password,
      created_at: nowMinus(170),
      reviewed_by: 1,
      reviewed_at: nowMinus(168),
    },
    {
      id: 3,
      email: 'student1.demo@craftom.local',
      name: 'נועה תלמידה',
      role: 'student',
      status: 'active',
      class_id: 1,
      team_id: 1,
      completed_lessons: [1],
      password_hash: password,
      created_at: nowMinus(150),
    },
    {
      id: 4,
      email: 'student2.demo@craftom.local',
      name: 'איתי תלמיד',
      role: 'student',
      status: 'active',
      class_id: 1,
      team_id: 1,
      completed_lessons: [1],
      password_hash: password,
      created_at: nowMinus(145),
    },
    {
      id: 5,
      email: 'student3.demo@craftom.local',
      name: 'רוני תלמידה',
      role: 'student',
      status: 'active',
      class_id: 1,
      team_id: 2,
      completed_lessons: [],
      password_hash: password,
      created_at: nowMinus(140),
    },
  ],
  sessions: [],
  classes: [
    {
      id: 1,
      name: 'כיתה ד׳ דמו',
      code: 'CLASS-DEMO4',
      teacher_id: 2,
      open_lesson: 2,
      created_at: nowMinus(160),
    },
  ],
  teams: [
    {
      id: 1,
      name: 'צוות הבונים',
      code: 'TEAM-BUILD',
      class_id: 1,
      teacher_id: 2,
      created_at: nowMinus(130),
    },
    {
      id: 2,
      name: 'צוות המתכננים',
      code: 'TEAM-PLAN',
      class_id: 1,
      teacher_id: 2,
      created_at: nowMinus(128),
    },
  ],
  submissions: [
    {
      id: 1,
      student_id: 3,
      team_id: 1,
      task_id: 'lesson-1-craftom',
      lesson_number: 1,
      task_title: 'בניית אזור אישי עם שלט פתיחה',
      status: 'completed',
      reflection: 'בנינו אזור פתיחה עם שלט, וחילקנו בינינו תפקידים.',
      feedback: 'כל הכבוד. רואים שהצוות תכנן לפני הבנייה ושמר על סדר בעבודה.',
      reviewed_by: 2,
      created_at: nowMinus(90),
      updated_at: nowMinus(80),
    },
    {
      id: 2,
      student_id: 3,
      team_id: 1,
      task_id: 'lesson-1-code',
      lesson_number: 1,
      task_title: 'מנגנון שמדגים פקודה ראשונה',
      status: 'needs_fix',
      reflection: 'הפקודה עבדה פעם אחת, אבל לא תמיד הבנו למה.',
      feedback: 'התחלה טובה. נסו לכתוב ליד הפקודה מה היא אמורה לעשות, ואז לבדוק אותה שוב יחד.',
      reviewed_by: 2,
      created_at: nowMinus(75),
      updated_at: nowMinus(65),
    },
    {
      id: 3,
      student_id: 3,
      team_id: null,
      task_id: 'lesson-1-reflection',
      lesson_number: 1,
      task_title: 'סיכום אישי קצר',
      status: 'submitted',
      reflection: 'למדתי שצריך לתכנן לפני שבונים. ביקשתי עזרה מאיתי.',
      feedback: '',
      created_at: nowMinus(70),
      updated_at: nowMinus(70),
    },
    {
      id: 4,
      student_id: 4,
      team_id: null,
      task_id: 'lesson-1-reflection',
      lesson_number: 1,
      task_title: 'סיכום אישי קצר',
      status: 'completed',
      reflection: 'עזרתי לנועה למצוא איפה לשים את השלט.',
      feedback: 'כל הכבוד. זו דוגמה יפה לעזרה בצוות בלי לקחת את העבודה ממישהו אחר.',
      reviewed_by: 2,
      created_at: nowMinus(68),
      updated_at: nowMinus(58),
    },
    {
      id: 5,
      student_id: 5,
      team_id: 2,
      task_id: 'lesson-1-craftom',
      lesson_number: 1,
      task_title: 'בניית אזור אישי עם שלט פתיחה',
      status: 'submitted',
      reflection: 'התחלנו לבנות אזור אישי ועוד לא סיימנו את השלט.',
      feedback: '',
      created_at: nowMinus(55),
      updated_at: nowMinus(55),
    },
  ],
  observations: [
    {
      id: 1,
      student_id: 3,
      teacher_id: 2,
      lesson_number: 1,
      metrics: ['collaborated', 'asked_for_help', 'returned_to_task'],
      note: 'נועה ביקשה רמז במקום פתרון מלא וחזרה לעבוד עם הצוות.',
      created_at: nowMinus(50),
    },
    {
      id: 2,
      student_id: 4,
      teacher_id: 2,
      lesson_number: 1,
      metrics: ['helped_others', 'participated'],
      note: 'איתי עזר לחבר צוות להבין את שלבי הבנייה.',
      created_at: nowMinus(48),
    },
    {
      id: 3,
      student_id: 5,
      teacher_id: 2,
      lesson_number: 1,
      metrics: ['participated'],
      note: 'רוני השתתפה בתכנון, אבל עדיין צריכה חיזוק בבקשת עזרה.',
      created_at: nowMinus(45),
    },
    {
      id: 4,
      student_id: 3,
      teacher_id: 2,
      lesson_number: 2,
      metrics: ['led', 'collaborated'],
      note: 'נועה הובילה תכנון רצף פעולות קצר לצוות.',
      created_at: nowMinus(20),
    },
  ],
};

fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2));

console.log(`Demo data written to ${DATA_FILE}`);
console.log('Demo accounts:');
console.log('  admin@craftom.local / admin123');
console.log('  teacher.demo@craftom.local / demo123');
console.log('  student1.demo@craftom.local / demo123');
console.log('  student2.demo@craftom.local / demo123');
console.log('  student3.demo@craftom.local / demo123');
