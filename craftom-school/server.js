const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = Number(process.env.PORT || 3081);
const ROOT = __dirname;
const PUBLIC = path.join(ROOT, 'public');
const DATA_FILE = path.join(ROOT, 'data', 'state.json');
const SESSION_TTL_SEC = 30 * 24 * 60 * 60;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

function courseLesson(number, title, concept, product, focus) {
  return {
    number,
    title,
    concept,
    product,
    objective: focus,
    student_intro: `בשיעור הזה נשתמש ב-${concept} כדי להתקדם בבניית עומר העתידית.`,
    steps: [
      'קוראים את אתגר היום ומוודאים שכל חברי הצוות מבינים מה בונים.',
      'מתכננים יחד את סדר הפעולות לפני שמתחילים לבנות.',
      'מבצעים את משימת Craftom ואת משימת התכנות.',
      'בודקים שהתוצר עובד ומכינים הסבר קצר לשיתוף.',
    ],
    craftom_task: product,
    code_task: `לבנות או להפעיל מנגנון קצר שמדגים ${concept}.`,
    deliverables: [
      product,
      'הסבר קצר של 2-3 משפטים על דרך העבודה',
      'רפלקציה אישית קצרה בסוף השיעור',
    ],
    reflection: [
      'מה הצלחתי לבנות או להפעיל היום?',
      'איפה הצוות נתקע ואיך חזרנו למשימה?',
      'למי עזרתי או ממי ביקשתי עזרה?',
    ],
    teacher_plan: [
      'פתיחה קצרה והדגמה של מושג התכנות.',
      'חלוקת צוותים ותפקידים.',
      'מעבר בין הצוותים ושאלות מכוונות במקום פתרון מלא.',
      'סיכום תוצרים ורפלקציה.',
    ],
    observation_focus: [
      'הבנת המשימה',
      'חלוקת תפקידים',
      'בקשת עזרה',
      'התמדה אחרי תקלה',
      'שיתוף פעולה',
    ],
    content_blocks: [
      {
        id: `lesson-${number}-content`,
        type: 'lesson_content',
        title: 'חומר השיעור',
        format: 'לבחירה: וידאו / מצגת / HTML / רובי',
        description: 'כאן יופיע חומר הלמידה אחרי שנחליט יחד על צורת החלוקה.',
      },
    ],
    tasks: [
      {
        id: `lesson-${number}-craftom`,
        lesson_number: number,
        type: 'משימת Craftom',
        scope: 'team',
        title: product,
        description: 'ביצוע המשימה בתוך עולם Craftom.',
        reflection_questions: [
          'מה בניתם?',
          'איזה חלק עבד טוב?',
          'איפה הייתם צריכים עזרה?',
        ],
      },
      {
        id: `lesson-${number}-code`,
        lesson_number: number,
        type: 'משימת תכנות',
        scope: 'team',
        title: `מנגנון שמדגים ${concept}`,
        description: `לבנות או להפעיל מנגנון קצר שמדגים ${concept}.`,
        reflection_questions: [
          'איזה רצף/תנאי/לולאה/אירוע השתמשתם בו?',
          'מה בדקתם כדי לדעת שזה עובד?',
        ],
      },
      {
        id: `lesson-${number}-reflection`,
        lesson_number: number,
        type: 'רפלקציה',
        scope: 'individual',
        title: 'סיכום אישי קצר',
        description: 'תשובה קצרה על העבודה האישית והצוותית.',
        reflection_questions: [
          'מה למדתי היום?',
          'מי עזר לי או למי עזרתי?',
          'מה אנסה לשפר בפעם הבאה?',
        ],
      },
    ],
  };
}

const COURSE = {
  title: 'Craftom — בונים את עומר העתידית',
  total_lessons: 15,
  lessons: [
    courseLesson(1, 'כניסה לעולם Craftom', 'פקודה ראשונה', 'בניית אזור אישי עם שלט פתיחה', 'היכרות עם סביבת העבודה, כללי שרת ועבודה בצוות.'),
    courseLesson(2, 'אלגוריתם בנייה ראשון', 'רצף פעולות', 'בניית שביל שמחבר בין אזורי הילדים', 'הבנה שרצף פעולות הוא אלגוריתם.'),
    courseLesson(3, 'לולאות: בונים מהר וחכם', 'לולאות', 'בניית כיכר עם תבניות חוזרות', 'שימוש בחזרתיות כדי לחסוך עבודה וליצור סדר.'),
    courseLesson(4, 'תנאים: העולם מגיב', 'תנאי if', 'שער כניסה חכם לבית הספר העתידי', 'היכרות עם תנאי ותגובה בעולם.'),
    courseLesson(5, 'חיישנים ואירועים', 'אירועים וטריגרים', 'מסלול ברוכים הבאים עם 3 תחנות', 'הבנת אירוע, טריגר ותגובה.'),
    courseLesson(6, 'הגשר לכפר', 'בדיקת תנאי חומרים', 'גשר קבוצתי שנבנה בשיתוף פעולה', 'תכנון משותף וחלוקת תפקידים.'),
    courseLesson(7, 'שיתוף משאבים', 'חלוקת משאבים', 'תחנת חלוקה קבוצתית', 'תרגול נתינה, בקשה והדדיות.'),
    courseLesson(8, 'מבוך מיקוד', 'רמזים לפי התקדמות', 'מבוך עם משימות ותיבות נסתרות', 'קשב להוראות ופתרון בעיות בשלבים.'),
    courseLesson(9, 'הבנאי העיוור', 'תוכנית לפי שלבים', 'מבנה שנבנה לפי הוראות בלבד', 'תקשורת מדויקת בין תלמידים.'),
    courseLesson(10, 'רובי עוזר במשימה', 'הודעות עזרה', 'סט רמזים חכמים למשימה', 'הבנת תפקידו של עוזר דיגיטלי בלמידה.'),
    courseLesson(11, 'מנגנוני בטיחות וכללים', 'חוקי עולם', 'אזור בית ספר בטוח ומנוהל', 'תכנות ככלי לניהול מרחב משותף.'),
    courseLesson(12, 'משחקון נקודות ואתגר זמן', 'משתנים וניקוד', 'משחקון פנימי בתוך Craftom', 'היכרות עם משתנים, ניקוד וזמן.'),
    courseLesson(13, 'פרויקט גמר — תכנון', 'בחירת מנגנון', 'תוכנית פרויקט וחלוקת תפקידים', 'מעבר ממשימות קצרות לפרויקט צוותי.'),
    courseLesson(14, 'פרויקט גמר — בנייה ותכנות', 'יישום עצמאי', 'אזור פעיל עם רכיב תכנות', 'יישום עצמאי של מנגנון בתוך העולם.'),
    courseLesson(15, 'הצגת תוצרים ודוח Craftom', 'סיור מודרך', 'עולם כיתתי מסכם ודוח התקדמות', 'הצגה, רפלקציה ולמידה מהתהליך.'),
  ],
};

