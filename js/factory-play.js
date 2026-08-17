const params = new URLSearchParams(location.search);
const lessonId = Number(params.get('lesson') || 1);
const lessons = window.FACTORY_LESSONS || [];
const actions = window.FACTORY_ACTIONS || {};
const counts = window.FACTORY_COUNTS || [];
const lesson = lessons.find((item) => item.id === lessonId) || lessons[0];
const compoundLoop = lesson.compoundLoop || null;
const loopTargets = compoundLoop ? [] : (lesson.multiLoops || [{ action: lesson.action, count: lesson.count, target: lesson.result, targetLabel: lesson.result }]);
let selectedLoops = loopTargets.map(() => ({ target: null, action: null, count: null }));
let selectedCompound = compoundLoop ? { count: null, actions: compoundLoop.actions.map(() => null) } : null;
let runningAnimation = false;

function setResult(text, success = false) {
  const result = document.getElementById('result');
  result.textContent = text;
  result.style.color = success ? '#15803d' : '#92400e';
}

function renderTaskGuide() {
  const guide = document.getElementById('task-guide');
  if (!guide) return;
  const countText = compoundLoop
    ? `מספר החזרות הוא מספר הפריטים שמופיע בסיפור: ${compoundLoop.count}.`
    : loopTargets.length > 1
      ? 'בכל לולאה בוחרים את המספר שמופיע בסיפור ליד אותה פעולה.'
      : `מספר החזרות הוא המספר שמופיע בסיפור: ${lesson.count}.`;
  guide.innerHTML = `
    <h2>איך יודעים כמה פעמים להריץ?</h2>
    <p class="guide-note">${countText}</p>
    <p class="guide-note">בחרו את הפעולה או הפעולות שמתאימות לכל פריט.</p>
  `;
}

function loopTargetLabel(target) { return target.targetLabel || target.target; }

function targetButtonList(index, selectedTarget) {
  return loopTargets.map((target) => {
    const label = loopTargetLabel(target);
    return `
      <button type="button" class="clean-target-btn ${selectedTarget === label ? 'active' : ''}" data-loop-target="${index}:${label}">
        <span>🎯</span><b>${label}</b>
      </button>
    `;
  }).join('');
}

function actionButtonList(index, selectedAction) {
  return Object.entries(actions).map(([id, action]) => `
    <button type="button" class="clean-action-btn ${selectedAction === id ? 'active' : ''}" data-loop-action="${index}:${id}">
      <span>${action.icon}</span><b>${action.label}</b>
    </button>
  `).join('');
}

function renderCompoundBuilder(actionBox) {
  actionBox.innerHTML = `<div class="compound-loop-stack">
    <div class="compound-loop-card">
      <div class="clean-loop-title">🔁 לולאה אחת עם כמה פעולות</div>
      <div class="compound-loop-note">בחרו את הפעולות ואת מספר הפעמים.</div>
      <div class="compound-loop-box">
        <div class="compound-actions-area">
          ${compoundLoop.actions.map((expectedAction, index) => `
            <section class="compound-action-slot">
              <h3>${index + 1}. ${index === 0 ? 'פעולה ראשונה' : index === 1 ? 'פעולה שנייה' : 'פעולה נוספת'}</h3>
              <p>בחרו פעולה שמתאימה למשימה</p>
              <div class="clean-options action-options-compact">${Object.entries(actions).map(([id, action]) => `
                <button type="button" class="clean-action-btn ${selectedCompound.actions[index] === id ? 'active' : ''}" data-compound-action="${index}:${id}">
                  <span>${action.icon}</span><b>${action.label}</b>
                </button>
              `).join('')}</div>
            </section>
          `).join('')}
        </div>
        <div class="compound-count-area">
          <h3>מספר הפעמים</h3>
          <p>כמה פעמים כל רצף הפעולות חוזר?</p>
          <div class="clean-options clean-count-options">${counts.map((count) => `
            <button type="button" class="clean-count-btn ${selectedCompound.count === count ? 'active' : ''}" data-compound-count="${count}">
              <span>חזור</span><b>${count}</b><span>פעמים</span>
            </button>
          `).join('')}</div>
        </div>
      </div>
      <div class="clean-loop-result">
        <span>כך הלולאה תרוץ:</span>
        <b>חזור ${selectedCompound.count || '?'} פעמים</b>
        ${selectedCompound.actions.map((id, index) => `<em>${index + 1}. ${id ? `${actions[id].icon} ${actions[id].label}` : 'בחרו פעולה'}</em>`).join('')}
      </div>
    </div>
  </div>`;
  document.querySelectorAll('[data-compound-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const [index, action] = button.dataset.compoundAction.split(':');
      selectedCompound.actions[Number(index)] = action;
      renderAll();
    });
  });
  document.querySelectorAll('[data-compound-count]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedCompound.count = Number(button.dataset.compoundCount);
      renderAll();
    });
  });
}

