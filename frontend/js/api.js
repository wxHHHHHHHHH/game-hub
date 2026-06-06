/* ============================================
   GameHub — API Client
   Handles all HTTP requests with JWT auth
   ============================================ */

const API = (function() {
    const BASE = CONFIG.API_BASE;

    function getHeaders() {
        const headers = { 'Content-Type': 'application/json' };
        const token = AUTH.getToken();
        if (token) {
            headers['Authorization'] = 'Bearer ' + token;
        }
        return headers;
    }

    async function request(path, options) {
        options = options || {};
        options.headers = Object.assign(getHeaders(), options.headers || {});

        if (options.body && typeof options.body === 'object') {
            options.body = JSON.stringify(options.body);
        }

        const res = await fetch(BASE + path, options);

        if (res.status === 401) {
            // Only auto-logout if user was logged in (not login endpoint itself)
            if (AUTH.isLoggedIn() && !path.includes('/auth/')) {
                AUTH.logout();
                throw new Error('登录已过期，请重新登录');
            }
            // For login endpoint, just pass through to get the error message
            const data = await res.json();
            throw new Error(data.error || '用户名或密码错误');
        }

        if (res.status === 403) {
            throw new Error('权限不足');
        }

        if (res.status === 204) return null;

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || '请求失败');
        }

        return data;
    }

    return {
        // Auth
        login: function(username, password) {
            return request('/auth/login', {
                method: 'POST',
                body: { username: username, password: password }
            });
        },

        getMe: function() {
            return request('/auth/me');
        },

        // Videos
        getVideos: function(sort) {
            var path = '/videos';
            if (sort) path += '?sort=' + sort;
            return request(path);
        },

        getVideo: function(id) {
            return request('/videos/' + id);
        },

        createVideo: function(data) {
            return request('/videos', {
                method: 'POST',
                body: data
            });
        },

        deleteVideo: function(id) {
            return request('/videos/' + id, {
                method: 'DELETE'
            });
        },

        likeVideo: function(id) {
            return request('/videos/' + id + '/like', {
                method: 'POST'
            });
        },

        unlikeVideo: function(id) {
            return request('/videos/' + id + '/unlike', {
                method: 'POST'
            });
        },

        // Upload
        uploadVideo: function(file, onProgress) {
            return new Promise(function(resolve, reject) {
                var formData = new FormData();
                formData.append('file', file);

                var xhr = new XMLHttpRequest();
                xhr.open('POST', BASE + '/upload/video');

                var token = AUTH.getToken();
                if (token) xhr.setRequestHeader('Authorization', 'Bearer ' + token);

                xhr.upload.onprogress = function(e) {
                    if (e.lengthComputable && onProgress) {
                        onProgress(Math.round((e.loaded / e.total) * 100));
                    }
                };

                xhr.onload = function() {
                    if (xhr.status === 401) {
                        AUTH.logout();
                        reject(new Error('登录已过期，请重新登录'));
                        return;
                    }
                    try {
                        var data = JSON.parse(xhr.responseText);
                        if (xhr.status >= 200 && xhr.status < 300) {
                            resolve(data);
                        } else {
                            reject(new Error(data.error || '上传失败'));
                        }
                    } catch(e) {
                        reject(new Error('解析响应失败'));
                    }
                };

                xhr.onerror = function() {
                    reject(new Error('网络错误，上传失败'));
                };

                xhr.send(formData);
            });
        },

        // Comments
        createComment: function(videoId, author, content) {
            return request('/videos/' + videoId + '/comments', {
                method: 'POST',
                body: { author: author, content: content }
            });
        },

        deleteComment: function(id) {
            return request('/comments/' + id, {
                method: 'DELETE'
            });
        },

        // Files (documents)
        getFiles: function() {
            return request('/files');
        },

        uploadFile: function(file, label, onProgress) {
            return new Promise(function(resolve, reject) {
                var formData = new FormData();
                formData.append('file', file);
                formData.append('label', label);

                var xhr = new XMLHttpRequest();
                xhr.open('POST', BASE + '/upload/file');

                var token = AUTH.getToken();
                if (token) xhr.setRequestHeader('Authorization', 'Bearer ' + token);

                xhr.upload.onprogress = function(e) {
                    if (e.lengthComputable && onProgress) {
                        onProgress(Math.round((e.loaded / e.total) * 100));
                    }
                };

                xhr.onload = function() {
                    if (xhr.status === 401) {
                        AUTH.logout();
                        reject(new Error('登录已过期，请重新登录'));
                        return;
                    }
                    try {
                        var data = JSON.parse(xhr.responseText);
                        if (xhr.status >= 200 && xhr.status < 300) {
                            resolve(data);
                        } else {
                            reject(new Error(data.error || '上传失败'));
                        }
                    } catch(e) {
                        reject(new Error('解析响应失败'));
                    }
                };

                xhr.onerror = function() { reject(new Error('网络错误，上传失败')); };
                xhr.send(formData);
            });
        },

        // Admin
        admin: {
            getUsers: function() {
                return request('/admin/users');
            },

            getStats: function() {
                return request('/admin/stats');
            },

            createUser: function(data) {
                return request('/admin/users', {
                    method: 'POST',
                    body: data
                });
            },

            updateUserRole: function(id, role) {
                return request('/admin/users/' + id + '/role', {
                    method: 'PUT',
                    body: { role: role }
                });
            },

            deleteUser: function(id) {
                return request('/admin/users/' + id, {
                    method: 'DELETE'
                });
            }
        }
    };
})();
