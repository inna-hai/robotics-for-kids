(function () {
  const program = window.CRAFTOM_MINECRAFT_PROGRAM;
  if (!program) return;

  const LESSON_WORLDS = {
    0: {
      id: 'kugel-50-safe-compounds-v3-mazes-8-coins-npc-reset-caged-inner-v1-20260905',
      name: 'Kugel 50 Safe Compounds v3 - Mazes, 8 Coins, NPC Reset, Caged',
      mode: 'Adventure',
      mission: 'איסוף 8 מטבעות ולחיצה על כפתור סיום',
      report: 'זמן ביצוע, מטבעות שנאספו, לחיצה על סיום וסטטוס השלמה'
    },
    1: {
      id: 'kugel-50-safe-compounds-v3-20260824',
      name: 'Kugel 50 Safe Compounds v3 - 2026-08-24',
      mode: 'Creative',
      mission: 'משלוח ראשון במתחם האישי אחרי תרגול התנועה',
      report: 'כניסה לעולם, זמן פעילות, צילום והגשה'
    },
    2: {
      id: 'kugel-50-safe-compounds-v3-20260824',
      name: 'Kugel 50 Safe Compounds v3 - 2026-08-24',
      mode: 'Creative',
      mission: 'המשך בנייה במתחם האישי',
      report: 'כניסה לעולם, זמן פעילות, צילום והגשה'
    }
  };

  const DEFAULT_WORLD = {
    id: 'kugel-50-safe-compounds-v3-20260824',
    name: 'Kugel 50 Safe Compounds v3 - 2026-08-24',
    mode: 'Creative',
    mission: 'עבודה במתחם האישי והמשך בניית העיר',
    report: 'אירועי ביצוע, צילום וכרטיס יציאה'
  };

  const ONBOARDING_LESSON = {
    id: 0,
    challengeId: 0,
    meetingIndex: 0,
    meetingCode: '0',
    title: 'תרגול Minecraft: מבוך המטבעות',
    summary: 'שיעור פתיחה בתוך המשחק: מתרגלים תנועה, התמצאות, איסוף מטבעות ולחיצה על כפתור סיום לפני שמתחילים את משימות MakeCode.',
    deliverable: 'להיכנס למבוך, לאסוף 8 מטבעות, להגיע לסוף וללחוץ על כפתור הסיום.',
    detail: {
      academy: null,
      evidence: [
        'השחקן נכנס לעולם המבוך במצב Adventure.',
        'נאספו 8 מטבעות או כמה שיותר בזמן התרגול.',
        'נלחץ כפתור הסיום בקצה המבוך.',
        'המורה רואה דוח זמן, מטבעות וסטטוס סיום.'
      ],
      exit: 'מה היה הכי קל ומה היה הכי קשה לך בתנועה בתוך Minecraft?'
    },
    challengeTitle: 'תרגול פתיחה',
    concept: 'התמצאות, תנועה, איסוף ולחיצה בתוך Minecraft',
    video: program.overviewVideo,
    poster: program.overviewPoster,
    command: 'maze'
  };

  const kugelLessons = [ONBOARDING_LESSON, ...program.lessons];

  const roster = [
    { name: 'AmiM', status: 'בתהליך', coins: 5, duration: '06:42', connected: true },
    { name: 'NoaK', status: 'סיים', coins: 8, duration: '09:18', connected: true },
    { name: 'ItayB', status: 'לא התחיל', coins: 0, duration: '-', connected: false },
    { name: 'MayaL', status: 'בתהליך', coins: 3, duration: '04:11', connected: true },
    { name: 'OriS', status: 'נדרש טיפול', coins: 1, duration: '08:05', connected: true }
  ];

  const esc = value => String(value || '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const qs = selector => document.querySelector(selector);
  const storageKey = 'kugel-lomda-interface-state-v1';
  let liveSession = null;
  const studentMessageDrafts = new Map();
  const pageParams = new URLSearchParams(window.location.search);

  async function api(path, options = {}) {
    const response = await fetch(path, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.error || 'הפעולה נכשלה');
      error.data = data;
      throw error;
    }
    return data;
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        resolve(null);
        return;
      }
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve({
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl: reader.result
      }));
      reader.addEventListener('error', () => reject(new Error('לא הצלחנו לקרוא את התמונה.')));
      reader.readAsDataURL(file);
    });
  }

  async function refreshLiveSession() {
    try {
      liveSession = await api('/api/kugel/session', { headers: {} });
      const lessonId = Number(liveSession?.session?.lessonId);
      if (Number.isFinite(lessonId)) setState({ activeLessonId: lessonId });
    } catch {
      liveSession = null;
    }
    return liveSession;
  }

  function getState() {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || '{}');
    } catch {
      return {};
    }
  }

  function setState(patch) {
    const next = { ...getState(), ...patch };
    localStorage.setItem(storageKey, JSON.stringify(next));
    return next;
  }

  function normalizeMinecraftName(value) {
    return String(value || '').trim().toLowerCase();
  }

  function isSystemParticipant(name) {
    const key = normalizeMinecraftName(name);
    return !key || key === 'server' || key === 'npc' || key === 'clawtest' || key.includes('npc');
  }

  function currentStudentName() {
    return qs('[name="studentName"]')?.value?.trim() || 'AmiM';
  }

  async function applyStudentDeepLink() {
    const nameInput = qs('[name="studentName"]');
    if (!nameInput) return;
    let studentName = pageParams.get('student') || pageParams.get('player') || pageParams.get('minecraft');
    const compoundId = pageParams.get('compound') || pageParams.get('c');
    if (!studentName && compoundId) {
      try {
        const data = await api(`/api/kugel/compounds/${encodeURIComponent(compoundId)}/student`);
        studentName = data.student || '';
      } catch {
        studentName = '';
      }
    }
    if (studentName && !isSystemParticipant(studentName)) {
      nameInput.value = studentName;
      setState({ activeLessonId: 0 });
    }
  }

  function currentStudents() {
    const students = liveSession?.students?.length ? liveSession.students : roster;
    return students.filter(student => !isSystemParticipant(student.name));
  }

  function getLesson(value) {
    const id = Number(value);
    if (id === 0) return ONBOARDING_LESSON;
    return window.getCraftomMinecraftLesson?.(id) || program.lessons[0];
  }

  function getWorld(lessonId) {
    return LESSON_WORLDS[Number(lessonId)] || DEFAULT_WORLD;
  }

  function lessonStatus(lessonId) {
    const state = getState();
    if (state.completedLessons?.includes(lessonId)) return 'הושלם';
    if (Number(state.activeLessonId ?? 0) === lessonId) return 'פעיל';
    return lessonId < Number(state.activeLessonId ?? 0) ? 'נפתח' : 'נעול';
  }

  async function renderStudent() {
    const list = qs('#studentLessonList');
    if (!list) return;

    await refreshLiveSession();
    await applyStudentDeepLink();
    let activeLessonId = Number(getState().activeLessonId ?? 0);

    function renderLesson(lessonId) {
      const lesson = getLesson(lessonId);
      const challenge = window.getCraftomMinecraftChallenge?.(lesson.challengeId);
      const world = getWorld(lesson.id);
      const status = lessonStatus(lesson.id);
      const steps = [
        { label: 'צפייה', done: status === 'הושלם' || getState().watchedLesson === lesson.id },
        { label: 'תרגול', done: status === 'הושלם' || Boolean(lesson.detail.academy && getState().academyStarted === lesson.id) },
        { label: 'Minecraft', done: status === 'הושלם' || getState().launchedLesson === lesson.id },
        { label: 'הגשה', done: status === 'הושלם' }
      ];

      qs('#studentKicker').textContent = lesson.id === 0
        ? 'שיעור 0 • תרגול פתיחה לפני הלומדה'
        : `שיעור ${lesson.id} מתוך ${program.totalMeetings} • אתגר ${lesson.challengeId}: ${lesson.challengeTitle}`;
      qs('#studentTitle').textContent = lesson.title;
      qs('#studentSummary').textContent = lesson.summary;
      qs('#studentDeliverable').textContent = lesson.deliverable;
      const liveWorld = liveSession?.world?.worldId ? liveSession.world : null;
      const minecraft = liveSession?.minecraft || {};
      qs('#studentWorld').textContent = `${(liveWorld && liveWorld.worldName) || world.name} • מצב ${(liveWorld && liveWorld.mode) || world.mode} • ${(liveWorld && liveWorld.mission) || world.mission}`;
      qs('#studentVideo').src = lesson.video;
      qs('#studentVideo').poster = lesson.poster || challenge?.poster || program.overviewPoster;
      qs('#worldModePill').textContent = world.mode;
      qs('#minecraftInstructions').textContent = liveSession?.session?.active
        ? `השיעור פעיל. היכנסו לשרת ${minecraft.serverName || 'Kugel-Holon'} בכתובת ${minecraft.serverAddress || ''}. Server ID: ${minecraft.serverId || ''}.`
        : `המורה עוד לא הפעילה שיעור. אחרי הפעלה יופיעו כאן פרטי הכניסה לעולם.`;
      qs('#studentSteps').innerHTML = [
        'צפו בהסבר של השיעור.',
        lesson.detail.academy ? 'פתחו את אקדמיית ה-Agent ותרגלו עד שהבדיקה עוברת.' : 'תכננו את הקוד ב-Code Builder של השיעור.',
        'פתחו את עולם Minecraft של השיעור ובצעו את המשימה.',
        'צלמו ראיה מהעולם וענו על כרטיס היציאה.'
      ].map(item => `<li>${esc(item)}</li>`).join('');
      qs('#studentEvidence').innerHTML = lesson.detail.evidence.map(item => `<li>${esc(item)}</li>`).join('');
      qs('#studentExitQuestion').textContent = lesson.detail.exit;
      qs('#studentProgressStrip').innerHTML = steps.map(step => `<span class="progress-step ${step.done ? 'done' : ''}">${esc(step.label)}</span>`).join('');

      const academyPanel = qs('#studentAcademyPanel');
      if (lesson.detail.academy) {
        academyPanel.hidden = false;
        qs('#studentAcademyLink').href = `craftom-agent-academy.html?lesson=${lesson.id}`;
        qs('#studentAcademyLink').onclick = () => {
          setState({ academyStarted: lesson.id });
        };
      } else {
        academyPanel.hidden = true;
      }

      qs('#ticketStatus').textContent = status === 'הושלם' ? 'הוגש' : 'ממתין להגשה';
      qs('#launchStatus').textContent = getState().launchedLesson === lesson.id ? 'המשימה סומנה כהתחילה בדמו.' : '';
      const resetButton = qs('#resetOwnMission');
      if (resetButton) resetButton.hidden = lesson.id !== 0;
    }

    function renderList() {
      list.innerHTML = kugelLessons.map(lesson => `
        <button class="lesson-button ${lesson.id === activeLessonId ? 'active' : ''}" type="button" data-lesson-id="${lesson.id}">
          <span class="num">${lesson.id}</span>
          <span><strong>${esc(lesson.title)}</strong><small>${esc(lesson.challengeTitle)}</small></span>
          <span class="tiny-status">${esc(lessonStatus(lesson.id))}</span>
        </button>
      `).join('');
      list.querySelectorAll('[data-lesson-id]').forEach(button => {
        button.addEventListener('click', () => {
          activeLessonId = Number(button.dataset.lessonId ?? 0);
          setState({ activeLessonId });
          renderList();
          renderLesson(activeLessonId);
        });
      });
    }

    qs('#markWatched').addEventListener('click', () => {
      setState({ watchedLesson: activeLessonId });
      renderLesson(activeLessonId);
    });

    qs('#launchWorld').addEventListener('click', () => {
      const studentName = currentStudentName();
      api(`/api/kugel/students/${encodeURIComponent(studentName)}/start`, { method: 'POST', body: JSON.stringify({ lessonId: activeLessonId }) })
        .then(data => {
          setState({ launchedLesson: activeLessonId });
          qs('#launchStatus').textContent = `המשימה התחילה. אם Minecraft לא נפתח אוטומטית, הוסיפו שרת: ${data.minecraft?.serverAddress || ''}`;
          if (data.minecraft?.launchUrl) window.location.href = data.minecraft.launchUrl;
          return refreshLiveSession();
        })
        .then(() => renderLesson(activeLessonId))
        .catch(error => {
          qs('#launchStatus').textContent = error.message || 'לא הצלחנו לפתוח את המשימה.';
        });
    });

    qs('#resetOwnMission')?.addEventListener('click', async () => {
      const studentName = currentStudentName();
      qs('#launchStatus').textContent = 'מאפס את התרגול שלך...';
      try {
        await api(`/api/kugel/students/${encodeURIComponent(studentName)}/reset`, {
          method: 'POST',
          body: JSON.stringify({ lessonId: activeLessonId })
        });
        const state = getState();
        const completedLessons = (state.completedLessons || []).filter(id => Number(id) !== activeLessonId);
        setState({ completedLessons, launchedLesson: null, activeLessonId });
        qs('#studentExitForm')?.reset();
        const nameInput = qs('[name="studentName"]');
        if (nameInput) nameInput.value = studentName;
        qs('#ticketStatus').textContent = 'ממתין להגשה';
        qs('#launchStatus').textContent = 'התרגול אופס. אפשר להתחיל מחדש.';
        await refreshLiveSession();
        renderList();
        renderLesson(activeLessonId);
      } catch (error) {
        qs('#launchStatus').textContent = error.message || 'האיפוס נכשל';
      }
    });

    qs('#studentExitForm').addEventListener('submit', async event => {
      event.preventDefault();
      const formEl = event.currentTarget;
      const statusEl = qs('#ticketStatus');
      const studentName = currentStudentName();
      const lesson = getLesson(activeLessonId);
      const answer = new FormData(formEl).get('answer');
      const photoFile = formEl.querySelector('[name="photo"]')?.files?.[0] || null;
      statusEl.textContent = 'שולח למורה...';
      try {
        const photo = await fileToDataUrl(photoFile);
        await api('/api/craftom/exit-ticket', {
          method: 'POST',
          body: JSON.stringify({
            lessonId: activeLessonId,
            challengeId: lesson.challengeId ?? 0,
            lessonTitle: lesson.title,
            challengeTitle: lesson.challengeTitle || '',
            studentName,
            answer,
            photo
          })
        });
        statusEl.textContent = 'נשלח למורה';
      } catch (error) {
        statusEl.textContent = error.message || 'ההגשה נכשלה';
        return;
      }
      const state = getState();
      const completedLessons = new Set(state.completedLessons || []);
      completedLessons.add(activeLessonId);
      setState({ completedLessons: Array.from(completedLessons), activeLessonId });
      await api(`/api/kugel/students/${encodeURIComponent(studentName)}/finish`, { method: 'POST', body: JSON.stringify({ lessonId: activeLessonId }) })
        .catch(() => null)
        .finally(async () => {
          await refreshLiveSession();
          renderList();
          renderLesson(activeLessonId);
        });
    });

    renderList();
    renderLesson(activeLessonId);
    if (pageParams.get('compound') || pageParams.get('c') || pageParams.get('student') || pageParams.get('player') || pageParams.get('minecraft')) {
      qs('#studentExitForm')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  async function renderTeacher() {
    const select = qs('#teacherLessonSelect');
    if (!select) return;

    await refreshLiveSession();
    let activeLessonId = Number(liveSession?.session?.lessonId ?? getState().teacherLessonId ?? 0);
    let selectedStudent = null;

    select.innerHTML = kugelLessons.map(lesson => `<option value="${lesson.id}">שיעור ${lesson.id} - ${esc(lesson.title)}</option>`).join('');
    select.value = String(activeLessonId);

    function renderOverview() {
      const lesson = getLesson(activeLessonId);
      const world = liveSession?.session?.lessonId === activeLessonId && liveSession?.world?.worldId ? liveSession.world : getWorld(activeLessonId);
      const session = liveSession?.session || {};
      qs('#teacherKicker').textContent = lesson.id === 0
        ? `${session.classroom || 'כיתה קוגל'} • שיעור 0 • תרגול פתיחה`
        : `${session.classroom || 'כיתה קוגל'} • שיעור ${lesson.id} מתוך ${program.totalMeetings}`;
      qs('#teacherTitle').textContent = lesson.title;
      qs('#teacherSummary').textContent = lesson.summary;
      qs('#teacherWorldName').textContent = world.worldName || world.name;
      qs('#teacherWorldMeta').textContent = `worldId: ${world.worldId || world.id} • מצב משחק: ${world.mode} • משימה: ${world.mission || ''}`;
      qs('#serverState').textContent = session.serverState === 'running' ? 'שרת פעיל' : session.serverState === 'error' ? 'שגיאת הפעלה' : session.serverState === 'starting' ? 'מפעיל עולם...' : 'שרת מוכן';
      qs('#serverDetail').textContent = session.serverDetail || 'לא הופעל שיעור בדמו הנוכחי';
      qs('#serverDot').classList.toggle('busy', session.serverState === 'starting');
    }

    function renderMetrics() {
      const metrics = liveSession?.metrics || {};
      qs('#metricConnected').textContent = metrics.connected ?? roster.filter(item => item.connected).length;
      qs('#metricActive').textContent = metrics.active ?? roster.filter(item => item.status === 'בתהליך').length;
      qs('#metricDone').textContent = metrics.done ?? roster.filter(item => item.status === 'סיים').length;
      qs('#metricAttention').textContent = metrics.attention ?? roster.filter(item => item.status === 'נדרש טיפול').length;
    }

    function restoreScrollAfterRender(before) {
      requestAnimationFrame(() => {
        const active = document.activeElement;
        const teacherFocused = active?.closest?.('.teacher-board');
        if (teacherFocused && before.activeName && active.name === before.activeName) return;
        if (Math.abs(window.scrollY - before.scrollY) > 24) {
          window.scrollTo({ top: before.scrollY, left: before.scrollX, behavior: 'auto' });
        }
      });
    }

    async function refreshWithStableViewport(renderFn) {
      const active = document.activeElement;
      const before = {
        scrollX: window.scrollX,
        scrollY: window.scrollY,
        activeName: active?.name || '',
        selectionStart: active?.selectionStart,
        selectionEnd: active?.selectionEnd
      };
      await refreshLiveSession();
      renderFn();
      const nextActive = before.activeName ? document.querySelector(`[name="${CSS.escape(before.activeName)}"]`) : null;
      if (nextActive && active?.closest?.('.teacher-board')) {
        nextActive.focus();
        try {
          nextActive.setSelectionRange(before.selectionStart, before.selectionEnd);
        } catch {}
      }
      restoreScrollAfterRender(before);
    }

    function latestStudentActivityMs(student) {
      return Math.max(
        Date.parse(student.exitTicket?.createdAt || '') || 0,
        Date.parse(student.finishedAt || '') || 0,
        Date.parse(student.lastSeenAt || '') || 0,
        Date.parse(student.startedAt || '') || 0
      );
    }

    function ensureSelectedStudent(students) {
      if (students.some(item => item.name === selectedStudent)) return;
      const latest = [...students]
        .filter(item => item.completed || item.exitTicket || item.eventCount > 0)
        .sort((a, b) => latestStudentActivityMs(b) - latestStudentActivityMs(a))[0];
      selectedStudent = (latest || students[0] || roster[0]).name;
    }

    function renderMonitor() {
      const students = currentStudents().map((item, index) => ({
        name: item.name,
        status: item.status,
        coins: item.coins || 0,
        duration: item.durationSeconds ? `${Math.floor(item.durationSeconds / 60)}:${String(item.durationSeconds % 60).padStart(2, '0')}` : '-',
        connected: item.connected,
        connectionStatus: item.connectionStatus || (item.connected ? 'מחובר' : 'לא מחובר'),
        completed: Boolean(item.completed),
        exitTicket: item.exitTicket || null,
        finishedAt: item.finishedAt,
        lastSeenAt: item.lastSeenAt,
        startedAt: item.startedAt,
        eventCount: item.eventCount || 0,
        rosterIndex: index
      })).sort((a, b) => {
        const aActive = a.completed || a.eventCount > 0 || a.exitTicket ? 1 : 0;
        const bActive = b.completed || b.eventCount > 0 || b.exitTicket ? 1 : 0;
        if (aActive !== bActive) return bActive - aActive;
        return latestStudentActivityMs(b) - latestStudentActivityMs(a) || a.rosterIndex - b.rosterIndex;
      });
      ensureSelectedStudent(students);
      const focusedMessageInput = document.activeElement?.matches?.('[data-message-for]')
        ? {
            name: document.activeElement.dataset.messageFor,
            start: document.activeElement.selectionStart,
            end: document.activeElement.selectionEnd
          }
        : null;
      qs('#studentMonitor').innerHTML = students.map(student => `
        <div class="monitor-row ${student.connected ? 'is-connected' : 'is-offline'} ${student.name === selectedStudent ? 'is-selected' : ''}">
          <div class="student-identity">
            <strong>${esc(student.name)}</strong>
            <span class="connection-pill">${esc(student.connectionStatus)}</span>
          </div>
          <div class="student-status-stack">
            <span class="status-pill">${esc(student.status)}</span>
            <span class="report-ready-pill">${student.completed || student.exitTicket ? 'דוח זמין' : 'ממתין לדוח'}</span>
          </div>
          <div class="coin-progress">
            <strong>${student.coins} / 8 מטבעות</strong>
            <span class="coin-bar"><span style="width:${Math.min(100, (student.coins / 8) * 100)}%"></span></span>
          </div>
          <span class="duration-pill">זמן: ${esc(student.duration)}</span>
          <div class="student-row-actions">
            <textarea class="student-message-input" data-message-for="${esc(student.name)}" rows="2" placeholder="הודעה לתלמיד">${esc(studentMessageDrafts.get(student.name) || '')}</textarea>
            <button class="secondary-action" type="button" data-message="${esc(student.name)}">שליחה</button>
            <button class="secondary-action danger-action" type="button" data-freeze="${esc(student.name)}">עצירה</button>
            <button class="secondary-action" type="button" data-release="${esc(student.name)}">שחרור</button>
            <button class="secondary-action report-action" type="button" data-report="${esc(student.name)}">דוח</button>
          </div>
        </div>
      `).join('');
      qs('#studentMonitor').querySelectorAll('[data-reset-student]').forEach(button => button.remove());
      qs('#studentMonitor').querySelectorAll('[data-report]').forEach(button => {
        button.addEventListener('click', () => {
          selectedStudent = button.dataset.report;
          renderReport();
          scrollToStudentReport(selectedStudent);
        });
      });
      qs('#studentMonitor').querySelectorAll('[data-message-for]').forEach(input => {
        input.addEventListener('input', () => {
          studentMessageDrafts.set(input.dataset.messageFor, input.value);
        });
      });
      if (focusedMessageInput) {
        const input = [...qs('#studentMonitor').querySelectorAll('[data-message-for]')]
          .find(item => item.dataset.messageFor === focusedMessageInput.name);
        input?.focus?.();
        try {
          input?.setSelectionRange?.(focusedMessageInput.start, focusedMessageInput.end);
        } catch {}
      }
      qs('#studentMonitor').querySelectorAll('[data-message]').forEach(button => {
        button.addEventListener('click', () => {
          const name = button.dataset.message;
          const input = [...qs('#studentMonitor').querySelectorAll('[data-message-for]')]
            .find(item => item.dataset.messageFor === name);
          sendTeacherMessage('player', name, input?.value || '', input);
        });
      });
      qs('#studentMonitor').querySelectorAll('[data-freeze]').forEach(button => {
        button.addEventListener('click', () => freeze('player', true, button.dataset.freeze));
      });
      qs('#studentMonitor').querySelectorAll('[data-release]').forEach(button => {
        button.addEventListener('click', () => freeze('player', false, button.dataset.release));
      });
    }

    function renderReport() {
      const students = currentStudents();
      ensureSelectedStudent(students);
      const world = liveSession?.world?.worldId ? liveSession.world : getWorld(activeLessonId);
      const sorted = [...students].sort((a, b) => {
        const aSelected = a.name === selectedStudent ? 1 : 0;
        const bSelected = b.name === selectedStudent ? 1 : 0;
        if (aSelected !== bSelected) return bSelected - aSelected;
        const aReady = a.completed || a.exitTicket ? 1 : 0;
        const bReady = b.completed || b.exitTicket ? 1 : 0;
        if (aReady !== bReady) return bReady - aReady;
        return latestStudentActivityMs(b) - latestStudentActivityMs(a);
      });
      qs('#teacherReport').innerHTML = `
        <div class="report-list">
          ${sorted.map(student => {
            const duration = student.durationSeconds ? `${Math.floor(student.durationSeconds / 60)}:${String(student.durationSeconds % 60).padStart(2, '0')}` : student.duration || '-';
            const lastSeen = student.lastSeenAt ? new Date(student.lastSeenAt).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }) : '-';
            const exitTicket = student.exitTicket || null;
            const ticketTime = exitTicket?.createdAt ? new Date(exitTicket.createdAt).toLocaleString('he-IL', { dateStyle: 'short', timeStyle: 'short' }) : '';
            return `
              <article class="report-card ${student.name === selectedStudent ? 'is-selected' : ''}" data-report-card="${esc(student.name)}" tabindex="-1">
                <strong>${esc(student.name)} • שיעור ${activeLessonId}</strong>
                <p>הדוח נבנה מנתוני session ומאירועים שמגיעים מ-Minecraft Monitor.</p>
                <div class="report-grid">
                  <div><span>עולם</span><strong>${esc(world.worldName || world.name)}</strong></div>
                  <div><span>חיבור</span><strong>${esc(student.connectionStatus || (student.connected ? 'מחובר' : 'לא מחובר'))}</strong></div>
                  <div><span>מטבעות</span><strong>${student.coins || 0} / 8</strong></div>
                  <div><span>זמן</span><strong>${esc(duration)}</strong></div>
                  <div><span>נראה לאחרונה</span><strong>${esc(lastSeen)}</strong></div>
                </div>
                <p><strong>סיכום:</strong> ${esc(student.status)}. ${esc(world.report || world.mission)}.</p>
                <section class="teacher-exit-ticket">
                  <h4>כרטיס יציאה מהשיעור</h4>
                  ${exitTicket ? `
                    <p class="ticket-meta">הוגש על ידי ${esc(exitTicket.studentName || student.name)}${ticketTime ? ` • ${esc(ticketTime)}` : ''}</p>
                    <p class="ticket-answer">${esc(exitTicket.answer || '')}</p>
                    ${exitTicket.photo?.url ? `<a class="ticket-photo-link" href="${esc(exitTicket.photo.url)}" target="_blank" rel="noopener"><img src="${esc(exitTicket.photo.url)}" alt="צילום שהועלה בכרטיס היציאה"></a>` : '<p class="ticket-empty">לא צורפה תמונה.</p>'}
                  ` : '<p class="ticket-empty">עדיין לא הוגש כרטיס יציאה מהשיעור.</p>'}
                </section>
              </article>
            `;
          }).join('')}
        </div>
      `;
    }

    function scrollToStudentReport(studentName) {
      requestAnimationFrame(() => {
        const selector = `[data-report-card="${CSS.escape(studentName)}"]`;
        const card = qs(selector);
        if (!card) return;
        card.scrollIntoView({ behavior: 'smooth', block: 'start' });
        card.focus({ preventScroll: true });
      });
    }

    qs('#teacherLaunchForm').addEventListener('submit', event => {
      event.preventDefault();
      activeLessonId = Number(select.value ?? 0);
      setState({ teacherLessonId: activeLessonId, activeLessonId });
      const dot = qs('#serverDot');
      dot.classList.add('busy');
      qs('#serverState').textContent = 'מחליף עולם...';
      qs('#serverDetail').textContent = 'שולח בקשה ל-Minecraft Monitor להחלפת עולם והפעלת שרת.';
      renderOverview();
      api(`/api/kugel/lessons/${activeLessonId}/launch`, {
        method: 'POST',
        body: JSON.stringify({ classroom: new FormData(event.currentTarget).get('classroom'), start_mode: 'reset' })
      })
        .then(data => {
          liveSession = data;
          dot.classList.remove('busy');
          qs('#serverState').textContent = 'שרת פעיל';
          qs('#serverDetail').textContent = `העולם הפעיל: ${data.world?.worldName || getWorld(activeLessonId).name}`;
        })
        .catch(error => {
          dot.classList.remove('busy');
          qs('#serverState').textContent = 'שגיאת הפעלה';
          qs('#serverDetail').textContent = error.message || 'לא הצלחנו להפעיל את העולם.';
        })
        .finally(async () => {
          await refreshLiveSession();
          renderOverview();
          renderMetrics();
          renderMonitor();
          renderReport();
        });
    });

    qs('#simulateProgress').addEventListener('click', () => {
      refreshLiveSession().then(() => {
        renderMetrics();
        renderMonitor();
        renderReport();
      });
    });

    function setControlStatus(message) {
      const el = qs('#teacherControlStatus');
      if (el) el.textContent = message;
    }

    async function refreshTeacherBoard() {
      await refreshWithStableViewport(() => {
        renderOverview();
        renderMetrics();
        renderMonitor();
        renderReport();
      });
    }

    function sendTeacherMessage(scope, target, text, inputEl) {
      const clean = String(text || '').trim();
      if (!clean) {
        setControlStatus('נא להזין הודעה');
        inputEl?.focus?.();
        return;
      }
      setControlStatus('שולח...');
      api('/api/kugel/live/message', {
        method: 'POST',
        body: JSON.stringify({
          scope,
          target,
          text: clean
        })
      }).then(() => {
        if (inputEl) {
          inputEl.value = '';
          if (inputEl.dataset.messageFor) studentMessageDrafts.delete(inputEl.dataset.messageFor);
        }
        setControlStatus('הודעה נשלחה');
      }).catch(error => setControlStatus(error.message || 'שליחה נכשלה'));
    }

    qs('#teacherClassMessageForm')?.addEventListener('submit', event => {
      event.preventDefault();
      const formEl = event.currentTarget;
      const form = new FormData(formEl);
      sendTeacherMessage('all', '', form.get('text'), formEl.querySelector('[name="text"]'));
    });

    function freeze(scope, on, target = '') {
      setControlStatus(on ? 'עוצר...' : 'משחרר...');
      api('/api/kugel/live/freeze', {
        method: 'POST',
        body: JSON.stringify({
          scope,
          target: scope === 'player' ? target : '',
          on,
          mode: 'full',
          restore: activeLessonId === 0 ? 'adventure' : 'creative'
        })
      }).then(() => setControlStatus(on ? 'נעצר' : 'שוחרר'))
        .catch(error => setControlStatus(error.message || 'הפעולה נכשלה'));
    }

    qs('#freezeAll')?.addEventListener('click', () => freeze('all', true));
    qs('#releaseAll')?.addEventListener('click', () => freeze('all', false));

    select.addEventListener('change', () => {
      activeLessonId = Number(select.value ?? 0);
      renderOverview();
      renderReport();
    });

    renderOverview();
    renderMetrics();
    renderMonitor();
    renderReport();
    setInterval(refreshTeacherBoard, 5000);
  }

  renderStudent();
  renderTeacher();
})();
