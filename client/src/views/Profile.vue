<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { authAPI } from '../api/endpoints'
import { useRouter } from 'vue-router'
import AvatarCropper from '../components/common/AvatarCropper.vue'

const auth = useAuthStore()
const router = useRouter()
const form = ref({ username: '', bio: '' })
const passwordForm = ref({ oldPassword: '', newPassword: '' })
const msg = ref('')
const pwMsg = ref('')
const tags = ref([])
const newTagName = ref('')
const newTagColor = ref('#60a5fa')
const cropFile = ref(null)
const showCropper = ref(false)

const presetColors = ['#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#f472b6', '#fb923c', '#22d3ee']

function loadTags() {
  if (!auth.user?.tags) { tags.value = []; return }
  try {
    tags.value = typeof auth.user.tags === 'string' ? JSON.parse(auth.user.tags) : auth.user.tags
  } catch { tags.value = [] }
}

onMounted(async () => {
  if (!auth.isLoggedIn) { router.push('/login'); return }
  await auth.fetchUser()
  form.value.username = auth.user?.username || ''
  form.value.bio = auth.user?.bio || ''
  loadTags()
})

async function updateProfile() {
  msg.value = ''
  try {
    await authAPI.updateProfile({ ...form.value, tags: tags.value })
    await auth.fetchUser()
    msg.value = '资料更新成功'
  } catch (e) {
    msg.value = e.response?.data?.message || '更新失败'
  }
}

function addTag() {
  const name = newTagName.value.trim()
  if (!name || tags.value.length >= 8) return
  if (tags.value.some(t => t.name === name)) return
  tags.value.push({ name, color: newTagColor.value })
  newTagName.value = ''
}

function removeTag(i) { tags.value.splice(i, 1) }

function setColor(i, color) { tags.value[i].color = color }

async function updatePassword() {
  pwMsg.value = ''
  try {
    await authAPI.updateProfile(passwordForm.value)
    pwMsg.value = '密码修改成功'
    passwordForm.value = { oldPassword: '', newPassword: '' }
  } catch (e) {
    pwMsg.value = e.response?.data?.message || '修改失败'
  }
}

function pickAvatar(e) {
  const file = e.target.files[0]
  if (!file) return
  cropFile.value = file
  showCropper.value = true
  e.target.value = '' // 清空以便重新选择同一文件
}

async function onCropConfirm(croppedFile) {
  showCropper.value = false
  const fd = new FormData()
  fd.append('avatar', croppedFile)
  try {
    await authAPI.uploadAvatar(fd)
    await auth.fetchUser()
    msg.value = '头像更新成功'
  } catch { msg.value = '头像上传失败' }
}
</script>

