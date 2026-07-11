(() => {
  if (window.__roboticsFeedbackWidgetLoaded) return;
  window.__roboticsFeedbackWidgetLoaded = true;

  const style = document.createElement('style');
  style.textContent = `
    .rfw-button{position:fixed;left:16px;bottom:16px;z-index:99999;border:0;border-radius:999px;background:#2563eb;color:#fff;font-family:Heebo,Arial,sans-serif;font-weight:800;font-size:14px;padding:12px 16px;box-shadow:0 10px 24px rgba(37,99,235,.32);cursor:pointer;direction:rtl}
    .rfw-button:hover{background:#1d4ed8;transform:translateY(-1px)}
    .rfw-backdrop{position:fixed;inset:0;background:rgba(15,23,42,.45);z-index:100000;display:flex;align-items:center;justify-content:center;padding:18px;direction:rtl;font-family:Heebo,Arial,sans-serif}
    .rfw-modal{width:min(520px,100%);background:#fff;border-radius:22px;box-shadow:0 24px 70px rgba(15,23,42,.28);padding:22px;color:#0f172a}
    .rfw-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}.rfw-title{font-size:22px;font-weight:900;margin:0}.rfw-close{border:0;background:#f1f5f9;border-radius:10px;width:36px;height:36px;cursor:pointer;font-size:22px;line-height:1}.rfw-tabs{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0}.rfw-tab{border:1px solid #cbd5e1;background:#fff;border-radius:12px;padding:10px;font-weight:800;cursor:pointer}.rfw-tab.active{background:#dbeafe;border-color:#2563eb;color:#1d4ed8}.rfw-label{display:block;font-weight:800;margin:12px 0 6px}.rfw-input,.rfw-textarea{width:100%;box-sizing:border-box;border:1px solid #cbd5e1;border-radius:12px;padding:11px 12px;font:inherit}.rfw-textarea{min-height:132px;resize:vertical}.rfw-file{width:100%;box-sizing:border-box;border:1px dashed #94a3b8;border-radius:12px;padding:11px 12px;background:#f8fafc;font:inherit}.rfw-preview{display:none;margin-top:8px;align-items:center;gap:10px;color:#475569;font-size:13px;font-weight:700}.rfw-preview img{width:54px;height:54px;object-fit:cover;border-radius:10px;border:1px solid #cbd5e1}.rfw-actions{display:flex;gap:10px;align-items:center;justify-content:flex-start;margin-top:16px}.rfw-submit{border:0;border-radius:12px;background:#16a34a;color:#fff;font-weight:900;padding:12px 18px;cursor:pointer}.rfw-submit:disabled{opacity:.65;cursor:wait}.rfw-cancel{border:0;background:#f1f5f9;border-radius:12px;font-weight:800;padding:12px 16px;cursor:pointer}.rfw-msg{font-size:14px;font-weight:700}.rfw-help{color:#64748b;font-size:13px;margin-top:8px;line-height:1.5}@media(max-width:640px){.rfw-button{left:12px;bottom:12px;font-size:13px;padding:11px 14px}.rfw-modal{padding:18px;border-radius:18px}.rfw-title{font-size:19px}}
  `;
  document.head.appendChild(style);

  const button = document.createElement('button');
  button.className = 'rfw-button';
  button.type = 'button';
  button.textContent = '🐞 דיווח / רעיון';
  button.setAttribute('aria-label', 'דיווח באג או הצעה לשיפור');
  document.body.appendChild(button);

  let kind = 'bug';
  let backdrop = null;

  const pageLesson = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('lesson') || params.get('id') || '';
  };

  function close() {
    if (backdrop) backdrop.remove();
    backdrop = null;
  }

  function open() {
    close();
    backdrop = document.createElement('div');
    backdrop.className = 'rfw-backdrop';
    backdrop.innerHTML = `
      <form class="rfw-modal">
        <div class="rfw-head">
          <h2 class="rfw-title">דיווח למערכת</h2>
          <button class="rfw-close" type="button" aria-label="סגור">×</button>
        </div>
        <div class="rfw-tabs" role="tablist">
          <button class="rfw-tab active" type="button" data-kind="bug">🐞 באג</button>
          <button class="rfw-tab" type="button" data-kind="feature">💡 הצעה לשיפור</button>
        </div>
        <label class="rfw-label" for="rfw-message">מה קרה / מה היית רוצה לשפר?</label>
        <textarea id="rfw-message" class="rfw-textarea" required placeholder="לדוגמה: בשיעור 3 כפתור ההרצה לא מגיב בטלפון..."></textarea>
        <label class="rfw-label" for="rfw-contact">שם / מייל / טלפון — לא חובה</label>
        <input id="rfw-contact" class="rfw-input" placeholder="כדי שנוכל לחזור אליך אם צריך" />
        <label class="rfw-label" for="rfw-image">צילום מסך / תמונה — לא חובה</label>
        <input id="rfw-image" class="rfw-file" type="file" accept="image/png,image/jpeg,image/webp,image/gif" />
        <div class="rfw-preview"><img alt="תצוגה מקדימה" /><span></span></div>
        <div class="rfw-help">אפשר לצרף תמונה עד 5MB. המערכת תצרף אוטומטית את העמוד הנוכחי${pageLesson() ? ` ואת שיעור ${pageLesson()}` : ''}.</div>
        <div class="rfw-actions">
          <button class="rfw-submit" type="submit">שליחה</button>
          <button class="rfw-cancel" type="button">ביטול</button>
          <span class="rfw-msg" aria-live="polite"></span>
        </div>
      </form>
    `;
    document.body.appendChild(backdrop);

    const form = backdrop.querySelector('form');
    const msg = backdrop.querySelector('.rfw-msg');
    const submit = backdrop.querySelector('.rfw-submit');
    const message = backdrop.querySelector('#rfw-message');
    const contact = backdrop.querySelector('#rfw-contact');
    const imageInput = backdrop.querySelector('#rfw-image');
    const preview = backdrop.querySelector('.rfw-preview');
    let attachment = null;

    backdrop.addEventListener('click', (event) => { if (event.target === backdrop) close(); });
    backdrop.querySelector('.rfw-close').addEventListener('click', close);
    backdrop.querySelector('.rfw-cancel').addEventListener('click', close);
    backdrop.querySelectorAll('.rfw-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        kind = tab.dataset.kind;
        backdrop.querySelectorAll('.rfw-tab').forEach(t => t.classList.toggle('active', t === tab));
      });
    });

    imageInput.addEventListener('change', () => {
      attachment = null;
      preview.style.display = 'none';
      const file = imageInput.files && imageInput.files[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        msg.style.color = '#dc2626';
        msg.textContent = 'אפשר לצרף רק תמונה.';
        imageInput.value = '';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        msg.style.color = '#dc2626';
        msg.textContent = 'התמונה גדולה מדי. עד 5MB.';
        imageInput.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        attachment = { name: file.name, type: file.type, size: file.size, dataUrl: reader.result };
        preview.querySelector('img').src = reader.result;
        preview.querySelector('span').textContent = `${file.name} · ${Math.round(file.size / 1024)}KB`;
        preview.style.display = 'flex';
        msg.textContent = '';
      };
      reader.onerror = () => {
        msg.style.color = '#dc2626';
        msg.textContent = 'לא הצלחנו לקרוא את התמונה.';
      };
      reader.readAsDataURL(file);
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      msg.textContent = '';
      submit.disabled = true;
      submit.textContent = 'שולח...';
      let response = null;
      try {
        response = await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            kind,
            message: message.value,
            contact: contact.value,
            page: window.location.pathname + window.location.search,
            lesson: pageLesson(),
            attachment,
          }),
        });
        if (!response.ok) throw new Error('bad_response');
        msg.style.color = '#15803d';
        msg.textContent = 'נשלח, תודה!';
        setTimeout(close, 900);
      } catch (error) {
        let errorMessage = 'אופס, לא הצלחנו לשלוח. נסו שוב.';
        try {
          const payload = await response?.json?.();
          if (payload?.error) errorMessage = payload.error;
        } catch (_) {}
        msg.style.color = '#dc2626';
        msg.textContent = errorMessage;
      } finally {
        submit.disabled = false;
        submit.textContent = 'שליחה';
      }
    });

    setTimeout(() => message.focus(), 50);
  }

  button.addEventListener('click', open);
})();
