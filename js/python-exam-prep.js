(() => {
  'use strict';

  const missions = window.PYTHON_EXAM_PREP_MISSIONS || [];
  const STORAGE_KEY = 'python-exam-prep-v1';
  const COURSE_ID = 'python-exam-prep';
  const MAX_OUTPUT_CHARS = 8000;
  let isRunning = false;
  const totalPoints = missions.flatMap(mission => mission.challenges).reduce((sum, challenge) => sum + (challenge.points || 0), 0);

  const elements = {
    missionNav: document.getElementById('missionNav'),
    missionBadge: document.getElementById('missionBadge'),
    missionKicker: document.getElementById('missionKicker'),
    missionTitle: document.getElementById('missionTitle'),
    missionStory: document.getElementById('missionStory'),
    conceptPanel: document.getElementById('conceptPanel'),
    challengeCounter: document.getElementById('challengeCounter'),
    challengeTitle: document.getElementById('challengeTitle'),
    challengePoints: document.getElementById('challengePoints'),
    challengePrompt: document.getElementById('challengePrompt'),
    guideStage: document.getElementById('guideStage'),
    guideIdea: document.getElementById('guideIdea'),
    guideTerms: document.getElementById('guideTerms'),
    guideExample: document.getElementById('guideExample'),
    guideExampleCode: document.getElementById('guideExampleCode'),
    guideExampleExplanation: document.getElementById('guideExampleExplanation'),
    guideSteps: document.getElementById('guideSteps'),
    inputStrip: document.getElementById('inputStrip'),
    inputPreview: document.getElementById('inputPreview'),
    predictionPanel: document.getElementById('predictionPanel'),
    predictionInput: document.getElementById('predictionInput'),
    checkPredictionBtn: document.getElementById('checkPredictionBtn'),
    codeEditor: document.getElementById('codeEditor'),
    codeOutput: document.getElementById('codeOutput'),
    feedbackPanel: document.getElementById('feedbackPanel'),
    engineStatus: document.getElementById('engineStatus'),
    turtleStage: document.getElementById('turtleStage'),
    turtleCanvas: document.getElementById('turtleCanvas'),
    runCodeBtn: document.getElementById('runCodeBtn'),
    resetCodeBtn: document.getElementById('resetCodeBtn'),
    hintBtn: document.getElementById('hintBtn'),
    prevChallengeBtn: document.getElementById('prevChallengeBtn'),
    nextChallengeBtn: document.getElementById('nextChallengeBtn'),
    progressText: document.getElementById('progressText'),
    progressBar: document.getElementById('progressBar'),
  };

  function defaultState() {
    return { missionIndex: 0, challengeIndex: 0, completed: {}, drafts: {}, hints: {}, predictions: {} };
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!saved || typeof saved !== 'object') return defaultState();
      return { ...defaultState(), ...saved };
    } catch (_) {
      return defaultState();
    }
  }

  let state = loadState();
  state.missionIndex = Math.min(Math.max(Number(state.missionIndex) || 0, 0), Math.max(missions.length - 1, 0));
  const restoredMission = missions[state.missionIndex];
  state.challengeIndex = Math.min(
    Math.max(Number(state.challengeIndex) || 0, 0),
    Math.max((restoredMission?.challenges.length || 1) - 1, 0),
  );

  function challengeKey(mission, challenge) {
    return `${mission.id}:${challenge.id}`;
  }

  function missionIsComplete(mission) {
    return mission.challenges.every(challenge => state.completed[challengeKey(mission, challenge)]);
  }

  function completedPoints() {
    return missions.flatMap(mission => mission.challenges)
      .filter(challenge => state.completed[challengeKey(missions.find(item => item.challenges.includes(challenge)), challenge)])
      .reduce((sum, challenge) => sum + (challenge.points || 0), 0);
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_) {
      // The course remains usable when private browsing blocks storage.
    }
  }

  function createMissionButton(mission, index) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'mission-button';
    button.dataset.mission = String(index);
    button.setAttribute('aria-current', index === state.missionIndex ? 'step' : 'false');
    if (missionIsComplete(mission)) button.classList.add('is-complete');

    const badge = document.createElement('span');
    badge.className = 'mission-button-badge';
    badge.textContent = missionIsComplete(mission) ? '✓' : mission.badge;
    const copy = document.createElement('span');
    const number = document.createElement('small');
    number.textContent = `משימה ${mission.id}`;
    const title = document.createElement('strong');
    title.textContent = mission.title;
    copy.append(number, title);
    button.append(badge, copy);
    button.addEventListener('click', () => goTo(index, 0));
    return button;
  }

  function renderMissionNav() {
    elements.missionNav.replaceChildren(...missions.map(createMissionButton));
  }

  function renderProgress() {
    const doneMissions = missions.filter(missionIsComplete).length;
    const points = completedPoints();
    elements.progressText.textContent = `${doneMissions} מתוך ${missions.length} משימות · ${points}/${totalPoints} נק׳`;
    elements.progressBar.style.width = `${missions.length ? (doneMissions / missions.length) * 100 : 0}%`;
  }

  function current() {
    const mission = missions[state.missionIndex];
    const challenge = mission.challenges[state.challengeIndex];
    return { mission, challenge, key: challengeKey(mission, challenge) };
  }

  function renderFeedback(result) {
    elements.feedbackPanel.className = `feedback-panel feedback-${result.status}`;
    elements.feedbackPanel.replaceChildren();
    const title = document.createElement('strong');
    title.textContent = result.title;
    const message = document.createElement('span');
    message.textContent = result.message;
    elements.feedbackPanel.append(title, message);
  }

  function genericHint(challenge) {
    if (challenge.mode === 'turtle') return 'רמז 1: חשבו כמה פעמים הצב חוזר על התנועה ומה סכום הסיבובים הדרוש לצורה סגורה.';
    return 'רמז 1: עברו על הקוד שורה־שורה ורשמו בצד את ערך המשתנה אחרי כל שורה.';
  }

  function predictionPassed(challenge, key) {
    return !challenge.prediction || Boolean(state.predictions[key]?.passed);
  }

  function checkPrediction() {
    const { challenge, key } = current();
    if (!challenge.prediction) return;
    const value = elements.predictionInput.value;
    const passed = window.PythonExamChecker.normalizeOutput(value) === window.PythonExamChecker.normalizeOutput(challenge.prediction.expected);
    state.predictions[key] = { value, passed };
    saveState();
    elements.runCodeBtn.disabled = !passed;
    elements.checkPredictionBtn.textContent = passed ? 'ניבוי נכון ✓' : 'נסו שוב';
    renderFeedback(passed
      ? { status: 'correct', title: 'ניבוי נכון!', message: 'עכשיו הריצו את הקוד ובדקו שהמחשב מסכים.' }
      : { status: 'almost', title: 'עוד לא', message: 'אל תריצו עדיין. עברו שורה־שורה ורשמו את ערך המשתנה אחרי כל שינוי.' });
  }

  function showHint() {
    const { challenge, key } = current();
    const count = Math.min((state.hints[key] || 0) + 1, 3);
    state.hints[key] = count;
    saveState();
    if (count === 1) {
      renderFeedback({ status: 'hint', title: 'כיוון ראשון', message: genericHint(challenge) });
    } else if (count === 2) {
      renderFeedback({ status: 'hint', title: 'רמז ממוקד', message: challenge.hint });
    } else {
      renderFeedback({ status: 'hint', title: 'הסבר נוסף', message: challenge.checker.explain || challenge.hint });
    }
    elements.hintBtn.textContent = count >= 3 ? 'כל הרמזים הוצגו' : `רמז נוסף (${count}/3)`;
  }

  function renderChallenge() {
    const { mission, challenge, key } = current();
    elements.challengeCounter.textContent = `אתגר ${state.challengeIndex + 1} מתוך ${mission.challenges.length}`;
    elements.challengeTitle.textContent = challenge.title;
    elements.challengePoints.textContent = `${challenge.points} נק׳`;
    elements.challengePrompt.textContent = challenge.prompt;
    const guide = challenge.beginnerGuide;
    const stageLabels = { guided: 'מודרך', practice: 'תרגול', independent: 'עצמאי' };
    elements.guideStage.textContent = stageLabels[challenge.stage] || 'צעד־צעד';
    elements.guideStage.dataset.stage = challenge.stage || 'guided';
    elements.guideIdea.textContent = guide.idea;
    elements.guideTerms.replaceChildren(...guide.terms.flatMap(({ term, meaning }) => {
      const name = document.createElement('dt');
      name.textContent = term;
      const description = document.createElement('dd');
      description.textContent = meaning;
      return [name, description];
    }));
    elements.guideExample.open = challenge.stage !== 'independent';
    elements.guideExample.querySelector('summary').textContent = challenge.stage === 'independent' ? 'צריכים דוגמה? פתחו כאן' : 'דוגמה פתורה';
    elements.guideExampleCode.textContent = guide.example.code;
    elements.guideExampleExplanation.textContent = guide.example.explanation;
    elements.guideSteps.replaceChildren(...guide.steps.map((step) => {
      const item = document.createElement('li');
      item.textContent = step;
      return item;
    }));
    elements.codeEditor.value = state.drafts[key] ?? challenge.starterCode;
    elements.inputStrip.hidden = !challenge.inputs?.length;
    elements.inputPreview.textContent = challenge.inputs?.join(' · ') || '';
    elements.predictionPanel.hidden = !challenge.prediction;
    elements.predictionInput.value = state.predictions[key]?.value || '';
    elements.checkPredictionBtn.textContent = state.predictions[key]?.passed ? 'ניבוי נכון ✓' : 'בדיקת ניבוי';
    elements.runCodeBtn.disabled = !predictionPassed(challenge, key);
    elements.turtleStage.hidden = challenge.mode !== 'turtle';
    elements.turtleCanvas.replaceChildren();
    elements.codeOutput.textContent = 'הפלט יופיע כאן.';
    const done = Boolean(state.completed[key]);
    renderFeedback(done
      ? { status: 'correct', title: 'כבר פתרת את האתגר', message: 'אפשר להריץ שוב, לשפר את הקוד או להמשיך הלאה.' }
      : { status: 'ready', title: 'המעבדה מוכנה', message: 'שנו את הקוד והריצו כדי לקבל משוב.' });
    elements.hintBtn.textContent = state.hints[key] >= 3 ? 'כל הרמזים הוצגו' : 'רמז';
    elements.prevChallengeBtn.disabled = state.missionIndex === 0 && state.challengeIndex === 0;
    const lastChallenge = state.challengeIndex === mission.challenges.length - 1;
    const lastMission = state.missionIndex === missions.length - 1;
    elements.nextChallengeBtn.textContent = lastChallenge ? (lastMission ? 'סיימתי את המסלול' : 'למשימה הבאה') : 'האתגר הבא';
  }

  function renderMission() {
    const { mission } = current();
    elements.missionBadge.textContent = mission.badge;
    elements.missionKicker.textContent = mission.kicker;
    elements.missionTitle.textContent = mission.title;
    elements.missionStory.textContent = mission.story;
    elements.conceptPanel.replaceChildren();
    const conceptTitle = document.createElement('strong');
    conceptTitle.textContent = 'מפתח למשימה';
    const concept = document.createElement('p');
    concept.textContent = mission.concept;
    elements.conceptPanel.append(conceptTitle, concept);
    renderMissionNav();
    renderChallenge();
    renderProgress();
  }

  function goTo(missionIndex, challengeIndex) {
    if (isRunning) return;
    state.missionIndex = Math.min(Math.max(missionIndex, 0), missions.length - 1);
    const mission = missions[state.missionIndex];
    state.challengeIndex = Math.min(Math.max(challengeIndex, 0), mission.challenges.length - 1);
    saveState();
    renderMission();
    document.getElementById('lessonWorkspace').focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function nextChallenge() {
    const { mission } = current();
    if (state.challengeIndex < mission.challenges.length - 1) {
      goTo(state.missionIndex, state.challengeIndex + 1);
    } else if (state.missionIndex < missions.length - 1) {
      goTo(state.missionIndex + 1, 0);
    } else {
      renderFeedback({
        status: missions.every(missionIsComplete) ? 'correct' : 'hint',
        title: missions.every(missionIsComplete) ? 'המסלול הושלם!' : 'כמעט בסיום',
        message: missions.every(missionIsComplete) ? 'כל המשימות פתורות. אפשר לגשת למבחן בביטחון.' : 'עדיין יש אתגרים שלא נפתרו. סימן ✓ בתפריט מראה איזו משימה הושלמה.',
      });
    }
  }

  function previousChallenge() {
    if (state.challengeIndex > 0) {
      goTo(state.missionIndex, state.challengeIndex - 1);
    } else if (state.missionIndex > 0) {
      const previousMission = missions[state.missionIndex - 1];
      goTo(state.missionIndex - 1, previousMission.challenges.length - 1);
    }
  }

  function readBuiltin(filename) {
    if (!Sk.builtinFiles?.files?.[filename]) throw new Error(`File not found: ${filename}`);
    return Sk.builtinFiles.files[filename];
  }

  async function syncMissionProgress(mission) {
    if (!window.StudentProgress?.save || !missionIsComplete(mission)) return;
    const score = mission.challenges.reduce((sum, challenge) => sum + (challenge.points || 0), 0);
    try {
      await window.StudentProgress.save({
        courseId: COURSE_ID,
        lessonId: `mission-${mission.id}`,
        activityId: `mission-${mission.id}`,
        status: 'completed',
        score,
      });
    } catch (_) {
      // Local progress is authoritative when the network is temporarily unavailable.
    }
  }

  function markCorrect(mission, key) {
    if (!state.completed[key]) {
      state.completed[key] = new Date().toISOString();
      saveState();
    }
    renderMissionNav();
    renderProgress();
    void syncMissionProgress(mission);
  }

  function turtleHasDrawing() {
    const canvases = [...elements.turtleCanvas.querySelectorAll('canvas')];
    return canvases.some(canvas => {
      const { width, height } = canvas;
      const pixels = canvas.getContext('2d').getImageData(0, 0, width, height).data;
      let ink = 0;
      let minX = width;
      let minY = height;
      let maxX = -1;
      let maxY = -1;
      for (let offset = 3, pixel = 0; offset < pixels.length; offset += 4, pixel += 1) {
        if (!pixels[offset]) continue;
        ink += 1;
        const x = pixel % width;
        const y = Math.floor(pixel / width);
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
      return ink >= 100 && maxX - minX >= 30 && maxY - minY >= 30;
    });
  }

  function startTurtleTrace() {
    const points = [];
    const prototype = CanvasRenderingContext2D.prototype;
    const originalLineTo = prototype.lineTo;
    function tracedLineTo(x, y) {
      if (this.canvas && elements.turtleCanvas.contains(this.canvas)) points.push([Number(x), Number(y)]);
      return originalLineTo.apply(this, arguments);
    }
    prototype.lineTo = tracedLineTo;
    return {
      points,
      stop() {
        if (prototype.lineTo === tracedLineTo) prototype.lineTo = originalLineTo;
      },
    };
  }

  async function runCode() {
    if (isRunning) return;
    const { mission, challenge, key } = current();
    if (!predictionPassed(challenge, key)) {
      renderFeedback({ status: 'hint', title: 'קודם מנבאים', message: 'כתבו מה לדעתכם יודפס ולחצו על “בדיקת ניבוי”.' });
      return;
    }
    const code = elements.codeEditor.value;
    state.drafts[key] = code;
    saveState();

    if (!window.Sk || !window.PythonExamChecker) {
      renderFeedback({ status: 'runtime-error', title: 'מנוע Python לא זמין', message: 'בדקו את החיבור לאינטרנט ורעננו את הדף.' });
      return;
    }
    if (code.length > 12000) {
      renderFeedback({ status: 'runtime-error', title: 'הקוד ארוך מדי', message: 'התרגילים מיועדים לקוד קצר. צמצמו את הקוד לפחות מ־12,000 תווים.' });
      return;
    }

    isRunning = true;
    elements.runCodeBtn.disabled = true;
    elements.runCodeBtn.textContent = 'מריצים…';
    elements.engineStatus.textContent = 'Python עובד';
    elements.codeOutput.textContent = '';
    elements.turtleCanvas.replaceChildren();
    elements.turtleStage.hidden = challenge.mode !== 'turtle';

    let outputBuffer = '';
    const inputQueue = [...(challenge.inputs || [])];
    const allowedImports = new Set(['sys', ...(challenge.mode === 'turtle' ? ['turtle'] : [])]);
    let turtleTrace = null;
    try {
      if (challenge.mode === 'turtle') turtleTrace = startTurtleTrace();
      Sk.onBeforeImport = moduleName => (
        allowedImports.has(moduleName)
          ? true
          : `ייבוא המודול ${moduleName} אינו זמין במעבדת התרגול.`
      );
      Sk.execLimit = 4000;
      Sk.configure({
        output(text) {
          outputBuffer += String(text);
          if (outputBuffer.length > MAX_OUTPUT_CHARS) throw new Error('OutputLimitError: too much output');
          elements.codeOutput.textContent = outputBuffer;
        },
        read: readBuiltin,
        inputfun() {
          if (!inputQueue.length) throw new Error('EOFError: no more challenge input');
          return inputQueue.shift();
        },
        inputfunTakesPrompt: true,
        __future__: Sk.python3,
      });
      Sk.TurtleGraphics = Sk.TurtleGraphics || {};
      Sk.TurtleGraphics.target = 'turtleCanvas';
      Sk.TurtleGraphics.width = 460;
      Sk.TurtleGraphics.height = 300;

      await Sk.misceval.asyncToPromise(() => Sk.importMainWithBody('<student>', false, code, true));
      let result = window.PythonExamChecker.evaluate({ code, output: outputBuffer, checker: challenge.checker });
      const turtleShapePassed = challenge.mode !== 'turtle' || (
        turtleHasDrawing()
        && window.PythonExamChecker.turtleTraceMatches(turtleTrace?.points, challenge.checker.turtleShape)
      );
      if (result.status === 'correct' && !turtleShapePassed) {
        result = {
          status: 'almost',
          title: 'הקוד רץ, אבל הצורה עוד לא מדויקת',
          message: 'בדקו את מספר הצלעות, אורך כל צלע וזווית הסיבוב. ודאו שהעט למטה ושהתנועה נמצאת בתוך הלולאה.',
        };
      }
      if (result.status === 'correct') markCorrect(mission, key);
      renderFeedback(result);
      if (!outputBuffer && challenge.mode !== 'turtle') elements.codeOutput.textContent = '(אין פלט)';
      if (!outputBuffer && challenge.mode === 'turtle') elements.codeOutput.textContent = 'הציור הושלם בקנבס.';
    } catch (error) {
      const rawError = error?.toString?.() || String(error);
      elements.codeOutput.textContent = `${outputBuffer}${outputBuffer ? '\n' : ''}${rawError}`;
      renderFeedback(window.PythonExamChecker.runtimeError(rawError));
    } finally {
      turtleTrace?.stop();
      isRunning = false;
      elements.runCodeBtn.disabled = !predictionPassed(challenge, key);
      elements.runCodeBtn.textContent = '▶ הרצת קוד';
      elements.engineStatus.textContent = 'Python מוכן';
    }
  }

  function resetCode() {
    const { challenge, key } = current();
    delete state.drafts[key];
    saveState();
    elements.codeEditor.value = challenge.starterCode;
    elements.codeOutput.textContent = 'הפלט יופיע כאן.';
    renderFeedback({ status: 'ready', title: 'הקוד אופס', message: 'חזרנו לנקודת ההתחלה של האתגר.' });
    elements.codeEditor.focus();
  }

  elements.runCodeBtn.addEventListener('click', runCode);
  elements.resetCodeBtn.addEventListener('click', resetCode);
  elements.hintBtn.addEventListener('click', showHint);
  elements.checkPredictionBtn.addEventListener('click', checkPrediction);
  elements.nextChallengeBtn.addEventListener('click', nextChallenge);
  elements.prevChallengeBtn.addEventListener('click', previousChallenge);
  elements.codeEditor.addEventListener('input', () => {
    const { key } = current();
    state.drafts[key] = elements.codeEditor.value;
    saveState();
  });
  elements.codeEditor.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      void runCode();
    }
  });
  elements.predictionInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      checkPrediction();
    }
  });

  elements.engineStatus.textContent = window.Sk ? 'Python מוכן' : 'מנוע Python לא נטען';
  if (missions.length) renderMission();
})();