const LESSON_TEMPLATE = {
  identity: [
    'מספר שיעור',
    'שם השיעור',
    'מושג תכנות מרכזי',
    'מיומנות צוותית/חברתית',
    'תוצר מצופה',
  ],
  student: [
    'פתיחת השיעור לתלמידים',
    'אתגר היום',
    'שלבי עבודה קצרים',
    'משימת Craftom',
    'משימת תכנות',
    'מה מגישים בסוף',
    'שאלות רפלקציה',
  ],
  teacher: [
    'מטרת השיעור',
    'הכנה לפני שיעור',
    'הדגמה של 10 דקות',
    'מהלך עבודה של 35-45 דקות',
    'שיתוף תוצרים',
    'נקודות לתצפית',
    'התאמות לקבוצות שצריכות עזרה/אתגר',
  ],
  task_statuses: [
    'לביצוע',
    'בתהליך',
    'הוגש',
    'צריך תיקון',
    'הושלם',
    'משוב',
  ],
  report_fields: [
    'מה עבד',
    'איפה נתקענו',
    'מי עזר',
    'מי ביקש עזרה',
    'מה התלמיד/ה ינסה בפעם הבאה',
  ],
};

const OBSERVATION_METRICS = [
  { id: 'helped_others', label: 'עזר לאחרים' },
  { id: 'asked_for_help', label: 'ביקש עזרה' },
  { id: 'collaborated', label: 'שיתף פעולה' },
  { id: 'returned_to_task', label: 'חזר למשימה אחרי תקלה' },
  { id: 'led', label: 'הוביל' },
  { id: 'participated', label: 'השתתף' },
  { id: 'avoided', label: 'נמנע / התקשה להשתתף' },
];

function defaultState() {
  return {
    nextUserId: 2,
    nextClassId: 1,
    users: [
      {
        id: 1,
        email: 'admin@craftom.local',
        name: 'Admin',
        role: 'admin',
        status: 'active',
        password_hash: hashPassword(process.env.ADMIN_PASSWORD || 'admin123'),
        created_at: Date.now(),
      },
    ],
    sessions: [],
    classes: [],
    teams: [],
    nextTeamId: 1,
    submissions: [],
    nextSubmissionId: 1,
    observations: [],
    nextObservationId: 1,
  };
}

function readState() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    writeState(defaultState());
  }
  const state = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  if (!state.lesson_edits || typeof state.lesson_edits !== 'object') state.lesson_edits = {};
  if (!Array.isArray(state.teams)) state.teams = [];
  if (!state.nextTeamId) state.nextTeamId = state.teams.reduce((max, t) => Math.max(max, Number(t.id) || 0), 0) + 1;
  state.classes.forEach(c => {
    if (!c.open_lesson) c.open_lesson = 1;
  });
  if (!Array.isArray(state.submissions)) state.submissions = [];
  if (!state.nextSubmissionId) state.nextSubmissionId = state.submissions.reduce((max, s) => Math.max(max, Number(s.id) || 0), 0) + 1;
  if (!Array.isArray(state.observations)) state.observations = [];
  if (!state.nextObservationId) state.nextObservationId = state.observations.reduce((max, o) => Math.max(max, Number(o.id) || 0), 0) + 1;
  return state;
}

function writeState(state) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2));
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

function verifyPassword(password, stored) {
  try {
    const [scheme, salt, hash] = String(stored || '').split('$');
    if (scheme !== 'scrypt' || !salt || !hash) return false;
    const expected = Buffer.from(hash, 'hex');
    const actual = crypto.scryptSync(String(password), salt, 64);
    return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk;
      if (raw.length > 1024 * 1024) req.destroy();
    });
    req.on('end', () => {
      try { resolve(raw ? JSON.parse(raw) : {}); }
      catch (err) { reject(err); }
    });
    req.on('error', reject);
  });
}

function cookies(req) {
  const out = {};
  String(req.headers.cookie || '').split(';').forEach(part => {
    const i = part.indexOf('=');
    if (i > -1) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  });
  return out;
}

function publicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status,
    class_id: user.class_id || null,
    team_id: user.team_id || null,
  };
}

function homeUrl(user) {
  if (!user) return '/login.html';
  if (user.role === 'admin' || user.role === 'teacher') return '/teacher.html';
  return '/student.html';
}

function lessonEditForState(state, number) {
  return state.lesson_edits && state.lesson_edits[String(number)] ? state.lesson_edits[String(number)] : null;
}

function lessonForState(state, lesson) {
  const edit = lessonEditForState(state, lesson.number);
  if (!edit) return lesson;
  return {
    ...lesson,
    ...edit,
    number: lesson.number,
    tasks: Array.isArray(edit.tasks) ? edit.tasks : lesson.tasks,
    content_blocks: Array.isArray(edit.content_blocks) ? edit.content_blocks : lesson.content_blocks,
  };
}

function courseForState(state) {
  return {
    ...COURSE,
    lessons: COURSE.lessons.map(lesson => lessonForState(state, lesson)),
  };
}

function lessonsForState(state) {
  return courseForState(state).lessons;
}

function allTasks(state) {
  return lessonsForState(state).flatMap(lesson => lesson.tasks.map(task => ({ ...task, lesson_title: lesson.title })));
}

function findTask(state, taskId) {
  return allTasks(state).find(task => task.id === taskId);
}

function taskSubmission(state, studentId, taskId) {
  return state.submissions.find(s => s.student_id === studentId && s.task_id === taskId) || null;
}

