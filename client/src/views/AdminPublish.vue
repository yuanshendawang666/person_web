<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { postAPI, uploadAPI } from '../api/endpoints'

const auth = useAuthStore()
const router = useRouter()

if (!auth.isAdmin) {
  router.push('/')
}

const form = ref({
  title: '',
  content: '',
  category: 'life',
})

const images = ref([])
const videos = ref([])
const audios = ref([])
const uploading = ref(false)
const error = ref('')

function addFiles(e, type) {
  const files = Array.from(e.target.files)
  if (type === 'image') images.value.push(...files)
  if (type === 'video') videos.value.push(...files)
  if (type === 'audio') audios.value.push(...files)
}

function removeFile(arr, i) {
  arr.splice(i, 1)
}

async function submit() {
  error.value = ''
  if (!form.value.title.trim()) {
    error.value = '请输入标题'
    return
  }
  uploading.value = true
  try {
    // Upload media first
    const imageUrls = []
    const videoUrls = []
    const audioUrls = []

    for (const file of images.value) {
      const fd = new FormData()
      fd.append('image', file)
      const { data } = await uploadAPI.image(fd)
      imageUrls.push(data.url)
    }
    for (const file of videos.value) {
      const fd = new FormData()
      fd.append('video', file)
      const { data } = await uploadAPI.video(fd)
      videoUrls.push(data.url)
    }
    for (const file of audios.value) {
      const fd = new FormData()
      fd.append('audio', file)
      const { data } = await uploadAPI.audio(fd)
      audioUrls.push(data.url)
    }

    await postAPI.create({
      ...form.value,
      images: imageUrls,
      videos: videoUrls,
      audios: audioUrls,
    })

    router.push('/')
  } catch (e) {
    error.value = e.response?.data?.message || '发布失败'
  } finally {
    uploading.value = false
  }
}
</script>

<template>
  <div style="max-width:700px; margin:0 auto;">
    <div class="glass-card">
      <h2 style="font-size:28px; font-weight:700; margin-bottom:25px;">发布动态</h2>

      <div class="field">
        <label>标题</label>
        <input v-model="form.title" placeholder="动态标题" />
      </div>

      <div class="field">
        <label>分类</label>
        <select v-model="form.category">
          <option value="life">🌿 生活</option>
          <option value="study">📚 学习</option>
          <option value="game">🎮 游戏</option>
        </select>
      </div>

      <div class="field">
        <label>正文</label>
        <textarea v-model="form.content" rows="6" placeholder="分享你的想法..."></textarea>
      </div>

      <!-- 图片上传 -->
      <div class="field">
        <label>图片</label>
        <label class="file-label">
          + 选择图片
          <input type="file" accept="image/*" multiple @change="addFiles($event, 'image')" hidden />
        </label>
        <div class="file-list">
          <span v-for="(f, i) in images" :key="i" class="file-tag">
            {{ f.name }}
            <button @click="removeFile(images, i)">&times;</button>
          </span>
        </div>
      </div>

      <!-- 视频上传 -->
      <div class="field">
        <label>视频</label>
        <label class="file-label">
          + 选择视频
          <input type="file" accept="video/*" multiple @change="addFiles($event, 'video')" hidden />
        </label>
        <div class="file-list">
          <span v-for="(f, i) in videos" :key="i" class="file-tag">
            {{ f.name }}
            <button @click="removeFile(videos, i)">&times;</button>
          </span>
        </div>
      </div>

      <!-- 音频上传 -->
      <div class="field">
        <label>音频</label>
        <label class="file-label">
          + 选择音频
          <input type="file" accept="audio/*" multiple @change="addFiles($event, 'audio')" hidden />
        </label>
        <div class="file-list">
          <span v-for="(f, i) in audios" :key="i" class="file-tag">
            {{ f.name }}
            <button @click="removeFile(audios, i)">&times;</button>
          </span>
        </div>
      </div>

      <div v-if="error" style="color:#f87171; margin-bottom:16px;">{{ error }}</div>

      <button class="submit-btn" @click="submit" :disabled="uploading">
        {{ uploading ? '上传中...' : '发布动态' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.field { margin-bottom: 20px; }
.field label {
  display: block;
  margin-bottom: 8px;
  color: rgba(255,255,255,0.7);
  font-size: 14px;
}
.field input, .field textarea, .field select {
  width: 100%;
  padding: 14px 16px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 14px;
  color: white;
  outline: none;
  font-size: 15px;
  font-family: inherit;
  resize: vertical;
}
.field select { cursor: pointer; }
.field select option { background: #1e293b; color: white; }
.field input:focus, .field textarea:focus, .field select:focus {
  border-color: rgba(96,165,250,0.5);
}
.file-label {
  display: inline-block;
  padding: 10px 18px;
  border-radius: 12px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.15);
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}
.file-label:hover { background: rgba(255,255,255,0.14); }
.file-list { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
.file-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(96,165,250,0.15);
  font-size: 13px;
  color: #93c5fd;
}
.file-tag button {
  background: none;
  border: none;
  color: #f87171;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
}
.submit-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #60a5fa, #8b5cf6);
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: opacity 0.3s;
}
.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.submit-btn:hover:not(:disabled) { opacity: 0.85; }
</style>
