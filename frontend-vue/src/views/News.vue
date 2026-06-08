<template>
  <div>
    <div class="page-head"><h2>新闻</h2><button class="btn-main" @click="showAdd=true" v-if="auth.isAdmin">发布新闻</button></div>
    <div class="news-list"><div v-for="n in news" :key="n.id" class="news-item"><h3>{{ n.title }}</h3><p class="news-summary" v-if="n.summary">{{ n.summary }}</p><div class="news-meta">{{ n.category }} · {{ fmt(n.createdAt) }}<span v-if="n.important" class="tag-imp">重要</span></div></div></div>
    <div class="modal-overlay" v-if="showAdd" @click.self="showAdd=false">
      <div class="modal-box"><div class="modal-head"><h3>发布新闻</h3><button class="modal-close" @click="showAdd=false">&times;</button></div>
        <form @submit.prevent="doAdd" class="form-body">
          <label>标题</label><input v-model="ntitle" required placeholder="新闻标题">
          <label>摘要</label><input v-model="nsummary" placeholder="简短摘要">
          <label>正文</label><textarea v-model="ncontent" rows="6" required></textarea>
          <label class="chk"><input type="checkbox" v-model="nimp"> 标记为重要</label>
          <button class="btn-main" type="submit">发布</button>
        </form>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import api from '../api/index.js'
const auth=useAuthStore(),news=ref([]),showAdd=ref(false),ntitle=ref(''),nsummary=ref(''),ncontent=ref(''),nimp=ref(false)
function fmt(d){return d?new Date(d).toLocaleDateString('zh-CN'):''}
async function load(){try{news.value=await api.getNews()}catch(e){}}
async function doAdd(){try{await api.createNews({title:ntitle.value,summary:nsummary.value,content:ncontent.value,category:'集团动态',important:nimp.value});showAdd.value=false;ntitle.value='';nsummary.value='';ncontent.value='';load();window.toast&&toast('发布成功')}catch(e){}}
onMounted(load)
</script>
<style scoped>
.page-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px}.page-head h2{font-size:28px;font-weight:800}
.news-list{display:flex;flex-direction:column;gap:1px;background:rgba(128,128,128,.04);border-radius:12px;overflow:hidden}
.news-item{padding:18px 20px;background:var(--card);cursor:pointer;transition:background .15s}.news-item:hover{background:rgba(128,128,128,.02)}.news-item h3{font-size:16px;font-weight:600;margin-bottom:4px}.news-summary{font-size:13px;color:#999;margin-bottom:4px}.news-meta{font-size:12px;color:#777}.tag-imp{display:inline-block;margin-left:8px;padding:1px 8px;background:var(--ac);color:var(--bg);border-radius:4px;font-size:11px;font-weight:700}
.btn-main{padding:10px 22px;background:var(--ac);color:var(--bg);border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer}
.modal-overlay{position:fixed;inset:0;z-index:400;background:rgba(0,0,0,.8);display:flex;align-items:center;justify-content:center}
.modal-box{background:var(--card);border-radius:16px;max-width:500px;width:92%;max-height:90vh;overflow-y:auto}.modal-head{display:flex;justify-content:space-between;align-items:center;padding:20px 24px;border-bottom:1px solid rgba(128,128,128,.06)}.modal-head h3{font-size:18px;font-weight:700}.modal-close{font-size:24px;background:none;border:none;color:#888;cursor:pointer}
.form-body{padding:20px 24px}.form-body label{display:block;font-size:12px;font-weight:600;margin:14px 0 4px;color:#888;text-transform:uppercase}.form-body input,.form-body textarea{width:100%;padding:10px 14px;border:1px solid rgba(128,128,128,.1);border-radius:8px;background:var(--bg);color:var(--tx);font-size:14px}
.chk{display:flex;align-items:center;gap:8px;text-transform:none;font-size:14px;margin-top:12px}.chk input{width:auto}
.btn-main{margin-top:20px;width:100%}
</style>
