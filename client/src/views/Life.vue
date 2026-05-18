<script setup>
import { ref, onMounted } from 'vue'
import { postAPI } from '../api/endpoints'
import PostCard from '../components/post/PostCard.vue'

const posts = ref([])

onMounted(async () => {
  const { data } = await postAPI.list({ category: 'life' })
  posts.value = data.posts
})
</script>

<template>
  <div class="page-header">
    <h1 class="page-title">🌿 生活</h1>
    <p class="page-sub">日常、旅游、美食、照片、心情记录</p>
  </div>
  <div class="feed">
    <PostCard v-for="post in posts" :key="post.id" :post="post" />
    <div v-if="posts.length === 0" class="empty">暂无生活动态</div>
  </div>
</template>

<style scoped>
.page-header { margin-bottom: 24px; }
.page-title { font-size: 28px; font-weight: 700; }
.page-sub { margin-top: 6px; color: rgba(255,255,255,0.5); font-size: 14px; }
.feed { display: flex; flex-direction: column; gap: 20px; }
.empty { text-align: center; color: rgba(255,255,255,0.3); padding: 60px; }
</style>
