<template>
  <div>
    <div class="page-head"><h2>相册</h2><div class="upload-row"><input type="date" v-model="pdate" class="chip"><input type="file" accept="image/*" multiple hidden ref="pfile" @change="doUpload"><button class="btn-main" @click="$refs.pfile.click()" v-if="auth.canPost">上传照片</button></div></div>
    <div class="gallery-wall"><div v-for="(p,i) in photos" :key="p.id" class="gal-item" @click="openLb(photos,i)"><img :src="p.thumbnailUrl||p.imageUrl" loading="lazy"></div></div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import api from '../api/index.js'
const auth=useAuthStore(),photos=ref([]),pdate=ref(''),pfile=ref(null)
async function load(){try{photos.value=await api.getPhotos()}catch(e){}}
async function doUpload(){
  const files=pfile.value.files;if(!files||!files.length)return
  for(let f of files){try{await api.uploadPhoto(f,'','默认相册',pdate.value,auth.user?.displayName)}catch(e){}}
  pfile.value.value='';load();window.toast&&toast('上传完成')
}
onMounted(load)
</script>
<style scoped>
.page-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;flex-wrap:wrap;gap:12px}.page-head h2{font-size:28px;font-weight:800}
.upload-row{display:flex;gap:8px;align-items:center}
.chip{padding:6px 16px;border-radius:20px;border:1px solid rgba(128,128,128,.1);background:var(--card);color:#999;font-size:13px}
.btn-main{padding:10px 22px;background:var(--ac);color:var(--bg);border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer}
.gallery-wall{columns:4 220px;column-gap:12px}.gal-item{break-inside:avoid;margin-bottom:12px;border-radius:10px;overflow:hidden;cursor:pointer;transition:transform .2s}.gal-item:hover{transform:scale(1.02)}.gal-item img{width:100%;display:block}
@media(max-width:768px){.gallery-wall{columns:3 160px}}@media(max-width:480px){.gallery-wall{columns:2 140px}}
</style>
