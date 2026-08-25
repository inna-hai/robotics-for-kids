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
    yaw: 'tello.yawRight(degrees); — סבסוב ימינה',
    yaw_left: 'tello.yawLeft(degrees); — סבסוב שמאלה',
    loop: 'for / while — לולאה',
    variable: 'let distance = 60 — משתנה',
    function: 'function flySquare(size) — פונקציה',
    condition: 'if / else — תנאי',
    comment: '// comment — הערת קוד',
    share: 'Share Link — שיתוף קוד',
    debug: 'Debug Log — יומן דיבוג',
    project: 'Project Code — קוד פרויקט',
    flyUp: 'tello.flyUp(inches); — עלייה בציר האנכי',
    flyDown: 'tello.flyDown(inches); — ירידה בציר האנכי',
    sleep: 'tello.sleep(seconds); — השהייה/ריחוף יציב',
    simulator: 'DroneBlocks Simulator — Minimal Grid',
    function_reference: 'Function Reference — ספריית פקודות',
    save_cloud: 'Save Project / Share Link — שמירה ושיתוף',
    telemetry: 'Telemetry — נתוני סוללה/גובה/סטטוס',
    battery: 'Battery Protocol — נוהל סוללות',
    wifi: 'Double Network Handshake — נוהל רשת כפולה',
    abort: 'Abort / Emergency Land — עצירת חירום',
    code_editor: 'New Script — עורך קוד טקסטואלי'
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


  Object.assign(window.DRONE_CODING_FOUNDATIONS_LESSONS[0], {
    "title": "שיעור 1: היכרות עם Ingenuity Mission 1 — בטיחות, JavaScript והמראה וירטואלית בציר האנכי",
    "subtitle": "DroneBlocks Code, Minimal Grid, Syntax, Lift/Hover/Land ופקודות JavaScript ראשונות",
    "unit": "יחידה 1 — יסודות רחפן, בטיחות וסימולטור JavaScript",
    "concept": "היכרות עם DroneBlocks Code, רחפן כרובוט אוטונומי, ציר אנכי ודיוק סינטקס ב־JavaScript",
    "story": "צוותי כיתה ז׳ עתודה נכנסים לתפקיד מהנדסי NASA JPL — Jet Propulsion Laboratory — ומתכנתים ב־JavaScript את טיסת המבחן הראשונה של Ingenuity על פני מאדים. בגלל שיהוי תקשורת של דקות ארוכות, אי אפשר “לתקן עם שלט” בזמן אמת: תוכנית הטיסה חייבת להיות מדויקת מראש.",
    "mission": "לכתוב ולהריץ בסימולטור Minimal Grid שתי משימות JavaScript: המראת מחקר לגובה 60 אינץ׳ עם tello.sleep(5), ולאחר מכן סייקל כיול ברומטרי לגובה 100 אינץ׳, ירידה 50 אינץ׳, ריחוף ונחיתה. בסיום שומרים בענן בשם Ingenuity_Mission_1 ומפיקים Share Link.",
    "commands": [
        "takeoff",
        "flyUp",
        "sleep",
        "flyDown",
        "sleep",
        "land",
        "save_cloud"
    ],
    "blocks": [
        "takeoff",
        "flyUp",
        "sleep",
        "flyDown",
        "sleep",
        "land",
        "save_cloud"
    ],
    "workspaceMode": "droneblocks-code",
    "physicalFlightAllowed": false,
    "essentialQuestion": "איך הופכים רחפן מ“צעצוע שלט” לרובוט אוטונומי שמבצע תוכנית טיסה מדויקת ב־JavaScript?",
    "successCriteria": [
        "אני מסביר/ה למה במפגש 1 אין הטסה פיזית ורק סימולטור Minimal Grid.",
        "אני מזהה את DroneBlocks Code, עורך הקוד ו־Function Reference.",
        "אני כותב/ת פקודות JavaScript בסיסיות עם סוגריים ונקודה־פסיק.",
        "אני מבדיל/ה בין takeoff, flyUp, flyDown, sleep ו־land.",
        "אני מסביר/ה למה sleep בין שינויי גובה עוזר לייצוב.",
        "אני שומר/ת את הפרויקט בשם Ingenuity_Mission_1 ומפיק/ה Share Link."
    ],
    "realWorldUses": [
        {
            "icon": "🪐",
            "title": "Ingenuity במאדים",
            "text": "מסוק מאדים של NASA טס לפי תוכניות אוטונומיות כי התקשורת מכדור הארץ איטית מדי לשליטה בזמן אמת."
        },
        {
            "icon": "🚁",
            "title": "רחפן כרובוט אוטונומי",
            "text": "הרחפן אינו צעצוע שלט: הוא מבצע רצף פקודות מתוכנת עם התחלה, בדיקת מערכת וסיום בטוח."
        },
        {
            "icon": "💻",
            "title": "JavaScript מקצועי",
            "text": "קוד טקסטואלי דורש דיוק מלא: אותיות, סוגריים ונקודה־פסיק משפיעים על הרצת המשימה."
        },
        {
            "icon": "🧪",
            "title": "סימולטור לפני מציאות",
            "text": "Minimal Grid מאפשר לבדוק רעיון בסביבה סטרילית לפני שהמדחפים מסתובבים בכיתה."
        }
    ],
    "vocabulary": [
        [
            "NASA JPL",
            "Jet Propulsion Laboratory — המעבדה להנעה סילונית של NASA, שמפתחת ומפעילה משימות רובוטיות לחלל."
        ],
        [
            "Ingenuity",
            "מסוק ניסוי קטן שטס על מאדים והוכיח שאפשר לבצע טיסה ממונעת באטמוספירה דלילה."
        ],
        [
            "Syntax / סינטקס",
            "כללי כתיבה מחייבים של JavaScript: שם פקודה מדויק, סוגריים, פרמטרים ונקודה־פסיק."
        ],
        [
            "Case Sensitivity",
            "רגישות לאותיות גדולות/קטנות: flyUp שונה מ־flyup."
        ],
        [
            "Function Reference",
            "ספריית הפקודות באפליקציה — המקום שבו בודקים איך כותבים כל פקודה."
        ],
        [
            "Lift / עילוי",
            "הכוח שנוצר מסיבוב הפרופלורים ודוחף אוויר למטה כדי להרים את הרחפן."
        ],
        [
            "Hover / ריחוף",
            "מצב שבו כוח העילוי מאזן את משקל הרחפן והוא נשאר בגובה קבוע."
        ],
        [
            "VPS",
            "Vision Positioning System — חיישני תחתית שעוזרים לרחפן להבין את מיקומו ביחס לקרקע."
        ],
        [
            "Share Link",
            "קישור לשיתוף פרויקט שנשמר בענן לבדיקה של המדריך."
        ]
    ],
    "safetyRules": [
        "אין הטסה פיזית במפגש 1. הרחפנים נשארים בארון; רחפן הדגמה מוצג ללא סוללה וללא הפעלה.",
        "עובדים רק ב־DroneBlocks Code וב־DroneBlocks Simulator בסביבת Minimal Grid.",
        "לא מחברים טאבלטים לרשת Tello במפגש זה — רק WiFi בית ספרי לשמירה ושיתוף.",
        "הקוד חייב להתחיל ב־tello.takeoff(); ולהסתיים ב־tello.land(); גם בסימולטור.",
        "לא מריצים קוד לפני קריאה שורה־שורה ובדיקת סינטקס.",
        "טאבלטים הפוכים בזמן הסבר כדי לשמור קשב ולמנוע כתיבה אקראית."
    ],
    "commonDirections": [
        [
            "tello.takeoff();",
            "המראה — פקודת פתיחת משימת טיסה."
        ],
        [
            "tello.flyUp(60);",
            "עלייה לגובה 60 אינץ׳, בערך גובה עיניים."
        ],
        [
            "tello.sleep(5);",
            "השהייה/ריחוף יציב למשך 5 שניות."
        ],
        [
            "tello.flyUp(100);",
            "עלייה לגובה שיא בסימולטור לצורך כיול."
        ],
        [
            "tello.flyDown(50);",
            "ירידה מדורגת 50 אינץ׳ לגובה ביניים."
        ],
        [
            "tello.land();",
            "נחיתה — סיום בטוח של התוכנית."
        ],
        [
            "Save Project / Share Link",
            "שמירה בענן והגשת קישור למדריך."
        ]
    ],
    "setupSteps": [
        "לוודא שכל הטאבלטים טעונים ומחוברים ל־WiFi בית ספרי.",
        "להכין מקרן עם DroneBlocks Code פתוח ודוגמת Function Reference.",
        "להציג רחפן Tello אחד ללא סוללה בלבד, לצורך אנטומיה וחיישנים.",
        "להכין כרטיסיות מילון פקודות JavaScript: takeoff, land, flyUp, flyDown, sleep.",
        "לפתוח את DroneBlocks Simulator בסביבת Minimal Grid.",
        "להזכיר: אין טיסה פיזית ואין חיבור ל־Tello WiFi במפגש זה."
    ],
    "tabletTips": [
        "טאבלט לרוחב, DroneBlocks Code פתוח, WiFi בית ספרי פעיל.",
        "להתחבר לחשבון לפני כתיבה כדי לאפשר שמירה בענן.",
        "להשתמש ב־Function Reference במקום לנחש שמות פקודות.",
        "לבדוק Case Sensitivity: flyUp ולא flyup; takeoff ולא Takeoff.",
        "לכתוב כל פקודה בשורה נפרדת עם סוגריים ונקודה־פסיק.",
        "אם הסימולטור קופא — לסגור אפליקציות רקע ולפתוח Minimal Grid מחדש."
    ],
    "lessonFlow": [
        {
            "minutes": "0–5",
            "title": "פתיחת מעבדת קוד רחפנים",
            "teacher": "מגדיר כללים: היום סימולטור בלבד, הרחפנים בארון, דיוק הנדסי לפני מדחפים.",
            "students": "מתיישבים עם טאבלט סגור/הפוך ומקשיבים לתדריך."
        },
        {
            "minutes": "5–15",
            "title": "סיפור מסגרת — NASA JPL ו־Ingenuity",
            "teacher": "מציג את JPL, Ingenuity ולמה במאדים חייבים תכנות אוטונומי מראש בגלל שיהוי תקשורת.",
            "students": "עונים: למה אי אפשר להטיס עם שלט רגיל במאדים?"
        },
        {
            "minutes": "15–25",
            "title": "אנטומיה ופיזיקה של Tello",
            "teacher": "מציג רחפן ללא סוללה: מנועים, פרופלורים, מצלמה, חיישני VPS; מסביר Lift, Hover, Land.",
            "students": "מזהים חלקים ומחברים בין כוח עילוי לריחוף."
        },
        {
            "minutes": "25–30",
            "title": "נוהל חיבור טכנולוגי",
            "teacher": "מנחה WiFi בית ספרי, פתיחת DroneBlocks Code ו־Login.",
            "students": "פותחים את האפליקציה ומוודאים חיבור לחשבון."
        },
        {
            "minutes": "30–45",
            "title": "מעבר ל־JavaScript וסינטקס",
            "teacher": "מדגים עורך קוד ריק, Function Reference, סוגריים, פרמטרים, נקודה־פסיק ו־Case Sensitivity.",
            "students": "מסמנים בקוד לדוגמה איפה הסוגריים, הפרמטר והנקודה־פסיק."
        },
        {
            "minutes": "45–60",
            "title": "אתגר 1 — המראת המחקר",
            "teacher": "כותב עם הכיתה את רצף takeoff → flyUp(60) → sleep(5) → land ומריץ ב־Minimal Grid.",
            "students": "כותבים ומריצים את הקוד הראשון בסימולטור."
        },
        {
            "minutes": "60–80",
            "title": "אתגר 2 — סייקל כיול ברומטרי",
            "teacher": "מוסיף flyUp(100), sleep(3), flyDown(50), sleep(5), land ומדגיש למה יש השהיות.",
            "students": "בונים את גרסת הכיול, מריצים ומתעדים שגיאת סינטקס אחת אם הופיעה."
        },
        {
            "minutes": "80–85",
            "title": "שמירה ושיתוף",
            "teacher": "מנחה Save Project בשם Ingenuity_Mission_1 ויצירת Share Link.",
            "students": "שומרים בענן ומעתיקים קישור להגשה."
        },
        {
            "minutes": "85–90",
            "title": "דיון סיכום וכיבוי",
            "teacher": "שואל למה sleep חשוב בין שינויי גובה ומוביל החזרת טאבלטים לעמדת טעינה.",
            "students": "משלימים כרטיס יציאה ומחזירים ציוד."
        }
    ],
    "exercises": [
        {
            "minutes": "10–15",
            "title": "למה אין שלט במאדים?",
            "prompt": "כתבו משפט אחד: למה Ingenuity צריך תוכנית אוטונומית מראש?",
            "check": "מוזכר שיהוי תקשורת/מרחק/אי אפשר לתקן בזמן אמת."
        },
        {
            "minutes": "15–25",
            "title": "אנטומיית Tello",
            "prompt": "זהו רחפן ללא סוללה: מנועים, פרופלורים, מצלמה וחיישני VPS.",
            "check": "התלמיד יודע לקשר בין חלק אחד לתפקידו."
        },
        {
            "minutes": "30–38",
            "title": "ציד סינטקס",
            "prompt": "סמנו בקוד tello.flyUp(60); את שם האובייקט, שם הפונקציה, הפרמטר והנקודה־פסיק.",
            "check": "הסימון מדויק."
        },
        {
            "minutes": "38–45",
            "title": "Function Reference",
            "prompt": "מצאו באפליקציה את הפקודות takeoff, land, flyUp, flyDown, sleep.",
            "check": "התלמיד לא מנחש שמות פקודות."
        },
        {
            "minutes": "45–60",
            "title": "אתגר 1 — 60 אינץ׳",
            "prompt": "כתבו והריצו: takeoff, flyUp(60), sleep(5), land.",
            "check": "הרצף רץ בסימולטור ומסתיים בנחיתה."
        },
        {
            "minutes": "60–75",
            "title": "אתגר 2 — כיול 100/50",
            "prompt": "כתבו והריצו את סייקל הכיול: flyUp(100), sleep(3), flyDown(50), sleep(5), land.",
            "check": "יש השהייה בגובה שיא ובגובה ביניים."
        },
        {
            "minutes": "75–80",
            "title": "דיבוג שורה אחת",
            "prompt": "אם הייתה שגיאה, תקנו רק שורה אחת והסבירו מה היה חסר.",
            "check": "מוזכרים סוגריים/אותיות/semicolon/שם פקודה."
        },
        {
            "minutes": "80–90",
            "title": "Share Link",
            "prompt": "שמרו בשם Ingenuity_Mission_1 וצרו קישור שיתוף.",
            "check": "יש שם קובץ ברור וקישור להגשה."
        }
    ],
    "deliverable": "פרויקט DroneBlocks Code בשם Ingenuity_Mission_1 הכולל שתי משימות סימולטור: המראת מחקר ל־60 אינץ׳ וסייקל כיול 100/50, עם Share Link וכרטיס יציאה קצר.",
    "assessment": [
        "אין ניסיון לחיבור רחפן פיזי או Tello WiFi במפגש 1.",
        "הקוד כולל takeoff ו־land בסדר בטוח.",
        "פקודות JavaScript נכתבו עם סוגריים ונקודה־פסיק.",
        "הסטודנט משתמש ב־Function Reference לתיקון שגיאות.",
        "האתגר השני כולל sleep לפני ירידה/נחיתה ומראה הבנה של ריחוף.",
        "הפרויקט נשמר בשם Ingenuity_Mission_1 או תועד אם הייתה תקלה טכנית."
    ],
    "debugging": [
        {
            "problem": "הסימולטור לא זז",
            "fix": "בודקים אם חסרים סוגריים: tello.takeoff(); ולא tello.takeoff."
        },
        {
            "problem": "פקודת עלייה לא מוכרת",
            "fix": "בודקים Case Sensitivity: flyUp עם U גדולה, לא flyup ולא FlyUp."
        },
        {
            "problem": "שגיאת Syntax בסוף שורה",
            "fix": "מוודאים נקודה־פסיק ; בסוף כל פקודה."
        },
        {
            "problem": "התלמיד כתב מספר בלי סוגריים",
            "fix": "הפרמטר חייב להיות בתוך סוגריים: tello.flyUp(60);."
        },
        {
            "problem": "האפליקציה לא נפתחת/לא שומרת",
            "fix": "בודקים WiFi בית ספרי, Login ופתיחה מחדש של DroneBlocks Code."
        },
        {
            "problem": "Minimal Grid איטי או קופא",
            "fix": "סוגרים אפליקציות רקע, מרעננים סימולטור או מפעילים טאבלט מחדש."
        }
    ],
    "differentiation": {
        "support": [
            "לתת שלד קוד עם שורות חסרות להשלמה.",
            "לאפשר לתלמיד להסביר את הקוד בקול לפני כתיבה מלאה.",
            "להשתמש בכרטיסיית פקודות צמודה: takeoff, flyUp, sleep, flyDown, land."
        ],
        "extension": [
            "לבקש להשוות sleep(1) מול sleep(5) ולהסביר למה ריחוף ארוך יציב יותר.",
            "להוסיף הערות // לפני כל שלב בקוד.",
            "לבנות משתנה const maxHeight = 100; כהכנה לשיעורי משתנים בהמשך."
        ]
    },
    "instructorGuide": {
        "prerequisites": "זהו שיעור פתיחה: אין להניח ידע קודם ב־DroneBlocks Code. תנאי הקדם היחידים הם תפעול טאבלט בסיסי, הקשבה לנוהל בטיחות, ויכולת להעתיק קוד קצר בדיוק.",
        "pedagogy": [
            "להציג את המעבר התפיסתי: רחפן אינו צעצוע שלט אלא רובוט אוטונומי שמבצע תוכנית טיסה.",
            "להדגיש שסינטקס אינו המלצה אלא דרישה מבנית: JavaScript רגיש לאותיות, סוגריים ונקודה־פסיק.",
            "להשתמש ברחפן הפיזי רק כאובייקט הדגמה ללא סוללה. עצם ההימנעות מטיסה היא שיעור בטיחות.",
            "הסימולטור הוא “סביבה סטרילית” לבניית מסוגלות לפני העולם הפיזי.",
            "השהיית sleep אינה בזבוז זמן; היא חלק מתכנון יציבות, ריחוף ואיסוף נתונים."
        ],
        "facilitationNotes": [
            "להפוך טאבלטים על השולחן בזמן סיפור המסגרת והסבר הסינטקס.",
            "להקרין Function Reference ולחזור אליו בכל שגיאה במקום לתת תשובה מיידית.",
            "לעצור את הכיתה לפני האתגר השני ולשאול: מה יקרה אם נשכח land?",
            "לאסוף Share Links או לפחות צילום מסך אם יש בעיית Login.",
            "להחזיר טאבלטים לעמדת טעינה בסיום."
        ],
        "mediaNote": "אפשר להשתמש בסרטון NASA JPL על Ingenuity כהשראה קצרה. לא להפוך את החלק הזה לשיעור צפייה ארוך; הסרטון משרת את ההבנה למה צריך קוד אוטונומי.",
        "exitTicket": "דיוק סינטקס חשוב בתכנות רחפן כי ___."
    },
    "appWorkflowTitle": "DroneBlocks Code — Ingenuity Mission 1 בסימולטור Minimal Grid",
    "appWorkflowNote": "מפגש 1 מתבצע כולו בטאבלט ובסימולטור. אין חיבור לרחפן פיזי, אין Tello WiFi ואין Launch Mission בעולם האמיתי.",
    "appWorkflow": [
        {
            "title": "WiFi בית ספרי + Login",
            "detail": "פתחו את DroneBlocks Code כשהטאבלט מחובר לאינטרנט בית ספרי והתחברו לחשבון לשמירה בענן."
        },
        {
            "title": "Function Reference",
            "detail": "אתרו את הפקודות tello.takeoff(), tello.land(), tello.flyUp(inches), tello.flyDown(inches), tello.sleep(seconds)."
        },
        {
            "title": "Minimal Grid Simulator",
            "detail": "פתחו את הסימולטור ובחרו סביבת Minimal Grid. זו סביבת הטיסה היחידה במפגש 1."
        },
        {
            "title": "אתגר 1 — 60 אינץ׳",
            "detail": "כתבו tello.takeoff(); tello.flyUp(60); tello.sleep(5); tello.land(); והריצו בסימולטור."
        },
        {
            "title": "אתגר 2 — כיול 100/50",
            "detail": "כתבו tello.takeoff(); tello.flyUp(100); tello.sleep(3); tello.flyDown(50); tello.sleep(5); tello.land();."
        },
        {
            "title": "Save & Share",
            "detail": "שמרו בשם Ingenuity_Mission_1, צרו Share Link והגישו למדריך."
        }
    ],
    "visualDiagram": {
        "panelTitle": "🪐 Ingenuity Vertical Calibration",
        "chip": "Minimal Grid",
        "title": "טיסת מבחן בציר האנכי — 60, 100 ו־50 אינץ׳",
        "src": "assets/drone-coding-foundations/lesson1/ingenuity-vertical-calibration.svg",
        "alt": "תרשים משימת Ingenuity עם המראה, עלייה לגובה 100 אינץ, ירידה ל-50 אינץ ונחיתה",
        "caption": "במפגש 1 מתרגלים חשיבה אוטונומית וסינטקס מדויק בסימולטור בלבד — לפני כל מדחף אמיתי."
    },
    "videoResources": [
        {
            "title": "NASA JPL — Ingenuity Historic First Flight on Mars",
            "url": "https://www.jpl.nasa.gov/videos/ingenuitys-historic-first-flight",
            "note": "להקרין 2–4 דקות כדי לחבר בין שיהוי תקשורת, מאדים ותכנות אוטונומי."
        },
        {
            "title": "NASA Mars Helicopter / Ingenuity Mission",
            "url": "https://science.nasa.gov/mission/mars-2020-perseverance/ingenuity-mars-helicopter/",
            "note": "מקור רקע למדריך על המשימה ועל אתגרי טיסה במאדים."
        }
    ],
    "screenshotSlides": [
        {
            "title": "פותחים DroneBlocks Code",
            "src": "assets/tello-mission-lab/lesson1/open-app.png",
            "caption": "מתחברים לחשבון על WiFi בית ספרי לפני כתיבה ושמירה."
        },
        {
            "title": "רצף קוד אנכי",
            "src": "assets/drone-coding-foundations/lesson1/ingenuity-vertical-calibration.svg",
            "caption": "Takeoff → flyUp → sleep → flyDown → sleep → land."
        },
        {
            "title": "Minimal Grid Simulator",
            "src": "assets/tello-mission-lab/lesson1/simulator-run.png",
            "caption": "מריצים בסביבה סטרילית בלבד, ללא רחפן פיזי."
        },
        {
            "title": "Save & Share",
            "src": "assets/tello-mission-lab/lesson1/save-share.png",
            "caption": "שומרים Ingenuity_Mission_1 ומפיקים Share Link."
        }
    ],
    "instructorSlides": [
        {
            "title": "ברוכים הבאים למהנדסי טיסה אוטונומית",
            "body": "היום עוברים מתפיסת “צעצוע שלט” לרובוט שמבצע תוכנית JavaScript מדויקת.",
            "bullets": [
                "DroneBlocks Code",
                "סימולטור בלבד",
                "אחריות הנדסית"
            ]
        },
        {
            "title": "NASA JPL ו־Ingenuity",
            "body": "JPL היא המעבדה להנעה סילונית של NASA. במאדים לא מטיסים בשלט רגיל בגלל שיהוי תקשורת — מתכנתים מראש.",
            "bullets": [
                "Jet Propulsion Laboratory",
                "Ingenuity",
                "אוטונומיה"
            ]
        },
        {
            "title": "איך Tello נשאר באוויר?",
            "body": "עילוי נוצר מהפרופלורים; ריחוף הוא איזון בין עילוי למשקל; נחיתה היא הורדת כוח בצורה מבוקרת.",
            "bullets": [
                "Lift",
                "Hover",
                "Land",
                "VPS"
            ]
        },
        {
            "title": "חוקי הסינטקס",
            "body": "JavaScript דורש כתיבה מדויקת: tello.flyUp(60); שונה מ־tello.flyup(60).",
            "bullets": [
                "Case Sensitivity",
                "()",
                ";"
            ]
        },
        {
            "title": "אתגרי הקוד",
            "body": "משימת 60 אינץ׳ ואז סייקל כיול 100/50 — הכול ב־Minimal Grid.",
            "bullets": [
                "tello.takeoff();",
                "tello.sleep(5);",
                "tello.land();"
            ]
        },
        {
            "title": "שמירה ושיתוף",
            "body": "הפרויקט נשמר בשם Ingenuity_Mission_1 ונשלח כ־Share Link לבדיקה.",
            "bullets": [
                "Save Project",
                "Share Link",
                "כרטיס יציאה"
            ]
        }
    ]
});


  Object.assign(window.DRONE_CODING_FOUNDATIONS_LESSONS[1], {
    "title": "שיעור 2: ניווט דו־מימדי ואתגר הריבוע — SolarDrone Box Mission",
    "subtitle": "Pitch, Roll, Yaw והשוואת Strafing Box מול Yaw Box ב־JavaScript",
    "unit": "יחידה 1 — יסודות רחפן, בטיחות וסימולטור JavaScript",
    "concept": "ניווט דו־מימדי, פניות, ארגומנטים ויעילות קוד במשימת ריבוע 60 אינץ׳",
    "story": "צוותי כיתה ז׳ מצטרפים לחברת SolarDrone הישראלית שמפתחת רחפנים לניקוי וסריקה תרמית של לוחות סולאריים במדבר. אבק וסדקים מורידים תפוקה ועלולים לגרום לשריפות, ולכן הרחפן חייב לסרוק לוח מרובע במסלול בטוח ומדויק. היום בודקים שתי אסטרטגיות: תנועה צידית בלי פניות מול טיסה קדימה עם Yaw בכל פינה.",
    "mission": "לכתוב ב־DroneBlocks Code שתי גרסאות JavaScript לאתגר ריבוע 60 אינץ׳ בסימולטור Minimal Grid: Strafing Box עם moveForward/moveRight/moveBackward/moveLeft ללא Yaw, ו־Yaw Box עם moveForward ו־tello.yawRight(90) בכל פינה. בסיום משווים יעילות קוד מול בטיחות מצלמה ושומרים בשם Solar_Scan_Yaw_Grade7_TeamX.",
    "commands": [
        "takeoff",
        "forward",
        "right",
        "back",
        "left",
        "yaw",
        "land",
        "save_cloud"
    ],
    "blocks": [
        "takeoff",
        "forward",
        "right",
        "back",
        "left",
        "yaw",
        "land",
        "save_cloud"
    ],
    "workspaceMode": "droneblocks-code",
    "physicalFlightAllowed": false,
    "essentialQuestion": "איזו אסטרטגיית ניווט עדיפה לסריקת לוח סולארי: פחות שורות קוד או מצלמה שפונה לכיוון התנועה?",
    "successCriteria": [
        "אני מסביר/ה את ההבדל בין Pitch, Roll ו־Yaw באמצעות הגוף ובאמצעות פקודות JavaScript.",
        "אני כותב/ת פקודות תנועה עם ארגומנטים בסוגריים: inches או degrees.",
        "אני בונה Strafing Box מלא ללא פקודות yaw.",
        "אני בונה Yaw Box עם ארבע פניות tello.yawRight(90).",
        "אני משווה בין 6 שורות בערך ל־10 שורות ומסביר/ה את מחיר היעילות.",
        "אני מסביר/ה למה כיוון המצלמה משפיע על בטיחות משימת סריקה.",
        "אני שומר/ת Share Link בשם Solar_Scan_Yaw_Grade7_TeamX."
    ],
    "realWorldUses": [
        {
            "icon": "☀️",
            "title": "סריקת שדות סולאריים",
            "text": "רחפנים בודקים לוחות סולאריים גדולים כדי לזהות אבק, סדקים ונקודות חמות."
        },
        {
            "icon": "🔥",
            "title": "מניעת שריפות",
            "text": "סריקה תרמית יכולה לזהות תקלה בלוח לפני שהיא הופכת לסיכון בטיחותי."
        },
        {
            "icon": "🧭",
            "title": "אסטרטגיית ניווט",
            "text": "אותה מטרה יכולה להיפתר בכמה אלגוריתמים — השאלה היא מה יעיל ומה בטוח."
        },
        {
            "icon": "📷",
            "title": "כיוון מצלמה",
            "text": "מצלמה קדמית שרואה את כיוון הטיסה עוזרת לזהות מכשולים לפני התנגשות."
        }
    ],
    "vocabulary": [
        [
            "Pitch / עלרוד",
            "נטיית הרחפן קדימה או אחורה; בפועל מחוברת ל־moveForward ו־moveBackward."
        ],
        [
            "Roll / גלגול",
            "נטיית הרחפן ימינה או שמאלה; מחוברת ל־moveRight ו־moveLeft."
        ],
        [
            "Yaw / סבסוב",
            "סיבוב הרחפן סביב הציר האנכי שלו; משנה את כיוון האף והמצלמה."
        ],
        [
            "Strafing Box",
            "מסלול ריבוע שבו הרחפן זז לצדדים בלי לשנות את כיוון המצלמה."
        ],
        [
            "Yaw Box",
            "מסלול ריבוע שבו הרחפן טס קדימה ופונה 90 מעלות בכל פינה."
        ],
        [
            "Argument / ארגומנט",
            "המספר שבתוך הסוגריים: מרחק באינץ׳ או זווית במעלות."
        ],
        [
            "CamelCase",
            "סגנון שמות כמו moveForward: המילה הראשונה קטנה והמילה השנייה מתחילה באות גדולה."
        ],
        [
            "Code Efficiency",
            "מדד לכמות שורות, קריאות וסיכון טעויות בקוד."
        ]
    ],
    "safetyRules": [
        "אין הטסה פיזית במפגש 2. הרחפנים נשארים בארון והעבודה מתבצעת רק ב־Minimal Grid Simulator.",
        "לא מחברים לטאבלטים WiFi של רחפן פיזי — רק WiFi בית ספרי לשמירה ושיתוף.",
        "לפני Run בסימולטור קוראים את הקוד שורה־שורה ומוודאים takeoff בתחילה ו־land בסוף.",
        "בודקים שארגומנטים הם 60 אינץ׳ ו־90 מעלות, לא 600 או 900.",
        "לא משנים כמה שורות יחד בדיבוג; מתקנים שגיאה אחת בכל פעם.",
        "שומרים גרסה לפני ניסוי Yaw Box כדי לא לאבד את Strafing Box."
    ],
    "commonDirections": [
        [
            "tello.moveForward(60);",
            "תנועה קדימה 60 אינץ׳ — Pitch קדימה."
        ],
        [
            "tello.moveBackward(60);",
            "תנועה לאחור 60 אינץ׳ — Pitch לאחור."
        ],
        [
            "tello.moveRight(60);",
            "תנועה ימינה בלי לסובב את האף — Roll."
        ],
        [
            "tello.moveLeft(60);",
            "תנועה שמאלה בלי לסובב את האף — Roll."
        ],
        [
            "tello.yawRight(90);",
            "סבסוב ימינה 90° — כיוון המצלמה משתנה."
        ],
        [
            "tello.yawLeft(degrees);",
            "סבסוב שמאלה לפי זווית."
        ],
        [
            "Solar_Scan_Yaw_Grade7_TeamX",
            "שם ההגשה בענן."
        ]
    ],
    "setupSteps": [
        "טאבלטים טעונים, WiFi בית ספרי ו־DroneBlocks Code מעודכן.",
        "מקרן פתוח על קוד דוגמה קצר עם moveForward ו־yawRight.",
        "דפי טיוטה לתכנון שתי אסטרטגיות הריבוע בפסאודו־קוד.",
        "לפתוח Minimal Grid Simulator בלבד.",
        "לכתוב על הלוח: Strafing = מצלמה קבועה; Yaw = מצלמה מסתובבת לכיוון הטיסה.",
        "להכין טבלת השוואה: שורות קוד, כיוון מצלמה, יציבות, בטיחות."
    ],
    "tabletTips": [
        "להתחבר לחשבון לפני התחלת הקוד כדי לאפשר Save/Share.",
        "לפתוח Function Reference ולחפש moveForward, moveRight, moveBackward, moveLeft, yawRight, yawLeft.",
        "לשים לב ל־CamelCase: moveForward ולא moveforward.",
        "בכל פקודה עם מרחק/זווית המספר נכנס בתוך סוגריים.",
        "להריץ קודם Strafing Box, לשמור, ואז ליצור גרסת Yaw Box.",
        "אם הסימולטור “נעלם”, לבדוק אם נכתב 600 במקום 60 ואז Reset."
    ],
    "lessonFlow": [
        {
            "minutes": "0–7",
            "title": "גשר משיעור 1",
            "teacher": "מזכיר שבשיעור 1 עבדנו בציר Z: flyUp/flyDown. היום עוברים למישור האופקי ולפניות.",
            "students": "פותחים טאבלטים רק אחרי תדריך קצר ומזכירים פקודת sleep/land אחת."
        },
        {
            "minutes": "7–17",
            "title": "סיפור SolarDrone",
            "teacher": "מציג את בעיית האבק והסדקים בלוחות סולאריים ואת הצורך בסריקה אוטונומית.",
            "students": "מנסחים למה מסלול ישר ומדויק חשוב בשדה סולארי."
        },
        {
            "minutes": "17–27",
            "title": "הפעלה קינסטטית — Pitch/Roll/Yaw",
            "teacher": "מעמיד את הכיתה: נטייה קדימה/אחורה, צעד צידי, סיבוב 90° במקום.",
            "students": "מבצעים בגוף ומסבירים מה קורה לכיוון המצלמה."
        },
        {
            "minutes": "27–35",
            "title": "נוהל טכנולוגי",
            "teacher": "מנחה WiFi בית ספרי, DroneBlocks Code, Login ו־Minimal Grid Simulator.",
            "students": "פותחים סביבת עבודה ושומרים קובץ ראשוני."
        },
        {
            "minutes": "35–45",
            "title": "סינטקס של פקודה עם ארגומנט",
            "teacher": "מדגים tello.moveForward(60); ו־tello.yawRight(90); כולל נקודה, CamelCase, סוגריים ונקודה־פסיק.",
            "students": "מסמנים בקוד את action ואת argument."
        },
        {
            "minutes": "45–58",
            "title": "אתגר 1 — Strafing Box",
            "teacher": "מלווה כתיבת takeoff, moveForward, moveRight, moveBackward, moveLeft, land.",
            "students": "מריצים ריבוע ללא Yaw ושומרים גרסה."
        },
        {
            "minutes": "58–73",
            "title": "אתגר 2 — Yaw Box",
            "teacher": "מדגים איך חוזרים על moveForward + yawRight(90) בכל פינה, בלי ללמד עדיין לולאה.",
            "students": "כותבים גרסה סיבובית ומוודאים שגם האף חוזר לכיוון ההתחלה."
        },
        {
            "minutes": "73–82",
            "title": "דיון מהנדסים",
            "teacher": "מוביל השוואה: 6 שורות מול 10 שורות, מצלמה קבועה מול מצלמה לכיוון הטיסה, יציבות ברוח.",
            "students": "בוחרים אסטרטגיה לשדה אמיתי ומנמקים."
        },
        {
            "minutes": "82–90",
            "title": "Share Link וסגירת ציוד",
            "teacher": "מנחה שמירה בשם Solar_Scan_Yaw_Grade7_TeamX ואיסוף קישורים.",
            "students": "שומרים, שולחים קישור ומחזירים טאבלטים לעגינה."
        }
    ],
    "exercises": [
        {
            "minutes": "7–17",
            "title": "בעיית SolarDrone",
            "prompt": "כתבו למה אבק/סדק בלוח סולארי דורש סריקה מדויקת ולא טיסה אקראית.",
            "check": "התשובה מזכירה תפוקת חשמל/בטיחות/שריפה."
        },
        {
            "minutes": "17–27",
            "title": "Pitch/Roll/Yaw בגוף",
            "prompt": "הראו בגוף את ההבדל בין צעד ימינה לבין פנייה ימינה.",
            "check": "התלמיד מבדיל בין moveRight ל־yawRight."
        },
        {
            "minutes": "35–42",
            "title": "פירוק פקודה",
            "prompt": "פרקו את tello.yawRight(90); ל־object, function, argument ו־semicolon.",
            "check": "כל רכיב מזוהה נכון."
        },
        {
            "minutes": "45–58",
            "title": "Strafing Box",
            "prompt": "כתבו והריצו ריבוע 60 אינץ׳ ללא פקודות Yaw.",
            "check": "הקוד כולל moveForward, moveRight, moveBackward, moveLeft ו־land."
        },
        {
            "minutes": "58–73",
            "title": "Yaw Box",
            "prompt": "כתבו והריצו ריבוע עם moveForward(60) ו־yawRight(90) בכל פינה.",
            "check": "יש ארבע פניות 90° והרחפן חוזר לכיוון המקורי."
        },
        {
            "minutes": "73–78",
            "title": "ספירת שורות",
            "prompt": "ספרו כמה שורות יש בכל פתרון ומה היתרון/חיסרון.",
            "check": "התלמיד מזהה ששיטה 2 ארוכה יותר אבל מכוונת מצלמה."
        },
        {
            "minutes": "78–82",
            "title": "דילמת מצלמה",
            "prompt": "איזו שיטה עדיפה לסריקה תרמית בשטח אמיתי ומדוע?",
            "check": "התשובה מחברת מצלמה, מכשולים ובטיחות."
        },
        {
            "minutes": "82–90",
            "title": "הגשה",
            "prompt": "שמרו Solar_Scan_Yaw_Grade7_TeamX והפיקו Share Link.",
            "check": "יש שם קובץ וקישור/צילום מסך במקרה תקלה."
        }
    ],
    "deliverable": "פרויקט DroneBlocks Code בשם Solar_Scan_Yaw_Grade7_TeamX עם שתי גרסאות Box Mission: Strafing Box ו־Yaw Box, השוואת שורות/בטיחות, ו־Share Link.",
    "assessment": [
        "העבודה נשארה בסימולטור בלבד ללא חיבור לרחפן פיזי.",
        "Strafing Box משתמש בתנועות קדימה/ימינה/אחורה/שמאלה בלי Yaw.",
        "Yaw Box משתמש ב־moveForward וארבע פניות yawRight(90).",
        "הקוד כתוב ב־CamelCase נכון עם סוגריים ונקודה־פסיק.",
        "התלמיד מסביר את ההבדל בין Roll ל־Yaw דרך כיוון המצלמה.",
        "ההשוואה בין השיטות כוללת גם יעילות קוד וגם בטיחות מבצעית."
    ],
    "debugging": [
        {
            "problem": "Uncaught TypeError: tello.moveforward is not a function",
            "fix": "לתקן ל־moveForward עם F גדולה. JavaScript רגיש ל־CamelCase."
        },
        {
            "problem": "SyntaxError: Unexpected token",
            "fix": "לבדוק סוגריים ונקודה־פסיק בכל שורה: tello.action(argument);."
        },
        {
            "problem": "Yaw Box לא סוגר ריבוע",
            "fix": "לספור ארבע פעמים moveForward(60) וארבע פעמים yawRight(90), כולל הפנייה האחרונה להחזרת האף."
        },
        {
            "problem": "הרחפן בסימולטור נעלם מהמסך",
            "fix": "לבדוק שלא נכתב 600 במקום 60, לבצע Reset ולהריץ מחדש."
        },
        {
            "problem": "התלמיד מחליף moveRight ב־yawRight",
            "fix": "לחזור להדגמה הגופנית: צעד צידי מול סיבוב במקום; לשאול לאן המצלמה מסתכלת."
        },
        {
            "problem": "Share Link נכשל",
            "fix": "לוודא WiFi בית ספרי ו־Login; אם צריך להעתיק קוד ידנית למסמך זמני."
        }
    ],
    "differentiation": {
        "support": [
            "לתת טבלת התאמה: Pitch=Forward/Backward, Roll=Right/Left, Yaw=Turn.",
            "לתת שלד קוד עם שורות חסרות לכל אחת משתי השיטות.",
            "לאפשר ציור המסלול על דף לפני כתיבת JavaScript."
        ],
        "extension": [
            "לבקש להוסיף // comments שמסבירים בכל שיטה איפה המצלמה פונה.",
            "לבנות גרסה עם yawLeft(90) ולהשוות כיוון סיבוב.",
            "להכין טבלת החלטה למהנדס: Code lines, Camera awareness, Wind stability, Debug risk."
        ]
    },
    "instructorGuide": {
        "prerequisites": "התלמידים מגיעים משיעור 1 שבו הכירו את DroneBlocks Code, Minimal Grid, פקודות ציר Z ודיוק סינטקס. לבדוק שהם זוכרים takeoff/land/sleep ושהם מבינים שאין טיסה פיזית גם במפגש 2.",
        "pedagogy": [
            "המעבר מציר אנכי למישור אופקי הוא קפיצה חשובה: עכשיו התלמידים מבינים שהרחפן נע בגוף תלת־ממדי ולא רק “עולה ויורד”.",
            "הבלבול בין moveRight לבין yawRight הוא צפוי ומבורך — הוא הזדמנות ללמידה פיזיקלית ולוגית.",
            "ההשוואה בין שתי אסטרטגיות היא לב השיעור: לא מחפשים רק קוד קצר, אלא התאמה למשימה אמיתית.",
            "להדגיש שדיוק סינטקס עדיין קריטי: ארגומנט שגוי אחד משנה את כל המסלול.",
            "להימנע מללמד לולאות כאן גם אם התבנית חוזרת; זה יהפוך לגשר מצוין לשיעור 4."
        ],
        "facilitationNotes": [
            "להפעיל את התרגול הקינסטטי לפני פתיחת הטאבלטים.",
            "לכתוב על הלוח: Strafing = אף קבוע; Yaw = אף מסתובב.",
            "לאפשר לתלמידים לבחור בסוף איזו שיטה עדיפה, אבל לדרוש נימוק מבצעי.",
            "לשמור את שתי הגרסאות או לפחות להעתיק אחת כהערה בתוך הקובץ.",
            "אם הכיתה מתקדמת, לחשוף yawLeft כבונוס בלבד."
        ],
        "mediaNote": "אפשר להקרין סרטון קצר של סריקת פאנלים סולאריים ברחפן או ניקוי אוטונומי. לשמור על 2–4 דקות כדי להשאיר זמן לקוד.",
        "exitTicket": "ב־Strafing המצלמה ___, וב־Yaw המצלמה ___; לכן בשטח אמיתי הייתי בוחר/ת ___ כי ___."
    },
    "appWorkflowTitle": "DroneBlocks Code — SolarDrone Box Mission בסימולטור Minimal Grid",
    "appWorkflowNote": "מפגש 2 מתבצע כולו בטאבלט ובסימולטור. אין חיבור לרחפן פיזי. המטרה היא להשוות שתי אסטרטגיות ניווט לפני מעבר לעולם האמיתי.",
    "appWorkflow": [
        {
            "title": "WiFi בית ספרי + קובץ חדש",
            "detail": "פתחו DroneBlocks Code, התחברו לחשבון ושמרו טיוטה בשם Solar_Scan_Draft_TeamX."
        },
        {
            "title": "פסאודו־קוד על דף",
            "detail": "שרטטו שתי דרכים להקיף ריבוע: Strafing ללא פניות ו־Yaw עם פנייה בכל פינה."
        },
        {
            "title": "Strafing Box",
            "detail": "כתבו takeoff → moveForward(60) → moveRight(60) → moveBackward(60) → moveLeft(60) → land."
        },
        {
            "title": "Yaw Box",
            "detail": "כתבו takeoff ואז ארבע פעמים moveForward(60) + yawRight(90), כולל הפנייה האחרונה להחזרת האף."
        },
        {
            "title": "השוואה הנדסית",
            "detail": "ספרו שורות והשוו: איזו שיטה קצרה יותר? איזו שומרת מצלמה לכיוון הטיסה?"
        },
        {
            "title": "Save & Share",
            "detail": "שמרו בשם Solar_Scan_Yaw_Grade7_TeamX, צרו Share Link והגישו למדריך."
        }
    ],
    "visualDiagram": {
        "panelTitle": "☀️ SolarDrone Box Mission",
        "chip": "Minimal Grid",
        "title": "Strafing Box מול Yaw Box",
        "src": "assets/drone-coding-foundations/lesson2/solar-box-strafing-vs-yaw.svg",
        "alt": "שתי אסטרטגיות ריבוע בסימולטור: Strafing ללא פניות מול Yaw עם פניות 90 מעלות",
        "caption": "אותו ריבוע, שתי תוכניות טיסה: קוד קצר יותר מול מודעות מצלמה ובטיחות בשטח."
    },
    "videoResources": [
        {
            "title": "Thermal solar inspection with drones",
            "url": "https://www.youtube.com/results?search_query=thermal+solar+inspection+with+drones",
            "note": "חיפוש מוצע למדריך לסרטון קצר שמראה סריקת פאנלים סולאריים."
        },
        {
            "title": "Autonomous solar panel cleaning drone",
            "url": "https://www.youtube.com/results?search_query=autonomous+drone+solar+panel+cleaning",
            "note": "להשתמש כהשראה קצרה על מסלולים ישרים ומדויקים מעל שדות סולאריים."
        }
    ],
    "screenshotSlides": [
        {
            "title": "פותחים DroneBlocks Code",
            "src": "assets/tello-mission-lab/lesson1/open-app.png",
            "caption": "WiFi בית ספרי, Login וקובץ חדש לפני עבודה."
        },
        {
            "title": "תרשים הריבוע הכפול",
            "src": "assets/drone-coding-foundations/lesson2/solar-box-strafing-vs-yaw.svg",
            "caption": "Strafing מול Yaw — אותו יעד, אסטרטגיות שונות."
        },
        {
            "title": "Minimal Grid Simulator",
            "src": "assets/tello-mission-lab/lesson1/simulator-run.png",
            "caption": "מריצים שתי גרסאות בסימולטור בלבד."
        },
        {
            "title": "Save & Share",
            "src": "assets/tello-mission-lab/lesson1/save-share.png",
            "caption": "Solar_Scan_Yaw_Grade7_TeamX + Share Link."
        }
    ],
    "instructorSlides": [
        {
            "title": "SolarDrone — משימת סריקה אוטונומית",
            "body": "היום נכתוב JavaScript לסריקת לוח סולארי מרובע ונבדוק שתי אסטרטגיות ניווט.",
            "bullets": [
                "Minimal Grid",
                "60 אינץ׳",
                "סימולטור בלבד"
            ]
        },
        {
            "title": "Pitch, Roll, Yaw",
            "body": "Pitch מזיז קדימה/אחורה, Roll מזיז לצדדים, Yaw מסובב את הרחפן ומשנה את כיוון המצלמה.",
            "bullets": [
                "moveForward",
                "moveRight",
                "yawRight"
            ]
        },
        {
            "title": "סינטקס עם ארגומנטים",
            "body": "בפקודות תנועה המספר בתוך הסוגריים הוא מרחק או זווית. JavaScript דורש CamelCase מדויק.",
            "bullets": [
                "tello.moveForward(60);",
                "tello.yawRight(90);",
                ";"
            ]
        },
        {
            "title": "אתגר 1 — Strafing Box",
            "body": "ריבוע ללא פניות: המצלמה נשארת באותו כיוון לאורך כל המסלול.",
            "bullets": [
                "Forward",
                "Right",
                "Backward",
                "Left"
            ]
        },
        {
            "title": "אתגר 2 — Yaw Box",
            "body": "ריבוע עם פניות: טיסה קדימה בלבד ו־Yaw 90° בכל פינה.",
            "bullets": [
                "Forward",
                "Yaw 90°",
                "מצלמה לכיוון הטיסה"
            ]
        },
        {
            "title": "דילמת מהנדס",
            "body": "מה עדיף בשדה אמיתי: פחות שורות קוד או מצלמה שמסתכלת לכיוון ההתקדמות?",
            "bullets": [
                "יעילות",
                "בטיחות",
                "יציבות ברוח"
            ]
        },
        {
            "title": "שמירה ושיתוף",
            "body": "שומרים את הקוד בשם Solar_Scan_Yaw_Grade7_TeamX ושולחים Share Link.",
            "bullets": [
                "Save Project",
                "Share Link",
                "גרסאות"
            ]
        }
    ]
});


  Object.assign(window.DRONE_CODING_FOUNDATIONS_LESSONS[2], {
    "title": "שיעור 3: ענן ו־Mars Explorer — משימות חקר בסימולטור מאדים",
    "subtitle": "Mars Simulator, שמירה בענן, תנועה תלת־ממדית, sleep ו־Share Links",
    "unit": "יחידה 1 — יסודות רחפן, בטיחות וסימולטור JavaScript",
    "concept": "עבודה בענן, Mars Simulator, תנועה תלת־ממדית ושיהוי תקשורת במשימה אוטונומית",
    "story": "צוותי כיתה ז׳ חוזרים ל־NASA JPL ומתכנתים את Ingenuity למשימת חקר במכתש ג׳זרו. במאדים האטמוספירה דלילה, הכבידה נמוכה והתקשורת מתעכבת 4–20 דקות, ולכן הקוד חייב לכלול גבהים, השהיות ושמירה מסודרת בענן.",
    "mission": "לתכנן על דף Paper Code ולכתוב ב־DroneBlocks Code משימת Mars Simulator: takeoff, עלייה ל־60 אינץ׳ ו־sleep(2), טיסה לפאנלים, עלייה ל־90 אינץ׳ ו־yawRight(90), מעבר לסייסמוגרף, flyDown(40), sleep(3), חזרה 80 אינץ׳ ונחיתה. בסיום שומרים Mars_Explorer_Grade7_TeamX ומשתפים Desktop/Device Share Link.",
    "commands": [
        "takeoff",
        "flyUp",
        "sleep",
        "forward",
        "flyUp",
        "yaw",
        "forward",
        "flyDown",
        "sleep",
        "yaw",
        "forward",
        "land",
        "save_cloud"
    ],
    "blocks": [
        "takeoff",
        "flyUp",
        "sleep",
        "forward",
        "flyUp",
        "yaw",
        "forward",
        "flyDown",
        "sleep",
        "yaw",
        "forward",
        "land",
        "save_cloud"
    ],
    "workspaceMode": "droneblocks-code",
    "physicalFlightAllowed": false,
    "essentialQuestion": "איך תכנון תלת־ממדי, sleep ושמירה בענן הופכים קוד JavaScript למשימת חקר שאפשר לבדוק ולשתף?",
    "successCriteria": [
        "אני מסביר/ה למה במאדים נדרש תכנות אוטונומי מראש.",
        "אני עובד/ת ב־Mars Simulator בלבד ללא רחפן פיזי.",
        "אני משתמש/ת ב־flyUp/flyDown/sleep כדי לשלוט בגובה ובייצוב.",
        "אני כותב/ת Paper Code לפני הקלדה מלאה.",
        "אני בונה את המשימה בשלבים קטנים ולא כותב/ת 15 שורות בבת אחת.",
        "אני שומר/ת בענן בשם Mars_Explorer_Grade7_TeamX ומשתף/ת קישור מתאים."
    ],
    "realWorldUses": [
        {
            "icon": "🪐",
            "title": "חקר מאדים",
            "text": "משימות חלל דורשות קוד אוטונומי כי אין שליטה מיידית מכדור הארץ."
        },
        {
            "icon": "☀️",
            "title": "פאנלים סולאריים",
            "text": "רובוטים בודקים מערכי אנרגיה ומוודאים שיש מספיק כוח להמשך המשימה."
        },
        {
            "icon": "📡",
            "title": "שיהוי תקשורת",
            "text": "כשפקודה מגיעה באיחור של דקות, צריך לתכנן הכול מראש."
        },
        {
            "icon": "☁️",
            "title": "עבודה בענן",
            "text": "Share Link מאפשר למדריך לבדוק קוד, לשחזר גרסאות ולהציג עבודות בכיתה."
        }
    ],
    "vocabulary": [
        [
            "Mars Simulator",
            "סביבת סימולציה המדמה משימת רחפן בתנאי מאדים."
        ],
        [
            "Thin Atmosphere",
            "אטמוספירה דלילה — פחות אוויר לפרופלורים לדחוף, ולכן הטיסה רגישה יותר."
        ],
        [
            "Low Gravity",
            "כבידה נמוכה יותר ממאפשרת תנועה “קופצנית” ודורשת בקרה מדויקת."
        ],
        [
            "Communication Latency",
            "עיכוב של 4–20 דקות בתקשורת בין כדור הארץ למאדים."
        ],
        [
            "tello.sleep(seconds);",
            "השהיית פקודות כדי לאפשר ייצוב, מדידה או העברת נתונים."
        ],
        [
            "Paper Code",
            "תכנון קוד בעיפרון לפני הקלדה בטאבלט."
        ],
        [
            "Desktop / Device Share Link",
            "קישור לשיתוף משימה בדפדפן או באפליקציית טאבלט."
        ],
        [
            "Incremental Coding",
            "כתיבה ובדיקה בשלבים קטנים במקום קוד ארוך בהרצה אחת."
        ]
    ],
    "safetyRules": [
        "אין הטסה פיזית במפגש 3; הרחפנים נשארים בארון.",
        "נשארים על WiFi בית ספרי — אין מעבר לרשת Tello כי אין רחפן פיזי.",
        "מריצים במאדים רק אחרי Paper Code ובדיקת takeoff/land.",
        "פקודות תנועה הן באינץ׳; 40 אינץ׳ הם בערך מטר.",
        "לא כותבים את כל המשימה לפני בדיקה ראשונה; בונים בשלבים.",
        "שומרים גרסה לפני ניסוי גדול כדי לא לאבד קוד."
    ],
    "commonDirections": [
        [
            "tello.flyUp(60);",
            "עלייה לגובה בטוח מעל סלעי מאדים."
        ],
        [
            "tello.sleep(2);",
            "ייצוב קצר אחרי שינוי גובה."
        ],
        [
            "tello.moveForward(50);",
            "מעבר לפאנלים הסולאריים."
        ],
        [
            "tello.flyUp(30);",
            "הגעה לגובה 90 אינץ׳ מעל הפאנלים."
        ],
        [
            "tello.flyDown(40);",
            "ירידה לגובה הסייסמוגרף — 50 אינץ׳."
        ],
        [
            "Desktop Share Link",
            "קישור להצגה/עריכה בדפדפן."
        ],
        [
            "Device Share Link",
            "קישור לפתיחה בטאבלט/אפליקציה."
        ]
    ],
    "setupSteps": [
        "טאבלטים טעונים ו־DroneBlocks Code מותקן.",
        "WiFi בית ספרי ו־Login לפני תחילת עבודה.",
        "מקרן עם Mars Simulator וקוד דוגמה.",
        "דפי Paper Code לתכנון מסלול 3D.",
        "לוח עם המרות: 40 אינץ׳ ≈ מטר.",
        "אין רחפנים פיזיים ואין Tello WiFi."
    ],
    "tabletTips": [
        "לפתוח Mars Simulator רק אחרי Login.",
        "לשמור גרסה אחרי כל תחנה: Station1 / Solar / Seismograph.",
        "להשתמש ב־Function Reference לכל פקודת גובה.",
        "לבדוק שהערכים חיוביים ולא 0 או שליליים.",
        "אם הסימולטור קופא — Reset וטעינה מחדש.",
        "ליצור גם Desktop וגם Device Share Link אם אפשר."
    ],
    "lessonFlow": [
        {
            "minutes": "0–8",
            "title": "גשר משיעור 2",
            "teacher": "מחבר בין Box Mission דו־ממדי לבין משימה תלת־ממדית עם גבהים.",
            "students": "מזכירים moveForward/yawRight ו־sleep משיעורים קודמים."
        },
        {
            "minutes": "8–18",
            "title": "NASA JPL ומאדים",
            "teacher": "מסביר Ingenuity, אטמוספירה דלילה, כבידה נמוכה ושיהוי תקשורת.",
            "students": "עונים למה אי אפשר להשתמש בשלט בזמן אמת."
        },
        {
            "minutes": "18–25",
            "title": "ענן וגיבוי",
            "teacher": "משתמש באנלוגיית Roblox/Fortnite כדי להסביר Save Mission ו־Share Link.",
            "students": "מסבירים למה קוד לא שמור הוא סיכון פרויקט."
        },
        {
            "minutes": "25–35",
            "title": "נוהל טכנולוגי",
            "teacher": "מוביל WiFi בית ספרי, Login, DroneBlocks Code ו־Mars Simulator.",
            "students": "פותחים סביבת עבודה ונשארים ברשת בית הספר."
        },
        {
            "minutes": "35–45",
            "title": "פקודות גובה ו־sleep",
            "teacher": "מדגים flyUp, flyDown, sleep ויחידות inches.",
            "students": "כותבים דוגמאות קצרות ומשווים ל־Function Reference."
        },
        {
            "minutes": "45–55",
            "title": "Paper Code",
            "teacher": "מחלק דף מסלול תחנות: המראה, פאנלים, סייסמוגרף, חזרה.",
            "students": "משרטטים גבהים, מרחקים והשהיות לפני הקלדה."
        },
        {
            "minutes": "55–72",
            "title": "Incremental Coding",
            "teacher": "דורש בנייה בשלבים: תחנה 1 ואז פאנלים ורק אחר כך סייסמוגרף.",
            "students": "כותבים, מריצים, מתקנים שורת סינטקס אחת בכל פעם."
        },
        {
            "minutes": "72–82",
            "title": "שמירה ושיתוף",
            "teacher": "מדגים Save Mission, My Missions, Share Desktop/Device.",
            "students": "שומרים Mars_Explorer_Grade7_TeamX ומפיקים קישור."
        },
        {
            "minutes": "82–90",
            "title": "רפלקציה וסגירת ציוד",
            "teacher": "שואל למה sleep עוזר במאדים ומה היה קשה ב־JavaScript.",
            "students": "מגישים קישור/צילום מסך ומחזירים טאבלטים לעגינה."
        }
    ],
    "exercises": [
        {
            "minutes": "8–18",
            "title": "שיהוי תקשורת",
            "prompt": "כתבו למה פקודת ימינה במאדים לא יכולה לעבוד כמו שלט רחוק רגיל.",
            "check": "מוזכר עיכוב 4–20 דקות/אוטונומיה."
        },
        {
            "minutes": "18–25",
            "title": "גיבוי בענן",
            "prompt": "הסבירו למה Share Link הוא חלק מהנדסת קוד ולא רק “הגשה”.",
            "check": "מוזכר שחזור/בדיקת מדריך/גרסאות."
        },
        {
            "minutes": "35–42",
            "title": "פקודות גובה",
            "prompt": "מצאו ב־Function Reference את flyUp, flyDown ו־sleep.",
            "check": "הפקודות מועתקות בסינטקס נכון."
        },
        {
            "minutes": "45–55",
            "title": "Paper Code",
            "prompt": "שרטטו את שלוש התחנות וגבהי 60/90/50 אינץ׳.",
            "check": "השרטוט כולל גבהים והשהיות."
        },
        {
            "minutes": "55–64",
            "title": "תחנה 1",
            "prompt": "כתבו takeoff, flyUp(60), sleep(2) והריצו.",
            "check": "הרחפן מגיע לגובה בטוח בסימולטור."
        },
        {
            "minutes": "64–72",
            "title": "פאנלים וסייסמוגרף",
            "prompt": "הוסיפו moveForward(50), flyUp(30), yawRight(90), moveForward(40), flyDown(40), sleep(3).",
            "check": "הקוד מתקדם בשלבים ולא בהרצה עיוורת."
        },
        {
            "minutes": "72–82",
            "title": "Share Links",
            "prompt": "שמרו Mars_Explorer_Grade7_TeamX והפיקו קישור Desktop/Device.",
            "check": "יש קישור או תיעוד תקלה."
        },
        {
            "minutes": "82–90",
            "title": "כרטיס יציאה",
            "prompt": "פקודת sleep חשובה כי...",
            "check": "התשובה מחברת ייצוב/חיישנים/מניעת סחיפה."
        }
    ],
    "deliverable": "Mars_Explorer_Grade7_TeamX: קוד Mars Simulator תלת־ממדי עם Paper Code, גבהים 60/90/50, sleep בנקודות ייצוב, Save Mission ו־Desktop/Device Share Link.",
    "assessment": [
        "העבודה נשארה בסימולטור בלבד.",
        "הקוד משתמש נכון ב־flyUp/flyDown/sleep.",
        "יש תכנון Paper Code לפני הקלדה מלאה.",
        "המשימה נבנתה בשלבים עם דיבוג הדרגתי.",
        "התלמיד מבין למה מאדים מחייב אוטונומיה ושמירה בענן.",
        "הוגש Share Link בשם הנכון."
    ],
    "debugging": [
        {
            "problem": "ReferenceError: tello is not defined",
            "fix": "לוודא שכל פקודה מתחילה ב־tello. עם שתי אותיות l ונקודה."
        },
        {
            "problem": "הרחפן קופא אחרי המראה",
            "fix": "לבדוק ערכים לא הגיוניים, 0 או שליליים, ולבצע Reset לסימולטור."
        },
        {
            "problem": "flyup או flyforward לא עובדים",
            "fix": "לתקן CamelCase: flyUp / moveForward לפי Function Reference."
        },
        {
            "problem": "שכחו sleep",
            "fix": "להחזיר נקודות ייצוב אחרי שינוי גובה ולפני מעבר תחנה."
        },
        {
            "problem": "Save/Share נכשל",
            "fix": "לוודא WiFi בית ספרי ו־Login; לא לעבור לרשת Tello."
        }
    ],
    "differentiation": {
        "support": [
            "לתת דף Paper Code עם תחנות מסומנות מראש.",
            "לבנות רק תחנה 1 ופאנלים לפני הסייסמוגרף.",
            "לתת שלד קוד עם חוסרי מספרים להשלמה."
        ],
        "extension": [
            "להוסיף Comment לכל תחנה.",
            "לחשב המרת inches לס״מ בטבלת עזר.",
            "ליצור גרסת v2 עם sleep שונה ולהשוות יציבות."
        ]
    },
    "instructorGuide": {
        "prerequisites": "התלמידים מגיעים אחרי שיעור 1 בציר אנכי ושיעור 2 Box Mission דו־ממדי. לבדוק שהם זוכרים takeoff/land, moveForward/yawRight וסינטקס בסיסי.",
        "pedagogy": [
            "שיעור 3 מחבר בין קוד, מדע וחקר: מאדים נותן סיבה אמיתית ל־sleep ולאוטונומיה.",
            "עבודה בענן היא יעד פדגוגי בפני עצמו — ניהול גרסאות ושיתוף הם חלק מתהליך פיתוח.",
            "Incremental Coding חשוב במיוחד בכיתה ז׳ עתודה: לא לתת להם לרוץ ל־15 שורות בלי בדיקה.",
            "להסביר Inches במפורש כדי למנוע פקודות קיצוניות.",
            "לשמור על סימולטור בלבד למרות הפיתוי “רק לבדוק ברחפן”."
        ],
        "facilitationNotes": [
            "להקרין סרטון Ingenuity קצר בלבד.",
            "להשתמש באנלוגיית משחק שלא נשמר כדי להסביר ענן.",
            "לעבור בין זוגות Driver/Navigator ולהחליף תפקידים באמצע.",
            "לאסוף קישורים בפורמט אחיד.",
            "לשבח דיבוג הדרגתי ולא רק תוצר שעבד."
        ],
        "mediaNote": "סרטון JPL/Ingenuity משמש להשראה ולדיון על אוטונומיה ושיהוי תקשורת.",
        "exitTicket": "השתמשנו ב־sleep במאדים כי ___."
    },
    "appWorkflowTitle": "DroneBlocks Code — Mars Explorer ו־Share Links",
    "appWorkflowNote": "מפגש 3 הוא טאבלטים וסימולטור מאדים בלבד. נשארים על WiFi בית ספרי כדי לשמור ולשתף קוד בענן.",
    "appWorkflow": [
        {
            "title": "Login ו־Mars Simulator",
            "detail": "פתחו DroneBlocks Code, התחברו לחשבון ובחרו Mars Simulator."
        },
        {
            "title": "Paper Code",
            "detail": "שרטטו תחנות וגבהים: 60 אינץ׳, 90 אינץ׳, 50 אינץ׳ וחזרה הביתה."
        },
        {
            "title": "Station 1",
            "detail": "כתבו takeoff → flyUp(60) → sleep(2) והריצו בדיקה ראשונה."
        },
        {
            "title": "Solar + Seismograph",
            "detail": "הוסיפו קדימה, flyUp(30), yawRight(90), קדימה, flyDown(40), sleep(3)."
        },
        {
            "title": "Return Home",
            "detail": "הוסיפו yawRight(90), moveForward(80), land ובדקו שהקוד מסתיים בטוח."
        },
        {
            "title": "Save Mission + Share",
            "detail": "שמרו Mars_Explorer_Grade7_TeamX והעתיקו Desktop/Device Share Link."
        }
    ],
    "visualDiagram": {
        "panelTitle": "🪐 Mars Explorer",
        "chip": "Mars Simulator",
        "title": "מסלול תלת־ממדי: פאנלים, סייסמוגרף וחזרה",
        "src": "assets/drone-coding-foundations/lesson3/mars-explorer-3d-route.svg",
        "alt": "תרשים מסלול Mars Explorer עם גבהים 60 90 ו-50 אינץ",
        "caption": "שיעור 3 מחזק תכנון בשלבים: גובה, sleep, תחנה, שמירה ושיתוף."
    },
    "videoResources": [
        {
            "title": "NASA JPL — Ingenuity Mars Helicopter",
            "url": "https://www.youtube.com/watch?v=GhsZUZmAlis",
            "note": "להקרין קטע קצר שמראה את Ingenuity ותנאי מאדים."
        }
    ],
    "screenshotSlides": [
        {
            "title": "Mars Explorer Route",
            "src": "assets/drone-coding-foundations/lesson3/mars-explorer-3d-route.svg",
            "caption": "מפה תלת־ממדית לפני קוד."
        },
        {
            "title": "פותחים DroneBlocks Code",
            "src": "assets/tello-mission-lab/lesson1/open-app.png",
            "caption": "WiFi בית ספרי ו־Login."
        },
        {
            "title": "Mars Simulator",
            "src": "assets/tello-mission-lab/lesson9/mars-exploration-diagram.svg",
            "caption": "סימולטור מאדים בלבד."
        },
        {
            "title": "Save & Share",
            "src": "assets/tello-mission-lab/lesson1/save-share.png",
            "caption": "Mars_Explorer_Grade7_TeamX."
        }
    ],
    "instructorSlides": [
        {
            "title": "Mars Explorer",
            "body": "היום מתכננים משימת חקר תלת־ממדית במאדים ושומרים אותה בענן.",
            "bullets": [
                "Mars Simulator",
                "JavaScript",
                "Share Links"
            ]
        },
        {
            "title": "למה אי אפשר שלט רחוק?",
            "body": "במאדים יש שיהוי תקשורת של דקות. לכן צריך תוכנית אוטונומית מראש.",
            "bullets": [
                "4–20 דקות",
                "JPL",
                "אוטונומיה"
            ]
        },
        {
            "title": "פקודות גובה",
            "body": "flyUp, flyDown ו־sleep מאפשרות שליטה בציר Z וייצוב בין תחנות.",
            "bullets": [
                "flyUp",
                "flyDown",
                "sleep"
            ]
        },
        {
            "title": "Paper Code לפני טאבלט",
            "body": "משרטטים תחנות, גבהים והשהיות לפני שמקלידים.",
            "bullets": [
                "60״",
                "90״",
                "50״"
            ]
        },
        {
            "title": "ענן ושיתוף",
            "body": "Save Mission ו־Share Link הם חלק מתהליך הפיתוח.",
            "bullets": [
                "Desktop Link",
                "Device Link",
                "גרסאות"
            ]
        }
    ]
});


  Object.assign(window.DRONE_CODING_FOUNDATIONS_LESSONS[3], {
    "title": "שיעור 4: לולאות ומשתנים — Fabric Dynamic Scan",
    "subtitle": "Loops, Variables, for/while, scan_distance ו־City Simulator",
    "unit": "יחידה 1 — יסודות רחפן, בטיחות וסימולטור JavaScript",
    "concept": "חשיבה אלגוריתמית: זיהוי תבניות, לולאות for/while ומשתנה scan_distance",
    "story": "צוותי כיתה ז׳ מצטרפים למרכז הלוגיסטי של Fabric, שבו רובוטים ורחפנים סורקים מדפים תלת־ממדיים במסלולים חוזרים. כרטיס הזיכרון של הרחפן מוגבל, ולכן צריך לחשוב כמו “מתכנת עצלן חכם”: פחות שכפול, יותר לוגיקה.",
    "mission": "לשדרג את Box Mission משיעור 2 לקוד JavaScript יעיל: לבנות ריבוע עם לולאת for או while במקום שכפול שורות, להגדיר let scan_distance = 80, להשתמש ב־tello.moveForward(scan_distance), ואז לעבור ל־City Simulator ולהוכיח ששינוי ערך אחד משנה את כל גודל המסלול.",
    "commands": [
        "variable",
        "loop",
        "forward",
        "yaw",
        "comment",
        "land",
        "save_cloud"
    ],
    "blocks": [
        "variable",
        "loop",
        "forward",
        "yaw",
        "comment",
        "land",
        "save_cloud"
    ],
    "workspaceMode": "droneblocks-code",
    "physicalFlightAllowed": false,
    "essentialQuestion": "איך לולאה ומשתנה הופכים קוד ארוך ומסורבל לאלגוריתם קצר, גמיש ובטוח יותר?",
    "successCriteria": [
        "אני מזהה תבנית חוזרת במסלול ריבוע.",
        "אני מסביר/ה את מבנה for: מונה, תנאי עצירה וקידום i++.",
        "אני מסביר/ה מה הסיכון בלולאה אינסופית.",
        "אני יוצר/ת משתנה scan_distance ומשתמש/ת בו בתוך פקודת התנועה.",
        "אני משנה ערך אחד כדי להגדיל את כל המסלול.",
        "אני מוסיף/ה Comment מקצועי שמסביר את הלולאה.",
        "אני שומר/ת גרסאות Fabric_Scan_v1_Loops ו־Fabric_Scan_v2_Variables."
    ],
    "realWorldUses": [
        {
            "icon": "📦",
            "title": "מחסנים אוטונומיים",
            "text": "רובוטים צריכים לבצע מסלולים חוזרים אלפי פעמים בלי קוד מסורבל."
        },
        {
            "icon": "🧠",
            "title": "Pattern Recognition",
            "text": "מהנדסים מזהים פעולה שחוזרת והופכים אותה ללולאה."
        },
        {
            "icon": "💾",
            "title": "חיסכון בזיכרון",
            "text": "פחות שורות קוד מקטינות טעויות ומקלות על תחזוקה."
        },
        {
            "icon": "🏙️",
            "title": "City Simulator",
            "text": "משתנים מאפשרים להתאים מסלול לבניינים/מדפים בגדלים שונים."
        }
    ],
    "vocabulary": [
        [
            "Loop / לולאה",
            "מבנה קוד שחוזר על פעולה מספר פעמים או כל עוד תנאי מתקיים."
        ],
        [
            "for loop",
            "לולאה קומפקטית שבה מונה, תנאי וקידום נמצאים בשורה אחת."
        ],
        [
            "while loop",
            "לולאה שרצה כל עוד תנאי מסוים נכון."
        ],
        [
            "i++",
            "קיצור ל־i = i + 1; קידום המונה בסוף סיבוב."
        ],
        [
            "Infinite Loop",
            "לולאה שלא נעצרת ועלולה להקפיא את הסימולטור/האפליקציה."
        ],
        [
            "Variable / משתנה",
            "תיבה בזיכרון עם שם וערך, למשל let scan_distance = 80."
        ],
        [
            "scan_distance",
            "משתנה המרחק שמגדיר את גודל ריבוע הסריקה."
        ],
        [
            "Pattern Recognition",
            "זיהוי תבנית חוזרת שאפשר להפוך לאלגוריתם."
        ]
    ],
    "safetyRules": [
        "אין הטסה פיזית במפגש 4; זה שיעור הסימולטור האחרון לפני טיסה פיזית.",
        "בודקים לולאות רק בסימולטור Minimal Grid/City.",
        "אסור להריץ לולאה בלי תנאי עצירה וקידום i++.",
        "אם הסימולטור קופא — Force Close/Reset ולא ממשיכים ללחוץ Run.",
        "לא עוברים ל־Tello WiFi; נשארים באינטרנט בית ספרי לשמירה בענן.",
        "ב־City Simulator לא מתכננים טיסה מעל אנשים/כבישים וירטואליים — הרגלי בטיחות מתחילים בקוד."
    ],
    "commonDirections": [
        [
            "let scan_distance = 80;",
            "הגדרת משתנה מרחק בראש הקוד."
        ],
        [
            "for (let i = 0; i < 4; i++)",
            "לולאה מקצועית לארבע צלעות הריבוע."
        ],
        [
            "while (i < 4)",
            "לולאה אינטואיטיבית עם תנאי ריצה."
        ],
        [
            "tello.moveForward(scan_distance);",
            "תנועה לפי ערך המשתנה ולא מספר קשיח."
        ],
        [
            "tello.yawRight(90);",
            "פנייה בפינה של הריבוע."
        ],
        [
            "// comment",
            "הערה שמסבירה למה הלולאה קיימת."
        ]
    ],
    "setupSteps": [
        "טאבלטים טעונים ו־WiFi בית ספרי פעיל.",
        "DroneBlocks Code ו־Minimal Grid מוכנים.",
        "City Simulator מוכן כאתגר מתקדם; Minimal Grid הוא fallback אם City כבד.",
        "דפי טיוטה לשרטוט flowchart.",
        "לכתוב על הלוח: מונה → תנאי → גוף הלולאה → i++.",
        "להכין דוגמאות לשמות גרסה: Fabric_Scan_v1_Loops / v2_Variables."
    ],
    "tabletTips": [
        "להתחיל ב־Minimal Grid לפני City.",
        "להעתיק את Box Mission משיעור 2 ולסמן מה חוזר.",
        "לא להריץ while לפני שבודקים שיש i++.",
        "להשתמש בשם משתנה עקבי: scan_distance בכל מקום.",
        "אם שינוי 80 ל־120 לא משפיע — כנראה נשאר מספר קשיח בקוד.",
        "לשמור גרסה לפני מעבר ל־City Simulator."
    ],
    "lessonFlow": [
        {
            "minutes": "0–8",
            "title": "גשר משיעור 2–3",
            "teacher": "מחבר בין ריבוע כפול, Mars Explorer וקוד שחוזר על עצמו.",
            "students": "מזהים אילו שורות חזרו בריבוע Yaw Box."
        },
        {
            "minutes": "8–18",
            "title": "סיפור Fabric",
            "teacher": "מציג מחסן אוטונומי וכרטיס זיכרון מוגבל.",
            "students": "מסבירים למה שכפול שורות הוא סיכון."
        },
        {
            "minutes": "18–28",
            "title": "אנלוגיית שטיפת כלים",
            "teacher": "מדגים הוראה שחוזרת 10 פעמים מול “כל עוד יש צלחות”.",
            "students": "מנסחים לולאה במילים."
        },
        {
            "minutes": "28–42",
            "title": "for ו־while",
            "teacher": "מציג מונה i, תנאי i < 4, גוף לולאה ו־i++; מזהיר מלולאה אינסופית.",
            "students": "מסמנים את ארבעת חלקי הלולאה בקוד."
        },
        {
            "minutes": "42–55",
            "title": "Minimal Grid — ריבוע בלולאה",
            "teacher": "מלווה כתיבת for/while לריבוע 60 אינץ׳ עם Comment.",
            "students": "מחליפים שורות משוכפלות בלולאה ומריצים."
        },
        {
            "minutes": "55–65",
            "title": "משתנה scan_distance",
            "teacher": "מסביר משתנה כתיבה בזיכרון ומחליף 60 ב־scan_distance.",
            "students": "מגדירים let scan_distance = 80 ומשתמשים בו."
        },
        {
            "minutes": "65–78",
            "title": "City Dynamic Scan",
            "teacher": "מגדיר “מדף רחב יותר” 120 אינץ׳ ובודק שינוי ערך אחד.",
            "students": "עוברים ל־City/Minimal fallback ומוכיחים שינוי דינמי."
        },
        {
            "minutes": "78–85",
            "title": "קוד מצטיין והשוואה",
            "teacher": "מקרין פתרון יעיל ומחשב חיסכון שורות מול שיעור 2.",
            "students": "מסבירים איך הלולאה חסכה קוד."
        },
        {
            "minutes": "85–90",
            "title": "Save/Share וסגירה",
            "teacher": "אוסף קישורים ומכין לקראת שיעור 5 — טיסה פיזית ראשונה.",
            "students": "שומרים v1/v2 ומחזירים טאבלטים לעגינה."
        }
    ],
    "exercises": [
        {
            "minutes": "8–18",
            "title": "מה חוזר?",
            "prompt": "סמנו בריבוע Yaw Box אילו שתי פקודות חוזרות ארבע פעמים.",
            "check": "moveForward + yawRight מסומנות."
        },
        {
            "minutes": "18–28",
            "title": "לולאה במילים",
            "prompt": "כתבו משפט “כל עוד/חזור 4 פעמים...” למשימת מדפים.",
            "check": "יש תנאי או מספר חזרות."
        },
        {
            "minutes": "28–42",
            "title": "אנטומיית for",
            "prompt": "סמנו בקוד את המונה, התנאי, i++ וגוף הלולאה.",
            "check": "כל החלקים מזוהים."
        },
        {
            "minutes": "42–55",
            "title": "ריבוע בלולאה",
            "prompt": "כתבו for שמבצע 4 פעמים moveForward(60) + yawRight(90).",
            "check": "הקוד סוגר ריבוע ונוחת."
        },
        {
            "minutes": "55–65",
            "title": "משתנה מרחק",
            "prompt": "החליפו 60 ב־scan_distance והגדירו let scan_distance = 80.",
            "check": "הפקודה משתמשת במשתנה."
        },
        {
            "minutes": "65–78",
            "title": "אתגר דינמי",
            "prompt": "שנו רק את ערך המשתנה ל־120 והראו שכל המסלול גדל.",
            "check": "אין שינוי בארבע פקודות נפרדות."
        },
        {
            "minutes": "78–85",
            "title": "Comment מקצועי",
            "prompt": "הוסיפו הערת קוד מעל הלולאה שמסבירה את תפקידה.",
            "check": "ההערה ברורה ומועילה."
        },
        {
            "minutes": "85–90",
            "title": "כרטיס יציאה",
            "prompt": "אם אשכח i++ אז...",
            "check": "מוזכרת לולאה אינסופית/קריסה/אי עצירה."
        }
    ],
    "deliverable": "Fabric_Scan_v1_Loops ו־Fabric_Scan_v2_Variables: קוד ריבוע בלולאה, משתנה scan_distance, Comment מקצועי, בדיקת שינוי 80→120 ו־Share Link.",
    "assessment": [
        "הריבוע נכתב בלולאה ולא בשכפול שורות.",
        "מבנה for/while כולל מונה, תנאי וקידום.",
        "scan_distance מוגדר ומשמש בפועל בתנועה.",
        "התלמיד משנה ערך אחד בלבד כדי לשנות מסלול.",
        "יש הבנה של Infinite Loop וסיכון קריסת סימולטור.",
        "הוגשו גרסאות/קישור בענן."
    ],
    "debugging": [
        {
            "problem": "Uncaught SyntaxError / ReferenceError",
            "fix": "לבדוק סוגריים עגולים/מסולסלים, נקודה־פסיק ו־CamelCase."
        },
        {
            "problem": "הסימולטור קופא",
            "fix": "לבדוק אם חסר i++ או תנאי עצירה; לבצע Force Close/Reset."
        },
        {
            "problem": "המשתנה לא עובד",
            "fix": "לוודא אותו שם בדיוק: scan_distance בהגדרה ובשימוש."
        },
        {
            "problem": "שינוי 80 ל־120 לא משנה הכול",
            "fix": "לחפש מספרים קשיחים שנשארו בתוך הלולאה ולהחליף במשתנה."
        },
        {
            "problem": "City Simulator כבד",
            "fix": "לעבור ל־Minimal Grid עם אותו קוד ומשתנה."
        }
    ],
    "differentiation": {
        "support": [
            "לתת שלד for מוכן עם חוסרי מספרים.",
            "להתחיל רק מ־for ולא ללמד while לעומק.",
            "להשתמש בצבעים: מונה/תנאי/גוף/i++."
        ],
        "extension": [
            "להפוך לריבוע לפונקציה flySquare(distance).",
            "לבנות משושה או מתומן עם זווית 360/צלעות.",
            "להשוות while מול for בקריאות ובסיכון שגיאה."
        ]
    },
    "instructorGuide": {
        "prerequisites": "התלמידים מגיעים אחרי Box Mission בשתי אסטרטגיות ושיעור Mars עם שמירה בענן. לבדוק שהם מזהים moveForward + yawRight כתבנית חוזרת.",
        "pedagogy": [
            "זה שיעור אלגוריתמיקה מרכזי: המטרה אינה “עוד ריבוע”, אלא זיהוי תבנית והפיכתה למבנה קוד.",
            "המתכנת העצלן הוא מסגור טוב: פחות עבודה ידנית, יותר חשיבה.",
            "להדגיש ש־Infinite Loop היא תקלה לוגית אמיתית, לא בדיחה.",
            "משתנה הוא הכנה לפונקציות ולפרויקט: שינוי אחד במקום תיקון שורות רבות.",
            "City Simulator מוסיף הקשר, אבל Minimal Grid הוא fallback לגיטימי אם הטאבלטים מתקשים."
        ],
        "facilitationNotes": [
            "להתחיל מזיהוי חזרתיות בקוד של שיעור 2.",
            "לא להעמיס גם for וגם while לכל תלמיד — לבחור בסיס ולהציע השני כהעשרה.",
            "לדרוש Comment מעל הלולאה כדי לחבר קוד להבנה.",
            "להציג פתרון מצטיין ולחשב חיסכון שורות.",
            "לסגור בציפייה לשיעור 5: הקוד יפגוש מציאות פיזית."
        ],
        "mediaNote": "אפשר להקרין סרטון קצר של מחסן רובוטי/Fabric/Amazon Robotics להמחשת חזרתיות מדויקת.",
        "exitTicket": "לולאה חוסכת ___, ומשתנה מאפשר ___."
    },
    "appWorkflowTitle": "DroneBlocks Code — Fabric Dynamic Scan",
    "appWorkflowNote": "מפגש 4 עדיין סימולטור בלבד. זהו שיעור ההכנה האחרון לפני טיסה פיזית: בודקים לוגיקה, לולאות ומשתנים בלי לסכן חומרה.",
    "appWorkflow": [
        {
            "title": "זיהוי תבנית",
            "detail": "פתחו את ריבוע Yaw משיעור 2 וסמנו moveForward + yawRight שחוזרים ארבע פעמים."
        },
        {
            "title": "for / while Loop",
            "detail": "כתבו לולאה שמריצה ארבע צלעות. ודאו שיש תנאי עצירה ו־i++."
        },
        {
            "title": "Comment",
            "detail": "הוסיפו הערה מעל הלולאה שמסבירה שהיא סורקת ארבע פאות מדף."
        },
        {
            "title": "scan_distance",
            "detail": "הגדירו let scan_distance = 80 והחליפו את המספר הקשיח בתוך moveForward."
        },
        {
            "title": "City Dynamic Challenge",
            "detail": "עברו ל־City או Minimal fallback ושנו רק את הערך ל־120 כדי להתאים למדף רחב."
        },
        {
            "title": "Save & Share",
            "detail": "שמרו Fabric_Scan_v1_Loops ו־Fabric_Scan_v2_Variables ושתפו קישור."
        }
    ],
    "visualDiagram": {
        "panelTitle": "📦 Fabric Loop Lab",
        "chip": "Loops & Variables",
        "title": "scan_distance + for loop",
        "src": "assets/drone-coding-foundations/lesson4/fabric-loop-variable-flow.svg",
        "alt": "תרשים זרימה של לולאת for ומשתנה scan_distance לסריקת ריבוע",
        "caption": "במקום לשכפל קוד — מזהים תבנית, משתמשים בלולאה, ומשנים משתנה אחד כדי לשלוט בכל המסלול."
    },
    "videoResources": [
        {
            "title": "Autonomous warehouse robots / Fabric or Amazon Robotics",
            "url": "https://www.youtube.com/results?search_query=autonomous+warehouse+robots+Fabric+Amazon+Robotics",
            "note": "סרטון השראה קצר על רובוטים שחוזרים על נתיבים מדויקים במחסנים."
        }
    ],
    "screenshotSlides": [
        {
            "title": "Fabric Loop Flow",
            "src": "assets/drone-coding-foundations/lesson4/fabric-loop-variable-flow.svg",
            "caption": "מונה, תנאי, גוף הלולאה ו־i++."
        },
        {
            "title": "פותחים DroneBlocks Code",
            "src": "assets/tello-mission-lab/lesson1/open-app.png",
            "caption": "WiFi בית ספרי וגרסאות בענן."
        },
        {
            "title": "City / Minimal Grid",
            "src": "assets/tello-mission-lab/lesson10/city-mapping-blueprint-diagram.svg",
            "caption": "City כאתגר; Minimal fallback אם כבד."
        },
        {
            "title": "Save & Share",
            "src": "assets/tello-mission-lab/lesson1/save-share.png",
            "caption": "Fabric_Scan_v1/v2."
        }
    ],
    "instructorSlides": [
        {
            "title": "המתכנת העצלן החכם",
            "body": "היום מחליפים שכפול שורות בלולאה ומשתנה.",
            "bullets": [
                "Pattern",
                "Loop",
                "Variable"
            ]
        },
        {
            "title": "Fabric ומחסנים אוטונומיים",
            "body": "רובוטים חוזרים על נתיבים מדויקים. קוד מסורבל מגדיל טעויות.",
            "bullets": [
                "סריקה",
                "זיכרון",
                "אמינות"
            ]
        },
        {
            "title": "for מול while",
            "body": "מונה, תנאי עצירה וקידום i++ הם שלושת מנגנוני השליטה.",
            "bullets": [
                "let i=0",
                "i<4",
                "i++"
            ]
        },
        {
            "title": "Infinite Loop",
            "body": "בלי i++ הלולאה לא נעצרת והסימולטור עלול לקפוא.",
            "bullets": [
                "סיכון לוגי",
                "Reset",
                "Debug"
            ]
        },
        {
            "title": "scan_distance",
            "body": "משתנה אחד בראש הקוד משנה את כל גודל המסלול.",
            "bullets": [
                "80",
                "120",
                "שינוי אחד"
            ]
        },
        {
            "title": "City Dynamic Scan",
            "body": "מתאימים את ריבוע הסריקה למדף/בניין בגודל משתנה.",
            "bullets": [
                "City",
                "Fallback",
                "Share Link"
            ]
        }
    ]
});


  Object.assign(window.DRONE_CODING_FOUNDATIONS_LESSONS[4], {
    "title": "שיעור 5: SpaceX Static Fire — המעבר למציאות והטסה פיזית ראשונה",
    "subtitle": "Sim‑to‑Reality Gap, Pre‑Flight Checklist, WiFi Handshake, Telemetry וסוללות",
    "unit": "יחידה 1 — מעבר מסימולטור לטיסה פיזית מבוקרת",
    "concept": "פער סימולציה־מציאות, כיול פיזי ראשון, עבודת צוות ובטיחות רחפן Tello",
    "story": "אחרי ארבעה מפגשי סימולטור, צוותי כיתה ז׳ מגיעים לרגע השיא הראשון: ה־Static Fire של SpaceX בכן השיגור. קוד JavaScript שעבד בסביבה סטרילית פוגש עכשיו רצפה, תאורה, סוללה, זרמי מזגן וחיישני VPS. המטרה אינה “להטיס יפה”, אלא להוכיח שליטה בטוחה ומדידה.",
    "mission": "לבצע Pre‑Flight Check מלא, להתחלק ל־Driver/Navigator/Safety Observer, לטעון קוד קצר מהענן, להתחבר לפי Double Network Handshake לרשת TELLO, להריץ טיסה פיזית קצרה בלבד באזור 1.5×1.5 מטר: takeoff, sleep(5), תנועה קדימה קצרה ובטוחה של 24 אינץ׳ ≈ 60 ס״מ, sleep(2), land. אם המדריך מאשר — להריץ Physical Box קטן עם for loop ו־24 אינץ׳ לצלע, למדוד סטייה ולשמור tello_physical_box_v1.",
    "commands": [
        "safety_check",
        "wifi",
        "takeoff",
        "sleep",
        "forward",
        "sleep",
        "loop",
        "yaw",
        "telemetry",
        "battery",
        "land",
        "share"
    ],
    "blocks": [
        "safety_check",
        "wifi",
        "takeoff",
        "sleep",
        "forward",
        "sleep",
        "loop",
        "yaw",
        "telemetry",
        "battery",
        "land",
        "share"
    ],
    "workspaceMode": "physical-lab",
    "physicalFlightAllowed": true,
    "essentialQuestion": "מה משתנה כאשר קוד JavaScript שעבד בסימולטור מפעיל רחפן פיזי אמיתי?",
    "successCriteria": [
        "אני מבצע/ת Pre‑Flight Checklist לפני כל Run.",
        "אני יודע/ת להסביר Sim‑to‑Reality Gap ולתת לפחות שני גורמים פיזיים.",
        "אני פועל/ת בתפקיד ברור: Driver, Navigator או Safety Observer.",
        "אני מבצע/ת Double Network Handshake בסדר נכון: WiFi בית ספרי → טעינת קוד → TELLO WiFi.",
        "אני משתמש/ת ב־sleep לייצוב פיזי בין פעולות.",
        "אני מודד/ת סטייה בס״מ ומתעד/ת הצעת כיול אחת.",
        "אני מנהל/ת סוללות לפי נוהל שתי קופסאות."
    ],
    "realWorldUses": [
        {
            "icon": "🚀",
            "title": "Static Fire",
            "text": "לפני שיגור אמיתי בודקים מערכות בצורה מוגבלת ומבוקרת."
        },
        {
            "icon": "🧪",
            "title": "Sim‑to‑Reality Gap",
            "text": "סימולטור הוא מודל; בעולם האמיתי יש רוח, תאורה, חיישנים וסוללה."
        },
        {
            "icon": "👥",
            "title": "צוות טיסה",
            "text": "Driver, Navigator ו־Observer מפחיתים סיכון ומגדילים דיוק."
        },
        {
            "icon": "🔋",
            "title": "ניהול משאבים",
            "text": "סוללה חלשה משנה ביצועים ועלולה להפוך טיסה פשוטה למסוכנת."
        }
    ],
    "vocabulary": [
        [
            "Sim‑to‑Reality Gap",
            "פער בין ביצוע מושלם בסימולטור לבין תנאים פיזיים בכיתה."
        ],
        [
            "Calibration / כיול",
            "כוונון עדין של הקוד/הסביבה לפי תוצאות מדידה בפועל."
        ],
        [
            "Pre‑Flight Checklist",
            "רשימת בדיקות חובה לפני המראה פיזית."
        ],
        [
            "Double Network Handshake",
            "סדר חיבור: אינטרנט לשמירה וטעינה, ואז TELLO WiFi לטיסה."
        ],
        [
            "Telemetry",
            "נתוני סטטוס כמו סוללה, חיבור וגובה."
        ],
        [
            "VPS",
            "חיישני ראייה תחתיים שמושפעים מתאורה ורצפה."
        ],
        [
            "Abort",
            "עצירת חירום/נחיתה מיידית כשיש סיכון."
        ],
        [
            "Safe Fly Zone",
            "אזור טיסה סטרילי מסומן שרק הרחפן נמצא בו בזמן Run."
        ]
    ],
    "safetyRules": [
        "משקפי מגן חובה לכל חבר צוות שמתקרב לאזור הטיסה.",
        "שיער ארוך אסוף, מגיני פרופלור מורכבים, סוללה תקינה ורחפן קריר.",
        "רק צוות אחד באוויר ורק בתוך Safe Fly Zone מסומן 1.5×1.5 מטר.",
        "Driver בלבד לוחץ Run/Abort, ורק אחרי הכרזה “צוות X ממריא!” ואישור מדריך.",
        "אם אדם נכנס לאזור הטיסה — Abort/Land מיידי.",
        "סוללה מתחת ל־20% עוברת לקופסה אדומה; אין אחסון סוללות בתוך הרחפן.",
        "בגלל מגבלת המרחב משתמשים ב־24 אינץ׳ ≈ 60 ס״מ לצלע פיזית, לא 60 אינץ׳."
    ],
    "commonDirections": [
        [
            "WiFi בית ספרי",
            "פתיחת אפליקציה, Login וטעינת קוד מהענן."
        ],
        [
            "TELLO-XXXX",
            "רשת הרחפן הפיזי ללא אינטרנט — רק אחרי שהקוד מוכן."
        ],
        [
            "tello.sleep(5);",
            "ריחוף ייצוב לאחר המראה."
        ],
        [
            "tello.moveForward(24);",
            "תנועה פיזית קצרה ובטוחה בתוך אזור 1.5 מטר."
        ],
        [
            "Telemetry",
            "בודקים סוללה/סטטוס לפני Run ואחרי נחיתה."
        ],
        [
            "tello_physical_box_v1",
            "שם שמירת הקוד הפיזי הראשון."
        ]
    ],
    "setupSteps": [
        "לפנות מרכז כיתה ולסמן Safe Fly Zone של 1.5×1.5 מטר.",
        "להכין Tello/Tello EDU לכל צוות עם מגיני פרופלורים.",
        "להכין שתי סוללות לפחות לכל רחפן ועמדות טעינה.",
        "להציב קופסה ירוקה לסוללות מלאות וקופסה אדומה לריקות.",
        "לכבות מאווררים/מזגן חזק ולוודא תאורה טובה לרצפה.",
        "להכין דף Run Log למדידת סטייה בס״מ.",
        "לכתוב על הלוח: 24 אינץ׳ ≈ 60 ס״מ לטיסה פיזית בטוחה."
    ],
    "tabletTips": [
        "לטעון קוד מהענן לפני מעבר ל־TELLO WiFi.",
        "אם האפליקציה מציגה Not Connected — לבדוק שהטאבלט לא חוזר אוטומטית לרשת עם אינטרנט.",
        "לכבות נתונים סלולריים/Smart Network Switch אם הם מנתקים רשת Tello.",
        "לחזור ל־WiFi בית ספרי בסוף כדי לשמור Share Link.",
        "לא להריץ לולאות פיזיות לפני שהן נבדקו בסימולטור.",
        "לתעד סטייה מיד אחרי נחיתה, לפני שינוי קוד."
    ],
    "lessonFlow": [
        {
            "minutes": "0–8",
            "title": "רגע המעבר לפיזי",
            "teacher": "מגדיר שהיום הטיסה הפיזית הראשונה היא בדיקת מערכת, לא מופע.",
            "students": "מזכירים שיעור 4: לולאה ומשתנה שנבדקו בסימולטור."
        },
        {
            "minutes": "8–18",
            "title": "SpaceX Static Fire ו־Sim‑to‑Reality",
            "teacher": "מסביר סימולטור מול רצפה, תאורה, מזגן, סוללה וחיישני VPS.",
            "students": "נותנים דוגמה לפער בין משחק מחשב למגרש אמיתי."
        },
        {
            "minutes": "18–28",
            "title": "תפקידי צוות",
            "teacher": "מחלק Driver/Navigator/Safety Observer ומבהיר שכל חריגה מקרקעת צוות.",
            "students": "מקבלים תפקיד ומקריאים אחריות."
        },
        {
            "minutes": "28–40",
            "title": "Double Network Handshake",
            "teacher": "מוביל WiFi בית ספרי, Login, טעינת קוד, הפעלת רחפן, TELLO WiFi, Connected to Tello.",
            "students": "מבצעים לפי צ׳קליסט ולא מדלגים."
        },
        {
            "minutes": "40–48",
            "title": "Pre‑Flight Check",
            "teacher": "בודק משקפי מגן, שיער, מגינים, סוללה, אזור סטרילי ו־Abort.",
            "students": "מאשרים בקול “פנוי”."
        },
        {
            "minutes": "48–60",
            "title": "Static Fire Hover",
            "teacher": "מאשר צוותים לפי תור להרצת takeoff → sleep(5) → land או forward קצר.",
            "students": "מריצים, צופים בטלמטריה ומתעדים יציבות."
        },
        {
            "minutes": "60–75",
            "title": "Physical Box קטן",
            "teacher": "מאשר רק לצוותים יציבים: for loop עם 24 אינץ׳, sleep ו־yawRight.",
            "students": "מריצים ריבוע קטן ומודדים סטייה בס״מ."
        },
        {
            "minutes": "75–83",
            "title": "כיול ודיון",
            "teacher": "שואל למה סטינו למרות שהקוד נכון ומוביל הצעת שינוי אחת.",
            "students": "רושמים גורם פיזי והצעת כיול."
        },
        {
            "minutes": "83–90",
            "title": "סוללות, שמירה וסגירה",
            "teacher": "אוכף שתי קופסאות, הוצאת סוללות ושמירה בענן.",
            "students": "שומרים tello_physical_box_v1 ומחזירים ציוד."
        }
    ],
    "exercises": [
        {
            "minutes": "8–18",
            "title": "פער סימולציה־מציאות",
            "prompt": "כתבו שני גורמים שיכולים לשנות טיסה פיזית לעומת סימולטור.",
            "check": "מוזכרים רוח/סוללה/תאורה/VPS/רצפה."
        },
        {
            "minutes": "18–28",
            "title": "תפקידי צוות",
            "prompt": "כתבו מי Driver, Navigator ו־Safety Observer ומה כל אחד עושה.",
            "check": "Driver היחיד שמריץ; Observer אחראי בטיחות."
        },
        {
            "minutes": "28–40",
            "title": "Handshake",
            "prompt": "סדרו את שלבי הרשת: בית ספר, Login, טעינת קוד, TELLO WiFi.",
            "check": "הסדר נכון."
        },
        {
            "minutes": "40–48",
            "title": "Pre‑Flight",
            "prompt": "עברו על הצ׳קליסט לפני המראה.",
            "check": "אין Run לפני אישור מדריך."
        },
        {
            "minutes": "48–60",
            "title": "Static Fire",
            "prompt": "הריצו טיסה קצרה: takeoff, sleep, forward 24 אינץ׳, sleep, land.",
            "check": "הרחפן נשאר באזור הסטרילי."
        },
        {
            "minutes": "60–75",
            "title": "Physical Box",
            "prompt": "אם אושר: הריצו ריבוע קטן עם for loop, 24 אינץ׳ ו־sleep בין פעולות.",
            "check": "נמדדה סטייה אחרי נחיתה."
        },
        {
            "minutes": "75–83",
            "title": "Run Log",
            "prompt": "רשמו סטייה בס״מ והצעת כיול אחת.",
            "check": "שינוי אחד בלבד מוצע."
        },
        {
            "minutes": "83–90",
            "title": "סוללות ושיתוף",
            "prompt": "הוציאו סוללה, מיינו לקופסה, שמרו tello_physical_box_v1.",
            "check": "אין סוללות ברחפנים באחסון."
        }
    ],
    "deliverable": "tello_physical_box_v1: קוד טיסה פיזית ראשון, Run Log עם סטייה והצעת כיול, ותיעוד נוהל סוללה/בטיחות.",
    "assessment": [
        "הצוות עמד בכללי בטיחות ללא פשרות.",
        "ה־Double Network Handshake בוצע בסדר נכון.",
        "הקוד הפיזי כולל sleep בין פעולות.",
        "המרחקים מותאמים לאזור 1.5×1.5 מטר.",
        "הצוות מדד סטייה ולא רק אמר “עבד”.",
        "הסוללות הוצאו ומוינו בסיום."
    ],
    "debugging": [
        {
            "problem": "Connected to Tello לא מופיע",
            "fix": "לוודא TELLO WiFi, לכבות Smart Network Switch/Cellular ולחזור לאפליקציה."
        },
        {
            "problem": "נורה אדומה מהבהבת מהר",
            "fix": "להחליף לסוללה מלאה; אם הרחפן חם, לכבות ולקרר כמה דקות."
        },
        {
            "problem": "הרחפן נוטה חזק ומתרסק",
            "fix": "לכבות, לבדוק התאמת פרופלורים מסומנים לזרועות המסומנות."
        },
        {
            "problem": "Drift משמעותי",
            "fix": "להדליק תאורה, להוסיף סימוני רצפה/שטיחון ולכבות זרמי מזגן."
        },
        {
            "problem": "לולאה פיזית לא נעצרת",
            "fix": "Abort, לבדוק i++ ותנאי עצירה בסימולטור לפני ניסיון נוסף."
        }
    ],
    "differentiation": {
        "support": [
            "להסתפק ב־Static Fire Hover בלבד בלי Physical Box.",
            "לתת קוד מוכן ולבקש רק בדיקת סינטקס וצ׳קליסט.",
            "לתת תפקיד Observer לתלמיד שעדיין לא מוכן להריץ."
        ],
        "extension": [
            "להשוות סטייה לפני/אחרי הוספת sleep.",
            "לחשב ממוצע סטייה בין שני Runs.",
            "להציע כיול מהירות/מרחק אחד ולנמק לפי Run Log."
        ]
    },
    "instructorGuide": {
        "prerequisites": "נדרש שהכיתה השלימה ארבעה מפגשי סימולטור, כולל Box Mission ולולאה. אין להריץ פיזית צוות שלא יודע להסביר takeoff/land/Abort ואת תפקידיו.",
        "pedagogy": [
            "מפגש 5 הוא שיעור בטיחות לא פחות משהוא שיעור טכנולוגי.",
            "לא לאפשר “רק עוד ניסיון” אם סוללה/מרחב/תפקידים לא תקינים.",
            "לתקן את בלבול היחידות: בטיסה פיזית באזור 1.5 מטר להשתמש ב־24 אינץ׳ בערך, לא 60 אינץ׳.",
            "המדידה אחרי נחיתה היא לב הלמידה: Sim‑to‑Reality Gap הופך מנתון מופשט לחוויה.",
            "שבחו צוות שמבטל Run בגלל סיכון — זו אחריות הנדסית."
        ],
        "facilitationNotes": [
            "להפעיל צוותים בתור קפדני, שאר הכיתה באזור צפייה.",
            "להכין מראש רחפן דמו לפרופלורים/סוללה.",
            "להכריז בקול: “אם מישהו נכנס לאזור — Land מיד”.",
            "להחזיק סוללות אצל המדריך, לא בכיסי תלמידים.",
            "לסיים 7 דקות לפני סוף שיעור לנוהל סוללות."
        ],
        "mediaNote": "סרטון Ingenuity/Static Fire קצר בלבד; עיקר השיעור הוא פרוטוקול בטיחות והתנסות מדודה.",
        "exitTicket": "הרחפן סטה למרות שהקוד נכון כי ___; בפעם הבאה אכייל ___."
    },
    "appWorkflowTitle": "Physical Lab — SpaceX Static Fire בטוח",
    "appWorkflowNote": "מפגש 5 הוא הטסה פיזית ראשונה. האתר מציג תדריך, תפקידים וצ׳קליסט; את הקוד מריצים ב־DroneBlocks Code רק באזור סטרילי ובאישור מדריך.",
    "appWorkflow": [
        {
            "title": "WiFi בית ספרי וטעינת קוד",
            "detail": "פתחו DroneBlocks Code, התחברו לחשבון וטענו את הקוד לפני מעבר לרשת הרחפן."
        },
        {
            "title": "Pre‑Flight Checklist",
            "detail": "משקפי מגן, שיער אסוף, מגיני פרופלור, סוללה, אזור סטרילי ו־Abort מוכנים."
        },
        {
            "title": "TELLO WiFi",
            "detail": "הדליקו רחפן, התחברו ל־TELLO-XXXX וחזרו לאפליקציה עד Connected to Tello."
        },
        {
            "title": "Static Fire Hover",
            "detail": "הריצו takeoff → sleep(5) → moveForward(24) → sleep(2) → land רק באישור."
        },
        {
            "title": "Physical Box קטן",
            "detail": "רק אם אושר: for loop עם 24 אינץ׳ לצלע, sleep ו־yawRight(90)."
        },
        {
            "title": "Run Log + סוללות",
            "detail": "מדדו סטייה, שמרו tello_physical_box_v1, הוציאו סוללה ומיינו לקופסאות."
        }
    ],
    "visualDiagram": {
        "panelTitle": "🚀 Static Fire Safe Zone",
        "chip": "Physical Lab",
        "title": "אזור טיסה סטרילי ותפקידי צוות",
        "src": "assets/drone-coding-foundations/lesson5/spacex-static-fire-safe-zone.svg",
        "alt": "תרשים אזור טיסה סטרילי עם Driver Navigator Safety Observer וקופסאות סוללות",
        "caption": "הטסה פיזית ראשונה היא בדיקת מערכת מבוקרת: קצרה, מדידה, עם תפקידים ונוהל סוללות."
    },
    "videoResources": [
        {
            "title": "NASA JPL — The First Flight of Ingenuity on Mars",
            "url": "https://www.youtube.com/watch?v=wX-y0M-YwK4",
            "note": "להקרין קצר ולהדגיש כמה בדיקות קדמו לטיסה הפיזית."
        }
    ],
    "screenshotSlides": [
        {
            "title": "Static Fire Safe Zone",
            "src": "assets/drone-coding-foundations/lesson5/spacex-static-fire-safe-zone.svg",
            "caption": "סידור כיתה, צוותים וסוללות."
        },
        {
            "title": "פותחים DroneBlocks Code",
            "src": "assets/tello-mission-lab/lesson1/open-app.png",
            "caption": "קודם אינטרנט וטעינת קוד."
        },
        {
            "title": "ריצת סימולטור לפני פיזי",
            "src": "assets/tello-mission-lab/lesson1/simulator-run.png",
            "caption": "לא מדלגים על בדיקה."
        },
        {
            "title": "Save & Share",
            "src": "assets/tello-mission-lab/lesson1/save-share.png",
            "caption": "tello_physical_box_v1."
        }
    ],
    "instructorSlides": [
        {
            "title": "SpaceX Static Fire",
            "body": "היום עוברים מהסימולטור לרחפן פיזי — רק כבדיקת מערכת קצרה ומבוקרת.",
            "bullets": [
                "Physical first flight",
                "Safety first",
                "Measured run"
            ]
        },
        {
            "title": "Sim‑to‑Reality Gap",
            "body": "רוח, סוללה, תאורה ורצפה משנים את מה שהקוד עושה בפועל.",
            "bullets": [
                "VPS",
                "Battery",
                "Drift"
            ]
        },
        {
            "title": "תפקידי צוות",
            "body": "Driver מריץ, Navigator בודק קוד, Safety Observer שומר קשר עין ואחראי Abort.",
            "bullets": [
                "Driver",
                "Navigator",
                "Observer"
            ]
        },
        {
            "title": "Double Network Handshake",
            "body": "WiFi בית ספרי לטעינה ושמירה, TELLO WiFi להרצה פיזית.",
            "bullets": [
                "Login",
                "Load code",
                "TELLO-XXXX"
            ]
        },
        {
            "title": "המרחק הבטוח",
            "body": "באזור 1.5 מטר משתמשים ב־24 אינץ׳ בערך לצלע, לא 60 אינץ׳.",
            "bullets": [
                "24 inches",
                "sleep",
                "land"
            ]
        },
        {
            "title": "סוללות וסגירה",
            "body": "סוללות לא נשארות ברחפנים. ירוק=מלא, אדום=ריק/מתחת 20%.",
            "bullets": [
                "Telemetry",
                "Two boxes",
                "No battery storage"
            ]
        }
    ]
});


  Object.assign(window.DRONE_CODING_FOUNDATIONS_LESSONS[5], {
    "title": "שיעור 6: מעבר מבלוקים לקוד טקסטואלי — Skydio JavaScript Bridge",
    "subtitle": "Text‑based programming, Object.Action(argument), Function Reference ו־Box Mission בסימולטור",
    "unit": "יחידה 2 — מעבר מממשק חזותי ל־JavaScript מקצועי",
    "concept": "תרגום לוגיקה מבלוקים לקוד טקסטואלי ב־DroneBlocks Code",
    "story": "אחרי הטיסה הפיזית הראשונה, כיתה ז׳ עולה שלב לצוות פיתוח האוטונומיה של Skydio. רחפנים מקצועיים שממפים ועוקפים מכשולים אינם מסתפקים בבלוקים צבעוניים: הם נשענים על קוד טקסטואלי מהיר, מדויק וקריא. היום מתרגמים חשיבה חזותית ל־JavaScript מקצועי.",
    "mission": "לפתוח New Script ב־DroneBlocks Code, להשתמש ב־Function Reference, לכתוב הערות //, ולתרגם Box Mission של חממת העתיד לשתי גרסאות JavaScript בסימולטור: Strafing Box עם sleep בין פעולות, ו־Yaw Box שבו הרחפן טס קדימה ופונה 90° בכל פינה. בסיום שומרים Grade7_Meeting6_BoxMission_TeamX ומשתפים קישור.",
    "commands": [
        "code_editor",
        "comment",
        "takeoff",
        "sleep",
        "forward",
        "right",
        "back",
        "left",
        "yaw",
        "land",
        "save_cloud"
    ],
    "blocks": [
        "code_editor",
        "comment",
        "takeoff",
        "sleep",
        "forward",
        "right",
        "back",
        "left",
        "yaw",
        "land",
        "save_cloud"
    ],
    "workspaceMode": "droneblocks-code",
    "physicalFlightAllowed": false,
    "essentialQuestion": "איך מתרגמים לוגיקה של בלוקים לקוד JavaScript מדויק שכל תו בו משפיע על הרצת הרחפן?",
    "successCriteria": [
        "אני מסביר/ה הבדל בין Block‑based לבין Text‑based programming.",
        "אני פותח/ת New Script ומאתר/ת Function Reference.",
        "אני כותב/ת Comment עם // שמסביר את הקוד.",
        "אני מזהה את המבנה tello.action(argument);.",
        "אני משתמש/ת בסוגריים, נקודה־פסיק ו־CamelCase מדויק.",
        "אני בונה Box Mission בסימולטור עם sleep בין תנועות.",
        "אני שומר/ת Grade7_Meeting6_BoxMission_TeamX ומשתף/ת קישור."
    ],
    "realWorldUses": [
        {
            "icon": "🤖",
            "title": "Skydio Autonomy",
            "text": "רחפנים אוטונומיים מנתחים סביבה ומקבלים החלטות בעזרת קוד מהיר ומדויק."
        },
        {
            "icon": "💻",
            "title": "קוד טקסטואלי בהייטק",
            "text": "מערכות מורכבות נכתבות בקוד קריא, ניתן לבדיקה ולשיתוף."
        },
        {
            "icon": "🌱",
            "title": "חממות חכמות",
            "text": "רחפן יכול לסרוק חממה במסלול מתוכנן כדי לזהות בעיות בצמחים."
        },
        {
            "icon": "🧭",
            "title": "Logic Architect",
            "text": "נווט מתכנן לוגיקה; נהג מקליד ומריץ — גם בסימולטור."
        }
    ],
    "vocabulary": [
        [
            "Block‑based Programming",
            "תכנות חזותי בגרירת בלוקים; טוב ללוגיקה ראשונית."
        ],
        [
            "Text‑based Programming",
            "כתיבת קוד אמיתי שבו כל תו חשוב."
        ],
        [
            "Object‑Oriented Syntax",
            "מבנה שבו פונים לאובייקט tello ומפעילים עליו פעולה."
        ],
        [
            "tello.action(argument);",
            "תבנית פקודה: אובייקט, נקודה, פעולה, פרמטר ונקודה־פסיק."
        ],
        [
            "Comment //",
            "הערת קוד שהמחשב מתעלם ממנה והיא מיועדת למהנדסים."
        ],
        [
            "Function Reference",
            "ספריית פקודות שמונעת ניחוש ושגיאות כתיב."
        ],
        [
            "SyntaxError",
            "שגיאת תחביר שמונעת מהקוד לרוץ."
        ],
        [
            "CamelCase",
            "כתיבה כמו moveForward או yawRight עם אות גדולה באמצע."
        ]
    ],
    "safetyRules": [
        "אין הטסה פיזית במפגש 6 — למרות שהייתה טיסה בשיעור 5, היום חוזרים לסימולטור.",
        "נשארים על WiFi בית ספרי לצורך שמירה ושיתוף.",
        "לא מריצים קוד לפני שהנווט הקריא אותו שורה־שורה.",
        "כל פקודת תנועה כוללת sleep אחריה כדי למנוע עומס פקודות והרגלי טיסה מסוכנים.",
        "אם הסימולטור קופא, לא ממשיכים ללחוץ Run — סוגרים, מתקנים, ומריצים מחדש.",
        "לא עוברים ל־TELLO WiFi בשיעור זה."
    ],
    "commonDirections": [
        [
            "New Script",
            "פתיחת דף קוד חדש ב־DroneBlocks Code."
        ],
        [
            "// comment",
            "שורה שמסבירה למה הקוד קיים."
        ],
        [
            "tello.moveForward(60);",
            "קדימה 60 אינץ׳ בסימולטור."
        ],
        [
            "tello.moveRight(60);",
            "ימינה 60 אינץ׳ — Strafing."
        ],
        [
            "tello.yawRight(90);",
            "פנייה סביב ציר הרחפן — Yaw Box."
        ],
        [
            "tello.sleep(3);",
            "השהייה בין פקודות כדי לא להעמיס על הרצף."
        ]
    ],
    "setupSteps": [
        "טאבלטים טעונים ו־WiFi בית ספרי.",
        "DroneBlocks Code פתוח על New Script.",
        "מקרן עם תבנית tello.action(argument);.",
        "Function Reference זמין להצגה.",
        "דף תכנון לזוגות Driver/Logic Architect.",
        "סביבת Minimal Grid, City כבונוס/הדגמה."
    ],
    "tabletTips": [
        "להתחיל ב־New Script נקי ולא לערוך בטעות קוד משיעור 5.",
        "לכתוב Comment בראש הקוד עם שם המשימה והצוות.",
        "להעתיק פקודות מ־Function Reference במקום לנחש.",
        "להשתמש ב־yawRight לפי API הקורס; אם האפליקציה מציגה turnRight, לבדוק במילון הפקודות המקומי.",
        "לשמור לפני מעבר בין Strafing ל־Yaw.",
        "אם Share נכשל — לבדוק WiFi בית ספרי."
    ],
    "lessonFlow": [
        {
            "minutes": "0–8",
            "title": "גשר משיעור 5",
            "teacher": "מזכיר את הטיסה הפיזית ואת חשיבות ה־sleep והדיוק. היום חוזרים לסימולטור כדי לחזק קוד טקסטואלי.",
            "students": "משתפים שגיאת סינטקס/סטייה אחת שחוו."
        },
        {
            "minutes": "8–18",
            "title": "Skydio וקוד אמיתי",
            "teacher": "מציג רחפנים אוטונומיים ושואל למה מערכות מקצועיות צריכות קוד טקסטואלי.",
            "students": "מזהים יתרונות של קוד: מהירות, קריאות, תחזוקה."
        },
        {
            "minutes": "18–28",
            "title": "סינטקס והעוזר הרובוטי",
            "teacher": "מסביר Case Sensitivity, סוגריים, נקודה־פסיק ו־SyntaxError דרך אנלוגיה.",
            "students": "מזהים שגיאות בקוד דוגמה."
        },
        {
            "minutes": "28–40",
            "title": "DroneBlocks Code ו־Function Reference",
            "teacher": "מראה Hamburger Menu, New Script, Comments ו־Function Reference.",
            "students": "פותחים סקריפט חדש ומוסיפים Comment ראשון."
        },
        {
            "minutes": "40–50",
            "title": "תבנית פקודה",
            "teacher": "כותב tello.moveForward(60); ומפרק Object.Action(argument);.",
            "students": "מסמנים tello, action, argument ו־semicolon."
        },
        {
            "minutes": "50–65",
            "title": "Strafing Box עם sleep",
            "teacher": "מלווה כתיבת ריבוע חממה: Forward/Right/Backward/Left עם sleep.",
            "students": "מריצים בסימולטור Minimal Grid."
        },
        {
            "minutes": "65–78",
            "title": "Yaw Box Challenge",
            "teacher": "מנחה גרסה עם moveForward ו־yawRight(90), כולל sleep בין פעולות.",
            "students": "בודקים כיוון מצלמה וסופרים שורות."
        },
        {
            "minutes": "78–85",
            "title": "דיון אלגוריתמי",
            "teacher": "שואל מה היה קשה במעבר מבלוקים לקוד ומה יתרון Yaw לסריקה.",
            "students": "מנסחים תשובה על סינטקס ומצלמה."
        },
        {
            "minutes": "85–90",
            "title": "Save Script + Share",
            "teacher": "אוסף קישורים ושומר אחידות בשם קובץ.",
            "students": "שומרים Grade7_Meeting6_BoxMission_TeamX ומגישים."
        }
    ],
    "exercises": [
        {
            "minutes": "8–18",
            "title": "למה לא רק בלוקים?",
            "prompt": "כתבו יתרון אחד של קוד טקסטואלי במערכת רחפן מקצועית.",
            "check": "מוזכר דיוק/מהירות/תחזוקה/מורכבות."
        },
        {
            "minutes": "18–28",
            "title": "מצא את השגיאה",
            "prompt": "תקנו tello.takeoff ו־tello.moveforward(60);.",
            "check": "נוספו סוגריים, semicolon ו־moveForward."
        },
        {
            "minutes": "28–40",
            "title": "New Script + Comment",
            "prompt": "פתחו סקריפט חדש וכתבו // זהו קוד הטיסה הראשון שלי ב-JavaScript.",
            "check": "יש הערת קוד תקינה."
        },
        {
            "minutes": "40–50",
            "title": "פירוק פקודה",
            "prompt": "פרקו tello.moveRight(60); לרכיבי הפקודה.",
            "check": "Object/action/argument/semicolon מזוהים."
        },
        {
            "minutes": "50–65",
            "title": "Strafing Box",
            "prompt": "כתבו ריבוע עם Forward, Right, Backward, Left ו־sleep בין תנועות.",
            "check": "הרצף מסתיים ב־land."
        },
        {
            "minutes": "65–78",
            "title": "Yaw Box",
            "prompt": "כתבו ריבוע שבו הרחפן טס קדימה ופונה yawRight(90) בכל פינה.",
            "check": "יש ארבע פניות וכיוון האף חוזר."
        },
        {
            "minutes": "78–85",
            "title": "השוואת שיטות",
            "prompt": "איזו שיטה עדיפה לרחפן עם מצלמה קדמית ולמה?",
            "check": "מוזכר כיוון מצלמה ובטיחות."
        },
        {
            "minutes": "85–90",
            "title": "Share Script",
            "prompt": "שמרו Grade7_Meeting6_BoxMission_TeamX והפיקו Share Link.",
            "check": "יש קישור/תיעוד תקלה."
        }
    ],
    "deliverable": "Grade7_Meeting6_BoxMission_TeamX: New Script עם Comment, Strafing Box ו/או Yaw Box בסימולטור, sleep בין פעולות ו־Share Link.",
    "assessment": [
        "התלמיד מבדיל בין בלוקים לקוד טקסטואלי.",
        "הקוד עומד בתבנית tello.action(argument);.",
        "יש שימוש ב־Function Reference לתיקון שגיאות.",
        "הריבוע כולל sleep ו־land.",
        "ההשוואה בין Strafing ל־Yaw מנומקת.",
        "נוצר Share Link בשם מוסכם."
    ],
    "debugging": [
        {
            "problem": "Syntax Error",
            "fix": "לבדוק Case Sensitivity, סוגריים, נקודה־פסיק וגרשיים."
        },
        {
            "problem": "moveforward לא עובד",
            "fix": "לתקן ל־moveForward לפי CamelCase."
        },
        {
            "problem": "האפליקציה קופאת",
            "fix": "לבדוק שאין לולאה אינסופית ושיש sleep בין פעולות; Force Close אם צריך."
        },
        {
            "problem": "yaw לא עובד באפליקציה",
            "fix": "לבדוק Function Reference: בחלק מהגרסאות הפקודה עשויה להופיע כ־yawRight או turnRight; להשתמש בשם שמופיע באפליקציה."
        },
        {
            "problem": "Share Link לא עובד",
            "fix": "לחזור ל־WiFi בית ספרי ולוודא Login."
        }
    ],
    "differentiation": {
        "support": [
            "לתת שלד קוד עם שורות sleep מוכנות.",
            "לעבוד בזוג Logic Architect/Developer.",
            "להסתפק ב־Strafing Box אחד לפני Yaw."
        ],
        "extension": [
            "להוסיף Comments לכל שלב.",
            "להשוות מספר שורות מול שיעור 2/4.",
            "להכין גרסה עם פונקציה כהכנה לשיעור 8."
        ]
    },
    "instructorGuide": {
        "prerequisites": "התלמידים מגיעים אחרי טיסה פיזית ראשונה, אבל שיעור 6 חוזר במכוון לסימולטור כדי לחזק יסודות קוד טקסטואלי. להזכיר שחוזרים ל־WiFi בית ספרי ולא לרשת Tello.",
        "pedagogy": [
            "שיעור 6 מחדד את המעבר לתכנות מקצועי גם אם שיעורים 1–4 כבר השתמשו ב־JavaScript; עכשיו עושים זאת במודע כתרגום מבלוקים/לוגיקה לקוד.",
            "האתגר אינו חדש גיאומטרית — היתרון הוא הבנת הסינטקס וקריאות הקוד.",
            "השתמשו בשגיאות מכוונות כדי להפוך SyntaxError לאירוע למידה ולא תסכול.",
            "Function Reference הוא הרגל מקצועי: מתכנתים טובים בודקים תיעוד.",
            "אין צורך בטיסה פיזית בשיעור זה; אחרי שיעור 5 חשוב להחזיר שליטה קוגניטיבית לפני המשך פיזי."
        ],
        "facilitationNotes": [
            "להקרין סרטון Skydio קצר או רק תמונת השראה אם אין זמן.",
            "להדגים New Script ו־Comment לפני כתיבה עצמאית.",
            "להבהיר שאם האפליקציה משתמשת בשם פקודה אחר ל־Yaw, הולכים לפי Function Reference.",
            "לאסוף Share Links בפורמט אחיד.",
            "לשבח תלמידים שמזהים שגיאות סינטקס בעצמם."
        ],
        "mediaNote": "סרטון Skydio/Autonomy הוא השראה קצרה בלבד; הלב הוא תרגום לוגיקה לקוד טקסטואלי.",
        "exitTicket": "בלוקים עוזרים להבין ___, אבל JavaScript דורש ___."
    },
    "appWorkflowTitle": "DroneBlocks Code — Skydio JavaScript Bridge",
    "appWorkflowNote": "מפגש 6 מתקיים בסימולטור בלבד. האתר הוא תדריך; את הקוד כותבים ב־DroneBlocks Code בטאבלט ושומרים בענן.",
    "appWorkflow": [
        {
            "title": "New Script",
            "detail": "פתחו DroneBlocks Code על WiFi בית ספרי, Login, Hamburger Menu → New Script."
        },
        {
            "title": "Comment ראשון",
            "detail": "כתבו // עם שם המשימה ושם הצוות כדי לתעד את הקוד."
        },
        {
            "title": "Function Reference",
            "detail": "מצאו takeoff, moveForward, moveRight, moveBackward, moveLeft, yawRight/turnRight, sleep ו־land."
        },
        {
            "title": "Strafing Box",
            "detail": "כתבו ריבוע Forward/Right/Backward/Left עם sleep(3) בין תנועות."
        },
        {
            "title": "Yaw Box",
            "detail": "כתבו גרסה עם moveForward + yawRight(90) בכל פינה ושמרו על כיוון מצלמה."
        },
        {
            "title": "Save & Share",
            "detail": "שמרו Grade7_Meeting6_BoxMission_TeamX והגישו Device/Desktop Share Link."
        }
    ],
    "visualDiagram": {
        "panelTitle": "🤖 Skydio Code Bridge",
        "chip": "JavaScript",
        "title": "מבלוקים לקוד טקסטואלי",
        "src": "assets/drone-coding-foundations/lesson6/skydio-text-code-bridge.svg",
        "alt": "תרשים מעבר מבלוקים ל-JavaScript עם תבנית tello action argument",
        "caption": "בלוקים מלמדים לוגיקה; JavaScript דורש דיוק של כל תו ושימוש ב־Function Reference."
    },
    "videoResources": [
        {
            "title": "Skydio 2 Autonomy — search suggestion",
            "url": "https://www.youtube.com/results?search_query=Skydio+2+Autonomy+How+Autonomous+Drones+Think",
            "note": "חיפוש מוצע לסרטון קצר על רחפנים אוטונומיים מקצועיים."
        }
    ],
    "screenshotSlides": [
        {
            "title": "Skydio Code Bridge",
            "src": "assets/drone-coding-foundations/lesson6/skydio-text-code-bridge.svg",
            "caption": "תרגום לוגיקה חזותית לקוד מקצועי."
        },
        {
            "title": "פותחים DroneBlocks Code",
            "src": "assets/tello-mission-lab/lesson1/open-app.png",
            "caption": "New Script ו־Function Reference."
        },
        {
            "title": "Box Mission בסימולטור",
            "src": "assets/drone-coding-foundations/lesson2/solar-box-strafing-vs-yaw.svg",
            "caption": "Strafing מול Yaw."
        },
        {
            "title": "Save & Share",
            "src": "assets/tello-mission-lab/lesson1/save-share.png",
            "caption": "Grade7_Meeting6_BoxMission_TeamX."
        }
    ],
    "instructorSlides": [
        {
            "title": "Skydio Autonomy",
            "body": "רחפנים מקצועיים צריכים קוד טקסטואלי מדויק ומהיר.",
            "bullets": [
                "Text code",
                "Autonomy",
                "JavaScript"
            ]
        },
        {
            "title": "העוזר הרובוטי",
            "body": "המחשב לא מבין רמזים: כל אות, סוגריים ונקודה־פסיק חשובים.",
            "bullets": [
                "Case",
                "()",
                ";"
            ]
        },
        {
            "title": "New Script + Function Reference",
            "body": "פותחים סקריפט חדש ומשתמשים בתיעוד הפקודות במקום לנחש.",
            "bullets": [
                "Hamburger Menu",
                "New Script",
                "Reference"
            ]
        },
        {
            "title": "Object.Action(argument)",
            "body": "tello הוא האובייקט, הפעולה היא הפונקציה, והמספר הוא הארגומנט.",
            "bullets": [
                "tello",
                "moveForward",
                "60"
            ]
        },
        {
            "title": "Box Mission טקסטואלי",
            "body": "מתרגמים ריבוע מוכר לקוד JavaScript עם sleep בין פעולות.",
            "bullets": [
                "Strafing",
                "Yaw",
                "sleep"
            ]
        },
        {
            "title": "שיתוף וסיכום",
            "body": "שומרים את הסקריפט ומשתפים קישור לבדיקה.",
            "bullets": [
                "Save Script",
                "Share Link",
                "Debug"
            ]
        }
    ]
});

  window.getDroneCodingFoundationsLesson = function (value) {
    const id = Number(value || 1);
    return window.DRONE_CODING_FOUNDATIONS_LESSONS.find(lesson => lesson.id === id) || window.DRONE_CODING_FOUNDATIONS_LESSONS[0];
  };
})();
