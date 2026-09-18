(function () {
  const stations = [
    {
      id: 'brief',
      short: 'פתיחה',
      title: 'פתיחת משימה: בודקים ניסוח',
      time: '10 דקות',
      goal: 'מבינים שהודעה יכולה להעלות סיכון לפי המילים והבקשות שבתוכה.',
      type: 'brief'
    },
    {
      id: 'signals',
      short: 'סימנים',
      title: 'סימני ניסוח בהודעה',
      time: '15 דקות',
      goal: 'מזהים מילים ובקשות שמנסות לגרום לנו לפעול מהר או למסור מידע.',
      type: 'signals'
    },
    {
      id: 'conditions',
      short: 'if',
      title: 'תנאי Python לעומק',
      time: '20 דקות',
      goal: 'מבינים איך תנאי עובד: אם סימן נמצא בהודעה, הקוד מוסיף Risk.',
      type: 'conditions'
    },
    {
      id: 'scanner',
      short: 'Scanner',
      title: 'בונים Message Risk Scanner',
      time: '20 דקות',
      goal: 'מחברים כמה תנאי if פשוטים לכלי שבודק הודעה ומחשב סיכון.',
      type: 'scanner'
    },
    {
      id: 'cases',
      short: 'הרצה',
      title: 'מריצים על הודעות',
      time: '15 דקות',
      goal: 'בודקים הודעות שונות ורואים איך כל סימן משפיע על התוצאה.',
      type: 'cases'
    },
    {
      id: 'report',
      short: 'דוח',
      title: 'דוח בדיקת הודעה',
      time: '10 דקות',
      goal: 'מסבירים איזה ניסוח מצאנו, למה הוא מעלה סיכון, ומה עושים בצורה בטוחה.',
      type: 'report'
    }
  ];

  const messageSignals = [
    { id: 'urgent', label: 'דחיפות', word: 'urgent', meaning: 'מנסים לגרום לנו לפעול מיד', points: 20 },
    { id: 'now', label: 'עכשיו', word: 'now', meaning: 'דורשים פעולה מיידית', points: 15 },
    { id: 'gift', label: 'פרס', word: 'gift', meaning: 'מבטיחים מתנה או הטבה', points: 20 },
    { id: 'verify', label: 'אימות', word: 'verify', meaning: 'מבקשים לאמת חשבון מתוך הודעה', points: 25 },
    { id: 'password', label: 'סיסמה', word: 'password', meaning: 'מבקשים מידע שאסור למסור', points: 40 }
  ];

  const messageCases = [
    {
      id: 'club',
      title: 'עדכון חוג',
      msg: 'club meeting moved to 17:00',
      signals: [],
      action: 'נראה סיכון נמוך. עדיין בודקים שהשולח מוכר.'
    },
    {
      id: 'gift',
      title: 'פרס במשחק',
      msg: 'urgent gift waiting now verify account',
      signals: ['urgent', 'gift', 'now', 'verify'],
      action: 'לא מגיבים מההודעה. נכנסים רק מאפליקציה רשמית.'
    },
    {
      id: 'password',
      title: 'בקשת סיסמה',
      msg: 'send password now to keep your account',
      signals: ['password', 'now'],
      action: 'לא שולחים סיסמה. מדווחים למבוגר או למדריך.'
    },
    {
      id: 'team',
      title: 'קבוצת למידה',
      msg: 'homework file is ready in classroom',
      signals: [],
      action: 'סיכון נמוך, אבל לא פותחים קבצים ממקור לא מוכר.'
    }
  ];

  const state = {
    station: 0,
    xp: 0,
    risk: 0,
    caseFile: [],
    completed: new Set(),
    chosenSignal: '',
    msgText: 'urgent gift waiting now verify account',
    conditionRan: false,
    scannerSignals: new Set(['urgent', 'gift', 'password']),
    activeCase: 'gift',
    report: {
      checked: '',
      risk: '',
      action: ''
    }
  };

  const stationVideos = {
    brief: {
      title: 'סרטון פתיחה',
      text: 'מה בודקים בשיעור ולמה ניסוח של הודעה משנה.',
      src: 'marketing/cyber-city-lesson4-brief.mp4',
      poster: 'marketing/cyber-city-lesson4-brief-poster.jpg'
    },
    signals: {
      title: 'סרטון סימני ניסוח',
      text: 'איך מזהים מילים ובקשות שמעלות סיכון.',
      src: 'marketing/cyber-city-lesson4-signals.mp4',
      poster: 'marketing/cyber-city-lesson4-signals-poster.jpg'
    },
    conditions: {
      title: 'סרטון תנאים',
      text: 'איך תנאי if בודק אם מילה קיימת בהודעה.',
      src: 'marketing/cyber-city-lesson4-conditions.mp4',
      poster: 'marketing/cyber-city-lesson4-conditions-poster.jpg'
    },
    scanner: {
      title: 'סרטון Message Scanner',
      text: 'איך מחברים כמה תנאים פשוטים לכלי בדיקה אחד.',
      src: 'marketing/cyber-city-lesson4-scanner.mp4',
      poster: 'marketing/cyber-city-lesson4-scanner-poster.jpg'
    },
    cases: {
      title: 'סרטון הרצה',
      text: 'איך בודקים כמה הודעות ומשווים תוצאות.',
      src: 'marketing/cyber-city-lesson4-cases.mp4',
      poster: 'marketing/cyber-city-lesson4-cases-poster.jpg'
    },
    report: {
      title: 'סרטון דוח סיום',
      text: 'איך מסבירים את הסימנים ואת הפעולה הבטוחה.',
      src: 'marketing/cyber-city-lesson4-report.mp4',
      poster: 'marketing/cyber-city-lesson4-report-poster.jpg'
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

  function calcRisk(signals) {
    let risk = 0;
    messageSignals.forEach(signal => {
      if (signals.has(signal.id)) risk += signal.points;
    });
    return Math.max(0, Math.min(100, risk));
  }

  function setRisk(value, text) {
    state.risk = Math.max(0, Math.min(100, value));
    $('riskScore').textContent = `${state.risk}%`;
    $('riskFill').style.width = `${state.risk}%`;
    $('riskFill').className = state.risk >= 70 ? 'high' : state.risk >= 40 ? 'medium' : 'low';
    $('riskText').textContent = text || 'Message Risk התעדכן לפי הסימנים.';
  }

  function recommendation(risk) {
    if (risk >= 70) return 'לא מגיבים מהר. בודקים מקור רשמי ומדווחים.';
    if (risk >= 40) return 'עוצרים ובודקים עוד לפני פעולה.';
    return 'נראה סיכון נמוך, אבל עדיין בודקים מי שלח.';
  }

  function progress() {
    return Math.round((state.completed.size / stations.length) * 100);
  }

  function analyzeMessage(message) {
    const lower = message.toLowerCase();
    const signals = new Set();
    messageSignals.forEach(signal => {
      if (lower.includes(signal.word)) signals.add(signal.id);
    });
    return {
      signals,
      risk: calcRisk(signals),
      lines: messageSignals.map(signal => `${signal.word}: ${lower.includes(signal.word) ? 'found' : 'not found'}`)
    };
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
      : '<em>עדיין אין הודעות בתיק.</em>';
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

  function renderBrief() {
    return `
      <section class="brief-grid">
        <article class="big-card">
          <span class="card-kicker">Message Detective</span>
          <img class="lab-visual" src="assets/cyber-city/inbox-sim.svg" alt="בדיקת הודעות">
          <h3>היום בודקים איך הודעה כתובה, לא רק לאן הקישור מוביל.</h3>
          <p>לפעמים הסיכון נמצא במילים: דחיפות, פרס, בקשת סיסמה או בקשת אימות. נבנה סורק קטן שמזהה את הסימנים האלה.</p>
        </article>
        <article class="tool-card">
          <span>מה נעמיק בפייתון?</span>
          <ol>
            <li><strong>msg</strong> הוא הטקסט של ההודעה.</li>
            <li><strong>in</strong> בודק אם מילה נמצאת בתוך ההודעה.</li>
            <li><strong>if</strong> מפעיל פעולה רק כשהתנאי נכון.</li>
            <li><strong>risk</strong> עולה לפי הסימנים שמצאנו.</li>
          </ol>
        </article>
      </section>
    `;
  }

  function renderSignals() {
    return `
      <section class="builder-grid">
        <article class="tool-card">
          <span>סימני ניסוח</span>
          <h3>בחרו סימן אחד ובדקו מה הוא אומר.</h3>
          <div class="block-list">
            ${messageSignals.map(signal => `
              <button class="rule-block ${state.chosenSignal === signal.id ? 'selected' : ''}" type="button" data-message-signal="${signal.id}">
                <span>
                  <strong>${esc(signal.label)}</strong>
                  <small>${esc(signal.word)} · ${esc(signal.meaning)}</small>
                </span>
                <em>+${signal.points}%</em>
              </button>
            `).join('')}
          </div>
        </article>
        <article class="scanner-preview">
          <span>כלל שיעור</span>
          <strong>Words Are Signals</strong>
          <p>מילה אחת לא מחליטה לבד, אבל כמה סימנים יחד יכולים להגיד לנו לעצור ולבדוק.</p>
          <button class="button" type="button" data-save-signal>שמור סימן בתיק</button>
        </article>
      </section>
    `;
  }

  function renderConditions() {
    const hasInput = state.msgText.trim().length > 0;
    const output = state.conditionRan && hasInput
      ? analyzeMessage(state.msgText).lines.join('\n')
      : 'הפלט יופיע כאן אחרי לחיצה על הרצה.';
    return `
      <section class="builder-grid console-lab">
        <article class="tool-card console-run-card">
          <span>תנאי if</span>
          <h3>תנאי שואל שאלה: האם המילה נמצאת בהודעה?</h3>
          <div class="console-steps" aria-label="שלבי בדיקת תנאי">
            <div><b>1</b><span>מדביקים הודעת דמו.</span></div>
            <div><b>2</b><span>לוחצים על הרצה.</span></div>
            <div><b>3</b><span>קוראים אילו מילים נמצאו.</span></div>
          </div>
          <label>הודעה לבדיקה
            <input class="lab-input" type="text" data-msg-text value="${esc(state.msgText)}" dir="ltr" lang="en">
          </label>
        </article>
        <article class="code-panel">
          <div class="code-panel-toolbar">
            <span>Python</span>
            <button class="button run-console-button code-run-button" type="button" data-run-condition>
              <span class="play-icon" aria-hidden="true"></span>
              <span>הרצה</span>
            </button>
          </div>
          <pre><code>msg = input("message: ")
if "urgent" in msg:
    print("urgent found")
if "password" in msg:
    print("password found")</code></pre>
          <div class="terminal-output console-output ${state.conditionRan && hasInput ? 'has-output' : ''}">
            <strong>פלט</strong>
            <p ${state.conditionRan && hasInput ? 'dir="ltr" lang="en"' : 'dir="rtl" lang="he"'}>${esc(output)}</p>
          </div>
        </article>
      </section>
    `;
  }

  function renderScanner() {
    return `
      <section class="builder-grid">
        <article class="tool-card">
          <span>Message Risk Builder</span>
          <h3>בחרו אילו תנאים ייכנסו לסורק ההודעות.</h3>
          <div class="block-list">
            ${messageSignals.map(signal => `
              <button class="rule-block ${state.scannerSignals.has(signal.id) ? 'selected' : ''}" type="button" data-scanner-signal="${signal.id}">
                <span>
                  <strong>${esc(signal.label)}</strong>
                  <small>if "${esc(signal.word)}" in msg · ${esc(signal.meaning)}</small>
                </span>
                <em>+${signal.points}%</em>
              </button>
            `).join('')}
          </div>
        </article>
        <article class="code-panel">
          <span>קוד שנוצר מהבחירות</span>
          <pre><code>${renderScannerCode()}</code></pre>
          <button class="button" type="button" data-save-scanner>שמור Message Scanner</button>
        </article>
      </section>
    `;
  }

  function renderScannerCode() {
    const lines = ['risk = 0', 'msg = input("message: ")'];
    messageSignals.forEach(signal => {
      if (!state.scannerSignals.has(signal.id)) return;
      lines.push(`if "${signal.word}" in msg:\n    risk += ${signal.points}`);
    });
    lines.push('print("Risk:", risk)');
    return lines.join('\n');
  }

  function renderCases() {
    const active = messageCases.find(item => item.id === state.activeCase) || messageCases[0];
    const signals = new Set(active.signals);
    const risk = calcRisk(signals);
    return `
      <section class="builder-grid">
        <article class="tool-card">
          <span>הודעות להרצה</span>
          <h3>בחרו הודעה והריצו עליה את ה־Message Scanner.</h3>
          <div class="mini-options">
            ${messageCases.map(item => `
              <button class="${state.activeCase === item.id ? 'selected' : ''}" type="button" data-message-case="${item.id}">
                <strong>${esc(item.title)}</strong>
                <small dir="ltr">${esc(item.msg)}</small>
              </button>
            `).join('')}
          </div>
        </article>
        <article class="scanner-preview run-result-panel">
          <span>תוצאת בדיקה</span>
          <strong>${risk}%</strong>
          <div class="risk-track"><div class="${risk >= 70 ? 'high' : risk >= 40 ? 'medium' : 'low'}" style="width:${risk}%"></div></div>
          <div class="run-summary">
            <b>${esc(active.title)}</b>
            <small dir="ltr">${esc(active.msg)}</small>
          </div>
          <ul class="run-signal-list">
            ${messageSignals.map(signal => `
              <li class="${signals.has(signal.id) ? 'active' : ''}">
                <span>${esc(signal.label)}</span>
                <strong>${signals.has(signal.id) ? `+${signal.points}` : '0'}</strong>
              </li>
            `).join('')}
          </ul>
          <p>${esc(active.action || recommendation(risk))}</p>
          <button class="button" type="button" data-save-case>שמור בדיקה</button>
        </article>
      </section>
    `;
  }

  function renderReport() {
    return `
      <section class="report-grid">
        <article class="tool-card">
          <span>Message Review</span>
          <h3>מסבירים את בדיקת ההודעה ב־3 שורות.</h3>
          <label>1. אילו מילים או בקשות מצאתם?
            <textarea data-report-field="checked" placeholder="לדוגמה: urgent, gift, password">${esc(state.report.checked)}</textarea>
          </label>
          <label>2. למה זה מעלה או לא מעלה סיכון?
            <textarea data-report-field="risk" placeholder="לדוגמה: ההודעה ביקשה פעולה מהר מדי">${esc(state.report.risk)}</textarea>
          </label>
          <label>3. מה הפעולה הבטוחה?
            <textarea data-report-field="action" placeholder="לדוגמה: לא מגיבים מהר, בודקים מקור רשמי">${esc(state.report.action)}</textarea>
          </label>
          <button class="button" type="button" data-check-report>בדוק וקבל תג</button>
        </article>
        <article class="badge-card">
          <span>תוצר שיעור 4</span>
          <strong>Message Risk Scanner</strong>
          <p>התלמיד יצא עם כלי קטן שמעמיק ב־if ובודק ניסוח של הודעה לפני שמגיבים.</p>
        </article>
      </section>
    `;
  }

  function renderContent() {
    const type = stations[state.station].type;
    if (type === 'brief') return renderBrief();
    if (type === 'signals') return renderSignals();
    if (type === 'conditions') return renderConditions();
    if (type === 'scanner') return renderScanner();
    if (type === 'cases') return renderCases();
    return renderReport();
  }

  function bindDynamicEvents() {
    document.querySelectorAll('[data-message-signal]').forEach(button => {
      button.addEventListener('click', () => {
        state.chosenSignal = button.dataset.messageSignal;
        render();
      });
    });
    document.querySelector('[data-save-signal]')?.addEventListener('click', () => {
      if (state.chosenSignal) {
        const signal = messageSignals.find(item => item.id === state.chosenSignal);
        complete('signals');
        addCase(`סימן ניסוח: ${signal.label} · ${signal.word}`);
        say('יפה. סימן אחד לא מחליט לבד, אבל הוא יכול להעלות Risk כשיש עוד סימנים.');
      } else {
        say('בחרו סימן אחד מהרשימה לפני השמירה.');
      }
      render();
    });
    document.querySelector('[data-msg-text]')?.addEventListener('input', event => {
      state.msgText = event.target.value;
      state.conditionRan = false;
    });
    document.querySelector('[data-run-condition]')?.addEventListener('click', () => {
      if (state.msgText.trim()) {
        const analysis = analyzeMessage(state.msgText);
        state.conditionRan = true;
        complete('conditions');
        setRisk(analysis.risk, recommendation(analysis.risk));
        addCase('if: הורצה בדיקת מילים בהודעה');
        say('מעולה. עכשיו רואים איך תנאי if מפעיל פעולה רק כשהמילה באמת נמצאת בהודעה.');
      } else {
        say('הדביקו הודעת דמו לפני ההרצה.');
      }
      render();
    });
    document.querySelectorAll('[data-scanner-signal]').forEach(button => {
      button.addEventListener('click', () => {
        const id = button.dataset.scannerSignal;
        if (state.scannerSignals.has(id)) state.scannerSignals.delete(id);
        else state.scannerSignals.add(id);
        render();
      });
    });
    document.querySelector('[data-save-scanner]')?.addEventListener('click', () => {
      if (state.scannerSignals.size >= 3) {
        complete('scanner');
        addCase('Scanner: נשמרו תנאי בדיקת הודעה');
        setRisk(calcRisk(state.scannerSignals), 'ה־Message Scanner מוכן לבדוק כמה תנאי if יחד.');
        say('בדיוק. זה עדיין אותו רעיון פשוט: כמה תנאים, וכל תנאי מוסיף נקודות רק אם הוא נכון.');
      } else {
        say('בחרו לפחות שלושה תנאים כדי שהסורק יהיה שימושי.');
      }
      render();
    });
    document.querySelectorAll('[data-message-case]').forEach(button => {
      button.addEventListener('click', () => {
        state.activeCase = button.dataset.messageCase;
        const active = messageCases.find(item => item.id === state.activeCase);
        const risk = calcRisk(new Set(active?.signals || []));
        setRisk(risk, active?.action || recommendation(risk));
        render();
      });
    });
    document.querySelector('[data-save-case]')?.addEventListener('click', () => {
      const active = messageCases.find(item => item.id === state.activeCase) || messageCases[0];
      const risk = calcRisk(new Set(active.signals));
      complete('cases');
      addCase(`הרצה: ${active.title} · Risk ${risk}%`);
      setRisk(risk, active.action);
      say('בדיקה נשמרה. עכשיו אפשר להסביר אילו מילים גרמו לתוצאה.');
      render();
    });
    document.querySelectorAll('[data-report-field]').forEach(field => {
      field.addEventListener('input', () => {
        state.report[field.dataset.reportField] = field.value;
      });
    });
    document.querySelector('[data-check-report]')?.addEventListener('click', () => {
      const ok = Object.values(state.report).every(value => value.trim().length >= 10);
      if (ok) {
        complete('report');
        addCase('Message Review: הוגש דוח בדיקת הודעה');
        say('שיעור 4 הושלם. העמקתם בתנאים ובניתם סורק הודעות קצר.');
      } else {
        say('כתבו משפט קצר בכל שדה. הדוח צריך להסביר את ההחלטה.');
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
      addCase('פתיחה: משימת Message Detective הוצגה');
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
    state.chosenSignal = '';
    state.msgText = 'urgent gift waiting now verify account';
    state.conditionRan = false;
    state.scannerSignals = new Set(['urgent', 'gift', 'password']);
    state.activeCase = 'gift';
    state.report = { checked: '', risk: '', action: '' };
    setRisk(0, 'הסיכון יתעדכן אחרי בדיקת הודעה.');
    say('התחלנו מחדש. בואו נבדוק ניסוח של הודעות עם תנאי if.');
    render();
  });

  render();
}());
