(function () {
  const lessons = [
    {
      id: 1,
      title: 'פנס רחוב חכם',
      legacyTitle: 'סנסי רואה!',
      cityZone: 'רחוב ראשי',
      emoji: '💡',
      sensorFocus: 'אור',
      codingConcept: 'תנאי אם/אז',
      story: 'הלילה יורד בעיר והרחוב חשוך. סנסי צריך להדליק את הפנס רק כשבאמת חשוך.',
      learningGoals: ['להבין מהו חיישן אור', 'להשתמש בתנאי אם/אז', 'לחבר בין שינוי בסביבה לתגובה של רובוט'],
      blocks: ['כאשר לוחצים ▶️', 'אם חיישן אור = בהיר/חשוך', 'זוז קדימה', 'אמור'],
      simulation: { environment: ['light'], successCondition: 'תגובה נכונה לאור/חושך' },
      studentTasks: ['הפעילו את מצב האור בסביבה', 'בנו תנאי שבודק את חיישן האור', 'גרמו לסנסי להגיב כשיש אור', 'בדקו מה קורה כשמכבים את האור'],
      tip: 'שנו את מצב האור וראו איך מד החיישן של סנסי משתנה.',
      teacherNotes: { durationMinutes: 45, discussionQuestions: ['איפה יש בעיר פנסים שנדלקים לבד?', 'למה לא כדאי להשאיר אור דולק כל היום?'], extension: 'הוסיפו הודעה שסנסי אומר כשהרחוב מואר.' }
    },
    {
      id: 2,
      title: 'מד רעש בשכונה',
      legacyTitle: 'סנסי שומע!',
      cityZone: 'גן משחקים',
      emoji: '🔊',
      sensorFocus: 'קול',
      codingConcept: 'סף רגישות',
      story: 'בגן המשחקים לפעמים רועש מדי. סנסי עוזר לילדים לדעת מתי להנמיך קול.',
      learningGoals: ['להכיר חיישן קול', 'להבין מהו סף', 'לתכנת תגובה לצליל'],
      blocks: ['כאשר לוחצים ▶️', 'אם חיישן צליל = שומע', 'עצור', 'אמור'],
      simulation: { environment: ['sound'], successCondition: 'סנסי מזהה צליל ומגיב' },
      studentTasks: ['הפעילו צליל בסביבה', 'בדקו שחיישן הקול משתנה', 'בנו תנאי לצליל', 'גרמו לסנסי לומר “רועש מדי!”'],
      tip: 'צליל קרוב לסנסי יפעיל את החיישן. נסו לגרור את הרמקול.',
      teacherNotes: { durationMinutes: 45, discussionQuestions: ['מתי רעש עוזר ומתי הוא מפריע?', 'איך מכשירים מודדים רעש?'], extension: 'בנו שתי תגובות: אחת לשקט ואחת לרעש.' }
    },
    {
      id: 3,
      title: 'רכב קטן נמנע ממכשולים',
      legacyTitle: 'סנסי מרגיש!',
      cityZone: 'כביש אימונים',
      emoji: '🚗',
      sensorFocus: 'מרחק/מגע',
      codingConcept: 'תגובה למכשול',
      story: 'רכב חכם חייב לשים לב לקירות ולמכשולים. סנסי לומד לעצור לפני התנגשות.',
      learningGoals: ['להבין חיישן מגע/מרחק', 'לתכנן תגובה בטוחה', 'לשלב תנועה עם תנאי'],
      blocks: ['כאשר לוחצים ▶️', 'אם חיישן מגע = קיר', 'זוז אחורה', 'סובב'],
      simulation: { environment: ['obstacle'], successCondition: 'סנסי מתרחק ממכשול' },
      studentTasks: ['הוסיפו קיר לסביבה', 'קרבו את סנסי לקיר', 'בנו תנאי שמזהה קיר', 'גרמו לסנסי לזוז אחורה ולהסתובב'],
      tip: 'גררו את הקיר קרוב לסנסי כדי להפעיל את חיישן המגע.',
      teacherNotes: { durationMinutes: 45, discussionQuestions: ['איך רכב אוטונומי יודע שיש מכשול?', 'למה עצירה לבד חשובה לבטיחות?'], extension: 'הוסיפו הודעה לפני שסנסי מסתובב.' }
    },
    {
      id: 4,
      title: 'גלאי עשן בתחנת כיבוי',
      legacyTitle: 'סנסי מריח!',
      cityZone: 'תחנת כיבוי',
      emoji: '🚒',
      sensorFocus: 'עשן/גז',
      codingConcept: 'התראה',
      story: 'בתחנת הכיבוי סנסי צריך לזהות עשן מהר ולהזהיר את כולם.',
      learningGoals: ['להכיר חיישן גז/עשן', 'להבין מערכת התראה', 'לתכנת הודעת אזהרה'],
      blocks: ['כאשר לוחצים ▶️', 'אם חיישן ריח = עשן', 'אמור', 'עצור'],
      simulation: { environment: ['smoke'], successCondition: 'סנסי מזהה עשן ומתריע' },
      studentTasks: ['הוסיפו עשן לסביבה', 'בדקו שחיישן הריח משתנה', 'בנו תנאי לזיהוי עשן', 'גרמו לסנסי לומר הודעת אזהרה'],
      tip: 'עשן הוא סימן לסכנה. רובוט טוב לא מתעלם מסכנות.',
      teacherNotes: { durationMinutes: 45, discussionQuestions: ['איפה יש גלאי עשן בבית?', 'למה חשוב לקבל התראה מוקדם?'], extension: 'הוסיפו פעולה של עצירה אחרי ההתראה.' }
    },
    {
      id: 5,
      title: 'חממה חכמה',
      legacyTitle: 'פרויקט מסכם!',
      cityZone: 'חממה עירונית',
      emoji: '🌡️',
      sensorFocus: 'טמפרטורה',
      codingConcept: 'גבוה/נמוך/תקין',
      story: 'בחממה של העיר הצמחים צריכים טמפרטורה נעימה. סנסי בודק אם חם מדי.',
      learningGoals: ['להבין מדידת טמפרטורה', 'להשוות ערך לסף', 'לתכנן פעולה מתקנת'],
      blocks: ['כאשר לוחצים ▶️', 'אם חם מדי', 'הפעל מאוורר', 'אמור'],
      simulation: { environment: ['temperature'], successCondition: 'תגובה לחום' },
      studentTasks: ['בחרו מצב חם', 'בנו תנאי שבודק חום', 'גרמו לסנסי להפעיל מאוורר', 'הוסיפו הודעה לצמחים'],
      tip: 'ב־MVP השיעור משתמש בסימולטור הקיים, ובהמשך נוסיף מד טמפרטורה אמיתי במסך.',
      teacherNotes: { durationMinutes: 45, discussionQuestions: ['למה צמחים צריכים טמפרטורה מתאימה?', 'איפה יש בקרת טמפרטורה בחיים שלנו?'], extension: 'הוסיפו מצב “קר מדי”.' }
    },
    {
      id: 6, title: 'מיון מחזור לפי צבע', cityZone: 'מרכז מחזור', emoji: '♻️', sensorFocus: 'צבע', codingConcept: 'התאמת צבע לפעולה', story: 'סנסי עוזר למיין פסולת לפחים לפי צבע וסוג.', learningGoals: ['להכיר זיהוי צבע', 'לקשר קלט לפעולה', 'לתרגל תנאים מרובים'], blocks: ['אם צבע = כחול', 'אם צבע = ירוק', 'העבר לפח'], simulation: { environment: ['color'], successCondition: 'מיון נכון' }, studentTasks: ['בחרו חפץ', 'בדקו צבע', 'שלחו לפח מתאים', 'בדקו שלושה חפצים'], tip: 'חשבו כמו מכונת מיון: קודם מזהים, אחר כך מחליטים.', teacherNotes: { durationMinutes: 45, discussionQuestions: ['למה ממיינים פסולת?', 'איך מצלמה יכולה לזהות צבע?'], extension: 'הוסיפו פח נוסף.' } },
    {
      id: 7, title: 'רובוט עוקב אחרי קו', cityZone: 'מסלול תחבורה', emoji: '🛣️', sensorFocus: 'קו/ניגודיות', codingConcept: 'לולאה חוזרת', story: 'סנסי נוסע במסלול עירוני ומנסה להישאר על הקו.', learningGoals: ['להבין לולאה', 'להכיר חיישן קו', 'לתקן מסלול'], blocks: ['חזור תמיד', 'אם על הקו', 'זוז קדימה', 'סובב מעט'], simulation: { environment: ['line'], successCondition: 'מעקב אחרי קו' }, studentTasks: ['הפעילו מסלול', 'בנו לולאה', 'תקנו כשהרובוט יוצא מהקו', 'נסו להגיע לסוף'], tip: 'לולאה עוזרת לרובוט לבדוק שוב ושוב.', teacherNotes: { durationMinutes: 45, discussionQuestions: ['איפה רובוטים עוקבים אחרי קווים?', 'למה צריך תיקונים קטנים?'], extension: 'צרו מסלול עם פנייה.' } },
    {
      id: 8, title: 'מעבר חציה בטוח', cityZone: 'מעבר חציה', emoji: '🚦', sensorFocus: 'נוכחות', codingConcept: 'סדר פעולות', story: 'הולך רגל מחכה במעבר. סנסי צריך לעצור מכוניות ולהדליק אור ירוק להולכי רגל.', learningGoals: ['להבין חיישן נוכחות', 'לתכנן רצף פעולות', 'לדבר על בטיחות בדרכים'], blocks: ['אם יש הולך רגל', 'עצור מכוניות', 'חכה', 'הדלק ירוק'], simulation: { environment: ['presence', 'trafficLight'], successCondition: 'מעבר בטוח' }, studentTasks: ['הוסיפו הולך רגל', 'בנו תנאי לזיהוי', 'החליפו רמזור', 'הוסיפו זמן המתנה'], tip: 'במערכות בטיחות הסדר חשוב: קודם עוצרים מכוניות, ורק אז נותנים לעבור.', teacherNotes: { durationMinutes: 45, discussionQuestions: ['למה רמזור לא מתחלף מיד?', 'איזה חיישנים יש במעברי חציה?'], extension: 'הוסיפו צליל לעיוורים.' } },
    {
      id: 9, title: 'חיסכון באנרגיה בכיתה', cityZone: 'בית ספר', emoji: '🏫', sensorFocus: 'נוכחות + אור', codingConcept: 'שילוב תנאים', story: 'בכיתה נשארו אורות ומזגן דולקים. סנסי חוסך אנרגיה כשהכיתה ריקה.', learningGoals: ['לשלב שני חיישנים', 'להבין חיסכון באנרגיה', 'להשתמש בתנאי מורכב'], blocks: ['אם יש אנשים וגם חשוך', 'הדלק אור', 'אם אין אנשים', 'כבה'], simulation: { environment: ['presence', 'light'], successCondition: 'הפעלת אנרגיה רק כשצריך' }, studentTasks: ['בדקו כיתה ריקה', 'בדקו כיתה עם תלמידים', 'שלבו אור ונוכחות', 'כבו כשלא צריך'], tip: 'רובוט חכם לא רק עושה — הוא גם חוסך.', teacherNotes: { durationMinutes: 45, discussionQuestions: ['איך בית ספר יכול לחסוך חשמל?', 'למה צריך שני תנאים?'], extension: 'הוסיפו מצב הפסקה.' } },
    {
      id: 10, title: 'גינה חכמה שמשקה לבד', cityZone: 'פארק עירוני', emoji: '🌱', sensorFocus: 'לחות אדמה', codingConcept: 'מדידה והשוואה', story: 'הצמחים בפארק צמאים. סנסי בודק את האדמה ומשקה רק כשהיא יבשה.', learningGoals: ['להכיר חיישן לחות', 'להשוות יבש/רטוב', 'למנוע בזבוז מים'], blocks: ['אם אדמה יבשה', 'הפעל מים', 'חכה', 'כבה מים'], simulation: { environment: ['soilMoisture'], successCondition: 'השקיה רק כשיבש' }, studentTasks: ['בחרו אדמה יבשה', 'בנו תנאי לחות', 'הפעילו השקיה', 'ודאו שלא משקים כשהאדמה רטובה'], tip: 'מערכת טובה לא משקה כל הזמן — רק כשצריך.', teacherNotes: { durationMinutes: 45, discussionQuestions: ['למה לא כדאי להשקות יותר מדי?', 'איך חיישן יודע שהאדמה יבשה?'], extension: 'הוסיפו מד טיפות מים.' } },
    {
      id: 11, title: 'מערכת אזעקה לבית', cityZone: 'בית חכם', emoji: '🏠', sensorFocus: 'דלת/תנועה', codingConcept: 'מצב מערכת', story: 'כשכולם יוצאים מהבית, סנסי שומר. אבל האזעקה צריכה לעבוד רק כשהיא דרוכה.', learningGoals: ['להבין מצב פעיל/כבוי', 'לשלב חיישן עם מצב', 'לתכנת התראה'], blocks: ['אם מערכת דרוכה', 'אם יש תנועה', 'הפעל אזעקה'], simulation: { environment: ['motion', 'armedMode'], successCondition: 'אזעקה רק כשהמערכת דרוכה' }, studentTasks: ['דרכו את המערכת', 'הוסיפו תנועה', 'הפעילו אזעקה', 'בדקו שמצב כבוי לא מתריע'], tip: 'אותו חיישן יכול לגרום לפעולה אחרת לפי מצב המערכת.', teacherNotes: { durationMinutes: 45, discussionQuestions: ['למה צריך מצב דרוך?', 'מה קורה כשבני הבית בפנים?'], extension: 'הוסיפו קוד סודי לכיבוי.' } },
    {
      id: 12, title: 'רובוט שליח בעיר', cityZone: 'חנות ומשלוח', emoji: '📦', sensorFocus: 'מכשול + יעד', codingConcept: 'תכנון מסלול', story: 'סנסי צריך להביא חבילה מהחנות לבית בלי להתנגש בדרך.', learningGoals: ['לתכנן מסלול', 'להגיב למכשולים', 'לפרק משימה לשלבים'], blocks: ['סע ליעד', 'אם מכשול', 'עקוף', 'מסור חבילה'], simulation: { environment: ['obstacle', 'target'], successCondition: 'הגעה ליעד' }, studentTasks: ['בחרו יעד', 'הוסיפו מכשול', 'תכננו עקיפה', 'הגיעו לבית'], tip: 'משימה גדולה נהיית קלה כשמחלקים אותה לצעדים.', teacherNotes: { durationMinutes: 60, discussionQuestions: ['איך שליח יודע לאן ללכת?', 'מה עושים כשדרך חסומה?'], extension: 'הוסיפו שני יעדים.' } },
    {
      id: 13, title: 'סיור אבטחה בלילה', cityZone: 'פארק בלילה', emoji: '🌙', sensorFocus: 'אור + תנועה + קול', codingConcept: 'לולאה ותנאים מרובים', story: 'בלילה סנסי מסייר בפארק ובודק אם יש תנועה או רעש חשוד.', learningGoals: ['לשלב כמה חיישנים', 'להשתמש בלולאה', 'לסדר עדיפויות'], blocks: ['חזור תמיד', 'אם תנועה', 'אם רעש', 'הדלק פנס'], simulation: { environment: ['light', 'motion', 'sound'], successCondition: 'סיור ותגובה לאירועים' }, studentTasks: ['הפעילו לילה', 'בנו לולאת סיור', 'הגיבו לרעש', 'הגיבו לתנועה'], tip: 'סיור הוא פעולה שחוזרת שוב ושוב.', teacherNotes: { durationMinutes: 60, discussionQuestions: ['איך שומרים על פארק בלי להפריע?', 'מה עדיף לבדוק קודם?'], extension: 'הוסיפו הודעה למוקד.' } },
    {
      id: 14, title: 'משימת חילוץ', cityZone: 'אזור סכנה', emoji: '🛟', sensorFocus: 'עשן + חום + מכשולים', codingConcept: 'סדר עדיפויות', story: 'באזור מסוכן סנסי צריך למצוא דרך בטוחה ולהזהיר בני אדם.', learningGoals: ['להבין סדר עדיפויות', 'לשלב חיישני סכנה', 'לתכנן תגובה בטוחה'], blocks: ['אם עשן', 'אם חם מדי', 'אם מכשול', 'חפש דרך בטוחה'], simulation: { environment: ['smoke', 'temperature', 'obstacle'], successCondition: 'בחירת פעולה בטוחה' }, studentTasks: ['הוסיפו סכנה אחת', 'הוסיפו שתי סכנות', 'בחרו פעולה בטוחה', 'הסבירו את ההחלטה'], tip: 'במשימות חילוץ בטיחות קודמת למהירות.', teacherNotes: { durationMinutes: 60, discussionQuestions: ['מה עושים קודם בזמן סכנה?', 'למה רובוטים טובים במקומות מסוכנים?'], extension: 'הוסיפו מסלול מילוט.' } },
    {
      id: 15, title: 'פרויקט גמר — העיר החכמה שלי', cityZone: 'כל העיר', emoji: '🏙️', sensorFocus: 'בחירה חופשית', codingConcept: 'תכנון מערכת', story: 'עכשיו אתם המהנדסים של העיר. בחרו בעיה ובנו מערכת חכמה משלכם.', learningGoals: ['לתכנן מערכת', 'לבחור חיישנים מתאימים', 'להציג פתרון'], blocks: ['בחרו לפחות 3 חיישנים', 'בחרו לפחות 3 פעולות', 'בדקו והציגו'], simulation: { environment: ['freeProject'], successCondition: 'מערכת עובדת ומוסברת' }, studentTasks: ['בחרו בעיה בעיר', 'בחרו 3 חיישנים', 'בנו פתרון', 'הציגו לחברים'], tip: 'פרויקט טוב מתחיל מבעיה ברורה: מה בעיר צריך להשתפר?', teacherNotes: { durationMinutes: 90, discussionQuestions: ['איזו בעיה בעיר הכי מעניינת אתכם?', 'איך תדעו שהפתרון הצליח?'], extension: 'הכינו פוסטר או מצגת קצרה.' } }
  ];

  window.SENSI_LESSONS = lessons;
  window.getSensiLesson = function (id) {
    const numericId = Number(id) || 1;
    return lessons.find((lesson) => lesson.id === numericId) || lessons[0];
  };
})();
