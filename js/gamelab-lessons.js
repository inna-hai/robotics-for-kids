(function () {
  const lessons = [
    ['המשחק הראשון שלי','דמות, מטרה וחוק','יוצרים דמות ראשית עם שם, צבע ואופי ומבינים שמשחק בנוי מדמות, מטרה וחוק.','הציגו דמות, תנו לה שם, וכתבו כלל משחק ראשון.','שם לדמות + משפט פתיחה + מטרה'],
    ['מזיזים דמות בעולם','אירועים ותנועה','הדמות מקבלת שליטה עם מקשי החצים. הילדים לומדים אירוע → פעולה וגבולות מסך.','גרמו לדמות לזוז בארבעה כיוונים בלי לצאת מהעולם.','שליטה במקשים + בדיקת גבולות'],
    ['איסוף כוכבים','התנגשות / Collision','מוסיפים פריט איסוף. אם הדמות נוגעת בכוכב — הכוכב נעלם ונוצרת הצלחה.','בנו משחק שבו הדמות אוספת כוכב ראשון.','נגיעה בכוכב משנה את המשחק'],
    ['ניקוד','משתנים','מוסיפים משתנה ניקוד שמתגמל את השחקן על איסוף.','כל כוכב מוסיף נקודה, והניקוד מוצג על המסך.','משתנה ניקוד שעולה בזמן משחק'],
    ['מכשולים ראשונים','חוקי משחק וסיכון','מוסיפים קוץ/לבה/רובוט שומר. נגיעה במכשול מחזירה להתחלה.','צרו מכשול שמכריח את השחקן לתכנן מסלול.','סיכון פשוט עם תגובה ברורה'],
    ['חיים ופסילה','מצב משחק','לדמות יש 3 חיים. נגיעה במכשול מורידה חיים, וב־0 חיים המשחק נגמר.','בנו חוק הפסד בעזרת משתנה חיים.','משחק עם חיים והפסד'],
    ['אויב שזז לבד','לולאות ותנועה אוטומטית','אויב נע במסלול שוב ושוב. הילדים לומדים לולאה שמפעילה עולם חי.','צרו אויב שנע מצד לצד ומפריע לשחקן.','אויב אוטומטי בלולאה'],
    ['עיצוב שלב','Level Design','מתכננים מפה: רצפה, קירות, שער, אזור התחלה ויעד.','ציירו שלב קטן ואז בנו אותו בלומדה.','מפה מתוכננת לפני קוד'],
    ['מפתח ושער','תנאי מורכב','צריך לאסוף מפתח כדי לפתוח שער. אם יש מפתח ונוגעים בשער — מנצחים.','בנו שער שנפתח רק אחרי איסוף מפתח.','תנאי עם מצב: יש/אין מפתח'],
    ['כוח מיוחד לדמות','יכולות ומשחקיות','כל ילד בוחר כוח: מהירות, מגן, קפיצה או בלתי־נראות קצרה.','הפעילו כוח מיוחד בלחיצה על רווח.','יכולת מיוחדת עם מגבלה'],
    ['טיימר ואתגר זמן','זמן ולחץ משחקי','מוסיפים 60 שניות לסיום. אם הזמן נגמר — הפסד.','צרו משחק שצריך להספיק בזמן.','טיימר שמשנה את חוקי המשחק'],
    ['שלב שני','מעבר בין שלבים','אם מנצחים שלב 1 עוברים לשלב 2 עם קושי חדש.','בנו מעבר בין שני מסכים/שלבים.','משחק עם התקדמות'],
    ['מסך פתיחה וניצחון','חוויית משתמש','יוצרים שם משחק, כפתור התחלה, מסך ניצחון ומסך הפסד.','הוסיפו מסכי פתיחה וסיום שמרגישים כמו משחק אמיתי.','UX בסיסי למשחק'],
    ['בדיקות ושיפור משחק','QA / Playtesting','ילדים משחקים במשחק של חבר, מוצאים באגים ומשפרים גרסה.','בצעו בדיקת משתמשים ושפרו קושי/ניקוד/מכשולים.','גרסה משופרת אחרי משוב'],
    ['Game Demo Day','הצגת פרויקט','כל ילד מציג משחק: דמות, מטרה, חוק מרכזי והקוד הכי חשוב.','הכינו משחק קצר להצגה ותנו לו שם מקצועי.','משחק להצגה בתערוכה']
  ];

  const aiChallenges = [
    'הוסיפו סוף סודי אם אוספים 5 כוכבים.',
    'הפכו את המשחק לקשה יותר אחרי 20 שניות.',
    'תנו לדמות כוח מיוחד שאפשר להשתמש בו רק פעם אחת.',
    'הוסיפו אויב שמתחיל לזוז רק אחרי שהשחקן לוקח מפתח.',
    'צרו בחירה: מסלול קל עם פחות נקודות או מסלול קשה עם יותר נקודות.',
    'הוסיפו רגע הפתעה: שער שנפתח רק אם עומדים במקום הנכון.',
    'שפרו את המשחק כך שיהיה ברור מה המטרה כבר במסך הפתיחה.',
    'הוסיפו משוב לשחקן: הודעה קצרה אחרי פסילה או איסוף.',
    'תנו לאויב “אופי”: מהיר, איטי, פחדן או שומר.',
    'הוסיפו אתגר בונוס למי שמסיים בלי לאבד חיים.'
  ];

  const directorFeedback = [
    'המשחק כבר עובד. עכשיו בדקו: האם לשחקן יש מטרה ברורה?',
    'נסו להוסיף בחירה אחת לשחקן — זה גורם למשחק להרגיש יותר מקצועי.',
    'אם המשחק קל מדי, קרבו מעט את המכשול או הוסיפו טיימר.',
    'אם המשחק קשה מדי, הגדילו את הדמות או הרחיקו את האויב.',
    'משחק טוב נותן משוב: ניקוד, הודעה, צליל או שינוי צבע.',
    'לפני שמוסיפים עוד דברים — הריצו ובדקו שאין באג בסיסי.',
    'תנו שם לדמות ולמשחק. שם טוב גורם לפרויקט להרגיש אמיתי.',
    'חשבו כמו בודקי משחקים: איפה שחקן חדש עלול להתבלבל?'
  ];

  const blocksByLesson = {
    1: ['event_start','create_hero','say','set_goal'],
    2: ['event_key','move_hero','keep_inside'],
    3: ['event_start','spawn_star','if_touching_star','hide_star','say'],
    4: ['event_start','spawn_star','if_touching_star','change_score','say'],
    5: ['event_start','spawn_obstacle','if_touching_obstacle','reset_hero','say'],
    6: ['event_start','set_lives','if_touching_obstacle','change_lives','game_over'],
    7: ['event_start','spawn_enemy','forever','move_enemy','bounce_enemy'],
    8: ['event_start','place_wall','place_gate','show_hint'],
    9: ['event_start','spawn_key','if_touching_key','set_has_key','if_has_key_at_gate','win_game'],
    10:['event_key','activate_power','speed_boost','shield','say'],
    11:['event_start','start_timer','if_time_up','game_over','say'],
    12:['event_start','if_win_level','next_level','spawn_enemy','spawn_star'],
    13:['show_start_screen','event_start','show_win_screen','show_lose_screen'],
    14:['event_start','ask_tester','fix_bug','balance_game','say'],
    15:['event_start','show_title','show_credits','win_game','say']
  };

  const blockLabels = {
    event_start:'כאשר לוחצים התחלה', event_key:'כאשר לוחצים מקש', create_hero:'צור דמות', say:'אמור משפט', set_goal:'קבע מטרה', move_hero:'הזז דמות', keep_inside:'שמור בתוך המסך', spawn_star:'צור כוכב', if_touching_star:'אם הדמות נוגעת בכוכב', hide_star:'הסתר כוכב', change_score:'שנה ניקוד', spawn_obstacle:'צור מכשול', if_touching_obstacle:'אם נוגעים במכשול', reset_hero:'החזר להתחלה', set_lives:'קבע חיים', change_lives:'שנה חיים', game_over:'סיים משחק', spawn_enemy:'צור אויב', forever:'חזור לעד', move_enemy:'הזז אויב', bounce_enemy:'החלף כיוון בקצה', place_wall:'הצב קיר', place_gate:'הצב שער', show_hint:'הצג רמז', spawn_key:'צור מפתח', if_touching_key:'אם נוגעים במפתח', set_has_key:'סמן שיש מפתח', if_has_key_at_gate:'אם יש מפתח ונוגעים בשער', win_game:'ניצחון', activate_power:'הפעל כוח מיוחד', speed_boost:'מהירות כפולה', shield:'מגן זמני', start_timer:'הפעל טיימר', if_time_up:'אם הזמן נגמר', if_win_level:'אם ניצחנו שלב', next_level:'עבור לשלב הבא', show_start_screen:'הצג מסך פתיחה', show_win_screen:'הצג מסך ניצחון', show_lose_screen:'הצג מסך הפסד', ask_tester:'בקש בדיקה מחבר', fix_bug:'תקן באג', balance_game:'אזן קושי', show_title:'הצג שם משחק', show_credits:'הצג יוצר/ת'
  };

  function makeExercises(lesson) {
    return [
      { title:'משימת בסיס', prompt: lesson.mission, blocks: ['כאשר לוחצים התחלה', blockLabels[(blocksByLesson[lesson.id]||[])[1]] || 'צור פעולה ראשונה'] },
      { title:'שדרוג משחקי', prompt: 'הוסיפו תגובה שהשחקן רואה מיד: הודעה, ניקוד, צבע, חיים או מעבר.', blocks: ['כאשר קורה אירוע', 'בדוק תנאי', 'בצע תגובה'] },
      { title:'אתגר במאי המשחק החכם', prompt: lesson.aiChallenge, blocks: ['בחרו אתגר AI', 'תכננו שינוי', 'הריצו ובדקו'] }
    ];
  }

  window.GAMELAB_LESSONS = lessons.map((row, index) => {
    const id = index + 1;
    const lesson = {
      id,
      title: row[0],
      concept: row[1],
      story: row[2],
      mission: row[3],
      outcome: row[4],
      durationMinutes: 60,
      blocks: blocksByLesson[id] || ['event_start','say'],
      aiChallenge: aiChallenges[(id - 1) % aiChallenges.length],
      directorTip: directorFeedback[(id - 1) % directorFeedback.length]
    };
    lesson.exercises = makeExercises(lesson);
    return lesson;
  });
  window.GAMELAB_BLOCK_LABELS = blockLabels;
  window.GAMELAB_AI_CHALLENGES = aiChallenges;
  window.GAMELAB_DIRECTOR_FEEDBACK = directorFeedback;
  window.getGameLabLesson = function (id) {
    const numeric = Number(id) || 1;
    return window.GAMELAB_LESSONS.find(l => l.id === numeric) || window.GAMELAB_LESSONS[0];
  };
})();
