<template>
  <div>
    <h2 class="page-title">联系</h2>
    <div class="contact-grid">
      <div class="contact-card"><div class="c-icon">📍</div><div><h4>地址</h4><p>{{ c?.address||'北京市朝阳区' }}</p></div></div>
      <div class="contact-card"><div class="c-icon">📞</div><div><h4>电话</h4><p>{{ c?.phone||'010-88886666' }}</p></div></div>
      <div class="contact-card"><div class="c-icon">📧</div><div><h4>邮箱</h4><p>{{ c?.email||'info@bobi.cn' }}</p></div></div>
      <div class="contact-card"><div class="c-icon">🕐</div><div><h4>工作时间</h4><p>{{ c?.workHours||'周一至周五 9:00-18:00' }}</p></div></div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import api from '../api/index.js'
const c=ref(null)
onMounted(async()=>{try{c.value=await api.getContact()}catch(e){}})
</script>
<style scoped>
.page-title{font-size:28px;font-weight:800;margin-bottom:28px}
.contact-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px}
.contact-card{background:var(--card);border-radius:14px;padding:24px;display:flex;align-items:flex-start;gap:16px}.c-icon{font-size:28px;flex-shrink:0}.contact-card h4{font-size:14px;font-weight:700;margin-bottom:4px}.contact-card p{font-size:13px;color:#999;line-height:1.6}
@media(max-width:480px){.contact-card{flex-direction:column;align-items:center;text-align:center}}
</style>
