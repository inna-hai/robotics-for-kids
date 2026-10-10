(() => {
  const pathname = location.pathname.replace(/^\/+/, '');
  const courseId = (() => {
    if (/craftom-(school|minecraft|agent)/.test(pathname)) return 'craftom-agent';
    if (/python-turtle/.test(pathname)) return 'python-turtle';
    if (/webcode/.test(pathname)) return 'webcode';
    if (/minecraft/.test(pathname)) return 'minecraft';
    if (/sensi-city|smart-city/.test(pathname)) return 'sensi-city';
    if (/future-architects/.test(pathname)) return 'future-architects';
    if (/^(sisi|space|music|ocean|park|garden|factory|kitchen|cinema|detective|dino|art|weather|mail|escape|finale)(-|\.|\/)/.test(pathname)) return 'sisi';
    return '';
  })();

  if (!courseId) return;

  let classroomStudent = null;
  let classroomIdentityLoaded = false;
  const pendingProgress = [];
  const logoutButtonId = 'classroom-student-floating-logout';

  function currentLessonId() {
    const params = new URLSearchParams(location.search);
    const queryLesson = params.get('lesson') || params.get('challenge') || params.get('mission');
    if (queryLesson) return String(queryLesson).slice(0, 80);
    if (courseId === 'sisi') {
      const basename = pathname.split('/').pop().replace(/\.html$/, '').replace(/-(play|lab)$/, '');
      return basename === 'sisi' ? 'course' : basename.slice(0, 80);
    }
    if (courseId === 'future-architects') {
      const basename = pathname.split('/').pop().replace(/\.html$/, '');
      const lessonMatch = basename.match(/^future-architects-lesson(?:-(\d+))?$/);
      if (lessonMatch) return lessonMatch[1] || '1';
      return 'course';
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

  async function list({ courseId: requestedCourseId, lessonId } = {}) {
    const params = new URLSearchParams();
    params.set('courseId', requestedCourseId || courseId);
    if (lessonId) params.set('lessonId', String(lessonId).slice(0, 80));
    return request(`/api/classroom/progress?${params}`);
  }

  function ensureStudentLogoutButton() {
    if (document.getElementById?.(logoutButtonId)) return;
    const button = document.createElement('button');
    if (typeof button.addEventListener !== 'function') return;
    button.id = logoutButtonId;
    button.type = 'button';
    button.textContent = 'התנתקות';
    button.setAttribute('aria-label', 'התנתקות מהכיתה');
    button.className = 'classroom-student-floating-logout';
    button.addEventListener('click', async () => {
      button.disabled = true;
      button.textContent = 'מתנתקים…';
      try {
        await request('/api/classroom/logout', {});
        location.assign('classroom-entry.html');
      } catch {
        button.disabled = false;
        button.textContent = 'התנתקות';
      }
    });
    if (!document.getElementById?.('classroom-student-floating-logout-style')) {
      const style = document.createElement('style');
      style.id = 'classroom-student-floating-logout-style';
      style.textContent = `
        .classroom-student-floating-logout {
          position: fixed;
          z-index: 2147483000;
          top: max(12px, env(safe-area-inset-top));
          left: max(12px, env(safe-area-inset-left));
          min-height: 40px;
          padding: 8px 14px;
          border: 1px solid rgba(15, 23, 42, .14);
          border-radius: 999px;
          background: rgba(255, 255, 255, .96);
          color: #0f172a;
          box-shadow: 0 12px 28px rgba(15, 23, 42, .14);
          font: 800 14px/1.2 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          cursor: pointer;
        }
        .classroom-student-floating-logout:disabled {
          cursor: progress;
          opacity: .72;
        }
        @media (max-width: 620px) {
          .classroom-student-floating-logout {
            top: auto;
            bottom: max(12px, env(safe-area-inset-bottom));
          }
        }
      `;
      (document.head || document.body)?.append(style);
    }
    document.body?.append(button);
  }


  window.ClassroomProgress = { list, save, courseId, get lessonId() { return currentLessonId(); } };
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
    ensureStudentLogoutButton();
    const queued = pendingProgress.splice(0);
    queued.forEach((detail) => save(detail).catch(() => {}));
    return save({ activityId: 'page-open', status: 'started', metadata: { path: `${pathname}${location.search}` } });
  }).catch(() => {
    classroomIdentityLoaded = true;
    pendingProgress.length = 0;
  });
})();