function teamTaskSubmission(state, teamId, taskId) {
  return state.submissions.find(s => s.team_id === teamId && s.task_id === taskId) || null;
}

function taskSubmissionForUser(state, user, task) {
  if (task.scope === 'team' && user.team_id) return teamTaskSubmission(state, user.team_id, task.id);
  return taskSubmission(state, user.id, task.id);
}

function studentTaskView(state, user, task) {
  const submission = taskSubmissionForUser(state, user, task);
  return {
    ...task,
    status: submission ? submission.status : 'to_do',
    submission: submission ? {
      id: submission.id,
      status: submission.status,
      reflection: submission.reflection,
      feedback: submission.feedback || '',
      updated_at: submission.updated_at,
    } : null,
  };
}

function teacherSubmissionView(state, submission) {
  const student = state.users.find(u => u.id === submission.student_id);
  const task = findTask(state, submission.task_id);
  const team = submission.team_id ? state.teams.find(t => t.id === submission.team_id) : null;
  return {
    ...submission,
    student_name: student ? student.name : 'תלמיד/ה',
    student_email: student ? student.email : '',
    team_name: team ? team.name : '',
    task_title: task ? task.title : submission.task_title,
    task_type: task ? task.type : '',
    lesson_title: task ? task.lesson_title : '',
  };
}

function observationView(state, observation) {
  const student = state.users.find(u => u.id === observation.student_id);
  const lesson = lessonsForState(state).find(l => l.number === observation.lesson_number);
  const team = student && student.team_id ? state.teams.find(t => t.id === student.team_id) : null;
  return {
    ...observation,
    student_name: student ? student.name : 'תלמיד/ה',
    lesson_title: lesson ? lesson.title : '',
    team_name: team ? team.name : '',
    labels: observation.metrics.map(id => OBSERVATION_METRICS.find(m => m.id === id)).filter(Boolean).map(m => m.label),
  };
}

function observationSummary(observations) {
  const counts = {};
  observations.forEach(obs => {
    obs.metrics.forEach(metric => {
      counts[metric] = (counts[metric] || 0) + 1;
    });
  });
  return OBSERVATION_METRICS.map(metric => ({
    id: metric.id,
    label: metric.label,
    count: counts[metric.id] || 0,
  }));
}

function teamReport(state, team) {
  const members = state.users
    .filter(u => u.team_id === team.id)
    .map(u => ({ id: u.id, name: u.name, email: u.email }));
  const memberIds = new Set(members.map(m => m.id));
  const teamSubmissions = state.submissions
    .filter(s => s.team_id === team.id)
    .map(s => teacherSubmissionView(state, s));
  const memberReflections = state.submissions
    .filter(s => memberIds.has(s.student_id) && s.reflection)
    .map(s => teacherSubmissionView(state, s));
  return {
    id: team.id,
    name: team.name,
    code: team.code,
    class_id: team.class_id,
    members,
    submitted_team_tasks: teamSubmissions.length,
    team_feedback: teamSubmissions.filter(s => s.feedback),
    team_submissions: teamSubmissions.slice(-8).reverse(),
    member_reflections: memberReflections.slice(-8).reverse(),
  };
}

function friendlyFeedback(text, status) {
  const clean = String(text || '').trim();
  if (clean.startsWith('כל הכבוד') || clean.startsWith('התחלה טובה')) return clean;
  if (!clean) {
    return status === 'needs_fix'
      ? 'התחלה טובה. כדאי לחזור למשימה, לשפר עוד נקודה אחת, ואז לשלוח שוב לבדיקה.'
      : 'כל הכבוד, המשימה הושלמה. המשיכו כך גם במשימה הבאה.';
  }
  if (status === 'needs_fix') {
    return `התחלה טובה. ${clean} נסו לתקן את זה ולשלוח שוב כשאתם מרגישים מוכנים.`;
  }
  return `כל הכבוד. ${clean} רואים כאן התקדמות יפה.`;
}

function teacherTaskOverview(state, students) {
  const lessons = lessonsForState(state);
  return students.flatMap(student => {
    const completed = Array.isArray(student.completed_lessons) ? student.completed_lessons.map(Number) : [];
    const nextLesson = lessons.find(lesson => !completed.includes(lesson.number)) || lessons[lessons.length - 1];
    return nextLesson.tasks.map(task => {
      const submission = taskSubmissionForUser(state, student, task);
      const team = student.team_id ? state.teams.find(t => t.id === student.team_id) : null;
      return {
        student_id: student.id,
        student_name: student.name,
        class_id: student.class_id || null,
        team_id: student.team_id || null,
        team_name: team ? team.name : '',
        lesson_number: nextLesson.number,
        lesson_title: nextLesson.title,
        task_id: task.id,
        task_title: task.title,
        task_type: task.type,
        scope: task.scope || 'individual',
        status: submission ? submission.status : 'to_do',
        feedback: submission ? submission.feedback || '' : '',
        submitted_at: submission ? submission.updated_at : null,
      };
    });
  });
}

function studentHome(user, state) {
  const course = courseForState(state);
  const completed = Array.isArray(user.completed_lessons) ? user.completed_lessons : [];
  const completedSet = new Set(completed.map(Number));
  const klass = user.class_id ? state.classes.find(c => c.id === user.class_id) : null;
  const openLesson = klass ? Number(klass.open_lesson || 1) : course.total_lessons;
  const nextLesson = course.lessons.find(lesson => lesson.number <= openLesson && !completedSet.has(lesson.number)) ||
    course.lessons[Math.max(0, openLesson - 1)] ||
    course.lessons[0];
  const currentNumber = nextLesson.number;
  const lessons = course.lessons.map(lesson => {
    const status = completedSet.has(lesson.number) ? 'completed' : lesson.number <= openLesson ? 'open' : 'locked';
    return { ...lesson, status };
  });
  const currentLesson = lessons.find(lesson => lesson.number === currentNumber) || lessons[0];
  const team = user.team_id ? state.teams.find(t => t.id === user.team_id) : null;
  const pendingTasks = (currentLesson.tasks || []).map(task => studentTaskView(state, user, task));
  const feedback = state.submissions
    .filter(s => s.student_id === user.id && s.feedback)
    .slice(-4)
    .reverse()
    .map(s => ({
      lesson_number: s.lesson_number,
      title: s.task_title,
      status: s.status === 'needs_fix' ? 'needs_fix' : 'feedback',
      message: s.feedback,
    }));
  return {
    course,
    class: klass || null,
    team: team || null,
    progress: {
      completed_count: completedSet.size,
      total_lessons: course.total_lessons,
      current_lesson: currentNumber,
      learned_concepts: course.lessons.filter(l => completedSet.has(l.number)).map(l => l.concept),
    },
    lessons,
    current_lesson: currentLesson,
    tasks: pendingTasks,
    feedback,
    teacher_message: klass ? 'המורה יפתח כאן את המשימה של השיעור הבא.' : 'עדיין לא שובצת לכיתה. אפשר להמשיך לצפות במבנה הקורס.',
  };
}

