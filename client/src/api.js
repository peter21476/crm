const API_BASE = process.env.REACT_APP_API_URL || '/api';

export const api = {
  get: (path) => {
    const token = localStorage.getItem('token');
    return fetch(`${API_BASE}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).then((res) => {
      if (!res.ok) throw new Error(res.statusText);
      return res.json().catch(() => ({}));
    });
  },
  post: (path, body) => {
    const token = localStorage.getItem('token');
    return fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    }).then(async (res) => {
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Request failed');
      return data;
    });
  },
  put: (path, body) => {
    const token = localStorage.getItem('token');
    return fetch(`${API_BASE}${path}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    }).then(async (res) => {
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Request failed');
      return data;
    });
  },
  delete: (path) => {
    const token = localStorage.getItem('token');
    return fetch(`${API_BASE}${path}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).then((res) => {
      if (res.status === 204) return;
      return res.json().then((data) => {
        throw new Error(data.error || 'Request failed');
      });
    });
  },
};
