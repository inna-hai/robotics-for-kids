(function () {
  const unitNames = {
    launch: 'יחידה 1 — מרכז חקר וסימולטור',
    survey: 'יחידה 2 — סריקות שטח וגבהים',
    camera: 'יחידה 3 — איסוף מידע חזותי',
    pads: 'יחידה 4 — Mission Pads ותחנות חקר',
    project: 'יחידה 5 — פרויקט חקר מסכם'
  };

  const blockLabels = {
    safety_check: 'Safety Check — בדיקת בטיחות', takeoff: 'Takeoff — המראה', hover: 'Hover 5 sec — ריחוף 5 שניות', land: 'Land — נחיתה', up_100: 'Go Up 2.5m — עליה לגובה 2.5 מטר', down_50: 'Go Down 1.25m — ירידה 1.25 מטר', yaw_360: 'Yaw Right 360° — סיבוב מלא', forward: 'Forward — קדימה', back: 'Back — אחורה', right: 'Right — ימינה', left: 'Left — שמאלה', photo: 'Take Photo — צילום', wait: 'Wait — המתנה', set_speed: 'Set Speed — הגדרת מהירות', variable: 'Variable — משתנה', telemetry: 'Telemetry — טלמטריה', battery: 'Battery Check — בדיקת סוללה', repeat_scan: 'Repeat Scan — סריקה חוזרת', grid_scan: 'Grid Scan — סריקת גריד', go_pad: 'Go to Mission Pad — גישה לפד', hover_data: 'Hover for Data — ריחוף לאיסוף נתונים', comment: 'Comment — הערה', share: 'Share Mission — שיתוף משימה', abort: 'Abort — עצירת חירום'
  };

  const scenarios = [
    ['ממריאים אל המחר', unitNames.launch, 'חקר, בטיחות וציר אנכי', 'הכיתה הופכת לצוות מחקר רחפנים בהשראת Ingenuity על מאדים: לפני טיסה אמיתית בונים משימת חקר בטוחה בסימולטור.', 'לבנות משימת System Check Alpha: Takeoff → Hover 5 sec → Land, ולהבין איך רחפן הופך מכלי טיס לכלי מחקר מדעי.', ['takeoff','hover','land']],
    ['אתגר סריקת חממת העתיד', unitNames.survey, 'Pitch / Roll / Yaw ו־Box Mission', 'צוות החקר נקרא לסרוק חממה אוטונומית מרובעת כדי לזהות מזיקים בפינות הרחוקות.', 'לבנות Box Mission בגודל 1.5 מטר בשתי גישות: Strafing Box מול Yaw Box, ולהסביר איזו מתאימה לחקר חממה.', ['takeoff','forward','right','back','left','land']],
    ['כיווני ניווט לחוקר', unitNames.survey, 'Forward / Back / Left / Right', 'רחפן חקר צריך להגיע לנקודות סביב אזור מחקר בלי לצאת מגבולות הגריד.', 'לבנות מסלול תנועה קצר ב־Minimal Grid ולתעד נקודת התחלה, יעד ונחיתה.', ['takeoff','forward','right','back','left','land']],
    ['סיבוב תצפית 360°', unitNames.survey, 'Yaw כתצפית סביבתית', 'לפעמים הרחפן לא צריך לזוז — רק להסתובב ולסרוק את הסביבה.', 'להוסיף Yaw 360° למשימת חקר ולהסביר מה ההבדל בין סיבוב לתנועה צדית.', ['takeoff','hover','yaw_360','land']],
    ['מעבר מבוקר לרחפן אמיתי', unitNames.launch, 'סימולטור מול מציאות', 'אחרי ארבעה תרגולי סימולציה, בודקים מה משתנה כשמתקרבים לרחפן פיזי.', 'להריץ משימת בסיס פיזית רק באישור מדריך ובאזור סטרילי.', ['safety_check','takeoff','hover','land']],
    ['סריקת קו חוף', unitNames.survey, 'מסלול סריקה ליניארי', 'רחפן משמר חופים סורק קו ישר ומחפש נקודות עניין.', 'לבנות מסלול קדימה-ריחוף-חזרה תוך שמירה על סוללה ודיוק.', ['takeoff','forward','hover_data','back','land']],
    ['Grid Scan ראשון', unitNames.survey, 'סריקה שיטתית', 'במשימת חיפוש, טיסה אקראית אינה מספיקה — צריך כיסוי שטח מסודר.', 'לתכנן תבנית סריקה בגריד בסימולטור.', ['takeoff','grid_scan','land']],
    ['צילום ראיות', unitNames.camera, 'מצלמה ככלי נתונים', 'הרחפן אוסף עדות חזותית מנקודת עניין ומשווה בין צילום מגבהים שונים.', 'לשלב Take Photo לאחר ריחוף מעל יעד.', ['takeoff','forward','hover','photo','land']],
    ['Mission Pad כתחנת מחקר', unitNames.pads, 'זיהוי תחנה', 'כל Mission Pad מייצג תחנת מחקר: דגימת קרקע, פאנל סולארי או נקודת חילוץ.', 'לתכנן עצירה מעל Mission Pad ולתעד פעולה מתאימה.', ['takeoff','go_pad','hover_data','land']],
    ['מאדים בכיתה', unitNames.pads, 'תחנות חקר בסביבה סיפורית', 'הכיתה הופכת למפת מאדים עם תחנות אנרגיה, סלעים ונקודת תקשורת.', 'לבנות משימה סיפורית עם שתי תחנות חקר.', ['takeoff','go_pad','photo','go_pad','land']],
    ['אילוץ סוללה', unitNames.survey, 'תכנון תחת מגבלה', 'הצוות מגלה שסוללה היא לא רק מספר — היא מגבלת משימה.', 'לקצר מסלול חקר בלי לוותר על יעד מרכזי.', ['takeoff','repeat_scan','hover_data','land']],
    ['דיבוג מציאות', unitNames.launch, 'רוח, VPS וסוללה', 'הקוד בסימולטור מושלם, אבל בעולם האמיתי יש מזגן, רצפה מבריקה וסוללה יורדת.', 'לזהות מקור סטייה אפשרי ולהציע תיקון פרמטר אחד.', ['safety_check','takeoff','hover','abort','land']],
    ['משימת חילוץ חקר', unitNames.project, 'חיפוש נקודת יעד', 'רחפן חקר צריך לסרוק אזור אסון, לעצור מעל יעד ולחזור לנחיתה.', 'לבנות משימה מלאה עם סריקה, ריחוף ותיעוד.', ['takeoff','grid_scan','hover_data','photo','land']],
    ['שיתוף משימת חקר', unitNames.project, 'תיעוד ושיתוף', 'מדענים משתפים לא רק תוצאה — גם שיטת עבודה.', 'לשמור Mission1/Project Draft וליצור Share Link למדריך.', ['comment','takeoff','grid_scan','photo','land','share']],
    ['Mission Lab Expo', unitNames.project, 'אירוע שיא חקר', 'כל צוות מציג בעיית חקר, תוכנית טיסה, נתונים שנאספו ודיבוג שביצע.', 'להציג משימת חקר מלאה עם נימוק בטיחותי וטכני.', ['safety_check','takeoff','project_path','photo','land']]
  ];

  function makeFlow(lesson) {
    const physical = lesson.id >= 5 ? 'אם מתקרבים לרחפן פיזי: אישור מדריך, משקפי מגן, שיער אסוף, אזור סטרילי וסוללות מנוהלות בשתי קופסאות.' : 'שיעור סימולטור בלבד: אין חיבור לרחפן ואין Launch פיזי.';
    return [
      { minutes: '0–5', title: 'כרטיס ביקור וציוד', teacher: 'מציגים שהרחפן הוא מערכת רובוטית וכלי מחקר, לא צעצוע.', students: 'בודקים טאבלט, צוות ותפקידים.' },
      { minutes: '5–20', title: 'הקנייה: רחפן ככלי מחקר', teacher: 'פותחים בסיפור Ingenuity ומחברים לרחפנים בחילוץ, חקלאות ותשתיות.', students: 'מזהים שימוש אמיתי אחד וסיכון בטיחות אחד.' },
      { minutes: '20–30', title: 'בטיחות ואנטומיה', teacher: physical + ' מציגים מדחפים, VPS, LED, סוללה ומגיני פרופלורים.', students: 'מסמנים שלושה כללי בטיחות ומזהים חלק אחד ברחפן.' },
      { minutes: '30–40', title: 'נוהל רשת וסימולטור', teacher: 'מסבירים WiFi בית ספר לענן DroneBlocks לעומת WiFi רחפן בעתיד.', students: 'פותחים DroneBlocks Simulator / Minimal Grid בטאבלט.' },
      { minutes: '40–58', title: 'בנייה מודרכת', teacher: 'מדגימים גרירת בלוקים וחיבורם כמו פאזל.', students: 'בונים את רצף המשימה הראשי ומריצים בסימולטור.' },
      { minutes: '58–75', title: 'אתגר מעשי ודיבוג', teacher: 'מבקשים שינוי מבוקר אחד ודנים במה יכול להשתבש בעולם אמיתי.', students: 'מריצים, משווים, מתקנים ומתעדים.' },
      { minutes: '75–90', title: 'שיתוף, תחזוקה וסיכום', teacher: 'מסכמים מתכנת מול מטיס, שמירה ושיתוף, ונוהל סוללות.', students: 'כרטיס יציאה: מה למדתי על רחפן ככלי מחקר?' }
    ];
  }

  function makeExercises(lesson) {
    return [
      { minutes: '20–28', title: 'מילון חוקר רחפנים', prompt: 'התאימו Takeoff, Hover, Land, Lift ו־VPS להסבר בעברית.', check: 'לפחות ארבעה מושגים נכונים.' },
      { minutes: '28–36', title: 'בטיחות לפני קוד', prompt: 'בחרו שלושה כללי בטיחות לפני טיסה אמיתית.', check: 'כולל מדחפים, מרחק ואישור מדריך.' },
      { minutes: '40–52', title: 'בניית משימת הבסיס', prompt: `חברו בלוקים: ${lesson.blocks.map(b => blockLabels[b] || b).join(' → ')}`, check: 'הרצף מתחיל בהמראה ומסתיים בנחיתה.' },
      { minutes: '52–62', title: 'הרצה ב־Minimal Grid', prompt: 'הריצו בסימולטור ותארו מה הרחפן עשה.', check: 'התיאור כולל פעולה ותוצאה.' },
      { minutes: '62–75', title: 'שאלת חוקר', prompt: 'מה יכול להשתבש כשנעבור בעתיד לרחפן אמיתי?', check: 'התשובה מזכירה מזגן/רצפה/VPS/סוללה.' },
      { minutes: '75–84', title: 'שיתוף משימה', prompt: 'שמרו בשם ברור או כתבו איך הייתם שולחים Share Link למדריך.', check: 'שם המשימה כולל מספר ושם צוות.' },
      { minutes: '84–90', title: 'כרטיס יציאה', prompt: 'השלימו: “מתכנת רחפנים שונה ממטיס ידני כי...”', check: 'המשפט מחבר בין קוד, חזרתיות ובטיחות.' }
    ];
  }

  window.TELLO_MISSION_LAB_BLOCK_LABELS = blockLabels;
  window.TELLO_MISSION_LAB_LESSONS = scenarios.map((row, index) => {
    const lesson = { id: index + 1, title: row[0], unit: row[1], concept: row[2], story: row[3], mission: row[4], blocks: row[5], durationMinutes: 90, grade: 'כיתה ו׳', audience: 'כיתה ו׳', platform: 'Tello EDU + DroneBlocks Simulator בטאבלט', tabletFirst: true, deviceProfile: 'Lenovo Tab TB311FU / MediaTek Helio G85 / 4GB RAM', physicalFlightAllowed: index + 1 >= 5 };
    lesson.lessonFlow = makeFlow(lesson);
    lesson.exercises = makeExercises(lesson);
    return lesson;
  });

  Object.assign(window.TELLO_MISSION_LAB_LESSONS[0], {
    title: 'שיעור 1: ממריאים אל המחר',
    subtitle: 'היכרות, בטיחות ותכנות וירטואלי במשימת חקר',
    essentialQuestion: 'איך מתכנתים רחפן חקר כך שיבצע משימה בטוחה, מדויקת וחוזרת על עצמה?',
    successCriteria: ['אני מסביר/ה איך רחפנים משמשים למחקר אמיתי כמו Ingenuity.', 'אני יודע/ת להפעיל חשיבה בטיחותית לפני קוד.', 'אני מכיר/ה Lift, Hover, Land, Takeoff ו־VPS.', 'אני בונה בבלוקים משימת System Check Alpha בסימולטור.'],
    realWorldUses: [
      { icon:'🪐', title:'Ingenuity על מאדים', text:'רחפן אוטונומי שחקר סביבה רחוקה בלי שלט בזמן אמת.' },
      { icon:'🚑', title:'אזורי אסון וחילוץ', text:'סריקת שטח לפני כניסת צוותים כדי להציל חיים.' },
      { icon:'🌾', title:'חקלאות מדויקת', text:'בדיקת שדות, השקיה ובריאות צמחים מנקודת מבט אווירית.' },
      { icon:'🏗️', title:'בדיקות תשתית', text:'צילום גגות, גשרים וקווי חשמל בלי לסכן אדם בגובה.' }
    ],
    vocabulary: [['Lift / עילוי','כוח שמאפשר לרחפן להתרומם כשהמדחפים דוחפים אוויר כלפי מטה.'], ['Takeoff / המראה','פקודת התחלת טיסה.'], ['Hover / ריחוף','שמירה על מקום וגובה באוויר.'], ['Land / נחיתה','ירידה מבוקרת לקרקע.'], ['VPS','חיישני תחתית שמסייעים לרחפן לשמור גובה ומיקום קרוב לקרקע.'], ['Brushless Motors','מנועים חזקים ועמידים שמסובבים את המדחפים.'], ['Abort','עצירת חירום/ביטול משימה כשיש סכנה.'], ['Minimal Grid','סביבת סימולטור נקייה לבדיקת לוגיקה.']],
    safetyRules: ['שיעור 1 הוא סימולטור בלבד — אין טיסה פיזית.', 'משקפי מגן בכל הפעלת רחפן אמיתי בעתיד.', 'שיער אסוף וללא חוטים/בגדים משוחררים.', 'לא נכנסים לאזור טיסה כשהרחפן באוויר.', 'מכריזים “רחפנים באוויר!” לפני המראה פיזית.', 'סוללות מנוהלות בשתי קופסאות: Full 100% / Empty 0%.'],
    teamRoles: [['Driver / נהג','גורר את הבלוקים בטאבלט הראשי.'], ['Navigator / נווט','בודק סדר פקודות, גבהים וטעויות.'], ['Observer / תצפיתן','בודק בטיחות וסביבה וירטואלית/פיזית.']],
    networkProcedure: ['WiFi בית ספרי לפני פתיחת DroneBlocks כדי לגשת לענן ולרישיונות.', 'בשלב הסימולטור נשארים באינטרנט הבית ספרי.', 'WiFi של הרחפן ישמש רק בעתיד, בשיעורים עם טיסה פיזית.', 'אם לא מצליחים לשמור — בודקים שלא מחוברים בטעות לרשת הרחפן.'],
    tabletTips: ['עובדים לרוחב בטאבלט Lenovo TB311FU.', 'סוגרים טאבים מיותרים כדי לשמור על ביצועים ב־4GB RAM.', 'גוררים בלוקים עד להופעת הצל/חיבור הפאזל.', 'אם סימולטור דורש סיסמה — מקבלים אותה מהמדריך.'],
    debuggingGuide: [['בלוקים חסרים','בדקו שסוג הרחפן מוגדר Tello EDU/Talent.'], ['לא ניתן לשמור','ודאו WiFi בית ספרי עם אינטרנט.'], ['בלוקים לא מתחברים','גררו מתחת לבלוק עד להופעת צל חיבור.'], ['סימולטור לא זז','ודאו Takeoff בראש הקוד.'], ['סימולטור מבקש סיסמה','הזינו סיסמה עדכנית מה־Curriculum Dashboard.']],
    instructorSlides: [
      { title:'ממריאים אל המחר', body:'שיעור פתיחה לקורס Tello Mission Lab. היום אנחנו חוקרי רחפנים, לא מטיסי צעצועים.', bullets:['כיתה ו׳', 'DroneBlocks Simulator', 'סימולטור בלבד'] },
      { title:'Ingenuity: רחפן מחקר על מאדים', body:'רחפן שלא מקבל פקודות בזמן אמת חייב לפעול לפי תוכנית מדויקת.', bullets:['אוטונומיה', 'קוד כמשימת טיסה', 'מחקר בסביבה לא מוכרת'] },
      { title:'חוקי ברזל לבטיחות', body:'בטיחות היא תנאי להפעלת רחפן, גם כשעובדים היום רק בסימולטור.', bullets:['משקפי מגן בעתיד', 'שיער אסוף', 'אזור סטרילי', 'Abort כשיש סכנה'] },
      { title:'אנטומיה של Tello EDU', body:'מנועים, מדחפים, LED, VPS, סוללה ומגיני פרופלורים.', bullets:['Brushless Motors', 'Propellers', 'VPS', 'Battery'] },
      { title:'System Check Alpha', body:'משימת הבסיס: מוודאים שהמערכת יודעת להמריא, לרחף ולנחות.', bullets:['Takeoff', 'Hover 5 seconds', 'Land'] },
      { title:'שאלת חוקר', body:'למה קוד שעובד בסימולטור יכול להשתנות במציאות?', bullets:['מזגן/רוח', 'רצפה מבריקה ו־VPS', 'סוללה חלשה'] }
    ]
  });


  Object.assign(window.TELLO_MISSION_LAB_LESSONS[1], {
    title: 'שיעור 2: אתגר סריקת חממת העתיד',
    subtitle: 'ניווט דו־מימדי, פניות והשוואת שתי שיטות Box Mission',
    essentialQuestion: 'איך בוחרים שיטת ניווט מתאימה למשימת חקר: שמירת כיוון מצלמה או פנייה בכל פינה?',
    successCriteria: ['אני מבדיל/ה בין Pitch, Roll ו־Yaw.', 'אני בונה Strafing Box של 1.5 מטר ב־Minimal Grid.', 'אני מתאר/ת Yaw Box ומבין/ה איך Loop יכול לקצר אותו.', 'אני מסביר/ה מה עלול להשתבש במעבר מסימולטור למציאות.'],
    realWorldUses: [
      { icon:'🌿', title:'חקלאות דיגיטלית', text:'רחפן סורק שורות צמחים ומאתר מזיקים או אזורי יובש.' },
      { icon:'🧪', title:'ניסוי מבוקר', text:'אותו ריבוע נבדק בשתי שיטות כדי להשוות דיוק, בטיחות ויעילות.' },
      { icon:'📸', title:'מצלמה כעין חוקר', text:'ב־Strafing המצלמה ממשיכה להביט לאותו כיוון, ולכן קל יותר לסרוק שורה קבועה.' }
    ],
    vocabulary: [['Pitch / עלרוד','תנועה קדימה או אחורה ביחס לאף הרחפן.'], ['Roll / גלגול','תנועה צדית ימינה או שמאלה בלי לסובב את האף.'], ['Yaw / סבסוב','סיבוב האף ימינה או שמאלה במקום.'], ['Strafing Box','ריבוע שבו האף נשאר לאותו כיוון והרחפן נע קדימה/צד/אחורה/צד.'], ['Yaw Box','ריבוע שבו הרחפן טס קדימה ופונה 90° בכל פינה.'], ['Loop','קיצור קוד שחוזר על Forward + Yaw ארבע פעמים.'], ['1.5m','מרחק עבודה בסימולטור: 1.5 מטר, לא הוראת טיסה פיזית בכיתה.']],
    safetyRules: ['שיעור 2 הוא סימולטור בלבד — לא מטיסים רחפן פיזי.', 'לפני שמירה ושיתוף חייבים WiFi בית ספרי.', 'WiFi של Tello אינו אינטרנט ולכן לא שומרים דרכו לענן.', 'אם הבלוקים לא נדבקים — מחפשים צל חיבור לפני הרצה.'],
    teamRoles: [['Driver / נהג','בונה את רצף הבלוקים בטאבלט.'], ['Navigator / נווט','בודק מצפן, כיוונים ומרחק 1.5 מטר.'], ['Observer / תצפיתן','מתעד תוצאה ושואל מה היה משתבש בעולם האמיתי.']],
    networkProcedure: ['מתחברים ל־WiFi בית ספרי לפני DroneBlocks.', 'פותחים DroneBlocks Simulator / Minimal Grid.', 'לא שומרים כשמחוברים ל־WiFi של רחפן.', 'שומרים בשם Greenhouse_Square_YourName ומשתפים Desktop Share Link.'],
    tabletTips: ['עובדים לרוחב בטאבלט.', 'בונים קודם את Strafing Box ואז רק משווים ל־Yaw Box.', 'אם הסימולטור טס לכיוון מוזר — Reset למצלמה ולרחפן.', 'משנים פרמטר אחד בכל פעם כדי לדבג כמו מהנדסים.'],
    debuggingGuide: [['הרחפן עף לכיוון לא צפוי','ייתכן שהמצלמה בסימולטור סובבה — לחצו Reset.'], ['שמירה נכשלת','הטאבלט כנראה על WiFi של Tello ולא על WiFi בית ספרי.'], ['בלוקים לא נדבקים','גוררים עד שמופיע צל חיבור/קליק.'], ['בלוקים לא רצים','ודאו שהם מחוברים לשרשרת שמתחילה ב־Takeoff.'], ['הסימולטור לא נטען','בדקו אינטרנט לפני פתיחת הסימולטור.']],
    lessonFlow: [
      { minutes:'0–8', title:'בדיקת תנאי קדם', teacher:'חוזרים על System Check Alpha: המראה, ריחוף, נחיתה וסימולטור בלבד.', students:'מסבירים למה בודקים בסימולטור לפני מדחפים.' },
      { minutes:'8–20', title:'עלילה: חממת העתיד', teacher:'מציגים בעיית מזיקים בחממה מרובעת ואת הצורך בסריקה מדויקת.', students:'מגדירים ארבע פינות חקר.' },
      { minutes:'20–32', title:'Pitch / Roll / Yaw בגוף', teacher:'פורסים מצפן כיתתי ומנחים רחפנים אנושיים.', students:'מבצעים Pitch קדימה, Roll ימינה ו־Yaw 90°.' },
      { minutes:'32–42', title:'נוהל רשת כפולה', teacher:'WiFi בית ספר לענן, WiFi רחפן רק בעתיד לטיסה פיזית.', students:'פותחים Minimal Grid בטאבלט.' },
      { minutes:'42–58', title:'אתגר 1: Strafing Box', teacher:'מדגימים ריבוע 1.5 מטר בלי פניות.', students:'בונים Takeoff → Forward → Right → Back → Left → Land.' },
      { minutes:'58–72', title:'אתגר 2: Yaw Box', teacher:'מציגים Forward + Yaw 90° בכל פינה ופותחים רעיון Loop.', students:'מסדרים חלופה ומזהים מה חוזר.' },
      { minutes:'72–82', title:'השוואת שיטות חקר', teacher:'שואלים: יעילות קוד מול בטיחות מצלמה.', students:'בוחרים שיטה לחממה ומנמקים.' },
      { minutes:'82–90', title:'שיתוף ותחזוקה', teacher:'Save Mission, Share Link, טעינת טאבלטים וסידור הכיתה.', students:'כרטיס יציאה על Pitch/Roll/Yaw.' }
    ],
    exercises: [
      { minutes:'20–30', title:'רחפנים אנושיים בחממה', prompt:'עמדו מול הצפון הכיתתי ובצעו Pitch, Roll ו־Yaw.', check:'יש הבחנה בין תנועה צדית לבין סיבוב.' },
      { minutes:'42–56', title:'Strafing Box', prompt:'בנו ריבוע 1.5 מטר: Takeoff → Forward → Right → Back → Left → Land.', check:'האף נשאר קבוע והמסלול נסגר.' },
      { minutes:'56–70', title:'Yaw Box', prompt:'תכננו חלופה: Forward + Yaw Right 90° בכל פינה.', check:'מזהים תבנית שחוזרת ארבע פעמים.' },
      { minutes:'70–78', title:'שאלת חוקר', prompt:'איזו שיטה מתאימה יותר לחממה ולמה?', check:'התשובה מזכירה מצלמה, בטיחות או Loop.' },
      { minutes:'78–86', title:'דיבוג מציאות', prompt:'מה יכול להשתבש בפינות כשנעבור בעתיד לרחפן אמיתי?', check:'מזגן/רוח, VPS, רצפה מבריקה או סוללה.' },
      { minutes:'86–90', title:'כרטיס יציאה', prompt:'השלימו: “Yaw אינו Roll כי...”', check:'המשפט מבחין בין סבסוב לתנועה צדית.' }
    ],
    instructorSlides: [
      { title:'אתגר סריקת חממת העתיד', body:'משימת חקר דו־מימדית: לסרוק חממה מרובעת בלי לפספס פינות.', bullets:['כיתה ו׳', 'Minimal Grid', 'סימולטור בלבד'] },
      { title:'Pitch / Roll / Yaw', body:'שפת התנועה של הרחפן.', bullets:['Pitch = קדימה/אחורה', 'Roll = הצידה', 'Yaw = סיבוב האף'] },
      { title:'אתגר 1: Strafing Box', body:'האף נשאר לצפון, המצלמה יציבה, והרחפן מחליק סביב הריבוע.', bullets:['Forward 60', 'Right 60', 'Back 60', 'Left 60'] },
      { title:'אתגר 2: Yaw Box', body:'הרחפן פונה בכל פינה וטס תמיד עם הפנים לכיוון התנועה.', bullets:['Forward 60', 'Yaw Right 90°', 'Loop ×4 בהמשך'] },
      { title:'דיון מהנדסים חוקרים', body:'איזו שיטה יעילה יותר? איזו בטוחה יותר לחממת מתחילים?', bullets:['Yaw Box קצר יותר עם Loop', 'Strafing שומר כיוון מצלמה', 'במציאות יש סטיות'] },
      { title:'שמירה ושיתוף', body:'Greenhouse_Square_YourName, My Missions, Desktop Share Link.', bullets:['WiFi בית ספרי', 'לא WiFi רחפן', 'טעינה וסידור'] }
    ]
  });

  // HYBRID_MODEL_GRADE6_LESSONS_1_5_START
  const grade6VideoResources = [
    { title:'NASA Ingenuity — השראה למשימות חקר', url:'https://mars.nasa.gov/technology/helicopter/', note:'להציג 60–90 שניות בלבד: למה רחפן חקר צריך תוכנית מדויקת?' },
    { title:'DroneBlocks Simulator — סביבת תרגול', url:'https://learn.droneblocks.io/', note:'מקור רקע למדריך; בכיתה עובדים דרך הטאבלטים והלומדה.' }
  ];
  const commonGrade6Setup = ['פותחים טאבלט לרוחב ומוודאים סוללה מעל 40%.', 'מתחברים ל־WiFi בית ספרי לפני פתיחת DroneBlocks כדי לאפשר שמירה/Share.', 'פותחים DroneBlocks Simulator / Minimal Grid.', 'עובדים בזוגות/שלשות בתפקידים: Driver, Navigator, Observer.', 'מריצים בסימולטור לפני כל דיון על רחפן פיזי.'];
  const commonGrade6TabletTips = ['לסגור אפליקציות מיותרות לפני סימולטור.', 'לגרור בלוקים עד חיבור פאזל ברור; בלוק לא מחובר אינו חלק מתוכנית הטיסה.', 'לשמור בשם שכולל שיעור וצוות, למשל G6_L3_TeamA.', 'אם השמירה לא עובדת — לבדוק שלא מחוברים ל־WiFi של הרחפן.', 'לשנות פרמטר אחד בלבד בכל הרצת דיבוג.'];
  const commonInstructorMediaNote = 'צילומי המסך במצגת הם נכסי Preview/DroneBlocks ונכסי המצגת החיצונית שהוכנה. לפני פרסום חיצוני מומלץ להחליף בצילומי טאבלט מקוריים מהכיתה.';
  const commonResearchSafety = ['שיעורים 1–4 הם סימולטור בלבד — אין חיבור לרחפן פיזי ואין Launch אמיתי.', 'בכל שיעור מזכירים: קוד הוא תוכנית טיסה; Land בסוף הוא כלל בטיחות.', 'בטיסה פיזית עתידית: משקפי מגן, שיער אסוף, אזור סטרילי ואישור מדריך.', 'לא עומדים במסלול טיסה ולא שולחים ידיים לכיוון מדחפים.', 'אם משהו לא ברור — Abort/עצירה עדיף על אלתור.'];

  Object.assign(window.TELLO_MISSION_LAB_LESSONS[0], {
    title: 'שיעור 1: ממריאים אל המחר — מרכז חקר רחפנים',
    subtitle: 'היכרות עם רחפן ככלי מחקר, בטיחות וסימולטור DroneBlocks',
    concept: 'רחפן ככלי חקר, System Check Alpha, בטיחות וסביבת סימולטור',
    story: 'הכיתה הופכת לצוות Mission Lab בהשראת Ingenuity על מאדים. לפני שמדחפים מסתובבים, חוקרים צעירים לומדים איך קוד קצר, בדיקת בטיחות וסימולטור הופכים רחפן מכלי משחק לכלי מחקר.',
    mission: 'לבנות ולהריץ בסימולטור את System Check Alpha: Takeoff → Hover 5 sec → Land, לשמור שם משימה ולהסביר למה זו בדיקה מדעית לפני טיסה.',
    essentialQuestion: 'איך רחפן הופך מכלי טיס לכלי מחקר שאפשר לסמוך עליו?',
    successCriteria: ['אני מסביר/ה שימוש מחקרי אמיתי לרחפנים כמו Ingenuity.', 'אני מזהה חלקי חומרה מרכזיים: מדחפים, סוללה, VPS ומנועים.', 'אני פועל/ת לפי נוהל סימולטור בלבד.', 'אני בונה רצף Takeoff → Hover → Land ומריץ/ה אותו.', 'אני מתעד/ת מה נבדק ב־System Check Alpha.'],
    realWorldUses: [
      { icon:'🪐', title:'Ingenuity על מאדים', text:'רחפן מחקר אוטונומי חייב לבצע תוכנית טיסה מדויקת בסביבה רחוקה.' },
      { icon:'🚑', title:'חילוץ ואסון', text:'רחפנים סורקים אזור מסוכן לפני כניסת צוותים.' },
      { icon:'🌾', title:'חקלאות מדויקת', text:'חוקרים שדות וצמחים מהאוויר כדי לזהות בעיות מוקדם.' },
      { icon:'🏗️', title:'בדיקות תשתית', text:'צילום גגות, גשרים וקווי חשמל בלי לסכן אדם בגובה.' }
    ],
    vocabulary: [['Mission Lab','מעבדת משימות חקר רחפנים.'], ['System Check','בדיקה קצרה שמוודאת שהמערכת מגיבה נכון.'], ['Lift / עילוי','כוח שמרים את הרחפן כשהמדחפים דוחפים אוויר כלפי מטה.'], ['Hover / ריחוף','שמירה על מיקום וגובה באוויר.'], ['VPS','חיישני תחתית שעוזרים לרחפן לשמור גובה ומיקום.'], ['Battery','הלב ומיכל הדלק של הרחפן.'], ['Abort','עצירת משימה כשיש סיכון או אי־ודאות.']],
    safetyRules: commonResearchSafety,
    commonDirections: [['Takeoff','המראה מבוקרת בתחילת משימה.'], ['Hover','ריחוף לבדיקת יציבות.'], ['Land','סיום בטוח, תמיד בסוף.'], ['System Check','בדיקה קצרה לפני משימה מורכבת.'], ['Simulator','סביבה סטרילית לבדיקת קוד.']],
    setupSteps: commonGrade6Setup,
    tabletTips: commonGrade6TabletTips,
    lessonFlow: [
      { minutes:'0–8', title:'פתיחת Mission Lab', teacher:'מציג את הקורס: אנחנו חוקרי רחפנים, לא מטיסי צעצועים.', students:'בוחרים שם צוות ותפקידים.' },
      { minutes:'8–20', title:'השראה: Ingenuity', teacher:'מציג תמונה/סרטון קצר של Ingenuity ושואל למה נדרש קוד מדויק.', students:'מזהים שימוש מחקרי וסיכון אחד.' },
      { minutes:'20–32', title:'אנטומיה ובטיחות', teacher:'מסביר מדחפים, VPS, סוללה, מנועים ואזור סטרילי.', students:'מסמנים שלושה כללי בטיחות.' },
      { minutes:'32–42', title:'פתיחת DroneBlocks', teacher:'מנחה WiFi בית ספרי, סימולטור וטאבלט לרוחב.', students:'פותחים Minimal Grid.' },
      { minutes:'42–58', title:'בניית System Check Alpha', teacher:'מדגים חיבור בלוקים: Takeoff, Hover, Land.', students:'בונים ומריצים בסימולטור.' },
      { minutes:'58–72', title:'דיבוג ראשוני', teacher:'שואל מה קורה אם Land חסר או Hover לא מחובר.', students:'בודקים רצף ומתקנים חיבורי בלוקים.' },
      { minutes:'72–90', title:'תיעוד, שיתוף וסיכום', teacher:'מדגים תיעוד קצר: מה בדקנו ומה למדנו, ומחבר לשיעור 2: תנועה דו־מימדית בחממה.', students:'כותבים שתי שורות תיעוד וכרטיס יציאה.' }
    ],
    exercises: [
      { minutes:'8–18', title:'שימוש מחקרי', prompt:'כתבו שימוש אמיתי אחד לרחפן חקר וסיכון אחד.', check:'יש שימוש וסיכון.' },
      { minutes:'20–30', title:'מפת חומרה', prompt:'התאימו מדחפים, VPS וסוללה לתפקיד שלהם.', check:'לפחות שלושה חלקים נכונים.' },
      { minutes:'32–42', title:'פתיחת סימולטור', prompt:'פתחו Minimal Grid בטאבלט.', check:'הסימולטור פתוח וללא חיבור לרחפן.' },
      { minutes:'42–58', title:'System Check Alpha', prompt:'בנו Takeoff → Hover 5 sec → Land.', check:'הרצף מחובר ומורץ.' },
      { minutes:'58–70', title:'מצא את הבאג', prompt:'מה מסוכן אם Land לא נמצא בסוף?', check:'התשובה מחברת סדר פקודות לבטיחות.' },
      { minutes:'72–82', title:'תיעוד חוקר', prompt:'כתבו: בדקנו ___ וגילינו ___.', check:'יש תיעוד קצר.' },
      { minutes:'82–90', title:'כרטיס יציאה', prompt:'רחפן חקר צריך קוד מדויק כי...', check:'המשפט מזכיר בטיחות/חזרתיות/מחקר.' }
    ],
    deliverable: 'System Check Alpha שמור ומתועד: רצף בסיסי בסימולטור + שתי שורות תיעוד חוקר.',
    assessment: ['הרצף מתחיל ב־Takeoff ומסתיים ב־Land.', 'התלמיד מסביר למה Hover הוא בדיקת יציבות.', 'התלמיד מזהה לפחות שלושה כללי בטיחות.', 'התיעוד מחבר בין קוד למחקר.', 'הצוות עובד בתפקידים.'],
    debugging: [{ problem:'בלוק לא רץ', fix:'בודקים שהוא מחובר מתחת ל־Run Mission.' }, { problem:'אין נחיתה', fix:'מוסיפים Land בסוף ומסבירים למה.' }, { problem:'לא מצליחים לשמור', fix:'חוזרים ל־WiFi בית ספרי.' }, { problem:'בלבול בין סימולטור לרחפן', fix:'מדגישים: שיעור 1 סימולטור בלבד.' }],
    differentiation: { support:['לתת רצף בלוקים מודפס.', 'לעבוד בזוג עם Driver חזק.', 'להסתפק בהסבר בעל פה במקום כתיבה מלאה.'], extension:['להוסיף Comment שמסביר את מטרת הבדיקה.', 'להשוות System Check לרשימת בדיקה של טייסים.', 'להכין שאלה אחת על Ingenuity.'] },
    instructorGuide: { prerequisites:'אין דרישת קדם טכנית. חשוב לוודא שכל תלמיד מבין שהקורס מתחיל בסימולטור בלבד ושבטיחות היא תנאי עבודה.', pedagogy:['לבנות זהות של “חוקר רחפנים” ולא של “מטיס”.', 'להדגיש שהתוצר הוא בדיקה אמינה, לא טריק מרשים.', 'כבר בשיעור 1 להפריד בין טיסה ידנית לבין תוכנית טיסה בקוד.'], mediaNote: commonInstructorMediaNote, exitTicket:'רחפן חקר צריך תוכנית מדויקת כי ___.' },
    videoResources: grade6VideoResources,
    screenshotSlides: [
      { title:'פותחים DroneBlocks Simulator', src:'assets/tello-mission-lab/lesson1/open-app.png', caption:'בודקים שהטאבלט מחובר ל־WiFi בית ספרי ושהעבודה היא בסימולטור בלבד.' },
      { title:'System Check Alpha', src:'assets/tello-mission-lab/lesson1/block-sequence.png', caption:'Takeoff → Hover → Land: בדיקה קצרה שמוודאת שהמערכת מגיבה.' },
      { title:'הרצה בסימולטור', src:'assets/tello-mission-lab/lesson1/simulator-run.png', caption:'הסימולטור הוא סביבת הבדיקה לפני עולם פיזי.' },
      { title:'שמירה ותיעוד', src:'assets/tello-mission-lab/lesson1/save-share.png', caption:'שם משימה ברור ותיעוד חוקר קצר.' }
    ],
    instructorSlides: [
      { title:'Mission Lab נפתח', body:'אנחנו לא מטיסים צעצוע — אנחנו בונים תוכנית חקר בטוחה.', bullets:['חוקר רחפנים', 'קוד כתוכנית טיסה', 'סימולטור בלבד'] },
      { title:'Ingenuity כהשראה', body:'רחפן מחקר רחוק חייב לפעול לפי הוראות מדויקות.', bullets:['אוטונומיה', 'דיוק', 'בדיקות לפני משימה'] },
      { title:'System Check Alpha', body:'בדיקת הבסיס: ממריאים, מרחפים, נוחתים.', bullets:['Takeoff', 'Hover', 'Land'] }
    ]
  });

  Object.assign(window.TELLO_MISSION_LAB_LESSONS[1], {
    title: 'שיעור 2: אתגר סריקת חממת העתיד',
    subtitle: 'ניווט דו־מימדי, Pitch/Roll/Yaw והשוואת Strafing Box מול Yaw Box',
    concept: 'Pitch, Roll, Yaw, Box Mission והשוואת שיטות סריקה',
    story: 'צוות החקר מוזמן לחממה אוטונומית שבה צריך לסרוק ארבע פינות בלי לגעת בצמחים. הרחפן צריך לנוע כמו כלי מדידה: לא מהר, לא אקראי — מדויק.',
    mission: 'לבנות Strafing Box בגודל 1.5 מטר בסימולטור, לתכנן חלופת Yaw Box, ולהסביר איזו שיטה טובה יותר לחקר חממה.',
    essentialQuestion: 'מתי עדיף לשמור את המצלמה לאותו כיוון ומתי עדיף לפנות בכל פינה?',
    successCriteria: ['אני מבדיל/ה בין Pitch, Roll ו־Yaw.', 'אני בונה Strafing Box של 1.5 מטר.', 'אני מתאר/ת Yaw Box ומזהה תבנית חזרתית.', 'אני מנמק/ת בחירת שיטה לפי צורך חקר.', 'אני מתעד/ת סיכון מעבר לעולם פיזי.'],
    safetyRules: commonResearchSafety,
    commonDirections: [['Pitch','קדימה/אחורה ביחס לאף הרחפן.'], ['Roll','תנועה ימינה/שמאלה בלי לסובב את האף.'], ['Yaw','סיבוב האף סביב הציר האנכי.'], ['Strafing Box','ריבוע שבו המצלמה שומרת כיוון.'], ['Yaw Box','ריבוע עם פנייה בכל פינה.']],
    setupSteps: commonGrade6Setup,
    tabletTips: commonGrade6TabletTips,
    deliverable: 'Greenhouse_Box_G6: משימת Strafing Box שמורה + נימוק קצר להשוואה מול Yaw Box.',
    assessment: ['המסלול יוצר ריבוע סגור.', 'יש הבחנה נכונה בין Roll ל־Yaw.', 'הנימוק מתייחס למצלמה/בטיחות/יעילות.', 'התלמיד מזהה תבנית שיכולה להפוך ללולאה בהמשך.', 'התיעוד כולל סיכון מציאותי.'],
    debugging: [{ problem:'התלמיד מסובב במקום לזוז הצידה', fix:'מדגימים בגוף Roll מול Yaw.' }, { problem:'הריבוע לא נסגר', fix:'בודקים שמרחקי 1.5m מופיעים בכל צלע.' }, { problem:'המצלמה בסימולטור מבלבלת', fix:'Reset Camera ו־Reset Drone לפני הרצה.' }, { problem:'שומרים בלי אינטרנט', fix:'בודקים WiFi בית ספרי.' }],
    differentiation: { support:['לתת ציור ריבוע עם ארבע פקודות.', 'להתחיל רק ב־Forward/Right ואז להשלים.', 'לאפשר הסבר בעל פה להשוואה.'], extension:['לבנות Yaw Box מלא בסימולטור.', 'להציע איך Loop יקצר את הקוד.', 'להוסיף מדד: מספר בלוקים מול בהירות מצלמה.'] },
    instructorGuide: { prerequisites:'נדרש System Check Alpha משיעור 1 והבנה ש־Takeoff/Land הם גבולות בטיחות.', pedagogy:['שיעור 2 הוא הגשר בין תנועה בסיסית לחשיבה מחקרית.', 'הדגמה גופנית של Pitch/Roll/Yaw חשובה במיוחד בכיתה ו׳.', 'לא לרדוף אחרי “ריבוע מושלם”; המטרה היא הבנת שיטת סריקה.'], mediaNote: commonInstructorMediaNote, exitTicket:'Yaw שונה מ־Roll כי ___.' },
    videoResources: grade6VideoResources,
    screenshotSlides: [
      { title:'Minimal Grid לחממה', src:'assets/tello-mission-lab/lesson2/open-app.png', caption:'פותחים סביבת עבודה נקייה לסריקת חממה.' },
      { title:'Strafing Box', src:'assets/tello-mission-lab/lesson2/block-sequence.png', caption:'האף נשאר לאותו כיוון: Forward → Right → Back → Left.' },
      { title:'בדיקת מסלול', src:'assets/tello-mission-lab/lesson2/simulator-run.png', caption:'בודקים אם הריבוע נסגר ואם הכיוון נשמר.' },
      { title:'שיתוף תוצאה', src:'assets/tello-mission-lab/lesson2/save-share.png', caption:'שומרים עם נימוק שיטת סריקה.' }
    ]
  });

  Object.assign(window.TELLO_MISSION_LAB_LESSONS[2], {
    title: 'שיעור 3: נקודת דגימה — מרחק, גובה ותיעוד חקר',
    subtitle: 'שילוב המצגת החיצונית: Up/Forward/Down/Hover ומשימת דגימה מדידה',
    concept: 'גובה, מרחק, נקודת יעד, תיעוד ניסוי והשוואת שתי הרצות',
    story: 'צוות Mission Lab מקבל נקודת דגימה בתחנת חקר. הרחפן צריך לעלות לגובה בטוח, להתקדם לנקודה, לרדת מעט לתצפית, לרחף, ולתעד מה היה משתנה בעולם אמיתי.',
    mission: 'לבנות תוכנית דגימה מדידה: Takeoff → Up 2.5m → Forward 1.5m → Down 1.25m → Hover 5 sec → Land, להריץ שתי גרסאות ולתעד שינוי פרמטר אחד.',
    blocks: ['takeoff','up_100','forward','down_50','hover','land'],
    essentialQuestion: 'איך הופכים “תטוס לשם” לתוכנית טיסה מדידה עם מספרים ותיעוד?',
    successCriteria: ['אני משתמש/ת בגובה ומרחק כנתונים הנדסיים.', 'אני מבדיל/ה בין Up/Down לבין Land.', 'אני מריץ/ה לפחות שתי גרסאות עם שינוי פרמטר אחד.', 'אני מתעד/ת תכנון, תוצאה והשערה.', 'אני מסביר/ה מה עלול להשתנות בעולם פיזי.'],
    realWorldUses: [
      { icon:'🧪', title:'דגימת שטח', text:'רחפן מגיע לנקודת יעד, משנה גובה ומבצע תצפית/מדידה.' },
      { icon:'🌋', title:'אזור מסוכן', text:'במקום שאדם ייכנס לאזור לא בטוח, הרחפן אוסף נתוני תצפית.' },
      { icon:'📊', title:'ניסוי חוזר', text:'השוואת שתי הרצות מאפשרת ללמוד מה השינוי בפרמטר עשה.' }
    ],
    vocabulary: [['Sampling Point','נקודת דגימה/תצפית מוגדרת מראש.'], ['Altitude / גובה','מיקום הרחפן בציר האנכי.'], ['Distance / מרחק','כמה הרחפן מתקדם בציר התנועה.'], ['Up','עלייה בגובה — לא תנועה קדימה.'], ['Down','ירידה מבוקרת — לא נחיתה.'], ['Parameter','ערך מספרי שאפשר לשנות ולבדוק.'], ['Test Table','טבלת ניסוי: תכנון, תוצאה, השערה.']],
    safetyRules: commonResearchSafety,
    commonDirections: [['Up','עלייה לגובה לפני תנועה.'], ['Forward','התקדמות לנקודת הדגימה.'], ['Down','ירידה לגובה תצפית, לא נחיתה.'], ['Hover','ריחוף לתצפית/דגימה.'], ['Land','סיום בטוח.']],
    setupSteps: commonGrade6Setup,
    tabletTips: commonGrade6TabletTips,
    lessonFlow: [
      { minutes:'0–8', title:'בדיקת תנאי קדם', teacher:'בודק שהתלמידים מבחינים בין Pitch/Roll/Yaw משיעור 2.', students:'מסבירים Roll מול Yaw במשפט.' },
      { minutes:'8–18', title:'שאלת שיעור מהמצגת', teacher:'מציג: איך הופכים “תטוס לשם” למספרים?', students:'משרטטים נקודת התחלה, יעד ונחיתה.' },
      { minutes:'18–30', title:'גובה ומרחק', teacher:'מסביר Up/Forward/Down כצירים שונים.', students:'מדגימים עם יד/גוף: למעלה, קדימה, למטה.' },
      { minutes:'30–42', title:'פתיחת סביבת עבודה', teacher:'משלב את צילומי המסך מהמצגת החיצונית ומראה היכן בונים.', students:'פותחים DroneBlocks Simulator.' },
      { minutes:'42–58', title:'בניית גרסה A', teacher:'מדגים רצף דגימה מדידה.', students:'בונים Takeoff → Up → Forward → Down → Hover → Land.' },
      { minutes:'58–70', title:'גרסה B — שינוי פרמטר אחד', teacher:'מבקש לשנות רק Forward או גובה אחד.', students:'מריצים ומשווים.' },
      { minutes:'70–82', title:'טבלת ניסוי', teacher:'מנחה תיעוד: תכנון/תוצאה/השערה.', students:'ממלאים שתי שורות ניסוי.' },
      { minutes:'82–90', title:'סיכום והכנה לשיעור 4', teacher:'מחבר לתצפית 360°: לפעמים צריך לסרוק סביב, לא רק להגיע.', students:'כרטיס יציאה.' }
    ],
    exercises: [
      { minutes:'8–18', title:'שרטוט נקודת דגימה', prompt:'ציירו Start, Sampling Point ו־Land.', check:'יש שלוש נקודות.' },
      { minutes:'18–30', title:'מיון פקודות', prompt:'סווגו Up/Down כגובה ו־Forward כמרחק.', check:'הסיווג נכון.' },
      { minutes:'42–58', title:'גרסה A', prompt:'בנו את רצף הדגימה המדידה.', check:'הרצף מחובר ונחת בסוף.' },
      { minutes:'58–70', title:'גרסה B', prompt:'שנו פרמטר אחד בלבד והריצו שוב.', check:'השינוי היחיד מתועד.' },
      { minutes:'70–80', title:'טבלת ניסוי', prompt:'כתבו תכנון, תוצאה והשערה לשתי הרצות.', check:'יש שתי שורות.' },
      { minutes:'80–86', title:'דיבוג מהמצגת', prompt:'אם הרחפן לא הגיע ליעד — מה בודקים קודם?', check:'מרחק/כיוון/Reset.' },
      { minutes:'86–90', title:'כרטיס יציאה', prompt:'גובה ומרחק הם נתונים כי...', check:'המשפט מחבר מספרים לתכנון.' }
    ],
    deliverable: 'Sampling_Point_G6: שתי גרסאות סימולטור + טבלת ניסוי קצרה עם שינוי פרמטר אחד.',
    assessment: ['הרצף כולל Up, Forward, Down, Hover ו־Land במקום נכון.', 'יש הבחנה בין Down לבין Land.', 'התלמיד משנה פרמטר אחד בלבד.', 'טבלת הניסוי כוללת תכנון/תוצאה/השערה.', 'התלמיד מסביר סיכון מעבר למציאות.'],
    debugging: [{ problem:'Down משמש במקום Land', fix:'מסבירים: Down משנה גובה; Land מסיים טיסה.' }, { problem:'כמה פרמטרים השתנו יחד', fix:'חוזרים לגרסה A ומשנים רק ערך אחד.' }, { problem:'הרחפן לא הגיע ליעד', fix:'בודקים Forward, כיוון האף ו־Reset סימולטור.' }, { problem:'אין תיעוד', fix:'עוצרים לפני גרסה B וממלאים טבלה.' }],
    differentiation: { support:['לתת טבלת ניסוי מוכנה.', 'להשתמש בערכים מוכנים בלי שינוי חופשי.', 'לעבוד רק עם גרסה A ולתעד בעל פה.'], extension:['להשוות שינוי גובה מול שינוי מרחק.', 'להוסיף צילום/Photo כפעולת דגימה תאורטית.', 'לנסח השערת חוקר לפני גרסה B.'] },
    instructorGuide: { prerequisites:'נדרש שיעור 2: הבחנה בין Pitch/Roll/Yaw והבנה בסיסית של ריבוע סריקה. שיעור 3 נשען על המצגת החיצונית שנבנתה ומעביר אותה לתוך מערכת הקורס.', pedagogy:['זה שיעור מפתח: מעבר מפקודות תנועה למשתנים מדידים.', 'להדגיש: “מרחק וגובה אינם ניחוש — הם נתונים בתוכנית הטיסה”.', 'כיתה ו׳ צריכה תיעוד ניסוי קצר, לא רק הצלחה בסימולטור.'], mediaNote: 'שיעור 3 משלב את המצגת החיצונית: מפגש 3 — Tello EDU / DroneBlocks. צילומי המסך הועתקו לתוך assets/tello-mission-lab/lesson3 כדי שהשיעור יעבוד מתוך מערכת הקורס.', exitTicket:'הופכים “תטוס לשם” לתוכנית מדידה כש___.' },
    videoResources: grade6VideoResources,
    screenshotSlides: [
      { title:'פתיחת DroneBlocks / Simulator', src:'assets/tello-mission-lab/lesson3/open-app.png', caption:'צילום מהמצגת החיצונית: פתיחת סביבת העבודה.' },
      { title:'רצף בלוקים מדיד', src:'assets/tello-mission-lab/lesson3/block-sequence.png', caption:'Takeoff → Up → Forward → Down → Hover → Land.' },
      { title:'הרצה בסימולטור', src:'assets/tello-mission-lab/lesson3/simulator-run.png', caption:'בודקים האם המסלול תואם לתכנון.' },
      { title:'שמירה/שיתוף', src:'assets/tello-mission-lab/lesson3/save-share.png', caption:'שומרים גרסה ותיעוד לניסוי.' }
    ],
    instructorSlides: [
      { title:'נקודת דגימה', body:'היום הופכים יעד כללי לתוכנית מדידה עם גובה ומרחק.', bullets:['Start', 'Sampling Point', 'Land'] },
      { title:'גובה ומרחק הם נתונים', body:'Up, Forward ו־Down פועלים בצירים שונים.', bullets:['Altitude', 'Distance', 'Parameter'] },
      { title:'שתי גרסאות, שינוי אחד', body:'חוקר טוב משנה פרמטר אחד כדי להבין מה גרם לתוצאה.', bullets:['Version A', 'Version B', 'Test Table'] }
    ]
  });

  Object.assign(window.TELLO_MISSION_LAB_LESSONS[3], {
    title: 'שיעור 4: Grid Scan ראשון — סריקת שטח חכמה',
    subtitle: 'Loop בסימולטור: סריקה שיטתית של שטח בלי לפספס נקודות',
    unit: 'יחידה 2 — סריקות שטח וגבהים',
    concept: 'Grid Scan, תבנית זיגזג, Loop, כיסוי שטח ומוכנות אחרונה לפני רחפן פיזי',
    workspaceMode: 'droneblocks-app',
    appWorkflowTitle: 'עובדים ב־DroneBlocks App — Grid Scan בסימולטור',
    appWorkflowNote: 'האתר משמש כתדריך חקר וכרטיס משימה. את הלולאות והסריקה בונים באפליקציית DroneBlocks בטאבלט, בסימולטור Minimal Grid או Mars Simulator.',
    visualDiagram: { panelTitle:'🗺️ שרטוט Grid Scan', chip:'מסלול זיגזג', title:'סריקה שיטתית של 4 שורות', src:'assets/tello-mission-lab/lesson4/grid-scan-diagram.svg', alt:'שרטוט Grid Scan עם נתיב זיגזג בין ארבע שורות', caption:'כמו לקרוא ספר שורה־אחר־שורה: Forward מכסה שורה, מעבר צד עובר לשורה הבאה, ו־Loop חוזר על התבנית בלי להשאיר חורים.' },
    story: 'צוות Mission Lab מצטרף למשימת חקר בהשראת SeeTree: רחפנים סורקים מטעים ושדות בצורה שיטתית כדי לא לפספס אף אזור. הטיסה האקראית נראית מהירה, אבל מהנדסי חקר עובדים עם Grid Scan — מעבר שורה־אחר־שורה, כמו קריאת מפה מדעית.',
    mission: 'לבנות בסימולטור DroneBlocks משימת Grid Scan ראשונה: Takeoff → Loop ×2 של תבנית זיגזג קצרה: Forward 80in → Yaw Right 90° → Forward 30in → Yaw Right 90° → Forward 80in → מעבר לשורה הבאה → Land. המטרה היא להבין כיסוי שטח ולתעד אילו “שורות” נסרקו. משתנים מוצגים כהרחבה בלבד, לא כחובת שיעור.',
    essentialQuestion: 'איך אלגוריתם סריקה שיטתי מבטיח כיסוי שטח טוב יותר מטיסה אקראית?',
    successCriteria: [
      'אני מסביר/ה מהו Grid Scan ולמה הוא מתאים למשימות חקר.',
      'אני מזהה את תבנית הזיגזג החוזרת ומכניס/ה אותה ל־Loop.',
      'אני בונה או מתכנן/ת סריקה של לפחות 3–4 שורות בסימולטור.',
      'אני מתעד/ת אילו שורות נסרקו ומה נחשב כיסוי שטח מוצלח.',
      'אני משלים/ה Ready-for-Physical checklist לקראת שיעור 5.'
    ],
    blocks: ['takeoff','repeat_scan','forward','right','back','land'],
    realWorldUses: [
      { icon:'🌳', title:'חקלאות מדויקת', text:'רחפנים סורקים מטעים שורה־אחר־שורה כדי לזהות עצים שזקוקים למים או טיפול.' },
      { icon:'🗺️', title:'מיפוי שטח', text:'Grid Scan עוזר לוודא שכל אזור נסרק ולא נשארו “חורים” במפה.' },
      { icon:'🚨', title:'איתור וחילוץ', text:'במשימת חיפוש לא טסים באקראי — מחלקים שטח לרצועות סריקה ומתקדמים באופן שיטתי.' },
      { icon:'🧪', title:'ניסוי מדעי', text:'סריקה חוזרת באותה תבנית מאפשרת להשוות בין הרצות ולזהות סטיות.' }
    ],
    vocabulary: [
      ['Grid Scan','סריקה שיטתית של שטח לפי שורות/רצועות.'],
      ['Coverage / כיסוי שטח','כמה מהאזור נסרק בפועל וכמה נשאר לא מכוסה.'],
      ['Zigzag Pattern','תבנית הלוך־חזור: שורה קדימה, מעבר צד, שורה חזרה.'],
      ['Loop / לולאה','מבנה שחוזר על תבנית סריקה כמה פעמים.'],
      ['Row Length','אורך שורת הסריקה — בשיעור זה ערך קבוע, לא משתנה חובה.'],
      ['Scan Step','המרחק בין שורה לשורה.'],
      ['Variable / משתנה','ערך שאפשר לשנות במקום אחד; היום מוצג כהרחבה בלבד.' ],
      ['Ready-for-Physical Checklist','בדיקת מוכנות לפני מעבר לרחפן אמיתי.' ]
    ],
    safetyRules: [
      'שיעור 4 עדיין סימולטור בלבד — לא מחברים רחפנים פיזיים ולא עוברים ל־Tello WiFi.',
      'Grid Scan ארוך מדי בסימולטור הוא סימן לסיכון עתידי: מקצרים לפני מעבר לפיזי.',
      'לא מכניסים Takeoff או Land לתוך הלולאה.',
      'בודקים שהזיגזג נשאר בתוך גבולות השטח המדומה.',
      'משנים רק פרמטר אחד בכל פעם: אורך שורה, רוחב מעבר או מספר חזרות.',
      'שיעור 5 יתחיל רק בצ׳קליסט בטיחות, לא במסלול סריקה מלא.'
    ],
    commonDirections: [
      ['Forward 80in','סריקת שורה אחת קדימה.'],
      ['Yaw Right 90°','פנייה להכנת מעבר לשורה הבאה.'],
      ['Forward 30in','מעבר צד לרצועת הסריקה הבאה.'],
      ['Loop ×2','חזרה על תבנית זוג שורות כדי להגיע ל־4 שורות.'],
      ['Coverage Table','טבלה פשוטה: שורה 1/2/3/4 — נסרקה או לא נסרקה.']
    ],
    setupSteps: [
      'פותחים DroneBlocks App בטאבלט כשהמכשיר מחובר ל־WiFi בית ספרי.',
      'נכנסים לסימולטור Minimal Grid או Mars Simulator ויוצרים משימה בשם Grid_Scan_G6_TeamName.',
      'מציירים על דף/לוח שטח של 4 שורות ומסמנים מאיפה מתחילים ואיפה נוחתים.',
      'בונים תחילה שתי שורות ידנית: Forward → מעבר צד → Forward חזרה.',
      'מחליפים את התבנית החוזרת ב־Loop ×2 לפי רמת הכיתה.',
      'מריצים בסימולטור וממלאים Coverage Table: אילו שורות נסרקו?',
      'שומרים/משתפים תוצר וממלאים Ready-for-Physical checklist.'
    ],
    tabletTips: [
      'אם Mars Simulator כבד או איטי — עובדים ב־Minimal Grid; המטרה היא האלגוריתם, לא הגרפיקה.',
      'אם התלמידים מסתבכים עם Loop, לבנות קודם גרסה ידנית קצרה ואז להראות איפה התבנית חוזרת.',
      'Variables הם הרחבה בלבד: צוות מתקדם יכול ליצור row_length, אבל הכיתה לא חייבת.',
      'שם משימה מומלץ: Grid_Scan_G6_TeamName.'
    ],
    appWorkflow: [
      { title:'פתיחת סביבת חקר', detail:'DroneBlocks App → Simulator → Minimal Grid/Mars → משימה חדשה Grid_Scan_G6_TeamName.' },
      { title:'שרטוט שטח סריקה', detail:'מציירים 4 שורות. מסמנים Start, שורה 1, מעבר צד, שורה 2, שורה 3, שורה 4 ו־Land.' },
      { title:'גרסה ידנית קצרה', detail:'Takeoff → Forward 80in → Yaw Right 90° → Forward 30in → Yaw Right 90° → Forward 80in → Land. מבינים זוג שורות.' },
      { title:'גרסת Loop', detail:'מכניסים את תבנית זוג השורות ל־Loop ×2 כדי לכסות 4 שורות. Takeoff ו־Land נשארים מחוץ ללולאה.' },
      { title:'תיעוד כיסוי שטח', detail:'ממלאים Coverage Table: אילו שורות נסרקו? האם הייתה חפיפה? האם נוצר אזור שלא נסרק?' },
      { title:'הרחבה למצטיינים', detail:'יוצרים משתנה row_length ומשנים מ־80 ל־120 כדי לראות איך שינוי אחד משפיע על כל הסריקה.' },
      { title:'מוכנות לשיעור 5', detail:'שומרים/משתפים וממלאים Ready-for-Physical checklist: אזור סטרילי, צוות, Land, Stop/Abort, סוללה.' }
    ],
    lessonFlow: [
      { minutes:'0–8', title:'בדיקת תנאי קדם', teacher:'מחברים לשיעור 3: כבר יודעים מרחק, גובה ותיעוד ניסוי. היום מוסיפים כיסוי שטח שיטתי.', students:'מסבירים למה טיסה אקראית עלולה לפספס נקודות.' },
      { minutes:'8–18', title:'סיפור חקר: SeeTree', teacher:'מציגים חקלאות מדויקת וסריקת מטעים. שואלים איך מכסים שטח גדול בלי לפספס.', students:'מציעים שיטות סריקה ומשווים אקראי מול שיטתי.' },
      { minutes:'18–30', title:'Grid Scan על הלוח', teacher:'מציירים מלבן עם 4 שורות ומדגימים זיגזג: הלוך, מעבר צד, חזור.', students:'מסמנים שורות סרוקות ו“חורים” בכיסוי.' },
      { minutes:'30–42', title:'פתיחת DroneBlocks וסביבת סימולטור', teacher:'מדגים Minimal Grid/Mars ושם משימה מסודר.', students:'פותחים משימה Grid_Scan_G6_TeamName.' },
      { minutes:'42–56', title:'בונים זוג שורות ידני', teacher:'מדגישים כיוון, Yaw ומעבר צד. עוד לא חייבים Loop.', students:'בונים Takeoff → Forward → מעבר צד → Forward חזרה → Land.' },
      { minutes:'56–70', title:'מזהים תבנית ומכניסים Loop', teacher:'מראה מה חוזר ואיך Loop ×2 יוצר 4 שורות.', students:'בונים/משדרגים לגרסת Loop לפי רמת הצוות.' },
      { minutes:'70–80', title:'תיעוד Coverage Table', teacher:'מחלק/מציג טבלת כיסוי: שורה, נסרקה?, הערה/סטייה.', students:'ממלאים טבלה לפי הרצת הסימולטור.' },
      { minutes:'80–86', title:'הרחבה או דיבוג', teacher:'למתקדמים: row_length כמשתנה; לתמיכה: דיבוג Loop/זווית/מרחק.', students:'מבצעים תיקון אחד או הרחבה אחת בלבד.' },
      { minutes:'86–90', title:'Ready for Physical', teacher:'מסכם: שיעור הבא פיזי, אבל לא סורקים מלא — קודם System Check.', students:'כרטיס יציאה: “Grid Scan עדיף מטיסה אקראית כי...”' }
    ],
    exercises: [
      { minutes:'18–26', title:'מפת שורות', prompt:'שרטטו שטח עם 4 שורות וסמנו נתיב זיגזג.', check:'יש Start, ארבע שורות ו־Land.' },
      { minutes:'26–34', title:'Coverage מול Random', prompt:'הסבירו למה טיסה אקראית עלולה להשאיר אזור לא סרוק.', check:'התשובה מזכירה כיסוי שטח/חורים.' },
      { minutes:'34–42', title:'פתיחת משימה', prompt:'צרו משימה Grid_Scan_G6_TeamName בסימולטור.', check:'שם המשימה ברור והטאבלט ב־WiFi בית ספרי.' },
      { minutes:'42–56', title:'זוג שורות ידני', prompt:'בנו מסלול שמכסה שתי שורות: Forward → מעבר צד → Forward חזרה.', check:'המסלול נשאר בשטח המדומה.' },
      { minutes:'56–70', title:'Loop Grid Scan', prompt:'הפכו את זוג השורות לתבנית שחוזרת פעמיים כדי לכסות 4 שורות.', check:'Takeoff/Land מחוץ ל־Loop והתבנית בתוך ה־Loop.' },
      { minutes:'70–78', title:'Coverage Table', prompt:'מלאו: שורה 1–4 — נסרקה? האם הייתה חפיפה או פספוס?', check:'יש תיעוד כיסוי ולא רק קוד.' },
      { minutes:'78–86', title:'דיבוג או משתנה הרחבה', prompt:'תקנו סטייה אחת, או לצוות מתקדם: הגדירו row_length ושנו ערך אחד.', check:'שינוי אחד בלבד בכל הרצה.' },
      { minutes:'86–90', title:'כרטיס יציאה', prompt:'השלימו: “Grid Scan עדיף מטיסה אקראית כי...”', check:'התשובה מחברת בין שיטתיות, כיסוי ודיוק.' }
    ],
    deliverable: 'Grid_Scan_G6: משימת סימולטור DroneBlocks עם סריקת 3–4 שורות, Coverage Table קצר, Share Link/צילום מסך ו־Ready-for-Physical checklist לקראת שיעור 5.',
    assessment: [
      'התלמיד מסביר Grid Scan וכיסוי שטח.',
      'המסלול בנוי כתבנית זיגזג ולא כתנועה אקראית.',
      'יש שימוש ב־Loop או הסבר ברור היכן התבנית החוזרת הייתה נכנסת ל־Loop.',
      'יש Coverage Table או תיעוד שורות סרוקות.',
      'התלמיד מבין ששיעור 5 מתחיל ב־System Check פיזי קצר ולא בסריקה מלאה.'
    ],
    debugging: [
      { problem:'הזיגזג מסתובב סביב עצמו', fix:'בודקים סדר Yaw: אחרי שורה קדימה צריך פנייה, מעבר צד ופנייה לכיוון השורה הבאה.' },
      { problem:'המסלול יוצא מהשטח', fix:'מקצרים row_length/scan_step ומריצים שוב. שינוי אחד בלבד.' },
      { problem:'Loop חוזר על Takeoff או Land', fix:'מוציאים Takeoff/Land מחוץ ללולאה ומשאירים רק תבנית הסריקה בפנים.' },
      { problem:'התלמידים נתקעים במשתנים', fix:'משתנים אינם חובה. חוזרים לערכי מרחק קבועים ומסיימים Coverage Table.' },
      { problem:'הטאבלט לא שומר', fix:'בודקים WiFi בית ספרי, Save ידני ואז Share/צילום מסך.' }
    ],
    differentiation: {
      support: ['לבנות שתי שורות ידנית בלי Loop ורק לסמן מה היה חוזר.', 'לתת דף שרטוט Grid עם Start ו־Land מוכנים.', 'להפחית ל־3 שורות במקום 4 כדי לשמור על הצלחה.'],
      extension: ['להוסיף משתנה row_length ולבדוק 80 מול 120 אינץ׳.', 'להשוות Grid Scan מול מסלול אקראי מבחינת אזורים מפוספסים.', 'להציע כיצד Mission Pad עתידי יכול לסמן תחנת דגימה בתוך אחת השורות.' ]
    },
    instructorGuide: {
      prerequisites: 'התלמידים מכירים Takeoff/Land, Forward/Back/Yaw וגובה בסיסי. אם Yaw עדיין לא יציב, להדגים בגוף לפני בניית הזיגזג.',
      pedagogy: ['זהו שיעור חקר ראשון שבו “כיסוי שטח” הוא התוצר, לא רק טיסה יפה.', 'Variables הם רעיון הרחבה. החובה הפדגוגית היא Grid Scan + Loop + תיעוד Coverage.', 'שיעור 4 הוא עדיין סימולטור בלבד כדי למנוע מעבר מוקדם למסלולים פיזיים מורכבים.'],
      exitTicket: 'Grid Scan עדיף מטיסה אקראית כי ___.',
      safetyBridge: 'להדגיש בסיום: בשיעור 5 הטיסה הפיזית תהיה System Check קצר; סריקה פיזית תותר רק כהרחבה זעירה לצוותים יציבים.'
    },
    screenshotSlides: [
      { title:'שרטוט Grid Scan', src:'assets/tello-mission-lab/lesson4/grid-scan-diagram.svg', caption:'המסלול נראה כמו קריאת ספר: שורה, מעבר צד, שורה חזרה — עד כיסוי מלא.' },
      { title:'משרטטים אזור סריקה', src:'assets/tello-mission-lab/lesson4/open-app.png', caption:'לפני קוד — מגדירים שורות, התחלה, מעבר צד ונחיתה.' },
      { title:'תבנית זיגזג', src:'assets/tello-mission-lab/lesson4/block-sequence.png', caption:'Forward → מעבר צד → Forward חזרה. זו התבנית שנכנסת ל־Loop.' },
      { title:'בודקים כיסוי שטח', src:'assets/tello-mission-lab/lesson4/simulator-run.png', caption:'מסמנים אילו שורות נסרקו והאם נשארו חורים בכיסוי.' },
      { title:'שומרים ומוכנים לפיזי', src:'assets/tello-mission-lab/lesson4/save-share.png', caption:'Share Link/צילום מסך + צ׳קליסט מוכנות לשיעור 5.' }
    ],
    instructorSlides: [
      { title:'Grid Scan ראשון', body:'היום לומדים לסרוק שטח כמו חוקרים: שורה־אחר־שורה, לא באקראי. האנלוגיה: קוראים ספר — לא קופצים בין מילים, עוברים שורה אחרי שורה.', bullets:['SeeTree', 'כיסוי שטח', 'סימולטור בלבד'] },
      { title:'מה הבעיה בטיסה אקראית?', body:'טיסה אקראית דומה לצביעה עם עיניים עצומות: חלקים נצבעים פעמיים וחלקים נשארים לבנים. Grid Scan מונע “חורים” במפה.', bullets:['Coverage', 'חורים במפה', 'אלגוריתם סריקה'] },
      { title:'תבנית הזיגזג — רואים לפני שבונים', body:'שרטטו על הלוח: שורה קדימה, מעבר צד, שורה חזרה. רק אחרי שהמסלול נראה ברור — מעבירים אותו לבלוקים.', bullets:['Forward', 'Yaw', 'Scan Step', 'Loop ×2'] },
      { title:'Variables כהרחבה', body:'משתנה row_length הוא כמו כפתור מרחק מרכזי: משנים ערך במקום אחד וכל שורות הסריקה מתארכות או מתקצרות.', bullets:['לא להעמיס', 'ערכים קבועים מספיקים', 'הרחבה למצטיינים'] },
      { title:'גשר לשיעור 5', body:'בשיעור הבא עוברים לפיזי בזהירות: System Check קודם, סריקה קטנה רק אם הצוות יציב.', bullets:['צ׳קליסט', 'אזור סטרילי', 'Land תמיד בסוף'] }
    ]
  });


  Object.assign(window.TELLO_MISSION_LAB_LESSONS[4], {
    title: 'שיעור 5: טיסת הבכורה של רחפני המחקר והתצפית',
    subtitle: 'מעבר ראשון לרחפן פיזי: יציבות חיישנים, WiFi כפול, טלמטריה וסריקת ריבוע מוקטנת',
    unit: unitNames.launch,
    concept: 'Pre-Flight Check, Tello WiFi, Telemetry, ריחוף יציב, Yaw תצפית, scan_distance ו־Grid Scan פיזי מוקטן',
    workspaceMode: 'physical-lab',
    appWorkflowTitle: 'מעבדת טיסה פיזית — DroneBlocks App ורחפן Tello באישור מדריך בלבד',
    appWorkflowNote: 'האתר הוא תדריך ומערך עבודה. הקוד נבנה/נטען באפליקציית DroneBlocks בטאבלט, נשמר בענן דרך WiFi בית ספרי, ומורץ פיזית רק אחרי Pre‑Flight Check וחיבור מבוקר ל־Tello WiFi.',
    story: 'צוותי המעבדה הניידת של כיתה ו׳ מקבלים אישור ראשון להוציא את רחפני החקר מהסימולטור אל השטח. בארבעת המפגשים הקודמים הם תכננו סריקות וחקר בסביבה וירטואלית; היום הם בודקים האם קוד סטרילי עומד מול פיזיקה אמיתית: רוח מזגן, תאורת רצפה, VPS, סוללה, רעש ולחץ בטיחות.',
    mission: 'לבצע טיסת בכורה פיזית בשתי משימות מאושרות: 1) בדיקת ריחוף ותצפית: Takeoff → Delay 15 sec → Yaw Right 90° → Yaw Left 90° → Land, מדידת סחיפה ובדיקת מוכנות לצילום; 2) טעינת קוד סריקת הריבוע משיעור 4, שינוי scan_distance פעם אחת מ־60in ל־30in, והרצה פיזית רק אם המדריך מאשר שהריבוע נשאר בתוך Safe Fly Zone.',
    blocks: ['safety_check','takeoff','hover','yaw_360','land','grid_scan'],
    physicalFlightAllowed: true,
    essentialQuestion: 'מה קורה כשקוד סריקה מחקרי שעבד בסימולטור פוגש רחפן אמיתי, חיישנים אמיתיים ואזור טיסה מוגבל?',
    successCriteria: [
      'אני מבצע/ת Pre‑Flight Check מלא: סוללה, פרופלורים, מגינים, אזור, קוד ותפקידים.',
      'אני מסביר/ה מתי משתמשים ב־WiFi בית ספרי ומתי עוברים ל־Tello WiFi.',
      'אני מריץ/ה בדיקת ריחוף ותצפית קצרה ומודד/ת סחיפה בס״מ.',
      'אני יודע/ת למה מקטינים scan_distance מ־60in ל־30in לפני הרצה בכיתה.',
      'אני מתעד/ת הבדל אחד בין סימולטור למציאות ומחזיר/ה ציוד וסוללות לפי נוהל.'
    ],
    realWorldUses: [
      { icon:'🛰️', title:'בדיקת יציבות חיישנים', text:'רחפן מחקר צריך להיות יציב מספיק לפני צילום או מיפוי.' },
      { icon:'📡', title:'טלמטריה', text:'נתוני גובה, סוללה וחיבור עוזרים לקבל החלטות בזמן טיסה.' },
      { icon:'🧭', title:'כיול למציאות', text:'אותו קוד דורש Scale Down כאשר עוברים מסימולטור לכיתה.' },
      { icon:'🦺', title:'צוות טיסה', text:'Driver, Navigator ו־Safety Observer מקטינים סיכון ומעלים דיוק.' }
    ],
    vocabulary: [
      ['Pre‑Flight Check','בדיקת כשירות אווירית לפני כל המראה פיזית.'],
      ['Telemetry Bar','אזור באפליקציה שמציג נתוני חיבור, סוללה וגובה.'],
      ['Safe Fly Zone','מלבן טיסה מסומן שאסור להיכנס אליו כשהרחפן דולק או באוויר.'],
      ['Takeoff Callout','הכרזה קולית לפני Run: “צוות X ממריא / רחפנים באוויר”.'],
      ['VPS','חיישני ראייה תחתיים שמושפעים מתאורה ומרקם הרצפה.'],
      ['scan_distance','משתנה מרחק מרכזי שמאפשר להקטין את הסריקה בפעם אחת.'],
      ['Scale Down','התאמת קנה מידה: הקטנת 60in ל־30in כדי להישאר בטוחים בכיתה.']
    ],
    safetyRules: [
      'אין חיבור לרחפן ואין Run פיזי בלי אישור מדריך.',
      'משקפי מגן לצוות המטיס ושיער ארוך אסוף.',
      'אף תלמיד לא נכנס ל־Safe Fly Zone כאשר הרחפן דולק או באוויר.',
      'לפני כל המראה הנהג מכריז בקול והשאר מאשרים שהשטח פנוי.',
      'רק תצפיתן בטיחות מניח ומחזיר רחפן כשהוא כבוי ועל הקרקע.',
      'אם הרחפן סוטה לכיוון גבול — משתמשים ב־Land/Abort לפי הנחיית מדריך ולא רצים אליו.',
      'סוללות ריקות עוברות מיד לקופסת 0%; לא מאחסנים סוללה בתוך הרחפן.'
    ],
    commonDirections: [
      ['Takeoff → Delay 15 → Yaw Right 90 → Yaw Left 90 → Land','בדיקת ריחוף ותצפית ראשונית.'],
      ['scan_distance = 60in','ערך סימולטור/שיעור 4 גדול מדי לכיתה.'],
      ['scan_distance = 30in','ערך פיזי מוקטן להרצת ריבוע בתוך Safe Fly Zone.'],
      ['Tello WiFi','חיבור פיזי לרחפן, ללא אינטרנט לענן.'],
      ['School WiFi','שמירה, טעינה ושיתוף בענן DroneBlocks.']
    ],
    setupSteps: [
      'מסמנים מלבני Safe Fly Zone בגודל כ־1.5×1.5 מטר ומכינים קופסאות סוללות 100% / 0%.',
      'פותחים DroneBlocks ב־WiFi בית ספרי, נכנסים לחשבון וטוענים את קוד סריקת החממה/הריבוע משיעור 4.',
      'בונים/בודקים משימת ריחוף קצרה בסימולטור לפני רחפן פיזי.',
      'מבצעים Pre‑Flight Check פיזי: סוללה, פרופלורים, מגינים, אזור, תפקידים וקוד.',
      'מתחברים ל־Tello WiFi רק בהוראת מדריך ומריצים צוות אחד בכל פעם.',
      'אחרי הרצה חוזרים ל־WiFi בית ספרי לשמירה, Share Link ותחקיר.'
    ],
    tabletTips: [
      'אם אין Share Link — כנראה עדיין מחוברים ל־Tello WiFi; לחזור ל־WiFi בית ספרי.',
      'אם האפליקציה מציגה Disconnected — לבדוק שהטאבלט מחובר לרשת TELLO הנכונה.',
      'לא עורכים קוד בזמן שהרחפן באוויר.',
      'לשמור גרסה בשם Grid_Scan_Physical_Tested או TeamX_Physical_Check.'
    ],
    appWorkflow: [
      { title:'פתיחה בענן', detail:'School WiFi → DroneBlocks → Login → טעינת קוד שיעור 4: סריקת חממה/ריבוע עם scan_distance.' },
      { title:'משימה 1 — בדיקת ריחוף ותצפית', detail:'בונים/בודקים: Takeoff → Delay 15 sec → Yaw Right 90° → Yaw Left 90° → Land. מוודאים Land בסוף.' },
      { title:'Pre‑Flight Check', detail:'סוללה 100%, פרופלורים ומגינים, Safe Fly Zone, משקפי מגן, שיער אסוף, Driver/Navigator/Observer והכרזת המראה.' },
      { title:'חיבור Tello WiFi', detail:'רק בהנחיית מדריך עוברים לרשת TELLO‑XXXXXX של הרחפן האישי. לא מתחברים לרחפן של צוות אחר.' },
      { title:'מדידת סחיפה', detail:'מריצים משימת ריחוף, מודדים כמה ס״מ הרחפן סטה מנקודת ההמראה ומחליטים אם הוא יציב מספיק לצילום עתידי.' },
      { title:'משימה 2 — סריקת ריבוע פיזית', detail:'משנים scan_distance מ־60in ל־30in פעם אחת בלבד, מתרגלים Land/Abort, ומריצים רק באישור מדריך.' },
      { title:'סגירה ושיתוף', detail:'Land, כיבוי רחפן, סוללה לקופסת 0%, חזרה ל־School WiFi, שמירת Grid_Scan_Physical_Tested ו־Share Link.' }
    ],
    visualDiagram: { panelTitle:'🛫 טיסת בכורה מחקרית', chip:'Physical Lab', title:'מסימולטור למציאות: ריחוף, סחיפה וריבוע מוקטן', src:'assets/tello-mission-lab/lesson5/research-first-flight-diagram.svg', alt:'תרשים טיסת בכורה מחקרית: ריחוף, מדידת סחיפה והקטנת scan_distance', caption:'קודם בודקים יציבות; רק אחר כך מקטינים את סריקת הריבוע ל־30in ומריצים בזהירות.' },
    lessonFlow: [
      { minutes:'0–8', title:'בדיקת תנאי קדם', teacher:'מחברים לשיעור 4: Grid Scan/Variables בסימולטור. מסבירים שהיום בודקים מציאות לפני משימת חקר מלאה.', students:'מציינים סיכון פיזי אחד שלא קיים בסימולטור.' },
      { minutes:'8–20', title:'בטיחות ותפקידי צוות', teacher:'מציג PPE, Safe Fly Zone, Takeoff Callout ו־Driver/Navigator/Observer.', students:'מתחלקים לצוותים ומסמנים תפקידים.' },
      { minutes:'20–35', title:'WiFi כפול וטעינת קוד', teacher:'מדגים School WiFi לשמירה ו־Tello WiFi להרצה; טוענים את קוד שיעור 4.', students:'פותחים DroneBlocks, נכנסים לחשבון ומאתרים את קוד הסריקה.' },
      { minutes:'35–45', title:'Pre‑Flight Check', teacher:'עובר עם התצפיתנים על סוללה, פרופלורים, מגינים, אזור וקוד.', students:'מסמנים צ׳ק־ליסט ומחכים לאישור.' },
      { minutes:'45–60', title:'משימה 1: ריחוף ותצפית', teacher:'מאשר צוותים לפי תור ומבקש למדוד סחיפה.', students:'מריצים Takeoff → Delay → Yaw ימינה/שמאלה → Land ומתעדים יציבות.' },
      { minutes:'60–76', title:'משימה 2: ריבוע פיזי מוקטן', teacher:'מדגיש שינוי scan_distance פעם אחת בלבד מ־60in ל־30in ותרגול Abort.', students:'מעדכנים משתנה, מריצים/צופים ומתעדים האם הריבוע נשאר בגבולות.' },
      { minutes:'76–85', title:'תחקיר מחקרי', teacher:'שואל: מה ההבדל בין הסימולטור לרחפן אמיתי? האם היה יציב מספיק לצילום?', students:'כותבים הבדל אחד והחלטת מוכנות לצילום.' },
      { minutes:'85–90', title:'תחזוקה ושיתוף', teacher:'מנהל כיבוי, סוללות, החזרת ציוד וחזרה ל־School WiFi.', students:'שומרים/משתפים Grid_Scan_Physical_Tested.' }
    ],
    exercises: [
      { minutes:'8–18', title:'תפקידי צוות', prompt:'כתבו מי הנהג, הנווט ותצפיתן הבטיחות ומה כל אחד עושה בזמן Run.', check:'לכל תלמיד תפקיד ברור.' },
      { minutes:'20–28', title:'מפת WiFi כפול', prompt:'סמנו מתי משתמשים ב־School WiFi ומתי ב־Tello WiFi.', check:'התלמיד יודע ש־Tello WiFi אינו מתאים לשמירה בענן.' },
      { minutes:'28–35', title:'טעינת קוד שיעור 4', prompt:'פתחו את קוד סריקת החממה/הריבוע ומצאו את scan_distance.', check:'הצוות מצא את ערך המרחק המרכזי.' },
      { minutes:'35–45', title:'Pre‑Flight Check', prompt:'בדקו סוללה, פרופלורים, מגינים, אזור וקוד.', check:'אין סעיף ריק לפני אישור.' },
      { minutes:'45–60', title:'ריחוף וסחיפה', prompt:'הריצו Takeoff → Delay 15 → Yaw Right/Left → Land ומדדו סטייה בס״מ.', check:'הייתה הכרזה, נחיתה ותיעוד סחיפה.' },
      { minutes:'60–70', title:'Scale Down', prompt:'שנו scan_distance מ־60in ל־30in בלבד. אל תשנו את שאר מבנה הקוד.', check:'השינוי נעשה במקום אחד.' },
      { minutes:'70–76', title:'תרגול Abort', prompt:'לפני Run, הצביעו על Land/Abort והסבירו מתי משתמשים בו.', check:'הצוות יודע לעצור במקרה סיכון.' },
      { minutes:'76–90', title:'תחקיר ושיתוף', prompt:'שמרו Grid_Scan_Physical_Tested וכתבו הבדל אחד בין סימולטור למציאות.', check:'יש תוצר או תיעוד ברור.' }
    ],
    deliverable: 'Grid_Scan_Physical_Tested: תיעוד ריחוף וסחיפה, קוד סריקת ריבוע עם scan_distance מוקטן ל־30in, תרגול Land/Abort ו־Share Link/צילום מסך לאחר חזרה ל־School WiFi.',
    assessment: ['הצוות עמד בכל נהלי הבטיחות לפני חיבור לרחפן.', 'הריחוף הפיזי הסתיים בנחיתה ותועד בס״מ/משפט תצפית.', 'scan_distance הוקטן מ־60in ל־30in במקום אחד בלבד.', 'התלמיד יודע להסביר הבדל אחד בין סימולטור למציאות.', 'הציוד והסוללות הוחזרו לפי נוהל שתי קופסאות.'],
    debugging: [
      { problem:'נורת סטטוס צהובה / אין חיבור', fix:'בודקים שהטאבלט מחובר לרשת TELLO‑XXXXXX הנכונה ולא ל־School WiFi.' },
      { problem:'הרחפן לא ממריא / נורה אדומה', fix:'מחליפים סוללה מקופסת 100% ומעבירים חלשה ל־0%.' },
      { problem:'סחיפה חזקה בריחוף', fix:'בודקים תאורה ורצפה, מוסיפים טקסטורה/סרט צבעוני ובודקים פרופלורים.' },
      { problem:'הריבוע יוצא מהאזור', fix:'מוודאים ש־scan_distance הוא 30in ולא 60in; לא משנים כמה פרמטרים יחד.' },
      { problem:'Share Link נכשל', fix:'חוזרים ל־School WiFi ורק אז שומרים/משתפים.' }
    ],
    differentiation: { support:['להריץ רק משימת ריחוף ותצפית, בלי ריבוע פיזי.', 'לתת צ׳ק־ליסט מודפס לתלמידים שזקוקים למסגרת.', 'לאפשר תפקיד תצפיתן לפני נהג.'], extension:['לחשב סחיפה בס״מ ולסווג יציבות: טוב/בינוני/לא מוכן לצילום.', 'להשוות scan_distance 30in ל־25in אם האזור קטן.', 'לנסח המלצת צוות לקראת שיעור 6: מה לשפר לפני Grid Scan מלא.'] },
    instructorGuide: { prerequisites:'שיעור 5 נשען על שיעור 4: התלמידים מכירים Grid Scan/Loop/scan_distance בסימולטור. אם שיעור 4 לא הושלם היטב, לבצע רק ריחוף פיזי ותחקיר ולא להריץ ריבוע.', pedagogy:['זה שיעור מעבר מבוקר: ההצלחה היא בטיחות, תפקידים ותחקיר פיזיקלי.', 'Yaw ימינה/שמאלה משמש כתצפית ולא כתרגיל ראווה.', 'משימת הריבוע היא בדיקת Scale Down של קוד מחקרי, לא תחרות ביצועים.', 'הכנה לצילום בשיעורים הבאים: יציבות היא תנאי לאיסוף נתונים איכותי.'], mediaNote:'התרשים המקומי הוא ויזואל מקורי. צילומי מסך DroneBlocks קיימים הם טיוטה ויש להחליף בצילומי טאבלט מקוריים לפני פרסום.', exitTicket:'רחפן שמוכן לצילום צריך להיות יציב כי ___.' },
    screenshotSlides: [
      { title:'טיסת בכורה מחקרית', src:'assets/tello-mission-lab/lesson5/research-first-flight-diagram.svg', caption:'ריחוף, מדידת סחיפה וריבוע מוקטן ל־30in.' },
      { title:'צ׳ק־ליסט לפני פיזי', src:'assets/tello-mission-lab/lesson5/open-app.png', caption:'אזור סטרילי, תפקידים, סוללה, פרופלורים ו־Land.' },
      { title:'קוד קצר + scan_distance', src:'assets/tello-mission-lab/lesson5/block-sequence.png', caption:'בודקים ריחוף ואז מקטינים את קוד הריבוע משיעור 4.' }
    ],
    instructorSlides: [
      { title:'טיסת בכורה של רחפני המחקר', body:'היום עוברים מהסימולטור לשטח — בזהירות, בצוותים ובקוד קצר.', bullets:['Safe Fly Zone', 'WiFi כפול', 'Telemetry'] },
      { title:'בדיקת ריחוף ותצפית', body:'רחפן מחקר חייב להיות יציב לפני צילום ומיפוי.', bullets:['Delay 15', 'Yaw 90° ימינה/שמאלה', 'מדידת סחיפה'] },
      { title:'Scale Down לסריקה', body:'קוד של 60in מהסימולטור גדול מדי לכיתה; משנים scan_distance ל־30in.', bullets:['שינוי אחד', 'פחות סיכון', 'יותר שליטה'] },
      { title:'תחקיר מציאות', body:'הפיזיקה היא חלק מהלמידה: רוח, תאורה, VPS, סוללה ולחץ.', bullets:['מה ראינו?', 'מה מדדנו?', 'מה נשפר?'] }
    ]
  });


  Object.assign(window.TELLO_MISSION_LAB_LESSONS[5], {
    title: 'שיעור 6: מבצע איתור ניצולים — Search & Grid Scan',
    subtitle: 'סריקת שטח שיטתית בזיגזג: כיסוי, לולאות, Hover ו־Physical Debugging',
    unit: unitNames.survey,
    concept: 'Grid Scan, Zigzag, Random vs Systematic Search, Loops, Hover for Data, Battery Budget, Physical Debugging',
    workspaceMode: 'physical-lab',
    appWorkflowTitle: 'משימת חקר פיזית — DroneBlocks App, סימולטור Minimal Grid ורחפן באישור',
    appWorkflowNote: 'בונים את מסלול הזיגזג באפליקציית DroneBlocks, בודקים ב־Minimal Grid, ורק לאחר אישור בטיחות מעבירים לרחפן פיזי באזור האסון המסומן.',
    story: 'מפקדת הסיוע האווירי מזעיקה את צוותי החקר: באזור הררי מרוחק התרחש אירוע, וצוותי הקרקע לא יכולים להיכנס. הרחפן צריך לסרוק שטח מסומן בצורה שיטתית, לא אקראית, לעצור מעל נקודות עניין ולחסוך סוללה כדי למצוא את כרטיסיות הניצולים.',
    mission: 'לבנות ולהריץ משימת Grid Scan זיגזגית: Takeoff → Forward 80cm → Hover 2 sec → מעבר שורה 50cm → Backward 80cm → Hover 2 sec → מעבר שורה 50cm → Forward 80cm → Land. בסימולטור בודקים כיסוי; בפיזי מריצים באזור האסון המסומן ומתקנים סטייה אחת בכל פעם.',
    blocks: ['safety_check','takeoff','forward','hover_data','left','back','hover_data','left','forward','land'],
    physicalFlightAllowed: true,
    essentialQuestion: 'למה סריקה שיטתית בזיגזג עדיפה על טיסה אקראית כאשר מחפשים ניצולים תחת מגבלת סוללה?',
    successCriteria: ['אני מסביר/ה את ההבדל בין Random Search ל־Grid Scan.', 'אני מפרק/ת סריקת שטח לשורות, מעברי שורה וריחוף נתונים.', 'אני משתמש/ת בלולאה/תבנית חוזרת כדי לקצר קוד ולהפחית טעויות.', 'אני מריץ/ה קודם ב־Minimal Grid ורק אחר כך פיזית באישור.', 'אני מתעד/ת סטייה פיזית ומתקן/ת פרמטר אחד בלבד.'],
    realWorldUses: [
      { icon:'🚑', title:'חיפוש והצלה', text:'סריקה שיטתית מגדילה סיכוי למצוא יעד בלי לפספס אזורים.' },
      { icon:'🌳', title:'SeeTree וחקלאות', text:'רחפנים סורקים שורות עצים כדי לזהות בעיות במהירות.' },
      { icon:'🔋', title:'Battery Budget', text:'מסלול מסודר חוסך זמן וסוללה לעומת תנועה אקראית.' },
      { icon:'🧩', title:'Decomposition', text:'מסלול מורכב נבנה ממקטעים פשוטים שחוזרים על עצמם.' }
    ],
    vocabulary: [['Grid Scan','סריקת שטח לפי שורות/תאים כדי לא לפספס אזורים.'], ['Zigzag','תבנית הלוך־חזור בין שורות.'], ['Random Search','חיפוש אקראי שעלול להשאיר חורים בכיסוי.'], ['Coverage','מידת הכיסוי של כל תא שטח.'], ['Hover for Data','ריחוף קצר לצילום/סריקת חיישנים מדומה.'], ['Battery Budget','ניהול זמן טיסה קצר תחת מגבלת סוללה.'], ['Physical Debugging','תיקון קוד בעקבות סחיפה, רוח או תנאי רצפה.']],
    safetyRules: ['הרחפן הפיזי מופעל רק באזור האסון המסומן ובאישור מדריך.', 'משקפי מגן, שיער אסוף ומגיני פרופלור הם חובה.', 'רק צוות אחד/מעט צוותים מטיסים לפי החלטת מדריך; שאר הצוותים עובדים בסימולטור.', 'תצפיתן בטיחות שומר קשר עין ויודע היכן Land/Abort.', 'אין שינויי קוד בזמן רחפן באוויר.', 'בסוף כל סבב מוציאים סוללה ומחזירים לקופסה הנכונה.'],
    commonDirections: [['Forward 80cm','סריקת שורה קדימה.'], ['Hover 2 sec','עצירת איסוף נתונים מעל נקודת קצה/מטרה.'], ['Left 50cm','מעבר לשורה הבאה.'], ['Backward 80cm','סריקת שורה בכיוון ההפוך.'], ['Loop / Repeat','קיצור תבנית שחוזרת במסלול הזיגזג.'], ['Grid_Scan_Team_X','שם פרויקט לשמירה ושיתוף.']],
    setupSteps: ['מסמנים על הרצפה אזור אסון 1.5×1.5 מטר וכרטיסיות ניצולים.', 'פותחים DroneBlocks ב־School WiFi ויוצרים Grid_Scan_Team_X.', 'בונים את מסלול הזיגזג ומריצים ב־Minimal Grid.', 'מבצעים Pre‑Flight Check ותפקידים.', 'עוברים ל־Tello WiFi רק לפי הוראת מדריך ומריצים באזור המסומן.', 'חוזרים ל־School WiFi לשמירה, Share Link ותחקיר.'],
    tabletTips: ['אם עובדים פיזית לפי תור, צוותים ממתינים ממשיכים לשפר סימולטור ולא מבזבזים סוללה.', 'אם Share Link נכשל, לחזור מ־Tello WiFi לרשת בית ספרית.', 'לא להגדיל מרחקים בלי למדוד את האזור הפיזי.', 'שם גרסה מומלץ: Grid_Scan_Team_X_V1/V2.'],
    appWorkflow: [
      { title:'הגדרת אזור אסון', detail:'מסמנים מלבן 1.5×1.5 מטר, 4 כרטיסיות ניצולים ונקודת המראה/נחיתה.' },
      { title:'Random מול Grid', detail:'משווים סריקה אקראית לסריקה שיטתית: האם יש כיסוי מלא? איפה נוצרים חורים?' },
      { title:'בניית Zigzag ב־DroneBlocks', detail:'Takeoff → Forward 80cm → Hover 2s → Left 50cm → Backward 80cm → Hover 2s → Left 50cm → Forward 80cm → Land.' },
      { title:'בדיקת Minimal Grid', detail:'מריצים בסימולטור, בודקים שהזיגזג משלים את השטח ולא יוצא מגבולות.' },
      { title:'הרצה פיזית', detail:'רק לאחר Pre‑Flight Check: מתחברים ל־Tello WiFi, מריצים, התצפיתן שומר אזור והנווט מתעד סטייה.' },
      { title:'Physical Debugging', detail:'אם הייתה סחיפה, משנים ערך אחד בלבד, למשל מעבר שורה מ־50cm ל־60cm או קיצור שורה.' },
      { title:'שיתוף וסגירה', detail:'חוזרים ל־School WiFi, שומרים Grid_Scan_Team_X, מפיקים Share Link ומחזירים סוללות.' }
    ],
    visualDiagram: { panelTitle:'🗺️ Search & Grid Scan', chip:'Physical Lab', title:'זיגזג שיטתי במקום טיסה אקראית', src:'assets/tello-mission-lab/lesson6/search-grid-scan-diagram.svg', alt:'תרשים זיגזג Grid Scan עם שלוש שורות וכרטיסיות ניצולים', caption:'הרחפן קורא את השטח כמו שורות בספר: שורה קדימה, מעבר, שורה חזרה — עד לכיסוי מלא.' },
    lessonFlow: [
      { minutes:'0–5', title:'התכנסות וציוד', teacher:'מחלקים טאבלטים אך לא פותחים רחפנים. הרחפנים כבויים עד שלב פיזי.', students:'מתיישבים בצוותים ומוודאים טאבלט טעון.' },
      { minutes:'5–12', title:'השראה: חיפוש והצלה', teacher:'מציג סרטון/סיפור SeeTree או DJI Search & Rescue ושואל למה לא לטוס אקראית.', students:'מציעים יתרונות של קוד אוטונומי.' },
      { minutes:'12–20', title:'Random מול Grid', teacher:'מדגים רומבה/סריקה בעיניים עצומות מול שורות מסודרות.', students:'מזהים למה שיטת השורות מכסה טוב יותר.' },
      { minutes:'20–25', title:'נוהל WiFi וענן', teacher:'מדגיש School WiFi לפני בנייה ושמירה; Tello WiFi רק להרצה.', students:'פותחים DroneBlocks ופרויקט חדש.' },
      { minutes:'25–40', title:'בניית זיגזג בסימולטור', teacher:'מדגים שורה, מעבר שורה, ריחוף נתונים וחזרה.', students:'בונים ומריצים ב־Minimal Grid.' },
      { minutes:'40–45', title:'רענון בטיחות ותפקידים', teacher:'מחלק Driver/Navigator/Observer ומוודא PPE.', students:'מסמנים צ׳ק־ליסט לפני פיזי.' },
      { minutes:'45–70', title:'מבצע איתור ניצולים', teacher:'מנהל סבבי טיסה. בזמן צוות אחד באוויר, אחרים משפרים סימולטור.', students:'מריצים זיגזג, מתעדים כיסוי וסטייה.' },
      { minutes:'70–78', title:'שמירה ושיתוף', teacher:'מחזיר לטאבלטים School WiFi ומדגים Share Link.', students:'שומרים Grid_Scan_Team_X ומגישים קישור/צילום.' },
      { minutes:'78–85', title:'דיון יעילות', teacher:'שואל איך לולאות עזרו לסוללה ומה גרם לסטיות.', students:'מנסחים תובנת חקר אחת.' },
      { minutes:'85–90', title:'תחזוקה', teacher:'מנהל סוללות, פרופלורים, החזרת רחפנים וטאבלטים.', students:'מחזירים ציוד וכרטיס יציאה.' }
    ],
    exercises: [
      { minutes:'12–18', title:'Random vs Grid', prompt:'ציירו אזור חיפוש וסמנו מה עלול להתפספס בטיסה אקראית.', check:'יש לפחות אזור חסר אחד והסבר.' },
      { minutes:'25–35', title:'בניית שורת זיגזג', prompt:'בנו Forward 80cm → Hover 2s → Left 50cm → Backward 80cm.', check:'הרצף כולל ריחוף נתונים.' },
      { minutes:'35–40', title:'בדיקת Minimal Grid', prompt:'הריצו וסמנו האם הזיגזג נשאר בגבולות.', check:'יש תוצאה ותיקון מוצע.' },
      { minutes:'40–45', title:'צ׳ק־ליסט פיזי', prompt:'בדקו PPE, תפקידים, סוללה, מגינים ו־Land/Abort.', check:'אין סעיף חסר.' },
      { minutes:'45–65', title:'סריקת אזור האסון', prompt:'הריצו/צפו בסריקה ותעדו כמה כרטיסיות/תחנות כוסו.', check:'יש מפת כיסוי או רשימת נקודות שנצפו.' },
      { minutes:'65–70', title:'דיבוג פיזי', prompt:'בחרו תיקון אחד: שורה, מעבר שורה או זמן Hover.', check:'לא משנים יותר מפרמטר אחד.' },
      { minutes:'70–78', title:'Share Link', prompt:'שמרו Grid_Scan_Team_X והפיקו Share Link/צילום מסך.', check:'התוצר ניתן להגשה.' },
      { minutes:'78–90', title:'כרטיס יציאה', prompt:'Grid Scan עדיף על Random כי ___.', check:'התשובה מזכירה כיסוי/סוללה/פספוסים.' }
    ],
    deliverable: 'Grid_Scan_Team_X: קוד זיגזג שמור ב־DroneBlocks, מפת כיסוי/תיעוד כרטיסיות ניצולים, תיקון פיזי אחד מתועד ו־Share Link/צילום מסך.',
    assessment: ['התלמיד מסביר Random מול Grid Scan.', 'הקוד כולל תבנית זיגזג וריחוף נתונים.', 'ההרצה הפיזית בוצעה רק לאחר סימולטור וצ׳ק־ליסט.', 'יש תיעוד כיסוי ולא רק “הרחפן טס”.', 'הדיבוג משנה פרמטר אחד בלבד.'],
    debugging: [
      { problem:'הרחפן סוטה ימינה/שמאלה', fix:'בודקים מזגן/לכלוך במנוע ומתקנים ערך אחד ב־10cm לפי כיוון הסטייה.' },
      { problem:'הרחפן לא ממריא / אדום מהיר', fix:'מחליפים סוללה טעונה ומאתחלים על רצפה ישרה.' },
      { problem:'שגיאת חיבור לרחפן', fix:'מוודאים שהטאבלט מחובר ל־Tello WiFi ולא School WiFi בזמן Run.' },
      { problem:'Share Link נכשל', fix:'חוזרים ל־School WiFi לפני שמירה ושיתוף.' },
      { problem:'הסריקה מפספסת כרטיסייה', fix:'מוסיפים Hover בנקודת קצה או מתקנים מעבר שורה, לא את כל הקוד.' }
    ],
    differentiation: { support:['להריץ שתי שורות בלבד במקום שלוש.', 'לתת תרשים זיגזג מוכן ולהשאיר רק התאמת מרחקים.', 'לאפשר לצוות חלש להישאר בסימולטור ולבצע תצפית פיזית.'], extension:['להוסיף טבלת כיסוי 3×3.', 'לחשב כמה שניות/סוללה נחסכו בעזרת לולאה.', 'להשוות Random Route קצר מול Grid Route מסודר.'] },
    instructorGuide: { prerequisites:'נדרש שיעור 5 מוצלח: התלמידים יודעים לחבר Tello WiFi, לבצע Pre‑Flight Check ולתעד סחיפה. אם לא — לצמצם לשתי שורות או סימולטור בלבד.', pedagogy:['זה השיעור שבו חקר הופך מכיוון יחיד לכיסוי שטח.', 'הדגש אינו “לסיים מסלול”, אלא להוכיח כיסוי שיטתי.', 'רומבה/קריאת ספר בשורות היא אנלוגיה חזקה להסבר הזיגזג.', 'בזמן המתנה לסבבי טיסה אין זמן סרק: צוותים משפרים סימולטור ומפת כיסוי.'], mediaNote:'התרשים המקומי הוא ויזואל מקורי. צילומי המסך קיימים כטיוטה ויש להחליף בצילומי טאבלט מקוריים לפני פרסום.', exitTicket:'סריקה שיטתית חוסכת סוללה כי ___.' },
    screenshotSlides: [
      { title:'מבצע איתור ניצולים', src:'assets/tello-mission-lab/lesson6/search-grid-scan-diagram.svg', caption:'זיגזג שיטתי מכסה שטח טוב יותר מטיסה אקראית.' },
      { title:'פותחים Grid Scan', src:'assets/tello-mission-lab/lesson6/open-app.png', caption:'יוצרים Grid_Scan_Team_X ב־School WiFi.' },
      { title:'רצף זיגזג', src:'assets/tello-mission-lab/lesson6/block-sequence.png', caption:'שורה, Hover, מעבר שורה וחזרה.' },
      { title:'שומרים ומגישים', src:'assets/tello-mission-lab/lesson6/save-share.png', caption:'Share Link ותיעוד כיסוי.' }
    ],
    instructorSlides: [
      { title:'משימות חקר וסריקת שטח', body:'היום הרחפן מחפש ניצולים באזור מסומן — לא טס אקראית.', bullets:['Search', 'Grid Scan', 'Coverage'] },
      { title:'Random מפספס, Grid מכסה', body:'כמו רומבה חדשה או קריאת ספר: שורה אחרי שורה.', bullets:['שיטתי', 'חוסך סוללה', 'פחות חורים'] },
      { title:'תכנות חכם', body:'לולאות וריחוף הופכים מסלול ארוך לקוד קצר וברור.', bullets:['Loop', 'Hover 2s', 'Zigzag'] },
      { title:'דיבוג מהמסך למציאות', body:'רוח, סוללה ורצפה משנים את המסלול. מתקנים ערך אחד בלבד.', bullets:['+10cm', '-10cm', 'תיעוד'] }
    ]
  });


  Object.assign(window.TELLO_MISSION_LAB_LESSONS[6], {
    title: 'שיעור 7: שומרי היערות — מצלמה כחיישן ואיסוף מידע חזותי',
    subtitle: 'Take Photo, Motion Blur, Hover לפני צילום ופענוח קוד SOS מתמונות',
    unit: unitNames.camera,
    concept: 'Camera as Sensor, Take Photo, Hover/Wait לפני צילום, Motion Blur, Data Retrieval, Battery Management',
    workspaceMode: 'physical-lab',
    appWorkflowTitle: 'משימת צילום פיזית — DroneBlocks App, City/Minimal Simulator וגלריית הרחפן',
    appWorkflowNote: 'האתר מציג את תדריך הצילום והבטיחות. את בלוק Take Photo, שמירת התמונות והורדת הגלריה מבצעים באפליקציית DroneBlocks/הרחפן בטאבלט.',
    story: 'צוותי כיתה ו׳ מצטרפים לחברת Aerobotics במשימת שומרי היערות. הרחפן כבר יודע לטוס ולסרוק; עכשיו הוא הופך לפלטפורמת חיישנים ניידת. עליו להגיע לנקודות צילום, לעצור לריחוף כדי למנוע Motion Blur, לצלם מטרות בגבהים שונים ולפענח את קוד ה־SOS מהתמונות.',
    mission: 'לתכנן ולהריץ משימת Tree_Scan_TeamX: Takeoff → Up/Forward אל מטרה → Hover/Wait 2 sec → Take Photo → מעבר למטרה הבאה → Take Photo → Land. לאחר הנחיתה מורידים/פותחים את התמונות, בודקים חדות, מפענחים את הקוד הסודי ושומרים Share Link/תיעוד.',
    blocks: ['safety_check','takeoff','up_100','forward','hover','photo','wait','land'],
    physicalFlightAllowed: true,
    essentialQuestion: 'איך הופכים רחפן מכלי טיסה לפלטפורמת חיישנים שאוספת מידע חזותי אמין?',
    successCriteria: ['אני מסביר/ה למה מצלמה היא חיישן מדעי ולא “סתם צילום”.', 'אני מוסיף/ה Hover/Wait לפני Take Photo כדי למנוע Motion Blur.', 'אני מתכנן/ת מסלול צילום קצר עם 2–3 מטרות בגבהים בטוחים.', 'אני יודע/ת להוריד/לבדוק תמונות ולפענח קוד חזותי.', 'אני מנהל/ת סוללה: הרחפנים כבויים בזמן תכנון ורק סבבים מאושרים עולים לאוויר.'],
    realWorldUses: [
      { icon:'🌲', title:'שימור יערות', text:'רחפנים מצלמים אזורים קשים לגישה כדי לזהות שריפות, כריתה או בעלי חיים.' },
      { icon:'📷', title:'חיישן חזותי', text:'תמונה היא נתון שאפשר לנתח, להשוות ולפענח.' },
      { icon:'🧪', title:'איכות נתונים', text:'צילום מטושטש הוא דאטה גרוע; ריחוף לפני צילום משפר אמינות.' },
      { icon:'🔋', title:'סוללה קצרה', text:'תכנון נתיב יעיל שומר זמן טיסה לצילום עצמו.' }
    ],
    vocabulary: [['Take Photo','בלוק צילום באפליקציית DroneBlocks.'], ['Camera as Sensor','המצלמה אוספת נתונים חזותיים למחקר.'], ['Motion Blur','טשטוש שנוצר כשהרחפן זז בזמן צילום.'], ['Hover/Wait','עצירה לפני צילום כדי לייצב את הרחפן והמצלמה.'], ['Data Retrieval','הורדת/פתיחת התמונות מהרחפן/האפליקציה לטאבלט.'], ['Target / מטרה','כרטיסייה עם אות/מספר שצריך לצלם ולפענח.']],
    safetyRules: ['צילום פיזי מבוצע רק אחרי סימולטור ואישור מדריך.', 'מטרות הצילום מוצבות כך שאין טיסה מעל תלמידים.', 'לא מתקרבים למטרה ביד בזמן שהרחפן דולק או באוויר.', 'מגיני פרופלור, משקפי מגן ושיער אסוף חובה.', 'אם התמונה לא טובה — לא רצים לתקן פיזית; נוחתים, מתכננים, ואז מריצים שוב.', 'רחפנים כבויים בזמן תכנון כדי לשמור סוללה.'],
    commonDirections: [['Hover 2 sec → Take Photo','חוק התמונה החדה: קודם מתייצבים, אחר כך מצלמים.'], ['Yaw קטן אל המטרה','התאמת כיוון מצלמה לפני צילום.'], ['Tree_Scan_TeamX','שם המשימה לשמירה בענן.'], ['SOS Targets','כרטיסיות צילום שמרכיבות קוד סודי.'], ['Download Gallery','פתיחה/הורדת תמונות ובדיקת חדות.']],
    setupSteps: ['מכינים 3 מטרות צילום עם אותיות/מספרים בגבהים 50cm, 80cm ו־120cm לפי בטיחות הכיתה.', 'מסמנים מנחת ואזור עמידה בטוח.', 'פותחים DroneBlocks ב־School WiFi ושומרים Tree_Scan_TeamX.', 'בונים מסלול סימולטור עם Hover/Wait לפני Take Photo.', 'מבצעים Pre‑Flight Check, מתחברים ל־Tello WiFi ומריצים סבב צילום קצר.', 'אחרי נחיתה פותחים/מורידים תמונות, מפענחים קוד ושומרים תיעוד.'],
    tabletTips: ['אם תמונות לא זמינות, לבדוק שהצילום בוצע אחרי חיבור אמיתי לרחפן ולא רק בסימולטור.', 'אם Share Link נכשל, לחזור ל־School WiFi.', 'לא לשכוח Wait לפני Photo — אחרת התמונה תצא מטושטשת.', 'להחזיק טבלת מטרות: מטרה, גובה, האם התמונה חדה, אות שפוענחה.'],
    appWorkflow: [
      { title:'סיפור ואתגר צילום', detail:'Aerobotics / שומרי היערות: מצלמים 3 מטרות בגבהים שונים ומפענחים קוד SOS.' },
      { title:'חוק התמונה החדה', detail:'כל צילום חייב להיות אחרי Hover/Wait של 2 שניות לפחות. תנועה בזמן צילום = Motion Blur.' },
      { title:'תכנון בסימולטור', detail:'City/Minimal: Takeoff → Up/Forward → Hover/Wait → Take Photo → מעבר למטרה הבאה → Land.' },
      { title:'הקמת זירה פיזית', detail:'מטרות על שולחן/כיסא/לוח בגבהים בטוחים, Safe Fly Zone ואזור עמידה לצוות.' },
      { title:'הרצה וצילום', detail:'מתחברים ל־Tello WiFi, מריצים סבב מאושר, מצלמים מטרות ונוחתים.' },
      { title:'Data Retrieval', detail:'פותחים גלריה/תמונות בטאבלט, בודקים חדות, מפענחים אותיות/מספרים ורושמים ממצא.' },
      { title:'שיתוף ותחזוקה', detail:'חוזרים ל־School WiFi, שומרים קוד/תיעוד, מוציאים סוללות ומחזירים ציוד.' }
    ],
    visualDiagram: { panelTitle:'📷 Camera Sensor Mission', chip:'Physical Lab', title:'Hover → Take Photo → Decode', src:'assets/tello-mission-lab/lesson7/camera-sos-scan-diagram.svg', alt:'תרשים משימת צילום עם שלוש מטרות SOS בגבהים שונים', caption:'תמונה טובה היא נתון מחקרי: מתייצבים, מצלמים, מורידים ומפענחים.' },
    lessonFlow: [
      { minutes:'0–5', title:'סיפור שומרי היערות', teacher:'מציג Aerobotics/WWF ואתגר צילום אזורי יער מסוכנים.', students:'מגדירים למה רחפן עדיף מאדם בשטח מסוכן.' },
      { minutes:'5–15', title:'מצלמה כחיישן', teacher:'מסביר שמצלמה היא Sensor ושואל מה קורה אם מצלמים תוך כדי תנועה.', students:'מזהים Motion Blur ומציעים ריחוף לפני צילום.' },
      { minutes:'15–20', title:'בטיחות פיזית', teacher:'מרענן PPE, Safe Fly Zone, תפקידים ו־VPS/תאורה.', students:'מתחלקים לתפקידים ומוודאים ציוד.' },
      { minutes:'20–40', title:'תכנון וסימולטור', teacher:'מדגים Take Photo עם Wait/Hover לפניו ושמירת Tree_Scan_TeamX.', students:'בונים מסלול צילום קצר ובודקים בסימולטור.' },
      { minutes:'40–48', title:'הקמת מטרות', teacher:'מציג 3 מטרות בגבהים בטוחים ומסביר חוקי זירה.', students:'מסמנים טבלת מטרות וגבהים.' },
      { minutes:'48–70', title:'צילום פיזי ופענוח', teacher:'מנהל סבבי טיסה. צוותים ממתינים משפרים קוד/טבלה.', students:'מריצים, מצלמים, מורידים תמונות ומפענחים קוד.' },
      { minutes:'70–80', title:'בדיקת איכות נתונים', teacher:'שואל מי קיבל תמונה מטושטשת ומה בקוד פתר זאת.', students:'מסמנים חד/מטושטש ומציעים תיקון.' },
      { minutes:'80–85', title:'שיתוף קוד ותוצרים', teacher:'מוביל חזרה ל־School WiFi ושמירה.', students:'שומרים קוד ותיעוד/Share Link.' },
      { minutes:'85–90', title:'תחזוקה וסיכום', teacher:'מנהל הוצאת סוללות, פרופלורים והחזרת ציוד.', students:'כרטיס יציאה: “צילום טוב דורש...”' }
    ],
    exercises: [
      { minutes:'5–12', title:'חיישן או צעצוע?', prompt:'כתבו שימוש מחקרי אחד לתמונה מרחפן.', check:'התשובה מתייחסת לנתונים/ראיות.' },
      { minutes:'20–32', title:'חוק התמונה החדה', prompt:'הכניסו Hover/Wait לפני כל Take Photo במסלול.', check:'אין Take Photo מיד אחרי תנועה בלי המתנה.' },
      { minutes:'32–40', title:'בדיקת סימולטור', prompt:'הריצו Tree_Scan_TeamX בסימולטור ובדקו שיש נחיתה בטוחה.', check:'המסלול קצר ומסתיים ב־Land.' },
      { minutes:'40–48', title:'טבלת מטרות', prompt:'רשמו מטרה 1/2/3, גובה משוער ומה צריך לצלם.', check:'יש 3 מטרות או גרסה מצומצמת מאושרת.' },
      { minutes:'48–65', title:'צילום פיזי', prompt:'הריצו סבב מאושר וצילמו לפחות מטרה אחת, עד שלוש לפי זמן ובטיחות.', check:'יש תמונה/תיעוד או צפייה מודרכת.' },
      { minutes:'65–75', title:'פענוח איכות', prompt:'בדקו אם התמונה חדה ומה האות/מספר שנקלט.', check:'יש החלטת חדות וקוד מפוענח.' },
      { minutes:'75–85', title:'דיבוג צילום', prompt:'אם התמונה מטושטשת, איזה בלוק תוסיפו או תאריכו?', check:'התשובה מזכירה Hover/Wait לפני Take Photo.' },
      { minutes:'85–90', title:'כרטיס יציאה', prompt:'רחפן בלי מצלמה הוא כמו ___ כי ___.', check:'התשובה מחברת מצלמה לחיישן/מידע.' }
    ],
    deliverable: 'Tree_Scan_TeamX: קוד משימת צילום עם Hover/Wait לפני Take Photo, טבלת מטרות ותמונות/פענוח קוד SOS, בתוספת Share Link/צילום מסך ותיעוד איכות תמונה.',
    assessment: ['התלמיד מסביר מצלמה כחיישן מדעי.', 'הקוד כולל Hover/Wait לפני Take Photo.', 'ההרצה הפיזית מנוהלת בתפקידים ובטיחות.', 'התלמיד בודק איכות תמונה ומציע תיקון Motion Blur.', 'הציוד והסוללות נסגרים לפי נוהל.'],
    debugging: [
      { problem:'תמונות מטושטשות', fix:'מוסיפים/מאריכים Wait/Hover של 2 שניות לפני Take Photo.' },
      { problem:'סחיפה בריחוף', fix:'משפרים תאורה/טקסטורת רצפה, מכבים זרם מזגן או מוסיפים סימוני סרט צבעוני.' },
      { problem:'ניתוק WiFi בזמן טיסה', fix:'מצב טיסה + WiFi בלבד, פחות רחפנים במקביל וסבבי הטסה מדורגים.' },
      { problem:'אדום מהיר / סוללה חלשה', fix:'כיבוי, הוצאת סוללה לקופסה אדומה והחלפה ל־100%.' },
      { problem:'לא מוצאים תמונות', fix:'בודקים שהצילום בוצע בהרצה פיזית ושפותחים את גלריית הרחפן/האפליקציה המתאימה.' }
    ],
    differentiation: { support:['לצלם מטרה אחת בלבד בגובה קבוע.', 'לתת תבנית קוד עם מקום חסר ל־Wait ו־Photo.', 'לאפשר צוות תצפית שמפענח תמונות במקום להטיס.'], extension:['לצלם שלוש מטרות בגבהים שונים ולדרג איכות.', 'להשוות Wait 1 sec מול 3 sec.', 'להוסיף Yaw קטן לפני צילום כדי לשפר זווית.'] },
    instructorGuide: { prerequisites:'התלמידים כבר ביצעו טיסת בכורה ו־Grid Scan פיזי. אם בטיחות/חיבור עדיין לא יציבים, לצמצם למטרה אחת ולסימולטור.', pedagogy:['שיעור 7 מגדיר את הרחפן ככלי חקר אמיתי: איסוף דאטה ולא רק תנועה.', 'Motion Blur הוא מושג פיזיקלי מצוין לגשר בין קוד למציאות.', 'מומלץ להכין מטרות גדולות וברורות כדי שהתלמידים יחוו הצלחה.', 'ניהול סוללות קריטי: הרחפנים כבויים בזמן תכנון.'], mediaNote:'התרשים המקומי הוא ויזואל מקורי. לפני פרסום רצוי לצלם מסכי DroneBlocks/גלריה מקוריים מהטאבלטים.', exitTicket:'לפני Take Photo צריך Hover כי ___.' },
    screenshotSlides: [
      { title:'משימת צילום SOS', src:'assets/tello-mission-lab/lesson7/camera-sos-scan-diagram.svg', caption:'מטרות צילום בגבהים שונים: Hover, Photo, Decode.' },
      { title:'פתיחת Tree Scan', src:'assets/tello-mission-lab/lesson7/open-app.png', caption:'שומרים Tree_Scan_TeamX ב־School WiFi.' },
      { title:'Hover לפני Photo', src:'assets/tello-mission-lab/lesson7/block-sequence.png', caption:'חוק התמונה החדה: קודם מתייצבים, אחר כך מצלמים.' },
      { title:'פענוח ושיתוף', src:'assets/tello-mission-lab/lesson7/save-share.png', caption:'בודקים תמונות, מפענחים ושומרים תיעוד.' }
    ],
    instructorSlides: [
      { title:'ברוכים הבאים ל־Aerobotics', body:'היום הרחפן הופך לפלטפורמת חיישנים שמגנה על יערות.', bullets:['יער', 'חקר', 'צילום'] },
      { title:'המצלמה היא חיישן', body:'תמונה היא נתון. אם הרחפן זז בזמן צילום — הנתון נפגע.', bullets:['Camera Sensor', 'Motion Blur', 'Data'] },
      { title:'חוק התמונה החדה', body:'בכל תחנה: מגיעים, מרחפים, מצלמים — ורק אז ממשיכים.', bullets:['Hover/Wait', 'Take Photo', 'Next target'] },
      { title:'פענוח הקוד הסודי', body:'התוצר הוא לא רק קוד — הוא תמונות שאפשר לקרוא ולנתח.', bullets:['SOS', 'חדות', 'Share'] }
    ]
  });


  Object.assign(window.TELLO_MISSION_LAB_LESSONS[7], {
    "title": "שיעור 8: מבצע חילוץ בעין הסערה — אילוצים דינמיים בזמן אמת",
    "subtitle": "Fallback Execution: מטרה שזזה, מנהרת רוח, Set Speed, טלמטריה וניהול סוללה",
    "unit": "יחידה 3 — איסוף מידע חזותי",
    "concept": "Dynamic Constraints, Route Optimization, Set Speed, Telemetry, Fallback Route, Abort, Comment Blocks",
    "workspaceMode": "physical-lab",
    "appWorkflowTitle": "Physical Lab — DroneBlocks App, סימולטור ואז אתגר חילוץ משתנה",
    "appWorkflowNote": "האתר מציג תדריך חילוץ, תרשים זירה, כרטיס אילוץ ושלבי עבודה. את הקוד בונים באפליקציית DroneBlocks בטאבלט; הטסה פיזית מתבצעת רק אחרי סימולטור, שמירה, Safe Fly Zone ואישור מדריך.",
    "physicalFlightAllowed": true,
    "story": "אחרי ששיעור 7 הפך את המצלמה לכלי איסוף נתונים, צוותי החקר נשלחים למבצע חילוץ באזור הררי שקרס. הם צריכים לצלם כרטיסיות סימני חיים A ו־B, אבל באמצע המשימה המדריך מכריז על “מנהרת רוח” אסורה וכרטיסיית B זזה 40 ס״מ. כמו Waze בשטח חסום — מחשבים מסלול מחדש, אבל בלי לפגוע בבטיחות.",
    "mission": "לבנות Rescue Mission בסיסית: Set Speed 60% → Takeoff → טיסה לתחנה A → Hover 3 sec → Take Photo/תיעוד → טיסה לתחנה B → Hover → Land. לאחר הכרזת האילוץ, לעדכן את הנתיב תוך 10 דקות: לעקוף את מנהרת הרוח, להזיז את יעד B ב־40 ס״מ, לשמור גרסת Rescue_Fallback_Team_X ולהריץ פיזית רק באישור.",
    "blocks": [
        "safety_check",
        "comment",
        "set_speed",
        "takeoff",
        "forward",
        "hover_data",
        "photo",
        "right",
        "abort",
        "land",
        "share"
    ],
    "essentialQuestion": "איך צוות חקר משנה קוד תחת לחץ בלי לאבד בטיחות, מידע וסוללה?",
    "successCriteria": [
        "אני מסביר/ה מה השתנה באילוץ ומה הסיכון שנוצר.",
        "אני מוסיף/ה Set Speed מאוזן סביב 60% ולא בוחר/ת מהירות מקסימלית אוטומטית.",
        "אני משתמש/ת ב־Comment כדי לחלק את הקוד למקטעי משימה שקל לעדכן.",
        "אני משנה פרמטר/קטע אחד ברור כדי לעקוף את מנהרת הרוח או יעד B שזז.",
        "אני בודק/ת סוללה וטלמטריה לפני הרצה פיזית ושומר/ת Share Link בסוף."
    ],
    "realWorldUses": [
        {
            "icon": "🛟",
            "title": "חילוץ וחיפוש",
            "text": "רחפנים נכנסים לאזורי סיכון כדי לחפש סימני חיים בלי לסכן אדם."
        },
        {
            "icon": "🧱",
            "title": "מבנים שקרסו",
            "text": "מכשול שלא היה במפה מחייב תכנון מחדש מהיר ומדוד."
        },
        {
            "icon": "🌬️",
            "title": "אילוצי מזג אוויר",
            "text": "רוח, אבק וסוללה משנים מסלול גם אם הקוד המקורי עבד."
        },
        {
            "icon": "📡",
            "title": "Flyability/Elios",
            "text": "רחפנים תעשייתיים מוגנים מדגימים למה תכנון Fallback חשוב בשטח מסוכן."
        }
    ],
    "vocabulary": [
        [
            "Dynamic Constraint",
            "אילוץ שמשתנה בזמן הפעילות: מכשול חדש, מטרה שזזה, רוח או סוללה נמוכה."
        ],
        [
            "Fallback Route",
            "מסלול גיבוי קצר ובטוח כאשר הנתיב המקורי חסום."
        ],
        [
            "Set Speed",
            "בלוק מהירות; 60% היא נקודת פתיחה יציבה יותר מ־100%."
        ],
        [
            "Telemetry",
            "נתוני מצב מהרחפן לטאבלט: סוללה, חיבור וגובה."
        ],
        [
            "Route Optimization",
            "שיפור נתיב כדי להגיע למטרה בזמן ובצריכת סוללה נמוכה."
        ],
        [
            "Comment Block",
            "הערה בקוד שמסבירה מקטע משימה ומקלה על שינוי מהיר."
        ],
        [
            "Abort",
            "עצירת חירום/ביטול משימה כאשר יש סכנה."
        ]
    ],
    "safetyRules": [
        "משקפי מגן, שיער אסוף ומגיני פרופלורים הם תנאי להרצה.",
        "המדריך בלבד מכריז על האילוץ ומזיז מכשולים/כרטיסיות.",
        "לא נכנסים למלבן הטיסה בזמן רחפן באוויר.",
        "אם הרחפן מתקרב למנהרת הרוח או לאדם — Abort/Land מיד.",
        "מתחת ל־30% סוללה לא מבצעים ניסיון נוסף.",
        "שומרים בענן דרך WiFi בית ספרי לפני מעבר ל־Tello WiFi."
    ],
    "commonDirections": [
        [
            "Set Speed 60%",
            "מהירות מאוזנת לחילוץ יציב וחסכוני."
        ],
        [
            "Hover 3 sec",
            "ריחוף לצילום ללא Motion Blur."
        ],
        [
            "Take Photo",
            "צילום/תיעוד כרטיסיית A או B."
        ],
        [
            "Fallback",
            "עקיפת אזור אסור ועדכון מיקום B."
        ],
        [
            "Abort",
            "תגובה בטוחה אם המסלול מסוכן."
        ],
        [
            "Share Link",
            "הגשת גרסת החילוץ המעודכנת."
        ]
    ],
    "setupSteps": [
        "מסמנים Safe Fly Zone ברוחב כ־2.5 מטרים, מנחת בית, קונוסים וכרטיסיות A/B.",
        "פותחים DroneBlocks על WiFi בית ספרי וטוענים קוד Grid Scan/צילום משיעורים 6–7.",
        "מוסיפים Set Speed 60% ו־Comment לכל מקטע משימה.",
        "בודקים בסיס בסימולטור City/Minimal Grid.",
        "המדריך מכריז אילוץ: מנהרת רוח בין קונוסים ו־B זזה 40 ס״מ.",
        "הצוות מעדכן גרסת Fallback, שומר בענן, עובר ל־Tello WiFi ומריץ רק באישור."
    ],
    "appWorkflow": [
        {
            "title": "טעינת קוד קודם",
            "detail": "פותחים Grid Scan או Camera SOS משיעורים 6–7 כדי לא להתחיל מאפס."
        },
        {
            "title": "Rescue Mission בסיסית",
            "detail": "מוסיפים Set Speed 60%, Comment לכל מקטע, Hover לפני צילום ותיעוד של A/B."
        },
        {
            "title": "בדיקת סימולטור",
            "detail": "מריצים ב־City/Minimal Grid ובודקים שהמסלול לא עובר דרך קונוסים/מכשולים."
        },
        {
            "title": "כרטיס אילוץ דינמי",
            "detail": "המדריך מכריז על מנהרת רוח אסורה ועל העברת B ב־40 ס״מ. צוותים מקבלים 10 דקות לעדכון."
        },
        {
            "title": "Fallback Execution",
            "detail": "משנים רק קטע נתיב/מרחק אחד, שומרים Rescue_Fallback_Team_X, ומציגים למדריך לפני טיסה."
        },
        {
            "title": "הרצה ותחקיר",
            "detail": "הרצה פיזית רק באישור. בסיום חוזרים ל־WiFi בית ספרי, מפיקים Share Link ומתעדים החלטה."
        }
    ],
    "tabletTips": [
        "לשמור Rescue_Base לפני Rescue_Fallback.",
        "להשתמש ב־Comment כדי למצוא מהר את קטע “תחנה B”.",
        "לא לעבוד במהירות 100% במסלול עם מכשולים.",
        "Share Link רק דרך WiFi בית ספרי; Tello WiFi לא מחובר לאינטרנט.",
        "אם אין זמן או סוללה — מבצעים את האילוץ בסימולטור בלבד."
    ],
    "lessonFlow": [
        {
            "minutes": "0–8",
            "title": "בדיקת תנאי קדם",
            "teacher": "מחבר לשיעור 7: צילום, Hover ומניעת Motion Blur.",
            "students": "מסבירים למה צילום טוב דורש יציבות."
        },
        {
            "minutes": "8–18",
            "title": "עלילה: חילוץ בעין הסערה",
            "teacher": "מציג תרחיש מבנה/הר געש שקרס וחשיבות Fallback.",
            "students": "מזהים מה יכול להשתנות בשטח."
        },
        {
            "minutes": "18–25",
            "title": "טלמטריה, סוללה ומהירות",
            "teacher": "מדגים Set Speed וקריאת סוללה; מסביר 10–13 דקות טיסה.",
            "students": "בוחרים מהירות התחלתית ומנמקים."
        },
        {
            "minutes": "25–40",
            "title": "בניית Rescue Base",
            "teacher": "מוביל בניית קוד עם Comment, Hover ו־Photo.",
            "students": "בונים ומריצים בסימולטור."
        },
        {
            "minutes": "40–50",
            "title": "האילוץ הדינמי",
            "teacher": "מכריז מנהרת רוח ויעד B שזז; מפעיל סטופר 10 דקות.",
            "students": "מסמנים מה צריך להשתנות."
        },
        {
            "minutes": "50–62",
            "title": "עדכון Fallback",
            "teacher": "בודק שינוי אחד ברור ושמירה בענן.",
            "students": "מעדכנים קוד ושומרים גרסה."
        },
        {
            "minutes": "62–78",
            "title": "הרצה פיזית מבוקרת",
            "teacher": "מאשר צוותים לפי בטיחות, סוללה ומרחב.",
            "students": "מריצים/צופים ומתעדים."
        },
        {
            "minutes": "78–90",
            "title": "Share Link ותחקיר",
            "teacher": "מוביל דיון על לחץ זמן, סחיפה וסוללה.",
            "students": "משתפים קישור וכותבים כרטיס יציאה."
        }
    ],
    "exercises": [
        {
            "minutes": "18–25",
            "title": "בחירת מהירות",
            "prompt": "בחרו Set Speed והסבירו למה לא 100%.",
            "check": "הנימוק כולל יציבות/סוללה."
        },
        {
            "minutes": "25–35",
            "title": "קוד בסיס עם הערות",
            "prompt": "בנו Rescue Base עם Comment לכל קטע.",
            "check": "קל למצוא את תחנה A/B בקוד."
        },
        {
            "minutes": "35–40",
            "title": "בדיקת צילום",
            "prompt": "ודאו שיש Hover לפני Photo/תיעוד.",
            "check": "אין צילום תוך כדי תנועה."
        },
        {
            "minutes": "40–50",
            "title": "ניתוח אילוץ",
            "prompt": "מה השתנה? איזה אזור אסור? כמה זזה B?",
            "check": "האילוץ מוגדר במספרים."
        },
        {
            "minutes": "50–62",
            "title": "Fallback",
            "prompt": "שנו קטע אחד כדי לעקוף את מנהרת הרוח ולהגיע ל־B החדש.",
            "check": "המסלול בטוח וקצר."
        },
        {
            "minutes": "62–78",
            "title": "הרצה/תצפית",
            "prompt": "הריצו רק באישור ותעדו סוללה/סטייה.",
            "check": "יש תיעוד ולא אלתור."
        },
        {
            "minutes": "78–90",
            "title": "כרטיס יציאה",
            "prompt": "Fallback טוב הוא...",
            "check": "התשובה מאזנת בין משימה לבטיחות."
        }
    ],
    "deliverable": "Rescue_Fallback_Team_X: גרסת קוד מעודכנת עם Comment, Set Speed 60%, עקיפת מנהרת רוח, Share Link ותחקיר אילוץ קצר.",
    "assessment": [
        "האילוץ מנוסח כבעיה הנדסית ולא כבהלה.",
        "הקוד כולל Hover לפני צילום/תיעוד.",
        "הצוות משנה קטע אחד ברור ושומר גרסאות.",
        "ההרצה הפיזית מתקיימת רק לאחר סימולטור ואישור.",
        "התלמיד מסביר קשר בין מהירות, סוללה ויציבות."
    ],
    "debugging": [
        {
            "problem": "הקבוצה מנסה “לנצח את הסופה” במהירות 100%",
            "fix": "מורידים ל־60% ומסבירים שקנס/התנגשות גרועים מזמן איטי."
        },
        {
            "problem": "B זזה אבל הקוד לא השתנה",
            "fix": "מסמנים בקוד בעזרת Comment את קטע תחנה B ומשנים רק אותו."
        },
        {
            "problem": "Connection/Share נכשל",
            "fix": "חוזרים ל־WiFi בית ספרי לשמירה; Tello WiFi משמש רק לטיסה."
        },
        {
            "problem": "רחפן סוחף פיזית",
            "fix": "בודקים VPS, תאורה, מזגן וסוללה; אם צריך ממשיכים בסימולטור."
        }
    ],
    "differentiation": {
        "support": [
            "לתת כרטיס אילוץ אחד בלבד: B זזה ימינה 40 ס״מ.",
            "להריץ סימולטור בלבד במקום פיזי.",
            "לתת שלד קוד עם Comment מוכן."
        ],
        "extension": [
            "להוסיף מד תקינות סוללה וירטואלי ולהחליט אם מקצרים מסלול.",
            "להשוות שתי דרכי עקיפה סביב מנהרת הרוח.",
            "לנסח כלל Fallback לפרויקט גמר עתידי."
        ]
    },
    "visualDiagram": {
        "panelTitle": "⛈️ Dynamic Rescue",
        "chip": "Physical Lab",
        "title": "מנהרת רוח ויעד B שזז",
        "src": "assets/tello-mission-lab/lesson8/storm-rescue-dynamic-constraint.svg",
        "alt": "תרשים מבצע חילוץ עם מנהרת רוח, תחנות A ו-B ומסלול Fallback",
        "caption": "האילוץ אינו תוספת דרמה בלבד — הוא מחייב החלטת קוד מדידה, שמירה ובטיחות."
    },
    "instructorGuide": {
        "prerequisites": "התלמידים מכירים Grid Scan, Hover לצילום ופריקת מידע משיעורים 6–7. שיעור 8 מעלה את רמת המורכבות: אותו מידע, אבל תחת אילוץ משתנה ולחץ זמן.",
        "pedagogy": [
            "השיעור מצוין לכיתה ו׳ כי הוא דורש תכנון מחדש ולא רק ביצוע רצף.",
            "חשוב להגביל את ההפתעה: המדריך יודע מראש מה משתנה, והתלמידים מקבלים מספר ברור — למשל B זזה 40 ס״מ.",
            "לחץ זמן צריך להיות “בריא”: 10 דקות לתכנון, לא הרצה מסוכנת.",
            "אם התנאים בכיתה לא מאפשרים טיסה, הערך הפדגוגי עדיין נשמר בסימולטור וב־Decision Log."
        ],
        "facilitationNotes": [
            "להכין מראש כרטיסיות A/B וקונוסים.",
            "להזיז מכשולים רק כשהרחפן לא באוויר, או להכריז אילוץ לפני ההרצה הפיזית.",
            "לאפשר לכל צוות לכל היותר ניסיון פיזי אחד כדי לשמור סוללות.",
            "להדגיש ש־Abort הוא החלטת צוות מקצועית."
        ],
        "mediaNote": "צילומי המסך במצגת הם צילומי DroneBlocks ציבוריים/קיימים לטיוטת בדיקה. לפני פרסום חיצוני מומלץ להחליף בצילומי טאבלט מקוריים של מרכז החדשנות.",
        "exitTicket": "Fallback טוב הוא ___ ולא ___."
    },
    "videoResources": [
        {
            "title": "Flyability Elios 3 — confined space inspections",
            "url": "https://www.flyability.com/elios-3"
        },
        {
            "title": "NASA JPL — Mars Helicopter Ingenuity",
            "url": "https://www.youtube.com/watch?v=GHSZUXoYFCY"
        }
    ],
    "screenshotSlides": [
        {
            "title": "פותחים קוד Grid/Camera קודם",
            "src": "assets/tello-mission-lab/lesson8/open-app.png",
            "caption": "החילוץ נשען על ידע קודם, לא מתחיל מאפס."
        },
        {
            "title": "Rescue Base עם Comment",
            "src": "assets/tello-mission-lab/lesson8/block-sequence.png",
            "caption": "הערות בקוד מאפשרות שינוי מהיר תחת לחץ."
        },
        {
            "title": "בדיקת סימולטור",
            "src": "assets/tello-mission-lab/lesson8/simulator-run.png",
            "caption": "מסלול בסיס לפני מנהרת הרוח."
        },
        {
            "title": "תרשים אילוץ דינמי",
            "src": "assets/tello-mission-lab/lesson8/storm-rescue-dynamic-constraint.svg",
            "caption": "B זזה, מנהרת הרוח אסורה, והקוד חייב להתעדכן."
        },
        {
            "title": "שומרים Rescue_Fallback",
            "src": "assets/tello-mission-lab/lesson8/save-share.png",
            "caption": "Share Link ותחקיר הם חלק מהתוצר."
        }
    ],
    "instructorSlides": [
        {
            "title": "מבצע חילוץ בעין הסערה",
            "body": "השטח השתנה. צוות חקר מקצועי מחשב מסלול מחדש בלי לוותר על בטיחות.",
            "bullets": [
                "מטרה A/B",
                "מנהרת רוח",
                "Fallback"
            ]
        },
        {
            "title": "טלמטריה ומהירות",
            "body": "Set Speed גבוה מדי עלול לבזבז סוללה ולאבד יציבות.",
            "bullets": [
                "60%",
                "10–13 דקות",
                "סוללה"
            ]
        },
        {
            "title": "Comment הוא כלי חירום",
            "body": "כשיש הערות בקוד, קל למצוא איזה מקטע לשנות.",
            "bullets": [
                "תחנה A",
                "תחנה B",
                "חזרה לנחיתה"
            ]
        },
        {
            "title": "10 דקות לתכנון מחדש",
            "body": "הסטופר מודד תכנון, לא לחץ מסוכן באוויר.",
            "bullets": [
                "נתח אילוץ",
                "שנה קטע אחד",
                "שמור גרסה"
            ]
        },
        {
            "title": "Abort הוא מקצועי",
            "body": "אם המסלול מסוכן — עוצרים. זו הצלחה בטיחותית.",
            "bullets": [
                "Observer",
                "Abort/Land",
                "תחקיר"
            ]
        }
    ]
});


  Object.assign(window.TELLO_MISSION_LAB_LESSONS[8], {
    "title": "שיעור 9: Mars Exploration — סימולטור מאדים ומשימות חקר מתקדמות",
    "subtitle": "Ingenuity, כבידה נמוכה, אטמוספירה דלילה, Latency, Variables ו־Loops בסביבת Mars",
    "unit": "יחידה 4 — Mission Pads ותחנות חקר",
    "concept": "Mars Simulator, Ingenuity, Low Gravity, Thin Atmosphere, Latency, flight_height, Variables, Loops, Solar Panel Scan, Seismograph Mission",
    "workspaceMode": "droneblocks-app",
    "appWorkflowTitle": "DroneBlocks App — Mars Simulator בלבד, ללא הטסה פיזית",
    "appWorkflowNote": "השיעור מתבצע בסימולטור מאדים ודורש WiFi בית ספרי יציב. האתר מציג תדריך מדעי, תרשים משימה ושלבי עבודה; את הקוד בונים ושומרים באפליקציית DroneBlocks בענן.",
    "physicalFlightAllowed": true,
    "story": "מרכז בקרת הטיסה בנגב שולח את Tello Mars Explorer למכתש Jezero. סערת חול כיסתה פאנלים סולאריים וחיישני רעידות אדמה התנתקו. בגלל Latency של דקות ארוכות אי אפשר לשלוט ברחפן עם שלט — רק קוד אוטונומי, משתנים ולולאות יכולים להציל את המושבה.",
    "mission": "לבנות Mars_Mission_Team_X בסימולטור מאדים: להגדיר flight_height, להמריא, לעלות ל־120in מעל גבעת סלעים, לטוס 200in לפאנל סולארי, לרדת ל־40in, לבצע Yaw 360° לניקוי אבק, לחזור לבסיס; ואז באילוץ סערת חול להגדיל מרחק בין 3 סייסמוגרפים ב־50in ולהוסיף Hover 4 sec בכל נקודה.",
    "blocks": [
        "comment",
        "variable",
        "takeoff",
        "up",
        "forward",
        "down",
        "yaw_360",
        "repeat_scan",
        "hover_data",
        "abort",
        "land",
        "share"
    ],
    "essentialQuestion": "למה חקר מאדים דורש קוד אוטונומי מתוכנן מראש ולא “הטסה עם שלט”?",
    "successCriteria": [
        "אני מסביר/ה את הקשר בין אטמוספירה דלילה, כבידה נמוכה ואתגר הרחיפה במאדים.",
        "אני מסביר/ה למה Latency מחייב אוטונומיה וקוד מראש.",
        "אני משתמש/ת במשתנה flight_height או distance כדי לשנות מסלול במהירות.",
        "אני משלב/ת Loop כדי לסרוק כמה נקודות בלי לשכפל בלוקים מיותרים.",
        "אני מוסיף/ה Hover בנקודות סייסמוגרף ושומר/ת Share Link למשימה."
    ],
    "realWorldUses": [
        {
            "icon": "🚁",
            "title": "NASA Ingenuity",
            "text": "מסוק מאדים הוכיח שאפשר לבצע טיסה אוטונומית באטמוספירה דלילה."
        },
        {
            "icon": "🔆",
            "title": "פאנלים סולאריים",
            "text": "רחפן יכול לבדוק/לדמות ניקוי אבק ממקור האנרגיה של מושבה."
        },
        {
            "icon": "📡",
            "title": "Latency בחלל",
            "text": "אי אפשר לשלוט בזמן אמת כשאות מגיע אחרי דקות; הקוד חייב להיות עצמאי."
        },
        {
            "icon": "🌋",
            "title": "סייסמוגרפים",
            "text": "חיישני רעידות אדמה דורשים סריקה שיטתית ועמידה מעל נקודות מדידה."
        }
    ],
    "vocabulary": [
        [
            "Low Gravity",
            "כבידה נמוכה: במאדים כ־38% מכדור הארץ."
        ],
        [
            "Thin Atmosphere",
            "אטמוספירה דלילה: מעט מאוד אוויר ליצירת עילוי."
        ],
        [
            "Lift",
            "כוח עילוי שנוצר מסיבוב להבים ודחיפת אוויר."
        ],
        [
            "Latency",
            "השהיית תקשורת בין כדור הארץ למאדים — 4 עד 24 דקות."
        ],
        [
            "flight_height",
            "משתנה גובה שמאפשר שינוי גובה טיסה בלי לערוך כל בלוק."
        ],
        [
            "Solar Panel Scan",
            "סריקה/ניקוי מדומה של פאנל באמצעות Yaw 360°."
        ],
        [
            "Seismograph",
            "חיישן רעידות אדמה שצריך לעצור מעליו ולמדוד."
        ]
    ],
    "safetyRules": [
        "אין הטסה פיזית בשיעור 9; עובדים בסימולטור מאדים בלבד.",
        "WiFi בית ספרי יציב הוא תנאי לשמירה בענן ולסימולטור.",
        "אם הסימולטור נתקע — Stop/Abort ואז Reset, לא ממשיכים ללחוץ Launch שוב ושוב.",
        "משתנה מרחק/גובה לא יכול להיות 0.",
        "אם Mars Simulator כבד מדי — עוברים ל־Minimal Grid ושומרים את אותו אתגר מדעי.",
        "ספירת ציוד פיזי בסוף בלבד; לא מוציאים סוללות להפעלה."
    ],
    "commonDirections": [
        [
            "flight_height 120in",
            "גובה לעקיפת גבעת סלעים."
        ],
        [
            "Down to 40in",
            "ירידה לגובה ניקוי מעל פאנל."
        ],
        [
            "Yaw 360°",
            "סיבוב מלא המדמה ניקוי אבק מהפאנל."
        ],
        [
            "Loop",
            "סריקת 3 סייסמוגרפים בלי שכפול קוד."
        ],
        [
            "Hover 4 sec",
            "המתנה בסערת חול לשיפור ראות."
        ],
        [
            "Abort/Reset",
            "עצירת סימולציה מסוכנת או תקועה."
        ]
    ],
    "setupSteps": [
        "פותחים טאבלטים על WiFi בית ספרי ונכנסים לחשבון DroneBlocks.",
        "פותחים Mars Simulator ומכירים בסיס, מכתשים, פאנלים וסייסמוגרפים.",
        "יוצרים flight_height ומרחק בסיסי למשימה.",
        "בונים אתגר פאנל סולארי: Up 120in → Forward 200in → Down 40in → Yaw 360° → חזרה.",
        "מוסיפים אתגר סייסמוגרפים עם Loop ו־Hover.",
        "המדריך מכריז סערת חול: distance +50in ו־Hover 4 sec בכל תחנה; שומרים Mars_Mission_Team_X."
    ],
    "appWorkflow": [
        {
            "title": "כניסה ל־Mars Simulator",
            "detail": "מחוברים ל־WiFi בית ספרי, פותחים DroneBlocks ובוחרים עולם Mars. אם הטאבלט מתקשה — Minimal Grid כגיבוי."
        },
        {
            "title": "תדריך מדעי",
            "detail": "מסבירים Ingenuity, כבידה 38%, אטמוספירה 1% ו־Latency. לכן הטיסה חייבת להיות אוטונומית."
        },
        {
            "title": "Solar Panel Scan",
            "detail": "בונים מסלול: Takeoff, Up 120in, Forward 200in, Down 40in, Yaw 360°, Return/Land."
        },
        {
            "title": "Variables + Loops",
            "detail": "יוצרים flight_height/scan_distance ומשתמשים בלולאה לסריקת 3 סייסמוגרפים."
        },
        {
            "title": "סערת חול דינמית",
            "detail": "המדריך מכריז: המרחק בין החיישנים גדל ב־50in ויש להוסיף Hover 4 sec בכל נקודה."
        },
        {
            "title": "שיתוף ותחקור",
            "detail": "שומרים Mars_Mission_Team_X, מפיקים Share Link ומציגים קוד יעיל עם מינימום שכפולים."
        }
    ],
    "tabletTips": [
        "לסגור אפליקציות רקע לפני Mars Simulator.",
        "אם הרחפן הווירטואלי נעלם — Stop/Abort ואז Reset Drone/Camera.",
        "לבדוק שמשתנה flight_height אינו 0.",
        "לשמור גרסה לפני סערת החול: Mars_Base ואז Mars_Storm_Update.",
        "אם Share Link נכשל — לבדוק WiFi בית ספרי וחשבון משתמש, לא Guest."
    ],
    "lessonFlow": [
        {
            "minutes": "0–10",
            "title": "אפקט וואו: Ingenuity",
            "teacher": "מציג סרטון NASA/JPL ושואל למה אי אפשר להשתמש בשלט ממאדים.",
            "students": "מנחשים מה קורה בגלל מרחק ותקשורת."
        },
        {
            "minutes": "10–20",
            "title": "מדע הטיסה במאדים",
            "teacher": "מסביר כבידה נמוכה, אטמוספירה דלילה ו־Latency באנלוגיית מים/דבש.",
            "students": "מסבירים למה צריך קוד אוטונומי."
        },
        {
            "minutes": "20–30",
            "title": "כניסה ל־Mars Simulator",
            "teacher": "מראה את סביבת מאדים ומטרות: פאנלים וסייסמוגרפים.",
            "students": "פותחים טאבלט, WiFi בית ספרי וחשבון."
        },
        {
            "minutes": "30–40",
            "title": "flight_height ו־Loop",
            "teacher": "מדגים משתנה גובה ולולאה כחיסכון באנרגיה/בלוקים.",
            "students": "יוצרים משתנה ומסמנים איפה הוא ישתנה."
        },
        {
            "minutes": "40–55",
            "title": "אתגר 1: ניקוי פאנל",
            "teacher": "מלווה בניית מסלול גובה 120in → 40in → Yaw 360°.",
            "students": "בונים ומריצים בסימולטור."
        },
        {
            "minutes": "55–75",
            "title": "אתגר 2: סערת חול וסייסמוגרפים",
            "teacher": "מכריז distance +50in ו־Hover 4 sec; נותן כרטיס סוללה וירטואלי.",
            "students": "מעדכנים משתנה/לולאה ומריצים."
        },
        {
            "minutes": "75–84",
            "title": "תחקור קוד יעיל",
            "teacher": "מקרין קוד צוותי שממחיש לולאות ומשתנים.",
            "students": "משווים לשכפול בלוקים."
        },
        {
            "minutes": "84–90",
            "title": "שמירה וסגירת ציוד",
            "teacher": "מוביל Share Link, החזרת טאבלטים וספירת ציוד.",
            "students": "שומרים Mars_Mission_Team_X וכרטיס יציאה."
        }
    ],
    "exercises": [
        {
            "minutes": "10–20",
            "title": "מדע במשפט",
            "prompt": "כתבו למה Latency מחייב קוד אוטונומי.",
            "check": "התשובה מזכירה עיכוב תקשורת."
        },
        {
            "minutes": "30–40",
            "title": "משתנה גובה",
            "prompt": "צרו flight_height וקבעו ערך התחלתי.",
            "check": "המשתנה אינו 0 ויש לו תפקיד."
        },
        {
            "minutes": "40–55",
            "title": "Solar Panel Scan",
            "prompt": "בנו מסלול ניקוי פאנל עם Up, Down ו־Yaw 360°.",
            "check": "המסלול חוזר לנחיתה."
        },
        {
            "minutes": "55–65",
            "title": "לולאת סייסמוגרפים",
            "prompt": "בנו דפוס עצירה מעל 3 חיישנים בעזרת Loop.",
            "check": "אין שכפול מיותר של כל הקוד."
        },
        {
            "minutes": "65–75",
            "title": "סערת חול",
            "prompt": "הגדילו מרחק ב־50in והוסיפו Hover 4 sec בכל נקודה.",
            "check": "השינוי נעשה דרך משתנה/תבנית."
        },
        {
            "minutes": "75–84",
            "title": "תחקור יעילות",
            "prompt": "מה חסך יותר בלוקים — Loop או העתקה?",
            "check": "יש נימוק לפי קוד/סוללה."
        },
        {
            "minutes": "84–90",
            "title": "כרטיס יציאה",
            "prompt": "במאדים חייבים קוד אוטונומי כי...",
            "check": "מזכיר Latency או תנאי מאדים."
        }
    ],
    "deliverable": "Mars_Mission_Team_X: משימת סימולטור מאדים עם Solar Panel Scan, סייסמוגרפים, עדכון סערת חול, שימוש ב־Variable/Loop ו־Share Link.",
    "assessment": [
        "התלמיד מקשר בין תנאי מאדים לצורך בקוד אוטונומי.",
        "הקוד כולל גובה, תנועה, Yaw 360°, Hover ונחיתה.",
        "משתנה/לולאה משמשים לפתרון אמיתי ולא כקישוט.",
        "התלמיד מתמודד עם אילוץ סערת חול דרך שינוי מדיד.",
        "Share Link נשמר ומאפשר תחקור קוד."
    ],
    "debugging": [
        {
            "problem": "Mars Simulator איטי/קופא",
            "fix": "סוגרים אפליקציות רקע, Reset, ואם צריך עוברים ל־Minimal Grid עם אותו אתגר."
        },
        {
            "problem": "הרחפן הווירטואלי לא זז",
            "fix": "בודקים Takeoff ראשון ומשתנים שאינם 0."
        },
        {
            "problem": "לולאה אינסופית/לא ברורה",
            "fix": "מגדירים מספר חזרות קטן וברור — 3 סייסמוגרפים."
        },
        {
            "problem": "התלמיד שוכח Hover בסערת חול",
            "fix": "מסמנים בכל תחנת סייסמוגרף: עצירה = מדידה."
        },
        {
            "problem": "Share Link נכשל",
            "fix": "בודקים WiFi בית ספרי וכניסה לחשבון DroneBlocks."
        }
    ],
    "differentiation": {
        "support": [
            "להפעיל Minimal Grid במקום Mars Simulator.",
            "לתת שלד Solar Panel Scan מוכן ולהתמקד רק בשינוי סערת חול.",
            "להפחית ל־2 סייסמוגרפים."
        ],
        "extension": [
            "להוסיף מד סוללה וירטואלי שמעניש שכפול בלוקים.",
            "לבנות שתי גרסאות: בלי Loop ועם Loop ולהשוות.",
            "להוסיף “קוד סייסמי” סודי בכל תחנה ולתעד תוצאה."
        ]
    },
    "visualDiagram": {
        "panelTitle": "🔴 Mars Exploration",
        "chip": "Simulator",
        "title": "פאנלים, סייסמוגרפים וסערת חול",
        "src": "assets/tello-mission-lab/lesson9/mars-exploration-diagram.svg",
        "alt": "תרשים משימת מאדים עם בסיס, גבעת סלעים, פאנל סולארי, סייסמוגרפים וסערת חול",
        "caption": "מאדים הוא תירוץ מצוין ללמד אוטונומיה: בגלל Latency, הקוד חייב לחשוב קדימה."
    },
    "instructorGuide": {
        "prerequisites": "התלמידים מגיעים אחרי צילום ופתרון אילוצים בשטח. שיעור 9 מחזיר אותם לסימולטור מתקדם כדי לעבוד על חקר מורכב בלי מגבלות בטיחות של רחפן פיזי.",
        "pedagogy": [
            "הבחירה בסימולטור בלבד נכונה: הסיפור המדעי עשיר, והמורכבות האלגוריתמית גבוהה מספיק בלי מדחפים.",
            "צריך להיזהר מעומס מושגים מדעי. לבחור 3 מושגי חובה בלבד: אטמוספירה דלילה, כבידה נמוכה, Latency.",
            "האתגר לא צריך להיות “מאדים יפה”, אלא קוד יעיל: משתנה + לולאה + התאמה לסערת חול.",
            "כדאי לשמור את שיעור 9 כהפוגה בטיחותית אחרי שיעור 8 הפיזי."
        ],
        "facilitationNotes": [
            "להכין מראש קישור/סרטון Ingenuity.",
            "לוודא WiFi יציב בתחילת שיעור — זה תנאי הצלחה.",
            "להחזיק Minimal Grid כגיבוי רשמי ולא כפתרון מביך.",
            "להקרין בסוף קוד אחד יעיל ולהראות איך Loop חסך בלוקים."
        ],
        "mediaNote": "צילומי המסך במצגת הם צילומי DroneBlocks ציבוריים/קיימים לטיוטת בדיקה. לפני פרסום חיצוני מומלץ להחליף בצילומי טאבלט מקוריים של מרכז החדשנות.",
        "exitTicket": "במאדים חייבים קוד אוטונומי כי ___."
    },
    "videoResources": [
        {
            "title": "Flyability Elios 3 — confined space inspections",
            "url": "https://www.flyability.com/elios-3"
        },
        {
            "title": "NASA JPL — Mars Helicopter Ingenuity",
            "url": "https://www.youtube.com/watch?v=GHSZUXoYFCY"
        }
    ],
    "screenshotSlides": [
        {
            "title": "פותחים Mars Simulator",
            "src": "assets/tello-mission-lab/lesson9/open-app.png",
            "caption": "השיעור כולו סימולטורי ודורש WiFi בית ספרי."
        },
        {
            "title": "קוד Solar Panel Scan",
            "src": "assets/tello-mission-lab/lesson9/block-sequence.png",
            "caption": "גובה, Forward, Down, Yaw 360° וחזרה לבסיס."
        },
        {
            "title": "בדיקה בסימולטור מאדים",
            "src": "assets/tello-mission-lab/lesson9/simulator-run.png",
            "caption": "Reset ודיבוג במקום סיכון פיזי."
        },
        {
            "title": "תרשים Mars Mission",
            "src": "assets/tello-mission-lab/lesson9/mars-exploration-diagram.svg",
            "caption": "פאנל, סייסמוגרפים וסערת חול שמשנה מרחקים."
        },
        {
            "title": "Share Link למשימת Mars",
            "src": "assets/tello-mission-lab/lesson9/save-share.png",
            "caption": "שומרים Mars_Mission_Team_X לתחקור קוד יעיל."
        }
    ],
    "instructorSlides": [
        {
            "title": "שקשוקה קוסמית במכתש Jezero",
            "body": "מושבת מאדים צריכה רחפן אוטונומי: פאנלים מאובקים וסייסמוגרפים מנותקים.",
            "bullets": [
                "Mars",
                "Ingenuity",
                "Mission Control"
            ]
        },
        {
            "title": "למה אי אפשר שלט?",
            "body": "Latency של 4–24 דקות הופך שליטה ידנית לבלתי אפשרית.",
            "bullets": [
                "מרחק",
                "תקשורת",
                "קוד מראש"
            ]
        },
        {
            "title": "פיזיקה במאדים",
            "body": "כבידה נמוכה עוזרת, אבל האטמוספירה הדלילה מקשה על יצירת Lift.",
            "bullets": [
                "38% כבידה",
                "1% אוויר",
                "להבים מהירים"
            ]
        },
        {
            "title": "Solar Panel Scan",
            "body": "עולים מעל סלעים, יורדים מעל הפאנל ומבצעים Yaw 360° לניקוי אבק.",
            "bullets": [
                "120in",
                "40in",
                "Yaw 360°"
            ]
        },
        {
            "title": "Loops + Variables",
            "body": "חוסכים בלוקים וסוללה וירטואלית באמצעות תבנית חוזרת ומשתנה.",
            "bullets": [
                "flight_height",
                "distance +50in",
                "Hover 4 sec"
            ]
        },
        {
            "title": "שיתוף ותחקור",
            "body": "הקוד היעיל ביותר הוא זה שהכי קל להסביר ולתקן.",
            "bullets": [
                "Share Link",
                "מינימום שכפול",
                "Debug"
            ]
        }
    ]
});


  Object.assign(window.TELLO_MISSION_LAB_LESSONS[9], {
    "title": "שיעור 10: City Mapping Blueprint — אפיון פרויקט החקר ותכנון ראשוני",
    "subtitle": "פוטוגרמטריה, מיפוי תלת־ממדי, scan_height, Loop ×4 ו־City Simulator לפני כל הטסה",
    "unit": "יחידה 5 — פרויקט חקר מסכם",
    "concept": "Tello Mission Lab Blueprint, Photogrammetry, 3D Mapping, City Simulator, scan_height, Loop ×4, Hover 2 sec, Paper Blueprint",
    "workspaceMode": "project-workflow",
    "appWorkflowTitle": "Project Workflow — דף אפיון ו־City Simulator, ללא הטסה פיזית",
    "appWorkflowNote": "שיעור 10 הוא שיעור אפיון לפרויקט החקר. האתר מציג דרישות, תרשים ושלבי עבודה; העבודה נעשית בדף Blueprint וב־DroneBlocks City Simulator/Minimal Grid. לא מוציאים רחפנים פיזיים במפגש זה.",
    "physicalFlightAllowed": true,
    "story": "צוותי כיתה ו׳ הופכים למהנדסי מיפוי של עיר העתיד בהשראת Pix4D ו־Wingtra. רעידת אדמה קלה פגעה בעיר, וחייבים לתכנן רחפן שיסרוק בניין יעד מכל הזוויות, יצלם תמונות חופפות ויחזור לבסיס. לפני קוד — משרטטים Blueprint ברור על נייר.",
    "mission": "להכין Tello Mission Lab Blueprint: שאלת חקר מיפוי, גובה מכשולים, משתנה scan_height, מסלול סביב בניין יעד, Loop ×4 לסריקה מרובעת, Hover 2 sec בפינות לצילום יציב, סיכונים, קריטריוני הצלחה ואב־טיפוס בסימולטור בשם City_Mapping_Team_X.",
    "blocks": [
        "comment",
        "variable",
        "takeoff",
        "up",
        "forward",
        "repeat_scan",
        "hover_data",
        "photo",
        "yaw_right",
        "land",
        "share"
    ],
    "essentialQuestion": "איך מתרגמים בעיית מיפוי תלת־ממדי למסלול רחפן שאפשר לבדוק ולשפר?",
    "successCriteria": [
        "אני מסביר/ה מהי פוטוגרמטריה בעזרת אנלוגיית פאזל תלת־ממדי.",
        "אני משלים/ה Blueprint ידני לפני פתיחת הטאבלט.",
        "אני מגדיר/ה scan_height ומתאים/ה אותו לגובה הבניין בסימולטור.",
        "אני מתכנן/ת Loop ×4 לסריקה היקפית של גג.",
        "אני מוסיף/ה Hover 2 sec בנקודות צילום כדי למנוע Motion Blur.",
        "אני שומר/ת Share Link בשם City_Mapping_Team_X."
    ],
    "realWorldUses": [
        {
            "icon": "🗺️",
            "title": "מיפוי עירוני תלת־ממדי",
            "text": "רחפנים אוספים תמונות חופפות לבניית מודל עיר או אתר בנייה."
        },
        {
            "icon": "🏗️",
            "title": "בדיקת מבנים",
            "text": "אחרי רעידת אדמה רחפן יכול לבדוק סדקים בלי לסכן בני אדם."
        },
        {
            "icon": "🌲",
            "title": "סקרי יערות ושטחים",
            "text": "מסלולי Grid שיטתיים מכסים אזור גדול בלי להשאיר חורים."
        },
        {
            "icon": "📸",
            "title": "פוטוגרמטריה",
            "text": "כמה תמונות מזוויות שונות מאפשרות למחשב להבין עומק וגובה."
        }
    ],
    "vocabulary": [
        [
            "Photogrammetry",
            "בניית מידע תלת־ממדי מתוך תמונות חופפות מזוויות שונות."
        ],
        [
            "3D Mapping",
            "מיפוי שמייצג לא רק מיקום אלא גם גובה ועומק."
        ],
        [
            "Blueprint",
            "דף אפיון: מטרה, מסלול, גבהים, קוד, סיכונים ותוצר."
        ],
        [
            "scan_height",
            "משתנה גובה הסריקה מעל בניין יעד."
        ],
        [
            "Loop ×4",
            "חזרה ארבע פעמים על דפוס סריקה סביב גג."
        ],
        [
            "Hover 2 sec",
            "עצירה קצרה לצילום יציב וללא טשטוש תנועה."
        ],
        [
            "Spaghetti Code",
            "קוד מבולגן שנכתב בלי תכנון וקשה לתקן."
        ]
    ],
    "safetyRules": [
        "אין הטסה פיזית בשיעור 10 — טאבלטים, נייר וסימולטור בלבד.",
        "אין פתיחת טאבלט בשלב השרטוט עד אישור Blueprint מהמדריך.",
        "כל מסלול חייב לכלול גובה בטוח מעל בניינים ונקודת Land ברורה.",
        "אם City Simulator קופא, עוברים ל־Minimal Grid עם אותם חוקי גובה/לולאה.",
        "שומרים Share Link רק דרך WiFi בית ספרי.",
        "גם בסימולטור מתרגלים Abort/Reset והרגלי עבודה בטוחים לקראת שיעור 11."
    ],
    "commonDirections": [
        [
            "scan_height",
            "גובה הסריקה מעל בניין היעד."
        ],
        [
            "Forward to building",
            "הגעה מאזור הבית לבניין יעד."
        ],
        [
            "Loop ×4",
            "סריקה סביב ארבע פינות הגג."
        ],
        [
            "Hover 2 sec",
            "עצירת צילום בכל פינה."
        ],
        [
            "Yaw 90°",
            "פנייה סביב הגג."
        ],
        [
            "Share Link",
            "הגשת תוצר למדריך."
        ]
    ],
    "setupSteps": [
        "מחלקים דפי Blueprint עם Grid, תיאור משימה ושלבי טיסה.",
        "מציגים Pix4D/Wingtra ופוטוגרמטריה דרך פאזל תלת־ממדי.",
        "10 דקות תכנון על נייר ללא טאבלטים.",
        "כל צוות מגדיר scan_height, מרחקים, Yaw ו־Loop ×4.",
        "פותחים DroneBlocks על WiFi בית ספרי ונכנסים ל־City Simulator.",
        "בונים אב־טיפוס, מוסיפים Hover 2 sec בפינות ושומרים City_Mapping_Team_X."
    ],
    "appWorkflow": [
        {
            "title": "השראה ופוטוגרמטריה",
            "detail": "מציגים מיפוי תלת־ממדי: תמונות חופפות במסלול Grid/נחש הופכות למודל."
        },
        {
            "title": "Paper Blueprint",
            "detail": "אין טאבלטים. הצוות משרטט בניין נמוך, בניין יעד, scan_height, מרחקים, Yaw, Loop ונקודת נחיתה."
        },
        {
            "title": "אישור מפקח בטיחות",
            "detail": "Safety Inspector בצוות והמדריך בודקים שהגובה והמסלול לא מתנגשים בבניינים וכוללים Hover לצילום."
        },
        {
            "title": "City Simulator",
            "detail": "פותחים DroneBlocks באינטרנט בית ספרי. אם City כבד מדי, עוברים ל־Minimal Grid ושומרים את אותו אפיון."
        },
        {
            "title": "Prototype",
            "detail": "בונים scan_height, Takeoff, Up, Forward, Loop ×4 עם Hover 2 sec, Yaw/תנועה סביב הגג ו־Land."
        },
        {
            "title": "Save & Share",
            "detail": "שומרים City_Mapping_Team_X, מפיקים Share Link ומגישים גם Blueprint מצולם/ניירי."
        }
    ],
    "tabletTips": [
        "לסגור אפליקציות רקע לפני City Simulator.",
        "להתחיל מ־scan_height בראש הקוד כדי לשנות גובה מהר.",
        "לא לשכפל ארבעה קטעים מלאים אם Loop ×4 יכול לפתור.",
        "אם Share Link נכשל — לבדוק WiFi בית ספרי וחשבון DroneBlocks.",
        "לשמור גרסת City_Mapping_Draft לפני שינויים גדולים."
    ],
    "lessonFlow": [
        {
            "minutes": "0–5",
            "title": "התכנסות צוותי מיפוי",
            "teacher": "מושיב בצוותים ומחבר למאדים/אילוצים משיעורים 8–9.",
            "students": "פותחים מחברת/דף Blueprint, לא טאבלט."
        },
        {
            "minutes": "5–12",
            "title": "השראה: Pix4D / Wingtra",
            "teacher": "מציג מיפוי תלת־ממדי וסקרי שטח אוטונומיים.",
            "students": "מזהים למה צריך מסלול שיטתי."
        },
        {
            "minutes": "12–20",
            "title": "פוטוגרמטריה",
            "teacher": "מסביר תמונות חופפות, עומק וגובה דרך פאזל תלת־ממדי.",
            "students": "מסבירים למה תמונה אחת לא מספיקה."
        },
        {
            "minutes": "20–25",
            "title": "תרחיש עיר העתיד",
            "teacher": "מציג רעידת אדמה ובניין יעד לסריקה.",
            "students": "מנסחים מטרת חקר קצרה."
        },
        {
            "minutes": "25–40",
            "title": "Blueprint על נייר",
            "teacher": "אוכף תכנון ללא טאבלטים וחתימת Safety Inspector.",
            "students": "משרטטים מסלול, גבהים, Yaw ו־Loop."
        },
        {
            "minutes": "40–45",
            "title": "נוהל טכנולוגי",
            "teacher": "מוודא WiFi בית ספרי וכניסה לחשבון.",
            "students": "פותחים DroneBlocks ו־City Simulator."
        },
        {
            "minutes": "45–70",
            "title": "פיתוח Prototype",
            "teacher": "עובר בין הצוותים ובודק scan_height, Loop ×4 ו־Hover.",
            "students": "בונים ומריצים בסימולטור."
        },
        {
            "minutes": "70–75",
            "title": "בונוס רוח חזקה",
            "teacher": "מציע Set Speed 30% לצוותים מתקדמים סביב הבניין.",
            "students": "מוסיפים רק אם הבסיס עובד."
        },
        {
            "minutes": "75–90",
            "title": "Share Link וסיכום",
            "teacher": "אוסף קישורים ושואל איך Blueprint מנע התנגשויות.",
            "students": "שומרים ומגישים כרטיס יציאה."
        }
    ],
    "exercises": [
        {
            "minutes": "12–20",
            "title": "פאזל תלת־ממדי",
            "prompt": "הסבירו למה צריך כמה תמונות חופפות למודל 3D.",
            "check": "התשובה מזכירה זוויות/עומק."
        },
        {
            "minutes": "25–35",
            "title": "Blueprint ידני",
            "prompt": "שרטטו מנחת, בניין נמוך, בניין יעד, גובה ומסלול.",
            "check": "השרטוט מקבל אישור מדריך."
        },
        {
            "minutes": "35–40",
            "title": "Loop Plan",
            "prompt": "סמנו איפה Loop ×4 חוסך בלוקים בסריקת הגג.",
            "check": "הלולאה קשורה לסריקה מרובעת."
        },
        {
            "minutes": "45–55",
            "title": "scan_height",
            "prompt": "צרו משתנה scan_height בראש הקוד.",
            "check": "המשתנה משפיע על פקודת Up/גובה."
        },
        {
            "minutes": "55–70",
            "title": "סריקת גג",
            "prompt": "בנו Loop עם Hover 2 sec בפינות.",
            "check": "יש עצירות צילום יציבות."
        },
        {
            "minutes": "70–75",
            "title": "בונוס רוח",
            "prompt": "הוסיפו Set Speed 30% רק בקטע הסריקה.",
            "check": "הבונוס לא שובר את המסלול."
        },
        {
            "minutes": "75–90",
            "title": "הגשה",
            "prompt": "שמרו City_Mapping_Team_X וצרו Share Link.",
            "check": "יש קישור ותוצר Blueprint."
        }
    ],
    "deliverable": "City_Mapping_Team_X: Blueprint ניירי/מצולם + אב־טיפוס City/Minimal Grid עם scan_height, Loop ×4, Hover 2 sec ו־Share Link.",
    "assessment": [
        "ה־Blueprint הושלם לפני הקוד.",
        "המסלול משרת מיפוי/פוטוגרמטריה ולא רק טיסה יפה.",
        "scan_height ו־Loop ×4 משולבים באופן משמעותי.",
        "יש Hover לצילום יציב ו־Land ברור.",
        "הצוות יודע להסביר סיכון/אילוץ ותוכנית תגובה."
    ],
    "debugging": [
        {
            "problem": "התלמידים רצים לקוד לפני תכנון",
            "fix": "עוצרים: אין אור ירוק עד שרטוט ידני וחתימת Safety Inspector."
        },
        {
            "problem": "City Simulator איטי",
            "fix": "סוגרים אפליקציות רקע ועוברים ל־Minimal Grid אם צריך."
        },
        {
            "problem": "הרחפן בסימולטור נתקע בבניין",
            "fix": "בודקים scan_height, Reset ומקטינים מרחק סריקה."
        },
        {
            "problem": "Loop לא חוסך באמת",
            "fix": "מגדירים דפוס חוזר אחד: צד גג + Hover + פנייה."
        },
        {
            "problem": "Share Link לא עובד",
            "fix": "חוזרים ל־WiFi בית ספרי ומוודאים חשבון מחובר."
        }
    ],
    "differentiation": {
        "support": [
            "לתת תבנית Blueprint עם בניין יעד מוכן.",
            "להסתפק בסריקה של שתי פינות באב־טיפוס, אבל לתכנן Loop ×4.",
            "לעבוד ב־Minimal Grid במקום City."
        ],
        "extension": [
            "להוסיף Overlap: צילום בכל חצי מטר לאורך קטע.",
            "להשוות Set Speed 60% מול 30% בסריקת גג.",
            "להגדיר מדד איכות מיפוי: כיסוי, חדות, מספר נקודות צילום."
        ]
    },
    "visualDiagram": {
        "panelTitle": "🗺️ City Mapping Blueprint",
        "chip": "Project Workflow",
        "title": "בניין יעד, scan_height ו־Loop ×4",
        "src": "assets/tello-mission-lab/lesson10/city-mapping-blueprint-diagram.svg",
        "alt": "תרשים מיפוי עיר עם מנחת בית, בניין נמוך, בניין יעד, Loop ו־scan_height",
        "caption": "זה שיעור תכנון: דף Blueprint ברור מונע Spaghetti Code ומכין את הכיול הפיזי במפגש 11."
    },
    "instructorGuide": {
        "prerequisites": "התלמידים מגיעים אחרי צילום, אילוצים ומאדים. עכשיו הם צריכים להפוך יכולות חקר לפרויקט מיפוי מוגדר.",
        "pedagogy": [
            "שיעור 10 חייב להישאר ללא הטסה פיזית; אחרת הוא יאבד את מטרת האפיון.",
            "הבחירה בפוטוגרמטריה מתאימה לכיתה ו׳ כי היא מחברת צילום, גובה, Grid ונתונים.",
            "צריך לאכוף Paper Blueprint לפני טאבלט כדי למנוע Spaghetti Code.",
            "City Simulator יפה אך כבד; Minimal Grid הוא fallback לגיטימי ולא פשרה פדגוגית."
        ],
        "facilitationNotes": [
            "להכין דפי Grid מודפסים וסרגלים.",
            "להשאיר את דרישות החובה על הלוח כל השיעור.",
            "לתת תפקיד ברור ל־Safety Inspector גם בסימולטור.",
            "לאשר בונוס Set Speed רק לצוותים שהבסיס שלהם עובד."
        ],
        "mediaNote": "צילומי המסך במצגת הם צילומי DroneBlocks ציבוריים/קיימים לטיוטת בדיקה. לפני פרסום חיצוני מומלץ להחליף בצילומי טאבלט מקוריים של מרכז החדשנות.",
        "exitTicket": "Blueprint טוב מונע ___ כי ___."
    },
    "videoResources": [
        {
            "title": "Pix4D / Wingtra — drone 3D mapping and surveying",
            "url": "https://www.pix4d.com/"
        },
        {
            "title": "NASA JPL — Ingenuity testing and Mars flight",
            "url": "https://www.jpl.nasa.gov/missions/ingenuity"
        }
    ],
    "screenshotSlides": [
        {
            "title": "פותחים City Mapping",
            "src": "assets/tello-mission-lab/lesson10/open-app.png",
            "caption": "הטאבלט נפתח רק אחרי Blueprint ואישור."
        },
        {
            "title": "scan_height ו־Loop",
            "src": "assets/tello-mission-lab/lesson10/block-sequence.png",
            "caption": "משתנה גובה ולולאה מרובעת סביב גג."
        },
        {
            "title": "בדיקת City/Minimal Grid",
            "src": "assets/tello-mission-lab/lesson10/simulator-run.png",
            "caption": "בודקים התנגשויות וגובה לפני המשך."
        },
        {
            "title": "תרשים Blueprint",
            "src": "assets/tello-mission-lab/lesson10/city-mapping-blueprint-diagram.svg",
            "caption": "המסלול נובע מדרישות המיפוי."
        },
        {
            "title": "שיתוף הפרויקט",
            "src": "assets/tello-mission-lab/lesson10/save-share.png",
            "caption": "City_Mapping_Team_X נשמר למפגש 11."
        }
    ],
    "instructorSlides": [
        {
            "title": "מפגש 10 — Blueprint מיפוי",
            "body": "היום מתכננים פרויקט חקר עירוני לפני כתיבת קוד מלא.",
            "bullets": [
                "פוטוגרמטריה",
                "City Simulator",
                "Paper Blueprint"
            ]
        },
        {
            "title": "Pix4D / Wingtra",
            "body": "רחפנים ממפים ערים ואתרי בנייה בעזרת מסלולי סריקה ותמונות חופפות.",
            "bullets": [
                "3D Mapping",
                "Overlap",
                "Grid"
            ]
        },
        {
            "title": "הדרישות הטכניות",
            "body": "scan_height, Loop ×4, Hover לצילום, Land ושיתוף.",
            "bullets": [
                "גובה",
                "לולאה",
                "צילום יציב"
            ]
        },
        {
            "title": "אין טאבלטים לפני שרטוט",
            "body": "תכנון קודם לקוד. אחרת מקבלים Spaghetti Code שקשה לתקן.",
            "bullets": [
                "שרטוט",
                "חתימת בטיחות",
                "אור ירוק"
            ]
        },
        {
            "title": "בונוס רוח חזקה",
            "body": "Set Speed 30% בקטע הסריקה יכול לשפר דיוק לצוותים מתקדמים.",
            "bullets": [
                "דיוק",
                "מהירות",
                "בונוס בלבד"
            ]
        }
    ]
});


  Object.assign(window.TELLO_MISSION_LAB_LESSONS[10], {
    "title": "שיעור 11: JPL Visual Calibration — כיול שטח ופענוח חזותי",
    "subtitle": "JPL — Jet Propulsion Laboratory / המעבדה להנעה סילונית של NASA: Sim‑to‑Reality Gap, Wait לפני צילום, scan_height/distance ושלוש תחנות J‑P‑L",
    "unit": "יחידה 5 — פרויקט חקר מסכם",
    "concept": "Simulation-to-Reality Gap, Visual Calibration, Motion Blur, Wait/Sleep 2 sec, scan_height, distance, Photo Decode, Battery Efficiency",
    "workspaceMode": "physical-lab",
    "appWorkflowTitle": "Physical Lab — טוענים Blueprint, מצלמים תחנות ומכיילים נתוני תמונה",
    "appWorkflowNote": "השיעור מחבר את אב־הטיפוס משיעור 10 לרחפן פיזי בכיתה. האתר מציג תדריך, תרשים זירה ודף כיול; את הקוד טוענים/עורכים ב־DroneBlocks ומטיסים רק לפי תור ואישור מדריך.",
    "physicalFlightAllowed": true,
    "story": "צוותי כיתה ו׳ הופכים למהנדסי JPL — Jet Propulsion Laboratory, המעבדה להנעה סילונית של NASA שמובילה משימות רובוטיות לחלל — ומכיילים מערכת צילום לפני משימת מאדים. הקוד שעבד בסימולטור צריך להפיק עכשיו תמונות חדות של שלוש תחנות פיזיות בגבהים שונים. אם התמונה מטושטשת או התחנה מפוספסת — זו לא תקלה מביכה; זה נתון לכיול.",
    "mission": "לטעון את City_Mapping_Team_X משיעור 10, להוסיף Wait/Sleep 2 sec לפני כל Take Photo, להגדיר scan_height/distance בראש הקוד, להטיס מעל 3 תחנות פיזיות A/B/C בגבהים שונים, לצלם אותיות סודיות J‑P‑L — קיצור שמזכיר את Jet Propulsion Laboratory של NASA — לפענח את התמונות ולשמור Project_Final_v2_Calibrated.",
    "blocks": [
        "safety_check",
        "comment",
        "variable",
        "takeoff",
        "up",
        "forward",
        "hover_data",
        "wait",
        "photo",
        "yaw_right",
        "land",
        "battery",
        "telemetry",
        "share"
    ],
    "essentialQuestion": "איך מכיילים רחפן פיזי כך שהתמונה שנאספת תהיה נתון חקרי חד ולא צילום מטושטש?",
    "successCriteria": [
        "אני מסביר/ה מהו Sim‑to‑Reality Gap ומה גורם לו בכיתה.",
        "אני מוסיף/ה Wait/Sleep 2 sec לפני צילום כדי להפחית Motion Blur.",
        "אני מודד/ת סטייה או איכות תמונה ומחליט/ה אם לשנות scan_height, distance או זמן המתנה.",
        "אני שומר/ת על Driver/Navigator/Safety Observer בכל הרצה.",
        "אני מפענח/ת שלוש תמונות חדות מספיק ליצירת הקוד J‑P‑L.",
        "אני שומר/ת Project_Final_v2_Calibrated עם Share Link ותיעוד כיול."
    ],
    "realWorldUses": [
        {
            "icon": "🚁",
            "title": "JPL / Ingenuity",
            "text": "מערכות צילום ורחיפה עוברות כיול לפני משימות חקר אמיתיות."
        },
        {
            "icon": "📷",
            "title": "Visual Calibration",
            "text": "תמונה חדה דורשת גובה, תאורה, ריחוף וזמן המתנה."
        },
        {
            "icon": "🌬️",
            "title": "פער סימולציה־מציאות",
            "text": "רוח מזגן, רצפה מבריקה וסוללה משנים את התוצאה בפועל."
        },
        {
            "icon": "🔋",
            "title": "יעילות סוללה",
            "text": "מסלול קצר ומדוד משאיר זמן צילום ותיקון לפני שהסוללה נגמרת."
        }
    ],
    "vocabulary": [
        [
            "JPL / Jet Propulsion Laboratory",
            "המעבדה להנעה סילונית של NASA — גוף שמוביל משימות רובוטיות לחלל, כולל רוברים ומסוק Ingenuity במאדים."
        ],
        [
            "Sim‑to‑Reality Gap",
            "פער בין סימולטור סטרילי לבין כיתה אמיתית עם רוח, תאורה, רצפה וסוללה."
        ],
        [
            "Visual Calibration",
            "כיול שמטרתו לשפר איכות צילום ופענוח."
        ],
        [
            "Motion Blur",
            "טשטוש שנוצר כשמצלמים בזמן תנועה או רעד."
        ],
        [
            "Wait / Sleep",
            "השהיית קוד לפני צילום כדי לאפשר התייצבות."
        ],
        [
            "scan_height",
            "גובה סריקה שניתן לשינוי בראש הקוד."
        ],
        [
            "Decode",
            "פענוח מידע מתוך תמונה — למשל אות סודית."
        ],
        [
            "Run Log",
            "תיעוד הרצה: גובה, המתנה, סטייה, איכות צילום ותיקון."
        ]
    ],
    "safetyRules": [
        "אין המראה ללא משקפי מגן, שיער אסוף, מגיני פרופלורים ואישור מדריך.",
        "רק צוות אחד באוויר באזור המסומן.",
        "לא נכנסים למלבן הטיסה בזמן רחפן באוויר, גם אם צריך “לתקן צילום”.",
        "לא עוברים מעל תחנה גבוהה אם הגובה/מרחב אינם בטוחים — משתמשים בקופסה נמוכה במקום.",
        "סוללה מתחת ל־30% מבטלת Run נוסף.",
        "אחרי נחיתה, רק אז פורקים תמונות/בודקים גלריה.",
        "שינוי כיול אחד בכל סבב: Wait, scan_height או distance — לא הכול יחד."
    ],
    "commonDirections": [
        [
            "Wait 2 sec",
            "עצירה לפני צילום כדי למנוע Motion Blur."
        ],
        [
            "Take Photo",
            "צילום תחנת A/B/C."
        ],
        [
            "scan_height",
            "גובה צילום ביחס לתחנה."
        ],
        [
            "distance",
            "כיול מרחק בין תחנות."
        ],
        [
            "Decode J‑P‑L",
            "פענוח שלוש אותיות מהתמונות."
        ],
        [
            "Project_Final_v2_Calibrated",
            "שם הגרסה המכוילת להגשה."
        ]
    ],
    "setupSteps": [
        "פותחים DroneBlocks על WiFi בית ספרי וטוענים את City_Mapping_Team_X.",
        "מוסיפים Wait/Sleep 2 sec לפני כל Take Photo ומגדירים scan_height/distance.",
        "מסמנים Safe Fly Zone וממקמים 3 תחנות בגבהים שונים עם אותיות J/P/L.",
        "עוברים ל־Tello WiFi רק אחרי שהקוד נטען ונשמר.",
        "מריצים לפי תור, פורקים תמונות אחרי נחיתה וממלאים Run Log.",
        "מכיילים פרמטר אחד ושומרים Project_Final_v2_Calibrated ב־WiFi בית ספרי."
    ],
    "appWorkflow": [
        {
            "title": "טעינת אב־טיפוס",
            "detail": "מחוברים ל־WiFi בית ספרי, פותחים את פרויקט City_Mapping_Team_X משיעור 10 ושומרים עותק כיול."
        },
        {
            "title": "Wait לפני צילום",
            "detail": "מוסיפים Wait/Sleep 2 sec אחרי תנועה ולפני כל Take Photo כדי לצמצם Motion Blur."
        },
        {
            "title": "פריסת תחנות J‑P‑L",
            "detail": "ממקמים שלוש תחנות בגבהים 50/80/120 ס״מ לפי יכולת הכיתה. אם תחנה גבוהה מסוכנת — מקטינים."
        },
        {
            "title": "Run 1 וצילום",
            "detail": "Driver מריץ, Navigator מתעד סטייה/גובה/איכות תמונה, Observer שומר בטיחות ו־Abort."
        },
        {
            "title": "Visual Calibration",
            "detail": "אם תמונה מטושטשת: מגדילים Wait או משפרים תאורה. אם מפספסים תחנה: משנים distance/scan_height בלבד."
        },
        {
            "title": "Decode + Share",
            "detail": "מפענחים J‑P‑L, שומרים Project_Final_v2_Calibrated ומפיקים Share Link עם דף כיול."
        }
    ],
    "tabletTips": [
        "לטעון פרויקט מהענן לפני מעבר ל־Tello WiFi.",
        "להוריד תמונות מהרחפן אחרי נחיתה כשהטאבלט עדיין מחובר לרשת Tello הנכונה.",
        "אם הגלריה לא מתרעננת — Refresh או פתיחה מחדש של האפליקציה.",
        "לא לשנות Wait וגם distance באותו סבב; אחרת לא יודעים מה עזר.",
        "בסוף חוזרים ל־WiFi בית ספרי לשמירה ושיתוף."
    ],
    "lessonFlow": [
        {
            "minutes": "0–8",
            "title": "סיפור JPL וכיול מצלמות",
            "teacher": "מציג שהיום בודקים מערכת צילום פיזית אחרי Blueprint.",
            "students": "פותחים את שם הפרויקט משיעור 10."
        },
        {
            "minutes": "8–20",
            "title": "Motion Blur ו־Sim‑to‑Reality",
            "teacher": "משתמש באנלוגיית רכבת הרים ומסביר רוח/תאורה/VPS/סוללה.",
            "students": "מזהים סיבה אחת לתמונה מטושטשת."
        },
        {
            "minutes": "20–32",
            "title": "טעינת קוד ו־Wait",
            "teacher": "מנחה WiFi בית ספרי, טעינת פרויקט והוספת Wait 2 sec.",
            "students": "מוסיפים Wait לפני Photo ומגדירים scan_height."
        },
        {
            "minutes": "32–40",
            "title": "פריסת זירה ותפקידים",
            "teacher": "מסמן תחנות A/B/C ומחלק Driver/Navigator/Observer.",
            "students": "בודקים ציוד ובטיחות."
        },
        {
            "minutes": "40–48",
            "title": "Pre‑Flight Check",
            "teacher": "בודק סוללה, מגינים, משקפי מגן, אזור סטרילי ו־Abort.",
            "students": "מקריאים נוהל המראה."
        },
        {
            "minutes": "48–64",
            "title": "Run 1 וצילום",
            "teacher": "מאשר צוותים לפי תור, מונע כניסה לאזור הטיסה.",
            "students": "מצלמים תחנות ומורידים תמונות אחרי נחיתה."
        },
        {
            "minutes": "64–76",
            "title": "פענוח וכיול",
            "teacher": "שואל אם הבעיה היא טשטוש, גובה או מרחק.",
            "students": "משנים Wait/scan_height/distance אחד ומתעדים."
        },
        {
            "minutes": "76–84",
            "title": "Run 2 או סימולציית תיקון",
            "teacher": "מאשר Run נוסף רק אם זמן/סוללה/בטיחות מאפשרים.",
            "students": "בודקים אם התמונות חדות יותר."
        },
        {
            "minutes": "84–90",
            "title": "שמירה וסגירת ציוד",
            "teacher": "מוביל Share Link, סוללות 0% והכנה לשיעור 12.",
            "students": "שומרים ומגישים Run Log."
        }
    ],
    "exercises": [
        {
            "minutes": "8–20",
            "title": "זיהוי Motion Blur",
            "prompt": "כתבו למה צילום בזמן תנועה יוצא מטושטש.",
            "check": "התשובה מזכירה תנועה/רעד/חוסר ייצוב."
        },
        {
            "minutes": "20–32",
            "title": "Wait לפני Photo",
            "prompt": "הוסיפו Wait/Sleep 2 sec לפני כל Take Photo.",
            "check": "כל צילום מגיע אחרי עצירת ייצוב."
        },
        {
            "minutes": "32–40",
            "title": "מפת תחנות",
            "prompt": "סמנו מנחת ותחנות A/B/C בגבהים שונים.",
            "check": "הכול בתוך Safe Fly Zone."
        },
        {
            "minutes": "48–64",
            "title": "Run 1",
            "prompt": "צלמו שלוש תחנות ונסו לפענח J‑P‑L.",
            "check": "יש תמונות או תיעוד למה לא."
        },
        {
            "minutes": "64–76",
            "title": "כיול חזותי",
            "prompt": "בחרו שינוי אחד: Wait, scan_height או distance.",
            "check": "השינוי קשור לבעיה שנצפתה."
        },
        {
            "minutes": "76–84",
            "title": "השוואת תמונות",
            "prompt": "האם התמונה אחרי הכיול ברורה יותר?",
            "check": "ההשוואה מנומקת."
        },
        {
            "minutes": "84–90",
            "title": "כרטיס יציאה",
            "prompt": "תמונה הופכת לנתון כאשר...",
            "check": "מזכיר חדות/פענוח/הקשר חקרי."
        }
    ],
    "deliverable": "Project_Final_v2_Calibrated: קוד מכויל עם Wait לפני צילום, 3 תמונות/תיעוד פענוח J‑P‑L, Run Log ו־Share Link.",
    "assessment": [
        "הקוד נטען מה־Blueprint של שיעור 10.",
        "יש Wait/Sleep לפני כל צילום.",
        "הצוות מודד או מתעד איכות צילום ולא מנחש.",
        "הכיול נעשה בפרמטר אחד בלבד בכל סבב.",
        "נשמרה גרסה מכוילת עם פענוח/תיעוד."
    ],
    "debugging": [
        {
            "problem": "התמונות שחורות או מטושטשות",
            "fix": "מוסיפים/מאריכים Wait, משפרים תאורה ומוודאים שהצילום אחרי Hover."
        },
        {
            "problem": "הטאבלט לא מוריד תמונות",
            "fix": "מוודאים חיבור ל־WiFi של הרחפן הנכון ומרעננים גלריה/אפליקציה."
        },
        {
            "problem": "הרחפן מפספס תחנות",
            "fix": "בודקים Drift/VPS, מכבים מזגן, מוסיפים עוגן ויזואלי לרצפה ומשנים distance אחד."
        },
        {
            "problem": "תחנה גבוהה מסכנת את הרחפן",
            "fix": "מקטינים גובה תחנה או מחליפים בקופסת קרטון נמוכה יותר."
        },
        {
            "problem": "נגמר זמן/סוללה",
            "fix": "מבצעים Run 2 בסימולטור/תרחיש שולחן ושומרים את הכיול לשיעור 12."
        }
    ],
    "differentiation": {
        "support": [
            "להשתמש בשתי תחנות בלבד ולשמור יעד של שלוש בתכנון.",
            "לתת תבנית Run Log מוכנה.",
            "לבצע פענוח מתמונות לדוגמה אם אין הרצה פיזית."
        ],
        "extension": [
            "להשוות Wait 1 sec מול Wait 2 sec במדד חדות.",
            "להוסיף טבלת Image Quality: חדות, מיקום, קריאות אות.",
            "להציע כלל כיול: אם תמונה מטושטשת אז ___; אם פספסנו תחנה אז ___."
        ]
    },
    "visualDiagram": {
        "panelTitle": "📷 Visual Calibration",
        "chip": "Physical Lab",
        "title": "שלוש תחנות, Wait לפני צילום ופענוח J‑P‑L",
        "src": "assets/tello-mission-lab/lesson11/visual-calibration-jpl-diagram.svg",
        "alt": "תרשים כיול חזותי עם מנחת, תחנות A B C, Wait לפני צילום ופענוח JPL",
        "caption": "הרחפן לא רק טס — הוא אוסף נתון חזותי. לכן חדות, גובה והמתנה הם חלק מהקוד."
    },
    "instructorGuide": {
        "prerequisites": "נדרש Blueprint/אב־טיפוס משיעור 10. לפתוח בהסבר קצר: JPL הוא Jet Propulsion Laboratory — המעבדה להנעה סילונית של NASA, שמפתחת ומפעילה משימות רובוטיות לחלל כמו רוברים ומסוק Ingenuity. אם צוות לא שמר תוצר, מתחילים מגרסת Minimal מוכנה ולא קופצים למסלול פיזי מורכב.",
        "pedagogy": [
            "זה שיעור מצוין לחיבור בין חקר חזותי לבין הנדסה פיזית: התוצר הוא תמונה מפוענחת, לא רק טיסה.",
            "להסביר במפורש את JPL בתחילת השיעור: לא עוד ראשי תיבות מסתוריים, אלא דוגמה אמיתית למעבדת חלל שמכיילת רובוטים לפני משימות.",
            "Motion Blur הוא מושג מאוד מוחשי לילדים; להשתמש באנלוגיית רכבת הרים לפני הקוד.",
            "חשוב לא להעמיס שלוש תחנות גבוהות אם הכיתה קטנה. בטיחות קודמת לתמונה.",
            "כיול טוב הוא שינוי אחד בכל סבב. אחרת אין למידה סיבתית."
        ],
        "facilitationNotes": [
            "להכין כרטיסיות J/P/L גדולות וברורות.",
            "להכין דפי Run Log: תחנה, גובה, Wait, איכות צילום, תיקון.",
            "לנהל תור טיסה קשיח כדי לא לבזבז סוללות.",
            "לשבח צוות שבוחר להפוך Run פיזי לסימולציה בגלל סיכון."
        ],
        "mediaNote": "צילומי המסך במצגת הם צילומי DroneBlocks ציבוריים/קיימים לטיוטת בדיקה. לפני פרסום חיצוני מומלץ להחליף בצילומי טאבלט מקוריים של מרכז החדשנות.",
        "exitTicket": "כיול חזותי טוב מתחיל ב___ ולא ב___."
    },
    "videoResources": [
        {
            "title": "Pix4D / Wingtra — drone 3D mapping and surveying",
            "url": "https://www.pix4d.com/"
        },
        {
            "title": "NASA JPL — Ingenuity testing and Mars flight",
            "url": "https://www.jpl.nasa.gov/missions/ingenuity"
        }
    ],
    "screenshotSlides": [
        {
            "title": "טוענים City Mapping",
            "src": "assets/tello-mission-lab/lesson11/open-app.png",
            "caption": "מתחילים מהאב־טיפוס שנשמר בשיעור 10."
        },
        {
            "title": "Wait לפני צילום",
            "src": "assets/tello-mission-lab/lesson11/block-sequence.png",
            "caption": "Move → Wait/Sleep → Take Photo מונע Motion Blur."
        },
        {
            "title": "בדיקה והרצה",
            "src": "assets/tello-mission-lab/lesson11/simulator-run.png",
            "caption": "בודקים לפני Run פיזי וממלאים Run Log."
        },
        {
            "title": "תרשים כיול JPL",
            "src": "assets/tello-mission-lab/lesson11/visual-calibration-jpl-diagram.svg",
            "caption": "שלוש תחנות, שלוש תמונות, פענוח אחד."
        },
        {
            "title": "שמירת גרסה מכוילת",
            "src": "assets/tello-mission-lab/lesson11/save-share.png",
            "caption": "Project_Final_v2_Calibrated + Share Link."
        }
    ],
    "instructorSlides": [
        {
            "title": "JPL Visual Calibration",
            "body": "JPL היא Jet Propulsion Laboratory — המעבדה להנעה סילונית של NASA. היום נבדוק כמו מהנדסי חלל אם הקוד מייצר תמונה חדה ופענוח אמיתי.",
            "bullets": [
                "Sim‑to‑Reality",
                "Motion Blur",
                "Decode"
            ]
        },
        {
            "title": "למה התמונה מטושטשת?",
            "body": "רחפן שזז בזמן צילום מייצר מידע חלש. Wait הוא חלק מהמדידה.",
            "bullets": [
                "Move",
                "Wait 2 sec",
                "Take Photo"
            ]
        },
        {
            "title": "זירת J‑P‑L",
            "body": "שלוש תחנות בגבהים שונים. המטרה: לפענח שלוש אותיות אחרי נחיתה.",
            "bullets": [
                "A=J",
                "B=P",
                "C=L"
            ]
        },
        {
            "title": "כיול אחד בכל סבב",
            "body": "שינוי Wait, scan_height או distance — לא הכול יחד.",
            "bullets": [
                "מדידה",
                "שינוי אחד",
                "השוואה"
            ]
        },
        {
            "title": "בטיחות וסוללות",
            "body": "תור טיסה, Observer, Abort ונוהל שתי קופסאות.",
            "bullets": [
                "משקפי מגן",
                "30% סוללה",
                "Share Link"
            ]
        }
    ]
});


  Object.assign(window.TELLO_MISSION_LAB_LESSONS[11], {
    "title": "שיעור 12: בדיקות שטח — נתונים, סטייה ותיקון",
    "subtitle": "מ־V1 ל־V2 באמצעות מדידה ולא ניחוש",
    "concept": "Field Test, Drift, Data/Debug Log, V2",
    "story": "גרסת V1 יוצאת לבדיקת שטח מבוקרת. המציאות מוסיפה סטייה, רעש, סוללה ורצפה. התלמידים לומדים למדוד את הפער בין תכנון לביצוע ולבצע תיקון אחד בלבד.",
    "mission": "להריץ V1, למדוד סטייה/פער נתונים, למלא Data/Debug Log ולשמור Project_V2 עם שינוי אחד מוסבר.",
    "blocks": [
        "safety_check",
        "takeoff",
        "project_path",
        "hover_data",
        "land"
    ],
    "essentialQuestion": "איך מתקנים פרויקט חקר לפי מדידה ולא לפי תחושת בטן?",
    "successCriteria": [
        "אני מודד/ת פער בין תכנון לביצוע.",
        "אני ממלא/ת Data/Debug Log.",
        "אני מזהה גורם אפשרי לסטייה.",
        "אני משנה פרמטר אחד בלבד.",
        "אני שומר/ת Project_V2 ומשווה ל־V1."
    ],
    "realWorldUses": [
        {
            "icon": "📏",
            "title": "מדידת סטייה",
            "text": "פערים פיזיים הופכים לנתוני דיבוג."
        },
        {
            "icon": "🌬️",
            "title": "השפעות מציאות",
            "text": "רוח, רצפה וסוללה משנים תוצאה."
        },
        {
            "icon": "🔧",
            "title": "V2",
            "text": "גרסה שנייה מבוססת מדידה אחת."
        }
    ],
    "vocabulary": [
        [
            "Drift",
            "סטייה בין תכנון לביצוע."
        ],
        [
            "Data Log",
            "טבלת תכנון/תוצאה."
        ],
        [
            "Debug Log",
            "בעיה, השערה ותיקון."
        ],
        [
            "V2",
            "גרסה לאחר תיקון אחד."
        ],
        [
            "Tolerance",
            "תחום סטייה מקובל."
        ]
    ],
    "safetyRules": [
        "טיסה פיזית רק באישור מדריך ובתור מוגדר.",
        "משקפי מגן ואזור סטרילי בכל הפעלה פיזית.",
        "מריצים בסימולטור לפני כל הרצה פיזית.",
        "אם יש סטייה, אדם באזור או אי־ודאות — Abort/Land מיד.",
        "לא משנים קוד בזמן הרחפן באוויר."
    ],
    "commonDirections": [
        [
            "Measure",
            "מדידה לפני שינוי."
        ],
        [
            "Drift",
            "סטייה."
        ],
        [
            "Hypothesis",
            "השערה."
        ],
        [
            "One Fix",
            "תיקון אחד."
        ],
        [
            "V2",
            "גרסה שנייה."
        ]
    ],
    "setupSteps": [
        "פותחים תוצר קודם ובודקים מה נשמר.",
        "מריצים גרסת סימולטור לפני כל שינוי.",
        "מגדירים תפקידים: Driver, Navigator, Observer/Data Recorder.",
        "בודקים סוללה/אזור אם יש הרצה פיזית.",
        "שומרים גרסה בשם ברור ומשתפים או מצלמים תוצר."
    ],
    "tabletTips": [
        "לשמור עותק לפני שינוי משמעותי.",
        "לשנות פרמטר אחד בלבד בכל בדיקה.",
        "Share Link רק ב־WiFi בית ספרי.",
        "לצלם מסך אם שיתוף לא זמין.",
        "לחזור ל־WiFi בית ספרי אחרי עבודה עם Tello WiFi."
    ],
    "lessonFlow": [
        {
            "minutes": "0–8",
            "title": "V1 על השולחן",
            "teacher": "בודק Project_V1 ו־Backlog.",
            "students": "פותחים V1."
        },
        {
            "minutes": "8–18",
            "title": "מה מודדים?",
            "teacher": "מגדיר Drift/Tolerance לפי הפרויקט.",
            "students": "בוחרים מדד אחד."
        },
        {
            "minutes": "18–30",
            "title": "טבלת Data/Debug",
            "teacher": "מדגים Plan/Result/Gap/Cause/Fix.",
            "students": "מכינים טבלה."
        },
        {
            "minutes": "30–48",
            "title": "Field Test מבוקר",
            "teacher": "מאשר סימולטור/פיזי חלקי.",
            "students": "מריצים ומתעדים."
        },
        {
            "minutes": "48–62",
            "title": "ניתוח סטייה",
            "teacher": "שואל מה הפער ומה מקור אפשרי.",
            "students": "כותבים Hypothesis."
        },
        {
            "minutes": "62–74",
            "title": "V2: תיקון אחד",
            "teacher": "מונע שינוי מרובה פרמטרים.",
            "students": "שומרים Project_V2."
        },
        {
            "minutes": "74–84",
            "title": "השוואת V1/V2",
            "teacher": "מוביל השוואה לפי מדד.",
            "students": "קובעים האם השתפר."
        },
        {
            "minutes": "84–90",
            "title": "סיכום",
            "teacher": "מחבר לשיעור 13: אמינות חוזרת.",
            "students": "כרטיס יציאה."
        }
    ],
    "exercises": [
        {
            "minutes": "8–18",
            "title": "מדד סטייה",
            "prompt": "בחרו מה מודדים: מיקום/זמן/צילום/כיסוי.",
            "check": "מדד אחד."
        },
        {
            "minutes": "18–30",
            "title": "טבלת Debug",
            "prompt": "הכינו Plan/Result/Gap/Cause/Fix.",
            "check": "הטבלה מוכנה."
        },
        {
            "minutes": "30–48",
            "title": "Field Test",
            "prompt": "הריצו ותעדו תוצאה.",
            "check": "אין מדידה בזמן רחפן באוויר."
        },
        {
            "minutes": "48–62",
            "title": "Hypothesis",
            "prompt": "מה יכול להסביר את הפער?",
            "check": "השערה סבירה."
        },
        {
            "minutes": "62–74",
            "title": "V2",
            "prompt": "שנו פרמטר אחד ושמרו.",
            "check": "שינוי אחד."
        },
        {
            "minutes": "74–84",
            "title": "השוואה",
            "prompt": "האם V2 השתפרה מול V1?",
            "check": "מבוסס מדד."
        },
        {
            "minutes": "84–90",
            "title": "כרטיס יציאה",
            "prompt": "לא מתקנים לפני ש...",
            "check": "מזכיר מדידה."
        }
    ],
    "deliverable": "Project_V2_G6: Data/Debug Log + תיקון אחד מתועד והשוואה ל־V1.",
    "assessment": [
        "יש תוצר ברור לשלב השיעור.",
        "הקוד/המסלול מחובר לשאלת החקר.",
        "יש תיעוד נתונים או ראיה.",
        "יש דיבוג או החלטת בטיחות מנומקת.",
        "הצוות יודע להסביר את הבחירות שלו."
    ],
    "debugging": [
        {
            "problem": "התוצר לא מחובר לשאלת החקר",
            "fix": "מחזירים ל־Blueprint ושואלים איזה נתון נאסף."
        },
        {
            "problem": "הצוות מנסה לשנות הכול",
            "fix": "מכריזים שינוי אחד או Freeze לפי שלב."
        },
        {
            "problem": "אין גיבוי סימולטור",
            "fix": "שומרים Backup לפני הצגה/פיזי."
        },
        {
            "problem": "ההסבר נשמע כמו רשימת בלוקים",
            "fix": "מחזירים למבנה שאלה→נתון→מסקנה."
        }
    ],
    "differentiation": {
        "support": [
            "לתת תבנית כתיבה/טבלה מוכנה.",
            "לאפשר סימולטור במקום הדגמה פיזית.",
            "להציג בזוג או עם כרטיס דיבור."
        ],
        "extension": [
            "להוסיף מדד כמותי.",
            "להוביל משוב עמיתים.",
            "להכין גרסת גיבוי או הצעת שיפור עתידית."
        ]
    },
    "instructorGuide": {
        "prerequisites": "נדרש תוצר מהשלב הקודם בפרויקט. אם אין תוצר, מצמצמים Scope ולא מדלגים קדימה.",
        "pedagogy": [
            "רצף הפרויקט הוא הדרגתי: תכנון, V1, בדיקה, אמינות, הגשה, הצגה.",
            "כל שיעור חייב להוסיף החלטה או תוצר חדש ולא לחזור על אותו מהלך.",
            "להעריך תהליך חקר ובטיחות לא פחות מהדגמת טיסה."
        ],
        "mediaNote": commonInstructorMediaNote,
        "exitTicket": "הפרויקט שלנו התקדם כי ___."
    },
    "videoResources": grade6VideoResources,
    "screenshotSlides": [
        {
            "title": "פותחים תוצר קודם",
            "src": "assets/tello-mission-lab/lesson12/open-app.png",
            "caption": "מתחילים מהגרסה הקודמת ולא מאפס."
        },
        {
            "title": "רצף העבודה של השיעור",
            "src": "assets/tello-mission-lab/lesson12/block-sequence.png",
            "caption": "רצף הבלוקים משקף את מטרת השיעור הספציפית."
        },
        {
            "title": "בדיקה/הצגה מבוקרת",
            "src": "assets/tello-mission-lab/lesson12/simulator-run.png",
            "caption": "בודקים או מציגים לפי נוהל בטיחות."
        },
        {
            "title": "שומרים תוצר שלב",
            "src": "assets/tello-mission-lab/lesson12/save-share.png",
            "caption": "שומרים תוצר שמקדם את הפרויקט לשלב הבא."
        }
    ],
    "instructorSlides": [
        {
            "title": "המציאות מתקנת את הקוד",
            "body": "סטייה אינה כישלון — היא מידע.",
            "bullets": [
                "Plan",
                "Result",
                "Gap"
            ]
        },
        {
            "title": "Debug Log",
            "body": "תיקון טוב מתחיל במדידה והשערה.",
            "bullets": [
                "Problem",
                "Cause",
                "Fix"
            ]
        },
        {
            "title": "V2 = שינוי אחד",
            "body": "אם משנים הכול, לא יודעים מה עזר.",
            "bullets": [
                "One Parameter",
                "Compare",
                "Save"
            ]
        }
    ]
});

  Object.assign(window.TELLO_MISSION_LAB_LESSONS[12], {
    "title": "שיעור 13: אמינות נתונים — חזרות והשוואת הרצות",
    "subtitle": "מ־V2 לגרסה מועמדת להצגה",
    "concept": "Reliability, Repeatability, Run Table, Release Candidate",
    "story": "פרויקט שעבד פעם אחת עדיין לא מוכיח נתון אמין. הצוותים מבצעים כמה הרצות, משווים תוצאות, ומחליטים האם המידע מספיק עקבי להצגה.",
    "mission": "לבצע 2–3 Test Runs, למלא Run Table, לזהות עקביות/חוסר עקביות ולשמור Project_RC אחרי Final Fix אחד.",
    "blocks": [
        "safety_check",
        "takeoff",
        "project_path",
        "hover_data",
        "photo",
        "land"
    ],
    "essentialQuestion": "מתי תוצאה של רחפן מספיק אמינה כדי להציג אותה כממצא?",
    "successCriteria": [
        "אני מבין/ה שהרצה אחת אינה הוכחה.",
        "אני מתעד/ת 2–3 הרצות בטבלת Run Table.",
        "אני מזהה מה יציב ומה משתנה.",
        "אני מבצע/ת Final Fix אחד בלבד.",
        "אני שומר/ת Project_RC ומכין/ה גרסת גיבוי."
    ],
    "realWorldUses": [
        {
            "icon": "🔁",
            "title": "חזרתיות",
            "text": "ממצא אמין חוזר בכמה בדיקות."
        },
        {
            "icon": "📊",
            "title": "Run Table",
            "text": "השוואת הרצות מראה עקביות."
        },
        {
            "icon": "✅",
            "title": "Release Candidate",
            "text": "גרסה כמעט סופית שמוכנה להצגה."
        }
    ],
    "vocabulary": [
        [
            "Reliability",
            "אמינות תוצאה בין הרצות."
        ],
        [
            "Repeatability",
            "יכולת לחזור על ביצוע."
        ],
        [
            "Run Table",
            "טבלה להשוואת הרצות."
        ],
        [
            "RC",
            "גרסה מועמדת להצגה."
        ],
        [
            "Final Fix",
            "תיקון אחרון לפני הקפאה."
        ]
    ],
    "safetyRules": [
        "טיסה פיזית רק באישור מדריך ובתור מוגדר.",
        "משקפי מגן ואזור סטרילי בכל הפעלה פיזית.",
        "מריצים בסימולטור לפני כל הרצה פיזית.",
        "אם יש סטייה, אדם באזור או אי־ודאות — Abort/Land מיד.",
        "לא משנים קוד בזמן הרחפן באוויר."
    ],
    "commonDirections": [
        [
            "Run 1/2/3",
            "הרצות חוזרות."
        ],
        [
            "Consistency",
            "עקביות."
        ],
        [
            "Outlier",
            "תוצאה חריגה."
        ],
        [
            "Final Fix",
            "תיקון אחרון."
        ],
        [
            "RC",
            "גרסת הצגה."
        ]
    ],
    "setupSteps": [
        "פותחים תוצר קודם ובודקים מה נשמר.",
        "מריצים גרסת סימולטור לפני כל שינוי.",
        "מגדירים תפקידים: Driver, Navigator, Observer/Data Recorder.",
        "בודקים סוללה/אזור אם יש הרצה פיזית.",
        "שומרים גרסה בשם ברור ומשתפים או מצלמים תוצר."
    ],
    "tabletTips": [
        "לשמור עותק לפני שינוי משמעותי.",
        "לשנות פרמטר אחד בלבד בכל בדיקה.",
        "Share Link רק ב־WiFi בית ספרי.",
        "לצלם מסך אם שיתוף לא זמין.",
        "לחזור ל־WiFi בית ספרי אחרי עבודה עם Tello WiFi."
    ],
    "lessonFlow": [
        {
            "minutes": "0–8",
            "title": "פותחים V2",
            "teacher": "בודק שהתיקון האחרון מתועד.",
            "students": "פותחים V2 וטבלת Debug."
        },
        {
            "minutes": "8–18",
            "title": "למה פעם אחת לא מספיקה",
            "teacher": "מסביר אמינות וחזרתיות.",
            "students": "מנסחים מה צריך לחזור."
        },
        {
            "minutes": "18–30",
            "title": "Run Table",
            "teacher": "מגדיר Run 1/2/3 ומדד הצלחה.",
            "students": "מכינים טבלה."
        },
        {
            "minutes": "30–58",
            "title": "הרצות חוזרות",
            "teacher": "מנהל תורים/סוללה/סימולטור.",
            "students": "מבצעים 2–3 הרצות."
        },
        {
            "minutes": "58–68",
            "title": "עקביות וחריגים",
            "teacher": "מוביל זיהוי Consistent/Outlier.",
            "students": "מסמנים מה יציב."
        },
        {
            "minutes": "68–78",
            "title": "Final Fix",
            "teacher": "מאשר תיקון אחרון בלבד.",
            "students": "שומרים Project_RC."
        },
        {
            "minutes": "78–86",
            "title": "גרסת גיבוי",
            "teacher": "דורש Backup Demo בסימולטור.",
            "students": "מכינים גיבוי."
        },
        {
            "minutes": "86–90",
            "title": "סיכום",
            "teacher": "מחבר לשיעור 14: הגשה.",
            "students": "כרטיס יציאה."
        }
    ],
    "exercises": [
        {
            "minutes": "8–18",
            "title": "הגדרת אמינות",
            "prompt": "מה חייב לחזור בכל הרצה?",
            "check": "קריטריון ברור."
        },
        {
            "minutes": "18–30",
            "title": "Run Table",
            "prompt": "הכינו עמודות Run/Result/Note.",
            "check": "הטבלה מוכנה."
        },
        {
            "minutes": "30–58",
            "title": "2–3 הרצות",
            "prompt": "בצעו הרצות ותעדו.",
            "check": "יש לפחות שתי שורות."
        },
        {
            "minutes": "58–68",
            "title": "Outlier",
            "prompt": "האם יש תוצאה חריגה?",
            "check": "זיהוי או נימוק שאין."
        },
        {
            "minutes": "68–78",
            "title": "Final Fix",
            "prompt": "בצעו תיקון אחרון אם צריך.",
            "check": "אחד בלבד."
        },
        {
            "minutes": "78–86",
            "title": "Backup Demo",
            "prompt": "שמרו גרסת סימולטור להצגה.",
            "check": "יש גיבוי."
        },
        {
            "minutes": "86–90",
            "title": "כרטיס יציאה",
            "prompt": "נתון אמין כש...",
            "check": "מזכיר חזרתיות."
        }
    ],
    "deliverable": "Project_RC_G6: טבלת 2–3 הרצות, מסקנת אמינות וגרסת הצגה/גיבוי.",
    "assessment": [
        "יש תוצר ברור לשלב השיעור.",
        "הקוד/המסלול מחובר לשאלת החקר.",
        "יש תיעוד נתונים או ראיה.",
        "יש דיבוג או החלטת בטיחות מנומקת.",
        "הצוות יודע להסביר את הבחירות שלו."
    ],
    "debugging": [
        {
            "problem": "התוצר לא מחובר לשאלת החקר",
            "fix": "מחזירים ל־Blueprint ושואלים איזה נתון נאסף."
        },
        {
            "problem": "הצוות מנסה לשנות הכול",
            "fix": "מכריזים שינוי אחד או Freeze לפי שלב."
        },
        {
            "problem": "אין גיבוי סימולטור",
            "fix": "שומרים Backup לפני הצגה/פיזי."
        },
        {
            "problem": "ההסבר נשמע כמו רשימת בלוקים",
            "fix": "מחזירים למבנה שאלה→נתון→מסקנה."
        }
    ],
    "differentiation": {
        "support": [
            "לתת תבנית כתיבה/טבלה מוכנה.",
            "לאפשר סימולטור במקום הדגמה פיזית.",
            "להציג בזוג או עם כרטיס דיבור."
        ],
        "extension": [
            "להוסיף מדד כמותי.",
            "להוביל משוב עמיתים.",
            "להכין גרסת גיבוי או הצעת שיפור עתידית."
        ]
    },
    "instructorGuide": {
        "prerequisites": "נדרש תוצר מהשלב הקודם בפרויקט. אם אין תוצר, מצמצמים Scope ולא מדלגים קדימה.",
        "pedagogy": [
            "רצף הפרויקט הוא הדרגתי: תכנון, V1, בדיקה, אמינות, הגשה, הצגה.",
            "כל שיעור חייב להוסיף החלטה או תוצר חדש ולא לחזור על אותו מהלך.",
            "להעריך תהליך חקר ובטיחות לא פחות מהדגמת טיסה."
        ],
        "mediaNote": commonInstructorMediaNote,
        "exitTicket": "הפרויקט שלנו התקדם כי ___."
    },
    "videoResources": grade6VideoResources,
    "screenshotSlides": [
        {
            "title": "פותחים תוצר קודם",
            "src": "assets/tello-mission-lab/lesson13/open-app.png",
            "caption": "מתחילים מהגרסה הקודמת ולא מאפס."
        },
        {
            "title": "רצף העבודה של השיעור",
            "src": "assets/tello-mission-lab/lesson13/block-sequence.png",
            "caption": "רצף הבלוקים משקף את מטרת השיעור הספציפית."
        },
        {
            "title": "בדיקה/הצגה מבוקרת",
            "src": "assets/tello-mission-lab/lesson13/simulator-run.png",
            "caption": "בודקים או מציגים לפי נוהל בטיחות."
        },
        {
            "title": "שומרים תוצר שלב",
            "src": "assets/tello-mission-lab/lesson13/save-share.png",
            "caption": "שומרים תוצר שמקדם את הפרויקט לשלב הבא."
        }
    ],
    "instructorSlides": [
        {
            "title": "עבד פעם אחת ≠ אמין",
            "body": "חוקר צריך לבדוק אם התוצאה חוזרת.",
            "bullets": [
                "Run 1",
                "Run 2",
                "Run 3"
            ]
        },
        {
            "title": "מה יציב ומה משתנה?",
            "body": "Run Table הופכת תחושה להשוואה.",
            "bullets": [
                "Consistent",
                "Variable",
                "Outlier"
            ]
        },
        {
            "title": "מקפיאים RC",
            "body": "אחרי Final Fix מפסיקים לשנות ומכינים הצגה.",
            "bullets": [
                "Freeze",
                "Backup",
                "Explain"
            ]
        }
    ]
});

  Object.assign(window.TELLO_MISSION_LAB_LESSONS[13], {
    "title": "שיעור 14: חבילת הגשה — קוד, נתונים והסבר חוקר",
    "subtitle": "מסדרים תוצר, Share Link ותסריט הצגה",
    "concept": "Submission Package, Data Story, Rubric, Research Pitch",
    "story": "הפרויקט כמעט מוכן, אבל עבודה טובה שלא ניתן להבין אינה מוכנה להגשה. הצוותים מסדרים קוד, בוחרים ראיה מרכזית, כותבים הסבר חוקר ומתרגלים Pitch קצר.",
    "mission": "להכין חבילת הגשה: Project_Final, Share Link/צילום, Data Story, רובריקה ותסריט הצגה של 90 שניות.",
    "blocks": [
        "comment",
        "takeoff",
        "project_path",
        "photo",
        "land",
        "share"
    ],
    "essentialQuestion": "איך הופכים פרויקט רחפן לתוצר שאפשר לבדוק, להבין ולהציג?",
    "successCriteria": [
        "אני מסדר/ת את הקוד ושם הגרסה.",
        "אני יוצר/ת Share Link או צילום מסך.",
        "אני בוחר/ת ראיה/נתון מרכזי.",
        "אני כותב/ת Data Story קצרה.",
        "אני מתרגל/ת Pitch של 90 שניות לפי רובריקה."
    ],
    "realWorldUses": [
        {
            "icon": "📦",
            "title": "חבילת הגשה",
            "text": "קוד, נתונים, קישור והסבר במקום אחד."
        },
        {
            "icon": "🔗",
            "title": "Share Link",
            "text": "מאפשר למדריך לבדוק את התוצר."
        },
        {
            "icon": "🎤",
            "title": "Data Story",
            "text": "מסבירים מה השאלה, מה נאסף ומה למדנו."
        }
    ],
    "vocabulary": [
        [
            "Submission Package",
            "חבילת קוד, נתונים והסבר."
        ],
        [
            "Data Story",
            "סיפור קצר שמחבר שאלה לראיה."
        ],
        [
            "Rubric",
            "קריטריוני הערכה."
        ],
        [
            "Pitch",
            "הצגה קצרה."
        ],
        [
            "Backup Demo",
            "הדגמת גיבוי בסימולטור."
        ]
    ],
    "safetyRules": [
        "טיסה פיזית רק באישור מדריך ובתור מוגדר.",
        "משקפי מגן ואזור סטרילי בכל הפעלה פיזית.",
        "מריצים בסימולטור לפני כל הרצה פיזית.",
        "אם יש סטייה, אדם באזור או אי־ודאות — Abort/Land מיד.",
        "לא משנים קוד בזמן הרחפן באוויר."
    ],
    "commonDirections": [
        [
            "Final",
            "גרסה סופית."
        ],
        [
            "Share",
            "קישור/צילום."
        ],
        [
            "Data Story",
            "שאלה→נתון→מסקנה."
        ],
        [
            "Rubric",
            "בדיקה עצמית."
        ],
        [
            "Pitch",
            "הצגה קצרה."
        ]
    ],
    "setupSteps": [
        "פותחים תוצר קודם ובודקים מה נשמר.",
        "מריצים גרסת סימולטור לפני כל שינוי.",
        "מגדירים תפקידים: Driver, Navigator, Observer/Data Recorder.",
        "בודקים סוללה/אזור אם יש הרצה פיזית.",
        "שומרים גרסה בשם ברור ומשתפים או מצלמים תוצר."
    ],
    "tabletTips": [
        "לשמור עותק לפני שינוי משמעותי.",
        "לשנות פרמטר אחד בלבד בכל בדיקה.",
        "Share Link רק ב־WiFi בית ספרי.",
        "לצלם מסך אם שיתוף לא זמין.",
        "לחזור ל־WiFi בית ספרי אחרי עבודה עם Tello WiFi."
    ],
    "lessonFlow": [
        {
            "minutes": "0–8",
            "title": "פותחים RC",
            "teacher": "בודק Project_RC ו־Run Table.",
            "students": "פותחים תוצרים."
        },
        {
            "minutes": "8–18",
            "title": "מה נכנס לחבילת הגשה",
            "teacher": "מציג רשימת חובה: קוד, נתון, קישור, הסבר.",
            "students": "מסמנים חוסרים."
        },
        {
            "minutes": "18–30",
            "title": "Data Story",
            "teacher": "מדגים מבנה: שאלה→נתון→מסקנה→מגבלה.",
            "students": "כותבים טיוטה."
        },
        {
            "minutes": "30–44",
            "title": "סידור קוד ושיתוף",
            "teacher": "מדגים שם גרסה, Comment ו־Share/צילום.",
            "students": "מכינים Project_Final."
        },
        {
            "minutes": "44–58",
            "title": "רובריקה עצמית",
            "teacher": "עובר על קריטריונים.",
            "students": "ממלאים רובריקה."
        },
        {
            "minutes": "58–74",
            "title": "Pitch 90 שניות",
            "teacher": "מלמד מבנה הצגה קצר.",
            "students": "מתרגלים בזוגות."
        },
        {
            "minutes": "74–84",
            "title": "משוב הצגה",
            "teacher": "מוביל משוב אהבתי/שאלה/הצעה.",
            "students": "משפרים נקודה אחת."
        },
        {
            "minutes": "84–90",
            "title": "נעילת תוצר",
            "teacher": "מכריז freeze לקראת Expo.",
            "students": "כרטיס יציאה."
        }
    ],
    "exercises": [
        {
            "minutes": "8–18",
            "title": "רשימת חוסרים",
            "prompt": "מה חסר בחבילת ההגשה?",
            "check": "יש רשימה."
        },
        {
            "minutes": "18–30",
            "title": "Data Story",
            "prompt": "כתבו שאלה→נתון→מסקנה.",
            "check": "יש שלושה חלקים."
        },
        {
            "minutes": "30–44",
            "title": "Share/צילום",
            "prompt": "צרו קישור או צילום מסך.",
            "check": "יש תוצר לבדיקה."
        },
        {
            "minutes": "44–58",
            "title": "רובריקה",
            "prompt": "בדקו את עצמכם.",
            "check": "הרובריקה מלאה."
        },
        {
            "minutes": "58–74",
            "title": "Pitch",
            "prompt": "תרגלו 90 שניות.",
            "check": "כולל דיבוג ובטיחות."
        },
        {
            "minutes": "74–84",
            "title": "משוב",
            "prompt": "קבלו ושפרו נקודה אחת.",
            "check": "השיפור בוצע."
        },
        {
            "minutes": "84–90",
            "title": "כרטיס יציאה",
            "prompt": "בהצגת חקר חייבים להסביר...",
            "check": "מזכיר נתון/מסקנה."
        }
    ],
    "deliverable": "Submission_Package_G6: Project_Final, Share/צילום, Data Story, רובריקה ו־Pitch מתורגל.",
    "assessment": [
        "יש תוצר ברור לשלב השיעור.",
        "הקוד/המסלול מחובר לשאלת החקר.",
        "יש תיעוד נתונים או ראיה.",
        "יש דיבוג או החלטת בטיחות מנומקת.",
        "הצוות יודע להסביר את הבחירות שלו."
    ],
    "debugging": [
        {
            "problem": "התוצר לא מחובר לשאלת החקר",
            "fix": "מחזירים ל־Blueprint ושואלים איזה נתון נאסף."
        },
        {
            "problem": "הצוות מנסה לשנות הכול",
            "fix": "מכריזים שינוי אחד או Freeze לפי שלב."
        },
        {
            "problem": "אין גיבוי סימולטור",
            "fix": "שומרים Backup לפני הצגה/פיזי."
        },
        {
            "problem": "ההסבר נשמע כמו רשימת בלוקים",
            "fix": "מחזירים למבנה שאלה→נתון→מסקנה."
        }
    ],
    "differentiation": {
        "support": [
            "לתת תבנית כתיבה/טבלה מוכנה.",
            "לאפשר סימולטור במקום הדגמה פיזית.",
            "להציג בזוג או עם כרטיס דיבור."
        ],
        "extension": [
            "להוסיף מדד כמותי.",
            "להוביל משוב עמיתים.",
            "להכין גרסת גיבוי או הצעת שיפור עתידית."
        ]
    },
    "instructorGuide": {
        "prerequisites": "נדרש תוצר מהשלב הקודם בפרויקט. אם אין תוצר, מצמצמים Scope ולא מדלגים קדימה.",
        "pedagogy": [
            "רצף הפרויקט הוא הדרגתי: תכנון, V1, בדיקה, אמינות, הגשה, הצגה.",
            "כל שיעור חייב להוסיף החלטה או תוצר חדש ולא לחזור על אותו מהלך.",
            "להעריך תהליך חקר ובטיחות לא פחות מהדגמת טיסה."
        ],
        "mediaNote": commonInstructorMediaNote,
        "exitTicket": "הפרויקט שלנו התקדם כי ___."
    },
    "videoResources": grade6VideoResources,
    "screenshotSlides": [
        {
            "title": "פותחים תוצר קודם",
            "src": "assets/tello-mission-lab/lesson14/open-app.png",
            "caption": "מתחילים מהגרסה הקודמת ולא מאפס."
        },
        {
            "title": "רצף העבודה של השיעור",
            "src": "assets/tello-mission-lab/lesson14/block-sequence.png",
            "caption": "רצף הבלוקים משקף את מטרת השיעור הספציפית."
        },
        {
            "title": "בדיקה/הצגה מבוקרת",
            "src": "assets/tello-mission-lab/lesson14/simulator-run.png",
            "caption": "בודקים או מציגים לפי נוהל בטיחות."
        },
        {
            "title": "שומרים תוצר שלב",
            "src": "assets/tello-mission-lab/lesson14/save-share.png",
            "caption": "שומרים תוצר שמקדם את הפרויקט לשלב הבא."
        }
    ],
    "instructorSlides": [
        {
            "title": "קוד שאפשר לבדוק",
            "body": "שם גרסה, Comment ו־Share הופכים עבודה לתוצר.",
            "bullets": [
                "Project_Final",
                "Comment",
                "Share"
            ]
        },
        {
            "title": "Data Story",
            "body": "הצגה טובה מחברת שאלה, נתון ומסקנה.",
            "bullets": [
                "Question",
                "Evidence",
                "Conclusion"
            ]
        },
        {
            "title": "90 שניות",
            "body": "הצוות מתאמן על Pitch קצר וממוקד.",
            "bullets": [
                "מטרה",
                "דיבוג",
                "בטיחות"
            ]
        }
    ]
});

  Object.assign(window.TELLO_MISSION_LAB_LESSONS[14], {
    "title": "שיעור 15: Mission Lab Expo — מציגים משימת חקר רחפן",
    "subtitle": "אירוע שיא: הדגמה בטוחה, משוב ורפלקציה",
    "concept": "Showcase, Safe Demo, Peer Review, Reflection",
    "story": "יום התערוכה הגיע. ההצלחה אינה רק טיסה יפה: כל צוות מציג בעיית חקר, תוכנית טיסה, ראיה שנאספה, באג שתוקן והחלטת בטיחות אחת.",
    "mission": "להציג Pitch, לבצע הדגמת סימולטור או פיזית באישור, לקבל משוב עמיתים ולכתוב רפלקציה אישית על למידת חקר רחפנים.",
    "blocks": [
        "safety_check",
        "takeoff",
        "project_path",
        "photo",
        "land"
    ],
    "essentialQuestion": "איך מציגים פתרון חקר טכנולוגי בצורה בטוחה, ברורה ומשכנעת?",
    "successCriteria": [
        "אני מציג/ה שאלה, קוד, נתון ודיבוג.",
        "אני מדגים/ה רק לפי נוהל בטיחות.",
        "אני משתמש/ת בגרסת גיבוי אם הפיזי לא מתאים.",
        "אני נותן/ת משוב מכבד לצוות אחר.",
        "אני כותב/ת רפלקציה על מה למדתי."
    ],
    "realWorldUses": [
        {
            "icon": "🏁",
            "title": "Showcase",
            "text": "חוגגים תהליך חקר ולא רק ביצוע."
        },
        {
            "icon": "🛡️",
            "title": "Safe Demo",
            "text": "החלטה להציג סימולטור יכולה להיות מקצועית."
        },
        {
            "icon": "🤝",
            "title": "Peer Review",
            "text": "משוב עמיתים משפר חשיבה הנדסית."
        }
    ],
    "vocabulary": [
        [
            "Showcase",
            "אירוע הצגת תוצרים."
        ],
        [
            "Safe Demo",
            "הדגמה בטוחה או סימולטור גיבוי."
        ],
        [
            "Peer Review",
            "משוב עמיתים."
        ],
        [
            "Reflection",
            "רפלקציה אישית."
        ],
        [
            "Engineering Story",
            "סיפור הבעיה, הפתרון והדיבוג."
        ]
    ],
    "safetyRules": [
        "טיסה פיזית רק באישור מדריך ובתור מוגדר.",
        "משקפי מגן ואזור סטרילי בכל הפעלה פיזית.",
        "מריצים בסימולטור לפני כל הרצה פיזית.",
        "אם יש סטייה, אדם באזור או אי־ודאות — Abort/Land מיד.",
        "לא משנים קוד בזמן הרחפן באוויר."
    ],
    "commonDirections": [
        [
            "Pitch",
            "הצגת 90 שניות."
        ],
        [
            "Demo",
            "הדגמה בטוחה."
        ],
        [
            "Feedback",
            "משוב מכבד."
        ],
        [
            "Reflection",
            "מה למדתי."
        ],
        [
            "Closure",
            "סיכום קורס."
        ]
    ],
    "setupSteps": [
        "פותחים תוצר קודם ובודקים מה נשמר.",
        "מריצים גרסת סימולטור לפני כל שינוי.",
        "מגדירים תפקידים: Driver, Navigator, Observer/Data Recorder.",
        "בודקים סוללה/אזור אם יש הרצה פיזית.",
        "שומרים גרסה בשם ברור ומשתפים או מצלמים תוצר."
    ],
    "tabletTips": [
        "לשמור עותק לפני שינוי משמעותי.",
        "לשנות פרמטר אחד בלבד בכל בדיקה.",
        "Share Link רק ב־WiFi בית ספרי.",
        "לצלם מסך אם שיתוף לא זמין.",
        "לחזור ל־WiFi בית ספרי אחרי עבודה עם Tello WiFi."
    ],
    "lessonFlow": [
        {
            "minutes": "0–10",
            "title": "פתיחת Expo וכללי בטיחות",
            "teacher": "מציג סדר הצגות, זמן, משוב ונוהל הדגמות.",
            "students": "פותחים Final ו־Backup."
        },
        {
            "minutes": "10–18",
            "title": "חימום Pitch",
            "teacher": "מזכיר מבנה: שאלה, קוד, נתון, דיבוג, בטיחות.",
            "students": "מתרגלים משפט פתיחה."
        },
        {
            "minutes": "18–58",
            "title": "הצגות והדגמות",
            "teacher": "מנהל זמן ואישורי הדגמה.",
            "students": "מציגים לפי תור."
        },
        {
            "minutes": "58–68",
            "title": "משוב עמיתים",
            "teacher": "מוביל אהבתי/שאלה/הצעה.",
            "students": "נותנים משוב מכבד."
        },
        {
            "minutes": "68–78",
            "title": "גלריית ממצאים",
            "teacher": "מבקש מכל צוות לפרסם ממצא אחד.",
            "students": "כותבים ממצא על הלוח."
        },
        {
            "minutes": "78–86",
            "title": "רפלקציה אישית",
            "teacher": "שואל מה השתנה מהשיעור הראשון.",
            "students": "כותבים רפלקציה."
        },
        {
            "minutes": "86–90",
            "title": "סגירת קורס",
            "teacher": "מסכם: רחפן הוא כלי חקר כשקוד, נתונים ובטיחות עובדים יחד.",
            "students": "משפט סיום."
        }
    ],
    "exercises": [
        {
            "minutes": "10–18",
            "title": "משפט פתיחה",
            "prompt": "נסחו משפט שמתחיל: “חקרנו...”",
            "check": "יש שאלה/בעיה."
        },
        {
            "minutes": "18–58",
            "title": "Pitch",
            "prompt": "הציגו שאלה, קוד, נתון ודיבוג.",
            "check": "עומד בזמן."
        },
        {
            "minutes": "18–58",
            "title": "Demo בטוח",
            "prompt": "הציגו סימולטור או פיזי באישור.",
            "check": "אין אלתור."
        },
        {
            "minutes": "58–68",
            "title": "משוב עמיתים",
            "prompt": "תנו מחמאה, שאלה והצעה.",
            "check": "מכבד וממוקד."
        },
        {
            "minutes": "68–78",
            "title": "ממצא מרכזי",
            "prompt": "כתבו ממצא אחד מהפרויקט.",
            "check": "ממצא ולא רק פעולה."
        },
        {
            "minutes": "78–86",
            "title": "רפלקציה",
            "prompt": "מה למדתם על קוד כמשימת חקר?",
            "check": "תובנה אישית."
        },
        {
            "minutes": "86–90",
            "title": "משפט סיום",
            "prompt": "Mission Lab לימד אותי ש...",
            "check": "מחבר חקר/בטיחות/קוד."
        }
    ],
    "deliverable": "Mission_Lab_Expo: הצגה, הדגמה בטוחה/סימולטור, משוב עמיתים ורפלקציה אישית.",
    "assessment": [
        "יש תוצר ברור לשלב השיעור.",
        "הקוד/המסלול מחובר לשאלת החקר.",
        "יש תיעוד נתונים או ראיה.",
        "יש דיבוג או החלטת בטיחות מנומקת.",
        "הצוות יודע להסביר את הבחירות שלו."
    ],
    "debugging": [
        {
            "problem": "התוצר לא מחובר לשאלת החקר",
            "fix": "מחזירים ל־Blueprint ושואלים איזה נתון נאסף."
        },
        {
            "problem": "הצוות מנסה לשנות הכול",
            "fix": "מכריזים שינוי אחד או Freeze לפי שלב."
        },
        {
            "problem": "אין גיבוי סימולטור",
            "fix": "שומרים Backup לפני הצגה/פיזי."
        },
        {
            "problem": "ההסבר נשמע כמו רשימת בלוקים",
            "fix": "מחזירים למבנה שאלה→נתון→מסקנה."
        }
    ],
    "differentiation": {
        "support": [
            "לתת תבנית כתיבה/טבלה מוכנה.",
            "לאפשר סימולטור במקום הדגמה פיזית.",
            "להציג בזוג או עם כרטיס דיבור."
        ],
        "extension": [
            "להוסיף מדד כמותי.",
            "להוביל משוב עמיתים.",
            "להכין גרסת גיבוי או הצעת שיפור עתידית."
        ]
    },
    "instructorGuide": {
        "prerequisites": "נדרש תוצר מהשלב הקודם בפרויקט. אם אין תוצר, מצמצמים Scope ולא מדלגים קדימה.",
        "pedagogy": [
            "רצף הפרויקט הוא הדרגתי: תכנון, V1, בדיקה, אמינות, הגשה, הצגה.",
            "כל שיעור חייב להוסיף החלטה או תוצר חדש ולא לחזור על אותו מהלך.",
            "להעריך תהליך חקר ובטיחות לא פחות מהדגמת טיסה."
        ],
        "mediaNote": commonInstructorMediaNote,
        "exitTicket": "הפרויקט שלנו התקדם כי ___."
    },
    "videoResources": grade6VideoResources,
    "screenshotSlides": [
        {
            "title": "פותחים תוצר קודם",
            "src": "assets/tello-mission-lab/lesson15/open-app.png",
            "caption": "מתחילים מהגרסה הקודמת ולא מאפס."
        },
        {
            "title": "רצף העבודה של השיעור",
            "src": "assets/tello-mission-lab/lesson15/block-sequence.png",
            "caption": "רצף הבלוקים משקף את מטרת השיעור הספציפית."
        },
        {
            "title": "בדיקה/הצגה מבוקרת",
            "src": "assets/tello-mission-lab/lesson15/simulator-run.png",
            "caption": "בודקים או מציגים לפי נוהל בטיחות."
        },
        {
            "title": "שומרים תוצר שלב",
            "src": "assets/tello-mission-lab/lesson15/save-share.png",
            "caption": "שומרים תוצר שמקדם את הפרויקט לשלב הבא."
        }
    ],
    "instructorSlides": [
        {
            "title": "מציגים תהליך, לא רק תוצאה",
            "body": "פרויקט טוב מספר איך חשבנו, בדקנו ותיקנו.",
            "bullets": [
                "Question",
                "Code",
                "Evidence"
            ]
        },
        {
            "title": "בטיחות גם ביום חגיגי",
            "body": "אין אלתור באירוע שיא; סימולטור הוא גיבוי מכובד.",
            "bullets": [
                "Approve",
                "Demo",
                "Backup"
            ]
        },
        {
            "title": "רפלקציה",
            "body": "התלמידים מסכמים איך קוד הפך לכלי חקר.",
            "bullets": [
                "Learned",
                "Improved",
                "Next"
            ]
        }
    ]
});

  // HYBRID_MODEL_GRADE6_LESSONS_6_15_QUALITY_REWRITE_END

  window.getTelloMissionLabLesson = function (id) {
    const numeric = Number(id) || 1;
    return window.TELLO_MISSION_LAB_LESSONS.find(l => l.id === numeric) || window.TELLO_MISSION_LAB_LESSONS[0];
  };
})();