function lessonStatusForStudent(user, number) {
  const completed = Array.isArray(user.completed_lessons) ? user.completed_lessons.map(Number) : [];
  if (completed.includes(number)) return 'completed';
  const state = readState();
  const klass = user.class_id ? state.classes.find(c => c.id === user.class_id) : null;
  if (klass) return number <= Number(klass.open_lesson || 1) ? 'open' : 'locked';
  const nextOpen = lessonsForState(state).find(lesson => !completed.includes(lesson.number));
  return nextOpen && nextOpen.number === number ? 'open' : 'locked';
}

function lessonDashboard(user, state, number) {
  const course = courseForState(state);
  const lesson = course.lessons.find(l => l.number === number);
  if (!lesson) return null;
  const isStudent = user.role === 'student';
  const status = isStudent ? lessonStatusForStudent(user, number) : 'teacher';
  if (isStudent && status === 'locked') return { locked: true, lesson: { number: lesson.number, title: lesson.title }, status };
  const tasks = isStudent ? lesson.tasks.map(task => studentTaskView(state, user, task)) : lesson.tasks;
  return {
    course,
    lesson: { ...lesson, tasks },
    status,
    mode: isStudent ? 'student' : 'teacher',
    class: user.class_id ? state.classes.find(c => c.id === user.class_id) || null : null,
  };
}

function teacherHome(user, state) {
  const course = courseForState(state);
  const classes = state.classes
    .filter(c => user.role === 'admin' || c.teacher_id === user.id)
    .map(c => {
      const students = state.users.filter(u => u.role === 'student' && u.class_id === c.id);
      return { ...c, student_count: students.length };
    });
  const students = state.users.filter(u => u.role === 'student');
  const pendingTeachers = state.users.filter(u => u.role === 'teacher' && u.status === 'pending');
  const classIds = new Set(classes.map(c => c.id));
  const teams = state.teams
    .filter(t => user.role === 'admin' || classIds.has(t.class_id))
    .map(t => {
      const members = state.users.filter(u => u.team_id === t.id);
      const klass = state.classes.find(c => c.id === t.class_id);
      return { ...t, class_name: klass ? klass.name : '', member_count: members.length };
    });
  const visibleStudentIds = new Set(
    state.users
      .filter(u => u.role === 'student' && (user.role === 'admin' || classIds.has(u.class_id)))
      .map(u => u.id)
  );
  const visibleStudents = state.users.filter(u => visibleStudentIds.has(u.id));
  const submissions = state.submissions
    .filter(s => visibleStudentIds.has(s.student_id))
    .slice(-8)
    .reverse()
    .map(s => teacherSubmissionView(state, s));
  const observations = state.observations
    .filter(o => visibleStudentIds.has(o.student_id))
    .slice(-8)
    .reverse()
    .map(o => observationView(state, o));
  const pendingTeacherRows = user.role === 'admin'
    ? pendingTeachers.map(t => ({
        id: t.id,
        name: t.name,
        email: t.email,
        status: t.status,
        created_at: t.created_at,
      }))
    : [];
  return {
    course,
    classes,
    teams,
    submissions,
    observations,
    observation_metrics: OBSERVATION_METRICS,
    students: visibleStudents.map(s => ({ id: s.id, name: s.name, class_id: s.class_id || null, team_id: s.team_id || null })),
    task_overview: teacherTaskOverview(state, visibleStudents).slice(0, 80),
    pending_teachers: pendingTeacherRows,
    stats: {
      classes: classes.length,
      students: user.role === 'admin' ? students.length : students.filter(s => classes.some(c => c.id === s.class_id)).length,
      lessons: course.total_lessons,
      pending_teachers: pendingTeachers.length,
    },
    next_actions: [
      'ליצור כיתה ולקבל קוד הרשמה לתלמידים',
      'לפתוח את שיעור 1 לתלמידים',
      'להגדיר משימות להגשה ומשוב',
    ],
  };
}

function statusCounts(rows) {
  return rows.reduce((acc, row) => {
    acc[row.status] = (acc[row.status] || 0) + 1;
    return acc;
  }, {});
}

function studentProgressReport(user, state) {
  const course = courseForState(state);
  const klass = user.class_id ? state.classes.find(c => c.id === user.class_id) : null;
  const team = user.team_id ? state.teams.find(t => t.id === user.team_id) : null;
  const completedLessons = Array.isArray(user.completed_lessons) ? user.completed_lessons.map(Number) : [];
  const submissions = state.submissions
    .filter(s => s.student_id === user.id)
    .map(s => teacherSubmissionView(state, s));
  const feedback = submissions.filter(s => s.feedback);
  const observations = state.observations
    .filter(o => o.student_id === user.id)
    .map(o => observationView(state, o));
  return {
    mode: 'student',
    student: publicUser(user),
    class: klass || null,
    lessons: {
      completed: completedLessons.length,
      total: course.total_lessons,
      completed_titles: completedLessons.map(n => course.lessons[n - 1]).filter(Boolean).map(l => `מפגש ${l.number}: ${l.title}`),
    },
    tasks: {
      total_submitted: submissions.length,
      status_counts: statusCounts(submissions),
      rows: submissions.slice(-12).reverse(),
    },
    feedback: feedback.slice(-8).reverse(),
    reflections: submissions.filter(s => s.reflection).slice(-8).reverse(),
    collaboration: {
      status: observations.length ? `${observations.length} תצפיות` : 'עוד לא נאסף',
      note: observations.length ? 'מדדי שיתוף פעולה מתוך תצפיות המורה.' : 'כאשר המורה יסמן תצפיות, הן יופיעו כאן.',
      metrics: observationSummary(observations),
      rows: observations.slice(-8).reverse(),
    },
    teams: {
      status: team ? team.name : 'עוד לא הוגדר צוות',
      note: team ? `קוד צוות: ${team.code}` : 'כאשר התלמיד יצטרף לצוות, דוח הצוות יוצג כאן.',
      report: team ? teamReport(state, team) : null,
    },
  };
}

