<script setup>
import { ref, onMounted, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { discussAPI } from '../api/endpoints'
import api from '../api/index'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const toast = inject('toast', () => {})
const discussion = ref(null)
const replies = ref([])
const newReply = ref('')
const likeCount = ref(0)
const liked = ref(false)

async function fetch() {
  const { data } = await api.get(`/discuss/${route.params.id}`)
  discussion.value = data.discussion
  replies.value = data.replies
  likeCount.value = data.discussion.like_count || 0
  liked.value = data.discussion.liked_by_user || false
}

async function reply() {
  if (!newReply.value.trim()) return
  if (auth.user?.status !== 'approved' && !auth.isAdmin) {
    await auth.fetchUser()
    if (auth.user?.status !== 'approved' && !auth.isAdmin) { toast('账号尚未通过审核', 'error'); return }
  }
  await api.post(`/discuss/${route.params.id}/reply`, { content: newReply.value })
  newReply.value = ''; fetch()
}

async function toggleLike() {
  if (!auth.isLoggedIn) { router.push('/login'); return }
  if (auth.user?.status !== 'approved' && !auth.isAdmin) {
    await auth.fetchUser()
    if (auth.user?.status !== 'approved' && !auth.isAdmin) { toast('账号尚未通过审核', 'error'); return }
  }
  if (liked.value) { await discussAPI.unlike(discussion.value.id); liked.value = false; likeCount.value-- }
  else { await discussAPI.like(discussion.value.id); liked.value = true; likeCount.value++ }
}

async function del() {
  await discussAPI.delete(discussion.value.id)
  router.push('/discuss')
}

function handleKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); reply() }
}

onMounted(fetch)
</script>

<template>
  <div v-if="discussion">
    <div class="glass-card" style="margin-bottom:16px;">
      <div style="display:flex; justify-content:space-between; align-items:start;">
        <h2 style="font-size:24px; font-weight:700;">{{ discussion.title }}</h2>
        <button v-if="auth.user && (auth.isAdmin || auth.user.id === discussion.user_id)"
          @click="del" style="background:none; border:none; color:#f87171; cursor:pointer;">删除</button>
      </div>
      <div style="margin-top:12px; color:rgba(255,255,255,0.7); white-space:pre-wrap;">{{ discussion.content }}</div>
      <div style="margin-top:14px; font-size:13px; color:rgba(255,255,255,0.4); display:flex; gap:16px; align-items:center;">
        <span>{{ discussion.username }} · {{ discussion.created_at?.slice(0,16) }}</span>
        <span @click="toggleLike" :style="{ cursor:'pointer', color: liked ? '#f87171' : 'rgba(255,255,255,0.4)' }">❤️ {{ likeCount }}</span>
      </div>
    </div>

    <div class="glass-card" style="margin-bottom:12px;" v-if="auth.isLoggedIn && auth.user?.status === 'approved'">
      <textarea v-model="newReply" @keydown="handleKey" placeholder="写回复... Enter发送" rows="2"
        class="reply-input"></textarea>
      <button @click="reply" class="btn-send">发送</button>
    </div>

    <div v-for="r in replies" :key="r.id" class="glass" style="border-radius:16px; padding:16px; margin-bottom:10px; display:flex; gap:12px;">
      <div class="r-avatar" :style="r.avatar ? `background-image:url(${r.avatar});background-size:cover` : ''"></div>
      <div style="flex:1;">
        <div style="font-weight:600; font-size:14px;">{{ r.username }} <span style="font-weight:400; font-size:12px; color:rgba(255,255,255,0.35);">{{ r.created_at?.slice(0,16) }}</span></div>
        <div style="margin-top:4px; color:rgba(255,255,255,0.7);">{{ r.content }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reply-input {
  width: 100%; padding: 12px; background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12); border-radius: 12px;
  color: white; outline: none; resize: none; font-family: inherit; box-sizing: border-box;
}
.reply-input:focus { border-color: rgba(96,165,250,0.5); }
.btn-send {
  margin-top: 8px; padding: 8px 20px; border: none; border-radius: 10px;
  background: linear-gradient(135deg, #60a5fa, #8b5cf6); color: white; cursor: pointer;
}
.r-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #60a5fa, #8b5cf6); flex-shrink: 0; }
</style>
