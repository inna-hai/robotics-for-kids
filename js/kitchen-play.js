const params = new URLSearchParams(location.search);
const lessonId = Number(params.get('lesson') || 1);
const lessons = window.KITCHEN_LESSONS || [];
const lesson = lessons.find((item) => item.id === lessonId) || lessons[0];
let recipe = [];

function setResult(text, success = false) {
  const result = document.getElementById('result');
  result.textContent = text;
  result.style.color = success ? '#15803d' : '#be123c';
}

function stepData(id) {
  return lesson.steps.find((step) => step.id === id) || { id, emoji: '❓', text: id };
}

function stepText(id) {
  return stepData(id).text;
}

function stepCard(step, options = {}) {
  const number = options.number ? `<span class="step-number">${options.number}</span>` : '';
  const remove = options.removeIndex !== undefined ? `<button type="button" aria-label="הסר שלב" data-remove="${options.removeIndex}">✕</button>` : '';
  return `<div class="visual-step">${number}<span class="step-emoji">${step.emoji || '🍳'}</span><span class="step-text">${step.text}</span>${remove}</div>`;
}

function renderBank() {
  const used = new Set(recipe);
  const displaySteps = (lesson.displayOrder || lesson.steps.map((step) => step.id))
    .map((id) => lesson.steps.find((step) => step.id === id))
    .filter(Boolean);
  document.getElementById('step-bank').innerHTML = displaySteps.map((step) => `
    <button class="step-btn" type="button" data-step="${step.id}" ${used.has(step.id) ? 'disabled' : ''}>${stepCard(step)}</button>
  `).join('');
  document.querySelectorAll('[data-step]').forEach((button) => {
    button.addEventListener('click', () => {
      recipe.push(button.dataset.step);
      renderAll();
      setResult('');
    });
  });
}

function renderRecipe() {
  document.getElementById('recipe-steps').innerHTML = recipe.length
    ? recipe.map((id, index) => stepCard(stepData(id), { number: index + 1, removeIndex: index })).join('')
    : '<span class="small">עדיין אין שלבים. בחרו כרטיס מצויר מהצד השני.</span>';
  document.querySelectorAll('[data-remove]').forEach((button) => {
    button.addEventListener('click', () => {
      recipe.splice(Number(button.dataset.remove), 1);
      renderAll();
      setResult('');
    });
  });
}

function renderAll() {
  renderBank();
  renderRecipe();
}

function checkRecipe() {
  if (!recipe.length) {
    setResult('קודם צריך לבחור שלבים למתכון.');
    return;
  }
  if (recipe.length !== lesson.correctOrder.length) {
    setResult(`במתכון צריכים להיות ${lesson.correctOrder.length} שלבים, ואצלך יש ${recipe.length}.`);
    return;
  }
  const wrongIndex = recipe.findIndex((id, index) => id !== lesson.correctOrder[index]);
  if (wrongIndex === -1) {
    setResult(`טעים! האלגוריתם הצליח: ${lesson.goal} 🎉`, true);
    window.SisiCourseCertificate?.show({ lessons, lesson });
  } else {
    setResult(`כמעט. שלב ${wrongIndex + 1} לא במקום. בדקו מה צריך לקרות לפניו.`);
  }
}

function init() {
  document.getElementById('page-title').textContent = `${lesson.emoji} ${lesson.title}`;
  document.getElementById('page-subtitle').textContent = `מתכון ${lesson.id}: ${lesson.concept}`;
  document.getElementById('lesson-heading').textContent = `מתכון ${lesson.id}: ${lesson.title}`;
  document.getElementById('lesson-emoji').textContent = lesson.emoji;
  document.getElementById('mission').textContent = lesson.mission;
  document.getElementById('cooking-note').innerHTML = `<b>רגע למידה:</b> ${lesson.cookingNote}`;
  document.getElementById('goal').textContent = `מטרה: ${lesson.goal}`;
  document.getElementById('check').addEventListener('click', checkRecipe);
  document.getElementById('undo').addEventListener('click', () => { recipe.pop(); renderAll(); setResult(''); });
  document.getElementById('clear').addEventListener('click', () => { recipe = []; renderAll(); setResult(''); });
  document.getElementById('demo').addEventListener('click', () => { recipe = [...lesson.correctOrder]; renderAll(); setResult('סדר לדוגמה נטען. עכשיו בדקו את המתכון.'); });
  document.getElementById('lesson-nav').innerHTML = lessons.map((item) => `
    <a class="${item.id === lesson.id ? 'active' : ''}" href="kitchen-play.html?lesson=${item.id}">${item.id}</a>
  `).join('');
  renderAll();
}

init();