function teacherProgressReport(user, state) {
  const classes = state.classes.filter(c => user.role === 'admin' || c.teacher_id === user.id);
  const classIds = new Set(classes.map(c => c.id));
  const students = state.users.filter(u => u.role === 'student' && (user.role === 'admin' || classIds.has(u.class_id)));
  const studentIds = new Set(students.map(s => s.id));
  const submissions = state.submissions
    .filter(s => studentIds.has(s.student_id))
    .map(s => teacherSubmissionView(state, s));
  const observations = state.observations
    .filter(o => studentIds.has(o.student_id))
    .map(o => observationView(state, o));
  const teamReports = state.teams
    .filter(t => classes.some(c => c.id === t.class_id))
    .map(t => teamReport(state, t));
  const completedLessons = students.reduce((sum, student) => sum + (Array.isArray(student.completed_lessons) ? student.completed_lessons.length : 0), 0);
  const studentRows = students.map(student => {
    const studentSubmissions = submissions.filter(s => s.student_id === student.id);
    const completed = Array.isArray(student.completed_lessons) ? student.completed_lessons.length : 0;
    return {
      id: student.id,
      name: student.name,
      email: student.email,
      class_id: student.class_id || null,
      completed_lessons: completed,
      submitted_tasks: studentSubmissions.length,
      needs_fix: studentSubmissions.filter(s => s.status === 'needs_fix').length,
      completed_tasks: studentSubmissions.filter(s => s.status === 'completed').length,
      reflections: studentSubmissions.filter(s => s.reflection).length,
      feedback_count: studentSubmissions.filter(s => s.feedback).length,
      observations: state.observations.filter(o => o.student_id === student.id).length,
    };
  });
  return {
    mode: 'teacher',
    classes,
    summary: {
      students: students.length,
      classes: classes.length,
      completed_lessons: completedLessons,
      submitted_tasks: submissions.length,
      feedback_count: submissions.filter(s => s.feedback).length,
      reflections: submissions.filter(s => s.reflection).length,
      observations: observations.length,
      status_counts: statusCounts(submissions),
    },
    students: studentRows,
    submissions: submissions.slice(-12).reverse(),
    teams: {
      status: `${classes.reduce((sum, klass) => sum + state.teams.filter(t => t.class_id === klass.id).length, 0)} צוותים`,
      note: 'משימות צוותיות נשמרות כהגשה של הצוות. דוח שיתוף פעולה מפורט יחובר אחרי שנוסיף תצפיות מורה.',
      reports: teamReports,
    },
    collaboration: {
      status: observations.length ? `${observations.length} תצפיות` : 'עוד לא נאספו תצפיות',
      note: observations.length ? 'סיכום מדדי שיתוף פעולה מתוך תצפיות מורה.' : 'מדדי שיתוף פעולה יחוברו למסך תצפיות מורה: עזרה לאחרים, בקשת עזרה, חלוקת תפקידים והתמדה.',
      metrics: observationSummary(observations),
      rows: observations.slice(-12).reverse(),
    },
  };
}

function cleanList(value) {
  if (Array.isArray(value)) return value.map(item => String(item || '').trim()).filter(Boolean);
  return String(value || '').split('\n').map(item => item.trim()).filter(Boolean);
}

function cleanLessonBlocks(blocks, lessonNumber) {
  if (!Array.isArray(blocks)) return [];
  return blocks.map((block, index) => ({
    id: String(block.id || `lesson-${lessonNumber}-content-${index + 1}`).replace(/[^a-z0-9_-]/gi, '-'),
    type: ['text', 'video', 'audio', 'link', 'html', 'robi', 'craftom', 'file', 'lesson_content'].includes(block.type) ? block.type : 'text',
    title: String(block.title || '').trim() || `בלוק תוכן ${index + 1}`,
    format: String(block.format || '').trim() || 'תוכן שיעור',
    description: String(block.description || '').trim(),
    url: String(block.url || '').trim(),
  }));
}

function cleanLessonTasks(tasks, lessonNumber) {
  if (!Array.isArray(tasks)) return [];
  return tasks.map((task, index) => {
    const type = String(task.type || '').trim() || `משימה ${index + 1}`;
    const suffix = type.toLowerCase().replace(/[^a-z0-9א-ת]+/gi, '-').replace(/^-|-$/g, '') || `task-${index + 1}`;
    return {
      id: String(task.id || `lesson-${lessonNumber}-${suffix}-${index + 1}`).replace(/[^a-z0-9_-]/gi, '-'),
      lesson_number: lessonNumber,
      type,
      scope: task.scope === 'team' ? 'team' : 'individual',
      title: String(task.title || '').trim() || type,
      description: String(task.description || '').trim(),
      reflection_questions: cleanList(task.reflection_questions),
    };
  });
}

function editableLessonPayload(state, number) {
  const lesson = lessonsForState(state).find(l => l.number === number);
  if (!lesson) return null;
  return {
    ...lesson,
    edited: !!lessonEditForState(state, number),
  };
}

function sanitizeLessonEdit(state, number, body) {
  const base = COURSE.lessons.find(l => l.number === number);
  if (!base) return null;
  return {
    title: String(body.title || '').trim() || base.title,
    concept: String(body.concept || '').trim() || base.concept,
    product: String(body.product || '').trim() || base.product,
    objective: String(body.objective || '').trim() || base.objective,
    student_intro: String(body.student_intro || '').trim(),
    steps: cleanList(body.steps),
    deliverables: cleanList(body.deliverables),
    reflection: cleanList(body.reflection),
    teacher_plan: cleanList(body.teacher_plan),
    observation_focus: cleanList(body.observation_focus),
    content_blocks: cleanLessonBlocks(body.content_blocks, number),
    craftom_task: String(body.craftom_task || '').trim(),
    code_task: String(body.code_task || '').trim(),
    tasks: cleanLessonTasks(body.tasks, number),
    updated_at: Date.now(),
  };
}

