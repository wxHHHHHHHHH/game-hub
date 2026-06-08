// ============ 波比 v2 — Minimal App ============
(function(){
'use strict';
const $=s=>document.querySelector(s);
const $$=s=>document.querySelectorAll(s);
let currentPage='home',currentVideo=null,galleryPhotos=[],lbIndex=0;

function esc(s){return s?String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]):'';}
function timeAgo(d){if(!d)return'';const t=Math.floor((new Date()-new Date(d))/1000);if(t<60)return'刚刚';if(t<3600)return Math.floor(t/60)+'分钟前';if(t<86400)return Math.floor(t/3600)+'小时前';return d.substring(0,10);}
function formatTime(d){if(!d)return'';const dt=new Date(d);return dt.getFullYear()+'-'+String(dt.getMonth()+1).padStart(2,'0')+'-'+String(dt.getDate()).padStart(2,'0');}
function toast(m){const t=document.createElement('div');t.className='toast-v2';t.textContent=m;document.getElementById('toasts').appendChild(t);setTimeout(()=>t.remove(),2800);}

// Navigation
function goPage(name){
  currentPage=name;
  $$('.page').forEach(p=>p.classList.remove('active'));
  $$('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.page===name));
  const pg=document.getElementById('page-'+name);
  if(pg)pg.classList.add('active');
  if(name==='home')renderFeed();
  if(name==='videos')renderVideoGrid();
  if(name==='news')renderNews();
  if(name==='gallery')renderGallery();
  if(name==='intro')renderIntro();
}
$$('.nav-item').forEach(n=>n.addEventListener('click',()=>goPage(n.dataset.page)));

// Toast helper
function toast(m){const t=document.createElement('div');t.className='toast-v2';t.textContent=m;document.getElementById('toasts').appendChild(t);setTimeout(()=>t.remove(),2800);}

// ============ HOME FEED ============
async function renderFeed(){
  const el=$('#video-feed');el.innerHTML='<p style="color:#666;padding:40px 0;">加载中...</p>';
  let videos=[];
  try{videos=await API.getVideos('latest')}catch(e){}
  if(!videos.length){el.innerHTML='<p style="color:#666;padding:40px 0;">暂无视频</p>';return}
  el.innerHTML=videos.map(v=>{
    const thumb=v.thumbnailUrl||'data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><rect fill="#1a1a1a" width="640" height="360"/><text fill="#444" x="320" y="180" text-anchor="middle" font-size="48">🎬</text></svg>');
    return '<div class="video-card-v2" onclick="window.viewVideo('+v.id+')"><div class="card-img"><img src="'+esc(thumb)+'" loading="lazy" onerror="this.style.display=\'none\'"><div class="play-btn"><span>▶</span></div></div><div class="card-body"><h3>'+esc(v.title)+'</h3><div class="card-meta"><span>'+esc(v.game||'')+'</span><span>'+timeAgo(v.createdAt)+'</span></div><div class="card-likes">❤ '+ (v.likes||0)+'</div></div></div>';
  }).join('');
}
window.viewVideo=function(id){
  currentVideo=id;
  // Open detail in a simple overlay or redirect
  window.location.href='index.html#detail/'+id;
};

// ============ VIDEOS PAGE ============
async function renderVideoGrid(filter,sort){
  const el=$('#video-grid-v2');el.innerHTML='<p style="color:#666;padding:40px 0;">加载中...</p>';
  let videos=[];
  try{
    if(filter&&filter!=='all')videos=await API.getVideosByType(filter);
    else videos=await API.getVideos(sort||'latest');
  }catch(e){}
  if(!videos.length){el.innerHTML='<p style="color:#666;padding:40px 0;">暂无视频</p>';return}
  el.innerHTML=videos.map(v=>{
    const thumb=v.thumbnailUrl||'';
    return '<div class="video-card-v2" onclick="window.viewVideo('+v.id+')"><div class="card-img"><img src="'+esc(thumb||'')+'" loading="lazy" onerror="this.parentElement.style.background=\'#1a1a1a\'"><div class="play-btn"><span>▶</span></div></div><div class="card-body"><h3>'+esc(v.title)+'</h3><div class="card-meta"><span>'+esc(v.game||'')+'</span><span>'+timeAgo(v.createdAt)+'</span></div><div class="card-likes">❤ '+ (v.likes||0)+'</div></div></div>';
  }).join('');
}
// Filter chips
$$('#page-videos .chip').forEach(c=>{
  c.addEventListener('click',function(){
    if(this.tagName==='SELECT'){renderVideoGrid(null,this.value);return}
    $$('#page-videos .chip').forEach(x=>x.classList.toggle('active',x===this));
    renderVideoGrid(this.dataset.filter,$('#sort-select').value);
  });
});

