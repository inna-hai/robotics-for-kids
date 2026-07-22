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
    { name:'פתיחת מעבדה', type:'ad', title:'המבצע מסתיים בעוד 7 דקות', text:'רק היום: 50% הנחה. נותרו שני פריטים. משלוח חינם בקנייה מעל 200 ש״ח. בחרו איך להגיב לפני שמנתחים את הטריקים.' },
    { name:'מה הייתם עושים?', type:'choice', title:'לקנות, לבדוק או להמתין?', text:'הפרסומת מרגישה דחופה, אבל לא ברור אם המחיר באמת טוב.', options:['לקנות מיד','לחפש מחיר במקום אחר','לשמור ולבדוק מחר','לוותר כי לא תכננתי לקנות'], feedback:'עצירה קצרה מחזירה לנו שליטה. לחץ זמן, מחסור ומשלוח חינם יכולים להשפיע בלי שנשים לב.' },
    { name:'לומדים דרך גילוי', type:'cards', title:'למה קשה לעצור?', text:'קנייה דיגיטלית בנויה לפעמים כך שנרגיש פחות את התשלום ויותר את התגמול המיידי.', cards:['המוח אוהב תגמול מיידי','משפיענים יוצרים תחושת קרבה','מטבע וירטואלי מסתיר מחיר בשקלים','מנוי קטן מצטבר לאורך שנה'] },
    { name:'מתנסים', type:'sort', title:'צורך, רצון חשוב או רצון רגעי?', items:['נעליים כשהישנות נהרסו','סקין במהדורה מוגבלת','מתנה לחבר קרוב','מחשב ללימודים','משלוח אוכל אחרי יום ארוך','מחשב חזק יותר בעיקר לגיימינג'] },
    { name:'עצירת מדריך', type:'cards', title:'דיון: האם מבצע באמת חוסך?', text:'הדגישו שאין מטרה להציג כל קנייה כרעה. השאלה היא האם הבחירה מודעת ומתאימה.', cards:['האם חסכתי אם לא תכננתי לקנות?','מה ההבדל בין רצון חשוב לרצון רגעי?','איך משפיען יוצר אמון?','מה כלל המתנה סביר?'] },
    { name:'משימת דמות', type:'shoppingCalc', title:'המחיר האמיתי', text:'חשבו מטבע משחק, מנוי ומשלוח. לאחר מכן הפעילו את כלי עצור–בדוק–בחר עבור הדמות שבחרתם.' },
    { name:'סיכום ועדכון תוכנית', type:'exit', title:'כרטיס קנייה חכמה', prompt:'נסחו כלל אישי אחד לגבי זמן המתנה, השוואת מחירים, עלויות נסתרות, מנויים או רכישות בתוך משחקים.' }
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
function render(){ renderNav(); renderLesson(); renderCharacter(); renderMeters(); renderNotes(); renderProgress(); }
function renderNav(){
  $('lessonNav').innerHTML = lessons.map(l => `<button type="button" class="${l.id===state.lesson?'active':''}" data-lesson="${l.id}"><b>מפגש ${l.id}: ${l.title}</b><span>${l.question}</span></button>`).join('');
  document.querySelectorAll('[data-lesson]').forEach(btn => btn.onclick = () => { state.lesson = Number(btn.dataset.lesson); state.step = 0; save(); render(); });
}
function renderLesson(){
  const l = lesson();
  $('lessonKicker').textContent = `מפגש ${l.id} מתוך 5 · 90 דקות`;
  $('lessonTitle').textContent = l.title;
  $('lessonQuestion').textContent = l.question;
  $('conceptChips').innerHTML = l.concepts.map(c => `<button type="button" data-concept="${c}">${c}</button>`).join('') + '<div id="conceptDefinition" class="concept-definition">לחצו על מושג כדי לראות הסבר קצר ודוגמה לתפקיד שלו בפעילות.</div>';
  document.querySelectorAll('[data-concept]').forEach(btn => btn.onclick = () => {
    document.querySelectorAll('[data-concept]').forEach(x => x.classList.remove('active'));
    btn.classList.add('active');
    $('conceptDefinition').textContent = conceptInfo[btn.dataset.concept] || 'מושג מרכזי לשיעור הזה.';
  });
  $('stepTabs').innerHTML = l.steps.map((s,i)=>`<button type="button" class="${i===state.step?'active':''}" data-step="${i}">${i+1}. ${s.name}</button>`).join('');
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
  $('overallProgress').style.width = `${count/5*100}%`;
  $('progressLabel').textContent = `${count} מתוך 5 מפגשים`;
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
  $('stepContent').innerHTML = html;
  bindStep(step);
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
  return wrap(step, `<div class="product-note"><b>מה עושים כאן?</b> הזיזו סכומים עד שהתקציב מסתכם ב־600 ש״ח. אחר כך בדקו אם יש גם חיסכון למטרה וגם כרית ביטחון.</div><div id="budgetSliders">${lesson1Categories.map(c=>`<div class="slider-row"><b>${c.label}</b><input type="range" min="0" max="300" step="10" value="${budget[c.key]}" data-l1-budget="${c.key}"><span></span></div>`).join('')}</div><div id="budgetTotal" class="budget-total"></div><div id="l1BudgetInsight" class="lesson1-insight"></div><button class="btn primary" id="budgetFeedback">שמירת תקציב פתיחה</button><div id="feedback" class="feedback" hidden></div>`);
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
  if(step.type==='budget') bindBudget();
  document.querySelectorAll('[data-choice]').forEach(b=> b.onclick=()=> { mark(b); showFeedback(step.feedback || 'בחירה טובה נמדדת לפי התאמה למטרה, בדיקה וגמישות — לא לפי תגובה מהירה.'); addMeters({'בדיקה':1}); });
  document.querySelectorAll('[data-card]').forEach(b=> b.onclick=()=> { mark(b); showFeedback(`שאלה טובה: ${b.textContent}. עכשיו נסו לקשור אותה למטרה של ${character().name}.`); addMeters({'נימוק':1}); });
  document.querySelectorAll('[data-sort]').forEach(b=> b.onclick=()=> { mark(b); showFeedback('הסיווג תלוי בהקשר. כתבו נימוק: האם זו מטרה, צורך, פיתוי, ספקולציה או סיכון?'); addMeters({'נימוק':1,'בדיקה':1}); });
  document.querySelectorAll('[data-smart]').forEach(b=> b.onclick=()=> { mark(b); const val=b.dataset.smart; const msg={balanced:'השארתם גמישות והתקדמות למטרה. זו החלטה מאוזנת.',check:'בדיקה והשוואה משפרות את איכות ההחלטה גם אם בסוף בוחרים לקנות.',goal:'התקדמות למטרה חשובה, אבל כדאי להשאיר מקום להפתעות.',spend:'אפשר ליהנות מכסף, אך כאן חסרים בדיקה ומרווח ביטחון.'}[val]; showFeedback(msg); addMeters(val==='spend'?{'נימוק':1}:{'תכנון':1,'בדיקה':1,'גמישות':1}); });
  document.querySelectorAll('[data-scam]').forEach(b=> b.onclick=()=> { mark(b); const good=b.dataset.scam==='good'; showFeedback(good?'אימות דרך ערוץ אחר הוא צעד חכם. לא מסתמכים רק על הודעה דחופה.':'זו פעולה מסוכנת: לחץ זמן והחלפת מספר הם סימני אזהרה. צריך לאמת בערוץ מוכר.'); addMeters(good?{'סיכון':1,'בדיקה':1}:{'סיכון':1}); });
  if(step.type==='shoppingCalc') bindShoppingCalc(); if(step.type==='interestCalc') bindInterestCalc(); if(step.type==='installments') bindInstallments(); if(step.type==='riskGraph') bindRiskGraph();
  const exitSave=$('exitSave'); if(exitSave) exitSave.onclick=()=>{ $('planNote').value=$('exitText').value; saveNote(); };
}
function mark(btn){ btn.parentElement.querySelectorAll('.choice').forEach(x=>x.classList.remove('selected')); btn.classList.add('selected'); }
function showFeedback(text){ const f=$('feedback'); if(f){ f.hidden=false; f.textContent=text; } }

