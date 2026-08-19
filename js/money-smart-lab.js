const characters = [
  { id:'maya', name:'מאיה', age:15, income:'250 ש״ח בחודש', goal:'טלפון משודרג ב־1,200 ש״ח', challenge:'קניות אימפולסיביות ולחץ חברתי' },
  { id:'ido', name:'עידו', age:16, income:'כ־1,000 ש״ח מעבודה', goal:'רישיון נהיגה', challenge:'מרגיש שאם עבד — מותר להוציא הכול' },
  { id:'noa', name:'נועה', age:15, income:'כסף לפי צורך ובייביסיטר מזדמן', goal:'מחנה קיץ', challenge:'הכנסה לא קבועה וקושי לתכנן' },
  { id:'adam', name:'אדם', age:16, income:'400 ש״ח, מתוכם 100 ש״ח לעזרה בבית', goal:'מחשב ללימודים וגיימינג', challenge:'מטרה יקרה לצד אחריות משפחתית' },
  { id:'lior', name:'ליאור', age:15, income:'חיסכון שהצטבר לאורך זמן', goal:'להבין מה עושים עם כסף לטווח ארוך', challenge:'הבטחות לרווח מהיר ומידע חלקי ברשת' }
];

const lessons = [
  { id:1, title:'כסף הוא בחירה', question:'יש לי כסף מוגבל ורצונות רבים. איך מחליטים?', concepts:['הכנסה','הוצאה','תקציב','מחסור','עלות אלטרנטיבית','כרית ביטחון'], teacher:['האם תמיד עדיף לחסוך?','האם בילוי הוא בזבוז?','מה משתנה כשאין הכנסה קבועה?'], steps:[
    { name:'פתיחת מעבדה', type:'lesson1Budget', title:'600 ש״ח לחודש', text:'בנו תקציב פתיחה. המטרה אינה “להיות חסכנים”, אלא להבין מה כל בחירה מקדמת: הנאה עכשיו, יעד חיסכון או גמישות להפתעות.' },
    { name:'מה הייתם עושים?', type:'lesson1Event', title:'אירוע בלתי צפוי', text:'התקציב שבניתם פוגש אירוע מהחיים. בחרו מאיפה לממן אותו וראו מה משתנה בתקציב.' },
    { name:'לומדים דרך גילוי', type:'lesson1Discovery', title:'כסף מוגבל ועלות אלטרנטיבית', text:'גם כשיש כסף, בדרך כלל אין מספיק לכל הדברים שרוצים באותו זמן. לכן כל החלטה כוללת גם ויתור או דחייה.' },
    { name:'מתנסים', type:'lesson1CharacterBudget', title:'התקציב של הדמות', text:'בחרו דמות בצד. עכשיו התקציב כבר אינו 600 קבוע: הוא מבוסס על ההכנסה, האחריות והמטרה של הדמות.' },
    { name:'עצירת מדריך', type:'lesson1TeacherStop', title:'דיון כיתתי: האם יש החלטה אחת נכונה?', text:'נקודת דיון לפני משימת היישום. השוו בין דמויות בלי לחשוף מידע אישי של תלמידים.' },
    { name:'משימת דמות', type:'lesson1CharacterBudget', title:'מפת כסף לדמות', text:'שפרו את תקציב הדמות וכתבו במפורש: מה קידמתי, על מה ויתרתי, וכמה השארתי לבלתי צפוי.' },
    { name:'סיכום ועדכון תוכנית', type:'lesson1Summary', title:'עדכון Money Smart Plan', prompt:'בדקו את הסיכום שנוצר מהפעילות, הוסיפו משפט אישי ושמרו לתוכנית.' }
  ]},
  { id:2, title:'איך גורמים לנו לקנות?', question:'האם אני בוחר לקנות, או שמישהו עיצב את המצב כדי שאקנה?', concepts:['צורך','רצון','FOMO','עלות כוללת','חידוש אוטומטי','דפוס מניפולטיבי'], teacher:['איזה טריק שיווקי עובד עליכם הכי מהר?','מתי מבצע באמת עוזר?','איך נראה כלל המתנה סביר?'], steps:[
    { name:'פתיחת מעבדה', type:'lesson2AdLab', title:'מסך קנייה שמנסה לדחוף אותנו', text:'פתחו מסך קנייה מדומה, סמנו את הטריקים שמנסים לגרום להחלטה מהירה, וראו איך כל רכיב משפיע על שיקול הדעת.' },
    { name:'מה הייתם עושים?', type:'lesson2PressureChoice', title:'לקנות, לבדוק או להמתין?', text:'הפרסומת מרגישה דחופה, אבל לא ברור אם המחיר באמת טוב. בחרו פעולה ותראו מה היא מחזקת או מחלישה.' },
    { name:'לומדים דרך גילוי', type:'lesson2Discovery', title:'למה קשה לעצור?', text:'קנייה דיגיטלית בנויה לפעמים כך שנרגיש פחות את התשלום ויותר את התגמול המיידי. גלו את המנגנונים מאחורי ההחלטה.' },
    { name:'מתנסים', type:'lesson2Sort', title:'צורך, רצון חשוב או רצון רגעי?', text:'גררו או לחצו כדי לסווג מצבי קנייה. אין תמיד תשובה אחת — הנימוק וההקשר חשובים.' },
    { name:'עצירת מדריך', type:'lesson2TeacherStop', title:'דיון: האם מבצע באמת חוסך?', text:'נקודת עצירה כיתתית: לא כל קנייה היא בעיה, ולא כל מבצע הוא חיסכון. מתרגלים שאלות בדיקה בלי שיפוט אישי.' },
    { name:'משימת דמות', type:'lesson2CharacterDecision', title:'המחיר האמיתי לדמות', text:'בחרו דמות, חשבו עלות כוללת של מוצר/מנוי/משלוח, הפעילו עצור–בדוק–בחר, ושמרו החלטה מנומקת.' },
    { name:'סיכום ועדכון תוכנית', type:'lesson2Summary', title:'כרטיס קנייה חכמה', prompt:'נסחו כלל אישי לגבי זמן המתנה, השוואת מחירים, עלויות נסתרות, מנויים או רכישות בתוך משחקים.' }
  ]},
  { id:3, title:'כסף עכשיו מול כסף בעתיד', question:'מה המחיר של שימוש בכסף לפני שיש לי אותו, ומה הרווח האפשרי מדחיית השימוש בו?', concepts:['ריבית','קרן','ריבית דריבית','אשראי','תשלומים','יכולת החזר'], teacher:['מה ההבדל בין “אני יכול לשלם החודש” לבין “אני יכול להתחייב לשנה”?','מתי תשלומים יכולים להיות הגיוניים?'], steps:[
    { name:'פתיחת מעבדה', type:'choice', title:'100 ש״ח היום או 110 ש״ח בעוד שנה?', text:'בחרו לפני ההסבר. אחר כך שאלו את עצמכם: מה יכול להשתנות במהלך השנה?', options:['100 עכשיו','110 בעוד שנה','תלוי במטרה','צריך עוד מידע'], feedback:'זו דילמת ערך הזמן: כסף עכשיו מאפשר שימוש מיידי, כסף בעתיד עשוי לפצות על המתנה ואי־ודאות.' },
    { name:'מה הייתם עושים?', type:'choice', title:'קנייה עכשיו או המתנה?', text:'הדמות רוצה מוצר עכשיו, אבל יכולה לחסוך אליו במשך כמה חודשים.', options:['לקנות עכשיו באשראי','להמתין ולחסוך','לחפש חלופה זולה','לבדוק מחיר כולל ואז להחליט'], feedback:'אשראי אינו רק “אפשר לשלם החודש”; הוא התחייבות להכנסה עתידית.' },
    { name:'לומדים דרך גילוי', type:'cards', title:'ריבית, קרן ומי משלם למי', text:'ריבית היא המחיר שמשלמים או מקבלים על שימוש בכסף לאורך זמן. הקרן היא הסכום המקורי.', cards:['בחיסכון — ייתכן שמקבלים ריבית','בהלוואה — בדרך כלל משלמים ריבית','בתשלומים — בודקים מחיר כולל','במינוס — משתמשים בכסף שאינו שלנו'] },
    { name:'מתנסים', type:'interestCalc', title:'מגדל הזמן: פשוטה מול דריבית', text:'הכניסו סכום, שנים וריבית היפותטית. ההמחשה לימודית בלבד ואינה מבטיחה תשואה.' },
    { name:'עצירת מדריך', type:'cards', title:'דיון: תשלומים אינם מחיר', text:'עצרו לדיון לפני שמחשבים. מה מרגיש זול יותר — 1,000 ש״ח עכשיו או 12×95?', cards:['מה המחיר הכולל?','לכמה חודשים מתחייבים?','מה יקרה אם ההכנסה תרד?','מתי תשלומים יכולים להיות הגיוניים?'] },
    { name:'משימת דמות', type:'installments', title:'בדיקת אשראי ותשלומים', text:'חשבו מחיר כולל ופער מול תשלום אחד. לאחר מכן כתבו אילו שאלות הדמות חייבת לשאול לפני התחייבות.' },
    { name:'סיכום ועדכון תוכנית', type:'exit', title:'כרטיס בדיקת אשראי', prompt:'כתבו שתי שאלות שחייבים לבדוק לפני אשראי או תשלום עתידי, ומה יקרה אם ההכנסה של הדמות תרד.' }
  ]},
  { id:4, title:'איך כסף נשמר, גדל ומשמש אחרים?', question:'מה באמת קורה לכסף כאשר חוסכים או משקיעים אותו?', concepts:['חיסכון','השקעה','פיקדון','קופת גמל','איגרת חוב','נזילות','סיכון','תשואה'], teacher:['מדוע השקעה אינה תחליף לכסף שנדרש בקרוב?','מה חשוב יותר: תשואה או זמינות?','למה תשואות עבר אינן הבטחה?'], steps:[
    { name:'פתיחת מעבדה', type:'boxes', title:'ארבע קופסאות לכסף', text:'קבלו 5,000 ש״ח דמיוניים והתאימו מטרות לטווח קצר, בינוני וארוך: טיול, מחשב, לימודים ומטרה עתידית.' },
    { name:'מה הייתם עושים?', type:'choice', title:'טיול עוד חודשיים או לימודים עוד שנים?', text:'בחרו היכן לשים כסף לפי מטרה וזמן.', options:['כסף זמין לטיול קרוב','פיקדון למטרה בעוד שנה','חיסכון מנוהל לטווח ארוך','להשקיע גם כסף שצריך בקרוב'], feedback:'השאלה הראשונה אינה “מה מרוויח הכי הרבה”, אלא מתי צריך את הכסף וכמה חשוב שיהיה זמין.' },
    { name:'לומדים דרך גילוי', type:'cards', title:'חיסכון, השקעה ונזילות', text:'חיסכון מדגיש שמירה וזמינות. השקעה מחפשת תשואה אפשרית, לצד אפשרות שהערך ירד.', cards:['כסף לטיול בקרוב צריך זמינות','פיקדון עשוי לנעול כסף','קופת גמל מנוהלת לפי מסלול','איגרת חוב היא הלוואה למנפיק'] },
    { name:'מתנסים', type:'table', title:'השוואת אפיקים', text:'השוו כסף זמין, פיקדון, קופת גמל ואיגרת חוב לפי טווח, נזילות, שינוי ערך וסיכון מרכזי.' },
    { name:'עצירת מדריך', type:'cards', title:'דיון: תשואה, סיכון ופיזור', text:'זהו מפגש רגיש מקצועית. לא ממליצים על מוצר, חברה או מסלול.', cards:['מהי המטרה?','לכמה זמן הכסף יכול להישאר?','כמה חשובה נזילות?','כמה אי־ודאות אפשר לשאת?'] },
    { name:'משימת דמות', type:'riskGraph', title:'סיכון ותנודתיות', text:'שנו טווח זמן וראו המחשה של תנודתיות. זו המחשה לימודית בלבד, לא תחזית ולא המלצה.' },
    { name:'סיכום ועדכון תוכנית', type:'exit', title:'מפת המטרות והזמן', prompt:'כתבו מטרה קצרה, בינונית וארוכה, מה רמת הנזילות הדרושה לכל אחת ואילו שאלות צריך לבדוק לפני בחירת אפיק.' }
  ]},
  { id:5, title:'כסף דיגיטלי, הונאות ותוכנית מסכמת', question:'איך שומרים גם על הכסף וגם על שיקול הדעת בעולם דיגיטלי?', concepts:['ארנק דיגיטלי','פישינג','אימות','ספקולציה','הימור','מקור מידע'], teacher:['למה שאלה בצ׳אט אינה אימות מספיק?','איך מזהים לחץ זמן?','האם רווח מקרי מוכיח החלטה טובה?'], steps:[
    { name:'פתיחת מעבדה', type:'scamChat', title:'הודעה מחבר', text:'“נתקעתי בלי הטלפון. תעביר לי עכשיו 180 ש״ח. דחוף.” בחרו תגובה לפני שלומדים את סימני האזהרה.' },
    { name:'מה הייתם עושים?', type:'choice', title:'ארבע פעולות', text:'קישור מבטיח פרס ומבקש קוד אימות.', options:['לפעול מיד','לבדוק מקור','להתייעץ עם מבוגר','להימנע ולא למסור קוד'], feedback:'בקשת קוד אימות היא סימן אזהרה חזק. לא מוסרים קוד, בודקים מקור ומתייעצים במקרה ספק.' },
    { name:'לומדים דרך גילוי', type:'cards', title:'כסף דיגיטלי וסימני אזהרה', text:'העברה דיגיטלית קלה ומהירה, אבל היא פעולה פיננסית אמיתית.', cards:['לחץ לפעול מיד','בקשת קוד אימות','קישור לא מוכר','הבטחה לרווח גבוה ללא סיכון'] },
    { name:'מתנסים', type:'sort', title:'השקעה, ספקולציה או הימור?', items:['פיקדון למטרה קרובה','סרטון שמבטיח פי 3 בקריפטו','כרטיס גירוד','תיק מפוזר לטווח ארוך','קבוצה שלוחצת להיכנס עכשיו'] },
    { name:'עצירת מדריך', type:'cards', title:'דיון: החלטה טובה מול תוצאה טובה', text:'רווח מקרי אינו הופך החלטה לא מבוססת להחלטה טובה, והפסד זמני לא בהכרח מוכיח החלטה גרועה.', cards:['מי מקור המידע?','האם יש ניגוד עניינים?','האם מוצגים גם הפסדים?','האם ההחלטה מתאימה למטרה?'] },
    { name:'משימת דמות', type:'finalChallenge', title:'חודש בחיי הדמות', text:'קבלו הכנסה, הוצאות, פיתוי, אשראי, בקשה חשודה והצעת השקעה. בחרו תהליך החלטה, לא רק תוצאה.' },
    { name:'סיכום ועדכון תוכנית', type:'exit', title:'Money Smart Plan מסכם', prompt:'כתבו הרגל פיננסי אחד לשיפור, שלושה סימני אזהרה, דרך אימות אחת וכלל אחד לפני העברת כסף.' }
  ]}
];

