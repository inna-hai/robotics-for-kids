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
function expectedCommandCount() {
  return lesson.correctOrder.length;
}
function renderCommandBankInstructions() {
  const instructions = document.getElementById('command-bank-instructions');
  if (!instructions) return;
  const correctCount = expectedCommandCount();
  const totalCount = Object.keys(lesson.commands).length;
  instructions.textContent = `בחרו ${correctCount} פקודות מתוך ${totalCount}. אחת הפקודות מיותרת ולא מקדמת את המטרה.`;
}
function renderTimeline() {
  const labels = Array.from({ length: expectedCommandCount() }, (_, index) => `פקודה ${index + 1}`);
  document.getElementById('timeline').innerHTML = labels.map((label, index) => {
    const id = selectedOrder[index];
    const command = id ? lesson.commands[id] : null;
    return `<div class="timeline-slot ${command ? 'filled' : ''}"><b>${labels[index]}</b><span>${command ? command.icon : '❔'}</span><p>${command ? command.text : 'בחרו פקודה'}</p>${command ? `<button type="button" class="remove-command" data-remove-index="${index}" aria-label="מחיקת ${command.text}">✕ למחוק</button>` : ''}</div>`;
  }).join('');
  document.querySelectorAll('[data-remove-index]').forEach((button) => button.addEventListener('click', () => removeCommand(Number(button.dataset.removeIndex))));
}
function addCommand(id) {
  if (selectedOrder.length >= expectedCommandCount() || selectedOrder.includes(id)) return;
  selectedOrder.push(id);
  renderAll(false);
}
function removeCommand(index) {
  selectedOrder.splice(index, 1);
  selectedReason = null;
  renderAll(false);
}
function correctReason() {
  return lesson.correctReason || 'כי שלוש הפקודות מסודרות לפי הסדר שמוביל למטרה, בלי פקודה מיותרת.';
}
function reasonOptions() {
  const options = [
    correctReason(),
    'כי כל פקודה נחמדה יכולה להיות חלק מהאלגוריתם.',
    'כי מספיק לבחור שלוש פקודות, גם אם הסדר לא מדויק.',
    lesson.commands[lesson.distractor].reason
  ];
  return options.map((reason, index) => ({ reason, sort: (index * 5 + lesson.id * 2) % 7 })).sort((a, b) => a.sort - b.sort).map((item) => item.reason);
}
function renderReasons() {
  document.getElementById('reason-options').innerHTML = reasonOptions().map((reason) => `
    <button type="button" class="reason-card ${selectedReason === reason ? 'active' : ''}" data-reason="${reason}">${reason}</button>
  `).join('');
  document.querySelectorAll('[data-reason]').forEach((button)=>button.addEventListener('click',()=>{ selectedReason = button.dataset.reason; renderReasons(); setResult(''); }));
}
function renderAll(clearReason = true) {
  if (clearReason) selectedReason = null;
  renderCommandBankInstructions(); renderCommandBank(); renderTimeline(); renderReasons(); renderNextStep(false); setResult('');
}
function checkMovie() {
  if (selectedOrder.length < expectedCommandCount()) { setResult(`צריך לבחור ${expectedCommandCount()} פקודות לאלגוריתם.`); return; }
  const orderOk = selectedOrder.every((id, index) => id === lesson.correctOrder[index]);
  const noDistractor = !selectedOrder.includes(lesson.distractor);
  const reasonOk = selectedReason === correctReason();
  if (orderOk && noDistractor && reasonOk) { setResult('מעולה! בניתם אלגוריתם רובוטי שמגיע למטרה 🎬🤖', true); window.SisiCourseCertificate?.show({ lessons, lesson }); renderNextStep(true); }
  else if (!noDistractor) setResult('יש פקודה מיותרת באלגוריתם. חפשו פקודה שלא מקדמת את המטרה.');
  else if (!orderOk) setResult('הפקודות טובות, אבל הסדר לא נכון. חשבו מה חייב לקרות קודם.');
  else setResult('הסדר נכון — עכשיו בחרו נימוק שמסביר למה האלגוריתם עובד.');
}
function showHint() {
  const defaultHints = [
    'רמז: התחילו בפעולה שמכינה את הדרך למטרה. חפשו מה חייב לקרות לפני הכול.',
    'רמז: עכשיו חפשו פעולה שממשיכה את מה שכבר התחלתם, בלי לקפוץ ישר לסוף.',
    'רמז: לסיום בחרו פעולה שמשלימה את המטרה, אחרי שההכנות כבר נעשו.'
  ];
  const hints = lesson.hints || defaultHints;
  const expectedCount = expectedCommandCount();
  const hintIndex = Math.floor((selectedOrder.length / Math.max(expectedCount, 1)) * hints.length);
  setResult(hints[Math.min(hintIndex, hints.length - 1)]);
  renderNextStep(false);
}
function clearTimeline() { selectedOrder = []; renderAll(true); }
function nextTarget() {
  const currentIndex = lessons.findIndex((item) => item.id === lesson.id);
  const nextLesson = lessons[currentIndex + 1];
  if (nextLesson) return { href: `cinema-play.html?lesson=${nextLesson.id}`, label: `➡️ המשך לאלגוריתם ${nextLesson.id}` };
  return { href: 'escape.html', label: '🔐 לשיעור הבא' };
}
function renderNextStep(show = false) {
  const box = document.getElementById('next-step');
  if (!box) return;
  if (!show) { box.innerHTML = ''; return; }
  const target = nextTarget();
  box.innerHTML = `<div class="next-step-note">האלגוריתם צולם ועבד! ממשיכים למשימה הבאה.</div><a class="btn" href="${target.href}">${target.label}</a>`;
  window.SisiSuccessDialog?.show({ message: box.querySelector('.next-step-note')?.textContent || 'כל הכבוד! אפשר להמשיך קדימה או לנסות שוב.', lessons, lesson, nextHref: target.href, nextLabel: target.label, onRepeat: () => window.location.reload() });
}
function init() {
  document.getElementById('page-title').textContent = `${lesson.emoji} ${lesson.title}`;
  document.getElementById('page-subtitle').textContent = `שיעור 13 • אלגוריתם רובוטי מצולם • ${lesson.concept}`;
  document.getElementById('lesson-heading').textContent = `משימת בימוי ${lesson.id}: ${lesson.title}`;
  document.getElementById('lesson-emoji').textContent = lesson.emoji;
  document.getElementById('story').textContent = lesson.story;
  document.getElementById('learning-note').innerHTML = `<b>רגע למידה:</b> ${lesson.learningNote}`;
  document.getElementById('check').addEventListener('click', checkMovie);
  document.getElementById('hint').addEventListener('click', showHint);
  document.getElementById('clear').addEventListener('click', clearTimeline);
  document.getElementById('lesson-nav').innerHTML = lessons.map((item) => `<a class="${item.id === lesson.id ? 'active' : ''}" href="cinema-play.html?lesson=${item.id}">${item.id}</a>`).join('');
  renderAll(true);
}
init();