function bindLesson1Budget(){
  const budget = lesson1OpeningBudget();
  const inputs = [...document.querySelectorAll('[data-l1-budget]')];
  const update = () => {
    let sum = 0;
    inputs.forEach(input => { budget[input.dataset.l1Budget] = Number(input.value); sum += Number(input.value); input.nextElementSibling.textContent = money(input.value); });
    const saving = budget.saving || 0, buffer = budget.buffer || 0;
    const total = $('budgetTotal');
    total.classList.toggle('over', sum !== 600);
    total.innerHTML = `<span>סה״כ חולק: ${money(sum)} מתוך 600 ₪</span><b>${sum===600?'בדיוק במסגרת':'כוונו את הסכומים ל־600 ₪'}</b>`;
    const score = scoreBudget({ total:sum, target:600, buffer, eventAmount:90, hasReason:true });
    $('l1BudgetInsight').innerHTML = `<h3>מה התקציב הזה אומר?</h3><p>חיסכון למטרה: <b>${money(saving)}</b> · כרית ביטחון: <b>${money(buffer)}</b>. אם תגיע הוצאה בלתי צפויה של 90 ₪, ${buffer >= 90 ? 'יש לה כיסוי מלא בלי לשבור את התקציב.' : 'תצטרכו להזיז כסף מקטגוריה אחרת.'}</p>${scoreHtml(score)}`;
    save();
  };
  inputs.forEach(input => input.oninput = update);
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
