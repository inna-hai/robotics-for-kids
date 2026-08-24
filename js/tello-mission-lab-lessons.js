(function () {
  const unitNames = {
    launch: 'יחידה 1 — מרכז חקר וסימולטור',
    survey: 'יחידה 2 — סריקות שטח וגבהים',
    camera: 'יחידה 3 — איסוף מידע חזותי',
    pads: 'יחידה 4 — Mission Pads ותחנות חקר',
    project: 'יחידה 5 — פרויקט חקר מסכם'
  };

  const blockLabels = {
    safety_check: 'Safety Check — בדיקת בטיחות', takeoff: 'Takeoff — המראה', hover: 'Hover 5 sec — ריחוף 5 שניות', land: 'Land — נחיתה', up_100: 'Go Up 2.5m — עליה לגובה 2.5 מטר', down_50: 'Go Down 1.25m — ירידה 1.25 מטר', yaw_360: 'Yaw Right 360° — סיבוב מלא', forward: 'Forward — קדימה', back: 'Back — אחורה', right: 'Right — ימינה', left: 'Left — שמאלה', photo: 'Take Photo — צילום', wait: 'Wait — המתנה', repeat_scan: 'Repeat Scan — סריקה חוזרת', grid_scan: 'Grid Scan — סריקת גריד', go_pad: 'Go to Mission Pad — גישה לפד', hover_data: 'Hover for Data — ריחוף לאיסוף נתונים', comment: 'Comment — הערה', share: 'Share Mission — שיתוף משימה', abort: 'Abort — עצירת חירום'
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
    "title": "שיעור 8: צילום ראיות — מצלמה ככלי נתונים",
    "subtitle": "מתכנון מסלול לאיסוף ראיה חזותית משמעותית",
    "concept": "Take Photo, Evidence Quality, Camera Angle, Data Annotation",
    "story": "אחרי שכיסינו שטח בגריד, עולה השאלה: מה באמת מצאנו? הרחפן צריך להגיע לנקודת עניין, לצלם ראיה, ולהסביר למה הצילום עוזר לחוקר לקבל החלטה.",
    "mission": "לבנות Evidence Flight: Takeoff → Forward → Hover → Take Photo → Land, להשוות צילום/תצפית משני גבהים או מרחקים ולבחור ראיה טובה יותר.",
    "blocks": [
        "safety_check",
        "takeoff",
        "forward",
        "hover",
        "photo",
        "land"
    ],
    "essentialQuestion": "מה הופך צילום רחפן לראיה חקרית ולא רק לתמונה יפה?",
    "successCriteria": [
        "אני מגדיר/ה מה הצילום אמור להוכיח.",
        "אני ממקם/ת Take Photo אחרי Hover יציב.",
        "אני משווה שתי אפשרויות צילום.",
        "אני מוסיף/ה Annotation קצרה לתמונה/תצפית.",
        "אני מסביר/ה מגבלת איכות אחת."
    ],
    "realWorldUses": [
        {
            "icon": "📷",
            "title": "ראיות חזותיות",
            "text": "צילום יכול להוכיח נזק, מיקום או שינוי."
        },
        {
            "icon": "🔍",
            "title": "איכות תצפית",
            "text": "גובה וזווית משפיעים על מה שאפשר ללמוד."
        },
        {
            "icon": "📝",
            "title": "Annotation",
            "text": "תמונה בלי הסבר עלולה לא להיות נתון שימושי."
        }
    ],
    "vocabulary": [
        [
            "Evidence",
            "ראיה שתומכת במסקנה."
        ],
        [
            "Annotation",
            "הערה שמסבירה מה רואים בתמונה."
        ],
        [
            "Camera Angle",
            "זווית צילום."
        ],
        [
            "Image Quality",
            "עד כמה התמונה מועילה לחקר."
        ],
        [
            "Comparison",
            "השוואה בין שתי אפשרויות צילום."
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
            "Hover",
            "ייצוב לפני צילום."
        ],
        [
            "Photo",
            "צילום נקודת עניין."
        ],
        [
            "Angle",
            "זווית/מבט."
        ],
        [
            "Evidence",
            "מה הצילום מוכיח."
        ],
        [
            "Annotation",
            "הסבר לתמונה."
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
            "title": "מהכיסוי לראיה",
            "teacher": "מחבר את Coverage Map לשאלה מה מצאנו בכל תא.",
            "students": "בוחרים תא/POI לצילום."
        },
        {
            "minutes": "8–18",
            "title": "צילום הוא טענה",
            "teacher": "מציג דוגמה: “התמונה מוכיחה ש...”",
            "students": "מנסחים טענת צילום."
        },
        {
            "minutes": "18–30",
            "title": "איכות ראיה",
            "teacher": "מסביר גובה, מרחק, יציבות וזווית.",
            "students": "מגדירים קריטריון לתמונה טובה."
        },
        {
            "minutes": "30–48",
            "title": "Evidence Flight",
            "teacher": "מדגים Hover לפני Photo.",
            "students": "בונים ומריצים בסימולטור."
        },
        {
            "minutes": "48–62",
            "title": "השוואת שתי גרסאות",
            "teacher": "מבקש לשנות גובה/מרחק אחד בלבד.",
            "students": "מריצים גרסה B."
        },
        {
            "minutes": "62–76",
            "title": "Annotation",
            "teacher": "מדגים כיתוב קצר לראיה.",
            "students": "כותבים הערה לתמונה/תצפית."
        },
        {
            "minutes": "76–86",
            "title": "בחירת ראיה טובה",
            "teacher": "מוביל דיון: איזו גרסה עוזרת יותר לחוקר?",
            "students": "בוחרים ומנמקים."
        },
        {
            "minutes": "86–90",
            "title": "סיכום",
            "teacher": "מחבר לשיעור 9: מה עושים כשאילוץ משנה את הצילום?",
            "students": "כרטיס יציאה."
        }
    ],
    "exercises": [
        {
            "minutes": "8–18",
            "title": "טענת צילום",
            "prompt": "כתבו מה הצילום אמור להוכיח.",
            "check": "יש טענה חקרית."
        },
        {
            "minutes": "18–30",
            "title": "קריטריון איכות",
            "prompt": "בחרו קריטריון: חדות/מרחק/זווית/כיסוי.",
            "check": "הקריטריון מתאים."
        },
        {
            "minutes": "30–48",
            "title": "Evidence Flight",
            "prompt": "בנו Takeoff → Forward → Hover → Photo → Land.",
            "check": "Photo אחרי Hover."
        },
        {
            "minutes": "48–62",
            "title": "גרסה B",
            "prompt": "שנו גובה או מרחק אחד והשוו.",
            "check": "שינוי אחד בלבד."
        },
        {
            "minutes": "62–76",
            "title": "Annotation",
            "prompt": "כתבו כיתוב ראיה בן משפט אחד.",
            "check": "הכיתוב מסביר מה רואים."
        },
        {
            "minutes": "76–86",
            "title": "בחירת ראיה",
            "prompt": "איזו גרסה טובה יותר לחוקר ולמה?",
            "check": "נימוק לפי קריטריון."
        },
        {
            "minutes": "86–90",
            "title": "כרטיס יציאה",
            "prompt": "צילום הופך לנתון כאשר...",
            "check": "מזכיר טענה/הסבר/השוואה."
        }
    ],
    "deliverable": "Evidence_Flight_G6: רצף צילום, השוואת שתי גרסאות ו־Annotation לראיה הנבחרת.",
    "assessment": [
        "Take Photo ממוקם אחרי Hover.",
        "יש טענת צילום לפני ההרצה.",
        "יש השוואה בין שתי גרסאות.",
        "Annotation מסביר את הראיה.",
        "התלמיד מזהה מגבלת איכות אחת."
    ],
    "debugging": [
        {
            "problem": "צילום בלי מטרה",
            "fix": "דורשים משפט: התמונה אמורה להוכיח ש..."
        },
        {
            "problem": "Photo לפני יציבות",
            "fix": "מוסיפים Hover לפני Photo."
        },
        {
            "problem": "משנים גם גובה וגם מרחק",
            "fix": "חוזרים לשינוי אחד להשוואה תקינה."
        },
        {
            "problem": "הכיתוב מתאר ולא מסיק",
            "fix": "מוסיפים משמעות: לכן אנחנו חושבים ש..."
        }
    ],
    "differentiation": {
        "support": [
            "לתת תבנית Annotation.",
            "להשוות שתי תמונות תאורטיות במקום הרצה פיזית.",
            "להשתמש בקריטריון איכות אחד בלבד."
        ],
        "extension": [
            "להוסיף טבלת Evidence Quality.",
            "לבנות שתי זוויות צילום בסימולטור.",
            "לנסח מגבלת אמינות לתמונה."
        ]
    },
    "instructorGuide": {
        "prerequisites": "נדרש שיעור 7: הבנת כיסוי שטח. שיעור 8 מוסיף שכבת ראיה חזותית לתא/נקודה שנבחרה.",
        "pedagogy": [
            "השיעור מחדד שהנתון אינו הטיסה אלא המידע שנאסף.",
            "חשוב לא להפוך את Photo לבלוק “קישוט”.",
            "השוואה בין שתי גרסאות מפתחת חשיבה מחקרית אמיתית."
        ],
        "mediaNote": commonInstructorMediaNote,
        "exitTicket": "צילום הופך לראיה כש___."
    },
    "videoResources": grade6VideoResources,
    "screenshotSlides": [
        {
            "title": "פותחים נקודת צילום",
            "src": "assets/tello-mission-lab/lesson8/open-app.png",
            "caption": "מגדירים מראש מה הצילום צריך להוכיח."
        },
        {
            "title": "רצף Evidence Flight",
            "src": "assets/tello-mission-lab/lesson8/block-sequence.png",
            "caption": "Hover לפני Photo מייצב את הראיה."
        },
        {
            "title": "משווים איכות ראיה",
            "src": "assets/tello-mission-lab/lesson8/simulator-run.png",
            "caption": "משווים שינוי אחד בגובה או מרחק."
        },
        {
            "title": "שומרים Annotation",
            "src": "assets/tello-mission-lab/lesson8/save-share.png",
            "caption": "שומרים צילום/תצפית עם הסבר חוקר."
        }
    ],
    "instructorSlides": [
        {
            "title": "תמונה היא טענה",
            "body": "לפני הצילום שואלים: מה התמונה אמורה להוכיח?",
            "bullets": [
                "Claim",
                "Evidence",
                "Limit"
            ]
        },
        {
            "title": "Hover לפני Photo",
            "body": "צילום טוב מתחיל ביציבות ולא במהירות.",
            "bullets": [
                "Stabilize",
                "Capture",
                "Explain"
            ]
        },
        {
            "title": "Annotation",
            "body": "הכיתוב הופך תמונה לנתון שאפשר לבדוק.",
            "bullets": [
                "מה רואים",
                "למה זה חשוב",
                "מה המגבלה"
            ]
        }
    ]
});

  Object.assign(window.TELLO_MISSION_LAB_LESSONS[8], {
    "title": "שיעור 9: אילוצים דינמיים — מזג אוויר, סוללה ומטרה שזזה",
    "subtitle": "קבלת החלטות: שינוי משימה בלי לאבד בטיחות או מטרת חקר",
    "concept": "Constraints, Fallback Plan, Abort/Land, Mission Replanning",
    "story": "במהלך משימת צילום מתברר שהמטרה זזה, הסוללה ירדה ויש “רוח” בכיתה מהמזגן. צוות מקצועי לא מאלתר: הוא מפעיל תוכנית גיבוי, מקצר מסלול או מחליט לנחות.",
    "mission": "לקבל כרטיס אילוץ, לעדכן משימת חקר קיימת בפרמטר אחד, ולבנות Fallback קצר שמסתיים ב־Abort/Land בטוח.",
    "blocks": [
        "safety_check",
        "takeoff",
        "repeat_scan",
        "hover_data",
        "abort",
        "land"
    ],
    "essentialQuestion": "איך משנים משימה כשמשהו משתבש בלי להפוך את הפתרון למסוכן?",
    "successCriteria": [
        "אני מזהה אילוץ מסוג סוללה/רוח/מטרה זזה.",
        "אני בוחר/ת תגובה בטוחה: קיצור, שינוי נקודה או Abort.",
        "אני משנה רק פרמטר אחד או שלב אחד.",
        "אני שומר/ת גרסת Fallback.",
        "אני מסביר/ה למה נחיתה יכולה להיות הצלחה הנדסית."
    ],
    "realWorldUses": [
        {
            "icon": "🌬️",
            "title": "רוח ומזג אוויר",
            "text": "אילוץ סביבתי משנה החלטות טיסה."
        },
        {
            "icon": "🔋",
            "title": "סוללה נמוכה",
            "text": "חזרה מוקדמת יכולה להציל ציוד ומשימה."
        },
        {
            "icon": "🚨",
            "title": "Abort מקצועי",
            "text": "עצירה בזמן היא חלק מתכנון בטוח."
        }
    ],
    "vocabulary": [
        [
            "Constraint",
            "אילוץ שמשנה את תנאי המשימה."
        ],
        [
            "Fallback Plan",
            "תוכנית גיבוי קצרה ובטוחה."
        ],
        [
            "Abort",
            "עצירת משימה כאשר הסיכון עולה."
        ],
        [
            "Replanning",
            "תכנון מחדש של חלק מהמשימה."
        ],
        [
            "Decision Point",
            "רגע שבו בוחרים להמשיך, לקצר או לנחות."
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
            "Constraint Card",
            "כרטיס אילוץ."
        ],
        [
            "Fallback",
            "גרסת גיבוי."
        ],
        [
            "Abort",
            "עצירה מקצועית."
        ],
        [
            "Shorten",
            "קיצור מסלול."
        ],
        [
            "Decision",
            "החלטת צוות."
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
            "title": "מה קורה לראיה כשמשהו משתבש",
            "teacher": "מחבר לשיעור 8: צילום טוב תלוי בתנאים.",
            "students": "פותחים Evidence Flight."
        },
        {
            "minutes": "8–20",
            "title": "כרטיסי אילוץ",
            "teacher": "מחלק תרחישים: סוללה, רוח, מטרה זזה, אזור חסום.",
            "students": "קוראים אילוץ ומסמנים סיכון."
        },
        {
            "minutes": "20–32",
            "title": "Decision Point",
            "teacher": "מציג שלוש תגובות: להמשיך, לקצר, לנחות.",
            "students": "בוחרים תגובה ומנמקים."
        },
        {
            "minutes": "32–48",
            "title": "בניית Fallback",
            "teacher": "מדגים גרסה קצרה עם Abort/Land.",
            "students": "בונים גרסת גיבוי."
        },
        {
            "minutes": "48–62",
            "title": "הרצת תרחיש",
            "teacher": "בודק שהשינוי אחד בלבד ושיש Land.",
            "students": "מריצים בסימולטור."
        },
        {
            "minutes": "62–74",
            "title": "יומן החלטות",
            "teacher": "מנחה כתיבה: אילוץ → החלטה → סיבה.",
            "students": "ממלאים Decision Log."
        },
        {
            "minutes": "74–84",
            "title": "תחקיר קצר",
            "teacher": "שואל מתי נחיתה היא הצלחה.",
            "students": "משתפים החלטה בטוחה."
        },
        {
            "minutes": "84–90",
            "title": "סיכום",
            "teacher": "מחבר לשיעור 10: Blueprint חייב לכלול סיכונים מראש.",
            "students": "כרטיס יציאה."
        }
    ],
    "exercises": [
        {
            "minutes": "8–20",
            "title": "כרטיס אילוץ",
            "prompt": "זהו מה השתנה ומה הסיכון.",
            "check": "האילוץ מוגדר."
        },
        {
            "minutes": "20–32",
            "title": "Decision Point",
            "prompt": "בחרו: להמשיך, לקצר או לנחות.",
            "check": "יש נימוק בטיחותי."
        },
        {
            "minutes": "32–48",
            "title": "Fallback",
            "prompt": "בנו גרסת גיבוי קצרה עם Abort/Land.",
            "check": "יש סיום בטוח."
        },
        {
            "minutes": "48–62",
            "title": "הרצת תרחיש",
            "prompt": "הריצו בסימולטור ובדקו שהמשימה קצרה יותר.",
            "check": "השינוי אחד."
        },
        {
            "minutes": "62–74",
            "title": "Decision Log",
            "prompt": "כתבו אילוץ → החלטה → סיבה.",
            "check": "היומן מלא."
        },
        {
            "minutes": "74–84",
            "title": "תחקיר",
            "prompt": "מתי Abort הוא החלטה מקצועית?",
            "check": "התשובה לא מציגה Abort ככישלון."
        },
        {
            "minutes": "84–90",
            "title": "כרטיס יציאה",
            "prompt": "כשאילוץ מופיע, קודם...",
            "check": "מזכיר בטיחות/החלטה."
        }
    ],
    "deliverable": "Fallback_Mission_G6: גרסת גיבוי קצרה + Decision Log של אילוץ, החלטה וסיבה.",
    "assessment": [
        "האילוץ מזוהה נכון.",
        "התגובה מתאימה לסיכון.",
        "Fallback קצר ובטוח.",
        "Abort/Land מופיע כשצריך.",
        "החלטת הצוות מנומקת ומתועדת."
    ],
    "debugging": [
        {
            "problem": "התלמידים מוסיפים עוד בלוקים במקום לקצר",
            "fix": "מגדירים כלל: Fallback חייב להיות קצר מהמקור."
        },
        {
            "problem": "Abort נתפס ככישלון",
            "fix": "מנסחים: Abort הוא הצלחת בטיחות."
        },
        {
            "problem": "האילוץ לא משפיע על הקוד",
            "fix": "דורשים שינוי אחד ברור."
        },
        {
            "problem": "אין תיעוד החלטה",
            "fix": "לא מריצים לפני Decision Log."
        }
    ],
    "differentiation": {
        "support": [
            "לתת שלושה כרטיסי אילוץ מוכנים.",
            "לבחור תגובה מתוך אפשרויות.",
            "לבנות Fallback מ־3 בלוקים בלבד."
        ],
        "extension": [
            "להוסיף שני Decision Points.",
            "להשוות שתי תגובות לאותו אילוץ.",
            "לנסח כלל בטיחות לפרויקט הגמר."
        ]
    },
    "instructorGuide": {
        "prerequisites": "נדרש שיעור 8: משימת צילום/ראיה. שיעור 9 מלמד מה עושים כשהתנאים משתנים.",
        "pedagogy": [
            "השיעור מלמד שגמישות אינה אלתור — היא החלטה מתועדת.",
            "חשוב לחזק שנחיתה בטוחה יכולה להיות תוצאה מצוינת.",
            "זה שיעור מפתח לפני Blueprint כי הוא מכניס סיכונים לתכנון מראש."
        ],
        "mediaNote": commonInstructorMediaNote,
        "exitTicket": "Fallback טוב הוא ___."
    },
    "videoResources": grade6VideoResources,
    "screenshotSlides": [
        {
            "title": "פותחים תרחיש אילוץ",
            "src": "assets/tello-mission-lab/lesson9/open-app.png",
            "caption": "מתחילים ממשימה קיימת ומוסיפים אילוץ."
        },
        {
            "title": "בונים Fallback",
            "src": "assets/tello-mission-lab/lesson9/block-sequence.png",
            "caption": "גרסת גיבוי קצרה עם סיום בטוח."
        },
        {
            "title": "מריצים Decision Point",
            "src": "assets/tello-mission-lab/lesson9/simulator-run.png",
            "caption": "בודקים אם ההחלטה מתאימה לסיכון."
        },
        {
            "title": "שומרים Decision Log",
            "src": "assets/tello-mission-lab/lesson9/save-share.png",
            "caption": "שומרים אילוץ, החלטה וסיבה."
        }
    ],
    "instructorSlides": [
        {
            "title": "אילוץ אינו הפתעה — הוא חלק מהתכנון",
            "body": "סוללה, רוח ומטרה זזה משנים החלטות אבל לא מבטלים בטיחות.",
            "bullets": [
                "Constraint",
                "Risk",
                "Decision"
            ]
        },
        {
            "title": "שלוש תגובות מקצועיות",
            "body": "ממשיכים, מקצרים או נוחתים — אבל מנמקים.",
            "bullets": [
                "Continue",
                "Shorten",
                "Abort/Land"
            ]
        },
        {
            "title": "Decision Log",
            "body": "ההחלטה עצמה היא תוצר הנדסי.",
            "bullets": [
                "אילוץ",
                "החלטה",
                "סיבה"
            ]
        }
    ]
});

  Object.assign(window.TELLO_MISSION_LAB_LESSONS[9], {
    "title": "שיעור 10: Blueprint — תכנון פרויקט חקר מסכם",
    "subtitle": "מבעיה אמיתית למסמך תכנון לפני פיתוח",
    "concept": "Research Blueprint, Success Criteria, Data Plan, Risk Plan, Prototype Scope",
    "story": "אחרי שלמדנו קו, גריד, צילום ואילוצים, הצוותים בוחרים בעיית חקר משלהם. לפני שהם כותבים קוד, הם צריכים להגדיר מה הבעיה, אילו נתונים יאספו, מה ייחשב הצלחה ומה הסיכון המרכזי.",
    "mission": "להכין Blueprint לפרויקט חקר: בעיה, שאלת חקר, נתונים, מסלול ראשוני, סיכונים, Fallback ו־Prototype קצר בסימולטור.",
    "blocks": [
        "comment",
        "takeoff",
        "grid_scan",
        "photo",
        "land",
        "share"
    ],
    "essentialQuestion": "איך מתכננים פרויקט רחפן כך שהקוד ישרת שאלת חקר ולא רק מסלול יפה?",
    "successCriteria": [
        "אני מנסח/ת שאלת חקר ברורה.",
        "אני מגדיר/ה איזה נתון הרחפן יאסוף.",
        "אני בוחר/ת מסלול ראשוני שמתאים לנתון.",
        "אני כותב/ת סיכון ו־Fallback.",
        "אני בונה Prototype קצר בלבד."
    ],
    "realWorldUses": [
        {
            "icon": "📋",
            "title": "אפיון פרויקט",
            "text": "פרויקט טוב מתחיל במסמך קצר לפני קוד."
        },
        {
            "icon": "🎯",
            "title": "קריטריוני הצלחה",
            "text": "מגדירים מראש איך יודעים שהמשימה הצליחה."
        },
        {
            "icon": "🛡️",
            "title": "Risk Plan",
            "text": "סיכון ידוע מראש מקבל תגובה מראש."
        }
    ],
    "vocabulary": [
        [
            "Blueprint",
            "מסמך תכנון קצר לפרויקט."
        ],
        [
            "Research Question",
            "שאלת חקר שהמשימה עונה עליה."
        ],
        [
            "Success Criteria",
            "איך נדע שהצלחנו."
        ],
        [
            "Data Plan",
            "איזה מידע נאסוף ואיך."
        ],
        [
            "Prototype Scope",
            "החלק הקטן הראשון שנבנה."
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
            "Problem",
            "בעיה אמיתית."
        ],
        [
            "Question",
            "שאלת חקר."
        ],
        [
            "Data",
            "נתונים לאיסוף."
        ],
        [
            "Risk",
            "סיכון ו־Fallback."
        ],
        [
            "Prototype",
            "גרסה קצרה."
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
            "title": "סיכום מיומנויות 6–9",
            "teacher": "ממפה על הלוח: קו, גריד, צילום, אילוץ.",
            "students": "בוחרים שתי מיומנויות לפרויקט."
        },
        {
            "minutes": "8–20",
            "title": "בחירת בעיית חקר",
            "teacher": "מציע תרחישים: חוף, חממה, שריפה, מאדים, קווי מתח.",
            "students": "בוחרים בעיה ושאלת חקר."
        },
        {
            "minutes": "20–32",
            "title": "Data Plan",
            "teacher": "שואל: איזה נתון יוכיח משהו?",
            "students": "מגדירים נתון/ראיה."
        },
        {
            "minutes": "32–44",
            "title": "מסלול וקריטריונים",
            "teacher": "מנחה התאמה בין מסלול לנתון.",
            "students": "משרטטים מסלול ו־Success Criteria."
        },
        {
            "minutes": "44–56",
            "title": "Risk + Fallback",
            "teacher": "מחבר לשיעור 9 ודורש סיכון אחד ותגובה.",
            "students": "כותבים סיכון ו־Fallback."
        },
        {
            "minutes": "56–72",
            "title": "Prototype קצר",
            "teacher": "מאשר Scope קטן בלבד.",
            "students": "בונים גרסת סימולטור ראשונה."
        },
        {
            "minutes": "72–84",
            "title": "Review צוותי",
            "teacher": "מוביל שאלות עמיתים לפי Blueprint.",
            "students": "מקבלים משוב ומחדדים."
        },
        {
            "minutes": "84–90",
            "title": "סיכום",
            "teacher": "מכין לשיעור 11: עכשיו מתחילים לפתח V1.",
            "students": "כרטיס יציאה."
        }
    ],
    "exercises": [
        {
            "minutes": "8–20",
            "title": "שאלת חקר",
            "prompt": "נסחו שאלה אחת שהרחפן יכול לעזור לענות עליה.",
            "check": "השאלה אינה כללית מדי."
        },
        {
            "minutes": "20–32",
            "title": "Data Plan",
            "prompt": "כתבו איזה נתון/ראיה נאסוף.",
            "check": "הנתון קשור לשאלה."
        },
        {
            "minutes": "32–44",
            "title": "מסלול ראשוני",
            "prompt": "שרטטו מסלול שתומך בנתון.",
            "check": "המסלול לא ארוך מדי."
        },
        {
            "minutes": "44–56",
            "title": "Risk Plan",
            "prompt": "כתבו סיכון ו־Fallback.",
            "check": "התגובה בטוחה."
        },
        {
            "minutes": "56–72",
            "title": "Prototype",
            "prompt": "בנו 3–5 בלוקים ראשונים בלבד.",
            "check": "Scope קטן."
        },
        {
            "minutes": "72–84",
            "title": "Review",
            "prompt": "צוות אחר שואל שאלה אחת על ה־Blueprint.",
            "check": "השאלה מובילה לשיפור."
        },
        {
            "minutes": "84–90",
            "title": "כרטיס יציאה",
            "prompt": "Blueprint טוב מונע...",
            "check": "מזכיר קוד אקראי/סיכון/בלבול."
        }
    ],
    "deliverable": "Research_Blueprint_G6: שאלת חקר, Data Plan, מסלול, Success Criteria, Risk/Fallback ו־Prototype קצר.",
    "assessment": [
        "שאלת החקר ברורה ומדידה.",
        "Data Plan מתאים לשאלה.",
        "המסלול תומך באיסוף הנתון.",
        "יש Risk/Fallback.",
        "ה־Prototype קטן ולא קופץ לפרויקט מלא."
    ],
    "debugging": [
        {
            "problem": "שאלת החקר כללית מדי",
            "fix": "מנסחים “מה נבדוק?” ולא “נטוס באזור”."
        },
        {
            "problem": "אין נתון ברור",
            "fix": "דורשים Evidence: צילום, כיסוי, מדידה או החלטה."
        },
        {
            "problem": "המסלול גדול מדי",
            "fix": "מצמצמים ל־Prototype של 3–5 בלוקים."
        },
        {
            "problem": "אין סיכון",
            "fix": "מחזירים לשיעור 9 ובוחרים אילוץ אחד."
        }
    ],
    "differentiation": {
        "support": [
            "לתת רשימת בעיות לבחירה.",
            "להשתמש בתבנית Blueprint מוכנה.",
            "להסתפק במסלול מצויר בלי קוד מלא."
        ],
        "extension": [
            "להגדיר שני קריטריוני הצלחה.",
            "להוסיף Mission Pad עתידי כתא/תחנה.",
            "לנסח שאלת חקר עם מדד מספרי."
        ]
    },
    "instructorGuide": {
        "prerequisites": "נדרשים שיעורים 6–9. שיעור 10 אינו שיעור ביצוע אלא שיעור אפיון; לא קופצים לפרויקט מלא.",
        "pedagogy": [
            "זה שיעור תכנון קריטי שמונע קוד אקראי בשיעור 11.",
            "המדריך צריך לצמצם רעיונות גדולים לפרויקט שניתן לבדוק.",
            "Blueprint טוב משאיר מקום לשינוי, אבל מגדיר גבולות."
        ],
        "mediaNote": commonInstructorMediaNote,
        "exitTicket": "Blueprint טוב מתחיל ב___ ולא ב___."
    },
    "videoResources": grade6VideoResources,
    "screenshotSlides": [
        {
            "title": "פותחים Blueprint",
            "src": "assets/tello-mission-lab/lesson10/open-app.png",
            "caption": "מתחילים בבעיה ושאלת חקר."
        },
        {
            "title": "משרטטים מסלול ונתונים",
            "src": "assets/tello-mission-lab/lesson10/block-sequence.png",
            "caption": "המסלול נובע מהנתון שרוצים לאסוף."
        },
        {
            "title": "בודקים Prototype",
            "src": "assets/tello-mission-lab/lesson10/simulator-run.png",
            "caption": "Prototype קטן בודק את הרעיון, לא את כל הפרויקט."
        },
        {
            "title": "שומרים תכנון לפרויקט",
            "src": "assets/tello-mission-lab/lesson10/save-share.png",
            "caption": "שומרים Blueprint לקראת פיתוח V1."
        }
    ],
    "instructorSlides": [
        {
            "title": "בעיה לפני קוד",
            "body": "פרויקט רחפן מתחיל בשאלת חקר, לא בבלוקים.",
            "bullets": [
                "Problem",
                "Question",
                "Data"
            ]
        },
        {
            "title": "מה ייחשב הצלחה?",
            "body": "קריטריונים לפני הרצה מונעים ויכוח אחרי הרצה.",
            "bullets": [
                "Success",
                "Evidence",
                "Limit"
            ]
        },
        {
            "title": "Risk + Fallback",
            "body": "כל Blueprint חייב לכלול מה נעשה אם משהו משתבש.",
            "bullets": [
                "Risk",
                "Decision",
                "Fallback"
            ]
        }
    ]
});

  Object.assign(window.TELLO_MISSION_LAB_LESSONS[10], {
    "title": "שיעור 11: מעבדת פיתוח — בונים גרסת V1 לפרויקט החקר",
    "subtitle": "מ־Blueprint לגרסה ראשונה קטנה",
    "concept": "V1 Prototype, Scope Control, Milestone",
    "story": "הצוותים נכנסים למעבדת פיתוח. אסור לבנות את כל הפרויקט בבת אחת: בוחרים Milestone ראשון מתוך ה־Blueprint ומוכיחים שהוא עובד בסימולטור.",
    "mission": "לבנות Project_V1 עם 3–6 בלוקים מרכזיים, Comment שמסביר מטרת חקר, שמירה בשם גרסה ותיעוד מה עדיין חסר.",
    "blocks": [
        "comment",
        "takeoff",
        "grid_scan",
        "photo",
        "land"
    ],
    "essentialQuestion": "איך הופכים Blueprint לגרסה קטנה שאפשר לבדוק בלי להתפזר?",
    "successCriteria": [
        "אני בוחר/ת Milestone ראשון מתוך ה־Blueprint.",
        "אני בונה V1 קצרה ולא פרויקט מלא.",
        "אני מוסיף/ה Comment שמסביר מטרת חקר.",
        "אני שומר/ת בשם Project_V1.",
        "אני מתעד/ת מה חסר לגרסה הבאה."
    ],
    "realWorldUses": [
        {
            "icon": "🧪",
            "title": "אב־טיפוס",
            "text": "מהנדסים בודקים רעיון קטן לפני מוצר מלא."
        },
        {
            "icon": "🧱",
            "title": "Scope Control",
            "text": "צמצום היקף מונע קריסה של פרויקט."
        },
        {
            "icon": "📝",
            "title": "גרסאות",
            "text": "שם גרסה ותיעוד מאפשרים לחזור אחורה."
        }
    ],
    "vocabulary": [
        [
            "V1",
            "גרסה ראשונה לבדיקה."
        ],
        [
            "Milestone",
            "שלב קטן בפרויקט."
        ],
        [
            "Scope",
            "מה כן ומה לא נכנס לגרסה."
        ],
        [
            "Comment",
            "הסבר בתוך/ליד הקוד."
        ],
        [
            "Backlog",
            "מה נשאר לגרסה הבאה."
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
            "Blueprint",
            "מקור ההחלטות."
        ],
        [
            "Milestone",
            "יעד קטן."
        ],
        [
            "V1",
            "גרסה ראשונה."
        ],
        [
            "Comment",
            "מטרת חקר בקוד."
        ],
        [
            "Backlog",
            "מה חסר."
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
            "title": "פותחים Blueprint",
            "teacher": "בודק שלכל צוות שאלה, נתון וסיכון משיעור 10.",
            "students": "מסמנים Milestone ראשון."
        },
        {
            "minutes": "8–18",
            "title": "Scope: מה לא נכנס היום",
            "teacher": "מלמד לצמצם ולא לבנות הכול.",
            "students": "כותבים Now/Next/Later."
        },
        {
            "minutes": "18–30",
            "title": "Comment כמטרת חקר",
            "teacher": "מדגים Comment בתחילת הקוד.",
            "students": "כותבים מטרת חקר במשפט."
        },
        {
            "minutes": "30–50",
            "title": "בניית V1",
            "teacher": "מאשר 3–6 בלוקים בלבד.",
            "students": "בונים Project_V1 בסימולטור."
        },
        {
            "minutes": "50–62",
            "title": "בדיקת V1",
            "teacher": "בודק שהקוד משרת את ה־Milestone.",
            "students": "מריצים ומתעדים תוצאה."
        },
        {
            "minutes": "62–74",
            "title": "Backlog",
            "teacher": "מפריד בין באג לבין פיצ׳ר עתידי.",
            "students": "כותבים שני פריטים ל־Backlog."
        },
        {
            "minutes": "74–84",
            "title": "Review עמיתים",
            "teacher": "מוביל שאלת Scope מצוות אחר.",
            "students": "מתקנים ניסוח/Scope."
        },
        {
            "minutes": "84–90",
            "title": "סיכום",
            "teacher": "מכין לשיעור 12: בדיקות שטח.",
            "students": "כרטיס יציאה."
        }
    ],
    "exercises": [
        {
            "minutes": "0–8",
            "title": "Milestone",
            "prompt": "בחרו חלק אחד מה־Blueprint לבנייה.",
            "check": "החלק קטן."
        },
        {
            "minutes": "8–18",
            "title": "Now/Next/Later",
            "prompt": "מיינו רעיונות לשלוש עמודות.",
            "check": "יש Scope ברור."
        },
        {
            "minutes": "18–30",
            "title": "Comment",
            "prompt": "כתבו מטרת חקר בתחילת הקוד.",
            "check": "ה־Comment מסביר למה."
        },
        {
            "minutes": "30–50",
            "title": "V1",
            "prompt": "בנו 3–6 בלוקים בלבד.",
            "check": "לא בונים הכול."
        },
        {
            "minutes": "50–62",
            "title": "הרצת V1",
            "prompt": "הריצו ותעדו תוצאה.",
            "check": "יש תוצאה."
        },
        {
            "minutes": "62–74",
            "title": "Backlog",
            "prompt": "כתבו שני דברים לגרסה הבאה.",
            "check": "הם לא נכנסים היום."
        },
        {
            "minutes": "84–90",
            "title": "כרטיס יציאה",
            "prompt": "V1 טובה היא...",
            "check": "מזכיר קטנה/בדיקה."
        }
    ],
    "deliverable": "Project_V1_G6: גרסה ראשונה קצרה + Comment + Backlog של שני פריטים.",
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
            "src": "assets/tello-mission-lab/lesson11/open-app.png",
            "caption": "מתחילים מהגרסה הקודמת ולא מאפס."
        },
        {
            "title": "רצף העבודה של השיעור",
            "src": "assets/tello-mission-lab/lesson11/block-sequence.png",
            "caption": "רצף הבלוקים משקף את מטרת השיעור הספציפית."
        },
        {
            "title": "בדיקה/הצגה מבוקרת",
            "src": "assets/tello-mission-lab/lesson11/simulator-run.png",
            "caption": "בודקים או מציגים לפי נוהל בטיחות."
        },
        {
            "title": "שומרים תוצר שלב",
            "src": "assets/tello-mission-lab/lesson11/save-share.png",
            "caption": "שומרים תוצר שמקדם את הפרויקט לשלב הבא."
        }
    ],
    "instructorSlides": [
        {
            "title": "Blueprint אינו קוד",
            "body": "היום בוחרים חלק אחד מתוך התכנון ומוכיחים שהוא עובד.",
            "bullets": [
                "Scope",
                "Milestone",
                "V1"
            ]
        },
        {
            "title": "Comment כמטרת חקר",
            "body": "לפני הבלוקים כותבים למה הקוד קיים.",
            "bullets": [
                "Question",
                "Data",
                "Route"
            ]
        },
        {
            "title": "Backlog",
            "body": "מה שלא נכנס ל־V1 אינו כישלון — הוא נשמר להמשך.",
            "bullets": [
                "Now",
                "Next",
                "Later"
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
