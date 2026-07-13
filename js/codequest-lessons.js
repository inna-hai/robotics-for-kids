window.CODEQUEST_LESSONS = [
  {
    id: 1,
    unit: 'יחידה 1 — פקודות ראשונות ותנועה',
    title: 'הרובוט הראשון שלי בפייתון',
    concept: 'רובוט מצייר: forward, right, color',
    status: 'ready',
    turtleMode: true,
    story: 'הדמות הראשונה שלנו היא רובוט־קוד. הרובוט הולך על דף לבן, מסתובב ומצייר אחריו קווים צבעוניים בעזרת פקודות פייתון פשוטות.',
    goals: ['להכיר פקודות תנועה בסיסיות לרובוט', 'להבין שכיוון משפיע על forward', 'לראות קוד פייתון כמעט אמיתי שמצייר על המסך'],
    challenge: 'גרמו לרובוט לצייר על הדף: קו ירוק באורך 80, פנייה ימינה, עוד קו באורך 80, ואז קו צהוב.',
    starterCode: 'color("green")\nforward(80)\nright(90)\nforward(80)\ncolor("yellow")\nforward(80)',
    hints: ['forward(80) מזיז את הרובוט 80 פיקסלים בכיוון שהוא מסתכל אליו', 'right(90) מסובב את הרובוט ימינה', 'color("yellow") משנה את צבע הציור מהנקודה הזאת והלאה'],
    checks: ['color:green', 'forward', 'right', 'color:yellow', 'tiles:3'],
    teacherFlow: ['פתיחת סיפור: הרובוט מצייר את העולם בקוד.', 'הדגמה: forward לפני ואחרי right.', 'שינוי קוד מוכן: להחליף צבעים ומספר צעדים.', 'כתיבה עצמאית: מסלול של 3–4 צעדים.', 'דיבאג: למה forward הלך לכיוון אחר?', 'הצגה: כל תלמיד מציג את הציור הקטן שלו.']
  },
  {
    id: 2,
    unit: 'יחידה 1 — פקודות ראשונות ותנועה',
    title: 'בונים שביל צבעוני',
    concept: 'סדר ביצוע ותכנון מסלול',
    status: 'ready',
    story: 'הדמות צריכה להגיע למחנה הראשון. הדרך לא קיימת — הילדים בונים אותה באמצעות קוד וצבעים.',
    goals: ['לתכנן רצף פעולות לפני כתיבה', 'להבין שסדר השורות משנה', 'ליצור דפוס צבעים פשוט'],
    challenge: 'בנו שביל של לפחות 4 אריחים עם לפחות שני צבעים שונים.',
    starterCode: 'place_tile("blue")\nmove("right")\nplace_tile("yellow")\nmove("right")\nplace_tile("blue")\nmove("right")\nplace_tile("yellow")',
    hints: ['אפשר להשתמש בצבעים: blue, green, yellow, pink, purple', 'צריך לזוז בין אריח לאריח', 'אם כל האריחים באותו צבע — הוסיפו צבע נוסף'],
    checks: ['tiles:4', 'colors:2'],
    teacherFlow: ['פתיחת אתגר: איך מתכננים שביל לפני קוד?', 'הדגמת קוד: place ואז move.', 'שינוי קוד: החלפת צבעים.', 'עצמאי: בניית שביל אישי.', 'דיבאג: אריחים שנדרסו באותו מקום.', 'שיתוף: מי יצר דפוס ברור?']
  },
  {
    id: 3,
    unit: 'יחידה 1 — פקודות ראשונות ותנועה',
    title: 'גשר מעל מים',
    concept: 'פקודה ייעודית ובדיקת בעיה',
    status: 'ready',
    story: 'נהר חוצה את האי. הדמות לא יכולה לעבור במים בלי לבנות גשר במקום הנכון.',
    goals: ['לפרק בעיה לשלבים קטנים', 'להשתמש ב-build_bridge', 'לבדוק פתרון מול מכשול בעולם'],
    challenge: 'הגיעו לצד השני של הנהר בעזרת build_bridge וסמנו את נקודת הסיום באריח צהוב.',
    starterCode: 'move("right")\nbuild_bridge()\nmove("right")\nmove("right")\nplace_tile("yellow")',
    hints: ['המים נמצאים באמצע המסלול.', 'אם קיבלתם שגיאה על מים — חסר build_bridge לפני המעבר.', 'בסוף צריך להניח אריח צהוב.'],
    checks: ['bridge', 'x>=3', 'tile:yellow'],
    teacherFlow: ['פתיחת סיפור: הנהר חוסם את הדרך.', 'הדגמה: מה קורה כשמנסים לעבור בלי גשר.', 'שינוי קוד: להזיז את מיקום הגשר.', 'עצמאי: להגיע לצד השני.', 'דיבאג: למה הגשר לא עזר?', 'הצגה: הסבר רצף הפעולות.']
  },
  {
    id: 4,
    unit: 'יחידה 1 — פקודות ראשונות ותנועה',
    title: 'מדרגות ומסלול',
    concept: 'כיוונים ותכנון במרחב',
    status: 'ready',
    story: 'הדמות מגיעה לאזור הררי. כדי להגיע לנקודת התצפית צריך לתכנן מסלול שמשלב ימינה ולמעלה, ולא רק ללכת בקו ישר.',
    goals: ['להשתמש בכמה כיווני תנועה', 'לתכנן מסלול לפני כתיבת קוד', 'להבין שמיקום בעולם משתנה אחרי כל פקודה'],
    challenge: 'הגיעו לשורה העליונה יותר וסמנו את נקודת התצפית באריח סגול.',
    starterCode: 'move("right")\nmove("up")\nmove("up")\nplace_tile("purple")',
    hints: ['כדי לעלות משתמשים ב־move("up")', 'צריך להגיע לשורה גבוהה יותר מנקודת ההתחלה', 'בסוף סמנו את המקום עם place_tile("purple")'],
    checks: ['move:up', 'y<=1', 'tile:purple'],
    teacherFlow: ['פתיחת סיפור: ההר מחייב תכנון, לא רק תנועה קדימה.', 'הדגמה: איך כל move משנה מיקום.', 'שינוי קוד: החלפת סדר הצעדים.', 'עצמאי: תכנון מסלול קצר לנקודת תצפית.', 'דיבאג: יציאה מגבולות העולם או סימון במקום לא נכון.', 'הצגה: תלמידים מסבירים את המסלול לפני הקוד.']
  },
  {
    id: 5,
    unit: 'יחידה 1 — פקודות ראשונות ותנועה',
    title: 'אתגר יחידה: אי קטן עם שביל וגשר',
    concept: 'שילוב פקודות ותכנון פתרון',
    status: 'ready',
    story: 'סוף היחידה הראשונה: הילדים בונים אי קטן שעובד — התחלה, שביל, גשר מעל מים וסימון סיום. זו כבר משימה של תכנון ולא רק העתקת פקודות.',
    goals: ['לשלב דיבור, תנועה, אריחים וגשר', 'לפרק משימה גדולה לצעדים קטנים', 'להריץ, לבדוק ולתקן פתרון'],
    challenge: 'צרו אי קטן: התחילו בהודעה, הניחו לפחות שני אריחים, בנו גשר, עברו את המים וסמנו סיום בצהוב.',
    starterCode: 'say("מתחילים לבנות אי!")\nplace_tile("green")\nmove("right")\nbuild_bridge()\nmove("right")\nmove("right")\nplace_tile("yellow")',
    hints: ['צריך גם say, גם build_bridge וגם לפחות שני אריחים', 'אם הדמות נתקעת במים — בדקו איפה כתבתם build_bridge()', 'אריח הסיום צריך להיות צהוב: place_tile("yellow")'],
    checks: ['say', 'bridge', 'tiles:2', 'tile:yellow', 'x>=3'],
    teacherFlow: ['פתיחת אתגר יחידה: בונים אי קטן עובד.', 'הדגמה קצרה: איך מפרקים את המשימה לרשימת צעדים.', 'שינוי קוד מוכן: צבעים/הודעה/סדר פעולות.', 'עצמאי: כל זוג בונה גרסה משלו לאי.', 'דיבאג: בדיקה לפי תנאי הצלחה.', 'הצגה: כל זוג מסביר מה תכנן ומה תיקן.']
  },
  {
    id: 6,
    unit: 'יחידה 2 — משתנים וקלט',
    title: 'משתנים: צבע, שם, מספר צעדים',
    concept: 'variables',
    status: 'ready',
    story: 'הדמות לומדת לזכור מידע. במקום לכתוב אותו צבע שוב ושוב, שומרים אותו במשתנה ומשתמשים בו בבנייה.',
    goals: ['להבין שמשתנה הוא שם שמחזיק ערך', 'להשתמש במשתנה בתוך פקודת בנייה', 'לראות איך שינוי אחד משפיע על כמה פעולות'],
    challenge: 'צרו משתנה בשם color, השתמשו בו כדי להניח אריח, ואז זוזו והניחו אריח נוסף מאותו צבע.',
    starterCode: 'color = "green"\nplace_tile(color)\nmove("right")\nplace_tile(color)',
    hints: ['משתנה צבע נראה כך: color = "green"', 'אחרי ששמרתם color אפשר לכתוב place_tile(color) בלי מרכאות', 'כדי להוכיח שהמשתנה שימושי — השתמשו בו לפחות פעמיים'],
    checks: ['var:color', 'tiles:2'],
    teacherFlow: ['פתיחת סיפור: למה כדאי לתת שם למידע?', 'הדגמה: שינוי color משנה את כל האריחים.', 'שינוי קוד: להחליף green ל-blue/purple.', 'עצמאי: לבנות שני אריחים בעזרת אותו משתנה.', 'דיבאג: מרכאות סביב ערך, בלי מרכאות סביב שם משתנה.', 'הצגה: תלמידים מסבירים מה קרה כששינו את המשתנה.']
  },
  {
    id: 7,
    unit: 'יחידה 2 — משתנים וקלט',
    title: 'שם הדמות וברכת פתיחה',
    concept: 'strings + variables',
    status: 'ready',
    story: 'לפני שהמסע ממשיך, כל תלמיד נותן לדמות שם. הדמות משתמשת בשם הזה בהודעת פתיחה.',
    goals: ['לשמור טקסט במשתנה', 'להעביר משתנה לפקודה say', 'להבין שמחרוזת היא טקסט בתוך מרכאות'],
    challenge: 'צרו משתנה name עם שם לדמות, גרמו לדמות לומר את השם, ואז סמנו נקודת התחלה באריח ורוד.',
    starterCode: 'name = "נובה"\nsay(name)\nplace_tile("pink")',
    hints: ['טקסט נשמר במרכאות: name = "נובה"', 'כדי לומר את ערך המשתנה כתבו say(name)', 'בסוף צריך גם place_tile("pink")'],
    checks: ['var:name', 'say', 'tile:pink'],
    teacherFlow: ['פתיחת סיפור: הדמות מקבלת זהות.', 'הדגמה: say("נובה") לעומת say(name).', 'שינוי קוד: בחירת שם אחר.', 'עצמאי: שם + סימון התחלה.', 'דיבאג: האם כתבתם name או "name"?', 'שיתוף: כל ילד מציג את שם הדמות שלו.']
  },
  {
    id: 8,
    unit: 'יחידה 2 — משתנים וקלט',
    title: 'ניקוד ראשון: score',
    concept: 'numbers + score',
    status: 'ready',
    story: 'העולם מתחיל לתת נקודות על פעולות חכמות. הדמות שומרת ניקוד ומעדכנת אותו אחרי הצלחה.',
    goals: ['להכיר משתנה מספרי', 'לעדכן ערך קיים עם חיבור', 'להשתמש בניקוד כמנגנון משחקי'],
    challenge: 'צרו score שמתחיל ב-0, הוסיפו לו 10 נקודות, והציגו את הניקוד עם say.',
    starterCode: 'score = 0\nscore = score + 10\nsay(score)',
    hints: ['מספרים כותבים בלי מרכאות: score = 0', 'עדכון ניקוד: score = score + 10', 'כדי לראות את הערך כתבו say(score)'],
    checks: ['var:score', 'score>=10', 'say'],
    teacherFlow: ['פתיחת סיפור: מה זה ניקוד במשחק?', 'הדגמה: score לפני ואחרי חיבור.', 'שינוי קוד: להוסיף 5/10/20 נקודות.', 'עצמאי: ליצור ניקוד ולהציג אותו.', 'דיבאג: מספרים בלי מרכאות ומשתנה קיים בצד ימין.', 'הצגה: מי הצליח לשנות את סכום הנקודות?']
  },
  {
    id: 9,
    unit: 'יחידה 2 — משתנים וקלט',
    title: 'מלאי קטן: מפתח, כוכב, אוצר',
    concept: 'inventory flags',
    status: 'ready',
    story: 'הדמות מוצאת מפתח בדרך. כדי לזכור שיש לה מפתח, נשמור מידע במשתנה ונאסוף אותו מהמפה.',
    goals: ['להכיר משתנה בוליאני True/False', 'להבין שמלאי הוא מידע שהמשחק זוכר', 'לקשר בין איסוף פריט לבין מצב במשחק'],
    challenge: 'זוזו אל המפתח, אספו אותו, ושמרו במשתנה has_key שיש לכם מפתח.',
    starterCode: 'move("right")\ncollect("key")\nhas_key = True\nsay("מצאתי מפתח")',
    hints: ['המפתח נמצא צעד אחד ימינה מנקודת ההתחלה.', 'אוספים עם collect("key")', 'משתנה אמת נראה כך: has_key = True'],
    checks: ['collect:key', 'vartrue:has_key', 'say'],
    teacherFlow: ['פתיחת סיפור: למה משחק צריך לזכור מה אספנו?', 'הדגמה: איסוף מפתח ושמירת has_key.', 'שינוי קוד: לשנות הודעה אחרי איסוף.', 'עצמאי: לאסוף ולסמן שיש מפתח.', 'דיבאג: איסוף במקום הלא נכון או True באות קטנה.', 'הצגה: מי יכול להסביר מה ההבדל בין הפריט במפה לבין המשתנה?']
  },
  {
    id: 10,
    unit: 'יחידה 2 — משתנים וקלט',
    title: 'אתגר יחידה: שער שנפתח רק עם מפתח',
    concept: 'state + goal',
    status: 'ready',
    story: 'שער עתיק מוביל ליחידה הבאה. רק מי שאסף מפתח ושמר את המידע נכון יכול להגיע לנקודת הסיום.',
    goals: ['לשלב משתנים, איסוף ותנועה', 'לתכנן רצף פתרון עם מצב משחק', 'להכין בסיס לתנאים ביחידה הבאה'],
    challenge: 'אספו מפתח, שמרו has_key = True, בנו גשר אם צריך, והגיעו לצד השני של הנהר.',
    starterCode: 'move("right")\ncollect("key")\nhas_key = True\nmove("right")\nbuild_bridge()\nmove("right")\nsay("השער נפתח")',
    hints: ['קודם אוספים מפתח ורק אחר כך ממשיכים.', 'הנהר עדיין דורש build_bridge()', 'בסוף צריכה להיות גם הודעה שמראה שהשער נפתח.'],
    checks: ['collect:key', 'vartrue:has_key', 'bridge', 'x>=3', 'say'],
    teacherFlow: ['פתיחת אתגר יחידה: מה צריך לקרות לפני שער?', 'הדגמה: מצב משחק — has_key.', 'שינוי קוד: הודעת הצלחה אחרת.', 'עצמאי: פתרון מלא מרצף פעולות.', 'דיבאג: סדר לא נכון — מעבר לפני איסוף.', 'סיכום: משתנה הוא זיכרון של המשחק.']
  },
  {
    id: 11,
    unit: 'יחידה 3 — תנאים והחלטות',
    title: 'if ראשון — אם יש מפתח פתח שער',
    concept: 'if',
    status: 'ready',
    story: 'הדמות מגיעה לשער החלטה. עכשיו הקוד לא רק מבצע פעולות — הוא בודק מצב ומחליט מה לעשות.',
    goals: ['להכיר תנאי if', 'להבין שהזחה היא חלק מהקוד בפייתון', 'לקשר בין משתנה has_key לבין פתיחת שער'],
    challenge: 'שמרו has_key = True, כתבו if שבודק את המפתח, ופתחו את השער רק בתוך התנאי.',
    starterCode: 'has_key = True\nif has_key:\n    open_gate()\nsay("בדקתי את המפתח")',
    hints: ['שורת if מסתיימת בנקודתיים: if has_key:', 'הפקודה שבתוך התנאי חייבת להיות מוזחת פנימה', 'פתיחת שער נעשית עם open_gate()'],
    checks: ['vartrue:has_key', 'open_gate', 'say'],
    teacherFlow: ['פתיחת סיפור: השער לא נפתח תמיד — רק אם יש מפתח.', 'הדגמה: has_key True מול False.', 'שינוי קוד: לשנות True/False ולראות מה קורה.', 'עצמאי: לכתוב if עם open_gate.', 'דיבאג: נקודתיים והזחה.', 'סיכום: תנאי הוא החלטה בקוד.']
  },
  {
    id: 12,
    unit: 'יחידה 3 — תנאים והחלטות',
    title: 'else — אם אין מפתח, הצג רמז',
    concept: 'else',
    status: 'ready',
    story: 'לא תמיד יש לדמות את מה שהיא צריכה. קוד טוב יודע גם מה לעשות כשדבר לא מתקיים — לתת רמז במקום להיתקע.',
    goals: ['להכיר else', 'להבין שני מסלולים אפשריים בקוד', 'לכתוב משוב ידידותי לשחקן'],
    challenge: 'צרו מצב שבו אין מפתח, ואם אין מפתח — הדמות אומרת רמז ברור לשחקן.',
    starterCode: 'has_key = False\nif has_key:\n    open_gate()\nelse:\n    say("חפשו מפתח ליד השביל")',
    hints: ['else מגיע אחרי הבלוק של if', 'גם הפקודה בתוך else צריכה הזחה', 'בשיעור הזה המטרה היא להציג רמז כשאין מפתח'],
    checks: ['var:has_key', 'say'],
    teacherFlow: ['פתיחת סיפור: מה המשחק עושה כשאין לשחקן מפתח?', 'הדגמה: if/else כשני שבילים.', 'שינוי קוד: לכתוב רמז אחר.', 'עצמאי: לבנות הודעת עזרה טובה.', 'דיבאג: else בלי נקודתיים או בלי הזחה.', 'שיתוף: איזה רמז הכי עוזר לשחקן?']
  },
  { id: 13, unit: 'יחידה 3 — תנאים והחלטות', title: 'תנאים משולבים — צבע נכון + מפתח', concept: 'and', status: 'planned', story: 'שער צבעוני דורש שני תנאים.', goals: [], challenge: 'בדקו צבע ומפתח יחד.', starterCode: 'has_key = True\ncolor = "blue"\nif has_key and color == "blue":\n    open_gate()', hints: [], checks: [], teacherFlow: [] },
  { id: 14, unit: 'יחידה 3 — תנאים והחלטות', title: 'חידות לוגיות בעולם', concept: 'logic', status: 'planned', story: 'חידות פותחות אזורים חדשים.', goals: [], challenge: 'כתבו תנאי לחידה.', starterCode: 'answer = 4\nif answer == 4:\n    say("נכון!")', hints: [], checks: [], teacherFlow: [] },
  { id: 15, unit: 'יחידה 3 — תנאים והחלטות', title: 'אתגר יחידה: חדר בריחה קטן', concept: 'escape room', status: 'planned', story: 'חדר עם שער, רמז וקוד.', goals: [], challenge: 'בנו חדר בריחה קטן.', starterCode: 'has_key = True\ncode = 123\nif has_key and code == 123:\n    open_gate()', hints: [], checks: [], teacherFlow: [] },
  { id: 16, unit: 'יחידה 4 — לולאות ודפוסים', title: 'for — שביל של 5 אריחים', concept: 'for loop', status: 'planned', story: 'בונים שביל בלי להעתיק שורות.', goals: [], challenge: 'בנו שביל בלולאה.', starterCode: 'for i in range(5):\n    place_tile("blue")\n    move("right")', hints: [], checks: [], teacherFlow: [] },
  { id: 17, unit: 'יחידה 4 — לולאות ודפוסים', title: 'דפוס צבעים עם לולאה', concept: 'patterns', status: 'planned', story: 'יוצרים דפוס חוזר.', goals: [], challenge: 'צרו דפוס צבעים.', starterCode: 'colors = ["blue", "yellow"]\nfor color in colors:\n    place_tile(color)\n    move("right")', hints: [], checks: [], teacherFlow: [] },
  { id: 18, unit: 'יחידה 4 — לולאות ודפוסים', title: 'while — עד שמגיעים לשער', concept: 'while', status: 'planned', story: 'הדמות ממשיכה עד יעד.', goals: [], challenge: 'התקדמו עד שער.', starterCode: 'while not at_gate():\n    move("right")', hints: [], checks: [], teacherFlow: [] },
  { id: 19, unit: 'יחידה 4 — לולאות ודפוסים', title: 'לולאות מקוננות פשוטות — שטיח/לוח', concept: 'nested loops', status: 'planned', story: 'בונים לוח צבעוני.', goals: [], challenge: 'צרו לוח 3×3.', starterCode: 'for row in range(3):\n    for col in range(3):\n        place_tile("green")', hints: [], checks: [], teacherFlow: [] },
  { id: 20, unit: 'יחידה 4 — לולאות ודפוסים', title: 'אתגר יחידה: גינה/מפה צבעונית עם דפוסים', concept: 'pattern project', status: 'planned', story: 'מעצבים מפה עם דפוס.', goals: [], challenge: 'בנו מפה צבעונית.', starterCode: 'for i in range(5):\n    place_tile("pink")\n    move("right")', hints: [], checks: [], teacherFlow: [] },
  { id: 21, unit: 'יחידה 5 — פונקציות ורשימות', title: 'פונקציה ראשונה: build_bridge()', concept: 'functions', status: 'planned', story: 'נותנים שם לרצף פעולות.', goals: [], challenge: 'צרו פונקציית גשר.', starterCode: 'def my_bridge():\n    build_bridge()\n\nmy_bridge()', hints: [], checks: [], teacherFlow: [] },
  { id: 22, unit: 'יחידה 5 — פונקציות ורשימות', title: 'פונקציות עם פרמטרים: build_path(color, length)', concept: 'parameters', status: 'planned', story: 'בונים שבילים שונים מאותה פונקציה.', goals: [], challenge: 'צרו פונקציה עם צבע ואורך.', starterCode: 'def build_path(color, length):\n    for i in range(length):\n        place_tile(color)\n        move("right")', hints: [], checks: [], teacherFlow: [] },
  { id: 23, unit: 'יחידה 5 — פונקציות ורשימות', title: 'רשימות צבעים', concept: 'lists', status: 'planned', story: 'רשימה היא מתכון צבעים.', goals: [], challenge: 'צרו רשימת צבעים.', starterCode: 'colors = ["blue", "green", "yellow"]', hints: [], checks: [], teacherFlow: [] },
  { id: 24, unit: 'יחידה 5 — פונקציות ורשימות', title: 'מעבר על רשימה בלולאה', concept: 'iterate list', status: 'planned', story: 'כל צבע ברשימה הופך לאריח.', goals: [], challenge: 'עברו על רשימת צבעים.', starterCode: 'colors = ["blue", "green", "yellow"]\nfor color in colors:\n    place_tile(color)', hints: [], checks: [], teacherFlow: [] },
  { id: 25, unit: 'יחידה 5 — פונקציות ורשימות', title: 'אתגר יחידה: בונים עולם לפי “מתכון”', concept: 'recipe world', status: 'planned', story: 'מתכון קוד הופך למפה.', goals: [], challenge: 'בנו עולם מרשימה.', starterCode: 'recipe = ["blue", "green", "yellow"]\nfor color in recipe:\n    place_tile(color)\n    move("right")', hints: [], checks: [], teacherFlow: [] },
  { id: 26, unit: 'יחידה 6 — משחקון ופרויקט', title: 'משחק איסוף כוכבים', concept: 'mini game', status: 'planned', story: 'אוספים כוכבים ומעדכנים ניקוד.', goals: [], challenge: 'אספו כוכב ועדכנו ניקוד.', starterCode: 'score = 0\ncollect("star")\nscore = score + 1', hints: [], checks: [], teacherFlow: [] },
  { id: 27, unit: 'יחידה 6 — משחקון ופרויקט', title: 'אויב/מכשול וחיים', concept: 'lives', status: 'planned', story: 'מכשולים מורידים חיים.', goals: [], challenge: 'נהלו חיים.', starterCode: 'lives = 3\nif hit_obstacle():\n    lives = lives - 1', hints: [], checks: [], teacherFlow: [] },
  { id: 28, unit: 'יחידה 6 — משחקון ופרויקט', title: 'שלבים ורמת קושי', concept: 'levels', status: 'planned', story: 'המשחק מתקדם שלב.', goals: [], challenge: 'צרו רמת קושי.', starterCode: 'level = 1\nspeed = level * 2', hints: [], checks: [], teacherFlow: [] },
  { id: 29, unit: 'יחידה 6 — משחקון ופרויקט', title: 'פרויקט אישי/קבוצתי', concept: 'project', status: 'planned', story: 'כל קבוצה בונה עולם משלה.', goals: [], challenge: 'תכננו ובנו פרויקט.', starterCode: '# הפרויקט שלי\nsay("ברוכים הבאים")', hints: [], checks: [], teacherFlow: [] },
  { id: 30, unit: 'יחידה 6 — משחקון ופרויקט', title: 'דיבאג, שיפור והצגת פרויקט', concept: 'debug + showcase', status: 'planned', story: 'משפרים ומציגים.', goals: [], challenge: 'הציגו פרויקט עובד.', starterCode: '# בדיקה ושיפור', hints: [], checks: [], teacherFlow: [] }
];

  function codeQuestExercises(lesson) {
    if (lesson.exercises && lesson.exercises.length) return lesson.exercises;
    if (lesson.turtleMode) return [
      'הריצו את הקוד כמו שהוא ותארו מה הרובוט צייר.',
      'שנו את המספר ב-forward ל-40 ואז ל-120. מה השתנה?',
      'שנו את הצבעים לצבעים אחרים ממחסן הפקודות.',
      'הוסיפו עוד right(90) ועוד forward(80) כדי ליצור פינה נוספת.',
      'אתגר יצירתי: נסו לצייר התחלה של אות או צורה פשוטה.'
    ];
    if (lesson.id >= 11) return [
      'הריצו את קוד הפתיחה ובדקו איזה מסלול התרחש.',
      'שנו את הערך של המשתנה ובדקו אם ההתנהגות השתנתה.',
      'הוסיפו הודעת say שמסבירה לשחקן מה קרה.',
      'צרו גרסה עם תנאי או רמז אחר.',
      'דיבאג: שברו בכוונה נקודתיים/הזחה, ואז תקנו.'
    ];
    if (lesson.id >= 6) return [
      'הריצו את קוד הפתיחה והסבירו אילו משתנים נוצרו.',
      'שנו ערך של משתנה אחד והריצו שוב.',
      'השתמשו באותו משתנה בשתי פקודות שונות.',
      'הוסיפו say שמציג את ערך המשתנה.',
      'אתגר: צרו גרסה אישית עם שם/צבע/ניקוד משלכם.'
    ];
    return [
      'הריצו את קוד הפתיחה ובדקו מה קורה בעולם.',
      'שנו פקודה אחת בלבד והריצו שוב.',
      'הוסיפו עוד פעולה ממחסן הפקודות.',
      'תקנו באג מכוון: צבע לא נכון / כיוון לא נכון / פקודה חסרה.',
      'אתגר יצירתי: בנו גרסה משלכם למשימה.'
    ];
  }

  window.getCodeQuestExercises = codeQuestExercises;
