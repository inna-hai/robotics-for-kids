const params = new URLSearchParams(location.search);
const lessonId = Number(params.get('lesson') || 1);
const lessons = window.DETECTIVE_LESSONS || [];
const lesson = lessons.find((item) => item.id === lessonId) || lessons[0];
let selectedClue = null;
let selectedRule = null;

function setResult(text, success = false) {
  const result = document.getElementById('result');
  result.textContent = text;
  result.style.color = success ? '#15803d' : '#b45309';
}

function renderClues() {
  document.getElementById('clues').innerHTML = lesson.clues.map((clue) => `
    <button type="button" class="clue ${selectedClue === clue.id ? 'active' : ''}" data-clue="${clue.id}">${clue.text}</button>
  `).join('');
  document.querySelectorAll('[data-clue]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedClue = button.dataset.clue;
      renderClues();
      setResult('');
    });
  });
}

function renderRules() {
  document.getElementById('rules').innerHTML = lesson.rules.map((rule) => `
    <button type="button" class="rule ${selectedRule === rule.id ? 'active' : ''}" data-rule="${rule.id}">${rule.text}</button>
  `).join('');
  document.querySelectorAll('[data-rule]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedRule = button.dataset.rule;
      renderRules();
      setResult('');
    });
  });
}

function renderSuspects(found = false) {
  document.getElementById('suspects').innerHTML = lesson.suspects.map((suspect, index) => `
    <span class="suspect ${found && index === 0 ? 'found' : ''}">${suspect}</span>
  `).join('');
}

function checkCase() {
  if (!selectedClue || !selectedRule) {
    setResult('צריך לבחור גם רמז וגם כלל אם-אז.');
    return;
  }
  const clue = lesson.clues.find((item) => item.id === selectedClue);
  const rule = lesson.rules.find((item) => item.id === selectedRule);
  if (clue.good && rule.good) {
    renderSuspects(true);
    setResult(`פתרתם! ${lesson.answer}`, true);
    return;
  }
  if (!clue.good && rule.good) {
    setResult('הכלל טוב, אבל הרמז שבחרתם לא באמת קשור לתעלומה. נסו רמז אחר.');
    return;
  }
  if (clue.good && !rule.good) {
    setResult('הרמז טוב, אבל כלל ה“אם-אז” לא מתאים. נסו כלל אחר.');
    return;
  }
  setResult('שניהם לא מתאימים עדיין. בלשים טובים בודקים שוב 🙂');
}

function showHint() {
  const clue = lesson.clues.find((item) => item.good);
  setResult(`רמז קטן: חפשו משהו שקשור ל־“${clue.text}”.`);
}

function clearCase() {
  selectedClue = null;
  selectedRule = null;
  renderClues();
  renderRules();
  renderSuspects(false);
  setResult('');
}

function init() {
  document.getElementById('page-title').textContent = `${lesson.emoji} ${lesson.title}`;
  document.getElementById('page-subtitle').textContent = `תיק ${lesson.id}: ${lesson.concept}`;
  document.getElementById('lesson-heading').textContent = `תיק ${lesson.id}: ${lesson.title}`;
  document.getElementById('lesson-emoji').textContent = lesson.emoji;
  document.getElementById('mission').textContent = lesson.mission;
  document.getElementById('learning-note').innerHTML = `<b>רגע למידה:</b> ${lesson.learningNote}`;
  document.getElementById('check').addEventListener('click', checkCase);
  document.getElementById('hint').addEventListener('click', showHint);
  document.getElementById('clear').addEventListener('click', clearCase);
  document.getElementById('lesson-nav').innerHTML = lessons.map((item) => `
    <a class="${item.id === lesson.id ? 'active' : ''}" href="detective-play.html?lesson=${item.id}">${item.id}</a>
  `).join('');
  renderClues();
  renderRules();
  renderSuspects(false);
}

init();
