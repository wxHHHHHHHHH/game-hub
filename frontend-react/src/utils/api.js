import CONFIG from './config';

const TOKEN_KEY = 'bobi_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(t) {
  localStorage.setItem(TOKEN_KEY, t);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const url = CONFIG.API_BASE + path;
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = getToken();
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) { clearToken(); throw new Error('登录已过期'); }
  if (!res.ok) {
    let msg = `请求失败 (${res.status})`;
    try { const e = await res.json(); msg = e.message || e.error || msg; } catch {}
    throw new Error(msg);
  }
  const ct = res.headers.get('content-type');
  if (ct && ct.includes('application/json')) return res.json();
  return res.text();
}

export const api = {
  login: (username, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  getMe: () => request('/auth/me'),
  getVideos: (params = '') => request('/videos' + params),
  getVideo: (id) => request('/videos/' + id),
  createVideo: (data) => request('/videos', { method: 'POST', body: JSON.stringify(data) }),
  deleteVideo: (id) => request('/videos/' + id, { method: 'DELETE' }),
  likeVideo: (id) => request('/videos/' + id + '/like', { method: 'POST' }),
  unlikeVideo: (id) => request('/videos/' + id + '/unlike', { method: 'POST' }),
  addComment: (videoId, content) => request('/videos/' + videoId + '/comments', { method: 'POST', body: JSON.stringify({ content }) }),
  deleteComment: (id) => request('/comments/' + id, { method: 'DELETE' }),
  getUsers: () => request('/admin/users'),
  createUser: (data) => request('/admin/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUserRole: (id, role) => request('/admin/users/' + id + '/role', { method: 'PUT', body: JSON.stringify({ role }) }),
  deleteUser: (id) => request('/admin/users/' + id, { method: 'DELETE' }),
  getFiles: () => request('/files'),
  uploadFile: (formData) => request('/upload/file', { method: 'POST', headers: {}, body: formData }),
  uploadPhoto: (formData) => request('/upload/photo', { method: 'POST', headers: {}, body: formData }),
  uploadCover: (formData) => request('/upload/cover', { method: 'POST', headers: {}, body: formData }),
  getPhotos: (params = '') => request('/photos' + params),
  getNews: () => request('/news'),
  getNewsDetail: (id) => request('/news/' + id),
  createNews: (data) => request('/news', { method: 'POST', body: JSON.stringify(data) }),
  getStats: () => request('/admin/stats'),
  getLogs: () => request('/admin/logs'),
  getBanners: () => request('/admin/banners'),
  updateBanners: (data) => request('/admin/banners', { method: 'PUT', body: JSON.stringify(data) }),
  getContact: () => request('/admin/contact'),
  updateContact: (data) => request('/admin/contact', { method: 'PUT', body: JSON.stringify(data) }),
};
