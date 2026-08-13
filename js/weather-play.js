const params = new URLSearchParams(location.search);
const lessonId = Number(params.get('lesson') || 1);
const lessons = window.WEATHER_LESSONS || [];
const sensors = window.WEATHER_SENSORS || {};
const actions = window.WEATHER_ACTIONS || {};
const conditions = window.WEATHER_CONDITIONS || {};
const bugParts = window.WEATHER_BUG_PARTS || {};
const lesson = lessons.find((item) => item.id === lessonId) || lessons[0];
let selectedCondition = null;
let selectedSensor = null;
let selectedAction = null;
let selectedBugPart = null;

function setResult(text, success = false) {
  const result = document.getElementById('result');
  result.textContent = text;
  result.style.color = success ? '#047857' : '#075985';
}

function optionOrderScore(id, type, index) {
  const raw = `${type}|${lesson.id}|${index}|${id}|weather-debug-challenge-v6`;
  return [...raw].reduce((hash, char) => ((hash * 31) + char.charCodeAt(0)) >>> 0, 7);
}

function orderedOptions(items, type) {
  const ordered = Object.entries(items)
    .map(([id, item], index) => ({ id, item, score: optionOrderScore(id, type, index) }))
    .sort((a, b) => a.score - b.score);
  if (type === 'sensor') return ordered;
  const sensorOrder = orderedOptions(sensors, 'sensor').map((option) => option.id);
  let shiftedOrder = ordered;
  const correctId = type === 'bug' ? lesson.bug.part : type === 'condition' ? lesson.condition : lesson.action;
  while (sensorOrder.indexOf(lesson.sensor) === shiftedOrder.findIndex((option) => option.id === correctId)) {
    shiftedOrder = [...shiftedOrder.slice(1), shiftedOrder[0]];
  }
  return shiftedOrder;
}

function renderOptions(containerId, items, selected, type) {
  document.getElementById(containerId).innerHTML = orderedOptions(items, type).map(({ id, item }) => {
    const iconHtml = (type === 'condition' || type === 'bug') ? '' : `<span class="option-icon">${item.icon}</span>`;
    return `
    <button type="button" class="option-card ${type}-card ${selected === id ? 'active' : ''}" data-${type}="${id}">
      ${iconHtml}
      <span>${item.label}</span>
    </button>
  `;
  }).join('');
  document.querySelectorAll(`[data-${type}]`).forEach((button) => {
    button.addEventListener('click', () => {
      if (type === 'condition') selectedCondition = button.dataset.condition;
      if (type === 'sensor') selectedSensor = button.dataset.sensor;
      if (type === 'action') selectedAction = button.dataset.action;
      if (type === 'bug') selectedBugPart = button.dataset.bug;
      renderAllOptions();
      renderRule();
      renderNextStep(false);
      setResult('');
    });
  });
}

function renderAllOptions() {
  renderOptions('condition-options', conditions, selectedCondition, 'condition');
  renderOptions('sensor-options', sensors, selectedSensor, 'sensor');
  renderOptions('action-options', actions, selectedAction, 'action');
  renderOptions('bug-options', bugParts, selectedBugPart, 'bug');
  renderBugPreview();
}

function renderRule() {
  const conditionText = selectedCondition ? conditions[selectedCondition].label : 'בחרו תנאי';
  const sensorText = selectedSensor ? `${sensors[selectedSensor].icon} ${sensors[selectedSensor].label}` : 'בחרו חיישן';
  const actionText = selectedAction ? `${actions[selectedAction].icon} ${actions[selectedAction].label}` : 'בחרו פעולה';
  document.getElementById('rule-preview').innerHTML = `
    <b>אם</b>
    <span>${conditionText}</span>
    <b>נמדד בעזרת</b>
    <span>${sensorText}</span>
    <b>אז</b>
    <span>${actionText}</span>
  `;
}