const conceptInfo = {
  'הכנסה':'כסף שנכנס: דמי כיס, עבודה, מתנה, מכירה או הכנסה חד־פעמית.',
  'הוצאה':'כסף שיוצא. יכולה להיות חוזרת, מזדמנת, צפויה או בלתי צפויה.',
  'תקציב':'תוכנית חלוקה של כסף לפי מטרות והוצאות. בלומדה תקציב 600 הוא תרגול פתיחה, לא הנתונים האישיים של הדמות.',
  'מחסור':'מצב שבו אין מספיק כסף או זמן לכל הרצונות יחד, ולכן צריך לבחור.',
  'עלות אלטרנטיבית':'מה שוויתרנו עליו או דחינו בגלל הבחירה שעשינו.',
  'כרית ביטחון':'סכום קטן שנשאר פנוי להפתעות במקום שכל הכסף יהיה מתוכנן מראש.',
  'צורך':'משהו שנדרש לתפקוד או למטרה חשובה, לפי ההקשר.',
  'רצון':'משהו שרוצים, אך אפשר לדחות, להחליף או לבדוק לפני קנייה.',
  'FOMO':'פחד להחמיץ מבצע, מוצר או טרנד, שיכול לגרום להחלטה מהירה מדי.',
  'עלות כוללת':'המחיר האמיתי כולל משלוח, עמלות, מנויים, חידושים ותשלומים עתידיים.',
  'חידוש אוטומטי':'מנוי שממשיך לחייב גם אחרי ששכחנו ממנו.',
  'דפוס מניפולטיבי':'עיצוב שמנסה לדחוף לפעולה: טיימר, ביטול מוסתר או תיבה מסומנת מראש.',
  'ריבית':'המחיר שמשלמים או מקבלים על שימוש בכסף לאורך זמן.',
  'קרן':'סכום הכסף המקורי שעליו מחשבים ריבית.',
  'ריבית דריבית':'ריבית שנצברת גם על הריבית שכבר נוספה.',
  'אשראי':'שימוש בכסף עכשיו והתחייבות להחזיר בעתיד.',
  'תשלומים':'חלוקת רכישה לתשלומים חודשיים. צריך לבדוק מחיר כולל והתחייבות.',
  'יכולת החזר':'האם אפשר לעמוד בתשלומים לאורך כל התקופה גם אם ההכנסה משתנה.',
  'חיסכון':'שמירת כסף למטרה עתידית, לרוב בדגש על יציבות וזמינות.',
  'השקעה':'הקצאת כסף מתוך ציפייה לתשואה, לצד אפשרות שהערך ירד.',
  'פיקדון':'כסף שמופקד לתקופה ובתנאים מסוימים, ולעיתים צובר ריבית.',
  'קופת גמל':'חיסכון מנוהל במסלול השקעה. הערך יכול לעלות או לרדת ויש דמי ניהול.',
  'איגרת חוב':'הלוואה למדינה או חברה לפי תנאים: ריבית, מועד וסיכון החזר.',
  'נזילות':'כמה מהר אפשר להפוך כסף לזמין בלי הפסד משמעותי.',
  'סיכון':'האפשרות שהתוצאה תהיה שונה מהציפייה, כולל הפסד או עיכוב.',
  'תשואה':'מה שהכסף הרוויח או הפסיד לאורך זמן.',
  'ארנק דיגיטלי':'אמצעי תשלום דיגיטלי. הפעולה קלה, אבל הכסף אמיתי.',
  'פישינג':'ניסיון לגרום למסירת פרטים, סיסמה או קוד באמצעות הודעה שנראית אמינה.',
  'אימות':'בדיקה דרך ערוץ אחר, למשל שיחת טלפון למספר מוכר.',
  'ספקולציה':'ניסיון להרוויח בעיקר משינוי מחיר עתידי ובאי־ודאות גבוהה.',
  'הימור':'העמדת כסף על תוצאה שאינה בשליטת המשתתף.',
  'מקור מידע':'מי אומר את המידע, מה האינטרס שלו, והאם אפשר לאמת אותו.'
};

const state = JSON.parse(localStorage.getItem('moneySmartState') || '{}');
state.lesson ??= 1; state.step ??= 0; state.character ??= 'maya'; state.completed ??= []; state.notes ??= [];
state.meters ??= { 'תכנון':2, 'בדיקה':2, 'גמישות':2, 'סיכון':2, 'נימוק':2 };
state.lesson1 ??= { openingBudget:null, eventChoice:null, characterPlan:null };
state.lesson2 ??= { foundTricks:[], pressureChoice:null, sort:{}, characterDecision:null };
const $ = (id) => document.getElementById(id);
function save(){ localStorage.setItem('moneySmartState', JSON.stringify(state)); }
function lesson(){ return lessons.find(l => l.id === state.lesson); }
function character(){ return characters.find(c => c.id === state.character); }
function addMeters(delta){ Object.entries(delta).forEach(([k,v]) => state.meters[k] = Math.max(0, Math.min(5, (state.meters[k]||0)+v))); save(); renderMeters(); }

