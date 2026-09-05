(function () {
  const program = window.CRAFTOM_MINECRAFT_PROGRAM;
  if (!program) return;

  const LESSON_WORLDS = {
    1: {
      id: 'kugel-50-safe-compounds-v3-mazes-8-coins-finish-v2-20260903',
      name: 'Kugel 50 Safe Compounds v3 - Mazes, 8 Coins, Finish',
      mode: 'Adventure',
      mission: 'איסוף 8 מטבעות ולחיצה על כפתור סיום',
      report: 'זמן ביצוע, מטבעות שנאספו, לחיצה על סיום וסטטוס השלמה'
    },
    2: {
      id: 'kugel-50-safe-compounds-v3',
      name: 'Kugel 50 Safe Compounds v3 - 2026-08-24',
      mode: 'Creative',
      mission: 'תחילת בנייה במתחם האישי אחרי תרגול התנועה',
      report: 'כניסה לעולם, זמן פעילות, צילום והגשה'
    }
  };

  const DEFAULT_WORLD = {
    id: 'kugel-course-world-tbd',
    name: 'עולם שיעור ייעודי - להגדרה',
    mode: 'לפי שיעור',
    mission: 'משימת Minecraft לפי תוכן השיעור',
    report: 'אירועי ביצוע, צילום וכרטיס יציאה'
  };

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

  async function refreshLiveSession() {
    try {
      liveSession = await api('/api/kugel/session', { headers: {} });
      if (liveSession?.session?.lessonId) setState({ activeLessonId: Number(liveSession.session.lessonId) });
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

  function getLesson(value) {
    return window.getCraftomMinecraftLesson?.(value) || program.lessons[0];
  }

  function getWorld(lessonId) {
    return LESSON_WORLDS[Number(lessonId)] || DEFAULT_WORLD;
  }

  function lessonStatus(lessonId) {
    const state = getState();
    if (state.completedLessons?.includes(lessonId)) return 'הושלם';
    if (Number(state.activeLessonId || 1) === lessonId) return 'פעיל';
    return lessonId < Number(state.activeLessonId || 1) ? 'נפתח' : 'נעול';
  }

  async function renderStudent() {
    const list = qs('#studentLessonList');
    if (!list) return;

    await refreshLiveSession();
    let activeLessonId = Number(getState().activeLessonId || 1);

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

      qs('#studentKicker').textContent = `שיעור ${lesson.id} מתוך ${program.totalMeetings} • אתגר ${lesson.challengeId}: ${lesson.challengeTitle}`;
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
      list.innerHTML = program.lessons.map(lesson => `
        <button class="lesson-button ${lesson.id === activeLessonId ? 'active' : ''}" type="button" data-lesson-id="${lesson.id}">
          <span class="num">${lesson.id}</span>
          <span><strong>${esc(lesson.title)}</strong><small>${esc(lesson.challengeTitle)}</small></span>
          <span class="tiny-status">${esc(lessonStatus(lesson.id))}</span>
        </button>
      `).join('');
      list.querySelectorAll('[data-lesson-id]').forEach(button => {
        button.addEventListener('click', () => {
          activeLessonId = Number(button.dataset.lessonId || 1);
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

    qs('#studentExitForm').addEventListener('submit', event => {
      event.preventDefault();
      const studentName = qs('[name="studentName"]')?.value || 'AmiM';
      const state = getState();
      const completedLessons = new Set(state.completedLessons || []);
      completedLessons.add(activeLessonId);
      setState({ completedLessons: Array.from(completedLessons), activeLessonId });
      api(`/api/kugel/students/${encodeURIComponent(studentName)}/finish`, { method: 'POST', body: JSON.stringify({ lessonId: activeLessonId }) })
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
    let activeLessonId = Number(getState().teacherLessonId || 1);
    let selectedStudent = roster[0].name;

    select.innerHTML = program.lessons.map(lesson => `<option value="${lesson.id}">שיעור ${lesson.id} - ${esc(lesson.title)}</option>`).join('');
    select.value = String(activeLessonId);

    function renderOverview() {
      const lesson = getLesson(activeLessonId);
      const world = liveSession?.session?.lessonId === activeLessonId && liveSession?.world?.worldId ? liveSession.world : getWorld(activeLessonId);
      const session = liveSession?.session || {};
      qs('#teacherKicker').textContent = `${session.classroom || 'כיתה קוגל'} • שיעור ${lesson.id} מתוך ${program.totalMeetings}`;
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
      const students = liveSession?.students?.length ? liveSession.students.map(item => ({
        name: item.name,
        status: item.status,
        coins: item.coins || 0,
        duration: item.durationSeconds ? `${Math.floor(item.durationSeconds / 60)}:${String(item.durationSeconds % 60).padStart(2, '0')}` : '-',
        connected: item.connected
      })) : roster;
      qs('#studentMonitor').innerHTML = students.map(student => `
        <div class="monitor-row">
          <strong>${esc(student.name)}</strong>
          <span class="status-pill">${esc(student.status)}</span>
          <span>
            ${student.coins} / 8 מטבעות
            <span class="coin-bar"><span style="width:${Math.min(100, (student.coins / 8) * 100)}%"></span></span>
          </span>
          <span>זמן: ${esc(student.duration)}</span>
          <button class="icon-button" type="button" data-report="${esc(student.name)}" title="פתיחת דוח">›</button>
        </div>
      `).join('');
      qs('#studentMonitor').querySelectorAll('[data-report]').forEach(button => {
        button.addEventListener('click', () => {
          selectedStudent = button.dataset.report;
          renderReport();
        });
      });
    }

    function renderReport() {
      const students = liveSession?.students?.length ? liveSession.students : roster;
      const student = students.find(item => item.name === selectedStudent) || students[0] || roster[0];
      const world = liveSession?.world?.worldId ? liveSession.world : getWorld(activeLessonId);
      const duration = student.durationSeconds ? `${Math.floor(student.durationSeconds / 60)}:${String(student.durationSeconds % 60).padStart(2, '0')}` : student.duration || '-';
      qs('#teacherReport').innerHTML = `
        <article class="report-card">
          <strong>${esc(student.name)} • שיעור ${activeLessonId}</strong>
          <p>הדוח נבנה מנתוני session ומאירועים שמגיעים מ-Minecraft Monitor.</p>
          <div class="report-grid">
            <div><span>עולם</span><strong>${esc(world.worldName || world.name)}</strong></div>
            <div><span>מצב</span><strong>${esc(world.mode)}</strong></div>
            <div><span>מטבעות</span><strong>${student.coins || 0} / 8</strong></div>
            <div><span>זמן</span><strong>${esc(duration)}</strong></div>
          </div>
          <p><strong>סיכום:</strong> ${esc(student.status)}. ${esc(world.report || world.mission)}.</p>
        </article>
      `;
    }

    qs('#teacherLaunchForm').addEventListener('submit', event => {
      event.preventDefault();
      activeLessonId = Number(select.value || 1);
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

    select.addEventListener('change', () => {
      activeLessonId = Number(select.value || 1);
      renderOverview();
      renderReport();
    });

    renderOverview();
    renderMetrics();
    renderMonitor();
    renderReport();
  }

  renderStudent();
  renderTeacher();
})();
