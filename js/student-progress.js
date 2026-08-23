(() => {
  const TOKEN_KEY = 'haiTechSummerToken';

  function getToken() {
    return localStorage.getItem(TOKEN_KEY) || '';
  }

  async function request(path, options = {}) {
    const headers = { ...(options.headers || {}) };
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(path, { ...options, headers });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'לא הצלחנו לשמור התקדמות.');
    return data;
  }

  async function list({ courseId, lessonId } = {}) {
    const params = new URLSearchParams();
    if (courseId) params.set('courseId', courseId);
    if (lessonId) params.set('lessonId', lessonId);
    const query = params.toString() ? `?${params}` : '';
    return request(`/api/progress${query}`);
  }

  async function save(progress) {
    return request('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(progress),
    });
  }

  window.StudentProgress = { list, save };
})();