function init(){
  $('resetProgressBtn').onclick = () => { if(confirm('לאפס התקדמות מקומית?')){ localStorage.removeItem('moneySmartState'); location.reload(); } };
  $('characterSelect').innerHTML = characters.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  $('characterSelect').value = state.character;
  $('characterSelect').onchange = e => { state.character = e.target.value; save(); renderCharacter(); };
  $('savePlanBtn').onclick = saveNote;
  render();
}
function render(){ renderLesson(); renderCharacter(); renderMeters(); renderNotes(); renderProgress(); }
function renderLesson(){
  const l = lesson();
  document.body.classList.toggle('lesson-one-mode', l.id === 1);
  $('lessonKicker').textContent = `מפגש ${l.id} מתוך 5 · 90 דקות`;
  $('lessonTitle').textContent = l.title;
  $('lessonQuestion').textContent = l.question;
  const currentLessonLabel = $('currentLessonLabel');
  if (currentLessonLabel) currentLessonLabel.textContent = `מפגש ${l.id}: ${l.title}`;
  $('conceptChips').innerHTML = l.concepts.map(c => `<button type="button" data-concept="${c}">${c}</button>`).join('') + '<div id="conceptDefinition" class="concept-definition">לחצו על מושג כדי לראות הסבר קצר ודוגמה לתפקיד שלו בפעילות.</div>';
  document.querySelectorAll('[data-concept]').forEach(btn => btn.onclick = () => {
    document.querySelectorAll('[data-concept]').forEach(x => x.classList.remove('active'));
    btn.classList.add('active');
    $('conceptDefinition').textContent = conceptInfo[btn.dataset.concept] || 'מושג מרכזי לשיעור הזה.';
  });
  $('stepTabs').innerHTML = l.steps.map((s,i)=>`<button type="button" class="${i===state.step?'active':''}" data-step="${i}"><span class="step-number">${i+1}</span><b>${s.name}</b><small>${s.title}</small></button>`).join('');
  document.querySelectorAll('[data-step]').forEach(btn => btn.onclick = () => { state.step = Number(btn.dataset.step); save(); renderLesson(); });
  renderStep(l.steps[state.step]); renderTeacher();
}
function renderTeacher(){
  const l = lesson();
  $('teacherFocus').textContent = l.teacher.join(' · ');
  const link = $('currentLessonSlides');
  if (link) {
    link.href = `money-smart-lesson-${l.id}-slides.html`;
    link.textContent = `פתח מצגת מפגש ${l.id}`;
  }
}
function renderProgress(){
  const count = new Set(state.completed).size;
  const overall = $('overallProgress');
  const label = $('progressLabel');
  if (overall) overall.style.width = `${count/5*100}%`;
  if (label) label.textContent = `${count} מתוך 5 מפגשים`;
}
function renderCharacter(){
  const c = character();
  $('characterCard').innerHTML = `<b>${c.name}, ${c.age}</b><span>הכנסה: ${c.income}</span><span>מטרה: ${c.goal}</span><span>אתגר: ${c.challenge}</span>`;
}
function renderMeters(){
  $('smartMeters').innerHTML = Object.entries(state.meters).map(([k,v]) => `<div class="smart-meter"><span>${k}</span><div class="bar"><span style="width:${v*20}%"></span></div><b>${v}/5</b></div>`).join('');
}
function saveNote(){
  const text = $('planNote').value.trim(); if(!text) return;
  state.notes.unshift({ lesson: state.lesson, character: character().name, text, date: new Date().toLocaleString('he-IL') });
  if(!state.completed.includes(state.lesson)) state.completed.push(state.lesson);
  addMeters({ 'נימוק':1, 'תכנון':1 });
  $('planNote').value=''; save(); renderNotes(); renderProgress();
}
function renderNotes(){
  $('savedNotes').innerHTML = state.notes.slice(0,6).map(n => `<article><b>מפגש ${n.lesson} · ${n.character}</b><p>${n.text}</p><small>${n.date}</small></article>`).join('');
}
function renderStep(step){
  const html = {
    lesson1Budget: lesson1BudgetStep,
    lesson1Event: lesson1EventStep,
    lesson1Discovery: lesson1DiscoveryStep,
    lesson1TeacherStop: lesson1TeacherStopStep,
    lesson1CharacterBudget: lesson1CharacterBudgetStep,
    lesson1Summary: lesson1SummaryStep,
    lesson2AdLab: lesson2AdLabStep,
    lesson2PressureChoice: lesson2PressureChoiceStep,
    lesson2Discovery: lesson2DiscoveryStep,
    lesson2Sort: lesson2SortStep,
    lesson2TeacherStop: lesson2TeacherStopStep,
    lesson2CharacterDecision: lesson2CharacterDecisionStep,
    lesson2Summary: lesson2SummaryStep,
    budget: budgetStep,
    choice: choiceStep,
    cards: cardsStep,
    characterBudget: characterBudgetStep,
    exit: exitStep,
    ad: adStep,
    sort: sortStep,
    shoppingCalc: shoppingCalcStep,
    interestCalc: interestCalcStep,
    installments: installmentsStep,
    boxes: boxesStep,
    table: tableStep,
    riskGraph: riskGraphStep,
    scamChat: scamChatStep,
    finalChallenge: finalChallengeStep
  }[step.type](step);
  $('stepContent').innerHTML = html + lessonStepFooter();
  bindStep(step);
}

function lessonStepFooter(){
  const l = lesson();
  const currentIndex = state.step;
  const hasNextStep = currentIndex < l.steps.length - 1;
  if (hasNextStep) {
    return `<div class="lesson-next-cta"><button type="button" class="btn primary" id="nextStepBtn">לתרגול הבא</button><span>ההתקדמות נשארת בתוך מפגש ${l.id}</span></div>`;
  }
  const nextLesson = lessons.find(item => item.id === l.id + 1);
  if (nextLesson) {
    return `<div class="lesson-next-cta final"><button type="button" class="btn primary" id="nextLessonBtn">שיעור הבא: ${nextLesson.title}</button><span>מופיע רק אחרי שסיימתם את כל תרגולי השיעור.</span></div>`;
  }
  return `<div class="lesson-next-cta final"><a class="btn primary" href="money-smart-course.html">סיום הקורס</a><span>חוזרים לדף הקורס.</span></div>`;
}

function wrap(step, inner){ return `<section class="activity-card"><h2>${step.title}</h2><p>${step.text || ''}</p>${inner}</section>`; }

