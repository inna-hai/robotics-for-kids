(function () {
  const sharedOutcomes = [
    'התלמידים חוקרים צורך אמיתי של יישוב עתידני ומתרגמים אותו לבנייה במיינקראפט.',
    'התלמידים בונים תוצר Minecraft ברור: מקום, מערכת, שלטים, מסלול וחיבור לשאר היישוב.',
    'התלמידים מתרגלים חשיבה מערכתית: למי זה עוזר, מה תלוי במה, ומה קורה כשמשנים רכיב אחד.',
    'התלמידים בודקים את הבנייה עם מבקר, משפרים נקודה אחת, ומציגים הסבר קצר.'
  ];

  const safetyRules = [
    'לא הורסים בנייה של צוות אחר בלי אישור.',
    'לא כותבים שמות משפחה, כתובות או פרטים אישיים על שלטים בעולם.',
    'כל תוצר חייב להשאיר מעבר ברור ושלט שמסביר למבקר מה רואים.',
    'אם נתקעים, קודם בודקים: איפה הכניסה, איפה השלט, ומה מבקר אמור להבין.'
  ];

  const buildProtocol = {
    defaultMode: 'צוותים של 3-4 תלמידים. כל ילד מחזיק אחריות אחת, אבל התוצר חייב להיראות כמו מערכת אחת.',
    roles: [
      ['חוקר/ת צורך', 'שואל/ת למי המקום עוזר ומה חסר היום ביישוב.'],
      ['מתכנן/ת מערכת', 'מחליט/ה איך המקום מתחבר לשבילים, מים, אנרגיה, טבע, לימודים או קהילה.'],
      ['בנאי/ת Minecraft', 'בונה בפועל את החלק המרכזי בעולם.'],
      ['בודק/ת מבקרים', 'בודק/ת אם ילד אחר מבין את המקום בלי הסבר ארוך.'],
      ['מתעד/ת ומציג/ה', 'כותב/ת שלטים קצרים ומכין/ה הסבר של דקה.']
    ],
    personalLine: 'אני בניתי/חקרתי/בדקתי את ___, וזה עוזר לעומר העתידנית כי ___.'
  };

  const challenges = [
    {
      id: 1,
      title: 'שער הכניסה והחזון',
      theme: 'זהות היישוב',
      bigQuestion: 'איזה יישוב עתידני אנחנו רוצים לבנות, ומה חשוב שיהיה בו לילדים?',
      story: 'הילדים מקבלים שטח פתוח ב־Craftom ומתחילים להפוך אותו לעומר העתידנית: לא עיר מוכנה, אלא רעיון שהכיתה בונה ומסבירה.',
      minecraftBuild: 'שער כניסה, שלט חזון, נקודת התחלה למבקרים ומיני־מפה ראשונה של אזורי היישוב.',
      researchPrompt: 'חקר קצר: אילו 4 דברים חייבים להיות ביישוב שטוב לילדים בני 9 לחיות וללמוד בו?',
      systemFocus: 'חזון, משתמשים, אזורים ראשונים וחיבור בין חלקים',
      image: 'assets/craftom/challenges/my-smart-city-1-plan.webp',
      jsonSpec: 'craftom-integration/omer-future-challenge-1.json',
      workMode: 'צוותים. כל צוות בונה כניסה וחזון, אבל חייב להתחבר למפת הכיתה.',
      exactSteps: [
        'בחרו שם לצוות וחזון קצר לעומר העתידנית.',
        'כתבו ארבעה צרכים של ילדים ביישוב עתידני.',
        'בנו שער כניסה או נקודת פתיחה במיינקראפט.',
        'הוסיפו שלט חזון ושלט שמסביר לאן מבקר ממשיך.',
        'בדקו עם צוות אחר אם הוא מבין מה היישוב מנסה להיות.'
      ],
      successChecks: [
        'יש שער או נקודת התחלה ברורה.',
        'יש לפחות שני שלטים: חזון וכיוון המשך.',
        'יש מיני־מפה או סימון של אזורים עתידיים.',
        'מבקר יודע איפה מתחילים ומה הרעיון של היישוב.'
      ]
    },
    {
      id: 2,
      title: 'שכונה שמחברת אנשים',
      theme: 'מגורים, קהילה ושבילים',
      bigQuestion: 'איך בונים שכונה שבה ילדים, משפחות ומבקרים יכולים לחיות, להיפגש ולהתמצא?',
      story: 'אחרי שיש חזון, בונים את אזור החיים הראשון: לא רק בתים יפים, אלא שכונה שמחברת אנשים ומשאירה מקום למפגש.',
      minecraftBuild: 'שלושה סוגי בתים, מרחב משותף, שבילים ושלטים שמסבירים למי כל אזור מתאים.',
      researchPrompt: 'חקר קצר: מה ילדים צריכים ליד הבית כדי להרגיש שייכים ובטוחים?',
      systemFocus: 'מגורים, נגישות, שבילים, מפגש קהילתי והכוונה',
      image: 'assets/craftom/challenges/builder-bridge-4-final.webp',
      jsonSpec: 'craftom-integration/omer-future-challenge-2.json',
      workMode: 'צוותים עם חלוקה פנימית: שני ילדים בונים, ילד אחד מתכנן שבילים, ילד אחד בודק מבקר.',
      exactSteps: [
        'בחרו שלושה סוגי תושבים או משתמשים.',
        'בנו שלושה בתים/אזורים שמתאימים לצרכים שונים.',
        'חברו את הבתים לשער או לאזור ציבורי בשביל ברור.',
        'הוסיפו מרחב מפגש קטן ושלטים קצרים.',
        'שלחו מבקר לבדוק אם הוא מבין למי מיועד כל מקום.'
      ],
      successChecks: [
        'יש לפחות שלושה מבנים או אזורי מגורים.',
        'יש שביל ברור שמחבר אותם למערכת קיימת.',
        'יש מרחב משותף אחד.',
        'יש הסבר למי השכונה עוזרת ולמה.'
      ]
    },
    {
      id: 3,
      title: 'מערכת טבע, מים ואנרגיה',
      theme: 'קיימות ומשאבים',
      bigQuestion: 'איך יישוב עתידני דואג לצל, מים ואנרגיה בלי להפוך הכול לבטון?',
      story: 'הילדים מוסיפים שכבת חיים ליישוב: פארק, מים, צל, תאורה ואנרגיה. המטרה היא להראות זרימה של משאבים, לא רק לקשט.',
      minecraftBuild: 'פארק עתידני עם מים/צל, מקור אנרגיה סמלי, תאורה ושלט שמסביר איך המשאב עובר ממקום למקום.',
      researchPrompt: 'חקר קצר: מה קורה ליישוב אם אין צל, מים זמינים או תאורה בלילה?',
      systemFocus: 'זרימת משאבים, קיימות, קשר בין טבע לעיר, השפעה על תושבים',
      image: 'assets/craftom/challenges/smart-crossing-4-final.webp',
      jsonSpec: 'craftom-integration/omer-future-challenge-3.json',
      workMode: 'צוותים. כל צוות בונה מערכת אחת ומראה איך היא מתחברת לשכונה או לשער.',
      exactSteps: [
        'בחרו משאב אחד: מים, צל, אנרגיה או אור.',
        'בנו מקום שמייצר, שומר או מפזר את המשאב.',
        'סמנו מסלול או חיבור בין המערכת לבין אזור אחר.',
        'הוסיפו שלט שמסביר את הזרימה: מאיפה זה בא ולאן זה הולך.',
        'בדקו אם מבקר מבין למה המערכת חשובה.'
      ],
      successChecks: [
        'יש מערכת טבע/מים/אנרגיה ברורה.',
        'יש חיבור פיזי או ויזואלי לאזור אחר בעיר.',
        'יש שלט שמסביר זרימה או שימוש.',
        'הצוות יודע להסביר מה יקרה אם המערכת לא תעבוד.'
      ]
    },
    {
      id: 4,
      title: 'סיור בעומר העתידנית',
      theme: 'בדיקה, שיפור והצגה',
      bigQuestion: 'איך מוכיחים שבנינו יישוב עתידני שלם ולא רק ארבעה מבנים נפרדים?',
      story: 'באתגר האחרון הילדים מחברים הכול לסיור: מבקר נכנס, הולך במסלול, מבין את המערכות, ושומע מה הצוות למד ושיפר.',
      minecraftBuild: 'מסלול סיור עם 4 תחנות, שלטי הסבר, נקודת התחלה/סיום ושיפור אחד בעקבות בדיקת מבקר.',
      researchPrompt: 'חקר קצר: מה מבקר צריך לראות כדי להבין סיפור של מקום?',
      systemFocus: 'חיבור מערכות, בדיקות שימושיות, שיפור לפי משוב, הצגה',
      image: 'assets/craftom/challenges/my-smart-city-4-final.webp',
      jsonSpec: 'craftom-integration/omer-future-challenge-4.json',
      workMode: 'צוותים. כל צוות מכין סיור קצר ומקבל בדיקת מבקר מצוות אחר.',
      exactSteps: [
        'בחרו 4 תחנות סיור מתוך מה שבניתם.',
        'חברו ביניהן במסלול ברור.',
        'כתבו שלט קצר לכל תחנה.',
        'תנו לצוות אחר לעבור במסלול בלי הסבר.',
        'שפרו נקודה אחת והציגו סיור של 2 דקות.'
      ],
      successChecks: [
        'יש מסלול סיור עם התחלה וסיום.',
        'יש לפחות ארבע תחנות ושלט לכל תחנה.',
        'יש תיקון אחד בעקבות מבקר.',
        'הצוות מציג איך כל חלק מתחבר לעומר העתידנית.'
      ]
    }
  ];

  function makeFlow(challenge) {
    return [
      { minutes: '0-8', title: 'פתיחת אתגר', teacher: `מציגים את השאלה: ${challenge.bigQuestion}`, students: 'עונים בדוגמאות מחיים אמיתיים ומהעולם של Minecraft.' },
      { minutes: '8-16', title: 'חקר קצר', teacher: 'מבקשים תשובות קצרות, לא הרצאה.', students: challenge.researchPrompt },
      { minutes: '16-24', title: 'תכנון לפני בנייה', teacher: 'מוודאים שיש תפקידים וצורך ברור.', students: 'ממלאים: מה בונים, למי זה עוזר, איך זה מתחבר.' },
      { minutes: '24-52', title: 'בנייה ב־Craftom', teacher: 'עוברים בין צוותים ושואלים שאלות מערכתיות.', students: challenge.exactSteps.slice(2, 4).join(' ') },
      { minutes: '52-62', title: 'בדיקת מבקר', teacher: 'מחליפים מבקרים בין צוותים.', students: 'בודקים אם המקום מובן בלי הסבר ארוך.' },
      { minutes: '62-70', title: 'שיפור אחד', teacher: 'מגבילים לשיפור אחד כדי לשמור על מיקוד.', students: 'מתקנים שלט, שביל, כניסה, חיבור או תפקיד של מקום.' },
      { minutes: '70-75', title: 'הגשה קצרה', teacher: 'מבקשים משפט אחד מכל צוות.', students: `מסיימים: “בנינו ${challenge.minecraftBuild}, וזה עוזר כי ___.”` }
    ];
  }

  function makeWorksheet(challenge) {
    return {
      title: `דף תלמידים: אתגר ${challenge.id} - ${challenge.title}`,
      intro: challenge.bigQuestion,
      fields: [
        { id: 'teamName', label: 'שם הצוות', placeholder: 'לדוגמה: צוות נווה עתיד', type: 'text' },
        { id: 'roles', label: 'חלוקת תפקידים', placeholder: 'מי חוקר/ת צורך, מי מתכנן/ת מערכת, מי בונה, מי בודק/ת, מי מציג/ה?', type: 'textarea' },
        { id: 'need', label: 'איזה צורך גילינו?', placeholder: challenge.researchPrompt, type: 'textarea' },
        { id: 'minecraftBuild', label: 'מה בונים במיינקראפט?', placeholder: challenge.minecraftBuild, type: 'textarea', large: true },
        { id: 'helpsWho', label: 'למי זה עוזר?', placeholder: 'ילדים, משפחות, מורים, מבקרים, תושבים חדשים...', type: 'textarea' },
        { id: 'systemConnection', label: 'איך זה מתחבר לשאר עומר העתידנית?', placeholder: 'שביל, שלט, מים, אנרגיה, טבע, קהילה, בטיחות או תחבורה.', type: 'textarea' },
        { id: 'visitorTest', label: 'מה בדק המבקר?', placeholder: 'מה היה ברור? איפה הוא התבלבל?', type: 'textarea' },
        { id: 'improvement', label: 'מה שיפרנו אחרי הבדיקה?', placeholder: 'כתבו שינוי אחד בלבד.', type: 'textarea' },
        { id: 'personalLine', label: 'שורת אחריות אישית', placeholder: buildProtocol.personalLine, type: 'textarea' }
      ],
      checklist: challenge.successChecks,
      submitTitle: `הגשת אתגר ${challenge.id} - ${challenge.title}`
    };
  }

  const lessons = challenges.map(challenge => ({
    ...challenge,
    grade: 'כיתה ד׳',
    age: 'בני 9',
    durationMinutes: 75,
    platform: 'Minecraft Education + Craftom',
    productStage: challenge.minecraftBuild,
    teacherGoal: `להוביל את התלמידים לחקר קצר ולבנייה יצירתית שמדגימה ${challenge.systemFocus}.`,
    studentOutcome: `הצוות יוצא עם ${challenge.minecraftBuild} והסבר איך הוא מתחבר ליישוב עתידני.`,
    openingDemo: `פותחים בתמונה ובשאלה: ${challenge.bigQuestion}`,
    teacherPrep: [
      'לפתוח את עולם Craftom ולוודא שלכל צוות יש אזור עבודה ברור.',
      `להציג את תמונת האתגר: ${challenge.image}.`,
      `להכין קישור JSON הצלחה: ${challenge.jsonSpec}.`
    ],
    flow: makeFlow(challenge),
    studentWorksheet: makeWorksheet(challenge),
    instructorNotes: [
      'לא להפוך את זה לשיעור תכנות.',
      'לא לתת לילדים לבנות סתם גדול. כל בנייה צריכה צורך, חיבור והסבר.',
      'לסיים כל אתגר עם בדיקת מבקר ושיפור אחד.'
    ]
  }));

  window.OMER_FUTURE_CRAFTOM_PROGRAM = {
    title: 'עומר העתידנית — 4 אתגרי Minecraft/Craftom',
    subtitle: 'לומדה לכיתה ד׳: יצירתיות, חקר וחשיבה מערכתית דרך בניית יישוב עתידני במיינקראפט',
    targetAudience: 'כיתה ד׳',
    age: 'בני 9',
    totalMeetings: 4,
    totalChallenges: 4,
    meetingMinutes: 75,
    toolName: 'Minecraft Education + Craftom',
    buildProtocol,
    sharedOutcomes,
    safetyRules,
    finalTourTemplate: [
      'אנחנו צוות ___ ובנינו את ___ בעומר העתידנית.',
      'בחרנו בזה כי גילינו צורך של ___.',
      'המקום מתחבר לשאר היישוב דרך ___.',
      'בדקנו עם מבקר וגילינו ש___.',
      'השיפור שעשינו הוא ___.'
    ],
    lessons
  };

  window.getOmerFutureCraftomLesson = function getOmerFutureCraftomLesson(value) {
    const id = Number(value || 1);
    return lessons.find(lesson => lesson.id === id) || lessons[0];
  };
})();
