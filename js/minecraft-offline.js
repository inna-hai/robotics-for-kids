(() => {
  const panel = document.getElementById('minecraft-offline-panel');
  const downloadButton = document.getElementById('minecraft-offline-download');
  const clearButton = document.getElementById('minecraft-offline-clear');
  const status = document.getElementById('minecraft-offline-status');
  const meter = document.getElementById('minecraft-offline-meter');
  if (!panel || !downloadButton || !status || !('serviceWorker' in navigator)) return;

  let registration = null;

  function setStatus(text, tone = '') {
    status.textContent = text;
    status.dataset.tone = tone;
  }

  async function refreshStatus() {
    try {
      const cache = await caches.open('minecraft-offline-20261020-1');
      const marker = await cache.match('/minecraft-offline-ready.json');
      if (!marker) {
        setStatus('מיינקראפט קידס עדיין לא הורדה. יש להתחבר לאינטרנט וללחוץ על הורדה.');
        return;
      }
      const details = await marker.json();
      const cachedAt = new Date(details.cachedAt);
      setStatus(`מיינקראפט קידס מוכנה לעבודה ללא אינטרנט • עודכן ${cachedAt.toLocaleString('he-IL')}`, 'ready');
    } catch {
      setStatus('לא ניתן לבדוק כרגע את חבילת האופליין.');
    }
  }

  navigator.serviceWorker.addEventListener('message', event => {
    const data = event.data || {};
    if (data.type === 'MINECRAFT_CACHE_PROGRESS') {
      const percent = Math.round((data.completed / data.total) * 100);
      meter.hidden = false;
      meter.value = percent;
      setStatus(`מוריד את חבילת מיינקראפט קידס… ${percent}%`);
    }
    if (data.type === 'MINECRAFT_CACHE_READY') {
      downloadButton.disabled = false;
      meter.hidden = true;
      setStatus('ההורדה הושלמה. מיינקראפט קידס מוכנה לעבודה ללא אינטרנט.', 'ready');
    }
    if (data.type === 'MINECRAFT_CACHE_ERROR') {
      downloadButton.disabled = false;
      meter.hidden = true;
      setStatus('ההורדה לא הושלמה. בדקו את החיבור ונסו שוב.', 'error');
    }
    if (data.type === 'MINECRAFT_CACHE_CLEARED') {
      meter.hidden = true;
      setStatus('חבילת האופליין הוסרה מהמכשיר.');
    }
  });

  downloadButton.addEventListener('click', async () => {
    if (!navigator.onLine) {
      setStatus('כדי להוריד בפעם הראשונה צריך להתחבר לאינטרנט.', 'error');
      return;
    }
    downloadButton.disabled = true;
    meter.hidden = false;
    meter.value = 0;
    try {
      if (navigator.storage?.persist) await navigator.storage.persist();
      const worker = registration?.active || navigator.serviceWorker.controller;
      if (!worker) throw new Error('service_worker_not_ready');
      worker.postMessage({ type: 'MINECRAFT_CACHE_DOWNLOAD' });
    } catch {
      downloadButton.disabled = false;
      meter.hidden = true;
      setStatus('לא הצלחתי להתחיל את ההורדה. רעננו את הדף ונסו שוב.', 'error');
    }
  });

  clearButton?.addEventListener('click', () => {
    const worker = registration?.active || navigator.serviceWorker.controller;
    worker?.postMessage({ type: 'MINECRAFT_CACHE_CLEAR' });
  });

  (async () => {
    try {
      registration = await navigator.serviceWorker.register('/sisi-sw.js', { scope: '/' });
      await navigator.serviceWorker.ready;
      await refreshStatus();
    } catch {
      setStatus('הדפדפן הזה לא הצליח להפעיל מצב אופליין.', 'error');
      downloadButton.disabled = true;
    }
  })();
})();
