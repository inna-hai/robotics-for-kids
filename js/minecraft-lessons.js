(function () {
  const lessons = [
    {
      id: 1,
      emoji: '👋',
      title: 'הפקודה הראשונה שלי',
      zone: 'נקודת ההתחלה',
      concept: 'אירוע → פעולה',
      story: 'סטיב נכנס לעולם חדש. נלמד את העולם להגיד שלום כשמתחילים.',
      goal: 'ליצור תוכנית שמתחילה בלחיצה ואומרת הודעה.',
      blocks: ['event_start', 'say'],
      challenge: 'שנו את ההודעה למשהו אישי שלכם.',
      success: 'כשמריצים, מופיעה בועת דיבור עם הודעה.'
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

  window.MINECRAFT_KIDS_LESSONS = lessons;
  window.getMinecraftLesson = function (id) {
    const numericId = Number(id) || 1;
    return lessons.find((lesson) => lesson.id === numericId) || lessons[0];
  };
})();
