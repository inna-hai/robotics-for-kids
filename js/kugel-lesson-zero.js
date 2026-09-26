(() => {
  const page = document.body.dataset.kugelPage;
  const query = new URLSearchParams(location.search);
  const classroomId = query.get('classroomId') || '';
  const drafts = new Map();

  function node(tag, text, className) {
    const element = document.createElement(tag);
    if (text !== undefined) element.textContent = text;
    if (className) element.className = className;
    return element;
  }

  async function api(path, payload) {
    const response = await fetch(path, {
      method: payload === undefined ? 'GET' : 'POST',
      credentials: 'same-origin',
      headers: payload === undefined ? {} : { 'Content-Type': 'application/json' },
      body: payload === undefined ? undefined : JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.error || 'הפעולה לא הצליחה.');
      error.status = response.status;
      throw error;
    }
    return data;
  }

  function setStatus(target, text, failed = false) {
    if (!target) return;
    target.textContent = text || '';
    target.classList.toggle('error', failed);
  }

  function formatDuration(ms) {
    const value = Number(ms);
    if (!Number.isFinite(value) || value < 0) return 'אין עדיין';
    const totalSeconds = Math.round(value / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  }

  async function initStudent() {
    const sessionStatus = document.getElementById('studentSessionStatus');
    const playerStatus = document.getElementById('playerStatus');
    const identity = document.getElementById('studentIdentity');
    const minecraftDetails = document.getElementById('minecraftDetails');
    const message = document.getElementById('studentMessage');
    const launch = document.getElementById('launchWorld');
    const reset = document.getElementById('resetOwnMission');
    const finish = document.getElementById('finishLesson');
    const continueCourse = document.getElementById('continueCourse');
    const coinProgress = document.getElementById('coinProgress');
    const progressStrip = document.getElementById('studentProgressStrip');
    const studentBestTime = document.getElementById('studentBestTime');
    const studentLastTime = document.getElementById('studentLastTime');
    const studentAttemptCount = document.getElementById('studentAttemptCount');
    const compoundEntryId = query.get('c') || query.get('compound') || '';
    const previewStudentId = query.get('previewStudent') || '';
    let current = null;

    function render(data) {
      current = data;
      const student = data.student || {};
      const session = data.session || {};
      const minecraft = data.minecraft;
      sessionStatus.textContent = session.active ? 'השיעור פעיל' : 'ממתין להפעלת המורה';
      playerStatus.textContent = student.connected ? 'מחובר/ת' : 'לא מחובר/ת';
      identity.textContent = student.minecraftPlayerName
        ? `${student.name} • שחקן Minecraft: ${student.minecraftPlayerName}`
        : `${student.name || 'תלמיד/ה'} • המורה עדיין לא שייכה לך שם שחקן ב-Minecraft.`;
      minecraftDetails.textContent = minecraft && session.active
        ? `שרת: ${minecraft.serverName} • כתובת: ${minecraft.serverAddress} • Server ID: ${minecraft.serverId}`
        : 'פרטי החיבור יוצגו לאחר שהמורה תפעיל את העולם ותשייך את שם השחקן.';
      document.getElementById('minecraftAccessCode').textContent = minecraft?.accessCode || 'יוצג לאחר הפעלת השיעור';
      coinProgress.textContent = `${student.coins || 0} מתוך 8 מטבעות`;
      if (studentBestTime) studentBestTime.textContent = student.bestTimeMs != null ? formatDuration(student.bestTimeMs) : 'אין עדיין';
      if (studentLastTime) studentLastTime.textContent = student.lastDurationMs != null ? formatDuration(student.lastDurationMs) : 'אין עדיין';
      if (studentAttemptCount) studentAttemptCount.textContent = String(student.attemptCount || 0);
      const steps = [
        ['העולם הופעל', session.active],
        ['Minecraft נפתח', Boolean(student.startedAt)],
        ['8 מטבעות', Number(student.coins) >= 8],
        ['הושלם', Boolean(student.completed)],
      ].map(([label, done]) => node('span', label, `progress-step${done ? ' done' : ''}`));
      progressStrip.replaceChildren(...steps);
      const canStart = Boolean(session.active && student.minecraftPlayerName && student.minecraftLicense?.approved && minecraft);
      launch.disabled = !canStart;
      reset.disabled = !canStart;
      finish.disabled = !canStart;
      continueCourse.hidden = !student.completionRecorded;
    }

    async function refresh() {
      try {
        render(await api('/api/kugel/session'));
      } catch (error) {
        setStatus(message, error.message, true);
        launch.disabled = true;
        reset.disabled = true;
        finish.disabled = true;
      }
    }

    async function enterFromCompoundLink() {
      if (!compoundEntryId) return false;
      setStatus(message, 'מזהים את התלמיד/ה לפי החלקה במשחק…');
      try {
        render(await api('/api/kugel/compound-entry', { compoundId: compoundEntryId }));
        setStatus(message, '');
        const cleanUrl = new URL(location.href);
        cleanUrl.searchParams.delete('c');
        cleanUrl.searchParams.delete('compound');
        history.replaceState(null, '', cleanUrl);
        return true;
      } catch (error) {
        setStatus(message, error.message, true);
        launch.disabled = true;
        reset.disabled = true;
        finish.disabled = true;
        return true;
      }
    }

    launch.addEventListener('click', async () => {
      setStatus(message, 'פותחים את Minecraft…');
      try {
        const data = await api('/api/kugel/student/start', {});
        setStatus(message, 'Minecraft נפתח. אם האפליקציה לא נפתחה, השתמשו בפרטי השרת שמופיעים למעלה.');
        if (data.minecraft?.launchUrl) location.href = data.minecraft.launchUrl;
      } catch (error) {
        setStatus(message, error.message, true);
      }
    });
    reset.addEventListener('click', async () => {
      setStatus(message, 'מאפסים את הניסיון…');
      try {
        await api('/api/kugel/student/reset', {});
        setStatus(message, 'הניסיון אופס. אפשר להתחיל מחדש.');
        await refresh();
      } catch (error) {
        setStatus(message, error.message, true);
      }
    });
    finish.addEventListener('click', async () => {
      setStatus(message, 'בודקים את אירועי המשחק…');
      try {
        await api('/api/kugel/student/finish', {});
        setStatus(message, 'שיעור 0 הושלם. אפשר להמשיך לשיעור 1.');
        await refresh();
      } catch (error) {
        setStatus(message, error.message, true);
      }
    });

    async function enterFromTeacherPreview() {
      if (!previewStudentId || !classroomId) return false;
      [launch, reset, finish].forEach(btn => { if (btn) btn.disabled = true; });
      try {
        const data = await api(`/api/kugel/classes/${encodeURIComponent(classroomId)}/students/${encodeURIComponent(previewStudentId)}/student-view`);
        render({ ...data, role: 'student' });
        setStatus(message, `תצוגת מורה — ${data.student?.name || 'תלמיד/ה'}`);
      } catch (error) {
        setStatus(message, `שגיאה בטעינת נתוני תלמיד/ה: ${error.message}`, true);
      }
      return true;
    }

    if (!await enterFromTeacherPreview() && !await enterFromCompoundLink()) await refresh();
    if (!previewStudentId) setInterval(refresh, 5000);
  }

  async function initTeacher() {
    const status = document.getElementById('teacherStatus');
    const monitor = document.getElementById('studentMonitor');
    const className = document.getElementById('teacherClassName');
    const classMessage = document.querySelector('#classMessageForm input[name="text"]');
    const launchLesson = document.getElementById('launchLesson');
    let current = null;

    function scoped(action) {
      return `/api/kugel/classes/${encodeURIComponent(classroomId)}${action}`;
    }

    function metric(id, value) {
      document.getElementById(id).textContent = String(value || 0);
    }

    function teacherIsEditingMessage() {
      const active = document.activeElement;
      if (!active || !['INPUT', 'TEXTAREA'].includes(active.tagName)) return false;
      return Boolean(
        active.closest('.student-row-actions')
        || active.closest('#classMessageForm')
      );
    }

    async function teacherAction(path, payload, pendingText, doneText, options = {}) {
      setStatus(status, pendingText);
      try {
        await api(path, payload);
        setStatus(status, doneText);
        if (options.refresh !== false) await refresh();
      } catch (error) {
        setStatus(status, error.message, true);
      }
    }

    function renderStudent(student) {
      const card = node('article', undefined, `monitor-row ${student.connected ? 'is-connected' : 'is-offline'}`);
      const coins = Math.max(0, Math.min(8, Number(student.coins || 0)));
      const identity = node('div', undefined, 'student-identity');
      identity.append(node('strong', student.name), node('span', student.connected ? 'מחובר/ת' : 'לא מחובר/ת', 'connection-pill'));
      const license = student.minecraftLicense || {};
      identity.append(node('small', license.approved
        ? `Minecraft: ${student.minecraftPlayerName || license.playerName} · ${license.eduUpn}`
        : 'חסר רישיון Minecraft Education מאושר'));

      const progress = node('div', undefined, 'coin-progress');
      const coinBar = node('div', undefined, 'coin-bar');
      const coinFill = node('span');
      coinFill.style.width = `${(coins / 8) * 100}%`;
      coinBar.append(coinFill);
      progress.append(
        node('strong', `${coins} / 8 מטבעות`),
        coinBar,
        node('span', student.completed ? 'הושלם' : (student.startedAt ? 'בתהליך' : 'לא התחיל')),
        node('span', `שיא: ${formatDuration(student.bestTimeMs)}`),
      );

      const playerForm = node('form', undefined, 'student-message-input');
      const playerInput = document.createElement('input');
      playerInput.name = 'playerName';
      playerInput.placeholder = 'שם שחקן Minecraft';
      playerInput.value = student.minecraftPlayerName || '';
      playerInput.maxLength = 32;
      const savePlayer = node('button', 'שמירת שחקן', 'secondary-action');
      savePlayer.type = 'submit';
      const eduInput = document.createElement('input');
      eduInput.name = 'eduUpn';
      eduInput.type = 'email';
      eduInput.placeholder = 'student@hai.tech';
      eduInput.value = license.eduUpn || '';
      playerForm.append(playerInput, eduInput, savePlayer);
      playerForm.addEventListener('submit', async event => {
        event.preventDefault();
        await teacherAction(scoped(`/students/${encodeURIComponent(student.id)}/minecraft`), {
          playerName: playerInput.value,
          eduUpn: eduInput.value,
        }, 'שומרים את פרטי Minecraft…', 'פרטי Minecraft נשמרו.');
      });

      const actions = node('div', undefined, 'student-row-actions');
      const messageInput = document.createElement('input');
      messageInput.placeholder = 'הודעה אישית';
      messageInput.value = drafts.get(student.id) || '';
      messageInput.addEventListener('input', () => drafts.set(student.id, messageInput.value));
      const send = node('button', 'שליחה', 'secondary-action');
      send.type = 'button';
      send.disabled = !student.minecraftPlayerName;
      send.addEventListener('click', async () => {
        await teacherAction(scoped('/message'), { scope: 'player', target: student.minecraftPlayerName, text: messageInput.value }, 'שולחים הודעה…', 'ההודעה נשלחה.', { refresh: false });
        drafts.set(student.id, messageInput.value);
        messageInput.focus();
      });
      const freeze = node('button', 'עצירה', 'secondary-action danger-action');
      freeze.type = 'button';
      freeze.disabled = !student.minecraftPlayerName;
      freeze.addEventListener('click', () => teacherAction(scoped('/freeze'), { scope: 'player', target: student.minecraftPlayerName, on: true }, 'עוצרים את התלמיד/ה…', 'התלמיד/ה נעצר/ה.'));
      const release = node('button', 'שחרור', 'secondary-action');
      release.type = 'button';
      release.disabled = !student.minecraftPlayerName;
      release.addEventListener('click', () => teacherAction(scoped('/freeze'), { scope: 'player', target: student.minecraftPlayerName, on: false }, 'משחררים את התלמיד/ה…', 'התלמיד/ה שוחרר/ה.'));
      const openLomda = node('a', 'פתח לומדה', 'secondary-action');
      openLomda.href = `kugel-student.html?previewStudent=${encodeURIComponent(student.id)}&classroomId=${encodeURIComponent(classroomId)}`;
      openLomda.target = '_blank';
      openLomda.rel = 'noopener noreferrer';
      actions.append(messageInput, send, freeze, release, openLomda);
      card.append(identity, progress, playerForm, actions);
      return card;
    }

    function render(data) {
      current = data;
      className.textContent = data.classroom.name;
      const session = data.session || {};
      document.getElementById('serverState').textContent = session.serverState === 'running' ? 'שרת פעיל' : session.serverState === 'error' ? 'שגיאת הפעלה' : 'שרת מוכן';
      const previewDetail = data.minecraftPreviewMode && session.active && session.serverDetail
        ? `${session.serverDetail} ${data.minecraftSetupNote}`
        : data.minecraftSetupNote;
      const teacherLicenseApproved = Boolean(data.teacher?.minecraftLicense?.approved);
      const missingStudentLicenses = (data.students || []).filter(student => !student.minecraftLicense?.approved).length;
      document.getElementById('serverDetail').textContent = data.minecraftConfigured === false || data.minecraftPreviewMode
        ? previewDetail
        : (!teacherLicenseApproved
          ? 'צריך אישור רישיון Minecraft למורה לפני פתיחה.'
          : (missingStudentLicenses ? `יש ${missingStudentLicenses} תלמידים בלי רישיון Minecraft מאושר.` : (session.serverDetail || '')));
      document.getElementById('serverDot').classList.toggle('busy', session.serverState === 'starting');
      document.getElementById('serverDot').classList.toggle('error', data.minecraftConfigured === false || session.serverState === 'error');
      if (launchLesson) {
        launchLesson.disabled = data.minecraftConfigured === false || session.serverState === 'starting' || !teacherLicenseApproved || missingStudentLicenses > 0;
        launchLesson.title = data.minecraftConfigured === false
          ? data.minecraftSetupNote
          : (!teacherLicenseApproved ? 'חסר אישור רישיון Minecraft למורה.' : (missingStudentLicenses ? 'יש תלמידים ללא רישיון Minecraft Education מאושר.' : ''));
      }
      metric('metricConnected', data.metrics?.connected);
      metric('metricActive', data.metrics?.active);
      metric('metricDone', data.metrics?.completed);
      metric('metricAttention', data.metrics?.needsHelp);
      monitor.replaceChildren(...(data.students || []).map(renderStudent));
      if (!data.students?.length) monitor.append(node('p', 'עדיין אין תלמידים בכיתה.'));
    }

    async function refresh() {
      if (!classroomId) {
        setStatus(status, 'חסר מזהה כיתה. יש לפתוח את הלוח מתוך כרטיס הכיתה.', true);
        return;
      }
      try {
        if (teacherIsEditingMessage()) return;
        render(await api(`/api/kugel/session?classroomId=${encodeURIComponent(classroomId)}`));
      } catch (error) {
        setStatus(status, error.message, true);
      }
    }

    launchLesson.addEventListener('click', () => teacherAction(scoped('/launch'), {}, 'מפעילים את עולם המבוך…', 'עולם המבוך פעיל.'));
    document.getElementById('stopLesson').addEventListener('click', () => teacherAction(scoped('/stop'), {}, 'מסיימים את השיעור…', 'השיעור הסתיים והשרת שוחרר.'));
    document.getElementById('classMessageForm').addEventListener('submit', async event => {
      event.preventDefault();
      await teacherAction(scoped('/message'), { scope: 'all', text: classMessage.value }, 'שולחים לכיתה…', 'ההודעה נשלחה לכיתה.', { refresh: false });
      classMessage.focus();
    });
    document.getElementById('freezeAll').addEventListener('click', () => teacherAction(scoped('/freeze'), { scope: 'all', on: true }, 'עוצרים את הכיתה…', 'הכיתה נעצרה.'));
    document.getElementById('releaseAll').addEventListener('click', () => teacherAction(scoped('/freeze'), { scope: 'all', on: false }, 'משחררים את הכיתה…', 'הכיתה שוחררה.'));
    document.getElementById('refreshBoard').addEventListener('click', refresh);

    await refresh();
    setInterval(refresh, 5000);
  }

  if (page === 'student') initStudent();
  if (page === 'teacher') initTeacher();
})();
