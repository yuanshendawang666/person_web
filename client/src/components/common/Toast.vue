<script setup>
import { ref } from 'vue'

const toasts = ref([])
let id = 0

function show(message, type = 'error') {
  const tid = ++id
  toasts.value.push({ id: tid, message, type })
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== tid)
  }, 3500)
}

defineExpose({ show })
</script>

<template>
  <teleport to="body">
    <div class="toast-stack">
      <div v-for="t in toasts" :key="t.id" class="toast glass" :class="t.type">
        <span>{{ t.type === 'error' ? '⚠' : t.type === 'success' ? '✓' : 'ℹ' }}</span>
        <span>{{ t.message }}</span>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
.toast-stack {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}
.toast {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 500;
  animation: toastIn 0.3s ease;
  pointer-events: auto;
  max-width: 360px;
  text-align: center;
}
.toast.error { background: rgba(248,113,113,0.25); border-color: rgba(248,113,113,0.4); color: #fca5a5; }
.toast.success { background: rgba(52,211,153,0.25); border-color: rgba(52,211,153,0.4); color: #6ee7b7; }
.toast.info { background: rgba(96,165,250,0.25); border-color: rgba(96,165,250,0.4); color: #93c5fd; }
@keyframes toastIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
