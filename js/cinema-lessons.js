window.CINEMA_LESSONS = [
  {
    id: 1,
    emoji: '🎈',
    title: 'הרובוט מחזיר בלון',
    unit: 'אלגוריתם בשלושה צעדים',
    concept: 'רצף פקודות',
    story: 'סיסי מביימת רובוט שעוזר לילדה להחזיר בלון. צריך לבחור את שלוש פקודות הרובוט הנכונות ולסדר אותן.',
    goal: 'המטרה: הרובוט מחזיר את הבלון לילדה.',
    correctOrder: ['goBalloon', 'grabBalloon', 'giveGirl'],
    distractor: 'dance',
    commands: {
      goBalloon: { icon: '🤖➡️🎈', text: 'לך אל הבלון', reason: 'קודם הרובוט צריך להגיע לחפץ.' },
      grabBalloon: { icon: '🤖🤏🎈', text: 'תפוס את הבלון', reason: 'אחרי שמגיעים, אפשר לתפוס.' },
      giveGirl: { icon: '🤖🎈👧', text: 'תן את הבלון לילדה', reason: 'בסוף מחזירים את החפץ למי שצריך.' },
      dance: { icon: '🤖💃', text: 'רקוד במקום', reason: 'זו פקודה מצחיקה אבל לא מקדמת את המטרה.' }
    },
    learningNote: 'אלגוריתם הוא רצף פקודות שמוביל למטרה. פקודה מיותרת יכולה להפריע גם אם היא נחמדה.'
  },
  {
    id: 2,
    emoji: '🍪',
    title: 'הרובוט מגיש עוגיות',
    unit: 'סדר פעולה',
    concept: 'לפני-אחרי',
    story: 'באולפן מצלמים רובוט שמגיש עוגיות למסיבה. איזה רצף פקודות יביא את העוגיות לשולחן?',
    goal: 'המטרה: עוגיות מגיעות לשולחן המסיבה.',
    correctOrder: ['takeTray', 'walkTable', 'putCookies'],
    distractor: 'turnLight',
    commands: {
      takeTray: { icon: '🤖🧺🍪', text: 'קח מגש עוגיות', reason: 'אי אפשר להביא עוגיות בלי לקחת אותן קודם.' },
      walkTable: { icon: '🤖➡️🪑', text: 'לך אל שולחן המסיבה', reason: 'אחרי שלוקחים, צריך להגיע ליעד.' },
      putCookies: { icon: '🤖🍪⬇️', text: 'הנח את העוגיות על השולחן', reason: 'בסוף מניחים במקום הנכון.' },
      turnLight: { icon: '💡', text: 'כבה והדלק אור', reason: 'זה לא קשור להגשת העוגיות.' }
    },
    learningNote: 'בתכנות, סדר הפקודות משנה: אם נניח לפני שהגענו לשולחן, המשימה תיכשל.'
  },
  {
    id: 3,
    emoji: '🐢',
    title: 'הרובוט עוזר לצב',
    unit: 'פתרון בעיה',
    concept: 'מטרה וצעדים',
    story: 'צב קטן צריך להגיע לפרחים בצד השני. סיסי מביימת רובוט שבונה לו מעבר בטוח.',
    goal: 'המטרה: הצב עובר לצד השני בבטחה.',
    correctOrder: ['scanWater', 'placeBridge', 'guideTurtle'],
    distractor: 'paintBridge',
    commands: {
      scanWater: { icon: '🤖👀🌊', text: 'בדוק איפה הנחל', reason: 'קודם מזהים את הבעיה.' },
      placeBridge: { icon: '🤖🌉', text: 'הנח גשר קטן', reason: 'אחרי שמבינים איפה הבעיה, יוצרים מעבר.' },
      guideTurtle: { icon: '🤖🐢➡️', text: 'כוון את הצב לגשר', reason: 'בסוף משתמשים בפתרון כדי להגיע למטרה.' },
      paintBridge: { icon: '🎨🌉', text: 'צבע את הגשר בסגול', reason: 'זה יפה, אבל לא נחוץ כדי שהצב יעבור.' }
    },
    learningNote: 'אלגוריתם טוב מתחיל בזיהוי מצב, ממשיך בפעולה, ומסתיים בבדיקה שהמטרה הושגה.'
  },
  {
    id: 4,
    emoji: '🚀',
    title: 'הרובוט משגר חללית צעצוע',
    unit: 'תכנון לפני ביצוע',
    concept: 'בדיקה לפני פעולה',
    story: 'חללית צעצוע צריכה שיגור בטוח. סיסי מביימת רובוט שמכין, בודק ומשגר.',
    goal: 'המטרה: החללית משוגרת רק אחרי הכנה.',
    correctOrder: ['buildRocket', 'checkReady', 'launchRocket'],
    distractor: 'sleep',
    commands: {
      buildRocket: { icon: '🤖🧱🚀', text: 'בנה את החללית', reason: 'קודם יוצרים את מה שרוצים לשגר.' },
      checkReady: { icon: '🤖✅', text: 'בדוק שהחללית מוכנה', reason: 'לפני פעולה חשובה עושים בדיקה.' },
      launchRocket: { icon: '🤖🚀🌙', text: 'שגר את החללית', reason: 'רק אחרי הכנה ובדיקה אפשר לשגר.' },
      sleep: { icon: '🤖😴', text: 'לך לישון', reason: 'זו פקודה שלא עוזרת לשיגור.' }
    },
    learningNote: 'בדיקה לפני פעולה היא רעיון תכנותי חשוב: לא מריצים שלב מסוכן לפני שהכול מוכן.'
  },
  {
    id: 5,
    emoji: '🐱',
    title: 'הרובוט מסדר קופסה לחתול',
    unit: 'דיבוג סדר',
    concept: 'פקודה מיותרת',
    story: 'החתול רוצה לישון בקופסה. הרובוט צריך להכין לו מקום, אבל אחת הפקודות מיותרת.',
    goal: 'המטרה: לחתול יש קופסה נקייה ונוחה.',
    correctOrder: ['openBox', 'putBlanket', 'inviteCat'],
    distractor: 'closeBox',
    commands: {
      openBox: { icon: '🤖📦⬆️', text: 'פתח את הקופסה', reason: 'אי אפשר להכניס שמיכה אם הקופסה סגורה.' },
      putBlanket: { icon: '🤖🧺📦', text: 'שים שמיכה בקופסה', reason: 'השמיכה הופכת את הקופסה לנוחה.' },
      inviteCat: { icon: '🤖🐱📦', text: 'קרא לחתול להיכנס', reason: 'בסוף מזמינים את החתול למקום המוכן.' },
      closeBox: { icon: '📦🔒', text: 'סגור את הקופסה', reason: 'אם סוגרים לפני שהחתול נכנס, המטרה נכשלת.' }
    },
    learningNote: 'דיבוג הוא למצוא פקודה שמפריעה למטרה ולהוציא אותה מהאלגוריתם.'
  },
  {
    id: 6,
    emoji: '🌈',
    title: 'הרובוט מצלם קשת',
    unit: 'אתגר מסכם',
    concept: 'אלגוריתם צילום',
    story: 'סיסי רוצה שרובוט צילום יתפוס תמונה של קשת אחרי הגשם.',
    goal: 'המטרה: לצלם קשת בזמן הנכון.',
    correctOrder: ['waitRainStop', 'lookSky', 'takePhoto'],
    distractor: 'photoFloor',
    commands: {
      waitRainStop: { icon: '🤖⏳🌧️', text: 'חכה שהגשם ייחלש', reason: 'קודם מחכים לרגע מתאים.' },
      lookSky: { icon: '🤖👀🌈', text: 'חפש קשת בשמיים', reason: 'לפני צילום צריך למצוא את האובייקט.' },
      takePhoto: { icon: '🤖📸🌈', text: 'צלם את הקשת', reason: 'בסוף מבצעים את פעולת הצילום.' },
      photoFloor: { icon: '📸🟫', text: 'צלם את הרצפה', reason: 'זה לא מתאים למטרה של צילום קשת.' }
    },
    learningNote: 'אלגוריתם טוב ממוקד במטרה: כל פקודה צריכה לקדם אותנו אל התוצאה הרצויה.'
  }
];
