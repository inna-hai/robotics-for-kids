const params = new URLSearchParams(location.search);
const lessonId = Number(params.get('lesson') || 1);
const lessons = window.WEATHER_LESSONS || [];
const sensors = window.WEATHER_SENSORS || {};
const actions = window.WEATHER_ACTIONS || {};
const lesson = lessons.find((item) => item.id === lessonId) || lessons[0];
let selectedSensor = null;
let selectedAction = null;

function setResult(text, success = false) {
  const result = document.getElementById('result');
  result.textContent = text;
  result.style.color = success ? '#047857' : '#075985';
}

function renderOptions(containerId, items, selected, type) {
  document.getElementById(containerId).innerHTML = Object.entries(items).map(([id, item]) => `
    <button type="button" class="option-card ${selected === id ? 'active' : ''}" data-${type}="${id}">
      <span class="option-icon">${item.icon}</span>
      <span>${item.label}</span>
    </button>
  `).join('');
  document.querySelectorAll(`[data-${type}]`).forEach((button) => {
    button.addEventListener('click', () => {
      if (type === 'sensor') selectedSensor = button.dataset.sensor;
      if (type === 'action') selectedAction = button.dataset.action;
      renderAllOptions();
      renderRule();
      renderNextStep(false);
      setResult('');
    });
  });
}

function renderAllOptions() {
  renderOptions('sensor-options', sensors, selectedSensor, 'sensor');
  renderOptions('action-options', actions, selectedAction, 'action');
}

function renderRule() {
  const sensorText = selectedSensor ? sensors[selectedSensor].label : 'בחרו חיישן';
  const actionText = selectedAction ? actions[selectedAction].label : 'בחרו פעולה';
  const sensorIcon = selectedSensor ? sensors[selectedSensor].icon : '❔';
  const actionIcon = selectedAction ? actions[selectedAction].icon : '❔';
  document.getElementById('rule-preview').innerHTML = `
    <span>${sensorIcon}</span>
    <b>אם</b>
    <span>${sensorText}</span>
    <b>אז</b>
    <span>${actionIcon} ${actionText}</span>
  `;
}

function checkAutomation() {
  if (!selectedSensor || !selectedAction) {
    setResult('צריך לבחור גם חיישן וגם פעולה לפני שמריצים את התחנה.');
    return;
  }
  const sensorOk = selectedSensor === lesson.sensor;
  const actionOk = selectedAction === lesson.action;
  if (sensorOk && actionOk) {
    setResult(`מצוין! ${lesson.condition} — אז ${actions[selectedAction].label}. ${lesson.result} 🎉`, true);
    window.SisiCourseCertificate?.show({ lessons, lesson });
    renderNextStep(true);
    return;
  }
  if (!sensorOk && !actionOk) {
    setResult('כמעט. גם החיישן וגם הפעולה לא מתאימים לסיפור. קראו שוב מה קרה בתחנה.');
  } else if (!sensorOk) {
    setResult(`הפעולה טובה, אבל החיישן לא מזהה את הבעיה. רמז: ${sensors[lesson.sensor].hint}.`);
  } else {
    setResult('החיישן נכון, אבל הפעולה לא פותרת את הבעיה. חשבו מה סיסי צריכה לעשות עכשיו.');
  }
  renderNextStep(false);
}

function showHint() {
  if (!selectedSensor) {
    setResult(`רמז לחיישן: ${sensors[lesson.sensor].hint}.`);
  } else if (selectedSensor !== lesson.sensor) {
    setResult(`נסו חיישן אחר: ${sensors[lesson.sensor].icon} ${sensors[lesson.sensor].label}.`);
  } else {
    setResult(`החיישן נכון. עכשיו חפשו פעולה שמתאימה ל־"${lesson.condition}".`);
  }
  renderNextStep(false);
}

function clearAutomation() {
  selectedSensor = null;
  selectedAction = null;
  renderAllOptions();
  renderRule();
  renderNextStep(false);
  setResult('');
}

function nextTarget() {
  const currentIndex = lessons.findIndex((item) => item.id === lesson.id);
  const nextLesson = lessons[currentIndex + 1];
  if (nextLesson) return { href: `weather-play.html?lesson=${nextLesson.id}`, label: `➡️ המשך לתחנה ${nextLesson.id}` };
  return { href: 'sisi.html', label: '🤖 חזרה לכל שיעורי סיסי' };
}

function renderNextStep(show = false) {
  const box = document.getElementById('next-step');
  if (!box) return;
  if (!show) { box.innerHTML = ''; return; }
  const target = nextTarget();
  box.innerHTML = `<div class="next-step-note">הכלל עבד! עכשיו ממשיכים לתחנת מזג האוויר הבאה.</div><a class="btn" href="${target.href}">${target.label}</a>`;
}

function init() {
  document.getElementById('page-title').textContent = `${lesson.emoji} ${lesson.title}`;
  document.getElementById('page-subtitle').textContent = `שיעור 8 • חיישנים ופעולות • ${lesson.concept}`;
  document.getElementById('lesson-heading').textContent = `תחנה ${lesson.id}: ${lesson.title}`;
  document.getElementById('lesson-emoji').textContent = lesson.emoji;
  document.getElementById('scene').textContent = lesson.scene;
  document.getElementById('learning-note').innerHTML = `<b>רגע למידה:</b> ${lesson.learningNote}`;
  document.getElementById('condition-chip').textContent = lesson.condition;
  document.getElementById('check').addEventListener('click', checkAutomation);
  document.getElementById('hint').addEventListener('click', showHint);
  document.getElementById('clear').addEventListener('click', clearAutomation);
  document.getElementById('lesson-nav').innerHTML = lessons.map((item) => `<a class="${item.id === lesson.id ? 'active' : ''}" href="weather-play.html?lesson=${item.id}">${item.id}</a>`).join('');
  renderAllOptions();
  renderRule();
  renderNextStep(false);
}

init();
