<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import api from '../api/index'

const router = useRouter()
const auth = useAuthStore()
const discussions = ref([])
const showForm = ref(false)
const form = ref({ title: '', content: '' })

async function fetch() {
  const { data } = await api.get('/discuss')
  discussions.value = data.discussions
}

async function submit() {
  if (!form.value.title.trim() || !form.value.content.trim()) return
  await api.post('/discuss', form.value)
  form.value = { title: '', content: '' }
  showForm.value = false
  fetch()
}

onMounted(fetch)
</script>

<template>
  <div class="page-header">
    <h1 class="page-title">💬 讨论区</h1>
    <p class="page-sub">在这里畅所欲言，分享你的想法</p>
  </div>

  <div v-if="auth.isLoggedIn && auth.user?.status === 'approved'" style="margin-bottom:20px;">
    <button v-if="!showForm" class="glass-card" style="width:100%; padding:16px 24px; border:none; color:rgba(255,255,255,0.5); cursor:pointer; text-align:left; font-size:15px;" @click="showForm = true">
      + 发起新讨论...
    </button>
    <div v-else class="glass-card" style="padding:20px;">
      <input v-model="form.title" placeholder="讨论标题" class="field-input" />
      <textarea v-model="form.content" placeholder="说点什么..." rows="3" class="field-input" style="margin-top:12px; resize:vertical;"></textarea>
      <div style="display:flex; gap:10px; margin-top:12px;">
        <button class="btn-primary" @click="submit">发布</button>
        <button class="btn-cancel" @click="showForm = false">取消</button>
      </div>
    </div>
  </div>

  <div class="discuss-list">
    <div v-for="d in discussions" :key="d.id" class="discuss-item glass-card" @click="router.push(`/discuss/${d.id}`)">
      <div class="d-title">{{ d.title }}</div>
      <div class="d-meta">
        <span>{{ d.username }}</span>
        <span>{{ d.created_at?.slice(0,10) }}</span>
        <span>💬 {{ d.reply_count || 0 }}</span>
      </div>
    </div>
    <div v-if="discussions.length === 0" class="empty">暂无讨论，快来发起第一个话题吧</div>
  </div>
</template>

<style scoped>
.page-header { margin-bottom: 24px; }
.page-title { font-size: 28px; font-weight: 700; }
.page-sub { margin-top: 6px; color: rgba(255,255,255,0.5); font-size: 14px; }
.field-input {
  width: 100%; padding: 12px 16px; background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12); border-radius: 12px;
  color: white; outline: none; font-size: 15px; font-family: inherit; box-sizing: border-box;
}
.field-input:focus { border-color: rgba(96,165,250,0.5); }
.btn-primary {
  padding: 10px 20px; border: none; border-radius: 12px;
  background: linear-gradient(135deg, #60a5fa, #8b5cf6); color: white; cursor: pointer;
}
.btn-cancel {
  padding: 10px 20px; border: 1px solid rgba(255,255,255,0.15); border-radius: 12px;
  background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.6); cursor: pointer;
}
.discuss-list { display: flex; flex-direction: column; gap: 12px; }
.discuss-item { cursor: pointer; padding: 20px 24px; }
.discuss-item:hover { background: rgba(255,255,255,0.11); transform: translateY(-2px); }
.d-title { font-size: 18px; font-weight: 600; margin-bottom: 10px; }
.d-meta { display: flex; gap: 16px; font-size: 13px; color: rgba(255,255,255,0.45); }
.empty { text-align: center; color: rgba(255,255,255,0.3); padding: 60px; }
</style>
