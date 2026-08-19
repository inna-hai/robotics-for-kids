(function () {
  const unitNames = {
    launch: 'יחידה 1 — מרכז חקר וסימולטור',
    survey: 'יחידה 2 — סריקות שטח וגבהים',
    camera: 'יחידה 3 — איסוף מידע חזותי',
    pads: 'יחידה 4 — Mission Pads ותחנות חקר',
    project: 'יחידה 5 — פרויקט חקר מסכם'
  };

  const blockLabels = {
    safety_check: 'Safety Check — בדיקת בטיחות', takeoff: 'Takeoff — המראה', hover: 'Hover 5 sec — ריחוף 5 שניות', land: 'Land — נחיתה', up_100: 'Go Up 100in — עליה לגובה 100 אינץ׳', down_50: 'Go Down 50in — ירידה 50 אינץ׳', yaw_360: 'Yaw Right 360° — סיבוב מלא', forward: 'Forward — קדימה', back: 'Back — אחורה', right: 'Right — ימינה', left: 'Left — שמאלה', photo: 'Take Photo — צילום', wait: 'Wait — המתנה', repeat_scan: 'Repeat Scan — סריקה חוזרת', grid_scan: 'Grid Scan — סריקת גריד', go_pad: 'Go to Mission Pad — גישה לפד', hover_data: 'Hover for Data — ריחוף לאיסוף נתונים', comment: 'Comment — הערה', share: 'Share Mission — שיתוף משימה', abort: 'Abort — עצירת חירום'
  };

  const scenarios = [
    ['ממריאים אל המחר', unitNames.launch, 'חקר, בטיחות וציר אנכי', 'הכיתה הופכת לצוות מחקר רחפנים בהשראת Ingenuity על מאדים: לפני טיסה אמיתית בונים משימת חקר בטוחה בסימולטור.', 'לבנות משימת System Check Alpha: Takeoff → Hover 5 sec → Land, ולהבין איך רחפן הופך מכלי טיס לכלי מחקר מדעי.', ['takeoff','hover','land']],
    ['סקר גבהים דינמי', unitNames.survey, 'גובה כנתון מחקר', 'צוות החקר צריך לבדוק אובייקט בגבהים שונים ולתעד איך שינוי גובה משנה את נקודת המבט.', 'לבנות משימה בסימולטור: המראה, עליה, ריחוף לאיסוף נתונים, ירידה ונחיתה.', ['takeoff','up_100','hover_data','down_50','land']],
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

  window.getTelloMissionLabLesson = function (id) {
    const numeric = Number(id) || 1;
    return window.TELLO_MISSION_LAB_LESSONS.find(l => l.id === numeric) || window.TELLO_MISSION_LAB_LESSONS[0];
  };
})();
