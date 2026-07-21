const params = new URLSearchParams(location.search);
const lessonId = Number(params.get('lesson') || 1);
const lessons = window.PARK_LESSONS || [];
const controls = window.PARK_CONTROLS || {};
const settings = window.PARK_SETTINGS || {};
const lesson = lessons.find((item) => item.id === lessonId) || lessons[0];
let selectedControl = null;
let selectedSetting = null;

function setResult(text, success = false) {
  const result = document.getElementById('result');
  result.textContent = text;
  result.style.color = success ? '#15803d' : '#7e22ce';
}

function renderOptions(containerId, items, selected, type) {
  document.getElementById(containerId).innerHTML = Object.entries(items).map(([id, item]) => `
    <button type="button" class="option-card ${selected === id ? 'active' : ''}" data-${type}="${id}">
      <span class="option-icon">${item.icon}</span><span>${item.label}</span>
    </button>
  `).join('');
  document.querySelectorAll(`[data-${type}]`).forEach((button) => {
    button.addEventListener('click', () => {
      if (type === 'control') selectedControl = button.dataset.control;
      if (type === 'setting') selectedSetting = button.dataset.setting;
      renderAll();
    });
  });
}

function renderCommandPreview() {
  const control = selectedControl ? controls[selectedControl] : null;
  const setting = selectedSetting ? settings[selectedSetting] : null;
  document.getElementById('command-preview').innerHTML = `
    <span>${control ? control.icon : '🎛️'}</span>
    <b>הפעל</b>
    <span>${control ? control.label : 'בחרו מתקן'}</span>
    <b>במצב</b>
    <span>${setting ? `${setting.icon} ${setting.label}` : 'בחרו הגדרה'}</span>
  `;
}

function renderRideStage() {
  const control = selectedControl ? controls[selectedControl] : controls[lesson.control];
  const setting = selectedSetting ? settings[selectedSetting] : null;
  const levelClass = selectedSetting || 'empty';
  document.getElementById('ride-stage').innerHTML = `
    <div class="ride ${levelClass}">
      <div class="ride-icon">${control.icon}</div>
      <div class="ride-label">${control.label}</div>
      <div class="ride-setting">${setting ? setting.label : 'עוד לא נבחרה הגדרה'}</div>
    </div>
  `;
}

function renderAll() {
  renderOptions('control-options', controls, selectedControl, 'control');
  renderOptions('setting-options', settings, selectedSetting, 'setting');
  renderCommandPreview();
  renderRideStage();
  renderNextStep(false);
  setResult('');
}

function runCommand() {
  if (!selectedControl || !selectedSetting) {
    setResult('צריך לבחור גם מתקן וגם הגדרה.');
    return;
  }
  const controlOk = selectedControl === lesson.control;
  const settingOk = selectedSetting === lesson.setting;
  if (controlOk && settingOk) {
    setResult(`מצוין! ${lesson.commandText}. ${lesson.result} 🎉`, true);
    window.SisiCourseCertificate?.show({ lessons, lesson });
    renderNextStep(true);
    return;
  }
  if (!controlOk && !settingOk) {
    setResult('כמעט. גם המתקן וגם ההגדרה לא מתאימים לסיפור.');
  } else if (!controlOk) {
    setResult('ההגדרה מתאימה, אבל צריך לבחור את המתקן הנכון בלונה פארק.');
  } else {
    setResult('המתקן נכון, אבל ההגדרה לא מתאימה לצורך של הילדים.');
  }
  renderNextStep(false);
}

function showHint() {
  if (!selectedControl) {
    setResult(`רמז: המתקן הוא ${controls[lesson.control].icon} ${controls[lesson.control].label}.`);
  } else if (selectedControl !== lesson.control) {
    setResult(`נסו לבחור את ${controls[lesson.control].icon} ${controls[lesson.control].label}.`);
  } else {
    setResult(`המתקן נכון. ההגדרה המתאימה היא ${settings[lesson.setting].icon} ${settings[lesson.setting].label}.`);
  }
  renderNextStep(false);
}

function clearCommand() {
  selectedControl = null;
  selectedSetting = null;
  renderAll();
}

function nextTarget() {
  const currentIndex = lessons.findIndex((item) => item.id === lesson.id);
  const nextLesson = lessons[currentIndex + 1];
  if (nextLesson) return { href: `park-play.html?lesson=${nextLesson.id}`, label: `➡️ המשך למתקן ${nextLesson.id}` };
  return { href: 'park-lab.html', label: '🎡 המשך למעבדת המתקנים' };
}

function renderNextStep(show = false) {
  const box = document.getElementById('next-step');
  if (!box) return;
  if (!show) { box.innerHTML = ''; return; }
  const target = nextTarget();
  box.innerHTML = `<div class="next-step-note">המתקן הוגדר נכון! ממשיכים למתקן הבא בלונה פארק.</div><a class="btn" href="${target.href}">${target.label}</a>`;
}

function init() {
  document.getElementById('page-title').textContent = `${lesson.emoji} ${lesson.title}`;
  document.getElementById('page-subtitle').textContent = `שיעור 11 • פקודה עם הגדרה • ${lesson.concept}`;
  document.getElementById('lesson-heading').textContent = `מתקן ${lesson.id}: ${lesson.title}`;
  document.getElementById('lesson-emoji').textContent = lesson.emoji;
  document.getElementById('story').textContent = lesson.story;
  document.getElementById('learning-note').innerHTML = `<b>רגע למידה:</b> ${lesson.learningNote}`;
  document.getElementById('goal-chip').textContent = lesson.commandText;
  document.getElementById('check').addEventListener('click', runCommand);
  document.getElementById('hint').addEventListener('click', showHint);
  document.getElementById('clear').addEventListener('click', clearCommand);
  document.getElementById('lesson-nav').innerHTML = lessons.map((item) => `<a class="${item.id === lesson.id ? 'active' : ''}" href="park-play.html?lesson=${item.id}">${item.id}</a>`).join('');
  renderAll();
}

init();
