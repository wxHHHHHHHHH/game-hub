<template>
  <div>
    <button class="back-link" @click="$router.back()">← 返回</button>
    <div v-if="v" class="detail-wrap">
      <div class="player-box">
        <iframe v-if="v.videoType==='BILIBILI'&&v.bilibiliBv" :src="'https://player.bilibili.com/player.html?bvid='+v.bilibiliBv+'&page=1&high_quality=1&autoplay=0'" allowfullscreen></iframe>
        <video v-else-if="v.videoType==='LOCAL'&&v.videoUrl" :src="v.videoUrl" controls></video>
        <div v-else class="no-player">无视频源</div>
      </div>
      <div class="detail-info">
        <h1>{{ v.title }}</h1>
        <div class="detail-meta">{{ v.game }} · {{ fmt(v.createdAt) }} · ▶{{ v.playCount }}次 · ❤{{ v.likes||0 }}</div>
        <div class="detail-actions">
          <button class="btn-like" :class="{liked}" @click="toggleLike">{{ liked?'❤ 已赞':'♡ 点赞'}} {{ v.likes }}</button>
          <button class="btn-sm" @click="editVid" v-if="canEdit">编辑</button>
          <button class="btn-sm danger" @click="delVid" v-if="isAdmin">删除</button>
        </div>
        <div class="detail-desc" v-if="v.description">{{ v.description }}</div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import api from '../api/index.js'
const route=useRoute(),router=useRouter(),auth=useAuthStore()
const v=ref(null),liked=ref(false)
const isAdmin=computed(()=>auth.isAdmin)
const canEdit=computed(()=>auth.user&&(auth.isAdmin||(auth.user.role==='MEMBER'&&auth.user.userId===v.value?.uploaderId)))
function fmt(d){return d?new Date(d).toLocaleDateString('zh-CN'):''}
async function load(){
  try{v.value=await api.getVideo(route.params.id)}catch(e){}
  if(auth.isLoggedIn) try{const r=await api.checkLiked(route.params.id);liked.value=r.liked}catch(e){}
}
async function toggleLike(){
  try{const r=liked.value?await api.unlikeVideo(v.value.id):await api.likeVideo(v.value.id);v.value.likes=r.likes;liked.value=!liked.value}catch(e){}
}
function editVid(){ /* TODO */ }
async function delVid(){ if(!confirm('确认删除？'))return;try{await api.deleteVideo(v.value.id);router.push('/videos')}catch(e){} }
onMounted(load)
</script>
<style scoped>
.back-link{display:inline-block;margin-bottom:20px;color:#888;font-size:14px;cursor:pointer;background:none;border:none}.back-link:hover{color:var(--tx)}
.detail-wrap{background:var(--card);border-radius:16px;overflow:hidden}
.player-box{aspect-ratio:16/9;background:#000}.player-box iframe,.player-box video{width:100%;height:100%;border:none}.no-player{display:flex;align-items:center;justify-content:center;height:100%;color:#666}
.detail-info{padding:24px}.detail-info h1{font-size:24px;font-weight:800;margin-bottom:8px}
.detail-meta{font-size:13px;color:#777;margin-bottom:16px}
.detail-actions{display:flex;gap:10px;align-items:center;margin-bottom:16px}
.btn-like{padding:8px 20px;border-radius:20px;border:1px solid rgba(128,128,128,.15);background:none;color:#999;font-size:14px;font-weight:600;cursor:pointer}.btn-like.liked{color:#f44;border-color:#f44}
.btn-sm{padding:6px 14px;font-size:13px;border-radius:8px;border:1px solid rgba(128,128,128,.15);background:none;color:#999;cursor:pointer}.btn-sm:hover{color:var(--tx)}.btn-sm.danger{color:#f44;border-color:#f44}
.detail-desc{color:#aaa;font-size:14px;line-height:1.8;white-space:pre-wrap}
</style>
