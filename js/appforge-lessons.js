(function () {
  const phases = {
    foundations: 'יחידה 1 — אפליקציות Web אמיתיות',
    data: 'יחידה 2 — דאטה, רשימות וזיכרון',
    logic: 'יחידה 3 — לוגיקה, חיפוש וסינון',
    api: 'יחידה 4 — API מדומה ודשבורדים',
    ai: 'יחידה 5 — AI בתוך מוצר',
    project: 'יחידה 6 — פרויקט מוצר אישי'
  };

  const makeStarter = ({ title, subtitle, body, cssExtra = '', js }) => ({
    html: `<main class="app-card">\n  <div class="badge">AppForge</div>\n  <h1>${title}</h1>\n  <p class="intro">${subtitle}</p>\n  ${body}\n</main>`,
    css: `body {\n  font-family: Arial, sans-serif;\n  direction: rtl;\n  text-align: center;\n  background: linear-gradient(135deg, #0f172a, #1d4ed8 55%, #7c3aed);\n  color: #0f172a;\n}\n\n.app-card {\n  background: white;\n  width: min(680px, 94vw);\n  margin: 34px auto;\n  padding: 28px;\n  border-radius: 30px;\n  box-shadow: 0 24px 70px rgba(15, 23, 42, .35);\n}\n\n.badge {\n  display: inline-block;\n  background: #ede9fe;\n  color: #6d28d9;\n  border-radius: 999px;\n  padding: 7px 14px;\n  font-weight: bold;\n}\n\n.intro { color: #475569; line-height: 1.6; }\nbutton { border: 0; border-radius: 999px; padding: 12px 20px; background: #2563eb; color: white; font-weight: bold; cursor: pointer; margin: 6px; }\ninput, select, textarea { width: min(420px, 100%); padding: 12px; border: 2px solid #cbd5e1; border-radius: 14px; margin: 6px; font-family: inherit; }\n.output, #output { background: #f8fafc; border-radius: 18px; padding: 16px; margin-top: 16px; min-height: 54px; text-align: right; }\n.item { background: #eff6ff; border-radius: 14px; padding: 10px; margin: 8px 0; }\n${cssExtra}`,
    js
  });

  const flow = (hook, build, concept, create, debug, share) => [
    { minutes: '0–8', title: `פתיחת מוצר: ${hook}`, teacher: 'פותחים בדמו עובד ושואלים: איזה בעיה המוצר פותר? מי המשתמש?', students: 'מריצים, לוחצים, ומזהים מה האפליקציה עושה.' },
    { minutes: '8–20', title: 'מפרקים למסכים ופעולות', teacher: 'מפרקים את האפליקציה ל־UI, דאטה, פעולה ותוצאה.', students: 'מסמנים קלט, כפתור, רשימה/נתונים ותוצאה.' },
    { minutes: '20–36', title: build, teacher: 'בונים יחד שינוי קטן בקוד ומריצים מיד.', students: 'משנים ערך/שורה אחת ובודקים תוצאה.' },
    { minutes: '36–52', title: concept, teacher: 'נותנים שם מקצועי למושג ומראים רק את השורות החשובות.', students: 'מוצאים בקוד את המושג ומסבירים אותו במילים.' },
    { minutes: '52–70', title: create, teacher: 'נותנים בחירה אישית עם דרישות מינימום ברורות.', students: 'יוצרים גרסה משלהם לאפליקציה.' },
    { minutes: '70–82', title: debug, teacher: 'מדגימים באג אמיתי: שם לא תואם, מערך ריק, תנאי שגוי או שמירה שלא עובדת.', students: 'מתקנים בעזרת רמזים ובדיקות.' },
    { minutes: '82–90', title: share, teacher: 'מבקשים הצגה קצרה: בעיה, פתרון, שורת קוד חשובה.', students: 'משתפים תוצר ומסבירים החלטה אחת.' }
  ];

  const exercises = (keywords) => ['מריצים מוצר','מוצאים קלט','מוצאים פעולה','משנים ערך בטוח','מוסיפים פריט','דיבאג','שדרוג מוצר','הצגה'].map((title, i) => ({
    id: i + 1,
    minutes: `${i * 10}–${i * 10 + 8}`,
    title: `תרגול ${i + 1} — ${title}`,
    prompt: ['הריצו את האפליקציה ותארו מה המשתמש יכול לעשות.','מצאו ב־HTML איפה המשתמש מזין מידע.','מצאו ב־JavaScript איזו function מופעלת בלחיצה.','שנו טקסט, צבע או מספר אחד והריצו שוב.','הוסיפו פריט לרשימה או נתון למערך.','שברו בכוונה משהו קטן ואז תקנו.','הוסיפו שיפור קטן שמשתמש אמיתי היה מעריך.','הציגו לחבר/ה והסבירו שורת קוד אחת.'][i],
    hint: ['קודם להבין את החוויה, אחר כך קוד.','חפשו input, select או textarea.','חפשו onclick או שם function.','אל תשנו שמות id בשלב הזה.','שמרו על פסיקים ומרכאות.','בדקו קונסול/משוב ושמות זהים.','שיפור קטן שעובד עדיף על רעיון ענק שנשבר.','דברו כמו מפתחי מוצר: בעיה → פתרון → קוד.'][i],
    check: { htmlIncludes: ['<main'], cssIncludes: ['background'], jsIncludes: keywords }
  }));

  const lessons = [
    { id: 1, unit: phases.foundations, title: 'אפליקציה ראשונה: מרכז משימות', concept: 'HTML/CSS/JS כמוצר קטן', status: 'ready', story: 'בונים אפליקציית משימות אמיתית: המשתמש כותב משימה, לוחץ, והיא מופיעה ברשימה.', mission: 'להבין שאפליקציה היא שילוב של ממשק, פעולה ודאטה קטן.', starter: makeStarter({ title: 'מרכז המשימות שלי', subtitle: 'כתבו משימה והוסיפו אותה לרשימה.', body: '<input id="taskInput" placeholder="משימה חדשה">\n  <button onclick="addTask()">הוספת משימה</button>\n  <section id="taskList" class="output">אין משימות עדיין.</section>', js: 'const tasks = [];\n\nfunction addTask() {\n  const text = document.getElementById("taskInput").value;\n  tasks.push(text);\n  renderTasks();\n}\n\nfunction renderTasks() {\n  document.getElementById("taskList").innerHTML = tasks.map(task => `<div class="item">✅ ${task}</div>`).join("");\n}' }), vocabulary: [['app','מוצר קטן שפותר פעולה למשתמש'],['array','רשימה של נתונים'],['push','הוספת פריט לרשימה'],['render','ציור הנתונים למסך']], keywords: ['tasks', 'addTask'] },
    { id: 2, unit: phases.foundations, title: 'פרופיל משתמש דינמי', concept: 'state ו־render', status: 'ready', story: 'יוצרים כרטיס פרופיל שמשתנה לפי שם, תפקיד וצבע שהמשתמש בוחר.', mission: 'להכיר state כאובייקט קטן שמייצג את מצב האפליקציה.', starter: makeStarter({ title: 'פרופיל משתמש', subtitle: 'שנו פרטים וראו כרטיס דינמי.', body: '<input id="nameInput" placeholder="שם">\n  <select id="roleInput"><option>מפתח/ת</option><option>מעצב/ת</option><option>חוקר/ת AI</option></select>\n  <button onclick="updateProfile()">עדכון פרופיל</button>\n  <section id="output" class="output"></section>', js: 'const profile = { name: "נועה", role: "מפתח/ת" };\n\nfunction updateProfile() {\n  profile.name = document.getElementById("nameInput").value;\n  profile.role = document.getElementById("roleInput").value;\n  document.getElementById("output").innerHTML = `<h2>${profile.name}</h2><p>${profile.role}</p>`;\n}' }), vocabulary: [['object','אוסף פרטים על דבר אחד'],['state','המצב הנוכחי של האפליקציה'],['property','מאפיין בתוך object'],['innerHTML','ציור HTML למסך']], keywords: ['profile', 'updateProfile'] }
  ];

  const specs = [
    [3, phases.foundations, 'טאבּים ומסכים', 'ניווט בין מסכים באפליקציה', 'בונים אפליקציה עם שני מסכים: בית ונתונים.', 'screen', 'showScreen'], [4, phases.foundations, 'טופס חכם עם בדיקות', 'validation בסיסי', 'בודקים שהמשתמש מילא שם לפני שממשיכים.', 'validate', 'value'], [5, phases.foundations, 'מיני־פרויקט: אפליקציית כיתה', 'חיבור UI + state + render', 'בונים אפליקציה קטנה לניהול רעיונות כיתתיים.', 'ideas', 'render'],
    [6, phases.data, 'רשימת מוצרים', 'arrays ו־map', 'מציגים רשימת מוצרים מכוונת דאטה.', 'products', 'map'], [7, phases.data, 'סינון לפי קטגוריה', 'filter', 'מסננים פריטים לפי קטגוריה שבוחרים.', 'filter', 'category'], [8, phases.data, 'חיפוש חכם', 'includes ו־search', 'יוצרים חיפוש שמחזיר תוצאות בזמן אמת.', 'includes', 'search'], [9, phases.data, 'שמירה בדפדפן', 'localStorage', 'שומרים משימות גם אחרי רענון.', 'localStorage', 'JSON'], [10, phases.data, 'דשבורד קטן', 'חישוב סיכומים', 'מציגים מספר פריטים, ממוצע וסטטוס.', 'reduce', 'length'],
    [11, phases.logic, 'חידון מתקדם', 'conditions ו־score', 'חידון עם ניקוד, רמזים ומשוב.', 'score', 'if'], [12, phases.logic, 'מערכת המלצות', 'rules engine קטן', 'האפליקציה ממליצה לפי בחירות המשתמש.', 'recommend', 'if'], [13, phases.logic, 'מיון ודירוג', 'sort', 'מדרגים פריטים לפי ניקוד/מחיר/עדיפות.', 'sort', 'rating'], [14, phases.logic, 'עגלת בחירה', 'cart state', 'מוסיפים פריטים לעגלה ומחשבים סכום.', 'cart', 'total'], [15, phases.logic, 'מיני־פרויקט: Product Finder', 'חיפוש + סינון + תצוגה', 'בונים כלי למציאת מוצר/משחק/פעילות.', 'products', 'filter'],
    [16, phases.api, 'API מדומה ראשון', 'fetch mock', 'מקבלים נתונים כאילו משרת ומציגים אותם.', 'mockApi', 'Promise'], [17, phases.api, 'מזג אוויר מדומה', 'async data', 'מציגים תחזית לפי עיר מתוך דאטה מדומה.', 'weather', 'async'], [18, phases.api, 'דשבורד נתונים', 'cards ו־metrics', 'בונים דשבורד עם כרטיסי מדדים.', 'metrics', 'dashboard'], [19, phases.api, 'גרף פשוט בלי ספרייה', 'CSS bars', 'מציגים נתונים כעמודות CSS.', 'bar', 'percent'], [20, phases.api, 'מיני־פרויקט: Dashboard', 'API + render + chart', 'בונים דשבורד קטן לעיר/כיתה/משחק.', 'dashboard', 'render'],
    [21, phases.ai, 'Prompt Builder', 'AI prompt structure', 'בונים כלי שמרכיב פרומפט טוב לפי שדות.', 'prompt', 'template'], [22, phases.ai, 'מסווג הודעות', 'classification rules', 'מסווגים הודעות לפי כוונה בעזרת כללים.', 'classify', 'intent'], [23, phases.ai, 'עוזר ניסוח', 'tone transform', 'משנים טון של טקסט: רשמי, חברי, קצר.', 'tone', 'rewrite'], [24, phases.ai, 'AI Safety קטן', 'guardrails', 'בודקים קלט ומחזירים תגובה בטוחה.', 'safe', 'blocked'], [25, phases.ai, 'מיני־פרויקט: AI Helper', 'prompt + rules + UI', 'בונים עוזר AI מדומה למורה/תלמיד.', 'assistant', 'prompt'],
    [26, phases.project, 'תכנון מוצר', 'spec ו־user story', 'מגדירים משתמש, בעיה, מסכים ודאטה.', 'spec', 'userStory'], [27, phases.project, 'בניית MVP', 'minimum viable product', 'בונים גרסה קטנה שעובדת מקצה לקצה.', 'mvp', 'feature'], [28, phases.project, 'דיבאג ו־QA', 'test cases', 'כותבים בדיקות ידניות ומתקנים באגים.', 'testCases', 'bug'], [29, phases.project, 'שיפור UX ופרזנטציה', 'UX polish', 'משפרים טקסטים, צבעים, ריקות וטעינה.', 'ux', 'polish'], [30, phases.project, 'פרויקט סיום: App Demo Day', 'HTML + CSS + JS + data + AI', 'מציגים אפליקציה אישית או צוותית שעובדת.', 'demo', 'project']
  ];

  specs.forEach(([id, unit, title, concept, mission, k1, k2]) => lessons.push({ id, unit, title, concept, status: 'ready', story: mission, mission, starter: makeStarter({ title, subtitle: mission, body: '<button onclick="runApp()">הרצת האפליקציה</button>\n  <section id="output" class="output">מוכן להרצה.</section>', js: `const ${k1} = "${title}";\n\nfunction runApp() {\n  document.getElementById("output").textContent = "${mission}";\n}` }), vocabulary: [['UI','הממשק שהמשתמש רואה'],['data','המידע שהאפליקציה משתמשת בו'],[k1, 'מילת מפתח מרכזית בשיעור'],[k2, 'פעולה או רעיון מרכזי בקוד']], keywords: [k1, k2] }));

  lessons.forEach(lesson => { lesson.durationMinutes = 90; lesson.lessonFlow = flow(lesson.title, 'בנייה מודרכת של פיצ׳ר', `מושג מרכזי: ${lesson.concept}`, 'יצירת גרסה אישית', 'בדיקות ודיבאג', 'Demo קצר'); lesson.exercises = exercises(lesson.keywords || ['output']); lesson.aiHelper = ['הציעו שיפור מוצר קטן שמתאים לגיל ה׳–ו׳.','נסחו user story קצר לאפליקציה הזאת.','עזרו לתלמיד למצוא באג בלי לפתור במקומו.','הציעו איך להציג את הפרויקט בדקה אחת.']; });

  const wowFlow = (hook, build, concept, create) => [
    { minutes: '0–4', title: `וואו ראשון: ${hook}`, teacher: 'בלי הרצאת תחביר: מריצים דמו עובד, נותנים לילדים ללחוץ/להקליד, ומבקשים מהם לצעוק מה השתנה.', students: 'משחקים עם המוצר ורואים תוצאה מיידית.' },
    { minutes: '4–12', title: 'משנים משהו אישי', teacher: 'מבקשים לשנות שם, צבע, קטגוריה או רעיון מצחיק — רק ערך קטן אחד.', students: 'יוצרים גרסה שמרגישה שלהם.' },
    { minutes: '12–24', title: 'מה המוצר עושה?', teacher: 'מדברים במונחי מוצר: משתמש, בעיה, פעולה ותוצאה.', students: 'מסמנים קלט, כפתור, דאטה ותוצאה במסך.' },
    { minutes: '24–40', title: build, teacher: 'בונים פיצ׳ר אחד יחד, שורה אחת בכל פעם, עם הרצה אחרי כל שינוי.', students: 'מעתיקים/משנים תבנית קצרה ומריצים.' },
    { minutes: '40–56', title: concept, teacher: 'נותנים שם מקצועי רק אחרי שזה עובד: array/state/render/validation.', students: 'מוצאים את המילה בקוד ומסבירים אותה בשפה שלהם.' },
    { minutes: '56–74', title: create, teacher: 'נותנים משימה פתוחה עם גבולות: לפחות 3 פריטים, לפחות שינוי עיצוב אחד, לפחות בדיקה אחת.', students: 'בונים שדרוג אישי או זוגי.' },
    { minutes: '74–84', title: 'באג של מפתחים אמיתיים', teacher: 'שוברים בכוונה id/מרכאות/פסיק ומראים איך מתקנים בלי פאניקה.', students: 'מתקנים באג קטן ומריצים מחדש.' },
    { minutes: '84–90', title: 'Demo קצר', teacher: 'כל זוג מציג ב־30 שניות: מה בנינו, למי זה עוזר, ואיזו שורת קוד חשובה.', students: 'מציגים מוצר, לא רק קוד.' }
  ];

  const wowExercises = (keywords, firstPrompt) => [
    ['בדיקת וואו', firstPrompt, 'קודם משחקים עם המוצר. לא מסבירים עדיין את כל הקוד.'],
    ['שינוי אישי', 'שנו שם, צבע, טקסט או פריט אחד כך שהאפליקציה תרגיש שלכם.', 'שנו ערך קטן בתוך מרכאות או מספר.'],
    ['מוצאים את הדאטה', 'מצאו בקוד איפה נשמר המידע של האפליקציה.', 'חפשו const, array [] או object {}.'],
    ['מוצאים את הפעולה', 'מצאו איזו function רצה כשיש לחיצה.', 'חפשו onclick או שם function.'],
    ['מוסיפים פריט', 'הוסיפו עוד משימה/תפקיד/מסך/רעיון לרשימה.', 'שמרו על פסיקים ומרכאות.'],
    ['עיצוב מוצר', 'שנו פרט עיצוב אחד כדי שהאפליקציה תרגיש יותר מקצועית.', 'CSS משנה תחושה: צבע, רווח, פינות, צל.'],
    ['דיבאג קטן', 'תקנו באג של שם לא תואם או ערך ריק.', 'בדקו שה־id ב־HTML זהה למה שה־JS מחפש.'],
    ['Demo למשתמש', 'תנו לחבר/ה להשתמש באפליקציה והסבירו מה היא פותרת.', 'הציגו בעיה → פתרון → שורת קוד אחת.']
  ].map((ex, i) => ({ id: i + 1, minutes: `${i * 10}–${i * 10 + 8}`, title: `תרגול ${i + 1} — ${ex[0]}`, prompt: ex[1], hint: ex[2], check: { htmlIncludes: ['<main'], cssIncludes: ['background'], jsIncludes: keywords } }));

  Object.assign(lessons[0], {
    title: 'Mission Board — אפליקציית משימות סודית',
    story: 'פותחים כמו חדר בקרה: כל ילד מוסיף משימה סודית ללוח, והאפליקציה מיד הופכת אותה לכרטיס משימה. רק אחרי הוואו מגלים שזו רשימה בקוד.',
    mission: 'לבנות Mission Board חי: קלט, כפתור, רשימת משימות, render ותוצאה מיידית שמרגישה כמו מוצר אמיתי.',
    starter: makeStarter({ title: 'Mission Board סודי', subtitle: 'כתבו משימה סודית לצוות — והיא תופיע כלוח מבצעים.', body: '<input id="taskInput" placeholder="למשל: לבנות רובוט שומר">\n  <button onclick="addTask()">🚀 הוספת משימה</button>\n  <button onclick="addSurprise()">🎲 משימת הפתעה</button>\n  <section id="taskList" class="output">אין משימות עדיין. הצוות מחכה...</section>', cssExtra: '\n.item { background: linear-gradient(135deg, #eff6ff, #f5f3ff); border-right: 6px solid #7c3aed; font-weight: bold; }', js: 'const tasks = ["להמציא שם לצוות", "לבנות אב־טיפוס ב־10 דקות"];\n\nfunction addTask() {\n  const text = document.getElementById("taskInput").value;\n  if (!text) return;\n  tasks.push(text);\n  renderTasks();\n}\n\nfunction addSurprise() {\n  tasks.push("משימת הפתעה: להוסיף כפתור מגניב ⚡");\n  renderTasks();\n}\n\nfunction renderTasks() {\n  document.getElementById("taskList").innerHTML = tasks.map((task, index) => `<div class="item">${index + 1}. ✅ ${task}</div>`).join("");\n}\n\nrenderTasks();' }),
    lessonFlow: wowFlow('מוסיפים משימה והיא הופכת לכרטיס בלוח', 'בונים כפתור שמוסיף משימה לרשימה', 'array + push + render', 'Mission Board אישי או זוגי'),
    exercises: wowExercises(['tasks', 'renderTasks'], 'הריצו, הוסיפו משימה סודית, ואז לחצו על “משימת הפתעה”. מה השתנה בלוח?'),
    keywords: ['tasks', 'renderTasks']
  });

  Object.assign(lessons[1], {
    title: 'Avatar Studio — פרופיל גיבור/ת טכנולוגיה',
    story: 'הילדים בונים כרטיס גיבור/ת טכנולוגיה: שם, תפקיד, סמל וכוח מיוחד. כל שינוי בטופס מצייר מחדש את הכרטיס.',
    mission: 'לבנות סטודיו פרופיל דינמי שמראה state אמיתי: הנתונים משתנים והמסך מצויר מחדש.',
    starter: makeStarter({ title: 'Avatar Studio', subtitle: 'צרו גיבור/ת טכנולוגיה לכיתה.', body: '<input id="nameInput" placeholder="שם גיבור/ה">\n  <select id="roleInput"><option>מפתח/ת משחקים</option><option>מעצב/ת רובוטים</option><option>חוקר/ת AI</option></select>\n  <select id="emojiInput"><option>🤖</option><option>🚀</option><option>🧠</option><option>🐉</option></select>\n  <button onclick="updateProfile()">✨ יצירת פרופיל</button>\n  <section id="output" class="output"></section>', cssExtra: '\n.hero-profile { text-align: center; background: #f5f3ff; border-radius: 24px; padding: 18px; }\n.hero-profile .avatar { font-size: 4rem; }', js: 'const profile = { name: "נועה", role: "חוקר/ת AI", emoji: "🧠" };\n\nfunction updateProfile() {\n  profile.name = document.getElementById("nameInput").value || "גיבור/ה מסתורי/ת";\n  profile.role = document.getElementById("roleInput").value;\n  profile.emoji = document.getElementById("emojiInput").value;\n  renderProfile();\n}\n\nfunction renderProfile() {\n  document.getElementById("output").innerHTML = `<div class="hero-profile"><div class="avatar">${profile.emoji}</div><h2>${profile.name}</h2><p>${profile.role}</p><b>כוח מיוחד: לפתור באגים במהירות</b></div>`;\n}\n\nrenderProfile();' }),
    lessonFlow: wowFlow('יוצרים אוואטר והוא מופיע ככרטיס מקצועי', 'מעדכנים state מתוך טופס', 'object + state + render', 'סטודיו אוואטרים לכיתה'),
    exercises: wowExercises(['profile', 'renderProfile'], 'הריצו, בחרו אימוג׳י ותפקיד, וצרו כרטיס גיבור/ת טכנולוגיה.'),
    keywords: ['profile', 'renderProfile']
  });

  Object.assign(lessons[2], {
    title: 'App Screens — אפליקציה עם מסכים',
    story: 'במקום עמוד אחד, הילדים יוצרים אפליקציה שמחליפה מסכים: בית, משימות וסטטוס. זה כבר מרגיש כמו מוצר אמיתי.',
    mission: 'לבנות ניווט בין מסכים ולהבין שמסך הוא state חזותי שהקוד מציג או מסתיר.',
    starter: makeStarter({ title: 'Control Center', subtitle: 'עברו בין מסכים כמו באפליקציה אמיתית.', body: '<button onclick="showScreen(\'home\')">🏠 בית</button>\n  <button onclick="showScreen(\'missions\')">🚀 משימות</button>\n  <button onclick="showScreen(\'status\')">📊 סטטוס</button>\n  <section id="output" class="output"></section>', js: 'const screens = {\n  home: "ברוכים הבאים למרכז הבקרה",\n  missions: "משימות פעילות: בניית אב־טיפוס, בדיקת באגים",\n  status: "סטטוס צוות: 87% מוכנים לדמו"\n};\n\nfunction showScreen(name) {\n  document.getElementById("output").textContent = screens[name];\n}\n\nshowScreen("home");' }),
    lessonFlow: wowFlow('לוחצים והאפליקציה מחליפה מסכים', 'מוסיפים מסך חדש לאובייקט screens', 'object + key + showScreen', 'אפליקציית שלושה מסכים'),
    exercises: wowExercises(['screens', 'showScreen'], 'הריצו ועברו בין בית, משימות וסטטוס. איזה מסך הכי מרגיש כמו אפליקציה?'),
    keywords: ['screens', 'showScreen']
  });

  Object.assign(lessons[3], {
    title: 'Smart Form — טופס שלא נותן לטעות',
    story: 'הטופס מתנהג כמו מוצר אמיתי: אם לא כתבו שם, הוא לא ממשיך; אם מילאו נכון, הוא נותן אישור יפה.',
    mission: 'לבנות טופס עם validation ידידותי: בדיקה לפני פעולה, הודעת שגיאה והודעת הצלחה.',
    starter: makeStarter({ title: 'טופס הרשמה לצוות חלל', subtitle: 'האפליקציה בודקת שהפרטים מספיקים לפני אישור.', body: '<input id="nameInput" placeholder="שם">\n  <select id="teamInput"><option value="">בחרו צוות</option><option>צוות רובוטים</option><option>צוות חלל</option><option>צוות AI</option></select>\n  <button onclick="validateForm()">בדיקת הרשמה</button>\n  <section id="output" class="output"></section>', cssExtra: '\n.error { color: #b91c1c; background: #fee2e2; }\n.success { color: #15803d; background: #dcfce7; }', js: 'function validateForm() {\n  const name = document.getElementById("nameInput").value;\n  const team = document.getElementById("teamInput").value;\n  const output = document.getElementById("output");\n\n  if (!name || !team) {\n    output.className = "output error";\n    output.textContent = "חסרים פרטים — מוצר טוב עוזר למשתמש לתקן.";\n    return;\n  }\n\n  output.className = "output success";\n  output.textContent = name + " שובצת/שובצת ל" + team + " ✅";\n}' }),
    lessonFlow: wowFlow('הטופס מזהה טעות ומחזיר הודעה חכמה', 'בונים תנאי if שמגן על המשתמש', 'validation + if + return', 'טופס הרשמה חכם'),
    exercises: wowExercises(['validateForm', 'if'], 'הריצו בלי למלא פרטים, ואז מלאו נכון. מה ההבדל בהודעה?'),
    keywords: ['validateForm', 'if']
  });

  Object.assign(lessons[4], {
    title: 'Class Ideas — מיני־פרויקט רעיונות כיתתי',
    story: 'השיעור החמישי מחבר הכול: הכיתה מציעה רעיונות, האפליקציה מציגה אותם ככרטיסים, ואפשר להציג Demo אמיתי.',
    mission: 'לבנות מיני־מוצר כיתתי שמקבל רעיונות, שומר אותם ברשימה ומציג אותם יפה.',
    starter: makeStarter({ title: 'בנק הרעיונות של הכיתה', subtitle: 'הוסיפו רעיון לאפליקציה/משחק/כלי AI שהייתם רוצים לבנות.', body: '<input id="ideaInput" placeholder="רעיון מגניב">\n  <button onclick="addIdea()">💡 הוספת רעיון</button>\n  <button onclick="pickIdea()">🎯 בחירת רעיון לדמו</button>\n  <section id="output" class="output"></section>', js: 'const ideas = ["אפליקציית שיעורי בית חכמה", "משחק ניקוד לכיתה", "עוזר AI לניסוח הודעות"];\n\nfunction addIdea() {\n  const idea = document.getElementById("ideaInput").value;\n  if (idea) ideas.push(idea);\n  renderIdeas();\n}\n\nfunction pickIdea() {\n  const idea = ideas[Math.floor(Math.random() * ideas.length)];\n  document.getElementById("output").innerHTML = `<h2>רעיון הדמו: ${idea}</h2>` + ideas.map(item => `<div class="item">💡 ${item}</div>`).join("");\n}\n\nfunction renderIdeas() {\n  document.getElementById("output").innerHTML = ideas.map(item => `<div class="item">💡 ${item}</div>`).join("");\n}\n\nrenderIdeas();' }),
    lessonFlow: wowFlow('מוסיפים רעיון והאפליקציה בוחרת רעיון לדמו', 'מחברים input + array + render + random', 'mini product + MVP', 'בנק רעיונות כיתתי'),
    exercises: wowExercises(['ideas', 'renderIdeas'], 'הריצו, הוסיפו רעיון משלכם, ואז לחצו על בחירת רעיון לדמו.'),
    keywords: ['ideas', 'renderIdeas']
  });

  window.APPFORGE_LESSONS = lessons;
  window.getAppForgeLesson = function (id) { const n = Number(id || 1); return lessons.find(l => l.id === n) || lessons[0]; };
})();