<template>
  <div style="max-width:600px; margin:0 auto;">
    <div class="glass-card" style="margin-bottom:25px;">
      <h2 style="font-size:28px; font-weight:700; margin-bottom:25px;">个人资料</h2>

      <div style="display:flex; align-items:center; gap:20px; margin-bottom:25px;">
        <div class="avatar" :style="auth.user?.avatar ? `background-image:url(${auth.user.avatar});background-size:cover` : ''"></div>
        <label class="upload-label">更换头像<input type="file" accept="image/*" @change="pickAvatar" hidden /></label>
      </div>

      <div class="field">
        <label>用户名</label>
        <input v-model="form.username" />
      </div>
      <div class="field">
        <label>简介</label>
        <textarea v-model="form.bio" rows="2"></textarea>
      </div>

      <!-- 个性标签 -->
      <div class="field">
        <label>个性标签</label>
        <div class="tag-list">
          <span v-for="(t, i) in tags" :key="i" class="tag-chip" :style="{ background: t.color+'22', borderColor: t.color+'55', color: t.color }">
            <span class="color-dot" :style="{ background: t.color }" @click.stop></span>
            {{ t.name }}
            <button class="tag-remove" @click="removeTag(i)">&times;</button>
            <span class="color-pick-row">
              <span v-for="pc in presetColors" :key="pc" class="mini-dot" :class="{ active: t.color === pc }" :style="{ background: pc }" @click="setColor(i, pc)"></span>
            </span>
          </span>
        </div>
        <div class="add-tag-row" v-if="tags.length < 8">
          <input v-model="newTagName" placeholder="标签名" class="tag-input" @keydown.enter="addTag" maxlength="6" />
          <span class="color-pick-inline">
            <span v-for="pc in presetColors" :key="pc" class="mini-dot" :class="{ active: newTagColor === pc }" :style="{ background: pc }" @click="newTagColor = pc"></span>
          </span>
          <button class="tag-add-btn" @click="addTag">+</button>
        </div>
      </div>

      <div v-if="msg" :style="{ color: msg.includes('成功') ? '#86efac' : '#f87171', marginBottom:'16px' }">{{ msg }}</div>
      <button class="submit-btn" @click="updateProfile">保存修改</button>
    </div>

    <div class="glass-card">
      <h2 style="font-size:28px; font-weight:700; margin-bottom:25px;">修改密码</h2>
      <div class="field"><label>旧密码</label><input v-model="passwordForm.oldPassword" type="password" /></div>
      <div class="field"><label>新密码</label><input v-model="passwordForm.newPassword" type="password" /></div>
      <div v-if="pwMsg" :style="{ color: pwMsg.includes('成功') ? '#86efac' : '#f87171', marginBottom:'16px' }">{{ pwMsg }}</div>
      <button class="submit-btn" @click="updatePassword">修改密码</button>
    </div>

    <AvatarCropper v-if="showCropper" :file="cropFile" @confirm="onCropConfirm" @cancel="showCropper = false" />
  </div>
</template>

<style scoped>
.avatar { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #60a5fa, #8b5cf6); }
.upload-label { padding: 10px 18px; border-radius: 12px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); cursor: pointer; font-size: 14px; transition: background 0.3s; }
.upload-label:hover { background: rgba(255,255,255,0.14); }
.field { margin-bottom: 20px; }
.field label { display: block; margin-bottom: 8px; color: rgba(255,255,255,0.7); font-size: 14px; }
.field input, .field textarea { width: 100%; padding: 14px 16px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 14px; color: white; outline: none; font-size: 15px; font-family: inherit; resize: vertical; }
.field input:focus, .field textarea:focus { border-color: rgba(96,165,250,0.5); }

.tag-list { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px; }
.tag-chip {
  position: relative; display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 10px; border-radius: 999px; font-size: 13px; border: 1px solid;
  cursor: default; transition: all 0.2s;
}
.tag-chip:hover .color-pick-row { opacity: 1; pointer-events: auto; }
.color-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.tag-remove { background: none; border: none; color: inherit; cursor: pointer; font-size: 15px; line-height: 1; padding: 0 2px; opacity: 0.6; }
.tag-remove:hover { opacity: 1; }
.color-pick-row {
  position: absolute; top: 100%; left: 0; margin-top: 4px; display: flex; gap: 3px;
  padding: 4px 6px; background: rgba(30,41,59,0.95); border-radius: 8px;
  opacity: 0; pointer-events: none; transition: opacity 0.2s; z-index: 10;
}
.mini-dot { width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: 1px solid transparent; }
.mini-dot.active { border-color: white; }
.add-tag-row { display: flex; align-items: center; gap: 8px; }
.tag-input { width: 80px; padding: 8px 12px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 999px; color: white; outline: none; font-size: 13px; }
.tag-input:focus { border-color: rgba(96,165,250,0.5); }
.color-pick-inline { display: flex; gap: 3px; }
.tag-add-btn { width: 28px; height: 28px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.06); color: white; cursor: pointer; font-size: 16px; line-height: 1; }
.tag-add-btn:hover { background: rgba(255,255,255,0.14); }

.submit-btn { width: 100%; padding: 14px; border: none; border-radius: 14px; background: linear-gradient(135deg, #60a5fa, #8b5cf6); color: white; font-size: 16px; cursor: pointer; transition: opacity 0.3s; }
.submit-btn:hover { opacity: 0.85; }
</style>
