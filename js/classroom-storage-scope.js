(() => {
  const pathname = location.pathname.replace(/^\/+/, '');
  const courseId = (() => {
    if (/python-turtle/.test(pathname)) return 'python-turtle';
    if (/webcode/.test(pathname)) return 'webcode';
    if (/minecraft/.test(pathname)) return 'minecraft';
    if (/sensi-city|smart-city/.test(pathname)) return 'sensi-city';
    if (/^(sisi|space|music|ocean|park|garden|factory|kitchen|cinema|detective|dino|art|weather|mail|escape|finale)(-|\.|\/)/.test(pathname)) return 'sisi';
    return '';
  })();

  if (!courseId) return;

  const scopeStorageKey = 'haiTechClassroomStorageScope.v1';
  let storageScope = sessionStorage.getItem(scopeStorageKey) || `guest:${courseId}`;
  const native = {
    getItem: Storage.prototype.getItem,
    setItem: Storage.prototype.setItem,
    removeItem: Storage.prototype.removeItem,
    clear: Storage.prototype.clear,
    key: Storage.prototype.key,
  };

  function shouldScopeKey(key) {
    const text = String(key || '');
    if (!text) return false;
    if (/^(haiTech|openclaw|debug|devtools)/i.test(text)) return false;
    return true;
  }

  function scopedKey(key) {
    const text = String(key || '');
    if (text.includes('::classroom:')) return text;
    if (!shouldScopeKey(text)) return text;
    return `${text}::classroom:${storageScope}`;
  }

  if (!window.__classroomStorageScopePatched) {
    window.__classroomStorageScopePatched = true;
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

  async function syncScope() {
    const response = await fetch('/api/classroom/me', { credentials: 'same-origin' });
    const me = await response.json().catch(() => ({}));
    if (!response.ok || me.role !== 'student' || !me.student?.id || !me.classroom?.id) {
      setScope(`guest:${courseId}`);
      return { role: me.role || 'guest', scoped: false };
    }
    const courses = Array.isArray(me.classroom.courses) ? me.classroom.courses : [];
    if (!courses.includes(courseId)) return { role: 'student', scoped: false };
    const nextScope = `student:${me.classroom.id}:${me.student.id}:${courseId}`;
    const changed = setScope(nextScope);
    if (changed) {
      const reloadKey = `haiTechClassroomStorageScopeReload.${nextScope}`;
      if (sessionStorage.getItem(reloadKey) !== '1') {
        sessionStorage.setItem(reloadKey, '1');
        location.reload();
      }
    }
    return { role: 'student', scoped: true };
  }

  const ready = syncScope().catch(() => ({ role: 'unknown', scoped: false }));
  window.ClassroomStorageScope = {
    ready,
    get courseId() { return courseId; },
    get scope() { return storageScope; },
  };
})();
