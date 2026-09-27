(() => {
  const page = document.body.dataset.classroomPage;
  const allowedNext = new Set([
    'sensi-city.html?lesson=1',
    'sisi.html',
    'python-turtle.html',
    'webcode.html',
    'minecraft.html',
    'craftom-school/preview/index.html',
  ]);

  function nextCourse() {
    const requested = new URLSearchParams(location.search).get('next') || '';
    return allowedNext.has(requested) ? requested : 'index.html#courses';
  }

  function requestedCourse() {
    const requested = new URLSearchParams(location.search).get('next') || '';
    return allowedNext.has(requested) ? requested : '';
  }

  function guestCourse() {
    return 'sisi.html';
  }

  function summerToken() {
    return localStorage.getItem('haiTechSummerToken') || '';
  }

  async function summerRequest(path) {
    const token = summerToken();
    const response = await fetch(path, {
      method: path.endsWith('/logout') ? 'POST' : 'GET',
      credentials: 'same-origin',
      headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' },
      body: path.endsWith('/logout') ? '{}' : undefined,
    });
    let data = {};
    try { data = await response.json(); } catch {}
    if (!response.ok) throw new Error(data.error || 'הפעולה לא הצליחה.');
    return data;
  }

  async function api(path, payload) {
    const response = await fetch(path, {
      method: payload === undefined ? 'GET' : 'POST',
      credentials: 'same-origin',
      headers: payload === undefined ? {} : { 'Content-Type': 'application/json' },
      body: payload === undefined ? undefined : JSON.stringify(payload),
    });
    let data = {};
    try { data = await response.json(); } catch {}
    if (!response.ok) throw new Error(data.error || 'הפעולה לא הצליחה.');
    return data;
  }

  function formData(form) {
    return Object.fromEntries(new FormData(form).entries());
  }

  function setMessage(element, text, success = false) {
    if (!element) return;
    element.textContent = text || '';
    element.classList.toggle('success', success);
  }

  async function initEntry() {
    const requested = requestedCourse();
    const next = requested || nextCourse();
    const guestNext = guestCourse();
    const guest = document.getElementById('guest-continue');
    const subscription = document.getElementById('subscription-continue');
    const studentContinue = document.getElementById('student-continue');
    const studentCourseLinks = document.getElementById('student-course-links');
    if (guest) guest.href = guestNext;
    if (studentContinue) studentContinue.href = next;

    const form = document.getElementById('student-login-form');
    const message = document.getElementById('student-login-message');
    const session = document.getElementById('student-session');
    const welcome = document.getElementById('student-welcome');
    const studentLogout = document.getElementById('student-logout');
    const previewDemoStudent = document.getElementById('preview-demo-student');

    guest.addEventListener('click', async (event) => {
      event.preventDefault();
      setMessage(message, 'עוברים למצב אורח…');
      try {
        await api('/api/classroom/logout', {});
        await summerRequest('/api/summer/logout');
        localStorage.removeItem('haiTechSummerToken');
        location.assign(guestNext);
      } catch (error) {
        setMessage(message, error.message);
      }
    });

    subscription.addEventListener('click', async (event) => {
      event.preventDefault();
      setMessage(message, 'עוברים למנוי האישי…');
      try {
        await api('/api/classroom/logout', {});
      } catch (error) {
        setMessage(message, error.message);
        return;
      }
      if (!summerToken()) {
        location.assign('login.html');
        return;
      }
      try {
        const me = await summerRequest('/api/summer/me');
        location.assign(me.mode === 'child' ? next : 'account.html');
      } catch {
        localStorage.removeItem('haiTechSummerToken');
        location.assign('login.html');
      }
    });

    function showStudent(data) {
      document.body.classList.add('classroom-student-signed-in');
      form.hidden = true;
      session.hidden = false;
      welcome.textContent = `שלום ${data.student.name}, נכנסת לכיתה ${data.classroom.name}.`;
      if (studentCourseLinks) {
        const links = (data.classroom.courses || []).map((courseId) => {
          const link = element('a', courseLabels[courseId] || courseId, 'button primary');
          link.href = courseStarts[courseId] || 'index.html#courses';
          return link;
        });
        studentCourseLinks.replaceChildren(...links);
      }
      if (studentContinue) studentContinue.hidden = true;
    }

    try {
      const me = await api('/api/classroom/me');
      if (me.role === 'student') showStudent(me);
      if (me.role === 'guest' && me.subscriptionGateEnabled === false && requested) {
        location.assign(requested);
      }
    } catch {}

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      setMessage(message, 'נכנסים…');
      try {
        const data = await api('/api/classroom/student-login', formData(form));
        setMessage(message, '', true);
        showStudent(data);
      } catch (error) {
        setMessage(message, error.message);
      }
    });

    if (previewDemoStudent) {
      api('/api/classroom/preview-demo-student-enabled')
        .then((data) => {
          if (data.enabled) previewDemoStudent.hidden = false;
        })
        .catch(() => {});
      previewDemoStudent.addEventListener('click', async () => {
        setMessage(message, 'פותחים תלמידת בדיקה…');
        previewDemoStudent.disabled = true;
        try {
          const data = await api('/api/classroom/preview-demo-student-login', {});
          setMessage(message, '', true);
          showStudent(data);
        } catch (error) {
          setMessage(message, error.message);
        } finally {
          previewDemoStudent.disabled = false;
        }
      });
    }

    studentLogout.addEventListener('click', async () => {
      setMessage(message, 'מתנתקים…');
      try {
        await api('/api/classroom/logout', {});
        document.body.classList.remove('classroom-student-signed-in');
        session.hidden = true;
        form.hidden = false;
        form.reset();
        setMessage(message, 'אפשר להיכנס עכשיו כתלמיד/ה אחר/ת.', true);
      } catch (error) {
        setMessage(message, error.message);
      }
    });
  }

  function element(tag, text, className) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  }

  const courseLabels = {
    'sensi-city': 'סנסי בעיר החכמה',
    sisi: 'סיסי',
    'python-turtle': 'Python Turtle',
    webcode: 'Web Code',
    minecraft: 'Minecraft',
    'craftom-agent': 'אקדמיית ה-Agent',
  };

  const courseStarts = {
    'sensi-city': 'sensi-city.html?lesson=1',
    sisi: 'sisi.html',
    'python-turtle': 'python-turtle.html',
    webcode: 'webcode.html',
    minecraft: 'minecraft.html',
    'craftom-agent': 'craftom-school/preview/index.html',
  };

  const teacherCourseStarts = {
    ...courseStarts,
    'craftom-agent': 'agent-academy-teacher.html',
  };

  function teacherCourseHref(courseId, classroomId = '') {
    if (courseId === 'craftom-agent' && classroomId) return `agent-academy-teacher.html?classroomId=${encodeURIComponent(classroomId)}`;
    return teacherCourseStarts[courseId] || courseStarts[courseId] || 'index.html#courses';
  }

  function teacherLessonHref(classroomId, lessonId) {
    return `agent-academy-teacher.html?classroomId=${encodeURIComponent(classroomId)}&lesson=${encodeURIComponent(String(lessonId))}`;
  }

  function progressLabel(status) {
    return {
      completed: 'הושלם',
      started: 'בתהליך',
      missing: 'לא התחיל',
    }[status] || 'לא התחיל';
  }

  function learningLabel(status, completeText, startedText, missingText) {
    if (status === 'completed') return completeText;
    if (status === 'started') return startedText;
    return missingText;
  }

  function lessonZeroRetrying(lesson) {
    return Number(lesson?.lessonId) === 0 && Boolean(lesson?.retrying);
  }

  function dashboardIsMazeMode(dashboard) {
    return dashboard?.worldMode !== 'build';
  }

  function dashboardIsBuildMode(dashboard) {
    return dashboard?.worldMode === 'build';
  }

  function progressLabelForLesson(lesson) {
    if (lessonZeroRetrying(lesson)) return 'ניסיון חדש';
    return progressLabel(lesson?.overallStatus);
  }

  function minecraftLabelForLesson(lesson) {
    if (lessonZeroRetrying(lesson)) return 'מנסה שוב';
    return learningLabel(lesson?.minecraftStatus, 'הושלם', 'בתהליך', 'לא התחיל');
  }

  function lessonSubmissionSummary(lesson) {
    if (Number(lesson?.lessonId) === 0) {
      if (lessonZeroRetrying(lesson)) return 'ניסיון חדש במיינקראפט';
      if (lesson?.overallStatus === 'completed') return 'הושלם במיינקראפט';
      if (lesson?.overallStatus === 'started') return 'בתהליך במיינקראפט';
      return 'עדיין לא התחיל';
    }
    return lesson?.submission ? 'יש הגשה' : 'אין הגשה';
  }

  function lessonExitStatus(lesson) {
    if (Number(lesson?.lessonId) === 0) {
      if (lessonZeroRetrying(lesson)) return { label: 'סיום', text: 'ניסיון חדש', state: 'started' };
      if (lesson?.overallStatus === 'completed') return { label: 'סיום', text: 'לחץ/ה סיום', state: 'completed' };
      if (lesson?.overallStatus === 'started') return { label: 'סיום', text: 'בתהליך', state: 'started' };
      return { label: 'סיום', text: 'טרם סיים/ה', state: 'not-started' };
    }
    return {
      label: 'כרטיס',
      text: learningLabel(lesson?.exitTicketStatus, 'הוגש', 'בתהליך', 'חסר'),
      state: lesson?.exitTicketStatus,
    };
  }

  function formatDashboardDate(value) {
    if (!value) return 'אין עדיין';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'אין עדיין';
    return date.toLocaleString('he-IL');
  }

  function formatDashboardDuration(value) {
    const ms = Number(value);
    if (!Number.isFinite(ms) || ms < 0) return 'אין';
    const seconds = Math.round(ms / 1000);
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  }

  function hasDashboardDuration(value) {
    return value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value));
  }

  function renderLessonDetail(student, lesson, dashboard) {
    const buildMode = dashboardIsBuildMode(dashboard);
    const detail = element('div', undefined, 'progress-detail-card');
    detail.append(element('h4', `${student.name} · ${buildMode ? 'מצב בנייה' : `שיעור ${lesson.lessonId}`}`));
    detail.append(element('p', buildMode ? 'משימת בנייה במתחם האישי ב-Minecraft.' : lesson.title || 'שיעור'));
    const statuses = element('div', undefined, 'progress-detail-statuses');
    const statusItems = buildMode
      ? [
        ['Minecraft', minecraftLabelForLesson(lesson), lesson.minecraftStatus],
      ]
      : [
        ['אקדמיית Agent', learningLabel(lesson.academyStatus, 'הושלמה', 'בתהליך', 'חסרה'), lesson.academyStatus],
        ['Minecraft', minecraftLabelForLesson(lesson), lesson.minecraftStatus],
        (() => {
          const exitStatus = lessonExitStatus(lesson);
          return [exitStatus.label, exitStatus.text, exitStatus.state];
        })(),
      ];
    statusItems.forEach(([label, text, status]) => {
      const item = element('span', undefined, `progress-pill ${status}`);
      item.append(element('strong', label), document.createTextNode(text));
      statuses.append(item);
    });
    if (buildMode || Number(lesson.lessonId) === 0) statuses.append(renderMinecraftConnectionPill(lesson.minecraftConnection || student.minecraftConnection));
    detail.append(statuses);
    const meta = element('dl', undefined, 'progress-detail-meta');
    const connection = lesson.minecraftConnection || student.minecraftConnection || {};
    const metaItems = buildMode
      ? [
        ['חיבור', minecraftConnectionLabel(connection).text],
        ['מתחם', connection.compoundId ? `#${connection.compoundId}` : 'אין עדיין'],
        ['כניסה אחרונה', formatDashboardDate(connection.lastSeenAt)],
      ]
      : [
        ['ניסיונות שהושלמו', String(lesson.attempts || 0)],
        ['זמן אחרון', formatDashboardDuration(lesson.lastDurationMs)],
        ['שיא', formatDashboardDuration(lesson.bestTimeMs)],
        ['עודכן', formatDashboardDate(lesson.updatedAt)],
      ];
    metaItems.forEach(([term, value]) => {
      meta.append(element('dt', term), element('dd', value));
    });
    detail.append(meta);
    if (lesson.submission) {
      const submission = element('div', undefined, 'progress-submission');
      const imageLink = element('a');
      imageLink.href = lesson.submission.photo.url;
      imageLink.target = '_blank';
      imageLink.rel = 'noopener';
      const image = document.createElement('img');
      image.src = lesson.submission.photo.url;
      image.alt = `תמונת הגשה של ${student.name}`;
      imageLink.append(image);
      const info = element('div');
      info.append(
        element('strong', lesson.submission.lessonTitle || `הגשה לשיעור ${lesson.lessonId}`),
        element('p', lesson.submission.exitAnswer || 'אין תשובה כתובה.'),
        element('small', `עודכן: ${formatDashboardDate(lesson.submission.updatedAt)}`),
      );
      submission.append(imageLink, info);
      detail.append(submission);
    } else if (buildMode) {
      detail.append(element('p', 'במצב בנייה אין מדידת מטבעות או זמן; המעקב הוא לפי חיבור, מתחם ופעולות מורה.', 'progress-empty-note'));
    } else if (Number(lesson.lessonId) === 0) {
      detail.append(element('p', 'בשיעור 0 אין כרטיס יציאה רגיל; הסיום נמדד לפי מטבעות, זמן וכפתור הסיום במיינקראפט.', 'progress-empty-note'));
    } else {
      detail.append(element('p', 'אין עדיין תמונה או כרטיס יציאה לשיעור הזה.', 'progress-empty-note'));
    }
    return detail;
  }

  function minecraftConnectionLabel(connection) {
    if (!connection?.playerName) return { text: 'אין שחקן Minecraft משויך', state: 'unassigned' };
    if (connection.connected) return { text: 'מחובר/ת עכשיו', state: 'connected' };
    const lastSeen = formatDashboardDate(connection.lastSeenAt);
    if (connection.lastSeenAt && lastSeen !== 'אין עדיין') return { text: `נראה/תה לאחרונה: ${lastSeen}`, state: 'last-seen' };
    return { text: 'לא מחובר/ת עכשיו', state: 'offline' };
  }

  function renderMinecraftConnectionPill(connection) {
    const label = minecraftConnectionLabel(connection);
    const pill = element('span', undefined, `minecraft-connection-mini ${label.state}`);
    pill.append(element('strong', 'חיבור'), document.createTextNode(label.text));
    return pill;
  }

  function renderStudentIdentityBadges(student, lesson) {
    const connection = lesson?.minecraftConnection || student.minecraftConnection || {};
    const minecraftName = connection.playerName || student.minecraftPlayerName || '';
    const lines = element('div', undefined, 'student-minecraft-identity-lines');
    [
      ['Minecraft', minecraftName || 'לא שויך עדיין'],
      ['מייל', student.minecraftEmail || 'אין עדיין'],
    ].forEach(([label, value]) => {
      lines.append(element('span', `${label}: ${value}`));
    });
    return lines;
  }

  function renderCoinProgress(connection) {
    const coins = Math.max(0, Number(connection?.coins || 0));
    const goal = Math.max(1, Number(connection?.goalCoins || 8));
    const shownCoins = Math.min(coins, goal);
    const percent = Math.max(0, Math.min(100, Math.round((shownCoins / goal) * 100)));
    const progress = element('div', undefined, `coin-progress${shownCoins >= goal ? ' complete' : ''}`);
    const label = element('div', undefined, 'coin-progress-label');
    label.append(element('strong', 'מטבעות'), element('span', `${shownCoins} מתוך ${goal}`));
    const track = element('div', undefined, 'coin-progress-track');
    track.setAttribute('role', 'progressbar');
    track.setAttribute('aria-valuemin', '0');
    track.setAttribute('aria-valuemax', String(goal));
    track.setAttribute('aria-valuenow', String(shownCoins));
    const fill = element('span');
    fill.style.width = `${percent}%`;
    track.append(fill);
    progress.append(label, track);
    return progress;
  }

  function renderLessonDurationPills(lesson) {
    const pills = [];
    if (hasDashboardDuration(lesson?.lastDurationMs)) {
      const duration = element('span', undefined, 'mini-status completed duration-status');
      duration.append(element('strong', 'זמן סיום'), document.createTextNode(formatDashboardDuration(lesson.lastDurationMs)));
      pills.push(duration);
    }
    if (hasDashboardDuration(lesson?.bestTimeMs)) {
      const best = element('span', undefined, 'mini-status completed duration-status');
      best.append(element('strong', 'שיא'), document.createTextNode(formatDashboardDuration(lesson.bestTimeMs)));
      pills.push(best);
    }
    return pills;
  }

  function renderMinecraftActionButtons(classroomId, scope, target, setStatus, onDone) {
    const actions = element('div', undefined, 'minecraft-command-actions');
    const label = scope === 'all' ? 'לכולם' : 'לתלמיד/ה';
    async function command(path, payload, busyText, successText) {
      setStatus(busyText);
      [...actions.querySelectorAll('button')].forEach((button) => { button.disabled = true; });
      try {
        await api(`/api/kugel/classes/${encodeURIComponent(classroomId)}/${path}`, payload);
        setStatus(successText, true);
        if (onDone) await onDone();
      } catch (error) {
        setStatus(error.message);
      } finally {
        [...actions.querySelectorAll('button')].forEach((button) => { button.disabled = false; });
      }
    }
    const messageButton = element('button', `צ׳אט ${label}`, 'button quiet compact-action');
    const freezeButton = element('button', `עצירה ${label}`, 'button quiet compact-action');
    const releaseButton = element('button', `שחרור ${label}`, 'button quiet compact-action');
    const teleportButton = element('button', 'שיגור אל התלמיד/ה', 'button quiet compact-action');
    [messageButton, freezeButton, releaseButton, teleportButton].forEach((button) => { button.type = 'button'; });
    if (scope === 'player' && !target) {
      [messageButton, freezeButton, releaseButton, teleportButton].forEach((button) => { button.disabled = true; });
    }
    messageButton.addEventListener('click', () => {
      const text = prompt(scope === 'all' ? 'מה לשלוח בצ׳אט לכל הכיתה?' : 'מה לשלוח בצ׳אט לתלמיד/ה?');
      if (!text?.trim()) return;
      command('message', { scope, target, text: text.trim() }, 'שולחים הודעה ל-Minecraft…', 'ההודעה נשלחה.');
    });
    freezeButton.addEventListener('click', () => command('freeze', { scope, target, on: true }, 'עוצרים תנועה ב-Minecraft…', 'העצירה נשלחה.'));
    releaseButton.addEventListener('click', () => command('freeze', { scope, target, on: false }, 'משחררים תנועה ב-Minecraft…', 'השחרור נשלח.'));
    teleportButton.addEventListener('click', () => command('teleport', { target }, 'משגרים אל התלמיד/ה…', 'השיגור נשלח.'));
    actions.append(messageButton, freezeButton, releaseButton);
    if (scope === 'player') actions.append(teleportButton);
    return actions;
  }

  function lessonProgressCounts(students, lessonIndex) {
    return students.reduce((counts, student) => {
      const lesson = student.lessons[lessonIndex];
      if (!lesson) return counts;
      if (lesson.overallStatus === 'started' || lesson.overallStatus === 'completed') counts.started += 1;
      if (lesson.overallStatus === 'completed') counts.completed += 1;
      if (lesson.submission) counts.submissions += 1;
      if (lesson.overallStatus !== 'completed' && (lesson.academyStatus === 'started' || lesson.minecraftStatus === 'started')) counts.needsAttention += 1;
      return counts;
    }, { started: 0, completed: 0, submissions: 0, needsAttention: 0 });
  }

  function createFullProgressTable(dashboard) {
    const tableWrap = element('div', undefined, 'progress-table-wrap');
    const table = element('table', undefined, 'progress-table');
    const thead = element('thead');
    const headRow = element('tr');
    headRow.append(element('th', 'תלמיד/ה'));
    dashboard.lessons.forEach((lesson) => {
      const th = element('th', lesson.id === 0 ? '0' : String(lesson.id));
      th.title = lesson.title;
      headRow.append(th);
    });
    thead.append(headRow);
    const tbody = element('tbody');
    const details = element('div', 'בחרו תא בטבלה כדי לראות פירוט תלמיד ושיעור.', 'progress-detail');
    dashboard.students.forEach((student) => {
      const row = element('tr');
      const name = element('th', undefined, 'progress-student-name');
      name.append(element('strong', student.name), element('small', `${student.totals.completed} הושלמו · ${student.totals.submissions} הגשות`));
      row.append(name);
      student.lessons.forEach((lesson) => {
        const cell = element('td');
        const button = element('button', progressLabel(lesson.overallStatus), `progress-cell ${lesson.overallStatus}`);
        button.type = 'button';
        button.title = `${student.name} · ${lesson.title}`;
        button.addEventListener('click', () => {
          details.replaceChildren(renderLessonDetail(student, lesson, dashboard));
        });
        cell.append(button);
        row.append(cell);
      });
      tbody.append(row);
    });
    table.append(thead, tbody);
    tableWrap.append(table);
    return [tableWrap, details];
  }

  function renderProgressDashboard(container, dashboard, options = {}) {
    container.replaceChildren();
    const summary = element('div', undefined, 'progress-summary-grid');
    [
      ['תלמידים', dashboard.totals.students],
      ['התחילו', dashboard.totals.startedStudents],
      ['השלימו לפחות שיעור', dashboard.totals.completedStudents],
      ['הגשות', dashboard.totals.submissions],
      ['צריכים תשומת לב', dashboard.totals.needsAttention],
    ].forEach(([label, value]) => {
      const card = element('div', undefined, 'progress-summary-card');
      card.append(element('strong', String(value || 0)), element('span', label));
      summary.append(card);
    });

    const buildMode = dashboardIsBuildMode(dashboard);
    const defaultLessonIndex = buildMode
      ? Math.max(0, dashboard.lessons.findIndex(lesson => Number(lesson.id) >= 1))
      : 0;
    let selectedLessonIndex = Math.max(0, Math.min(
      dashboard.lessons.length - 1,
      options.selectedLessonIndex === undefined || options.selectedLessonIndex === null
        ? defaultLessonIndex
        : Number(options.selectedLessonIndex || 0),
    ));
    const lessonFocus = element('section', undefined, 'lesson-progress-focus');
    const lessonTop = element('div', undefined, 'lesson-progress-top');
    const lessonCopy = element('div');
    lessonCopy.append(
      element('strong', 'בדיקת שיעור אחד'),
      element('span', 'בחרי שיעור, ותראי רק את התלמידים והסטטוס שלהם באותו שיעור.'),
    );
    const lessonSelect = document.createElement('select');
    lessonSelect.setAttribute('aria-label', 'בחירת שיעור לדוח התקדמות');
    dashboard.lessons.forEach((lesson, index) => {
      const option = document.createElement('option');
      option.value = String(index);
      option.textContent = `שיעור ${lesson.id}: ${lesson.title}`;
      lessonSelect.append(option);
    });
    lessonSelect.value = String(selectedLessonIndex);
    lessonTop.append(lessonCopy, lessonSelect);
    const lessonBody = element('div', undefined, 'lesson-progress-body');
    const classroomId = dashboard.classroom?.id || options.classroomId || '';
    const setDashboardStatus = (text, success = false) => {
      if (options.setStatus) options.setStatus(text, success);
    };

    function renderSelectedLesson() {
      const lesson = dashboard.lessons[selectedLessonIndex];
      const buildMode = dashboardIsBuildMode(dashboard);
      const counts = lessonProgressCounts(dashboard.students, selectedLessonIndex);
      const lessonCards = element('div', undefined, 'lesson-summary-grid');
      [
        ['התחילו', counts.started],
        ['השלימו', counts.completed],
        ['הגישו', counts.submissions],
        ['צריכים עזרה', counts.needsAttention],
      ].forEach(([label, value]) => {
        const card = element('div', undefined, 'progress-summary-card compact');
        card.append(element('strong', String(value || 0)), element('span', label));
        lessonCards.append(card);
      });

      const studentList = element('div', undefined, 'lesson-student-list');
      const lessonZeroControls = Number(lesson.id) === 0 && classroomId && !buildMode
        ? (() => {
          const controls = element('section', undefined, 'minecraft-class-controls');
          controls.append(
            element('strong', 'פקודות Minecraft לכל הכיתה'),
            renderMinecraftActionButtons(classroomId, 'all', '', setDashboardStatus, options.onCommandDone),
          );
          return controls;
        })()
        : null;
      dashboard.students.forEach((student) => {
        const studentLesson = student.lessons[selectedLessonIndex];
        const item = element('article', undefined, `lesson-student-row ${studentLesson.overallStatus}`);
        const name = element('div', undefined, 'lesson-student-name');
        name.append(
          element('strong', student.name),
          renderStudentIdentityBadges(student, studentLesson),
          element('span', lessonSubmissionSummary(studentLesson)),
        );
        const status = element('div', undefined, 'lesson-student-status');
        const statusItems = buildMode
          ? [
            ['חיבור', minecraftConnectionLabel(studentLesson.minecraftConnection || student.minecraftConnection).text, (studentLesson.minecraftConnection || student.minecraftConnection)?.connected ? 'started' : 'not-started'],
            ['מתחם', (studentLesson.minecraftConnection || student.minecraftConnection)?.compoundId ? `#${(studentLesson.minecraftConnection || student.minecraftConnection).compoundId}` : 'אין עדיין', 'not-started'],
            ['כניסה אחרונה', formatDashboardDate((studentLesson.minecraftConnection || student.minecraftConnection)?.lastSeenAt), 'not-started'],
          ]
          : [
            ['כללי', progressLabelForLesson(studentLesson), studentLesson.overallStatus],
            ['Agent', learningLabel(studentLesson.academyStatus, 'הושלם', 'בתהליך', 'חסר'), studentLesson.academyStatus],
            ['Minecraft', minecraftLabelForLesson(studentLesson), studentLesson.minecraftStatus],
            (() => {
              const exitStatus = lessonExitStatus(studentLesson);
              return [exitStatus.label, exitStatus.text, exitStatus.state];
            })(),
          ];
        statusItems.forEach(([label, value, state]) => {
          const pill = element('span', undefined, `mini-status ${state}`);
          pill.append(element('strong', label), document.createTextNode(value));
          status.append(pill);
        });
        if (buildMode) {
          const connection = studentLesson.minecraftConnection || student.minecraftConnection;
          status.append(renderMinecraftActionButtons(
            classroomId,
            'player',
            connection?.playerName || student.minecraftPlayerName || '',
            setDashboardStatus,
            options.onCommandDone,
          ));
        } else if (Number(studentLesson.lessonId) === 0) {
          const connection = studentLesson.minecraftConnection || student.minecraftConnection;
          status.append(renderMinecraftConnectionPill(connection), renderCoinProgress(connection));
          status.append(...renderLessonDurationPills(studentLesson));
          status.append(renderMinecraftActionButtons(
            classroomId,
            'player',
            connection?.playerName || student.minecraftPlayerName || '',
            setDashboardStatus,
            options.onCommandDone,
          ));
        }
        item.append(name, status);
        if (!buildMode) {
          const inlineDetail = element('div', undefined, 'lesson-inline-detail');
          inlineDetail.append(renderLessonDetail(student, studentLesson, dashboard));
          item.append(inlineDetail);
        }
        studentList.append(item);
      });

      lessonBody.replaceChildren(
        element('h4', `שיעור ${lesson.id}: ${lesson.title}`),
        lessonCards,
        ...(buildMode && classroomId ? [(() => {
          const controls = element('section', undefined, 'minecraft-class-controls');
          controls.append(
            element('strong', 'פקודות Minecraft לכל הכיתה'),
            renderMinecraftActionButtons(classroomId, 'all', '', setDashboardStatus, options.onCommandDone),
          );
          return controls;
        })()] : []),
        ...(lessonZeroControls ? [lessonZeroControls] : []),
        studentList,
      );
    }

    lessonSelect.addEventListener('change', () => {
      selectedLessonIndex = Number(lessonSelect.value) || 0;
      renderSelectedLesson();
    });
    renderSelectedLesson();
    lessonFocus.append(lessonTop, lessonBody);

    const advanced = element('details', undefined, 'progress-advanced');
    advanced.open = Boolean(options.advancedOpen);
    advanced.append(element('summary', 'תצוגה מלאה של כל השיעורים'));
    advanced.append(...createFullProgressTable(dashboard));

    container.append(summary, lessonFocus, advanced);
  }

  function selectedCourses(form) {
    return new FormData(form).getAll('courses');
  }

  function createCoursePicker(selected = [], availableCourseIds = Object.keys(courseLabels)) {
    const fieldset = element('fieldset', undefined, 'course-picker');
    fieldset.append(element('legend', 'לומדות פתוחות לכיתה'));
    for (const courseId of availableCourseIds) {
      const labelText = courseLabels[courseId] || courseId;
      const label = element('label');
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.name = 'courses';
      input.value = courseId;
      input.checked = selected.includes(courseId);
      label.append(input, ` ${labelText}`);
      fieldset.append(label);
    }
    return fieldset;
  }

  async function initTeacher() {
    const teacherParams = new URLSearchParams(location.search);
    const shouldOpenClassList = teacherParams.get('fromTeacherBoard') === '1';
    const auth = document.getElementById('teacher-auth');
    const dashboard = document.getElementById('teacher-dashboard');
    const authMessage = document.getElementById('teacher-auth-message');
    const dashboardMessage = document.getElementById('dashboard-message');
    const list = document.getElementById('classes-list');
    const courseView = document.getElementById('teacher-course-view');
    const teacherCourseCatalog = document.getElementById('teacher-course-catalog');
    const teacherTopbarLogout = document.getElementById('teacher-topbar-logout');
    const createClassButton = document.querySelector('#create-class-form button[type="submit"]');
    const createClassForm = document.getElementById('create-class-form');
    const createClassToggle = document.getElementById('create-class-toggle');
    const createClassFields = document.getElementById('create-class-fields');
    let availableCourseIds = [];
    let currentClasses = [];
    let selectedCourseId = '';
    const progressDashboardTimers = new Map();
    const kugelServerTimers = new Map();
    const preferredClassTabs = new Map();

    function setCreateClassOpen(isOpen) {
      if (!createClassForm || !createClassToggle || !createClassFields) return;
      createClassForm.classList.toggle('is-collapsed', !isOpen);
      createClassFields.hidden = !isOpen;
      createClassToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      createClassToggle.textContent = isOpen ? 'סגירה' : 'פתיחה';
    }

    async function refreshAfterMutation(successText) {
      setMessage(dashboardMessage, successText, true);
      try {
        await loadClasses();
      } catch (error) {
        setMessage(dashboardMessage, `${successText} עם זאת, רענון רשימת הכיתות נכשל: ${error.message}`, true);
      }
    }

    function renderTeacherCatalog() {
      teacherCourseCatalog.replaceChildren();
      if (!availableCourseIds.length) {
        teacherCourseCatalog.append(element('p', 'עדיין לא הוקצו לך לומדות. מנהלת המערכת יכולה לפתוח עבורך לומדות.', 'message'));
        createClassButton.disabled = true;
        return;
      }
      const courseLinks = element('div', undefined, 'course-links');
      for (const courseId of availableCourseIds) {
        const linkLabel = courseId === 'craftom-agent'
          ? 'ניהול אקדמיית ה-Agent לפי כיתה'
          : `פתיחת הלומדה שלי: ${courseLabels[courseId] || courseId}`;
        const link = element('a', linkLabel, 'button quiet');
        if (courseId === 'craftom-agent') {
          link.href = '#classes-list';
          link.addEventListener('click', () => {
            setMessage(dashboardMessage, 'בחרי כיתה עם אקדמיית ה-Agent ולחצי על "ניהול הלומדה".', true);
          });
        } else {
          link.href = teacherCourseHref(courseId);
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
        }
        courseLinks.append(link);
      }
      teacherCourseCatalog.append(courseLinks, createCoursePicker([], availableCourseIds));
      createClassButton.disabled = false;
    }

    function courseClassCount(courseId) {
      return currentClasses.filter((classroom) => (classroom.courses || []).includes(courseId)).length;
    }

    function renderCourseView() {
      courseView.replaceChildren();
      if (!availableCourseIds.length) {
        list.replaceChildren(element('p', 'עדיין לא הוקצו לך לומדות. מנהלת המערכת יכולה לפתוח עבורך לומדות.', 'card'));
        return;
      }

      if (!selectedCourseId || !availableCourseIds.includes(selectedCourseId)) {
        selectedCourseId = availableCourseIds.find((courseId) => courseClassCount(courseId) > 0) || availableCourseIds[0];
      }

      const picker = element('section', undefined, 'teacher-course-selector');
      const copy = element('div', undefined, 'teacher-course-selector-copy');
      copy.append(
        element('h3', 'בחרי לומדה'),
        element('p', 'לאחר הבחירה יוצגו רק הכיתות שלומדות את הלומדה הזאת.'),
      );
      const buttons = element('div', undefined, 'teacher-course-tabs');
      for (const courseId of availableCourseIds) {
        const count = courseClassCount(courseId);
        const button = element('button', undefined, `course-tab${courseId === selectedCourseId ? ' active' : ''}`);
        button.type = 'button';
        button.setAttribute('aria-pressed', courseId === selectedCourseId ? 'true' : 'false');
        button.append(
          element('strong', courseLabels[courseId] || courseId),
          element('span', count === 1 ? 'כיתה אחת' : `${count} כיתות`),
        );
        button.addEventListener('click', () => {
          selectedCourseId = courseId;
          renderCourseView();
        });
        buttons.append(button);
      }
      picker.append(copy, buttons);
      courseView.append(picker);

      const filteredClasses = currentClasses.filter((classroom) => (classroom.courses || []).includes(selectedCourseId));
      list.replaceChildren(...filteredClasses.map((classroom) => renderClass(classroom, selectedCourseId)));
      if (!filteredClasses.length) {
        list.replaceChildren(element('p', `עדיין אין כיתות תחת ${courseLabels[selectedCourseId] || selectedCourseId}. אפשר ליצור כיתה חדשה למטה ולשייך אותה ללומדה הזאת.`, 'card'));
      }
    }

    async function loadClasses() {
      progressDashboardTimers.forEach((timer) => clearInterval(timer));
      progressDashboardTimers.clear();
      kugelServerTimers.forEach((timer) => clearInterval(timer));
      kugelServerTimers.clear();
      const data = await api('/api/classroom/classes');
      availableCourseIds = data.teacher?.courses || [];
      currentClasses = data.classes || [];
      renderTeacherCatalog();
      renderCourseView();
    }

    function renderKugelServerControls(classroom) {
      const server = classroom.kugelServer;
      if (!server?.canControl || !(classroom.courses || []).includes('craftom-agent')) return null;
      const panel = element('section', undefined, 'kugel-server-panel');
      const enabled = Boolean(server.enabled);
      const statusText = enabled ? 'שרת פעיל לכיתה' : 'שרת כבוי לכיתה';
      const copy = element('div', undefined, 'kugel-server-copy');
      copy.append(
        element('strong', 'שרת ועולמות Minecraft'),
        element('span', `${statusText}${server.serverAddress ? ` · ${server.serverAddress}` : ''}`),
      );
      const badge = element('span', statusText, `kugel-server-badge ${enabled ? 'running' : 'idle'}`);
      const controls = element('div', undefined, 'kugel-server-actions');
      const start = element('button', 'הדלקה', 'button secondary');
      const stop = element('button', 'כיבוי', 'button quiet danger');
      const refresh = element('button', 'רענון סטטוס', 'button quiet');
      start.type = 'button';
      stop.type = 'button';
      refresh.type = 'button';
      start.disabled = enabled;
      stop.disabled = !enabled;
      const worlds = element('div', undefined, 'kugel-world-controls');
      const worldSelect = document.createElement('select');
      worldSelect.name = 'world';
      const resetWorld = element('button', 'העלה נקי', 'button secondary');
      const continueWorld = element('button', 'המשך מהעולם הנוכחי', 'button quiet');
      resetWorld.type = 'button';
      continueWorld.type = 'button';
      const saveBox = element('div', undefined, 'kugel-world-save');
      const saveName = document.createElement('input');
      saveName.type = 'text';
      saveName.placeholder = 'שם שמירה, למשל kugel-sarit-lesson1';
      const saveWorld = element('button', 'שמור את העולם הנוכחי', 'button quiet');
      saveWorld.type = 'button';
      saveBox.append(saveName, saveWorld);
      worlds.append(worldSelect, resetWorld, continueWorld, saveBox);

      function setBusy(isBusy, text = '') {
        panel.classList.toggle('is-busy', isBusy);
        [refresh, resetWorld, continueWorld, saveWorld, worldSelect, saveName].forEach((control) => {
          control.disabled = isBusy;
        });
        if (isBusy) {
          start.disabled = true;
          stop.disabled = true;
        }
        if (text) setMessage(dashboardMessage, text);
      }

      function setMonitorStatus(data) {
        const monitor = data?.monitor || {};
        const running = Boolean(monitor.running);
        const currentWorld = monitor.currentWorld || '';
        badge.textContent = `${running ? 'פועל' : 'כבוי'}${currentWorld ? ` · ${currentWorld}` : ''}`;
        badge.className = `kugel-server-badge ${running ? 'running' : 'idle'}`;
        copy.querySelector('span').textContent = `${running ? 'שרת פועל' : 'שרת כבוי'}${currentWorld ? ` · עולם: ${currentWorld}` : ''}${server.serverAddress ? ` · ${server.serverAddress}` : ''}`;
        start.disabled = running;
        stop.disabled = !running;
      }

      async function refreshStatus(silent = false) {
        try {
          const data = await api(`/api/classroom/classes/${encodeURIComponent(classroom.id)}/kugel-server/status`, {});
          setMonitorStatus(data);
          if (!silent) setMessage(dashboardMessage, 'סטטוס Minecraft עודכן.', true);
        } catch (error) {
          if (!silent) setMessage(dashboardMessage, error.message);
        }
      }

      function renderWorlds(items) {
        worldSelect.replaceChildren();
        const groups = [
          ['template', 'עולמות נקיים'],
          ['work', 'עולמות שמורים'],
        ];
        for (const [kind, label] of groups) {
          const groupItems = items.filter((world) => world.kind === kind);
          if (!groupItems.length) continue;
          const group = document.createElement('optgroup');
          group.label = label;
          for (const world of groupItems) {
            const option = document.createElement('option');
            option.value = world.name;
            option.textContent = world.display || world.name;
            group.append(option);
          }
          worldSelect.append(group);
        }
        if (!worldSelect.options.length) {
          const option = document.createElement('option');
          option.value = '';
          option.textContent = 'לא נמצאו עולמות קוגל';
          worldSelect.append(option);
        }
      }

      async function loadWorlds() {
        try {
          const data = await api(`/api/classroom/classes/${encodeURIComponent(classroom.id)}/kugel-server/worlds`, {});
          renderWorlds(data.worlds || []);
        } catch (error) {
          renderWorlds([]);
          setMessage(dashboardMessage, error.message);
        }
      }

      async function toggle(nextState) {
        if (nextState === 'stop' && !confirm('בטוחה לכבות את שרת Minecraft של הכיתה?')) return;
        setBusy(true, nextState === 'start' ? 'מדליקים את שרת Minecraft…' : 'מכבים את שרת Minecraft…');
        try {
          await api(`/api/classroom/classes/${encodeURIComponent(classroom.id)}/kugel-server/${nextState}`, {});
          await refreshStatus(true);
          setMessage(dashboardMessage, nextState === 'start' ? 'שרת Minecraft הודלק.' : 'שרת Minecraft כובה.', true);
        } catch (error) {
          setMessage(dashboardMessage, error.message);
        } finally {
          setBusy(false);
          await refreshStatus(true);
        }
      }
      async function openWorld(startMode) {
        const world = worldSelect.value;
        if (!world) {
          setMessage(dashboardMessage, 'בחרי עולם לפתיחה.');
          return;
        }
        setBusy(true, startMode === 'reset' ? 'מעלה עולם נקי…' : 'ממשיכה מהעולם הנוכחי…');
        try {
          await api(`/api/classroom/classes/${encodeURIComponent(classroom.id)}/kugel-server/open-world`, { world, startMode });
          await refreshStatus(true);
          setMessage(dashboardMessage, 'העולם עלה במוניטור.', true);
        } catch (error) {
          setMessage(dashboardMessage, error.message);
        } finally {
          setBusy(false);
          await refreshStatus(true);
        }
      }
      async function saveCurrentWorld() {
        const name = saveName.value.trim();
        if (!name) {
          setMessage(dashboardMessage, 'כתבי שם לשמירת העולם.');
          return;
        }
        setBusy(true, 'שומרים את העולם הנוכחי…');
        try {
          await api(`/api/classroom/classes/${encodeURIComponent(classroom.id)}/kugel-server/save-world`, { name, display: name });
          await loadWorlds();
          setMessage(dashboardMessage, 'העולם נשמר.', true);
        } catch (error) {
          setMessage(dashboardMessage, error.message);
        } finally {
          setBusy(false);
        }
      }
      start.addEventListener('click', () => toggle('start'));
      stop.addEventListener('click', () => toggle('stop'));
      refresh.addEventListener('click', () => refreshStatus(false));
      resetWorld.addEventListener('click', () => openWorld('reset'));
      continueWorld.addEventListener('click', () => openWorld('continue'));
      saveWorld.addEventListener('click', () => saveCurrentWorld());
      controls.append(start, stop, refresh);
      panel.append(copy, badge, controls, worlds);
      loadWorlds();
      refreshStatus(true);
      kugelServerTimers.set(classroom.id, setInterval(() => refreshStatus(true), 10000));
      return panel;
    }

    function renderCraftomLessonControls(classroom) {
      const access = classroom.lessonAccess;
      if (!access?.lessons?.length) return null;
      const panel = element('section', undefined, 'craftom-lesson-controls');
      const top = element('div', undefined, 'craftom-lesson-controls-top');
      const topCopy = element('div', undefined, 'craftom-lesson-controls-copy');
      topCopy.append(
        element('h4', 'כל השיעורים'),
        element('p', 'פותחים או נועלים גישה לתלמידים, ונכנסים לעמוד הניהול של השיעור. שיעור 0 פתוח תמיד.'),
      );
      const allLessonsPage = element('a', 'עמוד כל השיעורים', 'button primary');
      allLessonsPage.href = teacherCourseHref('craftom-agent', classroom.id);
      allLessonsPage.target = '_blank';
      allLessonsPage.rel = 'noopener noreferrer';
      top.append(topCopy, allLessonsPage);
      const list = element('div', undefined, 'craftom-lesson-control-list');

      function updateClassLessonAccess(nextAccess) {
        classroom.lessonAccess = nextAccess;
        const existing = currentClasses.find((item) => item.id === classroom.id);
        if (existing) existing.lessonAccess = nextAccess;
        preferredClassTabs.set(classroom.id, 'lesson');
        renderCourseView();
      }

      async function setLessonAccess(lesson, shouldOpen, actions) {
        const lessonId = Number(lesson.id);
        if (lessonId === 0) return;
        if (shouldOpen && !lesson.open && !lesson.nextToOpen) {
          const previousLessonId = Math.max(0, lessonId - 1);
          setMessage(
            dashboardMessage,
            `אי אפשר לפתוח את שיעור ${lessonId} עדיין. קודם צריך לפתוח את שיעור ${previousLessonId}.`,
          );
          return;
        }
        if (!shouldOpen && !confirm(`לנעול את שיעור ${lessonId} לתלמידים?`)) return;
        const path = shouldOpen ? 'open' : 'close';
        const busyText = shouldOpen ? `פותחים את שיעור ${lessonId} לתלמידים…` : `נועלים את שיעור ${lessonId}…`;
        [...actions.querySelectorAll('button')].forEach((button) => { button.disabled = true; });
        setMessage(dashboardMessage, busyText);
        try {
          const data = await api(`/api/kugel/classes/${encodeURIComponent(classroom.id)}/lessons/${encodeURIComponent(String(lessonId))}/${path}`, {});
          updateClassLessonAccess(data.lessonAccess);
          setMessage(dashboardMessage, shouldOpen ? `שיעור ${lessonId} פתוח לתלמידים.` : `שיעור ${lessonId} נעול לתלמידים.`, true);
        } catch (error) {
          [...actions.querySelectorAll('button')].forEach((button) => { button.disabled = false; });
          setMessage(dashboardMessage, error.message);
        }
      }

      for (const lesson of access.lessons) {
        const lessonId = Number(lesson.id);
        const row = element('article', undefined, `craftom-lesson-control-row${lesson.open ? ' is-open' : ''}${lesson.nextToOpen ? ' is-next' : ''}`);
        const copy = element('div', undefined, 'craftom-lesson-control-copy');
        const title = element('strong', lessonId === 0 ? `שיעור 0: ${lesson.title || 'שיעור פתיחה'}` : `שיעור ${lessonId}: ${lesson.title || 'ניהול שיעור'}`);
        const state = lessonId === 0
          ? 'פתוח תמיד לתלמידים'
          : (lesson.open ? 'פתוח לתלמידים' : (lesson.nextToOpen ? 'השיעור הבא לפתיחה' : 'נעול עד שהשיעורים הקודמים ייפתחו'));
        copy.append(title, element('span', state));

        const actions = element('div', undefined, 'craftom-lesson-control-actions');
        const page = element('a', 'עמוד השיעור', 'button secondary');
        page.href = teacherLessonHref(classroom.id, lessonId);
        page.target = '_blank';
        page.rel = 'noopener noreferrer';
        actions.append(page);

        if (lessonId > 0) {
          const blockedBySequence = !lesson.open && !lesson.nextToOpen;
          const toggle = element('button', lesson.open ? 'נעילת שיעור' : 'הפעלת שיעור', lesson.open ? 'button quiet danger' : (blockedBySequence ? 'button secondary lesson-sequence-blocked' : 'button primary'));
          toggle.type = 'button';
          if (blockedBySequence) {
            toggle.setAttribute('aria-disabled', 'true');
            toggle.title = 'פותחים שיעורים לפי סדר, כדי שהתלמידים לא יקפצו קדימה.';
          }
          toggle.addEventListener('click', () => setLessonAccess(lesson, !lesson.open, actions));
          actions.append(toggle);
        }

        row.append(copy, actions);
        list.append(row);
      }

      panel.append(top, list);
      return panel;
    }

    function renderClassTabShell(tabs, preferredTabId = '') {
      const availableTabs = tabs.filter((tab) => tab && tab.nodes?.length);
      const shell = element('section', undefined, 'class-workspace-tabs');
      const nav = element('div', undefined, 'class-tab-list');
      nav.setAttribute('role', 'tablist');
      const panels = element('div', undefined, 'class-tab-panels');
      const activate = (id) => {
        nav.querySelectorAll('[role="tab"]').forEach((button) => {
          const selected = button.dataset.tabId === id;
          button.classList.toggle('active', selected);
          button.setAttribute('aria-selected', selected ? 'true' : 'false');
        });
        panels.querySelectorAll('.class-tab-panel').forEach((panel) => {
          panel.hidden = panel.dataset.tabPanel !== id;
        });
        const tab = availableTabs.find((item) => item.id === id);
        if (tab?.onActivate) tab.onActivate();
      };
      const initialTabId = availableTabs.some((tab) => tab.id === preferredTabId) ? preferredTabId : availableTabs[0]?.id;
      availableTabs.forEach((tab, index) => {
        const selected = tab.id === initialTabId;
        const button = element('button', tab.label, `class-tab${selected ? ' active' : ''}`);
        button.type = 'button';
        button.dataset.tabId = tab.id;
        button.setAttribute('role', 'tab');
        button.setAttribute('aria-selected', selected ? 'true' : 'false');
        button.addEventListener('click', () => {
          preferredClassTabs.set(button.closest('.class-card')?.dataset.classId || '', tab.id);
          activate(tab.id);
        });
        nav.append(button);
        const panel = element('section', undefined, 'class-tab-panel');
        panel.dataset.tabPanel = tab.id;
        panel.hidden = !selected;
        panel.append(...tab.nodes);
        panels.append(panel);
      });
      shell.append(nav, panels);
      const initialTab = availableTabs.find((tab) => tab.id === initialTabId) || availableTabs[0];
      if (initialTab?.onActivate) initialTab.onActivate();
      return shell;
    }

    function renderClass(classroom, activeCourseId = '') {
      const card = element('article', undefined, 'class-card');
      card.dataset.classId = classroom.id;
      card.setAttribute('data-class-id', classroom.id);
      const top = element('div', undefined, 'class-top');
      const titleBox = element('div');
      const classCode = element('p', undefined, 'class-code-line');
      classCode.append(element('span', 'קוד הכיתה לתלמידים:'), element('strong', classroom.joinCode, 'code'));
      titleBox.append(element('h3', classroom.name), classCode);
      top.append(titleBox);

      const courseAccess = element('section', undefined, 'class-courses');
      const activeCourseLabel = courseLabels[activeCourseId] || activeCourseId || 'הלומדות של הכיתה';
      courseAccess.append(element('h4', activeCourseId ? activeCourseLabel : 'הלומדות של הכיתה'));
      const courseLinks = element('div', undefined, 'course-links');
      const visibleCourseIds = activeCourseId ? [activeCourseId] : (classroom.courses || []);
      for (const courseId of visibleCourseIds) {
        const linkText = courseId === 'craftom-agent'
          ? 'פתיחת מסך ניהול השיעורים'
          : `כניסה ללומדה: ${courseLabels[courseId] || courseId}`;
        const link = element('a', undefined, courseId === 'craftom-agent' ? 'course-action-card primary-action' : 'course-action-card');
        link.href = teacherCourseHref(courseId, classroom.id);
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        const title = element('strong', linkText);
        const description = element(
          'span',
          courseId === 'craftom-agent'
            ? 'שם בוחרים שיעור, פותחים מצגות ועובדים מול לוח הכיתה של אותו שיעור.'
            : 'פתיחת סביבת המורה של הלומדה.',
        );
        link.append(title, description);
        courseLinks.append(link);
      }
      courseAccess.append(courseLinks);
      const craftomLessonControls = activeCourseId === 'craftom-agent' ? renderCraftomLessonControls(classroom) : null;

      let progressDashboardSection = null;
      let progressDashboardContent = null;
      if (activeCourseId === 'craftom-agent' || (!activeCourseId && (classroom.courses || []).includes('craftom-agent'))) {
        progressDashboardSection = element('section', undefined, 'progress-dashboard-section');
        const dashboardTop = element('div', undefined, 'progress-dashboard-top');
        const copy = element('div');
        copy.append(
          element('strong', 'דוח התקדמות והגשות'),
          element('span', 'לראות לפי שיעור מה כל תלמיד התחיל, סיים והגיש.'),
        );
        const refreshDashboardButton = element('button', 'רענון דוח', 'button secondary');
        refreshDashboardButton.type = 'button';
        progressDashboardContent = element('div', undefined, 'progress-dashboard-content');
        progressDashboardContent.replaceChildren(element('p', 'מעקב הכיתה נטען אוטומטית.', 'progress-empty-note'));
        let progressDashboardLoaded = false;
        const refreshDashboard = async (silent = false) => {
          if (!silent) progressDashboardContent.replaceChildren(element('p', 'טוענים דוח התקדמות…', 'progress-empty-note'));
          const data = await api(`/api/classroom/classes/${encodeURIComponent(classroom.id)}/progress-dashboard`);
          const progressUiState = {
            advancedOpen: Boolean(progressDashboardContent.querySelector('.progress-advanced')?.open),
            selectedLessonIndex: Number(progressDashboardContent.querySelector('.lesson-progress-top select')?.value || 0),
          };
          renderProgressDashboard(progressDashboardContent, data.dashboard, {
            classroomId: classroom.id,
            ...progressUiState,
            setStatus: (text, success = false) => setMessage(dashboardMessage, text, success),
            onCommandDone: () => refreshDashboard(true),
          });
          if (!silent) setMessage(dashboardMessage, 'הדוח נטען ומתעדכן אוטומטית.', true);
        };
        const openProgressDashboard = async (silent = false) => {
          progressDashboardContent.replaceChildren(element('p', 'טוענים דוח התקדמות…', 'progress-empty-note'));
          try {
            await refreshDashboard(silent);
            progressDashboardLoaded = true;
            const existingTimer = progressDashboardTimers.get(classroom.id);
            if (existingTimer) clearInterval(existingTimer);
            progressDashboardTimers.set(classroom.id, setInterval(() => {
              refreshDashboard(true).catch(() => {});
            }, 4000));
          } catch (error) {
            progressDashboardContent.replaceChildren(element('p', error.message, 'message'));
          }
        };
        refreshDashboardButton.addEventListener('click', () => openProgressDashboard(false));
        dashboardTop.append(copy, refreshDashboardButton);
        progressDashboardSection.append(dashboardTop, progressDashboardContent);
        progressDashboardSection.openProgressDashboard = () => {
          if (!progressDashboardLoaded) openProgressDashboard(false);
        };
      }

      const courseForm = element('form', undefined, 'course-access-form');
      courseForm.append(createCoursePicker(classroom.courses || [], availableCourseIds));
      const saveCourses = element('button', 'שמירת הלומדות', 'button secondary');
      saveCourses.type = 'submit';
      saveCourses.setAttribute('data-action', 'save-class-courses');
      courseForm.append(saveCourses);
      courseForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        setMessage(dashboardMessage, 'שומרים את הלומדות…');
        try {
          await api(`/api/classroom/classes/${encodeURIComponent(classroom.id)}/courses`, {
            courses: selectedCourses(courseForm),
          });
          await refreshAfterMutation('הלומדות של הכיתה עודכנו.');
        } catch (error) {
          setMessage(dashboardMessage, error.message);
        }
      });
      const courseSettings = element('details', undefined, 'class-course-settings');
      courseSettings.append(element('summary', 'הגדרות לומדות לכיתה'));
      courseSettings.append(courseForm);

      const kugelServerControls = renderKugelServerControls(classroom);

      const tabs = [
        { id: 'progress', label: 'מעקב כיתה', nodes: [progressDashboardSection].filter(Boolean), onActivate: () => progressDashboardSection?.openProgressDashboard?.() },
        { id: 'lesson', label: 'ניהול שיעור', nodes: [craftomLessonControls || courseAccess] },
        { id: 'server', label: 'שרת Minecraft', nodes: [kugelServerControls].filter(Boolean) },
        { id: 'settings', label: 'הגדרות', nodes: [courseSettings] },
      ];
      card.append(top, renderClassTabShell(tabs, preferredClassTabs.get(classroom.id)));
      return card;
    }

    async function showDashboard(me) {
      auth.hidden = true;
      dashboard.hidden = false;
      if (teacherTopbarLogout) teacherTopbarLogout.hidden = false;
      document.getElementById('teacher-welcome').textContent = `שלום ${me.teacher.name}`;
      await loadClasses();
    }

    async function logoutTeacher() {
      await api('/api/classroom/logout', {});
      location.reload();
    }

    async function submitAuth(form, endpoint) {
      setMessage(authMessage, 'מתחברים…');
      try {
        const data = await api(endpoint, formData(form));
        setMessage(authMessage, '', true);
        await showDashboard(data);
      } catch (error) {
        setMessage(authMessage, error.message);
      }
    }

    document.getElementById('teacher-login-form').addEventListener('submit', (event) => {
      event.preventDefault();
      submitAuth(event.currentTarget, '/api/classroom/teacher-login');
    });
    document.getElementById('teacher-invitation-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const notice = document.getElementById('teacher-one-time-password');
      notice.textContent = ''; notice.hidden = true;
      setMessage(authMessage, 'מממשים את ההזמנה…');
      try {
        const data = await api('/api/classroom/teacher-invitations/redeem', formData(form));
        notice.textContent = `הסיסמה הזמנית שלך: ${data.temporaryPassword} — מוצגת עכשיו בלבד. העתיקו אותה ואז התחברו.`;
        notice.hidden = false;
        const loginEmail = document.querySelector('#teacher-login-form input[name="email"]');
        if (loginEmail) loginEmail.value = data.teacher.email;
        form.reset();
        setMessage(authMessage, 'החשבון נוצר. הסיסמה הזמנית נשמרה בתצוגה עד שתעתיקו אותה.', true);
      } catch (error) { setMessage(authMessage, error.message); }
    });
    async function openPreviewDemoTeacher() {
      setMessage(authMessage, 'פותחים מורה בדיקה…');
      try {
        const data = await api('/api/classroom/preview-demo-teacher-login', {});
        setMessage(authMessage, '', true);
        await showDashboard(data);
        if (shouldOpenClassList) history.replaceState(null, '', 'teacher-classrooms.html');
        return true;
      } catch (error) {
        setMessage(authMessage, error.message);
        return false;
      }
    }

    const previewDemoTeacher = document.getElementById('preview-demo-teacher');
    if (previewDemoTeacher) {
      api('/api/classroom/preview-demo-teacher-enabled')
        .then((data) => {
          if (data.enabled) previewDemoTeacher.hidden = false;
        })
        .catch(() => {});
      previewDemoTeacher.addEventListener('click', async () => {
        previewDemoTeacher.disabled = true;
        try {
          await openPreviewDemoTeacher();
        } finally {
          previewDemoTeacher.disabled = false;
        }
      });
    }
    if (createClassToggle) {
      createClassToggle.addEventListener('click', () => {
        setCreateClassOpen(createClassFields?.hidden ?? true);
      });
    }
    setCreateClassOpen(false);

    document.getElementById('create-class-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const classForm = event.currentTarget;
      setMessage(dashboardMessage, 'יוצרים כיתה…');
      try {
        const data = formData(classForm);
        data.courses = selectedCourses(classForm);
        await api('/api/classroom/classes', data);
        classForm.reset();
        setCreateClassOpen(false);
        await refreshAfterMutation('הכיתה נוצרה.');
      } catch (error) {
        setMessage(dashboardMessage, error.message);
      }
    });
    document.getElementById('teacher-logout').addEventListener('click', logoutTeacher);
    if (teacherTopbarLogout) teacherTopbarLogout.addEventListener('click', logoutTeacher);

    try {
      const me = await api('/api/classroom/me');
      if (me.role === 'teacher') {
        await showDashboard(me);
        if (shouldOpenClassList) history.replaceState(null, '', 'teacher-classrooms.html');
      } else if (shouldOpenClassList && previewDemoTeacher) {
        const demo = await api('/api/classroom/preview-demo-teacher-enabled').catch(() => ({ enabled: false }));
        if (demo.enabled) await openPreviewDemoTeacher();
      }
    } catch {}
  }

  if (page === 'entry') initEntry();
  if (page === 'teacher') initTeacher();
})();