function checkAutomation() {
  if (!selectedCondition || !selectedSensor || !selectedAction || !selectedBugPart) {
    setResult('צריך לבחור תנאי, חיישן, פעולה וגם לזהות את התקלה לפני שמריצים את התחנה.');
    return;
  }
  const conditionOk = selectedCondition === lesson.condition;
  const sensorOk = selectedSensor === lesson.sensor;
  const actionOk = selectedAction === lesson.action;
  const bugOk = selectedBugPart === lesson.bug.part;
  if (conditionOk && sensorOk && actionOk && bugOk) {
    setResult(`מצוין! ${conditions[selectedCondition].label} — אז ${actions[selectedAction].label}. ${lesson.result} 🎉`, true);
    window.SisiCourseCertificate?.show({ lessons, lesson });
    renderNextStep(true);
    return;
  }
  if (!conditionOk) {
    setResult('כמעט. משפט ה־אם לא מתאים לסיפור. חפשו מה הבעיה שמתרחשת בתחנה.');
  } else if (!sensorOk) {
    setResult('התנאי נכון, אבל החיישן לא מתאים למה שצריך לזהות.');
  } else if (!actionOk) {
    setResult('התנאי והחיישן נכונים, אבל הפעולה לא פותרת את הבעיה.');
  } else if (!bugOk) {
    setResult('הכלל שבניתם נכון, אבל זיהוי התקלה של סיסי לא מתאים. בדקו איזה חלק בכלל השגוי שונה מהפתרון שלכם.');
  }
  renderNextStep(false);
}


function renderBugPreview() {
  const bug = lesson.bug;
  if (!bug) return;
  document.getElementById('bug-preview').innerHTML = `
    <b>הכלל השגוי של סיסי:</b>
    <span>אם ${conditions[bug.condition].label.replace('אם ', '')}</span>
    <b>נמדד בעזרת</b>
    <span>${sensors[bug.sensor].icon} ${sensors[bug.sensor].label}</span>
    <b>אז</b>
    <span>${actions[bug.action].icon} ${actions[bug.action].label}</span>
  `;
}

function clearAutomation() {
  selectedCondition = null;
  selectedSensor = null;
  selectedAction = null;
  selectedBugPart = null;
  renderAllOptions();
  renderRule();
  renderNextStep(false);
  setResult('');
}

function nextTarget() {
  const currentIndex = lessons.findIndex((item) => item.id === lesson.id);
  const nextLesson = lessons[currentIndex + 1];
  if (nextLesson) return { href: `weather-play.html?lesson=${nextLesson.id}`, label: `➡️ המשך לתחנה ${nextLesson.id}` };
  return { href: 'factory.html', label: '🏭 לשיעור הבא' };
}

function renderNextStep(show = false) {
  const box = document.getElementById('next-step');
  if (!box) return;
  if (!show) { box.innerHTML = ''; return; }
  const target = nextTarget();
  box.innerHTML = `<div class="next-step-note">הכלל עבד! עכשיו ממשיכים לתחנת מזג האוויר הבאה.</div><a class="btn" href="${target.href}">${target.label}</a>`;
  window.SisiSuccessDialog?.show({ message: box.querySelector('.next-step-note')?.textContent || 'כל הכבוד! אפשר להמשיך קדימה או לנסות שוב.', lessons, lesson, nextHref: target.href, nextLabel: target.label, onRepeat: () => window.location.reload() });
}

function init() {
  document.getElementById('page-title').textContent = `${lesson.emoji} ${lesson.title}`;
  document.getElementById('page-subtitle').textContent = `שיעור 8 • חיישנים ופעולות • ${lesson.concept}`;
  document.getElementById('lesson-heading').textContent = `תחנה ${lesson.id}: ${lesson.title}`;
  document.getElementById('lesson-emoji').textContent = lesson.emoji;
  document.getElementById('scene').textContent = lesson.scene;
  document.getElementById('learning-note').innerHTML = `<b>רגע למידה:</b> ${lesson.learningNote}`;
  document.getElementById('check').addEventListener('click', checkAutomation);
  document.getElementById('clear').addEventListener('click', clearAutomation);
  document.getElementById('lesson-nav').innerHTML = lessons.map((item) => `<a class="${item.id === lesson.id ? 'active' : ''}" href="weather-play.html?lesson=${item.id}">${item.id}</a>`).join('');
  renderAllOptions();
  renderRule();
  renderNextStep(false);
}

init();
