(function () {
  const program = window.CRAFTOM_MINECRAFT_PROGRAM;
  if (!program) return;

  const LESSON_WORLDS = {
    1: {
      id: 'kugel-maze-onboarding',
      name: 'Kugel Maze Onboarding',
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

  function renderStudent() {
    const list = qs('#studentLessonList');
    if (!list) return;

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
      qs('#studentWorld').textContent = `${world.name} • מצב ${world.mode} • ${world.mission}`;
      qs('#studentVideo').src = lesson.video;
      qs('#studentVideo').poster = lesson.poster || challenge?.poster || program.overviewPoster;
      qs('#worldModePill').textContent = world.mode;
      qs('#minecraftInstructions').textContent = `בלחיצה אמיתית Craftom יפעיל את העולם "${world.name}" ויכניס אתכם למתחם שלכם. בדמו הזה הכפתור מסמן התחלת משימה.`;
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
      setState({ launchedLesson: activeLessonId });
      qs('#launchStatus').textContent = 'המשימה סומנה כהתחילה בדמו. בחיבור האמיתי כאן ייפתח Minecraft Education.';
      renderLesson(activeLessonId);
    });

    qs('#studentExitForm').addEventListener('submit', event => {
      event.preventDefault();
      const state = getState();
      const completedLessons = new Set(state.completedLessons || []);
      completedLessons.add(activeLessonId);
      setState({ completedLessons: Array.from(completedLessons), activeLessonId });
      renderList();
      renderLesson(activeLessonId);
    });

    renderList();
    renderLesson(activeLessonId);
  }

  function renderTeacher() {
    const select = qs('#teacherLessonSelect');
    if (!select) return;

    let activeLessonId = Number(getState().teacherLessonId || 1);
    let selectedStudent = roster[0].name;

    select.innerHTML = program.lessons.map(lesson => `<option value="${lesson.id}">שיעור ${lesson.id} - ${esc(lesson.title)}</option>`).join('');
    select.value = String(activeLessonId);

    function renderOverview() {
      const lesson = getLesson(activeLessonId);
      const world = getWorld(activeLessonId);
      qs('#teacherKicker').textContent = `כיתה קוגל • שיעור ${lesson.id} מתוך ${program.totalMeetings}`;
      qs('#teacherTitle').textContent = lesson.title;
      qs('#teacherSummary').textContent = lesson.summary;
      qs('#teacherWorldName').textContent = world.name;
      qs('#teacherWorldMeta').textContent = `worldId: ${world.id} • מצב משחק: ${world.mode} • דוח: ${world.report}`;
    }

    function renderMetrics() {
      const connected = roster.filter(item => item.connected).length;
      const done = roster.filter(item => item.status === 'סיים').length;
      const attention = roster.filter(item => item.status === 'נדרש טיפול').length;
      qs('#metricConnected').textContent = connected;
      qs('#metricActive').textContent = roster.filter(item => item.status === 'בתהליך').length;
      qs('#metricDone').textContent = done;
      qs('#metricAttention').textContent = attention;
    }

    function renderMonitor() {
      qs('#studentMonitor').innerHTML = roster.map(student => `
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
      const student = roster.find(item => item.name === selectedStudent) || roster[0];
      const world = getWorld(activeLessonId);
      qs('#teacherReport').innerHTML = `
        <article class="report-card">
          <strong>${esc(student.name)} • שיעור ${activeLessonId}</strong>
          <p>הדוח מציג מה ייאסף מאירועי Minecraft כשהחיבור האמיתי יופעל.</p>
          <div class="report-grid">
            <div><span>עולם</span><strong>${esc(world.name)}</strong></div>
            <div><span>מצב</span><strong>${esc(world.mode)}</strong></div>
            <div><span>מטבעות</span><strong>${student.coins} / 8</strong></div>
            <div><span>זמן</span><strong>${esc(student.duration)}</strong></div>
          </div>
          <p><strong>סיכום:</strong> ${esc(student.status)}. ${esc(world.report)}.</p>
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
      qs('#serverDetail').textContent = 'בדמו: מדמה כיבוי שרת, טעינת עולם והפעלה מחדש.';
      renderOverview();
      setTimeout(() => {
        dot.classList.remove('busy');
        qs('#serverState').textContent = 'שרת פעיל';
        qs('#serverDetail').textContent = `העולם הפעיל: ${getWorld(activeLessonId).name}`;
      }, 900);
    });

    qs('#simulateProgress').addEventListener('click', () => {
      roster.forEach(student => {
        if (student.status === 'בתהליך') student.coins = Math.min(8, student.coins + 1);
        if (student.coins >= 8) {
          student.status = 'סיים';
          student.connected = true;
        }
      });
      renderMetrics();
      renderMonitor();
      renderReport();
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
