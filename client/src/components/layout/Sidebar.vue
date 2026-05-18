<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useRouter, useRoute } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const userTags = computed(() => {
  if (!auth.user?.tags) return []
  try {
    return typeof auth.user.tags === 'string' ? JSON.parse(auth.user.tags) : auth.user.tags
  } catch { return [] }
})

const menuItems = [
  { path: '/', label: '总空间', icon: '🏠' },
  { path: '/life', label: '生活', icon: '🌿' },
  { path: '/study', label: '学习', icon: '📚' },
  { path: '/game', label: '游戏', icon: '🎮' },
  { path: '/discuss', label: '讨论区', icon: '💬' },
]

function go(path) {
  router.push(path)
}

function isActive(path) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<template>
  <aside style="width:300px; display:flex; flex-direction:column; gap:16px;">

    <!-- 个人信息卡片 -->
    <div class="profile-card glass-card" style="padding:22px;">
      <router-link to="/profile">
        <div class="avatar" :style="auth.user?.avatar ? `background-image:url(${auth.user.avatar});background-size:cover` : ''"></div>
      </router-link>
      <div class="name">{{ auth.user?.username || '访客' }}</div>
      <div class="bio">{{ auth.user?.bio || '记录生活、学习与游戏。' }}</div>

      <div class="tags" v-if="auth.user && userTags.length > 0">
        <span
          v-for="(t, i) in userTags"
          :key="i"
          class="tag"
          :style="{ background: t.color + '22', borderColor: t.color + '44', color: t.color }"
        >{{ t.name }}</span>
      </div>
    </div>

    <!-- 导航卡片 -->
    <div class="nav-card glass-card" style="padding:14px 16px;">
      <div
        v-for="item in menuItems"
        :key="item.path"
        class="menu-item"
        :class="{ active: isActive(item.path) }"
        @click="go(item.path)"
      >
        <span class="menu-icon">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div v-if="auth.isLoggedIn" class="actions-card glass-card" style="padding:14px;">
      <button v-if="auth.user?.id === 1" class="act-btn primary" @click="router.push('/admin/publish')">✏️ 发布动态</button>
      <button v-if="auth.isAdmin" class="act-btn approve" @click="router.push('/admin/users')">👥 用户管理</button>
      <router-link to="/messages" class="act-btn msg-link">✉️ 私信</router-link>
      <button v-if="auth.user?.id !== 1" class="act-btn dm-admin" @click="router.push('/messages/1')">💌 私信站长</button>
    </div>

  </aside>
</template>

<style scoped>
.profile-card { text-align: center; }
.avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, #60a5fa, #8b5cf6);
  margin: 0 auto 14px;
  cursor: pointer;
  transition: transform 0.35s cubic-bezier(0.4,0,0.2,1);
  box-shadow: 0 0 0 3px rgba(96,165,250,0.2);
}
.avatar:hover { transform: scale(1.06); box-shadow: 0 0 0 4px rgba(96,165,250,0.35); }
.name {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.03em;
}
.bio {
  color: rgba(255,255,255,0.45);
  margin-top: 6px;
  line-height: 1.6;
  font-size: 12px;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
  margin-top: 14px;
}
.tag {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 500;
  border: 1px solid;
}
.menu-item {
  padding: 13px 14px;
  border-radius: 12px;
  background: transparent;
  transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255,255,255,0.65);
}
.menu-item + .menu-item { margin-top: 2px; }
.menu-item:hover {
  background: rgba(255,255,255,0.07);
  transform: translateX(3px);
  color: rgba(255,255,255,0.9);
}
.menu-item.active {
  background: rgba(96,165,250,0.15);
  color: #93c5fd;
  font-weight: 600;
}
.menu-icon { font-size: 15px; width: 22px; text-align: center; }

.act-btn {
  display: block;
  width: 100%;
  padding: 10px 14px;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
  text-align: center;
  text-decoration: none;
  box-sizing: border-box;
  letter-spacing: 0.02em;
}
.act-btn + .act-btn { margin-top: 6px; }
.act-btn.primary {
  background: linear-gradient(135deg, #60a5fa, #6366f1);
  color: white;
  box-shadow: 0 2px 8px rgba(99,102,241,0.25);
}
.act-btn.primary:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 4px 14px rgba(99,102,241,0.35); }
.act-btn.approve {
  background: rgba(52,211,153,0.1);
  border: 1px solid rgba(52,211,153,0.25);
  color: #6ee7b7;
}
.act-btn.approve:hover { background: rgba(52,211,153,0.18); }
.msg-link {
  display: block;
  width: 100%;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  text-align: center;
  text-decoration: none;
  box-sizing: border-box;
  background: rgba(250,204,21,0.08);
  border: 1px solid rgba(250,204,21,0.2);
  color: #fde68a;
  transition: all 0.25s;
}
.msg-link:hover { background: rgba(250,204,21,0.16); }
.dm-admin {
  display: block; width: 100%; padding: 10px 14px; border-radius: 10px; font-size: 13px; font-weight: 500;
  cursor: pointer; transition: all 0.25s; border: none; text-align: center; text-decoration: none; box-sizing: border-box; letter-spacing: 0.02em;
  background: rgba(251,146,60,0.1); border: 1px solid rgba(251,146,60,0.2); color: #fdba74;
  margin-top: 6px;
}
.dm-admin:hover { background: rgba(251,146,60,0.2); }

@media (max-width: 900px) {
  aside {
    position: fixed !important;
    left: -320px; top: 0; bottom: 0;
    width: 280px !important;
    z-index: 150;
    padding: 20px;
    overflow-y: auto;
    background: rgba(15,23,42,0.95);
    backdrop-filter: blur(30px);
    transition: left 0.3s ease;
  }
  aside.mobile-open { left: 0 !important; }
}
</style>
