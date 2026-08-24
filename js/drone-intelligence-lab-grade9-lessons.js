(function () {
  const unitNames = {
    shared: 'יחידה 1 — יסודות רחפן וסימולטור',
    code: 'יחידה 2 — לוגיקה חכמה וקבלת החלטות',
    logic: 'יחידה 3 — מיפוי, אילוצים וביצועים',
    project: 'יחידה 4 — Drone Intelligence Project'
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
    photo: 'tello.takePhoto() — צילום/תיעוד',
    comment: '// comment — הערת קוד',
    share: 'Share Link — שיתוף קוד ותוצר',
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
    'שומרים קוד ותוצר בשם ברור: G9_Intelligence_Team_Version.'
  ];

  const lessons = [
    { title:'שיעור 1: היכרות, בטיחות והמראה וירטואלית ראשונה', unit:unitNames.shared, concept:'רחפן כמערכת רובוטית, ציר אנכי וסימולטור', story:'כיתה ט׳ עתודה פותחת מעבדת מודיעין רחפנים: לפני משימות חכמות וניתוח שטח, בונים בסיס בטוח ומדויק בסימולטור.', mission:'לבנות בסימולטור רצף בסיסי: המראה, ריחוף ונחיתה, ולהסביר למה זו בדיקת מערכת לפני משימה חכמה.', commands:['takeoff','hover','land'] },
    { title:'שיעור 2: ניווט דו־מימדי ואתגר הריבוע', unit:unitNames.shared, concept:'Pitch / Roll / Yaw ו־Box Mission', story:'רחפן מודיעין צריך לנווט במדויק לפני שהוא מקבל החלטות: קודם מסלול בסיסי, אחר כך לוגיקה.', mission:'לתכנן Box Mission בסימולטור, להשוות שיטות ניווט ולזהות דפוס חוזר לקראת אלגוריתם חכם.', commands:['takeoff','forward','right','back','left','land'] },
    { title:'שיעור 3: עבודה בענן וסימולטור Mars/City', unit:unitNames.shared, concept:'שמירה, שיתוף וניווט בסביבה מורכבת', story:'משימת מודיעין דורשת תיעוד, גרסאות ויכולת לשתף קוד — לא רק להריץ ולשכוח.', mission:'לפתוח DroneBlocks Code/Simulator, לשמור קוד בענן, לשתף קישור ולתעד נקודת דיבוג אחת.', commands:['comment','takeoff','forward','hover','land','share'] },
    { title:'שיעור 4: לולאות ומשתנים — תשתית לאלגוריתמים חכמים', unit:unitNames.shared, concept:'Loops, Variables ופרמטרים דינמיים', story:'משימה חכמה מתחילה בקוד גמיש: משתנים ולולאות מאפשרים לשנות התנהגות בלי לשכתב הכול.', mission:'לשדרג משימת ריבוע/סריקה בעזרת לולאה ומשתנה distance בסימולטור, בלי טיסה פיזית.', commands:['variable','loop','forward','yaw','land'] },
    { title:'שיעור 5: הטסה פיזית ראשונה — בדיקת מערכת חכמה', unit:unitNames.shared, concept:'Pre‑Flight Check, עבודת צוות והרצה פיזית קצרה', story:'הקוד פוגש את המציאות: סטייה, סוללה ותנאי שטח הם נתונים שצריך למדוד, לא להתעלם מהם.', mission:'להריץ משימת Takeoff → Hover → Land פיזית קצרה באישור מדריך, למדוד סטייה ולתעד נתון.', commands:['safety_check','takeoff','hover','land','debug'] },
    { title:'שיעור 6: לוגיקה אלגוריתמית מורכבת וקבלת החלטות דינמית', unit:unitNames.code, concept:'Nested If / Boolean Variables / Decision Logic', story:'רחפן חכם לא רק מבצע מסלול — הוא בוחר פעולה לפי תנאי שטח ומשתנים לוגיים.', mission:'לבנות קוד JS בסימולטור Mars שמנתב את הרחפן לפי משוב לוגי משתנה.', commands:['variable','condition','forward','right','left','land'] },
    { title:'שיעור 7: סריקה תלת־ממדית ומיפוי גבהים דינמי', unit:unitNames.logic, concept:'3D Scanning, Altitude ו־Yaw', story:'הרחפן ממפה מבנה גבוה: צריך לשלב גובה, סיבוב ותנועה כדי לראות שטח בתלת־ממד.', mission:'לכתוב קוד JS לסריקה הליקלית/מדורגת סביב בניין בסימולטור City.', commands:['function','variable','loop','forward','yaw','land'] },
    { title:'שיעור 8: אתגר מכשולים דינמיים והתמודדות עם אילוצים', unit:unitNames.logic, concept:'Dynamic Constraints, Versioning ו־Debugging מתקדם', story:'השטח משתנה תוך כדי בדיקה: מכשול זז, נתיב נחסם, והצוות צריך לעדכן אלגוריתם במהירות.', mission:'להתאים אלגוריתם JS תוך זמן מוגבל לתרחיש שטח משתנה, בלי לשבור בטיחות.', commands:['condition','variable','debug','project','share'] },
    { title:'שיעור 9: ניתוח יעילות קוד ואופטימיזציית משאבים', unit:unitNames.logic, concept:'Performance Tuning, Battery ו־Telemetry', story:'שני אלגוריתמים יכולים לפתור אותה משימה — אבל אחד חסכוני, קצר ואמין יותר.', mission:'להשוות שני אלגוריתמים לפי זמן, צריכת סוללה, שורות קוד ואמינות.', commands:['variable','loop','condition','debug','share'] },
    { title:'שיעור 10: Blueprint — מעבדה חכמה בשטח', unit:unitNames.project, concept:'Drone Intelligence Project Blueprint', story:'לפני פרויקט מתקדם מגדירים בעיית שטח: אבטחת מתחם, מיפוי נזקי אסון או בדיקת אזור סגור.', mission:'לכתוב מסמך אפיון ושלד קוד JavaScript לפתרון מבוסס נתונים.', commands:['comment','function','condition','project'] },
    { title:'שיעור 11: פיתוח פרויקט — אבטיפוס מודיעין V1', unit:unitNames.project, concept:'Prototype, Partial Runs ו־Data Points', story:'הצוות בונה גרסה ראשונה של משימה חכמה: יעד אחד, תנאי אחד, מדד הצלחה אחד.', mission:'להמיר Blueprint לקוד V1, להריץ בסימולטור ואפשרות לחלק פיזי קצר באישור מדריך.', commands:['safety_check','function','condition','project','debug'] },
    { title:'שיעור 12: בדיקות היתכנות, סטיות חיישנים ודיבוג', unit:unitNames.project, concept:'Sensor Drift, Physical Calibration ו־Runtime Debugging', story:'מערכת חכמה חייבת להתמודד עם נתונים לא מושלמים: סטייה, מדידה, תיקון והרצה חוזרת.', mission:'לבצע בדיקות היתכנות, לתעד סטייה ולתקן רק פרמטר/תנאי אחד בכל פעם.', commands:['project','debug','variable','condition','share'] },
    { title:'שיעור 13: איסוף טלמטריה והשוואת גרסאות', unit:unitNames.project, concept:'Telemetry Log, Version Comparison ו־Reliability', story:'כדי להחליט איזו גרסה טובה יותר, לא מסתפקים בתחושה — מודדים זמן, סוללה ודיוק.', mission:'להשוות שתי גרסאות קוד לפי נתוני ביצוע ולבחור Release Candidate.', commands:['project','debug','comment','share'] },
    { title:'שיעור 14: ניתוח נתונים מתקדם והכנת דוח טכנולוגי חזותי', unit:unitNames.project, concept:'Data Report, Visual Evidence ו־Technical Reasoning', story:'הפרויקט הופך לדוח מקצועי: תמונות, טלמטריה, יעילות אלגוריתמית והמלצה טכנולוגית.', mission:'לעבד נתוני משימה למצגת פתרון חכמה עם הסבר קוד, גרפים/מדדים ומסקנות.', commands:['comment','project','debug','share'] },
    { title:'שיעור 15: אירוע שיא — פיץ׳ טכנולוגי של Drone Intelligence', unit:unitNames.project, concept:'Technical Pitch, Demo ו־Data‑Driven Insight', story:'כל צוות מציג פתרון רחפן חכם: בעיה, אלגוריתם, נתונים, מגבלות והמלצה לשיפור.', mission:'להציג פרויקט רחפן חכם כולל קוד JavaScript, תיעוד שטח, השוואת נתונים ותובנה הנדסית.', commands:['project','share'] }
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

  window.DRONE_INTELLIGENCE_LAB_GRADE9_COMMAND_LABELS = commandLabels;
  window.DRONE_INTELLIGENCE_LAB_GRADE9_LESSONS = lessons.map((lesson, index) => Object.assign({}, lesson, {
    id: index + 1,
    subtitle: lesson.concept,
    durationMinutes: 90,
    grade: 'כיתה ט׳ עתודה',
    audience: 'כיתה ט׳ עתודה',
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
      { icon:'🚑', title:'חיפוש והצלה', text:'רחפן מצלם אזור מסוכן לפני כניסת צוותים ומספק ראיות מהשטח.' },
      { icon:'🌾', title:'חקלאות ומיפוי', text:'סריקה שיטתית ומודיעין עוזרים לזהות יובש, נזק או נקודות טיפול.' },
      { icon:'🔋', title:'משימה תחת מגבלות', text:'קוד חקר טוב מאזֵן בין כיסוי שטח, איכות צילום וחיי סוללה.' }
    ],
    vocabulary: [['Syntax / סינטקס','כללי הכתיבה המחייבים של JavaScript.'], ['Variable / משתנה','שם שמחזיק ערך כמו מרחק או זווית.'], ['Function / פונקציה','קבוצת פקודות עם שם שאפשר להפעיל שוב.'], ['Parameter / פרמטר','ערך שמועבר לפונקציה ומשנה את פעולתה.'], ['Loop / לולאה','קוד שחוזר מספר פעמים או עד תנאי מסוים.'], ['If / Else','בחירה בין מסלולים לפי תנאי לוגי.'], ['Debugging','איתור ותיקון שגיאות קוד או סטיות פיזיות.']],
    safetyRules,
    commonDirections: [['Takeoff','תחילת טיסה מבוקרת.'], ['Land','סיום בטוח — חובה בסוף רצף טיסה.'], ['Function Reference','מקור שמות הפקודות באפליקציית DroneBlocks Code.'], ['Share Link','קישור הגשה למדריך.']],
    setupSteps: ['טאבלט לרוחב.', 'WiFi בית ספרי לפני פתיחת האפליקציה.', 'DroneBlocks Code / Simulator פתוח.', 'שם קובץ ברור עם שיעור וצוות.', 'בדיקת מדריך לפני טיסה פיזית.'],
    tabletTips,
    lessonFlow: makeFlow(Object.assign({ id:index + 1 }, lesson)),
    exercises: makeExercises(lesson),
    deliverable: `קוד/שלד משימת מודיעין רחפן לשיעור ${index + 1} + תיעוד קצר או Share Link לפי שלב הקורס.`,
    assessment: ['רצף הקוד בטוח ומסתיים בנחיתה.', 'יש שימוש נכון במושג המרכזי של השיעור.', 'התלמיד מסביר שגיאה או שיפור אחד.', 'שם הקובץ/הגרסה ברור.', 'העבודה נשמרה או תועדה.'],
    debugging: [{ problem:'שגיאת סינטקס', fix:'בודקים סוגריים, נקודה, מרכאות ואותיות גדולות/קטנות.' }, { problem:'הרחפן/סימולטור לא עושה מה שציפינו', fix:'מבודדים פקודה אחת ומשנים פרמטר אחד בלבד.' }, { problem:'פקודה לא מוכרת', fix:'בודקים Function Reference במקום לנחש.' }, { problem:'שמירה לא עובדת', fix:'בודקים WiFi בית ספרי ולא WiFi של הרחפן.' }],
    differentiation: { support:['לתת שלד קוד עם חוסרים להשלמה.', 'לאפשר פסאודו־קוד לפני JavaScript מלא.', 'לעבוד בזוג Driver/Navigator.'], extension:['להוסיף פונקציה כללית יותר.', 'לכתוב Comment איכותי לכל שלב.', 'להשוות שתי גרסאות לפי מספר שורות/אמינות.'] },
    instructorGuide: { prerequisites:'להיצמד לרצף הסילבוס: מפגשים 1–5 משותפים לכל המסלולים, וממפגש 6 מתחיל מסלול כיתה ט׳ עתודה: סריקה, צילום, חיפוש והצלה ואופטימיזציה ב־JavaScript.', pedagogy:['להדגיש שסינטקס אינו המלצה אלא דרישה מבנית.', 'לא להפוך את האתר לעורך קוד מלא; העבודה המרכזית היא ב־DroneBlocks Code בטאבלט.', 'לחבר כל קוד לתוצר חקר חזותי: צילום, ראיה, ממצא או המלצה.', 'לשמור על מודל היברידי: דף תלמיד, שקופיות נקיות ומערך מדריך.'], exitTicket:'דיוק סינטקס חשוב במשימת משימת מודיעין רחפן כי ___.' },
    appWorkflowTitle: 'עבודה ב־DroneBlocks Code בטאבלט',
    appWorkflowNote: 'האתר מארגן את המשימה, הרצף וההגשה. את הקוד כותבים ומריצים באפליקציית DroneBlocks Code / סימולטור לפי השיעור.',
    appWorkflow: [
      { title:'פתיחת סביבת עבודה', detail:'פתחו DroneBlocks Code על WiFi בית ספרי, ודאו שאתם בשיעור הנכון ושמרו שם קובץ ברור.' },
      { title:'קריאת רצף המשימה', detail:`עברו על רצף הפקודות: ${lesson.commands.map(c => commandLabels[c] || c).join(' → ')}.` },
      { title:'כתיבה והרצה', detail:'כתבו את הקוד/שלד הקוד בטאבלט, הריצו בסימולטור או פיזית רק כשמותר ומאושר.' },
      { title:'דיבוג ושיתוף', detail:'תקנו פרמטר אחד בכל פעם, הוסיפו Comment קצר ושמרו/שתפו קישור למדריך.' }
    ],
    visualDiagram: { title:'Drone Intelligence Lab', caption: lesson.mission, chip:index + 1 >= 6 ? 'JavaScript' : 'סימולטור/בסיס', panelTitle:'💻 תדריך קוד רחפנים' },
    instructorSlides: [
      { title:'הקוד הוא תוכנית הטיסה', body:'כל פקודה ב־JavaScript משפיעה על מערכת פיזית ולכן הדיוק קריטי.', bullets:['סינטקס', 'בטיחות', 'דיבוג'] },
      { title:'עובדים בטאבלט', body:'DroneBlocks Code הוא כלי העבודה המרכזי; האתר מספק תדריך, מצגת ומערך.', bullets:['Function Reference', 'Save/Share', 'Simulator first'] },
      { title:'משימת היום', body:lesson.mission, bullets:lesson.commands.map(c => commandLabels[c] || c).slice(0,5) }
    ]
  }));

  window.getDroneIntelligenceLabGrade9Lesson = function (value) {
    const id = Number(value || 1);
    return window.DRONE_INTELLIGENCE_LAB_GRADE9_LESSONS.find(lesson => lesson.id === id) || window.DRONE_INTELLIGENCE_LAB_GRADE9_LESSONS[0];
  };
})();
