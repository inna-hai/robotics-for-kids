(() => {
  if (document.getElementById('clear-lesson-solution')) return;

  const style = document.createElement('style');
  style.textContent = `
    .clear-lesson-solution{position:fixed;left:14px;bottom:14px;z-index:9997;border:0;border-radius:999px;padding:12px 17px;background:#dc2626;color:#fff;font:900 15px Rubik,Arial,sans-serif;box-shadow:0 10px 26px rgba(127,29,29,.32);cursor:pointer;direction:rtl}
    .clear-lesson-solution:focus-visible{outline:4px solid #fde68a;outline-offset:3px}
    @media(max-width:620px){.clear-lesson-solution{left:10px;bottom:10px;padding:10px 14px;font-size:13px}}
  `;
  document.head.appendChild(style);

  const button = document.createElement('button');
  button.id = 'clear-lesson-solution';
  button.className = 'clear-lesson-solution';
  button.type = 'button';
  button.textContent = '🧹 נקה פתרונות והתחל מחדש';
  button.setAttribute('aria-label', 'נקה את הפתרון בשיעור הנוכחי והתחל מחדש');
  document.body.appendChild(button);

  button.addEventListener('click', () => {
    if (!window.confirm('לנקות את הפתרון בשיעור הזה ולהתחיל מחדש?')) return;

    if (/minecraft-play\.html$/.test(window.location.pathname)) {
      try {
        if (typeof window.workspaceStorageKey === 'function') {
          localStorage.removeItem(window.workspaceStorageKey());
        }
        if (typeof window.restoreStarterWorkspace === 'function') window.restoreStarterWorkspace();
        if (typeof window.resetWorld === 'function') window.resetWorld({ clearDrawing: true, resetPlayer: true });
        document.getElementById('missionFeedback')?.classList.remove('show', 'fail');
        button.textContent = '✅ נוקה — אפשר להתחיל';
        setTimeout(() => { button.textContent = '🧹 נקה פתרונות והתחל מחדש'; }, 2200);
        return;
      } catch {}
    }

    window.location.reload();
  });
})();
