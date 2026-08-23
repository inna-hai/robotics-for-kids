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

  // HYBRID_MODEL_GRADE6_LESSONS_6_15_QUALITY_REWRITE_START

  Object.assign(window.TELLO_MISSION_LAB_LESSONS[5], {
    "title": "שיעור 6: סריקת קו חוף — מסלול חקר ליניארי",
    "subtitle": "מהטיסה הפיזית הראשונה למסלול הלוך־חזור קצר עם נקודת תצפית",
    "concept": "Linear Scan, Point of Interest, Hover for Data, Battery Budget",
    "story": "אחרי System Check פיזי ראשון, הצוותים מקבלים משימת חקר מציאותית: לבדוק קו חוף קצר אחרי סערה. המשימה בכוונה פשוטה — קו אחד, נקודת עניין אחת וחזרה בטוחה — כדי לא לבזבז סוללה ולא לאבד שליטה.",
    "mission": "לבנות Coastline Scan: Safety Check → Takeoff → Forward → Hover for Data → Back → Land, לתעד נקודת עניין אחת ולהסביר למה המסלול חוזר לנקודת התחלה.",
    "blocks": [
        "safety_check",
        "takeoff",
        "forward",
        "hover_data",
        "back",
        "land"
    ],
    "essentialQuestion": "איך אוספים מידע מנקודה אחת בלי להפוך את הטיסה לארוכה ומסוכנת?",
    "successCriteria": [
        "אני מתכנן/ת מסלול ליניארי קצר וברור.",
        "אני משתמש/ת ב־Hover for Data כזמן תצפית, לא כעצירה ריקה.",
        "אני מחזיר/ה את הרחפן לנקודת התחלה לפני נחיתה.",
        "אני מתעד/ת נקודת עניין אחת.",
        "אני מסביר/ה איך Battery Budget מגביל את המשימה."
    ],
    "realWorldUses": [
        {
            "icon": "🌊",
            "title": "סריקת קו חוף",
            "text": "בדיקה מהירה של נזקי סערה מנקודת מבט אווירית."
        },
        {
            "icon": "🔋",
            "title": "ניהול סוללה",
            "text": "משימה קצרה מאפשרת חזרה בטוחה לפני סוללה חלשה."
        },
        {
            "icon": "📍",
            "title": "Point of Interest",
            "text": "חוקרים לא טסים לכל מקום — הם עוצרים בנקודה שממנה נדרש מידע."
        }
    ],
    "vocabulary": [
        [
            "Linear Scan",
            "סריקה בקו אחד: יציאה, תצפית וחזרה."
        ],
        [
            "Point of Interest",
            "נקודת עניין שממנה רוצים מידע."
        ],
        [
            "Hover for Data",
            "ריחוף קצר לאיסוף מידע/תצפית."
        ],
        [
            "Return Path",
            "הדרך הבטוחה חזרה לנקודת התחלה."
        ],
        [
            "Battery Budget",
            "תכנון משימה לפי מגבלת סוללה."
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
            "Forward",
            "יציאה לנקודת העניין."
        ],
        [
            "Hover Data",
            "עצירת תצפית."
        ],
        [
            "Back",
            "חזרה במסלול ידוע."
        ],
        [
            "Battery",
            "גבול זמן וטווח."
        ],
        [
            "Land",
            "סיום בטוח."
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
            "title": "גשר משיעור 5",
            "teacher": "מזכיר מה למדנו בטיסה הפיזית הראשונה: רעש, סוללה, אזור ו־VPS.",
            "students": "פותחים תיעוד הבדל סימולטור/מציאות."
        },
        {
            "minutes": "8–18",
            "title": "תדריך קו חוף",
            "teacher": "מצייר קו חוף, נקודת התחלה ונקודת עניין אחת.",
            "students": "מסמנים Start, POI ו־Return."
        },
        {
            "minutes": "18–28",
            "title": "Battery Budget",
            "teacher": "מסביר למה משימת חקר ראשונה אחרי טיסה פיזית חייבת להיות קצרה.",
            "students": "מגדירים מגבלת זמן/מרחק פשוטה."
        },
        {
            "minutes": "28–44",
            "title": "בניית Coastline Scan",
            "teacher": "מדגים Forward → Hover Data → Back כרצף חקר.",
            "students": "בונים ומריצים בסימולטור."
        },
        {
            "minutes": "44–58",
            "title": "הרצה פיזית חלקית",
            "teacher": "מאשר רק צוותים מוכנים ומנהל אזור סטרילי.",
            "students": "מריצים קטע קצר או צופים ומתעדים."
        },
        {
            "minutes": "58–72",
            "title": "תיעוד POI",
            "teacher": "דורש משפט ממצא: מה ראינו ומה זה אומר.",
            "students": "כותבים ממצא אחד וסיכון אחד."
        },
        {
            "minutes": "72–84",
            "title": "דיבוג חזרה",
            "teacher": "שואל מה מתקנים אם הרחפן לא חוזר לנקודת התחלה.",
            "students": "מציעים תיקון אחד בלבד."
        },
        {
            "minutes": "84–90",
            "title": "סיכום",
            "teacher": "מחבר לשיעור 7: קו אחד לא מספיק כשצריך לכסות שטח.",
            "students": "כרטיס יציאה."
        }
    ],
    "exercises": [
        {
            "minutes": "8–18",
            "title": "מפת קו חוף",
            "prompt": "שרטטו Start, POI ו־Return.",
            "check": "יש שלוש נקודות ברורות."
        },
        {
            "minutes": "18–28",
            "title": "גבול סוללה",
            "prompt": "כתבו כלל קצר: כמה רחוק מותר לטוס לפני שחוזרים?",
            "check": "הכלל שמרני וברור."
        },
        {
            "minutes": "28–44",
            "title": "Coastline Scan",
            "prompt": "בנו והריצו Safety Check → Takeoff → Forward → Hover → Back → Land.",
            "check": "יש חזרה לפני נחיתה."
        },
        {
            "minutes": "44–58",
            "title": "בדיקה מבוקרת",
            "prompt": "הריצו פיזית רק באישור או תעדו הרצת סימולטור.",
            "check": "אין חריגה מאזור."
        },
        {
            "minutes": "58–72",
            "title": "ממצא POI",
            "prompt": "כתבו מה נאסף בנקודת העניין.",
            "check": "יש ממצא ולא רק תיאור טיסה."
        },
        {
            "minutes": "72–84",
            "title": "תיקון חזרה",
            "prompt": "בחרו שינוי אחד שישפר חזרה לנקודת התחלה.",
            "check": "שינוי אחד בלבד."
        },
        {
            "minutes": "84–90",
            "title": "כרטיס יציאה",
            "prompt": "מסלול חקר טוב חייב לחזור כי...",
            "check": "מזכיר סוללה/בטיחות/שליטה."
        }
    ],
    "deliverable": "Coastline_Scan_G6: מסלול הלוך־חזור קצר, ממצא POI אחד ו־Battery Budget פשוט.",
    "assessment": [
        "המסלול ליניארי וקצר.",
        "יש Hover for Data בנקודת העניין.",
        "יש Back/Return לפני Land.",
        "התיעוד כולל ממצא חקר.",
        "הדיבוג עוסק בחזרה בטוחה ולא בהארכת מסלול."
    ],
    "debugging": [
        {
            "problem": "המסלול מתארך מדי",
            "fix": "מקצרים Forward ושומרים POI אחד."
        },
        {
            "problem": "אין חזרה לנקודת התחלה",
            "fix": "מוסיפים Back לפני Land ומסמנים Return Path."
        },
        {
            "problem": "התיעוד הוא רק “טסנו קדימה”",
            "fix": "דורשים ממצא: מה נקודת העניין אומרת?"
        },
        {
            "problem": "הרצה פיזית לא בטוחה",
            "fix": "עוברים לסימולטור ומתעדים החלטת בטיחות."
        }
    ],
    "differentiation": {
        "support": [
            "לתת מפה מוכנה עם POI מסומן.",
            "להפעיל רק בסימולטור לתלמידים חוששים.",
            "להשתמש בערכי מרחק מוכנים."
        ],
        "extension": [
            "להוסיף POI שני בסימולטור בלבד.",
            "להשוות מסלול חזרה מול נחיתה בנקודת יעד.",
            "להציע מדד סוללה כמותי."
        ]
    },
    "instructorGuide": {
        "prerequisites": "נדרש שיעור 5: System Check פיזי או החלטה מודעת להישאר בסימולטור. אין להאריך משימות פיזיות לפני שהצוותים שומרים על תפקידים ואזור סטרילי.",
        "pedagogy": [
            "השיעור מרחיב את הטיסה הפיזית בלי לקפוץ למורכבות גבוהה מדי.",
            "החזרה לנקודת התחלה היא יעד בטיחותי ופדגוגי מרכזי.",
            "הממצא חשוב יותר מהמרחק שהרחפן עבר."
        ],
        "mediaNote": commonInstructorMediaNote,
        "exitTicket": "חזרה בטוחה חשובה כי ___."
    },
    "videoResources": grade6VideoResources,
    "screenshotSlides": [
        {
            "title": "פותחים משימת Coastline",
            "src": "assets/tello-mission-lab/lesson6/open-app.png",
            "caption": "מגדירים Start, POI ו־Return לפני קוד."
        },
        {
            "title": "רצף הלוך־חזור",
            "src": "assets/tello-mission-lab/lesson6/block-sequence.png",
            "caption": "Forward, Hover Data ו־Back יוצרים סריקה קצרה."
        },
        {
            "title": "בדיקת נקודת עניין",
            "src": "assets/tello-mission-lab/lesson6/simulator-run.png",
            "caption": "בודקים אם ה־POI נאסף בלי חריגה מהאזור."
        },
        {
            "title": "שומרים ממצא חוף",
            "src": "assets/tello-mission-lab/lesson6/save-share.png",
            "caption": "שומרים ממצא POI ו־Battery Budget."
        }
    ],
    "instructorSlides": [
        {
            "title": "קו חוף, לא מבוך",
            "body": "המשימה בכוונה פשוטה: נקודת עניין אחת וחזרה בטוחה.",
            "bullets": [
                "Start",
                "POI",
                "Return"
            ]
        },
        {
            "title": "Battery Budget",
            "body": "סוללה היא מגבלת חקר, לא פרט טכני צדדי.",
            "bullets": [
                "קצר",
                "מדיד",
                "חוזר"
            ]
        },
        {
            "title": "ממצא מנקודת עניין",
            "body": "Hover הופך לזמן איסוף מידע כשהתלמידים יודעים מה הם מחפשים.",
            "bullets": [
                "Observe",
                "Record",
                "Explain"
            ]
        }
    ]
});

  Object.assign(window.TELLO_MISSION_LAB_LESSONS[6], {
    "title": "שיעור 7: Grid Scan ראשון — מכסים שטח כמו חוקרים",
    "subtitle": "מעבר מקו יחיד לכיסוי שטח שיטתי",
    "concept": "Grid Scan, Coverage Map, Search Cells, Missed Areas",
    "story": "הצוותים מגלים שקו חוף אחד לא מספיק כשצריך לחפש חפץ אבוד באזור רחב. במקום “לטוס איפה שנראה”, מחלקים את השטח לתאים ומסמנים מה נסרק ומה נשאר פתוח.",
    "mission": "לבנות Grid Scan בסימולטור, לסמן מפת כיסוי של 3×3 תאים, ולזהות תא אחד שלא נסרק מספיק.",
    "blocks": [
        "safety_check",
        "takeoff",
        "grid_scan",
        "hover_data",
        "land"
    ],
    "essentialQuestion": "איך מוכיחים שכיסינו שטח ולא רק טסנו מעל חלק ממנו?",
    "successCriteria": [
        "אני מסביר/ה למה טיסה אקראית מפספסת אזורים.",
        "אני מחלק/ת שטח לתאי גריד.",
        "אני בונה Grid Scan בסימולטור.",
        "אני מסמן/ת כיסוי ומזהה תא חסר.",
        "אני מציע/ה תיקון שמכסה תא חסר."
    ],
    "realWorldUses": [
        {
            "icon": "🧭",
            "title": "חיפוש והצלה",
            "text": "גריד עוזר לצוותים לדעת איזה אזור נסרק."
        },
        {
            "icon": "🗺️",
            "title": "מיפוי שטח",
            "text": "כיסוי שיטתי מייצר מפה אמינה יותר."
        },
        {
            "icon": "✅",
            "title": "בקרת איכות",
            "text": "תא שלא נסרק הוא סיכון, גם אם הטיסה נראתה יפה."
        }
    ],
    "vocabulary": [
        [
            "Grid",
            "חלוקת שטח לתאים."
        ],
        [
            "Coverage",
            "איזה חלק מהשטח נסרק."
        ],
        [
            "Search Cell",
            "תא בודד במפת חיפוש."
        ],
        [
            "Missed Area",
            "אזור שלא קיבל כיסוי מספיק."
        ],
        [
            "Sweep Pattern",
            "תבנית סריקה שיטתית."
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
            "Grid Scan",
            "סריקה שיטתית של תאים."
        ],
        [
            "Coverage Map",
            "סימון מה נסרק."
        ],
        [
            "Cell",
            "יחידת שטח."
        ],
        [
            "Missed Area",
            "פער כיסוי."
        ],
        [
            "Fix",
            "תיקון תא חסר."
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
            "title": "למה קו אחד לא מספיק",
            "teacher": "משווה את Coastline Scan לאזור חיפוש רחב.",
            "students": "מסבירים מה עלול להתפספס."
        },
        {
            "minutes": "8–20",
            "title": "מפת 3×3",
            "teacher": "מצייר גריד ומסמן תאי חיפוש.",
            "students": "מסמנים תאים A1–C3."
        },
        {
            "minutes": "20–32",
            "title": "כיסוי מול תנועה",
            "teacher": "מדגיש שמסלול יפה אינו הוכחת כיסוי.",
            "students": "מגדירים מה ייחשב תא מכוסה."
        },
        {
            "minutes": "32–50",
            "title": "בניית Grid Scan",
            "teacher": "מדגים בלוק Grid Scan ותיעוד תאים.",
            "students": "בונים ומריצים בסימולטור."
        },
        {
            "minutes": "50–64",
            "title": "מפת כיסוי",
            "teacher": "מנחה סימון תאים שכוסו.",
            "students": "צובעים/מסמנים Coverage Map."
        },
        {
            "minutes": "64–76",
            "title": "תא חסר ותיקון",
            "teacher": "מבקש למצוא Missed Area אחד.",
            "students": "מציעים תיקון תא אחד."
        },
        {
            "minutes": "76–86",
            "title": "דיון חוקר",
            "teacher": "שואל מה עדיף: מהר או מכסה היטב?",
            "students": "מנמקים בחירת כיסוי."
        },
        {
            "minutes": "86–90",
            "title": "סיכום",
            "teacher": "מחבר לשיעור 8: אחרי כיסוי צריך ראיה חזותית.",
            "students": "כרטיס יציאה."
        }
    ],
    "exercises": [
        {
            "minutes": "8–20",
            "title": "בניית גריד",
            "prompt": "ציירו 3×3 וסמנו תאים.",
            "check": "יש 9 תאים מסומנים."
        },
        {
            "minutes": "20–32",
            "title": "הגדרת כיסוי",
            "prompt": "כתבו מתי תא נחשב “נסרק”.",
            "check": "הקריטריון ברור."
        },
        {
            "minutes": "32–50",
            "title": "Grid Scan",
            "prompt": "בנו והריצו Grid Scan בסימולטור.",
            "check": "הרצף מסתיים ב־Land."
        },
        {
            "minutes": "50–64",
            "title": "Coverage Map",
            "prompt": "סמנו אילו תאים כוסו.",
            "check": "יש מפה עם סימונים."
        },
        {
            "minutes": "64–76",
            "title": "Missed Area",
            "prompt": "מצאו תא אחד בעייתי והציעו תיקון.",
            "check": "התיקון מכוון לתא."
        },
        {
            "minutes": "76–86",
            "title": "מהירות מול כיסוי",
            "prompt": "מה חשוב יותר במשימת חיפוש?",
            "check": "נימוק מבוסס חקר."
        },
        {
            "minutes": "86–90",
            "title": "כרטיס יציאה",
            "prompt": "כיסוי שטח מוכח כש...",
            "check": "מזכיר תאים/מפה."
        }
    ],
    "deliverable": "Grid_Coverage_G6: משימת Grid Scan + מפת כיסוי 3×3 עם תא חסר ותיקון מוצע.",
    "assessment": [
        "יש מפת גריד מלאה.",
        "התלמיד מבחין בין תנועה לכיסוי.",
        "Grid Scan מורץ בסימולטור.",
        "יש Missed Area ותיקון ממוקד.",
        "ההסבר מחבר כיסוי לאמינות חקר."
    ],
    "debugging": [
        {
            "problem": "התלמידים מתארים מסלול בלי כיסוי",
            "fix": "מחזירים למפת תאים: מה נסרק ומה לא?"
        },
        {
            "problem": "הגריד גדול מדי",
            "fix": "מצמצמים ל־3×3 בלבד."
        },
        {
            "problem": "אין תא חסר",
            "fix": "המדריך מסמן אילוץ: תא מוסתר/מכשול."
        },
        {
            "problem": "רוצים להטיס פיזית את כל הגריד",
            "fix": "פיזי רק קטע קצר; הכיסוי המלא בסימולטור."
        }
    ],
    "differentiation": {
        "support": [
            "לתת גריד מודפס.",
            "לסמן מראש תא חסר אחד.",
            "לעבוד רק על שורה אחת ואז להרחיב."
        ],
        "extension": [
            "להשוות שתי תבניות Sweep.",
            "להוסיף מדד אחוז כיסוי.",
            "לתכנן גיבוי לתא חסום."
        ]
    },
    "instructorGuide": {
        "prerequisites": "נדרש שיעור 6: הבנת POI וחזרה בטוחה. עכשיו מרחיבים מנקודה אחת לכיסוי שטח.",
        "pedagogy": [
            "השיעור מלמד חשיבה מרחבית ולא רק שימוש בבלוק Grid Scan.",
            "הכיסוי הוא הראיה שהסריקה שיטתית.",
            "חשוב להחזיק את העבודה בסימולטור כדי לא ליצור עומס פיזי מוקדם."
        ],
        "mediaNote": commonInstructorMediaNote,
        "exitTicket": "שטח נחשב מכוסה כש___."
    },
    "videoResources": grade6VideoResources,
    "screenshotSlides": [
        {
            "title": "פותחים מפת גריד",
            "src": "assets/tello-mission-lab/lesson7/open-app.png",
            "caption": "השטח מחולק לתאים לפני כתיבת קוד."
        },
        {
            "title": "רצף Grid Scan",
            "src": "assets/tello-mission-lab/lesson7/block-sequence.png",
            "caption": "בלוק Grid Scan משרת מפת כיסוי, לא להפך."
        },
        {
            "title": "בודקים כיסוי",
            "src": "assets/tello-mission-lab/lesson7/simulator-run.png",
            "caption": "בודקים אילו תאים קיבלו כיסוי."
        },
        {
            "title": "שומרים Coverage Map",
            "src": "assets/tello-mission-lab/lesson7/save-share.png",
            "caption": "שומרים מפת כיסוי ותיקון לתא חסר."
        }
    ],
    "instructorSlides": [
        {
            "title": "טיסה אקראית מפספסת",
            "body": "סריקה שיטתית מתחילה במפה, לא בבלוק.",
            "bullets": [
                "Grid",
                "Cells",
                "Coverage"
            ]
        },
        {
            "title": "מה נחשב כיסוי?",
            "body": "מגדירים קריטריון לפני ההרצה כדי לא לשפוט לפי תחושה.",
            "bullets": [
                "תא נסרק",
                "תא חסר",
                "תיקון"
            ]
        },
        {
            "title": "מפת כיסוי היא תוצר",
            "body": "התוצר אינו רק קוד — הוא הוכחה שיטתית למה נסרק.",
            "bullets": [
                "Mark",
                "Compare",
                "Improve"
            ]
        }
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
