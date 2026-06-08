<template>
  <div class="login-page">
    <div class="login-box">
      <img src="/img/logo.png" class="login-logo" alt="波比">
      <h2>波比</h2>
      <div class="login-error" v-if="error">{{ error }}</div>
      <form @submit.prevent="doLogin">
        <label>用户名</label><input v-model="uname" placeholder="用户名" required>
        <label>密码</label><input v-model="pwd" type="password" placeholder="密码" required>
        <button class="btn-main" type="submit">登录</button>
      </form>
      <p class="login-hint">admin / admin123 · player / player123</p>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
const auth = useAuthStore(), router = useRouter()
const uname = ref(''), pwd = ref(''), error = ref('')
async function doLogin(){
  try { await auth.login(uname.value, pwd.value); router.push('/') } catch(e) { error.value = e?.error || '登录失败' }
}
</script>
<style scoped>
.login-page{display:flex;align-items:center;justify-content:center;min-height:100vh;background:var(--bg)}
.login-box{background:var(--card);border-radius:16px;padding:40px;width:90%;max-width:360px;border:1px solid rgba(128,128,128,.06);text-align:center}
.login-logo{width:100px;height:100px;border-radius:20px;margin-bottom:12px}
.login-box h2{font-size:24px;font-weight:800;margin-bottom:24px}
.login-box label{text-align:left;display:block;font-size:12px;font-weight:600;margin:12px 0 4px;color:#888;text-transform:uppercase;letter-spacing:.5px}
.login-box input{width:100%;padding:10px 14px;border:1px solid rgba(128,128,128,.1);border-radius:8px;background:var(--bg);color:var(--tx);font-size:14px}
.btn-main{width:100%;padding:12px;margin-top:20px;background:var(--ac);color:var(--bg);border:none;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;transition:opacity .2s}.btn-main:hover{opacity:.85}
.login-error{color:#f44;font-size:13px;margin-bottom:8px}
.login-hint{margin-top:20px;font-size:11px;color:#666;line-height:1.6}
</style>
