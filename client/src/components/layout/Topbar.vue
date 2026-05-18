<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const titles = {
  '/': '总空间',
  '/life': '生活模块',
  '/study': '学习模块',
  '/game': '游戏模块',
  '/login': '登录',
  '/register': '注册',
  '/profile': '个人资料',
  '/admin/publish': '发布动态',
}

const descs = {
  '/': '所有模块动态都会同步显示在这里',
  '/life': '日常、旅游、美食、照片、心情记录',
  '/study': '编程、AI、技术笔记、学习计划',
  '/game': '游戏截图、通关记录、联机日常',
}

const title = computed(() => {
  if (route.path.startsWith('/post/')) return '动态详情'
  return titles[route.path] || ''
})

const desc = computed(() => descs[route.path] || '')
</script>

<template>
  <div class="topbar glass" style="border-radius:30px; padding:25px 30px; display:flex; justify-content:space-between; align-items:center;">
    <div>
      <div class="top-title">{{ title }}</div>
      <div class="top-desc" v-if="desc">{{ desc }}</div>
    </div>
    <button
      v-if="auth.isAdmin && !['/admin/publish', '/login', '/register'].includes(route.path)"
      class="publish-btn"
      @click="router.push('/admin/publish')"
    >
      发布动态
    </button>
  </div>
</template>

<style scoped>
.top-title { font-size: 28px; font-weight: 700; }
.top-desc { margin-top: 8px; color: rgba(255,255,255,0.6); }
.publish-btn {
  padding: 14px 24px;
  border: none;
  border-radius: 18px;
  background: linear-gradient(135deg, #60a5fa, #8b5cf6);
  color: white;
  font-size: 15px;
  cursor: pointer;
  transition: opacity 0.3s;
}
.publish-btn:hover { opacity: 0.85; }
</style>