// Add video
$('#btn-add-video').addEventListener('click',()=>$('#modal-video').classList.add('open'));
$('#modal-video-close').addEventListener('click',()=>$('#modal-video').classList.remove('open'));
$('#modal-video').addEventListener('click',function(e){if(e.target===this)this.classList.remove('open')});
// Tab switching
$$('.tab-v2').forEach(t=>t.addEventListener('click',function(){
  $$('.tab-v2').forEach(x=>x.classList.remove('active'));
  this.classList.add('active');
  const vt=this.dataset.vt;
  $('#panel-bilibili').style.display=vt==='BILIBILI'?'block':'none';
  $('#panel-cloud').style.display=vt==='LOCAL'?'block':'none';
}));
// Cover upload
$('#btn-cover-upload').addEventListener('click',()=>$('#v-cover-file').click());
$('#v-cover-file').addEventListener('change',async function(){
  const f=this.files[0];if(!f)return;
  try{const r=await API.uploadCover(f);$('#v-cover').value=r.coverUrl;toast('封面上传成功')}catch(e){toast('上传失败')}
});
// Submit video
$('#form-video').addEventListener('submit',async function(e){
  e.preventDefault();
  const vt=document.querySelector('.tab-v2.active').dataset.vt;
  const data={title:$('#v-title').value,bilibiliBv:vt==='BILIBILI'?$('#v-bv').value:'CLOUD_'+Date.now(),game:$('#v-game').value||null,description:$('#v-desc').value||null,thumbnailUrl:$('#v-cover').value||null,videoType:vt,videoUrl:vt==='LOCAL'?$('#v-url').value:null};
  try{await API.createVideo(data);$('#modal-video').classList.remove('open');this.reset();renderVideoGrid();toast('发布成功')}catch(e){toast('发布失败: '+e.message)}
});

// ============ NEWS ============
async function renderNews(){
  const el=$('#news-list');el.innerHTML='<p style="color:#666;padding:40px 0;">加载中...</p>';
  let news=[];
  try{news=await API.getNewsList()}catch(e){}
  if(!news.length){el.innerHTML='<p style="color:#666;padding:40px 0;">暂无新闻</p>';return}
  el.innerHTML=news.map(n=>'<div class="news-item"><h3>'+esc(n.title)+'</h3><div class="news-meta">'+esc(n.category||'')+' · '+formatTime(n.createdAt)+'</div></div>').join('');
}
$('#btn-add-news').addEventListener('click',()=>$('#modal-news-v2').classList.add('open'));
$('#modal-news-close').addEventListener('click',()=>$('#modal-news-v2').classList.remove('open'));
$('#modal-news-v2').addEventListener('click',function(e){if(e.target===this)this.classList.remove('open')});
$('#form-news').addEventListener('submit',async function(e){
  e.preventDefault();
  const data={title:$('#n-title').value,summary:$('#n-summary').value,content:$('#n-content').value,category:'集团动态',important:$('#n-important').checked};
  try{await API.createNews(data);$('#modal-news-v2').classList.remove('open');this.reset();renderNews();toast('发布成功')}catch(e){toast('发布失败')}
});