function renderActionOptions() {
  const actionBox = document.getElementById('action-options');
  if (compoundLoop) { renderCompoundBuilder(actionBox); return; }
  if (loopTargets.length > 1) {
    actionBox.innerHTML = `<div class="clean-loop-stack">
      ${loopTargets.map((target, index) => {
        const selectedTarget = selectedLoops[index].target;
        const selectedAction = selectedLoops[index].action;
        const selectedCount = selectedLoops[index].count;
        return `
        <div class="clean-loop-card clean-loop-${index + 1}">
          <div class="clean-loop-title">🔁 לולאה ${index + 1}</div>
          <div class="clean-loop-box multi-loop-box">
            <div class="clean-loop-part clean-target-part">
              <h3>על מה עובדים</h3>
              <div class="clean-options target-options-compact">${targetButtonList(index, selectedTarget)}</div>
            </div>
            <div class="clean-loop-part clean-actions-part">
              <h3>פעולות</h3>
              <div class="clean-options action-options-compact">${actionButtonList(index, selectedAction)}</div>
            </div>
            <div class="clean-loop-part clean-count-part">
              <h3>מספר הפעמים</h3>
              <div class="clean-options clean-count-options">${counts.map((count) => `
                <button type="button" class="clean-count-btn ${selectedCount === count ? 'active' : ''}" data-loop-count="${index}:${count}">
                  <span>חזור</span><b>${count}</b><span>פעמים</span>
                </button>
              `).join('')}</div>
            </div>
          </div>
          <div class="clean-loop-result">
            <span>מה יקרה?</span>
            <b>חזור ${selectedCount || '?'} פעמים</b>
            <em>${selectedTarget || 'בחרו על מה עובדים'} · ${selectedAction ? `${actions[selectedAction].icon} ${actions[selectedAction].label}` : 'בחרו פעולה'}</em>
          </div>
        </div>`;
      }).join('')}
    </div>`;
  } else {
    actionBox.innerHTML = Object.entries(actions).map(([id, action]) => `
      <button type="button" class="option-card ${selectedLoops[0].action === id ? 'active' : ''}" data-loop-action="0:${id}">
        <span class="option-icon">${action.icon}</span><span>${action.label}</span>
      </button>
    `).join('');
  }
  document.querySelectorAll('[data-loop-target]').forEach((button) => {
    button.addEventListener('click', () => {
      const [index, target] = button.dataset.loopTarget.split(':');
      selectedLoops[Number(index)].target = target;
      renderAll();
    });
  });
  document.querySelectorAll('[data-loop-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const [index, action] = button.dataset.loopAction.split(':');
      selectedLoops[Number(index)].action = action;
      renderAll();
    });
  });
  document.querySelectorAll('[data-loop-count]').forEach((button) => {
    button.addEventListener('click', () => {
      const [index, count] = button.dataset.loopCount.split(':');
      selectedLoops[Number(index)].count = Number(count);
      renderAll();
    });
  });
}

function renderCountOptions() {
  const panel = document.getElementById('count-panel');
  if (compoundLoop || loopTargets.length > 1) { if (panel) panel.hidden = true; return; }
  if (panel) panel.hidden = false;
  document.getElementById('count-options').innerHTML = counts.map((count) => `
    <button type="button" class="count-card ${selectedLoops[0].count === count ? 'active' : ''}" data-loop-count="0:${count}">
      <span>חזור</span><b>${count}</b><span>פעמים</span>
    </button>
  `).join('');
  document.querySelectorAll('[data-loop-count]').forEach((button) => button.addEventListener('click', () => {
    const [index, count] = button.dataset.loopCount.split(':');
    selectedLoops[Number(index)].count = Number(count);
    renderAll();
  }));
}

