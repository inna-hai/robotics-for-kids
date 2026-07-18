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
    html: `<main class="app-card">\n  <div class="badge">WebMakers</div>\n  <h1>${title}</h1>\n  <p class="intro">${subtitle}</p>\n  ${body}\n</main>`,
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

  const productOverrides = [
    {
      index: 5,
      title: 'Gadget Store — חנות גאדג׳טים חכמה',
      story: 'הילדים מקבלים חנות קטנה של גאדג׳טים לכיתה: רובוט, רחפן, מנורת גיימינג ועוד. הם רואים שמוצר אמיתי מתחיל מדאטה שמצויר למסך.',
      mission: 'לבנות קטלוג מוצרים חי מתוך array ולהבין ש־map הופך דאטה לכרטיסים במסך.',
      body: '<button onclick="renderProducts()">🛒 פתיחת החנות</button>\n  <section id="output" class="output"></section>',
      js: 'const products = [\n  { name: "רובוט שולחני", price: 79, emoji: "🤖" },\n  { name: "רחפן מיני", price: 120, emoji: "🚁" },\n  { name: "מנורת גיימינג", price: 45, emoji: "💡" }\n];\n\nfunction renderProducts() {\n  document.getElementById("output").innerHTML = products.map(product => `<div class="item">${product.emoji} ${product.name} — ${product.price}₪</div>`).join("");\n}\n\nrenderProducts();',
      concept: 'array of objects + map', keywords: ['products','map'], hook: 'חנות גאדג׳טים מופיעה מכמה שורות דאטה'
    },
    {
      index: 6,
      title: 'Filter Lab — מסנן בחירות חכם',
      story: 'בונים מסנן כמו באתר אמיתי: בוחרים קטגוריה, ורק הפריטים המתאימים נשארים על המסך.',
      mission: 'להבין filter דרך מוצר שימושי: סינון משחקים/גאדג׳טים לפי קטגוריה.',
      body: '<select id="categoryInput"><option value="all">הכול</option><option value="game">משחקים</option><option value="robot">רובוטים</option></select>\n  <button onclick="filterItems()">🔎 סינון</button>\n  <section id="output" class="output"></section>',
      js: 'const items = [\n  { name: "משחק חלל", category: "game" },\n  { name: "רובוט עוזר", category: "robot" },\n  { name: "משחק חידות", category: "game" }\n];\n\nfunction filterItems() {\n  const category = document.getElementById("categoryInput").value;\n  const results = category === "all" ? items : items.filter(item => item.category === category);\n  document.getElementById("output").innerHTML = results.map(item => `<div class="item">${item.name}</div>`).join("");\n}\n\nfilterItems();',
      concept: 'filter + category', keywords: ['filter','category'], hook: 'לוחצים והמסך מציג רק מה שבחרנו'
    },
    {
      index: 7,
      title: 'Search Station — תחנת חיפוש מהירה',
      story: 'האפליקציה מרגישה כמו מנוע חיפוש קטן: מקלידים מילה ומקבלים תוצאות מתוך רשימה.',
      mission: 'לבנות חיפוש ידידותי עם includes ולהבין איך אפליקציות מוצאות מידע.',
      body: '<input id="searchInput" placeholder="חפשו רובוט / משחק / AI">\n  <button onclick="searchItems()">🔍 חיפוש</button>\n  <section id="output" class="output"></section>',
      js: 'const ideas = ["רובוט מנקה שולחן", "משחק חלל", "עוזר AI לשיעורים", "אפליקציית ציור"];\n\nfunction searchItems() {\n  const search = document.getElementById("searchInput").value;\n  const results = ideas.filter(idea => idea.includes(search));\n  document.getElementById("output").innerHTML = results.map(idea => `<div class="item">🔍 ${idea}</div>`).join("") || "לא נמצאו תוצאות";\n}\n\nsearchItems();',
      concept: 'search + includes', keywords: ['includes','search'], hook: 'כותבים מילה והאפליקציה מוצאת תוצאות'
    },
    {
      index: 8,
      title: 'Save Magic — אפליקציה שזוכרת',
      story: 'הילדים מגלים רגע קסם: מוסיפים משימה, מרעננים, והיא נשארת. זה מרגיש כמו אפליקציה אמיתית.',
      mission: 'להכיר localStorage בצורה פשוטה: שמירה בדפדפן בלי שרת.',
      body: '<input id="noteInput" placeholder="משהו שהאפליקציה צריכה לזכור">\n  <button onclick="saveNote()">💾 שמירה</button>\n  <button onclick="loadNote()">📂 טעינה</button>\n  <section id="output" class="output"></section>',
      js: 'function saveNote() {\n  const note = document.getElementById("noteInput").value;\n  localStorage.setItem("webmakers-note", note);\n  document.getElementById("output").textContent = "נשמר! עכשיו אפשר לרענן ולטעון.";\n}\n\nfunction loadNote() {\n  const note = localStorage.getItem("webmakers-note") || "אין עדיין זיכרון שמור";\n  document.getElementById("output").textContent = note;\n}\n\nloadNote();',
      concept: 'localStorage + getItem/setItem', keywords: ['localStorage','setItem'], hook: 'מרעננים והאפליקציה עדיין זוכרת'
    },
    {
      index: 9,
      title: 'Class Dashboard — דשבורד כיתה',
      story: 'בונים דשבורד שמסכם נתונים של הכיתה: כמה רעיונות, כמה נקודות ומה ממוצע ההתקדמות.',
      mission: 'להבין חישובי דאטה פשוטים דרך כרטיסי מדדים צבעוניים.',
      body: '<button onclick="renderDashboard()">📊 הצגת דשבורד</button>\n  <section id="output" class="output"></section>',
      js: 'const teams = [\n  { name: "צוות רובוטים", points: 8 },\n  { name: "צוות חלל", points: 12 },\n  { name: "צוות AI", points: 10 }\n];\n\nfunction renderDashboard() {\n  const total = teams.reduce((sum, team) => sum + team.points, 0);\n  const average = Math.round(total / teams.length);\n  document.getElementById("output").innerHTML = `<div class="item">👥 צוותים: ${teams.length}</div><div class="item">⭐ סך נקודות: ${total}</div><div class="item">📈 ממוצע: ${average}</div>`;\n}\n\nrenderDashboard();',
      concept: 'reduce + metrics', keywords: ['reduce','teams'], hook: 'מספרים הופכים לדשבורד כמו במוצר אמיתי'
    }
  ];

  productOverrides.forEach(item => Object.assign(lessons[item.index], {
    title: item.title,
    concept: item.concept,
    story: item.story,
    mission: item.mission,
    starter: makeStarter({ title: item.title, subtitle: item.mission, body: item.body, js: item.js }),
    lessonFlow: wowFlow(item.hook, 'בונים פיצ׳ר דאטה קטן', `מושג מרכזי: ${item.concept}`, 'יוצרים גרסת דאטה אישית'),
    exercises: wowExercises(item.keywords, `הריצו את ${item.title}, שנו נתון אחד ובדקו איך המסך השתנה.`),
    keywords: item.keywords,
    vocabulary: [['data','מידע שהאפליקציה מציגה או מחשבת'],['array','רשימת נתונים'],[item.keywords[0],'מילת מפתח מרכזית בשיעור'],[item.keywords[1],'פעולה/רעיון מרכזי בקוד']],
    codeCards: [
      { label: '📦 איפה הדאטה?', tab: 'js', snippet: item.keywords[0], hint: 'כאן מתחיל המידע שהאפליקציה מציגה או מחשבת.' },
      { label: '⚙️ הפעולה החשובה', tab: 'js', snippet: item.keywords[1], hint: 'זו מילת הקוד שמפעילה את הרעיון המרכזי.' },
      { label: '🖼️ ציור למסך', tab: 'js', snippet: 'document.getElementById("output")', hint: 'כאן הקוד שולח תוצאה למסך.' },
      { label: '🎨 תחושת מוצר', tab: 'css', snippet: 'border-radius', hint: 'שינוי קטן בעיצוב יכול להפוך תרגיל למוצר.' }
    ]
  }));

  const guidedDataExercises = {
    5: [
      ['פותחים את החנות', 'הריצו את החנות ובדקו שכל גאדג׳ט מופיע ככרטיס.', 'חפשו את products ואז את map.', ['products','map']],
      ['מוסיפים מוצר משלכם', 'הוסיפו מוצר רביעי עם שם, מחיר ואימוג׳י.', 'העתיקו שורת מוצר ושנו רק את הערכים.', ['products']],
      ['משנים מחיר', 'שנו מחיר של מוצר ובדקו שהמחיר במסך התעדכן.', 'המספר נמצא בתוך הדאטה, לא בתוך ה־HTML.', ['price']],
      ['כרטיס יותר מושך', 'שנו צבע/ריווח/עיגול כדי שהחנות תיראה כמו מוצר.', 'עברו ל־CSS וחפשו border-radius.', ['border-radius']],
      ['מוצר מומלץ', 'הוסיפו טקסט “מומלץ” לאחד הכרטיסים.', 'אפשר להוסיף שדה בדאטה או טקסט בתוך template.', ['innerHTML']],
      ['בדיקת באג', 'שברו בכוונה מרכאה אחת, הריצו, ואז תקנו.', 'שגיאות מרכאות הן באג אמיתי ונפוץ.', ['products']],
      ['שדרוג כיתה', 'הפכו את החנות לחנות ציוד לכיתה או משחקים.', 'שנו את כל שמות המוצרים לעולם שלכם.', ['name']],
      ['Demo מכירה', 'הציגו לחבר/ה איזה מוצר הכי כדאי ולמה.', 'מוצר טוב צריך סיפור, לא רק קוד.', ['renderProducts']]
    ],
    6: [
      ['מסננים בפעם הראשונה', 'בחרו קטגוריה ובדקו שרק הפריטים המתאימים נשארים.', 'הקסם נמצא בשורה עם filter.', ['filter']],
      ['מוסיפים קטגוריה', 'הוסיפו קטגוריה חדשה גם ברשימה וגם ב־select.', 'צריך לעדכן גם HTML וגם JS.', ['category']],
      ['פריט חדש', 'הוסיפו פריט שמתאים לקטגוריה החדשה.', 'העתיקו object קיים ושנו name/category.', ['items']],
      ['מצב “הכול”', 'בדקו מה קורה כשבוחרים הכול והסבירו למה.', 'חפשו category === "all".', ['all']],
      ['עיצוב תוצאות', 'הפכו את התוצאות לכרטיסים צבעוניים.', 'CSS של .item משפיע על כל תוצאה.', ['item']],
      ['באג קטגוריה', 'שנו category בשם שגוי וראו למה הפריט נעלם.', 'פילטר מחפש התאמה מדויקת.', ['category']],
      ['מסנן אישי', 'הפכו את המסנן למסנן משחקים/חיות/ספרים.', 'שמרו על אותו מבנה דאטה.', ['filterItems']],
      ['Demo מהיר', 'תנו לחבר/ה לבחור קטגוריה והסבירו איך האפליקציה מחליטה.', 'השתמשו במילה filter בהסבר.', ['filter']]
    ],
    7: [
      ['חיפוש ראשון', 'הקלידו מילה מהרשימה ובדקו שהתוצאה מופיעה.', 'includes מחפש בתוך הטקסט.', ['includes']],
      ['מילת חיפוש שלא קיימת', 'חפשו משהו שלא קיים וראו הודעת “לא נמצאו”.', 'זו חוויית משתמש חשובה.', ['לא נמצאו']],
      ['מוסיפים רעיון', 'הוסיפו רעיון חדש לרשימה וחפשו אותו.', 'הרשימה נקראת ideas.', ['ideas']],
      ['חיפוש חלקי', 'חפשו רק חלק ממילה ובדקו אם זה עובד.', 'includes לא חייב מילה שלמה.', ['search']],
      ['עיצוב תוצאות', 'הוסיפו אימוג׳י או צבע לכל תוצאה.', 'התוצאה נוצרת בתוך map.', ['map']],
      ['באג רגישות', 'בדקו מה קורה עם אותיות/רווחים שונים.', 'אפשר לשפר בעתיד עם trim.', ['searchInput']],
      ['מנוע אישי', 'הפכו את החיפוש למנוע רעיונות למסיבת כיתה.', 'שנו את המילים בתוך ideas.', ['ideas']],
      ['Demo חיפוש', 'תנו לחבר/ה לחפש רעיון והסבירו מה קרה בקוד.', 'הזכירו includes.', ['includes']]
    ],
    8: [
      ['שומרים זיכרון', 'כתבו פתק, שמרו, רעננו וטענו שוב.', 'זה רגע הוואו של localStorage.', ['localStorage']],
      ['שם אחר לזיכרון', 'שנו את מפתח השמירה מ־webmakers-note לשם משלכם.', 'אותו שם צריך להופיע גם בשמירה וגם בטעינה.', ['setItem','getItem']],
      ['הודעה טובה יותר', 'שנו את הודעת “נשמר!” למשהו מצחיק.', 'חפשו את הטקסט בתוך saveNote.', ['נשמר']],
      ['מצב ריק', 'שנו את הטקסט שמופיע כשאין עדיין זיכרון.', 'זה ה־fallback אחרי ||.', ['אין עדיין']],
      ['עיצוב זיכרון', 'עצבו את אזור הפלט כמו פתק דביק.', 'צהוב בהיר עובד מצוין.', ['output']],
      ['באג מפתח', 'שנו בטעות key אחד וראו למה הטעינה לא מוצאת.', 'שמירה וטעינה חייבות אותו key.', ['webmakers-note']],
      ['יומן אישי', 'הפכו את הכלי ליומן רעיונות לפרויקט.', 'שנו placeholder וטקסטים.', ['noteInput']],
      ['Demo זיכרון', 'הראו לחבר/ה שהאפליקציה זוכרת גם אחרי רענון.', 'זה ההבדל בין אתר רגיל לאפליקציה שמרגישה אמיתית.', ['loadNote']]
    ],
    9: [
      ['פותחים דשבורד', 'הריצו וראו שלושה מדדים: צוותים, סך נקודות וממוצע.', 'המספרים מחושבים מהדאטה.', ['reduce']],
      ['מוסיפים צוות', 'הוסיפו צוות חדש וראו שכל המדדים משתנים.', 'אל תשנו את המספרים ידנית במסך.', ['teams']],
      ['משנים נקודות', 'שנו points של צוות ובדקו את total/average.', 'reduce מחשב מחדש.', ['points']],
      ['כרטיס מדד נוסף', 'הוסיפו כרטיס “שיא נקודות” או “שם הקבוצה”.', 'אפשר להתחיל מטקסט קבוע.', ['output']],
      ['עיצוב דשבורד', 'הפכו את המדדים לכרטיסי מנהלים צבעוניים.', 'CSS של .item.', ['item']],
      ['באג חישוב', 'שברו מספר אחד למילה וראו למה חישוב עלול להשתבש.', 'דאטה צריך להיות מהסוג הנכון.', ['total']],
      ['דשבורד אישי', 'הפכו את זה לדשבורד משחק/כיתה/חוג.', 'שנו שמות צוותים ומדדים.', ['dashboard']],
      ['Demo מנהלים', 'הציגו את הדשבורד כאילו אתם מנהלי מוצר.', 'הסבירו מה המספר הכי חשוב.', ['renderDashboard']]
    ]
  };

  Object.entries(guidedDataExercises).forEach(([index, rows]) => {
    lessons[index].exercises = rows.map(([title, prompt, hint, jsIncludes], i) => ({
      id: i + 1,
      title: `תרגול ${i + 1} — ${title}`,
      minutes: i < 2 ? '8 דקות' : i < 6 ? '10 דקות' : '7 דקות',
      prompt,
      hint,
      check: title.includes('עיצוב') ? { cssIncludes: jsIncludes } : { jsIncludes }
    }));
  });

  const middleOverrides = [
    [10,'Quiz Arena — חידון עם ניקוד','חידון כיתתי שמחזיר משוב, מוסיף נקודות ומרגיש כמו משחק קצר.','לבנות חידון עם score, if ומשוב ברור למשתמש.','<input id="answerInput" placeholder="איזו שפה מעצבת?">\n  <button onclick="checkAnswer()">בדיקת תשובה</button>\n  <section id="output" class="output">ניקוד: 0</section>','let score = 0;\nfunction checkAnswer() {\n  const answer = document.getElementById("answerInput").value;\n  if (answer === "CSS") score = score + 1;\n  document.getElementById("output").textContent = answer === "CSS" ? "נכון! ניקוד: " + score : "כמעט — נסו שוב";\n}','score','if','תשובה נכונה מקפיצה ניקוד כמו משחק'],
    [11,'Recommender — ממליץ משחקים','האפליקציה ממליצה משחק לפי מצב רוח: רגוע, אקשן או חשיבה.','לבנות מנוע המלצות קטן עם כללי if פשוטים.','<select id="moodInput"><option>רגוע</option><option>אקשן</option><option>חשיבה</option></select>\n  <button onclick="recommendGame()">🎮 המלצה</button>\n  <section id="output" class="output"></section>','function recommendGame() {\n  const mood = document.getElementById("moodInput").value;\n  let recommendation = "משחק בנייה";\n  if (mood === "אקשן") recommendation = "משחק חלל מהיר";\n  if (mood === "חשיבה") recommendation = "חידת רובוטים";\n  document.getElementById("output").textContent = "ההמלצה שלך: " + recommendation;\n}','recommendation','mood','בוחרים מצב רוח ומקבלים המלצה אישית'],
    [12,'Rank It — דירוג רעיונות','מדרגים רעיונות לפי ניקוד ומציגים את הטובים ביותר למעלה.','להכיר sort דרך דירוג דברים שילדים המציאו.','<button onclick="rankIdeas()">🏆 דירוג רעיונות</button>\n  <section id="output" class="output"></section>','const ideas = [\n  { name: "רובוט כיתה", rating: 8 },\n  { name: "משחק חלל", rating: 10 },\n  { name: "עוזר AI", rating: 9 }\n];\nfunction rankIdeas() {\n  ideas.sort((a, b) => b.rating - a.rating);\n  document.getElementById("output").innerHTML = ideas.map(idea => `<div class="item">${idea.rating}⭐ ${idea.name}</div>`).join("");\n}','sort','rating','לחיצה אחת מסדרת רעיונות כמו טבלת ליגה'],
    [13,'Mini Cart — עגלת בחירה','מוסיפים מוצרים לעגלה ורואים סכום מתעדכן.','לבנות cart state וחישוב total פשוט.','<button onclick="addToCart(\'רובוט\', 50)">🤖 רובוט</button>\n  <button onclick="addToCart(\'רחפן\', 80)">🚁 רחפן</button>\n  <section id="output" class="output"></section>','const cart = [];\nfunction addToCart(name, price) {\n  cart.push({ name, price });\n  const total = cart.reduce((sum, item) => sum + item.price, 0);\n  document.getElementById("output").innerHTML = cart.map(item => `<div class="item">${item.name} — ${item.price}₪</div>`).join("") + `<b>סה״כ: ${total}₪</b>`;\n}','cart','total','כפתורים מוסיפים מוצרים והסכום משתנה'],
    [14,'Finder Pro — מאתר מוצרים','מחברים חיפוש וסינון לכלי אחד שמרגיש כמו אתר אמיתי.','לבנות Product Finder עם search + filter + render.','<input id="searchInput" placeholder="חיפוש">\n  <button onclick="findProducts()">🔎 מציאה</button>\n  <section id="output" class="output"></section>','const products = ["רובוט לימודי", "משחק חלל", "ערכת AI", "רחפן צילום"];\nfunction findProducts() {\n  const search = document.getElementById("searchInput").value;\n  const results = products.filter(product => product.includes(search));\n  document.getElementById("output").innerHTML = results.map(product => `<div class="item">${product}</div>`).join("");\n}','products','filter','חיפוש וסינון עובדים יחד כמו אתר אמיתי'],
    [15,'Mock API — שרת מדומה','האפליקציה מקבלת נתונים כאילו משרת, בלי להסתבך בשרת אמיתי.','להכיר רעיון של API דרך Promise/mock data ידידותי.','<button onclick="loadData()">🌐 טעינת נתונים</button>\n  <section id="output" class="output"></section>','function mockApi() {\n  return Promise.resolve(["נתון מהשרת", "משתמשים פעילים: 24", "סטטוס: תקין"]);\n}\nfunction loadData() {\n  mockApi().then(data => {\n    document.getElementById("output").innerHTML = data.map(row => `<div class="item">🌐 ${row}</div>`).join("");\n  });\n}','mockApi','Promise','לוחצים וטוענים נתונים כאילו מהאינטרנט'],
    [16,'Weather Station — תחזית מדומה','בוחרים עיר ומקבלים תחזית מתוך דאטה מדומה.','להבין async data דרך אפליקציה מוכרת: מזג אוויר.','<select id="cityInput"><option>חולון</option><option>תל אביב</option><option>ירושלים</option></select>\n  <button onclick="showWeather()">☀️ תחזית</button>\n  <section id="output" class="output"></section>','const weather = { "חולון": "שמשי 28°", "תל אביב": "לח 27°", "ירושלים": "נעים 24°" };\nfunction showWeather() {\n  const city = document.getElementById("cityInput").value;\n  document.getElementById("output").textContent = city + ": " + weather[city];\n}','weather','city','בוחרים עיר והדאטה משתנה'],
    [17,'Metrics Dashboard — כרטיסי מדדים','כמו מנהלי מוצר: רואים כמה משתמשים, כמה משימות וכמה הצלחה.','לבנות dashboard עם כרטיסי metrics.','<button onclick="renderMetrics()">📊 מדדים</button>\n  <section id="output" class="output"></section>','const metrics = { users: 32, tasks: 87, success: "91%" };\nfunction renderMetrics() {\n  document.getElementById("output").innerHTML = `<div class="item">👥 משתמשים: ${metrics.users}</div><div class="item">✅ משימות: ${metrics.tasks}</div><div class="item">📈 הצלחה: ${metrics.success}</div>`;\n}','metrics','dashboard','נתונים הופכים לכרטיסי מנהלים'],
    [18,'Bar Chart Lab — גרף בלי ספרייה','יוצרים גרף עמודות פשוט עם HTML ו־CSS בלבד.','להבין visual data דרך עמודות אחוזים.','<button onclick="renderChart()">📊 ציור גרף</button>\n  <section id="output" class="output"></section>','const scores = [40, 75, 55, 90];\nfunction renderChart() {\n  document.getElementById("output").innerHTML = scores.map(score => `<div class="item"><div style="background:#7c3aed;color:white;width:${score}%;padding:8px;border-radius:10px">${score}%</div></div>`).join("");\n}','scores','width','מספרים הופכים לגרף צבעוני'],
    [19,'Dashboard Project — מרכז שליטה','מיני־פרויקט שמחבר API מדומה, מדדים וגרף.','לבנות דשבורד קטן לעיר/כיתה/משחק ולהציג Demo.','<button onclick="renderDashboard()">🚀 פתיחת מרכז שליטה</button>\n  <section id="output" class="output"></section>','const dashboard = { title: "מרכז השליטה הכיתתי", active: 18, progress: 82 };\nfunction renderDashboard() {\n  document.getElementById("output").innerHTML = `<h2>${dashboard.title}</h2><div class="item">פעילים: ${dashboard.active}</div><div class="item">התקדמות: ${dashboard.progress}%</div>`;\n}','dashboard','renderDashboard','דשבורד שלם נפתח בלחיצה']
  ];

  middleOverrides.forEach(([index,title,story,mission,body,js,k1,k2,hook]) => Object.assign(lessons[index], {
    title, story, mission, concept: `${k1} + ${k2}`,
    starter: makeStarter({ title, subtitle: mission, body, js }),
    lessonFlow: wowFlow(hook, 'בונים את הפיצ׳ר המרכזי', `מושג מרכזי: ${k1} / ${k2}`, 'יוצרים גרסת מוצר משלכם'),
    exercises: wowExercises([k1,k2], `הריצו את ${title}, שנו נתון אחד ובדקו את התוצאה.`),
    keywords: [k1,k2],
    vocabulary: [['product','מוצר קטן שאפשר להציג'],['logic','חוקי פעולה של האפליקציה'],[k1,'מילת מפתח מרכזית'],[k2,'רעיון נוסף בקוד']],
    codeCards: [
      { label: '🧠 חוק המוצר', tab: 'js', snippet: k1, hint: 'זה החוק או הדאטה שמפעיל את המוצר.' },
      { label: '🔁 פעולה שנייה', tab: 'js', snippet: k2, hint: 'עוד רעיון מרכזי שהשיעור מוסיף.' },
      { label: '👆 כפתור פעולה', tab: 'html', snippet: 'onclick', hint: 'הכפתור שמפעיל את הקוד.' },
      { label: '📺 תוצאה במסך', tab: 'js', snippet: 'output', hint: 'כאן המשתמש רואה מה קרה.' }
    ]
  }));

  const finalOverrides = [
    [20,'Prompt Lab — בונה פרומפטים','כלי שעוזר לבנות פרומפט טוב לפי מטרה, קהל וסגנון.','להבין ש־AI טוב מתחיל בהוראה ברורה ומובנית.','<input id="goalInput" placeholder="מה המטרה?">\n  <select id="toneInput"><option>חברי</option><option>רשמי</option><option>קצר</option></select>\n  <button onclick="buildPrompt()">🤖 בניית פרומפט</button>\n  <section id="output" class="output"></section>','function buildPrompt() {\n  const goal = document.getElementById("goalInput").value || "להסביר רעיון";\n  const tone = document.getElementById("toneInput").value;\n  const prompt = `כתוב/כתבי בצורה ${tone}: ${goal}. הוסף דוגמה שמתאימה לילדים.`;\n  document.getElementById("output").textContent = prompt;\n}','prompt','tone','ממלאים שדות ונוצר פרומפט מקצועי'],
    [21,'Intent Sorter — מסווג הודעות','כלי שמחליט אם הודעה היא שאלה, בקשה או מחמאה לפי מילים.','להבין classification בלי מודל אמיתי: כללים פשוטים שמסווגים טקסט.','<textarea id="messageInput" placeholder="כתבו הודעה"></textarea>\n  <button onclick="classifyMessage()">🧠 סיווג</button>\n  <section id="output" class="output"></section>','function classifyMessage() {\n  const message = document.getElementById("messageInput").value;\n  let intent = "הודעה כללית";\n  if (message.includes("?")) intent = "שאלה";\n  if (message.includes("תודה")) intent = "מחמאה/תודה";\n  if (message.includes("תעשה")) intent = "בקשה";\n  document.getElementById("output").textContent = "כוונה מזוהה: " + intent;\n}','classify','intent','כותבים הודעה והאפליקציה מנחשת כוונה'],
    [22,'Tone Changer — משנה סגנון','הופכים טקסט לקצר, חברי או רשמי בלחיצה.','להבין מוצר AI מדומה דרך שינוי טון של טקסט.','<textarea id="textInput" placeholder="כתבו משפט"></textarea>\n  <select id="toneInput"><option>קצר</option><option>חברי</option><option>רשמי</option></select>\n  <button onclick="rewriteText()">✍️ שינוי סגנון</button>\n  <section id="output" class="output"></section>','function rewriteText() {\n  const text = document.getElementById("textInput").value || "אני צריך עזרה בפרויקט";\n  const tone = document.getElementById("toneInput").value;\n  const prefix = tone === "רשמי" ? "שלום, " : tone === "חברי" ? "היי! " : "בקצרה: ";\n  document.getElementById("output").textContent = prefix + text;\n}','rewrite','tone','משפט אחד מקבל כמה סגנונות'],
    [23,'Safety Shield — שומר בטיחות','בודקים קלט לפני שמחזירים תשובה, כמו מוצר אחראי.','להבין guardrails דרך חסימת מילים/בקשות לא מתאימות בצורה פשוטה.','<input id="requestInput" placeholder="מה לבקש מהעוזר?">\n  <button onclick="checkRequest()">🛡️ בדיקה</button>\n  <section id="output" class="output"></section>','const blockedWords = ["סיסמה", "לפגוע", "פרטי אשראי"];\nfunction checkRequest() {\n  const request = document.getElementById("requestInput").value;\n  const blocked = blockedWords.some(word => request.includes(word));\n  document.getElementById("output").textContent = blocked ? "נעצר לבדיקה: צריך לשמור על בטיחות" : "הבקשה נראית תקינה ✅";\n}','blockedWords','some','האפליקציה יודעת לעצור בקשה מסוכנת'],
    [24,'AI Helper Mini — עוזר כיתתי','מחברים פרומפט, סיווג ובטיחות לעוזר AI מדומה אחד.','לבנות מוצר AI קטן עם UI, כללים ותגובה חכמה.','<input id="questionInput" placeholder="שאלו את העוזר הכיתתי">\n  <button onclick="answerQuestion()">🤖 תשובה</button>\n  <section id="output" class="output"></section>','function answerQuestion() {\n  const question = document.getElementById("questionInput").value;\n  const answer = question.includes("קוד") ? "נסו להריץ ואז לקרוא את הודעת השגיאה." : "פרקו את הבעיה לצעד קטן אחד.";\n  document.getElementById("output").textContent = answer;\n}','assistant','question','שאלה מקבלת תשובה בסגנון עוזר כיתתי'],
    [25,'Product Blueprint — מתכננים מוצר','לפני קוד: מגדירים משתמש, בעיה, פתרון ומסכים.','ללמוד חשיבה מוצרית דרך user story ותכנון MVP.','<input id="userInput" placeholder="מי המשתמש?">\n  <input id="problemInput" placeholder="איזו בעיה פותרים?">\n  <button onclick="buildSpec()">📋 יצירת אפיון</button>\n  <section id="output" class="output"></section>','function buildSpec() {\n  const user = document.getElementById("userInput").value || "תלמיד/ה";\n  const problem = document.getElementById("problemInput").value || "צריך לארגן רעיונות";\n  document.getElementById("output").innerHTML = `<div class="item">משתמש: ${user}</div><div class="item">בעיה: ${problem}</div><div class="item">MVP: גרסה קטנה שעובדת</div>`;\n}','userStory','mvp','רעיון הופך לאפיון מוצר קצר'],
    [26,'MVP Builder — גרסה ראשונה עובדת','בונים גרסה קטנה של מוצר, לא את כל החלום.','להבין MVP: פיצ׳ר אחד שעובד מקצה לקצה.','<button onclick="launchMvp()">🚀 השקת MVP</button>\n  <section id="output" class="output"></section>','const features = ["קלט משתמש", "כפתור פעולה", "תוצאה במסך"];\nfunction launchMvp() {\n  document.getElementById("output").innerHTML = `<h2>MVP מוכן</h2>` + features.map(feature => `<div class="item">✅ ${feature}</div>`).join("");\n}','features','mvp','לוחצים ורואים מה חייב להיות בגרסה ראשונה'],
    [27,'QA Lab — בודקים כמו מפתחים','כותבים בדיקות ידניות ומסמנים באגים לפני Demo.','להכיר test cases ודיבאג כמקצוע, לא ככישלון.','<button onclick="runTests()">🧪 הרצת בדיקות</button>\n  <section id="output" class="output"></section>','const testCases = ["הכפתור עובד", "שדה ריק לא שובר", "התוצאה ברורה"];\nfunction runTests() {\n  document.getElementById("output").innerHTML = testCases.map(test => `<div class="item">🧪 ${test}: עבר</div>`).join("");\n}','testCases','bug','בדיקות הופכות את המוצר לאמין יותר'],
    [28,'UX Polish — משפרים חוויה','משפרים מיקרו־קופי, מצב ריק וצבעים כדי שמוצר ירגיש טוב.','להבין UX דרך שדרוגים קטנים שמרגישים גדולים.','<button onclick="polishUx()">✨ שיפור UX</button>\n  <section id="output" class="output">אין נתונים.</section>','function polishUx() {\n  document.getElementById("output").innerHTML = `<h2>אין עדיין רעיונות</h2><p>התחילו בהוספת רעיון ראשון — זה לוקח 10 שניות.</p>`;\n  document.getElementById("output").style.background = "#fef3c7";\n}','ux','emptyState','מצב ריק הופך להזמנה לפעולה'],
    [29,'Demo Day — פרויקט סיום','מציגים מוצר Web קטן שעובד: בעיה, פתרון, דאטה וקוד חשוב.','לסיים עם פרויקט אישי/צוותי שאפשר להציג בגאווה.','<button onclick="showDemo()">🎤 הצגת Demo</button>\n  <section id="output" class="output"></section>','const project = { name: "המוצר שלי", problem: "עוזר לארגן רעיונות", tech: "HTML + CSS + JavaScript" };\nfunction showDemo() {\n  document.getElementById("output").innerHTML = `<h2>${project.name}</h2><div class="item">בעיה: ${project.problem}</div><div class="item">טכנולוגיה: ${project.tech}</div><div class="item">הדמו עובד 🎉</div>`;\n}','project','demo','לחיצה אחת מציגה פרויקט גמר']
  ];

  finalOverrides.forEach(([index,title,story,mission,body,js,k1,k2,hook]) => Object.assign(lessons[index], {
    title, story, mission, concept: `${k1} + ${k2}`,
    starter: makeStarter({ title, subtitle: mission, body, js }),
    lessonFlow: wowFlow(hook, 'בונים כלי מוצר קטן', `מושג מרכזי: ${k1} / ${k2}`, 'משדרגים לפרויקט אישי'),
    exercises: wowExercises([k1,k2], `הריצו את ${title}, שנו קלט אחד והציגו מה השתנה.`),
    keywords: [k1,k2],
    vocabulary: [['AI tool','כלי חכם שעוזר למשתמש'],['product thinking','חשיבה על משתמש ובעיה'],[k1,'מילת מפתח מרכזית'],[k2,'רעיון נוסף בקוד']],
    codeCards: [
      { label: '🤖 החלק החכם', tab: 'js', snippet: k1, hint: 'כאן נמצא רעיון ה־AI/מוצר של השיעור.' },
      { label: '🧭 כוונת המשתמש', tab: 'js', snippet: k2, hint: 'זה מה שעוזר למוצר להבין או להציג נכון.' },
      { label: '✍️ קלט מהמשתמש', tab: 'html', snippet: 'input', hint: 'המשתמש נותן מידע למוצר.' },
      { label: '🎤 Demo', tab: 'js', snippet: 'document.getElementById', hint: 'השורה שמציגה את הדמו למסך.' }
    ]
  }));

  const makeGuidedProductExercises = (lesson, mode = 'product') => {
    const [k1, k2] = lesson.keywords || ['app','output'];
    const isAi = mode === 'ai';
    const productWord = isAi ? 'הכלי החכם' : 'המוצר';
    return [
      [`פותחים את ${productWord}`, `הריצו את ${lesson.title} וודאו שהתוצר נותן תגובה ברורה במסך.`, `חפשו את הכפתור ואת השורה שמעדכנת output.`, { jsIncludes: ['output'] }],
      ['שינוי אישי ראשון', `שנו טקסט, נתון או אפשרות אחת כדי שה${productWord} ירגיש שלכם.`, `אל תשנו הכול — שינוי קטן מספיק כדי להבין.`, { jsIncludes: [k1] }],
      ['מוצאים את חוק המוצר', `לחצו על כרטיס הקוד הראשון והסבירו מה ${k1} עושה במילים שלכם.`, `אם אפשר להסביר לחבר/ה — באמת הבנתם.`, { jsIncludes: [k1] }],
      ['מוצאים את הפעולה השנייה', `מצאו איפה ${k2} מופיע ושנו ערך אחד שקשור אליו.`, `כרטיס הקוד השני מוביל לשם.`, { jsIncludes: [k2] }],
      [isAi ? 'תגובה חכמה יותר' : 'שדרוג פיצ׳ר', isAi ? 'הוסיפו עוד כלל תשובה או עוד אפשרות שהכלי מזהה.' : 'הוסיפו עוד אפשרות/נתון/כפתור שהמשתמש יכול לנסות.', `עובדים לפי הדוגמה שכבר קיימת, לא מתחילים מאפס.`, { jsIncludes: [k1] }],
      ['שיפור UX', `שנו הודעה, צבע או מצב ריק כדי שהמשתמש יבין מה לעשות.`, `מוצר טוב מסביר למשתמש בלי שהמדריכה צריכה לעזור.`, { jsIncludes: ['document.getElementById'] }],
      ['באג מכוון', `שברו בכוונה שם משתנה או מרכאה, הריצו, ואז תקנו.`, `דיבאג הוא חלק מהעבודה של בוני Web אמיתיים.`, { jsIncludes: [k1] }],
      ['Demo קצר', `הציגו ב־30 שניות: מי המשתמש, מה הבעיה, ומה הקוד החשוב ביותר.`, `אל תקריאו את כל הקוד — ספרו את הסיפור של המוצר.`, { jsIncludes: [k1] }]
    ].map(([title, prompt, hint, check], i) => ({
      id: i + 1,
      title: `תרגול ${i + 1} — ${title}`,
      minutes: i < 2 ? '8 דקות' : i < 6 ? '10 דקות' : '7 דקות',
      prompt,
      hint,
      check
    }));
  };

  for (let i = 10; i <= 19; i += 1) {
    lessons[i].exercises = makeGuidedProductExercises(lessons[i], 'product');
  }
  for (let i = 20; i <= 29; i += 1) {
    lessons[i].exercises = makeGuidedProductExercises(lessons[i], 'ai');
  }

  window.APPFORGE_LESSONS = lessons;
  window.getWebMakersLesson = function (id) { const n = Number(id || 1); return lessons.find(l => l.id === n) || lessons[0]; };
})();