function currentUser(req, state) {
  const token = cookies(req).craftom_school_sess;
  if (!token) return null;
  const session = state.sessions.find(s => s.token === token && s.expires_at > Date.now());
  if (!session) return null;
  const user = state.users.find(u => u.id === session.user_id);
  if (!user || user.status !== 'active') return null;
  return user;
}

function setSession(res, state, user) {
  const token = crypto.randomBytes(32).toString('hex');
  state.sessions.push({ token, user_id: user.id, created_at: Date.now(), expires_at: Date.now() + SESSION_TTL_SEC * 1000 });
  writeState(state);
  res.setHeader('Set-Cookie', `craftom_school_sess=${token}; HttpOnly; Path=/; Max-Age=${SESSION_TTL_SEC}; SameSite=Lax`);
}

function clearSession(req, res, state) {
  const token = cookies(req).craftom_school_sess;
  if (token) {
    state.sessions = state.sessions.filter(s => s.token !== token);
    writeState(state);
  }
  res.setHeader('Set-Cookie', 'craftom_school_sess=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax');
}

async function api(req, res) {
  const state = readState();
  const lessonMatch = req.url.match(/^\/api\/lessons\/(\d+)$/);
  const completeMatch = req.url.match(/^\/api\/student\/lessons\/(\d+)\/complete$/);
  const submitTaskMatch = req.url.match(/^\/api\/student\/tasks\/([^/]+)\/submit$/);
  const feedbackMatch = req.url.match(/^\/api\/teacher\/submissions\/(\d+)\/feedback$/);
  const teacherStatusMatch = req.url.match(/^\/api\/admin\/teachers\/(\d+)\/status$/);
  const joinTeamMatch = req.url.match(/^\/api\/student\/team\/join$/);
  const classLessonMatch = req.url.match(/^\/api\/classes\/(\d+)\/open-lesson$/);
  const lessonEditMatch = req.url.match(/^\/api\/teacher\/lessons\/(\d+)\/edit$/);

  if (req.method === 'GET' && req.url === '/api/me') {
    const user = currentUser(req, state);
    if (!user) return json(res, 401, { ok: false });
    return json(res, 200, { ok: true, user: publicUser(user), home_url: homeUrl(user) });
  }

  if (req.method === 'POST' && req.url === '/api/register') {
    const body = await readBody(req);
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const accountType = body.account_type === 'student' ? 'student' : 'teacher';
    const classCode = String(body.class_code || '').trim().toUpperCase();

    if (!name) return json(res, 400, { ok: false, error: 'נא להזין שם מלא' });
    if (!/^[^@\s]+@[^@\s]+$/.test(email)) return json(res, 400, { ok: false, error: 'אימייל לא תקין' });
    if (password.length < 6) return json(res, 400, { ok: false, error: 'סיסמה חייבת להכיל לפחות 6 תווים' });
    if (state.users.some(u => u.email === email)) return json(res, 409, { ok: false, error: 'האימייל כבר קיים במערכת' });

    if (accountType === 'student') {
      if (!classCode) return json(res, 400, { ok: false, error: 'תלמיד חייב להירשם עם קוד כיתה' });
      const klass = state.classes.find(c => c.code === classCode);
      if (!klass) return json(res, 400, { ok: false, error: 'קוד כיתה לא תקין' });
      const user = {
        id: state.nextUserId++,
        email,
        name,
        role: 'student',
        status: 'active',
        class_id: klass.id,
        password_hash: hashPassword(password),
        created_at: Date.now(),
      };
      state.users.push(user);
      writeState(state);
      return json(res, 200, { ok: true, role: 'student', status: 'active', home_url: '/student.html' });
    }

    const user = {
      id: state.nextUserId++,
      email,
      name,
      role: 'teacher',
      status: 'pending',
      password_hash: hashPassword(password),
      created_at: Date.now(),
    };
    state.users.push(user);
    writeState(state);
    return json(res, 200, { ok: true, role: 'teacher', status: 'pending' });
  }

  if (req.method === 'POST' && req.url === '/api/login') {
    const body = await readBody(req);
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const user = state.users.find(u => u.email === email);
    if (!user || !verifyPassword(password, user.password_hash)) return json(res, 401, { ok: false, error: 'אימייל או סיסמה שגויים' });
    if (user.status === 'pending') return json(res, 403, { ok: false, error: 'החשבון ממתין לאישור מנהל' });
    if (user.status !== 'active') return json(res, 403, { ok: false, error: 'החשבון מושבת' });
    setSession(res, state, user);
    return json(res, 200, { ok: true, user: publicUser(user), home_url: homeUrl(user) });
  }

  if (req.method === 'POST' && req.url === '/api/logout') {
    clearSession(req, res, state);
    return json(res, 200, { ok: true });
  }

  if (req.method === 'GET' && req.url === '/api/classes') {
    const user = currentUser(req, state);
    if (!user || !['admin', 'teacher'].includes(user.role)) return json(res, 403, { ok: false, error: 'אין הרשאה' });
    return json(res, 200, { ok: true, classes: state.classes });
  }

  if (req.method === 'POST' && req.url === '/api/teams') {
    const user = currentUser(req, state);
    if (!user || !['admin', 'teacher'].includes(user.role)) return json(res, 403, { ok: false, error: 'אין הרשאה' });
    const body = await readBody(req);
    const name = String(body.name || '').trim();
    const classId = Number(body.class_id);
    const klass = state.classes.find(c => c.id === classId && (user.role === 'admin' || c.teacher_id === user.id));
    if (!name) return json(res, 400, { ok: false, error: 'נא להזין שם צוות' });
    if (!klass) return json(res, 400, { ok: false, error: 'כיתה לא נמצאה או אין הרשאה לכיתה' });
    const code = `TEAM-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const team = { id: state.nextTeamId++, name, code, class_id: klass.id, teacher_id: klass.teacher_id, created_at: Date.now() };
    state.teams.push(team);
    writeState(state);
    return json(res, 200, { ok: true, team });
  }

  if (req.method === 'POST' && joinTeamMatch) {
    const user = currentUser(req, state);
    if (!user || user.role !== 'student') return json(res, 403, { ok: false, error: 'רק תלמיד יכול להצטרף לצוות' });
    if (user.team_id) return json(res, 400, { ok: false, error: 'התלמיד כבר משויך לצוות' });
    const body = await readBody(req);
    const teamCode = String(body.team_code || '').trim().toUpperCase();
    const team = state.teams.find(t => t.code === teamCode);
    if (!team) return json(res, 400, { ok: false, error: 'קוד צוות לא תקין' });
    if (team.class_id !== user.class_id) return json(res, 400, { ok: false, error: 'הצוות לא שייך לכיתה של התלמיד' });
    const target = state.users.find(u => u.id === user.id);
    target.team_id = team.id;
    writeState(state);
    return json(res, 200, { ok: true, team });
  }

  if (req.method === 'GET' && req.url === '/api/student/home') {
    const user = currentUser(req, state);
    if (!user || user.role !== 'student') return json(res, 403, { ok: false, error: 'אין הרשאה' });
    return json(res, 200, { ok: true, dashboard: studentHome(user, state) });
  }

  if (req.method === 'GET' && req.url === '/api/teacher/home') {
    const user = currentUser(req, state);
    if (!user || !['admin', 'teacher'].includes(user.role)) return json(res, 403, { ok: false, error: 'אין הרשאה' });
    return json(res, 200, { ok: true, dashboard: teacherHome(user, state) });
  }

  if (req.method === 'GET' && req.url === '/api/reports') {
    const user = currentUser(req, state);
    if (!user) return json(res, 401, { ok: false, error: 'לא מחובר' });
    const report = user.role === 'student' ? studentProgressReport(user, state) : teacherProgressReport(user, state);
    return json(res, 200, { ok: true, report });
  }

  if (req.method === 'GET' && req.url === '/api/lesson-template') {
    const user = currentUser(req, state);
    if (!user || !['admin', 'teacher'].includes(user.role)) return json(res, 403, { ok: false, error: 'אין הרשאה' });
    return json(res, 200, { ok: true, template: LESSON_TEMPLATE });
  }

  if (req.method === 'GET' && lessonMatch) {
    const user = currentUser(req, state);
    if (!user) return json(res, 401, { ok: false, error: 'לא מחובר' });
    const number = Number(lessonMatch[1]);
    const dashboard = lessonDashboard(user, state, number);
    if (!dashboard) return json(res, 404, { ok: false, error: 'שיעור לא נמצא' });
    if (dashboard.locked) return json(res, 403, { ok: false, error: 'השיעור עדיין נעול', dashboard });
    return json(res, 200, { ok: true, dashboard });
  }

  if (lessonEditMatch && req.method === 'GET') {
    const user = currentUser(req, state);
    if (!user || !['admin', 'teacher'].includes(user.role)) return json(res, 403, { ok: false, error: 'אין הרשאה' });
    const number = Number(lessonEditMatch[1]);
    const lesson = editableLessonPayload(state, number);
    if (!lesson) return json(res, 404, { ok: false, error: 'שיעור לא נמצא' });
    return json(res, 200, { ok: true, lesson });
  }

  if (lessonEditMatch && req.method === 'POST') {
    const user = currentUser(req, state);
    if (!user || !['admin', 'teacher'].includes(user.role)) return json(res, 403, { ok: false, error: 'אין הרשאה' });
    const number = Number(lessonEditMatch[1]);
    const body = await readBody(req);
    const edit = sanitizeLessonEdit(state, number, body);
    if (!edit) return json(res, 404, { ok: false, error: 'שיעור לא נמצא' });
    if (!edit.student_intro) return json(res, 400, { ok: false, error: 'נא למלא פתיחה לתלמידים' });
    if (!edit.steps.length) return json(res, 400, { ok: false, error: 'נא להוסיף לפחות שלב עבודה אחד' });
    if (!edit.tasks.length) return json(res, 400, { ok: false, error: 'נא להוסיף לפחות משימה אחת' });
    edit.updated_by = user.id;
    state.lesson_edits[String(number)] = edit;
    writeState(state);
    return json(res, 200, { ok: true, lesson: editableLessonPayload(state, number) });
  }

  if (req.method === 'POST' && completeMatch) {
    const user = currentUser(req, state);
    if (!user || user.role !== 'student') return json(res, 403, { ok: false, error: 'אין הרשאה' });
    const number = Number(completeMatch[1]);
    const status = lessonStatusForStudent(user, number);
    if (!['open', 'completed'].includes(status)) return json(res, 403, { ok: false, error: 'אי אפשר לסמן שיעור נעול' });
    const target = state.users.find(u => u.id === user.id);
    target.completed_lessons = Array.from(new Set([...(target.completed_lessons || []), number])).sort((a, b) => a - b);
    writeState(state);
    return json(res, 200, { ok: true, completed_lessons: target.completed_lessons });
  }

  if (req.method === 'POST' && submitTaskMatch) {
    const user = currentUser(req, state);
    if (!user || user.role !== 'student') return json(res, 403, { ok: false, error: 'אין הרשאה' });
    const taskId = decodeURIComponent(submitTaskMatch[1]);
    const task = findTask(state, taskId);
    if (!task) return json(res, 404, { ok: false, error: 'משימה לא נמצאה' });
    const lessonStatus = lessonStatusForStudent(user, task.lesson_number);
    if (!['open', 'completed'].includes(lessonStatus)) return json(res, 403, { ok: false, error: 'השיעור של המשימה עדיין נעול' });
    if (task.scope === 'team' && !user.team_id) return json(res, 400, { ok: false, error: 'זו משימה צוותית. צריך להצטרף לצוות לפני ההגשה.' });
    const body = await readBody(req);
    const reflection = String(body.reflection || '').trim();
    const now = Date.now();
    let submission = taskSubmissionForUser(state, user, task);
    if (!submission) {
      submission = {
        id: state.nextSubmissionId++,
        student_id: user.id,
        team_id: task.scope === 'team' ? user.team_id : null,
        task_id: task.id,
        lesson_number: task.lesson_number,
        task_title: task.title,
        status: 'submitted',
        reflection,
        feedback: '',
        created_at: now,
        updated_at: now,
      };
      state.submissions.push(submission);
    } else {
      submission.status = 'submitted';
      submission.reflection = reflection;
      submission.updated_at = now;
    }
    writeState(state);
    return json(res, 200, { ok: true, submission });
  }

  if (req.method === 'POST' && feedbackMatch) {
    const user = currentUser(req, state);
    if (!user || !['admin', 'teacher'].includes(user.role)) return json(res, 403, { ok: false, error: 'אין הרשאה' });
    const id = Number(feedbackMatch[1]);
    const submission = state.submissions.find(s => s.id === id);
    if (!submission) return json(res, 404, { ok: false, error: 'הגשה לא נמצאה' });
    const body = await readBody(req);
    const status = ['completed', 'needs_fix', 'submitted'].includes(body.status) ? body.status : 'completed';
    submission.status = status;
    submission.feedback = friendlyFeedback(body.feedback, status);
    submission.reviewed_by = user.id;
    submission.updated_at = Date.now();
    writeState(state);
    return json(res, 200, { ok: true, submission: teacherSubmissionView(state, submission) });
  }

  if (req.method === 'POST' && req.url === '/api/teacher/observations') {
    const user = currentUser(req, state);
    if (!user || !['admin', 'teacher'].includes(user.role)) return json(res, 403, { ok: false, error: 'אין הרשאה' });
    const body = await readBody(req);
    const studentId = Number(body.student_id);
    const lessonNumber = Number(body.lesson_number);
    const metrics = Array.isArray(body.metrics)
      ? body.metrics.filter(id => OBSERVATION_METRICS.some(m => m.id === id))
      : [];
    const note = String(body.note || '').trim();
    const student = state.users.find(u => u.id === studentId && u.role === 'student');
    const lesson = lessonsForState(state).find(l => l.number === lessonNumber);
    if (!student) return json(res, 400, { ok: false, error: 'נא לבחור תלמיד' });
    if (!lesson) return json(res, 400, { ok: false, error: 'נא לבחור שיעור תקין' });
    const allowedClassIds = new Set(state.classes.filter(c => user.role === 'admin' || c.teacher_id === user.id).map(c => c.id));
    if (!allowedClassIds.has(student.class_id)) return json(res, 403, { ok: false, error: 'אין הרשאה לתלמיד הזה' });
    if (!metrics.length && !note) return json(res, 400, { ok: false, error: 'נא לסמן לפחות מדד אחד או לכתוב הערה' });
    const observation = {
      id: state.nextObservationId++,
      student_id: student.id,
      teacher_id: user.id,
      lesson_number: lesson.number,
      metrics,
      note,
      created_at: Date.now(),
    };
    state.observations.push(observation);
    writeState(state);
    return json(res, 200, { ok: true, observation: observationView(state, observation) });
  }

  if (req.method === 'POST' && teacherStatusMatch) {
    const user = currentUser(req, state);
    if (!user || user.role !== 'admin') return json(res, 403, { ok: false, error: 'רק מנהל יכול לאשר מורים' });
    const id = Number(teacherStatusMatch[1]);
    const target = state.users.find(u => u.id === id && u.role === 'teacher');
    if (!target) return json(res, 404, { ok: false, error: 'מורה לא נמצא' });
    const body = await readBody(req);
    const status = body.status === 'active' ? 'active' : body.status === 'rejected' ? 'rejected' : null;
    if (!status) return json(res, 400, { ok: false, error: 'סטטוס לא תקין' });
    target.status = status;
    target.reviewed_by = user.id;
    target.reviewed_at = Date.now();
    writeState(state);
    return json(res, 200, { ok: true, teacher: publicUser(target) });
  }

  if (req.method === 'POST' && req.url === '/api/classes') {
    const user = currentUser(req, state);
    if (!user || !['admin', 'teacher'].includes(user.role)) return json(res, 403, { ok: false, error: 'אין הרשאה' });
    const body = await readBody(req);
    const name = String(body.name || '').trim();
    if (!name) return json(res, 400, { ok: false, error: 'נא להזין שם כיתה' });
    const code = `CLASS-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const klass = { id: state.nextClassId++, name, code, teacher_id: user.id, open_lesson: 1, created_at: Date.now() };
    state.classes.push(klass);
    writeState(state);
    return json(res, 200, { ok: true, class: klass });
  }

  if (req.method === 'POST' && classLessonMatch) {
    const user = currentUser(req, state);
    if (!user || !['admin', 'teacher'].includes(user.role)) return json(res, 403, { ok: false, error: 'אין הרשאה' });
    const classId = Number(classLessonMatch[1]);
    const klass = state.classes.find(c => c.id === classId && (user.role === 'admin' || c.teacher_id === user.id));
    if (!klass) return json(res, 404, { ok: false, error: 'כיתה לא נמצאה או אין הרשאה' });
    const body = await readBody(req);
    const openLesson = Math.max(1, Math.min(COURSE.total_lessons, Number(body.open_lesson || 1)));
    klass.open_lesson = openLesson;
    writeState(state);
    return json(res, 200, { ok: true, class: klass });
  }

  return json(res, 404, { ok: false, error: 'not found' });
}

function staticFile(req, res) {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  const fileName = urlPath === '/' ? 'index.html' : urlPath.replace(/^\/+/, '');
  const filePath = path.normalize(path.join(PUBLIC, fileName));
  if (!filePath.startsWith(PUBLIC)) {
    res.writeHead(403);
    return res.end('forbidden');
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end('not found');
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/api/')) {
    api(req, res).catch(err => {
      console.error(err);
      json(res, 500, { ok: false, error: 'server error' });
    });
    return;
  }
  staticFile(req, res);
});

server.listen(PORT, () => {
  console.log(`Craftom School running on http://127.0.0.1:${PORT}`);
  console.log('Seed admin: admin@craftom.local / admin123');
});
