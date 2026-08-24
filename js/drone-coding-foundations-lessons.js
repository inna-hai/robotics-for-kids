(function () {
  const unitNames = {
    shared: 'יחידה 1 — יסודות רחפן וסימולטור',
    code: 'יחידה 2 — מעבר מבלוקים ל־JavaScript',
    logic: 'יחידה 3 — לולאות, פונקציות ותנאים',
    project: 'יחידה 4 — פרויקט ניווט אלגוריתמי'
  };

  const commandLabels = {
    safety_check: 'Safety Check — בדיקת בטיחות',
    takeoff: 'tello.takeoff() — המראה',
    hover: 'tello.hover(5) / sleep — ריחוף/השהיה',
    land: 'tello.land() — נחיתה',
    forward: 'tello.moveForward(distance) — קדימה',
    back: 'tello.moveBackward(distance) — אחורה',
    right: 'tello.moveRight(distance) — ימינה',
    left: 'tello.moveLeft(distance) — שמאלה',
    yaw: 'tello.rotateClockwise(90) — פנייה 90°',
    loop: 'for / while — לולאה',
    variable: 'let distance = 60 — משתנה',
    function: 'function flySquare(size) — פונקציה',
    condition: 'if / else — תנאי',
    comment: '// comment — הערת קוד',
    share: 'Share Link — שיתוף קוד',
    debug: 'Debug Log — יומן דיבוג',
    project: 'Project Code — קוד פרויקט'
  };

  const safetyRules = [
    'מפגשים 1–4 הם סימולטור בלבד — אין חיבור לרחפן פיזי.',
    'טיסה פיזית מתחילה רק ממפגש 5, באישור מדריך ובאזור סטרילי.',
    'בטיסה פיזית: משקפי מגן, שיער אסוף, מגיני פרופלורים וסוללה תקינה.',
    'לפני כל הרצה פיזית מכריזים “רחפנים באוויר!”.',
    'הקוד הוא תוכנית הטיסה: Takeoff בתחילת משימה ו־Land בסיום.',
    'אם יש ספק או סיכון — Abort/עצירה עדיף על אלתור.'
  ];

  const tabletTips = [
    'עובדים בטאבלט לרוחב באפליקציית DroneBlocks Code.',
    'פותחים את האפליקציה על WiFi בית ספרי כדי לשמור ולשתף קוד.',
    'עוברים ל־WiFi של הרחפן רק בשיעורים עם טיסה פיזית ובאישור מדריך.',
    'משתמשים ב־Function Reference באפליקציה במקום לנחש שמות פקודות.',
    'משנים פרמטר אחד בכל הרצת דיבוג כדי לדעת מה באמת השפיע.',
    'שומרים קוד בשם ברור: G7_Lesson_Team_Version.'
  ];

  const lessons = [
    { title:'שיעור 1: היכרות, בטיחות והמראה וירטואלית ראשונה', unit:unitNames.shared, concept:'רחפן כמערכת רובוטית, ציר אנכי וסימולטור', story:'צוותי כיתה ז׳ פותחים מעבדת קוד רחפנים: לפני JavaScript ולפני מדחפים, מבינים שהרחפן הוא מערכת שצריך לתכנת בזהירות.', mission:'לבנות בסימולטור רצף בסיסי: המראה, ריחוף ונחיתה, ולהסביר למה זו בדיקת מערכת לפני כל משימה.', commands:['takeoff','hover','land'] },
    { title:'שיעור 2: ניווט דו־מימדי ואתגר הריבוע', unit:unitNames.shared, concept:'Pitch / Roll / Yaw ו־Box Mission', story:'הרחפן צריך לנווט בריבוע מדויק כמו מהנדס: פעם עם תנועה צדית ופעם עם פניות.', mission:'לתכנן Box Mission בסימולטור, להשוות Strafing מול Yaw, ולזהות תבנית חוזרת שתהפוך בהמשך ללולאה.', commands:['takeoff','forward','right','back','left','land'] },
    { title:'שיעור 3: עבודה בענן וסימולטור Mars/City', unit:unitNames.shared, concept:'שמירה, שיתוף וניווט בסביבה מורכבת', story:'משימת החקר עוברת ממגרש נקי לעיר/מאדים: קוד צריך להתחשב בגבהים, מכשולים ושיתוף תוצרים.', mission:'לפתוח DroneBlocks Code/Simulator, לשמור קוד בענן, לשתף קישור ולתעד שגיאת דיבוג אחת.', commands:['comment','takeoff','forward','hover','land','share'] },
    { title:'שיעור 4: לולאות ומשתנים — קוד יעיל למסלול חוזר', unit:unitNames.shared, concept:'Loops, Variables ודיוק סינטקס', story:'במקום להעתיק פקודות שוב ושוב, המתכנתים מזהים דפוס ומחליפים חזרתיות בלולאה ומשתנה מרחק.', mission:'לשדרג משימת ריבוע בעזרת לולאה ומשתנה distance בסימולטור, בלי טיסה פיזית.', commands:['variable','loop','forward','yaw','land'] },
    { title:'שיעור 5: הטסה פיזית ראשונה — מעבר מקוד למציאות', unit:unitNames.shared, concept:'Pre‑Flight Check, עבודת צוות והרצה פיזית קצרה', story:'אחרי ארבעה מפגשי סימולטור, הקוד פוגש את העולם הפיזי: סטיות, סוללה, רצפה ומזגן.', mission:'להריץ משימת Takeoff → Hover → Land פיזית קצרה באישור מדריך, למדוד סטייה ולתעד מסקנה.', commands:['safety_check','takeoff','hover','land','debug'] },
    { title:'שיעור 6: מעבר מבלוקים לקוד טקסטואלי', unit:unitNames.code, concept:'Intro to JavaScript with DroneBlocks Code', story:'הכיתה עוברת מגרירה ויזואלית לכתיבה מדויקת: סינטקס אינו המלצה, אלא דרישה מבנית.', mission:'לתרגם Box Mission מבלוקים ל־JavaScript, להריץ בסימולטור ולשמור Share Link.', commands:['comment','takeoff','forward','yaw','land','share'] },
    { title:'שיעור 7: לולאות for ו־while ב־JavaScript', unit:unitNames.logic, concept:'for, while, מונה i ו־i++', story:'הרחפן מקבל משימה גיאומטרית: משושה או מתומן בעיר, אבל הקוד חייב להישאר קצר וקריא.', mission:'לכתוב לולאת for או while שמבצעת מסלול משושה/מתומן בסימולטור City.', commands:['variable','loop','forward','yaw','land'] },
    { title:'שיעור 8: פונקציות ופרמטרים', unit:unitNames.logic, concept:'function flySquare(size) וקוד מודולרי', story:'צוות פיתוח מקצועי לא כותב אותו קוד שוב — הוא בונה פונקציה ומשנה פרמטר.', mission:'להגדיר פונקציה שמקבלת מרחק ומפעילה מסלול ניווט, ואז לבדוק שני גדלים שונים.', commands:['function','variable','loop','forward','yaw','land'] },
    { title:'שיעור 9: תנאים If / Else ואילוצי ניווט', unit:unitNames.logic, concept:'Decision Logic ומפעילי השוואה', story:'הרחפן צריך “לקבל החלטה” לפי ערך משתנה: ימינה אם המרחק גדול, שמאלה אם לא.', mission:'לכתוב קוד עם if/else שמנתב את הרחפן בסימולטור Mars לפי משתנה תנאי.', commands:['variable','condition','forward','right','left','land'] },
    { title:'שיעור 10: מבוכים אלגוריתמיים ותכנון פרויקט הגמר', unit:unitNames.project, concept:'ארכיטקטורת קוד ודרישות פרויקט', story:'לפני שבונים קוד ארוך, מהנדסים מגדירים בעיה, אילוצים, קריטריוני הצלחה וסיכונים.', mission:'לכתוב Blueprint לפרויקט ניווט JavaScript ולבנות שלד קוד ראשוני בטאבלט.', commands:['comment','function','condition','project'] },
    { title:'שיעור 11: מעבדת פיתוח — גרסת V1 לפרויקט', unit:unitNames.project, concept:'פיתוח הדרגתי והרצות חלקיות', story:'הפרויקט לא נכתב בבת אחת: בונים גרסת V1 קטנה, מריצים, מודדים ומשפרים.', mission:'להמיר את ה־Blueprint לקוד V1, להריץ בסימולטור ואפשרות לחלק פיזי קצר באישור מדריך.', commands:['safety_check','function','project','debug'] },
    { title:'שיעור 12: בדיקות שטח ודיבוג Runtime', unit:unitNames.project, concept:'Runtime Errors, סטיות פיזיות ותיקון פרמטר אחד', story:'קוד תקין מבחינת סינטקס עדיין יכול להיכשל בעולם האמיתי — עכשיו לומדים לתחקר כמו צוות פיתוח.', mission:'לבצע הרצות בדיקה, לתעד שגיאה/סטייה ולתקן רק פרמטר או שורה אחת בכל פעם.', commands:['project','debug','variable','share'] },
    { title:'שיעור 13: אופטימיזציה ואמינות מסלול', unit:unitNames.project, concept:'Reliability, Consistency ו־Release Candidate', story:'קוד טוב הוא לא רק עובד פעם אחת — הוא עובד שוב ושוב בתנאים בטוחים.', mission:'להריץ את הפרויקט בכמה סבבים, למדוד עקביות, ולסמן Release Candidate.', commands:['project','debug','comment','share'] },
    { title:'שיעור 14: תיעוד קוד, Comments ושיתוף', unit:unitNames.project, concept:'Code Review, Comments ו־Share Link', story:'מהנדס טוב משאיר קוד שאפשר להבין: הערות, שמות משתנים, גרסאות ותחקור ביצועים.', mission:'לסדר את הקוד, להוסיף הערות, להכין דוח תחקור קצר ולשתף קישור למדריך.', commands:['comment','project','debug','share'] },
    { title:'שיעור 15: אירוע שיא — הדגמת JavaScript וחגיגת סיום', unit:unitNames.project, concept:'פרזנטציה, הדגמת קוד ודיבוג', story:'כל צוות מציג את תוכנית הטיסה שלו כמו צוות פיתוח: בעיה, פתרון, קוד, בדיקות ומסקנות.', mission:'להציג קוד JavaScript, להריץ בסימולטור או בכיתה, ולהסביר את הלוגיקה והדיבוג.', commands:['project','share'] }
  ];

  function makeFlow(lesson) {
    const physical = lesson.id >= 5 ? 'אם יש רכיב פיזי: Pre‑Flight Check מלא, אישור מדריך ואזור סטרילי.' : 'סימולטור בלבד: אין חיבור לרחפן ואין טיסה פיזית.';
    return [
      { minutes:'0–8', title:'בדיקת תנאי קדם', teacher:'מחבר לשיעור הקודם ומזכיר: הקוד הוא תוכנית הטיסה.', students:'פותחים טאבלט ותפקידים בצוות.' },
      { minutes:'8–20', title:'הקנייה טכנית', teacher:`מציג מושג מרכזי: ${lesson.concept}. ${physical}`, students:'מסמנים מושגים לא ברורים ושואלים שאלות.' },
      { minutes:'20–35', title:'קריאת קוד / פסאודו־קוד', teacher:'מדגים רצף פקודות או שלד JS מתוך Function Reference.', students:'מזהים התחלה, גוף וסיום בטוח.' },
      { minutes:'35–55', title:'בנייה בטאבלט', teacher:'מלווה כתיבה ב־DroneBlocks Code או סימולטור.', students:'כותבים/מתרגמים את קוד המשימה.' },
      { minutes:'55–70', title:'הרצה ודיבוג', teacher:'מתעקש על שינוי פרמטר אחד בכל פעם.', students:'מריצים, מתעדים שגיאה ומתקנים.' },
      { minutes:'70–82', title:'שיפור תוצר', teacher:'מבקש Comment/שם משתנה/גרסה ברורה.', students:'מסדרים קוד ושומרים גרסה.' },
      { minutes:'82–90', title:'שיתוף וסיכום', teacher:'אוסף Share Link או כרטיס יציאה.', students:'משלימים משפט מסכם על קוד, בטיחות ודיוק.' }
    ];
  }

  function makeExercises(lesson) {
    return [
      { minutes:'10–18', title:'מילון סינטקס', prompt:'סמנו אילו סימנים בקוד הם חובה: סוגריים, נקודה, פסיק, מרכאות.', check:'התלמיד מזהה שסינטקס הוא מבנה מחייב.' },
      { minutes:'20–32', title:'קריאת רצף', prompt:`קראו את רצף המשימה: ${lesson.commands.map(c => commandLabels[c] || c).join(' → ')}`, check:'יש התחלה, גוף וסיום בטוח.' },
      { minutes:'35–50', title:'כתיבת קוד ראשון', prompt:'כתבו את גרסת הקוד/פסאודו־קוד למשימה בטאבלט.', check:'הקוד כולל שמות פקודות סבירים וסדר בטוח.' },
      { minutes:'50–62', title:'הרצה בסימולטור', prompt:'הריצו ותעדו מה קרה בפועל.', check:'יש תיאור תוצאה ולא רק “עבד/לא עבד”.' },
      { minutes:'62–72', title:'דיבוג פרמטר אחד', prompt:'שנו ערך אחד בלבד והריצו שוב.', check:'התלמיד יודע להסביר מה השתנה.' },
      { minutes:'72–82', title:'הערת מהנדס', prompt:'הוסיפו Comment שמסביר למה בחרתם בסדר הפקודות.', check:'ההערה מחברת לוגיקה לבטיחות/משימה.' },
      { minutes:'82–90', title:'כרטיס יציאה', prompt:'השלימו: “דיוק סינטקס חשוב כי...”', check:'המשפט מחבר בין קוד, רחפן ובטיחות.' }
    ];
  }

  window.DRONE_CODING_FOUNDATIONS_COMMAND_LABELS = commandLabels;
  window.DRONE_CODING_FOUNDATIONS_LESSONS = lessons.map((lesson, index) => Object.assign({}, lesson, {
    id: index + 1,
    subtitle: lesson.concept,
    durationMinutes: 90,
    grade: 'כיתה ז׳ עתודה',
    audience: 'כיתה ז׳ עתודה',
    platform: 'Tello EDU + DroneBlocks Code בטאבלט',
    tabletFirst: true,
    language: 'JavaScript',
    deviceProfile: 'Lenovo Tab TB311FU / DroneBlocks Code',
    workspaceMode: index + 1 >= 6 ? 'droneblocks-code' : 'droneblocks-app',
    physicalFlightAllowed: index + 1 >= 5,
    blocks: lesson.commands,
    essentialQuestion: `איך משתמשים ב־JavaScript כדי להפוך ${lesson.concept} לתוכנית טיסה בטוחה ומדויקת?`,
    successCriteria: ['אני עובד/ת בטאבלט לפי נוהל WiFi ושמירה.', 'אני יודע/ת להסביר את רצף המשימה לפני הרצה.', 'אני מזהה שסינטקס מדויק הוא דרישה מבנית.', 'אני משנה פרמטר אחד בכל דיבוג.', 'אני מסיים/ת משימה עם תוצר שמור או תיעוד ברור.'],
    realWorldUses: [
      { icon:'🚁', title:'טיסה אוטונומית', text:'קוד טקסטואלי מאפשר לתכנן משימה שחוזרת על עצמה בצורה אמינה.' },
      { icon:'🧭', title:'ניווט מדויק', text:'משתנים, פונקציות ותנאים הופכים מסלול מורכב לתוכנית ברורה.' },
      { icon:'🛠️', title:'עבודת מהנדסים', text:'דיבוג, גרסאות והערות קוד הם חלק מהתוצר המקצועי.' }
    ],
    vocabulary: [['Syntax / סינטקס','כללי הכתיבה המחייבים של JavaScript.'], ['Variable / משתנה','שם שמחזיק ערך כמו מרחק או זווית.'], ['Function / פונקציה','קבוצת פקודות עם שם שאפשר להפעיל שוב.'], ['Parameter / פרמטר','ערך שמועבר לפונקציה ומשנה את פעולתה.'], ['Loop / לולאה','קוד שחוזר מספר פעמים או עד תנאי מסוים.'], ['If / Else','בחירה בין מסלולים לפי תנאי לוגי.'], ['Debugging','איתור ותיקון שגיאות קוד או סטיות פיזיות.']],
    safetyRules,
    commonDirections: [['Takeoff','תחילת טיסה מבוקרת.'], ['Land','סיום בטוח — חובה בסוף רצף טיסה.'], ['Function Reference','מקור שמות הפקודות באפליקציית DroneBlocks Code.'], ['Share Link','קישור הגשה למדריך.']],
    setupSteps: ['טאבלט לרוחב.', 'WiFi בית ספרי לפני פתיחת האפליקציה.', 'DroneBlocks Code / Simulator פתוח.', 'שם קובץ ברור עם שיעור וצוות.', 'בדיקת מדריך לפני טיסה פיזית.'],
    tabletTips,
    lessonFlow: makeFlow(Object.assign({ id:index + 1 }, lesson)),
    exercises: makeExercises(lesson),
    deliverable: `שלד/קוד משימה לשיעור ${index + 1} + תיעוד קצר או Share Link לפי שלב הקורס.`,
    assessment: ['רצף הקוד בטוח ומסתיים בנחיתה.', 'יש שימוש נכון במושג המרכזי של השיעור.', 'התלמיד מסביר שגיאה או שיפור אחד.', 'שם הקובץ/הגרסה ברור.', 'העבודה נשמרה או תועדה.'],
    debugging: [{ problem:'שגיאת סינטקס', fix:'בודקים סוגריים, נקודה, מרכאות ואותיות גדולות/קטנות.' }, { problem:'הרחפן/סימולטור לא עושה מה שציפינו', fix:'מבודדים פקודה אחת ומשנים פרמטר אחד בלבד.' }, { problem:'פקודה לא מוכרת', fix:'בודקים Function Reference במקום לנחש.' }, { problem:'שמירה לא עובדת', fix:'בודקים WiFi בית ספרי ולא WiFi של הרחפן.' }],
    differentiation: { support:['לתת שלד קוד עם חוסרים להשלמה.', 'לאפשר פסאודו־קוד לפני JavaScript מלא.', 'לעבוד בזוג Driver/Navigator.'], extension:['להוסיף פונקציה כללית יותר.', 'לכתוב Comment איכותי לכל שלב.', 'להשוות שתי גרסאות לפי מספר שורות/אמינות.'] },
    instructorGuide: { prerequisites:'להיצמד לרצף הסילבוס: מפגשים 1–5 משותפים לכל המסלולים, וממפגש 6 מתחיל מעבר ממוקד ל־JavaScript.', pedagogy:['להדגיש שסינטקס אינו המלצה אלא דרישה מבנית.', 'לא להפוך את האתר לעורך קוד מלא; העבודה המרכזית היא ב־DroneBlocks Code בטאבלט.', 'לשמור על מודל היברידי: דף תלמיד, שקופיות נקיות ומערך מדריך.'], exitTicket:'דיוק סינטקס חשוב בתכנות רחפנים כי ___.' },
    appWorkflowTitle: 'עבודה ב־DroneBlocks Code בטאבלט',
    appWorkflowNote: 'האתר מארגן את המשימה, הרצף וההגשה. את הקוד כותבים ומריצים באפליקציית DroneBlocks Code / סימולטור לפי השיעור.',
    appWorkflow: [
      { title:'פתיחת סביבת עבודה', detail:'פתחו DroneBlocks Code על WiFi בית ספרי, ודאו שאתם בשיעור הנכון ושמרו שם קובץ ברור.' },
      { title:'קריאת רצף המשימה', detail:`עברו על רצף הפקודות: ${lesson.commands.map(c => commandLabels[c] || c).join(' → ')}.` },
      { title:'כתיבה והרצה', detail:'כתבו את הקוד/שלד הקוד בטאבלט, הריצו בסימולטור או פיזית רק כשמותר ומאושר.' },
      { title:'דיבוג ושיתוף', detail:'תקנו פרמטר אחד בכל פעם, הוסיפו Comment קצר ושמרו/שתפו קישור למדריך.' }
    ],
    visualDiagram: { title:'Drone Coding Foundations', caption: lesson.mission, chip:index + 1 >= 6 ? 'JavaScript' : 'סימולטור/בסיס', panelTitle:'💻 תדריך קוד רחפנים' },
    instructorSlides: [
      { title:'הקוד הוא תוכנית הטיסה', body:'כל פקודה ב־JavaScript משפיעה על מערכת פיזית ולכן הדיוק קריטי.', bullets:['סינטקס', 'בטיחות', 'דיבוג'] },
      { title:'עובדים בטאבלט', body:'DroneBlocks Code הוא כלי העבודה המרכזי; האתר מספק תדריך, מצגת ומערך.', bullets:['Function Reference', 'Save/Share', 'Simulator first'] },
      { title:'משימת היום', body:lesson.mission, bullets:lesson.commands.map(c => commandLabels[c] || c).slice(0,5) }
    ]
  }));

  window.getDroneCodingFoundationsLesson = function (value) {
    const id = Number(value || 1);
    return window.DRONE_CODING_FOUNDATIONS_LESSONS.find(lesson => lesson.id === id) || window.DRONE_CODING_FOUNDATIONS_LESSONS[0];
  };
})();
