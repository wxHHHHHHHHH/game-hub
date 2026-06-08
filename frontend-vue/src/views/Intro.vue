<template>
  <div>
    <h2 class="page-title">简介</h2>
    <div class="about-card"><p>波比是一个综合性企业集团，致力于多领域业务发展，秉承创新、协作、共赢的核心价值观。</p></div>
    <div class="file-section"><h3>文件资料</h3>
      <div v-for="f in files" :key="f.id" class="file-row"><span>📄 {{ f.fileName }}</span><span class="file-size">{{ fmtSize(f.fileSize) }}</span>
        <div class="file-btns"><a :href="apiUrl+'/files/'+f.id+'/view'" target="_blank" class="btn-sm">查看</a><a :href="apiUrl+'/files/'+f.id+'/download'" class="btn-sm">下载</a></div>
      </div>
      <div class="upload-row" v-if="auth.isAdmin"><input v-model="flabel" placeholder="文件名称"><input type="file" hidden ref="ffile" @change="doUpload"><button class="btn-main btn-sm" @click="$refs.ffile.click()">上传文件</button></div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import api from '../api/index.js'
const auth=useAuthStore(),files=ref([]),flabel=ref(''),ffile=ref(null)
const apiUrl = window.location.hostname==='localhost'?'http://localhost:27890/api':'/api'
function fmtSize(s){return s>1048576?(s/1048576).toFixed(1)+'MB':Math.round(s/1024)+'KB'}
async function load(){try{files.value=await api.getFiles()}catch(e){}}
async function doUpload(){const f=ffile.value.files[0];if(!f)return;const l=flabel.value||f.name;try{await api.uploadFile(f,l);flabel.value='';load();window.toast&&toast('上传成功')}catch(e){}}
onMounted(load)
</script>
<style scoped>
.page-title{font-size:28px;font-weight:800;margin-bottom:28px}
.about-card{background:var(--card);border-radius:14px;padding:28px;font-size:15px;line-height:1.8;color:#aaa;margin-bottom:32px}
.file-section h3{font-size:18px;font-weight:700;margin-bottom:16px}
.file-row{display:flex;align-items:center;justify-content:space-between;padding:14px 0;border-bottom:1px solid rgba(128,128,128,.06);flex-wrap:wrap;gap:8px}
.file-row:last-child{border-bottom:none}.file-size{font-size:12px;color:#777}.file-btns{display:flex;gap:6px}
.btn-sm{padding:6px 14px;font-size:13px;border:1px solid rgba(128,128,128,.15);border-radius:8px;background:none;color:#999;cursor:pointer;text-decoration:none}.btn-sm:hover{color:var(--tx)}
.upload-row{display:flex;gap:8px;margin-top:16px;align-items:center}.upload-row input{padding:8px 14px;border:1px solid rgba(128,128,128,.1);border-radius:8px;background:var(--bg);color:var(--tx);font-size:14px;flex:1}
.btn-main{padding:10px 22px;background:var(--ac);color:var(--bg);border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer}.btn-main.btn-sm{padding:8px 16px;font-size:13px}
</style>
