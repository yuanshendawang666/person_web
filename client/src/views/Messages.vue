<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api/index'

const router = useRouter()
const conversations = ref([])

onMounted(async () => {
  try {
    const { data } = await api.get('/messages')
    conversations.value = data.conversations
  } catch { /* ignore */ }
})
</script>

<template>
  <div class="page-header">
    <h1 class="page-title">✉️ 私信</h1>
  </div>
  <div v-if="conversations.length === 0" class="empty">暂无私信</div>
  <div v-for="c in conversations" :key="c.id" class="conv-item glass-card"
    @click="router.push(`/messages/${c.id}`)">
    <div class="c-avatar" :style="c.avatar ? `background-image:url(${c.avatar});background-size:cover` : ''"></div>
    <div style="flex:1; min-width:0;">
      <div style="display:flex; justify-content:space-between;">
        <span style="font-weight:600;">{{ c.username }}</span>
        <span style="font-size:12px; color:rgba(255,255,255,0.35);">{{ c.last_time?.slice(0,16) }}</span>
      </div>
      <div style="margin-top:4px; color:rgba(255,255,255,0.5); font-size:14px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
        {{ c.last_msg || '暂无消息' }}
        <span v-if="c.unread > 0" style="color:#fbbf24; margin-left:6px;">[{{ c.unread }}条新消息]</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-header { margin-bottom: 24px; }
.page-title { font-size: 28px; font-weight: 700; }
.conv-item { display: flex; gap: 14px; align-items: center; cursor: pointer; padding: 18px 22px; margin-bottom: 10px; }
.conv-item:hover { background: rgba(255,255,255,0.11); }
.c-avatar { width: 46px; height: 46px; border-radius: 50%; background: linear-gradient(135deg, #60a5fa, #8b5cf6); flex-shrink: 0; }
.empty { text-align: center; color: rgba(255,255,255,0.3); padding: 60px; }
</style>
