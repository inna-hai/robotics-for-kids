(function () {
  const stations = [
    { id: 'brief', short: 'פתיחה', title: 'פתיחת משימה: מה זה טרמינל?', time: '10 דקות', goal: 'מבינים את דפוס העבודה: פקודה קצרה, פלט, ואז מסקנה.', type: 'brief' },
    { id: 'commands', short: 'פקודות', title: 'חמש פקודות בסיס', time: '20 דקות', goal: 'מכירים את pwd, ls, cd, cat ו־grep דרך כרטיסי תרגול קצרים.', type: 'commands' },
    { id: 'terminal', short: 'מעבדה', title: 'Linux Evidence Terminal', time: '45 דקות', goal: 'משתמשים בפקודות הבסיס כדי לפתוח תיק ראיות ולמצוא שלוש הוכחות.', type: 'terminal' },
    { id: 'report', short: 'סיכום', title: 'Linux Evidence Card', time: '15 דקות', goal: 'מסכמים אילו פקודות למדנו, איזו ראיה מצאנו, ומה נעשה בשיעור הבא.', type: 'report' }
  ];

  const mediaVersion = '20260919-linux-basics-v1';
  const mediaUrl = path => `${path}?v=${mediaVersion}`;

  const commandCards = [
    { command: 'pwd', name: 'Where am I?', text: 'מראה באיזו תיקייה אנחנו נמצאים עכשיו.', example: 'pwd -> /' },
    { command: 'ls', name: 'List', text: 'מראה מה יש בתוך התיקייה הנוכחית.', example: 'ls -> evidence report' },
    { command: 'cd', name: 'Change Directory', text: 'עובר לתיקייה אחרת בתוך המעבדה.', example: 'cd evidence' },
    { command: 'cat', name: 'Read File', text: 'מציג תוכן של קובץ טקסט.', example: 'cat login_policy.txt' },
    { command: 'grep', name: 'Search Text', text: 'מחפש מילה בתוך קובץ ומחזיר רק שורות מתאימות.', example: 'grep hint login_policy.txt' }
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
              content: 'password_min_length=4\nmax_attempts=unlimited\nhint=city + one digit\nmessage=training lab only'
            },
            'attempts.log': {
              type: 'file',
              content: '09:10 user=demo pass=admin failed\n09:11 user=demo pass=city7 success\n09:12 user=demo pass=city8 failed\n09:13 user=demo pass=city9 failed'
            },
            'notes.txt': {
              type: 'file',
              content: 'Use only this closed training lab.\nFind evidence, do not guess.\nNext lesson turns the findings into a defense checker.'
            }
          }
        },
        report: {
          type: 'dir',
          children: {
            'todo.txt': {
              type: 'file',
              content: '1. Learn basic Linux commands\n2. Find three evidence lines\n3. Explain what each command did'
            }
          }
        }
      }
    }
  };

  const terminalTasks = [
    {
      id: 'pwd',
      title: '1. איפה אני?',
      prompt: 'גלו באיזו תיקייה אתם נמצאים.',
      accepts: ['pwd'],
      hint: 'כתבו pwd.',
      success: 'pwd הראה את המיקום הנוכחי שלכם במעבדה.'
    },
    {
      id: 'ls',
      title: '2. מה יש כאן?',
      prompt: 'הציגו את התיקיות שיש בשורש המעבדה.',
      accepts: ['ls'],
      hint: 'כתבו ls.',
      success: 'ls הציג את התיקיות שאפשר לחקור.'
    },
    {
      id: 'cd',
      title: '3. נכנסים לראיות',
      prompt: 'עברו לתיקיית evidence.',
      accepts: ['cd evidence'],
      hint: 'כתבו cd evidence.',
      success: 'cd העביר אתכם לתיקיית הראיות.'
    },
    {
      id: 'cat',
      title: '4. קוראים קובץ',
      prompt: 'פתחו את קובץ login_policy.txt.',
      accepts: ['cat login_policy.txt', 'cat evidence/login_policy.txt'],
      hint: 'כתבו cat login_policy.txt.',
      success: 'cat הציג את תוכן קובץ המדיניות.'
    },
    {
      id: 'grep-unlimited',
      title: '5. ראיה: אין הגבלת ניסיונות',
      prompt: 'מצאו את השורה שמראה שאין הגבלת ניסיונות.',
      accepts: ['grep unlimited login_policy.txt', 'grep unlimited evidence/login_policy.txt'],
      hint: 'כתבו grep unlimited login_policy.txt.',
      evidence: 'unlimited',
      success: 'grep מצא את השורה max_attempts=unlimited.'
    },
    {
      id: 'grep-hint',
      title: '6. ראיה: הרמז מסוכן',
      prompt: 'מצאו את השורה שבה הרמז חושף את מבנה הסיסמה.',
      accepts: ['grep hint login_policy.txt', 'grep hint evidence/login_policy.txt'],
      hint: 'כתבו grep hint login_policy.txt.',
      evidence: 'hint',
      success: 'grep מצא שהרמז חושף את מבנה הסיסמה.'
    },
    {
      id: 'grep-success',
      title: '7. ראיה: הייתה כניסה מוצלחת',
      prompt: 'מצאו בלוג ניסיון כניסה שהצליח.',
      accepts: ['grep success attempts.log', 'grep success evidence/attempts.log', 'cat attempts.log', 'cat evidence/attempts.log'],
      hint: 'כתבו grep success attempts.log.',
      evidence: 'success',
      success: 'מצאתם שורה שמראה כניסה מוצלחת.'
    }
  ];

  const terminalQuickCommands = [
    { command: 'pwd', label: 'איפה אני?' },
    { command: 'ls', label: 'מה יש כאן?' },
    { command: 'cd evidence', label: 'כניסה לראיות' },
    { command: 'cat login_policy.txt', label: 'קריאת קובץ' },
    { command: 'grep unlimited login_policy.txt', label: 'חיפוש unlimited' },
    { command: 'grep hint login_policy.txt', label: 'חיפוש hint' },
    { command: 'grep success attempts.log', label: 'חיפוש success' }
  ];

  const state = {
    station: 0,
    xp: 0,
    completed: new Set(),
    selectedCommand: '',
    terminalInput: 'help',
    terminalCwd: '/',
    terminalHistory: [],
    completedTerminalTasks: new Set(),
    foundEvidence: new Set(),
    terminalFeedback: 'התחילו ב־pwd. אחרי כל פקודה תקבלו פלט והסבר קצר.',
    report: { command: '', evidence: '', next: '' }
  };

  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const normalizeCommand = command => command.trim().replace(/\s+/g, ' ');

  function say(text) { $('assistantText').textContent = text; }

  function progress() {
    return Math.round((state.completed.size / stations.length) * 100);
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

  function setEvidenceProgress() {
    const value = Math.round((state.foundEvidence.size / 3) * 100);
    $('riskScore').textContent = `${value}%`;
    $('riskFill').style.width = `${value}%`;
    $('riskFill').className = value >= 100 ? 'low' : value >= 50 ? 'medium' : 'high';
    $('riskText').textContent = value === 100 ? 'כל שלוש הראיות נמצאו.' : 'חפשו שלוש ראיות בתיק.';
  }

  function terminalNode(pathValue) {
    const parts = pathValue.split('/').filter(Boolean);
    let node = terminalFileSystem['/'];
    for (const part of parts) {
      if (!node.children?.[part]) return null;
      node = node.children[part];
    }
    return node;
  }

  function resolvePath(rawPath) {
    if (!rawPath || rawPath === '.') return state.terminalCwd;
    const base = rawPath.startsWith('/') ? [] : state.terminalCwd.split('/').filter(Boolean);
    for (const part of rawPath.split('/')) {
      if (!part || part === '.') continue;
      if (part === '..') base.pop();
      else base.push(part);
    }
    return `/${base.join('/')}`.replace(/\/$/, '') || '/';
  }

  function runTerminalCommand(command) {
    if (!command) return { ok: false, output: 'type a command first' };
    if (command === 'help') {
      return {
        ok: true,
        output: [
          'Available training commands:',
          'pwd',
          'ls',
          'cd evidence',
          'cat login_policy.txt',
          'cat attempts.log',
          'grep unlimited login_policy.txt',
          'grep hint login_policy.txt',
          'grep success attempts.log'
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
      return { ok: true, output: Object.keys(node.children || {}).join('  ') };
    }
    if (command.startsWith('ls ')) {
      const target = terminalNode(resolvePath(command.slice(3)));
      if (!target) return { ok: false, output: 'ls: cannot access path' };
      if (target.type !== 'dir') return { ok: true, output: command.slice(3) };
      return { ok: true, output: Object.keys(target.children || {}).join('  ') };
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
      const target = terminalNode(resolvePath(parts.slice(2).join(' ')));
      if (!target || target.type !== 'file') return { ok: false, output: 'grep: file not found' };
      const lines = target.content.split('\n').filter(line => line.toLowerCase().includes(word));
      return { ok: true, output: lines.length ? lines.join('\n') : '(no matches)' };
    }

    const lowercaseCommand = command.toLowerCase();
    if (lowercaseCommand !== command && terminalTasks.some(task => task.accepts.includes(lowercaseCommand))) {
      return { ok: false, output: 'Linux is case-sensitive. Try the same command in lowercase.' };
    }
    if (command === 'dir') return { ok: false, output: 'dir is not part of this lab. In Linux practice, use: ls' };
    if (command.startsWith('type ')) return { ok: false, output: 'type is not part of this lab. To read a file, use: cat FILE' };
    if (command.startsWith('find ')) return { ok: false, output: 'find is not part of this lab. To search inside a file, use: grep WORD FILE' };
    return { ok: false, output: 'command not available in this training lab' };
  }

  function applyTerminalProgress(command, result) {
    const beforeTasks = new Set(state.completedTerminalTasks);
    const beforeEvidence = new Set(state.foundEvidence);
    terminalTasks.forEach(task => {
      if (task.accepts.includes(command) && result.ok) {
        state.completedTerminalTasks.add(task.id);
        if (task.evidence) state.foundEvidence.add(task.evidence);
      }
    });
    return {
      tasks: [...state.completedTerminalTasks].filter(id => !beforeTasks.has(id)),
      evidence: [...state.foundEvidence].filter(id => !beforeEvidence.has(id))
    };
  }

  function activeTerminalTaskIndex() {
    const index = terminalTasks.findIndex(task => !state.completedTerminalTasks.has(task.id));
    return index === -1 ? terminalTasks.length - 1 : index;
  }

  function evidenceLabel(id) {
    return {
      unlimited: 'אין הגבלת ניסיונות',
      hint: 'הרמז חושף מבנה סיסמה',
      success: 'הייתה כניסה מוצלחת'
    }[id] || id;
  }

  function terminalFeedback(command, result, changes) {
    if (!result.ok) {
      if (result.output.includes('case-sensitive')) return 'בלינוקס יש חשיבות לאותיות גדולות וקטנות. נסו באותיות קטנות.';
      if (result.output.includes('use: ls')) return 'במעבדה הזו משתמשים ב־ls כדי לראות קבצים ותיקיות.';
      if (result.output.includes('use: cat')) return 'כדי לקרוא קובץ משתמשים ב־cat ואז שם הקובץ.';
      if (result.output.includes('use: grep')) return 'כדי לחפש מילה בתוך קובץ משתמשים ב־grep.';
      return terminalTasks[activeTerminalTaskIndex()]?.hint || 'נסו את הרמז של המשימה הפעילה.';
    }
    if (changes.evidence.length) return `ראיה נמצאה: ${changes.evidence.map(evidenceLabel).join(' + ')}.`;
    if (changes.tasks.length) return terminalTasks.find(task => task.id === changes.tasks.at(-1))?.success || 'הפקודה רצה בהצלחה.';
    if (command === 'help') return 'פתחתם את רשימת הפקודות. התחילו עם pwd ואז ls.';
    return 'הפקודה רצה בהצלחה. קראו את הפלט והמשיכו למשימה הפעילה.';
  }

  function renderStationVideo(src, poster, title, text) {
    return `
      <section class="mystery-stage-video">
        <div>
          <span>סרטון קצר</span>
          <h3>${esc(title)}</h3>
          <p>${esc(text)}</p>
        </div>
        <video controls preload="metadata" playsinline poster="${esc(mediaUrl(poster))}">
          <source src="${esc(mediaUrl(src))}" type="video/mp4">
        </video>
      </section>
    `;
  }

  function renderBrief() {
    return `
      ${renderStationVideo('marketing/cyber-city-lesson7-concept-terminal.mp4', 'marketing/cyber-city-lesson7-concept-terminal-poster.jpg', 'טרמינל הוא כלי שיחה עם המחשב', 'בשיעור הזה לא מריצים פקודות אמיתיות על המחשב. הכול מעבדה סגורה שמלמדת את דפוס החשיבה.')}
      <section class="tool-grid">
        <article class="tool-card">
          <span>המטרה</span>
          <h3>לקרוא ראיות, לא לנחש.</h3>
          <p>הילדים לומדים פקודות בסיס שמופיעות בהרבה קורסי סייבר: איפה אני, מה יש פה, איך נכנסים לתיקייה, איך קוראים קובץ, ואיך מחפשים מילה.</p>
          <button class="button" type="button" data-complete-brief>הבנתי וממשיכים לפקודות</button>
        </article>
        <article class="tool-card">
          <span>בטיחות</span>
          <h3>סימולציה בלבד</h3>
          <p>אין גישה למחשב אמיתי, אין אינטרנט, ואין פקודות מחוץ לתיק הראיות של הלומדה.</p>
        </article>
      </section>
    `;
  }

  function renderCommands() {
    return `
      <section class="tool-grid">
        ${commandCards.map(card => `
          <article class="tool-card ${state.selectedCommand === card.command ? 'selected' : ''}">
            <span dir="ltr">${esc(card.command)}</span>
            <h3>${esc(card.name)}</h3>
            <p>${esc(card.text)}</p>
            <code dir="ltr">${esc(card.example)}</code>
            <button class="button ghost" type="button" data-command-card="${esc(card.command)}">הבנתי את הפקודה</button>
          </article>
        `).join('')}
      </section>
      <article class="tool-card">
        <span>בדיקת מוכנות</span>
        <h3>${state.selectedCommand ? `בחרתם את ${esc(state.selectedCommand)}` : 'בחרו לפחות כרטיס פקודה אחד'}</h3>
        <p>אחרי ההיכרות, נכנסים לטרמינל ומתרגלים את כולן ברצף.</p>
        <button class="button" type="button" data-complete-commands ${state.selectedCommand ? '' : 'disabled'}>אני מוכן למעבדה</button>
      </article>
    `;
  }

  function renderTerminal() {
    const activeIndex = activeTerminalTaskIndex();
    const activeTask = terminalTasks[activeIndex];
    const prompt = `student@linux-lab:${state.terminalCwd === '/' ? '~' : `~${state.terminalCwd}`}$`;
    const terminalComplete = state.completedTerminalTasks.size === terminalTasks.length && state.foundEvidence.size >= 3;
    return `
      <section class="linux-lab">
        <article class="tool-card terminal-mission-card">
          <span>משימת טרמינל</span>
          <h3>${terminalComplete ? 'כל הראיות נמצאו' : esc(activeTask.title)}</h3>
          <p>${terminalComplete ? 'עכשיו אפשר לסכם מה למדנו.' : esc(activeTask.prompt)}</p>
          <div class="terminal-mini-demo" aria-label="מיני הדגמת טרמינל">
            <b dir="ltr">student@linux-lab:~$ pwd</b>
            <code dir="ltr">/</code>
            <p>כותבים פקודה, לוחצים Enter או הרץ, קוראים את הפלט, ואז המשימה מתקדמת.</p>
          </div>
          <div class="terminal-progress">
            <strong>${state.completedTerminalTasks.size}/${terminalTasks.length}</strong>
            <span>פקודות הושלמו</span>
          </div>
          <ol class="terminal-task-list">
            ${terminalTasks.map((task, index) => `
              <li class="${state.completedTerminalTasks.has(task.id) ? 'done' : index === activeIndex ? 'active' : ''}">
                <strong>${esc(task.title)}</strong>
                <span>${esc(task.prompt)}</span>
              </li>
            `).join('')}
          </ol>
          <div class="terminal-command-bank">
            <span>בנק פקודות עזר</span>
            <div>
              ${terminalQuickCommands.map(item => `
                <button class="terminal-command-chip" type="button" data-terminal-command="${esc(item.command)}">${esc(item.label)}</button>
              `).join('')}
            </div>
          </div>
        </article>
        <article class="code-panel linux-terminal-panel">
          <div class="code-panel-toolbar"><span>Training Terminal</span><small dir="ltr">${esc(prompt)}</small></div>
          <div class="terminal-live-feedback ${state.foundEvidence.size ? 'has-evidence' : ''}">
            <strong>${state.foundEvidence.size ? 'תיק ראיות פעיל' : 'המשימה הפעילה'}</strong>
            <span>${esc(state.terminalFeedback)}</span>
          </div>
          <div class="terminal-screen" dir="ltr" lang="en" aria-label="טרמינל לינוקס מדומה">
            ${state.terminalHistory.length ? state.terminalHistory.slice(-8).map(item => `
              <div class="terminal-history-item ${item.ok === false ? 'error' : 'ok'}">
                <b>${esc(item.prompt)} ${esc(item.command)}</b>
                <pre>${esc(item.output)}</pre>
                <small dir="rtl">${esc(item.feedback)}</small>
                ${item.evidence?.length ? `<div class="terminal-found-badges" dir="rtl">${item.evidence.map(id => `<span>ראיה: ${esc(evidenceLabel(id))}</span>`).join('')}</div>` : ''}
              </div>
            `).join('') : `
              <div class="terminal-history-item">
                <b>${esc(prompt)} help</b>
                <pre>Type help to see commands. Start with pwd and ls.</pre>
              </div>
            `}
          </div>
          <form class="terminal-command-row" data-terminal-form>
            <label class="sr-only" for="terminalCommand">פקודת טרמינל</label>
            <span dir="ltr">${esc(prompt)}</span>
            <input id="terminalCommand" class="lab-input" type="text" data-terminal-input value="${esc(state.terminalInput)}" dir="ltr" lang="en" autocomplete="off" spellcheck="false">
            <button class="button" type="submit" data-run-terminal>הרץ</button>
          </form>
          <div class="terminal-evidence">
            ${['unlimited', 'hint', 'success'].map(id => `
              <span class="${state.foundEvidence.has(id) ? 'found' : ''}">${state.foundEvidence.has(id) ? 'נמצאה' : 'נעולה'}: ${esc(evidenceLabel(id))}</span>
            `).join('')}
          </div>
          ${terminalComplete ? `
            <div class="terminal-victory">
              <strong>תיק הראיות נפתר</strong>
              <p>מצאתם שלוש ראיות בעזרת פקודות Linux בסיסיות.</p>
              <small>בשיעור הבא ניקח את הראיות האלה ונבדוק אותן עם Python Defense Checker.</small>
            </div>
          ` : ''}
          <button class="button" type="button" data-save-terminal ${terminalComplete ? '' : 'disabled'}>שמור ראיות ועבור לסיכום</button>
        </article>
      </section>
    `;
  }

  function renderReport() {
    return `
      <section class="tool-grid">
        <article class="tool-card">
          <span>Linux Evidence Card</span>
          <h3>סיכום קצר של מה שלמדנו</h3>
          <label>פקודה שהבנתי הכי טוב
            <input class="lab-input" data-report-field="command" value="${esc(state.report.command)}" placeholder="למשל grep">
          </label>
          <label>ראיה שמצאתי
            <input class="lab-input" data-report-field="evidence" value="${esc(state.report.evidence)}" placeholder="למשל max_attempts=unlimited">
          </label>
          <label>מה יקרה בשיעור הבא
            <input class="lab-input" data-report-field="next" value="${esc(state.report.next)}" placeholder="Python יבדוק את המדיניות">
          </label>
          <button class="button" type="button" data-submit-report>הגש כרטיס Linux</button>
        </article>
        <article class="tool-card">
          <span>תוצר שיעור 7</span>
          <h3>הילד יוצא עם בסיס אמיתי</h3>
          <ul>
            <li><strong>pwd</strong> מראה איפה אנחנו.</li>
            <li><strong>ls</strong> מציגה קבצים ותיקיות.</li>
            <li><strong>cd</strong> עוברת תיקייה.</li>
            <li><strong>cat</strong> קוראת קובץ.</li>
            <li><strong>grep</strong> מחפשת ראיה בתוך קובץ.</li>
          </ul>
        </article>
      </section>
    `;
  }

  function renderContent() {
    const type = stations[state.station].type;
    if (type === 'brief') return renderBrief();
    if (type === 'commands') return renderCommands();
    if (type === 'terminal') return renderTerminal();
    return renderReport();
  }

  function renderShell() {
    const station = stations[state.station];
    const nextStation = stations[state.station + 1];
    $('stationTime').textContent = station.time;
    $('stationTitle').textContent = station.title;
    $('stationGoal').textContent = station.goal;
    $('currentStepLabel').textContent = `משימה ${state.station + 1} מתוך ${stations.length}`;
    $('currentStepName').textContent = station.short;
    $('progressLabel').textContent = `${progress()}%`;
    $('xpLabel').textContent = state.xp;
    $('prevStation').disabled = state.station === 0;
    $('nextStation').textContent = state.station === stations.length - 1 ? 'סיום' : `הבא: ${nextStation.short}`;
    $('stationNav').style.gridTemplateColumns = `repeat(${stations.length}, minmax(0, 1fr))`;
    $('stationNav').innerHTML = stations.map((item, index) => `
      <button class="station-tab ${index === state.station ? 'active' : ''} ${state.completed.has(item.id) ? 'done' : ''}" type="button" data-station="${index}" aria-label="מעבר אל משימה ${index + 1}: ${esc(item.title)}">
        <span>${index + 1}</span>
        <strong>${esc(item.short)}</strong>
      </button>
    `).join('');
    $('caseFile').innerHTML = state.foundEvidence.size
      ? [...state.foundEvidence].map(id => `<p>${esc(evidenceLabel(id))}</p>`).join('')
      : '<p>עדיין אין ראיות. התחילו במעבדת הטרמינל.</p>';
    setEvidenceProgress();
  }

  function bindEvents() {
    $('stationNav').querySelectorAll('[data-station]').forEach(button => {
      button.addEventListener('click', () => {
        state.station = Number(button.dataset.station);
        render();
      });
    });

    document.querySelector('[data-complete-brief]')?.addEventListener('click', () => {
      complete('brief');
      say('מעולה. עכשיו מכירים את חמש הפקודות בלי עומס.');
      state.station = 1;
      render();
    });

    document.querySelectorAll('[data-command-card]').forEach(button => {
      button.addEventListener('click', () => {
        state.selectedCommand = button.dataset.commandCard;
        say(`הפקודה ${state.selectedCommand} נכנסה לארגז הכלים שלכם.`);
        render();
      });
    });

    document.querySelector('[data-complete-commands]')?.addEventListener('click', () => {
      if (!state.selectedCommand) return;
      complete('commands');
      say('יפה. עכשיו מתרגלים את הפקודות על תיק ראיות אמיתי בתוך סימולציה.');
      state.station = 2;
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
      const prompt = `student@linux-lab:${state.terminalCwd === '/' ? '~' : `~${state.terminalCwd}`}$`;
      const result = runTerminalCommand(command);
      const changes = applyTerminalProgress(command, result);
      const feedback = terminalFeedback(command, result, changes);
      state.terminalFeedback = feedback;
      if (command !== 'clear') state.terminalHistory.push({ prompt, command, output: result.output, ok: result.ok, feedback, evidence: changes.evidence });
      state.terminalInput = '';
      say(result.ok ? `${feedback} התקדמות: ${state.completedTerminalTasks.size}/${terminalTasks.length}.` : feedback);
      render();
    });

    document.querySelector('[data-save-terminal]')?.addEventListener('click', () => {
      if (state.completedTerminalTasks.size < terminalTasks.length || state.foundEvidence.size < 3) return;
      complete('terminal');
      say('מעולה. זה בדיוק בסיס Linux שהיינו צריכים לפני Python.');
      state.station = 3;
      render();
    });

    document.querySelectorAll('[data-report-field]').forEach(input => {
      input.addEventListener('input', event => {
        state.report[event.target.dataset.reportField] = event.target.value;
      });
    });

    document.querySelector('[data-submit-report]')?.addEventListener('click', () => {
      if (!state.report.command || !state.report.evidence || !state.report.next) {
        say('מלאו את שלושת השדות כדי לסיים את שיעור 7.');
        return;
      }
      complete('report');
      say('שיעור 7 הושלם. יש לכם בסיס לינוקס נקי, ועכשיו אפשר לעבור לשיעור 8 בלי קפיצה חדה מדי.');
      render();
    });
  }

  function render() {
    renderShell();
    $('stationContent').innerHTML = renderContent();
    bindEvents();
  }

  $('prevStation').addEventListener('click', () => {
    if (state.station > 0) state.station -= 1;
    render();
  });

  $('nextStation').addEventListener('click', () => {
    if (state.station < stations.length - 1) state.station += 1;
    render();
  });

  $('resetLab').addEventListener('click', () => {
    state.station = 0;
    state.xp = 0;
    state.completed = new Set();
    state.selectedCommand = '';
    state.terminalInput = 'help';
    state.terminalCwd = '/';
    state.terminalHistory = [];
    state.completedTerminalTasks = new Set();
    state.foundEvidence = new Set();
    state.terminalFeedback = 'התחילו ב־pwd. אחרי כל פקודה תקבלו פלט והסבר קצר.';
    state.report = { command: '', evidence: '', next: '' };
    say('המעבדה אופסה. מתחילים מחדש עם בסיס Linux נקי.');
    render();
  });

  render();
}());
