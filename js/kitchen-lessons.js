window.KITCHEN_LESSONS = [
  {
    id: 1,
    title: 'עוגיית כוכב',
    emoji: '⭐',
    unit: 'מתכון ראשון',
    mission: 'סיסי רוצה להכין עוגיית כוכב. צריך לסדר את השלבים בסדר הנכון.',
    concept: 'אלגוריתם = מתכון לפי סדר',
    cookingNote: 'במתכון, כמו בקוד, אם מחליפים סדר — התוצאה משתנה.',
    hint: 'התחילו בחומרים, אחר כך הכינו את הבצק, ורק בסוף הכניסו לתנור.',
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
    hint: 'לפני שמפעילים את הבלנדר, בדקו שכל מה שרוצים לטחון כבר נמצא בפנים.',
    goal: 'שייק פירות קר',
    steps: [
      { id: 'banana', emoji: '🍌', text: 'מכניסים בננה אחת' },
      { id: 'berries', emoji: '🍓', text: 'מוסיפים שתי תותים' },
      { id: 'blend', emoji: '🌪️', text: 'מפעילים בלנדר' },
      { id: 'ice', emoji: '🧊', text: 'מוסיפים קרח' }
    ],
    correctOrder: ['banana', 'berries', 'ice', 'blend'],
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
    hint: 'חפשו פעולה שחוזרת יותר מפעם אחת. היא צריכה לקרות אחרי שיש מה לערבב ולפני שמגישים.',
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
    hint: 'חשבו מה חייב להיות מוכן לפני שמורחים עליו משהו, ומה כדאי להוסיף לפני שהפיצה נכנסת לאפיה.',
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
    mission: 'סיסי ניסתה להכין קאפקייק, אבל משהו השתבש: הסוכריות נמסו בתנור. מצאו איזה שלב היה במקום הלא נכון, ואז סדרו את המתכון הנכון.',
    concept: 'דיבוג: למצוא שלב לא במקום',
    cookingNote: 'דיבוג הוא כמו לבדוק מתכון: מחפשים איזו פעולה קרתה מוקדם או מאוחר מדי.',
    hint: 'חפשו שלב שיכול להיהרס אם הוא קורה לפני האפייה או לפני שהקאפקייק מתקרר.',
    goal: 'קאפקייק עם קישוט',
    steps: [
      { id: 'cup', emoji: '🧁', text: 'מניחים מנג׳ט נייר' },
      { id: 'batter', emoji: '🍯', text: 'שופכים את הבצק' },
      { id: 'bake', emoji: '🔥', text: 'אופים' },
      { id: 'cool', emoji: '❄️', text: 'מחכים שיתקרר' },
      { id: 'decorate', emoji: '✨', text: 'מקשטים בסוכריות' }
    ],
    correctOrder: ['cup', 'batter', 'bake', 'cool', 'decorate'],
    displayOrder: ['cup', 'batter', 'decorate', 'bake', 'cool']
  },
  {
    id: 6,
    title: 'מסעדת הרובוטים',
    emoji: '🍽️',
    unit: 'אתגר סיום',
    mission: 'סיסי מכינה מנה למסעדת רובוטים. צריך לתכנן אלגוריתם מלא מהתחלה עד ההגשה.',
    concept: 'אלגוריתם מלא',
    cookingNote: 'אלגוריתם טוב ברור מספיק כדי שמישהו אחר יוכל לבצע אותו.',
    hint: 'חשבו כמו רובוט במסעדה: קודם צריך לדעת מה מכינים, אחר כך להכין את מה שצריך, ורק בסוף אפשר להגיש.',
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
    title: 'סלט צבעוני',
    emoji: '🥗',
    unit: 'סדר הכנה נקי',
    mission: 'סיסי מכינה סלט צבעוני. אם מתבלים לפני שחותכים — התיבול לא מתפזר טוב.',
    concept: 'הכנה לפני ערבוב',
    cookingNote: 'באלגוריתם יש שלבי הכנה: קודם מכינים נתונים, ורק אחר כך משתמשים בהם.',
    hint: 'לפני שמערבבים או מתבלים, צריך שהירקות יהיו מוכנים. את הצלחת שומרים אחרי שהסלט כבר מוכן.',
    goal: 'סלט צבעוני מוכן',
    steps: [
      { id: 'wash', emoji: '🚿', text: 'שוטפים ירקות' },
      { id: 'cut', emoji: '🔪', text: 'חותכים לחתיכות קטנות' },
      { id: 'mix', emoji: '🥣', text: 'מערבבים בקערה' },
      { id: 'season', emoji: '🧂', text: 'מוסיפים תיבול' },
      { id: 'plate', emoji: '🥗', text: 'מסדרים בצלחת' }
    ],
    correctOrder: ['wash', 'cut', 'mix', 'season', 'plate'],
    displayOrder: ['season', 'plate', 'wash', 'mix', 'cut']
  },
  {
    id: 8,
    title: 'פנקייקים בקצב',
    emoji: '🥞',
    unit: 'לולאה קטנה',
    mission: 'סיסי מכינה שני פנקייקים. אותן פעולות חוזרות: יוצקים והופכים.',
    concept: 'חזרה על רצף פעולות',
    cookingNote: 'לולאה יכולה לחזור על כמה פעולות יחד, לא רק על פעולה אחת.',
    hint: 'חפשו רצף קצר שחוזר לכל פנקייק. אחרי ששני הפנקייקים מוכנים, אפשר לעבור לשלב ההגשה.',
    goal: 'מגדל פנקייקים קטן',
    steps: [
      { id: 'mix', emoji: '🥣', text: 'מכינים את הבצק' },
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
    mission: 'סיסי מכינה טוסט. לפני שהטוסט נכנס לטוסטר, צריך לוודא שהמילוי נמצא במקום הנכון.',
    concept: 'תנאי פשוט: אם מוכן אז ממשיכים',
    cookingNote: 'תנאי עוזר למחשב לא לקפוץ קדימה לפני שהמצב מתאים.',
    goal: 'טוסט חם ומוכן',
    steps: [
      { id: 'bread1', emoji: '🍞', text: 'מניחים פרוסת לחם' },
      { id: 'cheese', emoji: '🧀', text: 'מוסיפים גבינה' },
      { id: 'check', emoji: '✅', text: 'בודקים שיש מילוי' },
      { id: 'close', emoji: '🥪', text: 'סוגרים עם פרוסה שנייה' },
      { id: 'toast', emoji: '🔥', text: 'מחממים בטוסטר' }
    ],
    hint: 'יש שלב שאסור לדלג עליו לפני שסוגרים ומחממים.',
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
    hint: 'קודם צריך לדעת מה הילד או הילדה בחרו. אחר כך מכינים לפי הבחירה, ורק כשהגלידה מוכנה מוסרים אותה.',
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
    title: 'הקופסה שחסר בה משהו',
    emoji: '🍱',
    unit: 'דיבוג אלגוריתם',
    mission: 'סיסי ארזה קופסת אוכל לילדה שהולכת לבית הספר, אבל בהפסקה הילדה גילתה שחסר לה משהו. הכרטיסים מסודרים לפי הסדר שסיסי עשתה בפעם הראשונה. מה שלא נכנס לקופסה לפני שסוגרים אותה — לא מגיע לבית הספר. מצאו איזה שלב נשכח, ואז סדרו את הקופסה נכון.',
    concept: 'דיבוג: שלב שנעשה מאוחר מדי',
    cookingNote: 'בדיבוג מחפשים איפה האלגוריתם השתבש, ואז מסדרים את השלבים כך שהתוצאה באמת תצליח.',
    hint: 'חפשו פריט שצריך להיכנס לקופסה לפני שסוגרים אותה. אחרי שהקופסה בתיק, מאוחר מדי להוסיף אותו.',
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
    displayOrder: ['box', 'sandwich', 'fruit', 'check', 'close', 'water']
  },
  {
    id: 12,
    title: 'עוגת יום הולדת של סיסי',
    emoji: '🎂',
    unit: 'אתגר שף ראשי',
    mission: 'אתגר סיום מורחב: סיסי מכינה עוגת יום הולדת וצריכה אלגוריתם מדויק מהמצרכים ועד הנרות.',
    concept: 'אלגוריתם ארוך עם דיבוג',
    cookingNote: 'ככל שהאלגוריתם ארוך יותר, חשוב יותר לקרוא, לבדוק ולתקן שלב אחד בכל פעם.',
    hint: 'לפני שמקשטים ונועצים נרות, צריך שתהיה עוגה אפויה ומוכנה לקישוט. חשבו מה חייב לקרות לפני זה.',
    goal: 'עוגת יום הולדת מוכנה למסיבה',
    steps: [
      { id: 'ingredients', emoji: '🧺', text: 'אוספים מצרכים' },
      { id: 'mix', emoji: '🥣', text: 'מכינים את הבצק' },
      { id: 'pan', emoji: '🍰', text: 'שופכים לתבנית' },
      { id: 'bake', emoji: '🔥', text: 'אופים בתנור' },
      { id: 'cool', emoji: '❄️', text: 'מחכים שהעוגה תתקרר' },
      { id: 'decorate', emoji: '🎉', text: 'מקשטים ונועצים נרות' }
    ],
    correctOrder: ['ingredients', 'mix', 'pan', 'bake', 'cool', 'decorate'],
    displayOrder: ['decorate', 'bake', 'ingredients', 'cool', 'pan', 'mix']
  }
];
