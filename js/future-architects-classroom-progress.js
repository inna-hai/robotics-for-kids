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

  function scheduleProgress() {
    clearTimeout(timer);
    timer = setTimeout(sendProgress, 450);
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
