const PIECES = {
  king: { icon:'♔', name:'המלך', color:'#facc15', rule:'צעד אחד לכל כיוון — אבל אף פעם לא אל סכנה.' },
  queen: { icon:'♕', name:'המלכה', color:'#ec4899', rule:'ישר ואלכסון, כמה משבצות שרוצים.' },
  rook: { icon:'♖', name:'הצריח', color:'#f97316', rule:'רכבת: ישר בשורה או בטור.' },
  bishop: { icon:'♗', name:'הרץ', color:'#8b5cf6', rule:'קוסם אלכסונים — נשאר תמיד על אותו צבע.' },
  knight: { icon:'♘', name:'הפרש', color:'#22c55e', rule:'קופץ בצורת ר׳: שתיים ואז אחת.' },
  pawn: { icon:'♙', name:'החייל', color:'#14b8a6', rule:'מתקדם קדימה, אוכל באלכסון, וחולם להפוך למלכה.' }
};

const lessons = [
  {id:1,piece:'king',title:'הלוח והממלכה',story:'סיסי פותחת את שערי הממלכה: לפני שמזיזים גיבורים, לומדים לקרוא משבצות, תור ומטרה.',focus:'מהי משבצת? מהו תור? לאן צריך להגיע?',tips:['אני בודק איפה הכלי שלי עומד','אני שואל מה המטרה','אני מזיז כלי אחד בכל תור'],tasks:[
    task('reach','הגיעו לשער הטירה','הזיזו את המלך משבצת אחת אל הכוכב.',{king:'e2',targets:['e3'],stars:['e3']}),
    task('select','מצאו את משבצת האוצר','לחצו על המשבצת d4 — כך קוראים מיקום על לוח.',{targets:['d4'],stars:['d4']}),
    task('legal','מי יכול להגיע לכוכב?','בחרו את המלך ואז את המשבצת הבטוחה היחידה.',{king:'c3',targets:['d4'],danger:['b2','b3','b4','c2','d2']})]},
  {id:2,piece:'rook',title:'הצריח הרכבת',story:'הצריח נוסע כמו רכבת מלכותית: ישר, ישר, ישר — בלי פניות באמצע.',focus:'קווים ישרים, שורות וטורים.',tips:['צריח לא נוסע באלכסון','כלי באמצע הדרך עוצר אותו','צריח אוהב שורות פתוחות'],tasks:[
    task('legal','הדליקו מסילות לצריח','בחרו את כל המשבצות שהצריח יכול להגיע אליהן.',{rook:'d4',targets:['d1','d2','d3','d5','d6','d7','d8','a4','b4','c4','e4','f4','g4','h4']}),
    task('capture','צריח אוכל בקו ישר','בחרו את החייל שהצריח יכול לאכול.',{rook:'a1',enemies:{a7:'pawn',h1:'pawn',c3:'pawn'},targets:['a7','h1']}),
    task('reach','מסע במגדל','הביאו את הצריח אל שער הזהב.',{rook:'b2',targets:['b7'],stars:['b7']})]},
  {id:3,piece:'bishop',title:'הרץ הקוסם',story:'הרץ מחליק באלכסונים, כמו קרן אור צבעונית. הוא לעולם לא מחליף צבע משבצת.',focus:'אלכסונים וצבעי משבצות.',tips:['רץ נשאר על אותו צבע','אלכסון הוא צעד ימינה/שמאלה וגם למעלה/למטה','כלי בדרך עוצר את הרץ'],tasks:[
    task('legal','שבילי הקסם','בחרו את משבצות האלכסון של הרץ.',{bishop:'e4',targets:['d3','c2','b1','f3','g2','h1','d5','c6','b7','a8','f5','g6','h7']}),
    task('capture','הדרקון באלכסון','בחרו איזה דרקון הרץ יכול לאכול.',{bishop:'c1',enemies:{h6:'pawn',c5:'pawn',a3:'pawn'},targets:['h6','a3']}),
    task('select','אותו צבע','לחצו על משבצת שהרץ מ־f2 יכול להגיע אליה.',{bishop:'f2',targets:['e3','d4','c5','b6','a7','g3','h4','e1','g1']})]},
  {id:4,piece:'queen',title:'המלכה הגיבורה',story:'המלכה משלבת את הכוח של הצריח והרַץ — אבל גם גיבורת־על צריכה לחשוב לפני שהיא מסתערת.',focus:'שילוב ישר ואלכסון.',tips:['מלכה היא צריח + רץ','כוח גדול לא אומר להזיז בלי תוכנית','מלכה חזקה כשהיא מוגנת'],tasks:[
    task('legal','קרני המלכה','סמנו לאן המלכה יכולה להגיע.',{queen:'d4',targets:['d1','d2','d3','d5','d6','d7','d8','a4','b4','c4','e4','f4','g4','h4','a1','b2','c3','e5','f6','g7','h8','a7','b6','c5','e3','f2','g1']}),
    task('capture','הצלה מהירה','המלכה יכולה לאכול שני אויבים. בחרו אחד מהם.',{queen:'e2',enemies:{e7:'pawn',b5:'pawn',a2:'pawn'},targets:['e7','b5','a2']}),
    task('reach','המלכה לשער','הגיעו לכוכב במהלך אחד.',{queen:'h1',targets:['b7'],stars:['b7']})]},
  {id:5,piece:'knight',title:'הפרש הקופץ',story:'הפרש הוא היחיד שקופץ מעל כולם. הוא זז בצורת ר׳ — שתיים ואז אחת.',focus:'קפיצת ר׳ ודמיון מרחבי.',tips:['פרש קופץ מעל כלים','צורת ר׳: 2 ואז 1','פרש מחליף צבע בכל קפיצה'],tasks:[
    task('legal','קפיצות סוס','בחרו את כל קפיצות הפרש.',{knight:'d4',targets:['b3','b5','c2','c6','e2','e6','f3','f5']}),
    task('capture','מזלג ראשון','איזה אויב הפרש יכול לאכול בקפיצה?',{knight:'e4',enemies:{f6:'pawn',e6:'pawn',g5:'pawn'},targets:['f6','g5']}),
    task('select','קפיצה מעל חומה','גם אם יש כלים לידו, הפרש יכול לקפוץ. בחרו יעד חוקי.',{knight:'b1',friends:{b2:'pawn',c1:'pawn'},targets:['a3','c3','d2']})]},
  {id:6,piece:'king',title:'המלך ואזור בטוח',story:'המלך לא הכי חזק, אבל הוא הכי חשוב. הממלכה נופלת אם הוא נכנס לסכנה.',focus:'בטיחות המלך.',tips:['מלך זז צעד אחד','אסור להיכנס למשבצת מאוימת','לפעמים המהלך הכי חכם הוא לברוח'],tasks:[
    task('safe','מצאו משבצת בטוחה','המלך צריך לברוח בלי להיכנס לסכנה.',{king:'e1',danger:['d1','e2','f2'],targets:['d2','f1']}),
    task('legal','צעד אחד בלבד','בחרו לאן המלך יכול לזוז.',{king:'c3',targets:['b2','b3','b4','c2','c4','d2','d3','d4']}),
    task('select','לא לשח','לחצו על משבצת בטוחה בלבד.',{king:'g1',danger:['g2','h2'],targets:['f1','f2']})]},
  {id:7,piece:'pawn',title:'החיילים הקטנים',story:'החייל קטן אבל אמיץ: מתקדם קדימה, אוכל באלכסון, ואם הוא מגיע רחוק — הוא משתנה.',focus:'תנועת חייל ואכילה.',tips:['חייל מתקדם קדימה','חייל אוכל באלכסון','חייל שהגיע לקצה יכול להפוך לכלי חזק'],tasks:[
    task('legal','צעד קדימה','בחרו את הצעד החוקי של החייל.',{pawn:'d2',targets:['d3']}),
    task('capture','אכילה אלכסונית','בחרו אויב שהחייל יכול לאכול.',{pawn:'e4',enemies:{d5:'pawn',e5:'pawn',f5:'pawn'},targets:['d5','f5']}),
    task('reach','מסע לקידום','הביאו את החייל לכוכב.',{pawn:'a7',targets:['a8'],stars:['a8']})]},
  {id:8,piece:'rook',title:'אכילה והגנה',story:'בממלכת השחמט לא מספיק לאכול. צריך לשאול: מי ישמור עליי אחרי זה?',focus:'כלי מוגן וכלי לא מוגן.',tips:['לא כל אכילה טובה','כלי מוגן פחות קל להפסיד','מחפשים “חינם” רק אחרי בדיקה'],tasks:[
    task('capture','אכילה חכמה','בחרו אויב שאפשר לאכול והוא לא מוגן.',{queen:'d1',friends:{c2:'bishop'},enemies:{d7:'pawn',h5:'pawn'},targets:['h5']}),
    task('select','מי שומר על הצריח?','לחצו על הכלי ששומר על הצריח.',{rook:'e4',bishop:'b1',targets:['b1']}),
    task('legal','איום והגנה','בחרו מהלכי הגנה אפשריים לצריח.',{rook:'a1',queen:'d1',targets:['a4','d4','h1']})]},
  {id:9,piece:'queen',title:'שח!',story:'שח הוא אזעקה: המלך מאוים. עכשיו כל הממלכה עוצרת ומטפלת בזה.',focus:'זיהוי איום על המלך.',tips:['שח = איום על המלך','כשיש שח חייבים לענות לו','לא ממשיכים תוכנית רגילה כשיש אזעקה'],tasks:[
    task('select','מי נותן שח?','לחצו על הכלי שמאיים על המלך.',{king:'e8',rook:'e1',bishop:'a2',targets:['e1']}),
    task('capture','עצירת אזעקה','בחרו דרך לאכול את הכלי שנותן שח.',{king:'g1',queen:'e2',enemies:{g7:'rook'},targets:['g7']}),
    task('safe','המלך בורח','בחרו משבצת מילוט בטוחה.',{king:'h8',danger:['h7','g8'],targets:['g7']})]},
  {id:10,piece:'bishop',title:'בורחים משח',story:'יש שלוש דרכי הצלה: להזיז את המלך, לחסום את הקו, או לאכול את המאיים.',focus:'שלוש תשובות לשח.',tips:['לזוז','לחסום','לאכול את הכלי המאיים'],tasks:[
    task('select','חסימה בין צריח למלך','לחצו על המשבצת שבה אפשר לחסום את השח.',{king:'e8',rook:'e1',bishop:'c3',targets:['e5']}),
    task('safe','בריחת מלך','בחרו משבצת בטוחה לבריחה.',{king:'d1',danger:['d2','e1'],targets:['c1','c2']}),
    task('capture','אוכלים את המאיים','בחרו את הכלי שצריך לאכול.',{king:'a1',bishop:'c3',enemies:{b2:'queen'},targets:['b2']})]},
  {id:11,piece:'queen',title:'מט בסיסי',story:'מט הוא כשהמלך בשח ואין לו שום הצלה. לומדים לסגור בעדינות, לא לרדוף בפראות.',focus:'סגירת מרחב עם מלכה וצריח.',tips:['מט = שח בלי בריחה','סוגרים מרחב בהדרגה','שומרים שהמלכה לא תהיה לבד'],tasks:[
    task('reach','מלכה סוגרת שורה','הביאו את המלכה לשורה שנותנת שח חזק.',{queen:'d1',king:'h8',targets:['h5'],stars:['h5']}),
    task('select','מה מכסה בריחות?','לחצו על הכלי שסוגר למלך את הבריחה.',{queen:'g7',rook:'a8',king:'h8',targets:['g7']}),
    task('capture','מט או רק שח?','בחרו מהלך שנותן מט בסיסי.',{queen:'f7',rook:'a1',king:'h8',targets:['f8']})]},
  {id:12,piece:'pawn',title:'פתיחה פשוטה',story:'בתחילת משחק לא רצים אחרי מתנות נוצצות. בונים ממלכה: מרכז, כלים, מלך בטוח.',focus:'מרכז, פיתוח והגנה.',tips:['שולטים במרכז','מוציאים כלים קטנים','לא מזיזים אותה דמות שוב ושוב בלי סיבה'],tasks:[
    task('select','מרכז הלוח','לחצו על אחת ממשבצות המרכז.',{targets:['d4','e4','d5','e5'],stars:['d4','e4','d5','e5']}),
    task('legal','פיתוח פרש','בחרו מהלך פיתוח טוב לפרש.',{knight:'g1',targets:['f3','h3']}),
    task('select','מי צריך לצאת למשחק?','בחרו כלי קטן לפיתוח לפני המלכה.',{bishop:'f1',queen:'d1',targets:['f1']})]},
  {id:13,piece:'knight',title:'מזלג ואיום כפול',story:'לפעמים מהלך אחד מאיים על שני דברים. הפרש אוהב במיוחד מזלגות.',focus:'איום כפול.',tips:['מזלג מאיים על שני כלים','בודקים גם אחרי המהלך','פרש מצוין במזלגות'],tasks:[
    task('reach','מזלג פרש','הביאו את הפרש למשבצת שמאיימת על מלך ומלכה.',{knight:'e4',king:'g5',queen:'c5',targets:['f6'],stars:['f6']}),
    task('select','מי מותקף פעמיים?','לחצו על הכלי שנמצא בסכנת איום כפול.',{knight:'d6',king:'f7',queen:'b7',targets:['f7','b7']}),
    task('capture','רווח נקי','בחרו את הכלי היקר יותר אחרי המזלג.',{knight:'f6',enemies:{h7:'rook',d7:'queen'},targets:['d7']})]},
  {id:14,piece:'bishop',title:'סיכה וגילוי',story:'סיכה היא כמו כפתור שמחזיק כלי במקום: אם הוא זז, משהו חשוב מאחוריו נחשף.',focus:'סיכה וגילוי התקפה.',tips:['מחפשים כלי חשוב מאחור','כלי סכור לא תמיד באמת חופשי','הזזה יכולה לפתוח קו התקפה'],tasks:[
    task('select','מי בסיכה?','לחצו על הכלי שלא כדאי לו לזוז.',{bishop:'b5',king:'e8',enemies:{c6:'knight'},targets:['c6']}),
    task('reach','פותחים קו','הזיזו את הרץ לקו שמפעיל לחץ.',{bishop:'c4',targets:['f7'],stars:['f7']}),
    task('capture','מנצלים סיכה','בחרו את הכלי הסכור שאפשר ללחוץ עליו.',{rook:'e1',king:'e8',enemies:{e6:'pawn'},targets:['e6']})]},
  {id:15,piece:'queen',title:'טורניר המלכים',story:'הגיע הזמן לשחק כמו שחמטאים צעירים: לבדוק איומים, לבחור תוכנית, ולסיים בכבוד.',focus:'משחק מודרך ותעודת סיום.',tips:['בודקים שח','בודקים כלים לא מוגנים','חושבים מה היריב יעשה'],tasks:[
    task('select','שאלת מאמן','מה בודקים לפני כל מהלך? לחצו על המלך כדי לזכור בטיחות.',{king:'e1',queen:'d1',targets:['e1']}),
    task('legal','מהלך מנצח','בחרו את מהלך המלכה שנותן שח ומרוויח זמן.',{queen:'h5',king:'e8',targets:['e8','f7']}),
    task('reach','כתר הסיום','הביאו את המלכה לכוכב וקבלו תעודה.',{queen:'d4',targets:['h8'],stars:['h8'],certificate:true})]}
];