const lesson1Categories = [
  { key:'fun', label:'בילויים', start:90 },
  { key:'food', label:'אוכל בחוץ', start:80 },
  { key:'shopping', label:'קניות', start:90 },
  { key:'gaming', label:'גיימינג ואפליקציות', start:70 },
  { key:'gifts', label:'מתנות', start:60 },
  { key:'saving', label:'חיסכון למטרה', start:180 },
  { key:'buffer', label:'כרית ביטחון', start:30 }
];
const lesson1Events = [
  { id:'birthday', title:'הוזמנת ליום הולדת', amount:70, hint:'צריך מתנה או השתתפות בבילוי.' },
  { id:'headphones', title:'האוזניות התקלקלו', amount:120, hint:'לא חייבים לקנות את הדגם הכי יקר, אבל צריך פתרון.' },
  { id:'trip', title:'טיול כיתתי לא מתוכנן', amount:90, hint:'הוצאה צפויה להפוך לחשובה כי היא קשורה לכיתה.' },
  { id:'subscription', title:'שכחת לבטל מנוי', amount:30, hint:'הוצאה קטנה שחוזרת ומזכירה למה בודקים מנויים.' }
];
const characterPlans = {
  maya:{ available:250, fixed:0, goalMonthly:100, event:70, required:['רוב ההוצאות הבסיסיות משולמות בבית'], wants:['בגד במבצע','יציאה עם חברות'], categories:[['saving','חיסכון לטלפון',80],['fun','בילויים וחברות',60],['shopping','קניות אונליין',60],['gifts','מתנות',20],['buffer','כרית ביטחון',30]] },
  ido:{ available:1000, fixed:260, goalMonthly:300, event:150, required:['בילויים וחלק מהבגדים באחריותו','מנויים דיגיטליים'], wants:['ציוד גיימינג','יציאות'], categories:[['saving','חיסכון לרישיון',300],['fun','בילויים',180],['shopping','בגדים וציוד',160],['gaming','מנויים וגיימינג',90],['buffer','כרית ביטחון',10]] },
  noa:{ available:320, fixed:40, goalMonthly:140, event:80, required:['הכנסה מבייביסיטר אינה קבועה'], wants:['יציאה עם חברות','ציוד למחנה'], categories:[['saving','חיסכון למחנה קיץ',120],['fun','בילויים',50],['shopping','ציוד אישי',40],['gifts','מתנות',20],['buffer','כרית ביטחון',50]] },
  adam:{ available:300, fixed:0, goalMonthly:170, event:100, required:['100 ש״ח כבר הועברו לעזרה בבית'], wants:['משחק חדש','שדרוג למחשב'], categories:[['saving','חיסכון למחשב',160],['fun','בילויים',40],['gaming','גיימינג',45],['gifts','מתנות',15],['buffer','כרית ביטחון',40]] },
  lior:{ available:500, fixed:0, goalMonthly:300, event:60, required:['כסף לטווח ארוך לא מיועד לכל פיתוי מיידי'], wants:['קורס אונליין','פריט דיגיטלי'], categories:[['saving','שמירה לטווח ארוך',300],['fun','בילויים',50],['shopping','קניות',45],['learning','למידה וכלים',60],['buffer','כרית ביטחון',45]] }
};
function money(n){ return `${Math.round(n)} ₪`; }
function sumValues(obj){ return Object.values(obj || {}).reduce((a,b)=>a + Number(b || 0), 0); }
function lesson1OpeningBudget(){
  if (!state.lesson1.openingBudget) state.lesson1.openingBudget = Object.fromEntries(lesson1Categories.map(c => [c.key, c.start]));
  return state.lesson1.openingBudget;
}
function scoreBudget({ total, target, buffer, eventAmount = 90, hasReason = true }){
  return {
    frame: total === target,
    goal: (target === 600 ? (lesson1OpeningBudget().saving || 0) >= 120 : true),
    buffer: buffer >= eventAmount,
    reason: hasReason
  };
}
function scoreHtml(score){
  const rows = [
    ['עמידה במסגרת', score.frame, 'התקציב מסתכם בדיוק בסכום הזמין'],
    ['התאמה למטרה', score.goal, 'יש כסף שמקדם את היעד ולא רק הוצאות מיידיות'],
    ['גמישות', score.buffer, 'נשארה כרית ביטחון להפתעות'],
    ['נימוק', score.reason, 'ברור על מה ויתרנו או מה דחינו']
  ];
  return `<div class="decision-score">${rows.map(([label,ok,text])=>`<div class="${ok?'ok':'warn'}"><b>${ok?'✓':'!'} ${label}</b><span>${text}</span></div>`).join('')}</div>`;
}
function lesson1BudgetStep(step){
  const budget = lesson1OpeningBudget();
  const icons = { fun:'🎟️', food:'🍕', shopping:'🛍️', gaming:'🎮', gifts:'🎁', saving:'🎯', buffer:'🛟' };
  return wrap(step, `<div class="product-note"><b>מה עושים כאן?</b> מחלקים 600 ש״ח בצורה ויזואלית: אפשר לגרור/ללחוץ על מטבעות מהארנק לקטגוריות, או לכוון בעדינות עם הסליידרים. המטרה היא לראות בחירה, ויתור וכרית ביטחון — לא לענות על שאלון.</div>
  <div class="visual-budget-lab">
    <div class="wallet-tray" aria-label="ארנק מטבעות">
      <b>ארנק התלמידים</b>
      <span id="walletRemaining">600 ₪ לחלוקה</span>
      <div class="coin-palette">
        <button type="button" class="coin" draggable="true" data-coin="10">10</button>
        <button type="button" class="coin" draggable="true" data-coin="50">50</button>
      </div>
      <small>גררו מטבע לקטגוריה, או לחצו מטבע ואז קטגוריה.</small>
    </div>
    <div class="budget-buckets">${lesson1Categories.map(c=>`<article class="budget-bucket" data-budget-bucket="${c.key}"><button type="button" class="bucket-add" aria-label="הוספת מטבע ל${c.label}"><span class="bucket-icon">${icons[c.key]||'₪'}</span><span class="bucket-copy"><b>${c.label}</b><small>לחיצה/גרירה מוסיפה כסף</small></span><em data-bucket-value="${c.key}">${money(budget[c.key])}</em></button><div class="bucket-fill"><i data-bucket-fill="${c.key}"></i></div><input type="range" min="0" max="300" step="10" value="${budget[c.key]}" data-l1-budget="${c.key}"></article>`).join('')}</div>
  </div><div id="budgetTotal" class="budget-total"></div><div id="l1BudgetInsight" class="lesson1-insight"></div><button class="btn primary" id="budgetFeedback">שמירת תקציב פתיחה</button><div id="feedback" class="feedback" hidden></div>`);
}
function lesson1EventStep(step){
  const event = lesson1Events[1];
  const budget = lesson1OpeningBudget();
  return wrap(step, `<div class="event-card"><span>אירוע</span><h3>${event.title}</h3><p>${event.hint}</p><b>עלות משוערת: ${money(event.amount)}</b></div><p>בחרו מאיזו קטגוריה תכסו את האירוע. הבחירה לא “נכונה/לא נכונה”; היא מראה מה נדחה.</p><div class="choice-grid">${lesson1Categories.filter(c=>c.key!=='buffer' || (budget.buffer||0)>0).map(c=>`<button class="choice" data-event-source="${c.key}">${c.label} · כרגע ${money(budget[c.key]||0)}</button>`).join('')}</div><div id="feedback" class="feedback" hidden></div>`);
}
function lesson1DiscoveryStep(step){
  return wrap(step, `<div class="discovery-grid"><article><b>מחסור</b><p>לא חסר רצון — חסר מספיק כסף לכל הרצונות יחד. לכן בוחרים מה עכשיו ומה אחר כך.</p></article><article><b>עלות אלטרנטיבית</b><p>אם הורדתי 120 ש״ח מחיסכון לטלפון, העלות אינה רק האוזניות. העלות היא גם דחייה של היעד.</p></article><article><b>כרית ביטחון</b><p>כרית ביטחון אינה כסף “מבוזבז”. היא אפשרות להתמודד עם שינוי בלי לשבור את כל התוכנית.</p></article></div><div class="choice-grid"><button class="choice" data-card>על מה אפשר לוותר?</button><button class="choice" data-card>מה אפשר לדחות?</button><button class="choice" data-card>מה אי אפשר לדחות?</button><button class="choice" data-card>מה אפשר להחליף בזול יותר?</button></div><div id="feedback" class="feedback" hidden></div>`);
}
function lesson1TeacherStopStep(step){
  return wrap(step, `<div class="teacher-stop"><h3>הנחיית מדריך</h3><p>בקשו מהכיתה להשוות בין שתי דמויות, לא בין תלמידים. הדגישו שהחלטה טובה תלויה במטרה, באחריות ובגמישות.</p></div><div class="choice-grid"><button class="choice" data-card>האם תמיד עדיף לחסוך?</button><button class="choice" data-card>האם בילוי הוא בזבוז?</button><button class="choice" data-card>מה משתנה כשאין הכנסה קבועה?</button><button class="choice" data-card>למה כרית ביטחון יכולה להיות חשובה?</button></div><div id="feedback" class="feedback" hidden></div>`);
}
function currentCharacterPlan(){ return characterPlans[state.character] || characterPlans.maya; }
function lesson1CharacterBudgetStep(step){
  const c = character(); const profile = currentCharacterPlan();
  state.lesson1.characterPlan ??= {};
  state.lesson1.characterPlan[state.character] ??= { values:Object.fromEntries(profile.categories.map(([k,,v])=>[k,v])), reason:'' };
  const plan = state.lesson1.characterPlan[state.character];
  const adjustable = profile.available - profile.fixed;
  return wrap(step, `<div class="character-budget-head"><div><h3>${c.name}: ${c.goal}</h3><p><b>הכנסה חודשית:</b> ${c.income}</p><p><b>סכום לחלוקה אחרי הוצאות קבועות/אחריות:</b> ${money(adjustable)}</p></div><div><b>אירוע אפשרי:</b><br>${money(profile.event)} בלתי צפוי</div></div><div class="profile-list"><b>אחריות ומגבלות:</b> ${profile.required.join(' · ')}<br><b>רצונות:</b> ${profile.wants.join(' · ')}</div><div id="characterBudgetSliders">${profile.categories.map(([key,label])=>`<div class="slider-row"><b>${label}</b><input type="range" min="0" max="${adjustable}" step="10" value="${plan.values[key]||0}" data-character-budget="${key}"><span></span></div>`).join('')}</div><label class="reason-label">מה הוויתור או הדחייה המרכזיים בתקציב הזה?<textarea id="characterReason" rows="3" placeholder="למשל: דחיתי קנייה כדי להשאיר כסף לאירוע לא צפוי">${plan.reason||''}</textarea></label><div id="characterBudgetResult" class="lesson1-insight"></div><button class="btn primary" id="saveCharacterBudget">שמירת מפת כסף לדמות</button><div id="feedback" class="feedback" hidden></div>`);
}
function lesson1SummaryStep(step){
  const c = character(); const profile = currentCharacterPlan(); const plan = state.lesson1.characterPlan?.[state.character];
  const values = plan?.values || {}; const total = sumValues(values); const adjustable = profile.available - profile.fixed;
  const summary = plan ? `דמות: ${c.name}. הכנסה/סכום זמין לתכנון: ${money(adjustable)}. מטרה: ${c.goal}. הוקצה למטרה: ${money(values.saving || 0)}. כרית ביטחון: ${money(values.buffer || 0)}. ויתור/דחייה: ${plan.reason || 'עדיין לא נכתב נימוק'}.` : 'עוד לא נשמרה מפת כסף לדמות. חזרו למסך היישום ושמרו תקציב.';
  return wrap(step, `<div class="summary-box"><h3>סיכום שנוצר מהפעילות</h3><p>${summary}</p><p><b>בדיקת מסגרת:</b> ${total === adjustable ? 'התקציב מסתכם בדיוק בסכום הזמין.' : `חולקו ${money(total)} מתוך ${money(adjustable)}.`}</p></div><textarea id="exitText" rows="4" placeholder="הוסיפו משפט אישי: מה למדתי על בחירה, ויתור או כרית ביטחון?"></textarea><button class="btn primary" id="saveLesson1Summary">שמירה ל־Money Smart Plan</button><div id="feedback" class="feedback" hidden></div>`);
}


