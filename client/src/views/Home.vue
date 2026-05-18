<script setup>
import { ref, onMounted } from 'vue'
import { postAPI } from '../api/endpoints'
import PostCard from '../components/post/PostCard.vue'

const posts = ref([])

async function fetchPosts() {
  try {
    const { data } = await postAPI.list()
    posts.value = data.posts
  } catch { /* ignore */ }
}

onMounted(fetchPosts)
</script>

<template>
  <div class="page-header">
    <h1 class="page-title">总空间</h1>
    <p class="page-sub">所有模块动态都会同步显示在这里</p>
  </div>
  <div class="feed">
    <PostCard v-for="post in posts" :key="post.id" :post="post" @updated="fetchPosts" />
    <div v-if="posts.length === 0" class="empty">暂无动态</div>
  </div>
</template>

<style scoped>
.page-header { margin-bottom: 24px; }
.page-title { font-size: 28px; font-weight: 700; }
.page-sub { margin-top: 6px; color: rgba(255,255,255,0.5); font-size: 14px; }
.feed { display: flex; flex-direction: column; gap: 20px; }
.empty { text-align: center; color: rgba(255,255,255,0.3); padding: 60px; }
</style>
