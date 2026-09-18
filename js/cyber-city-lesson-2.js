(function () {
  const stations = [
    {
      id: 'brief',
      short: 'פתיחה',
      title: 'פתיחת משימה: מהבלוקים לקוד',
      time: '10 דקות',
      goal: 'מחברים את הסורק משיעור 1 לרעיון פשוט: סימן נכנס לקוד, הקוד נותן החלטה.',
      type: 'brief'
    },
    {
      id: 'console',
      short: 'Python',
      title: 'Python ראשון',
      time: '20 דקות',
      goal: 'לומדים print, input ומשתנה אחד דרך קונסולה מדומה.',
      type: 'console'
    },
    {
      id: 'signals',
      short: 'סימנים',
      title: 'סימנים קצרים בקוד',
      time: '15 דקות',
      goal: 'מתרגמים סימני סיכון לשמות קצרים באנגלית פשוטה: url, pwd, code, fast.',
      type: 'signals'
    },
    {
      id: 'logic',
      short: 'if',
      title: 'If Lab והרצה',
      time: '20 דקות',
      goal: 'בונים תנאים, מריצים על הודעות שונות ורואים איך Risk משתנה.',
      type: 'logic'
    },
    {
      id: 'debug',
      short: 'Debug',
      title: 'Debug + Build',
      time: '15 דקות',
      goal: 'מתקנים שגיאות קטנות ומחברים את הקוד הסופי.',
      type: 'debug'
    },
    {
      id: 'report',
      short: 'דוח',
      title: 'Code Review ותוצר סיום',
      time: '10 דקות',
      goal: 'מסבירים מה המנוע בודק, למה, ומה הפעולה הבטוחה.',
      type: 'report'
    }
  ];

  const signalCards = [
    { id: 'domain', label: 'קישור מוזר', variable: 'url', meaning: 'יש קישור חשוד', value: true, points: 30 },
    { id: 'password', label: 'מבקשים סיסמה', variable: 'pwd', meaning: 'מבקשים password', value: true, points: 35 },
    { id: 'otp', label: 'מבקשים קוד', variable: 'code', meaning: 'מבקשים קוד אימות', value: true, points: 40 },
    { id: 'pressure', label: 'מלחיצים מהר', variable: 'fast', meaning: 'יש לחץ זמן', value: true, points: 20 },
    { id: 'known', label: 'שולח מוכר', variable: 'ok', meaning: 'השולח נראה מוכר', value: false, points: -15 }
  ];

  const logicLines = [
    { id: 'start', text: 'risk = 0', needed: true },
    { id: 'domain', text: 'if url: risk += 30', needed: true },
    { id: 'password', text: 'if pwd: risk += 35', needed: true },
    { id: 'otp', text: 'if code: risk += 40', needed: true },
    { id: 'pressure', text: 'if fast: risk += 20', needed: true },
    { id: 'safe', text: 'if risk >= 70: print("report")', needed: true },
    { id: 'steal', text: 'print("send password")', needed: false }
  ];

  const runCases = [
    {
      id: 'library',
      title: 'הודעת ספרייה רגילה',
      signals: ['known'],
      expected: 'low'
    },
    {
      id: 'otp',
      title: 'תמיכה מבקשת קוד אימות',
      signals: ['otp', 'pressure'],
      expected: 'high'
    },
    {
      id: 'login',
      title: 'קישור התחברות מתחזה',
      signals: ['domain', 'password', 'pressure'],
      expected: 'high'
    }
  ];

  const debugTasks = [
    {
      id: 'quotes',
      broken: 'print(risk check)',
      fixed: 'print("risk check")',
      hint: 'טקסט ב־Python צריך להיות בתוך מרכאות.'
    },
    {
      id: 'case',
      broken: 'If code:\n    risk += 40',
      fixed: 'if code:\n    risk += 40',
      hint: 'Python רגיש לאותיות גדולות וקטנות.'
    },
    {
      id: 'name',
      broken: 'risk_score = 0\nrisk += 30',
      fixed: 'risk = 0\nrisk += 30',
      hint: 'שם המשתנה חייב להיות זהה בכל מקום.'
    }
  ];

  const state = {
    station: 0,
    xp: 0,
    risk: 0,
    caseFile: [],
    completed: new Set(),
    consoleName: '',
    consoleAsset: '',
    consoleRan: false,
    signals: new Set(),
    logic: new Set(),
    activeRunCase: 'login',
    debugFixed: {},
    report: {
      checks: '',
      logic: '',
      action: ''
    }
  };

  const stationVideos = {
    brief: {
      title: 'סרטון פתיחה',
      text: 'מהבלוקים של שיעור 1 לקוד Python שמחשב Risk.',
      src: 'marketing/cyber-city-lesson2-brief.mp4',
      poster: 'marketing/cyber-city-lesson2-brief-poster.jpg'
    },
    console: {
      title: 'סרטון שלב Python',
      text: 'איך ממלאים, לוחצים על הרצה, ורואים את הפלט.',
      src: 'marketing/cyber-city-lesson2-console.mp4',
      poster: 'marketing/cyber-city-lesson2-console-poster.jpg'
    },
    signals: {
      title: 'סרטון שלב סימנים',
      text: 'איך סימן סייבר הופך למשתנה קצר בקוד.',
      src: 'marketing/cyber-city-lesson2-signals.mp4',
      poster: 'marketing/cyber-city-lesson2-signals-poster.jpg'
    },
    logic: {
      title: 'סרטון If Lab',
      text: 'איך בוחרים תנאים, מריצים אירוע, וקוראים תוצאת Risk.',
      src: 'marketing/cyber-city-lesson2-if-lab.mp4',
      poster: 'marketing/cyber-city-lesson2-if-lab-poster.jpg'
    },
    debug: {
      title: 'סרטון Debug',
      text: 'איך מתקנים שגיאות קטנות ומחברים קוד סופי.',
      src: 'marketing/cyber-city-lesson2-debug.mp4',
      poster: 'marketing/cyber-city-lesson2-debug-poster.jpg'
    },
    report: {
      title: 'סרטון דוח סיום',
      text: 'איך מסבירים מה המנוע בודק ומה עושים כשהסיכון גבוה.',
      src: 'marketing/cyber-city-lesson2-report.mp4',
      poster: 'marketing/cyber-city-lesson2-report-poster.jpg'
    }
  };

  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));

  function say(text) {
    $('assistantText').textContent = text;
  }

  function addCase(item) {
    if (!state.caseFile.includes(item)) state.caseFile.push(item);
  }

  function addXp(amount) {
    state.xp = Math.max(0, Math.min(100, state.xp + amount));
  }

  function complete(id) {
    if (!state.completed.has(id)) {
      state.completed.add(id);
      addXp(Math.ceil(100 / stations.length));
    }
  }

  function setRisk(value, text) {
    state.risk = Math.max(0, Math.min(100, value));
    $('riskScore').textContent = `${state.risk}%`;
    $('riskFill').style.width = `${state.risk}%`;
    $('riskFill').className = state.risk >= 70 ? 'high' : state.risk >= 40 ? 'medium' : 'low';
    $('riskText').textContent = text || 'Risk התעדכן לפי הקוד.';
  }

  function calcRisk(signals) {
    let risk = 0;
    signalCards.forEach(card => {
      if (signals.has(card.id)) risk += card.points;
    });
    return Math.max(0, Math.min(100, risk));
  }

  function recommendation(risk) {
    if (risk >= 70) return 'לא לוחצים, לא מוסרים פרטים, מדווחים ובודקים מקור רשמי.';
    if (risk >= 40) return 'צריך לבדוק עוד לפני פעולה.';
    return 'נראה סיכון נמוך, אבל עדיין בודקים הקשר.';
  }

  function progress() {
    return Math.round((state.completed.size / stations.length) * 100);
  }

  function renderShell() {
    const station = stations[state.station];
    const nextStation = stations[state.station + 1];
    $('stationTime').textContent = station.time;
    $('stationTitle').textContent = station.title;
    $('stationGoal').textContent = station.goal;
    $('currentStepLabel').textContent = `משימה ${state.station + 1} מתוך ${stations.length}`;
    $('currentStepName').textContent = station.short;
    $('xpLabel').textContent = state.xp;
    $('progressLabel').textContent = `${progress()}%`;
    $('prevStation').disabled = state.station === 0;
    $('nextStation').textContent = state.station === stations.length - 1 ? 'סיום' : `הבא: ${nextStation.short}`;
    $('stationNav').style.gridTemplateColumns = `repeat(${stations.length}, minmax(0, 1fr))`;
    $('stationNav').innerHTML = stations.map((item, index) => `
      <button class="station-tab ${index === state.station ? 'active' : ''} ${state.completed.has(item.id) ? 'done' : ''}" type="button" data-station="${index}" aria-label="מעבר אל משימה ${index + 1}: ${esc(item.title)}">
        <em>${index + 1}</em>
        <strong>${esc(item.short)}</strong>
        <span>${esc(item.time)}</span>
      </button>
    `).join('');
    $('stationNav').querySelectorAll('[data-station]').forEach(button => {
      button.addEventListener('click', () => {
        state.station = Number(button.dataset.station);
        render();
      });
    });
    $('caseFile').innerHTML = state.caseFile.length
      ? state.caseFile.map(item => `<span>${esc(item)}</span>`).join('')
      : '<em>עדיין אין פריטים בתיק הקוד.</em>';
  }

  function renderBrief() {
    return `
      <section class="brief-grid">
        <article class="big-card">
          <span class="card-kicker">המשך ישיר משיעור 1</span>
          <img class="lab-visual" src="assets/cyber-city/python-risk-engine.svg" alt="מנוע סיכון בפייתון">
          <h3>בשיעור 1 בנינו סורק עם בלוקים. עכשיו נבנה את המוח שלו בקוד.</h3>
          <p>לא לומדים Python יבש. כל פקודה עוזרת לסורק לקבל החלטה.</p>
        </article>
        <article class="tool-card">
          <span>מה לומדים באמת?</span>
          <ol>
            <li><strong>משתנה</strong> שומר סימן קצר כמו “יש קישור מוזר”.</li>
            <li><strong>if</strong> בודק אם הסימן קיים.</li>
            <li><strong>risk +=</strong> מוסיף ניקוד.</li>
            <li><strong>print</strong> מציג המלצה בטוחה.</li>
          </ol>
        </article>
      </section>
    `;
  }

  function renderConsole() {
    const hasConsoleInput = state.consoleName.trim() && state.consoleAsset.trim();
    const outputText = state.consoleRan && hasConsoleInput
      ? `checking ${esc(state.consoleAsset)} for ${esc(state.consoleName)}`
      : 'הפלט יופיע כאן אחרי לחיצה על הרצה.';
    return `
      <section class="builder-grid console-lab">
        <article class="tool-card console-run-card">
          <span>קונסולה מדומה</span>
          <h3>מריצים תוכנית ורואים פלט.</h3>
          <div class="console-steps" aria-label="שלבי עבודה בקונסולה">
            <div><b>1</b><span>ממלאים שני שדות.</span></div>
            <div><b>2</b><span>לוחצים על הרצה.</span></div>
            <div><b>3</b><span>קוראים את הפלט שנוצר.</span></div>
          </div>
          <label>שם מגן/ת
            <input class="lab-input" type="text" data-console-field="consoleName" value="${esc(state.consoleName)}" placeholder="לדוגמה: Noa">
          </label>
          <label>מה בודקים?
            <input class="lab-input" type="text" data-console-field="consoleAsset" value="${esc(state.consoleAsset)}" placeholder="לדוגמה: game account">
          </label>
          <p class="console-hint">כפתור ההרצה נמצא מעל חלון ה־Python.</p>
        </article>
        <article class="code-panel">
          <div class="code-panel-toolbar">
            <span>Python</span>
            <button class="button run-console-button code-run-button" type="button" data-run-console>
              <span class="play-icon" aria-hidden="true"></span>
              <span>הרצה</span>
            </button>
          </div>
          <pre><code>print("risk checker")
name = input("name: ")
item = input("item: ")
print("checking", item, "for", name)</code></pre>
          <div class="terminal-output console-output ${state.consoleRan && hasConsoleInput ? 'has-output' : ''}">
            <strong>פלט</strong>
            <p ${state.consoleRan && hasConsoleInput ? 'dir="ltr" lang="en"' : 'dir="rtl" lang="he"'}>${outputText}</p>
          </div>
        </article>
      </section>
    `;
  }

  function renderSignals() {
    return `
      <section class="builder-grid">
        <article class="tool-card">
          <span>סימנים הופכים למשתנים</span>
          <h3>בחרו אילו סימנים קיימים באירוע.</h3>
          <div class="block-list">
            ${signalCards.map(card => `
              <button class="rule-block ${state.signals.has(card.id) ? 'selected' : ''}" type="button" data-signal="${card.id}">
                <span>
                  <strong>${esc(card.label)}</strong>
                  <small>${esc(card.variable)} = ${card.value ? 'True' : 'False'} · ${esc(card.meaning)}</small>
                </span>
                <em>${card.points > 0 ? '+' : ''}${card.points}%</em>
              </button>
            `).join('')}
          </div>
        </article>
        <article class="code-panel">
          <span>קוד שנוצר מהבחירות</span>
          <pre><code>${renderSignalCode()}</code></pre>
          <button class="button" type="button" data-check-signals>שמור משתנים</button>
        </article>
      </section>
    `;
  }

  function renderSignalCode() {
    return signalCards.map(card => `${card.variable} = ${state.signals.has(card.id) ? 'True' : 'False'}`).join('\n');
  }

  function renderLogic() {
    return `
      <section class="builder-grid">
        <article class="tool-card">
          <span>If Logic Lab</span>
          <h3>בחרו שורות קוד לסורק הגנתי, ואז הריצו מקרה בדיקה.</h3>
          <div class="block-list">
            ${logicLines.map(line => `
              <button class="code-choice ${state.logic.has(line.id) ? 'selected' : ''}" type="button" data-logic="${line.id}">
                <code>${esc(line.text)}</code>
              </button>
            `).join('')}
          </div>
        </article>
        <article class="code-panel">
          <span>קוד קצר וברור</span>
          <pre><code>${Array.from(state.logic).map(id => logicLines.find(line => line.id === id)?.text).filter(Boolean).join('\n') || '# בחרו שורות קוד'}</code></pre>
          <button class="button" type="button" data-check-logic>בדוק לוגיקה</button>
        </article>
      </section>
      ${renderRun()}
    `;
  }

  function renderRun() {
    const activeCase = runCases.find(item => item.id === state.activeRunCase) || runCases[0];
    const signals = new Set(activeCase.signals);
    const risk = calcRisk(signals);
    const visibleSignals = signalCards.filter(card => card.points > 0);
    return `
      <section class="builder-grid">
        <article class="tool-card">
          <span>אירועים להרצה</span>
          <h3>בחרו אירוע והריצו עליו את המנוע.</h3>
          <div class="mini-options">
            ${runCases.map(item => `
              <button class="${state.activeRunCase === item.id ? 'selected' : ''}" type="button" data-run-case="${item.id}">
                <strong>${esc(item.title)}</strong>
                <small>${item.signals.map(id => signalCards.find(card => card.id === id)?.label).filter(Boolean).join(' · ') || 'אין סימן חריג'}</small>
              </button>
            `).join('')}
          </div>
        </article>
        <article class="scanner-preview run-result-panel">
          <span>תוצאת הרצה</span>
          <strong>${risk}%</strong>
          <div class="risk-track"><div class="${risk >= 70 ? 'high' : risk >= 40 ? 'medium' : 'low'}" style="width:${risk}%"></div></div>
          <div class="run-summary">
            <b>${esc(activeCase.title)}</b>
            <small>הסורק בודק אילו סימנים קיימים במקרה הזה.</small>
          </div>
          <ul class="run-signal-list">
            ${visibleSignals.map(card => `
              <li class="${signals.has(card.id) ? 'active' : ''}">
                <span>${esc(card.label)}</span>
                <strong>${signals.has(card.id) ? `+${card.points}` : '0'}</strong>
              </li>
            `).join('')}
          </ul>
          <p>${esc(recommendation(risk))}</p>
          <button class="button" type="button" data-check-run>שמור הרצה</button>
        </article>
      </section>
    `;
  }

  function renderEngineCode(signals) {
    return `risk = 0
url = ${signals.has('domain') ? 'True' : 'False'}
pwd = ${signals.has('password') ? 'True' : 'False'}
code = ${signals.has('otp') ? 'True' : 'False'}
fast = ${signals.has('pressure') ? 'True' : 'False'}

if url:
    risk += 30
if pwd:
    risk += 35
if code:
    risk += 40
if fast:
    risk += 20

print("Risk:", risk)`;
  }

  function renderDebug() {
    return `
      <section class="url-lab">
        <article class="badge-card">
          <span>הקוד הסופי</span>
          <strong>Python Risk Engine v1</strong>
          <pre><code>${renderEngineCode(new Set(['domain', 'password', 'otp', 'pressure']))}

if risk >= 70:
    print("report")
else:
    print("check more")</code></pre>
        </article>
        ${debugTasks.map(task => `
          <article class="url-card">
            <span class="card-kicker">Debug</span>
            <h3>תקנו את השגיאה</h3>
            <pre><code>${esc(task.broken)}</code></pre>
            <div class="mini-options">
              <button class="${state.debugFixed[task.id] === task.fixed ? 'selected' : ''}" type="button" data-debug="${task.id}" data-debug-value="${esc(task.fixed)}">
                <code>${esc(task.fixed)}</code>
              </button>
              <button class="${state.debugFixed[task.id] === task.broken ? 'selected' : ''}" type="button" data-debug="${task.id}" data-debug-value="${esc(task.broken)}">
                <code>${esc(task.broken)}</code>
              </button>
            </div>
            <p>${esc(task.hint)}</p>
          </article>
        `).join('')}
      </section>
      <button class="button" type="button" data-check-debug>בדוק Debug ושמור תוצר</button>
    `;
  }

  function renderReport() {
    return `
      <section class="report-grid">
        <article class="tool-card">
          <span>Code Review</span>
          <h3>מסבירים את הכלי ב־3 שורות.</h3>
          <label>1. אילו סימנים המנוע בודק?
            <textarea data-report-field="checks" placeholder="לדוגמה: קישור מוזר, סיסמה, קוד אימות ולחץ זמן">${esc(state.report.checks)}</textarea>
          </label>
          <label>2. איך הקוד מחליט Risk?
            <textarea data-report-field="logic" placeholder="לדוגמה: כל if מוסיף נקודות לפי הסימן שנמצא">${esc(state.report.logic)}</textarea>
          </label>
          <label>3. מה ההמלצה כשה־Risk גבוה?
            <textarea data-report-field="action" placeholder="לדוגמה: לא לוחצים, לא מוסרים קוד, מדווחים ובודקים מקור רשמי">${esc(state.report.action)}</textarea>
          </label>
          <button class="button" type="button" data-check-report>בדוק וקבל תג</button>
        </article>
        <article class="badge-card">
          <span>תוצר שיעור 2</span>
          <strong>Python Risk Engine v1</strong>
          <p>התלמיד יצא עם הבנה פרקטית: משתנה שומר סימן, if בודק אותו, Risk מצטבר, והפלט נותן פעולה בטוחה.</p>
        </article>
      </section>
    `;
  }

  function renderStationVideo() {
    const station = stations[state.station];
    const video = stationVideos[station.id];
    if (!video) return '';
    return `
      <section class="stage-video-card" aria-label="${esc(video.title)}">
        <div class="stage-video-copy">
          <span>לפני שמתחילים</span>
          <h3>${esc(video.title)}</h3>
          <p>${esc(video.text)}</p>
        </div>
        <video controls preload="metadata" playsinline poster="${esc(video.poster)}">
          <source src="${esc(video.src)}" type="video/mp4">
        </video>
      </section>
    `;
  }

  function renderContent() {
    const type = stations[state.station].type;
    if (type === 'brief') return renderBrief();
    if (type === 'console') return renderConsole();
    if (type === 'signals') return renderSignals();
    if (type === 'logic') return renderLogic();
    if (type === 'debug') return renderDebug();
    return renderReport();
  }

  function bindDynamicEvents() {
    document.querySelectorAll('[data-complete]').forEach(button => {
      button.addEventListener('click', () => {
        complete(button.dataset.complete);
        addCase('Mission 02 התחילה: Python Risk Engine');
        say('מעולה. עכשיו הופכים את הבלוקים משיעור 1 לקוד.');
        render();
      });
    });
    document.querySelectorAll('[data-console-field]').forEach(field => {
      field.addEventListener('input', () => {
        state[field.dataset.consoleField] = field.value;
        state.consoleRan = false;
      });
    });
    document.querySelector('[data-run-console]')?.addEventListener('click', () => {
      if (state.consoleName.trim() && state.consoleAsset.trim()) {
        state.consoleRan = true;
        complete('console');
        addCase('Console: print/input/variable');
        say('יפה. עכשיו ראיתם איך input נכנס למשתנה ואיך print מציג פלט.');
      } else {
        state.consoleRan = false;
        say('מלאו שם מגן ונכס דיגיטלי כדי להריץ את הקונסולה.');
      }
      render();
    });
    document.querySelectorAll('[data-signal]').forEach(button => {
      button.addEventListener('click', () => {
        const signal = button.dataset.signal;
        if (state.signals.has(signal)) state.signals.delete(signal);
        else state.signals.add(signal);
        const risk = calcRisk(state.signals);
        setRisk(risk, 'כל סימן שבחרתם מתורגם למשתנה ומשפיע על Risk.');
        say('זה הרעיון: סימן בעולם האמיתי הופך ל־True/False בקוד.');
        render();
      });
    });
    document.querySelector('[data-check-signals]')?.addEventListener('click', () => {
      if (state.signals.size >= 3) {
        complete('signals');
        addCase('Signals: סימנים תורגמו למשתנים');
        say('מעולה. יש לכם משתנים. עכשיו צריך תנאים.');
      } else {
        say('בחרו לפחות 3 סימנים כדי לבנות אירוע מספיק מעניין.');
      }
      render();
    });
    document.querySelectorAll('[data-logic]').forEach(button => {
      button.addEventListener('click', () => {
        const id = button.dataset.logic;
        if (state.logic.has(id)) state.logic.delete(id);
        else state.logic.add(id);
        render();
      });
    });
    document.querySelector('[data-check-logic]')?.addEventListener('click', () => {
      const selected = Array.from(state.logic).map(id => logicLines.find(line => line.id === id));
      const ok = selected.length >= 5 && selected.every(line => line?.needed) && !state.logic.has('steal');
      if (ok) {
        complete('logic');
        addCase('Logic: תנאי if בונים Risk');
        say('נכון. בחרתם רק לוגיקה הגנתית: חישוב, בדיקה והמלצה בטוחה.');
      } else {
        say('בדקו שוב: שורת קוד שמבקשת לשלוח סיסמה אינה חלק מסורק הגנתי.');
      }
      render();
    });
    document.querySelectorAll('[data-run-case]').forEach(button => {
      button.addEventListener('click', () => {
        state.activeRunCase = button.dataset.runCase;
        const active = runCases.find(item => item.id === state.activeRunCase);
        const risk = calcRisk(new Set(active.signals));
        setRisk(risk, `המנוע רץ על: ${active.title}`);
        render();
      });
    });
    document.querySelector('[data-check-run]')?.addEventListener('click', () => {
      complete('logic');
      addCase('Run: המנוע הופעל על 3 אירועים');
      say('הרצה היא הרגע שבו הקוד הופך לכלי: אותו מנוע, אירועים שונים, פלט שונה.');
      render();
    });
    document.querySelectorAll('[data-debug]').forEach(button => {
      button.addEventListener('click', () => {
        state.debugFixed[button.dataset.debug] = button.dataset.debugValue;
        render();
      });
    });
    document.querySelector('[data-check-debug]')?.addEventListener('click', () => {
      const ok = debugTasks.every(task => state.debugFixed[task.id] === task.fixed);
      if (ok) {
        complete('debug');
        addCase('Debug + Build: תוקנו שגיאות ונשמר קוד סופי');
        setRisk(100, 'מנוע הסיכון מוכן: קישור + סיסמה + קוד + לחץ זמן = סיכון גבוה.');
        say('יפה. Debugging הוא חלק רגיל מתכנות. עכשיו יש לכם קוד קצר שעובד.');
      } else {
        say('יש עוד שגיאה. חפשו מרכאות, אותיות גדולות ושמות משתנים לא זהים.');
      }
      render();
    });
    document.querySelectorAll('[data-report-field]').forEach(field => {
      field.addEventListener('input', () => {
        state.report[field.dataset.reportField] = field.value;
      });
    });
    document.querySelector('[data-check-report]')?.addEventListener('click', () => {
      const ok = Object.values(state.report).every(value => value.trim().length >= 12);
      if (ok) {
        complete('report');
        addCase('Code Review: הוגש הסבר על Risk Engine');
        say('שיעור 2 הושלם. בניתם מנוע סיכון בפייתון והסברתם איך הוא עובד.');
      } else {
        say('כתבו משפט קצר בכל שדה. המטרה היא להסביר את הכלי, לא לכתוב חיבור.');
      }
      render();
    });
  }

  function render() {
    renderShell();
    $('stationContent').innerHTML = renderStationVideo() + renderContent();
    bindDynamicEvents();
  }

  $('nextStation').addEventListener('click', () => {
    if (state.station === 0) {
      complete('brief');
      addCase('פתיחה: משימת הקוד הוצגה');
    }
    if (state.station < stations.length - 1) state.station += 1;
    render();
  });
  $('prevStation').addEventListener('click', () => {
    if (state.station > 0) state.station -= 1;
    render();
  });
  $('resetLab').addEventListener('click', () => {
    state.station = 0;
    state.xp = 0;
    state.risk = 0;
    state.caseFile = [];
    state.completed.clear();
    state.consoleName = '';
    state.consoleAsset = '';
    state.consoleRan = false;
    state.signals.clear();
    state.logic.clear();
    state.activeRunCase = 'login';
    state.debugFixed = {};
    state.report = { checks: '', logic: '', action: '' };
    say('התחלנו מחדש. המטרה: לבנות Python Risk Engine קצר וברור.');
    setRisk(0, 'הפלט יתעדכן כשתפעילו את מנוע הסיכון.');
    render();
  });

  setRisk(0, 'הפלט יתעדכן כשתפעילו את מנוע הסיכון.');
  render();
})();
