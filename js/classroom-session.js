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
  const pendingProgress = [];

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

  function showStudentBadge(me) {
    const badge = document.createElement('aside');
    badge.setAttribute('aria-label', 'מצב כיתה');
    badge.style.cssText = 'position:fixed;z-index:2147483000;left:12px;bottom:12px;padding:9px 13px;border-radius:999px;background:#172033;color:#fff;font:700 13px Rubik,Arial,sans-serif;box-shadow:0 8px 24px #0003';
    badge.textContent = `${me.student.name} · ${me.classroom.name}`;
    document.body.append(badge);
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
    classroomStudent = me.student;
    showStudentBadge(me);
    const queued = pendingProgress.splice(0);
    queued.forEach((detail) => save(detail).catch(() => {}));
    return save({ activityId: 'page-open', status: 'started', metadata: { path: `${pathname}${location.search}` } });
  }).catch(() => {
    classroomIdentityLoaded = true;
    pendingProgress.length = 0;
  });
})();
