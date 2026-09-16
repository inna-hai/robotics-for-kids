(function () {
  const checklistItems = ['מקור', 'בקשה', 'לחץ', 'קישור', 'הקשר', 'אימות'];
  const lessonSteps = ['מתחילים', 'בודקים ראיות', 'בוחרים תשובה', 'מקבלים משוב', 'מתקדמים', 'תג סיום'];
  const challengeGoals = {
    classify: 'מצאו את הדבר החשוב בסיפור ובחרו תשובה אחת.',
    safety: 'בחרו פעולה בטוחה. לא לוחצים, לא מוסרים פרטים, ולא ממשיכים לבד.',
    evidence: 'הסתכלו על הרמזים. מה באמת יודעים? מה רק חשד?',
    decision: 'בחרו מה הכי בטוח לעשות עכשיו.',
    confidence: 'שימו לב אם ההודעה מלחיצה אתכם. לחץ הוא רמז חשוב.'
  };
  const learnerChecklist = {
    classify: ['1. קראו', '2. מצאו רמז', '3. בחרו'],
    safety: ['1. עצרו', '2. אל תלחצו', '3. דווחו'],
    evidence: ['1. קראו רמזים', '2. חשבו', '3. בחרו'],
    decision: ['1. בדקו שולח', '2. בדקו בקשה', '3. בחרו בטוח'],
    confidence: ['1. יש לחץ?', '2. חסר מידע?', '3. צריך לבדוק?']
  };

  const missions = [
    {
      id: 'intro-assets',
      title: 'מה אנחנו מגינים עליו?',
      level: 'Warm-up',
      type: 'classify',
      district: 'HQ',
      recommended: true,
      scenario: 'מרכז המבצעים פותח את שיעור הסייבר הראשון. לפני שמגיבים לאיום צריך להבין מה נחשב נכס דיגיטלי בעיר.',
      evidence: [
        ['נכס', 'תיבת ההודעות של העיר משמשת לקבלת עדכונים ודיווחים.'],
        ['נכס', 'קוד אימות מאפשר להוכיח שזה באמת בעל החשבון.'],
        ['לא נכס', 'צבע הרקע של המסך לא משנה את רמת הסיכון.']
      ],
      prompt: 'איזה פריט הכי חשוב להגן עליו כרגע?',
      choices: [
        { text: 'תיבת ההודעות וקוד האימות', correct: true },
        { text: 'רק הצבע של מסך הכניסה', correct: false },
        { text: 'רק שם המשימה', correct: false }
      ],
      hints: ['חפשו משהו שאם ייחשף או ייפגע יכול לגרום נזק אמיתי בעיר.', 'קוד אימות ותיבת הודעות קשורים לזהות ולגישה.'],
      feedback: 'נכון. נכסים דיגיטליים הם דברים שיש להם ערך וצריך להגן עליהם: חשבונות, הודעות, קודים ומידע.',
      instructorNote: 'לחבר למפגש 1: נכס, איום, מגן ותוקף.',
      tags: ['נכסים', 'פתיחה']
    },
    {
      id: 'city-rules',
      title: 'חוקי העיר לפני פעולה',
      level: 'Warm-up',
      type: 'safety',
      district: 'HQ',
      recommended: true,
      scenario: 'הכיתה עומדת לפתוח אירוע בתחנת הדואר. לפני החקירה המדריך מזכיר: עובדים רק בסביבה המדומה.',
      evidence: [
        ['כלל', 'לא לוחצים על קישור חשוד.'],
        ['כלל', 'לא מוסרים סיסמה או קוד אימות.'],
        ['כלל', 'כשמשהו לא ברור - עוצרים ושואלים.']
      ],
      prompt: 'מה עושים אם מופיע מסך שלא ציפינו לראות?',
      choices: [
        { text: 'עוצרים, לא מרחיבים את הבדיקה, מתעדים ומדווחים למדריך', correct: true },
        { text: 'מנסים לבדוק לבד עוד כמה מסכים כדי להבין', correct: false },
        { text: 'משתפים את המסך בקבוצה אחרת כדי לקבל עזרה', correct: false }
      ],
      hints: ['יכולת טכנית אינה הרשאה.', 'הפעולה הבטוחה היא לעצור ולדווח, לא להמשיך לבד.'],
      feedback: 'מעולה. זה כלל הבטיחות המרכזי: אם אין אישור ברור, עוצרים ושואלים.',
      instructorNote: 'לחבר למפגש 3: יכולת טכנית אינה הרשאה.',
      tags: ['בטיחות', 'אתיקה']
    },
    {
      id: 'urgent-mail',
      title: 'הודעה דחופה בתחנת הדואר',
      level: 'Core',
      type: 'evidence',
      district: 'Mail Station',
      recommended: true,
      scenario: 'לתיבת ההודעות העירונית הגיעה הודעה: “זוהתה פעילות חריגה. אשרו מיד את הסיסמה וקוד האימות כדי למנוע חסימה”.',
      evidence: [
        ['מקור', 'כתובת השולח דומה לשירות מוכר, אבל כוללת סיומת מוזרה.'],
        ['בקשה', 'ההודעה מבקשת סיסמה וקוד אימות.'],
        ['לחץ', 'המילים “מיד” ו“חסימה” דוחפות לפעולה מהירה.']
      ],
      prompt: 'מהי ההחלטה הבטוחה?',
      choices: [
        { text: 'לא ללחוץ, לדווח, ולהגביל זמנית את החשבון עד בדיקת מקור', correct: true },
        { text: 'ללחוץ מהר כדי למנוע חסימה', correct: false },
        { text: 'למחוק את ההודעה בלי לדווח', correct: false }
      ],
      hints: ['בדקו מה ההודעה מבקשת מכם למסור.', 'סיסמה וקוד אימות לא מוסרים דרך קישור בהודעה.'],
      feedback: 'נכון. כשמבקשים סיסמה וקוד אימות עם לחץ זמן, עוצרים ומאמתים דרך ערוץ בטוח.',
      instructorNote: 'זו משימת הליבה של מפגש 5: מקור, בקשה, לחץ ואימות.',
      tags: ['פישינג', 'Mail Station']
    },
    {
      id: 'sender-check',
      title: 'השולח נראה מוכר מדי',
      level: 'Core',
      type: 'decision',
      district: 'Mail Station',
      recommended: true,
      scenario: 'הודעה נראית כאילו הגיעה מצוות התמיכה. הלוגו נכון, הטון מקצועי, אבל הכתובת אינה הכתובת הרשמית של המערכת.',
      evidence: [
        ['מראה', 'הלוגו והעיצוב נראים מקצועיים.'],
        ['מקור', 'כתובת השולח לא תואמת לכתובת הרשמית.'],
        ['הקשר', 'לא ציפינו לבקשת אימות היום.']
      ],
      prompt: 'איזו מחשבה הכי מדויקת?',
      choices: [
        { text: 'מראה מקצועי הוא סימן אחד בלבד; צריך לבדוק מקור והקשר', correct: true },
        { text: 'אם יש לוגו נכון, ההודעה אמיתית', correct: false },
        { text: 'אם אין שגיאות כתיב, אין סיבה לחשוד', correct: false }
      ],
      hints: ['האם אפשר לזייף לוגו או ניסוח?', 'אמינות בודקים לפי כמה סימנים יחד.'],
      feedback: 'בדיוק. הודעות מזויפות יכולות להיראות מצוין, במיוחד בעידן AI.',
      instructorNote: 'נגיעה ממפגש 7: ניסוח מקצועי אינו הוכחה.',
      tags: ['AI', 'אימות מקור']
    },
    {
      id: 'login-log',
      title: 'יומן כניסות כושלות',
      level: 'Core',
      type: 'evidence',
      district: 'Identity Vault',
      recommended: true,
      scenario: 'בזמן בדיקת הודעת הפישינג, יומן המערכת מציג שלושה ניסיונות כניסה כושלים לחשבון העירוני.',
      evidence: [
        ['Log', 'שלושה ניסיונות כניסה נכשלו בתוך 4 דקות.'],
        ['זמן', 'הניסיונות הופיעו אחרי שנשלחה ההודעה החשודה.'],
        ['גבול', 'אין Evidence שמראה כניסה מוצלחת.']
      ],
      prompt: 'מה יודעים בוודאות?',
      choices: [
        { text: 'יש ניסיונות כניסה כושלים, אבל אין הוכחה שנכנסו לחשבון', correct: true },
        { text: 'בטוח שפרצו לחשבון', correct: false },
        { text: 'אין שום סיבה לחשוד', correct: false }
      ],
      hints: ['הפרידו בין חשד לבין עובדה.', 'כניסה כושלת אינה כניסה מוצלחת.'],
      feedback: 'נכון. Evidence טוב עוזר להיזהר בלי לקפוץ למסקנות שאין להן הוכחה.',
      instructorNote: 'לחבר למודל 4 השאלות ממפגש 4.',
      tags: ['Evidence', 'לוגים']
    },
    {
      id: 'emotion-pressure',
      title: 'מה ההודעה מנסה לגרום לנו להרגיש?',
      level: 'Upgrade',
      type: 'confidence',
      district: 'Human Layer',
      recommended: true,
      scenario: 'הודעה חדשה טוענת: “אם לא תאשרו עכשיו, כל אנשי הקשר בעיר יימחקו”.',
      evidence: [
        ['רגש', 'ההודעה מנסה להפעיל פחד.'],
        ['לחץ', 'יש דרישה לפעולה מיידית.'],
        ['בקשה', 'הפעולה המבוקשת היא אישור דרך קישור.']
      ],
      prompt: 'איזו שאלה כדאי לשאול לפני פעולה?',
      choices: [
        { text: 'מה רוצים שאאמין, מה רוצים שארגיש, ומה רוצים שאעשה?', correct: true },
        { text: 'איך אפשר ללחוץ מהר לפני שהזמן ייגמר?', correct: false },
        { text: 'איך אפשר לבדוק את הקישור מתוך אותה הודעה?', correct: false }
      ],
      hints: ['הרגש הוא Signal, לא הוכחה.', 'הנדסה חברתית מנסה לקצר את זמן החשיבה.'],
      feedback: 'מעולה. קודם מזהים את הלחץ והרגש, ואז מאמתים מקור בערוץ בטוח.',
      instructorNote: 'נגיעה ממפגש 6: מאמין-מרגיש-עושה.',
      tags: ['הנדסה חברתית', 'רגש']
    },
    {
      id: 'verify-source',
      title: 'איך מאמתים מקור?',
      level: 'Upgrade',
      type: 'decision',
      district: 'Mail Station',
      recommended: false,
      scenario: 'ההודעה כוללת כפתור “אימות חשבון”. התלמידים שואלים אם אפשר ללחוץ עליו רק כדי לבדוק.',
      evidence: [
        ['קישור', 'הכפתור מוביל לכתובת לא מוכרת.'],
        ['בקשה', 'הטופס מבקש פרטים רגישים.'],
        ['אימות', 'יש אתר רשמי שאפשר להגיע אליו בלי הקישור.']
      ],
      prompt: 'מהי דרך אימות בטוחה?',
      choices: [
        { text: 'להיכנס לשירות דרך הכתובת הרשמית או לשאול את הגורם המוכר בערוץ אחר', correct: true },
        { text: 'ללחוץ על הכפתור ולראות אם הדף נראה אמין', correct: false },
        { text: 'לענות להודעה ולשאול אם היא אמיתית', correct: false }
      ],
      hints: ['לא מאמתים דרך אותו ערוץ שעליו חושדים.', 'חפשו דרך שכבר הייתה מוכרת לפני ההודעה.'],
      feedback: 'נכון. אימות מקור עושים בערוץ נפרד ובטוח.',
      instructorNote: 'להדגיש: לא שואלים את ההודעה אם היא אמיתית.',
      tags: ['אימות', 'קישור']
    },
    {
      id: 'trust-classification',
      title: 'אמינה יחסית, חשודה או צריך לבדוק?',
      level: 'Upgrade',
      type: 'classify',
      district: 'Projector Arena',
      recommended: true,
      scenario: 'הודעה מספריית בית הספר מזכירה להחזיר ספר, אבל לא כוללת קישור ולא מבקשת מידע אישי.',
      evidence: [
        ['הקשר', 'התלמיד באמת שאל ספר בשבוע שעבר.'],
        ['בקשה', 'אין בקשה לסיסמה או קוד.'],
        ['אימות', 'אפשר לבדוק דרך אתר הספרייה בלי ללחוץ על קישור.']
      ],
      prompt: 'איך נסווג את ההודעה?',
      choices: [
        { text: 'אמינה יחסית, ועדיין אפשר לבדוק בערוץ רשמי', correct: true },
        { text: 'פישינג ודאי', correct: false },
        { text: 'מסוכנת כי כל הודעה היא מלכודת', correct: false }
      ],
      hints: ['לא כל הודעה היא מלכודת.', 'החלוקה אינה רק כן/לא: יש גם אמינה יחסית וצריך לבדוק.'],
      feedback: 'נכון. המטרה אינה לחשוד בכל דבר, אלא להפעיל שיקול דעת לפי Evidence.',
      instructorNote: 'נגיעה ממפגש 8: אמינה יחסית / חשודה / צריך לבדוק.',
      tags: ['סיכום', 'Confidence']
    },
    {
      id: 'ai-polished',
      title: 'הודעה בלי שגיאות',
      level: 'Challenge',
      type: 'decision',
      district: 'AI Hub',
      recommended: true,
      scenario: 'הודעה חשודה נראית כאילו נכתבה על ידי גורם מקצועי: בלי שגיאות, עם ניסוח מנומס ועם חתימה יפה.',
      evidence: [
        ['ניסוח', 'הטקסט מקצועי וברור.'],
        ['בקשה', 'עדיין מבקשים קוד אימות.'],
        ['מקור', 'הכתובת אינה מאומתת.']
      ],
      prompt: 'מה השתנה בעידן AI?',
      choices: [
        { text: 'אי אפשר להסתמך על שגיאות כתיב; בודקים מקור, בקשה, לחץ, הקשר ואימות', correct: true },
        { text: 'אם AI כתב את זה יפה, ההודעה אמינה', correct: false },
        { text: 'כל תוכן שנראה מקצועי חייב להיות אמיתי', correct: false }
      ],
      hints: ['AI יכול לשפר ניסוח בלי לשנות את הכוונה של ההודעה.', 'הבקשה לקוד אימות עדיין חשודה.'],
      feedback: 'בדיוק. ניסוח יפה אינו Evidence לאמינות.',
      instructorNote: 'נגיעה ממפגש 7: לא סומכים רק על ניסוח יפה.',
      tags: ['AI', 'פישינג']
    },
    {
      id: 'privacy-ai',
      title: 'האם לשאול AI על הודעה אמיתית?',
      level: 'Challenge',
      type: 'safety',
      district: 'AI Hub',
      recommended: false,
      scenario: 'תלמיד מציע להעתיק הודעה אמיתית שקיבל לטלפון לתוך כלי AI ולשאול אם היא פישינג.',
      evidence: [
        ['פרטיות', 'ההודעה עשויה להכיל שם, מספר או פרטים אישיים.'],
        ['גבול', 'התרגול עובד רק עם תוכן מדומה.'],
        ['כלל', 'לא מעלים מידע פרטי לכלי חיצוני.']
      ],
      prompt: 'מה ההחלטה הבטוחה?',
      choices: [
        { text: 'לא מעלים הודעה אמיתית. משתמשים בדוגמה מדומה או מוחקים פרטים מזהים באישור מדריך', correct: true },
        { text: 'מעלים הכול כי AI יודע לשמור סוד', correct: false },
        { text: 'שולחים את ההודעה לכל הכיתה כדי לקבל חוות דעת', correct: false }
      ],
      hints: ['כלי חכם לא צריך לקבל כל מידע שיש לנו.', 'התרגול בכיתה משתמש בדוגמאות מדומות בלבד.'],
      feedback: 'נכון. פרטיות היא חלק מההגנה הדיגיטלית.',
      instructorNote: 'להדגיש: אין הודעות אמיתיות, תמונות תלמידים או קודים.',
      tags: ['פרטיות', 'AI']
    },
    {
      id: 'safe-response',
      title: 'בחירת תגובה בטוחה',
      level: 'Challenge',
      type: 'decision',
      district: 'HQ',
      recommended: true,
      scenario: 'הכיתה אספה Evidence: כתובת שולח חריגה, בקשה לקוד אימות, לחץ זמן וניסיונות כניסה כושלים.',
      evidence: [
        ['Evidence 1', 'כתובת שולח חריגה.'],
        ['Evidence 2', 'בקשה לסיסמה וקוד אימות.'],
        ['Evidence 3', 'ניסיונות כניסה כושלים סמוך לזמן ההודעה.']
      ],
      prompt: 'מהי תגובת ההגנה המלאה ביותר?',
      choices: [
        { text: 'לדווח, לא ללחוץ, להגביל זמנית את החשבון, ולאמת מקור בערוץ רשמי', correct: true },
        { text: 'למחוק את ההודעה ולהמשיך כרגיל', correct: false },
        { text: 'ללחוץ כדי לאסוף עוד Evidence', correct: false }
      ],
      hints: ['תגובה טובה מצמצמת סיכון וגם משאירה מקום לבדיקה.', 'לא אוספים Evidence על ידי לחיצה על קישור חשוד.'],
      feedback: 'מעולה. זו תגובה הגנתית שלמה: דיווח, צמצום סיכון ואימות.',
      instructorNote: 'משימה מסכמת לפני Debrief.',
      tags: ['תגובה', 'סיכום']
    },
    {
      id: 'exit-ticket',
      title: 'כלל אחד שניקח איתנו',
      level: 'Debrief',
      type: 'confidence',
      district: 'HQ',
      recommended: false,
      scenario: 'לפני סיום השיעור הכיתה בוחרת כלל אחד שישמש אותה בכל הודעה דיגיטלית בעתיד.',
      evidence: [
        ['כלל', 'מראה מקצועי אינו מספיק.'],
        ['כלל', 'לא מוסרים סיסמה או קוד.'],
        ['כלל', 'כשאין מספיק מידע - צריך לבדוק.']
      ],
      prompt: 'איזה כלל הכי מתאים לסיכום?',
      choices: [
        { text: 'לפני פעולה רגישה עוצרים, בודקים Evidence ומאמתים מקור בערוץ בטוח', correct: true },
        { text: 'אם ההודעה יפה, אפשר לסמוך עליה', correct: false },
        { text: 'אם יש לחץ זמן, לוחצים מהר', correct: false }
      ],
      hints: ['הכלל צריך לעבוד גם בפישינג, גם בהנדסה חברתית וגם ב-AI.', 'חפשו כלל שמתחיל בעצירה ובדיקה.'],
      feedback: 'יפה. זהו הכלל המרכזי של מגן דיגיטלי.',
      instructorNote: 'סיום עם תג מגן עיר דיגיטלית.',
      tags: ['Debrief', 'תג']
    }
  ];

  const kidCopy = {
    'intro-assets': {
      title: 'מה חשוב להגן עליו?',
      scenario: 'בעיר הסייבר יש תיבת הודעות, קוד אימות וצבע רקע למסך. לא כל דבר חשוב באותה מידה.',
      evidence: [
        ['חשוב', 'תיבת הודעות יכולה להכיל מידע אישי.'],
        ['חשוב מאוד', 'קוד אימות יכול לפתוח חשבון.'],
        ['לא חשוב כרגע', 'צבע הרקע לא מסכן את החשבון.']
      ],
      prompt: 'על מה הכי חשוב לשמור?',
      choices: [
        { text: 'תיבת ההודעות וקוד האימות', correct: true },
        { text: 'רק צבע הרקע', correct: false },
        { text: 'רק שם המשחק', correct: false }
      ],
      hints: ['חפשו משהו שאם מישהו זר יקבל אותו, זה עלול להזיק.', 'קוד אימות הוא כמו מפתח קטן לחשבון.'],
      feedback: 'נכון. מגינים קודם על דברים שיכולים לפתוח חשבון או לחשוף מידע.'
    },
    'city-rules': {
      title: 'כלל הזהב של העיר',
      scenario: 'באמצע המשחק מופיע מסך שלא ציפיתם לראות. הוא נראה מסקרן, אבל לא ברור אם מותר להיכנס אליו.',
      evidence: [
        ['כלל', 'אם לא בטוחים שמותר - עוצרים.'],
        ['כלל', 'לא בודקים לבד מערכת לא מוכרת.'],
        ['כלל', 'מדווחים למדריך או למבוגר אחראי.']
      ],
      prompt: 'מה עושים?',
      choices: [
        { text: 'עוצרים ומדווחים', correct: true },
        { text: 'נכנסים לבד כדי לבדוק', correct: false },
        { text: 'שולחים לחברים שינסו גם', correct: false }
      ],
      hints: ['בסייבר, סקרנות בלי אישור יכולה להיות בעיה.', 'הבחירה הבטוחה מתחילה בעצירה.'],
      feedback: 'בול. אם לא בטוחים שמותר - עוצרים ושואלים.'
    },
    'urgent-mail': {
      title: 'הודעה מלחיצה',
      scenario: 'הגיעה הודעה: “החשבון שלך ייחסם עוד 5 דקות! לחץ כאן והכנס סיסמה וקוד אימות”.',
      evidence: [
        ['לחץ', 'יש איום של חסימה עוד 5 דקות.'],
        ['בקשה מסוכנת', 'מבקשים סיסמה וקוד אימות.'],
        ['קישור', 'מבקשים ללחוץ על קישור מתוך ההודעה.']
      ],
      prompt: 'מה הכי בטוח לעשות?',
      choices: [
        { text: 'לא ללחוץ. לדווח ולבדוק דרך אתר רשמי', correct: true },
        { text: 'ללחוץ מהר לפני שהחשבון ייחסם', correct: false },
        { text: 'לשלוח את הסיסמה כדי לסיים עם זה', correct: false }
      ],
      hints: ['כשמלחיצים אתכם לפעול מהר - זה רמז לעצור.', 'לא מוסרים סיסמה או קוד מתוך הודעה.'],
      feedback: 'נכון. לחץ + בקשת סיסמה הם סימנים חזקים להודעה חשודה.'
    },
    'sender-check': {
      title: 'הלוגו נראה אמיתי',
      scenario: 'הודעה נראית מקצועית ויש בה לוגו יפה. אבל כתובת השולח נראית קצת מוזרה.',
      evidence: [
        ['מראה', 'הלוגו נראה אמיתי.'],
        ['שולח', 'כתובת השולח לא נראית רשמית.'],
        ['הקשר', 'לא ביקשתם שום איפוס חשבון.']
      ],
      prompt: 'מה נכון לחשוב?',
      choices: [
        { text: 'לוגו יפה לא מספיק. צריך לבדוק שולח והקשר', correct: true },
        { text: 'אם יש לוגו, בטוח שזה אמיתי', correct: false },
        { text: 'אם הטקסט יפה, אין מה לבדוק', correct: false }
      ],
      hints: ['קל להעתיק לוגו.', 'הדבר החשוב הוא לא רק איך זה נראה, אלא מי שלח ומה מבקשים.'],
      feedback: 'נכון. הודעה יכולה להיראות יפה ועדיין להיות חשודה.'
    },
    'login-log': {
      title: 'ניסו להיכנס לחשבון',
      scenario: 'המערכת מראה 3 ניסיונות כניסה שנכשלו. זה קרה ליד הזמן שבו הגיעה הודעה חשודה.',
      evidence: [
        ['עובדה', 'היו 3 ניסיונות כניסה.'],
        ['עובדה', 'כולם נכשלו.'],
        ['חשוב', 'אין סימן שמישהו הצליח להיכנס.']
      ],
      prompt: 'מה אנחנו יודעים באמת?',
      choices: [
        { text: 'ניסו להיכנס, אבל לא רואים כניסה מוצלחת', correct: true },
        { text: 'בטוח שפרצו לחשבון', correct: false },
        { text: 'אין שום דבר חשוד', correct: false }
      ],
      hints: ['שימו לב להבדל בין ניסיון לבין הצלחה.', 'לא קופצים למסקנה בלי רמז ברור.'],
      feedback: 'יפה. מגינים טובים מפרידים בין עובדה לבין ניחוש.'
    },
    'emotion-pressure': {
      title: 'הודעה שמנסה להפחיד',
      scenario: 'הודעה אומרת: “אם לא תאשרו עכשיו, כל אנשי הקשר יימחקו”.',
      evidence: [
        ['רגש', 'ההודעה מנסה להפחיד.'],
        ['לחץ', 'מבקשים פעולה עכשיו.'],
        ['קישור', 'מבקשים ללחוץ על קישור.']
      ],
      prompt: 'איזו שאלה הכי עוזרת?',
      choices: [
        { text: 'מה רוצים שארגיש ומה רוצים שאעשה?', correct: true },
        { text: 'איך אלחץ הכי מהר?', correct: false },
        { text: 'איך אשלח את זה לעוד ילדים?', correct: false }
      ],
      hints: ['פחד ולחץ הם רמזים חשובים.', 'כשמנסים להבהיל - מאיטים.'],
      feedback: 'נכון. קודם מזהים לחץ, ואז בודקים בשקט.'
    },
    'trust-classification': {
      title: 'אמיתי או צריך לבדוק?',
      scenario: 'הספרייה שולחת הודעה: “הספר שהשאלת מוכן להחזרה”. אין קישור ואין בקשה לסיסמה.',
      evidence: [
        ['הקשר', 'באמת השאלתם ספר.'],
        ['בקשה', 'לא מבקשים סיסמה או קוד.'],
        ['בדיקה', 'אפשר לבדוק באתר הספרייה לבד.']
      ],
      prompt: 'איך נסווג את ההודעה?',
      choices: [
        { text: 'נראית בסדר, אבל אפשר לבדוק באתר הרשמי', correct: true },
        { text: 'בטוח פישינג', correct: false },
        { text: 'כל הודעה היא מסוכנת', correct: false }
      ],
      hints: ['לא כל הודעה היא מלכודת.', 'לפעמים התשובה היא: נראה בסדר, אבל בודקים בדרך בטוחה.'],
      feedback: 'נכון. לא צריך להיבהל מכל הודעה, צריך לבדוק חכם.'
    },
    'ai-polished': {
      title: 'הודעה כתובה מושלם',
      scenario: 'הודעה נראית ממש מקצועית: בלי שגיאות, עם ניסוח יפה וחתימה מסודרת. אבל היא מבקשת קוד אימות.',
      evidence: [
        ['נראה טוב', 'הטקסט כתוב יפה.'],
        ['מסוכן', 'מבקשים קוד אימות.'],
        ['חסר', 'לא ברור מי באמת שלח.']
      ],
      prompt: 'מה הכי נכון?',
      choices: [
        { text: 'ניסוח יפה לא מוכיח שההודעה אמיתית', correct: true },
        { text: 'אם זה כתוב יפה, זה בטוח אמיתי', correct: false },
        { text: 'אם אין שגיאות כתיב, לוחצים', correct: false }
      ],
      hints: ['גם הודעה מזויפת יכולה להיות כתובה יפה.', 'קוד אימות הוא רמז מסוכן.'],
      feedback: 'נכון. היום גם הודעה מזויפת יכולה להיראות מקצועית.'
    },
    'safe-response': {
      title: 'החלטת מגן',
      scenario: 'אספתם רמזים: שולח מוזר, בקשת סיסמה, לחץ זמן וניסיונות כניסה שנכשלו.',
      evidence: [
        ['רמז 1', 'השולח נראה מוזר.'],
        ['רמז 2', 'מבקשים סיסמה וקוד.'],
        ['רמז 3', 'מנסים להלחיץ.']
      ],
      prompt: 'מה עושים עכשיו?',
      choices: [
        { text: 'לא לוחצים, מדווחים ובודקים דרך אתר רשמי', correct: true },
        { text: 'לוחצים כדי לראות מה יקרה', correct: false },
        { text: 'מוחקים ושוכחים בלי לדווח', correct: false }
      ],
      hints: ['פעולה טובה גם שומרת וגם מדווחת.', 'לא בודקים קישור חשוד על ידי לחיצה עליו.'],
      feedback: 'מעולה. זו החלטה של מגן סייבר.'
    }
  };

  missions.forEach(mission => {
    if (kidCopy[mission.id]) Object.assign(mission, kidCopy[mission.id]);
  });

  const state = {
    mode: 'learner',
    selectedIds: new Set(missions.filter(m => m.recommended).slice(0, 6).map(m => m.id)),
    activeIndex: 0,
    completedIds: new Set(),
    hintIndex: 0,
    answered: false,
    confidence: 'medium'
  };

  const $ = id => document.getElementById(id);
  const esc = value => String(value || '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const selectedMissions = () => missions.filter(m => state.selectedIds.has(m.id));

  function renderChecklist(targetId) {
    const el = $(targetId);
    if (!el) return;
    el.innerHTML = checklistItems.map(item => `<span class="check-item">${esc(item)}</span>`).join('');
  }

  function renderRail() {
    const active = state.activeIndex < 0 ? 0 : Math.min(lessonSteps.length - 1, state.completedIds.size);
    $('lessonRail').innerHTML = lessonSteps.map((step, index) => {
      const cls = index < active ? 'done' : index === active ? 'active' : '';
      return `<span class="rail-step ${cls}">${esc(step)}</span>`;
    }).join('');
  }

  function renderPool() {
    $('missionPool').innerHTML = missions.map(mission => {
      const checked = state.selectedIds.has(mission.id);
      const tagHtml = mission.tags.map(tag => `<span class="tag">${esc(tag)}</span>`).join('');
      return `
        <label class="pool-item ${checked ? 'selected' : ''}">
          <span class="pool-top">
            <input type="checkbox" data-mission-id="${esc(mission.id)}" ${checked ? 'checked' : ''}>
            <span>
              <b>${esc(mission.title)}</b>
              <small>${esc(mission.level)} · ${esc(mission.district)}</small>
            </span>
          </span>
          <span class="tag-row">${tagHtml}</span>
        </label>
      `;
    }).join('');

    $('missionPool').querySelectorAll('input[type="checkbox"]').forEach(input => {
      input.addEventListener('change', () => {
        const id = input.dataset.missionId;
        if (input.checked) {
          if (state.selectedIds.size >= 8) {
            input.checked = false;
            return;
          }
          state.selectedIds.add(id);
        } else {
          state.selectedIds.delete(id);
        }
        state.activeIndex = state.selectedIds.size > 0 ? 0 : -1;
        state.completedIds.clear();
        update();
      });
    });
  }

  function currentMission() {
    const picked = selectedMissions();
    return picked[state.activeIndex] || null;
  }

  function renderLearningGuide(mission) {
    const goal = challengeGoals[mission.type] || 'לפתור את האתגר לפי הראיות שעל המסך.';
    const items = learnerChecklist[mission.type] || ['קראו את האירוע', 'בדקו את הראיות', 'בחרו החלטה בטוחה'];
    $('missionGoal').textContent = goal;
    $('missionDoList').innerHTML = items.map(item => `<span>${esc(item)}</span>`).join('');
  }

  function renderMission() {
    const mission = currentMission();
    const hasMission = Boolean(mission);
    $('introCard').hidden = hasMission || state.completedIds.size > 0;
    $('missionCard').hidden = !hasMission;
    $('summaryCard').hidden = hasMission || state.completedIds.size === 0 || state.completedIds.size < selectedMissions().length;

    if (!mission) return;

    $('missionMeta').textContent = `${mission.level} · ${mission.district}`;
    $('missionTitle').textContent = mission.title;
    $('challengeCounter').textContent = `אתגר ${state.activeIndex + 1} מתוך ${selectedMissions().length}`;
    $('storyIcon').textContent = mission.district === 'HQ' ? 'HQ' : mission.district === 'Identity Vault' ? 'ID' : mission.district === 'AI Hub' ? 'AI' : 'MAIL';
    $('missionScenario').textContent = mission.scenario;
    $('decisionPrompt').textContent = mission.prompt;
    $('instructorNote').textContent = mission.instructorNote;
    renderLearningGuide(mission);

    $('evidenceList').innerHTML = mission.evidence.map(item => `
      <article class="evidence-card">
        <span>${esc(item[0])}</span>
        <p>${esc(item[1])}</p>
      </article>
    `).join('');

    $('choices').innerHTML = mission.choices.map((choice, index) => `
      <button class="choice" type="button" data-choice-index="${index}">${esc(choice.text)}</button>
    `).join('');

    $('choices').querySelectorAll('.choice').forEach(button => {
      button.addEventListener('click', () => chooseAnswer(Number(button.dataset.choiceIndex)));
    });

    $('hintBox').hidden = true;
    $('hintBox').textContent = '';
    $('feedbackBox').className = 'feedback-box';
    $('feedbackBox').innerHTML = '<strong>כדי לפתור:</strong> קראו את הסיפור, בדקו את הרמזים, ואז בחרו תשובה אחת.';
    $('nextMissionButton').disabled = true;
    $('nextMissionButton').classList.add('subtle');
    $('nextMissionButton').textContent = state.activeIndex >= selectedMissions().length - 1 ? 'סיום וקבלת תג' : 'המשך לאתגר הבא';
  }

  function chooseAnswer(index) {
    const mission = currentMission();
    if (!mission || state.answered) return;
    const choice = mission.choices[index];
    $('choices').querySelectorAll('.choice').forEach((button, buttonIndex) => {
      const isCorrect = mission.choices[buttonIndex].correct;
      button.classList.toggle('correct', choice.correct && isCorrect);
      button.classList.toggle('wrong', buttonIndex === index && !isCorrect);
    });
    const feedback = $('feedbackBox');
    feedback.className = `feedback-box ${choice.correct ? 'good' : 'bad'}`;
    feedback.textContent = choice.correct ? `נכון. ${mission.feedback} עכשיו אפשר להתקדם לאתגר הבא.` : 'עדיין לא. חזרו לרמזים למעלה, בדקו מי שלח / מה מבקשים / האם מלחיצים, ואז נסו שוב.';
    if (choice.correct) {
      state.answered = true;
      state.completedIds.add(mission.id);
      $('nextMissionButton').disabled = false;
      $('nextMissionButton').classList.remove('subtle');
      renderStatus();
    } else {
      state.answered = false;
    }
  }

  function showHint() {
    const mission = currentMission();
    if (!mission) return;
    const hint = mission.hints[Math.min(state.hintIndex, mission.hints.length - 1)];
    $('hintBox').hidden = false;
    $('hintBox').textContent = hint;
    state.hintIndex += 1;
  }

  function nextMission() {
    const picked = selectedMissions();
    if (picked.length === 0) return;
    const mission = currentMission();
    if (mission && !state.completedIds.has(mission.id)) {
      $('feedbackBox').className = 'feedback-box bad';
      $('feedbackBox').textContent = 'כדי להתקדם צריך לפתור את האתגר. אפשר לקחת רמז קטן או לבחור תשובה אחרת.';
      return;
    }
    state.activeIndex += 1;
    if (state.activeIndex >= picked.length) {
      state.activeIndex = picked.length;
      $('introCard').hidden = true;
      $('missionCard').hidden = true;
      $('summaryCard').hidden = false;
      $('worldState').textContent = 'Mail Station: Phishing Checklist Installed';
    }
    state.hintIndex = 0;
    state.answered = false;
    update();
  }

  function startLesson() {
    if (selectedMissions().length === 0) return;
    if (state.activeIndex < 0 || state.activeIndex >= selectedMissions().length) {
      state.activeIndex = 0;
      state.completedIds.clear();
      state.hintIndex = 0;
      state.answered = false;
    }
    update();
    $('missionCard')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderStatus() {
    const picked = selectedMissions();
    const count = picked.length;
    const done = state.completedIds.size;
    const percent = count ? Math.round((done / count) * 100) : 0;
    $('selectedCount').textContent = `${count}`;
    $('progressText').textContent = `${percent}%`;
    if (done >= count && count > 0) {
      $('worldState').textContent = 'המסלול הושלם';
    } else if (state.activeIndex >= 0) {
      $('worldState').textContent = `אתגר ${Math.min(state.activeIndex + 1, count)} פעיל`;
    } else {
      $('worldState').textContent = 'מוכן להתחלה';
    }
  }

  function setMode(mode) {
    state.mode = mode;
    document.body.classList.remove('mode-learner', 'mode-instructor', 'mode-class', 'mode-projector');
    document.body.classList.add(`mode-${mode}`);
    document.querySelectorAll('.mode-button').forEach(button => {
      button.classList.toggle('active', button.dataset.mode === mode);
    });
  }

  function update() {
    renderStatus();
    renderRail();
    renderPool();
    renderMission();
    renderChecklist('phishingChecklist');
    renderChecklist('summaryChecklist');
  }

  function bindEvents() {
    $('startButton').addEventListener('click', startLesson);
    $('heroStartButton').addEventListener('click', startLesson);
    $('tourButton').addEventListener('click', () => {
      $('instructorNote').textContent = 'בכל אתגר: קוראים את האירוע, בודקים Evidence, בוחרים פעולה, ואם טועים מקבלים משוב ומנסים שוב.';
      $('introCard').classList.add('pulse');
      window.setTimeout(() => $('introCard').classList.remove('pulse'), 900);
    });
    $('nextMissionButton').addEventListener('click', nextMission);
    $('hintButton').addEventListener('click', showHint);
    $('restartButton').addEventListener('click', () => {
      state.activeIndex = 0;
      state.completedIds.clear();
      state.answered = false;
      update();
    });
    $('autoPick').addEventListener('click', () => {
      state.selectedIds = new Set(missions.filter(m => m.recommended).slice(0, 6).map(m => m.id));
      state.activeIndex = 0;
      state.completedIds.clear();
      update();
    });
    $('clearPick').addEventListener('click', () => {
      state.selectedIds.clear();
      state.activeIndex = -1;
      state.completedIds.clear();
      update();
    });
    $('resetSelection').addEventListener('click', () => {
      state.selectedIds = new Set(missions.filter(m => m.recommended).slice(0, 6).map(m => m.id));
      state.activeIndex = 0;
      state.completedIds.clear();
      update();
    });
    document.querySelectorAll('.mode-button').forEach(button => {
      button.addEventListener('click', () => setMode(button.dataset.mode));
    });
    document.querySelectorAll('#confidenceControl button').forEach(button => {
      button.addEventListener('click', () => {
        state.confidence = button.dataset.confidence;
        document.querySelectorAll('#confidenceControl button').forEach(item => item.classList.toggle('active', item === button));
      });
    });
  }

  bindEvents();
  setMode('learner');
  update();
})();
