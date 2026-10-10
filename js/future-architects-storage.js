(() => {
  const pathname = location.pathname.replace(/^\/+/, '');
  const basename = pathname.split('/').pop().replace(/\.html$/, '');
  const lessonMatch = basename.match(/^future-architects-lesson(?:-(\d+))?$/);
  if (!lessonMatch) return;

  const lessonId = lessonMatch[1] || '1';
  const storageKeyPattern = /^futureArchitects\.lesson\d+\.progress\.v1$/;
  const baseStorageKey = `futureArchitects.lesson${lessonId}.progress.v1`;
  const scopeStorageKey = 'futureArchitects.classroomStorageScope.v1';
  let storageScope = sessionStorage.getItem(scopeStorageKey) || 'guest';

  const native = {
    getItem: Storage.prototype.getItem,
    setItem: Storage.prototype.setItem,
    removeItem: Storage.prototype.removeItem,
    key: Storage.prototype.key,
  };

  function scopedKey(key) {
    const text = String(key || '');
    if (/::(?:student|guest|classroom):/.test(text)) return text;
    if (!storageKeyPattern.test(text)) return text;
    return `${text}::${storageScope}`;
  }

  if (!window.__futureArchitectsStoragePatched) {
    window.__futureArchitectsStoragePatched = true;
    Storage.prototype.getItem = function getItem(key) {
      return native.getItem.call(this, this === localStorage ? scopedKey(key) : key);
    };
    Storage.prototype.setItem = function setItem(key, value) {
      return native.setItem.call(this, this === localStorage ? scopedKey(key) : key, value);
    };
    Storage.prototype.removeItem = function removeItem(key) {
      return native.removeItem.call(this, this === localStorage ? scopedKey(key) : key);
    };
  }

  function setScope(nextScope) {
    if (!nextScope || nextScope === storageScope) return false;
    storageScope = nextScope;
    sessionStorage.setItem(scopeStorageKey, nextScope);
    return true;
  }

  function readScopedState() {
    try {
      return JSON.parse(native.getItem.call(localStorage, scopedKey(baseStorageKey)) || '{}') || {};
    } catch {
      return {};
    }
  }

  function writeScopedState(state) {
    native.setItem.call(localStorage, scopedKey(baseStorageKey), JSON.stringify(state || {}));
  }

  async function fetchJson(path) {
    const response = await fetch(path, { credentials: 'same-origin' });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'request_failed');
    return data;
  }

  async function syncFromClassroomPortfolio() {
    const me = await fetchJson('/api/classroom/me');
    if (me.role !== 'student' || !me.student?.id || !me.classroom?.id) {
      setScope('guest');
      return { role: me.role || 'guest', synced: false };
    }
    const courses = Array.isArray(me.classroom.courses) ? me.classroom.courses : [];
    if (!courses.includes('future-architects')) return { role: 'student', synced: false };

    const nextScope = `student:${me.classroom.id}:${me.student.id}`;
    const changedScope = setScope(nextScope);
    const params = new URLSearchParams({
      courseId: 'future-architects',
      lessonId,
      artifactId: 'lesson-state',
    });
    const portfolio = await fetchJson(`/api/classroom/portfolio?${params}`);
    const entry = (portfolio.portfolio || [])[0];
    const serverState = entry?.data?.state && typeof entry.data.state === 'object' ? entry.data.state : null;
    if (!serverState) {
      if (changedScope) {
        const reloadKey = `futureArchitects.reload.empty.${nextScope}.${lessonId}`;
        if (sessionStorage.getItem(reloadKey) !== '1') {
          sessionStorage.setItem(reloadKey, '1');
          location.reload();
        }
      }
      return { role: 'student', synced: false };
    }

    const localState = readScopedState();
    const serverUpdatedAt = entry.updatedAt || '';
    if (localState.__classroomPortfolioUpdatedAt !== serverUpdatedAt) {
      writeScopedState({
        ...serverState,
        __classroomPortfolioUpdatedAt: serverUpdatedAt,
        __classroomPortfolioStudentId: me.student.id,
        __classroomPortfolioClassroomId: me.classroom.id,
      });
      const reloadKey = `futureArchitects.reload.${nextScope}.${lessonId}.${serverUpdatedAt}`;
      if (sessionStorage.getItem(reloadKey) !== '1') {
        sessionStorage.setItem(reloadKey, '1');
        location.reload();
      }
    }
    return { role: 'student', synced: true };
  }

  const ready = syncFromClassroomPortfolio().catch(() => ({ role: 'unknown', synced: false }));

  window.FutureArchitectsStorage = {
    ready,
    get scope() { return storageScope; },
    readScopedState,
  };
})();
