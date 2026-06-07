/* ============================================
   GameHub — Main Application
   SPA routing, UI rendering, event handling
   ============================================ */

(function() {
    'use strict';

    // ============ DOM REFS ============
    const $ = function(sel) { return document.querySelector(sel); };
    const $$ = function(sel) { return document.querySelectorAll(sel); };

    // ============ STATE ============
    let currentView = 'list';
    let currentVideoId = null;
    let currentSort = 'latest';
    let currentSource = 'all';
    let dpInstance = null;
    let likedVideos = {};  // Track liked state per video

    // Demo fallback data
    const DEMO_VIDEOS = [
        { id:1, title:'CS2 五杀翻盘！绝境中的逆天操作', description:'在荒漠迷城这张图上，我们队伍在 12:3 落后的绝境下实现惊天翻盘！\n\n🏆 亮点时刻：\n• 0:45 A点三杀拿下关键局\n• 1:20 残局1v3绝杀\n• 2:10 最后一局五杀收尾', bilibiliBv:'BV1xx411c7mD', game:'CS2', thumbnailUrl:'https://picsum.photos/seed/cs2/640/360', videoType:'BILIBILI', videoUrl:null, likes:42, createdAt:'2024-12-28T20:30:00', comments:[] },
        { id:2, title:'幻兽帕鲁联机实况 — 建家第一天就遇到神兽！', description:'团队一起开荒幻兽帕鲁！第一天建家就遇到了一只闪光神兽，全员疯狂大叫 😂', bilibiliBv:'BV1xx411c7mD', game:'幻兽帕鲁', thumbnailUrl:'https://picsum.photos/seed/pal/640/360', videoType:'BILIBILI', videoUrl:null, likes:38, createdAt:'2024-12-25T15:00:00', comments:[] },
        { id:3, title:'英雄联盟五黑 — 最搞笑的翻车集锦', description:'说好的认真上分，结果变成了全员翻车现场。包含：闪现撞墙、反向大招、以及那个经典的"我先上你跟上"...', bilibiliBv:'BV1xx411c7mD', game:'英雄联盟', thumbnailUrl:'https://picsum.photos/seed/lol/640/360', videoType:'BILIBILI', videoUrl:null, likes:67, createdAt:'2024-12-20T10:15:00', comments:[] },
        { id:4, title:'致命公司 — 被幽灵追了整整十分钟！', description:'本期致命公司联机，被幽灵追了整整十分钟。全队笑到无法呼吸，最后全员团灭 😂💀', bilibiliBv:'BV1xx411c7mD', game:'致命公司', thumbnailUrl:'https://picsum.photos/seed/lethal/640/360', videoType:'BILIBILI', videoUrl:null, likes:25, createdAt:'2024-12-18T22:00:00', comments:[] },
        { id:5, title:'Valorant 竞技模式 — 新赛季定级赛全记录', description:'新赛季定级赛5场全记录！从青铜到钻石，我们的团队配合正在进化！🎯', bilibiliBv:'BV1xx411c7mD', game:'Valorant', thumbnailUrl:'https://picsum.photos/seed/val/640/360', videoType:'BILIBILI', videoUrl:null, likes:53, createdAt:'2024-12-15T18:45:00', comments:[] },
        { id:6, title:'年度集锦 — 2024 最精彩的100个瞬间', description:'整理了一整年的搞笑、高光、翻车瞬间。感谢 GameHub 每一位成员，这一年有你们真好 ❤️\n\n🎵 BGM: Legends Never Die', bilibiliBv:'BV1xx411c7mD', game:'综合集锦', thumbnailUrl:'https://picsum.photos/seed/high/640/360', videoType:'BILIBILI', videoUrl:null, likes:89, createdAt:'2024-12-31T23:59:00', comments:[] },
    ];

    const DEMO_COMMENTS = [
        { id:101, videoId:1, author:'老张', content:'这波操作太极限了！最后那个五杀我看了十遍 🔥🔥', createdAt:'2024-12-29T09:12:00' },
        { id:102, videoId:1, author:'Admin', content:'当时我的心脏都快跳出来了，还好赢了 😂', createdAt:'2024-12-29T10:30:00' },
        { id:103, videoId:1, author:'游客', content:'cs2的物理引擎真的太舒服了，爆头声音好爽', createdAt:'2024-12-29T14:55:00' },
        { id:201, videoId:2, author:'Admin', content:'哈哈哈哈建家第一天就遇到神兽是什么运气！', createdAt:'2024-12-26T11:00:00' },
        { id:301, videoId:3, author:'游客', content:'闪现撞墙那块我反复观看了二十遍，笑死', createdAt:'2024-12-21T00:15:00' },
        { id:302, videoId:3, author:'老张', content:'不是我！那个闪现撞墙绝对不是我！是延迟！', createdAt:'2024-12-21T08:20:00' },
    ];

    let demoVideos = [];
    let demoComments = [];
    let nextDemoVideoId = 100;
    let nextDemoCommentId = 1000;

    // ============ UTILS ============
    function esc(str) {
        if (!str) return '';
        return String(str).replace(/[&<>"']/g, function(c) {
            return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
        });
    }

    function timeAgo(dateStr) {
        if (!dateStr) return '';
        const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
        if (diff < 60) return '刚刚';
        if (diff < 3600) return Math.floor(diff / 60) + ' 分钟前';
        if (diff < 86400) return Math.floor(diff / 3600) + ' 小时前';
        if (diff < 2592000) return Math.floor(diff / 86400) + ' 天前';
        return dateStr.substring(0, 10);
    }

    function formatTime(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const pad = function(n) { return String(n).padStart(2, '0'); };
        return d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
    }

    function getAvatarColor(name) {
        if (!name) return CONFIG.AVATAR_COLORS[0];
        let hash = 0;
        for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
        return CONFIG.AVATAR_COLORS[Math.abs(hash) % CONFIG.AVATAR_COLORS.length];
    }

    // ============ IMAGE CROPPER ============
    let cropResolve = null, cropReject = null;
    let cropImg = null, cropBoxEl = null, cropCanvas = null;
    let cropStartX = 0, cropStartY = 0, cropBoxX = 0, cropBoxY = 0, cropBoxW = 0, cropBoxH = 0;
    let dragMode = null; // 'move' | 'resize'

    function openCropper(file) {
        return new Promise(function(resolve, reject) {
            cropResolve = resolve; cropReject = reject;
            var reader = new FileReader();
            reader.onload = function(e) {
                cropImg = new Image();
                cropImg.onload = function() {
                    $('#modal-crop').classList.add('active');
                    // Delay to let DOM reflow before canvas sizing
                    setTimeout(function() { initCropUI(); }, 50);
                };
                cropImg.onerror = function() {
                    showToast('图片加载失败，请尝试其他图片', 'error');
                    if (cropReject) cropReject(new Error('load failed'));
                };
                cropImg.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    function initCropUI() {
        cropCanvas = $('#crop-canvas');
        cropBoxEl = $('#crop-box');
        var container = $('#crop-container');
        if (!cropCanvas || !cropBoxEl || !container || !cropImg) {
            console.error('Crop elements not found');
            return;
        }

        var maxW = container.clientWidth || 680;
        var maxH = 420;
        var scale = Math.min(1, maxW / cropImg.width, maxH / cropImg.height);
        cropCanvas.width = Math.round(cropImg.width * scale);
        cropCanvas.height = Math.round(cropImg.height * scale);
        cropCanvas.style.width = cropCanvas.width + 'px';
        cropCanvas.style.height = cropCanvas.height + 'px';

        var ctx = cropCanvas.getContext('2d');
        ctx.clearRect(0, 0, cropCanvas.width, cropCanvas.height);
        ctx.drawImage(cropImg, 0, 0, cropCanvas.width, cropCanvas.height);

        // Init crop box at center, 16:9
        var bw = Math.min(cropCanvas.width * 0.8, cropCanvas.width);
        var bh = Math.round(bw * 9 / 16);
        if (bh > cropCanvas.height) { bh = Math.round(cropCanvas.height * 0.8); bw = Math.round(bh * 16 / 9); }
        cropBoxX = Math.round((cropCanvas.width - bw) / 2);
        cropBoxY = Math.round((cropCanvas.height - bh) / 2);
        cropBoxW = bw; cropBoxH = bh;
        updateCropBoxPos();

        // Clear old events
        document.onmousemove = document.ontouchmove = null;
        document.onmouseup = document.ontouchend = null;

        // Events for crop box
        cropBoxEl.addEventListener('mousedown', function(e) { dragMode = 'move'; startDrag(e); });
        cropBoxEl.addEventListener('touchstart', function(e) { dragMode = 'move'; startDrag(e); }, {passive: false});
        var handle = $('#crop-handle');
        if (handle) {
            handle.addEventListener('mousedown', function(e) { dragMode = 'resize'; e.stopPropagation(); startDrag(e); });
            handle.addEventListener('touchstart', function(e) { dragMode = 'resize'; e.stopPropagation(); startDrag(e); }, {passive: false});
        }
        document.addEventListener('mousemove', function(e) { doDrag(e); });
        document.addEventListener('touchmove', function(e) { doDrag(e); }, {passive: false});
        document.addEventListener('mouseup', function() { dragMode = null; });
        document.addEventListener('touchend', function() { dragMode = null; });
    }

    function startDrag(e) {
        var t = e.touches ? e.touches[0] : e;
        cropStartX = t.clientX; cropStartY = t.clientY;
        e.preventDefault();
    }
    function doDrag(e) {
        if (!dragMode) return;
        var t = e.touches ? e.touches[0] : e;
        var dx = t.clientX - cropStartX, dy = t.clientY - cropStartY;
        cropStartX = t.clientX; cropStartY = t.clientY;
        var maxX = cropCanvas.width - cropBoxW, maxY = cropCanvas.height - cropBoxH;

        if (dragMode === 'move') {
            cropBoxX = Math.max(0, Math.min(maxX, cropBoxX + dx));
            cropBoxY = Math.max(0, Math.min(maxY, cropBoxY + dy));
        } else if (dragMode === 'resize') {
            var nw = cropBoxW + dx;
            var nh = nw * 9 / 16;
            if (nw >= 80 && nh >= 45 && cropBoxX + nw <= cropCanvas.width && cropBoxY + nh <= cropCanvas.height) {
                cropBoxW = nw; cropBoxH = nh;
            }
        }
        updateCropBoxPos();
        e.preventDefault();
    }

    function updateCropBoxPos() {
        cropBoxEl.style.left = cropBoxX + 'px';
        cropBoxEl.style.top = cropBoxY + 'px';
        cropBoxEl.style.width = cropBoxW + 'px';
        cropBoxEl.style.height = cropBoxH + 'px';
    }

    function confirmCrop() {
        if (!cropImg || !cropResolve) return;
        // Crop from original image coordinates
        var scaleX = cropImg.width / cropCanvas.width;
        var scaleY = cropImg.height / cropCanvas.height;
        var sx = cropBoxX * scaleX, sy = cropBoxY * scaleY;
        var sw = cropBoxW * scaleX, sh = cropBoxH * scaleY;

        var canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 360;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(cropImg, sx, sy, sw, sh, 0, 0, 640, 360);
        canvas.toBlob(function(blob) {
            closeCropModal();
            cropResolve(blob);
        }, 'image/jpeg', 0.8);
    }

    function closeCropModal() {
        $('#modal-crop').classList.remove('active');
        document.onmousemove = document.ontouchmove = null;
        document.onmouseup = document.ontouchend = null;
        cropResolve = null; cropReject = null;
        cropImg = null; cropCanvas = null; cropBoxEl = null;
    }

    // ============ UTILS: Compress ============
    function compressImage(file, maxWidth, quality) {
        return new Promise(function(resolve, reject) {
            var reader = new FileReader();
            reader.onload = function(e) {
                var img = new Image();
                img.onload = function() {
                    var w = img.width, h = img.height;
                    if (w > maxWidth) { h = Math.round(h * maxWidth / w); w = maxWidth; }
                    var canvas = document.createElement('canvas');
                    canvas.width = w; canvas.height = h;
                    var ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, w, h);
                    canvas.toBlob(function(blob) {
                        if (blob) resolve(blob);
                        else resolve(file); // fallback to original
                    }, 'image/jpeg', quality);
                };
                img.onerror = function() { resolve(file); };
                img.src = e.target.result;
            };
            reader.onerror = function() { resolve(file); };
            reader.readAsDataURL(file);
        });
    }

    function showToast(message, type) {
        type = type || 'success';
        const toast = document.createElement('div');
        toast.className = 'toast ' + type;
        toast.textContent = message;
        document.getElementById('toast-container').appendChild(toast);
        setTimeout(function() { toast.remove(); }, 3000);
    }

    // ============ VIEW SWITCHING ============
    function switchView(viewName) {
        // Stop any playing video before switching
        stopAllPlayers();
        currentView = viewName;
        // Hide all views
        $$('.view').forEach(function(v) { v.classList.remove('active'); });
        const btnAdd = $('#btn-add-video');
        destroyDPlayer();

        switch (viewName) {
            case 'list':
                $('#view-list').classList.add('active');
                if (btnAdd) btnAdd.style.display = AUTH.can('addVideo') ? '' : 'none';
                renderVideoList(); initCarousel();
                break;
            case 'intro':
                $('#view-intro').classList.add('active');
                if (btnAdd) btnAdd.style.display = 'none';
                renderIntroPage();
                break;
            case 'news':
                $('#view-news').classList.add('active');
                if (btnAdd) btnAdd.style.display = 'none';
                renderNewsList();
                break;
            case 'news-detail':
                $('#view-news-detail').classList.add('active');
                if (btnAdd) btnAdd.style.display = 'none';
                break;
            case 'contact':
                $('#view-contact').classList.add('active');
                if (btnAdd) btnAdd.style.display = 'none';
                break;
            case 'detail':
                $('#view-detail').classList.add('active');
                if (btnAdd) btnAdd.style.display = 'none';
                break;
            case 'dashboard':
                $('#view-dashboard').classList.add('active');
                if (btnAdd) btnAdd.style.display = 'none';
                renderDashboard('stats');
                break;
            case 'gallery':
                $('#view-gallery').classList.add('active');
                if (btnAdd) btnAdd.style.display = 'none';
                renderGallery();
                break;
        }

        $$('.nav-link[data-view]').forEach(function(l) {
            l.classList.toggle('active', l.dataset.view === viewName);
        });
    }

    // ============ COMPANY INTRO PAGE ============
    async function renderIntroPage() {
        // Show/hide file upload for admin
        const fileArea = $('#file-upload-area');
        if (fileArea && AUTH.getUser() && AUTH.getUser().role === 'ADMIN') {
            fileArea.style.display = 'block';
        }
        // Load files
        await loadFileList();
    }

    async function loadFileList() {
        const listEl = $('#file-list');
        if (!listEl) return;

        listEl.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

        let files = [];
        try {
            files = await API.getFiles();
        } catch(e) {
            // Demo files
            files = [
                { id: 1, fileName: '波比圈公司简介.pdf', fileSize: 2457600, createdAt: '2025-01-15' },
                { id: 2, fileName: '波比圈组织架构图.pdf', fileSize: 1280000, createdAt: '2025-02-20' },
                { id: 3, fileName: '关于规范内部管理的通知（红头文件）.pdf', fileSize: 512000, createdAt: '2025-03-10' },
                { id: 4, fileName: '集团2025年度工作计划.pdf', fileSize: 3200000, createdAt: '2025-04-01' },
            ];
        }

        if (!files || files.length === 0) {
            listEl.innerHTML = '<div class="no-comments">暂无文件资料</div>';
            return;
        }

        listEl.innerHTML = files.map(function(f) {
            const size = f.fileSize
                ? (f.fileSize > 1048576 ? (f.fileSize / 1048576).toFixed(1) + ' MB' : Math.round(f.fileSize / 1024) + ' KB')
                : '';
            return '<div class="file-item">' +
                '<div class="file-icon">📄</div>' +
                '<div class="file-info">' +
                    '<span class="file-name">' + esc(f.fileName) + '</span>' +
                    '<span class="file-meta">' + (f.createdAt || '') + ' · ' + size + '</span>' +
                '</div>' +
                '<div class="file-actions">' +
                    '<button class="btn-view" onclick="APP_ACTIONS.viewFile(' + f.id + ')">👁 查看</button>' +
                    '<button class="btn-download" onclick="APP_ACTIONS.downloadFile(' + f.id + ')">⬇ 下载</button>' +
                    (AUTH.getUser() && AUTH.getUser().role === 'ADMIN'
                        ? '<button class="btn-delete-user" onclick="APP_ACTIONS.deleteFile(' + f.id + ')">🗑</button>' : '') +
                '</div>' +
            '</div>';
        }).join('');
    }

    async function handleFileUpload() {
        const labelEl = $('#file-label');
        const fileInput = $('#file-upload-input');
        const label = labelEl.value.trim();
        if (!label) { showToast('请先输入文件名称', 'error'); labelEl.focus(); return; }

        fileInput.click();
        fileInput.onchange = async function() {
            const file = fileInput.files[0];
            if (!file) return;
            if (file.size > 100 * 1024 * 1024) {
                showToast('文件过大，最大支持 100MB', 'error'); return;
            }

            $('#file-progress').style.display = 'block';
            try {
                const result = await API.uploadFile(file, label, function(pct) {
                    $('#file-progress-fill').style.width = pct + '%';
                    $('#file-progress-text').textContent = '上传中... ' + pct + '%';
                });
                $('#file-progress-text').textContent = '✅ 上传完成';
                $('#file-progress').style.display = 'none';
                labelEl.value = '';
                showToast('✅ 文件上传成功！');
                await loadFileList();
            } catch(e) {
                $('#file-progress').style.display = 'none';
                showToast('上传失败: ' + e.message, 'error');
            }
        };
    }

    // Exposed globally for inline onclick
    window.APP_ACTIONS = {
        viewFile: function(fileId) {
            window.open(CONFIG.API_BASE + '/files/' + fileId + '/view', '_blank');
        },
        downloadFile: function(fileId) {
            window.open(CONFIG.API_BASE + '/files/' + fileId + '/download', '_blank');
        },
        deleteFile: async function(fileId) {
            if (!confirm('确定删除该文件吗？')) return;
            try { await API.deleteFile(fileId); showToast('已删除'); await loadFileList(); } catch(e) { showToast('删除失败','error'); }
        },
        editVideo: function(videoId) {
            openEditVideoModal(videoId);
        }
    };

    // ============ CAROUSEL ============
    let carouselSlides = [];
    let carouselIndex = 0;
    let carouselTimer = null;

    async function initCarousel() {
        try {
            const banners = await API.getBanners();
            carouselSlides = banners && banners.length > 0 ? banners : [
                { title:'波比圈', imageUrl:'', linkUrl:'', sub:'诚信 · 创新 · 共赢' },
                { title:'集团成立10周年', imageUrl:'', linkUrl:'', sub:'十年砥砺前行，再创辉煌' },
                { title:'2026年度工作会议', imageUrl:'', linkUrl:'', sub:'凝心聚力，共谋发展' }
            ];
        } catch(e) {
            carouselSlides = [
                { title:'波比圈', imageUrl:'', linkUrl:'', sub:'诚信 · 创新 · 共赢' },
                { title:'集团成立10周年', imageUrl:'', linkUrl:'', sub:'十年砥砺前行，再创辉煌' },
                { title:'2026年度工作会议', imageUrl:'', linkUrl:'', sub:'凝心聚力，共谋发展' }
            ];
        }

        const track = $('#carousel-track');
        const dots = $('#carousel-dots');
        if (!track) return;

        const colors = ['linear-gradient(135deg,#C8102E,#1a1a3e)','linear-gradient(135deg,#1a3a5c,#0a1a2e)','linear-gradient(135deg,#5c1a3a,#1a1a3e)'];
        track.innerHTML = carouselSlides.map(function(s, i) {
            const bg = s.imageUrl
                ? '<img src="' + esc(s.imageUrl) + '" alt="">'
                : '<div style="position:absolute;inset:0;background:' + (colors[i] || colors[0]) + ';"></div>';
            return '<div class="carousel-slide"' + (s.linkUrl ? ' onclick="window.open(\'' + esc(s.linkUrl) + '\',\'_blank\')" style="cursor:pointer;"' : '') + '>' +
                '<div class="carousel-bg" style="position:relative;">' + bg +
                '<h2 style="position:relative;z-index:1;">' + esc(s.title) + '</h2>' +
                '<p style="position:relative;z-index:1;">' + esc(s.sub || s.imageUrl ? '' : '') + '</p>' +
                '</div></div>';
        }).join('');

        dots.innerHTML = carouselSlides.map(function(_, i) {
            return '<button class="carousel-dot' + (i === 0 ? ' active' : '') + '" data-index="' + i + '"></button>';
        }).join('');

        dots.querySelectorAll('.carousel-dot').forEach(function(d) {
            d.addEventListener('click', function() { goToSlide(parseInt(d.dataset.index)); });
        });

        carouselIndex = 0;
        startCarouselAuto();
    }

    function goToSlide(index) {
        carouselIndex = index;
        $('#carousel-track').style.transform = 'translateX(-' + (index * 100) + '%)';
        $$('.carousel-dot').forEach(function(d, i) { d.classList.toggle('active', i === index); });
        startCarouselAuto();
    }

    function startCarouselAuto() {
        clearInterval(carouselTimer);
        if (carouselSlides.length < 2) return;
        carouselTimer = setInterval(function() {
            goToSlide((carouselIndex + 1) % carouselSlides.length);
        }, 5000);
    }

    // ============ NEWS ============
    let currentNewsId = null;

    async function renderNewsList() {
        const grid = $('#news-grid');
        grid.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

        let news = [];
        try { news = await API.getNewsList(); } catch(e) { /* demo below */ }

        if (!news || news.length === 0) {
            news = [
                { id:1, title:'波比圈2026年度工作会议圆满召开', summary:'集团于2026年3月召开年度工作会议…', category:'集团动态', pinned:true, createdAt:'2026-03-15T10:00:00' },
                { id:2, title:'关于进一步加强集团内部管理的通知', summary:'为进一步规范集团内部管理流程…', category:'政策文件', pinned:false, createdAt:'2026-02-28T14:00:00' },
                { id:3, title:'波比圈荣获2025年度行业创新奖', summary:'在第15届行业峰会上，集团荣获年度创新企业奖…', category:'行业资讯', pinned:false, createdAt:'2026-01-20T09:00:00' },
            ];
        }

        const isAdmin = AUTH.getUser() && AUTH.getUser().role === 'ADMIN';
        const bar = $('#news-admin-bar');
        if (bar) bar.style.display = isAdmin ? 'block' : 'none';

        grid.innerHTML = news.map(function(n) {
            return '<div class="news-card" data-id="' + n.id + '">' +
                '<span class="news-cat' + (n.pinned ? ' pinned' : '') + '">' + (n.pinned ? '📌 ' : '') + esc(n.category || '集团动态') + '</span>' +
                '<h4>' + esc(n.title) + '</h4>' +
                (n.summary ? '<div class="news-summary">' + esc(n.summary) + '</div>' : '') +
                '<div class="news-date">' + formatTime(n.createdAt) + '</div>' +
                (isAdmin ? '<button class="btn-delete-comment" style="float:right;margin-top:-20px;" onclick="event.stopPropagation();ADMIN_ACTIONS.deleteNews(' + n.id + ')">删除</button>' : '') +
            '</div>';
        }).join('');

        grid.querySelectorAll('.news-card').forEach(function(card) {
            card.addEventListener('click', function() { openNewsDetail(parseInt(card.dataset.id)); });
        });
    }

    async function openNewsDetail(newsId) {
        currentNewsId = newsId;
        switchView('news-detail');
        const wrap = $('#news-detail-content');
        wrap.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

        let news;
        try { news = await API.getNewsDetail(newsId); } catch(e) {}
        if (!news) news = { title:'新闻不存在', content:'该新闻已被删除', category:'', createdAt:'' };

        wrap.innerHTML = '<h1>' + esc(news.title) + '</h1>' +
            '<div class="news-detail-meta"><span>' + esc(news.category || '') + '</span><span>' + formatTime(news.createdAt) + '</span></div>' +
            '<div class="news-detail-body">' + esc(news.content || news.summary || '暂无正文') + '</div>';
    }

    function openNewsModal() {
        $('#modal-news').classList.add('active');
        $('#news-title').focus();
    }
    function closeNewsModal() {
        $('#modal-news').classList.remove('active');
        $('#form-add-news').reset();
    }
    async function handleAddNews(e) {
        e.preventDefault();
        const title = $('#news-title').value.trim();
        const content = $('#news-content').value.trim();
        if (!title || !content) { showToast('请填写标题和正文', 'error'); return; }

        const data = {
            title: title,
            summary: $('#news-summary').value.trim(),
            content: content,
            category: $('#news-category').value.trim() || '集团动态'
        };

        try { await API.createNews(data); } catch(err) { showToast('发布失败: ' + err.message, 'error'); return; }
        closeNewsModal();
        showToast('📰 新闻发布成功！');
        renderNewsList();
    }

    window.ADMIN_ACTIONS = window.ADMIN_ACTIONS || {};
    window.ADMIN_ACTIONS.deleteNews = async function(id) {
        if (!confirm('确定删除该新闻？')) return;
        try { await API.deleteNews(id); showToast('已删除'); renderNewsList(); } catch(e) { showToast('删除失败', 'error'); }
    };

    // ============ GALLERY ============
    let galleryPhotos = [];
    let lightboxIndex = 0;

    async function renderGallery() {
        const grid = $('#gallery-grid');
        grid.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

        try { galleryPhotos = await API.getPhotos(); } catch(e) { galleryPhotos = []; }

        var canUpload = AUTH.getUser() && (AUTH.getUser().role === 'ADMIN' || AUTH.getUser().role === 'MEMBER');
        var canDelete = AUTH.getUser() && AUTH.getUser().role === 'ADMIN';
        var bar = $('#gallery-upload-bar');
        if (bar) bar.style.display = canUpload ? 'block' : 'none';

        if (!galleryPhotos || galleryPhotos.length === 0) {
            grid.innerHTML = '<div class="no-comments" style="padding:80px 0;">📷 还没有照片<br>点击上方按钮上传第一张吧！</div>';
            return;
        }

        // Group by photo date
        const grouped = {};
        galleryPhotos.forEach(function(p) {
            const day = (p.photoDate || p.createdAt || '').substring(0, 10) || '未分类';
            if (!grouped[day]) grouped[day] = [];
            grouped[day].push(p);
        });

        const dates = Object.keys(grouped).sort().reverse();

        grid.innerHTML = '<div class="timeline">' + dates.map(function(date) {
            const photos = grouped[date];
            return '<div class="timeline-date">📅 ' + date + ' <span style="font-size:13px;font-weight:400;color:var(--text-muted);">(' + photos.length + '张)</span></div>' +
                '<div class="timeline-row">' + photos.map(function(p, i) {
                    const thumb = p.thumbnailUrl || p.imageUrl || '';
                    const idx = galleryPhotos.indexOf(p);
                    return '<div class="timeline-item" data-idx="' + idx + '">' +
                        '<img src="' + esc(thumb) + '" alt="' + esc(p.caption || '') + '" loading="lazy" onerror="this.src=\'' + CONFIG.PLACEHOLDER_THUMB + '\'">' +
                        '<div class="gal-caption" style="' + (p.caption || p.uploaderName ? '' : 'opacity:0;') + '">' +
                            (p.caption ? esc(p.caption) : '') +
                            (p.uploaderName ? '<small style="display:block;opacity:0.7;">📷 ' + esc(p.uploaderName) + '</small>' : '') +
                        '</div>' +
                        (canDelete ? '<button class="gal-del" onclick="event.stopPropagation();GALLERY_ACTIONS.deletePhoto(' + p.id + ')">🗑</button>' : '') +
                    '</div>';
                }).join('') + '</div>';
        }).join('') + '</div>';

        grid.querySelectorAll('.timeline-item').forEach(function(item) {
            item.addEventListener('click', function() {
                openLightbox(parseInt(item.dataset.idx));
            });
        });
    }

    let touchStartX = 0, touchStartY = 0;

    function openLightbox(idx) {
        lightboxIndex = idx;
        updateLightbox();
        $('#lightbox').classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    function closeLightbox() {
        $('#lightbox').classList.remove('active');
        document.body.style.overflow = '';
    }
    function updateLightbox() {
        const p = galleryPhotos[lightboxIndex];
        if (!p) return;
        // Show thumbnail first (fast), then load original
        $('#lightbox-img').src = p.thumbnailUrl || p.imageUrl;
        $('#lightbox-caption').textContent = (p.caption || '') + (p.album ? ' · ' + p.album : '') + (p.uploaderName ? ' · 📷 ' + p.uploaderName : '');
        // Original view button
        const origUrl = p.imageUrl;
        const bar = document.querySelector('.lightbox-bar');
        if (!bar) {
            const b = document.createElement('div');
            b.className = 'lightbox-bar';
            b.innerHTML = '<a class="btn-original" id="btn-original" href="#" target="_blank">🔍 查看原图</a>';
            $('#lightbox-caption').after(b);
        }
        const btn = $('#btn-original');
        if (btn) btn.href = origUrl;
    }
    function lightboxNext() { lightboxIndex = (lightboxIndex + 1) % galleryPhotos.length; updateLightbox(); }
    function lightboxPrev() { lightboxIndex = (lightboxIndex - 1 + galleryPhotos.length) % galleryPhotos.length; updateLightbox(); }

    async function handlePhotoUpload() {
        const input = $('#photo-upload-input');
        const dateEl = $('#photo-date');
        input.click();
        input.onchange = async function() {
            const files = input.files;
            if (!files || !files.length) return;
            const date = dateEl ? dateEl.value : '';
            showToast('上传中，正在压缩处理...');
            var uploader = AUTH.getUser() ? AUTH.getUser().displayName : '';
            for (let f of files) {
                try { await API.uploadPhoto(f, '', '默认相册', date, uploader); } catch(e) { showToast('上传失败: '+e.message,'error'); }
            }
            showToast('✅ 上传完成！');
            await renderGallery();
        };
    }

    window.GALLERY_ACTIONS = {
        deletePhoto: async function(id) {
            if (!confirm('确定删除该照片？')) return;
            try { await API.deletePhoto(id); showToast('已删除'); await renderGallery(); } catch(e) { showToast('删除失败','error'); }
        }
    };

    // ============ AUDIT LOG HELPER ============
    function auditLog(action, detail) {
        const user = AUTH.getUser();
        if (!user || user.role !== 'ADMIN') return;
        API.addLog(action, user.displayName, detail).catch(function(){});
    }

    // ============ SEARCH ============
    let searchTimer;
    function initSearch() {
        const input = $('#search-input');
        const clearBtn = $('#btn-search-clear');
        if (!input) return;

        input.addEventListener('input', function() {
            clearTimeout(searchTimer);
            searchTimer = setTimeout(function() {
                const val = input.value.trim();
                clearBtn.style.display = val ? 'block' : 'none';
                renderVideoList(val);
            }, 300);
        });

        clearBtn.addEventListener('click', function() {
            input.value = '';
            clearBtn.style.display = 'none';
            renderVideoList('');
        });
    }

    // ============ SORT ============
    function setSort(sort) {
        currentSort = sort;
        $$('.sort-btn').forEach(function(btn) {
            btn.classList.toggle('active', btn.dataset.sort === sort);
        });
        renderVideoList();
    }

    function setSourceFilter(src) {
        currentSource = src;
        $$('.source-btn').forEach(function(btn) {
            btn.classList.toggle('active', btn.dataset.src === src);
        });
        renderVideoList();
    }

    // ============ VIDEO LIST ============
    async function renderVideoList(searchTerm) {
        const grid = $('#video-grid');
        const empty = $('#empty-state');
        const loading = $('#loading-list');

        grid.innerHTML = '';
        empty.style.display = 'none';
        loading.style.display = 'block';

        let videos = [];

        try {
            if (searchTerm && searchTerm.trim()) {
                videos = await API.getVideosBySearch(searchTerm.trim());
            } else if (currentSource !== 'all') {
                videos = await API.getVideosByType(currentSource);
            } else {
                videos = await API.getVideos(currentSort);
            }
        } catch(e) {
            if (CONFIG.IS_LOCAL) {
                console.log('API not available, using demo data');
                videos = demoVideos.length > 0 ? demoVideos : DEMO_VIDEOS;
                if (demoVideos.length === 0) demoVideos = JSON.parse(JSON.stringify(DEMO_VIDEOS));
                if (demoComments.length === 0) demoComments = JSON.parse(JSON.stringify(DEMO_COMMENTS));
                // Sort demo data
                if (currentSort === 'hot') {
                    videos = videos.sort(function(a, b) { return (b.likes || 0) - (a.likes || 0); });
                } else {
                    videos = videos.sort(function(a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
                }
            } else {
                showToast('加载失败: ' + e.message, 'error');
                loading.style.display = 'none';
                return;
            }
        }

        loading.style.display = 'none';

        if (!videos || videos.length === 0) {
            empty.style.display = 'block';
            updateStats(0, 0);
            return;
        }

        updateStats(videos.length, demoComments.length);

        // Load liked state from localStorage
        loadLikedState();

        grid.innerHTML = videos.map(function(v) {
            const gameTag = v.game ? '<span class="card-game">' + esc(v.game) + '</span>' : '';
            const isNew = v.createdAt && (new Date() - new Date(v.createdAt)) < 86400000 * 7;
            const badge = isNew ? '<span class="card-badge new">NEW</span>' : (v.game === '综合集锦' ? '<span class="card-badge">🔥</span>' : '');
            const sourceBadge = v.videoType === 'LOCAL' ? '<span class="card-source cloud">☁️ 123云盘</span>' : '<span class="card-source bili">📺 B站</span>';
            const thumb = v.thumbnailUrl || CONFIG.PLACEHOLDER_THUMB;
            const likes = v.likes || 0;

            return '<div class="video-card" data-id="' + v.id + '">' +
                '<div class="card-thumb">' +
                    '<img src="' + esc(thumb) + '" alt="" loading="lazy" onerror="this.src=\'' + CONFIG.PLACEHOLDER_THUMB + '\'">' +
                    '<div class="card-overlay"><div class="play-icon">▶</div></div>' +
                    badge + sourceBadge +
                    '<div class="card-likes">❤ ' + likes + '</div>' +
                '</div>' +
                '<div class="card-body">' +
                    '<div class="card-title">' + esc(v.title) + '</div>' +
                    '<div class="card-meta">' + gameTag + '<span class="card-time">' + timeAgo(v.createdAt) + '</span></div>' +
                '</div>' +
            '</div>';
        }).join('');

        grid.querySelectorAll('.video-card').forEach(function(card) {
            card.addEventListener('click', function() {
                openVideoDetail(parseInt(card.dataset.id));
            });
        });
    }

    function loadLikedState() {
        try {
            const stored = localStorage.getItem('gamehub_likes');
            if (stored) likedVideos = JSON.parse(stored);
        } catch(e) {
            likedVideos = {};
        }
    }

    function saveLikedState() {
        localStorage.setItem('gamehub_likes', JSON.stringify(likedVideos));
    }

    function updateStats(vCount, cCount) {
        animateNumber('stat-videos', vCount);
        animateNumber('stat-comments', cCount);
        const mEl = document.getElementById('stat-members');
        if (mEl) mEl.textContent = '8';
    }

    function animateNumber(id, target) {
        const el = document.getElementById(id);
        if (!el) return;
        let cur = 0;
        const step = Math.ceil(target / 20) || 1;
        const timer = setInterval(function() {
            cur += step;
            if (cur >= target) { cur = target; clearInterval(timer); }
            el.textContent = cur;
        }, 30);
    }

    // ============ DPLAYER ============
    function initDPlayer(videoUrl) {
        destroyDPlayer();
        const container = $('#dplayer-container');
        if (!container) return;

        // Determine if HLS stream
        const isHls = videoUrl.endsWith('.m3u8');

        let dpOptions = {
            container: container,
            autoplay: false,
            theme: '#ff00e5',
            lang: 'zh-cn',
            screenshot: true,
            hotkey: true,
            preload: 'auto',
            volume: 0.7,
            video: {}
        };

        if (isHls && window.Hls && Hls.isSupported()) {
            dpOptions.video = {
                type: 'customHls',
                customType: {
                    customHls: function(video, player) {
                        const hls = new Hls();
                        hls.loadSource(videoUrl);
                        hls.attachMedia(video);
                    }
                }
            };
        } else {
            dpOptions.video = {
                url: videoUrl
            };
        }

        dpInstance = new DPlayer(dpOptions);
    }

    function destroyDPlayer() {
        if (dpInstance) {
            try { dpInstance.destroy(); } catch(e) {}
            dpInstance = null;
        }
    }

    function stopAllPlayers() {
        // Stop DPlayer
        destroyDPlayer();
        // Stop HTML5 video elements
        document.querySelectorAll('video').forEach(function(v) { v.pause(); v.src = ''; });
        // Remove iframe (B站) - clear the wrapper content
        var iframeWrappers = document.querySelectorAll('.video-player-wrapper');
        iframeWrappers.forEach(function(w) { w.innerHTML = ''; });
    }

    // ============ LIKE ============
    async function handleLike(videoId) {
        loadLikedState();
        const isLiked = likedVideos[videoId];
        const btn = $('#btn-like');
        const countEl = $('#like-count');

        if (isLiked) {
            try {
                const res = await API.unlikeVideo(videoId);
                likedVideos[videoId] = false;
                if (countEl) countEl.textContent = res.likes;
                if (btn) btn.classList.remove('liked');
                if (btn) btn.innerHTML = '❤ 点赞 <span class="like-count" id="like-count">' + res.likes + '</span>';
            } catch(e) {
                // Demo fallback
                if (CONFIG.IS_LOCAL) {
                    const video = findDemoVideo(videoId);
                    if (video) { video.likes = Math.max(0, (video.likes || 0) - 1); }
                    likedVideos[videoId] = false;
                    if (countEl) countEl.textContent = video.likes;
                    if (btn) { btn.classList.remove('liked'); btn.innerHTML = '❤ 点赞 <span class="like-count" id="like-count">' + video.likes + '</span>'; }
                }
            }
        } else {
            try {
                const res = await API.likeVideo(videoId);
                likedVideos[videoId] = true;
                if (countEl) countEl.textContent = res.likes;
                if (btn) btn.classList.add('liked');
                if (btn) btn.innerHTML = '❤ 已赞 <span class="like-count" id="like-count">' + res.likes + '</span>';
            } catch(e) {
                // Demo fallback
                if (CONFIG.IS_LOCAL) {
                    const video = findDemoVideo(videoId);
                    if (video) { video.likes = (video.likes || 0) + 1; }
                    likedVideos[videoId] = true;
                    if (countEl) countEl.textContent = video.likes;
                    if (btn) { btn.classList.add('liked'); btn.innerHTML = '❤ 已赞 <span class="like-count" id="like-count">' + video.likes + '</span>'; }
                }
            }
        }
        saveLikedState();
    }

    function findDemoVideo(id) {
        const allVideos = demoVideos.length > 0 ? demoVideos : DEMO_VIDEOS;
        return allVideos.find(function(v) { return v.id === id; });
    }

    // ============ VIDEO DETAIL ============
    async function openVideoDetail(videoId) {
        currentVideoId = videoId;
        switchView('detail');

        const detailEl = $('#video-detail');
        detailEl.innerHTML = '<div class="loading"><div class="spinner"></div><p>加载中...</p></div>';
        window.scrollTo({ top: 0, behavior: 'smooth' });

        let video, comments;

        try {
            video = await API.getVideo(videoId);
            comments = video.comments || [];
        } catch(e) {
            if (CONFIG.IS_LOCAL) {
                const allVideos = demoVideos.length > 0 ? demoVideos : DEMO_VIDEOS;
                video = allVideos.find(function(v) { return v.id === videoId; });
                if (!video) { detailEl.innerHTML = '<div class="empty-state"><h3>视频不存在</h3></div>'; return; }
                const allComments = demoComments.length > 0 ? demoComments : DEMO_COMMENTS;
                comments = allComments.filter(function(c) { return c.videoId === videoId; });
            } else {
                detailEl.innerHTML = '<div class="empty-state"><h3>加载失败</h3><p>' + esc(e.message) + '</p></div>';
                return;
            }
        }

        const isLocal = video.videoType === 'LOCAL';
        const bv = video.bilibiliBv || '';
        const gameTag = video.game ? '<span class="game-tag">🎮 ' + esc(video.game) + '</span>' : '';
        const canEdit = AUTH.getUser() && (AUTH.getUser().role === 'ADMIN' || (AUTH.getUser().role === 'MEMBER' && video.uploaderId === AUTH.getUser().userId));
        const actions = (AUTH.can('deleteVideo') || canEdit)
            ? '<div class="video-actions">' +
                (canEdit ? '<button class="btn btn-primary btn-sm" id="btn-edit-video" style="margin-right:8px;">✏️ 编辑</button>' : '') +
                (AUTH.can('deleteVideo') ? '<button class="btn-danger" id="btn-delete-video">🗑 删除</button>' : '') +
              '</div>' : '';
        const user = AUTH.getUser();
        const authorValue = user ? user.displayName : '';

        loadLikedState();
        const isLiked = likedVideos[videoId];
        const likes = video.likes || 0;
        const likeBtnClass = isLiked ? 'btn-like liked' : 'btn-like';

        // Player section
        let playerHtml;
        if (isLocal && video.videoUrl) {
            // 123云盘直链 - use HTML5 video player
            playerHtml = '<div class="video-player-wrapper">' +
                '<video controls autoplay playsinline style="width:100%;height:100%;background:#000;" preload="metadata">' +
                '<source src="' + esc(video.videoUrl) + '" type="video/mp4">' +
                '您的浏览器不支持视频播放</video></div>';
        } else if (bv) {
            const embedUrl = CONFIG.BILIBILI_EMBED.replace('{BV}', bv);
            playerHtml = '<div class="video-player-wrapper"><iframe src="' + embedUrl + '" allowfullscreen="true" allow="autoplay; encrypted-media" sandbox="allow-scripts allow-same-origin allow-popups allow-presentation"></iframe></div>';
        } else {
            playerHtml = '<div style="display:flex;align-items:center;justify-content:center;height:300px;color:var(--text-muted);background:var(--bg-secondary);border-radius:var(--radius-sm);">未提供视频来源</div>';
        }

        detailEl.innerHTML =
            playerHtml +
            '<div class="video-info">' +
                '<h1>' + esc(video.title) + '</h1>' +
                '<div class="video-meta">' +
                    '<span>📅 ' + formatTime(video.createdAt) + '</span>' +
                    (bv ? '<span>📺 ' + esc(bv) + '</span>' : '') +
                    gameTag +
                '</div>' +
                '<div class="video-actions">' +
                    '<button class="' + likeBtnClass + '" id="btn-like" onclick="event.stopPropagation();">' +
                        (isLiked ? '❤ 已赞' : '❤ 点赞') +
                        ' <span class="like-count" id="like-count">' + likes + '</span>' +
                    '</button>' +
                    (actions ? actions.replace('<div class="video-actions">', '') : '') +
                '</div>' +
                (video.description ? '<div class="video-description">' + esc(video.description) + '</div>' : '') +
            '</div>' +
            '<div class="comments-section">' +
                '<h2>💬 评论 <span class="comment-count">(' + comments.length + ')</span></h2>' +
                (AUTH.can('comment')
                    ? '<form class="comment-form" id="comment-form">' +
                        '<input type="text" id="comment-author" placeholder="你的昵称" required maxlength="100" value="' + esc(authorValue) + '" ' + (user && user.role !== 'VISITOR' ? 'readonly' : '') + '>' +
                        '<textarea id="comment-content" placeholder="说点什么吧..." required></textarea>' +
                        '<button type="submit" class="btn-submit">💬 发表评论</button>' +
                      '</form>'
                    : '<div class="no-comments" style="border:1px dashed var(--border);border-radius:8px;">游客模式下暂不支持评论</div>'
                ) +
                '<div class="comments-list" id="comments-list">' +
                    renderComments(comments) +
                '</div>' +
            '</div>';

        // Init DPlayer for local videos
        if (isLocal && video.videoUrl) {
            setTimeout(function() { initDPlayer(video.videoUrl); }, 100);
        }

        // Bind events
        const commentForm = $('#comment-form');
        if (commentForm) commentForm.addEventListener('submit', handleCommentSubmit);

        const delBtn = $('#btn-delete-video');
        if (delBtn) delBtn.addEventListener('click', handleDeleteVideo);

        const editBtn = $('#btn-edit-video');
        if (editBtn) editBtn.addEventListener('click', function() { openEditVideoModal(videoId); });

        const likeBtn = $('#btn-like');
        if (likeBtn) likeBtn.addEventListener('click', function() { handleLike(videoId); });
    }

    function renderComments(commentList) {
        if (!commentList || commentList.length === 0) {
            return '<div class="no-comments">还没有评论，来发表第一条吧！</div>';
        }
        const showDel = AUTH.can('deleteComment');
        return commentList.map(function(c) {
            const color = getAvatarColor(c.author);
            const initial = (c.author || '?').charAt(0).toUpperCase();
            return '<div class="comment-item" data-comment-id="' + c.id + '">' +
                '<div class="comment-header">' +
                    '<span class="comment-author">' +
                        '<span class="comment-avatar" style="background:' + color + ';">' + initial + '</span>' +
                        esc(c.author) +
                    '</span>' +
                    '<span>' +
                        '<span class="comment-time">' + timeAgo(c.createdAt) + '</span>' +
                        (showDel ? '<button class="btn-delete-comment" data-id="' + c.id + '">删除</button>' : '') +
                    '</span>' +
                '</div>' +
                '<div class="comment-content">' + esc(c.content) + '</div>' +
            '</div>';
        }).join('');
    }

    // ============ COMMENT ACTIONS ============
    async function handleCommentSubmit(e) {
        e.preventDefault();
        const authorEl = $('#comment-author');
        const contentEl = $('#comment-content');
        const submitBtn = $('#comment-form .btn-submit');
        const author = authorEl.value.trim();
        const content = contentEl.value.trim();
        if (!author || !content) return;

        submitBtn.disabled = true;
        submitBtn.textContent = '提交中...';

        try {
            await API.createComment(currentVideoId, author, content);
        } catch(err) {
            if (CONFIG.IS_LOCAL) {
                demoComments.push({
                    id: nextDemoCommentId++,
                    videoId: currentVideoId,
                    author: author,
                    content: content,
                    createdAt: new Date().toISOString()
                });
            }
        }

        authorEl.value = AUTH.getUser() ? AUTH.getUser().displayName : '';
        contentEl.value = '';
        submitBtn.disabled = false;
        submitBtn.textContent = '💬 发表评论';
        refreshComments();
        showToast('💬 评论发表成功！');
    }

    function handleDeleteComment(e) {
        if (!e.target.classList.contains('btn-delete-comment')) return;
        const id = parseInt(e.target.dataset.id);
        if (!confirm('确定要删除这条评论吗？')) return;

        API.deleteComment(id).catch(function() {
            demoComments = demoComments.filter(function(c) { return c.id !== id; });
        });

        const item = document.querySelector('[data-comment-id="' + id + '"]');
        if (item) {
            item.style.opacity = '0';
            item.style.transform = 'translateX(20px)';
            item.style.transition = '0.3s';
            setTimeout(function() {
                item.remove();
                updateCommentCount();
            }, 300);
        }
        showToast('评论已删除');
    }

    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-delete-comment')) handleDeleteComment(e);
    });

    async function refreshComments() {
        try {
            const video = await API.getVideo(currentVideoId);
            const comments = video.comments || [];
            const list = $('#comments-list');
            if (list) { list.innerHTML = renderComments(comments); updateCommentCount(); }
        } catch(e) {
            const videoComments = demoComments.filter(function(c) { return c.videoId === currentVideoId; });
            const list = $('#comments-list');
            if (list) { list.innerHTML = renderComments(videoComments); updateCommentCount(); }
        }
    }

    function updateCommentCount() {
        const remaining = $$('.comment-item').length;
        const countEl = $('.comment-count');
        if (countEl) countEl.textContent = '(' + remaining + ')';
        if (remaining === 0) {
            const list = $('#comments-list');
            if (list) list.innerHTML = '<div class="no-comments">还没有评论，来发表第一条吧！</div>';
        }
    }

    // ============ VIDEO ACTIONS ============
    async function handleDeleteVideo() {
        if (!confirm('确定要删除这个视频吗？所有评论也会被删除。此操作不可恢复！')) return;

        try {
            await API.deleteVideo(currentVideoId);
        } catch(e) {
            demoVideos = demoVideos.filter(function(v) { return v.id !== currentVideoId; });
            demoComments = demoComments.filter(function(c) { return c.videoId !== currentVideoId; });
        }

        showToast('视频已删除');
        switchView('list');
    }

    // Add video modal
    function openAddModal() {
        if (!AUTH.can('addVideo')) {
            showToast('⚠️ 当前角色无权发布视频', 'error');
            return;
        }
        $('#modal-add').classList.add('active');
        resetAddForm();
        $('#video-title').focus();
    }

    function closeAddModal() {
        $('#modal-add').classList.remove('active');
        $('#form-add-video').reset();
        resetAddForm();
    }

    function resetAddForm() {
        $('#cloud-url').value = '';
        $('#video-bv').dataset.cover = '';
        $('#cover-preview').style.display = 'none';
        $('#cover-file-input').value = '';
        switchVideoType('BILIBILI');
    }

    // Video type tabs
    function switchVideoType(type) {
        $$('.vt-tab').forEach(function(t) { t.classList.toggle('active', t.dataset.vt === type); });
        $$('.vt-panel').forEach(function(p) { p.classList.remove('active'); });
        const panel = type === 'BILIBILI' ? $('#vt-panel-bilibili') : $('#vt-panel-local');
        if (panel) panel.classList.add('active');
        const bvInput = $('#video-bv');
        const cloudInput = $('#cloud-url');
        if (type === 'BILIBILI') {
            if (bvInput) bvInput.setAttribute('required', '');
            if (cloudInput) cloudInput.removeAttribute('required');
        } else {
            if (bvInput) bvInput.removeAttribute('required');
            if (cloudInput) cloudInput.setAttribute('required', '');
        }
    }

    // Auto-fetch Bilibili video info
    async function fetchBilibiliInfo() {
        const bv = $('#video-bv').value.trim();
        if (!bv || bv.length < 10) return;

        const apiUrl = CONFIG.BILIBILI_API.replace('{BV}', bv);
        try {
            const res = await fetch(apiUrl);
            const json = await res.json();
            if (json.code === 0 && json.data) {
                const data = json.data;
                const titleEl = $('#video-title');
                if (!titleEl.value.trim()) titleEl.value = data.title || '';
                const descEl = $('#video-desc');
                if (!descEl.value.trim()) descEl.value = data.desc || '';
                const coverUrl = data.pic || '';
                $('#video-bv').dataset.cover = coverUrl;
                if (coverUrl) showToast('✅ 已获取B站视频信息');
            }
        } catch(e) {
            console.log('Bilibili fetch skipped:', e.message);
        }
    }

    // Video file upload handling
    async function handleVideoFileUpload(file) {
        if (!file) return;
        if (file.size > CONFIG.MAX_UPLOAD_SIZE * 1024 * 1024) {
            showToast('文件过大，最大支持 ' + CONFIG.MAX_UPLOAD_SIZE + 'MB', 'error');
            return;
        }
        const ext = file.name.split('.').pop().toLowerCase();
        if (CONFIG.ALLOWED_VIDEO_TYPES.indexOf(ext) === -1) {
            showToast('不支持的视频格式: .' + ext, 'error');
            return;
        }

        $('#upload-progress').style.display = 'block';
        $('#upload-zone').style.display = 'none';

        try {
            const result = await API.uploadVideo(file, function(pct) {
                $('#progress-fill').style.width = pct + '%';
                $('#progress-text').textContent = '上传中... ' + pct + '%';
            });
            $('#uploaded-video-url').value = result.videoUrl;
            $('#uploaded-video-type').value = result.videoType;
            $('#progress-text').textContent = '✅ ' + result.message;
            showToast('✅ ' + result.message);
        } catch(e) {
            $('#upload-zone').style.display = 'block';
            $('#upload-progress').style.display = 'none';
            showToast('上传失败: ' + e.message, 'error');
        }
    }

    async function handleAddVideo(e) {
        e.preventDefault();
        const title = $('#video-title').value.trim();
        const bv = $('#video-bv').value.trim();
        const game = $('#video-game').value.trim();
        const desc = $('#video-desc').value.trim();
        const btn = $('#form-add-video .btn-primary');
        const coverFromBili = $('#video-bv').dataset.cover || '';
        const coverUrl = $('#video-cover').value.trim() || coverFromBili || null;

        // Determine video type
        const activeTab = document.querySelector('.vt-tab.active');
        const videoType = activeTab ? activeTab.dataset.vt : 'BILIBILI';

        let data = {
            title: title,
            game: game || null,
            description: desc || null,
            thumbnailUrl: coverUrl,
            videoType: videoType
        };

        if (videoType === 'LOCAL') {
            const cloudUrl = $('#cloud-url').value.trim();
            if (!cloudUrl) { showToast('请粘贴123云盘直链地址', 'error'); return; }
            if (!title) { showToast('请填写视频标题', 'error'); return; }
            data.bilibiliBv = 'CLOUD_' + Date.now();
            data.videoUrl = cloudUrl;
        } else {
            if (!title || !bv) { showToast('请填写标题和BV号', 'error'); return; }
            data.bilibiliBv = bv;
            data.videoUrl = null;
        }

        btn.disabled = true;
        btn.textContent = '发布中...';

        try {
            await API.createVideo(data);
        } catch(err) {
            if (CONFIG.IS_LOCAL) {
                demoVideos.unshift(Object.assign(data, {
                    id: nextDemoVideoId++,
                    bilibiliBv: data.bilibiliBv || '',
                    thumbnailUrl: data.thumbnailUrl || ('https://picsum.photos/seed/v' + nextDemoVideoId + '/640/360'),
                    likes: 0,
                    createdAt: new Date().toISOString(),
                    comments: []
                }));
            }
        }

        closeAddModal();
        btn.disabled = false;
        btn.textContent = '🚀 发布视频';
        renderVideoList();
        showToast('🎉 视频发布成功！');
    }

    // ============ EDIT VIDEO ============
    async function openEditVideoModal(videoId) {
        let video;
        try { video = await API.getVideo(videoId); } catch(e) { video = findDemoVideo(videoId); }
        if (!video) { showToast('视频不存在','error'); return; }

        $('#edit-video-id').value = videoId;
        $('#edit-video-title').value = video.title || '';
        $('#edit-video-game').value = video.game || '';
        $('#edit-video-cover').value = video.thumbnailUrl || '';
        $('#edit-video-desc').value = video.description || '';
        $('#modal-edit-video').classList.add('active');
    }

    function closeEditVideoModal() { $('#modal-edit-video').classList.remove('active'); }

    async function handleEditVideo(e) {
        e.preventDefault();
        const id = $('#edit-video-id').value;
        const data = {
            title: $('#edit-video-title').value.trim(),
            game: $('#edit-video-game').value.trim() || null,
            thumbnailUrl: $('#edit-video-cover').value.trim() || null,
            description: $('#edit-video-desc').value.trim() || null
        };
        try { await API.updateVideo(id, data); auditLog('EDIT_VIDEO', data.title); } catch(err) { showToast('保存失败: '+err.message,'error'); return; }
        closeEditVideoModal();
        renderVideoList();
        if (currentView === 'detail' && currentVideoId == id) openVideoDetail(id);
        showToast('视频已更新');
    }

    // ============ DASHBOARD ============
    let dashQuill = null;

    async function renderDashboard(tab) {
        const panels = $$('.dash-panel');
        panels.forEach(function(p) { p.classList.remove('active'); });
        document.getElementById('dash-' + tab).classList.add('active');

        switch(tab) {
            case 'stats': await renderStats(); break;
            case 'logs': await renderLogs(); break;
            case 'contact': await renderContactEdit(); break;
            case 'banners': await renderBannerAdmin(); break;
        }
    }

    async function renderStats() {
        const el = $('#dash-stats');
        try {
            const [videos, users, files] = await Promise.all([
                API.getVideos('latest'), API.admin.getUsers(), API.getFiles()
            ]);
            el.innerHTML = '<div class="stats-grid">' +
                '<div class="stat-card"><div class="stat-num">' + videos.length + '</div><div class="stat-label">视频总数</div></div>' +
                '<div class="stat-card"><div class="stat-num">' + users.length + '</div><div class="stat-label">注册用户</div></div>' +
                '<div class="stat-card"><div class="stat-num">' + files.length + '</div><div class="stat-label">集团文件</div></div>' +
                '<div class="stat-card"><div class="stat-num">' + videos.reduce(function(s,v) { return s + (v.playCount||0); }, 0) + '</div><div class="stat-label">总播放量</div></div>' +
                '</div>';
        } catch(e) { el.innerHTML = '<div class="no-comments">加载失败</div>'; }
    }

    async function renderLogs() {
        const el = $('#dash-logs');
        try {
            const logs = await API.getLogs();
            if (!logs || logs.length === 0) { el.innerHTML = '<div class="no-comments">暂无操作记录</div>'; return; }
            el.innerHTML = '<table class="log-table"><tr><th>时间</th><th>操作</th><th>用户</th><th>详情</th></tr>' +
                logs.map(function(l) {
                    return '<tr><td>' + formatTime(l.createdAt) + '</td><td>' + esc(l.action) + '</td><td>' + esc(l.username) + '</td><td>' + esc(l.detail || '') + '</td></tr>';
                }).join('') + '</table>';
        } catch(e) { el.innerHTML = '<div class="no-comments">加载失败</div>'; }
    }

    async function renderContactEdit() {
        const el = $('#dash-contact');
        let contact;
        try { contact = await API.getContact(); } catch(e) {}
        contact = contact || {};
        el.innerHTML = '<form id="form-contact-edit"><div class="form-group"><label>地址</label><input id="ca" value="' + esc(contact.address||'') + '"></div>' +
            '<div class="form-group"><label>电话</label><input id="cp" value="' + esc(contact.phone||'') + '"></div>' +
            '<div class="form-group"><label>传真</label><input id="cf" value="' + esc(contact.fax||'') + '"></div>' +
            '<div class="form-group"><label>邮箱</label><input id="ce" value="' + esc(contact.email||'') + '"></div>' +
            '<div class="form-group"><label>HR邮箱</label><input id="ch" value="' + esc(contact.hrEmail||'') + '"></div>' +
            '<div class="form-group"><label>工作时间</label><input id="cw" value="' + esc(contact.workHours||'') + '"></div>' +
            '<div class="form-group"><label>地图URL</label><input id="cm" value="' + esc(contact.mapUrl||'') + '"></div>' +
            '<button type="submit" class="btn btn-primary">💾 保存联系方式</button></form>';

        $('#form-contact-edit').addEventListener('submit', async function(e) {
            e.preventDefault();
            const data = { address:$('#ca').value, phone:$('#cp').value, fax:$('#cf').value, email:$('#ce').value, hrEmail:$('#ch').value, workHours:$('#cw').value, mapUrl:$('#cm').value };
            try { await API.updateContact(data); showToast('联系方式已更新'); auditLog('EDIT_CONTACT', ''); } catch(err) { showToast('保存失败','error'); }
        });
    }

    async function renderBannerAdmin() {
        const el = $('#dash-banners');
        let banners = [];
        try { banners = await API.getBanners(); } catch(e) {}
        el.innerHTML = (banners.length ? banners.map(function(b) {
            return '<div class="banner-item"><img src="' + esc(b.imageUrl || '') + '" onerror="this.style.display=\'none\'"><div class="banner-info"><span style="font-weight:600;">' + esc(b.title) + '</span><span style="color:var(--text-muted);">排序:' + b.sortOrder + ' 状态:' + (b.active?'启用':'禁用') + '</span></div>' +
                '<button class="btn-delete-user" onclick="ADMIN_ACTIONS.deleteBanner(' + b.id + ')">删除</button></div>';
        }).join('') : '<div class="no-comments">暂无轮播</div>') +
        '<div style="margin-top:16px;border-top:1px solid var(--border);padding-top:16px;"><h4 style="margin-bottom:8px;">+ 添加轮播</h4>' +
        '<form id="form-add-banner"><div class="form-group"><input id="ba-title" placeholder="标题" maxlength="100"></div>' +
        '<div class="form-group"><input id="ba-url" placeholder="图片URL" maxlength="500"></div>' +
        '<div class="form-group"><input id="ba-link" placeholder="跳转链接（可选）" maxlength="500"></div>' +
        '<button type="submit" class="btn btn-primary btn-sm">添加</button></form></div>';

        $('#form-add-banner').addEventListener('submit', async function(e) {
            e.preventDefault();
            const data = { title:$('#ba-title').value, imageUrl:$('#ba-url').value, linkUrl:$('#ba-link').value, sortOrder:99, active:true };
            try { await API.createBanner(data); showToast('轮播已添加'); renderBannerAdmin(); } catch(err) { showToast('添加失败','error'); }
        });
    }

    window.ADMIN_ACTIONS.deleteBanner = async function(id) {
        if (!confirm('确认删除？')) return;
        try { await API.deleteBanner(id); showToast('已删除'); renderBannerAdmin(); } catch(e) { showToast('失败','error'); }
    };

    // ============ ADMIN PANEL ============
    function openAdminPanel() {
        $('#modal-admin').classList.add('active');
        renderAdminUserList();
    }

    function closeAdminPanel() {
        $('#modal-admin').classList.remove('active');
    }

    async function renderAdminUserList() {
        const listEl = $('#admin-user-list');
        listEl.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

        let users = [];
        try {
            users = await API.admin.getUsers();
        } catch(e) {
            listEl.innerHTML = '<div class="no-comments">加载失败: ' + esc(e.message) + '</div>';
            return;
        }

        if (!users || users.length === 0) {
            listEl.innerHTML = '<div class="no-comments">暂无成员</div>';
            return;
        }

        listEl.innerHTML = users.map(function(u) {
            const color = getAvatarColor(u.username);
            const initial = (u.displayName || u.username || '?').charAt(0).toUpperCase();
            const isBuiltin = u.username === 'admin';
            const roles = [
                { val: 'ADMIN', label: '👑 管理员' },
                { val: 'MEMBER', label: '🎮 成员' },
                { val: 'VISITOR', label: '👀 游客' }
            ];
            const roleOptions = roles.map(function(r) {
                return '<option value="' + r.val + '"' + (u.role === r.val ? ' selected' : '') + '>' + r.label + '</option>';
            }).join('');
            const roleSelect = isBuiltin
                ? '<span style="font-size:12px;color:var(--accent-magenta);">👑 内置管理员</span>'
                : '<select onchange="ADMIN_ACTIONS.changeRole(' + u.id + ', this.value)">' + roleOptions + '</select>';
            const deleteBtn = isBuiltin
                ? ''
                : '<button class="btn-delete-user" onclick="ADMIN_ACTIONS.deleteUser(' + u.id + ')">删除</button>';

            return '<div class="admin-user-item">' +
                '<div class="admin-user-info">' +
                    '<span class="admin-user-avatar" style="background:' + color + ';">' + initial + '</span>' +
                    '<div class="admin-user-detail">' +
                        '<span class="admin-user-name">' + esc(u.displayName) + '</span>' +
                        '<span class="admin-user-username">@' + esc(u.username) + ' · ' + (u.role || 'VISITOR') + '</span>' +
                    '</div>' +
                '</div>' +
                '<div class="admin-user-actions">' +
                    roleSelect + deleteBtn +
                '</div>' +
            '</div>';
        }).join('');
    }

    // Admin actions (exposed globally for inline onclick handlers)
    window.ADMIN_ACTIONS = {
        changeRole: async function(userId, role) {
            try {
                await API.admin.updateUserRole(userId, role);
                showToast('角色已更新');
                renderAdminUserList();
            } catch(e) {
                showToast('更新失败: ' + e.message, 'error');
            }
        },
        deleteUser: async function(userId) {
            if (!confirm('确定要删除该用户吗？')) return;
            try {
                await API.admin.deleteUser(userId);
                showToast('用户已删除');
                renderAdminUserList();
            } catch(e) {
                showToast('删除失败: ' + e.message, 'error');
            }
        }
    };

    async function handleAddUser(e) {
        e.preventDefault();
        const username = $('#admin-username').value.trim();
        const password = $('#admin-password').value.trim();
        const displayName = $('#admin-displayname').value.trim();
        const role = $('#admin-role').value;

        if (!username || !password || !displayName) {
            showToast('请填写所有字段', 'error'); return;
        }

        try {
            await API.admin.createUser({
                username: username,
                password: password,
                displayName: displayName,
                role: role
            });
            showToast('✅ 用户 ' + displayName + ' 创建成功！');
            $('#form-add-user').reset();
            renderAdminUserList();
        } catch(e) {
            showToast('创建失败: ' + e.message, 'error');
        }
    }

    // ============ LOGIN HANDLING ============
    async function handleLogin(e) {
        e.preventDefault();
        const errorEl = $('#login-error');
        const btn = $('#login-form .btn-login');
        const username = $('#login-username').value.trim();
        const password = $('#login-password').value.trim();

        if (!username || !password) { errorEl.textContent = '请输入用户名和密码'; return; }

        errorEl.textContent = '';
        btn.disabled = true;
        btn.textContent = '登录中...';

        try {
            await AUTH.login(username, password);
            onLoginSuccess();
        } catch(err) {
            errorEl.textContent = '❌ ' + (err.message || '登录失败');
            btn.disabled = false;
            btn.textContent = '🚀 登 录';
        }
    }

    function onLoginSuccess() {
        $('#login-page').style.display = 'none';
        $('#app-main').classList.add('logged-in');
        updateUserUI();
        switchView('list');
    }

    function handleLogout() {
        if (!confirm('确定要退出登录吗？')) return;
        AUTH.logout();
        $('#app-main').classList.remove('logged-in');
        $('#login-page').style.display = '';
        $('#login-username').value = '';
        $('#login-password').value = '';
        $('#login-error').textContent = '';
    }

    function updateUserUI() {
        const user = AUTH.getUser();
        if (!user) return;

        const avatar = $('#user-avatar');
        avatar.style.background = user.avatarColor || CONFIG.AVATAR_COLORS[0];
        avatar.textContent = (user.displayName || '?').charAt(0).toUpperCase();

        $('#user-name').textContent = user.displayName;

        const roleEl = $('#user-role');
        roleEl.textContent = AUTH.getRoleLabel();
        roleEl.className = 'user-role role-' + user.role;

        const btnAdd = $('#btn-add-video');
        if (AUTH.can('addVideo')) {
            btnAdd.classList.remove('hidden');
        } else {
            btnAdd.classList.add('hidden');
        }

        // Admin panel button
        const btnAdmin = $('#btn-admin-panel');
        const btnDash = $('#btn-dashboard');
        if (user.role === 'ADMIN') {
            btnAdmin.style.display = '';
            if (btnDash) btnDash.style.display = '';
        } else {
            btnAdmin.style.display = 'none';
            if (btnDash) btnDash.style.display = 'none';
        }

        const banner = $('#visitor-banner');
        banner.style.display = user.role === 'VISITOR' ? 'block' : 'none';
    }

    // ============ EVENT BINDINGS ============
    function bindEvents() {
        // Login
        $('#login-form').addEventListener('submit', handleLogin);
        $('#btn-logout').addEventListener('click', handleLogout);
        $('#logo-home').addEventListener('click', function() { switchView('list'); });

        // Nav links
        $$('.nav-link[data-view]').forEach(function(link) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                switchView(link.dataset.view);
            });
        });

        // Sort buttons
        $$('.sort-btn').forEach(function(btn) {
            btn.addEventListener('click', function() { setSort(btn.dataset.sort); });
        });

        // Source filter buttons
        $$('.source-btn').forEach(function(btn) {
            btn.addEventListener('click', function() { setSourceFilter(btn.dataset.src); });
        });

        // File upload button (intro page)
        const btnUploadFile = $('#btn-upload-file');
        if (btnUploadFile) btnUploadFile.addEventListener('click', handleFileUpload);

        // Add video
        $('#btn-add-video').addEventListener('click', openAddModal);
        $('#form-add-video').addEventListener('submit', handleAddVideo);
        var bvInput = $('#video-bv');
        if (bvInput) {
            bvInput.addEventListener('blur', fetchBilibiliInfo);
            bvInput.addEventListener('change', fetchBilibiliInfo);
        }

        // Crop modal
        $('#btn-crop-confirm').addEventListener('click', confirmCrop);
        $('#btn-crop-cancel').addEventListener('click', function() {
            closeCropModal();
            if (cropReject) cropReject(new Error('cancelled'));
            $('#cover-file-input').value = '';
        });
        $('#modal-crop-close').addEventListener('click', function() {
            closeCropModal();
            if (cropReject) cropReject(new Error('cancelled'));
            $('#cover-file-input').value = '';
        });

        // Cover upload with client-side compression
        $('#btn-upload-cover').addEventListener('click', function() {
            $('#cover-file-input').click();
        });
        $('#cover-file-input').addEventListener('change', async function() {
            const file = this.files[0];
            if (!file) return;
            if (file.size > 50 * 1024 * 1024) { showToast('图片最大50MB', 'error'); return; }
            try {
                // Open cropper
                showToast('请裁剪封面为16:9比例');
                const cropped = await openCropper(file);
                var originalSize = (file.size / 1024 / 1024).toFixed(1);
                var newSize = (cropped.size / 1024).toFixed(0);
                showToast('上传中（' + originalSize + 'MB → ' + newSize + 'KB）');
                var result = await API.uploadCover(cropped);
                $('#video-cover').value = result.coverUrl;
                $('#cover-preview-img').src = result.coverUrl;
                $('#cover-preview-text').textContent = '✅ 封面已上传（已裁剪压缩）';
                $('#cover-preview').style.display = 'block';
                showToast('✅ 封面上传成功！');
            } catch(e) {
                if (e && e.message === 'cancelled') return; // user cancelled
                if (e) showToast('上传失败: ' + e.message, 'error');
            }
        });

        // Video type tabs
        $$('.vt-tab').forEach(function(tab) {
            tab.addEventListener('click', function() {
                switchVideoType(tab.dataset.vt);
            });
        });

        // Back button (video detail)
        $('#btn-back').addEventListener('click', function() { switchView('list'); });

        // Back button (news detail)
        $$('.btn-back[data-back="news"]').forEach(function(btn) {
            btn.addEventListener('click', function() { switchView('news'); });
        });

        // Carousel buttons
        const carPrev = $('#carousel-prev');
        const carNext = $('#carousel-next');
        if (carPrev) carPrev.addEventListener('click', function() {
            goToSlide((carouselIndex - 1 + carouselSlides.length) % carouselSlides.length);
        });
        if (carNext) carNext.addEventListener('click', function() {
            goToSlide((carouselIndex + 1) % carouselSlides.length);
        });

        // News modal
        const btnNews = $('#btn-add-news');
        if (btnNews) btnNews.addEventListener('click', openNewsModal);
        $('#form-add-news').addEventListener('submit', handleAddNews);
        $('#modal-news-close').addEventListener('click', closeNewsModal);
        $('#btn-news-cancel').addEventListener('click', closeNewsModal);
        $('#modal-news').addEventListener('click', function(e) { if (e.target === this) closeNewsModal(); });

        // Modal close - add video
        $('#modal-close').addEventListener('click', closeAddModal);
        $('#btn-cancel').addEventListener('click', closeAddModal);
        $('#modal-add').addEventListener('click', function(e) { if (e.target === this) closeAddModal(); });

        // Dashboard
        $('#btn-dashboard').addEventListener('click', function() { switchView('dashboard'); });
        $$('.dash-tab').forEach(function(t) { t.addEventListener('click', function() { renderDashboard(t.dataset.dt); $$('.dash-tab').forEach(function(d) { d.classList.toggle('active', d === t); }); }); });

        // Edit video modal
        $('#form-edit-video').addEventListener('submit', handleEditVideo);
        $('#modal-edit-close').addEventListener('click', closeEditVideoModal);
        $('#btn-edit-cancel').addEventListener('click', closeEditVideoModal);
        $('#modal-edit-video').addEventListener('click', function(e) { if (e.target === this) closeEditVideoModal(); });

        // Gallery
        $('#btn-upload-photo').addEventListener('click', handlePhotoUpload);
        $('#lightbox-close').addEventListener('click', closeLightbox);
        $('#lightbox').addEventListener('click', function(e) { if (e.target === this) closeLightbox(); });
        $('#lightbox-next').addEventListener('click', lightboxNext);
        $('#lightbox-prev').addEventListener('click', lightboxPrev);
        // Touch swipe for lightbox
        $('#lightbox').addEventListener('touchstart', function(e) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });
        $('#lightbox').addEventListener('touchend', function(e) {
            const dx = e.changedTouches[0].clientX - touchStartX;
            const dy = e.changedTouches[0].clientY - touchStartY;
            if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 60) {
                if (dx > 0) lightboxPrev(); else lightboxNext();
            }
            if (Math.abs(dy) > Math.abs(dx) && dy > 100) closeLightbox();
        });
        document.addEventListener('keydown', function(e) {
            if ($('#lightbox').classList.contains('active')) {
                if (e.key === 'Escape') closeLightbox();
                if (e.key === 'ArrowRight') lightboxNext();
                if (e.key === 'ArrowLeft') lightboxPrev();
            }
        });

        // Search
        initSearch();

        // Admin panel
        $('#btn-admin-panel').addEventListener('click', openAdminPanel);
        $('#modal-admin-close').addEventListener('click', closeAdminPanel);
        $('#modal-admin').addEventListener('click', function(e) { if (e.target === this) closeAdminPanel(); });
        $('#form-add-user').addEventListener('submit', handleAddUser);

        // Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                if ($('#modal-news').classList.contains('active')) closeNewsModal();
                if ($('#modal-admin').classList.contains('active')) closeAdminPanel();
                if ($('#modal-add').classList.contains('active')) closeAddModal();
            }
        });
    }

    // Mobile nav toggle
    const navToggle = $('#nav-toggle');
    const navLinks = $('#nav-links');
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function() { navLinks.classList.toggle('open'); });
        document.addEventListener('click', function(e) {
            if (!navLinks.contains(e.target) && e.target !== navToggle) navLinks.classList.remove('open');
        });
        // Close after clicking a link
        navLinks.querySelectorAll('.nav-link').forEach(function(l) {
            l.addEventListener('click', function() { navLinks.classList.remove('open'); });
        });
    }

    // ============ INIT ============
    function init() {
        bindEvents();

        if (AUTH.isLoggedIn()) {
            onLoginSuccess();
        } else {
            $('#login-page').style.display = '';
            $('#app-main').classList.remove('logged-in');
            $('#login-username').focus();
        }
    }

    document.addEventListener('DOMContentLoaded', init);
})();