function task(type,title,text,setup){ return { type,title,text,setup }; }

const files = ['a','b','c','d','e','f','g','h'];
let state = loadState();
let selectedSquare = null;
let selectedPiece = null;

function loadState(){
  const params = new URLSearchParams(location.search);
  const saved = JSON.parse(localStorage.getItem('chessQuestState') || '{}');
  return { lesson: Number(params.get('lesson') || saved.lesson || 1), task: saved.task || 0, completed: saved.completed || [], badges: saved.badges || [], selectedPiece: saved.selectedPiece || 'queen' };
}
function saveState(){ localStorage.setItem('chessQuestState', JSON.stringify(state)); }
function currentLesson(){ return lessons.find(l => l.id === state.lesson) || lessons[0]; }
function currentTask(){ const l=currentLesson(); return l.tasks[Math.min(state.task,l.tasks.length-1)]; }
function $(id){ return document.getElementById(id); }
function squareToXY(s){ return { x: files.indexOf(s[0]), y: 8 - Number(s[1]) }; }
function xyToSquare(x,y){ return `${files[x]}${8-y}`; }
function sameLine(a,b){ const A=squareToXY(a), B=squareToXY(b); return A.x===B.x || A.y===B.y; }
function sameDiag(a,b){ const A=squareToXY(a), B=squareToXY(b); return Math.abs(A.x-B.x)===Math.abs(A.y-B.y); }
function knightMove(a,b){ const A=squareToXY(a), B=squareToXY(b); const dx=Math.abs(A.x-B.x), dy=Math.abs(A.y-B.y); return (dx===1&&dy===2)||(dx===2&&dy===1); }
function kingMove(a,b){ const A=squareToXY(a), B=squareToXY(b); return Math.max(Math.abs(A.x-B.x),Math.abs(A.y-B.y))===1; }
function pawnMove(a,b,capture=false){ const A=squareToXY(a), B=squareToXY(b); return capture ? (Math.abs(A.x-B.x)===1 && B.y===A.y-1) : (A.x===B.x && B.y===A.y-1); }
function legalFor(piece, from, to, capture=false){
  if(!from || !to) return false;
  if(piece==='rook') return sameLine(from,to);
  if(piece==='bishop') return sameDiag(from,to);
  if(piece==='queen') return sameLine(from,to) || sameDiag(from,to);
  if(piece==='knight') return knightMove(from,to);
  if(piece==='king') return kingMove(from,to);
  if(piece==='pawn') return pawnMove(from,to,capture);
  return false;
}
function setupPieces(setup){
  const map = {};
  for (const [key,value] of Object.entries(setup || {})) {
    if (PIECES[key]) map[value] = { side:'white', type:key, icon:PIECES[key].icon };
  }
  for (const [sq,type] of Object.entries(setup.enemies || {})) map[sq] = { side:'black', type, icon:blackIcon(type) };
  for (const [sq,type] of Object.entries(setup.friends || {})) map[sq] = { side:'white', type, icon:PIECES[type]?.icon || '♙' };
  return map;
}
function blackIcon(type){ return ({king:'♚',queen:'♛',rook:'♜',bishop:'♝',knight:'♞',pawn:'♟'})[type] || '♟'; }

