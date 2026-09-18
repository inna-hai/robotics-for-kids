(function () {
  const stations = [
    {
      id: 'brief',
      short: 'פתיחה',
      title: 'פתיחת משימה: שומרים על כניסה לחשבון',
      time: '10 דקות',
      goal: 'מבינים שסיסמה וקוד אימות הם מפתחות לחשבון, ולכן עובדים רק עם דוגמאות דמו.',
      type: 'brief'
    },
    {
      id: 'signals',
      short: 'סימנים',
      title: 'סימני חולשה בסיסיים',
      time: '15 דקות',
      goal: 'מזהים סיסמאות דמו קצרות, צפויות או כאלה שמכילות תבניות נפוצות.',
      type: 'signals'
    },
    {
      id: 'conditions',
      short: 'len',
      title: 'Python בודק אורך טקסט',
      time: '20 דקות',
      goal: 'לומדים את הפקודה len() ובודקים אם סיסמת דמו קצרה מדי.',
      type: 'conditions'
    },
    {
      id: 'scanner',
      short: 'Scanner',
      title: 'בונים Password Safety Checker',
      time: '20 דקות',
      goal: 'מחברים כמה תנאי if פשוטים לכלי שבודק סיסמת דמו ומחשב סיכון.',
      type: 'scanner'
    },
    {
      id: 'cases',
      short: 'הרצה',
      title: 'מריצים על סיסמאות דמו',
      time: '15 דקות',
      goal: 'בודקים כמה סיסמאות דמו ורואים איך כל סימן משפיע על התוצאה.',
      type: 'cases'
    },
    {
      id: 'report',
      short: 'דוח',
      title: 'דוח בטיחות חשבון',
      time: '10 דקות',
      goal: 'מסבירים מה בדקנו, למה זה מעלה סיכון, ומה כלל הזהב לגבי קוד אימות.',
      type: 'report'
    }
  ];

  const passwordSignals = [
    { id: 'short', label: 'קצרה מדי', code: 'len(pwd) < 8', meaning: 'קל יותר לנחש סיסמה קצרה', points: 35 },
    { id: 'numbers', label: '123', code: '"123" in pwd', meaning: 'תבנית נפוצה מאוד בסיסמאות חלשות', points: 25 },
    { id: 'word', label: 'password', code: '"password" in pwd', meaning: 'מילה צפויה שקל לזהות', points: 35 },
    { id: 'name', label: 'שם פרטי', code: '"inna" in pwd', meaning: 'מידע אישי שקל לנחש', points: 20 },
    { id: 'code', label: 'קוד אימות', code: 'share code', meaning: 'קוד אימות לא מוסרים בעקבות הודעה', points: 40 }
  ];

  const passwordCases = [
    {
      id: 'short',
      title: 'קצרה מדי',
      pwd: 'game7',
      otp: 'לא משתפים קוד אימות בהודעה',
      signals: ['short'],
      action: 'מאריכים את סיסמת הדמו ובוחרים משהו פחות צפוי.'
    },
    {
      id: 'numbers',
      title: 'תבנית צפויה',
      pwd: 'robot123',
      otp: 'לא מוסרים קוד אימות שמישהו ביקש בצ׳אט',
      signals: ['numbers'],
      action: 'לא משתמשים בתבניות כמו 123 בסיסמת דמו.'
    },
    {
      id: 'weak',
      title: 'חלשה מאוד',
      pwd: 'password123',
      otp: 'קוד אימות הוא מפתח רגעי',
      signals: ['numbers', 'word'],
      action: 'זו דוגמה חלשה. מחליפים לסיסמה דמיונית ארוכה ולא צפויה.'
    },
    {
      id: 'better',
      title: 'חזקה יותר',
      pwd: 'blueMoon_82',
      otp: 'גם עם סיסמה טובה לא משתפים קוד אימות',
      signals: [],
      action: 'סיכון נמוך יותר בדמו, ועדיין לא משתפים קוד אימות.'
    }
  ];

  const state = {
    station: 0,
    xp: 0,
    risk: 0,
    caseFile: [],
    completed: new Set(),
    chosenSignal: '',
    pwdText: 'password123',
    conditionRan: false,
    scannerSignals: new Set(['short', 'numbers', 'word']),
    activeCase: 'weak',
    report: {
      checked: '',
      risk: '',
      action: ''
    }
  };

  const stationVideos = {
    brief: {
      title: 'סרטון פתיחה',
      text: 'מה בודקים בשיעור ולמה סיסמה וקוד אימות הם מידע רגיש.',
      src: 'marketing/cyber-city-lesson5-brief.mp4',
      poster: 'marketing/cyber-city-lesson5-brief-poster.jpg'
    },
    signals: {
      title: 'סרטון סימני סיסמה',
      text: 'איך מזהים סיסמאות דמו קצרות, צפויות או נפוצות מדי.',
      src: 'marketing/cyber-city-lesson5-signals.mp4',
      poster: 'marketing/cyber-city-lesson5-signals-poster.jpg'
    },
    conditions: {
      title: 'סרטון len ותנאים',
      text: 'איך len בודק אורך, ואיך if מחליט אם להעלות Risk.',
      src: 'marketing/cyber-city-lesson5-conditions.mp4',
      poster: 'marketing/cyber-city-lesson5-conditions-poster.jpg'
    },
    scanner: {
      title: 'סרטון Password Checker',
      text: 'איך מחברים כמה תנאים פשוטים לכלי בדיקת סיסמת דמו.',
      src: 'marketing/cyber-city-lesson5-scanner.mp4',
      poster: 'marketing/cyber-city-lesson5-scanner-poster.jpg'
    },
    cases: {
      title: 'סרטון הרצה',
      text: 'איך בודקים כמה סיסמאות דמו ומשווים תוצאות.',
      src: 'marketing/cyber-city-lesson5-cases.mp4',
      poster: 'marketing/cyber-city-lesson5-cases-poster.jpg'
    },
    report: {
      title: 'סרטון דוח סיום',
      text: 'איך מסבירים את בדיקת הסיסמה ואת כלל קוד האימות.',
      src: 'marketing/cyber-city-lesson5-report.mp4',
      poster: 'marketing/cyber-city-lesson5-report-poster.jpg'
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
    passwordSignals.forEach(signal => {
      if (signals.has(signal.id)) risk += signal.points;
    });
    return Math.max(0, Math.min(100, risk));
  }

  function setRisk(value, text) {
    state.risk = Math.max(0, Math.min(100, value));
    $('riskScore').textContent = `${state.risk}%`;
    $('riskFill').style.width = `${state.risk}%`;
    $('riskFill').className = state.risk >= 70 ? 'high' : state.risk >= 40 ? 'medium' : 'low';
    $('riskText').textContent = text || 'Password Risk התעדכן לפי הסימנים.';
  }

  function recommendation(risk) {
    if (risk >= 70) return 'משנים את סיסמת הדמו ולא משתפים קוד אימות.';
    if (risk >= 40) return 'מחזקים את סיסמת הדמו ובודקים מה גרם לסיכון.';
    return 'נראה סיכון נמוך יותר, ועדיין לא משתפים קוד אימות.';
  }

  function progress() {
    return Math.round((state.completed.size / stations.length) * 100);
  }

  function analyzePassword(password) {
    const lower = password.toLowerCase();
    const signals = new Set();
    if (password.length < 8) signals.add('short');
    if (lower.includes('123')) signals.add('numbers');
    if (lower.includes('password')) signals.add('word');
    if (lower.includes('inna')) signals.add('name');
    return {
      signals,
      risk: calcRisk(signals),
      lines: [
        `length: ${password.length}`,
        `len(pwd) < 8: ${password.length < 8 ? 'true' : 'false'}`,
        `"123" in pwd: ${lower.includes('123') ? 'true' : 'false'}`,
        `"password" in pwd: ${lower.includes('password') ? 'true' : 'false'}`
      ]
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
      : '<em>עדיין אין בדיקות בתיק.</em>';
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
          <span class="card-kicker">Password Lab</span>
          <img class="lab-visual" src="assets/cyber-city/risk-engine.svg" alt="בדיקת סיסמת דמו">
          <h3>היום בודקים סיסמאות דמו וקודי אימות דמו, בלי להשתמש בפרטים אמיתיים.</h3>
          <p>המטרה היא להבין איך מגנים על כניסה לחשבון: סיסמה לא צפויה, קוד אימות שלא משתפים, ובדיקה לפני שמאמינים להודעה.</p>
        </article>
        <article class="tool-card">
          <span>מה נעמיק בפייתון?</span>
          <ol>
            <li><strong>pwd</strong> הוא טקסט של סיסמת דמו.</li>
            <li><strong>len()</strong> בודק כמה תווים יש בטקסט.</li>
            <li><strong>if</strong> מפעיל פעולה רק כשהתנאי נכון.</li>
            <li><strong>in</strong> בודק אם תבנית כמו 123 נמצאת בסיסמה.</li>
          </ol>
        </article>
      </section>
    `;
  }

  function renderSignals() {
    return `
      <section class="builder-grid">
        <article class="tool-card">
          <span>סימני סיסמה</span>
          <h3>בחרו סימן אחד ובדקו למה הוא מעלה סיכון.</h3>
          <div class="block-list">
            ${passwordSignals.map(signal => `
              <button class="rule-block ${state.chosenSignal === signal.id ? 'selected' : ''}" type="button" data-password-signal="${signal.id}">
                <span>
                  <strong>${esc(signal.label)}</strong>
                  <small>${esc(signal.code)} · ${esc(signal.meaning)}</small>
                </span>
                <em>+${signal.points}%</em>
              </button>
            `).join('')}
          </div>
        </article>
        <article class="scanner-preview">
          <span>כלל שיעור</span>
          <strong>Never Use Real Passwords</strong>
          <p>בלומדה בודקים רק דוגמאות. סיסמה אמיתית וקוד אימות לא כותבים ולא משתפים.</p>
          <button class="button" type="button" data-save-signal>שמור סימן בתיק</button>
        </article>
      </section>
    `;
  }

  function renderConditions() {
    const hasInput = state.pwdText.trim().length > 0;
    const output = state.conditionRan && hasInput
      ? analyzePassword(state.pwdText).lines.join('\n')
      : 'הפלט יופיע כאן אחרי לחיצה על הרצה.';
    return `
      <section class="builder-grid console-lab">
        <article class="tool-card console-run-card">
          <span>len ותנאי if</span>
          <h3>תנאי שואל שאלה: האם סיסמת הדמו קצרה מדי?</h3>
          <div class="console-steps" aria-label="שלבי בדיקת תנאי">
            <div><b>1</b><span>כותבים סיסמת דמו.</span></div>
            <div><b>2</b><span>לוחצים על הרצה.</span></div>
            <div><b>3</b><span>קוראים את אורך הטקסט ואת התנאים.</span></div>
          </div>
          <label>סיסמת דמו לבדיקה
            <input class="lab-input" type="text" data-pwd-text value="${esc(state.pwdText)}" dir="ltr" lang="en">
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
          <pre><code>pwd = input("password: ")
print(len(pwd))
if len(pwd) &lt; 8:
    print("too short")
if "123" in pwd:
    print("uses 123")</code></pre>
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
          <span>Password Checker Builder</span>
          <h3>בחרו אילו תנאים ייכנסו לבדיקת סיסמת הדמו.</h3>
          <div class="block-list">
            ${passwordSignals.filter(signal => signal.id !== 'code').map(signal => `
              <button class="rule-block ${state.scannerSignals.has(signal.id) ? 'selected' : ''}" type="button" data-scanner-signal="${signal.id}">
                <span>
                  <strong>${esc(signal.label)}</strong>
                  <small>if ${esc(signal.code)} · ${esc(signal.meaning)}</small>
                </span>
                <em>+${signal.points}%</em>
              </button>
            `).join('')}
          </div>
        </article>
        <article class="code-panel">
          <span>קוד שנוצר מהבחירות</span>
          <pre><code>${esc(renderScannerCode())}</code></pre>
          <button class="button" type="button" data-save-scanner>שמור Password Checker</button>
        </article>
      </section>
    `;
  }

  function renderScannerCode() {
    const lines = ['risk = 0', 'pwd = input("password: ")'];
    passwordSignals.forEach(signal => {
      if (!state.scannerSignals.has(signal.id)) return;
      if (signal.id === 'short') lines.push(`if len(pwd) < 8:\n    risk += ${signal.points}`);
      if (signal.id === 'numbers') lines.push(`if "123" in pwd:\n    risk += ${signal.points}`);
      if (signal.id === 'word') lines.push(`if "password" in pwd:\n    risk += ${signal.points}`);
      if (signal.id === 'name') lines.push(`if "inna" in pwd:\n    risk += ${signal.points}`);
    });
    lines.push('print("Risk:", risk)');
    return lines.join('\n');
  }

  function renderCases() {
    const active = passwordCases.find(item => item.id === state.activeCase) || passwordCases[0];
    const signals = new Set(active.signals);
    const risk = calcRisk(signals);
    return `
      <section class="builder-grid">
        <article class="tool-card">
          <span>סיסמאות דמו להרצה</span>
          <h3>בחרו סיסמת דמו והריצו עליה את ה־Password Checker.</h3>
          <div class="mini-options">
            ${passwordCases.map(item => `
              <button class="${state.activeCase === item.id ? 'selected' : ''}" type="button" data-password-case="${item.id}">
                <strong>${esc(item.title)}</strong>
                <small dir="ltr">${esc(item.pwd)}</small>
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
            <small dir="ltr">${esc(active.pwd)}</small>
            <small>${esc(active.otp)}</small>
          </div>
          <ul class="run-signal-list">
            ${passwordSignals.map(signal => `
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
          <span>Password Review</span>
          <h3>מסבירים את בדיקת סיסמת הדמו ב־3 שורות.</h3>
          <label>1. מה בדקתם בסיסמת הדמו?
            <textarea data-report-field="checked" placeholder="לדוגמה: אורך, 123, מילה צפויה">${esc(state.report.checked)}</textarea>
          </label>
          <label>2. למה זה מעלה או לא מעלה סיכון?
            <textarea data-report-field="risk" placeholder="לדוגמה: הסיסמה קצרה מדי או צפויה">${esc(state.report.risk)}</textarea>
          </label>
          <label>3. מה כלל הזהב לגבי קוד אימות?
            <textarea data-report-field="action" placeholder="לדוגמה: לא מוסרים קוד אימות בעקבות הודעה">${esc(state.report.action)}</textarea>
          </label>
          <button class="button" type="button" data-check-report>בדוק וקבל תג</button>
        </article>
        <article class="badge-card">
          <span>תוצר שיעור 5</span>
          <strong>Password Safety Checker</strong>
          <p>התלמיד יצא עם כלי קטן שבודק סיסמת דמו, משתמש ב־len וב־if, ומזכיר לא לשתף קוד אימות.</p>
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
    document.querySelectorAll('[data-password-signal]').forEach(button => {
      button.addEventListener('click', () => {
        state.chosenSignal = button.dataset.passwordSignal;
        render();
      });
    });
    document.querySelector('[data-save-signal]')?.addEventListener('click', () => {
      if (state.chosenSignal) {
        const signal = passwordSignals.find(item => item.id === state.chosenSignal);
        complete('signals');
        addCase(`סימן סיסמה: ${signal.label} · ${signal.code}`);
        say('יפה. סימן אחד לא מחליט לבד, אבל הוא עוזר להבין למה סיסמת דמו חלשה או חזקה יותר.');
      } else {
        say('בחרו סימן אחד מהרשימה לפני השמירה.');
      }
      render();
    });
    document.querySelector('[data-pwd-text]')?.addEventListener('input', event => {
      state.pwdText = event.target.value;
      state.conditionRan = false;
    });
    document.querySelector('[data-run-condition]')?.addEventListener('click', () => {
      if (state.pwdText.trim()) {
        const analysis = analyzePassword(state.pwdText);
        state.conditionRan = true;
        complete('conditions');
        setRisk(analysis.risk, recommendation(analysis.risk));
        addCase('len + if: הורצה בדיקת סיסמת דמו');
        say('מעולה. עכשיו רואים איך len מחזיר אורך, ואיך if מפעיל פעולה רק כשהתנאי נכון.');
      } else {
        say('כתבו סיסמת דמו לפני ההרצה. לא משתמשים בסיסמה אמיתית.');
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
        addCase('Checker: נשמרו תנאי בדיקת סיסמה');
        setRisk(calcRisk(state.scannerSignals), 'ה־Password Checker מוכן לבדוק כמה תנאי if יחד.');
        say('בדיוק. זה עדיין אותו רעיון פשוט: כמה תנאים, וכל תנאי מוסיף נקודות רק אם הוא נכון.');
      } else {
        say('בחרו לפחות שלושה תנאים כדי שהסורק יהיה שימושי.');
      }
      render();
    });
    document.querySelectorAll('[data-password-case]').forEach(button => {
      button.addEventListener('click', () => {
        state.activeCase = button.dataset.passwordCase;
        const active = passwordCases.find(item => item.id === state.activeCase);
        const risk = calcRisk(new Set(active?.signals || []));
        setRisk(risk, active?.action || recommendation(risk));
        render();
      });
    });
    document.querySelector('[data-save-case]')?.addEventListener('click', () => {
      const active = passwordCases.find(item => item.id === state.activeCase) || passwordCases[0];
      const risk = calcRisk(new Set(active.signals));
      complete('cases');
      addCase(`הרצה: ${active.title} · Risk ${risk}%`);
      setRisk(risk, active.action);
      say('בדיקה נשמרה. עכשיו אפשר להסביר אילו תנאים גרמו לתוצאה ומה עושים עם קוד אימות.');
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
        addCase('Password Review: הוגש דוח בטיחות חשבון');
        say('שיעור 5 הושלם. בדקתם סיסמאות דמו ובניתם Password Checker קצר.');
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
      addCase('פתיחה: משימת Password Lab הוצגה');
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
    state.pwdText = 'password123';
    state.conditionRan = false;
    state.scannerSignals = new Set(['short', 'numbers', 'word']);
    state.activeCase = 'weak';
    state.report = { checked: '', risk: '', action: '' };
    setRisk(0, 'הסיכון יתעדכן אחרי בדיקת סיסמת דמו.');
    say('התחלנו מחדש. בואו נבדוק סיסמאות דמו עם len ותנאי if.');
    render();
  });

  render();
}());
