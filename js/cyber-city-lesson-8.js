(function () {
  const stations = [
    { id: 'brief', short: 'פתיחה', title: 'פתיחת משימה: מעבדת האקר אתי', time: '10 דקות', goal: 'מבינים למה חושבים כמו תוקף רק בתוך מערכת צעצוע, כדי ללמוד להגן טוב יותר.', type: 'brief' },
    { id: 'concepts', short: 'מושגים', title: 'סרטונים ומשימות: שפת האקר אתי', time: '20 דקות', goal: 'לומדים Target, Vulnerability, Exploit, Fix וטרמינל דרך סרטון אנימציה ותרגול קצר לכל מושג.', type: 'concepts' },
    { id: 'login', short: 'Login', title: 'Login Toy: מוצאים חולשה ומתקנים', time: '20 דקות', goal: 'בודקים מערכת התחברות צעצוע, מגלים למה היא חלשה, ומוסיפים הגנות פשוטות.', type: 'login' },
    { id: 'terminal', short: 'טרמינל', title: 'Evidence Terminal: חוקרים תיק ראיות', time: '15 דקות', goal: 'משתמשים בפקודות לינוקס בסיסיות בתוך סימולציה: ls, cat ו־grep.', type: 'terminal' },
    { id: 'python', short: 'Python', title: 'Python Defense Checker', time: '15 דקות', goal: 'בונים בודק קטן שמזהה סיסמה קצרה מדי, רמז גלוי וחוסר הגבלת ניסיונות.', type: 'python' },
    { id: 'report', short: 'דוח', title: 'דוח Ethical Hacker', time: '10 דקות', goal: 'מסכמים איזו חולשה נמצאה, איך הוכחנו אותה בסביבה בטוחה, ומה תיקנו.', type: 'report' }
  ];

  const mediaVersion = '20260919-ethical-hacker-v1';
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

  const terminalFileSystem = {
    '/': {
      type: 'dir',
      children: {
        evidence: {
          type: 'dir',
          children: {
            'login_policy.txt': {
              type: 'file',
              content: 'password_min_length=4\nmax_attempts=unlimited\nhint=city + one digit\nerror_message=Wrong password for demo'
            },
            'attempts.log': {
              type: 'file',
              content: '09:10 user=demo pass=admin failed\n09:11 user=demo pass=city7 success\n09:12 user=demo pass=city8 failed\n09:13 user=demo pass=city9 failed'
            },
            'notes.txt': {
              type: 'file',
              content: 'Training lab only.\nLook for weak policy clues.\nNever test real systems without permission.'
            }
          }
        },
        report: {
          type: 'dir',
          children: {
            'todo.txt': {
              type: 'file',
              content: '1. Find the weak login rule\n2. Prove it safely\n3. Suggest a fix'
            }
          }
        }
      }
    }
  };

  const terminalTasks = [
    {
      id: 'map',
      title: '1. מפה ראשונה',
      prompt: 'גלו באיזו תיקייה אתם נמצאים.',
      accepts: ['pwd'],
      hint: 'נסו pwd.'
    },
    {
      id: 'list-root',
      title: '2. רואים תיקיות',
      prompt: 'הציגו את התיקיות וקבצי השורש.',
      accepts: ['ls'],
      hint: 'נסו ls.'
    },
    {
      id: 'open-evidence',
      title: '3. נכנסים לראיות',
      prompt: 'עברו לתיקיית evidence.',
      accepts: ['cd evidence'],
      hint: 'נסו cd evidence.'
    },
    {
      id: 'read-policy',
      title: '4. קוראים מדיניות',
      prompt: 'פתחו את קובץ מדיניות ההתחברות.',
      accepts: ['cat login_policy.txt', 'cat evidence/login_policy.txt'],
      hint: 'cat מציגה תוכן של קובץ.'
    },
    {
      id: 'find-unlimited',
      title: '5. מחפשים חולשת ניסיונות',
      prompt: 'מצאו את השורה שמראה שאין הגבלת ניסיונות.',
      accepts: ['grep unlimited login_policy.txt', 'grep unlimited evidence/login_policy.txt'],
      hint: 'grep unlimited login_policy.txt'
    },
    {
      id: 'find-hint',
      title: '6. מחפשים רמז מסוכן',
      prompt: 'מצאו את השורה שבה הרמז חושף את מבנה הסיסמה.',
      accepts: ['grep hint login_policy.txt', 'grep hint evidence/login_policy.txt'],
      hint: 'grep hint login_policy.txt'
    },
    {
      id: 'check-attempts',
      title: '7. בודקים לוג ניסיונות',
      prompt: 'מצאו בלוג ניסיון כניסה שהצליח בסיסמה החלשה.',
      accepts: ['grep success attempts.log', 'grep success evidence/attempts.log', 'cat attempts.log', 'cat evidence/attempts.log'],
      hint: 'grep success attempts.log'
    }
  ];

  const terminalQuickCommands = [
    { command: 'pwd', label: 'איפה אני?' },
    { command: 'ls', label: 'מה יש פה?' },
    { command: 'cd evidence', label: 'כניסה לראיות' },
    { command: 'cat login_policy.txt', label: 'קריאת מדיניות' },
    { command: 'grep unlimited login_policy.txt', label: 'חיפוש ניסיונות' },
    { command: 'grep hint login_policy.txt', label: 'חיפוש רמז' },
    { command: 'grep success attempts.log', label: 'חיפוש הצלחה' }
  ];

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
    terminalInput: 'help',
    terminalOutput: '',
    terminalFeedback: 'התחילו ב־pwd. אחרי כל פקודה תקבלו פלט, הסבר קצר וסימון התקדמות.',
    terminalCwd: '/',
    terminalHistory: [],
    completedTerminalTasks: new Set(),
    foundEvidence: new Set(),
    pythonRan: false,
    report: { weakness: '', proof: '', fix: '' }
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
  function pathLabel(path) {
    return path === '/' ? '/' : path.replace(/^\//, '');
  }
  function runTerminalCommand(rawCommand) {
    const command = normalizeCommand(rawCommand);
    if (!command) return { output: 'type a command first', ok: false };
    if (command === 'help') {
      return {
        ok: true,
        output: [
          'Available commands:',
          'pwd',
          'ls',
          'cd evidence',
          'cat login_policy.txt',
          'cat attempts.log',
          'grep unlimited login_policy.txt',
          'grep hint login_policy.txt',
          'grep success attempts.log',
          'clear'
        ].join('\n')
      };
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
    const lowercaseCommand = command.toLowerCase();
    if (lowercaseCommand !== command && terminalTasks.some(task => task.accepts.includes(lowercaseCommand))) {
      return {
        ok: false,
        output: `bash: ${command}: command not found\nLinux is case-sensitive. Try: ${lowercaseCommand}`
      };
    }
    if (command === 'dir') return { ok: false, output: 'dir is not part of this lab. In Linux practice, use: ls' };
    if (command.startsWith('type ')) return { ok: false, output: 'type is not part of this lab. To read a file, use: cat FILE' };
    if (command.startsWith('find ')) return { ok: false, output: 'find is not part of this lab. To search inside a file, use: grep WORD FILE' };
    return { ok: false, output: 'command not available in this training lab' };
  }
  function updateTerminalProgress(command, output) {
    const normalized = normalizeCommand(command);
    const completedBefore = new Set(state.completedTerminalTasks);
    const evidenceBefore = new Set(state.foundEvidence);
    terminalTasks.forEach(task => {
      if (task.accepts.includes(normalized)) state.completedTerminalTasks.add(task.id);
    });
    if (output.includes('max_attempts=unlimited')) state.foundEvidence.add('unlimited');
    if (output.includes('hint=city + one digit')) state.foundEvidence.add('hint');
    if (output.includes('city7 success')) state.foundEvidence.add('success');
    return {
      tasks: [...state.completedTerminalTasks].filter(id => !completedBefore.has(id)),
      evidence: [...state.foundEvidence].filter(id => !evidenceBefore.has(id))
    };
  }
  function activeTerminalTaskIndex() {
    const index = terminalTasks.findIndex(task => !state.completedTerminalTasks.has(task.id));
    return index === -1 ? terminalTasks.length - 1 : index;
  }
  function terminalProgressText() {
    return `${state.completedTerminalTasks.size}/${terminalTasks.length}`;
  }
  function terminalEvidenceLabel(id) {
    return {
      unlimited: 'אין הגבלת ניסיונות',
      hint: 'הרמז מגלה את מבנה הסיסמה',
      success: 'כניסה הצליחה עם הסיסמה החלשה'
    }[id] || id;
  }
  function terminalTaskTitle(id) {
    return terminalTasks.find(task => task.id === id)?.title || id;
  }
  function commandCoaching(command, result, changes) {
    if (!result.ok) {
      if (result.output.includes('case-sensitive')) return 'כמעט. בלינוקס אות גדולה ואות קטנה הן לא אותו דבר. נסו את הפקודה באותיות קטנות.';
      if (result.output.includes('use: ls')) return 'במעבדה הזו מתרגלים לינוקס: כדי לראות מה יש בתיקייה כותבים ls.';
      if (result.output.includes('use: cat')) return 'כדי לקרוא קובץ בלינוקס משתמשים ב־cat ואז שם הקובץ.';
      if (result.output.includes('use: grep')) return 'כדי למצוא מילה בתוך קובץ משתמשים ב־grep, למשל grep hint login_policy.txt.';
      return terminalTasks[activeTerminalTaskIndex()]?.hint || 'נסו את הרמז של המשימה הפעילה.';
    }
    if (changes.evidence.length) {
      return `ראיה נמצאה: ${changes.evidence.map(terminalEvidenceLabel).join(' + ')}. עכשיו יש לכם הוכחה אמיתית לתיק.`;
    }
    if (changes.tasks.length) {
      return `בוצע: ${changes.tasks.map(terminalTaskTitle).join(' + ')}. הפקודה עזרה להתקדם בחקירה.`;
    }
    if (command === 'help') return 'פתחתם את רשימת הפקודות. עכשיו מתחילים בחקירה עם pwd ואז ls.';
    if (command === 'clear') return 'ניקיתם את המסך. ההתקדמות והראיות נשמרו בתיק החקירה.';
    return 'הפקודה רצה בהצלחה. בדקו את הפלט והמשיכו לפי המשימה הפעילה.';
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
      <section class="concept-gate hacker-concepts" aria-label="סרטוני מושגים ותרגולים לשיעור 8">
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
    const activeIndex = activeTerminalTaskIndex();
    const activeTask = terminalTasks[activeIndex];
    const terminalPrompt = `student@hacker-lab:${state.terminalCwd === '/' ? '~' : `~${state.terminalCwd}`}$`;
    const terminalComplete = state.completedTerminalTasks.size === terminalTasks.length && state.foundEvidence.size >= 3;
    return `
      <section class="linux-lab">
        <article class="tool-card terminal-mission-card">
          <span>Linux Terminal Missions</span>
          <h3>חוקרים תיק ראיות ממש בתוך טרמינל אימון.</h3>
          <p>זה טרמינל מדומה וסגור. הוא מלמד פקודות אמיתיות של לינוקס, אבל לא נוגע במחשב אמיתי ולא יוצא לאינטרנט.</p>
          <div class="terminal-mini-demo" aria-label="מיני הדגמת טרמינל">
            <strong>איך זה עובד?</strong>
            <div dir="ltr"><b>student@hacker-lab:~$ pwd</b><code>/</code></div>
            <p>כותבים פקודה, לוחצים Enter או הרץ, קוראים את הפלט, ואז המשימה מתקדמת.</p>
          </div>
          <div class="terminal-progress">
            <strong>${terminalProgressText()}</strong>
            <span>משימות לינוקס הושלמו</span>
          </div>
          <ol class="terminal-task-list">
            ${terminalTasks.map((task, index) => {
              const done = state.completedTerminalTasks.has(task.id);
              const active = index === activeIndex && !done;
              return `
                <li class="${done ? 'done' : ''} ${active ? 'active' : ''}">
                  <b>${esc(task.title)}</b>
                  <span>${esc(task.prompt)}</span>
                  <small>${done ? 'בוצע' : active ? esc(task.hint) : 'נפתח עוד רגע'}</small>
                </li>
              `;
            }).join('')}
          </ol>
          <div class="terminal-command-bank">
            <strong>בנק פקודות עזר</strong>
            <p>אפשר ללחוץ על פקודה כדי להכניס אותה לשורת הטרמינל, ואז להריץ.</p>
            <div>
              ${terminalQuickCommands.map(item => `
                <button class="terminal-command-chip" type="button" data-terminal-command="${esc(item.command)}">
                  <b dir="ltr">${esc(item.command)}</b>
                  <span>${esc(item.label)}</span>
                </button>
              `).join('')}
            </div>
          </div>
        </article>
        <article class="code-panel linux-terminal-panel">
          <div class="code-panel-toolbar"><span>Training Terminal</span><small dir="ltr">${esc(terminalPrompt)}</small></div>
          <div class="terminal-live-feedback ${state.foundEvidence.size ? 'has-evidence' : ''}">
            <strong>${state.foundEvidence.size ? 'תיק ראיות פעיל' : 'המשימה הפעילה'}</strong>
            <span>${esc(state.terminalFeedback)}</span>
          </div>
          <div class="terminal-screen" dir="ltr" lang="en" aria-label="טרמינל לינוקס מדומה">
            ${state.terminalHistory.length ? state.terminalHistory.slice(-8).map(item => `
              <div class="terminal-history-item ${item.ok === false ? 'error' : 'ok'}">
                <b>${esc(item.prompt)} ${esc(item.command)}</b>
                <pre>${esc(item.output)}</pre>
                ${item.feedback ? `<small dir="rtl">${esc(item.feedback)}</small>` : ''}
                ${item.evidence?.length ? `<div class="terminal-found-badges" dir="rtl">${item.evidence.map(id => `<span>ראיה: ${esc(terminalEvidenceLabel(id))}</span>`).join('')}</div>` : ''}
              </div>
            `).join('') : `
              <div class="terminal-history-item">
                <b>${esc(terminalPrompt)} help</b>
                <pre>Type help to see commands. Start with pwd and ls.</pre>
                <small dir="rtl">אחרי כל Enter תקבלו פלט, הסבר קצר וסימון בתיק.</small>
              </div>
            `}
          </div>
          <form class="terminal-command-row" data-terminal-form>
            <label class="sr-only" for="terminalCommand">פקודת טרמינל</label>
            <span dir="ltr">${esc(terminalPrompt)}</span>
            <input id="terminalCommand" class="lab-input" type="text" data-terminal-input value="${esc(state.terminalInput)}" dir="ltr" lang="en" autocomplete="off" spellcheck="false">
            <button class="button" type="submit" data-run-terminal>הרץ</button>
          </form>
          <div class="terminal-evidence">
            <span class="${state.foundEvidence.has('unlimited') ? 'found' : ''}"><b>${state.foundEvidence.has('unlimited') ? 'נמצאה' : 'נעולה'}</b> ראיה 1: אין הגבלת ניסיונות</span>
            <span class="${state.foundEvidence.has('hint') ? 'found' : ''}"><b>${state.foundEvidence.has('hint') ? 'נמצאה' : 'נעולה'}</b> ראיה 2: הרמז מגלה את הסיסמה</span>
            <span class="${state.foundEvidence.has('success') ? 'found' : ''}"><b>${state.foundEvidence.has('success') ? 'נמצאה' : 'נעולה'}</b> ראיה 3: כניסה הצליחה עם הסיסמה החלשה</span>
          </div>
          ${terminalComplete ? `
            <div class="terminal-victory">
              <strong>תיק הראיות נפתר</strong>
              <p>מצאתם שלוש הוכחות למדיניות חלשה: אין הגבלת ניסיונות, הרמז חושף את מבנה הסיסמה, והייתה כניסה מוצלחת עם סיסמה חלשה.</p>
              <small>בטרמינל מצאנו ראיות ידנית. עכשיו Python יבדוק את אותה מדיניות מהר ובאופן מסודר.</small>
            </div>
          ` : ''}
          <button class="button" type="button" data-save-terminal>${terminalComplete ? 'שמור ראיות והמשך לפייתון' : 'השלימו את משימות הטרמינל'}</button>
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
          <span>תוצר שיעור 8</span>
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
              <li><strong>Linux Terminal</strong> עוזר לנווט תיקיות, לקרוא קבצים ולחפש ראיות עם pwd, ls, cd, cat ו־grep.</li>
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
    document.querySelectorAll('[data-terminal-command]').forEach(button => {
      button.addEventListener('click', () => {
        state.terminalInput = button.dataset.terminalCommand;
        const input = document.querySelector('[data-terminal-input]');
        if (input) {
          input.value = state.terminalInput;
          input.focus();
        }
        say(`שמתי את הפקודה ${state.terminalInput} בשורת הטרמינל. עכשיו לחצו Enter או הרץ.`);
      });
    });
    document.querySelector('[data-terminal-form]')?.addEventListener('submit', event => {
      event.preventDefault();
      const command = normalizeCommand(state.terminalInput);
      const prompt = `student@hacker-lab:${state.terminalCwd === '/' ? '~' : `~${state.terminalCwd}`}$`;
      const result = runTerminalCommand(command);
      state.terminalOutput = result.output;
      const changes = updateTerminalProgress(command, result.output);
      const feedback = commandCoaching(command, result, changes);
      state.terminalFeedback = feedback;
      if (command !== 'clear') state.terminalHistory.push({ prompt, command, output: result.output, ok: result.ok, feedback, evidence: changes.evidence, tasks: changes.tasks });
      state.terminalInput = '';
      say(result.ok ? `${feedback} התקדמות טרמינל: ${terminalProgressText()}.` : feedback);
      render({ preserveScroll: true });
    });
    document.querySelector('[data-save-terminal]')?.addEventListener('click', () => {
      if (state.completedTerminalTasks.size < terminalTasks.length || state.foundEvidence.size < 3) {
        say('עוד לא. צריך להשלים את משימות הטרמינל ולמצוא שלוש ראיות: unlimited, hint ו־success.');
        render({ preserveScroll: true });
        return;
      }
      complete('terminal');
      addCase('Terminal: הושלמו pwd, ls, cd, cat ו־grep ונמצאו שלוש ראיות למדיניות חלשה');
      say('מצוין. בטרמינל מצאתם ראיות ידנית; עכשיו Python יבדוק את אותה מדיניות מהר ובצורה מסודרת.');
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
        say('שיעור 8 הושלם. בדקתם חולשה בצורה אתית וסגרתם אותה.');
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
    state.terminalInput = 'help';
    state.terminalOutput = '';
    state.terminalFeedback = 'התחילו ב־pwd. אחרי כל פקודה תקבלו פלט, הסבר קצר וסימון התקדמות.';
    state.terminalCwd = '/';
    state.terminalHistory = [];
    state.completedTerminalTasks.clear();
    state.foundEvidence.clear();
    state.pythonRan = false;
    state.report = { weakness: '', proof: '', fix: '' };
    setDefense(0, 'הציון יתעדכן אחרי שתתקנו חולשות.');
    say('התחלנו מחדש. נבדוק רק מערכת צעצוע ונלמד איך להגן עליה.');
    render();
  });

  render();
}());
