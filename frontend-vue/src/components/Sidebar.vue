<template>
  <aside class="sidebar" :class="{ open: mobileOpen }">
    <div class="sidebar-brand">
      <img src="/img/logo.png" class="sidebar-logo" alt="波比">
      <span class="sidebar-name">波比</span>
    </div>
    <nav class="sidebar-nav">
      <router-link v-for="r in routes" :key="r.path" :to="r.path" class="nav-item" active-class="active" @click="mobileOpen=false">
        <span class="nav-icon" v-html="r.icon"></span><span>{{ r.label }}</span>
      </router-link>
    </nav>
    <div class="sidebar-footer">
      <div class="theme-dots">
        <button v-for="t in theme.presets" :key="t.key" class="theme-dot" :class="{ active: theme.current === t.key }" :style="{ background: t.ac }" @click="theme.setTheme(t.key)" :title="t.nm"></button>
      </div>
      <button v-if="!auth.isLoggedIn" class="btn-ghost" @click="$router.push('/login')">登录</button>
      <div v-else class="user-mini">
        <span class="user-dot" :style="{ background: auth.user?.avatarColor || '#888' }">{{ (auth.user?.displayName||'?')[0] }}</span>
        <button class="btn-ghost" @click="auth.logout()">退出</button>
      </div>
    </div>
  </aside>
  <button class="hamburger" @click="mobileOpen=!mobileOpen">☰</button>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useThemeStore } from '../stores/theme.js'
const auth = useAuthStore(), theme = useThemeStore()
const mobileOpen = ref(false)
const routes = [
  { path: '/', label: '首页', icon: '⌂' },
  { path: '/videos', label: '视频', icon: '▶' },
  { path: '/news', label: '新闻', icon: '☰' },
  { path: '/gallery', label: '相册', icon: '▣' },
  { path: '/intro', label: '简介', icon: 'ℹ' },
  { path: '/contact', label: '联系', icon: '✉' },
  { path: '/admin', label: '管理', icon: '⚙', admin: true },
]
</script>

<style scoped>
.sidebar{width:240px;background:var(--card);position:fixed;top:0;bottom:0;left:0;z-index:100;display:flex;flex-direction:column;padding:24px 16px;border-right:1px solid rgba(128,128,128,.1);transition:transform .3s}
.sidebar-brand{display:flex;align-items:center;gap:10px;margin-bottom:36px}
.sidebar-logo{width:40px;height:40px;border-radius:10px}
.sidebar-name{font-size:20px;font-weight:800;letter-spacing:-.5px}
.sidebar-nav{flex:1;display:flex;flex-direction:column;gap:2px}
.nav-item{display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:10px;font-size:14px;font-weight:500;color:#888;text-decoration:none;transition:all .15s}
.nav-item:hover{color:#ddd;background:rgba(128,128,128,.06)}
.nav-item.active{color:var(--ac);background:rgba(128,128,128,.08);font-weight:600}
.nav-icon{font-size:18px;width:24px;text-align:center}
.sidebar-footer{padding-top:16px;border-top:1px solid rgba(128,128,128,.08)}
.theme-dots{display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap}
.theme-dot{width:20px;height:20px;border-radius:50%;border:2px solid transparent;cursor:pointer;transition:all .15s;padding:0}
.theme-dot.active{border-color:var(--tx)}
.theme-dot:hover{transform:scale(1.2)}
.user-mini{display:flex;align-items:center;gap:8px}
.user-dot{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#fff}
.hamburger{display:none;position:fixed;top:12px;left:12px;z-index:200;background:var(--card);border:1px solid rgba(128,128,128,.15);color:var(--tx);font-size:20px;width:40px;height:40px;border-radius:8px;cursor:pointer}
.btn-ghost{padding:6px 14px;background:none;border:1px solid rgba(128,128,128,.15);border-radius:8px;color:#999;font-size:13px;cursor:pointer}
.btn-ghost:hover{color:var(--tx);border-color:rgba(128,128,128,.3)}
@media(max-width:768px){.sidebar{transform:translateX(-100%)}.sidebar.open{transform:translateX(0)}.hamburger{display:flex;align-items:center;justify-content:center}}
</style>
