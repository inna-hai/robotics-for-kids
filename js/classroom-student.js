(() => {
  const courseDetails = {
    'sensi-city': { label: 'סנסי בעיר החכמה', href: 'sensi-city.html?lesson=1' },
    sisi: { label: 'סיסי', href: 'sisi.html' },
    'python-turtle': { label: 'Python Turtle', href: 'python-turtle.html' },
    webcode: { label: 'Web Code', href: 'webcode.html' },
    minecraft: { label: 'Minecraft', href: 'minecraft.html' },
    'craftom-agent': { label: 'אקדמיית ה-Agent', href: 'craftom-school/preview/index.html' },
  };

  const studentName = document.getElementById('classroom-student-name');
  const classroomName = document.getElementById('classroom-name');
  const courses = document.getElementById('classroom-student-courses');
  const message = document.getElementById('classroom-student-message');
  const logout = document.getElementById('classroom-student-logout');

  async function request(path, payload) {
    const response = await fetch(path, {
      method: payload === undefined ? 'GET' : 'POST',
      credentials: 'same-origin',
      headers: payload === undefined ? {} : { 'Content-Type': 'application/json' },
      body: payload === undefined ? undefined : JSON.stringify(payload),
    });
    let data = {};
    try { data = await response.json(); } catch {}
    if (!response.ok) throw new Error(data.error || 'הפעולה לא הצליחה.');
    return data;
  }

  function renderStudent(data) {
    studentName.textContent = data.student.name;
    classroomName.textContent = data.classroom.name;
    const links = (data.classroom.courses || []).flatMap((courseId) => {
      const detail = courseDetails[courseId];
      if (!detail) return [];
      const link = document.createElement('a');
      link.className = 'button primary';
      link.textContent = detail.label;
      link.href = detail.href;
      return [link];
    });
    courses.replaceChildren(...links);
    if (!links.length) message.textContent = 'עדיין לא הוקצו לומדות לכיתה הזו.';
  }

  logout.addEventListener('click', async () => {
    logout.disabled = true;
    message.textContent = 'מתנתקים…';
    try {
      await request('/api/classroom/logout', {});
      location.assign('classroom-entry.html');
    } catch (error) {
      message.textContent = error.message;
      logout.disabled = false;
    }
  });

  request('/api/classroom/me')
    .then((me) => {
      if (me.role !== 'student') {
        location.assign('classroom-entry.html');
        return;
      }
      renderStudent(me);
    })
    .catch(() => location.assign('classroom-entry.html'));
})();
