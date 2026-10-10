(() => {
  if (!window.ClassroomProgress || window.ClassroomProgress.courseId !== 'future-architects') return;

  const pathname = location.pathname.replace(/^\/+/, '');
  const lessonId = (() => {
    const basename = pathname.split('/').pop().replace(/\.html$/, '');
    const match = basename.match(/^future-architects-lesson(?:-(\d+))?$/);
    return match ? (match[1] || '1') : 'course';
  })();
  if (lessonId === 'course') return;

  let timer = null;
  let lastSignature = '';
  let portfolioTimer = null;
  let lastPortfolioSignature = '';

  function progressSnapshot() {
    const items = Array.from(document.querySelectorAll('#progressList button'));
    const done = items.filter(item => item.classList.contains('done')).length;
    const activeIndex = items.findIndex(item => item.classList.contains('active'));
    const total = items.length || 1;
    const currentIndex = activeIndex >= 0 ? activeIndex : Math.max(0, done - 1);
    const current = items[currentIndex];
    const title = current?.querySelector('span')?.textContent?.replace(/^\s*\d+\.\s*/, '').trim() || '';
    return {
      lessonId,
      activityId: `step-${Math.min(total, Math.max(1, currentIndex + 1))}`,
      status: done > currentIndex || done >= total ? 'completed' : 'started',
      score: Math.round((done / total) * 100),
      metadata: {
        path: `${pathname}${location.search}`,
        stepTitle: title,
        completedSteps: done,
        totalSteps: total,
      },
    };
  }

  function sendProgress() {
    const detail = progressSnapshot();
    const signature = JSON.stringify(detail);
    if (signature === lastSignature) return;
    lastSignature = signature;
    window.dispatchEvent(new CustomEvent('hai:classroom-progress', { detail }));
  }

  function cleanLabel(key) {
    const labels = {
      studentName: 'שם / כינוי',
      teamName: 'שם הצוות',
      solutionName: 'שם הפתרון',
      selectedTitle: 'הרעיון שנבחר',
      problem: 'הבעיה',
      audience: 'קהל היעד',
      requirement: 'מה צריך לקרות',
      exitTicket: 'כרטיס יציאה',
      openingThought: 'מחשבה ראשונה',
      mainFeedback: 'משוב מרכזי',
      contentFix: 'תיקון תוכני',
      designFix: 'תיקון עיצובי',
      presentationSentence: 'משפט פתיחה להצגה',
      finalFileName: 'שם הקובץ הסופי',
      savedWhere: 'איפה נשמר',
    };
    return labels[key] || String(key || '').replace(/([A-Z])/g, ' $1').replace(/[_-]+/g, ' ').trim();
  }

  function flattenFields(value, prefix = '') {
    if (!value || typeof value !== 'object') return [];
    const fields = [];
    for (const [key, raw] of Object.entries(value)) {
      if (key === 'current') continue;
      if (String(key).startsWith('__classroom')) continue;
      const label = prefix ? `${prefix} / ${cleanLabel(key)}` : cleanLabel(key);
      if (raw === null || raw === undefined || raw === '') continue;
      if (typeof raw === 'string' || typeof raw === 'number' || typeof raw === 'boolean') {
        fields.push({ label, value: String(raw) });
      } else if (Array.isArray(raw)) {
        const text = raw.filter(item => item !== null && item !== undefined && item !== '').map(item => (
          typeof item === 'object' ? JSON.stringify(item) : String(item)
        )).join(', ');
        if (text) fields.push({ label, value: text });
      } else if (typeof raw === 'object') {
        fields.push(...flattenFields(raw, label));
      }
    }
    return fields.slice(0, 80);
  }

  function localState() {
    const storageKey = `futureArchitects.lesson${lessonId}.progress.v1`;
    try {
      return JSON.parse(localStorage.getItem(storageKey) || '{}') || {};
    } catch {
      return {};
    }
  }

  async function postPortfolio(detail) {
    const response = await fetch('/api/classroom/portfolio', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(detail),
    });
    if (!response.ok) throw new Error('portfolio_save_failed');
    return response.json();
  }

  async function sendPortfolio() {
    if (window.FutureArchitectsStorage?.ready) {
      await window.FutureArchitectsStorage.ready;
    }
    const state = localState();
    const fields = flattenFields(state).filter(field => String(field.value || '').trim());
    if (!fields.length) return;
    const heading = document.querySelector('h1')?.textContent?.trim() || `מפגש ${lessonId}`;
    const detail = {
      courseId: 'future-architects',
      lessonId,
      artifactId: 'lesson-state',
      title: heading,
      data: {
        title: heading,
        fields,
        state,
        path: `${pathname}${location.search}`,
        savedAt: new Date().toISOString(),
      },
    };
    const signature = JSON.stringify({ lessonId, fields });
    if (signature === lastPortfolioSignature) return;
    lastPortfolioSignature = signature;
    postPortfolio(detail).then((data) => {
      if (!data?.portfolio?.updatedAt) return;
      try {
        localStorage.setItem(`futureArchitects.lesson${lessonId}.progress.v1`, JSON.stringify({
          ...state,
          __classroomPortfolioUpdatedAt: data.portfolio.updatedAt,
        }));
      } catch {}
    }).catch(() => {});
  }

  function scheduleProgress() {
    clearTimeout(timer);
    timer = setTimeout(sendProgress, 450);
    clearTimeout(portfolioTimer);
    portfolioTimer = setTimeout(sendPortfolio, 850);
  }

  document.addEventListener('input', scheduleProgress, true);
  document.addEventListener('change', scheduleProgress, true);
  document.addEventListener('click', scheduleProgress, true);
  new MutationObserver(scheduleProgress).observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'aria-current'],
  });
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleProgress, { once: true });
  } else {
    scheduleProgress();
  }
})();
