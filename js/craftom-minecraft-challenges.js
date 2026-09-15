(function () {
  const videoBase = 'marketing/';
  const challenges = [
    {
      id: 1,
      title: 'הרובוט השליח',
      concept: 'רצף פקודות, מרחק, פנייה, הנחת חבילה ודיבוג ראשון',
      story: 'העיר מתחילה מאזור משלוחים קטן: מחסן, תחנת יעד ו-Agent שהופך לשליח הראשון. הילדים בונים מסלול במגרש האישי ומלמדים את הסוכן לבצע משלוח ברור מתחילתו ועד סופו.',
      video: `${videoBase}craftom-challenge1-explainer-gemini-live-1.12x.mp4`,
      poster: 'assets/craftom/challenges/my-smart-city-1-plan.webp',
      command: 'deliver',
      meetings: [
        ['1.1', 'משלוח ראשון', 'בונים מחסן, תחנת יעד ושביל ישר.', 'פקודת deliver שמביאה את ה-Agent מהמחסן לתחנה.'],
        ['1.2', 'מסלול עם פנייה', 'מאריכים את העיר ובונים מסלול עם פנייה אחת.', 'רצף קדימה, פנייה, קדימה, ובדיקה שהסדר נכון.'],
        ['1.3', 'החבילה מגיעה', 'מוסיפים נקודת פריקה בתחנת היעד.', 'ה-Agent מניח או מפיל חבילה ומראה שקוד משנה את העולם.'],
        ['1.4', 'שליח עצמאי', 'כל תלמיד בונה מסלול משלוחים אישי במגרש שלו.', 'הרצה, בדיקה ותיקון של מספר, כיוון או מיקום אחד.']
      ],
      checks: [
        'יש מחסן/בית, שביל ותחנת יעד.',
        'ה-Agent זז לפי רצף פקודות ברור.',
        'יש פנייה או שינוי כיוון במסלול.',
        'ה-Agent מניח/מפיל חבילה או סימון הצלחה.',
        'יש ניסיון תיקון אחרי הרצה.'
      ]
    },
    {
      id: 2,
      title: 'קו המשלוחים האוטומטי',
      concept: 'לולאות, פעולה חוזרת, אוטומציה, start/stop ודיבוג מחזור פעולה',
      story: 'העיר גדלה ומשלוח אחד כבר לא מספיק. אותו Agent מאתגר 1 הופך לקו משלוחים אוטומטי: יוצא מהמחסן, מגיע לתחנה, מניח חבילה, חוזר להתחלה וממשיך לעבוד בלולאה עם עצירה בטוחה.',
      video: `${videoBase}craftom-challenge2-delivery-line-gemini-live-1x.mp4`,
      poster: 'assets/craftom/challenges/delivery-line-automatic.webp',
      command: 'start / stop',
      meetings: [
        ['2.1', 'משלוח אחד לא מספיק', 'מוסיפים שכונה או תחנה חדשה ומבינים למה עבודה חוזרת צריכה אוטומציה.', 'השוואה בין פקודת deliver חד-פעמית לבין קו שצריך לעבוד שוב ושוב.'],
        ['2.2', 'הלוך וחזור', 'מלמדים את ה-Agent לצאת מהמחסן, להגיע לתחנה ולחזור לנקודת התחלה.', 'מחזור פעולה מלא: יציאה, מסירה, חזרה.'],
        ['2.3', 'לולאה עם עצירה', 'מוסיפים משתנה running ופקודות start/stop.', 'לולאת forever שעובדת רק כש-running פעיל, עם pause בין סיבובים.'],
        ['2.4', 'קו אישי בעיר', 'כל תלמיד מתכנן קו משלוחים מחזורי בעיר שלו.', 'מסלול אישי שחוזר לנקודת התחלה, נבדק ומתוקן.']
      ],
      checks: [
        'יש מחסן/נקודת התחלה ותחנת יעד.',
        'ה-Agent מבצע מחזור הלוך-מסירה-חזור.',
        'יש לולאה שמפעילה עבודה חוזרת.',
        'יש מנגנון start/stop או running לעצירה בטוחה.',
        'התלמיד בדק ותיקן מרחק, כיוון או זמן המתנה.'
      ]
    },
    {
      id: 3,
      title: 'קו משלוחים חכם',
      concept: 'משתנים, תנאי if/else, מצב נראה בעולם והחלטות של הסוכן',
      story: 'קו המשלוחים כבר עובד, אבל עכשיו העיר משתנה: שער יכול להיות סגור, דרך יכולה להיחסם, תחנה יכולה להיות מלאה, ורמזור יכול להיות אדום או ירוק. הילדים מוסיפים תנאים כדי שה-Agent לא רק יחזור על פעולה, אלא יקבל החלטה.',
      video: `${videoBase}craftom-challenge3-smart-delivery-line-gemini-live-1x.mp4`,
      poster: 'assets/craftom/challenges/smart-delivery-line.webp',
      command: 'start / stop / status',
      meetings: [
        ['3.1', 'יש מצב בעיר', 'מוסיפים סימן נראה לעין: בלוק אדום/ירוק, שער, חסימה או תחנה מלאה.', 'העיר מקבלת מצב שהקוד יכול לבדוק או לייצג.'],
        ['3.2', 'אם הדרך פתוחה', 'מוסיפים תנאי פשוט לפני המשך הנסיעה.', 'if: אם ירוק/פתוח אז ממשיכים, אחרת עוצרים ומודיעים.'],
        ['3.3', 'מחכים או עוקפים', 'מוסיפים else להתנהגות בזמן חסימה.', 'ה-Agent ממתין, מדווח או פונה למסלול חלופי לפי מצב העולם.'],
        ['3.4', 'חוק חכם אישי', 'כל תלמיד מוסיף חוק אחד לקו המשלוחים שלו.', 'כלל אישי: אם ___ אז ___ אחרת ___, עם בדיקת שני מצבים.']
      ],
      checks: [
        'יש קו משלוחים קיים מאתגר 2.',
        'יש מצב נראה בעולם: אדום/ירוק, שער, חסימה או תחנה מלאה.',
        'יש תנאי if שמחליט לפי מצב.',
        'יש else או תגובה ברורה כשהמצב לא מתאים.',
        'התלמיד בדק שני תרחישים והסביר מה התנאי בודק.'
      ]
    },
    {
      id: 4,
      title: 'העיר החכמה שלי',
      concept: 'פרויקט מסכם: מוסיפים אוטומציות למערכות בעיר, מחברים, בודקים ומציגים',
      story: 'העיר כבר קיימת ויש בה אוטומציות ראשונות: משלוח, לולאה ותנאי. עכשיו כל תלמיד משדרג את העיר שלו ומוסיף עוד אוטומציות למערכות שונות: קו משלוחים נוסף, שער חכם, תחנת איסוף, סיור בטיחות, רמזור קטן או מערכת תחזוקה.',
      video: `${videoBase}craftom-challenge4-smart-city-automations-gemini-live-1x.mp4`,
      poster: 'assets/craftom/challenges/smart-city-automations.webp',
      command: 'start / test / demo',
      meetings: [
        ['4.1', 'ממפים את העיר', 'מזהים אילו אוטומציות כבר קיימות ומה חסר לעיר חכמה יותר.', 'בחירת שתי מערכות לשדרוג ותכנון אלגוריתם לכל אחת.'],
        ['4.2', 'מוסיפים אוטומציה חדשה', 'בונים או משדרגים מערכת עירונית אחת ומפעילים אותה בקוד.', 'פקודת start שמפעילה פעולה אוטומטית חדשה בעיר.'],
        ['4.3', 'מחברים ובודקים', 'מריצים test על שתי אוטומציות ומחפשים תקלה קטנה או התנגשות ביניהן.', 'תיקון שורה, מספר, כיוון, מיקום או תנאי אחד והרצה מחדש.'],
        ['4.4', 'דמו עיר חכמה', 'מסדרים את העיר ומציגים כמה אוטומציות שעובדות יחד.', 'פקודת demo והצגת מה השתדרג, מה הקוד עושה ומה תוקן.']
      ],
      checks: [
        'יש לפחות שתי מערכות או אוטומציות בעיר שהתלמיד יודע להסביר.',
        'יש פקודות start, test ו-demo או מקבילות.',
        'יש שימוש בלפחות שני רעיונות שנלמדו: רצף, לולאה, משתנה או if.',
        'יש בדיקה ותיקון מתועד.',
        'התלמיד מציג מה השתדרג בעיר ומה הקוד עושה.'
      ]
    }
  ];

  const detailsByChallenge = {
    1: [
      {
        academy: {
          title: 'אקדמיית ה-Agent - מסלול השליחים',
          story: 'כמו בקורס Python Turtle: לא מתחילים מפרויקט גדול. מאמנים את ה-Agent בתרגיל קטן, מריצים, משנים מספר אחד, ואז מוסיפים עוד פקודה. בסוף כל התרגילים מתחברים למשלוח ראשון בעיר.',
          exercises: [
            {
              title: 'תרגיל 1 - ה-Agent מתעורר',
              mission: 'צרו פקודת chat בשם deliver שמזמנת את ה-Agent לשחקן.',
              hint: 'התחילו מאירוע chat וחפשו ב-Agent פקודה שמחזירה אותו לנקודת ההתחלה.',
              check: 'כשכותבים deliver בצ׳אט, ה-Agent מופיע לידכם.',
              starter: { blocks: [] },
              criteria: [
                { label: 'פקודת deliver קיימת', type: 'chatDeliver' },
                { label: 'ה-Agent מזומן לנקודת ההתחלה', type: 'teleport' }
              ]
            },
            {
              title: 'תרגיל 2 - צעד מדויק ראשון',
              mission: 'הוסיפו תנועה קדימה ב-3 צעדים בלבד, בלי תחנה עדיין.',
              hint: 'בקטגוריית Agent יש בלוק תנועה. התאימו בו כיוון ומספר צעדים לפי המשימה.',
              check: 'ה-Agent זז קדימה, אבל לא רחוק מדי.',
              starter: { blocks: [{ type: 'teleport' }] },
              criteria: [
                { label: 'ה-Agent מזומן לנקודת ההתחלה', type: 'teleport' },
                { label: 'הצעד הראשון הוא 3 קוביות', type: 'firstMove', direction: 'FORWARD', steps: 3 }
              ]
            },
            {
              title: 'תרגיל 3 - מודדים מרחק כמו Turtle',
              mission: 'שנו רק את המספר ל-5 ובדקו איך המרחק משתנה על השביל.',
              hint: 'אל תחליפו את כל הקוד. נסו לשנות רק את המספר בתוך בלוק התנועה.',
              check: 'אתם יודעים להסביר איך שינוי מספר משנה את מרחק ה-Agent.',
              starter: { blocks: [{ type: 'teleport' }, { type: 'move', direction: 'FORWARD', steps: 3 }] },
              criteria: [
                { label: 'שיניתם את מספר הצעדים ל-5', type: 'firstMove', direction: 'FORWARD', steps: 5 },
                { label: 'ה-Agent נשאר על השביל', type: 'staysOnStartRow' }
              ]
            },
            {
              title: 'תרגיל 4 - תחנת יעד',
              mission: 'בנו תחנה קטנה בסוף השביל והריצו שוב את אותה פקודה.',
              hint: 'ההרצה מראה איפה ה-Agent עוצר. תקנו את המרחק עד שהוא מגיע קרוב לתחנה.',
              check: 'ה-Agent מגיע קרוב לתחנה, לא עוצר באמצע ולא עובר אותה.',
              starter: { blocks: [{ type: 'teleport' }, { type: 'move', direction: 'FORWARD', steps: 3 }] },
              criteria: [
                { label: 'ה-Agent מגיע לתחנת היעד', type: 'reachedStation' },
                { label: 'המסלול עדיין מתחיל מ-deliver', type: 'chatDeliver' }
              ]
            },
            {
              title: 'תרגיל 5 - אישור משלוח',
              mission: 'הוסיפו הודעת player say שמודיעה שהמשלוח הגיע.',
              hint: 'המסלול כבר מוכן. עכשיו חסר בלוק אחד מקטגוריית Player בסוף הרצף.',
              check: 'בסוף ההרצה מופיעה הודעה שמסבירה מה קרה.',
              starter: { blocks: [{ type: 'teleport' }, { type: 'move', direction: 'FORWARD', steps: 5 }] },
              criteria: [
                { label: 'ה-Agent מגיע לתחנת היעד', type: 'reachedStation' },
                { label: 'יש הודעת משלוח', type: 'arrivalSay' }
              ]
            },
            {
              title: 'אתגר קטן - תיקון אחד',
              mission: 'שברו בכוונה מספר אחד, הריצו, ואז תקנו רק את אותו מספר.',
              hint: 'זו משימת דיבוג: חפשו מספר אחד שמרחיק את ה-Agent יותר מדי ותקנו רק אותו.',
              check: 'יש לכם לפני/אחרי: מה לא עבד, ומה תיקנתם.',
              starter: { blocks: [{ type: 'teleport' }, { type: 'move', direction: 'FORWARD', steps: 8 }, { type: 'say', text: 'delivery arrived' }] },
              criteria: [
                { label: 'מספר התנועה תוקן ל-5', type: 'firstMove', direction: 'FORWARD', steps: 5 },
                { label: 'אחרי התיקון ה-Agent מגיע לתחנה', type: 'reachedStation' },
                { label: 'יש הודעת משלוח', type: 'arrivalSay' }
              ]
            }
          ]
        },
        goal: 'להבין שקוד הוא רצף הוראות מדויק: מאמנים את ה-Agent בשלבים קטנים, מזמנים אותו, נותנים לו תנועה אחת, בודקים מרחק ומתקנים כמו בקורס Python Turtle.',
        teacher: ['פותחים בסרטון האתגר ובונים יחד מילון קצר: מחסן, תחנה, Agent, פקודה.', 'מדגימים פקודת צ׳אט אחת בשם deliver.', 'מבקשים מכל תלמיד לשנות רק מספר אחד ולראות מה משתנה.'],
        build: ['מחסן קטן עם דלת ושלט.', 'תחנת יעד מול המחסן.', 'שביל ישר וברור בין שתי הנקודות.'],
        code: ['on chat command deliver', 'agent.teleportToPlayer()', 'agent.move(FORWARD, מספר צעדים)'],
        evidence: ['צילום/ראיה של מחסן ותחנה.', 'פקודת deliver קיימת.', 'ה-Agent הגיע או כמעט הגיע לתחנה.', 'יש תיקון מרחק אחד אחרי ניסיון.'],
        exit: 'איזה מספר שיניתם בפקודת move, ומה קרה ל-Agent אחרי השינוי?'
      },
      {
        academy: {
          title: 'אקדמיית ה-Agent - מסלול עם פנייה',
          story: 'ממשיכים מהמשלוח הישר: עכשיו ה-Agent צריך להבין שהסדר משנה. קודם הולכים עד הפנייה, אחר כך פונים, ורק אז ממשיכים לתחנה. כל תרגיל מוסיף פעולה אחת למסלול בצורת ר.',
          world: {
            start: { x: 112, y: 146 },
            station: { x: 280, y: 314 },
            routeTiles: [
              { x: 154, y: 146 },
              { x: 196, y: 146 },
              { x: 238, y: 146 },
              { x: 280, y: 146 },
              { x: 280, y: 188 },
              { x: 280, y: 230 },
              { x: 280, y: 272 },
              { x: 280, y: 314 }
            ]
          },
          exercises: [
            {
              title: 'תרגיל 1 - יש פנייה במסלול',
              mission: 'צרו פקודת deliver שמזמנת את ה-Agent ומוסיפה בלוק turn אחד.',
              hint: 'חפשו ב-Agent בלוק פנייה. עוד לא צריך להשלים את כל המסלול.',
              check: 'הקוד כולל פקודת פנייה אחת אחרי שה-Agent מתחיל.',
              starter: { blocks: [{ type: 'teleport' }] },
              criteria: [
                { label: 'פקודת deliver קיימת', type: 'chatDeliver' },
                { label: 'יש בלוק פנייה במסלול', type: 'turn' }
              ]
            },
            {
              title: 'תרגיל 2 - קודם הולכים, אחר כך פונים',
              mission: 'הוסיפו תנועה קדימה של 4 קוביות לפני הפנייה.',
              hint: 'הפנייה צריכה להגיע אחרי התנועה הראשונה, לא לפניה.',
              check: 'ה-Agent מגיע לפינה ואז משנה כיוון.',
              starter: { blocks: [{ type: 'teleport' }, { type: 'move', direction: 'FORWARD', steps: 2 }, { type: 'turn', turn: 'RIGHT_TURN' }] },
              criteria: [
                { label: 'התנועה הראשונה היא 4 קוביות קדימה', type: 'firstMove', direction: 'FORWARD', steps: 4 },
                { label: 'התנועה מגיעה לפני הפנייה', type: 'moveBeforeTurn' }
              ]
            },
            {
              title: 'תרגיל 3 - ממשיכים אחרי הפנייה',
              mission: 'אחרי הפנייה הוסיפו עוד תנועה קדימה עד התחנה.',
              hint: 'צריך רצף: move, turn, move. אל תחליפו את ההתחלה.',
              check: 'יש שתי תנועות והפנייה נמצאת ביניהן.',
              starter: { blocks: [{ type: 'teleport' }, { type: 'move', direction: 'FORWARD', steps: 4 }, { type: 'turn', turn: 'RIGHT_TURN' }] },
              criteria: [
                { label: 'יש שתי פקודות move', type: 'moveCount', min: 2 },
                { label: 'הפנייה נמצאת לפני התנועה השנייה', type: 'turnBeforeSecondMove' }
              ]
            },
            {
              title: 'תרגיל 4 - סדר פעולות נכון',
              mission: 'תקנו שלד שבו הפנייה מוקדמת מדי, כך שה-Agent ילך קודם לפינה.',
              hint: 'אל תוסיפו עוד ועוד בלוקים. גררו את הפנייה למקום הנכון ברצף.',
              check: 'המסלול מתחיל בתנועה, ממשיך בפנייה, ואז עוד תנועה.',
              starter: { blocks: [{ type: 'teleport' }, { type: 'turn', turn: 'RIGHT_TURN' }, { type: 'move', direction: 'FORWARD', steps: 4 }, { type: 'move', direction: 'FORWARD', steps: 4 }] },
              criteria: [
                { label: 'התנועה הראשונה מגיעה לפני הפנייה', type: 'moveBeforeTurn' },
                { label: 'הפנייה מגיעה לפני התנועה השנייה', type: 'turnBeforeSecondMove' }
              ]
            },
            {
              title: 'תרגיל 5 - לא עוברים את התחנה',
              mission: 'שנו רק מספר אחד כדי שה-Agent יעצור בדיוק בתחנת היעד.',
              hint: 'המסלול כבר כמעט נכון. בדקו את המספר בתנועה השנייה אחרי הפנייה.',
              check: 'ה-Agent מגיע לתחנה בלי לעבור אותה.',
              starter: { blocks: [{ type: 'teleport' }, { type: 'move', direction: 'FORWARD', steps: 4 }, { type: 'turn', turn: 'RIGHT_TURN' }, { type: 'move', direction: 'FORWARD', steps: 6 }] },
              criteria: [
                { label: 'התנועה השנייה תוקנה ל-4 קוביות', type: 'secondMove', direction: 'FORWARD', steps: 4 },
                { label: 'ה-Agent מגיע לתחנת היעד', type: 'reachedStation' }
              ]
            },
            {
              title: 'אתגר קטן - מסלול עם אישור',
              mission: 'השלימו את המסלול והוסיפו הודעת player say בסוף ההגעה.',
              hint: 'אם ה-Agent כבר מגיע לתחנה, חסרה רק הודעת סיום מקטגוריית Player.',
              check: 'בסוף ההרצה יש גם הגעה לתחנה וגם הודעת הצלחה.',
              starter: { blocks: [{ type: 'teleport' }, { type: 'move', direction: 'FORWARD', steps: 4 }, { type: 'turn', turn: 'RIGHT_TURN' }, { type: 'move', direction: 'FORWARD', steps: 4 }] },
              criteria: [
                { label: 'ה-Agent מגיע לתחנת היעד', type: 'reachedStation' },
                { label: 'יש הודעת הצלחה בסוף', type: 'arrivalSay' }
              ]
            }
          ]
        },
        goal: 'להבין שסדר פעולות משנה תוצאה: קדימה, פנייה, קדימה אינו זהה לפנייה לפני תנועה.',
        teacher: ['מציירים על הלוח מסלול בצורת ר בתוך העיר.', 'מריצים בכיתה שתי גרסאות: סדר נכון וסדר שגוי.', 'נותנים לתלמידים לדבג רק פעולה אחת בכל פעם.'],
        build: ['שביל בצורת ר.', 'פנייה אחת מסומנת בצבע אחר.', 'תחנת יעד אחרי הפנייה.'],
        code: ['agent.move(FORWARD, n)', 'agent.turn(LEFT_TURN)', 'agent.move(FORWARD, m)'],
        evidence: ['יש מסלול עם פנייה.', 'הקוד כולל תנועה, פנייה ועוד תנועה.', 'התלמיד יודע להסביר למה הסדר חשוב.', 'יש הרצה חוזרת אחרי תיקון.'],
        exit: 'איזו פעולה חייבת לבוא לפני הפנייה, ואיזו פעולה באה אחריה?'
      },
      {
        academy: {
          title: 'אקדמיית ה-Agent - החבילה מגיעה',
          story: 'אחרי שה-Agent כבר יודע להגיע לתחנה, מתרגלים את הצעד הבא: הקוד לא רק מזיז אותו, אלא משנה את העולם. בכל תרגיל מוסיפים או מתקנים פעולה אחת עד שהחבילה מונחת במקום הנכון.',
          world: {
            start: { x: 112, y: 146 },
            station: { x: 280, y: 314 },
            routeTiles: [
              { x: 154, y: 146 },
              { x: 196, y: 146 },
              { x: 238, y: 146 },
              { x: 280, y: 146 },
              { x: 280, y: 188 },
              { x: 280, y: 230 },
              { x: 280, y: 272 },
              { x: 280, y: 314 }
            ]
          },
          exercises: [
            {
              title: 'תרגיל 1 - מוסיפים חבילה',
              mission: 'השלימו את מסלול ההגעה והוסיפו בלוק agent place כדי שה-Agent יניח חבילה.',
              hint: 'המסלול כבר מוביל לתחנה. חפשו ב-Agent את בלוק place והוסיפו אותו בסוף הרצף.',
              check: 'ה-Agent מגיע לתחנה ומניח חבילה.',
              starter: { blocks: [{ type: 'teleport' }, { type: 'move', direction: 'FORWARD', steps: 4 }, { type: 'turn', turn: 'RIGHT_TURN' }, { type: 'move', direction: 'FORWARD', steps: 4 }] },
              criteria: [
                { label: 'ה-Agent מגיע לתחנת היעד', type: 'reachedStation' },
                { label: 'יש בלוק הנחת חבילה', type: 'place' }
              ]
            },
            {
              title: 'תרגיל 2 - מניחים למטה',
              mission: 'שנו את כיוון ההנחה כך שהחבילה תונח על הרצפה בתחנה.',
              hint: 'אל תחליפו את כל הבלוק. בדקו את התפריט הקטן בתוך agent place.',
              check: 'החבילה מונחת בכיוון DOWN, במקום להידחף קדימה.',
              starter: { blocks: [{ type: 'teleport' }, { type: 'move', direction: 'FORWARD', steps: 4 }, { type: 'turn', turn: 'RIGHT_TURN' }, { type: 'move', direction: 'FORWARD', steps: 4 }, { type: 'place', direction: 'FORWARD' }] },
              criteria: [
                { label: 'ה-Agent מגיע לתחנת היעד', type: 'reachedStation' },
                { label: 'החבילה מונחת למטה', type: 'placeDirection', direction: 'DOWN' }
              ]
            },
            {
              title: 'תרגיל 3 - לא פורקים מוקדם מדי',
              mission: 'תקנו רק את מספר הצעדים האחרון כדי שהחבילה תונח ליד התחנה, לא באמצע השביל.',
              hint: 'הפעולה place כבר קיימת. בדקו את המספר בתנועה השנייה אחרי הפנייה.',
              check: 'ה-Agent מגיע עד התחנה ורק שם מניח את החבילה.',
              starter: { blocks: [{ type: 'teleport' }, { type: 'move', direction: 'FORWARD', steps: 4 }, { type: 'turn', turn: 'RIGHT_TURN' }, { type: 'move', direction: 'FORWARD', steps: 2 }, { type: 'place', direction: 'DOWN' }] },
              criteria: [
                { label: 'התנועה השנייה תוקנה ל-4 קוביות', type: 'secondMove', direction: 'FORWARD', steps: 4 },
                { label: 'החבילה נמצאת ליד התחנה', type: 'packageNearStation' }
              ]
            },
            {
              title: 'תרגיל 4 - סדר הפריקה',
              mission: 'תקנו שלד שבו החבילה מונחת לפני ההגעה. גררו את place לסוף המסלול.',
              hint: 'אם החבילה מופיעה בפינה, הסדר שגוי. place צריך לבוא אחרי התנועה האחרונה.',
              check: 'החבילה מונחת אחרי שה-Agent הגיע לתחנה.',
              starter: { blocks: [{ type: 'teleport' }, { type: 'move', direction: 'FORWARD', steps: 4 }, { type: 'turn', turn: 'RIGHT_TURN' }, { type: 'place', direction: 'DOWN' }, { type: 'move', direction: 'FORWARD', steps: 4 }] },
              criteria: [
                { label: 'ה-Agent מגיע לתחנת היעד', type: 'reachedStation' },
                { label: 'החבילה נמצאת ליד התחנה', type: 'packageNearStation' }
              ]
            },
            {
              title: 'תרגיל 5 - מודיעים שהחבילה נמסרה',
              mission: 'אחרי שהחבילה מונחת במקום, הוסיפו הודעת player say קצרה.',
              hint: 'אם כבר רואים חבילה ליד התחנה, חסר בלוק אחד מקטגוריית Player.',
              check: 'יש חבילה ליד התחנה וגם הודעת מסירה בסוף.',
              starter: { blocks: [{ type: 'teleport' }, { type: 'move', direction: 'FORWARD', steps: 4 }, { type: 'turn', turn: 'RIGHT_TURN' }, { type: 'move', direction: 'FORWARD', steps: 4 }, { type: 'place', direction: 'DOWN' }] },
              criteria: [
                { label: 'החבילה נמצאת ליד התחנה', type: 'packageNearStation' },
                { label: 'יש הודעת מסירה בסוף', type: 'arrivalSay' }
              ]
            },
            {
              title: 'אתגר קטן - תיקון פריקה',
              mission: 'תקנו חבילה שנפרקת בכיוון לא נכון, בלי לשנות את כל המסלול.',
              hint: 'המסלול וההודעה כבר כמעט נכונים. חפשו רק את התפריט בתוך בלוק place.',
              check: 'ה-Agent מגיע, מניח DOWN ליד התחנה ומודיע שהמשלוח הגיע.',
              starter: { blocks: [{ type: 'teleport' }, { type: 'move', direction: 'FORWARD', steps: 4 }, { type: 'turn', turn: 'RIGHT_TURN' }, { type: 'move', direction: 'FORWARD', steps: 4 }, { type: 'place', direction: 'FORWARD' }, { type: 'say', text: 'delivery arrived' }] },
              criteria: [
                { label: 'החבילה מונחת למטה', type: 'placeDirection', direction: 'DOWN' },
                { label: 'החבילה נמצאת ליד התחנה', type: 'packageNearStation' },
                { label: 'יש הודעת מסירה בסוף', type: 'arrivalSay' }
              ]
            }
          ]
        },
        goal: 'להראות שקוד יכול לשנות את העולם, לא רק להזיז דמות.',
        teacher: ['מזכירים את המסלול מהמפגש הקודם.', 'מדגימים הנחת בלוק או drop בתחנת היעד.', 'מבקשים מהתלמידים לבחור צבע/סימון משלוח קבוע.'],
        build: ['מקום מסומן לפריקת חבילה.', 'שלט יעד קצר.', 'מרחב מספיק ל-Agent לעמוד ולהניח או להפיל חבילה.'],
        code: ['agent.move(FORWARD, n)', 'agent.place(DOWN או FORWARD) או agent.drop()', 'player.say("המשלוח הגיע")'],
        evidence: ['יש תחנת משלוח מסומנת.', 'ה-Agent מניח או מפיל חבילה.', 'החבילה/הבלוק נמצאים קרוב ליעד.', 'יש הודעה או שלט שמסביר את התוצר.'],
        exit: 'מה השתנה בעולם בגלל הקוד שלכם?'
      },
      {
        goal: 'לחבר בנייה, רצף פקודות ודיבוג למסלול משלוחים אישי.',
        teacher: ['מזכירים: לא מוחקים הכול כשיש תקלה.', 'כל תלמיד מתכנן מסלול אישי קצר.', 'בודקים עם שותף: האם השליח הגיע והניח סימון?'],
        build: ['מסלול אישי עם התחלה ויעד.', 'לפחות פנייה אחת.', 'מקום למשלוח או סימון הצלחה.'],
        code: ['פקודת deliver מלאה.', 'תנועה אחת או יותר.', 'פנייה אחת לפחות.', 'הנחת בלוק, drop או הודעת הצלחה.'],
        evidence: ['המסלול אישי ולא מועתק אחד לאחד.', 'יש פקודה אחת שמפעילה את כל הרצף.', 'יש ניסיון בדיקה ותיקון.', 'התלמיד מסביר מה תוקן.'],
        exit: 'איזה צעד אחד תיקנתם אחרי בדיקה, ולמה?'
      }
    ],
    2: [
      {
        goal: 'להבין מתי קוד ו-Agent נותנים יתרון אמיתי: עבודה שחוזרת שוב ושוב בעיר.',
        teacher: ['פותחים בשאלה: אם צריך להעביר חבילה פעם אחת, אולי ידני מספיק; מה קורה כשצריך לעשות את זה כל הזמן?', 'מריצים שוב את deliver מאתגר 1 ומראים שהוא חד-פעמי.', 'מגדירים את הבעיה החדשה: קו משלוחים קבוע לשכונה או תחנה חדשה.'],
        build: ['מחסן/נקודת התחלה מהאתגר הקודם.', 'תחנת יעד חדשה או שכונה חדשה.', 'מסלול קצר וברור בין הנקודות.'],
        code: ['on chat command deliver', 'player.say("משלוח אחד הסתיים")', 'תכנון בעל פה של מחזור שחוזר'],
        evidence: ['ברור מה כבר קיים מאתגר 1.', 'יש צורך חדש בעיר: תחנה או שכונה נוספת.', 'התלמיד מסביר למה משלוח אחד לא מספיק.', 'מסומן מה צריך לחזור בלולאה.'],
        exit: 'איזו פעולה בעיר כדאי שה-Agent יעשה שוב ושוב, ולמה לא לבנות אותה ידנית?'
      },
      {
        goal: 'לבנות מחזור פעולה מלא שחוזר לנקודת התחלה לפני שמכניסים אותו ללולאה.',
        teacher: ['מדגישים: לפני לולאה צריך פעולה אחת שעובדת מהתחלה עד הסוף.', 'מדגימים יציאה מהמחסן, מסירה בתחנה וחזרה.', 'בודקים שה-Agent חוזר לנקודת התחלה, אחרת הלולאה תתרחק בכל סיבוב.'],
        build: ['שביל הלוך ושביל חזור או מסלול דו-כיווני ברור.', 'נקודת פריקה בתחנה.', 'סימון נקודת התחלה ל-Agent.'],
        code: ['agent.move(FORWARD, n)', 'agent.place(DOWN) או agent.drop()', 'agent.turn(LEFT_TURN/RIGHT_TURN)', 'חזרה לנקודת התחלה'],
        evidence: ['ה-Agent יוצא מהמחסן.', 'יש מסירה או סימון בתחנה.', 'ה-Agent חוזר להתחלה.', 'יש תיקון אם המחזור לא נסגר.'],
        exit: 'למה חשוב שה-Agent יחזור לנקודת התחלה לפני שמפעילים לולאה?'
      },
      {
        goal: 'להפעיל קו אוטומטי בלולאה אינסופית בצורה אחראית, עם start/stop ו-pause.',
        teacher: ['מגדירים משתנה running.', 'מדגימים פקודת start שמפעילה ופקודת stop שמכבה.', 'מסבירים שלולאה אינסופית בלי עצירה היא לא מערכת טובה.'],
        build: ['קו משלוחים שכבר עובד מסיבוב אחד.', 'שלט start/stop או אזור הפעלה בעיר.', 'מקום בטוח שבו ה-Agent ממתין בין סיבובים.'],
        code: ['let running = false', 'on chat command start: set running true', 'on chat command stop: set running false', 'forever: if running then delivery cycle', 'pause(500)'],
        evidence: ['יש משתנה running.', 'start מתחיל עבודה חוזרת.', 'stop עוצר את העבודה.', 'יש pause בין סיבובים.', 'התלמיד מסביר למה צריך עצירה.'],
        exit: 'מה יקרה אם תהיה לולאה אינסופית בלי stop או pause?'
      },
      {
        goal: 'לתכנן קו משלוחים אישי בעיר, לבדוק מחזור פעולה ולתקן אותו.',
        teacher: ['כל תלמיד בוחר מחסן ותחנה בעיר שלו.', 'דורשים מסלול שחוזר להתחלה, לא רק הלוך.', 'בודקים עם שותף שני סיבובים ברצף.'],
        build: ['מחסן אישי.', 'תחנת יעד אישית.', 'מסלול מחזורי עם סימון התחלה וסיום.'],
        code: ['פקודת cycle אישית.', 'מחזור משלוח בתוך לולאה של 3 חזרות.', 'פנייה אחת במסלול ושינוי מרחק/כיוון לפי בדיקה.'],
        evidence: ['הקו אישי ולא מועתק אחד לאחד.', 'ה-Agent משלים לפחות שני סיבובים.', 'יש עצירה בטוחה.', 'יש תיקון אחד מתועד.'],
        exit: 'איזה חלק במחזור היה צריך תיקון: הלוך, מסירה, חזרה או עצירה?'
      }
    ],
    3: [
      {
        goal: 'להבין שלמערכת חכמה יש מצב שהקוד צריך לבדוק או לזכור.',
        teacher: ['מחברים לאתגר 2: הקו עובד, אבל העיר לא תמיד באותו מצב.', 'מראים מצבים נראים: בלוק אדום/ירוק, שער, חסימה או תחנה מלאה.', 'בוחרים מצב אחד פשוט לעבוד איתו.'],
        build: ['קו משלוחים קיים.', 'סימון מצב נראה לעין ליד הדרך או התחנה.', 'שלט שמסביר מה אומר אדום/ירוק או פתוח/סגור.'],
        code: ['let routeOpen = true/false', 'אפשרות: agent.detect(FORWARD)', 'on chat command status', 'player.say("הדרך פתוחה/חסומה")'],
        evidence: ['יש קו משלוחים מאתגר 2.', 'יש מצב נראה בעולם.', 'יש משתנה או פקודה שמייצגת מצב.', 'התלמיד יודע להסביר מה המצב אומר.'],
        exit: 'איזה מצב העיר שלכם זוכרת או מציגה, ואיך רואים אותו בעולם?'
      },
      {
        goal: 'להוסיף תנאי פשוט לפני פעולה: אם הדרך מתאימה, ממשיכים; אחרת עוצרים.',
        teacher: ['מפרקים בקול: אם ירוק אז ממשיכים, אחרת עוצרים.', 'בודקים מצב פתוח ומצב סגור.', 'מתקנים רק את התנאי או רק את הסימון, לא את כל הקוד.'],
        build: ['בלוק ירוק/אדום או שער פתוח/סגור.', 'נקודת בדיקה לפני המשך המסלול.', 'אזור עצירה בטוח ל-Agent.'],
        code: ['if routeOpen then', 'agent.move(FORWARD, n)', 'else player.say("ממתין")'],
        evidence: ['יש if בקוד.', 'במצב פתוח ה-Agent ממשיך.', 'במצב סגור ה-Agent עוצר או מודיע.', 'נבדקו שני מצבים.'],
        exit: 'מה התנאי בודק לפני שה-Agent ממשיך?'
      },
      {
        goal: 'להוסיף התנהגות אחרת כשהמצב לא מתאים: המתנה, דיווח או מסלול חלופי.',
        teacher: ['מציעים שלוש תגובות אפשריות: לחכות, לדווח, לעקוף.', 'מבקשים לבחור תגובה אחת בלבד.', 'בודקים שהתגובה נראית בעולם או בצ׳אט.'],
        build: ['חסימה זמנית או שער.', 'מסלול חלופי קצר או נקודת המתנה.', 'סימון ברור לתקלה/חסימה.'],
        code: ['if routeOpen then delivery cycle', 'else: pause(1000) או player.say("הדרך חסומה")', 'אפשרות: agent.turn(...) למסלול חלופי'],
        evidence: ['יש else בקוד.', 'התגובה בזמן חסימה ברורה.', 'התגובה אינה שוברת את הלולאה.', 'התלמיד יודע להסביר מה קורה בכל מצב.'],
        exit: 'כשיש חסימה, בחרתם שה-Agent יחכה, ידווח או יעקוף? למה?'
      },
      {
        goal: 'לבנות חוק חכם אישי ולבדוק אותו בשני תרחישים שונים.',
        teacher: ['כל תלמיד כותב משפט חוק לפני קוד: אם ___ אז ___ אחרת ___.', 'מגבילים לחוק אחד כדי לסיים טוב.', 'בודקים עם שותף מצב תקין ומצב לא תקין.'],
        build: ['קו אישי מאתגר 2.', 'מצב נראה אחד שהתלמיד בוחר.', 'שלט או סימון שמסביר את החוק.'],
        code: ['כלל if/else אישי.', 'פקודת status או test.', 'שינוי ערך/סימון והרצה בשני מצבים.'],
        evidence: ['יש חוק אישי ברור.', 'יש סימון מצב בעולם.', 'נבדקו שני תרחישים.', 'התלמיד מסביר את if/else במילים שלו.'],
        exit: 'כתבו את החוק שלכם במשפט אחד: אם ___ אז ___ אחרת ___.'
      }
    ],
    4: [
      {
        goal: 'למפות את העיר שכבר נבנתה ולבחור אילו אוטומציות כדאי להוסיף או לשדרג.',
        teacher: ['מזכירים מה כבר יש בעיר: משלוח אחד, קו אוטומטי, ותנאי חכם.', 'מבקשים לסמן שתי מערכות בעיר שאפשר לשדרג.', 'כותבים אלגוריתם קצר לכל אוטומציה לפני שמתחילים לקודד.'],
        build: ['שתי מערכות מסומנות בעיר האישית.', 'שלטים שמסבירים מה כל מערכת אמורה לעשות.', 'סימון התחלה/סיום לכל אוטומציה.'],
        code: ['אלגוריתם מילולי לכל מערכת', 'בחירה אילו פקודות צריך: start, test, demo', 'החלטה אם צריך רצף, לולאה או תנאי'],
        evidence: ['מסומנות שתי מערכות בעיר.', 'יש הסבר מה כבר קיים ומה מתווסף.', 'יש אלגוריתם מילולי לכל אוטומציה.', 'ברור איך יודעים שכל אוטומציה עבדה.'],
        exit: 'אילו שתי מערכות בעיר אתם רוצים לשדרג, ואיזו אוטומציה חדשה תוסיפו לכל אחת?'
      },
      {
        goal: 'להוסיף אוטומציה חדשה ראשונה לעיר ולוודא שהיא עושה שינוי ברור בעולם.',
        teacher: ['מדגישים: קודם אוטומציה אחת שעובדת, אחר כך מוסיפים או מחברים עוד אחת.', 'מבקשים ש-start יפעיל פעולה שרואים בעולם.', 'בודקים שהאוטומציה החדשה לא שוברת את הקו הקיים.'],
        build: ['מערכת חדשה או שדרוג ראשון למערכת קיימת.', 'שלט שם למערכת.', 'סימון המקום שבו האוטומציה מתחילה ופועלת.'],
        code: ['on chat command start', 'פעולה אוטומטית: תנועה, מסירה, פתיחה, הנחה, שינוי צבע או סיור', 'אפשרות: שילוב loop או if לפי הצורך'],
        evidence: ['פקודת start קיימת.', 'יש אוטומציה חדשה שנראית בעולם.', 'האוטומציה קשורה למערכת עירונית.', 'התלמיד מסביר איזה רעיון תכנותי היא משתמשת בו.'],
        exit: 'איזו אוטומציה חדשה הוספתם לעיר, ומה מפעיל אותה?'
      },
      {
        goal: 'לבדוק שתי אוטומציות בעיר ולתקן תקלה אחת בלי לפרק את כל הפרויקט.',
        teacher: ['מבקשים להריץ test גם על האוטומציה החדשה וגם על מערכת קיימת.', 'מחפשים תקלה קטנה: כיוון, מרחק, מקום, זמן המתנה או תנאי.', 'כותבים לפני/אחרי כדי להראות תהליך.'],
        build: ['שתי מערכות פעילות באותה עיר.', 'סימון תקלה או אזור תיקון.', 'שיפור קטן שמחבר טוב יותר בין המערכות.'],
        code: ['on chat command test', 'בדיקה לאוטומציה חדשה', 'בדיקה למערכת קיימת', 'תיקון שורה/מספר/כיוון/מיקום/תנאי אחד'],
        evidence: ['פקודת test קיימת או יש בדיקה מסודרת.', 'נבדקו לפחות שתי אוטומציות.', 'בוצע תיקון אחד.', 'יש הסבר למה התיקון עזר לעיר.'],
        exit: 'אילו שתי אוטומציות בדקתם, ומה תיקנתם באחת מהן?'
      },
      {
        goal: 'להציג עיר חכמה שבה כמה אוטומציות עובדות יחד ולספר מה השתדרג.',
        teacher: ['מכינים הצגה קצרה של דקה.', 'דורשים demo שמראה יותר ממערכת אחת.', 'מסיימים במשפט אישי: מה היה בעיר לפני, ומה נוסף עכשיו.'],
        build: ['עיר מסודרת להצגה.', 'לפחות שתי מערכות/אוטומציות מסומנות.', 'שלט שמסביר למבקר מה רואים בכל מערכת.'],
        code: ['on chat command demo', 'הרצת start או רצף הצגה קצר', 'הצגת אוטומציה חדשה + מערכת קיימת', 'הודעת סיום'],
        evidence: ['פקודת demo או הצגה חיה קיימת.', 'כמה אוטומציות עובדות מול קהל.', 'התלמיד מסביר מה כל קטע קוד עושה.', 'יש תיעוד של בדיקה ותיקון.'],
        exit: 'מה היה בעיר לפני אתגר 4, אילו אוטומציות הוספתם, ומה תיקנתם בדרך?'
      }
    ]
  };

  const straightWorld = {
    start: { x: 112, y: 230 },
    station: { x: 322, y: 230 },
    routeTiles: [
      { x: 154, y: 230 },
      { x: 196, y: 230 },
      { x: 238, y: 230 },
      { x: 280, y: 230 },
      { x: 322, y: 230 }
    ]
  };

  const turnWorld = {
    start: { x: 112, y: 146 },
    station: { x: 280, y: 314 },
    routeTiles: [
      { x: 154, y: 146 },
      { x: 196, y: 146 },
      { x: 238, y: 146 },
      { x: 280, y: 146 },
      { x: 280, y: 188 },
      { x: 280, y: 230 },
      { x: 280, y: 272 },
      { x: 280, y: 314 }
    ]
  };

  function setAcademy(challengeId, lessonIndex, academy) {
    detailsByChallenge[challengeId][lessonIndex].academy = academy;
  }

  function personalCourierAcademy() {
    return {
      title: 'אקדמיית ה-Agent - שליח עצמאי',
      story: 'מסיימים את אתגר השליח: התלמיד כבר מכיר תנועה, פנייה ופריקה. עכשיו הוא מתרגל איך לבנות מסלול אישי קטן, לבדוק אותו, ולתקן רק דבר אחד בכל פעם לפני היישום במיינקראפט.',
      world: turnWorld,
      exercises: [
        {
          title: 'תרגיל 1 - פקודת משלוח אישית',
          mission: 'צרו פקודת deliver שמזמנת את ה-Agent ומתחילה מסלול אישי עם תנועה אחת.',
          hint: 'אל תבנו הכול בבת אחת. התחילו מ-teleport ואז move אחד.',
          check: 'יש פקודת deliver, זימון ותנועה ראשונה.',
          starter: { blocks: [{ type: 'teleport' }] },
          criteria: [
            { label: 'פקודת deliver קיימת', type: 'chatDeliver' },
            { label: 'יש תנועה ראשונה במסלול', type: 'moveCount', min: 1 }
          ]
        },
        {
          title: 'תרגיל 2 - מוסיפים פנייה אישית',
          mission: 'הוסיפו פנייה אחת אחרי התנועה הראשונה.',
          hint: 'הפנייה צריכה לבוא אחרי שה-Agent כבר התקדם קצת.',
          check: 'יש תנועה לפני פנייה.',
          starter: { blocks: [{ type: 'teleport' }, { type: 'move', direction: 'FORWARD', steps: 4 }] },
          criteria: [
            { label: 'יש בלוק פנייה', type: 'turn' },
            { label: 'התנועה מגיעה לפני הפנייה', type: 'moveBeforeTurn' }
          ]
        },
        {
          title: 'תרגיל 3 - מסיימים בתחנה',
          mission: 'הוסיפו תנועה אחרי הפנייה כדי להגיע לתחנה.',
          hint: 'חפשו רצף קצר: move, turn, move.',
          check: 'ה-Agent מגיע לתחנה עם שתי תנועות ופנייה באמצע.',
          starter: { blocks: [{ type: 'teleport' }, { type: 'move', direction: 'FORWARD', steps: 4 }, { type: 'turn', turn: 'RIGHT_TURN' }] },
          criteria: [
            { label: 'יש שתי תנועות במסלול', type: 'moveCount', min: 2 },
            { label: 'ה-Agent מגיע לתחנת היעד', type: 'reachedStation' }
          ]
        },
        {
          title: 'תרגיל 4 - מוסיפים סימון הצלחה',
          mission: 'כשה-Agent מגיע לתחנה, הניחו חבילה או סימון.',
          hint: 'אם המסלול כבר מגיע לתחנה, חסר רק place בסוף.',
          check: 'החבילה מונחת ליד התחנה.',
          starter: { blocks: [{ type: 'teleport' }, { type: 'move', direction: 'FORWARD', steps: 4 }, { type: 'turn', turn: 'RIGHT_TURN' }, { type: 'move', direction: 'FORWARD', steps: 4 }] },
          criteria: [
            { label: 'ה-Agent מגיע לתחנת היעד', type: 'reachedStation' },
            { label: 'החבילה נמצאת ליד התחנה', type: 'packageNearStation' }
          ]
        },
        {
          title: 'תרגיל 5 - מסבירים מה קרה',
          mission: 'הוסיפו הודעת player say שמסבירה שהמשלוח הסתיים.',
          hint: 'ההודעה שייכת לסוף הרצף, אחרי ההגעה והסימון.',
          check: 'יש חבילה והודעת סיום.',
          starter: { blocks: [{ type: 'teleport' }, { type: 'move', direction: 'FORWARD', steps: 4 }, { type: 'turn', turn: 'RIGHT_TURN' }, { type: 'move', direction: 'FORWARD', steps: 4 }, { type: 'place', direction: 'DOWN' }] },
          criteria: [
            { label: 'החבילה נמצאת ליד התחנה', type: 'packageNearStation' },
            { label: 'יש הודעת סיום', type: 'arrivalSay' }
          ]
        },
        {
          title: 'אתגר קטן - דיבוג מסלול אישי',
          mission: 'תקנו שלד שבו המרחק האחרון שגוי, בלי לשנות את כל המסלול.',
          hint: 'חפשו מספר אחד בתנועה שאחרי הפנייה.',
          check: 'אחרי התיקון ה-Agent מגיע, מניח חבילה ומודיע.',
          starter: { blocks: [{ type: 'teleport' }, { type: 'move', direction: 'FORWARD', steps: 4 }, { type: 'turn', turn: 'RIGHT_TURN' }, { type: 'move', direction: 'FORWARD', steps: 6 }, { type: 'place', direction: 'DOWN' }, { type: 'say', text: 'delivery arrived' }] },
          criteria: [
            { label: 'התנועה השנייה תוקנה ל-4 קוביות', type: 'secondMove', direction: 'FORWARD', steps: 4 },
            { label: 'החבילה נמצאת ליד התחנה', type: 'packageNearStation' },
            { label: 'יש הודעת סיום', type: 'arrivalSay' }
          ]
        }
      ]
    };
  }

  function loopAcademy(title, story, command = 'start') {
    return {
      title,
      story,
      command,
      world: straightWorld,
      exercises: [
        {
          title: 'תרגיל 1 - מזהים פעולה שחוזרת',
          mission: 'צרו פקודת start והוסיפו repeat כדי לסמן שהמשלוח צריך לחזור יותר מפעם אחת.',
          hint: 'חפשו ב-Loops בלוק repeat. עוד לא צריך מחזור מלא.',
          check: 'יש פקודת start ויש בלוק repeat.',
          starter: { command, blocks: [{ type: 'teleport' }] },
          criteria: [
            { label: 'פקודת start קיימת', type: 'command', command },
            { label: 'יש בלוק repeat', type: 'repeat' }
          ]
        },
        {
          title: 'תרגיל 2 - שני סיבובים',
          mission: 'שנו את repeat כך שירוץ 2 פעמים.',
          hint: 'אל תשכפלו ידנית את הקוד. שנו את המספר בתוך repeat.',
          check: 'ה-repeat מוגדר ל-2.',
          starter: { command, blocks: [{ type: 'teleport' }, { type: 'repeat', times: 1, blocks: [{ type: 'move', direction: 'FORWARD', steps: 5 }] }] },
          criteria: [
            { label: 'יש בלוק repeat', type: 'repeat' },
            { label: 'ה-repeat מוגדר ל-2', type: 'repeatTimes', times: 2 }
          ]
        },
        {
          title: 'תרגיל 3 - פעולה בתוך הלולאה',
          mission: 'הכניסו agent place לתוך repeat כדי שכל סיבוב יניח חבילה.',
          hint: 'ה-place צריך להיות בתוך גוף הלולאה, לא רק אחרי שהיא מסתיימת.',
          check: 'הלולאה יוצרת לפחות שתי חבילות.',
          starter: { command, blocks: [{ type: 'teleport' }, { type: 'repeat', times: 2, blocks: [{ type: 'move', direction: 'FORWARD', steps: 5 }] }] },
          criteria: [
            { label: 'ה-repeat מוגדר ל-2', type: 'repeatTimes', times: 2 },
            { label: 'יש לפחות שתי הנחות חבילה', type: 'placeCount', min: 2 }
          ]
        },
        {
          title: 'תרגיל 4 - חוזרים להתחלה',
          mission: 'הוסיפו תנועה BACK בסוף המחזור כדי שה-Agent יחזור להתחלה.',
          hint: 'לולאה טובה צריכה להתחיל כל סיבוב מאותו מקום.',
          check: 'בסוף ההרצה ה-Agent חוזר קרוב למחסן.',
          starter: { command, blocks: [{ type: 'teleport' }, { type: 'repeat', times: 2, blocks: [{ type: 'move', direction: 'FORWARD', steps: 5 }, { type: 'place', direction: 'DOWN' }] }] },
          criteria: [
            { label: 'יש בלוק repeat', type: 'repeat' },
            { label: 'ה-Agent חוזר לנקודת ההתחלה', type: 'returnToStart' }
          ]
        },
        {
          title: 'תרגיל 5 - הודעת מערכת',
          mission: 'הוסיפו player say שמסביר שהקו האוטומטי עבד.',
          hint: 'ההודעה יכולה להיות אחרי הלולאה, כדי לסמן שהבדיקה הסתיימה.',
          check: 'יש לולאה והודעת הצלחה.',
          starter: { command, blocks: [{ type: 'teleport' }, { type: 'repeat', times: 2, blocks: [{ type: 'move', direction: 'FORWARD', steps: 5 }, { type: 'place', direction: 'DOWN' }, { type: 'move', direction: 'BACK', steps: 5 }] }] },
          criteria: [
            { label: 'יש בלוק repeat', type: 'repeat' },
            { label: 'יש הודעת הצלחה', type: 'say' }
          ]
        },
        {
          title: 'אתגר קטן - מחזור מלא',
          mission: 'תקנו את מספר הסיבובים ל-2 והשלימו מחזור: יציאה, פריקה, חזרה והודעה.',
          hint: 'חפשו מספר אחד בתוך repeat ואז בדקו אם ה-Agent חוזר להתחלה.',
          check: 'יש שני סיבובים, חבילות, חזרה והודעה.',
          starter: { command, blocks: [{ type: 'teleport' }, { type: 'repeat', times: 1, blocks: [{ type: 'move', direction: 'FORWARD', steps: 5 }, { type: 'place', direction: 'DOWN' }, { type: 'move', direction: 'BACK', steps: 5 }] }] },
          criteria: [
            { label: 'ה-repeat מוגדר ל-2', type: 'repeatTimes', times: 2 },
            { label: 'יש לפחות שתי הנחות חבילה', type: 'placeCount', min: 2 },
            { label: 'ה-Agent חוזר לנקודת ההתחלה', type: 'returnToStart' },
            { label: 'יש הודעת הצלחה', type: 'say' }
          ]
        }
      ]
    };
  }

  function repeatIntroAcademy() {
    return {
      title: 'אקדמיית ה-Agent - למה צריך לולאה',
      story: 'מפגש 5 הוא שער הכניסה ללולאות: אתם רואים שמשלוח אחד עובד, אבל חזרה ידנית על אותם בלוקים יוצרת קוד ארוך ומבלבל. כאן מתרגלים להחליף שכפול ב-repeat קטן וברור.',
      command: 'start',
      world: straightWorld,
      exercises: [
        {
          title: 'תרגיל 1 - מוצאים פעולה שחוזרת',
          mission: 'צרו פקודת start עם תנועה והנחת חבילה אחת, ואז סמנו שזו פעולה שיכולה לחזור.',
          hint: 'התחילו מרצף קצר מאוד: teleport, move, place.',
          check: 'יש התחלה, תנועה והנחת חבילה אחת.',
          starter: { command: 'start', blocks: [{ type: 'teleport' }] },
          criteria: [
            { label: 'פקודת start קיימת', type: 'command', command: 'start' },
            { label: 'יש פעולה שנראית בעולם', type: 'place' }
          ]
        },
        {
          title: 'תרגיל 2 - לא משכפלים בלוקים',
          mission: 'הכניסו את פעולת המשלוח לתוך repeat במקום להעתיק אותה פעמיים.',
          hint: 'חפשו בלוק repeat וגררו לתוכו את הפעולות שחוזרות.',
          check: 'יש repeat ויש בתוכו פעולת משלוח.',
          starter: { command: 'start', blocks: [{ type: 'teleport' }, { type: 'move', direction: 'FORWARD', steps: 5 }, { type: 'place', direction: 'DOWN' }] },
          criteria: [
            { label: 'יש בלוק repeat', type: 'repeat' },
            { label: 'יש לפחות שתי הנחות חבילה', type: 'placeCount', min: 2 }
          ]
        },
        {
          title: 'תרגיל 3 - בוחרים כמה פעמים',
          mission: 'שנו את מספר החזרות ל-3 כדי לראות שהמספר שולט בכמות העבודה.',
          hint: 'משנים רק את המספר בתוך repeat, לא מוסיפים עוד בלוקים זהים.',
          check: 'ה-repeat מוגדר ל-3.',
          starter: { command: 'start', blocks: [{ type: 'teleport' }, { type: 'repeat', times: 2, blocks: [{ type: 'move', direction: 'FORWARD', steps: 5 }, { type: 'place', direction: 'DOWN' }] }] },
          criteria: [
            { label: 'ה-repeat מוגדר ל-3', type: 'repeatTimes', times: 3 },
            { label: 'יש לפחות שלוש הנחות חבילה', type: 'placeCount', min: 3 }
          ]
        },
        {
          title: 'תרגיל 4 - פעולה קצרה וברורה',
          mission: 'שמרו בתוך הלולאה רק את הפעולות שחוזרות: תנועה והנחת חבילה.',
          hint: 'teleport שייך להתחלה. הלולאה צריכה להכיל את הפעולה החוזרת.',
          check: 'יש repeat, תנועה וחבילות חוזרות.',
          starter: { command: 'start', blocks: [{ type: 'teleport' }, { type: 'repeat', times: 3, blocks: [{ type: 'move', direction: 'FORWARD', steps: 5 }] }] },
          criteria: [
            { label: 'יש בלוק repeat', type: 'repeat' },
            { label: 'יש לפחות שלוש הנחות חבילה', type: 'placeCount', min: 3 }
          ]
        },
        {
          title: 'תרגיל 5 - הודעה אחרי הלולאה',
          mission: 'הוסיפו הודעה שמסבירה שכל המשלוחים החוזרים הסתיימו.',
          hint: 'ההודעה יכולה להיות אחרי repeat, כסיכום של כל הפעולה.',
          check: 'יש לולאה והודעת סיום.',
          starter: { command: 'start', blocks: [{ type: 'teleport' }, { type: 'repeat', times: 3, blocks: [{ type: 'move', direction: 'FORWARD', steps: 5 }, { type: 'place', direction: 'DOWN' }] }] },
          criteria: [
            { label: 'ה-repeat מוגדר ל-3', type: 'repeatTimes', times: 3 },
            { label: 'יש הודעת סיום', type: 'say' }
          ]
        },
        {
          title: 'אתגר קטן - מקוד ארוך לקוד קצר',
          mission: 'תקנו שלד ארוך ומבולגן כך שישתמש ב-repeat אחד של 3 חזרות.',
          hint: 'המטרה היא פחות שכפול ויותר שליטה במספר החזרות.',
          check: 'יש repeat אחד שמייצג 3 משלוחים חוזרים והודעת סיום.',
          starter: { command: 'start', blocks: [{ type: 'teleport' }, { type: 'move', direction: 'FORWARD', steps: 5 }, { type: 'place', direction: 'DOWN' }, { type: 'move', direction: 'FORWARD', steps: 5 }, { type: 'place', direction: 'DOWN' }] },
          criteria: [
            { label: 'יש בלוק repeat', type: 'repeat' },
            { label: 'ה-repeat מוגדר ל-3', type: 'repeatTimes', times: 3 },
            { label: 'יש הודעת סיום', type: 'say' }
          ]
        }
      ]
    };
  }

  function returnCycleAcademy() {
    return {
      title: 'אקדמיית ה-Agent - הלוך וחזור',
      story: 'מפגש 6 כבר לא שואל למה צריך לולאה, אלא איך בונים מחזור פעולה יציב: יציאה מהמחסן, מסירה, וחזרה להתחלה. רק אחרי שהמחזור חוזר לנקודת פתיחה אפשר להפוך אותו לקו אוטומטי.',
      command: 'start',
      world: straightWorld,
      exercises: [
        {
          title: 'תרגיל 1 - יוצאים מהמחסן',
          mission: 'צרו פקודת start שמזמנת את ה-Agent ומזיזה אותו 5 קוביות קדימה לתחנה.',
          hint: 'במפגש הזה מתרגלים מסלול הלוך-חזור. מתחילים רק מההלוך.',
          check: 'ה-Agent יוצא מהמחסן ומגיע לתחנה.',
          starter: { command: 'start', blocks: [{ type: 'teleport' }] },
          criteria: [
            { label: 'פקודת start קיימת', type: 'command', command: 'start' },
            { label: 'התנועה הראשונה היא 5 קוביות קדימה', type: 'firstMove', direction: 'FORWARD', steps: 5 }
          ]
        },
        {
          title: 'תרגיל 2 - מסירה בתחנה',
          mission: 'הוסיפו place בסוף הדרך כדי לסמן שהחבילה נמסרה.',
          hint: 'קודם מגיעים לתחנה, אחר כך מניחים סימון.',
          check: 'החבילה מונחת ליד התחנה.',
          starter: { command: 'start', blocks: [{ type: 'teleport' }, { type: 'move', direction: 'FORWARD', steps: 5 }] },
          criteria: [
            { label: 'ה-Agent מגיע לתחנת היעד', type: 'reachedStation' },
            { label: 'החבילה נמצאת ליד התחנה', type: 'packageNearStation' }
          ]
        },
        {
          title: 'תרגיל 3 - חוזרים למחסן',
          mission: 'הוסיפו תנועה BACK של 5 קוביות אחרי המסירה.',
          hint: 'חזרה להתחלה היא פעולה אחרת מהמשך קדימה.',
          check: 'בסוף ההרצה ה-Agent חוזר לנקודת ההתחלה.',
          starter: { command: 'start', blocks: [{ type: 'teleport' }, { type: 'move', direction: 'FORWARD', steps: 5 }, { type: 'place', direction: 'DOWN' }] },
          criteria: [
            { label: 'התנועה השנייה היא חזרה 5 קוביות', type: 'secondMove', direction: 'BACK', steps: 5 },
            { label: 'ה-Agent חוזר לנקודת ההתחלה', type: 'returnToStart' }
          ]
        },
        {
          title: 'תרגיל 4 - מתקנים חזרה קצרה מדי',
          mission: 'תקנו שלד שבו ה-Agent חוזר רק 3 קוביות, כך שיחזור למחסן.',
          hint: 'אל תשנו את ההלוך. חפשו את המספר בתנועת BACK.',
          check: 'ה-Agent מסיים קרוב למחסן.',
          starter: { command: 'start', blocks: [{ type: 'teleport' }, { type: 'move', direction: 'FORWARD', steps: 5 }, { type: 'place', direction: 'DOWN' }, { type: 'move', direction: 'BACK', steps: 3 }] },
          criteria: [
            { label: 'תנועת החזרה תוקנה ל-5', type: 'secondMove', direction: 'BACK', steps: 5 },
            { label: 'ה-Agent חוזר לנקודת ההתחלה', type: 'returnToStart' }
          ]
        },
        {
          title: 'תרגיל 5 - מחזור מוכן ללולאה',
          mission: 'עטפו את המחזור המלא ב-repeat של 2 חזרות.',
          hint: 'רק אחרי שיש הלוך, מסירה וחזור מכניסים את הכול ללולאה.',
          check: 'יש שני מחזורים שחוזרים לנקודת התחלה.',
          starter: { command: 'start', blocks: [{ type: 'teleport' }, { type: 'move', direction: 'FORWARD', steps: 5 }, { type: 'place', direction: 'DOWN' }, { type: 'move', direction: 'BACK', steps: 5 }] },
          criteria: [
            { label: 'ה-repeat מוגדר ל-2', type: 'repeatTimes', times: 2 },
            { label: 'ה-Agent חוזר לנקודת ההתחלה', type: 'returnToStart' }
          ]
        },
        {
          title: 'אתגר קטן - מחזור יציב',
          mission: 'השלימו מחזור לולאה מלא: יציאה, מסירה, חזרה והודעת סיום.',
          hint: 'בדקו שה-Agent לא נשאר בתחנה אחרי הסיבוב האחרון.',
          check: 'יש repeat, חבילות, חזרה להתחלה והודעה.',
          starter: { command: 'start', blocks: [{ type: 'teleport' }, { type: 'repeat', times: 2, blocks: [{ type: 'move', direction: 'FORWARD', steps: 5 }, { type: 'place', direction: 'DOWN' }] }] },
          criteria: [
            { label: 'ה-repeat מוגדר ל-2', type: 'repeatTimes', times: 2 },
            { label: 'יש לפחות שתי הנחות חבילה', type: 'placeCount', min: 2 },
            { label: 'ה-Agent חוזר לנקודת ההתחלה', type: 'returnToStart' },
            { label: 'יש הודעת סיום', type: 'say' }
          ]
        }
      ]
    };
  }

  function personalLoopAcademy() {
    const academy = loopAcademy(
      'אקדמיית ה-Agent - קו אישי בעיר',
      'במפגש 8 התלמיד כבר מכיר מחזור ולולאה. עכשיו הוא משנה את הקו כך שיהיה אישי: מספר סיבובים אחר, פנייה אחת במסלול, וחזרה מסודרת לנקודת ההתחלה.',
      'cycle'
    );
    academy.world = turnWorld;
    academy.exercises = [
      {
        title: 'תרגיל 1 - פקודת cycle אישית',
        mission: 'צרו פקודת cycle שמזמנת את ה-Agent ומתחילה מסלול עם תנועה ופנייה אחת.',
        hint: 'בקו אישי לא חייבים להישאר במסלול ישר. התחילו מ-teleport, move ואז turn.',
        check: 'יש פקודת cycle ויש פנייה במסלול.',
        starter: { command: 'cycle', blocks: [{ type: 'teleport' }, { type: 'move', direction: 'FORWARD', steps: 4 }] },
        criteria: [
          { label: 'פקודת cycle קיימת', type: 'command', command: 'cycle' },
          { label: 'יש פנייה במסלול', type: 'turn' }
        ]
      },
      {
        title: 'תרגיל 2 - שני קטעי מסלול',
        mission: 'הוסיפו תנועה אחרי הפנייה, כך שהקו יהיה בנוי משני קטעים ולא רק הלוך וחזור ישר.',
        hint: 'חפשו רצף קצר: move, turn, move.',
        check: 'יש שתי תנועות ופנייה ביניהן.',
        starter: { command: 'cycle', blocks: [{ type: 'teleport' }, { type: 'move', direction: 'FORWARD', steps: 4 }, { type: 'turn', turn: 'RIGHT_TURN' }] },
        criteria: [
          { label: 'יש שתי תנועות במסלול', type: 'moveCount', min: 2 },
          { label: 'הפנייה לפני התנועה השנייה', type: 'turnBeforeSecondMove' }
        ]
      },
      {
        title: 'תרגיל 3 - לולאה של שלושה סיבובים',
        mission: 'עטפו את הקו האישי ב-repeat של 3 חזרות.',
        hint: 'השינוי כאן הוא מספר החזרות והמסלול האישי, לא רק אותו מחזור משיעור קודם.',
        check: 'ה-repeat מוגדר ל-3 ויש פנייה במסלול.',
        starter: { command: 'cycle', blocks: [{ type: 'teleport' }, { type: 'repeat', times: 2, blocks: [{ type: 'move', direction: 'FORWARD', steps: 4 }, { type: 'turn', turn: 'RIGHT_TURN' }, { type: 'move', direction: 'FORWARD', steps: 3 }] }] },
        criteria: [
          { label: 'ה-repeat מוגדר ל-3', type: 'repeatTimes', times: 3 },
          { label: 'יש פנייה במסלול האישי', type: 'turn' }
        ]
      },
      {
        title: 'תרגיל 4 - סימון בכל סיבוב',
        mission: 'הוסיפו place בתוך הלולאה כדי שכל סיבוב יסמן תחנה אישית.',
        hint: 'ה-place צריך להיות בתוך repeat, לא רק בסוף.',
        check: 'יש לפחות שלושה סימונים.',
        starter: { command: 'cycle', blocks: [{ type: 'teleport' }, { type: 'repeat', times: 3, blocks: [{ type: 'move', direction: 'FORWARD', steps: 4 }, { type: 'turn', turn: 'RIGHT_TURN' }, { type: 'move', direction: 'FORWARD', steps: 3 }] }] },
        criteria: [
          { label: 'ה-repeat מוגדר ל-3', type: 'repeatTimes', times: 3 },
          { label: 'יש לפחות שלוש הנחות חבילה', type: 'placeCount', min: 3 }
        ]
      },
      {
        title: 'תרגיל 5 - מסבירים קו אישי',
        mission: 'הוסיפו הודעת player say שמסבירה שזה הקו האישי שלכם.',
        hint: 'ההודעה צריכה לעזור למי שבודק להבין מה הקו עושה.',
        check: 'יש לולאה, פנייה והודעה.',
        starter: { command: 'cycle', blocks: [{ type: 'teleport' }, { type: 'repeat', times: 3, blocks: [{ type: 'move', direction: 'FORWARD', steps: 4 }, { type: 'turn', turn: 'RIGHT_TURN' }, { type: 'move', direction: 'FORWARD', steps: 3 }, { type: 'place', direction: 'DOWN' }] }] },
        criteria: [
          { label: 'יש פנייה במסלול', type: 'turn' },
          { label: 'יש הודעת הסבר', type: 'say' }
        ]
      },
      {
        title: 'אתגר קטן - שינוי אישי אחד',
        mission: 'תקנו מסלול אישי שבו חסרה פנייה או שמספר החזרות לא מתאים.',
        hint: 'בחרו תיקון אחד: פנייה, מספר חזרות או מקום ההנחה.',
        check: 'יש cycle, repeat של 3, פנייה, סימון והודעה.',
        starter: { command: 'cycle', blocks: [{ type: 'teleport' }, { type: 'repeat', times: 2, blocks: [{ type: 'move', direction: 'FORWARD', steps: 4 }, { type: 'move', direction: 'FORWARD', steps: 3 }, { type: 'place', direction: 'DOWN' }] }] },
        criteria: [
          { label: 'פקודת cycle קיימת', type: 'command', command: 'cycle' },
          { label: 'ה-repeat מוגדר ל-3', type: 'repeatTimes', times: 3 },
          { label: 'יש פנייה במסלול', type: 'turn' },
          { label: 'יש הודעת הסבר', type: 'say' }
        ]
      }
    ];
    return academy;
  }

  function conditionAcademy(title, story, command = 'status') {
    return {
      title,
      story,
      command,
      world: straightWorld,
      exercises: [
        {
          title: 'תרגיל 1 - מצב בעיר',
          mission: `צרו פקודת ${command} והוסיפו בלוק if routeOpen כדי שהקוד יבדוק מצב.`,
          hint: 'חפשו ב-Logic את בלוק התנאי. עוד לא צריך מסלול מלא.',
          check: `יש פקודת ${command} ויש תנאי.`,
          starter: { command, blocks: [{ type: 'teleport' }] },
          criteria: [
            { label: `פקודת ${command} קיימת`, type: 'command', command },
            { label: 'יש בלוק תנאי', type: 'condition' }
          ]
        },
        {
          title: 'תרגיל 2 - אם הדרך פתוחה',
          mission: 'בתוך then הוסיפו תנועה קדימה כדי שה-Agent ימשיך רק כשהדרך פתוחה.',
          hint: 'התנועה צריכה להיות בתוך החלק של then.',
          check: 'התנאי בודק OPEN ויש תנועה במסלול.',
          starter: { command, blocks: [{ type: 'teleport' }, { type: 'ifRoute', state: 'OPEN', then: [], else: [] }] },
          criteria: [
            { label: 'התנאי בודק דרך פתוחה', type: 'conditionState', state: 'OPEN' },
            { label: 'יש תנועת Agent בתוך הבדיקה', type: 'moveCount', min: 1 }
          ]
        },
        {
          title: 'תרגיל 3 - אחרת מדווחים',
          mission: 'הוסיפו ל-else הודעה שמסבירה שהדרך חסומה.',
          hint: 'התגובה לחסימה צריכה להיות בענף else, לא אחרי כל התנאי.',
          check: 'יש else ויש הודעת דיווח.',
          starter: { command, blocks: [{ type: 'teleport' }, { type: 'ifRoute', state: 'BLOCKED', then: [{ type: 'move', direction: 'FORWARD', steps: 5 }], else: [] }] },
          criteria: [
            { label: 'יש ענף else', type: 'elseBranch' },
            { label: 'יש הודעת דיווח', type: 'say' }
          ]
        },
        {
          title: 'תרגיל 4 - לא מתקדמים בזמן חסימה',
          mission: 'תקנו תנאי חסום כך שבמצב BLOCKED ה-Agent לא ינסה לנסוע קדימה.',
          hint: 'במצב חסום עדיף הודעה או המתנה, לא move קדימה.',
          check: 'הקוד משתמש בתנאי חסום ובהודעה במקום תנועה.',
          starter: { command, blocks: [{ type: 'teleport' }, { type: 'ifRoute', state: 'BLOCKED', then: [{ type: 'move', direction: 'FORWARD', steps: 5 }], else: [] }] },
          criteria: [
            { label: 'התנאי בודק מצב חסום', type: 'conditionState', state: 'BLOCKED' },
            { label: 'יש הודעה על מצב הדרך', type: 'say' }
          ]
        },
        {
          title: 'תרגיל 5 - משלוח רק כשאפשר',
          mission: 'בנו בתוך then רצף קצר של נסיעה והנחת חבילה.',
          hint: 'אם הדרך פתוחה, ה-Agent יכול לנסוע ואז place.',
          check: 'במצב פתוח ה-Agent מגיע ומניח חבילה.',
          starter: { command, blocks: [{ type: 'teleport' }, { type: 'ifRoute', state: 'OPEN', then: [{ type: 'move', direction: 'FORWARD', steps: 3 }], else: [{ type: 'say', text: 'blocked' }] }] },
          criteria: [
            { label: 'התנאי בודק דרך פתוחה', type: 'conditionState', state: 'OPEN' },
            { label: 'החבילה נמצאת ליד התחנה', type: 'packageNearStation' }
          ]
        },
        {
          title: 'אתגר קטן - חוק חכם',
          mission: 'השלימו חוק מלא: אם פתוח נוסעים ומניחים, אחרת מודיעים.',
          hint: 'צריך שני ענפים: then לפעולה, else לדיווח.',
          check: 'יש תנאי, else, חבילה ליד התחנה והודעה.',
          starter: { command, blocks: [{ type: 'teleport' }, { type: 'ifRoute', state: 'OPEN', then: [{ type: 'move', direction: 'FORWARD', steps: 5 }], else: [] }] },
          criteria: [
            { label: 'יש בלוק תנאי', type: 'condition' },
            { label: 'יש ענף else', type: 'elseBranch' },
            { label: 'החבילה נמצאת ליד התחנה', type: 'packageNearStation' },
            { label: 'יש הודעת דיווח בענף else', type: 'elseSay' }
          ]
        }
      ]
    };
  }

  function signalConditionAcademy() {
    const academy = conditionAcademy('אקדמיית ה-Agent - מצב בעיר', 'מפגש 9 מתמקד בעצם הסימון: לפני שה-Agent מחליט, העיר צריכה להראות מצב ברור כמו פתוח/חסום. לכן התרגול כאן קצר ומדגיש דיווח מצב, לא משלוח מלא.', 'status');
    academy.exercises[1].title = 'תרגיל 2 - מדווחים כשהדרך פתוחה';
    academy.exercises[1].mission = 'בתוך then הוסיפו הודעה שמדווחת שהדרך פתוחה, בלי להפעיל עדיין משלוח מלא.';
    academy.exercises[1].starter = { command: 'status', blocks: [{ type: 'teleport' }, { type: 'ifRoute', state: 'OPEN', then: [], else: [] }] };
    academy.exercises[1].criteria = [
      { label: 'התנאי בודק דרך פתוחה', type: 'conditionState', state: 'OPEN' },
      { label: 'יש הודעת מצב', type: 'say' }
    ];
    academy.exercises[4].title = 'תרגיל 5 - שני מצבים בשלט';
    academy.exercises[4].mission = 'הוסיפו else כך שהקוד יוכל לדווח גם כשפתוח וגם כשחסום.';
    academy.exercises[4].criteria = [
      { label: 'יש בלוק תנאי', type: 'condition' },
      { label: 'יש ענף else', type: 'elseBranch' },
      { label: 'יש הודעת מצב', type: 'say' }
    ];
    return academy;
  }

  function openGateAcademy() {
    const academy = conditionAcademy('אקדמיית ה-Agent - אם הדרך פתוחה', 'מפגש 10 עובר מדיווח למעבר בשער: אם הדרך פתוחה ה-Agent נוסע ומניח סימון, ואם לא הוא עוצר ומודיע. זה תרגול של החלטה לפני תנועה.', 'start');
    academy.exercises[0].title = 'תרגיל 1 - תנאי לפני נסיעה';
    academy.exercises[0].mission = 'צרו פקודת start עם if routeOpen לפני כל תנועה.';
    academy.exercises[1].title = 'תרגיל 2 - עוברים רק כשפתוח';
    academy.exercises[1].mission = 'בתוך then הוסיפו תנועה של 5 צעדים קדימה, ורק שם.';
    academy.exercises[2].title = 'תרגיל 3 - ממתינים כשהשער סגור';
    academy.exercises[2].mission = 'ב-else הוסיפו הודעה קצרה: ממתינים לפתיחת הדרך.';
    academy.exercises[3].title = 'תרגיל 4 - לא שוברים שער סגור';
    academy.exercises[4].title = 'תרגיל 5 - סימון מעבר מוצלח';
    academy.exercises[4].mission = 'במצב OPEN הוסיפו גם place בסוף המעבר כדי לסמן שהשער עבר בהצלחה.';
    academy.exercises[5].title = 'אתגר קטן - שער פתוח וסגור';
    return academy;
  }

  function blockedRouteAcademy() {
    const academy = conditionAcademy('אקדמיית ה-Agent - מחכים או עוקפים', 'מפגש 11 מתמקד בצד השני של התנאי: מה עושים כשהדרך חסומה. כאן אתם לא רק כותבים else, אלא מוסיפים תגובת עצירה/דיווח ואפשרות פנייה למסלול חלופי.', 'test');
    academy.exercises[0].title = 'תרגיל 1 - בדיקת חסימה';
    academy.exercises[0].mission = 'צרו פקודת test שבודקת מצב חסום בעזרת if routeOpen.';
    academy.exercises[0].criteria = [
      { label: 'פקודת test קיימת', type: 'command', command: 'test' },
      { label: 'יש בלוק תנאי', type: 'condition' }
    ];
    academy.exercises[1].title = 'תרגיל 2 - לא נוסעים כשחסום';
    academy.exercises[1].mission = 'הגדירו את התנאי על BLOCKED והוסיפו הודעה במקום תנועה קדימה.';
    academy.exercises[1].starter = { command: 'test', blocks: [{ type: 'teleport' }, { type: 'ifRoute', state: 'BLOCKED', then: [{ type: 'move', direction: 'FORWARD', steps: 5 }], else: [] }] };
    academy.exercises[1].criteria = [
      { label: 'התנאי בודק מצב חסום', type: 'conditionState', state: 'BLOCKED' },
      { label: 'יש הודעה על חסימה', type: 'say' }
    ];
    academy.exercises[2].title = 'תרגיל 3 - הודעת חסימה ברורה';
    academy.exercises[2].mission = 'ב-else כתבו הודעה שמסבירה למה ה-Agent לא ממשיך.';
    academy.exercises[3].title = 'תרגיל 4 - מתקנים נסיעה לתוך חסימה';
    academy.exercises[4].title = 'תרגיל 5 - מסלול חלופי קטן';
    academy.exercises[4].mission = 'הוסיפו פנייה אחת כדי לסמן בחירה במסלול חלופי בזמן חסימה.';
    academy.exercises[4].criteria = [
      { label: 'התנאי בודק מצב חסום', type: 'conditionState', state: 'BLOCKED' },
      { label: 'יש פנייה למסלול חלופי', type: 'turn' },
      { label: 'יש הודעת דיווח', type: 'say' }
    ];
    academy.exercises[5].title = 'אתגר קטן - חסימה ותגובה';
    return academy;
  }

  function personalRuleAcademy() {
    const academy = conditionAcademy('אקדמיית ה-Agent - חוק חכם אישי', 'מפגש 12 מסכם תנאים דרך חוק אישי: התלמיד בוחר פעולה אחת למצב פתוח ותגובה אחרת למצב חסום. הדגש הוא בדיקת שני מצבים ושינוי קטן לפי החוק שלו.', 'rule');
    academy.exercises[0].title = 'תרגיל 1 - פקודת rule';
    academy.exercises[0].mission = 'צרו פקודת rule עם תנאי if routeOpen.';
    academy.exercises[0].criteria = [
      { label: 'פקודת rule קיימת', type: 'command', command: 'rule' },
      { label: 'יש בלוק תנאי', type: 'condition' }
    ];
    academy.exercises[1].title = 'תרגיל 2 - פעולה כשהחוק מתקיים';
    academy.exercises[2].title = 'תרגיל 3 - תגובה אישית אחרת';
    academy.exercises[2].mission = 'ב-else כתבו הודעה אישית שמסבירה מה עושים כשהחוק לא מתקיים.';
    academy.exercises[3].title = 'תרגיל 4 - בדיקת שני מצבים';
    academy.exercises[4].title = 'תרגיל 5 - פעולה וסימון';
    academy.exercises[4].mission = 'במצב פתוח הוסיפו גם נסיעה וגם place כדי שהחוק ישאיר סימן בעולם.';
    academy.exercises[5].title = 'אתגר קטן - החוק שלי';
    academy.exercises[5].mission = 'השלימו חוק אישי מלא: אם פתוח נוסעים ומסמנים, אחרת כותבים הודעה אחרת.';
    return academy;
  }

  function projectAcademy(title, story, command = 'demo') {
    return {
      title,
      story,
      command,
      world: straightWorld,
      exercises: [
        {
          title: 'תרגיל 1 - בוחרים פקודת פרויקט',
          mission: 'צרו פקודת demo או test שמתחילה בדיקה של מערכת אחת בעיר.',
          hint: 'בחרו שם פקודה שמתאים לשלב: test לבדיקה או demo להצגה.',
          check: 'יש פקודת פרויקט ויש תנועה ראשונה.',
          starter: { command, blocks: [{ type: 'teleport' }] },
          criteria: [
            { label: 'פקודת הפרויקט קיימת', type: 'command', command },
            { label: 'יש תנועת Agent', type: 'moveCount', min: 1 }
          ]
        },
        {
          title: 'תרגיל 2 - מערכת אחת שעובדת',
          mission: 'הוסיפו פעולה שרואים בעולם: נסיעה והנחת סימון.',
          hint: 'פרויקט טוב מתחיל במערכת אחת שרואים שהיא עובדת.',
          check: 'ה-Agent מגיע לתחנה ומניח סימון.',
          starter: { command, blocks: [{ type: 'teleport' }, { type: 'move', direction: 'FORWARD', steps: 5 }] },
          criteria: [
            { label: 'ה-Agent מגיע לתחנת היעד', type: 'reachedStation' },
            { label: 'יש בלוק הנחת סימון', type: 'place' }
          ]
        },
        {
          title: 'תרגיל 3 - מוסיפים רעיון שני',
          mission: 'הוסיפו repeat או if כדי שהפרויקט לא יהיה רק רצף רגיל.',
          hint: 'בחרו אחד: repeat למשהו שחוזר, או if למצב שהעיר בודקת.',
          check: 'יש רעיון מתקדם אחד: לולאה או תנאי.',
          starter: { command, blocks: [{ type: 'teleport' }, { type: 'move', direction: 'FORWARD', steps: 5 }, { type: 'place', direction: 'DOWN' }] },
          criteria: [
            { label: 'יש לולאה או תנאי', type: 'repeatOrCondition' },
            { label: 'יש פעולה שנראית בעולם', type: 'place' }
          ]
        },
        {
          title: 'תרגיל 4 - בדיקה עם הודעה',
          mission: 'הוסיפו player say שמסביר מה המערכת בדקה.',
          hint: 'הודעת הסבר עוזרת למי שרואה את הדמו להבין מה קרה.',
          check: 'יש פעולה בעולם ויש הודעת הסבר.',
          starter: { command, blocks: [{ type: 'teleport' }, { type: 'move', direction: 'FORWARD', steps: 5 }, { type: 'place', direction: 'DOWN' }] },
          criteria: [
            { label: 'יש פעולה שנראית בעולם', type: 'place' },
            { label: 'יש הודעת הסבר', type: 'say' }
          ]
        },
        {
          title: 'תרגיל 5 - מתקנים דבר אחד',
          mission: 'תקנו מספר שגורם ל-Agent לעצור לפני התחנה.',
          hint: 'אל תשנו את כל הקוד. חפשו את מספר הצעדים.',
          check: 'אחרי התיקון ה-Agent מגיע לתחנה ומניח סימון.',
          starter: { command, blocks: [{ type: 'teleport' }, { type: 'move', direction: 'FORWARD', steps: 3 }, { type: 'place', direction: 'DOWN' }, { type: 'say', text: 'test done' }] },
          criteria: [
            { label: 'ה-Agent מגיע לתחנת היעד', type: 'reachedStation' },
            { label: 'החבילה נמצאת ליד התחנה', type: 'packageNearStation' }
          ]
        },
        {
          title: 'אתגר קטן - דמו קצר',
          mission: 'השלימו הדגמה קצרה: פעולה בעולם, רעיון מתקדם אחד והודעת סיום.',
          hint: 'הדמו לא צריך להיות ארוך. הוא צריך להיות ברור.',
          check: 'יש פעולה, לולאה או תנאי, והודעת סיום.',
          starter: { command, blocks: [{ type: 'teleport' }, { type: 'move', direction: 'FORWARD', steps: 5 }, { type: 'place', direction: 'DOWN' }] },
          criteria: [
            { label: 'יש פעולה שנראית בעולם', type: 'place' },
            { label: 'יש לולאה או תנאי', type: 'repeatOrCondition' },
            { label: 'יש הודעת סיום', type: 'say' }
          ]
        }
      ]
    };
  }

  function cityMapAcademy() {
    const academy = projectAcademy('אקדמיית ה-Agent - ממפים את העיר', 'מפגש 13 הוא תכנון לפני בנייה: התלמיד מסמן שתי מערכות בעיר ומכין פקודת plan שמסבירה מה ייבדק, בלי להפוך את זה עדיין לדמו מלא.', 'plan');
    academy.exercises[0].title = 'תרגיל 1 - פקודת plan';
    academy.exercises[0].mission = 'צרו פקודת plan שמתחילה בהודעה על מערכת אחת בעיר.';
    academy.exercises[0].criteria = [
      { label: 'פקודת plan קיימת', type: 'command', command: 'plan' },
      { label: 'יש הודעת תכנון', type: 'say' }
    ];
    academy.exercises[1].title = 'תרגיל 2 - מסמנים מערכת ראשונה';
    academy.exercises[1].mission = 'הוסיפו תנועה קצרה ו-place כדי לסמן איפה מערכת אחת נמצאת.';
    academy.exercises[2].title = 'תרגיל 3 - מוסיפים רעיון לשדרוג';
    academy.exercises[2].mission = 'הוסיפו repeat או if רק כדי לסמן איזה רעיון תכנותי מתאים למערכת.';
    academy.exercises[5].title = 'אתגר קטן - תוכנית לשתי מערכות';
    academy.exercises[5].mission = 'צרו תכנון קצר עם הודעה, סימון מערכת, ורעיון מתקדם אחד לשדרוג.';
    return academy;
  }

  function newAutomationAcademy() {
    const academy = projectAcademy('אקדמיית ה-Agent - אוטומציה חדשה', 'מפגש 14 כבר בונה אוטומציה אחת חדשה: פעולה שנראית בעולם, פקודת start, וסימון ברור שהתלמיד יכול להעביר למיינקראפט.', 'start');
    academy.exercises[0].title = 'תרגיל 1 - פקודת start למערכת חדשה';
    academy.exercises[0].mission = 'צרו פקודת start שמזיזה את ה-Agent 4 צעדים למערכת החדשה.';
    academy.exercises[0].criteria = [
      { label: 'פקודת start קיימת', type: 'command', command: 'start' },
      { label: 'התנועה הראשונה היא 4 קוביות', type: 'firstMove', direction: 'FORWARD', steps: 4 }
    ];
    academy.exercises[1].title = 'תרגיל 2 - סימון קדימה';
    academy.exercises[1].mission = 'הוסיפו place FORWARD כדי שהאוטומציה תשאיר סימון מול ה-Agent.';
    academy.exercises[1].criteria = [
      { label: 'יש הנחה קדימה', type: 'placeDirection', direction: 'FORWARD' }
    ];
    academy.exercises[2].title = 'תרגיל 3 - שדרוג בלולאה או תנאי';
    academy.exercises[3].title = 'תרגיל 4 - הודעת מערכת חדשה';
    academy.exercises[4].title = 'תרגיל 5 - מתקנים מרחק למערכת';
    academy.exercises[4].mission = 'תקנו מספר שגורם ל-Agent לעבור את המערכת החדשה במקום לעצור לידה.';
    academy.exercises[5].title = 'אתגר קטן - אוטומציה חדשה עובדת';
    return academy;
  }

  function debugAutomationAcademy() {
    const academy = projectAcademy('אקדמיית ה-Agent - בדיקה ותיקון', 'מפגש 15 מתמקד בבדיקה: מריצים test, מוצאים מספר או סדר שגוי, ומתקנים רק דבר אחד. לכן התרגילים מתחילים משגיאה קטנה ולא מבנייה נקייה.', 'test');
    academy.exercises[0].title = 'תרגיל 1 - פקודת test';
    academy.exercises[0].mission = 'צרו פקודת test שמריצה בדיקה קצרה ומודיעה מה נבדק.';
    academy.exercises[0].criteria = [
      { label: 'פקודת test קיימת', type: 'command', command: 'test' },
      { label: 'יש הודעת בדיקה', type: 'say' }
    ];
    academy.exercises[1].title = 'תרגיל 2 - מזהים מספר שגוי';
    academy.exercises[1].mission = 'תקנו תנועה של 3 צעדים ל-5 כדי שה-Agent יגיע לתחנה.';
    academy.exercises[1].starter = { command: 'test', blocks: [{ type: 'teleport' }, { type: 'move', direction: 'FORWARD', steps: 3 }, { type: 'place', direction: 'DOWN' }] };
    academy.exercises[1].criteria = [
      { label: 'התנועה הראשונה תוקנה ל-5', type: 'firstMove', direction: 'FORWARD', steps: 5 },
      { label: 'החבילה נמצאת ליד התחנה', type: 'packageNearStation' }
    ];
    academy.exercises[2].title = 'תרגיל 3 - בדיקת רעיון מתקדם';
    academy.exercises[3].title = 'תרגיל 4 - הודעת תוצאה';
    academy.exercises[4].title = 'תרגיל 5 - מתקנים רק דבר אחד';
    academy.exercises[4].mission = 'השאירו את רוב הרצף כמו שהוא ותקנו רק מספר אחד כדי שהבדיקה תעבור.';
    academy.exercises[5].title = 'אתגר קטן - לפני ואחרי תיקון';
    return academy;
  }

  function demoCityAcademy() {
    const academy = projectAcademy('אקדמיית ה-Agent - דמו עיר חכמה', 'מפגש 16 הוא הצגה: פקודת demo צריכה להראות פעולה, רעיון תכנותי אחד והודעת סיום. זה לא עוד test, אלא רצף קצר שמסביר למבקר מה עובד בעיר.', 'demo');
    academy.exercises[0].title = 'תרגיל 1 - פקודת demo';
    academy.exercises[0].mission = 'צרו פקודת demo עם הודעת פתיחה קצרה.';
    academy.exercises[0].criteria = [
      { label: 'פקודת demo קיימת', type: 'command', command: 'demo' },
      { label: 'יש הודעת פתיחה', type: 'say' }
    ];
    academy.exercises[1].title = 'תרגיל 2 - פעולה שרואים בדמו';
    academy.exercises[2].title = 'תרגיל 3 - רעיון תכנותי בדמו';
    academy.exercises[2].mission = 'הוסיפו repeat או if כדי שהדמו יראה רעיון תכנותי אחד שלמדתם.';
    academy.exercises[3].title = 'תרגיל 4 - הודעת סיום לדמו';
    academy.exercises[3].mission = 'הוסיפו player say בסוף שמסביר מה הצופה ראה.';
    academy.exercises[5].title = 'אתגר קטן - דמו עם פתיחה וסיום';
    academy.exercises[5].mission = 'השלימו דמו קצר עם הודעת פתיחה, פעולה בעולם, רעיון מתקדם והודעת סיום.';
    return academy;
  }

  setAcademy(1, 3, personalCourierAcademy());
  setAcademy(2, 0, repeatIntroAcademy());
  setAcademy(2, 1, returnCycleAcademy());
  setAcademy(2, 2, loopAcademy('אקדמיית ה-Agent - קו אוטומטי', 'עכשיו מחברים את המחזור ללולאה: repeat מייצג עבודה חוזרת, הודעה מסבירה מה קרה, והבדיקה מוודאת שה-Agent לא נתקע רחוק מהמחסן.', 'start'));
  setAcademy(2, 3, personalLoopAcademy());
  setAcademy(3, 0, signalConditionAcademy());
  setAcademy(3, 1, openGateAcademy());
  setAcademy(3, 2, blockedRouteAcademy());
  setAcademy(3, 3, personalRuleAcademy());
  setAcademy(4, 0, cityMapAcademy());
  setAcademy(4, 1, newAutomationAcademy());
  setAcademy(4, 2, debugAutomationAcademy());
  setAcademy(4, 3, demoCityAcademy());

  challenges.forEach(challenge => {
    challenge.meetings = challenge.meetings.map((meeting, index) => [
      ...meeting,
      detailsByChallenge[challenge.id][index]
    ]);
  });

  const lessons = challenges.flatMap(challenge => challenge.meetings.map((meeting, index) => ({
    id: ((challenge.id - 1) * 4) + index + 1,
    challengeId: challenge.id,
    meetingIndex: index + 1,
    meetingCode: meeting[0],
    title: meeting[1],
    summary: meeting[2],
    deliverable: meeting[3],
    detail: meeting[4],
    challengeTitle: challenge.title,
    concept: challenge.concept,
    video: challenge.video,
    poster: challenge.poster,
    command: challenge.command
  })));

  const program = {
    title: 'אקדמיית ה-Agent במיינקראפט',
    subtitle: 'לומדה לעבודה עצמית בארבעה אתגרים שנבנים בהמשכים על אותה עיר: משלוח ראשון, קו אוטומטי, החלטות חכמות והוספת אוטומציות.',
    grade: 'חטיבת ביניים',
    platform: 'Minecraft Education + Craftom + MakeCode',
    overviewVideo: `${videoBase}craftom-program-real-minecraft-gemini-live-1x.mp4`,
    overviewPoster: 'assets/craftom/challenges/my-smart-city-1-plan.webp',
    totalChallenges: 4,
    meetingsPerChallenge: 4,
    totalMeetings: 16,
    plot: 'מגרש אישי 50x50 לכל תלמיד/צוות, שמתפתח לעיר אחת לאורך כל הקורס',
    outcomes: [
      'בכל שיעור אתם רואים מה המשימה, בונים חלק קטן בעיר ומפעילים אותו בקוד MakeCode קצר.',
      'כל אתגר ממשיך את הקודם: רצף, לולאה, תנאי ואז הוספת אוטומציות לעיר החכמה.',
      'ה-Agent מבצע פעולות שנראות בעולם: נוסע, מניח/מפיל חבילה, חוזר, עוצר ומחליט.',
      'כל מפגש משאיר ראיות Craftom: צילום של הבנייה במיינקראפט, פקודות, בדיקה, תיקון והסבר.',
      'אתם יודעים לבד מה לעשות עכשיו ומה צריך להראות בסוף.'
    ],
    rules: [
      'עובדים רק במגרש האישי.',
      'לא מוחקים את העיר בין אתגרים: כל אתגר מוסיף שכבה חדשה.',
      'קודם בונים משהו קטן וברור, אחר כך כותבים קוד שמפעיל אותו.',
      'בכל תקלה מתקנים דבר אחד ומריצים שוב.',
      'בסוף כל מפגש מעלים צילום של מה שנבנה ומה שה-Agent הפעיל, יחד עם תשובת כרטיס יציאה קצרה.'
    ],
    exitUpload: 'העלו צילום של מה שבניתם במיינקראפט ומה שה-Agent עשה, ואז כתבו תשובה קצרה לכרטיס היציאה.',
    challenges,
    lessons
  };

  window.CRAFTOM_MINECRAFT_PROGRAM = program;
  window.getCraftomMinecraftChallenge = function getCraftomMinecraftChallenge(value) {
    const id = Number(value || 1);
    return challenges.find(challenge => challenge.id === id) || challenges[0];
  };
  window.getCraftomMinecraftLesson = function getCraftomMinecraftLesson(value) {
    const id = Number(value || 1);
    return lessons.find(lesson => lesson.id === id) || lessons[0];
  };
})();