function render(){
  const lesson = currentLesson(); const task = currentTask(); selectedSquare = null; selectedPiece = state.selectedPiece || lesson.piece;
  $('coachAvatar').textContent = PIECES[lesson.piece]?.icon || '♕';
  if ($('lessonKicker')) $('lessonKicker').textContent = `שיעור ${lesson.id} מתוך 15 · משימה ${state.task + 1} מתוך ${lesson.tasks.length}`;
  $('lessonTitle').textContent = `${lesson.id}. ${lesson.title}`;
  if ($('lessonStory')) $('lessonStory').textContent = lesson.story;
  $('taskTitle').textContent = task.title;
  $('taskText').textContent = task.text;
  renderLessonSelect(); renderMissions(); renderBoard(); renderInventory(); renderTips(); renderBadges(); updateProgress();
  feedback(`משימה ${state.task+1}: ${task.text}`, '');
  saveState();
}
function renderLessonSelect(){
  $('lessonSelect').innerHTML = lessons.map(l => `<button type="button" data-lesson="${l.id}" class="${l.id===state.lesson?'active':''}" title="${l.title}">${l.id}</button>`).join('');
  $('lessonSelect').querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => { state.lesson=Number(btn.dataset.lesson); state.task=0; render(); history.replaceState(null,'',`?lesson=${state.lesson}`); }));
}
function renderMissions(){
  const lesson = currentLesson();
  $('missionList').innerHTML = lesson.tasks.map((t,i)=>`<div class="mission-step ${i<state.task?'done':''}"><span>${i<state.task?'✅':'⭐'}</span><b>${t.title}</b></div>`).join('');
}
function renderBoard(){
  const task = currentTask(); const setup = task.setup || {}; const pieces = setupPieces(setup); const targets = new Set(setup.targets || []); const danger = new Set(setup.danger || []); const stars = new Set(setup.stars || []);
  const board = $('chessBoard'); board.innerHTML = '';
  for(let y=0;y<8;y++) for(let x=0;x<8;x++){
    const sq = xyToSquare(x,y); const p = pieces[sq];
    const btn = document.createElement('button'); btn.type='button'; btn.className = `square ${((x+y)%2?'dark':'light')}`; btn.dataset.square=sq; btn.setAttribute('role','gridcell'); btn.setAttribute('aria-label', `משבצת ${sq}`);
    if(stars.has(sq)) btn.classList.add('target'); if(danger.has(sq)) btn.classList.add('danger'); if(targets.has(sq) && setup.enemies?.[sq]) btn.classList.add('capture');
    btn.innerHTML = `${p ? `<span aria-hidden="true">${p.icon}</span>` : (stars.has(sq)?'<span aria-hidden="true">⭐</span>':'')}<small class="file-rank">${sq}</small>`;
    btn.addEventListener('click', () => handleSquare(sq, p)); board.appendChild(btn);
  }
}
function renderInventory(){
  $('pieceInventory').innerHTML = Object.entries(PIECES).map(([key,p])=>`<button type="button" data-piece="${key}" class="${key===selectedPiece?'active':''}" title="${p.name}: ${p.rule}">${p.icon}<span class="sr-only">${p.name}</span></button>`).join('');
  $('pieceInventory').querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => { state.selectedPiece=btn.dataset.piece; selectedPiece=btn.dataset.piece; renderInventory(); feedback(`${PIECES[selectedPiece].name}: ${PIECES[selectedPiece].rule}`,''); highlightMovesForSelectedPiece(); saveState(); }));
}
function renderTips(){
  const lesson = currentLesson();
  $('thinkingTips').innerHTML = [`מוקד: ${lesson.focus}`,...lesson.tips].map(t=>`<div class="tip">${t}</div>`).join('');
}
function renderBadges(){
  const earned = new Set(state.badges);
  $('badgeGrid').innerHTML = lessons.slice(0,15).map(l=>`<div class="badge ${earned.has(l.id)?'earned':''}">${earned.has(l.id)?'🏅':'◇'} ${l.id}</div>`).join('');
}
function updateProgress(){
  const pct = Math.round((new Set(state.badges).size / lessons.length) * 100);
  $('progressBar').style.width = `${pct}%`; $('progressText').textContent = `${new Set(state.badges).size} מתוך ${lessons.length} מדליות נאספו`;
}
function feedback(text, type=''){ const box=$('feedback'); box.textContent=text; box.className=`feedback ${type}`; }
function markSelected(sq){ document.querySelectorAll('.square').forEach(el => el.classList.toggle('selected', el.dataset.square===sq)); }
function highlightMovesForSelectedPiece(){
  const task = currentTask(); const setup = task.setup || {}; const from = setup[selectedPiece];
  document.querySelectorAll('.square').forEach(el => el.classList.remove('safe'));
  if(!from) return;
  document.querySelectorAll('.square').forEach(el => { if(legalFor(selectedPiece, from, el.dataset.square, Boolean(setup.enemies?.[el.dataset.square]))) el.classList.add('safe'); });
}
function handleSquare(sq, piece){
  const task = currentTask(); const setup = task.setup || {}; const targets = new Set(setup.targets || []); const danger = new Set(setup.danger || []);
  if(piece && piece.side==='white') { selectedSquare = sq; selectedPiece = piece.type; state.selectedPiece = piece.type; markSelected(sq); renderInventory(); highlightMovesForSelectedPiece(); feedback(`${PIECES[piece.type].name} נבחר. ${PIECES[piece.type].rule}`); return; }
  let ok = targets.has(sq);
  if(task.type === 'legal' && selectedSquare) ok = ok && legalFor(selectedPiece, selectedSquare, sq, Boolean(setup.enemies?.[sq]));
  if(task.type === 'reach' && selectedSquare) ok = ok && legalFor(selectedPiece, selectedSquare, sq, false);
  if(task.type === 'capture' && selectedSquare) ok = ok && Boolean(setup.enemies?.[sq]) && legalFor(selectedPiece, selectedSquare, sq, true);
  if(task.type === 'safe') ok = ok && !danger.has(sq);
  if(ok) completeTask(); else feedback('כמעט. נסו שוב: בדקו את צורת התנועה ואת השאלה של המאמן.', 'bad');
}
function completeTask(){
  const lesson = currentLesson(); const task = currentTask();
  feedback('מעולה! זה מהלך של שחמטאי שחושב לפני שהוא מזיז.', 'good');
  if(state.task < lesson.tasks.length-1) state.task += 1; else { if(!state.badges.includes(lesson.id)) state.badges.push(lesson.id); if(!state.completed.includes(lesson.id)) state.completed.push(lesson.id); if(task.setup?.certificate || state.badges.length>=lessons.length) showCertificate(); }
  saveState(); setTimeout(render, 650);
}
function showCertificate(){ $('certificate').classList.add('show'); }
function resetTask(){ selectedSquare=null; render(); }
function nextTask(){ const lesson=currentLesson(); if(state.task < lesson.tasks.length-1) state.task += 1; else { if(!state.badges.includes(lesson.id)) state.badges.push(lesson.id); const next = lessons.find(l=>l.id===lesson.id+1); if(next){ state.lesson=next.id; state.task=0; history.replaceState(null,'',`?lesson=${state.lesson}`); } else showCertificate(); } render(); }
function showHint(){ const lesson=currentLesson(); const task=currentTask(); const p=PIECES[lesson.piece]; feedback(`רמז: ${p.name} — ${p.rule} ${lesson.tips[0] || ''}`, ''); highlightMovesForSelectedPiece(); }

$('hintBtn').addEventListener('click', showHint);
$('resetBtn').addEventListener('click', resetTask);
$('nextBtn').addEventListener('click', nextTask);
$('closeCertificate').addEventListener('click', () => $('certificate').classList.remove('show'));
$('openMapBtn')?.addEventListener('click', () => {
  $('lessonDrawer')?.classList.add('open');
  $('lessonDrawer')?.setAttribute('aria-hidden', 'false');
});
document.querySelectorAll('[data-close-drawer]').forEach((el) => el.addEventListener('click', () => {
  $('lessonDrawer')?.classList.remove('open');
  $('lessonDrawer')?.setAttribute('aria-hidden', 'true');
}));
render();
