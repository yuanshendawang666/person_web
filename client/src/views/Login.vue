<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const form = ref({ login: '', password: '' })
const error = ref('')

async function submit() {
  error.value = ''
  try {
    await auth.login(form.value)
    router.push('/')
  } catch (e) {
    error.value = e.response?.data?.message || '登录失败'
  }
}
</script>

<template>
  <div class="page-center">
    <div class="form-card glass-card" style="width:420px;">
      <h2 style="font-size:28px; font-weight:700; margin-bottom:8px;">登录</h2>
      <p style="color:rgba(255,255,255,0.5); margin-bottom:30px;">欢迎回到yuanshendawangの空间</p>
      <div class="field">
        <label>用户名或邮箱</label>
        <input v-model="form.login" placeholder="用户名或邮箱" />
      </div>
      <div class="field">
        <label>密码</label>
        <input v-model="form.password" type="password" placeholder="密码" @keydown.enter="submit" />
      </div>
      <div v-if="error" style="color:#f87171; margin-bottom:16px;">{{ error }}</div>
      <button class="submit-btn" @click="submit">登录</button>
      <p style="text-align:center; margin-top:20px; color:rgba(255,255,255,0.4);">
        还没有账号？
        <router-link to="/register" style="color:#60a5fa;">去注册</router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>
.page-center {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
}
.field {
  margin-bottom: 20px;
}
.field label {
  display: block;
  margin-bottom: 8px;
  color: rgba(255,255,255,0.7);
  font-size: 14px;
}
.field input {
  width: 100%;
  padding: 14px 16px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 14px;
  color: white;
  outline: none;
  font-size: 15px;
}
.field input:focus {
  border-color: rgba(96,165,250,0.5);
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
.submit-btn:hover { opacity: 0.85; }
</style>
