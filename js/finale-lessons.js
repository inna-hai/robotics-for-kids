window.FINALE_ACTIONS = {
  scan: { label: 'בדוק מצב', icon: '🔎', type: 'start' },
  move: { label: 'סע לנקודה', icon: '🤖➡️', type: 'move' },
  light: { label: 'הדלק אור', icon: '💡', type: 'action' },
  bridge: { label: 'הנח גשר', icon: '🌉', type: 'action' },
  alert: { label: 'שלח הודעה', icon: '📢', type: 'action' },
  open: { label: 'פתח שער', icon: '🔓', type: 'action' },
  photo: { label: 'צלם הוכחה', icon: '📸', type: 'check' },
  celebrate: { label: 'חגוג', icon: '🎉', type: 'extra' }
};

window.FINALE_CONDITIONS = {
  darkAndPeople: { label: 'חשוך וגם יש אנשים', icon: '🌙+🚶' },
  waterAndTurtle: { label: 'מים וגם צב מחכה', icon: '🌊+🐢' },
  noiseAndClass: { label: 'רעש וגם שיעור פעיל', icon: '🔊+🏫' },
  lockedAndCode: { label: 'שער נעול וגם קוד נכון', icon: '🔐+✅' },
  rainAndKids: { label: 'גשם וגם ילדים בחוץ', icon: '🌧️+👧' },
  trashAndPark: { label: 'אשפה וגם פארק פתוח', icon: '🗑️+🌳' }
};

window.FINALE_MISSIONS = [
  {
    id: 1,
    emoji: '🌙',
    title: 'הרחוב החשוך',
    district: 'רחוב העיר',
    goal: 'לעזור לאנשים ללכת בבטחה ברחוב חשוך.',
    condition: 'darkAndPeople',
    correctActions: ['scan', 'move', 'light'],
    distractor: 'celebrate',
    explanation: 'קודם בודקים מצב, אחר כך מגיעים לרחוב, ואז מדליקים אור.',
    learningNote: 'זו משימת שילוב: תנאי “וגם” מוביל לרצף פעולות קצר.'
  },
  {
    id: 2,
    emoji: '🐢',
    title: 'הצב ליד הנחל',
    district: 'פארק המים',
    goal: 'לעזור לצב לעבור לצד השני בלי להירטב.',
    condition: 'waterAndTurtle',
    correctActions: ['scan', 'move', 'bridge'],
    distractor: 'light',
    explanation: 'הבעיה היא מים וצב, לכן הפתרון הוא גשר — לא אור.',
    learningNote: 'דיבוג: פעולה יכולה להיות נכונה במקום אחר אבל מיותרת במשימה הזו.'
  },
  {
    id: 3,
    emoji: '🏫',
    title: 'כיתה רועשת מדי',
    district: 'בית הספר',
    goal: 'לעזור לכיתה לחזור לעבודה רגועה.',
    condition: 'noiseAndClass',
    correctActions: ['scan', 'alert', 'photo'],
    distractor: 'bridge',
    explanation: 'בודקים רעש, שולחים הודעת שקט, ואז מצלמים הוכחה שהמצב השתפר.',
    learningNote: 'לפעמים פעולה היא הודעה ולא תנועה פיזית. גם זה פלט של מערכת חכמה.'
  },
  {
    id: 4,
    emoji: '🔐',
    title: 'שער החירום',
    district: 'מרכז העיר',
    goal: 'לפתוח שער רק אם הוא נעול וגם הקוד נכון.',
    condition: 'lockedAndCode',
    correctActions: ['scan', 'open', 'alert'],
    distractor: 'celebrate',
    explanation: 'בודקים את שני התנאים, פותחים, ואז מודיעים שהשער פתוח.',
    learningNote: 'תנאי “וגם” עוזר למנוע פעולה בזמן לא נכון.'
  },
  {
    id: 5,
    emoji: '🌧️',
    title: 'גשם בהפסקה',
    district: 'חצר בית הספר',
    goal: 'להזהיר ילדים בחוץ כשמתחיל גשם.',
    condition: 'rainAndKids',
    correctActions: ['scan', 'alert', 'move'],
    distractor: 'open',
    explanation: 'המערכת מזהה גשם וילדים, שולחת הודעה, ואז הרובוט מגיע לעזור.',
    learningNote: 'אותו רעיון תכנותי יכול לעבוד בסיפורים שונים: תנאי, פעולה, בדיקה.'
  },
  {
    id: 6,
    emoji: '🌳',
    title: 'פארק נקי לסיום',
    district: 'פארק העיר',
    goal: 'לסיים את הקורס במשימת עיר חכמה נקייה ובטוחה.',
    condition: 'trashAndPark',
    correctActions: ['scan', 'move', 'photo'],
    distractor: 'light',
    explanation: 'בודקים שיש אשפה בפארק, מגיעים למקום, ומצלמים הוכחה אחרי הטיפול.',
    learningNote: 'שיעור שיא: הילדים מחברים תנאים, רצף, פעולה מתאימה ודיבוג.'
  }
];

