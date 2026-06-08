<template>
  <div class="toast-bar">
    <div v-for="(m,i) in msgs" :key="i" class="toast-item">{{ m }}</div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
const msgs = ref([])
window.toast = (msg) => { msgs.value.push(msg); setTimeout(() => msgs.value.shift(), 2800) }
</script>
<style scoped>
.toast-bar{position:fixed;bottom:32px;left:50%;transform:translateX(-50%);z-index:600;display:flex;flex-direction:column;align-items:center;gap:8px;pointer-events:none}
.toast-item{background:var(--card);color:var(--tx);padding:10px 22px;border-radius:10px;font-size:13px;font-weight:600;border:1px solid rgba(128,128,128,.1);animation:toastIn .3s}
@keyframes toastIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
</style>
