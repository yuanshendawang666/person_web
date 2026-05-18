<script setup>
import { useAuthStore } from './stores/auth'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from './components/layout/Sidebar.vue'

const auth = useAuthStore()
const router = useRouter()

onMounted(async () => {
  if (auth.token) {
    await auth.fetchUser()
  }
})
</script>

<template>
  <div class="blur-ball ball1"></div>
  <div class="blur-ball ball2"></div>

  <!-- 右上角用户操作 -->
  <div class="top-right">
    <template v-if="auth.isLoggedIn">
      <router-link to="/profile" class="tr-avatar"
        :style="auth.user?.avatar ? `background-image:url(${auth.user.avatar});background-size:cover` : ''">
      </router-link>
      <span class="tr-name">{{ auth.user?.username }}</span>
      <button class="tr-btn" @click="auth.logout(); router.push('/')">退出</button>
    </template>
    <template v-else>
      <button class="tr-btn primary" @click="router.push('/login')">登录</button>
      <button class="tr-btn outline" @click="router.push('/register')">注册</button>
    </template>
  </div>

  <div class="container" style="width:1400px; max-width:95%; margin:auto; padding:40px 0; display:flex; gap:25px;">
    <Sidebar />
    <main style="flex:1;">
      <router-view />
    </main>
  </div>

</template>

<style scoped>
.top-right {
  position: fixed;
  top: 20px;
  right: 24px;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(15, 23, 42, 0.3);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 50px;
  padding: 5px 6px 5px 14px;
  box-shadow: 0 4px 30px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.03);
}
.tr-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, #60a5fa, #6366f1);
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}
.tr-name {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255,255,255,0.8);
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tr-btn {
  padding: 8px 18px;
  border: none;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
  background: rgba(255,255,255,0.04);
  color: rgba(255,255,255,0.5);
  letter-spacing: 0.02em;
}
.tr-btn:hover { background: rgba(255,255,255,0.1); color: white; }
.tr-btn.primary {
  background: linear-gradient(135deg, rgba(96,165,250,0.8), rgba(99,102,241,0.8));
  color: white;
}
.tr-btn.primary:hover { opacity: 0.85; }
.tr-btn.outline {
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.02);
  color: rgba(255,255,255,0.5);
}
</style>
