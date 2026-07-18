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
    }
  ];

  window.WEBCODE_LESSONS = lessons;
  window.getWebCodeLesson = function (id) {
    const numeric = Number(id) || 1;
    return lessons.find(l => l.id === numeric) || lessons[0];
  };
})();
