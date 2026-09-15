(() => {
  const pathname = location.pathname.replace(/^\/+/, '');
  const courseId = (() => {
    if (/craftom-(school|minecraft|agent)/.test(pathname)) return 'craftom-agent';
    if (/python-turtle/.test(pathname)) return 'python-turtle';
    if (/webcode/.test(pathname)) return 'webcode';
    if (/minecraft/.test(pathname)) return 'minecraft';
    if (/sensi-city|smart-city/.test(pathname)) return 'sensi-city';
    if (/^(sisi|space|music|ocean|park|garden|factory|kitchen|cinema|detective|dino|art|weather|mail|escape|finale)(-|\.|\/)/.test(pathname)) return 'sisi';
    return '';
  })();

  if (!courseId) return;

  let classroomStudent = null;
  let classroomIdentityLoaded = false;
  let classroomCourseAllowed = true;
  const pendingProgress = [];

  function showClassroomLocked() {
    document.body.innerHTML = `
      <main style="min-height:100vh;display:grid;place-items:center;padding:24px;direction:rtl;font-family:Rubik,Arial,sans-serif;background:linear-gradient(135deg,#f8fafc,#eef2ff);color:#172033">
        <section style="width:min(620px,100%);background:#fff;border:1px solid #dbe4f0;border-radius:28px;padding:30px;text-align:center;box-shadow:0 20px 60px rgba(15,23,42,.12)">
          <div style="font-size:3rem;margin-bottom:12px">🔒</div>
          <h1 style="margin:0 0 10px;font-size:clamp(1.8rem,5vw,2.8rem)">הלומדה לא פתוחה לכיתה שלך</h1>
          <p style="margin:0 0 22px;color:#64748b;line-height:1.7">המורה בוחר/ת אילו לומדות פתוחות לכיתה. אם צריך לפתוח את הלומדה הזו, פנו למורה.</p>
          <a href="/classroom-entry.html" style="display:inline-flex;align-items:center;justify-content:center;border-radius:999px;background:#4f46e5;color:#fff;text-decoration:none;font-weight:900;padding:13px 20px">חזרה ללומדות הכיתה</a>
        </section>
      </main>
    `;
  }

  function currentLessonId() {
    const params = new URLSearchParams(location.search);
    const queryLesson = params.get('lesson') || params.get('challenge') || params.get('mission');
    if (queryLesson) return String(queryLesson).slice(0, 80);
    if (courseId === 'sisi') {
      const basename = pathname.split('/').pop().replace(/\.html$/, '').replace(/-(play|lab)$/, '');
      return basename === 'sisi' ? 'course' : basename.slice(0, 80);
    }
    return 'course';
  }

  async function request(path, payload) {
    const response = await fetch(path, {
      method: payload === undefined ? 'GET' : 'POST',
      credentials: 'same-origin',
      headers: payload === undefined ? {} : { 'Content-Type': 'application/json' },
      body: payload === undefined ? undefined : JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('classroom_request_failed');
    return response.json();
  }

  async function save(detail = {}) {
    if (!classroomIdentityLoaded) {
      pendingProgress.push({ ...detail });
      return { ok: true, saved: false, queued: true };
    }
    if (!classroomStudent) return { ok: true, saved: false, role: 'guest' };
    if (!classroomCourseAllowed) return { ok: true, saved: false, role: 'student', locked: true };
    const payload = {
      courseId,
      lessonId: String(detail.lessonId || currentLessonId()).slice(0, 80),
      activityId: String(detail.activityId || 'page-open').slice(0, 80),
      status: detail.status === 'completed' ? 'completed' : 'started',
      score: Number(detail.score || 0),
      metadata: detail.metadata && typeof detail.metadata === 'object' ? detail.metadata : {},
    };
    return request('/api/classroom/progress', payload);
  }


  window.ClassroomProgress = { save, courseId, get lessonId() { return currentLessonId(); } };
  window.addEventListener('hai:classroom-progress', (event) => {
    save(event.detail || {}).catch(() => {});
  });

  request('/api/classroom/me').then((me) => {
    classroomIdentityLoaded = true;
    if (me.role !== 'student') {
      pendingProgress.length = 0;
      return;
    }
    const courses = Array.isArray(me.classroom?.courses) ? me.classroom.courses : [];
    classroomCourseAllowed = courses.includes(courseId);
    if (!classroomCourseAllowed) {
      pendingProgress.length = 0;
      showClassroomLocked();
      return;
    }
    classroomStudent = me.student;
    const queued = pendingProgress.splice(0);
    queued.forEach((detail) => save(detail).catch(() => {}));
    return save({ activityId: 'page-open', status: 'started', metadata: { path: `${pathname}${location.search}` } });
  }).catch(() => {
    classroomIdentityLoaded = true;
    pendingProgress.length = 0;
  });
})();
