<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import api from '../api/index'

const auth = useAuthStore()
const router = useRouter()

if (!auth.isAdmin) {
  router.push('/')
}

const pendingUsers = ref([])
const loading = ref(false)

async function fetchPending() {
  const { data } = await api.get('/user/pending')
  pendingUsers.value = data.users
}

async function approveUser(id) {
  loading.value = true
  try {
    await api.put(`/user/approve/${id}`)
    fetchPending()
  } catch { /* ignore */ }
  loading.value = false
}

onMounted(fetchPending)
</script>

<template>
  <div style="max-width:700px; margin:0 auto;">
    <div class="glass-card">
      <h2 style="font-size:28px; font-weight:700; margin-bottom:8px;">用户审核</h2>
      <p style="color:rgba(255,255,255,0.5); margin-bottom:25px;">审核通过后用户才能点赞和评论</p>

      <div v-if="pendingUsers.length === 0" style="text-align:center; padding:40px; color:rgba(255,255,255,0.35);">
        暂无待审核用户
      </div>

      <div v-for="u in pendingUsers" :key="u.id" class="glass" style="border-radius:16px; padding:16px 20px; display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <div>
          <div style="font-weight:600;">{{ u.username }}</div>
          <div style="font-size:13px; color:rgba(255,255,255,0.5);">
            姓名：{{ u.realname }} &nbsp;|&nbsp; {{ u.email }} &nbsp;|&nbsp; {{ u.created_at?.slice(0,10) }}
          </div>
        </div>
        <button class="approve-btn" @click="approveUser(u.id)" :disabled="loading">
          ✓ 通过
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.approve-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #34d399, #10b981);
  color: white;
  cursor: pointer;
  font-size: 14px;
  transition: opacity 0.3s;
  flex-shrink: 0;
}
.approve-btn:hover:not(:disabled) { opacity: 0.85; }
.approve-btn:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
