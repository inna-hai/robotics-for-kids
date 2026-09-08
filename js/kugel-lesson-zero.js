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
    const compoundEntryId = query.get('c') || query.get('compound') || '';
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
      const steps = [
        ['העולם הופעל', session.active],
        ['Minecraft נפתח', Boolean(student.startedAt)],
        ['8 מטבעות', Number(student.coins) >= 8],
        ['הושלם', Boolean(student.completed)],
      ].map(([label, done]) => node('span', label, `progress-step${done ? ' done' : ''}`));
      progressStrip.replaceChildren(...steps);
      const canStart = Boolean(session.active && student.minecraftPlayerName && minecraft);
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

    if (!await enterFromCompoundLink()) await refresh();
    setInterval(refresh, 5000);
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

    async function teacherAction(path, payload, pendingText, doneText) {
      setStatus(status, pendingText);
      try {
        await api(path, payload);
        setStatus(status, doneText);
        await refresh();
      } catch (error) {
        setStatus(status, error.message, true);
      }
    }

    function renderStudent(student) {
      const card = node('article', undefined, `monitor-row ${student.connected ? 'is-connected' : 'is-offline'}`);
      const identity = node('div', undefined, 'student-identity');
      identity.append(node('strong', student.name), node('span', student.connected ? 'מחובר/ת' : 'לא מחובר/ת', 'connection-pill'));

      const progress = node('div', undefined, 'coin-progress');
      progress.append(node('strong', `${student.coins || 0} / 8 מטבעות`), node('span', student.completed ? 'הושלם' : (student.startedAt ? 'בתהליך' : 'לא התחיל')));

      const playerForm = node('form', undefined, 'student-message-input');
      const playerInput = document.createElement('input');
      playerInput.name = 'playerName';
      playerInput.placeholder = 'שם שחקן Minecraft';
      playerInput.value = student.minecraftPlayerName || '';
      playerInput.maxLength = 32;
      const savePlayer = node('button', 'שמירת שחקן', 'secondary-action');
      savePlayer.type = 'submit';
      playerForm.append(playerInput, savePlayer);
      playerForm.addEventListener('submit', async event => {
        event.preventDefault();
        await teacherAction(scoped(`/students/${encodeURIComponent(student.id)}/minecraft`), { playerName: playerInput.value }, 'שומרים את שם השחקן…', 'שם השחקן נשמר.');
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
        await teacherAction(scoped('/message'), { scope: 'player', target: student.minecraftPlayerName, text: messageInput.value }, 'שולחים הודעה…', 'ההודעה נשלחה.');
        drafts.delete(student.id);
      });
      const freeze = node('button', 'עצירה', 'secondary-action danger-action');
      freeze.type = 'button';
      freeze.disabled = !student.minecraftPlayerName;
      freeze.addEventListener('click', () => teacherAction(scoped('/freeze'), { scope: 'player', target: student.minecraftPlayerName, on: true }, 'עוצרים את התלמיד/ה…', 'התלמיד/ה נעצר/ה.'));
      const release = node('button', 'שחרור', 'secondary-action');
      release.type = 'button';
      release.disabled = !student.minecraftPlayerName;
      release.addEventListener('click', () => teacherAction(scoped('/freeze'), { scope: 'player', target: student.minecraftPlayerName, on: false }, 'משחררים את התלמיד/ה…', 'התלמיד/ה שוחרר/ה.'));
      actions.append(messageInput, send, freeze, release);
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
      document.getElementById('serverDetail').textContent = data.minecraftConfigured === false || data.minecraftPreviewMode
        ? previewDetail
        : (session.serverDetail || '');
      document.getElementById('serverDot').classList.toggle('busy', session.serverState === 'starting');
      document.getElementById('serverDot').classList.toggle('error', data.minecraftConfigured === false || session.serverState === 'error');
      if (launchLesson) {
        launchLesson.disabled = data.minecraftConfigured === false || session.serverState === 'starting';
        launchLesson.title = data.minecraftConfigured === false ? data.minecraftSetupNote : '';
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
        render(await api(`/api/kugel/session?classroomId=${encodeURIComponent(classroomId)}`));
      } catch (error) {
        setStatus(status, error.message, true);
      }
    }

    launchLesson.addEventListener('click', () => teacherAction(scoped('/launch'), {}, 'מפעילים את עולם המבוך…', 'עולם המבוך פעיל.'));
    document.getElementById('stopLesson').addEventListener('click', () => teacherAction(scoped('/stop'), {}, 'מסיימים את השיעור…', 'השיעור הסתיים והשרת שוחרר.'));
    document.getElementById('classMessageForm').addEventListener('submit', async event => {
      event.preventDefault();
      await teacherAction(scoped('/message'), { scope: 'all', text: classMessage.value }, 'שולחים לכיתה…', 'ההודעה נשלחה לכיתה.');
      classMessage.value = '';
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
