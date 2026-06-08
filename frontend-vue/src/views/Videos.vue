<template>
  <div>
    <div class="page-head"><h2>视频</h2><button class="btn-main" @click="showAdd=true">发布视频</button></div>
    <div class="chips"><button v-for="f in filters" :key="f" class="chip" :class="{on:curFilter===f}" @click="setFilter(f)">{{ f==='all'?'全部':f==='BILIBILI'?'B站':'云盘' }}</button></div>
    <div class="feed">
      <div v-for="v in videos" :key="v.id" class="vid-card" @click="$router.push('/videos/'+v.id)">
        <div class="vid-thumb"><img :src="v.thumbnailUrl||placeholder" loading="lazy" @error="e=>e.target.style.display='none'"><div class="vid-play"><span>▶</span></div></div>
        <div class="vid-body"><h3>{{ v.title }}</h3><div class="vid-meta">{{ v.game }} · ❤{{ v.likes||0 }}</div></div>
      </div>
    </div>
    <!-- Add Modal -->
    <div class="modal-overlay" v-if="showAdd" @click.self="showAdd=false">
      <div class="modal-box"><div class="modal-head"><h3>发布视频</h3><button class="modal-close" @click="showAdd=false">&times;</button></div>
        <form @submit.prevent="doAdd" class="form-body">
          <div class="tabs"><button type="button" :class="{on:vt==='BILIBILI'}" @click="vt='BILIBILI'">B站</button><button type="button" :class="{on:vt==='LOCAL'}" @click="vt='LOCAL'">云盘</button></div>
          <div v-if="vt==='BILIBILI'"><label>BV号</label><input v-model="bv" placeholder="BV1xx411c7mD" required></div>
          <div v-else><label>直链地址</label><input v-model="cloudUrl" placeholder="123云盘直链" required></div>
          <label>标题</label><input v-model="title" required placeholder="视频标题">
          <label>分类</label><input v-model="game" placeholder="分类标签">
          <label>封面</label><div class="cover-row"><input v-model="cover" placeholder="图片URL"><input type="file" accept="image/*" hidden ref="coverFile" @change="uploadCover"><button type="button" class="btn-sm" @click="$refs.coverFile.click()">上传</button></div>
          <label>描述</label><textarea v-model="desc" rows="3"></textarea>
          <button class="btn-main" type="submit">发布</button>
        </form>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import api from '../api/index.js'
const videos=ref([]), curFilter=ref('all'), filters=['all','BILIBILI','LOCAL']
const showAdd=ref(false), vt=ref('BILIBILI'), bv=ref(''), cloudUrl=ref(''), title=ref(''), game=ref(''), cover=ref(''), desc=ref(''), coverFile=ref(null)
const placeholder='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><rect fill="#1a1a1a" width="640" height="360"/><text fill="#444" x="320" y="180" text-anchor="middle" font-size="48">🎬</text></svg>')
async function load(){ try{videos.value=curFilter.value==='all'?await api.getVideos('latest'):await api.getVideos(null,null,curFilter.value)}catch(e){} }
function setFilter(f){curFilter.value=f;load()}
async function uploadCover(){const f=coverFile.value.files[0];if(!f)return;try{const r=await api.uploadCover(f);cover.value=r.coverUrl;window.toast&&toast('封面上传成功')}catch(e){}}
async function doAdd(){
  const data={title:title.value,bilibiliBv:vt.value==='BILIBILI'?bv.value:'CLOUD_'+Date.now(),game:game.value||null,description:desc.value||null,thumbnailUrl:cover.value||null,videoType:vt.value,videoUrl:vt.value==='LOCAL'?cloudUrl.value:null}
  try{await api.createVideo(data);showAdd.value=false;title.value='';bv.value='';cloudUrl.value='';game.value='';cover.value='';desc.value='';load();window.toast&&toast('发布成功')}catch(e){window.toast&&toast('失败')}
}
onMounted(load)
</script>
<style scoped>
.page-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px}.page-head h2{font-size:28px;font-weight:800}
.feed{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px}
.vid-card{border-radius:12px;overflow:hidden;background:var(--card);cursor:pointer;transition:all .2s}.vid-card:hover{transform:translateY(-3px)}
.vid-thumb{aspect-ratio:16/9;position:relative;overflow:hidden;background:#1a1a1a}
.vid-thumb img{width:100%;height:100%;object-fit:cover}
.vid-play{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.3);opacity:0;transition:opacity .2s}.vid-card:hover .vid-play{opacity:1}
.vid-play span{width:44px;height:44px;background:rgba(255,255,255,.9);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;color:#000}
.vid-body{padding:12px 16px}.vid-body h3{font-size:15px;font-weight:600;margin-bottom:2px}.vid-meta{font-size:12px;color:#777}
.chips{display:flex;gap:8px;margin-bottom:20px}
.chip{padding:6px 16px;border-radius:20px;border:1px solid rgba(128,128,128,.1);background:var(--card);color:#999;font-size:13px;cursor:pointer}.chip.on{background:var(--ac);color:var(--bg);border-color:var(--ac)}
.btn-main{padding:10px 22px;background:var(--ac);color:var(--bg);border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer}.btn-main:hover{opacity:.85}
.btn-sm{padding:8px 14px;font-size:13px;border:1px solid rgba(128,128,128,.15);border-radius:8px;background:none;color:#999;cursor:pointer}
.modal-overlay{position:fixed;inset:0;z-index:400;background:rgba(0,0,0,.8);display:flex;align-items:center;justify-content:center}
.modal-box{background:var(--card);border-radius:16px;max-width:500px;width:92%;max-height:90vh;overflow-y:auto}
.modal-head{display:flex;justify-content:space-between;align-items:center;padding:20px 24px;border-bottom:1px solid rgba(128,128,128,.06)}.modal-head h3{font-size:18px;font-weight:700}
.modal-close{font-size:24px;background:none;border:none;color:#888;cursor:pointer}
.form-body{padding:20px 24px}.form-body label{display:block;font-size:12px;font-weight:600;margin:14px 0 4px;color:#888;text-transform:uppercase}.form-body input,.form-body textarea{width:100%;padding:10px 14px;border:1px solid rgba(128,128,128,.1);border-radius:8px;background:var(--bg);color:var(--tx);font-size:14px}.form-body textarea{resize:vertical}
.tabs{display:flex;border-radius:8px;overflow:hidden;border:1px solid rgba(128,128,128,.1);margin-bottom:4px}
.tabs button{flex:1;padding:8px;background:none;border:none;color:#888;font-size:13px;font-weight:600;cursor:pointer}.tabs button.on{background:rgba(128,128,128,.1);color:var(--tx)}
.cover-row{display:flex;gap:8px;align-items:center}.cover-row input[type=text]{flex:1}
.btn-main{margin-top:20px;width:100%}
@media(max-width:560px){.feed{grid-template-columns:1fr}}
</style>
