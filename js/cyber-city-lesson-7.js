(function () {
  const stations = [
    { id: 'brief', short: 'פתיחה', title: 'פתיחת משימה: מעבדת האקר אתי', time: '10 דקות', goal: 'מבינים למה חושבים כמו תוקף רק בתוך מערכת צעצוע, כדי ללמוד להגן טוב יותר.', type: 'brief' },
    { id: 'concepts', short: 'מושגים', title: 'סרטונים ומשימות: שפת האקר אתי', time: '20 דקות', goal: 'לומדים Target, Vulnerability, Exploit, Fix וטרמינל דרך סרטון אנימציה ותרגול קצר לכל מושג.', type: 'concepts' },
    { id: 'login', short: 'Login', title: 'Login Toy: מוצאים חולשה ומתקנים', time: '20 דקות', goal: 'בודקים מערכת התחברות צעצוע, מגלים למה היא חלשה, ומוסיפים הגנות פשוטות.', type: 'login' },
    { id: 'terminal', short: 'טרמינל', title: 'Evidence Terminal: חוקרים תיק ראיות', time: '15 דקות', goal: 'משתמשים בפקודות לינוקס בסיסיות בתוך סימולציה: ls, cat ו־grep.', type: 'terminal' },
    { id: 'python', short: 'Python', title: 'Python Defense Checker', time: '15 דקות', goal: 'בונים בודק קטן שמזהה סיסמה קצרה מדי, רמז גלוי וחוסר הגבלת ניסיונות.', type: 'python' },
    { id: 'report', short: 'דוח', title: 'דוח Ethical Hacker', time: '10 דקות', goal: 'מסכמים איזו חולשה נמצאה, איך הוכחנו אותה בסביבה בטוחה, ומה תיקנו.', type: 'report' }
  ];

  const mediaVersion = '20260918-hacker-v1';
  const mediaUrl = path => `${path}?v=${mediaVersion}`;

  const stationVideos = {
    brief: { title: 'סרטון פתיחה', text: 'איך חוקרים חולשה בלי לפגוע במערכות אמיתיות.', src: 'marketing/cyber-city-lesson7-overview.mp4', poster: 'marketing/cyber-city-lesson7-overview-poster.jpg' },
    concepts: { title: 'סרטון מושגים', text: 'Target, Vulnerability, Exploit ו־Fix בשפה פשוטה.', src: 'marketing/cyber-city-lesson7-concepts.mp4', poster: 'marketing/cyber-city-lesson7-concepts-poster.jpg' },
    login: { title: 'סרטון Login Toy', text: 'איך סיסמה חלשה ורמז גלוי הופכים מערכת לפגיעה.', src: 'marketing/cyber-city-lesson7-login.mp4', poster: 'marketing/cyber-city-lesson7-login-poster.jpg' },
    terminal: { title: 'סרטון טרמינל', text: 'איך ls, cat ו־grep עוזרים לחקור קבצי ראיות בסביבה סגורה.', src: 'marketing/cyber-city-lesson7-terminal.mp4', poster: 'marketing/cyber-city-lesson7-terminal-poster.jpg' },
    python: { title: 'סרטון Python Defender', text: 'איך Python בודק אם מערכת התחברות מוגנת מספיק.', src: 'marketing/cyber-city-lesson7-python.mp4', poster: 'marketing/cyber-city-lesson7-python-poster.jpg' },
    report: { title: 'סרטון דוח סיום', text: 'איך מדווחים כמו האקר אתי: חולשה, הוכחה בטוחה ותיקון.', src: 'marketing/cyber-city-lesson7-report.mp4', poster: 'marketing/cyber-city-lesson7-report-poster.jpg' }
  };

  const conceptVideos = [
    {
      id: 'ethics',
      title: 'Ethical Hacker',
      text: 'בודקים רק באישור ורק כדי לתקן.',
      src: 'marketing/cyber-city-lesson7-concept-ethics.mp4',
      poster: 'marketing/cyber-city-lesson7-concept-ethics-poster.jpg',
      task: 'מה מותר להאקר אתי לעשות?',
      options: ['לבדוק מערכת אימון שקיבלנו אישור לבדוק', 'לנסות סיסמאות באתר אמיתי', 'לשלוח קישור חשוד לחבר'],
      answer: 'לבדוק מערכת אימון שקיבלנו אישור לבדוק'
    },
    {
      id: 'target',
      title: 'Target',
      text: 'המערכת שאותה בודקים בסביבת אימון.',
      src: 'marketing/cyber-city-lesson7-concept-target.mp4',
      poster: 'marketing/cyber-city-lesson7-concept-target-poster.jpg',
      task: 'מהו Target בשיעור שלנו?',
      options: ['מערכת צעצוע שמותר לבדוק', 'כל אתר באינטרנט', 'הטלפון של תלמיד אחר'],
      answer: 'מערכת צעצוע שמותר לבדוק'
    },
    {
      id: 'vulnerability',
      title: 'Vulnerability',
      text: 'חולשה שמישהו יכול לנצל.',
      src: 'marketing/cyber-city-lesson7-concept-vulnerability.mp4',
      poster: 'marketing/cyber-city-lesson7-concept-vulnerability-poster.jpg',
      task: 'איזו דוגמה היא חולשה?',
      options: ['סיסמה קצרה עם רמז גלוי', 'כפתור כניסה יפה', 'שם משתמש בעברית'],
      answer: 'סיסמה קצרה עם רמז גלוי'
    },
    {
      id: 'exploit',
      title: 'Exploit',
      text: 'שימוש בחולשה כדי להראות מה עלול לקרות.',
      src: 'marketing/cyber-city-lesson7-concept-exploit.mp4',
      poster: 'marketing/cyber-city-lesson7-concept-exploit-poster.jpg',
      task: 'מה עושים עם Exploit בשיעור?',
      options: ['מוכיחים חולשה בצעצוע ואז מתקנים', 'פורצים למערכת אמיתית', 'מוחקים קבצים'],
      answer: 'מוכיחים חולשה בצעצוע ואז מתקנים'
    },
    {
      id: 'fix',
      title: 'Fix',
      text: 'תיקון שמקטין את הסיכון.',
      src: 'marketing/cyber-city-lesson7-concept-fix.mp4',
      poster: 'marketing/cyber-city-lesson7-concept-fix-poster.jpg',
      task: 'איזה Fix הכי מתאים ל־Login חלש?',
      options: ['סיסמה חזקה והגבלת ניסיונות', 'להגדיל את הלוגו', 'להסתיר את כפתור הכניסה'],
      answer: 'סיסמה חזקה והגבלת ניסיונות'
    },
    {
      id: 'terminal',
      title: 'Linux Terminal',
      text: 'כלי חקירה קצר: מציגים קבצים ומחפשים מילים.',
      src: 'marketing/cyber-city-lesson7-concept-terminal.mp4',
      poster: 'marketing/cyber-city-lesson7-concept-terminal-poster.jpg',
      task: 'איזו פקודה מחפשת מילה בקובץ?',
      options: ['grep', 'paint', 'send'],
      answer: 'grep'
    }
  ];

  const loginAttempts = [
    { id: 'admin', value: 'admin', result: 'נכשל: זו לא הסיסמה, אבל היא קצרה מדי ומראה למה אסור לבחור מילים נפוצות.', weak: true },
    { id: 'city', value: 'city7', result: 'הצליח במערכת הצעצוע: הרמז “עיר + מספר” חשף סיסמה חלשה.', weak: true },
    { id: 'strong', value: 'River-92-Cloud', result: 'חזק יותר: ארוך, מגוון, ולא מופיע ברמז גלוי.', weak: false }
  ];

  const fixOptions = [
    { id: 'long', label: 'דרישת סיסמה ארוכה', value: 25 },
    { id: 'lockout', label: 'נעילה אחרי 3 ניסיונות', value: 30 },
    { id: 'hide-hint', label: 'לא מציגים רמז שמגלה את הסיסמה', value: 25 },
    { id: 'generic-error', label: 'שגיאת כניסה כללית', value: 20 }
  ];

  const terminalCommands = {
    ls: 'login_policy.txt\nattempts.log\nnotes.txt',
    'cat login_policy.txt': 'password_min_length=4\nmax_attempts=unlimited\nhint=city + one digit',
    'cat attempts.log': '09:10 user=demo pass=admin failed\n09:11 user=demo pass=city7 success\n09:12 user=demo pass=city8 failed',
    'grep unlimited login_policy.txt': 'max_attempts=unlimited',
    'grep hint login_policy.txt': 'hint=city + one digit'
  };

  const state = {
    station: 0,
    xp: 0,
    defense: 0,
    caseFile: [],
    completed: new Set(),
    watchedConcepts: new Set(),
    conceptTasks: {},
    selectedAttempt: '',
    selectedFixes: new Set(),
    terminalInput: 'ls',
    terminalOutput: '',
    foundEvidence: new Set(),
    pythonRan: false,
    report: { weakness: '', proof: '', fix: '' }
  };

  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

  function say(text) { $('assistantText').textContent = text; }
  function addCase(item) { if (!state.caseFile.includes(item)) state.caseFile.push(item); }
  function addXp(amount) { state.xp = Math.max(0, Math.min(100, state.xp + amount)); }
  function complete(id) {
    if (!state.completed.has(id)) {
      state.completed.add(id);
      addXp(Math.ceil(100 / stations.length));
    }
  }
  function setDefense(value, text) {
    state.defense = Math.max(0, Math.min(100, value));
    $('riskScore').textContent = `${state.defense}%`;
    $('riskFill').style.width = `${state.defense}%`;
    $('riskFill').className = state.defense >= 75 ? 'low' : state.defense >= 45 ? 'medium' : 'high';
    $('riskText').textContent = text || 'Defense Score התעדכן לפי התיקונים.';
  }
  function progress() { return Math.round((state.completed.size / stations.length) * 100); }
  function conceptTaskStatus(video) {
    const selected = state.conceptTasks[video.id];
    if (!selected) return '';
    return selected === video.answer ? 'correct' : 'wrong';
  }
  function conceptsCompleteCount() {
    return conceptVideos.filter(video => state.watchedConcepts.has(video.id) && state.conceptTasks[video.id] === video.answer).length;
  }
  function conceptsAreComplete() { return conceptsCompleteCount() === conceptVideos.length; }
  function selectedFixScore() {
    return fixOptions.filter(option => state.selectedFixes.has(option.id)).reduce((sum, option) => sum + option.value, 0);
  }
  function pythonScore() {
    const minLength = state.selectedFixes.has('long') ? 10 : 4;
    const lockout = state.selectedFixes.has('lockout');
    const noHint = state.selectedFixes.has('hide-hint');
    return [
      `min_length >= 10: ${minLength >= 10 ? 'true' : 'false'}`,
      `lockout_enabled: ${lockout ? 'true' : 'false'}`,
      `hint_is_safe: ${noHint ? 'true' : 'false'}`,
      `defense_score: ${selectedFixScore()}`
    ].join('\n');
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
    $('caseFile').innerHTML = state.caseFile.length ? state.caseFile.map(item => `<span>${esc(item)}</span>`).join('') : '<em>עדיין אין ממצאים בתיק.</em>';
  }

  function renderStationVideo() {
    const video = stationVideos[stations[state.station].id];
    if (!video) return '';
    return `
      <section class="stage-video-card" aria-label="${esc(video.title)}">
        <div class="stage-video-copy">
          <span>לפני שמתחילים</span>
          <h3>${esc(video.title)}</h3>
          <p>${esc(video.text)}</p>
        </div>
        <video controls preload="metadata" playsinline poster="${esc(mediaUrl(video.poster))}">
          <source src="${esc(mediaUrl(video.src))}" type="video/mp4">
        </video>
      </section>
    `;
  }

  function renderBrief() {
    return `
      <section class="brief-grid">
        <article class="big-card">
          <span class="card-kicker">Safe Attack Story</span>
          <div class="hacker-visual" aria-hidden="true">
            <b>TRAINING LOGIN</b>
            <span>hint: city + one digit</span>
            <strong>city7</strong>
          </div>
          <h3>מערכת האימון נפתחת מהר מדי.</h3>
          <p>מישהו הצליח להיכנס למערכת צעצוע כי הסיסמה הייתה קצרה, היה רמז גלוי, ולא הייתה הגבלת ניסיונות. התפקיד שלכם: להוכיח את החולשה בסביבה בטוחה, ואז לסגור אותה.</p>
          <p>לא נוגעים באתרים אמיתיים, לא מנסים סיסמאות של אנשים, ולא שולחים בקשות החוצה. הכול קורה בתוך הלומדה.</p>
        </article>
        <article class="tool-card">
          <span>רצף השיעור</span>
          <ol>
            <li>לומדים מושג בסרטון אנימציה.</li>
            <li>פותרים משימה קצרה על אותו מושג.</li>
            <li>בודקים Login Toy ומגלים חולשה.</li>
            <li>משתמשים במיני־טרמינל כדי למצוא ראיה.</li>
            <li>מריצים Python שמחשב כמה ההגנה חזקה.</li>
          </ol>
        </article>
        <article class="tool-card">
          <span>כלל אתי</span>
          <h3>קודם אישור, אחר כך בדיקה, בסוף תיקון.</h3>
          <p>זה ההבדל בין האקר שפוגע לבין האקר אתי: האקר אתי עובד עם רשות, בתוך גבולות, ומסיים בהמלצת הגנה.</p>
        </article>
      </section>
    `;
  }

  function renderConcepts() {
    return `
      <section class="concept-gate hacker-concepts" aria-label="סרטוני מושגים ותרגולים לשיעור 7">
        <article class="tool-card concept-gate-intro">
          <span>שער מושגים</span>
          <h3>כל מושג מקבל סרטון אנימציה ומשימה קצרה.</h3>
          <p>המעבדה נפתחת רק אחרי שמאשרים צפייה ופותרים את התרגול לכל ששת המושגים.</p>
          <strong>${conceptsCompleteCount()}/${conceptVideos.length}</strong>
        </article>
        <div class="concept-video-grid">
          ${conceptVideos.map(video => {
            const watched = state.watchedConcepts.has(video.id);
            const taskStatus = conceptTaskStatus(video);
            const done = watched && taskStatus === 'correct';
            return `
              <article class="concept-video-card ${done ? 'done' : ''} ${taskStatus === 'wrong' ? 'needs-fix' : ''}">
                <div>
                  <span>${done ? 'הושלם' : watched ? 'סרטון אושר' : 'ממתין לאישור'}</span>
                  <h4>${esc(video.title)}</h4>
                  <p>${esc(video.text)}</p>
                </div>
                <video controls preload="metadata" playsinline poster="${esc(mediaUrl(video.poster))}">
                  <source src="${esc(mediaUrl(video.src))}" type="video/mp4">
                </video>
                <button class="button concept-done-button" type="button" data-confirm-concept="${esc(video.id)}" ${watched ? 'disabled' : ''}>
                  ${watched ? 'אושר' : 'סיימתי לראות'}
                </button>
                <div class="concept-mini-task ${taskStatus}" aria-label="תרגול קצר: ${esc(video.title)}">
                  <b>משימה קטנה</b>
                  <p>${esc(video.task)}</p>
                  <div>
                    ${video.options.map(option => `
                      <button class="${state.conceptTasks[video.id] === option ? 'selected' : ''}" type="button" data-concept-answer="${esc(video.id)}" data-answer="${esc(option)}">${esc(option)}</button>
                    `).join('')}
                  </div>
                  ${taskStatus === 'correct' ? '<small>נכון. אפשר להמשיך.</small>' : taskStatus === 'wrong' ? '<small>כמעט. נסו שוב לפי הסרטון.</small>' : '<small>בחרו תשובה אחת.</small>'}
                </div>
              </article>
            `;
          }).join('')}
        </div>
      </section>
    `;
  }

  function renderLogin() {
    const attempt = loginAttempts.find(item => item.id === state.selectedAttempt);
    const score = selectedFixScore();
    return `
      <section class="hacker-lab-grid">
        <article class="tool-card login-toy">
          <span>Login Toy</span>
          <h3>נסו להבין למה מערכת הצעצוע חלשה.</h3>
          <div class="toy-login-box">
            <label>user<input value="demo" readonly></label>
            <label>password<input value="${esc(attempt?.value || '')}" readonly placeholder="בחרו ניסיון בדיקה"></label>
            <small>hint: city + one digit</small>
          </div>
          <div class="mini-options compact">
            ${loginAttempts.map(item => `
              <button class="${state.selectedAttempt === item.id ? 'selected' : ''}" type="button" data-login-attempt="${item.id}">
                <strong>${esc(item.value)}</strong>
                <span>${item.weak ? 'ניסיון שמראה חולשה' : 'דוגמה חזקה יותר'}</span>
              </button>
            `).join('')}
          </div>
          <p class="lab-feedback">${attempt ? esc(attempt.result) : 'בחרו ניסיון בדיקה. הכול קורה רק בתוך מערכת הצעצוע.'}</p>
        </article>
        <article class="tool-card">
          <span>Fix It</span>
          <h3>בחרו תיקונים שמעלים את ההגנה.</h3>
          <div class="fix-list">
            ${fixOptions.map(option => `
              <label class="${state.selectedFixes.has(option.id) ? 'selected' : ''}">
                <input type="checkbox" data-fix-option="${option.id}" ${state.selectedFixes.has(option.id) ? 'checked' : ''}>
                <span>${esc(option.label)}</span>
                <b>+${option.value}</b>
              </label>
            `).join('')}
          </div>
          <div class="run-summary">
            <b>Defense Score</b>
            <small>${score}/100</small>
          </div>
          <button class="button" type="button" data-save-login>${score >= 75 ? 'שמור והמשך לטרמינל' : 'בחרו מספיק תיקונים'}</button>
        </article>
      </section>
    `;
  }

  function renderTerminal() {
    return `
      <section class="hacker-lab-grid">
        <article class="tool-card">
          <span>Mini Linux Terminal</span>
          <h3>חוקרים קבצי ראיות בלי לצאת מהלומדה.</h3>
          <p>הפקודות המותרות כאן הן סימולציה בלבד: <span dir="ltr">ls</span>, <span dir="ltr">cat login_policy.txt</span>, <span dir="ltr">cat attempts.log</span>, <span dir="ltr">grep unlimited login_policy.txt</span>, <span dir="ltr">grep hint login_policy.txt</span>.</p>
          <label>פקודה
            <input class="lab-input" type="text" data-terminal-input value="${esc(state.terminalInput)}" dir="ltr" lang="en">
          </label>
          <button class="button" type="button" data-run-terminal>הרץ פקודה</button>
        </article>
        <article class="code-panel">
          <div class="code-panel-toolbar"><span>Terminal</span></div>
          <pre><code>$ ${esc(state.terminalInput)}</code></pre>
          <div class="terminal-output has-output">
            <strong>פלט</strong>
            <p dir="ltr" lang="en">${esc(state.terminalOutput || 'הפלט יופיע כאן אחרי הרצה.')}</p>
          </div>
          <div class="terminal-evidence">
            <span class="${state.foundEvidence.has('unlimited') ? 'found' : ''}">ראיה 1: אין הגבלת ניסיונות</span>
            <span class="${state.foundEvidence.has('hint') ? 'found' : ''}">ראיה 2: הרמז מגלה את הסיסמה</span>
          </div>
          <button class="button" type="button" data-save-terminal>${state.foundEvidence.size >= 2 ? 'שמור ראיות והמשך לפייתון' : 'מצאו 2 ראיות'}</button>
        </article>
      </section>
    `;
  }

  function renderPython() {
    const output = state.pythonRan ? pythonScore() : 'הפלט יופיע כאן אחרי לחיצה על הרצה.';
    return `
      <section class="builder-grid console-lab">
        <article class="tool-card">
          <span>Python Defense Checker</span>
          <h3>אותה בדיקה, אבל עכשיו Python מחשב מהר.</h3>
          <p>הקוד בודק אם למדיניות יש אורך מינימלי, הגבלת ניסיונות, ורמז שלא חושף את הסיסמה.</p>
          <button class="button run-console-button" type="button" data-run-python>
            <span class="play-icon" aria-hidden="true"></span>
            <span>הרץ בדיקה</span>
          </button>
        </article>
        <article class="code-panel">
          <div class="code-panel-toolbar"><span>Python</span></div>
          <pre><code>min_length = 10
lockout_enabled = True
hint_is_safe = True

score = 0
if min_length >= 10:
    score += 25
if lockout_enabled:
    score += 30
if hint_is_safe:
    score += 25
print("Defense:", score)</code></pre>
          <div class="terminal-output ${state.pythonRan ? 'has-output' : ''}">
            <strong>פלט</strong>
            <p ${state.pythonRan ? 'dir="ltr" lang="en"' : 'dir="rtl" lang="he"'}>${esc(output)}</p>
          </div>
        </article>
      </section>
    `;
  }

  function renderReport() {
    return `
      <section class="report-grid">
        <article class="tool-card">
          <span>Ethical Hacker Report</span>
          <h3>מסכמים חולשה, הוכחה בטוחה ותיקון.</h3>
          <label>1. איזו חולשה מצאתם?
            <textarea data-report-field="weakness" placeholder="לדוגמה: סיסמה קצרה ורמז גלוי">${esc(state.report.weakness)}</textarea>
          </label>
          <label>2. איך הוכחתם אותה בלי לפגוע?
            <textarea data-report-field="proof" placeholder="לדוגמה: בדקנו רק Login Toy בתוך הלומדה">${esc(state.report.proof)}</textarea>
          </label>
          <label>3. איזה תיקון בחרתם?
            <textarea data-report-field="fix" placeholder="לדוגמה: סיסמה ארוכה, נעילה אחרי 3 ניסיונות, בלי רמז גלוי">${esc(state.report.fix)}</textarea>
          </label>
          <button class="button" type="button" data-check-report>בדוק וקבל תג</button>
        </article>
        <article class="badge-card">
          <span>תוצר שיעור 7</span>
          <strong>Login Defense Kit</strong>
          <p>התלמיד למד למצוא חולשה במערכת צעצוע, להשתמש במיני־טרמינל לראיות, ולהציע תיקון הגנתי.</p>
          <div class="defender-summary">
            <b>מה אני יודע עכשיו?</b>
            <ul>
              <li><strong>Ethical Hacker</strong> בודק רק באישור ורק כדי לתקן.</li>
              <li><strong>Target</strong> הוא מערכת אימון שמותר לבדוק.</li>
              <li><strong>Vulnerability</strong> היא חולשה שאפשר לנצל.</li>
              <li><strong>Exploit</strong> מוכיח חולשה בסביבה בטוחה.</li>
              <li><strong>Fix</strong> סוגר את החולשה ומעלה הגנה.</li>
              <li><strong>Linux Terminal</strong> עוזר לקרוא קבצי ראיות.</li>
            </ul>
          </div>
          <div class="network-defender-badge" aria-label="תג Ethical Hacker">
            <span>ETHICAL HACKER</span>
            <strong>Safe Attack Lab</strong>
            <small>יודע לבדוק חולשה, להוכיח אותה בבטחה, ולהציע תיקון</small>
          </div>
        </article>
      </section>
    `;
  }

  function renderContent() {
    const type = stations[state.station].type;
    if (type === 'brief') return renderBrief();
    if (type === 'concepts') return renderConcepts();
    if (type === 'login') return renderLogin();
    if (type === 'terminal') return renderTerminal();
    if (type === 'python') return renderPython();
    return renderReport();
  }

  function bindDynamicEvents() {
    document.querySelectorAll('[data-confirm-concept]').forEach(button => {
      button.addEventListener('click', () => {
        state.watchedConcepts.add(button.dataset.confirmConcept);
        say('הסרטון אושר. עכשיו ודאו שגם המשימה הקטנה נכונה.');
        render({ preserveScroll: true });
      });
    });
    document.querySelectorAll('[data-concept-answer]').forEach(button => {
      button.addEventListener('click', () => {
        const video = conceptVideos.find(item => item.id === button.dataset.conceptAnswer);
        state.conceptTasks[video.id] = button.dataset.answer;
        const correct = state.conceptTasks[video.id] === video.answer;
        say(correct ? `נכון. הושלמו ${conceptsCompleteCount()}/${conceptVideos.length} מושגים.` : 'כמעט. נסו שוב לפי הסרטון.');
        if (conceptsAreComplete()) {
          complete('concepts');
          addCase('מושגים: הושלמו Ethical Hacker, Target, Vulnerability, Exploit, Fix וטרמינל');
        }
        render({ preserveScroll: true });
      });
    });
    document.querySelectorAll('[data-login-attempt]').forEach(button => {
      button.addEventListener('click', () => {
        state.selectedAttempt = button.dataset.loginAttempt;
        const attempt = loginAttempts.find(item => item.id === state.selectedAttempt);
        say(attempt.result);
        render({ preserveScroll: true });
      });
    });
    document.querySelectorAll('[data-fix-option]').forEach(input => {
      input.addEventListener('change', () => {
        if (input.checked) state.selectedFixes.add(input.dataset.fixOption);
        else state.selectedFixes.delete(input.dataset.fixOption);
        setDefense(selectedFixScore(), 'בחרתם תיקונים שמקטינים את הסיכון במערכת הצעצוע.');
        render({ preserveScroll: true });
      });
    });
    document.querySelector('[data-save-login]')?.addEventListener('click', () => {
      if (!conceptsAreComplete()) {
        say('לפני המעבדה משלימים את סרטוני המושגים והמשימות.');
        return;
      }
      if (selectedFixScore() < 75 || !state.selectedAttempt) {
        say('בחרו ניסיון בדיקה וגם מספיק תיקונים כדי להגיע להגנה טובה.');
        render({ preserveScroll: true });
        return;
      }
      complete('login');
      addCase('Login Toy: נמצאה חולשה ותוקנה בסיסמה חזקה, נעילה ורמז בטוח');
      say('מעולה. עכשיו נשתמש בטרמינל כדי למצוא ראיות למדיניות החלשה.');
      state.station = stations.findIndex(station => station.id === 'terminal');
      render();
    });
    document.querySelector('[data-terminal-input]')?.addEventListener('input', event => {
      state.terminalInput = event.target.value.trim();
    });
    document.querySelector('[data-run-terminal]')?.addEventListener('click', () => {
      const command = state.terminalInput.trim();
      state.terminalOutput = terminalCommands[command] || 'command not available in this training lab';
      if (command === 'grep unlimited login_policy.txt') state.foundEvidence.add('unlimited');
      if (command === 'grep hint login_policy.txt') state.foundEvidence.add('hint');
      say(terminalCommands[command] ? 'הפקודה רצה בתוך סימולציה. חפשו ראיות למדיניות חלשה.' : 'הפקודה הזו לא זמינה במעבדת הצעצוע.');
      render({ preserveScroll: true });
    });
    document.querySelector('[data-save-terminal]')?.addEventListener('click', () => {
      if (state.foundEvidence.size < 2) {
        say('עוד לא. צריך למצוא שתי ראיות: unlimited וגם hint.');
        render({ preserveScroll: true });
        return;
      }
      complete('terminal');
      addCase('Terminal: נמצאו ראיות למדיניות חלשה בקובץ login_policy.txt');
      say('מצוין. עכשיו Python יבדוק את ההגנות שבחרתם.');
      state.station = stations.findIndex(station => station.id === 'python');
      render();
    });
    document.querySelector('[data-run-python]')?.addEventListener('click', () => {
      state.pythonRan = true;
      complete('python');
      setDefense(selectedFixScore(), 'Python אישר את מדדי ההגנה לפי התיקונים שבחרתם.');
      addCase('Python: הורץ Defense Checker למדיניות ההתחברות');
      say('יפה. Python עזר לבדוק את מדיניות ההתחברות כמו בודק הגנה.');
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
        addCase('Ethical Hacker Report: הוגש דוח חולשה ותיקון');
        say('שיעור 7 הושלם. בדקתם חולשה בצורה אתית וסגרתם אותה.');
      } else {
        say('כתבו משפט קצר בכל שדה: חולשה, הוכחה בטוחה ותיקון.');
      }
      render();
    });
  }

  function render(options = {}) {
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    renderShell();
    $('stationContent').innerHTML = renderStationVideo() + renderContent();
    bindDynamicEvents();
    if (options.preserveScroll) {
      const restore = () => window.scrollTo({ left: scrollX, top: scrollY, behavior: 'auto' });
      requestAnimationFrame(() => {
        restore();
        requestAnimationFrame(restore);
      });
    }
  }

  $('nextStation').addEventListener('click', () => {
    if (state.station === 0) {
      complete('brief');
      addCase('פתיחה: הוגדרו גבולות האקר אתי ומערכת צעצוע');
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
    state.defense = 0;
    state.caseFile = [];
    state.completed.clear();
    state.watchedConcepts.clear();
    state.conceptTasks = {};
    state.selectedAttempt = '';
    state.selectedFixes.clear();
    state.terminalInput = 'ls';
    state.terminalOutput = '';
    state.foundEvidence.clear();
    state.pythonRan = false;
    state.report = { weakness: '', proof: '', fix: '' };
    setDefense(0, 'הציון יתעדכן אחרי שתתקנו חולשות.');
    say('התחלנו מחדש. נבדוק רק מערכת צעצוע ונלמד איך להגן עליה.');
    render();
  });

  render();
}());
