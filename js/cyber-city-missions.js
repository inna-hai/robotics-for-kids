(function () {
  const stations = [
    {
      id: 'brief',
      short: 'פתיחה',
      title: 'פתיחת משימה: אנליסטים צעירים',
      time: '10 דקות',
      goal: 'מבינים את הסיפור: העיר קיבלה התרעות בתיבת הדואר, והמטרה היא לבנות כלי שמחליט מה מסוכן.',
      type: 'brief'
    },
    {
      id: 'inbox',
      short: 'Inbox',
      title: 'Inbox Simulator',
      time: '20 דקות',
      goal: 'פותחים הודעות מדומות, מסמנים ראיות, ומבדילים בין בטוח, חשוד וצריך לבדוק.',
      type: 'inbox'
    },
    {
      id: 'url',
      short: 'URL',
      title: 'URL Lab',
      time: '15 דקות',
      goal: 'מפרקים קישורים לחלקים: פרוטוקול, דומיין ונתיב. מזהים דומיין מתחזה.',
      type: 'url'
    },
    {
      id: 'otp',
      short: 'קוד אימות',
      title: 'OTP & Password Trap',
      time: '10 דקות',
      goal: 'מתרגלים מה עושים כשמישהו מבקש קוד אימות או סיסמה.',
      type: 'otp'
    },
    {
      id: 'builder',
      short: 'סורק',
      title: 'Build Your Scanner',
      time: '15 דקות',
      goal: 'בונים כלל סורק: אילו סימנים מעלים Risk ואיזו פעולה בטוחה לבחור.',
      type: 'builder'
    },
    {
      id: 'ai',
      short: 'AI',
      title: 'AI Safety Lab',
      time: '10 דקות',
      goal: 'לומדים איך להשתמש ב־AI בזהירות: מה מותר לשאול ומה אסור להעלות.',
      type: 'ai'
    },
    {
      id: 'ctf',
      short: 'אתגר',
      title: 'אתגר מסכם: מפעילים את הסורק שבניתם',
      time: '10 דקות',
      goal: 'פותרים אירוע משולב: משתמשים ב־URL Lab, OTP, Risk Scanner ו־AI Safety כדי לבחור תגובה בטוחה.',
      type: 'ctf'
    },
    {
      id: 'report',
      short: 'דוח',
      title: 'דוח בדיקת אירוע ותוצר סיום',
      time: '10 דקות',
      goal: 'מסכמים את האירוע המסכם שבדקתם: מה נמצא, למה זה מסוכן, ומה עושים עכשיו.',
      type: 'report'
    }
  ];

  const messages = [
    {
      id: 'library',
      from: 'ספריית בית הספר',
      subject: 'תזכורת החזרת ספר',
      body: 'שלום, הספר שהשאלת מוכן להחזרה השבוע. אפשר לבדוק פרטים באזור האישי באתר הספרייה.',
      verdict: 'safe',
      evidence: ['מקור צפוי', 'לא מבקש סיסמה', 'אין לחץ זמן'],
      attackerGoal: 'אין כאן תוקף ברור. זו הודעה צפויה שמבקשת רק לקרוא מידע.',
      attackerMove: 'כשאין בקשה רגישה ואין לחץ זמן, הסיכון נמוך יותר.',
      risk: 15
    },
    {
      id: 'otp',
      from: 'City Auth Support',
      subject: 'דחוף: אשרו קוד אימות',
      body: 'החשבון ייחסם עוד 5 דקות. שלחו כאן את קוד האימות שקיבלתם כדי להציל את החשבון.',
      verdict: 'danger',
      evidence: ['מבקש קוד אימות', 'לחץ זמן', 'מקור לא מאומת'],
      attackerGoal: 'להשיג קוד אימות כדי להיכנס לחשבון כאילו הוא המשתמש האמיתי.',
      attackerMove: 'יוצר לחץ זמן כדי שהילד ישלח קוד לפני שהוא חושב או שואל מבוגר.',
      risk: 95
    },
    {
      id: 'reset',
      from: 'support@school-secure-login.example',
      subject: 'איפוס חשבון',
      body: 'לחצו על הקישור כדי לאמת את הסיסמה שלכם: https://school-login-secure.example/verify',
      verdict: 'check',
      evidence: ['דומיין חשוד', 'בקשת סיסמה', 'קישור מתוך הודעה'],
      attackerGoal: 'לקבל סיסמה דרך דף שנראה כמו התחברות רשמית.',
      attackerMove: 'משתמש בדומיין עם מילים כמו school, login ו־secure כדי להיראות אמין.',
      risk: 82
    },
    {
      id: 'club',
      from: 'מועדון רובוטיקה',
      subject: 'עדכון שיעור',
      body: 'השיעור מחר יתחיל ב־16:00. אין צורך להיכנס לקישור או לשלוח פרטים.',
      verdict: 'safe',
      evidence: ['הקשר צפוי', 'לא מבקש מידע', 'אין קישור'],
      attackerGoal: 'אין כאן יעד תקיפה: לא מבקשים כסף, סיסמה, קוד או לחיצה.',
      attackerMove: 'הודעה רגילה נותנת מידע ולא דוחפת לפעולה מסוכנת.',
      risk: 10
    },
    {
      id: 'prize',
      from: 'Game Rewards',
      subject: 'זכית בפרס!',
      body: 'זכיתם בסקין נדיר. הכניסו שם משתמש וסיסמה כדי לקבל אותו עכשיו.',
      verdict: 'danger',
      evidence: ['פרס מפתה', 'מבקש סיסמה', 'לחץ לפעולה'],
      attackerGoal: 'לגנוב חשבון משחק או פריטים דיגיטליים דרך שם משתמש וסיסמה.',
      attackerMove: 'משתמש בפרס מפתה כדי לגרום לילד להתלהב ולפעול מהר.',
      risk: 90
    }
  ];

  const urlChallenges = [
    {
      url: 'https://school.edu/login',
      domain: 'school.edu',
      answer: 'school.edu',
      note: 'דומיין קצר וברור של בית הספר.'
    },
    {
      url: 'https://school-login-secure.example/verify',
      domain: 'school-login-secure.example',
      answer: 'school-login-secure.example',
      note: 'הדומיין משתמש במילים login ו־secure כדי להיראות אמין.'
    },
    {
      url: 'https://accounts.google.com.example-reset.net/check',
      domain: 'accounts.google.com.example-reset.net',
      answer: 'example-reset.net',
      note: 'המותג מופיע בהתחלה, אבל הדומיין האמיתי בסוף הוא example-reset.net.'
    },
    {
      url: 'https://library.school.edu/books',
      domain: 'library.school.edu',
      answer: 'school.edu',
      note: 'תת־דומיין של school.edu. עדיין בודקים הקשר, אבל זה נראה סביר.'
    }
  ];

  const aiCards = [
    { text: 'להדביק הודעה אמיתית עם מספר טלפון ושם מלא', safe: false },
    { text: 'לשאול AI להסביר מה זה דומיין בדוגמה מדומה', safe: true },
    { text: 'להעלות צילום מסך עם קוד אימות', safe: false },
    { text: 'לבקש מ־AI משוב על דוח בלי פרטים אישיים', safe: true }
  ];

  const state = {
    station: 0,
    xp: 0,
    risk: 0,
    caseFile: [],
    completed: new Set(),
    inboxEvidence: new Set(),
    urlAnswers: {},
    otpChoice: '',
    scannerRules: new Set(),
    aiAnswers: {},
    ctfEvidence: new Set(),
    ctfChoice: '',
    report: {
      found: '',
      risk: '',
      action: ''
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

  function addCase(item) {
    if (!state.caseFile.includes(item)) state.caseFile.push(item);
  }

  function addXp(amount) {
    state.xp = Math.max(0, Math.min(100, state.xp + amount));
  }

  function setRisk(value, text) {
    state.risk = Math.max(0, Math.min(100, value));
    $('riskScore').textContent = `${state.risk}%`;
    $('riskFill').style.width = `${state.risk}%`;
    $('riskFill').className = state.risk >= 75 ? 'high' : state.risk >= 45 ? 'medium' : 'low';
    $('riskText').textContent = text || 'הסיכון מתעדכן לפי הסימנים שנמצאו.';
  }

  function say(text) {
    $('assistantText').textContent = text;
  }

  function complete(stationId) {
    if (!state.completed.has(stationId)) {
      state.completed.add(stationId);
      addXp(12);
    }
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
      : '<em>עדיין אין ראיות בתיק.</em>';
  }

  function renderBrief() {
    return `
      <section class="brief-grid">
        <article class="big-card">
          <span class="card-kicker">הסיפור</span>
          <img class="lab-visual" src="assets/cyber-city/soc-lab.svg" alt="עמדת מעבדת סייבר עם מסכים וסורק">
          <h3>תיבת הדואר של עיר הסייבר מקבלת התרעות.</h3>
          <p>אתם צוות SOC צעיר. במקום לקרוא הרצאה, אתם תפעילו סימולטורים ותבנו כלי קטן שמחשב Risk.</p>
        </article>
        <article class="tool-card">
          <span>למה בכלל יש פישינג?</span>
          <h3>התוקף לא רוצה “להציק”. הוא רוצה לגרום לנו לבצע פעולה.</h3>
          <div class="attacker-map">
            <div><strong>המטרה</strong><span>חשבון, סיסמה, קוד אימות, פריטים במשחק או מידע אישי.</span></div>
            <div><strong>הטריק</strong><span>לחץ זמן, פרס, התחזות לתמיכה, או קישור שנראה רשמי.</span></div>
            <div><strong>ההגנה</strong><span>עוצרים, בודקים מקור, לא מוסרים קוד, ונכנסים רק דרך אתר רשמי.</span></div>
          </div>
        </article>
        <article class="tool-card">
          <span>מה עושים היום?</span>
          <ol>
            <li>חוקרים הודעות בתיבת דואר.</li>
            <li>מפרקים URL לדומיין אמיתי.</li>
            <li>מתרגלים מלכודת קוד אימות.</li>
            <li>בונים Risk Scanner בבלוקים.</li>
            <li>מסיימים אתגר מסכם ודוח חוקר.</li>
          </ol>
        </article>
      </section>
    `;
  }

  function renderInbox() {
    const active = messages.find(message => state.activeMessage === message.id) || messages[0];
    state.activeMessage = active.id;
    const riskLabel = active.risk >= 80 ? 'חשוד מאוד' : active.risk >= 50 ? 'צריך לבדוק' : 'נראה רגוע';
    return `
      <section class="sim-grid">
        <div class="inbox-list">
          ${messages.map(message => `
            <button class="mail-item ${active.id === message.id ? 'active' : ''}" type="button" data-message="${esc(message.id)}">
              <span>${esc(message.from)}</span>
              <strong>${esc(message.subject)}</strong>
              <small>${message.risk >= 80 ? 'חשוד מאוד' : message.risk >= 50 ? 'צריך לבדוק' : 'נראה רגוע'}</small>
            </button>
          `).join('')}
        </div>
        <article class="phone-card inbox-simulator">
          <span class="card-kicker">סימולטור הודעות</span>
          <img class="station-visual" src="assets/cyber-city/inbox-sim.svg" alt="תיבת הודעות מדומה עם סימני ראיות">
          <div class="mail-window">
            <div class="mail-window-head">
              <strong>${esc(active.subject)}</strong>
              <span>${riskLabel}</span>
            </div>
            <button class="inspect-row ${state.inboxEvidence.has(active.id + 'from') ? 'selected' : ''}" type="button" data-inbox-evidence="${esc(active.id + 'from')}" data-risk="${active.risk}">
              <span>שולח</span>
              <strong>${esc(active.from)}</strong>
            </button>
            <button class="inspect-row ${state.inboxEvidence.has(active.id + 'request') ? 'selected' : ''}" type="button" data-inbox-evidence="${esc(active.id + 'request')}" data-risk="${active.risk}">
              <span>מה מבקשים ממני?</span>
              <strong>${esc(active.body)}</strong>
            </button>
            <div class="attacker-note">
              <span>מפת תוקף</span>
              <strong>מה הוא רוצה להשיג?</strong>
              <p>${esc(active.attackerGoal)}</p>
              <strong>איך הוא מנסה לגרום לנו לפעול?</strong>
              <p>${esc(active.attackerMove)}</p>
            </div>
            <div class="tap-hints">
              <span>לחצו על החלקים בהודעה כדי להכניס אותם לתיק הראיות.</span>
            </div>
          </div>
          <div class="evidence-actions compact">
            ${active.evidence.map(item => `
              <button class="evidence-pill ${state.inboxEvidence.has(active.id + item) ? 'selected' : ''}" type="button" data-inbox-evidence="${esc(active.id + item)}" data-risk="${active.risk}">
                ${esc(item)}
              </button>
            `).join('')}
          </div>
        </article>
        <article class="tool-card">
          <span>תיק ראיות</span>
          <h3>פתחו הודעות ואספו לפחות 7 ראיות.</h3>
          <p>הילד לא מנחש תשובה. הוא בודק חלקים בהודעה: מי שלח, מה מבקשים, האם יש לחץ, והאם מבקשים מידע רגיש.</p>
          <strong>${state.inboxEvidence.size}/7 ראיות</strong>
          <button class="button" type="button" data-check-inbox>בדוק תיק Inbox</button>
        </article>
      </section>
    `;
  }

  function renderUrlLab() {
    return `
      <section class="url-lab">
        ${urlChallenges.map((item, index) => {
          const breakdown = parseUrl(item.url);
          const parts = breakdown.options;
          const selected = state.urlAnswers[index];
          return `
            <article class="url-card">
              <span class="card-kicker">URL ${index + 1}</span>
              ${index === 0 ? '<img class="station-visual" src="assets/cyber-city/url-lab.svg" alt="פירוק כתובת URL לפרוטוקול דומיין ונתיב">' : ''}
              <code>${esc(item.url)}</code>
              <div class="url-breakdown">
                <div><span>פרוטוקול</span><strong>${esc(breakdown.protocol)}</strong></div>
                <div><span>שם מלא</span><strong>${esc(breakdown.host)}</strong></div>
                <div><span>נתיב</span><strong>${esc(breakdown.path || '/')}</strong></div>
              </div>
              <h3>מי שולט בכתובת?</h3>
              <div class="url-parts">
                ${parts.map(part => `
                  <button class="${selected === part ? 'selected' : ''}" type="button" data-url-index="${index}" data-url-answer="${esc(part)}">${esc(part)}</button>
                `).join('')}
              </div>
              <p>${selected ? (selected === item.answer ? 'נכון: ' + item.note : 'לא בדיוק. חפשו את הדומיין ששולט בכתובת.') : 'לחצו על הדומיין האמיתי.'}</p>
            </article>
          `;
        }).join('')}
      </section>
      <button class="button" type="button" data-check-url>בדוק URL Lab</button>
    `;
  }

  function parseUrl(url) {
    const protocol = url.startsWith('https://') ? 'https' : 'http';
    const clean = url.replace(/^https?:\/\//, '');
    const pieces = clean.split('/');
    const host = pieces[0];
    const path = '/' + pieces.slice(1).join('/');
    const hostParts = host.split('.');
    const domain = hostParts.length > 2 ? hostParts.slice(-2).join('.') : host;
    const options = [protocol, host, domain, path].filter(Boolean);
    return {
      protocol,
      host,
      path,
      options: Array.from(new Set(options))
    };
  }

  function renderOtp() {
    return `
      <section class="chat-lab">
        <article class="chat-phone">
          <div class="chat-line them">קיבלת קוד אימות: 482911</div>
          <div class="chat-line them danger">היי, זה צוות התמיכה. שלחי לי את הקוד כדי שלא נחסום את החשבון.</div>
          <div class="chat-options">
            <button class="${state.otpChoice === 'send' ? 'selected' : ''}" data-otp-choice="send">לשלוח את הקוד</button>
            <button class="${state.otpChoice === 'ignore' ? 'selected' : ''}" data-otp-choice="ignore">לא לשלוח, לדווח ולבדוק דרך מקור רשמי</button>
            <button class="${state.otpChoice === 'ask' ? 'selected' : ''}" data-otp-choice="ask">לשאול אותם למה הם צריכים</button>
          </div>
        </article>
        <article class="tool-card">
          <span>כלל זהב</span>
          <h3>קוד אימות לא מוסרים לאף אחד.</h3>
          <p>גם אם זה נראה כמו תמיכה, גם אם מלחיצים, גם אם אומרים שזה דחוף.</p>
          <button class="button" type="button" data-check-otp>בדוק החלטה</button>
        </article>
      </section>
    `;
  }

  function renderBuilder() {
    const blocks = [
      ['unknownSender', 'שולח לא מוכר', 'אם לא יודעים מי שלח, חייבים לבדוק לפני פעולה.', 20],
      ['weirdDomain', 'דומיין מתחזה', 'כתובת שנראית דומה למותג, אבל היא לא האתר הרשמי.', 30],
      ['pressure', 'לחץ זמן', 'משפטים כמו "עכשיו" או "החשבון ייחסם" גורמים לנו למהר.', 20],
      ['password', 'בקשת סיסמה', 'שום הודעה לא אמורה לבקש סיסמה בתוך קישור.', 35],
      ['otp', 'בקשת קוד אימות', 'קוד אימות לא מוסרים לאף אחד, גם לא ל"תמיכה".', 40]
    ];
    const score = blocks.reduce((sum, block) => state.scannerRules.has(block[0]) ? sum + block[3] : sum, 0);
    const capped = Math.min(100, score);
    return `
      <section class="builder-grid">
        <article class="tool-card">
          <span>בנו כלל לסורק</span>
          <h3>אילו סימנים צריכים להדליק נורה אדומה?</h3>
          <p class="builder-help">לחצו על כל סימן שהסורק שלכם צריך לזהות. ככל שיש יותר סימנים מסוכנים, מד הסיכון עולה.</p>
          <div class="block-list">
            ${blocks.map(block => `
              <button class="rule-block ${state.scannerRules.has(block[0]) ? 'selected' : ''}" type="button" data-rule="${block[0]}">
                <span>
                  <strong>${esc(block[1])}</strong>
                  <small>${esc(block[2])}</small>
                </span>
                <em>מוסיף ${block[3]}%</em>
              </button>
            `).join('')}
          </div>
        </article>
        <article class="scanner-preview">
          <span>Cyber Safety Scanner v1</span>
          <img class="station-visual" src="assets/cyber-city/scanner-flow.svg" alt="סורק סייבר עם שלבי בדיקה ותגובה בטוחה">
          <strong>${capped}%</strong>
          <div class="risk-track"><div class="${capped >= 75 ? 'high' : capped >= 45 ? 'medium' : 'low'}" style="width:${capped}%"></div></div>
          <div class="scanner-flow">
            <div class="${state.scannerRules.has('weirdDomain') ? 'active' : ''}">URL</div>
            <div class="${state.scannerRules.has('password') || state.scannerRules.has('otp') ? 'active' : ''}">מידע רגיש</div>
            <div class="${state.scannerRules.has('pressure') ? 'active' : ''}">לחץ זמן</div>
            <div class="${capped >= 75 ? 'active danger' : ''}">תגובה בטוחה</div>
          </div>
          <p>${capped >= 75 ? 'הסורק שלכם מזהה מצב מסוכן: לא לוחצים, מדווחים ובודקים מקור רשמי.' : capped >= 45 ? 'הסורק שלכם מזהה מצב שדורש בדיקה נוספת לפני פעולה.' : 'הסורק שלכם מזהה מעט סימנים. עדיין בודקים הקשר לפני שלוחצים.'}</p>
          <button class="button" type="button" data-check-builder>שמור את הסורק</button>
        </article>
      </section>
    `;
  }

  function renderAiLab() {
    return `
      <section class="sort-grid">
        ${aiCards.map((card, index) => `
          <article class="sort-card">
            <p>${esc(card.text)}</p>
            <div>
              <button class="${state.aiAnswers[index] === true ? 'selected' : ''}" data-ai-index="${index}" data-ai-safe="true">מותר</button>
              <button class="${state.aiAnswers[index] === false ? 'selected' : ''}" data-ai-index="${index}" data-ai-safe="false">אסור</button>
            </div>
          </article>
        `).join('')}
      </section>
      <button class="button" type="button" data-check-ai>בדוק AI Safety</button>
    `;
  }

  function renderCtf() {
    const capstoneSignals = [
      'ה־URL נראה כמו school אבל הדומיין האמיתי הוא school-login-secure.example',
      'ההודעה מבקשת סיסמה דרך קישור',
      'יש לחץ זמן: "החשבון ייחסם עוד 5 דקות"',
      'בצ׳אט מבקשים קוד אימות — קוד לא מוסרים',
      'אסור להעלות צילום עם קוד אימות ל־AI'
    ];
    const capstoneActions = [
      {
        id: 'click',
        title: 'ללחוץ מהר כדי להציל את החשבון',
        text: 'פעולה מסוכנת: ההודעה בדיוק מנסה לגרום לנו למהר.'
      },
      {
        id: 'ask-ai',
        title: 'להעלות צילום מסך מלא ל־AI',
        text: 'לא בטוח: צילום יכול לכלול קוד, שם משתמש או פרטים אישיים.'
      },
      {
        id: 'safe-plan',
        title: 'לא ללחוץ, לא למסור קוד, לדווח ולאמת באתר הרשמי',
        text: 'פעולה בטוחה: משתמשים בכל הראיות ומוודאים בערוץ אחר.'
      }
    ];
    return `
      <section class="ctf-grid">
        <article class="tool-card">
          <span>אתגר סיכום</span>
          <h3>אירוע משולב: מפעילים את הסורק שבניתם</h3>
          <p>זה לא עוד תרגיל קישור. כאן מחברים את כל הכלים מהשיעור כדי לסגור אירוע.</p>
          <ol class="task-steps">
            <li>קראו את חבילת האירוע.</li>
            <li>סמנו לפחות 4 ראיות מסוגים שונים.</li>
            <li>בחרו את פעולת התגובה הבטוחה ביותר.</li>
          </ol>
          <div class="event-packet">
            <strong>חבילת אירוע</strong>
            <p>הגיעה הודעת איפוס חשבון עם הקישור <code>https://school-login-secure.example/verify</code>. במקביל התקבל צ׳אט מ“תמיכה” שמבקש קוד אימות, ויש אזהרה שהחשבון ייחסם תוך 5 דקות.</p>
          </div>
        </article>
        <article class="tool-card">
          <span>שלב 1: בוחרים ראיות</span>
          <h3>אילו סימנים הסורק צריך לסמן?</h3>
          <p>סמנו ראיות שמגיעות מתחנות שונות: URL, OTP, לחץ, סיסמה ו־AI Safety.</p>
          <div class="evidence-actions">
            ${capstoneSignals.map(item => `
              <button class="${state.ctfEvidence.has(item) ? 'selected' : ''}" data-ctf-evidence="${esc(item)}">${esc(item)}</button>
            `).join('')}
          </div>
        </article>
        <article class="tool-card">
          <span>שלב 2: פעולת תגובה</span>
          <h3>מה עושים עכשיו?</h3>
          <p>בחרו פעולה לפי הראיות שאספתם. המטרה היא לא “לנצח מהר”, אלא לא לסכן חשבון אמיתי.</p>
          <div class="mini-options">
            ${capstoneActions.map(action => `
              <button class="${state.ctfChoice === action.id ? 'selected' : ''}" data-ctf-choice="${action.id}">
                <strong>${esc(action.title)}</strong>
                <small>${esc(action.text)}</small>
              </button>
            `).join('')}
          </div>
        </article>
        <article class="tool-card">
          <span>שלב 3: בדיקת הסורק</span>
          <h3>האם הסורק מוכן לפתוח תג?</h3>
          <p>צריך לפחות 4 ראיות ופעולת תגובה בטוחה. אם חסר משהו, חוזרים ומוסיפים.</p>
          <button class="button" type="button" data-check-ctf>בדקו את הסורק שלי</button>
        </article>
      </section>
    `;
  }

  function renderReport() {
    const collectedEvidence = Array.from(state.ctfEvidence);
    const hasSafePlan = state.ctfChoice === 'safe-plan';
    return `
      <section class="report-grid">
        <article class="tool-card">
          <span>דוח בדיקת אירוע</span>
          <h3>על מה הדוח?</h3>
          <p>הדוח הוא לא חיבור. זה סיכום קצר של האירוע המסכם שבדקתם עכשיו: הודעה עם קישור חשוד, בקשת סיסמה, קוד אימות ולחץ זמן.</p>
          <div class="report-case">
            <strong>הראיות שאספתם:</strong>
            <div class="signal-list">
              ${collectedEvidence.length ? collectedEvidence.map(item => `<span>${esc(item)}</span>`).join('') : '<span>עדיין אין ראיות מהאתגר המסכם</span>'}
            </div>
            <strong>התגובה שבחרתם:</strong>
            <p>${hasSafePlan ? 'לא ללחוץ, לא למסור קוד, לדווח ולאמת באתר הרשמי.' : 'עוד לא נבחרה תגובה בטוחה באתגר המסכם.'}</p>
          </div>
        </article>
        <article class="tool-card">
          <span>ממלאים 3 שורות קצרות</span>
          <h3>הסבירו למנהל העיר מה קרה ומה עושים.</h3>
          <label>1. אילו סימנים מסוכנים מצאתי?<textarea data-report-field="found" placeholder="לדוגמה: מצאתי דומיין מתחזה, לחץ זמן ובקשה לקוד אימות">${esc(state.report.found)}</textarea></label>
          <label>2. למה זה מסוכן?<textarea data-report-field="risk" placeholder="לדוגמה: מישהו יכול לגנוב חשבון אם נמסור סיסמה או קוד">${esc(state.report.risk)}</textarea></label>
          <label>3. מה הפעולה הבטוחה עכשיו?<textarea data-report-field="action" placeholder="לדוגמה: לא ללחוץ, לא למסור קוד, לדווח ולבדוק באתר הרשמי">${esc(state.report.action)}</textarea></label>
          <button class="button" type="button" data-check-report>בדקו את הדוח וקבלו תג</button>
        </article>
        <article class="badge-card">
          <span>תוצר סיום</span>
          <strong>Cyber Safety Scanner v1</strong>
          <p>התוצר הוא שיטת עבודה: מפרקים URL, מזהים בקשת מידע רגישה, בודקים לחץ זמן, שומרים על פרטיות מול AI, ומסכמים החלטת הגנה בדוח קצר.</p>
        </article>
      </section>
    `;
  }

  function renderContent() {
    const type = stations[state.station].type;
    if (type === 'brief') return renderBrief();
    if (type === 'inbox') return renderInbox();
    if (type === 'url') return renderUrlLab();
    if (type === 'otp') return renderOtp();
    if (type === 'builder') return renderBuilder();
    if (type === 'ai') return renderAiLab();
    if (type === 'ctf') return renderCtf();
    return renderReport();
  }

  function bindDynamicEvents() {
    document.querySelectorAll('[data-complete]').forEach(button => {
      button.addEventListener('click', () => {
        complete(button.dataset.complete);
        addCase('המשימה התקבלה: בונים סורק סייבר ראשון');
        say('מעולה. עכשיו עוברים מסיפור לפעולה: פותחים Inbox ומתחילים לחקור.');
        render();
      });
    });
    document.querySelectorAll('[data-message]').forEach(button => {
      button.addEventListener('click', () => {
        state.activeMessage = button.dataset.message;
        const msg = messages.find(item => item.id === state.activeMessage);
        setRisk(msg.risk, `Risk לפי ההודעה שנפתחה: ${msg.subject}`);
        render();
      });
    });
    document.querySelectorAll('[data-inbox-evidence]').forEach(button => {
      button.addEventListener('click', () => {
        state.inboxEvidence.add(button.dataset.inboxEvidence);
        addCase(button.textContent.trim());
        setRisk(Number(button.dataset.risk), 'כל ראיה מוסיפה תמונה טובה יותר של הסיכון.');
        say('יפה. זו ראיה. עכשיו שאלו: האם זו עובדה, או רק סימן שצריך לבדוק?');
        render();
      });
    });
    document.querySelector('[data-check-inbox]')?.addEventListener('click', () => {
      if (state.inboxEvidence.size >= 7) {
        complete('inbox');
        say('Inbox הושלם. ראיתם שיש הודעות בטוחות, מסוכנות ומבלבלות.');
        addCase('Inbox: נאספו מספיק ראיות');
      } else {
        say('צריך עוד ראיות. פתחו עוד הודעות וסמנו סימנים שונים.');
      }
      render();
    });
    document.querySelectorAll('[data-url-answer]').forEach(button => {
      button.addEventListener('click', () => {
        state.urlAnswers[button.dataset.urlIndex] = button.dataset.urlAnswer;
        say('בדיקת URL: חפשו מי הדומיין ששולט בכתובת, לא רק איזו מילה מופיעה בה.');
        render();
      });
    });
    document.querySelector('[data-check-url]')?.addEventListener('click', () => {
      const ok = urlChallenges.every((item, index) => state.urlAnswers[index] === item.answer);
      if (ok) {
        complete('url');
        addCase('URL Lab: זוהו דומיינים אמיתיים');
        say('מצוין. פירוק URL הוא מיומנות פרקטית: פרוטוקול, דומיין, נתיב.');
      } else {
        say('עוד לא. בדומיינים מתחזים, המותג יכול להופיע בהתחלה אבל השליטה נמצאת בסוף הדומיין.');
      }
      render();
    });
    document.querySelectorAll('[data-otp-choice]').forEach(button => {
      button.addEventListener('click', () => {
        state.otpChoice = button.dataset.otpChoice;
        render();
      });
    });
    document.querySelector('[data-check-otp]')?.addEventListener('click', () => {
      if (state.otpChoice === 'ignore') {
        complete('otp');
        addCase('OTP: לא מוסרים קוד אימות');
        setRisk(95, 'בקשת קוד אימות היא סיכון גבוה.');
        say('נכון. קוד אימות לא מוסרים לאף אחד.');
      } else {
        say('לא. גם לשאול את מי שמבקש את הקוד זה עדיין להישאר בערוץ החשוד. עוצרים ומדווחים.');
      }
      render();
    });
    document.querySelectorAll('[data-rule]').forEach(button => {
      button.addEventListener('click', () => {
        const rule = button.dataset.rule;
        if (state.scannerRules.has(rule)) state.scannerRules.delete(rule);
        else state.scannerRules.add(rule);
        say('בונים לוגיקה: כל סימן מוסיף Risk. הסורק לא מנחש, הוא מחשב לפי כללים.');
        render();
      });
    });
    document.querySelector('[data-check-builder]')?.addEventListener('click', () => {
      if (state.scannerRules.size >= 4) {
        complete('builder');
        addCase('Scanner v1: נשמרו כללי Risk');
        say('סורק ראשון נבנה. עכשיו אפשר להסביר למה החלטה מסוימת בטוחה או מסוכנת.');
      } else {
        say('בחרו לפחות 4 בלוקים כדי שהסורק יהיה שימושי.');
      }
      render();
    });
    document.querySelectorAll('[data-ai-index]').forEach(button => {
      button.addEventListener('click', () => {
        state.aiAnswers[button.dataset.aiIndex] = button.dataset.aiSafe === 'true';
        render();
      });
    });
    document.querySelector('[data-check-ai]')?.addEventListener('click', () => {
      const ok = aiCards.every((card, index) => state.aiAnswers[index] === card.safe);
      if (ok) {
        complete('ai');
        addCase('AI Safety: לא מעלים מידע אישי');
        say('נכון. AI יכול לעזור ללמוד, אבל לא מקבל סיסמאות, קודים או פרטים אישיים.');
      } else {
        say('בדקו שוב: האם יש כאן מידע אישי, קוד אימות או צילום מסך פרטי?');
      }
      render();
    });
    document.querySelectorAll('[data-ctf-choice]').forEach(button => {
      button.addEventListener('click', () => {
        state.ctfChoice = button.dataset.ctfChoice;
        render();
      });
    });
    document.querySelectorAll('[data-ctf-evidence]').forEach(button => {
      button.addEventListener('click', () => {
        const evidence = button.dataset.ctfEvidence;
        if (state.ctfEvidence.has(evidence)) state.ctfEvidence.delete(evidence);
        else state.ctfEvidence.add(evidence);
        render();
      });
    });
    document.querySelector('[data-check-ctf]')?.addEventListener('click', () => {
      if (state.ctfChoice === 'safe-plan' && state.ctfEvidence.size >= 4) {
        complete('ctf');
        addCase('אתגר מסכם: הסורק הפעיל תגובה בטוחה');
        say('תג נפתח. חיברתם URL, קוד אימות, לחץ זמן ו־AI Safety להחלטה אחת בטוחה.');
      } else {
        say('עוד לא. צריך לפחות 4 ראיות ופעולה שלא לוחצת, לא מוסרת קוד, ומאמתת מקור.');
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
        addCase('דוח בדיקת אירוע: הוגש');
        say('שיעור הושלם. הגשתם דוח אירוע ברור וקיבלתם תוצר: Cyber Safety Scanner v1.');
      } else {
        say('הדוח עדיין קצר מדי. כתבו משפט אחד בכל שדה: מה מצאתם, למה זה מסוכן, ומה עושים עכשיו.');
      }
      render();
    });
  }

  function render() {
    renderShell();
    $('stationContent').innerHTML = renderContent();
    bindDynamicEvents();
  }

  $('nextStation').addEventListener('click', () => {
    if (state.station === 0) {
      complete('brief');
      addCase('פתיחה: המשימה הוצגה');
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
    state.inboxEvidence.clear();
    state.urlAnswers = {};
    state.otpChoice = '';
    state.scannerRules.clear();
    state.aiAnswers = {};
    state.ctfEvidence.clear();
    state.ctfChoice = '';
    state.report = { found: '', risk: '', action: '' };
    say('התחלנו מחדש. המטרה: לבנות סורק סייבר ראשון.');
    setRisk(0, 'הסיכון יעלה כשתמצאו סיגנלים.');
    render();
  });

  setRisk(0, 'הסיכון יעלה כשתמצאו קישור, לחץ, בקשת סיסמה או מקור לא מוכר.');
  render();
})();