const lesson2Tricks = [
  { key:'timer', label:'טיימר לחץ', icon:'⏱️', text:'לחץ זמן מקטין בדיקה וגורם להרגיש שחייבים לפעול עכשיו.' },
  { key:'scarcity', label:'נשארו רק 2', icon:'🔥', text:'מחסור מדומה יוצר FOMO: פחד להחמיץ גם כשלא תכננו לקנות.' },
  { key:'shipping', label:'משלוח חינם מעל 200', icon:'📦', text:'משלוח חינם יכול לדחוף להוסיף מוצר שלא באמת צריך.' },
  { key:'defaultSub', label:'חידוש אוטומטי מסומן', icon:'🔁', text:'תיבה מסומנת מראש יכולה להפוך רכישה חד־פעמית למנוי מתמשך.' },
  { key:'influencer', label:'המלצת משפיען', icon:'📣', text:'אמון באדם אינו מחליף בדיקה: האם זה ממומן? האם המוצר מתאים לי?' }
];
const lesson2SortItems = [
  { id:'shoes', text:'נעליים כשהישנות נהרסו', best:'need', hint:'בהקשר הזה זה כנראה צורך: יש בעיה אמיתית שצריך לפתור.' },
  { id:'skin', text:'סקין במהדורה מוגבלת', best:'impulse', hint:'המילה “מוגבלת” מפעילה FOMO. זה יכול להיות רצון, אבל כדאי להמתין ולבדוק.' },
  { id:'gift', text:'מתנה לחבר קרוב', best:'important', hint:'רצון חשוב יכול להתאים לערכים ולקשרים, כל עוד הוא במסגרת התקציב.' },
  { id:'schoolComputer', text:'מחשב ללימודים', best:'need', hint:'אם הוא נדרש ללימודים זו מטרה חשובה; עדיין בודקים מחיר וחלופות.' },
  { id:'foodDelivery', text:'משלוח אוכל אחרי יום ארוך', best:'important', hint:'לפעמים זה רצון סביר, אבל אם זה חוזר הרבה — העלות הכוללת מצטברת.' },
  { id:'gamingUpgrade', text:'שדרוג בעיקר לגיימינג', best:'impulse', hint:'יכול להיות רצון לגיטימי, אבל לא דחוף. בודקים אם הוא דוחה מטרה אחרת.' }
];
const lesson2CharacterOffers = {
  maya:{ product:'בגד ממותג במבצע', price:139, shipping:29, subscription:0, coins:0, wait:'24 שעות', pressure:'משפיענית אומרת שזה “חובה לקיץ”', goalImpact:'דוחה חיסכון לטלפון בכשבועיים' },
  ido:{ product:'חבילת מטבעות למשחק', price:40, shipping:0, subscription:25, coins:750, wait:'48 שעות', pressure:'סקין מוגבל עד סוף היום', goalImpact:'מקטין כסף פנוי לרישיון וליציאות' },
  noa:{ product:'ציוד למחנה במבצע', price:180, shipping:0, subscription:0, coins:0, wait:'בדיקת מחיר נוספת', pressure:'נשארו רק שניים במלאי', goalImpact:'יכול להתאים למטרה, אם המחיר אמיתי' },
  adam:{ product:'משחק חדש בהשקה', price:260, shipping:0, subscription:0, coins:0, wait:'שבוע', pressure:'כל החברים כבר קנו', goalImpact:'דוחה את המחשב בכחודש' },
  lior:{ product:'קורס אונליין עם חודש ראשון חינם', price:0, shipping:0, subscription:69, coins:0, wait:'קריאת תנאי ביטול', pressure:'ההרשמה נסגרת היום', goalImpact:'עלות שנתית גבוהה אם שוכחים לבטל' }
};
function lesson2AdLabStep(step){
  return wrap(step, `<div class="product-note"><b>מה עושים כאן?</b> לחצו על אזורים במסך הקנייה ונסו לחשוף לפחות 3 טריקים. המטרה אינה “לא לקנות”, אלא לזהות מתי המסך דוחף אותנו להחליט מהר מדי.</div><div class="ad-detective"><div class="shop-screen"><div class="shop-top"><span>🔥 נותרו 2 בלבד</span><b>UrbanPack</b></div><div class="shop-product"><div class="product-visual">🎧</div><div><h3>אוזניות Pro Teen</h3><p>במקום 260 ₪ — היום רק 130 ₪</p></div></div><button type="button" class="shop-hotspot timer" data-trick="timer">06:59 לסיום</button><button type="button" class="shop-hotspot scarcity" data-trick="scarcity">רק 2 במלאי</button><button type="button" class="shop-hotspot shipping" data-trick="shipping">משלוח חינם מעל 200 ₪</button><label class="shop-hotspot default-sub"><input type="checkbox" checked data-trick="defaultSub"> להפעיל חידוש אוטומטי לאחר 30 יום</label><button type="button" class="shop-hotspot influencer" data-trick="influencer">⭐ מומלץ על ידי נועה_סטייל</button></div><div class="trick-board"><h3>טריקים שמצאתם</h3><div id="foundTricks" class="trick-list"></div><div id="feedback" class="feedback" hidden></div></div></div>`);
}
function lesson2PressureChoiceStep(step){
  const options = [
    ['buy','לקנות מיד','מהיר ומרגש, אבל כמעט בלי בדיקה.'],
    ['compare','להשוות מחיר','מחזק בדיקה ומוריד לחץ.'],
    ['wait','לשמור ולבדוק מחר','כלל המתנה עוזר לבדוק אם הרצון נשאר.'],
    ['skip','לוותר כי לא תכננתי לקנות','בחירה טובה אם הקנייה לא קשורה למטרה.']
  ];
  return wrap(step, `<div class="pressure-lab"><div class="pressure-meter"><b>מד לחץ קנייה</b><div><span id="pressureBar"></span></div><em id="pressureLabel">לחץ גבוה</em></div><div class="choice-grid">${options.map(([key,label,desc])=>`<button class="choice" data-pressure-choice="${key}"><b>${label}</b><span>${desc}</span></button>`).join('')}</div><div id="feedback" class="feedback" hidden></div></div>`);
}
function lesson2DiscoveryStep(step){
  return wrap(step, `<div class="discovery-grid lesson2-discovery">${lesson2Tricks.map(t=>`<article><span>${t.icon}</span><h3>${t.label}</h3><p>${t.text}</p></article>`).join('')}</div><div class="summary-box"><h3>מודל עצור–בדוק–בחר</h3><p><b>עצור:</b> מזהים לחץ. <b>בדוק:</b> מחיר אמיתי, חלופה, צורך, מנוי ותנאים. <b>בחר:</b> מחליטים לפי מטרה ולא לפי דחיפה רגעית.</p></div>`);
}
function lesson2SortStep(step){
  return wrap(step, `<div class="sort-lab"><div class="sort-items">${lesson2SortItems.map(item=>`<button type="button" class="sort-token" data-sort-item="${item.id}">${item.text}</button>`).join('')}</div><div class="sort-zones"><button type="button" data-sort-zone="need">צורך</button><button type="button" data-sort-zone="important">רצון חשוב</button><button type="button" data-sort-zone="impulse">רצון רגעי / FOMO</button></div><div id="sortResult" class="summary-box"><h3>בחרו כרטיס ואז קטגוריה</h3><p>אפשר גם ללחוץ על כרטיס ואז על קטגוריה. המשוב יסביר למה ההקשר חשוב.</p></div><div id="feedback" class="feedback" hidden></div></div>`);
}
function lesson2TeacherStopStep(step){
  return wrap(step, `<div class="teacher-stop"><h3>נקודת מדריך — דיון בלי שיפוט</h3><ul><li>האם “50% הנחה” חוסך כסף אם לא תכננתי לקנות?</li><li>מתי רצון הוא רצון חשוב ולא בזבוז?</li><li>מה כלל המתנה סביר לבני נוער: שעה, יום או שבוע?</li><li>איך מדברים על קניות בלי לבייש תלמידים או לחשוף מצב משפחתי?</li></ul><p><b>דגש הנחיה:</b> לא מחנכים נגד קניות. מחנכים בעד בחירה מודעת, בדיקה ונימוק.</p></div>`);
}
function lesson2CharacterDecisionStep(step){
  const c = character(); const offer = lesson2CharacterOffers[c.id] || lesson2CharacterOffers.maya;
  const yearly = offer.subscription ? offer.subscription * 12 : 0;
  const total = offer.price + offer.shipping + yearly;
  return wrap(step, `<div class="character-shopping-head"><div><h3>${c.name} מול הצעת קנייה</h3><p><b>מוצר:</b> ${offer.product}</p><p><b>לחץ:</b> ${offer.pressure}</p><p><b>השפעה על מטרה:</b> ${offer.goalImpact}</p></div><div class="price-stack"><span>מחיר כפתור</span><b>${money(offer.price)}</b><small>עלות כוללת משוערת: ${money(total)}</small></div></div><div class="calculator lesson2-calc"><label>מחיר מוצר<input id="l2Price" type="number" value="${offer.price}"></label><label>משלוח / תוספות<input id="l2Shipping" type="number" value="${offer.shipping}"></label><label>מנוי חודשי<input id="l2Subscription" type="number" value="${offer.subscription}"></label><label>חודשים לבדיקה<input id="l2Months" type="number" value="12"></label><div id="l2CalcResult" class="result-box"></div></div><div class="checklist"><label><input type="checkbox" data-buy-check="price"> בדקתי מחיר במקום נוסף</label><label><input type="checkbox" data-buy-check="wait"> קבעתי זמן המתנה: ${offer.wait}</label><label><input type="checkbox" data-buy-check="goal"> בדקתי מה זה עושה למטרה של הדמות</label><label><input type="checkbox" data-buy-check="subscription"> בדקתי מנוי/חידוש אוטומטי/תנאי ביטול</label></div><label class="reason-label">החלטה מנומקת<textarea id="l2Reason" rows="4" placeholder="האם לקנות, להמתין, לחפש חלופה או לוותר? למה?"></textarea></label><button class="btn primary" id="saveLesson2Decision">שמירת החלטת דמות</button><div id="feedback" class="feedback" hidden></div>`);
}
function lesson2SummaryStep(step){
  const d = state.lesson2.characterDecision; const c = d?.character ? (characters.find(item => item.id === d.character) || character()) : character();
  const summary = d ? `מפגש 2 — ${c.name}: ${d.action}. עלות כוללת משוערת ${money(d.total)}. בדיקות שסומנו: ${d.checked.join(', ') || 'לא סומנו בדיקות'}. נימוק: ${d.reason || 'לא צוין'}.` : 'עוד לא נשמרה החלטת קנייה לדמות. חזרו למשימת הדמות ושמרו החלטה.';
  return wrap(step, `<div class="summary-box"><h3>סיכום שנוצר מהפעילות</h3><p>${summary}</p><p><b>כלל קנייה חכמה:</b> לפני קנייה שמרגישה דחופה — עוצרים, בודקים עלות כוללת, בודקים חלופה, ורק אז בוחרים.</p></div><textarea id="lesson2ExitText" rows="4" placeholder="הוסיפו כלל אישי: מה אני בודק/ת לפני קנייה דיגיטלית או מבצע?"></textarea><button class="btn primary" id="saveLesson2Summary">שמירה ל־Money Smart Plan</button><div id="feedback" class="feedback" hidden></div>`);
}

