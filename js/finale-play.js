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
function actionChoices() { return mission.actionOptions || [...mission.correctActions, mission.distractor].sort((a,b)=>a.localeCompare(b)); }
function conditionChoices() {
  const ids = mission.conditionOptions || Object.keys(conditions);
  return ids.map((id) => [id, conditions[id]]).filter(([, condition]) => condition);
}
function renderConditions() {
  document.getElementById('condition-options').innerHTML = conditionChoices().map(([id, condition]) => `
    <button type="button" class="choice-card ${selectedCondition === id ? 'active' : ''}" data-condition="${id}"><span>${condition.icon}</span><b>${condition.label}</b></button>`).join('');
  document.querySelectorAll('[data-condition]').forEach((button)=>button.addEventListener('click',()=>{ selectedCondition = button.dataset.condition; selectedExplanation = null; renderAll(false); }));
}
function renderActions() {
  const chosen = new Set(selectedActions);
  document.getElementById('action-options').innerHTML = actionChoices().map((id) => {
    const action = actions[id];
    return `<button type="button" class="choice-card ${chosen.has(id) ? 'used' : ''}" data-action="${id}" aria-pressed="${chosen.has(id)}"><span>${action.icon}</span><b>${action.label}</b><small>${chosen.has(id) ? 'לחצו שוב כדי למחוק' : ''}</small></button>`;
  }).join('');
  document.querySelectorAll('[data-action]').forEach((button)=>button.addEventListener('click',()=>toggleAction(button.dataset.action)));
}
function toggleAction(id) {
  if (selectedActions.includes(id)) { removeAction(id); return; }
  addAction(id);
}
function addAction(id) {
  if (selectedActions.length >= 3) return;
  selectedActions.push(id);
  selectedExplanation = null;
  renderAll(false);
}
function removeAction(id) {
  selectedActions = selectedActions.filter((actionId) => actionId !== id);
  selectedExplanation = null;
  renderAll(false);
}
function renderProgram() {
  const condition = selectedCondition ? conditions[selectedCondition] : null;
  const slots = [0,1,2].map((index) => {
    const id = selectedActions[index];
    const action = id ? actions[id] : null;
    const removeButton = action ? `<button type="button" class="remove-action" data-remove-action="${id}" aria-label="מחיקת ${action.label}">✕ למחוק</button>` : '';
    return `<div class="program-step"><b>צעד ${index + 1}</b><span>${action ? action.icon : '❔'}</span><p>${action ? action.label : 'בחרו פעולה'}</p>${removeButton}</div>`;
  }).join('');
  document.getElementById('program-preview').innerHTML = `<div class="condition-line"><b>אם</b><span>${condition ? `${condition.icon} ${condition.label}` : 'בחרו תנאי'}</span><b>אז</b></div><div class="program-grid">${slots}</div>`;
  document.querySelectorAll('[data-remove-action]').forEach((button)=>button.addEventListener('click',()=>removeAction(button.dataset.removeAction)));
}
function explanationChoices() {
  const distractorPairs = [
    ['כי בחרנו את הפעולות הכי צבעוניות', 'כי מספיק לבחור פעולה אחת נכונה'],
    ['כי התוכנית פועלת בכל מצב', 'כי הפעולה האחרונה תמיד מספיקה'],
    ['כי אין צורך לבדוק תנאי', 'כי בחרנו פעולה שנשמעת נחמדה'],
    ['כי הסדר של הפעולות לא משנה', 'כי כל פעולה בעיר מתאימה לכל בעיה'],
    ['כי הרובוט מנחש מה לעשות', 'כי המסיח עוזר לפתור את המשימה'],
    ['כי מספיק לבחור את התנאי בלי פעולות', 'כי כל התשובות בתוכנית נכונות תמיד']
  ];
  const distractors = distractorPairs[(mission.id - 1) % distractorPairs.length];
  if (mission.id % 3 === 1) return [distractors[0], mission.explanation, distractors[1]];
  if (mission.id % 3 === 2) return [distractors[0], distractors[1], mission.explanation];
  return [mission.explanation, distractors[0], distractors[1]];
}
function renderExplanations() {
  const options = explanationChoices();
  document.getElementById('explanation-options').innerHTML = options.map((text) => `<button type="button" class="reason-card ${selectedExplanation === text ? 'active' : ''}" data-explanation="${text}">${text}</button>`).join('');
  document.querySelectorAll('[data-explanation]').forEach((button)=>button.addEventListener('click',()=>{ selectedExplanation = button.dataset.explanation; renderExplanations(); setResult(''); }));
}
function renderAll(clearResult = true) {
  renderConditions(); renderActions(); renderProgram(); renderExplanations(); renderNextStep(false); if (clearResult) setResult('');
}
function checkProgram() {
  if (!selectedCondition || selectedActions.length !== 3) { setResult('צריך לבחור תנאי וגם 3 פעולות לפי סדר.'); return; }
  const conditionOk = selectedCondition === mission.condition;
  const hasDistractor = selectedActions.includes(mission.distractor);
  const hasAllCorrectActions = mission.correctActions.every((id) => selectedActions.includes(id));
  const actionsInOrder = selectedActions.every((id, index) => id === mission.correctActions[index]);
  const actionsOk = actionsInOrder && !hasDistractor;
  const explanationOk = selectedExplanation === mission.explanation;
  if (conditionOk && actionsOk && explanationOk) { setResult('מצוין! בניתם תכנית עיר חכמה שעובדת 🎉', true); renderNextStep(true); window.SisiCourseCertificate?.show({ lessons: missions, lesson: mission }); }
  else if (!conditionOk) setResult('התנאי לא מתאים למשימה. חפשו את שני הרמזים שמתארים את הבעיה בעיר.');
  else if (!actionsOk && hasAllCorrectActions && !hasDistractor) setResult('הפעולות שבחרתם מתאימות, אבל הסדר עוד לא נכון. חשבו מה צריך לקרות קודם ומה אחר כך.');
  else if (!actionsOk && hasDistractor) setResult('יש פעולה אחת שלא מתאימה למשימה. חפשו פעולה שבאמת עוזרת לפתור את הבעיה.');
  else if (!actionsOk) setResult('חסרה פעולה שמתאימה למשימה. בדקו מה סיסי צריכה לעשות כדי להגיע למטרה.');
  else setResult('התכנית טובה. עכשיו בחרו הסבר נכון שמראה שהבנתם למה היא עובדת.');
}
function showHint() {
  setResult(mission.hint || 'רמז: חפשו מצב שבו שני דברים נכונים, ואז בחרו פעולות שעוזרות בלי להוסיף פעולה מיותרת.');
}
function clearProgram() { selectedCondition = null; selectedActions = []; selectedExplanation = null; renderAll(); }
function nextTarget() {
  const currentIndex = missions.findIndex((item) => item.id === mission.id);
  const next = missions[currentIndex + 1];
  if (next) return { href: `finale-play.html?lesson=${next.id}`, label: `➡️ המשך למשימת שיא ${next.id}` };
  return { href: 'sisi.html', label: '🤖 לעמוד סיסי' };
}
function renderNextStep(show = false) {
  const box = document.getElementById('next-step');
  if (!box) return;
  if (!show) { box.innerHTML = ''; return; }
  const target = nextTarget();
  const isLastMission = missions[missions.length - 1]?.id === mission.id;
  const note = isLastMission ? 'איזה יופי! סיסי סיימה יחד איתכם את כל משימות העיר החכמה. למדתם תנאים, רצף פעולות, דיבוג והסבר לתוכנית — עכשיו קורס סיסי הושלם 🎉' : 'המשימה בעיר הצליחה! ממשיכים לאתגר הבא.';
  box.innerHTML = `<div class="next-step-note">${note}</div><a class="btn" href="${target.href}">${target.label}</a>`;
  window.SisiSuccessDialog?.show({
    badge: isLastMission ? '🏆 סיום הקורס!' : undefined,
    title: isLastMission ? 'כל הכבוד! סיימתם את כל קורס סיסי' : undefined,
    message: note,
    lessons: missions,
    lesson: mission,
    nextHref: target.href,
    nextLabel: target.label,
    onRepeat: () => window.location.reload()
  });
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
