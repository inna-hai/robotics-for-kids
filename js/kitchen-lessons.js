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
      { id: 'mix', text: 'מערבבים קמח וסוכר' },
      { id: 'egg', text: 'מוסיפים ביצה' },
      { id: 'shape', text: 'יוצרים צורת כוכב' },
      { id: 'bake', text: 'אופים בתנור' }
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
      { id: 'banana', text: 'מכניסים בננה אחת' },
      { id: 'berries', text: 'מוסיפים שתי תותים' },
      { id: 'blend', text: 'מפעילים בלנדר' },
      { id: 'ice', text: 'מוסיפים קרח בסוף' }
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
      { id: 'water', text: 'מוסיפים מים לסיר' },
      { id: 'veggies', text: 'מוסיפים ירקות' },
      { id: 'stir1', text: 'מערבבים פעם ראשונה' },
      { id: 'stir2', text: 'מערבבים פעם שנייה' },
      { id: 'serve', text: 'מגישים בקערה' }
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
      { id: 'dough', text: 'פותחים בצק' },
      { id: 'sauce', text: 'מורחים רוטב' },
      { id: 'cheese', text: 'מפזרים גבינה' },
      { id: 'topping', text: 'מוסיפים תוספת' },
      { id: 'oven', text: 'מכניסים לתנור' }
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
      { id: 'cup', text: 'מניחים מנג׳ט נייר' },
      { id: 'batter', text: 'שופכים בלילה' },
      { id: 'bake', text: 'אופים' },
      { id: 'cool', text: 'מחכים שיתקרר' },
      { id: 'decorate', text: 'מקשטים בסוכריות' }
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
      { id: 'choose', text: 'בוחרים מתכון' },
      { id: 'collect', text: 'אוספים מצרכים' },
      { id: 'cook', text: 'מבשלים לפי הסדר' },
      { id: 'taste', text: 'בודקים טעם' },
      { id: 'serve', text: 'מגישים לשולחן' }
    ],
    correctOrder: ['choose', 'collect', 'cook', 'taste', 'serve'],
    displayOrder: ['serve', 'collect', 'choose', 'taste', 'cook']
  }
];
