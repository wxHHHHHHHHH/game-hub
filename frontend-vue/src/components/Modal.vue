<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-box">
      <div class="modal-head"><h3>{{ title }}</h3><button class="modal-close" @click="$emit('close')">&times;</button></div>
      <div class="modal-body"><slot /></div>
    </div>
  </div>
</template>
<script setup>defineProps(['title']); defineEmits(['close'])</script>
<style scoped>
.modal-overlay{position:fixed;inset:0;z-index:400;background:rgba(0,0,0,.8);display:flex;align-items:center;justify-content:center}
.modal-box{background:var(--card);border-radius:16px;max-width:500px;width:92%;max-height:90vh;overflow-y:auto;border:1px solid rgba(128,128,128,.08)}
.modal-head{display:flex;justify-content:space-between;align-items:center;padding:20px 24px;border-bottom:1px solid rgba(128,128,128,.06)}
.modal-head h3{font-size:18px;font-weight:700}
.modal-close{font-size:24px;background:none;border:none;color:#888;cursor:pointer}.modal-close:hover{color:var(--tx)}
.modal-body{padding:20px 24px}
</style>
