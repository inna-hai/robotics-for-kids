(function () {
  const lessons = [
    {
      id: 1,
      title: 'העמוד הראשון שלי — בלוקים שבונים אתר',
      concept: 'גשר מ־Blockly ל־Web: בלוק → קוד → תוצאה',
      durationMinutes: 90,
      story: 'פותחים מעבדת WebCode בצורה מוכרת מכיתה ג׳: קודם לוחצים על בלוקי Web שבונים כרטיס אישי, אחר כך רואים איזה HTML/CSS/JavaScript נוצר מאחורי הקלעים.' ,
      mission: 'לבנות כרטיס אישי ראשון בעזרת בלוקי Web: כותרת, משפט, צבע, כפתור והצגת הודעה בלחיצה.' ,
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
        { minutes: '50–66', title: 'תרגיל עצמאי עם בלוקים', teacher: 'נותנים לתלמידים להשלים את הכרטיס בעזרת בלוקי Web ורק שינויי טקסט קטנים.', students: 'מבצעים תרגילים 1–5 בלי לכתוב קוד חופשי.' },
        { minutes: '66–78', title: 'שינוי קטן בקוד', teacher: 'מאפשרים שינוי בטוח אחד: טקסט בכותרת או הודעת כפתור, לא מבנה חדש.', students: 'משנים מילים בתוך הקוד, מריצים, ומתקנים בעזרת רמזים אם נשבר.' },
        { minutes: '78–90', title: 'הצגה וסיכום הגשר', teacher: 'מסכמים: בלוק הוא דרך נוחה לבנות; קוד הוא מה שהדפדפן קורא.', students: 'מציגים כרטיס ואומרים: “הבלוק שבחרתי שינה את ___ בקוד”.' }
      ],
      exercises: [
        { id: 1, minutes: '18–24', title: 'תרגיל 1 — מפעילים בלוק מבנה', prompt: 'לחצו על הבלוק “צור כרטיס אישי”, הריצו, ובדקו מה השתנה בכותרת.', hint: 'אל תכתבו קוד עדיין — רק לחצו על הבלוק והסתכלו על HTML.', check: { htmlIncludes: ['מפתח/ת צעיר/ה'] } },
        { id: 2, minutes: '24–30', title: 'תרגיל 2 — בלוק משפט אישי', prompt: 'הפעילו בלוק שמחליף את המשפט בכרטיס, ואז מצאו את המשפט בתוך HTML.', hint: 'המשפט נמצא בתוך תגית <p>.', check: { htmlIncludes: ['ליצור דברים בדפדפן'] } },
        { id: 3, minutes: '30–38', title: 'תרגיל 3 — בלוק צבע רקע', prompt: 'הפעילו בלוק עיצוב שמשנה צבע רקע, ואז עברו ללשונית CSS וראו את background.', hint: 'CSS אחראי לאיך האתר נראה.', check: { cssIncludes: ['background: #fef3c7'] } },
        { id: 4, minutes: '38–46', title: 'תרגיל 4 — בלוק כפתור', prompt: 'הפעילו בלוק שמשנה את טקסט הכפתור ל“גלו הודעה”.', hint: 'הכפתור עדיין מפעיל onclick, אבל אנחנו משנים רק את הטקסט שלו.', check: { htmlIncludes: ['גלו הודעה', 'onclick="sayHello()"'] } },
        { id: 5, minutes: '46–56', title: 'תרגיל 5 — בלוק הצגת הודעה', prompt: 'הפעילו בלוק שמציג הודעה חדשה אחרי לחיצה על הכפתור.', hint: 'זו הצצה ל־JavaScript: הוא משנה textContent.', check: { jsIncludes: ['ברוכים הבאים לאתר הראשון שלי'] } },
        { id: 6, minutes: '56–66', title: 'תרגיל 6 — שינוי בטוח בקוד', prompt: 'עכשיו מותר לשנות רק מילה אחת בתוך הכותרת או המשפט. הריצו ובדקו.', hint: 'שנו טקסט בין תגיות, לא את הסימנים < >.', check: { htmlIncludes: ['<h1', '<p'] } },
        { id: 7, minutes: '66–76', title: 'תרגיל 7 — דיבאג עדין', prompt: 'אם משהו נשבר, לחצו איפוס או בדקו שלא מחקתם גרשיים/סוגריים. נסו לתקן בעזרת הרמז.', hint: 'בשיעור 1 מתקנים רק טקסט ו־id, לא כותבים פונקציה חדשה.', check: { htmlIncludes: ['id="message"'], jsIncludes: ['getElementById("message")'] } },
        { id: 8, minutes: '76–84', title: 'תרגיל 8 — הצגת הכרטיס', prompt: 'תנו לחבר/ה ללחוץ על הכפתור ולהגיד איזה בלוק הכי שינה את הכרטיס.', hint: 'הסבירו במילים: הבלוק הזה שינה HTML / CSS / JavaScript.', check: { htmlIncludes: ['button'], cssIncludes: ['border-radius'], jsIncludes: ['textContent'] } }
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
        html: '<main class="profile-card">\n  <div class="avatar">🚀</div>\n  <h1>דניאל המפתח</h1>\n  <p class="tagline">אני בונה דברים קטנים שעובדים בדפדפן.</p>\n  <ul>\n    <li>נושא: משחקים</li>\n    <li>כוח מיוחד: רעיונות</li>\n    <li>יעד: לבנות אתר משלי</li>\n  </ul>\n  <button onclick="changeMood()">שנו מצב רוח</button>\n  <p id="mood">מצב רוח: מוכן לקוד</p>\n</main>',
        css: 'body {\n  font-family: Arial, sans-serif;\n  direction: rtl;\n  text-align: center;\n  background: linear-gradient(135deg, #dbeafe, #fff7ed);\n}\n\n.profile-card {\n  background: white;\n  width: 360px;\n  margin: 45px auto;\n  padding: 28px;\n  border-radius: 28px;\n  box-shadow: 0 16px 35px #bfdbfe;\n}\n\n.avatar {\n  font-size: 56px;\n}\n\n.tagline {\n  color: #475569;\n}\n\nul {\n  text-align: right;\n  line-height: 1.8;\n}\n\nbutton {\n  background: #f97316;\n  color: white;\n  border: 0;\n  border-radius: 999px;\n  padding: 12px 20px;\n  font-weight: bold;\n}\n\nbutton:hover {\n  background: #2563eb;\n}',
        js: 'function changeMood() {\n  document.getElementById("mood").textContent = "מצב רוח: העיצוב עובד ✨";\n}'
      },
      lessonFlow: [
        { minutes: '0–8', title: 'פתיחה: עיצוב הוא הוראות', teacher: 'מציגים את הכרטיס משיעור 1 ושואלים מה אפשר לשנות בלי לשנות את התוכן.', students: 'מזהים צבע, גודל, ריווח, עיגול כפתור ואימוג׳י.' },
        { minutes: '8–18', title: 'בלוק עיצוב ראשון', teacher: 'לוחצים יחד על בלוק “פלטת צבעים” ומראים ששורת background ב־CSS השתנתה.', students: 'רואים שבלוק עיצוב משנה CSS, לא HTML.' },
        { minutes: '18–34', title: 'בנייה מודרכת בבלוקי CSS', teacher: 'מפעילים בלוקים: בחר דמות, פלטת צבעים, כפתור משתנה.', students: 'לוחצים על בלוקים, מריצים, ומתארים מה השתנה ויזואלית.' },
        { minutes: '34–50', title: 'קוראים CSS בעיניים', teacher: 'לא כותבים CSS חופשי. רק מזהים מילים: background, padding, border-radius, button.', students: 'מסמנים איפה ב־CSS מופיעים צבע, ריווח וצורת כפתור.' },
        { minutes: '50–66', title: 'תרגיל עצמאי בבלוקים', teacher: 'נותנים לתלמידים לבחור בלוקי עיצוב ולהשלים כרטיס אישי.', students: 'מבצעים תרגילים 1–5 בעזרת בלוקים ושינויים קטנים בלבד.' },
        { minutes: '66–78', title: 'Hover כהפתעה', teacher: 'מדגימים אפקט מעבר עכבר כבלוק מוכן, בלי להעמיס סינטקס.', students: 'מפעילים/משנים hover ובודקים מה קורה לכפתור.' },
        { minutes: '78–90', title: 'גלריית עיצוב', teacher: 'מבקשים מכל תלמיד להסביר החלטת עיצוב אחת והקוד שהיא שינתה.', students: 'מציגים כרטיס ואומרים: “הבלוק הזה שינה את ___ ב־CSS”.' }
      ],
      exercises: [
        { id: 1, minutes: '18–24', title: 'תרגיל 1 — בלוק דמות', prompt: 'לחצו על בלוק “בחר דמות” ובדקו שהאימוג׳י בכרטיס השתנה.', hint: 'הבלוק משנה HTML קטן בתוך class="avatar".', check: { htmlIncludes: ['🎮'] } },
        { id: 2, minutes: '24–31', title: 'תרגיל 2 — בלוק פלטת צבעים', prompt: 'הפעילו בלוק פלטת צבעים ואז מצאו את linear-gradient ב־CSS.', hint: 'לא כותבים גרדיאנט לבד — רק רואים איפה הוא נוצר.', check: { cssIncludes: ['#fdf2f8', '#dcfce7'] } },
        { id: 3, minutes: '31–39', title: 'תרגיל 3 — בלוק כפתור', prompt: 'הפעילו בלוק שמשנה את צבע הכפתור.', hint: 'הבלוק משנה background בתוך button.', check: { cssIncludes: ['background: #7c3aed'] } },
        { id: 4, minutes: '39–48', title: 'תרגיל 4 — קוראים CSS', prompt: 'מצאו בקוד CSS שלושה דברים: background, padding, border-radius.', hint: 'אלה מילים של עיצוב: צבע, ריווח ועיגול.', check: { cssIncludes: ['background', 'padding', 'border-radius'] } },
        { id: 5, minutes: '48–57', title: 'תרגיל 5 — שינוי טקסט בטוח', prompt: 'שנו רק פריט אחד ברשימת הפרטים שלכם.', hint: 'שנו מילים בתוך <li>, לא את הסימנים.', check: { htmlIncludes: ['<li>'] } },
        { id: 6, minutes: '57–66', title: 'תרגיל 6 — בלוק Hover', prompt: 'הפעילו בלוק שמוסיף אפקט לכפתור במעבר עכבר.', hint: 'חפשו button:hover ב־CSS.', check: { cssIncludes: ['button:hover', 'transform: scale'] } },
        { id: 7, minutes: '66–76', title: 'תרגיל 7 — דיבאג CSS עדין', prompt: 'אם עיצוב נשבר, בדקו נקודה לפני class וסוגריים מסולסלים.', hint: 'class ב־CSS מתחיל בנקודה, למשל .profile-card.', check: { cssIncludes: ['.profile-card'] } },
        { id: 8, minutes: '76–84', title: 'תרגיל 8 — גלריית עיצוב', prompt: 'הציגו לחבר/ה איזה בלוק עיצוב הכי שינה את הכרטיס שלכם.', hint: 'הסבירו: הבלוק שינה צבע / צורה / תנועה.', check: { htmlIncludes: ['class="avatar"'], cssIncludes: ['button', 'background'] } }
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
        { minutes: '50–66', title: 'תרגיל עצמאי עם בלוקים', teacher: 'נותנים לתלמידים להפעיל בלוקי פעולה ולשנות טקסטים בטוחים.', students: 'מבצעים תרגילים 1–5 בלי להמציא סינטקס חדש.' },
        { minutes: '66–78', title: 'Toggle כמתג', teacher: 'מדגימים את בלוק “הדלק/כבה עיצוב” כמתג שמוסיף ומסיר class.', students: 'לוחצים כמה פעמים ומבינים שיש מצב דולק/כבוי.' },
        { minutes: '78–90', title: 'הצגת שרשרת פעולה', teacher: 'מבקשים מכל תלמיד להסביר שרשרת אחת: בלוק → כפתור → פונקציה → שינוי במסך.', students: 'מציגים מצב אחד שבנו ומסבירים אותו במילים.' }
      ],
      exercises: [
        { id: 1, minutes: '18–24', title: 'תרגיל 1 — בלוק מצב שמח', prompt: 'הפעילו את בלוק “מצב שמח”, הריצו, ולחצו על הכפתור.', hint: 'הבלוק משנה טקסט בתוך function makeHappy.', check: { jsIncludes: ['מצב שמח הופעל'] } },
        { id: 2, minutes: '24–31', title: 'תרגיל 2 — בלוק מצב רובוט', prompt: 'הפעילו את בלוק “מצב רובוט” ובדקו שההודעה השתנתה.', hint: 'חפשו את function makeRobot.', check: { jsIncludes: ['הרובוט התחיל לעבוד'] } },
        { id: 3, minutes: '31–39', title: 'תרגיל 3 — בלוק מצב קסם', prompt: 'הפעילו בלוק שמשנה את העיצוב של מצב הקסם.', hint: 'הבלוק משנה CSS בתוך .magic.', check: { cssIncludes: ['border: 4px solid #7c3aed'] } },
        { id: 4, minutes: '39–48', title: 'תרגיל 4 — מצאו את onclick', prompt: 'עברו ל־HTML ומצאו איפה הכפתור קורא לפונקציה.', hint: 'חפשו onclick="makeHappy()" או onclick="makeRobot()".', check: { htmlIncludes: ['onclick="makeHappy()"', 'onclick="makeRobot()"'] } },
        { id: 5, minutes: '48–57', title: 'תרגיל 5 — מצאו את function', prompt: 'עברו ל־JavaScript ומצאו function עם אותו שם כמו הכפתור.', hint: 'שם ב־onclick ושם ב־function חייבים להיות זהים.', check: { jsIncludes: ['function makeHappy', 'function makeRobot'] } },
        { id: 6, minutes: '57–66', title: 'תרגיל 6 — בלוק Toggle', prompt: 'הפעילו את בלוק הדלק/כבה עיצוב ובדקו את classList.toggle.', hint: 'זה מתג: לחיצה אחת מדליקה, לחיצה נוספת מכבה.', check: { jsIncludes: ['classList.toggle("magic")'] } },
        { id: 7, minutes: '66–76', title: 'תרגיל 7 — דיבאג שם פעולה', prompt: 'אם כפתור לא עובד, בדקו שהשם ב־onclick זהה לשם ה־function.', hint: 'לא מוסיפים פונקציה חדשה בשיעור הזה — רק מתקנים שמות.', check: { htmlIncludes: ['makeRobot()'], jsIncludes: ['function makeRobot'] } },
        { id: 8, minutes: '76–84', title: 'תרגיל 8 — הצגת מצב', prompt: 'בחרו כפתור אחד והסבירו: איזה בלוק שינה אותו ומה קורה בלחיצה.', hint: 'השתמשו במילים: בלוק, כפתור, פונקציה, שינוי במסך.', check: { htmlIncludes: ['button'], jsIncludes: ['function', 'textContent'] } }
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
      story: 'השיעור נפתח כמו קסם אישי: מקלידים שם ונושא מצחיק, לוחצים על כפתור, והאתר עונה משפט אישי. רק אחרי שהילדים צוחקים מהתוצאה מסבירים איך JavaScript קורא value מתוך input.' ,
      mission: 'לבנות מחולל אישי וכיפי: המשתמש כותב שם ונושא לברכה, לוחץ על כפתור, והעמוד מחזיר ברכה מצחיקה שמבוססת על מה שהוקלד.' ,
      outcome: 'מחולל אישי שמרגיש כמו מיני־אפליקציה: input, id, value, שרשור טקסט ותוצאה שמתאימה למשתמש',
      starter: {
        html: '<main class="generator">\n  <div class="badge">✨ מחולל אישי</div>\n  <h1>מחולל הברכות המצחיקות שלי</h1>\n  <p class="intro">כתבו שם ונושא לברכה, והאתר ימציא לכם ברכה אישית.</p>\n  <label>שם גיבור/ה:\n    <input id="nameInput" placeholder="כתבו שם">\n  </label>\n  <label>נושא לברכה:\n    <input id="hobbyInput" placeholder="למשל: רובוטים">\n  </label>\n  <button onclick="makeGreeting()">צרו ברכה מצחיקה</button>\n  <p id="result">כאן תופיע הברכה האישית...</p>\n</main>',
        css: 'body {\n  font-family: Arial, sans-serif;\n  direction: rtl;\n  text-align: center;\n  background: linear-gradient(135deg, #ecfeff, #fdf2f8 55%, #fef3c7);\n}\n\n.generator {\n  background: white;\n  width: min(430px, 92vw);\n  margin: 38px auto;\n  padding: 28px;\n  border-radius: 32px;\n  box-shadow: 0 18px 42px #bae6fd;\n}\n\n.badge {\n  display: inline-block;\n  background: #ede9fe;\n  color: #6d28d9;\n  border-radius: 999px;\n  padding: 7px 14px;\n  font-weight: bold;\n}\n\n.intro {\n  color: #475569;\n}\n\nlabel {\n  display: block;\n  margin: 14px;\n  font-weight: bold;\n}\n\ninput {\n  display: block;\n  width: 100%;\n  margin-top: 6px;\n  padding: 12px;\n  border: 2px solid #cbd5e1;\n  border-radius: 14px;\n  text-align: center;\n  font-size: 16px;\n}\n\nbutton {\n  background: #7c3aed;\n  color: white;\n  border: 0;\n  border-radius: 999px;\n  padding: 13px 22px;\n  font-weight: bold;\n  cursor: pointer;\n}\n\n#result {\n  background: #fff7ed;\n  border: 2px dashed #fb923c;\n  border-radius: 20px;\n  padding: 16px;\n  min-height: 56px;\n  font-weight: bold;\n}',
        js: 'function makeGreeting() {\n  const name = document.getElementById("nameInput").value;\n  const topic = document.getElementById("hobbyInput").value;\n  document.getElementById("result").textContent = name + ", הנה ברכה מצחיקה על " + topic + ": שתמיד יהיו לך רעיונות נוצצים 🚀";\n}'
      },
      lessonFlow: [
        { minutes: '0–4', title: 'וואו אישי: האתר עונה לי', teacher: 'פותחים בהרצה חיה: מקלידים שם ונושא מצחיק לברכה, לוחצים, ונותנים לכיתה לצחוק מהמשפט שנוצר.', students: 'רואים שהאתר השתמש במה שהוקלד ולא בתשובה קבועה.' },
        { minutes: '4–12', title: 'זוגות ממציאים קלטים', teacher: 'מבקשים מכל זוג לנסות שם ונושא אחרים לפני שמדברים על קוד.', students: 'מקלידים, לוחצים ומשווים איזה משפט יצא הכי מצחיק.' },
        { minutes: '12–22', title: 'מה האתר קרא?', teacher: 'מצביעים על שני השדות ושואלים: מאיפה הקוד לקח את השם? מאיפה את הנושא לברכה?', students: 'מסמנים שדה שם, שדה נושא ותוצאה.' },
        { minutes: '22–36', title: 'כלי עזר לקלט בטוח', teacher: 'מפעילים כלי עזר: שדה שם, שדה נושא וצור משפט אישי.', students: 'משנים טקסטים גלויים ואת נוסח המשפט בלי לשבור id.' },
        { minutes: '36–52', title: 'מציצים לקוד שקורא קלט', teacher: 'לא כותבים getElementById לבד. רק מזהים id ב־HTML ו־value ב־JS.', students: 'מחברים בין id="nameInput" לבין getElementById("nameInput").value.' },
        { minutes: '52–68', title: 'מחוללים לפי נושא', teacher: 'נותנים נושאים: מחולל כוח־על, מחולל שם רובוט, מחולל ברכת יומולדת, מחולל משימת חלל.', students: 'בוחרים נושא ומשנים טקסטים בטוחים.' },
        { minutes: '68–80', title: 'דיבאג קלט עדין', teacher: 'מדגימים id לא תואם ומחזירים לרמז: השמות חייבים להיות זהים.', students: 'בודקים התאמה בין input לבין JavaScript.' },
        { minutes: '80–90', title: 'תערוכת מחוללים מצחיקים', teacher: 'כל תלמיד נותן לחבר למלא את המחולל ומסביר איזה שדה נקרא בקוד.', students: 'מציגים מחולל ואומרים: “הקוד קרא את ___ מתוך השדה”.' }
      ],
      exercises: [
        { id: 1, minutes: '0–6', title: 'תרגיל 1 — בדיקת קסם אישי', prompt: 'בתצוגה החיה משמאל, כתבו שם ונושא לברכה בתוך שני השדות, לחצו על “צרו ברכה מצחיקה”, ובדקו שהברכה משתמשת במה שהקלדתם.', hint: 'לא צריך לכתוב קוד בתרגיל הזה. אם כתבתם “נועה” ו“רובוטים”, שני הדברים צריכים להופיע בברכה.', check: { jsIncludes: ['function makeGreeting'], requiresPreviewButtonText: 'צרו ברכה מצחיקה', requiresPreviewFilledInputs: ['nameInput', 'hobbyInput'], requiresPreviewResultFromInputs: ['nameInput', 'hobbyInput'], previewClickFeedback: 'כמעט. בתצוגה החיה משמאל לחצו על הכפתור “צרו ברכה מצחיקה”.', previewInputFeedback: 'כמעט. קודם כתבו שם ונושא לברכה בתוך שני השדות שבתצוגה החיה משמאל, ואז לחצו על הכפתור.', previewResultFeedback: 'כמעט. לחצתם על הכפתור, אבל התוצאה עדיין לא משתמשת גם בשם וגם בנושא שהקלדתם.' } },
        { id: 2, minutes: '6–14', title: 'תרגיל 2 — מי המציא את המשפט הכי מצחיק?', prompt: 'נסו שלושה זוגות של שם+נושא ובחרו את התוצאה הכי מצחיקה.', hint: 'זה עדיין אותו קוד — רק ה־value שהמשתמש מקליד משתנה.', check: { htmlIncludes: ['id="nameInput"', 'id="hobbyInput"'], jsIncludes: ['textContent'] } },
        { id: 3, minutes: '14–24', title: 'תרגיל 3 — כלי עזר לשדה שם', prompt: 'לחצו על כלי העזר “שדה שם” ובדקו שבתצוגה הכותרת מעל השדה הראשון השתנתה ל“מה השם שלך?”.', hint: 'זה לא בלוק לגרירה ולא הכפתור שבתצוגה — זה כלי עזר שמעדכן טקסט גלוי ב־HTML.', check: { htmlIncludes: ['מה השם שלך?'] } },
        { id: 4, minutes: '24–34', title: 'תרגיל 4 — כלי עזר לשדה נושא', prompt: 'לחצו על כלי העזר “שדה נושא” ובדקו שבתצוגה הכותרת מעל השדה השני השתנתה ל“על מה הברכה?”.', hint: 'זה כלי עזר מוכן, לא בלוק לגרירה ולא הכפתור שבתצוגה. הוא משנה טקסט גלוי ליד hobbyInput.', check: { htmlIncludes: ['על מה הברכה?'] } },
        { id: 5, minutes: '34–44', title: 'תרגיל 5 — מוצאים את value', prompt: 'פתחו “הצצה לקוד” ומצאו בקוד JavaScript את השורה שקוראת את השם מהשדה.', hint: 'חפשו value. לא צריך לכתוב את זה לבד.', check: { jsIncludes: ['getElementById("nameInput").value'], requiresCodePeek: true, codePeekFeedback: 'כמעט. פתחו את “לראות קוד שנוצר” וחפשו את value ב־JavaScript.' } },
        { id: 6, minutes: '44–58', title: 'תרגיל 6 — משפט אישי יותר', prompt: 'לחצו על כלי העזר “צור משפט אישי”, ואז בדקו בתצוגה עם שם ונושא אמיתיים.', hint: 'כלי העזר מעדכן חלק מה־textContent. אחר כך צריך ללחוץ שוב על “צרו ברכה מצחיקה” בתצוגה כדי לראות את המשפט החדש.', check: { jsIncludes: ['נהדר! שמעתי שהנושא שלך הוא'] } },
        { id: 7, minutes: '58–72', title: 'תרגיל 7 — שינוי טקסט בטוח', prompt: 'שנו כותרת, טקסט כפתור או משפט פתיחה — אבל אל תשנו id.', hint: 'אל תשנו nameInput או hobbyInput בתרגיל הזה.', check: { htmlIncludes: ['id="nameInput"', 'id="hobbyInput"'] } },
        { id: 8, minutes: '72–84', title: 'תרגיל 8 — תערוכת מחוללים', prompt: 'תנו לחבר/ה למלא את המחולל והסבירו איזה שדה הקוד קרא.', hint: 'השתמשו במילים: input, id, value.', check: { htmlIncludes: ['input', 'button'], jsIncludes: ['value', 'textContent'] } }
      ],
      aiHelper: [
        'הציעו 5 רעיונות למחוללים מצחיקים שמתאימים לכיתה ד׳.',
        'תנו 10 משפטי תוצאה שמשתמשים בשם ובנושא בלי להעליב אף אחד.',
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
      title: 'חידון תשובה חופשית — בלוקי תנאי נקיים',
      concept: 'בלוקי תנאי → JavaScript: אם / אחרת ומשוב',
      durationMinutes: 90,
      story: 'בונים חידון קטן דרך בלוקי תנאי עם שאלה ותשובה נכונה שאפשר לכתוב לבד. קודם מבינים “אם התשובה שווה לערך הנכון / אחרת”, ורק אחר כך מציצים ל־if/else שנוצר בקוד.' ,
      mission: 'לבנות חידון אינטראקטיבי בעזרת בלוקי תנאי, עם תשובה נכונה חופשית שמתאימה לשאלה שהתלמידים כתבו.' ,
      outcome: 'חידון קצר שנבנה מבלוקי תנאי, עם שדה תשובה חופשית, if/else ומשוב צבעוני',
      starter: {
        html: '<main class="quiz">\n  <h1>חידון תשובה קצרה</h1>\n  <p class="question">CSS אחראי על העיצוב של העמוד?</p>\n  <input id="answerInput" placeholder="כתבו תשובה כאן">\n  <label class="color-picker">בחרו צבע רקע:\n    <select id="colorChoice">\n      <option value="blue">כחול</option>\n      <option value="red">אדום</option>\n      <option value="green">ירוק</option>\n    </select>\n  </label>\n  <button onclick="checkAnswer()">בדקו תשובה</button>\n  <p id="feedback">כתבו תשובה ותקבלו משוב...</p>\n</main>',
        css: 'body {\n  font-family: Arial, sans-serif;\n  direction: rtl;\n  text-align: center;\n  background: linear-gradient(135deg, #f0fdf4, #eff6ff);\n}\n\n.quiz {\n  background: white;\n  width: 390px;\n  margin: 45px auto;\n  padding: 28px;\n  border-radius: 28px;\n  box-shadow: 0 16px 35px #bbf7d0;\n}\n\n.question {\n  font-size: 22px;\n  font-weight: bold;\n}\n\ninput {\n  display: block;\n  width: min(260px, 84%);\n  margin: 16px auto 10px;\n  padding: 12px 14px;\n  border: 2px solid #bbf7d0;\n  border-radius: 16px;\n  text-align: center;\n}\n\nbutton {\n  display: block;\n  margin: 12px auto 0;\n  background: #16a34a;\n  color: white;\n  border: 0;\n  border-radius: 999px;\n  padding: 12px 22px;\n  font-weight: bold;\n}\n\n.correct { color: #15803d; font-weight: bold; }\n.wrong { color: #b91c1c; font-weight: bold; }\n.color-picker {\n  display: block;\n  margin: 8px auto;\n  font-weight: bold;\n}\n.color-picker select {\n  margin-inline-start: 8px;\n  padding: 6px 10px;\n  border-radius: 10px;\n  border: 1px solid #bfdbfe;\n}',
        js: 'function checkAnswer() {\n  const answer = document.getElementById("answerInput").value.trim();\n  const feedback = document.getElementById("feedback");\n\n  if (answer === "CSS") {\n    feedback.textContent = "נכון! CSS אחראי על העיצוב 🎨";\n    feedback.className = "correct";\n  } else {\n    feedback.textContent = "לא בדיוק. CSS הוא הצד של הצבעים והעיצוב.";\n    feedback.className = "wrong";\n  }\n}'
      },
      lessonFlow: [
        { minutes: '0–8', title: 'פתיחה: בלוק שמחליט', teacher: 'מציגים חידון עם שדה תשובה ושואלים איך האתר יודע אם כתבנו נכון.', students: 'מזהים שאלה, שדה תשובה, הצלחה ורמז.' },
        { minutes: '8–18', title: 'בלוק תנאי ראשון', teacher: 'מפעילים בלוק “שאלה חדשה” ובלוק “תשובה נכונה”, ואז מציצים ל־if בקוד.', students: 'רואים שהתנאי בודק טקסט שאפשר לבחור לפי השאלה, לא רשימת אפשרויות מוגבלת.' },
        { minutes: '18–34', title: 'בנייה מודרכת בבלוקי חידון', teacher: 'מפעילים בלוקים: שאלה, תשובה נכונה, הודעת הצלחה, הודעת אחרת.', students: 'מריצים, כותבים תשובה נכונה ושגויה, ורואים שתי תוצאות.' },
        { minutes: '34–50', title: 'מציצים ל־if/else', teacher: 'לא כותבים תנאי חופשי. רק מזהים if, else ושתי תוצאות אפשריות.', students: 'מסמנים מה קורה אם נכון ומה קורה אחרת.' },
        { minutes: '50–66', title: 'תרגיל עצמאי עם בלוקים', teacher: 'נותנים לתלמידים לבנות חידון אישי דרך בלוקים ושינויי טקסט בטוחים.', students: 'מבצעים תרגילים 1–5.' },
        { minutes: '66–78', title: 'דיבאג תנאי עדין', teacher: 'מדגימים תשובה נכונה שלא מתאימה לשאלה ומחזירים לרעיון: התנאי בודק טקסט מדויק.', students: 'בודקים האם ה־if מתאים לתשובה הנכונה שכתבו.' },
        { minutes: '78–90', title: 'חידון חברים', teacher: 'מחלקים זוגות לבדיקה ומשוב.', students: 'מנסים חידון של חבר ומסבירים את כלל ה־אם/אחרת.' }
      ],
      exercises: [
        { id: 1, minutes: '18–24', title: 'תרגיל 1 — בלוק שאלה', prompt: 'הפעילו בלוק “שאלה חדשה” ובדקו שהשאלה בחידון השתנתה.', hint: 'הבלוק משנה את הטקסט ב־class="question".', check: { htmlIncludes: ['איזו שפה גורמת לכפתור להגיב?'] } },
        { id: 2, minutes: '24–31', title: 'תרגיל 2 — בלוק בחירה נכונה', prompt: 'הפעילו בלוק “בחירה נכונה: לא” ובדקו שהתנאי עבר לבדוק no.', hint: 'חפשו choice === "no".', check: { jsIncludes: ['choice === "no"'] } },
        { id: 3, minutes: '31–39', title: 'תרגיל 3 — בלוק הצלחה', prompt: 'הפעילו בלוק הודעת הצלחה שמתאים לשאלה החדשה.', hint: 'ההודעה נמצאת בתוך ה־if.', check: { jsIncludes: ['נכון! JavaScript מפעיל תגובות'] } },
        { id: 4, minutes: '39–47', title: 'תרגיל 4 — בלוק אחרת', prompt: 'הפעילו בלוק הודעה לתשובה השנייה.', hint: 'ההודעה נמצאת בתוך else.', check: { jsIncludes: ['רמז: JavaScript היא השפה של הפעולות'] } },
        { id: 5, minutes: '47–56', title: 'תרגיל 5 — בודקים אם/אחרת', prompt: 'הריצו, לחצו על שני הכפתורים, וראו שתי תגובות שונות.', hint: 'if הוא נכון, else הוא כל בחירה אחרת.', check: { jsIncludes: ['if', 'else'] } },
        { id: 6, minutes: '56–65', title: 'תרגיל 6 — צבעי משוב', prompt: 'שנו צבעי correct/wrong רק אם אתם מרגישים בטוחים.', hint: 'זה שינוי CSS קטן, לא חובה לשנות מבנה.', check: { cssIncludes: ['.correct', '.wrong'] } },
        { id: 7, minutes: '65–75', title: 'תרגיל 7 — דיבאג בחירה', prompt: 'אם הכפתור הנכון מסומן כשגוי, בדקו שה־if בודק yes או no לפי השאלה.', hint: 'אין פה אותיות גדולות/קטנות. בודקים רק איזו בחירה הכפתור שולח.', check: { htmlIncludes: ['chooseAnswer'], jsIncludes: ['choice ==='] } },
        { id: 8, minutes: '75–84', title: 'תרגיל 8 — חידון חברים', prompt: 'תנו לחבר לענות והסבירו איפה ה־if ואיפה ה־else.', hint: 'השתמשו במילים: אם נכון / אחרת / משוב.', check: { htmlIncludes: ['button'], jsIncludes: ['if', 'else'] } }
      ],
      aiHelper: [
        'הציעו 5 שאלות כן/לא פשוטות לכיתה ד׳ בנושא מחשבים.',
        'הסבירו בשפה פשוטה מה עושה if ומה עושה else.',
        'עזרו למצוא למה הכפתור הנכון נכנס ל־else.',
        'הציעו הודעת אחרת שנותנת רמז ולא מגלה מיד את התשובה.'
      ],
      vocabulary: [
        ['if', 'אם התנאי נכון — בצעו פעולה'],
        ['else', 'אחרת — בצעו פעולה אחרת'],
        ['answer', 'התשובה שהמשתמש כתב בשדה'],
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
      story: 'אחרי חידון התנאים, מוסיפים זיכרון למשחק דרך בלוקי ניקוד: בחירה נכונה מוסיפה נקודות, הבחירה השנייה נותנת משוב, וכפתור איפוס מחזיר להתחלה. אחר כך מציצים ל־let score.' ,
      mission: 'לבנות משחק ניקוד בעזרת בלוקי זיכרון ובחירות מוכנות, ואז להבין ש־score הוא מספר שהמשחק שומר.' ,
      outcome: 'משחק חידון עם ניקוד שנבנה מבלוקי זיכרון, עם הצצה ל־let score ועדכון span במסך',
      starter: {
        html: '<main class="score-game">\n  <h1>משחק הניקוד שלי</h1>\n  <p>ניקוד: <span id="scoreText">0</span></p>\n  <p class="question">CSS אחראי על העיצוב של העמוד?</p>\n  <button onclick="chooseAnswer(\'yes\')">כן</button>\n  <button onclick="chooseAnswer(\'no\')">לא</button>\n  <button onclick="resetScore()">איפוס ניקוד</button>\n  <p id="feedback">בחרו תשובה כדי לקבל נקודות.</p>\n</main>',
        css: 'body {\n  font-family: Arial, sans-serif;\n  direction: rtl;\n  text-align: center;\n  background: linear-gradient(135deg, #fef3c7, #dbeafe);\n}\n\n.score-game {\n  background: white;\n  width: 390px;\n  margin: 45px auto;\n  padding: 28px;\n  border-radius: 28px;\n  box-shadow: 0 16px 35px #fde68a;\n}\n\n#scoreText {\n  display: inline-block;\n  background: #facc15;\n  border-radius: 999px;\n  padding: 6px 14px;\n  font-weight: bold;\n}\n\nbutton {\n  margin: 8px 4px;\n  background: #2563eb;\n  color: white;\n  border: 0;\n  border-radius: 999px;\n  padding: 12px 18px;\n  font-weight: bold;\n}\n\nbutton:first-of-type {\n  background: #16a34a;\n}\n\n.success { color: #15803d; font-weight: bold; }\n.try-again { color: #b45309; font-weight: bold; }',
        js: 'const startScore = 0;\nconst pointsForCorrect = 0;\nconst successMessage = "";\nlet score = startScore;\ndocument.getElementById("scoreText").textContent = score;\n\nfunction chooseAnswer(choice) {\n  const feedback = document.getElementById("feedback");\n\n  if (choice === "yes") {\n    score = score + pointsForCorrect;\n    document.getElementById("scoreText").textContent = score;\n    const pointsWord = pointsForCorrect === 1 ? "נקודה" : "נקודות";\n    feedback.textContent = successMessage || (pointsForCorrect === 1 ? "נכון! קיבלת נקודה ⭐" : "נכון! קיבלת " + pointsForCorrect + " " + pointsWord + " ⭐");\n    feedback.className = "success";\n  } else {\n    feedback.textContent = "כמעט. נסו שוב בלי לאבד נקודות.";\n    feedback.className = "try-again";\n  }\n}\n\nfunction resetScore() {\n  const feedback = document.getElementById("feedback");\n  score = startScore;\n  document.getElementById("scoreText").textContent = score;\n  feedback.textContent = "הניקוד אופס.";\n  feedback.className = "try-again";\n}'
      },
      lessonFlow: [
        { minutes: '0–8', title: 'פתיחה: משחק שזוכר נקודות', teacher: 'שואלים איך משחק זוכר ניקוד גם אחרי כמה תשובות.', students: 'מעלים רעיון של קופה/מד נקודות שנשמר.' },
        { minutes: '8–18', title: 'בלוק ניקוד ראשון', teacher: 'מפעילים בלוק “התחל ניקוד” ומראים את let score = 0 כקופסת נקודות.', students: 'רואים שהמשחק מתחיל מ־0.' },
        { minutes: '18–34', title: 'בנייה מודרכת בבלוקי ניקוד', teacher: 'מפעילים בלוקים: הוסף נקודה, הצג ניקוד, הודעת הצלחה, איפוס.', students: 'לוחצים על הבחירה הנכונה ורואים שהניקוד עולה.' },
        { minutes: '34–50', title: 'מציצים למשתנה', teacher: 'לא כותבים משתנים חופשיים. רק מזהים score, score + 1, ו־scoreText.', students: 'מחברים בין המספר בקוד למספר שמופיע במסך.' },
        { minutes: '50–66', title: 'תרגיל עצמאי עם בלוקים', teacher: 'נותנים לתלמידים לשנות חוק ניקוד דרך בלוק מוכן ושינוי טקסט בטוח.', students: 'מבצעים תרגילים 1–5.' },
        { minutes: '66–78', title: 'דיבאג ניקוד עדין', teacher: 'מדגימים id לא תואם ל־scoreText ומסבירים למה המסך לא מתעדכן.', students: 'בודקים התאמה בין span לבין JavaScript.' },
        { minutes: '78–90', title: 'בדיקת משחק', teacher: 'זוגות משחקים ומסבירים איפה המשחק “זוכר” את הניקוד.', students: 'מציגים משחק ואומרים: “score שומר את ___”.' }
      ],
      exercises: [
        { id: 1, minutes: '18–24', title: 'תרגיל 1 — בלוק התחלת ניקוד', prompt: 'מצאו את בלוק “התחל ניקוד” ובדקו שהמשחק מתחיל מ־0.', hint: 'הבלוק מתאים ל־let score = 0.', check: { jsIncludes: ['let score = 0'] } },
        { id: 2, minutes: '24–31', title: 'תרגיל 2 — בלוק הוסף נקודה', prompt: 'הפעילו בלוק שמוסיף נקודה ובדקו שהקוד מעלה את score.', hint: 'חפשו score = score + 1.', check: { jsIncludes: ['score = score + 1'] } },
        { id: 3, minutes: '31–39', title: 'תרגיל 3 — בלוק הצג ניקוד', prompt: 'מצאו איפה הקוד מציג את הניקוד בתוך scoreText.', hint: 'המסך מתעדכן דרך span עם id.', check: { htmlIncludes: ['id="scoreText"'], jsIncludes: ['getElementById("scoreText")'] } },
        { id: 4, minutes: '39–47', title: 'תרגיל 4 — בלוק שתי נקודות', prompt: 'הפעילו בלוק שמחליף את החוק כך שתשובה נכונה מוסיפה 2 נקודות.', hint: 'הבלוק משנה רק את המספר שמתווסף.', check: { jsIncludes: ['score = score + 2'] } },
        { id: 5, minutes: '47–56', title: 'תרגיל 5 — בלוק הודעת ניקוד', prompt: 'הפעילו בלוק שמשנה את הודעת ההצלחה לניקוד כפול.', hint: 'ההודעה נמצאת בתוך ה־if.', check: { jsIncludes: ['קיבלת 2 נקודות'] } },
        { id: 6, minutes: '56–65', title: 'תרגיל 6 — בלוק איפוס', prompt: 'בדקו שכפתור האיפוס מחזיר את score ל־0.', hint: 'חפשו function resetScore ו־score = 0.', check: { jsIncludes: ['function resetScore', 'score = 0'] } },
        { id: 7, minutes: '65–75', title: 'תרגיל 7 — דיבאג ניקוד', prompt: 'אם המספר לא מתעדכן, בדקו שה־id scoreText זהה ב־HTML וב־JS.', hint: 'scoreText חייב להיות כתוב אותו דבר בדיוק.', check: { htmlIncludes: ['id="scoreText"'], jsIncludes: ['getElementById("scoreText")'] } },
        { id: 8, minutes: '75–84', title: 'תרגיל 8 — הצגת משחק ניקוד', prompt: 'תנו לחבר ללחוץ על תשובה והסבירו איפה המשחק שומר את הניקוד.', hint: 'השתמשו במילים: score, משתנה, הצג ניקוד.', check: { htmlIncludes: ['scoreText', 'button'], jsIncludes: ['score', 'if', 'else'] } }
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
        { minutes: '50–66', title: 'תרגיל עצמאי עם בלוקים', teacher: 'נותנים לתלמידים לשנות קושי ומשוב דרך בלוקים מוכנים.', students: 'מבצעים תרגילים 1–5.' },
        { minutes: '66–78', title: 'איזון ודיבאג', teacher: 'מדגימים יעד קל מדי/קשה מדי ו־id שלא מציג ניקוד.', students: 'מתקנים/מאזנים בלי לכתוב פונקציות חדשות.' },
        { minutes: '78–90', title: 'בדיקת שחקנים', teacher: 'זוגות משחקים, נותנים משוב על קושי, ומציגים בלוק אחד ששינה את המשחק.', students: 'מסבירים: “הבלוק הזה שינה את ___ במשחק”.' }
      ],
      exercises: [
        { id: 1, minutes: '18–24', title: 'תרגיל 1 — בלוק כפתור קליק', prompt: 'מצאו את כפתור הקליק, הריצו, ולחצו כדי לראות ניקוד עולה.', hint: 'הכפתור מפעיל addPoint.', check: { htmlIncludes: ['id="clickButton"'], jsIncludes: ['function addPoint'] } },
        { id: 2, minutes: '24–31', title: 'תרגיל 2 — בלוק יעד ניצחון', prompt: 'הפעילו בלוק שמגדיר יעד ניצחון ל־10 נקודות.', hint: 'היעד נשמר בשם target.', check: { jsIncludes: ['const target = 10'] } },
        { id: 3, minutes: '31–39', title: 'תרגיל 3 — בלוק יעד קל', prompt: 'הפעילו בלוק שמחליף את היעד ל־5 כדי לבדוק משחק קצר יותר.', hint: 'שינוי target משנה את הקושי.', check: { jsIncludes: ['const target = 5'] } },
        { id: 4, minutes: '39–47', title: 'תרגיל 4 — בלוק נקודות כפולות', prompt: 'הפעילו בלוק שכל קליק יוסיף 2 נקודות.', hint: 'הבלוק משנה את score = score + ...', check: { jsIncludes: ['score = score + 2'] } },
        { id: 5, minutes: '47–56', title: 'תרגיל 5 — בלוק הודעת ניצחון', prompt: 'הפעילו בלוק שמשנה את הודעת הניצחון.', hint: 'ההודעה נמצאת בתוך התנאי score >= target.', check: { jsIncludes: ['אליפות! ניצחת במשחק הקליקים'] } },
        { id: 6, minutes: '56–65', title: 'תרגיל 6 — בלוק צבע ניצחון', prompt: 'הפעילו בלוק שמשנה את צבע מצב הניצחון.', hint: 'הבלוק משנה את .win ב־CSS.', check: { cssIncludes: ['#bbf7d0'] } },
        { id: 7, minutes: '65–75', title: 'תרגיל 7 — דיבאג ניקוד', prompt: 'אם הניקוד לא מוצג, בדקו התאמה של scoreText.', hint: 'scoreText חייב להיות זהה ב־HTML וב־JS.', check: { htmlIncludes: ['id="scoreText"'], jsIncludes: ['getElementById("scoreText")'] } },
        { id: 8, minutes: '75–84', title: 'תרגיל 8 — בדיקת קושי', prompt: 'תנו לחבר לשחק ובדקו אם היעד קל מדי או קשה מדי.', hint: 'אפשר לבחור יעד 5 או 10 לפי הכיתה.', check: { htmlIncludes: ['button'], jsIncludes: ['target', 'resetGame'] } }
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
        js: 'let score = 0;\nconst startTime = 15;\nlet timeLeft = startTime;\nlet timerId = null;\n\nfunction startGame() {\n  score = 0;\n  timeLeft = startTime;\n  document.getElementById("scoreText").textContent = score;\n  document.getElementById("timeText").textContent = timeLeft;\n  document.getElementById("message").textContent = "המשחק התחיל!";\n\n  timerId = setInterval(tick, 1000);\n}\n\nfunction tick() {\n  timeLeft = timeLeft - 1;\n  document.getElementById("timeText").textContent = timeLeft;\n\n  if (timeLeft <= 0) {\n    clearInterval(timerId);\n    document.getElementById("message").textContent = "הזמן נגמר! הניקוד שלך: " + score;\n    document.querySelector(".timer-game").classList.add("finished");\n  }\n}\n\nfunction addPoint() {\n  if (timeLeft > 0) {\n    score = score + 1;\n    document.getElementById("scoreText").textContent = score;\n  }\n}'
      },
      lessonFlow: [
        { minutes: '0–8', title: 'פתיחה: משחק נגד השעון', teacher: 'מציגים משחק קליקים עם זמן ושואלים מה משתנה כשיש שעון.', students: 'מזהים לחץ זמן, התחלה, ספירה לאחור וסיום.' },
        { minutes: '8–18', title: 'בלוק זמן ראשון', teacher: 'מפעילים בלוק “התחל טיימר” ומראים timeLeft כמד זמן.', students: 'רואים שהזמן מתחיל מ־15.' },
        { minutes: '18–34', title: 'בנייה מודרכת בבלוקי זמן', teacher: 'מפעילים בלוקים: הצג זמן, הורד שנייה, סיום כשהזמן נגמר.', students: 'מריצים, מתחילים משחק, ורואים את הזמן יורד.' },
        { minutes: '34–50', title: 'מציצים לקוד הזמן', teacher: 'לא כותבים setInterval חופשי. רק מזהים timeLeft, tick ו־clearInterval.', students: 'מחברים בין בלוק הזמן לבין הספירה במסך.' },
        { minutes: '50–66', title: 'תרגיל עצמאי עם בלוקים', teacher: 'נותנים לתלמידים לשנות זמן התחלה ומשוב סיום דרך בלוקים.', students: 'מבצעים תרגילים 1–5.' },
        { minutes: '66–78', title: 'דיבאג זמן', teacher: 'מדגימים מה קורה אם timeText לא תואם או אם הטיימר מהיר מדי.', students: 'בודקים התאמה בין timeText לבין JavaScript.' },
        { minutes: '78–90', title: 'בדיקת שחקנים', teacher: 'זוגות משחקים ובודקים אם 15 שניות זה קל/קשה.', students: 'מציעים איזון זמן: 10, 15 או 20 שניות.' }
      ],
      exercises: [
        { id: 1, minutes: '18–24', title: 'תרגיל 1 — בלוק התחלת זמן', prompt: 'מצאו את בלוק הזמן ובדקו שהמשחק מתחיל מ־15 שניות.', hint: 'הזמן נשמר ב־timeLeft.', check: { jsIncludes: ['let timeLeft = 15'] } },
        { id: 2, minutes: '24–31', title: 'תרגיל 2 — בלוק הצג זמן', prompt: 'בדקו שהזמן מופיע במסך בתוך timeText.', hint: 'timeText הוא המקום שבו הדפדפן מציג את הזמן.', check: { htmlIncludes: ['id="timeText"'], jsIncludes: ['getElementById("timeText")'] } },
        { id: 3, minutes: '31–39', title: 'תרגיל 3 — בלוק ספירה לאחור', prompt: 'מצאו את הקוד שמוריד שנייה בכל פעם.', hint: 'חפשו timeLeft = timeLeft - 1.', check: { jsIncludes: ['timeLeft = timeLeft - 1'] } },
        { id: 4, minutes: '39–47', title: 'תרגיל 4 — בלוק זמן קצר', prompt: 'הפעילו בלוק שמשנה את הזמן ל־10 שניות.', hint: 'שינוי timeLeft משנה את קושי המשחק.', check: { jsIncludes: ['timeLeft = 10'] } },
        { id: 5, minutes: '47–56', title: 'תרגיל 5 — בלוק הודעת סיום', prompt: 'הפעילו בלוק שמשנה את הודעת הסיום.', hint: 'ההודעה מופיעה כאשר timeLeft <= 0.', check: { jsIncludes: ['נגמר הזמן! הצלחת לצבור'] } },
        { id: 6, minutes: '56–65', title: 'תרגיל 6 — בלוק צבע סיום', prompt: 'הפעילו בלוק שמשנה את צבע מצב הסיום.', hint: 'הבלוק משנה את .finished ב־CSS.', check: { cssIncludes: ['#fecaca'] } },
        { id: 7, minutes: '65–75', title: 'תרגיל 7 — דיבאג timeText', prompt: 'אם הזמן לא מוצג, בדקו התאמה של id="timeText".', hint: 'ה־id חייב להיות זהה ב־HTML וב־JS.', check: { htmlIncludes: ['id="timeText"'], jsIncludes: ['getElementById("timeText")'] } },
        { id: 8, minutes: '75–84', title: 'תרגיל 8 — איזון זמן', prompt: 'תנו לחבר לשחק והחליטו אם המשחק צריך 10, 15 או 20 שניות.', hint: 'משחק טוב לא קל מדי ולא מתסכל מדי.', check: { jsIncludes: ['setInterval', 'clearInterval'], htmlIncludes: ['startButton'] } }
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
        { minutes: '50–66', title: 'תרגיל עצמאי עם בלוקים', teacher: 'נותנים לתלמידים לשנות מספר חיים ומשוב פסילה דרך בלוקים.', students: 'מבצעים תרגילים 1–5.' },
        { minutes: '66–78', title: 'דיבאג חיים', teacher: 'מדגימים id לא תואם ל־livesText או חוק שלא עוצר ב־0.', students: 'בודקים התאמה בין livesText לבין JavaScript.' },
        { minutes: '78–90', title: 'בדיקת שחקנים', teacher: 'זוגות בודקים אם 3 חיים זה קל/קשה ומציעים איזון.', students: 'מסבירים את חוק הפסילה במילים.' }
      ],
      exercises: [
        { id: 1, minutes: '18–24', title: 'תרגיל 1 — בלוק חיים', prompt: 'מצאו את בלוק החיים ובדקו שהמשחק מתחיל עם 3 חיים.', hint: 'החיים נשמרים במשתנה lives.', check: { jsIncludes: ['let lives = 3'], htmlIncludes: ['id="livesText"'] } },
        { id: 2, minutes: '24–31', title: 'תרגיל 2 — בלוק איסוף כוכב', prompt: 'לחצו על איסוף כוכב ובדקו שהניקוד עולה.', hint: 'הפעולה collectStar מעלה score.', check: { jsIncludes: ['function collectStar', 'score = score + 1'] } },
        { id: 3, minutes: '31–39', title: 'תרגיל 3 — בלוק מכשול', prompt: 'לחצו על מכשול ובדקו שחיים יורדים.', hint: 'הפעולה hitObstacle מורידה lives.', check: { jsIncludes: ['function hitObstacle', 'lives = lives - 1'] } },
        { id: 4, minutes: '39–47', title: 'תרגיל 4 — בלוק Game Over', prompt: 'מצאו את התנאי שבודק אם החיים נגמרו.', hint: 'חפשו lives <= 0.', check: { jsIncludes: ['if (lives <= 0)'] } },
        { id: 5, minutes: '47–56', title: 'תרגיל 5 — בלוק 5 חיים', prompt: 'הפעילו בלוק שמתחיל את המשחק עם 5 חיים.', hint: 'הבלוק משנה lives = 3 ל־5.', check: { jsIncludes: ['let lives = 5'] } },
        { id: 6, minutes: '56–65', title: 'תרגיל 6 — הודעת פסילה', prompt: 'הפעילו בלוק שמשנה את הודעת המשחק נגמר.', hint: 'ההודעה נמצאת בתוך if.', check: { jsIncludes: ['נגמרו החיים'] } },
        { id: 7, minutes: '65–75', title: 'תרגיל 7 — דיבאג livesText', prompt: 'אם החיים לא מוצגים, בדקו התאמה של id="livesText".', hint: 'ה־id חייב להיות זהה ב־HTML וב־JS.', check: { htmlIncludes: ['id="livesText"'], jsIncludes: ['getElementById("livesText")'] } },
        { id: 8, minutes: '75–84', title: 'תרגיל 8 — איזון קושי', prompt: 'תנו לחבר לשחק והחליטו אם 3 או 5 חיים מתאים יותר.', hint: 'יותר חיים = משחק קל יותר.', check: { jsIncludes: ['lives', 'resetGame'], htmlIncludes: ['button'] } }
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
        { minutes: '50–66', title: 'תרגיל עצמאי עם בלוקים', teacher: 'נותנים לתלמידים לשנות סוג כוח ומשוב דרך בלוקים.', students: 'מבצעים תרגילים 1–5.' },
        { minutes: '66–78', title: 'איזון כוח', teacher: 'מדברים על כוח חזק מדי: למה כדאי להגביל שימוש.', students: 'משווים בוסט 3 מול בוסט 5 ומחליטים מה הוגן.' },
        { minutes: '78–90', title: 'הצגת כוח', teacher: 'זוגות משחקים ומסבירים את כלל הכוח.', students: 'מסבירים: “הכוח עובד רק אם powerReady נכון”.' }
      ],
      exercises: [
        { id: 1, minutes: '18–24', title: 'תרגיל 1 — בלוק כוח מוכן', prompt: 'מצאו את בלוק הכוח ובדקו שהכוח מתחיל במצב מוכן.', hint: 'המצב נשמר ב־powerReady.', check: { jsIncludes: ['let powerReady = true'], htmlIncludes: ['id="powerText"'] } },
        { id: 2, minutes: '24–31', title: 'תרגיל 2 — בלוק הפעל כוח', prompt: 'לחצו על הפעל כוח ובדקו שהניקוד עולה.', hint: 'הכוח מוסיף נקודות בתוך activatePower.', check: { jsIncludes: ['function activatePower', 'score = score + 3'] } },
        { id: 3, minutes: '31–39', title: 'תרגיל 3 — בלוק חד־פעמי', prompt: 'נסו להפעיל כוח פעמיים ובדקו שהפעם השנייה לא מוסיפה ניקוד.', hint: 'if (powerReady) קובע אם מותר להפעיל.', check: { jsIncludes: ['if (powerReady)', 'powerReady = false'] } },
        { id: 4, minutes: '39–47', title: 'תרגיל 4 — בלוק בוסט 5', prompt: 'הפעילו בלוק שמחליף את הבוסט ל־5 נקודות.', hint: 'זה חזק יותר — בדקו אם זה מאוזן.', check: { jsIncludes: ['score = score + 5'] } },
        { id: 5, minutes: '47–56', title: 'תרגיל 5 — בלוק הודעת כוח', prompt: 'הפעילו בלוק שמשנה את הודעת הכוח המיוחד.', hint: 'ההודעה נמצאת בתוך activatePower.', check: { jsIncludes: ['כוח על הופעל'] } },
        { id: 6, minutes: '56–65', title: 'תרגיל 6 — בלוק צבע כוח', prompt: 'הפעילו בלוק שמשנה את צבע מצב הכוח.', hint: 'הבלוק משנה את .power-on ב־CSS.', check: { cssIncludes: ['#bbf7d0'] } },
        { id: 7, minutes: '65–75', title: 'תרגיל 7 — דיבאג powerText', prompt: 'אם מצב הכוח לא מוצג, בדקו התאמה של id="powerText".', hint: 'ה־id חייב להיות זהה ב־HTML וב־JS.', check: { htmlIncludes: ['id="powerText"'], jsIncludes: ['getElementById("powerText")'] } },
        { id: 8, minutes: '75–84', title: 'תרגיל 8 — איזון כוח', prompt: 'תנו לחבר לשחק והחליטו אם כוח של 3 או 5 נקודות הוגן יותר.', hint: 'כוח טוב עוזר, אבל לא מנצח את המשחק לבד.', check: { jsIncludes: ['powerReady', 'resetGame'], htmlIncludes: ['button'] } }
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
        { minutes: '50–66', title: 'תרגיל עצמאי עם בלוקים', teacher: 'נותנים לתלמידים לשנות טקסטי מסך ויעד נקודות דרך בלוקים.', students: 'מבצעים תרגילים 1–5.' },
        { minutes: '66–78', title: 'דיבאג מסכים', teacher: 'מדגימים id לא תואם למסך או class active חסר.', students: 'בודקים שהשמות startScreen/playScreen תואמים.' },
        { minutes: '78–90', title: 'בדיקת חוויית משתמש', teacher: 'זוגות משחקים ומוודאים שהוראות הפתיחה ברורות.', students: 'משפרים טקסט במסך פתיחה או ניצחון.' }
      ],
      exercises: [
        { id: 1, minutes: '18–24', title: 'תרגיל 1 — בלוק מסך פתיחה', prompt: 'מצאו את מסך הפתיחה ובדקו שהוא המסך הפעיל הראשון.', hint: 'המסך הפעיל מקבל class active.', check: { htmlIncludes: ['id="startScreen"', 'class="screen active"'] } },
        { id: 2, minutes: '24–31', title: 'תרגיל 2 — בלוק התחלת משחק', prompt: 'לחצו התחילו ובדקו שעוברים למסך המשחק.', hint: 'startGame מפעיל showScreen("playScreen").', check: { jsIncludes: ['function startGame', 'showScreen("playScreen")'] } },
        { id: 3, minutes: '31–39', title: 'תרגיל 3 — בלוק יעד 3', prompt: 'מצאו את היעד לניצחון: 3 נקודות.', hint: 'היעד נשמר ב־target.', check: { jsIncludes: ['const target = 3'] } },
        { id: 4, minutes: '39–47', title: 'תרגיל 4 — בלוק מסך ניצחון', prompt: 'אספו נקודות עד שהמשחק עובר למסך ניצחון.', hint: 'המעבר קורה כאשר score >= target.', check: { htmlIncludes: ['id="winScreen"'], jsIncludes: ['showScreen("winScreen")'] } },
        { id: 5, minutes: '47–56', title: 'תרגיל 5 — בלוק מסך הפסד', prompt: 'לחצו על כפתור הפסד ובדקו שעוברים למסך הפסד.', hint: 'loseGame מפעיל showScreen("loseScreen").', check: { htmlIncludes: ['id="loseScreen"'], jsIncludes: ['showScreen("loseScreen")'] } },
        { id: 6, minutes: '56–65', title: 'תרגיל 6 — בלוק שחק שוב', prompt: 'בדקו שכפתור שחקו שוב מחזיר למסך הפתיחה.', hint: 'resetGame מחזיר ל־startScreen.', check: { jsIncludes: ['function resetGame', 'showScreen("startScreen")'] } },
        { id: 7, minutes: '65–75', title: 'תרגיל 7 — דיבאג id מסך', prompt: 'אם מעבר מסך לא עובד, בדקו שה־id במסך זהה לשם ב־showScreen.', hint: 'playScreen חייב להיות כתוב אותו דבר בשני המקומות.', check: { htmlIncludes: ['id="playScreen"'], jsIncludes: ['showScreen("playScreen")'] } },
        { id: 8, minutes: '75–84', title: 'תרגיל 8 — שיפור חוויית משתמש', prompt: 'שנו טקסט במסך הפתיחה כך שיהיה ברור לשחקן מה המטרה.', hint: 'שינוי בטוח: טקסט בתוך p או h1.', check: { htmlIncludes: ['startScreen', 'button'], jsIncludes: ['showScreen'] } }
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
        { id: 1, minutes: '18–24', title: 'תרגיל 1 — בלוק שם משחק', prompt: 'הפעילו בלוק שמשנה את שם המשחק.', hint: 'השם נמצא בתוך h1.', check: { htmlIncludes: ['משחק הכוכבים המשודרג'] } },
        { id: 2, minutes: '24–31', title: 'תרגיל 2 — בלוק יעד', prompt: 'הפעילו בלוק שמגדיר יעד של 7 כוכבים.', hint: 'היעד נשמר ב־target.', check: { jsIncludes: ['const target = 7'] } },
        { id: 3, minutes: '31–39', title: 'תרגיל 3 — בלוק 5 חיים', prompt: 'הפעילו בלוק שנותן 5 חיים בתחילת המשחק.', hint: 'שימו לב שגם startGame מאפס חיים.', check: { jsIncludes: ['let lives = 5', 'lives = 5'] } },
        { id: 4, minutes: '39–47', title: 'תרגיל 4 — בלוק זמן 30', prompt: 'הפעילו בלוק שמשנה את הזמן ל־30.', hint: 'timeLeft צריך להשתנות גם בהתחלה וגם באיפוס.', check: { jsIncludes: ['let timeLeft = 30', 'timeLeft = 30'] } },
        { id: 5, minutes: '47–56', title: 'תרגיל 5 — בלוק הודעת ניצחון', prompt: 'הפעילו בלוק הודעת ניצחון אישית.', hint: 'ההודעה נמצאת אחרי score >= target.', check: { jsIncludes: ['ניצחון מושלם'] } },
        { id: 6, minutes: '56–65', title: 'תרגיל 6 — בלוק צבעי פרויקט', prompt: 'הפעילו בלוק שמשנה את צבע הניצחון.', hint: 'הבלוק משנה את .win ב־CSS.', check: { cssIncludes: ['#bbf7d0'] } },
        { id: 7, minutes: '65–75', title: 'תרגיל 7 — בדיקת פונקציות', prompt: 'מצאו בקוד את ארבע הפונקציות המרכזיות של המשחק.', hint: 'חפשו function startGame / collectStar / hitObstacle / updateScreen.', check: { jsIncludes: ['function startGame', 'function collectStar', 'function hitObstacle', 'function updateScreen'] } },
        { id: 8, minutes: '75–84', title: 'תרגיל 8 — הצגת פרויקט', prompt: 'תנו לחבר לשחק והסבירו איזה שני בלוקים שדרגו את המשחק.', hint: 'הסבירו במילים, לא בקוד.', check: { htmlIncludes: ['button'], jsIncludes: ['resetGame'], cssIncludes: ['.win', '.lose'] } }
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
      { label: '✨ הצג הודעה בלחיצה', target: 'js', find: 'איזה כיף! הכפתור עובד 🎉', replace: 'ברוכים הבאים לאתר הראשון שלי ✨', hint: 'בלוק JavaScript: מציג את ההודעה אחרי הלחיצה.' }
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
      { label: '❓ שאלה חדשה', target: 'html', find: 'CSS אחראי על העיצוב של העמוד?', replace: 'JavaScript גורם לכפתור להגיב?', hint: 'בלוק חידון: משנה את השאלה שהמשתמש רואה.' },
      { label: '✅ בחירה נכונה: לא', target: 'js', find: 'choice === "yes"', replace: 'choice === "no"', hint: 'בלוק תנאי: משנה איזו בחירה נכנסת ל־if.' },
      { label: '🎉 הודעת הצלחה', target: 'js', find: 'נכון! CSS אחראי על העיצוב 🎨', replace: 'נכון! JavaScript מפעיל תגובות ⚡', hint: 'בלוק משוב: מה קורה אם התנאי נכון.' },
      { label: '💡 הודעת אחרת', target: 'js', find: 'לא בדיוק. CSS הוא הצד של הצבעים והעיצוב.', replace: 'כמעט! רמז: JavaScript היא השפה של הפעולות והכפתורים.', hint: 'בלוק אחרת: מה קורה אם התנאי לא נכון.' }
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
      { label: '📝 שדה שם', target: 'html', find: ['שם גיבור/ה:', 'שם גיבור/ה'], replace: 'מה השם שלך?', hint: 'כלי עזר: משנה טקסט גלוי מעל השדה הראשון.' },
      { label: '🎯 שדה נושא', target: 'html', find: ['נושא לברכה:', 'תחביב או כוח־על:', 'תחביב או כוח־על'], replace: 'על מה הברכה?', hint: 'כלי עזר: משנה טקסט גלוי מעל השדה השני.' },
      { label: '💬 צור משפט אישי', target: 'js', find: 'הנה ברכה מצחיקה על', replace: 'נהדר! שמעתי שהנושא שלך הוא', hint: 'כלי עזר: משנה את משפט התוצאה שמחבר את הקלט לברכה.' }
    ]
  };

  lessons.forEach(lesson => {
    lesson.bridgeBlocks = bridgeBlocksByLesson[lesson.id] || [];
    if (lesson.id <= 12) lesson.mode = 'Blockly-first bridge';
  });


  Object.assign(lessons[2], {
    title: 'כפתורים ופעולות קסם עם Blockly',
    concept: 'בלוקים מחוברים → JavaScript: לחיצה · function · שינוי במסך',
    story: 'אחרי שבנינו עמוד ועיצבנו אותו, שיעור 3 פותח בוואו מהיר: הילדים מריצים עמוד, לוחצים על כפתור, ורואים מיד הודעה ורקע משתנים. רק אחרי שהקסם עובד מחברים אותו ל־onclick, function ו־JavaScript.',
    mission: 'לבנות עמוד אינטראקטיבי בעזרת בלוקי פעולה אמיתיים: קודם חוויית לחיצה מיידית, ואז כפתור, הודעה, שינוי סמל, שינוי רקע ו־toggle של מצב קסם.',
    outcome: 'עמוד שמגיב ללחיצה כבר בתחילת השיעור, עם הצצה ברורה ל־onclick, function, textContent, style ו־classList.toggle',
    mode: 'Real Blockly action studio',
    realBlocklyBuilder: true,
    lessonFlow: [
      { minutes: '0–3', title: 'וואו ראשון: לוחצים והעמוד משתנה', teacher: 'בלי הקדמה ארוכה: מריצים, לוחצים על “הפעילו קסם”, ושואלים מה השתנה במסך.', students: 'רואים הודעה ורקע משתנים מיד ומנחשים איזה בלוק גרם לזה.' },
      { minutes: '3–10', title: 'משנים קסם קטן לבד', teacher: 'מבקשים לשנות בחירת רקע או טקסט בכפתור ולהריץ שוב. עדיין לא מסבירים תחביר.', students: 'משנים ערך בתוך בלוק, מריצים, לוחצים ורואים תוצאה אישית.' },
      { minutes: '10–20', title: 'כפתור ופונקציה מאחורי הקסם', teacher: 'רק עכשיו מצביעים על בלוק כפתור ועל ההצצה לקוד: onclick מפעיל function showMessage.', students: 'בוחרים את בלוק הכפתור ורואים את שורת ה־HTML המסומנת.' },
      { minutes: '20–34', title: 'בלוק הצגת הודעה', teacher: 'גוררים בלוק “בלחיצה הצג הודעה” מסטודיו פעולה ומדגימים textContent.', students: 'כותבים הודעה מצחיקה, מריצים ולוחצים על הכפתור.' },
      { minutes: '34–48', title: 'בלוק שינוי סמל', teacher: 'מוסיפים בלוק שמחליף אימוג׳י בלחיצה ומראים איך JS משנה אלמנט עם id.', students: 'בוחרים סמל חדש ובודקים שינוי בתצוגה.' },
      { minutes: '48–62', title: 'שינוי רקע כפעולה', teacher: 'משנים או מוסיפים בלוק רקע ומראים document.body.style.background.', students: 'בודקים איך פעולה יכולה לשנות עיצוב בזמן אמת.' },
      { minutes: '62–76', title: 'מצב קסם כמתג', teacher: 'מוסיפים בלוק classList.toggle ומסבירים: לחיצה אחת מדליקה, לחיצה שנייה מכבה.', students: 'לוחצים כמה פעמים ומזהים מצב דולק/כבוי.' },
      { minutes: '76–84', title: 'הצצה לקוד שנוצר', teacher: 'בוחרים כל בלוק ורואים את השורה המודגשת ב־HTML/CSS/JS.', students: 'מסבירים: הבלוק שלי יצר את השורה הזאת.' },
      { minutes: '84–90', title: 'תערוכת קסמים', teacher: 'מבקשים מכל תלמיד לשתף קישור ציבורי ולהציג פעולה אחת.', students: 'מציגים עמוד ואומרים מה משתנה בלחיצה.' }
    ],
    exercises: [
      { id: 1, minutes: '0–5', title: 'תרגיל 1 — וואו תוך שתי דקות', prompt: 'לחצו על כפתור “הפעילו קסם” בתצוגה החיה בצד שמאל, וגלו מה השתנה במסך.', hint: 'חפשו שינוי הודעה או שינוי רקע בתצוגה אחרי הלחיצה על “הפעילו קסם” — לא צריך להבין עדיין את כל הקוד.', check: { htmlIncludes: ['onclick="showMessage()"'], jsIncludes: ['function showMessage', 'document.body.style.background'], requiresPreviewButtonText: 'הפעילו קסם', previewClickFeedback: 'כמעט. לחצו קודם על כפתור “הפעילו קסם” בתוך התצוגה החיה בצד שמאל, ואז לחצו בדיקה.' } },
      { id: 2, minutes: '5–12', title: 'תרגיל 2 — משנים טקסט של כפתור', prompt: 'שנו רק את הטקסט שמופיע על בלוק הכפתור למשהו משלכם, ואז לחצו על הכפתור בתצוגה החיה.', hint: 'בלוק “כפתור” קובע מה כתוב על הכפתור. את ההודעה החדשה שמופיעה אחרי לחיצה נשנה בתרגיל הבא בעזרת בלוק פעולה.', check: { htmlIncludes: ['button'], jsIncludes: ['document.body.style.background'], blockTypes: ['web_button'], nonEmptyBlocklyFields: [{ type: 'web_button', field: 'LABEL' }], changedBlocklyFields: [{ type: 'web_button', field: 'LABEL', defaultValue: 'הפעילו קסם' }], requiresPreviewButtonClick: true, emptyFeedback: 'כמעט. הטקסט שעל הכפתור לא יכול להיות ריק.', fieldFeedback: 'כמעט. שנו את הטקסט שעל בלוק הכפתור למשהו משלכם.', previewClickFeedback: 'כמעט. עכשיו לחצו על הכפתור בתצוגה החיה ואז על בדיקה.' } },
      { id: 3, minutes: '12–22', title: 'תרגיל 3 — מוצאים את הכפתור בקוד', prompt: 'פתחו את ההצצה לקוד שנוצר, בחרו את בלוק הכפתור, ואז הקלידו בתיבה מילת קוד קצרה שראיתם בשורת ה־HTML — למשל button, id, onclick או showMessage().', hint: 'חפשו את שורת הכפתור בלשונית HTML. מספיק להקליד מילת קוד קצרה אחת מתוך השורה, לא את כל השורה.', answerBox: { label: 'מילת קוד שראיתי', placeholder: 'הקלד כאן מילת קוד מהבלוק', note: 'אין צורך להעתיק את כל השורה — כתבו למשל button, id, onclick או showMessage().' }, check: { htmlIncludes: ['onclick="showMessage()"'], jsIncludes: ['function showMessage'], blockTypes: ['web_button'], requiresCodePeek: true, requiresCodeSelectionTab: 'html', requiresCodeSelectionBlockTypes: ['web_button'], requiresCodeLineAnswer: { tab: 'html', blockTypes: ['web_button'], requiredSnippets: ['button', 'id', 'onclick', 'showMessage()'] }, codePeekFeedback: 'כמעט. קודם פתחו את “לראות קוד שנוצר”.', codeSelectionFeedback: 'כמעט. אחרי פתיחת ההצצה, לחצו על בלוק הכפתור וודאו ששם הבלוק מופיע בכרטיס המשימה.', codeLineAnswerFeedback: 'כמעט. כתבו בתיבה מילת קוד קצרה שראיתם בשורת הכפתור, למשל button, id, onclick או showMessage().' } },
      { id: 4, minutes: '22–34', title: 'תרגיל 4 — הצגת הודעה בלחיצה', prompt: 'גררו בלוק “בלחיצה הצג הודעה”, כתבו הודעה חדשה שתופיע רק אחרי לחיצה, ואז לחצו על הכפתור בתצוגה החיה.', hint: 'זה בלוק פעולה: הוא משנה את message.textContent אחרי שלוחצים על הכפתור.', check: { jsIncludes: ['message.textContent'], blockTypes: ['web_action_message'], nonEmptyBlocklyFields: [{ type: 'web_action_message', field: 'TEXT' }], changedBlocklyFields: [{ type: 'web_action_message', field: 'TEXT', defaultValue: 'הודעה חדשה מהפעולה ✨' }], requiresPreviewButtonText: 'הפעילו קסם', requiresPreviewMessageChangedFrom: 'כאן תופיע הודעה מהכפתור...', emptyFeedback: 'כמעט. ההודעה החדשה בתוך בלוק הפעולה לא יכולה להיות ריקה.', blockFeedback: 'כמעט. חסר בלוק “בלחיצה הצג הודעה” מסטודיו פעולה.', fieldFeedback: 'כמעט. בלוק “בלחיצה הצג הודעה” מחובר, עכשיו שנו את הטקסט שבתוכו להודעה משלכם.', previewClickFeedback: 'כמעט. ההודעה השתנתה; עכשיו לחצו על כפתור “הפעילו קסם” בתצוגה החיה ואז על בדיקה.', previewMessageFeedback: 'כמעט. לחצתם על הכפתור, אבל ההודעה בתצוגה עדיין לא השתנתה. ודאו שבלוק “בלחיצה הצג הודעה” מחובר ושהטקסט שלו שונה.' } },
      { id: 5, minutes: '34–46', title: 'תרגיל 5 — שינוי סמל', prompt: 'גררו בלוק “בלחיצה שנה סמל ל־”, בחרו אימוג׳י שונה מברירת המחדל, ואז לחצו על הכפתור בתצוגה החיה.', hint: 'צריך להיות בעמוד בלוק “סמל גדול” כדי שלבלוק “בלחיצה שנה סמל ל־” יהיה מה לשנות. אל תשאירו את האימוג׳י על 🤖.', check: { htmlIncludes: ['id="heroEmoji"'], jsIncludes: ['heroEmoji.textContent'], blockTypes: ['web_emoji', 'web_action_emoji'], changedBlocklyFields: [{ type: 'web_action_emoji', field: 'EMOJI', defaultValue: '🤖' }], requiresPreviewButtonText: 'הפעילו קסם', requiresPreviewEmojiChangedFrom: '✨', fieldFeedback: 'כמעט. בלוק “בלחיצה שנה סמל ל־” מחובר, אבל צריך לבחור אימוג׳י אחר מברירת המחדל 🤖.', previewClickFeedback: 'כמעט. עכשיו לחצו על “הפעילו קסם” בתצוגה החיה ואז על בדיקה.', previewEmojiFeedback: 'כמעט. לחצתם על הכפתור, אבל הסמל בתצוגה עדיין לא השתנה. בחרו אימוג׳י אחר ולחצו שוב.' } },
      { id: 6, minutes: '46–58', title: 'תרגיל 6 — שינוי רקע', prompt: 'בלוק “בלחיצה שנה רקע” כבר נמצא בקוד ההתחלתי. שנו רק את הבחירה שבתוכו לרקע אחר, ואז לחצו על הכפתור בתצוגה החיה ובדקו.', hint: 'אל תגררו בלוק רקע חדש — שנו את הבלוק שכבר מחובר. בקוד ההתחלתי הוא ורוד, וזה לא מספיק כי עוד לא שיניתם אותו.', check: { jsIncludes: ['document.body.style.background'], blockTypes: ['web_action_background'], ensureStarterBlocks: [{ type: 'web_action_background', after: 'web_button', fields: { BG: 'pink' } }], exactBlockTypeCounts: { web_action_background: 1 }, changedBlocklyFieldsFromBaseline: [{ type: 'web_action_background', field: 'BG' }], requiresPreviewButtonText: 'הפעילו קסם', countFeedback: 'כמעט. אל תוסיפו בלוק “בלחיצה שנה רקע” נוסף — צריך לשנות את הבלוק שכבר נמצא בקוד כשהתחלתם את התרגיל.', fieldFeedback: 'כמעט. בלוק “בלחיצה שנה רקע” כבר מחובר, עכשיו בחרו בו רקע אחר ממה שהיה כשנכנסתם לתרגיל.', previewClickFeedback: 'כמעט. הרקע השתנה בקוד; עכשיו לחצו על “הפעילו קסם” בתצוגה החיה ואז על בדיקה.' } },
      { id: 7, minutes: '58–72', title: 'תרגיל 7 — מצב קסם', prompt: 'גררו בלוק “בלחיצה החלף מצב קסם”, לחצו על הכפתור בתצוגה החיה וודאו שהכרטיס נכנס למצב קסם.', hint: 'toggle מדליק ומכבה class. צריך לראות את הכרטיס משתנה אחרי הלחיצה.', check: { cssIncludes: ['.page-card.magic'], jsIncludes: ['classList.toggle("magic")'], blockTypes: ['web_action_magic'], requiresPreviewButtonText: 'הפעילו קסם', requiresPreviewCardClass: 'magic', previewClickFeedback: 'כמעט. הבלוק מחובר; עכשיו לחצו על “הפעילו קסם” בתצוגה החיה ואז על בדיקה.', previewClassFeedback: 'כמעט. לחצתם, אבל הכרטיס לא נכנס למצב קסם. ודאו שהבלוק “בלחיצה החלף מצב קסם” מחובר ולחצו פעם אחת.' } },
      { id: 8, minutes: '72–84', title: 'תרגיל 8 — מסמנים קוד מבלוק', prompt: 'פתחו את ההצצה לקוד שנוצר, לחצו על בלוק שמחובר בקוד ומשנה משהו בלחיצה, וודאו ששורת JavaScript שנוצרה ממנו מסומנת.', hint: 'בחרו בלוק שנמצא בתוך שרשרת הקוד, לא בלוק חופשי בצד. הבלוקים האלה נמצאים באזור “סטודיו פעולה” ומשנים את JavaScript.', check: { htmlIncludes: ['page-card'], cssIncludes: ['.page-card'], jsIncludes: ['function showMessage'], requiresCodePeek: true, requiresCodeSelectionTab: 'js', requiresCodeSelectionBlockTypes: ['web_action_message', 'web_action_emoji', 'web_action_background', 'web_action_magic'], codePeekFeedback: 'כמעט. קודם פתחו את “לראות קוד שנוצר”.', codeSelectionFeedback: 'כמעט. אחרי פתיחת ההצצה, לחצו על אחד מהבלוקים שמחוברים בקוד: “בלחיצה הצג הודעה”, “בלחיצה שנה סמל ל־”, “בלחיצה שנה רקע” או “בלחיצה החלף מצב קסם”, וודאו ששורת JavaScript מסומנת.' } }
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
    concept: 'בלוקי עיצוב → CSS: צבעים · צורה · צל · Hover',
    story: 'אחרי שבשיעור 1 הילדים בנו עמוד מבלוקים, שיעור 2 הופך אותם למעצבי UI: גוררים בלוקי עיצוב, משנים את התחושה של אותו עמוד, ורואים איך CSS נוצר אוטומטית מאחור.',
    mission: 'לעצב עמוד אישי בעזרת בלוקי Design Studio: פלטת צבעים, צורת כרטיס, צל, צבע כותרת, סגנון כפתור ואפקט מעבר עכבר.',
    outcome: 'עמוד מעוצב בבלוקים מחוברים, עם הבנה ראשונה ש־CSS משנה את החוויה בלי לשנות את המבנה',
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
      { id: 1, minutes: '8–16', title: 'תרגיל 1 — מתחילים פשוט', prompt: 'העמוד מתחיל רק עם עיצוב בסיסי, כותרת ופסקה. בחרו אפשרות בבלוק “פלטת עיצוב עמוד” ובדקו מה השתנה.', hint: 'בהתחלה אין הרבה בלוקים — זה בכוונה. נבנה את העיצוב בשלבים.', check: { cssIncludes: ['background:'], cssExcludes: ['background: #ede9fe;'], blockTypes: ['web_theme'], changedBlocklyFields: [{ type: 'web_theme', field: 'THEME', defaultValue: 'space' }], fieldFeedback: 'כמעט. בלוק פלטת עיצוב העמוד מחובר, עכשיו בחרו פלטה אחרת מתוך התפריט שבתוכו.' } },
      { id: 2, minutes: '16–25', title: 'תרגיל 2 — מוסיפים בלוק ראשון', prompt: 'עכשיו גררו בעצמכם בלוק “צורת כרטיס”, חברו אותו לשרשרת, ובחרו צורה מתוך התפריט.', hint: 'גררו את הבלוק לאזור העבודה, ואז פתחו את התפריט בתוך הבלוק ובחרו צורה שמתאימה לעמוד.', check: { cssIncludes: ['border-radius'], blockTypes: ['web_card_shape'], changedBlocklyFields: [{ type: 'web_card_shape', field: 'SHAPE', defaultValue: 'none' }], fieldFeedback: 'כמעט. בלוק צורת הכרטיס מחובר, עכשיו פתחו את התפריט בתוך הבלוק שבאזור העבודה ובחרו צורה.' } },
      { id: 3, minutes: '25–34', title: 'תרגיל 3 — מוסיפים עומק', prompt: 'גררו בלוק “צל כרטיס”, חברו אותו אחרי צורת הכרטיס, ובחרו צל מתוך התפריט.', hint: 'צל כרטיס צריך להיות מחובר אחרי בלוק צורת כרטיס. גררו את בלוק הצל לאזור העבודה, ואז פתחו את התפריט שבתוכו ובחרו את האפקט שמתאים לעמוד — גם “בלי צל” זו בחירה תקינה.', check: { cssIncludes: ['box-shadow'], blockTypes: ['web_shadow'], orderedBlockTypes: ['web_card_shape', 'web_shadow'], changedBlocklyFields: [{ type: 'web_shadow', field: 'SHADOW', defaultValue: 'choose' }], fieldFeedback: 'כמעט. בלוק צל הכרטיס מחובר במקום הנכון, עכשיו פתחו את התפריט בתוך הבלוק שבאזור העבודה ובחרו צל.' } },
      { id: 4, minutes: '34–43', title: 'תרגיל 4 — צבע כותרת', prompt: 'חברו בלוק “צבע כותרת” ובחרו צבע כותרת שמתאים לעמוד.', hint: 'הכותרת היא h1. גררו את בלוק צבע הכותרת לאזור העבודה, ואז פתחו את התפריט שבתוכו ובחרו צבע.', check: { cssIncludes: ['h1 { color:'], blockTypes: ['web_title_color'], changedBlocklyFields: [{ type: 'web_title_color', field: 'COLOR', defaultValue: 'none' }], fieldFeedback: 'כמעט. בלוק צבע הכותרת מחובר, עכשיו פתחו את התפריט בתוך הבלוק שבאזור העבודה ובחרו צבע.' } },
      { id: 5, minutes: '43–52', title: 'תרגיל 5 — סוג כפתור', prompt: 'חברו בלוק “סגנון כפתור” ובחרו סגנון כפתור.', hint: 'הכפתור משתנה דרך background, border-radius ו־box-shadow. גררו את בלוק סגנון הכפתור לאזור העבודה, ואז פתחו את התפריט שבתוכו ובחרו סגנון כפתור.', check: { cssIncludes: ['button {', 'border-radius'], blockTypes: ['web_button_style'], changedBlocklyFields: [{ type: 'web_button_style', field: 'STYLE', defaultValue: 'none' }], fieldFeedback: 'כמעט. בלוק סגנון הכפתור מחובר, עכשיו פתחו את התפריט בתוך הבלוק שבאזור העבודה ובחרו סגנון.' } },
      { id: 6, minutes: '52–62', title: 'תרגיל 6 — אפקט Hover', prompt: 'חברו בלוק “אפקט מעבר עכבר”, בחרו אפקט עכבר לכפתור, ובדקו מה קורה כשעוברים על הכפתור עם העכבר.', hint: 'Hover הוא עיצוב שקורה רק כשעוברים עם העכבר. יש כפתור בתצוגת האתר בצד שמאל — עברו עליו עם העכבר כדי לראות את השינוי.', check: { cssIncludes: ['button:hover'], blockTypes: ['web_hover'], changedBlocklyFields: [{ type: 'web_hover', field: 'EFFECT', defaultValue: 'none' }], fieldFeedback: 'כמעט. בלוק אפקט המעבר מחובר, עכשיו פתחו את התפריט בתוך הבלוק שבאזור העבודה ובחרו אפקט עכבר.' } },
      { id: 7, minutes: '62–74', title: 'תרגיל 7 — מקלידים שורת CSS', prompt: 'פתחו “לראות קוד שנוצר”, לחצו על בלוק עיצוב שמייצר CSS, בדקו בכרטיס המשימה איזה בלוק נבחר, ואז הקלידו בעצמכם שורה קצרה שסומנה.', hint: 'אפשר לבחור “עיצוב עמוד”, “צל כרטיס”, “צורת כרטיס”, “צבע כותרת” או “סגנון כפתור”. אפשר לבחור שורה קצרה כמו background: #dcfce7; או border-radius: 30px;', answerBox: { label: 'שורת CSS שמצאתי', placeholder: 'הקלד כאן את קוד הבלוק', note: 'אי אפשר להדביק כאן — מקלידים בעצמכם כדי להבין את שורת ה־CSS.' }, check: { cssIncludes: ['background:'], requiresCodePeek: true, requiresCodeSelectionTab: 'css', requiresCodeSelectionBlockTypes: ['web_theme', 'web_card_shape', 'web_shadow', 'web_title_color', 'web_button_style'], requiresCodeLineAnswer: { tab: 'css', blockTypes: ['web_theme', 'web_card_shape', 'web_shadow', 'web_title_color', 'web_button_style'], requiredSnippets: ['background:', 'border-radius:', 'box-shadow:', 'color:'] }, codePeekFeedback: 'כמעט. קודם פתחו את “לראות קוד שנוצר”.', codeSelectionFeedback: 'כמעט. עכשיו לחצו על בלוק עיצוב שמייצר שורת CSS ברורה, וודאו שהוא מופיע בכרטיס המשימה תחת “נבחר בלוק”.', codeLineAnswerFeedback: 'כמעט. הקלידו בתיבה את שורת ה־CSS שסומנה. אפשר לבחור שורה קצרה כמו background: #dcfce7; או border-radius: 30px;' } }
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
    title: 'בונים עמוד אמיתי עם Blockly',
    concept: 'בלוקים מחוברים → עמוד Web: מבנה · עיצוב · פעולה',
    story: 'היום בונים עמוד מבלוקים אמיתיים: גוררים בלוק, מחברים לשרשרת, ורואים מיד שינוי בתצוגה.',
    mission: 'חברו בלוקים מתחת ל“עמוד האתר שלי”. רק בלוקים מחוברים יוצרים את העמוד.',
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
      { id: 1, minutes: '8–16', title: 'תרגיל 1 — מחברים בלוק כותרת', prompt: 'גררו בלוק “כותרת” וחברו אותו מתחת ל“עמוד האתר שלי”. שנו את הטקסט בתוך הבלוק.', hint: 'הבלוק חייב להיצמד לבלוק שמעליו, כמו פאזל.', check: { htmlIncludes: ['<h1>'], blockTypes: ['web_title'], nonEmptyBlocklyFields: [{ type: 'web_title', field: 'TEXT' }], changedBlocklyFields: [{ type: 'web_title', field: 'TEXT', defaultValue: 'האתר הראשון שלי' }], qualityBlocklyFields: [{ type: 'web_title', field: 'TEXT', minChars: 6, minWords: 2 }], emptyFeedback: 'כמעט. הכותרת מחוברת, אבל היא לא יכולה להיות ריקה.', fieldFeedback: 'כמעט. הכותרת מחוברת, עכשיו שנו את הטקסט שבתוך בלוק הכותרת.', qualityFeedback: 'כמעט. הכותרת עדיין כללית מדי. כתבו כותרת שמספרת על הנושא שבחרתם, למשל “הגינה החלומית שלי”.' } },
      { id: 2, minutes: '16–24', title: 'תרגיל 2 — מוסיפים פסקה', prompt: 'גררו בלוק “פסקה”, חברו אותו מתחת לכותרת, וכתבו משפט על העמוד שלכם.', hint: 'הפסקה צריכה להיות מחוברת מתחת לכותרת, לא מעליה.', check: { htmlIncludes: ['<p>'], blockTypes: ['web_paragraph'], orderedBlockTypes: ['web_title', 'web_paragraph'], nonEmptyBlocklyFields: [{ type: 'web_paragraph', field: 'TEXT' }], changedBlocklyFields: [{ type: 'web_paragraph', field: 'TEXT', defaultValue: 'אני בונה עמוד עם בלוקלי אמיתי' }], qualityBlocklyFields: [{ type: 'web_paragraph', field: 'TEXT', minChars: 18, minWords: 5 }], relatedBlocklyTextGroups: [{ fields: [{ type: 'web_title', field: 'TEXT' }, { type: 'web_paragraph', field: 'TEXT' }], minFields: 2, minSharedWords: 1 }], orderFeedback: 'כמעט. הפסקה צריכה להיות מחוברת מתחת לכותרת.', emptyFeedback: 'כמעט. הפסקה במקום הנכון, אבל היא לא יכולה להיות ריקה.', fieldFeedback: 'כמעט. הפסקה במקום הנכון, עכשיו שנו את הטקסט שבתוך בלוק הפסקה.', qualityFeedback: 'כמעט. הפסקה צריכה להיות משפט אמיתי שמתאים לנושא, לא רק מילה אחת או טקסט כללי.', relatedTextFeedback: 'כמעט. נסו שהפסקה תתחבר לנושא שבכותרת.' } },
      { id: 3, minutes: '24–32', title: 'תרגיל 3 — בוחרים סמל גדול', prompt: 'גררו בלוק “סמל גדול”, חברו אותו לעמוד, ובחרו אימוג׳י שמתאים לעמוד.', hint: 'זה בלוק תוכן ויזואלי, לא קוד.', check: { htmlIncludes: ['hero-emoji'], blockTypes: ['web_emoji'] } },
      { id: 4, minutes: '32–42', title: 'תרגיל 4 — מחליפים עיצוב', prompt: 'גררו בלוק “עיצוב עמוד” ובחרו פלטה שאינה ברירת המחדל.', hint: 'פתחו את התפריט בתוך בלוק העיצוב ובחרו אפשרות אחרת.', check: { cssIncludes: ['background:'], blockTypes: ['web_theme'], changedBlocklyFields: [{ type: 'web_theme', field: 'THEME', defaultValue: 'sky' }], fieldFeedback: 'כמעט. בלוק העיצוב מחובר, עכשיו בחרו פלטה אחרת מתוך התפריט שבתוכו.' } },
      { id: 5, minutes: '42–54', title: 'תרגיל 5 — כפתור עם הודעה', prompt: 'חברו בלוק “כפתור” ושנו גם את טקסט הכפתור וגם את ההודעה שהוא מציג.', hint: 'אחרי הרצה, לחצו על הכפתור בתצוגה החיה.', check: { htmlIncludes: ['onclick="showMessage()"'], jsIncludes: ['function showMessage'], blockTypes: ['web_button'], nonEmptyBlocklyFields: [{ type: 'web_button', field: 'LABEL' }, { type: 'web_button', field: 'MESSAGE' }], changedBlocklyFields: [{ type: 'web_button', field: 'LABEL', defaultValue: 'לחצו להפתעה' }, { type: 'web_button', field: 'MESSAGE', defaultValue: 'הכפתור שלי עובד 🎉' }], qualityBlocklyFields: [{ type: 'web_button', field: 'LABEL', minChars: 5, minWords: 2 }, { type: 'web_button', field: 'MESSAGE', minChars: 12, minWords: 3 }], emptyFeedback: 'כמעט. הכפתור מחובר, אבל טקסט הכפתור וההודעה לא יכולים להיות ריקים.', fieldFeedback: 'כמעט. הכפתור מחובר, עכשיו שנו גם את טקסט הכפתור וגם את ההודעה שבתוכו.', qualityFeedback: 'כמעט. טקסט הכפתור או ההודעה עדיין כלליים מדי. כתבו פעולה והודעה שמתאימות לעמוד שבחרתם.' } },
      { id: 6, minutes: '54–64', title: 'תרגיל 6 — שתי קוביות מידע וסדר', prompt: 'גררו בלוק “שתי קוביות מידע”, כתבו שני רעיונות, ומקמו אותו מתחת לפסקה ולפני הכפתור.', hint: 'קוביות המידע הן חלק מהתוכן של העמוד, לכן הגיוני שהן יופיעו לפני הכפתור.', check: { htmlIncludes: ['class="columns"'], cssIncludes: ['grid-template-columns'], blockTypes: ['web_columns'], orderedBlockTypes: ['web_paragraph', 'web_columns', 'web_button'], nonEmptyBlocklyFields: [{ type: 'web_columns', field: 'A' }, { type: 'web_columns', field: 'B' }], changedBlocklyFields: [{ type: 'web_columns', field: 'A', defaultValue: 'רעיון ראשון' }, { type: 'web_columns', field: 'B', defaultValue: 'רעיון שני' }], qualityBlocklyFields: [{ type: 'web_columns', field: 'A', minChars: 8, minWords: 2 }, { type: 'web_columns', field: 'B', minChars: 8, minWords: 2 }], relatedBlocklyTextGroups: [{ fields: [{ type: 'web_title', field: 'TEXT' }, { type: 'web_paragraph', field: 'TEXT' }, { type: 'web_columns', field: 'A' }, { type: 'web_columns', field: 'B' }], minFields: 3, minSharedWords: 1 }], orderFeedback: 'כמעט. גררו את “שתי קוביות מידע” מתחת לפסקה ולפני הכפתור.', emptyFeedback: 'כמעט. שתי קוביות המידע צריכות להכיל טקסט.', fieldFeedback: 'כמעט. כתבו שני רעיונות משלכם בתוך קוביות המידע.', qualityFeedback: 'כמעט. קוביות המידע צריכות להכיל רעיונות ברורים, לא מילים כלליות כמו “רעיון” או “טקסט”.', relatedTextFeedback: 'כמעט. נסו שקוביות המידע יתחברו לנושא של הכותרת והפסקה.' } },
      { id: 7, minutes: '64–74', title: 'תרגיל 7 — חתימה בסוף הדף', prompt: 'הוסיפו בלוק “חתימה” וגררו אותו להיות הבלוק האחרון בשרשרת, כדי שהחתימה תופיע בסוף הדף.', hint: 'חתימה היא הסיום של העמוד — היא צריכה להופיע אחרי התוכן והכפתור.', check: { htmlIncludes: ['<footer>'], blockTypes: ['web_footer'], nonEmptyBlocklyFields: [{ type: 'web_footer', field: 'TEXT' }], qualityBlocklyFields: [{ type: 'web_footer', field: 'TEXT', minChars: 6, minWords: 2 }], footerMustBeLast: true, blockFeedback: 'כמעט. קודם חברו בלוק חתימה לשרשרת.', emptyFeedback: 'כמעט. החתימה לא יכולה להיות ריקה.', qualityFeedback: 'כמעט. כתבו חתימה אמיתית לסוף הדף, למשל שם יוצר/ת או משפט סיום קצר.', footerLastFeedback: 'כמעט. גררו את בלוק החתימה לסוף השרשרת — מתחת לכל שאר בלוקי העמוד.' } },
      { id: 8, minutes: '74–84', title: 'תרגיל 8 — הצצה לקוד', prompt: 'פתחו למטה במסך את “הצצה לקוד שנוצר”, לחצו על אחד הבלוקים שלכם, ומצאו איפה השורה שלו מסומנת ב־HTML או CSS.', hint: 'לא צריך לערוך קוד. לחצו על בלוק בעמוד כדי להדגיש את השורה שהוא יצר בקוד.', check: { htmlIncludes: ['page-card'], cssIncludes: ['.page-card'], jsIncludes: ['textContent'], blockTypes: ['web_title', 'web_paragraph'], nonEmptyBlocklyFields: [{ type: 'web_title', field: 'TEXT' }, { type: 'web_paragraph', field: 'TEXT' }], requiresCodePeek: true, requiresCodeSelectionTabs: ['html', 'css'], requiresCodeSelectionBlockTypes: ['page_start', 'web_theme', 'web_title', 'web_paragraph', 'web_emoji', 'web_button', 'web_columns', 'web_footer'], emptyFeedback: 'כמעט. לפני שמציצים לקוד, ודאו שהכותרת והפסקה לא ריקות.', codePeekFeedback: 'כמעט. קודם פתחו למטה במסך את “הצצה לקוד שנוצר”.', codeSelectionFeedback: 'כמעט. עכשיו לחצו על אחד הבלוקים שלכם וודאו ששורה מתאימה מסומנת ב־HTML או CSS.' } }
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

  Object.assign(lessons[6], {
    title: 'דני אופה עוגיות — משחק קליקים ראשון',
    concept: 'משחק קליקים → score · target · התקדמות · ניצחון',
    story: 'פותחים את יחידת המשחקים בסיפור ביתי וחביב: דני אופה עוגיות למגש. כל קליק אופה עוד עוגייה, ממלא מד התקדמות, משנה את מצב דני, ובסוף המגש מלא והעוגיות מוכנות.',
    mission: 'לבנות משחק אפיית עוגיות קטן: ללחוץ כדי לאפות עוגייה, להעלות ניקוד, למלא מד יעד ולחגוג כשהמגש מלא.',
    outcome: 'משחק קליקים צבעוני עם דני, מד התקדמות וניצחון, שמלמד score, target ו־classList בלי להרגיש כמו תרגיל',
    starter: {
      html: `<main class="cookie-game">
  <h1>דני אופה עוגיות</h1>
  <div id="baker" class="baker">👦</div>
  <p>עוגיות שנאפו: <span id="scoreText">0</span> מתוך <span id="targetText">10</span></p>
  <div class="progress"><div id="progressFill"></div></div>
  <button id="clickButton" onclick="bakeCookie()">🍪 אפו עוגייה</button>
  <button onclick="resetGame()">איפוס</button>
  <p id="message">דני מתחיל לאפות. הגיעו ל־10 עוגיות במגש!</p>
</main>`,
      css: `body {
  font-family: Arial, sans-serif;
  direction: rtl;
  text-align: center;
  background: linear-gradient(135deg, #fff7ed, #dbeafe);
}

.cookie-game {
  background: white;
  width: min(430px, 92vw);
  margin: 42px auto;
  padding: 30px;
  border-radius: 30px;
  box-shadow: 0 18px 40px #fed7aa;
}

.baker {
  font-size: 84px;
  transition: transform 0.2s;
}

.baker.bump {
  transform: scale(1.18) rotate(-4deg);
}

.progress {
  height: 18px;
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
  margin: 18px 0;
}

#progressFill {
  width: 0%;
  height: 100%;
  background: linear-gradient(90deg, #f97316, #22c55e);
}

button {
  margin: 8px;
  padding: 14px 20px;
  border: 0;
  border-radius: 999px;
  background: #f97316;
  color: white;
  font-weight: bold;
  cursor: pointer;
}

.win {
  background: #dcfce7;
  border: 3px solid #22c55e;
}`,
      js: `let score = 0;
const target = 10;
document.getElementById("targetText").textContent = target;
document.getElementById("message").textContent = "דני מתחיל לאפות. הגיעו ל־" + target + " עוגיות במגש!";

function bakeCookie() {
  if (score >= target) {
    return;
  }

  score = score + 1;
  if (score > target) {
    score = target;
  }
  document.getElementById("scoreText").textContent = score;
  document.getElementById("progressFill").style.width = Math.min(score / target * 100, 100) + "%";

  const baker = document.getElementById("baker");
  baker.classList.add("bump");
  setTimeout(function () {
    baker.classList.remove("bump");
  }, 200);

  if (score >= target) {
    baker.textContent = "🥳";
    document.getElementById("message").textContent = "המגש מלא! העוגיות מוכנות 🍪";
    document.querySelector(".cookie-game").classList.add("win");
  } else {
    document.getElementById("message").textContent = "נשארו עוד " + (target - score) + " עוגיות לאפות.";
  }
}

function resetGame() {
  score = 0;
  document.getElementById("scoreText").textContent = score;
  document.getElementById("progressFill").style.width = "0%";
  document.getElementById("baker").textContent = "👦";
  document.getElementById("targetText").textContent = target;
  document.getElementById("message").textContent = "דני מתחיל לאפות. הגיעו ל־" + target + " עוגיות במגש!";
  document.querySelector(".cookie-game").classList.remove("win");
}`
    },
    lessonFlow: [
      { minutes: '0–8', title: 'וואו: דני מתחיל לאפות', teacher: 'מריצים מיד את המשחק, אופים כמה עוגיות, ונותנים לילדים לזהות מה השתנה.', students: 'מזהים את דני, עוגיות שנאפו, ניקוד, מד התקדמות וניצחון.' },
      { minutes: '8–18', title: 'הקליק שאופה', teacher: 'מצביעים על כפתור העוגייה ועל bakeCookie, בלי להעמיס תחביר.', students: 'מחברים בין לחיצה לבין עליית score.' },
      { minutes: '18–34', title: 'מד התקדמות', teacher: 'מדגימים איך score/target הופך לאחוז רוחב במד.', students: 'רואים שהמספר יוצר שינוי ויזואלי.' },
      { minutes: '34–50', title: 'מגש מלא', teacher: 'מראים את התנאי score >= target ואת שינוי מצב דני.', students: 'מסבירים מתי המשחק מחליט שהמגש מלא.' },
      { minutes: '50–66', title: 'שדרוגים בבלוקים', teacher: 'נותנים לשנות יעד, הודעה, צבע וטקסט כפתור דרך בלוקים מוכנים.', students: 'יוצרים גרסת אפייה אישית.' },
      { minutes: '66–78', title: 'דיבאג ידידותי', teacher: 'מדגימים מה קורה אם scoreText או progressFill לא תואמים.', students: 'בודקים id ומתקנים בלי לפחד.' },
      { minutes: '78–90', title: 'תערוכת מאפיות', teacher: 'זוגות משחקים ומצביעים על שדרוג אחד.', students: 'מציגים משחק אפייה ואומרים מה הבלוק שלהם שינה.' }
    ],
    exercises: [
      { id: 1, minutes: '0–8', title: 'תרגול 1 — אופים קודם', prompt: 'הריצו ולחצו על העוגייה עד שדני מסיים לאפות.', hint: 'קודם משחקים, אחר כך מחפשים את הקוד.', check: { htmlIncludes: ['id="clickButton"', 'id="baker"'], jsIncludes: ['function bakeCookie'] } },
      { id: 2, minutes: '8–18', title: 'תרגול 2 — מוצאים ניקוד', prompt: 'מצאו איפה score מתחיל ואיפה הוא עולה בכל קליק.', hint: 'חפשו score = score + 1.', check: { jsIncludes: ['let score = 0', 'score = score + 1'] } },
      { id: 3, minutes: '18–28', title: 'תרגול 3 — יעד 10', prompt: 'מצאו את יעד העוגיות ובדקו שהוא 10.', hint: 'היעד נקרא target.', check: { jsIncludes: ['const target = 10'] } },
      { id: 4, minutes: '28–38', title: 'תרגול 4 — מד מתמלא', prompt: 'מצאו את השורה שמשנה את רוחב מד ההתקדמות.', hint: 'width משנה את המד במסך.', check: { jsIncludes: ['progressFill', 'style.width'] } },
      { id: 5, minutes: '38–50', title: 'תרגול 5 — חגיגת ניצחון', prompt: 'בדקו מה קורה כשהניקוד מגיע ליעד.', hint: 'חפשו score >= target.', check: { jsIncludes: ['score >= target'], cssIncludes: ['.win'] } },
      { id: 6, minutes: '50–60', title: 'תרגול 6 — הודעה אישית', prompt: 'שנו את הודעת הניצחון או טקסט הכפתור.', hint: 'שינוי בטוח: טקסט או אימוג׳י בתוך גרשיים.', check: { htmlIncludes: ['baker'], jsIncludes: ['textContent'] } },
      { id: 7, minutes: '60–74', title: 'תרגול 7 — דיבאג id', prompt: 'אם המד או הניקוד לא משתנים, בדקו שה־id זהה ב־HTML וב־JS.', hint: 'scoreText ו־progressFill חייבים להיות כתובים אותו דבר.', check: { htmlIncludes: ['id="scoreText"', 'id="progressFill"'], jsIncludes: ['getElementById("scoreText")', 'getElementById("progressFill")'] } },
      { id: 8, minutes: '74–84', title: 'תרגול 8 — בדיקת חבר', prompt: 'תנו לחבר לשחק והחליטו אם צריך יעד קל או קשה יותר.', hint: 'משחק טוב נותן ניצחון, אבל לא מיד.', check: { jsIncludes: ['target', 'resetGame'], htmlIncludes: ['button'] } }
    ],
    aiHelper: [
      'הציעו 5 רעיונות חביבים למשחק אפיית עוגיות.',
      'עזרו לילד להסביר איך score ממלא את מד ההתקדמות.',
      'הציעו הודעות ניצחון חביבות לסיום האפייה.',
      'עזרו לאזן יעד של 5, 10 או 15 עוגיות לאפות.'
    ],
    vocabulary: [
      ['score', 'כמה עוגיות דני אפה'],
      ['target', 'כמה צריך כדי לנצח'],
      ['progress', 'מד שמראה כמה התקדמנו'],
      ['style.width', 'שינוי רוחב של אלמנט במסך'],
      ['classList', 'דרך להוסיף מצב עיצובי כמו ניצחון']
    ],
    bridgeBlocks: [
      { label: '🍪 טקסט כפתור אפייה', target: 'html', find: '🍪 אפו עוגייה', replace: '🍪 אפו עוד!', hint: 'בלוק משחק: משנה את הפעולה שהתלמיד רואה.' },
      { label: '🏁 יעד קל 5', target: 'js', find: 'const target = 10;', replace: 'const target = 5;', hint: 'בלוק איזון: מקצר את המשחק.' },
      { label: '✌️ שתי עוגיות', target: 'js', find: 'score = score + 1;', replace: 'score = score + 2;', hint: 'בלוק ניקוד: כל קליק שווה יותר.' },
            { label: '🎉 הודעת ניצחון', target: 'js', find: 'המגש מלא! העוגיות מוכנות 🍪', replace: 'אליפות! דני מילא מגש עוגיות 🎉', hint: 'בלוק משוב: משנה הודעת סיום.' },
      { label: '🟢 צבע ניצחון', target: 'css', find: 'background: #dcfce7;', replace: 'background: #bbf7d0;', hint: 'בלוק עיצוב: משנה את מצב הניצחון.' }
    ]
  });

  Object.assign(lessons[7], {
    title: 'טיימר הצלת העיר — משחק נגד השעון',
    concept: 'טיימר משחק → timeLeft · setInterval · משימה בזמן',
    story: 'הילדים מקבלים עיר חשוכה ו־15 שניות להציל אותה. כל לחיצה מדליקה עוד חלון בבניין, והשעון יורד. זה עדיין מלמד טיימר וניקוד, אבל מרגיש כמו משימת הצלה.',
    mission: 'לבנות אתגר זמן שבו מדליקים כמה שיותר חלונות בעיר לפני שהשעון מגיע לאפס.',
    outcome: 'משחק הצלת עיר עם טיימר, חלונות נדלקים והודעת סיום לפי ניקוד',
    starter: {
      html: `<main class="city-game">
  <h1>הצילו את העיר!</h1>
  <p>חלונות מוארים: <span id="scoreText">0</span> | זמן: <span id="timeText">15</span></p>
  <div id="city" class="city"></div>
  <button id="startButton" onclick="startGame()">▶️ התחילו משימה</button>
  <button id="clickButton" onclick="lightWindow()">💡 הדליקו חלון</button>
  <p id="message">יש לכם 15 שניות להאיר את העיר.</p>
  <p id="windowsSummary"></p>
</main>`,
      css: `body {
  font-family: Arial, sans-serif;
  direction: rtl;
  text-align: center;
  background: linear-gradient(135deg, #0f172a, #1e3a8a);
  color: #f8fafc;
}

.city-game {
  background: #111827;
  width: min(450px, 92vw);
  margin: 42px auto;
  padding: 30px;
  border-radius: 30px;
  box-shadow: 0 18px 45px #1d4ed8;
}

.city {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  margin: 22px auto;
}

.city span {
  height: 46px;
  background: #334155;
  border-radius: 10px;
}

.city span.lit {
  background: #fde047;
  box-shadow: 0 0 18px #facc15;
}

button {
  margin: 8px;
  padding: 14px 20px;
  border: 0;
  border-radius: 999px;
  background: #38bdf8;
  color: #0f172a;
  font-weight: bold;
  cursor: pointer;
}

.finished {
  border: 3px solid #fde047;
}`,
      js: `let score = 0;
const startTime = 15;
const totalWindows = 10;
document.getElementById("timeText").textContent = startTime;
document.getElementById("message").textContent = "יש לכם " + startTime + " שניות להאיר את העיר.";
document.getElementById("windowsSummary").textContent = "";
let timeLeft = startTime;
let timerId = null;

function buildCity() {
  const city = document.getElementById("city");
  city.innerHTML = "";
  for (let i = 0; i < totalWindows; i = i + 1) {
    const windowBox = document.createElement("span");
    city.appendChild(windowBox);
  }
}

buildCity();

function startGame() {
  score = 0;
  timeLeft = startTime;
  document.getElementById("scoreText").textContent = score;
  document.getElementById("timeText").textContent = timeLeft;
  document.getElementById("message").textContent = "רוצו! העיר מחכה לאור.";
  document.getElementById("windowsSummary").textContent = "";
  buildCity();
  document.querySelectorAll("#city span").forEach(function (windowBox) {
    windowBox.classList.remove("lit");
  });
  clearInterval(timerId);
  timerId = setInterval(tick, 1000);
}

function tick() {
  timeLeft = timeLeft - 1;
  document.getElementById("timeText").textContent = timeLeft;

  if (timeLeft <= 0) {
    clearInterval(timerId);
    document.getElementById("message").textContent = "כל הכבוד 🎉";
    document.getElementById("windowsSummary").textContent = "מספר החלונות שהארתם הוא: " + score;
    document.querySelector(".city-game").classList.add("finished");
  }
}

function lightWindow() {
  if (timeLeft > 0) {
    const windows = document.querySelectorAll("#city span");
    if (score >= windows.length) {
      return;
    }
    windows[score].classList.add("lit");
    score = score + 1;
    document.getElementById("scoreText").textContent = score;
  }
}`
    },
    lessonFlow: [
      { minutes: '0–8', title: 'וואו: עיר חשוכה', teacher: 'מריצים, לוחצים התחלה, ומדליקים חלונות עד שהזמן נגמר.', students: 'מרגישים משימת זמן ולא עוד תרגיל ניקוד.' },
      { minutes: '8–18', title: 'השעון מתחיל', teacher: 'מצביעים על timeLeft ועל setInterval כפעימת שעון.', students: 'מזהים שכל שנייה משנה את המסך.' },
      { minutes: '18–34', title: 'חלונות נדלקים', teacher: 'מראים איך score בוחר את החלון הבא ברשימה.', students: 'מחברים בין ניקוד לבין שינוי ויזואלי.' },
      { minutes: '34–50', title: 'סיום משימה', teacher: 'מראים clearInterval והודעת סיום.', students: 'מבינים למה צריך לעצור טיימר.' },
      { minutes: '50–66', title: 'שדרוגי עיר', teacher: 'נותנים לשנות זמן, הודעה וצבע חלונות.', students: 'יוצרים עיר בסגנון אישי.' },
      { minutes: '66–78', title: 'דיבאג זמן', teacher: 'בודקים timeText ו־timerId.', students: 'מוצאים למה שעון לא יורד או לא נעצר.' },
      { minutes: '78–90', title: 'תחרות ידידותית', teacher: 'זוגות בודקים אם 15 שניות מאוזן.', students: 'מציעים איזון זמן וקושי.' }
    ],
    exercises: [
      { id: 1, minutes: '0–8', title: 'תרגול 1 — מצילים עיר', prompt: 'הריצו, התחילו משימה, והדליקו כמה שיותר חלונות.', hint: 'אל תגעו בקוד לפני שהבנתם את המשחק.', check: { htmlIncludes: ['id="city"', 'id="timeText"'], jsIncludes: ['function startGame'] } },
      { id: 2, minutes: '8–18', title: 'תרגול 2 — מוצאים טיימר', prompt: 'מצאו איפה הזמן מתחיל מ־15.', hint: 'חפשו timeLeft.', check: { jsIncludes: ['let timeLeft = 15'] } },
      { id: 3, minutes: '18–28', title: 'תרגול 3 — פעימת שעון', prompt: 'מצאו את הקוד שמוריד שנייה.', hint: 'tick היא פעימת הזמן.', check: { jsIncludes: ['setInterval', 'timeLeft = timeLeft - 1'] } },
      { id: 4, minutes: '28–38', title: 'תרגול 4 — חלון נדלק', prompt: 'מצאו איזה קוד מוסיף class לחלון.', hint: 'class lit מדליק חלון.', check: { jsIncludes: ['classList.add("lit")'], cssIncludes: ['.city span.lit'] } },
      { id: 5, minutes: '38–50', title: 'תרגול 5 — סיום זמן', prompt: 'מצאו מה קורה כשהזמן מגיע לאפס.', hint: 'חפשו timeLeft <= 0.', check: { jsIncludes: ['timeLeft <= 0', 'clearInterval'] } },
      { id: 6, minutes: '50–60', title: 'תרגול 6 — זמן קצר', prompt: 'שנו את הזמן ל־10 שניות ובדקו אם זה מלחיץ מדי.', hint: 'צריך לשנות גם בהתחלה וגם ב־startGame.', check: { jsIncludes: ['timeLeft'] } },
      { id: 7, minutes: '60–74', title: 'תרגול 7 — דיבאג עיר', prompt: 'אם חלונות לא נדלקים, בדקו שיש #city span גם ב־HTML וגם ב־JS.', hint: 'ה־querySelectorAll מחפש את החלונות.', check: { htmlIncludes: ['id="city"'], jsIncludes: ['querySelectorAll("#city span")'] } },
      { id: 8, minutes: '74–84', title: 'תרגול 8 — מבחן זמן', prompt: 'תנו לחבר לשחק והחליטו אם העיר צריכה יותר חלונות או יותר זמן.', hint: 'איזון טוב יוצר לחץ כיפי.', check: { jsIncludes: ['timerId', 'score'], htmlIncludes: ['startButton'] } }
    ],
    aiHelper: [
      'הציעו סיפור קצר למשימת הצלת עיר בזמן.',
      'עזרו לילד להסביר מה עושה setInterval.',
      'הציעו הודעות סיום לפי ניקוד נמוך/בינוני/גבוה.',
      'עזרו לאזן מספר חלונות וזמן משחק.'
    ],
    vocabulary: [
      ['timeLeft', 'כמה זמן נשאר למשימה'],
      ['setInterval', 'להפעיל פעולה שוב ושוב לפי זמן'],
      ['tick', 'פעימת שעון אחת'],
      ['querySelectorAll', 'בחירה של כמה אלמנטים יחד'],
      ['clearInterval', 'לעצור את השעון']
    ],
    bridgeBlocks: [
      { label: '⏱️ זמן 15', target: 'js', find: 'let timeLeft = 15;', replace: 'let timeLeft = 15;', hint: 'בלוק זמן: זמן המשימה.' },
      { label: '⚡ זמן קצר 10', target: 'js', find: 'timeLeft = 15;', replace: 'timeLeft = 10;', hint: 'בלוק איזון: מקצר את המשימה.' },
      { label: '💡 טקסט כפתור', target: 'html', find: '💡 הדליקו חלון', replace: '💡 הצילו חלון!', hint: 'בלוק חוויה: משנה את הפעולה.' },
      { label: '🏁 הודעת סיום', target: 'js', find: 'כל הכבוד 🎉', replace: 'כל הכבוד 🎉', hint: 'בלוק משוב: הודעת סוף.' },
      { label: '🟡 צבע חלון', target: 'css', find: 'background: #fde047;', replace: 'background: #a7f3d0;', hint: 'בלוק עיצוב: משנה חלון מואר.' },
      { label: '📺 הצג זמן', target: 'js', find: 'document.getElementById("timeText").textContent = timeLeft;', replace: 'document.getElementById("timeText").textContent = timeLeft;', hint: 'בלוק תצוגה: מעדכן זמן במסך.' }
    ]
  });

  Object.assign(lessons[8], {
    title: 'תופסים כוכבים, לא מכשולים',
    concept: 'חוקי משחק → lives · random · if · בחירה נכונה',
    story: 'המשחק כבר לא כפתור שמוריד חיים. עכשיו מופיע כרטיס הפתעה: לפעמים כוכב ולפעמים מכשול. הילד צריך להחליט מהר אם ללחוץ או לדלג.',
    mission: 'לבנות משחק תגובה שבו אוספים כוכבים, נזהרים ממכשולים, ושומרים על חיים.',
    outcome: 'משחק תגובה עם כרטיס מתחלף, ניקוד וחיים, שמרגיש שונה ממשחק הקליקים',
    starter: {
      html: `<main class="reaction-game">
  <h1>כוכבים או מכשולים?</h1>
  <p>ניקוד: <span id="scoreText">0</span> | חיים: <span id="livesText">3</span></p>
  <button id="itemButton" class="item star" onclick="chooseItem()">⭐</button>
  <button onclick="skipItem()">דלגו</button>
  <button onclick="resetGame()">איפוס</button>
  <p id="message">לחצו על כוכבים. דלגו על מכשולים.</p>
</main>`,
      css: `body {
  font-family: Arial, sans-serif;
  direction: rtl;
  text-align: center;
  background: linear-gradient(135deg, #eef2ff, #fff7ed);
}

.reaction-game {
  background: white;
  width: min(430px, 92vw);
  margin: 42px auto;
  padding: 30px;
  border-radius: 30px;
  box-shadow: 0 18px 40px #c7d2fe;
}

.item {
  display: block;
  width: 120px;
  height: 120px;
  margin: 20px auto;
  font-size: 58px;
  border-radius: 28px;
  transition: transform 0.15s;
}

.item:hover {
  transform: scale(1.08);
}

.star {
  background: #fef3c7;
}

.obstacle {
  background: #fee2e2;
}

button {
  margin: 8px;
  padding: 13px 18px;
  border: 0;
  border-radius: 999px;
  background: #7c3aed;
  color: white;
  font-weight: bold;
  cursor: pointer;
}

.game-over {
  background: #f1f5f9;
  border: 3px solid #64748b;
}`,
      js: `let score = 0;
const startLives = 3;
let lives = startLives;
document.getElementById("livesText").textContent = startLives;
let currentItem = "star";

function nextItem(feedbackText = "") {
  if (lives <= 0) {
    return;
  }
  const itemButton = document.getElementById("itemButton");
  const options = ["star", "obstacle"];
  currentItem = options[Math.floor(Math.random() * options.length)];
  let nextMessage = "";

  if (currentItem === "star") {
    itemButton.textContent = "⭐";
    itemButton.className = "item star";
    nextMessage = "כוכב! כדאי ללחוץ.";
  } else {
    itemButton.textContent = "🌋";
    itemButton.className = "item obstacle";
    nextMessage = "מכשול! עדיף לדלג.";
  }

  document.getElementById("message").textContent = feedbackText ? feedbackText + " " + nextMessage : nextMessage;
}

function chooseItem() {
  if (lives <= 0) {
    return;
  }
  if (currentItem === "star") {
    score = score + 1;
    document.getElementById("scoreText").textContent = score;
    nextItem("אספתם כוכב ⭐");
  } else {
    loseLife();
    if (lives > 0) {
      nextItem();
    }
  }
}

function skipItem() {
  if (lives <= 0) {
    return;
  }
  if (currentItem === "obstacle") {
    nextItem("דילוג חכם!");
  } else {
    score = Math.max(0, score - 1);
    document.getElementById("scoreText").textContent = score;
    nextItem("אופס, דילגתם על כוכב ואיבדתם נקודה.");
  }
}

function loseLife() {
  lives = lives - 1;
  document.getElementById("livesText").textContent = lives;

  if (lives <= 0) {
    document.getElementById("message").textContent = "נגמרו החיים. נסו שוב!";
    document.querySelector(".reaction-game").classList.add("game-over");
  }
}

function resetGame() {
  score = 0;
  lives = startLives;
  document.getElementById("scoreText").textContent = score;
  document.getElementById("livesText").textContent = lives;
  document.querySelector(".reaction-game").classList.remove("game-over");
  nextItem();
}`
    },
    lessonFlow: [
      { minutes: '0–8', title: 'וואו: ללחוץ או לדלג?', teacher: 'מריצים כמה סיבובים ומבקשים מהכיתה להגיד מהר: ללחוץ או לדלג.', students: 'מבינים חוק משחק דרך פעולה, לא דרך הסבר.' },
      { minutes: '8–18', title: 'כוכב מול מכשול', teacher: 'מראים currentItem כמצב הנוכחי של המשחק.', students: 'מחברים בין מה שרואים לבין הערך בקוד.' },
      { minutes: '18–34', title: 'אקראיות פשוטה', teacher: 'מצביעים על options ועל Math.random בלי להיכנס לעומק מתמטי.', students: 'מבינים שהמשחק מחליף בין כוכב למכשול.' },
      { minutes: '34–50', title: 'חיים ופסילה', teacher: 'מדגימים loseLife והבדיקה lives <= 0.', students: 'רואים איך טעות מורידה חיים.' },
      { minutes: '50–66', title: 'שדרוגי חוק', teacher: 'נותנים לשנות מספר חיים, הודעות וסמלי פריטים.', students: 'יוצרים גרסה מצחיקה או מאתגרת.' },
      { minutes: '66–78', title: 'דיבאג חוק משחק', teacher: 'בודקים itemButton, currentItem ו־livesText.', students: 'מתקנים מצב שבו המשחק לא יודע מה הפריט.' },
      { minutes: '78–90', title: 'טסט שחקנים', teacher: 'זוגות משחקים ומחליטים אם המשחק הוגן.', students: 'מסבירים חוק אחד שבנו.' }
    ],
    exercises: [
      { id: 1, minutes: '0–8', title: 'תרגול 1 — משחקים קודם', prompt: 'הריצו, החליפו פריט, ולחצו רק כשמופיע כוכב.', hint: 'החוויה חשובה לפני הקוד.', check: { htmlIncludes: ['id="itemButton"'], jsIncludes: ['function chooseItem'] } },
      { id: 2, minutes: '8–18', title: 'תרגול 2 — מצב הפריט', prompt: 'מצאו את currentItem ובדקו שהוא מתחיל כ־star.', hint: 'currentItem אומר מה מופיע עכשיו.', check: { jsIncludes: ['let currentItem = "star"'] } },
      { id: 3, minutes: '18–28', title: 'תרגול 3 — פריט אקראי', prompt: 'מצאו את הרשימה שממנה המשחק בוחר כוכב או מכשול.', hint: 'חפשו options.', check: { jsIncludes: ['Math.random', 'options'] } },
      { id: 4, minutes: '28–38', title: 'תרגול 4 — תנאי בחירה', prompt: 'מצאו מה קורה אם הפריט הוא כוכב.', hint: 'חפשו if (currentItem === "star").', check: { jsIncludes: ['if (currentItem === "star")'] } },
      { id: 5, minutes: '38–50', title: 'תרגול 5 — חיים יורדים', prompt: 'מצאו איפה מכשול מוריד חיים.', hint: 'loseLife אחראית לפסילה.', check: { jsIncludes: ['let lives = 3', 'lives = lives - 1'] } },
      { id: 6, minutes: '50–60', title: 'תרגול 6 — Game Over', prompt: 'בדקו מה קורה כשהחיים מגיעים ל־0.', hint: 'חפשו lives <= 0.', check: { jsIncludes: ['lives <= 0'], cssIncludes: ['.game-over'] } },
      { id: 7, minutes: '60–74', title: 'תרגול 7 — דיבאג כפתור', prompt: 'אם הפריט לא משתנה, בדקו itemButton ו־className.', hint: 'אותו כפתור מחליף גם סמל וגם class.', check: { htmlIncludes: ['id="itemButton"'], jsIncludes: ['itemButton.className'] } },
      { id: 8, minutes: '74–84', title: 'תרגול 8 — איזון חיים', prompt: 'תנו לחבר לשחק והחליטו אם צריך 3 או 5 חיים.', hint: 'יותר חיים מתאים לכיתה שמתחילה.', check: { jsIncludes: ['lives', 'resetGame'], htmlIncludes: ['skipItem'] } }
    ],
    aiHelper: [
      'הציעו זוגות של פרס ומכשול שילדים יבינו מיד.',
      'הסבירו currentItem כמו קלף שמונח עכשיו על השולחן.',
      'עזרו לילד להבין למה דילוג על כוכב הוא לא פסילה.',
      'הציעו רמת קושי קלה/בינונית/קשה למשחק תגובה.'
    ],
    vocabulary: [
      ['lives', 'כמה ניסיונות נשארו'],
      ['currentItem', 'הפריט שמופיע עכשיו במשחק'],
      ['random', 'בחירה אקראית של פריט'],
      ['if', 'אם זה כוכב עושים דבר אחד, אחרת דבר אחר'],
      ['game over', 'מצב שבו אין יותר חיים']
    ],
    bridgeBlocks: [
      { label: '❤️ 5 חיים', target: 'js', find: 'let lives = 3;', replace: 'let lives = 5;', hint: 'בלוק איזון: נותן יותר ניסיונות.' },
      { label: '⭐ טקסט כוכב', target: 'js', find: 'אספתם כוכב ⭐', replace: 'תפיסה מושלמת ⭐', hint: 'בלוק משוב: הודעת הצלחה.' },
      { label: '🌋 מכשול אחר', target: 'js', find: 'itemButton.textContent = "🌋";', replace: 'itemButton.textContent = "💣";', hint: 'בלוק דמות: מחליף מכשול.' },
      { label: '🏁 הודעת פסילה', target: 'js', find: 'נגמרו החיים. נסו שוב!', replace: 'נגמרו החיים — נסו סיבוב חדש!', hint: 'בלוק משוב: הודעת Game Over.' },
      { label: '🟣 צבע פריט', target: 'css', find: 'background: #fef3c7;', replace: 'background: #dcfce7;', hint: 'בלוק עיצוב: משנה כרטיס כוכב.' },
      { label: '🎲 החלפת פריט', target: 'js', find: 'function nextItem()', replace: 'function nextItem()', hint: 'בלוק משחק: מחליף בין כוכב למכשול.' }
    ]
  });

  Object.assign(lessons[9], {
    title: 'מעבדת גיבורי־על — כוח מיוחד לדמות',
    concept: 'מצב דמות → powerReady · selectedHero · classList · true/false',
    story: 'מוציאים את הכוח המיוחד ממשחק הקליקים והופכים אותו לסטודיו דמות. הילד בוחר גיבור, מפעיל כוח, רואה שינוי ויזואלי, ולומד שמצב בקוד משנה חוויה במסך.',
    mission: 'לבנות סטודיו גיבורי־על: לבחור דמות, להפעיל כוח חד־פעמי, ולהציג כרטיס כוח.',
    outcome: 'סטודיו דמויות וכוחות עם מצב true/false ושינויי classList ברורים',
    starter: {
      html: `<main class="hero-lab">
  <h1>מעבדת גיבורי־על</h1>
  <div id="heroAvatar" class="hero-avatar">🤖</div>
  <p>גיבור: <span id="heroName">רובוט אור</span> | כוח: <span id="powerText">מוכן</span></p>
  <button onclick="chooseHero('robot')">🤖 רובוט</button>
  <button onclick="chooseHero('ninja')">🥷 נינג׳ה</button>
  <button onclick="chooseHero('space')">👩‍🚀 חלל</button>
  <button onclick="activatePower()">⚡ הפעל כוח</button>
  <button onclick="resetPower()">טעינת כוח</button>
  <p id="message">בחרו גיבור והפעילו כוח מיוחד.</p>
</main>`,
      css: `body {
  font-family: Arial, sans-serif;
  direction: rtl;
  text-align: center;
  background: linear-gradient(135deg, #f5d0fe, #dbeafe);
}

.hero-lab {
  background: white;
  width: min(460px, 92vw);
  margin: 42px auto;
  padding: 30px;
  border-radius: 30px;
  box-shadow: 0 18px 42px #c4b5fd;
}

.hero-avatar {
  font-size: 88px;
  margin: 16px;
  transition: transform 0.25s, filter 0.25s;
}

.power-on .hero-avatar {
  transform: scale(1.18) rotate(4deg);
  filter: drop-shadow(0 0 18px #facc15);
}

button {
  margin: 7px;
  padding: 13px 16px;
  border: 0;
  border-radius: 999px;
  background: #7c3aed;
  color: white;
  font-weight: bold;
  cursor: pointer;
}

.power-on {
  background: #dcfce7;
  border: 3px solid #22c55e;
}`,
      js: `let powerReady = true;
let selectedHero = "robot";

function chooseHero(hero) {
  selectedHero = hero;

  if (hero === "robot") {
    document.getElementById("heroAvatar").textContent = "🤖";
    document.getElementById("heroName").textContent = "רובוט אור";
  } else if (hero === "ninja") {
    document.getElementById("heroAvatar").textContent = "🥷";
    document.getElementById("heroName").textContent = "נינג׳ה צל";
  } else {
    document.getElementById("heroAvatar").textContent = "👩‍🚀";
    document.getElementById("heroName").textContent = "חוקרת חלל";
  }

  document.getElementById("message").textContent = "הגיבור נבחר. הכוח מוכן?";
}

function activatePower() {
  if (powerReady) {
    powerReady = false;
    document.getElementById("powerText").textContent = "נטען מחדש";
    document.querySelector(".hero-lab").classList.add("power-on");
    document.getElementById("message").textContent = "כוח מיוחד הופעל עבור " + selectedHero + " ⚡";
  } else {
    document.getElementById("message").textContent = "הכוח כבר נוצל. צריך טעינה.";
  }
}

function resetPower() {
  powerReady = true;
  document.getElementById("powerText").textContent = "מוכן";
  document.querySelector(".hero-lab").classList.remove("power-on");
  document.getElementById("message").textContent = "הכוח נטען מחדש!";
}`
    },
    lessonFlow: [
      { minutes: '0–8', title: 'וואו: בוחרים גיבור', teacher: 'נותנים לילדים לבחור דמות ולהפעיל כוח לפני הסבר.', students: 'רואים דמות, שם, מצב כוח ואפקט.' },
      { minutes: '8–18', title: 'מצב דמות', teacher: 'מסבירים selectedHero כבחירה הנוכחית.', students: 'מחברים כפתור לבחירת דמות.' },
      { minutes: '18–34', title: 'כוח מוכן או לא', teacher: 'מראים powerReady כ־true/false.', students: 'מבינים למה כוח חד־פעמי צריך מצב.' },
      { minutes: '34–50', title: 'אפקט כוח', teacher: 'מצביעים על classList.add("power-on").', students: 'רואים ש־class משנה את המראה.' },
      { minutes: '50–66', title: 'שדרוגי גיבור', teacher: 'נותנים לשנות דמות, שם כוח והודעה.', students: 'יוצרים גיבור אישי.' },
      { minutes: '66–78', title: 'דיבאג מצב', teacher: 'בודקים powerText ו־heroAvatar.', students: 'מתקנים id או מצב שלא מתעדכן.' },
      { minutes: '78–90', title: 'מצעד גיבורים', teacher: 'כל זוג מציג גיבור וכוח.', students: 'מסבירים מתי powerReady נכון ומתי לא.' }
    ],
    exercises: [
      { id: 1, minutes: '0–8', title: 'תרגול 1 — בוחרים דמות', prompt: 'בחרו רובוט, נינג׳ה או חלל והפעילו כוח.', hint: 'שימו לב מה משתנה לפני שקוראים קוד.', check: { htmlIncludes: ['id="heroAvatar"', 'chooseHero'], jsIncludes: ['function chooseHero'] } },
      { id: 2, minutes: '8–18', title: 'תרגול 2 — כוח מוכן', prompt: 'מצאו איפה הכוח מתחיל במצב מוכן.', hint: 'powerReady הוא כן/לא.', check: { jsIncludes: ['let powerReady = true'] } },
      { id: 3, minutes: '18–28', title: 'תרגול 3 — גיבור נבחר', prompt: 'מצאו איפה נשמרת הדמות הנבחרת.', hint: 'selectedHero שומר בחירה.', check: { jsIncludes: ['let selectedHero = "robot"', 'selectedHero = hero'] } },
      { id: 4, minutes: '28–38', title: 'תרגול 4 — אם הכוח מוכן', prompt: 'מצאו את התנאי שמחליט אם מותר להפעיל כוח.', hint: 'חפשו if (powerReady).', check: { jsIncludes: ['if (powerReady)', 'powerReady = false'] } },
      { id: 5, minutes: '38–50', title: 'תרגול 5 — אפקט כוח', prompt: 'מצאו את ה־class שמדליק אפקט כוח.', hint: 'power-on משנה את הכרטיס.', check: { jsIncludes: ['classList.add("power-on")'], cssIncludes: ['.power-on'] } },
      { id: 6, minutes: '50–60', title: 'תרגול 6 — טעינה מחדש', prompt: 'בדקו שכפתור טעינה מחזיר את הכוח למוכן.', hint: 'resetPower מחזיר true.', check: { jsIncludes: ['function resetPower', 'powerReady = true'] } },
      { id: 7, minutes: '60–74', title: 'תרגול 7 — גיבור אישי', prompt: 'שנו שם של גיבור או הודעת כוח.', hint: 'שינוי בטוח: טקסט בתוך גרשיים.', check: { htmlIncludes: ['heroName'], jsIncludes: ['textContent'] } },
      { id: 8, minutes: '74–84', title: 'תרגול 8 — הצגת כוח', prompt: 'תנו לחבר לבחור דמות ולהסביר למה אי אפשר להפעיל כוח פעמיים.', hint: 'הסבירו powerReady במילים.', check: { jsIncludes: ['powerReady', 'selectedHero'], htmlIncludes: ['activatePower'] } }
    ],
    aiHelper: [
      'הציעו שמות מצחיקים לגיבורי־על של ילדים.',
      'הסבירו true/false כמו כפתור כוח מוכן/לא מוכן.',
      'הציעו אפקטים לכוח מיוחד בלי קוד מסובך.',
      'עזרו להבין למה classList משנה מראה של דמות.'
    ],
    vocabulary: [
      ['powerReady', 'האם הכוח מוכן להפעלה'],
      ['selectedHero', 'הדמות שנבחרה עכשיו'],
      ['true / false', 'כן או לא בקוד'],
      ['classList', 'הוספה או הסרה של מצב עיצובי'],
      ['state', 'מצב שהאפליקציה זוכרת']
    ],
    bridgeBlocks: [
      { label: '🤖 שם רובוט', target: 'js', find: 'רובוט אור', replace: 'רובוט ברק', hint: 'בלוק דמות: שם אישי.' },
      { label: '🥷 סמל נינג׳ה', target: 'js', find: 'document.getElementById("heroAvatar").textContent = "🥷";', replace: 'document.getElementById("heroAvatar").textContent = "🦸";', hint: 'בלוק דמות: מחליף סמל.' },
      { label: '⚡ הודעת כוח', target: 'js', find: 'כוח מיוחד הופעל עבור ', replace: 'כוח על נדלק עבור ', hint: 'בלוק משוב: הודעת כוח.' },
      { label: '🟢 צבע כוח', target: 'css', find: 'background: #dcfce7;', replace: 'background: #bbf7d0;', hint: 'בלוק עיצוב: מצב כוח.' },
      { label: '🔒 שימוש חד־פעמי', target: 'js', find: 'powerReady = false;', replace: 'powerReady = false;', hint: 'בלוק מצב: כוח כבר לא מוכן.' },
      { label: '🔁 טעינת כוח', target: 'js', find: 'powerReady = true;', replace: 'powerReady = true;', hint: 'בלוק איפוס: הכוח חוזר.' }
    ]
  });

  Object.assign(lessons[10], {
    title: 'בחרו הרפתקה — אפליקציית מסכים',
    concept: 'אפליקציית מסכים → showScreen · choices · navigation · state',
    story: 'במקום עוד משחק עם מסך פתיחה וניצחון, הילדים בונים סיפור אינטראקטיבי. כל בחירה מעבירה למסך אחר: דלת אדומה, דלת כחולה, סוף מצחיק או סוף ניצחון.',
    mission: 'לבנות אפליקציית “בחרו את ההרפתקה”: מסך פתיחה, שתי בחירות, שני מסלולים וסוף.',
    outcome: 'סיפור אינטראקטיבי עם ניווט בין מסכים, שמלמד showScreen ו־class active דרך חוויה סיפורית',
    starter: {
      html: `<main class="adventure-app">
  <section id="startScreen" class="screen active">
    <h1>הטירה הסודית</h1>
    <p>מצאתם שתי דלתות. איזו דלת תפתחו?</p>
    <button onclick="showScreen('redDoorScreen')">🚪 דלת אדומה</button>
    <button onclick="showScreen('blueDoorScreen')">🚪 דלת כחולה</button>
  </section>
  <section id="redDoorScreen" class="screen">
    <h2>חדר הדרקון</h2>
    <p>דרקון קטן מבקש בדיחה כדי לתת לכם לעבור.</p>
    <button onclick="showScreen('winScreen')">ספרו בדיחה</button>
    <button onclick="showScreen('startScreen')">חזרו לטירה</button>
  </section>
  <section id="blueDoorScreen" class="screen">
    <h2>חדר המראה</h2>
    <p>המראה שואלת: “מה הכוח המיוחד שלך?”</p>
    <button onclick="showScreen('funnyEndScreen')">להיות יצירתיים</button>
    <button onclick="showScreen('startScreen')">חזרו לטירה</button>
  </section>
  <section id="winScreen" class="screen">
    <h2>ניצחתם!</h2>
    <p>הדרקון צחק ופתח לכם אוצר 🎉</p>
    <button onclick="showScreen('startScreen')">שחקו שוב</button>
  </section>
  <section id="funnyEndScreen" class="screen">
    <h2>סוף מצחיק</h2>
    <p>המראה החליטה שאתם קוסמי רעיונות ✨</p>
    <button onclick="showScreen('startScreen')">התחילו מחדש</button>
  </section>
</main>`,
      css: `body {
  font-family: Arial, sans-serif;
  direction: rtl;
  text-align: center;
  background: linear-gradient(135deg, #312e81, #f97316);
}

.adventure-app {
  background: white;
  width: min(500px, 92vw);
  margin: 42px auto;
  padding: 30px;
  border-radius: 30px;
  box-shadow: 0 18px 45px #4338ca;
}

.screen {
  display: none;
  min-height: 260px;
}

.screen.active {
  display: block;
}

h1, h2 {
  color: #4338ca;
}

button {
  margin: 8px;
  padding: 14px 18px;
  border: 0;
  border-radius: 999px;
  background: #4338ca;
  color: white;
  font-weight: bold;
  cursor: pointer;
}

button:hover {
  transform: scale(1.05);
}`,
      js: `let currentScreen = "startScreen";

function showScreen(screenId) {
  currentScreen = screenId;
  document.querySelectorAll(".screen").forEach(function (screen) {
    screen.classList.remove("active");
  });
  document.getElementById(screenId).classList.add("active");
}

function resetAdventure() {
  showScreen("startScreen");
}`
    },
    lessonFlow: [
      { minutes: '0–8', title: 'וואו: בוחרים דלת', teacher: 'מריצים את הסיפור ונותנים לכיתה לבחור דלתות.', students: 'רואים שמסך משתנה לפי בחירה.' },
      { minutes: '8–18', title: 'מה זה מסך?', teacher: 'מצביעים על section ועל class active.', students: 'מבינים שרק מסך אחד מוצג.' },
      { minutes: '18–34', title: 'פונקציית ניווט', teacher: 'מראים showScreen כמעלית בין חדרים.', students: 'מחברים כפתור למסך יעד.' },
      { minutes: '34–50', title: 'מפת סיפור', teacher: 'מציירים תרשים: התחלה → דלת אדומה/כחולה → סוף.', students: 'מתכננים מסלול נוסף.' },
      { minutes: '50–66', title: 'שדרוג סיפור', teacher: 'נותנים לשנות דלת, חדר, סוף או הודעה.', students: 'כותבים סיפור אישי קצר.' },
      { minutes: '66–78', title: 'דיבאג מסכים', teacher: 'בודקים id ו־showScreen עם שם זהה.', students: 'מתקנים מעבר שלא עובד.' },
      { minutes: '78–90', title: 'משחקים בסיפורים', teacher: 'זוגות משחקים בסיפור של חבר.', students: 'מסבירים את מפת הבחירות.' }
    ],
    exercises: [
      { id: 1, minutes: '0–8', title: 'תרגול 1 — בוחרים דלת', prompt: 'הריצו ובחרו דלת אדומה או כחולה.', hint: 'בדקו איזה מסך נפתח.', check: { htmlIncludes: ['id="startScreen"', 'class="screen active"'], jsIncludes: ['function showScreen'] } },
      { id: 2, minutes: '8–18', title: 'תרגול 2 — מסך פעיל', prompt: 'מצאו איזה class גורם למסך להופיע.', hint: 'active הוא המסך שמוצג עכשיו.', check: { cssIncludes: ['.screen.active'], htmlIncludes: ['class="screen active"'] } },
      { id: 3, minutes: '18–28', title: 'תרגול 3 — מעבר לדלת אדומה', prompt: 'מצאו את הכפתור שמעביר לחדר הדרקון.', hint: 'חפשו redDoorScreen.', check: { htmlIncludes: ['redDoorScreen'], jsIncludes: ['showScreen'] } },
      { id: 4, minutes: '28–38', title: 'תרגול 4 — מעבר לדלת כחולה', prompt: 'מצאו את הכפתור שמעביר לחדר המראה.', hint: 'חפשו blueDoorScreen.', check: { htmlIncludes: ['blueDoorScreen'], jsIncludes: ['showScreen'] } },
      { id: 5, minutes: '38–50', title: 'תרגול 5 — סוף ניצחון', prompt: 'מצאו את המסך שבו הדרקון פותח אוצר.', hint: 'זה winScreen.', check: { htmlIncludes: ['id="winScreen"'] } },
      { id: 6, minutes: '50–60', title: 'תרגול 6 — סוף מצחיק', prompt: 'שנו את הטקסט בסוף המצחיק.', hint: 'שינוי בטוח: רק מילים בתוך p.', check: { htmlIncludes: ['funnyEndScreen'] } },
      { id: 7, minutes: '60–74', title: 'תרגול 7 — דיבאג id', prompt: 'אם כפתור לא עובד, בדקו שהשם ב־showScreen זהה ל־id של section.', hint: 'שם אחד שונה שובר מעבר.', check: { htmlIncludes: ['id="blueDoorScreen"'], jsIncludes: ['getElementById(screenId)'] } },
      { id: 8, minutes: '74–84', title: 'תרגול 8 — מפת הרפתקה', prompt: 'ציירו על דף את מסכי הסיפור ואז שנו שם של חדר אחד.', hint: 'קודם תכנון, אחר כך קוד.', check: { htmlIncludes: ['section', 'button'], jsIncludes: ['currentScreen', 'showScreen'] } }
    ],
    aiHelper: [
      'הציעו רעיונות לשתי דלתות ושני סופים מצחיקים.',
      'עזרו לילד לתכנן מפת סיפור עם 5 מסכים.',
      'הסבירו showScreen כמו מעבר חדרים בטירה.',
      'עזרו למצוא למה כפתור לא עובר למסך הנכון.'
    ],
    vocabulary: [
      ['screen', 'מסך אחד באפליקציה או בסיפור'],
      ['active', 'המסך שמוצג עכשיו'],
      ['showScreen', 'פונקציה שמעבירה למסך אחר'],
      ['navigation', 'מעבר בין מסכים'],
      ['currentScreen', 'המסך שהאפליקציה זוכרת כרגע']
    ],
    bridgeBlocks: [
      { label: '🚪 שם דלת', target: 'html', find: '🚪 דלת אדומה', replace: '🚪 דלת אש', hint: 'בלוק סיפור: משנה בחירה.' },
      { label: '🐉 חדר אחר', target: 'html', find: 'חדר הדרקון', replace: 'חדר הרובוטים', hint: 'בלוק תוכן: משנה שם מסך.' },
      { label: '🎉 סוף ניצחון', target: 'html', find: 'הדרקון צחק ופתח לכם אוצר 🎉', replace: 'הרובוטים רקדו ופתחו לכם שער 🎉', hint: 'בלוק סוף: משנה תוצאה.' },
      { label: '✨ סוף מצחיק', target: 'html', find: 'המראה החליטה שאתם קוסמי רעיונות ✨', replace: 'המראה אמרה שאתם אלופי הדמיון ✨', hint: 'בלוק סוף: סוף חלופי.' },
      { label: '▶️ מעבר למסך', target: 'js', find: 'function showScreen(screenId)', replace: 'function showScreen(screenId)', hint: 'בלוק ניווט: פונקציית המעבר.' },
      { label: '🎨 צבע הרפתקה', target: 'css', find: 'background: #4338ca;', replace: 'background: #be123c;', hint: 'בלוק עיצוב: משנה כפתורים.' }
    ]
  });


  const webCodeAdvancedLessons = [
  {
    "id": 13,
    "title": "מעבדת הקוד שנוצר",
    "concept": "בלוק → שורת קוד מודגשת",
    "durationMinutes": 90,
    "story": "שיעור 13 נמצא בשלב בלוקים שמובילים לעריכת קוד: הילדים מתחילים מתוצר עובד, ואז מתקדמים עוד צעד מהבלוקים אל קוד אמיתי דרך משימה כיפית ומוגנת.",
    "mission": "לבחור בלוק, לראות את שורת הקוד שלו, ולשנות ערך קטן בביטחון",
    "outcome": "תוצר עובד שמחזק את המעבר ההדרגתי: בלוק → שורת קוד מודגשת.",
    "starter": {
      "html": "<main class=\"code-lab\">\n  <h1>מעבדת הקוד שנוצר</h1>\n  <p class=\"intro\">לבחור בלוק, לראות את שורת הקוד שלו, ולשנות ערך קטן בביטחון</p>\n  <button onclick=\"runProject()\">הריצו בדיקה</button>\n  <p id=\"output\">כאן תופיע התוצאה...</p>\n</main>",
      "css": "body {\n  font-family: Arial, sans-serif;\n  direction: rtl;\n  text-align: center;\n  background: linear-gradient(135deg, #eff6ff, #fff7ed);\n}\n\n.code-lab {\n  background: white;\n  width: min(520px, 92vw);\n  margin: 42px auto;\n  padding: 30px;\n  border-radius: 28px;\n  box-shadow: 0 18px 42px #bfdbfe;\n}\n\n.intro { color: #475569; line-height: 1.6; }\n\nbutton {\n  background: #2563eb;\n  color: white;\n  border: 0;\n  border-radius: 999px;\n  padding: 12px 22px;\n  font-weight: bold;\n  cursor: pointer;\n}\n\n#output {\n  margin-top: 18px;\n  background: #f8fafc;\n  border-radius: 18px;\n  padding: 16px;\n  font-weight: bold;\n}",
      "js": "function runProject() {\n  document.getElementById(\"output\").textContent = \"מצאתי את השורה שהבלוק יצר ✅\";\n}"
    },
    "lessonFlow": [
      {
        "minutes": "0–8",
        "title": "פתיחה: מעבדת הקוד שנוצר",
        "teacher": "פותחים בתוצאה עובדת ומבקשים מהילדים לתאר מה קרה לפני שמדברים על תחביר.",
        "students": "מריצים, לוחצים, משנים ערך קטן ורואים תוצאה מיידית."
      },
      {
        "minutes": "8–20",
        "title": "מפרקים את הקסם",
        "teacher": "מצביעים על החלקים החשובים בלבד ומחברים בין פעולה במסך לבין שורת קוד אחת.",
        "students": "מסמנים מה שייך ל־HTML, מה ל־CSS ומה ל־JavaScript."
      },
      {
        "minutes": "20–36",
        "title": "בנייה מודרכת של התוצר",
        "teacher": "מדגימים צעד־צעד עם כרטיס/בלוק/שורת קוד אחת בכל פעם.",
        "students": "מבצעים יחד ומריצים אחרי כל שינוי קטן."
      },
      {
        "minutes": "36–52",
        "title": "הצצה לקוד האמיתי",
        "teacher": "נותנים שם מקצועי למושג, אבל לא מקריאים את כל הקוד.",
        "students": "מוצאים בקוד את המילה או השורה שמפעילה את הרעיון."
      },
      {
        "minutes": "52–68",
        "title": "תרגיל עצמאי הדרגתי",
        "teacher": "נותנים בחירה אישית עם גבולות בטוחים כדי ליצור תוצר משלהם.",
        "students": "משנים טקסטים, מספרים, צבעים או שורות מוכנות לפי המשימה."
      },
      {
        "minutes": "68–80",
        "title": "דיבאג ידידותי",
        "teacher": "מדגימים באג נפוץ אחד ומתקנים בקול רם בלי להפחיד.",
        "students": "בודקים גרשיים, סוגריים, id ושמות פונקציות."
      },
      {
        "minutes": "80–90",
        "title": "שיתוף ורפלקציה",
        "teacher": "מסיימים בהצגה קצרה ורפלקציה על מה הילד עשה לבד.",
        "students": "משתפים קישור או מציגים למסך ומסבירים שורת קוד אחת."
      }
    ],
    "exercises": [
      {
        "id": 1,
        "minutes": "0–8",
        "title": "תרגיל 1 — מריצים קודם",
        "prompt": "הריצו את הפרויקט וכתבו במילים מה קרה במסך.",
        "hint": "קודם תוצאה, אחר כך קוד.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "textContent",
            "output"
          ]
        }
      },
      {
        "id": 2,
        "minutes": "10–18",
        "title": "תרגיל 2 — מוצאים שורה חשובה",
        "prompt": "פתחו הצצה לקוד ומצאו את השורה שהמדריכה סימנה.",
        "hint": "אל תקראו הכל — חפשו מילת מפתח אחת.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "textContent",
            "output"
          ]
        }
      },
      {
        "id": 3,
        "minutes": "20–28",
        "title": "תרגיל 3 — שינוי בטוח",
        "prompt": "שנו רק טקסט, צבע או מספר אחד והריצו שוב.",
        "hint": "שמרו על גרשיים וסוגריים.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "textContent",
            "output"
          ]
        }
      },
      {
        "id": 4,
        "minutes": "30–38",
        "title": "תרגיל 4 — כרטיס קוד",
        "prompt": "הפעילו/גררו כרטיס קוד מתאים ובדקו מה השתנה.",
        "hint": "כרטיס קוד הוא כבר קוד אמיתי, רק באריזה נוחה.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "textContent",
            "output"
          ]
        }
      },
      {
        "id": 5,
        "minutes": "40–48",
        "title": "תרגיל 5 — השלמת חור",
        "prompt": "השלימו מילה חסרה או ערך חסר בקוד.",
        "hint": "אם לא בטוחים, השוו לדוגמה שעובדת.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "textContent",
            "output"
          ]
        }
      },
      {
        "id": 6,
        "minutes": "50–58",
        "title": "תרגיל 6 — דיבאג קטן",
        "prompt": "תקנו באג אחד: id, מרכאות, סוגר או שם פונקציה.",
        "hint": "בדקו שהשמות זהים בדיוק.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "textContent",
            "output"
          ]
        }
      },
      {
        "id": 7,
        "minutes": "60–68",
        "title": "תרגיל 7 — שדרוג אישי",
        "prompt": "הוסיפו בחירה אישית קטנה שמתאימה לנושא שלכם.",
        "hint": "שדרוג קטן עדיף על קוד גדול שנשבר.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "textContent",
            "output"
          ]
        }
      },
      {
        "id": 8,
        "minutes": "70–78",
        "title": "תרגיל 8 — הצגה",
        "prompt": "הציגו לחבר/ה והסבירו שורת קוד אחת שעבדה.",
        "hint": "השתמשו במילים של השיעור.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "textContent",
            "output"
          ]
        }
      }
    ],
    "aiHelper": [
      "הציעו רעיונות יצירתיים לתוצר בשיעור 13.",
      "הסבירו לילד/ה את המושג המרכזי בשפה פשוטה.",
      "עזרו למצוא באג נפוץ בלי לכתוב את כל הפתרון במקום התלמיד.",
      "הציעו שדרוג קטן שלא מקפיץ את רמת הקושי."
    ],
    "vocabulary": [
      [
        "mapping",
        "קישור בין בלוק לבין שורת קוד"
      ],
      [
        "snippet",
        "קטע קוד קצר"
      ],
      [
        "highlight",
        "סימון של השורה החשובה"
      ],
      [
        "edit",
        "שינוי קטן ובטוח"
      ]
    ],
    "mode": "Blockly + code edit",
    "progressionStage": "בלוקים שמובילים לעריכת קוד"
  },
  {
    "id": 14,
    "title": "HTML אמיתי בזהירות",
    "concept": "תגיות HTML ו־attributes",
    "durationMinutes": 90,
    "story": "שיעור 14 נמצא בשלב בלוקים שמובילים לעריכת קוד: הילדים מתחילים מתוצר עובד, ואז מתקדמים עוד צעד מהבלוקים אל קוד אמיתי דרך משימה כיפית ומוגנת.",
    "mission": "לשנות תגיות קיימות כמו h1, p, button ו־img בלי לשבור מבנה",
    "outcome": "תוצר עובד שמחזק את המעבר ההדרגתי: תגיות HTML ו־attributes.",
    "starter": {
      "html": "<main class=\"code-lab\">\n  <h1>HTML אמיתי בזהירות</h1>\n  <p class=\"intro\">לשנות תגיות קיימות כמו h1, p, button ו־img בלי לשבור מבנה</p>\n  <button onclick=\"runProject()\">הריצו בדיקה</button>\n  <p id=\"output\">כאן תופיע התוצאה...</p>\n</main>",
      "css": "body {\n  font-family: Arial, sans-serif;\n  direction: rtl;\n  text-align: center;\n  background: linear-gradient(135deg, #eff6ff, #fff7ed);\n}\n\n.code-lab {\n  background: white;\n  width: min(520px, 92vw);\n  margin: 42px auto;\n  padding: 30px;\n  border-radius: 28px;\n  box-shadow: 0 18px 42px #bfdbfe;\n}\n\n.intro { color: #475569; line-height: 1.6; }\n\nbutton {\n  background: #2563eb;\n  color: white;\n  border: 0;\n  border-radius: 999px;\n  padding: 12px 22px;\n  font-weight: bold;\n  cursor: pointer;\n}\n\n#output {\n  margin-top: 18px;\n  background: #f8fafc;\n  border-radius: 18px;\n  padding: 16px;\n  font-weight: bold;\n}",
      "js": "function runProject() {\n  document.getElementById(\"output\").textContent = \"HTML הוא השלד של העמוד 🧱\";\n}"
    },
    "lessonFlow": [
      {
        "minutes": "0–8",
        "title": "פתיחה: HTML אמיתי בזהירות",
        "teacher": "פותחים בתוצאה עובדת ומבקשים מהילדים לתאר מה קרה לפני שמדברים על תחביר.",
        "students": "מריצים, לוחצים, משנים ערך קטן ורואים תוצאה מיידית."
      },
      {
        "minutes": "8–20",
        "title": "מפרקים את הקסם",
        "teacher": "מצביעים על החלקים החשובים בלבד ומחברים בין פעולה במסך לבין שורת קוד אחת.",
        "students": "מסמנים מה שייך ל־HTML, מה ל־CSS ומה ל־JavaScript."
      },
      {
        "minutes": "20–36",
        "title": "בנייה מודרכת של התוצר",
        "teacher": "מדגימים צעד־צעד עם כרטיס/בלוק/שורת קוד אחת בכל פעם.",
        "students": "מבצעים יחד ומריצים אחרי כל שינוי קטן."
      },
      {
        "minutes": "36–52",
        "title": "הצצה לקוד האמיתי",
        "teacher": "נותנים שם מקצועי למושג, אבל לא מקריאים את כל הקוד.",
        "students": "מוצאים בקוד את המילה או השורה שמפעילה את הרעיון."
      },
      {
        "minutes": "52–68",
        "title": "תרגיל עצמאי הדרגתי",
        "teacher": "נותנים בחירה אישית עם גבולות בטוחים כדי ליצור תוצר משלהם.",
        "students": "משנים טקסטים, מספרים, צבעים או שורות מוכנות לפי המשימה."
      },
      {
        "minutes": "68–80",
        "title": "דיבאג ידידותי",
        "teacher": "מדגימים באג נפוץ אחד ומתקנים בקול רם בלי להפחיד.",
        "students": "בודקים גרשיים, סוגריים, id ושמות פונקציות."
      },
      {
        "minutes": "80–90",
        "title": "שיתוף ורפלקציה",
        "teacher": "מסיימים בהצגה קצרה ורפלקציה על מה הילד עשה לבד.",
        "students": "משתפים קישור או מציגים למסך ומסבירים שורת קוד אחת."
      }
    ],
    "exercises": [
      {
        "id": 1,
        "minutes": "0–8",
        "title": "תרגיל 1 — מריצים קודם",
        "prompt": "הריצו את הפרויקט וכתבו במילים מה קרה במסך.",
        "hint": "קודם תוצאה, אחר כך קוד.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "HTML",
            "textContent"
          ]
        }
      },
      {
        "id": 2,
        "minutes": "10–18",
        "title": "תרגיל 2 — מוצאים שורה חשובה",
        "prompt": "פתחו הצצה לקוד ומצאו את השורה שהמדריכה סימנה.",
        "hint": "אל תקראו הכל — חפשו מילת מפתח אחת.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "HTML",
            "textContent"
          ]
        }
      },
      {
        "id": 3,
        "minutes": "20–28",
        "title": "תרגיל 3 — שינוי בטוח",
        "prompt": "שנו רק טקסט, צבע או מספר אחד והריצו שוב.",
        "hint": "שמרו על גרשיים וסוגריים.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "HTML",
            "textContent"
          ]
        }
      },
      {
        "id": 4,
        "minutes": "30–38",
        "title": "תרגיל 4 — כרטיס קוד",
        "prompt": "הפעילו/גררו כרטיס קוד מתאים ובדקו מה השתנה.",
        "hint": "כרטיס קוד הוא כבר קוד אמיתי, רק באריזה נוחה.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "HTML",
            "textContent"
          ]
        }
      },
      {
        "id": 5,
        "minutes": "40–48",
        "title": "תרגיל 5 — השלמת חור",
        "prompt": "השלימו מילה חסרה או ערך חסר בקוד.",
        "hint": "אם לא בטוחים, השוו לדוגמה שעובדת.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "HTML",
            "textContent"
          ]
        }
      },
      {
        "id": 6,
        "minutes": "50–58",
        "title": "תרגיל 6 — דיבאג קטן",
        "prompt": "תקנו באג אחד: id, מרכאות, סוגר או שם פונקציה.",
        "hint": "בדקו שהשמות זהים בדיוק.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "HTML",
            "textContent"
          ]
        }
      },
      {
        "id": 7,
        "minutes": "60–68",
        "title": "תרגיל 7 — שדרוג אישי",
        "prompt": "הוסיפו בחירה אישית קטנה שמתאימה לנושא שלכם.",
        "hint": "שדרוג קטן עדיף על קוד גדול שנשבר.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "HTML",
            "textContent"
          ]
        }
      },
      {
        "id": 8,
        "minutes": "70–78",
        "title": "תרגיל 8 — הצגה",
        "prompt": "הציגו לחבר/ה והסבירו שורת קוד אחת שעבדה.",
        "hint": "השתמשו במילים של השיעור.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "HTML",
            "textContent"
          ]
        }
      }
    ],
    "aiHelper": [
      "הציעו רעיונות יצירתיים לתוצר בשיעור 14.",
      "הסבירו לילד/ה את המושג המרכזי בשפה פשוטה.",
      "עזרו למצוא באג נפוץ בלי לכתוב את כל הפתרון במקום התלמיד.",
      "הציעו שדרוג קטן שלא מקפיץ את רמת הקושי."
    ],
    "vocabulary": [
      [
        "tag",
        "תגית HTML"
      ],
      [
        "attribute",
        "מאפיין בתוך תגית"
      ],
      [
        "nesting",
        "תגית בתוך תגית"
      ],
      [
        "content",
        "התוכן בין תגיות"
      ]
    ],
    "mode": "HTML safe edit",
    "progressionStage": "בלוקים שמובילים לעריכת קוד"
  },
  {
    "id": 15,
    "title": "CSS אמיתי בזהירות",
    "concept": "selector · property · value",
    "durationMinutes": 90,
    "story": "שיעור 15 נמצא בשלב בלוקים שמובילים לעריכת קוד: הילדים מתחילים מתוצר עובד, ואז מתקדמים עוד צעד מהבלוקים אל קוד אמיתי דרך משימה כיפית ומוגנת.",
    "mission": "לעצב עמוד דרך שינוי ערכי CSS אמיתיים: צבע, ריווח, פינות ו־hover",
    "outcome": "תוצר עובד שמחזק את המעבר ההדרגתי: selector · property · value.",
    "starter": {
      "html": "<main class=\"code-lab\">\n  <h1>CSS אמיתי בזהירות</h1>\n  <p class=\"intro\">לעצב עמוד דרך שינוי ערכי CSS אמיתיים: צבע, ריווח, פינות ו־hover</p>\n  <button onclick=\"runProject()\">הריצו בדיקה</button>\n  <p id=\"output\">כאן תופיע התוצאה...</p>\n</main>",
      "css": "body {\n  font-family: Arial, sans-serif;\n  direction: rtl;\n  text-align: center;\n  background: linear-gradient(135deg, #eff6ff, #fff7ed);\n}\n\n.code-lab {\n  background: white;\n  width: min(520px, 92vw);\n  margin: 42px auto;\n  padding: 30px;\n  border-radius: 28px;\n  box-shadow: 0 18px 42px #bfdbfe;\n}\n\n.intro { color: #475569; line-height: 1.6; }\n\nbutton {\n  background: #2563eb;\n  color: white;\n  border: 0;\n  border-radius: 999px;\n  padding: 12px 22px;\n  font-weight: bold;\n  cursor: pointer;\n}\n\n#output {\n  margin-top: 18px;\n  background: #f8fafc;\n  border-radius: 18px;\n  padding: 16px;\n  font-weight: bold;\n}",
      "js": "function runProject() {\n  document.getElementById(\"output\").textContent = \"שינוי CSS קטן משנה את כל התחושה 🎨\";\n}"
    },
    "lessonFlow": [
      {
        "minutes": "0–8",
        "title": "פתיחה: CSS אמיתי בזהירות",
        "teacher": "פותחים בתוצאה עובדת ומבקשים מהילדים לתאר מה קרה לפני שמדברים על תחביר.",
        "students": "מריצים, לוחצים, משנים ערך קטן ורואים תוצאה מיידית."
      },
      {
        "minutes": "8–20",
        "title": "מפרקים את הקסם",
        "teacher": "מצביעים על החלקים החשובים בלבד ומחברים בין פעולה במסך לבין שורת קוד אחת.",
        "students": "מסמנים מה שייך ל־HTML, מה ל־CSS ומה ל־JavaScript."
      },
      {
        "minutes": "20–36",
        "title": "בנייה מודרכת של התוצר",
        "teacher": "מדגימים צעד־צעד עם כרטיס/בלוק/שורת קוד אחת בכל פעם.",
        "students": "מבצעים יחד ומריצים אחרי כל שינוי קטן."
      },
      {
        "minutes": "36–52",
        "title": "הצצה לקוד האמיתי",
        "teacher": "נותנים שם מקצועי למושג, אבל לא מקריאים את כל הקוד.",
        "students": "מוצאים בקוד את המילה או השורה שמפעילה את הרעיון."
      },
      {
        "minutes": "52–68",
        "title": "תרגיל עצמאי הדרגתי",
        "teacher": "נותנים בחירה אישית עם גבולות בטוחים כדי ליצור תוצר משלהם.",
        "students": "משנים טקסטים, מספרים, צבעים או שורות מוכנות לפי המשימה."
      },
      {
        "minutes": "68–80",
        "title": "דיבאג ידידותי",
        "teacher": "מדגימים באג נפוץ אחד ומתקנים בקול רם בלי להפחיד.",
        "students": "בודקים גרשיים, סוגריים, id ושמות פונקציות."
      },
      {
        "minutes": "80–90",
        "title": "שיתוף ורפלקציה",
        "teacher": "מסיימים בהצגה קצרה ורפלקציה על מה הילד עשה לבד.",
        "students": "משתפים קישור או מציגים למסך ומסבירים שורת קוד אחת."
      }
    ],
    "exercises": [
      {
        "id": 1,
        "minutes": "0–8",
        "title": "תרגיל 1 — מריצים קודם",
        "prompt": "הריצו את הפרויקט וכתבו במילים מה קרה במסך.",
        "hint": "קודם תוצאה, אחר כך קוד.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "CSS",
            "textContent"
          ]
        }
      },
      {
        "id": 2,
        "minutes": "10–18",
        "title": "תרגיל 2 — מוצאים שורה חשובה",
        "prompt": "פתחו הצצה לקוד ומצאו את השורה שהמדריכה סימנה.",
        "hint": "אל תקראו הכל — חפשו מילת מפתח אחת.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "CSS",
            "textContent"
          ]
        }
      },
      {
        "id": 3,
        "minutes": "20–28",
        "title": "תרגיל 3 — שינוי בטוח",
        "prompt": "שנו רק טקסט, צבע או מספר אחד והריצו שוב.",
        "hint": "שמרו על גרשיים וסוגריים.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "CSS",
            "textContent"
          ]
        }
      },
      {
        "id": 4,
        "minutes": "30–38",
        "title": "תרגיל 4 — כרטיס קוד",
        "prompt": "הפעילו/גררו כרטיס קוד מתאים ובדקו מה השתנה.",
        "hint": "כרטיס קוד הוא כבר קוד אמיתי, רק באריזה נוחה.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "CSS",
            "textContent"
          ]
        }
      },
      {
        "id": 5,
        "minutes": "40–48",
        "title": "תרגיל 5 — השלמת חור",
        "prompt": "השלימו מילה חסרה או ערך חסר בקוד.",
        "hint": "אם לא בטוחים, השוו לדוגמה שעובדת.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "CSS",
            "textContent"
          ]
        }
      },
      {
        "id": 6,
        "minutes": "50–58",
        "title": "תרגיל 6 — דיבאג קטן",
        "prompt": "תקנו באג אחד: id, מרכאות, סוגר או שם פונקציה.",
        "hint": "בדקו שהשמות זהים בדיוק.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "CSS",
            "textContent"
          ]
        }
      },
      {
        "id": 7,
        "minutes": "60–68",
        "title": "תרגיל 7 — שדרוג אישי",
        "prompt": "הוסיפו בחירה אישית קטנה שמתאימה לנושא שלכם.",
        "hint": "שדרוג קטן עדיף על קוד גדול שנשבר.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "CSS",
            "textContent"
          ]
        }
      },
      {
        "id": 8,
        "minutes": "70–78",
        "title": "תרגיל 8 — הצגה",
        "prompt": "הציגו לחבר/ה והסבירו שורת קוד אחת שעבדה.",
        "hint": "השתמשו במילים של השיעור.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "CSS",
            "textContent"
          ]
        }
      }
    ],
    "aiHelper": [
      "הציעו רעיונות יצירתיים לתוצר בשיעור 15.",
      "הסבירו לילד/ה את המושג המרכזי בשפה פשוטה.",
      "עזרו למצוא באג נפוץ בלי לכתוב את כל הפתרון במקום התלמיד.",
      "הציעו שדרוג קטן שלא מקפיץ את רמת הקושי."
    ],
    "vocabulary": [
      [
        "selector",
        "למי העיצוב פונה"
      ],
      [
        "property",
        "מה משנים"
      ],
      [
        "value",
        "הערך החדש"
      ],
      [
        "px",
        "יחידת גודל"
      ]
    ],
    "mode": "CSS safe edit",
    "progressionStage": "בלוקים שמובילים לעריכת קוד"
  },
  {
    "id": 16,
    "title": "JavaScript אמיתי בזהירות",
    "concept": "function · string · DOM",
    "durationMinutes": 90,
    "story": "שיעור 16 נמצא בשלב בלוקים שמובילים לעריכת קוד: הילדים מתחילים מתוצר עובד, ואז מתקדמים עוד צעד מהבלוקים אל קוד אמיתי דרך משימה כיפית ומוגנת.",
    "mission": "לשנות טקסטים בתוך פונקציה אמיתית ולהבין מה בטוח לערוך",
    "outcome": "תוצר עובד שמחזק את המעבר ההדרגתי: function · string · DOM.",
    "starter": {
      "html": "<main class=\"code-lab\">\n  <h1>JavaScript אמיתי בזהירות</h1>\n  <p class=\"intro\">לשנות טקסטים בתוך פונקציה אמיתית ולהבין מה בטוח לערוך</p>\n  <button onclick=\"runProject()\">הריצו בדיקה</button>\n  <p id=\"output\">כאן תופיע התוצאה...</p>\n</main>",
      "css": "body {\n  font-family: Arial, sans-serif;\n  direction: rtl;\n  text-align: center;\n  background: linear-gradient(135deg, #eff6ff, #fff7ed);\n}\n\n.code-lab {\n  background: white;\n  width: min(520px, 92vw);\n  margin: 42px auto;\n  padding: 30px;\n  border-radius: 28px;\n  box-shadow: 0 18px 42px #bfdbfe;\n}\n\n.intro { color: #475569; line-height: 1.6; }\n\nbutton {\n  background: #2563eb;\n  color: white;\n  border: 0;\n  border-radius: 999px;\n  padding: 12px 22px;\n  font-weight: bold;\n  cursor: pointer;\n}\n\n#output {\n  margin-top: 18px;\n  background: #f8fafc;\n  border-radius: 18px;\n  padding: 16px;\n  font-weight: bold;\n}",
      "js": "function runProject() {\n  const message = \"כתבתי בתוך פונקציה אמיתית\";\n  document.getElementById(\"output\").textContent = message;\n}"
    },
    "lessonFlow": [
      {
        "minutes": "0–8",
        "title": "פתיחה: JavaScript אמיתי בזהירות",
        "teacher": "פותחים בתוצאה עובדת ומבקשים מהילדים לתאר מה קרה לפני שמדברים על תחביר.",
        "students": "מריצים, לוחצים, משנים ערך קטן ורואים תוצאה מיידית."
      },
      {
        "minutes": "8–20",
        "title": "מפרקים את הקסם",
        "teacher": "מצביעים על החלקים החשובים בלבד ומחברים בין פעולה במסך לבין שורת קוד אחת.",
        "students": "מסמנים מה שייך ל־HTML, מה ל־CSS ומה ל־JavaScript."
      },
      {
        "minutes": "20–36",
        "title": "בנייה מודרכת של התוצר",
        "teacher": "מדגימים צעד־צעד עם כרטיס/בלוק/שורת קוד אחת בכל פעם.",
        "students": "מבצעים יחד ומריצים אחרי כל שינוי קטן."
      },
      {
        "minutes": "36–52",
        "title": "הצצה לקוד האמיתי",
        "teacher": "נותנים שם מקצועי למושג, אבל לא מקריאים את כל הקוד.",
        "students": "מוצאים בקוד את המילה או השורה שמפעילה את הרעיון."
      },
      {
        "minutes": "52–68",
        "title": "תרגיל עצמאי הדרגתי",
        "teacher": "נותנים בחירה אישית עם גבולות בטוחים כדי ליצור תוצר משלהם.",
        "students": "משנים טקסטים, מספרים, צבעים או שורות מוכנות לפי המשימה."
      },
      {
        "minutes": "68–80",
        "title": "דיבאג ידידותי",
        "teacher": "מדגימים באג נפוץ אחד ומתקנים בקול רם בלי להפחיד.",
        "students": "בודקים גרשיים, סוגריים, id ושמות פונקציות."
      },
      {
        "minutes": "80–90",
        "title": "שיתוף ורפלקציה",
        "teacher": "מסיימים בהצגה קצרה ורפלקציה על מה הילד עשה לבד.",
        "students": "משתפים קישור או מציגים למסך ומסבירים שורת קוד אחת."
      }
    ],
    "exercises": [
      {
        "id": 1,
        "minutes": "0–8",
        "title": "תרגיל 1 — מריצים קודם",
        "prompt": "הריצו את הפרויקט וכתבו במילים מה קרה במסך.",
        "hint": "קודם תוצאה, אחר כך קוד.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "const",
            "textContent"
          ]
        }
      },
      {
        "id": 2,
        "minutes": "10–18",
        "title": "תרגיל 2 — מוצאים שורה חשובה",
        "prompt": "פתחו הצצה לקוד ומצאו את השורה שהמדריכה סימנה.",
        "hint": "אל תקראו הכל — חפשו מילת מפתח אחת.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "const",
            "textContent"
          ]
        }
      },
      {
        "id": 3,
        "minutes": "20–28",
        "title": "תרגיל 3 — שינוי בטוח",
        "prompt": "שנו רק טקסט, צבע או מספר אחד והריצו שוב.",
        "hint": "שמרו על גרשיים וסוגריים.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "const",
            "textContent"
          ]
        }
      },
      {
        "id": 4,
        "minutes": "30–38",
        "title": "תרגיל 4 — כרטיס קוד",
        "prompt": "הפעילו/גררו כרטיס קוד מתאים ובדקו מה השתנה.",
        "hint": "כרטיס קוד הוא כבר קוד אמיתי, רק באריזה נוחה.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "const",
            "textContent"
          ]
        }
      },
      {
        "id": 5,
        "minutes": "40–48",
        "title": "תרגיל 5 — השלמת חור",
        "prompt": "השלימו מילה חסרה או ערך חסר בקוד.",
        "hint": "אם לא בטוחים, השוו לדוגמה שעובדת.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "const",
            "textContent"
          ]
        }
      },
      {
        "id": 6,
        "minutes": "50–58",
        "title": "תרגיל 6 — דיבאג קטן",
        "prompt": "תקנו באג אחד: id, מרכאות, סוגר או שם פונקציה.",
        "hint": "בדקו שהשמות זהים בדיוק.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "const",
            "textContent"
          ]
        }
      },
      {
        "id": 7,
        "minutes": "60–68",
        "title": "תרגיל 7 — שדרוג אישי",
        "prompt": "הוסיפו בחירה אישית קטנה שמתאימה לנושא שלכם.",
        "hint": "שדרוג קטן עדיף על קוד גדול שנשבר.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "const",
            "textContent"
          ]
        }
      },
      {
        "id": 8,
        "minutes": "70–78",
        "title": "תרגיל 8 — הצגה",
        "prompt": "הציגו לחבר/ה והסבירו שורת קוד אחת שעבדה.",
        "hint": "השתמשו במילים של השיעור.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "const",
            "textContent"
          ]
        }
      }
    ],
    "aiHelper": [
      "הציעו רעיונות יצירתיים לתוצר בשיעור 16.",
      "הסבירו לילד/ה את המושג המרכזי בשפה פשוטה.",
      "עזרו למצוא באג נפוץ בלי לכתוב את כל הפתרון במקום התלמיד.",
      "הציעו שדרוג קטן שלא מקפיץ את רמת הקושי."
    ],
    "vocabulary": [
      [
        "string",
        "טקסט בתוך מרכאות"
      ],
      [
        "function body",
        "מה שקורה בתוך הפונקציה"
      ],
      [
        "DOM",
        "העמוד ש־JS משנה"
      ],
      [
        "const",
        "שם ששומר ערך"
      ]
    ],
    "mode": "JavaScript safe edit",
    "progressionStage": "בלוקים שמובילים לעריכת קוד"
  },
  {
    "id": 17,
    "title": "מספרים שמשנים משחק",
    "concept": "constants · speed · target",
    "durationMinutes": 90,
    "story": "שיעור 17 נמצא בשלב בלוקים שמובילים לעריכת קוד: הילדים מתחילים מתוצר עובד, ואז מתקדמים עוד צעד מהבלוקים אל קוד אמיתי דרך משימה כיפית ומוגנת.",
    "mission": "לשנות קושי של משחק דרך מספרים אמיתיים בקוד",
    "outcome": "תוצר עובד שמחזק את המעבר ההדרגתי: constants · speed · target.",
    "starter": {
      "html": "<main class=\"code-lab\">\n  <h1>מספרים שמשנים משחק</h1>\n  <p class=\"intro\">לשנות קושי של משחק דרך מספרים אמיתיים בקוד</p>\n  <button onclick=\"runProject()\">הריצו בדיקה</button>\n  <p id=\"output\">כאן תופיע התוצאה...</p>\n</main>",
      "css": "body {\n  font-family: Arial, sans-serif;\n  direction: rtl;\n  text-align: center;\n  background: linear-gradient(135deg, #eff6ff, #fff7ed);\n}\n\n.code-lab {\n  background: white;\n  width: min(520px, 92vw);\n  margin: 42px auto;\n  padding: 30px;\n  border-radius: 28px;\n  box-shadow: 0 18px 42px #bfdbfe;\n}\n\n.intro { color: #475569; line-height: 1.6; }\n\nbutton {\n  background: #2563eb;\n  color: white;\n  border: 0;\n  border-radius: 999px;\n  padding: 12px 22px;\n  font-weight: bold;\n  cursor: pointer;\n}\n\n#output {\n  margin-top: 18px;\n  background: #f8fafc;\n  border-radius: 18px;\n  padding: 16px;\n  font-weight: bold;\n}",
      "js": "function runProject() {\n  const target = 7;\n  document.getElementById(\"output\").textContent = \"היעד החדש הוא \" + target;\n}"
    },
    "lessonFlow": [
      {
        "minutes": "0–8",
        "title": "פתיחה: מספרים שמשנים משחק",
        "teacher": "פותחים בתוצאה עובדת ומבקשים מהילדים לתאר מה קרה לפני שמדברים על תחביר.",
        "students": "מריצים, לוחצים, משנים ערך קטן ורואים תוצאה מיידית."
      },
      {
        "minutes": "8–20",
        "title": "מפרקים את הקסם",
        "teacher": "מצביעים על החלקים החשובים בלבד ומחברים בין פעולה במסך לבין שורת קוד אחת.",
        "students": "מסמנים מה שייך ל־HTML, מה ל־CSS ומה ל־JavaScript."
      },
      {
        "minutes": "20–36",
        "title": "בנייה מודרכת של התוצר",
        "teacher": "מדגימים צעד־צעד עם כרטיס/בלוק/שורת קוד אחת בכל פעם.",
        "students": "מבצעים יחד ומריצים אחרי כל שינוי קטן."
      },
      {
        "minutes": "36–52",
        "title": "הצצה לקוד האמיתי",
        "teacher": "נותנים שם מקצועי למושג, אבל לא מקריאים את כל הקוד.",
        "students": "מוצאים בקוד את המילה או השורה שמפעילה את הרעיון."
      },
      {
        "minutes": "52–68",
        "title": "תרגיל עצמאי הדרגתי",
        "teacher": "נותנים בחירה אישית עם גבולות בטוחים כדי ליצור תוצר משלהם.",
        "students": "משנים טקסטים, מספרים, צבעים או שורות מוכנות לפי המשימה."
      },
      {
        "minutes": "68–80",
        "title": "דיבאג ידידותי",
        "teacher": "מדגימים באג נפוץ אחד ומתקנים בקול רם בלי להפחיד.",
        "students": "בודקים גרשיים, סוגריים, id ושמות פונקציות."
      },
      {
        "minutes": "80–90",
        "title": "שיתוף ורפלקציה",
        "teacher": "מסיימים בהצגה קצרה ורפלקציה על מה הילד עשה לבד.",
        "students": "משתפים קישור או מציגים למסך ומסבירים שורת קוד אחת."
      }
    ],
    "exercises": [
      {
        "id": 1,
        "minutes": "0–8",
        "title": "תרגיל 1 — מריצים קודם",
        "prompt": "הריצו את הפרויקט וכתבו במילים מה קרה במסך.",
        "hint": "קודם תוצאה, אחר כך קוד.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "const target",
            "output"
          ]
        }
      },
      {
        "id": 2,
        "minutes": "10–18",
        "title": "תרגיל 2 — מוצאים שורה חשובה",
        "prompt": "פתחו הצצה לקוד ומצאו את השורה שהמדריכה סימנה.",
        "hint": "אל תקראו הכל — חפשו מילת מפתח אחת.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "const target",
            "output"
          ]
        }
      },
      {
        "id": 3,
        "minutes": "20–28",
        "title": "תרגיל 3 — שינוי בטוח",
        "prompt": "שנו רק טקסט, צבע או מספר אחד והריצו שוב.",
        "hint": "שמרו על גרשיים וסוגריים.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "const target",
            "output"
          ]
        }
      },
      {
        "id": 4,
        "minutes": "30–38",
        "title": "תרגיל 4 — כרטיס קוד",
        "prompt": "הפעילו/גררו כרטיס קוד מתאים ובדקו מה השתנה.",
        "hint": "כרטיס קוד הוא כבר קוד אמיתי, רק באריזה נוחה.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "const target",
            "output"
          ]
        }
      },
      {
        "id": 5,
        "minutes": "40–48",
        "title": "תרגיל 5 — השלמת חור",
        "prompt": "השלימו מילה חסרה או ערך חסר בקוד.",
        "hint": "אם לא בטוחים, השוו לדוגמה שעובדת.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "const target",
            "output"
          ]
        }
      },
      {
        "id": 6,
        "minutes": "50–58",
        "title": "תרגיל 6 — דיבאג קטן",
        "prompt": "תקנו באג אחד: id, מרכאות, סוגר או שם פונקציה.",
        "hint": "בדקו שהשמות זהים בדיוק.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "const target",
            "output"
          ]
        }
      },
      {
        "id": 7,
        "minutes": "60–68",
        "title": "תרגיל 7 — שדרוג אישי",
        "prompt": "הוסיפו בחירה אישית קטנה שמתאימה לנושא שלכם.",
        "hint": "שדרוג קטן עדיף על קוד גדול שנשבר.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "const target",
            "output"
          ]
        }
      },
      {
        "id": 8,
        "minutes": "70–78",
        "title": "תרגיל 8 — הצגה",
        "prompt": "הציגו לחבר/ה והסבירו שורת קוד אחת שעבדה.",
        "hint": "השתמשו במילים של השיעור.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "const target",
            "output"
          ]
        }
      }
    ],
    "aiHelper": [
      "הציעו רעיונות יצירתיים לתוצר בשיעור 17.",
      "הסבירו לילד/ה את המושג המרכזי בשפה פשוטה.",
      "עזרו למצוא באג נפוץ בלי לכתוב את כל הפתרון במקום התלמיד.",
      "הציעו שדרוג קטן שלא מקפיץ את רמת הקושי."
    ],
    "vocabulary": [
      [
        "constant",
        "ערך שמגדיר חוק"
      ],
      [
        "target",
        "יעד המשחק"
      ],
      [
        "speed",
        "מהירות"
      ],
      [
        "balance",
        "איזון קושי"
      ]
    ],
    "mode": "Number tuning",
    "progressionStage": "בלוקים שמובילים לעריכת קוד"
  },
  {
    "id": 18,
    "title": "חדר בריחה של באגים",
    "concept": "syntax · id · quotes",
    "durationMinutes": 90,
    "story": "שיעור 18 נמצא בשלב בלוקים שמובילים לעריכת קוד: הילדים מתחילים מתוצר עובד, ואז מתקדמים עוד צעד מהבלוקים אל קוד אמיתי דרך משימה כיפית ומוגנת.",
    "mission": "לתקן באגים קטנים בקוד אמיתי בלי פחד: מרכאות, סוגריים ו־id",
    "outcome": "תוצר עובד שמחזק את המעבר ההדרגתי: syntax · id · quotes.",
    "starter": {
      "html": "<main class=\"code-lab\">\n  <h1>חדר בריחה של באגים</h1>\n  <p class=\"intro\">לתקן באגים קטנים בקוד אמיתי בלי פחד: מרכאות, סוגריים ו־id</p>\n  <button onclick=\"runProject()\">הריצו בדיקה</button>\n  <p id=\"output\">כאן תופיע התוצאה...</p>\n</main>",
      "css": "body {\n  font-family: Arial, sans-serif;\n  direction: rtl;\n  text-align: center;\n  background: linear-gradient(135deg, #eff6ff, #fff7ed);\n}\n\n.code-lab {\n  background: white;\n  width: min(520px, 92vw);\n  margin: 42px auto;\n  padding: 30px;\n  border-radius: 28px;\n  box-shadow: 0 18px 42px #bfdbfe;\n}\n\n.intro { color: #475569; line-height: 1.6; }\n\nbutton {\n  background: #2563eb;\n  color: white;\n  border: 0;\n  border-radius: 999px;\n  padding: 12px 22px;\n  font-weight: bold;\n  cursor: pointer;\n}\n\n#output {\n  margin-top: 18px;\n  background: #f8fafc;\n  border-radius: 18px;\n  padding: 16px;\n  font-weight: bold;\n}",
      "js": "function runProject() {\n  document.getElementById(\"output\").textContent = \"הבאג תוקן — הדלת נפתחה 🔓\";\n}"
    },
    "lessonFlow": [
      {
        "minutes": "0–8",
        "title": "פתיחה: חדר בריחה של באגים",
        "teacher": "פותחים בתוצאה עובדת ומבקשים מהילדים לתאר מה קרה לפני שמדברים על תחביר.",
        "students": "מריצים, לוחצים, משנים ערך קטן ורואים תוצאה מיידית."
      },
      {
        "minutes": "8–20",
        "title": "מפרקים את הקסם",
        "teacher": "מצביעים על החלקים החשובים בלבד ומחברים בין פעולה במסך לבין שורת קוד אחת.",
        "students": "מסמנים מה שייך ל־HTML, מה ל־CSS ומה ל־JavaScript."
      },
      {
        "minutes": "20–36",
        "title": "בנייה מודרכת של התוצר",
        "teacher": "מדגימים צעד־צעד עם כרטיס/בלוק/שורת קוד אחת בכל פעם.",
        "students": "מבצעים יחד ומריצים אחרי כל שינוי קטן."
      },
      {
        "minutes": "36–52",
        "title": "הצצה לקוד האמיתי",
        "teacher": "נותנים שם מקצועי למושג, אבל לא מקריאים את כל הקוד.",
        "students": "מוצאים בקוד את המילה או השורה שמפעילה את הרעיון."
      },
      {
        "minutes": "52–68",
        "title": "תרגיל עצמאי הדרגתי",
        "teacher": "נותנים בחירה אישית עם גבולות בטוחים כדי ליצור תוצר משלהם.",
        "students": "משנים טקסטים, מספרים, צבעים או שורות מוכנות לפי המשימה."
      },
      {
        "minutes": "68–80",
        "title": "דיבאג ידידותי",
        "teacher": "מדגימים באג נפוץ אחד ומתקנים בקול רם בלי להפחיד.",
        "students": "בודקים גרשיים, סוגריים, id ושמות פונקציות."
      },
      {
        "minutes": "80–90",
        "title": "שיתוף ורפלקציה",
        "teacher": "מסיימים בהצגה קצרה ורפלקציה על מה הילד עשה לבד.",
        "students": "משתפים קישור או מציגים למסך ומסבירים שורת קוד אחת."
      }
    ],
    "exercises": [
      {
        "id": 1,
        "minutes": "0–8",
        "title": "תרגיל 1 — מריצים קודם",
        "prompt": "הריצו את הפרויקט וכתבו במילים מה קרה במסך.",
        "hint": "קודם תוצאה, אחר כך קוד.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "getElementById",
            "textContent"
          ]
        }
      },
      {
        "id": 2,
        "minutes": "10–18",
        "title": "תרגיל 2 — מוצאים שורה חשובה",
        "prompt": "פתחו הצצה לקוד ומצאו את השורה שהמדריכה סימנה.",
        "hint": "אל תקראו הכל — חפשו מילת מפתח אחת.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "getElementById",
            "textContent"
          ]
        }
      },
      {
        "id": 3,
        "minutes": "20–28",
        "title": "תרגיל 3 — שינוי בטוח",
        "prompt": "שנו רק טקסט, צבע או מספר אחד והריצו שוב.",
        "hint": "שמרו על גרשיים וסוגריים.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "getElementById",
            "textContent"
          ]
        }
      },
      {
        "id": 4,
        "minutes": "30–38",
        "title": "תרגיל 4 — כרטיס קוד",
        "prompt": "הפעילו/גררו כרטיס קוד מתאים ובדקו מה השתנה.",
        "hint": "כרטיס קוד הוא כבר קוד אמיתי, רק באריזה נוחה.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "getElementById",
            "textContent"
          ]
        }
      },
      {
        "id": 5,
        "minutes": "40–48",
        "title": "תרגיל 5 — השלמת חור",
        "prompt": "השלימו מילה חסרה או ערך חסר בקוד.",
        "hint": "אם לא בטוחים, השוו לדוגמה שעובדת.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "getElementById",
            "textContent"
          ]
        }
      },
      {
        "id": 6,
        "minutes": "50–58",
        "title": "תרגיל 6 — דיבאג קטן",
        "prompt": "תקנו באג אחד: id, מרכאות, סוגר או שם פונקציה.",
        "hint": "בדקו שהשמות זהים בדיוק.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "getElementById",
            "textContent"
          ]
        }
      },
      {
        "id": 7,
        "minutes": "60–68",
        "title": "תרגיל 7 — שדרוג אישי",
        "prompt": "הוסיפו בחירה אישית קטנה שמתאימה לנושא שלכם.",
        "hint": "שדרוג קטן עדיף על קוד גדול שנשבר.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "getElementById",
            "textContent"
          ]
        }
      },
      {
        "id": 8,
        "minutes": "70–78",
        "title": "תרגיל 8 — הצגה",
        "prompt": "הציגו לחבר/ה והסבירו שורת קוד אחת שעבדה.",
        "hint": "השתמשו במילים של השיעור.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "getElementById",
            "textContent"
          ]
        }
      }
    ],
    "aiHelper": [
      "הציעו רעיונות יצירתיים לתוצר בשיעור 18.",
      "הסבירו לילד/ה את המושג המרכזי בשפה פשוטה.",
      "עזרו למצוא באג נפוץ בלי לכתוב את כל הפתרון במקום התלמיד.",
      "הציעו שדרוג קטן שלא מקפיץ את רמת הקושי."
    ],
    "vocabulary": [
      [
        "syntax",
        "חוקי הכתיבה של הקוד"
      ],
      [
        "quotes",
        "מרכאות"
      ],
      [
        "parentheses",
        "סוגריים"
      ],
      [
        "error",
        "שגיאה שמכוונת אותנו"
      ]
    ],
    "mode": "Debug lab",
    "progressionStage": "בלוקים שמובילים לעריכת קוד"
  },
  {
    "id": 19,
    "title": "כרטיסי HTML אמיתי",
    "concept": "drag real HTML cards",
    "durationMinutes": 90,
    "story": "שיעור 19 נמצא בשלב כרטיסי קוד אמיתי: הילדים מתחילים מתוצר עובד, ואז מתקדמים עוד צעד מהבלוקים אל קוד אמיתי דרך משימה כיפית ומוגנת.",
    "mission": "לבנות עמוד מכרטיסי קוד אמיתי: section, h1, p, button",
    "outcome": "תוצר עובד שמחזק את המעבר ההדרגתי: drag real HTML cards.",
    "starter": {
      "html": "<main class=\"code-lab\">\n  <h1>כרטיסי HTML אמיתי</h1>\n  <p class=\"intro\">לבנות עמוד מכרטיסי קוד אמיתי: section, h1, p, button</p>\n  <button onclick=\"runProject()\">הריצו בדיקה</button>\n  <p id=\"output\">כאן תופיע התוצאה...</p>\n</main>",
      "css": "body {\n  font-family: Arial, sans-serif;\n  direction: rtl;\n  text-align: center;\n  background: linear-gradient(135deg, #eff6ff, #fff7ed);\n}\n\n.code-lab {\n  background: white;\n  width: min(520px, 92vw);\n  margin: 42px auto;\n  padding: 30px;\n  border-radius: 28px;\n  box-shadow: 0 18px 42px #bfdbfe;\n}\n\n.intro { color: #475569; line-height: 1.6; }\n\nbutton {\n  background: #2563eb;\n  color: white;\n  border: 0;\n  border-radius: 999px;\n  padding: 12px 22px;\n  font-weight: bold;\n  cursor: pointer;\n}\n\n#output {\n  margin-top: 18px;\n  background: #f8fafc;\n  border-radius: 18px;\n  padding: 16px;\n  font-weight: bold;\n}",
      "js": "function runProject() {\n  document.getElementById(\"output\").textContent = \"גררתי כרטיס HTML אמיתי\";\n}"
    },
    "lessonFlow": [
      {
        "minutes": "0–8",
        "title": "פתיחה: כרטיסי HTML אמיתי",
        "teacher": "פותחים בתוצאה עובדת ומבקשים מהילדים לתאר מה קרה לפני שמדברים על תחביר.",
        "students": "מריצים, לוחצים, משנים ערך קטן ורואים תוצאה מיידית."
      },
      {
        "minutes": "8–20",
        "title": "מפרקים את הקסם",
        "teacher": "מצביעים על החלקים החשובים בלבד ומחברים בין פעולה במסך לבין שורת קוד אחת.",
        "students": "מסמנים מה שייך ל־HTML, מה ל־CSS ומה ל־JavaScript."
      },
      {
        "minutes": "20–36",
        "title": "בנייה מודרכת של התוצר",
        "teacher": "מדגימים צעד־צעד עם כרטיס/בלוק/שורת קוד אחת בכל פעם.",
        "students": "מבצעים יחד ומריצים אחרי כל שינוי קטן."
      },
      {
        "minutes": "36–52",
        "title": "הצצה לקוד האמיתי",
        "teacher": "נותנים שם מקצועי למושג, אבל לא מקריאים את כל הקוד.",
        "students": "מוצאים בקוד את המילה או השורה שמפעילה את הרעיון."
      },
      {
        "minutes": "52–68",
        "title": "תרגיל עצמאי הדרגתי",
        "teacher": "נותנים בחירה אישית עם גבולות בטוחים כדי ליצור תוצר משלהם.",
        "students": "משנים טקסטים, מספרים, צבעים או שורות מוכנות לפי המשימה."
      },
      {
        "minutes": "68–80",
        "title": "דיבאג ידידותי",
        "teacher": "מדגימים באג נפוץ אחד ומתקנים בקול רם בלי להפחיד.",
        "students": "בודקים גרשיים, סוגריים, id ושמות פונקציות."
      },
      {
        "minutes": "80–90",
        "title": "שיתוף ורפלקציה",
        "teacher": "מסיימים בהצגה קצרה ורפלקציה על מה הילד עשה לבד.",
        "students": "משתפים קישור או מציגים למסך ומסבירים שורת קוד אחת."
      }
    ],
    "exercises": [
      {
        "id": 1,
        "minutes": "0–8",
        "title": "תרגיל 1 — מריצים קודם",
        "prompt": "הריצו את הפרויקט וכתבו במילים מה קרה במסך.",
        "hint": "קודם תוצאה, אחר כך קוד.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "HTML",
            "button"
          ]
        }
      },
      {
        "id": 2,
        "minutes": "10–18",
        "title": "תרגיל 2 — מוצאים שורה חשובה",
        "prompt": "פתחו הצצה לקוד ומצאו את השורה שהמדריכה סימנה.",
        "hint": "אל תקראו הכל — חפשו מילת מפתח אחת.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "HTML",
            "button"
          ]
        }
      },
      {
        "id": 3,
        "minutes": "20–28",
        "title": "תרגיל 3 — שינוי בטוח",
        "prompt": "שנו רק טקסט, צבע או מספר אחד והריצו שוב.",
        "hint": "שמרו על גרשיים וסוגריים.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "HTML",
            "button"
          ]
        }
      },
      {
        "id": 4,
        "minutes": "30–38",
        "title": "תרגיל 4 — כרטיס קוד",
        "prompt": "הפעילו/גררו כרטיס קוד מתאים ובדקו מה השתנה.",
        "hint": "כרטיס קוד הוא כבר קוד אמיתי, רק באריזה נוחה.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "HTML",
            "button"
          ]
        }
      },
      {
        "id": 5,
        "minutes": "40–48",
        "title": "תרגיל 5 — השלמת חור",
        "prompt": "השלימו מילה חסרה או ערך חסר בקוד.",
        "hint": "אם לא בטוחים, השוו לדוגמה שעובדת.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "HTML",
            "button"
          ]
        }
      },
      {
        "id": 6,
        "minutes": "50–58",
        "title": "תרגיל 6 — דיבאג קטן",
        "prompt": "תקנו באג אחד: id, מרכאות, סוגר או שם פונקציה.",
        "hint": "בדקו שהשמות זהים בדיוק.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "HTML",
            "button"
          ]
        }
      },
      {
        "id": 7,
        "minutes": "60–68",
        "title": "תרגיל 7 — שדרוג אישי",
        "prompt": "הוסיפו בחירה אישית קטנה שמתאימה לנושא שלכם.",
        "hint": "שדרוג קטן עדיף על קוד גדול שנשבר.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "HTML",
            "button"
          ]
        }
      },
      {
        "id": 8,
        "minutes": "70–78",
        "title": "תרגיל 8 — הצגה",
        "prompt": "הציגו לחבר/ה והסבירו שורת קוד אחת שעבדה.",
        "hint": "השתמשו במילים של השיעור.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "HTML",
            "button"
          ]
        }
      }
    ],
    "aiHelper": [
      "הציעו רעיונות יצירתיים לתוצר בשיעור 19.",
      "הסבירו לילד/ה את המושג המרכזי בשפה פשוטה.",
      "עזרו למצוא באג נפוץ בלי לכתוב את כל הפתרון במקום התלמיד.",
      "הציעו שדרוג קטן שלא מקפיץ את רמת הקושי."
    ],
    "vocabulary": [
      [
        "code card",
        "כרטיס שמכיל קוד אמיתי"
      ],
      [
        "section",
        "אזור בעמוד"
      ],
      [
        "button",
        "כפתור אמיתי"
      ],
      [
        "order",
        "סדר השורות"
      ]
    ],
    "mode": "Real code cards",
    "progressionStage": "כרטיסי קוד אמיתי"
  },
  {
    "id": 20,
    "title": "כרטיסי CSS אמיתי",
    "concept": "drag real CSS cards",
    "durationMinutes": 90,
    "story": "שיעור 20 נמצא בשלב כרטיסי קוד אמיתי: הילדים מתחילים מתוצר עובד, ואז מתקדמים עוד צעד מהבלוקים אל קוד אמיתי דרך משימה כיפית ומוגנת.",
    "mission": "לעצב עמוד מכרטיסי CSS אמיתיים ולסדר selectors",
    "outcome": "תוצר עובד שמחזק את המעבר ההדרגתי: drag real CSS cards.",
    "starter": {
      "html": "<main class=\"code-lab\">\n  <h1>כרטיסי CSS אמיתי</h1>\n  <p class=\"intro\">לעצב עמוד מכרטיסי CSS אמיתיים ולסדר selectors</p>\n  <button onclick=\"runProject()\">הריצו בדיקה</button>\n  <p id=\"output\">כאן תופיע התוצאה...</p>\n</main>",
      "css": "body {\n  font-family: Arial, sans-serif;\n  direction: rtl;\n  text-align: center;\n  background: linear-gradient(135deg, #eff6ff, #fff7ed);\n}\n\n.code-lab {\n  background: white;\n  width: min(520px, 92vw);\n  margin: 42px auto;\n  padding: 30px;\n  border-radius: 28px;\n  box-shadow: 0 18px 42px #bfdbfe;\n}\n\n.intro { color: #475569; line-height: 1.6; }\n\nbutton {\n  background: #2563eb;\n  color: white;\n  border: 0;\n  border-radius: 999px;\n  padding: 12px 22px;\n  font-weight: bold;\n  cursor: pointer;\n}\n\n#output {\n  margin-top: 18px;\n  background: #f8fafc;\n  border-radius: 18px;\n  padding: 16px;\n  font-weight: bold;\n}",
      "js": "function runProject() {\n  document.getElementById(\"output\").textContent = \"כרטיס CSS שינה את העיצוב\";\n}"
    },
    "lessonFlow": [
      {
        "minutes": "0–8",
        "title": "פתיחה: כרטיסי CSS אמיתי",
        "teacher": "פותחים בתוצאה עובדת ומבקשים מהילדים לתאר מה קרה לפני שמדברים על תחביר.",
        "students": "מריצים, לוחצים, משנים ערך קטן ורואים תוצאה מיידית."
      },
      {
        "minutes": "8–20",
        "title": "מפרקים את הקסם",
        "teacher": "מצביעים על החלקים החשובים בלבד ומחברים בין פעולה במסך לבין שורת קוד אחת.",
        "students": "מסמנים מה שייך ל־HTML, מה ל־CSS ומה ל־JavaScript."
      },
      {
        "minutes": "20–36",
        "title": "בנייה מודרכת של התוצר",
        "teacher": "מדגימים צעד־צעד עם כרטיס/בלוק/שורת קוד אחת בכל פעם.",
        "students": "מבצעים יחד ומריצים אחרי כל שינוי קטן."
      },
      {
        "minutes": "36–52",
        "title": "הצצה לקוד האמיתי",
        "teacher": "נותנים שם מקצועי למושג, אבל לא מקריאים את כל הקוד.",
        "students": "מוצאים בקוד את המילה או השורה שמפעילה את הרעיון."
      },
      {
        "minutes": "52–68",
        "title": "תרגיל עצמאי הדרגתי",
        "teacher": "נותנים בחירה אישית עם גבולות בטוחים כדי ליצור תוצר משלהם.",
        "students": "משנים טקסטים, מספרים, צבעים או שורות מוכנות לפי המשימה."
      },
      {
        "minutes": "68–80",
        "title": "דיבאג ידידותי",
        "teacher": "מדגימים באג נפוץ אחד ומתקנים בקול רם בלי להפחיד.",
        "students": "בודקים גרשיים, סוגריים, id ושמות פונקציות."
      },
      {
        "minutes": "80–90",
        "title": "שיתוף ורפלקציה",
        "teacher": "מסיימים בהצגה קצרה ורפלקציה על מה הילד עשה לבד.",
        "students": "משתפים קישור או מציגים למסך ומסבירים שורת קוד אחת."
      }
    ],
    "exercises": [
      {
        "id": 1,
        "minutes": "0–8",
        "title": "תרגיל 1 — מריצים קודם",
        "prompt": "הריצו את הפרויקט וכתבו במילים מה קרה במסך.",
        "hint": "קודם תוצאה, אחר כך קוד.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "CSS",
            "output"
          ]
        }
      },
      {
        "id": 2,
        "minutes": "10–18",
        "title": "תרגיל 2 — מוצאים שורה חשובה",
        "prompt": "פתחו הצצה לקוד ומצאו את השורה שהמדריכה סימנה.",
        "hint": "אל תקראו הכל — חפשו מילת מפתח אחת.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "CSS",
            "output"
          ]
        }
      },
      {
        "id": 3,
        "minutes": "20–28",
        "title": "תרגיל 3 — שינוי בטוח",
        "prompt": "שנו רק טקסט, צבע או מספר אחד והריצו שוב.",
        "hint": "שמרו על גרשיים וסוגריים.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "CSS",
            "output"
          ]
        }
      },
      {
        "id": 4,
        "minutes": "30–38",
        "title": "תרגיל 4 — כרטיס קוד",
        "prompt": "הפעילו/גררו כרטיס קוד מתאים ובדקו מה השתנה.",
        "hint": "כרטיס קוד הוא כבר קוד אמיתי, רק באריזה נוחה.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "CSS",
            "output"
          ]
        }
      },
      {
        "id": 5,
        "minutes": "40–48",
        "title": "תרגיל 5 — השלמת חור",
        "prompt": "השלימו מילה חסרה או ערך חסר בקוד.",
        "hint": "אם לא בטוחים, השוו לדוגמה שעובדת.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "CSS",
            "output"
          ]
        }
      },
      {
        "id": 6,
        "minutes": "50–58",
        "title": "תרגיל 6 — דיבאג קטן",
        "prompt": "תקנו באג אחד: id, מרכאות, סוגר או שם פונקציה.",
        "hint": "בדקו שהשמות זהים בדיוק.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "CSS",
            "output"
          ]
        }
      },
      {
        "id": 7,
        "minutes": "60–68",
        "title": "תרגיל 7 — שדרוג אישי",
        "prompt": "הוסיפו בחירה אישית קטנה שמתאימה לנושא שלכם.",
        "hint": "שדרוג קטן עדיף על קוד גדול שנשבר.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "CSS",
            "output"
          ]
        }
      },
      {
        "id": 8,
        "minutes": "70–78",
        "title": "תרגיל 8 — הצגה",
        "prompt": "הציגו לחבר/ה והסבירו שורת קוד אחת שעבדה.",
        "hint": "השתמשו במילים של השיעור.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "CSS",
            "output"
          ]
        }
      }
    ],
    "aiHelper": [
      "הציעו רעיונות יצירתיים לתוצר בשיעור 20.",
      "הסבירו לילד/ה את המושג המרכזי בשפה פשוטה.",
      "עזרו למצוא באג נפוץ בלי לכתוב את כל הפתרון במקום התלמיד.",
      "הציעו שדרוג קטן שלא מקפיץ את רמת הקושי."
    ],
    "vocabulary": [
      [
        "declaration",
        "הוראת עיצוב"
      ],
      [
        "block",
        "קבוצת הוראות CSS"
      ],
      [
        "hover",
        "מצב מעבר עכבר"
      ],
      [
        "cascade",
        "סדר השפעה"
      ]
    ],
    "mode": "Real code cards",
    "progressionStage": "כרטיסי קוד אמיתי"
  },
  {
    "id": 21,
    "title": "כרטיסי JavaScript אמיתי",
    "concept": "drag real JS cards",
    "durationMinutes": 90,
    "story": "שיעור 21 נמצא בשלב כרטיסי קוד אמיתי: הילדים מתחילים מתוצר עובד, ואז מתקדמים עוד צעד מהבלוקים אל קוד אמיתי דרך משימה כיפית ומוגנת.",
    "mission": "לסדר שורות JavaScript אמיתיות בתוך function עובד",
    "outcome": "תוצר עובד שמחזק את המעבר ההדרגתי: drag real JS cards.",
    "starter": {
      "html": "<main class=\"code-lab\">\n  <h1>כרטיסי JavaScript אמיתי</h1>\n  <p class=\"intro\">לסדר שורות JavaScript אמיתיות בתוך function עובד</p>\n  <button onclick=\"runProject()\">הריצו בדיקה</button>\n  <p id=\"output\">כאן תופיע התוצאה...</p>\n</main>",
      "css": "body {\n  font-family: Arial, sans-serif;\n  direction: rtl;\n  text-align: center;\n  background: linear-gradient(135deg, #eff6ff, #fff7ed);\n}\n\n.code-lab {\n  background: white;\n  width: min(520px, 92vw);\n  margin: 42px auto;\n  padding: 30px;\n  border-radius: 28px;\n  box-shadow: 0 18px 42px #bfdbfe;\n}\n\n.intro { color: #475569; line-height: 1.6; }\n\nbutton {\n  background: #2563eb;\n  color: white;\n  border: 0;\n  border-radius: 999px;\n  padding: 12px 22px;\n  font-weight: bold;\n  cursor: pointer;\n}\n\n#output {\n  margin-top: 18px;\n  background: #f8fafc;\n  border-radius: 18px;\n  padding: 16px;\n  font-weight: bold;\n}",
      "js": "function runProject() {\n  let mood = \"שמחים\";\n  document.getElementById(\"output\").textContent = \"מצב: \" + mood;\n}"
    },
    "lessonFlow": [
      {
        "minutes": "0–8",
        "title": "פתיחה: כרטיסי JavaScript אמיתי",
        "teacher": "פותחים בתוצאה עובדת ומבקשים מהילדים לתאר מה קרה לפני שמדברים על תחביר.",
        "students": "מריצים, לוחצים, משנים ערך קטן ורואים תוצאה מיידית."
      },
      {
        "minutes": "8–20",
        "title": "מפרקים את הקסם",
        "teacher": "מצביעים על החלקים החשובים בלבד ומחברים בין פעולה במסך לבין שורת קוד אחת.",
        "students": "מסמנים מה שייך ל־HTML, מה ל־CSS ומה ל־JavaScript."
      },
      {
        "minutes": "20–36",
        "title": "בנייה מודרכת של התוצר",
        "teacher": "מדגימים צעד־צעד עם כרטיס/בלוק/שורת קוד אחת בכל פעם.",
        "students": "מבצעים יחד ומריצים אחרי כל שינוי קטן."
      },
      {
        "minutes": "36–52",
        "title": "הצצה לקוד האמיתי",
        "teacher": "נותנים שם מקצועי למושג, אבל לא מקריאים את כל הקוד.",
        "students": "מוצאים בקוד את המילה או השורה שמפעילה את הרעיון."
      },
      {
        "minutes": "52–68",
        "title": "תרגיל עצמאי הדרגתי",
        "teacher": "נותנים בחירה אישית עם גבולות בטוחים כדי ליצור תוצר משלהם.",
        "students": "משנים טקסטים, מספרים, צבעים או שורות מוכנות לפי המשימה."
      },
      {
        "minutes": "68–80",
        "title": "דיבאג ידידותי",
        "teacher": "מדגימים באג נפוץ אחד ומתקנים בקול רם בלי להפחיד.",
        "students": "בודקים גרשיים, סוגריים, id ושמות פונקציות."
      },
      {
        "minutes": "80–90",
        "title": "שיתוף ורפלקציה",
        "teacher": "מסיימים בהצגה קצרה ורפלקציה על מה הילד עשה לבד.",
        "students": "משתפים קישור או מציגים למסך ומסבירים שורת קוד אחת."
      }
    ],
    "exercises": [
      {
        "id": 1,
        "minutes": "0–8",
        "title": "תרגיל 1 — מריצים קודם",
        "prompt": "הריצו את הפרויקט וכתבו במילים מה קרה במסך.",
        "hint": "קודם תוצאה, אחר כך קוד.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "let mood",
            "textContent"
          ]
        }
      },
      {
        "id": 2,
        "minutes": "10–18",
        "title": "תרגיל 2 — מוצאים שורה חשובה",
        "prompt": "פתחו הצצה לקוד ומצאו את השורה שהמדריכה סימנה.",
        "hint": "אל תקראו הכל — חפשו מילת מפתח אחת.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "let mood",
            "textContent"
          ]
        }
      },
      {
        "id": 3,
        "minutes": "20–28",
        "title": "תרגיל 3 — שינוי בטוח",
        "prompt": "שנו רק טקסט, צבע או מספר אחד והריצו שוב.",
        "hint": "שמרו על גרשיים וסוגריים.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "let mood",
            "textContent"
          ]
        }
      },
      {
        "id": 4,
        "minutes": "30–38",
        "title": "תרגיל 4 — כרטיס קוד",
        "prompt": "הפעילו/גררו כרטיס קוד מתאים ובדקו מה השתנה.",
        "hint": "כרטיס קוד הוא כבר קוד אמיתי, רק באריזה נוחה.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "let mood",
            "textContent"
          ]
        }
      },
      {
        "id": 5,
        "minutes": "40–48",
        "title": "תרגיל 5 — השלמת חור",
        "prompt": "השלימו מילה חסרה או ערך חסר בקוד.",
        "hint": "אם לא בטוחים, השוו לדוגמה שעובדת.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "let mood",
            "textContent"
          ]
        }
      },
      {
        "id": 6,
        "minutes": "50–58",
        "title": "תרגיל 6 — דיבאג קטן",
        "prompt": "תקנו באג אחד: id, מרכאות, סוגר או שם פונקציה.",
        "hint": "בדקו שהשמות זהים בדיוק.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "let mood",
            "textContent"
          ]
        }
      },
      {
        "id": 7,
        "minutes": "60–68",
        "title": "תרגיל 7 — שדרוג אישי",
        "prompt": "הוסיפו בחירה אישית קטנה שמתאימה לנושא שלכם.",
        "hint": "שדרוג קטן עדיף על קוד גדול שנשבר.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "let mood",
            "textContent"
          ]
        }
      },
      {
        "id": 8,
        "minutes": "70–78",
        "title": "תרגיל 8 — הצגה",
        "prompt": "הציגו לחבר/ה והסבירו שורת קוד אחת שעבדה.",
        "hint": "השתמשו במילים של השיעור.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "let mood",
            "textContent"
          ]
        }
      }
    ],
    "aiHelper": [
      "הציעו רעיונות יצירתיים לתוצר בשיעור 21.",
      "הסבירו לילד/ה את המושג המרכזי בשפה פשוטה.",
      "עזרו למצוא באג נפוץ בלי לכתוב את כל הפתרון במקום התלמיד.",
      "הציעו שדרוג קטן שלא מקפיץ את רמת הקושי."
    ],
    "vocabulary": [
      [
        "statement",
        "שורת פעולה"
      ],
      [
        "assignment",
        "השמה לערך"
      ],
      [
        "function",
        "פקודה עם שם"
      ],
      [
        "sequence",
        "סדר פעולות"
      ]
    ],
    "mode": "Real code cards",
    "progressionStage": "כרטיסי קוד אמיתי"
  },
  {
    "id": 22,
    "title": "מסדרים קוד בסדר נכון",
    "concept": "sequence · initialization",
    "durationMinutes": 90,
    "story": "שיעור 22 נמצא בשלב כרטיסי קוד אמיתי: הילדים מתחילים מתוצר עובד, ואז מתקדמים עוד צעד מהבלוקים אל קוד אמיתי דרך משימה כיפית ומוגנת.",
    "mission": "להבין שסדר השורות משנה: קודם יוצרים ערך, אחר כך משתמשים בו",
    "outcome": "תוצר עובד שמחזק את המעבר ההדרגתי: sequence · initialization.",
    "starter": {
      "html": "<main class=\"code-lab\">\n  <h1>מסדרים קוד בסדר נכון</h1>\n  <p class=\"intro\">להבין שסדר השורות משנה: קודם יוצרים ערך, אחר כך משתמשים בו</p>\n  <button onclick=\"runProject()\">הריצו בדיקה</button>\n  <p id=\"output\">כאן תופיע התוצאה...</p>\n</main>",
      "css": "body {\n  font-family: Arial, sans-serif;\n  direction: rtl;\n  text-align: center;\n  background: linear-gradient(135deg, #eff6ff, #fff7ed);\n}\n\n.code-lab {\n  background: white;\n  width: min(520px, 92vw);\n  margin: 42px auto;\n  padding: 30px;\n  border-radius: 28px;\n  box-shadow: 0 18px 42px #bfdbfe;\n}\n\n.intro { color: #475569; line-height: 1.6; }\n\nbutton {\n  background: #2563eb;\n  color: white;\n  border: 0;\n  border-radius: 999px;\n  padding: 12px 22px;\n  font-weight: bold;\n  cursor: pointer;\n}\n\n#output {\n  margin-top: 18px;\n  background: #f8fafc;\n  border-radius: 18px;\n  padding: 16px;\n  font-weight: bold;\n}",
      "js": "function runProject() {\n  const first = \"קודם\";\n  const second = \"אחר כך\";\n  document.getElementById(\"output\").textContent = first + \" \" + second;\n}"
    },
    "lessonFlow": [
      {
        "minutes": "0–8",
        "title": "פתיחה: מסדרים קוד בסדר נכון",
        "teacher": "פותחים בתוצאה עובדת ומבקשים מהילדים לתאר מה קרה לפני שמדברים על תחביר.",
        "students": "מריצים, לוחצים, משנים ערך קטן ורואים תוצאה מיידית."
      },
      {
        "minutes": "8–20",
        "title": "מפרקים את הקסם",
        "teacher": "מצביעים על החלקים החשובים בלבד ומחברים בין פעולה במסך לבין שורת קוד אחת.",
        "students": "מסמנים מה שייך ל־HTML, מה ל־CSS ומה ל־JavaScript."
      },
      {
        "minutes": "20–36",
        "title": "בנייה מודרכת של התוצר",
        "teacher": "מדגימים צעד־צעד עם כרטיס/בלוק/שורת קוד אחת בכל פעם.",
        "students": "מבצעים יחד ומריצים אחרי כל שינוי קטן."
      },
      {
        "minutes": "36–52",
        "title": "הצצה לקוד האמיתי",
        "teacher": "נותנים שם מקצועי למושג, אבל לא מקריאים את כל הקוד.",
        "students": "מוצאים בקוד את המילה או השורה שמפעילה את הרעיון."
      },
      {
        "minutes": "52–68",
        "title": "תרגיל עצמאי הדרגתי",
        "teacher": "נותנים בחירה אישית עם גבולות בטוחים כדי ליצור תוצר משלהם.",
        "students": "משנים טקסטים, מספרים, צבעים או שורות מוכנות לפי המשימה."
      },
      {
        "minutes": "68–80",
        "title": "דיבאג ידידותי",
        "teacher": "מדגימים באג נפוץ אחד ומתקנים בקול רם בלי להפחיד.",
        "students": "בודקים גרשיים, סוגריים, id ושמות פונקציות."
      },
      {
        "minutes": "80–90",
        "title": "שיתוף ורפלקציה",
        "teacher": "מסיימים בהצגה קצרה ורפלקציה על מה הילד עשה לבד.",
        "students": "משתפים קישור או מציגים למסך ומסבירים שורת קוד אחת."
      }
    ],
    "exercises": [
      {
        "id": 1,
        "minutes": "0–8",
        "title": "תרגיל 1 — מריצים קודם",
        "prompt": "הריצו את הפרויקט וכתבו במילים מה קרה במסך.",
        "hint": "קודם תוצאה, אחר כך קוד.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "const first",
            "second"
          ]
        }
      },
      {
        "id": 2,
        "minutes": "10–18",
        "title": "תרגיל 2 — מוצאים שורה חשובה",
        "prompt": "פתחו הצצה לקוד ומצאו את השורה שהמדריכה סימנה.",
        "hint": "אל תקראו הכל — חפשו מילת מפתח אחת.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "const first",
            "second"
          ]
        }
      },
      {
        "id": 3,
        "minutes": "20–28",
        "title": "תרגיל 3 — שינוי בטוח",
        "prompt": "שנו רק טקסט, צבע או מספר אחד והריצו שוב.",
        "hint": "שמרו על גרשיים וסוגריים.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "const first",
            "second"
          ]
        }
      },
      {
        "id": 4,
        "minutes": "30–38",
        "title": "תרגיל 4 — כרטיס קוד",
        "prompt": "הפעילו/גררו כרטיס קוד מתאים ובדקו מה השתנה.",
        "hint": "כרטיס קוד הוא כבר קוד אמיתי, רק באריזה נוחה.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "const first",
            "second"
          ]
        }
      },
      {
        "id": 5,
        "minutes": "40–48",
        "title": "תרגיל 5 — השלמת חור",
        "prompt": "השלימו מילה חסרה או ערך חסר בקוד.",
        "hint": "אם לא בטוחים, השוו לדוגמה שעובדת.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "const first",
            "second"
          ]
        }
      },
      {
        "id": 6,
        "minutes": "50–58",
        "title": "תרגיל 6 — דיבאג קטן",
        "prompt": "תקנו באג אחד: id, מרכאות, סוגר או שם פונקציה.",
        "hint": "בדקו שהשמות זהים בדיוק.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "const first",
            "second"
          ]
        }
      },
      {
        "id": 7,
        "minutes": "60–68",
        "title": "תרגיל 7 — שדרוג אישי",
        "prompt": "הוסיפו בחירה אישית קטנה שמתאימה לנושא שלכם.",
        "hint": "שדרוג קטן עדיף על קוד גדול שנשבר.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "const first",
            "second"
          ]
        }
      },
      {
        "id": 8,
        "minutes": "70–78",
        "title": "תרגיל 8 — הצגה",
        "prompt": "הציגו לחבר/ה והסבירו שורת קוד אחת שעבדה.",
        "hint": "השתמשו במילים של השיעור.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "const first",
            "second"
          ]
        }
      }
    ],
    "aiHelper": [
      "הציעו רעיונות יצירתיים לתוצר בשיעור 22.",
      "הסבירו לילד/ה את המושג המרכזי בשפה פשוטה.",
      "עזרו למצוא באג נפוץ בלי לכתוב את כל הפתרון במקום התלמיד.",
      "הציעו שדרוג קטן שלא מקפיץ את רמת הקושי."
    ],
    "vocabulary": [
      [
        "sequence",
        "רצף פעולות"
      ],
      [
        "before",
        "לפני"
      ],
      [
        "after",
        "אחרי"
      ],
      [
        "initialize",
        "להכין ערך לפני שימוש"
      ]
    ],
    "mode": "Code ordering",
    "progressionStage": "כרטיסי קוד אמיתי"
  },
  {
    "id": 23,
    "title": "משלימים חורים בקוד",
    "concept": "fill blanks in code",
    "durationMinutes": 90,
    "story": "שיעור 23 נמצא בשלב כרטיסי קוד אמיתי: הילדים מתחילים מתוצר עובד, ואז מתקדמים עוד צעד מהבלוקים אל קוד אמיתי דרך משימה כיפית ומוגנת.",
    "mission": "להשלים חורים קטנים בקוד: id, טקסט, מספר ואופרטור",
    "outcome": "תוצר עובד שמחזק את המעבר ההדרגתי: fill blanks in code.",
    "starter": {
      "html": "<main class=\"code-lab\">\n  <h1>משלימים חורים בקוד</h1>\n  <p class=\"intro\">להשלים חורים קטנים בקוד: id, טקסט, מספר ואופרטור</p>\n  <button onclick=\"runProject()\">הריצו בדיקה</button>\n  <p id=\"output\">כאן תופיע התוצאה...</p>\n</main>",
      "css": "body {\n  font-family: Arial, sans-serif;\n  direction: rtl;\n  text-align: center;\n  background: linear-gradient(135deg, #eff6ff, #fff7ed);\n}\n\n.code-lab {\n  background: white;\n  width: min(520px, 92vw);\n  margin: 42px auto;\n  padding: 30px;\n  border-radius: 28px;\n  box-shadow: 0 18px 42px #bfdbfe;\n}\n\n.intro { color: #475569; line-height: 1.6; }\n\nbutton {\n  background: #2563eb;\n  color: white;\n  border: 0;\n  border-radius: 999px;\n  padding: 12px 22px;\n  font-weight: bold;\n  cursor: pointer;\n}\n\n#output {\n  margin-top: 18px;\n  background: #f8fafc;\n  border-radius: 18px;\n  padding: 16px;\n  font-weight: bold;\n}",
      "js": "function runProject() {\n  const missingWord = \"הושלם\";\n  document.getElementById(\"output\").textContent = \"הקוד \" + missingWord;\n}"
    },
    "lessonFlow": [
      {
        "minutes": "0–8",
        "title": "פתיחה: משלימים חורים בקוד",
        "teacher": "פותחים בתוצאה עובדת ומבקשים מהילדים לתאר מה קרה לפני שמדברים על תחביר.",
        "students": "מריצים, לוחצים, משנים ערך קטן ורואים תוצאה מיידית."
      },
      {
        "minutes": "8–20",
        "title": "מפרקים את הקסם",
        "teacher": "מצביעים על החלקים החשובים בלבד ומחברים בין פעולה במסך לבין שורת קוד אחת.",
        "students": "מסמנים מה שייך ל־HTML, מה ל־CSS ומה ל־JavaScript."
      },
      {
        "minutes": "20–36",
        "title": "בנייה מודרכת של התוצר",
        "teacher": "מדגימים צעד־צעד עם כרטיס/בלוק/שורת קוד אחת בכל פעם.",
        "students": "מבצעים יחד ומריצים אחרי כל שינוי קטן."
      },
      {
        "minutes": "36–52",
        "title": "הצצה לקוד האמיתי",
        "teacher": "נותנים שם מקצועי למושג, אבל לא מקריאים את כל הקוד.",
        "students": "מוצאים בקוד את המילה או השורה שמפעילה את הרעיון."
      },
      {
        "minutes": "52–68",
        "title": "תרגיל עצמאי הדרגתי",
        "teacher": "נותנים בחירה אישית עם גבולות בטוחים כדי ליצור תוצר משלהם.",
        "students": "משנים טקסטים, מספרים, צבעים או שורות מוכנות לפי המשימה."
      },
      {
        "minutes": "68–80",
        "title": "דיבאג ידידותי",
        "teacher": "מדגימים באג נפוץ אחד ומתקנים בקול רם בלי להפחיד.",
        "students": "בודקים גרשיים, סוגריים, id ושמות פונקציות."
      },
      {
        "minutes": "80–90",
        "title": "שיתוף ורפלקציה",
        "teacher": "מסיימים בהצגה קצרה ורפלקציה על מה הילד עשה לבד.",
        "students": "משתפים קישור או מציגים למסך ומסבירים שורת קוד אחת."
      }
    ],
    "exercises": [
      {
        "id": 1,
        "minutes": "0–8",
        "title": "תרגיל 1 — מריצים קודם",
        "prompt": "הריצו את הפרויקט וכתבו במילים מה קרה במסך.",
        "hint": "קודם תוצאה, אחר כך קוד.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "missingWord",
            "output"
          ]
        }
      },
      {
        "id": 2,
        "minutes": "10–18",
        "title": "תרגיל 2 — מוצאים שורה חשובה",
        "prompt": "פתחו הצצה לקוד ומצאו את השורה שהמדריכה סימנה.",
        "hint": "אל תקראו הכל — חפשו מילת מפתח אחת.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "missingWord",
            "output"
          ]
        }
      },
      {
        "id": 3,
        "minutes": "20–28",
        "title": "תרגיל 3 — שינוי בטוח",
        "prompt": "שנו רק טקסט, צבע או מספר אחד והריצו שוב.",
        "hint": "שמרו על גרשיים וסוגריים.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "missingWord",
            "output"
          ]
        }
      },
      {
        "id": 4,
        "minutes": "30–38",
        "title": "תרגיל 4 — כרטיס קוד",
        "prompt": "הפעילו/גררו כרטיס קוד מתאים ובדקו מה השתנה.",
        "hint": "כרטיס קוד הוא כבר קוד אמיתי, רק באריזה נוחה.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "missingWord",
            "output"
          ]
        }
      },
      {
        "id": 5,
        "minutes": "40–48",
        "title": "תרגיל 5 — השלמת חור",
        "prompt": "השלימו מילה חסרה או ערך חסר בקוד.",
        "hint": "אם לא בטוחים, השוו לדוגמה שעובדת.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "missingWord",
            "output"
          ]
        }
      },
      {
        "id": 6,
        "minutes": "50–58",
        "title": "תרגיל 6 — דיבאג קטן",
        "prompt": "תקנו באג אחד: id, מרכאות, סוגר או שם פונקציה.",
        "hint": "בדקו שהשמות זהים בדיוק.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "missingWord",
            "output"
          ]
        }
      },
      {
        "id": 7,
        "minutes": "60–68",
        "title": "תרגיל 7 — שדרוג אישי",
        "prompt": "הוסיפו בחירה אישית קטנה שמתאימה לנושא שלכם.",
        "hint": "שדרוג קטן עדיף על קוד גדול שנשבר.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "missingWord",
            "output"
          ]
        }
      },
      {
        "id": 8,
        "minutes": "70–78",
        "title": "תרגיל 8 — הצגה",
        "prompt": "הציגו לחבר/ה והסבירו שורת קוד אחת שעבדה.",
        "hint": "השתמשו במילים של השיעור.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "missingWord",
            "output"
          ]
        }
      }
    ],
    "aiHelper": [
      "הציעו רעיונות יצירתיים לתוצר בשיעור 23.",
      "הסבירו לילד/ה את המושג המרכזי בשפה פשוטה.",
      "עזרו למצוא באג נפוץ בלי לכתוב את כל הפתרון במקום התלמיד.",
      "הציעו שדרוג קטן שלא מקפיץ את רמת הקושי."
    ],
    "vocabulary": [
      [
        "blank",
        "חור להשלמה"
      ],
      [
        "operator",
        "סימן פעולה"
      ],
      [
        "id",
        "שם אלמנט"
      ],
      [
        "placeholder",
        "מקום זמני בקוד"
      ]
    ],
    "mode": "Fill in code",
    "progressionStage": "כרטיסי קוד אמיתי"
  },
  {
    "id": 24,
    "title": "משנים חוקי משחק בקוד אמיתי",
    "concept": "if · score · target",
    "durationMinutes": 90,
    "story": "שיעור 24 נמצא בשלב כרטיסי קוד אמיתי: הילדים מתחילים מתוצר עובד, ואז מתקדמים עוד צעד מהבלוקים אל קוד אמיתי דרך משימה כיפית ומוגנת.",
    "mission": "לערוך תנאי, יעד וניקוד בקוד אמיתי כדי לשנות חוקי משחק",
    "outcome": "תוצר עובד שמחזק את המעבר ההדרגתי: if · score · target.",
    "starter": {
      "html": "<main class=\"code-lab\">\n  <h1>משנים חוקי משחק בקוד אמיתי</h1>\n  <p class=\"intro\">לערוך תנאי, יעד וניקוד בקוד אמיתי כדי לשנות חוקי משחק</p>\n  <button onclick=\"runProject()\">הריצו בדיקה</button>\n  <p id=\"output\">כאן תופיע התוצאה...</p>\n</main>",
      "css": "body {\n  font-family: Arial, sans-serif;\n  direction: rtl;\n  text-align: center;\n  background: linear-gradient(135deg, #eff6ff, #fff7ed);\n}\n\n.code-lab {\n  background: white;\n  width: min(520px, 92vw);\n  margin: 42px auto;\n  padding: 30px;\n  border-radius: 28px;\n  box-shadow: 0 18px 42px #bfdbfe;\n}\n\n.intro { color: #475569; line-height: 1.6; }\n\nbutton {\n  background: #2563eb;\n  color: white;\n  border: 0;\n  border-radius: 999px;\n  padding: 12px 22px;\n  font-weight: bold;\n  cursor: pointer;\n}\n\n#output {\n  margin-top: 18px;\n  background: #f8fafc;\n  border-radius: 18px;\n  padding: 16px;\n  font-weight: bold;\n}",
      "js": "function runProject() {\n  const score = 8;\n  const target = 5;\n  document.getElementById(\"output\").textContent = score >= target ? \"ניצחון\" : \"עוד ניסיון\";\n}"
    },
    "lessonFlow": [
      {
        "minutes": "0–8",
        "title": "פתיחה: משנים חוקי משחק בקוד אמיתי",
        "teacher": "פותחים בתוצאה עובדת ומבקשים מהילדים לתאר מה קרה לפני שמדברים על תחביר.",
        "students": "מריצים, לוחצים, משנים ערך קטן ורואים תוצאה מיידית."
      },
      {
        "minutes": "8–20",
        "title": "מפרקים את הקסם",
        "teacher": "מצביעים על החלקים החשובים בלבד ומחברים בין פעולה במסך לבין שורת קוד אחת.",
        "students": "מסמנים מה שייך ל־HTML, מה ל־CSS ומה ל־JavaScript."
      },
      {
        "minutes": "20–36",
        "title": "בנייה מודרכת של התוצר",
        "teacher": "מדגימים צעד־צעד עם כרטיס/בלוק/שורת קוד אחת בכל פעם.",
        "students": "מבצעים יחד ומריצים אחרי כל שינוי קטן."
      },
      {
        "minutes": "36–52",
        "title": "הצצה לקוד האמיתי",
        "teacher": "נותנים שם מקצועי למושג, אבל לא מקריאים את כל הקוד.",
        "students": "מוצאים בקוד את המילה או השורה שמפעילה את הרעיון."
      },
      {
        "minutes": "52–68",
        "title": "תרגיל עצמאי הדרגתי",
        "teacher": "נותנים בחירה אישית עם גבולות בטוחים כדי ליצור תוצר משלהם.",
        "students": "משנים טקסטים, מספרים, צבעים או שורות מוכנות לפי המשימה."
      },
      {
        "minutes": "68–80",
        "title": "דיבאג ידידותי",
        "teacher": "מדגימים באג נפוץ אחד ומתקנים בקול רם בלי להפחיד.",
        "students": "בודקים גרשיים, סוגריים, id ושמות פונקציות."
      },
      {
        "minutes": "80–90",
        "title": "שיתוף ורפלקציה",
        "teacher": "מסיימים בהצגה קצרה ורפלקציה על מה הילד עשה לבד.",
        "students": "משתפים קישור או מציגים למסך ומסבירים שורת קוד אחת."
      }
    ],
    "exercises": [
      {
        "id": 1,
        "minutes": "0–8",
        "title": "תרגיל 1 — מריצים קודם",
        "prompt": "הריצו את הפרויקט וכתבו במילים מה קרה במסך.",
        "hint": "קודם תוצאה, אחר כך קוד.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "score",
            "target"
          ]
        }
      },
      {
        "id": 2,
        "minutes": "10–18",
        "title": "תרגיל 2 — מוצאים שורה חשובה",
        "prompt": "פתחו הצצה לקוד ומצאו את השורה שהמדריכה סימנה.",
        "hint": "אל תקראו הכל — חפשו מילת מפתח אחת.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "score",
            "target"
          ]
        }
      },
      {
        "id": 3,
        "minutes": "20–28",
        "title": "תרגיל 3 — שינוי בטוח",
        "prompt": "שנו רק טקסט, צבע או מספר אחד והריצו שוב.",
        "hint": "שמרו על גרשיים וסוגריים.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "score",
            "target"
          ]
        }
      },
      {
        "id": 4,
        "minutes": "30–38",
        "title": "תרגיל 4 — כרטיס קוד",
        "prompt": "הפעילו/גררו כרטיס קוד מתאים ובדקו מה השתנה.",
        "hint": "כרטיס קוד הוא כבר קוד אמיתי, רק באריזה נוחה.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "score",
            "target"
          ]
        }
      },
      {
        "id": 5,
        "minutes": "40–48",
        "title": "תרגיל 5 — השלמת חור",
        "prompt": "השלימו מילה חסרה או ערך חסר בקוד.",
        "hint": "אם לא בטוחים, השוו לדוגמה שעובדת.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "score",
            "target"
          ]
        }
      },
      {
        "id": 6,
        "minutes": "50–58",
        "title": "תרגיל 6 — דיבאג קטן",
        "prompt": "תקנו באג אחד: id, מרכאות, סוגר או שם פונקציה.",
        "hint": "בדקו שהשמות זהים בדיוק.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "score",
            "target"
          ]
        }
      },
      {
        "id": 7,
        "minutes": "60–68",
        "title": "תרגיל 7 — שדרוג אישי",
        "prompt": "הוסיפו בחירה אישית קטנה שמתאימה לנושא שלכם.",
        "hint": "שדרוג קטן עדיף על קוד גדול שנשבר.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "score",
            "target"
          ]
        }
      },
      {
        "id": 8,
        "minutes": "70–78",
        "title": "תרגיל 8 — הצגה",
        "prompt": "הציגו לחבר/ה והסבירו שורת קוד אחת שעבדה.",
        "hint": "השתמשו במילים של השיעור.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "score",
            "target"
          ]
        }
      }
    ],
    "aiHelper": [
      "הציעו רעיונות יצירתיים לתוצר בשיעור 24.",
      "הסבירו לילד/ה את המושג המרכזי בשפה פשוטה.",
      "עזרו למצוא באג נפוץ בלי לכתוב את כל הפתרון במקום התלמיד.",
      "הציעו שדרוג קטן שלא מקפיץ את רמת הקושי."
    ],
    "vocabulary": [
      [
        "condition",
        "תנאי"
      ],
      [
        "score",
        "ניקוד"
      ],
      [
        "target",
        "יעד"
      ],
      [
        ">=",
        "גדול או שווה"
      ]
    ],
    "mode": "Game rule coding",
    "progressionStage": "כרטיסי קוד אמיתי"
  },
  {
    "id": 25,
    "title": "כותבים HTML ראשון לבד",
    "concept": "write HTML",
    "durationMinutes": 90,
    "story": "שיעור 25 נמצא בשלב כתיבה מודרכת: הילדים מתחילים מתוצר עובד, ואז מתקדמים עוד צעד מהבלוקים אל קוד אמיתי דרך משימה כיפית ומוגנת.",
    "mission": "לכתוב שלד HTML קטן לבד בעזרת snippets ורמזים בלבד",
    "outcome": "תוצר עובד שמחזק את המעבר ההדרגתי: write HTML.",
    "starter": {
      "html": "<main class=\"code-lab\">\n  <h1>כותבים HTML ראשון לבד</h1>\n  <p class=\"intro\">לכתוב שלד HTML קטן לבד בעזרת snippets ורמזים בלבד</p>\n  <button onclick=\"runProject()\">הריצו בדיקה</button>\n  <p id=\"output\">כאן תופיע התוצאה...</p>\n</main>",
      "css": "body {\n  font-family: Arial, sans-serif;\n  direction: rtl;\n  text-align: center;\n  background: linear-gradient(135deg, #eff6ff, #fff7ed);\n}\n\n.code-lab {\n  background: white;\n  width: min(520px, 92vw);\n  margin: 42px auto;\n  padding: 30px;\n  border-radius: 28px;\n  box-shadow: 0 18px 42px #bfdbfe;\n}\n\n.intro { color: #475569; line-height: 1.6; }\n\nbutton {\n  background: #2563eb;\n  color: white;\n  border: 0;\n  border-radius: 999px;\n  padding: 12px 22px;\n  font-weight: bold;\n  cursor: pointer;\n}\n\n#output {\n  margin-top: 18px;\n  background: #f8fafc;\n  border-radius: 18px;\n  padding: 16px;\n  font-weight: bold;\n}",
      "js": "function runProject() {\n  document.getElementById(\"output\").textContent = \"כתבתי HTML ראשון לבד\";\n}"
    },
    "lessonFlow": [
      {
        "minutes": "0–8",
        "title": "פתיחה: כותבים HTML ראשון לבד",
        "teacher": "פותחים בתוצאה עובדת ומבקשים מהילדים לתאר מה קרה לפני שמדברים על תחביר.",
        "students": "מריצים, לוחצים, משנים ערך קטן ורואים תוצאה מיידית."
      },
      {
        "minutes": "8–20",
        "title": "מפרקים את הקסם",
        "teacher": "מצביעים על החלקים החשובים בלבד ומחברים בין פעולה במסך לבין שורת קוד אחת.",
        "students": "מסמנים מה שייך ל־HTML, מה ל־CSS ומה ל־JavaScript."
      },
      {
        "minutes": "20–36",
        "title": "בנייה מודרכת של התוצר",
        "teacher": "מדגימים צעד־צעד עם כרטיס/בלוק/שורת קוד אחת בכל פעם.",
        "students": "מבצעים יחד ומריצים אחרי כל שינוי קטן."
      },
      {
        "minutes": "36–52",
        "title": "הצצה לקוד האמיתי",
        "teacher": "נותנים שם מקצועי למושג, אבל לא מקריאים את כל הקוד.",
        "students": "מוצאים בקוד את המילה או השורה שמפעילה את הרעיון."
      },
      {
        "minutes": "52–68",
        "title": "תרגיל עצמאי הדרגתי",
        "teacher": "נותנים בחירה אישית עם גבולות בטוחים כדי ליצור תוצר משלהם.",
        "students": "משנים טקסטים, מספרים, צבעים או שורות מוכנות לפי המשימה."
      },
      {
        "minutes": "68–80",
        "title": "דיבאג ידידותי",
        "teacher": "מדגימים באג נפוץ אחד ומתקנים בקול רם בלי להפחיד.",
        "students": "בודקים גרשיים, סוגריים, id ושמות פונקציות."
      },
      {
        "minutes": "80–90",
        "title": "שיתוף ורפלקציה",
        "teacher": "מסיימים בהצגה קצרה ורפלקציה על מה הילד עשה לבד.",
        "students": "משתפים קישור או מציגים למסך ומסבירים שורת קוד אחת."
      }
    ],
    "exercises": [
      {
        "id": 1,
        "minutes": "0–8",
        "title": "תרגיל 1 — מריצים קודם",
        "prompt": "הריצו את הפרויקט וכתבו במילים מה קרה במסך.",
        "hint": "קודם תוצאה, אחר כך קוד.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "HTML",
            "output"
          ]
        }
      },
      {
        "id": 2,
        "minutes": "10–18",
        "title": "תרגיל 2 — מוצאים שורה חשובה",
        "prompt": "פתחו הצצה לקוד ומצאו את השורה שהמדריכה סימנה.",
        "hint": "אל תקראו הכל — חפשו מילת מפתח אחת.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "HTML",
            "output"
          ]
        }
      },
      {
        "id": 3,
        "minutes": "20–28",
        "title": "תרגיל 3 — שינוי בטוח",
        "prompt": "שנו רק טקסט, צבע או מספר אחד והריצו שוב.",
        "hint": "שמרו על גרשיים וסוגריים.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "HTML",
            "output"
          ]
        }
      },
      {
        "id": 4,
        "minutes": "30–38",
        "title": "תרגיל 4 — כרטיס קוד",
        "prompt": "הפעילו/גררו כרטיס קוד מתאים ובדקו מה השתנה.",
        "hint": "כרטיס קוד הוא כבר קוד אמיתי, רק באריזה נוחה.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "HTML",
            "output"
          ]
        }
      },
      {
        "id": 5,
        "minutes": "40–48",
        "title": "תרגיל 5 — השלמת חור",
        "prompt": "השלימו מילה חסרה או ערך חסר בקוד.",
        "hint": "אם לא בטוחים, השוו לדוגמה שעובדת.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "HTML",
            "output"
          ]
        }
      },
      {
        "id": 6,
        "minutes": "50–58",
        "title": "תרגיל 6 — דיבאג קטן",
        "prompt": "תקנו באג אחד: id, מרכאות, סוגר או שם פונקציה.",
        "hint": "בדקו שהשמות זהים בדיוק.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "HTML",
            "output"
          ]
        }
      },
      {
        "id": 7,
        "minutes": "60–68",
        "title": "תרגיל 7 — שדרוג אישי",
        "prompt": "הוסיפו בחירה אישית קטנה שמתאימה לנושא שלכם.",
        "hint": "שדרוג קטן עדיף על קוד גדול שנשבר.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "HTML",
            "output"
          ]
        }
      },
      {
        "id": 8,
        "minutes": "70–78",
        "title": "תרגיל 8 — הצגה",
        "prompt": "הציגו לחבר/ה והסבירו שורת קוד אחת שעבדה.",
        "hint": "השתמשו במילים של השיעור.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "HTML",
            "output"
          ]
        }
      }
    ],
    "aiHelper": [
      "הציעו רעיונות יצירתיים לתוצר בשיעור 25.",
      "הסבירו לילד/ה את המושג המרכזי בשפה פשוטה.",
      "עזרו למצוא באג נפוץ בלי לכתוב את כל הפתרון במקום התלמיד.",
      "הציעו שדרוג קטן שלא מקפיץ את רמת הקושי."
    ],
    "vocabulary": [
      [
        "doctype",
        "הצהרת HTML"
      ],
      [
        "main",
        "אזור מרכזי"
      ],
      [
        "heading",
        "כותרת"
      ],
      [
        "paragraph",
        "פסקה"
      ]
    ],
    "mode": "Guided coding",
    "progressionStage": "כתיבה מודרכת"
  },
  {
    "id": 26,
    "title": "כותבים CSS ראשון לבד",
    "concept": "write CSS",
    "durationMinutes": 90,
    "story": "שיעור 26 נמצא בשלב כתיבה מודרכת: הילדים מתחילים מתוצר עובד, ואז מתקדמים עוד צעד מהבלוקים אל קוד אמיתי דרך משימה כיפית ומוגנת.",
    "mission": "לעצב עמוד קיים בכתיבת CSS אמיתית: צבעים, ריווח, גבול ו־hover",
    "outcome": "תוצר עובד שמחזק את המעבר ההדרגתי: write CSS.",
    "starter": {
      "html": "<main class=\"code-lab\">\n  <h1>כותבים CSS ראשון לבד</h1>\n  <p class=\"intro\">לעצב עמוד קיים בכתיבת CSS אמיתית: צבעים, ריווח, גבול ו־hover</p>\n  <button onclick=\"runProject()\">הריצו בדיקה</button>\n  <p id=\"output\">כאן תופיע התוצאה...</p>\n</main>",
      "css": "body {\n  font-family: Arial, sans-serif;\n  direction: rtl;\n  text-align: center;\n  background: linear-gradient(135deg, #eff6ff, #fff7ed);\n}\n\n.code-lab {\n  background: white;\n  width: min(520px, 92vw);\n  margin: 42px auto;\n  padding: 30px;\n  border-radius: 28px;\n  box-shadow: 0 18px 42px #bfdbfe;\n}\n\n.intro { color: #475569; line-height: 1.6; }\n\nbutton {\n  background: #2563eb;\n  color: white;\n  border: 0;\n  border-radius: 999px;\n  padding: 12px 22px;\n  font-weight: bold;\n  cursor: pointer;\n}\n\n#output {\n  margin-top: 18px;\n  background: #f8fafc;\n  border-radius: 18px;\n  padding: 16px;\n  font-weight: bold;\n}",
      "js": "function runProject() {\n  document.getElementById(\"output\").textContent = \"ה־CSS שלי עובד\";\n}"
    },
    "lessonFlow": [
      {
        "minutes": "0–8",
        "title": "פתיחה: כותבים CSS ראשון לבד",
        "teacher": "פותחים בתוצאה עובדת ומבקשים מהילדים לתאר מה קרה לפני שמדברים על תחביר.",
        "students": "מריצים, לוחצים, משנים ערך קטן ורואים תוצאה מיידית."
      },
      {
        "minutes": "8–20",
        "title": "מפרקים את הקסם",
        "teacher": "מצביעים על החלקים החשובים בלבד ומחברים בין פעולה במסך לבין שורת קוד אחת.",
        "students": "מסמנים מה שייך ל־HTML, מה ל־CSS ומה ל־JavaScript."
      },
      {
        "minutes": "20–36",
        "title": "בנייה מודרכת של התוצר",
        "teacher": "מדגימים צעד־צעד עם כרטיס/בלוק/שורת קוד אחת בכל פעם.",
        "students": "מבצעים יחד ומריצים אחרי כל שינוי קטן."
      },
      {
        "minutes": "36–52",
        "title": "הצצה לקוד האמיתי",
        "teacher": "נותנים שם מקצועי למושג, אבל לא מקריאים את כל הקוד.",
        "students": "מוצאים בקוד את המילה או השורה שמפעילה את הרעיון."
      },
      {
        "minutes": "52–68",
        "title": "תרגיל עצמאי הדרגתי",
        "teacher": "נותנים בחירה אישית עם גבולות בטוחים כדי ליצור תוצר משלהם.",
        "students": "משנים טקסטים, מספרים, צבעים או שורות מוכנות לפי המשימה."
      },
      {
        "minutes": "68–80",
        "title": "דיבאג ידידותי",
        "teacher": "מדגימים באג נפוץ אחד ומתקנים בקול רם בלי להפחיד.",
        "students": "בודקים גרשיים, סוגריים, id ושמות פונקציות."
      },
      {
        "minutes": "80–90",
        "title": "שיתוף ורפלקציה",
        "teacher": "מסיימים בהצגה קצרה ורפלקציה על מה הילד עשה לבד.",
        "students": "משתפים קישור או מציגים למסך ומסבירים שורת קוד אחת."
      }
    ],
    "exercises": [
      {
        "id": 1,
        "minutes": "0–8",
        "title": "תרגיל 1 — מריצים קודם",
        "prompt": "הריצו את הפרויקט וכתבו במילים מה קרה במסך.",
        "hint": "קודם תוצאה, אחר כך קוד.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "CSS",
            "output"
          ]
        }
      },
      {
        "id": 2,
        "minutes": "10–18",
        "title": "תרגיל 2 — מוצאים שורה חשובה",
        "prompt": "פתחו הצצה לקוד ומצאו את השורה שהמדריכה סימנה.",
        "hint": "אל תקראו הכל — חפשו מילת מפתח אחת.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "CSS",
            "output"
          ]
        }
      },
      {
        "id": 3,
        "minutes": "20–28",
        "title": "תרגיל 3 — שינוי בטוח",
        "prompt": "שנו רק טקסט, צבע או מספר אחד והריצו שוב.",
        "hint": "שמרו על גרשיים וסוגריים.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "CSS",
            "output"
          ]
        }
      },
      {
        "id": 4,
        "minutes": "30–38",
        "title": "תרגיל 4 — כרטיס קוד",
        "prompt": "הפעילו/גררו כרטיס קוד מתאים ובדקו מה השתנה.",
        "hint": "כרטיס קוד הוא כבר קוד אמיתי, רק באריזה נוחה.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "CSS",
            "output"
          ]
        }
      },
      {
        "id": 5,
        "minutes": "40–48",
        "title": "תרגיל 5 — השלמת חור",
        "prompt": "השלימו מילה חסרה או ערך חסר בקוד.",
        "hint": "אם לא בטוחים, השוו לדוגמה שעובדת.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "CSS",
            "output"
          ]
        }
      },
      {
        "id": 6,
        "minutes": "50–58",
        "title": "תרגיל 6 — דיבאג קטן",
        "prompt": "תקנו באג אחד: id, מרכאות, סוגר או שם פונקציה.",
        "hint": "בדקו שהשמות זהים בדיוק.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "CSS",
            "output"
          ]
        }
      },
      {
        "id": 7,
        "minutes": "60–68",
        "title": "תרגיל 7 — שדרוג אישי",
        "prompt": "הוסיפו בחירה אישית קטנה שמתאימה לנושא שלכם.",
        "hint": "שדרוג קטן עדיף על קוד גדול שנשבר.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "CSS",
            "output"
          ]
        }
      },
      {
        "id": 8,
        "minutes": "70–78",
        "title": "תרגיל 8 — הצגה",
        "prompt": "הציגו לחבר/ה והסבירו שורת קוד אחת שעבדה.",
        "hint": "השתמשו במילים של השיעור.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "CSS",
            "output"
          ]
        }
      }
    ],
    "aiHelper": [
      "הציעו רעיונות יצירתיים לתוצר בשיעור 26.",
      "הסבירו לילד/ה את המושג המרכזי בשפה פשוטה.",
      "עזרו למצוא באג נפוץ בלי לכתוב את כל הפתרון במקום התלמיד.",
      "הציעו שדרוג קטן שלא מקפיץ את רמת הקושי."
    ],
    "vocabulary": [
      [
        "rule",
        "חוק CSS"
      ],
      [
        "margin",
        "רווח חיצוני"
      ],
      [
        "padding",
        "רווח פנימי"
      ],
      [
        "border",
        "מסגרת"
      ]
    ],
    "mode": "Guided coding",
    "progressionStage": "כתיבה מודרכת"
  },
  {
    "id": 27,
    "title": "כותבים function ראשון לבד",
    "concept": "write function",
    "durationMinutes": 90,
    "story": "שיעור 27 נמצא בשלב כתיבה מודרכת: הילדים מתחילים מתוצר עובד, ואז מתקדמים עוד צעד מהבלוקים אל קוד אמיתי דרך משימה כיפית ומוגנת.",
    "mission": "לכתוב פונקציה פשוטה שמופעלת מכפתור ומשנה את המסך",
    "outcome": "תוצר עובד שמחזק את המעבר ההדרגתי: write function.",
    "starter": {
      "html": "<main class=\"code-lab\">\n  <h1>כותבים function ראשון לבד</h1>\n  <p class=\"intro\">לכתוב פונקציה פשוטה שמופעלת מכפתור ומשנה את המסך</p>\n  <button onclick=\"runProject()\">הריצו בדיקה</button>\n  <p id=\"output\">כאן תופיע התוצאה...</p>\n</main>",
      "css": "body {\n  font-family: Arial, sans-serif;\n  direction: rtl;\n  text-align: center;\n  background: linear-gradient(135deg, #eff6ff, #fff7ed);\n}\n\n.code-lab {\n  background: white;\n  width: min(520px, 92vw);\n  margin: 42px auto;\n  padding: 30px;\n  border-radius: 28px;\n  box-shadow: 0 18px 42px #bfdbfe;\n}\n\n.intro { color: #475569; line-height: 1.6; }\n\nbutton {\n  background: #2563eb;\n  color: white;\n  border: 0;\n  border-radius: 999px;\n  padding: 12px 22px;\n  font-weight: bold;\n  cursor: pointer;\n}\n\n#output {\n  margin-top: 18px;\n  background: #f8fafc;\n  border-radius: 18px;\n  padding: 16px;\n  font-weight: bold;\n}",
      "js": "function runProject() {\n  document.getElementById(\"output\").textContent = \"הפונקציה הראשונה שלי רצה\";\n}"
    },
    "lessonFlow": [
      {
        "minutes": "0–8",
        "title": "פתיחה: כותבים function ראשון לבד",
        "teacher": "פותחים בתוצאה עובדת ומבקשים מהילדים לתאר מה קרה לפני שמדברים על תחביר.",
        "students": "מריצים, לוחצים, משנים ערך קטן ורואים תוצאה מיידית."
      },
      {
        "minutes": "8–20",
        "title": "מפרקים את הקסם",
        "teacher": "מצביעים על החלקים החשובים בלבד ומחברים בין פעולה במסך לבין שורת קוד אחת.",
        "students": "מסמנים מה שייך ל־HTML, מה ל־CSS ומה ל־JavaScript."
      },
      {
        "minutes": "20–36",
        "title": "בנייה מודרכת של התוצר",
        "teacher": "מדגימים צעד־צעד עם כרטיס/בלוק/שורת קוד אחת בכל פעם.",
        "students": "מבצעים יחד ומריצים אחרי כל שינוי קטן."
      },
      {
        "minutes": "36–52",
        "title": "הצצה לקוד האמיתי",
        "teacher": "נותנים שם מקצועי למושג, אבל לא מקריאים את כל הקוד.",
        "students": "מוצאים בקוד את המילה או השורה שמפעילה את הרעיון."
      },
      {
        "minutes": "52–68",
        "title": "תרגיל עצמאי הדרגתי",
        "teacher": "נותנים בחירה אישית עם גבולות בטוחים כדי ליצור תוצר משלהם.",
        "students": "משנים טקסטים, מספרים, צבעים או שורות מוכנות לפי המשימה."
      },
      {
        "minutes": "68–80",
        "title": "דיבאג ידידותי",
        "teacher": "מדגימים באג נפוץ אחד ומתקנים בקול רם בלי להפחיד.",
        "students": "בודקים גרשיים, סוגריים, id ושמות פונקציות."
      },
      {
        "minutes": "80–90",
        "title": "שיתוף ורפלקציה",
        "teacher": "מסיימים בהצגה קצרה ורפלקציה על מה הילד עשה לבד.",
        "students": "משתפים קישור או מציגים למסך ומסבירים שורת קוד אחת."
      }
    ],
    "exercises": [
      {
        "id": 1,
        "minutes": "0–8",
        "title": "תרגיל 1 — מריצים קודם",
        "prompt": "הריצו את הפרויקט וכתבו במילים מה קרה במסך.",
        "hint": "קודם תוצאה, אחר כך קוד.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "function runProject",
            "textContent"
          ]
        }
      },
      {
        "id": 2,
        "minutes": "10–18",
        "title": "תרגיל 2 — מוצאים שורה חשובה",
        "prompt": "פתחו הצצה לקוד ומצאו את השורה שהמדריכה סימנה.",
        "hint": "אל תקראו הכל — חפשו מילת מפתח אחת.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "function runProject",
            "textContent"
          ]
        }
      },
      {
        "id": 3,
        "minutes": "20–28",
        "title": "תרגיל 3 — שינוי בטוח",
        "prompt": "שנו רק טקסט, צבע או מספר אחד והריצו שוב.",
        "hint": "שמרו על גרשיים וסוגריים.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "function runProject",
            "textContent"
          ]
        }
      },
      {
        "id": 4,
        "minutes": "30–38",
        "title": "תרגיל 4 — כרטיס קוד",
        "prompt": "הפעילו/גררו כרטיס קוד מתאים ובדקו מה השתנה.",
        "hint": "כרטיס קוד הוא כבר קוד אמיתי, רק באריזה נוחה.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "function runProject",
            "textContent"
          ]
        }
      },
      {
        "id": 5,
        "minutes": "40–48",
        "title": "תרגיל 5 — השלמת חור",
        "prompt": "השלימו מילה חסרה או ערך חסר בקוד.",
        "hint": "אם לא בטוחים, השוו לדוגמה שעובדת.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "function runProject",
            "textContent"
          ]
        }
      },
      {
        "id": 6,
        "minutes": "50–58",
        "title": "תרגיל 6 — דיבאג קטן",
        "prompt": "תקנו באג אחד: id, מרכאות, סוגר או שם פונקציה.",
        "hint": "בדקו שהשמות זהים בדיוק.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "function runProject",
            "textContent"
          ]
        }
      },
      {
        "id": 7,
        "minutes": "60–68",
        "title": "תרגיל 7 — שדרוג אישי",
        "prompt": "הוסיפו בחירה אישית קטנה שמתאימה לנושא שלכם.",
        "hint": "שדרוג קטן עדיף על קוד גדול שנשבר.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "function runProject",
            "textContent"
          ]
        }
      },
      {
        "id": 8,
        "minutes": "70–78",
        "title": "תרגיל 8 — הצגה",
        "prompt": "הציגו לחבר/ה והסבירו שורת קוד אחת שעבדה.",
        "hint": "השתמשו במילים של השיעור.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "function runProject",
            "textContent"
          ]
        }
      }
    ],
    "aiHelper": [
      "הציעו רעיונות יצירתיים לתוצר בשיעור 27.",
      "הסבירו לילד/ה את המושג המרכזי בשפה פשוטה.",
      "עזרו למצוא באג נפוץ בלי לכתוב את כל הפתרון במקום התלמיד.",
      "הציעו שדרוג קטן שלא מקפיץ את רמת הקושי."
    ],
    "vocabulary": [
      [
        "function name",
        "שם הפונקציה"
      ],
      [
        "call",
        "קריאה לפונקציה"
      ],
      [
        "body",
        "גוף הפונקציה"
      ],
      [
        "return",
        "החזרת ערך"
      ]
    ],
    "mode": "Guided coding",
    "progressionStage": "כתיבה מודרכת"
  },
  {
    "id": 28,
    "title": "בונים חידון בקוד",
    "concept": "input · if/else",
    "durationMinutes": 90,
    "story": "שיעור 28 נמצא בשלב כתיבה מודרכת: הילדים מתחילים מתוצר עובד, ואז מתקדמים עוד צעד מהבלוקים אל קוד אמיתי דרך משימה כיפית ומוגנת.",
    "mission": "לכתוב חידון קטן עם input, תנאי ומשוב בלי Blockly",
    "outcome": "תוצר עובד שמחזק את המעבר ההדרגתי: input · if/else.",
    "starter": {
      "html": "<main class=\"code-lab\">\n  <h1>בונים חידון בקוד</h1>\n  <p class=\"intro\">לכתוב חידון קטן עם input, תנאי ומשוב בלי Blockly</p>\n  <button onclick=\"runProject()\">הריצו בדיקה</button>\n  <p id=\"output\">כאן תופיע התוצאה...</p>\n</main>",
      "css": "body {\n  font-family: Arial, sans-serif;\n  direction: rtl;\n  text-align: center;\n  background: linear-gradient(135deg, #eff6ff, #fff7ed);\n}\n\n.code-lab {\n  background: white;\n  width: min(520px, 92vw);\n  margin: 42px auto;\n  padding: 30px;\n  border-radius: 28px;\n  box-shadow: 0 18px 42px #bfdbfe;\n}\n\n.intro { color: #475569; line-height: 1.6; }\n\nbutton {\n  background: #2563eb;\n  color: white;\n  border: 0;\n  border-radius: 999px;\n  padding: 12px 22px;\n  font-weight: bold;\n  cursor: pointer;\n}\n\n#output {\n  margin-top: 18px;\n  background: #f8fafc;\n  border-radius: 18px;\n  padding: 16px;\n  font-weight: bold;\n}",
      "js": "function runProject() {\n  const answer = \"CSS\";\n  if (answer === \"CSS\") {\n    document.getElementById(\"output\").textContent = \"נכון!\";\n  } else {\n    document.getElementById(\"output\").textContent = \"נסו שוב\";\n  }\n}"
    },
    "lessonFlow": [
      {
        "minutes": "0–8",
        "title": "פתיחה: בונים חידון בקוד",
        "teacher": "פותחים בתוצאה עובדת ומבקשים מהילדים לתאר מה קרה לפני שמדברים על תחביר.",
        "students": "מריצים, לוחצים, משנים ערך קטן ורואים תוצאה מיידית."
      },
      {
        "minutes": "8–20",
        "title": "מפרקים את הקסם",
        "teacher": "מצביעים על החלקים החשובים בלבד ומחברים בין פעולה במסך לבין שורת קוד אחת.",
        "students": "מסמנים מה שייך ל־HTML, מה ל־CSS ומה ל־JavaScript."
      },
      {
        "minutes": "20–36",
        "title": "בנייה מודרכת של התוצר",
        "teacher": "מדגימים צעד־צעד עם כרטיס/בלוק/שורת קוד אחת בכל פעם.",
        "students": "מבצעים יחד ומריצים אחרי כל שינוי קטן."
      },
      {
        "minutes": "36–52",
        "title": "הצצה לקוד האמיתי",
        "teacher": "נותנים שם מקצועי למושג, אבל לא מקריאים את כל הקוד.",
        "students": "מוצאים בקוד את המילה או השורה שמפעילה את הרעיון."
      },
      {
        "minutes": "52–68",
        "title": "תרגיל עצמאי הדרגתי",
        "teacher": "נותנים בחירה אישית עם גבולות בטוחים כדי ליצור תוצר משלהם.",
        "students": "משנים טקסטים, מספרים, צבעים או שורות מוכנות לפי המשימה."
      },
      {
        "minutes": "68–80",
        "title": "דיבאג ידידותי",
        "teacher": "מדגימים באג נפוץ אחד ומתקנים בקול רם בלי להפחיד.",
        "students": "בודקים גרשיים, סוגריים, id ושמות פונקציות."
      },
      {
        "minutes": "80–90",
        "title": "שיתוף ורפלקציה",
        "teacher": "מסיימים בהצגה קצרה ורפלקציה על מה הילד עשה לבד.",
        "students": "משתפים קישור או מציגים למסך ומסבירים שורת קוד אחת."
      }
    ],
    "exercises": [
      {
        "id": 1,
        "minutes": "0–8",
        "title": "תרגיל 1 — מריצים קודם",
        "prompt": "הריצו את הפרויקט וכתבו במילים מה קרה במסך.",
        "hint": "קודם תוצאה, אחר כך קוד.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "if",
            "else"
          ]
        }
      },
      {
        "id": 2,
        "minutes": "10–18",
        "title": "תרגיל 2 — מוצאים שורה חשובה",
        "prompt": "פתחו הצצה לקוד ומצאו את השורה שהמדריכה סימנה.",
        "hint": "אל תקראו הכל — חפשו מילת מפתח אחת.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "if",
            "else"
          ]
        }
      },
      {
        "id": 3,
        "minutes": "20–28",
        "title": "תרגיל 3 — שינוי בטוח",
        "prompt": "שנו רק טקסט, צבע או מספר אחד והריצו שוב.",
        "hint": "שמרו על גרשיים וסוגריים.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "if",
            "else"
          ]
        }
      },
      {
        "id": 4,
        "minutes": "30–38",
        "title": "תרגיל 4 — כרטיס קוד",
        "prompt": "הפעילו/גררו כרטיס קוד מתאים ובדקו מה השתנה.",
        "hint": "כרטיס קוד הוא כבר קוד אמיתי, רק באריזה נוחה.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "if",
            "else"
          ]
        }
      },
      {
        "id": 5,
        "minutes": "40–48",
        "title": "תרגיל 5 — השלמת חור",
        "prompt": "השלימו מילה חסרה או ערך חסר בקוד.",
        "hint": "אם לא בטוחים, השוו לדוגמה שעובדת.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "if",
            "else"
          ]
        }
      },
      {
        "id": 6,
        "minutes": "50–58",
        "title": "תרגיל 6 — דיבאג קטן",
        "prompt": "תקנו באג אחד: id, מרכאות, סוגר או שם פונקציה.",
        "hint": "בדקו שהשמות זהים בדיוק.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "if",
            "else"
          ]
        }
      },
      {
        "id": 7,
        "minutes": "60–68",
        "title": "תרגיל 7 — שדרוג אישי",
        "prompt": "הוסיפו בחירה אישית קטנה שמתאימה לנושא שלכם.",
        "hint": "שדרוג קטן עדיף על קוד גדול שנשבר.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "if",
            "else"
          ]
        }
      },
      {
        "id": 8,
        "minutes": "70–78",
        "title": "תרגיל 8 — הצגה",
        "prompt": "הציגו לחבר/ה והסבירו שורת קוד אחת שעבדה.",
        "hint": "השתמשו במילים של השיעור.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "if",
            "else"
          ]
        }
      }
    ],
    "aiHelper": [
      "הציעו רעיונות יצירתיים לתוצר בשיעור 28.",
      "הסבירו לילד/ה את המושג המרכזי בשפה פשוטה.",
      "עזרו למצוא באג נפוץ בלי לכתוב את כל הפתרון במקום התלמיד.",
      "הציעו שדרוג קטן שלא מקפיץ את רמת הקושי."
    ],
    "vocabulary": [
      [
        "input",
        "קלט מהמשתמש"
      ],
      [
        "comparison",
        "השוואה"
      ],
      [
        "if/else",
        "אם/אחרת"
      ],
      [
        "feedback",
        "משוב"
      ]
    ],
    "mode": "Guided coding",
    "progressionStage": "כתיבה מודרכת"
  },
  {
    "id": 29,
    "title": "מתכננים פרויקט אישי",
    "concept": "spec · screens · actions",
    "durationMinutes": 90,
    "story": "שיעור 29 נמצא בשלב כתיבה מודרכת: הילדים מתחילים מתוצר עובד, ואז מתקדמים עוד צעד מהבלוקים אל קוד אמיתי דרך משימה כיפית ומוגנת.",
    "mission": "לבחור פרויקט, לתכנן מסכים, פעולות ונתונים לפני כתיבה",
    "outcome": "תוצר עובד שמחזק את המעבר ההדרגתי: spec · screens · actions.",
    "starter": {
      "html": "<main class=\"code-lab\">\n  <h1>מתכננים פרויקט אישי</h1>\n  <p class=\"intro\">לבחור פרויקט, לתכנן מסכים, פעולות ונתונים לפני כתיבה</p>\n  <button onclick=\"runProject()\">הריצו בדיקה</button>\n  <p id=\"output\">כאן תופיע התוצאה...</p>\n</main>",
      "css": "body {\n  font-family: Arial, sans-serif;\n  direction: rtl;\n  text-align: center;\n  background: linear-gradient(135deg, #eff6ff, #fff7ed);\n}\n\n.code-lab {\n  background: white;\n  width: min(520px, 92vw);\n  margin: 42px auto;\n  padding: 30px;\n  border-radius: 28px;\n  box-shadow: 0 18px 42px #bfdbfe;\n}\n\n.intro { color: #475569; line-height: 1.6; }\n\nbutton {\n  background: #2563eb;\n  color: white;\n  border: 0;\n  border-radius: 999px;\n  padding: 12px 22px;\n  font-weight: bold;\n  cursor: pointer;\n}\n\n#output {\n  margin-top: 18px;\n  background: #f8fafc;\n  border-radius: 18px;\n  padding: 16px;\n  font-weight: bold;\n}",
      "js": "function runProject() {\n  const projectName = \"הפרויקט שלי\";\n  document.getElementById(\"output\").textContent = \"מתכננים: \" + projectName;\n}"
    },
    "lessonFlow": [
      {
        "minutes": "0–8",
        "title": "פתיחה: מתכננים פרויקט אישי",
        "teacher": "פותחים בתוצאה עובדת ומבקשים מהילדים לתאר מה קרה לפני שמדברים על תחביר.",
        "students": "מריצים, לוחצים, משנים ערך קטן ורואים תוצאה מיידית."
      },
      {
        "minutes": "8–20",
        "title": "מפרקים את הקסם",
        "teacher": "מצביעים על החלקים החשובים בלבד ומחברים בין פעולה במסך לבין שורת קוד אחת.",
        "students": "מסמנים מה שייך ל־HTML, מה ל־CSS ומה ל־JavaScript."
      },
      {
        "minutes": "20–36",
        "title": "בנייה מודרכת של התוצר",
        "teacher": "מדגימים צעד־צעד עם כרטיס/בלוק/שורת קוד אחת בכל פעם.",
        "students": "מבצעים יחד ומריצים אחרי כל שינוי קטן."
      },
      {
        "minutes": "36–52",
        "title": "הצצה לקוד האמיתי",
        "teacher": "נותנים שם מקצועי למושג, אבל לא מקריאים את כל הקוד.",
        "students": "מוצאים בקוד את המילה או השורה שמפעילה את הרעיון."
      },
      {
        "minutes": "52–68",
        "title": "תרגיל עצמאי הדרגתי",
        "teacher": "נותנים בחירה אישית עם גבולות בטוחים כדי ליצור תוצר משלהם.",
        "students": "משנים טקסטים, מספרים, צבעים או שורות מוכנות לפי המשימה."
      },
      {
        "minutes": "68–80",
        "title": "דיבאג ידידותי",
        "teacher": "מדגימים באג נפוץ אחד ומתקנים בקול רם בלי להפחיד.",
        "students": "בודקים גרשיים, סוגריים, id ושמות פונקציות."
      },
      {
        "minutes": "80–90",
        "title": "שיתוף ורפלקציה",
        "teacher": "מסיימים בהצגה קצרה ורפלקציה על מה הילד עשה לבד.",
        "students": "משתפים קישור או מציגים למסך ומסבירים שורת קוד אחת."
      }
    ],
    "exercises": [
      {
        "id": 1,
        "minutes": "0–8",
        "title": "תרגיל 1 — מריצים קודם",
        "prompt": "הריצו את הפרויקט וכתבו במילים מה קרה במסך.",
        "hint": "קודם תוצאה, אחר כך קוד.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "projectName",
            "output"
          ]
        }
      },
      {
        "id": 2,
        "minutes": "10–18",
        "title": "תרגיל 2 — מוצאים שורה חשובה",
        "prompt": "פתחו הצצה לקוד ומצאו את השורה שהמדריכה סימנה.",
        "hint": "אל תקראו הכל — חפשו מילת מפתח אחת.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "projectName",
            "output"
          ]
        }
      },
      {
        "id": 3,
        "minutes": "20–28",
        "title": "תרגיל 3 — שינוי בטוח",
        "prompt": "שנו רק טקסט, צבע או מספר אחד והריצו שוב.",
        "hint": "שמרו על גרשיים וסוגריים.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "projectName",
            "output"
          ]
        }
      },
      {
        "id": 4,
        "minutes": "30–38",
        "title": "תרגיל 4 — כרטיס קוד",
        "prompt": "הפעילו/גררו כרטיס קוד מתאים ובדקו מה השתנה.",
        "hint": "כרטיס קוד הוא כבר קוד אמיתי, רק באריזה נוחה.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "projectName",
            "output"
          ]
        }
      },
      {
        "id": 5,
        "minutes": "40–48",
        "title": "תרגיל 5 — השלמת חור",
        "prompt": "השלימו מילה חסרה או ערך חסר בקוד.",
        "hint": "אם לא בטוחים, השוו לדוגמה שעובדת.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "projectName",
            "output"
          ]
        }
      },
      {
        "id": 6,
        "minutes": "50–58",
        "title": "תרגיל 6 — דיבאג קטן",
        "prompt": "תקנו באג אחד: id, מרכאות, סוגר או שם פונקציה.",
        "hint": "בדקו שהשמות זהים בדיוק.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "projectName",
            "output"
          ]
        }
      },
      {
        "id": 7,
        "minutes": "60–68",
        "title": "תרגיל 7 — שדרוג אישי",
        "prompt": "הוסיפו בחירה אישית קטנה שמתאימה לנושא שלכם.",
        "hint": "שדרוג קטן עדיף על קוד גדול שנשבר.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "projectName",
            "output"
          ]
        }
      },
      {
        "id": 8,
        "minutes": "70–78",
        "title": "תרגיל 8 — הצגה",
        "prompt": "הציגו לחבר/ה והסבירו שורת קוד אחת שעבדה.",
        "hint": "השתמשו במילים של השיעור.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "projectName",
            "output"
          ]
        }
      }
    ],
    "aiHelper": [
      "הציעו רעיונות יצירתיים לתוצר בשיעור 29.",
      "הסבירו לילד/ה את המושג המרכזי בשפה פשוטה.",
      "עזרו למצוא באג נפוץ בלי לכתוב את כל הפתרון במקום התלמיד.",
      "הציעו שדרוג קטן שלא מקפיץ את רמת הקושי."
    ],
    "vocabulary": [
      [
        "spec",
        "אפיון קצר"
      ],
      [
        "screen",
        "מסך"
      ],
      [
        "action",
        "פעולה"
      ],
      [
        "data",
        "מידע שהפרויקט שומר"
      ]
    ],
    "mode": "Project planning",
    "progressionStage": "כתיבה מודרכת"
  },
  {
    "id": 30,
    "title": "פרויקט סיום — Web App קטן",
    "concept": "HTML + CSS + JS",
    "durationMinutes": 90,
    "story": "שיעור 30 נמצא בשלב כתיבה מודרכת: הילדים מתחילים מתוצר עובד, ואז מתקדמים עוד צעד מהבלוקים אל קוד אמיתי דרך משימה כיפית ומוגנת.",
    "mission": "לבנות פרויקט סיום אישי: משחק, חידון, מחולל או עמוד אינטראקטיבי",
    "outcome": "תוצר עובד שמחזק את המעבר ההדרגתי: HTML + CSS + JS.",
    "starter": {
      "html": "<main class=\"code-lab\">\n  <h1>פרויקט סיום — Web App קטן</h1>\n  <p class=\"intro\">לבנות פרויקט סיום אישי: משחק, חידון, מחולל או עמוד אינטראקטיבי</p>\n  <button onclick=\"runProject()\">הריצו בדיקה</button>\n  <p id=\"output\">כאן תופיע התוצאה...</p>\n</main>",
      "css": "body {\n  font-family: Arial, sans-serif;\n  direction: rtl;\n  text-align: center;\n  background: linear-gradient(135deg, #eff6ff, #fff7ed);\n}\n\n.code-lab {\n  background: white;\n  width: min(520px, 92vw);\n  margin: 42px auto;\n  padding: 30px;\n  border-radius: 28px;\n  box-shadow: 0 18px 42px #bfdbfe;\n}\n\n.intro { color: #475569; line-height: 1.6; }\n\nbutton {\n  background: #2563eb;\n  color: white;\n  border: 0;\n  border-radius: 999px;\n  padding: 12px 22px;\n  font-weight: bold;\n  cursor: pointer;\n}\n\n#output {\n  margin-top: 18px;\n  background: #f8fafc;\n  border-radius: 18px;\n  padding: 16px;\n  font-weight: bold;\n}",
      "js": "function runProject() {\n  document.getElementById(\"output\").textContent = \"פרויקט הסיום שלי עובד 🎉\";\n}"
    },
    "lessonFlow": [
      {
        "minutes": "0–8",
        "title": "פתיחה: פרויקט סיום — Web App קטן",
        "teacher": "פותחים בתוצאה עובדת ומבקשים מהילדים לתאר מה קרה לפני שמדברים על תחביר.",
        "students": "מריצים, לוחצים, משנים ערך קטן ורואים תוצאה מיידית."
      },
      {
        "minutes": "8–20",
        "title": "מפרקים את הקסם",
        "teacher": "מצביעים על החלקים החשובים בלבד ומחברים בין פעולה במסך לבין שורת קוד אחת.",
        "students": "מסמנים מה שייך ל־HTML, מה ל־CSS ומה ל־JavaScript."
      },
      {
        "minutes": "20–36",
        "title": "בנייה מודרכת של התוצר",
        "teacher": "מדגימים צעד־צעד עם כרטיס/בלוק/שורת קוד אחת בכל פעם.",
        "students": "מבצעים יחד ומריצים אחרי כל שינוי קטן."
      },
      {
        "minutes": "36–52",
        "title": "הצצה לקוד האמיתי",
        "teacher": "נותנים שם מקצועי למושג, אבל לא מקריאים את כל הקוד.",
        "students": "מוצאים בקוד את המילה או השורה שמפעילה את הרעיון."
      },
      {
        "minutes": "52–68",
        "title": "תרגיל עצמאי הדרגתי",
        "teacher": "נותנים בחירה אישית עם גבולות בטוחים כדי ליצור תוצר משלהם.",
        "students": "משנים טקסטים, מספרים, צבעים או שורות מוכנות לפי המשימה."
      },
      {
        "minutes": "68–80",
        "title": "דיבאג ידידותי",
        "teacher": "מדגימים באג נפוץ אחד ומתקנים בקול רם בלי להפחיד.",
        "students": "בודקים גרשיים, סוגריים, id ושמות פונקציות."
      },
      {
        "minutes": "80–90",
        "title": "שיתוף ורפלקציה",
        "teacher": "מסיימים בהצגה קצרה ורפלקציה על מה הילד עשה לבד.",
        "students": "משתפים קישור או מציגים למסך ומסבירים שורת קוד אחת."
      }
    ],
    "exercises": [
      {
        "id": 1,
        "minutes": "0–8",
        "title": "תרגיל 1 — מריצים קודם",
        "prompt": "הריצו את הפרויקט וכתבו במילים מה קרה במסך.",
        "hint": "קודם תוצאה, אחר כך קוד.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "output",
            "textContent"
          ]
        }
      },
      {
        "id": 2,
        "minutes": "10–18",
        "title": "תרגיל 2 — מוצאים שורה חשובה",
        "prompt": "פתחו הצצה לקוד ומצאו את השורה שהמדריכה סימנה.",
        "hint": "אל תקראו הכל — חפשו מילת מפתח אחת.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "output",
            "textContent"
          ]
        }
      },
      {
        "id": 3,
        "minutes": "20–28",
        "title": "תרגיל 3 — שינוי בטוח",
        "prompt": "שנו רק טקסט, צבע או מספר אחד והריצו שוב.",
        "hint": "שמרו על גרשיים וסוגריים.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "output",
            "textContent"
          ]
        }
      },
      {
        "id": 4,
        "minutes": "30–38",
        "title": "תרגיל 4 — כרטיס קוד",
        "prompt": "הפעילו/גררו כרטיס קוד מתאים ובדקו מה השתנה.",
        "hint": "כרטיס קוד הוא כבר קוד אמיתי, רק באריזה נוחה.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "output",
            "textContent"
          ]
        }
      },
      {
        "id": 5,
        "minutes": "40–48",
        "title": "תרגיל 5 — השלמת חור",
        "prompt": "השלימו מילה חסרה או ערך חסר בקוד.",
        "hint": "אם לא בטוחים, השוו לדוגמה שעובדת.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "output",
            "textContent"
          ]
        }
      },
      {
        "id": 6,
        "minutes": "50–58",
        "title": "תרגיל 6 — דיבאג קטן",
        "prompt": "תקנו באג אחד: id, מרכאות, סוגר או שם פונקציה.",
        "hint": "בדקו שהשמות זהים בדיוק.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "output",
            "textContent"
          ]
        }
      },
      {
        "id": 7,
        "minutes": "60–68",
        "title": "תרגיל 7 — שדרוג אישי",
        "prompt": "הוסיפו בחירה אישית קטנה שמתאימה לנושא שלכם.",
        "hint": "שדרוג קטן עדיף על קוד גדול שנשבר.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "output",
            "textContent"
          ]
        }
      },
      {
        "id": 8,
        "minutes": "70–78",
        "title": "תרגיל 8 — הצגה",
        "prompt": "הציגו לחבר/ה והסבירו שורת קוד אחת שעבדה.",
        "hint": "השתמשו במילים של השיעור.",
        "check": {
          "htmlIncludes": [
            "<main"
          ],
          "cssIncludes": [
            "background"
          ],
          "jsIncludes": [
            "output",
            "textContent"
          ]
        }
      }
    ],
    "aiHelper": [
      "הציעו רעיונות יצירתיים לתוצר בשיעור 30.",
      "הסבירו לילד/ה את המושג המרכזי בשפה פשוטה.",
      "עזרו למצוא באג נפוץ בלי לכתוב את כל הפתרון במקום התלמיד.",
      "הציעו שדרוג קטן שלא מקפיץ את רמת הקושי."
    ],
    "vocabulary": [
      [
        "project",
        "פרויקט שלם"
      ],
      [
        "iteration",
        "שיפור הדרגתי"
      ],
      [
        "publish",
        "שיתוף תוצר"
      ],
      [
        "reflection",
        "מה למדתי ומה כתבתי לבד"
      ]
    ],
    "mode": "Final project",
    "progressionStage": "כתיבה מודרכת"
  }
];
  webCodeAdvancedLessons.forEach(advancedLesson => lessons.push(advancedLesson));

  const advancedBridgeBlocksByLesson = {};
  webCodeAdvancedLessons.forEach(lesson => {
    if (lesson.id >= 13 && lesson.id <= 18) {
      advancedBridgeBlocksByLesson[lesson.id] = [
        { label: '✏️ עריכת טקסט בטוחה', target: 'js', find: 'כאן תופיע התוצאה...', replace: 'כאן תופיע תוצאה משודרגת...', hint: 'משנים רק טקסט בתוך מרכאות, לא את הסימנים.' },
        { label: '🔎 מצא output', target: 'js', find: 'document.getElementById("output")', replace: 'document.getElementById("output")', hint: 'כרטיס זיהוי: זו השורה שמוצאת את אזור התוצאה.' },
        { label: '🎨 צבע רקע קטן', target: 'css', find: 'background: linear-gradient(135deg, #eff6ff, #fff7ed);', replace: 'background: linear-gradient(135deg, #fdf2f8, #ecfeff);', hint: 'עריכת CSS בטוחה: מחליפים רק ערכי צבע.' }
      ];
    }
    if (lesson.id >= 19 && lesson.id <= 24) {
      advancedBridgeBlocksByLesson[lesson.id] = [
        { label: '🧩 כרטיס HTML אמיתי: כותרת', target: 'html', find: `<h1>${lesson.title}</h1>`, replace: `<h1>${lesson.title}</h1>`, hint: 'זה כבר קוד HTML אמיתי בתוך כרטיס גרירה/הפעלה.' },
        { label: '🧩 כרטיס CSS אמיתי: עיצוב כפתור', target: 'css', find: 'border-radius: 999px;', replace: 'border-radius: 16px;', hint: 'כרטיס CSS אמיתי שמשנה ערך בקוד.' },
        { label: '🧩 כרטיס JS אמיתי: שורת תוצאה', target: 'js', find: 'document.getElementById("output").textContent', replace: 'document.getElementById("output").textContent', hint: 'שורת JavaScript אמיתית שמעדכנת את המסך.' },
        { label: '🧩 כרטיס סדר קוד', target: 'js', find: 'function runProject() {', replace: 'function runProject() {', hint: 'כרטיס שמדגיש שסדר השורות בתוך function חשוב.' }
      ];
    }
  });
  lessons.forEach(lesson => {
    if (advancedBridgeBlocksByLesson[lesson.id]) lesson.bridgeBlocks = advancedBridgeBlocksByLesson[lesson.id];
  });
  lessons.slice(12).forEach(lesson => {
    lesson.exercises.forEach(exercise => {
      if ([3, 5, 6, 7, 8].includes(exercise.id)) exercise.check.changedAny = ['html', 'css', 'js'];
      if (exercise.id === 4 && lesson.bridgeBlocks?.length) exercise.check.changedAny = ['html', 'css', 'js'];
    });
  });
  lessons.forEach(lesson => {
    if (lesson.realBlocklyBuilder) return;
    lesson.exercises.forEach(exercise => {
      const text = `${exercise.title} ${exercise.prompt}`;
      const c = exercise.check || {};
      const starterPasses = (c.htmlIncludes || []).every(x => lesson.starter.html.includes(x)) &&
        (c.cssIncludes || []).every(x => lesson.starter.css.includes(x)) &&
        (c.jsIncludes || []).every(x => lesson.starter.js.includes(x)) &&
        (c.htmlExcludes || []).every(x => !lesson.starter.html.includes(x)) &&
        (c.cssExcludes || []).every(x => !lesson.starter.css.includes(x)) &&
        (c.jsExcludes || []).every(x => !lesson.starter.js.includes(x));
      if (/גררו|חברו|הפעילו|שנו|השלימו|תקנו|הוסיפו|צרו/.test(text) && starterPasses) {
        c.changedAny = ['html', 'css', 'js'];
      }
    });
  });


  const lessonBlocklyPlan = {
    4: { focus: 'קלט אישי', intro: 'בונים מחולל אישי דרך בלוקים נגררים שמעדכנים HTML ו־JavaScript בלי לכתוב קוד חופשי.' },
    5: { focus: 'תנאים if/else', intro: 'בונים חידון כן/לא דרך בלוקים נגררים: שאלה, בחירה נכונה, הצלחה ואחרת.' },
    6: { focus: 'משתנים וניקוד', intro: 'משנים חוקי ניקוד דרך בלוקים ורואים איך score שומר מספר.' },
    7: { focus: 'יעד ניצחון', intro: 'מאזנים משחק קליקים דרך בלוקים של יעד, נקודות ומשוב.' },
    8: { focus: 'זמן וטיימר', intro: 'בודקים משחק עם זמן ומפעילים בלוקים שמשנים ספירה לאחור וסיום.' },
    9: { focus: 'חיים ומכשולים', intro: 'לומדים שחוקי משחק כוללים גם טעויות, חיים ו־Game Over.' },
    10: { focus: 'מצב וכוח מיוחד', intro: 'בודקים משתנה בוליאני דרך כוח חד־פעמי ומשנים איזון משחק.' },
    11: { focus: 'מסכים ומעבר', intro: 'בונים חוויית משחק עם מסך פתיחה, משחק, ניצחון והפסד.' },
    12: { focus: 'מיני־פרויקט', intro: 'משלבים כמה בלוקים יחד לפרויקט משחק קטן עם איזון ומשוב.' },
    13: { focus: 'קריאת קוד שנוצר', intro: 'עדיין עובדים בבלוקים: כל כרטיס הוא בלוק שמוביל לשורת קוד שנוצרה.' },
    14: { focus: 'HTML דרך בלוקים', intro: 'מכירים HTML אמיתי דרך כרטיסי Blockly לפני כתיבה חופשית.' },
    15: { focus: 'CSS דרך בלוקים', intro: 'מכירים CSS אמיתי דרך כרטיסי Blockly שמראים שינוי ויזואלי.' },
    16: { focus: 'JavaScript דרך בלוקים', intro: 'מכירים שורות JavaScript דרך בלוקים שמעדכנים את המסך.' },
    17: { focus: 'מספרים שמשנים משחק', intro: 'משנים מספרי משחק דרך בלוקים ולומדים למה מספר קטן משנה חוויה גדולה.' },
    18: { focus: 'דיבאג דרך בלוקים', intro: 'לומדים למצוא שגיאות קטנות בעזרת בלוקים שמצביעים על id, טקסט ותוצאה.' },
    19: { focus: 'כרטיסי HTML', intro: 'גוררים כרטיסי HTML אמיתי אבל עדיין לא כותבים את כל הקוד לבד.' },
    20: { focus: 'כרטיסי CSS', intro: 'גוררים כרטיסי CSS אמיתי ומשווים איך שינוי עיצוב משפיע על האתר.' },
    21: { focus: 'כרטיסי JavaScript', intro: 'גוררים כרטיסי JavaScript אמיתי ורואים איך שורת קוד משנה תוצאה.' },
    22: { focus: 'סדר קוד', intro: 'מבינים שסדר הוראות חשוב בעזרת בלוקים מחוברים לפי רצף.' },
    23: { focus: 'השלמת חורים', intro: 'מזהים חלקים חסרים בקוד דרך בלוקים לפני כתיבה עצמאית.' },
    24: { focus: 'חוקי משחק', intro: 'משנים חוקי משחק דרך בלוקים כהכנה אחרונה לפני כתיבת קוד בשיעור 25.' }
  };
  function makeBlocklyLessonFlow(lesson){
    const focus = lessonBlocklyPlan[lesson.id]?.focus || lesson.concept;
    return [
      { minutes: '0–8', title: 'פתיחה: בודקים תוצר עובד', teacher: `מריצים את הפרויקט ומזהים יחד את הרעיון המרכזי: ${focus}.`, students: 'מתארים מה רואים ומה המשתמש יכול לעשות.' },
      { minutes: '8–18', title: 'בלוק ראשון מחובר', teacher: 'מדגימים גרירה וחיבור מתחת ל“עמוד האתר שלי”, ומדגישים שבלוק חופשי בצד לא משפיע.', students: 'גוררים את בלוק השיעור הראשון ומפעילים בדיקה.' },
      { minutes: '18–32', title: 'בלוקים משנים חוק', teacher: 'מוסיפים בלוק נוסף ומשווים לפני/אחרי בקוד ובתצוגה.', students: 'מסבירים האם השינוי שייך ל־HTML, CSS או JavaScript.' },
      { minutes: '32–48', title: 'ניסוי מודרך', teacher: 'מבקשים לבדוק מקרה נוסף: תשובה אחרת, לחיצה נוספת, זמן אחר או מצב משחק אחר לפי השיעור.', students: 'בודקים את התוצאה ולא מסתפקים בכך שהבלוק מחובר.' },
      { minutes: '48–62', title: 'איזון ושיפור', teacher: 'מדברים על החלטה תכנונית: האם השינוי ברור, הוגן, מצחיק או שימושי לילד שמשתמש בפרויקט.', students: 'בוחרים בלוק שיפור ומנסחים למה הוא טוב.' },
      { minutes: '62–74', title: 'דיבאג דרך שמות', teacher: 'מראים קשרים חשובים כמו id, function, score, target או output בלי לדרוש כתיבה חופשית.', students: 'מחפשים התאמה בין בלוק לבין שורה בקוד שנוצר.' },
      { minutes: '74–84', title: 'הצצה לקוד שנוצר', teacher: 'פותחים את ההצצה, בוחרים בלוק מחובר, ומדגישים את השורה שנוצרה.', students: 'אומרים במילים: “הבלוק הזה יצר/שינה את השורה הזאת”.' },
      { minutes: '84–90', title: 'סיכום לקראת קוד אמיתי', teacher: 'מחברים בין עבודה בבלוקים לבין היעד: בשיעורים 25–30 נתחיל לכתוב חלקים בעצמנו.', students: 'משתפים דבר אחד שהבינו בקוד בלי לכתוב אותו לבד עדיין.' }
    ];
  }
  function makeBlocklyLessonExercises(lesson){
    const blocks = lesson.blocklyBlocks || [];
    const first = blocks[0];
    const second = blocks[1] || blocks[0];
    const third = blocks[2] || second;
    const fourth = blocks[3] || third;
    const fifth = blocks[4] || fourth;
    const sixth = blocks[5] || fifth;
    const blockCheck = block => block ? { blockTypes: [block.type], [`${block.target || 'html'}Includes`]: [block.replace || block.highlight || ''] } : {};
    const selectedTypes = blocks.map(block => block.type);
    return [
      { id: 1, minutes: '0–8', title: 'תרגיל 1 — מפעילים את הפרויקט', prompt: `הריצו את הפרויקט בתצוגה החיה משמאל ונסו להבין מה המשתמש יכול לעשות בו. בשיעור הזה נלמד דרך בלוקים: ${lessonBlocklyPlan[lesson.id]?.focus || lesson.concept}.`, hint: 'קודם מסתכלים על ההתנהגות, ורק אחר כך גוררים בלוקים.', check: { htmlIncludes: ['<main'], cssIncludes: ['background'], jsIncludes: ['function'] } },
      { id: 2, minutes: '8–18', title: `תרגיל 2 — גוררים ${first?.label || 'בלוק ראשון'}`, prompt: `גררו וחברו את הבלוק “${first?.label || 'בלוק ראשון'}” מתחת ל“עמוד האתר שלי”. בדקו מה השתנה בקוד ובתצוגה.`, hint: first?.hint || 'הבלוק חייב להיות מחובר לשרשרת, לא חופשי בצד.', check: { ...blockCheck(first), blockFeedback: `כמעט. גררו וחברו את הבלוק “${first?.label || 'בלוק ראשון'}” לשרשרת.` } },
      { id: 3, minutes: '18–28', title: `תרגיל 3 — מוסיפים ${second?.label || 'בלוק שני'}`, prompt: `חברו גם את הבלוק “${second?.label || 'בלוק שני'}”. עכשיו השוו: איזה חלק השתנה — HTML, CSS או JavaScript?`, hint: second?.hint || 'חפשו את השינוי בלשונית המתאימה בהצצה לקוד.', check: { ...blockCheck(second), blockFeedback: `כמעט. חסר הבלוק “${second?.label || 'בלוק שני'}”.` } },
      { id: 4, minutes: '28–40', title: `תרגיל 4 — בלוק שמשנה תגובה`, prompt: `חברו את הבלוק “${third?.label || 'בלוק תגובה'}” ובדקו שהתוצאה השתנתה בצורה שאפשר להסביר לחבר/ה.`, hint: third?.hint || 'נסו להגיד במילים: לפני הבלוק קרה __, אחרי הבלוק קרה __.', check: { ...blockCheck(third), blockFeedback: `כמעט. חברו את הבלוק “${third?.label || 'בלוק תגובה'}” לשרשרת.` } },
      { id: 5, minutes: '40–52', title: `תרגיל 5 — בודקים מקרה נוסף`, prompt: `חברו את הבלוק “${fourth?.label || 'בלוק נוסף'}” ונסו את הפרויקט שוב. המטרה היא להבין חוק, לא רק לעבור בדיקה.`, hint: fourth?.hint || 'אם זה משחק או חידון, נסו גם תשובה/לחיצה נכונה וגם לא נכונה.', check: { ...blockCheck(fourth), blockFeedback: `כמעט. חסר הבלוק “${fourth?.label || 'בלוק נוסף'}”.` } },
      { id: 6, minutes: '52–64', title: `תרגיל 6 — איזון ושיפור`, prompt: `חברו את הבלוק “${fifth?.label || 'בלוק שיפור'}”. שאלו את עצמכם: האם השינוי עוזר למשתמש או הופך את המשחק לקל/קשה מדי?`, hint: fifth?.hint || 'שינוי טוב הוא שינוי שאפשר להסביר, לא רק שינוי צבע או מספר.', check: { ...blockCheck(fifth), blockFeedback: `כמעט. חברו את הבלוק “${fifth?.label || 'בלוק שיפור'}”.` } },
      { id: 7, minutes: '64–74', title: `תרגיל 7 — דיבאג עם בלוקים`, prompt: `חברו את הבלוק “${sixth?.label || 'בלוק בדיקה'}” ואז בדקו שלא נשבר קשר חשוב כמו id, function או שם משתנה.`, hint: sixth?.hint || 'חפשו התאמה בין השמות ב־HTML וב־JavaScript.', check: { ...blockCheck(sixth), blockFeedback: `כמעט. חסר הבלוק “${sixth?.label || 'בלוק בדיקה'}”.` } },
      { id: 8, minutes: '74–84', title: 'תרגיל 8 — מסמנים קוד שנוצר', prompt: 'פתחו “לראות קוד שנוצר”, לחצו על אחד הבלוקים שחיברתם, וודאו ששורת הקוד שהוא יצר מסומנת בלשונית הנכונה.', hint: 'זה הגשר לשיעורים 25–30: קודם בלוק, אחר כך מבינים איזו שורת קוד נוצרה ממנו.', check: { htmlIncludes: ['<main'], cssIncludes: ['background'], jsIncludes: ['function'], blockTypes: selectedTypes.slice(0, Math.min(2, selectedTypes.length)), requiresCodePeek: true, requiresCodeSelectionBlockTypes: selectedTypes, codePeekFeedback: 'כמעט. קודם פתחו את “לראות קוד שנוצר”.', codeSelectionFeedback: 'כמעט. אחרי פתיחת ההצצה, לחצו על בלוק מחובר וראו שהקוד שלו מסומן.' } }
    ];
  }
  lessons.forEach(lesson => {
    if (lesson.id < 4 || lesson.id > 24) return;
    const sourceBlocks = lesson.bridgeBlocks || [];
    lesson.blocklyLessonBuilder = true;
    lesson.realBlocklyBuilder = true;
    lesson.mode = `Real Blockly lesson studio — ${lessonBlocklyPlan[lesson.id]?.focus || lesson.mode || 'WebCode'}`;
    lesson.progressionStage = 'בלוקים אמיתיים לפני כתיבת קוד';
    lesson.blocklyBlocks = sourceBlocks.map((block, index) => ({
      ...block,
      hint: String(block.hint || '').replaceAll('כלי עזר', 'בלוק'),
      type: `lesson_${lesson.id}_block_${index + 1}`,
      message: block.label.replace(/^\S+\s*/, ''),
      highlight: block.replace || block.find,
      colour: block.target === 'css' ? 285 : block.target === 'js' ? 120 : 210
    }));
    lesson.bridgeBlocks = [];
    if (lessonBlocklyPlan[lesson.id]) {
      lesson.story = lessonBlocklyPlan[lesson.id].intro + ' ' + (lesson.story || '');
      lesson.mission = `לבנות ולהבין ${lessonBlocklyPlan[lesson.id].focus} בעזרת בלוקים נגררים ומחוברים, עם הצצה לקוד שנוצר.`;
      lesson.outcome = `${lessonBlocklyPlan[lesson.id].focus} דרך בלוקים אמיתיים, מוכנים למעבר הדרגתי לקוד בשיעור 25.`;
      lesson.lessonFlow = makeBlocklyLessonFlow(lesson);
    }
    if (lesson.blocklyBlocks.length) lesson.exercises = makeBlocklyLessonExercises(lesson);
  });

  const fullBlockRework = {
    4: { title:'קלט מהמשתמש — מחולל ברכות בבלוקים', concept:'input · value · חיבור טקסטים', blocks:[
      ['name_label','שדה שם מציג %1','html','שם גיבור/ה:','{{TEXT}}',[['field_input','TEXT','מה השם שלך?']]],
      ['topic_label','שדה נושא מציג %1','html','נושא לברכה:','{{TEXT}}',[['field_input','TEXT','על מה הברכה?']]],
      ['button_text','כפתור המחולל כותב %1','html','צרו ברכה מצחיקה','{{TEXT}}',[['field_input','TEXT','צרו ברכה אישית']]],
      ['sentence','משפט תוצאה מתחיל ב־ %1','js','הנה ברכה מצחיקה על','{{TEXT}}',[['field_input','TEXT','הברכה שבחרת היא על']]],
      ['result_word','אימוג׳י סיום בתוצאה %1','js','רעיונות נוצצים 🚀','רעיונות נוצצים {{TEXT}}',[['field_dropdown','TEXT',[['🚀 טיסה','🚀'],['🎉 חגיגה','🎉'],['✨ קסם','✨']]]]]
    ]},
    5: { title:'תנאים — חידון תשובה חופשית עם if/else', concept:'if · else · תשובה נכונה ושגויה', blocks:[
      ['question','שאלת חידון %1','html','CSS אחראי על העיצוב של העמוד?','{{TEXT}}',[['field_input','TEXT','איזו שפה גורמת לכפתור להגיב?']]],
      ['answer','התשובה הנכונה היא %1','js','answer === "CSS"','answer === "{{TEXT}}"',[['field_input','TEXT','JavaScript']]],
      ['success','אם נכון כתוב %1','js','נכון! CSS אחראי על העיצוב 🎨','{{TEXT}}',[['field_input','TEXT','נכון! JavaScript מפעיל תגובות ⚡']]],
      ['wrong','אחרת כתוב %1','js','לא בדיוק. CSS הוא הצד של הצבעים והעיצוב.','{{TEXT}}',[['field_input','TEXT','כמעט! רמז: JavaScript היא השפה של הפעולות.']]],
      ['chosen_background','אם נבחר צבע %1 שנה רקע ל־%2','js','  const feedback = document.getElementById("feedback");','  const feedback = document.getElementById("feedback");\n  const colorChoice = document.getElementById("colorChoice").value;\n\n  if (colorChoice === "{{COLOR}}") {\n    document.body.style.background = "{{BG}}";\n  }',[['field_dropdown','COLOR', [['אדום','red'], ['כחול','blue'], ['ירוק','green']]], ['field_dropdown','BG', [['אדום בהיר','#fecaca'], ['כחול בהיר','#bfdbfe'], ['ירוק בהיר','#bbf7d0']]]]],
      ['button_style','צבע כפתור בדיקה %1','css','button {\n  display: block;\n  margin: 12px auto 0;\n  background: #16a34a;','button {\n  display: block;\n  margin: 12px auto 0;\n  background: {{COLOR}};',[['field_dropdown','COLOR',[['ירוק','#16a34a'],['סגול','#7c3aed'],['כתום','#f97316'],['כחול','#2563eb'],['ורוד','#db2777'],['צהוב','#facc15']]]]]
    ]},
    6: { title:'משתנים וניקוד — score זוכר בשבילנו', concept:'variable · score · update screen', blocks:[
      ['start_score','ניקוד התחלתי %1','js','const startScore = 0;','const startScore = {{N}};',[['field_dropdown','N',[['0','0'],['1','1'],['3','3']]]]],
      ['plus','תשובה נכונה מוסיפה %1','js','const pointsForCorrect = 0;','const pointsForCorrect = {{N}};',[['field_dropdown','N',[['1','1'],['2','2'],['3','3']]]]],
      ['message','הודעת הצלחה %1','js','const successMessage = "";','const successMessage = "{{TEXT}}";',[['field_input','TEXT','נכון! קיבלת 2 נקודות ⭐⭐']]],
      ['score_label','כותרת ניקוד %1','html','ניקוד:','{{TEXT}}',[['field_input','TEXT','הניקוד שלי:']]],
      ['reset_message','כפתור איפוס אומר %1','html','איפוס ניקוד','{{TEXT}}',[['field_input','TEXT','התחלה מחדש']]]
    ]},
    7: { title:'דני אופה עוגיות — משחק קליקים ראשון', concept:'click event · target · progress · win condition', blocks:[
      ['target','יעד ניצחון %1','js','const target = 10;\ndocument.getElementById("targetText").textContent = target;\ndocument.getElementById("message").textContent = "דני מתחיל לאפות. הגיעו ל־" + target + " עוגיות במגש!";','const target = {{N}};\ndocument.getElementById("targetText").textContent = target;\ndocument.getElementById("message").textContent = "דני מתחיל לאפות. הגיעו ל־" + target + " עוגיות במגש!";',[['field_dropdown','N',[['5','5'],['8','8'],['12','12']]]]],
      ['click_points','כל קליק מוסיף %1','js','score = score + 1;','score = score + {{N}};',[['field_dropdown','N',[['1','1'],['2','2'],['3','3']]]]],
      ['win_text','הודעת ניצחון %1','js','המגש מלא! העוגיות מוכנות 🍪','{{TEXT}}',[['field_input','TEXT','אליפות! דני מילא מגש עוגיות 🎉']]],
      ['button','טקסט כפתור %1','html','אפו עוגייה','{{TEXT}}',[['field_input','TEXT','אפו עוד עוגייה!']]],
      ['win_color','צבע ניצחון %1','css','#dcfce7','{{COLOR}}',[['field_dropdown','COLOR',[['ירוק','#bbf7d0'],['צהוב','#fef08a'],['ורוד','#fbcfe8']]]]]
    ]},
    8: { title:'טיימר הצלת העיר — משחק נגד השעון', concept:'timer · setInterval · countdown · visual feedback', blocks:[
      ['time','זמן התחלה %1 שניות','js','const startTime = 15;','const startTime = {{N}};',[['field_dropdown','N',[['10','10'],['15','15'],['20','20']]]]],
      ['windows','מספר חלונות בעיר %1','js','const totalWindows = 10;','const totalWindows = {{N}};',[['field_dropdown','N',[['5','5'],['10','10'],['15','15'],['20','20']]]]],
      ['end','הודעת סיום %1','js','כל הכבוד 🎉','{{TEXT}}',[['field_input','TEXT','כל הכבוד 🎉']]],
      ['start','כפתור התחלה %1','html','התחילו משימה','{{TEXT}}',[['field_input','TEXT','צאו להצלה!']]],
      ['lit_color','צבע חלון מואר %1','css','#fde047','{{COLOR}}',[['field_dropdown','COLOR',[['צהוב','#fde047'],['ירוק','#a7f3d0'],['ורוד','#fbcfe8'],['כחול','#93c5fd'],['סגול','#c4b5fd'],['כתום','#fdba74']]]]]
    ]},
    9: { title:'תופסים כוכבים, לא מכשולים', concept:'lives · random · if · game over', blocks:[
      ['lives','חיים בהתחלה %1','js','const startLives = 3;\nlet lives = startLives;\ndocument.getElementById("livesText").textContent = startLives;','const startLives = {{N}};\nlet lives = startLives;\ndocument.getElementById("livesText").textContent = startLives;',[['field_dropdown','N',[['3','3'],['5','5'],['7','7']]]]],
      ['star','כוכב מוסיף %1 נקודות','js','score = score + 1;','score = score + {{N}};',[['field_dropdown','N',[['1','1'],['2','2'],['3','3']]]]],
      ['obstacle','מכשול מוריד %1 חיים','js','lives = lives - 1;','lives = lives - {{N}};',[['field_dropdown','N',[['1','1'],['2','2'],['3','3']]]]],
      ['gameover','הודעת Game Over %1','js','נגמרו החיים. נסו שוב!','{{TEXT}}',[['field_input','TEXT','סוף המשחק! נסו סיבוב חדש 🎮']]],
      ['smart_skip','דילוג חכם אומר %1','js','דילוג חכם!','{{TEXT}}',[['field_input','TEXT','יופי! התחמקתם מהמכשול 🛡️']]]
    ]},
    10: { title:'מעבדת גיבורי־על — כוח מיוחד לדמות', concept:'boolean · selectedHero · one-time power · visual state', blocks:[
      ['hero_name','שם רובוט %1','js','רובוט אור','{{TEXT}}',[['field_input','TEXT','רובוט ברק']]],
      ['hero_symbol','סמל נינג׳ה %1','js','document.getElementById("heroAvatar").textContent = "🥷";','document.getElementById("heroAvatar").textContent = "{{TEXT}}";',[['field_input','TEXT','🦸']]],
      ['message','הודעת כוח %1','js','כוח מיוחד הופעל עבור','{{TEXT}}',[['field_input','TEXT','כוח על נדלק עבור']]],
      ['used','אחרי שימוש הכוח %1','js','powerReady = false;','powerReady = {{VAL}};',[['field_dropdown','VAL',[['נגמר','false'],['נשאר פעיל','true']]]]],
      ['color','צבע כוח פעיל %1','css','#dcfce7','{{COLOR}}',[['field_dropdown','COLOR',[['ירוק','#bbf7d0'],['כחול','#bfdbfe'],['צהוב','#fef08a']]]]]
    ]},
    11: { title:'בחרו הרפתקה — אפליקציית מסכים', concept:'מסכים · showScreen · choices · navigation', blocks:[
      ['intro','הוראות פתיחה %1','html','מצאתם שתי דלתות. איזו דלת תפתחו?','{{TEXT}}',[['field_input','TEXT','בחרו דלת והתחילו הרפתקה']]],
      ['red_door','שם דלת אדומה %1','html','דלת אדומה','{{TEXT}}',[['field_input','TEXT','דלת אש']]],
      ['blue_door','שם דלת כחולה %1','html','דלת כחולה','{{TEXT}}',[['field_input','TEXT','דלת קרח']]],
      ['win_text','סוף ניצחון %1','html','הדרקון צחק ופתח לכם אוצר 🎉','{{TEXT}}',[['field_input','TEXT','הרובוטים רקדו ופתחו לכם שער 🎉']]],
      ['button_color','צבע כפתורים %1','css','#4338ca','{{COLOR}}',[['field_dropdown','COLOR',[['סגול','#4338ca'],['אדום','#be123c'],['ירוק','#15803d']]]]]
    ]},
    12: { title:'מיני־פרויקט משחק — משלבים כמה חוקים', concept:'project · game rules · balancing', blocks:[
      ['name','שם משחק %1','html','משחק הכוכבים שלי','{{TEXT}}',[['field_input','TEXT','משחק הכוכבים המשודרג']]],
      ['target','יעד כוכבים %1','js','const target = 5;','const target = {{N}};',[['field_dropdown','N',[['5','5'],['7','7'],['10','10']]]]],
      ['lives','חיים בהתחלה %1','js','let lives = 3;','let lives = {{N}};',[['field_dropdown','N',[['3','3'],['5','5']]]]],
      ['time','זמן משחק %1','js','let timeLeft = 20;','let timeLeft = {{N}};',[['field_dropdown','N',[['20','20'],['30','30'],['45','45']]]]],
      ['win','הודעת ניצחון %1','js','ניצחת! בנית מיני־משחק 🎉','{{TEXT}}',[['field_input','TEXT','ניצחון מושלם! המשחק שלך עובד 🎉']]],
      ['theme','צבע פרויקט %1','css','#dcfce7','{{COLOR}}',[['field_dropdown','COLOR',[['ירוק','#bbf7d0'],['תכלת','#bae6fd'],['ורוד','#fbcfe8']]]]]
    ]}
  };

	  function addCodeLabReworkSpecs(){
	    const titles = {
      13:['מעבדת הקוד שנוצר — קוראים לפני שכותבים','קריאת קוד שנוצר'],
      14:['HTML דרך בלוקים — מבנה אמיתי בלי פחד','HTML דרך בלוקים'],
      15:['CSS דרך בלוקים — עיצוב אמיתי בהדרגה','CSS דרך בלוקים'],
      16:['JavaScript דרך בלוקים — פעולה אמיתית','JavaScript דרך בלוקים'],
      17:['מספרים במשחק — מאזנים עם בלוקים','מספרים שמשנים משחק'],
      18:['דיבאג בבלוקים — מוצאים שגיאות קטנות','דיבאג דרך בלוקים'],
      19:['כרטיסי HTML — בונים חלקי עמוד','כרטיסי HTML'],
      20:['כרטיסי CSS — משנים עיצוב בכוונה','כרטיסי CSS'],
      21:['כרטיסי JavaScript — משנים תוצאה במסך','כרטיסי JavaScript'],
      22:['סדר קוד — לפני ואחרי חשובים','סדר קוד'],
      23:['חורים בקוד — משלימים דרך בלוקים','השלמת חורים'],
      24:['חוקי משחק — הכנה אחרונה לקוד עצמאי','חוקי משחק']
	    };
	    for(let id=13; id<=24; id++){
	      fullBlockRework[id] = { title: titles[id][0], concept: titles[id][1], blocks: [
	        ['title','כותרת HTML חדשה %1','html',`<h1>${lessons.find(l=>l.id===id).title}</h1>`,`<h1>{{TEXT}}</h1>`,[['field_input','TEXT',titles[id][0]]]],
	        ['intro','משפט הסבר %1','html','<p class="intro">','<p class="intro">{{TEXT}} ',[['field_input','TEXT','אני בודק/ת קוד שנוצר מבלוקים:']]],
	        ['button','טקסט כפתור %1','html','הריצו בדיקה','{{TEXT}}', [['field_input','TEXT','בדקו את הפרויקט']]],
	        ['output','פלט JavaScript %1','js','document.getElementById("output").textContent =','document.getElementById("output").textContent = "{{TEXT}}"; //', [['field_input','TEXT','הבלוק שלי שינה את הפלט']]],
	        ['radius','עיגול כפתור %1','css','border-radius: 999px;','border-radius: {{R}};', [['field_dropdown','R',[['עגול','999px'],['רך','16px'],['מרובע','4px']]]]],
	        ['background','רקע המעבדה %1','css','background: linear-gradient(135deg, #eff6ff, #fff7ed);','background: {{BG}};', [['field_dropdown','BG',[['כחול-כתום','linear-gradient(135deg, #eff6ff, #fff7ed)'],['ורוד-תכלת','linear-gradient(135deg, #fdf2f8, #ecfeff)'],['ירוק בהיר','#dcfce7']]]]]
	      ]};
	    }
	    fullBlockRework[13] = { title: titles[13][0], concept: titles[13][1], blocks: [
	      ['title','מצא/י כותרת HTML %1','html',`<h1>${lessons.find(l=>l.id===13).title}</h1>`,`<h1>{{TEXT}}</h1>`,[['field_input','TEXT','מעבדת הקוד שלי']]],
	      ['button','מצא/י כפתור HTML %1','html','הריצו בדיקה','{{TEXT}}', [['field_input','TEXT','בדקו שינוי']]],
	      ['output','מצא/י שורת פלט JS %1','js','מצאתי את השורה שהבלוק יצר ✅','{{TEXT}}', [['field_input','TEXT','מצאתי קוד שנוצר מבלוק ✅']]],
	      ['radius','מצא/י עיצוב כפתור %1','css','border-radius: 999px;','border-radius: {{R}};', [['field_dropdown','R',[['עגול','999px'],['רך','16px'],['מרובע','4px']]]]],
	      ['background','מצא/י רקע CSS %1','css','background: linear-gradient(135deg, #eff6ff, #fff7ed);','background: {{BG}};', [['field_dropdown','BG',[['כחול-כתום','linear-gradient(135deg, #eff6ff, #fff7ed)'],['ורוד-תכלת','linear-gradient(135deg, #fdf2f8, #ecfeff)'],['ירוק בהיר','#dcfce7']]]]]
	    ]};
	    fullBlockRework[14] = { title: titles[14][0], concept: titles[14][1], blocks: [
	      ['title','כותרת h1 %1','html',`<h1>${lessons.find(l=>l.id===14).title}</h1>`,`<h1>{{TEXT}}</h1>`,[['field_input','TEXT','עמוד HTML שבניתי']]],
	      ['intro','פסקת intro %1','html','<p class="intro">','<p class="intro">{{TEXT}} ',[['field_input','TEXT','HTML מסדר את חלקי העמוד:']]],
	      ['button','כפתור HTML %1','html','הריצו בדיקה','{{TEXT}}', [['field_input','TEXT','בדקו את ה־HTML']]],
	      ['output','אזור פלט id=output %1','html','<p id="output">כאן תופיע התוצאה...</p>','<p id="output">{{TEXT}}</p>', [['field_input','TEXT','כאן רואים פלט מהעמוד']]],
	      ['note','תגית מידע חדשה %1','html','<main class="code-lab">','<main class="code-lab">\\n  <p class="html-note">{{TEXT}}</p>', [['field_input','TEXT','HTML הוא שלד העמוד']]]
	    ]};
	    fullBlockRework[15] = { title: titles[15][0], concept: titles[15][1], blocks: [
	      ['background','רקע body %1','css','background: linear-gradient(135deg, #eff6ff, #fff7ed);','background: {{BG}};', [['field_dropdown','BG',[['כחול-כתום','linear-gradient(135deg, #eff6ff, #fff7ed)'],['ורוד-תכלת','linear-gradient(135deg, #fdf2f8, #ecfeff)'],['ירוק בהיר','#dcfce7']]]]],
	      ['card_radius','עיגול כרטיס %1','css','border-radius: 28px;','border-radius: {{R}};', [['field_dropdown','R',[['עגול','28px'],['רך','16px'],['כמעט מרובע','6px']]]]],
	      ['card_padding','ריווח כרטיס %1','css','padding: 30px;','padding: {{P}};', [['field_dropdown','P',[['רגיל','30px'],['צפוף','18px'],['מרווח','42px']]]]],
	      ['button_color','צבע כפתור %1','css','background: #2563eb;','background: {{COLOR}};', [['field_dropdown','COLOR',[['כחול','#2563eb'],['ירוק','#16a34a'],['סגול','#7c3aed']]]]],
	      ['output_box','רקע תיבת פלט %1','css','background: #f8fafc;','background: {{COLOR}};', [['field_dropdown','COLOR',[['אפור בהיר','#f8fafc'],['צהוב','#fef9c3'],['תכלת','#e0f2fe']]]]]
	    ]};
	  }
  addCodeLabReworkSpecs();

  function makeArgs(args){
    return (args || []).map(([kind,name,value]) => kind === 'field_dropdown'
      ? { type:'field_dropdown', name, options:value }
      : { type:'field_input', name, text:value });
  }
  function makeFullReworkFlow(id, focus){
    return [
      { minutes:'0–8', title:'פתיחה: מה הפרויקט כבר יודע לעשות?', teacher:`בודקים עם הילדים את התוצר ומגדירים את רעיון השיעור: ${focus}.`, students:'מתארים פעולה אחת שהמשתמש עושה ותוצאה אחת שהעמוד מחזיר.' },
      { minutes:'8–18', title:'בלוק ראשון — שינוי אחד ברור', teacher:'מדגימים גרירה וחיבור של בלוק אמיתי מתחת ל“עמוד האתר שלי”.', students:'גוררים בלוק, מריצים, ואומרים מה השתנה.' },
      { minutes:'18–32', title:'בחירה בתוך בלוק', teacher:'משנים שדה/תפריט בתוך הבלוק ומסבירים שערך קטן משנה קוד.', students:'בוחרים טקסט, מספר או אפשרות ורואים תוצאה.' },
      { minutes:'32–46', title:'שני בלוקים עובדים יחד', teacher:'מחברים בלוק נוסף ומדגישים סדר וקשר בין רעיונות.', students:'בודקים מה השתנה לפני/אחרי הבלוק השני.' },
      { minutes:'46–60', title:'ניסוי משתמש אמיתי', teacher:'מבקשים לנסות מקרה שונה: תשובה אחרת, לחיצה נוספת, שם אחר או מספר אחר.', students:'בודקים ולא מנחשים — התצוגה צריכה להוכיח.' },
      { minutes:'60–72', title:'דיבאג דרך בלוקים', teacher:'מראים איך שם id/function/variable חייב להישאר תואם, בלי לכתוב קוד חופשי.', students:'מחפשים שורה קשורה בהצצה לקוד.' },
      { minutes:'72–84', title:'הצצה לקוד שנוצר', teacher:'בוחרים בלוק מחובר ומראים את השורה שנוצרה ב־HTML/CSS/JS.', students:'אומרים: “הבלוק הזה יצר/שינה את...”' },
      { minutes:'84–90', title:'סיכום לקראת שיעור 25', teacher:'מחברים בין בלוקים להבנת קוד: עוד לא כותבים לבד, אבל כבר קוראים קוד.', students:'משתפים דבר אחד שהם מבינים בקוד שנוצר.' }
    ];
  }
  function blockEditInstruction(block){
    const args = block.args0 || [];
    const hasInput = args.some(arg => arg.type === 'field_input');
    const hasDropdown = args.some(arg => arg.type === 'field_dropdown');
    if(hasInput && !hasDropdown) return { action:'שנו את הטקסט שבתוך הבלוק לטקסט שמתאים לפרויקט שלכם', feedback:'כמעט. הבלוק מחובר, עכשיו שנו את הטקסט שבתוכו כדי שהשינוי יהיה שלכם.' };
    if(hasDropdown && !hasInput) return { action:'בחרו אפשרות אחרת בתפריט שבתוך הבלוק', feedback:'כמעט. הבלוק מחובר, עכשיו בחרו אפשרות אחרת בתפריט שבתוכו.' };
    if(hasInput && hasDropdown) return { action:'שנו את הטקסט או בחרו אפשרות בתפריט שבתוך הבלוק', feedback:'כמעט. הבלוק מחובר, עכשיו שנו את הטקסט או בחרו אפשרות בתפריט שבתוכו.' };
    return { action:'חברו את הבלוק לשרשרת ובדקו מה השתנה', feedback:'כמעט. הבלוק מחובר, עכשיו בדקו בתצוגה מה השתנה.' };
  }
  function makeFullReworkExercises(lesson, spec){
    const blocks = lesson.blocklyBlocks;
    const practiceBlocks = blocks.slice(0,5);
    const checkFor = block => ({ blockTypes:[block.type], generatedBlockOutputs:[{ type:block.type, target:block.target }], generatedFeedback:'כמעט. הבלוק מחובר, אבל עוד לא רואים את הערך שבחרתם בקוד שנוצר.' });
    return [
      ...practiceBlocks.map((block,i)=>{ const edit = blockEditInstruction(block); return { id:i+1, minutes:`${i*10}–${10+i*10}`, title:`תרגיל ${i+1} — ${block.label}`, prompt:`גררו וחברו את הבלוק “${block.label}”. ${edit.action}, ואז בדקו בתצוגה החיה משמאל מה השתנה.`, hint:block.hint || 'בלוק מחובר משפיע מיד בתצוגה; בלוק חופשי בצד לא משנה את הקוד.', check:{ ...checkFor(block), blockFeedback:`כמעט. גררו וחברו את הבלוק “${block.label}” לשרשרת.`, ...(block.args0?.length ? { changedBlocklyFields:block.args0.map(arg=>({type:block.type, field:arg.name, defaultValue:arg.text ?? arg.options?.[0]?.[1]})), fieldFeedback:edit.feedback } : {}) } }; }),
      { id:6, minutes:'50–64', title:'תרגיל 6 — בודקים בתצוגה, לא בכפתור הרצה', prompt:'שנו טקסט או בחרו אפשרות בתוך אחד הבלוקים שכבר חיברתם וראו שהתצוגה מתעדכנת לבד. הסבירו לעצמכם מה השתנה ולמה.', hint:'בשיעורי Blockly התצוגה מתעדכנת אוטומטית אחרי שינוי בלוק — אין צורך בכפתור הרצה.', check:{ blockTypes:blocks.slice(0,1).map(b=>b.type), anyChangedBlocklyFields:blocks.flatMap(block => (block.args0 || []).map(arg=>({type:block.type, field:arg.name, defaultValue:arg.text ?? arg.options?.[0]?.[1]}))), anyFieldFeedback:'כמעט. שנו טקסט או בחרו אפשרות בתוך לפחות אחד מהבלוקים המחוברים כדי לראות שינוי אמיתי.' } },
      { id:7, minutes:'64–74', title:'תרגיל 7 — משלבים כמה בלוקים', prompt:'השאירו מחוברים לפחות שני בלוקים מהשיעור והסבירו לעצמכם איך הם עובדים יחד. שינוי טוב הוא שינוי שאפשר להסביר, לא רק לעבור בדיקה.', hint:'נסו לחבר בלוק שמשנה תוכן עם בלוק שמשנה חוק, עיצוב או תגובה.', check:{ blockTypes:blocks.slice(0, Math.min(2, blocks.length)).map(b=>b.type), generatedBlockOutputs:blocks.slice(0, Math.min(2, blocks.length)).map(b=>({ type:b.type, target:b.target })), blockFeedback:'כמעט. חברו לפחות שני בלוקים מהשיעור כדי לבנות שינוי משולב.', generatedFeedback:'כמעט. שני הבלוקים מחוברים, אבל הקוד שנוצר מהם עדיין לא מופיע בתוצאה.' } },
      { id:8, minutes:'74–84', title:'תרגיל 8 — בלוק הופך לקוד', prompt:'פתחו “לראות קוד שנוצר”, לחצו על הבלוק שמתאים למשימה, וודאו שהשורה שהוא יצר מופיעה בכרטיס המשימה או מסומנת בקוד.', hint:'בחרו את הבלוק שמתאים למשימה מתוך השרשרת המחוברת. אם כבר חיברתם אותו — לחצו עליו שוב אחרי פתיחת הקוד שנוצר.', check:{ blockTypes:blocks.slice(0,2).map(b=>b.type), requiresCodePeek:true, requiresCodeSelectionBlockTypes:blocks.map(b=>b.type), codePeekFeedback:'כמעט. קודם פתחו את “לראות קוד שנוצר”.', codeSelectionFeedback:'כמעט. אחרי פתיחת הקוד שנוצר, לחצו על הבלוק שמתאים למשימה מתוך השרשרת המחוברת.' } }
    ];
  }
  lessons.forEach(lesson => {
    const spec = fullBlockRework[lesson.id];
    if(!spec) return;
    lesson.title = spec.title;
    lesson.concept = spec.concept;
    lesson.mode = `Real Blockly full rework — ${spec.concept}`;
    lesson.progressionStage = 'בלוקים אמיתיים לפני כתיבת קוד עצמאי';
    lesson.realBlocklyBuilder = true;
    lesson.blocklyLessonBuilder = true;
    lesson.bridgeBlocks = [];
    lesson.story = `שיעור שנבנה מחדש לילדים בני 9–10: עובדים בבלוקים אמיתיים, בוחרים ערכים, בודקים בתצוגה, ורק אז מציצים לקוד שנוצר.`;
    lesson.mission = `ללמוד ${spec.concept} דרך בלוקים נגררים ושאלות בדיקה שמכריחות הבנה, לא רק לחיצה.`;
    lesson.outcome = `תוצר עובד שמדגים ${spec.concept}, עם הבנה של הקשר בלוק → קוד → תוצאה.`;
    lesson.lessonFlow = makeFullReworkFlow(lesson.id, spec.concept);
    lesson.blocklyBlocks = spec.blocks.map((b, index) => {
      const [key,message,target,find,replace,args] = b;
      const args0 = makeArgs(args);
      return { type:`lesson_${lesson.id}_${key}`, label:message.replace(/ %1/g,''), message, args0, target, find, replace, highlight:replace, hint:`בלוק ${target.toUpperCase()} שמלמד ${spec.concept}.`, colour: target === 'css' ? 285 : target === 'js' ? 120 : 210 };
    });
    lesson.exercises = makeFullReworkExercises(lesson, spec);
    if(lesson.id === 8){
      const timeBlock = lesson.blocklyBlocks.find(block => block.type === 'lesson_8_time');
      const endBlock = lesson.blocklyBlocks.find(block => block.type === 'lesson_8_end');
      const colorBlock = lesson.blocklyBlocks.find(block => block.type === 'lesson_8_lit_color');
      const timeExercise = lesson.exercises.find(item => item.id === 1);
      if(timeBlock) timeBlock.toolboxFields = { N: '15' };
      if(timeExercise && timeBlock){
        timeExercise.prompt = 'גררו וחברו את הבלוק “זמן התחלה”. בחרו זמן מתוך הרשימה המסודרת מהקטן לגדול, ובדקו שמספר הזמן בתצוגה מתעדכן לפי הבחירה.';
        timeExercise.hint = 'האפשרויות מסודרות 10, 15, 20. מספר הזמן ליד “זמן” צריך להתעדכן לפי הבלוק, לא רק בקוד.';
        timeExercise.check.changedBlocklyFields = [{ type: timeBlock.type, field: 'N', defaultValue: '15' }];
        timeExercise.check.requiresPreviewTimeFromBlockField = { type: timeBlock.type, field: 'N' };
        timeExercise.check.fieldFeedback = 'כמעט. 15 הוא זמן ברירת המחדל — בחרו 10 או 20.';
        timeExercise.check.previewTimeFeedback = 'כמעט. הבלוק מחובר, אבל מספר הזמן בתצוגה עדיין לא תואם לבחירה בבלוק.';
      }
      const windowsBlock = lesson.blocklyBlocks.find(block => block.type === 'lesson_8_windows');
      if(windowsBlock) windowsBlock.toolboxFields = { N: '10' };
      const windowsExercise = lesson.exercises.find(item => item.id === 2);
      if(windowsExercise){
        windowsExercise.title = 'תרגיל 2 — כמה חלונות בעיר?';
        windowsExercise.prompt = 'גררו וחברו את הבלוק “מספר חלונות בעיר”. בחרו מספר חלונות אחר, ובדקו שהעיר מציגה יותר או פחות חלונות.';
        windowsExercise.hint = 'ברירת המחדל היא 10 חלונות. בחרו 5, 15 או 20 כדי לשנות את גודל המשימה.';
        windowsExercise.check = {
          blockTypes: ['lesson_8_windows'],
          changedBlocklyFields: [{ type: 'lesson_8_windows', field: 'N', defaultValue: '10' }],
          generatedBlockOutputs: [{ type: 'lesson_8_windows', target: 'js' }],
          blockFeedback: 'כמעט. חברו את הבלוק “מספר חלונות בעיר” לשרשרת.',
          fieldFeedback: 'כמעט. בחרו מספר אחר מתוך התפריט — 5, 15 או 20.',
          generatedFeedback: 'כמעט. מספר החלונות שבחרתם עוד לא מופיע בקוד שנוצר.'
        };
      }
      const endExercise = lesson.exercises.find(item => item.id === 3);
      if(endExercise && endBlock){
        endExercise.title = 'תרגיל 3 — הודעת סיום אחרי שהזמן נגמר';
        endExercise.prompt = 'גררו וחברו את הבלוק “הודעת סיום”. שנו את טקסט הסיום לטקסט משלכם. אחר כך לחצו התחלה בתצוגה וחכו עד שהטיימר מגיע לאפס כדי לראות את ההודעה מעל מספר החלונות.';
        endExercise.hint = 'הודעת הסיום היא שורה נפרדת. מתחתיה המשחק מציג אוטומטית כמה חלונות הוארו.';
        endExercise.check.requiresPreviewMessageFromBlockOutput = [{ type: endBlock.type }];
        endExercise.check.previewMessageFeedback = 'כמעט. צריך להתחיל את הטיימר בתצוגה ולחכות עד 0 כדי לראות את הודעת הסיום החדשה.';
      }
      const colorExercise = lesson.exercises.find(item => item.id === 5);
      if(colorExercise && colorBlock){
        colorExercise.title = 'תרגיל 5 — צבע החלונות המוארים';
        colorExercise.prompt = 'גררו וחברו את הבלוק “צבע חלון מואר”. בחרו את הצבע שאתם מעדיפים. אחר כך לחצו בתצוגה על הדלקת חלון כדי לראות את הצבע.';
        colorExercise.hint = 'צהוב הוא צבע טוב וברירת מחדל מותרת. אם בחרתם צבע אחר, בדקו אותו על חלון שנדלק.';
        colorExercise.check = {
          blockTypes: [colorBlock.type],
          generatedBlockOutputs: [{ type: colorBlock.type, target: 'css' }],
          requiresPreviewButtonClick: true,
          blockFeedback: 'כמעט. חברו את הבלוק “צבע חלון מואר” לשרשרת.',
          generatedFeedback: 'כמעט. צבע החלון שבחרתם עוד לא מופיע ב־CSS שנוצר.',
          previewClickFeedback: 'כמעט. עכשיו לחצו בתצוגה על “הדליקו חלון” כדי לראות את הצבע בפועל.'
        };
      }
      lesson.exercises = lesson.exercises
        .filter(item => item.id !== 6 && item.id !== 7)
        .map(item => item.id === 8 ? { ...item, id: 6, minutes: '50–62', title: item.title.replace('תרגיל 8', 'תרגיל 6'), check: { ...item.check, requiresCodeSelectionTab: 'js', requiresCodeSelectionBlockTypes: ['lesson_8_time', 'lesson_8_end'], codeSelectionFeedback: 'כמעט. פתחו את הקוד שנוצר ולחצו על בלוק JavaScript של זמן או הודעת סיום כדי לסמן את השורה.' } } : item);
    }
    if(lesson.id === 9){
      const livesBlock = lesson.blocklyBlocks.find(block => block.type === 'lesson_9_lives');
      const starBlock = lesson.blocklyBlocks.find(block => block.type === 'lesson_9_star');
      const obstacleBlock = lesson.blocklyBlocks.find(block => block.type === 'lesson_9_obstacle');
      const gameoverBlock = lesson.blocklyBlocks.find(block => block.type === 'lesson_9_gameover');
      const smartSkipBlock = lesson.blocklyBlocks.find(block => block.type === 'lesson_9_smart_skip');
      if(livesBlock) livesBlock.toolboxFields = { N: '3' };
      if(starBlock) starBlock.toolboxFields = { N: '1' };
      if(obstacleBlock) obstacleBlock.toolboxFields = { N: '1' };
      const livesExercise = lesson.exercises.find(item => item.id === 1);
      if(livesExercise && livesBlock){
        livesExercise.title = 'תרגיל 1 — כמה חיים יש לשחקן?';
        livesExercise.prompt = 'גררו וחברו את הבלוק “חיים בהתחלה”. בחרו כמה חיים מתאימים למשחק שלכם, ובדקו שמספר החיים בתצוגה מתאים לבלוק.';
        livesExercise.hint = '3 חיים הוא איזון טוב להרבה משחקים. הבלוק צריך לשלוט גם בהתחלה וגם באיפוס.';
        livesExercise.check = {
          blockTypes: [livesBlock.type],
          generatedBlockOutputs: [{ type: livesBlock.type, target: 'js' }],
          requiresPreviewLivesFromBlockField: { type: livesBlock.type, field: 'N', fallback: 3 },
          blockFeedback: 'כמעט. חברו את הבלוק “חיים בהתחלה” לשרשרת.',
          generatedFeedback: 'כמעט. מספר החיים שבבלוק עוד לא מופיע בקוד שנוצר.',
          previewLivesFeedback: 'כמעט. החיים בתצוגה עדיין לא תואמים לבחירה בבלוק.'
        };
      }
      const starExercise = lesson.exercises.find(item => item.id === 2);
      if(starExercise && starBlock){
        starExercise.title = 'תרגיל 2 — פרס על כוכב';
        starExercise.prompt = 'גררו וחברו את הבלוק “כוכב מוסיף”. בחרו כמה נקודות כוכב שווה, ואז לחצו בתצוגה על הכוכב ⭐ ובדקו שהניקוד עולה לפי הבלוק.';
        starExercise.hint = 'בתחילת המשחק הפריט הוא כוכב. קליק אחד עליו צריך להוסיף בדיוק את מספר הנקודות שבבלוק.';
        starExercise.check = {
          blockTypes: [starBlock.type],
          generatedBlockOutputs: [{ type: starBlock.type, target: 'js' }],
          requiresPreviewScoreFromBlockField: { type: starBlock.type, field: 'N', fallback: 1, clickText: '⭐', mode: 'increase' },
          blockFeedback: 'כמעט. חברו את הבלוק “כוכב מוסיף” לשרשרת.',
          generatedFeedback: 'כמעט. נקודות הכוכב שבבלוק עוד לא מופיעות בקוד שנוצר.',
          previewScoreFeedback: 'כמעט. עכשיו לחצו על הכוכב בתצוגה ובדקו שהניקוד עולה לפי הבלוק.'
        };
      }
      const obstacleExercise = lesson.exercises.find(item => item.id === 3);
      if(obstacleExercise && obstacleBlock){
        obstacleExercise.title = 'תרגיל 3 — מכשול מוריד חיים';
        obstacleExercise.prompt = 'גררו וחברו את הבלוק “מכשול מוריד”. בחרו כמה חיים מכשול מוריד, שחקו עד שמופיע מכשול, ואז לחצו על המכשול ובדקו שהחיים ירדו לפי הבלוק.';
        obstacleExercise.hint = 'זה שיעור סיכון: הבלוק צריך לשנות מה קורה לשחקן שטועה ולוחץ על מכשול.';
        obstacleExercise.check = {
          blockTypes: [obstacleBlock.type],
          generatedBlockOutputs: [{ type: obstacleBlock.type, target: 'js' }],
          requiresPreviewLivesAfterPenalty: { start: { type: 'lesson_9_lives', field: 'N', fallback: 3 }, penalty: { type: obstacleBlock.type, field: 'N', fallback: 1 }, clickText: '🌋' },
          blockFeedback: 'כמעט. חברו את הבלוק “מכשול מוריד” לשרשרת.',
          generatedFeedback: 'כמעט. עונש המכשול שבבלוק עוד לא מופיע בקוד שנוצר.',
          previewLivesFeedback: 'כמעט. שחקו עד שמופיע מכשול, ואז לחצו עליו כדי לראות חיים יורדים.'
        };
      }
      const gameoverExercise = lesson.exercises.find(item => item.id === 4);
      if(gameoverExercise && gameoverBlock){
        gameoverExercise.title = 'תרגיל 4 — הודעת Game Over אמיתית';
        gameoverExercise.prompt = 'גררו וחברו את הבלוק “הודעת Game Over”. אפשר להשאיר את ההודעה כמו שהיא או לכתוב הודעה משלכם. אחר כך שחקו בתצוגה ולחצו על מכשולים עד שנגמרים החיים ורואים את הודעת הסיום.';
        gameoverExercise.hint = 'ההודעה מופיעה רק כש־lives מגיע ל־0. אפשר להשתמש בבלוק מכשול שמוריד 3 כדי לבדוק מהר.';
        gameoverExercise.check = {
          blockTypes: [gameoverBlock.type],
          generatedBlockOutputs: [{ type: gameoverBlock.type, target: 'js' }],
          requiresPreviewMessageFromBlockOutput: [{ type: gameoverBlock.type }],
          requiresPreviewCardClass: 'game-over',
          blockFeedback: 'כמעט. גררו וחברו את הבלוק “הודעת Game Over” לשרשרת.',
          generatedFeedback: 'כמעט. הודעת הסיום מהבלוק עוד לא מופיעה בקוד שנוצר.',
          previewMessageFeedback: 'כמעט. שחקו עד Game Over כדי לראות את הודעת הסיום מהבלוק.',
          previewClassFeedback: 'כמעט. הבלוק מחובר, אבל צריך להגיע למצב Game Over בתצוגה.'
        };
      }
      const skipExercise = lesson.exercises.find(item => item.id === 5);
      if(skipExercise && smartSkipBlock){
        skipExercise.title = 'תרגיל 5 — דילוג הוא פעולה במשחק';
        skipExercise.prompt = 'גררו וחברו את הבלוק “דילוג חכם אומר”. אפשר להשאיר את המשפט כמו שהוא או לכתוב משפט משלכם. שחקו עד שמופיע מכשול, ואז לחצו “דלגו” ובדקו שהמשחק נותן משוב טוב על החלטה נכונה.';
        skipExercise.hint = 'בשיעור הזה השחקן לא תמיד צריך ללחוץ. לפעמים הפעולה הנכונה היא לדלג על סכנה.';
        skipExercise.check = {
          blockTypes: [smartSkipBlock.type],
          nonEmptyBlocklyFields: [{ type: smartSkipBlock.type, field: 'TEXT' }],
          generatedBlockOutputs: [{ type: smartSkipBlock.type, target: 'js' }],
          requiresPreviewButtonText: 'דלגו',
          requiresPreviewMessageFromBlockOutput: [{ type: smartSkipBlock.type }],
          blockFeedback: 'כמעט. חברו את הבלוק “דילוג חכם אומר” לשרשרת.',
          emptyFeedback: 'כמעט. הודעת הדילוג לא יכולה להיות ריקה.',
          generatedFeedback: 'כמעט. הודעת הדילוג מהבלוק עוד לא מופיעה בקוד שנוצר.',
          previewClickFeedback: 'כמעט. שחקו עד שמופיע מכשול, ואז לחצו “דלגו”.',
          previewMessageFeedback: 'כמעט. אחרי דילוג על מכשול, המשוב צריך לכלול את הודעת הדילוג מהבלוק.'
        };
      }
      lesson.exercises = lesson.exercises
        .filter(item => item.id !== 6 && item.id !== 7)
        .map(item => item.id === 8 ? { ...item, id: 6, minutes: '50–62', title: item.title.replace('תרגיל 8', 'תרגיל 6'), check: { ...item.check, blockTypes: [], requiresCodeSelectionTab: 'js', requiresCodeSelectionBlockTypes: ['lesson_9_lives', 'lesson_9_star', 'lesson_9_obstacle', 'lesson_9_gameover', 'lesson_9_smart_skip'], codeSelectionFeedback: 'כמעט. פתחו את הקוד שנוצר ולחצו על אחד מבלוקי המשחק — חיים, כוכב, מכשול, Game Over או דילוג — כדי לראות את שורת הפעולה ב־JavaScript.' } } : item);
    }
    if(lesson.id === 7){
      const winTextBlock = lesson.blocklyBlocks.find(block => block.type === 'lesson_7_win_text');
      const winTextExercise = lesson.exercises.find(item => item.id === 3);
      if(winTextExercise && winTextBlock){
        winTextExercise.title = 'תרגיל 3 — הודעת ניצחון';
        winTextExercise.prompt = 'גררו וחברו את הבלוק “הודעת ניצחון”. שנו את הטקסט שבתוכו. אחר כך אפו עוגיות עד הניצחון ובדקו שההודעה החדשה מופיעה.';
        winTextExercise.hint = 'ההודעה מופיעה רק כשמגיעים ליעד. לחצו על העוגייה עד שהמגש מלא ואז בדקו.';
        winTextExercise.check.requiresPreviewMessageFromBlockOutput = [{ type: winTextBlock.type }];
        winTextExercise.check.previewMessageFeedback = 'כמעט. הבלוק מחובר, אבל צריך ללחוץ על העוגייה בתצוגה עד שדני מגיע ליעד האפייה ורואים את הודעת הניצחון החדשה.';
      }
      const winColorExercise = lesson.exercises.find(item => item.id === 5);
      if(winColorExercise){
        winColorExercise.title = 'תרגיל 5 — צבע ניצחון אחרי שמנצחים';
        winColorExercise.prompt = 'גררו וחברו את הבלוק “צבע ניצחון”. בחרו צבע אחר. עכשיו אפו עוגיות עד הניצחון ובדקו שהצבע החדש מופיע.';
        winColorExercise.hint = 'צבע הניצחון מופיע רק כשהמגש מלא. לחצו על העוגייה עד סוף האפייה ואז בדקו.';
        winColorExercise.check.requiresPreviewCardClass = 'win';
        winColorExercise.check.previewClassFeedback = 'כמעט. כדי לראות את צבע הניצחון, צריך ללחוץ על העוגייה עד שדני מגיע ליעד האפייה.';
      }
      const balanceExercise = lesson.exercises.find(item => item.id === 6);
      const clickPointsBlock = lesson.blocklyBlocks.find(block => block.type === 'lesson_7_click_points');
      if(balanceExercise && clickPointsBlock){
        balanceExercise.title = 'תרגיל 6 — כמה עוגיות בכל לחיצה?';
        balanceExercise.prompt = 'חברו את הבלוק שמחליט כמה עוגיות ייאפו בכל לחיצה — “כל קליק מוסיף”. בחרו 2 או 3, ואז לחצו פעם אחת על העוגייה בתצוגה. בדקו שהמספר קופץ לפי הערך שבחרתם.';
        balanceExercise.hint = 'חפשו את הבלוק “כל קליק מוסיף”. הוא מחליט כמה עוגיות דני אופה בכל לחיצה. אם בחרתם 3, קליק אחד צריך להוסיף 3 עוגיות.';
        balanceExercise.check = {
          blockTypes: [clickPointsBlock.type],
          changedBlocklyFields: [{ type: clickPointsBlock.type, field: 'N', defaultValue: '1' }],
          generatedBlockOutputs: [{ type: clickPointsBlock.type, target: 'js' }],
          requiresPreviewScoreFromBlockField: { type: clickPointsBlock.type, field: 'N' },
          blockFeedback: 'כמעט. חברו לשרשרת את הבלוק שמחליט כמה עוגיות ייאפו בכל לחיצה — “כל קליק מוסיף”.',
          fieldFeedback: 'כמעט. בחרו 2 או 3 בתוך הבלוק, לא 1.',
          generatedFeedback: 'כמעט. הערך שבחרתם עוד לא מופיע בקוד שנוצר.',
          previewScoreFeedback: 'כמעט. עכשיו לחצו פעם אחת על העוגייה בתצוגה ובדקו שהניקוד קופץ לפי הערך שבחרתם.'
        };
      }
      lesson.exercises = lesson.exercises
        .filter(item => item.id !== 6 && item.id !== 7)
        .map(item => item.id === 8 ? { ...item, id: 6, minutes: '50–62', title: item.title.replace('תרגיל 8', 'תרגיל 6') } : item);
      lesson.exercises.push({
        id: 7,
        minutes: '62–76',
        title: 'תרגיל 7 — כותבים את שורת הניקוד',
        prompt: 'פתחו “לראות קוד שנוצר”, לחצו על הבלוק שמחליט כמה עוגיות ייאפו בכל לחיצה — “כל קליק מוסיף”, ומצאו בשורת JavaScript שלו איזה חלק בקוד מגדיל את הניקוד. הקלידו בתיבה את קטע הקוד שמוסיף לעוגיות בכל לחיצה.',
        hint: 'חפשו בשורה שסומנה את המשתנה של הניקוד ואת סימן החיבור. לא צריך להקליד את כל הפונקציה — רק את קטע ההגדלה מתוך השורה.',
        answerBox: {
          label: 'קטע הקוד שמגדיל ניקוד',
          placeholder: 'הקלידו כאן את קטע ההגדלה',
          note: 'אי אפשר להדביק כאן — מקלידים לבד קטע קצר מתוך שורת ה־JavaScript.'
        },
        check: {
          blockTypes: [clickPointsBlock.type],
          requiresCodePeek: true,
          requiresCodeSelectionTab: 'js',
          requiresCodeSelectionBlockTypes: [clickPointsBlock.type],
          requiresCodeLineAnswer: { tab: 'js', blockTypes: [clickPointsBlock.type], requiredSnippets: ['score = score +'] },
          codePeekFeedback: 'כמעט. קודם פתחו את “לראות קוד שנוצר”.',
          codeSelectionFeedback: 'כמעט. לחצו על הבלוק שמחליט כמה עוגיות ייאפו בכל לחיצה — “כל קליק מוסיף” — כדי לראות את שורת ה־JavaScript שלו.',
          codeLineAnswerFeedback: 'כמעט. כתבו את קטע הקוד שמגדיל את score בעזרת סימן = וסימן +. אפשר לכתוב עם רווחים או בלי רווחים.'
        }
      });
    }
    if(lesson.id === 5){
      const questionBlock = lesson.blocklyBlocks.find(block => block.type === 'lesson_5_question');
      const questionExercise = lesson.exercises.find(item => item.id === 1);
      if(questionExercise && questionBlock){
        questionExercise.prompt = 'גררו וחברו את הבלוק “שאלת חידון”. כתבו בתוכו שאלה שמתאימה לפרויקט שלכם, עם סימן שאלה בסוף, ואז בדקו בתצוגה החיה משמאל מה השתנה.';
        questionExercise.hint = 'שאלה טובה בחידון צריכה להיראות כמו שאלה. אל תשכחו לסיים אותה בסימן שאלה.';
        questionExercise.check.nonEmptyBlocklyFields = [{ type: questionBlock.type, field: 'TEXT' }];
        questionExercise.check.blocklyFieldsContaining = [{ type: questionBlock.type, field: 'TEXT', includes: '?' }];
        questionExercise.check.emptyFeedback = 'כמעט. כתבו שאלה בתוך הבלוק — אי אפשר להשאיר אותה ריקה.';
        questionExercise.check.containsFeedback = 'כמעט. זו צריכה להיות שאלה, אז הוסיפו סימן שאלה בסוף הטקסט.';
      }
      const answerBlock = lesson.blocklyBlocks.find(block => block.type === 'lesson_5_answer');
      const successBlock = lesson.blocklyBlocks.find(block => block.type === 'lesson_5_success');
      const answerExercise = lesson.exercises.find(item => item.id === 2);
      if(answerExercise && answerBlock){
        answerExercise.title = 'תרגיל 2 — תשובה נכונה בטקסט חופשי';
        answerExercise.prompt = 'גררו וחברו את הבלוק “התשובה הנכונה היא”. כתבו בתוכו תשובה נכונה שמתאימה לשאלה שלכם. אחר כך כתבו תשובה כלשהי בתצוגה החיה ולחצו על “בדקו תשובה” כדי לראות מה החידון מחזיר.';
        answerExercise.hint = 'הבלוק משנה את הטקסט שבתוך if. אחרי השינוי חשוב לנסות את החידון בתצוגה החיה — אפשר לכתוב תשובה נכונה או שגויה ולראות את המשוב.';
        answerExercise.check.nonEmptyBlocklyFields = [{ type: answerBlock.type, field: 'TEXT' }];
        answerExercise.check.requiresPreviewButtonClick = true;
        answerExercise.check.requiresPreviewFilledInputs = ['answerInput'];
        answerExercise.check.emptyFeedback = 'כמעט. כתבו תשובה בתוך הבלוק — אי אפשר להשאיר תשובה ריקה.';
        answerExercise.check.fieldFeedback = 'כמעט. הבלוק מחובר, עכשיו כתבו בתוכו תשובה נכונה משלכם במקום ברירת המחדל.';
        answerExercise.check.previewClickFeedback = 'כמעט. עכשיו כתבו תשובה כלשהי בתצוגה החיה ולחצו על “בדקו תשובה”.';
        answerExercise.check.previewInputFeedback = 'כמעט. כתבו תשובה בשדה שבתצוגה החיה לפני הלחיצה.';
        answerExercise.check.generatedFeedback = 'כמעט. התשובה שכתבתם עוד לא נכנסה לתנאי ה־JavaScript שנוצר. ודאו שהבלוק מחובר לשרשרת.';
      }
      const successExercise = lesson.exercises.find(item => item.id === 3);
      const redBackgroundExercise = lesson.exercises.find(item => item.id === 4);
      const buttonExercise = lesson.exercises.find(item => item.id === 5);
      if(successExercise && answerBlock && successBlock){
        successExercise.title = 'תרגיל 3 — הודעות אם נכון / אחרת';
        successExercise.minutes = '20–36';
        successExercise.prompt = 'חברו שני בלוקים: “אם נכון כתוב” ו“אחרת כתוב”. שנו את שתי ההודעות, ואז בדקו בתצוגה החיה פעם אחת תשובה נכונה ופעם אחת תשובה שגויה.';
        successExercise.hint = 'זה תרגיל אחד עם שני מסלולים: if לתשובה נכונה, ו־else לכל תשובה אחרת.';
        successExercise.check.blockTypes = ['lesson_5_success', 'lesson_5_wrong'];
        successExercise.check.generatedBlockOutputs = [
          { type: 'lesson_5_success', target: 'js' },
          { type: 'lesson_5_wrong', target: 'js' }
        ];
        successExercise.check.changedBlocklyFields = [
          { type: 'lesson_5_success', field: 'TEXT', defaultValue: 'נכון! JavaScript מפעיל תגובות ⚡' },
          { type: 'lesson_5_wrong', field: 'TEXT', defaultValue: 'כמעט! רמז: JavaScript היא השפה של הפעולות.' }
        ];
        successExercise.check.requiresPreviewButtonClick = true;
        successExercise.check.requiresPreviewFilledInputs = ['answerInput'];
        delete successExercise.check.requiresPreviewInputMatchesBlockFields;
        delete successExercise.check.requiresPreviewFeedbackClass;
        successExercise.check.blockFeedback = 'כמעט. חברו גם “אם נכון כתוב” וגם “אחרת כתוב”.';
        successExercise.check.fieldFeedback = 'כמעט. שנו את שתי ההודעות — גם הודעת הצלחה וגם הודעת רמז/טעות.';
        successExercise.check.previewClickFeedback = 'כמעט. עכשיו בדקו את החידון בתצוגה החיה בעזרת הכפתור.';
        successExercise.check.previewInputFeedback = 'כמעט. כתבו תשובה בשדה שבתצוגה החיה לפני הלחיצה.';
      }
      if(redBackgroundExercise){
        redBackgroundExercise.id = 4;
        redBackgroundExercise.minutes = '36–46';
        redBackgroundExercise.title = 'תרגיל 4 — תנאי נוסף: בחירת צבע';
        redBackgroundExercise.prompt = 'חברו את הבלוק “אם נבחר צבע ___ שנה רקע ל־___”. בחרו צבע לבדיקה וצבע רקע בתוך הבלוק, בחרו אותו צבע גם בתצוגה החיה, לחצו על “בדקו תשובה”, וראו שהרקע משתנה.';
        redBackgroundExercise.hint = 'זה תנאי נפרד מהתשובה. הוא בודק בחירה אחרת באתר: איזה צבע המשתמש בחר.';
        redBackgroundExercise.check = {
          blockTypes: ['lesson_5_chosen_background'],
          generatedBlockOutputs: [{ type: 'lesson_5_chosen_background', target: 'js' }],
          jsIncludes: ['colorChoice ===', 'document.body.style.background'],
          blockFeedback: 'כמעט. חברו את הבלוק “אם נבחר צבע ___ שנה רקע ל־___”.',
          generatedFeedback: 'כמעט. התנאי של בחירת הצבע עוד לא מופיע בקוד JavaScript שנוצר.'
        };
      }
      if(buttonExercise){
        buttonExercise.id = 5;
        buttonExercise.minutes = '46–54';
        buttonExercise.title = 'תרגיל 5 — צבע כפתור בדיקה';
        buttonExercise.prompt = 'גררו וחברו את הבלוק “צבע כפתור בדיקה”. בחרו אפשרות אחרת בתפריט שבתוך הבלוק, ואז בדקו בתצוגה החיה משמאל מה השתנה.';
        buttonExercise.hint = 'זה שינוי CSS קטן: הכפתור נשאר אותו כפתור, אבל הצבע שלו משתנה.';
        buttonExercise.check = {
          blockTypes: ['lesson_5_button_style'],
          generatedBlockOutputs: [{ type: 'lesson_5_button_style', target: 'css' }],
          changedBlocklyFields: [{ type: 'lesson_5_button_style', field: 'COLOR', defaultValue: '#16a34a' }],
          blockFeedback: 'כמעט. גררו וחברו את הבלוק “צבע כפתור בדיקה”.',
          fieldFeedback: 'כמעט. הבלוק מחובר, עכשיו בחרו צבע אחר בתפריט.',
          generatedFeedback: 'כמעט. צבע הכפתור שבחרתם עוד לא מופיע ב־CSS שנוצר.'
        };
      }
      const debugExercise = lesson.exercises.find(item => item.id === 6);
      if(debugExercise){
        debugExercise.title = 'תרגיל 6 — דיבאג הודעות if/else';
        debugExercise.minutes = '54–66';
        debugExercise.prompt = 'קוד ההתחלה של התרגיל כבר מחובר, אבל יש בו באג: הודעת “נכון” והודעת “אחרת” התחלפו. תקנו את שני הבלוקים כך שתשובה נכונה תציג הודעת הצלחה, ותשובה שגויה תציג רמז.';
        debugExercise.hint = 'אל תגררו בלוקים חדשים. מצאו את הבלוקים “אם נכון כתוב” ו“אחרת כתוב”, והחליפו ביניהם את הטקסטים למקום הנכון.';
        debugExercise.blocklyStarterXml = '<xml xmlns="https://developers.google.com/blockly/xml"><block type="page_start" x="130" y="70"><next><block type="lesson_5_question"><field name="TEXT">איזו שפה גורמת לכפתור להגיב?</field><next><block type="lesson_5_answer"><field name="TEXT">JavaScript</field><next><block type="lesson_5_success"><field name="TEXT">כמעט! רמז: JavaScript היא השפה של הפעולות.</field><next><block type="lesson_5_wrong"><field name="TEXT">נכון! JavaScript מפעיל תגובות ⚡</field><next><block type="lesson_5_button_style"><field name="COLOR">#2563eb</field></block></next></block></next></block></next></block></next></block></next></block></xml>';
        debugExercise.check = {
          blockTypes: ['lesson_5_question', 'lesson_5_answer', 'lesson_5_success', 'lesson_5_wrong'],
          exactBlockTypeCounts: { lesson_5_success: 1, lesson_5_wrong: 1 },
          exactBlocklyFields: [
            { type: 'lesson_5_success', field: 'TEXT', value: 'נכון! JavaScript מפעיל תגובות ⚡' },
            { type: 'lesson_5_wrong', field: 'TEXT', value: 'כמעט! רמז: JavaScript היא השפה של הפעולות.' }
          ],
          generatedBlockOutputs: [
            { type: 'lesson_5_success', target: 'js' },
            { type: 'lesson_5_wrong', target: 'js' }
          ],
          blockFeedback: 'כמעט. השתמשו בבלוקים שכבר מחוברים בקוד ההתחלה של התרגיל.',
          countFeedback: 'כמעט. אל תוסיפו בלוקי הודעה חדשים — צריך לתקן את שני הבלוקים שכבר מחוברים.',
          exactFieldFeedback: 'כמעט. ההודעות עדיין הפוכות: “אם נכון כתוב” צריך להיות הודעת הצלחה, ו“אחרת כתוב” צריך להיות רמז.',
          generatedFeedback: 'כמעט. התיקון עוד לא מופיע בקוד JavaScript שנוצר.'
        };
      }
      lesson.exercises = lesson.exercises.filter(exercise => exercise.id !== 7 && exercise.id !== 8);
      lesson.exercises.push({
        id: 7,
        minutes: '66–78',
        title: 'תרגיל 7 — כותבים קטע קוד קצר',
        prompt: 'פתחו “לראות קוד שנוצר”. לחצו על הבלוק “התשובה הנכונה היא”. בכרטיס המשימה תופיע שורת קוד שמתחילה ב־if. מתוך השורה הזו הקלידו בתיבה רק את קטע ההשוואה הקצר: answer ===. אפשר גם בלי רווחים: answer===',
        hint: 'לא צריך להקליד את כל שורת ה־if. חפשו בשורה שסומנה את החלק שבודק את התשובה, והקלידו רק: answer ===. גם answer=== מתקבל.',
        answerBox: {
          label: 'קטע הקוד שכתבתי',
          placeholder: 'answer ===',
          note: 'אין הדבקה כאן — מקלידים לבד קטע קצר מהתנאי כדי להתרגל לכתיבת JavaScript.'
        },
        check: {
          blockTypes: ['lesson_5_answer'],
          requiresCodePeek: true,
          requiresCodeSelectionTab: 'js',
          requiresCodeSelectionBlockTypes: ['lesson_5_answer'],
          requiresCodeLineAnswer: { tab: 'js', blockTypes: ['lesson_5_answer'], requiredSnippets: ['answer ==='] },
          codePeekFeedback: 'כמעט. קודם פתחו את “לראות קוד שנוצר”.',
          codeSelectionFeedback: 'כמעט. לחצו על הבלוק “התשובה הנכונה היא” כדי למצוא את שורת התנאי.',
          codeLineAnswerFeedback: 'כמעט. הקלידו רק את קטע ההשוואה הקצר: answer === או answer==='
        }
      });
    }
    if(lesson.id === 6){
      const startScoreBlock = lesson.blocklyBlocks.find(block => block.type === 'lesson_6_start_score');
      const plusBlock = lesson.blocklyBlocks.find(block => block.type === 'lesson_6_plus');
      const scoreLabelBlock = lesson.blocklyBlocks.find(block => block.type === 'lesson_6_score_label');
      const startScoreExercise = lesson.exercises.find(item => item.id === 1);
      const plusExercise = lesson.exercises.find(item => item.id === 2);
      const scoreLabelExercise = lesson.exercises.find(item => item.id === 4);
      if(startScoreExercise && startScoreBlock){
        startScoreExercise.prompt = 'הבלוק “ניקוד התחלתי” כבר מחובר בקוד ההתחלה. בחרו בתפריט שבתוכו ערך אחר מ־0, ואז בדקו שהתוצאה מתחילה מהניקוד שבחרתם.';
        startScoreExercise.hint = 'בתרגיל הזה לא צריך לגרור בלוק חדש. רק לשנות את הערך בתוך הבלוק שכבר מחובר מתחת ל“עמוד האתר שלי”.';
        startScoreExercise.blocklyStarterXml = '<xml xmlns="https://developers.google.com/blockly/xml"><block type="page_start" x="130" y="70"><next><block type="lesson_6_start_score"><field name="N">0</field></block></next></block></xml>';
        startScoreExercise.check.blockFeedback = 'כמעט. הבלוק “ניקוד התחלתי” אמור להיות מחובר בקוד ההתחלה. לחצו “קוד התחלה”/איפוס לתרגיל ואז שנו את הערך שבתוכו.';
        startScoreExercise.check.fieldFeedback = 'כמעט. הבלוק מחובר, אבל הוא עדיין על 0. בחרו בתפריט ערך התחלתי אחר.';
        startScoreExercise.check.generatedFeedback = 'כמעט. הניקוד ההתחלתי שבחרתם עוד לא מופיע בקוד. ודאו שאתם משנים את הבלוק המחובר, לא בלוק חדש בצד.';
      }
      if(plusExercise && plusBlock){
        plusExercise.prompt = 'גררו וחברו את הבלוק “תשובה נכונה מוסיפה”. בחרו אפשרות אחרת בתפריט שבתוך הבלוק, ואז בדקו בתצוגה החיה משמאל מה השתנה.';
        plusExercise.hint = 'הבלוק הזה קובע כמה נקודות מקבלים על תשובה נכונה.';
        delete plusExercise.check.orderedBlockTypes;
        plusExercise.check.blockFeedback = 'כמעט. גררו וחברו את הבלוק “תשובה נכונה מוסיפה” לשרשרת.';
        delete plusExercise.check.orderFeedback;
        plusExercise.check.fieldFeedback = 'כמעט. הבלוק מחובר, עכשיו בחרו אפשרות אחרת בתפריט שבתוכו.';
      }
      if(scoreLabelExercise && scoreLabelBlock && startScoreBlock){
        scoreLabelExercise.prompt = 'גררו וחברו את הבלוק “כותרת ניקוד” מעל הבלוק “ניקוד התחלתי” שכבר מחובר בקוד ההתחלה. אחר כך שנו את הטקסט שבתוך הבלוק לטקסט שמתאים לפרויקט שלכם.';
        scoreLabelExercise.hint = 'הבלוק הזה משנה את הכותרת שמופיעה ליד המספר. שימו אותו מעל “ניקוד התחלתי” כדי שהשרשרת תתחיל בתווית הניקוד ואז בערך ההתחלתי.';
        scoreLabelExercise.check.orderedBlockTypes = [scoreLabelBlock.type, startScoreBlock.type];
        scoreLabelExercise.check.blockFeedback = 'כמעט. גררו את “כותרת ניקוד” וחברו אותו לשרשרת מעל הבלוק “ניקוד התחלתי”.';
        scoreLabelExercise.check.orderFeedback = 'כמעט. הבלוק מחובר, אבל בתרגיל הזה הוא צריך להיות מעל “ניקוד התחלתי”, לא מתחתיו.';
        scoreLabelExercise.check.fieldFeedback = 'כמעט. הבלוק במקום הנכון — עכשיו שנו את הטקסט שבתוכו.';
      }
      lesson.exercises = lesson.exercises
        .filter(item => item.id !== 6 && item.id !== 7)
        .map(item => item.id === 8 ? { ...item, id: 6, minutes: '50–62', title: item.title.replace('תרגיל 8', 'תרגיל 6') } : item);
    }
    if(lesson.id === 4){
      const byId = id => lesson.exercises.find(item => item.id === id);
      const sentenceBlock = lesson.blocklyBlocks.find(block => block.type === 'lesson_4_sentence');
      const endingBlock = lesson.blocklyBlocks.find(block => block.type === 'lesson_4_result_word');
      const sentenceExercise = byId(4);
      if(sentenceExercise && sentenceBlock){
        sentenceExercise.prompt += ' אחר כך כתבו שם ונושא בתצוגה החיה, לחצו על כפתור הברכה, ובדקו שפתיחת המשפט שבחרתם מופיעה בתוצאה.';
        sentenceExercise.check.requiresPreviewButtonClick = true;
        sentenceExercise.check.requiresPreviewFilledInputs = ['nameInput', 'hobbyInput'];
        sentenceExercise.check.requiresPreviewResultFromBlockOutput = [{ type:sentenceBlock.type }];
        sentenceExercise.check.previewClickFeedback = 'כמעט. אחרי שינוי בלוק המשפט, כתבו שם ונושא בתצוגה החיה ולחצו על כפתור הברכה.';
        sentenceExercise.check.previewInputFeedback = 'כמעט. מלאו גם שם וגם נושא בתצוגה החיה לפני הלחיצה.';
        sentenceExercise.check.previewResultFeedback = 'כמעט. לחצתם, אבל התוצאה עדיין לא מציגה את פתיחת המשפט מהבלוק.';
      }
      const endingExercise = byId(5);
      if(endingExercise && endingBlock){
        endingExercise.prompt = 'גררו וחברו את הבלוק “אימוג׳י סיום בתוצאה”. בחרו אימוג׳י אחר בתפריט שבתוך הבלוק. אחר כך כתבו שם ונושא בתצוגה החיה, לחצו על כפתור הברכה, ובדקו שהאימוג׳י שבחרתם מופיע בסוף התוצאה.';
        endingExercise.hint = 'הבלוק משנה רק את סוף המשפט שמופיע אחרי הלחיצה. כדי לראות אותו צריך למלא את שני השדות וללחוץ על כפתור הברכה בתצוגה.';
        endingExercise.check.requiresPreviewButtonClick = true;
        endingExercise.check.requiresPreviewFilledInputs = ['nameInput', 'hobbyInput'];
        endingExercise.check.requiresPreviewResultFromBlockOutput = [{ type:endingBlock.type }];
        endingExercise.check.previewClickFeedback = 'כמעט. אחרי בחירת אימוג׳י, כתבו שם ונושא ולחצו על כפתור הברכה בתצוגה החיה.';
        endingExercise.check.previewInputFeedback = 'כמעט. מלאו גם שם וגם נושא בתצוגה החיה לפני הלחיצה.';
        endingExercise.check.previewResultFeedback = 'כמעט. לחצתם, אבל סוף התוצאה עדיין לא מציג את האימוג׳י שבחרתם.';
      }
      const valueExercise = byId(6);
      if(valueExercise){
        valueExercise.title = 'תרגיל 6 — בלי בלוק חדש: איפה קוראים קלט?';
        valueExercise.prompt = 'אל תגררו בלוק חדש בתרגיל הזה. פתחו “לראות קוד שנוצר”, הסתכלו בלשונית JavaScript, ומצאו את שתי השורות עם value שקוראות את nameInput ואת hobbyInput.';
        valueExercise.hint = 'value הוא מה שהמשתמש כתב בתוך השדה. בשתי השורות האלה הקוד שומר את השם ואת הנושא לפני שהוא בונה את הברכה.';
        delete valueExercise.noCheck;
        valueExercise.check = {
          jsIncludes: ['getElementById("nameInput").value', 'getElementById("hobbyInput").value'],
          requiresCodePeek: true,
          codePeekFeedback: 'כמעט. פתחו את “לראות קוד שנוצר” וחפשו את value בלשונית JavaScript.'
        };
      }
      lesson.exercises = lesson.exercises.filter(exercise => exercise.id <= 6);
      lesson.exercises.push({
        id: 7,
        minutes: '70–84',
        optional: true,
        title: 'תרגיל 7 — אתגר רשות: תיקון מדויק',
        prompt: 'אתגר רשות: בקוד ההתחלתי של האתגר יש בלוק אחד שכבר מחובר. תקנו אותו כך שהברכה שמופיעה אחרי הלחיצה תסתיים בדיוק באימוג׳י 🎉. אפשר לבדוק, או לדלג ולסיים את השיעור גם בלי שהבדיקה מאשרת.',
        hint: 'אל תגררו בלוקים חדשים. כל הבלוקים שיוצרים את המחולל כבר מחוברים כאן — מצאו איזה ערך קטן משפיע על סוף הברכה ושנו אותו לערך המדויק.',
        blocklyStarterXml: '<xml xmlns="https://developers.google.com/blockly/xml"><block type="page_start" x="130" y="70"><next><block type="lesson_4_name_label"><field name="TEXT">שם גיבור/ה:</field><next><block type="lesson_4_topic_label"><field name="TEXT">נושא לברכה:</field><next><block type="lesson_4_button_text"><field name="TEXT">צרו ברכה מצחיקה</field><next><block type="lesson_4_sentence"><field name="TEXT">הנה ברכה מצחיקה על</field><next><block type="lesson_4_result_word"><field name="TEXT">🚀</field></block></next></block></next></block></next></block></next></block></xml>',
        check: {
          blockTypes: [endingBlock.type],
          exactBlockTypeCounts: { lesson_4_result_word: 1 },
          exactBlocklyFields: [{ type: endingBlock.type, field: 'TEXT', value: '🎉' }],
          generatedBlockOutputs: [{ type: endingBlock.type, target: 'js' }],
          requiresPreviewButtonClick: true,
          requiresPreviewFilledInputs: ['nameInput', 'hobbyInput'],
          requiresPreviewResultFromBlockOutput: [{ type: endingBlock.type }],
          blockFeedback: 'כמעט. השתמשו בבלוק שכבר מחובר בקוד ההתחלתי של האתגר.',
          countFeedback: 'כמעט. באתגר הזה צריך לעבוד רק עם הבלוק שכבר נמצא בקוד ההתחלתי — לא להוסיף עוד בלוק כזה.',
          exactFieldFeedback: 'כמעט. מצאתם את המקום הנכון, אבל הברכה צריכה להסתיים בדיוק ב־🎉.',
          generatedFeedback: 'כמעט. השינוי עוד לא מופיע בקוד JavaScript שנוצר.',
          previewClickFeedback: 'כמעט. עכשיו כתבו שם ונושא בתצוגה החיה ולחצו על כפתור הברכה.',
          previewInputFeedback: 'כמעט. מלאו גם שם וגם נושא לפני הלחיצה.',
          previewResultFeedback: 'כמעט. אחרי הלחיצה, סוף הברכה צריך להציג 🎉.'
        }
      });
    }
  });

  window.WEBCODE_LESSONS = lessons;
  window.getWebCodeLesson = function (id) {
    const numeric = Number(id) || 1;
    return lessons.find(l => l.id === numeric) || lessons[0];
  };
})();
