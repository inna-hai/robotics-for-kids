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
    title: 'שיעור 4: סיבוב תצפית 360° — סורקים בלי לזוז',
    subtitle: 'Yaw כתצפית סביבתית והכנה אחרונה לפני רחפן פיזי',
    concept: 'Yaw 360°, תצפית סביבתית, כיוון מצלמה ורשימת מוכנות לטיסה פיזית',
    story: 'צוות החקר מגיע לתחנה שבה אסור להתקדם — יש סביב נקודת הדגימה מכשולים. הפתרון: להמריא, לרחף, להסתובב במקום 360°, לתעד אזורי עניין ולנחות.',
    mission: 'לבנות משימת תצפית בסימולטור: Takeoff → Hover → Yaw Right 360° → Hover → Land, ולמלא Ready-for-Physical checklist לקראת שיעור 5.',
    blocks: ['takeoff','hover','yaw_360','hover','land'],
    essentialQuestion: 'מתי סיבוב במקום נותן יותר מידע מתנועה קדימה?',
    successCriteria: ['אני מסביר/ה Yaw כתצפית ולא כתנועה צדית.', 'אני בונה סריקת 360° בטוחה בסימולטור.', 'אני מזהה מתי כדאי להישאר במקום ולסרוק.', 'אני משלים/ה צ׳קליסט מוכנות לטיסה פיזית.', 'אני מסביר/ה למה שיעורים 1–4 היו סימולטור בלבד.'],
    realWorldUses: [{ icon:'🗼', title:'בדיקת מגדל/תורן', text:'רחפן יכול להסתובב ולתעד סביב נקודה בלי להתקרב מדי.' }, { icon:'🚧', title:'אזור מכשולים', text:'כשאי אפשר להתקדם, תצפית במקום מצמצמת סיכון.' }, { icon:'🧭', title:'מודעות מרחבית', text:'סריקה סביבתית עוזרת לתכנן את הצעד הבא.' }],
    vocabulary: [['Yaw 360°','סיבוב מלא של האף סביב הציר האנכי.'], ['Observation Point','נקודת תצפית קבועה.'], ['Field of View','מה שהמצלמה מסוגלת לראות בכל רגע.'], ['Obstacle Awareness','מודעות למכשולים סביב הרחפן.'], ['Readiness Checklist','רשימת מוכנות לפני טיסה פיזית.']],
    safetyRules: commonResearchSafety,
    commonDirections: [['Hover','עצירה לפני ואחרי הסיבוב.'], ['Yaw 360°','סריקה סביבתית במקום.'], ['Observation','תיעוד מה רואים מכל כיוון.'], ['Checklist','בדיקה לפני מעבר פיזי.'], ['Land','סיום בטוח.']],
    setupSteps: commonGrade6Setup,
    tabletTips: commonGrade6TabletTips,
    lessonFlow: [
      { minutes:'0–8', title:'גשר משיעור 3', teacher:'מחזיר לנקודת דגימה: לפעמים לא מתקדמים — רק סורקים.', students:'נותנים דוגמה מתי לא כדאי להתקדם.' },
      { minutes:'8–18', title:'Yaw כתצפית', teacher:'מדגים בגוף: סיבוב במקום מול הליכה צדית.', students:'מבדילים Yaw מ־Roll.' },
      { minutes:'18–30', title:'תכנון נקודת תצפית', teacher:'מצייר תחנה עם מכשולים סביב.', students:'מסמנים כיווני תצפית.' },
      { minutes:'30–46', title:'בניית משימה', teacher:'מדגים Hover לפני/אחרי Yaw.', students:'בונים Takeoff → Hover → Yaw 360 → Hover → Land.' },
      { minutes:'46–60', title:'הרצה ותיעוד', teacher:'מבקש לתעד מה רואים בארבעה כיוונים.', students:'מריצים וכותבים תצפיות.' },
      { minutes:'60–74', title:'דיבוג סיבוב', teacher:'שואל מה קורה אם Yaw לפני Hover או בלי Land.', students:'מתקנים סדר פקודות.' },
      { minutes:'74–84', title:'Ready for Physical', teacher:'מציג צ׳קליסט לקראת שיעור 5.', students:'מסמנים מוכנות/חוסר מוכנות.' },
      { minutes:'84–90', title:'סיכום יחידת סימולטור', teacher:'מסכם 1–4: בדיקה, ריבוע, דגימה, תצפית.', students:'כרטיס יציאה.' }
    ],
    exercises: [
      { minutes:'8–18', title:'Yaw מול Roll', prompt:'הדגימו בגוף מה ההבדל.', check:'Yaw הוא סיבוב במקום.' },
      { minutes:'18–30', title:'מפת תצפית', prompt:'סמנו ארבעה כיווני תצפית סביב נקודה.', check:'יש צפון/דרום/מזרח/מערב או ארבעה אזורים.' },
      { minutes:'30–46', title:'סריקת 360', prompt:'בנו Takeoff → Hover → Yaw 360 → Hover → Land.', check:'Hover לפני ואחרי הסיבוב.' },
      { minutes:'46–60', title:'תיעוד תצפית', prompt:'כתבו מה הרחפן “בודק” בכל כיוון.', check:'יש לפחות שלוש תצפיות.' },
      { minutes:'60–74', title:'דיבוג סדר', prompt:'מה מסוכן אם Yaw מתרחש מיד אחרי Takeoff בלי Hover?', check:'התשובה מזכירה יציבות.' },
      { minutes:'74–84', title:'צ׳קליסט מוכנות', prompt:'סמנו מה צריך לפני טיסה פיזית.', check:'כולל אזור, משקפיים, סוללה ואישור מדריך.' },
      { minutes:'84–90', title:'כרטיס יציאה', prompt:'אני מוכן/ה לשיעור 5 כש...', check:'התשובה כוללת בטיחות וקוד.' }
    ],
    deliverable: 'Observation_360_G6: משימת סריקה 360° + צ׳קליסט מוכנות לשיעור פיזי ראשון.',
    assessment: ['Yaw מוסבר כסיבוב ולא כתנועה.', 'יש Hover לפני/אחרי Yaw.', 'התיעוד כולל כיווני תצפית.', 'הצ׳קליסט כולל בטיחות פיזית.', 'התלמיד יודע לנמק למה לא טסנו פיזית לפני שיעור 5.'],
    debugging: [{ problem:'בלבול Yaw/Roll', fix:'חוזרים להדגמה גופנית.' }, { problem:'הסיבוב מתחיל לפני יציבות', fix:'מוסיפים Hover לפני Yaw.' }, { problem:'הצ׳קליסט שטחי', fix:'דורשים לפחות ארבעה פריטי בטיחות.' }, { problem:'התלמידים רוצים להטיס עכשיו', fix:'מסבירים: שיעור 4 הוא שער מוכנות, לא טיסה.' }],
    differentiation: { support:['להשתמש בתבנית מוכנה של ארבעה כיוונים.', 'להריץ רק רצף בסיסי ללא שינוי.', 'לעבוד עם צ׳קליסט מצויר.'], extension:['להוסיף צילום תאורטי בכל כיוון.', 'לתכנן מתי עדיף Yaw ומתי Grid Scan.', 'להציע כלל Abort לתצפית מסוכנת.'] },
    instructorGuide: { prerequisites:'נדרש שיעור 3: הבנת נקודת דגימה וגובה/מרחק. שיעור 4 סוגר את שלב הסימולטור לפני מעבר פיזי.', pedagogy:['שיעור זה מחזק מודעות מרחבית ובטיחות לפני טיסה אמיתית.', 'הצ׳קליסט חשוב כמו הקוד — הוא תנאי מעבר לשיעור 5.', 'להחזיק את המתח: עוד לא מטיסים, כי מהנדסים בודקים מוכנות.'], mediaNote: commonInstructorMediaNote, exitTicket:'לפני טיסה פיזית חייבים לוודא ___.' },
    videoResources: grade6VideoResources,
    screenshotSlides: [
      { title:'פותחים משימת תצפית', src:'assets/tello-mission-lab/lesson4/open-app.png', caption:'נקודת תצפית קבועה בסימולטור.' },
      { title:'רצף Yaw 360°', src:'assets/tello-mission-lab/lesson4/block-sequence.png', caption:'Hover לפני ואחרי הסיבוב כדי לשמור יציבות.' },
      { title:'בודקים תצפית', src:'assets/tello-mission-lab/lesson4/simulator-run.png', caption:'הרחפן סורק בלי להתקדם.' },
      { title:'שומרים מוכנות', src:'assets/tello-mission-lab/lesson4/save-share.png', caption:'שמירה + צ׳קליסט לקראת שיעור 5.' }
    ],
    instructorSlides: [
      { title:'סורקים בלי לזוז', body:'לפעמים סיבוב במקום הוא החלטה בטוחה יותר מהתקדמות.', bullets:['Observation Point', 'Yaw 360°', 'Obstacle Awareness'] },
      { title:'Hover לפני Yaw', body:'יציבות לפני סיבוב יוצרת תצפית טובה יותר.', bullets:['Takeoff', 'Hover', 'Yaw', 'Land'] },
      { title:'שער לשיעור 5', body:'אין מעבר לרחפן פיזי בלי צ׳קליסט מוכנות.', bullets:['משקפיים', 'אזור סטרילי', 'סוללה', 'אישור מדריך'] }
    ]
  });

  Object.assign(window.TELLO_MISSION_LAB_LESSONS[4], {
    title: 'שיעור 5: טיסת חקר פיזית ראשונה — System Check מבוקר',
    subtitle: 'מעבר ראשון מהסימולטור לרחפן אמיתי באישור מדריך בלבד',
    concept: 'Pre-Flight Check, Tello WiFi, תפקידים, המראה/ריחוף/נחיתה פיזית מבוקרת',
    story: 'אחרי ארבעה שיעורי סימולטור, צוותי Mission Lab מוכנים לבדוק רחפן אמיתי. המטרה אינה “לעוף רחוק”, אלא להוכיח שהצוות יודע לעבוד בבטיחות, לפי צ׳קליסט ולפי תוכנית קצרה.',
    mission: 'לבצע Pre-Flight Check, להתחבר ל־Tello WiFi רק בהנחיית מדריך, להריץ System Check פיזי קצר: Safety Check → Takeoff → Hover → Land, ולתעד הבדל אחד בין סימולטור למציאות.',
    blocks: ['safety_check','takeoff','hover','land'],
    essentialQuestion: 'מה חייב להיות נכון לפני שהקוד עובר מסימולטור למדחפים אמיתיים?',
    successCriteria: ['אני מבצע/ת Pre-Flight Check מלא לפני חיבור לרחפן.', 'אני מבדיל/ה בין WiFi בית ספרי לבין WiFi רחפן.', 'אני שומר/ת על תפקידים ואזור סטרילי.', 'אני מריץ/ה רק משימת System Check פיזית קצרה באישור מדריך.', 'אני מתעד/ת הבדל אחד בין סימולטור למציאות.'],
    realWorldUses: [{ icon:'🛡️', title:'בדיקות לפני הפעלה', text:'בכל מערכת רובוטית בודקים ציוד, סביבה וסיכון לפני הרצה.' }, { icon:'🔋', title:'ניהול סוללה', text:'סוללה היא מגבלת משימה וחלק מנוהל הבטיחות.' }, { icon:'🧑‍✈️', title:'צוות תפעול', text:'טיסה בטוחה היא עבודת צוות: מפעיל, נווט ותצפיתן.' }],
    vocabulary: [['Pre-Flight Check','בדיקה לפני טיסה: סוללה, מדחפים, מרחב וקוד.'], ['Tello WiFi','רשת הרחפן לטיסה פיזית — לא אינטרנט.'], ['Sterile Zone','אזור נקי מאנשים/חפצים בזמן טיסה.'], ['Observer','תצפיתן בטיחות שמסתכל על המרחב.'], ['Battery Box','קופסת Full וקופסת Empty לניהול סוללות.']],
    safetyRules: ['טיסה פיזית רק באישור מדריך ובתור מוגדר.', 'משקפי מגן חובה לכל מי שבאזור.', 'שיער אסוף, חפצים רופפים מחוץ לאזור.', 'אזור סטרילי לפני Takeoff.', 'אם התצפיתן אומר Stop — נוחתים/עוצרים מיד.', 'אין שינוי קוד בזמן הרחפן באוויר.'],
    commonDirections: [['Safety Check','בדיקת בטיחות לפני המראה.'], ['Takeoff','המראה קצרה ומבוקרת.'], ['Hover','ריחוף לבדיקת יציבות.'], ['Land','נחיתה מיד בסוף הבדיקה.'], ['Observer Stop','קריאת עצירה מחייבת.']],
    setupSteps: ['מסמנים אזור טיסה סטרילי בכיתה.', 'בודקים מגיני פרופלורים, מדחפים וסוללה.', 'מריצים קודם בסימולטור.', 'רק באישור מדריך עוברים ל־Tello WiFi.', 'מריצים System Check קצר ונוחתים.'],
    tabletTips: ['לשמור עותק סימולטור לפני מעבר ל־Tello WiFi.', 'לא לצפות לשמירה בענן בזמן חיבור לרשת הרחפן.', 'להחזיר ל־WiFi בית ספרי אחרי הטיסה לצורך תיעוד/שיתוף.', 'להחזיק את הטאבלט יציב ולא ללחוץ פעמיים על הרצה.'],
    lessonFlow: [
      { minutes:'0–8', title:'בדיקת תנאי קדם', teacher:'בודק צ׳קליסט שיעור 4 ו־Observation_360.', students:'מציגים כלל בטיחות אחד.' },
      { minutes:'8–20', title:'Pre-Flight Check', teacher:'מדגים בדיקת מדחפים, סוללה, מרחב ותפקידים.', students:'מסמנים צ׳קליסט צוותי.' },
      { minutes:'20–32', title:'WiFi כפול', teacher:'מסביר WiFi בית ספרי מול Tello WiFi.', students:'אומרים מתי משתמשים בכל רשת.' },
      { minutes:'32–44', title:'סימולטור אחרון', teacher:'דורש הרצה תקינה לפני פיזי.', students:'מריצים Safety Check → Takeoff → Hover → Land בסימולטור.' },
      { minutes:'44–62', title:'טיסות פיזיות לפי תור', teacher:'מאשר צוותים, מנהל אזור סטרילי וסוללות.', students:'מבצעים רק System Check קצר.' },
      { minutes:'62–74', title:'תיעוד הבדל מציאות', teacher:'שואל מה השתנה לעומת הסימולטור.', students:'כותבים הבדל אחד וסיכון אחד.' },
      { minutes:'74–84', title:'תחזוקת ציוד', teacher:'מנהל Full/Empty batteries וטעינת טאבלטים.', students:'מחזירים ציוד לפי נוהל.' },
      { minutes:'84–90', title:'סיכום והכנה לשיעור 6', teacher:'מחבר לסריקת קו חוף: טיסה פיזית קצרה הופכת למשימת חקר.', students:'כרטיס יציאה.' }
    ],
    exercises: [
      { minutes:'8–20', title:'צ׳קליסט פיזי', prompt:'סמנו סוללה, מדחפים, אזור, משקפיים ואישור.', check:'כל הפריטים קיימים.' },
      { minutes:'20–32', title:'איזו רשת?', prompt:'מתי WiFi בית ספרי ומתי Tello WiFi?', check:'התשובה מבחינה בין שמירה לטיסה.' },
      { minutes:'32–44', title:'הרצת סימולטור אחרונה', prompt:'הריצו Safety Check → Takeoff → Hover → Land.', check:'הרצף תקין לפני פיזי.' },
      { minutes:'44–62', title:'System Check פיזי', prompt:'בצעו רק באישור מדריך.', check:'המראה/ריחוף/נחיתה קצרה.' },
      { minutes:'62–74', title:'מציאות מול סימולטור', prompt:'כתבו הבדל אחד שחוויתם.', check:'ההבדל קשור לרעש/רוח/סוללה/מרחב.' },
      { minutes:'74–84', title:'תחזוקת ציוד', prompt:'החזירו סוללה לקופסה הנכונה וטאבלט לטעינה.', check:'ציוד מסודר.' },
      { minutes:'84–90', title:'כרטיס יציאה', prompt:'לפני טיסה פיזית חייבים...', check:'התשובה כוללת אישור מדריך ובטיחות.' }
    ],
    deliverable: 'Physical_System_Check_G6: הרצה פיזית קצרה מאושרת + תיעוד הבדל סימולטור/מציאות.',
    assessment: ['Pre-Flight Check בוצע לפני חיבור לרחפן.', 'הצוות שמר על תפקידים ואזור סטרילי.', 'הטיסה הפיזית הייתה קצרה והסתיימה ב־Land.', 'התיעוד מזהה הבדל מציאותי.', 'התלמיד יודע מתי להשתמש בכל רשת WiFi.'],
    debugging: [{ problem:'הטאבלט לא שומר אחרי טיסה', fix:'חוזרים מ־Tello WiFi ל־WiFi בית ספרי.' }, { problem:'רחפן לא יציב', fix:'נוחתים, בודקים סוללה/רצפה/VPS/מזגן.' }, { problem:'תלמיד נכנס לאזור', fix:'עוצרים מיד ומחדשים אזור סטרילי.' }, { problem:'קוד לא עבר בסימולטור', fix:'אין טיסה פיזית; חוזרים לתיקון סימולטור.' }],
    differentiation: { support:['לאפשר תפקיד Observer בלבד בטיסה ראשונה.', 'להציג סימולטור במקום פיזי אם תלמיד חושש.', 'לתת צ׳קליסט מודפס.'], extension:['להיות אחראי תיעוד הבדלי מציאות.', 'להציע שיפור בטיחות לקראת שיעור 6.', 'למדוד זמן ריחוף בטוח.'] },
    instructorGuide: { prerequisites:'נדרשים שיעורים 1–4: System Check, Box, נקודת דגימה, Yaw 360 וצ׳קליסט מוכנות. לא מטיסים צוות שלא עבר סימולטור תקין.', pedagogy:['שיעור 5 הוא שיעור אמון ובטיחות, לא שיעור ביצועים.', 'הצלחה היא נחיתה בטוחה ותיעוד, גם אם הטיסה קצרה מאוד.', 'להקפיד שהתלמידים מבינים שהמציאות מוסיפה רעש, רוח, VPS וסוללה.'], mediaNote: commonInstructorMediaNote, exitTicket:'טיסה פיזית בטוחה מתחילה ב___ ולא ב___.' },
    videoResources: grade6VideoResources,
    screenshotSlides: [
      { title:'פותחים גרסת סימולטור', src:'assets/tello-mission-lab/lesson5/open-app.png', caption:'לא עוברים לפיזי בלי גרסת סימולטור תקינה.' },
      { title:'System Check קצר', src:'assets/tello-mission-lab/lesson5/block-sequence.png', caption:'Safety Check → Takeoff → Hover → Land.' },
      { title:'בדיקה מבוקרת', src:'assets/tello-mission-lab/lesson5/simulator-run.png', caption:'הסימולטור והפיזי נשארים קצרים ומבוקרים.' },
      { title:'שומרים תיעוד', src:'assets/tello-mission-lab/lesson5/save-share.png', caption:'חוזרים ל־WiFi בית ספרי לתיעוד ושיתוף.' }
    ],
    instructorSlides: [
      { title:'טיסה פיזית ראשונה', body:'המטרה היא בדיקה בטוחה — לא משימה מורכבת.', bullets:['Pre-Flight', 'Tello WiFi', 'System Check'] },
      { title:'תפקידים מצילים בטיחות', body:'Driver, Navigator ו־Observer עובדים יחד.', bullets:['אישור מדריך', 'אזור סטרילי', 'Stop מחייב'] },
      { title:'מציאות ≠ סימולטור', body:'רעש, רוח, VPS וסוללה הם חלק מהלמידה.', bullets:['תיעוד', 'דיבוג', 'נחיתה בטוחה'] }
    ]
  });
  // HYBRID_MODEL_GRADE6_LESSONS_1_5_END

  window.getTelloMissionLabLesson = function (id) {
    const numeric = Number(id) || 1;
    return window.TELLO_MISSION_LAB_LESSONS.find(l => l.id === numeric) || window.TELLO_MISSION_LAB_LESSONS[0];
  };
})();
