const params = new URLSearchParams(location.search);
const lessonId = Number(params.get('lesson') || 1);
const lessons = window.CINEMA_LESSONS || [];
const lesson = lessons.find((item) => item.id === lessonId) || lessons[0];
let selectedOrder = [];
let selectedReason = null;

function setResult(text, success = false) {
  const result = document.getElementById('result');
  result.textContent = text;
  result.style.color = success ? '#15803d' : '#9f1239';
}
function commandEntries() {
  return Object.entries(lesson.commands).map(([id, command], index) => ({ id, command, sort: (index * 7 + lesson.id * 3) % 5 })).sort((a,b)=>a.sort-b.sort);
}
function renderCommandBank() {
  const chosen = new Set(selectedOrder);
  document.getElementById('scene-bank').innerHTML = commandEntries().map(({id, command}) => `
    <button type="button" class="scene-card ${chosen.has(id) ? 'used' : ''}" data-command="${id}" ${chosen.has(id) ? 'disabled' : ''}>
      <span class="scene-icon">${command.icon}</span><span>${command.text}</span>
    </button>`).join('');
  document.querySelectorAll('[data-command]').forEach((button)=>button.addEventListener('click',()=>addCommand(button.dataset.command)));
}
function renderTimeline() {
  const labels = ['פקודה 1', 'פקודה 2', 'פקודה 3'];
  document.getElementById('timeline').innerHTML = [0,1,2].map((index) => {
    const id = selectedOrder[index];
    const command = id ? lesson.commands[id] : null;
    return `<div class="timeline-slot"><b>${labels[index]}</b><span>${command ? command.icon : '❔'}</span><p>${command ? command.text : 'בחרו פקודה'}</p></div>`;
  }).join('');
}
function addCommand(id) {
  if (selectedOrder.length >= 3 || selectedOrder.includes(id)) return;
  selectedOrder.push(id);
  renderAll(false);
}
function renderReasons() {
  const options = lesson.correctOrder.map((id) => lesson.commands[id].reason).concat([lesson.commands[lesson.distractor].reason]);
  document.getElementById('reason-options').innerHTML = options.map((reason) => `
    <button type="button" class="reason-card ${selectedReason === reason ? 'active' : ''}" data-reason="${reason}">${reason}</button>
  `).join('');
  document.querySelectorAll('[data-reason]').forEach((button)=>button.addEventListener('click',()=>{ selectedReason = button.dataset.reason; renderReasons(); setResult(''); }));
}
function renderAll(clearReason = true) {
  if (clearReason) selectedReason = null;
  renderCommandBank(); renderTimeline(); renderReasons(); renderNextStep(false); setResult('');
}
function checkMovie() {
  if (selectedOrder.length < 3) { setResult('צריך לבחור 3 פקודות לאלגוריתם.'); return; }
  const orderOk = selectedOrder.every((id, index) => id === lesson.correctOrder[index]);
  const noDistractor = !selectedOrder.includes(lesson.distractor);
  const reasonOk = selectedReason && selectedReason !== lesson.commands[lesson.distractor].reason;
  if (orderOk && noDistractor && reasonOk) { setResult('מעולה! בניתם אלגוריתם רובוטי שמגיע למטרה 🎬🤖', true); window.SisiCourseCertificate?.show({ lessons, lesson }); renderNextStep(true); }
  else if (!noDistractor) setResult('יש פקודה מיותרת באלגוריתם. חפשו פקודה שלא מקדמת את המטרה.');
  else if (!orderOk) setResult('הפקודות טובות, אבל הסדר לא נכון. חשבו מה חייב לקרות קודם.');
  else setResult('הסדר נכון — עכשיו בחרו נימוק שמסביר למה האלגוריתם עובד.');
}
function showHint() {
  const nextId = lesson.correctOrder[selectedOrder.length] || lesson.correctOrder[0];
  const command = lesson.commands[nextId];
  setResult(`רמז: הפקודה הבאה שכדאי לבחור היא ${command.icon} ${command.text}`);
  renderNextStep(false);
}
function clearTimeline() { selectedOrder = []; renderAll(true); }
function nextTarget() {
  const currentIndex = lessons.findIndex((item) => item.id === lesson.id);
  const nextLesson = lessons[currentIndex + 1];
  if (nextLesson) return { href: `cinema-play.html?lesson=${nextLesson.id}`, label: `➡️ המשך לאלגוריתם ${nextLesson.id}` };
  return { href: 'cinema-lab.html', label: '🎬 המשך למעבדת הבימוי הרובוטי' };
}
function renderNextStep(show = false) {
  const box = document.getElementById('next-step');
  if (!box) return;
  if (!show) { box.innerHTML = ''; return; }
  const target = nextTarget();
  box.innerHTML = `<div class="next-step-note">האלגוריתם צולם ועבד! ממשיכים למשימה הבאה.</div><a class="btn" href="${target.href}">${target.label}</a>`;
}
function init() {
  document.getElementById('page-title').textContent = `${lesson.emoji} ${lesson.title}`;
  document.getElementById('page-subtitle').textContent = `שיעור 13 • אלגוריתם רובוטי מצולם • ${lesson.concept}`;
  document.getElementById('lesson-heading').textContent = `משימת בימוי ${lesson.id}: ${lesson.title}`;
  document.getElementById('lesson-emoji').textContent = lesson.emoji;
  document.getElementById('story').textContent = lesson.story;
  document.getElementById('goal').textContent = lesson.goal;
  document.getElementById('learning-note').innerHTML = `<b>רגע למידה:</b> ${lesson.learningNote}`;
  document.getElementById('check').addEventListener('click', checkMovie);
  document.getElementById('hint').addEventListener('click', showHint);
  document.getElementById('clear').addEventListener('click', clearTimeline);
  document.getElementById('lesson-nav').innerHTML = lessons.map((item) => `<a class="${item.id === lesson.id ? 'active' : ''}" href="cinema-play.html?lesson=${item.id}">${item.id}</a>`).join('');
  renderAll(true);
}
init();
