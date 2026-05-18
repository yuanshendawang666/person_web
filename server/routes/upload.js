import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import { authRequired, adminRequired } from '../middleware/auth.js'

const router = Router()

const storage = (folder) => multer.diskStorage({
  destination: `uploads/${folder}/`,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${folder}-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`)
  },
})

const imageUpload = multer({
  storage: storage('images'),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const ok = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(path.extname(file.originalname).toLowerCase())
    cb(null, ok)
  },
})

const videoUpload = multer({
  storage: storage('videos'),
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const ok = ['.mp4', '.webm'].includes(path.extname(file.originalname).toLowerCase())
    cb(null, ok)
  },
})

const audioUpload = multer({
  storage: storage('audios'),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const ok = ['.mp3', '.wav'].includes(path.extname(file.originalname).toLowerCase())
    cb(null, ok)
  },
})

router.post('/image', authRequired, adminRequired, imageUpload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: '请选择图片' })
  res.json({ url: `/uploads/images/${req.file.filename}` })
})

router.post('/video', authRequired, adminRequired, videoUpload.single('video'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: '请选择视频' })
  res.json({ url: `/uploads/videos/${req.file.filename}` })
})

router.post('/audio', authRequired, adminRequired, audioUpload.single('audio'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: '请选择音频' })
  res.json({ url: `/uploads/audios/${req.file.filename}` })
})

export default router
