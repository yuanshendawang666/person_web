<script setup>
import { ref, onMounted, provide } from 'vue'
import { useAuthStore } from './stores/auth'
import { useRouter } from 'vue-router'
import Sidebar from './components/layout/Sidebar.vue'
import Toast from './components/common/Toast.vue'

const auth = useAuthStore()
const router = useRouter()
const toast = ref(null)
const sidebarOpen = ref(false)

provide('toast', (msg, type) => toast.value?.show(msg, type))

onMounted(async () => {
  if (auth.token) await auth.fetchUser()
})
</script>

<template>
  <div class="blur-ball ball1"></div>
  <div class="blur-ball ball2"></div>
  <Toast ref="toast" />

  <!-- 右上角用户操作 -->
  <div class="top-right">
    <button class="hamburger" @click="sidebarOpen = !sidebarOpen">☰</button>
    <template v-if="auth.isLoggedIn">
      <router-link to="/profile" class="tr-avatar"
        :style="auth.user?.avatar ? `background-image:url(${auth.user.avatar});background-size:cover` : ''">
      </router-link>
      <span class="tr-name">{{ auth.user?.username }}</span>
      <router-link to="/messages" class="tr-msg-icon" title="私信">✉️</router-link>
      <button class="tr-btn" @click="auth.logout(); router.push('/')">退出</button>
    </template>
    <template v-else>
      <button class="tr-btn primary" @click="router.push('/login')">登录</button>
      <button class="tr-btn outline" @click="router.push('/register')">注册</button>
    </template>
  </div>

  <!-- 移动端侧边栏遮罩 -->
  <div class="sidebar-overlay" :class="{ open: sidebarOpen }" @click="sidebarOpen = false"></div>

  <div class="container">
    <Sidebar :class="{ 'mobile-open': sidebarOpen }" />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<style>
/* 移动端全局样式 */
@media (max-width: 900px) {
  .blur-ball { display: none; }
  .top-right { top: 8px; right: 8px; padding: 4px 4px 4px 10px; gap: 6px; border-radius: 30px; }
  .top-right .tr-name { display: none; }
  .top-right .tr-avatar { width: 28px; height: 28px; }
  .top-right .tr-btn { padding: 6px 12px; font-size: 12px; }
  .top-right .tr-msg-icon { font-size: 18px; padding: 4px; }
  .container { flex-direction: column !important; padding: 60px 12px 20px !important; max-width: 100% !important; gap: 12px !important; }
  .main-content { width: 100%; overflow: hidden; }
  .sidebar-overlay.open { display: block !important; }
  .glass-card { padding: 16px !important; border-radius: 16px !important; }
  .page-title { font-size: 20px !important; }
  .post-title { font-size: 18px !important; }
}
</style>

<style scoped>
.hamburger {
  display: none;
  background: none;
  border: none;
  color: rgba(255,255,255,0.7);
  font-size: 20px;
  cursor: pointer;
  padding: 4px 8px;
}
@media (max-width: 900px) {
  .hamburger { display: inline-block; }
}
.top-right {
  position: fixed; top: 20px; right: 24px; z-index: 200;
  display: flex; align-items: center; gap: 12px;
  background: rgba(15, 23, 42, 0.3);
  backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px);
  border: 1px solid rgba(255,255,255,0.06); border-radius: 50px;
  padding: 5px 6px 5px 14px;
  box-shadow: 0 4px 30px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.03);
}
.tr-avatar {
  width: 34px; height: 34px; border-radius: 50%;
  background: linear-gradient(135deg, #60a5fa, #6366f1); flex-shrink: 0;
}
.tr-name { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.8); max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tr-btn {
  padding: 8px 18px; border: none; border-radius: 999px; font-size: 13px; font-weight: 500;
  cursor: pointer; transition: all 0.25s; background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.5);
}
.tr-btn:hover { background: rgba(255,255,255,0.1); color: white; }
.tr-btn.primary { background: linear-gradient(135deg, rgba(96,165,250,0.8), rgba(99,102,241,0.8)); color: white; }
.tr-btn.primary:hover { opacity: 0.85; }
.tr-btn.outline { border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.02); color: rgba(255,255,255,0.5); }
.tr-msg-icon { font-size: 20px; text-decoration: none; color: rgba(255,255,255,0.5); transition: color 0.2s; padding: 6px; }
.tr-msg-icon:hover { color: #fde68a; }
.container { width: 1400px; max-width: 95%; margin: auto; padding: 80px 0 40px; display: flex; gap: 25px; }
.main-content { flex: 1; min-width: 0; }
.sidebar-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 149; }
</style>
