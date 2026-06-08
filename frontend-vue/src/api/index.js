import axios from 'axios'

const http = axios.create({
  baseURL: import.meta.env.PROD ? '/api' : '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
})

http.interceptors.request.use(cfg => {
  const t = localStorage.getItem('bobi_token')
  if (t) cfg.headers.Authorization = `Bearer ${t}`
  return cfg
})

http.interceptors.response.use(
  r => r.data,
  err => {
    if (err.response?.status === 401 && !err.config.url.includes('/auth/')) {
      localStorage.removeItem('bobi_token')
      localStorage.removeItem('bobi_user')
    }
    return Promise.reject(err.response?.data || err)
  }
)

export default {
  get: (url, params) => http.get(url, { params }),
  post: (url, data) => http.post(url, data),
  put: (url, data) => http.put(url, data),
  delete: (url) => http.delete(url),
  // Videos
  getVideos: (sort, search, type) => http.get('/videos', { params: { sort, search, type } }),
  getVideo: (id) => http.get(`/videos/${id}`),
  createVideo: (data) => http.post('/videos', data),
  updateVideo: (id, data) => http.put(`/videos/${id}`, data),
  deleteVideo: (id) => http.delete(`/videos/${id}`),
  likeVideo: (id) => http.post(`/videos/${id}/like`),
  unlikeVideo: (id) => http.post(`/videos/${id}/unlike`),
  checkLiked: (id) => http.get(`/videos/${id}/liked`),
  // News
  getNews: () => http.get('/news'),
  getNewsDetail: (id) => http.get(`/news/${id}`),
  createNews: (data) => http.post('/news', data),
  deleteNews: (id) => http.delete(`/news/${id}`),
  // Photos
  getPhotos: () => http.get('/photos'),
  uploadPhoto: (file, caption, album, date, uploaderName) => {
    const fd = new FormData(); fd.append('file', file)
    if (caption) fd.append('caption', caption)
    if (album) fd.append('album', album)
    if (date) fd.append('date', date)
    if (uploaderName) fd.append('uploaderName', uploaderName)
    return http.post('/photos/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  deletePhoto: (id) => http.delete(`/photos/${id}`),
  // Files
  getFiles: () => http.get('/files'),
  uploadFile: (file, label) => {
    const fd = new FormData(); fd.append('file', file); fd.append('label', label)
    return http.post('/upload/file', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  deleteFile: (id) => http.delete(`/files/${id}`),
  // Banners
  getBanners: () => http.get('/banners'),
  createBanner: (data) => http.post('/banners', data),
  deleteBanner: (id) => http.delete(`/banners/${id}`),
  // Contact
  getContact: () => http.get('/contact'),
  updateContact: (data) => http.put('/contact', data),
  // Admin
  getUsers: () => http.get('/admin/users'),
  createUser: (data) => http.post('/admin/users', data),
  updateUserRole: (id, role) => http.put(`/admin/users/${id}/role`, { role }),
  deleteUser: (id) => http.delete(`/admin/users/${id}`),
  getLogs: () => http.get('/admin/logs'),
  // Upload cover
  uploadCover: (file) => {
    const fd = new FormData(); fd.append('file', file)
    return http.post('/upload/cover', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
}
