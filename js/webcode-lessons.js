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
      title: 'העמוד שמקשיב לי — מחולל ברכות מצחיקות',
      concept: 'בלוקי קלט → JavaScript: input · value · הודעה אישית',
      durationMinutes: 90,
      story: 'השיעור נפתח כמו קסם אישי: מקלידים שם ותחביב מצחיק, לוחצים על כפתור, והאתר עונה משפט אישי. רק אחרי שהילדים צוחקים מהתוצאה מסבירים איך JavaScript קורא value מתוך input.' ,
      mission: 'לבנות מחולל אישי וכיפי: המשתמש כותב שם ותחביב/כוח־על, לוחץ על כפתור, והעמוד מחזיר ברכה מצחיקה שמבוססת על מה שהוקלד.' ,
      outcome: 'מחולל אישי שמרגיש כמו מיני־אפליקציה: input, id, value, שרשור טקסט ותוצאה שמתאימה למשתמש',
      starter: {
        html: '<main class="generator">\n  <div class="badge">✨ מחולל אישי</div>\n  <h1>מחולל הברכות המצחיקות שלי</h1>\n  <p class="intro">כתבו שם ותחביב, והאתר ימציא לכם ברכה אישית.</p>\n  <label>שם גיבור/ה:\n    <input id="nameInput" placeholder="כתבו שם">\n  </label>\n  <label>תחביב או כוח־על:\n    <input id="hobbyInput" placeholder="כתבו תחביב">\n  </label>\n  <button onclick="makeGreeting()">צרו ברכה מצחיקה</button>\n  <p id="result">כאן תופיע הברכה האישית...</p>\n</main>',
        css: 'body {\n  font-family: Arial, sans-serif;\n  direction: rtl;\n  text-align: center;\n  background: linear-gradient(135deg, #ecfeff, #fdf2f8 55%, #fef3c7);\n}\n\n.generator {\n  background: white;\n  width: min(430px, 92vw);\n  margin: 38px auto;\n  padding: 28px;\n  border-radius: 32px;\n  box-shadow: 0 18px 42px #bae6fd;\n}\n\n.badge {\n  display: inline-block;\n  background: #ede9fe;\n  color: #6d28d9;\n  border-radius: 999px;\n  padding: 7px 14px;\n  font-weight: bold;\n}\n\n.intro {\n  color: #475569;\n}\n\nlabel {\n  display: block;\n  margin: 14px;\n  font-weight: bold;\n}\n\ninput {\n  display: block;\n  width: 100%;\n  margin-top: 6px;\n  padding: 12px;\n  border: 2px solid #cbd5e1;\n  border-radius: 14px;\n  text-align: center;\n  font-size: 16px;\n}\n\nbutton {\n  background: #7c3aed;\n  color: white;\n  border: 0;\n  border-radius: 999px;\n  padding: 13px 22px;\n  font-weight: bold;\n  cursor: pointer;\n}\n\n#result {\n  background: #fff7ed;\n  border: 2px dashed #fb923c;\n  border-radius: 20px;\n  padding: 16px;\n  min-height: 56px;\n  font-weight: bold;\n}',
        js: 'function makeGreeting() {\n  const name = document.getElementById("nameInput").value;\n  const hobby = document.getElementById("hobbyInput").value;\n  document.getElementById("result").textContent = name + ", לפי המעבדה הסודית שלנו יש לך כוח־על ב" + hobby + " 🚀";\n}'
      },
      lessonFlow: [
        { minutes: '0–4', title: 'וואו אישי: האתר עונה לי', teacher: 'פותחים בהרצה חיה: מקלידים שם מצחיק ותחביב/כוח־על, לוחצים, ונותנים לכיתה לצחוק מהמשפט שנוצר.', students: 'רואים שהאתר השתמש במה שהוקלד ולא בתשובה קבועה.' },
        { minutes: '4–12', title: 'זוגות ממציאים קלטים', teacher: 'מבקשים מכל זוג לנסות שם ותחביב אחרים לפני שמדברים על קוד.', students: 'מקלידים, לוחצים ומשווים איזה משפט יצא הכי מצחיק.' },
        { minutes: '12–22', title: 'מה האתר קרא?', teacher: 'מצביעים על שני השדות ושואלים: מאיפה הקוד לקח את השם? מאיפה את התחביב?', students: 'מסמנים שדה שם, שדה תחביב ותוצאה.' },
        { minutes: '22–36', title: 'בלוקי קלט בטוחים', teacher: 'מפעילים בלוקים: שדה שם, שדה תחביב, קרא קלט, צור משפט אישי.', students: 'משנים את ההוראות בשדות ואת נוסח המשפט בלי לשבור id.' },
        { minutes: '36–52', title: 'מציצים לקוד שקורא קלט', teacher: 'לא כותבים getElementById לבד. רק מזהים id ב־HTML ו־value ב־JS.', students: 'מחברים בין id="nameInput" לבין getElementById("nameInput").value.' },
        { minutes: '52–68', title: 'מחוללים לפי נושא', teacher: 'נותנים נושאים: מחולל כוח־על, מחולל שם רובוט, מחולל ברכת יומולדת, מחולל משימת חלל.', students: 'בוחרים נושא ומשנים טקסטים בטוחים.' },
        { minutes: '68–80', title: 'דיבאג קלט עדין', teacher: 'מדגימים id לא תואם ומחזירים לרמז: השמות חייבים להיות זהים.', students: 'בודקים התאמה בין input לבין JavaScript.' },
        { minutes: '80–90', title: 'תערוכת מחוללים מצחיקים', teacher: 'כל תלמיד נותן לחבר למלא את המחולל ומסביר איזה שדה נקרא בקוד.', students: 'מציגים מחולל ואומרים: “הקוד קרא את ___ מתוך השדה”.' }
      ],
      exercises: [
        { id: 1, minutes: '0–6', title: 'תרגול 1 — בדיקת קסם אישי', prompt: 'הריצו, כתבו שם ותחביב מצחיק, לחצו על הכפתור ובדקו שהמשפט משתמש במה שהקלדתם.', hint: 'אם כתבתם “נועה” ו“רובוטים”, שני הדברים צריכים להופיע בתוצאה.', check: { jsIncludes: ['const name', 'const hobby', 'value'] } },
        { id: 2, minutes: '6–14', title: 'תרגול 2 — מי המציא את המשפט הכי מצחיק?', prompt: 'נסו שלושה זוגות של שם+תחביב ובחרו את התוצאה הכי מצחיקה.', hint: 'זה עדיין אותו קוד — רק ה־value שהמשתמש מקליד משתנה.', check: { htmlIncludes: ['id="nameInput"', 'id="hobbyInput"'], jsIncludes: ['textContent'] } },
        { id: 3, minutes: '14–24', title: 'תרגול 3 — בלוק שדה שם', prompt: 'הפעילו בלוק “שדה שם” ובדקו שה־placeholder השתנה לשאלה ברורה.', hint: 'הבלוק משנה input ב־HTML.', check: { htmlIncludes: ['מה השם שלך?'] } },
        { id: 4, minutes: '24–34', title: 'תרגול 4 — בלוק שדה תחביב', prompt: 'הפעילו בלוק “שדה תחביב” ובדקו שהשדה השני שואל על תחביב.', hint: 'חפשו hobbyInput ו־placeholder.', check: { htmlIncludes: ['מה התחביב שלך?'] } },
        { id: 5, minutes: '34–44', title: 'תרגול 5 — מוצאים את value', prompt: 'מצאו בקוד JavaScript את השורה שקוראת את השם מהשדה.', hint: 'חפשו value. לא צריך לכתוב את זה לבד.', check: { jsIncludes: ['getElementById("nameInput").value'] } },
        { id: 6, minutes: '44–58', title: 'תרגול 6 — משפט אישי יותר', prompt: 'הפעילו בלוק שמשנה את המשפט שהמחולל יוצר, ואז בדקו עם שם אמיתי.', hint: 'הבלוק משנה חלק מה־textContent.', check: { jsIncludes: ['נהדר! שמעתי שאת/ה אוהב/ת'] } },
        { id: 7, minutes: '58–72', title: 'תרגול 7 — שינוי טקסט בטוח', prompt: 'שנו כותרת, טקסט כפתור או משפט פתיחה — אבל אל תשנו id.', hint: 'אל תשנו nameInput או hobbyInput בתרגול הזה.', check: { htmlIncludes: ['id="nameInput"', 'id="hobbyInput"'] } },
        { id: 8, minutes: '72–84', title: 'תרגול 8 — תערוכת מחוללים', prompt: 'תנו לחבר/ה למלא את המחולל והסבירו איזה שדה הקוד קרא.', hint: 'השתמשו במילים: input, id, value.', check: { htmlIncludes: ['input', 'button'], jsIncludes: ['value', 'textContent'] } }
      ],
      aiHelper: [
        'הציעו 5 רעיונות למחוללים מצחיקים שמתאימים לכיתה ד׳.',
        'תנו 10 משפטי תוצאה שמשתמשים בשם ובתחביב בלי להעליב אף אחד.',
        'הסבירו לילד מה ההבדל בין id של input לבין value שלו.',
        'עזרו למצוא למה getElementById לא מוצא את השדה.',
        'הציעו מחולל בנושא חלל / רובוטים / חיות / ספורט / יומולדת.'
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
      title: 'חידון כן או לא — בלוקי תנאי',
      concept: 'בלוקי תנאי → JavaScript: אם / אחרת ומשוב',
      durationMinutes: 90,
      story: 'בונים חידון קטן דרך בלוקי תנאי: שאלה, תשובה נכונה, משוב הצלחה ומשוב רמז. אחר כך מציצים ל־if/else שנוצר בקוד.' ,
      mission: 'לבנות חידון אינטראקטיבי בעזרת בלוקי תנאי, ואז לזהות איך if/else בודק תשובה.' ,
      outcome: 'חידון קצר שנבנה מבלוקי תנאי, עם קלט, if/else ומשוב צבעוני',
      starter: {
        html: '<main class="quiz">\n  <h1>חידון WebCode</h1>\n  <p class="question">איזו שפה מעצבת את העמוד?</p>\n  <input id="answerInput" placeholder="כתבו תשובה">\n  <button onclick="checkAnswer()">בדקו תשובה</button>\n  <p id="feedback">כאן יופיע משוב...</p>\n</main>',
        css: 'body {\n  font-family: Arial, sans-serif;\n  direction: rtl;\n  text-align: center;\n  background: linear-gradient(135deg, #f0fdf4, #eff6ff);\n}\n\n.quiz {\n  background: white;\n  width: 390px;\n  margin: 45px auto;\n  padding: 28px;\n  border-radius: 28px;\n  box-shadow: 0 16px 35px #bbf7d0;\n}\n\n.question {\n  font-size: 22px;\n  font-weight: bold;\n}\n\ninput {\n  width: 100%;\n  padding: 12px;\n  border: 2px solid #cbd5e1;\n  border-radius: 14px;\n  text-align: center;\n}\n\nbutton {\n  margin-top: 14px;\n  background: #16a34a;\n  color: white;\n  border: 0;\n  border-radius: 999px;\n  padding: 12px 20px;\n  font-weight: bold;\n}\n\n.correct { color: #15803d; font-weight: bold; }\n.wrong { color: #b91c1c; font-weight: bold; }',
        js: 'function checkAnswer() {\n  const answer = document.getElementById("answerInput").value;\n  const feedback = document.getElementById("feedback");\n\n  if (answer === "CSS") {\n    feedback.textContent = "נכון מאוד! CSS מעצב את העמוד 🎨";\n    feedback.className = "correct";\n  } else {\n    feedback.textContent = "כמעט! נסו לחשוב איזו שפה אחראית לצבעים.";\n    feedback.className = "wrong";\n  }\n}'
      },
      lessonFlow: [
        { minutes: '0–8', title: 'פתיחה: בלוק שמחליט', teacher: 'מציגים חידון ושואלים איך בלוק יכול להחליט אם תשובה נכונה.', students: 'מזהים שאלה, תשובה, הצלחה ורמז.' },
        { minutes: '8–18', title: 'בלוק תנאי ראשון', teacher: 'מפעילים בלוק “שאלה חדשה” ובלוק “תשובה נכונה”, ואז מציצים ל־if בקוד.', students: 'רואים שהתנאי בודק אם answer שווה לתשובה.' },
        { minutes: '18–34', title: 'בנייה מודרכת בבלוקי חידון', teacher: 'מפעילים בלוקים: שאלה, תשובה, הודעת הצלחה, רמז.', students: 'מריצים ובודקים תשובה נכונה ושגויה.' },
        { minutes: '34–50', title: 'מציצים ל־if/else', teacher: 'לא כותבים תנאי חופשי. רק מזהים if, else ושתי תוצאות אפשריות.', students: 'מסמנים מה קורה אם נכון ומה קורה אחרת.' },
        { minutes: '50–66', title: 'תרגול עצמאי עם בלוקים', teacher: 'נותנים לתלמידים לבנות חידון אישי דרך בלוקים ושינויי טקסט בטוחים.', students: 'מבצעים תרגולים 1–5.' },
        { minutes: '66–78', title: 'דיבאג תנאי עדין', teacher: 'מדגימים תשובה שלא מזוהה בגלל הבדל קטן בטקסט.', students: 'בודקים התאמה בין התשובה הנכונה לבין מה שמקלידים.' },
        { minutes: '78–90', title: 'חידון חברים', teacher: 'מחלקים זוגות לבדיקה ומשוב.', students: 'מנסים חידון של חבר ומסבירים את כלל ה־אם/אחרת.' }
      ],
      exercises: [
        { id: 1, minutes: '18–24', title: 'תרגול 1 — בלוק שאלה', prompt: 'הפעילו בלוק “שאלה חדשה” ובדקו שהשאלה בחידון השתנתה.', hint: 'הבלוק משנה את הטקסט ב־class="question".', check: { htmlIncludes: ['איזו שפה גורמת לכפתור להגיב?'] } },
        { id: 2, minutes: '24–31', title: 'תרגול 2 — בלוק תשובה נכונה', prompt: 'הפעילו בלוק “תשובה נכונה” ובדקו שהתנאי מחפש JavaScript.', hint: 'חפשו answer === "JavaScript".', check: { jsIncludes: ['answer === "JavaScript"'] } },
        { id: 3, minutes: '31–39', title: 'תרגול 3 — בלוק הצלחה', prompt: 'הפעילו בלוק הודעת הצלחה שמתאים לשאלה החדשה.', hint: 'ההודעה נמצאת בתוך ה־if.', check: { jsIncludes: ['נכון! JavaScript מפעיל תגובות'] } },
        { id: 4, minutes: '39–47', title: 'תרגול 4 — בלוק רמז', prompt: 'הפעילו בלוק רמז לתשובה שגויה.', hint: 'ההודעה נמצאת בתוך else.', check: { jsIncludes: ['רמז: זו השפה של הפעולות'] } },
        { id: 5, minutes: '47–56', title: 'תרגול 5 — בודקים אם/אחרת', prompt: 'הריצו, כתבו JavaScript ואז תשובה שגויה, וראו שתי תגובות שונות.', hint: 'if הוא נכון, else הוא אחרת.', check: { jsIncludes: ['if', 'else'] } },
        { id: 6, minutes: '56–65', title: 'תרגול 6 — צבעי משוב', prompt: 'שנו צבעי correct/wrong רק אם אתם מרגישים בטוחים.', hint: 'זה שינוי CSS קטן, לא חובה לשנות מבנה.', check: { cssIncludes: ['.correct', '.wrong'] } },
        { id: 7, minutes: '65–75', title: 'תרגול 7 — דיבאג תשובה', prompt: 'אם התשובה לא מזוהה, בדקו שהטקסט בתנאי זהה למה שמקלידים.', hint: 'בשלב הזה JavaScript ≠ javascript.', check: { htmlIncludes: ['id="answerInput"'], jsIncludes: ['getElementById("answerInput")'] } },
        { id: 8, minutes: '75–84', title: 'תרגול 8 — חידון חברים', prompt: 'תנו לחבר לענות והסבירו איפה ה־if ואיפה ה־else.', hint: 'השתמשו במילים: אם נכון / אחרת / משוב.', check: { htmlIncludes: ['input', 'button'], jsIncludes: ['if', 'else'] } }
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
      title: 'ניקוד ומשתנים — בלוקי זיכרון',
      concept: 'בלוקי ניקוד → JavaScript: משתנה · score · עדכון מסך',
      durationMinutes: 90,
      story: 'אחרי חידון התנאים, מוסיפים זיכרון למשחק דרך בלוקי ניקוד: התחל ניקוד, הוסף נקודה, הצג ניקוד ואפס משחק. אחר כך מציצים ל־let score.' ,
      mission: 'לבנות חידון ניקוד בעזרת בלוקי זיכרון, ואז להבין ש־score הוא מספר שהמשחק שומר.' ,
      outcome: 'משחק חידון עם ניקוד שנבנה מבלוקי זיכרון, עם הצצה ל־let score ועדכון span במסך',
      starter: {
        html: '<main class="score-game">\n  <h1>משחק הניקוד שלי</h1>\n  <p>ניקוד: <span id="scoreText">0</span></p>\n  <p class="question">מה מוסיף עיצוב לעמוד?</p>\n  <input id="answerInput" placeholder="כתבו תשובה">\n  <button onclick="checkAnswer()">בדקו</button>\n  <button onclick="resetScore()">איפוס ניקוד</button>\n  <p id="feedback">ענו כדי לקבל נקודות.</p>\n</main>',
        css: 'body {\n  font-family: Arial, sans-serif;\n  direction: rtl;\n  text-align: center;\n  background: linear-gradient(135deg, #fef3c7, #dbeafe);\n}\n\n.score-game {\n  background: white;\n  width: 390px;\n  margin: 45px auto;\n  padding: 28px;\n  border-radius: 28px;\n  box-shadow: 0 16px 35px #fde68a;\n}\n\n#scoreText {\n  display: inline-block;\n  background: #facc15;\n  border-radius: 999px;\n  padding: 6px 14px;\n  font-weight: bold;\n}\n\ninput {\n  width: 100%;\n  padding: 12px;\n  border: 2px solid #cbd5e1;\n  border-radius: 14px;\n  text-align: center;\n}\n\nbutton {\n  margin: 8px 4px;\n  background: #2563eb;\n  color: white;\n  border: 0;\n  border-radius: 999px;\n  padding: 12px 18px;\n  font-weight: bold;\n}\n\n.success { color: #15803d; font-weight: bold; }\n.try-again { color: #b45309; font-weight: bold; }',
        js: 'let score = 0;\n\nfunction checkAnswer() {\n  const answer = document.getElementById("answerInput").value;\n  const feedback = document.getElementById("feedback");\n\n  if (answer === "CSS") {\n    score = score + 1;\n    document.getElementById("scoreText").textContent = score;\n    feedback.textContent = "נכון! קיבלת נקודה ⭐";\n    feedback.className = "success";\n  } else {\n    feedback.textContent = "כמעט. נסו שוב בלי לאבד נקודות.";\n    feedback.className = "try-again";\n  }\n}\n\nfunction resetScore() {\n  score = 0;\n  document.getElementById("scoreText").textContent = score;\n  document.getElementById("feedback").textContent = "הניקוד אופס.";\n}'
      },
      lessonFlow: [
        { minutes: '0–8', title: 'פתיחה: משחק שזוכר נקודות', teacher: 'שואלים איך משחק זוכר ניקוד גם אחרי כמה תשובות.', students: 'מעלים רעיון של קופה/מד נקודות שנשמר.' },
        { minutes: '8–18', title: 'בלוק ניקוד ראשון', teacher: 'מפעילים בלוק “התחל ניקוד” ומראים את let score = 0 כקופסת נקודות.', students: 'רואים שהמשחק מתחיל מ־0.' },
        { minutes: '18–34', title: 'בנייה מודרכת בבלוקי ניקוד', teacher: 'מפעילים בלוקים: הוסף נקודה, הצג ניקוד, הודעת הצלחה, איפוס.', students: 'מריצים, עונים נכון, ורואים שהניקוד עולה.' },
        { minutes: '34–50', title: 'מציצים למשתנה', teacher: 'לא כותבים משתנים חופשיים. רק מזהים score, score + 1, ו־scoreText.', students: 'מחברים בין המספר בקוד למספר שמופיע במסך.' },
        { minutes: '50–66', title: 'תרגול עצמאי עם בלוקים', teacher: 'נותנים לתלמידים לשנות חוק ניקוד דרך בלוק מוכן ושינוי טקסט בטוח.', students: 'מבצעים תרגולים 1–5.' },
        { minutes: '66–78', title: 'דיבאג ניקוד עדין', teacher: 'מדגימים id לא תואם ל־scoreText ומסבירים למה המסך לא מתעדכן.', students: 'בודקים התאמה בין span לבין JavaScript.' },
        { minutes: '78–90', title: 'בדיקת משחק', teacher: 'זוגות משחקים ומסבירים איפה המשחק “זוכר” את הניקוד.', students: 'מציגים משחק ואומרים: “score שומר את ___”.' }
      ],
      exercises: [
        { id: 1, minutes: '18–24', title: 'תרגול 1 — בלוק התחלת ניקוד', prompt: 'מצאו את בלוק “התחל ניקוד” ובדקו שהמשחק מתחיל מ־0.', hint: 'הבלוק מתאים ל־let score = 0.', check: { jsIncludes: ['let score = 0'] } },
        { id: 2, minutes: '24–31', title: 'תרגול 2 — בלוק הוסף נקודה', prompt: 'הפעילו בלוק שמוסיף נקודה ובדקו שהקוד מעלה את score.', hint: 'חפשו score = score + 1.', check: { jsIncludes: ['score = score + 1'] } },
        { id: 3, minutes: '31–39', title: 'תרגול 3 — בלוק הצג ניקוד', prompt: 'מצאו איפה הקוד מציג את הניקוד בתוך scoreText.', hint: 'המסך מתעדכן דרך span עם id.', check: { htmlIncludes: ['id="scoreText"'], jsIncludes: ['getElementById("scoreText")'] } },
        { id: 4, minutes: '39–47', title: 'תרגול 4 — בלוק שתי נקודות', prompt: 'הפעילו בלוק שמחליף את החוק כך שתשובה נכונה מוסיפה 2 נקודות.', hint: 'הבלוק משנה רק את המספר שמתווסף.', check: { jsIncludes: ['score = score + 2'] } },
        { id: 5, minutes: '47–56', title: 'תרגול 5 — בלוק הודעת ניקוד', prompt: 'הפעילו בלוק שמשנה את הודעת ההצלחה לניקוד כפול.', hint: 'ההודעה נמצאת בתוך ה־if.', check: { jsIncludes: ['קיבלת 2 נקודות'] } },
        { id: 6, minutes: '56–65', title: 'תרגול 6 — בלוק איפוס', prompt: 'בדקו שכפתור האיפוס מחזיר את score ל־0.', hint: 'חפשו function resetScore ו־score = 0.', check: { jsIncludes: ['function resetScore', 'score = 0'] } },
        { id: 7, minutes: '65–75', title: 'תרגול 7 — דיבאג ניקוד', prompt: 'אם המספר לא מתעדכן, בדקו שה־id scoreText זהה ב־HTML וב־JS.', hint: 'scoreText חייב להיות כתוב אותו דבר בדיוק.', check: { htmlIncludes: ['id="scoreText"'], jsIncludes: ['getElementById("scoreText")'] } },
        { id: 8, minutes: '75–84', title: 'תרגול 8 — הצגת משחק ניקוד', prompt: 'תנו לחבר לענות והסבירו איפה המשחק שומר את הניקוד.', hint: 'השתמשו במילים: score, משתנה, הצג ניקוד.', check: { htmlIncludes: ['scoreText', 'button'], jsIncludes: ['score', 'if', 'else'] } }
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
      title: 'משחק קליקים ראשון — בלוקי משחק',
      concept: 'בלוקי משחק → קליק · ניקוד · יעד ניצחון',
      durationMinutes: 90,
      story: 'מחברים את כל מה שלמדנו דרך בלוקי משחק: כפתור קליק, ניקוד, יעד ניצחון, איפוס ומשוב. רק אחר כך מציצים לקוד שמפעיל את המשחק.' ,
      mission: 'לבנות משחק קליקים בעזרת בלוקי משחק, ואז לזהות את הקשר בין קליק, score ו־target.' ,
      outcome: 'משחק קליקים שנבנה מבלוקי משחק, עם הצצה לקוד של ניקוד, יעד וניצחון',
      starter: {
        html: '<main class="click-game">\n  <h1>משחק הקליקים שלי</h1>\n  <p>ניקוד: <span id="scoreText">0</span></p>\n  <button id="clickButton" onclick="addPoint()">🎯 לחצו לנקודה</button>\n  <button onclick="resetGame()">איפוס</button>\n  <p id="message">המטרה: להגיע ל־10 נקודות.</p>\n</main>',
        css: 'body {\n  font-family: Arial, sans-serif;\n  direction: rtl;\n  text-align: center;\n  background: linear-gradient(135deg, #fdf2f8, #e0f2fe);\n}\n\n.click-game {\n  background: white;\n  width: 390px;\n  margin: 45px auto;\n  padding: 30px;\n  border-radius: 30px;\n  box-shadow: 0 16px 35px #fbcfe8;\n}\n\n#scoreText {\n  font-size: 34px;\n  font-weight: bold;\n  color: #7c3aed;\n}\n\nbutton {\n  margin: 8px;\n  padding: 14px 22px;\n  border: 0;\n  border-radius: 999px;\n  background: #ec4899;\n  color: white;\n  font-weight: bold;\n  cursor: pointer;\n}\n\nbutton:hover {\n  transform: scale(1.05);\n}\n\n.win {\n  background: #dcfce7;\n  border: 3px solid #22c55e;\n}',
        js: 'let score = 0;\nconst target = 10;\n\nfunction addPoint() {\n  score = score + 1;\n  document.getElementById("scoreText").textContent = score;\n\n  if (score >= target) {\n    document.getElementById("message").textContent = "ניצחת! הגעת ליעד 🎉";\n    document.querySelector(".click-game").classList.add("win");\n  } else {\n    document.getElementById("message").textContent = "עוד קצת! צריך להגיע ל־" + target;\n  }\n}\n\nfunction resetGame() {\n  score = 0;\n  document.getElementById("scoreText").textContent = score;\n  document.getElementById("message").textContent = "המטרה: להגיע ל־10 נקודות.";\n  document.querySelector(".click-game").classList.remove("win");\n}'
      },
      lessonFlow: [
        { minutes: '0–8', title: 'פתיחה: בלוקים שהופכים לעולם משחק', teacher: 'מציגים כפתור שמעלה ניקוד ושואלים אילו בלוקים צריך כדי להפוך אותו למשחק.', students: 'מציעים בלוקים: קליק, ניקוד, יעד, ניצחון, איפוס.' },
        { minutes: '8–18', title: 'בלוק משחק ראשון', teacher: 'מפעילים בלוק “כפתור קליק” ומראים שהכפתור קורא לפעולה addPoint.', students: 'לוחצים על הכפתור ורואים שהניקוד עולה.' },
        { minutes: '18–34', title: 'בנייה מודרכת בבלוקי משחק', teacher: 'מפעילים בלוקים: יעד ניצחון, נקודות כפולות, הודעת ניצחון, איפוס.', students: 'מריצים אחרי כל בלוק ובודקים מה השתנה במשחק.' },
        { minutes: '34–50', title: 'מציצים לקוד המשחק', teacher: 'לא כותבים משחק חופשי. רק מזהים score, target, addPoint ו־resetGame.', students: 'מחברים בין בלוק המשחק לבין הקוד שהוא שינה.' },
        { minutes: '50–66', title: 'תרגול עצמאי עם בלוקים', teacher: 'נותנים לתלמידים לשנות קושי ומשוב דרך בלוקים מוכנים.', students: 'מבצעים תרגולים 1–5.' },
        { minutes: '66–78', title: 'איזון ודיבאג', teacher: 'מדגימים יעד קל מדי/קשה מדי ו־id שלא מציג ניקוד.', students: 'מתקנים/מאזנים בלי לכתוב פונקציות חדשות.' },
        { minutes: '78–90', title: 'בדיקת שחקנים', teacher: 'זוגות משחקים, נותנים משוב על קושי, ומציגים בלוק אחד ששינה את המשחק.', students: 'מסבירים: “הבלוק הזה שינה את ___ במשחק”.' }
      ],
      exercises: [
        { id: 1, minutes: '18–24', title: 'תרגול 1 — בלוק כפתור קליק', prompt: 'מצאו את כפתור הקליק, הריצו, ולחצו כדי לראות ניקוד עולה.', hint: 'הכפתור מפעיל addPoint.', check: { htmlIncludes: ['id="clickButton"'], jsIncludes: ['function addPoint'] } },
        { id: 2, minutes: '24–31', title: 'תרגול 2 — בלוק יעד ניצחון', prompt: 'הפעילו בלוק שמגדיר יעד ניצחון ל־10 נקודות.', hint: 'היעד נשמר בשם target.', check: { jsIncludes: ['const target = 10'] } },
        { id: 3, minutes: '31–39', title: 'תרגול 3 — בלוק יעד קל', prompt: 'הפעילו בלוק שמחליף את היעד ל־5 כדי לבדוק משחק קצר יותר.', hint: 'שינוי target משנה את הקושי.', check: { jsIncludes: ['const target = 5'] } },
        { id: 4, minutes: '39–47', title: 'תרגול 4 — בלוק נקודות כפולות', prompt: 'הפעילו בלוק שכל קליק יוסיף 2 נקודות.', hint: 'הבלוק משנה את score = score + ...', check: { jsIncludes: ['score = score + 2'] } },
        { id: 5, minutes: '47–56', title: 'תרגול 5 — בלוק הודעת ניצחון', prompt: 'הפעילו בלוק שמשנה את הודעת הניצחון.', hint: 'ההודעה נמצאת בתוך התנאי score >= target.', check: { jsIncludes: ['אליפות! ניצחת במשחק הקליקים'] } },
        { id: 6, minutes: '56–65', title: 'תרגול 6 — בלוק צבע ניצחון', prompt: 'הפעילו בלוק שמשנה את צבע מצב הניצחון.', hint: 'הבלוק משנה את .win ב־CSS.', check: { cssIncludes: ['#bbf7d0'] } },
        { id: 7, minutes: '65–75', title: 'תרגול 7 — דיבאג ניקוד', prompt: 'אם הניקוד לא מוצג, בדקו התאמה של scoreText.', hint: 'scoreText חייב להיות זהה ב־HTML וב־JS.', check: { htmlIncludes: ['id="scoreText"'], jsIncludes: ['getElementById("scoreText")'] } },
        { id: 8, minutes: '75–84', title: 'תרגול 8 — בדיקת קושי', prompt: 'תנו לחבר לשחק ובדקו אם היעד קל מדי או קשה מדי.', hint: 'אפשר לבחור יעד 5 או 10 לפי הכיתה.', check: { htmlIncludes: ['button'], jsIncludes: ['target', 'resetGame'] } }
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
    },
    {
      id: 8,
      title: 'משחק קליקים עם טיימר — בלוקי זמן',
      concept: 'בלוקי זמן → JavaScript: timeLeft · setInterval · סיום משחק',
      durationMinutes: 90,
      story: 'מוסיפים למשחק הקליקים שעון שסופר לאחור. הילדים בונים קודם עם בלוקי זמן: התחל טיימר, הורד שנייה, הצג זמן, סיים משחק.',
      mission: 'לבנות משחק קליקים עם טיימר קצר, ניקוד וסיום כשהזמן נגמר.',
      outcome: 'משחק קליקים עם זמן מוגבל שנבנה מבלוקי זמן, עם הצצה ל־timeLeft ו־setInterval',
      starter: {
        html: '<main class="timer-game">\n  <h1>אתגר הקליקים בזמן</h1>\n  <p>ניקוד: <span id="scoreText">0</span></p>\n  <p>זמן: <span id="timeText">15</span></p>\n  <button id="startButton" onclick="startGame()">התחילו משחק</button>\n  <button id="clickButton" onclick="addPoint()">🎯 קליק לנקודה</button>\n  <p id="message">לחצו התחלה ואז אספו נקודות!</p>\n</main>',
        css: 'body {\n  font-family: Arial, sans-serif;\n  direction: rtl;\n  text-align: center;\n  background: linear-gradient(135deg, #ecfeff, #fef9c3);\n}\n\n.timer-game {\n  background: white;\n  width: 400px;\n  margin: 45px auto;\n  padding: 30px;\n  border-radius: 30px;\n  box-shadow: 0 16px 35px #bae6fd;\n}\n\n#scoreText, #timeText {\n  display: inline-block;\n  min-width: 45px;\n  background: #dbeafe;\n  border-radius: 999px;\n  padding: 6px 14px;\n  font-weight: bold;\n}\n\nbutton {\n  margin: 8px;\n  padding: 14px 20px;\n  border: 0;\n  border-radius: 999px;\n  background: #0891b2;\n  color: white;\n  font-weight: bold;\n  cursor: pointer;\n}\n\n.finished {\n  background: #fee2e2;\n  border: 3px solid #ef4444;\n}',
        js: 'let score = 0;\nlet timeLeft = 15;\nlet timerId = null;\n\nfunction startGame() {\n  score = 0;\n  timeLeft = 15;\n  document.getElementById("scoreText").textContent = score;\n  document.getElementById("timeText").textContent = timeLeft;\n  document.getElementById("message").textContent = "המשחק התחיל!";\n\n  timerId = setInterval(tick, 1000);\n}\n\nfunction tick() {\n  timeLeft = timeLeft - 1;\n  document.getElementById("timeText").textContent = timeLeft;\n\n  if (timeLeft <= 0) {\n    clearInterval(timerId);\n    document.getElementById("message").textContent = "הזמן נגמר! הניקוד שלך: " + score;\n    document.querySelector(".timer-game").classList.add("finished");\n  }\n}\n\nfunction addPoint() {\n  if (timeLeft > 0) {\n    score = score + 1;\n    document.getElementById("scoreText").textContent = score;\n  }\n}'
      },
      lessonFlow: [
        { minutes: '0–8', title: 'פתיחה: משחק נגד השעון', teacher: 'מציגים משחק קליקים עם זמן ושואלים מה משתנה כשיש שעון.', students: 'מזהים לחץ זמן, התחלה, ספירה לאחור וסיום.' },
        { minutes: '8–18', title: 'בלוק זמן ראשון', teacher: 'מפעילים בלוק “התחל טיימר” ומראים timeLeft כמד זמן.', students: 'רואים שהזמן מתחיל מ־15.' },
        { minutes: '18–34', title: 'בנייה מודרכת בבלוקי זמן', teacher: 'מפעילים בלוקים: הצג זמן, הורד שנייה, סיום כשהזמן נגמר.', students: 'מריצים, מתחילים משחק, ורואים את הזמן יורד.' },
        { minutes: '34–50', title: 'מציצים לקוד הזמן', teacher: 'לא כותבים setInterval חופשי. רק מזהים timeLeft, tick ו־clearInterval.', students: 'מחברים בין בלוק הזמן לבין הספירה במסך.' },
        { minutes: '50–66', title: 'תרגול עצמאי עם בלוקים', teacher: 'נותנים לתלמידים לשנות זמן התחלה ומשוב סיום דרך בלוקים.', students: 'מבצעים תרגולים 1–5.' },
        { minutes: '66–78', title: 'דיבאג זמן', teacher: 'מדגימים מה קורה אם timeText לא תואם או אם הטיימר מהיר מדי.', students: 'בודקים התאמה בין timeText לבין JavaScript.' },
        { minutes: '78–90', title: 'בדיקת שחקנים', teacher: 'זוגות משחקים ובודקים אם 15 שניות זה קל/קשה.', students: 'מציעים איזון זמן: 10, 15 או 20 שניות.' }
      ],
      exercises: [
        { id: 1, minutes: '18–24', title: 'תרגול 1 — בלוק התחלת זמן', prompt: 'מצאו את בלוק הזמן ובדקו שהמשחק מתחיל מ־15 שניות.', hint: 'הזמן נשמר ב־timeLeft.', check: { jsIncludes: ['let timeLeft = 15'] } },
        { id: 2, minutes: '24–31', title: 'תרגול 2 — בלוק הצג זמן', prompt: 'בדקו שהזמן מופיע במסך בתוך timeText.', hint: 'timeText הוא המקום שבו הדפדפן מציג את הזמן.', check: { htmlIncludes: ['id="timeText"'], jsIncludes: ['getElementById("timeText")'] } },
        { id: 3, minutes: '31–39', title: 'תרגול 3 — בלוק ספירה לאחור', prompt: 'מצאו את הקוד שמוריד שנייה בכל פעם.', hint: 'חפשו timeLeft = timeLeft - 1.', check: { jsIncludes: ['timeLeft = timeLeft - 1'] } },
        { id: 4, minutes: '39–47', title: 'תרגול 4 — בלוק זמן קצר', prompt: 'הפעילו בלוק שמשנה את הזמן ל־10 שניות.', hint: 'שינוי timeLeft משנה את קושי המשחק.', check: { jsIncludes: ['timeLeft = 10'] } },
        { id: 5, minutes: '47–56', title: 'תרגול 5 — בלוק הודעת סיום', prompt: 'הפעילו בלוק שמשנה את הודעת הסיום.', hint: 'ההודעה מופיעה כאשר timeLeft <= 0.', check: { jsIncludes: ['נגמר הזמן! הצלחת לצבור'] } },
        { id: 6, minutes: '56–65', title: 'תרגול 6 — בלוק צבע סיום', prompt: 'הפעילו בלוק שמשנה את צבע מצב הסיום.', hint: 'הבלוק משנה את .finished ב־CSS.', check: { cssIncludes: ['#fecaca'] } },
        { id: 7, minutes: '65–75', title: 'תרגול 7 — דיבאג timeText', prompt: 'אם הזמן לא מוצג, בדקו התאמה של id="timeText".', hint: 'ה־id חייב להיות זהה ב־HTML וב־JS.', check: { htmlIncludes: ['id="timeText"'], jsIncludes: ['getElementById("timeText")'] } },
        { id: 8, minutes: '75–84', title: 'תרגול 8 — איזון זמן', prompt: 'תנו לחבר לשחק והחליטו אם המשחק צריך 10, 15 או 20 שניות.', hint: 'משחק טוב לא קל מדי ולא מתסכל מדי.', check: { jsIncludes: ['setInterval', 'clearInterval'], htmlIncludes: ['startButton'] } }
      ],
      aiHelper: [
        'הסבירו לילד בכיתה ד׳ מה זה טיימר בעזרת דוגמה של שעון חול.',
        'הציעו זמן מתאים למשחק קליקים קצר לילדים: 10, 15 או 20 שניות — ולמה.',
        'עזרו למצוא למה הזמן לא מתעדכן על המסך.',
        'הציעו הודעת סיום מעודדת למשחק עם טיימר.'
      ],
      vocabulary: [
        ['timeLeft', 'כמה זמן נשאר במשחק'],
        ['setInterval', 'להפעיל פעולה שוב ושוב לפי זמן'],
        ['tick', 'פעימת זמן אחת — בכל פעם יורדת שנייה'],
        ['clearInterval', 'לעצור את הטיימר'],
        ['איזון זמן', 'להחליט כמה זמן מתאים למשחק']
      ]
    },
    {
      id: 9,
      title: 'מכשולים ופסילה — בלוקי חוקי משחק',
      concept: 'בלוקי חוק משחק → JavaScript: lives · if · פסילה · איפוס מיקום',
      durationMinutes: 90,
      story: 'מוסיפים למשחק חוק חדש: לא רק אוספים נקודות, אלא גם נזהרים ממכשול. הילדים בונים קודם עם בלוקי חוק משחק: צור מכשול, אם נוגעים — הורד חיים, הצג פסילה, אפס משחק.',
      mission: 'לבנות משחק קליקים/אתגר עם מכשול, חיים ופסילה בעזרת בלוקי חוקי משחק.',
      outcome: 'משחק עם מכשול וחיים שנבנה מבלוקים, עם הצצה ל־lives, if ו־game over',
      starter: {
        html: '<main class="obstacle-game">\n  <h1>משחק המכשול הראשון</h1>\n  <p>ניקוד: <span id="scoreText">0</span> | חיים: <span id="livesText">3</span></p>\n  <button onclick="collectStar()">⭐ אספו כוכב</button>\n  <button onclick="hitObstacle()">🌋 נגעתי במכשול</button>\n  <button onclick="resetGame()">איפוס</button>\n  <p id="message">אספו כוכבים, אבל היזהרו מהמכשול!</p>\n</main>',
        css: 'body {\n  font-family: Arial, sans-serif;\n  direction: rtl;\n  text-align: center;\n  background: linear-gradient(135deg, #fef2f2, #eff6ff);\n}\n\n.obstacle-game {\n  background: white;\n  width: 420px;\n  margin: 45px auto;\n  padding: 30px;\n  border-radius: 30px;\n  box-shadow: 0 16px 35px #fecaca;\n}\n\n#scoreText, #livesText {\n  display: inline-block;\n  min-width: 38px;\n  background: #fee2e2;\n  border-radius: 999px;\n  padding: 6px 12px;\n  font-weight: bold;\n}\n\nbutton {\n  margin: 8px;\n  padding: 14px 18px;\n  border: 0;\n  border-radius: 999px;\n  background: #dc2626;\n  color: white;\n  font-weight: bold;\n  cursor: pointer;\n}\n\n.game-over {\n  background: #f1f5f9;\n  border: 3px solid #64748b;\n}',
        js: 'let score = 0;\nlet lives = 3;\n\nfunction collectStar() {\n  score = score + 1;\n  document.getElementById("scoreText").textContent = score;\n  document.getElementById("message").textContent = "יפה! אספת כוכב ⭐";\n}\n\nfunction hitObstacle() {\n  lives = lives - 1;\n  document.getElementById("livesText").textContent = lives;\n\n  if (lives <= 0) {\n    document.getElementById("message").textContent = "המשחק נגמר. נסו שוב!";\n    document.querySelector(".obstacle-game").classList.add("game-over");\n  } else {\n    document.getElementById("message").textContent = "אוי! איבדת חיים. נשארו לך " + lives;\n  }\n}\n\nfunction resetGame() {\n  score = 0;\n  lives = 3;\n  document.getElementById("scoreText").textContent = score;\n  document.getElementById("livesText").textContent = lives;\n  document.getElementById("message").textContent = "אספו כוכבים, אבל היזהרו מהמכשול!";\n  document.querySelector(".obstacle-game").classList.remove("game-over");\n}'
      },
      lessonFlow: [
        { minutes: '0–8', title: 'פתיחה: למה צריך מכשול?', teacher: 'שואלים מה הופך משחק למאתגר: לא רק מטרה, גם סיכון.', students: 'מציעים מכשול, חיים, פסילה ואיפוס.' },
        { minutes: '8–18', title: 'בלוק חוק משחק ראשון', teacher: 'מפעילים בלוק “הוסף חיים” ומראים את lives כמד חיים.', students: 'רואים שהמשחק מתחיל עם 3 חיים.' },
        { minutes: '18–34', title: 'בנייה מודרכת בבלוקי חוק', teacher: 'מפעילים בלוקים: אסוף כוכב, נגע במכשול, הורד חיים, בדוק game over.', students: 'מריצים, לוחצים על כוכב ומכשול, ורואים ניקוד/חיים משתנים.' },
        { minutes: '34–50', title: 'מציצים לקוד החוק', teacher: 'לא כותבים תנאי חופשי. רק מזהים lives, lives - 1, if lives <= 0.', students: 'מחברים בין בלוק פסילה לבין קוד if.' },
        { minutes: '50–66', title: 'תרגול עצמאי עם בלוקים', teacher: 'נותנים לתלמידים לשנות מספר חיים ומשוב פסילה דרך בלוקים.', students: 'מבצעים תרגולים 1–5.' },
        { minutes: '66–78', title: 'דיבאג חיים', teacher: 'מדגימים id לא תואם ל־livesText או חוק שלא עוצר ב־0.', students: 'בודקים התאמה בין livesText לבין JavaScript.' },
        { minutes: '78–90', title: 'בדיקת שחקנים', teacher: 'זוגות בודקים אם 3 חיים זה קל/קשה ומציעים איזון.', students: 'מסבירים את חוק הפסילה במילים.' }
      ],
      exercises: [
        { id: 1, minutes: '18–24', title: 'תרגול 1 — בלוק חיים', prompt: 'מצאו את בלוק החיים ובדקו שהמשחק מתחיל עם 3 חיים.', hint: 'החיים נשמרים במשתנה lives.', check: { jsIncludes: ['let lives = 3'], htmlIncludes: ['id="livesText"'] } },
        { id: 2, minutes: '24–31', title: 'תרגול 2 — בלוק איסוף כוכב', prompt: 'לחצו על איסוף כוכב ובדקו שהניקוד עולה.', hint: 'הפעולה collectStar מעלה score.', check: { jsIncludes: ['function collectStar', 'score = score + 1'] } },
        { id: 3, minutes: '31–39', title: 'תרגול 3 — בלוק מכשול', prompt: 'לחצו על מכשול ובדקו שחיים יורדים.', hint: 'הפעולה hitObstacle מורידה lives.', check: { jsIncludes: ['function hitObstacle', 'lives = lives - 1'] } },
        { id: 4, minutes: '39–47', title: 'תרגול 4 — בלוק Game Over', prompt: 'מצאו את התנאי שבודק אם החיים נגמרו.', hint: 'חפשו lives <= 0.', check: { jsIncludes: ['if (lives <= 0)'] } },
        { id: 5, minutes: '47–56', title: 'תרגול 5 — בלוק 5 חיים', prompt: 'הפעילו בלוק שמתחיל את המשחק עם 5 חיים.', hint: 'הבלוק משנה lives = 3 ל־5.', check: { jsIncludes: ['let lives = 5'] } },
        { id: 6, minutes: '56–65', title: 'תרגול 6 — הודעת פסילה', prompt: 'הפעילו בלוק שמשנה את הודעת המשחק נגמר.', hint: 'ההודעה נמצאת בתוך if.', check: { jsIncludes: ['נגמרו החיים'] } },
        { id: 7, minutes: '65–75', title: 'תרגול 7 — דיבאג livesText', prompt: 'אם החיים לא מוצגים, בדקו התאמה של id="livesText".', hint: 'ה־id חייב להיות זהה ב־HTML וב־JS.', check: { htmlIncludes: ['id="livesText"'], jsIncludes: ['getElementById("livesText")'] } },
        { id: 8, minutes: '75–84', title: 'תרגול 8 — איזון קושי', prompt: 'תנו לחבר לשחק והחליטו אם 3 או 5 חיים מתאים יותר.', hint: 'יותר חיים = משחק קל יותר.', check: { jsIncludes: ['lives', 'resetGame'], htmlIncludes: ['button'] } }
      ],
      aiHelper: [
        'הסבירו לילד בכיתה ד׳ מה ההבדל בין ניקוד לבין חיים במשחק.',
        'הציעו שלושה סוגי מכשולים למשחק פשוט.',
        'עזרו למצוא למה החיים יורדים בקוד אבל לא מתעדכנים במסך.',
        'הציעו איך לאזן משחק: כמה חיים לתת ולמה.'
      ],
      vocabulary: [
        ['lives', 'כמה ניסיונות נשארו לשחקן'],
        ['game over', 'מצב שבו המשחק נגמר'],
        ['<=', 'קטן או שווה — בדיקה אם החיים הגיעו לאפס'],
        ['מכשול', 'משהו במשחק שמוריד חיים או מקשה'],
        ['איזון קושי', 'להחליט כמה חיים או מכשולים מתאימים']
      ]
    },
    {
      id: 10,
      title: 'כוח מיוחד לדמות — בלוקי יכולת',
      concept: 'בלוקי יכולת → JavaScript: power · cooldown · מצב זמני',
      durationMinutes: 90,
      story: 'אחרי שלמדנו ניקוד, זמן, חיים ופסילה — מוסיפים לדמות כוח מיוחד: מגן, בוסט ניקוד או מצב מהיר. בונים קודם בבלוקי יכולת ורק אחר כך מציצים לקוד.',
      mission: 'לבנות משחק קטן שבו לדמות יש כוח מיוחד שאפשר להפעיל בלחיצה, עם משוב ברור ומגבלה פשוטה.',
      outcome: 'משחק עם כוח מיוחד שנבנה מבלוקים, עם הצצה ל־powerReady, classList ומשוב זמני',
      starter: {
        html: '<main class="power-game">\n  <h1>כוח מיוחד לדמות</h1>\n  <p>ניקוד: <span id="scoreText">0</span> | כוח: <span id="powerText">מוכן</span></p>\n  <button onclick="collectPoint()">⭐ נקודה</button>\n  <button onclick="activatePower()">🛡️ הפעל כוח</button>\n  <button onclick="resetGame()">איפוס</button>\n  <p id="message">אספו נקודות ושמרו את הכוח לרגע חשוב.</p>\n</main>',
        css: 'body {\n  font-family: Arial, sans-serif;\n  direction: rtl;\n  text-align: center;\n  background: linear-gradient(135deg, #eef2ff, #fdf2f8);\n}\n\n.power-game {\n  background: white;\n  width: 430px;\n  margin: 45px auto;\n  padding: 30px;\n  border-radius: 30px;\n  box-shadow: 0 16px 35px #ddd6fe;\n}\n\n#scoreText, #powerText {\n  display: inline-block;\n  background: #ede9fe;\n  border-radius: 999px;\n  padding: 6px 12px;\n  font-weight: bold;\n}\n\nbutton {\n  margin: 8px;\n  padding: 14px 18px;\n  border: 0;\n  border-radius: 999px;\n  background: #7c3aed;\n  color: white;\n  font-weight: bold;\n  cursor: pointer;\n}\n\n.power-on {\n  background: #dcfce7;\n  border: 3px solid #22c55e;\n}',
        js: 'let score = 0;\nlet powerReady = true;\n\nfunction collectPoint() {\n  score = score + 1;\n  document.getElementById("scoreText").textContent = score;\n}\n\nfunction activatePower() {\n  if (powerReady) {\n    powerReady = false;\n    score = score + 3;\n    document.getElementById("scoreText").textContent = score;\n    document.getElementById("powerText").textContent = "הופעל";\n    document.getElementById("message").textContent = "כוח מיוחד! קיבלת בוסט של 3 נקודות 🛡️";\n    document.querySelector(".power-game").classList.add("power-on");\n  } else {\n    document.getElementById("message").textContent = "הכוח כבר הופעל. אפשר להשתמש בו פעם אחת.";\n  }\n}\n\nfunction resetGame() {\n  score = 0;\n  powerReady = true;\n  document.getElementById("scoreText").textContent = score;\n  document.getElementById("powerText").textContent = "מוכן";\n  document.getElementById("message").textContent = "אספו נקודות ושמרו את הכוח לרגע חשוב.";\n  document.querySelector(".power-game").classList.remove("power-on");\n}'
      },
      lessonFlow: [
        { minutes: '0–8', title: 'פתיחה: כוח מיוחד במשחקים', teacher: 'שואלים אילו כוחות מיוחדים ילדים מכירים ממשחקים ומה הופך אותם למעניינים.', students: 'מציעים מגן, מהירות, בונוס נקודות או כוח חד־פעמי.' },
        { minutes: '8–18', title: 'בלוק יכולת ראשון', teacher: 'מפעילים בלוק “כוח מוכן” ומראים את powerReady כמצב כן/לא.', students: 'רואים שיש כוח שאפשר להפעיל פעם אחת.' },
        { minutes: '18–34', title: 'בנייה מודרכת בבלוקי יכולת', teacher: 'מפעילים בלוקים: בוסט נקודות, הודעת כוח, צבע כוח, שימוש חד־פעמי.', students: 'מריצים, מפעילים כוח, ובודקים שאי אפשר להפעיל שוב.' },
        { minutes: '34–50', title: 'מציצים לקוד מצב', teacher: 'לא כותבים מצב חופשי. רק מזהים powerReady, if, true/false ו־classList.', students: 'מחברים בין בלוק כוח לבין שינוי ניקוד/עיצוב.' },
        { minutes: '50–66', title: 'תרגול עצמאי עם בלוקים', teacher: 'נותנים לתלמידים לשנות סוג כוח ומשוב דרך בלוקים.', students: 'מבצעים תרגולים 1–5.' },
        { minutes: '66–78', title: 'איזון כוח', teacher: 'מדברים על כוח חזק מדי: למה כדאי להגביל שימוש.', students: 'משווים בוסט 3 מול בוסט 5 ומחליטים מה הוגן.' },
        { minutes: '78–90', title: 'הצגת כוח', teacher: 'זוגות משחקים ומסבירים את כלל הכוח.', students: 'מסבירים: “הכוח עובד רק אם powerReady נכון”.' }
      ],
      exercises: [
        { id: 1, minutes: '18–24', title: 'תרגול 1 — בלוק כוח מוכן', prompt: 'מצאו את בלוק הכוח ובדקו שהכוח מתחיל במצב מוכן.', hint: 'המצב נשמר ב־powerReady.', check: { jsIncludes: ['let powerReady = true'], htmlIncludes: ['id="powerText"'] } },
        { id: 2, minutes: '24–31', title: 'תרגול 2 — בלוק הפעל כוח', prompt: 'לחצו על הפעל כוח ובדקו שהניקוד עולה.', hint: 'הכוח מוסיף נקודות בתוך activatePower.', check: { jsIncludes: ['function activatePower', 'score = score + 3'] } },
        { id: 3, minutes: '31–39', title: 'תרגול 3 — בלוק חד־פעמי', prompt: 'נסו להפעיל כוח פעמיים ובדקו שהפעם השנייה לא מוסיפה ניקוד.', hint: 'if (powerReady) קובע אם מותר להפעיל.', check: { jsIncludes: ['if (powerReady)', 'powerReady = false'] } },
        { id: 4, minutes: '39–47', title: 'תרגול 4 — בלוק בוסט 5', prompt: 'הפעילו בלוק שמחליף את הבוסט ל־5 נקודות.', hint: 'זה חזק יותר — בדקו אם זה מאוזן.', check: { jsIncludes: ['score = score + 5'] } },
        { id: 5, minutes: '47–56', title: 'תרגול 5 — בלוק הודעת כוח', prompt: 'הפעילו בלוק שמשנה את הודעת הכוח המיוחד.', hint: 'ההודעה נמצאת בתוך activatePower.', check: { jsIncludes: ['כוח על הופעל'] } },
        { id: 6, minutes: '56–65', title: 'תרגול 6 — בלוק צבע כוח', prompt: 'הפעילו בלוק שמשנה את צבע מצב הכוח.', hint: 'הבלוק משנה את .power-on ב־CSS.', check: { cssIncludes: ['#bbf7d0'] } },
        { id: 7, minutes: '65–75', title: 'תרגול 7 — דיבאג powerText', prompt: 'אם מצב הכוח לא מוצג, בדקו התאמה של id="powerText".', hint: 'ה־id חייב להיות זהה ב־HTML וב־JS.', check: { htmlIncludes: ['id="powerText"'], jsIncludes: ['getElementById("powerText")'] } },
        { id: 8, minutes: '75–84', title: 'תרגול 8 — איזון כוח', prompt: 'תנו לחבר לשחק והחליטו אם כוח של 3 או 5 נקודות הוגן יותר.', hint: 'כוח טוב עוזר, אבל לא מנצח את המשחק לבד.', check: { jsIncludes: ['powerReady', 'resetGame'], htmlIncludes: ['button'] } }
      ],
      aiHelper: [
        'הציעו 5 כוחות מיוחדים פשוטים למשחק ילדים.',
        'הסבירו לילד מה זה מצב true/false בעזרת כוח מוכן או לא מוכן.',
        'עזרו למצוא למה הכוח מופעל יותר מפעם אחת.',
        'הציעו איך לאזן כוח מיוחד כדי שלא יהיה חזק מדי.'
      ],
      vocabulary: [
        ['powerReady', 'האם הכוח מוכן להפעלה'],
        ['true / false', 'כן או לא בקוד'],
        ['יכולת מיוחדת', 'פעולה חזקה שהשחקן יכול להפעיל'],
        ['חד־פעמי', 'משהו שאפשר להשתמש בו פעם אחת'],
        ['איזון כוח', 'לוודא שהכוח עוזר אבל לא קל מדי']
      ]
    },
    {
      id: 11,
      title: 'מסך פתיחה וניצחון — בלוקי מסך',
      concept: 'בלוקי מסך → JavaScript: screen · start · win · lose',
      durationMinutes: 90,
      story: 'משחק מרגיש מקצועי יותר כשיש לו מסך פתיחה, הוראות, מסך ניצחון ומסך הפסד. הילדים בונים את חוויית המשחק בעזרת בלוקי מסך ורק אחר כך מציצים לקוד שמחליף מצב.',
      mission: 'לבנות משחק קטן עם מסך פתיחה, מצב משחק, מסך ניצחון ומסך הפסד בעזרת בלוקי מסך.',
      outcome: 'משחק עם מסכי פתיחה/משחק/ניצחון/הפסד שנבנה מבלוקים, עם הצצה ל־currentScreen ו־classList',
      starter: {
        html: '<main class="screen-game">\n  <section id="startScreen" class="screen active">\n    <h1>משחק המסכים שלי</h1>\n    <p>אספו 3 נקודות כדי לנצח.</p>\n    <button onclick="startGame()">התחילו</button>\n  </section>\n  <section id="playScreen" class="screen">\n    <h2>המשחק התחיל</h2>\n    <p>ניקוד: <span id="scoreText">0</span></p>\n    <button onclick="addPoint()">⭐ נקודה</button>\n    <button onclick="loseGame()">🌋 הפסד</button>\n  </section>\n  <section id="winScreen" class="screen">\n    <h2>ניצחון!</h2>\n    <p>הגעתם ליעד 🎉</p>\n    <button onclick="resetGame()">שחקו שוב</button>\n  </section>\n  <section id="loseScreen" class="screen">\n    <h2>הפסד קטן</h2>\n    <p>לא נורא, מנסים שוב.</p>\n    <button onclick="resetGame()">נסו שוב</button>\n  </section>\n</main>',
        css: 'body {\n  font-family: Arial, sans-serif;\n  direction: rtl;\n  text-align: center;\n  background: linear-gradient(135deg, #dbeafe, #f5d0fe);\n}\n\n.screen-game {\n  background: white;\n  width: 430px;\n  margin: 45px auto;\n  padding: 28px;\n  border-radius: 30px;\n  box-shadow: 0 16px 35px #c4b5fd;\n}\n\n.screen {\n  display: none;\n  min-height: 230px;\n}\n\n.screen.active {\n  display: block;\n}\n\nbutton {\n  margin: 8px;\n  padding: 14px 20px;\n  border: 0;\n  border-radius: 999px;\n  background: #4f46e5;\n  color: white;\n  font-weight: bold;\n  cursor: pointer;\n}\n\n.win-style { background: #dcfce7; }\n.lose-style { background: #fee2e2; }',
        js: 'let score = 0;\nconst target = 3;\n\nfunction showScreen(screenId) {\n  document.querySelectorAll(".screen").forEach(screen => {\n    screen.classList.remove("active");\n  });\n  document.getElementById(screenId).classList.add("active");\n}\n\nfunction startGame() {\n  score = 0;\n  document.getElementById("scoreText").textContent = score;\n  showScreen("playScreen");\n}\n\nfunction addPoint() {\n  score = score + 1;\n  document.getElementById("scoreText").textContent = score;\n\n  if (score >= target) {\n    showScreen("winScreen");\n  }\n}\n\nfunction loseGame() {\n  showScreen("loseScreen");\n}\n\nfunction resetGame() {\n  score = 0;\n  showScreen("startScreen");\n}'
      },
      lessonFlow: [
        { minutes: '0–8', title: 'פתיחה: משחק עם מסכים', teacher: 'מציגים משחק בלי מסך פתיחה ואז עם מסכים, ושואלים מה מרגיש מקצועי יותר.', students: 'מזהים פתיחה, הוראות, משחק, ניצחון והפסד.' },
        { minutes: '8–18', title: 'בלוק מסך ראשון', teacher: 'מפעילים בלוק “מסך פתיחה” ומראים ש־section אחד פעיל.', students: 'רואים שרק מסך אחד מוצג בכל פעם.' },
        { minutes: '18–34', title: 'בנייה מודרכת בבלוקי מסך', teacher: 'מפעילים בלוקים: התחל משחק, מסך ניצחון, מסך הפסד, שחק שוב.', students: 'מריצים ועוברים בין המסכים בעזרת כפתורים.' },
        { minutes: '34–50', title: 'מציצים לקוד החלפת מסך', teacher: 'לא כותבים לולאות חופשיות. רק מזהים showScreen, active ו־classList.', students: 'מחברים בין בלוק מסך לבין class active.' },
        { minutes: '50–66', title: 'תרגול עצמאי עם בלוקים', teacher: 'נותנים לתלמידים לשנות טקסטי מסך ויעד נקודות דרך בלוקים.', students: 'מבצעים תרגולים 1–5.' },
        { minutes: '66–78', title: 'דיבאג מסכים', teacher: 'מדגימים id לא תואם למסך או class active חסר.', students: 'בודקים שהשמות startScreen/playScreen תואמים.' },
        { minutes: '78–90', title: 'בדיקת חוויית משתמש', teacher: 'זוגות משחקים ומוודאים שהוראות הפתיחה ברורות.', students: 'משפרים טקסט במסך פתיחה או ניצחון.' }
      ],
      exercises: [
        { id: 1, minutes: '18–24', title: 'תרגול 1 — בלוק מסך פתיחה', prompt: 'מצאו את מסך הפתיחה ובדקו שהוא המסך הפעיל הראשון.', hint: 'המסך הפעיל מקבל class active.', check: { htmlIncludes: ['id="startScreen"', 'class="screen active"'] } },
        { id: 2, minutes: '24–31', title: 'תרגול 2 — בלוק התחלת משחק', prompt: 'לחצו התחילו ובדקו שעוברים למסך המשחק.', hint: 'startGame מפעיל showScreen("playScreen").', check: { jsIncludes: ['function startGame', 'showScreen("playScreen")'] } },
        { id: 3, minutes: '31–39', title: 'תרגול 3 — בלוק יעד 3', prompt: 'מצאו את היעד לניצחון: 3 נקודות.', hint: 'היעד נשמר ב־target.', check: { jsIncludes: ['const target = 3'] } },
        { id: 4, minutes: '39–47', title: 'תרגול 4 — בלוק מסך ניצחון', prompt: 'אספו נקודות עד שהמשחק עובר למסך ניצחון.', hint: 'המעבר קורה כאשר score >= target.', check: { htmlIncludes: ['id="winScreen"'], jsIncludes: ['showScreen("winScreen")'] } },
        { id: 5, minutes: '47–56', title: 'תרגול 5 — בלוק מסך הפסד', prompt: 'לחצו על כפתור הפסד ובדקו שעוברים למסך הפסד.', hint: 'loseGame מפעיל showScreen("loseScreen").', check: { htmlIncludes: ['id="loseScreen"'], jsIncludes: ['showScreen("loseScreen")'] } },
        { id: 6, minutes: '56–65', title: 'תרגול 6 — בלוק שחק שוב', prompt: 'בדקו שכפתור שחקו שוב מחזיר למסך הפתיחה.', hint: 'resetGame מחזיר ל־startScreen.', check: { jsIncludes: ['function resetGame', 'showScreen("startScreen")'] } },
        { id: 7, minutes: '65–75', title: 'תרגול 7 — דיבאג id מסך', prompt: 'אם מעבר מסך לא עובד, בדקו שה־id במסך זהה לשם ב־showScreen.', hint: 'playScreen חייב להיות כתוב אותו דבר בשני המקומות.', check: { htmlIncludes: ['id="playScreen"'], jsIncludes: ['showScreen("playScreen")'] } },
        { id: 8, minutes: '75–84', title: 'תרגול 8 — שיפור חוויית משתמש', prompt: 'שנו טקסט במסך הפתיחה כך שיהיה ברור לשחקן מה המטרה.', hint: 'שינוי בטוח: טקסט בתוך p או h1.', check: { htmlIncludes: ['startScreen', 'button'], jsIncludes: ['showScreen'] } }
      ],
      aiHelper: [
        'הציעו טקסט קצר למסך פתיחה של משחק ילדים.',
        'הסבירו לילד מה זה “מסך פעיל” בעזרת דוגמה של כרטיסיות.',
        'עזרו למצוא למה כפתור התחלה לא מעביר למסך המשחק.',
        'הציעו הודעת ניצחון מעודדת וברורה.'
      ],
      vocabulary: [
        ['screen', 'מסך או מצב במשחק'],
        ['active', 'המסך שמוצג עכשיו'],
        ['showScreen', 'פונקציה שמחליפה מסך'],
        ['UX', 'חוויית משתמש — שיהיה ברור ונעים לשחק'],
        ['reset', 'לחזור להתחלה']
      ]
    },
    {
      id: 12,
      title: 'מיני־פרויקט ראשון — בלוקי בניית משחק',
      concept: 'פרויקט: מחברים מסכים · ניקוד · זמן · חיים · ניצחון',
      durationMinutes: 90,
      story: 'במקום ללמוד מושג חדש מאפס, מחברים את כל הבלוקים מהשיעורים הקודמים למיני־פרויקט ראשון: משחק כוכבים קצר עם מסך פתיחה, ניקוד, זמן, חיים וניצחון.',
      mission: 'לבנות מיני־משחק אישי בעזרת בלוקי פרויקט ולבחור לפחות שני שדרוגים.',
      outcome: 'מיני־משחק Web ראשון שמחבר כמה מערכות יחד, עם הצצה לקוד מאורגן לפי חלקים',
      starter: {
        html: '<main class="project-game">\n  <h1>משחק הכוכבים שלי</h1>\n  <p>ניקוד: <span id="scoreText">0</span> | חיים: <span id="livesText">3</span> | זמן: <span id="timeText">20</span></p>\n  <button onclick="startGame()">▶️ התחלה</button>\n  <button onclick="collectStar()">⭐ כוכב</button>\n  <button onclick="hitObstacle()">🌋 מכשול</button>\n  <button onclick="resetGame()">🔁 איפוס</button>\n  <p id="message">לחצו התחלה ובנו את חוקי המשחק שלכם.</p>\n</main>',
        css: 'body {\n  font-family: Arial, sans-serif;\n  direction: rtl;\n  text-align: center;\n  background: linear-gradient(135deg, #e0f2fe, #fef3c7);\n}\n\n.project-game {\n  background: white;\n  width: 460px;\n  margin: 45px auto;\n  padding: 30px;\n  border-radius: 30px;\n  box-shadow: 0 16px 35px #bae6fd;\n}\n\nspan {\n  display: inline-block;\n  min-width: 36px;\n  background: #fef9c3;\n  border-radius: 999px;\n  padding: 5px 10px;\n  font-weight: bold;\n}\n\nbutton {\n  margin: 7px;\n  padding: 13px 18px;\n  border: 0;\n  border-radius: 999px;\n  background: #0284c7;\n  color: white;\n  font-weight: bold;\n}\n\n.win { background: #dcfce7; border: 3px solid #22c55e; }\n.lose { background: #fee2e2; border: 3px solid #ef4444; }',
        js: 'let score = 0;\nlet lives = 3;\nlet timeLeft = 20;\nconst target = 5;\n\nfunction startGame() {\n  score = 0;\n  lives = 3;\n  timeLeft = 20;\n  updateScreen();\n  document.getElementById("message").textContent = "המשחק התחיל! אספו 5 כוכבים.";\n}\n\nfunction collectStar() {\n  score = score + 1;\n  updateScreen();\n  if (score >= target) {\n    document.getElementById("message").textContent = "ניצחת! בנית מיני־משחק 🎉";\n    document.querySelector(".project-game").classList.add("win");\n  }\n}\n\nfunction hitObstacle() {\n  lives = lives - 1;\n  updateScreen();\n  if (lives <= 0) {\n    document.getElementById("message").textContent = "נגמרו החיים. נסו שוב.";\n    document.querySelector(".project-game").classList.add("lose");\n  }\n}\n\nfunction updateScreen() {\n  document.getElementById("scoreText").textContent = score;\n  document.getElementById("livesText").textContent = lives;\n  document.getElementById("timeText").textContent = timeLeft;\n}\n\nfunction resetGame() {\n  score = 0;\n  lives = 3;\n  timeLeft = 20;\n  document.querySelector(".project-game").classList.remove("win", "lose");\n  document.getElementById("message").textContent = "לחצו התחלה ובנו את חוקי המשחק שלכם.";\n  updateScreen();\n}'
      },
      lessonFlow: [
        { minutes: '0–8', title: 'פתיחה: פרויקט ראשון', teacher: 'מסבירים שהיום לא לומדים פקודה חדשה — מחברים חלקים מוכרים למשחק אחד.', students: 'מזהים במשחק ניקוד, חיים, זמן, מטרה וכפתורים.' },
        { minutes: '8–18', title: 'מפת פרויקט', teacher: 'מציירים על הלוח: מסך + ניקוד + חיים + זמן + ניצחון.', students: 'מסמנים איזה בלוק אחראי לכל חלק.' },
        { minutes: '18–34', title: 'בנייה מודרכת בבלוקי פרויקט', teacher: 'מפעילים בלוקים: שם משחק, יעד, חיים, הודעת ניצחון.', students: 'מריצים ובודקים שהמשחק עדיין עובד אחרי כל בלוק.' },
        { minutes: '34–50', title: 'מציצים לקוד מאורגן', teacher: 'מראים שהקוד מחולק לפונקציות: startGame, collectStar, hitObstacle, updateScreen.', students: 'מחברים כל פונקציה לכפתור/חוק במשחק.' },
        { minutes: '50–70', title: 'עבודה עצמאית', teacher: 'כל תלמיד בוחר שני שדרוגים מתוך בלוקי הפרויקט.', students: 'משנים שם, יעד, חיים, הודעות או צבעי ניצחון/הפסד.' },
        { minutes: '70–82', title: 'בדיקת חברים', teacher: 'מחליפים מחשבים/עמדות ובודקים אם המשחק ברור.', students: 'נותנים משוב אחד ומשפרים דבר אחד.' },
        { minutes: '82–90', title: 'דמו קצר', teacher: 'מבקשים 2–3 הצגות קצרות.', students: 'מציגים: שם המשחק, המטרה, והשדרוג שבחרו.' }
      ],
      exercises: [
        { id: 1, minutes: '18–24', title: 'תרגול 1 — בלוק שם משחק', prompt: 'הפעילו בלוק שמשנה את שם המשחק.', hint: 'השם נמצא בתוך h1.', check: { htmlIncludes: ['משחק הכוכבים המשודרג'] } },
        { id: 2, minutes: '24–31', title: 'תרגול 2 — בלוק יעד', prompt: 'הפעילו בלוק שמגדיר יעד של 7 כוכבים.', hint: 'היעד נשמר ב־target.', check: { jsIncludes: ['const target = 7'] } },
        { id: 3, minutes: '31–39', title: 'תרגול 3 — בלוק 5 חיים', prompt: 'הפעילו בלוק שנותן 5 חיים בתחילת המשחק.', hint: 'שימו לב שגם startGame מאפס חיים.', check: { jsIncludes: ['let lives = 5', 'lives = 5'] } },
        { id: 4, minutes: '39–47', title: 'תרגול 4 — בלוק זמן 30', prompt: 'הפעילו בלוק שמשנה את הזמן ל־30.', hint: 'timeLeft צריך להשתנות גם בהתחלה וגם באיפוס.', check: { jsIncludes: ['let timeLeft = 30', 'timeLeft = 30'] } },
        { id: 5, minutes: '47–56', title: 'תרגול 5 — בלוק הודעת ניצחון', prompt: 'הפעילו בלוק הודעת ניצחון אישית.', hint: 'ההודעה נמצאת אחרי score >= target.', check: { jsIncludes: ['ניצחון מושלם'] } },
        { id: 6, minutes: '56–65', title: 'תרגול 6 — בלוק צבעי פרויקט', prompt: 'הפעילו בלוק שמשנה את צבע הניצחון.', hint: 'הבלוק משנה את .win ב־CSS.', check: { cssIncludes: ['#bbf7d0'] } },
        { id: 7, minutes: '65–75', title: 'תרגול 7 — בדיקת פונקציות', prompt: 'מצאו בקוד את ארבע הפונקציות המרכזיות של המשחק.', hint: 'חפשו function startGame / collectStar / hitObstacle / updateScreen.', check: { jsIncludes: ['function startGame', 'function collectStar', 'function hitObstacle', 'function updateScreen'] } },
        { id: 8, minutes: '75–84', title: 'תרגול 8 — הצגת פרויקט', prompt: 'תנו לחבר לשחק והסבירו איזה שני בלוקים שדרגו את המשחק.', hint: 'הסבירו במילים, לא בקוד.', check: { htmlIncludes: ['button'], jsIncludes: ['resetGame'], cssIncludes: ['.win', '.lose'] } }
      ],
      aiHelper: [
        'הציעו שם למשחק כוכבים של תלמיד בכיתה ד׳.',
        'הציעו שני שדרוגים פשוטים למשחק בלי להוסיף קוד מורכב.',
        'עזרו לתלמיד להסביר מה עושה כל פונקציה במשחק.',
        'הציעו משוב חברי למשחק: דבר אחד טוב ודבר אחד לשיפור.'
      ],
      vocabulary: [
        ['project', 'תוצר שמחבר כמה חלקים יחד'],
        ['updateScreen', 'פונקציה שמעדכנת את כל המספרים במסך'],
        ['שדרוג', 'שינוי קטן שהופך את המשחק לאישי יותר'],
        ['playtest', 'בדיקת משחק על ידי חבר'],
        ['דמו', 'הצגה קצרה של מה שבניתי']
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
    5: [
      { label: '❓ שאלה חדשה', target: 'html', find: 'איזו שפה מעצבת את העמוד?', replace: 'איזו שפה גורמת לכפתור להגיב?', hint: 'בלוק חידון: משנה את השאלה שהמשתמש רואה.' },
      { label: '✅ תשובה נכונה', target: 'js', find: 'answer === "CSS"', replace: 'answer === "JavaScript"', hint: 'בלוק תנאי: משנה מה נחשב תשובה נכונה.' },
      { label: '🎉 הודעת הצלחה', target: 'js', find: 'נכון מאוד! CSS מעצב את העמוד 🎨', replace: 'נכון! JavaScript מפעיל תגובות ⚡', hint: 'בלוק משוב: מה קורה אם התנאי נכון.' },
      { label: '💡 רמז לתשובה שגויה', target: 'js', find: 'כמעט! נסו לחשוב איזו שפה אחראית לצבעים.', replace: 'כמעט! רמז: זו השפה של הפעולות והכפתורים.', hint: 'בלוק אחרת: מה קורה אם התנאי לא נכון.' }
    ],

    6: [
      { label: '🔢 התחל ניקוד', target: 'js', find: 'let score = 0;', replace: 'let score = 0;', hint: 'בלוק זיכרון: יוצר משתנה ניקוד שמתחיל מאפס.' },
      { label: '⭐ הוסף נקודה', target: 'js', find: 'score = score + 1;', replace: 'score = score + 1;', hint: 'בלוק ניקוד: מעלה את score בכל תשובה נכונה.' },
      { label: '📺 הצג ניקוד', target: 'js', find: 'document.getElementById("scoreText").textContent = score;', replace: 'document.getElementById("scoreText").textContent = score;', hint: 'בלוק תצוגה: מעדכן את המספר במסך.' },
      { label: '✌️ שתי נקודות', target: 'js', find: 'score = score + 1;', replace: 'score = score + 2;', hint: 'בלוק חוק משחק: תשובה נכונה שווה יותר נקודות.' },
      { label: '🎉 הודעת ניקוד כפול', target: 'js', find: 'נכון! קיבלת נקודה ⭐', replace: 'נכון! קיבלת 2 נקודות ⭐⭐', hint: 'בלוק משוב: מסביר לשחקן כמה נקודות קיבל.' }
    ],

    7: [
      { label: '🎯 כפתור קליק', target: 'html', find: '🎯 לחצו לנקודה', replace: '🎯 קליק לנקודה', hint: 'בלוק משחק: מגדיר את כפתור הפעולה הראשי.' },
      { label: '🏁 יעד 10', target: 'js', find: 'const target = 10;', replace: 'const target = 10;', hint: 'בלוק יעד: כמה נקודות צריך כדי לנצח.' },
      { label: '⚡ יעד קל 5', target: 'js', find: 'const target = 10;', replace: 'const target = 5;', hint: 'בלוק איזון: מקצר את המשחק לכיתה שצריכה הצלחה מהירה.' },
      { label: '✌️ נקודות כפולות', target: 'js', find: 'score = score + 1;', replace: 'score = score + 2;', hint: 'בלוק ניקוד: כל קליק שווה שתי נקודות.' },
      { label: '🎉 הודעת ניצחון', target: 'js', find: 'ניצחת! הגעת ליעד 🎉', replace: 'אליפות! ניצחת במשחק הקליקים 🎉', hint: 'בלוק משוב: משנה את הודעת הסיום.' },
      { label: '🟢 צבע ניצחון', target: 'css', find: 'background: #dcfce7;', replace: 'background: #bbf7d0;', hint: 'בלוק עיצוב: משנה את מצב הניצחון.' }
    ],


    8: [
      { label: '⏱️ התחל טיימר', target: 'js', find: 'let timeLeft = 15;', replace: 'let timeLeft = 15;', hint: 'בלוק זמן: יוצר זמן התחלתי למשחק.' },
      { label: '📺 הצג זמן', target: 'js', find: 'document.getElementById("timeText").textContent = timeLeft;', replace: 'document.getElementById("timeText").textContent = timeLeft;', hint: 'בלוק תצוגה: מראה את הזמן במסך.' },
      { label: '⬇️ הורד שנייה', target: 'js', find: 'timeLeft = timeLeft - 1;', replace: 'timeLeft = timeLeft - 1;', hint: 'בלוק ספירה: בכל פעימה יורדת שנייה.' },
      { label: '⚡ זמן קצר 10', target: 'js', find: 'timeLeft = 15;', replace: 'timeLeft = 10;', hint: 'בלוק איזון: מקצר את המשחק ל־10 שניות.' },
      { label: '🏁 הודעת סיום', target: 'js', find: 'הזמן נגמר! הניקוד שלך: ', replace: 'נגמר הזמן! הצלחת לצבור ', hint: 'בלוק משוב: משנה הודעת סוף משחק.' },
      { label: '🔴 צבע סיום', target: 'css', find: 'background: #fee2e2;', replace: 'background: #fecaca;', hint: 'בלוק עיצוב: משנה צבע במצב סיום.' }
    ],


    9: [
      { label: '❤️ הוסף חיים', target: 'js', find: 'let lives = 3;', replace: 'let lives = 3;', hint: 'בלוק חיים: יוצר מד חיים למשחק.' },
      { label: '⭐ איסוף כוכב', target: 'js', find: 'score = score + 1;', replace: 'score = score + 1;', hint: 'בלוק פרס: איסוף כוכב מעלה ניקוד.' },
      { label: '🌋 נגיעה במכשול', target: 'js', find: 'lives = lives - 1;', replace: 'lives = lives - 1;', hint: 'בלוק סיכון: מכשול מוריד חיים.' },
      { label: '🏁 בדוק Game Over', target: 'js', find: 'if (lives <= 0)', replace: 'if (lives <= 0)', hint: 'בלוק תנאי: בודק אם החיים נגמרו.' },
      { label: '💚 5 חיים', target: 'js', find: 'let lives = 3;', replace: 'let lives = 5;', hint: 'בלוק איזון: נותן יותר ניסיונות.' },
      { label: '💬 הודעת פסילה', target: 'js', find: 'המשחק נגמר. נסו שוב!', replace: 'נגמרו החיים — אבל אפשר לנסות שוב!', hint: 'בלוק משוב: הודעה מעודדת בסיום.' }
    ],


    10: [
      { label: '🟢 כוח מוכן', target: 'js', find: 'let powerReady = true;', replace: 'let powerReady = true;', hint: 'בלוק מצב: הכוח מתחיל מוכן.' },
      { label: '🛡️ הפעל כוח', target: 'js', find: 'score = score + 3;', replace: 'score = score + 3;', hint: 'בלוק יכולת: הכוח מוסיף בוסט ניקוד.' },
      { label: '🔒 שימוש חד־פעמי', target: 'js', find: 'powerReady = false;', replace: 'powerReady = false;', hint: 'בלוק מגבלה: אחרי שימוש הכוח כבר לא מוכן.' },
      { label: '🚀 בוסט 5', target: 'js', find: 'score = score + 3;', replace: 'score = score + 5;', hint: 'בלוק איזון: כוח חזק יותר.' },
      { label: '💬 הודעת כוח', target: 'js', find: 'כוח מיוחד! קיבלת בוסט של 3 נקודות 🛡️', replace: 'כוח על הופעל! קיבלת בונוס גדול ⚡', hint: 'בלוק משוב: משנה הודעה לשחקן.' },
      { label: '🟩 צבע כוח', target: 'css', find: 'background: #dcfce7;', replace: 'background: #bbf7d0;', hint: 'בלוק עיצוב: משנה את צבע מצב הכוח.' }
    ],


    11: [
      { label: '🎬 מסך פתיחה', target: 'html', find: '<p>אספו 3 נקודות כדי לנצח.</p>', replace: '<p>המטרה: להגיע ל־3 נקודות ולפתוח מסך ניצחון.</p>', hint: 'בלוק מסך: משפר הוראות פתיחה.' },
      { label: '▶️ התחל משחק', target: 'js', find: 'showScreen("playScreen");', replace: 'showScreen("playScreen");', hint: 'בלוק מעבר: עובר ממסך פתיחה למסך משחק.' },
      { label: '🏆 יעד 3', target: 'js', find: 'const target = 3;', replace: 'const target = 3;', hint: 'בלוק מטרה: כמה נקודות צריך לניצחון.' },
      { label: '🎉 מסך ניצחון', target: 'js', find: 'showScreen("winScreen");', replace: 'showScreen("winScreen");', hint: 'בלוק מסך: מציג ניצחון כשהיעד הושג.' },
      { label: '🌋 מסך הפסד', target: 'js', find: 'showScreen("loseScreen");', replace: 'showScreen("loseScreen");', hint: 'בלוק מסך: מציג הפסד כאשר נלחץ כפתור הפסד.' },
      { label: '🔁 שחק שוב', target: 'js', find: 'showScreen("startScreen");', replace: 'showScreen("startScreen");', hint: 'בלוק איפוס: חוזר למסך הפתיחה.' }
    ],


    12: [
      { label: '🎮 שם משחק', target: 'html', find: 'משחק הכוכבים שלי', replace: 'משחק הכוכבים המשודרג', hint: 'בלוק פרויקט: נותן שם אישי למשחק.' },
      { label: '🏁 יעד 7', target: 'js', find: 'const target = 5;', replace: 'const target = 7;', hint: 'בלוק יעד: משנה כמה כוכבים צריך לניצחון.' },
      { label: '💚 5 חיים', target: 'js', find: 'let lives = 3;', replace: 'let lives = 5;', hint: 'בלוק איזון: נותן יותר חיים.' },
      { label: '💚 איפוס ל־5 חיים', target: 'js', find: 'lives = 3;', replace: 'lives = 5;', hint: 'בלוק איפוס: גם בהתחלה חדשה חוזרים ל־5 חיים.' },
      { label: '⏱️ זמן 30', target: 'js', find: 'let timeLeft = 20;', replace: 'let timeLeft = 30;', hint: 'בלוק זמן: מגדיל את הזמן.' },
      { label: '⏱️ איפוס ל־30', target: 'js', find: 'timeLeft = 20;', replace: 'timeLeft = 30;', hint: 'בלוק איפוס זמן: משחק חדש מתחיל עם 30 שניות.' },
      { label: '🏆 הודעת ניצחון', target: 'js', find: 'ניצחת! בנית מיני־משחק 🎉', replace: 'ניצחון מושלם! המשחק שלך עובד 🎉', hint: 'בלוק משוב: מסך/הודעת ניצחון אישית.' },
      { label: '🟢 צבע ניצחון', target: 'css', find: '#dcfce7', replace: '#bbf7d0', hint: 'בלוק עיצוב: משנה צבע ניצחון.' }
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
    if (lesson.id <= 12) lesson.mode = 'Blockly-first bridge';
  });


  Object.assign(lessons[2], {
    title: 'כפתורים שמפעילים קסמים — Blockly פעולה אמיתי',
    concept: 'Blockly אמיתי → JavaScript: לחיצה · function · שינוי במסך',
    story: 'אחרי שבנינו עמוד ועיצבנו אותו, שיעור 3 פותח בוואו מהיר: הילדים מריצים עמוד, לוחצים על כפתור, ורואים מיד הודעה ורקע משתנים. רק אחרי שהקסם עובד מחברים אותו ל־onclick, function ו־JavaScript.',
    mission: 'לבנות עמוד אינטראקטיבי בעזרת בלוקי פעולה אמיתיים: קודם חוויית לחיצה מיידית, ואז כפתור, הודעה, שינוי סמל, שינוי רקע ו־toggle של מצב קסם.',
    outcome: 'עמוד שמגיב ללחיצה כבר בתחילת השיעור, עם הצצה ברורה ל־onclick, function, textContent, style ו־classList.toggle',
    mode: 'Real Blockly action studio',
    realBlocklyBuilder: true,
    lessonFlow: [
      { minutes: '0–3', title: 'וואו ראשון: לוחצים והעמוד משתנה', teacher: 'בלי הקדמה ארוכה: מריצים, לוחצים על “הפעילו קסם”, ושואלים מה השתנה במסך.', students: 'רואים הודעה ורקע משתנים מיד ומנחשים איזה בלוק גרם לזה.' },
      { minutes: '3–10', title: 'משנים קסם קטן לבד', teacher: 'מבקשים לשנות בחירת רקע או טקסט בכפתור ולהריץ שוב. עדיין לא מסבירים תחביר.', students: 'משנים ערך בתוך בלוק, מריצים, לוחצים ורואים תוצאה אישית.' },
      { minutes: '10–20', title: 'כפתור ופונקציה מאחורי הקסם', teacher: 'רק עכשיו מצביעים על בלוק כפתור ועל ההצצה לקוד: onclick מפעיל function showMessage.', students: 'בוחרים את בלוק הכפתור ורואים את שורת ה־HTML המסומנת.' },
      { minutes: '20–34', title: 'בלוק הודעה בלחיצה', teacher: 'גוררים בלוק “בלחיצה שנה הודעה” מסטודיו פעולה ומדגימים textContent.', students: 'כותבים הודעה מצחיקה, מריצים ולוחצים על הכפתור.' },
      { minutes: '34–48', title: 'בלוק שינוי סמל', teacher: 'מוסיפים בלוק שמחליף אימוג׳י בלחיצה ומראים איך JS משנה אלמנט עם id.', students: 'בוחרים סמל חדש ובודקים שינוי בתצוגה.' },
      { minutes: '48–62', title: 'שינוי רקע כפעולה', teacher: 'משנים או מוסיפים בלוק רקע ומראים document.body.style.background.', students: 'בודקים איך פעולה יכולה לשנות עיצוב בזמן אמת.' },
      { minutes: '62–76', title: 'מצב קסם כמתג', teacher: 'מוסיפים בלוק classList.toggle ומסבירים: לחיצה אחת מדליקה, לחיצה שנייה מכבה.', students: 'לוחצים כמה פעמים ומזהים מצב דולק/כבוי.' },
      { minutes: '76–84', title: 'הצצה לקוד שנוצר', teacher: 'בוחרים כל בלוק ורואים את השורה המודגשת ב־HTML/CSS/JS.', students: 'מסבירים: הבלוק שלי יצר את השורה הזאת.' },
      { minutes: '84–90', title: 'תערוכת קסמים', teacher: 'מבקשים מכל תלמיד לשתף קישור ציבורי ולהציג פעולה אחת.', students: 'מציגים עמוד ואומרים מה משתנה בלחיצה.' }
    ],
    exercises: [
      { id: 1, minutes: '0–5', title: 'תרגול 1 — וואו תוך שתי דקות', prompt: 'לחצו הרצה, לחצו על הכפתור בתצוגה, וגלו מה השתנה במסך.', hint: 'חפשו שינוי הודעה או שינוי רקע — לא צריך להבין עדיין את כל הקוד.', check: { htmlIncludes: ['onclick="showMessage()"'], jsIncludes: ['function showMessage', 'document.body.style.background'] } },
      { id: 2, minutes: '5–12', title: 'תרגול 2 — משנים קסם קטן', prompt: 'שנו את בחירת הרקע או את טקסט הכפתור, הריצו שוב ולחצו.', hint: 'בגיל הזה קודם משחקים עם התוצאה, ורק אחר כך נותנים שם מקצועי לפעולה.', check: { htmlIncludes: ['button'], jsIncludes: ['document.body.style.background'] } },
      { id: 3, minutes: '12–22', title: 'תרגול 3 — מוצאים את הכפתור בקוד', prompt: 'בחרו את בלוק הכפתור וראו איזה HTML מסומן בקוד.', hint: 'חפשו onclick="showMessage()".', check: { htmlIncludes: ['onclick="showMessage()"'], jsIncludes: ['function showMessage'] } },
      { id: 4, minutes: '22–34', title: 'תרגול 4 — הודעה בלחיצה', prompt: 'גררו בלוק “בלחיצה שנה הודעה”, כתבו הודעה משלכם, הריצו ולחצו על הכפתור.', hint: 'הבלוק משנה את message.textContent.', check: { jsIncludes: ['message.textContent'] } },
      { id: 5, minutes: '34–46', title: 'תרגול 5 — שינוי סמל', prompt: 'גררו בלוק “בלחיצה שנה סמל” ובחרו אימוג׳י חדש.', hint: 'צריך להיות בעמוד בלוק סמל כדי שיהיה מה לשנות.', check: { htmlIncludes: ['id="heroEmoji"'], jsIncludes: ['heroEmoji.textContent'] } },
      { id: 6, minutes: '46–58', title: 'תרגול 6 — שינוי רקע', prompt: 'שנו את בלוק הרקע או גררו בלוק “בלחיצה שנה רקע” אם הוא לא מחובר, ואז לחצו ובדקו.', hint: 'חפשו document.body.style.background.', check: { jsIncludes: ['document.body.style.background'] } },
      { id: 7, minutes: '58–72', title: 'תרגול 7 — מצב קסם', prompt: 'גררו בלוק “בלחיצה החלף מצב קסם”, הריצו ולחצו כמה פעמים.', hint: 'toggle מדליק ומכבה class.', check: { cssIncludes: ['.page-card.magic'], jsIncludes: ['classList.toggle("magic")'] } },
      { id: 8, minutes: '72–84', title: 'תרגול 8 — מסמנים קוד מבלוק ומשתפים', prompt: 'בחרו בלוק פעולה, ראו באיזה טאב הקוד מסומן, ואז העתיקו קישור ציבורי לתוצר.', hint: 'בלוקי פעולה אמורים להוביל בעיקר ל־JavaScript.', check: { htmlIncludes: ['page-card'], cssIncludes: ['.page-card'], jsIncludes: ['function showMessage'] } }
    ],
    vocabulary: [
      ['event', 'משהו שקורה בעמוד, למשל לחיצה'],
      ['onclick', 'הוראה ב־HTML: כשיש לחיצה, הפעל פונקציה'],
      ['function', 'קבוצת פעולות עם שם שאפשר להפעיל'],
      ['textContent', 'שינוי הטקסט שבתוך אלמנט'],
      ['style', 'שינוי עיצוב דרך JavaScript בזמן אמת'],
      ['classList.toggle', 'להדליק או לכבות class בלחיצה']
    ],
    aiHelper: [
      'הציעו שלושה רעיונות מצחיקים לעמוד שמשתנה בלחיצה.',
      'הסבירו לילד מה הקשר בין onclick לבין function showMessage.',
      'עזרו לתלמיד להבין למה צריך id כדי לשנות אימוג׳י או הודעה.',
      'תנו רעיון לשדרוג שמשנה גם טקסט, גם סמל וגם רקע בלחיצה.'
    ]
  });

  Object.assign(lessons[1], {
    title: 'סטודיו עיצוב — מעצבים עמוד עם Blockly',
    concept: 'Blockly אמיתי → CSS: צבעים · צורה · צל · Hover',
    story: 'אחרי שבשיעור 1 הילדים בנו עמוד מבלוקים, שיעור 2 הופך אותם למעצבי UI: גוררים בלוקי עיצוב, משנים את התחושה של אותו עמוד, ורואים איך CSS נוצר אוטומטית מאחור.',
    mission: 'לעצב עמוד אישי בעזרת בלוקי Design Studio: פלטת צבעים, צורת כרטיס, צל, צבע כותרת, סגנון כפתור ואפקט מעבר עכבר.',
    outcome: 'עמוד מעוצב ב־Blockly אמיתי, עם הבנה ראשונה ש־CSS משנה את החוויה בלי לשנות את המבנה',
    mode: 'Real Blockly design studio',
    realBlocklyBuilder: true,
    lessonFlow: [
      { minutes: '0–8', title: 'פתיחה: אותו מבנה, תחושה אחרת', teacher: 'מציגים את העמוד משיעור 1 ושואלים מה גורם לו להרגיש שמח, רציני, משחקי או רגוע.', students: 'מזהים צבע, צורה, צל, כפתור ותנועה.' },
      { minutes: '8–18', title: 'פלטת עיצוב', teacher: 'גוררים בלוק “עיצוב עמוד” ובוחרים חלל/ארקייד/שקיעה/שמיים.', students: 'רואים שהעמוד משתנה בלי למחוק שום תוכן.' },
      { minutes: '18–32', title: 'צורת כרטיס וצל', teacher: 'מוסיפים בלוק צורת כרטיס ובלוק צל. מדגישים border-radius ו־box-shadow כהצצה.', students: 'משווים בין כרטיס עגול, חד, ענק או בועת קומיקס.' },
      { minutes: '32–45', title: 'כותרת וכפתור', teacher: 'מוסיפים צבע כותרת וסגנון כפתור. מסבירים שהכפתור הוא גם עיצוב וגם פעולה.', students: 'בוחרים סגנון שמתאים לנושא שלהם.' },
      { minutes: '45–58', title: 'Hover — תגובה עדינה', teacher: 'מדגימים אפקט מעבר עכבר: גדל, קופץ או מחליף צבע.', students: 'בודקים בתצוגה החיה מה קורה כשעוברים על הכפתור.' },
      { minutes: '58–72', title: 'משימת מעצב/ת', teacher: 'נותנים לתלמידים לבנות שני עיצובים שונים לאותו עמוד: רגוע ומשחקי.', students: 'משנים בלוקים, מריצים, ומשווים תוצאה.' },
      { minutes: '72–82', title: 'הצצה ל־CSS שנוצר', teacher: 'פותחים “לראות קוד שנוצר” ומצביעים על background, border-radius, box-shadow, button:hover.', students: 'מחברים בין בלוק עיצוב לשורת CSS.' },
      { minutes: '82–90', title: 'גלריית עיצובים ושיתוף', teacher: 'מבקשים מכל תלמיד להעתיק קישור ציבורי ולשתף תוצר אחד.', students: 'מציגים בחירה עיצובית אחת ומסבירים למה בחרו אותה.' }
    ],
    exercises: [
      { id: 1, minutes: '8–16', title: 'תרגול 1 — מתחילים פשוט', prompt: 'העמוד מתחיל רק עם עיצוב בסיסי, כותרת ופסקה. שנו את פלטת העיצוב ובדקו מה השתנה.', hint: 'בהתחלה אין הרבה בלוקים — זה בכוונה. נבנה את העיצוב בשלבים.', check: { cssIncludes: ['background:'] } },
      { id: 2, minutes: '16–25', title: 'תרגול 2 — מוסיפים בלוק ראשון', prompt: 'עכשיו גררו בעצמכם בלוק “צורת כרטיס” וחברו אותו לשרשרת.', hint: 'זה הבלוק הראשון שהתלמיד מוסיף לבד ל־starter הפשוט.', check: { cssIncludes: ['border-radius'] } },
      { id: 3, minutes: '25–34', title: 'תרגול 3 — מוסיפים עומק', prompt: 'גררו בלוק “צל כרטיס”, חברו אותו אחרי צורת הכרטיס, ובחרו צל.', hint: 'צל ב־CSS נקרא box-shadow.', check: { cssIncludes: ['box-shadow'] } },
      { id: 4, minutes: '34–43', title: 'תרגול 4 — צבע כותרת', prompt: 'חברו בלוק “צבע כותרת” ובחרו צבע שמתאים לפלטה.', hint: 'הכותרת היא h1.', check: { cssIncludes: ['h1 { color:'] } },
      { id: 5, minutes: '43–52', title: 'תרגול 5 — סגנון כפתור', prompt: 'חברו בלוק “סגנון כפתור” ובחרו גלולה, קובייה, ניאון או עדין.', hint: 'הכפתור משתנה דרך background, border-radius ו־box-shadow.', check: { cssIncludes: ['button {', 'border-radius'] } },
      { id: 6, minutes: '52–62', title: 'תרגול 6 — אפקט Hover', prompt: 'חברו בלוק “אפקט מעבר עכבר” ובדקו מה קורה כשעוברים על הכפתור.', hint: 'Hover הוא עיצוב שקורה רק כשעוברים עם העכבר.', check: { cssIncludes: ['button:hover'] } },
      { id: 7, minutes: '62–74', title: 'תרגול 7 — שני מצבי עיצוב', prompt: 'צרו גרסה רגועה ואז גרסה משחקית לאותו עמוד. איזה בלוקים החלפתם?', hint: 'אל תשנו תוכן — רק בלוקי עיצוב.', check: { htmlIncludes: ['page-card'], cssIncludes: ['.page-card'] } },
      { id: 8, minutes: '74–84', title: 'תרגול 8 — משתפים גלריה', prompt: 'פתחו “לראות קוד שנוצר”, מצאו שורת CSS אחת, ואז העתיקו קישור ציבורי ושלחו לחבר/ה.', hint: 'הסבירו: הבלוק שלי יצר את שורת ה־CSS הזו.', check: { cssIncludes: ['background', 'box-shadow'], jsIncludes: ['showMessage'] } }
    ],
    vocabulary: [
      ['CSS', 'שפת העיצוב: צבעים, צורות, ריווח ותנועה'],
      ['background', 'צבע או רקע של העמוד'],
      ['border-radius', 'כמה הפינות של הכרטיס עגולות'],
      ['box-shadow', 'צל שמוסיף עומק לכרטיס'],
      ['hover', 'מה קורה כשעוברים עם העכבר מעל כפתור'],
      ['UI', 'איך הממשק נראה ומרגיש למשתמש']
    ],
    aiHelper: [
      'הציעו פלטת צבעים לעמוד בנושא חלל / גיימינג / טבע / מוזיקה.',
      'עזרו לילד להסביר מה ההבדל בין מבנה HTML לעיצוב CSS.',
      'הציעו שני סגנונות שונים לאותו עמוד: רגוע ומשחקי.',
      'תנו רעיון לכפתור עם הודעה שמתאימה לעיצוב שנבחר.'
    ]
  });

  Object.assign(lessons[0], {
    title: 'בונים עמוד עם Blockly אמיתי — גוררים, מחברים, מרכיבים',
    concept: 'Blockly אמיתי → הרכבת עמוד Web: מבנה · עיצוב · פעולה',
    story: 'הפעם לא לוחצים על כפתורי דמו־בלוקים ולא מתחילים מקוד. הילדים עובדים בסביבת Google Blockly אמיתית: גוררים בלוקים מארגז כלים, מחברים אותם מתחת ל“עמוד האתר שלי”, וכל שינוי בונה עמוד חי בתצוגה.',
    mission: 'להרכיב עמוד אישי שלם ב־Blockly: כותרת, פסקה, סמל, עיצוב, כפתור, קוביות מידע וחתימה — ואז לראות את הקוד שנוצר רק כהצצה.',
    outcome: 'עמוד Web אישי שנבנה מבלוקים נגררים ומחוברים, עם תצוגה חיה וקוד שנוצר אוטומטית מאחור',
    mode: 'Real Blockly page builder',
    realBlocklyBuilder: true,
    lessonFlow: [
      { minutes: '0–8', title: 'פתיחה: היום לא כותבים קוד', teacher: 'פותחים את סביבת Blockly ומדגישים: העבודה היא גרירה וחיבור. הקוד בצד הוא “מאחורי הקלעים”.', students: 'מזהים toolbox, אזור עבודה, בלוק התחלה ותצוגה חיה.' },
      { minutes: '8–18', title: 'בלוק התחלה ושרשרת', teacher: 'מראים שהבלוקים חייבים להתחבר מתחת ל“עמוד האתר שלי” כמו שרשרת.', students: 'מזיזים בלוק, מחברים אותו, ורואים שהתצוגה מתעדכנת.' },
      { minutes: '18–32', title: 'מרכיבים שלד עמוד', teacher: 'גוררים יחד כותרת, פסקה וסמל. משנים טקסט בתוך הבלוק עצמו.', students: 'בונים עמוד ראשון בלי לגעת ב־HTML.' },
      { minutes: '32–45', title: 'עיצוב דרך בלוק', teacher: 'גוררים “עיצוב עמוד” ובוחרים פלטה: שמיים, חלל, ארקייד או שקיעה.', students: 'משווים איך אותו עמוד מקבל אופי אחר רק מבלוק עיצוב.' },
      { minutes: '45–60', title: 'אינטראקציה דרך בלוק כפתור', teacher: 'מוסיפים בלוק כפתור עם טקסט והודעה. מדגימים לחיצה בתצוגה.', students: 'מבינים שכפתור הוא פעולה, אבל לא כותבים JavaScript.' },
      { minutes: '60–74', title: 'קומפוזיציה: קוביות מידע וחתימה', teacher: 'מוסיפים בלוק שתי קוביות ובלוק חתימה כדי להפוך את העמוד לתוצר שלם.', students: 'מסדרים מחדש בלוקים ורואים שסדר הבלוקים משנה את סדר העמוד.' },
      { minutes: '74–84', title: 'הצצה לקוד שנוצר', teacher: 'פותחים לרגע את הצצה לקוד ומראים: הבלוקים יצרו HTML/CSS/JS.', students: 'מצביעים על שורה אחת שנוצרה מבלוק שהם חיברו.' },
      { minutes: '84–90', title: 'מיני תערוכה', teacher: 'מבקשים מכל תלמיד להציג בלוק אחד שבחר ולמה.', students: 'מציגים עמוד ומסבירים: “חיברתי בלוק ___ ולכן בעמוד קרה ___”.' }
    ],
    exercises: [
      { id: 1, minutes: '8–16', title: 'תרגול 1 — מחברים בלוק כותרת', prompt: 'גררו בלוק “כותרת” וחברו אותו מתחת ל“עמוד האתר שלי”. שנו את הטקסט בתוך הבלוק.', hint: 'הבלוק חייב להיצמד לבלוק שמעליו, כמו פאזל.', check: { htmlIncludes: ['<h1>'] } },
      { id: 2, minutes: '16–24', title: 'תרגול 2 — מוסיפים פסקה', prompt: 'גררו בלוק “פסקה”, חברו אותו מתחת לכותרת, וכתבו משפט על העמוד שלכם.', hint: 'אם הפסקה לא מופיעה — היא כנראה לא מחוברת לשרשרת.', check: { htmlIncludes: ['<p>'] } },
      { id: 3, minutes: '24–32', title: 'תרגול 3 — בוחרים סמל גדול', prompt: 'גררו או השאירו בלוק “סמל גדול” ובחרו אימוג׳י שמתאים לעמוד.', hint: 'זה בלוק תוכן ויזואלי, לא קוד.', check: { htmlIncludes: ['hero-emoji'] } },
      { id: 4, minutes: '32–42', title: 'תרגול 4 — מחליפים עיצוב', prompt: 'גררו בלוק “עיצוב עמוד” ובחרו פלטה אחרת מהתפריט.', hint: 'אותו עמוד יכול להיראות אחרת לגמרי עם בלוק עיצוב אחד.', check: { cssIncludes: ['background:', 'box-shadow'] } },
      { id: 5, minutes: '42–54', title: 'תרגול 5 — כפתור עם הודעה', prompt: 'חברו בלוק “כפתור” ושנו גם את טקסט הכפתור וגם את ההודעה שהוא מציג.', hint: 'אחרי הרצה, לחצו על הכפתור בתצוגה החיה.', check: { htmlIncludes: ['onclick="showMessage()"'], jsIncludes: ['function showMessage'] } },
      { id: 6, minutes: '54–64', title: 'תרגול 6 — שתי קוביות מידע', prompt: 'גררו בלוק “שתי קוביות מידע” וכתבו שני רעיונות/תחביבים/עובדות.', hint: 'זה מלמד שהעמוד בנוי מחלקים, לא משורה אחת.', check: { htmlIncludes: ['class="columns"'], cssIncludes: ['grid-template-columns'] } },
      { id: 7, minutes: '64–74', title: 'תרגול 7 — חתימה וסדר', prompt: 'הוסיפו בלוק חתימה. אחר כך נסו להזיז אותו למקום אחר בשרשרת וראו מה משתנה.', hint: 'סדר הבלוקים הוא סדר האלמנטים בעמוד.', check: { htmlIncludes: ['<footer>'] } },
      { id: 8, minutes: '74–84', title: 'תרגול 8 — הצצה לקוד', prompt: 'פתחו “הצצה לקוד שנוצר” ומצאו איפה הבלוק שלכם הפך ל־HTML או CSS.', hint: 'לא צריך לערוך קוד. רק לזהות: הבלוק שלי יצר את השורה הזו.', check: { htmlIncludes: ['page-card'], cssIncludes: ['.page-card'], jsIncludes: ['textContent'] } }
    ],
    vocabulary: [
      ['workspace', 'אזור העבודה שבו גוררים ומחברים בלוקים'],
      ['toolbox', 'ארגז הכלים שממנו לוקחים בלוקים'],
      ['stack', 'שרשרת בלוקים מחוברים לפי סדר'],
      ['HTML', 'המבנה שהבלוקים בנו עבור הדפדפן'],
      ['CSS', 'העיצוב שהבלוקים בחרו עבור העמוד'],
      ['JavaScript', 'הפעולה שהבלוק של הכפתור יצר']
    ],
    aiHelper: [
      'הציעו 5 רעיונות לעמוד אישי שילד בכיתה ד׳ יכול לבנות בבלוקים.',
      'עזרו לילד להסביר למה בלוק לא משפיע אם הוא לא מחובר לשרשרת.',
      'הציעו טקסטים קצרים לכותרת, פסקה וכפתור בעמוד אישי.',
      'תנו רעיון יצירתי לעמוד “כרטיס גיבור/ה” שנבנה רק מבלוקים.'
    ]
  });

  window.WEBCODE_LESSONS = lessons;
  window.getWebCodeLesson = function (id) {
    const numeric = Number(id) || 1;
    return lessons.find(l => l.id === numeric) || lessons[0];
  };
})();
