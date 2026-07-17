const params = new URLSearchParams(location.search);
const lessonId = Number(params.get('lesson') || 1);
const lessons = window.ESCAPE_LESSONS || [];
const keys = window.ESCAPE_KEYS || {};
const lesson = lessons.find((item) => item.id === lessonId) || lessons[0];
let selected = [];
let selectedReason = null;

function setResult(text, success = false) {
  const result = document.getElementById('result');
  result.textContent = text;
  result.style.color = success ? '#15803d' : '#7c2d12';
}
function optionIds() { return [...lesson.required, ...lesson.distractors].sort((a,b)=>a.localeCompare(b)); }
function renderOptions() {
  document.getElementById('key-options').innerHTML = optionIds().map((id) => {
    const key = keys[id];
    return `<button type="button" class="key-card ${selected.includes(id) ? 'active' : ''}" data-key="${id}"><span>${key.icon}</span><b>${key.label}</b></button>`;
  }).join('');
  document.querySelectorAll('[data-key]').forEach((button) => button.addEventListener('click', () => toggleKey(button.dataset.key)));
}
function toggleKey(id) {
  if (selected.includes(id)) selected = selected.filter((item) => item !== id);
  else if (selected.length < 2) selected.push(id);
  else selected = [selected[1], id];
  selectedReason = null;
  renderAll();
}
function renderCondition() {
  const chosen = selected.map((id) => `${keys[id].icon} ${keys[id].label}`).join(' וגם ') || 'בחרו שני רמזים';
  document.getElementById('condition-preview').innerHTML = `<span>${lesson.conditionText}</span><b>הבחירה שלי:</b><span>${chosen}</span>`;
}
function renderReasons() {
  const options = lesson.reasonOptions || [lesson.successReason, 'כי רק תנאי אחד מספיק', 'כי הפקודה הכי יפה מנצחת'];
  document.getElementById('reason-options').innerHTML = options.map((reason) => `<button type="button" class="reason-card ${selectedReason === reason ? 'active' : ''}" data-reason="${reason}">${reason}</button>`).join('');
  document.querySelectorAll('[data-reason]').forEach((button) => button.addEventListener('click', () => { selectedReason = button.dataset.reason; renderReasons(); setResult(''); }));
}
function renderAll() { renderOptions(); renderCondition(); renderReasons(); renderNextStep(false); setResult(''); }
function checkEscape() {
  if (selected.length !== 2) { setResult('צריך לבחור בדיוק שני רמזים.'); return; }
  const required = new Set(lesson.required);
  const selectedSet = new Set(selected);
  const keysOk = lesson.required.every((id) => selectedSet.has(id)) && selected.length === required.size;
  const reasonOk = selectedReason === lesson.successReason;
  if (keysOk && reasonOk) { setResult(`נכון! ${lesson.result} 🔓`, true); window.SisiCourseCertificate?.show({ lessons, lesson }); renderNextStep(true); }
  else if (!keysOk) setResult('כמעט. בתנאי “וגם” שני הרמזים חייבים להתאים בדיוק למה שכתוב על הדלת.');
  else setResult(lesson.feedbackWrongReason || 'הרמזים נכונים. עכשיו בחרו נימוק שמסביר למה תנאי “וגם” עובד.');
}
function showHint() {
  const [a,b] = lesson.required.map((id) => `${keys[id].icon} ${keys[id].label}`);
  setResult(`רמז: צריך גם ${a} וגם ${b}.`);
  renderNextStep(false);
}
function clearChoice() { selected = []; selectedReason = null; renderAll(); }
function nextTarget() {
  const currentIndex = lessons.findIndex((item) => item.id === lesson.id);
  const nextLesson = lessons[currentIndex + 1];
  if (nextLesson) return { href: `escape-play.html?lesson=${nextLesson.id}`, label: `➡️ המשך לחדר ${nextLesson.id}` };
  return { href: 'escape-lab.html', label: '🔐 המשך למעבדת חדר הבריחה' };
}
function renderNextStep(show = false) {
  const box = document.getElementById('next-step');
  if (!box) return;
  if (!show) { box.innerHTML = ''; return; }
  const target = nextTarget();
  box.innerHTML = `<div class="next-step-note">הדלת נפתחה! ממשיכים לחדר הבא.</div><a class="btn" href="${target.href}">${target.label}</a>`;
}
function init() {
  document.getElementById('page-title').textContent = `${lesson.emoji} ${lesson.title}`;
  document.getElementById('page-subtitle').textContent = `שיעור 14 • תנאי וגם • ${lesson.concept}`;
  document.getElementById('lesson-heading').textContent = `חדר ${lesson.id}: ${lesson.title}`;
  document.getElementById('lesson-emoji').textContent = lesson.emoji;
  document.getElementById('story').textContent = lesson.story;
  document.getElementById('condition-chip').textContent = lesson.conditionText;
  document.getElementById('learning-note').innerHTML = `<b>רגע למידה:</b> ${lesson.learningNote}`;
  document.getElementById('check').addEventListener('click', checkEscape);
  document.getElementById('hint').addEventListener('click', showHint);
  document.getElementById('clear').addEventListener('click', clearChoice);
  document.getElementById('lesson-nav').innerHTML = lessons.map((item) => `<a class="${item.id === lesson.id ? 'active' : ''}" href="escape-play.html?lesson=${item.id}">${item.id}</a>`).join('');
  renderAll();
}
init();
