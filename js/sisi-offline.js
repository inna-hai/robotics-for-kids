(() => {
  const panel = document.getElementById('sisi-offline-panel');
  const downloadButton = document.getElementById('sisi-offline-download');
  const clearButton = document.getElementById('sisi-offline-clear');
  const status = document.getElementById('sisi-offline-status');
  const meter = document.getElementById('sisi-offline-meter');
  if (!panel || !downloadButton || !status || !('serviceWorker' in navigator)) return;

  let registration = null;

  function setStatus(text, tone = '') {
    status.textContent = text;
    status.dataset.tone = tone;
  }

  async function readyMarker() {
    const cache = await caches.open('sisi-offline-20261020-1');
    return cache.match('/sisi-offline-ready.json');
  }

  async function refreshStatus() {
    try {
      const marker = await readyMarker();
      if (!marker) {
        setStatus('סיסי עדיין לא הורדה לטאבלט. יש להתחבר לאינטרנט וללחוץ על הורדה.');
        return;
      }
      const details = await marker.json();
      const cachedAt = new Date(details.cachedAt);
      setStatus(`סיסי מוכנה לעבודה ללא אינטרנט • עודכן ${cachedAt.toLocaleString('he-IL')}`, 'ready');
    } catch {
      setStatus('לא ניתן לבדוק כרגע את חבילת האופליין.');
    }
  }

  navigator.serviceWorker.addEventListener('message', event => {
    const data = event.data || {};
    if (data.type === 'SISI_CACHE_PROGRESS') {
      const percent = Math.round((data.completed / data.total) * 100);
      meter.hidden = false;
      meter.value = percent;
      setStatus(`מוריד את חבילת סיסי… ${percent}%`);
    }
    if (data.type === 'SISI_CACHE_READY') {
      downloadButton.disabled = false;
      meter.hidden = true;
      setStatus('ההורדה הושלמה. סיסי מוכנה לעבודה ללא אינטרנט.', 'ready');
    }
    if (data.type === 'SISI_CACHE_ERROR') {
      downloadButton.disabled = false;
      meter.hidden = true;
      setStatus('ההורדה לא הושלמה. בדקו את החיבור ונסו שוב.', 'error');
    }
    if (data.type === 'SISI_CACHE_CLEARED') {
      meter.hidden = true;
      setStatus('חבילת האופליין הוסרה מהטאבלט.');
    }
    if (data.type === 'SISI_PROGRESS_QUEUED') {
      setStatus('אין אינטרנט — ההתקדמות נשמרה בטאבלט ותסתנכרן כשנחזור לרשת.', 'ready');
    }
    if (data.type === 'SISI_SYNC_RESULT' && data.synced > 0) {
      setStatus(`החיבור חזר ו־${data.synced} עדכוני התקדמות סונכרנו.`, 'ready');
    }
  });

  downloadButton.addEventListener('click', async () => {
    if (!navigator.onLine) {
      setStatus('כדי להוריד את סיסי בפעם הראשונה צריך להתחבר לאינטרנט.', 'error');
      return;
    }
    downloadButton.disabled = true;
    meter.hidden = false;
    meter.value = 0;
    try {
      if (navigator.storage?.persist) await navigator.storage.persist();
      const worker = registration?.active || navigator.serviceWorker.controller;
      if (!worker) throw new Error('service_worker_not_ready');
      worker.postMessage({ type: 'SISI_CACHE_DOWNLOAD' });
    } catch {
      downloadButton.disabled = false;
      meter.hidden = true;
      setStatus('לא הצלחתי להתחיל את ההורדה. רעננו את הדף ונסו שוב.', 'error');
    }
  });

  clearButton?.addEventListener('click', () => {
    const worker = registration?.active || navigator.serviceWorker.controller;
    worker?.postMessage({ type: 'SISI_CACHE_CLEAR' });
  });

  window.addEventListener('online', () => {
    const worker = registration?.active || navigator.serviceWorker.controller;
    worker?.postMessage({ type: 'SISI_SYNC_NOW' });
    refreshStatus();
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
