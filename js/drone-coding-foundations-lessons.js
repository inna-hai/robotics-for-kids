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


  Object.assign(window.DRONE_CODING_FOUNDATIONS_LESSONS[6], {
    "title": "שיעור 7: SkySpecs Tower Scan — לולאות for ו־while לסריקה גיאומטרית",
    "subtitle": "JavaScript loops, מונה i, תנאי עצירה, i++, משושה ומתומן בסימולטור City",
    "unit": "יחידה 3 — לולאות, פונקציות ותנאים",
    "concept": "לולאות for ו־while ב־JavaScript ככלי לקוד קצר, מדויק וניתן לדיבוג",
    "story": "אחרי שיעור 6, שבו תרגמנו Box Mission לקוד טקסטואלי, צוותי כיתה ז׳ מצטרפים למשימת SkySpecs באזור התעשייה של עיר העתיד. במקום להקליד שוב ושוב תנועה ופנייה סביב מגדלים גיאומטריים, הם מתכננים לולאה שמבצעת סריקה היקפית של משושה ומתומן כמו מהנדסי תוכנה אמיתיים.",
    "mission": "לכתוב ב־DroneBlocks Code על הטאבלט קוד JavaScript לסריקת מגדל משושה בסימולטור City: takeoff, ניווט למתחם, לולאת for עם 6 איטרציות, moveForward(50), yawRight(60), sleep(2), חזרה ונחיתה. לאחר מכן לשדרג למתומן עם 8 איטרציות וזווית מחושבת של 45°, ולבונוס להשתמש במשתנה side_length.",
    "commands": [
        "code_editor",
        "comment",
        "takeoff",
        "forward",
        "yaw",
        "sleep",
        "loop",
        "variable",
        "land",
        "save_cloud"
    ],
    "blocks": [
        "code_editor",
        "comment",
        "takeoff",
        "forward",
        "yaw",
        "sleep",
        "loop",
        "variable",
        "land",
        "save_cloud"
    ],
    "workspaceMode": "droneblocks-code",
    "physicalFlightAllowed": false,
    "essentialQuestion": "איך לולאה אחת ב־JavaScript יכולה להחליף קוד חוזר ולשמור על מסלול גיאומטרי מדויק בסימולטור?",
    "successCriteria": [
        "אני מסביר/ה את שלושת חלקי לולאת for: אתחול, תנאי עצירה וקידום מונה.",
        "אני מבחין/ה בין for למצב שבו while מתאים יותר.",
        "אני כותב/ת for (var i = 0; i < 6; i++) עם נקודה־פסיק וסוגריים מסולסלים תקינים.",
        "אני מחשב/ת זווית Yaw לפי 360 חלקי מספר הצלעות.",
        "אני מוסיף/ה tello.sleep(2); אחרי פנייה כדי לשמור על יציבות בסימולטור.",
        "אני מזהה ומתקן סיכון של Infinite Loop לפני הרצה.",
        "אני שומר/ת Hexagon_Simulation_TeamX או Share Link למדריך."
    ],
    "realWorldUses": [
        {
            "icon": "🌬️",
            "title": "SkySpecs וסריקת טורבינות",
            "text": "רחפנים אוטונומיים סורקים טורבינות ומבנים תעשייתיים במסלולים חוזרים ושיטתיים."
        },
        {
            "icon": "🔁",
            "title": "DRY — לא חוזרים על עצמנו",
            "text": "לולאה מחליפה העתקה ידנית של פקודות ומקטינה שגיאות אנוש."
        },
        {
            "icon": "📐",
            "title": "גיאומטריה כקוד",
            "text": "360 מעלות חלקי מספר הצלעות נותן את זווית הפנייה הדרושה כדי לסגור צורה."
        },
        {
            "icon": "🧊",
            "title": "סימולטור סטרילי",
            "text": "בודקים לולאות ומניעת קיפאון באפליקציה לפני שמפעילים חומרה פיזית."
        }
    ],
    "vocabulary": [
        [
            "Loop / לולאה",
            "מבנה קוד שמריץ אותן פקודות שוב ושוב לפי ספירה או תנאי."
        ],
        [
            "for",
            "לולאת ספירה כשידוע מראש כמה חזרות צריך לבצע — למשל 6 צלעות במשושה."
        ],
        [
            "while",
            "לולאת תנאי שרצה כל עוד תנאי מסוים מתקיים; חייבים לוודא שהתנאי יסתיים."
        ],
        [
            "Iterator / מונה i",
            "משתנה קטן שסופר את מספר האיטרציות של הלולאה."
        ],
        [
            "Initialization",
            "אתחול המונה בתחילת הלולאה, למשל var i = 0."
        ],
        [
            "Stop Condition",
            "תנאי העצירה, למשל i < 6."
        ],
        [
            "Increment / i++",
            "קידום המונה בסוף כל סיבוב; שקול ל־i = i + 1."
        ],
        [
            "Infinite Loop",
            "לולאה שלא מסתיימת ועלולה להקפיא את האפליקציה."
        ],
        [
            "Yaw Angle",
            "זווית סבסוב הרחפן סביב עצמו; בצורות רגולריות: 360 חלקי מספר הצלעות."
        ],
        [
            "side_length",
            "משתנה שמחזיק את אורך הצלע ומאפשר לשנות גודל צורה בשורה אחת."
        ]
    ],
    "safetyRules": [
        "מפגש 7 הוא סימולטור City בלבד — אין מעבר ל־TELLO WiFi ואין הטסה פיזית.",
        "מריצים לולאות רק אחרי בדיקת Navigator: אתחול, תנאי עצירה, i++ וסוגריים מסולסלים.",
        "לא משתמשים ב־while בלי תנאי עצירה ברור ועדכון משתנה בתוך הלולאה.",
        "אם האפליקציה קופאת, מפסיקים ללחוץ Run, מבצעים Force Close, חוזרים לקוד השמור ומתקנים לפני הרצה נוספת.",
        "מוסיפים sleep(2) אחרי כל yaw כדי למנוע עומס פקודות ותנועה מעוותת.",
        "כל קוד טיסה חייב להסתיים ב־tello.land(); גם בסימולטור."
    ],
    "commonDirections": [
        [
            "for (var i = 0; i < 6; i++)",
            "לולאת ספירה למשושה: 6 איטרציות."
        ],
        [
            "for (var i = 0; i < 8; i++)",
            "לולאת ספירה למתומן: 8 איטרציות."
        ],
        [
            "tello.moveForward(50);",
            "צלע משושה בסימולטור City."
        ],
        [
            "tello.yawRight(60);",
            "פנייה חיצונית למשושה: 360÷6."
        ],
        [
            "tello.yawRight(45);",
            "פנייה חיצונית למתומן: 360÷8."
        ],
        [
            "tello.sleep(2);",
            "השהיית ייצוב בין פנייה לתנועה הבאה."
        ],
        [
            "var side_length = 80;",
            "בונוס: משתנה דינמי לאורך הצלע."
        ]
    ],
    "setupSteps": [
        "טאבלטים טעונים, עבודה לרוחב ו־WiFi בית ספרי פעיל.",
        "DroneBlocks Code פתוח ו־Cloud Sign-In הושלם.",
        "פותחים New Script בשם Hexagon_Simulation_TeamX.",
        "Function Reference פתוח לבדיקת שמות פקודות.",
        "City Simulator מוכן להרצה; Minimal Grid כגיבוי אם City לא נטען.",
        "לוח כיתה מוכן לפירוק for ולנוסחת 360÷מספר הצלעות."
    ],
    "tabletTips": [
        "להקליד קודם את שלד ה־for ורק אחר כך את פקודות הטיסה בתוך הסוגריים המסולסלים.",
        "לבדוק ששני הסימנים בתוך סוגרי ה־for הם נקודה־פסיק ; ולא פסיקים.",
        "להכניס את moveForward, yawRight ו־sleep בתוך הלולאה — לא בטעות מחוץ לה.",
        "להריץ קודם משושה קצר בלי moveForward(100) אם צריך לבדוק רק את הצורה.",
        "לשמור גרסה לפני מעבר ממשושה למתומן.",
        "אם משנים side_length, לא משנים גם את הזווית אלא אם מספר הצלעות השתנה."
    ],
    "lessonFlow": [
        {
            "minutes": "0–7",
            "title": "בדיקת תנאי קדם משיעור 6",
            "teacher": "מחבר ל־Skydio JavaScript Bridge: בשיעור הקודם כתבנו Box Mission בקוד טקסטואלי. היום מזהים שהריבוע היה דפוס חוזר ומשדרגים ללולאות.",
            "students": "פותחים טאבלט ומשתפים דוגמה אחת לשורת קוד שחזרה על עצמה."
        },
        {
            "minutes": "7–15",
            "title": "סיפור מסגרת — SkySpecs",
            "teacher": "מציג משימת סריקת טורבינות ומגדלים גיאומטריים בעיר העתיד. אפשר להקרין סרטון קצר או להשתמש בתמונת השראה.",
            "students": "עונים: למה לא נקליד 200 פקודות ידנית?"
        },
        {
            "minutes": "15–25",
            "title": "for מול while באנלוגיית קורנפלקס",
            "teacher": "מסביר: for כשמספר החזרות ידוע מראש; while כשבודקים תנאי. מדגיש סיכון לולאה אינסופית.",
            "students": "מסווגים דוגמאות: 6 צלעות = for; כל עוד סוללה מעל ערך = while תאורטי בלבד."
        },
        {
            "minutes": "25–35",
            "title": "פירוק סינטקס על הלוח",
            "teacher": "כותב for (var i = 0; i < 6; i++) { ... } ומסמן אתחול, תנאי עצירה וקידום. מדגיש שסינטקס אינו המלצה אלא דרישה מבנית.",
            "students": "מעתיקים שלד לולאה ומסמנים ; { } i++."
        },
        {
            "minutes": "35–43",
            "title": "הנדסת מרחב — סוד ה־360",
            "teacher": "מצייר משושה ומתומן ומחשב 360÷6=60, 360÷8=45. מסביר שזו פנייה חיצונית של הרחפן.",
            "students": "מחשבים בעצמם זווית לצורה נוספת כבונוס."
        },
        {
            "minutes": "43–55",
            "title": "תרגיל מונחה — שלד משושה",
            "teacher": "מדגים קוד takeoff, for, moveForward(50), yawRight(60), sleep(2), land בסימולטור.",
            "students": "מקלידים Hexagon_Simulation_TeamX ומריצים בדיקה ראשונה."
        },
        {
            "minutes": "55–68",
            "title": "אתגר 1 — מגדל המשושה",
            "teacher": "מלווה זוגות Driver/Navigator: הנהג מקליד, הנווט בודק תנאי לולאה וסימני פיסוק לפני Run.",
            "students": "מוסיפים moveForward(100) לפני הלולאה וחזרה למנחת, מריצים ומתעדים תוצאה."
        },
        {
            "minutes": "68–80",
            "title": "אתגר 2 — מגדל מתומן",
            "teacher": "לא מגלה מיד את הזווית; מכוון לנוסחת 360÷מספר הצלעות ולשינוי 6→8, 50→40, 60→45.",
            "students": "משדרגים למתומן ושומרים גרסה חדשה."
        },
        {
            "minutes": "80–86",
            "title": "בונוס — side_length",
            "teacher": "מציג משתנה אורך צלע ככפתור שליטה בגודל המסלול ומחבר לשיעור 4.",
            "students": "צוותים מהירים מוסיפים var side_length ומשנים גודל בשורה אחת."
        },
        {
            "minutes": "86–90",
            "title": "Save, Share וסיכום",
            "teacher": "אוסף Share Links ושואל כמה שורות נחסכו בזכות לולאה.",
            "students": "שומרים, משתפים ומשלימים כרטיס יציאה על לולאות ודיוק סינטקס."
        }
    ],
    "exercises": [
        {
            "minutes": "7–15",
            "title": "בעיה תעשייתית אמיתית",
            "prompt": "כתבו במשפט למה סריקת טורבינה/מגדל דורשת פקודות חוזרות ומדויקות.",
            "check": "מוזכרת חזרתיות, בטיחות או יעילות."
        },
        {
            "minutes": "15–25",
            "title": "for או while?",
            "prompt": "סווגו: 6 צלעות במשושה, 8 צלעות במתומן, כל עוד הקערה לא ריקה.",
            "check": "צורות רגולריות מסווגות כ־for; תנאי פתוח כ־while."
        },
        {
            "minutes": "25–35",
            "title": "פירוק לולאה",
            "prompt": "סמנו בשלד for את האתחול, תנאי העצירה וה־i++.",
            "check": "שלושת החלקים מזוהים נכון."
        },
        {
            "minutes": "35–43",
            "title": "חישוב Yaw",
            "prompt": "חשבו את זווית הפנייה למשושה ולמתומן בעזרת 360÷מספר הצלעות.",
            "check": "60° ו־45° מופיעים עם הסבר."
        },
        {
            "minutes": "43–55",
            "title": "שלד משושה",
            "prompt": "כתבו והריצו לולאת for שמבצעת 6 פעמים forward 50, yaw 60 ו־sleep 2.",
            "check": "הפקודות בתוך הסוגריים המסולסלים והקוד מסתיים ב־land."
        },
        {
            "minutes": "55–68",
            "title": "משימת מגדל המשושה",
            "prompt": "הוסיפו ניווט למתחם וחזרה למנחת: moveForward(100) לפני הלולאה ו־moveBackward(100) אחריה.",
            "check": "יש סדר בטוח: takeoff → ניווט → loop → חזרה → land."
        },
        {
            "minutes": "68–80",
            "title": "שדרוג למתומן",
            "prompt": "עדכנו את הקוד ל־8 צלעות באורך 40 אינץ׳ וחשבו את הזווית לבד.",
            "check": "i < 8, moveForward(40), yawRight(45)."
        },
        {
            "minutes": "80–86",
            "title": "משושה דינמי",
            "prompt": "הוסיפו var side_length = 80; והשתמשו בו בתוך moveForward.",
            "check": "שינוי גודל מתבצע בשורה אחת בלבד."
        },
        {
            "minutes": "86–90",
            "title": "כרטיס יציאה",
            "prompt": "השלימו: לולאה חוסכת שגיאות כי ___. Infinite Loop מסוכן כי ___.",
            "check": "התשובה מחברת קוד קצר, תנאי עצירה וקיפאון אפליקציה."
        }
    ],
    "deliverable": "Hexagon_Simulation_TeamX: קוד JavaScript בסימולטור City עם לולאת for למשושה, גרסת מתומן או בונוס side_length, תיעוד דיבוג קצר ו־Share Link למדריך.",
    "assessment": [
        "שלד ה־for כתוב בסינטקס תקין עם ; ו־{}.",
        "המשושה משתמש ב־6 איטרציות, 50 אינץ׳ ו־60°.",
        "המתומן משתמש ב־8 איטרציות, 40 אינץ׳ ו־45° או שהתלמיד יודע להסביר את החישוב.",
        "יש sleep(2) בתוך הלולאה אחרי yaw.",
        "התלמיד מזהה סיכון Infinite Loop ומתקן תנאי/מונה לפני הרצה.",
        "הקוד נשמר בשם מוסכם ונשלח Share Link."
    ],
    "debugging": [
        {
            "problem": "Syntax Error בשורת for",
            "fix": "לבדוק שהמבנה הוא for (var i = 0; i < 6; i++) עם שני ;, סוגריים עגולים וסוגריים מסולסלים."
        },
        {
            "problem": "האפליקציה קופאת בהרצה",
            "fix": "לחשוד בלולאה אינסופית: חסר i++, תנאי לא נכון או while בלי עדכון משתנה. לבצע Force Close ולתקן לפני Run נוסף."
        },
        {
            "problem": "המשושה לא נסגר או נראה מעוות",
            "fix": "לוודא yawRight(60), מספר איטרציות 6 ו־sleep(2) אחרי כל פנייה."
        },
        {
            "problem": "המתומן פונה יותר מדי או מעט מדי",
            "fix": "לחשב מחדש 360÷8=45 ולא להעתיק 60 מהמשושה."
        },
        {
            "problem": "רק פקודה אחת חוזרת בלולאה",
            "fix": "לבדוק שכל שלוש הפקודות moveForward, yawRight ו־sleep נמצאות בין { } של הלולאה."
        },
        {
            "problem": "Share Link נכשל",
            "fix": "לחזור ל־WiFi בית ספרי ולוודא Cloud Sign-In לפני יצירת קישור."
        }
    ],
    "differentiation": {
        "support": [
            "לתת שלד for עם חורים: מספר חזרות, מרחק וזווית.",
            "להתחיל במשושה ללא ניווט למתחם ורק אחר כך להוסיף moveForward(100).",
            "להשתמש בכרטיס Driver/Navigator: הנווט מקריא ; { } i++ לפני כל Run.",
            "לתת טבלת 360÷צלעות מוכנה לתלמידים שמתקשים בגיאומטריה."
        ],
        "extension": [
            "להוסיף משתנים sides, side_length ו־turn_angle = 360 / sides.",
            "לכתוב פונקציה scanPolygon(sides, side_length) כהכנה לשיעור 8.",
            "להשוות מספר שורות בין קוד ידני למשושה לבין קוד עם לולאה.",
            "לכתוב דוגמת while בטוחה שמדגימה מונה ותנאי עצירה, בלי להריץ לולאה פתוחה."
        ]
    },
    "instructorGuide": {
        "prerequisites": "שיעור 7 נשען ישירות על שיעור 6: התלמידים כבר פתחו New Script, השתמשו ב־Function Reference וכתבו Box Mission בקוד טקסטואלי. עכשיו הופכים את הדפוס החוזר ללולאה אלגוריתמית ומחברים לגיאומטריה.",
        "pedagogy": [
            "המטרה אינה רק ‘ללמד for’; המטרה היא לגרום לתלמיד לזהות חזרתיות ולהחליף אותה במבנה קוד אמין.",
            "להציג while כמושג חשוב אך להיזהר מהרצה לא מבוקרת; המשימה המרכזית משתמשת ב־for כי מספר הצלעות ידוע מראש.",
            "להדגיש שדיוק הנדסי הוא המפתח להצלחת המשימה: נקודה־פסיק חסרה או i++ חסר משנים את כל התוצאה.",
            "לחבר מתמטיקה לתכנות: 360÷מספר הצלעות הוא לא נוסחה מנותקת אלא זווית ה־Yaw שמחזירה את הרחפן למסלול.",
            "להשאיר את השיעור בסימולטור בלבד כדי לאפשר ניסוי בלולאות, דיבוג וקיפאון אפליקציה ללא סיכון לחומרה."
        ],
        "facilitationNotes": [
            "אם מקרינים סרטון SkySpecs, להגביל ל־3–5 דקות ולשאול שאלה אחת על חזרתיות לפני מעבר לקוד.",
            "בשלב הלוח להשתמש בצבעים: אתחול, תנאי, קידום, גוף הלולאה.",
            "לא לגלות מיד את זווית המתומן; לתת לצוותים להגיע ל־45 בעזרת 360÷8.",
            "כשזוג נתקע, לא לתקן עבורם את כל הקוד — לבקש מהנווט להקריא רק את שורת ה־for ואת הסוגריים המסולסלים.",
            "לשבח במיוחד צוותים שמזהים שה־sleep הוא חלק מהדיוק ולא ‘המתנה מיותרת’."
        ],
        "mediaNote": "הקישור ל־SkySpecs הוא מקור השראה חיצוני בלבד. אין צורך להטמיע וידאו בסליידים אם אין ודאות זמינות; אפשר להשתמש בקישור חיפוש/פתיחה למדריך.",
        "exitTicket": "לולאת for מתאימה למשושה כי ___. לולאה אינסופית מסוכנת כי ___."
    },
    "appWorkflowTitle": "DroneBlocks Code — SkySpecs City Loop Scan",
    "appWorkflowNote": "מפגש 7 מתקיים כולו בטאבלט ובסימולטור City. אין חיבור לרחפן פיזי. האתר מציג את המשימה, הסליידים והמדריך; את הקוד כותבים ומריצים ב־DroneBlocks Code.",
    "appWorkflow": [
        {
            "title": "Cloud Sign-In ו־New Script",
            "detail": "התחברו ל־WiFi בית ספרי, פתחו DroneBlocks Code, התחברו לחשבון ופתחו פרויקט בשם Hexagon_Simulation_TeamX."
        },
        {
            "title": "בניית שלד for",
            "detail": "כתבו for (var i = 0; i < 6; i++) { } ובדקו אתחול, תנאי עצירה, i++ וסוגריים מסולסלים."
        },
        {
            "title": "משושה בסימולטור City",
            "detail": "בתוך הלולאה כתבו moveForward(50), yawRight(60), sleep(2). הוסיפו takeoff ו־land."
        },
        {
            "title": "אתגר מתומן",
            "detail": "שדרגו ל־i < 8, moveForward(40) וחשבו לבד את yawRight(45) בעזרת 360÷8."
        },
        {
            "title": "בונוס משתנים",
            "detail": "הגדירו var side_length = 80; והשתמשו בו במקום מספר קבוע כדי לשנות את גודל המשושה בשורה אחת."
        },
        {
            "title": "Save & Share",
            "detail": "שמרו גרסה, הפיקו Share/Generate Link ושלחו למדריך. אם השיתוף נכשל — בדקו WiFi בית ספרי ו־Login."
        }
    ],
    "visualDiagram": {
        "panelTitle": "🔁 SkySpecs Loop Scan",
        "chip": "City Simulator",
        "title": "סריקה גיאומטרית בלולאה",
        "src": "assets/drone-coding-foundations/lesson7/skyspecs-hexagon-octagon-scan.svg",
        "alt": "תרשים סריקת משושה ומתומן באמצעות לולאות JavaScript וזוויות yaw",
        "caption": "הרחפן חוזר על אותו דפוס: צלע, פנייה, sleep. במשושה הלולאה רצה 6 פעמים עם 60°, ובמתומן 8 פעמים עם 45°."
    },
    "videoResources": [
        {
            "title": "SkySpecs Autonomous Wind Turbine Inspection",
            "url": "https://www.youtube.com/watch?v=D_Z96N_gP_k",
            "note": "סרטון השראה קצר לפתיחת שיעור; אם הקישור לא זמין, לחפש SkySpecs Autonomous Wind Turbine Inspection."
        },
        {
            "title": "Search fallback: SkySpecs autonomous drone inspection",
            "url": "https://www.youtube.com/results?search_query=SkySpecs+Autonomous+Wind+Turbine+Inspection",
            "note": "חלופה בטוחה אם הסרטון הישיר חסום ברשת בית הספר."
        }
    ],
    "screenshotSlides": [
        {
            "title": "SkySpecs Loop Scan",
            "src": "assets/drone-coding-foundations/lesson7/skyspecs-hexagon-octagon-scan.svg",
            "caption": "משושה: 6×60°. מתומן: 8×45°. אותו דפוס חוזר בלולאה."
        },
        {
            "title": "פותחים DroneBlocks Code",
            "src": "assets/tello-mission-lab/lesson1/open-app.png",
            "caption": "WiFi בית ספרי, Login ו־New Script."
        },
        {
            "title": "City Simulator / Minimal Grid",
            "src": "assets/tello-mission-lab/lesson1/simulator-run.png",
            "caption": "מריצים בסימולטור בלבד — אין TELLO WiFi בשיעור 7."
        },
        {
            "title": "Save & Share",
            "src": "assets/tello-mission-lab/lesson1/save-share.png",
            "caption": "Hexagon_Simulation_TeamX או גרסת Octagon."
        }
    ],
    "instructorSlides": [
        {
            "title": "SkySpecs Tower Scan",
            "body": "המשימה: סריקת מגדלים גיאומטריים בעיר העתיד במינימום שורות קוד.",
            "bullets": [
                "City Simulator",
                "Hexagon",
                "Octagon"
            ]
        },
        {
            "title": "למה לולאה?",
            "body": "קוד שחוזר על עצמו מזמין שגיאות. לולאה הופכת דפוס חוזר לתוכנית קצרה וקריאה.",
            "bullets": [
                "DRY",
                "Repeat pattern",
                "Less errors"
            ]
        },
        {
            "title": "for מול while",
            "body": "for מתאים כשמספר החזרות ידוע; while בודק תנאי ועלול להפוך לאינסופי אם לא מקדמים משתנה.",
            "bullets": [
                "var i = 0",
                "i < 6",
                "i++"
            ]
        },
        {
            "title": "סוד ה־360°",
            "body": "כדי לסגור צורה רגולרית: 360 חלקי מספר הצלעות = זווית ה־Yaw בכל פינה.",
            "bullets": [
                "6 → 60°",
                "8 → 45°",
                "Yaw Right"
            ]
        },
        {
            "title": "משימת המשושה",
            "body": "בתוך הלולאה: moveForward(50), yawRight(60), sleep(2). ה־sleep הוא חלק מהדיוק ההנדסי.",
            "bullets": [
                "50 inches",
                "60°",
                "sleep(2)"
            ]
        },
        {
            "title": "שדרוג ובונוס",
            "body": "מתומן דורש 8 איטרציות וזווית 45°. צוותים מהירים מוסיפים side_length כמשתנה דינמי.",
            "bullets": [
                "i < 8",
                "45°",
                "side_length"
            ]
        },
        {
            "title": "דיבוג בטוח",
            "body": "אם האפליקציה קופאת — חושדים בלולאה אינסופית, סוגרים, מתקנים תנאי/מונה ורק אז מריצים שוב.",
            "bullets": [
                "No physical flight",
                "Force Close",
                "Check i++"
            ]
        }
    ]
}
);


  Object.assign(window.DRONE_CODING_FOUNDATIONS_LESSONS[7], {
    "title": "שיעור 8: Zipline Modular Flight Engine — פונקציות ופרמטרים ב־JavaScript",
    "subtitle": "Functions, Parameters, Arguments, Code Reusability ו־Sim‑to‑Reality Calibration",
    "unit": "יחידה 3 — לולאות, פונקציות ותנאים",
    "concept": "פונקציות ופרמטרים ב־JavaScript לבניית קוד מודולרי, דינמי ובטוח לשימוש חוזר",
    "story": "אחרי שיעור 7, שבו זיהינו דפוס חוזר והפכנו אותו ללולאה, כיתה ז׳ מצטרפת למחלקת הפיתוח של Zipline — רחפני משלוחים רפואיים אוטונומיים. האתגר: בתי חולים נמצאים במרחקים ובגבהים שונים, ולכן לא כותבים קוד חדש לכל יעד. בונים מנוע טיסה מודולרי: פונקציה אחת שמקבלת פרמטרים ומשנה את התנהגות הרחפן לפי היעד.",
    "mission": "לכתוב ב־DroneBlocks Code פונקציה מודולרית עם פרמטרים, לבדוק אותה תחילה בסימולטור City באמצעות inspectBuilding(height, distance), ואז — רק באישור מדריך ובאזור 3×3 מטר סטרילי — לבצע כיול פיזי קצר עם flyRoute(dist, alt). באילוץ הדינמי משנים רק את ה־Argument בקריאת הפונקציה, ולא נוגעים בגוף הפונקציה.",
    "commands": [
        "code_editor",
        "function",
        "variable",
        "takeoff",
        "flyUp",
        "forward",
        "right",
        "back",
        "left",
        "sleep",
        "land",
        "battery",
        "wifi",
        "abort",
        "save_cloud"
    ],
    "blocks": [
        "code_editor",
        "function",
        "variable",
        "takeoff",
        "flyUp",
        "forward",
        "right",
        "back",
        "left",
        "sleep",
        "land",
        "battery",
        "wifi",
        "abort",
        "save_cloud"
    ],
    "workspaceMode": "physical-lab",
    "physicalFlightAllowed": true,
    "essentialQuestion": "איך פונקציה עם פרמטרים מאפשרת לשנות משימת טיסה בלי לשכתב את גוף הקוד?",
    "successCriteria": [
        "אני מסביר/ה מהי Function ומה ההבדל בינה לבין Loop.",
        "אני מבחין/ה בין Parameter בהגדרת הפונקציה לבין Argument בקריאה לפונקציה.",
        "אני כותב/ת function flyDelivery(distance) או flyRoute(dist, alt) בסינטקס JavaScript תקין.",
        "אני קורא/ת לאותה פונקציה פעמיים עם ערכים שונים ומסביר/ה מה משתנה בפועל.",
        "אני משתמש/ת ב־Function Reference כדי למנוע שגיאות CamelCase וסינטקס.",
        "אני מריץ/ה קודם בסימולטור ורק אחר כך פיזית באישור מדריך.",
        "באילוץ הדינמי אני משנה רק את ה־Argument ולא את גוף הפונקציה.",
        "אני שומר/ת G7_Meeting8_Functions_TeamName ומשתף/ת קישור."
    ],
    "realWorldUses": [
        {
            "icon": "🩺",
            "title": "Zipline Medical Delivery",
            "text": "רחפני משלוחים רפואיים צריכים לטוס ליעדים רבים עם אותו מנוע קוד וערכים משתנים."
        },
        {
            "icon": "🧩",
            "title": "קוד מודולרי",
            "text": "פונקציה אורזת לוגיקה מורכבת תחת שם אחד שאפשר לקרוא לו שוב ושוב."
        },
        {
            "icon": "🎚️",
            "title": "פרמטרים כידיות כיול",
            "text": "distance ו־alt מאפשרים לשנות יעד בלי לגעת בכל שורות התנועה."
        },
        {
            "icon": "🛫",
            "title": "Sim‑to‑Reality",
            "text": "בודקים בסימולטור, מכיילים פיזית, ומתעדים פערים של רצפה, תאורה וסוללה."
        }
    ],
    "vocabulary": [
        [
            "Function / פונקציה",
            "תת־תוכנית עם שם שמקבצת כמה פקודות וניתנת לשימוש חוזר."
        ],
        [
            "Definition / הגדרה",
            "המקום שבו כותבים מה הפונקציה עושה: function flyDelivery(distance) { ... }."
        ],
        [
            "Calling / קריאה",
            "הפעלת הפונקציה בשם שלה, למשל flyDelivery(50);."
        ],
        [
            "Parameter / פרמטר",
            "שם משתנה שמופיע בהגדרת הפונקציה ומקבל ערך מבחוץ, למשל distance."
        ],
        [
            "Argument / ארגומנט",
            "הערך בפועל שנשלח בזמן הקריאה, למשל 50 או 80."
        ],
        [
            "Code Reusability",
            "שימוש חוזר באותו קוד במקום העתקה ידנית."
        ],
        [
            "Local Scope",
            "ערך פנימי של פונקציה, למשל dist, שלא חייב להיות קיים מחוץ לה."
        ],
        [
            "Sim‑to‑Reality Calibration",
            "השוואת התנהגות בסימולטור להתנהגות פיזית ותיקון פרמטרים בהתאם."
        ],
        [
            "VPS Drift",
            "סטיית רחפן פיזי כאשר חיישני המיקום מתקשים לקרוא רצפה אחידה או מבריקה."
        ],
        [
            "Abort",
            "עצירת חירום/נחיתה מיידית כאשר יש סטייה או כניסה לאזור הטיסה."
        ]
    ],
    "safetyRules": [
        "שיעור 8 מתחיל בסימולטור City. לא מוציאים רחפנים לפני שכל צוות עבר בדיקת קוד ותפקידים.",
        "טיסה פיזית מותרת רק באישור מדריך, עם מגיני פרופלורים, משקפי מגן, שיער אסוף ואזור 3×3 מטר ריק מאדם.",
        "לפני כל הרצה פיזית מכריזים בקול: רחפנים באוויר.",
        "מרחקים פיזיים נמדדים לפי הזירה האמיתית. 90 אינץ׳ מותר רק אם נשאר מרווח בטוח בתוך ה־3×3 מטר; אחרת מקטינים ל־60–70 אינץ׳.",
        "Driver מחזיק בטאבלט ומוכן ל־Abort; Navigator בודק סינטקס ופרמטרים; Safety Observer שומר קשר עין ואזור סטרילי.",
        "חובה tello.sleep(2) או tello.sleep(3) בין תנועות פיזיות כדי לא להציף פקודות.",
        "לא נוגעים בגוף הפונקציה בזמן אילוץ דינמי — משנים רק Argument בקריאה לאחר בדיקת מדריך.",
        "בסיום מוציאים סוללות מהרחפן ומחזירים לפי נוהל שתי הקופסאות."
    ],
    "commonDirections": [
        [
            "function flyDelivery(distance)",
            "הגדרת פונקציה עם פרמטר מרחק אחד."
        ],
        [
            "flyDelivery(50);",
            "קריאה לפונקציה עם Argument של 50 אינץ׳."
        ],
        [
            "function inspectBuilding(height, distance)",
            "פונקציית סימולטור עם שני פרמטרים: גובה ומרחק."
        ],
        [
            "function flyRoute(dist, alt)",
            "פונקציית כיול פיזי קצרה עם מרחק וגובה."
        ],
        [
            "tello.flyUp(alt);",
            "עלייה לגובה שמגיע מפרמטר."
        ],
        [
            "tello.moveForward(dist);",
            "תנועה קדימה לפי מרחק שמגיע מפרמטר."
        ],
        [
            "tello.sleep(2);",
            "השהיית ייצוב חובה בין תנועות."
        ],
        [
            "Abort / Land",
            "עצירת משימה אם הרחפן סוטה או אדם נכנס לאזור."
        ]
    ],
    "setupSteps": [
        "טאבלטים טעונים ו־DroneBlocks Code מותקן.",
        "WiFi בית ספרי ו־Cloud Sign‑In לשלב הסימולטור והשמירה.",
        "City Simulator מוכן; Minimal Grid כגיבוי.",
        "רחפני Tello/Tello EDU תקינים עם מגיני פרופלורים וסוללות ממוספרות.",
        "אזור טיסה סטרילי 3×3 מטר מסומן בסרט צבעוני; 3 תחנות מסומנות בקונוסים/כיסאות.",
        "משקפי מגן, תפקידי Driver/Navigator/Safety Observer ונוהל שתי קופסאות לסוללות.",
        "בדיקת מדריך לפני מעבר מ־WiFi בית ספרי ל־TELLO‑XXXX."
    ],
    "tabletTips": [
        "להגדיר את הפונקציה לפני הקוד הראשי שקורא לה.",
        "לא לשים tello.takeoff() בתוך פונקציית המסלול אם קוראים לה כמה פעמים — אחרת מנסים להמריא שוב באוויר.",
        "לסמן בצבע או בהערה את ההבדל בין Parameter: distance לבין Argument: 50.",
        "להעתיק שמות פקודות מ־Function Reference ולא לנחש CamelCase.",
        "לשמור גרסת סימולטור לפני מעבר לגרסה פיזית.",
        "בפיזי: לשנות רק את המספר בקריאת הפונקציה, להריץ קצר ולמדוד סטייה.",
        "אם Share נכשל אחרי טיסה פיזית, לחזור ל־WiFi בית ספרי לפני Generate Link."
    ],
    "lessonFlow": [
        {
            "minutes": "0–8",
            "title": "בדיקת תנאי קדם משיעור 7",
            "teacher": "מחבר ללולאות: בשיעור 7 קיצרנו דפוס חוזר. היום אורזים לוגיקה שלמה בשם אחד ומשנים אותה בעזרת פרמטרים.",
            "students": "פותחים טאבלטים ומשיבים: מה ההבדל בין חזרה על פעולה לבין שימוש חוזר במבנה קוד?"
        },
        {
            "minutes": "8–16",
            "title": "סיפור Zipline",
            "teacher": "מציג אתגר משלוחי ציוד רפואי ליעדים שונים ומדגיש למה קוד נפרד לכל יעד יוצר ‘מפלצת קוד’. מקרין סרטון קצר אם זמין.",
            "students": "מזהים אילו ערכים משתנים בין יעד ליעד: מרחק, גובה, תחנה."
        },
        {
            "minutes": "16–25",
            "title": "פונקציה ופרמטר באנלוגיית המתכון",
            "teacher": "מסביר makePizza(topping, size), ואז ממפה ל־flyDelivery(distance) ו־flyRoute(dist, alt).",
            "students": "נותנים דוגמת פונקציה יומיומית עם פרמטרים."
        },
        {
            "minutes": "25–38",
            "title": "סינטקס JavaScript על הלוח",
            "teacher": "כותב function flyDelivery(distance) { ... } ומפריד Definition, Parameter, Body, Calling ו־Argument.",
            "students": "מעתיקים שלד ומסמנים סוגריים, שם פונקציה ופרמטר."
        },
        {
            "minutes": "38–50",
            "title": "תרגיל מונחה בסימולטור",
            "teacher": "מלווה כתיבת flyDelivery(distance) עם moveForward/right/back/left ו־sleep בין פעולות.",
            "students": "מריצים flyDelivery(50) ואז flyDelivery(80) בסימולטור ומסבירים מה השתנה."
        },
        {
            "minutes": "50–60",
            "title": "City Challenge — inspectBuilding",
            "teacher": "מציג בניין נמוך ובניין גבוה: inspectBuilding(height, distance).",
            "students": "בונים גרסת סימולטור עם שני פרמטרים ושתי קריאות שונות."
        },
        {
            "minutes": "60–68",
            "title": "מעבר פיזי מבוקר",
            "teacher": "עוצר כיתה לצ׳קליסט: אזור 3×3, משקפי מגן, מגינים, סוללה, תפקידים, Abort. מאשר רק קודים שעברו סימולטור.",
            "students": "מתחלקים ל־Driver/Navigator/Safety Observer ומודדים תחנות."
        },
        {
            "minutes": "68–80",
            "title": "Zipline Physical Calibration",
            "teacher": "מאשר הרצה קצרה של flyRoute(dist, alt) עם מרחקים בטוחים לפי הזירה. מדגיש sleep ו־Abort.",
            "students": "מריצים פיזית צוות־צוות, מודדים סטייה ומתעדים Run Log."
        },
        {
            "minutes": "80–86",
            "title": "אילוץ דינמי",
            "teacher": "מזיז תחנה ומכריז שינוי יעד. החוק: לא נוגעים בגוף הפונקציה, רק ב־Argument.",
            "students": "משנים flyRoute(50,60) ל־flyRoute(ערך_חדש,60) לאחר בדיקת מדריך."
        },
        {
            "minutes": "86–90",
            "title": "Save, Share ותחזוקה",
            "teacher": "מחזיר את כולם ל־WiFi בית ספרי, אוסף קישורים ומנהל נוהל שתי קופסאות לסוללות.",
            "students": "שומרים G7_Meeting8_Functions_TeamName, משתפים ומסדרים ציוד."
        }
    ],
    "exercises": [
        {
            "minutes": "8–16",
            "title": "מה משתנה בין משלוחים?",
            "prompt": "רשמו שני ערכים שיכולים להשתנות בין בית חולים אחד לאחר.",
            "check": "מופיעים מרחק/גובה/תחנה/זמן."
        },
        {
            "minutes": "16–25",
            "title": "מתכון עם פרמטרים",
            "prompt": "כתבו פונקציה דמיונית כמו makePizza(topping, size) וציינו Parameter ו־Argument.",
            "check": "יש הבחנה בין שם הקלט לערך שנשלח."
        },
        {
            "minutes": "25–38",
            "title": "פירוק פונקציה",
            "prompt": "סמנו בשלד function flyDelivery(distance) את שם הפונקציה, הפרמטר וגוף הפונקציה.",
            "check": "הסוגריים המסולסלים כוללים רק את גוף הפונקציה."
        },
        {
            "minutes": "38–50",
            "title": "flyDelivery בסימולטור",
            "prompt": "כתבו פונקציה שמבצעת ריבוע לפי distance וקראו לה עם 50 ואז 80.",
            "check": "אותו גוף פונקציה עובד עם שני Arguments."
        },
        {
            "minutes": "50–60",
            "title": "inspectBuilding(height, distance)",
            "prompt": "בנו פונקציה לסימולטור City שמקבלת גובה ומרחק ומריצה שתי משימות בניין שונות.",
            "check": "יש שני פרמטרים ושתי קריאות עם ערכים שונים."
        },
        {
            "minutes": "60–68",
            "title": "צ׳קליסט פיזי",
            "prompt": "לפני TELLO WiFi, מלאו: מגינים, משקפיים, סוללה, אזור ריק, תפקידים, Abort.",
            "check": "אין מעבר פיזי בלי כל הסעיפים."
        },
        {
            "minutes": "68–80",
            "title": "flyRoute Calibration",
            "prompt": "כתבו flyRoute(dist, alt), הריצו קצר באזור סטרילי ותעדו סטייה אחת.",
            "check": "ההרצה קצרה, עם sleep, והסטייה נמדדת."
        },
        {
            "minutes": "80–86",
            "title": "שינוי Argument בלבד",
            "prompt": "המדריך משנה תחנה. עדכנו רק את הערך בקריאת הפונקציה ולא את הגוף שלה.",
            "check": "גוף function flyRoute נשאר ללא שינוי."
        },
        {
            "minutes": "86–90",
            "title": "כרטיס יציאה",
            "prompt": "השלימו: פונקציה חוסכת שגיאות כי ___. פרמטר שונה ממשתנה גלובלי כי ___.",
            "check": "התשובה מחברת מודולריות וקלט מקומי."
        }
    ],
    "deliverable": "G7_Meeting8_Functions_TeamName: קוד JavaScript עם flyDelivery/inspectBuilding בסימולטור, גרסת flyRoute פיזית קצרה אם אושרה, שינוי Argument באילוץ דינמי, Run Log קצר ו־Share Link.",
    "assessment": [
        "הפונקציה מוגדרת לפני הקריאות אליה ובסינטקס תקין.",
        "התלמיד מבחין בין Parameter ל־Argument בדוגמת הקוד שלו.",
        "אותה פונקציה נקראת לפחות פעמיים עם ערכים שונים.",
        "יש sleep בין פקודות תנועה, במיוחד בגרסה הפיזית.",
        "המעבר הפיזי בוצע רק אחרי צ׳קליסט ואישור מדריך.",
        "באילוץ הדינמי שונה רק ערך הקריאה ולא גוף הפונקציה.",
        "יש Share Link או תיעוד תקלה מסודר."
    ],
    "debugging": [
        {
            "problem": "Syntax Error בהגדרת function",
            "fix": "לבדוק שם פונקציה, סוגריים עגולים לפרמטרים, סוגריים מסולסלים לגוף הפונקציה ונקודה־פסיק בסוף פקודות."
        },
        {
            "problem": "הפונקציה לא רצה",
            "fix": "לוודא שקוראים לה אחרי ההגדרה: flyDelivery(50); ולא רק מגדירים אותה."
        },
        {
            "problem": "distance is not defined",
            "fix": "לוודא שהשם בתוך הפונקציה זהה לשם הפרמטר: distance מול dist."
        },
        {
            "problem": "tello.moveforward נכשל",
            "fix": "לתקן CamelCase לפי Function Reference: tello.moveForward(...);."
        },
        {
            "problem": "הרחפן ממריא שוב באמצע",
            "fix": "להוציא takeoff מתוך פונקציית מסלול שנקראת כמה פעמים; takeoff בקוד הראשי בלבד."
        },
        {
            "problem": "סחיפה פיזית מהמסלול",
            "fix": "להקטין dist, להוסיף/לשמר sleep, לבדוק תאורה ורצפה, ולהוסיף עוגנים ויזואליים כהים לרצפה לפי הצורך."
        },
        {
            "problem": "האפליקציה קופאת בגלל while בתוך פונקציה",
            "fix": "Force Close, ואז לבדוק תנאי עצירה ועדכון מונה לפני הרצה נוספת."
        },
        {
            "problem": "Share Link לא נוצר אחרי TELLO WiFi",
            "fix": "לחזור ל־WiFi בית ספרי, לוודא Cloud Sign‑In ואז Generate Link."
        }
    ],
    "differentiation": {
        "support": [
            "לתת שלד function flyDelivery(distance) עם פקודות sleep מוכנות.",
            "להתחיל בפרמטר אחד בלבד distance לפני מעבר ל־height, distance.",
            "להשתמש בכרטיסיות צבע: Parameter בצהוב, Argument בכחול.",
            "בפיזי — לאפשר רק תצפית ומדידה לתלמידים שעדיין לא בטוחים בסינטקס."
        ],
        "extension": [
            "לבנות פונקציה כללית יותר flyBox(distance, repeats) שמשלבת לולאה משיעור 7.",
            "להוסיף בדיקת גבולות ידנית: לא להריץ אם dist גדול מהאזור הבטוח.",
            "להשוות קוד ידני מול פונקציה לפי מספר שורות ותחזוקה.",
            "להכין גרסה עם inspectBuilding(height, distance) ושתי קומות שונות בסימולטור."
        ]
    },
    "instructorGuide": {
        "prerequisites": "שיעור 8 נשען על שיעור 7: התלמידים כבר מבינים לולאה, משתנה, i++, sleep וחישובי גיאומטריה. עכשיו הם לומדים מתי לא מספיק לחזור על פעולה, אלא צריך לארוז לוגיקה בשם אחד ולהפעיל אותה עם ערכים משתנים.",
        "pedagogy": [
            "להבחין בעקביות בין Loop לבין Function: לולאה חוזרת כאן ועכשיו; פונקציה אורזת משימה לשימוש חוזר במקומות שונים.",
            "Parameter/Argument הוא לב השיעור — לא רק מילים באנגלית. Parameter הוא החריץ בהגדרה; Argument הוא הערך שנכנס אליו בהרצה.",
            "המעבר הפיזי הוא חלק מהלמידה אך אינו חובה לכל צוות אם אין זמן/ציוד/בטיחות. סימולטור איכותי עדיף על הרצה פיזית לא מבוקרת.",
            "דיוק סינטקס הוא דרישה מבנית: סוגריים, CamelCase ונקודה־פסיק הם חלק מתוכנית הטיסה.",
            "האילוץ הדינמי הוא רגע ההבנה: לא מתקנים את כל הקוד, משנים רק מספר אחד בקריאה לפונקציה."
        ],
        "facilitationNotes": [
            "להגביל סרטון Zipline ל־3 דקות כדי לשמור זמן לתרגול.",
            "להקרין שתי קריאות לאותה פונקציה בצבעים שונים כדי להמחיש Arguments.",
            "לפני טיסה פיזית לעצור את כל הכיתה לצ׳קליסט אחיד — לא תוך כדי רעש והרצות.",
            "אם האזור קטן מ־3×3 מטר, להקטין את המרחקים ל־40–60 אינץ׳ ולציין שזה כיול הנדסי ולא ויתור.",
            "לאסוף Run Logs קצרים: dist, alt, תוצאה, תיקון."
        ],
        "mediaNote": "סרטון Zipline הוא מקור השראה; אם חסום, להשתמש בחיפוש YouTube או בתיאור מילולי של משלוחי תרופות אוטונומיים.",
        "exitTicket": "פונקציה מתאימה למשימת Zipline כי ___. בפרמטר אני מגדיר ___ וב־Argument אני שולח ___."
    },
    "appWorkflowTitle": "DroneBlocks Code — Zipline Functions & Parameters",
    "appWorkflowNote": "מפגש 8 מתחיל בסימולטור City וממשיך לטיסה פיזית קצרה רק אם המדריך מאשר. האתר מציג תדריך ומבנה; את הקוד כותבים ומריצים ב־DroneBlocks Code בטאבלט.",
    "appWorkflow": [
        {
            "title": "Cloud + New Script",
            "detail": "התחברו ל־WiFi בית ספרי, פתחו DroneBlocks Code ושמרו קובץ בשם G7_Meeting8_Functions_TeamName."
        },
        {
            "title": "Function Definition",
            "detail": "כתבו function flyDelivery(distance) { ... } והכניסו לתוכה פקודות תנועה עם sleep בין כל תנועה."
        },
        {
            "title": "Function Calling",
            "detail": "ב־Main code כתבו takeoff, sleep, ואז flyDelivery(50); ו־flyDelivery(80); לפני land."
        },
        {
            "title": "City Simulator Challenge",
            "detail": "שדרגו ל־inspectBuilding(height, distance) ובדקו שני בניינים שונים בסימולטור."
        },
        {
            "title": "Physical Checklist",
            "detail": "רק באישור מדריך: TELLO WiFi, מגינים, משקפי מגן, אזור 3×3 ריק, תפקידים ו־Abort מוכן."
        },
        {
            "title": "Dynamic Argument Change",
            "detail": "כשהמדריך משנה תחנה, משנים רק את הערך בקריאה flyRoute(...), לא את גוף הפונקציה."
        },
        {
            "title": "Save & Share",
            "detail": "חוזרים ל־WiFi בית ספרי, שומרים, מפיקים Share Link ומסדרים סוללות לפי שתי קופסאות."
        }
    ],
    "visualDiagram": {
        "panelTitle": "🧩 Zipline Function Engine",
        "chip": "Sim + Physical",
        "title": "מנוע טיסה מודולרי עם פרמטרים",
        "src": "assets/drone-coding-foundations/lesson8/zipline-functions-parameters-route.svg",
        "alt": "תרשים פונקציית רחפן עם פרמטרים לשליחות Zipline בסימולטור ובאזור פיזי בטוח",
        "caption": "פונקציה אחת יכולה להפעיל מסלולים שונים: בסימולטור משנים height ו־distance; בכיתה משנים dist ו־alt רק אחרי צ׳קליסט בטיחות."
    },
    "videoResources": [
        {
            "title": "Zipline medical drone delivery — search suggestion",
            "url": "https://www.youtube.com/results?search_query=Zipline+medical+drone+delivery",
            "note": "להקרין 2–3 דקות בלבד ולשאול איך מערכת אחת משרתת יעדים רבים."
        }
    ],
    "screenshotSlides": [
        {
            "title": "Zipline Function Engine",
            "src": "assets/drone-coding-foundations/lesson8/zipline-functions-parameters-route.svg",
            "caption": "אותה פונקציה, ערכים משתנים, סימולטור ואז כיול פיזי."
        },
        {
            "title": "פותחים DroneBlocks Code",
            "src": "assets/tello-mission-lab/lesson1/open-app.png",
            "caption": "Cloud Sign‑In ו־New Script לפני כתיבה."
        },
        {
            "title": "בדיקת סימולטור לפני פיזי",
            "src": "assets/tello-mission-lab/lesson1/simulator-run.png",
            "caption": "לא עוברים לרחפן בלי סימולטור וצ׳קליסט."
        },
        {
            "title": "Save & Share",
            "src": "assets/tello-mission-lab/lesson1/save-share.png",
            "caption": "G7_Meeting8_Functions_TeamName."
        }
    ],
    "instructorSlides": [
        {
            "title": "Zipline Modular Flight Engine",
            "body": "היום בונים פונקציה אחת חכמה שמקבלת מרחק וגובה ומשרתת יעדים שונים.",
            "bullets": [
                "Function",
                "Parameters",
                "Delivery"
            ]
        },
        {
            "title": "Function ≠ Loop",
            "body": "לולאה חוזרת על פעולה; פונקציה אורזת משימה לשימוש חוזר בקוד.",
            "bullets": [
                "Reuse",
                "Definition",
                "Calling"
            ]
        },
        {
            "title": "Parameter vs Argument",
            "body": "Parameter הוא שם הקלט בהגדרה; Argument הוא הערך שנשלח בזמן הקריאה.",
            "bullets": [
                "distance",
                "50",
                "80"
            ]
        },
        {
            "title": "City Simulator First",
            "body": "בודקים flyDelivery ו־inspectBuilding בסימולטור לפני שמוציאים רחפנים.",
            "bullets": [
                "City",
                "height",
                "distance"
            ]
        },
        {
            "title": "Physical Safety Gate",
            "body": "רק אחרי אישור מדריך: אזור סטרילי, מגינים, משקפי מגן, תפקידים ו־Abort.",
            "bullets": [
                "3×3m",
                "Observer",
                "Abort"
            ]
        },
        {
            "title": "Dynamic Challenge",
            "body": "המדריך מזיז תחנה. הצוות משנה רק את ה־Argument, לא את גוף הפונקציה.",
            "bullets": [
                "flyRoute(50,60)",
                "flyRoute(90,60)",
                "No body edits"
            ]
        },
        {
            "title": "סגירת מערכות",
            "body": "חוזרים ל־WiFi בית ספרי, Share Link, סוללות בשתי קופסאות וסיכום פונקציות מול לולאות.",
            "bullets": [
                "Save",
                "Share",
                "Batteries"
            ]
        }
    ]
}
);


  Object.assign(window.DRONE_CODING_FOUNDATIONS_LESSONS[8], {
    "title": "שיעור 9: Ingenuity Survival Logic — קבלת החלטות If / Else ב־JavaScript",
    "subtitle": "Flow Control, Boolean Conditions, if/else, משתנים דינמיים ואילוץ סערה",
    "unit": "יחידה 3 — לולאות, פונקציות ותנאים",
    "concept": "קבלת החלטות מותנית ב־JavaScript: מעבר מקוד סדרתי לקוד שמסתעף לפי תנאי Boolean",
    "story": "צוותי NASA JPL חוזרים למאדים למשימת Ingenuity בקניון השדים. בגלל שיהוי תקשורת אין שליטה בזמן אמת, ולכן הרחפן חייב לבחור בעצמו: אם סערת חול פעילה — נתיב חירום ונחיתה; אם הסערה שככה — ממשיכים במסלול הסריקה הרגיל. זהו שיעור שבו הקוד מפסיק להיות רשימה קווית והופך למערכת קבלת החלטות.",
    "mission": "לכתוב ב־DroneBlocks Code קוד JavaScript עם if/else שמקבל החלטת ניווט לפי משתנה דינמי. בשלב הסימולטור City משתמשים ב־flightAltitude כדי לבחור בין טיסה קדימה לבין עקיפה ימינה. בשלב הפיזי — רק אחרי סימולטור, צ׳קליסט ואישור מדריך — משתמשים ב־isStormActive כדי לבחור בין מנחת חירום ימינה לבין מסלול סריקה ישר. התלמידים משנים רק את ערך המשתנה בראש הקוד.",
    "commands": [
        "code_editor",
        "variable",
        "condition",
        "takeoff",
        "forward",
        "right",
        "sleep",
        "land",
        "battery",
        "wifi",
        "abort",
        "debug",
        "save_cloud"
    ],
    "blocks": [
        "code_editor",
        "variable",
        "condition",
        "takeoff",
        "forward",
        "right",
        "sleep",
        "land",
        "battery",
        "wifi",
        "abort",
        "debug",
        "save_cloud"
    ],
    "workspaceMode": "physical-lab",
    "physicalFlightAllowed": true,
    "essentialQuestion": "איך תנאי if/else מאפשר לרחפן לבחור נתיב בטוח לפי מצב משתנה, בלי שהמפעיל ינהג בו בזמן אמת?",
    "successCriteria": [
        "אני מסביר/ה מהי בקרת זרימה ומה ההבדל בין קוד סדרתי לקוד מותנה.",
        "אני כותב/ת if/else עם סוגריים עגולים לתנאי וסוגריים מסולסלים לכל ענף.",
        "אני מבין/ה שתוצאת תנאי היא Boolean: true או false.",
        "אני משנה רק את ערך המשתנה flightAltitude או isStormActive כדי לשנות התנהגות.",
        "אני בודק/ת בסימולטור את שני הענפים: מעל הרף ומתחת לרף.",
        "אני עובר/ת לטיסה פיזית רק אחרי צ׳קליסט, תפקידים ואישור מדריך.",
        "אני יודע/ת מתי ללחוץ Abort ומסיים/ת כל ענף עם land.",
        "אני שומר/ת Grade7_Meeting9_TeamX ומשתף/ת קישור."
    ],
    "realWorldUses": [
        {
            "icon": "🛰️",
            "title": "NASA JPL / Mars Autonomy",
            "text": "בחלל אין שליטה מיידית; רחפן חייב לבחור פעולות הישרדות לפי תנאי."
        },
        {
            "icon": "🧠",
            "title": "Flow Control",
            "text": "קוד חכם לא רק רץ קדימה — הוא בודק מצב ובוחר נתיב."
        },
        {
            "icon": "🌪️",
            "title": "התמודדות עם סיכון",
            "text": "סערה, סוללה, מכשול או גובה נמוך יכולים להפוך לתנאי בטיחות."
        },
        {
            "icon": "🚦",
            "title": "רמזור אלגוריתמי",
            "text": "כמו בכביש: אם אדום עוצרים, אחרת ממשיכים — אבל בקוד מדויק."
        }
    ],
    "vocabulary": [
        [
            "Flow Control / בקרת זרימה",
            "הדרך שבה קוד מחליט איזה ענף פקודות להריץ."
        ],
        [
            "if",
            "מילת מפתח שבודקת תנאי ומריצה בלוק אם התנאי נכון."
        ],
        [
            "else",
            "ענף חלופי שרץ כאשר התנאי של if אינו נכון."
        ],
        [
            "Boolean",
            "ערך לוגי מסוג true או false."
        ],
        [
            "Condition / תנאי",
            "ביטוי שנבדק בתוך סוגריים עגולים, למשל windSpeed > 10."
        ],
        [
            "Comparison Operator",
            "אופרטור השוואה כמו >, <, ==, >= או <=."
        ],
        [
            "Code Branch / ענף קוד",
            "קבוצת פקודות בתוך {} שרצה רק במסלול החלטה מסוים."
        ],
        [
            "Indentation / הזחה",
            "סידור שורות פנימה כדי להראות מה שייך לכל בלוק."
        ],
        [
            "Dynamic Constraint",
            "שינוי פתאומי של משתנה על ידי המדריך רגע לפני ההרצה."
        ],
        [
            "Emergency Landing",
            "נחיתה במסלול חירום כאשר תנאי בטיחות מתקיים."
        ]
    ],
    "safetyRules": [
        "שיעור 9 מתחיל בסימולטור City בלבד. אין חיבור ל־TELLO WiFi לפני שכל צוות בדק את שני ענפי ה־if/else.",
        "טיסה פיזית מותרת רק באישור מדריך, עם משקפי מגן, שיער אסוף, מגיני פרופלורים ואזור סטרילי מסומן וריק מאדם.",
        "כל ענף if וכל ענף else חייב להסתיים ב־tello.land(); או לחזור למסלול שמסתיים בנחיתה ברורה.",
        "לפני המראה פיזית Safety Observer מכריז: רחפנים באוויר! Driver מוכן ל־Abort.",
        "מרחקים פיזיים נשמרים קטנים ומדודים: ימינה כ־60 אינץ׳ וישר כ־80 אינץ׳ רק אם יש מרווח בטוח; אחרת מקטינים לפי הזירה.",
        "התלמידים משנים רק את המשתנה בראש הקוד, לא פקודות תנועה רגע לפני הרצה.",
        "אם תנאי לא ברור או סוגריים לא מאוזנים — לא מריצים. קודם Navigator מקריא קוד שורה־שורה.",
        "בסיום כל סבב מוציאים סוללה מהרחפן ומנהלים שתי קופסאות: טעונות/ריקות."
    ],
    "commonDirections": [
        [
            "let flightAltitude = 65;",
            "משתנה סימולטור לבדיקת גובה מול רף."
        ],
        [
            "if (flightAltitude > 50)",
            "אם הגובה מעל 50 אינץ׳ — נתיב רגיל קדימה."
        ],
        [
            "else",
            "אם התנאי לא נכון — נתיב עקיפה ימינה."
        ],
        [
            "let isStormActive = true;",
            "משתנה פיזי מדומה למצב סערה."
        ],
        [
            "if (isStormActive == true)",
            "אם סערה פעילה — טסים למנחת חירום."
        ],
        [
            "tello.moveRight(60);",
            "נתיב חירום ימינה במרחק בטוח ומדוד."
        ],
        [
            "tello.moveForward(80);",
            "נתיב סריקה רגיל קדימה."
        ],
        [
            "tello.sleep(2);",
            "השהיית ייצוב לפני נחיתה או פקודה נוספת."
        ],
        [
            "tello.land();",
            "נחיתה בסוף כל ענף החלטה."
        ],
        [
            "Abort",
            "לחיצה מיידית אם אדם נכנס לאזור או הרחפן סוטה."
        ]
    ],
    "setupSteps": [
        "טאבלטים טעונים עם DroneBlocks Code ו־WiFi בית ספרי לשלב הסימולטור והשמירה.",
        "City Simulator פתוח; אין TELLO WiFi בתחילת השיעור.",
        "לוח/מקרן לפירוק if/else עם צבעים לסוגריים (), {}, ו־else.",
        "דפי Blueprint לתכנון שני ענפי החלטה לפני קוד.",
        "רחפני Tello/Tello EDU, מגיני פרופלורים, משקפי מגן וסוללות בשתי קופסאות.",
        "אזור סטרילי מסומן: מנחת המראה, נקודת החלטה, מנחת חירום ימינה ואזור סריקה קדימה.",
        "צוותים של שלושה: Driver, Navigator, Safety Observer — החלפה בכל סבב."
    ],
    "tabletTips": [
        "להקליד קודם את המשתנה בשורה הראשונה ורק אחר כך את ה־if/else.",
        "לבדוק שלכל { יש } תואם לפני Run.",
        "להכניס land בתוך שני הענפים, לא רק בסוף ענף אחד.",
        "להריץ בסימולטור פעם עם flightAltitude=65 ופעם עם flightAltitude=35 כדי לבדוק שני מסלולים.",
        "בפיזי לשנות רק true/false בראש הקוד לפי הנחיית המדריך.",
        "אם שמירה לא עובדת אחרי TELLO WiFi — חוזרים ל־WiFi בית ספרי ואז Share Link."
    ],
    "lessonFlow": [
        {
            "minutes": "0–8",
            "title": "גשר משיעור 8",
            "teacher": "מזכיר שפונקציות קיבלו ערכים משתנים. היום הערך המשתנה לא רק משנה מרחק — הוא בוחר ענף פעולה.",
            "students": "עונים מהו Parameter/Argument ומנחשים מה קורה כשערך הופך לתנאי."
        },
        {
            "minutes": "8–16",
            "title": "סיפור Ingenuity בקניון השדים",
            "teacher": "מכניס את הכיתה לתפקיד NASA JPL ומסביר שיהוי תקשורת, סערות חול והחלטות הישרדות אוטונומיות.",
            "students": "מציעים תנאי בטיחות שיכול לשנות מסלול רחפן."
        },
        {
            "minutes": "16–24",
            "title": "Flow Control ואנלוגיית רמזור/גשם",
            "teacher": "מסביר if/else כבחירה בין שני ענפים — לא מבצעים את שניהם.",
            "students": "מסווגים דוגמאות true/false מחיי יום־יום."
        },
        {
            "minutes": "24–34",
            "title": "סינטקס JavaScript",
            "teacher": "כותב let windSpeed = 12; ואז if (windSpeed > 10) { ... } else { ... }. מדגיש (), {}, הזחה ו־CamelCase.",
            "students": "מסמנים תנאי, ענף True וענף False."
        },
        {
            "minutes": "34–45",
            "title": "Blueprint לפני קוד",
            "teacher": "מבקש לצייר תרשים החלטה: יהלום תנאי ושני נתיבים.",
            "students": "מתכננים flightAltitude > 50 על דף לפני הקלדה."
        },
        {
            "minutes": "45–58",
            "title": "City Simulator — בדיקת שני ענפים",
            "teacher": "מלווה כתיבת קוד: flightAltitude=65 קדימה, flightAltitude=35 ימינה. אין TELLO WiFi.",
            "students": "מריצים פעמיים ומשנים רק את המשתנה בראש הקוד."
        },
        {
            "minutes": "58–66",
            "title": "תחקור סימולטור ודיבוג",
            "teacher": "אוסף באגים: סוגריים חסרים, land בענף אחד בלבד, שגיאות CamelCase.",
            "students": "מתקנים קוד ומגישים בדיקת שני ענפים."
        },
        {
            "minutes": "66–73",
            "title": "שער בטיחות פיזי",
            "teacher": "עוצר למודל צוותים, משקפי מגן, אזור סטרילי, סוללות, TELLO WiFi ו־Abort. מאשר צוותים אחד־אחד.",
            "students": "מגדירים Driver/Navigator/Safety Observer ומודדים מסלולים."
        },
        {
            "minutes": "73–84",
            "title": "מבחן האילוץ הדינמי",
            "teacher": "נותן לכל צוות true/false רגע לפני הרצה. מוודא שמשנים רק isStormActive ולא את פקודות התנועה.",
            "students": "מריצים פיזית קצר או מבצעים סימולציה מורכבת אם אין אישור/זמן."
        },
        {
            "minutes": "84–90",
            "title": "Share, Reflection ותחזוקה",
            "teacher": "מחזיר ל־WiFi בית ספרי, אוסף Grade7_Meeting9_TeamX ומנהל סוללות/ציוד.",
            "students": "משתפים קישור ומשלימים כרטיס יציאה על if/else ובטיחות."
        }
    ],
    "exercises": [
        {
            "minutes": "8–16",
            "title": "תנאי הישרדות",
            "prompt": "כתבו תנאי אחד שרחפן במאדים צריך לבדוק לפני המשך משימה.",
            "check": "יש תנאי ברור שניתן לענות עליו true/false."
        },
        {
            "minutes": "16–24",
            "title": "רמזור אלגוריתמי",
            "prompt": "השלימו: if (אור == אדום) { ___ } else { ___ }.",
            "check": "שני ענפים שונים ולא סותרים."
        },
        {
            "minutes": "24–34",
            "title": "מצא את גבולות הבלוק",
            "prompt": "סמנו בקוד דוגמה את (), {}, ענף true וענף else.",
            "check": "התלמיד יודע איפה כל ענף מתחיל ונגמר."
        },
        {
            "minutes": "34–45",
            "title": "Blueprint החלטה",
            "prompt": "ציירו יהלום flightAltitude > 50 ושני חצים: קדימה/ימינה.",
            "check": "השרטוט מתאים לקוד העתידי."
        },
        {
            "minutes": "45–52",
            "title": "הרצה ראשונה בסימולטור",
            "prompt": "קבעו flightAltitude = 65 והריצו את נתיב הסריקה קדימה.",
            "check": "הרצף כולל takeoff, forward, sleep/land."
        },
        {
            "minutes": "52–58",
            "title": "הרצה שנייה בסימולטור",
            "prompt": "שנו רק ל־flightAltitude = 35 והריצו את נתיב העקיפה ימינה.",
            "check": "רק המשתנה השתנה; פקודות התנועה לא שוכתבו."
        },
        {
            "minutes": "58–66",
            "title": "דיבוג סוגריים",
            "prompt": "בדקו בקוד של צוות אחר אם לכל { יש } ואם land קיים בשני הענפים.",
            "check": "זוהתה לפחות נקודת בדיקה אחת."
        },
        {
            "minutes": "73–84",
            "title": "אילוץ סערה פיזי",
            "prompt": "לפי הוראת המדריך, הגדירו isStormActive true/false והריצו מסלול קצר מאושר.",
            "check": "הרחפן בוחר נתיב נכון או הצוות מבצע Abort בטוח."
        },
        {
            "minutes": "84–90",
            "title": "כרטיס יציאה",
            "prompt": "השלימו: if/else חשוב ברחפן כי ___. לפני טיסה פיזית חייבים ___.",
            "check": "התשובה מחברת החלטה אוטונומית ובטיחות."
        }
    ],
    "deliverable": "Grade7_Meeting9_TeamX: קוד JavaScript עם if/else, בדיקת שני ערכי flightAltitude בסימולטור, גרסת isStormActive פיזית קצרה אם אושרה, Blueprint החלטה, תיעוד באג אחד ו־Share Link.",
    "assessment": [
        "הקוד כולל משתנה בראש הקוד ותנאי if/else תקין.",
        "שני הענפים נבדקו בסימולטור עם ערכים שונים.",
        "יש שימוש נכון ב־>, == או Boolean true/false.",
        "הסוגריים העגולים והמסולסלים מאוזנים והקוד מוזח לקריאות.",
        "כל ענף מסתיים בנחיתה או במסלול נחיתה ברור.",
        "המעבר הפיזי נעשה רק אחרי צ׳קליסט ותפקידי צוות.",
        "באילוץ הדינמי שונה רק המשתנה בראש הקוד.",
        "התוצר נשמר בשם מוסכם ויש Share Link או תיעוד תקלה."
    ],
    "debugging": [
        {
            "problem": "Syntax Error בשורת if",
            "fix": "לבדוק if (condition) עם סוגריים עגולים, ואז { } לבלוק. else מגיע אחרי סגירת ה־if."
        },
        {
            "problem": "שני הנתיבים רצים או הנתיב הלא נכון רץ",
            "fix": "לבדוק את התנאי ואת הערך של המשתנה: true/false, > 50, או == לפי הצורך."
        },
        {
            "problem": "הרחפן לא נוחת באחד המצבים",
            "fix": "לוודא tello.land(); קיים בשני הענפים או שיש נחיתה משותפת אחרי ה־if רק אם זה בטוח וברור."
        },
        {
            "problem": "פקודה לא מוכרת כמו flyForward/flyRight",
            "fix": "לבדוק Function Reference. בקורס משתמשים ב־moveForward/moveRight אלא אם האפליקציה המקומית מציגה שם אחר."
        },
        {
            "problem": "חסרים סוגריים מסולסלים",
            "fix": "לספור זוגות: כל { חייב }. הנווט מקריא את גבולות הבלוקים."
        },
        {
            "problem": "Share Link לא עובד",
            "fix": "הטאבלט כנראה עדיין על TELLO WiFi. לחזור ל־WiFi בית ספרי ולשמור."
        },
        {
            "problem": "רחפן סוטה פיזית",
            "fix": "Abort אם יש סכנה; להקטין מרחק, לבדוק תאורה, להוסיף סרטי עוגן לרצפה ולוודא פרופלורים תקינים."
        },
        {
            "problem": "רחפן מסתובב או נופל אחרי המראה",
            "fix": "לעצור, לבדוק פרופלורים לפי סימוני Notch ולנקות מנועים לפני ניסיון נוסף."
        }
    ],
    "differentiation": {
        "support": [
            "לתת שלד if/else עם חורים למילוי המשתנה והמרחקים.",
            "להסתפק בסימולטור בלבד לתלמידים שעדיין מתקשים בסוגריים או בקריאת התנאי.",
            "להשתמש בכרטיסי True/False פיזיים לפני הקלדה.",
            "לתת זוג Navigator חזק לצוות שזקוק לתמיכה בסינטקס."
        ],
        "extension": [
            "להוסיף תנאי נוסף עם else if עבור מצב ביניים של windSpeed.",
            "לשלב פונקציה משיעור 8 בתוך שני ענפי ה־if/else.",
            "לכתוב בדיקת סוללה מדומה: if (battery < 20) land else continue.",
            "להשוות בין החלטה לפי Boolean לבין החלטה לפי מספר flightAltitude."
        ]
    },
    "instructorGuide": {
        "prerequisites": "שיעור 9 נשען על שיעור 8: התלמידים יודעים שפונקציה יכולה לקבל ערך משתנה. עכשיו הם לומדים שהערך המשתנה יכול לשלוט בזרימת הקוד ולבחור ענף פעולה. להזכיר גם את שיעור 7: לולאה חוזרת; תנאי בוחר.",
        "pedagogy": [
            "המושג המרכזי הוא Flow Control: מעבר מקוד קווי לקוד שמקבל החלטה. לא להעמיס יותר מדי אופרטורים בבת אחת.",
            "להקפיד על שפה מדויקת: תנאי מחזיר true/false; if מריץ ענף אחד; else הוא המסלול החלופי.",
            "הסכנה הפדגוגית היא שתלמידים יחשבו ש־if/else הוא ‘עוד בלוק קוד’. לכן להשתמש בתרשים יהלום החלטה לפני JavaScript.",
            "בטיסה פיזית, התנאי מדומה באמצעות משתנה שהמדריך משנה. אין צורך בחיישן אמיתי כדי ללמד קבלת החלטות אלגוריתמית.",
            "אם הבטיחות/זמן לא מאפשרים טיסה, המשימה הפיזית הופכת לסימולציה מורכבת עם אותה לוגיקה — התוכן הפדגוגי לא נפגע."
        ],
        "facilitationNotes": [
            "להקרין סרטון קצר בלבד או להשתמש בסיפור NASA אם אין זמן.",
            "בשלב הסינטקס להבליט בצבעים שונים: condition, true branch, false branch.",
            "לפני Run לבקש מהנווט להגיד בקול: מה יקרה אם המשתנה true? מה יקרה אם false?",
            "לא לאפשר טיסה פיזית לצוות שלא בדק את שני הענפים בסימולטור.",
            "להחליף תפקידים בכל סבב סוללה או לפחות אחרי הרצה אחת."
        ],
        "mediaNote": "סרטון NASA/Exyn הוא השראה בלבד; אין תלות בו. אם הרשת חוסמת וידאו, להתחיל ישירות מתרחיש Mars Canyon.",
        "exitTicket": "if/else מאפשר לרחפן ___. התנאי שלי החזיר true/false לפי ___."
    },
    "appWorkflowTitle": "DroneBlocks Code — Ingenuity If/Else Survival Mission",
    "appWorkflowNote": "מפגש 9 מתחיל בסימולטור City וממשיך לטיסה פיזית קצרה רק אחרי בדיקת שני ענפי התנאי ואישור מדריך. האתר מציג תדריך; הקוד נכתב ומורץ ב־DroneBlocks Code בטאבלט.",
    "appWorkflow": [
        {
            "title": "Cloud + Blueprint",
            "detail": "התחברו ל־WiFi בית ספרי, פתחו DroneBlocks Code, שמרו Grade7_Meeting9_TeamX וציירו יהלום החלטה לפני קוד."
        },
        {
            "title": "City Simulator if/else",
            "detail": "כתבו let flightAltitude = 65; ואז if (flightAltitude > 50) קדימה, else ימינה. הריצו גם עם 35."
        },
        {
            "title": "Debug שני ענפים",
            "detail": "בדקו סוגריים, הזחה, CamelCase ו־land בשני הענפים לפני מעבר פיזי."
        },
        {
            "title": "Physical Safety Gate",
            "detail": "רק באישור מדריך: משקפי מגן, שיער אסוף, מגינים, אזור סטרילי, TELLO WiFi ותפקידי Driver/Navigator/Safety Observer."
        },
        {
            "title": "Dynamic Storm Constraint",
            "detail": "המדריך קובע true/false. משנים רק let isStormActive בראש הקוד ומריצים מסלול קצר מאושר."
        },
        {
            "title": "Save & Share",
            "detail": "לאחר נחיתה חוזרים ל־WiFi בית ספרי, מפיקים Share Link ומוציאים סוללות לפי נוהל שתי קופסאות."
        }
    ],
    "visualDiagram": {
        "panelTitle": "🚦 Ingenuity Decision Route",
        "chip": "If / Else",
        "title": "מסלול החלטה: סערה או סריקה",
        "src": "assets/drone-coding-foundations/lesson9/ingenuity-if-else-survival-route.svg",
        "alt": "תרשים if else שבו רחפן Ingenuity בוחר בין מנחת חירום לבין נתיב סריקה לפי מצב סערה",
        "caption": "if/else מחלק את תוכנית הטיסה לשני ענפים: סערה פעילה מובילה למנחת חירום; אחרת ממשיכים קדימה לסריקה."
    },
    "videoResources": [
        {
            "title": "NASA Ingenuity / autonomous drone decision making — search suggestion",
            "url": "https://www.youtube.com/results?search_query=NASA+Ingenuity+autonomous+flight+decision+making",
            "note": "אפשרות לפתיחת שיעור; להשתמש ב־2–3 דקות בלבד."
        },
        {
            "title": "Exyn autonomous drone cave mapping — search fallback",
            "url": "https://www.youtube.com/results?search_query=Exyn+autonomous+drone+cave+mapping",
            "note": "חלופה שממחישה החלטות ניווט אוטונומיות בסביבה קשה."
        }
    ],
    "screenshotSlides": [
        {
            "title": "Ingenuity If/Else Survival Route",
            "src": "assets/drone-coding-foundations/lesson9/ingenuity-if-else-survival-route.svg",
            "caption": "תנאי true מוביל לחירום; else מוביל לסריקה רגילה."
        },
        {
            "title": "פותחים DroneBlocks Code",
            "src": "assets/tello-mission-lab/lesson1/open-app.png",
            "caption": "WiFi בית ספרי, Login ושמירת Grade7_Meeting9_TeamX."
        },
        {
            "title": "בדיקת סימולטור לפני פיזי",
            "src": "assets/tello-mission-lab/lesson1/simulator-run.png",
            "caption": "מריצים את שני ענפי התנאי לפני TELLO WiFi."
        },
        {
            "title": "Save & Share",
            "src": "assets/tello-mission-lab/lesson1/save-share.png",
            "caption": "חוזרים ל־WiFi בית ספרי ומגישים Share Link."
        }
    ],
    "instructorSlides": [
        {
            "title": "Ingenuity Survival Mission",
            "body": "הרחפן במאדים לא מקבל ג׳ויסטיק בזמן אמת — הוא חייב לבחור נתיב לפי תנאי.",
            "bullets": [
                "NASA JPL",
                "Mars Canyon",
                "Autonomy"
            ]
        },
        {
            "title": "Flow Control",
            "body": "קוד סדרתי מריץ שורה אחרי שורה. if/else בוחר ענף לפי true או false.",
            "bullets": [
                "Condition",
                "True branch",
                "False branch"
            ]
        },
        {
            "title": "סינטקס If/Else",
            "body": "התנאי בתוך (), כל ענף בתוך {}, והזחה עוזרת לקרוא קוד מקצועי.",
            "bullets": [
                "()",
                "{}",
                "Indentation"
            ]
        },
        {
            "title": "City Simulator Challenge",
            "body": "flightAltitude מעל 50 מוביל קדימה; מתחת לרף מוביל לעקיפה ימינה.",
            "bullets": [
                "65 → forward",
                "35 → right",
                "Change variable only"
            ]
        },
        {
            "title": "Safety Gate",
            "body": "אין טיסה פיזית לפני בדיקת שני ענפים, אזור סטרילי, משקפי מגן, תפקידים ו־Abort.",
            "bullets": [
                "Simulator first",
                "Observer",
                "Abort"
            ]
        },
        {
            "title": "Dynamic Storm Test",
            "body": "המדריך משנה isStormActive רגע לפני ההרצה. הצוות משנה רק משתנה בראש הקוד.",
            "bullets": [
                "true",
                "false",
                "No movement edits"
            ]
        },
        {
            "title": "סגירת משימה",
            "body": "Share Link, דיון על החלטות אוטונומיות, סוללות בשתי קופסאות והחזרת ציוד.",
            "bullets": [
                "Save",
                "Reflect",
                "Batteries"
            ]
        }
    ]
}
);


  Object.assign(window.DRONE_CODING_FOUNDATIONS_LESSONS[9], {
    "title": "שיעור 10: Wing Algorithmic Blueprint — מבוכים אלגוריתמיים ותכנון פרויקט הגמר",
    "subtitle": "Software Architecture, Decomposition, Blueprint, Modular Code ו־City Simulator Prototype",
    "unit": "יחידה 4 — פרויקט ניווט אלגוריתמי",
    "concept": "תכנון ארכיטקטורת תוכנה לרחפן: פירוק בעיה מורכבת למשתנים, פונקציות, לולאות ותנאים לפני כתיבת קוד",
    "story": "אחרי שיעור 9, שבו הרחפן למד לבחור נתיב באמצעות If / Else, כיתה ז׳ נכנסת לתפקיד ארכיטקטי תוכנה ומהנדסי ניווט אוטונומי בחברת Wing של Alphabet/Google. עיריית עומר העתידית מבקשת פיילוט משלוחי תרופות בעיר צפופה עם בניינים, קווי מתח ואזורי No‑Fly. לפני שמריצים רחפן פיזי בשיעור 11, חייבים לבנות Blueprint אלגוריתמי מדויק ולבדוק אב־טיפוס דיגיטלי בסימולטור City.",
    "mission": "לתכנן על נייר Algorithmic Blueprint למשימת Wing Delivery: מסלול מבית מרקחת, עקיפת No‑Fly Zone, סריקת בניין א׳ באמצעות scanBuilding(sides, distance), החלטת if/else לפי obstacleHeight, מעבר מעל בניין גבוה ונחיתה סופית. רק אחרי אישור דף האפיון פותחים טאבלטים, מממשים אב־טיפוס JavaScript ב־DroneBlocks Code ושומרים Meeting10_Blueprint_GroupX.",
    "commands": [
        "code_editor",
        "comment",
        "variable",
        "function",
        "loop",
        "condition",
        "takeoff",
        "flyUp",
        "flyDown",
        "forward",
        "yaw",
        "sleep",
        "land",
        "debug",
        "share"
    ],
    "blocks": [
        "code_editor",
        "comment",
        "variable",
        "function",
        "loop",
        "condition",
        "takeoff",
        "flyUp",
        "flyDown",
        "forward",
        "yaw",
        "sleep",
        "land",
        "debug",
        "share"
    ],
    "workspaceMode": "droneblocks-code",
    "physicalFlightAllowed": false,
    "essentialQuestion": "איך תכנון Blueprint לפני קוד מונע קריסות, שגיאות וסיכון כאשר משלבים משתנים, לולאות, פונקציות ותנאים במשימת רחפן מורכבת?",
    "successCriteria": [
        "אני מסביר/ה למה לא מתחילים בפרויקט מורכב מ־tello.takeoff() אלא מתכנון Blueprint.",
        "אני מפרק/ת את המבוך העירוני לרכיבים: משתנים, פונקציה, לולאה ותנאי.",
        "אני מגדיר/ה משתנים כמו safeAltitude, scanDistance ו־obstacleHeight עם משמעות תפעולית.",
        "אני מתכנן/ת פונקציה scanBuilding(sides, distance) שמשתמשת בלולאת for.",
        "אני כותב/ת תנאי if/else שמחליט אם לסרוק מכשול נמוך או לעקוף מעל מכשול גבוה.",
        "אני שומר/ת על כלל Screen Down בשלב האפיון ולא פותח/ת טאבלט לפני אישור מדריך.",
        "אני מממש/ת אב־טיפוס בסימולטור City או Minimal Grid כגיבוי.",
        "אני שומר/ת Meeting10_Blueprint_GroupX ומגיש/ה Share Link ודף אפיון."
    ],
    "realWorldUses": [
        {
            "icon": "📦",
            "title": "Wing / Alphabet Delivery",
            "text": "מערכות משלוחים עירוניות חייבות לתכנן נתיבים סביב בניינים, עצים ואזורי טיסה אסורים."
        },
        {
            "icon": "🧱",
            "title": "Software Architecture",
            "text": "מהנדסים לא מתחילים לבנות לפני שיש שרטוט; גם קוד רחפן צריך Blueprint."
        },
        {
            "icon": "🧩",
            "title": "Decomposition",
            "text": "בעיה מורכבת הופכת לרכיבים קטנים: משתנים, פונקציות, תנאים והרצות בדיקה."
        },
        {
            "icon": "🧪",
            "title": "Digital Prototype",
            "text": "הסימולטור מאפשר לבדוק ארכיטקטורה לפני שיעור 11 והמעבר לעולם הפיזי."
        }
    ],
    "vocabulary": [
        [
            "Blueprint",
            "שרטוט/מפרט תכנון שמגדיר מה הקוד יעשה לפני שמקלידים אותו."
        ],
        [
            "Software Architecture",
            "מבנה־על של התוכנה: אילו רכיבים יש ואיך הם מתחברים."
        ],
        [
            "Decomposition",
            "פירוק בעיה גדולה למשימות קטנות וברורות."
        ],
        [
            "Algorithmic Maze",
            "מבוך שנפתר באמצעות כללים ואלגוריתם, לא רק רשימת צעדים ידנית."
        ],
        [
            "Modular Code",
            "קוד שמחולק לפונקציות קטנות וברורות שאפשר לבדוק ולהחליף."
        ],
        [
            "Pseudo‑Code",
            "תיאור חופשי של לוגיקת הקוד בעברית/אנגלית לפני JavaScript מלא."
        ],
        [
            "Flowchart",
            "תרשים זרימה שמראה תנאים, פעולות וסדר החלטות."
        ],
        [
            "No‑Fly Zone",
            "אזור שאסור לרחפן לעבור בו ולכן האלגוריתם חייב לעקוף."
        ],
        [
            "safeAltitude",
            "משתנה גובה מעבר בטוח מעל מכשולים."
        ],
        [
            "scanBuilding(sides, distance)",
            "פונקציה מודולרית לסריקת בניין עם מספר צלעות ומרחק הקפה."
        ],
        [
            "Code Review",
            "בדיקה ידנית של קוד/תכנון לפני הרצה."
        ],
        [
            "Sim‑to‑Reality Gap",
            "פער צפוי בין סימולטור מושלם לבין רחפן פיזי בשיעור הבא."
        ]
    ],
    "safetyRules": [
        "שיעור 10 הוא סימולטור ותכנון בלבד — אין חיבור ל־TELLO WiFi ואין טיסה פיזית.",
        "טאבלטים הפוכים/סגורים בשלב האפיון: קודם Blueprint מאושר, אחר כך קוד.",
        "כל מסלול מתוכנן חייב לכלול נחיתה בטוחה ומרווח גובה מעל מכשולים.",
        "אסור לתכנן מעבר דרך No‑Fly Zone גם אם זה מקצר את הדרך.",
        "כל לולאה בתכנון חייבת לכלול תנאי עצירה ברור כדי למנוע Infinite Loop.",
        "כל פונקציה צריכה לעשות פעולה אחת ברורה; פונקציה עמוסה מדי היא סיכון דיבוג.",
        "אם City Simulator נתקע, עוברים ל־Minimal Grid לבדיקת הלוגיקה במקום לבטל את שלב הבדיקה.",
        "דפי האפיון נשמרים למדריך לקראת שיעור 11 — הם חלק מתוצר הבטיחות."
    ],
    "commonDirections": [
        [
            "Screen Down",
            "טאבלטים סגורים עד אישור דף האפיון."
        ],
        [
            "let scanDistance = 60;",
            "מרחק הקפת בניין בסימולטור."
        ],
        [
            "let safeAltitude = 120;",
            "גובה מעבר בטוח מעל מכשולים."
        ],
        [
            "let obstacleHeight = 80;",
            "גובה מכשול שמפעיל החלטת if/else."
        ],
        [
            "function scanBuilding(sides, distance)",
            "פונקציה מודולרית לסריקת בניין."
        ],
        [
            "for (let i = 0; i < sides; i++)",
            "לולאה שחוזרת לפי מספר צלעות."
        ],
        [
            "if (obstacleHeight < 100)",
            "אם הבניין נמוך — סריקה היקפית."
        ],
        [
            "else",
            "אם גבוה/מסוכן — עקיפה מעל המכשול."
        ],
        [
            "tello.sleep(2);",
            "השהיה לייצוב בין תנועה ופנייה."
        ],
        [
            "Share Link",
            "קישור הגשה לענן DroneBlocks."
        ]
    ],
    "setupSteps": [
        "טאבלטים טעונים, אך סגורים בתחילת שלב האפיון.",
        "דפי Blueprint/משבצות מודפסים ועטים/מרקרים צבעוניים.",
        "מקרן להצגת סיפור Wing ודוגמת תרשים זרימה.",
        "WiFi בית ספרי יציב לשמירה בענן לאחר פתיחת הטאבלטים.",
        "DroneBlocks Code ו־City Simulator זמינים; Minimal Grid כגיבוי.",
        "תבנית שמות: Meeting10_Blueprint_GroupX.",
        "המדריך אוסף את דפי האפיון בסוף השיעור לקראת שיעור 11."
    ],
    "tabletTips": [
        "לא לפתוח טאבלט לפני שיש משתנים, פונקציות ותנאי כתובים על נייר.",
        "להתחיל את הקוד בהערות // שמסכמות את ה־Blueprint.",
        "להעתיק שמות פקודות מ־Function Reference ולא להשתמש בשמות לא מאומתים כמו flyForward אם האפליקציה מציגה moveForward.",
        "להריץ קודם חלק קטן: takeoff → moveForward → land, ואז להוסיף פונקציה ותנאי.",
        "לשמור גרסאות: v1_blueprint, v2_scanBuilding, v3_if_else.",
        "אם City Simulator איטי — לסגור אפליקציות רקע ולעבור ל־Minimal Grid לבדיקת לוגיקה."
    ],
    "lessonFlow": [
        {
            "minutes": "0–8",
            "title": "בדיקת תנאי קדם משיעור 9",
            "teacher": "מחבר If / Else, פונקציות ולולאות לרגע הפרויקט: עכשיו משלבים הכול בתכנון אחד.",
            "students": "מציינים מושג אחד שכבר למדו ואיך הוא יכול לעזור במבוך עירוני."
        },
        {
            "minutes": "8–18",
            "title": "סיפור Wing ועומר העתידית",
            "teacher": "מציג אתגר משלוחי תרופות בעיר צפופה, No‑Fly Zones ובניינים. מדגיש שזה שיעור הכנה לשיעור 11 ולא טיסה פיזית.",
            "students": "מזהים סיכונים עירוניים ודרישות תכנון."
        },
        {
            "minutes": "18–25",
            "title": "Blueprint כמו בניין",
            "teacher": "משתמש באנלוגיית אדריכלות: לא שופכים בטון לפני שרטוט. לא מריצים רחפן לפני אפיון.",
            "students": "מנסחים למה תכנון מונע שגיאות קוד ובטיחות."
        },
        {
            "minutes": "25–35",
            "title": "Screen Down — פירוק הבעיה",
            "teacher": "אוכף טאבלטים סגורים. מחלק תפקידים: System Architect, Software Engineer, Safety & Integration Lead.",
            "students": "מחלקים תפקידים ומתחילים דף אפיון."
        },
        {
            "minutes": "35–50",
            "title": "דף Blueprint מלא",
            "teacher": "מנחה להגדיר safeAltitude, scanDistance, deliveryAttempts/obstacleHeight, פונקציה ותנאי.",
            "students": "מציירים מסלול, Flowchart ופסאודו־קוד."
        },
        {
            "minutes": "50–55",
            "title": "Code Review לפני מסך",
            "teacher": "בודק דפי אפיון ומאשר רק צוותים שיש להם מסלול, משתנים, פונקציה, if/else ונחיתה.",
            "students": "מציגים תכנון ומקבלים אישור לפתיחת טאבלט."
        },
        {
            "minutes": "55–68",
            "title": "מימוש אב־טיפוס ב־DroneBlocks Code",
            "teacher": "מלווה כתיבת שלד JavaScript עם הערות, משתנים ו־scanBuilding.",
            "students": "פותחים Meeting10_Blueprint_GroupX ומקלידים גרסת V1."
        },
        {
            "minutes": "68–80",
            "title": "City Simulator Test",
            "teacher": "מנחה הרצות חלקיות: קודם ניווט, אחר כך scanBuilding, אחר כך if/else.",
            "students": "מריצים, מתעדים באג אחד ומשנים פרמטר אחד בכל פעם."
        },
        {
            "minutes": "80–86",
            "title": "Sim‑to‑Reality Forecast",
            "teacher": "שואל אילו בעיות יופיעו בשיעור 11 כשהקוד יעבור לרחפן פיזי.",
            "students": "רושמים סיכון פיזי ותיקון אפשרי."
        },
        {
            "minutes": "86–90",
            "title": "Share Link ואיסוף Blueprint",
            "teacher": "אוסף קישורים ודפי אפיון, מזכיר שהם בסיס לשיעור 11.",
            "students": "שומרים, משתפים ומחזירים טאבלטים."
        }
    ],
    "exercises": [
        {
            "minutes": "8–18",
            "title": "דרישות מערכת Wing",
            "prompt": "רשמו שלוש דרישות למשימת משלוח בעיר: יעד, מכשול, כלל בטיחות.",
            "check": "יש לפחות מכשול/No‑Fly וגובה בטיחות."
        },
        {
            "minutes": "18–25",
            "title": "למה Blueprint?",
            "prompt": "כתבו סיבה אחת למה אסור להתחיל ישר מ־tello.takeoff בפרויקט מורכב.",
            "check": "מוזכרת מניעת שגיאות/בטיחות/ארגון."
        },
        {
            "minutes": "25–35",
            "title": "פירוק לרכיבים",
            "prompt": "חלקו את המשימה למשתנים, פונקציות ותנאים.",
            "check": "יש לפחות משתנה אחד, פונקציה אחת ותנאי אחד."
        },
        {
            "minutes": "35–50",
            "title": "Flowchart עירוני",
            "prompt": "ציירו מסלול: בית מרקחת, No‑Fly, בניין א׳, בניין ב׳, מנחת סופי.",
            "check": "המסלול לא עובר דרך No‑Fly ומסתיים בנחיתה."
        },
        {
            "minutes": "50–55",
            "title": "Code Review תכנוני",
            "prompt": "הנווט מקריא את ה־Blueprint למדריך ומסביר איפה if/else נכנס.",
            "check": "המדריך מאשר לפני פתיחת טאבלט."
        },
        {
            "minutes": "55–68",
            "title": "שלד JavaScript",
            "prompt": "כתבו הערות, משתנים ופונקציה scanBuilding(sides, distance).",
            "check": "יש function, for, yawRight ו־sleep."
        },
        {
            "minutes": "68–80",
            "title": "הרצות חלקיות בסימולטור",
            "prompt": "בדקו בנפרד ניווט, סריקה, ואז תנאי obstacleHeight.",
            "check": "לא מריצים הכול בבת אחת; יש תיעוד באג."
        },
        {
            "minutes": "80–86",
            "title": "תחזית שיעור 11",
            "prompt": "כתבו בעיית Sim‑to‑Reality אחת ותיקון אפשרי.",
            "check": "מוזכרים Drift/סוללה/תאורה/מרחק בטוח."
        },
        {
            "minutes": "86–90",
            "title": "הגשה",
            "prompt": "שמרו Meeting10_Blueprint_GroupX ושלחו Share Link + דף אפיון.",
            "check": "יש שם קובץ וקישור/תיעוד תקלה."
        }
    ],
    "deliverable": "Meeting10_Blueprint_GroupX: דף Algorithmic Blueprint מאושר + אב־טיפוס JavaScript בסימולטור City/Minimal Grid הכולל משתנים, scanBuilding(sides, distance), לולאת for, if/else, נחיתה בטוחה ו־Share Link.",
    "assessment": [
        "דף האפיון כולל מסלול, משתנים, פונקציה, תנאי וסיום בטוח.",
        "הצוות שמר על Screen Down עד אישור מדריך.",
        "הקוד כולל הערות שמחברות Blueprint לקוד JavaScript.",
        "scanBuilding משתמשת בפרמטרים ובלולאת for.",
        "if/else מתמודד עם obstacleHeight או No‑Fly Zone בצורה מוסברת.",
        "ההרצה בסימולטור נעשתה בשלבים ולא כקוד ענק בבת אחת.",
        "התלמידים מזהים סיכון Sim‑to‑Reality לקראת שיעור 11.",
        "הפרויקט נשמר בענן בשם מוסכם ויש Share Link."
    ],
    "debugging": [
        {
            "problem": "התלמידים מתחילים להקליד בלי תכנון",
            "fix": "לעצור ולחזור לכלל Screen Down. לא מאשרים Run בלי Blueprint בסיסי."
        },
        {
            "problem": "City Simulator איטי או שחור",
            "fix": "לסגור אפליקציות רקע, לוודא WiFi, ואם צריך לעבור ל־Minimal Grid לבדיקת לוגיקה."
        },
        {
            "problem": "Syntax Error אחרי העתקת קוד גדול",
            "fix": "לבדוק בשלבים: משתנים בלבד, function בלבד, main flow בלבד. לא לתקן הכול יחד."
        },
        {
            "problem": "פקודות API לא תואמות",
            "fix": "להשתמש ב־Function Reference. אם האפליקציה משתמשת ב־moveForward ולא flyForward, להתאים לשם הרשמי המקומי."
        },
        {
            "problem": "Infinite Loop",
            "fix": "לבדוק כל while/for: תנאי עצירה וקידום מונה. לבצע Force Close אם האפליקציה קפאה."
        },
        {
            "problem": "הפונקציה לא נקראת",
            "fix": "לוודא שיש scanBuilding(4, scanDistance); בקוד הראשי ולא רק הגדרת function."
        },
        {
            "problem": "הרחפן הווירטואלי לא מגיע לנחיתה",
            "fix": "לבודד מקטעים ולהבטיח שכל ענף if/else חוזר למסלול שמסתיים ב־land."
        },
        {
            "problem": "Share Link נכשל",
            "fix": "לוודא WiFi בית ספרי ו־Login; לא להיות מחובר לרשת Tello."
        }
    ],
    "differentiation": {
        "support": [
            "לתת תבנית Blueprint עם שדות מוכנים: Variables / Functions / Conditions / Safety.",
            "לאפשר פסאודו־קוד בעברית לפני JavaScript.",
            "להסתפק ב־scanBuilding קבועה עם 4 צלעות לפני פרמטר sides.",
            "לעבוד ב־Minimal Grid אם City מכביד על הטאבלט."
        ],
        "extension": [
            "להוסיף deliveryAttempts ולתכנן ניסיון חוזר מוגבל.",
            "להוסיף פונקציה avoidNoFlyZone(direction, distance).",
            "להוסיף else if למכשול בינוני: scan / over / abort.",
            "להכין לקראת שיעור 11 רשימת כיול פיזית: מרחקים בטוחים, גובה, נקודת Abort."
        ]
    },
    "instructorGuide": {
        "prerequisites": "שיעור 10 הוא נקודת מעבר: אחרי שיעורים 7–9 התלמידים מכירים לולאות, פונקציות ו־if/else. עכשיו הם מפסיקים ללמוד כלי בודד ומתחילים לחשוב כמערכת. מטרת השיעור היא לא ‘עוד קוד’, אלא ארכיטקטורה ותכנון לפני ביצוע.",
        "pedagogy": [
            "להגן על שלב הנייר: תלמידים חזקים ירצו לרוץ לקוד, אבל האימון כאן הוא תכנון הנדסי לפני יישום.",
            "להשתמש במטאפורת בנייה: Blueprint לא מקשט את הפרויקט — הוא מונע קריסה.",
            "לדרוש פונקציות קטנות. פונקציה שעושה הכול אינה מודולרית ואינה ניתנת לדיבוג.",
            "לשמור על הפרדה: שיעור 10 סימולטור בלבד; שיעור 11 יעסוק בבדיקות פיזיות ו־Sim‑to‑Reality.",
            "להעריך את דף האפיון באותה רצינות כמו קוד. זה תוצר פרויקט."
        ],
        "facilitationNotes": [
            "להכין מראש דפי משבצות או תרשים זרימה פשוט.",
            "לאשר פתיחת טאבלטים לפי קריטריונים ברורים: מסלול, משתנים, פונקציה, תנאי, נחיתה.",
            "אם הזמן קצר, עדיף Blueprint חזק + אב־טיפוס קטן מאשר קוד ארוך ולא בדוק.",
            "להדגיש ששמות משתנים הם החלטה הנדסית: safeAltitude עדיף על x.",
            "לאסוף דפי אפיון פיזית או בצילום — הם חומר הכנה לשיעור 11."
        ],
        "mediaNote": "סרטון Wing/Flytrex הוא השראה בלבד; אם אין זמן או רשת, להתחיל מסיפור עומר העתידית והדיאגרמה.",
        "exitTicket": "ה־Blueprint שלי עוזר לרחפן כי ___. בשיעור 11 אצטרך לבדוק במציאות את ___."
    },
    "appWorkflowTitle": "DroneBlocks Code — Wing Algorithmic Blueprint",
    "appWorkflowNote": "מפגש 10 הוא תכנון ואב־טיפוס בסימולטור בלבד. אין טיסה פיזית ואין TELLO WiFi. האתר מציג תדריך; הקוד נכתב ב־DroneBlocks Code רק אחרי אישור דף Blueprint.",
    "appWorkflow": [
        {
            "title": "Screen Down Blueprint",
            "detail": "הטאבלטים סגורים. מציירים מסלול, No‑Fly Zone, בניינים, משתנים, פונקציה ותנאי."
        },
        {
            "title": "Instructor Approval",
            "detail": "המדריך מאשר שיש safeAltitude, scanDistance, scanBuilding, if/else ונחיתה בטוחה לפני פתיחת טאבלט."
        },
        {
            "title": "Cloud + New Script",
            "detail": "מתחברים ל־WiFi בית ספרי, פותחים DroneBlocks Code ושומרים Meeting10_Blueprint_GroupX."
        },
        {
            "title": "JavaScript Prototype",
            "detail": "כותבים הערות, משתנים גלובליים, scanBuilding(sides, distance), ואז main mission."
        },
        {
            "title": "City Simulator Test",
            "detail": "מריצים בשלבים: ניווט, סריקת בניין, תנאי obstacleHeight, נחיתה סופית."
        },
        {
            "title": "Version + Share",
            "detail": "שומרים גרסה, מפיקים Share Link ומגישים גם את דף האפיון לקראת שיעור 11."
        }
    ],
    "visualDiagram": {
        "panelTitle": "📐 Wing Blueprint Lab",
        "chip": "Simulator Only",
        "title": "מבוך עירוני כארכיטקטורת תוכנה",
        "src": "assets/drone-coding-foundations/lesson10/wing-algorithmic-blueprint-maze.svg",
        "alt": "תרשים Blueprint של מבוך עירוני עם No Fly Zone, בניינים, משתנים, פונקציה ותנאי if else",
        "caption": "לפני הקוד: מתכננים נתיב, משתנים, פונקציה ותנאי. אחרי אישור: מממשים אב־טיפוס בסימולטור City ושומרים לקראת בדיקות שיעור 11."
    },
    "videoResources": [
        {
            "title": "Wing drone delivery autonomous navigation — search suggestion",
            "url": "https://www.youtube.com/results?search_query=Wing+drone+delivery+autonomous+navigation",
            "note": "סרטון השראה קצר על ניווט משלוחים עירוני; לא חובה אם אין זמן."
        },
        {
            "title": "Flytrex drone delivery city operations — search fallback",
            "url": "https://www.youtube.com/results?search_query=Flytrex+drone+delivery+city+operations",
            "note": "חלופה להצגת עולם משלוחי הרחפנים העירוני."
        }
    ],
    "screenshotSlides": [
        {
            "title": "Wing Algorithmic Blueprint",
            "src": "assets/drone-coding-foundations/lesson10/wing-algorithmic-blueprint-maze.svg",
            "caption": "מסלול, No‑Fly Zone, משתנים, פונקציה ותנאי בתמונה אחת."
        },
        {
            "title": "פותחים DroneBlocks Code אחרי אישור",
            "src": "assets/tello-mission-lab/lesson1/open-app.png",
            "caption": "רק אחרי Screen Down Blueprint ו־Code Review."
        },
        {
            "title": "City Simulator Prototype",
            "src": "assets/tello-mission-lab/lesson1/simulator-run.png",
            "caption": "בודקים אב־טיפוס דיגיטלי — לא טיסה פיזית."
        },
        {
            "title": "Save & Share",
            "src": "assets/tello-mission-lab/lesson1/save-share.png",
            "caption": "Meeting10_Blueprint_GroupX + דף אפיון."
        }
    ],
    "instructorSlides": [
        {
            "title": "Wing Delivery Challenge",
            "body": "עומר העתידית צריכה משלוחי תרופות בעיר צפופה עם אזורי No‑Fly ובניינים.",
            "bullets": [
                "Wing",
                "City",
                "No‑Fly"
            ]
        },
        {
            "title": "Blueprint לפני קוד",
            "body": "מהנדסים לא בונים בלי שרטוט. גם קוד רחפן מורכב מתחיל בתכנון.",
            "bullets": [
                "Screen Down",
                "Paper first",
                "Approval"
            ]
        },
        {
            "title": "Decomposition",
            "body": "מפרקים את המבוך לרכיבים: משתנים, פונקציה, לולאה ותנאי.",
            "bullets": [
                "Variables",
                "Function",
                "If / Else"
            ]
        },
        {
            "title": "scanBuilding",
            "body": "פונקציה מודולרית שמקבלת sides ו־distance ומשתמשת בלולאת for לסריקה.",
            "bullets": [
                "Parameters",
                "for loop",
                "yawRight"
            ]
        },
        {
            "title": "Decision Logic",
            "body": "אם obstacleHeight נמוך — סורקים. אחרת — עולים לגובה בטוח ועוקפים.",
            "bullets": [
                "obstacleHeight",
                "safeAltitude",
                "else"
            ]
        },
        {
            "title": "City Simulator Prototype",
            "body": "בודקים בשלבים ולא מריצים מפלצת קוד אחת. שינוי פרמטר אחד בכל דיבוג.",
            "bullets": [
                "V1",
                "Debug",
                "Share"
            ]
        },
        {
            "title": "הכנה לשיעור 11",
            "body": "אוספים Blueprint ו־Share Link. בשיעור הבא נבדוק מה מהסימולטור שורד בעולם הפיזי.",
            "bullets": [
                "Sim‑to‑Reality",
                "Risk",
                "Next lesson"
            ]
        }
    ]
}
);


  Object.assign(window.DRONE_CODING_FOUNDATIONS_LESSONS[10], {
    "title": "שיעור 11: SpaceX Launchpad Testing — כיול פיזי ודיבגינג Sim‑to‑Reality",
    "subtitle": "Physical Flight Testing, Calibration Variables, VPS Drift, Runtime Debugging ו־Battery Management",
    "unit": "יחידה 4 — פרויקט ניווט אלגוריתמי",
    "concept": "מעבר מאב־טיפוס סימולטור לקוד JavaScript פיזי מכויל: מודדים סטייה, משנים משתני כיול ומריצים שוב בבטחה",
    "story": "אחרי שיעור 10, שבו הצוותים בנו Blueprint ואב־טיפוס דיגיטלי ב־City Simulator, הם עוברים לשלב Launchpad Flight Testing של SpaceX/NASA JPL. הכיתה הופכת למעבדת ניסויי טיסה: הרחפן האמיתי לא מתנהג כמו סימולטור מושלם, ולכן המהנדסים צריכים למדוד, לכייל ולדבג בלי לשבור את גוף הקוד.",
    "mission": "לטעון מהענן את Meeting10_Blueprint_GroupX, להסב אותו לגרסת כיול פיזית עם משתנים גלובליים כמו scanDistance, safeAltitude ו־loopRepetitions, לבצע הרצה פיזית קצרה ומבוקרת באזור סטרילי, למדוד Drift/סטייה, לשנות רק משתנה כיול בראש הקוד, להריץ שוב אם יש זמן וסוללה, ולשמור Meeting11_Calibrated_v2_GroupX עם Run Log ו־Share Link.",
    "commands": [
        "safety_check",
        "code_editor",
        "variable",
        "function",
        "loop",
        "takeoff",
        "sleep",
        "forward",
        "yaw",
        "flyUp",
        "land",
        "telemetry",
        "battery",
        "wifi",
        "abort",
        "debug",
        "share"
    ],
    "blocks": [
        "safety_check",
        "code_editor",
        "variable",
        "function",
        "loop",
        "takeoff",
        "sleep",
        "forward",
        "yaw",
        "flyUp",
        "land",
        "telemetry",
        "battery",
        "wifi",
        "abort",
        "debug",
        "share"
    ],
    "workspaceMode": "physical-lab",
    "physicalFlightAllowed": true,
    "essentialQuestion": "איך הופכים קוד שעבד בסימולטור לקוד פיזי אמין באמצעות מדידה, משתני כיול ודיבוג בטוח?",
    "successCriteria": [
        "אני מסביר/ה מהו Sim‑to‑Reality Gap ולמה רחפן פיזי סוטה מקוד סימולטור.",
        "אני טוען/ת את Blueprint שיעור 10 ומשדרג/ת אותו לגרסת כיול.",
        "אני משתמש/ת במשתני כיול בראש הקוד ולא משנה את גוף הפונקציה בזמן ניסוי.",
        "אני יודע/ת למה tello.sleep(2) משפר יציבות ומפחית Motion Blur.",
        "אני עובד/ת בתפקיד Driver/Navigator/Safety Observer ומחליף/ה תפקידים בין סבבים.",
        "אני מבצע/ת WiFi Handshake נכון: בית ספרי לטעינה/שיתוף, TELLO להרצה פיזית.",
        "אני מתעד/ת Run Log: ערך מתוכנן, תוצאה בפועל, סטייה, תיקון אחד.",
        "אני מנהל/ת סוללות לפי שתי קופסאות ולא משאיר/ה סוללה ברחפן."
    ],
    "realWorldUses": [
        {
            "icon": "🚀",
            "title": "SpaceX Launchpad Testing",
            "text": "לפני משימה אמיתית מבצעים ניסויי שדה קצרים, מדידה וכיול."
        },
        {
            "icon": "🔬",
            "title": "Sim‑to‑Reality Gap",
            "text": "רוח, אינרציה, תאורה ורצפה משנים את התנהגות הרחפן גם כשהקוד נכון."
        },
        {
            "icon": "🎚️",
            "title": "Algorithmic Calibration",
            "text": "משתנים כמו scanDistance מאפשרים תיקון מהיר בלי להעתיק ולשבור קוד."
        },
        {
            "icon": "🔋",
            "title": "Battery as Flight Budget",
            "text": "כל הרצה צורכת זמן סוללה מוגבל; קוד נקי ודיבוג מדורג חוסכים משאב קריטי."
        }
    ],
    "vocabulary": [
        [
            "Sim‑to‑Reality Gap",
            "הפער בין התנהגות בסימולטור לבין רחפן פיזי בכיתה."
        ],
        [
            "Calibration / כיול",
            "שינוי ערכים מדודים כדי להתאים קוד לתנאי העולם האמיתי."
        ],
        [
            "Global Calibration Variable",
            "משתנה בראש הקוד שנועד לשינוי מהיר כמו scanDistance."
        ],
        [
            "Runtime Debugging",
            "איתור בעיות שמתגלות בזמן הרצה ולא רק בסינטקס."
        ],
        [
            "VPS Drift",
            "סחיפה הנגרמת מחיישני מיקום שמתקשים לזהות רצפה חלקה/מבריקה."
        ],
        [
            "Inertia / אינרציה",
            "המשך תנועה קצר אחרי פקודת עצירה/פנייה."
        ],
        [
            "Motion Blur",
            "טשטוש/אי־יציבות בגלל צילום או פנייה לפני שהרחפן התייצב."
        ],
        [
            "WiFi Handshake",
            "מעבר מבוקר בין WiFi בית ספרי לשמירה לבין TELLO WiFi להרצה."
        ],
        [
            "Run Log",
            "טבלת ניסוי: ערכים, תוצאה, סטייה ותיקון."
        ],
        [
            "Two‑Box Battery Protocol",
            "קופסה לטעונות וקופסה לריקות; לא משאירים סוללה ברחפן."
        ]
    ],
    "safetyRules": [
        "שיעור 11 כולל טיסה פיזית רק אחרי טעינת קוד, Code Review, סימון אזור סטרילי ואישור מדריך.",
        "משקפי מגן, שיער אסוף ומגיני פרופלורים הם חובה לכל צוות מטיס.",
        "Driver מחזיק בטאבלט ומוכן ל־Abort; Navigator מודד ומתעד; Safety Observer שומר אזור נקי ומכריז רחפנים באוויר.",
        "כל הרצה פיזית קצרה ומבוקרת. אם יש סטייה משמעותית — Abort או Land, לא מנסים להציל מסלול באלתור.",
        "משנים רק משתני כיול בראש הקוד בין הרצות; לא עורכים גוף פונקציה תחת לחץ.",
        "מרחקים מהמערך הם נקודת פתיחה בלבד. אם אזור הכיתה קטן או צפוף, מקטינים ל־40–70 אינץ׳ ושומרים מרווח בטוח.",
        "לא מתחברים ל־TELLO WiFi לפני שהקוד טעון מהענן והצוות קיבל אישור מדריך.",
        "בסיום כל טיסה מנתקים סוללה ומחזירים לקופסה המתאימה; אין אחסון סוללה בתוך רחפן."
    ],
    "commonDirections": [
        [
            "Meeting10_Blueprint_GroupX",
            "קוד האב־טיפוס מהשיעור הקודם שנטען מהענן."
        ],
        [
            "let scanDistance = 50;",
            "משתנה כיול למרחק סריקה אחרי תיקון Drift."
        ],
        [
            "let safeAltitude = 110;",
            "גובה מעבר בטוח מעל מכשול, מותאם לזירה."
        ],
        [
            "let loopRepetitions = 4;",
            "מספר צלעות לסריקה מרובעת."
        ],
        [
            "function scanTarget(sides, distance)",
            "פונקציית סריקה פיזית עם פרמטרים ולולאה."
        ],
        [
            "tello.sleep(2);",
            "ייצוב לאחר תנועה למניעת סחיפה וטשטוש."
        ],
        [
            "tello.sleep(3);",
            "ייצוב ממושך אחרי המראה."
        ],
        [
            "Run Log",
            "planned / actual / drift / fix."
        ],
        [
            "Abort",
            "עצירת חירום בזמן סטייה או כניסה לאזור."
        ],
        [
            "Meeting11_Calibrated_v2_GroupX",
            "שם גרסת הכיול הסופית לשמירה ושיתוף."
        ]
    ],
    "setupSteps": [
        "טאבלטים טעונים 100%, WiFi בית ספרי ו־DroneBlocks Code פתוח.",
        "טעינת Meeting10_Blueprint_GroupX מהענן לפני מעבר ל־TELLO WiFi.",
        "רחפן Tello/Tello EDU לכל צוות, מגיני פרופלורים מורכבים וסוללה ממוספרת.",
        "אזור Safe Fly Zone מסומן בסרט צבעוני, מנחת המראה, בניין א׳ ובניין ב׳ מסומנים.",
        "דף Run Log לכל צוות עם עמודות planned / actual / drift / fix.",
        "קופסה ירוקה לסוללות מלאות וקופסה אדומה לסוללות ריקות.",
        "בדיקת תאורה ורצפה; הוספת סרטי עוגן ל־VPS אם הרצפה אחידה/מבריקה."
    ],
    "tabletTips": [
        "לשמור עותק חדש לפני שינוי קוד: Meeting11_Calibrated_v1.",
        "להוסיף Comment בראש הקוד שמתעד אילו ערכים כוילו ולמה.",
        "להשאיר את scanTarget נקייה: הפונקציה סורקת; ערכי הכיול בראש הקוד.",
        "לשנות פרמטר אחד בכל הרצה — אחרת לא יודעים מה השפיע.",
        "אחרי TELLO WiFi אין אינטרנט; לשיתוף חוזרים ל־WiFi בית ספרי.",
        "אם הטאבלט עובר אוטומטית ל־WiFi בית ספרי בזמן טיסה, להשתמש במצב טיסה ואז להפעיל WiFi ידנית ל־Tello."
    ],
    "lessonFlow": [
        {
            "minutes": "0–8",
            "title": "גשר משיעור 10",
            "teacher": "מוציא את דפי ה־Blueprint ומזכיר: היום לא מתכננים מחדש, אלא בודקים מה מהתכנון שורד בעולם הפיזי.",
            "students": "פותחים טאבלטים על WiFi בית ספרי ומאתרים Meeting10_Blueprint_GroupX."
        },
        {
            "minutes": "8–18",
            "title": "SpaceX/NASA Launchpad Story",
            "teacher": "מציג את המעבר מאב־טיפוס לניסוי שדה, ואת העובדה שקוד מושלם בסימולטור לא מבטיח טיסה מושלמת.",
            "students": "מעלים השערות: מה ישתבש במציאות?"
        },
        {
            "minutes": "18–28",
            "title": "Sim‑to‑Reality Gap",
            "teacher": "מסביר אינרציה, רוח/מזגן, VPS, רצפה מבריקה ותאורה. משתמש באנלוגיית רכבת הרים ו־Motion Blur.",
            "students": "מחברים כל בעיה לפתרון אפשרי: sleep, הקטנת מרחק, סרטי VPS."
        },
        {
            "minutes": "28–40",
            "title": "WiFi Handshake וגרסת כיול",
            "teacher": "מוביל: WiFi בית ספרי → טעינת קוד → שמירת גרסת Meeting11 → משתני כיול בראש הקוד.",
            "students": "מוסיפים scanDistance, safeAltitude, loopRepetitions ו־Comment."
        },
        {
            "minutes": "40–50",
            "title": "Code Review לפני טיסה",
            "teacher": "בודק takeoff, sleep, scanTarget, land, ושאין עריכה מסוכנת בגוף הפונקציה.",
            "students": "Navigator מקריא קוד שורה־שורה ודף Run Log מוכן."
        },
        {
            "minutes": "50–60",
            "title": "הקמת זירה ותפקידים",
            "teacher": "מסמן אזור, בודק משקפיים/מגינים/סוללות ומחלק Driver/Navigator/Safety Observer.",
            "students": "ממקמים בניינים, מודדים מרחקים ומחברים TELLO WiFi רק לאחר אישור."
        },
        {
            "minutes": "60–74",
            "title": "Launchpad Run 1",
            "teacher": "מאשר צוותים להרצה קצרה. דורש הכרזה רחפנים באוויר ומוכן לעצירת תהליך במקרה סכנה.",
            "students": "מריצים, מודדים actual מול planned ומתעדים Drift."
        },
        {
            "minutes": "74–82",
            "title": "Calibration Loop",
            "teacher": "מנחה לשנות רק משתנה כיול אחד — למשל scanDistance 60→50 או forward 100→90.",
            "students": "שומרים v2 ומריצים שוב רק אם יש זמן, סוללה ואישור."
        },
        {
            "minutes": "82–88",
            "title": "Reflection + Share",
            "teacher": "מחזיר ל־WiFi בית ספרי, אוסף Share Links ושואל מה היה הפער המרכזי מהסימולטור.",
            "students": "שומרים Meeting11_Calibrated_v2_GroupX ומשתפים."
        },
        {
            "minutes": "88–90",
            "title": "Battery shutdown",
            "teacher": "מנהל שתי קופסאות, קירור רחפנים חמים והחזרת טאבלטים.",
            "students": "מוציאים סוללות, מסדרים זירה ומחזירים ציוד."
        }
    ],
    "exercises": [
        {
            "minutes": "8–18",
            "title": "תחזית פערים",
            "prompt": "רשמו שני דברים שיכולים לגרום לרחפן אמיתי לסטות למרות שהסימולטור הצליח.",
            "check": "מופיעים רוח/מזגן, VPS, אינרציה, תאורה או סוללה."
        },
        {
            "minutes": "18–28",
            "title": "Motion Blur ו־sleep",
            "prompt": "הסבירו למה מוסיפים tello.sleep(2) אחרי תנועה או פנייה.",
            "check": "מוזכרים ייצוב, חיישנים, מניעת טשטוש או סחיפה."
        },
        {
            "minutes": "28–40",
            "title": "גרסת כיול",
            "prompt": "הוסיפו scanDistance, safeAltitude ו־loopRepetitions בראש הקוד ושמרו v1.",
            "check": "המשתנים קיימים לפני גוף המשימה."
        },
        {
            "minutes": "40–50",
            "title": "Code Review",
            "prompt": "Navigator מקריא: takeoff, sleep, scanTarget, land, ואין שינוי גוף פונקציה בזמן ניסוי.",
            "check": "המדריך מאשר לפני TELLO WiFi."
        },
        {
            "minutes": "50–60",
            "title": "צ׳קליסט זירה",
            "prompt": "מלאו: אזור ריק, מגינים, משקפיים, סוללה, תפקידים, Abort, הכרזה.",
            "check": "כל הסעיפים מסומנים לפני Run."
        },
        {
            "minutes": "60–74",
            "title": "Run Log 1",
            "prompt": "הריצו מסלול קצר ותעדו planned distance, actual result, drift direction.",
            "check": "יש מדידה/תיאור ולא רק ‘עבד’."
        },
        {
            "minutes": "74–82",
            "title": "תיקון משתנה אחד",
            "prompt": "בחרו משתנה כיול אחד לשינוי והסבירו למה דווקא הוא.",
            "check": "שונה ערך אחד בלבד ויש נימוק."
        },
        {
            "minutes": "82–88",
            "title": "שיתוף ורפלקציה",
            "prompt": "שמרו v2 וכתבו: הפער הגדול ביותר היה ___.",
            "check": "יש Share Link או תיעוד תקלה."
        },
        {
            "minutes": "88–90",
            "title": "שתי קופסאות",
            "prompt": "הוציאו סוללה מהרחפן ושייכו לקופסה הנכונה.",
            "check": "אין סוללות בתוך רחפנים באחסון."
        }
    ],
    "deliverable": "Meeting11_Calibrated_v2_GroupX: גרסת JavaScript מכוילת עם משתני כיול בראש הקוד, פונקציית scanTarget, sleep לייצוב, Run Log של לפחות הרצה אחת, תיקון משתנה אחד ו־Share Link.",
    "assessment": [
        "הצוות טען את Blueprint שיעור 10 ושמר גרסת כיול חדשה.",
        "הקוד כולל משתני כיול ברורים בראש התוכנית.",
        "הפונקציה scanTarget משתמשת בפרמטרים, לולאה ו־sleep.",
        "הצוות ביצע Code Review לפני TELLO WiFi.",
        "ההרצה הפיזית התקיימה רק אחרי צ׳קליסט ואישור מדריך.",
        "Run Log כולל ערך מתוכנן, תוצאה בפועל, סטייה ותיקון.",
        "התיקון שינה רק משתנה אחד ולא את גוף הפונקציה.",
        "נוהל סוללות ושיתוף קישור בוצעו בסיום."
    ],
    "debugging": [
        {
            "problem": "רחפן סוטה/מחליק מהנתיב",
            "fix": "להפסיק אם יש סכנה, להקטין scanDistance או forwardDistance, להוסיף סרטי VPS לרצפה, לבדוק תאורה ומזגן."
        },
        {
            "problem": "הרחפן לא מתייצב לפני פנייה/צילום",
            "fix": "להוסיף tello.sleep(2) אחרי תנועה ו־sleep(1–2) אחרי yaw."
        },
        {
            "problem": "Runtime Syntax Error",
            "fix": "Navigator בודק CamelCase, ;, (), {}, ושהפונקציה נסגרה לפני הקוד הראשי."
        },
        {
            "problem": "הטאבלט לא מתחבר ל־Tello",
            "fix": "לטעון קוד על WiFi בית ספרי, לעבור ידנית ל־TELLO WiFi; אם יש מעבר אוטומטי, מצב טיסה ואז WiFi ידני."
        },
        {
            "problem": "Share Link לא עובד אחרי טיסה",
            "fix": "לחזור ל־WiFi בית ספרי כי TELLO WiFi ללא אינטרנט."
        },
        {
            "problem": "נורת רחפן אדומה/סוללה חלשה",
            "fix": "Land/כיבוי, החלפת סוללה לפי שתי קופסאות, קירור 3 דקות אם הרחפן חם."
        },
        {
            "problem": "פרופלורים גורמים לסיבוב/נפילה",
            "fix": "לעצור, לבדוק סימוני Notch והתאמת פרופלור למנוע, לנקות מנועים."
        },
        {
            "problem": "הצוות משנה יותר מדי דברים בין הרצות",
            "fix": "להחזיר לכלל: שינוי משתנה אחד בלבד + Run Log כדי לשמור על ניסוי מדעי."
        }
    ],
    "differentiation": {
        "support": [
            "להריץ רק Takeoff → sleep → moveForward קצר → land לפני סריקה מלאה.",
            "לתת טבלת Run Log מוכנה עם ערכים מוצעים.",
            "להקטין מרחקים ל־40–60 אינץ׳ לצוותים מתחילים או זירה קטנה.",
            "לאפשר לתלמידים מתקשים להיות Navigator/Safety Observer לפני Driver."
        ],
        "extension": [
            "להוסיף משתנה stabilizationDelay ולבדוק sleep(1) מול sleep(2).",
            "להוסיף פונקציית calibrateDistance(planned, drift) בפסאודו־קוד.",
            "להשוות שתי רצפות/תאורה ולכתוב מסקנת VPS.",
            "להכין גרסת Release Candidate לשיעור 12 עם הערות קוד מסודרות."
        ]
    },
    "instructorGuide": {
        "prerequisites": "שיעור 11 יוצא מתוך שיעור 10: יש Blueprint, משתנים, פונקציות ולוגיקה בסימולטור. לא מתחילים מאפס ולא כותבים פרויקט חדש. המטרה היא להפוך אב־טיפוס לגרסת בדיקה פיזית וללמד כיול מדעי.",
        "pedagogy": [
            "להדגיש שהכישלון הפיזי אינו כישלון תלמיד — הוא נתון הנדסי. רחפן אמיתי מספק דאטה לכיול.",
            "משתני כיול הם השכבה הפדגוגית המרכזית: משנים ערך בראש הקוד במקום לשכתב לוגיקה.",
            "להקפיד על ניסוי מבוקר: שינוי אחד בכל פעם, מדידה, תיעוד, הרצה נוספת רק אם בטוח.",
            "ניהול סוללה הוא חלק מתכנות רחפנים: זמן טיסה הוא משאב מוגבל וקוד ארוך מדי שורף ניסויים.",
            "אין פשרות בטיחות. צוות שלא עומד בצ׳קליסט חוזר לסימולטור/תכנון."
        ],
        "facilitationNotes": [
            "להכין את אזור הטיסה לפני השיעור כדי לא לבזבז זמן הקנייה.",
            "להריץ צוותים בתורות ולא כולם יחד אם יש צפיפות WiFi או בטיחות.",
            "להחזיק רשימת מרחקים מומלצים לפי גודל הכיתה; לא להיצמד למספרי הדוגמה אם אינם בטוחים.",
            "להזכיר שהתוצר הוא Run Log + קוד מכויל, לא רק ‘רחפן טס’. ",
            "לצלם/לאסוף דוגמאות סטייה טובות לשימוש בשיעור 12."
        ],
        "mediaNote": "סרטון Ingenuity/SpaceX הוא השראה קצרה; אם אין זמן, להתחיל ישירות מהשוואה בין סימולטור למציאות בכיתה.",
        "exitTicket": "הכיול שעשינו היה ___. שינינו רק את המשתנה ___ כי ___."
    },
    "appWorkflowTitle": "DroneBlocks Code — SpaceX Launchpad Calibration",
    "appWorkflowNote": "מפגש 11 הוא מעבדת טיסה פיזית מבוקרת. טוענים את הקוד מהענן על WiFi בית ספרי, עוברים ל־TELLO WiFi רק אחרי אישור מדריך, מריצים קצר, מתעדים, חוזרים ל־WiFi בית ספרי ומשתפים.",
    "appWorkflow": [
        {
            "title": "Load Blueprint from Cloud",
            "detail": "על WiFi בית ספרי פותחים DroneBlocks Code וטוענים Meeting10_Blueprint_GroupX."
        },
        {
            "title": "Create Calibration Version",
            "detail": "שומרים Meeting11_Calibrated_v1 ומוסיפים scanDistance, safeAltitude ו־loopRepetitions בראש הקוד."
        },
        {
            "title": "Code Review + Safety Gate",
            "detail": "Navigator מקריא קוד; מדריך מאשר; אזור סטרילי, משקפיים, מגינים, סוללה ו־Abort מוכנים."
        },
        {
            "title": "TELLO WiFi + Launchpad Run",
            "detail": "מתחברים ל־TELLO WiFi, Safety Observer מכריז רחפנים באוויר, Driver מריץ הרצה קצרה."
        },
        {
            "title": "Run Log + One Variable Fix",
            "detail": "מודדים סטייה, משנים רק משתנה כיול אחד, ושומרים v2. מריצים שוב רק אם בטוח ויש סוללה."
        },
        {
            "title": "School WiFi + Share + Batteries",
            "detail": "חוזרים ל־WiFi בית ספרי, מפיקים Share Link, מוציאים סוללה מהרחפן וממיינים לקופסה הנכונה."
        }
    ],
    "visualDiagram": {
        "panelTitle": "🚀 Launchpad Calibration Lab",
        "chip": "Physical Lab",
        "title": "כיול פיזי: מתכנון לסביבת אמת",
        "src": "assets/drone-coding-foundations/lesson11/spacex-launchpad-calibration-zone.svg",
        "alt": "תרשים אזור טיסה פיזי בטוח עם משתני כיול, מסלול Launchpad, בניינים ותפקידי צוות",
        "caption": "הרחפן האמיתי מספק דאטה: מתכננים, מריצים קצר, מודדים Drift, משנים משתנה אחד ומריצים שוב רק אם בטוח."
    },
    "videoResources": [
        {
            "title": "NASA Ingenuity flight testing / Mars helicopter chamber — search suggestion",
            "url": "https://www.youtube.com/results?search_query=NASA+Ingenuity+flight+testing+Mars+helicopter+chamber",
            "note": "סרטון השראה קצר על ניסויי כיול לפני משימה אמיתית."
        },
        {
            "title": "Autonomous drone racing calibration — search fallback",
            "url": "https://www.youtube.com/results?search_query=autonomous+drone+racing+calibration+testing",
            "note": "חלופה להמחשת פערים פיזיים וכיול."
        }
    ],
    "screenshotSlides": [
        {
            "title": "Launchpad Calibration Zone",
            "src": "assets/drone-coding-foundations/lesson11/spacex-launchpad-calibration-zone.svg",
            "caption": "אזור סטרילי, בניינים פיזיים, Drift ומשתני כיול."
        },
        {
            "title": "פותחים DroneBlocks Code",
            "src": "assets/tello-mission-lab/lesson1/open-app.png",
            "caption": "טעינת Meeting10_Blueprint_GroupX על WiFi בית ספרי."
        },
        {
            "title": "בדיקת קוד לפני פיזי",
            "src": "assets/tello-mission-lab/lesson1/simulator-run.png",
            "caption": "Code Review והרצה קצרה/סימולטור לפני TELLO WiFi."
        },
        {
            "title": "Save & Share",
            "src": "assets/tello-mission-lab/lesson1/save-share.png",
            "caption": "Meeting11_Calibrated_v2_GroupX אחרי חזרה ל־WiFi בית ספרי."
        }
    ],
    "instructorSlides": [
        {
            "title": "SpaceX Launchpad Testing",
            "body": "היום בודקים את אב־הטיפוס משיעור 10 על רחפן אמיתי ומגלים את פער הסימולציה למציאות.",
            "bullets": [
                "Blueprint",
                "Physical test",
                "Calibration"
            ]
        },
        {
            "title": "Sim‑to‑Reality Gap",
            "body": "אינרציה, מזגן, VPS, רצפה ותאורה משפיעים על רחפן פיזי גם כשהקוד נכון.",
            "bullets": [
                "Inertia",
                "VPS",
                "Drift"
            ]
        },
        {
            "title": "Calibration Variables",
            "body": "משנים scanDistance, safeAltitude או loopRepetitions בראש הקוד — לא שוברים את גוף הפונקציה.",
            "bullets": [
                "One variable",
                "Run Log",
                "v2"
            ]
        },
        {
            "title": "sleep = ייצוב הנדסי",
            "body": "tello.sleep(2) נותן לרחפן להתייצב לפני פנייה/צילום ומפחית Motion Blur.",
            "bullets": [
                "Hover",
                "Sensors",
                "Camera"
            ]
        },
        {
            "title": "Safety Gate",
            "body": "אין Run בלי אזור סטרילי, משקפי מגן, מגינים, סוללה נעולה, תפקידים ו־Abort.",
            "bullets": [
                "Driver",
                "Navigator",
                "Observer"
            ]
        },
        {
            "title": "WiFi Handshake",
            "body": "WiFi בית ספרי לטעינה ושיתוף; TELLO WiFi להרצה; חוזרים לבית ספרי ל־Share Link.",
            "bullets": [
                "Cloud",
                "TELLO",
                "Share"
            ]
        },
        {
            "title": "סגירת מעבדה",
            "body": "Run Log, רפלקציה, שתי קופסאות סוללה והכנה לשיעור 12.",
            "bullets": [
                "Data",
                "Battery",
                "Next debug"
            ]
        }
    ]
}
);

  window.getDroneCodingFoundationsLesson = function (value) {
    const id = Number(value || 1);
    return window.DRONE_CODING_FOUNDATIONS_LESSONS.find(lesson => lesson.id === id) || window.DRONE_CODING_FOUNDATIONS_LESSONS[0];
  };
})();