function budgetStep(step){ const cats=['בילויים','אוכל בחוץ','קניות','גיימינג ואפליקציות','מתנות','חיסכון']; return wrap(step, `<div id="budgetSliders">${cats.map((c,i)=>`<div class="slider-row"><b>${c}</b><input type="range" min="0" max="300" step="10" value="${i===5?100:80}" data-budget><span></span></div>`).join('')}</div><div id="budgetTotal" class="budget-total"></div><button class="btn primary" id="budgetFeedback">קבלו משוב</button><div id="feedback" class="feedback" hidden></div>`); }
function choiceStep(step){ return wrap(step, `<div class="choice-grid">${step.options.map(o=>`<button class="choice" data-choice>${o}</button>`).join('')}</div><div id="feedback" class="feedback" hidden></div>`); }
function cardsStep(step){ return wrap(step, `<div class="choice-grid">${step.cards.map(c=>`<button class="choice" data-card>${c}</button>`).join('')}</div><div id="feedback" class="feedback" hidden>בחרו כרטיס כדי לקבל ניסוח מתאים.</div>`); }
function characterBudgetStep(step){ return wrap(step, `<p><b>${character().name}</b> צריכ/ה לקבל החלטה שמתאימה למטרה: ${character().goal}.</p><div class="choice-grid"><button class="choice" data-smart="balanced">להשאיר כרית ביטחון ולהתקדם למטרה</button><button class="choice" data-smart="goal">להעביר כמעט הכול למטרה</button><button class="choice" data-smart="spend">לקנות עכשיו כי מגיע לי</button><button class="choice" data-smart="check">לבדוק חלופה זולה ולדחות החלטה</button></div><div id="feedback" class="feedback" hidden></div>`); }
function exitStep(step){ return wrap(step, `<p>${step.prompt}</p><textarea id="exitText" rows="4" placeholder="כתבו כאן סיכום קצר..." style="width:100%;border:1px solid var(--line);border-radius:16px;padding:12px;font-family:inherit"></textarea><button class="btn primary" id="exitSave">שמירה ל־Money Smart Plan</button>`); }
function adStep(step){ return wrap(step, `<div class="ad-box"><h3>⏱️ 06:59 · רק שני פריטים נשארו</h3><p>משלוח חינם בקנייה מעל 200 ש״ח. המוצר שבחרת עולה 130 ש״ח.</p></div><div class="choice-grid"><button class="choice" data-choice>לקנות מיד</button><button class="choice" data-choice>לחפש מחיר במקום אחר</button><button class="choice" data-choice>לשמור ולבדוק מחר</button><button class="choice" data-choice>להוסיף מוצר בשביל משלוח חינם</button></div><div id="feedback" class="feedback" hidden></div>`); }
function sortStep(step){ return wrap(step, `<p>לחצו על כל כרטיס ובחרו סיווג. אין תמיד תשובה אחת; הנימוק חשוב.</p><div class="choice-grid">${step.items.map(i=>`<button class="choice" data-sort>${i}</button>`).join('')}</div><div id="feedback" class="feedback" hidden></div>`); }
function shoppingCalcStep(step){ return wrap(step, `<div class="calculator"><label>מטבעות בחבילה<input id="coins" type="number" value="1000"></label><label>מחיר חבילה ₪<input id="coinPrice" type="number" value="40"></label><label>מחיר פריט במטבעות<input id="itemCoins" type="number" value="750"></label><label>מנוי חודשי ₪<input id="sub" type="number" value="29.9"></label><label>חודשים<input id="months" type="number" value="12"></label><label>משלוח ₪<input id="ship" type="number" value="25"></label><div id="calcResult" class="result-box"></div></div>`); }
function interestCalcStep(step){ return wrap(step, `<p class="disclaimer">המחשה לימודית בלבד. תשואה בעולם האמיתי אינה מובטחת ויכולה להשתנות.</p><div class="calculator"><label>סכום התחלתי<input id="principal" type="number" value="1000"></label><label>ריבית שנתית %<input id="rate" type="number" value="5"></label><label>שנים<input id="years" type="number" value="3"></label><label>הפקדה חודשית<input id="monthly" type="number" value="0"></label><div id="interestResult" class="result-box"></div><div id="graph" class="graph"></div></div>`); }
function installmentsStep(step){ return wrap(step, `<div class="calculator"><label>מחיר בתשלום אחד<input id="cashPrice" type="number" value="1000"></label><label>מספר תשלומים<input id="installCount" type="number" value="12"></label><label>תשלום חודשי<input id="installPay" type="number" value="95"></label><div id="installResult" class="result-box"></div></div>`); }
function boxesStep(step){ return wrap(step, `<div class="choice-grid"><button class="choice" data-choice>טיול בעוד 3 חודשים → כסף זמין</button><button class="choice" data-choice>מחשב בעוד שנה → פיקדון/חיסכון</button><button class="choice" data-choice>לימודים בעוד 4 שנים → חיסכון מנוהל</button><button class="choice" data-choice>מטרה לא מוגדרת → לשאול על זמן, נזילות וסיכון</button></div><div id="feedback" class="feedback" hidden></div>`); }
function tableStep(step){ return wrap(step, `<table class="compare-table"><thead><tr><th>אפיק</th><th>טווח</th><th>נזילות</th><th>ערך משתנה?</th><th>סיכון מרכזי</th></tr></thead><tbody><tr><td>כסף זמין</td><td>קצר</td><td>גבוהה</td><td>מעט</td><td>שחיקת כוח קנייה</td></tr><tr><td>פיקדון</td><td>קצר–בינוני</td><td>לפי תנאים</td><td>לרוב מוגבל</td><td>נעילת כסף</td></tr><tr><td>קופת גמל</td><td>בינוני–ארוך</td><td>תלוי מוצר</td><td>כן</td><td>ירידות ודמי ניהול</td></tr><tr><td>איגרת חוב</td><td>לפי מועד</td><td>משתנה</td><td>כן</td><td>אי־החזר ושינוי מחיר</td></tr></tbody></table><p class="disclaimer">המידע נועד ללמידה בלבד ואינו המלצה לבחור אפיק השקעה.</p>`); }
function riskGraphStep(step){ return wrap(step, `<label>טווח זמן בשנים <input id="riskYears" type="range" min="1" max="12" value="4"></label><div id="riskGraph" class="graph"></div><div id="feedback" class="feedback">ככל שהטווח ארוך יותר, יש יותר זמן להתמודד עם תנודתיות — אך אין הבטחה לתוצאה.</div>`); }
function scamChatStep(step){ return wrap(step, `<div class="chat-bubble">${step.text}</div><div class="choice-grid"><button class="choice" data-scam="bad">להעביר מיד</button><button class="choice" data-scam="weak">לשאול בצ׳אט אם זה הוא</button><button class="choice" data-scam="good">להתקשר למספר המוכר</button><button class="choice" data-scam="good">לפנות למבוגר במקרה ספק</button></div><div id="feedback" class="feedback" hidden></div>`); }
function finalChallengeStep(step){ return wrap(step, `<p>בחרו אסטרטגיה לחודש של ${character().name}: יש הכנסה, יעד, פיתוי, הצעת אשראי, בקשה חשודה והצעת השקעה.</p><div class="choice-grid"><button class="choice" data-smart="balanced">בודק/ת מחיר, מקור וסיכון לפני כל החלטה</button><button class="choice" data-smart="spend">זורמ/ת עם ההצעות כדי לא לפספס</button><button class="choice" data-smart="check">מתייעצ/ת ומשווה חלופות</button><button class="choice" data-smart="goal">שומר/ת כסף למטרה אבל בלי כרית ביטחון</button></div><div id="feedback" class="feedback" hidden></div>`); }
function bindStep(step){
  if(step.type==='lesson1Budget') bindLesson1Budget();
  if(step.type==='lesson1Event') bindLesson1Event();
  if(step.type==='lesson1CharacterBudget') bindLesson1CharacterBudget();
  if(step.type==='lesson1Summary') bindLesson1Summary();
  if(step.type==='lesson2AdLab') bindLesson2AdLab();
  if(step.type==='lesson2PressureChoice') bindLesson2PressureChoice();
  if(step.type==='lesson2Sort') bindLesson2Sort();
  if(step.type==='lesson2CharacterDecision') bindLesson2CharacterDecision();
  if(step.type==='lesson2Summary') bindLesson2Summary();
  if(step.type==='budget') bindBudget();
  document.querySelectorAll('[data-choice]').forEach(b=> b.onclick=()=> { mark(b); showFeedback(step.feedback || 'בחירה טובה נמדדת לפי התאמה למטרה, בדיקה וגמישות — לא לפי תגובה מהירה.'); addMeters({'בדיקה':1}); });
  document.querySelectorAll('[data-card]').forEach(b=> b.onclick=()=> { mark(b); showFeedback(`שאלה טובה: ${b.textContent}. עכשיו נסו לקשור אותה למטרה של ${character().name}.`); addMeters({'נימוק':1}); });
  document.querySelectorAll('[data-sort]').forEach(b=> b.onclick=()=> { mark(b); showFeedback('הסיווג תלוי בהקשר. כתבו נימוק: האם זו מטרה, צורך, פיתוי, ספקולציה או סיכון?'); addMeters({'נימוק':1,'בדיקה':1}); });
  document.querySelectorAll('[data-smart]').forEach(b=> b.onclick=()=> { mark(b); const val=b.dataset.smart; const msg={balanced:'השארתם גמישות והתקדמות למטרה. זו החלטה מאוזנת.',check:'בדיקה והשוואה משפרות את איכות ההחלטה גם אם בסוף בוחרים לקנות.',goal:'התקדמות למטרה חשובה, אבל כדאי להשאיר מקום להפתעות.',spend:'אפשר ליהנות מכסף, אך כאן חסרים בדיקה ומרווח ביטחון.'}[val]; showFeedback(msg); addMeters(val==='spend'?{'נימוק':1}:{'תכנון':1,'בדיקה':1,'גמישות':1}); });
  document.querySelectorAll('[data-scam]').forEach(b=> b.onclick=()=> { mark(b); const good=b.dataset.scam==='good'; showFeedback(good?'אימות דרך ערוץ אחר הוא צעד חכם. לא מסתמכים רק על הודעה דחופה.':'זו פעולה מסוכנת: לחץ זמן והחלפת מספר הם סימני אזהרה. צריך לאמת בערוץ מוכר.'); addMeters(good?{'סיכון':1,'בדיקה':1}:{'סיכון':1}); });
  const nextStepBtn = $('nextStepBtn');
  if (nextStepBtn) nextStepBtn.onclick = () => { state.step = Math.min(lesson().steps.length - 1, state.step + 1); save(); renderLesson(); };
  const nextLessonBtn = $('nextLessonBtn');
  if (nextLessonBtn) nextLessonBtn.onclick = () => { state.lesson = Math.min(lessons.length, state.lesson + 1); state.step = 0; save(); render(); };
  if(step.type==='shoppingCalc') bindShoppingCalc(); if(step.type==='interestCalc') bindInterestCalc(); if(step.type==='installments') bindInstallments(); if(step.type==='riskGraph') bindRiskGraph();
  const exitSave=$('exitSave'); if(exitSave) exitSave.onclick=()=>{ $('planNote').value=$('exitText').value; saveNote(); };
}
function mark(btn){ btn.parentElement.querySelectorAll('.choice').forEach(x=>x.classList.remove('selected')); btn.classList.add('selected'); }
function showFeedback(text){ const f=$('feedback'); if(f){ f.hidden=false; f.textContent=text; } }