function renderDebugChallenge() { const panel = document.getElementById('challenge-panel'); if (panel) panel.hidden = true; }

function renderLoopPreview() {
  if (compoundLoop) {
    document.getElementById('loop-preview').innerHTML = `<div class="loop-preview-row"><b>לולאה אחת</b><span class="loop-word">חזור</span><span class="loop-count">${selectedCompound.count || '?'}</span><span class="loop-word">פעמים</span>${selectedCompound.actions.map((id, index) => `<span class="loop-action">${index + 1}. ${id ? `${actions[id].icon} ${actions[id].label}` : 'בחרו פעולה'}</span>`).join('')}</div>`;
    return;
  }
  document.getElementById('loop-preview').innerHTML = selectedLoops.map((loop, index) => {
    const action = loop.action ? actions[loop.action] : null;
    return `<div class="loop-preview-row"><b>לולאה ${index + 1}</b><span class="loop-target">${loop.target || 'בחרו על מה עובדים'}</span><span class="loop-word">חזור</span><span class="loop-count">${loop.count || '?'}</span><span class="loop-word">פעמים</span><span class="loop-action">${action ? `${action.icon} ${action.label}` : 'בחרו פעולה'}</span></div>`;
  }).join('');
}

function renderFactoryLine(animate = false) {
  let delay = 0;
  const targets = compoundLoop ? compoundLoop.actions.map((action, index) => ({ action, count: compoundLoop.count, target: `פעולה ${index + 1}: ${actions[action].label}` })) : loopTargets;
  document.getElementById('factory-line').innerHTML = targets.map((target, index) => {
    const action = actions[target.action];
    const done = compoundLoop ? (selectedCompound.count === compoundLoop.count && selectedCompound.actions[index] === target.action) : (selectedLoops[index].target === loopTargetLabel(target) && selectedLoops[index].action === target.action && selectedLoops[index].count === target.count);
    const selectedCount = compoundLoop ? selectedCompound.count : selectedLoops[index].count;
    const items = selectedCount ? Array.from({ length: selectedCount }, (_, i) => {
      const filled = done && i < target.count;
      const style = animate && filled ? ` style="animation-delay:${delay++ * 180}ms"` : '';
      return `<div class="toy ${filled ? 'done' : ''} ${animate && filled ? 'animate-in' : ''}"${style}><span>${filled ? action.icon : '—'}</span><small>${i + 1}</small></div>`;
    }).join('') : '<div class="toy pending"><span>?</span><small>בחרו מספר</small></div>';
    return `<div class="factory-task ${animate && done ? 'running' : ''}"><h3>${target.target}</h3><div class="factory-task-items">${items}</div></div>`;
  }).join('');
}

function renderAll() { renderTaskGuide(); renderActionOptions(); renderCountOptions(); renderLoopPreview(); renderFactoryLine(runningAnimation); renderDebugChallenge(); renderNextStep(false); setResult(''); }
function loopOk(loop, target) { return loop.target === loopTargetLabel(target) && loop.action === target.action && loop.count === target.count; }
function compoundOk() { return compoundLoop && selectedCompound.count === compoundLoop.count && compoundLoop.actions.every((action, index) => selectedCompound.actions[index] === action); }

