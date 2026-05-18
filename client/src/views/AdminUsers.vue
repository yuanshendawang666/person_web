<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import api from '../api/index'

const auth = useAuthStore()
const router = useRouter()
if (!auth.isAdmin) router.push('/')

const pending = ref([])
const allUsers = ref([])
const tab = ref('pending')
const loading = ref(false)

async function fetchPending() {
  const { data } = await api.get('/user/pending')
  pending.value = data.users
}
async function fetchAll() {
  const { data } = await api.get('/user/all')
  allUsers.value = data.users
}
async function approve(id) {
  await api.put(`/user/approve/${id}`)
  fetchPending(); fetchAll()
}
async function promote(id) {
  await api.put(`/user/promote/${id}`)
  fetchAll()
}
async function demote(id) {
  await api.put(`/user/demote/${id}`)
  fetchAll()
}
async function delUser(id) {
  if (!confirm('确定删除该用户？此操作不可恢复')) return
  await api.delete(`/user/${id}`)
  fetchPending(); fetchAll()
}

onMounted(() => { fetchPending(); fetchAll() })
</script>

<template>
  <div style="max-width:800px; margin:0 auto;">
    <div class="page-header"><h1 class="page-title">👥 用户管理</h1></div>

    <div style="display:flex; gap:10px; margin-bottom:20px;">
      <button class="tab-btn" :class="{ active: tab === 'pending' }" @click="tab='pending'">待审核 ({{ pending.length }})</button>
      <button class="tab-btn" :class="{ active: tab === 'all' }" @click="tab='all'">全部用户</button>
    </div>

    <!-- 待审核 -->
    <template v-if="tab === 'pending'">
      <div v-if="pending.length===0" class="empty">暂无</div>
      <div v-for="u in pending" :key="u.id" class="glass" style="border-radius:16px; padding:14px 20px; display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
        <div>
          <div style="font-weight:600;">{{ u.username }} <span style="font-size:12px; color:rgba(255,255,255,0.35);">ID:{{ u.id }}</span></div>
          <div style="font-size:13px; color:rgba(255,255,255,0.5);">姓名：{{ u.realname }} | {{ u.email }}</div>
        </div>
        <div style="display:flex; gap:6px;">
          <button class="approve-btn" @click="approve(u.id)">✓ 通过</button>
          <button class="sm-btn del" @click="delUser(u.id)">✕ 拒绝</button>
        </div>
      </div>
    </template>

    <!-- 全部用户 -->
    <template v-if="tab === 'all'">
      <div v-for="u in allUsers" :key="u.id" class="glass" style="border-radius:16px; padding:14px 20px; display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; flex-wrap:wrap; gap:10px;">
        <div>
          <div style="font-weight:600;">
            {{ u.username }}
            <span v-if="u.id === 1" style="color:#fbbf24; font-size:11px;">⭐站长</span>
            <span v-else-if="u.role==='admin'" style="color:#6ee7b7; font-size:11px;">🔧管理员</span>
            <span style="font-size:11px; color:rgba(255,255,255,0.3); margin-left:4px;">{{ u.status === 'approved' ? '✓已审核' : '⏳待审' }}</span>
          </div>
          <div style="font-size:12px; color:rgba(255,255,255,0.45);">姓名：{{ u.realname }} | {{ u.email }}</div>
        </div>
        <div style="display:flex; gap:6px;">
          <button v-if="auth.user.id === 1 && u.role==='user'" class="sm-btn promote" @click="promote(u.id)">提升</button>
          <button v-if="auth.user.id === 1 && u.role==='admin' && u.id !== 1" class="sm-btn demote" @click="demote(u.id)">撤销</button>
          <button v-if="u.role==='user'" class="sm-btn del" @click="delUser(u.id)">删除</button>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.page-header { margin-bottom: 20px; }
.page-title { font-size: 28px; font-weight: 700; }
.tab-btn {
  padding: 8px 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.03); color: rgba(255,255,255,0.5); cursor: pointer; font-size: 14px;
}
.tab-btn.active { background: rgba(96,165,250,0.15); border-color: rgba(96,165,250,0.35); color: #93c5fd; }
.approve-btn {
  padding: 8px 18px; border: none; border-radius: 10px;
  background: linear-gradient(135deg, #34d399, #10b981); color: white; cursor: pointer; font-size: 13px;
}
.sm-btn {
  padding: 5px 12px; border: none; border-radius: 8px; font-size: 12px; cursor: pointer; color: white;
}
.sm-btn.promote { background: rgba(96,165,250,0.3); }
.sm-btn.demote { background: rgba(251,191,36,0.3); }
.sm-btn.del { background: rgba(248,113,113,0.3); }
.empty { text-align: center; color: rgba(255,255,255,0.3); padding: 40px; }
</style>
