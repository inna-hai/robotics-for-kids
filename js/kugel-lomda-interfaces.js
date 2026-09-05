(function () {
  const program = window.CRAFTOM_MINECRAFT_PROGRAM;
  if (!program) return;

  const LESSON_WORLDS = {
    0: {
      id: 'kugel-50-safe-compounds-v3-mazes-8-coins-finish-v2-20260903',
      name: 'Kugel 50 Safe Compounds v3 - Mazes, 8 Coins, Finish',
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

  function currentStudents() {
    const students = liveSession?.students?.length ? liveSession.students : roster;
    return students.filter(student => normalizeMinecraftName(student.name) !== 'server');
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
      const studentName = qs('[name="studentName"]')?.value || 'AmiM';
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

    qs('#studentExitForm').addEventListener('submit', async event => {
      event.preventDefault();
      const formEl = event.currentTarget;
      const statusEl = qs('#ticketStatus');
      const studentName = qs('[name="studentName"]')?.value || 'AmiM';
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
  }

  async function renderTeacher() {
    const select = qs('#teacherLessonSelect');
    if (!select) return;

    await refreshLiveSession();
    let activeLessonId = Number(liveSession?.session?.lessonId ?? getState().teacherLessonId ?? 0);
    let selectedStudent = roster[0].name;

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

    function renderMonitor() {
      const students = currentStudents().map(item => ({
        name: item.name,
        status: item.status,
        coins: item.coins || 0,
        duration: item.durationSeconds ? `${Math.floor(item.durationSeconds / 60)}:${String(item.durationSeconds % 60).padStart(2, '0')}` : '-',
        connected: item.connected,
        connectionStatus: item.connectionStatus || (item.connected ? 'מחובר' : 'לא מחובר')
      }));
      const focusedMessageInput = document.activeElement?.matches?.('[data-message-for]')
        ? {
            name: document.activeElement.dataset.messageFor,
            start: document.activeElement.selectionStart,
            end: document.activeElement.selectionEnd
          }
        : null;
      qs('#studentMonitor').innerHTML = students.map(student => `
        <div class="monitor-row ${student.connected ? 'is-connected' : 'is-offline'}">
          <div class="student-identity">
            <strong>${esc(student.name)}</strong>
            <span class="connection-pill">${esc(student.connectionStatus)}</span>
          </div>
          <span class="status-pill">${esc(student.status)}</span>
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
            <button class="secondary-action" type="button" data-reset-student="${esc(student.name)}">איפוס משימה</button>
            <button class="icon-button" type="button" data-report="${esc(student.name)}" title="פתיחת דוח">›</button>
          </div>
        </div>
      `).join('');
      qs('#studentMonitor').querySelectorAll('[data-report]').forEach(button => {
        button.addEventListener('click', () => {
          selectedStudent = button.dataset.report;
          renderReport();
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
      qs('#studentMonitor').querySelectorAll('[data-reset-student]').forEach(button => {
        button.addEventListener('click', () => resetStudentMission(button.dataset.resetStudent));
      });
    }

    function renderReport() {
      const students = currentStudents();
      const student = students.find(item => item.name === selectedStudent) || students[0] || roster[0];
      const world = liveSession?.world?.worldId ? liveSession.world : getWorld(activeLessonId);
      const duration = student.durationSeconds ? `${Math.floor(student.durationSeconds / 60)}:${String(student.durationSeconds % 60).padStart(2, '0')}` : student.duration || '-';
      const lastSeen = student.lastSeenAt ? new Date(student.lastSeenAt).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }) : '-';
      const exitTicket = student.exitTicket || null;
      const ticketTime = exitTicket?.createdAt ? new Date(exitTicket.createdAt).toLocaleString('he-IL', { dateStyle: 'short', timeStyle: 'short' }) : '';
      qs('#teacherReport').innerHTML = `
        <article class="report-card">
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
      await refreshLiveSession();
      renderOverview();
      renderMetrics();
      renderMonitor();
      renderReport();
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

    function resetStudentMission(name) {
      if (!name) return;
      setControlStatus(`מאפס את ${name}...`);
      api(`/api/kugel/students/${encodeURIComponent(name)}/reset`, {
        method: 'POST',
        body: JSON.stringify({ lessonId: activeLessonId })
      })
        .then(async () => {
          studentMessageDrafts.delete(name);
          selectedStudent = name;
          await refreshLiveSession();
          renderMetrics();
          renderMonitor();
          renderReport();
          setControlStatus(`המשימה אופסה עבור ${name}`);
        })
        .catch(error => setControlStatus(error.message || 'האיפוס נכשל'));
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
