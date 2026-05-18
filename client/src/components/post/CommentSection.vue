<script setup>
import { ref, onMounted, inject } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { commentAPI, uploadAPI } from '../../api/endpoints'
import { useRouter } from 'vue-router'

const props = defineProps({ postId: Number })
const auth = useAuthStore()
const router = useRouter()
const toast = inject('toast', () => {})
const comments = ref([])
const newComment = ref('')
const imgFiles = ref([])
const vidFiles = ref([])
const audFiles = ref([])

async function fetchComments() {
  try { const { data } = await commentAPI.list(props.postId); comments.value = data.comments } catch {}
}
async function submitComment() {
  if (!auth.isLoggedIn) { router.push('/login'); return }
  if (auth.user?.status !== 'approved' && !auth.isAdmin) {
    toast('账号尚未通过审核，暂不能评论', 'error'); return
  }
  if (!newComment.value.trim() && !imgFiles.value.length && !vidFiles.value.length && !audFiles.value.length) return

  const imageUrls = [], videoUrls = [], audioUrls = []
  for (const f of imgFiles.value) {
    const fd = new FormData(); fd.append('image', f)
    const { data } = await uploadAPI.image(fd); imageUrls.push(data.url)
  }
  for (const f of vidFiles.value) {
    const fd = new FormData(); fd.append('video', f)
    const { data } = await uploadAPI.video(fd); videoUrls.push(data.url)
  }
  for (const f of audFiles.value) {
    const fd = new FormData(); fd.append('audio', f)
    const { data } = await uploadAPI.audio(fd); audioUrls.push(data.url)
  }
  await commentAPI.create(props.postId, {
    content: newComment.value,
    images: imageUrls, videos: videoUrls, audios: audioUrls,
  })
  newComment.value = ''; imgFiles.value = []; vidFiles.value = []; audFiles.value = []
  fetchComments()
}
async function deleteComment(id) {
  await commentAPI.delete(id); fetchComments()
}
function handleKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitComment() }
}
function dmUser(user) {
  if (!auth.isLoggedIn) { router.push('/login'); return }
  if (user.id === auth.user?.id) { router.push('/profile'); return }
  router.push(`/messages/${user.id}`)
}
onMounted(fetchComments)
</script>

<template>
  <div class="comment-section">
    <div class="comment-input-wrap" v-if="auth.isLoggedIn">
      <textarea v-model="newComment" @keydown="handleKey" placeholder="写下评论... Enter 发送，Shift+Enter 换行" rows="2"></textarea>
      <div class="media-actions">
        <label class="cm-file-label">📷<input type="file" accept="image/*" multiple @change="imgFiles = Array.from($event.target.files)" hidden /></label>
        <label class="cm-file-label">🎬<input type="file" accept="video/*" multiple @change="vidFiles = Array.from($event.target.files)" hidden /></label>
        <label class="cm-file-label">🎵<input type="file" accept="audio/*" multiple @change="audFiles = Array.from($event.target.files)" hidden /></label>
        <span v-if="imgFiles.length" class="cm-chip">{{ imgFiles.length }}图</span>
        <span v-if="vidFiles.length" class="cm-chip">{{ vidFiles.length }}视频</span>
        <span v-if="audFiles.length" class="cm-chip">{{ audFiles.length }}音频</span>
      </div>
      <button @click="submitComment">发送</button>
    </div>

    <div class="comment-list">
      <div v-for="c in comments" :key="c.id" class="comment-item glass" style="border-radius:16px; padding:16px; display:flex; gap:12px; margin-bottom:12px;">
        <div class="comment-avatar" :style="c.avatar ? `background-image:url(${c.avatar});background-size:cover` : ''"></div>
        <div style="flex:1; min-width:0;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-weight:600; cursor:pointer; color:#93c5fd;" @click="dmUser({ id: c.user_id, username: c.username })">{{ c.username }}</span>
            <span style="font-size:12px; color:rgba(255,255,255,0.4);">
              {{ c.created_at?.slice(0,16) }}
              <button v-if="auth.user && (auth.isAdmin || auth.user.id === c.user_id)" @click="deleteComment(c.id)"
                style="background:none; border:none; color:#f87171; cursor:pointer; margin-left:8px; font-size:12px;">删除</button>
            </span>
          </div>
          <div style="margin-top:4px; color:rgba(255,255,255,0.75); white-space:pre-wrap;">{{ c.content }}</div>
          <!-- 评论媒体 -->
          <div v-if="c.images?.length" class="cm-imgs">
            <div v-for="(img,i) in c.images" :key="i" class="cm-img" :style="`background-image:url(${img.url})`" @click="previewUrl = img.url"></div>
          </div>
          <div v-for="vid in c.videos" :key="vid.id"><video controls :src="vid.url" style="max-width:100%; max-height:200px; border-radius:10px; margin-top:6px;"></video></div>
          <div v-for="aud in c.audios" :key="aud.id"><audio controls :src="aud.url" style="width:100%; margin-top:4px;"></audio></div>
        </div>
      </div>
      <div v-if="comments.length === 0" class="empty">暂无评论</div>
    </div>

    <div v-if="previewUrl" class="cm-preview-overlay" @click="previewUrl = null"><img :src="previewUrl" class="cm-preview-img" /></div>
  </div>
</template>

<script>
import { ref as vRef } from 'vue'
export const previewUrl = vRef(null)
</script>

<style scoped>
.comment-input-wrap { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
.comment-input-wrap textarea {
  width: 100%; padding: 12px 16px; background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12); border-radius: 14px;
  color: white; outline: none; font-family: inherit; resize: none;
}
.comment-input-wrap textarea:focus { border-color: rgba(96,165,250,0.5); }
.comment-input-wrap button {
  align-self: flex-end; padding: 8px 20px; border: none; border-radius: 10px;
  background: linear-gradient(135deg, #60a5fa, #8b5cf6); color: white; cursor: pointer;
}
.media-actions { display: flex; gap: 8px; align-items: center; }
.cm-file-label { padding: 4px 8px; border-radius: 8px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); cursor: pointer; font-size: 14px; }
.cm-chip { font-size: 11px; color: #93c5fd; background: rgba(96,165,250,0.15); padding: 2px 8px; border-radius: 999px; }
.comment-avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #60a5fa, #8b5cf6); flex-shrink: 0; }
.cm-imgs { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.cm-img { width: 80px; height: 80px; border-radius: 10px; background-size: cover; background-position: center; cursor: pointer; }
.cm-preview-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 9999; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.cm-preview-img { max-width: 90vw; max-height: 90vh; border-radius: 16px; }
.empty { text-align: center; color: rgba(255,255,255,0.3); padding: 20px; }
</style>
