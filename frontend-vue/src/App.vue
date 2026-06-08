<template>
  <div class="app-shell" :class="themeClass">
    <Sidebar />
    <main class="main-content">
      <router-view />
    </main>
    <Modal v-if="modal.show" :title="modal.title" @close="modal.close">
      <component :is="modal.component" v-bind="modal.props" />
    </Modal>
    <Lightbox />
    <Toast />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useThemeStore } from './stores/theme.js'
import Sidebar from './components/Sidebar.vue'
import Modal from './components/Modal.vue'
import Lightbox from './components/Lightbox.vue'
import Toast from './components/Toast.vue'

const theme = useThemeStore()
const themeClass = computed(() => theme.current ? 'theme-' + theme.current : '')
const modal = { show: false, title: '', component: null, props: {}, close: () => modal.show = false }
window._modal = modal
</script>

<style scoped>
.app-shell { display:flex; min-height:100vh; }
.main-content { flex:1; margin-left:240px; padding:48px 56px; max-width:1200px; transition:margin .3s; }
@media(max-width:768px){ .main-content { margin-left:0; padding:24px 16px; } }
</style>
