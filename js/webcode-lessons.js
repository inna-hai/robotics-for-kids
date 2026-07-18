(function () {
  const lessons = [
    {
      id: 1,
      title: 'העמוד הראשון שלי',
      concept: 'HTML בונה · CSS מעצב · JavaScript מגיב',
      durationMinutes: 90,
      story: 'פותחים מעבדת WebCode ובונים כרטיס אישי חי בדפדפן: כותרת, טקסט, כפתור, עיצוב ותגובה ללחיצה.',
      mission: 'לבנות כרטיס אישי אינטראקטיבי שמציג שם, תחביב וכפתור שמחליף הודעה.',
      outcome: 'כרטיס אישי מעוצב עם כפתור עובד והודעת JavaScript',
      starter: {
        html: '<main class="card">\n  <h1>שלום, אני נועה</h1>\n  <p>אני אוהבת רובוטים, משחקים וקוד.</p>\n  <button onclick="sayHello()">לחצו עליי</button>\n  <p id="message">כאן תופיע הודעה...</p>\n</main>',
        css: 'body {\n  font-family: Arial, sans-serif;\n  background: #e0f2fe;\n  direction: rtl;\n  text-align: center;\n}\n\n.card {\n  background: white;\n  border-radius: 24px;\n  padding: 28px;\n  width: 320px;\n  margin: 50px auto;\n  box-shadow: 0 12px 30px #93c5fd;\n}\n\nbutton {\n  background: #2563eb;\n  color: white;\n  border: 0;\n  border-radius: 999px;\n  padding: 12px 18px;\n  font-weight: bold;\n}',
        js: 'function sayHello() {\n  document.getElementById("message").textContent = "איזה כיף! הכפתור עובד 🎉";\n}'
      },
      lessonFlow: [
        { minutes: '0–8', title: 'פתיחת מעבדה', teacher: 'מציגים לילדים אתר קטן ושואלים: מה כאן מבנה, מה עיצוב ומה פעולה?', students: 'מזהים כותרת, צבע, כפתור והודעה משתנה.' },
        { minutes: '8–18', title: 'שלושת תפקידי הקוד', teacher: 'מסבירים קצר: HTML = מה יש בעמוד, CSS = איך זה נראה, JS = מה קורה כשלוחצים.', students: 'מסמנים בדוגמה איפה כל שפה משפיעה.' },
        { minutes: '18–32', title: 'בנייה מודרכת', teacher: 'פותחים את הלומדה, מריצים את הקוד ההתחלתי ומשנים יחד שם/טקסט.', students: 'משנים שם, תחביב וטקסט כפתור ומריצים.' },
        { minutes: '32–58', title: 'תרגולים אישיים', teacher: 'עוברים בין תלמידים: כל שינוי קטן חייב להיבדק בהרצה.', students: 'מבצעים תרגולים 1–5 לפי הסדר.' },
        { minutes: '58–70', title: 'דיבאג ראשון', teacher: 'מדגימים טעות קטנה: id לא תואם או גרשיים חסרים, ומראים איך מתקנים.', students: 'מתקנים באג מוכן ומסבירים מה נשבר.' },
        { minutes: '70–82', title: 'שדרוג יצירתי', teacher: 'נותנים בחירה: צבעים, אימוג׳י, משפט סודי או כפתור נוסף.', students: 'מוסיפים שדרוג אחד ומריצים.' },
        { minutes: '82–90', title: 'דמו קצר', teacher: 'בוחרים 2–3 תלמידים להצגה ומסכמים שלוש שפות Web.', students: 'מציגים: מה שיניתי ב־HTML, ב־CSS וב־JavaScript.' }
      ],
      exercises: [
        { id: 1, minutes: '18–25', title: 'תרגול 1 — זה הכרטיס שלי', prompt: 'שנו את השם בכותרת ואת המשפט שמתאר אתכם.', hint: 'חפשו את h1 ואת p הראשון באזור HTML.', check: { htmlIncludes: ['<h1', '<p'] } },
        { id: 2, minutes: '25–32', title: 'תרגול 2 — כפתור עם טקסט ברור', prompt: 'שנו את הטקסט שעל הכפתור למשהו משלכם, למשל “גלו סוד”.', hint: 'הטקסט נמצא בין <button> לבין </button>.', check: { htmlIncludes: ['button', 'onclick="sayHello()"'] } },
        { id: 3, minutes: '32–42', title: 'תרגול 3 — עיצוב צבעים', prompt: 'שנו את צבע הרקע של העמוד ואת צבע הכפתור.', hint: 'ב־CSS חפשו background בתוך body ובתוך button.', check: { cssIncludes: ['body', 'button', 'background'] } },
        { id: 4, minutes: '42–50', title: 'תרגול 4 — ההודעה שלי', prompt: 'שנו את ההודעה שמופיעה אחרי לחיצה על הכפתור.', hint: 'ב־JavaScript חפשו textContent.', check: { jsIncludes: ['textContent', 'message'] } },
        { id: 5, minutes: '50–58', title: 'תרגול 5 — מוסיפים רשימה', prompt: 'הוסיפו לכרטיס רשימה קצרה של 3 דברים שאתם אוהבים.', hint: 'אפשר להשתמש ב־<ul> וב־<li>.', check: { htmlIncludes: ['<li'] } },
        { id: 6, minutes: '58–66', title: 'תרגול 6 — תקן את הבאג', prompt: 'שנו לרגע את id="message" ל־id="messege" והריצו. ראו שהכפתור לא עובד, ואז תקנו חזרה.', hint: 'JavaScript מחפש בדיוק id בשם message.', check: { htmlIncludes: ['id="message"'], jsIncludes: ['getElementById("message")'] } },
        { id: 7, minutes: '66–76', title: 'תרגול 7 — שדרוג יצירתי', prompt: 'הוסיפו אימוג׳י, צבע נוסף או משפט סודי שמופיע אחרי לחיצה.', hint: 'אפשר לשנות CSS או את הטקסט בתוך JavaScript.', check: { jsIncludes: ['sayHello'] } },
        { id: 8, minutes: '76–84', title: 'תרגול 8 — בדיקת חברים', prompt: 'תנו לחבר/ה ללחוץ על הכפתור ולקרוא את הכרטיס. שפרו דבר אחד שהיה לא ברור.', hint: 'שיפור קטן מספיק: טקסט ברור יותר, צבע קריא יותר או כפתור בולט יותר.', check: { htmlIncludes: ['button'], cssIncludes: ['border-radius'] } }
      ],
      aiHelper: [
        'הציעו לילד/ה 3 רעיונות למשפט פתיחה מצחיק לכרטיס אישי.',
        'הסבירו בשפה של כיתה ד׳ למה הכפתור לא עובד אם ה־id לא תואם.',
        'הציעו שילוב צבעים נעים לכרטיס אישי של תלמיד/ה שאוהב/ת חלל.',
        'תנו רעיון לשדרוג קטן שלא דורש קוד חדש מסובך.'
      ],
      vocabulary: [
        ['HTML', 'מה יש בעמוד: כותרת, פסקה, כפתור'],
        ['CSS', 'איך העמוד נראה: צבעים, גודל, ריווח'],
        ['JavaScript', 'מה קורה אחרי פעולה של המשתמש'],
        ['id', 'שם מיוחד לאלמנט כדי ש־JavaScript ימצא אותו'],
        ['דיבאג', 'לבדוק מה נשבר ולתקן צעד־צעד']
      ]
    },
    {
      id: 2,
      title: 'מעצבים כרטיס כמו מקצוענים',
      concept: 'CSS: צבעים · ריווח · גבולות · Hover',
      durationMinutes: 90,
      story: 'אחרי שבנינו כרטיס ראשון, הופכים אותו לעמוד שנראה כמו מוצר אמיתי: צבעים, טיפוגרפיה, כפתורים, כרטיסים ואפקט קטן כשהעכבר עובר.',
      mission: 'לעצב כרטיס אישי מקצועי עם תמונת אימוג׳י, רשימת פרטים, כפתור בולט ואפקט hover.',
      outcome: 'כרטיס אישי מעוצב עם CSS ברור, מבנה מסודר ואינטראקציית hover',
      starter: {
        html: '<main class="profile-card">\n  <div class="avatar">🚀</div>\n  <h1>דניאל המפתח</h1>\n  <p class="tagline">אני בונה דברים קטנים שעובדים בדפדפן.</p>\n  <ul>\n    <li>תחביב: משחקים</li>\n    <li>כוח מיוחד: רעיונות</li>\n    <li>יעד: לבנות אתר משלי</li>\n  </ul>\n  <button onclick="changeMood()">שנו מצב רוח</button>\n  <p id="mood">מצב רוח: מוכן לקוד</p>\n</main>',
        css: 'body {\n  font-family: Arial, sans-serif;\n  direction: rtl;\n  text-align: center;\n  background: linear-gradient(135deg, #dbeafe, #fff7ed);\n}\n\n.profile-card {\n  background: white;\n  width: 360px;\n  margin: 45px auto;\n  padding: 28px;\n  border-radius: 28px;\n  box-shadow: 0 16px 35px #bfdbfe;\n}\n\n.avatar {\n  font-size: 56px;\n}\n\n.tagline {\n  color: #475569;\n}\n\nul {\n  text-align: right;\n  line-height: 1.8;\n}\n\nbutton {\n  background: #f97316;\n  color: white;\n  border: 0;\n  border-radius: 999px;\n  padding: 12px 20px;\n  font-weight: bold;\n}\n\nbutton:hover {\n  background: #2563eb;\n}',
        js: 'function changeMood() {\n  document.getElementById("mood").textContent = "מצב רוח: העיצוב עובד ✨";\n}'
      },
      lessonFlow: [
        { minutes: '0–8', title: 'פתיחת סטודיו עיצוב', teacher: 'מציגים שני כרטיסים: אחד פשוט ואחד מעוצב. שואלים מה גורם לשני להיראות מקצועי.', students: 'מזהים צבעים, ריווח, גבולות, גודל טקסט וכפתור.' },
        { minutes: '8–18', title: 'CSS כערכת עיצוב', teacher: 'מסבירים selector, property ו-value דרך דוגמאות קצרות בלבד.', students: 'מצביעים על .profile-card, background, padding ו-border-radius.' },
        { minutes: '18–30', title: 'הרצה ושינוי ראשון', teacher: 'מריצים את הקוד ומשנים יחד צבע אחד, ריווח אחד ואימוג׳י אחד.', students: 'משנים אימוג׳י וצבע רקע ורואים תוצאה.' },
        { minutes: '30–55', title: 'תרגולי עיצוב', teacher: 'מדגישים: שינוי קטן ואז הרצה. לא לשנות הכל בבת אחת.', students: 'מבצעים תרגולים 1–5.' },
        { minutes: '55–67', title: 'Hover ואינטראקציה עדינה', teacher: 'מדגימים מה קורה כשעוברים עם העכבר על כפתור ולמה זה משפר חוויה.', students: 'משנים צבע hover ובודקים.' },
        { minutes: '67–80', title: 'דיבאג CSS', teacher: 'מדגימים נקודה חסרה בשם class או סוגר מסולסל חסר.', students: 'מתקנים באג CSS מוכן.' },
        { minutes: '80–90', title: 'גלריית כרטיסים', teacher: 'עושים סבב קצר: כל תלמיד מציג החלטת עיצוב אחת.', students: 'מסבירים: בחרתי צבע/ריווח/כפתור כי…' }
      ],
      exercises: [
        { id: 1, minutes: '18–24', title: 'תרגול 1 — מחליפים דמות', prompt: 'שנו את האימוג׳י בכרטיס לדמות שמייצגת אתכם.', hint: 'חפשו את div עם class="avatar".', check: { htmlIncludes: ['class="avatar"'] } },
        { id: 2, minutes: '24–31', title: 'תרגול 2 — צבע רקע', prompt: 'שנו את צבעי הרקע של העמוד לגרדיאנט אחר.', hint: 'ב־body חפשו background: linear-gradient.', check: { cssIncludes: ['linear-gradient'] } },
        { id: 3, minutes: '31–38', title: 'תרגול 3 — כרטיס נעים לקריאה', prompt: 'שנו width, padding או margin כדי שהכרטיס יהיה נוח יותר.', hint: 'חפשו את .profile-card.', check: { cssIncludes: ['.profile-card', 'padding'] } },
        { id: 4, minutes: '38–46', title: 'תרגול 4 — רשימת פרטים', prompt: 'שנו את שלושת פריטי הרשימה לפרטים שלכם.', hint: 'כל פריט ברשימה נמצא בתוך <li>.', check: { htmlIncludes: ['<li>'] } },
        { id: 5, minutes: '46–55', title: 'תרגול 5 — כפתור מותג', prompt: 'עצבו את הכפתור: צבע, ריווח, עיגול או גודל טקסט.', hint: 'חפשו button באזור CSS.', check: { cssIncludes: ['button', 'border-radius'] } },
        { id: 6, minutes: '55–63', title: 'תרגול 6 — Hover', prompt: 'שנו את הצבע של הכפתור במעבר עכבר.', hint: 'חפשו button:hover.', check: { cssIncludes: ['button:hover'] } },
        { id: 7, minutes: '63–72', title: 'תרגול 7 — תקן את הבאג', prompt: 'שנו לרגע .profile-card ל־profile-card בלי נקודה וראו שהעיצוב נשבר. תקנו בחזרה.', hint: 'class ב־CSS מתחיל בנקודה.', check: { cssIncludes: ['.profile-card'] } },
        { id: 8, minutes: '72–82', title: 'תרגול 8 — שדרוג אישי', prompt: 'הוסיפו class חדש או צבע נוסף לכותרת, לרשימה או להודעת מצב הרוח.', hint: 'אפשר להוסיף CSS ל־h1, ul או #mood.', check: { cssIncludes: ['h1'] } }
      ],
      aiHelper: [
        'הציעו שלוש פלטות צבעים לכרטיס של תלמיד/ה שאוהב/ת ספורט, חלל או מוזיקה.',
        'הסבירו לילד בכיתה ד׳ מה ההבדל בין class לבין id.',
        'עזרו למצוא למה CSS לא עובד כאשר שכחתי נקודה לפני שם class.',
        'הציעו שדרוג עיצוב קטן לכרטיס בלי להוסיף JavaScript חדש.'
      ],
      vocabulary: [
        ['selector', 'למי העיצוב פונה: body, button או .profile-card'],
        ['property', 'מה משנים: צבע, גודל, ריווח או גבול'],
        ['value', 'הערך החדש: blue, 28px, white'],
        ['class', 'שם לקבוצה או חלק בעמוד כדי לעצב אותו'],
        ['hover', 'מה קורה כשעוברים עם העכבר מעל אלמנט']
      ]
    },
    {
      id: 3,
      title: 'כפתורים שמפעילים קסמים',
      concept: 'JavaScript Events: לחיצה → פעולה → שינוי במסך',
      durationMinutes: 90,
      story: 'הכרטיס כבר נראה טוב. עכשיו הופכים אותו לחי באמת: כפתורים שמשנים טקסט, צבע, אימוג׳י ומצב בעמוד.',
      mission: 'לבנות עמוד עם כמה כפתורים שכל אחד מפעיל פעולה אחרת במסך.',
      outcome: 'עמוד אינטראקטיבי עם שלושה כפתורים, פונקציות JavaScript ושינוי תוכן בזמן אמת',
      starter: {
        html: '<main class="app">\n  <h1>מעבדת הכפתורים שלי</h1>\n  <div id="emoji" class="emoji">🙂</div>\n  <p id="status">בחרו פעולה והעמוד ישתנה.</p>\n  <button onclick="makeHappy()">שמח</button>\n  <button onclick="makeRobot()">רובוט</button>\n  <button onclick="changeColor()">צבע חדש</button>\n</main>',
        css: 'body {\n  font-family: Arial, sans-serif;\n  direction: rtl;\n  text-align: center;\n  background: #f8fafc;\n}\n\n.app {\n  background: white;\n  width: 380px;\n  margin: 45px auto;\n  padding: 28px;\n  border-radius: 28px;\n  box-shadow: 0 16px 35px #cbd5e1;\n}\n\n.emoji {\n  font-size: 72px;\n  margin: 18px;\n}\n\nbutton {\n  margin: 6px;\n  padding: 12px 18px;\n  border: 0;\n  border-radius: 999px;\n  background: #2563eb;\n  color: white;\n  font-weight: bold;\n}\n\n.magic {\n  background: #fff7ed;\n  border: 4px solid #fb923c;\n}',
        js: 'function makeHappy() {\n  document.getElementById("emoji").textContent = "😄";\n  document.getElementById("status").textContent = "העמוד שמח!";\n}\n\nfunction makeRobot() {\n  document.getElementById("emoji").textContent = "🤖";\n  document.getElementById("status").textContent = "מצב רובוט הופעל.";\n}\n\nfunction changeColor() {\n  document.querySelector(".app").classList.toggle("magic");\n}'
      },
      lessonFlow: [
        { minutes: '0–8', title: 'מה זו אינטראקציה?', teacher: 'מציגים עמוד עם כפתור ושואלים: מה המשתמש עושה ומה המחשב עושה בתגובה?', students: 'מתארים לחיצה, שינוי טקסט, שינוי צבע ומשוב.' },
        { minutes: '8–18', title: 'אירוע ופעולה', teacher: 'מסבירים: onclick קורא לפונקציה; פונקציה היא רשימת פעולות עם שם.', students: 'מוצאים בקוד את onclick ואת function עם אותו שם.' },
        { minutes: '18–30', title: 'הרצה מודרכת', teacher: 'מריצים ולוחצים על כל כפתור. משנים יחד אימוג׳י אחד והודעה אחת.', students: 'בודקים שכל כפתור מפעיל שינוי אחר.' },
        { minutes: '30–55', title: 'תרגולי JavaScript', teacher: 'מזכירים: שם הפונקציה ב־HTML חייב להיות זהה לשם ב־JS.', students: 'מבצעים תרגולים 1–5 ומריצים אחרי כל שינוי.' },
        { minutes: '55–67', title: 'classList וקסם עיצובי', teacher: 'מדגימים toggle: פעם מוסיף עיצוב ופעם מסיר.', students: 'משנים את class magic ובודקים את הכפתור.' },
        { minutes: '67–80', title: 'דיבאג אירועים', teacher: 'יוצרים טעות בשם פונקציה ומראים איך מוצאים חוסר התאמה.', students: 'מתקנים onclick שלא מוצא פונקציה.' },
        { minutes: '80–90', title: 'מיני הצגה', teacher: 'מבקשים מכל ילד להראות כפתור אחד ולהסביר את השרשרת.', students: 'מסבירים: לחיצה → פונקציה → שינוי במסך.' }
      ],
      exercises: [
        { id: 1, minutes: '18–24', title: 'תרגול 1 — הודעה חדשה', prompt: 'שנו את הטקסט שמופיע אחרי לחיצה על כפתור “שמח”.', hint: 'חפשו את הפונקציה makeHappy ואת textContent.', check: { jsIncludes: ['function makeHappy', 'textContent'] } },
        { id: 2, minutes: '24–31', title: 'תרגול 2 — אימוג׳י משלכם', prompt: 'שנו את האימוג׳י של אחד הכפתורים לאימוג׳י אחר.', hint: 'האימוג׳י נמצא בתוך מרכאות ב־JavaScript.', check: { jsIncludes: ['emoji'] } },
        { id: 3, minutes: '31–39', title: 'תרגול 3 — כפתור רביעי', prompt: 'הוסיפו כפתור חדש ב־HTML שקורא לפונקציה חדשה.', hint: 'צריך גם <button onclick="..."> וגם function באותו שם.', check: { htmlIncludes: ['onclick'], jsIncludes: ['function'] } },
        { id: 4, minutes: '39–48', title: 'תרגול 4 — פונקציה חדשה', prompt: 'כתבו פונקציה חדשה שמשנה גם אימוג׳י וגם הודעה.', hint: 'אפשר להעתיק מבנה של makeRobot ולשנות שם ותוכן.', check: { jsIncludes: ['getElementById("status")', 'getElementById("emoji")'] } },
        { id: 5, minutes: '48–57', title: 'תרגול 5 — עיצוב קסם', prompt: 'שנו את העיצוב של class magic: צבע רקע, גבול או עובי.', hint: 'חפשו .magic באזור CSS.', check: { cssIncludes: ['.magic'] } },
        { id: 6, minutes: '57–66', title: 'תרגול 6 — Toggle', prompt: 'בדקו שכפתור “צבע חדש” מפעיל ומכבה את העיצוב בכל לחיצה.', hint: 'classList.toggle מוסיף/מסיר class.', check: { jsIncludes: ['classList.toggle("magic")'] } },
        { id: 7, minutes: '66–76', title: 'תרגול 7 — תקן את הבאג', prompt: 'שנו לרגע onclick="makeRobot()" ל־onclick="makeRobott()". ראו שנשבר ותקנו.', hint: 'שם הפונקציה חייב להיות זהה בדיוק.', check: { htmlIncludes: ['makeRobot()'], jsIncludes: ['function makeRobot'] } },
        { id: 8, minutes: '76–84', title: 'תרגול 8 — אפליקציית מצבים', prompt: 'הפכו את העמוד לאפליקציית מצבים: שמח, רובוט, חלל או ספורט.', hint: 'שנו טקסטים, אימוג׳ים ושמות כפתורים.', check: { htmlIncludes: ['button'], jsIncludes: ['function'] } }
      ],
      aiHelper: [
        'הסבירו לילד בכיתה ד׳ מה הקשר בין onclick לבין function.',
        'תנו רעיונות לשלושה מצבים מצחיקים שאפשר להפעיל בכפתורים.',
        'עזרו למצוא למה כפתור לא עובד כאשר שם הפונקציה לא זהה.',
        'הציעו שדרוג קטן שמשנה גם טקסט וגם עיצוב בלחיצה.'
      ],
      vocabulary: [
        ['event', 'אירוע שקורה בעמוד, למשל לחיצה על כפתור'],
        ['onclick', 'הוראה ב־HTML: כשיש לחיצה, הפעל פונקציה'],
        ['function', 'קבוצת פעולות עם שם שאפשר להפעיל'],
        ['textContent', 'שינוי הטקסט שבתוך אלמנט'],
        ['classList.toggle', 'להדליק או לכבות עיצוב של class']
      ]
    },
    {
      id: 4,
      title: 'העמוד שמקשיב לי',
      concept: 'Input: קלט מהמשתמש ותשובה אישית',
      durationMinutes: 90,
      story: 'הילדים בונים עמוד ששואל שאלה, קורא מה המשתמש כתב, ומחזיר תשובה אישית על המסך.',
      mission: 'לבנות מחולל ברכה פשוט: המשתמש כותב שם ותחביב, והעמוד יוצר לו הודעה אישית.',
      outcome: 'טופס קטן עם input, כפתור, קריאת value והודעה אישית',
      starter: {
        html: '<main class="generator">\n  <h1>מחולל הברכות שלי</h1>\n  <label>שם:\n    <input id="nameInput" placeholder="כתבו שם">\n  </label>\n  <label>תחביב:\n    <input id="hobbyInput" placeholder="כתבו תחביב">\n  </label>\n  <button onclick="makeGreeting()">צרו ברכה</button>\n  <p id="result">כאן תופיע הברכה...</p>\n</main>',
        css: 'body {\n  font-family: Arial, sans-serif;\n  direction: rtl;\n  text-align: center;\n  background: linear-gradient(135deg, #ecfeff, #fdf2f8);\n}\n\n.generator {\n  background: white;\n  width: 390px;\n  margin: 45px auto;\n  padding: 28px;\n  border-radius: 28px;\n  box-shadow: 0 16px 35px #bae6fd;\n}\n\nlabel {\n  display: block;\n  margin: 14px;\n  font-weight: bold;\n}\n\ninput {\n  display: block;\n  width: 100%;\n  margin-top: 6px;\n  padding: 12px;\n  border: 2px solid #cbd5e1;\n  border-radius: 14px;\n  text-align: center;\n}\n\nbutton {\n  background: #7c3aed;\n  color: white;\n  border: 0;\n  border-radius: 999px;\n  padding: 12px 20px;\n  font-weight: bold;\n}\n\n#result {\n  background: #f8fafc;\n  border-radius: 18px;\n  padding: 14px;\n}',
        js: 'function makeGreeting() {\n  const name = document.getElementById("nameInput").value;\n  const hobby = document.getElementById("hobbyInput").value;\n  document.getElementById("result").textContent = name + ", איזה כיף שאת/ה אוהב/ת " + hobby + "!";\n}'
      },
      lessonFlow: [
        { minutes: '0–8', title: 'פתיחה: אתר ששואל ועונה', teacher: 'מציגים טופס קצר ושואלים מה הופך אתר לאישי יותר.', students: 'מזהים שדה כתיבה, כפתור ותוצאה אישית.' },
        { minutes: '8–18', title: 'מה זה קלט?', teacher: 'מסבירים input ו־value: מה שהמשתמש כתב הופך למידע שהקוד יכול לקרוא.', students: 'מוצאים בקוד את input ואת id של כל שדה.' },
        { minutes: '18–30', title: 'הרצה מודרכת', teacher: 'מריצים, כותבים שם ותחביב, ולוחצים על הכפתור.', students: 'בודקים שהברכה משתנה לפי מה שהקלידו.' },
        { minutes: '30–55', title: 'תרגולי טופס', teacher: 'מדגישים התאמה בין id ב־HTML לבין getElementById ב־JS.', students: 'מבצעים תרגולים 1–5.' },
        { minutes: '55–67', title: 'מחברים משפטים', teacher: 'מסבירים שרשור טקסט עם + בצורה פשוטה ומוגבלת.', students: 'משנים את המשפט שנוצר ומוסיפים אימוג׳י.' },
        { minutes: '67–80', title: 'דיבאג קלט', teacher: 'יוצרים טעות id ומראים למה התוצאה לא מופיעה.', students: 'מתקנים id לא תואם.' },
        { minutes: '80–90', title: 'תערוכת מחוללים', teacher: 'סבב קצר: כל תלמיד נותן לחבר למלא את הטופס.', students: 'מציגים מחולל אישי ומשפט שנוצר.' }
      ],
      exercises: [
        { id: 1, minutes: '18–24', title: 'תרגול 1 — בודקים את המחולל', prompt: 'כתבו שם ותחביב בתצוגה ולחצו על הכפתור.', hint: 'אם לא קורה כלום, לחצו קודם הרצה.', check: { htmlIncludes: ['id="nameInput"'], jsIncludes: ['makeGreeting'] } },
        { id: 2, minutes: '24–31', title: 'תרגול 2 — משנים שאלה', prompt: 'שנו את השדה “תחביב” לשאלה אחרת, למשל “מאכל אהוב”.', hint: 'שנו גם את הטקסט ב־label וגם את placeholder.', check: { htmlIncludes: ['placeholder'] } },
        { id: 3, minutes: '31–39', title: 'תרגול 3 — משפט אישי', prompt: 'שנו את המשפט שנוצר ב־JavaScript למשפט משלכם.', hint: 'חפשו את השורה עם textContent.', check: { jsIncludes: ['textContent', '+'] } },
        { id: 4, minutes: '39–48', title: 'תרגול 4 — צבע לטופס', prompt: 'שנו את צבע הכפתור והרקע של התוצאה.', hint: 'חפשו button ואת #result ב־CSS.', check: { cssIncludes: ['button', '#result'] } },
        { id: 5, minutes: '48–56', title: 'תרגול 5 — שדה שלישי', prompt: 'הוסיפו input נוסף, למשל “צבע אהוב”, וקראו לו ב־JavaScript.', hint: 'צריך id חדש ושורת getElementById חדשה.', check: { htmlIncludes: ['input'], jsIncludes: ['getElementById'] } },
        { id: 6, minutes: '56–65', title: 'תרגול 6 — מוסיפים אימוג׳י', prompt: 'הוסיפו אימוג׳י לתוצאה שנוצרת.', hint: 'אפשר להוסיף אימוג׳י בתוך המרכאות ב־JavaScript.', check: { jsIncludes: ['textContent'] } },
        { id: 7, minutes: '65–75', title: 'תרגול 7 — תקן את הבאג', prompt: 'שנו לרגע nameInput ל־nameinput וראו שהקוד נשבר. תקנו את האותיות כך שיתאימו בדיוק.', hint: 'JavaScript רגיש לאותיות גדולות/קטנות באנגלית.', check: { htmlIncludes: ['id="nameInput"'], jsIncludes: ['getElementById("nameInput")'] } },
        { id: 8, minutes: '75–84', title: 'תרגול 8 — מחולל חדש', prompt: 'הפכו את הברכה למחולל אחר: שם גיבור, שם משחק, רעיון למסיבה או סיסמת על.', hint: 'אפשר לשנות כותרת, labels ואת משפט התוצאה.', check: { htmlIncludes: ['<h1'], jsIncludes: ['value'] } }
      ],
      aiHelper: [
        'הציעו 5 רעיונות למחוללים פשוטים שמתאימים לכיתה ד׳.',
        'הסבירו לילד מה ההבדל בין id של input לבין value שלו.',
        'עזרו למצוא למה getElementById לא מוצא את השדה.',
        'הציעו משפט תוצאה מצחיק שמשתמש בשם ובתחביב.'
      ],
      vocabulary: [
        ['input', 'שדה שבו המשתמש מקליד משהו'],
        ['value', 'מה שכתוב כרגע בתוך השדה'],
        ['const', 'שם קטן שבו שומרים מידע שהקוד קרא'],
        ['placeholder', 'טקסט עזרה שמופיע בתוך שדה ריק'],
        ['שרשור', 'חיבור חלקי טקסט בעזרת +']
      ]
    },
    {
      id: 5,
      title: 'חידון כן או לא',
      concept: 'תנאים: if / else ומשוב לתשובה',
      durationMinutes: 90,
      story: 'בונים חידון קטן בדפדפן: המשתמש עונה, הקוד בודק אם התשובה נכונה, ומחזיר משוב מתאים.',
      mission: 'לבנות חידון אינטראקטיבי עם שאלה, שדה תשובה, בדיקת if/else ומשוב נכון/כמעט.',
      outcome: 'חידון קצר שעובד עם תנאי, קלט מהמשתמש ומשוב צבעוני',
      starter: {
        html: '<main class="quiz">\n  <h1>חידון WebCode</h1>\n  <p class="question">איזו שפה מעצבת את העמוד?</p>\n  <input id="answerInput" placeholder="כתבו תשובה">\n  <button onclick="checkAnswer()">בדקו תשובה</button>\n  <p id="feedback">כאן יופיע משוב...</p>\n</main>',
        css: 'body {\n  font-family: Arial, sans-serif;\n  direction: rtl;\n  text-align: center;\n  background: linear-gradient(135deg, #f0fdf4, #eff6ff);\n}\n\n.quiz {\n  background: white;\n  width: 390px;\n  margin: 45px auto;\n  padding: 28px;\n  border-radius: 28px;\n  box-shadow: 0 16px 35px #bbf7d0;\n}\n\n.question {\n  font-size: 22px;\n  font-weight: bold;\n}\n\ninput {\n  width: 100%;\n  padding: 12px;\n  border: 2px solid #cbd5e1;\n  border-radius: 14px;\n  text-align: center;\n}\n\nbutton {\n  margin-top: 14px;\n  background: #16a34a;\n  color: white;\n  border: 0;\n  border-radius: 999px;\n  padding: 12px 20px;\n  font-weight: bold;\n}\n\n.correct { color: #15803d; font-weight: bold; }\n.wrong { color: #b91c1c; font-weight: bold; }',
        js: 'function checkAnswer() {\n  const answer = document.getElementById("answerInput").value;\n  const feedback = document.getElementById("feedback");\n\n  if (answer === "CSS") {\n    feedback.textContent = "נכון מאוד! CSS מעצב את העמוד 🎨";\n    feedback.className = "correct";\n  } else {\n    feedback.textContent = "כמעט! נסו לחשוב איזו שפה אחראית לצבעים.";\n    feedback.className = "wrong";\n  }\n}'
      },
      lessonFlow: [
        { minutes: '0–8', title: 'פתיחה: מחשב שמחליט', teacher: 'מציגים חידון קצר ושואלים איך המחשב יודע אם התשובה נכונה.', students: 'מנחשים שיש בדיקה: אם התשובה שווה לתשובה הנכונה.' },
        { minutes: '8–18', title: 'if / else בלי פחד', teacher: 'מסבירים: אם התנאי נכון — עושים פעולה אחת; אחרת — פעולה אחרת.', students: 'מסמנים בקוד את if, את else ואת שתי הודעות המשוב.' },
        { minutes: '18–30', title: 'הרצה מודרכת', teacher: 'מריצים עם CSS ואז עם תשובה שגויה. מראים את ההבדל בצבע ובטקסט.', students: 'בודקים תשובות שונות ומזהים מתי נכנסים ל־if ומתי ל־else.' },
        { minutes: '30–55', title: 'תרגולי חידון', teacher: 'מוודאים שהתלמידים משנים גם שאלה וגם תשובה נכונה, לא רק טקסט.', students: 'מבצעים תרגולים 1–5 ומריצים אחרי כל שינוי.' },
        { minutes: '55–67', title: 'משוב טוב', teacher: 'מדברים על משוב שעוזר ללמוד: לא רק “טעית”, אלא רמז.', students: 'כותבים הודעת שגיאה עם רמז.' },
        { minutes: '67–80', title: 'דיבאג תנאי', teacher: 'מדגימים טעות נפוצה: תשובה נכונה שונה באותיות גדולות/קטנות.', students: 'מתקנים תנאי שלא מזהה תשובה.' },
        { minutes: '80–90', title: 'חידון חברים', teacher: 'מחלקים זוגות: כל תלמיד מנסה את החידון של חבר.', students: 'בודקים חידון, נותנים רמז לשיפור ומציגים שאלה אחת.' }
      ],
      exercises: [
        { id: 1, minutes: '18–24', title: 'תרגול 1 — מריצים את החידון', prompt: 'כתבו CSS ובדקו שמופיעה הודעת הצלחה. אחר כך כתבו תשובה שגויה.', hint: 'התשובה הנכונה כרגע היא CSS בדיוק באותיות גדולות.', check: { jsIncludes: ['if', 'else'] } },
        { id: 2, minutes: '24–31', title: 'תרגול 2 — שאלה חדשה', prompt: 'שנו את שאלת החידון לשאלה משלכם.', hint: 'חפשו את p עם class="question".', check: { htmlIncludes: ['class="question"'] } },
        { id: 3, minutes: '31–39', title: 'תרגול 3 — תשובה נכונה חדשה', prompt: 'שנו את התנאי כך שהתשובה הנכונה תתאים לשאלה החדשה.', hint: 'חפשו answer === "CSS".', check: { jsIncludes: ['answer ==='] } },
        { id: 4, minutes: '39–47', title: 'תרגול 4 — הודעת הצלחה', prompt: 'כתבו הודעת הצלחה שמתאימה לשאלה שלכם.', hint: 'הודעת ההצלחה נמצאת בתוך ה־if.', check: { jsIncludes: ['correct'] } },
        { id: 5, minutes: '47–56', title: 'תרגול 5 — רמז בתשובה שגויה', prompt: 'שנו את הודעת ה־else כך שתיתן רמז אמיתי.', hint: 'משוב טוב עוזר, לא מעליב.', check: { jsIncludes: ['wrong', 'else'] } },
        { id: 6, minutes: '56–65', title: 'תרגול 6 — צבעי משוב', prompt: 'שנו את צבעי correct ו־wrong ב־CSS.', hint: 'חפשו .correct ו־.wrong.', check: { cssIncludes: ['.correct', '.wrong'] } },
        { id: 7, minutes: '65–75', title: 'תרגול 7 — תקן את הבאג', prompt: 'שנו לרגע answerInput ל־answerinput וראו שהבדיקה נשברת. תקנו התאמה בין HTML ל־JS.', hint: 'id באנגלית חייב להיות זהה בדיוק.', check: { htmlIncludes: ['id="answerInput"'], jsIncludes: ['getElementById("answerInput")'] } },
        { id: 8, minutes: '75–84', title: 'תרגול 8 — חידון בנושא אישי', prompt: 'הפכו את החידון לשאלה על משחק, ספורט, מוזיקה, חלל או חיות.', hint: 'שנו כותרת, שאלה, תשובה נכונה ושני סוגי משוב.', check: { htmlIncludes: ['input', 'button'], jsIncludes: ['if', 'else'] } }
      ],
      aiHelper: [
        'הציעו 5 שאלות חידון פשוטות לכיתה ד׳ בנושא מחשבים.',
        'הסבירו בשפה פשוטה מה עושה if ומה עושה else.',
        'עזרו למצוא למה תשובה נכונה לא מזוהה בגלל אותיות גדולות/קטנות.',
        'הציעו הודעת שגיאה שנותנת רמז ולא מגלה מיד את התשובה.'
      ],
      vocabulary: [
        ['if', 'אם התנאי נכון — בצעו פעולה'],
        ['else', 'אחרת — בצעו פעולה אחרת'],
        ['===', 'בדיקה אם שני דברים שווים בדיוק'],
        ['משוב', 'הודעה שעוזרת למשתמש להבין מה קרה'],
        ['className', 'שינוי שם class כדי להחליף עיצוב']
      ]
    },
    {
      id: 6,
      title: 'ניקוד ומשתנים',
      concept: 'Variable: זוכרים מספר ומשנים אותו',
      durationMinutes: 90,
      story: 'אחרי שלמדנו לבדוק תשובות, מוסיפים זיכרון קטן למשחק: משתנה ניקוד שעולה בכל תשובה נכונה ומוצג על המסך.',
      mission: 'לבנות חידון ניקוד שבו כל תשובה נכונה מוסיפה נקודה, והתוצאה מתעדכנת מיד.',
      outcome: 'משחק חידון קצר עם משתנה score, עדכון ניקוד ומשוב לשחקן',
      starter: {
        html: '<main class="score-game">\n  <h1>משחק הניקוד שלי</h1>\n  <p>ניקוד: <span id="scoreText">0</span></p>\n  <p class="question">מה מוסיף עיצוב לעמוד?</p>\n  <input id="answerInput" placeholder="כתבו תשובה">\n  <button onclick="checkAnswer()">בדקו</button>\n  <button onclick="resetScore()">איפוס ניקוד</button>\n  <p id="feedback">ענו כדי לקבל נקודות.</p>\n</main>',
        css: 'body {\n  font-family: Arial, sans-serif;\n  direction: rtl;\n  text-align: center;\n  background: linear-gradient(135deg, #fef3c7, #dbeafe);\n}\n\n.score-game {\n  background: white;\n  width: 390px;\n  margin: 45px auto;\n  padding: 28px;\n  border-radius: 28px;\n  box-shadow: 0 16px 35px #fde68a;\n}\n\n#scoreText {\n  display: inline-block;\n  background: #facc15;\n  border-radius: 999px;\n  padding: 6px 14px;\n  font-weight: bold;\n}\n\ninput {\n  width: 100%;\n  padding: 12px;\n  border: 2px solid #cbd5e1;\n  border-radius: 14px;\n  text-align: center;\n}\n\nbutton {\n  margin: 8px 4px;\n  background: #2563eb;\n  color: white;\n  border: 0;\n  border-radius: 999px;\n  padding: 12px 18px;\n  font-weight: bold;\n}\n\n.success { color: #15803d; font-weight: bold; }\n.try-again { color: #b45309; font-weight: bold; }',
        js: 'let score = 0;\n\nfunction checkAnswer() {\n  const answer = document.getElementById("answerInput").value;\n  const feedback = document.getElementById("feedback");\n\n  if (answer === "CSS") {\n    score = score + 1;\n    document.getElementById("scoreText").textContent = score;\n    feedback.textContent = "נכון! קיבלת נקודה ⭐";\n    feedback.className = "success";\n  } else {\n    feedback.textContent = "כמעט. נסו שוב בלי לאבד נקודות.";\n    feedback.className = "try-again";\n  }\n}\n\nfunction resetScore() {\n  score = 0;\n  document.getElementById("scoreText").textContent = score;\n  document.getElementById("feedback").textContent = "הניקוד אופס.";\n}'
      },
      lessonFlow: [
        { minutes: '0–8', title: 'פתיחה: משחק שזוכר', teacher: 'שואלים איך משחק יודע כמה נקודות יש לנו גם אחרי כמה לחיצות.', students: 'מעלים רעיון של “זיכרון” או מספר שנשמר.' },
        { minutes: '8–18', title: 'מה זה משתנה?', teacher: 'מסבירים ש־score הוא קופסה עם מספר, ואפשר להגדיל אותה.', students: 'מוצאים בקוד את let score = 0 ואת score = score + 1.' },
        { minutes: '18–30', title: 'הרצה מודרכת', teacher: 'מריצים, עונים נכון פעמיים, עונים לא נכון, ומאפסים.', students: 'בודקים שהניקוד עולה רק בתשובה נכונה.' },
        { minutes: '30–55', title: 'תרגולי ניקוד', teacher: 'מדגישים: המשתנה משתנה בקוד, וה־span מציג אותו בעמוד.', students: 'מבצעים תרגולים 1–5.' },
        { minutes: '55–67', title: 'שדרוג חוקי ניקוד', teacher: 'מדגימים שינוי: תשובה נכונה מוסיפה 2 נקודות או תשובה שגויה מורידה נקודה.', students: 'בוחרים חוק ניקוד אחד ומשנים.' },
        { minutes: '67–80', title: 'דיבאג משתנה', teacher: 'יוצרים טעות בשם scoreText או score ומראים איך מתקנים.', students: 'מתקנים באג הצגת ניקוד.' },
        { minutes: '80–90', title: 'בדיקת משחק', teacher: 'מבקשים מזוגות לבדוק אם אפשר “לרמות” את המשחק.', students: 'מנסים, מדווחים ומשפרים חוק אחד.' }
      ],
      exercises: [
        { id: 1, minutes: '18–24', title: 'תרגול 1 — בודקים ניקוד', prompt: 'ענו CSS כמה פעמים ובדקו שהניקוד עולה.', hint: 'כל תשובה נכונה מפעילה score = score + 1.', check: { jsIncludes: ['let score = 0', 'score = score + 1'] } },
        { id: 2, minutes: '24–31', title: 'תרגול 2 — שאלה חדשה', prompt: 'שנו את שאלת החידון אבל השאירו ניקוד עובד.', hint: 'שנו את הטקסט עם class="question".', check: { htmlIncludes: ['class="question"'] } },
        { id: 3, minutes: '31–39', title: 'תרגול 3 — תשובה חדשה', prompt: 'שנו את התשובה הנכונה בתנאי.', hint: 'חפשו answer === "CSS".', check: { jsIncludes: ['answer ==='] } },
        { id: 4, minutes: '39–47', title: 'תרגול 4 — שתי נקודות', prompt: 'שנו את המשחק כך שתשובה נכונה תוסיף 2 נקודות.', hint: 'במקום score + 1 אפשר לכתוב score + 2.', check: { jsIncludes: ['score = score +'] } },
        { id: 5, minutes: '47–56', title: 'תרגול 5 — עיצוב ניקוד', prompt: 'שנו את העיצוב של #scoreText כדי שהניקוד יהיה בולט יותר.', hint: 'חפשו #scoreText ב־CSS.', check: { cssIncludes: ['#scoreText'] } },
        { id: 6, minutes: '56–65', title: 'תרגול 6 — איפוס ברור', prompt: 'שנו את הודעת האיפוס למשפט משלכם.', hint: 'חפשו function resetScore.', check: { jsIncludes: ['function resetScore', 'score = 0'] } },
        { id: 7, minutes: '65–75', title: 'תרגול 7 — תקן את הבאג', prompt: 'שנו לרגע scoreText ל־scoreTex וראו שהמספר לא מתעדכן. תקנו.', hint: 'ה־id ב־HTML חייב להתאים למה ש־JS מחפש.', check: { htmlIncludes: ['id="scoreText"'], jsIncludes: ['getElementById("scoreText")'] } },
        { id: 8, minutes: '75–84', title: 'תרגול 8 — משחק ניקוד אישי', prompt: 'הפכו את המשחק לחידון בנושא שלכם עם ניקוד, משוב ואיפוס.', hint: 'שנו כותרת, שאלה, תשובה, הודעות ועיצוב.', check: { htmlIncludes: ['scoreText', 'button'], jsIncludes: ['score', 'if', 'else'] } }
      ],
      aiHelper: [
        'הסבירו לילד בכיתה ד׳ מה זה משתנה בעזרת דוגמה של קופת נקודות.',
        'תנו רעיונות לחוקי ניקוד פשוטים למשחק חידון.',
        'עזרו למצוא למה הניקוד לא מתעדכן על המסך למרות שהמשתנה משתנה.',
        'הציעו שדרוג שמוסיף תגמול מיוחד כשמגיעים ל־5 נקודות.'
      ],
      vocabulary: [
        ['variable', 'משתנה: מקום ששומר ערך כמו מספר'],
        ['let', 'יוצרים משתנה שאפשר לשנות אחר כך'],
        ['score', 'ניקוד המשחק'],
        ['span', 'חלק קטן בתוך טקסט שאפשר לעדכן'],
        ['reset', 'איפוס ערך להתחלה']
      ]
    },
    {
      id: 7,
      title: 'משחק קליקים ראשון',
      concept: 'משחקיות: קליק · ניקוד · יעד ניצחון',
      durationMinutes: 90,
      story: 'מחברים את כל מה שלמדנו — כפתור, משתנה, תנאי ומשוב — למשחק קליקים קטן שבו צריך להגיע ליעד נקודות.',
      mission: 'לבנות משחק שבו כל קליק מוסיף נקודה, וב־10 נקודות מופיעה הודעת ניצחון.',
      outcome: 'משחק קליקים עובד עם score, יעד ניצחון, איפוס ושדרוג קושי',
      starter: {
        html: '<main class="click-game">\n  <h1>משחק הקליקים שלי</h1>\n  <p>ניקוד: <span id="scoreText">0</span></p>\n  <button id="clickButton" onclick="addPoint()">🎯 לחצו לנקודה</button>\n  <button onclick="resetGame()">איפוס</button>\n  <p id="message">המטרה: להגיע ל־10 נקודות.</p>\n</main>',
        css: 'body {\n  font-family: Arial, sans-serif;\n  direction: rtl;\n  text-align: center;\n  background: linear-gradient(135deg, #fdf2f8, #e0f2fe);\n}\n\n.click-game {\n  background: white;\n  width: 390px;\n  margin: 45px auto;\n  padding: 30px;\n  border-radius: 30px;\n  box-shadow: 0 16px 35px #fbcfe8;\n}\n\n#scoreText {\n  font-size: 34px;\n  font-weight: bold;\n  color: #7c3aed;\n}\n\nbutton {\n  margin: 8px;\n  padding: 14px 22px;\n  border: 0;\n  border-radius: 999px;\n  background: #ec4899;\n  color: white;\n  font-weight: bold;\n  cursor: pointer;\n}\n\nbutton:hover {\n  transform: scale(1.05);\n}\n\n.win {\n  background: #dcfce7;\n  border: 3px solid #22c55e;\n}',
        js: 'let score = 0;\nconst target = 10;\n\nfunction addPoint() {\n  score = score + 1;\n  document.getElementById("scoreText").textContent = score;\n\n  if (score >= target) {\n    document.getElementById("message").textContent = "ניצחת! הגעת ליעד 🎉";\n    document.querySelector(".click-game").classList.add("win");\n  } else {\n    document.getElementById("message").textContent = "עוד קצת! צריך להגיע ל־" + target;\n  }\n}\n\nfunction resetGame() {\n  score = 0;\n  document.getElementById("scoreText").textContent = score;\n  document.getElementById("message").textContent = "המטרה: להגיע ל־10 נקודות.";\n  document.querySelector(".click-game").classList.remove("win");\n}'
      },
      lessonFlow: [
        { minutes: '0–8', title: 'פתיחה: מה הופך קליק למשחק?', teacher: 'מציגים כפתור שמעלה ניקוד ושואלים מה חסר כדי שזה יהיה משחק.', students: 'מציעים מטרה, ניקוד, ניצחון, איפוס ושיפור קושי.' },
        { minutes: '8–18', title: 'חלקי המשחק', teacher: 'מפרקים את המשחק: score, target, addPoint, if score >= target.', students: 'מסמנים בקוד את המשתנה, היעד והתנאי.' },
        { minutes: '18–30', title: 'הרצה מודרכת', teacher: 'מריצים ולוחצים עד ניצחון. מדגימים איפוס.', students: 'בודקים שהניקוד עולה ושב־10 נקודות מופיע ניצחון.' },
        { minutes: '30–55', title: 'תרגולי משחק', teacher: 'מוודאים שכל שינוי נבדק בהרצה ולא רק נכתב.', students: 'מבצעים תרגולים 1–5.' },
        { minutes: '55–67', title: 'איזון קושי', teacher: 'מדברים על קושי: יעד נמוך מדי קל, יעד גבוה מדי משעמם.', students: 'משנים יעד ומחליטים למה.' },
        { minutes: '67–80', title: 'דיבאג משחק', teacher: 'מדגימים באג: scoreText לא תואם או target לא מספר.', students: 'מתקנים באג ומסבירים מה נשבר.' },
        { minutes: '80–90', title: 'בדיקת שחקנים', teacher: 'זוגות משחקים אחד אצל השני ונותנים משוב קצר.', students: 'משפרים דבר אחד: טקסט, צבע, יעד או כפתור.' }
      ],
      exercises: [
        { id: 1, minutes: '18–24', title: 'תרגול 1 — משחקים עד ניצחון', prompt: 'לחצו על הכפתור עד שהמשחק מציג ניצחון.', hint: 'היעד כרגע הוא 10 נקודות.', check: { jsIncludes: ['let score = 0', 'const target = 10'] } },
        { id: 2, minutes: '24–31', title: 'תרגול 2 — שם משחק חדש', prompt: 'שנו את הכותרת ואת טקסט הכפתור למשחק משלכם.', hint: 'הכותרת ב־h1 והכפתור ב־button עם id="clickButton".', check: { htmlIncludes: ['id="clickButton"'] } },
        { id: 3, minutes: '31–39', title: 'תרגול 3 — יעד אחר', prompt: 'שנו את target ל־5 או 15 ובדקו איך זה משנה את הקושי.', hint: 'חפשו const target = 10.', check: { jsIncludes: ['const target'] } },
        { id: 4, minutes: '39–47', title: 'תרגול 4 — נקודות כפולות', prompt: 'שנו כך שכל קליק יוסיף 2 נקודות.', hint: 'חפשו score = score + 1.', check: { jsIncludes: ['score = score +'] } },
        { id: 5, minutes: '47–56', title: 'תרגול 5 — הודעת ניצחון', prompt: 'כתבו הודעת ניצחון שמתאימה למשחק שלכם.', hint: 'ההודעה נמצאת בתוך ה־if.', check: { jsIncludes: ['score >= target', 'ניצחת'] } },
        { id: 6, minutes: '56–65', title: 'תרגול 6 — עיצוב מצב ניצחון', prompt: 'שנו את העיצוב של class win.', hint: 'חפשו .win ב־CSS.', check: { cssIncludes: ['.win'] } },
        { id: 7, minutes: '65–75', title: 'תרגול 7 — תקן את הבאג', prompt: 'שנו לרגע scoreText ל־scoreTex וראו שהניקוד לא מוצג. תקנו.', hint: 'ה־id חייב להיות זהה ב־HTML וב־JavaScript.', check: { htmlIncludes: ['id="scoreText"'], jsIncludes: ['getElementById("scoreText")'] } },
        { id: 8, minutes: '75–84', title: 'תרגול 8 — גרסת משחק אישית', prompt: 'הפכו את המשחק למשחק קליקים בנושא משלכם: חלל, חיות, ספורט, ממתקים או רובוטים.', hint: 'שנו כותרת, כפתור, צבעים, הודעות ויעד.', check: { htmlIncludes: ['button'], cssIncludes: ['button:hover'], jsIncludes: ['resetGame'] } }
      ],
      aiHelper: [
        'הציעו 5 נושאים למשחק קליקים פשוט לכיתה ד׳.',
        'הסבירו למה צריך גם score וגם target במשחק.',
        'עזרו למצוא למה הודעת הניצחון לא מופיעה למרות שהניקוד עולה.',
        'הציעו דרך לאזן משחק קליקים כך שלא יהיה קל מדי ולא משעמם.'
      ],
      vocabulary: [
        ['target', 'יעד הנקודות שצריך להגיע אליו כדי לנצח'],
        ['>=', 'גדול או שווה — בדיקה אם הגענו ליעד'],
        ['addPoint', 'פונקציה שמוסיפה נקודה בכל קליק'],
        ['resetGame', 'פונקציה שמחזירה את המשחק להתחלה'],
        ['איזון קושי', 'להחליט כמה קל או קשה לנצח במשחק']
      ]
    }
  ];

  window.WEBCODE_LESSONS = lessons;
  window.getWebCodeLesson = function (id) {
    const numeric = Number(id) || 1;
    return lessons.find(l => l.id === numeric) || lessons[0];
  };
})();