// ============ GALLERY ============
async function renderGallery(){
  const el=$('#gallery-wall');el.innerHTML='<p style="color:#666;padding:40px 0;">加载中...</p>';
  try{galleryPhotos=await API.getPhotos()}catch(e){galleryPhotos=[]}
  if(!galleryPhotos.length){el.innerHTML='<p style="color:#666;padding:40px 0;">暂无照片</p>';return}
  el.innerHTML=galleryPhotos.map((p,i)=>'<div class="gal-item" onclick="window.openLightbox('+i+')"><img src="'+(p.thumbnailUrl||p.imageUrl)+'" loading="lazy"></div>').join('');
}
window.openLightbox=function(i){lbIndex=i;updateLb();$('#lightbox-v2').classList.add('open');document.body.style.overflow='hidden'};
function updateLb(){
  const p=galleryPhotos[lbIndex];if(!p)return;
  $('#lb-img').src=p.imageUrl;$('#lb-cap').textContent=(p.caption||'')+' · '+(p.album||'');
  $('#lb-original').href=p.imageUrl;
}
$('#lb-close').addEventListener('click',()=>{$('#lightbox-v2').classList.remove('open');document.body.style.overflow='';});
$('#lb-next').addEventListener('click',()=>{lbIndex=(lbIndex+1)%galleryPhotos.length;updateLb()});
$('#lb-prev').addEventListener('click',()=>{lbIndex=(lbIndex-1+galleryPhotos.length)%galleryPhotos.length;updateLb()});
$('#lightbox-v2').addEventListener('click',function(e){if(e.target===this){this.classList.remove('open');document.body.style.overflow='';}});
$('#btn-upload-photo').addEventListener('click',()=>$('#photo-input').click());
$('#photo-input').addEventListener('change',async function(){
  const files=this.files;if(!files||!files.length)return;
  const date=$('#photo-date').value;
  for(let f of files){try{await API.uploadPhoto(f,'','默认相册',date,AUTH.getUser()?AUTH.getUser().displayName:'')}catch(e){toast('上传失败')}}
  toast('上传完成');renderGallery();
});
document.addEventListener('keydown',function(e){
  if($('#lightbox-v2').classList.contains('open')){
    if(e.key==='Escape'){$('#lightbox-v2').classList.remove('open');document.body.style.overflow='';}
    if(e.key==='ArrowRight'){lbIndex=(lbIndex+1)%galleryPhotos.length;updateLb()}
    if(e.key==='ArrowLeft'){lbIndex=(lbIndex-1+galleryPhotos.length)%galleryPhotos.length;updateLb()}
  }
});

// ============ INTRO ============
async function renderIntro(){
  const fl=$('#file-list');fl.innerHTML='<p style="color:#666;">加载中...</p>';
  let files=[];
  try{files=await API.getFiles()}catch(e){}
  if(!files.length){fl.innerHTML='<p style="color:#666;">暂无文件</p>';return}
  fl.innerHTML=files.map(f=>'<div class="file-item-v2"><span>📄 '+esc(f.fileName)+'</span><span style="font-size:12px;color:#777;">'+(f.fileSize?Math.round(f.fileSize/1024)+' KB':'')+'</span><div><a href="'+CONFIG.API_BASE+'/files/'+f.id+'/view" target="_blank" class="btn-ghost btn-sm">查看</a><a href="'+CONFIG.API_BASE+'/files/'+f.id+'/download" class="btn-ghost btn-sm" style="margin-left:4px">下载</a></div></div>').join('');
  if(AUTH.getUser()&&AUTH.getUser().role==='ADMIN')$('#file-upload-area-v2').style.display='flex';
}
$('#btn-upload-file').addEventListener('click',function(){
  $('#file-input').click();
  $('#file-input').onchange=async function(){
    const f=this.files[0];if(!f)return;
    const label=$('#file-label').value||f.name;
    try{await API.uploadFile(f,label);toast('上传成功');renderIntro()}catch(e){toast('上传失败')}
  };
});

// ============ LOGIN ============
$('#btn-login').addEventListener('click',function(){
  if(AUTH.isLoggedIn()){AUTH.logout();updateUserUI();renderFeed();return}
  const un=prompt('用户名:');if(!un)return;
  const pw=prompt('密码:');if(!pw)return;
  AUTH.login(un,pw).then(()=>{updateUserUI();goPage('home')}).catch(e=>toast('登录失败: '+e.message));
});
function updateUserUI(){
  const u=AUTH.getUser();
  if(!u){$('#btn-login').textContent='登录';$('#user-info').style.display='none';return}
  $('#btn-login').textContent='退出';
  $('#user-info').style.display='flex';
  const av=$('#user-avatar');av.style.background='#333';av.textContent=(u.displayName||'?')[0];
  $('#user-name').textContent=u.displayName;
}

// Init
if(AUTH.isLoggedIn())updateUserUI();
goPage('home');
})();
