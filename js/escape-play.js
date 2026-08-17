const params = new URLSearchParams(location.search);
const lessonId = Number(params.get('lesson') || 1);
const lessons = window.ESCAPE_LESSONS || [];
const keys = window.ESCAPE_KEYS || {};
const lesson = lessons.find((item) => item.id === lessonId) || lessons[0];
let selected = [];
let selectedObjectId = null;
let selectedReason = null;

function setResult(text, success = false) {
  const result = document.getElementById('result');
  result.textContent = text;
  result.style.color = success ? '#15803d' : '#7c2d12';
}
function optionPairs() {
  const [firstRequired, secondRequired] = lesson.required;
  const distractors = lesson.distractors || [];
  const pairs = [
    lesson.required,
    [firstRequired, distractors[0]],
    [distractors[0], secondRequired],
    [distractors[0], distractors[1]],
    [firstRequired, distractors[1]],
    [distractors[1], secondRequired]
  ].filter((pair) => pair.length === 2 && pair.every(Boolean));
  const seen = new Set();
  return pairs.filter((pair) => {
    const id = [...pair].sort().join('|');
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  }).slice(0, 6).map((pair, index) => ({ id: pair.join('|'), pair, sort: (index * 5 + lesson.id * 3) % 7 }));
}
function colorValue(id) {
  if (id === 'colorBlue') return '#38bdf8';
  if (id === 'colorGreen') return '#22c55e';
  if (id === 'colorRed') return '#ef4444';
  return '#facc15';
}
function shapeName(id) {
  if (id === 'shapeCircle') return 'circle';
  if (id === 'shapeTriangle') return 'triangle';
  if (id === 'shapeStar') return 'star';
  return 'circle';
}
function keyByGroup(pair, group) { return pair.find((id) => keys[id]?.group === group); }
function keysByGroup(pair, group) { return pair.filter((id) => keys[id]?.group === group); }
function visualObject(pair, index) {
  const shapes = keysByGroup(pair, 'shape');
  const shape = shapes[0];
  const colors = keysByGroup(pair, 'color');
  const color = colors[0];
  const number = keyByGroup(pair, 'number');
  const sounds = keysByGroup(pair, 'sound');
  const sound = sounds[0];
  const shapeOneHtml = (id, compact = false) => `<span class="escape-shape ${compact ? 'escape-shape-small' : ''} escape-shape-${shapeName(id)}" style="--shape-color:${colorValue(color)}"></span>`;
  const shapeHtml = shapes.length > 1 ? `<span class="escape-shape-pair">${shapes.map((id) => shapeOneHtml(id, true)).join('')}</span>` : (shape ? shapeOneHtml(shape) : '');
  const soundOneHtml = (id, main = false) => `<span class="escape-sound ${main ? 'escape-sound-main' : ''} ${color ? 'escape-sound-colored' : ''}" ${color ? `style="--sound-color:${colorValue(color)}"` : ''}>${keys[id].icon}</span>`;
  const soundHtml = sounds.length > 1 ? `<span class="escape-sound-pair">${sounds.map((id) => soundOneHtml(id, true)).join('')}</span>` : (sound ? soundOneHtml(sound, !shape) : '');
  const numberHtml = number ? `<span class="escape-number">${keys[number].icon}</span>` : '';
  const colorDotsHtml = !shape && colors.length ? `<span class="escape-color-pair">${colors.map((id) => `<span class="escape-color-dot" style="--shape-color:${colorValue(id)}"></span>`).join('')}</span>` : '';
  const main = shapeHtml || soundHtml || colorDotsHtml || numberHtml;
  const extra = shapeHtml ? `${soundHtml}${numberHtml}` : `${numberHtml}`;
  return `<span class="escape-visual escape-float-${(index % 3) + 1}">${main}${extra}</span>`;
}
function pairLabel(pair) {
  return pair.map((id) => keys[id]?.label).filter(Boolean).join(' + ');
}
function renderOptions() {
  const options = optionPairs().sort((a,b)=>a.sort-b.sort);
  document.getElementById('key-options').innerHTML = `<div class="shape-stage" aria-label="בחרו צורה מתאימה">
    ${options.map(({ id, pair }, index) => `
      <button type="button" class="shape-choice shape-choice-${(index % 6) + 1} ${selectedObjectId === id ? 'active' : ''}" data-pair="${id}" aria-label="${pairLabel(pair)}">
        ${visualObject(pair, index)}
      </button>`).join('')}
  </div>`;
  document.querySelectorAll('[data-pair]').forEach((button) => button.addEventListener('click', () => chooseObject(button.dataset.pair)));
}
function chooseObject(id) {
  selectedObjectId = id;
  selected = id.split('|');
  selectedReason = null;
  renderAll();
}
function renderCondition() {
  const chosen = selected.length === 2 ? pairLabel(selected) : 'לחצו על הפריט שמתאים לכלל';
  document.getElementById('condition-preview').innerHTML = `<span>${lesson.conditionText}</span><b>הבחירה שלי:</b><span>${chosen}</span>`;
}
function renderReasons() {
  const options = lesson.reasonOptions || [lesson.successReason, 'כי רק תנאי אחד מספיק', 'כי הפקודה הכי יפה מנצחת'];
  document.getElementById('reason-options').innerHTML = options.map((reason) => `<button type="button" class="reason-card ${selectedReason === reason ? 'active' : ''}" data-reason="${reason}">${reason}</button>`).join('');
  document.querySelectorAll('[data-reason]').forEach((button) => button.addEventListener('click', () => { selectedReason = button.dataset.reason; renderReasons(); setResult(''); }));
}
function howToTarget() {
  const targets = {
    1: { read: 'על הדלת', choose: 'לדלת', opened: 'הדלת נפתחה' },
    2: { read: 'על התיבה', choose: 'לתיבה', opened: 'התיבה נפתחה' },
    3: { read: 'על השער', choose: 'לשער', opened: 'השער נפתח' },
    4: { read: 'על המנעול', choose: 'למנעול', opened: 'המנעול נפתח' },
    5: { read: 'על הקיר הסודי', choose: 'לקיר הסודי', opened: 'הקיר הסודי נפתח' },
    6: { read: 'על החדר', choose: 'לחדר', opened: 'החדר נפתח' },
    7: { read: 'על הדלת', choose: 'לדלת', opened: 'הדלת נפתחה' },
    8: { read: 'על החדר', choose: 'לחדר', opened: 'החדר נפתח' },
    9: { read: 'על הדלת', choose: 'לדלת', opened: 'הדלת נפתחה' },
    10: { read: 'על השער', choose: 'לשער', opened: 'השער נפתח' },
    11: { read: 'על החדר', choose: 'לחדר', opened: 'החדר נפתח' },
    12: { read: 'על שער הסיום', choose: 'לשער הסיום', opened: 'שער הסיום נפתח' }
  };
  return targets[lesson.id] || { read: 'על החדר', choose: 'לחדר', opened: 'החדר נפתח' };
}
function renderHowTo() {
  const target = howToTarget();
  const readStep = document.getElementById('how-to-read-target');
  const chooseStep = document.getElementById('how-to-choose-target');
  if (readStep) readStep.textContent = `1️⃣ קוראים מה כתוב ${target.read}`;
  if (chooseStep) chooseStep.textContent = `2️⃣ לוחצים על הפריט שמראה את שני הרמזים שמתאימים ${target.choose}`;
}
function renderAll() { renderHowTo(); renderOptions(); renderCondition(); renderReasons(); renderNextStep(false); setResult(''); }
function sameKeysInAnyOrder(first, second) {
  if (first.length !== second.length) return false;
  const firstSorted = [...first].sort();
  const secondSorted = [...second].sort();
  return firstSorted.every((id, index) => id === secondSorted[index]);
}
function checkEscape() {
  if (selected.length !== 2) { setResult('צריך ללחוץ על הפריט שמתאים לשני הרמזים.'); return; }
  const keysOk = sameKeysInAnyOrder(selected, lesson.required);
  const reasonOk = selectedReason === lesson.successReason;
  if (keysOk && reasonOk) { setResult(`נכון! ${lesson.result} 🔓`, true); renderNextStep(true); }
  else if (!keysOk) setResult('כמעט. בתנאי “וגם” שני הרמזים חייבים להתאים בדיוק למה שכתוב על הדלת.');
  else if (!selectedReason) setResult('כמעט סיימתם — עכשיו בחרו למה שני הרמזים פותחים את החדר.');
  else setResult(lesson.feedbackWrongReason || 'הרמזים נכונים. עכשיו בחרו נימוק שמסביר למה תנאי “וגם” עובד.');
}
function showHint() {
  const [a,b] = lesson.required.map((id) => `${keys[id].icon} ${keys[id].label}`);
  setResult(`רמז: חפשו פריט שמראה גם ${a} וגם ${b}.`);
  renderNextStep(false);
}
function clearChoice() { selected = []; selectedObjectId = null; selectedReason = null; renderAll(); }
function nextTarget() {
  const currentIndex = lessons.findIndex((item) => item.id === lesson.id);
  const nextLesson = lessons[currentIndex + 1];
  if (nextLesson) return { href: `escape-play.html?lesson=${nextLesson.id}`, label: `➡️ המשך לחדר ${nextLesson.id}` };
  return { href: 'finale.html', label: '🏙️ לשיעור הבא' };
}
function unlockSceneHtml(openedText) {
  if (openedText.includes('תיבה')) {
    return `<div class="escape-unlock-scene" aria-hidden="true"><span class="escape-chest"><span class="escape-chest-lid">🔓</span><span class="escape-chest-base">💎</span></span><span class="escape-unlock-spark">✨</span></div>`;
  }
  return `<div class="escape-unlock-scene" aria-hidden="true"><span class="escape-door"><span class="escape-door-panel">🔓</span></span><span class="escape-unlock-spark">✨</span></div>`;
}
function renderNextStep(show = false) {
  const box = document.getElementById('next-step');
  if (!box) return;
  if (!show) { box.innerHTML = ''; return; }
  const target = nextTarget();
  const openedText = howToTarget().opened;
  const successMessage = `${openedText}! ממשיכים לחדר הבא.`;
  box.innerHTML = unlockSceneHtml(openedText);
  window.setTimeout(() => {
    window.SisiSuccessDialog?.show({ message: successMessage, lessons, lesson, nextHref: target.href, nextLabel: target.label, onRepeat: () => window.location.reload() });
  }, 1200);
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
