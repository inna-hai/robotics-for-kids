(function () {
  const stations = [
    { id: 'brief', short: 'פתיחה', title: 'פתיחת חקירה: מי פתח את השער?', time: '8 דקות', goal: 'מבינים מהו אירוע סייבר, מהי פורנזיקה דיגיטלית, ולמה חוקרים ראיות בלי לפגוע במערכות.', type: 'brief' },
    { id: 'concepts', short: 'מושגים', title: 'סרטוני מושגים: שפת חדר החקירה', time: '18 דקות', goal: 'לומדים Digital Forensics, Log, Timeline, IOC, Terminal ו־CTF Flag דרך סרטונים ותרגול קצר.', type: 'concepts' },
    { id: 'evidence', short: 'ראיות', title: 'Evidence Board: פותחים תיק ראיות', time: '15 דקות', goal: 'פותחים ראיות נעולות ומזהים איזה סוג מידע כל ראיה נותנת לחקירה.', type: 'evidence' },
    { id: 'timeline', short: 'ציר זמן', title: 'Timeline Builder: מסדרים מה קרה', time: '14 דקות', goal: 'מסדרים אירועי לוג לפי זמן ומגלים את רצף התקיפה.', type: 'timeline' },
    { id: 'terminal', short: 'טרמינל', title: 'Forensics Terminal: מחפשים סימני חשד', time: '15 דקות', goal: 'משתמשים ב־cat, grep ו־wc בסימולציה סגורה כדי למצוא IOC ו־flag.', type: 'terminal' },
    { id: 'python', short: 'Python', title: 'Python Evidence Counter', time: '12 דקות', goal: 'מריצים בודק Python שסופר כשלונות, מוצא כניסה מוצלחת ומחשב חשד.', type: 'python' },
    { id: 'report', short: 'דוח', title: 'Incident Report: מסקנת צוות חקירה', time: '8 דקות', goal: 'מסכמים מי נכנס, איך הוכחנו, ואיזה תיקון מגן על העיר.', type: 'report' }
  ];

  const mediaVersion = '20260919-mystery-room-v3';
  const mediaUrl = path => `${path}?v=${mediaVersion}`;

  const stationVideos = {
    brief: { title: 'סרטון פתיחה', text: 'שער העיר נפתח בלילה. עכשיו בונים תיק ראיות ולא מנחשים.', src: 'marketing/cyber-city-lesson8-overview.mp4', poster: 'marketing/cyber-city-lesson8-overview-poster.jpg' },
    concepts: { title: 'סרטון מושגים', text: 'Forensics, Logs, Timeline, IOC, Terminal ו־CTF Flag בשפה פשוטה.', src: 'marketing/cyber-city-lesson8-concepts.mp4', poster: 'marketing/cyber-city-lesson8-concepts-poster.jpg' },
    evidence: { title: 'סרטון Evidence Board', text: 'איך ראיה דיגיטלית עוזרת לענות מה קרה ומתי.', src: 'marketing/cyber-city-lesson8-evidence.mp4', poster: 'marketing/cyber-city-lesson8-evidence-poster.jpg' },
    timeline: { title: 'סרטון Timeline', text: 'למה סדר האירועים חשוב יותר מניחוש מהיר.', src: 'marketing/cyber-city-lesson8-timeline.mp4', poster: 'marketing/cyber-city-lesson8-timeline-poster.jpg' },
    terminal: { title: 'סרטון טרמינל חקירה', text: 'איך cat, grep ו־wc עוזרים למצוא סימני חשד.', src: 'marketing/cyber-city-lesson8-terminal.mp4', poster: 'marketing/cyber-city-lesson8-terminal-poster.jpg' },
    python: { title: 'סרטון Python Counter', text: 'איך Python סופר אירועים ומחזק מסקנה.', src: 'marketing/cyber-city-lesson8-python.mp4', poster: 'marketing/cyber-city-lesson8-python-poster.jpg' },
    report: { title: 'סרטון דוח אירוע', text: 'איך כותבים מסקנה קצרה לפי ראיות.', src: 'marketing/cyber-city-lesson8-report.mp4', poster: 'marketing/cyber-city-lesson8-report-poster.jpg' }
  };

  const conceptVideos = [
    {
      id: 'forensics',
      title: 'Digital Forensics',
      text: 'חקירת אירוע אחרי שהוא קרה, לפי ראיות.',
      src: 'marketing/cyber-city-lesson8-concept-forensics.mp4',
      poster: 'marketing/cyber-city-lesson8-concept-forensics-poster.jpg',
      task: 'מה עושה חוקר פורנזיקה דיגיטלית?',
      options: ['בונה מסקנה לפי ראיות', 'מנחש מי אשם', 'בודק אתר אמיתי בלי אישור'],
      answer: 'בונה מסקנה לפי ראיות'
    },
    {
      id: 'logs',
      title: 'Logs',
      text: 'רשומות קצרות של פעולות שקרו במערכת.',
      src: 'marketing/cyber-city-lesson8-concept-logs.mp4',
      poster: 'marketing/cyber-city-lesson8-concept-logs-poster.jpg',
      task: 'מה אפשר למצוא בלוג?',
      options: ['שעה, משתמש, פעולה ותוצאה', 'ציור של האתר', 'סיסמה של תלמיד אחר'],
      answer: 'שעה, משתמש, פעולה ותוצאה'
    },
    {
      id: 'timeline',
      title: 'Timeline',
      text: 'סידור האירועים לפי זמן כדי להבין רצף.',
      src: 'marketing/cyber-city-lesson8-concept-timeline.mp4',
      poster: 'marketing/cyber-city-lesson8-concept-timeline-poster.jpg',
      task: 'למה בונים ציר זמן?',
      options: ['כדי להבין מה קרה קודם ומה אחר כך', 'כדי למחוק ראיות', 'כדי להחליף סיסמה מיד'],
      answer: 'כדי להבין מה קרה קודם ומה אחר כך'
    },
    {
      id: 'ioc',
      title: 'IOC',
      text: 'Indicators of Compromise: סימנים קטנים שמשהו חשוד קרה.',
      src: 'marketing/cyber-city-lesson8-concept-ioc.mp4',
      poster: 'marketing/cyber-city-lesson8-concept-ioc-poster.jpg',
      task: 'איזה פריט הוא IOC טוב?',
      options: ['הרבה failed ואז success מאותו IP', 'כותרת יפה באתר', 'שם בית הספר'],
      answer: 'הרבה failed ואז success מאותו IP'
    },
    {
      id: 'terminal',
      title: 'Forensics Terminal',
      text: 'כלי חיפוש בטוח בקבצי ראיות מדומים.',
      src: 'marketing/cyber-city-lesson8-concept-terminal.mp4',
      poster: 'marketing/cyber-city-lesson8-concept-terminal-poster.jpg',
      task: 'איזו פקודה מחפשת מילה בקובץ?',
      options: ['grep failed auth.log', 'paint failed', 'open internet'],
      answer: 'grep failed auth.log'
    },
    {
      id: 'ctf',
      title: 'CTF Flag',
      text: 'דגל הוא הוכחת פתרון באתגר סייבר.',
      src: 'marketing/cyber-city-lesson8-concept-ctf.mp4',
      poster: 'marketing/cyber-city-lesson8-concept-ctf-poster.jpg',
      task: 'מה אומר flag בשיעור הזה?',
      options: ['מצאנו את הראיה המרכזית', 'פרצנו למערכת אמיתית', 'סיימנו לקרוא טקסט'],
      answer: 'מצאנו את הראיה המרכזית'
    }
  ];

  const evidenceItems = [
    { id: 'auth', title: 'auth.log', type: 'Log', clue: '22:03 user=demo failed מ־10.0.0.44 ואז 22:07 success.', question: 'איזה סימן חשוד מופיע?', options: ['הרבה כשלונות ואז הצלחה', 'אין שום שעה', 'אין שם משתמש'], answer: 'הרבה כשלונות ואז הצלחה' },
    { id: 'packet', title: 'packet.log', type: 'Network', clue: 'src=10.0.0.44 dst=gate proto=https path=/login encrypted=true.', question: 'מה ה־IP החשוד?', options: ['10.0.0.44', '203.0.113.88', '8.8.8.8'], answer: '10.0.0.44' },
    { id: 'door', title: 'door_event.log', type: 'Access', clue: '22:08 gate=open reason=remote_login user=demo.', question: 'מה קרה אחרי ה־login?', options: ['השער נפתח מרחוק', 'המחשב נכבה', 'DNS תרגם אתר'], answer: 'השער נפתח מרחוק' },
    { id: 'hint', title: 'hint_note.txt', type: 'File', clue: 'old hint: city + one digit. This hint must be removed.', question: 'איזה תיקון נלמד כאן?', options: ['לא מציגים רמז שמגלה סיסמה', 'מגדילים לוגו', 'מוחקים לוגים'], answer: 'לא מציגים רמז שמגלה סיסמה' },
    { id: 'message', title: 'encoded_message.txt', type: 'Mini Crypto', clue: 'base64: RkxBR3tnYXRlX3RpbWVsaW5lfQ==', question: 'מה סוג הראיה?', options: ['הודעה מקודדת קצרה', 'סיסמה אמיתית', 'אתר ציבורי'], answer: 'הודעה מקודדת קצרה' },
    { id: 'flag', title: 'flag.txt', type: 'CTF', clue: 'הדגל יפתח רק אחרי ציר זמן נכון וטרמינל.', question: 'מתי פותחים flag?', options: ['אחרי שהוכחנו את רצף האירועים', 'לפני שקוראים ראיות', 'כשמנחשים מהר'], answer: 'אחרי שהוכחנו את רצף האירועים' }
  ];

  const timelineEvents = [
    { id: 'fail1', time: '22:03', label: 'ניסיון כניסה נכשל', detail: 'user=demo failed src=10.0.0.44' },
    { id: 'fail2', time: '22:04', label: 'עוד ניסיון נכשל', detail: 'user=demo failed src=10.0.0.44' },
    { id: 'success', time: '22:07', label: 'כניסה הצליחה', detail: 'user=demo success src=10.0.0.44' },
    { id: 'gate', time: '22:08', label: 'שער נפתח', detail: 'gate=open reason=remote_login' },
    { id: 'fix', time: '22:15', label: 'תיקון מומלץ', detail: 'reset password, remove hint, enable lockout' }
  ];

  const terminalFileSystem = {
    '/': {
      type: 'dir',
      children: {
        case: {
          type: 'dir',
          children: {
            'auth.log': {
              type: 'file',
              content: '22:03 user=demo src=10.0.0.44 failed\n22:04 user=demo src=10.0.0.44 failed\n22:05 user=demo src=10.0.0.44 failed\n22:07 user=demo src=10.0.0.44 success'
            },
            'packet.log': {
              type: 'file',
              content: '22:07 src=10.0.0.44 dst=203.0.113.88 proto=https path=/login encrypted=true'
            },
            'door_event.log': {
              type: 'file',
              content: '22:08 gate=open reason=remote_login user=demo src=10.0.0.44'
            },
            'encoded_message.txt': {
              type: 'file',
              content: 'base64=RkxBR3tnYXRlX3RpbWVsaW5lfQ==\ndecoded_hint=FLAG{gate_timeline}'
            }
          }
        }
      }
    }
  };

  const terminalTasks = [
    { id: 'pwd', title: '1. מיקום', prompt: 'גלו איפה אתם נמצאים.', accepts: ['pwd'], hint: 'pwd' },
    { id: 'ls', title: '2. תיקיות', prompt: 'הציגו את התיקיות.', accepts: ['ls'], hint: 'ls' },
    { id: 'cd', title: '3. תיק חקירה', prompt: 'עברו לתיקיית case.', accepts: ['cd case'], hint: 'cd case' },
    { id: 'read', title: '4. קוראים auth', prompt: 'פתחו את auth.log.', accepts: ['cat auth.log', 'cat case/auth.log'], hint: 'cat auth.log' },
    { id: 'failed', title: '5. כשלונות', prompt: 'מצאו נסיונות failed.', accepts: ['grep failed auth.log', 'grep failed case/auth.log'], hint: 'grep failed auth.log' },
    { id: 'success', title: '6. הצלחה', prompt: 'מצאו success.', accepts: ['grep success auth.log', 'grep success case/auth.log'], hint: 'grep success auth.log' },
    { id: 'count', title: '7. ספירה', prompt: 'ספרו כמה שורות יש בלוג.', accepts: ['wc auth.log', 'wc case/auth.log'], hint: 'wc auth.log' },
    { id: 'flag', title: '8. דגל', prompt: 'מצאו את ה־flag בקובץ ההודעה.', accepts: ['grep flag encoded_message.txt', 'grep flag case/encoded_message.txt', 'cat encoded_message.txt', 'cat case/encoded_message.txt'], hint: 'grep flag encoded_message.txt' }
  ];

  const state = {
    station: 0,
    xp: 0,
    confidence: 0,
    caseFile: [],
    completed: new Set(),
    watchedConcepts: new Set(),
    conceptTasks: {},
    openedEvidence: new Set(),
    evidenceAnswers: {},
    timelineOrder: [],
    terminalInput: 'help',
    terminalCwd: '/',
    terminalHistory: [],
    completedTerminalTasks: new Set(),
    foundSignals: new Set(),
    terminalFeedback: 'התחילו ב־pwd ואז ls. כל הפקודות רצות רק בסביבת אימון בדפדפן.',
    pythonRan: false,
    report: { suspect: '', proof: '', fix: '' }
  };

  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const normalizeCommand = command => command.trim().replace(/\s+/g, ' ');

  function say(text) { $('assistantText').textContent = text; }
  function addCase(item) { if (!state.caseFile.includes(item)) state.caseFile.push(item); }
  function addXp(amount) { state.xp = Math.max(0, Math.min(100, state.xp + amount)); }
  function complete(id) {
    if (!state.completed.has(id)) {
      state.completed.add(id);
      addXp(Math.ceil(100 / stations.length));
    }
  }
  function setConfidence(value, text) {
    state.confidence = Math.max(0, Math.min(100, value));
    $('riskScore').textContent = `${state.confidence}%`;
    $('riskFill').style.width = `${state.confidence}%`;
    $('riskFill').className = state.confidence >= 75 ? 'low' : state.confidence >= 45 ? 'medium' : 'high';
    $('riskText').textContent = text || 'Case Confidence התעדכן לפי הראיות.';
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
  function evidenceSolvedCount() {
    return evidenceItems.filter(item => state.openedEvidence.has(item.id) && state.evidenceAnswers[item.id] === item.answer).length;
  }
  function timelineComplete() {
    return timelineEvents.every((item, index) => state.timelineOrder[index] === item.id);
  }
  function pathLabel(path) { return path === '/' ? '/' : path.replace(/^\//, ''); }
  function terminalNode(path) {
    const parts = path.split('/').filter(Boolean);
    let node = terminalFileSystem['/'];
    for (const part of parts) {
      if (!node || node.type !== 'dir') return null;
      node = node.children[part];
    }
    return node || null;
  }
  function resolvePath(path) {
    if (!path || path === '.') return state.terminalCwd;
    const base = path.startsWith('/') ? [] : state.terminalCwd.split('/').filter(Boolean);
    path.split('/').filter(Boolean).forEach(part => {
      if (part === '.') return;
      if (part === '..') base.pop();
      else base.push(part);
    });
    return `/${base.join('/')}`;
  }
  function runTerminalCommand(rawCommand) {
    const command = normalizeCommand(rawCommand);
    if (!command) return { ok: false, output: 'type a command first' };
    if (command === 'help') {
      return { ok: true, output: ['Available commands:', 'pwd', 'ls', 'cd case', 'cat auth.log', 'grep failed auth.log', 'grep success auth.log', 'wc auth.log', 'grep flag encoded_message.txt', 'clear'].join('\n') };
    }
    if (command === 'clear') {
      state.terminalHistory = [];
      return { ok: true, output: 'terminal cleared' };
    }
    if (command === 'pwd') return { ok: true, output: state.terminalCwd };
    if (command === 'ls') {
      const node = terminalNode(state.terminalCwd);
      return { ok: true, output: Object.keys(node.children).join('\n') };
    }
    if (command.startsWith('ls ')) {
      const target = terminalNode(resolvePath(command.slice(3)));
      if (!target) return { ok: false, output: 'ls: cannot access path' };
      if (target.type === 'file') return { ok: true, output: pathLabel(resolvePath(command.slice(3))) };
      return { ok: true, output: Object.keys(target.children).join('\n') };
    }
    if (command.startsWith('cd ')) {
      const nextPath = resolvePath(command.slice(3));
      const target = terminalNode(nextPath);
      if (!target || target.type !== 'dir') return { ok: false, output: 'cd: directory not found' };
      state.terminalCwd = nextPath;
      return { ok: true, output: state.terminalCwd };
    }
    if (command.startsWith('cat ')) {
      const target = terminalNode(resolvePath(command.slice(4)));
      if (!target) return { ok: false, output: 'cat: file not found' };
      if (target.type !== 'file') return { ok: false, output: 'cat: this is a directory' };
      return { ok: true, output: target.content };
    }
    if (command.startsWith('grep ')) {
      const parts = command.split(' ');
      if (parts.length < 3) return { ok: false, output: 'usage: grep WORD FILE' };
      const word = parts[1].toLowerCase();
      const filePath = parts.slice(2).join(' ');
      const target = terminalNode(resolvePath(filePath));
      if (!target || target.type !== 'file') return { ok: false, output: 'grep: file not found' };
      const matches = target.content.split('\n').filter(line => line.toLowerCase().includes(word));
      return { ok: true, output: matches.length ? matches.join('\n') : 'no matches' };
    }
    if (command.startsWith('wc ')) {
      const target = terminalNode(resolvePath(command.slice(3)));
      if (!target || target.type !== 'file') return { ok: false, output: 'wc: file not found' };
      return { ok: true, output: `${target.content.split('\n').length} ${pathLabel(resolvePath(command.slice(3)))}` };
    }
    return { ok: false, output: 'command not available in this training lab' };
  }
  function updateTerminalProgress(command, output) {
    const normalized = normalizeCommand(command);
    const beforeTasks = new Set(state.completedTerminalTasks);
    const beforeSignals = new Set(state.foundSignals);
    terminalTasks.forEach(task => {
      if (task.accepts.includes(normalized)) state.completedTerminalTasks.add(task.id);
    });
    if (output.includes('failed')) state.foundSignals.add('failed');
    if (output.includes('success')) state.foundSignals.add('success');
    if (output.includes('10.0.0.44')) state.foundSignals.add('ip');
    if (output.includes('FLAG{gate_timeline}')) state.foundSignals.add('flag');
    return {
      tasks: [...state.completedTerminalTasks].filter(id => !beforeTasks.has(id)),
      signals: [...state.foundSignals].filter(id => !beforeSignals.has(id))
    };
  }
  function activeTerminalTaskIndex() {
    const index = terminalTasks.findIndex(task => !state.completedTerminalTasks.has(task.id));
    return index === -1 ? terminalTasks.length - 1 : index;
  }
  function terminalProgressText() { return `${state.completedTerminalTasks.size}/${terminalTasks.length}`; }
  function terminalFeedback(result, changes) {
    if (!result.ok) return terminalTasks[activeTerminalTaskIndex()]?.hint || 'נסו את הרמז של המשימה הפעילה.';
    if (changes.signals.length) return `סימן חשד נמצא: ${changes.signals.join(', ')}. זה מחזק את תיק החקירה.`;
    if (changes.tasks.length) return `בוצע: ${changes.tasks.join(', ')}. ממשיכים לחפש ראיות לפי המשימה הבאה.`;
    return 'הפקודה רצה. בדקו את הפלט והמשיכו לפי המשימה הפעילה.';
  }
  function pythonScore() {
    const failed = 3;
    const success = true;
    const sameIp = true;
    const risk = failed * 20 + (success ? 25 : 0) + (sameIp ? 15 : 0);
    return [
      `failed_attempts = ${failed}`,
      `success_after_failures = ${success}`,
      `same_source_ip = ${sameIp}`,
      `case_risk = ${risk}`,
      'conclusion = suspicious_login_before_gate_open'
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
      <section class="stage-video-card mystery-stage-video">
        <div>
          <span>${esc(video.title)}</span>
          <p>${esc(video.text)}</p>
        </div>
        <video controls preload="metadata" playsinline poster="${mediaUrl(video.poster)}">
          <source src="${mediaUrl(video.src)}" type="video/mp4">
        </video>
      </section>
    `;
  }

  function renderBrief() {
    return `
      <section class="brief-grid">
        <article class="tool-card">
          <span>Cyber Mystery Room</span>
          <h3>שער העיר נפתח בשעה 22:08.</h3>
          <p>התפקיד שלכם הוא לא לנחש מי אשם. אתם צוות חקירה: אוספים ראיות, בונים ציר זמן, מחפשים IOC, ואז כותבים מסקנה.</p>
          <div class="signal-list">
            <span>Digital Forensics</span><span>Logs</span><span>Timeline</span><span>IOC</span><span>CTF Flag</span>
          </div>
          <button class="button" type="button" data-complete-brief>קיבלתי את תיק החקירה</button>
        </article>
        <article class="tool-card mystery-case-visual">
          <span>Case ID: GATE-2208</span>
          <h3>מטרה: להוכיח מה קרה</h3>
          <ol>
            <li>פותחים ראיות נעולות.</li>
            <li>מסדרים אירועים בציר זמן.</li>
            <li>מחפשים סימני חשד בטרמינל.</li>
            <li>מריצים Python ומגישים דוח.</li>
          </ol>
        </article>
      </section>
    `;
  }

  function renderConcepts() {
    const count = conceptsCompleteCount();
    return `
      <section class="concept-gate mystery-concepts" aria-label="סרטוני מושגים ותרגולים לשיעור 9">
        <article class="tool-card">
          <span>Concept Videos</span>
          <h3>לפני החקירה שומעים שישה מושגים אמיתיים.</h3>
          <p>כל מושג מקבל סרטון קצר ותרגול בחירה. רק אחרי כל המושגים אפשר לשמור ולהמשיך.</p>
          <div class="terminal-progress"><strong>${count}/${conceptVideos.length}</strong><span>מושגים אושרו</span></div>
          <button class="button" type="button" data-save-concepts>${conceptsAreComplete() ? 'שמור מושגים והמשך לראיות' : 'השלימו את כל הסרטונים והתרגולים'}</button>
        </article>
        <div class="concept-video-grid">
          ${conceptVideos.map(video => {
            const watched = state.watchedConcepts.has(video.id);
            const status = conceptTaskStatus(video);
            return `
              <article class="concept-video-card ${watched ? 'watched' : ''} ${status}">
                <video controls preload="metadata" playsinline poster="${mediaUrl(video.poster)}">
                  <source src="${mediaUrl(video.src)}" type="video/mp4">
                </video>
                <div class="concept-video-body">
                  <span>${watched ? 'אושר' : 'ממתין לאישור'}</span>
                  <h4>${esc(video.title)}</h4>
                  <p>${esc(video.text)}</p>
                  <button class="button ghost" type="button" data-watch-concept="${video.id}">${watched ? 'צפיתי' : 'סיימתי לראות'}</button>
                  <div class="concept-mini-task">
                    <strong>${esc(video.task)}</strong>
                    ${video.options.map(option => `
                      <button class="${state.conceptTasks[video.id] === option ? 'selected' : ''}" type="button" data-concept-answer="${video.id}" data-answer="${esc(option)}">${esc(option)}</button>
                    `).join('')}
                    <small>${status === 'correct' ? 'נכון. המושג נכנס לתיק.' : status === 'wrong' ? 'כמעט. נסו תשובה שמבוססת על ראיות ובטיחות.' : 'בחרו תשובה אחרי הסרטון.'}</small>
                  </div>
                </div>
              </article>
            `;
          }).join('')}
        </div>
      </section>
    `;
  }

  function renderEvidence() {
    const solved = evidenceSolvedCount();
    return `
      <section class="mystery-grid">
        <article class="tool-card">
          <span>Evidence Board</span>
          <h3>פותחים ראיות כמו צוות SOC קטן.</h3>
          <p>כל ראיה מגלה חלק אחר מהתמונה: לוג התחברות, תעבורה, אירוע שער, רמז מסוכן, הודעה מקודדת ו־flag.</p>
          <div class="terminal-progress"><strong>${solved}/${evidenceItems.length}</strong><span>ראיות נותחו</span></div>
          <button class="button" type="button" data-save-evidence>${solved === evidenceItems.length ? 'שמור ראיות והמשך לציר זמן' : 'נתחו את כל הראיות'}</button>
        </article>
        <div class="evidence-board">
          ${evidenceItems.map(item => {
            const open = state.openedEvidence.has(item.id);
            const selected = state.evidenceAnswers[item.id];
            const correct = selected === item.answer;
            return `
              <article class="evidence-card ${open ? 'open' : ''} ${correct ? 'solved' : ''}">
                <div>
                  <span>${esc(item.type)}</span>
                  <strong>${esc(item.title)}</strong>
                </div>
                ${open ? `
                  <p>${esc(item.clue)}</p>
                  <div class="evidence-question">
                    <b>${esc(item.question)}</b>
                    ${item.options.map(option => `<button class="${selected === option ? 'selected' : ''}" type="button" data-evidence-answer="${item.id}" data-answer="${esc(option)}">${esc(option)}</button>`).join('')}
                    <small>${correct ? 'נכון. הראיה נוספה לתיק.' : selected ? 'לא בדיוק. חפשו את הסימן הכי חשוב.' : 'בחרו מה הראיה מלמדת.'}</small>
                  </div>
                ` : `<button class="button ghost" type="button" data-open-evidence="${item.id}">פתח ראיה</button>`}
              </article>
            `;
          }).join('')}
        </div>
      </section>
    `;
  }

  function renderTimeline() {
    const pool = timelineEvents.filter(item => !state.timelineOrder.includes(item.id));
    return `
      <section class="mystery-grid">
        <article class="tool-card">
          <span>Timeline Builder</span>
          <h3>מסדרים את האירועים לפי זמן.</h3>
          <p>ציר זמן הוא לא קישוט. הוא מוכיח מה קרה קודם: כשלונות, הצלחה, ואז פתיחת שער.</p>
          <div class="terminal-progress"><strong>${state.timelineOrder.length}/${timelineEvents.length}</strong><span>אירועים בציר</span></div>
          <button class="button ghost" type="button" data-reset-timeline>אפס ציר זמן</button>
          <button class="button" type="button" data-save-timeline>${timelineComplete() ? 'שמור ציר זמן והמשך לטרמינל' : 'סדרו את האירועים נכון'}</button>
        </article>
        <article class="timeline-builder">
          <div class="timeline-pool">
            <strong>אירועים זמינים</strong>
            ${pool.map(item => `<button type="button" data-add-event="${item.id}"><b>${esc(item.label)}</b><span>${esc(item.detail)}</span></button>`).join('') || '<em>כל האירועים בציר.</em>'}
          </div>
          <div class="timeline-slots">
            <strong>ציר זמן</strong>
            ${state.timelineOrder.map((id, index) => {
              const item = timelineEvents.find(event => event.id === id);
              const correct = timelineEvents[index]?.id === id;
              return `<button class="${correct ? 'correct' : 'wrong'}" type="button" data-remove-event="${id}"><b>${esc(item.time)} · ${esc(item.label)}</b><span>${esc(item.detail)}</span></button>`;
            }).join('') || '<em>הוסיפו אירועים לפי הסדר.</em>'}
          </div>
        </article>
      </section>
    `;
  }

  function renderTerminal() {
    const activeIndex = activeTerminalTaskIndex();
    const terminalPrompt = `student@forensics-lab:${state.terminalCwd === '/' ? '~' : `~${state.terminalCwd}`}$`;
    const terminalComplete = state.completedTerminalTasks.size === terminalTasks.length && state.foundSignals.has('flag');
    return `
      <section class="linux-lab">
        <article class="tool-card terminal-mission-card">
          <span>Forensics Terminal</span>
          <h3>מחפשים IOC בקבצי ראיות.</h3>
          <p>זה טרמינל מדומה וסגור. הפקודות מלמדות Linux אמיתי אבל לא נוגעות במחשב אמיתי.</p>
          <div class="terminal-progress"><strong>${terminalProgressText()}</strong><span>משימות טרמינל</span></div>
          <ol class="terminal-task-list">
            ${terminalTasks.map((task, index) => {
              const done = state.completedTerminalTasks.has(task.id);
              const active = index === activeIndex && !done;
              return `<li class="${done ? 'done' : ''} ${active ? 'active' : ''}"><b>${esc(task.title)}</b><span>${esc(task.prompt)}</span><small>${done ? 'בוצע' : active ? esc(task.hint) : 'נפתח עוד רגע'}</small></li>`;
            }).join('')}
          </ol>
        </article>
        <article class="code-panel linux-terminal-panel">
          <div class="code-panel-toolbar"><span>Training Terminal</span><small dir="ltr">${esc(terminalPrompt)}</small></div>
          <div class="terminal-live-feedback ${state.foundSignals.size ? 'has-evidence' : ''}">
            <strong>${state.foundSignals.size ? 'IOC פעיל' : 'המשימה הפעילה'}</strong>
            <span>${esc(state.terminalFeedback)}</span>
          </div>
          <div class="terminal-screen" dir="ltr" lang="en" aria-label="טרמינל פורנזיקה מדומה">
            ${state.terminalHistory.length ? state.terminalHistory.slice(-9).map(item => `
              <div class="terminal-history-item ${item.ok === false ? 'error' : 'ok'}">
                <b>${esc(item.prompt)} ${esc(item.command)}</b>
                <pre>${esc(item.output)}</pre>
                ${item.feedback ? `<small dir="rtl">${esc(item.feedback)}</small>` : ''}
              </div>
            `).join('') : `
              <div class="terminal-history-item">
                <b>${esc(terminalPrompt)} help</b>
                <pre>Type help to see commands. Start with pwd, ls, cd case.</pre>
                <small dir="rtl">אחרי כל פקודה מחפשים סימן חשד, לא סתם פלט.</small>
              </div>
            `}
          </div>
          <form class="terminal-command-row" data-terminal-form>
            <label class="sr-only" for="terminalCommand">פקודת טרמינל</label>
            <span dir="ltr">${esc(terminalPrompt)}</span>
            <input id="terminalCommand" class="lab-input" type="text" data-terminal-input value="${esc(state.terminalInput)}" dir="ltr" lang="en" autocomplete="off" spellcheck="false">
            <button class="button" type="submit">הרץ</button>
          </form>
          <div class="terminal-evidence">
            <span class="${state.foundSignals.has('failed') ? 'found' : ''}"><b>${state.foundSignals.has('failed') ? 'נמצא' : 'נעול'}</b> IOC: failed attempts</span>
            <span class="${state.foundSignals.has('success') ? 'found' : ''}"><b>${state.foundSignals.has('success') ? 'נמצא' : 'נעול'}</b> IOC: success after failures</span>
            <span class="${state.foundSignals.has('ip') ? 'found' : ''}"><b>${state.foundSignals.has('ip') ? 'נמצא' : 'נעול'}</b> IOC: source IP 10.0.0.44</span>
            <span class="${state.foundSignals.has('flag') ? 'found' : ''}"><b>${state.foundSignals.has('flag') ? 'נמצא' : 'נעול'}</b> CTF: FLAG{gate_timeline}</span>
          </div>
          ${terminalComplete ? `<div class="terminal-victory"><strong>הדגל נמצא</strong><p>מצאתם את FLAG{gate_timeline}. עכשיו Python יחזק את המסקנה במספרים.</p></div>` : ''}
          <button class="button" type="button" data-save-terminal>${terminalComplete ? 'שמור והמשך ל־Python' : 'מצאו את כל סימני החשד וה־flag'}</button>
        </article>
      </section>
    `;
  }

  function renderPython() {
    const output = state.pythonRan ? pythonScore() : 'הפלט יופיע כאן אחרי לחיצה על הרצה.';
    return `
      <section class="builder-grid console-lab">
        <article class="tool-card">
          <span>Python Evidence Counter</span>
          <h3>אותה חקירה, אבל עם ספירה אוטומטית.</h3>
          <p>הקוד סופר כשלונות, בודק אם הגיעה הצלחה מאותו IP, ומחזיר מסקנת חשד.</p>
          <button class="button run-console-button" type="button" data-run-python><span class="play-icon" aria-hidden="true"></span><span>הרץ בדיקה</span></button>
        </article>
        <article class="code-panel">
          <div class="code-panel-toolbar"><span>Python</span><small>forensics_counter.py</small></div>
          <pre><code>events = [
  "22:03 demo 10.0.0.44 failed",
  "22:04 demo 10.0.0.44 failed",
  "22:05 demo 10.0.0.44 failed",
  "22:07 demo 10.0.0.44 success"
]

failed = 0
success = False

for event in events:
    if "failed" in event:
        failed = failed + 1
    if "success" in event:
        success = True

print("failed_attempts =", failed)
print("success_after_failures =", success)</code></pre>
          <div class="terminal-output ${state.pythonRan ? 'has-output' : ''}"><pre>${esc(output)}</pre></div>
        </article>
      </section>
    `;
  }

  function renderReport() {
    const ready = timelineComplete() && state.pythonRan && state.foundSignals.has('flag');
    return `
      <section class="report-grid">
        <article class="tool-card">
          <span>Incident Report</span>
          <h3>כותבים מסקנה לפי ראיות.</h3>
          <label>מי/מה החשוד המרכזי?
            <textarea data-report-field="suspect" placeholder="למשל: כניסה חשודה של demo מ־10.0.0.44">${esc(state.report.suspect)}</textarea>
          </label>
          <label>איזו ראיה מוכיחה?
            <textarea data-report-field="proof" placeholder="למשל: failed attempts ואז success לפני gate=open">${esc(state.report.proof)}</textarea>
          </label>
          <label>מה התיקון?
            <textarea data-report-field="fix" placeholder="למשל: לנעול אחרי 3 ניסיונות, להסיר רמז, להחליף סיסמה">${esc(state.report.fix)}</textarea>
          </label>
          <button class="button" type="button" data-submit-report>${ready ? 'הגש דוח חקירה' : 'השלימו ציר זמן, טרמינל ו־Python'}</button>
        </article>
        <article class="tool-card defender-summary">
          <span>תוצר שיעור 9</span>
          <h3>Incident Case File</h3>
          <ul>
            <li><strong>Digital Forensics</strong> חוקרת אירוע לפי ראיות.</li>
            <li><strong>Logs</strong> מספרים זמן, משתמש, פעולה ותוצאה.</li>
            <li><strong>Timeline</strong> מוכיח רצף: failed, success, gate open.</li>
            <li><strong>IOC</strong> הוא סימן חשד קטן שמחזק את התיק.</li>
            <li><strong>CTF Flag</strong> הוא הוכחת פתרון באתגר.</li>
          </ul>
          <div class="network-defender-badge" aria-label="תג חוקר סייבר">
            <span>Badge</span>
            <strong>Cyber Investigator</strong>
            <small>מוכיחים לפי ראיות, לא לפי ניחוש.</small>
          </div>
        </article>
      </section>
    `;
  }

  function renderContent() {
    const type = stations[state.station].type;
    if (type === 'brief') return renderBrief();
    if (type === 'concepts') return renderConcepts();
    if (type === 'evidence') return renderEvidence();
    if (type === 'timeline') return renderTimeline();
    if (type === 'terminal') return renderTerminal();
    if (type === 'python') return renderPython();
    return renderReport();
  }

  function bindDynamicEvents() {
    document.querySelector('[data-complete-brief]')?.addEventListener('click', () => {
      complete('brief');
      addCase('פתיחה: הוגדר אירוע GATE-2208 וגבולות חקירה בטוחים');
      say('מעולה. עכשיו נלמד את מושגי החקירה לפני שנפתח ראיות.');
      state.station = stations.findIndex(station => station.id === 'concepts');
      render();
    });
    document.querySelectorAll('[data-watch-concept]').forEach(button => {
      button.addEventListener('click', () => {
        state.watchedConcepts.add(button.dataset.watchConcept);
        say('הסרטון אושר. עכשיו ענו על התרגול הקטן של המושג.');
        render({ preserveScroll: true });
      });
    });
    document.querySelectorAll('[data-concept-answer]').forEach(button => {
      button.addEventListener('click', () => {
        state.conceptTasks[button.dataset.conceptAnswer] = button.dataset.answer;
        const video = conceptVideos.find(item => item.id === button.dataset.conceptAnswer);
        say(button.dataset.answer === video.answer ? 'נכון. המושג נכנס לתיק החקירה.' : 'כמעט. בחרו תשובה שמבוססת על ראיות ובטיחות.');
        render({ preserveScroll: true });
      });
    });
    document.querySelector('[data-save-concepts]')?.addEventListener('click', () => {
      if (!conceptsAreComplete()) {
        say('עוד לא. צריך לאשר כל סרטון מושג ולענות נכון על התרגול שלו.');
        render({ preserveScroll: true });
        return;
      }
      complete('concepts');
      addCase('מושגים: הושלמו Forensics, Logs, Timeline, IOC, Terminal ו־CTF Flag');
      say('יפה. עכשיו פותחים ראיות ונזהרים לא לקפוץ למסקנה לפני ההוכחות.');
      state.station = stations.findIndex(station => station.id === 'evidence');
      render();
    });
    document.querySelectorAll('[data-open-evidence]').forEach(button => {
      button.addEventListener('click', () => {
        state.openedEvidence.add(button.dataset.openEvidence);
        say('ראיה נפתחה. עכשיו בחרו מה היא מלמדת את צוות החקירה.');
        render({ preserveScroll: true });
      });
    });
    document.querySelectorAll('[data-evidence-answer]').forEach(button => {
      button.addEventListener('click', () => {
        state.evidenceAnswers[button.dataset.evidenceAnswer] = button.dataset.answer;
        const item = evidenceItems.find(evidence => evidence.id === button.dataset.evidenceAnswer);
        say(button.dataset.answer === item.answer ? 'נכון. הראיה נוספה לתיק.' : 'לא בדיוק. קראו שוב את הראיה וחפשו את הסימן המרכזי.');
        render({ preserveScroll: true });
      });
    });
    document.querySelector('[data-save-evidence]')?.addEventListener('click', () => {
      if (evidenceSolvedCount() < evidenceItems.length) {
        say('עוד לא. צריך לפתוח ולנתח את כל הראיות.');
        render({ preserveScroll: true });
        return;
      }
      complete('evidence');
      addCase('ראיות: נותחו auth.log, packet.log, door_event, hint note, encoded message ו־flag gate');
      setConfidence(30, 'נמצאו כל הראיות הראשוניות. עכשיו צריך להוכיח רצף.');
      say('מעולה. עכשיו נסדר את האירועים לפי זמן כדי להוכיח מה קרה קודם.');
      state.station = stations.findIndex(station => station.id === 'timeline');
      render();
    });
    document.querySelectorAll('[data-add-event]').forEach(button => {
      button.addEventListener('click', () => {
        state.timelineOrder.push(button.dataset.addEvent);
        say('האירוע נוסף לציר. בדקו אם הסדר נכון לפי השעות.');
        render({ preserveScroll: true });
      });
    });
    document.querySelectorAll('[data-remove-event]').forEach(button => {
      button.addEventListener('click', () => {
        state.timelineOrder = state.timelineOrder.filter(id => id !== button.dataset.removeEvent);
        say('האירוע הוסר מהציר. אפשר לסדר מחדש.');
        render({ preserveScroll: true });
      });
    });
    document.querySelector('[data-reset-timeline]')?.addEventListener('click', () => {
      state.timelineOrder = [];
      say('ציר הזמן אופס.');
      render({ preserveScroll: true });
    });
    document.querySelector('[data-save-timeline]')?.addEventListener('click', () => {
      if (!timelineComplete()) {
        say('עוד לא. ציר הזמן צריך להראות: failed, failed, success, gate open, fix.');
        render({ preserveScroll: true });
        return;
      }
      complete('timeline');
      addCase('ציר זמן: 22:03 failed, 22:04 failed, 22:07 success, 22:08 gate open');
      setConfidence(50, 'ציר הזמן מוכיח שהכניסה הצליחה לפני פתיחת השער.');
      say('מצוין. עכשיו נחפש את אותם סימנים בתוך קבצי הראיות בטרמינל.');
      state.station = stations.findIndex(station => station.id === 'terminal');
      render();
    });
    document.querySelector('[data-terminal-input]')?.addEventListener('input', event => {
      state.terminalInput = event.target.value.trim();
    });
    document.querySelector('[data-terminal-form]')?.addEventListener('submit', event => {
      event.preventDefault();
      const command = normalizeCommand(state.terminalInput);
      const prompt = `student@forensics-lab:${state.terminalCwd === '/' ? '~' : `~${state.terminalCwd}`}$`;
      const result = runTerminalCommand(command);
      const changes = updateTerminalProgress(command, result.output);
      const feedback = terminalFeedback(result, changes);
      state.terminalFeedback = feedback;
      if (command !== 'clear') state.terminalHistory.push({ prompt, command, output: result.output, ok: result.ok, feedback });
      state.terminalInput = '';
      say(result.ok ? `${feedback} התקדמות טרמינל: ${terminalProgressText()}.` : feedback);
      render({ preserveScroll: true });
    });
    document.querySelector('[data-save-terminal]')?.addEventListener('click', () => {
      if (state.completedTerminalTasks.size < terminalTasks.length || !state.foundSignals.has('flag')) {
        say('עוד לא. צריך להשלים את משימות הטרמינל ולמצוא את ה־flag.');
        render({ preserveScroll: true });
        return;
      }
      complete('terminal');
      addCase('טרמינל: נמצאו failed, success, source IP ו־FLAG{gate_timeline}');
      setConfidence(70, 'הטרמינל מצא IOC ו־flag. עכשיו Python יחזק במספרים.');
      say('מצוין. עכשיו Python יספור את האירועים ויחזק את המסקנה.');
      state.station = stations.findIndex(station => station.id === 'python');
      render();
    });
    document.querySelector('[data-run-python]')?.addEventListener('click', () => {
      state.pythonRan = true;
      complete('python');
      setConfidence(90, 'Python אישר: שלושה כשלונות ואז הצלחה מאותו IP לפני פתיחת השער.');
      addCase('Python: נספרו 3 failed ואז success מאותו IP');
      say('יפה. עכשיו יש גם ראיות וגם חישוב. אפשר להגיש דוח אירוע.');
      render({ preserveScroll: true });
    });
    document.querySelectorAll('[data-report-field]').forEach(input => {
      input.addEventListener('input', event => {
        state.report[event.target.dataset.reportField] = event.target.value;
      });
    });
    document.querySelector('[data-submit-report]')?.addEventListener('click', () => {
      const ready = timelineComplete() && state.pythonRan && state.foundSignals.has('flag');
      const filled = state.report.suspect.trim() && state.report.proof.trim() && state.report.fix.trim();
      if (!ready) {
        say('לפני הדוח צריך להשלים ציר זמן, טרמינל ו־Python.');
        return;
      }
      if (!filled) {
        say('כתבו משפט קצר בכל שדה: חשוד, ראיה ותיקון.');
        return;
      }
      complete('report');
      addCase('Incident Report: הוגש דוח חקירה מלא ל־GATE-2208');
      setConfidence(100, 'התיק הושלם: ראיות, ציר זמן, IOC, Python ודוח תיקון.');
      say('שיעור 9 הושלם. פתרתם חדר חקירה אמיתי בסביבת אימון בטוחה.');
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
      addCase('פתיחה: נפתח תיק חקירה GATE-2208');
    }
    if (state.station < stations.length - 1) {
      state.station += 1;
      render();
    } else {
      say('אם הדוח מלא, שיעור 9 הושלם. אפשר לחזור ולשפר את תיק החקירה.');
    }
  });
  $('prevStation').addEventListener('click', () => {
    state.station = Math.max(0, state.station - 1);
    render();
  });
  $('resetLab').addEventListener('click', () => {
    state.station = 0;
    state.xp = 0;
    state.confidence = 0;
    state.caseFile = [];
    state.completed.clear();
    state.watchedConcepts.clear();
    state.conceptTasks = {};
    state.openedEvidence.clear();
    state.evidenceAnswers = {};
    state.timelineOrder = [];
    state.terminalInput = 'help';
    state.terminalCwd = '/';
    state.terminalHistory = [];
    state.completedTerminalTasks.clear();
    state.foundSignals.clear();
    state.terminalFeedback = 'התחילו ב־pwd ואז ls. כל הפקודות רצות רק בסביבת אימון בדפדפן.';
    state.pythonRan = false;
    state.report = { suspect: '', proof: '', fix: '' };
    setConfidence(0, 'האמון בתיק יעלה כשתמצאו ראיות, תבנו ציר זמן ותריצו בדיקת Python.');
    say('החקירה אופסה. מתחילים מחדש את Cyber Mystery Room.');
    render();
  });

  render();
})();