function bindLesson2AdLab(){
  const found = new Set(state.lesson2.foundTricks || []);
  const renderFound = () => {
    const box = $('foundTricks');
    box.innerHTML = lesson2Tricks.map(t => `<button type="button" class="trick-chip ${found.has(t.key)?'found':''}" data-review-trick="${t.key}">${t.icon} ${t.label}</button>`).join('');
    document.querySelectorAll('[data-review-trick]').forEach(btn => btn.onclick = () => {
      const trick = lesson2Tricks.find(t => t.key === btn.dataset.reviewTrick);
      showFeedback(trick?.text || 'טריק שיווקי שכדאי לבדוק.');
    });
  };
  document.querySelectorAll('[data-trick]').forEach(btn => btn.onclick = () => {
    const key = btn.dataset.trick;
    found.add(key);
    state.lesson2.foundTricks = [...found];
    save(); renderFound();
    const trick = lesson2Tricks.find(t => t.key === key);
    showFeedback(`${trick.icon} ${trick.label}: ${trick.text}`);
    if (found.size >= 3) addMeters({'בדיקה':1,'נימוק':1});
  });
  renderFound();
}
function bindLesson2PressureChoice(){
  const pressure = { buy:95, compare:45, wait:25, skip:20 };
  const messages = {
    buy:'קנייה מיידית משאירה את הלחץ גבוה. לפעמים זה בסדר, אבל כאן חסרה בדיקה.',
    compare:'השוואת מחיר מורידה לחץ ומחזירה שליטה. עכשיו יש נתון נוסף לפני החלטה.',
    wait:'המתנה קצרה היא כלי חזק נגד FOMO. אם הרצון נשאר מחר — אפשר לבדוק שוב.',
    skip:'ויתור הוא החלטה לגיטימית כשקנייה לא הייתה בתוכנית ולא מקדמת מטרה.'
  };
  document.querySelectorAll('[data-pressure-choice]').forEach(btn => btn.onclick = () => {
    mark(btn);
    const key = btn.dataset.pressureChoice;
    state.lesson2.pressureChoice = key; save();
    $('pressureBar').style.width = `${pressure[key]}%`;
    $('pressureLabel').textContent = pressure[key] > 70 ? 'לחץ גבוה' : pressure[key] > 35 ? 'לחץ בינוני' : 'לחץ נמוך';
    showFeedback(messages[key]);
    addMeters(key === 'buy' ? {'נימוק':1} : {'בדיקה':1,'גמישות':1});
  });
}
function bindLesson2Sort(){
  let selected = null;
  const sortState = state.lesson2.sort || {};
  const paint = () => document.querySelectorAll('[data-sort-item]').forEach(btn => {
    const zone = sortState[btn.dataset.sortItem];
    btn.classList.toggle('selected', btn.dataset.sortItem === selected);
    btn.dataset.placed = zone || '';
  });
  document.querySelectorAll('[data-sort-item]').forEach(btn => btn.onclick = () => { selected = btn.dataset.sortItem; paint(); });
  document.querySelectorAll('[data-sort-zone]').forEach(zone => zone.onclick = () => {
    if (!selected) { showFeedback('קודם בוחרים כרטיס קנייה, ואז קטגוריה.'); return; }
    sortState[selected] = zone.dataset.sortZone;
    state.lesson2.sort = sortState; save();
    const item = lesson2SortItems.find(i => i.id === selected);
    const good = item.best === zone.dataset.sortZone;
    $('sortResult').innerHTML = `<h3>${good ? 'סיווג טוב' : 'אפשר להתווכח — וזה בסדר'}</h3><p>${item.hint}</p><p><b>העיקר:</b> לא רק התווית חשובה, אלא האם יש נימוק והאם הקנייה מתאימה למטרה ולתקציב.</p>`;
    showFeedback(good ? 'הסיווג מתאים להקשר הנתון.' : 'בדקו את ההקשר: האם זה באמת דחוף, חשוב, או רק מופעל מלחץ?');
    addMeters({'נימוק':1,'בדיקה': good ? 1 : 0});
    selected = null; paint();
  });
  paint();
}
function bindLesson2CharacterDecision(){
  const update = () => {
    const price=+$('l2Price').value, shipping=+$('l2Shipping').value, sub=+$('l2Subscription').value, months=+$('l2Months').value;
    const total = price + shipping + sub * months;
    $('l2CalcResult').textContent = `עלות כוללת משוערת: ${money(total)} · מתוכה מנויים/חידושים: ${money(sub * months)} · בדקו האם זה מתאים למטרה של ${character().name}.`;
    return total;
  };
  document.querySelectorAll('.lesson2-calc input').forEach(input => input.oninput = update);
  update();
  $('saveLesson2Decision').onclick = () => {
    const checked = [...document.querySelectorAll('[data-buy-check]:checked')].map(x => x.parentElement.textContent.trim());
    const reason = $('l2Reason').value.trim();
    const total = update();
    let action = reason || 'החלטה ללא ניסוח מלא';
    state.lesson2.characterDecision = { character:character().id, total, checked, reason, action };
    save();
    const enough = checked.length >= 3 && reason.length >= 8;
    showFeedback(enough ? 'החלטה נשמרה: יש בדיקות ונימוק. עברו לסיכום ועדכון תוכנית.' : 'נשמר, אבל כדי שזה יהיה שלם כדאי לסמן לפחות 3 בדיקות ולכתוב נימוק ברור.');
    addMeters(enough ? {'בדיקה':1,'נימוק':1,'תכנון':1} : {'נימוק':1});
  };
}
function bindLesson2Summary(){
  const btn = $('saveLesson2Summary');
  if (!btn) return;
  btn.onclick = () => {
    const d = state.lesson2.characterDecision; const c = d?.character ? (characters.find(item => item.id === d.character) || character()) : character(); const extra = $('lesson2ExitText').value.trim();
    const text = d ? `מפגש 2 — ${c.name}: החלטת קנייה מודעת. עלות כוללת ${money(d.total)}. בדיקות: ${d.checked.join(', ') || 'לא סומנו'}. נימוק: ${d.reason || 'לא צוין'}. כלל אישי: ${extra || 'לעצור–לבדוק–לבחור לפני קנייה דחופה.'}` : `מפגש 2 — כלל אישי: ${extra || 'לעצור–לבדוק–לבחור לפני קנייה דחופה.'}`;
    state.notes.unshift({ lesson:2, character:c.name, text, date:new Date().toLocaleString('he-IL') });
    if(!state.completed.includes(2)) state.completed.push(2);
    save(); renderNotes(); renderProgress(); showFeedback('נשמר ל־Money Smart Plan. שיעור 2 מוכן למעבר לשיעור הבא.'); addMeters({'בדיקה':1,'נימוק':1});
  };
}

