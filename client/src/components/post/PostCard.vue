<script setup>
import { ref, computed, inject } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { likeAPI } from '../../api/endpoints'

const props = defineProps({ post: Object })
const emit = defineEmits(['updated'])
const auth = useAuthStore()
const router = useRouter()
const toast = inject('toast', () => {})

const liked = ref(props.post.liked_by_user || false)
const likeCount = ref(Number(props.post.like_count) || 0)
const previewImg = ref(null)

const categoryClass = computed(() => {
  return {
    life: 'category-life',
    study: 'category-study',
    game: 'category-game',
  }[props.post.category] || ''
})

const categoryLabel = computed(() => ({
  life: '🌿 生活',
  study: '📚 学习',
  game: '🎮 游戏',
}[props.post.category] || props.post.category))

async function toggleLike() {
  if (!auth.isLoggedIn) {
    router.push('/login')
    return
  }
  if (auth.user?.status !== 'approved' && !auth.isAdmin) {
    await auth.fetchUser()
    if (auth.user?.status !== 'approved' && !auth.isAdmin) {
      toast('账号尚未通过审核，暂不能点赞', 'error'); return
    }
  }
  if (liked.value) {
    await likeAPI.unlike(props.post.id)
    liked.value = false
    likeCount.value--
  } else {
    await likeAPI.like(props.post.id)
    liked.value = true
    likeCount.value++
  }
}

function goDetail() {
  router.push(`/post/${props.post.id}`)
}
</script>

<template>
  <div class="post-card glass-card">
    <div class="category-tag" :class="categoryClass">{{ categoryLabel }}</div>
    <div class="post-title" @click="goDetail" style="cursor:pointer;">{{ post.title }}</div>
    <div class="post-content" v-if="post.content">{{ post.content }}</div>

    <!-- 图片 -->
    <div v-if="post.images?.length" class="media-grid" :class="'grid-' + Math.min(post.images.length, 3)">
      <div
        v-for="(img, i) in post.images"
        :key="i"
        class="media-item"
        :style="`background-image:url(${img.url});background-size:cover;background-position:center;`"
        @click="previewImg = img.url"
      ></div>
    </div>

    <!-- 视频 -->
    <div v-for="vid in post.videos" :key="vid.id" class="video-wrap">
      <video controls :src="vid.url" class="media-video"></video>
    </div>

    <!-- 音频 -->
    <div v-for="aud in post.audios" :key="aud.id" class="audio-wrap">
      <audio controls :src="aud.url" style="width:100%;"></audio>
    </div>

    <div class="post-footer">
      <span><span class="post-author">{{ post.username }}</span> · {{ post.created_at?.slice(0, 10) }}</span>
      <span style="display:flex; gap:20px;">
        <span @click="toggleLike" :style="{ color: liked ? '#f87171' : '', cursor: 'pointer' }">
          ❤️ {{ likeCount }}
        </span>
        <span @click="goDetail" style="cursor:pointer;">💬 {{ post.comment_count ?? 0 }}</span>
      </span>
    </div>

    <div v-if="previewImg" class="img-preview-overlay" @click="previewImg = null">
      <img :src="previewImg" class="img-preview" />
    </div>
  </div>
</template>


<style scoped>
.post-title {
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 15px;
}
.post-content {
  line-height: 1.9;
  color: rgba(255,255,255,0.75);
  white-space: pre-wrap;
}
.media-grid {
  margin-top: 20px;
  display: grid;
  gap: 12px;
  border-radius: 24px;
  overflow: hidden;
}
.grid-1 { grid-template-columns: 1fr; }
.grid-2 { grid-template-columns: repeat(2, 1fr); }
.grid-3 { grid-template-columns: repeat(3, 1fr); }
.media-item {
  height: 240px;
  border-radius: 16px;
  cursor: pointer;
  transition: transform 0.3s;
}
.media-item:hover { transform: scale(1.02); }
.video-wrap { margin-top: 20px; }
.media-video {
  width: 100%;
  border-radius: 16px;
  max-height: 400px;
}
.audio-wrap { margin-top: 12px; }
.post-author {
  color: rgba(255,255,255,0.7);
  font-weight: 500;
}
.post-footer {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: rgba(255,255,255,0.5);
  font-size: 14px;
}
.post-footer span { transition: color 0.2s; }
.img-preview-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.85);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.img-preview {
  max-width: 90vw;
  max-height: 90vh;
  border-radius: 16px;
}
</style>
