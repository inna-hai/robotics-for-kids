(function () {
  const unitNames = {
    shared: 'יחידה 1 — יסודות רחפן וסימולטור',
    code: 'יחידה 2 — רחפנים, צילום ומשימות חקר ב־JavaScript',
    logic: 'יחידה 3 — צילום, הצלה ואופטימיזציה',
    project: 'יחידה 4 — פרויקט חקר מצולם'
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
    photo: 'tello.takePhoto() — צילום',
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
    'שומרים קוד ותוצר בשם ברור: G8_Mission_Team_Version.'
  ];

  const lessons = [
    { title:'שיעור 1: היכרות, בטיחות והמראה וירטואלית ראשונה', unit:unitNames.shared, concept:'רחפן כמערכת רובוטית, ציר אנכי וסימולטור', story:'כיתה ח׳ פותחת מעבדת משימות חקר: לפני צילום, חיפוש והצלה וקוד JavaScript — בונים בסיס בטוח בסימולטור.', mission:'לבנות בסימולטור רצף בסיסי: המראה, ריחוף ונחיתה, ולהסביר למה זו בדיקת מערכת לפני כל משימת חקר.', commands:['takeoff','hover','land'] },
    { title:'שיעור 2: ניווט דו־מימדי ואתגר הריבוע', unit:unitNames.shared, concept:'Pitch / Roll / Yaw ו־Box Mission', story:'רחפן חקר צריך לכסות אזור בצורה מדויקת: פעם עם תנועה צדית ופעם עם פניות.', mission:'לתכנן Box Mission בסימולטור, להשוות Strafing מול Yaw, ולזהות תבנית חוזרת לקראת סריקה שיטתית.', commands:['takeoff','forward','right','back','left','land'] },
    { title:'שיעור 3: עבודה בענן וסימולטור Mars/City', unit:unitNames.shared, concept:'שמירה, שיתוף וניווט בסביבה מורכבת', story:'משימת החקר עוברת לעיר/מאדים: צריך לשמור קוד, לשתף תוצרים ולהתמודד עם גבהים ומכשולים.', mission:'לפתוח DroneBlocks Code/Simulator, לשמור קוד בענן, לשתף קישור ולתעד נקודת דיבוג אחת.', commands:['comment','takeoff','forward','hover','land','share'] },
    { title:'שיעור 4: לולאות ומשתנים — תשתית לסריקות חקר', unit:unitNames.shared, concept:'Loops, Variables ודפוסי סריקה', story:'סריקה טובה לא בנויה מאלתור אלא מדפוס חוזר עם פרמטרים שניתן לשנות.', mission:'לשדרג משימת ריבוע/סריקה בעזרת לולאה ומשתנה distance בסימולטור, בלי טיסה פיזית.', commands:['variable','loop','forward','yaw','land'] },
    { title:'שיעור 5: הטסה פיזית ראשונה — רחפן חקר במציאות', unit:unitNames.shared, concept:'Pre‑Flight Check, עבודת צוות והרצה פיזית קצרה', story:'הקוד פוגש את העולם הפיזי: סטיות, סוללה, רצפה ומזגן משפיעים על איכות משימת החקר.', mission:'להריץ משימת Takeoff → Hover → Land פיזית קצרה באישור מדריך, למדוד סטייה ולתעד מסקנה.', commands:['safety_check','takeoff','hover','land','debug'] },
    { title:'שיעור 6: אתגרי סריקה וחיפוש ב־JavaScript', unit:unitNames.code, concept:'Grid Navigation & Search ב־JS', story:'צוות החקר מקבל מגרש כדורגל מדומה לסריקה: טיסה אקראית לא מספיקה, צריך אלגוריתם.', mission:'לכתוב קוד JS שמבצע סריקת שטח מדומה במסלול קבוע וחסכוני.', commands:['comment','variable','loop','forward','right','left','land'] },
    { title:'שיעור 7: שליטה במצלמת הרחפן באמצעות פונקציות JavaScript', unit:unitNames.logic, concept:'tello.takePhoto(), sleep ופונקציות צילום', story:'הרחפן הופך לעין אווירית: לא רק לטוס, אלא לעצור, להתייצב ולצלם נתונים שימושיים.', mission:'לתכנן מסלול City שבו הרחפן מגיע לנקודות עניין, מרחף, מצלם וממשיך במסלול.', commands:['function','forward','hover','photo','yaw','land'] },
    { title:'שיעור 8: אתגר חיפוש והצלה בשטח פיזי מורכב', unit:unitNames.logic, concept:'יישום קוד חקר תחת אילוצי שטח', story:'אזור הכיתה הופך לאזור אסון מדומה: צריך לעקוף מכשולים, לזהות כרטיסיות ולצלם ראיות.', mission:'לבצע משימת חיפוש והצלה פיזית קצרה רק באישור מדריך, עם נקודות צילום מוגדרות.', commands:['safety_check','function','forward','photo','debug','land'] },
    { title:'שיעור 9: אופטימיזציה ויעילות אנרגטית של קוד החקר', unit:unitNames.logic, concept:'Telemetry, Battery ו־Performance', story:'משימת צילום טובה שלא מספיקה לפני סוף הסוללה — אינה משימה טובה. צריך לקצר בלי לאבד מידע.', mission:'לשפר קוד JS כך שיקצר את מסלול החקר בכ־20% בלי לוותר על נקודות צילום חובה.', commands:['variable','loop','condition','debug','share'] },
    { title:'שיעור 10: Blueprint — תרחיש חירום אמיתי', unit:unitNames.project, concept:'אפיון פרויקט חיפוש/מיפוי מבוסס תצלומים', story:'לפני הפרויקט מגדירים בעיה אמיתית: חיפוש והצלה, מיפוי חקלאי או בדיקת תשתית.', mission:'לכתוב מפרט פרויקט בטאבלט ולהתחיל שלד קוד JavaScript למשימת צילום/חקר.', commands:['comment','function','condition','project'] },
    { title:'שיעור 11: פיתוח פרויקט — מסלול חקר V1', unit:unitNames.project, concept:'פיתוח הדרגתי והרצות חלקיות', story:'בונים גרסת V1 של משימת החקר: מסלול קצר, נקודת צילום אחת, בדיקה ותיעוד.', mission:'להמיר Blueprint לקוד V1, להריץ בסימולטור ואפשרות לחלק פיזי קצר באישור מדריך.', commands:['safety_check','function','photo','project','debug'] },
    { title:'שיעור 12: בדיקות שטח, כיול מצלמה ודיבוג', unit:unitNames.project, concept:'סטיית מצלמה, מרחקים ותיקון פרמטר אחד', story:'צילום איכותי דורש מיקום, גובה והשהיה נכונים — עכשיו מכיילים את הקוד מול המציאות.', mission:'לבצע הרצות בדיקה, לבדוק איכות צילום, ולתקן רק פרמטר אחד בכל פעם.', commands:['project','photo','debug','variable','share'] },
    { title:'שיעור 13: איסוף ממצאים והכנת תוצר חקר', unit:unitNames.project, concept:'Data Collection, Evidence ו־גרסת הגשה', story:'הפרויקט הופך מקוד לתוצר חקר: תמונות, מסלול, החלטות ותיעוד דיבוג.', mission:'להשלים סט תמונות/ראיות, לסדר גרסת קוד סופית ולהכין חומר למצגת.', commands:['project','photo','comment','share'] },
    { title:'שיעור 14: ניתוח ממצאים והכנת מצגת מסכמת', unit:unitNames.project, concept:'תחקור איכות צילום והמלצות לשיפור', story:'כמו צוות שטח מקצועי, התלמידים לא רק מציגים תמונות — הם מסבירים מה רואים ומה ממליצים.', mission:'לנתח את הצילומים, להכין מצגת/סרטון קצר ולהסביר את הקוד והדיבוג.', commands:['comment','project','debug','share'] },
    { title:'שיעור 15: אירוע שיא — מצגת פרויקטי חקר', unit:unitNames.project, concept:'פיץ׳ קבוצתי, קוד JavaScript ותוצר חזותי', story:'כל צוות מציג משימת רחפן מתועדת: בעיה, קוד, צילומים, מגבלות והמלצות.', mission:'להציג קוד JavaScript, מסלול חקר, תוצר חזותי ומסקנות בפני הכיתה.', commands:['project','share'] }
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

  window.DRONE_MISSION_LAB_GRADE8_COMMAND_LABELS = commandLabels;
  window.DRONE_MISSION_LAB_GRADE8_LESSONS = lessons.map((lesson, index) => Object.assign({}, lesson, {
    id: index + 1,
    subtitle: lesson.concept,
    durationMinutes: 90,
    grade: 'כיתה ח׳',
    audience: 'כיתה ח׳',
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
      { icon:'🌾', title:'חקלאות ומיפוי', text:'סריקה שיטתית וצילום עוזרים לזהות יובש, נזק או נקודות טיפול.' },
      { icon:'🔋', title:'משימה תחת מגבלות', text:'קוד חקר טוב מאזֵן בין כיסוי שטח, איכות צילום וחיי סוללה.' }
    ],
    vocabulary: [['Syntax / סינטקס','כללי הכתיבה המחייבים של JavaScript.'], ['Variable / משתנה','שם שמחזיק ערך כמו מרחק או זווית.'], ['Function / פונקציה','קבוצת פקודות עם שם שאפשר להפעיל שוב.'], ['Parameter / פרמטר','ערך שמועבר לפונקציה ומשנה את פעולתה.'], ['Loop / לולאה','קוד שחוזר מספר פעמים או עד תנאי מסוים.'], ['If / Else','בחירה בין מסלולים לפי תנאי לוגי.'], ['Debugging','איתור ותיקון שגיאות קוד או סטיות פיזיות.']],
    safetyRules,
    commonDirections: [['Takeoff','תחילת טיסה מבוקרת.'], ['Land','סיום בטוח — חובה בסוף רצף טיסה.'], ['Function Reference','מקור שמות הפקודות באפליקציית DroneBlocks Code.'], ['Share Link','קישור הגשה למדריך.']],
    setupSteps: ['טאבלט לרוחב.', 'WiFi בית ספרי לפני פתיחת האפליקציה.', 'DroneBlocks Code / Simulator פתוח.', 'שם קובץ ברור עם שיעור וצוות.', 'בדיקת מדריך לפני טיסה פיזית.'],
    tabletTips,
    lessonFlow: makeFlow(Object.assign({ id:index + 1 }, lesson)),
    exercises: makeExercises(lesson),
    deliverable: `קוד/שלד משימת חקר מצולמת לשיעור ${index + 1} + תיעוד קצר או Share Link לפי שלב הקורס.`,
    assessment: ['רצף הקוד בטוח ומסתיים בנחיתה.', 'יש שימוש נכון במושג המרכזי של השיעור.', 'התלמיד מסביר שגיאה או שיפור אחד.', 'שם הקובץ/הגרסה ברור.', 'העבודה נשמרה או תועדה.'],
    debugging: [{ problem:'שגיאת סינטקס', fix:'בודקים סוגריים, נקודה, מרכאות ואותיות גדולות/קטנות.' }, { problem:'הרחפן/סימולטור לא עושה מה שציפינו', fix:'מבודדים פקודה אחת ומשנים פרמטר אחד בלבד.' }, { problem:'פקודה לא מוכרת', fix:'בודקים Function Reference במקום לנחש.' }, { problem:'שמירה לא עובדת', fix:'בודקים WiFi בית ספרי ולא WiFi של הרחפן.' }],
    differentiation: { support:['לתת שלד קוד עם חוסרים להשלמה.', 'לאפשר פסאודו־קוד לפני JavaScript מלא.', 'לעבוד בזוג Driver/Navigator.'], extension:['להוסיף פונקציה כללית יותר.', 'לכתוב Comment איכותי לכל שלב.', 'להשוות שתי גרסאות לפי מספר שורות/אמינות.'] },
    instructorGuide: { prerequisites:'להיצמד לרצף הסילבוס: מפגשים 1–5 משותפים לכל המסלולים, וממפגש 6 מתחיל מסלול כיתה ח׳: סריקה, צילום, חיפוש והצלה ואופטימיזציה ב־JavaScript.', pedagogy:['להדגיש שסינטקס אינו המלצה אלא דרישה מבנית.', 'לא להפוך את האתר לעורך קוד מלא; העבודה המרכזית היא ב־DroneBlocks Code בטאבלט.', 'לחבר כל קוד לתוצר חקר חזותי: צילום, ראיה, ממצא או המלצה.', 'לשמור על מודל היברידי: דף תלמיד, שקופיות נקיות ומערך מדריך.'], exitTicket:'דיוק סינטקס חשוב במשימת צילום רחפן כי ___.' },
    appWorkflowTitle: 'עבודה ב־DroneBlocks Code בטאבלט',
    appWorkflowNote: 'האתר מארגן את המשימה, הרצף וההגשה. את הקוד כותבים ומריצים באפליקציית DroneBlocks Code / סימולטור לפי השיעור.',
    appWorkflow: [
      { title:'פתיחת סביבת עבודה', detail:'פתחו DroneBlocks Code על WiFi בית ספרי, ודאו שאתם בשיעור הנכון ושמרו שם קובץ ברור.' },
      { title:'קריאת רצף המשימה', detail:`עברו על רצף הפקודות: ${lesson.commands.map(c => commandLabels[c] || c).join(' → ')}.` },
      { title:'כתיבה והרצה', detail:'כתבו את הקוד/שלד הקוד בטאבלט, הריצו בסימולטור או פיזית רק כשמותר ומאושר.' },
      { title:'דיבוג ושיתוף', detail:'תקנו פרמטר אחד בכל פעם, הוסיפו Comment קצר ושמרו/שתפו קישור למדריך.' }
    ],
    visualDiagram: { title:'Drone Mission Lab', caption: lesson.mission, chip:index + 1 >= 6 ? 'JavaScript' : 'סימולטור/בסיס', panelTitle:'💻 תדריך קוד רחפנים' },
    instructorSlides: [
      { title:'הקוד הוא תוכנית הטיסה', body:'כל פקודה ב־JavaScript משפיעה על מערכת פיזית ולכן הדיוק קריטי.', bullets:['סינטקס', 'בטיחות', 'דיבוג'] },
      { title:'עובדים בטאבלט', body:'DroneBlocks Code הוא כלי העבודה המרכזי; האתר מספק תדריך, מצגת ומערך.', bullets:['Function Reference', 'Save/Share', 'Simulator first'] },
      { title:'משימת היום', body:lesson.mission, bullets:lesson.commands.map(c => commandLabels[c] || c).slice(0,5) }
    ]
  }));

  window.getDroneMissionLabGrade8Lesson = function (value) {
    const id = Number(value || 1);
    return window.DRONE_MISSION_LAB_GRADE8_LESSONS.find(lesson => lesson.id === id) || window.DRONE_MISSION_LAB_GRADE8_LESSONS[0];
  };
})();