function bindLesson1Budget(){
  const budget = lesson1OpeningBudget();
  const inputs = [...document.querySelectorAll('[data-l1-budget]')];
  let selectedCoin = 50;
  const update = () => {
    let sum = 0;
    inputs.forEach(input => {
      const key = input.dataset.l1Budget;
      budget[key] = Number(input.value);
      sum += Number(input.value);
      const value = document.querySelector(`[data-bucket-value="${key}"]`);
      if (value) value.textContent = money(input.value);
    });
    const remaining = Math.max(0, 600 - sum);
    const wallet = $('walletRemaining');
    if (wallet) wallet.textContent = sum <= 600 ? `${money(remaining)} נשארו לחלוקה` : `${money(sum - 600)} מעל התקציב`;
    document.querySelectorAll('[data-budget-bucket]').forEach(bucket => bucket.classList.toggle('full-budget', sum >= 600));
    const saving = budget.saving || 0, buffer = budget.buffer || 0;
    const total = $('budgetTotal');
    total.classList.toggle('over', sum !== 600);
    total.innerHTML = `<span>סה״כ חולק: ${money(sum)} מתוך 600 ₪</span><b>${sum===600?'בדיוק במסגרת':'כוונו את הסכומים ל־600 ₪'}</b>`;
    const score = scoreBudget({ total:sum, target:600, buffer, eventAmount:90, hasReason:true });
    $('l1BudgetInsight').innerHTML = `<h3>מה התקציב הזה אומר?</h3><p>חיסכון למטרה: <b>${money(saving)}</b> · כרית ביטחון: <b>${money(buffer)}</b>. אם תגיע הוצאה בלתי צפויה של 90 ₪, ${buffer >= 90 ? 'יש לה כיסוי מלא בלי לשבור את התקציב.' : 'תצטרכו להזיז כסף מקטגוריה אחרת.'}</p>${scoreHtml(score)}`;
    save();
  };
  const addCoinTo = (key, amount = selectedCoin) => {
    const sum = sumValues(budget);
    if (sum >= 600) return;
    const input = document.querySelector(`[data-l1-budget="${key}"]`);
    if (!input) return;
    const allowed = Math.min(Number(amount), 600 - sum, Number(input.max) - Number(input.value));
    input.value = Number(input.value) + Math.max(0, allowed);
    update();
  };
  inputs.forEach(input => input.oninput = update);
  document.querySelectorAll('[data-coin]').forEach(coin => {
    coin.onclick = () => { selectedCoin = Number(coin.dataset.coin); document.querySelectorAll('[data-coin]').forEach(c => c.classList.toggle('selected', c === coin)); };
    coin.ondragstart = (event) => event.dataTransfer.setData('text/plain', coin.dataset.coin);
  });
  document.querySelectorAll('[data-budget-bucket]').forEach(bucket => {
    bucket.ondragover = (event) => { event.preventDefault(); bucket.classList.add('drag-over'); };
    bucket.ondragleave = () => bucket.classList.remove('drag-over');
    bucket.ondrop = (event) => { event.preventDefault(); bucket.classList.remove('drag-over'); addCoinTo(bucket.dataset.budgetBucket, Number(event.dataTransfer.getData('text/plain') || selectedCoin)); };
    bucket.querySelector('.bucket-add').onclick = () => addCoinTo(bucket.dataset.budgetBucket);
  });
  document.querySelector('[data-coin="50"]')?.classList.add('selected');
  update();
  $('budgetFeedback').onclick = () => {
    const sum = sumValues(budget);
    showFeedback(sum === 600 ? 'נשמר. עכשיו עברו לאירוע הבלתי צפוי ובדקו מה הבחירה שלכם דורשת לשנות.' : 'עדיין לא נשמר כתקציב מלא: צריך לחלק בדיוק 600 ₪.');
    if (sum === 600) addMeters({'תכנון':1,'גמישות': (budget.buffer || 0) >= 90 ? 1 : 0});
  };
}
function bindLesson1Event(){
  const event = lesson1Events[1];
  document.querySelectorAll('[data-event-source]').forEach(btn => btn.onclick = () => {
    mark(btn);
    const key = btn.dataset.eventSource;
    const budget = lesson1OpeningBudget();
    const before = budget[key] || 0;
    const after = Math.max(0, before - event.amount);
    const covered = before >= event.amount;
    state.lesson1.eventChoice = { event:event.id, source:key, before, after, covered };
    save();
    const label = lesson1Categories.find(c => c.key === key)?.label || key;
    showFeedback(covered ? `כיסיתם את האירוע מתוך ${label}. המחיר האלטרנטיבי: נשארו שם ${money(after)} במקום ${money(before)}.` : `ב־${label} אין מספיק כסף מלא. זו נקודת למידה: צריך לשלב כרית ביטחון, חלופה זולה או שינוי ביותר מקטגוריה אחת.`);
    addMeters({'גמישות': covered ? 1 : 0, 'נימוק':1});
  });
}
function bindLesson1CharacterBudget(){
  const profile = currentCharacterPlan();
  const adjustable = profile.available - profile.fixed;
  const plan = state.lesson1.characterPlan[state.character];
  const inputs = [...document.querySelectorAll('[data-character-budget]')];
  const update = () => {
    inputs.forEach(input => { plan.values[input.dataset.characterBudget] = Number(input.value); input.nextElementSibling.textContent = money(input.value); });
    plan.reason = $('characterReason').value.trim();
    const total = sumValues(plan.values);
    const buffer = plan.values.buffer || 0;
    const goal = plan.values.saving || 0;
    const score = { frame: total === adjustable, goal: goal >= profile.goalMonthly, buffer: buffer >= profile.event, reason: plan.reason.length >= 8 };
    $('characterBudgetResult').innerHTML = `<h3>משוב על מפת הכסף</h3><p>חולקו <b>${money(total)}</b> מתוך <b>${money(adjustable)}</b>. יעד חודשי מומלץ לדמות: <b>${money(profile.goalMonthly)}</b>. אירוע אפשרי: <b>${money(profile.event)}</b>.</p>${scoreHtml(score)}<p><b>משמעות:</b> ${score.frame && score.goal && score.buffer ? 'התוכנית גם במסגרת, גם מקדמת מטרה וגם משאירה גמישות.' : 'יש החלטה לשפר: בדקו מסגרת, יעד, כרית ביטחון או נימוק.'}</p>`;
    save();
  };
  inputs.forEach(input => input.oninput = update);
  $('characterReason').oninput = update;
  update();
  $('saveCharacterBudget').onclick = () => {
    update();
    const total = sumValues(plan.values);
    if (total !== adjustable) showFeedback(`עוד לא מאוזן: צריך לחלק בדיוק ${money(adjustable)} לדמות הזו.`);
    else if (!plan.reason || plan.reason.length < 8) showFeedback('התקציב נשמר כמעט מלא, אבל חסר נימוק ברור: מה ויתרתם או דחיתם?');
    else { showFeedback('מפת הכסף נשמרה. עכשיו אפשר לעבור לסיכום ולעדכן את Money Smart Plan.'); addMeters({'תכנון':1,'גמישות': (plan.values.buffer||0)>=profile.event ? 1:0,'נימוק':1}); }
  };
}
function bindLesson1Summary(){
  const btn = $('saveLesson1Summary');
  if (!btn) return;
  btn.onclick = () => {
    const c = character(); const profile = currentCharacterPlan(); const plan = state.lesson1.characterPlan?.[state.character];
    const values = plan?.values || {}; const text = $('exitText').value.trim();
    const generated = `מפגש 1 — ${c.name}: הכנסה/סכום זמין ${money(profile.available - profile.fixed)}, מטרה: ${c.goal}, חיסכון למטרה ${money(values.saving || 0)}, כרית ביטחון ${money(values.buffer || 0)}, עלות אלטרנטיבית/ויתור: ${plan?.reason || 'לא צוין'}. ${text}`;
    state.notes.unshift({ lesson:1, character:c.name, text:generated, date:new Date().toLocaleString('he-IL') });
    if(!state.completed.includes(1)) state.completed.push(1);
    save(); renderNotes(); renderProgress(); showFeedback('נשמר ל־Money Smart Plan בצד ימין. זה התוצר של מפגש 1.'); addMeters({'תכנון':1,'נימוק':1});
  };
}

function bindBudget(){ const inputs=[...document.querySelectorAll('[data-budget]')]; const update=()=>{ let sum=0; inputs.forEach(i=>{ sum+=+i.value; i.nextElementSibling.textContent=`${i.value} ₪`; }); const total=$('budgetTotal'); total.classList.toggle('over',sum!==600); total.innerHTML=`<span>סה״כ חולק: ${sum} ₪</span><b>${sum===600?'בדיוק במסגרת':'צריך להגיע בדיוק ל־600 ₪'}</b>`; }; inputs.forEach(i=>i.oninput=update); update(); $('budgetFeedback').onclick=()=>{ const sum=inputs.reduce((a,i)=>a+ +i.value,0); showFeedback(sum===600?'התקציב מאוזן. עכשיו בדקו האם נשארה כרית ביטחון והאם המטרה מתקדמת.':'תקציב טוב חייב להתאים למסגרת. נסו לשנות עד שתגיעו ל־600 ₪.'); addMeters({'תכנון':1,'גמישות': sum===600?1:0}); }; }
function bindShoppingCalc(){ const update=()=>{ const coins=+$('coins').value, price=+$('coinPrice').value, item=+$('itemCoins').value, sub=+$('sub').value, months=+$('months').value, ship=+$('ship').value; $('calcResult').textContent=`שווי הפריט: ${(item/coins*price).toFixed(2)} ₪ · עלות מנוי: ${(sub*months).toFixed(2)} ₪ · משלוח “חינם” כדאי רק אם המוצר הנוסף באמת דרוש יותר מ־${ship} ₪.`; }; document.querySelectorAll('.calculator input').forEach(i=>i.oninput=update); update(); }
function bindInterestCalc(){ const update=()=>{ const p=+$('principal').value,r=+$('rate').value/100,y=+$('years').value,m=+$('monthly').value; const simple=p+p*r*y+m*12*y; let compound=p; const bars=[]; for(let i=1;i<=y;i++){ compound=(compound+m*12)*(1+r); bars.push(`<i style="height:${Math.min(100, compound/(p+1)*45)}%"></i>`); } $('interestResult').textContent=`ריבית פשוטה בקירוב: ${simple.toFixed(2)} ₪ · דריבית בקירוב: ${compound.toFixed(2)} ₪`; $('graph').innerHTML=bars.join(''); }; document.querySelectorAll('.calculator input').forEach(i=>i.oninput=update); update(); }
function bindInstallments(){ const update=()=>{ const cash=+$('cashPrice').value,c=+$('installCount').value,p=+$('installPay').value,total=c*p; $('installResult').textContent=`מחיר כולל בתשלומים: ${total.toFixed(2)} ₪ · פער מול תשלום אחד: ${(total-cash).toFixed(2)} ₪ · התחייבות ל־${c} חודשים.`; }; document.querySelectorAll('.calculator input').forEach(i=>i.oninput=update); update(); }
function bindRiskGraph(){ const draw=()=>{ const y=+$('riskYears').value; $('riskGraph').innerHTML=Array.from({length:y*2},(_,i)=>`<i style="height:${20+Math.abs(Math.sin(i*1.7))*65}%"></i>`).join(''); }; $('riskYears').oninput=draw; draw(); }

document.addEventListener('DOMContentLoaded', init);
