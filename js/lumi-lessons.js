window.LUMI_LESSONS = [
  {
    id: 1,
    icon: '🐾',
    title: 'עקבות ביער',
    concept: 'מיון לפי סימנים',
    story: 'לומי מצאה עקבות ליד הנחל. צריך לקרוא רמזים ולבחור איזו חיה עברה כאן.',
    sticker: '🦊',
    stickerName: 'מדבקת שועל',
    type: 'classify',
    tasks: [
      { prompt: 'יש עקבות קטנות, זנב ארוך, והחיה פעילה בלילה. מי זה?', hint: 'מחפשים חיית יער ערמומית.', answer: 'fox', options: [
        { id: 'fox', label: 'שועל', emoji: '🦊', why: 'נכון! שועל פעיל הרבה בלילה ויש לו זנב ארוך.' },
        { id: 'fish', label: 'דג', emoji: '🐟', why: 'דג לא משאיר עקבות על שביל יער.' },
        { id: 'bee', label: 'דבורה', emoji: '🐝', why: 'דבורה עפה ולא משאירה עקבות כאלה.' }
      ]},
      { prompt: 'יש כנפיים, זמזום, והיא עפה מפרח לפרח. מי מתאימה?', hint: 'הסימנים אומרים: עפה ואוהבת פרחים.', answer: 'bee', options: [
        { id: 'snail', label: 'חילזון', emoji: '🐌', why: 'חילזון לא עף מפרח לפרח.' },
        { id: 'bee', label: 'דבורה', emoji: '🐝', why: 'בדיוק! דבורה עפה בין פרחים.' },
        { id: 'fox', label: 'שועל', emoji: '🦊', why: 'שועל לא מזמזם ולא עף.' }
      ]},
      { prompt: 'יש שביל רירי על עלה, בלי רגליים מהירות. מי עברה?', hint: 'זו חיה איטית מאוד.', answer: 'snail', options: [
        { id: 'snail', label: 'חילזון', emoji: '🐌', why: 'נכון! חילזון משאיר שביל רירי.' },
        { id: 'bird', label: 'ציפור', emoji: '🐦', why: 'ציפור משאירה אולי נוצה, לא שביל רירי.' },
        { id: 'bee', label: 'דבורה', emoji: '🐝', why: 'דבורה עפה ולא משאירה שביל על עלה.' }
      ]}
    ]
  },
  {
    id: 2,
    icon: '🌸',
    title: 'גינת הדפוסים',
    concept: 'רצפים ודפוסים',
    story: 'לומי שותלת גינה קסומה. כדי שהפרחים יפרחו, צריך להשלים דפוס חוזר.',
    sticker: '🌻',
    stickerName: 'מדבקת חמנייה',
    type: 'pattern',
    tasks: [
      { prompt: 'איזה פרח בא עכשיו בדפוס?', sequence: ['🌷','🌼','🌷','🌼','?'], answer: '🌷', options: ['🌷','🌼','🌻'], why: 'הדפוס הוא צבעוני לסירוגין: צבעוני, חרצית, צבעוני, חרצית.' },
      { prompt: 'השלימו את הדפוס של לומי.', sequence: ['🌱','🌱','🌸','🌱','🌱','?'], answer: '🌸', options: ['🌱','🌸','🍄'], why: 'כל שתי נביטות מגיע פרח.' },
      { prompt: 'מה חסר בשביל שהשביל יהיה מסודר?', sequence: ['🍄','🪨','🍄','🪨','🍄','?'], answer: '🪨', options: ['🪨','🍄','🌿'], why: 'אחרי כל פטרייה באה אבן.' }
    ]
  },
  {
    id: 3,
    icon: '☁️',
    title: 'תחנת מזג האוויר',
    concept: 'אם־אז והחלטות',
    story: 'לומי בודקת עננים, רוח ושמש. לפי הנתונים בוחרים פעולה מתאימה.',
    sticker: '🌈',
    stickerName: 'מדבקת קשת',
    type: 'condition',
    tasks: [
      { prompt: 'אם יורד גשם — אז מה כדאי לקחת?', condition: '🌧️ גשם', answer: 'umbrella', options: [
        { id: 'umbrella', label: 'מטרייה', emoji: '☂️', why: 'נכון! אם גשם אז מטרייה.' },
        { id: 'sunglasses', label: 'משקפי שמש', emoji: '😎', why: 'משקפי שמש מתאימים לשמש חזקה, לא לגשם.' },
        { id: 'kite', label: 'עפיפון', emoji: '🪁', why: 'עפיפון לא עוזר להישאר יבשים.' }
      ]},
      { prompt: 'אם יש רוח חזקה — אז איזו פעילות מתאימה?', condition: '💨 רוח', answer: 'kite', options: [
        { id: 'icecream', label: 'גלידה', emoji: '🍦', why: 'גלידה טעימה, אבל היא לא משתמשת ברוח.' },
        { id: 'kite', label: 'להעיף עפיפון', emoji: '🪁', why: 'נכון! רוח חזקה עוזרת לעפיפון.' },
        { id: 'lamp', label: 'להדליק מנורה', emoji: '💡', why: 'מנורה קשורה לחושך, לא לרוח.' }
      ]},
      { prompt: 'אם השמש חזקה — אז מה יעזור ללומי?', condition: '☀️ שמש חזקה', answer: 'hat', options: [
        { id: 'hat', label: 'כובע', emoji: '🧢', why: 'נכון! כובע מגן משמש חזקה.' },
        { id: 'boots', label: 'מגפי גשם', emoji: '🥾', why: 'מגפיים מתאימים יותר לשלוליות.' },
        { id: 'snowman', label: 'איש שלג', emoji: '⛄', why: 'איש שלג לא מתאים ליום שמש חזק.' }
      ]}
    ]
  },
  { id: 4, icon: '🦋', title: 'פרפרים וצבעים', concept: 'קטגוריות', story: 'ממיינים פרפרים לפי צבע ודוגמה.', sticker: '🦋', stickerName: 'מדבקת פרפר', type: 'soon' },
  { id: 5, icon: '🪺', title: 'קן הציפורים', concept: 'סדר פעולות', story: 'בונים קן לפי שלבים נכונים.', sticker: '🐦', stickerName: 'מדבקת ציפור', type: 'soon' },
  { id: 6, icon: '🧺', title: 'אוסף הזרעים', concept: 'ספירה ודאטה', story: 'אוספים זרעים ומסדרים בטבלה קטנה.', sticker: '🌰', stickerName: 'מדבקת בלוט', type: 'soon' },
  { id: 7, icon: '🌙', title: 'לילה ביער', concept: 'חיפוש וגילוי', story: 'מגלים חיות לילה לפי רמזים.', sticker: '🦉', stickerName: 'מדבקת ינשוף', type: 'soon' },
  { id: 8, icon: '🐜', title: 'שיירת הנמלים', concept: 'לולאות', story: 'מקצרים פעולות שחוזרות בשיירה.', sticker: '🐜', stickerName: 'מדבקת נמלה', type: 'soon' },
  { id: 9, icon: '🏞️', title: 'מפת השביל', concept: 'ניווט', story: 'מתכננים מסלול בטבע לפי תחנות.', sticker: '🧭', stickerName: 'מדבקת מצפן', type: 'soon' },
  { id: 10, icon: '💧', title: 'טיפות לנחל', concept: 'קלט־פלט', story: 'מה קורה כשחיישן מים מזהה יובש?', sticker: '💧', stickerName: 'מדבקת טיפה', type: 'soon' },
  { id: 11, icon: '🍄', title: 'יער הפטריות', concept: 'תנאי וגם', story: 'בוחרים רק פטרייה שיש לה שני סימנים מתאימים.', sticker: '🍄', stickerName: 'מדבקת פטרייה', type: 'soon' },
  { id: 12, icon: '🐢', title: 'הצב והקצב', concept: 'מהירות וזמן', story: 'בודקים מי מגיע לאט ומי מהר.', sticker: '🐢', stickerName: 'מדבקת צב', type: 'soon' },
  { id: 13, icon: '🌳', title: 'עץ ההחלטות', concept: 'עץ תנאים', story: 'עונים על שאלות עד שמגיעים לבחירה נכונה.', sticker: '🌳', stickerName: 'מדבקת עץ', type: 'soon' },
  { id: 14, icon: '🧪', title: 'מעבדת הטבע', concept: 'ניסוי ובדיקה', story: 'משנים דבר אחד ובודקים מה קרה.', sticker: '🔬', stickerName: 'מדבקת מעבדה', type: 'soon' },
  { id: 15, icon: '🌍', title: 'שמורת לומי', concept: 'פרויקט סיום', story: 'בונים כלל חכם ששומר על שמורת טבע.', sticker: '🏆', stickerName: 'תג חוקרת טבע', type: 'soon' }
];
