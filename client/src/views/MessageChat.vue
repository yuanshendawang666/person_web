<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import api from '../api/index'

const route = useRoute()
const auth = useAuthStore()
const messages = ref([])
const newMsg = ref('')
const chatUser = ref({})
const box = ref(null)

async function fetch() {
  const { data } = await api.get(`/messages/${route.params.id}`)
  messages.value = data.messages
  // 获取对方信息
  if (data.messages.length > 0) {
    const last = data.messages[data.messages.length - 1]
    const other = last.from_id === auth.user.id
      ? { username: '对方', id: last.to_id }
      : { username: last.username, avatar: last.avatar, id: last.from_id }
    chatUser.value = other
  } else {
    // 新会话：获取用户信息
    try {
      const { data: u } = await api.get('/auth/me')
      chatUser.value = { id: Number(route.params.id), username: '用户' }
    } catch { chatUser.value = { id: Number(route.params.id), username: '用户' } }
  }
  nextTick(() => { box.value?.scrollTo(0, box.value.scrollHeight) })
}

async function send() {
  if (!newMsg.value.trim()) return
  await api.post('/messages', { to_id: chatUser.value.id, content: newMsg.value })
  newMsg.value = ''
  fetch()
}

function handleKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
}

onMounted(fetch)
// 轮询新消息
setInterval(fetch, 5000)
</script>

<template>
  <div class="page-header">
    <h1 class="page-title">与 {{ chatUser.username }} 的对话</h1>
  </div>
  <div class="glass-card chat-box" ref="box">
    <div v-for="m in messages" :key="m.id" class="msg" :class="{ mine: m.from_id === auth.user?.id }">
      <div class="msg-bubble" :class="{ mine: m.from_id === auth.user?.id }">
        <div class="msg-sender" v-if="m.from_id !== auth.user?.id">{{ m.username }}</div>
        {{ m.content }}
      </div>
    </div>
    <div v-if="messages.length === 0" class="empty">开始对话吧</div>
  </div>
  <div class="glass-card" style="display:flex; gap:10px; margin-top:12px; padding:14px 18px;">
    <textarea v-model="newMsg" @keydown="handleKey" placeholder="输入消息... Enter发送" rows="1"
      class="msg-input"></textarea>
    <button @click="send" class="btn-send">发送</button>
  </div>
</template>

<style scoped>
.page-header { margin-bottom: 20px; }
.page-title { font-size: 24px; font-weight: 700; }
.chat-box { height: 420px; overflow-y: auto; padding: 18px; }
.msg { margin-bottom: 14px; display: flex; }
.msg.mine { justify-content: flex-end; }
.msg-bubble {
  max-width: 70%; padding: 10px 16px; border-radius: 16px;
  background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.85); font-size: 14px;
}
.msg-bubble.mine { background: linear-gradient(135deg, #60a5fa, #8b5cf6); }
.msg-sender { font-size: 11px; color: rgba(255,255,255,0.4); margin-bottom: 2px; }
.msg-input {
  flex: 1; padding: 10px 14px; background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12); border-radius: 12px;
  color: white; outline: none; resize: none; font-family: inherit; font-size: 14px;
}
.msg-input:focus { border-color: rgba(96,165,250,0.5); }
.btn-send {
  padding: 10px 20px; border: none; border-radius: 12px;
  background: linear-gradient(135deg, #60a5fa, #8b5cf6); color: white; cursor: pointer;
}
.empty { text-align: center; color: rgba(255,255,255,0.3); padding: 60px; }
</style>
