window.KITCHEN_LESSONS = [
  {
    id: 1,
    title: 'עוגיית כוכב',
    emoji: '⭐',
    unit: 'מתכון ראשון',
    mission: 'סיסי רוצה להכין עוגיית כוכב. צריך לסדר את השלבים בסדר הנכון.',
    concept: 'אלגוריתם = מתכון לפי סדר',
    cookingNote: 'במתכון, כמו בקוד, אם מחליפים סדר — התוצאה משתנה.',
    goal: 'עוגיית כוכב מוכנה',
    steps: [
      { id: 'mix', emoji: '🥣', text: 'מערבבים קמח וסוכר' },
      { id: 'egg', emoji: '🥚', text: 'מוסיפים ביצה' },
      { id: 'shape', emoji: '⭐', text: 'יוצרים צורת כוכב' },
      { id: 'bake', emoji: '🔥', text: 'אופים בתנור' }
    ],
    correctOrder: ['mix', 'egg', 'shape', 'bake'],
    displayOrder: ['shape', 'mix', 'bake', 'egg']
  },
  {
    id: 2,
    title: 'שייק רובוטים',
    emoji: '🥤',
    unit: 'סדר וכמויות',
    mission: 'סיסי מכינה שייק צבעוני. אם הקרח נכנס מוקדם מדי — השייק לא נטחן טוב.',
    concept: 'סדר פעולות וכמות',
    cookingNote: 'כמות היא מידע שהמחשב משתמש בו — כמו כמה פירות להכניס.',
    goal: 'שייק פירות קר',
    steps: [
      { id: 'banana', emoji: '🍌', text: 'מכניסים בננה אחת' },
      { id: 'berries', emoji: '🍓', text: 'מוסיפים שתי תותים' },
      { id: 'blend', emoji: '🌪️', text: 'מפעילים בלנדר' },
      { id: 'ice', emoji: '🧊', text: 'מוסיפים קרח בסוף' }
    ],
    correctOrder: ['banana', 'berries', 'blend', 'ice'],
    displayOrder: ['ice', 'banana', 'blend', 'berries']
  },
  {
    id: 3,
    title: 'מרק צבעים',
    emoji: '🍲',
    unit: 'חזרה על פעולה',
    mission: 'סיסי מבשלת מרק ומערבבת פעמיים. זו התחלה של חזרה/לולאה במתכון.',
    concept: 'חזרה פשוטה',
    cookingNote: 'כשאותה פעולה חוזרת, אפשר לחשוב עליה כמו לולאה קטנה.',
    goal: 'מרק חם וצבעוני',
    steps: [
      { id: 'water', emoji: '💧', text: 'מוסיפים מים לסיר' },
      { id: 'veggies', emoji: '🥕', text: 'מוסיפים ירקות' },
      { id: 'stir1', emoji: '🥄', text: 'מערבבים פעם ראשונה' },
      { id: 'stir2', emoji: '🥄', text: 'מערבבים פעם שנייה' },
      { id: 'serve', emoji: '🍽️', text: 'מגישים בקערה' }
    ],
    correctOrder: ['water', 'veggies', 'stir1', 'stir2', 'serve'],
    displayOrder: ['serve', 'stir1', 'water', 'veggies', 'stir2']
  },
  {
    id: 4,
    title: 'פיצה חכמה',
    emoji: '🍕',
    unit: 'תנאי בטיחות',
    mission: 'סיסי מכינה פיצה. קודם בסיס, אחר כך רוטב, ואז תוספות — לא הפוך.',
    concept: 'כל שלב תלוי בקודם',
    cookingNote: 'לפעמים פעולה יכולה לקרות רק אחרי שפעולה אחרת הסתיימה.',
    goal: 'פיצה מוכנה לשיתוף',
    steps: [
      { id: 'dough', emoji: '🍞', text: 'פותחים בצק' },
      { id: 'sauce', emoji: '🍅', text: 'מורחים רוטב' },
      { id: 'cheese', emoji: '🧀', text: 'מפזרים גבינה' },
      { id: 'topping', emoji: '🫒', text: 'מוסיפים תוספת' },
      { id: 'oven', emoji: '🔥', text: 'מכניסים לתנור' }
    ],
    correctOrder: ['dough', 'sauce', 'cheese', 'topping', 'oven'],
    displayOrder: ['cheese', 'oven', 'dough', 'topping', 'sauce']
  },
  {
    id: 5,
    title: 'קאפקייק הפתעה',
    emoji: '🧁',
    unit: 'דיבוג במתכון',
    mission: 'משהו השתבש בקאפקייק. סיסי צריכה לסדר מחדש את השלבים ולתקן את המתכון.',
    concept: 'דיבוג: למצוא שלב לא במקום',
    cookingNote: 'דיבוג הוא כמו לבדוק מתכון: איפה עשינו משהו מוקדם או מאוחר מדי?',
    goal: 'קאפקייק עם קישוט',
    steps: [
      { id: 'cup', emoji: '🧁', text: 'מניחים מנג׳ט נייר' },
      { id: 'batter', emoji: '🍯', text: 'שופכים בלילה' },
      { id: 'bake', emoji: '🔥', text: 'אופים' },
      { id: 'cool', emoji: '❄️', text: 'מחכים שיתקרר' },
      { id: 'decorate', emoji: '✨', text: 'מקשטים בסוכריות' }
    ],
    correctOrder: ['cup', 'batter', 'bake', 'cool', 'decorate'],
    displayOrder: ['decorate', 'cup', 'cool', 'batter', 'bake']
  },
  {
    id: 6,
    title: 'מסעדת הרובוטים',
    emoji: '🍽️',
    unit: 'אתגר סיום',
    mission: 'סיסי מכינה מנה למסעדת רובוטים. צריך לתכנן אלגוריתם מלא מהתחלה עד ההגשה.',
    concept: 'אלגוריתם מלא',
    cookingNote: 'אלגוריתם טוב ברור מספיק כדי שמישהו אחר יוכל לבצע אותו.',
    goal: 'מנה מוגשת לשולחן',
    steps: [
      { id: 'choose', emoji: '📋', text: 'בוחרים מתכון' },
      { id: 'collect', emoji: '🧺', text: 'אוספים מצרכים' },
      { id: 'cook', emoji: '🍳', text: 'מבשלים לפי הסדר' },
      { id: 'taste', emoji: '😋', text: 'בודקים טעם' },
      { id: 'serve', emoji: '🍽️', text: 'מגישים לשולחן' }
    ],
    correctOrder: ['choose', 'collect', 'cook', 'taste', 'serve'],
    displayOrder: ['serve', 'collect', 'choose', 'taste', 'cook']
  },
  {
    id: 7,
    title: 'סלט קשת בענן',
    emoji: '🥗',
    unit: 'סדר הכנה נקי',
    mission: 'סיסי מכינה סלט צבעוני. אם מתבלים לפני שחותכים — התיבול לא מתפזר טוב.',
    concept: 'הכנה לפני ערבוב',
    cookingNote: 'באלגוריתם יש שלבי הכנה: קודם מכינים נתונים, ורק אחר כך משתמשים בהם.',
    goal: 'סלט קשת מוכן',
    steps: [
      { id: 'wash', emoji: '🚿', text: 'שוטפים ירקות' },
      { id: 'cut', emoji: '🔪', text: 'חותכים לחתיכות קטנות' },
      { id: 'mix', emoji: '🥣', text: 'מערבבים בקערה' },
      { id: 'season', emoji: '🧂', text: 'מתבלים בסוף' },
      { id: 'plate', emoji: '🌈', text: 'מסדרים כמו קשת' }
    ],
    correctOrder: ['wash', 'cut', 'mix', 'season', 'plate'],
    displayOrder: ['season', 'plate', 'wash', 'mix', 'cut']
  },
  {
    id: 8,
    title: 'פנקייקים בקצב',
    emoji: '🥞',
    unit: 'לולאה קטנה',
    mission: 'סיסי מכינה שני פנקייקים. אותה פעולה חוזרת: יוצקים, הופכים, מניחים בערימה.',
    concept: 'חזרה על רצף פעולות',
    cookingNote: 'לולאה יכולה לחזור על כמה פעולות יחד, לא רק על פעולה אחת.',
    goal: 'מגדל פנקייקים קטן',
    steps: [
      { id: 'mix', emoji: '🥣', text: 'מערבבים בלילה' },
      { id: 'pour1', emoji: '🥄', text: 'יוצקים פנקייק ראשון' },
      { id: 'flip1', emoji: '🔁', text: 'הופכים ראשון' },
      { id: 'pour2', emoji: '🥄', text: 'יוצקים פנקייק שני' },
      { id: 'flip2', emoji: '🔁', text: 'הופכים שני' },
      { id: 'stack', emoji: '🍯', text: 'מניחים בערימה עם דבש' }
    ],
    correctOrder: ['mix', 'pour1', 'flip1', 'pour2', 'flip2', 'stack'],
    displayOrder: ['stack', 'flip1', 'mix', 'pour2', 'pour1', 'flip2']
  },
  {
    id: 9,
    title: 'טוסט תנאי',
    emoji: '🥪',
    unit: 'אם־אז במטבח',
    mission: 'סיסי מכינה טוסט. רק אם הגבינה כבר בפנים — אפשר לסגור ולחמם.',
    concept: 'תנאי פשוט: אם מוכן אז ממשיכים',
    cookingNote: 'תנאי עוזר למחשב לא לקפוץ קדימה לפני שהמצב מתאים.',
    goal: 'טוסט חם ומוכן',
    steps: [
      { id: 'bread1', emoji: '🍞', text: 'מניחים פרוסת לחם' },
      { id: 'cheese', emoji: '🧀', text: 'מוסיפים גבינה' },
      { id: 'check', emoji: '✅', text: 'בודקים שהגבינה בפנים' },
      { id: 'close', emoji: '🥪', text: 'סוגרים עם פרוסה שנייה' },
      { id: 'toast', emoji: '🔥', text: 'מחממים בטוסטר' }
    ],
    correctOrder: ['bread1', 'cheese', 'check', 'close', 'toast'],
    displayOrder: ['toast', 'check', 'bread1', 'close', 'cheese']
  },
  {
    id: 10,
    title: 'גלידת קסמים',
    emoji: '🍦',
    unit: 'קלט ופלט',
    mission: 'סיסי מקבלת בחירה של טעם, מוסיפה גביע וקישוט, ואז מוציאה גלידה מוכנה.',
    concept: 'קלט → עיבוד → פלט',
    cookingNote: 'בתכנות קלט הוא מה שמכניסים למערכת, ופלט הוא התוצאה שמקבלים בסוף.',
    goal: 'גלידה לפי בחירה',
    steps: [
      { id: 'chooseFlavor', emoji: '🗳️', text: 'בוחרים טעם' },
      { id: 'cone', emoji: '🍦', text: 'מכינים גביע' },
      { id: 'scoop', emoji: '🥄', text: 'שמים כדור גלידה' },
      { id: 'sprinkles', emoji: '✨', text: 'מוסיפים סוכריות' },
      { id: 'give', emoji: '🤲', text: 'מגישים לילד/ה שבחר/ה' }
    ],
    correctOrder: ['chooseFlavor', 'cone', 'scoop', 'sprinkles', 'give'],
    displayOrder: ['sprinkles', 'give', 'cone', 'chooseFlavor', 'scoop']
  },
  {
    id: 11,
    title: 'קופסת אוכל לבית ספר',
    emoji: '🍱',
    unit: 'בדיקת שלמות',
    mission: 'סיסי אורזת קופסת אוכל. צריך לוודא שכל הפריטים בפנים לפני שסוגרים.',
    concept: 'בדיקה לפני סיום',
    cookingNote: 'לפני שמסיימים אלגוריתם, כדאי לבדוק שלא שכחנו שלב חשוב.',
    goal: 'קופסת אוכל מוכנה להפסקה',
    steps: [
      { id: 'box', emoji: '🍱', text: 'פותחים קופסה' },
      { id: 'sandwich', emoji: '🥪', text: 'מכניסים כריך' },
      { id: 'fruit', emoji: '🍎', text: 'מוסיפים פרי' },
      { id: 'water', emoji: '💧', text: 'מוסיפים בקבוק מים' },
      { id: 'check', emoji: '🔎', text: 'בודקים שלא שכחנו כלום' },
      { id: 'close', emoji: '🎒', text: 'סוגרים ומכניסים לתיק' }
    ],
    correctOrder: ['box', 'sandwich', 'fruit', 'water', 'check', 'close'],
    displayOrder: ['close', 'fruit', 'box', 'check', 'water', 'sandwich']
  },
  {
    id: 12,
    title: 'עוגת יום הולדת של סיסי',
    emoji: '🎂',
    unit: 'אתגר שף ראשי',
    mission: 'אתגר סיום מורחב: סיסי מכינה עוגת יום הולדת וצריכה אלגוריתם מדויק מהמצרכים ועד הנרות.',
    concept: 'אלגוריתם ארוך עם דיבוג',
    cookingNote: 'ככל שהאלגוריתם ארוך יותר, חשוב יותר לקרוא, לבדוק ולתקן שלב אחד בכל פעם.',
    goal: 'עוגת יום הולדת מוכנה למסיבה',
    steps: [
      { id: 'ingredients', emoji: '🧺', text: 'אוספים מצרכים' },
      { id: 'mix', emoji: '🥣', text: 'מערבבים בלילה' },
      { id: 'pan', emoji: '🍰', text: 'שופכים לתבנית' },
      { id: 'bake', emoji: '🔥', text: 'אופים בתנור' },
      { id: 'cool', emoji: '❄️', text: 'מחכים שהעוגה תתקרר' },
      { id: 'decorate', emoji: '🎉', text: 'מקשטים ונועצים נרות' }
    ],
    correctOrder: ['ingredients', 'mix', 'pan', 'bake', 'cool', 'decorate'],
    displayOrder: ['decorate', 'bake', 'ingredients', 'cool', 'pan', 'mix']
  }
];
