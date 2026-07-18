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
    }
  ];

  window.WEBCODE_LESSONS = lessons;
  window.getWebCodeLesson = function (id) {
    const numeric = Number(id) || 1;
    return lessons.find(l => l.id === numeric) || lessons[0];
  };
})();