function runLoop() {
  runningAnimation = false;
  if (compoundLoop) {
    const missingAction = selectedCompound.actions.findIndex((action) => !action);
    if (!selectedCompound.count) { setResult('צריך לבחור כמה פעמים הלולאה חוזרת.'); return; }
    if (missingAction !== -1) { setResult(`צריך לבחור את פעולה ${missingAction + 1} בתוך הלולאה.`); return; }
    runningAnimation = compoundOk();
    renderFactoryLine(runningAnimation);
    if (runningAnimation) { setResult(`מעולה! בניתם לולאה אחת עם כמה פעולות לפי הסדר. ${lesson.result} 🎉`, true); window.SisiCourseCertificate?.show({ lessons, lesson }); renderNextStep(true); return; }
    if (selectedCompound.count !== compoundLoop.count) { setResult(`מספר הפעמים לא מתאים. צריך לחזור ${compoundLoop.count} פעמים.`); return; }
    const wrongIndex = selectedCompound.actions.findIndex((action, index) => action !== compoundLoop.actions[index]);
    setResult(`סדר הפעולות לא נכון: פעולה ${wrongIndex + 1} צריכה להיות ${actions[compoundLoop.actions[wrongIndex]].label}.`);
    renderNextStep(false);
    return;
  }
  const missingIndex = selectedLoops.findIndex((loop) => !loop.target || !loop.action || !loop.count);
  if (missingIndex !== -1) { setResult(`צריך להשלים את כל בלוק הלולאה ${missingIndex + 1}: על מה עובדים, פעולה ומספר פעמים.`); return; }
  const wrongIndex = selectedLoops.findIndex((loop, index) => !loopOk(loop, loopTargets[index]));
  runningAnimation = wrongIndex === -1;
  renderFactoryLine(runningAnimation);
  if (wrongIndex === -1) {
    setResult(`מעולה! בניתם את כל הלולאות נכון. ${lesson.result} 🎉`, true);
    window.SisiCourseCertificate?.show({ lessons, lesson }); renderNextStep(true); return;
  }
  const loop = selectedLoops[wrongIndex]; const target = loopTargets[wrongIndex];
  if (loop.target !== loopTargetLabel(target)) setResult(`בלולאה ${wrongIndex + 1} צריך לבחור על מה עובדים: ${loopTargetLabel(target)}.`);
  else if (loop.action !== target.action && loop.count !== target.count) setResult(`בלולאה ${wrongIndex + 1} גם מספר הפעמים וגם הפעולה לא מתאימים.`);
  else if (loop.action !== target.action) setResult(`בלולאה ${wrongIndex + 1} מספר הפעמים מתאים, אבל הפעולה לא מתאימה.`);
  else if (loop.count < target.count) setResult(`בלולאה ${wrongIndex + 1} חסרות חזרות.`);
  else setResult(`בלולאה ${wrongIndex + 1} יש יותר מדי חזרות.`);
  renderNextStep(false);
}

function clearLoop() { selectedLoops = loopTargets.map(() => ({ target: null, action: null, count: null })); selectedCompound = compoundLoop ? { count: null, actions: compoundLoop.actions.map(() => null) } : null; runningAnimation = false; renderAll(); }
function nextTarget() { const currentIndex = lessons.findIndex((item) => item.id === lesson.id); const nextLesson = lessons[currentIndex + 1]; if (nextLesson) return { href: `factory-play.html?lesson=${nextLesson.id}`, label: `➡️ המשך למשימה ${nextLesson.id}` }; return { href: 'garden.html', label: '🌱 לשיעור הבא' }; }
function renderNextStep(show = false) { const box = document.getElementById('next-step'); if (!box) return; if (!show) { box.innerHTML = ''; return; } const target = nextTarget(); box.innerHTML = `<div class="next-step-note">התוכנית עבדה! ממשיכים למשימת המפעל הבאה.</div><a class="btn" href="${target.href}">${target.label}</a>`; window.SisiSuccessDialog?.show({ message: box.querySelector('.next-step-note')?.textContent || 'כל הכבוד! אפשר להמשיך קדימה או לנסות שוב.', lessons, lesson, nextHref: target.href, nextLabel: target.label, onRepeat: () => window.location.reload() }); }
function init() { document.getElementById('page-title').textContent = `${lesson.emoji} ${lesson.title}`; document.getElementById('page-subtitle').textContent = `שיעור 9 • לולאות וחזרות • ${lesson.concept}`; document.getElementById('lesson-heading').textContent = `משימת מפעל ${lesson.id}: ${lesson.title}`; document.getElementById('lesson-emoji').textContent = lesson.emoji; document.getElementById('story').textContent = lesson.story; document.getElementById('learning-note').innerHTML = `<b>רגע למידה:</b> ${lesson.learningNote}`; document.getElementById('current-mission-badge').textContent = `משימה ${lesson.id} מתוך ${lessons.length}`; document.getElementById('check').addEventListener('click', runLoop); document.getElementById('clear').addEventListener('click', clearLoop); document.getElementById('lesson-nav').innerHTML = lessons.map((item) => `<a class="${item.id === lesson.id ? 'active' : ''}" href="factory-play.html?lesson=${item.id}">${item.id}</a>`).join(''); renderAll(); }
init();