window.FINALE_MISSIONS.push(
  { id: 7, emoji: '💡', title: 'אור במעבר החציה', district: 'רחוב בית הספר', goal: 'להאיר מעבר חציה כשחשוך ויש ילדים.', condition: 'darkAndPeople', correctActions: ['scan','move','light'], distractor: 'bridge', explanation: 'בודקים חושך ואנשים, נוסעים למעבר ומדליקים אור.', learningNote: 'תנאי נכון מוביל לפעולה בטוחה ומתאימה.' },
  { id: 8, emoji: '🌉', title: 'גשרון אחרי גשם', district: 'גינת העיר', goal: 'לעזור לילדים לעבור שלולית גדולה.', condition: 'rainAndKids', correctActions: ['scan','move','bridge'], distractor: 'open', explanation: 'הבעיה היא מים בדרך, לכן מניחים גשרון ולא פותחים שער.', learningNote: 'דיבוג: פעולה טובה במקום אחד יכולה להיות לא מתאימה במקום אחר.' },
  { id: 9, emoji: '📢', title: 'הודעת שקט בספרייה', district: 'ספרייה עירונית', goal: 'להזכיר בעדינות לשמור על שקט בזמן פעילות.', condition: 'noiseAndClass', correctActions: ['scan','alert','photo'], distractor: 'light', explanation: 'בודקים רעש, שולחים הודעה ומוודאים שהמצב השתפר.', learningNote: 'פלט של מערכת יכול להיות גם הודעה שמכוונת אנשים לפעולה רגועה ונכונה.' },
  { id: 10, emoji: '🔓', title: 'שער קוד במרכז', district: 'מרכז רובוטים', goal: 'לפתוח שער רק כשהוא נעול ויש קוד נכון.', condition: 'lockedAndCode', correctActions: ['scan','open','alert'], distractor: 'bridge', explanation: 'בודקים את שני התנאים, פותחים ואז מודיעים.', learningNote: 'תנאי וגם עוזר למנוע פעולה לא בטוחה ולבצע פתיחה רק כשהכול מתאים.' },
  { id: 11, emoji: '📸', title: 'דוח ניקיון פארק', district: 'פארק ירוק', goal: 'לתעד טיפול באשפה בפארק פתוח.', condition: 'trashAndPark', correctActions: ['scan','move','photo'], distractor: 'open', explanation: 'בודקים אשפה, מגיעים למקום ומצלמים הוכחה.', learningNote: 'מערכת חכמה גם מבצעת וגם בודקת שהטיפול הצליח.' },
  { id: 12, emoji: '🏁', title: 'משימת העיר הסופית', district: 'כל העיר החכמה', goal: 'לסיים את הקורס במשימה שמשלבת תנאי, רצף ודיבוג.', condition: 'waterAndTurtle', correctActions: ['scan','move','bridge'], distractor: 'celebrate', explanation: 'קודם בודקים את מצב הצב והמים, אחר כך נוסעים ומניחים גשר בטוח.', learningNote: 'סיום הקורס: תנאי נכון, רצף פעולות, והסבר למה הפעולה מתאימה.' }
);
