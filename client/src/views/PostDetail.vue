<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { postAPI } from '../api/endpoints'
import PostCard from '../components/post/PostCard.vue'
import CommentSection from '../components/post/CommentSection.vue'

const route = useRoute()
const post = ref(null)

onMounted(async () => {
  const { data } = await postAPI.detail(route.params.id)
  post.value = data.post
})
</script>

<template>
  <div v-if="post">
    <PostCard :post="post" />
    <div class="glass-card" style="margin-top:20px;">
      <h3 style="font-size:20px; font-weight:700; margin-bottom:20px;">💬 评论</h3>
      <CommentSection :postId="post.id" />
    </div>
  </div>
  <div v-else style="text-align:center; padding:60px; color:rgba(255,255,255,0.35);">
    加载中...
  </div>
</template>
