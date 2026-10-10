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

  const bootstrap = window.__HAI_CLASSROOM_BOOTSTRAP || {};
  let classroomStudent = bootstrap.role === 'student' && bootstrap.courseId === courseId ? bootstrap.student : null;
  let classroomIdentityLoaded = Boolean(bootstrap.role);
  const pendingProgress = [];
  const logoutButtonId = 'classroom-student-floating-logout';
  const nativeGetItem = Storage.prototype.getItem;
  const nativeSetItem = Storage.prototype.setItem;
  const nativeRemoveItem = Storage.prototype.removeItem;
  const storageTimers = new Map();
  let restoringFromServer = false;

  function storagePrefixes() {
    if (courseId === 'webcode') return ['webcodeLessonState:', 'webcodeScoreState:', 'webcodeLastLocation:'];
    if (courseId === 'python-turtle') return ['pythonTurtle', 'python-turtle', 'turtle', 'pyTurtle'];
    if (courseId === 'sensi-city') return ['sensi', 'smart-city'];
    if (courseId === 'minecraft') return ['minecraft'];
    if (courseId === 'sisi') return ['sisi-progress:', 'sisi-mission-', 'sisi-course-'];
    if (courseId === 'future-architects') return ['future-architects', 'omer-future-craftom-student-'];
    return [];
  }

  function ownsStorageKey(key) {
    const text = String(key || '');
    if (!text || text === 'haiTechSummerToken') return false;
    return storagePrefixes().some(prefix => text.startsWith(prefix));
  }

  function clearCourseStorage() {
    const keys = [];
    try {
      for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i);
        if (ownsStorageKey(key)) keys.push(key);
      }
      keys.forEach(key => nativeRemoveItem.call(localStorage, key));
    } catch {}
  }

  function restoreStorageSnapshots(rows = []) {
    if (!classroomStudent || !Array.isArray(rows)) return;
    restoringFromServer = true;
    clearCourseStorage();
    const seen = new Set();
    rows.forEach(row => {
      const metadata = row?.metadata || {};
      const key = metadata.storageKey;
      if (!ownsStorageKey(key) || seen.has(key)) return;
      seen.add(key);
      try { nativeSetItem.call(localStorage, key, String(metadata.storageValue || '')); } catch {}
    });
    restoringFromServer = false;
  }

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

  function hashText(text) {
    let hash = 2166136261;
    String(text || '').split('').forEach(char => {
      hash ^= char.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    });
    return (hash >>> 0).toString(36);
  }

  function snapshotStorage(key, value) {
    if (restoringFromServer || !classroomStudent || !ownsStorageKey(key)) return;
    const storageValue = String(value || '');
    if (storageValue.length > 60000) return;
    clearTimeout(storageTimers.get(key));
    storageTimers.set(key, setTimeout(() => {
      storageTimers.delete(key);
      save({
        lessonId: currentLessonId(),
        activityId: `state:${hashText(key)}`,
        status: 'started',
        metadata: {
          kind: 'storage-state',
          storageKey: key,
          storageValue,
          path: `${pathname}${location.search}`,
        },
      }).catch(() => {});
    }, 450));
  }

  function collectOwnedStorage() {
    const snapshot = {};
    let total = 0;
    try {
      for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i);
        if (!ownsStorageKey(key)) continue;
        const value = nativeGetItem.call(localStorage, key) || '';
        total += key.length + value.length;
        if (total > 55000) break;
        snapshot[key] = value;
      }
    } catch {}
    return snapshot;
  }

  const originalSetItem = Storage.prototype.setItem;
  Storage.prototype.setItem = function setItemWithClassroomSnapshot(key, value) {
    const result = originalSetItem.call(this, key, value);
    if (this === localStorage) snapshotStorage(key, value);
    return result;
  };

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
    const detail = event.detail || {};
    if (!detail.metadata) detail.metadata = {};
    detail.metadata.path = detail.metadata.path || `${pathname}${location.search}`;
    if (detail.status === 'completed' && !detail.metadata.solutionSnapshot) {
      detail.metadata.solutionSnapshot = collectOwnedStorage();
    }
    save(detail).catch(() => {});
  });

  restoreStorageSnapshots(bootstrap.progress || []);

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
