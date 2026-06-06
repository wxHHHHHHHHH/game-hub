/* ============================================
   GameHub — Environment Configuration
   ============================================
   LOCAL:   Open index.html directly, API at localhost:8080
   PROD:    Serve via nginx, API at same domain or custom URL
   ============================================ */

const CONFIG = (function() {
    // Detect if running locally (file:// or localhost)
    const isLocal = window.location.protocol === 'file:' ||
                    window.location.hostname === 'localhost' ||
                    window.location.hostname === '127.0.0.1';

    return {
        // API base URL — change for production
        // Local:  Spring Boot default at localhost:8080
        // Prod:   Same domain with nginx proxy, or full URL
        API_BASE: isLocal
            ? 'http://localhost:8080/api'
            : '/api',

        // App info
        APP_NAME: 'GameHub',
        APP_VERSION: '1.0.0',
        COMPANY_NAME: '中国波比集团',

        // Environment
        IS_LOCAL: isLocal,
        IS_PROD: !isLocal,

        // Bilibili embed URL — best possible quality params
        // high_quality=1 : request highest available quality
        // as_wide=1      : widescreen mode
        // danmaku=0      : disable barrage for cleaner video
        BILIBILI_EMBED: 'https://player.bilibili.com/player.html?bvid={BV}&page=1&high_quality=1&as_wide=1&danmaku=0&autoplay=0',

        // Bilibili API for video info (cover, title, description)
        BILIBILI_API: 'https://api.bilibili.com/x/web-interface/view?bvid={BV}',

        // Placeholder thumbnail
        PLACEHOLDER_THUMB: 'data:image/svg+xml,' + encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360">' +
            '<rect fill="#1a1a3e" width="640" height="360"/>' +
            '<text fill="#6a6a8a" x="320" y="180" text-anchor="middle" font-size="48" font-family="sans-serif">🎬</text>' +
            '</svg>'
        ),

        // Avatar colors
        AVATAR_COLORS: [
            '#ff00e5','#4d96ff','#6a6a8a','#ff6b6b','#ffd93d',
            '#6bcb77','#ff6b9d','#c44dff','#00d2ff','#ff9f43'
        ],

        // DPlayer CDN (for self-hosted video playback)
        DPLAYER_CSS: 'https://cdn.jsdelivr.net/npm/dplayer/dist/DPlayer.min.css',
        DPLAYER_JS: 'https://cdn.jsdelivr.net/npm/dplayer/dist/DPlayer.min.js',
        HLS_JS: 'https://cdn.jsdelivr.net/npm/hls.js/dist/hls.min.js',

        // Upload limits
        MAX_UPLOAD_SIZE: 2048,  // MB
        ALLOWED_VIDEO_TYPES: ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv', 'm4v'],
    };
})();
