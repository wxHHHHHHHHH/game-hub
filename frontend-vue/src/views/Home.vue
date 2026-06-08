<template>
  <div>
    <div class="hero">
      <h1>记录每一刻</h1>
      <p>波比团队视频空间 — 分享、交流、留存</p>
      <div class="search"><input v-model="kw" placeholder="搜索视频..." @input="search"></div>
    </div>
    <div class="feed">
      <div v-for="v in videos" :key="v.id" class="vid-card" @click="openVid(v.id)">
        <div class="vid-thumb">
          <img :src="v.thumbnailUrl||placeholder" loading="lazy" @error="e=>e.target.style.display='none'">
          <div class="vid-play"><span>▶</span></div>
        </div>
        <div class="vid-body">
          <h3>{{ v.title }}</h3>
          <div class="vid-meta"><span>{{ v.game }}</span><span>{{ fmt(v.createdAt) }}</span></div>
          <div class="vid-likes">❤ {{ v.likes||0 }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api/index.js'
const router = useRouter(), videos = ref([]), kw = ref('')
const placeholder = 'data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><rect fill="#1a1a1a" width="640" height="360"/><text fill="#444" x="320" y="180" text-anchor="middle" font-size="48">🎬</text></svg>')
function fmt(d){ return d ? new Date(d).toLocaleDateString('zh-CN') : '' }
function openVid(id){ router.push('/videos/'+id) }
async function load(s){ try{videos.value=await api.getVideos('latest',s||undefined)}catch(e){} }
let timer;
function search(){ clearTimeout(timer); timer = setTimeout(()=>load(kw.value), 300) }
onMounted(()=>load())
</script>
<style scoped>
.hero{padding:60px 0 32px}.hero h1{font-size:clamp(2rem,5vw,3.5rem);font-weight:800;letter-spacing:-1px;margin-bottom:8px}.hero p{color:#888;font-size:16px;margin-bottom:24px}.search input{width:100%;max-width:480px;padding:14px 18px;border:1px solid rgba(128,128,128,.1);border-radius:12px;background:var(--card);color:var(--tx);font-size:15px}
.feed{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:20px}
.vid-card{border-radius:12px;overflow:hidden;background:var(--card);cursor:pointer;transition:all .2s}.vid-card:hover{transform:translateY(-3px);box-shadow:0 8px 30px rgba(0,0,0,.4)}
.vid-thumb{aspect-ratio:16/9;position:relative;overflow:hidden;background:#1a1a1a}
.vid-thumb img{width:100%;height:100%;object-fit:cover}
.vid-play{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.3);opacity:0;transition:opacity .2s}.vid-card:hover .vid-play{opacity:1}
.vid-play span{width:44px;height:44px;background:rgba(255,255,255,.9);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;color:#000}
.vid-body{padding:14px 16px 16px}.vid-body h3{font-size:16px;font-weight:600;margin-bottom:4px;line-height:1.3}
.vid-meta{font-size:12px;color:#777;display:flex;gap:10px;margin-bottom:4px}
.vid-likes{font-size:12px;color:#999}
@media(max-width:560px){.feed{grid-template-columns:1fr}}
</style>
