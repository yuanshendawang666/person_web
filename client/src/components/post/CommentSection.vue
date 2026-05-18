<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { commentAPI } from '../../api/endpoints'
import { useRouter } from 'vue-router'

const props = defineProps({ postId: Number })
const auth = useAuthStore()
const router = useRouter()
const comments = ref([])
const newComment = ref('')

async function fetchComments() {
  try {
    const { data } = await commentAPI.list(props.postId)
    comments.value = data.comments
  } catch { /* ignore */ }
}

async function submitComment() {
  if (!auth.isLoggedIn) {
    router.push('/login')
    return
  }
  const content = newComment.value.trim()
  if (!content) return
  await commentAPI.create(props.postId, content)
  newComment.value = ''
  fetchComments()
}

async function deleteComment(id) {
  await commentAPI.delete(id)
  fetchComments()
}

function handleKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    submitComment()
  }
}

onMounted(fetchComments)
</script>

<template>
  <div class="comment-section">
    <div class="comment-input-wrap" v-if="auth.isLoggedIn">
      <textarea
        v-model="newComment"
        @keydown="handleKey"
        placeholder="写下你的评论... Enter 发送 / Shift+Enter 换行"
        rows="2"
      ></textarea>
      <button @click="submitComment">发送</button>
    </div>

    <div class="comment-list">
      <div v-for="c in comments" :key="c.id" class="comment-item glass" style="border-radius:16px; padding:16px; display:flex; gap:12px; margin-bottom:12px;">
        <div
          class="comment-avatar"
          :style="c.avatar ? `background-image:url(${c.avatar});background-size:cover` : ''"
        ></div>
        <div style="flex:1;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-weight:600;">{{ c.username }}</span>
            <span style="font-size:12px; color:rgba(255,255,255,0.4);">
              {{ c.created_at?.slice(0, 16) }}
              <button
                v-if="auth.user && (auth.isAdmin || auth.user.id === c.user_id)"
                @click="deleteComment(c.id)"
                style="background:none; border:none; color:#f87171; cursor:pointer; margin-left:8px; font-size:12px;"
              >
                删除
              </button>
            </span>
          </div>
          <div style="margin-top:6px; color:rgba(255,255,255,0.75);">{{ c.content }}</div>
        </div>
      </div>
      <div v-if="comments.length === 0" style="color:rgba(255,255,255,0.35); text-align:center; padding:20px;">
        暂无评论
      </div>
    </div>
  </div>
</template>

<style scoped>
.comment-input-wrap {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}
.comment-input-wrap textarea {
  flex: 1;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 14px;
  padding: 12px 16px;
  color: white;
  resize: none;
  outline: none;
  font-family: inherit;
}
.comment-input-wrap textarea:focus {
  border-color: rgba(96,165,250,0.5);
}
.comment-input-wrap button {
  padding: 12px 20px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #60a5fa, #8b5cf6);
  color: white;
  cursor: pointer;
  transition: opacity 0.3s;
}
.comment-input-wrap button:hover { opacity: 0.85; }
.comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #60a5fa, #8b5cf6);
  flex-shrink: 0;
}
</style>
