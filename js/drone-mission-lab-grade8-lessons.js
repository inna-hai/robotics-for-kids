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
    project: 'Project Code — קוד פרויקט',
    flyUp: 'tello.flyUp(inches); — עלייה בציר האנכי',
    flyDown: 'tello.flyDown(inches); — ירידה בציר האנכי',
    sleep: 'tello.sleep(seconds); — השהיית ייצוב',
    simulator: 'Minimal Grid Simulator — סימולטור בסיסי',
    function_reference: 'Function Reference — ספריית פקודות',
    save_cloud: 'Save / Share Link — שמירה ושיתוף',
    abort: 'Abort — עצירת חירום',
    flyForward: 'tello.flyForward(inches); — תנועה קדימה',
    flyBackward: 'tello.flyBackward(inches); — תנועה אחורה',
    flyRight: 'tello.flyRight(inches); — תנועת Roll ימינה',
    flyLeft: 'tello.flyLeft(inches); — תנועת Roll שמאלה',
    yawRight: 'tello.yawRight(degrees); — סבסוב ימינה',
    yawLeft: 'tello.yawLeft(degrees); — סבסוב שמאלה',
    reset: 'Reset Simulator — איפוס נקודת התחלה ומצפן',
    mars: 'Mars Simulator — סביבת מאדים',
    code_review: 'Code Review — סקירת קוד',
    cloud_save: 'Cloud Save — שמירה בענן',
    vps: 'VPS — חיישני מיקום חזותיים',
    for_loop: 'for (let i = 0; i < 4; i++) — לולאת for',
    let_variable: 'let distance = 60; — משתנה מרחק',
    infinite_loop: 'Infinite Loop — לולאה אינסופית',
    city: 'City Simulator — סימולטור עיר',
    wifi_handshake: 'WiFi Handshake — מעבר WiFi בית ספרי ↔ TELLO',
    preflight: 'Pre‑Flight Check — בדיקת תקינות לפני טיסה',
    physical_box: 'Physical Box Mission — ריבוע פיזי',
    drift_measure: 'Drift Measurement — מדידת סטייה',
    battery_protocol: 'Battery Protocol — נוהל שתי קופסאות',
    peer_roles: 'Driver / Navigator / Safety Observer — תפקידי צוות',
    grid_search: 'Grid Search — סריקת רשת',
    scurve: 'S‑Curve / Zigzag — נתיב זיגזג',
    scanDist: 'let scanDist = 80; — מרחק סריקה',
    stepDist: 'let stepDist = 40; — מרחק חיתוך בין שורות',
    blind_spots: 'Blind Spots — שטחים מתים',
    survivor_cards: 'Survivor Cards — כרטיסיות נפגעים',
    takePhoto: 'tello.takePhoto(); — צילום אוטונומי',
    motion_blur: 'Motion Blur — טשטוש תנועה',
    data_retrieval: 'Data Retrieval — פריקת תמונות',
    inspection: 'Infrastructure Inspection — בדיקת תשתיות',
    photo_log: 'Photo Evidence Log — יומן ראיות חזותיות',
    telemetry: 'Telemetry Bar — חיווי סוללה בזמן אמת',
    ecoflight: 'EcoFlight — טיסה חסכונית באנרגיה',
    baseline: 'Baseline Measurement — מדידת קו בסיס',
    optimization: 'Code Optimization — ייעול קוד',
    savings_formula: 'Savings % — חישוב אחוז חיסכון',
    blueprint: 'Paper Blueprint — אפיון נייר לפני קוד',
    city_simulator: 'City Simulator — סימולטור שכונה תלת־ממדי',
    software_architecture: 'Software Architecture — פירוק מערכת למשימות קטנות',
    prototype: 'Prototype — אב־טיפוס דיגיטלי',
    signoff: 'Instructor Sign‑off — אישור מדריך לפני פיתוח',
    sim_to_reality: 'Simulation‑to‑Reality Gap — פער סימולטור מול מציאות',
    visual_calibration: 'Visual Calibration — כיול חזותי',
    photo_offload: 'Photo Offloading — פריקת תמונות לטאבלט',
    calibration_run: 'Calibration Run — ריצת כיול',
    vps_drift: 'VPS Drift — סחיפת חיישני מיקום'
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


  Object.assign(window.DRONE_MISSION_LAB_GRADE8_LESSONS[0], {
    "title": "שיעור 1: Antarctica Atmospheric Scan — היכרות, בטיחות והמראה וירטואלית ב־JavaScript",
    "subtitle": "DroneBlocks Code, Minimal Grid, JavaScript Syntax, ציר אנכי, sleep, Save/Share וללא הטסה פיזית",
    "unit": "יחידה 1 — יסודות רחפן, בטיחות וסימולטור JavaScript",
    "concept": "רחפן ככלי חקר מדעי, סינטקס JavaScript ופקודות ציר אנכי בסימולטור Minimal Grid",
    "story": "כיתה ח׳ נכנסת לתפקיד מהנדסי טיסה ואיסוף מידע באקדמיה הלאומית לחקר הקטבים. סערה מגנטית וטמפרטורות קיצוניות באנטארקטיקה מונעות מהמדענים לצאת מתחנת המחקר, ולכן הצוות מתכנת מראש רחפן חקר אוטונומי שימריא, יסרוק שתי שכבות אטמוספריות בציר האנכי, ישהה בכל גובה לצורך מיקוד חיישנים, ויחזור לנחיתה מדויקת על מנחת מוגן.",
    "mission": "לפתוח DroneBlocks Code בטאבלט על WiFi בית ספרי, ליצור פרויקט בשם Meeting1_Atmospheric_Scan_JS, לכתוב JavaScript תקין למשימת Minimal Grid Simulator בלבד: takeoff, sleep, flyUp, sleep, flyDown ו־land. הרחפנים הפיזיים נשארים בארון; אפשר להציג Tello ללא סוללה להיכרות חומרה בלבד.",
    "commands": [
        "code_editor",
        "function_reference",
        "simulator",
        "takeoff",
        "sleep",
        "flyUp",
        "flyDown",
        "land",
        "abort",
        "save_cloud"
    ],
    "blocks": [
        "code_editor",
        "function_reference",
        "simulator",
        "takeoff",
        "sleep",
        "flyUp",
        "flyDown",
        "land",
        "abort",
        "save_cloud"
    ],
    "workspaceMode": "droneblocks-code",
    "physicalFlightAllowed": false,
    "essentialQuestion": "איך קוד JavaScript מדויק הופך רחפן מצעצוע שלט רחוק לכלי חקר אוטונומי ובטוח בסימולטור?",
    "successCriteria": [
        "אני מסביר/ה למה רחפן חקר הוא פלטפורמה לאיסוף מידע ולא צעצוע.",
        "אני עובד/ת ב־DroneBlocks Code בטאבלט על WiFi בית ספרי בלבד.",
        "אני כותב/ת פקודות JavaScript עם tello באות קטנה, סוגריים ונקודה־פסיק.",
        "אני משתמש/ת ב־Function Reference כדי לוודא שמות פקודות כמו flyUp ו־flyDown.",
        "אני מריץ/ה משימת Minimal Grid Simulator בציר האנכי בלבד.",
        "אני מוסיף/ה sleep לפני/אחרי שינוי גובה כדי לדמות ייצוב חיישנים.",
        "אני יודע/ת לזהות את כפתור Abort ולהסביר למה הוא קריטי גם לפני טיסה פיזית.",
        "אני שומר/ת Meeting1_Atmospheric_Scan_JS ומפיק/ה Share Link."
    ],
    "realWorldUses": [
        {
            "icon": "🧊",
            "title": "חקר קטבים",
            "text": "רחפנים יכולים למדוד תנאי אטמוספרה וקרח באזורים שאינם בטוחים לבני אדם."
        },
        {
            "icon": "🌡️",
            "title": "איסוף נתונים מדעי",
            "text": "שהייה בגבהים שונים מאפשרת לחיישנים ולמצלמה לקבל קריאה יציבה יותר."
        },
        {
            "icon": "🛰️",
            "title": "אוטונומיה במקום שלט",
            "text": "במשימות מחקר אין תמיד שליטה בזמן אמת; קוד מתוכנן מראש הוא תוכנית הטיסה."
        },
        {
            "icon": "🛡️",
            "title": "בטיחות לפני חומרה",
            "text": "הכיתה לומדת כללי בטיחות ותפקידים לפני שהרחפן הפיזי בכלל מופעל."
        }
    ],
    "vocabulary": [
        [
            "Drone as Research Platform",
            "רחפן ככלי חקר שאוסף צילום, מיפוי ונתוני חיישנים."
        ],
        [
            "JavaScript Syntax",
            "כללי כתיבת הקוד: אותיות, סוגריים, נקודה־פסיק וסדר פקודות."
        ],
        [
            "CamelCase",
            "כתיבה עם אות גדולה באמצע שם פעולה, למשל flyUp ו־flyDown."
        ],
        [
            "Compiler",
            "הרכיב שבודק האם הקוד כתוב במבנה שהמחשב מבין."
        ],
        [
            "Minimal Grid Simulator",
            "סביבת סימולטור פשוטה ונקייה לבדיקת פקודות בסיסיות."
        ],
        [
            "Vertical Axis / ציר אנכי",
            "תנועה למעלה ולמטה ביחס למנחת."
        ],
        [
            "tello.sleep(seconds)",
            "השהיית ייצוב שמאפשרת לרחפן/סימולטור להתייצב בין פקודות."
        ],
        [
            "VPS",
            "חיישן מיקום חזותי תחתון שיסייע בהמשך לקביעת גובה ומיקום."
        ],
        [
            "Function Reference",
            "ספריית פקודות באפליקציה שמונעת ניחוש ושגיאות כתיב."
        ],
        [
            "Share Link",
            "קישור שמאפשר למדריך לבדוק את קוד התלמידים."
        ]
    ],
    "safetyRules": [
        "מפגש 1 הוא סימולטור בלבד — אין חיבור ל־TELLO WiFi ואין הכנסת סוללה לרחפן.",
        "רחפן הדגמה, אם מוצג בכיתה, נשאר ללא סוללה וללא הפעלה.",
        "הרחפנים הפיזיים נשארים בארון; לומדים על בטיחות לפני מגע עם חומרה פעילה.",
        "כל קוד טיסה, גם בסימולטור, מתחיל ב־tello.takeoff(); ומסתיים ב־tello.land();.",
        "מכירים כבר עכשיו את חוקי הברזל: משקפי מגן, שיער אסוף, אזור סטרילי והכרזה ‘רחפנים באוויר’ במפגשים פיזיים.",
        "לא לוחצים Run לפני שבן/בת זוג בדק/ה סינטקס בסיסי: tello, נקודה, סוגריים ונקודה־פסיק.",
        "אם הסימולטור קופא — לא ממשיכים ללחוץ Run; סוגרים את האפליקציה ופותחים מחדש."
    ],
    "commonDirections": [
        [
            "tello.takeoff();",
            "המראה וירטואלית — תחילת כל תוכנית טיסה."
        ],
        [
            "tello.sleep(3);",
            "ייצוב ראשוני אחרי המראה."
        ],
        [
            "tello.flyUp(60);",
            "עלייה של 60 אינץ׳ לשכבה האטמוספרית הראשונה."
        ],
        [
            "tello.sleep(5);",
            "ריחוף/סריקה של 5 שניות לצורך מיקוד חיישנים."
        ],
        [
            "tello.flyDown(80);",
            "הנמכה מבוקרת לפני נחיתה."
        ],
        [
            "tello.land();",
            "נחיתה וסיום תוכנית הטיסה."
        ],
        [
            "Abort",
            "כפתור עצירת חירום באפליקציה — נכיר עכשיו ונשתמש רק כשצריך."
        ],
        [
            "Meeting1_Atmospheric_Scan_JS",
            "שם הפרויקט לשמירה בענן."
        ]
    ],
    "setupSteps": [
        "טאבלטים טעונים 100% עם DroneBlocks Code מותקן ומעודכן.",
        "WiFi בית ספרי פעיל; אין TELLO WiFi בשיעור זה.",
        "מקרן להצגת הסיפור, פקודות JavaScript ודוגמת Minimal Grid.",
        "רחפן Tello אחד להדגמה בלבד — ללא סוללה וללא הפעלה.",
        "כרטיסיות JavaScript Command Quick‑Sheet לצוותים.",
        "חשבון DroneBlocks זמין לכל תלמיד/צוות לשמירה ושיתוף."
    ],
    "tabletTips": [
        "להחזיק את הטאבלט לרוחב ולפתוח פרויקט חדש בשם המדויק.",
        "להתחיל מהקוד הקצר של אתגר 1 לפני אתגר 2.",
        "להקליד tello באות קטנה בלבד — לא Tello.",
        "לבדוק שכל פקודה מסתיימת ב־(); או בפרמטר בתוך הסוגריים ובנקודה־פסיק.",
        "להשתמש ב־Function Reference במקום לזכור בעל פה.",
        "לשמור לפני Share; אם Share נכשל, לבדוק WiFi בית ספרי."
    ],
    "lessonFlow": [
        {
            "minutes": "0–8",
            "title": "פתיחת מעבדת חקר כיתה ח׳",
            "teacher": "מציג את הקורס: רחפן אינו צעצוע, אלא מערכת רובוטית לאיסוף נתונים, צילום ומיפוי.",
            "students": "משתפים שימוש מחקרי אפשרי לרחפן."
        },
        {
            "minutes": "8–18",
            "title": "PBL — סריקה אטמוספרית באנטארקטיקה",
            "teacher": "מספר על תחנת מחקר בסערה מגנטית ועל צורך ברחפן אוטונומי שיסרוק שכבות גובה.",
            "students": "מזהים למה צריך קוד מראש ולא שלט בזמן אמת."
        },
        {
            "minutes": "18–25",
            "title": "בטיחות ותצוגת Tello ללא סוללה",
            "teacher": "מציג רחפן כבוי: פרופלורים, מצלמה, VPS. מדגיש חוקי בטיחות עתידיים ומפגש 1 ללא טיסה פיזית.",
            "students": "מצביעים על חלקים ומסבירים סיכון אחד."
        },
        {
            "minutes": "25–35",
            "title": "WiFi ו־DroneBlocks Code",
            "teacher": "מוביל כניסה לאפליקציה על WiFi בית ספרי, Login ויצירת Meeting1_Atmospheric_Scan_JS.",
            "students": "פותחים פרויקט ומוודאים שמירה בענן זמינה."
        },
        {
            "minutes": "35–45",
            "title": "סינטקס JavaScript — העוזר הרובוטי השמרן",
            "teacher": "מדגים tello.takeoff();, CamelCase, סוגריים ונקודה־פסיק. מדגיש שסינטקס אינו המלצה אלא דרישה מבנית.",
            "students": "מתקנים שגיאות דוגמה כמו Tello.Takeoff או tello.flyup(60)."
        },
        {
            "minutes": "45–57",
            "title": "אתגר 1 — המראת מחקר",
            "teacher": "מלווה כתיבת takeoff, sleep(3), flyUp(60), sleep(5), land והרצה ב־Minimal Grid.",
            "students": "מריצים ומתעדים מה קרה בסימולטור."
        },
        {
            "minutes": "57–72",
            "title": "אתגר 2 — סריקה דו־שלבית",
            "teacher": "מנחה הוספת שכבה שנייה: flyUp נוסף, sleep נוסף, flyDown(80), sleep(2), land.",
            "students": "משדרגים קוד ומריצים שוב."
        },
        {
            "minutes": "72–80",
            "title": "דיבוג ושיפור",
            "teacher": "עובר בין צוותים ובודק ReferenceError, סוגריים, CamelCase ו־Share readiness.",
            "students": "משנים פרמטר אחד/שגיאה אחת בכל פעם."
        },
        {
            "minutes": "80–87",
            "title": "Save + Share Link",
            "teacher": "מנחה Save ואז Share / Device/Desktop Share Link ואוסף קישורים.",
            "students": "מגישים קישור או מתעדים בעיית WiFi."
        },
        {
            "minutes": "87–90",
            "title": "רפלקציה וסגירת כיתה",
            "teacher": "שואל למה sleep חשוב ומה ההבדל בין שלט לקוד אוטונומי.",
            "students": "מחזירים טאבלטים לעמדת טעינה ומשלימים כרטיס יציאה."
        }
    ],
    "exercises": [
        {
            "minutes": "8–18",
            "title": "משימת חקר ולא משחק",
            "prompt": "כתבו נתון מדעי אחד שרחפן יכול לאסוף באנטארקטיקה.",
            "check": "התשובה קשורה לצילום/אוויר/קרח/טמפרטורה/מיפוי."
        },
        {
            "minutes": "18–25",
            "title": "חלקי Tello",
            "prompt": "זהו מצלמה, פרופלורים ו־VPS ברחפן ההדגמה הכבוי.",
            "check": "התלמיד מבין תפקיד וסיכון של לפחות חלק אחד."
        },
        {
            "minutes": "25–35",
            "title": "פתיחת פרויקט",
            "prompt": "פתחו DroneBlocks Code ושמרו Meeting1_Atmospheric_Scan_JS.",
            "check": "הפרויקט קיים על WiFi בית ספרי."
        },
        {
            "minutes": "35–45",
            "title": "מצא את שגיאת הסינטקס",
            "prompt": "תקנו: Tello.Takeoff; tello.flyup(60) tello.land.",
            "check": "מתוקן ל־tello.takeoff(); tello.flyUp(60); tello.land();."
        },
        {
            "minutes": "45–57",
            "title": "אתגר 1 — גובה 60",
            "prompt": "כתבו והריצו takeoff → sleep(3) → flyUp(60) → sleep(5) → land.",
            "check": "הרצף מתחיל ונגמר בטוח ומורץ בסימולטור בלבד."
        },
        {
            "minutes": "57–72",
            "title": "אתגר 2 — שתי שכבות",
            "prompt": "הוסיפו flyUp(60), sleep(5), flyDown(80), sleep(2), land.",
            "check": "יש שתי עצירות סריקה ונחיתה."
        },
        {
            "minutes": "72–80",
            "title": "Function Reference Check",
            "prompt": "בדקו לפחות שתי פקודות מול Function Reference ותקנו אם צריך.",
            "check": "מוזכרים flyUp/flyDown/sleep או תיקון CamelCase."
        },
        {
            "minutes": "80–87",
            "title": "Share Link",
            "prompt": "שמרו והפיקו קישור Device/Desktop Share Link.",
            "check": "יש קישור או תיעוד בעיית WiFi."
        },
        {
            "minutes": "87–90",
            "title": "כרטיס יציאה",
            "prompt": "השלימו: sleep חשוב במשימת חקר כי ___. JavaScript דורש דיוק כי ___.",
            "check": "התשובה מחברת ייצוב חיישנים וסינטקס."
        }
    ],
    "deliverable": "Meeting1_Atmospheric_Scan_JS: קוד JavaScript ב־Minimal Grid עם אתגר 1 או אתגר 2, שימוש ב־sleep לייצוב, שמירה בענן ו־Share Link למדריך.",
    "assessment": [
        "התלמיד מסביר את הרחפן ככלי חקר מדעי.",
        "הקוד כולל takeoff ו־land בסדר בטוח.",
        "פקודות flyUp/flyDown/sleep כתובות בסינטקס JavaScript תקין.",
        "העבודה נעשתה בסימולטור בלבד ללא TELLO WiFi.",
        "התלמיד השתמש ב־Function Reference או תיקן שגיאת CamelCase.",
        "יש שמירה בשם Meeting1_Atmospheric_Scan_JS ו־Share Link.",
        "התלמיד מסביר למה sleep מייצב חיישנים/מצלמה."
    ],
    "debugging": [
        {
            "problem": "ReferenceError / Tello is not defined",
            "fix": "לתקן ל־tello באות קטנה ולבדוק נקודה אחרי tello."
        },
        {
            "problem": "פקודה לא רצה בגלל CamelCase",
            "fix": "לבדוק Function Reference: flyUp ולא flyup; flyDown ולא flydown."
        },
        {
            "problem": "חסרים סוגריים או נקודה־פסיק",
            "fix": "כל פקודה צריכה () או פרמטר בתוך הסוגריים ולרוב מסתיימת ב־;."
        },
        {
            "problem": "הסימולטור קופא",
            "fix": "לסגור DroneBlocks Code לגמרי, לסגור אפליקציות רקע ולפתוח מחדש."
        },
        {
            "problem": "Share Link נכשל",
            "fix": "לוודא WiFi בית ספרי ו־Login; אין להשתמש ב־TELLO WiFi בשיעור זה."
        },
        {
            "problem": "התלמיד מנסה לחבר רחפן פיזי",
            "fix": "לעצור מיד: מפגש 1 סימולטור בלבד, רחפן הדגמה ללא סוללה."
        }
    ],
    "differentiation": {
        "support": [
            "לתת שלד קוד עם שורות חסרות רק לפקודות flyUp/sleep.",
            "להסתפק באתגר 1 בלבד ולדרוש הסבר טוב על sleep.",
            "לתת כרטיס Quick‑Sheet עם פקודות בסיסיות."
        ],
        "extension": [
            "להוסיף הערות // לכל שכבה אטמוספרית.",
            "להוסיף משתנה let scanHeight = 60; כהכנה לשיעורים הבאים.",
            "להשוות שתי גרסאות sleep(2) מול sleep(5) בסימולטור ולהסביר מה היה אמור להשתנות בעולם האמיתי."
        ]
    },
    "instructorGuide": {
        "prerequisites": "זהו שיעור הפתיחה של כיתה ח׳. אין להניח ניסיון קודם עם DroneBlocks Code טקסטואלי, גם אם חלק מהתלמידים מכירים בלוקים. המטרה היא לבנות תרבות בטיחות, דיוק סינטקס ותפיסה של רחפן ככלי חקר.",
        "pedagogy": [
            "להדגיש את מעבר הזהות: לא מטיסים צעצוע — מתכננים מערכת רובוטית לאיסוף נתונים.",
            "לשמור על גבול בטיחות חד: אין טיסה פיזית, אין סוללה ברחפן ההדגמה, אין TELLO WiFi.",
            "להשתמש באנלוגיית העוזר הרובוטי כדי להפוך סינטקס לנושא פדגוגי ולא לטעות מעצבנת.",
            "ה־sleep אינו ‘המתנה ריקה’; הוא מדמה זמן ייצוב של מצלמה וחיישנים, וזה בסיס לקורס צילום וחקר.",
            "לא להפוך את האתר לעורך קוד; העבודה המרכזית היא DroneBlocks Code בטאבלט והאתר משמש תדריך, שקופיות ומערך."
        ],
        "facilitationNotes": [
            "להכין מראש רחפן הדגמה ללא סוללה כדי למנוע פיתוי להפעיל.",
            "אם סרטון השראה מתעכב, לוותר עליו אחרי 3–5 דקות ולא לפגוע בזמן הסימולטור.",
            "בזמן ההקלדה לעבור בכיתה ולחפש בעיקר Tello/tello, flyup/flyUp וסוגריים חסרים.",
            "להציג את כפתור Abort כבר עכשיו כדי לבנות שפה בטיחותית לקראת מפגש 5.",
            "לאסוף Share Links גם אם הקוד חלקי — זה מתרגל נוהל הגשה."
        ],
        "mediaNote": "סרטון רחפני מחקר באנטארקטיקה/נאס״א הוא השראה בלבד; אם אין רשת יציבה, הסיפור והדיאגרמה מספיקים.",
        "exitTicket": "רחפן חקר צריך sleep כי ___. בשיעור זה לא מטיסים פיזית כי ___."
    },
    "appWorkflowTitle": "DroneBlocks Code — Antarctica Atmospheric Scan",
    "appWorkflowNote": "מפגש 1 מתבצע כולו בטאבלט וב־Minimal Grid Simulator. אין חיבור לרחפן פיזי, אין TELLO WiFi ואין סוללות ברחפנים.",
    "appWorkflow": [
        {
            "title": "School WiFi + Login",
            "detail": "חברו את הטאבלט ל־WiFi בית ספרי, פתחו DroneBlocks Code והתחברו לחשבון."
        },
        {
            "title": "New Project",
            "detail": "פתחו פרויקט חדש בשם Meeting1_Atmospheric_Scan_JS."
        },
        {
            "title": "Function Reference",
            "detail": "בדקו את שמות הפקודות: takeoff, flyUp, flyDown, sleep ו־land לפני הקלדה."
        },
        {
            "title": "Challenge 1",
            "detail": "כתבו takeoff, sleep(3), flyUp(60), sleep(5), land והריצו ב־Minimal Grid."
        },
        {
            "title": "Challenge 2",
            "detail": "שדרגו לשתי שכבות אטמוספריות: flyUp נוסף, sleep נוסף, flyDown(80), sleep(2), land."
        },
        {
            "title": "Save & Share",
            "detail": "שמרו בענן, הפיקו Device/Desktop Share Link ושלחו למדריך."
        }
    ],
    "visualDiagram": {
        "panelTitle": "🧊 Antarctica Vertical Scan",
        "chip": "Simulator Only",
        "title": "סריקת גובה אטמוספרית ב־Minimal Grid",
        "src": "assets/drone-mission-lab-grade8/lesson1/antarctica-atmospheric-vertical-scan.svg",
        "alt": "תרשים משימת סריקה אנכית באנטארקטיקה עם פקודות takeoff flyUp sleep flyDown land",
        "caption": "שיעור הפתיחה מתרגל JavaScript מדויק בציר האנכי: ממריאים, עולים לשתי שכבות סריקה, מייצבים חיישנים עם sleep, מנמיכים ונוחתים — הכול בסימולטור בלבד."
    },
    "videoResources": [
        {
            "title": "Antarctica scientific drones — search suggestion",
            "url": "https://www.youtube.com/results?search_query=Antarctica+scientific+drones+climate+research",
            "note": "סרטון השראה קצר על רחפנים למחקר אקלים/קטבים."
        },
        {
            "title": "NASA research drones environmental monitoring — search fallback",
            "url": "https://www.youtube.com/results?search_query=NASA+research+drones+environmental+monitoring",
            "note": "חלופה אם אין סרטון אנטארקטיקה זמין."
        }
    ],
    "screenshotSlides": [
        {
            "title": "Antarctica Atmospheric Scan",
            "src": "assets/drone-mission-lab-grade8/lesson1/antarctica-atmospheric-vertical-scan.svg",
            "caption": "שתי שכבות גובה, sleep לסריקה ונחיתה בטוחה."
        },
        {
            "title": "פותחים DroneBlocks Code",
            "src": "assets/tello-mission-lab/lesson1/open-app.png",
            "caption": "WiFi בית ספרי, Login ופרויקט Meeting1_Atmospheric_Scan_JS."
        },
        {
            "title": "Minimal Grid Simulator",
            "src": "assets/tello-mission-lab/lesson1/simulator-run.png",
            "caption": "הרצה וירטואלית בלבד — ללא TELLO WiFi."
        },
        {
            "title": "Save & Share",
            "src": "assets/tello-mission-lab/lesson1/save-share.png",
            "caption": "Device/Desktop Share Link למדריך."
        }
    ],
    "instructorSlides": [
        {
            "title": "Antarctica Atmospheric Scan",
            "body": "כיתה ח׳ פותחת מעבדת רחפני חקר: סריקת שכבות אטמוספריות בסימולטור.",
            "bullets": [
                "Research drone",
                "Antarctica",
                "Simulator only"
            ]
        },
        {
            "title": "רחפן הוא כלי חקר",
            "body": "מצלמה, VPS וחיישנים הופכים רחפן לפלטפורמה לאיסוף מידע — לא למשחק שלט.",
            "bullets": [
                "Camera",
                "VPS",
                "Data"
            ]
        },
        {
            "title": "חוקי בטיחות מהיום הראשון",
            "body": "משקפי מגן, שיער אסוף, אזור סטרילי והכרזה קולית ילוו אותנו לפני כל טיסה פיזית עתידית.",
            "bullets": [
                "No physical today",
                "Safe zone",
                "Announcement"
            ]
        },
        {
            "title": "JavaScript Syntax",
            "body": "המחשב לא מבין כוונות: tello באות קטנה, CamelCase, סוגריים ונקודה־פסיק.",
            "bullets": [
                "tello",
                "flyUp",
                ";"
            ]
        },
        {
            "title": "פקודות ציר אנכי",
            "body": "takeoff, flyUp, flyDown, sleep ו־land הם תוכנית הטיסה הראשונה שלנו.",
            "bullets": [
                "takeoff",
                "sleep",
                "land"
            ]
        },
        {
            "title": "Minimal Grid Challenge",
            "body": "מריצים שתי משימות: גובה 60 ואז סריקה דו־שלבית עד 120 אינץ׳.",
            "bullets": [
                "60in",
                "120in",
                "sensor focus"
            ]
        },
        {
            "title": "Save & Share",
            "body": "הקוד נשמר בענן ונשלח למדריך כ־Share Link — זה חלק מתהליך העבודה המקצועי.",
            "bullets": [
                "Save",
                "Share",
                "Reflect"
            ]
        }
    ]
}
);

  Object.assign(window.DRONE_MISSION_LAB_GRADE8_LESSONS[1], {
    "title": "שיעור 2: SolarScan Box Mission — ניווט דו־מימדי, Pitch/Roll מול Yaw ב־JavaScript",
    "subtitle": "פקודות תנועה אופקיות, Strafing Box מול Yaw Box, השוואת אלגוריתמים ו־Minimal Grid בלבד",
    "unit": "יחידה 1 — יסודות רחפן, בטיחות וסימולטור JavaScript",
    "concept": "ניווט דו־מימדי, Pitch/Roll/Yaw, מסלול ריבוע 60×60 אינץ׳ והשוואת שתי אסטרטגיות צילום",
    "story": "התלמידים הם מהנדסי מערכות אוטונומיות בחברת SolarScan, שמפתחת רחפנים למיפוי תרמי של חוות סולאריות במדבר הערבה. פאנלים מלוכלכים או פגומים יוצרים Hot Spots ופוגעים בייצור החשמל. הצוות צריך לתכנת מסלול ריבוע מדויק מעל ארבעה פאנלים ולבחור איזו אסטרטגיה טובה יותר לצילום: Strafing קצר ללא פניות, או Yaw Box שבו האף והמצלמה פונים לכיוון הטיסה בכל צלע.",
    "mission": "לפתוח DroneBlocks Code בטאבלט על WiFi בית ספרי, ליצור פרויקט Meeting2_SolarScan_JS, ולבנות שתי גרסאות בסימולטור Minimal Grid בלבד: Meeting2_StrafingBox עם flyForward/flyRight/flyBackward/flyLeft ללא yaw, ו־Meeting2_YawBox עם flyForward ו־yawRight(90) בכל פינה. בסוף בוחרים איזו גרסה מתאימה יותר למשימת צילום פאנלים סולאריים ומגישים Share Link.",
    "commands": [
        "code_editor",
        "function_reference",
        "simulator",
        "takeoff",
        "sleep",
        "flyForward",
        "flyRight",
        "flyBackward",
        "flyLeft",
        "yawRight",
        "yawLeft",
        "land",
        "reset",
        "save_cloud"
    ],
    "blocks": [
        "code_editor",
        "function_reference",
        "simulator",
        "takeoff",
        "sleep",
        "flyForward",
        "flyRight",
        "flyBackward",
        "flyLeft",
        "yawRight",
        "yawLeft",
        "land",
        "reset",
        "save_cloud"
    ],
    "workspaceMode": "droneblocks-code",
    "physicalFlightAllowed": false,
    "essentialQuestion": "איך בחירת אסטרטגיית ניווט — Strafing או Yaw — משפיעה על בטיחות, יעילות ואיכות צילום במשימת רחפן חקר?",
    "successCriteria": [
        "אני מסביר/ה את ההבדל בין Pitch, Roll ו־Yaw באמצעות גוף/רחפן הדגמה כבוי.",
        "אני כותב/ת פקודות flyForward, flyBackward, flyRight, flyLeft, yawRight ו־yawLeft ב־CamelCase תקין.",
        "אני מריץ/ה שתי גרסאות Box Mission בסימולטור Minimal Grid בלבד.",
        "אני שומר/ת גרסה אחת בשם Meeting2_StrafingBox וגרסה אחת בשם Meeting2_YawBox.",
        "אני יודע/ת להשוות בין קוד קצר יותר לבין קוד שמכוון את המצלמה לכיוון הטיסה.",
        "אני משתמש/ת ב־Reset בסימולטור כשכיוון ההתחלה או המצפן לא עקביים.",
        "אני מגיש/ה Share Link של הגרסה המועדפת עם נימוק קצר."
    ],
    "realWorldUses": [
        {
            "icon": "☀️",
            "title": "חוות סולאריות",
            "text": "רחפנים יכולים לסרוק פאנלים רבים ולזהות Hot Spots המעידים על לכלוך או תקלה."
        },
        {
            "icon": "📷",
            "title": "צילום מכוון מטרה",
            "text": "כאשר המצלמה קדמית, כיוון האף משפיע על מה שרואים בתמונה."
        },
        {
            "icon": "🧭",
            "title": "ניווט ומצפן",
            "text": "Yaw משנה את כיוון הגוף ולכן חשוב לאפס ולהבין את כיוון ההתחלה."
        },
        {
            "icon": "⚖️",
            "title": "השוואת אלגוריתמים",
            "text": "פתרון קצר אינו תמיד הפתרון הטוב ביותר למשימה אמיתית עם צילום ובטיחות."
        }
    ],
    "vocabulary": [
        [
            "Pitch",
            "תנועה קדימה/אחורה לאורך כיוון האף של הרחפן."
        ],
        [
            "Roll / Strafing",
            "תנועה הצידה ימינה/שמאלה בלי לשנות את כיוון האף."
        ],
        [
            "Yaw",
            "סבסוב סביב הציר האנכי — האף והמצלמה פונים לכיוון חדש."
        ],
        [
            "Box Mission",
            "מסלול ריבועי מדויק, כאן בגודל 60×60 אינץ׳."
        ],
        [
            "Hot Spot",
            "נקודת חום בפאנל סולארי שעלולה להעיד על תקלה או לכלוך."
        ],
        [
            "Thermal Mapping",
            "מיפוי תרמי של אזור כדי לזהות הבדלי טמפרטורה."
        ],
        [
            "Algorithm Comparison",
            "השוואה בין שתי דרכי פתרון לפי יעילות, בטיחות ואיכות מידע."
        ],
        [
            "Reset Simulator",
            "איפוס הסימולטור לנקודת התחלה וכיוון מצפן ידועים."
        ],
        [
            "CamelCase",
            "כתיבה כמו flyForward ו־yawRight: האות הראשונה במילה השנייה גדולה."
        ]
    ],
    "safetyRules": [
        "מפגש 2 הוא סימולטור בלבד — אין חיבור ל־TELLO WiFi ואין הטסה פיזית.",
        "רחפן הדגמה, אם משתמשים בו להמחשת Pitch/Roll/Yaw, נשאר ללא סוללה וללא הפעלה.",
        "לא מריצים קוד לפני בדיקת takeoff בתחילה ו־land בסוף.",
        "לא משתמשים ב־yaw פיזי בכיתה; כל הסיבובים היום הם בגוף, ביד או בסימולטור בלבד.",
        "לפני כל הרצה בסימולטור בודקים שהמסלול 60×60 אינץ׳ ולא 600 בטעות.",
        "אם הסימולטור נראה בכיוון לא נכון — Reset לפני שינוי קוד.",
        "כללי הטיסה הפיזית העתידיים נשארים בתוקף: אזור סטרילי, משקפי מגן, שיער אסוף והכרזה קולית."
    ],
    "commonDirections": [
        [
            "tello.flyForward(60);",
            "תנועה קדימה בצלע הריבוע."
        ],
        [
            "tello.flyRight(60);",
            "תנועת Roll ימינה בלי סיבוב האף."
        ],
        [
            "tello.flyBackward(60);",
            "חזרה אחורה בצלע נגדית."
        ],
        [
            "tello.flyLeft(60);",
            "סגירת הריבוע שמאלה."
        ],
        [
            "tello.yawRight(90);",
            "סיבוב האף והמצלמה 90° ימינה."
        ],
        [
            "tello.yawLeft(90);",
            "חלופה לסיבוב שמאלה סביב הציר."
        ],
        [
            "tello.sleep(2);",
            "ייצוב בין צלעות או לאחר פנייה."
        ],
        [
            "Reset",
            "איפוס סימולטור לפני בדיקת גרסה חדשה."
        ]
    ],
    "setupSteps": [
        "טאבלטים טעונים 100% עם DroneBlocks Code.",
        "WiFi בית ספרי פעיל וחשבונות תלמידים זמינים.",
        "מקרן להצגת שתי אסטרטגיות הריבוע וסינטקס הפקודות.",
        "רחפן Tello אחד להמחשה בלבד — ללא סוללה.",
        "מצפן כיתתי/דפי כיוונים להמחשת 90°, 180°, 270°, 360°.",
        "שם פרויקט ראשי: Meeting2_SolarScan_JS."
    ],
    "tabletTips": [
        "שומרים שתי גרסאות נפרדות: Meeting2_StrafingBox ו־Meeting2_YawBox.",
        "ב־Strafing Box אסור להשתמש בפקודות yaw.",
        "ב־Yaw Box משתמשים רק ב־flyForward וב־yawRight(90) עבור המסלול עצמו.",
        "כל פנייה דורשת sleep קצר אחריה כדי לדמות ייצוב מצלמה/מצפן.",
        "אם המסלול לא נסגר, בודקים קודם 60 מול 90 ולא משנים הכול יחד.",
        "ה־Share Link הסופי צריך לכלול נימוק איזו גרסה עדיפה לצילום."
    ],
    "lessonFlow": [
        {
            "minutes": "0–8",
            "title": "בדיקת תנאי קדם משיעור 1",
            "teacher": "מזכיר: בשיעור 1 שלטנו בציר האנכי, sleep וסינטקס בסיסי. היום מוסיפים מישור אופקי ופניות.",
            "students": "פותחים את Share/קוד שיעור 1 או משחזרים פקודות takeoff/sleep/land."
        },
        {
            "minutes": "8–18",
            "title": "PBL — SolarScan בערבה",
            "teacher": "מציג חוות סולארית, Hot Spots ומשימת צילום ארבעה פאנלים במסלול ריבוע 60×60 אינץ׳.",
            "students": "מזהים למה צילום דורש לדעת לאן האף/המצלמה פונים."
        },
        {
            "minutes": "18–28",
            "title": "Pitch, Roll, Yaw בגוף וברחפן כבוי",
            "teacher": "מזמין תלמידים להדגים צעידה קדימה/אחורה, צעדי צד וסיבוב 90°. מציג Tello ללא סוללה.",
            "students": "משווים בין Roll ללא שינוי כיוון לבין Yaw שמשנה את כיוון האף."
        },
        {
            "minutes": "28–35",
            "title": "פתיחת סביבת העבודה",
            "teacher": "מוביל WiFi בית ספרי, DroneBlocks Code, Login ויצירת Meeting2_SolarScan_JS.",
            "students": "פותחים פרויקט ומוודאים שמירה בענן."
        },
        {
            "minutes": "35–45",
            "title": "פקודות ניווט דו־מימדי",
            "teacher": "מדגים flyForward, flyBackward, flyRight, flyLeft, yawRight, yawLeft ומדגיש CamelCase ונקודה־פסיק.",
            "students": "מתקנים דוגמאות שגויות כמו flyforward/yawright."
        },
        {
            "minutes": "45–58",
            "title": "אתגר 1 — Strafing Box",
            "teacher": "מנחה קוד ריבוע ללא yaw: קדימה, ימינה, אחורה, שמאלה, עם sleep בין צלעות.",
            "students": "כותבים Meeting2_StrafingBox ומריצים בסימולטור."
        },
        {
            "minutes": "58–72",
            "title": "אתגר 2 — Yaw Box",
            "teacher": "מנחה גרסה שנייה: flyForward ואז yawRight(90) בכל פינה, ארבע פעמים.",
            "students": "כותבים Meeting2_YawBox ומריצים בסימולטור לאחר Reset."
        },
        {
            "minutes": "72–80",
            "title": "השוואת אלגוריתמים",
            "teacher": "שואל איזו גרסה קצרה יותר ואיזו מתאימה יותר לצילום פאנלים ומדוע.",
            "students": "מסמנים יתרון וחיסרון לכל שיטה."
        },
        {
            "minutes": "80–87",
            "title": "Save + Share",
            "teacher": "מנחה שמירה של שתי הגרסאות והפקת Share Link לגרסה המועדפת.",
            "students": "שולחים קישור ונימוק קצר."
        },
        {
            "minutes": "87–90",
            "title": "סגירת שיעור",
            "teacher": "רענון בטיחות: גם בשיעור הבא עדיין סימולטור בלבד אלא אם נאמר אחרת.",
            "students": "מחזירים טאבלטים לעגלה ומשלימים כרטיס יציאה."
        }
    ],
    "exercises": [
        {
            "minutes": "0–8",
            "title": "גשר משיעור 1",
            "prompt": "כתבו פקודה אחת מהציר האנכי והסבירו למה sleep הופיע ביניהן.",
            "check": "מופיעות takeoff/flyUp/flyDown/land או sleep עם הסבר ייצוב."
        },
        {
            "minutes": "8–18",
            "title": "SolarScan Mission Brief",
            "prompt": "מה צריך לצלם בארבעה פאנלים סולאריים, ומה עלול להיות Hot Spot?",
            "check": "התשובה קשורה לתקלה/לכלוך/חום בפאנל."
        },
        {
            "minutes": "18–28",
            "title": "תנועת גוף — Pitch/Roll/Yaw",
            "prompt": "הדגימו Roll בלי לשנות כיוון, ואז Yaw של 90°.",
            "check": "התלמידים מבינים ש־Yaw משנה את כיוון האף/מצלמה."
        },
        {
            "minutes": "35–45",
            "title": "מצא את שגיאת CamelCase",
            "prompt": "תקנו: tello.flyforward(60); tello.yawright(90); tello.flyleft(60);",
            "check": "מתוקן ל־flyForward, yawRight, flyLeft."
        },
        {
            "minutes": "45–58",
            "title": "Strafing Box",
            "prompt": "כתבו ריבוע 60×60 ללא yaw: forward, right, backward, left.",
            "check": "אין yaw בקוד והרצף מסתיים ב־land."
        },
        {
            "minutes": "58–72",
            "title": "Yaw Box",
            "prompt": "כתבו ריבוע עם flyForward ו־yawRight(90) בכל פינה.",
            "check": "יש ארבע פקודות yawRight(90) או לוגיקה שקולה."
        },
        {
            "minutes": "72–80",
            "title": "טבלת השוואה",
            "prompt": "מלאו: איזו גרסה קצרה יותר? איזו מתאימה יותר לצילום קדמי? למה?",
            "check": "Strafing קצרה; Yaw מתאימה יותר לכיוון מצלמה/בטיחות."
        },
        {
            "minutes": "80–87",
            "title": "Share Link + נימוק",
            "prompt": "הגישו את הגרסה המועדפת עם משפט נימוק אחד.",
            "check": "יש קישור או תיעוד בעיית רשת ונימוק בחירה."
        },
        {
            "minutes": "87–90",
            "title": "כרטיס יציאה",
            "prompt": "השלימו: Yaw משנה את ___. Roll משנה את ___ בלי לשנות את ___.",
            "check": "Yaw משנה כיוון אף/מצלמה; Roll משנה מיקום הצידה בלי לשנות כיוון."
        }
    ],
    "deliverable": "שתי גרסאות JavaScript בענן: Meeting2_StrafingBox ו־Meeting2_YawBox, Share Link לגרסה המועדפת ונימוק קצר על התאמתה לצילום פאנלים סולאריים.",
    "assessment": [
        "התלמיד מבחין בין Pitch, Roll ו־Yaw.",
        "קוד Strafing Box אינו כולל פקודות yaw.",
        "קוד Yaw Box כולל flyForward ו־yawRight(90) בפינות.",
        "כל פקודות התנועה כתובות ב־CamelCase תקין ונקודה־פסיק.",
        "העבודה נעשתה ב־Minimal Grid Simulator בלבד.",
        "התלמיד יודע להסביר ש־Yaw טוב יותר לכיוון מצלמה קדמית אף שהוא ארוך יותר.",
        "יש Share Link או תיעוד תקלה טכנית ברור."
    ],
    "debugging": [
        {
            "problem": "הסימולטור לא פונה ב־90° או המסלול לא נסגר",
            "fix": "ללחוץ Reset, לבדוק שהזווית היא 90 ולא 9/900, ואז להריץ שוב."
        },
        {
            "problem": "שגיאת סינטקס בשורת yaw",
            "fix": "לתקן CamelCase: yawRight/yawLeft עם אות גדולה במילה השנייה."
        },
        {
            "problem": "הריבוע גדול/קטן מדי",
            "fix": "לבדוק שכל צלע היא 60 אינץ׳ ושלא הוקלד 600."
        },
        {
            "problem": "הגרסאות התבלבלו",
            "fix": "לשמור שמות נפרדים: Meeting2_StrafingBox ו־Meeting2_YawBox."
        },
        {
            "problem": "Strafing Box כולל yaw בטעות",
            "fix": "להחזיר את הגרסה הראשונה ל־flyForward/flyRight/flyBackward/flyLeft בלבד."
        },
        {
            "problem": "Share Link נכשל",
            "fix": "לוודא WiFi בית ספרי ו־Login; לא לעבור ל־TELLO WiFi."
        }
    ],
    "differentiation": {
        "support": [
            "לתת שלד קוד של Strafing Box עם חסרים בפרמטרים בלבד.",
            "להשתמש בדף מצפן עם פינות 1–4 כדי לעקוב אחר Yaw Box.",
            "לאפשר עבודה בזוג: Driver מקליד, Navigator בודק כיוון ומצלמה."
        ],
        "extension": [
            "להוסיף הערות // לפני כל צלע שמסבירות מה המצלמה רואה.",
            "לחשב מספר שורות/פקודות בכל גרסה ולהציג יחס יעילות.",
            "להוסיף משתנה let side = 60; כהכנה ללולאות ומשתנים בשיעור 4."
        ]
    },
    "instructorGuide": {
        "prerequisites": "התלמידים כבר פגשו בשיעור 1 את DroneBlocks Code, Minimal Grid, takeoff/land/sleep ודיוק סינטקס בסיסי. שיעור 2 מרחיב מהמראה אנכית למסלול אופקי ומוסיף הבחנה לוגית בין תנועה הצידה לבין סיבוב גוף הרחפן.",
        "pedagogy": [
            "לא להסתפק בהוראת פקודות; המטרה היא הבנה מרחבית של מה המצלמה רואה בכל אסטרטגיה.",
            "השוואת אלגוריתמים היא לב השיעור: קוד קצר יותר אינו בהכרח קוד מתאים יותר למשימת צילום אמיתית.",
            "להמשיך לבנות תרבות בטיחות: עדיין אין טיסה פיזית ואין TELLO WiFi.",
            "להשתמש בגוף התלמידים ובהדגמת רחפן כבוי כדי להפוך Pitch/Roll/Yaw למוחשי.",
            "לשמור על שינוי פרמטר אחד בכל דיבוג: זווית או מרחק, לא שניהם יחד."
        ],
        "facilitationNotes": [
            "בקשו מתלמיד אחד להיות ‘מצלמה קדמית’ ולהצביע לאן היא מסתכלת בזמן Roll מול Yaw.",
            "אם הכיתה מתקשה, התחילו משרטוט ריבוע על הלוח ורק אז עברו לקוד.",
            "בדיון המסכם, קבלו את התשובה ש־Strafing יעילה יותר — ואז דייקו שה־Yaw עדיף לצילום קדמי ובטיחות נתיב.",
            "אם יש בלבול בין move/fly פקודות, חזרו ל־Function Reference של DroneBlocks Code וקבעו שהקורס משתמש ב־flyForward/flyRight וכו׳ לפי המערך."
        ],
        "mediaNote": "סרטון השראה על רחפנים לסריקת פאנלים סולאריים/תרמית הוא אופציונלי. לא לבזבז יותר מ־5 דקות אם הרשת איטית.",
        "exitTicket": "במשימת צילום פאנלים סולאריים הייתי בוחר/ת ___ כי ___."
    },
    "appWorkflowTitle": "DroneBlocks Code — SolarScan Box Mission",
    "appWorkflowNote": "מפגש 2 מתבצע כולו בטאבלט וב־Minimal Grid Simulator. אין חיבור לרחפן פיזי, אין TELLO WiFi ואין סוללות ברחפנים.",
    "appWorkflow": [
        {
            "title": "School WiFi + Project",
            "detail": "פתחו DroneBlocks Code על WiFi בית ספרי וצרו Meeting2_SolarScan_JS."
        },
        {
            "title": "Learn the Directions",
            "detail": "בדקו Function Reference: flyForward, flyBackward, flyRight, flyLeft, yawRight, yawLeft."
        },
        {
            "title": "Strafing Box",
            "detail": "שמרו Meeting2_StrafingBox: takeoff, sleep, flyForward(60), flyRight(60), flyBackward(60), flyLeft(60), land."
        },
        {
            "title": "Reset Simulator",
            "detail": "אפסו את הסימולטור לפני הגרסה השנייה כדי להתחיל מאותה נקודה וכיוון."
        },
        {
            "title": "Yaw Box",
            "detail": "שמרו Meeting2_YawBox: flyForward(60) ואז yawRight(90) בכל פינה, ארבע פעמים."
        },
        {
            "title": "Compare + Share",
            "detail": "בחרו את הגרסה המתאימה יותר לצילום, שמרו, הפיקו Share Link והוסיפו נימוק."
        }
    ],
    "visualDiagram": {
        "panelTitle": "☀️ SolarScan Box Mission",
        "chip": "Simulator Only",
        "title": "Strafing Box מול Yaw Box",
        "src": "assets/drone-mission-lab-grade8/lesson2/solarscan-box-mission-strafing-vs-yaw.svg",
        "alt": "תרשים השוואה בין מסלול ריבוע עם Strafing לבין מסלול ריבוע עם פניות Yaw לסריקת פאנלים סולאריים",
        "caption": "שתי דרכי פתרון לאותו ריבוע 60×60: Strafing קצר ושומר כיוון מצלמה קבוע, מול Yaw Box שמסובב את האף והמצלמה לכיוון הטיסה בכל צלע."
    },
    "videoResources": [
        {
            "title": "Drone solar panel inspection thermal imaging — search suggestion",
            "url": "https://www.youtube.com/results?search_query=drone+solar+panel+inspection+thermal+imaging",
            "note": "סרטון השראה קצר על רחפנים ותרמוגרפיה בחוות סולאריות."
        },
        {
            "title": "Pix4D solar inspection drone — search fallback",
            "url": "https://www.youtube.com/results?search_query=Pix4D+solar+inspection+drone",
            "note": "חלופה להצגת מיפוי סולארי מקצועי."
        }
    ],
    "screenshotSlides": [
        {
            "title": "SolarScan Box Mission",
            "src": "assets/drone-mission-lab-grade8/lesson2/solarscan-box-mission-strafing-vs-yaw.svg",
            "caption": "השוואה בין Strafing Box ל־Yaw Box מעל ארבעה פאנלים."
        },
        {
            "title": "פותחים DroneBlocks Code",
            "src": "assets/tello-mission-lab/lesson1/open-app.png",
            "caption": "WiFi בית ספרי ופרויקט Meeting2_SolarScan_JS."
        },
        {
            "title": "Minimal Grid Simulator",
            "src": "assets/tello-mission-lab/lesson1/simulator-run.png",
            "caption": "הרצה וירטואלית בלבד — Reset בין שתי הגרסאות."
        },
        {
            "title": "Save & Share",
            "src": "assets/tello-mission-lab/lesson1/save-share.png",
            "caption": "שומרים Meeting2_StrafingBox ו־Meeting2_YawBox ומשתפים גרסה מועדפת."
        }
    ],
    "instructorSlides": [
        {
            "title": "SolarScan בערבה",
            "body": "רחפנים סורקים פאנלים סולאריים כדי לזהות Hot Spots ופגיעה ביעילות ייצור החשמל.",
            "bullets": [
                "Solar panels",
                "Hot spots",
                "Thermal mapping"
            ]
        },
        {
            "title": "מה המצלמה רואה?",
            "body": "אם המצלמה קדמית, כיוון האף קובע לאן הרחפן ‘מסתכל’. זו הסיבה ש־Yaw חשוב לצילום.",
            "bullets": [
                "Camera nose",
                "Roll",
                "Yaw"
            ]
        },
        {
            "title": "Pitch / Roll / Yaw",
            "body": "Pitch קדימה/אחורה, Roll הצידה בלי שינוי כיוון, Yaw סיבוב גוף הרחפן סביב הציר.",
            "bullets": [
                "Pitch",
                "Roll",
                "Yaw"
            ]
        },
        {
            "title": "Strafing Box",
            "body": "ריבוע קצר ללא פניות: flyForward, flyRight, flyBackward, flyLeft.",
            "bullets": [
                "Shorter code",
                "No yaw",
                "Camera fixed"
            ]
        },
        {
            "title": "Yaw Box",
            "body": "אותו ריבוע עם flyForward ופנייה yawRight(90) בכל פינה.",
            "bullets": [
                "More commands",
                "Nose turns",
                "Better for front camera"
            ]
        },
        {
            "title": "Syntax Check",
            "body": "flyForward ו־yawRight דורשים CamelCase. flyforward/yawright יעצרו את ההרצה.",
            "bullets": [
                "CamelCase",
                "semicolon",
                "Function Reference"
            ]
        },
        {
            "title": "בחירת מהנדסים",
            "body": "איזו גרסה עדיפה למשימת צילום פאנלים — ומה המחיר שלה?",
            "bullets": [
                "Efficiency",
                "Safety",
                "Image quality"
            ]
        }
    ]
}
);


  Object.assign(window.DRONE_MISSION_LAB_GRADE8_LESSONS[2], {
    "title": "שיעור 3: NASA JPL Mars Sensor Scan — עבודה בענן ומשימות חקר במאדים ב־JavaScript",
    "subtitle": "Mars Simulator, Cloud Save, Code Review, X/Y/Z navigation, sleep stabilization ו־yawRight(180)",
    "unit": "יחידה 1 — יסודות רחפן, בטיחות וסימולטור JavaScript",
    "concept": "חקר תלת־מימדי בסביבת Mars Simulator: שילוב גובה, תנועה אופקית, Yaw, השהיית ייצוב ושיתוף קוד בענן",
    "story": "התלמידים הם צוותי פיתוח רובוטיקה ובקרה בסוכנות החלל NASA JPL. הם מתכנתים את קוד הטיסה של Ingenuity 2.0: המראה מבסיס השיגור, מעבר מעל סלעים וגבעות, סריקה וכיול של תחנות סייסמוגרף בגבהים שונים, השהיה של 5 שניות מעל כל תחנה לפריקת נתונים אלחוטית, סיבוב מצלמה חזרה לבסיס ונחיתה במנחת המדע המרכזי.",
    "mission": "לעבוד ב־DroneBlocks Code על WiFi בית ספרי, לפתוח/לשמור פרויקט בשם Mars_Sensor_Scan_v1, לבחור Mars Simulator, לבנות משימת חקר תלת־מימדית עם flyUp/flyDown/flyForward/sleep/yawRight(180), לבצע Save + Device/Desktop Share Link ל־Code Review, ולסיים בשם Mars_Mission_Success. אין הטסה פיזית ואין TELLO WiFi.",
    "commands": [
        "code_editor",
        "cloud_save",
        "share",
        "code_review",
        "mars",
        "takeoff",
        "sleep",
        "flyUp",
        "flyForward",
        "flyDown",
        "yawRight",
        "land",
        "vps"
    ],
    "blocks": [
        "code_editor",
        "cloud_save",
        "share",
        "code_review",
        "mars",
        "takeoff",
        "sleep",
        "flyUp",
        "flyForward",
        "flyDown",
        "yawRight",
        "land",
        "vps"
    ],
    "workspaceMode": "droneblocks-code",
    "physicalFlightAllowed": false,
    "essentialQuestion": "איך משלבים תנועה בצירים X/Y/Z, השהיית ייצוב ושיתוף בענן כדי לתכנן משימת חקר בטוחה בסביבת מאדים?",
    "successCriteria": [
        "אני מסביר/ה למה Mars Simulator דורש חשיבה תלת־מימדית ולא רק מסלול שטוח.",
        "אני שומר/ת פרויקט בשם Mars_Sensor_Scan_v1 לפני יצירת Share Link.",
        "אני משתמש/ת ב־flyUp, flyDown, flyForward ו־sleep בסדר שמונע פגיעה במכשולים.",
        "אני יודע/ת להסביר למה sleep(5) מייצג ייצוב ופריקת נתונים מעל תחנת סייסמוגרף.",
        "אני משלב/ת yawRight(180) כדי להפנות את המצלמה/האף לכיוון החזרה.",
        "אני מפיק/ה Device/Desktop Share Link לצורך Code Review.",
        "אני מסיים/ת גרסה בשם Mars_Mission_Success ושומר/ת אותה בענן."
    ],
    "realWorldUses": [
        {
            "icon": "🚁",
            "title": "Ingenuity ו־NASA JPL",
            "text": "מסוקים ורחפנים רובוטיים מסייעים לרוברים למצוא נתיבי חקר ואזורים מדעיים מעניינים."
        },
        {
            "icon": "🪨",
            "title": "ניווט מעל מכשולים",
            "text": "בסביבה לא מוכרת, גובה נכון מונע התנגשות בסלעים ורכסים."
        },
        {
            "icon": "📡",
            "title": "פריקת נתונים",
            "text": "שהייה מעל תחנת מדידה מדמה זמן הורדת נתונים או כיול חיישנים."
        },
        {
            "icon": "☁️",
            "title": "ענן ו־Code Review",
            "text": "מהנדסים שומרים גרסאות ומשתפים קוד לבדיקה לפני הרצה מסוכנת."
        }
    ],
    "vocabulary": [
        [
            "Mars Simulator",
            "סביבת סימולציה המדמה משימת חקר במאדים עם מכשולים ופערי גובה."
        ],
        [
            "Seismograph",
            "חיישן שמודד תנודות קרקע; במשימה הרחפן סורק/מכייל תחנות כאלה."
        ],
        [
            "Thin Atmosphere",
            "אטמוספירה דלילה שבה קשה יותר לייצר עילוי ודורשים ייצוב זהיר."
        ],
        [
            "Inertia Drift",
            "סחיפה לאחר תנועה מהירה אם לא נותנים לרחפן זמן להתייצב."
        ],
        [
            "VPS",
            "חיישני מיקום חזותיים שעוזרים להעריך גובה ומיקום ביחס לקרקע."
        ],
        [
            "Cloud Save",
            "שמירת פרויקט בענן כדי לא לאבד גרסאות ולהפיק קישור שיתוף."
        ],
        [
            "Code Review",
            "סקירת קוד על ידי מדריך/עמיתים לפני הרצה."
        ],
        [
            "yawRight(180)",
            "סיבוב של חצי סיבוב כדי להפנות את האף והמצלמה לכיוון החזרה."
        ],
        [
            "Mars_Mission_Success",
            "שם גרסת ההגשה הסופית אחרי כיול והרצה מוצלחת."
        ]
    ],
    "safetyRules": [
        "מפגש 3 הוא סימולטור Mars בלבד — אין חיבור ל־TELLO WiFi ואין הטסה פיזית.",
        "רחפן הדגמה, אם מוצג להסבר VPS, נשאר ללא סוללה וללא הפעלה.",
        "לפני הרצת קוד מורכב מבצעים Code Review קצר: takeoff, גבהים, sleep, yaw, land.",
        "לא מריצים רצף תלת־מימדי ללא sleep בין תנועה מהירה, שינוי גובה או סיבוב משמעותי.",
        "גובה נמוך מדי ליד מכשול הוא החלטת קוד מסוכנת — קודם עולים, אחר כך טסים קדימה.",
        "Share Link נוצר רק אחרי Save ואישור שהפרויקט נשמר בענן.",
        "אם סימולטור מאדים לא נטען, לא עוברים לרחפן פיזי; מרעננים אפליקציה או חוזרים לגרסת Minimal/Grid זמנית."
    ],
    "commonDirections": [
        [
            "tello.flyUp(60);",
            "עלייה לגובה תחנת סייסמוגרף א׳."
        ],
        [
            "tello.flyForward(100);",
            "טיסה קדימה לתחנת מדידה או מנחת הבא."
        ],
        [
            "tello.sleep(5);",
            "סריקה, כיול ופריקת נתונים מעל תחנה."
        ],
        [
            "tello.flyUp(40);",
            "תוספת גובה למעבר מעל רכס סלעים לגובה 100 אינץ׳."
        ],
        [
            "tello.yawRight(180);",
            "הפניית המצלמה והאף לכיוון החזרה לבסיס."
        ],
        [
            "tello.flyDown(60);",
            "הנמכה בטוחה אחרי מעבר המכשול."
        ],
        [
            "Save Project",
            "שמירה בשם Mars_Sensor_Scan_v1 או Mars_Mission_Success."
        ],
        [
            "Device/Desktop Share Link",
            "קישור הגשה ו־Code Review למדריך."
        ]
    ],
    "setupSteps": [
        "טאבלטים טעונים 100% עם DroneBlocks Code מעודכן.",
        "WiFi בית ספרי יציב לסנכרון ענן ושיתוף קוד.",
        "מקרן להצגת Mars Simulator, תרשים המשימה ודוגמת Code Review.",
        "רחפן Tello אחד להדגמת VPS בלבד — ללא סוללה.",
        "לוודא שלתלמידים יש גישה לחשבון ושיכולים לבצע Save/Share.",
        "להכין תזכורת שמות: Mars_Sensor_Scan_v1 ו־Mars_Mission_Success."
    ],
    "tabletTips": [
        "פותחים את האפליקציה רק על WiFi בית ספרי כדי ש־Cloud Save יעבוד.",
        "שומרים Mars_Sensor_Scan_v1 לפני ההרצה הראשונה ולא מחכים לסוף השיעור.",
        "בודקים כל Share Link אחרי Save; קישור לפני שמירה עלול לפתוח דף ריק.",
        "ב־Mars Simulator מריצים אתגר 1 לפני אתגר 2 — לא קופצים ישר למסלול הארוך.",
        "אחרי כל flyUp/flyDown/flyForward/yaw משמעותי מוסיפים sleep לייצוב.",
        "אם מתקבלת שגיאת flyUp is not a function — בודקים CamelCase ו־Function Reference."
    ],
    "lessonFlow": [
        {
            "minutes": "0–8",
            "title": "בדיקת תנאי קדם משיעור 2",
            "teacher": "מזכיר Pitch/Roll/Yaw ואת תפקיד כיוון המצלמה. מחבר ל־yawRight(180) של היום.",
            "students": "מסבירים במשפט אחד למה Yaw השפיע על צילום הפאנלים."
        },
        {
            "minutes": "8–18",
            "title": "PBL — רשת המחקר על מאדים",
            "teacher": "מציג את NASA JPL, Ingenuity 2.0, תחנות סייסמוגרף, סלעים וגבהים משתנים.",
            "students": "מזהים אילו החלטות קוד מונעות התרסקות."
        },
        {
            "minutes": "18–25",
            "title": "אטמוספירה דלילה וייצוב חיישנים",
            "teacher": "מסביר למה במאדים נדרש זמן התייצבות ארוך יותר ומדוע sleep הוא חלק מתוכנית הטיסה.",
            "students": "מחברים sleep לייצוב, VPS ופריקת נתונים."
        },
        {
            "minutes": "25–35",
            "title": "Cloud Workflow",
            "teacher": "מדגים WiFi בית ספרי, Save Project בשם Mars_Sensor_Scan_v1, Share Link ו־Code Review.",
            "students": "יוצרים פרויקט ושומרים גרסה ראשונה."
        },
        {
            "minutes": "35–45",
            "title": "Code Review לפני הרצה",
            "teacher": "מציג רשימת בדיקה: takeoff, גובה לפני מכשול, sleep, yaw, land ושמות CamelCase.",
            "students": "בודקים שלד קוד בזוגות לפני Run."
        },
        {
            "minutes": "45–58",
            "title": "אתגר 1 — סריקת תחנה בגובה משתנה",
            "teacher": "מנחה מסלול: takeoff, flyUp(60), flyForward(100), sleep(5), flyDown(30), flyForward(100), land.",
            "students": "כותבים, שומרים ומריצים ב־Mars Simulator."
        },
        {
            "minutes": "58–73",
            "title": "אתגר 2 — משימת חקר דו־שלבית",
            "teacher": "מנחה הוספת תחנה ב׳, מעבר רכס עם flyUp(40), yawRight(180), חזרה ונחיתה.",
            "students": "משדרגים לגרסה Mars_Mission_Success ומריצים."
        },
        {
            "minutes": "73–80",
            "title": "דיבוג וסקירת קוד כיתתית",
            "teacher": "מקרין Share Link אחד או שניים ומנתח שגיאות סינטקס/לוגיקה בלי לבייש צוותים.",
            "students": "מתקנים שגיאה אחת ומסבירים את השינוי."
        },
        {
            "minutes": "80–87",
            "title": "Save + Share סופי",
            "teacher": "מנחה שמירה, המתנה לאישור Project Saved Successfully, יצירת Device/Desktop Share Link.",
            "students": "שולחים קישור סופי למדריך."
        },
        {
            "minutes": "87–90",
            "title": "סיכום",
            "teacher": "שואל למה נדרש yawRight(180) לפני החזרה ולמה לא מריצים ללא sleep.",
            "students": "מחזירים טאבלטים ומשלימים כרטיס יציאה."
        }
    ],
    "exercises": [
        {
            "minutes": "0–8",
            "title": "גשר מ־SolarScan",
            "prompt": "למה ב־Yaw Box המצלמה ראתה טוב יותר את כיוון הטיסה?",
            "check": "התשובה מחברת אף/מצלמה לכיוון התנועה."
        },
        {
            "minutes": "8–18",
            "title": "מפת סיכונים במאדים",
            "prompt": "סמנו שני סיכונים במסלול: סלע/גובה/חזרה לבסיס/חוסר ייצוב.",
            "check": "מופיעים מכשול וגובה/ייצוב."
        },
        {
            "minutes": "18–25",
            "title": "sleep הוא החלטת בטיחות",
            "prompt": "כתבו אחרי אילו פקודות הייתם מוסיפים sleep ומדוע.",
            "check": "מופיעות תנועה מהירה, שינוי גובה או yaw."
        },
        {
            "minutes": "25–35",
            "title": "Cloud Save ראשון",
            "prompt": "שמרו פרויקט בשם Mars_Sensor_Scan_v1 והראו למדריך שהשמירה הצליחה.",
            "check": "קיים פרויקט שמור או תיעוד תקלה."
        },
        {
            "minutes": "35–45",
            "title": "Code Review בזוגות",
            "prompt": "בדקו בקוד של בן/בת זוג: takeoff, land, CamelCase, גבהים, sleep.",
            "check": "נמצאה/אושרה לפחות נקודת בדיקה אחת."
        },
        {
            "minutes": "45–58",
            "title": "אתגר 1 — תחנה א׳",
            "prompt": "כתבו והריצו את מסלול תחנת סייסמוגרף א׳ בגובה 60 אינץ׳.",
            "check": "הקוד כולל flyUp(60), flyForward(100), sleep(5), flyDown(30), land."
        },
        {
            "minutes": "58–73",
            "title": "אתגר 2 — שתי תחנות וחזרה",
            "prompt": "הוסיפו flyUp(40), תחנה ב׳, yawRight(180), flyDown(60), flyForward(220).",
            "check": "יש גובה 100 אינץ׳, yaw 180 וחזרה מסודרת."
        },
        {
            "minutes": "73–80",
            "title": "Debug Log",
            "prompt": "רשמו שגיאה אחת שתיקנתם: סינטקס, גובה, sleep או Share Link.",
            "check": "התיעוד כולל בעיה ופתרון."
        },
        {
            "minutes": "80–87",
            "title": "Mars_Mission_Success",
            "prompt": "שמרו גרסה סופית בשם Mars_Mission_Success וצרו Share Link.",
            "check": "יש קישור או תיעוד בעיית WiFi/Save."
        },
        {
            "minutes": "87–90",
            "title": "כרטיס יציאה",
            "prompt": "השלימו: yawRight(180) חשוב כי ___. Cloud Save חשוב כי ___.",
            "check": "התשובה מחברת מצלמה/חזרה וגיבוי/Code Review."
        }
    ],
    "deliverable": "פרויקט Mars_Sensor_Scan_v1 שנשמר בענן, גרסה סופית Mars_Mission_Success, Share Link ל־Code Review, ו־Debug Log קצר על שגיאה אחת שתוקנה.",
    "assessment": [
        "התלמיד מסביר את המעבר מניווט דו־מימדי לניווט תלת־מימדי.",
        "הקוד כולל flyUp/flyDown/flyForward/sleep/yawRight/land בסדר בטוח.",
        "הקוד משתמש ב־sleep(5) מעל תחנות סייסמוגרף לצורך סריקה/פריקת נתונים.",
        "הקוד כולל yawRight(180) לפני חזרה או הסבר לוגי שקול.",
        "העבודה נעשתה ב־Mars Simulator בלבד וללא TELLO WiFi.",
        "בוצעה שמירה בענן לפני Share Link.",
        "יש Mars_Mission_Success ו־Share Link או תיעוד תקלה טכנית ברור."
    ],
    "debugging": [
        {
            "problem": "flyUp is not a function",
            "fix": "לתקן CamelCase: flyUp עם U גדולה ולבדוק Function Reference."
        },
        {
            "problem": "Share Link נפתח ריק",
            "fix": "לבצע Save מחדש, להמתין ל־Project Saved Successfully ואז ליצור קישור חדש."
        },
        {
            "problem": "הרחפן הווירטואלי פוגע ברכס",
            "fix": "להעלות גובה לפני התקדמות: flyUp(40) לפני flyForward לתחנה ב׳."
        },
        {
            "problem": "המצלמה לא פונה לכיוון החזרה",
            "fix": "להוסיף yawRight(180) ולתת sleep(3) אחרי הסיבוב."
        },
        {
            "problem": "הקוד רץ מהר מדי ונראה לא יציב",
            "fix": "להוסיף sleep אחרי שינוי גובה, תנועה אופקית או yaw."
        },
        {
            "problem": "הגרסה הסופית אבדה",
            "fix": "לשמור שמות גרסה ברורים: Mars_Sensor_Scan_v1 ואז Mars_Mission_Success."
        }
    ],
    "differentiation": {
        "support": [
            "לתת שלד אתגר 1 מלא עם חסרים רק במספרים 60/100/30.",
            "לאפשר לתלמידים מתקשים להתמקד ב־Save/Share ותחנה אחת בלבד.",
            "להשתמש בתרשים צד מודפס שמראה גבהים לפני כתיבת הקוד."
        ],
        "extension": [
            "להוסיף הערות // לכל תחנת סייסמוגרף ולכל החלטת גובה.",
            "להוסיף משתנה let stationAHeight = 60; ו־let ridgeClearance = 40; כהכנה לשיעור 4.",
            "להשוות גרסה עם sleep קצר מדי מול sleep(5) ולנסח המלצת מהנדס."
        ]
    },
    "instructorGuide": {
        "prerequisites": "התלמידים השלימו שיעור 1 בציר אנכי ושיעור 2 בהשוואת Strafing/Yaw. שיעור 3 מחבר בין הצירים: גובה Z, תנועה קדימה X/Y, ופניית Yaw לצורך כיוון מצלמה וחזרה בטוחה.",
        "pedagogy": [
            "להציג Cloud Save כהרגל הנדסי ולא כפעולה טכנית שולית: קוד שלא נשמר לא ניתן לבדיקה ולשיפור.",
            "להפוך sleep למושג מקצועי: ייצוב חיישנים, בלימת אינרציה ופריקת נתונים, לא ‘המתנה משעממת’. ",
            "להקפיד על Code Review לפני Run כדי לבנות תרבות בטיחות לפני המעבר העתידי לרחפן פיזי.",
            "להדגיש שבסביבת מאדים התלמידים מתכננים מסלול תלת־מימדי: קודם גובה בטוח, אחר כך תנועה אופקית.",
            "לקשר את yawRight(180) משיעור 2: כיוון האף והמצלמה קובע מה מתועד בדרך חזרה."
        ],
        "facilitationNotes": [
            "אם אין זמן, אתגר 1 חובה ואתגר 2 הוא הרחבה לקבוצות מתקדמות.",
            "בזמן Code Review, חפשו בעיקר flyup/flyUp, חסר sleep, שכחת land, ו־Share Link לפני Save.",
            "הקרינו קוד של צוות אחד רק בהסכמה והציגו זאת כסקירה הנדסית ולא כבדיקת טעויות אישית.",
            "אם Mars Simulator איטי, להשאיר את סיפור מאדים ולבצע את המסלול בסביבה פשוטה יותר, אך לא לעבור לטיסה פיזית."
        ],
        "mediaNote": "סרטון Ingenuity/Perseverance הוא השראה קצרה בלבד; אם הרשת איטית, הדיאגרמה וסיפור NASA JPL מספיקים.",
        "exitTicket": "במשימת מאדים הוספנו sleep אחרי ___ כי ___."
    },
    "appWorkflowTitle": "DroneBlocks Code — Mars Sensor Scan",
    "appWorkflowNote": "מפגש 3 מתבצע כולו בטאבלט וב־Mars Simulator. WiFi בית ספרי נדרש לשמירה בענן ול־Share Link. אין TELLO WiFi ואין הטסה פיזית.",
    "appWorkflow": [
        {
            "title": "School WiFi + Cloud Login",
            "detail": "פתחו DroneBlocks Code על WiFi בית ספרי והתחברו לחשבון כדי לאפשר Save/Share."
        },
        {
            "title": "Save Project",
            "detail": "שמרו מיד בשם Mars_Sensor_Scan_v1 וודאו שמופיעה הודעת Project Saved Successfully."
        },
        {
            "title": "Mars Simulator",
            "detail": "בחרו Mars Simulator ובדקו שהמסלול מתחיל ממנחת השיגור."
        },
        {
            "title": "Challenge 1",
            "detail": "כתבו תחנה אחת: flyUp(60), flyForward(100), sleep(5), flyDown(30), flyForward(100), land."
        },
        {
            "title": "Challenge 2",
            "detail": "שדרגו לשתי תחנות: flyUp(40), flyForward(100), sleep(5), yawRight(180), flyDown(60), flyForward(220), land."
        },
        {
            "title": "Code Review + Final Share",
            "detail": "בצעו בדיקה בזוג, שמרו כ־Mars_Mission_Success, צרו Device/Desktop Share Link ושלחו למדריך."
        }
    ],
    "visualDiagram": {
        "panelTitle": "🪐 Mars Sensor Scan",
        "chip": "Mars Simulator",
        "title": "סריקת סייסמוגרפים בתלת־ממד",
        "src": "assets/drone-mission-lab-grade8/lesson3/mars-seismograph-sensor-scan.svg",
        "alt": "תרשים משימת Mars Simulator עם תחנות סייסמוגרף בגובה 60 ו־100 אינץ׳, מעבר רכס, yawRight 180 וחזרה למנחת",
        "caption": "המשימה מחברת גובה, תנועה אופקית, sleep לייצוב ו־yawRight(180) לכיוון המצלמה בדרך חזרה — הכול בענן ובסימולטור מאדים בלבד."
    },
    "videoResources": [
        {
            "title": "NASA Ingenuity Mars helicopter Perseverance — search suggestion",
            "url": "https://www.youtube.com/results?search_query=NASA+Ingenuity+Mars+helicopter+Perseverance",
            "note": "סרטון השראה קצר על מסוק המאדים Ingenuity."
        },
        {
            "title": "JPL Mars helicopter Ingenuity science mission — fallback",
            "url": "https://www.youtube.com/results?search_query=JPL+Mars+helicopter+Ingenuity+science+mission",
            "note": "חלופה לתרומת Ingenuity למשימות חקר."
        }
    ],
    "screenshotSlides": [
        {
            "title": "Mars Sensor Scan",
            "src": "assets/drone-mission-lab-grade8/lesson3/mars-seismograph-sensor-scan.svg",
            "caption": "תחנות סייסמוגרף, גבהים שונים, yaw 180 וחזרה למנחת."
        },
        {
            "title": "פותחים DroneBlocks Code",
            "src": "assets/tello-mission-lab/lesson1/open-app.png",
            "caption": "WiFi בית ספרי ופרויקט Mars_Sensor_Scan_v1."
        },
        {
            "title": "Mars / Simulator Run",
            "src": "assets/tello-mission-lab/lesson1/simulator-run.png",
            "caption": "הרצה וירטואלית בלבד — אין TELLO WiFi."
        },
        {
            "title": "Save & Share",
            "src": "assets/tello-mission-lab/lesson1/save-share.png",
            "caption": "Mars_Mission_Success ו־Device/Desktop Share Link ל־Code Review."
        }
    ],
    "instructorSlides": [
        {
            "title": "NASA JPL: Ingenuity 2.0",
            "body": "הצוות מתכנת מסוק מאדים אוטונומי לסריקת תחנות סייסמוגרף בסביבה לא מוכרת.",
            "bullets": [
                "Mars",
                "JPL",
                "Autonomous flight"
            ]
        },
        {
            "title": "למה מאדים קשה?",
            "body": "אטמוספירה דלילה וסלעים מחייבים גובה נכון, בלימה ו־sleep אחרי תנועה.",
            "bullets": [
                "Thin atmosphere",
                "Inertia",
                "Stabilization"
            ]
        },
        {
            "title": "Cloud Save הוא חלק מההנדסה",
            "body": "שומרים Mars_Sensor_Scan_v1 לפני הרצה ומשתפים קישור ל־Code Review.",
            "bullets": [
                "Save",
                "Share",
                "Review"
            ]
        },
        {
            "title": "מסלול תלת־מימדי",
            "body": "קודם עולים לגובה בטוח, אחר כך טסים קדימה, ואז שוהים לסריקה.",
            "bullets": [
                "Z axis",
                "X/Y movement",
                "sleep(5)"
            ]
        },
        {
            "title": "תחנה א׳",
            "body": "flyUp(60), flyForward(100), sleep(5), flyDown(30), flyForward(100), land.",
            "bullets": [
                "60in",
                "100in",
                "Sensor A"
            ]
        },
        {
            "title": "תחנה ב׳ וחזרה",
            "body": "עולים עוד 40 אינץ׳, עוברים רכס, סורקים, מבצעים yawRight(180) וחוזרים.",
            "bullets": [
                "100in",
                "yaw 180",
                "Return"
            ]
        },
        {
            "title": "Mars_Mission_Success",
            "body": "גרסת ההגשה כוללת קוד שמור, Share Link ונימוק לדיבוג או החלטת גובה אחת.",
            "bullets": [
                "Final version",
                "Debug log",
                "Safety"
            ]
        }
    ]
}
);


  Object.assign(window.DRONE_MISSION_LAB_GRADE8_LESSONS[3], {
    "title": "שיעור 4: Methane LoopScan — לולאות, משתנים וסריקה דינמית ב־JavaScript",
    "subtitle": "for loop, let distance, Dynamic Square Scan, Infinite Loop safety, Minimal Grid → City Simulator",
    "unit": "יחידה 1 — יסודות רחפן, בטיחות וסימולטור JavaScript",
    "concept": "חשיבה אלגוריתמית, אופטימיזציית קוד, לולאת for, משתנה distance ופרמטריזציה של מסלול סריקה",
    "story": "התלמידים הם מהנדסי סביבה ואנליסטים של איכות האוויר באיגוד ערים לאיכות הסביבה. באתר פסולת עירוני התגלתה דליפת מתאן מסוכנת. כדי לאתר את מקור הדליפה בלי לסכן בני אדם, הצוות מתכנת רחפן חקר אוטונומי שמבצע סריקה היקפית מרובעת סביב ארבע פינות האתר. במקום לשכפל קוד ארוך, הם בונים אלגוריתם חכם עם לולאת for ומשתנה distance שמאפשרים להגדיל או להקטין את שטח הסריקה בשינוי שורה אחת בלבד.",
    "mission": "לפתוח DroneBlocks Code בטאבלט על WiFi בית ספרי, ליצור Meeting4_GasScan_Loops_JS, לכתוב JavaScript קצר עם let distance ו־for (let i = 0; i < 4; i++), להריץ תחילה ב־Minimal Grid, לכייל distance מ־60 ל־100, ואז לעבור ל־City Simulator ולבנות סריקת גג/אתר עם distance = 80. גרסת הסיום נשמרת בשם Methane_LoopScan_Success. אין הטסה פיזית במפגש זה — זה שער הסימולטור האחרון לפני מפגש פיזי ראשון.",
    "commands": [
        "code_editor",
        "cloud_save",
        "simulator",
        "city",
        "takeoff",
        "sleep",
        "flyUp",
        "flyForward",
        "yawRight",
        "land",
        "for_loop",
        "let_variable",
        "infinite_loop",
        "save_cloud"
    ],
    "blocks": [
        "code_editor",
        "cloud_save",
        "simulator",
        "city",
        "takeoff",
        "sleep",
        "flyUp",
        "flyForward",
        "yawRight",
        "land",
        "for_loop",
        "let_variable",
        "infinite_loop",
        "save_cloud"
    ],
    "workspaceMode": "droneblocks-code",
    "physicalFlightAllowed": false,
    "essentialQuestion": "איך לולאה ומשתנה הופכים מסלול רחפן חוזר לקוד קצר, גמיש ובטוח יותר לדיבוג?",
    "successCriteria": [
        "אני מזהה דפוס חוזר במסלול ריבוע ומתרגם אותו ללולאת for.",
        "אני מסביר/ה את שלושת חלקי הלולאה: let i = 0, i < 4, i++.",
        "אני מגדיר/ה let distance בראש הקוד ומשתמש/ת בו בתוך tello.flyForward(distance).",
        "אני משנה רק את ערך distance כדי לכייל את גודל הסריקה.",
        "אני יודע/ת להסביר מהי לולאה אינסופית ולמה היא עלולה להקפיא את האפליקציה.",
        "אני מריץ/ה ב־Minimal Grid ואז ב־City Simulator בלבד, ללא TELLO WiFi.",
        "אני שומר/ת Methane_LoopScan_Success ומגיש/ה Share Link."
    ],
    "realWorldUses": [
        {
            "icon": "🌫️",
            "title": "ניטור מתאן",
            "text": "רחפני חקר יכולים לסרוק אזורי פסולת ותעשייה כדי לאתר פליטות גז מסוכנות."
        },
        {
            "icon": "🔁",
            "title": "סריקה חוזרת",
            "text": "מסלולים מרובעים או גרידיים הם דפוס חוזר שמתאים ללולאות."
        },
        {
            "icon": "🎛️",
            "title": "פרמטריזציה",
            "text": "משתנה distance מאפשר להתאים את גודל המשימה בלי לשנות כל פקודה בנפרד."
        },
        {
            "icon": "🧯",
            "title": "מניעת כשל תוכנה",
            "text": "לולאה אינסופית היא סכנת קוד: בתוכנה שמפעילה רחפן, תנאי עצירה הוא חלק מבטיחות."
        }
    ],
    "vocabulary": [
        [
            "Algorithm",
            "רצף החלטות ופקודות שמוביל לפתרון משימה."
        ],
        [
            "Loop",
            "מבנה שחוזר על אותה קבוצת פקודות מספר פעמים."
        ],
        [
            "for loop",
            "לולאת JavaScript עם מונה, תנאי עצירה וקידום מונה."
        ],
        [
            "Counter / i",
            "משתנה מונה שמתחיל מ־0 ומתקדם בכל חזרה."
        ],
        [
            "Stop condition / i < 4",
            "תנאי שמחליט מתי הלולאה מפסיקה."
        ],
        [
            "i++",
            "קידום המונה ב־1 בסוף כל חזרה."
        ],
        [
            "Variable / let distance",
            "קופסת מידע בשם distance שמחזיקה את גודל צלע הסריקה."
        ],
        [
            "Parameterization",
            "שליטה בהתנהגות קוד דרך ערך משתנה במקום שינוי פקודות רבות."
        ],
        [
            "Infinite Loop",
            "לולאה ללא תנאי עצירה תקין שעלולה להקפיא אפליקציה."
        ],
        [
            "Methane / CH₄",
            "גז חממה חזק ומסוכן שדורש ניטור סביבתי."
        ]
    ],
    "safetyRules": [
        "מפגש 4 הוא סימולטור בלבד — אין חיבור ל־TELLO WiFi ואין הטסה פיזית.",
        "לא מריצים לולאת for לפני בדיקה שיש תנאי עצירה i < 4 וקידום מונה i++.",
        "אם DroneBlocks Code קופא אחרי Run, מבצעים Force Close ולא לוחצים שוב ושוב על Run.",
        "ערכי distance בכיתה נשארים בטווח סימולטור סביר: 20–100 אינץ׳, אלא אם המדריך מאשר אחרת.",
        "לפני מעבר ל־City Simulator בודקים שהקוד עובד ב־Minimal Grid.",
        "כל מסלול מתחיל ב־takeoff ומסתיים ב־land, גם כשהקוד בתוך לולאה.",
        "שיעור 4 מכין למפגש פיזי ראשון — מי שלא עומד בכללי סימולטור, לא מתקדם לטיסה פיזית במפגש הבא."
    ],
    "commonDirections": [
        [
            "let distance = 60;",
            "משתנה מרחק גלובלי בראש הקוד."
        ],
        [
            "for (let i = 0; i < 4; i++) {",
            "לולאה שחוזרת ארבע פעמים — פעם לכל צלע בריבוע."
        ],
        [
            "tello.flyForward(distance);",
            "טיסה קדימה לפי ערך המשתנה."
        ],
        [
            "tello.yawRight(90);",
            "פנייה 90° לסגירת צלע הריבוע הבאה."
        ],
        [
            "distance = 100",
            "כיול מהיר להגדלת שטח הסריקה."
        ],
        [
            "Force Close",
            "סגירת אפליקציה אם נוצרה לולאה אינסופית."
        ],
        [
            "Methane_LoopScan_Success",
            "שם גרסת ההגשה הסופית."
        ]
    ],
    "setupSteps": [
        "טאבלטים טעונים 100% עם DroneBlocks Code.",
        "WiFi בית ספרי פעיל לשמירה ושיתוף.",
        "מקרן להצגת מבנה for loop ותרשים i = 0 עד i < 4.",
        "דפי תרגול/לוח להדגמת מונה הלולאה.",
        "להכין תזכורת בטיחות: זה השיעור האחרון לפני מפגש פיזי ראשון אך היום אין הטסה.",
        "לוודא ש־City Simulator זמין; אם לא, להמשיך ב־Minimal Grid עם אותו קוד."
    ],
    "tabletTips": [
        "להקליד את הלולאה לאט: סוגריים עגולים, סוגריים מסולסלים ונקודה־פסיק בחלקי for.",
        "להריץ קודם עם distance = 60 ורק אחר כך לשנות ל־100.",
        "אם שכחתם i++ — לא להריץ שוב; לתקן קודם את הלולאה.",
        "לבדוק שהפקודות שבתוך הלולאה מוזחות פנימה כדי לראות מה חוזר.",
        "ב־City Simulator משתמשים ב־distance = 80 ו־flyUp(80) לפני סריקת הגג.",
        "שומרים בשם Methane_LoopScan_Success רק אחרי שהמסלול נסגר בהצלחה."
    ],
    "lessonFlow": [
        {
            "minutes": "0–8",
            "title": "בדיקת תנאי קדם משיעורים 1–3",
            "teacher": "מחבר: שיעור 1 גובה, שיעור 2 ריבוע, שיעור 3 מאדים וענן. היום מקצרים ומכלילים את הריבוע בעזרת לולאה ומשתנה.",
            "students": "מזהים איזה חלק במסלול הריבוע חוזר שוב ושוב."
        },
        {
            "minutes": "8–18",
            "title": "PBL — דליפת מתאן באתר פסולת",
            "teacher": "מציג משימת ניטור סביבתי: סריקת ארבע פינות סביב אתר פסולת כדי לאתר CH₄.",
            "students": "מסבירים למה עדיף רחפן על צוות אנושי באזור מסוכן."
        },
        {
            "minutes": "18–25",
            "title": "אנלוגיות: כלים בכיור וקופסת distance",
            "teacher": "מסביר Loop דרך שטיפת כלים ומשתנה דרך קופסת מידע עם תווית distance.",
            "students": "נותנים דוגמה לדפוס חוזר ולפרמטר משתנה מחיי היום־יום."
        },
        {
            "minutes": "25–35",
            "title": "פתיחת פרויקט",
            "teacher": "מוביל WiFi בית ספרי, DroneBlocks Code, Login ויצירת Meeting4_GasScan_Loops_JS.",
            "students": "פותחים פרויקט ושומרים גרסה ראשונה."
        },
        {
            "minutes": "35–47",
            "title": "סינטקס for ו־let",
            "teacher": "מפרק על המקרן: let distance = 60; for (let i = 0; i < 4; i++) { ... }.",
            "students": "מסמנים מונה, תנאי עצירה וקידום מונה."
        },
        {
            "minutes": "47–60",
            "title": "אתגר 1 — Minimal Grid Loop Square",
            "teacher": "מנחה כתיבת ריבוע קצר עם distance = 60 ולולאה של 4 חזרות.",
            "students": "מריצים ומשווים לקוד הארוך משיעור 2."
        },
        {
            "minutes": "60–68",
            "title": "כיול מהיר — distance 100",
            "teacher": "מבקש לשנות רק את השורה let distance = 60 ל־100 ולהריץ מחדש.",
            "students": "מתעדים איך המסלול גדל בלי שינוי בגוף הלולאה."
        },
        {
            "minutes": "68–80",
            "title": "אתגר 2 — City Roof Scan",
            "teacher": "מוביל מעבר ל־City Simulator: flyUp(80), distance = 80, לולאה סביב גג ונחיתה.",
            "students": "בונים גרסת Methane_LoopScan_Success."
        },
        {
            "minutes": "80–87",
            "title": "Debugging: Infinite Loop Safety",
            "teacher": "מדגים למה i++ ותנאי עצירה חשובים ומה עושים אם האפליקציה קופאת.",
            "students": "בודקים בקוד שלהם שאין i > -1 או חסר i++."
        },
        {
            "minutes": "87–90",
            "title": "סיכום ושער למפגש פיזי",
            "teacher": "שואל איך לולאות מקלות דיבוג ומדגיש שבמפגש הבא רק מי שעומד בנוהל בטיחות מתקדם לפיזי.",
            "students": "שולחים Share Link ומחזירים טאבלטים."
        }
    ],
    "exercises": [
        {
            "minutes": "0–8",
            "title": "מצא את הדפוס",
            "prompt": "איזה זוג פקודות חזר שוב ושוב ב־Yaw Box משיעור 2?",
            "check": "flyForward + yawRight או תנועה + פנייה."
        },
        {
            "minutes": "8–18",
            "title": "Brief סביבתי",
            "prompt": "כתבו למה מסוכן לשלוח אדם לחפש דליפת מתאן ומה היתרון ברחפן.",
            "check": "מוזכרים גז/סיכון/סריקה מרחוק."
        },
        {
            "minutes": "18–25",
            "title": "מונה אנושי",
            "prompt": "עמדו בארבע פינות דמיוניות וספרו i = 0,1,2,3; מתי עוצרים?",
            "check": "הכיתה מבינה שעוצרים כש־i כבר לא קטן מ־4."
        },
        {
            "minutes": "35–47",
            "title": "פירוק לולאה",
            "prompt": "סמנו בקוד: איפוס מונה, תנאי עצירה וקידום מונה.",
            "check": "let i = 0, i < 4, i++ מסומנים נכון."
        },
        {
            "minutes": "47–60",
            "title": "אתגר 1 — Loop Square",
            "prompt": "כתבו ריבוע עם let distance = 60 ולולאת for של 4 חזרות.",
            "check": "הקוד כולל flyForward(distance) ו־yawRight(90) בתוך הלולאה."
        },
        {
            "minutes": "60–68",
            "title": "כיול distance",
            "prompt": "שנו רק את distance ל־100 והריצו שוב. מה השתנה?",
            "check": "התלמיד מסביר שהמסלול גדל בלי שינוי בגוף הקוד."
        },
        {
            "minutes": "68–80",
            "title": "City Roof Scan",
            "prompt": "עברו ל־City Simulator, השתמשו ב־distance = 80 ו־flyUp(80), וסרקו גג בריבוע.",
            "check": "יש flyUp לפני הלולאה ו־land בסוף."
        },
        {
            "minutes": "80–87",
            "title": "ציד לולאות אינסופיות",
            "prompt": "מצאו מה מסוכן ב־for (let i = 0; i < 4;) או i > -1.",
            "check": "מזוהה חסר i++ או תנאי שלא מפסיק."
        },
        {
            "minutes": "87–90",
            "title": "כרטיס יציאה",
            "prompt": "לולאה מקלה על דיבוג כי ___. משתנה distance טוב כי ___.",
            "check": "התשובה מחברת תיקון פעם אחת ושינוי פרמטר מרכזי."
        }
    ],
    "deliverable": "Meeting4_GasScan_Loops_JS עם גרסת Minimal Grid וגרסת City Simulator, שמירה סופית בשם Methane_LoopScan_Success, Share Link, ומשפט רפלקציה על יתרון לולאה ומשתנה בדיבוג.",
    "assessment": [
        "התלמיד משתמש נכון ב־let distance ומסביר את תפקיד המשתנה.",
        "התלמיד כותב for loop תקין עם let i = 0, i < 4, i++.",
        "פקודות flyForward(distance), sleep ו־yawRight(90) נמצאות בתוך הלולאה בסדר נכון.",
        "התלמיד משנה distance בלבד כדי לכייל את המסלול.",
        "התלמיד מזהה ומונע Infinite Loop לפני הרצה.",
        "העבודה נעשתה ב־Minimal Grid/City Simulator בלבד ללא TELLO WiFi.",
        "יש Methane_LoopScan_Success ו־Share Link או תיעוד תקלה ברור."
    ],
    "debugging": [
        {
            "problem": "DroneBlocks Code קפאה אחרי Run",
            "fix": "חשד ללולאה אינסופית: Force Close, פתיחה מחדש, בדיקת i < 4 ו־i++ לפני הרצה נוספת."
        },
        {
            "problem": "הרחפן יוצא מגבולות המסך",
            "fix": "לבדוק let distance — כנראה 600 במקום 60/100 או ערך גדול מדי לסימולטור."
        },
        {
            "problem": "הלולאה לא רצה ארבע פעמים",
            "fix": "לבדוק תנאי עצירה וקידום מונה: for (let i = 0; i < 4; i++)."
        },
        {
            "problem": "רק הפקודה הראשונה חוזרת או כלום לא חוזר",
            "fix": "לבדוק סוגריים מסולסלים { } סביב כל פקודות הגוף של הלולאה."
        },
        {
            "problem": "שגיאת סינטקס בשורת for",
            "fix": "לבדוק נקודה־פסיק בין שלושת חלקי ה־for וסוגריים עגולים."
        },
        {
            "problem": "הקוד בעיר פוגע בבניין",
            "fix": "לוודא flyUp(80) לפני הלולאה ו־distance = 80 לפי סביבת City."
        }
    ],
    "differentiation": {
        "support": [
            "לתת שלד for מלא ולבקש להשלים רק distance ושמות פקודות.",
            "להישאר ב־Minimal Grid בלבד אם City Simulator מעמיס על תלמידים.",
            "להדגים את המונה i על הלוח עם ארבע משבצות."
        ],
        "extension": [
            "להוסיף משתנה let pause = 2; ולהשתמש בו ב־tello.sleep(pause).",
            "להשוות מספר שורות בין קוד שיעור 2 לקוד הלולאה ולחשב אחוז קיצור.",
            "להוסיף הערות // שמסבירות את תנאי העצירה ולמה הוא מונע לולאה אינסופית."
        ]
    },
    "instructorGuide": {
        "prerequisites": "שיעור 4 מסתמך על שיעור 2 שבו נבנה ריבוע ידני ועל שיעור 3 שבו הודגשו Save/Share ו־Code Review. כאן התלמידים מגלים שהריבוע הוא דפוס חוזר שאפשר להפוך לאלגוריתם קצר וגמיש.",
        "pedagogy": [
            "להציג אופטימיזציה לא כ‘קוד קצר בשביל יופי’ אלא כקריאות, דיבוג מהיר והפחתת סיכוי לשגיאות.",
            "להתעקש על הבנת for ולא רק העתקה: מונה, תנאי עצירה, קידום מונה וגוף הלולאה.",
            "להדגיש שמשתנה בראש הקוד הוא כלי צוותי: מי שמעדכן פרמטר לא צריך לחפש עשר שורות שונות.",
            "להפוך Infinite Loop לנושא בטיחותי — קוד ללא עצירה הוא תכנון לא אחראי, גם בסימולטור.",
            "לסגור את שלב הסימולטור ברצינות: שיעור 5 יהיה פיזי רק לאחר עמידה בנוהלי קוד ובטיחות."
        ],
        "facilitationNotes": [
            "אם יש חשש להקפאות רבות, בקשו מכל זוג להראות לכם את שורת ה־for לפני Run ראשון.",
            "בדיון הדיבוג, שאלו איפה מתקנים sleep אם הוא מופיע בתוך לולאה — פעם אחת במקום ארבע.",
            "אם City Simulator לא יציב, בצעו את אתגר 2 ב־Minimal Grid עם סיפור של גג ואל תעברו לטיסה פיזית.",
            "שמרו 5 דקות לסגירת שער בטיחות לקראת מפגש 5: משקפי מגן, אזור סטרילי, תפקידים ו־Abort."
        ],
        "mediaNote": "סרטון רחפנים לניטור מתאן/פליטות גז הוא אופציונלי. אם אין רשת, דלגו לסיפור ולדיאגרמה כדי לשמור זמן כתיבת קוד.",
        "exitTicket": "במפגש פיזי ראשון אסור לי להריץ קוד לפני שווידאתי ___ ו־___."
    },
    "appWorkflowTitle": "DroneBlocks Code — Methane LoopScan",
    "appWorkflowNote": "מפגש 4 מתבצע כולו בטאבלט בסימולטורים Minimal Grid ו־City. אין TELLO WiFi ואין הטסה פיזית. זה שיעור ההכנה האחרון לפני שער בטיחות למפגש פיזי ראשון.",
    "appWorkflow": [
        {
            "title": "School WiFi + Project",
            "detail": "פתחו DroneBlocks Code על WiFi בית ספרי וצרו Meeting4_GasScan_Loops_JS."
        },
        {
            "title": "Variable First",
            "detail": "כתבו בראש הקוד let distance = 60; והשתמשו ב־tello.flyForward(distance)."
        },
        {
            "title": "For Loop Safety Check",
            "detail": "לפני Run בדקו: for (let i = 0; i < 4; i++) כולל תנאי עצירה וקידום מונה."
        },
        {
            "title": "Minimal Grid Calibration",
            "detail": "הריצו ריבוע עם distance = 60 ואז שנו רק את distance ל־100 והריצו מחדש."
        },
        {
            "title": "City Simulator Roof Scan",
            "detail": "שנו ל־distance = 80, הוסיפו flyUp(80), וסרקו גג/אתר בעיר עם אותה לולאה."
        },
        {
            "title": "Save + Share",
            "detail": "שמרו בשם Methane_LoopScan_Success, הפיקו Share Link והוסיפו משפט רפלקציה."
        }
    ],
    "visualDiagram": {
        "panelTitle": "🌫️ Methane LoopScan",
        "chip": "Loops + Variables",
        "title": "סריקה דינמית עם for ו־distance",
        "src": "assets/drone-mission-lab-grade8/lesson4/methane-loopscan-dynamic-square.svg",
        "alt": "תרשים משימת סריקת מתאן עם מסלול ריבוע דינמי, משתנה distance ולולאת for ב־JavaScript",
        "caption": "במקום לשכפל ארבע צלעות ידנית, מגדירים distance פעם אחת ומריצים לולאת for בטוחה: קצר יותר, קריא יותר וקל יותר לדיבוג."
    },
    "videoResources": [
        {
            "title": "Drone methane leak detection — search suggestion",
            "url": "https://www.youtube.com/results?search_query=drone+methane+leak+detection",
            "note": "סרטון השראה קצר על רחפנים לניטור פליטות מתאן."
        },
        {
            "title": "Drone gas sensor environmental monitoring — fallback",
            "url": "https://www.youtube.com/results?search_query=drone+gas+sensor+environmental+monitoring",
            "note": "חלופה לניטור סביבתי בעזרת רחפנים."
        }
    ],
    "screenshotSlides": [
        {
            "title": "Methane LoopScan",
            "src": "assets/drone-mission-lab-grade8/lesson4/methane-loopscan-dynamic-square.svg",
            "caption": "לולאה אחת ומשתנה distance שולטים במסלול סריקה שלם."
        },
        {
            "title": "פותחים DroneBlocks Code",
            "src": "assets/tello-mission-lab/lesson1/open-app.png",
            "caption": "WiFi בית ספרי ופרויקט Meeting4_GasScan_Loops_JS."
        },
        {
            "title": "Minimal Grid / City Simulator",
            "src": "assets/tello-mission-lab/lesson1/simulator-run.png",
            "caption": "מריצים קודם Minimal Grid ואז City Simulator — ללא TELLO WiFi."
        },
        {
            "title": "Save & Share",
            "src": "assets/tello-mission-lab/lesson1/save-share.png",
            "caption": "Methane_LoopScan_Success ו־Share Link למדריך."
        }
    ],
    "instructorSlides": [
        {
            "title": "משימת מתאן באתר פסולת",
            "body": "רחפן חקר מבצע סריקה היקפית כדי לאתר מקור דליפת CH₄ בלי לסכן בני אדם.",
            "bullets": [
                "Methane",
                "Environmental monitoring",
                "Autonomous scan"
            ]
        },
        {
            "title": "למה לולאה?",
            "body": "אם אותו דפוס חוזר ארבע פעמים, מהנדס לא משכפל קוד — הוא כותב אלגוריתם.",
            "bullets": [
                "Pattern",
                "Repeat",
                "Optimize"
            ]
        },
        {
            "title": "Variable = קופסת מידע",
            "body": "distance בראש הקוד שולט בכל צלעות המסלול. שינוי אחד משנה את כל המשימה.",
            "bullets": [
                "let distance",
                "Parameter",
                "Calibration"
            ]
        },
        {
            "title": "for loop anatomy",
            "body": "let i = 0 מתחיל, i < 4 עוצר, i++ מקדם. שלושתם חובה.",
            "bullets": [
                "counter",
                "stop condition",
                "increment"
            ]
        },
        {
            "title": "Minimal Grid calibration",
            "body": "מריצים distance = 60, ואז משנים רק ל־100 ובודקים איך המסלול גדל.",
            "bullets": [
                "60",
                "100",
                "one-line change"
            ]
        },
        {
            "title": "City Roof Scan",
            "body": "עולים ל־80 אינץ׳, סורקים גג/אתר בעיר עם אותה לולאה ונוחתים.",
            "bullets": [
                "flyUp(80)",
                "distance = 80",
                "land"
            ]
        },
        {
            "title": "Infinite Loop Safety",
            "body": "לולאה בלי תנאי עצירה תקין עלולה להקפיא אפליקציה. תנאי עצירה הוא בטיחות.",
            "bullets": [
                "i < 4",
                "i++",
                "Force Close"
            ]
        }
    ]
}
);


  Object.assign(window.DRONE_MISSION_LAB_GRADE8_LESSONS[4], {
    "title": "שיעור 5: SpaceX Integrated Flight Test — הטסה פיזית ראשונה וכיול ריבוע JavaScript",
    "subtitle": "Sim‑to‑Reality Gap, WiFi Handshake, Pre‑Flight Safety Check, Peer Roles, Abort ו־Physical Box Calibration",
    "unit": "יחידה 1 — יסודות רחפן, בטיחות וסימולטור JavaScript",
    "concept": "מעבר מסימולטור למציאות: הרצת קוד JavaScript פיזי על Tello, ניהול סוללות, עבודת צוות, מדידת סטיות וכיול קוד",
    "story": "לאחר ארבעה מפגשי פיתוח בסימולטור, צוותי ההנדסה מקבלים אישור SpaceX לשלב Static Fire ו־Integrated Flight Test. היום מוציאים את רחפני ה־Tello מהארון לראשונה, מסמנים אזור טיסה סטרילי, מבצעים WiFi Handshake, מריצים את קוד ריבוע הלולאה משיעור 4 על רחפן פיזי, מודדים סטייה מהסימולטור ומבצעים כיול מבוקר של distance או sleep.",
    "mission": "לטעון מהענן את Meeting4_GasScan_Loops_JS על WiFi בית ספרי, לעבור בזהירות ל־TELLO-XXXXXX, לבצע Pre‑Flight Safety Check מלא, לחלק תפקידים Driver/Navigator/Safety Observer, להריץ באישור מדריך Physical Box Mission קצר בתוך Safe Fly Zone, למדוד סטיית נחיתה, לכייל distance או sleep בלבד, ולשמור גרסה סופית בשם Meeting5_Physical_Box_Calibrated. זו טיסה פיזית ראשונה — כל חריגה עוצרת את המשימה.",
    "commands": [
        "wifi_handshake",
        "preflight",
        "peer_roles",
        "safety_check",
        "takeoff",
        "sleep",
        "for_loop",
        "let_variable",
        "yawRight",
        "land",
        "abort",
        "physical_box",
        "drift_measure",
        "battery_protocol",
        "share"
    ],
    "blocks": [
        "wifi_handshake",
        "preflight",
        "peer_roles",
        "safety_check",
        "takeoff",
        "sleep",
        "for_loop",
        "let_variable",
        "yawRight",
        "land",
        "abort",
        "physical_box",
        "drift_measure",
        "battery_protocol",
        "share"
    ],
    "workspaceMode": "physical-drone",
    "physicalFlightAllowed": true,
    "essentialQuestion": "איך מהנדסים מעבירים קוד שעבד בסימולטור לרחפן פיזי בלי לוותר על בטיחות, מדידה וכיול מבוקר?",
    "successCriteria": [
        "אני מסביר/ה מהו Sim‑to‑Reality Gap ולמה רחפן פיזי סוטה מהסימולטור.",
        "אני מבצע/ת WiFi Handshake: בית ספר → טעינת קוד → TELLO → בדיקת סוללה.",
        "אני משתתף/ת בתפקיד מוגדר: Driver, Navigator או Safety Observer, ומתחלף/ת בסבבים.",
        "אני לא מריץ/ה טיסה פיזית בלי משקפי מגן, מגיני פרופלורים, אזור סטרילי ואישור מדריך.",
        "אני יודע/ת מי אחראי על Abort ומתי עוצרים מיד.",
        "אני מודד/ת סטייה מנקודת הנחיתה ומציע/ה כיול אחד בלבד: distance או sleep.",
        "אני שומר/ת Meeting5_Physical_Box_Calibrated ומחזיר/ה סוללה לקופסת ריקות."
    ],
    "realWorldUses": [
        {
            "icon": "🚀",
            "title": "Integrated Flight Test",
            "text": "לפני משימה אמיתית, מהנדסים מריצים ניסוי מבוקר שמוודא שקוד, חומרה וצוות עובדים יחד."
        },
        {
            "icon": "🌬️",
            "title": "Sim‑to‑Reality Gap",
            "text": "רוח מזגן, רצפה מבריקה, VPS וסוללה משנים את התוצאה ביחס לסימולטור."
        },
        {
            "icon": "🦺",
            "title": "בטיחות צוותית",
            "text": "תפקידים מוגדרים ואזור סטרילי מונעים פציעה ושומרים על הרחפן."
        },
        {
            "icon": "📏",
            "title": "כיול מדיד",
            "text": "סטייה פיזית נמדדת, נרשמת ומשמשת לשינוי פרמטר אחד בקוד."
        }
    ],
    "vocabulary": [
        [
            "Simulation‑to‑Reality Gap",
            "הפער בין סימולטור נקי לבין תנאים פיזיים אמיתיים כמו רוח, רצפה, סוללה ותקשורת."
        ],
        [
            "WiFi Handshake",
            "נוהל מעבר מ־WiFi בית ספרי לטעינת קוד בענן אל WiFi פנימי של Tello להרצה פיזית."
        ],
        [
            "Pre‑Flight Check",
            "בדיקת מגינים, פרופלורים, סוללה, נורת סטטוס, אזור סטרילי ו־Abort לפני טיסה."
        ],
        [
            "Safe Fly Zone",
            "מלבן טיסה מסומן שאסור להיכנס אליו כשהמנועים מסתובבים."
        ],
        [
            "Driver",
            "מחזיק הטאבלט המחובר לרחפן, מריץ קוד ואחראי Abort."
        ],
        [
            "Navigator",
            "בודק קוד וסינטקס, עוקב אחר רצף פקודות ומודד סטיות."
        ],
        [
            "Safety Observer",
            "אחראי משקפי מגן, הצבת רחפן, קשר עין והכרזת המראה."
        ],
        [
            "Abort",
            "עצירת חירום מיידית במקרה של סטייה או סכנה."
        ],
        [
            "VPS",
            "מצלמה/חיישנים תחתונים המסייעים לרחפן לייצב מיקום מול הרצפה."
        ],
        [
            "Battery Two‑Box Protocol",
            "קופסה לסוללות מלאות וקופסה לסוללות ריקות; אין אחסון סוללה בתוך הרחפן."
        ]
    ],
    "safetyRules": [
        "טיסה פיזית מותרת רק באישור מדריך, בתוך Safe Fly Zone מסומן ובסבבי צוות מבוקרים.",
        "כל מי שנמצא סביב מלבן הטיסה חייב משקפי מגן; שיער ארוך אסוף.",
        "מגיני פרופלורים מותקנים ונעולים חובה לפני הכנסת סוללה.",
        "אף תלמיד לא נכנס למלבן הטיסה כשהמנועים מסתובבים — גם אם הרחפן נחת לא במקום.",
        "Driver חייב לדעת איפה כפתור Abort לפני לחיצה על Launch Mission.",
        "Safety Observer מכריז בקול: ‘צוות X ממריא!’ רק אחרי שכולם מאחורי קו הבטיחות.",
        "אם הרחפן סוטה בחדות, נוגע במכשול, מאבד גובה או יש ספק — Abort/עצירה מיד.",
        "אין לאחסן סוללה בתוך הרחפן בסוף השיעור; סוללות ריקות עוברות לקופסת 0%."
    ],
    "commonDirections": [
        [
            "School WiFi",
            "פותחים DroneBlocks Code וטוענים Meeting4_GasScan_Loops_JS מהענן."
        ],
        [
            "TELLO-XXXXXX WiFi",
            "עוברים לרשת הרחפן רק אחרי שהקוד נטען ושמור."
        ],
        [
            "Battery visible",
            "בודקים באפליקציה שהסוללה מזוהה ומספיקה להרצה קצרה."
        ],
        [
            "Launch Mission",
            "רק Driver לוחץ, ורק אחרי הכרזת Safety Observer ואישור מדריך."
        ],
        [
            "Abort",
            "עצירה מיידית אם הרחפן חורג מהאזור או מתנהג לא צפוי."
        ],
        [
            "Measure drift",
            "Navigator מודד מרחק בין נחיתה בפועל למנחת היעד."
        ],
        [
            "Calibrate distance/sleep",
            "משנים פרמטר אחד בלבד בכל סבב כיול."
        ],
        [
            "Meeting5_Physical_Box_Calibrated",
            "שם הגרסה המכוילת אחרי חזרה ל־WiFi בית ספרי."
        ]
    ],
    "setupSteps": [
        "לסמן Safe Fly Zone במלבן ברור על רצפת הכיתה ולהגדיר קו צוות במרחק 1.5 מטר לפחות.",
        "להכין רחפן Tello/Tello EDU אחד לכל צוות של שלושה תלמידים, עם מגיני פרופלורים מותקנים.",
        "להכין משקפי מגן לכל צוות ולוודא שיער אסוף לפני סבבי טיסה.",
        "להכין שתי קופסאות סוללה מסומנות: מלאות 100% וריקות 0%. סוללות ממוספרות.",
        "לוודא טאבלטים טעונים ופרויקט Meeting4_GasScan_Loops_JS שמור בענן.",
        "להכין סרט מדידה/סרגל למדידת סטיות נחיתה.",
        "להקרין תרשים אזור הטיסה ותפקידי הצוות לפני חלוקת רחפנים."
    ],
    "tabletTips": [
        "לא עוברים ל־TELLO WiFi לפני שהקוד נטען מהענן על WiFi בית ספרי.",
        "אם הקוד לא נטען, לא מאלתרים מחדש בזמן שהרחפן דולק — חוזרים ל־School WiFi.",
        "ב־TELLO WiFi לא יהיה אינטרנט רגיל; זה תקין בזמן הרצה פיזית.",
        "לפני Launch Mission בודקים שה־distance קטן ובטוח לסביבת הכיתה.",
        "אחרי כל סבב חוזרים לרשום סטייה לפני שמשנים קוד.",
        "בסיום כיול חוזרים ל־School WiFi כדי לשמור Meeting5_Physical_Box_Calibrated ולשתף קישור."
    ],
    "lessonFlow": [
        {
            "minutes": "0–6",
            "title": "בדיקת תנאי קדם משיעור 4",
            "teacher": "מזכיר את קוד הריבוע בלולאה, distance ו־sleep. מסביר שהיום לא כותבים הרבה קוד חדש — בודקים אותו מול מציאות.",
            "students": "פותחים בראש את רצף הריבוע ומזהים פרמטרים שניתן לכייל."
        },
        {
            "minutes": "6–12",
            "title": "PBL — SpaceX Static Fire",
            "teacher": "מציג את המעבר מ־Simulation ל־Integrated Flight Test ואת אחריות הצוותים.",
            "students": "מנסחים סיכון אחד במעבר מסימולטור לרחפן אמיתי."
        },
        {
            "minutes": "12–20",
            "title": "Sim‑to‑Reality Gap",
            "teacher": "מסביר רוח מזגן, אינרציה, רצפה מבריקה, VPS, סוללה ו־WiFi כפקטורים פיזיים.",
            "students": "מנבאים איזו סטייה יכולה להופיע בריבוע הפיזי."
        },
        {
            "minutes": "20–30",
            "title": "תפקידי צוות ובטיחות",
            "teacher": "מגדיר Driver, Navigator, Safety Observer, משקפי מגן, אזור סטרילי והכרזת ‘צוות X ממריא!’. ",
            "students": "מתחלקים לתפקידים ומתרגלים הכרזה בלי להפעיל רחפן."
        },
        {
            "minutes": "30–40",
            "title": "WiFi Handshake",
            "teacher": "מוביל School WiFi → פתיחת DroneBlocks Code → טעינת Meeting4_GasScan_Loops_JS → מעבר ל־TELLO WiFi → בדיקת סוללה.",
            "students": "מבצעים לפי צ׳קליסט ולא מדלגים שלבים."
        },
        {
            "minutes": "40–50",
            "title": "Pre‑Flight Check",
            "teacher": "בודק עם כל צוות: מגיני פרופלורים, פרופלורים חופשיים, סוללה קליק, נורת סטטוס, Abort, קו בטיחות.",
            "students": "מסמנים כל סעיף לפני קבלת אישור טיסה."
        },
        {
            "minutes": "50–68",
            "title": "סבבי טיסה ראשונים",
            "teacher": "מנהל צוות אחד/מעט צוותים בכל פעם באזור הטיסה; מאשר Launch Mission קצר בלבד.",
            "students": "Safety Observer מציב ומכריז, Driver מריץ, Navigator רושם סטייה."
        },
        {
            "minutes": "68–78",
            "title": "כיול מבוקר",
            "teacher": "מנחה שינוי פרמטר אחד בלבד — distance או sleep — לפי מדידת הסטייה.",
            "students": "מתקנים גרסה וממתינים לסבב חוזר אם הזמן מאפשר."
        },
        {
            "minutes": "78–85",
            "title": "Save + Share סופי",
            "teacher": "מוביל חזרה ל־School WiFi, שמירה בשם Meeting5_Physical_Box_Calibrated ו־Share Link.",
            "students": "שומרים, משתפים ומתעדים סטייה/כיול."
        },
        {
            "minutes": "85–90",
            "title": "תחזוקה ואחסון",
            "teacher": "מפקח על כיבוי רחפנים, הוצאת סוללות לקופסת ריקות, החזרת רחפנים וטאבלטים.",
            "students": "מסיימים רפלקציה קצרה ומחזירים ציוד."
        }
    ],
    "exercises": [
        {
            "minutes": "0–6",
            "title": "קוד מוכן לטיסה?",
            "prompt": "סמנו בקוד שיעור 4: distance, sleep, for loop ו־land.",
            "check": "כל פרמטר בטיחותי מזוהה לפני טיסה."
        },
        {
            "minutes": "6–12",
            "title": "פער סימולציה למציאות",
            "prompt": "כתבו גורם פיזי אחד שלא קיים בסימולטור ועלול להשפיע על הריבוע.",
            "check": "מוזכרים רוח/רצפה/VPS/סוללה/WiFi/אינרציה."
        },
        {
            "minutes": "20–30",
            "title": "Role Drill",
            "prompt": "כל צוות מציג מי Driver, מי Navigator ומי Safety Observer ומה האחריות שלו.",
            "check": "Driver יודע Abort; Observer מכריז; Navigator מודד."
        },
        {
            "minutes": "30–40",
            "title": "WiFi Handshake Checklist",
            "prompt": "בצעו School WiFi → Load code → TELLO WiFi → Battery visible.",
            "check": "הצוות לא דילג על טעינת קוד לפני TELLO WiFi."
        },
        {
            "minutes": "40–50",
            "title": "Pre‑Flight Gate",
            "prompt": "הראו למדריך מגינים, פרופלורים חופשיים, סוללה נעולה, קו בטיחות ו־Abort מוכן.",
            "check": "אין אישור טיסה בלי כל הסעיפים."
        },
        {
            "minutes": "50–68",
            "title": "Physical Box Run",
            "prompt": "הריצו ריבוע פיזי קצר באישור מדריך ורשמו נחיתה בפועל.",
            "check": "הטיסה בוצעה באזור סטרילי או נעצרה בבטחה."
        },
        {
            "minutes": "50–68",
            "title": "Drift Log",
            "prompt": "מדדו סטייה בסנטימטרים/אינצ׳ים מנקודת הנחיתה הרצויה.",
            "check": "יש מספר מדידה ולא רק התרשמות."
        },
        {
            "minutes": "68–78",
            "title": "One‑Parameter Calibration",
            "prompt": "שנו רק distance או sleep והסבירו למה בחרתם בו.",
            "check": "לא שונו כמה פרמטרים יחד."
        },
        {
            "minutes": "78–85",
            "title": "Final Save",
            "prompt": "חזרו ל־School WiFi ושמרו Meeting5_Physical_Box_Calibrated עם Share Link.",
            "check": "יש קישור או תיעוד בעיית רשת."
        },
        {
            "minutes": "85–90",
            "title": "Battery Protocol",
            "prompt": "כבה רחפן, הוצא סוללה, העבר לקופסת ריקות והחזר ציוד.",
            "check": "אין סוללה מאוחסנת בתוך הרחפן."
        }
    ],
    "deliverable": "Meeting5_Physical_Box_Calibrated: גרסת קוד ריבוע פיזי מכוילת, Share Link, Drift Log עם סטייה נמדדת, וציון איזה פרמטר כויל — distance או sleep.",
    "assessment": [
        "הצוות ביצע WiFi Handshake בסדר הנכון.",
        "הצוות עבר Pre‑Flight Check מלא לפני כל הרצה פיזית.",
        "תפקידי Driver/Navigator/Safety Observer היו ברורים והופעלו בפועל.",
        "הטיסה בוצעה רק בתוך Safe Fly Zone ובאישור מדריך.",
        "הצוות ידע מתי ואיך להשתמש ב־Abort או לעצור משימה.",
        "הצוות מדד Drift ונמנע משינוי כמה פרמטרים יחד.",
        "הצוות שמר Meeting5_Physical_Box_Calibrated והחזיר סוללות לפי נוהל שתי קופסאות."
    ],
    "debugging": [
        {
            "problem": "הרחפן ממריא ומיד נוחת או לא עולה",
            "fix": "להחליף לסוללה מלאה מקופסת 100%, לוודא קליק ונעילה מלאה של הסוללה."
        },
        {
            "problem": "נורת Tello מהבהבת אדום מהיר",
            "fix": "לכבות, לתת לרחפן להתקרר 2 דקות, ולהדליק רק סמוך לסבב הטיסה."
        },
        {
            "problem": "סטייה חדה הצידה מיד בהמראה",
            "fix": "לעצור/Abort, לבדוק פרופלורים CW/CCW, לכלוך או שערות בצירי המנוע."
        },
        {
            "problem": "הטאבלט לא רואה את הרחפן",
            "fix": "לוודא מעבר מ־School WiFi ל־TELLO-XXXXXX ושחוזרים לאפליקציה אחרי החיבור."
        },
        {
            "problem": "הקוד הישן לא נטען אחרי מעבר ל־TELLO WiFi",
            "fix": "לחזור ל־School WiFi, לטעון מהענן, ואז לעבור שוב ל־TELLO WiFi."
        },
        {
            "problem": "הרחפן נסחף לאט בגלל רצפה/מזגן",
            "fix": "למדוד סטייה, לקצר distance או להאריך sleep — פרמטר אחד בלבד בכל סבב."
        },
        {
            "problem": "תלמיד נכנס לאזור הטיסה",
            "fix": "עצירה מיידית, מנועים כבויים, רענון חוק אזור סטרילי לפני המשך."
        }
    ],
    "differentiation": {
        "support": [
            "לתת לצוותים מתקשים לבצע רק takeoff → sleep → land פיזי קצר לפני ריבוע מלא.",
            "להשתמש בריבוע קטן יותר או distance נמוך יותר אם הכיתה צפופה.",
            "לתת טופס צ׳קליסט מודפס לתפקיד Safety Observer."
        ],
        "extension": [
            "לבצע סבב כיול שני ולהשוות Drift לפני/אחרי.",
            "לחשב אחוז שיפור סטייה אחרי שינוי distance/sleep.",
            "להוסיף הערת // Calibration note בקוד שמסבירה את שינוי הפרמטר."
        ]
    },
    "instructorGuide": {
        "prerequisites": "שיעורים 1–4 הסתיימו בסימולטור בלבד. שיעור 5 הוא שער פיזי ראשון ולכן המטרה אינה להספיק הרבה טיסות אלא לבסס תרבות בטיחות, תפקידי צוות, WiFi Handshake, מדידה וכיול.",
        "pedagogy": [
            "להדגיש שהמעבר למציאות אינו ‘כישלון של הסימולטור’ אלא שלב הנדסי צפוי: מודדים, מכיילים ומשפרים.",
            "בטיחות קודמת לתוצר: צוות שלא עומד בצ׳קליסט לא מטיס גם אם הקוד מושלם.",
            "להתייחס ל־Abort כסימן למקצועיות, לא ככישלון. החלטת עצירה נכונה מצילה ציוד ובטיחות.",
            "להחזיק את הריבוע קטן ומבוקר; זה לא מופע ראווה אלא Integrated Flight Test.",
            "להקפיד על שינוי פרמטר אחד בלבד כדי שהתלמידים ילמדו כיול אמיתי ולא ניחוש."
        ],
        "facilitationNotes": [
            "לא להפעיל כמה רחפנים במקביל אם אין שליטה מלאה בכיתה ובאזורי טיסה נפרדים.",
            "מומלץ שהמדריך יאשר כל Launch Mission בקול לפני Driver לוחץ.",
            "להרחיק רחפנים דולקים מהשולחן לזמן ממושך כדי למנוע התחממות.",
            "אם הכיתה לא עומדת בבטיחות, לעצור טיסות ולעבור לניתוח וידאו/סימולטור; לא להתפשר.",
            "בסיום לבדוק פיזית שאין סוללות בתוך הרחפנים לפני אחסון."
        ],
        "mediaNote": "סרטון SpaceX Static Fire/Integrated Flight Test הוא השראה קצרה בלבד; לא לתת לו לגזול זמן בטיחות ו־Pre‑Flight.",
        "exitTicket": "הכיול שעשינו היה ___ כי המדידה הראתה ___."
    },
    "appWorkflowTitle": "DroneBlocks Code — Physical Box Calibration",
    "appWorkflowNote": "מפגש 5 כולל טיסה פיזית ראשונה. מריצים רק לאחר WiFi Handshake, Pre‑Flight Check, תפקידי צוות, Safe Fly Zone, משקפי מגן ואישור מדריך.",
    "appWorkflow": [
        {
            "title": "School WiFi: Load code",
            "detail": "פתחו DroneBlocks Code על WiFi בית ספרי וטענו Meeting4_GasScan_Loops_JS מהענן."
        },
        {
            "title": "TELLO WiFi: Connect drone",
            "detail": "עברו לרשת TELLO-XXXXXX של הרחפן, חזרו לאפליקציה וודאו שהסוללה מזוהה."
        },
        {
            "title": "Pre‑Flight Safety Gate",
            "detail": "מגיני פרופלורים, פרופלורים חופשיים, סוללה בקליק, Abort ידוע, משקפי מגן ואזור סטרילי."
        },
        {
            "title": "Role Callout",
            "detail": "Safety Observer מציב את הרחפן ומכריז ‘צוות X ממריא!’ רק אחרי שכולם מאחורי הקו."
        },
        {
            "title": "Launch + Measure",
            "detail": "Driver מריץ Launch Mission באישור מדריך; Navigator מודד Drift וממלא Log."
        },
        {
            "title": "Calibrate + Save",
            "detail": "משנים distance או sleep בלבד, חוזרים ל־School WiFi, שומרים Meeting5_Physical_Box_Calibrated ומשתפים."
        }
    ],
    "visualDiagram": {
        "panelTitle": "🚀 Physical Box Calibration",
        "chip": "Physical Flight Gate",
        "title": "אזור טיסה סטרילי ונוהל הטסה ראשון",
        "src": "assets/drone-mission-lab-grade8/lesson5/spacex-physical-box-calibration-safe-zone.svg",
        "alt": "תרשים אזור טיסה סטרילי עם מסלול ריבוע פיזי, תפקידי צוות, מרחק בטיחות, נוהל WiFi וסוללות",
        "caption": "שיעור 5 מעביר את קוד הריבוע מהסימולטור לרחפן Tello פיזי: קודם בטיחות ותפקידים, אחר כך הרצה קצרה, מדידת Drift וכיול פרמטר אחד."
    },
    "videoResources": [
        {
            "title": "SpaceX static fire integrated flight test — search suggestion",
            "url": "https://www.youtube.com/results?search_query=SpaceX+static+fire+integrated+flight+test",
            "note": "סרטון השראה קצר על בדיקות מערכת לפני טיסה."
        },
        {
            "title": "DJI Tello propeller guards safety setup — fallback",
            "url": "https://www.youtube.com/results?search_query=DJI+Tello+propeller+guards+safety+setup",
            "note": "חלופה מעשית לבטיחות והכנת רחפן."
        }
    ],
    "screenshotSlides": [
        {
            "title": "Physical Box Calibration",
            "src": "assets/drone-mission-lab-grade8/lesson5/spacex-physical-box-calibration-safe-zone.svg",
            "caption": "מלבן טיסה סטרילי, תפקידי צוות, Abort ונוהל סוללות."
        },
        {
            "title": "פותחים DroneBlocks Code",
            "src": "assets/tello-mission-lab/lesson1/open-app.png",
            "caption": "WiFi בית ספרי וטעינת Meeting4_GasScan_Loops_JS מהענן."
        },
        {
            "title": "Connect to Tello WiFi",
            "src": "assets/drone-mission-lab-grade8/lesson5/tello-wifi-handshake.svg",
            "caption": "מעבר מבוקר לרשת TELLO-XXXXXX לפני הרצה פיזית."
        },
        {
            "title": "Save & Share Calibrated Version",
            "src": "assets/tello-mission-lab/lesson1/save-share.png",
            "caption": "חזרה ל־WiFi בית ספרי ושמירת Meeting5_Physical_Box_Calibrated."
        }
    ],
    "instructorSlides": [
        {
            "title": "SpaceX Integrated Flight Test",
            "body": "אחרי ארבעה מפגשי סימולטור, הקוד פוגש רחפן פיזי. המטרה: בדיקה מבוקרת, לא מופע ראווה.",
            "bullets": [
                "Physical flight",
                "Controlled test",
                "Safety first"
            ]
        },
        {
            "title": "Sim‑to‑Reality Gap",
            "body": "רוח מזגן, VPS, רצפה, סוללה ו־WiFi משנים את תוצאות הטיסה ביחס לסימולטור.",
            "bullets": [
                "drift",
                "VPS",
                "battery"
            ]
        },
        {
            "title": "תפקידי צוות",
            "body": "Driver מריץ ו־Abort, Navigator בודק ומודד, Safety Observer מציב ומכריז.",
            "bullets": [
                "Driver",
                "Navigator",
                "Observer"
            ]
        },
        {
            "title": "WiFi Handshake",
            "body": "School WiFi לטעינת קוד, ואז TELLO WiFi להרצה פיזית. לא מדלגים שלבים.",
            "bullets": [
                "School WiFi",
                "Load code",
                "TELLO WiFi"
            ]
        },
        {
            "title": "Pre‑Flight Gate",
            "body": "מגינים, פרופלורים, סוללה, נורת סטטוס, משקפיים, אזור סטרילי ו־Abort מוכנים.",
            "bullets": [
                "prop guards",
                "goggles",
                "Abort"
            ]
        },
        {
            "title": "Physical Box Run",
            "body": "מריצים ריבוע קצר, מודדים סטיית נחיתה, ולא משנים יותר מפרמטר אחד בכל סבב.",
            "bullets": [
                "Launch",
                "Measure drift",
                "Calibrate"
            ]
        },
        {
            "title": "Battery Protocol",
            "body": "בסיום: כיבוי, הוצאת סוללה, קופסת ריקות, אין אחסון סוללה בתוך הרחפן.",
            "bullets": [
                "power off",
                "empty box",
                "no stored battery"
            ]
        }
    ]
}
);


  Object.assign(window.DRONE_MISSION_LAB_GRADE8_LESSONS[5], {
    "title": "שיעור 6: AeroRescue Grid Search — סריקה וחיפוש בזיגזג ב־JavaScript",
    "subtitle": "Grid Navigation & Search, S‑Curve, scanDist/stepDist, Blind Spots, Simulator first + controlled physical flight",
    "unit": "יחידה 2 — רחפנים, צילום ומשימות חקר ב־JavaScript",
    "concept": "Grid Navigation & Search — אלגוריתם סריקת רשת לחיפוש והצלה: כיסוי שטח שיטתי, זיגזג, משתני מרחק, לולאות וכיול פיזי",
    "story": "בעקבות רעידת אדמה באזור הררי מבודד, צוותי חילוץ קרקעיים אינם יכולים להגיע לשטח. התלמידים פועלים כצוותי חילוץ וסיוע אווירי בחברת AeroRescue. עליהם לתכנת ב־JavaScript אלגוריתם Grid Search שיטיס את הרחפן בנתיב S‑Curve מעל אזור האסון, יעבור מעל כרטיסיות נפגעים, ימנע שטחים מתים ויאפשר לצוותי הרפואה לדעת אילו נקודות אותרו.",
    "mission": "ליצור פרויקט Meeting6_GridSearch_JS ב־DroneBlocks Code, לתכנן אלגוריתם זיגזג עם let scanDist = 80 ו־let stepDist = 40, להריץ תחילה ב־Minimal Grid/City Simulator לבדיקת סינטקס, ואז — רק באישור מדריך ולאחר Pre‑Flight מלא — להריץ סריקה פיזית קצרה באזור Safe Fly Zone עם כרטיסיות נפגעים. הנווט מתעד אילו כרטיסיות אותרו, והצוות מכייל רק scanDist או stepDist לפני שמירה סופית בשם Meeting6_GridSearch_Success.",
    "commands": [
        "grid_search",
        "scurve",
        "scanDist",
        "stepDist",
        "takeoff",
        "sleep",
        "flyForward",
        "flyRight",
        "flyBackward",
        "flyLeft",
        "for_loop",
        "survivor_cards",
        "blind_spots",
        "wifi_handshake",
        "preflight",
        "peer_roles",
        "abort",
        "battery_protocol",
        "share"
    ],
    "blocks": [
        "grid_search",
        "scurve",
        "scanDist",
        "stepDist",
        "takeoff",
        "sleep",
        "flyForward",
        "flyRight",
        "flyBackward",
        "flyLeft",
        "for_loop",
        "survivor_cards",
        "blind_spots",
        "wifi_handshake",
        "preflight",
        "peer_roles",
        "abort",
        "battery_protocol",
        "share"
    ],
    "workspaceMode": "physical-drone",
    "physicalFlightAllowed": true,
    "essentialQuestion": "איך מתכננים סריקת שטח שיטתית שמכסה כמה שיותר אזור בלי לבזבז סוללה ובלי ליצור שטחים מתים?",
    "successCriteria": [
        "אני מסביר/ה למה חיפוש אקראי פחות יעיל מ־Grid Search שיטתי.",
        "אני כותב/ת ומשתמש/ת במשתנים scanDist ו־stepDist לשליטה במסלול הזיגזג.",
        "אני מזהה איך stepDist גדול מדי יוצר Blind Spots.",
        "אני מריץ/ה את הקוד בסימולטור לפני כל ניסיון פיזי.",
        "אני מבצע/ת WiFi Handshake ו־Pre‑Flight Check לפני טיסה פיזית.",
        "אני עובד/ת בתפקיד Driver/Navigator/Safety Observer ושומר/ת על Safe Fly Zone.",
        "אני מתעד/ת אילו כרטיסיות נפגעים אותרו ושומר/ת Meeting6_GridSearch_Success."
    ],
    "realWorldUses": [
        {
            "icon": "🚑",
            "title": "חיפוש והצלה",
            "text": "רחפנים מכסים אזורים מסוכנים במהירות ומזהים ניצולים לפני כניסת צוותים קרקעיים."
        },
        {
            "icon": "🗺️",
            "title": "כיסוי שטח",
            "text": "Grid Search מונע סריקה אקראית ומקטין סיכוי לפספס אזורים."
        },
        {
            "icon": "🔋",
            "title": "חיסכון בסוללה",
            "text": "נתיב שיטתי מקצר זמן טיסה ומפחית תמרונים מיותרים."
        },
        {
            "icon": "📏",
            "title": "כיול שורות",
            "text": "stepDist קובע את המרחק בין שורות הסריקה ולכן משפיע ישירות על Blind Spots."
        }
    ],
    "vocabulary": [
        [
            "Grid Search",
            "אלגוריתם חיפוש שמחלק אזור לשורות/רשת ומכסה אותו באופן שיטתי."
        ],
        [
            "S‑Curve / Zigzag",
            "דפוס תנועה: קדימה, חיתוך צד, אחורה, חיתוך צד וחוזר חלילה."
        ],
        [
            "scanDist",
            "משתנה שמגדיר את אורך כל שורת סריקה."
        ],
        [
            "stepDist",
            "משתנה שמגדיר את המרחק בין שורות הסריקה."
        ],
        [
            "Blind Spots",
            "אזורים שלא נסרקו בגלל רווח גדול מדי בין שורות או מסלול לא מדויק."
        ],
        [
            "Survivor Cards",
            "כרטיסיות נפגעים שמדמות נקודות עניין/ניצולים באזור האסון."
        ],
        [
            "Systematic Scan",
            "חיפוש מסודר לפי דפוס קבוע במקום תנועה אקראית."
        ],
        [
            "Connection Timeout",
            "שגיאת חיבור לרחפן כאשר הטאבלט לא מחובר ל־TELLO WiFi יציב."
        ],
        [
            "Auto‑Join",
            "אפשרות בטאבלט שעלולה להחזיר אותו אוטומטית ל־WiFi בית ספרי ולנתק את הרחפן."
        ]
    ],
    "safetyRules": [
        "טיסה פיזית בשיעור 6 מותרת רק אחרי הרצה בסימולטור ואישור מדריך.",
        "כללי שיעור 5 נשארים חובה: Safe Fly Zone, משקפי מגן, שיער אסוף, מגיני פרופלורים ו־Abort מוכן.",
        "לא מפעילים כמה רחפנים באותו Safe Fly Zone בו־זמנית.",
        "Driver לא לוחץ Launch Mission לפני הכרזת Safety Observer: ‘צוות X ממריא!’. ",
        "Navigator מתעד מטרות וסטיות מבחוץ בלבד; אין כניסה לאזור הטיסה כשהמנועים מסתובבים.",
        "אם הרחפן מפספס כרטיסיות, מכיילים scanDist או stepDist בלבד — לא מאלתרים מסלול מסוכן בזמן אמת.",
        "Connection Timeout או ניתוק WiFi עוצרים את הסבב; לא רודפים אחרי הרחפן ולא נכנסים לאזור סטרילי.",
        "בסיום מוציאים סוללות ומעבירים לקופסת ריקות 0%."
    ],
    "commonDirections": [
        [
            "let scanDist = 80;",
            "אורך שורת סריקה קדימה/אחורה."
        ],
        [
            "let stepDist = 40;",
            "חיתוך צד בין שורות כדי לכסות תא שטח."
        ],
        [
            "tello.flyForward(scanDist);",
            "שורה 1 בסריקה."
        ],
        [
            "tello.flyRight(stepDist);",
            "מעבר לשורה הבאה."
        ],
        [
            "tello.flyBackward(scanDist);",
            "שורה 2 בכיוון ההפוך."
        ],
        [
            "tello.flyLeft(stepDist);",
            "מעבר חזרה בדפוס זיגזג מורחב."
        ],
        [
            "for loop bonus",
            "חזרה על דפוס הזיגזג כדי לקצר קוד."
        ],
        [
            "Meeting6_GridSearch_Success",
            "שם גרסת ההגשה הסופית."
        ]
    ],
    "setupSteps": [
        "טאבלטים טעונים 100% עם DroneBlocks Code וחשבונות פעילים.",
        "רחפני Tello/Tello EDU עם מגיני פרופלורים מותקנים וצוותים של 3.",
        "Safe Fly Zone מסומן בסרט צבעוני ומרחק צוות ברור.",
        "משקפי מגן, שיער אסוף ונוהל שתי קופסאות סוללות.",
        "שלוש כרטיסיות נפגעים מודפסות וממוקמות על רצפת מלבן הטיסה.",
        "סרט מדידה/טופס Target Log לתיעוד כרטיסיות שאותרו ושטחים מתים.",
        "מקרן להצגת דפוס S‑Curve וקוד scanDist/stepDist."
    ],
    "tabletTips": [
        "פותחים Meeting6_GridSearch_JS על WiFi בית ספרי ושומרים לפני מעבר ל־TELLO WiFi.",
        "בודקים בסימולטור שאין שגיאות סינטקס לפני טיסה פיזית.",
        "אם ה־Tello לא מגיב, בדקו שהטאבלט לא חזר אוטומטית ל־School WiFi.",
        "התחילו בערכים קטנים ובטוחים אם הכיתה צפופה; scanDist/stepDist הם נקודות כיול.",
        "תיעוד מטרות חשוב כמו הטיסה עצמה — Navigator צריך לרשום מה באמת נסרק.",
        "שומרים את הגרסה הסופית רק אחרי חזרה ל־School WiFi."
    ],
    "lessonFlow": [
        {
            "minutes": "0–6",
            "title": "בדיקת תנאי קדם משיעור 5",
            "teacher": "מזכיר WiFi Handshake, Pre‑Flight, תפקידים, Abort ומדידת סטייה. היום מוסיפים חיפוש שיטתי ולא רק ריבוע.",
            "students": "מונים את שלושת תפקידי הצוות ואת אחריותם."
        },
        {
            "minutes": "6–16",
            "title": "PBL — AeroRescue אחרי רעידת אדמה",
            "teacher": "מציג אזור אסון, כרטיסיות נפגעים וצורך לכסות שטח בלי Blind Spots.",
            "students": "מסבירים למה חיפוש אקראי מסוכן/בזבזני."
        },
        {
            "minutes": "16–20",
            "title": "מושג Grid Search",
            "teacher": "מדגים זיגזג: קדימה, חיתוך צד, אחורה. מחבר לסוללה ולכיסוי 100%. ",
            "students": "מסמנים מהו scanDist ומהו stepDist בתרשים."
        },
        {
            "minutes": "20–35",
            "title": "תכנון קוד בטאבלט",
            "teacher": "מוביל פתיחת Meeting6_GridSearch_JS והצגת קוד בסיס עם scanDist/stepDist.",
            "students": "כותבים גרסה דו־שורתית ומוסיפים sleep בין תנועות."
        },
        {
            "minutes": "35–45",
            "title": "סימולטור תחילה",
            "teacher": "מנחה הרצה ב־Minimal Grid/City Simulator ובדיקת סינטקס לפני פיזי.",
            "students": "מריצים ומתקנים flyRight/flyLeft או ערכי מרחק."
        },
        {
            "minutes": "45–52",
            "title": "בונוס לולאה / Code Review",
            "teacher": "לקבוצות מתקדמות: for loop שחוזר על דפוס הזיגזג. לכל הצוותים: בדיקת בטיחות קוד.",
            "students": "מגישים קוד לאישור לפני מעבר פיזי."
        },
        {
            "minutes": "52–62",
            "title": "Pre‑Flight + WiFi Handshake",
            "teacher": "מנהל מעבר School WiFi → TELLO WiFi, בדיקת סוללה, מגינים, Abort וכרטיסיות נפגעים באזור.",
            "students": "מבצעים צ׳קליסט תפקידים ובטיחות."
        },
        {
            "minutes": "62–78",
            "title": "סבבי סריקה פיזיים",
            "teacher": "מאשר צוותים אחד־אחד להרצת S‑Curve קצרה באזור סטרילי.",
            "students": "Observer מכריז, Driver מריץ, Navigator רושם אילו כרטיסיות אותרו."
        },
        {
            "minutes": "78–84",
            "title": "כיול Blind Spots",
            "teacher": "מוביל דיון קצר: אם פספסנו כרטיסייה, האם לשנות scanDist או stepDist?",
            "students": "משנים פרמטר אחד ומסבירים למה."
        },
        {
            "minutes": "84–90",
            "title": "Save + תחזוקה",
            "teacher": "מנחה חזרה ל־School WiFi, שמירה Meeting6_GridSearch_Success, Share Link, הוצאת סוללות ואחסון.",
            "students": "שומרים, משתפים ומחזירים ציוד."
        }
    ],
    "exercises": [
        {
            "minutes": "0–6",
            "title": "Safety Recall",
            "prompt": "כתבו את שלושת התפקידים ומי אחראי על Abort.",
            "check": "Driver/Abort, Navigator/Log, Observer/Safety מופיעים."
        },
        {
            "minutes": "6–16",
            "title": "Blind Spot Prediction",
            "prompt": "סמנו בתרשים איפה עלול להיווצר שטח מת אם stepDist גדול מדי.",
            "check": "התלמיד מחבר רווח בין שורות לאזור שלא נסרק."
        },
        {
            "minutes": "20–35",
            "title": "קוד זיגזג בסיסי",
            "prompt": "כתבו scanDist, stepDist, flyForward, flyRight, flyBackward ו־land.",
            "check": "הקוד כולל משתנים ושתי שורות סריקה."
        },
        {
            "minutes": "35–45",
            "title": "Simulator Gate",
            "prompt": "הריצו בסימולטור ותקנו שגיאת סינטקס אחת אם קיימת.",
            "check": "אין מעבר פיזי לפני Run בסימולטור."
        },
        {
            "minutes": "45–52",
            "title": "Bonus Loop",
            "prompt": "נסו לכתוב for loop שחוזר על דפוס זיגזג פעמיים.",
            "check": "יש ניסיון לולאה או הסבר למה הקבוצה נשארה בגרסה ידנית."
        },
        {
            "minutes": "52–62",
            "title": "Pre‑Flight Gate",
            "prompt": "הראו למדריך TELLO WiFi, סוללה, מגינים, משקפיים, Abort וכרטיסיות באזור.",
            "check": "כל הסעיפים מאושרים לפני Launch."
        },
        {
            "minutes": "62–78",
            "title": "Physical Grid Run",
            "prompt": "הריצו סריקה פיזית קצרה ותעדו אילו כרטיסיות עברתם מעליהן.",
            "check": "Target Log כולל א/ב/ג שאותרו או פוספסו."
        },
        {
            "minutes": "78–84",
            "title": "One‑Parameter Search Calibration",
            "prompt": "בחרו scanDist או stepDist לשינוי והסבירו איך זה ישפיע על Blind Spots.",
            "check": "הנימוק מחבר מרחק שורות לכיסוי שטח."
        },
        {
            "minutes": "84–90",
            "title": "Final Share + Maintenance",
            "prompt": "שמרו Meeting6_GridSearch_Success, שתפו קישור, הוציאו סוללות לקופסת ריקות.",
            "check": "יש Share Link או תיעוד תקלה, ואין סוללה ברחפן."
        }
    ],
    "deliverable": "Meeting6_GridSearch_Success: קוד Grid Search ב־JavaScript עם scanDist/stepDist, Target Log של כרטיסיות נפגעים שאותרו, כיול אחד למניעת Blind Spots, ו־Share Link למדריך.",
    "assessment": [
        "התלמיד מסביר למה Grid Search עדיף על חיפוש אקראי.",
        "הקוד כולל scanDist ו־stepDist ומשתמש בהם בתנועה.",
        "הקוד כולל flyForward/flyRight/flyBackward ולפי הרחבה גם flyLeft או לולאה.",
        "הצוות עבר Simulator Gate לפני טיסה פיזית.",
        "הצוות פעל בתפקידי Driver/Navigator/Safety Observer ושמר על Safe Fly Zone.",
        "הנווט תיעד כרטיסיות נפגעים שאותרו/פוספסו.",
        "הצוות כייל פרמטר אחד בלבד ושמר Meeting6_GridSearch_Success."
    ],
    "debugging": [
        {
            "problem": "Connection Timeout באפליקציה",
            "fix": "לבדוק שהטאבלט מחובר ל־TELLO WiFi ולא חזר אוטומטית ל־School WiFi; לבטל Auto‑Join לבית הספר בזמן סבב."
        },
        {
            "problem": "הזיגזג פונה לכיוונים הפוכים",
            "fix": "לבדוק flyRight/flyLeft. בסריקה תקינה המעברים הצדיים צריכים להתאים לכיוון השורה הבאה."
        },
        {
            "problem": "כרטיסייה לא אותרה למרות שהרחפן טס",
            "fix": "לבדוק stepDist: ייתכן שהרווח בין השורות גדול מדי ונוצר Blind Spot."
        },
        {
            "problem": "המסלול ארוך מדי לכיתה",
            "fix": "להקטין scanDist או stepDist לפי ממדי Safe Fly Zone, באישור מדריך."
        },
        {
            "problem": "הרחפן נסחף ומפספס את השורה",
            "fix": "להוסיף sleep קצר, להקטין מהירות/מרחק, ולבדוק VPS/רצפה/מזגן."
        },
        {
            "problem": "Share Link לא נוצר אחרי טיסה",
            "fix": "לחזור ל־School WiFi, לשמור Meeting6_GridSearch_Success ואז ליצור Device/Desktop Share Link."
        }
    ],
    "differentiation": {
        "support": [
            "לתת שלד קוד דו־שורות ללא לולאה ולבקש להשלים רק scanDist/stepDist.",
            "לבצע פיזית רק סריקה קצרה של שתי שורות במקום כל הזירה.",
            "לתת טופס Target Log עם סימון א/ב/ג במקום כתיבה חופשית."
        ],
        "extension": [
            "לכתוב for loop שמבצע דפוס זיגזג פעמיים ומקצר את הקוד.",
            "להשוות Target Log לפני/אחרי שינוי stepDist ולנסח המלצת כיול.",
            "לחשב אחוז כיסוי משוער לפי מספר כרטיסיות שאותרו מתוך 3."
        ]
    },
    "instructorGuide": {
        "prerequisites": "שיעור 6 נשען על שיעור 4 בלולאות ומשתנים ועל שיעור 5 בטיסה פיזית ראשונה. לא להתחיל סבבים פיזיים לפני שהכיתה מוכיחה שליטה ב־WiFi Handshake, Pre‑Flight ותפקידי צוות.",
        "pedagogy": [
            "להדגיש שסריקה שיטתית היא חשיבה הנדסית: לא מחפשים ‘בערך’, מכסים שטח לפי דפוס.",
            "stepDist הוא מושג מפתח: קטן מדי מבזבז סוללה, גדול מדי יוצר Blind Spots.",
            "החלק הפיזי אינו חובה לכל צוות אם התנאים לא בטוחים; סימולטור וניתוח Target Log עדיין משיגים את המטרה.",
            "לשמור על מודל שינוי פרמטר אחד בלבד כדי לפתח כיול מבוסס ראיות.",
            "להציג Navigator כתפקיד חקר אמיתי: הוא לא ‘מחכה’, הוא אוסף נתוני איתור."
        ],
        "facilitationNotes": [
            "מקמו את שלוש הכרטיסיות כך שהן יבדקו את איכות stepDist ולא רק את אורך scanDist.",
            "אם יש צפיפות בכיתה, הפעילו צוות אחד בכל פעם ושאר הצוותים עושים Code Review/Target Prediction.",
            "אל תאפשרו Auto‑Join חזרה לבית הספר בזמן חיבור ל־Tello; זו סיבה שכיחה ל־Connection Timeout.",
            "אם הכיתה מאבדת משמעת באזור הטיסה, עצרו טיסות ועברו לסימולטור."
        ],
        "mediaNote": "סרטון DJI/Flyability Search & Rescue הוא השראה בלבד. עדיף לשמור זמן לסימולטור ולשער בטיחות פיזי.",
        "exitTicket": "אם stepDist גדול מדי, יקרה ___ ולכן אכייל אותו ל־___."
    },
    "appWorkflowTitle": "DroneBlocks Code — AeroRescue Grid Search",
    "appWorkflowNote": "מפגש 6 משלב סימולטור וטיסה פיזית מבוקרת. קודם בודקים קוד בסימולטור; פיזי רק אחרי WiFi Handshake, Pre‑Flight, תפקידים, Safe Fly Zone ואישור מדריך.",
    "appWorkflow": [
        {
            "title": "School WiFi + Project",
            "detail": "פתחו DroneBlocks Code וצרו Meeting6_GridSearch_JS."
        },
        {
            "title": "Build S‑Curve Code",
            "detail": "כתבו let scanDist = 80; let stepDist = 40; ואז flyForward, flyRight, flyBackward עם sleep."
        },
        {
            "title": "Simulator Gate",
            "detail": "הריצו ב־Minimal Grid/City Simulator ובדקו שאין שגיאות סינטקס או מרחקים גדולים מדי."
        },
        {
            "title": "Physical Safety Gate",
            "detail": "עברו ל־TELLO WiFi, בדקו סוללה, מגינים, משקפיים, Abort, תפקידים וכרטיסיות נפגעים."
        },
        {
            "title": "Run + Target Log",
            "detail": "הריצו סריקה קצרה באישור מדריך; Navigator ממלא Target Log ומתעד אילו כרטיסיות עברתם מעליהן."
        },
        {
            "title": "Calibrate + Share",
            "detail": "שנו scanDist או stepDist בלבד, שמרו Meeting6_GridSearch_Success על School WiFi ושתפו קישור."
        }
    ],
    "visualDiagram": {
        "panelTitle": "🚑 AeroRescue Grid Search",
        "chip": "Search + Physical Gate",
        "title": "סריקת זיגזג לאיתור כרטיסיות נפגעים",
        "src": "assets/drone-mission-lab-grade8/lesson6/aerorescue-grid-search-scurve.svg",
        "alt": "תרשים סריקת Grid Search בזיגזג עם scanDist, stepDist, כרטיסיות נפגעים, תפקידי צוות ואזור טיסה בטוח",
        "caption": "שיעור 6 בונה אלגוריתם חיפוש שיטתי: סריקה קדימה, חיתוך צד, סריקה אחורה ותיעוד מטרות — קודם בסימולטור ואז פיזית רק דרך שער בטיחות."
    },
    "videoResources": [
        {
            "title": "DJI drone search and rescue earthquake — search suggestion",
            "url": "https://www.youtube.com/results?search_query=DJI+drone+search+and+rescue+earthquake",
            "note": "סרטון השראה על רחפנים לחיפוש והצלה."
        },
        {
            "title": "Flyability Elios 3 search rescue inspection — fallback",
            "url": "https://www.youtube.com/results?search_query=Flyability+Elios+3+search+rescue+inspection",
            "note": "חלופה לרחפנים באזורי אסון ומבנים מסוכנים."
        }
    ],
    "screenshotSlides": [
        {
            "title": "AeroRescue Grid Search",
            "src": "assets/drone-mission-lab-grade8/lesson6/aerorescue-grid-search-scurve.svg",
            "caption": "זיגזג S‑Curve, כרטיסיות נפגעים ו־Blind Spots."
        },
        {
            "title": "פותחים DroneBlocks Code",
            "src": "assets/tello-mission-lab/lesson1/open-app.png",
            "caption": "WiFi בית ספרי ופרויקט Meeting6_GridSearch_JS."
        },
        {
            "title": "Simulator Gate",
            "src": "assets/tello-mission-lab/lesson1/simulator-run.png",
            "caption": "בודקים סינטקס לפני מעבר פיזי."
        },
        {
            "title": "WiFi Handshake",
            "src": "assets/drone-mission-lab-grade8/lesson5/tello-wifi-handshake.svg",
            "caption": "טעינת קוד בענן ואז מעבר TELLO WiFi להרצה פיזית."
        },
        {
            "title": "Save & Share",
            "src": "assets/tello-mission-lab/lesson1/save-share.png",
            "caption": "Meeting6_GridSearch_Success ו־Share Link."
        }
    ],
    "instructorSlides": [
        {
            "title": "AeroRescue אחרי רעידת אדמה",
            "body": "המטרה היא לאתר כרטיסיות נפגעים באזור מסוכן בעזרת סריקת רחפן שיטתית.",
            "bullets": [
                "Search & Rescue",
                "Survivor cards",
                "Safety"
            ]
        },
        {
            "title": "למה Grid Search?",
            "body": "חיפוש אקראי מבזבז סוללה ויוצר פספוסים. Grid Search מכסה שטח לפי דפוס.",
            "bullets": [
                "coverage",
                "efficiency",
                "no random flight"
            ]
        },
        {
            "title": "scanDist / stepDist",
            "body": "scanDist קובע אורך שורה; stepDist קובע רווח בין שורות ואת הסיכון ל־Blind Spots.",
            "bullets": [
                "scanDist",
                "stepDist",
                "Blind Spots"
            ]
        },
        {
            "title": "קוד זיגזג בסיסי",
            "body": "flyForward(scanDist), flyRight(stepDist), flyBackward(scanDist). בהמשך אפשר להרחיב בלולאה.",
            "bullets": [
                "forward",
                "right",
                "backward"
            ]
        },
        {
            "title": "Simulator Gate",
            "body": "לא עוברים לטיסה פיזית לפני שהקוד רץ בסימולטור וללא שגיאות סינטקס.",
            "bullets": [
                "syntax",
                "distances",
                "approval"
            ]
        },
        {
            "title": "Physical Search Run",
            "body": "Observer מכריז, Driver מריץ, Navigator רושם אילו מטרות אותרו.",
            "bullets": [
                "roles",
                "Target Log",
                "Abort"
            ]
        },
        {
            "title": "כיול כיסוי שטח",
            "body": "אם פספסנו כרטיסייה, משנים scanDist או stepDist בלבד ומסבירים את ההשפעה.",
            "bullets": [
                "one parameter",
                "evidence",
                "share"
            ]
        }
    ]
}
);


  Object.assign(window.DRONE_MISSION_LAB_GRADE8_LESSONS[6], {
    "title": "שיעור 7: InspeX Autonomous Photo Inspection — שליטה במצלמת הרחפן וצילום חזותי ב־JavaScript",
    "subtitle": "tello.takePhoto(), Motion Blur, sleep stabilization, City Simulator, physical inspection, Data Retrieval",
    "unit": "יחידה 3 — צילום, הצלה ואופטימיזציה",
    "concept": "שליטה במצלמת הרחפן כחיישן חקר מדעי: צילום אוטונומי, ייצוב לפני צילום, פריקת תמונות וניתוח איכות חזותית",
    "story": "חברת החשמל הלאומית מזהה סדקים קטנים ומסוכנים בעמודי תאורה וקווי מתח גבוה. טיפוס טכנאים על עמודים מסוכן ויקר. התלמידים הם מהנדסי בקרה ומיפוי בחברת InspeX: הם מתכנתים רחפן Tello שיבצע סריקת גבהים מדורגת, יתייצב מעל שלוש תחנות תשתית, יצלם כרטיסיות סדקים חדות וברורות, ויחזור לנחיתה כדי שהאנליסטים יוכלו לבדוק את מצב התשתיות מהקרקע.",
    "mission": "ליצור Meeting7_Inspection_JS ב־DroneBlocks Code, ללמוד את tello.takePhoto(), להריץ תחילה אתגר City Simulator שבו הרחפן עולה לגובה 120 אינץ׳ ומצלם 4 תמונות סביב גג אחרי yaw של 90° בכל פעם, ואז — רק אחרי שער בטיחות פיזי — לבצע בדיקת תשתיות בכיתה: שלוש תחנות בגבהים 40/70/100 ס״מ, sleep(2) לפני כל צילום, takePhoto, נחיתה, Data Retrieval והצגת 3 תמונות חדות. אם יש Motion Blur מכיילים sleep ל־3 שניות ושומרים Meeting7_Inspection_Success.",
    "commands": [
        "inspection",
        "takePhoto",
        "motion_blur",
        "data_retrieval",
        "photo_log",
        "city",
        "takeoff",
        "sleep",
        "flyUp",
        "flyForward",
        "yawRight",
        "land",
        "wifi_handshake",
        "preflight",
        "peer_roles",
        "abort",
        "battery_protocol",
        "share"
    ],
    "blocks": [
        "inspection",
        "takePhoto",
        "motion_blur",
        "data_retrieval",
        "photo_log",
        "city",
        "takeoff",
        "sleep",
        "flyUp",
        "flyForward",
        "yawRight",
        "land",
        "wifi_handshake",
        "preflight",
        "peer_roles",
        "abort",
        "battery_protocol",
        "share"
    ],
    "workspaceMode": "physical-drone",
    "physicalFlightAllowed": true,
    "essentialQuestion": "איך הופכים רחפן מכלי טיסה לכלי חקר חזותי שמפיק תמונות חדות, אמינות ושימושיות למהנדסי שטח?",
    "successCriteria": [
        "אני מסביר/ה למה מצלמת הרחפן היא חיישן חקר ולא תוספת קישוטית.",
        "אני משתמש/ת ב־tello.sleep(2) לפני tello.takePhoto() כדי למנוע Motion Blur.",
        "אני כותב/ת tello.takePhoto(); בסינטקס JavaScript תקין וב־CamelCase.",
        "אני מריץ/ה אתגר City Simulator לפני מעבר לטיסה פיזית.",
        "אני מבצע/ת Pre‑Flight, WiFi Handshake ותפקידי צוות לפני צילום פיזי.",
        "אני מוריד/ה תמונות מה־Tello לטאבלט ומציג/ה לפחות 3 תמונות קריאות או Debug Log ברור.",
        "אני שומר/ת Meeting7_Inspection_Success ומשתף/ת קישור."
    ],
    "realWorldUses": [
        {
            "icon": "⚡",
            "title": "בדיקת קווי מתח",
            "text": "רחפנים מצלמים סדקים ופגמים בלי שטכנאים יטפסו על עמודים מסוכנים."
        },
        {
            "icon": "🌉",
            "title": "בדיקת גשרים וטורבינות",
            "text": "צילום אווירי מאפשר לאתר נזק במקומות גבוהים או קשים לגישה."
        },
        {
            "icon": "📷",
            "title": "ראיות חזותיות",
            "text": "התוצר הוא לא רק טיסה מוצלחת אלא תמונה חדה שאפשר לנתח."
        },
        {
            "icon": "🧘",
            "title": "ייצוב לפני צילום",
            "text": "sleep לפני צילום מפחית רעידות וטשטוש ומעלה איכות הדאטה."
        }
    ],
    "vocabulary": [
        [
            "Camera as Sensor",
            "המצלמה היא חיישן שמייצר מידע חזותי לניתוח הנדסי."
        ],
        [
            "tello.takePhoto();",
            "פקודת JavaScript לצילום אוטונומי דרך הרחפן."
        ],
        [
            "Motion Blur",
            "טשטוש שנוצר כשהמצלמה זזה בזמן קליטת התמונה."
        ],
        [
            "Stabilization Sleep",
            "השהיה לפני צילום שמאפשרת לרחפן להגיע לריחוף יציב."
        ],
        [
            "Data Retrieval",
            "פריקת התמונות מה־Tello אל הטאבלט לאחר הנחיתה."
        ],
        [
            "Photo Evidence Log",
            "רישום אילו תמונות צולמו, באיזו תחנה ומה איכותן."
        ],
        [
            "Infrastructure Inspection",
            "בדיקת עמודים, גשרים, טורבינות וקווי מתח בעזרת צילום רחפן."
        ],
        [
            "Yaw Photo Sweep",
            "צילום סביבתי באמצעות פנייה של 90° וצילום בכל כיוון."
        ],
        [
            "Meeting7_Inspection_Success",
            "שם גרסת ההגשה הסופית עם קוד וצילומים."
        ]
    ],
    "safetyRules": [
        "טיסה פיזית בשיעור 7 מותרת רק אחרי אתגר סימולטור, Code Review ואישור מדריך.",
        "כל נהלי שיעור 5–6 נשארים חובה: Safe Fly Zone, משקפי מגן, שיער אסוף, מגיני פרופלורים, Abort ותפקידי צוות.",
        "לא מציבים תחנות/קופסאות לא יציבות בתוך אזור הטיסה; כל תחנה חייבת להיות נמוכה, יציבה ומחוץ לנתיב פגיעה מסוכן.",
        "לא נכנסים לאזור הטיסה כדי לסדר כרטיסייה או תמונה בזמן שהמנועים מסתובבים.",
        "צילום לא מצדיק סיכון: אם הרחפן לא יציב, מוותרים על צילום ומנחיתים/Abort.",
        "Data Retrieval מתבצע רק אחרי נחיתה מלאה וכיבוי מנועים.",
        "אם תמונה מטושטשת, מכיילים sleep בלבד לפני צילום — לא מגדילים מסלול או גובה בלי אישור.",
        "בסיום מוציאים סוללות לקופסת ריקות ואין אחסון סוללה ברחפן."
    ],
    "commonDirections": [
        [
            "tello.takePhoto();",
            "צילום אוטונומי — חייב להופיע אחרי ייצוב."
        ],
        [
            "tello.sleep(2);",
            "השהיית מינימום לפני צילום כדי להפחית Motion Blur."
        ],
        [
            "tello.sleep(3);",
            "כיול מומלץ אם התמונות עדיין מטושטשות."
        ],
        [
            "yawRight(90) + takePhoto",
            "צילום סריקת גג בארבעה כיוונים בסימולטור."
        ],
        [
            "Data Retrieval",
            "שמירה/פריקה של תמונות לטאבלט לאחר נחיתה."
        ],
        [
            "Photo Evidence Log",
            "רישום תחנה A/B/C ואיכות התמונה."
        ],
        [
            "Meeting7_Inspection_Success",
            "שם הפרויקט הסופי לשמירה בענן."
        ]
    ],
    "setupSteps": [
        "טאבלטים טעונים עם DroneBlocks Code וחשבונות זמינים.",
        "רחפני Tello/Tello EDU עם מגיני פרופלורים, סוללות מלאות ונוהל שתי קופסאות.",
        "Safe Fly Zone מסומן, משקפי מגן ותפקידי צוות מוכנים.",
        "שלוש תחנות מבנים יציבות בגבהים מדורגים 40/70/100 ס״מ או חלופה בטוחה לפי הכיתה.",
        "כרטיסיות סדקים/אותיות A/B/C מודפסות וקריאות לצילום.",
        "מקרן להצגת Motion Blur, פקודת takePhoto ואתגר City Simulator.",
        "טופס Photo Evidence Log: תחנה, האם צולמה, האם חדה, האם צריך sleep(3)."
    ],
    "tabletTips": [
        "פותחים Meeting7_Inspection_JS על WiFi בית ספרי ושומרים לפני מעבר ל־TELLO WiFi.",
        "בודקים ש־takePhoto כתוב בדיוק עם P גדולה: tello.takePhoto();.",
        "בכל תחנה: קודם sleep, אחר כך takePhoto — לא להפך.",
        "בסימולטור: yawRight(90) + sleep + takePhoto בארבעה כיוונים סביב גג.",
        "לא מנתקים את ה־Tello מיד אחרי נחיתה; משאירים WiFi יציב לפחות 30 שניות לפריקת תמונות.",
        "אם התמונות מטושטשות, משנים רק את sleep לפני צילום ל־3 שניות."
    ],
    "lessonFlow": [
        {
            "minutes": "0–6",
            "title": "בדיקת תנאי קדם משיעור 6",
            "teacher": "מזכיר Grid Search, תפקידי צוות ושער בטיחות. היום התוצר המרכזי הוא לא רק מסלול אלא צילום חד.",
            "students": "מסבירים למה Target Log דומה ל־Photo Evidence Log."
        },
        {
            "minutes": "6–16",
            "title": "PBL — InspeX ובדיקת תשתיות",
            "teacher": "מציג עמודי מתח/גשרים/טורבינות ואת הסיכון בטיפוס פיזי של טכנאים.",
            "students": "מזהים יתרון אחד של צילום רחפן לבדיקת תשתית."
        },
        {
            "minutes": "16–20",
            "title": "Motion Blur",
            "teacher": "מסביר דרך אנלוגיית רכבת הרים: צילום תוך תנועה יוצר מריחה; sleep מייצב לפני takePhoto.",
            "students": "מנסחים כלל: לא מצלמים בזמן תנועה."
        },
        {
            "minutes": "20–35",
            "title": "סינטקס צילום ב־JavaScript",
            "teacher": "מדגים takeoff, flyUp, sleep(2), takePhoto, sleep(3), land ומדגיש CamelCase.",
            "students": "כותבים קוד בסיס Meeting7_Inspection_JS."
        },
        {
            "minutes": "35–48",
            "title": "City Simulator Photo Sweep",
            "teacher": "מנחה מסלול לגג: עלייה ל־120 אינץ׳, yawRight(90), sleep, takePhoto ארבע פעמים.",
            "students": "מריצים בסימולטור ומתקנים סינטקס/סדר פקודות."
        },
        {
            "minutes": "48–55",
            "title": "Code Review + Safety Gate",
            "teacher": "בודק takePhoto, sleep לפני צילום, גובה סביר, land, WiFi Handshake ו־Pre‑Flight.",
            "students": "מציגים קוד ותפקידים לפני פיזי."
        },
        {
            "minutes": "55–72",
            "title": "צילום פיזי בתחנות",
            "teacher": "מפעיל צוותים בסבבים: תחנות A/B/C, צילום אחרי ייצוב, נחיתה בטוחה.",
            "students": "Observer מכריז, Driver מריץ, Navigator רושם Photo Evidence Log."
        },
        {
            "minutes": "72–80",
            "title": "Data Retrieval",
            "teacher": "מנחה פריקת תמונות לגלריית הטאבלט ושמירת חיבור Tello יציב.",
            "students": "מורידים תמונות ומציגים 3 ראיות חזותיות."
        },
        {
            "minutes": "80–85",
            "title": "דיבוג איכות תמונה",
            "teacher": "אם תמונות מטושטשות, מנחה שינוי sleep לפני צילום מ־2 ל־3 שניות בלבד.",
            "students": "מתעדים Motion Blur והכיול שבוצע."
        },
        {
            "minutes": "85–90",
            "title": "Save + תחזוקה",
            "teacher": "מוביל חזרה ל־School WiFi, שמירה Meeting7_Inspection_Success, Share Link, הוצאת סוללות ואחסון.",
            "students": "משתפים קישור ומחזירים ציוד."
        }
    ],
    "exercises": [
        {
            "minutes": "0–6",
            "title": "מהו תוצר חקר?",
            "prompt": "השלימו: בשיעור 7 הצלחה היא לא רק טיסה, אלא ___.",
            "check": "מופיע צילום חד/ראיה חזותית/מידע לניתוח."
        },
        {
            "minutes": "16–20",
            "title": "Motion Blur Prediction",
            "prompt": "מה יקרה אם נצלם תוך כדי תנועה קדימה?",
            "check": "התלמיד מזכיר טשטוש/רעידה/תמונה לא קריאה."
        },
        {
            "minutes": "20–35",
            "title": "קוד צילום בסיסי",
            "prompt": "כתבו flyUp(40), sleep(2), takePhoto, sleep(3), land.",
            "check": "sleep מופיע לפני takePhoto ו־takePhoto כתוב CamelCase."
        },
        {
            "minutes": "35–48",
            "title": "City Photo Sweep",
            "prompt": "תכננו 4 תמונות סביב גג: yawRight(90), sleep, takePhoto בכל כיוון.",
            "check": "יש ארבעה כיווני צילום או שלד ברור."
        },
        {
            "minutes": "48–55",
            "title": "Safety + Photo Code Review",
            "prompt": "הראו למדריך sleep לפני כל takePhoto, land ותפקידי צוות.",
            "check": "אין מעבר פיזי בלי אישור."
        },
        {
            "minutes": "55–72",
            "title": "Physical Inspection Run",
            "prompt": "צלמו תחנות A/B/C בגבהים מדורגים לפי הסבב המאושר.",
            "check": "הטיסה נעשתה באזור בטוח או נעצרה בבטחה."
        },
        {
            "minutes": "72–80",
            "title": "Data Retrieval",
            "prompt": "פרקו תמונות לטאבלט והציגו 3 תמונות או הסבירו תקלה.",
            "check": "יש תמונות/Debug Log."
        },
        {
            "minutes": "80–85",
            "title": "Blur Debug",
            "prompt": "אם תמונה מטושטשת, שנו רק sleep לפני takePhoto והסבירו למה.",
            "check": "הכיול הוא sleep בלבד."
        },
        {
            "minutes": "85–90",
            "title": "Final Share",
            "prompt": "שמרו Meeting7_Inspection_Success ושתפו קישור.",
            "check": "יש Share Link או תיעוד בעיית רשת."
        }
    ],
    "deliverable": "Meeting7_Inspection_Success: קוד JavaScript עם takePhoto ו־sleep לפני צילום, Photo Evidence Log לתחנות A/B/C, לפחות 3 תמונות חדות/קריאות או Debug Log, ו־Share Link למדריך.",
    "assessment": [
        "התלמיד מסביר את תפקיד המצלמה כחיישן חקר מדעי.",
        "הקוד כולל tello.takePhoto(); בסינטקס תקין.",
        "לפני כל takePhoto יש sleep מתאים למניעת Motion Blur.",
        "הצוות עבר City Simulator/Code Review לפני טיסה פיזית.",
        "הצוות פעל לפי WiFi Handshake, Pre‑Flight ותפקידי בטיחות.",
        "בוצע Data Retrieval או תועד כשל טכני ברור.",
        "יש Meeting7_Inspection_Success, Photo Evidence Log ו־Share Link."
    ],
    "debugging": [
        {
            "problem": "התמונות מטושטשות או מרוחות",
            "fix": "להגדיל את ההשהיה לפני takePhoto ל־tello.sleep(3); ולצלם רק אחרי ריחוף יציב."
        },
        {
            "problem": "אין תמונות חדשות בגלריה",
            "fix": "לוודא ש־tello.takePhoto(); מופיע בקוד וש־P גדולה; לשמור חיבור Tello לפחות 30 שניות אחרי נחיתה."
        },
        {
            "problem": "takePhoto לא מזוהה",
            "fix": "לבדוק CamelCase וסוגריים: tello.takePhoto(); ולא tello.takephoto או tello.takePhoto."
        },
        {
            "problem": "הרחפן לא יציב ליד תחנה",
            "fix": "להנחית/Abort, להקטין גובה או להאריך sleep באישור מדריך; לא להתקרב לתחנה לא יציבה."
        },
        {
            "problem": "Data Retrieval נכשל",
            "fix": "לחזור ל־TELLO WiFi, לא לכבות רחפן עד סיום פריקה, ואז לחזור ל־School WiFi לשמירת קוד."
        },
        {
            "problem": "צילום חסר תחנה אחת",
            "fix": "לבדוק סדר הפקודות וגובה התחנה; להוסיף Photo Evidence Log כדי לראות מה פוספס."
        }
    ],
    "differentiation": {
        "support": [
            "להסתפק בתחנה אחת פיזית + שתי תחנות בסימולטור.",
            "לתת שלד קוד עם takePhoto מוכן ולבקש להוסיף sleep לפניו.",
            "לתת טופס Photo Evidence Log עם בחירה: חד/מטושטש/לא צולם."
        ],
        "extension": [
            "לכתוב פונקציה captureStable(label) כרעיון פסאודו־קוד/JS מתקדם.",
            "להוסיף Photo Sweep בסימולטור עם ארבע תמונות בכל 90° ולתעד כיוון צילום.",
            "להשוות איכות תמונה sleep(1), sleep(2), sleep(3) ולהציג המלצת מהנדס."
        ]
    },
    "instructorGuide": {
        "prerequisites": "שיעור 7 נשען על שליטה בטיסה פיזית מבוקרת משיעורים 5–6. יש להפעיל רק צוותים שכבר עומדים ב־WiFi Handshake, Safe Fly Zone ותפקידי צוות. הדגש עובר מתנועה וכיסוי שטח לאיכות דאטה חזותית.",
        "pedagogy": [
            "להדגיש שהצילום הוא דאטה: תמונה מטושטשת אינה תוצר חקר גם אם הטיסה הצליחה.",
            "Motion Blur הוא גשר מצוין בין פיזיקה לקוד — השהיה לפני צילום היא החלטה הנדסית.",
            "לא לתת לתלמידים לרדוף אחרי תמונה מושלמת על חשבון בטיחות; אם התנאים לא יציבים, מנתחים בסימולטור.",
            "Data Retrieval הוא חלק מהמשימה ולא פעולה טכנית בסוף — בלי פריקת תמונות אין ראיה.",
            "להמשיך מודל כיול פרמטר אחד: במקרה זה sleep לפני takePhoto."
        ],
        "facilitationNotes": [
            "מקמו תחנות כך שהרחפן לא צריך להתקרב אליהן פיזית באופן מסוכן; אפשר להציב כרטיסיות על הרצפה ליד התחנות במקום על גובה אם הכיתה צפופה.",
            "לאפשר פיזית רק לצוות אחד בכל פעם; אחרים עובדים על City Photo Sweep או Photo Evidence Log.",
            "לפני טיסה בדקו שכל takePhoto מגיע אחרי sleep. זו נקודת הכשל המרכזית.",
            "אם התמונות לא נפרקות, אל תכבו מיד את הרחפן; תנו 30 שניות חיבור יציב."
        ],
        "mediaNote": "סרטון בדיקת קווי מתח/גשרים ברחפן הוא השראה קצרה בלבד. לשמור זמן לתרגול takePhoto ו־Data Retrieval.",
        "exitTicket": "התמונה הכי טובה שלנו הייתה בתחנה ___ כי בקוד עשינו ___."
    },
    "appWorkflowTitle": "DroneBlocks Code — InspeX Photo Inspection",
    "appWorkflowNote": "מפגש 7 משלב סימולטור וטיסה פיזית מבוקרת. המטרה היא תמונות חדות, לא רק מסלול. פיזי רק אחרי Code Review, WiFi Handshake, Pre‑Flight ותפקידי צוות.",
    "appWorkflow": [
        {
            "title": "School WiFi + Project",
            "detail": "פתחו DroneBlocks Code וצרו Meeting7_Inspection_JS."
        },
        {
            "title": "Camera Syntax",
            "detail": "כתבו sleep לפני tello.takePhoto(); ודאו CamelCase מדויק."
        },
        {
            "title": "City Simulator Photo Sweep",
            "detail": "בצעו yawRight(90), sleep, takePhoto בארבעה כיוונים סביב גג וירטואלי."
        },
        {
            "title": "Physical Safety Gate",
            "detail": "עברו TELLO WiFi, Pre‑Flight, תפקידים, Abort, Safe Fly Zone ותחנות צילום יציבות."
        },
        {
            "title": "Capture + Data Retrieval",
            "detail": "צלמו תחנות A/B/C, נחתו, פרקו תמונות לטאבלט ומלאו Photo Evidence Log."
        },
        {
            "title": "Blur Debug + Share",
            "detail": "אם התמונה מטושטשת, שנו sleep לפני צילום ל־3; שמרו Meeting7_Inspection_Success ושתפו קישור."
        }
    ],
    "visualDiagram": {
        "panelTitle": "📷 InspeX Photo Inspection",
        "chip": "Camera + Data",
        "title": "צילום תשתיות אוטונומי עם ייצוב לפני תמונה",
        "src": "assets/drone-mission-lab-grade8/lesson7/inspex-autonomous-photo-inspection.svg",
        "alt": "תרשים משימת צילום תשתיות עם רחפן, שלוש תחנות בגבהים שונים, sleep לפני takePhoto ופריקת תמונות",
        "caption": "שיעור 7 הופך את הרחפן לכלי חקר חזותי: מייצבים, מצלמים, פורקים תמונות ומנתחים אם התוצר חד מספיק לשימוש הנדסי."
    },
    "videoResources": [
        {
            "title": "drone power line inspection autonomous — search suggestion",
            "url": "https://www.youtube.com/results?search_query=drone+power+line+inspection+autonomous",
            "note": "סרטון השראה על בדיקת קווי מתח בעזרת רחפנים."
        },
        {
            "title": "drone bridge wind turbine inspection Pix4D Flyability — fallback",
            "url": "https://www.youtube.com/results?search_query=drone+bridge+wind+turbine+inspection+Pix4D+Flyability",
            "note": "חלופה לבדיקת תשתיות גבוהות."
        }
    ],
    "screenshotSlides": [
        {
            "title": "InspeX Photo Inspection",
            "src": "assets/drone-mission-lab-grade8/lesson7/inspex-autonomous-photo-inspection.svg",
            "caption": "sleep לפני takePhoto כדי לקבל צילום חד ולא מטושטש."
        },
        {
            "title": "פותחים DroneBlocks Code",
            "src": "assets/tello-mission-lab/lesson1/open-app.png",
            "caption": "WiFi בית ספרי ופרויקט Meeting7_Inspection_JS."
        },
        {
            "title": "City Simulator Photo Sweep",
            "src": "assets/tello-mission-lab/lesson1/simulator-run.png",
            "caption": "בודקים yawRight + takePhoto בסימולטור לפני פיזי."
        },
        {
            "title": "WiFi Handshake",
            "src": "assets/drone-mission-lab-grade8/lesson5/tello-wifi-handshake.svg",
            "caption": "מעבר ל־TELLO WiFi להרצה ופריקת תמונות."
        },
        {
            "title": "Save & Share",
            "src": "assets/tello-mission-lab/lesson1/save-share.png",
            "caption": "Meeting7_Inspection_Success ו־Share Link."
        }
    ],
    "instructorSlides": [
        {
            "title": "InspeX: בדיקת תשתיות",
            "body": "הרחפן מצלם סדקים בעמודים/גשרים בלי לסכן טכנאים בטיפוס לגובה.",
            "bullets": [
                "Infrastructure",
                "Safety",
                "Visual data"
            ]
        },
        {
            "title": "מצלמה היא חיישן",
            "body": "המשימה אינה רק להגיע לנקודה — אלא להפיק תמונה שאפשר לנתח.",
            "bullets": [
                "camera",
                "evidence",
                "analysis"
            ]
        },
        {
            "title": "Motion Blur",
            "body": "צילום בזמן תנועה גורם לטשטוש. קוד טוב עוצר, מייצב ואז מצלם.",
            "bullets": [
                "movement",
                "stabilize",
                "sharp image"
            ]
        },
        {
            "title": "פקודת צילום",
            "body": "tello.sleep(2); ואז tello.takePhoto(); — הסדר הזה קריטי.",
            "bullets": [
                "sleep",
                "takePhoto",
                "CamelCase"
            ]
        },
        {
            "title": "City Photo Sweep",
            "body": "פנייה 90°, ייצוב וצילום — ארבע פעמים סביב גג וירטואלי.",
            "bullets": [
                "yawRight(90)",
                "4 photos",
                "simulator"
            ]
        },
        {
            "title": "Physical Inspection",
            "body": "תחנות A/B/C, תפקידי צוות, צילום אחרי ייצוב ו־Photo Evidence Log.",
            "bullets": [
                "A/B/C",
                "roles",
                "photo log"
            ]
        },
        {
            "title": "Data Retrieval",
            "body": "אחרי נחיתה פורקים תמונות לטאבלט. אם הן מטושטשות — מכיילים sleep ולא מאלתרים טיסה.",
            "bullets": [
                "download",
                "review",
                "debug sleep"
            ]
        }
    ]
}
);

  Object.assign(window.DRONE_MISSION_LAB_GRADE8_LESSONS[7], {
    "title": "שיעור 8: Red Cross Search & Rescue — חיפוש והצלה בשטח פיזי מורכב ב־JavaScript",
    "subtitle": "משימת חיפוש והצלה פיזית: מכשולים בגבהים שונים, flyUp/flyDown, yawRight, takePhoto, Data Download ו־SOS",
    "unit": "יחידה 3 — צילום, הצלה ואופטימיזציה",
    "concept": "Search & Rescue פיזי מורכב: ניווט תלת־ממדי, צילום ראיות, כיול גובה ומרחק תחת אילוצי שטח",
    "story": "כיתה ח׳ פועלת כצוותי חיפוש והצלה אוטונומיים מטעם הצלב האדום הבינלאומי. אזור תעשייתי קרס בעקבות רעידת אדמה, ובתוך מלבן הטיסה הבטוח מוצבים שלושה “בניינים הרוסים” בגבהים שונים. הרחפן צריך לנווט בזהירות, להתייצב מעל כל מכשול, לצלם את אותיות הניצולים S‑O‑S, לנחות בבטחה, ולאפשר לצוות להוריד את התמונות לטאבלט ולפענח את הקוד הסודי.",
    "mission": "לפתוח DroneBlocks Code על WiFi בית ספרי, ליצור פרויקט Meeting8_SearchAndRescue_JS, לתכנן ולבדוק קוד JavaScript שמשלב targetDist, tello.flyUp, tello.flyDown, tello.flyForward, tello.flyRight, tello.yawRight, tello.sleep ו־tello.takePhoto. לאחר Code Review, Dry Run, WiFi Handshake, Pre‑Flight Check, Safe Fly Zone, משקפי מגן ותפקידי צוות — לבצע הרצה פיזית קצרה סביב שלושה מכשולים, לצלם את כרטיסיות S/O/S, להוריד תמונות לטאבלט, לשמור Meeting8_RedCross_Success ולשתף קישור.",
    "commands": [
      "wifi_handshake",
      "preflight",
      "peer_roles",
      "let_variable",
      "flyUp",
      "flyForward",
      "flyRight",
      "yawRight",
      "sleep",
      "takePhoto",
      "data_retrieval",
      "battery_protocol",
      "save_cloud"
    ],
    "blocks": [
      "wifi_handshake",
      "preflight",
      "peer_roles",
      "let_variable",
      "flyUp",
      "flyForward",
      "flyRight",
      "yawRight",
      "sleep",
      "takePhoto",
      "data_retrieval",
      "battery_protocol",
      "save_cloud"
    ],
    "workspaceMode": "physical-drone",
    "physicalFlightAllowed": true,
    "essentialQuestion": "איך מתכננים קוד JavaScript שמנווט רחפן פיזי בין מכשולים, מצלם ראיות ברורות, ושומר על בטיחות צוותית מלאה?",
    "successCriteria": [
      "אני מסביר/ה את נוהל שתי הרשתות: WiFi בית ספרי לשמירה ו־TELLO WiFi להרצה פיזית בלבד.",
      "אני משתמש/ת במשתנה targetDist כדי לכייל מרחק מעבר בין תחנות ולא משנה הרבה פקודות יחד.",
      "אני משלב/ת flyUp/flyDown, flyForward/flyRight/yawRight ו־takePhoto בסדר בטוח וברור.",
      "אני מוסיף/ה tello.sleep לפני צילום כדי לקבל תמונה יציבה ולא מטושטשת.",
      "אני משתתף/ת בתפקיד Driver/Navigator/Safety Observer ומכבד/ת קריאת המראה ו־Abort.",
      "אני מוריד/ה את התמונות לטאבלט ומציג/ה שלוש ראיות שמפענחות S‑O‑S.",
      "אני שומר/ת את הקוד בשם Meeting8_RedCross_Success ומשתף/ת קישור למדריך."
    ],
    "realWorldUses": [
      {
        "icon": "🚑",
        "title": "Red Cross Search & Rescue",
        "text": "רחפנים מאפשרים לראות אזור מסוכן לפני כניסת מחלצים ולאתר סימני חיים או אותות חזותיים."
      },
      {
        "icon": "🏚️",
        "title": "מבנים שקרסו",
        "text": "ניווט סביב מכשולים בגבהים שונים דורש כיול גובה, מרחק וזווית צילום — לא רק טיסה קדימה."
      },
      {
        "icon": "📸",
        "title": "Data Download",
        "text": "התוצר המקצועי הוא לא “הרחפן טס”, אלא תמונות חדות שאפשר לפענח ולדווח למפקד המבצע."
      }
    ],
    "vocabulary": [
      ["Search & Rescue", "משימת חיפוש והצלה שבה רחפן אוסף מידע חזותי לפני כניסת צוותים לשטח מסוכן."],
      ["targetDist", "משתנה JavaScript שמחזיק את מרחק המעבר בין תחנות/מכשולים ומאפשר כיול מהיר."],
      ["flyUp / flyDown", "פקודות ציר אנכי שמכוונות את גובה הרחפן ביחס למכשול."],
      ["yawRight", "סבסוב הרחפן ימינה כדי לכוון את החזית/מצלמה או להכין מעבר לתחנה הבאה."],
      ["takePhoto", "פקודת צילום אוטונומית; מומלץ לבצע אותה אחרי sleep כדי למנוע Motion Blur."],
      ["Data Download", "הורדת התמונות מהרחפן/אפליקציה לטאבלט לצורך בדיקה, פענוח והגשה."],
      ["Dry Run", "הרצת בדיקה קצרה בלי צילום/בלי משימה מלאה, כדי לוודא שאין סכנת פגיעה במכשולים."],
      ["Abort", "עצירת חירום מיידית אם הרחפן מתקרב מדי למכשול, לתלמיד או לגבול אזור הטיסה."]
    ],
    "safetyRules": [
      "טיסה פיזית רק לאחר Code Review, אישור מדריך ו־Dry Run מבוקר.",
      "מסמנים Safe Fly Zone בסרט צבעוני; תלמידים מחוץ למלבן הטיסה בלבד.",
      "משקפי מגן, שיער אסוף, מגיני פרופלורים וסוללה תקינה — חובה לפני חיבור TELLO WiFi.",
      "שומרים מרחק בטיחות של לפחות 50 ס״מ מכל מכשול; אם הרחפן מתקרב — Driver לוחץ Abort מיד.",
      "קריאת המראה חובה: התצפיתן מכריז בקול “צוות X ממריא למשימת חילוץ!” לפני Run.",
      "משנים רק targetDist או גובה אחד בכל דיבוג; לא מאלתרים מסלול במהלך טיסה.",
      "בסיום: tello.land(), כיבוי, הוצאת סוללה והעברה לקופסת סוללות ריקות לפי נוהל שתי קופסאות."
    ],
    "commonDirections": [
      ["targetDist", "המרחק המרכזי בין תחנות. מתחילים בערך שמרני ומכיילים לפי Drift Log."],
      ["tello.flyUp(30);", "עלייה מבוקרת לפני מעבר מעל מכשול נמוך/בינוני; לכייל לפי גובה הכיתה."],
      ["tello.flyRight(50);", "חיתוך צד לעקיפה; להקטין אם הרחפן מתקרב למכשולים."],
      ["tello.yawRight(90);", "פנייה/סבסוב 90 מעלות להכנת זווית צילום או מעבר תחנה."],
      ["tello.sleep(2);", "השהיית ייצוב לפני צילום — התמונה היא הראיה ההנדסית."],
      ["tello.takePhoto();", "צילום הכרטיסייה העליונה; אם התמונה חצי־ריקה מכיילים גובה ומיקום."],
      ["Data Download", "אחרי נחיתה מורידים תמונות ומוודאים שהאותיות S/O/S קריאות."]
    ],
    "setupSteps": [
      "להטעין טאבלטים ל־100% ולוודא DroneBlocks Code פעיל.",
      "להכין רחפן Tello/Tello EDU לכל צוות של 3 תלמידים עם מגיני פרופלורים.",
      "לסמן Safe Fly Zone גדול וברור בסרט צבעוני ולהרחיק צופים מהמלבן.",
      "להציב 3 קונוסים/כיסאות כמכשולים בגבהים שונים: כ־80 ס״מ, 50 ס״מ ו־100 ס״מ.",
      "להדביק כרטיסיות A4 עם אותיות S, O, S בחלק העליון של המכשולים.",
      "להכין קופסת סוללות מלאות וקופסת סוללות ריקות לפי נוהל שתי קופסאות.",
      "להגדיר תפקידי צוות: Driver, Navigator, Safety Observer/Data Officer."
    ],
    "tabletTips": [
      "פותחים DroneBlocks Code על WiFi בית ספרי ויוצרים Meeting8_SearchAndRescue_JS.",
      "כותבים קודם שלד קוד עם הערות: מכשול א׳, מכשול ב׳, מכשול ג׳, נחיתה.",
      "מריצים בסימולטור/Code Review לפני TELLO WiFi; אין Run פיזי לפני אישור מדריך.",
      "עוברים ל־TELLO WiFi רק בזמן הטיסה הפיזית; לאחר נחיתה חוזרים ל־WiFi בית ספרי לשמירה ושיתוף.",
      "לאחר נחיתה פותחים את התמונות בגלריית הטאבלט ומסמנים אם האות S/O/S ברורה.",
      "שומרים Meeting8_RedCross_Success ומצרפים Share Link או Photo Evidence Log."
    ],
    "lessonFlow": [
      {
        "minutes": "0–5",
        "title": "בדיקת תנאי קדם וגשר ממפגש 7",
        "teacher": "מזכיר שמפגש 7 לימד צילום חד בעזרת sleep ו־takePhoto; היום מוסיפים מכשולים פיזיים, גבהים שונים וקריאת SOS.",
        "students": "פותחים טאבלטים, מצטרפים לצוותים ומזכירים כלל צילום אחד ממפגש 7."
      },
      {
        "minutes": "5–15",
        "title": "סיפור מסגרת Red Cross",
        "teacher": "מציג תרחיש רעידת אדמה: שלושה בניינים הרוסים, אותיות ניצולים S/O/S, רחפן מחלץ מידע לפני כניסת צוותים.",
        "students": "מזהים מהו התוצר: שלוש תמונות ברורות וקוד שמור, לא רק טיסה יפה."
      },
      {
        "minutes": "15–20",
        "title": "תיאום הנדסי ותפקידי צוות",
        "teacher": "מגדיר Driver, Navigator, Safety Observer/Data Officer, ומדגיש 50 ס״מ מהמכשולים ו־Abort ללא ויכוח.",
        "students": "מחלקים תפקידים ומתרגלים בקול את קריאת ההמראה."
      },
      {
        "minutes": "20–25",
        "title": "נוהל רשת כפולה",
        "teacher": "מנחה לפתוח DroneBlocks Code על WiFi בית ספרי וליצור Meeting8_SearchAndRescue_JS.",
        "students": "פותחים פרויקט, בודקים Function Reference ושומרים גרסה ראשונה."
      },
      {
        "minutes": "25–40",
        "title": "כתיבת שלד JavaScript תלת־ממדי",
        "teacher": "מדגים targetDist, flyUp, flyForward, flyRight, yawRight, sleep ו־takePhoto עם הערות לכל מכשול.",
        "students": "כותבים שלד קוד, מסמנים איפה מתבצע צילום ומוודאים שיש land בסוף."
      },
      {
        "minutes": "40–52",
        "title": "Code Review ו־Dry Run",
        "teacher": "בודק כל צוות לפני טיסה: מרחקים שמרניים, גובה מתאים, sleep לפני צילום, Abort ותפקידים.",
        "students": "מריצים בדיקה קצרה/סימולטורית או Dry Run לפי אישור ומעדכנים targetDist אחד בלבד."
      },
      {
        "minutes": "52–70",
        "title": "Mission Run — מבצע חילוץ",
        "teacher": "מפעיל סבבי טיסה בתוך Safe Fly Zone בלבד ומאשר צוות אחד בכל פעם.",
        "students": "מכריזים המראה, מריצים קוד, מצלמים S/O/S, מתעדים סטייה ומפעילים Abort אם צריך."
      },
      {
        "minutes": "70–78",
        "title": "Data Download ופענוח SOS",
        "teacher": "מנחה להוריד תמונות לטאבלט ולבדוק אם האותיות קריאות וממוקדות.",
        "students": "פותחים גלריה/תמונות, בוחרים שלוש ראיות וממלאים Photo Evidence Log."
      },
      {
        "minutes": "78–85",
        "title": "שמירה ושיתוף",
        "teacher": "מחזיר צוותים ל־WiFi בית ספרי ומוודא שמירה בשם Meeting8_RedCross_Success.",
        "students": "שומרים קוד, משתפים קישור ומצרפים הערה על הכיול שבוצע."
      },
      {
        "minutes": "85–90",
        "title": "תחזוקה וסיכום",
        "teacher": "מנהל סוללות בשתי קופסאות, החזרת רחפנים וטאבלטים, ושאלת יציאה על sleep/גובה/בטיחות.",
        "students": "מוציאים סוללה באישור, מחזירים ציוד ומשלימים כרטיס יציאה."
      }
    ],
    "exercises": [
      {
        "minutes": "10–15",
        "title": "מפת SOS",
        "prompt": "שרטטו על דף/טאבלט את שלושת המכשולים, הגבהים 80/50/100 ס״מ, ואת מסלול הרחפן המשוער.",
        "check": "יש Safe Fly Zone, מנחת, שלוש תחנות וציון מרחק בטיחות."
      },
      {
        "minutes": "20–28",
        "title": "משתנה כיול",
        "prompt": "כתבו let targetDist = 100; והסבירו למה עדיף לשנות משתנה אחד בראש הקוד במקום הרבה פקודות.",
        "check": "התלמיד מחבר targetDist לדיבוג מהיר ובטוח."
      },
      {
        "minutes": "28–40",
        "title": "שלד קוד צילום",
        "prompt": "כתבו רצף בסיסי: takeoff, sleep, flyUp, flyForward(targetDist), sleep, takePhoto, מעבר צד/פנייה, land.",
        "check": "יש sleep לפני takePhoto ו־land בסוף."
      },
      {
        "minutes": "40–52",
        "title": "Dry Run בטיחותי",
        "prompt": "הריצו בדיקה קצרה רק באישור מדריך ותעדו סטייה אחת: קדימה/צד/גובה.",
        "check": "הצוות לא משנה יותר מפרמטר אחד לאחר הריצה."
      },
      {
        "minutes": "52–65",
        "title": "צילום אותיות ניצולים",
        "prompt": "בצעו Mission Run קצרה ונסו להפיק תמונה ברורה של לפחות שתי אותיות מתוך S/O/S.",
        "check": "התמונות קיימות וניתנות לפענוח בטאבלט."
      },
      {
        "minutes": "65–78",
        "title": "Data Download Log",
        "prompt": "מלאו יומן ראיות: איזו תמונה, איזו אות, האם חדה, ומה צריך לכייל.",
        "check": "יש לפחות שתי ראיות עם החלטת איכות."
      },
      {
        "minutes": "78–90",
        "title": "Share + Exit Ticket",
        "prompt": "שמרו Meeting8_RedCross_Success וענו: איך sleep עוזר להצלה ולא רק לתמונה יפה?",
        "check": "יש Share Link/תיעוד ומשפט שמחבר צילום, מידע ובטיחות."
      }
    ],
    "deliverable": "קוד JavaScript בשם Meeting8_RedCross_Success + שלוש תמונות/ראיות S‑O‑S ככל שניתן + Photo Evidence Log קצר + הערת כיול על targetDist/גובה/צילום.",
    "assessment": [
      "הקוד כולל targetDist, פקודות גובה/תנועה, sleep לפני צילום, takePhoto ו־land.",
      "הצוות עבר Code Review, Pre‑Flight וקריאת המראה לפני Run פיזי.",
      "Driver/Navigator/Safety Observer פעלו בפועל ולא רק רשומים בדף.",
      "הרחפן שמר על מרחק בטיחות מהמכשולים או הופעל Abort בזמן.",
      "התמונות שהורדו לטאבלט מאפשרות לזהות לפחות חלק מאותיות S/O/S.",
      "הדיבוג מתועד כפרמטר אחד בכל פעם: targetDist, flyRight או flyUp.",
      "הקוד נשמר בשם Meeting8_RedCross_Success ושיתוף/תיעוד הוגש למדריך."
    ],
    "debugging": [
      {
        "problem": "הרחפן מתקרב או פוגע במכשולים הצידיים",
        "fix": "Abort מיד. מיישרים את אף הרחפן במנחת, מקטינים flyRight/flyLeft או targetDist, ומריצים Dry Run קצר בלבד."
      },
      {
        "problem": "התמונה חצי־ריקה או מפספסת את כרטיסיית S/O/S",
        "fix": "מודד/ת Navigator בודק גובה מכשול; מעלים flyUp כך שהרחפן יהיה גבוה בכ־20 אינץ׳ לפחות מהמכשול, ואז מצלמים אחרי sleep."
      },
      {
        "problem": "התמונה מטושטשת",
        "fix": "מגדילים tello.sleep לפני takePhoto מ־2 ל־3 שניות, בלי לשנות מסלול באותה הרצה."
      },
      {
        "problem": "Data Download לא מציג תמונות",
        "fix": "בודקים שהרחפן נחת והמשימה הסתיימה, עוברים לפי נוהל האפליקציה להורדת תמונות, ואז חוזרים ל־WiFi בית ספרי לשמירה."
      },
      {
        "problem": "Connection Timeout במעבר WiFi",
        "fix": "מוודאים קודם שמירה בענן ב־School WiFi, אחר כך TELLO WiFi רק להרצה; לאחר הנחיתה חוזרים ל־School WiFi."
      }
    ],
    "differentiation": {
      "support": [
        "לתת שלד קוד עם targetDist, takeoff, sleep ו־land מוכנים, והתלמידים משלימים רק תחנת צילום אחת.",
        "להתחיל בשני מכשולים בלבד לפני ניסיון S/O/S מלא.",
        "להשתמש בערכי מרחק וגובה שמרניים מאוד ולבצע Dry Run ללא צילום.",
        "לחלק תפקיד Data Officer לתלמיד שמעדיף תיעוד וניתוח תמונות על כתיבת קוד."
      ],
      "extension": [
        "להוסיף פונקציה photoTarget(height, dist) שמבצעת עלייה, תנועה, ייצוב וצילום.",
        "להוסיף yawRight(90) לפני צילום כדי לבדוק האם חזית המצלמה מכוונת טוב יותר לכרטיסייה.",
        "להשוות שתי גרסאות: מהירות יותר מול תמונות חדות יותר.",
        "להפיק דוח קצר: איזו אות הייתה קשה לפענוח ולמה."
      ]
    },
    "instructorGuide": {
      "prerequisites": "התלמידים מגיעים אחרי מפגש 7, שבו למדו שצילום איכותי דורש sleep לפני takePhoto ופריקת תמונות. לפני מפגש 8 יש לוודא שהם יודעים לפתוח DroneBlocks Code, לשמור פרויקט, לזהות Function Reference, ולהסביר למה טיסה פיזית דורשת Code Review ו־Safe Fly Zone.",
      "pedagogy": [
        "זהו שיעור אינטגרטיבי: לא מלמדים פקודה אחת חדשה אלא מחברים ניווט, גובה, צילום, דיבוג ובטיחות.",
        "האתגר המרכזי הוא קבלת החלטות בזמן אמת: האם להמשיך, לכייל או ללחוץ Abort.",
        "יש להדגיש שהתמונה היא ראיה מבצעית; צילום מטושטש אינו תוצר חקר מספק גם אם הרחפן טס במסלול.",
        "השיעור חייב להישאר פיזי־מבוקר: צוות אחד מטיס בכל פעם, השאר מתכננים/מתעדים מחוץ למלבן.",
        "הדיבוג נעשה בשפה הנדסית: targetDist, flyRight, flyUp, sleep — שינוי אחד בכל פעם."
      ],
      "exitTicket": "במשימת חיפוש והצלה, tello.sleep לפני takePhoto חשוב כי ___."
    },
    "appWorkflowTitle": "DroneBlocks Code + TELLO Physical Search & Rescue",
    "appWorkflowNote": "מפגש 8 הוא משימה פיזית מורכבת. כותבים ושומרים על WiFi בית ספרי, עוברים ל־TELLO WiFi רק להרצה מאושרת, מורידים תמונות אחרי נחיתה, וחוזרים ל־WiFi בית ספרי לשמירת Meeting8_RedCross_Success.",
    "appWorkflow": [
      {
        "title": "School WiFi + Project",
        "detail": "פתחו DroneBlocks Code וצרו Meeting8_SearchAndRescue_JS. כתבו שלד עם הערות לכל מכשול: S, O, S."
      },
      {
        "title": "Build Rescue Code",
        "detail": "השתמשו ב־let targetDist = 100; tello.flyUp(30); tello.flyForward(targetDist); tello.flyRight(50); tello.yawRight(90); tello.sleep(2); tello.takePhoto();"
      },
      {
        "title": "Code Review + Dry Run",
        "detail": "לפני Run פיזי: מדריך בודק מרחקים, גובה, sleep לפני צילום, land, Abort ותפקידים. מריצים Dry Run קצר ומכיילים targetDist בלבד."
      },
      {
        "title": "Physical Safety Gate",
        "detail": "עוברים ל־TELLO WiFi רק אחרי Pre‑Flight, Safe Fly Zone, משקפי מגן, שיער אסוף, מגינים, נוהל שתי קופסאות וקריאת המראה."
      },
      {
        "title": "Mission Run + Data Download",
        "detail": "מצלמים את כרטיסיות S/O/S, נוחתים, מורידים תמונות לטאבלט וממלאים Photo Evidence Log: אות, חדות, כיול נדרש."
      },
      {
        "title": "Save + Share",
        "detail": "חוזרים ל־WiFi בית ספרי, שומרים Meeting8_RedCross_Success ומשתפים קישור עם המדריך."
      }
    ],
    "visualDiagram": {
      "panelTitle": "🚑 Red Cross Rescue Mission",
      "chip": "3D Photo Rescue",
      "title": "מבצע חיפוש והצלה פיזי עם כרטיסיות S/O/S",
      "src": "assets/drone-mission-lab-grade8/lesson8/redcross-search-rescue-obstacle-photo-mission.svg",
      "alt": "תרשים חיפוש והצלה לכיתה ח׳ עם שלושה מכשולים בגבהים שונים, כרטיסיות S O S, מסלול רחפן, flyUp, yawRight, takePhoto ואזור טיסה בטוח",
      "caption": "מפגש 8 מחבר קוד JavaScript, כיול גובה ומרחק, צילום אוטונומי ופריקת מידע: המטרה היא שלוש ראיות חזותיות ברורות בתוך Safe Fly Zone."
    },
    "videoResources": [
      {
        "title": "drone search and rescue earthquake red cross — search suggestion",
        "url": "https://www.youtube.com/results?search_query=drone+search+and+rescue+earthquake+red+cross",
        "note": "סרטון השראה קצר על רחפנים בחיפוש והצלה לאחר רעידות אדמה."
      },
      {
        "title": "Flyability Elios 3 collapsed building inspection — fallback",
        "url": "https://www.youtube.com/results?search_query=Flyability+Elios+3+collapsed+building+inspection",
        "note": "חלופה להצגת רחפנים בסביבה פיזית מורכבת ומסוכנת."
      }
    ],
    "screenshotSlides": [
      {
        "title": "Red Cross Search & Rescue",
        "src": "assets/drone-mission-lab-grade8/lesson8/redcross-search-rescue-obstacle-photo-mission.svg",
        "caption": "שלושה מכשולים בגבהים שונים, כרטיסיות S/O/S, צילום אחרי ייצוב ומרחק בטיחות של 50 ס״מ."
      },
      {
        "title": "פותחים DroneBlocks Code",
        "src": "assets/tello-mission-lab/lesson1/open-app.png",
        "caption": "WiFi בית ספרי ופרויקט Meeting8_SearchAndRescue_JS."
      },
      {
        "title": "Code Review לפני טיסה",
        "src": "assets/drone-mission-lab-grade8/lesson5/tello-wifi-handshake.svg",
        "caption": "שומרים בענן, עוברים TELLO WiFi רק להרצה מאושרת וחוזרים לשמירה בסוף."
      },
      {
        "title": "Data Download",
        "src": "assets/drone-mission-lab-grade8/lesson7/inspex-autonomous-photo-inspection.svg",
        "caption": "כמו במפגש 7: התוצר הוא תמונה ברורה שניתן לפענח, לא רק מסלול טיסה."
      },
      {
        "title": "Save & Share",
        "src": "assets/tello-mission-lab/lesson1/save-share.png",
        "caption": "Meeting8_RedCross_Success ו־Share Link למדריך."
      }
    ],
    "instructorSlides": [
      {
        "title": "Red Cross: משימת חילוץ",
        "body": "הרחפן משמש עיניים לפני כניסת צוותים לאזור מסוכן. התלמידים צריכים להפיק ראיות, לא רק להטיס.",
        "bullets": ["Search & Rescue", "SOS", "visual evidence"]
      },
      {
        "title": "הכיתה הופכת לזירת אסון מדומה",
        "body": "שלושה מכשולים בגבהים שונים וכרטיסיות S/O/S דורשים ניווט תלת־ממדי וכיול זהיר.",
        "bullets": ["80 cm", "50 cm", "100 cm"]
      },
      {
        "title": "targetDist הוא ידית הכיול",
        "body": "במקום לשנות הרבה פקודות, מכיילים משתנה מרכזי אחד ומתעדים את ההשפעה.",
        "bullets": ["let targetDist", "one parameter", "drift log"]
      },
      {
        "title": "צילום יציב מציל מידע",
        "body": "tello.sleep לפני tello.takePhoto מאפשר תמונה חדה שאפשר לפענח כ־S/O/S.",
        "bullets": ["sleep", "takePhoto", "data"]
      },
      {
        "title": "בטיחות היא תנאי הרצה",
        "body": "Safe Fly Zone, משקפי מגן, שיער אסוף, תפקידי צוות ו־Abort — בלי זה אין Run.",
        "bullets": ["Pre‑Flight", "50 cm clearance", "Abort"]
      },
      {
        "title": "Data Download",
        "body": "אחרי נחיתה מורידים תמונות לטאבלט ומחליטים האם הן ראיות מספיק טובות למפקד המבצע.",
        "bullets": ["download", "review", "Photo Evidence Log"]
      }
    ]
  });



  Object.assign(window.DRONE_MISSION_LAB_GRADE8_LESSONS[8], {
    "title": "שיעור 9: NASA JPL EcoFlight — אופטימיזציה ויעילות אנרגטית ב־JavaScript",
    "subtitle": "Battery‑Saving Flight: Telemetry Bar, Baseline Measurement, קיצור מסלול ב־20% וחישוב Savings%",
    "unit": "יחידה 3 — צילום, הצלה ואופטימיזציה",
    "concept": "Telemetry, Battery ו־Code Optimization: להשיג אותן שלוש תמונות בפחות פקודות, פחות פניות ופחות שינויי גובה",
    "story": "צוותי NASA JPL מדווחים על משבר אנרגטי ברחפן החקר Ingenuity על מאדים: אבק על הלוחות הסולאריים מגביל את טעינת הסוללה, ולכן כל סיבוב Yaw מיותר וכל שינוי גובה סרק עלולים לעלות במשימה. התלמידים לוקחים את קוד החילוץ ממפגש 8, מנתחים אותו כמו מהנדסי טיסה, ומבצעים אופטימיזציה כך שהרחפן יצלם את אותן שלוש תחנות במסלול קצר וחסכוני יותר.",
    "mission": "לטעון את קוד Meeting8_SearchAndRescue_JS, לשמור עותק חדש בשם Meeting9_EcoFlight_JS, למדוד Baseline בעזרת Telemetry Bar לפני ואחרי ריצה, לזהות פקודות בזבזניות כמו שינויי גובה מיותרים ופניות yaw רבות, לבנות גרסת EcoFlight עם גובה בטוח קבוע, flyRight/flyLeft במקום yaw מיותר, שלוש נקודות צילום חובה, ולחשב Savings % = (Original Consumption - Optimized Consumption) / Original Consumption × 100. בסיום שומרים Meeting9_EcoFlight_Optimized ומשתפים קישור.",
    "commands": [
      "telemetry",
      "baseline",
      "optimization",
      "battery_protocol",
      "let_variable",
      "function",
      "flyUp",
      "flyForward",
      "flyRight",
      "flyLeft",
      "takePhoto",
      "savings_formula",
      "save_cloud"
    ],
    "blocks": [
      "telemetry",
      "baseline",
      "optimization",
      "battery_protocol",
      "let_variable",
      "function",
      "flyUp",
      "flyForward",
      "flyRight",
      "flyLeft",
      "takePhoto",
      "savings_formula",
      "save_cloud"
    ],
    "workspaceMode": "physical-drone",
    "physicalFlightAllowed": true,
    "essentialQuestion": "איך מהנדסי רחפן מקבלים אותה איכות צילום בפחות אנרגיה, בלי לפגוע בבטיחות ובאיסוף המידע?",
    "successCriteria": [
      "אני יודע/ת למדוד אחוז סוללה בתחילת וסיום ריצה בעזרת Telemetry Bar.",
      "אני מחשב/ת Original Consumption ו־Optimized Consumption באחוזים.",
      "אני מזהה לפחות שתי פקודות בזבזניות: שינויי גובה מיותרים, yaw מיותר או תנועה חוזרת.",
      "אני מקצר/ת את מסלול הטיסה בכ־20% בלי לוותר על שלוש תחנות צילום.",
      "אני משתמש/ת במשתנים או פונקציה כדי להפוך את הקוד לקריא וחסכוני יותר.",
      "אני מחשב/ת Savings% ומסביר/ה אם השיפור אמיתי או רק נראה קצר יותר.",
      "אני שומר/ת Meeting9_EcoFlight_Optimized ומשתף/ת קישור למדריך."
    ],
    "realWorldUses": [
      {
        "icon": "🔴",
        "title": "NASA JPL / Ingenuity",
        "text": "ברחפן חלל כל גרם אנרגיה חשוב; אבק על לוחות סולאריים מחייב נתיבי טיסה קצרים ובטוחים."
      },
      {
        "icon": "📦",
        "title": "Zipline medical delivery",
        "text": "משלוחי רפואה אוטונומיים דורשים נתיב יעיל שמגיע ליעד וחוזר לפני ירידת מתח מסוכנת."
      },
      {
        "icon": "🔋",
        "title": "Battery‑Saving Flight",
        "text": "קוד קצר יותר אינו תמיד טוב יותר; קוד יעיל הוא כזה שמפחית תנועה מיותרת ושומר על תוצרי צילום מלאים."
      }
    ],
    "vocabulary": [
      ["Telemetry Bar", "חיווי באפליקציה שמציג נתונים בזמן אמת, כולל אחוז סוללה לפני ואחרי ריצה."],
      ["Baseline Measurement", "מדידת קו בסיס: כמה אנרגיה צורכת הגרסה המקורית לפני אופטימיזציה."],
      ["Original Consumption", "אחוז התחלה פחות אחוז סיום בקוד הישן."],
      ["Optimized Consumption", "אחוז התחלה פחות אחוז סיום בקוד המשופר."],
      ["Savings %", "נוסחת החיסכון: (צריכה מקורית - צריכה משופרת) / צריכה מקורית × 100."],
      ["Code Optimization", "שיפור קוד כך שישיג אותה תוצאה בפחות פקודות, פחות זמן ופחות צריכת סוללה."],
      ["Idle Movement", "תנועה או פנייה שאינה מוסיפה מידע למשימה ומבזבזת אנרגיה."],
      ["Constant Safe Altitude", "גובה בטוח קבוע שמפחית עליות/ירידות מיותרות בין תחנות צילום."]
    ],
    "safetyRules": [
      "טיסה פיזית רק באישור מדריך, Safe Fly Zone, משקפי מגן, שיער אסוף ומגיני פרופלורים.",
      "אין להריץ Baseline אם הסוללה אינה יציבה או נמוכה; נוחתים ומחליפים סוללה מקופסת 100%.",
      "מודד/ת הטלמטריה רושם אחוז התחלה וסיום מיד, בלי להפריע ל־Driver בזמן הטיסה.",
      "קריאת המראה חובה: “צוות X ממריא לריצת אופטימיזציה!”.",
      "אופטימיזציה אינה תירוץ לטיסה מהירה מדי או קרובה מדי למכשולים; בטיחות קודמת לחיסכון.",
      "משנים פרמטר/נתיב אחד בכל ריצת בדיקה כדי לדעת מה באמת חסך סוללה.",
      "נוהל שתי קופסאות: סוללות מלאות וסוללות ריקות/חשודות מופרדות ומתועדות."
    ],
    "commonDirections": [
      ["Telemetry Start", "רושמים אחוז סוללה לפני Run, לא מהזיכרון ולא בערך."],
      ["Telemetry End", "רושמים אחוז סוללה מיד אחרי נחיתה, לפני החלפת סוללה או WiFi."],
      ["Remove idle yaw", "בודקים אם yawRight/yawLeft באמת נדרש לצילום, או שאפשר לשמור אוריינטציה ולעבור ב־flyRight/flyLeft."],
      ["constantSafeAlt", "במקום לעלות ולרדת בין מכשולים, בוחרים גובה בטוח קבוע אם הכיתה מאפשרת זאת."],
      ["Keep evidence", "אין לחסוך על חשבון שלוש תמונות החקר — תחנות A/B/C חייבות להישאר."],
      ["Savings %", "מחשבים: (Original Consumption - Optimized Consumption) / Original Consumption × 100."],
      ["Meeting9_EcoFlight_Optimized", "שם גרסת ההגשה אחרי בדיקה, חישוב ושיתוף."]
    ],
    "setupSteps": [
      "טאבלטים טעונים ו־DroneBlocks Code פתוח על WiFi בית ספרי.",
      "להכין את קוד מפגש 8 לטעינה והשוואה: Meeting8_SearchAndRescue_JS.",
      "להכין רחפנים עם מגיני פרופלורים וסוללות ממוספרות.",
      "לסמן Safe Fly Zone עם שלוש תחנות צילום A/B/C או מכשולים מהמפגש הקודם.",
      "להכין טבלת מדידה לצוותים: Start %, End %, Consumption, Savings %, Notes.",
      "להסביר מראש שלא כל צוות חייב להריץ שתי טיסות מלאות אם זמן/סוללות מוגבלים — אפשר baseline מקוצר או נתון מדריך."
    ],
    "tabletTips": [
      "טוענים את פרויקט מפגש 8 ושומרים מיד Save As בשם Meeting9_EcoFlight_JS.",
      "מסמנים בקוד הערות // waste? ליד פקודות חשודות כמו yaw כפול או flyUp/flyDown מיותרים.",
      "משתמשים במשתנים globalיים כמו constantSafeAlt ו־routeDist כדי לכייל בלי לשכתב הכל.",
      "בודקים Telemetry Bar לפני ואחרי הריצה ורושמים מספר מדויק באחוזים.",
      "לאחר הרצה חוזרים ל־WiFi בית ספרי ושומרים Meeting9_EcoFlight_Optimized.",
      "אם החיווי קופץ, לא משתמשים במדידה — נוחתים, מאפסים חיבור ומודדים מחדש."
    ],
    "lessonFlow": [
      {
        "minutes": "0–5",
        "title": "בדיקת תנאי קדם וגשר ממפגש 8",
        "teacher": "מחזיר את משימת Red Cross/SOS ומסביר שהיום לא מוסיפים תחנות — משפרים יעילות ומשמרים איכות צילום.",
        "students": "פותחים את קוד מפגש 8 ומזהים שלוש תחנות צילום חובה."
      },
      {
        "minutes": "5–15",
        "title": "סיפור NASA JPL Ingenuity",
        "teacher": "מציג משבר אנרגטי: אבק על לוחות סולאריים, זמן טיסה מוגבל, וכל תנועה מיותרת צורכת אנרגיה.",
        "students": "מגדירים מה נחשב הצלחה: אותה משימת צילום בפחות צריכת סוללה."
      },
      {
        "minutes": "15–20",
        "title": "מהי אופטימיזציה אנרגטית",
        "teacher": "מסביר Tello: כ־10–13 דקות טיסה, brushless motors, yaw ושינויי גובה כצרכני אנרגיה.",
        "students": "מסמנים בקוד דוגמאות לפקודות שעלולות להיות בזבזניות."
      },
      {
        "minutes": "20–25",
        "title": "Save As לגרסת EcoFlight",
        "teacher": "מנחה לפתוח DroneBlocks Code על WiFi בית ספרי, לטעון מפגש 8 ולשמור Meeting9_EcoFlight_JS.",
        "students": "יוצרים עותק חדש כדי לא להרוס את גרסת החילוץ המקורית."
      },
      {
        "minutes": "25–40",
        "title": "ניתוח בזבזני אנרגיה",
        "teacher": "מציג שתי דוגמאות: גובה קבוע במקום עלייה/ירידה חוזרת; flyRight/flyLeft במקום yaw כפול שאינו נחוץ.",
        "students": "כותבים רשימת שינויים מוצעים ומסמנים מה אסור למחוק — שלוש תחנות הצילום."
      },
      {
        "minutes": "40–52",
        "title": "Baseline Measurement",
        "teacher": "מאשר צוותים למדידת קו בסיס או נותן נתון דוגמה אם אין מספיק סוללות/זמן.",
        "students": "רושמים Start %, End %, Original Consumption בטבלת המדידה."
      },
      {
        "minutes": "52–65",
        "title": "EcoFlight Run",
        "teacher": "מפעיל סבב הרצה אופטימלית עם קריאת המראה, תצפיתן ו־Telemetry Officer.",
        "students": "מריצים קוד משופר, מצלמים שלוש תחנות, נוחתים ורושמים Optimized Consumption."
      },
      {
        "minutes": "65–75",
        "title": "חישוב Savings%",
        "teacher": "מדגים על הלוח: (Original - Optimized) / Original × 100 ומוודא שהמכנה אינו 0.",
        "students": "מחשבים אחוז חיסכון ומנסחים האם השיפור שווה את הסיכון/השינוי."
      },
      {
        "minutes": "75–85",
        "title": "שמירה, שיתוף ודיון הנדסי",
        "teacher": "מבקש הסבר קצר: איזו פקודה הייתה הכי בזבזנית ולמה.",
        "students": "שומרים Meeting9_EcoFlight_Optimized ומשתפים קישור עם נתוני הטלמטריה."
      },
      {
        "minutes": "85–90",
        "title": "תחזוקת סוללות וסיכום",
        "teacher": "אוסף סוללות לפי שתי קופסאות, מזהה סוללות חשודות ומנהל כרטיס יציאה.",
        "students": "מחזירים ציוד ומשלימים: “הפקודה שחסכה הכי הרבה אנרגיה הייתה...”"
      }
    ],
    "exercises": [
      {
        "minutes": "10–18",
        "title": "ציד בזבזני אנרגיה",
        "prompt": "עברו על קוד מפגש 8 וסמנו שלוש פקודות שאולי מבזבזות אנרגיה: yaw, flyUp/flyDown, חזרה למסלול קודם או sleep ארוך מדי.",
        "check": "יש לפחות שתי הצעות שיפור ושמירה על שלוש תמונות חובה."
      },
      {
        "minutes": "20–28",
        "title": "Save As בטוח",
        "prompt": "שמרו עותק בשם Meeting9_EcoFlight_JS והוסיפו Comment: // optimization goal: same photos, less battery.",
        "check": "הקוד המקורי לא נדרס ויש גרסה חדשה."
      },
      {
        "minutes": "28–40",
        "title": "נתיב חסכוני",
        "prompt": "תכננו נתיב שבו הרחפן שומר על גובה בטוח קבוע ומשתמש ב־flyRight/flyLeft במקום yaw מיותר ככל האפשר.",
        "check": "הנתיב עדיין מגיע לתחנות A/B/C."
      },
      {
        "minutes": "40–52",
        "title": "מדידת Baseline",
        "prompt": "רשמו Start %, End %, וחשבו Original Consumption = Start - End.",
        "check": "המספרים נרשמו מיד אחרי הטיסה ולא בדיעבד."
      },
      {
        "minutes": "52–65",
        "title": "הרצת EcoFlight",
        "prompt": "הריצו את הגרסה המשופרת באישור מדריך ורשמו Optimized Consumption.",
        "check": "ההרצה שמרה על בטיחות ועל כל תחנות הצילום."
      },
      {
        "minutes": "65–75",
        "title": "חישוב Savings%",
        "prompt": "חשבו Savings % = (Original Consumption - Optimized Consumption) / Original Consumption × 100.",
        "check": "הצוות יודע להסביר את החישוב במילים."
      },
      {
        "minutes": "75–90",
        "title": "דוח מהנדסי טיסה ירוקים",
        "prompt": "שמרו Meeting9_EcoFlight_Optimized וכתבו: מה שינינו, כמה חסכנו, ומה לא הרשינו לעצמנו למחוק.",
        "check": "יש Share Link, חישוב חיסכון והסבר בטיחותי."
      }
    ],
    "deliverable": "Meeting9_EcoFlight_Optimized + טבלת Telemetry קצרה: Start %, End %, Original Consumption, Optimized Consumption, Savings % + הסבר אילו פקודות צומצמו בלי לפספס תמונות חקר.",
    "assessment": [
      "הצוות מדד Telemetry Bar בתחילת וסיום הרצה ולא הסתמך על הערכה כללית.",
      "הקוד האופטימלי שומר על שלוש תחנות צילום חובה מהמשימה המקורית.",
      "יש הסבר ברור לפקודות שבוטלו או הוחלפו: yaw, שינויי גובה או תנועה חוזרת.",
      "הצוות חישב Savings% בצורה נכונה והציג Original מול Optimized Consumption.",
      "Driver/Navigator/Safety Observer/Telemetry Officer פעלו בתפקידים ברורים.",
      "החיסכון לא בא על חשבון Safe Fly Zone, מרחק ממכשולים או נחיתה בטוחה.",
      "Meeting9_EcoFlight_Optimized נשמר ושויך לצוות."
    ],
    "debugging": [
      {
        "problem": "הרחפן בקושי ממריא או נוחת מיד בגלל Low Battery",
        "fix": "נוחתים/לא ממריאים. מחליפים לסוללה מלאה מקופסת 100%, רושמים את מספר הסוללה החשודה, ולא משאירים סוללות ברחפנים באחסון."
      },
      {
        "problem": "Telemetry Bar קופץ או מציג אחוז לא אמין",
        "fix": "מבצעים נחיתה מסודרת, מכבים רחפן, מנתקים ומחברים סוללה, מרעננים אפליקציה ומודדים מחדש רק לאחר חיווי יציב."
      },
      {
        "problem": "הקוד האופטימלי מפספס תחנת צילום",
        "fix": "האופטימיזציה פסלה תוצר. מחזירים את תחנת הצילום ומשפרים במקום אחר: yaw מיותר, תנועה חזרה או שינוי גובה."
      },
      {
        "problem": "Savings% יצא שלילי",
        "fix": "הגרסה המשופרת צרכה יותר אנרגיה. בודקים אם נוספו פניות/גובה/זמן ריחוף, או אם המדידה נעשתה בסוללות שונות מדי."
      },
      {
        "problem": "הצוות מוחק sleep לפני צילום כדי לחסוך זמן",
        "fix": "עוצרים ומסבירים: חיסכון שמייצר תמונה מטושטשת אינו אופטימיזציה. משאירים sleep מינימלי שמפיק ראיה שימושית."
      }
    ],
    "differentiation": {
      "support": [
        "לתת טבלת מדידה מוכנה ודוגמת חישוב Savings% עם מספרים פשוטים.",
        "לאפשר שימוש בנתון Baseline שהמדריך מספק במקום שתי טיסות מלאות.",
        "לתת רשימת פקודות חשודות מראש: yaw, flyUp/flyDown, חזרה לנקודת התחלה.",
        "להתמקד בשינוי אחד בלבד: גובה קבוע או החלפת yaw בתנועה צדית."
      ],
      "extension": [
        "להוסיף פונקציה flyPhotoStation(xMove, label) ולהשוות מספר שורות קוד לפני/אחרי.",
        "לחשב גם צריכת אנרגיה ממוצעת לפקודה: Consumption / מספר פקודות תנועה.",
        "להציג שתי גרסאות אופטימיזציה ולנמק איזו בטוחה יותר.",
        "להוסיף טבלת tradeoff: חיסכון אנרגטי מול חדות צילום מול מרחק ממכשולים."
      ]
    },
    "instructorGuide": {
      "prerequisites": "התלמידים מגיעים אחרי מפגש 8 עם קוד Search & Rescue הכולל שלוש תחנות צילום. לפני מפגש 9 יש לוודא שהם מבינים targetDist, flyUp/flyRight/yawRight/takePhoto, נוהל שתי רשתות, תפקידי צוות ו־Data Download. שיעור 9 אינו מוסיף תחנות; הוא מלמד מדידה, ניתוח ושיפור תחת מגבלת סוללה.",
      "pedagogy": [
        "להדגיש שאופטימיזציה אינה “למחוק פקודות כדי שיהיה קצר”, אלא לשמור תוצאה ולצמצם בזבוז.",
        "לחבר את המתמטיקה להנדסה: אחוזי סוללה הם נתון טלמטרי שמוביל החלטה, לא קישוט במסך.",
        "לשמור על בטיחות: אין תחרות מהירות ואין קיצור דרך שמקרב רחפן למכשולים.",
        "לקדם שיח צוותי: כל שינוי צריך נימוק הנדסי ותיעוד בטבלה.",
        "אם אין מספיק סוללות לשתי הרצות, להשתמש ב־baseline מדגים ולא לוותר על חישוב החיסכון."
      ],
      "exitTicket": "הפקודה או הדפוס שחסכנו ממנו הכי הרבה אנרגיה היה ___, כי ___."
    },
    "appWorkflowTitle": "DroneBlocks Code + EcoFlight Telemetry Lab",
    "appWorkflowNote": "מפגש 9 הוא מעבדת אופטימיזציה פיזית. מתחילים מ־Meeting8_SearchAndRescue_JS, שומרים עותק EcoFlight, מודדים Telemetry Bar, משפרים נתיב, מחשבים Savings%, ורק אז מגישים Meeting9_EcoFlight_Optimized.",
    "appWorkflow": [
      {
        "title": "Load + Save As",
        "detail": "על WiFi בית ספרי פתחו DroneBlocks Code, טענו את Meeting8_SearchAndRescue_JS ושמרו עותק חדש בשם Meeting9_EcoFlight_JS."
      },
      {
        "title": "Find Energy Wasters",
        "detail": "סמנו בקוד yaw מיותר, שינויי flyUp/flyDown חוזרים, חזרה מיותרת לנקודת התחלה ו־sleep שאינו משרת צילום."
      },
      {
        "title": "Baseline Measurement",
        "detail": "Baseline Measurement: לפני הרצה רושמים Telemetry Start %. אחרי נחיתה רושמים Telemetry End %. Original Consumption = Start - End."
      },
      {
        "title": "EcoFlight Code",
        "detail": "בנו גרסה עם constantSafeAlt, פחות yaw, יותר flyRight/flyLeft, ובלי לוותר על שלוש תמונות החקר."
      },
      {
        "title": "Optimized Run + Formula",
        "detail": "מריצים באישור מדריך, רושמים Optimized Consumption ומחשבים Savings % = (Original - Optimized) / Original × 100."
      },
      {
        "title": "Save + Share",
        "detail": "שומרים Meeting9_EcoFlight_Optimized וחוזרים ל־WiFi בית ספרי לשיתוף קישור וטבלת Telemetry."
      }
    ],
    "visualDiagram": {
      "panelTitle": "🔋 NASA JPL EcoFlight",
      "chip": "Battery Optimization",
      "title": "Baseline מול EcoFlight — אותו צילום בפחות אנרגיה",
      "src": "assets/drone-mission-lab-grade8/lesson9/nasa-jpl-ecoflight-battery-optimization.svg",
      "alt": "תרשים אופטימיזציה לכיתה ח׳ עם נתיב בסיס בזבזני מול נתיב EcoFlight, שלוש תחנות צילום, Telemetry Bar ונוסחת Savings%",
      "caption": "מפגש 9 הופך את התלמידים למהנדסי יעילות: מודדים סוללה, משווים נתיבים, מקצרים תנועה מיותרת ומוכיחים חיסכון במספרים."
    },
    "videoResources": [
      {
        "title": "NASA Ingenuity Mars helicopter battery dust energy — search suggestion",
        "url": "https://www.youtube.com/results?search_query=NASA+Ingenuity+Mars+helicopter+battery+dust+energy",
        "note": "השראה על מגבלות אנרגיה ברחפן חקר פלנטרי."
      },
      {
        "title": "Zipline drone delivery route optimization energy — fallback",
        "url": "https://www.youtube.com/results?search_query=Zipline+drone+delivery+route+optimization+energy",
        "note": "חלופה על תכנון נתיבי משלוח חסכוניים באנרגיה."
      }
    ],
    "screenshotSlides": [
      {
        "title": "NASA JPL EcoFlight",
        "src": "assets/drone-mission-lab-grade8/lesson9/nasa-jpl-ecoflight-battery-optimization.svg",
        "caption": "השוואת נתיב baseline בזבזני מול נתיב EcoFlight ישיר עם Telemetry Bar וחישוב Savings%."
      },
      {
        "title": "פותחים את קוד מפגש 8",
        "src": "assets/drone-mission-lab-grade8/lesson8/redcross-search-rescue-obstacle-photo-mission.svg",
        "caption": "Meeting8_SearchAndRescue_JS הוא נקודת המוצא לאופטימיזציה."
      },
      {
        "title": "WiFi + Battery Protocol",
        "src": "assets/drone-mission-lab-grade8/lesson5/tello-wifi-handshake.svg",
        "caption": "School WiFi לשמירה, TELLO WiFi להרצה, ונוהל שתי קופסאות לסוללות."
      },
      {
        "title": "שומרים גרסה מיטבית",
        "src": "assets/tello-mission-lab/lesson1/save-share.png",
        "caption": "Meeting9_EcoFlight_Optimized + Share Link + טבלת Telemetry."
      }
    ],
    "instructorSlides": [
      {
        "title": "NASA JPL: משבר אנרגטי",
        "body": "Ingenuity צריך לבצע אותה משימת חקר עם פחות טעינה בגלל אבק על לוחות סולאריים.",
        "bullets": ["battery", "dust", "mission risk"]
      },
      {
        "title": "Tello: 10–13 דקות בלבד",
        "body": "סוללת Tello קטנה וקלה. כל yaw, עלייה, ירידה וריחוף מיותר עובדים על המנועים וצורכים זרם.",
        "bullets": ["LiPo", "brushless", "limited flight time"]
      },
      {
        "title": "מה לא מוחקים?",
        "body": "שלוש תמונות החקר הן דרישת משימה. חיסכון שמוחק מידע אינו אופטימיזציה.",
        "bullets": ["3 photos", "evidence", "mission integrity"]
      },
      {
        "title": "Telemetry Bar",
        "body": "מודדים אחוז התחלה וסיום. בלי מדידה אין טענה הנדסית לחיסכון.",
        "bullets": ["Start %", "End %", "Consumption"]
      },
      {
        "title": "בזבזני אנרגיה",
        "body": "שינויי גובה חוזרים ופניות yaw כפולות הם מועמדים ראשונים לבדיקה.",
        "bullets": ["flyUp/down", "yaw", "idle movement"]
      },
      {
        "title": "נוסחת Savings%",
        "body": "Savings % = (Original Consumption - Optimized Consumption) / Original Consumption × 100.",
        "bullets": ["baseline", "optimized", "proof"]
      },
      {
        "title": "בטיחות לפני תחרות",
        "body": "אין מרוץ מהירות ואין קיצור מסוכן. צוות ירוק הוא צוות שחוסך אנרגיה ושומר על בטיחות ותוצר מלא.",
        "bullets": ["Safe Fly Zone", "Abort", "quality"]
      }
    ]
  });


  Object.assign(window.DRONE_MISSION_LAB_GRADE8_LESSONS[9], {
    "title": "שיעור 10: Pix4D City Mapper Blueprint — אפיון פרויקט הגמר ואב־טיפוס דיגיטלי",
    "subtitle": "Tello Mission Lab Project Blueprint: Paper Blueprint, Software Architecture, City Simulator ו־JavaScript Prototype — ללא הטסה פיזית",
    "unit": "יחידה 4 — פרויקט חקר מצולם",
    "concept": "Software Architecture ו־Project Blueprint: מתכננים על נייר לפני קוד, ואז בונים אב־טיפוס JavaScript בסימולטור City",
    "story": "חברת Pix4D יחד עם מערך החירום העירוני הכריזו על אתגר לפיתוח מערכת מיפוי נזקי מבנים אוטונומית. התלמידים אינם רצים לטוס; הם נכנסים לתפקיד מהנדסי מערכת ומפתחי אוטונומיה: משרטטים מסלול צילום מעל שלושה בניינים בגבהים שונים, מגדירים משתנים, זוויות, נקודות צילום וקריטריוני הצלחה, ורק אחרי אישור מדריך עוברים ל־DroneBlocks Code ול־City Simulator.",
    "mission": "לעבוד בטאבלטים הפוכים בשלב התכנון, להכין Paper Blueprint על דף משבצות למסלול City Mapper מעל שלושה בניינים בגבהים 60, 80 ו־120 אינץ׳, להגדיר משתני JavaScript כמו scanDist, safeAltitude ו־photoDelay, לקבל Instructor Sign‑off, לפתוח DroneBlocks Code על WiFi בית ספרי, ליצור Meeting10_Project_Blueprint_JS, לבנות אב־טיפוס JavaScript ב־City Simulator עם tello.flyUp, tello.flyForward, tello.takePhoto, tello.yawRight(180), tello.flyDown ו־tello.land, ולשתף קישור ענן. אין חיבור TELLO WiFi ואין הטסה פיזית במפגש 10.",
    "commands": [
      "blueprint",
      "software_architecture",
      "signoff",
      "city_simulator",
      "let_variable",
      "function",
      "for_loop",
      "flyUp",
      "flyForward",
      "sleep",
      "takePhoto",
      "yawRight",
      "flyDown",
      "prototype",
      "save_cloud"
    ],
    "blocks": [
      "blueprint",
      "software_architecture",
      "signoff",
      "city_simulator",
      "let_variable",
      "function",
      "for_loop",
      "flyUp",
      "flyForward",
      "sleep",
      "takePhoto",
      "yawRight",
      "flyDown",
      "prototype",
      "save_cloud"
    ],
    "workspaceMode": "droneblocks-code",
    "physicalFlightAllowed": false,
    "essentialQuestion": "איך אפיון נייר וארכיטקטורת תוכנה מונעים שגיאות לפני שמתחילים לכתוב קוד רחפן מורכב?",
    "successCriteria": [
      "אני עובד/ת קודם על Paper Blueprint עם טאבלט סגור או הפוך.",
      "אני משרטט/ת מסלול, גבהים, מרחקים, זוויות Yaw ונקודות צילום לפני כתיבת קוד.",
      "אני מגדיר/ה משתני JavaScript מרכזיים: scanDist, safeAltitude ו־photoDelay.",
      "אני מקבל/ת Instructor Sign‑off לפני פתיחת DroneBlocks Code.",
      "אני בונה אב־טיפוס ב־City Simulator בלבד, ללא TELLO WiFi וללא הטסה פיזית.",
      "אני משלב/ת takePhoto אחרי sleep כדי לשמור על איכות צילום בפרויקט.",
      "אני שומר/ת Meeting10_Project_Blueprint_JS ומשתף/ת קישור ענן."
    ],
    "realWorldUses": [
      {
        "icon": "🗺️",
        "title": "Pix4D / Photogrammetry",
        "text": "רחפנים מצלמים אזור מכמה נקודות כדי לבנות מודלים, מפות ותיעוד נזקי מבנים."
      },
      {
        "icon": "🏙️",
        "title": "Emergency city mapping",
        "text": "בזירת אסון עירונית, תכנון מסלול מראש מונע החמצת אזורים ומפחית סיכון."
      },
      {
        "icon": "📐",
        "title": "Software Architecture",
        "text": "קוד מורכב מתחיל באפיון: משתנים, פונקציות, רצף בדיקות וקריטריוני הצלחה לפני Run."
      }
    ],
    "vocabulary": [
      ["Blueprint", "תוכנית הנדסית מוקדמת: מסלול, מרחקים, גבהים, זוויות ונקודות צילום לפני קוד."],
      ["Software Architecture", "פירוק מערכת גדולה לרכיבים קטנים: משתנים, פונקציות, שלבי טיסה ותוצרי צילום."],
      ["Paper Blueprint", "דף שרטוט פיזי שבו עובדים לפני פתיחת הטאבלט כדי למנוע אלתור."],
      ["City Simulator", "סביבת סימולציה תלת־ממדית לבדיקת אב־טיפוס בשכונה וירטואלית."],
      ["Prototype", "אב־טיפוס ראשוני שמוכיח רעיון לפני מעבר להרצות מורכבות או פיזיות."],
      ["scanDist", "מרחק מעבר בין בניינים/תחנות צילום."],
      ["safeAltitude", "גובה מעבר בטוח מעל המבנה הגבוה ביותר במסלול."],
      ["photoDelay", "זמן השהיית יציבות לפני צילום כדי לצמצם טשטוש."
      ]
    ],
    "safetyRules": [
      "מפגש 10 הוא טאבלטים וסימולטור בלבד — אין TELLO WiFi ואין הטסה פיזית.",
      "טאבלטים הפוכים בזמן Paper Blueprint: קודם חושבים ומשרטטים, אחר כך מקודדים.",
      "אין מעבר ל־DroneBlocks Code לפני Instructor Sign‑off על דף האפיון.",
      "הקוד חייב להסתיים ב־tello.land גם בסימולטור; בטיחות היא הרגל קוד.",
      "אין להשתמש במרחקים/גבהים פיזיים כהמלצה להרצה אמיתית — זה אב־טיפוס דיגיטלי בלבד.",
      "אם City Simulator איטי/קופא, סוגרים אפליקציות רקע ומרעננים — לא עוברים לרחפן פיזי כקיצור דרך.",
      "שמירה בענן מתבצעת על WiFi בית ספרי בלבד."
    ],
    "commonDirections": [
      ["Tablets face down", "בשלב Blueprint הטאבלט סגור/הפוך כדי למנוע קפיצה מוקדמת לקוד."],
      ["scanDist = 100", "משתנה מרחק בין בניינים; מתחילים בערך אחיד ומסבירים למה."],
      ["safeAltitude = 120", "גובה מעבר מעל הבניין הגבוה; בסימולטור בלבד ובאישור תכנון."],
      ["photoDelay = 3", "השהיית ייצוב לפני takePhoto כדי למנוע Motion Blur."],
      ["yawRight(180)", "חזרה או כיוון מחדש אחרי סיום שלוש נקודות צילום."],
      ["City Simulator", "בודקים Prototype דיגיטלי בעיר וירטואלית, לא ברחפן אמיתי."],
      ["Meeting10_Project_Blueprint_JS", "שם הפרויקט בענן להגשה ושיתוף."
      ]
    ],
    "setupSteps": [
      "טאבלטים טעונים אך סגורים בתחילת שיעור Blueprint.",
      "WiFi בית ספרי פעיל לשלב שמירה בענן בהמשך.",
      "דפי Tello Mission Lab Blueprint Sheets מודפסים לכל קבוצה.",
      "עפרונות, מחקים וסרגלים לכל צוות.",
      "מקרן להצגת Pix4D/DroneDeploy ודוגמת City Mapper.",
      "להכין קריטריוני Sign‑off: מסלול, גבהים, מרחקים, נקודות צילום, משתנים וסיום בטוח."
    ],
    "tabletTips": [
      "לא פותחים DroneBlocks Code עד שהמדריך חותם על Paper Blueprint.",
      "לאחר אישור, פותחים על WiFi בית ספרי ויוצרים Meeting10_Project_Blueprint_JS.",
      "בודקים את Function Reference לפני כתיבת פקודות כמו yawRight או flyDown.",
      "משתמשים ב־City Simulator בלבד; אין TELLO WiFi ואין Run פיזי.",
      "אם Save Failed מופיע, מעתיקים את הקוד לגיבוי טקסט, מתחברים מחדש לחשבון ומנסים שוב.",
      "מצרפים Share Link ודף Blueprint מצולם/מתועד להגשה."
    ],
    "lessonFlow": [
      {
        "minutes": "0–5",
        "title": "גשר ממפגש 9: מאופטימיזציה לארכיטקטורה",
        "teacher": "מזכיר שבמפגש 9 שיפרנו קוד קיים; היום מתכננים פרויקט גדול לפני כתיבה.",
        "students": "מסבירים למה שינוי אחד בקוד עדיף על אלתור, ומניחים טאבלטים הפוכים."
      },
      {
        "minutes": "5–15",
        "title": "סיפור Pix4D City Mapper",
        "teacher": "מציג אתגר מיפוי נזקי מבנים: שלושה גגות בגבהים 60/80/120 אינץ׳ וצילום אנכי לכל גג.",
        "students": "מזהים תוצרי פרויקט: Blueprint, קוד Prototype, Share Link."
      },
      {
        "minutes": "15–20",
        "title": "מהו Blueprint הנדסי",
        "teacher": "משווה בנאי לארכיטקט: בלי תוכנית אדריכלית, גם קוד יפה יכול לקרוס.",
        "students": "מגדירים מה חייב להופיע בתוכנית: מסלול, גובה, צילום, נחיתה."
      },
      {
        "minutes": "20–40",
        "title": "Paper Blueprint — טאבלטים הפוכים",
        "teacher": "מחלק דפי משבצות, מגדיר תפקידי System Architect, Lead Coder, Safety Supervisor ומבצע סבבי שאלות.",
        "students": "משרטטים מסלול, מסמנים נקודות צילום, זוויות yaw, גבהים ומשתני JS."
      },
      {
        "minutes": "40–45",
        "title": "Instructor Sign‑off",
        "teacher": "בודק לכל צוות: האם יש שלוש נקודות צילום, safeAltitude, scanDist, photoDelay ונחיתה.",
        "students": "מציגים את הדף ומקבלים אישור שיגור לפיתוח דיגיטלי."
      },
      {
        "minutes": "45–55",
        "title": "פתיחת DroneBlocks Code ופרויקט ענן",
        "teacher": "מנחה לפתוח WiFi בית ספרי, להתחבר לחשבון וליצור Meeting10_Project_Blueprint_JS.",
        "students": "יוצרים פרויקט, כותבים כותרת והערות פתיחה לפי Blueprint."
      },
      {
        "minutes": "55–72",
        "title": "בניית אב־טיפוס JavaScript",
        "teacher": "מדגים משתנים גלובליים וקטעי קוד: scanDist, safeAltitude, photoDelay, flyUp, takePhoto, yawRight(180), land.",
        "students": "ממירים את הדף לקוד ומריצים ב־City Simulator בלבד."
      },
      {
        "minutes": "72–80",
        "title": "דיבוג סימולטור ושמירה",
        "teacher": "מסייע ב־City Simulator איטי/Save Failed ומדגיש גיבוי קוד לפני רענון.",
        "students": "מתקנים שגיאה אחת, שומרים בענן ומפיקים Share Link."
      },
      {
        "minutes": "80–87",
        "title": "Code Review קצר",
        "teacher": "מבקש מכל צוות להראות: משתנים, שלוש תמונות, חזרה/נחיתה ושאלה אחת למפגש הבא.",
        "students": "מציגים Prototype ומסמנים מה יהיה קשה להעברה לפיזי: drift, נחיתה, יציבות מצלמה."
      },
      {
        "minutes": "87–90",
        "title": "סיכום וסדר",
        "teacher": "אוסף דפי Blueprint/קישורים, מוודא סגירת טאבלטים וסידור ציוד.",
        "students": "מגישים קישור ומשלימים כרטיס יציאה על תכנון לפני קוד."
      }
    ],
    "exercises": [
      {
        "minutes": "10–18",
        "title": "רשימת דרישות פרויקט",
        "prompt": "כתבו חמש דרישות לפרויקט City Mapper: בניינים, גבהים, נקודות צילום, חזרה ונחיתה.",
        "check": "יש שלוש נקודות צילום וסיום בטוח."
      },
      {
        "minutes": "20–32",
        "title": "Paper Blueprint",
        "prompt": "שרטטו על דף משבצות את המנחת, בניין א׳/ב׳/ג׳, נתיב טיסה ונקודות צילום.",
        "check": "השרטוט כולל מרחקים/גבהים ולא רק ציור כללי."
      },
      {
        "minutes": "32–40",
        "title": "משתני JavaScript",
        "prompt": "הגדירו בראש הדף אילו משתנים יהיו בקוד: scanDist, safeAltitude, photoDelay ועוד אחד לבחירתכם.",
        "check": "המשתנים מחוברים לצורך ממשי במסלול."
      },
      {
        "minutes": "40–45",
        "title": "Sign‑off Pitch",
        "prompt": "הציגו למדריך את Blueprint ב־60 שניות וקבלו אישור לפני פתיחת הטאבלט.",
        "check": "המדריך מאשר או מחזיר לתיקון נקודתי."
      },
      {
        "minutes": "45–60",
        "title": "שלד קוד Prototype",
        "prompt": "כתבו כותרת, משתנים גלובליים, takeoff, sleep, נקודת צילום ראשונה ו־land.",
        "check": "יש קוד רץ מינימלי ולא קטעים מפוזרים."
      },
      {
        "minutes": "60–75",
        "title": "City Simulator Run",
        "prompt": "השלימו שלוש נקודות צילום והריצו ב־City Simulator בלבד.",
        "check": "הסימולטור מציג רצף הגיוני ושגיאת קוד אחת מתועדת."
      },
      {
        "minutes": "75–90",
        "title": "Share + Reflection",
        "prompt": "שמרו Meeting10_Project_Blueprint_JS וענו: איזו שגיאה נמנעה בזכות Paper Blueprint?",
        "check": "יש Share Link ותשובה שמחברת תכנון לדיבוג."
      }
    ],
    "deliverable": "Paper Blueprint מאושר + פרויקט DroneBlocks Code בשם Meeting10_Project_Blueprint_JS + אב־טיפוס City Simulator עם שלוש נקודות צילום + Share Link + הערת רפלקציה על מעבר עתידי לפיזי.",
    "assessment": [
      "הצוות עבד קודם על Paper Blueprint ולא קפץ מיד לטאבלט.",
      "השרטוט כולל שלושה בניינים, גבהים, מרחקים, זוויות/נתיב ונקודות צילום.",
      "הקוד כולל משתנים scanDist, safeAltitude ו־photoDelay או מקבילים מוסברים.",
      "האב־טיפוס משתמש ב־City Simulator בלבד, ללא TELLO WiFi וללא טיסה פיזית.",
      "הקוד כולל takePhoto אחרי sleep ומסתיים ב־land.",
      "יש Share Link לפרויקט Meeting10_Project_Blueprint_JS.",
      "הצוות יודע לזהות אתגר אחד למפגש הבא: drift, נחיתה או יציבות מצלמה."
    ],
    "debugging": [
      {
        "problem": "City Simulator איטי, קופא או מציג מסך שחור",
        "fix": "סוגרים אפליקציות רקע, מרעננים את הסימולטור, עוברים ל־Low Settings אם קיים, ולא עוברים לרחפן פיזי במקום הסימולטור."
      },
      {
        "problem": "Save Failed בענן DroneBlocks Code",
        "fix": "בודקים WiFi בית ספרי, מעתיקים את הקוד לגיבוי טקסט, מבצעים Logout/Login ומנסים לשמור שוב."
      },
      {
        "problem": "הצוות פותח טאבלט לפני Blueprint",
        "fix": "מחזירים טאבלטים הפוכים ומבקשים Sign‑off בסיסי: מסלול, גובה, צילום, נחיתה ומשתנים."
      },
      {
        "problem": "הקוד ארוך ומבולגן ללא משתנים",
        "fix": "מחלצים scanDist, safeAltitude ו־photoDelay לראש הקוד ומחליפים מספרים קשיחים בשמות ברורים."
      },
      {
        "problem": "הרחפן בסימולטור לא חוזר לנחיתה",
        "fix": "בודקים שיש yawRight(180) או מסלול חזרה מוגדר, flyDown מתאים ו־tello.land בסיום."
      }
    ],
    "differentiation": {
      "support": [
        "לתת דף Blueprint עם מנחת ושלושה בניינים כבר מסומנים; התלמידים משלימים גבהים ונקודות צילום.",
        "לתת שלד קוד עם משתנים ו־takeoff/land, והתלמידים מוסיפים רק בניין אחד.",
        "לאפשר פסאודו־קוד בעברית לפני JavaScript מלא.",
        "להגדיר תפקיד Safety Supervisor לתלמיד שמתקשה בקוד אך חזק בבדיקת רצף."
      ],
      "extension": [
        "להוסיף פונקציה photoRoof(label, altitudeStep, dist) לבניית קוד נקי יותר.",
        "להשתמש בלולאת for על מערך גבהים/מרחקים ברמת פסאודו־קוד או JS מתקדם.",
        "להוסיף קריטריוני איכות צילום לכל גג: זווית, השהיה, גובה וסדר תמונות.",
        "להשוות שני Blueprints ולבחור את הבטוח/יעיל יותר לפני קידוד."
      ]
    },
    "instructorGuide": {
      "prerequisites": "התלמידים מגיעים אחרי מפגש 9, שבו למדו למדוד ולייעל נתיבי טיסה. מפגש 10 הוא מעבר לפרויקט: אין טיסה פיזית. יש לוודא שהתלמידים מכירים scanDist/safeAltitude/photoDelay, takePhoto אחרי sleep, שמירה בענן וחשיבות Code Review.",
      "pedagogy": [
        "המסר המרכזי: ארכיטקטורה לפני ביצוע. היום לא מודדים הצלחה לפי כמה מהר כתבו קוד, אלא לפי איכות התכנון.",
        "טאבלטים הפוכים הם כלי פדגוגי חשוב: הוא מחזיר את התלמידים לחשיבה מערכתית ולא לניסוי־וטעייה מהיר.",
        "Sign‑off אינו בירוקרטיה; הוא שער בטיחות ואיכות שמונע שגיאות קוד גדולות בהמשך.",
        "להבדיל בין סימולטור לפיזי: כל ערכי הגובה/מרחק היום הם אב־טיפוס דיגיטלי, לא הוראה להרצה בכיתה.",
        "לעודד תפקידים מקצועיים: System Architect, Lead Coder, Safety Supervisor."
      ],
      "exitTicket": "Paper Blueprint מנע מאיתנו שגיאת קוד/תכנון מסוג ___ כי ___."
    },
    "appWorkflowTitle": "Paper Blueprint → DroneBlocks Code → City Simulator",
    "appWorkflowNote": "מפגש 10 הוא שיעור Blueprint וסימולטור בלבד. אין TELLO WiFi ואין טיסה פיזית. האתר מוביל את התהליך; העבודה מתחילה בדף נייר ורק אחרי Sign‑off עוברת ל־DroneBlocks Code ו־City Simulator.",
    "appWorkflow": [
      {
        "title": "Tablets Face Down",
        "detail": "סוגרים/הופכים טאבלטים ומתחילים ב־Paper Blueprint: מנחת, שלושה בניינים, גבהים 60/80/120, נקודות צילום ונתיב חזרה."
      },
      {
        "title": "Variables + Sign‑off",
        "detail": "מגדירים scanDist, safeAltitude, photoDelay וזוויות yaw. מציגים למדריך ומקבלים Instructor Sign‑off לפני קוד."
      },
      {
        "title": "Create Cloud Project",
        "detail": "על WiFi בית ספרי פותחים DroneBlocks Code ויוצרים Meeting10_Project_Blueprint_JS. אין TELLO WiFi במפגש הזה."
      },
      {
        "title": "Build City Prototype",
        "detail": "כותבים JavaScript עם flyUp, flyForward, sleep, takePhoto, yawRight(180), flyDown ו־land, ובודקים ב־City Simulator בלבד."
      },
      {
        "title": "Debug + Save",
        "detail": "אם City Simulator קופא, סוגרים אפליקציות רקע ומרעננים. אם Save Failed, מגבים קוד בטקסט ואז Login מחדש."
      },
      {
        "title": "Share Blueprint Package",
        "detail": "מגישים Share Link, דף Blueprint מאושר, ושאלה אחת למפגש הבא על מעבר לסביבה פיזית."
      }
    ],
    "visualDiagram": {
      "panelTitle": "📐 Pix4D City Blueprint",
      "chip": "Simulator Only",
      "title": "Paper Blueprint לסורק שכונה אוטונומי",
      "src": "assets/drone-mission-lab-grade8/lesson10/pix4d-city-blueprint-prototype.svg",
      "alt": "תרשים Blueprint לכיתה ח׳ עם מנחת, שלושה בניינים בגבהים 60 80 120, נקודות צילום, משתני JavaScript ואישור מדריך לפני City Simulator",
      "caption": "מפגש 10 מעביר את התלמידים ממפעילי קוד לארכיטקטים: תכנון נייר, משתנים, Sign‑off ואז אב־טיפוס דיגיטלי בלבד בסימולטור City."
    },
    "videoResources": [
      {
        "title": "Pix4D drone photogrammetry city mapping — search suggestion",
        "url": "https://www.youtube.com/results?search_query=Pix4D+drone+photogrammetry+city+mapping",
        "note": "השראה על צילום רחפנים לבניית מפות ומודלים תלת־ממדיים."
      },
      {
        "title": "DroneDeploy disaster mapping drone 3D model — fallback",
        "url": "https://www.youtube.com/results?search_query=DroneDeploy+disaster+mapping+drone+3D+model",
        "note": "חלופה על מיפוי נזקי מבנים ואזורים עירוניים."
      }
    ],
    "screenshotSlides": [
      {
        "title": "Pix4D City Mapper Blueprint",
        "src": "assets/drone-mission-lab-grade8/lesson10/pix4d-city-blueprint-prototype.svg",
        "caption": "Paper Blueprint, שלושה בניינים, נקודות צילום, משתני JavaScript ו־City Simulator בלבד."
      },
      {
        "title": "פותחים DroneBlocks Code רק אחרי Sign‑off",
        "src": "assets/tello-mission-lab/lesson1/open-app.png",
        "caption": "Meeting10_Project_Blueprint_JS נוצר רק אחרי אישור מדריך על דף האפיון."
      },
      {
        "title": "City Simulator Prototype",
        "src": "assets/tello-mission-lab/lesson1/simulator-run.png",
        "caption": "בודקים את אב־הטיפוס בעיר וירטואלית; אין TELLO WiFi ואין Run פיזי."
      },
      {
        "title": "Save & Share Blueprint Package",
        "src": "assets/tello-mission-lab/lesson1/save-share.png",
        "caption": "Share Link + דף Blueprint + שאלה למעבר למפגש הבא."
      }
    ],
    "instructorSlides": [
      {
        "title": "Pix4D: פרויקט מיפוי נזקי מבנים",
        "body": "התלמידים מתכננים מערכת צילום אוטונומית, לא רק מסלול טיסה. התוצר הוא Blueprint + Prototype.",
        "bullets": ["mapping", "3 roofs", "prototype"]
      },
      {
        "title": "ארכיטקט לפני מתכנת",
        "body": "בנאי בלי תוכנית עלול להפיל בית; מתכנת בלי Blueprint עלול להפיל משימה.",
        "bullets": ["plan", "variables", "sequence"]
      },
      {
        "title": "טאבלטים הפוכים",
        "body": "20 דקות ראשונות של תכנון נייר מחייבות חשיבה לפני ניסוי וטעייה.",
        "bullets": ["paper", "focus", "sign‑off"]
      },
      {
        "title": "משתני פרויקט",
        "body": "scanDist, safeAltitude ו־photoDelay הם ידיות השליטה של האב־טיפוס.",
        "bullets": ["scanDist", "safeAltitude", "photoDelay"]
      },
      {
        "title": "City Simulator בלבד",
        "body": "אין TELLO WiFi ואין הטסה פיזית. היום מוכיחים תכנון בסביבה דיגיטלית.",
        "bullets": ["simulator", "no physical", "prototype"]
      },
      {
        "title": "מה מכינים למפגש הבא?",
        "body": "בסיום כל צוות יודע מה יהיה קשה במעבר למציאות: drift, נחיתה או יציבות מצלמה.",
        "bullets": ["drift", "landing", "camera stability"]
      }
    ]
  });


  Object.assign(window.DRONE_MISSION_LAB_GRADE8_LESSONS[10], {
    "title": "שיעור 11: SpaceX × NASA JPL Launchpad Testing — בדיקות שטח, דיבגינג וכיול אב־הטיפוס",
    "subtitle": "Simulation‑to‑Reality Gap, Visual Calibration, scanDist/safeAltitude/photoDelay, Photo Offloading וטיסות ניסוי פיזיות מבוקרות",
    "unit": "יחידה 4 — פרויקט חקר מצולם",
    "concept": "בדיקות שטח פיזיות וכיול חזותי: העברת אב־הטיפוס מ־City Simulator למציאות דרך מדידה, משתנים ו־Visual Debugging",
    "story": "צוותי SpaceX ו־NASA JPL הגיעו לשלב Launchpad Flight Testing. אב־הטיפוס שנבנה בסימולטור City במפגש 10 צריך לעבור ניסויי שטח פיזיים בכיתה: להמריא, לטוס מעל שלוש תחנות מבנים בגבהים שונים, לצלם כרטיסיות סדקים/קודים, לפרוק תמונות לטאבלט ולכייל את משתני JavaScript עד שהתמונות חדות וקריאות.",
    "mission": "לטעון על WiFi בית ספרי את Meeting10_Project_Blueprint_JS, לשמור גרסת כיול בשם Meeting11_Project_Calibration_JS, לבדוק שהקוד משתמש במשתנים גלובליים scanDist, safeAltitude ו־photoDelay, לעבור Code Review ו־Pre‑Flight מלא, להתחבר ל־TELLO WiFi רק באישור מדריך, לבצע טיסות ניסוי פיזיות קצרות בתוך Safe Fly Zone, למדוד סטיות מיקום/גובה בסנטימטרים, להוריד תמונות לטאבלט, לכייל משתנה אחד בכל פעם, ולהגיש Meeting11_Project_Calibrated_Success עם שלוש תמונות חדות ויומן כיול.",
    "commands": [
      "sim_to_reality",
      "wifi_handshake",
      "preflight",
      "peer_roles",
      "vps_drift",
      "let_variable",
      "calibration_run",
      "flyUp",
      "flyDown",
      "yawRight",
      "sleep",
      "takePhoto",
      "visual_calibration",
      "photo_offload",
      "battery_protocol",
      "save_cloud"
    ],
    "blocks": [
      "sim_to_reality",
      "wifi_handshake",
      "preflight",
      "peer_roles",
      "vps_drift",
      "let_variable",
      "calibration_run",
      "flyUp",
      "flyDown",
      "yawRight",
      "sleep",
      "takePhoto",
      "visual_calibration",
      "photo_offload",
      "battery_protocol",
      "save_cloud"
    ],
    "workspaceMode": "physical-drone",
    "physicalFlightAllowed": true,
    "essentialQuestion": "למה קוד שעבד בסימולטור צריך כיול מחדש במציאות, ואיך משתנים גלובליים חוסכים זמן, סוללה ושגיאות?",
    "successCriteria": [
      "אני מסביר/ה מהו Simulation‑to‑Reality Gap ולמה Drift, תאורה, רצפה וסוללה משפיעים על הרחפן.",
      "אני טוען/ת את Meeting10_Project_Blueprint_JS ושומר/ת עותק כיול בשם Meeting11_Project_Calibration_JS.",
      "אני יודע/ת לכייל scanDist, safeAltitude או photoDelay בלי לערוך עשרים שורות קוד.",
      "אני מפעיל/ה טיסה פיזית רק אחרי Code Review, Pre‑Flight, Safe Fly Zone, תפקידים וקריאת המראה.",
      "אני מודד/ת סטיית מיקום/גובה בסנטימטרים ומתעד/ת אותה ביומן כיול.",
      "אני מוריד/ה תמונות לטאבלט ומחליט/ה אם הן חדות, חתוכות, שחורות או מטושטשות.",
      "אני שומר/ת Meeting11_Project_Calibrated_Success עם Share Link ושלוש ראיות חזותיות ככל שניתן."
    ],
    "realWorldUses": [
      {
        "icon": "🚀",
        "title": "SpaceX flight testing",
        "text": "מהנדסים לא מצפים שאב־טיפוס יעבוד מושלם בפעם הראשונה; הם מודדים, מכיילים ומריצים שוב."
      },
      {
        "icon": "🔴",
        "title": "NASA JPL calibration",
        "text": "במעבר מסימולציה למציאות, חיישנים, תאורה, סוללה וקרקע משנים את התנהגות המערכת."
      },
      {
        "icon": "📸",
        "title": "Visual inspection",
        "text": "בפרויקט חקר מצולם, איכות התמונה היא המדד: שחור, חתוך או מטושטש אינו תוצר תקין."
      }
    ],
    "vocabulary": [
      ["Simulation‑to‑Reality Gap", "הפער בין התנהגות מושלמת בסימולטור לבין רחפן פיזי שמושפע מרוח, רצפה, תאורה וסוללה."],
      ["Visual Calibration", "כיול לפי איכות תמונה: חדות, מיקום, חיתוך, בהירות ופענוח הכרטיסייה."],
      ["scanDist", "משתנה מרחק גלובלי; אם הרחפן מגיע קצר מדי, מעדכנים אותו במקום לשנות הרבה שורות."],
      ["safeAltitude", "גובה מעבר/צילום שמתאים למציאות ולתחנות בגבהים שונים."],
      ["photoDelay", "משך sleep לפני takePhoto; מעלים אותו אם יש Motion Blur."],
      ["Photo Offloading", "פריקת התמונות מהרחפן/האפליקציה לגלריית הטאבלט לצורך ניתוח."],
      ["VPS Drift", "סטיית מיקום מחיישני התחתית בגלל צבע/מרקם רצפה או תאורה."],
      ["Calibration Run", "טיסת ניסוי קצרה שמטרתה למדוד ולתקן, לא להשלים מופע מושלם."
      ]
    ],
    "safetyRules": [
      "טיסה פיזית רק אחרי Code Review, אישור מדריך, Safe Fly Zone מסומן ותפקידי צוות ברורים.",
      "כל מי שסביב מלבן הטיסה משתמש במשקפי מגן; שיער אסוף ומגיני פרופלורים חובה.",
      "קריאת המראה חובה: “צוות X ממריא לטיסת ניסוי!” לפני Run.",
      "Driver אחראי לטאבלט, להרצה ול־Abort; Navigator מודד סטיות; Safety Observer שומר מרחק וצופים.",
      "אם תמונה או מסלול נכשלים — נוחתים ומכיילים; לא מתקנים באוויר ולא מאלתרים.",
      "משנים משתנה אחד בלבד בכל סבב כיול: scanDist או safeAltitude או photoDelay.",
      "סוללות מנוהלות בשתי קופסאות; סוללה חלשה או חשודה יוצאת מהסבב."
    ],
    "commonDirections": [
      ["Load Meeting10", "טוענים את Meeting10_Project_Blueprint_JS מהענן לפני יצירת גרסת כיול."],
      ["Save As Calibration", "שומרים מיד Meeting11_Project_Calibration_JS כדי לא לדרוס את Blueprint המקורי."],
      ["scanDist correction", "אם הרחפן קצר ב־20 ס״מ, מעדכנים scanDist בראש הקוד ומריצים שוב."],
      ["safeAltitude correction", "אם התמונה חתוכה, מכיילים את גובה הצילום/מעבר בהתאם לתחנה."],
      ["photoDelay 2→4", "אם יש Motion Blur, מעלים photoDelay מ־2 ל־4 שניות לפני takePhoto."],
      ["Photo Offloading", "אחרי נחיתה מורידים תמונות לטאבלט ובודקים חדות/בהירות/מיקום."],
      ["Meeting11_Project_Calibrated_Success", "שם גרסת ההגשה הסופית לאחר כיול, שמירה ושיתוף."
      ]
    ],
    "setupSteps": [
      "טאבלטים טעונים ו־DroneBlocks Code מוכן.",
      "רחפני Tello/Tello EDU עם מגיני פרופלורים וסוללות ממוספרות.",
      "Safe Fly Zone מסומן בסרט צבעוני, ללא תלמידים בתוך המלבן בזמן Run.",
      "שלוש תחנות פיזיות בגבהים משתנים: לדוגמה 80/50/120 ס״מ.",
      "כרטיסיות סדקי תשתיות/קודים מספריים/אותיות מודבקות על התחנות.",
      "טבלת כיול לצוותים: Run #, scanDist, safeAltitude, photoDelay, סטיית cm, איכות תמונה, החלטת תיקון.",
      "נוהל שתי קופסאות לסוללות: מלאות מול ריקות/חשודות."
    ],
    "tabletTips": [
      "על WiFi בית ספרי טוענים Meeting10_Project_Blueprint_JS ושומרים Meeting11_Project_Calibration_JS.",
      "לפני TELLO WiFi מוודאים שהקוד כולל tello.sleep(photoDelay); לפני כל tello.takePhoto();",
      "עוברים ל־TELLO WiFi רק לריצת בדיקה מאושרת; חוזרים ל־WiFi בית ספרי לשמירה ושיתוף.",
      "לאחר נחיתה מבצעים Photo Offloading ובודקים תמונות בגלריית הטאבלט.",
      "אם תמונות שחורות — בודקים תאורה ומכסה עדשה לפני שינוי קוד.",
      "אם Syntax נעצר — בודקים CamelCase: tello.takePhoto(); ולא tello.takephoto()."
    ],
    "lessonFlow": [
      {
        "minutes": "0–5",
        "title": "גשר ממפגש 10",
        "teacher": "מזכיר שה־Blueprint עבד בסימולטור בלבד; היום בודקים מה קורה כשהקוד פוגש רצפה, מזגן, תאורה וסוללה.",
        "students": "פותחים מחשבתית את פרויקט Meeting10 ומזהים אילו משתנים נצטרך לכייל."
      },
      {
        "minutes": "5–15",
        "title": "סיפור SpaceX/NASA JPL Launchpad Testing",
        "teacher": "מציג טיסות ניסוי פיזיות כשלב חובה בכל פרויקט הנדסי: כישלון מדיד הוא מידע, לא תקלה מביכה.",
        "students": "מגדירים מטרת היום: שלוש תמונות חדות יותר בכל סבב כיול."
      },
      {
        "minutes": "15–20",
        "title": "Sim‑to‑Reality Gap",
        "teacher": "מסביר Drift, VPS, תאורה, מתח סוללה ומזגן; מדגיש מדידת סטייה בסנטימטרים.",
        "students": "נותנים השערה: מה יסטה קודם — מרחק, גובה או חדות תמונה."
      },
      {
        "minutes": "20–25",
        "title": "Load + Save As",
        "teacher": "מנחה להתחבר ל־WiFi בית ספרי, לטעון Meeting10_Project_Blueprint_JS ולשמור Meeting11_Project_Calibration_JS.",
        "students": "יוצרים גרסת כיול ובודקים שהמשתנים נמצאים בראש הקוד."
      },
      {
        "minutes": "25–40",
        "title": "אסטרטגיית כיול משתנים",
        "teacher": "מדגים: רחפן הגיע 80 במקום 100 → משנים scanDist; תמונה חתוכה → safeAltitude; טשטוש → photoDelay.",
        "students": "מסמנים בקוד את scanDist/safeAltitude/photoDelay ומכינים יומן כיול."
      },
      {
        "minutes": "40–50",
        "title": "הקמת זירת בדיקה ובטיחות",
        "teacher": "מציב שלוש תחנות, בודק משקפיים, שיער, מגינים, סוללה ותפקידים; מאשר צוות אחד בכל פעם.",
        "students": "Driver, Navigator ו־Safety Observer מתייצבים ומתרגלים קריאת המראה."
      },
      {
        "minutes": "50–68",
        "title": "Calibration Runs",
        "teacher": "מנהל סבבי טיסה קצרים ומוודא נחיתה לפני דיון/שינוי קוד.",
        "students": "מריצים, מצלמים, נוחתים, מודדים סטיית מיקום/גובה ומפעילים Abort אם צריך."
      },
      {
        "minutes": "68–78",
        "title": "Photo Offloading + Visual Debugging",
        "teacher": "מנחה להוריד תמונות ולנתח: שחור, חתוך, מטושטש או חד.",
        "students": "מעדכנים יומן כיול ובוחרים משתנה אחד לשינוי בסבב הבא."
      },
      {
        "minutes": "78–85",
        "title": "שמירה ושיתוף גרסה מכוילת",
        "teacher": "מחזיר ל־WiFi בית ספרי ומוודא שמירה בשם Meeting11_Project_Calibrated_Success.",
        "students": "שומרים Share Link ומצרפים שלוש תמונות/יומן כיול ככל שניתן."
      },
      {
        "minutes": "85–90",
        "title": "דיון, תחזוקת ציוד וסיכום",
        "teacher": "מנהל דיון על אחוז סטייה מול סימולטור ומוודא סוללות בקופסת ריקות/חשודות.",
        "students": "מחזירים ציוד ומשלימים כרטיס יציאה על משתנה שחסך בלאגן בקוד."
      }
    ],
    "exercises": [
      {
        "minutes": "10–18",
        "title": "השערת Sim‑to‑Reality",
        "prompt": "כתבו מה לדעתכם יסטה במעבר למציאות: מרחק, גובה, תמונה או סוללה — ולמה.",
        "check": "ההשערה מחוברת לגורם פיזי כמו רצפה, תאורה, מזגן או סוללה."
      },
      {
        "minutes": "20–28",
        "title": "Save As Calibration",
        "prompt": "טענו Meeting10_Project_Blueprint_JS ושמרו Meeting11_Project_Calibration_JS.",
        "check": "גרסת Blueprint לא נדרסה ויש גרסת כיול חדשה."
      },
      {
        "minutes": "28–40",
        "title": "מפת משתני כיול",
        "prompt": "סמנו בקוד איפה נמצאים scanDist, safeAltitude ו־photoDelay ומה כל אחד מתקן.",
        "check": "לכל משתנה יש תפקיד כיול ברור."
      },
      {
        "minutes": "40–55",
        "title": "Pre‑Flight + Run 1",
        "prompt": "בצעו ריצת כיול קצרה באישור מדריך ורשמו סטיית מיקום/גובה ואיכות תמונה.",
        "check": "יש נתון מדוד ולא רק תחושה."
      },
      {
        "minutes": "55–70",
        "title": "Visual Debugging",
        "prompt": "הורידו תמונות לטאבלט וסווגו כל תמונה: חדה / מטושטשת / חתוכה / שחורה.",
        "check": "הסיווג מוביל להצעת שינוי אחת בקוד או בבדיקה פיזית."
      },
      {
        "minutes": "70–82",
        "title": "Run 2 — שינוי אחד",
        "prompt": "שנו רק scanDist או safeAltitude או photoDelay והריצו שוב אם יש אישור וסוללה.",
        "check": "הצוות יודע להסביר מה השתנה בין Run 1 ל־Run 2."
      },
      {
        "minutes": "82–90",
        "title": "Calibration Report",
        "prompt": "שמרו Meeting11_Project_Calibrated_Success וכתבו: הבעיה, המשתנה ששינינו, והתוצאה בתמונה.",
        "check": "יש Share Link/יומן כיול ותיעוד תמונות."
      }
    ],
    "deliverable": "Meeting11_Project_Calibrated_Success + Share Link + יומן כיול קצר הכולל scanDist/safeAltitude/photoDelay לפני ואחרי + 3 תמונות/ראיות ככל שניתן + החלטת דיבוג חזותי לכל תמונה.",
    "assessment": [
      "הצוות טען את Meeting10 ושמר גרסת Meeting11 נפרדת לפני הרצה.",
      "הקוד משתמש במשתנים גלובליים לכיול ולא בשינוי מפוזר של עשרות פקודות.",
      "Pre‑Flight, Safe Fly Zone, משקפיים, תפקידים וקריאת המראה בוצעו בפועל.",
      "Driver/Navigator/Safety Observer פעלו בתפקידים ברורים בזמן הטיסה.",
      "הסטיות נמדדו בסנטימטרים או תועדו באופן מדויק מספיק להחלטת כיול.",
      "Photo Offloading בוצע והצוות ניתח חדות/חיתוך/שחור/טשטוש.",
      "הצוות שינה משתנה אחד בכל סבב והסביר את התוצאה.",
      "Meeting11_Project_Calibrated_Success נשמר והוגש."
    ],
    "debugging": [
      {
        "problem": "כל התמונות שחורות לגמרי",
        "fix": "בודקים תאורה ומוודאים שהוסר מכסה עדשת Tello ב־Pre‑Flight. אם צריך, משפרים תאורה לפני שינוי קוד."
      },
      {
        "problem": "הקוד נתקע אחרי צילום ולא עובר לפקודה הבאה",
        "fix": "בודקים Syntax ו־CamelCase: הפקודה חייבת להיות tello.takePhoto(); ולא tello.takephoto(). בודקים גם סוגריים ונקודה־פסיק."
      },
      {
        "problem": "הרחפן מפספס תחנה ב־20 ס״מ קדימה/ימינה",
        "fix": "Navigator מתעד את הסטייה; מעדכנים scanDist או משתנה צד אחד בראש הקוד ומריצים שוב רק אחרי נחיתה."
      },
      {
        "problem": "התמונה חתוכה או הכרטיסייה מחוץ לפריים",
        "fix": "מעדכנים safeAltitude/גובה צילום או yaw במעט, לפי גובה התחנה וזווית המצלמה."
      },
      {
        "problem": "Motion Blur בתמונות",
        "fix": "מגדילים photoDelay מ־2 ל־4 שניות לפני takePhoto, אבל בודקים גם השפעה על סוללה וזמן טיסה."
      },
      {
        "problem": "סוללה יורדת מהר בין סבבים",
        "fix": "מגבילים ריצות, מחליפים סוללה לפי שתי קופסאות, ומעדיפים Calibration Run קצרה על משימה מלאה."
      }
    ],
    "differentiation": {
      "support": [
        "להריץ רק תחנה אחת מתוך שלוש ולכייל photoDelay בלבד.",
        "לתת טבלת כיול מוכנה עם עמודות מילוי פשוטות.",
        "לתת ערכי התחלה שמרניים ל־scanDist/safeAltitude כדי להפחית סיכון.",
        "לתת לתלמידים מתקשים תפקיד Navigator/Data Officer עם דגש על מדידה ותמונה."
      ],
      "extension": [
        "לחשב אחוז סטייה: סטייה בפועל / מרחק מתוכנן × 100.",
        "להשוות Run 1 מול Run 2 בתמונות לפני/אחרי ולהציג מסקנה הנדסית.",
        "להציע פונקציה calibratePhotoStation(label, dist, alt, delay).",
        "להוסיף החלטת tradeoff בין photoDelay ארוך לבין צריכת סוללה."
      ]
    },
    "instructorGuide": {
      "prerequisites": "התלמידים מגיעים אחרי מפגש 10 עם Blueprint ואב־טיפוס City Simulator. לפני שיעור 11 יש לוודא שהקוד שמור בענן, שהמשתנים scanDist/safeAltitude/photoDelay קיימים או ניתנים להוספה, ושהכיתה מוכנה לטיסה פיזית מבוקרת עם תחנות בגבהים שונים.",
      "pedagogy": [
        "המסר המרכזי: Sim‑to‑Reality Gap הוא צפוי ובריא — תפקיד המהנדס הוא למדוד ולכייל, לא להיבהל.",
        "להתעקש על שינוי משתנה אחד בכל סבב כדי לשמור על קשר סיבה־תוצאה.",
        "Visual Debugging מחבר קוד לתוצר: תמונה שחורה/חתוכה/מטושטשת היא נתון הנדסי.",
        "לנהל את הסוללות כמשאב לימודי: ריצות קצרות וממוקדות עדיפות על ניסיונות ארוכים.",
        "הבטיחות מוגברת כי זה פרויקט מורכב: צוות אחד באוויר, כולם מחוץ למלבן."
      ],
      "exitTicket": "המשתנה שהכי עזר לנו לכייל את המעבר מהסימולטור למציאות היה ___ כי ___."
    },
    "appWorkflowTitle": "Meeting10 Blueprint → Physical Calibration Lab",
    "appWorkflowNote": "מפגש 11 חוזר לטיסה פיזית מבוקרת. טוענים את Blueprint ממפגש 10, שומרים גרסת כיול, מריצים רק אחרי Pre‑Flight ואישור מדריך, פורקים תמונות ומכיילים משתנה אחד בכל פעם.",
    "appWorkflow": [
      {
        "title": "Load Blueprint + Save Calibration",
        "detail": "על WiFi בית ספרי טענו Meeting10_Project_Blueprint_JS ושמרו מיד Meeting11_Project_Calibration_JS."
      },
      {
        "title": "Variable Calibration Check",
        "detail": "ודאו ש־scanDist, safeAltitude ו־photoDelay נמצאים בראש הקוד. אם לא — הוסיפו אותם לפני Run פיזי."
      },
      {
        "title": "Physical Safety Gate",
        "detail": "עוברים ל־TELLO WiFi רק אחרי Code Review, Pre‑Flight, הסרת מכסה עדשה, משקפיים, Safe Fly Zone, סוללה ותפקידי Driver/Navigator/Safety Observer."
      },
      {
        "title": "Calibration Run + Drift Log",
        "detail": "מריצים טיסה קצרה, נוחתים, מודדים סטייה בס״מ, ומתעדים Run #, scanDist, safeAltitude, photoDelay ואיכות תמונה."
      },
      {
        "title": "Photo Offloading + Visual Debugging",
        "detail": "Photo Offloading: מורידים תמונות לטאבלט ומסווגים: חד, מטושטש, חתוך או שחור. בוחרים שינוי אחד בלבד לסבב הבא."
      },
      {
        "title": "Final Save + Share",
        "detail": "חוזרים ל־WiFi בית ספרי, שומרים Meeting11_Project_Calibrated_Success ומשתפים קישור יחד עם יומן הכיול והתמונות."
      }
    ],
    "visualDiagram": {
      "panelTitle": "🚀 Launchpad Calibration Lab",
      "chip": "Sim‑to‑Reality",
      "title": "בדיקות שטח וכיול חזותי של אב־הטיפוס",
      "src": "assets/drone-mission-lab-grade8/lesson11/spacex-jpl-sim-to-reality-calibration.svg",
      "alt": "תרשים כיול פיזי לכיתה ח׳ עם Safe Fly Zone, שלוש תחנות בגבהים שונים, נתיב מתוכנן מול נתיב אמיתי, משתני scanDist safeAltitude photoDelay ופריקת תמונות",
      "caption": "מפגש 11 מוכיח למה סימולטור אינו סוף הדרך: מודדים Drift, פורקים תמונות, מכיילים משתנים ומריצים שוב בבטיחות מלאה."
    },
    "videoResources": [
      {
        "title": "SpaceX flight test debugging calibration — search suggestion",
        "url": "https://www.youtube.com/results?search_query=SpaceX+flight+test+debugging+calibration",
        "note": "השראה על ניסויי טיסה, מדידה וכיול בעולם אמיתי."
      },
      {
        "title": "NASA JPL robotics calibration testing — fallback",
        "url": "https://www.youtube.com/results?search_query=NASA+JPL+robotics+calibration+testing",
        "note": "חלופה על כיול רובוטים וחיישנים במעבדות נאס״א."
      }
    ],
    "screenshotSlides": [
      {
        "title": "Launchpad Calibration Lab",
        "src": "assets/drone-mission-lab-grade8/lesson11/spacex-jpl-sim-to-reality-calibration.svg",
        "caption": "נתיב מתוכנן מול נתיב אמיתי, מדידת Drift, כיול scanDist/safeAltitude/photoDelay ו־Photo Offloading."
      },
      {
        "title": "Blueprint ממפגש 10",
        "src": "assets/drone-mission-lab-grade8/lesson10/pix4d-city-blueprint-prototype.svg",
        "caption": "Meeting10_Project_Blueprint_JS הוא נקודת המוצא לגרסת הכיול הפיזית."
      },
      {
        "title": "WiFi Handshake + Pre‑Flight",
        "src": "assets/drone-mission-lab-grade8/lesson5/tello-wifi-handshake.svg",
        "caption": "School WiFi לשמירה, TELLO WiFi להרצה, Pre‑Flight כולל עדשה וסוללה."
      },
      {
        "title": "Data / Photo Offloading",
        "src": "assets/drone-mission-lab-grade8/lesson7/inspex-autonomous-photo-inspection.svg",
        "caption": "איכות התמונות קובעת את החלטת הכיול: שחור, חתוך, מטושטש או חד."
      },
      {
        "title": "Save Calibrated Success",
        "src": "assets/tello-mission-lab/lesson1/save-share.png",
        "caption": "Meeting11_Project_Calibrated_Success + Share Link + יומן כיול."
      }
    ],
    "instructorSlides": [
      {
        "title": "Launchpad Flight Testing",
        "body": "אב־טיפוס שעבד בסימולטור צריך סדרת ניסויים פיזיים, מדידה וכיול לפני שהוא נחשב פרויקט יציב.",
        "bullets": ["prototype", "test", "calibrate"]
      },
      {
        "title": "Sim‑to‑Reality Gap",
        "body": "מזגן, רצפה, תאורה וסוללה משנים את הרחפן. היום מודדים את הפער במקום להתעלם ממנו.",
        "bullets": ["drift", "VPS", "battery"]
      },
      {
        "title": "משתנים חוסכים בלגן",
        "body": "scanDist, safeAltitude ו־photoDelay מאפשרים כיול בראש הקוד בלי לשבור סינטקס בעשרים מקומות.",
        "bullets": ["scanDist", "safeAltitude", "photoDelay"]
      },
      {
        "title": "Visual Debugging",
        "body": "התמונה מספרת מה לתקן: שחור = עדשה/תאורה, חתוך = גובה/זווית, מטושטש = delay.",
        "bullets": ["black", "cropped", "motion blur"]
      },
      {
        "title": "בטיחות מוגברת",
        "body": "צוות אחד באוויר, כולם מחוץ למלבן, Driver עם Abort, Navigator עם יומן, Safety Observer עם עיניים על הרחפן.",
        "bullets": ["Safe Fly Zone", "Abort", "roles"]
      },
      {
        "title": "תוצר היום",
        "body": "גרסת קוד מכוילת, תמונות שהורדו לטאבלט, ויומן שמסביר בדיוק איזה משתנה שונה ולמה.",
        "bullets": ["Calibrated Success", "photos", "log"]
      }
    ]
  });


  window.getDroneMissionLabGrade8Lesson = function (value) {
    const id = Number(value || 1);
    return window.DRONE_MISSION_LAB_GRADE8_LESSONS.find(lesson => lesson.id === id) || window.DRONE_MISSION_LAB_GRADE8_LESSONS[0];
  };
})();
