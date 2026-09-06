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
    sleep: 'tello.sleep(seconds) — השהיית ייצוב',
    flyUp: 'tello.flyUp(cm) — עלייה בציר האנכי',
    flyDown: 'tello.flyDown(cm) — ירידה בציר האנכי',
    land: 'tello.land() — נחיתה',
    flyForward: 'tello.flyForward(cm) — טיסה קדימה',
    flyBackward: 'tello.flyBackward(cm) — טיסה אחורה',
    flyRight: 'tello.flyRight(cm) — טיסה ימינה / Strafing',
    flyLeft: 'tello.flyLeft(cm) — טיסה שמאלה / Strafing',
    yawRight: 'tello.yawRight(degrees) — סבסוב ימינה',
    yawLeft: 'tello.yawLeft(degrees) — סבסוב שמאלה',
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
    { title:'שיעור 1: סריקת כור וירטואלית — בטיחות, סינטקס וכיול גובה', unit:unitNames.shared, concept:'Flying Sensors, Industrial Syntax וציר אנכי בסימולטור', story:'כיתה ט׳ עתודה נכנסת לתפקיד מהנדסי בקרה ורובוטיקה בסוכנות IAEA: רחפן תעשייתי צריך לסרוק ליבת כור וירטואלית בסביבה שאינה נגישה לבני אדם, ולכן תוכנית הטיסה חייבת להיות מדויקת לפני כל הרצה.', mission:'לכתוב ב־DroneBlocks Code בטאבלט משימת JavaScript סימולטיבית בלבד: המראה, השהיית ייצוב, עלייה לגובה מדידה, השהייה לקריאת חיישן, ירידה מדורגת ונחיתה בטוחה.', commands:['takeoff','sleep','flyUp','sleep','flyDown','land','share'] },
    { title:'שיעור 2: Thermal Shield Box Mission — ניווט דו־מימדי, פניות והשוואת אלגוריתמים', unit:unitNames.shared, concept:'2D Flight Physics, Pitch/Roll/Yaw, Strafing מול Yaw', story:'צוותי כיתה ט׳ עתודה פועלים כמהנדסי פיתוח בחברת Perceptual Robotics ומקבלים משימת חירום: לסרוק גג מפעל פטרוכימי במסלול ריבועי מדויק כדי לאתר דליפה סמויה בצילום תרמי.', mission:'לבנות ב־DroneBlocks Code שתי גרסאות JavaScript לאותו ריבוע 60 אינץ׳ בסימולטור Minimal Grid: Strafing Box ששומר על כיוון מצלמה קבוע, מול Yaw Box שמסובב את האף בכל פינה — ואז להשוות יעילות, בטיחות וזווית חיישן.', commands:['takeoff','sleep','flyForward','flyRight','flyBackward','flyLeft','yawRight','land','share'] },
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

  const lessonOneFinal = {
    subtitle: 'Flying Sensors, Industrial Syntax, Minimal Grid וכיול אנכי בשיטה מטרית',
    concept: 'Flying Sensors, Industrial Syntax וציר אנכי בסימולטור בשיטה מטרית',
    story: 'כיתה ט׳ עתודה נכנסת לתפקיד מהנדסי בקרה ורובוטיקה בסוכנות IAEA: רחפן תעשייתי מוגן־כלוב בסגנון Flyability Elios צריך לסרוק ליבת כור וירטואלית בסביבה שאינה נגישה לבני אדם. לכן תוכנית הטיסה חייבת להיכתב מראש ב־JavaScript מדויק ולהיבדק בסימולטור בלבד.',
    mission: 'לכתוב ב־DroneBlocks Code בטאבלט משימת JavaScript סימולטיבית בלבד ב־Minimal Grid: המראה, השהיית ייצוב, עלייה לגובה 80 ס״מ, סריקת שכבה נוספת בגובה 120 ס״מ, ירידה מדורגת ל־60 ס״מ ונחיתה בטוחה.',
    workspaceMode: 'droneblocks-app',
    physicalFlightAllowed: false,
    presentationMode: 'focused',
    essentialQuestion: 'איך הופכים רחפן מצעצוע נשלט־ידנית לחיישן מעופף שמבצע תוכנית טיסה אוטונומית, בטוחה ומדויקת בסביבה מסוכנת?',
    successCriteria: [
      'אני מסביר/ה למה במפגש 1 עובדים בסימולטור בלבד וללא רחפן פיזי.',
      'אני פותח/ת DroneBlocks Code בטאבלט, מתחבר/ת לחשבון ושומר/ת קובץ בשם Reactor_Survey_GroupX.',
      'אני כותב/ת פקודות JavaScript בסיסיות לרחפן: takeoff, sleep, flyUp, flyDown, land.',
      'אני משתמש/ת במידות מטריות: 80 ס״מ, 120 ס״מ וירידה של 60 ס״מ.',
      'אני מזהה שגיאות סינטקס נפוצות כמו CamelCase, סוגריים ונקודה־פסיק.',
      'אני מגיש/ה Share Link או תיעוד קוד של משימת סריקת הגבהים הווירטואלית.'
    ],
    realWorldUses: [
      { icon:'☢️', title:'בדיקת מתקני אנרגיה מסוכנים', text:'רחפנים מוגני־כלוב כמו Flyability Elios משמשים לסריקת אזורים שבהם אדם לא יכול להיכנס בבטחה.' },
      { icon:'🧠', title:'Flying Sensors', text:'רחפן חכם אינו רק מצלמה באוויר: הוא פלטפורמת רובוטיקה שאוספת מידע לפי תוכנית טיסה.' },
      { icon:'🧪', title:'סימולציה לפני מציאות', text:'במערכות רובוטיות אמיתיות בודקים קוד בסביבה וירטואלית לפני שמסכנים ציוד או אנשים.' }
    ],
    vocabulary: [
      ['Flying Sensor / חיישן מעופף','רחפן המשמש כפלטפורמת מדידה ואיסוף נתונים, לא רק ככלי טיסה.'],
      ['Industrial Syntax / סינטקס תעשייתי','דיוק כתיבה מחייב: המחשב קורא כל תו, ולא מבין כוונות או “בערך”.'],
      ['CamelCase','שיטת כתיבה הרגישה לאותיות גדולות/קטנות; takeoff שונה מ־Takeoff.'],
      ['VPS / Vision Positioning System','מערכת מיצוב אופטית בתחתית הרחפן המסייעת ליציבות ולזיהוי גובה/רצפה.'],
      ['IMU','חיישנים אינרציאליים שמסייעים לרחפן להבין זווית, תאוצה ויציבות.'],
      ['tello.sleep(seconds)','פקודת המתנה שמאפשרת לרחפן להתייצב לפני הפקודה הבאה.'],
      ['Altitude / גובה','מיקום הרחפן בציר האנכי; בשיעור הזה עובדים בסנטימטרים.'],
      ['Share Link','קישור שמאפשר למדריך לבדוק את גרסת הקוד שנשמרה בענן.']
    ],
    safetyRules: [
      'מפגש 1 הוא סימולטור בלבד — לא מחברים רחפן, לא מכניסים סוללה ולא מפעילים מנועים.',
      'רחפן ההדגמה בכיתה נשאר כבוי וללא סוללה; משתמשים בו רק לזיהוי CPU, מצלמה, VPS ו־IMU.',
      'קוד טיסה חייב להתחיל בהמראה מבוקרת ולהסתיים ב־tello.land(); גם בסימולטור.',
      'אין מריצים קוד שלא נשמר או שלא נבדק ברצף קריאה קצר לפני Run.',
      'שגיאת סינטקס היא עצירת בטיחות: מתקנים אותה לפני שמוסיפים פקודות חדשות.',
      'אם הסימולטור מתנהג מוזר — עוצרים, Reset, ואז משנים פרמטר אחד בלבד.'
    ],
    commonDirections: [
      ['tello.takeoff();','המראה וירטואלית מבוקרת — תחילת תוכנית הטיסה.'],
      ['tello.sleep(3);','המתנה להתייצבות לפני שינוי גובה או קריאת “חיישן”.'],
      ['tello.flyUp(80);','עלייה לגובה 80 ס״מ — חיישן טמפרטורה אמצעי בכור הווירטואלי.'],
      ['tello.flyUp(120);','עלייה לגובה 120 ס״מ — חיישן קרינת Gamma עליון.'],
      ['tello.flyDown(60);','ירידה מדורגת מ־120 ס״מ ל־60 ס״מ.'],
      ['tello.land();','סיום בטוח של המשימה.'],
      ['Share Link','שמירת המשימה בענן והגשה למדריך.']
    ],
    setupSteps: [
      'טאבלטים טעונים, במצב אופקי, מחוברים ל־WiFi בית ספרי עם אינטרנט.',
      'DroneBlocks Code פתוח; התלמידים מחוברים לחשבון אישי או קבוצתי.',
      'פותחים קובץ חדש בשם Reactor_Survey_GroupX או G9_Reactor_Survey_GroupX.',
      'עוברים ל־Flight Simulator / Minimal Grid בלבד.',
      'רחפן Tello EDU פיזי, אם מוצג בכיתה, נשאר כבוי וללא סוללה.'
    ],
    tabletTips: [
      'עובדים ב־DroneBlocks Code, לא בבלוקים.',
      'פותחים את האפליקציה על WiFi בית ספרי כדי לאפשר Login, שמירה ו־Share Link.',
      'לפני כתיבה בודקים את שם הפקודה ב־Function Reference.',
      'שומרים גרסה ראשונית לפני ההרצה הראשונה.',
      'בכל דיבוג משנים רק דבר אחד: אות, סוגריים, מספר או שורה אחת.',
      'אם הסימולטור לא נטען — בודקים WiFi בית ספרי, סוגרים ופותחים מחדש את האפליקציה.'
    ],
    lessonFlow: [
      { minutes:'0–5', title:'פתיחת Drone Intelligence Lab', teacher:'מציג את מסגרת הקורס: רחפנים כחיישנים מעופפים ומערכות אוטונומיות, לא צעצועי שלט.', students:'פותחים טאבלטים, מתיישבים בזוגות Driver/Navigator ומנסחים מה רחפן יכול למדוד.' },
      { minutes:'5–15', title:'סיפור מסגרת — IAEA ופוקושימה', teacher:'מציג משימת סריקה בכור מסוכן ואת ההשראה מרחפני Flyability Elios מוגני־כלוב. מדגיש למה נדרשת תוכנית טיסה מראש.', students:'מזהים למה אי אפשר לאלתר או לשלוט ידנית בסביבה מסוכנת.' },
      { minutes:'15–20', title:'הדגמת רחפן כבוי וחיישנים', teacher:'מציג Tello EDU כבוי וללא סוללה: CPU, מצלמה/VPS ו־IMU. מדגיש שאין הטסה פיזית היום.', students:'מסמנים בדף עזר רכיב אחד ותפקידו במשימה אוטונומית.' },
      { minutes:'20–30', title:'DroneBlocks Code, Login ושמירה בענן', teacher:'מוביל כניסה לחשבון, פתיחת קובץ Reactor_Survey_GroupX ושמירה ראשונית.', students:'מתחברים, פותחים קובץ חדש ושומרים לפני כתיבת הקוד.' },
      { minutes:'30–40', title:'Industrial Syntax — קוד מדויק או אין משימה', teacher:'מדגים takeoff תקין מול שגיאות Tello.Takeoff / takeOff / חסר ; ומסביר CamelCase.', students:'מסמנים בקוד לדוגמה את tello, הנקודה, שם הפונקציה, הסוגריים והנקודה־פסיק.' },
      { minutes:'40–55', title:'אתגר 1 — המראת הכיול הראשונה', teacher:'מלווה כתיבת קוד המראה, sleep, flyUp(80), sleep ונחיתה בסימולטור Minimal Grid.', students:'כותבים ומריצים את גרסת הכיול הראשונה לגובה 80 ס״מ.' },
      { minutes:'55–75', title:'אתגר 2 — סורק הקרינה הדו־שלבי', teacher:'מנחה הרחבה ל־flyUp(120), sleep, flyDown(60), sleep, land; עוצר להדגיש למה לא מדלגים על sleep.', students:'מריצים גרסה מלאה, מתקנים שגיאת סינטקס אחת אם קיימת ומשווים לגרסה הראשונה.' },
      { minutes:'75–82', title:'דיון דיבוג קצר — למה sleep קריטי?', teacher:'שואל מה יקרה אם אין sleep בין עלייה לירידה, ומחבר ייצוב חיישנים לפער Sim‑to‑Reality.', students:'כותבים הערת קוד אחת שמסבירה למה הוסיפו השהייה.' },
      { minutes:'82–90', title:'שמירה, Share Link וסגירה', teacher:'אוסף קישורים/צילומי מסך, מזכיר תחזוקת טאבלטים וכרטיס יציאה.', students:'שומרים, משתפים קישור ומשלימים: “דיוק סינטקס חשוב כי...”' }
    ],
    exercises: [
      { minutes:'20–30', title:'קובץ משימה בענן', prompt:'פתחו קובץ חדש בשם Reactor_Survey_GroupX ושמרו אותו לפני כתיבת הקוד.', check:'הקובץ קיים ושמור בשם ברור.' },
      { minutes:'30–40', title:'ציד סינטקס', prompt:'השוו בין tello.takeoff(); לבין Tello.Takeoff(); וסמנו מה ישבור את הקוד.', check:'התלמיד מזהה אותיות גדולות/קטנות, נקודה, סוגריים ונקודה־פסיק.' },
      { minutes:'40–55', title:'אתגר 1 — כיול גובה 80 ס״מ', prompt:'כתבו קוד המראה, המתנה 3 שניות, flyUp(80), המתנה 5 שניות ונחיתה.', check:'הקוד רץ בסימולטור ומסתיים ב־tello.land();' },
      { minutes:'55–75', title:'אתגר 2 — סריקה דו־שלבית 120/60 ס״מ', prompt:'הרחיבו את הקוד ל־flyUp(120), sleep(3), flyDown(60), sleep(2), land.', check:'יש שתי נקודות מדידה, השהיות ברורות ונחיתה.' },
      { minutes:'60–70', title:'דיבוג שגיאת אות אחת', prompt:'צרו בכוונה שגיאת אות גדולה אחת, קראו את השגיאה בקונסולה ותקנו.', check:'התלמיד יודע להסביר מה הייתה השגיאה.' },
      { minutes:'72–82', title:'הערת מהנדס', prompt:'הוסיפו הערת // שמסבירה למה יש sleep לפני שינוי גובה.', check:'ההערה מחברת ייצוב חיישנים לרצף הקוד.' },
      { minutes:'82–90', title:'הגשה', prompt:'שמרו גרסה אחרונה ושתפו Link/צילום מסך למדריך.', check:'התוצר ניתן לפתיחה ובדיקה.' }
    ],
    deliverable: 'Share Link או צילום מסך לקובץ Reactor_Survey_GroupX הכולל שתי משימות סריקה אנכית בסימולטור Minimal Grid + הערת קוד אחת על חשיבות sleep.',
    assessment: [
      'הקוד כולל takeoff בתחילת המשימה ו־land בסופה.',
      'פקודות flyUp/flyDown מקבלות מספרים תקינים בסנטימטרים.',
      'יש לפחות שתי פקודות sleep במקומות שמייצגים ייצוב או קריאת חיישן.',
      'התלמיד מזהה ומתקן שגיאת CamelCase/סוגריים/נקודה־פסיק אחת.',
      'המשימה נשמרה בשם ברור והוגשה למדריך.'
    ],
    debugging: [
      { problem:'הסימולטור לא זז או מציג שגיאה אדומה', fix:'בודקים שהפקודה כתובה בדיוק tello.takeoff(); ולא Tello.Takeoff או takeOff. JavaScript רגיש לאותיות.' },
      { problem:'שורה לא מתבצעת', fix:'בודקים סוגריים () ונקודה־פסיק ; בסוף השורה, וכן שהמספר נמצא בתוך הסוגריים.' },
      { problem:'הרחפן עולה ויורד מהר מדי', fix:'מוסיפים או מתקנים tello.sleep(seconds); בין שינויי גובה כדי לדמות ייצוב חיישנים.' },
      { problem:'אי אפשר לשמור או לשתף', fix:'בודקים שהטאבלט מחובר ל־WiFi בית ספרי עם אינטרנט, סוגרים ופותחים מחדש את DroneBlocks Code אם צריך.' },
      { problem:'הסימולטור נתקע או הרחפן נעלם', fix:'לוחצים Reset בסימולטור, חוזרים לגרסה השמורה ומשנים פרמטר אחד בלבד.' }
    ],
    differentiation: {
      support: ['לתת שלד קוד עם שורות חסרות להשלמה.', 'להושיב תלמיד מתקשה בתפקיד Navigator שמקריא את הרצף לפני הכתיבה.', 'לאפשר הגשה של אתגר 1 בלבד עם הסבר מילולי טוב.'],
      extension: ['להוסיף משתנה const scanHeight = 120 ולהשתמש בו ב־flyUp.', 'להוסיף פונקציה קטנה בשם stabilize(seconds) אם סביבת הקוד מאפשרת.', 'להשוות בין שתי גרסאות ולכתוב איזו בטוחה יותר ולמה.']
    },
    instructorGuide: {
      prerequisites:'זהו שיעור פתיחה לקורס כיתה ט׳ עתודה. אין הנחת ידע קודם ב־DroneBlocks Code, אבל כן מצפים לבשלות גבוהה יותר: קריאת קוד טקסטואלי, הקפדה על סינטקס, עבודה בזוגות ותיעוד. שיעור זה בונה את הגשר מהרחפן כ״צעצוע״ לרחפן כ־Flying Sensor תעשייתי. גרסת v2 מדגישה עבודה מטרית מלאה: סנטימטרים בלבד.',
      pedagogy:['לשמור על מתח מקצועי: המשימה דרמטית, אבל ההוראה בטוחה ומבוקרת — סימולטור בלבד.', 'להשתמש ב־Flyability Elios כהשראה לרחפן תעשייתי מוגן, בלי להעמיס עובדות טכניות מיותרות.', 'להדגים Tello כבוי וללא סוללה כדי לחבר CPU/VPS/IMU לקוד, לא כדי לפתוח הטסה.', 'להדגיש שוב ושוב שסינטקס אינו המלצה, אלא דרישה מבנית של מערכת רובוטית.', 'לא לתת לתלמידים “להעתיק פתרון” בלי קריאת קוד: כל שורה צריכה לקבל סיבה הנדסית.', 'לסיים עם תוצר שמור; בלי Share Link או צילום מסך אין למדריך דרך לבצע דיבוג איכותי.'],
      exitTicket:'דיוק סינטקס חשוב במשימת רחפן אוטונומי כי ___; פקודת sleep חשובה כי ___. '
    },
    appWorkflowTitle: 'משימת טאבלט — DroneBlocks Code / Minimal Grid',
    appWorkflowNote: 'מפגש 1 מתבצע בטאבלטים בלבד וללא הטסה פיזית. האתר מציג את תדריך המשימה; את הקוד כותבים, מריצים, שומרים ומשתפים ב־DroneBlocks Code.',
    appWorkflow: [
      { title:'חיבור ופתיחה', detail:'התחברו ל־WiFi בית ספרי, פתחו DroneBlocks Code, התחברו לחשבון ופתחו קובץ Reactor_Survey_GroupX.' },
      { title:'בחירת סימולטור', detail:'עברו ל־Flight Simulator / Minimal Grid. אין חיבור לרחפן פיזי ואין הכנסת סוללה בשיעור זה.' },
      { title:'אתגר 1 — כיול 80 ס״מ', detail:'כתבו: tello.takeoff(); tello.sleep(3); tello.flyUp(80); tello.sleep(5); tello.land(); ואז הריצו בסימולטור.' },
      { title:'אתגר 2 — סריקה דו־שלבית', detail:'הרחיבו ל־flyUp(120), sleep(3), flyDown(60), sleep(2), land. בדקו שכל פקודה מדויקת באותיות ובסימנים.' },
      { title:'דיבוג ושיתוף', detail:'תקנו שגיאה אחת אם קיימת, הוסיפו הערת // על חשיבות sleep, שמרו והפיקו Share Link למדריך.' }
    ],
    codeSamples: [
      { title:'אתגר 1 — המראת הכיול הראשונה', code:'tello.takeoff();\ntello.sleep(3); // המתנה להתייצבות הריחוף הראשוני\ntello.flyUp(80); // עלייה של 80 סנטימטרים\ntello.sleep(5); // השהיית ריחוף לצורך קריאת נתוני חיישן\ntello.land();' },
      { title:'אתגר 2 — סורק הקרינה הדו־שלבי', code:'tello.takeoff();\ntello.sleep(3);\ntello.flyUp(120); // עלייה לגובה 120 ס״מ\ntello.sleep(3); // בדיקת חיישן קרינת גמא\ntello.flyDown(60); // ירידה לגובה 60 ס״מ\ntello.sleep(2); // בדיקה משנית\ntello.land();' }
    ],
    visualDiagram: { title:'ליבת הכור הווירטואלית — סריקת גבהים', caption:'מנחת המראה → גובה 80 ס״מ למדידת טמפרטורה → גובה 120 ס״מ למדידת קרינה → ירידה מדורגת ל־60 ס״מ ונחיתה בטוחה.', chip:'סימולטור בלבד', panelTitle:'🗺️ זירת סריקה וירטואלית', src:'assets/drone-intelligence-lab-grade9/lesson1/reactor-vertical-scan.svg', alt:'תרשים תרגיל סריקת כור וירטואלית בציר אנכי בשיטה מטרית' },
    screenshotSlides: [
      { title:'תרשים התרגיל — סריקת כור וירטואלית', src:'assets/drone-intelligence-lab-grade9/lesson1/reactor-vertical-scan.svg', caption:'המחשה לכיתה: מנחת המראה, נקודת מדידה בגובה 80 ס״מ, נקודת מדידה בגובה 120 ס״מ, ירידה מדורגת ונחיתה בטוחה בסימולטור Minimal Grid.' }
    ],
    instructorSlides: [
      { title:'משימת IAEA: רחפן נכנס איפה שאדם לא יכול', body:'הרחפן היום הוא חיישן מעופף למשימת סריקה בכור וירטואלי. אין שלט ואין אלתור — רק תוכנית טיסה אוטונומית שנבדקת בסימולטור.', bullets:['IAEA', 'Flyability Elios', 'Flying Sensor'] },
      { title:'החומרה שמאחורי הקוד', body:'גם כשהרחפן כבוי, אפשר להבין למה הקוד חייב להיות מדויק: המעבד מבצע פקודות, VPS עוזר למיקום, IMU מייצב תנועה.', bullets:['CPU', 'VPS', 'IMU'] },
      { title:'DroneBlocks Code בטאבלט', body:'פותחים על WiFi בית ספרי, מתחברים, שומרים בענן, ובודקים ב־Minimal Grid בלבד. אין TELLO WiFi ואין מנועים בשיעור 1.', bullets:['Login', 'Function Reference', 'Share Link'] },
      { title:'Industrial Syntax', body:'JavaScript לא מנחש כוונות. אות גדולה, סוגר חסר או נקודה־פסיק חסרה יכולים לעצור משימת רחפן שלמה.', bullets:['tello.takeoff();', 'CamelCase', ';'] },
      { title:'אתגר 1: כיול 80 ס״מ', body:'המראה, sleep להתייצבות, עלייה ל־80 ס״מ, sleep לקריאת חיישן ונחיתה. המטרה: רצף קצר, בטוח ומדויק.', bullets:['80 ס״מ', 'sleep(5)', 'land'] },
      { title:'אתגר 2: סריקה דו־שלבית', body:'עלייה ל־120 ס״מ, עצירה, ירידה ל־60 ס״מ ונחיתה. כאן לומדים גובה יחסי ולמה sleep חשוב לפני שינוי גובה.', bullets:['120 ס״מ', 'flyDown(60)', 'Sim‑to‑Reality'] }
    ]
  };

  const lessonTwoFinal = {
    subtitle: '2D Flight Physics, Pitch/Roll/Yaw, Strafing מול Yaw Box בשיטה מטרית',
    concept: '2D Flight Physics, Pitch/Roll/Yaw, Strafing מול Yaw, Sensor Orientation והשוואת אלגוריתמים מטרית',
    story: 'צוותי כיתה ט׳ עתודה פועלים כצוותי פיתוח רובוטיקה ואנליטיקה בחברת Perceptual Robotics. החברה קיבלה קריאת חירום ממפעל פטרוכימי: יש חשד לדליפת חומצה סמויה בגג מבנה שרתים, והרחפן צריך לסרוק ריבוע מדויק של 150×150 ס״מ עם מצלמה תרמית קבועה.',
    mission: 'לבנות ב־DroneBlocks Code שתי גרסאות JavaScript לאותו ריבוע 150 ס״מ בסימולטור Minimal Grid בלבד: Strafing Box ששומר על כיוון מצלמה קבוע מול Yaw Box שמסובב את האף 90° בכל פינה — ואז להשוות יעילות קוד, בטיחות ניווט ו־Sensor Orientation.',
    workspaceMode: 'droneblocks-app',
    physicalFlightAllowed: false,
    presentationMode: 'focused',
    essentialQuestion: 'איך בוחרים אלגוריתם ניווט לרחפן כשאותו ריבוע יכול להיות יעיל יותר לקוד, בטוח יותר לטיסה, או יציב יותר לצילום?',
    successCriteria: [
      'אני מסביר/ה את ההבדל בין Pitch/Roll כתנועה קווית לבין Yaw כסבסוב.',
      'אני כותב/ת שתי גרסאות JavaScript למסלול ריבוע של 150 ס״מ בסימולטור בלבד.',
      'אני משתמש/ת נכון בפקודות flyForward, flyRight, flyBackward, flyLeft ו־yawRight.',
      'אני מוסיף/ה sleep בין פקודות כדי למנוע “מריחה” ולדמות ייצוב רחפן.',
      'אני משווה בין Strafing Box לבין Yaw Box לפי יעילות קוד, בטיחות וזווית חיישן.',
      'אני שומר/ת פרויקט בשם Meeting2_BoxMission_[TeamName] ומשתף/ת תוצר למדריך.'
    ],
    realWorldUses: [
      { icon:'🏭', title:'Thermal Shield', text:'רחפן תרמי יכול לסרוק גג מפעל מסוכן בלי לשלוח אדם לאזור דליפה.' },
      { icon:'📷', title:'Sensor Orientation', text:'כיוון המצלמה משנה את איכות המיפוי: צילום רציף דורש זווית עקבית.' },
      { icon:'⚖️', title:'Trade‑offs', text:'מהנדסים בוחרים אלגוריתם לפי אילוץ: בטיחות, זמן, צילום או פשטות קוד.' }
    ],
    vocabulary: [
      ['2D Flight Physics','תנועת רחפן במישור אופקי: קדימה/אחורה/ימינה/שמאלה וסבסוב סביב הציר האנכי.'],
      ['Pitch / עלרוד','תנועה קדימה או אחורה לאורך ציר X של הרחפן.'],
      ['Roll / גלגול','תנועה צדית ימינה או שמאלה לאורך ציר Y.'],
      ['Strafing','תנועה צדית/אחורית בלי לסובב את האף; המצלמה נשארת בכיוון קבוע.'],
      ['Yaw / סבסוב','סיבוב גוף הרחפן סביב עצמו, בדרך כלל במעלות.'],
      ['Sensor Orientation','כיוון המצלמה/חיישן בזמן הטיסה והשפעתו על איכות הסריקה.'],
      ['Algorithm Optimization','השוואה בין פתרונות לפי יעילות, אמינות, בטיחות והתאמה למשימה.'],
      ['tello.sleep(seconds)','השהייה בין תנועות כדי לאפשר עצירה וייצוב לפני הפקודה הבאה.']
    ],
    safetyRules: [
      'מפגש 2 הוא סימולטור בלבד — לא מחברים רחפן, לא מכניסים סוללה ולא מפעילים מנועים.',
      'רחפן ההדגמה, אם משתמשים בו להמחשת Pitch/Roll/Yaw, נשאר כבוי וללא סוללה.',
      'לפני Run קוראים את כל המסלול בקול: המראה, ארבע צלעות, השהיות ונחיתה.',
      'כל ריבוע חייב להסתיים ב־tello.land(); גם אם הריצה היא רק בסימולטור.',
      'אחרי שינוי כיוון או סבסוב מוסיפים sleep כדי לדמות עצירת אינרציה וייצוב.',
      'לא מוחקים גרסה שעבדה לפני ששומרים עותק או Share Link.'
    ],
    commonDirections: [
      ['tello.flyForward(150);','צלע קדימה באורך 150 ס״מ.'],
      ['tello.flyRight(150);','תנועה ימינה בלי לסובב את האף — Strafing.'],
      ['tello.flyBackward(150);','חזרה אחורה כשהמצלמה עדיין פונה לאותו כיוון.'],
      ['tello.flyLeft(150);','סגירת הריבוע בתנועה צדית שמאלה.'],
      ['tello.yawRight(90);','סיבוב האף 90° ימינה לפני הצלע הבאה.'],
      ['tello.sleep(2);','השהיית ייצוב בין תנועות או אחרי פנייה.']
    ],
    setupSteps: [
      'טאבלטים טעונים ומחוברים ל־WiFi בית ספרי.',
      'פותחים DroneBlocks Code ומתחברים לחשבון.',
      'פותחים פרויקט חדש בשם Meeting2_BoxMission_[TeamName].',
      'בוחרים Flight Simulator / Minimal Grid בלבד.',
      'מכינים דף משבצות לתכנון שתי הגרסאות לפני כתיבת הקוד.',
      'רחפן Tello להדגמת צירים בלבד — כבוי וללא סוללה.'
    ],
    tabletTips: [
      'שמרו גרסה ראשונה בשם BoxMission_Strafe לפני שאתם משנים ל־Yaw.',
      'בדקו את שמות הפקודות ב־Function Reference: flyForward, flyRight, flyBackward, flyLeft, yawRight.',
      'כל ערך מרחק בשיעור הזה הוא בסנטימטרים: 150 ס״מ לכל צלע.',
      'אחרי כל צלע או פנייה הוסיפו sleep קצר כדי לבדוק יציבות.',
      'השוו את שתי הגרסאות לפי שורות קוד, בטיחות וזווית צילום — לא רק לפי “הצליח”.',
      'אם מתקבלת שגיאת Tello is not defined — בדקו שהתחלתם ב־tello באותיות קטנות.'
    ],
    lessonFlow: [
      { minutes:'0–6', title:'גשר משיעור 1 — מציר אנכי למישור דו־מימדי', teacher:'מזכיר את סריקת הגבהים המטרית: 80/120/60 ס״מ, סינטקס מדויק ו־sleep לייצוב.', students:'פותחים/מזכירים את קוד שיעור 1 ומזהים שורה שבה sleep שומר על יציבות.' },
      { minutes:'6–16', title:'סיפור מסגרת — Thermal Shield', teacher:'מציג את Perceptual Robotics, מפעל פטרוכימי וגג שרתים עם חשש לדליפה. המשימה: ריבוע 150×150 ס״מ עם מצלמה תרמית קבועה.', students:'מגדירים אילוץ משימה אחד: בטיחות, זווית צילום או יעילות קוד.' },
      { minutes:'16–26', title:'Pitch/Roll/Yaw והפעלה קינסטטית', teacher:'משתמש ברחפן כבוי או במתנדבים: Strafing עם פנים קבועות מול Yaw שמסתובב בכל פינה.', students:'מתארים מה קורה למצלמה ומה קורה לבטיחות בכל גישה.' },
      { minutes:'26–35', title:'תכנון על דף משבצות', teacher:'מבקש לשרטט שני ריבועים 150 ס״מ ולכתוב ליד כל צלע את הפקודה המתאימה.', students:'מתכננים Strafing Box ו־Yaw Box לפני כתיבה בטאבלט.' },
      { minutes:'35–45', title:'פתיחת DroneBlocks Code ושמירת פרויקט', teacher:'מוביל WiFi בית ספרי, Login, קובץ Meeting2_BoxMission_[TeamName] ו־Minimal Grid.', students:'פותחים קובץ, שומרים גרסה ראשונית ומוודאים סימולטור פעיל.' },
      { minutes:'45–58', title:'משימה 1 — Strafing Box', teacher:'מלווה כתיבת takeoff, sleep, flyForward(150), flyRight(150), flyBackward(150), flyLeft(150), sleep בין צלעות ו־land.', students:'כותבים ומריצים ריבוע 150 ס״מ כשהאף/מצלמה נשארים צפונה.' },
      { minutes:'58–73', title:'משימה 2 — Yaw Box', teacher:'מנחה שמירה/שכפול גרסה ואז כתיבת ריבוע בעזרת flyForward(150) ו־yawRight(90) בכל פינה.', students:'מריצים גרסה שנייה ומשווים מה השתנה בכיוון המצלמה ובמספר השורות.' },
      { minutes:'73–82', title:'ניתוח הנדסי השוואתי', teacher:'מוביל דיון: מי חסכוני יותר? מי בטוח יותר? מי טוב יותר לצילום תרמי רציף?', students:'ממלאים טבלת השוואה קצרה ומנסחים המלצה למהנדס המשימה.' },
      { minutes:'82–90', title:'שמירה, Share Link וסגירה', teacher:'אוסף קישורים/צילומי מסך ומסכם: הנדסה היא בחירת פתרון לפי אילוץ.', students:'שומרים/משתפים ומגישים משפט המלצה: “בחרנו ___ כי ___”.' }
    ],
    exercises: [
      { minutes:'0–6', title:'גשר משיעור 1', prompt:'מצאו בקוד הקודם פקודת sleep אחת והסבירו למה היא לא “קישוט”.', check:'התלמיד מחבר sleep לייצוב ולדיוק מדידה.' },
      { minutes:'16–26', title:'סימולציה גופנית', prompt:'השוו מתנדב Strafing מול מתנדב Yaw: מי שומר מצלמה קבועה ומי רואה את נתיב הטיסה?', check:'התלמיד מזהה tradeoff בין זווית חיישן לבטיחות תנועה.' },
      { minutes:'26–35', title:'שרטוט ריבוע כפול', prompt:'על דף משבצות שרטטו שתי גרסאות לאותו ריבוע 150 ס״מ וסמנו פקודות על כל צלע.', check:'קיימות שתי אסטרטגיות שונות לאותו יעד.' },
      { minutes:'45–58', title:'אתגר 1 — Strafing Box 150 ס״מ', prompt:'כתבו ריבוע בעזרת flyForward(150), flyRight(150), flyBackward(150), flyLeft(150) ושמרו על כיוון מצלמה קבוע.', check:'הקוד חוזר לנקודת המוצא ומסתיים ב־land.' },
      { minutes:'58–73', title:'אתגר 2 — Yaw Box 150 ס״מ', prompt:'כתבו אותו ריבוע בעזרת flyForward(150) ו־yawRight(90) בכל פינה.', check:'הרחפן משלים ארבע צלעות וארבע פניות 90°.' },
      { minutes:'73–82', title:'טבלת החלטה הנדסית', prompt:'השוו: מספר שורות, בטיחות במרחב צפוף, איכות צילום תרמי רציף.', check:'יש המלצה מנומקת ולא רק בחירה אקראית.' },
      { minutes:'82–90', title:'הגשה', prompt:'שמרו Meeting2_BoxMission_[TeamName] ושתפו Link או צילום מסך של שתי הגרסאות/טבלת ההשוואה.', check:'התוצר ניתן לבדיקה ומכיל השוואה.' }
    ],
    deliverable: 'Share Link או צילום מסך לפרויקט Meeting2_BoxMission_[TeamName] הכולל Strafing Box ו־Yaw Box בריבוע 150 ס״מ, או גרסה אחת + טבלת השוואה מנומקת בין שתי הגישות.',
    assessment: [
      'שתי הגרסאות מתארות ריבוע של 150 ס״מ לכל צלע בסימולטור Minimal Grid.',
      'הקוד משתמש נכון ב־flyForward/flyRight/flyBackward/flyLeft או ב־flyForward/yawRight.',
      'יש sleep בין פקודות תנועה או אחרי סבסוב.',
      'התלמיד מסביר את ההבדל בין Translation/Strafing לבין Yaw.',
      'ההמלצה ההנדסית מתייחסת לפחות לשני אילוצים: בטיחות, צילום, יעילות קוד או זמן.'
    ],
    debugging: [
      { problem:'ReferenceError: Tello is not defined', fix:'בודקים שכל פקודה מתחילה ב־tello באותיות קטנות בלבד. JavaScript רגיש לאותיות גדולות/קטנות.' },
      { problem:'הרחפן “נמרח” או לא עוצר בפינות', fix:'מוסיפים tello.sleep(2); אחרי כל צלע ובמיוחד אחרי yawRight(90) כדי לדמות ייצוב.' },
      { problem:'הריבוע לא נסגר לנקודת המוצא', fix:'בודקים שכל ארבע הצלעות הן 150 ס״מ ושלא חסרה צלע נגדית: Right מול Left או ארבעה Forward עם ארבע פניות.' },
      { problem:'המצלמה לא נשארת בכיוון קבוע בגישת Strafing', fix:'מוודאים שלא הוכנסו פקודות yawRight/yawLeft לקוד ה־Strafing.' },
      { problem:'Share Link לא נוצר', fix:'מוודאים WiFi בית ספרי פעיל; אם הרשת חוסמת, שומרים צילום מסך זמני ומנסים שוב בסוף.' }
    ],
    differentiation: {
      support: ['לתת טבלת פקודות מוכנה ולבקש להשלים רק את המספר 150 וה־sleep.', 'לאפשר לצוות מתקשה להשלים קודם רק Strafing Box ואז לדון בעל־פה ב־Yaw.', 'להשתמש בצבעים בדף המשבצות: כחול לתנועה, כתום לסבסוב.'],
      extension: ['להוסיף const side = 150 ולהשתמש במשתנה בכל הצלעות.', 'לחשב מי קצר יותר במספר שורות קוד ולנמק אם קיצור תמיד עדיף.', 'לכתוב פונקציה עתידית flyYawBox(side) כהכנה לשיעורי פונקציות.' ]
    },
    instructorGuide: {
      prerequisites:'שיעור 2 נבנה ישירות על שיעור 1: התלמידים כבר מכירים DroneBlocks Code, שמירה בענן, חשיבות sleep, רגישות סינטקס ועבודה מטרית בס״מ. אין טיסה פיזית גם כאן; החידוש הוא מעבר מציר גובה יחיד לתנועה דו־מימדית והשוואת אלגוריתמים.',
      pedagogy:['להקפיד שלא להפוך את השיעור לתרגיל “ציירו ריבוע” בלבד — הליבה היא השוואת אסטרטגיות לפי אילוצי הנדסה.', 'הפעילות הגופנית חשובה: תלמידים מרגישים בגוף את ההבדל בין Strafing לבין Yaw לפני קוד.', 'Strafing אינו “טוב יותר” או “רע יותר”; הוא טוב לצילום רציף אך מסוכן יותר בסביבה צפופה.', 'Yaw אינו תמיד יעיל בקוד, אבל בטוח יותר כשהרחפן צריך לראות קדימה.', 'לשמור פתרונות הקוד במערך מדריך; במצגת להציג רק רצף/שאלה ולא פתרון מלא להעתקה.', 'המצגת בשיעור זה ממוקדת: אין חזרה על שקופיות פתיחה גנריות מעבר למה שנדרש.' ],
      exitTicket:'בחרתי בגישת ___ למשימת Thermal Shield כי האילוץ החשוב ביותר הוא ___. '
    },
    appWorkflowTitle: 'משימת טאבלט — Box Mission ב־DroneBlocks Code',
    appWorkflowNote: 'מפגש 2 מתבצע בסימולטור Minimal Grid בלבד. האתר מציג את האתגר וההשוואה; את שתי גרסאות ה־JavaScript כותבים, מריצים ושומרים באפליקציה.',
    appWorkflow: [
      { title:'פתיחה ושמירה', detail:'התחברו ל־WiFi בית ספרי, פתחו DroneBlocks Code, התחברו לחשבון וצרו Meeting2_BoxMission_[TeamName].' },
      { title:'תכנון על דף משבצות', detail:'שרטטו שני ריבועים 150 ס״מ: Strafing עם כיוון מצלמה קבוע, ו־Yaw עם פנייה 90° בכל פינה.' },
      { title:'גרסה 1 — Strafing Box', detail:'כתבו takeoff, sleep, flyForward(150), flyRight(150), flyBackward(150), flyLeft(150), sleep בין תנועות ו־land.' },
      { title:'גרסה 2 — Yaw Box', detail:'שמרו גרסה, ואז כתבו ריבוע עם flyForward(150) ו־yawRight(90) בכל פינה, כולל sleep לייצוב.' },
      { title:'השוואה והגשה', detail:'השוו יעילות קוד, בטיחות וזווית צילום; שמרו ושתפו Share Link או צילום מסך.' }
    ],
    codeSamples: [
      { title:'משימה 1 — Strafing Box', code:'// המראה וייצוב\ntello.takeoff();\ntello.sleep(3);\n\n// ריבוע ללא פניות אף — Strafing / Translation, שיטה מטרית\ntello.flyForward(150);\ntello.sleep(2);\n\ntello.flyRight(150);\ntello.sleep(2);\n\ntello.flyBackward(150);\ntello.sleep(2);\n\ntello.flyLeft(150);\ntello.sleep(2);\n\ntello.land();' },
      { title:'משימה 2 — Yaw Box', code:'// המראה וייצוב\ntello.takeoff();\ntello.sleep(3);\n\n// ארבע צלעות 150 ס״מ עם סבסוב 90° בכל פינה\ntello.flyForward(150);\ntello.sleep(1);\ntello.yawRight(90);\ntello.sleep(2);\n\ntello.flyForward(150);\ntello.sleep(1);\ntello.yawRight(90);\ntello.sleep(2);\n\ntello.flyForward(150);\ntello.sleep(1);\ntello.yawRight(90);\ntello.sleep(2);\n\ntello.flyForward(150);\ntello.sleep(1);\ntello.yawRight(90);\ntello.sleep(2);\n\ntello.land();' }
    ],
    visualDiagram: { title:'Thermal Shield — Strafing מול Yaw Box', caption:'שתי דרכים לאותו ריבוע 150 ס״מ: Strafing שומר מצלמה צפונה ומתאים לצילום רציף; Yaw מסובב את האף בכל פינה ומתאים יותר לבטיחות ניווט.', chip:'Minimal Grid', panelTitle:'🗺️ תרשים אתגר הריבוע', src:'assets/drone-intelligence-lab-grade9/lesson2/thermal-shield-box-mission.svg', alt:'תרשים השוואת Strafing Box מול Yaw Box במסלול ריבוע 150 ס״מ' },
    screenshotSlides: [
      { title:'תרשים התרגיל — Strafing מול Yaw Box', src:'assets/drone-intelligence-lab-grade9/lesson2/thermal-shield-box-mission.svg', caption:'המחשה לכיתה: בצד אחד ריבוע 150 ס״מ בתנועה צידית כשהמצלמה נשארת קבועה; בצד שני ריבוע 150 ס״מ עם סבסוב 90° בכל פינה. התלמידים משווים יעילות, בטיחות וזווית חיישן.' }
    ],
    instructorSlides: [
      { title:'משימת Thermal Shield', body:'Perceptual Robotics צריכה לסרוק גג מפעל פטרוכימי בריבוע 150×150 ס״מ. המצלמה התרמית קבועה — ולכן האלגוריתם משנה את איכות המשימה.', bullets:['מפעל פטרוכימי', 'מצלמה תרמית', '150×150 ס״מ'] },
      { title:'Pitch / Roll / Yaw בגוף', body:'לפני טאבלטים: שני מתנדבים מדגימים אותו ריבוע — אחד Strafing עם פנים קבועות, ואחד Yaw שמסתובב בכל פינה.', bullets:['Pitch', 'Roll / Strafing', 'Yaw'] },
      { title:'Strafing Box', body:'הרחפן זז קדימה, ימינה, אחורה ושמאלה בלי לסובב את האף. מעולה לזווית צילום קבועה, אבל פחות בטוח במרחב צפוף.', bullets:['flyForward(150)', 'flyRight(150)', 'מצלמה קבועה'] },
      { title:'Yaw Box', body:'הרחפן טס קדימה ובכל פינה מסתובב 90°. בטוח יותר כי הוא “מסתכל” לכיוון הטיסה, אבל זווית הצילום משתנה.', bullets:['flyForward(150)', 'yawRight(90)', 'רואה קדימה'] },
      { title:'החלטת מהנדסים', body:'אין תשובה אחת נכונה: בוחרים לפי האילוץ. צילום תרמי רציף עשוי להעדיף Strafing; מניעת התנגשות עשויה להעדיף Yaw.', bullets:['יעילות קוד', 'בטיחות', 'Sensor Orientation'] }
    ]
  };

  const lessonThreeFinal = {
    title: 'שיעור 3: Mars Seismic Scan — ענן, חקר תלת־ממדי וייצוב חיישנים',
    subtitle: 'Mars Simulator, Cloud Sync, 3D Spatial Problem Solving, flyUp/flyDown ו־sleep',
    concept: 'עבודה בענן, Mars Simulator, ניווט תלת־ממדי מטרי וייצוב חיישנים',
    blocks: ['takeoff','sleep','flyUp','flyForward','flyDown','sleep','flyUp','yawRight','flyForward','land','share'],
    story: 'צוותי כיתה ט׳ עתודה מצטרפים למהנדסי בקרה וטלמטריה של NASA JPL ו־ESA במשימת Ingenuity‑2. סערת חול במכתש ג׳זרו כיסתה פאנלים סולאריים באבק אדום וסייסמוגרפים הפסיקו לשדר. הרחפן האוטונומי חייב לעקוף רכסי בזלת, לבצע עצירות ייצוב מעל תחנות המדידה, לסרוק פאנלים ולנחות במנחת מוגן.',
    mission: 'לכתוב ב־DroneBlocks Code משימת JavaScript בסימולטור Mars בלבד: שמירה בענן, המראה, עלייה לגובה 150 ס״מ מעל רכס בזלת, טיסה 250 ס״מ לתחנת סייסמוגרף, ירידה 70 ס״מ לגובה 80 ס״מ, עלייה 140 ס״מ לגובה 220 ס״מ, סריקת פאנלים, פניות, sleep לייצוב חיישנים ו־Share Link.',
    workspaceMode: 'droneblocks-app',
    physicalFlightAllowed: false,
    presentationMode: 'focused',
    essentialQuestion: 'איך מתכננים תוכנית טיסה תלת־ממדית שבה גובה, תנועה אופקית, שמירה בענן והשהיות ייצוב עובדים יחד כדי לייצר נתוני חקר אמינים?',
    successCriteria: [
      'אני שומר/ת פרויקט בענן בשם Mars_Seismic_Scan_[שמות_התלמידים] או Mars_Seismic_Scan_TeamX ומפיק/ה Share Link.',
      'אני משלב/ת תנועה אנכית ואופקית: flyUp, flyDown, flyForward ו־yawRight.',
      'אני משתמש/ת במידות מטריות בלבד: 150, 250, 70, 80, 140, 220, 200 ו־300 ס״מ.',
      'אני מסביר/ה מדוע אטמוספירת מאדים הדלילה ותנודות מחייבות sleep מתוכנן.',
      'אני מתכנן/ת מסלול תלת־ממדי שעוקף רכס בזלת ומגיע לשתי תחנות מדידה.',
      'אני משתמש/ת ב־Function Reference ובודק/ת CamelCase לפני הרצה.'
    ],
    realWorldUses: [
      { icon:'🔴', title:'חקר מאדים', text:'מסוק אוטונומי בכוכב אחר חייב לקבל תוכנית מדויקת מראש, כי אי אפשר לשלוט בו ידנית בזמן אמת.' },
      { icon:'📡', title:'טלמטריה ומדידות', text:'עצירה יציבה מעל סייסמוגרף או פאנל סולארי משפרת את איכות הנתונים והצילום.' },
      { icon:'☁️', title:'עבודה בענן', text:'Share Link מאפשר למדריך לבדוק קוד, גרסאות והתקדמות גם אחרי שהטאבלט נסגר.' }
    ],
    vocabulary: [
      ['Mars Simulator','סביבת סימולציה תלת־ממדית המדמה משימת טיסה במאדים.'],
      ['3D Spatial Problem Solving','פתרון בעיות מרחביות שמשלב קדימה/אחורה, פניות וגובה.'],
      ['Altitude / גובה','ציר Z של הרחפן; בשיעור זה משתמשים ב־flyUp/flyDown בסנטימטרים.'],
      ['Thin Atmosphere','אטמוספירה דלילה המקשה על יצירת עילוי וגורמת לרגישות גבוהה יותר לתנודות.'],
      ['Oscillations','תנודות ורעידות אחרי תנועה או עצירה, במיוחד בסביבה מאתגרת.'],
      ['Optical Flow','חיישן/שיטת מיקום שמסתמכת על ראיית הקרקע ודורשת יציבות.'],
      ['Cloud Sync','שמירה וסנכרון קוד בענן כדי לא לאבד עבודה ולאפשר בדיקת מדריך.'],
      ['Share Link','קישור ענן להגשת הקוד למדריך.' ]
    ],
    safetyRules: [
      'מפגש 3 הוא סימולטור בלבד — אין חיבור לרחפן, אין סוללה ואין TELLO WiFi.',
      'רחפן פיזי, אם מוצג, נשאר כבוי וללא סוללה ומשמש רק להמחשת מיקום חיישנים אופטיים.',
      'ב־Mars Simulator מורידים איכות גרפית ל־Low אם הטאבלט מתחמם או נתקע.',
      'אין מריצים קוד ארוך לפני שקוראים את רצף הטיסה ומוודאים land בסוף.',
      'כל שינוי גובה או פנייה משמעותית מקבלים sleep לצורך ייצוב.',
      'אם הענן לא עובד — שומרים מקומית/צילום מסך זמני ולא מאבדים עבודה.'
    ],
    commonDirections: [
      ['tello.flyUp(150);','עלייה לגובה בטוח מעל רכס בזלת וירטואלי.'],
      ['tello.flyForward(250);','טיסה אופקית אל תחנת הסייסמוגרף.'],
      ['tello.flyDown(70);','הנמכה מבוקרת מגובה 150 ס״מ לגובה 80 ס״מ.'],
      ['tello.sleep(4);','עצירה ארוכה לקריאת נתונים סייסמיים יציבה.'],
      ['tello.flyUp(140);','עלייה לגובה מצטבר 220 ס״מ לסריקת פאנלים.'],
      ['tello.flyForward(200);','סריקה קדימה של מערך הפאנלים הסולאריים.'],
      ['Share Link','הגשת פרויקט הענן לבדיקה.' ]
    ],
    setupSteps: [
      'טאבלטים טעונים ומחוברים ל־WiFi בית ספרי עם אינטרנט פעיל.',
      'DroneBlocks Code פתוח, Login/Register תקין וחשבון ענן זמין.',
      'פרויקט חדש בשם Mars_Seismic_Scan_[שמות_התלמידים] או Mars_Seismic_Scan_TeamX.',
      'בחירת DroneBlocks Simulator → Mars Simulator.',
      'אם Mars איטי בטאבלט: סוגרים אפליקציות רקע ומורידים גרפיקה ל־Low.',
      'רחפן Tello להמחשת חיישנים בלבד — כבוי וללא סוללה.'
    ],
    tabletTips: [
      'שמרו את הפרויקט בענן לפני כתיבת הקוד הארוך.',
      'בדקו Function Reference עבור flyUp/flyDown/sleep לפני הרצה.',
      'אחרי כל מקטע תנועה גדול הוסיפו sleep קצר; מעל תחנת מדידה הוסיפו sleep ארוך יותר.',
      'השתמשו בהזחות והערות כדי לסמן שלבים: המראה, רכס, סייסמוגרף, פאנלים, נחיתה.',
      'אם Mars Simulator קופא — Low graphics, סגירת אפליקציות רקע ו־Reset.',
      'בסוף מפיקים Share Link; אם אין רשת, שומרים צילום מסך זמני.'
    ],
    lessonFlow: [
      { minutes:'0–6', title:'בדיקת תנאי קדם משיעור 2', teacher:'מחבר בין Box Mission לבין Mars: למדנו לתכנן במישור 150 ס״מ; היום מוסיפים גובה, ענן וסביבה מדעית.', students:'מזכירים הבדל אחד בין Strafing ל־Yaw ומסבירים איפה sleep עזר.' },
      { minutes:'6–16', title:'סיפור מסגרת — סיירי המכתשים במאדים', teacher:'מציג NASA JPL/ESA, Ingenuity‑2, סערת חול במכתש ג׳זרו, סייסמוגרפים ופאנלים סולאריים מאובקים.', students:'מסמנים על התרשים שתי תחנות מדידה ומכשול טופוגרפי אחד.' },
      { minutes:'16–26', title:'אטמוספירת מאדים וייצוב חיישנים', teacher:'מסביר אטמוספירה דלילה, עילוי, תנודות ו־Oscillations, ומחבר ל־tello.sleep(seconds).', students:'עונים: באילו נקודות במסלול חייבים לחכות לפני מדידה?' },
      { minutes:'26–36', title:'נוהל ענן ו־Share Link', teacher:'מדגים Login/Register, פתיחת Mars_Seismic_Scan_TeamX, שמירה בענן והפקת Share Link.', students:'פותחים פרויקט, שומרים גרסה ריקה ומוודאים שהשם נכון.' },
      { minutes:'36–44', title:'פקודות Z מטריות', teacher:'מדגים flyUp(150), flyDown(70), sleep(3) עם CamelCase, סוגריים ונקודה־פסיק.', students:'כותבים שלוש שורות בדיקה ומסמנים את הפרמטרים בס״מ/שניות.' },
      { minutes:'44–55', title:'תכנון המסלול התלת־ממדי', teacher:'מנחה שרטוט: מנחת → רכס 150 ס״מ → סייסמוגרף 80 ס״מ → פאנלים 220 ס״מ → מנחת מוגן.', students:'כותבים פסאודו־קוד של שלבי המשימה לפני JavaScript מלא.' },
      { minutes:'55–75', title:'אתגר פיתוח — Ingenuity‑2 Navigation Engine', teacher:'מלווה כתיבת קוד מלא בסימולטור Mars: takeoff, flyUp(150), flyForward(250), flyDown(70), sleep(4), flyUp(140), yawRight, flyForward(200), land.', students:'כותבים, מריצים, מתעדים תקלה אחת ומתקנים פרמטר/שורה אחת בלבד.' },
      { minutes:'75–82', title:'דיון דיבוג — מה קורה בלי sleep?', teacher:'שואל מה קורה אם משמיטים sleep לפני פנייה או נחיתה ומחבר ל־Optical Flow/Drift.', students:'מוסיפים הערת קוד שמסבירה sleep באחת מתחנות המדידה.' },
      { minutes:'82–90', title:'הגשת Share Link וסגירה', teacher:'פותח 2–3 קישורים אקראיים ומדגיש סדר, הזחות ושמות שלבים.', students:'שומרים, משתפים Link/צילום מסך ומחזירים טאבלטים לעגינה.' }
    ],
    exercises: [
      { minutes:'0–6', title:'גשר Box → Mars', prompt:'כתבו מה נשאר דומה משיעור 2 ומה נוסף היום כשעוברים למסלול תלת־ממדי.', check:'התלמיד מזהה תנועה אופקית + גובה + שמירה בענן.' },
      { minutes:'26–36', title:'ענן לפני קוד', prompt:'צרו פרויקט Mars_Seismic_Scan_TeamX ושמרו גרסה ריקה בענן.', check:'שם הפרויקט ברור והקובץ נשמר.' },
      { minutes:'36–44', title:'בדיקת פקודות גובה מטריות', prompt:'כתבו שלוש שורות בדיקה: flyUp(150), flyDown(70), sleep(3) ובדקו סינטקס.', check:'CamelCase, סוגריים ונקודה־פסיק תקינים.' },
      { minutes:'44–55', title:'שרטוט מסלול Mars', prompt:'סמנו על התרשים מנחת, רכס בזלת 150 ס״מ, סייסמוגרף 80 ס״מ, פאנלים 220 ס״מ ומנחת נחיתה.', check:'יש רצף תלת־ממדי עם לפחות שתי נקודות מדידה.' },
      { minutes:'55–67', title:'אתגר 1 — רכס וסייסמוגרף', prompt:'כתבו takeoff, sleep, flyUp(150), flyForward(250), flyDown(70), sleep(4).', check:'הקוד מגיע לתחנה א׳ בגובה 80 ס״מ ומייצב קריאת נתונים.' },
      { minutes:'67–75', title:'אתגר 2 — פאנלים ונחיתה', prompt:'הוסיפו flyUp(140), yawRight(90), flyForward(200), sleep(3), yawRight(90), flyForward(300), land.', check:'המסלול מסתיים במנחת מוגן עם land.' },
      { minutes:'75–82', title:'דיבוג sleep', prompt:'בחרו נקודת מדידה אחת והסבירו בהערת // למה יש sleep.', check:'ההערה מחברת ייצוב חיישנים למשימה המדעית.' },
      { minutes:'82–90', title:'Share Link', prompt:'שמרו גרסה אחרונה והגישו קישור שיתוף או צילום מסך זמני.', check:'התוצר ניתן לפתיחה/בדיקה.' }
    ],
    deliverable: 'Share Link או צילום מסך לפרויקט Mars_Seismic_Scan_TeamX / Mars_Seismic_Scan_[שמות_התלמידים] הכולל מסלול Mars תלת־ממדי, שתי נקודות מדידה, sleep לייצוב והערת קוד אחת על חיישנים.',
    assessment: [
      'הפרויקט נשמר בענן או תועד בצילום מסך אם הרשת חסומה.',
      'הקוד כולל שילוב נכון של תנועה אנכית ואופקית במידות ס״מ.',
      'יש sleep אחרי המראה, שינוי גובה, פנייה או מעל תחנת מדידה.',
      'הקוד מסתיים ב־tello.land(); ולא משאיר משימה פתוחה.',
      'התלמיד מסביר למה Mars Simulator דורש תכנון תלת־ממדי וייצוב.'
    ],
    debugging: [
      { problem:'Login/Register נכשל או Share Link לא נוצר', fix:'בודקים WiFi בית ספרי וגישה לאינטרנט; אם הרשת חוסמת ענן, שומרים מקומית/צילום מסך ומשתמשים ב־Hotspot רק לסנכרון סופי באישור מדריך.' },
      { problem:'Mars Simulator איטי או קופא', fix:'מורידים איכות גרפית ל־Low, סוגרים אפליקציות רקע ומבצעים Reset לסימולטור.' },
      { problem:'פקודת גובה לא עובדת', fix:'בודקים CamelCase: tello.flyUp(150); ולא tello.flyup(150); וכן סוגריים ונקודה־פסיק.' },
      { problem:'הרחפן “מדלג” על תחנת מדידה', fix:'מוסיפים sleep ארוך יותר מעל התחנה ובודקים שלא חסרה פקודת flyDown/flyUp.' },
      { problem:'המסלול לא מגיע למנחת', fix:'מחלקים את הקוד לשלבים עם הערות ומריצים עד נקודת ביניים אחת בכל פעם.' }
    ],
    differentiation: {
      support: ['לתת תרשים מסלול עם שלבי קוד חסרים להשלמה.', 'לאפשר לצוותים מתקשים להשלים רק מנחת → רכס → סייסמוגרף.', 'להשתמש בצבעים: כחול לתנועה אופקית, אדום לגובה, ירוק ל־sleep/מדידה.'],
      extension: ['להוסיף משתנים const ridgeHeight = 150 ו־const sensorPause = 4.', 'להוסיף הערות מקצועיות לכל שלב משימה.', 'ליצור גרסה חלופית עם גובה בטוח שונה ולהשוות אם המסלול עדיין עובד.' ]
    },
    instructorGuide: {
      prerequisites:'שיעור 3 ממשיך את שיעור 2: התלמידים כבר יודעים להשוות אסטרטגיות ניווט במישור 150 ס״מ ויודעים ש־sleep משפיע על יציבות. כעת מוסיפים ציר Z, סביבת Mars כבדה יותר, ונוהל ענן/Share Link כחלק מתוצר מקצועי.',
      pedagogy:['לא להפוך את Mars Simulator לאטרקציה גרפית בלבד — המשימה היא תכנון 3D וייצוב חיישנים.', 'לדרוש שמירה בענן בתחילת השיעור, לא רק בסוף, כדי למנוע אובדן עבודה.', 'להדגיש שמאדים הוא הקשר מדעי שמצדיק תכנון אוטונומי: אין שליטה ידנית בזמן אמת.', 'להפריד בין קוד פתרון במערך מדריך לבין שקופיות נקיות שאינן נותנות העתקה מלאה.', 'אם הסימולטור כבד בטאבלטים, Mars Low graphics או Minimal Grid עדיפים על שיעור תקוע.', 'המצגת ממוקדת בשיעור זה ואינה חוזרת על שקופיות פתיחה גנריות.' ],
      exitTicket:'במשימת Mars Seismic Scan פקודת sleep חשובה כי ___; שמירה בענן חשובה כי ___. '
    },
    appWorkflowTitle: 'משימת טאבלט — Mars Simulator ו־Share Link',
    appWorkflowNote: 'מפגש 3 מתבצע ב־DroneBlocks Code וב־Mars Simulator בלבד. האתר מציג את תדריך המשימה; הקוד, ההרצה, השמירה והשיתוף מתבצעים באפליקציה.',
    appWorkflow: [
      { title:'פתיחה ושמירה בענן', detail:'התחברו ל־WiFi בית ספרי, פתחו DroneBlocks Code, Login/Register, וצרו Mars_Seismic_Scan_TeamX.' },
      { title:'בחירת Mars Simulator', detail:'עברו לסימולטור מאדים. אם הטאבלט איטי, הורידו גרפיקה ל־Low וסגרו אפליקציות רקע.' },
      { title:'תכנון תלת־ממדי', detail:'שרטטו מנחת, רכס בזלת 150 ס״מ, תחנת סייסמוגרף 80 ס״מ, פאנלים סולאריים 220 ס״מ ומנחת מוגן.' },
      { title:'כתיבה והרצה', detail:'כתבו את רצף Ingenuity‑2: takeoff, sleep, flyUp(150), flyForward(250), flyDown(70), sleep, flyUp(140), yawRight, flyForward(200), land.' },
      { title:'דיבוג ושיתוף', detail:'תקנו שגיאת סינטקס/לוגיקה אחת, הוסיפו הערת // על ייצוב חיישנים, שמרו והפיקו Share Link.' }
    ],
    codeSamples: [
      { title:'Mars Seismic Scan — קוד מלא למדריך', code:'// MARS SIMULATOR - SEISMIC SCAN AND SOLAR SHIELD MISSION\n// Drone Intelligence Lab - Meeting 3\n// Metric System: all distances are centimeters\n\ntello.takeoff();\ntello.sleep(3); // ייצוב ראשוני באטמוספירה הדלילה\n\ntello.flyUp(150); // מעל רכס בזלת\ntello.sleep(2);\n\ntello.flyForward(250); // תחנה א׳: סייסמוגרף\ntello.sleep(2);\n\ntello.flyDown(70); // ירידה לגובה 80 ס״מ\ntello.sleep(4); // קריאת נתונים סייסמיים יציבה\n\ntello.flyUp(140); // גובה מצטבר 220 ס״מ\ntello.sleep(2);\ntello.yawRight(90);\ntello.sleep(2);\n\ntello.flyForward(200); // פאנלים סולאריים\ntello.sleep(3);\n\ntello.yawRight(90);\ntello.sleep(2);\ntello.flyForward(300);\ntello.sleep(2);\n\ntello.land();' }
    ],
    visualDiagram: { title:'Mars Seismic Scan — מסלול Ingenuity‑2', caption:'מנחת המראה → עלייה 150 ס״מ מעל רכס בזלת → תחנת סייסמוגרף בגובה 80 ס״מ → עלייה לגובה 220 ס״מ לסריקת פאנלים → מנחת נחיתה מוגן.', chip:'Mars Simulator', panelTitle:'🗺️ תרשים משימת מאדים', src:'assets/drone-intelligence-lab-grade9/lesson3/mars-seismic-scan.svg', alt:'תרשים מסלול Mars Seismic Scan בסימולטור מאדים בשיטה מטרית' },
    screenshotSlides: [
      { title:'תרשים התרגיל — Mars Seismic Scan', src:'assets/drone-intelligence-lab-grade9/lesson3/mars-seismic-scan.svg', caption:'המחשה לכיתה: מסלול תלת־ממדי במאדים עם רכס בזלת 150 ס״מ, סייסמוגרף בגובה 80 ס״מ, פאנלים בגובה 220 ס״מ ונחיתה בטוחה.' }
    ],
    instructorSlides: [
      { title:'משימת Ingenuity‑2 במכתש ג׳זרו', body:'NASA JPL ו־ESA צריכים רחפן שמוצא סייסמוגרפים ופאנלים אחרי סערת חול. אין שליטה ידנית — רק קוד אוטונומי.', bullets:['Jezero Crater', 'סייסמוגרפים', 'פאנלים סולאריים'] },
      { title:'מאדים משנה את כללי הטיסה', body:'אטמוספירה דלילה מקשה על עילוי וגורמת לתנודות. לכן sleep אינו קישוט — הוא זמן ייצוב חיישנים.', bullets:['<1% אטמוספירה', 'Oscillations', 'sleep'] },
      { title:'ציר Z מטרי', body:'המשימה משלבת גובה ומרחק: עולים 150 ס״מ, יורדים 70 ס״מ לגובה 80, ועולים 140 ס״מ לגובה 220.', bullets:['flyUp(150)', 'flyDown(70)', 'גובה 220 ס״מ'] },
      { title:'Cloud Sync הוא חלק מהמשימה', body:'קוד שלא נשמר ולא שותף לא ניתן לבדיקה מקצועית. היום Share Link הוא תוצר חובה.', bullets:['Login/Register', 'Save', 'Share Link'] },
      { title:'מפת משימת המאדים', body:'מנחת, רכס בזלת, סייסמוגרף, פאנלים ומנחת מוגן — כל תחנה דורשת פקודות גובה, תנועה וייצוב.', bullets:['150 ס״מ', '80 ס״מ', '220 ס״מ'] }
    ]
  };

  const lessonFourFinal = {
    title: 'שיעור 4: Methane LoopScan — לולאות for, משתנים דינמיים ושיטה מטרית',
    subtitle: 'Code Optimization, let variables, for loop, metric scan route ו־Dynamic Field Update',
    concept: 'Code Optimization, לולאות for, משתנים דינמיים ושיטה מטרית בסנטימטרים',
    story: 'צוותי כיתה ט׳ עתודה פועלים כמהנדסי בקרה וסביבה במשרד להגנת הסביבה. עליהם לתכנת רחפן עם חיישן לייזר למדידת מתאן CH4 מעל אזור מטמנת דודאים, במסלול זיגזג מטרי שמכסה ארבעה שבילים מקבילים.',
    mission: 'לכתוב ב־DroneBlocks Code משימת JavaScript סימולטיבית בלבד ב־City Simulator או Minimal Grid: הגדרת משתנים מטריים בראש הקוד, המראה ועלייה לגובה עבודה, לולאת for שמבצעת שני מחזורי הלוך־חזור לכיסוי 4 שבילים, ואתגר שינוי שטח שבו משנים רק ערכי משתנים.',
    workspaceMode: 'droneblocks-app',
    physicalFlightAllowed: false,
    presentationMode: 'focused',
    blocks: ['variable','loop','takeoff','sleep','flyUp','flyForward','flyRight','flyBackward','condition','land','share'],
    essentialQuestion: 'איך לולאת for ומשתנים דינמיים הופכים מסלול סריקה ארוך לקוד קצר, גמיש וקל לתחזוקה כשהשטח משתנה?',
    successCriteria: [
      'אני עובד/ת בשיטה מטרית בלבד ומבין/ה שכל המרחקים בקוד מייצגים סנטימטרים.',
      'אני מגדיר/ה משתנים כמו scanLength, transitionDist ו־safeAltitude בראש הקוד.',
      'אני מסביר/ה את מבנה for: let i = 0, תנאי עצירה, i++ וסוגריים מסולסלים.',
      'אני בונה/ה מסלול זיגזג של 4 שבילים בעזרת לולאה ולא בהעתקה ארוכה.',
      'אני משנה רק משתנים באתגר הדינמי ומוכיח/ה שהקוד נשאר גמיש.',
      'אני שומר/ת פרויקט בשם Meeting4_Methane_Loop_Grade9 ומפיק/ה Share Link.'
    ],
    realWorldUses: [
      { icon:'♻️', title:'מדידת פליטות מתאן', text:'רחפן עם חיישן גז יכול לסרוק אזור מטמנה ולאתר ריכוזי CH4 בלי לסכן צוותי שטח.' },
      { icon:'🔁', title:'אופטימיזציית קוד', text:'לולאה מחליפה חזרתיות ארוכה בקוד קצר יותר, קריא יותר וקל יותר לתחזוקה.' },
      { icon:'📏', title:'משתנים ושיטה מטרית', text:'כשהשטח משתנה, מעדכנים מספרים בראש הקוד במקום לערוך עשרות שורות.' }
    ],
    vocabulary: [
      ['Code Optimization','שיפור קוד כך שיהיה קצר, ברור, אמין וקל לתחזוקה.'],
      ['for loop','מבנה JavaScript שמריץ קטע קוד מספר מוגדר של פעמים.'],
      ['let i = 0','אתחול מונה הלולאה; מתחילים לספור מאפס.'],
      ['i < 2','תנאי עצירה: הלולאה ממשיכה כל עוד התנאי נכון.'],
      ['i++','קידום המונה באחד בסוף כל סיבוב.'],
      ['Variable / משתנה','שם שמחזיק ערך דינמי כמו אורך שביל, מעבר צדדי או גובה עבודה.'],
      ['Metric System','עבודה בסנטימטרים ומטרים בלבד; 150 ס״מ = 1.5 מטר.' ]
    ],
    safetyRules: [
      'מפגש 4 הוא סימולטור בלבד — הרחפנים הפיזיים נשארים בארון.',
      'אין TELLO WiFi, אין סוללות, אין מנועים ואין ניסוי פיזי של הזיגזג.',
      'כל המרחקים בשיעור זה מנוהלים בשיטה מטרית: סנטימטרים בלבד.',
      'לפני Run בודקים שהלולאה נסגרת בסוגר מסולסל } ושיש land בסוף.',
      'אחרי כל מקטע תנועה מוסיפים sleep כדי לדמות קריאת חיישן גז יציבה.',
      'אם City Simulator איטי — עוברים ל־Minimal Grid בלי לפגוע במטרת השיעור.'
    ],
    commonDirections: [
      ['let scanLength = 150;','אורך שביל סריקה: 150 ס״מ.'],
      ['let transitionDist = 80;','מרחק מעבר בין שבילים: 80 ס״מ.'],
      ['let safeAltitude = 100;','גובה עבודה בטוח: 100 ס״מ.'],
      ['for (let i = 0; i < 2; i++)','שני מחזורי סריקה, כל מחזור כולל הלוך וחזור.'],
      ['if (i < 1)','מעבר צדדי נוסף רק אם לא הגענו למחזור האחרון.'],
      ['scanLength = 220 / safeAltitude = 130','אתגר דינמי: שינוי נתונים בלי לשנות לוגיקה.' ]
    ],
    setupSteps: [
      'טאבלטים טעונים ומחוברים ל־WiFi בית ספרי.',
      'DroneBlocks Code פתוח וחשבון ענן מחובר.',
      'פרויקט חדש בשם Meeting4_Methane_Loop_Grade9.',
      'בחירת City Simulator או Minimal Grid; אם יש Lag עוברים ל־Minimal Grid.',
      'דף עזר ללולאות ומשתנים פתוח לצד הטאבלט.'
    ],
    tabletTips: [
      'כתבו קודם את שלושת המשתנים בראש הקובץ ורק אחר כך את המסלול.',
      'בדקו שהלולאה כוללת סוגריים עגולים, נקודה־פסיק בין חלקי ה־for וסוגריים מסולסלים.',
      'השתמשו ב־scanLength ו־transitionDist בתוך הפקודות במקום מספרים קבועים.',
      'שמרו גרסה לפני אתגר השינוי הדינמי.',
      'באתגר המטרי משנים רק scanLength ו־safeAltitude — לא את גוף הלולאה.',
      'אם יש SyntaxError, התחילו מבדיקת הסוגריים המסולסלים של הלולאה.'
    ],
    lessonFlow: [
      { minutes:'0–6', title:'בדיקת תנאי קדם משיעור 3', teacher:'מחבר מ־Mars 3D לשיעור 4: כבר השתמשנו בגובה, sleep ושמירה בענן; היום נהפוך רצף חוזר לאלגוריתם.', students:'פותחים קוד קודם ומזהים פקודה אחת שחזרה יותר מפעם אחת.' },
      { minutes:'6–14', title:'סיפור מסגרת — אתגר מתאן בדודאים', teacher:'מציג את מטמנת דודאים, פליטות CH4 וחיישן לייזר רחפני. מדגיש שהמשימה סביבתית ולא טיסת ראווה.', students:'מנסחים למה סריקה שיטתית עדיפה על טיסה אקראית.' },
      { minutes:'14–26', title:'לולאות for ומשתנים', teacher:'מפרק על הלוח for (let i = 0; i < 2; i++) ומדגים scanLength/transitionDist/safeAltitude בשיטה מטרית.', students:'מסמנים את שלושת חלקי הלולאה ומסבירים מה קורה בכל סיבוב.' },
      { minutes:'26–35', title:'תכנון מסלול מטרי', teacher:'מציג את תרשים הזיגזג: 4 שבילים של 150 ס״מ, מעברים של 80 ס״מ וגובה 100 ס״מ.', students:'משרטטים מסלול וממקמים היכן צריך הלוך, מעבר, חזור ומעבר נוסף.' },
      { minutes:'35–43', title:'פתיחה ושמירת פרויקט', teacher:'מוביל WiFi בית ספרי, Login, פתיחת Meeting4_Methane_Loop_Grade9 ושמירה בענן.', students:'יוצרים קובץ ושומרים גרסה ריקה לפני כתיבת קוד.' },
      { minutes:'43–56', title:'כתיבת שלד משתנים והמראה', teacher:'מלווה כתיבת let scanLength, transitionDist, safeAltitude ואז takeoff, sleep, flyUp(safeAltitude).', students:'כותבים שלד ומריצים בדיקת סינטקס ראשונית.' },
      { minutes:'56–73', title:'אתגר הסריקה — לולאת הזיגזג', teacher:'מנחה כתיבת for של 2 מחזורים: forward, right, backward, ותנאי if למעבר האחרון.', students:'כותבים, מריצים ומתקנים שגיאות סוגריים/סינטקס.' },
      { minutes:'73–82', title:'The Metrical Challenge', teacher:'נותן עדכון שטח: scanLength=220 ו־safeAltitude=130. דורש לשנות רק משתנים.', students:'מעדכנים רק את ערכי המשתנים ומריצים שוב כדי להוכיח גמישות.' },
      { minutes:'82–90', title:'שיתוף וסיכום', teacher:'אוסף Share Links ומוביל רפלקציה: כמה שורות חסכנו ולמה משתנים עוזרים בשטח משתנה.', students:'שומרים, משתפים ומגישים משפט: “הלולאה חסכה לנו ___ כי ___”.' }
    ],
    exercises: [
      { minutes:'0–6', title:'גשר Mars → Loop', prompt:'מצאו בקוד Mars פעולה שחוזרת וכתבו איך לולאה הייתה יכולה לעזור.', check:'התלמיד מזהה חזרתיות כבסיס לאופטימיזציה.' },
      { minutes:'14–26', title:'פירוק for', prompt:'סמנו בתוך for (let i = 0; i < 2; i++) את ההתחלה, תנאי העצירה וקידום המונה.', check:'התלמיד יודע להסביר את i ואת מספר המחזורים.' },
      { minutes:'26–35', title:'שרטוט זיגזג מטרי', prompt:'שרטטו 4 שבילים: 150 ס״מ לכל שביל, 80 ס״מ בין שבילים וגובה 100 ס״מ.', check:'השרטוט מתאים למסלול הלוך־חזור ולא לקוד אקראי.' },
      { minutes:'43–56', title:'שלד משתנים', prompt:'כתבו scanLength=150, transitionDist=80, safeAltitude=100 והשתמשו ב־safeAltitude ב־flyUp.', check:'הקוד מפריד נתונים מלוגיקה.' },
      { minutes:'56–73', title:'אתגר LoopScan', prompt:'כתבו לולאת for לשני מחזורים שכל מחזור כולל שביל הלוך, מעבר, שביל חזור ומעבר לפי הצורך.', check:'הקוד מכסה 4 שבילים ומסתיים ב־land.' },
      { minutes:'73–82', title:'אתגר שינוי מטרי', prompt:'עדכנו רק scanLength ל־220 ו־safeAltitude ל־130 והריצו מחדש.', check:'גוף הלולאה לא השתנה.' },
      { minutes:'82–90', title:'הגשה והמלצה', prompt:'שתפו Link וכתבו כמה שורות נחסכו לעומת קוד לינארי.', check:'יש Share Link/צילום מסך ונימוק אופטימיזציה.' }
    ],
    deliverable: 'Share Link או צילום מסך לפרויקט Meeting4_Methane_Loop_Grade9 הכולל משתנים מטריים, לולאת for לסריקת 4 שבילים, ואתגר דינמי שבו שונו רק scanLength ו־safeAltitude.',
    assessment: [
      'הקוד משתמש בשיטה מטרית עקבית בסנטימטרים.',
      'המשתנים scanLength, transitionDist ו־safeAltitude מוגדרים בראש הקוד ומשמשים בפקודות.',
      'לולאת for כתובה בסינטקס תקין עם סוגריים מסולסלים.',
      'הקוד מכסה ארבעה שבילים בעזרת שני מחזורי הלוך־חזור.',
      'התלמיד מסביר כיצד שינוי משתנים פתר את האילוץ הדינמי בלי לשכתב לוגיקה.'
    ],
    debugging: [
      { problem:'City Simulator איטי או קופא', fix:'עוברים ל־Minimal Grid, סוגרים אפליקציות רקע וממשיכים באותו מסלול לוגי.' },
      { problem:'Uncaught SyntaxError בלולאת for', fix:'בודקים סוגריים עגולים, נקודה־פסיק בין חלקי ה־for, i++ וסוגר מסולסל סוגר }.' },
      { problem:'הקוד רץ רק פעם אחת או יותר מדי פעמים', fix:'בודקים את תנאי העצירה i < 2 ומסבירים ששני מחזורים יוצרים ארבעה שבילים.' },
      { problem:'אתגר השינוי דורש עריכת הרבה שורות', fix:'סימן שהמספרים הוקלדו בגוף הקוד. מחליפים אותם בשמות המשתנים.' },
      { problem:'Share Link נכשל', fix:'בודקים שהטאבלט על WiFi בית ספרי עם אינטרנט ולא מחובר בטעות לרשת Tello ללא אינטרנט.' }
    ],
    differentiation: {
      support: ['לתת שלד for מוכן עם מקומות ריקים למשתנים.', 'לאפשר לצוות מתקשה לבנות קודם מחזור אחד: forward/right/backward.', 'להשתמש בתרשים עם צבעים: ירוק למשתנים, כחול לתנועה, כתום ללולאה.'],
      extension: ['להוסיף let cycles = 2 ולהשתמש ב־i < cycles.', 'לחשב כמה שורות היה דורש קוד לינארי מלא ולהשוות ללולאה.', 'להוסיף if שמונע מעבר צדדי אחרי המחזור האחרון ולהסביר למה הוא נדרש.' ]
    },
    instructorGuide: {
      prerequisites:'שיעור 4 ממשיך את שיעור 3: התלמידים כבר עבדו עם flyUp/flyDown, sleep ושמירה בענן. כעת הם מזהים חזרתיות במסלול והופכים אותה ללולאת for עם משתנים דינמיים. זהו עדיין שיעור סימולטור בלבד וללא רחפן פיזי.',
      pedagogy:['להדגיש שהמעבר לשיטה מטרית הוא החלטה מקצועית: הנתונים צריכים להיות מובנים ומדידים.', 'לא לתת לתלמידים להעתיק קוד ארוך לפני שהם מזהים את הדפוס החוזר בתרשים.', 'האתגר הדינמי הוא מבחן ההבנה האמיתי: אם משנים רק משתנים — הארכיטקטורה טובה.', 'להסביר ש־for עם 2 מחזורים יוצר 4 שבילים כי כל מחזור כולל הלוך וחזור.', 'לשמור את קוד הפתרון במערך מדריך בלבד; במצגת להציג תרשים, מושגים ושאלות.' ],
      exitTicket:'משתנים דינמיים עזרו לי כי ___; לולאת for חסכה ___ לעומת קוד לינארי.'
    },
    appWorkflowTitle: 'משימת טאבלט — Methane LoopScan ב־DroneBlocks Code',
    appWorkflowNote: 'מפגש 4 מתבצע ב־DroneBlocks Code וב־City Simulator או Minimal Grid בלבד. אין טיסה פיזית. הדגש הוא כתיבת JavaScript טקסטואלי עם משתנים ולולאת for בשיטה מטרית.',
    appWorkflow: [
      { title:'פתיחה ושמירה', detail:'התחברו ל־WiFi בית ספרי, פתחו DroneBlocks Code, Login, וצרו Meeting4_Methane_Loop_Grade9.' },
      { title:'בחירת סימולטור', detail:'בחרו City Simulator או Minimal Grid. אם יש Lag, עברו מיד ל־Minimal Grid.' },
      { title:'משתנים מטריים', detail:'כתבו בראש הקוד scanLength=150, transitionDist=80, safeAltitude=100. כל הערכים בסנטימטרים.' },
      { title:'לולאת זיגזג', detail:'כתבו for לשני מחזורים: flyForward(scanLength), flyRight(transitionDist), flyBackward(scanLength), ומעבר נוסף רק אם i < 1.' },
      { title:'אתגר דינמי והגשה', detail:'שנו רק scanLength ל־220 ו־safeAltitude ל־130, הריצו מחדש, שמרו ושתפו Share Link.' }
    ],
    codeSamples: [
      { title:'Methane Scan Algorithm — קוד מלא למדריך', code:'// METHANE SCAN ALGORITHM - MEETING 4 (GRADE 9)\n// All distances are in centimeters\n\nlet scanLength = 150;\nlet transitionDist = 80;\nlet safeAltitude = 100;\n\ntello.takeoff();\ntello.sleep(3);\ntello.flyUp(safeAltitude);\ntello.sleep(2);\n\nfor (let i = 0; i < 2; i++) {\n  tello.flyForward(scanLength);\n  tello.sleep(2);\n\n  tello.flyRight(transitionDist);\n  tello.sleep(2);\n\n  tello.flyBackward(scanLength);\n  tello.sleep(2);\n\n  if (i < 1) {\n    tello.flyRight(transitionDist);\n    tello.sleep(2);\n  }\n}\n\ntello.land();' }
    ],
    visualDiagram: { title:'Methane LoopScan — סריקת זיגזג מטרית', caption:'4 שבילים מקבילים במטמנת דודאים: scanLength=150 ס״מ, transitionDist=80 ס״מ, safeAltitude=100 ס״מ. באתגר הדינמי משנים רק משתנים ל־220/130.', chip:'Metric Loop', panelTitle:'🗺️ תרשים סריקת מתאן', src:'assets/drone-intelligence-lab-grade9/lesson4/methane-loop-scan.svg', alt:'תרשים מסלול זיגזג מטרי לסריקת מתאן עם לולאת for ומשתנים' },
    screenshotSlides: [
      { title:'תרשים התרגיל — Methane LoopScan', src:'assets/drone-intelligence-lab-grade9/lesson4/methane-loop-scan.svg', caption:'המחשה לכיתה: ארבעה שבילים מקבילים, ערכי משתנים מטריים בראש הקוד ולולאת for שמכסה את כל אזור הסריקה.' }
    ],
    instructorSlides: [
      { title:'אתגר מתאן בדודאים', body:'המשרד להגנת הסביבה צריך סריקת CH4 מעל מטמנה: ארבעה שבילים של 150 ס״מ, מעבר 80 ס״מ וגובה חיישן 100 ס״מ.', bullets:['CH4', '4 שבילים', '150/80/100 ס״מ'] },
      { title:'מקוד לינארי לאלגוריתם', body:'במקום להעתיק עשרות שורות, מזהים דפוס חוזר ומכניסים אותו ללולאה. פחות קוד = פחות נקודות כשל.', bullets:['חזרתיות', 'תחזוקה', 'פחות שגיאות'] },
      { title:'for בשלושה חלקים', body:'אתחול מונה, תנאי עצירה וקידום מונה קובעים כמה פעמים הקוד ירוץ. שני מחזורים יוצרים ארבעה שבילים: הלוך וחזור בכל מחזור.', bullets:['let i = 0', 'i < 2', 'i++'] },
      { title:'משתנים הם לוח הבקרה', body:'כאשר השטח משתנה, משנים ערך אחד בראש הקוד ולא את כל המסלול. זה ההבדל בין קוד קשיח לקוד הנדסי.', bullets:['scanLength', 'transitionDist', 'safeAltitude'] },
      { title:'The Metrical Challenge', body:'עדכון מהשטח: השביל גדל ל־220 ס״מ והגובה ל־130 ס״מ. אם הקוד באמת מודולרי — גוף הלולאה לא משתנה.', bullets:['שנו רק משתנים', 'לא את הלולאה', 'הרצה חוזרת'] }
    ]
  };


  const lessonFiveFinal = {
    title: 'שיעור 5: SpaceX Static Fire — מעבר למציאות, בטיחות והטסה פיזית ראשונה',
    subtitle: 'Simulation‑to‑Reality Gap, WiFi Handshake, Pre‑Flight, Peer Programming וכיול מטרי',
    concept: 'הטסה פיזית ראשונה, פער סימולציה־מציאות, בטיחות וכיול אלגוריתמי',
    story: 'צוותי כיתה ט׳ עתודה נכנסים לתפקיד מהנדסי שיגור ואינטגרציה ב־SpaceX. אחרי ארבעה שיעורי סימולטור, מבצעים Static Fire כיתתי: בדיקה קצרה ומבוקרת שהחומרה, החיישנים, הקשר והקוד מגיבים יחד לפי תוכנית JavaScript.',
    mission: 'לטעון מהענן קוד ריבוע מטרי, לבצע WiFi Handshake לרחפן Tello, לעבור Pre‑Flight Safety Check, להריץ פיזית ריבוע של 100 ס״מ בגובה 100 ס״מ בתוך Safe Fly Zone, למדוד סטייה ולשמור גרסת כיול.',
    workspaceMode: 'physical-lab',
    blocks: ['safety_check','wifi','battery','takeoff','sleep','flyUp','flyForward','flyRight','flyBackward','flyLeft','abort','land','debug','share'],
    essentialQuestion: 'מה משתנה כשקוד שעבד בסימולטור פוגש רחפן פיזי, ואיך צוות מהנדסים מכייל אותו בלי לוותר על בטיחות?',
    successCriteria: [
      'אני מבצע/ת WiFi Handshake: בית ספרי לטעינת קוד, ואז Tello‑XXXX להרצה פיזית.',
      'אני עובד/ת בצוות Driver/Navigator/Observer עם תפקידים ברורים לפני כל המראה.',
      'אני מפעיל/ה רחפן פיזי רק בתוך Safe Fly Zone, עם משקפי מגן ומגיני פרופלורים.',
      'אני מריץ/ה משימת ריבוע מטרי קצרה ומסיים/ת ב־tello.land(); או Abort לפי צורך.',
      'אני מודד/ת סטייה ומבצע/ת כיול דרך משתנה sideLength במקום שינוי אקראי של כל הקוד.'
    ],
    realWorldUses: [
      { icon:'🚀', title:'Static Fire', text:'לפני שיגור אמיתי בודקים חומרה, תקשורת ותגובה לפקודות בסביבה מבוקרת וקצרה.' },
      { icon:'📐', title:'Sim‑to‑Reality Gap', text:'רחפן אמיתי מושפע מרצפה, זרמי אוויר, סוללה וחיישנים — לכן תוצאה פיזית לא תמיד זהה לסימולטור.' },
      { icon:'🛡️', title:'תרבות בטיחות', text:'תפקידים, הכרזה קולית, אזור סטרילי ו־Abort הם חלק מהאלגוריתם המבצעי, לא תוספת.' }
    ],
    vocabulary: [
      ['Static Fire','בדיקת מערכת קצרה ומבוקרת לפני הפעלה מלאה.'],
      ['Simulation‑to‑Reality Gap','הפער בין ביצוע מושלם בסימולטור לבין סטיות בעולם הפיזי.'],
      ['WiFi Handshake','מעבר מבוקר בין רשת בית ספרית עם אינטרנט לבין רשת Tello ללא אינטרנט.'],
      ['Pre‑Flight Check','בדיקת בטיחות לפני טיסה: סוללה, פרופלורים, מגינים, מרחב ותפקידים.'],
      ['Observer','תצפיתן בטיחות ששומר קשר עין ומכריז לפני המראה.'],
      ['Calibration','התאמת פרמטרים בקוד כדי לפצות על סטייה פיזית.'],
      ['Abort','עצירת חירום/נחיתה מיידית אם יש סיכון.' ]
    ],
    safetyRules: [
      'זהו מפגש הטסה פיזי ראשון — טסים רק באישור מדריך ורק בתוך מלבן הטיסה המסומן.',
      'משקפי מגן, שיער אסוף ומגיני פרופלורים הם תנאי להמראה, לא המלצה.',
      'לפני כל הרצה ה־Observer מכריז: “רחפנים באוויר! צוות X ממריא!”.',
      'אין להיכנס למלבן הטיסה כשהרחפן באוויר; רק המדריך רשאי להתקרב במקרה צורך.',
      'Abort/Land עדיף על ניסיון להציל משימה מסוכנת.',
      'בסיום מוציאים סוללה מיד ומעבירים לקופסת ריקות; לא מאחסנים רחפן עם סוללה בפנים.'
    ],
    commonDirections: [
      ['WiFi בית ספרי','טעינת פרויקט מהענן ושמירת גרסה.'],
      ['Tello‑XXXX','חיבור לרחפן הפיזי לצורך Run בלבד.'],
      ['let sideLength = 100;','צלע ריבוע פיזי: 100 ס״מ.'],
      ['let safeAltitude = 100;','גובה עבודה ראשון: 100 ס״מ.'],
      ['Abort','עצירה מיידית אם הרחפן סוטה לכיוון גבול המלבן.'],
      ['Meeting5_Static_Fire_Calibrated_v2','שם גרסת הכיול שנשמרת אחרי הניסוי.' ]
    ],
    setupSteps: [
      'מסמנים Safe Fly Zone על רצפת הכיתה בסרט צבעוני לפני כניסת התלמידים.',
      'רחפן אחד לכל צוות של 3 תלמידים, מגיני פרופלורים מותקנים מראש.',
      'סוללות ממוספרות: קופסת מלאות 100% וקופסת ריקות 0%.',
      'משקפי מגן זמינים לכל צוות מטיס.',
      'הקוד משיעור 4 או קוד ריבוע מטרי קצר זמין בענן לפני מעבר ל־Tello WiFi.'
    ],
    tabletTips: [
      'לפני חיבור ל־Tello, טענו ושמרו את הקוד על WiFi בית ספרי.',
      'אחרי מעבר ל־Tello‑XXXX ייתכן שאין אינטרנט — זה תקין לצורך הרצה פיזית.',
      'ודאו שכפתור Abort/נחיתה ידנית גלוי לפני Run.',
      'שמרו גרסת v1 לפני הרצה ו־Calibrated_v2 אחרי תיקון.',
      'בכיול משנים רק sideLength או safeAltitude, לא כמה דברים יחד.',
      'אם החיבור לרחפן מתנתק — לא מריצים שוב עד בדיקת מדריך.'
    ],
    lessonFlow: [
      { minutes:'0–6', title:'בדיקת תנאי קדם משיעור 4', teacher:'מחבר ל־Methane LoopScan: משתנים ולולאות עזרו לקוד גמיש; היום נראה למה משתנה בודד קריטי לכיול פיזי.', students:'פותחים/מזכירים קוד ריבוע מטרי ומזהים את sideLength או מרחק הצלע.' },
      { minutes:'6–14', title:'סיפור מסגרת — SpaceX Static Fire', teacher:'מציג את הרעיון: לא “מטיסים בשביל הכיף”, אלא מבצעים בדיקת מערכת מבוקרת כמו לפני שיגור.', students:'מנסחים איזה רכיב נבדק היום: קוד, חיישן, סוללה, WiFi או צוות.' },
      { minutes:'14–26', title:'חוקי בטיחות ותפקידים', teacher:'מחלק Driver/Navigator/Observer ומדגים הכרזת “רחפנים באוויר”. בודק משקפי מגן, שיער, מגינים ואזור סטרילי.', students:'מתחלקים לתפקידים ומבצעים Pre‑Flight מילולי לפני נגיעה ברחפן.' },
      { minutes:'26–38', title:'WiFi Handshake והורדת קוד', teacher:'מוביל: WiFi בית ספרי → Login → Load פרויקט → שמירה → מעבר ל־Tello‑XXXX.', students:'טוענים קוד, מוודאים שם גרסה ועוברים לרשת הרחפן רק באישור.' },
      { minutes:'38–45', title:'Pre‑Flight פיזי', teacher:'בודק פרופלורים, מגיני פרופלור, סוללה מלאה, מנחת, כיוון אף וכפתור Abort.', students:'Observer מניח רחפן במרכז המנחת ומכריז מוכנות.' },
      { minutes:'45–62', title:'הרצת Static Fire — ריבוע מטרי', teacher:'מאשר צוותים אחד־אחד להריץ ריבוע 100 ס״מ בגובה 100 ס״מ בתוך המלבן.', students:'Driver מריץ, Observer שומר קשר עין, Navigator מודד סטייה ומתעד.' },
      { minutes:'62–74', title:'כיול Sim‑to‑Reality', teacher:'מנחה חזרה לשולחן ושינוי משתנה יחיד: למשל sideLength מ־100 ל־110 אם הרחפן טס קצר.', students:'משנים פרמטר אחד, שומרים v2 ומבקשים אישור להרצה נוספת.' },
      { minutes:'74–82', title:'הרצת כיול קצרה', teacher:'מאשר סבב שני קצר רק לצוותים שעברו בדיקה. עוצר מיד במקרה Drift מסוכן.', students:'מריצים גרסת v2 או צופים בצוות אחר ומנתחים תוצאה.' },
      { minutes:'82–90', title:'תחזוקה, סוללות וסיכום', teacher:'מנהל הוצאת סוללות לקופסת ריקות, איסוף רחפנים, שמירת Meeting5_Static_Fire_Calibrated_v2 ורפלקציה.', students:'מוציאים סוללה באישור, מחזירים ציוד, שומרים/משתפים וכותבים מה הפתיע במציאות.' }
    ],
    exercises: [
      { minutes:'0–6', title:'גשר משתנים לכיול', prompt:'כתבו איזה משתנה בקוד הכי נוח לשנות אם הרחפן טס 90 ס״מ במקום 100 ס״מ.', check:'התלמיד מזהה sideLength/מרחק כפרמטר כיול.' },
      { minutes:'14–26', title:'חלוקת תפקידים', prompt:'קבעו Driver, Navigator ו־Observer וכתבו משפט אחריות לכל תפקיד.', check:'כל תלמיד יודע מה תפקידו לפני המראה.' },
      { minutes:'26–38', title:'WiFi Handshake', prompt:'בצעו: WiFi בית ספרי → Load/Save → Tello‑XXXX. אל תריצו לפני אישור.', check:'הקוד נטען והטאבלט מחובר לרחפן הנכון.' },
      { minutes:'38–45', title:'Pre‑Flight Check', prompt:'בדקו משקפי מגן, שיער, מגיני פרופלורים, סוללה מלאה, אזור סטרילי ו־Abort גלוי.', check:'המדריך מאשר לפני Run.' },
      { minutes:'45–62', title:'Static Fire Run', prompt:'הריצו ריבוע 100 ס״מ בגובה 100 ס״מ וצפו בלי להיכנס למלבן.', check:'הרחפן המריא, ביצע מסלול קצר ונחת/נעצר בבטחה.' },
      { minutes:'62–74', title:'מדידת Drift וכיול', prompt:'מדדו סטייה אחת ועדכנו רק sideLength או safeAltitude בגרסת v2.', check:'השינוי מבוסס מדידה ולא ניחוש.' },
      { minutes:'82–90', title:'תחזוקה והגשה', prompt:'שמרו Meeting5_Static_Fire_Calibrated_v2, הוציאו סוללה לקופסת ריקות ושתפו תיעוד.', check:'הציוד בטוח והתוצר נשמר.' }
    ],
    deliverable: 'Share Link או צילום מסך לגרסת Meeting5_Static_Fire_Calibrated_v2 + טבלת סטייה קצרה: מה תוכנן, מה קרה בפועל, איזה משתנה שונה ולמה.',
    assessment: [
      'הצוות ביצע Pre‑Flight מלא לפני כל הרצה.',
      'ה־Observer הכריז ושמר קשר עין לאורך הטיסה.',
      'הקוד הפיזי קצר, מטרי, כולל land וניתן לעצירה ב־Abort.',
      'הכיול משנה פרמטר אחד על בסיס מדידה.',
      'נוהל סוללות וסיום ציוד בוצע ללא אחסון סוללה בתוך הרחפן.'
    ],
    debugging: [
      { problem:'Drift חזק לצדדים או קדימה/אחורה', fix:'עוצרים/מנחיתים, בודקים רצפה מבריקה או חסרת טקסטורה, מוסיפים שטיחון/בריסטול/סרטי סימון ל־VPS ורק אז מריצים שוב.' },
      { problem:'נורת Tello מהבהבת צהוב והרחפן לא מגיב', fix:'בודקים שהטאבלט מחובר לרשת Tello‑XXXX הנכונה ושאין מעבר אוטומטי לרשת אחרת/סלולר.' },
      { problem:'נורה אדומה או סירוב המראה', fix:'מחליפים לסוללה מלאה מקופסת 100%, בודקים נעילת סוללה וממתינים לאישור מדריך.' },
      { problem:'הרחפן טס פחות/יותר מ־100 ס״מ', fix:'מתעדים סטייה ומעדכנים רק sideLength בגרסת כיול v2, למשל 100→110 אם הטיסה קצרה.' },
      { problem:'תלמיד רוצה להיכנס למלבן בזמן טיסה', fix:'עוצרים את המשימה מיד. חוזרים על הכלל: אין כניסה למלבן כשהרחפן באוויר.' }
    ],
    differentiation: {
      support: ['לתת לצוותים מתקשים להריץ Takeoff → sleep → Land בלבד לפני ריבוע.', 'להצמיד תלמיד מתקשה לתפקיד Navigator עם דף מדידה ברור.', 'להשתמש בקוד ריבוע קצר מוכן ולמקד בכיול ובטיחות.'],
      extension: ['להשוות v1/v2 לפי סטייה בס״מ ולכתוב מסקנה.', 'להוסיף משתנה calibrationFactor ולחשב sideLength מתוקן.', 'להציע שיפור לסביבת הטיסה שמקטין Drift בלי לשנות קוד.' ]
    },
    instructorGuide: {
      prerequisites:'שיעור 5 הוא שער המעבר מסימולטור לפיזי. תלמידים כבר עבדו עם JavaScript, משתנים, שיטה מטרית, sleep ו־Share Link. אין להתקדם להרצה פיזית אם הקוד לא קצר וברור, אם אין אזור סטרילי מסומן, או אם תפקידי הצוות לא הוגדרו.',
      pedagogy:['להציג את הטיסה הפיזית כבדיקת מערכת מבוקרת, לא כאטרקציה.', 'להריץ צוותים אחד־אחד או בקבוצות קטנות בלבד לפי גודל הכיתה והאזור הסטרילי.', 'פער סימולציה־מציאות הוא מטרת השיעור: סטייה אינה כישלון אלא נתון כיול.', 'לא לאפשר “עוד ניסיון מהר” בלי מדידה, שינוי פרמטר אחד ואישור מדריך.', 'נוהל סוללות הוא חלק מהשיעור: הוצאה, מיון לקופסת ריקות ותיעוד.' ],
      exitTicket:'הדבר שהפתיע אותי במעבר מסימולטור למציאות הוא ___; כיול טוב צריך לשנות רק ___.'
    },
    appWorkflowTitle: 'מעבדה פיזית — SpaceX Static Fire בכיתה',
    appWorkflowNote: 'שיעור 5 כולל טיסה פיזית ראשונה רק באישור מדריך, בתוך Safe Fly Zone מסומן, עם תפקידי צוות ו־Pre‑Flight מלא. האתר מציג את התדריך; ההרצה מתבצעת ב־DroneBlocks Code מול רחפן Tello.',
    appWorkflow: [
      { title:'טעינה מהענן', detail:'על WiFi בית ספרי: פתחו DroneBlocks Code, Login, טענו קוד ריבוע מטרי ושמרו גרסת v1.' },
      { title:'מעבר לרחפן', detail:'רק באישור מדריך עברו ל־Tello‑XXXX של הצוות. ודאו שכפתור Abort/נחיתה זמין.' },
      { title:'Pre‑Flight וצוות', detail:'Driver עם הטאבלט, Navigator מודד סטייה, Observer עם משקפי מגן וקשר עין. בדקו סוללה, מגינים, אזור סטרילי וכיוון אף.' },
      { title:'הרצה וכיול', detail:'הריצו ריבוע 100 ס״מ בגובה 100 ס״מ. אם יש סטייה, חזרו לשולחן ושנו רק sideLength/גובה בגרסת v2.' },
      { title:'סגירה בטוחה', detail:'נחיתה/Abort, הוצאת סוללה לקופסת ריקות, שמירת Meeting5_Static_Fire_Calibrated_v2 ושיתוף תיעוד.' }
    ],
    codeSamples: [
      { title:'Static Fire Square — קוד קצר למדריך', code:'// SPACEX STATIC FIRE - PHYSICAL SQUARE TEST\n// All distances are centimeters\n\nlet sideLength = 100;\nlet safeAltitude = 100;\n\ntello.takeoff();\ntello.sleep(3);\ntello.flyUp(safeAltitude);\ntello.sleep(2);\n\ntello.flyForward(sideLength);\ntello.sleep(2);\ntello.flyRight(sideLength);\ntello.sleep(2);\ntello.flyBackward(sideLength);\ntello.sleep(2);\ntello.flyLeft(sideLength);\ntello.sleep(2);\n\ntello.land();\n\n// Calibration example:\n// if actual distance was 90cm, try sideLength = 110 in v2' }
    ],
    visualDiagram: { title:'SpaceX Static Fire — Safe Fly Zone', caption:'מלבן טיסה סטרילי בכיתה, ריבוע מטרי של 100 ס״מ בגובה 100 ס״מ, צוות Driver/Navigator/Observer, WiFi Handshake ושער Abort לפני כל הרצה.', chip:'Physical Gate', panelTitle:'🛡️ תרשים אזור טיסה', src:'assets/drone-intelligence-lab-grade9/lesson5/spacex-static-fire-safe-zone.svg', alt:'תרשים אזור טיסה סטרילי לשיעור הטסה פיזית ראשונה' },
    screenshotSlides: [
      { title:'תרשים התרגיל — SpaceX Static Fire', src:'assets/drone-intelligence-lab-grade9/lesson5/spacex-static-fire-safe-zone.svg', caption:'המחשה לכיתה: מלבן טיסה מסומן, מסלול ריבוע מטרי, עמדת צוות, WiFi Handshake וכיול Sim‑to‑Reality.' }
    ],
    instructorSlides: [
      { title:'זה לא “זמן טיסה” — זו בדיקת מערכת', body:'כמו Static Fire לפני שיגור, בודקים קצר, מבוקר ובטוח שהקוד והחומרה עובדים יחד.', bullets:['קוד', 'חיישנים', 'WiFi'] },
      { title:'תפקידים לפני מדחפים', body:'Driver מפעיל, Navigator בודק ומודד, Observer שומר בטיחות וקשר עין.', bullets:['Driver', 'Navigator', 'Observer'] },
      { title:'Sim‑to‑Reality Gap', body:'אם הרחפן סוטה — זה נתון כיול, לא כישלון. מתקנים פרמטר אחד בלבד.', bullets:['Drift', 'VPS', 'Calibration'] },
      { title:'שער בטיחות', body:'אין כניסה למלבן, Abort מוכן, סוללה יוצאת בסוף. דיוק הנדסי מתחיל בנוהל.', bullets:['Safe Zone', 'Abort/Land', 'Battery protocol'] }
    ]
  };


  const lessonSixFinal = {
    title: 'שיעור 6: Mars Mission Logic — לוגיקה אלגוריתמית מורכבת, If/Else וקבלת החלטות דינמית',
    subtitle: 'Conditional Logic, Booleans, stormLevel, operators && / || ו־Mars Simulator',
    concept: 'לוגיקה אלגוריתמית מורכבת, Boolean Variables, If/Else If/Else וקבלת החלטות דינמית',
    story: 'צוותי כיתה ט׳ עתודה הם צוותי פיתוח התוכנה של NASA JPL עבור Ingenuity‑2. בזמן סריקת פאנלים סולאריים במכתש ג׳זרו, תחזית מאדים מזהירה מפני סערת חול דינמית. הרחפן חייב לבחור לבד: סריקה רגילה, מעבר למנחת חירום או נחיתה מיידית.',
    mission: 'לכתוב ב־DroneBlocks Code משימת JavaScript בסימולטור Mars בלבד: משתנה stormLevel, משתני מרחק וגובה מטריים, if / else if / else שמנתבים את הרחפן לשלושה תרחישי סערה, ואתגר שבו משנים רק את stormLevel ל־3 ובודקים נחיתת חירום.',
    workspaceMode: 'droneblocks-code',
    physicalFlightAllowed: false,
    blocks: ['variable','condition','takeoff','sleep','flyUp','flyForward','flyRight','yawRight','land','share'],
    essentialQuestion: 'איך רובוט אוטונומי מקבל החלטה בטוחה לפי תנאי משתנה, בלי שלט רחוק ובלי שמפעיל אנושי יתערב בזמן אמת?',
    successCriteria: [
      'אני מסביר/ה מהו משתנה בוליאני או משתנה מצב כמו stormLevel.',
      'אני כותב/ת מבנה if / else if / else תקין עם סוגריים עגולים ומסולסלים.',
      'אני משתמש/ת באופרטורי השוואה כמו ==, >, < ובאופרטורים לוגיים כמו && / ||.',
      'אני בונה/ה שלושה מסלולים אפשריים: סריקה, חירום צדדי ונחיתה מיידית.',
      'אני משנה/ה רק stormLevel באתגר הסערה ומסביר/ה למה ההחלטה השתנתה.'
    ],
    realWorldUses: [
      { icon:'🔴', title:'חקר חלל אוטונומי', text:'ברחפן על מאדים אי אפשר לתקן עם שלט בזמן אמת, לכן הקוד צריך לכלול החלטות בטיחות מראש.' },
      { icon:'🌪️', title:'תגובה לתנאי שטח', text:'סערה, רוח או מכשול יכולים לשנות את המסלול המתאים; תנאים מאפשרים לרובוט לבחור פעולה.' },
      { icon:'🧠', title:'Decision Logic', text:'if / else if / else הופך קוד מרצף פקודות קשיח למערכת שמגיבה למידע.' }
    ],
    vocabulary: [
      ['Conditional Logic','לוגיקה שמבצעת פעולה שונה לפי תנאי.'],
      ['Boolean','ערך אמת/שקר: true או false.'],
      ['stormLevel','משתנה מצב שמייצג את דרגת הסערה במאדים.'],
      ['if / else if / else','מבנה החלטה מדורג: אם, אחרת אם, אחרת.'],
      ['== / ===','אופרטורי השוואה; לא אותו דבר כמו = שהוא השמה.'],
      ['&& / ||','וגם / או — שילוב תנאים לוגיים.'],
      ['Emergency Land','נחיתה מיידית כדי לשמור על הרחפן בתנאי סיכון.' ]
    ],
    safetyRules: [
      'מפגש 6 הוא סימולטור בלבד — לאחר שיעור 5 חוזרים למעבדת החלטות בטוחה, ללא רחפנים פיזיים.',
      'הרחפנים הפיזיים נשארים בארון; אין TELLO WiFi, אין סוללות ואין מנועים.',
      'כל המרחקים בשיעור זה מטריים ומייצגים סנטימטרים.',
      'בכל ענף תנאי חייבת להיות פעולה שמסתיימת ב־land או במסלול בטוח.',
      'לא מריצים קוד עם סוגריים מסולסלים לא מאוזנים.',
      'אם Mars Simulator כבד — Reset או מעבר ל־Minimal Grid עדיף על שיעור תקוע.'
    ],
    commonDirections: [
      ['let stormLevel = 1;','מצב שמיים בהירים — סריקה רגילה.'],
      ['if (stormLevel == 1)','ענף סריקת פאנלים: flyForward(scanDistance).'],
      ['else if (stormLevel == 2)','ענף חירום בינוני: flyRight(emergencyDistance).'],
      ['else','סערה קיצונית: land מיידי.'],
      ['&&','וגם — שימוש אפשרי לבדיקת טווח כמו windSpeed >= 15 && windSpeed < 35.'],
      ['stormLevel = 3','Storm Challenge: שינוי משתנה בלבד כדי לבדוק החלטה חדשה.' ]
    ],
    setupSteps: [
      'טאבלטים טעונים ומחוברים ל־WiFi בית ספרי.',
      'DroneBlocks Code פתוח וחשבון ענן מחובר.',
      'פרויקט חדש בשם Meeting6_Mars_Logic_Grade9.',
      'בחירת Mars Simulator; אם איטי, Reset או Minimal Grid.',
      'כרטיסיית אופרטורים לוגיים זמינה לתלמידים.'
    ],
    tabletTips: [
      'כתבו קודם את המשתנים: stormLevel, scanDistance, emergencyDistance, safeAltitude.',
      'בדקו היטב: = משים ערך, == או === משווים ערך.',
      'סמנו בצבע או בהזחה כל ענף תנאי כדי לא להתבלבל בסוגריים.',
      'הריצו קודם עם stormLevel = 1, אחר כך 2, ואז 3.',
      'אל תשנו את כל הקוד באתגר — רק את ערך stormLevel.',
      'שמרו גרסה לפני ואחרי Storm Challenge.'
    ],
    lessonFlow: [
      { minutes:'0–6', title:'בדיקת תנאי קדם משיעור 5', teacher:'מחבר מהטיסה הפיזית הראשונה: במציאות שינוי תנאים דורש החלטה בטוחה; היום נכתוב את ההחלטה בקוד.', students:'כותבים דוגמה אחת למצב שבו רחפן צריך להחליט לבד לעצור/לנחות.' },
      { minutes:'6–14', title:'סיפור מסגרת — סערת חול במאדים', teacher:'מציג את Ingenuity‑2, פאנלים סולאריים במכתש ג׳זרו וסערה דינמית שמחייבת בחירת מסלול.', students:'מזהים שלושה מצבים: רגיל, חירום בינוני, סערה קיצונית.' },
      { minutes:'14–26', title:'If / Else If / Else', teacher:'מסביר באנלוגיית הלבוש בבוקר ומפרק מבנה תנאי עם stormLevel.', students:'מסמנים את if, else if, else ואת גוף כל ענף.' },
      { minutes:'26–34', title:'אופרטורים והשוואות', teacher:'מדגים את ההבדל בין = לבין == / ===, ומציג && / || לבדיקת טווחי רוח.', students:'מתקנים דוגמאות שגויות ומסבירים למה = יחיד מסוכן בתנאי.' },
      { minutes:'34–42', title:'פתיחה ושמירה בענן', teacher:'מוביל WiFi בית ספרי, Login, יצירת Meeting6_Mars_Logic_Grade9 ושמירה ראשונית.', students:'פותחים פרויקט ושומרים גרסה ריקה לפני כתיבה.' },
      { minutes:'42–55', title:'בניית משתנים ושלד תנאים', teacher:'מלווה כתיבת stormLevel, scanDistance, emergencyDistance, safeAltitude ומבנה if/else if/else ריק.', students:'כותבים שלד עם הערות בכל ענף ומוודאים סוגריים מאוזנים.' },
      { minutes:'55–73', title:'אתגר ניווט דינמי', teacher:'מנחה מילוי הענפים: stormLevel 1 לסריקה קדימה, 2 למנחת חירום ימינה, else לנחיתה מיידית.', students:'מריצים שלוש פעמים עם stormLevel 1/2/3 ומתעדים איזו החלטה התקבלה.' },
      { minutes:'73–82', title:'Storm Challenge', teacher:'מכריז: סופת חול בדרגה 3. דורש לשנות רק את stormLevel ולבדוק נחיתת חירום.', students:'משנים stormLevel בלבד, מריצים ומסבירים מדוע הרחפן לא מתקדם.' },
      { minutes:'82–90', title:'שיתוף וסיכום', teacher:'אוסף Share Links ומוביל דיון על יתרון תנאים לעומת שלושה קודים נפרדים.', students:'שומרים, משתפים ומשלימים כרטיס יציאה על החלטה אוטונומית.' }
    ],
    exercises: [
      { minutes:'0–6', title:'גשר מהטיסה הפיזית', prompt:'כתבו מצב אחד שבו רחפן אמיתי צריך להחליט לנחות ולא להמשיך משימה.', check:'התלמיד מחבר בטיחות לקוד תנאי.' },
      { minutes:'14–26', title:'מפת תנאים', prompt:'ציירו שלושה ענפים: stormLevel 1, stormLevel 2, else. כתבו פעולה לכל ענף.', check:'יש שלושה תרחישים ברורים.' },
      { minutes:'26–34', title:'= מול ==', prompt:'תקנו תנאי שגוי: if (stormLevel = 1) והסבירו למה זו בעיה.', check:'התלמיד מבדיל בין השמה להשוואה.' },
      { minutes:'34–42', title:'פרויקט ענן', prompt:'צרו Meeting6_Mars_Logic_Grade9 ושמרו גרסה ריקה.', check:'הפרויקט קיים ושמור.' },
      { minutes:'42–55', title:'שלד if/else', prompt:'כתבו משתנים ושלד if / else if / else עם הערות בעברית בכל ענף.', check:'הסוגריים מאוזנים והענפים קריאים.' },
      { minutes:'55–73', title:'אתגר ניווט דינמי', prompt:'מלאו את שלושת הענפים והריצו עם stormLevel 1, 2 ו־3.', check:'כל ערך מוביל להחלטה אחרת.' },
      { minutes:'73–82', title:'Storm Challenge', prompt:'שנו רק stormLevel = 3 ובדקו שהרחפן נוחת מיד.', check:'הקוד לא שונה מלבד המשתנה.' },
      { minutes:'82–90', title:'Share Link והסבר', prompt:'שתפו קישור וכתבו מה היתרון של תנאי אחד על פני שלושה קבצים.', check:'התוצר ניתן לבדיקה ויש הסבר לוגי.' }
    ],
    deliverable: 'Share Link או צילום מסך לפרויקט Meeting6_Mars_Logic_Grade9 הכולל משתנה stormLevel, מבנה if / else if / else, שלושה מסלולי החלטה ותיעוד Storm Challenge שבו שונה רק stormLevel ל־3.',
    assessment: [
      'הקוד כולל stormLevel ומשתני מרחק/גובה מטריים.',
      'מבנה if / else if / else כתוב בסינטקס תקין.',
      'כל ענף תנאי מוביל למסלול בטוח או לנחיתה.',
      'התלמיד יודע להסביר את ההבדל בין = לבין ==.',
      'Storm Challenge בוצע על ידי שינוי משתנה בלבד ולא שכתוב הקוד.'
    ],
    debugging: [
      { problem:'Mars Simulator קופא או לא מגיב', fix:'מבצעים Reset בסימולטור או עוברים ל־Minimal Grid כדי לבדוק את הלוגיקה בלי עומס גרפי.' },
      { problem:'הרחפן תמיד נכנס ל־else או לענף לא נכון', fix:'בודקים שימוש ב־== או === במקום =, ובודקים את ערך stormLevel לפני הרצה.' },
      { problem:'Unexpected token { או שגיאת סוגריים', fix:'עוברים שורה־שורה ומוודאים שכל ( נסגר ב־) וכל { נסגר ב־}. משתמשים בהזחות לזיהוי ענפים.' },
      { problem:'ענף אחד לא מסתיים בנחיתה', fix:'בודקים שכל מסלול מסתיים ב־tello.land(); או במסלול בטוח ברור.' },
      { problem:'התלמידים משנים הרבה שורות באתגר', fix:'עוצרים ומחזירים למודל משתנה מצב: באתגר משנים רק stormLevel.' }
    ],
    differentiation: {
      support: ['לתת תרשים זרימה עם שלושת הענפים ולבקש להמיר לקוד.', 'לתת שלד if/else מוכן עם פקודות חסרות.', 'להתחיל רק עם if/else לשני מצבים ואז להוסיף else if.'],
      extension: ['להחליף stormLevel ב־windSpeed ולכתוב טווחים עם &&.', 'להוסיף משתנה isBatteryLow ולשלב תנאי || לנחיתת חירום.', 'לכתוב טבלת בדיקות: ערך קלט, ענף צפוי, תוצאה בפועל.' ]
    },
    instructorGuide: {
      prerequisites:'שיעור 6 נבנה אחרי שיעור 5 הפיזי: התלמידים חוו שינויים בעולם האמיתי וכיול. כעת חוזרים לסימולטור כדי לבנות מנגנון החלטה בטוח לפני חזרה למשימות פיזיות מורכבות. הם כבר מכירים משתנים, sleep, שמירה בענן ושיטה מטרית.',
      pedagogy:['להדגיש שהחזרה לסימולטור אחרי שיעור פיזי היא החלטת בטיחות — לוגיקה מורכבת בודקים קודם בסביבה סטרילית.', 'לא להסתפק בקוד שעובד עבור stormLevel=1; חייבים לבדוק את כל שלושת הענפים.', 'להשתמש ב־= מול == כדוגמה חזקה לכך שסינטקס הוא דרישה מבנית.', 'להציג if/else כתרשים החלטה לפני קוד כדי למנוע העתקה מכנית.', 'האתגר אינו “לטוס רחוק” אלא לקבל החלטה נכונה לפי מצב הסערה.' ],
      exitTicket:'בתנאי if השתמשתי ב־== ולא ב־= כי ___; אם stormLevel הוא 3 הרחפן צריך ___.'
    },
    appWorkflowTitle: 'משימת טאבלט — Mars Mission Logic ב־DroneBlocks Code',
    appWorkflowNote: 'מפגש 6 מתבצע בסימולטור Mars בלבד. אין טיסה פיזית. הדגש הוא קבלת החלטות דינמית ב־JavaScript באמצעות if / else if / else ומשתנה stormLevel.',
    appWorkflow: [
      { title:'פתיחה ושמירה', detail:'התחברו ל־WiFi בית ספרי, פתחו DroneBlocks Code, Login, וצרו Meeting6_Mars_Logic_Grade9.' },
      { title:'מפת החלטה', detail:'שרטטו שלושה מצבים: stormLevel 1 לסריקה רגילה, 2 למנחת חירום, 3 לנחיתה מיידית.' },
      { title:'כתיבת שלד', detail:'כתבו stormLevel ומשתנים מטריים, ואז מבנה if / else if / else עם הערות בכל ענף.' },
      { title:'בדיקות ענפים', detail:'הריצו עם stormLevel=1, אחר כך 2, ואז 3. ודאו שכל ערך מפעיל ענף אחר.' },
      { title:'Storm Challenge והגשה', detail:'שנו רק stormLevel ל־3, שמרו, ושתפו Share Link או צילום מסך עם הסבר ההחלטה.' }
    ],
    codeSamples: [
      { title:'Mars Mission Logic — קוד מלא למדריך', code:'// MARS MISSION LOGIC - MEETING 6 (GRADE 9)\n// All distances are centimeters\n\nlet stormLevel = 1; // 1 = clear, 2 = medium wind, 3 = extreme storm\nlet scanDistance = 150;\nlet emergencyDistance = 80;\nlet safeAltitude = 100;\n\ntello.takeoff();\ntello.sleep(3);\ntello.flyUp(safeAltitude);\ntello.sleep(2);\n\nif (stormLevel == 1) {\n  tello.flyForward(scanDistance);\n  tello.sleep(2);\n  tello.yawRight(90);\n  tello.sleep(1);\n  tello.land();\n} else if (stormLevel == 2) {\n  tello.flyRight(emergencyDistance);\n  tello.sleep(2);\n  tello.land();\n} else {\n  tello.land();\n}\n\n// Storm Challenge: change only stormLevel = 3;' }
    ],
    visualDiagram: { title:'Mars Mission Logic — החלטה לפי stormLevel', caption:'נקודת החלטה במאדים: stormLevel 1 מוביל לסריקה 150 ס״מ קדימה; stormLevel 2 מוביל למנחת חירום 80 ס״מ ימינה; stormLevel 3 מוביל לנחיתה מיידית.', chip:'If/Else', panelTitle:'🧠 תרשים החלטת רחפן', src:'assets/drone-intelligence-lab-grade9/lesson6/mars-storm-decision-logic.svg', alt:'תרשים לוגיקת if else לפי stormLevel בסימולטור מאדים' },
    screenshotSlides: [
      { title:'תרשים התרגיל — Mars Storm Logic', src:'assets/drone-intelligence-lab-grade9/lesson6/mars-storm-decision-logic.svg', caption:'המחשה לכיתה: שלושה ענפים לאותה נקודת החלטה — סריקה, מנחת חירום או נחיתה מיידית לפי stormLevel.' }
    ],
    instructorSlides: [
      { title:'מרחפן מבצע לרחפן מחליט', body:'היום הרחפן לא רק מבצע רצף — הוא בוחר מסלול לפי תנאי הסביבה.', bullets:['if', 'else if', 'else'] },
      { title:'stormLevel הוא מצב המשימה', body:'משתנה אחד בראש הקוד יכול לשנות את כל החלטת הטיסה בלי לשכתב את המסלול.', bullets:['1 = רגיל', '2 = חירום בינוני', '3 = נחיתה'] },
      { title:'סינטקס של החלטה', body:'סוגריים, סוגריים מסולסלים ו־== הם חלק מהבטיחות. = יחיד עלול לשבור את הלוגיקה.', bullets:['== לא =', '{}', '&& / ||'] },
      { title:'Storm Challenge', body:'סופת חול בדרגה 3: משנים רק stormLevel ובודקים שהרחפן בוחר נחיתה מיידית.', bullets:['שינוי משתנה', 'בדיקת ענף', 'Share Link'] }
    ]
  };


  const lessonSevenFinal = {
    title: 'שיעור 7: Helical 3D Scan — סריקה תלת־ממדית ומיפוי גבהים דינמי',
    subtitle: 'Digital Twin, Photogrammetry, City Simulator, altitudeStep ו־for loop הליקלית',
    concept: '3D Helical Scanning, מיפוי גבהים דינמי, Photogrammetry ו־Digital Twin',
    story: 'צוותי כיתה ט׳ עתודה פועלים כצוותי פיתוח רובוטיקה וסריקה גיאוגרפית בחברת Pix4D. המשימה: לבנות קוד JavaScript לרחפן סריקה שמייצר Digital Twin של מגדל ממשלה עירוני לצורך איתור סדקים ונזקי רעידות אדמה.',
    mission: 'לכתוב ב־DroneBlocks Code משימת JavaScript בסימולטור City בלבד: סריקה הליקלית סביב בניין גבוה בעזרת משתנים מטריים, לולאת for של 8 צלעות, flyForward, flyUp מדורג, yawRight בכל פינה ואתגר כיול תלת־ממדי.',
    workspaceMode: 'droneblocks-code',
    physicalFlightAllowed: false,
    blocks: ['variable','loop','takeoff','sleep','flyUp','flyForward','yawRight','land','share'],
    essentialQuestion: 'איך משלבים תנועה אופקית, עליית גובה ופניות Yaw כדי ליצור סריקה ספירלית שמכסה מבנה תלת־ממדי?',
    successCriteria: [
      'אני מסביר/ה מהי סריקה הליקלית ולמה היא מתאימה למיפוי 360° של בניין.',
      'אני מגדיר/ה משתנים מטריים: scanDistance, altitudeStep ו־startAltitude.',
      'אני כותב/ת לולאת for עם 8 איטרציות שמייצגת שני סיבובים מלאים סביב מבנה מרובע.',
      'אני משלב/ת בתוך הלולאה flyForward, flyUp ו־yawRight בסדר נכון.',
      'אני מבצע/ת אתגר כיול על ידי שינוי scanDistance ו־altitudeStep בלבד.'
    ],
    realWorldUses: [
      { icon:'🏙️', title:'Digital Twin', text:'סריקה תלת־ממדית יוצרת מודל דיגיטלי של בניין לצורך תחזוקה, תכנון ובדיקת נזקים.' },
      { icon:'📸', title:'Photogrammetry', text:'כיסוי צילום מזוויות וגבהים שונים מאפשר לשחזר מבנה תלת־ממדי ממידע חזותי.' },
      { icon:'🌀', title:'סריקה הליקלית', text:'במקום לעבור קומה־קומה ידנית, הרחפן מקיף, עולה, מקיף שוב ומייצר כיסוי רציף.' }
    ],
    vocabulary: [
      ['3D Helical Scanning','סריקה ספירלית סביב אובייקט: תנועה קדימה, עליית גובה ופנייה חוזרות יחד.'],
      ['Digital Twin','מודל דיגיטלי של אובייקט פיזי כמו בניין או גשר.'],
      ['Photogrammetry','בניית מודל תלת־ממדי מתוך תמונות רבות מזוויות שונות.'],
      ['altitudeStep','גודל העלייה האנכית בכל איטרציה או פינה.'],
      ['scanDistance','אורך צלע הסריקה סביב המבנה.'],
      ['for (let i = 0; i < 8; i++)','לולאה של 8 צלעות: שני סיבובים מלאים סביב בניין מרובע.'],
      ['Yaw 90°','פנייה של רבע סיבוב בכל פינת בניין.' ]
    ],
    safetyRules: [
      'מפגש 7 הוא סימולטור בלבד — הרחפנים הפיזיים נשארים בארון.',
      'אין TELLO WiFi, אין סוללות ואין הטסה פיזית של מסלול ספירלי.',
      'כל המרחקים בשיעור זה מטריים ומייצגים סנטימטרים.',
      'לפני Run בודקים שהפקודות flyForward, flyUp ו־yawRight נמצאות בתוך גוף הלולאה.',
      'אם City Simulator כבד בטאבלט — עוברים ל־Minimal Grid ושומרים את אותה לוגיקה.',
      'קוד עם לולאה ארוכה חייב להסתיים ב־tello.land(); אחרי הלולאה.'
    ],
    commonDirections: [
      ['let scanDistance = 120;','אורך צלע הבניין: 120 ס״מ.'],
      ['let altitudeStep = 30;','עליית גובה בכל פינה: 30 ס״מ.'],
      ['let startAltitude = 100;','גובה התחלה: 100 ס״מ.'],
      ['for (let i = 0; i < 8; i++)','8 צלעות = שני סיבובים מלאים סביב מגדל מרובע.'],
      ['tello.flyForward(scanDistance);','תנועה לאורך צלע הבניין.'],
      ['tello.flyUp(altitudeStep);','עלייה מדורגת בכל פינה ליצירת ספירלה.'],
      ['tello.yawRight(90);','פנייה סביב פינת המבנה.' ]
    ],
    setupSteps: [
      'טאבלטים טעונים ומחוברים ל־WiFi בית ספרי.',
      'DroneBlocks Code פתוח וחשבון ענן מחובר.',
      'פרויקט חדש בשם Meeting7_Spiral_3D_Scan_Grade9.',
      'בחירת City Simulator; אם איטי, Minimal Grid כתחליף בטוח.',
      'כרטיסיית עזר לאלגוריתם סריקה הליקלית פתוחה ליד הטאבלט.'
    ],
    tabletTips: [
      'כתבו קודם משתנים בראש הקוד ורק אחר כך את הלולאה.',
      'בדקו שהלולאה היא i < 8 ולא i < 4 — נדרשים שני סיבובים מלאים.',
      'הקפידו ש־flyUp(altitudeStep) נמצא בתוך הסוגריים המסולסלים של הלולאה.',
      'הוסיפו sleep אחרי תנועה, עלייה ופנייה כדי לדמות צילום יציב.',
      'שמרו גרסה לפני 3D Calibration Challenge.',
      'באתגר הכיול משנים רק scanDistance ו־altitudeStep.'
    ],
    lessonFlow: [
      { minutes:'0–6', title:'בדיקת תנאי קדם משיעור 6', teacher:'מחבר מתנאים ולוגיקה דינמית לסריקה גיאומטרית: היום אין החלטות מזג אוויר, אבל יש לולאה שמייצרת תנועה מורכבת.', students:'מזכירים מהי לולאה ומה ההבדל בין שינוי משתנה לשינוי גוף הקוד.' },
      { minutes:'6–14', title:'סיפור מסגרת — Digital Twin למגדל הממשלה', teacher:'מציג את Pix4D, מיפוי תלת־ממדי, סדקים ונזקי רעידות אדמה.', students:'מנסחים למה צילום מגובה אחד אינו מספיק לבניין גבוה.' },
      { minutes:'14–26', title:'סריקה הליקלית וגובה דינמי', teacher:'מסביר באנלוגיית מדרגות לולייניות: קדימה, עלייה, פנייה — שוב ושוב.', students:'מסמנים בתרשים איפה הרחפן מתקדם, איפה עולה ואיפה פונה.' },
      { minutes:'26–35', title:'חישוב צלעות וגבהים', teacher:'מחשב עם הכיתה: 4 צלעות לסיבוב, 8 צלעות לשני סיבובים, altitudeStep=30.', students:'מחשבים כמה עליות יהיו ומה המשמעות של שינוי altitudeStep.' },
      { minutes:'35–43', title:'פתיחה ושמירה בענן', teacher:'מוביל WiFi בית ספרי, Login, פתיחת Meeting7_Spiral_3D_Scan_Grade9 ושמירה.', students:'פותחים פרויקט ושומרים גרסה ריקה לפני כתיבה.' },
      { minutes:'43–56', title:'כתיבת משתנים והמראה', teacher:'מלווה כתיבת scanDistance, altitudeStep, startAltitude ואז takeoff, sleep, flyUp(startAltitude).', students:'כותבים שלד ומוודאים שאין SyntaxError.' },
      { minutes:'56–73', title:'אתגר Helical Scan', teacher:'מנחה כתיבת for של 8 איטרציות עם flyForward, sleep, flyUp, sleep, yawRight, sleep.', students:'מריצים בסימולטור City או Minimal Grid ומתקנים אם הספירלה לא מתקדמת בגובה.' },
      { minutes:'73–82', title:'3D Calibration Challenge', teacher:'מכריז: צלע הבניין 160 ס״מ וגובה הצעד 20 ס״מ. דורש שינוי משתנים בלבד.', students:'מעדכנים scanDistance=160 ו־altitudeStep=20, מריצים ומשווים כיסוי.' },
      { minutes:'82–90', title:'שיתוף וסיכום', teacher:'אוסף Share Links ומוביל דיון: איך flyForward + flyUp + yawRight יוצרים ספירלה.', students:'שומרים Meeting7_3D_Spiral_Scan_Calibrated ומשלימים כרטיס יציאה.' }
    ],
    exercises: [
      { minutes:'0–6', title:'גשר Logic → Scan', prompt:'כתבו כיצד לולאה יכולה להחליף קוד ארוך בסריקה תלת־ממדית.', check:'התלמיד מזהה דפוס חוזר.' },
      { minutes:'14–26', title:'מדרגות לולייניות', prompt:'סמנו על התרשים את שלושת המרכיבים של כל איטרציה: קדימה, עלייה, פנייה.', check:'הספירלה מפורקת לפעולות פשוטות.' },
      { minutes:'26–35', title:'חישוב 8 צלעות', prompt:'הסבירו למה צריך i < 8 כדי לקבל שני סיבובים סביב בניין מרובע.', check:'התלמיד מחבר 4 צלעות לסיבוב אחד.' },
      { minutes:'43–56', title:'משתני סריקה', prompt:'כתבו scanDistance=120, altitudeStep=30, startAltitude=100 והשתמשו ב־startAltitude בהמראה.', check:'הקוד מפריד נתוני גובה ומרחק מהלוגיקה.' },
      { minutes:'56–73', title:'אתגר Helical 3D Scan', prompt:'כתבו לולאת for עם flyForward(scanDistance), flyUp(altitudeStep), yawRight(90) ו־sleep אחרי כל שלב.', check:'הרחפן מבצע שני סיבובים עם עלייה מדורגת.' },
      { minutes:'73–82', title:'3D Calibration Challenge', prompt:'שנו רק scanDistance ל־160 ו־altitudeStep ל־20 והריצו מחדש.', check:'גוף הלולאה לא השתנה.' },
      { minutes:'82–90', title:'Share Link והסבר', prompt:'שמרו Meeting7_3D_Spiral_Scan_Calibrated וכתבו איך נוצרת הספירלה.', check:'יש תוצר והסבר גיאומטרי.' }
    ],
    deliverable: 'Share Link או צילום מסך לפרויקט Meeting7_3D_Spiral_Scan_Calibrated הכולל משתנים מטריים, לולאת for של 8 צלעות, סריקה הליקלית סביב בניין ואתגר כיול שבו שונו רק scanDistance ו־altitudeStep.',
    assessment: [
      'הקוד משתמש בשיטה מטרית עקבית בסנטימטרים.',
      'המשתנים scanDistance, altitudeStep ו־startAltitude מוגדרים בראש הקוד ומשמשים בפועל.',
      'לולאת for רצה 8 איטרציות ומכילה flyForward, flyUp ו־yawRight בתוך גוף הלולאה.',
      'התלמיד מסביר מדוע 8 צלעות יוצרות שני סיבובים מלאים.',
      'אתגר הכיול בוצע על ידי שינוי משתנים בלבד ולא שכתוב הלולאה.'
    ],
    debugging: [
      { problem:'City Simulator כבד, הטאבלט חם או הגרפיקה מקרטעת', fix:'עוברים ל־Minimal Grid, סוגרים אפליקציות רקע ושומרים את אותה לוגיקת סריקה.' },
      { problem:'הרחפן לא מסיים סיבוב מלא או מפספס פינה', fix:'בודקים שהלולאה היא i < 8 ושהפנייה היא yawRight(90), לא זווית אחרת.' },
      { problem:'הרחפן לא עולה בגובה בכל צלע', fix:'בודקים ש־tello.flyUp(altitudeStep); נמצא בתוך הסוגריים המסולסלים של לולאת ה־for.' },
      { problem:'שגיאת SyntaxError בלולאה', fix:'בודקים סוגריים עגולים, נקודה־פסיק בין חלקי ה־for וסוגריים מסולסלים מאוזנים.' },
      { problem:'אתגר הכיול דורש שינוי שורות רבות', fix:'בודקים שהמרחק והגובה נכתבו כמשתנים ולא כמספרים קשיחים בתוך הלולאה.' }
    ],
    differentiation: {
      support: ['לתת שלד קוד עם לולאת for מוכנה ושורות חסרות בתוך הגוף.', 'להריץ קודם i < 4 לסיבוב אחד ואז להרחיב ל־8.', 'להשתמש בתרשים בצבעים: כחול לתנועה, ירוק לגובה, כתום לפנייה.'],
      extension: ['להוסיף let sides = 8 ולהשתמש ב־i < sides.', 'להוסיף משתנה currentHeight ולעדכן אותו לוגית בכל איטרציה לצורך תיעוד.', 'להשוות בין altitudeStep=30 לבין altitudeStep=20 מבחינת פערים ויזואליים במודל.' ]
    },
    instructorGuide: {
      prerequisites:'שיעור 7 ממשיך את שיעור 6 ואת שיעור 4: התלמידים כבר מכירים משתנים, לולאות, תנאים, שיטה מטרית ושמירה בענן. למרות שהייתה טיסה פיזית בשיעור 5, שיעור 7 נשאר סימולטור בלבד בגלל מורכבות גיאומטרית ותנועה תלת־ממדית סביב מבנה.',
      pedagogy:['להדגיש שמיפוי תלת־ממדי אינו “לטוס יפה סביב בניין” אלא איסוף מידע שיטתי לבניית Digital Twin.', 'לא לתת לתלמידים לקפוץ לקוד לפני שהם מזהים את תבנית הספירלה: קדימה → עלייה → פנייה.', 'הדיוק המטרי חשוב: 120 ס״מ, 30 ס״מ ו־8 צלעות הם פרמטרים הנדסיים, לא מספרים מקריים.', 'לשמור פתרון מלא במערך מדריך בלבד; במצגת להראות תרשים, מושגים ואתגר כיול.', 'אם City Simulator מכביד, Minimal Grid עדיף — מטרת השיעור היא האלגוריתם, לא הגרפיקה.' ],
      exitTicket:'סריקה הליקלית נוצרת כי בכל איטרציה הרחפן ___, ___ ו־___.'
    },
    appWorkflowTitle: 'משימת טאבלט — Helical 3D Scan ב־City Simulator',
    appWorkflowNote: 'מפגש 7 מתבצע בסימולטור City בלבד או Minimal Grid במקרה עומס. אין טיסה פיזית. הדגש הוא בניית אלגוריתם סריקה ספירלי עם משתנים ולולאת for.',
    appWorkflow: [
      { title:'פתיחה ושמירה', detail:'התחברו ל־WiFi בית ספרי, פתחו DroneBlocks Code, Login, וצרו Meeting7_Spiral_3D_Scan_Grade9.' },
      { title:'בחירת סימולטור', detail:'עברו ל־City Simulator. אם הטאבלט איטי, עברו ל־Minimal Grid ושמרו את אותו אלגוריתם.' },
      { title:'משתני סריקה', detail:'כתבו scanDistance=120, altitudeStep=30, startAltitude=100. כל הערכים בסנטימטרים.' },
      { title:'לולאת ספירלה', detail:'כתבו for עם 8 איטרציות: flyForward(scanDistance), flyUp(altitudeStep), yawRight(90), ו־sleep לייצוב אחרי כל שלב.' },
      { title:'כיול והגשה', detail:'שנו רק scanDistance=160 ו־altitudeStep=20 באתגר הכיול, שמרו Meeting7_3D_Spiral_Scan_Calibrated ושתפו Link.' }
    ],
    codeSamples: [
      { title:'Helical 3D Scanning Algorithm — קוד מלא למדריך', code:'// HELICAL 3D SCANNING ALGORITHM - MEETING 7 (GRADE 9)\n// All distances are centimeters\n\nlet scanDistance = 120;\nlet altitudeStep = 30;\nlet startAltitude = 100;\n\ntello.takeoff();\ntello.sleep(3);\ntello.flyUp(startAltitude);\ntello.sleep(2);\n\nfor (let i = 0; i < 8; i++) {\n  tello.flyForward(scanDistance);\n  tello.sleep(2);\n\n  tello.flyUp(altitudeStep);\n  tello.sleep(2);\n\n  tello.yawRight(90);\n  tello.sleep(1);\n}\n\ntello.land();\n\n// 3D Calibration Challenge:\n// scanDistance = 160; altitudeStep = 20;' }
    ],
    visualDiagram: { title:'Helical 3D Scan — מיפוי מגדל', caption:'סריקה ספירלית סביב מגדל: 8 צלעות, שני סיבובים מלאים, scanDistance=120 ס״מ, altitudeStep=30 ס״מ ו־startAltitude=100 ס״מ. באתגר הכיול משנים ל־160/20 בלבד.', chip:'3D Scan', panelTitle:'🌀 תרשים סריקה הליקלית', src:'assets/drone-intelligence-lab-grade9/lesson7/helical-3d-building-scan.svg', alt:'תרשים סריקה ספירלית תלת־ממדית סביב מגדל בסימולטור עירוני' },
    screenshotSlides: [
      { title:'תרשים התרגיל — Helical 3D Building Scan', src:'assets/drone-intelligence-lab-grade9/lesson7/helical-3d-building-scan.svg', caption:'המחשה לכיתה: הרחפן מקיף בניין, עולה 30 ס״מ בכל פינה, ומשלים שני סיבובים כדי ליצור כיסוי 360° למודל Digital Twin.' }
    ],
    instructorSlides: [
      { title:'Digital Twin צריך כיסוי', body:'צילום מגובה אחד לא מספיק. כדי למפות בניין צריך תמונות סביב המבנה ובגבהים שונים.', bullets:['360°', 'גבהים משתנים', 'Photogrammetry'] },
      { title:'הספירלה היא אלגוריתם', body:'כל איטרציה מבצעת שלושה שלבים: קדימה, עלייה, פנייה.', bullets:['flyForward', 'flyUp', 'yawRight'] },
      { title:'8 צלעות = שני סיבובים', body:'בניין מרובע דורש 4 צלעות להקפה אחת. 8 איטרציות מייצרות שתי הקפות מלאות.', bullets:['4 צלעות', '2 הקפות', 'i < 8'] },
      { title:'3D Calibration Challenge', body:'הבניין השתנה: scanDistance=160 ו־altitudeStep=20. האם הקוד שלכם גמיש?', bullets:['שנו משתנים', 'לא את הלולאה', 'Share Link'] }
    ]
  };


  const lessonEightFinal = {
    title: 'שיעור 8: Dynamic Obstacles Challenge — מכשולים דינמיים, טלמטריה ודיבוג בזמן אמת',
    subtitle: 'Agile Engineering, physical constraints, Telemetry Bar, Version Control ו־10-minute debugging',
    concept: 'Dynamic Constraints, Versioning, Telemetry ו־Debugging מתקדם במרחב פיזי',
    story: 'צוותי כיתה ט׳ עתודה פועלים כמהנדסי בקרה בכירים בחברת Zipline. רחפן אוטונומי נשלח להעביר אספקה רפואית לבית חולים שדה באזור אסון, אך עצים ומבנים קורסים ומשנים את מיקום המכשולים בזמן אמת.',
    mission: 'להריץ רחפן פיזי בתוך Safe Fly Zone, לעקוף מכשול בסיסי בגובה 80 ס״מ, ואז להתמודד עם שינוי דינמי: המכשול זז ל־150 ס״מ וגובהו 110 ס״מ, נוסף מכשול צדדי ב־80 ס״מ, והצוות חייב לעדכן משתנים תוך 10 דקות בלי לוותר על בטיחות.',
    workspaceMode: 'physical-lab',
    physicalFlightAllowed: true,
    blocks: ['safety_check','wifi','battery','telemetry','variable','condition','takeoff','sleep','flyUp','flyForward','flyRight','abort','land','debug','share'],
    essentialQuestion: 'איך צוות מהנדסים משנה קוד רחפן תחת לחץ כאשר תנאי השטח משתנים, בלי למחוק גרסה יציבה ובלי לוותר על בטיחות?',
    successCriteria: [
      'אני שומר/ת גרסת גיבוי v1 בענן לפני שינויי לחץ.',
      'אני עובד/ת בצוות Driver/Navigator/Observer ומבצע/ת Pre‑Flight לפני כל הרצה.',
      'אני משתמש/ת בטלמטריה — גובה, זמן וסוללה — כדי להסביר סטייה או סיכון.',
      'אני משנה/ה משתנים רלוונטיים בלבד בזמן אתגר ה־10 דקות.',
      'אני מסיים/ת עם גרסת Meeting8_Dynamic_Challenge_Solved ותיעוד מה השתנה ולמה.'
    ],
    realWorldUses: [
      { icon:'🚑', title:'אספקה רפואית באזור אסון', text:'רחפנים אוטונומיים צריכים להגיב לשינויים בשטח בלי לסכן צוותי חילוץ או ציוד.' },
      { icon:'📊', title:'Telemetry Debugging', text:'נתוני גובה וסוללה עוזרים להבין אם הבעיה היא בקוד, בסוללה או בפיזיקה של הטיסה.' },
      { icon:'🧩', title:'Agile Engineering', text:'תחת לחץ לא מתחילים מאפס — שומרים גרסה יציבה ומשנים את הפרמטר הנכון.' }
    ],
    vocabulary: [
      ['Dynamic Constraints','אילוצים שמשתנים בזמן אמת: מיקום מכשול, גובה, סוללה או רוח.'],
      ['Agile Engineering','עבודה הנדסית מהירה ומבוקרת: שינוי קטן, בדיקה, תיעוד והמשך.'],
      ['Telemetry Bar','אזור באפליקציה שמציג נתונים כמו גובה, מצב סוללה וסטטוס רחפן.'],
      ['Version Control','שמירת גרסאות כדי שאפשר יהיה לחזור לקוד יציב אחרי שינוי שגוי.'],
      ['Ground Effect','זרם אוויר חוזר מהרצפה/מכשול שיכול להשפיע על גובה ויציבות.'],
      ['Safe Fly Zone','מלבן טיסה מסומן שאסור להיכנס אליו בזמן טיסה.'],
      ['Abort','עצירת חירום/נחיתה מיידית כשיש סכנה.' ]
    ],
    safetyRules: [
      'זהו מפגש הטסה פיזי מלא — טסים רק באישור מדריך ובתוך Safe Fly Zone מסומן.',
      'לחץ זמן אינו מבטל בטיחות: משקפי מגן, שיער אסוף, מגיני פרופלורים ו־Observer הם חובה.',
      'אין להיכנס למלבן הטיסה כשהרחפן באוויר, גם אם המכשול זז או הקוד נכשל.',
      'אם הסוללה מתחת ל־30% או הגובה אינו יציב — Abort/Land והחלפת סוללה.',
      'שינויי קוד בזמן לחץ מתבצעים בשולחן, לא ליד רחפן מוכן להמראה.',
      'גרסת v1 נשמרת בענן לפני אתגר ה־10 דקות כדי למנוע אובדן עבודה.'
    ],
    commonDirections: [
      ['Meeting8_Dynamic_Obstacles_v1','גרסת בסיס יציבה שנשמרת לפני שינויי הלחץ.'],
      ['obstacleDistance = 120','מיקום מכשול בסיסי בתחילת הניסוי.'],
      ['obstacleHeight = 80','גובה מכשול בסיסי.'],
      ['clearanceAltitude = 100','גובה מעבר ראשון מעל המכשול.'],
      ['Dynamic update','המכשול זז: obstacleDistance=150, obstacleHeight=110, sideObstacleDistance=80.'],
      ['clearanceAltitude = 130','מקדם בטיחות אחרי שהמכשול גדל ל־110 ס״מ.' ]
    ],
    setupSteps: [
      'מסמנים Safe Fly Zone ומנחת המראה/נחיתה לפני תחילת השיעור.',
      'מכינים מכשול בסיסי בגובה 80 ס״מ ומכשול נוסף בצד ימין בגובה/מרחק ידועים.',
      'רחפנים עם מגיני פרופלורים, סוללות 100% ומשקפי מגן מוכנים.',
      'סטופר 10 דקות מוכן להקרנה.',
      'קוד בסיס משיעור 5/7 זמין בענן וניתן לשמירה כ־Meeting8_Dynamic_Obstacles_v1.'
    ],
    tabletTips: [
      'על WiFi בית ספרי: טענו קוד בסיס ושמרו v1 לפני מעבר לרשת Tello.',
      'על Tello‑XXXX: הריצו רק אחרי Pre‑Flight ואישור מדריך.',
      'בדקו Telemetry Bar לפני Run: סוללה, גובה וסטטוס חיבור.',
      'באתגר ה־10 דקות שנו רק משתנים: obstacleDistance, clearanceAltitude, sideObstacleDistance.',
      'אם מוחקים בטעות — חזרו לגרסת v1 בענן במקום לשחזר מהזיכרון.',
      'בסיום שמרו Meeting8_Dynamic_Challenge_Solved ושתפו Link/תיעוד.'
    ],
    lessonFlow: [
      { minutes:'0–6', title:'בדיקת תנאי קדם משיעור 7', teacher:'מחבר מהסריקה ההליקלית: למדנו לשנות פרמטרים גיאומטריים; היום השטח הפיזי משתנה תחת לחץ.', students:'מזכירים משתנה אחד שאפשר לשנות במקום לשכתב קוד.' },
      { minutes:'6–14', title:'סיפור מסגרת — Zipline Dynamic Rescue', teacher:'מציג אספקה רפואית באזור אסון ומכשולים שמשתנים ללא התראה.', students:'מזהים מדוע מסלול קשיח אינו מספיק בשטח דינמי.' },
      { minutes:'14–26', title:'דיבוג דינמי וטלמטריה', teacher:'מסביר איך משתמשים ב־Telemetry Bar: גובה, סוללה, זמן וסטטוס כדי להבחין בין בעיית קוד לבעיה פיזית.', students:'כותבים אילו נתונים יבדקו לפני שינוי קוד.' },
      { minutes:'26–38', title:'Version Control ו־WiFi Handshake', teacher:'מוביל WiFi בית ספרי → Load → Save as Meeting8_Dynamic_Obstacles_v1 → מעבר ל־Tello‑XXXX.', students:'שומרים גרסת בסיס יציבה ועוברים לרשת הרחפן רק באישור.' },
      { minutes:'38–45', title:'Pre‑Flight ומכשול בסיסי', teacher:'בודק משקפי מגן, מגינים, סוללה, Abort, אזור סטרילי ומכשול 80 ס״מ במרחק 120 ס״מ.', students:'Driver/Navigator/Observer מבצעים בדיקה ומכריזים מוכנות.' },
      { minutes:'45–60', title:'הרצת בסיס — מכשול א׳', teacher:'מאשר הרצה פיזית: עלייה ל־100 ס״מ, טיסה קדימה 180 ס״מ ומעבר מעל מכשול 80 ס״מ.', students:'מריצים, צופים, מודדים Telemetry ומתעדים אם המעבר היה בטוח.' },
      { minutes:'60–70', title:'אתגר 10 דקות — המכשול זז', teacher:'מפעיל סטופר, מזיז מכשול ל־150 ס״מ וגובה 110 ס״מ ומוסיף מכשול צדדי ב־80 ס״מ.', students:'חוזרים לשולחן, משנים משתנים בלבד ושומרים גרסת אתגר.' },
      { minutes:'70–80', title:'הרצת פתרון דינמי', teacher:'מאשר רק צוותים שעברו Pre‑Flight חוזר וערכי סוללה תקינים. עוצר במקרה סיכון.', students:'מריצים פתרון מעודכן או מנתחים צוות אחר אם אין זמן לטיסה.' },
      { minutes:'80–90', title:'סגירה, סוללות ורפלקציה', teacher:'מנהל הוצאת סוללות לקופסת ריקות, שמירת Meeting8_Dynamic_Challenge_Solved ושיחת לקחים.', students:'משתפים Link/צילום, מחזירים ציוד ומשלימים: “תחת לחץ שמרנו בטיחות על ידי...”' }
    ],
    exercises: [
      { minutes:'0–6', title:'גשר פרמטרים לשטח דינמי', prompt:'כתבו אילו משתנים הייתם רוצים בקוד כדי לא לשכתב אותו כשמכשול זז.', check:'התלמיד מזהה מרחק, גובה ומרחק צדדי.' },
      { minutes:'14–26', title:'קריאת טלמטריה', prompt:'רשמו שלושה נתונים לבדוק לפני שינוי קוד: גובה, סוללה, זמן/סטטוס.', check:'התלמיד לא קופץ לתיקון קוד בלי נתונים.' },
      { minutes:'26–38', title:'שמירת v1', prompt:'טענו קוד בסיס ושמרו בשם Meeting8_Dynamic_Obstacles_v1 לפני מעבר ל־Tello.', check:'קיימת גרסת גיבוי יציבה.' },
      { minutes:'38–45', title:'Pre‑Flight מכשולים', prompt:'בדקו אזור סטרילי, מכשול 80 ס״מ, סוללה 100%, מגינים, משקפי מגן ו־Abort.', check:'המדריך מאשר לפני Run.' },
      { minutes:'45–60', title:'הרצת בסיס', prompt:'הריצו מעבר מעל מכשול 80 ס״מ במרחק 120 ס״מ ותעדו גובה וסוללה.', check:'הטיסה הסתיימה בבטחה ויש מדידה.' },
      { minutes:'60–70', title:'Dynamic Debug ב־10 דקות', prompt:'עדכנו למכשול 150 ס״מ / 110 ס״מ והוסיפו מכשול צדדי 80 ס״מ — שנו משתנים בלבד.', check:'השינויים ממוקדים ולא מוחקים גרסה יציבה.' },
      { minutes:'70–80', title:'הרצת פתרון', prompt:'בצעו Pre‑Flight חוזר והריצו את הפתרון הדינמי או נתחו צוות שמריץ.', check:'הבטיחות נשמרת למרות הסטופר.' },
      { minutes:'80–90', title:'גרסה מנצחת', prompt:'שמרו Meeting8_Dynamic_Challenge_Solved וכתבו מה השתנה בקוד ולמה.', check:'יש תוצר, גרסה ותיעוד החלטה.' }
    ],
    deliverable: 'Share Link או צילום מסך לגרסת Meeting8_Dynamic_Challenge_Solved + טבלת דיבוג קצרה: obstacleDistance, obstacleHeight, clearanceAltitude, מצב סוללה, מה השתנה ומה נשמר.',
    assessment: [
      'הצוות שמר גרסת v1 לפני שינויי האתגר.',
      'הצוות ביצע Pre‑Flight מלא לפני כל הרצה פיזית.',
      'נעשה שימוש בטלמטריה או במדידת שטח לפני שינוי קוד.',
      'השינוי הדינמי התמקד במשתנים ולא במחיקת כל התוכנית.',
      'נוהל סוללות, Abort ואזור סטרילי נשמרו גם תחת לחץ זמן.'
    ],
    debugging: [
      { problem:'הרחפן פוגע במכשול למרות clearanceAltitude=120/130', fix:'בודקים סוללה מעל 30%, מחליפים לסוללה 100% אם צריך, מוסיפים מקדם בטיחות לגובה ובודקים Ground Effect/VPS.' },
      { problem:'הצוות מחק קוד יציב בזמן לחץ', fix:'טוענים מחדש את Meeting8_Dynamic_Obstacles_v1 מהענן ומבצעים תיקון מדורג.' },
      { problem:'שגיאת קומפילציה לפני המראה', fix:'עוצרים. משווים סוגריים, נקודה־פסיק ושמות פקודות מול Function Reference לפני כל Run פיזי.' },
      { problem:'הטאבלט איבד חיבור לרחפן', fix:'בודקים חיבור ל־Tello‑XXXX הנכון, לא לרשת בית ספרית, ומריצים רק אחרי סטטוס תקין.' },
      { problem:'הלחץ גורם לדילוג על בטיחות', fix:'מפסיקים את הסטופר לצוות הזה. בטיחות היא תנאי המשימה, לא בונוס.' }
    ],
    differentiation: {
      support: ['לתת לצוות מתקשה קוד בסיס עם משתנים מוכנים ולמקד בשינוי obstacleDistance/clearanceAltitude.', 'לאפשר תפקיד Observer/Navigator לתלמיד שלא מוכן להטיס.', 'להריץ פתרון דינמי בסימולטור אם אין מספיק זמן/מרחב לטיסה פיזית.'],
      extension: ['להוסיף משתנה batteryLevel ולכתוב if שמונע הרצה מתחת ל־30%.', 'להשוות v1 מול solved לפי זמן, גובה וסוללה.', 'להציע פרוטוקול עבודה קצר לצוות תחת לחץ: Save → Change → Check → Run.' ]
    },
    instructorGuide: {
      prerequisites:'שיעור 8 נשען על שיעורים 5 ו־7: התלמידים כבר חוו טיסה פיזית ראשונה, מכירים כיול משתנים, ועבדו עם מסלולים מורכבים בסימולטור. כאן חוזרים למרחב הפיזי, אך רק עם גבולות בטיחות קפדניים וניהול גרסאות לפני כל שינוי.',
      pedagogy:['הסטופר נועד לייצר לחץ מבוקר, לא כאוס. מדריך רשאי לעצור צוות שמדלג על בטיחות.', 'המסר המרכזי: מהנדס טוב לא מוחק קוד תחת לחץ — הוא חוזר לגרסה יציבה ומשנה משתנה מדיד.', 'טלמטריה היא עדות, לא קישוט: לבקש מהתלמידים לצטט נתון לפני שינוי קוד.', 'להריץ מעט צוותים במקביל בלבד, בהתאם לגודל Safe Fly Zone.', 'אם תנאי הכיתה לא בטוחים, לבצע את אתגר השינוי בסימולטור בלבד ועדיין לשמור את מבנה השיעור.' ],
      exitTicket:'באירוע מכשול דינמי, הדבר הראשון שאעשה לפני שינוי קוד הוא ___; המשתנה ששיניתי הוא ___ כי ___.'
    },
    appWorkflowTitle: 'מעבדה פיזית — Dynamic Obstacles Debug Challenge',
    appWorkflowNote: 'שיעור 8 כולל הטסה פיזית מלאה בכיתה, רק בתוך Safe Fly Zone ובאישור מדריך. הדגש הוא שמירת גרסאות, קריאת טלמטריה ושינוי משתנים מדוד תחת לחץ.',
    appWorkflow: [
      { title:'Load + Save v1', detail:'על WiFi בית ספרי: טענו קוד בסיס משיעור 5/7 ושמרו Meeting8_Dynamic_Obstacles_v1 בענן.' },
      { title:'WiFi + Pre‑Flight', detail:'עברו ל־Tello‑XXXX באישור מדריך. בדקו סוללה, מגינים, משקפי מגן, Abort, תפקידים ואזור סטרילי.' },
      { title:'הרצת מכשול בסיסי', detail:'מכשול א׳ בגובה 80 ס״מ במרחק 120 ס״מ. עברו מעליו בגובה 100 ס״מ וטוסו קדימה 180 ס״מ.' },
      { title:'Dynamic Update', detail:'המכשול זז ל־150 ס״מ וגובה 110 ס״מ; נוסף מכשול צדדי 80 ס״מ. תוך 10 דקות שנו משתנים בלבד.' },
      { title:'Solved + Share', detail:'הריצו רק אחרי Pre‑Flight חוזר, שמרו Meeting8_Dynamic_Challenge_Solved ושתפו Link/תיעוד.' }
    ],
    codeSamples: [
      { title:'Dynamic Obstacle Mission — קוד בסיס למדריך', code:'// DYNAMIC OBSTACLE DEBUG CHALLENGE - MEETING 8\n// All distances are centimeters\n\nlet obstacleDistance = 120;\nlet obstacleHeight = 80;\nlet clearanceAltitude = 100;\nlet forwardDistance = 180;\nlet sideObstacleDistance = 0;\n\ntello.takeoff();\ntello.sleep(3);\ntello.flyUp(clearanceAltitude);\ntello.sleep(2);\n\ntello.flyForward(forwardDistance);\ntello.sleep(2);\n\nif (sideObstacleDistance > 0) {\n  tello.flyRight(sideObstacleDistance);\n  tello.sleep(2);\n}\n\ntello.land();\n\n// Dynamic update:\n// obstacleDistance = 150; obstacleHeight = 110;\n// clearanceAltitude = 130; sideObstacleDistance = 80;' }
    ],
    visualDiagram: { title:'Dynamic Obstacles — זירת מכשול משתנה', caption:'מכשול בסיסי: 80 ס״מ בגובה, 120 ס״מ מהמנחת. עדכון דינמי: 150 ס״מ קדימה, גובה 110 ס״מ, מכשול צדדי 80 ס״מ. הצוות משנה משתנים תוך 10 דקות ושומר בטיחות.', chip:'Physical Debug', panelTitle:'🚧 תרשים מכשול דינמי', src:'assets/drone-intelligence-lab-grade9/lesson8/dynamic-obstacle-debug-challenge.svg', alt:'תרשים אתגר מכשולים דינמיים במרחב פיזי עם טלמטריה וגרסאות' },
    screenshotSlides: [
      { title:'תרשים התרגיל — Dynamic Obstacle Debug Challenge', src:'assets/drone-intelligence-lab-grade9/lesson8/dynamic-obstacle-debug-challenge.svg', caption:'המחשה לכיתה: אזור טיסה סטרילי, מכשול בסיסי, שינוי דינמי, טלמטריה, גרסת v1 ואתגר דיבוג ב־10 דקות.' }
    ],
    instructorSlides: [
      { title:'השטח משתנה — הקוד צריך להגיב', body:'היום לא בונים מסלול מושלם מראש; לומדים לעדכן משתנים כשמכשול זז.', bullets:['Dynamic Constraints', 'Variables', 'Debugging'] },
      { title:'גרסה יציבה לפני לחץ', body:'לפני כל שינוי שומרים v1 בענן. אם משהו נשבר, חוזרים לגרסה שעבדה.', bullets:['Version Control', 'Save v1', 'Rollback'] },
      { title:'Telemetry היא עדות', body:'גובה וסוללה מסבירים למה הרחפן פספס מכשול או לא הגיע לגובה המתוכנן.', bullets:['גובה', 'סוללה', 'סטטוס'] },
      { title:'10 דקות, אבל בטוח', body:'הסטופר בודק חוסן הנדסי — לא מבטל משקפי מגן, Observer, Abort או Pre‑Flight.', bullets:['Safe Zone', 'Observer', 'Abort'] }
    ]
  };


  const lessonNineFinal = {
    title: 'שיעור 9: Wing Performance Tuning — ניתוח יעילות קוד ואופטימיזציית משאבים',
    subtitle: 'Telemetry, Battery Burn Rate, Algorithm A/B comparison, Data‑Driven Decision Making',
    concept: 'Performance Tuning, Battery Optimization, Telemetry Analysis ו־Data‑Driven Decision Making',
    story: 'צוותי כיתה ט׳ עתודה הם צוותי פיתוח תוכנה ב־Wing מבית Google. החברה רוצה להרחיב את טווח משלוחי הרחפנים, אבל כל שניית ריחוף שורפת סוללה. הצוותים צריכים להוכיח בעזרת נתונים איזה אלגוריתם חסכוני יותר.',
    mission: 'להריץ שני אלגוריתמים שונים על רחפן פיזי בתוך Safe Fly Zone: אלגוריתם א׳ ליניארי עם sleep ארוך מול אלגוריתם ב׳ בלולאת for עם sleep קצר, לאסוף Telemetry של סוללה וזמן, לחשב Battery Burn Rate ולשמור גרסת קוד אופטימלית.',
    workspaceMode: 'physical-lab',
    physicalFlightAllowed: true,
    blocks: ['safety_check','wifi','battery','telemetry','variable','loop','takeoff','sleep','flyForward','flyRight','flyBackward','flyLeft','yawRight','land','debug','share'],
    essentialQuestion: 'איך נתוני טיסה אמיתיים — זמן וסוללה — עוזרים לנו להחליט איזה קוד רחפן יעיל יותר ולא רק “עובד”?',
    successCriteria: [
      'אני מריץ/ה שני אלגוריתמים שונים באותו מסלול ריבוע 150 ס״מ תחת נוהל בטיחות.',
      'אני רושם/ת סוללה התחלתית, סוללה סופית וזמן טיסה לכל גרסה.',
      'אני מחשב/ת ΔBattery ו־Battery Burn Rate לכל אלגוריתם.',
      'אני משווה בין קוד ליניארי לבין קוד לולאה לפי זמן, סוללה ומספר שורות.',
      'אני שומר/ת גרסה אופטימלית בשם Meeting9_Algorithm_Perfect_v3 ומנסח/ת המלצה מבוססת נתונים.'
    ],
    realWorldUses: [
      { icon:'📦', title:'משלוחי רחפנים', text:'חברות משלוחים צריכות להחליט איזה אלגוריתם מאפשר יותר משלוחים על אותה סוללה.' },
      { icon:'🔋', title:'Energy Budget', text:'זמן ריחוף, פניות והשהיות משפיעים ישירות על צריכת הסוללה.' },
      { icon:'📊', title:'Data‑Driven Engineering', text:'מהנדסים בוחרים פתרון לפי מדידות, לא לפי תחושה או קוד שנראה יפה.' }
    ],
    vocabulary: [
      ['Performance Tuning','שיפור ביצועים של מערכת לפי מדדים כמו זמן, סוללה ואמינות.'],
      ['Telemetry Status Bar','אזור באפליקציה שבו קוראים סוללה, גובה וסטטוס רחפן בזמן אמת.'],
      ['ΔBattery','צריכת סוללה כוללת: Start% פחות End%.'],
      ['Battery Burn Rate','קצב צריכת סוללה לשנייה: ΔBattery חלקי זמן הטיסה בשניות.'],
      ['Linear Code','קוד שכותב כל פקודה בנפרד, לרוב ארוך וקשה לתחזוקה.'],
      ['Loop‑Optimized Code','קוד קצר יותר שמשתמש בלולאה לחזרתיות.'],
      ['Hover Cost','המחיר האנרגטי של ריחוף/השהייה באוויר.' ]
    ],
    safetyRules: [
      'זהו מפגש חצי־פיזי: הרצות קצרות ומדידות דאטה, רק באישור מדריך ובתוך Safe Fly Zone.',
      'משקפי מגן, מגיני פרופלורים, סוללה תקינה ו־Observer הם חובה בכל הרצה.',
      'לא משווים אלגוריתמים אם תנאי הבטיחות או הסוללה אינם תקינים.',
      'אם סוללה נראית נפוחה/פגומה או נתוני הטלמטריה קופצים — לא משתמשים בה.',
      'בין אלגוריתם א׳ לב׳ מתעדים תנאי התחלה כדי שההשוואה תהיה הוגנת.',
      'בסיום כל הרצה מוציאים סוללה ומעבירים לקופסת ריקות לפי נוהל.'
    ],
    commonDirections: [
      ['Meeting9_Algorithm_A','גרסת קוד ליניארי עם השהיות ארוכות.'],
      ['Meeting9_Algorithm_B','גרסת קוד בלולאת for עם השהיות קצרות.'],
      ['Start% / End%','אחוז סוללה לפני ואחרי כל הרצה.'],
      ['Total Time (sec)','זמן הטיסה הכולל בשניות לפי סטופר.'],
      ['Burn Rate','ΔBattery / Total Time.'],
      ['Meeting9_Algorithm_Perfect_v3','גרסת הקוד האופטימלית שמוגשת בסוף.' ]
    ],
    setupSteps: [
      'מסמנים Safe Fly Zone ומנחת למסלול ריבוע 150 ס״מ.',
      'מכינים רחפנים עם מגינים, משקפי מגן וסוללות ממוספרות.',
      'מכינים דף עבודה: Algorithm, Start%, End%, ΔBattery, Time, Burn Rate, Code Lines.',
      'טוענים/יוצרים שני פרויקטים בענן: Meeting9_Algorithm_A ו־Meeting9_Algorithm_B.',
      'סטופר מוכן לכל צוות ומדריך מוודא תנאי השוואה הוגנים.'
    ],
    tabletTips: [
      'שמרו שני קבצים נפרדים כדי לא לדרוס את אחת הגרסאות.',
      'רשמו Start% לפני לחיצה על Run ולא מהזיכרון אחרי ההרצה.',
      'הפעילו סטופר יחד עם Run ועצרו אחרי land.',
      'ספרו שורות קוד משמעותיות בלי הערות ריקות.',
      'אם Telemetry קופצת, המתינו 5 שניות או הפעילו מחדש את הרחפן לפי הנחיית מדריך.',
      'בסוף שמרו את הגרסה הנבחרת כ־Meeting9_Algorithm_Perfect_v3.'
    ],
    lessonFlow: [
      { minutes:'0–6', title:'בדיקת תנאי קדם משיעור 8', teacher:'מחבר מהמכשולים הדינמיים: השתמשנו בטלמטריה לדיבוג; היום משתמשים בנתונים כדי לבחור אלגוריתם.', students:'מזכירים נתון טלמטריה אחד שעזר להם בשיעור 8.' },
      { minutes:'6–14', title:'סיפור מסגרת — Google Wing', teacher:'מציג את בעיית טווח המשלוחים וקיבולת סוללת LiPo מוגבלת.', students:'מנסחים מדוע קוד שעובד עדיין יכול להיות לא מספיק טוב.' },
      { minutes:'14–26', title:'Performance Tuning ו־Burn Rate', teacher:'מסביר ΔBattery ו־Burn Rate ומדגים חישוב פשוט על נתוני דוגמה.', students:'מחשבים דוגמה: 85→79 ב־32 שניות לעומת 79→76 ב־20 שניות.' },
      { minutes:'26–38', title:'כתיבת שני אלגוריתמים', teacher:'מנחה יצירת Meeting9_Algorithm_A ו־B: ליניארי עם sleep ארוך מול for loop עם sleep קצר.', students:'כותבים/טוענים את שתי הגרסאות ושומרים בענן.' },
      { minutes:'38–45', title:'Pre‑Flight וניסוי הוגן', teacher:'בודק Safe Fly Zone, תפקידים, סוללות, מגינים, Abort ודף נתונים לפני הרצה.', students:'Driver/Navigator/Observer מתחלקים ותופסים Start% ראשון.' },
      { minutes:'45–58', title:'הרצה 1 — Algorithm A', teacher:'מאשר הרצה פיזית קצרה ומוודא מדידת זמן וסוללה לפני/אחרי.', students:'מריצים אלגוריתם א׳, מודדים זמן, End% וממלאים טבלה.' },
      { minutes:'58–70', title:'הרצה 2 — Algorithm B', teacher:'מוודא סוללה/תנאים הוגנים ומאשר הרצה שנייה.', students:'מריצים אלגוריתם ב׳, מודדים אותם פרמטרים ומשלימים טבלה.' },
      { minutes:'70–82', title:'ניתוח נתונים והמלצה', teacher:'מוביל חישוב ΔBattery, Burn Rate וספירת שורות קוד.', students:'מחשבים ומשווים מי חסכוני יותר ומנסחים המלצה Data‑Driven.' },
      { minutes:'82–90', title:'שמירה, סוללות וסיכום', teacher:'מנהל הוצאת סוללות, שמירת Meeting9_Algorithm_Perfect_v3 ושיחת רפלקציה.', students:'משתפים Link/צילום ודף נתונים ומחזירים ציוד.' }
    ],
    exercises: [
      { minutes:'0–6', title:'גשר טלמטריה', prompt:'כתבו איזה נתון טלמטריה יכול להפוך החלטה מתחושה להחלטה מדעית.', check:'התלמיד מזהה סוללה/זמן/גובה כנתון.' },
      { minutes:'14–26', title:'חישוב Burn Rate לדוגמה', prompt:'חשבו ΔBattery ו־Burn Rate עבור 85→79 ב־32 שניות ו־79→76 ב־20 שניות.', check:'התלמיד יודע לבצע חישוב בסיסי ולהשוות.' },
      { minutes:'26–38', title:'שני קבצי קוד', prompt:'צרו Meeting9_Algorithm_A ו־Meeting9_Algorithm_B ושמרו את שניהם בענן.', check:'שתי גרסאות קיימות ולא נדרסה אחת מהן.' },
      { minutes:'45–58', title:'הרצת Algorithm A', prompt:'הריצו קוד ליניארי במסלול ריבוע 150 ס״מ ורשמו Start%, End% וזמן.', check:'יש מדידה מלאה ובטיחות נשמרה.' },
      { minutes:'58–70', title:'הרצת Algorithm B', prompt:'הריצו קוד לולאה במסלול זהה ורשמו אותם נתונים.', check:'ההשוואה מבוצעת על משימה דומה.' },
      { minutes:'70–82', title:'טבלת יעילות', prompt:'חשבו ΔBattery, Burn Rate ומספר שורות קוד לכל אלגוריתם.', check:'יש השוואה כמותית ולא רק התרשמות.' },
      { minutes:'82–90', title:'המלצת מהנדסים', prompt:'שמרו Meeting9_Algorithm_Perfect_v3 וכתבו איזה אלגוריתם מומלץ ולמה.', check:'ההמלצה מסתמכת על לפחות שני מדדים.' }
    ],
    deliverable: 'Share Link או צילום מסך לגרסת Meeting9_Algorithm_Perfect_v3 + טבלת ניתוח יעילות הכוללת Algorithm A/B, Start%, End%, ΔBattery, זמן טיסה, Burn Rate ומספר שורות קוד.',
    assessment: [
      'שתי גרסאות הקוד נשמרו ונבדקו בנפרד.',
      'הצוות ביצע Pre‑Flight מלא לפני כל הרצה פיזית.',
      'נאספו נתוני Start%, End% וזמן לכל אלגוריתם.',
      'בוצעו חישובי ΔBattery ו־Burn Rate בצורה נכונה.',
      'ההמלצה הסופית מנומקת באמצעות נתונים ולא תחושה.'
    ],
    debugging: [
      { problem:'Telemetry Battery קופצת או אינה יציבה', fix:'ממתינים 5 שניות בריחוף/חיבור יציב לפני מדידה או מבצעים Restart מהיר לרחפן באישור מדריך.' },
      { problem:'אלגוריתם א׳ נראה חסכוני יותר מאלגוריתם ב׳', fix:'בודקים אם השתמשו בסוללה פגומה/ישנה או אם הנתונים נרשמו לא נכון; חוזרים על Algorithm B עם סוללה ממוספרת אחרת.' },
      { problem:'Yaw באלגוריתם ב׳ מחליק או לא מדויק', fix:'בודקים רצפה/רוח/השתקפויות, מוסיפים שטיחון כהה או סרט סימון לשיפור VPS.' },
      { problem:'הצוות לא מודד זמן באופן עקבי', fix:'Driver לוחץ Run ו־Navigator מפעיל סטופר באותה קריאה קולית. עוצרים אחרי land.' },
      { problem:'השוואה לא הוגנת בגלל סוללות שונות', fix:'מתעדים Start% לכל הרצה ומחשבים Burn Rate, לא מסתפקים בצריכה כוללת בלבד.' }
    ],
    differentiation: {
      support: ['לתת דף טבלה מוכן עם נוסחאות ΔBattery ו־Burn Rate.', 'להריץ פיזית רק אלגוריתם אחד ולנתח נתוני דוגמה לאלגוריתם השני אם אין זמן.', 'לתת קוד מוכן ולהתמקד במדידה וחישוב.'],
      extension: ['להוסיף מדד שורות קוד/שנייה או סוללה/צלע.', 'להציע גרסה C שמפחיתה sleep בלי לפגוע ביציבות.', 'לכתוב מסקנה עסקית: כמה משלוחים נוספים אפשר לבצע אם חוסכים 3% סוללה למשימה.' ]
    },
    instructorGuide: {
      prerequisites:'שיעור 9 נשען על שיעורים 5 ו־8 הפיזיים ועל שיעורי לולאות/משתנים. התלמידים כבר מכירים Safe Fly Zone, WiFi Handshake, טלמטריה, גרסאות וקוד לולאה. כאן הדגש עובר מהשלמת משימה למדידת ביצועים והוכחת יעילות באמצעות נתונים.',
      pedagogy:['להדגיש שהשאלה אינה האם הקוד עובד, אלא כמה משאבים הוא צורך.', 'להקפיד על ניסוי הוגן: אותו מסלול, אותם מדדים, תיעוד Start% וזמן.', 'להציג את Burn Rate כגשר בין מתמטיקה, פיזיקה ומדעי המחשב.', 'לא להפוך את השיעור למרוץ מהירות; בטיחות ומדידה איכותית קודמות לתחרות.', 'אם אין זמן לשתי הרצות פיזיות לכל צוות, להריץ פיזית מדגם צוותים ולנתח נתונים כיתתיים.' ],
      exitTicket:'בחרתי באלגוריתם ___ כי הנתונים הראו ___; Burn Rate מחושב על ידי ___.'
    },
    appWorkflowTitle: 'מעבדה חצי־פיזית — Performance Tuning Data Lab',
    appWorkflowNote: 'שיעור 9 כולל הרצות פיזיות קצרות ואיסוף נתוני טלמטריה, ואז ניתוח מתמטי בשולחן. האתר מציג את הניסוי; הקוד, ההרצה והשיתוף מתבצעים ב־DroneBlocks Code.',
    appWorkflow: [
      { title:'יצירת שתי גרסאות', detail:'על WiFi בית ספרי צרו Meeting9_Algorithm_A ו־Meeting9_Algorithm_B ושמרו את שתיהן בענן.' },
      { title:'Pre‑Flight וטבלת נתונים', detail:'עברו ל־Tello‑XXXX באישור מדריך. בדקו סוללה, מגינים, משקפי מגן, Safe Zone, Observer וטבלת מדידה.' },
      { title:'הרצת Algorithm A', detail:'הריצו קוד ליניארי במסלול ריבוע 150 ס״מ. רשמו Start%, End% וזמן בשניות.' },
      { title:'הרצת Algorithm B', detail:'הריצו קוד לולאה אופטימלי באותו מסלול. רשמו את אותם מדדים.' },
      { title:'חישוב והגשה', detail:'חשבו ΔBattery ו־Burn Rate, בחרו גרסה מנצחת, שמרו Meeting9_Algorithm_Perfect_v3 ושתפו Link/דוח.' }
    ],
    codeSamples: [
      { title:'Algorithm A — קוד ליניארי לא אופטימלי', code:'tello.takeoff();\ntello.sleep(5); // השהיית יתר\ntello.flyForward(150);\ntello.sleep(4);\ntello.flyRight(150);\ntello.sleep(4);\ntello.flyBackward(150);\ntello.sleep(4);\ntello.flyLeft(150);\ntello.sleep(4);\ntello.land();' },
      { title:'Algorithm B — קוד לולאה אופטימלי', code:'tello.takeoff();\ntello.sleep(3);\n\nfor (let i = 0; i < 4; i++) {\n  tello.flyForward(150);\n  tello.sleep(2);\n  tello.yawRight(90);\n}\n\ntello.land();' },
      { title:'נוסחאות ניתוח נתונים', code:'ΔBattery = Start% - End%\nBurn Rate = ΔBattery / Total Time (sec)\n\nExample A: (85 - 79) / 32 = 0.1875% per sec\nExample B: (79 - 76) / 20 = 0.15% per sec' }
    ],
    visualDiagram: { title:'Performance Tuning — Data Lab', caption:'השוואת שתי גרסאות על מסלול ריבוע 150 ס״מ: Algorithm A ליניארי עם sleep ארוך מול Algorithm B בלולאת for עם sleep קצר. מודדים סוללה וזמן ומחשבים Burn Rate.', chip:'Data Lab', panelTitle:'📊 תרשים ניסוי יעילות', src:'assets/drone-intelligence-lab-grade9/lesson9/performance-tuning-data-lab.svg', alt:'תרשים מעבדת ניתוח יעילות קוד וצריכת סוללה לשיעור 9' },
    screenshotSlides: [
      { title:'תרשים התרגיל — Performance Tuning Data Lab', src:'assets/drone-intelligence-lab-grade9/lesson9/performance-tuning-data-lab.svg', caption:'המחשה לכיתה: מסלול פיזי בטוח, שתי גרסאות אלגוריתם, Telemetry וטבלת חישוב Battery Burn Rate.' }
    ],
    instructorSlides: [
      { title:'קוד שעובד לא מספיק', body:'מהנדס בודק גם כמה זמן, סוללה ושורות קוד הפתרון דורש.', bullets:['זמן', 'סוללה', 'שורות קוד'] },
      { title:'שתי גרסאות לאותה משימה', body:'Algorithm A ליניארי וארוך; Algorithm B משתמש בלולאה ומפחית sleep.', bullets:['Linear', 'Loop', 'Sleep cost'] },
      { title:'Telemetry → החלטה', body:'Start%, End% וזמן טיסה הופכים תחושה למסקנה מדידה.', bullets:['ΔBattery', 'Burn Rate', 'Data‑Driven'] },
      { title:'Performance Tuning', body:'בסוף בוחרים גרסה לא כי היא יפה, אלא כי הנתונים מוכיחים שהיא יעילה.', bullets:['חישוב', 'השוואה', 'המלצה'] }
    ]
  };


  const lessonTenFinal = {
    title: 'שיעור 10: IAI Project Blueprint — אפיון מעבדה חכמה בשטח',
    subtitle: 'System Design, טאבלטים הפוכים, Skeleton Code, Helper Functions ו־City Simulator',
    concept: 'Drone Intelligence Project Blueprint, System Design, פונקציות עזר ותכנון מודולרי',
    story: 'צוותי כיתה ט׳ עתודה פועלים כצוותי פיתוח רובוטיקה ובינה מלאכותית ב־Israel Aerospace Industries. המשימה: לתכנן Blueprint למערכת אבטחה אוטונומית מבוססת רחפן Tello שמסיירת סביב מתחם רגיש ומשנה מסלול במקרה של חדירה.',
    mission: 'לבצע תכנון נייר בטאבלטים הפוכים, להגדיר משתנים גלובליים ופונקציות עזר, לכתוב Skeleton Code ב־JavaScript, ולהריץ אב־טיפוס וירטואלי ב־City Simulator או Minimal Grid ללא הטסה פיזית.',
    workspaceMode: 'project-workflow',
    physicalFlightAllowed: false,
    blocks: ['comment','variable','function','loop','condition','takeoff','sleep','flyUp','flyForward','yawRight','land','project','share'],
    essentialQuestion: 'איך מתכננים מערכת רחפן חכמה לפני כתיבת הקוד, כך שהקוד יהיה מודולרי, בטוח ומוכן לבדיקה פיזית בשיעור הבא?',
    successCriteria: [
      'אני מתחיל/ה בתכנון על נייר לפני פתיחת הטאבלט לכתיבת קוד.',
      'אני מפרק/ת את משימת האבטחה למשתנים, פונקציות, תנאים ותוצר בדיקה.',
      'אני מגדיר/ה משתנים מטריים כמו scanDistance, safeAltitude ו־intrusionDetected.',
      'אני כותב/ת פונקציית patrolZone(sides, distance) שמכילה לולאת for.',
      'אני שומר/ת Blueprint סופי בשם Meeting10_IAI_Project_Final_Blueprint ומשתף/ת Link.'
    ],
    realWorldUses: [
      { icon:'🛡️', title:'אבטחת מתחם רגיש', text:'רחפן סיור יכול לבדוק היקף של מחסן או אתר מסוכן לפני כניסת צוות אנושי.' },
      { icon:'📐', title:'System Design', text:'לפני קוד ארוך, מהנדסים מגדירים דרישות, אילוצים, משתנים ופונקציות.' },
      { icon:'🧩', title:'קוד מודולרי', text:'פונקציות עזר מאפשרות לבנות מערכת מורכבת מחלקים קטנים שניתנים לבדיקה.' }
    ],
    vocabulary: [
      ['Blueprint','מפרט תכנון: שרטוט, דרישות, משתנים, פונקציות ולוגיקת החלטה לפני מימוש מלא.'],
      ['System Design','תכנון מבנה מערכת לפני כתיבת קוד מפורט.'],
      ['Skeleton Code','שלד קוד עם משתנים ופונקציות, גם לפני שכל הלוגיקה מלאה.'],
      ['Helper Function','פונקציית עזר שמבצעת תת־משימה חוזרת כמו סיור היקפי.'],
      ['patrolZone','פונקציית סיור סביב מתחם לפי מספר צלעות ומרחק.'],
      ['intrusionDetected','משתנה בוליאני שמייצג האם זוהתה חדירה.'],
      ['טאבלטים הפוכים','שלב תכנון ללא הקלדה: נייר, שרטוט וארכיטקטורה לפני קוד.' ]
    ],
    safetyRules: [
      'מפגש 10 הוא תכנון וסימולטור בלבד — אין הטסה פיזית ואין חיבור לרחפנים.',
      'הרחפנים נשארים בארונות; אין TELLO WiFi, אין סוללות ואין מנועים.',
      'השרטוט חייב לכלול מרחקים מטריים בסנטימטרים וגובה בטוח לפני קוד.',
      'אב־טיפוס נבדק ב־City Simulator או Minimal Grid בלבד.',
      'קוד ללא land בכל מסלול החלטה לא מאושר לשימוש עתידי.',
      'Blueprint מאושר היום הוא תנאי להכנת זירת בדיקה פיזית בשיעור הבא.'
    ],
    commonDirections: [
      ['scanDistance = 150','צלע מתחם אבטחה: 150 ס״מ.'],
      ['safeAltitude = 120','גובה מעבר מעל מכשולים בגובה 110 ס״מ.'],
      ['intrusionDetected = false','ברירת מחדל: אין חדירה, מבצעים סיור היקפי.'],
      ['function patrolZone(sides, distance)','פונקציה מודולרית לסיור סביב המתחם.'],
      ['patrolZone(4, scanDistance)','סיור מלא סביב ריבוע של ארבע צלעות.'],
      ['Meeting10_IAI_Project_Final_Blueprint','שם גרסת התכנון הסופית להגשה.' ]
    ],
    setupSteps: [
      'מחלקים דפי משבצות A3/A4 וכלי כתיבה לכל צוות.',
      'פותחים את השיעור עם “טאבלטים הפוכים” — אין הקלדה עד שיש שרטוט.',
      'טאבלטים טעונים וחיבור WiFi בית ספרי לשמירה בענן.',
      'DroneBlocks Code פתוח רק אחרי תכנון ראשוני.',
      'City Simulator או Minimal Grid מוכנים לבדיקת אב־טיפוס.'
    ],
    tabletTips: [
      'אל תפתחו קוד לפני שיש שרטוט ומפרט משתנים.',
      'כתבו תחילה הערות // שמגדירות חלקי מערכת: משתנים, פונקציות, החלטה, ביצוע.',
      'ודאו ששם הפונקציה זהה בהגדרה ובקריאה: patrolZone.',
      'שמרו Skeleton Code גם אם הוא עדיין לא מושלם — זה חלק מה־Blueprint.',
      'בבדיקת סימולטור חפשו שגיאות לוגיות, לא ביצועים פיזיים.',
      'שתפו Link כדי שהמדריך יאשר את ה־Blueprint לפני שיעור 11.'
    ],
    lessonFlow: [
      { minutes:'0–6', title:'בדיקת תנאי קדם משיעור 9', teacher:'מחבר מ־Performance Tuning: למדנו לבחור קוד לפי נתונים; היום מתכננים מערכת שלמה לפני ביצוע.', students:'כותבים מדד אחד שצריך להיכנס ל־Blueprint של פרויקט רחפן.' },
      { minutes:'6–16', title:'סיפור מסגרת — IAI Thermal Shield', teacher:'מציג מערכת אבטחה אוטונומית סביב מתחם 150×150 ס״מ עם מכשולים בגובה 110 ס״מ ומשתנה חדירה.', students:'מזהים דרישות: סיור, גובה בטוח, תגובה לחדירה, תוצר שיתוף.' },
      { minutes:'16–26', title:'System Design ופירוק בעיה', teacher:'מסביר Blueprint, Helper Functions ו־Skeleton Code. מדגיש: קודם ארכיטקטורה, אחר כך הקלדה.', students:'מפרקים את המשימה למשתנים, פונקציות ותנאי החלטה.' },
      { minutes:'26–38', title:'טאבלטים הפוכים — שרטוט נייר', teacher:'מחלק דפי משבצות ומבקש שרטוט מתחם, ארבע פינות, בניין מרכזי, נתיב חדירה ונתיב סיור.', students:'משרטטים מסלול מטרי ומסמנים פונקציות/משתנים ליד חלקי המסלול.' },
      { minutes:'38–48', title:'פתיחת פרויקט ו־Skeleton Code', teacher:'מוביל WiFi בית ספרי, Login, יצירת Meeting10_IAI_Project_Blueprint ושמירה ראשונית.', students:'פותחים קובץ וכותבים הערות מבנה + משתנים גלובליים.' },
      { minutes:'48–62', title:'פונקציית patrolZone', teacher:'מלווה כתיבת function patrolZone(sides, distance) עם לולאת for ו־yawRight(90).', students:'כותבים פונקציה, מקפידים על שם זהה בהגדרה ובקריאה.' },
      { minutes:'62–75', title:'לוגיקת intrusionDetected', teacher:'מנחה כתיבת if/else: חדירה → חיתוך למרכז וסריקה נמוכה; אין חדירה → סיור היקפי.', students:'משלבים תנאי ומשלימים נתיב land בכל ענף.' },
      { minutes:'75–82', title:'בדיקת אינטגרציה בסימולטור', teacher:'מבקש להריץ ב־City Simulator או Minimal Grid ולבדוק Syntax/Reference errors.', students:'מריצים אב־טיפוס, מתקנים שגיאה אחת ומתעדים מה תוקן.' },
      { minutes:'82–90', title:'אישור Blueprint ושיתוף', teacher:'אוסף Share Links ומבקש מהצוותים לציין אתגר צפוי בשיעור הפיזי הבא.', students:'שומרים Meeting10_IAI_Project_Final_Blueprint ומשלימים כרטיס יציאה.' }
    ],
    exercises: [
      { minutes:'0–6', title:'גשר Data → Blueprint', prompt:'כתבו איזה מדד/אילוץ משיעור 9 צריך להופיע בתכנון פרויקט גמר.', check:'התלמיד מחבר נתונים לאפיון.' },
      { minutes:'16–26', title:'פירוק מערכת', prompt:'רשמו שלושה משתנים, פונקציה אחת ותנאי אחד שיידרשו למערכת האבטחה.', check:'יש מרכיבי ארכיטקטורה לפני קוד.' },
      { minutes:'26–38', title:'טאבלטים הפוכים', prompt:'שרטטו מתחם 150×150 ס״מ, בניין 110 ס״מ, מנחת, נתיב סיור ונתיב חדירה.', check:'השרטוט כולל מרחקים וגובה בטוח.' },
      { minutes:'38–48', title:'Skeleton Code', prompt:'פתחו Meeting10_IAI_Project_Blueprint וכתבו הערות מבנה + משתנים גלובליים.', check:'הקוד מתחיל כמפרט מסודר ולא כרצף אקראי.' },
      { minutes:'48–62', title:'Helper Function', prompt:'כתבו function patrolZone(sides, distance) עם לולאת for שמקיפה מתחם מרובע.', check:'שם הפונקציה והקריאה העתידית עקביים.' },
      { minutes:'62–75', title:'If/Else Project Logic', prompt:'כתבו תנאי intrusionDetected: חדירה למרכז, אחרת סיור היקפי.', check:'לכל ענף יש מסלול בטוח ו־land.' },
      { minutes:'75–82', title:'בדיקת אינטגרציה', prompt:'הריצו בסימולטור ותקנו שגיאת Reference/Syntax אחת אם קיימת.', check:'אב־טיפוס רץ או מתועד עם שגיאה ברורה.' },
      { minutes:'82–90', title:'הגשת Blueprint', prompt:'שמרו Meeting10_IAI_Project_Final_Blueprint ושתפו Link למדריך.', check:'ה־Blueprint ניתן לבדיקה לפני שיעור 11.' }
    ],
    deliverable: 'Share Link או צילום מסך לגרסת Meeting10_IAI_Project_Final_Blueprint הכוללת שרטוט נייר/תכנון, משתנים גלובליים, function patrolZone, תנאי intrusionDetected ואב־טיפוס שנבדק בסימולטור.',
    assessment: [
      'הצוות ביצע תכנון נייר לפני כתיבת קוד.',
      'ה־Blueprint כולל משתנים, פונקציה, לולאה ותנאי החלטה.',
      'כל המרחקים והגבהים מוצגים בשיטה מטרית בסנטימטרים.',
      'הקוד משתמש בשם פונקציה עקבי בהגדרה ובקריאה.',
      'האב־טיפוס נשמר ושיתף Link לאישור מדריך לפני השיעור הבא.'
    ],
    debugging: [
      { problem:'City Simulator איטי או קופא בהרצת Blueprint', fix:'עוברים ל־Minimal Grid. המטרה היא בדיקת אינטגרציה לוגית, לא איכות גרפית.' },
      { problem:'ReferenceError: patrolZone is not defined', fix:'בודקים ששם הפונקציה זהה בדיוק בהגדרה ובקריאה, כולל CamelCase.' },
      { problem:'Compilation Error בגלל סוגריים', fix:'בודקים שכל function, for, if ו־else נסגרים בסוגר מסולסל מתאים.' },
      { problem:'ענף intrusion לא מסתיים בבטחה', fix:'מוסיפים land או מסלול סיום ברור לכל ענף החלטה.' },
      { problem:'הצוות התחיל להקליד בלי תכנון', fix:'עוצרים, הופכים טאבלטים, ומשלימים שרטוט/רשימת משתנים לפני המשך.' }
    ],
    differentiation: {
      support: ['לתת תבנית Blueprint עם כותרות: משתנים, פונקציות, תנאים, תוצר.', 'לאפשר לצוות מתקשה לכתוב פונקציה ריקה עם הערות במקום קוד מלא.', 'להשתמש בשרטוט צבעוני: כחול לסיור, כתום לחדירה, ירוק לגובה בטוח.'],
      extension: ['להוסיף פונקציה scanIntrusionZone(distance, altitude).', 'להוסיף משתנה batterySafe ולהרחיב את תנאי ההחלטה.', 'להציע קריטריוני הצלחה למדידה בשיעור 11: דיוק, זמן, סוללה, בטיחות.' ]
    },
    instructorGuide: {
      prerequisites:'שיעור 10 פותח את שלב פרויקט הגמר. התלמידים כבר למדו סינטקס, תנועה, גובה, לולאות, תנאים, טלמטריה ואופטימיזציה. כעת הם צריכים להפוך ידע מפוזר לארכיטקטורת מערכת. אין טיסה פיזית בשיעור זה; אישור Blueprint הוא תנאי לשיעור הפיתוח/בדיקות הבא.',
      pedagogy:['להתעקש על “טאבלטים הפוכים”: זה שיעור ארכיטקטורה, לא עוד תרגיל הקלדה.', 'Blueprint טוב מצמצם סיכון פיזי בשיעורים הבאים כי הוא חושף בעיות לפני הטיסה.', 'להדגיש שפונקציות הן כלי ארגון, לא רק נושא תחבירי.', 'לאפשר פתרונות שונים כל עוד יש משתנים, פונקציה, תנאי, land ותוצר ברור.', 'לשמור את פתרון הקוד במערך מדריך בלבד; המצגת צריכה להציג מבנה, לא תשובה מלאה.' ],
      exitTicket:'Blueprint טוב עוזר לי כי ___; הפונקציה המרכזית בפרויקט שלי היא ___.'
    },
    appWorkflowTitle: 'עבודת פרויקט — IAI Project Blueprint',
    appWorkflowNote: 'מפגש 10 הוא שיעור אפיון ותכנון. אין טיסה פיזית. מתחילים בנייר, ממשיכים ל־Skeleton Code ב־DroneBlocks Code, ובודקים אב־טיפוס בסימולטור בלבד.',
    appWorkflow: [
      { title:'טאבלטים הפוכים', detail:'לפני קוד: שרטטו מתחם 150×150 ס״מ, בניין 110 ס״מ, נתיב סיור, נתיב חדירה וגובה בטוח.' },
      { title:'פתיחת פרויקט', detail:'על WiFi בית ספרי פתחו DroneBlocks Code, Login, וצרו Meeting10_IAI_Project_Blueprint.' },
      { title:'Skeleton Code', detail:'כתבו הערות מבנה, משתנים גלובליים ופונקציות ריקות לפני מילוי הלוגיקה.' },
      { title:'אב־טיפוס בסימולטור', detail:'מלאו patrolZone ו־if/else, הריצו ב־City Simulator או Minimal Grid ותקנו שגיאות אינטגרציה.' },
      { title:'אישור ושיתוף', detail:'שמרו Meeting10_IAI_Project_Final_Blueprint ושתפו Link למדריך לאישור לקראת שיעור 11.' }
    ],
    codeSamples: [
      { title:'System Design Blueprint — קוד מלא למדריך', code:'// SYSTEM DESIGN BLUEPRINT - SECURITY PATROL\n// Drone Intelligence Lab - Meeting 10\n// All distances are centimeters\n\nlet scanDistance = 150;\nlet safeAltitude = 120;\nlet patrolSpeed = 100;\nlet intrusionDetected = false;\n\nfunction patrolZone(sides, distance) {\n  for (let i = 0; i < sides; i++) {\n    tello.flyForward(distance);\n    tello.sleep(2);\n    tello.yawRight(90);\n    tello.sleep(1);\n  }\n}\n\ntello.takeoff();\ntello.sleep(3);\ntello.flyUp(patrolSpeed);\ntello.sleep(2);\n\nif (intrusionDetected == true) {\n  tello.flyUp(20);\n  tello.flyForward(75);\n  tello.sleep(2);\n  tello.land();\n} else {\n  tello.flyUp(20);\n  patrolZone(4, scanDistance);\n  tello.sleep(2);\n  tello.land();\n}' }
    ],
    visualDiagram: { title:'IAI Project Blueprint — Security Patrol', caption:'מתחם אבטחה 150×150 ס״מ, בניין מרכזי 110 ס״מ, גובה בטוח 120 ס״מ, פונקציית patrolZone לסיור היקפי ומשתנה intrusionDetected למסלול חדירה.', chip:'Blueprint', panelTitle:'📐 תרשים אפיון פרויקט', src:'assets/drone-intelligence-lab-grade9/lesson10/iai-project-blueprint.svg', alt:'תרשים Blueprint לפרויקט סיור אבטחה אוטונומי של רחפן' },
    screenshotSlides: [
      { title:'תרשים התרגיל — IAI Project Blueprint', src:'assets/drone-intelligence-lab-grade9/lesson10/iai-project-blueprint.svg', caption:'המחשה לכיתה: תכנון נייר, מתחם אבטחה, מסלול סיור, מסלול חדירה, משתנים גלובליים ופונקציית patrolZone.' }
    ],
    instructorSlides: [
      { title:'לפני קוד — Blueprint', body:'מהנדסים לא מתחילים בהקלדה. קודם מגדירים דרישות, אילוצים, משתנים ופונקציות.', bullets:['דרישות', 'אילוצים', 'ארכיטקטורה'] },
      { title:'טאבלטים הפוכים', body:'10 דקות של נייר חוסכות 30 דקות דיבוג. קודם שרטוט, אחר כך DroneBlocks Code.', bullets:['שרטוט', 'מסלול', 'תתי־משימות'] },
      { title:'פונקציות מארגנות מערכת', body:'patrolZone הופכת סיור היקפי לרכיב קוד שאפשר לקרוא, לבדוק ולשפר.', bullets:['function', 'parameters', 'reuse'] },
      { title:'מוכנות לשיעור 11', body:'Blueprint מאושר היום יהפוך לאבטיפוס פיתוח ובדיקות בשיעור הבא.', bullets:['Share Link', 'אישור מדריך', 'סיכוני שטח'] }
    ]
  };


  const lessonElevenFinal = {
    title: 'שיעור 11: Launchpad Flight Testing — בדיקות שטח, צילום ודיבגינג פיזי',
    subtitle: 'Physical Flight Testing, Sim‑to‑Reality Gap, Visual Telemetry, takePhoto ו־Calibration',
    concept: 'פיתוח, בדיקות שטח פיזיות, Visual Telemetry, Motion Blur ודיבגינג קוד פרויקט הגמר',
    story: 'צוותי כיתה ט׳ עתודה פועלים כצוותי הנדסה ובקרה במעבדות NASA JPL. אחרי ה־Blueprint משיעור 10, הם מבצעים Launchpad Flight Testing פיזי לקוד פרויקט הגמר: סיור אבטחה היקפי בכיתה, צילום מטרות ניסוי, פענוח הקוד הסודי I‑A‑I וכיול הקוד לפי פערי המציאות.',
    mission: 'לטעון את Blueprint פרויקט הגמר משיעור 10, לשמור גרסה חדשה בשם Meeting11_IAI_Flight_Testing, להתחבר לרחפן Tello פיזי, להריץ סיור ריבועי 150×150 ס״מ בתוך Safe Fly Zone, לצלם 3 כרטיסיות, להוריד תמונות לטאבלט, לכייל sleep/scanDistance לפי Motion Blur או סטיות, ולשמור גרסה מכוילת בשם Meeting11_IAI_Flight_Testing_Calibrated_v2.',
    workspaceMode: 'physical-lab',
    physicalFlightAllowed: true,
    presentationMode: 'focused',
    blocks: ['safety_check','wifi','battery','comment','variable','function','loop','takeoff','sleep','flyUp','flyForward','yawRight','photo','land','debug','project','share'],
    essentialQuestion: 'איך הופכים Blueprint שעבד בסימולטור למערכת רחפן פיזית שמצלמת נתוני שטח חדים, בטוחים ומדויקים?',
    successCriteria: [
      'אני מבצע/ת WiFi Handshake: בית ספר לטעינה/שמירה, ואז Tello‑XXXX להרצה פיזית.',
      'אני מיישם/ת תפקידי צוות: Driver, Navigator ו־Observer בטיחות עם משקפי מגן.',
      'אני מריץ/ה קוד פיזי במלבן טיסה מסומן בלבד ומקפיד/ה על נוהל שתי קופסאות לסוללות.',
      'אני משתמש/ת ב־tello.takePhoto() עם sleep לפני ואחרי צילום כדי למנוע Motion Blur.',
      'אני מוריד/ה לטאבלט 3 תמונות חדות של הכרטיסיות I‑A‑I ומבצע/ת כיול לפי הממצאים.',
      'אני שומר/ת את הגרסה שעבדה במציאות בשם Meeting11_IAI_Flight_Testing_Calibrated_v2.'
    ],
    realWorldUses: [
      { icon:'🚀', title:'Launchpad Flight Testing', text:'לפני שמערכת אוטונומית נחשבת מוכנה, בודקים אותה על חומרת אמת בסביבה מבוקרת.' },
      { icon:'📸', title:'Visual Telemetry', text:'תמונה מהרחפן היא נתון שטח: חדות, מיקום וקריאות מאפשרים להסיק אם המסלול מדויק.' },
      { icon:'🧭', title:'Sim‑to‑Reality Gap', text:'רצפה חלקה, תאורה, סוללה וזרמי אוויר גורמים לסטיות שלא תמיד קיימות בסימולטור.' }
    ],
    vocabulary: [
      ['Launchpad Flight Testing','סדרת בדיקות התאמה של קוד על רחפן פיזי בתוך אזור מבוקר.'],
      ['Sim‑to‑Reality Gap','הפער בין ביצוע מושלם בסימולטור לבין סטיות בעולם האמיתי.'],
      ['Visual Telemetry','שימוש בתמונות הרחפן כנתוני שטח לצורך ניתוח וכיול.'],
      ['Motion Blur','טשטוש תמונה שנוצר כאשר הרחפן מצלם בזמן תנועה או רעידות.'],
      ['takePhoto','פקודת צילום חומרה פיזית; חייבת להגיע אחרי sleep לייצוב.'],
      ['WiFi Handshake','מעבר מסודר מ־WiFi בית ספרי לענן אל רשת Tello להרצה פיזית.'],
      ['Calibration','כיול משתנים כמו scanDistance או sleep לפי תוצאות הטיסה הפיזית.'],
      ['Two‑Box Battery Protocol','ניהול סוללות מלאות וריקות בשתי קופסאות כדי למנוע טעויות וסיכון.' ]
    ],
    safetyRules: [
      'שיעור 11 הוא מפגש הטסה פיזי מלא — רק בתוך Safe Fly Zone מסומן ורק באישור מדריך.',
      'כל מי שנמצא סביב מלבן הטיסה מרכיב משקפי מגן; שיער ארוך אסוף; אין כניסה למלבן בזמן רחפנים באוויר.',
      'Observer מכריז “רחפנים באוויר! צוות X ממריא!” ושומר קשר עין רציף עם הרחפן.',
      'Driver מחזיק אצבע מוכנה על Abort/Land בכל רגע.',
      'מגיני פרופלורים מותקנים, סוללה ממוספרת ומלאה בלבד, ונוהל שתי קופסאות נשמר לכל אורך המפגש.',
      'אם יש Drift, רעש חריג, תמונה שחורה, Connection Timed Out או סוללה מתחת ל־30% — Land/Abort ועוצרים לכיול.'
    ],
    commonDirections: [
      ['Meeting11_IAI_Flight_Testing','גרסת ניסוי פיזי חדשה שנשמרת אחרי טעינת Blueprint שיעור 10.'],
      ['Meeting11_IAI_Flight_Testing_Calibrated_v2','הגרסה המכוילת שעבדה בפועל ומוגשת בסוף.'],
      ['scanDistance = 150','צלע מתחם הטיסה: 150 ס״מ.'],
      ['safeAltitude = 110','גובה מעבר בטוח מעל מכשולים בגובה 80 ס״מ.'],
      ['patrolSpeed = 80','גובה סיור בסיסי לצילום הכרטיסיות.'],
      ['scanAndPhoto(4, scanDistance)','פונקציה המקיפה ארבע צלעות ומצלמת בכל תחנה.'],
      ['tello.takePhoto();','פקודת צילום פיזית לאחר השהיית ייצוב.']
    ],
    setupSteps: [
      'מסמנים Safe Fly Zone/מלבן טיסה בכיתה עם סרט צבעוני.',
      'מציבים 3 מכשולים/כרטיסיות צילום I‑A‑I בגובה כ־80 ס״מ בתוך אזור הבדיקה.',
      'רחפן אחד לכל צוות של 3 תלמידים: מגיני פרופלור מותקנים וסוללות ממוספרות.',
      'משקפי מגן זמינים לכל צוות; תפקידי Driver/Navigator/Observer מוגדרים לפני חיבור לרחפן.',
      'טאבלטים טעונים: תחילה WiFi בית ספרי ל־Login/Load/Save, אחר כך מעבר ל־Tello‑XXXX להרצה.',
      'שתי קופסאות סוללות מסומנות: מלאות 100% וריקות/אחרי שימוש.'
    ],
    tabletTips: [
      'לפני חיבור ל־Tello שמרו עותק ענן בשם Meeting11_IAI_Flight_Testing.',
      'לא מריצים קוד לפני שהמדריך אישר Safe Zone, סוללה, מגינים ותפקידים.',
      'הוסיפו tello.sleep(2); לפני takePhoto כדי לייצב את המצלמה.',
      'הוסיפו tello.sleep(2); אחרי takePhoto כדי לאפשר עיבוד/שמירה ראשונית של הקובץ.',
      'אחרי נחיתה הורידו תמונות לגלריית הטאבלט ובדקו חדות וקריאות.',
      'אם תמונה מטושטשת או מטרה חתוכה — משנים רק sleep או scanDistance, שומרים גרסה ומחכים לסבב הבא.'
    ],
    lessonFlow: [
      { minutes:'0–8', title:'Launchpad Flight Testing', teacher:'מציג: היום עוברים מקוד Blueprint לטיסת חומרה פיזית מלאה עם צילום, אבל רק בתוך פרוטוקול בטיחות.', students:'פותחים את Blueprint שיעור 10 ומזהים מה ייבדק פיזית: מסלול, צילום, נחיתה.' },
      { minutes:'8–20', title:'Sim‑to‑Reality Gap ו־Motion Blur', teacher:'מסביר למה קוד שעבד בסימולטור עלול לסטות במציאות: VPS, רצפה, תאורה, רוח, סוללה ותנועה לפני צילום.', students:'מנסחים איפה בקוד נדרש sleep כדי לקבל תמונה חדה.' },
      { minutes:'20–32', title:'WiFi Handshake ו־Versioning', teacher:'מוביל חיבור ל־WiFi בית ספרי, טעינת Blueprint, Save As ל־Meeting11_IAI_Flight_Testing ואז מעבר ל־Tello‑XXXX.', students:'טוענים קוד, שומרים גרסה חדשה ומוודאים שלא דרסו את Blueprint.' },
      { minutes:'32–40', title:'Pre‑Flight צוותי', teacher:'בודק מגינים, סוללה ממוספרת, משקפי מגן, Safe Zone, Observer ו־Abort/Land.', students:'מחלקים תפקידים: Driver, Navigator מוריד תמונות, Observer בטיחות.' },
      { minutes:'40–52', title:'כתיבת scanAndPhoto', teacher:'מנחה שילוב takePhoto בתוך פונקציית scanAndPhoto עם sleep לפני/אחרי צילום.', students:'מעדכנים קוד ומריצים בדיקת קריאה לפני Run.' },
      { minutes:'52–65', title:'סבב טיסה ראשון וצילום', teacher:'מאשר צוותים לפי סדר ומנהל המראות קצרות בתוך מלבן הטיסה.', students:'מריצים סיור 150×150 ס״מ, מצלמים כרטיסיות ונוחתים.' },
      { minutes:'65–74', title:'פריקת תמונות ו־Visual Telemetry', teacher:'מדגים הורדת תמונות לטאבלט ובדיקת חדות/מיקום/קריאות I‑A‑I.', students:'מורידים תמונות, בוחרים 3 תמונות ומסמנים בעיה אם קיימת.' },
      { minutes:'74–84', title:'Calibration Sprint', teacher:'מנחה שינוי משתנה אחד בלבד: sleep לפני צילום, sleep אחרי צילום או scanDistance.', students:'מעדכנים גרסה, מחליפים סוללה אם צריך ומבצעים סבב נוסף רק באישור.' },
      { minutes:'84–90', title:'שמירה, סוללות וסגירה', teacher:'אוסף Share Links, מוודא סוללות בקופסת ריקות וסוגר רפלקציה על Sim‑to‑Reality.', students:'שומרים Meeting11_IAI_Flight_Testing_Calibrated_v2, מגישים תמונות ודוח כיול קצר.' }
    ],
    exercises: [
      { minutes:'0–8', title:'Blueprint → Flight Test', prompt:'פתחו את Blueprint שיעור 10 וסמנו אילו חלקים חייבים להיבדק פיזית היום.', check:'הצוות מזהה מסלול, צילום ונחיתה כדרישות בדיקה.' },
      { minutes:'8–20', title:'Motion Blur Check', prompt:'כתבו איפה בקוד צריך sleep כדי שתמונה לא תצא מטושטשת.', check:'מופיעה השהיה לפני takePhoto ואחריה.' },
      { minutes:'20–32', title:'WiFi Handshake', prompt:'טענו קוד על WiFi בית ספרי, שמרו Meeting11_IAI_Flight_Testing ואז עברו ל־Tello‑XXXX באישור.', check:'הגרסה החדשה נשמרה לפני מעבר לרחפן.' },
      { minutes:'32–40', title:'Pre‑Flight Roles', prompt:'חלקו Driver/Navigator/Observer ובדקו משקפי מגן, מגינים, סוללה ו־Abort.', check:'הצוות מקבל אישור מדריך לפני Run.' },
      { minutes:'40–52', title:'scanAndPhoto', prompt:'שלבו פונקציה שמבצעת flyForward, sleep, takePhoto, sleep ו־yawRight.', check:'פקודת צילום מופיעה אחרי ייצוב ולפני הפנייה הבאה.' },
      { minutes:'52–65', title:'Flight Round 1', prompt:'הריצו סיור ריבוע 150×150 ס״מ וצילום כרטיסיות בתוך Safe Fly Zone.', check:'הרחפן נוחת בבטחה ויש תמונות לבדיקה.' },
      { minutes:'65–74', title:'Visual Telemetry', prompt:'הורידו תמונות לטאבלט ובדקו אם רואים את I‑A‑I חד וברור.', check:'יש 3 תמונות או תיעוד בעיית איכות.' },
      { minutes:'74–84', title:'Calibration', prompt:'עדכנו רק sleep או scanDistance לפי הבעיה והריצו סבב נוסף אם אושר.', check:'הכיול מבוסס על ממצא ולא על ניחוש.' },
      { minutes:'84–90', title:'Final Submission', prompt:'שמרו Meeting11_IAI_Flight_Testing_Calibrated_v2 ושתפו Link + 3 תמונות + דוח כיול.', check:'התוצר כולל קוד, תמונות והסבר שינוי.' }
    ],
    deliverable: 'Share Link לגרסת Meeting11_IAI_Flight_Testing_Calibrated_v2 + 3 תמונות חדות של כרטיסיות I‑A‑I + דוח כיול קצר: מה סטה, מה שונה בקוד, ומה השתפר.',
    assessment: [
      'הצוות ביצע WiFi Handshake נכון ושמר גרסת ניסוי לפני מעבר ל־Tello.',
      'הטיסה בוצעה רק בתוך Safe Fly Zone עם משקפי מגן, Observer ונוהל סוללות.',
      'הקוד משתמש במשתנים scanDistance/safeAltitude/patrolSpeed ובפונקציית scanAndPhoto.',
      'פקודת takePhoto משולבת עם sleep לפני ואחרי לצמצום Motion Blur.',
      'התלמידים הורידו תמונות לטאבלט והשתמשו בהן כ־Visual Telemetry לכיול.',
      'הגרסה המכוילת נשמרה ושיתפה Link ברור.'
    ],
    debugging: [
      { problem:'התמונות שחורות, כהות או לא נשמרות בגלריה', fix:'משפרים תאורה בכיתה ומוודאים sleep(2) מיד אחרי takePhoto כדי לאפשר עיבוד ושמירה.' },
      { problem:'Motion Blur או אותיות I‑A‑I לא קריאות', fix:'מוסיפים/מגדילים sleep לפני takePhoto ומוודאים שהרחפן סיים תנועה לפני צילום.' },
      { problem:'הרחפן Drift או מאבד כיוון', fix:'בודקים סוללה מעל 30%, מחליפים לסוללה מלאה, מוסיפים פסים צבעוניים לרצפה כדי לעזור ל־VPS.' },
      { problem:'Connection Timed Out בזמן פריקת תמונות', fix:'מוודאים שהטאבלט מחובר לרשת Tello הנכונה, מכבים Cellular Data אם מפריע, ומתקרבים לרחפן לאחר נחיתה.' },
      { problem:'המסלול חותך מכשול או יוצא מהמלבן', fix:'מקטינים scanDistance או מעלים safeAltitude, שינוי אחד בכל פעם, ורק לאחר אישור מדריך.' }
    ],
    differentiation: {
      support: ['לתת לצוות מתקשה להריץ מקטע צילום אחד במקום סיור מלא, אך עדיין לבצע פריקת תמונה ודוח כיול.', 'לתת תבנית scanAndPhoto מוכנה עם מקומות להשלמת sleep ו־takePhoto.', 'לאפשר לצוות להיות צוות ניתוח תמונות אם אין מספיק זמן לסבב טיסה שני.'],
      extension: ['להוסיף משתנה photoPause ולבדוק 2 מול 3 שניות לפני צילום.', 'למדוד סטיית מרחק בס״מ בין נקודת נחיתה צפויה לאמיתית ולחשב תיקון ל־scanDistance.', 'להשוות איכות תמונות לפני/אחרי כיול ולהציג המלצה למהנדסי JPL.' ]
    },
    instructorGuide: {
      prerequisites:'שיעור 11 נשען על Blueprint שיעור 10 ועל מיומנויות פיזיות משיעורים 5, 8 ו־9: Safe Fly Zone, WiFi Handshake, סוללות, Observer, דיבוג וטלמטריה. בניגוד לגרסה הקודמת החלקית, v2 מגדיר את שיעור 11 כמפגש הטסה פיזי מלא עם צילום, פריקת תמונות וכיול קוד לפי נתונים חזותיים.',
      pedagogy:['להציג את השיעור כמבחן חומרה אמיתי: הקוד שעבד בסימולטור פוגש רצפה, תאורה, סוללה ורעידות.', 'Visual Telemetry הוא מושג מרכזי — תמונה לא חדה היא מידע הנדסי, לא רק כישלון.', 'לשמור על קצב סבבים קצר: טיסה, נחיתה, פריקה, ניתוח, שינוי אחד, ורק אז סבב נוסף.', 'לא לאפשר הרצת קוד ללא land, ללא Observer או ללא משקפי מגן.', 'במצגת להציג פרוטוקולים ותרשים, לא להציף בקוד מלא; הקוד המלא נשאר במערך המדריך.' ],
      exitTicket:'הסטייה שזיהינו במציאות הייתה ___; הכיול שביצענו היה ___; התמונה השתפרה כי ___.'
    },
    appWorkflowTitle: 'מעבדת טיסה פיזית — Launchpad Flight Testing',
    appWorkflowNote: 'שיעור 11 הוא מפגש פיזי מלא בכיתה. האתר מציג את פרוטוקול הבטיחות והמשימה; הטעינה, השמירה, ההרצה, הצילום ופריקת התמונות מתבצעים בטאבלט וב־DroneBlocks Code מול רחפן Tello.',
    appWorkflow: [
      { title:'Load + Save As בענן', detail:'על WiFi בית ספרי טענו את Blueprint שיעור 10 ושמרו גרסה חדשה בשם Meeting11_IAI_Flight_Testing.' },
      { title:'Pre‑Flight + WiFi Tello', detail:'קבלו אישור מדריך, הרכיבו משקפי מגן, בדקו מגינים/סוללה/Observer ועברו ל־Tello‑XXXX.' },
      { title:'סריקה וצילום', detail:'הריצו סיור 150×150 ס״מ עם scanAndPhoto: תנועה, sleep, takePhoto, sleep, yawRight.' },
      { title:'Download + Visual Telemetry', detail:'לאחר land הורידו תמונות לטאבלט, בדקו חדות וקריאות I‑A‑I ותעדו ממצאים.' },
      { title:'Calibration + Submit', detail:'שנו רק sleep או scanDistance, הריצו שוב באישור, ושמרו Meeting11_IAI_Flight_Testing_Calibrated_v2.' }
    ],
    codeSamples: [
      { title:'PROJECT INTEGRATION & FLIGHT TESTING — קוד מלא למדריך', code:'// PROJECT INTEGRATION & FLIGHT TESTING - MEETING 11\n// All distances are centimeters\n\nlet scanDistance = 150;\nlet safeAltitude = 110;\nlet patrolSpeed = 80;\n\nfunction scanAndPhoto(sides, distance) {\n  for (let i = 0; i < sides; i++) {\n    tello.flyForward(distance);\n    tello.sleep(2); // stabilize camera / reduce Motion Blur\n\n    tello.takePhoto();\n    tello.sleep(2); // allow photo processing/download readiness\n\n    tello.yawRight(90);\n    tello.sleep(1);\n  }\n}\n\ntello.takeoff();\ntello.sleep(3);\ntello.flyUp(patrolSpeed);\ntello.sleep(2);\n\nscanAndPhoto(4, scanDistance);\ntello.sleep(2);\n\ntello.land();' },
      { title:'דוח כיול קצר', code:'Round 1: Photo B blurred, landing drifted 25cm right\nChange: photo sleep 2 → 3 seconds before takePhoto\nRound 2: I-A-I readable, drift reduced\nFinal version: Meeting11_IAI_Flight_Testing_Calibrated_v2' }
    ],
    visualDiagram: { title:'Launchpad Flight Testing — I‑A‑I Visual Patrol', caption:'מלבן טיסה פיזי בכיתה: ריבוע 150×150 ס״מ, מכשולים/כרטיסיות בגובה 80 ס״מ, צילום I‑A‑I, פריקת תמונות וכיול sleep/scanDistance לפי Visual Telemetry.', chip:'Physical Lab', panelTitle:'📸 תרשים סיור וצילום פיזי', src:'assets/drone-intelligence-lab-grade9/lesson11/project-v1-integration-lab.svg', alt:'תרשים שיעור 11 למבחן טיסה פיזי עם צילום כרטיסיות I-A-I וכיול' },
    screenshotSlides: [
      { title:'תרשים התרגיל — Launchpad Flight Testing', src:'assets/drone-intelligence-lab-grade9/lesson11/project-v1-integration-lab.svg', caption:'המחשה לכיתה: Safe Fly Zone, ריבוע 150 ס״מ, מטרות צילום I‑A‑I, WiFi Handshake, Motion Blur ונוהל צוותים/סוללות.' }
    ],
    instructorSlides: [
      { title:'Launchpad Flight Testing', body:'היום ה־Blueprint פוגש חומרת אמת. המטרה אינה “להטיס בשביל הכיף” אלא להוכיח שקוד פרויקט הגמר עובד, מצלם ונוחת בבטחה.', bullets:['חומרת אמת', 'Safe Fly Zone', 'קוד מכויל'] },
      { title:'משימת I‑A‑I', body:'הרחפן מקיף מתחם 150×150 ס״מ, מצלם שלוש כרטיסיות ומחזיר Visual Telemetry שאפשר לנתח.', bullets:['3 תמונות חדות', 'I‑A‑I', '150×150 ס״מ'] },
      { title:'Sim‑to‑Reality Gap', body:'בסימולטור אין רצפה חלקה, תאורה משתנה, סוללה חלשה וזרמי אוויר מהקירות. במציאות צריך לכייל.', bullets:['VPS', 'Drift', 'סוללה/תאורה'] },
      { title:'Motion Blur נפתר בקוד', body:'תמונה חדה דורשת יציבות. מוסיפים sleep לפני takePhoto ואחריה כדי שהמצלמה והקובץ יתייצבו.', bullets:['sleep(2)', 'takePhoto()', 'תמונה חדה'] },
      { title:'פרוטוקול פיזי', body:'Driver מריץ, Navigator מוריד תמונות ומחשב סטיות, Observer שומר בטיחות. בלי תפקידים ומשקפי מגן — אין Run.', bullets:['Driver', 'Navigator', 'Observer'] },
      { title:'WiFi Handshake', body:'קודם WiFi בית ספרי לטעינה ושמירה בענן; אחר כך Tello‑XXXX להרצה וצילום. הסדר הזה מונע אובדן עבודה.', bullets:['School WiFi', 'Load/Save', 'Tello Run'] },
      { title:'כיול לפי תמונות', body:'אם התמונה מטושטשת או המטרה חתוכה, משנים משתנה אחד בלבד — sleep או scanDistance — ומריצים סבב נוסף באישור.', bullets:['Visual Telemetry', 'שינוי אחד', 'Calibrated v2'] }
    ]
  };

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
  }, index === 0 ? lessonOneFinal : index === 1 ? lessonTwoFinal : index === 2 ? lessonThreeFinal : index === 3 ? lessonFourFinal : index === 4 ? lessonFiveFinal : index === 5 ? lessonSixFinal : index === 6 ? lessonSevenFinal : index === 7 ? lessonEightFinal : index === 8 ? lessonNineFinal : index === 9 ? lessonTenFinal : index === 10 ? lessonElevenFinal : {}));

  window.getDroneIntelligenceLabGrade9Lesson = function (value) {
    const id = Number(value || 1);
    return window.DRONE_INTELLIGENCE_LAB_GRADE9_LESSONS.find(lesson => lesson.id === id) || window.DRONE_INTELLIGENCE_LAB_GRADE9_LESSONS[0];
  };
})();
