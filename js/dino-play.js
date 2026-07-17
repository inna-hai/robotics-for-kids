const params = new URLSearchParams(location.search);
const lessonId = Number(params.get('lesson') || 1);
const lessons = window.DINO_LESSONS || [];
const zones = window.DINO_ZONES || {};
const lesson = lessons.find((item) => item.id === lessonId) || lessons[0];
let selectedZone = null;

function setResult(text, success = false) {
  const result = document.getElementById('result');
  result.textContent = text;
  result.style.color = success ? '#15803d' : '#365314';
}

function renderZones() {
  document.getElementById('zones').innerHTML = Object.entries(zones).map(([id, zone]) => `
    <button type="button" class="zone-btn ${selectedZone === id ? 'active' : ''}" data-zone="${id}">
      <span class="zone-icon">${zone.icon}</span>${zone.title}
    </button>
  `).join('');
  document.querySelectorAll('[data-zone]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedZone = button.dataset.zone;
      renderZones();
      setResult('');
    });
  });
}

function checkClassification() {
  if (!selectedZone) {
    setResult('צריך לבחור אזור בפארק לפני הבדיקה.');
    return;
  }
  if (selectedZone === lesson.dino.answer) {
    setResult(`נכון! ${lesson.dino.name} שייך/ת לאזור: ${zones[selectedZone].title} 🎉`, true);
  } else {
    setResult(`כמעט. בדקו שוב את המאפיינים: ${lesson.dino.facts.join(' | ')}`);
  }
}

function showHint() {
  const answerZone = zones[lesson.dino.answer];
  setResult(`רמז: ${answerZone.hint}`);
}

function clearSelection() {
  selectedZone = null;
  renderZones();
  setResult('');
}

function init() {
  document.getElementById('page-title').textContent = `${lesson.emoji} ${lesson.title}`;
  document.getElementById('page-subtitle').textContent = `משימה ${lesson.id}: ${lesson.concept}`;
  document.getElementById('lesson-heading').textContent = `משימה ${lesson.id}: ${lesson.title}`;
  document.getElementById('lesson-emoji').textContent = lesson.emoji;
  document.getElementById('mission').textContent = lesson.mission;
  document.getElementById('learning-note').innerHTML = `<b>רגע למידה:</b> ${lesson.learningNote}`;
  document.getElementById('dino-visual').textContent = lesson.dino.icon;
  document.getElementById('dino-name').textContent = lesson.dino.name;
  document.getElementById('facts').innerHTML = lesson.dino.facts.map((fact) => `<span class="fact-chip">${fact}</span>`).join('');
  document.getElementById('check').addEventListener('click', checkClassification);
  document.getElementById('hint').addEventListener('click', showHint);
  document.getElementById('clear').addEventListener('click', clearSelection);
  document.getElementById('lesson-nav').innerHTML = lessons.map((item) => `
    <a class="${item.id === lesson.id ? 'active' : ''}" href="dino-play.html?lesson=${item.id}">${item.id}</a>
  `).join('');
  renderZones();
}

init();
