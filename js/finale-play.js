const params = new URLSearchParams(location.search);
const missionId = Number(params.get('lesson') || 1);
const missions = window.FINALE_MISSIONS || [];
const actions = window.FINALE_ACTIONS || {};
const conditions = window.FINALE_CONDITIONS || {};
const mission = missions.find((item) => item.id === missionId) || missions[0];
let selectedCondition = null;
let selectedActions = [];
let selectedExplanation = null;

function setResult(text, success = false) {
  const result = document.getElementById('result');
  result.textContent = text;
  result.style.color = success ? '#15803d' : '#0f766e';
}
function actionChoices() { return [...mission.correctActions, mission.distractor].sort((a,b)=>a.localeCompare(b)); }
function renderConditions() {
  document.getElementById('condition-options').innerHTML = Object.entries(conditions).map(([id, condition]) => `
    <button type="button" class="choice-card ${selectedCondition === id ? 'active' : ''}" data-condition="${id}"><span>${condition.icon}</span><b>${condition.label}</b></button>`).join('');
  document.querySelectorAll('[data-condition]').forEach((button)=>button.addEventListener('click',()=>{ selectedCondition = button.dataset.condition; selectedExplanation = null; renderAll(false); }));
}
function renderActions() {
  const chosen = new Set(selectedActions);
  document.getElementById('action-options').innerHTML = actionChoices().map((id) => {
    const action = actions[id];
    return `<button type="button" class="choice-card ${chosen.has(id) ? 'used' : ''}" data-action="${id}" ${chosen.has(id) ? 'disabled' : ''}><span>${action.icon}</span><b>${action.label}</b></button>`;
  }).join('');
  document.querySelectorAll('[data-action]').forEach((button)=>button.addEventListener('click',()=>addAction(button.dataset.action)));
}
function addAction(id) {
  if (selectedActions.length >= 3 || selectedActions.includes(id)) return;
  selectedActions.push(id);
  selectedExplanation = null;
  renderAll(false);
}
function renderProgram() {
  const condition = selectedCondition ? conditions[selectedCondition] : null;
  const slots = [0,1,2].map((index) => {
    const id = selectedActions[index];
    const action = id ? actions[id] : null;
    return `<div class="program-step"><b>צעד ${index + 1}</b><span>${action ? action.icon : '❔'}</span><p>${action ? action.label : 'בחרו פעולה'}</p></div>`;
  }).join('');
  document.getElementById('program-preview').innerHTML = `<div class="condition-line"><b>אם</b><span>${condition ? `${condition.icon} ${condition.label}` : 'בחרו תנאי'}</span><b>אז</b></div><div class="program-grid">${slots}</div>`;
}
function renderExplanations() {
  const options = [mission.explanation, 'כי בחרנו את הפעולות הכי צבעוניות', 'כי מספיק לבחור פעולה אחת נכונה'];
  document.getElementById('explanation-options').innerHTML = options.map((text) => `<button type="button" class="reason-card ${selectedExplanation === text ? 'active' : ''}" data-explanation="${text}">${text}</button>`).join('');
  document.querySelectorAll('[data-explanation]').forEach((button)=>button.addEventListener('click',()=>{ selectedExplanation = button.dataset.explanation; renderExplanations(); setResult(''); }));
}
function renderAll(clearResult = true) {
  renderConditions(); renderActions(); renderProgram(); renderExplanations(); renderNextStep(false); if (clearResult) setResult('');
}
function checkProgram() {
  if (!selectedCondition || selectedActions.length !== 3) { setResult('צריך לבחור תנאי וגם 3 פעולות לפי סדר.'); return; }
  const conditionOk = selectedCondition === mission.condition;
  const actionsOk = selectedActions.every((id, index) => id === mission.correctActions[index]) && !selectedActions.includes(mission.distractor);
  const explanationOk = selectedExplanation === mission.explanation;
  if (conditionOk && actionsOk && explanationOk) { setResult('מצוין! בניתם תכנית עיר חכמה שעובדת 🎉', true); renderNextStep(true); }
  else if (!conditionOk) setResult('התנאי לא מתאים למשימה. חפשו את שני הרמזים שמתארים את הבעיה בעיר.');
  else if (!actionsOk) setResult('יש בעיה ברצף הפעולות או פעולה מיותרת. בדקו מה מקדם את המטרה ומה לא.');
  else setResult('התכנית טובה. עכשיו בחרו הסבר נכון שמראה שהבנתם למה היא עובדת.');
}
function showHint() {
  const condition = conditions[mission.condition];
  const first = actions[mission.correctActions[selectedActions.length] || mission.correctActions[0]];
  setResult(`רמז: התנאי הוא ${condition.icon} ${condition.label}. הפעולה הבאה: ${first.icon} ${first.label}.`);
}
function clearProgram() { selectedCondition = null; selectedActions = []; selectedExplanation = null; renderAll(); }
function nextTarget() {
  const currentIndex = missions.findIndex((item) => item.id === mission.id);
  const next = missions[currentIndex + 1];
  if (next) return { href: `finale-play.html?lesson=${next.id}`, label: `➡️ המשך למשימת שיא ${next.id}` };
  return { href: 'finale-lab.html', label: '🏙️ המשך למעבדת העיר החכמה' };
}
function renderNextStep(show = false) {
  const box = document.getElementById('next-step');
  if (!box) return;
  if (!show) { box.innerHTML = ''; return; }
  const target = nextTarget();
  box.innerHTML = `<div class="next-step-note">המשימה בעיר הצליחה! ממשיכים לאתגר הבא.</div><a class="btn" href="${target.href}">${target.label}</a>`;
}
function init() {
  document.getElementById('page-title').textContent = `${mission.emoji} ${mission.title}`;
  document.getElementById('page-subtitle').textContent = `שיעור 15 • משימת שיא בעיר חכמה • ${mission.district}`;
  document.getElementById('mission-heading').textContent = `משימת שיא ${mission.id}: ${mission.title}`;
  document.getElementById('mission-emoji').textContent = mission.emoji;
  document.getElementById('goal').textContent = mission.goal;
  document.getElementById('learning-note').innerHTML = `<b>רגע למידה:</b> ${mission.learningNote}`;
  document.getElementById('check').addEventListener('click', checkProgram);
  document.getElementById('hint').addEventListener('click', showHint);
  document.getElementById('clear').addEventListener('click', clearProgram);
  document.getElementById('lesson-nav').innerHTML = missions.map((item) => `<a class="${item.id === mission.id ? 'active' : ''}" href="finale-play.html?lesson=${item.id}">${item.id}</a>`).join('');
  renderAll();
}
init();
