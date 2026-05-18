<script setup>
import { ref, onMounted } from 'vue'
import { postAPI } from '../api/endpoints'
import PostCard from '../components/post/PostCard.vue'
const posts = ref([])
const sort = ref('time_desc')
const sortOptions = [
  { value: 'time_desc', label: '最新' }, { value: 'time_asc', label: '最早' },
  { value: 'likes_desc', label: '最多❤️' }, { value: 'comments_desc', label: '最多💬' },
]
async function fetch() { const { data } = await postAPI.list({ category:'study', sort:sort.value }); posts.value = data.posts }
onMounted(fetch)
</script>
<template>
  <div class="page-header">
    <div class="header-row"><h1 class="page-title">📚 学习</h1><div class="sort-bar"><button v-for="o in sortOptions" :key="o.value" class="sort-btn" :class="{active:sort===o.value}" @click="sort=o.value;fetch()">{{o.label}}</button></div></div>
    <p class="page-sub">编程、AI、技术笔记、学习计划</p>
  </div>
  <div class="feed"><PostCard v-for="post in posts" :key="post.id" :post="post" /><div v-if="posts.length===0" class="empty">暂无</div></div>
</template>
<style scoped>.page-header{margin-bottom:24px}.header-row{display:flex;flex-direction:column;align-items:flex-start;gap:10px}.page-title{font-size:28px;font-weight:700}.page-sub{margin-top:6px;color:rgba(255,255,255,0.5);font-size:14px}.sort-bar{display:flex;gap:4px}.sort-btn{padding:6px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.03);color:rgba(255,255,255,0.45);cursor:pointer;font-size:12px;transition:all 0.2s}.sort-btn.active{background:rgba(96,165,250,0.15);border-color:rgba(96,165,250,0.3);color:#93c5fd}.feed{display:flex;flex-direction:column;gap:20px}.empty{text-align:center;color:rgba(255,255,255,0.3);padding:60px}</style>
