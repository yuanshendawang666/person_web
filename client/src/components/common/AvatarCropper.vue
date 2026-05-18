<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  file: { type: File, required: true },
})
const emit = defineEmits(['confirm', 'cancel'])

const canvasRef = ref(null)
const imageSrc = ref('')
const scale = ref(1)
const offsetX = ref(0)
const offsetY = ref(0)
const dragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const imgNatural = ref({ w: 0, h: 0 })
const containerSize = 340

// 圆圈固定大小 (容器内)
const circleRadius = 130

let img = null

function loadImage() {
  const reader = new FileReader()
  reader.onload = (e) => {
    imageSrc.value = e.target.result
    img = new Image()
    img.onload = () => {
      imgNatural.value = { w: img.naturalWidth, h: img.naturalHeight }
      // 初始缩放让图片短边填满圆圈
      const minEdge = Math.min(img.naturalWidth, img.naturalHeight)
      scale.value = Math.max(0.3, (circleRadius * 2) / minEdge)
      offsetX.value = 0
      offsetY.value = 0
      draw()
    }
    img.src = e.target.result
  }
  reader.readAsDataURL(props.file)
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas || !img) return
  const ctx = canvas.getContext('2d')
  const size = containerSize
  canvas.width = size
  canvas.height = size
  ctx.clearRect(0, 0, size, size)

  const cx = size / 2
  const cy = size / 2
  const s = scale.value
  const imgW = imgNatural.value.w * s
  const imgH = imgNatural.value.h * s
  const imgX = cx - imgW / 2 + offsetX.value
  const imgY = cy - imgH / 2 + offsetY.value

  // 绘制半透明背景
  ctx.fillStyle = 'rgba(15,23,42,0.85)'
  ctx.fillRect(0, 0, size, size)

  // 裁剪圆形区域
  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, circleRadius, 0, Math.PI * 2)
  ctx.clip()
  ctx.drawImage(img, imgX, imgY, imgW, imgH)
  ctx.restore()

  // 圆形边框
  ctx.beginPath()
  ctx.arc(cx, cy, circleRadius, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(255,255,255,0.6)'
  ctx.lineWidth = 2
  ctx.stroke()

  // 外部遮罩
  ctx.beginPath()
  ctx.rect(0, 0, size, size)
  ctx.arc(cx, cy, circleRadius, 0, Math.PI * 2, true)
  ctx.fillStyle = 'rgba(15,23,42,0.55)'
  ctx.fill()
}

function getPos(e) {
  const rect = canvasRef.value.getBoundingClientRect()
  return { x: e.clientX - rect.left, y: e.clientY - rect.top }
}

function onMouseDown(e) {
  e.preventDefault()
  dragging.value = true
  const pos = getPos(e)
  dragStart.value = { x: pos.x - offsetX.value, y: pos.y - offsetY.value }
}

function onMouseMove(e) {
  if (!dragging.value) return
  const pos = getPos(e)
  offsetX.value = pos.x - dragStart.value.x
  offsetY.value = pos.y - dragStart.value.y
}

function onMouseUp() {
  dragging.value = false
}

function onTouchStart(e) {
  if (e.touches.length === 1) {
    dragging.value = true
    const pos = getPos(e.touches[0])
    dragStart.value = { x: pos.x - offsetX.value, y: pos.y - offsetY.value }
  }
}

function onTouchMove(e) {
  if (!dragging.value || e.touches.length !== 1) return
  const pos = getPos(e.touches[0])
  offsetX.value = pos.x - dragStart.value.x
  offsetY.value = pos.y - dragStart.value.y
}

function onTouchEnd() {
  dragging.value = false
}

function onWheel(e) {
  e.preventDefault()
  const delta = e.deltaY > 0 ? -0.05 : 0.05
  scale.value = Math.max(0.2, Math.min(3, scale.value + delta))
}

function confirm() {
  const canvas = document.createElement('canvas')
  const size = 300 // 输出头像尺寸
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  const s = scale.value
  const imgW = imgNatural.value.w * s
  const imgH = imgNatural.value.h * s
  const cx = containerSize / 2
  const cy = containerSize / 2
  const imgX = cx - imgW / 2 + offsetX.value
  const imgY = cy - imgH / 2 + offsetY.value

  // 缩放到输出尺寸
  const ratio = size / containerSize

  ctx.beginPath()
  ctx.arc(size / 2, size / 2, circleRadius * ratio, 0, Math.PI * 2)
  ctx.clip()
  ctx.drawImage(img, imgX * ratio, imgY * ratio, imgW * ratio, imgH * ratio)

  canvas.toBlob((blob) => {
    if (!blob) return
    const file = new File([blob], 'avatar.png', { type: 'image/png' })
    emit('confirm', file)
  }, 'image/png')
}

watch(() => props.file, loadImage, { immediate: true })

watch([scale, offsetX, offsetY], draw)

onMounted(() => {
  window.addEventListener('mouseup', onMouseUp)
  window.addEventListener('touchend', onTouchEnd)
})
onUnmounted(() => {
  window.removeEventListener('mouseup', onMouseUp)
  window.removeEventListener('touchend', onTouchEnd)
})
</script>

<template>
  <div class="cropper-overlay" @click.self="$emit('cancel')">
    <div class="cropper-modal">
      <div class="cropper-title">调整头像 — 拖拽图片选择范围</div>
      <div class="cropper-body">
        <canvas
          ref="canvasRef"
          class="cropper-canvas"
          @mousedown="onMouseDown"
          @mousemove="onMouseMove"
          @wheel.prevent="onWheel"
          @touchstart.prevent="onTouchStart"
          @touchmove.prevent="onTouchMove"
        ></canvas>
      </div>
      <div class="cropper-controls">
        <span class="ctrl-label">缩放</span>
        <input type="range" min="20" max="300" :value="scale * 100" @input="scale = +$event.target.value / 100" class="zoom-slider" />
      </div>
      <div class="cropper-actions">
        <button class="btn-cancel" @click="$emit('cancel')">取消</button>
        <button class="btn-confirm" @click="confirm">确认裁剪</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cropper-overlay {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(0,0,0,0.7);
  display: flex; align-items: center; justify-content: center;
}
.cropper-modal {
  background: rgba(30,41,59,0.98);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 20px;
  padding: 24px;
  max-width: 420px;
  width: 90vw;
}
.cropper-title {
  font-size: 16px; font-weight: 600; margin-bottom: 16px; text-align: center; color: rgba(255,255,255,0.8);
}
.cropper-body {
  display: flex; justify-content: center;
}
.cropper-canvas {
  width: 340px; height: 340px;
  border-radius: 16px;
  cursor: grab;
  touch-action: none;
}
.cropper-canvas:active { cursor: grabbing; }
.cropper-controls {
  display: flex; align-items: center; gap: 12px;
  margin-top: 14px; padding: 0 8px;
}
.ctrl-label { font-size: 13px; color: rgba(255,255,255,0.5); flex-shrink: 0; }
.zoom-slider {
  flex: 1; height: 4px; accent-color: #60a5fa;
}
.cropper-actions {
  display: flex; gap: 10px; margin-top: 16px;
}
.btn-cancel {
  flex: 1; padding: 10px; border: 1px solid rgba(255,255,255,0.15);
  border-radius: 12px; background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.6);
  cursor: pointer; font-size: 14px;
}
.btn-confirm {
  flex: 1; padding: 10px; border: none; border-radius: 12px;
  background: linear-gradient(135deg, #60a5fa, #8b5cf6); color: white;
  cursor: pointer; font-size: 14px;
}
</style>
