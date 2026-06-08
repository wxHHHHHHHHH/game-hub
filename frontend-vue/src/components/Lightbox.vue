<template>
  <div class="lb" v-if="show" @click.self="close">
    <button class="lb-close" @click="close">&times;</button>
    <button class="lb-nav lb-prev" @click="prev">‹</button>
    <img :src="photos[idx].imageUrl" class="lb-img">
    <p class="lb-cap">{{ photos[idx]?.caption }} · {{ photos[idx]?.album }}</p>
    <a :href="photos[idx]?.imageUrl" target="_blank" class="lb-original">查看原图</a>
    <button class="lb-nav lb-next" @click="next">›</button>
  </div>
</template>
<script setup>
import { ref } from 'vue'
const show = ref(false), photos = ref([]), idx = ref(0)
window.openLb = (list, i) => { photos.value = list; idx.value = i; show.value = true }
const close = () => show.value = false
const next = () => idx.value = (idx.value + 1) % photos.value.length
const prev = () => idx.value = (idx.value - 1 + photos.value.length) % photos.value.length
</script>
<style scoped>
.lb{position:fixed;inset:0;z-index:500;background:rgba(0,0,0,.96);display:flex;flex-direction:column;align-items:center;justify-content:center}
.lb-img{max-width:92vw;max-height:75vh;border-radius:8px}
.lb-close{position:absolute;top:20px;right:30px;font-size:32px;color:#fff;cursor:pointer;background:none;border:none}
.lb-nav{position:absolute;top:50%;font-size:40px;color:rgba(255,255,255,.5);cursor:pointer;transform:translateY(-50%);padding:10px;background:none;border:none}.lb-prev{left:10px}.lb-next{right:10px}.lb-nav:hover{color:#fff}
.lb-cap{margin-top:12px;color:#aaa;font-size:14px}
.lb-original{display:inline-block;margin-top:6px;padding:6px 16px;border:1px solid rgba(255,255,255,.15);border-radius:20px;color:#aaa;font-size:13px;text-decoration:none}.lb-original:hover{background:#fff;color:#000}
</style>
