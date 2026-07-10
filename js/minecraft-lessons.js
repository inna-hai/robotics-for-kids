(function () {
  const lessons = [
    {
      id: 1,
      emoji: '👋',
      title: 'הפקודה הראשונה שלי',
      zone: 'נקודת ההתחלה',
      concept: 'אירוע → פעולה',
      story: 'סטיב נכנס לעולם חדש. במקום קסם אחד גדול, נלמד אותו לבנות כמו מתכנתים: צעד קטן, הנחת בלוק, בחירת צבע, ועוד צעד.',
      goal: 'לתכנת את סטיב לבנות לאט לאט מגדל ושביל בעזרת פעולות קטנות.',
      blocks: ['event_start', 'say', 'place_block', 'move_up', 'move_right', 'move_down'],
      challenge: 'בנו מגדל של 3 בלוקים ושביל צבעוני של 4 בלוקים — רק בעזרת צעדים קטנים.',
      success: 'כשמריצים, סטיב זז לאט, מניח בלוקים בצבעים שבחרתם, ובונה צורה שאפשר להסביר.'
    },
    {
      id: 2,
      emoji: '🗼',
      title: 'מגדל בלחיצה',
      zone: 'אתר הבנייה',
      concept: 'רצף פקודות',
      story: 'אנחנו בונים מגדל קטן בלי להניח כל בלוק ביד.',
      goal: 'לבנות מגדל אוטומטי ולהוסיף הודעה.',
      blocks: ['event_start', 'build_tower', 'say'],
      challenge: 'נסו להריץ פעמיים ולראות איך העולם משתנה.',
      success: 'מופיע מגדל בלוקים ליד הדמות.'
    },
    {
      id: 3,
      emoji: '🌈',
      title: 'גשם של בלוקים',
      zone: 'שמיים צבעוניים',
      concept: 'פעולה חוזרת',
      story: 'העולם שלנו מקבל גשם צבעוני של בלוקים מצחיקים.',
      goal: 'להפיל בלוקים צבעוניים מהשמיים.',
      blocks: ['event_start', 'rain_blocks', 'say'],
      challenge: 'הוסיפו הודעה לפני הגשם ואחריו.',
      success: 'בלוקים צבעוניים מופיעים בחלק העליון של העולם.'
    },
    {
      id: 4,
      emoji: '🟩',
      title: 'שביל קסמים',
      zone: 'יער ההליכה',
      concept: 'תנועה + פעולה',
      story: 'בכל פעם שהדמות הולכת, נשאר מאחוריה שביל קסום.',
      goal: 'להזיז את הדמות וליצור שביל.',
      blocks: ['event_start', 'magic_trail', 'say'],
      challenge: 'הוסיפו גם טלפורט בסוף השביל.',
      success: 'נוצר שביל ירוק מתחת לדמות.'
    },
    {
      id: 5,
      emoji: '✨',
      title: 'טלפורט קסום',
      zone: 'שער המעבר',
      concept: 'שינוי מיקום',
      story: 'דלת קסמים מעבירה את הדמות למקום אחר בעולם.',
      goal: 'להעביר את הדמות בעזרת פקודה.',
      blocks: ['event_start', 'teleport', 'say'],
      challenge: 'אמרו “הגעתי!” אחרי הטלפורט.',
      success: 'הדמות קופצת למיקום חדש.'
    },
    {
      id: 6,
      emoji: '🐺',
      title: 'חיית מחמד שלי',
      zone: 'חוות החברים',
      concept: 'יצירת אובייקט',
      story: 'נזמן חיית מחמד חמודה שתצטרף להרפתקה.',
      goal: 'לזמן חיה ולתת לה שם.',
      blocks: ['event_start', 'spawn_pet', 'say'],
      challenge: 'הוסיפו הודעה שבה הדמות מציגה את החיה.',
      success: 'חיה מופיעה ליד הדמות.'
    },
    {
      id: 7,
      emoji: '☀️',
      title: 'יום ולילה',
      zone: 'שעון העולם',
      concept: 'שינוי מצב עולם',
      story: 'המתכנתים שולטים בזמן: בוקר להרפתקאות, לילה לאתגרים.',
      goal: 'להחליף בין יום ולילה.',
      blocks: ['event_start', 'set_day', 'set_night', 'say'],
      challenge: 'בנו תוכנית שעושה לילה ואז אומרת “זהירות!”.',
      success: 'רקע העולם משתנה ליום או לילה.'
    },
    {
      id: 8,
      emoji: '🌦️',
      title: 'מזג אוויר קסום',
      zone: 'ענן הפקודות',
      concept: 'בחירת פעולה',
      story: 'היום נזמן שמש, גשם או שלג כמו קוסמים של מזג אוויר.',
      goal: 'לשנות מזג אוויר בעזרת בלוקים.',
      blocks: ['event_start', 'weather_sun', 'weather_rain', 'weather_snow', 'say'],
      challenge: 'בחרו מזג אוויר שמתאים לסיפור שלכם.',
      success: 'מופיעים סימני שמש/גשם/שלג בעולם.'
    },
    {
      id: 9,
      emoji: '🚪',
      title: 'דלת סודית פשוטה',
      zone: 'מערת הסוד',
      concept: 'אם/אז פשוט',
      story: 'יש דלת שנפתחת רק אם עומדים על סימן היהלום.',
      goal: 'להשתמש בתנאי פשוט כדי לפתוח דלת.',
      blocks: ['event_start', 'if_on_diamond', 'open_door', 'say'],
      challenge: 'הכניסו הודעה בתוך התנאי: “מצאתי את הסוד!”.',
      success: 'הדלת נפתחת רק כשהדמות על היהלום.'
    },
    {
      id: 10,
      emoji: '💎',
      title: 'אוצר חבוי',
      zone: 'אי האוצר',
      concept: 'תנאי + פרס',
      story: 'מי שמוצא את המקום הנכון מקבל אוצר.',
      goal: 'לתת פרס כשהדמות עומדת על היהלום.',
      blocks: ['event_start', 'if_on_diamond', 'give_treasure', 'say'],
      challenge: 'שלבו פתיחת דלת ואז אוצר.',
      success: 'תיבת אוצר מופיעה ונוספות נקודות.'
    },
    {
      id: 11,
      emoji: '🍎',
      title: 'משחק איסוף פשוט',
      zone: 'שדה התפוחים',
      concept: 'ניקוד',
      story: 'נבנה משחק קטן: אוספים 5 תפוחים ומנצחים.',
      goal: 'להוסיף פריטי איסוף וניקוד.',
      blocks: ['event_start', 'start_collect_game', 'say'],
      challenge: 'הוסיפו הודעת ניצחון משלכם.',
      success: 'מופיעים 5 תפוחים והניקוד מגיע ל־5.'
    },
    {
      id: 12,
      emoji: '🧭',
      title: 'מבוך קטן עם רמזים',
      zone: 'מבוך הרמזים',
      concept: 'הוראות לשחקן',
      story: 'השחקן צריך רמז כדי לדעת לאן ללכת.',
      goal: 'לבנות מבוך קטן ולהציג רמז.',
      blocks: ['event_start', 'build_maze', 'show_hint', 'say'],
      challenge: 'כתבו רמז ברור אבל לא קל מדי.',
      success: 'קירות מבוך ורמז מופיעים בעולם.'
    },
    {
      id: 13,
      emoji: '🐌',
      title: 'מפלצת מצחיקה',
      zone: 'זירת הצחוקים',
      concept: 'דמות עם התנהגות',
      story: 'ניצור מפלצת איטית ומצחיקה שלא מפחידה — רק עושה קולות.',
      goal: 'לזמן מוב מצחיק ולהציג הודעה.',
      blocks: ['event_start', 'spawn_funny_mob', 'say'],
      challenge: 'תנו למפלצת שם מצחיק.',
      success: 'מוב מצחיק מופיע ליד השחקן.'
    },
    {
      id: 14,
      emoji: '🎮',
      title: 'המיני־משחק שלי',
      zone: 'עולם המשחקים',
      concept: 'שילוב פקודות',
      story: 'עכשיו משלבים כמה קסמים למשחק קטן משלנו.',
      goal: 'לשלב לפחות 3 פעולות בתוכנית אחת.',
      blocks: ['event_start', 'build_maze', 'start_collect_game', 'teleport', 'say', 'give_treasure'],
      challenge: 'בחרו התחלה, מטרה ופרס למשחק שלכם.',
      success: 'יש בעולם משימה קטנה עם התחלה, פעולה ופרס.'
    },
    {
      id: 15,
      emoji: '🏆',
      title: 'יום תערוכה',
      zone: 'במת היוצרים',
      concept: 'דיבאג והצגה',
      story: 'כל ילד מציג קסם מיינקראפט שהוא תכנת ומשפר אותו.',
      goal: 'לתקן, לשפר ולהציג פרויקט קצר.',
      blocks: ['event_start', 'say', 'build_tower', 'rain_blocks', 'magic_trail', 'teleport', 'spawn_pet', 'give_treasure'],
      challenge: 'הוסיפו שם לפרויקט ומשפט הסבר: “כשהקוד רץ, קורה...”',
      success: 'הפרויקט רץ מתחילתו עד סופו ואפשר להסביר אותו.'
    }
  ];

  const blockLabels = {
    event_start: 'כאשר לוחצים ▶️',
    say: 'אמור הודעה',
    move_up: 'עלה למעלה',
    move_down: 'רד למטה',
    move_right: 'זוז ימינה',
    move_left: 'זוז שמאלה',
    place_block: 'הנח בלוק בצבע',
    build_tower: 'בנה מגדל קטן',
    rain_blocks: 'גשם של בלוקים צבעוניים',
    magic_trail: 'צור שביל קסמים',
    teleport: 'טלפורט למקום חדש',
    spawn_pet: 'זמן חיית מחמד',
    set_day: 'עשה יום',
    set_night: 'עשה לילה',
    weather_sun: 'מזג אוויר שמש',
    weather_rain: 'מזג אוויר גשם',
    weather_snow: 'מזג אוויר שלג',
    if_on_diamond: 'אם עומדים על היהלום',
    open_door: 'פתח דלת סודית',
    give_treasure: 'תן אוצר',
    start_collect_game: 'התחל משחק איסוף 5 תפוחים',
    build_maze: 'בנה מבוך קטן',
    show_hint: 'הצג רמז',
    spawn_funny_mob: 'זמן מפלצת מצחיקה'
  };

  const practicalPlans = {
    1: ['בלוק ראשון בצבע', 'מגדל של שני בלוקים', 'מגדל של שלושה בלוקים', 'שביל צבעוני ימינה', 'אתגר: מגדל ושביל באותה תוכנית'],
    2: ['מגדל ראשון', 'מגדל ואז הודעה', 'שני ניסויי הרצה', 'שם למגדל', 'אתגר: אתר בנייה קטן'],
    3: ['גשם בלוקים ראשון', 'הודעת פתיחה ואז גשם', 'גשם ואז הודעת סיום', 'בדיקת מה השתנה בעולם', 'אתגר: מסיבת צבעים'],
    4: ['שביל ראשון', 'שביל ואז הודעה', 'שביל וטלפורט', 'בדיקת לפני/אחרי איפוס', 'אתגר: דרך סודית'],
    5: ['טלפורט ראשון', 'הודעה לפני מעבר', 'הודעה אחרי מעבר', 'טלפורט עם אפקט נוסף', 'אתגר: שער קסום'],
    6: ['זימון חיה', 'שם לחיית המחמד', 'הצגת החיה בהודעה', 'חיה ואז טלפורט', 'אתגר: סיפור חברות'],
    7: ['עושים יום', 'עושים לילה', 'לילה עם אזהרה', 'יום אחרי לילה', 'אתגר: סצנת הרפתקה'],
    8: ['שמש', 'גשם', 'שלג', 'מזג אוויר עם הודעה', 'אתגר: תחזית מזג אוויר'],
    9: ['פותחים דלת עם תנאי', 'הודעה בתוך התנאי', 'דלת ואז הודעה', 'בדיקה: מה קורה בלי תנאי?', 'אתגר: כניסה סודית'],
    10: ['אוצר עם תנאי', 'הודעה לפני האוצר', 'דלת ואוצר', 'בדיקת ניקוד', 'אתגר: אי אוצר קטן'],
    11: ['משחק איסוף ראשון', 'הודעת התחלה', 'הודעת ניצחון', 'בדיקת ניקוד', 'אתגר: משחק עם סיפור'],
    12: ['מבוך ראשון', 'רמז ראשון', 'מבוך עם רמז', 'רמז ברור יותר', 'אתגר: מבוך לחבר'],
    13: ['מפלצת מצחיקה', 'שם למפלצת', 'מפלצת עם משפט', 'מפלצת וחיית מחמד', 'אתגר: דמות עם אופי'],
    14: ['בחירת רעיון למשחק', 'בניית התחלה', 'הוספת מטרה', 'הוספת פרס', 'אתגר: משחק שאפשר להסביר'],
    15: ['בחירת פרויקט', 'תיקון באג אחד', 'הוספת שדרוג', 'הכנת משפט הצגה', 'הרצה מול חבר']
  };

  function labelsFor(blocks) {
    return blocks.map((block) => blockLabels[block] || block);
  }

  function exerciseBlocks(lesson, index) {
    const useful = lesson.blocks.filter((block) => block !== 'event_start');
    const primary = useful[0] || 'say';
    const secondary = useful[1] || 'say';
    if (primary === 'if_on_diamond') {
      const action = useful.includes('give_treasure') ? 'give_treasure' : useful.includes('open_door') ? 'open_door' : 'say';
      return [blockLabels.event_start, blockLabels.if_on_diamond, `בתוך התנאי: ${blockLabels[action]}`, index >= 2 ? 'בתוך התנאי: אמור הודעה' : null].filter(Boolean);
    }
    if (index === 0) return [blockLabels.event_start, blockLabels[primary]];
    if (index === 1) return [blockLabels.event_start, blockLabels[primary], blockLabels[secondary]];
    if (index === 2) return [blockLabels.event_start, blockLabels[primary], blockLabels[secondary], blockLabels[useful[2] || 'say']];
    if (index === 3) return [blockLabels.event_start, blockLabels[primary], blockLabels.say, 'לחצו איפוס והריצו שוב לבדיקה'];
    return [blockLabels.event_start, blockLabels[primary], blockLabels[secondary], blockLabels.say, 'שדרוג אישי: הוסיפו עוד בלוק לבחירתכם'];
  }

  function buildLessonOneExercises() {
    const data = [
      {
        title: 'תרגיל 1 — בלוק ראשון בצבע',
        prompt: 'בחרו צבע בבלוק “הנח בלוק”, והריצו כדי שסטיב יניח בלוק ראשון מתחת לרגליים.',
        blocks: ['כאשר לוחצים ▶️', 'אמור “מתחילים לבנות!”', 'הנח בלוק בצבע ירוק']
      },
      {
        title: 'תרגיל 2 — מגדל של שני בלוקים',
        prompt: 'בנו מגדל קטן: סטיב מניח בלוק, עולה למעלה, ואז מניח עוד בלוק בצבע אחר.',
        blocks: ['כאשר לוחצים ▶️', 'הנח בלוק בצבע עץ', 'עלה למעלה', 'הנח בלוק בצבע זהב']
      },
      {
        title: 'תרגיל 3 — מגדל של שלושה בלוקים',
        prompt: 'הוסיפו עוד פעולה: אחרי הבלוק השני, סטיב עולה שוב ומניח בלוק שלישי.',
        blocks: ['כאשר לוחצים ▶️', 'הנח בלוק בצבע עץ', 'עלה למעלה', 'הנח בלוק בצבע זהב', 'עלה למעלה', 'הנח בלוק בצבע יהלום']
      },
      {
        title: 'תרגיל 4 — שביל צבעוני ימינה',
        prompt: 'אפסו את העולם. עכשיו בנו שביל: סטיב מניח בלוק, זז ימינה, מניח עוד בלוק, ושוב זז ימינה.',
        blocks: ['כאשר לוחצים ▶️', 'הנח בלוק בצבע ירוק', 'זוז ימינה', 'הנח בלוק בצבע אדום', 'זוז ימינה', 'הנח בלוק בצבע סגול']
      },
      {
        title: 'תרגיל 5 — אתגר: מגדל ושביל באותה תוכנית',
        prompt: 'בנו תוכנית ארוכה: קודם מגדל של 2 בלוקים, אחר כך סטיב יורד, זז ימינה, ובונה שביל של 3 בלוקים.',
        blocks: ['כאשר לוחצים ▶️', 'הנח בלוק בצבע עץ', 'עלה למעלה', 'הנח בלוק בצבע זהב', 'רד למטה', 'זוז ימינה', 'הנח בלוק בצבע ירוק', 'זוז ימינה', 'הנח בלוק בצבע יהלום']
      }
    ];
    return data.map((item, index) => ({
      number: index + 1,
      title: item.title,
      minutes: index === 0 ? '20–30' : index === 1 ? '30–38' : index === 2 ? '38–46' : index === 3 ? '46–53' : '53–60',
      studentPrompt: item.prompt,
      answerBlocks: item.blocks,
      expectedResult: index < 3 ? 'נבנה מגדל לאט לאט, וסטיב עולה שלב אחרי שלב.' : 'נבנה שביל/מגדל לפי רצף הפקודות, בצבעים שהילדים בחרו.',
      testSteps: ['לחבר כל בלוק מתחת לבלוק הקודם', 'ללחוץ הרצה', 'לראות את סטיב זז ומניח בלוק אחרי כל פקודה', 'להצביע על המקום שבו סדר הפקודות משנה את התוצאה'],
      commonMistake: 'הילדים מצפים שהמגדל ייבנה בבת אחת. להזכיר: כל בלוק הוא פעולה אחת קטנה — מניחים, זזים, מניחים שוב.'
    }));
  }

  function buildExercises(lesson) {
    if (lesson.id === 1) return buildLessonOneExercises();
    const titles = practicalPlans[lesson.id];
    return titles.map((title, index) => ({
      number: index + 1,
      title: `תרגיל ${index + 1} — ${title}`,
      minutes: index === 0 ? '20–30' : index === 1 ? '30–38' : index === 2 ? '38–46' : index === 3 ? '46–53' : '53–60',
      studentPrompt: index === 0
        ? `בנו את הפתרון הבסיסי של השיעור: ${lesson.goal}`
        : index === 1
          ? 'שפרו את התוכנית בעזרת הודעה שמסבירה לשחקן מה קורה.'
          : index === 2
            ? 'חברו שתי פעולות ברצף ובדקו שהסדר שלהן נכון.'
            : index === 3
              ? 'הריצו, לחצו איפוס, והריצו שוב. מצאו דבר אחד שאפשר לתקן או לשפר.'
              : `אתגר אישי: ${lesson.challenge}`,
      answerBlocks: exerciseBlocks(lesson, index),
      expectedResult: index === 4 ? lesson.success + ' בנוסף יש שדרוג אישי של הילד.' : lesson.success,
      testSteps: ['לחבר את הבלוקים מתחת ל־“כאשר לוחצים ▶️”', 'ללחוץ הרצה', 'להסתכל מה השתנה בעולם', 'להסביר בקול: איזה בלוק גרם לשינוי?'],
      commonMistake: index < 2
        ? 'הילדים שמים בלוק לבד בלי לחבר אותו לבלוק ההתחלה. להזכיר: בלוקים עובדים רק כשהם מחוברים לרצף.'
        : 'הילדים מוסיפים הרבה בלוקים בלי לבדוק ביניהם. לעצור אותם להרצה קצרה אחרי כל שינוי.'
    }));
  }

  for (const lesson of lessons) {
    lesson.durationMinutes = 60;
    lesson.lessonFlow = [
      { minutes: '0–5', title: 'סיפור פתיחה', teacher: `מספרים את הסיפור: ${lesson.story}`, students: 'מנחשים איזה קסם נרצה לתכנת היום.' },
      { minutes: '5–12', title: 'הדגמת מדריך', teacher: `מראים את הבלוקים: ${labelsFor(lesson.blocks).join(' ← ')}.`, students: 'מזהים מה כל בלוק עושה בעולם.' },
      { minutes: '12–20', title: 'בנייה מודרכת', teacher: 'בונים יחד פתרון ראשון לאט, בלוק אחרי בלוק.', students: 'גוררים את אותם הבלוקים ומריצים פעם אחת.' },
      { minutes: '20–46', title: 'תרגילי תכנות מעשיים', teacher: 'עוברים בין הילדים, מתקנים חיבורי בלוקים ושואלים “מה יקרה עכשיו?”.', students: 'מבצעים לפחות שלושה תרגילים עם הרצה אחרי כל שינוי.' },
      { minutes: '46–55', title: 'שדרוג אישי', teacher: 'נותנים בחירה: הודעה, עוד פעולה, סדר אחר או סיפור קצר.', students: 'מוסיפים שדרוג קטן משלהם.' },
      { minutes: '55–60', title: 'הצגה וסיכום', teacher: 'שני ילדים מציגים ומסבירים את רצף הבלוקים.', students: 'משלימים משפט: “כשלחצתי הרצה, הקוד עשה...”' }
    ];
    lesson.programmingExercises = buildExercises(lesson);
  }

  window.MINECRAFT_KIDS_LESSONS = lessons;
  window.getMinecraftLesson = function (id) {
    const numericId = Number(id) || 1;
    return lessons.find((lesson) => lesson.id === numericId) || lessons[0];
  };
})();
