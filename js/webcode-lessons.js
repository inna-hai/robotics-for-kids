(function () {
  const lessons = [
    {
      id: 1,
      title: 'העמוד הראשון שלי — בלוקים שבונים אתר',
      concept: 'גשר מ־Blockly ל־Web: בלוק → קוד → תוצאה',
      durationMinutes: 90,
      story: 'פותחים מעבדת WebCode בצורה מוכרת מכיתה ג׳: קודם לוחצים על בלוקי Web שבונים כרטיס אישי, אחר כך רואים איזה HTML/CSS/JavaScript נוצר מאחורי הקלעים.' ,
      mission: 'לבנות כרטיס אישי ראשון בעזרת בלוקי Web: כותרת, משפט, צבע, כפתור והודעה בלחיצה.' ,
      outcome: 'כרטיס אישי עובד שנבנה קודם בבלוקים, עם הצצה ראשונה לקוד שנוצר',
      starter: {
        html: '<main class="card">\n  <h1>שלום, אני נועה</h1>\n  <p>אני אוהבת רובוטים, משחקים וקוד.</p>\n  <button onclick="sayHello()">לחצו עליי</button>\n  <p id="message">כאן תופיע הודעה...</p>\n</main>',
        css: 'body {\n  font-family: Arial, sans-serif;\n  background: #e0f2fe;\n  direction: rtl;\n  text-align: center;\n}\n\n.card {\n  background: white;\n  border-radius: 24px;\n  padding: 28px;\n  width: 320px;\n  margin: 50px auto;\n  box-shadow: 0 12px 30px #93c5fd;\n}\n\nbutton {\n  background: #2563eb;\n  color: white;\n  border: 0;\n  border-radius: 999px;\n  padding: 12px 18px;\n  font-weight: bold;\n}',
        js: 'function sayHello() {\n  document.getElementById("message").textContent = "איזה כיף! הכפתור עובד 🎉";\n}'
      },
      lessonFlow: [
        { minutes: '0–8', title: 'פתיחה: מבלוקים לאתר', teacher: 'מזכירים את Blockly מכיתה ג׳ ומציגים את הרעיון החדש: בלוק Web בונה חלק באתר.', students: 'מזהים שהכרטיס מורכב מכותרת, משפט, צבע, כפתור והודעה.' },
        { minutes: '8–18', title: 'הדגמת בלוק ראשון', teacher: 'לוחצים יחד על הבלוק “צור כרטיס אישי”, מריצים, ואז מצביעים על השורה שנוצרה ב־HTML.', students: 'רואים שהבלוק שינה את הקוד בלי שהיו צריכים לכתוב סינטקס.' },
        { minutes: '18–34', title: 'בנייה מודרכת בבלוקים', teacher: 'מפעילים עם הכיתה 3–4 בלוקי Web לפי הסדר: מבנה, משפט, צבע, כפתור.', students: 'לוחצים על בלוקים, מריצים אחרי כל בלוק, ומתארים מה השתנה במסך.' },
        { minutes: '34–50', title: 'התבוננות בקוד שנוצר', teacher: 'פותחים בכל פעם לשונית אחרת: HTML/CSS/JS, ומדגישים רק מילים מוכרות: h1, background, textContent.', students: 'מחברים בין בלוק לבין הקוד שהוא שינה.' },
        { minutes: '50–66', title: 'תרגול עצמאי עם בלוקים', teacher: 'נותנים לתלמידים להשלים את הכרטיס בעזרת בלוקי Web ורק שינויי טקסט קטנים.', students: 'מבצעים תרגולים 1–5 בלי לכתוב קוד חופשי.' },
        { minutes: '66–78', title: 'שינוי קטן בקוד', teacher: 'מאפשרים שינוי בטוח אחד: טקסט בכותרת או הודעת כפתור, לא מבנה חדש.', students: 'משנים מילים בתוך הקוד, מריצים, ומתקנים בעזרת רמזים אם נשבר.' },
        { minutes: '78–90', title: 'הצגה וסיכום הגשר', teacher: 'מסכמים: בלוק הוא דרך נוחה לבנות; קוד הוא מה שהדפדפן קורא.', students: 'מציגים כרטיס ואומרים: “הבלוק שבחרתי שינה את ___ בקוד”.' }
      ],
      exercises: [
        { id: 1, minutes: '18–24', title: 'תרגול 1 — מפעילים בלוק מבנה', prompt: 'לחצו על הבלוק “צור כרטיס אישי”, הריצו, ובדקו מה השתנה בכותרת.', hint: 'אל תכתבו קוד עדיין — רק לחצו על הבלוק והסתכלו על HTML.', check: { htmlIncludes: ['מפתח/ת צעיר/ה'] } },
        { id: 2, minutes: '24–30', title: 'תרגול 2 — בלוק משפט אישי', prompt: 'הפעילו בלוק שמחליף את המשפט בכרטיס, ואז מצאו את המשפט בתוך HTML.', hint: 'המשפט נמצא בתוך תגית <p>.', check: { htmlIncludes: ['ליצור דברים בדפדפן'] } },
        { id: 3, minutes: '30–38', title: 'תרגול 3 — בלוק צבע רקע', prompt: 'הפעילו בלוק עיצוב שמשנה צבע רקע, ואז עברו ללשונית CSS וראו את background.', hint: 'CSS אחראי לאיך האתר נראה.', check: { cssIncludes: ['background: #fef3c7'] } },
        { id: 4, minutes: '38–46', title: 'תרגול 4 — בלוק כפתור', prompt: 'הפעילו בלוק שמשנה את טקסט הכפתור ל“גלו הודעה”.', hint: 'הכפתור עדיין מפעיל onclick, אבל אנחנו משנים רק את הטקסט שלו.', check: { htmlIncludes: ['גלו הודעה', 'onclick="sayHello()"'] } },
        { id: 5, minutes: '46–56', title: 'תרגול 5 — בלוק הודעה בלחיצה', prompt: 'הפעילו בלוק שמשנה את ההודעה שמופיעה אחרי לחיצה על הכפתור.', hint: 'זו הצצה ל־JavaScript: הוא משנה textContent.', check: { jsIncludes: ['ברוכים הבאים לאתר הראשון שלי'] } },
        { id: 6, minutes: '56–66', title: 'תרגול 6 — שינוי בטוח בקוד', prompt: 'עכשיו מותר לשנות רק מילה אחת בתוך הכותרת או המשפט. הריצו ובדקו.', hint: 'שנו טקסט בין תגיות, לא את הסימנים < >.', check: { htmlIncludes: ['<h1', '<p'] } },
        { id: 7, minutes: '66–76', title: 'תרגול 7 — דיבאג עדין', prompt: 'אם משהו נשבר, לחצו איפוס או בדקו שלא מחקתם גרשיים/סוגריים. נסו לתקן בעזרת הרמז.', hint: 'בשיעור 1 מתקנים רק טקסט ו־id, לא כותבים פונקציה חדשה.', check: { htmlIncludes: ['id="message"'], jsIncludes: ['getElementById("message")'] } },
        { id: 8, minutes: '76–84', title: 'תרגול 8 — הצגת הכרטיס', prompt: 'תנו לחבר/ה ללחוץ על הכפתור ולהגיד איזה בלוק הכי שינה את הכרטיס.', hint: 'הסבירו במילים: הבלוק הזה שינה HTML / CSS / JavaScript.', check: { htmlIncludes: ['button'], cssIncludes: ['border-radius'], jsIncludes: ['textContent'] } }
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
      title: 'מעצבים כרטיס — בלוקי צבע וצורה',
      concept: 'בלוקי עיצוב → CSS: צבעים · ריווח · צורה',
      durationMinutes: 90,
      story: 'אחרי שבנינו כרטיס עם בלוקי Web, לומדים שבלוקי עיצוב משנים את ה־CSS: צבעים, ריווח, כפתור ואפקט מעבר קטן.' ,
      mission: 'לעצב כרטיס אישי בעזרת בלוקי עיצוב, ואז לזהות את שורות ה־CSS שהבלוקים שינו.' ,
      outcome: 'כרטיס אישי מעוצב שנבנה מבלוקי CSS, עם הצצה למושגים class, background ו־hover',
      starter: {
        html: '<main class="profile-card">\n  <div class="avatar">🚀</div>\n  <h1>דניאל המפתח</h1>\n  <p class="tagline">אני בונה דברים קטנים שעובדים בדפדפן.</p>\n  <ul>\n    <li>תחביב: משחקים</li>\n    <li>כוח מיוחד: רעיונות</li>\n    <li>יעד: לבנות אתר משלי</li>\n  </ul>\n  <button onclick="changeMood()">שנו מצב רוח</button>\n  <p id="mood">מצב רוח: מוכן לקוד</p>\n</main>',
        css: 'body {\n  font-family: Arial, sans-serif;\n  direction: rtl;\n  text-align: center;\n  background: linear-gradient(135deg, #dbeafe, #fff7ed);\n}\n\n.profile-card {\n  background: white;\n  width: 360px;\n  margin: 45px auto;\n  padding: 28px;\n  border-radius: 28px;\n  box-shadow: 0 16px 35px #bfdbfe;\n}\n\n.avatar {\n  font-size: 56px;\n}\n\n.tagline {\n  color: #475569;\n}\n\nul {\n  text-align: right;\n  line-height: 1.8;\n}\n\nbutton {\n  background: #f97316;\n  color: white;\n  border: 0;\n  border-radius: 999px;\n  padding: 12px 20px;\n  font-weight: bold;\n}\n\nbutton:hover {\n  background: #2563eb;\n}',
        js: 'function changeMood() {\n  document.getElementById("mood").textContent = "מצב רוח: העיצוב עובד ✨";\n}'
      },
      lessonFlow: [
        { minutes: '0–8', title: 'פתיחה: עיצוב הוא הוראות', teacher: 'מציגים את הכרטיס משיעור 1 ושואלים מה אפשר לשנות בלי לשנות את התוכן.', students: 'מזהים צבע, גודל, ריווח, עיגול כפתור ואימוג׳י.' },
        { minutes: '8–18', title: 'בלוק עיצוב ראשון', teacher: 'לוחצים יחד על בלוק “פלטת צבעים” ומראים ששורת background ב־CSS השתנתה.', students: 'רואים שבלוק עיצוב משנה CSS, לא HTML.' },
        { minutes: '18–34', title: 'בנייה מודרכת בבלוקי CSS', teacher: 'מפעילים בלוקים: בחר דמות, פלטת צבעים, כפתור משתנה.', students: 'לוחצים על בלוקים, מריצים, ומתארים מה השתנה ויזואלית.' },
        { minutes: '34–50', title: 'קוראים CSS בעיניים', teacher: 'לא כותבים CSS חופשי. רק מזהים מילים: background, padding, border-radius, button.', students: 'מסמנים איפה ב־CSS מופיעים צבע, ריווח וצורת כפתור.' },
        { minutes: '50–66', title: 'תרגול עצמאי בבלוקים', teacher: 'נותנים לתלמידים לבחור בלוקי עיצוב ולהשלים כרטיס אישי.', students: 'מבצעים תרגולים 1–5 בעזרת בלוקים ושינויים קטנים בלבד.' },
        { minutes: '66–78', title: 'Hover כהפתעה', teacher: 'מדגימים אפקט מעבר עכבר כבלוק מוכן, בלי להעמיס סינטקס.', students: 'מפעילים/משנים hover ובודקים מה קורה לכפתור.' },
        { minutes: '78–90', title: 'גלריית עיצוב', teacher: 'מבקשים מכל תלמיד להסביר החלטת עיצוב אחת והקוד שהיא שינתה.', students: 'מציגים כרטיס ואומרים: “הבלוק הזה שינה את ___ ב־CSS”.' }
      ],
      exercises: [
        { id: 1, minutes: '18–24', title: 'תרגול 1 — בלוק דמות', prompt: 'לחצו על בלוק “בחר דמות” ובדקו שהאימוג׳י בכרטיס השתנה.', hint: 'הבלוק משנה HTML קטן בתוך class="avatar".', check: { htmlIncludes: ['🎮'] } },
        { id: 2, minutes: '24–31', title: 'תרגול 2 — בלוק פלטת צבעים', prompt: 'הפעילו בלוק פלטת צבעים ואז מצאו את linear-gradient ב־CSS.', hint: 'לא כותבים גרדיאנט לבד — רק רואים איפה הוא נוצר.', check: { cssIncludes: ['#fdf2f8', '#dcfce7'] } },
        { id: 3, minutes: '31–39', title: 'תרגול 3 — בלוק כפתור', prompt: 'הפעילו בלוק שמשנה את צבע הכפתור.', hint: 'הבלוק משנה background בתוך button.', check: { cssIncludes: ['background: #7c3aed'] } },
        { id: 4, minutes: '39–48', title: 'תרגול 4 — קוראים CSS', prompt: 'מצאו בקוד CSS שלושה דברים: background, padding, border-radius.', hint: 'אלה מילים של עיצוב: צבע, ריווח ועיגול.', check: { cssIncludes: ['background', 'padding', 'border-radius'] } },
        { id: 5, minutes: '48–57', title: 'תרגול 5 — שינוי טקסט בטוח', prompt: 'שנו רק פריט אחד ברשימת הפרטים שלכם.', hint: 'שנו מילים בתוך <li>, לא את הסימנים.', check: { htmlIncludes: ['<li>'] } },
        { id: 6, minutes: '57–66', title: 'תרגול 6 — בלוק Hover', prompt: 'הפעילו בלוק שמוסיף אפקט לכפתור במעבר עכבר.', hint: 'חפשו button:hover ב־CSS.', check: { cssIncludes: ['button:hover', 'transform: scale'] } },
        { id: 7, minutes: '66–76', title: 'תרגול 7 — דיבאג CSS עדין', prompt: 'אם עיצוב נשבר, בדקו נקודה לפני class וסוגריים מסולסלים.', hint: 'class ב־CSS מתחיל בנקודה, למשל .profile-card.', check: { cssIncludes: ['.profile-card'] } },
        { id: 8, minutes: '76–84', title: 'תרגול 8 — גלריית עיצוב', prompt: 'הציגו לחבר/ה איזה בלוק עיצוב הכי שינה את הכרטיס שלכם.', hint: 'הסבירו: הבלוק שינה צבע / צורה / תנועה.', check: { htmlIncludes: ['class="avatar"'], cssIncludes: ['button', 'background'] } }
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
      title: 'כפתורים שמפעילים קסמים — בלוקי פעולה',
      concept: 'בלוקי פעולה → JavaScript: לחיצה · פונקציה · שינוי במסך',
      durationMinutes: 90,
      story: 'אחרי שהכרנו בלוקי מבנה ועיצוב, עוברים לבלוקי פעולה: לוחצים על כפתור, והעמוד משנה אימוג׳י, טקסט או צבע.' ,
      mission: 'לבנות עמוד מצבים בעזרת בלוקי פעולה, ואז לזהות את הקשר בין onclick לבין function.' ,
      outcome: 'עמוד אינטראקטיבי שנבנה מבלוקי פעולה, עם הצצה ל־onclick, function ו־textContent',
      starter: {
        html: '<main class="app">\n  <h1>מעבדת הכפתורים שלי</h1>\n  <div id="emoji" class="emoji">🙂</div>\n  <p id="status">בחרו פעולה והעמוד ישתנה.</p>\n  <button onclick="makeHappy()">שמח</button>\n  <button onclick="makeRobot()">רובוט</button>\n  <button onclick="changeColor()">צבע חדש</button>\n</main>',
        css: 'body {\n  font-family: Arial, sans-serif;\n  direction: rtl;\n  text-align: center;\n  background: #f8fafc;\n}\n\n.app {\n  background: white;\n  width: 380px;\n  margin: 45px auto;\n  padding: 28px;\n  border-radius: 28px;\n  box-shadow: 0 16px 35px #cbd5e1;\n}\n\n.emoji {\n  font-size: 72px;\n  margin: 18px;\n}\n\nbutton {\n  margin: 6px;\n  padding: 12px 18px;\n  border: 0;\n  border-radius: 999px;\n  background: #2563eb;\n  color: white;\n  font-weight: bold;\n}\n\n.magic {\n  background: #fff7ed;\n  border: 4px solid #fb923c;\n}',
        js: 'function makeHappy() {\n  document.getElementById("emoji").textContent = "😄";\n  document.getElementById("status").textContent = "העמוד שמח!";\n}\n\nfunction makeRobot() {\n  document.getElementById("emoji").textContent = "🤖";\n  document.getElementById("status").textContent = "מצב רובוט הופעל.";\n}\n\nfunction changeColor() {\n  document.querySelector(".app").classList.toggle("magic");\n}'
      },
      lessonFlow: [
        { minutes: '0–8', title: 'פתיחה: בלוק שמפעיל פעולה', teacher: 'מזכירים: עד עכשיו בלוקים בנו ועיצבו. היום בלוק יגרום לעמוד להגיב ללחיצה.', students: 'מזהים פעולה של משתמש: לחיצה על כפתור.' },
        { minutes: '8–18', title: 'הדגמת בלוק מצב', teacher: 'לוחצים על בלוק “מצב שמח” ומראים שהוא משנה טקסט בתוך פונקציה.', students: 'לוחצים, מריצים, ורואים שהכפתור משנה הודעה במסך.' },
        { minutes: '18–34', title: 'בנייה מודרכת בבלוקי פעולה', teacher: 'מפעילים בלוקים: מצב שמח, מצב רובוט, מצב קסם.', students: 'בודקים כל כפתור ומסבירים מה השתנה: אימוג׳י, טקסט או צבע.' },
        { minutes: '34–50', title: 'מציצים לקוד פעולה', teacher: 'לא כותבים פונקציות חדשות. רק מזהים onclick ב־HTML ו־function ב־JS עם אותו שם.', students: 'מחברים בין שם הכפתור לשם הפונקציה.' },
        { minutes: '50–66', title: 'תרגול עצמאי עם בלוקים', teacher: 'נותנים לתלמידים להפעיל בלוקי פעולה ולשנות טקסטים בטוחים.', students: 'מבצעים תרגולים 1–5 בלי להמציא סינטקס חדש.' },
        { minutes: '66–78', title: 'Toggle כמתג', teacher: 'מדגימים את בלוק “הדלק/כבה עיצוב” כמתג שמוסיף ומסיר class.', students: 'לוחצים כמה פעמים ומבינים שיש מצב דולק/כבוי.' },
        { minutes: '78–90', title: 'הצגת שרשרת פעולה', teacher: 'מבקשים מכל תלמיד להסביר שרשרת אחת: בלוק → כפתור → פונקציה → שינוי במסך.', students: 'מציגים מצב אחד שבנו ומסבירים אותו במילים.' }
      ],
      exercises: [
        { id: 1, minutes: '18–24', title: 'תרגול 1 — בלוק מצב שמח', prompt: 'הפעילו את בלוק “מצב שמח”, הריצו, ולחצו על הכפתור.', hint: 'הבלוק משנה טקסט בתוך function makeHappy.', check: { jsIncludes: ['מצב שמח הופעל'] } },
        { id: 2, minutes: '24–31', title: 'תרגול 2 — בלוק מצב רובוט', prompt: 'הפעילו את בלוק “מצב רובוט” ובדקו שההודעה השתנתה.', hint: 'חפשו את function makeRobot.', check: { jsIncludes: ['הרובוט התחיל לעבוד'] } },
        { id: 3, minutes: '31–39', title: 'תרגול 3 — בלוק מצב קסם', prompt: 'הפעילו בלוק שמשנה את העיצוב של מצב הקסם.', hint: 'הבלוק משנה CSS בתוך .magic.', check: { cssIncludes: ['border: 4px solid #7c3aed'] } },
        { id: 4, minutes: '39–48', title: 'תרגול 4 — מצאו את onclick', prompt: 'עברו ל־HTML ומצאו איפה הכפתור קורא לפונקציה.', hint: 'חפשו onclick="makeHappy()" או onclick="makeRobot()".', check: { htmlIncludes: ['onclick="makeHappy()"', 'onclick="makeRobot()"'] } },
        { id: 5, minutes: '48–57', title: 'תרגול 5 — מצאו את function', prompt: 'עברו ל־JavaScript ומצאו function עם אותו שם כמו הכפתור.', hint: 'שם ב־onclick ושם ב־function חייבים להיות זהים.', check: { jsIncludes: ['function makeHappy', 'function makeRobot'] } },
        { id: 6, minutes: '57–66', title: 'תרגול 6 — בלוק Toggle', prompt: 'הפעילו את בלוק הדלק/כבה עיצוב ובדקו את classList.toggle.', hint: 'זה מתג: לחיצה אחת מדליקה, לחיצה נוספת מכבה.', check: { jsIncludes: ['classList.toggle("magic")'] } },
        { id: 7, minutes: '66–76', title: 'תרגול 7 — דיבאג שם פעולה', prompt: 'אם כפתור לא עובד, בדקו שהשם ב־onclick זהה לשם ה־function.', hint: 'לא מוסיפים פונקציה חדשה בשיעור הזה — רק מתקנים שמות.', check: { htmlIncludes: ['makeRobot()'], jsIncludes: ['function makeRobot'] } },
        { id: 8, minutes: '76–84', title: 'תרגול 8 — הצגת מצב', prompt: 'בחרו כפתור אחד והסבירו: איזה בלוק שינה אותו ומה קורה בלחיצה.', hint: 'השתמשו במילים: בלוק, כפתור, פונקציה, שינוי במסך.', check: { htmlIncludes: ['button'], jsIncludes: ['function', 'textContent'] } }
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
      title: 'העמוד שמקשיב לי — בלוקי קלט',
      concept: 'בלוקי קלט → JavaScript: input · value · הודעה אישית',
      durationMinutes: 90,
      story: 'הילדים בונים מחולל אישי דרך בלוקי קלט: שדה שם, שדה תחביב, כפתור ותוצאה. אחר כך הם רואים איך JavaScript קורא value מהשדות.' ,
      mission: 'לבנות מחולל ברכה בעזרת בלוקי קלט, ואז לזהות את הקשר בין input, id ו־value.' ,
      outcome: 'מחולל ברכה שנבנה מבלוקי קלט, עם הצצה ל־input, id, value ושרשור טקסט',
      starter: {
        html: '<main class="generator">\n  <h1>מחולל הברכות שלי</h1>\n  <label>שם:\n    <input id="nameInput" placeholder="כתבו שם">\n  </label>\n  <label>תחביב:\n    <input id="hobbyInput" placeholder="כתבו תחביב">\n  </label>\n  <button onclick="makeGreeting()">צרו ברכה</button>\n  <p id="result">כאן תופיע הברכה...</p>\n</main>',
        css: 'body {\n  font-family: Arial, sans-serif;\n  direction: rtl;\n  text-align: center;\n  background: linear-gradient(135deg, #ecfeff, #fdf2f8);\n}\n\n.generator {\n  background: white;\n  width: 390px;\n  margin: 45px auto;\n  padding: 28px;\n  border-radius: 28px;\n  box-shadow: 0 16px 35px #bae6fd;\n}\n\nlabel {\n  display: block;\n  margin: 14px;\n  font-weight: bold;\n}\n\ninput {\n  display: block;\n  width: 100%;\n  margin-top: 6px;\n  padding: 12px;\n  border: 2px solid #cbd5e1;\n  border-radius: 14px;\n  text-align: center;\n}\n\nbutton {\n  background: #7c3aed;\n  color: white;\n  border: 0;\n  border-radius: 999px;\n  padding: 12px 20px;\n  font-weight: bold;\n}\n\n#result {\n  background: #f8fafc;\n  border-radius: 18px;\n  padding: 14px;\n}',
        js: 'function makeGreeting() {\n  const name = document.getElementById("nameInput").value;\n  const hobby = document.getElementById("hobbyInput").value;\n  document.getElementById("result").textContent = name + ", איזה כיף שאת/ה אוהב/ת " + hobby + "!";\n}'
      },
      lessonFlow: [
        { minutes: '0–8', title: 'פתיחה: אתר שמקשיב', teacher: 'מציגים מחולל ברכה ושואלים איך האתר יודע את השם שהקלדנו.', students: 'מזהים שדה כתיבה, כפתור ותוצאה אישית.' },
        { minutes: '8–18', title: 'בלוק קלט ראשון', teacher: 'לוחצים על בלוק “שדה שם” ומראים שהוא משנה input ב־HTML.', students: 'רואים ששדה כתיבה הוא חלק מהמבנה של העמוד.' },
        { minutes: '18–34', title: 'בנייה מודרכת בבלוקי קלט', teacher: 'מפעילים בלוקים: שדה שם, שדה תחביב, קרא קלט, צור משפט אישי.', students: 'מריצים, מקלידים שם ותחביב, ולוחצים על הכפתור.' },
        { minutes: '34–50', title: 'מציצים לקוד שקורא קלט', teacher: 'לא כותבים getElementById לבד. רק מזהים id ב־HTML ו־value ב־JS.', students: 'מחברים בין id="nameInput" לבין getElementById("nameInput").value.' },
        { minutes: '50–66', title: 'תרגול עצמאי עם בלוקים', teacher: 'נותנים לתלמידים לשנות שאלות ומשפט תוצאה דרך בלוקים ושינויים בטוחים.', students: 'מבצעים תרגולים 1–5.' },
        { minutes: '66–78', title: 'דיבאג קלט עדין', teacher: 'מדגימים id לא תואם ומחזירים לרמז: השמות חייבים להיות זהים.', students: 'בודקים התאמה בין input לבין JavaScript.' },
        { minutes: '78–90', title: 'תערוכת מחוללים', teacher: 'כל תלמיד נותן לחבר למלא את המחולל ומסביר איזה שדה נקרא בקוד.', students: 'מציגים מחולל ואומרים: “הקוד קרא את ___ מתוך השדה”.' }
      ],
      exercises: [
        { id: 1, minutes: '18–24', title: 'תרגול 1 — בלוק שדה שם', prompt: 'הפעילו בלוק “שדה שם” ובדקו שה־placeholder השתנה לשאלה ברורה.', hint: 'הבלוק משנה input ב־HTML.', check: { htmlIncludes: ['מה השם שלך?'] } },
        { id: 2, minutes: '24–31', title: 'תרגול 2 — בלוק שדה תחביב', prompt: 'הפעילו בלוק “שדה תחביב” ובדקו שהשדה השני שואל על תחביב.', hint: 'חפשו hobbyInput ו־placeholder.', check: { htmlIncludes: ['מה התחביב שלך?'] } },
        { id: 3, minutes: '31–39', title: 'תרגול 3 — בלוק קרא קלט', prompt: 'מצאו בקוד JavaScript את השורה שקוראת את השם מהשדה.', hint: 'חפשו value. לא צריך לכתוב את זה לבד.', check: { jsIncludes: ['getElementById("nameInput").value'] } },
        { id: 4, minutes: '39–48', title: 'תרגול 4 — בלוק משפט אישי', prompt: 'הפעילו בלוק שמשנה את המשפט שהמחולל יוצר.', hint: 'הבלוק משנה חלק מה־textContent.', check: { jsIncludes: ['נהדר! שמעתי שאת/ה אוהב/ת'] } },
        { id: 5, minutes: '48–57', title: 'תרגול 5 — בדיקה עם שם אמיתי', prompt: 'הריצו, כתבו שם ותחביב, ובדקו שהתוצאה משתמשת במה שהקלדתם.', hint: 'הקוד קורא value מתוך שני שדות.', check: { jsIncludes: ['const name', 'const hobby', 'value'] } },
        { id: 6, minutes: '57–66', title: 'תרגול 6 — שינוי טקסט בטוח', prompt: 'שנו רק את הכותרת או את טקסט הכפתור, בלי לשנות id.', hint: 'אל תשנו nameInput או hobbyInput בתרגול הזה.', check: { htmlIncludes: ['id="nameInput"', 'id="hobbyInput"'] } },
        { id: 7, minutes: '66–76', title: 'תרגול 7 — דיבאג id', prompt: 'אם המחולל לא עובד, בדקו שה־id ב־HTML זהה למה שה־JS מחפש.', hint: 'nameInput חייב להיות כתוב אותו דבר בשני המקומות.', check: { htmlIncludes: ['id="nameInput"'], jsIncludes: ['getElementById("nameInput")'] } },
        { id: 8, minutes: '76–84', title: 'תרגול 8 — הצגת מחולל', prompt: 'תנו לחבר/ה למלא את המחולל והסבירו איזה שדה הקוד קרא.', hint: 'השתמשו במילים: input, id, value.', check: { htmlIncludes: ['input', 'button'], jsIncludes: ['value', 'textContent'] } }
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


  const bridgeBlocksByLesson = {
    1: [
      { label: '🧱 צור כרטיס אישי', target: 'html', find: '<h1>שלום, אני נועה</h1>', replace: '<h1>שלום, אני מפתח/ת צעיר/ה</h1>', hint: 'בלוק מבנה: משנה את הכותרת הראשית ב־HTML.' },
      { label: '✏️ הוסף משפט אישי', target: 'html', find: '<p>אני אוהבת רובוטים, משחקים וקוד.</p>', replace: '<p>אני אוהב/ת ליצור דברים בדפדפן.</p>', hint: 'בלוק תוכן: משנה פסקה בתוך הכרטיס.' },
      { label: '🎨 שנה צבע רקע', target: 'css', find: 'background: #e0f2fe;', replace: 'background: #fef3c7;', hint: 'בלוק עיצוב: משנה CSS בלי לכתוב סינטקס לבד.' },
      { label: '🔘 צור כפתור פעולה', target: 'html', find: '<button onclick="sayHello()">לחצו עליי</button>', replace: '<button onclick="sayHello()">גלו הודעה</button>', hint: 'בלוק אינטראקציה: הכפתור עדיין קורא לאותה פונקציה.' },
      { label: '✨ הצג הודעה בלחיצה', target: 'js', find: 'איזה כיף! הכפתור עובד 🎉', replace: 'ברוכים הבאים לאתר הראשון שלי ✨', hint: 'בלוק JavaScript: משנה רק את ההודעה שמופיעה.' }
    ],
    2: [
      { label: '🚀 בחר דמות', target: 'html', find: '<div class="avatar">🚀</div>', replace: '<div class="avatar">🎮</div>', hint: 'בלוק תוכן ויזואלי: מחליף את הדמות בכרטיס.' },
      { label: '🌈 פלטת צבעים', target: 'css', find: 'background: linear-gradient(135deg, #dbeafe, #fff7ed);', replace: 'background: linear-gradient(135deg, #fdf2f8, #dcfce7);', hint: 'בלוק עיצוב: מחליף צבעי רקע מוכנים.' },
      { label: '🪄 כפתור משתנה', target: 'css', find: 'background: #2563eb;', replace: 'background: #7c3aed;', hint: 'בלוק עיצוב כפתור: משנה צבע בלי לגעת בשאר הקוד.' },
      { label: '👆 אפקט מעבר', target: 'css', find: 'background: #2563eb;\n}', replace: 'background: #2563eb;\n}\n\nbutton:hover {\n  transform: scale(1.06);\n}', hint: 'בלוק hover: מוסיף תגובה כשעוברים על הכפתור.' }
    ],
    3: [
      { label: '😄 מצב שמח', target: 'js', find: 'העמוד שמח!', replace: 'מצב שמח הופעל 😄', hint: 'בלוק תגובה: משנה הודעה של פונקציה.' },
      { label: '🤖 מצב רובוט', target: 'js', find: 'מצב רובוט הופעל.', replace: 'הרובוט התחיל לעבוד 🤖', hint: 'בלוק פונקציה: פעולה שקורית בלחיצה.' },
      { label: '🎨 מצב קסם', target: 'css', find: 'border: 4px solid #fb923c;', replace: 'border: 4px solid #7c3aed;', hint: 'בלוק עיצוב מצב: משנה את class magic.' },
      { label: '🔁 הדלק/כבה עיצוב', target: 'js', find: 'classList.toggle("magic")', replace: 'classList.toggle("magic")', hint: 'בלוק toggle: אותו קוד, אבל עכשיו מבינים שהוא מדליק ומכבה class.' }
    ],
    4: [
      { label: '📝 שדה שם', target: 'html', find: 'placeholder="כתבו שם"', replace: 'placeholder="מה השם שלך?"', hint: 'בלוק קלט: משנה הוראה בתוך input.' },
      { label: '🎯 שדה תחביב', target: 'html', find: 'placeholder="כתבו תחביב"', replace: 'placeholder="מה התחביב שלך?"', hint: 'בלוק קלט שני: עוד מידע מהמשתמש.' },
      { label: '📥 קרא קלט', target: 'js', find: 'const name = document.getElementById("nameInput").value;', replace: 'const name = document.getElementById("nameInput").value;', hint: 'בלוק JavaScript: קורא את מה שהמשתמש כתב.' },
      { label: '💬 צור משפט אישי', target: 'js', find: 'איזה כיף שאת/ה אוהב/ת', replace: 'נהדר! שמעתי שאת/ה אוהב/ת', hint: 'בלוק תוצאה: מחבר את הקלט למשפט אישי.' }
    ]
  };

  lessons.forEach(lesson => {
    lesson.bridgeBlocks = bridgeBlocksByLesson[lesson.id] || [];
    if (lesson.id <= 4) lesson.mode = 'Blockly-first bridge';
  });

  window.WEBCODE_LESSONS = lessons;
  window.getWebCodeLesson = function (id) {
    const numeric = Number(id) || 1;
    return lessons.find(l => l.id === numeric) || lessons[0];
  };
})();
