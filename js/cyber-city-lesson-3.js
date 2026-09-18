(function () {
  const stations = [
    {
      id: 'brief',
      short: 'פתיחה',
      title: 'פתיחת משימה: בודקים לפני שלוחצים',
      time: '10 דקות',
      goal: 'מבינים למה קישור יכול להיראות רשמי, אבל עדיין להוביל למקום לא נכון.',
      type: 'brief'
    },
    {
      id: 'parts',
      short: 'URL',
      title: 'פירוק URL',
      time: '15 דקות',
      goal: 'מזהים protocol, domain, path, ומה באמת קובע מי שולט בקישור.',
      type: 'parts'
    },
    {
      id: 'strings',
      short: 'Text',
      title: 'Python בודק טקסט',
      time: '20 דקות',
      goal: 'משתמשים ב־in וב־startswith כדי לבדוק מילים וחלקים בתוך קישור.',
      type: 'strings'
    },
    {
      id: 'checker',
      short: 'Checker',
      title: 'בונים Link Checker',
      time: '20 דקות',
      goal: 'בוחרים סימני קישור, והלומדה מתרגמת אותם לקוד קצר באנגלית נקייה.',
      type: 'checker'
    },
    {
      id: 'cases',
      short: 'הרצה',
      title: 'מריצים על קישורים',
      time: '15 דקות',
      goal: 'בודקים כמה קישורים ורואים איך Risk משתנה לפי הסימנים.',
      type: 'cases'
    },
    {
      id: 'report',
      short: 'דוח',
      title: 'דוח בדיקת קישור',
      time: '10 דקות',
      goal: 'מסבירים מה בדקנו, למה הקישור מסוכן או תקין, ומה הפעולה הבטוחה.',
      type: 'report'
    }
  ];

  const linkSignals = [
    { id: 'http', label: 'בלי https', variable: 'lock', meaning: 'הקישור לא מתחיל ב־https', points: 20 },
    { id: 'short', label: 'קישור קצר', variable: 'short', meaning: 'הכתובת מסתירה יעד', points: 25 },
    { id: 'login', label: 'מילת login', variable: 'login', meaning: 'מבקשים התחברות', points: 20 },
    { id: 'gift', label: 'מתנה או פרס', variable: 'gift', meaning: 'מבטיחים פרס מהיר', points: 20 },
    { id: 'verify', label: 'אימות דחוף', variable: 'verify', meaning: 'מבקשים אימות עכשיו', points: 30 }
  ];

  const linkCases = [
    {
      id: 'school',
      title: 'אתר בית ספר',
      url: 'https://school.org.il/library',
      signals: [],
      action: 'אפשר להמשיך לבדוק בתוך האתר הרשמי.'
    },
    {
      id: 'short',
      title: 'קישור קצר לפרס',
      url: 'http://bit.ly/free-gift-login',
      signals: ['http', 'short', 'gift', 'login'],
      action: 'לא לוחצים. בודקים מקור רשמי ומדווחים.'
    },
    {
      id: 'verify',
      title: 'אימות חשבון דחוף',
      url: 'https://game-verify.example/login-now',
      signals: ['login', 'verify'],
      action: 'לא מוסרים פרטים מתוך הודעה. נכנסים רק מאפליקציה רשמית.'
    },
    {
      id: 'store',
      title: 'חנות משחקים',
      url: 'https://games.example/store',
      signals: [],
      action: 'נראה סיכון נמוך, אבל עדיין בודקים שהדומיין מוכר.'
    }
  ];

  const state = {
    station: 0,
    xp: 0,
    risk: 0,
    caseFile: [],
    completed: new Set(),
    chosenDomain: '',
    urlText: 'http://bit.ly/free-gift-login',
    stringRan: false,
    signals: new Set(['http', 'short', 'gift']),
    activeCase: 'short',
    report: {
      checked: '',
      risk: '',
      action: ''
    }
  };

  const stationVideos = {
    brief: {
      title: 'סרטון פתיחה',
      text: 'מה בודקים בשיעור ולמה קישור יכול להטעות.',
      src: 'marketing/cyber-city-lesson3-brief.mp4',
      poster: 'marketing/cyber-city-lesson3-brief-poster.jpg'
    },
    parts: {
      title: 'סרטון פירוק URL',
      text: 'איך מזהים protocol, domain ו־path בלי להתבלבל ממילים מסביב.',
      src: 'marketing/cyber-city-lesson3-parts.mp4',
      poster: 'marketing/cyber-city-lesson3-parts-poster.jpg'
    },
    strings: {
      title: 'סרטון Python Text',
      text: 'איך Python בודק אם טקסט קיים בתוך קישור.',
      src: 'marketing/cyber-city-lesson3-strings.mp4',
      poster: 'marketing/cyber-city-lesson3-strings-poster.jpg'
    },
    checker: {
      title: 'סרטון Link Checker',
      text: 'איך סימני קישור הופכים לקוד קצר שמחשב Risk.',
      src: 'marketing/cyber-city-lesson3-checker.mp4',
      poster: 'marketing/cyber-city-lesson3-checker-poster.jpg'
    },
    cases: {
      title: 'סרטון הרצה',
      text: 'איך מריצים כמה קישורים ורואים תוצאה.',
      src: 'marketing/cyber-city-lesson3-cases.mp4',
      poster: 'marketing/cyber-city-lesson3-cases-poster.jpg'
    },
    report: {
      title: 'סרטון דוח סיום',
      text: 'איך מסבירים את בדיקת הקישור ואת הפעולה הבטוחה.',
      src: 'marketing/cyber-city-lesson3-report.mp4',
      poster: 'marketing/cyber-city-lesson3-report-poster.jpg'
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
    $('riskText').textContent = text || 'Link Risk התעדכן לפי הבדיקות.';
  }

  function calcRisk(signals) {
    let risk = 0;
    linkSignals.forEach(signal => {
      if (signals.has(signal.id)) risk += signal.points;
    });
    return Math.max(0, Math.min(100, risk));
  }

  function recommendation(risk) {
    if (risk >= 70) return 'לא לוחצים. בודקים מקור רשמי ומדווחים.';
    if (risk >= 40) return 'צריך לעצור ולבדוק עוד לפני פעולה.';
    return 'נראה סיכון נמוך, אבל עדיין בודקים שהדומיין מוכר.';
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
      : '<em>עדיין אין קישורים בתיק.</em>';
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
          <span class="card-kicker">URL Detective</span>
          <img class="lab-visual" src="assets/cyber-city/url-lab.svg" alt="בדיקת קישורים">
          <h3>היום בונים כלי שבודק קישור לפני שלוחצים.</h3>
          <p>לא צריך להיות מומחה. צריך לעצור, לפרק את הקישור, ולבדוק אילו סימנים מופיעים בו.</p>
        </article>
        <article class="tool-card">
          <span>מה לומדים?</span>
          <ol>
            <li><strong>domain</strong> הוא החלק הכי חשוב בקישור.</li>
            <li><strong>in</strong> בודק אם מילה קיימת בטקסט.</li>
            <li><strong>startswith</strong> בודק איך הטקסט מתחיל.</li>
            <li><strong>risk</strong> מצטבר לפי סימני הקישור.</li>
          </ol>
        </article>
      </section>
    `;
  }

  function renderParts() {
    const url = 'https://school-login.example/verify';
    return `
      <section class="builder-grid">
        <article class="tool-card">
          <span>URL Breakdown</span>
          <h3>איזה חלק באמת שולט בקישור?</h3>
          <pre dir="ltr"><code>${url}</code></pre>
          <div class="mini-options">
            ${[
              ['protocol', 'https://'],
              ['brand', 'school-login'],
              ['domain', 'example'],
              ['path', '/verify']
            ].map(([id, label]) => `
              <button class="${state.chosenDomain === id ? 'selected' : ''}" type="button" data-domain-part="${id}">
                <strong>${esc(label)}</strong>
                <small>${id === 'domain' ? 'זה הדומיין האמיתי' : 'זה חלק מהכתובת'}</small>
              </button>
            `).join('')}
          </div>
          <button class="button" type="button" data-check-domain>בדוק בחירה</button>
        </article>
        <article class="scanner-preview">
          <span>כלל שיעור</span>
          <strong>Domain First</strong>
          <p>מילים כמו school או login יכולות להופיע בשם, אבל הדומיין האמיתי הוא מה שקובע לאן הקישור שייך.</p>
        </article>
      </section>
    `;
  }

  function renderStrings() {
    const hasInput = state.urlText.trim().length > 0;
    const output = state.stringRan && hasInput
      ? analyzeUrl(state.urlText).lines.join('\n')
      : 'הפלט יופיע כאן אחרי לחיצה על הרצה.';
    return `
      <section class="builder-grid console-lab">
        <article class="tool-card console-run-card">
          <span>בדיקת טקסט</span>
          <h3>Python יכול לבדוק אם מילה נמצאת בתוך URL.</h3>
          <div class="console-steps" aria-label="שלבי בדיקת טקסט">
            <div><b>1</b><span>מדביקים קישור.</span></div>
            <div><b>2</b><span>לוחצים על הרצה.</span></div>
            <div><b>3</b><span>קוראים מה נמצא בקישור.</span></div>
          </div>
          <label>URL לבדיקה
            <input class="lab-input" type="text" data-url-text value="${esc(state.urlText)}" dir="ltr" lang="en">
          </label>
        </article>
        <article class="code-panel">
          <div class="code-panel-toolbar">
            <span>Python</span>
            <button class="button run-console-button code-run-button" type="button" data-run-string>
              <span class="play-icon" aria-hidden="true"></span>
              <span>הרצה</span>
            </button>
          </div>
          <pre><code>url = input("url: ")
if "login" in url:
    print("login found")
if url.startswith("https"):
    print("secure start")</code></pre>
          <div class="terminal-output console-output ${state.stringRan && hasInput ? 'has-output' : ''}">
            <strong>פלט</strong>
            <p ${state.stringRan && hasInput ? 'dir="ltr" lang="en"' : 'dir="rtl" lang="he"'}>${esc(output)}</p>
          </div>
        </article>
      </section>
    `;
  }

  function analyzeUrl(url) {
    const lower = url.toLowerCase();
    const signals = new Set();
    if (!lower.startsWith('https://')) signals.add('http');
    if (lower.includes('bit.ly') || lower.includes('tinyurl')) signals.add('short');
    if (lower.includes('login')) signals.add('login');
    if (lower.includes('gift') || lower.includes('free')) signals.add('gift');
    if (lower.includes('verify') || lower.includes('confirm')) signals.add('verify');
    return {
      signals,
      risk: calcRisk(signals),
      lines: [
        lower.startsWith('https://') ? 'https: yes' : 'https: no',
        lower.includes('login') ? 'login: found' : 'login: not found',
        lower.includes('gift') || lower.includes('free') ? 'gift: found' : 'gift: not found'
      ]
    };
  }

  function renderChecker() {
    return `
      <section class="builder-grid">
        <article class="tool-card">
          <span>Link Risk Builder</span>
          <h3>בחרו אילו סימנים הקוד צריך לבדוק.</h3>
          <div class="block-list">
            ${linkSignals.map(signal => `
              <button class="rule-block ${state.signals.has(signal.id) ? 'selected' : ''}" type="button" data-signal="${signal.id}">
                <span>
                  <strong>${esc(signal.label)}</strong>
                  <small>${esc(signal.variable)} · ${esc(signal.meaning)}</small>
                </span>
                <em>+${signal.points}%</em>
              </button>
            `).join('')}
          </div>
        </article>
        <article class="code-panel">
          <span>קוד שנוצר מהבחירות</span>
          <pre><code>${renderCheckerCode()}</code></pre>
          <button class="button" type="button" data-save-checker>שמור Link Checker</button>
        </article>
      </section>
    `;
  }

  function renderCheckerCode() {
    const lines = ['risk = 0', 'url = input("url: ")'];
    linkSignals.forEach(signal => {
      if (!state.signals.has(signal.id)) return;
      if (signal.id === 'http') lines.push('if not url.startswith("https"):\n    risk += 20');
      if (signal.id === 'short') lines.push('if "bit.ly" in url:\n    risk += 25');
      if (signal.id === 'login') lines.push('if "login" in url:\n    risk += 20');
      if (signal.id === 'gift') lines.push('if "gift" in url:\n    risk += 20');
      if (signal.id === 'verify') lines.push('if "verify" in url:\n    risk += 30');
    });
    lines.push('print("Risk:", risk)');
    return lines.join('\n');
  }

  function renderCases() {
    const active = linkCases.find(item => item.id === state.activeCase) || linkCases[0];
    const signals = new Set(active.signals);
    const risk = calcRisk(signals);
    return `
      <section class="builder-grid">
        <article class="tool-card">
          <span>קישורים להרצה</span>
          <h3>בחרו קישור והריצו עליו את ה־Link Checker.</h3>
          <div class="mini-options">
            ${linkCases.map(item => `
              <button class="${state.activeCase === item.id ? 'selected' : ''}" type="button" data-link-case="${item.id}">
                <strong>${esc(item.title)}</strong>
                <small dir="ltr">${esc(item.url)}</small>
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
            <small dir="ltr">${esc(active.url)}</small>
          </div>
          <ul class="run-signal-list">
            ${linkSignals.map(signal => `
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
          <span>Link Review</span>
          <h3>מסבירים את בדיקת הקישור ב־3 שורות.</h3>
          <label>1. מה בדקתם בקישור?
            <textarea data-report-field="checked" placeholder="לדוגמה: https, קישור קצר, login, gift, verify">${esc(state.report.checked)}</textarea>
          </label>
          <label>2. למה הסיכון נמוך או גבוה?
            <textarea data-report-field="risk" placeholder="לדוגמה: היו כמה סימנים שמעלים Risk">${esc(state.report.risk)}</textarea>
          </label>
          <label>3. מה הפעולה הבטוחה?
            <textarea data-report-field="action" placeholder="לדוגמה: לא לוחצים מההודעה, נכנסים רק מהאתר הרשמי">${esc(state.report.action)}</textarea>
          </label>
          <button class="button" type="button" data-check-report>בדוק וקבל תג</button>
        </article>
        <article class="badge-card">
          <span>תוצר שיעור 3</span>
          <strong>Python Link Checker</strong>
          <p>התלמיד יצא עם כלי קטן שבודק טקסט בתוך URL, מזהה סימנים, ומסביר החלטה בטוחה.</p>
        </article>
      </section>
    `;
  }

  function renderContent() {
    const type = stations[state.station].type;
    if (type === 'brief') return renderBrief();
    if (type === 'parts') return renderParts();
    if (type === 'strings') return renderStrings();
    if (type === 'checker') return renderChecker();
    if (type === 'cases') return renderCases();
    return renderReport();
  }

  function bindDynamicEvents() {
    document.querySelectorAll('[data-domain-part]').forEach(button => {
      button.addEventListener('click', () => {
        state.chosenDomain = button.dataset.domainPart;
        render();
      });
    });
    document.querySelector('[data-check-domain]')?.addEventListener('click', () => {
      if (state.chosenDomain === 'domain') {
        complete('parts');
        addCase('URL: זוהה הדומיין האמיתי');
        say('בדיוק. מילים לפני ואחרי יכולות לבלבל, אבל הדומיין הוא המרכז.');
      } else {
        say('כמעט. חפשו את החלק שמראה מי באמת שולט בקישור.');
      }
      render();
    });
    document.querySelector('[data-url-text]')?.addEventListener('input', event => {
      state.urlText = event.target.value;
      state.stringRan = false;
    });
    document.querySelector('[data-run-string]')?.addEventListener('click', () => {
      if (state.urlText.trim()) {
        const analysis = analyzeUrl(state.urlText);
        state.stringRan = true;
        complete('strings');
        setRisk(analysis.risk, recommendation(analysis.risk));
        addCase('Text: הורץ URL בקונסולת Python');
        say('יפה. עכשיו רואים ש־Python יכול לבדוק טקסט בתוך קישור.');
      } else {
        say('הדביקו URL לפני ההרצה.');
      }
      render();
    });
    document.querySelectorAll('[data-signal]').forEach(button => {
      button.addEventListener('click', () => {
        const id = button.dataset.signal;
        if (state.signals.has(id)) state.signals.delete(id);
        else state.signals.add(id);
        render();
      });
    });
    document.querySelector('[data-save-checker]')?.addEventListener('click', () => {
      if (state.signals.size >= 3) {
        complete('checker');
        addCase('Checker: נשמרו סימני בדיקת קישור');
        setRisk(calcRisk(state.signals), 'ה־Link Checker מוכן לבדוק כמה סימנים יחד.');
        say('מעולה. בניתם בדיקה שמחברת כמה סימנים לתוצאה אחת.');
      } else {
        say('בחרו לפחות שלושה סימנים כדי שהבודק יהיה שימושי.');
      }
      render();
    });
    document.querySelectorAll('[data-link-case]').forEach(button => {
      button.addEventListener('click', () => {
        state.activeCase = button.dataset.linkCase;
        const active = linkCases.find(item => item.id === state.activeCase);
        const risk = calcRisk(new Set(active?.signals || []));
        setRisk(risk, active?.action || recommendation(risk));
        render();
      });
    });
    document.querySelector('[data-save-case]')?.addEventListener('click', () => {
      const active = linkCases.find(item => item.id === state.activeCase) || linkCases[0];
      const risk = calcRisk(new Set(active.signals));
      complete('cases');
      addCase(`הרצה: ${active.title} · Risk ${risk}%`);
      setRisk(risk, active.action);
      say('בדיקה נשמרה. עכשיו אפשר להסביר למה הקישור קיבל את התוצאה הזאת.');
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
        addCase('Link Review: הוגש דוח בדיקת קישור');
        say('שיעור 3 הושלם. בניתם Link Checker וידעתם להסביר מה הוא בדק.');
      } else {
        say('כתבו משפט קצר בכל שדה. הדוח צריך להיות ברור למישהו אחר.');
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
      addCase('פתיחה: משימת URL Detective הוצגה');
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
    state.chosenDomain = '';
    state.urlText = 'http://bit.ly/free-gift-login';
    state.stringRan = false;
    state.signals = new Set(['http', 'short', 'gift']);
    state.activeCase = 'short';
    state.report = { checked: '', risk: '', action: '' };
    setRisk(0, 'הסיכון יתעדכן אחרי בדיקת קישור.');
    say('התחלנו מחדש. בואו נבדוק קישורים בצורה מסודרת.');
    render();
  });

  render();
}());
