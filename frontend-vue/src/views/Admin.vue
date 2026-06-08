<template>
  <div>
    <h2 class="page-title">管理</h2>
    <div class="admin-tabs">
      <button v-for="t in tabs" :key="t" class="tab" :class="{on:cur===t}" @click="cur=t">{{ t }}</button>
    </div>
    <!-- Stats -->
    <div v-if="cur==='数据'" class="stat-grid">
      <div class="stat-card"><div class="stat-num">{{ stats.videos }}</div><div class="stat-label">视频</div></div>
      <div class="stat-card"><div class="stat-num">{{ stats.users }}</div><div class="stat-label">用户</div></div>
      <div class="stat-card"><div class="stat-num">{{ stats.files }}</div><div class="stat-label">文件</div></div>
    </div>
    <!-- Users -->
    <div v-if="cur==='用户'">
      <form @submit.prevent="addUser" class="add-row"><input v-model="uName" placeholder="用户名" required><input v-model="uPass" placeholder="密码" required><input v-model="uDisp" placeholder="显示名" required><select v-model="uRole"><option value="MEMBER">成员</option><option value="ADMIN">管理</option><option value="VISITOR">游客</option></select><button class="btn-main btn-sm">添加</button></form>
      <div v-for="u in users" :key="u.id" class="user-row"><span class="u-avatar">{{ u.displayName[0] }}</span><div class="u-info"><b>{{ u.displayName }}</b><small>@{{ u.username }} · {{ u.role }}</small></div><select :value="u.role" @change="chRole(u.id,$event.target.value)" v-if="u.username!=='admin'"><option value="ADMIN">管理</option><option value="MEMBER">成员</option><option value="VISITOR">游客</option></select><button class="btn-sm danger" @click="delUser(u.id)" v-if="u.username!=='admin'">删除</button></div>
    </div>
  </div>
</template>
<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import api from '../api/index.js'
const auth=useAuthStore()
const cur=ref('数据'),tabs=['数据','用户']
const stats=reactive({videos:0,users:0,files:0})
const users=ref([]),uName=ref(''),uPass=ref(''),uDisp=ref(''),uRole=ref('MEMBER')
async function loadStats(){try{const [v,us,fs]=await Promise.all([api.getVideos(),api.getUsers(),api.getFiles()]);stats.videos=v.length;stats.users=us.length;stats.files=fs.length}catch(e){}}
async function loadUsers(){try{users.value=await api.getUsers()}catch(e){}}
async function addUser(){try{await api.createUser({username:uName.value,password:uPass.value,displayName:uDisp.value,role:uRole.value});uName.value='';uPass.value='';uDisp.value='';loadUsers()}catch(e){}}
async function chRole(id,role){try{await api.updateUserRole(id,role);loadUsers()}catch(e){}}
async function delUser(id){if(!confirm('确认删除？'))return;try{await api.deleteUser(id);loadUsers()}catch(e){}}
onMounted(()=>{loadStats();loadUsers()})
</script>
<style scoped>
.page-title{font-size:28px;font-weight:800;margin-bottom:24px}
.admin-tabs{display:flex;gap:6px;margin-bottom:24px}.tab{padding:8px 20px;border-radius:20px;border:1px solid rgba(128,128,128,.1);background:var(--card);color:#999;font-size:13px;cursor:pointer;font-weight:600}.tab.on{background:var(--ac);color:var(--bg)}
.stat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:16px;margin-bottom:24px}
.stat-card{background:var(--card);border-radius:14px;padding:24px;text-align:center}.stat-num{font-size:36px;font-weight:800}.stat-label{font-size:13px;color:#888;margin-top:4px}
.add-row{display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap}.add-row input,.add-row select{padding:8px 14px;border:1px solid rgba(128,128,128,.1);border-radius:8px;background:var(--bg);color:var(--tx);font-size:13px;flex:1;min-width:100px}.add-row select{cursor:pointer}
.user-row{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid rgba(128,128,128,.06);flex-wrap:wrap}.u-avatar{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(128,128,128,.15);font-weight:700;font-size:14px;flex-shrink:0}.u-info{flex:1}.u-info b{display:block;font-size:14px}.u-info small{font-size:12px;color:#777}.user-row select{padding:4px 8px;border:1px solid rgba(128,128,128,.1);border-radius:6px;background:var(--bg);color:var(--tx);font-size:12px}
.btn-main{padding:10px 22px;background:var(--ac);color:var(--bg);border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer}.btn-main.btn-sm{padding:8px 16px;font-size:13px}
.btn-sm{padding:6px 14px;font-size:13px;border:1px solid rgba(128,128,128,.15);border-radius:8px;background:none;color:#999;cursor:pointer}.btn-sm:hover{color:var(--tx)}.btn-sm.danger{color:#f44;border-color:#f44}
</style>
