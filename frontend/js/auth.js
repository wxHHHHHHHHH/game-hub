/* ============================================
   GameHub — Auth Module
   Login, logout, token management, permissions
   ============================================ */

const AUTH = (function() {
    const TOKEN_KEY = 'gamehub_token';
    const USER_KEY  = 'gamehub_user';

    let currentUser = null;

    // Permission matrix
    const PERMISSIONS = {
        ADMIN:   { addVideo: true,  deleteVideo: true,  deleteComment: true,  comment: true  },
        MEMBER:  { addVideo: true,  deleteVideo: false, deleteComment: false, comment: true  },
        VISITOR: { addVideo: false, deleteVideo: false, deleteComment: false, comment: true  },
    };

    function saveUser(user) {
        currentUser = user;
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    function loadUser() {
        try {
            const raw = localStorage.getItem(USER_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch(e) {
            return null;
        }
    }

    return {
        // Login via API
        login: async function(username, password) {
            const data = await API.login(username, password);
            localStorage.setItem(TOKEN_KEY, data.token);
            saveUser({
                userId: data.userId,
                username: data.username,
                displayName: data.displayName,
                role: data.role,
                avatarColor: data.avatarColor || CONFIG.AVATAR_COLORS[0],
            });
            return data;
        },

        // Logout
        logout: function() {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            currentUser = null;
        },

        // Get current user
        getUser: function() {
            if (!currentUser) {
                currentUser = loadUser();
            }
            return currentUser;
        },

        // Check if logged in
        isLoggedIn: function() {
            return !!this.getToken();
        },

        // Get JWT token
        getToken: function() {
            return localStorage.getItem(TOKEN_KEY);
        },

        // Permission check
        can: function(permission) {
            const user = this.getUser();
            if (!user) return false;
            const rolePerms = PERMISSIONS[user.role];
            return rolePerms ? rolePerms[permission] === true : false;
        },

        // Get role label
        getRoleLabel: function() {
            const user = this.getUser();
            if (!user) return '';
            const labels = { ADMIN: '👑 管理员', MEMBER: '🎮 成员', VISITOR: '👀 游客' };
            return labels[user.role] || '';
        },
    };
})();
