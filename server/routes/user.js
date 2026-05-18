import { Router } from 'express'
import bcrypt from 'bcryptjs'
import multer from 'multer'
import path from 'path'
import pool from '../db.js'
import { authRequired, adminRequired } from '../middleware/auth.js'

const router = Router()

const avatarStorage = multer.diskStorage({
  destination: 'uploads/avatars/',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `avatar-${req.user.id}-${Date.now()}${ext}`)
  },
})

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp']
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, allowed.includes(ext))
  },
})

// 修改资料
router.put('/profile', authRequired, async (req, res) => {
  try {
    const { username, bio, tags, oldPassword, newPassword } = req.body

    if (newPassword) {
      if (!oldPassword) {
        return res.status(400).json({ message: '请输入旧密码' })
      }
      const [rows] = await pool.query('SELECT password FROM users WHERE id = ?', [req.user.id])
      const valid = await bcrypt.compare(oldPassword, rows[0].password)
      if (!valid) {
        return res.status(400).json({ message: '旧密码错误' })
      }
      const hashed = await bcrypt.hash(newPassword, 10)
      await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id])
      return res.json({ message: '密码修改成功' })
    }

    if (username) {
      await pool.query('UPDATE users SET username = ? WHERE id = ?', [username, req.user.id])
    }
    if (bio !== undefined) {
      await pool.query('UPDATE users SET bio = ? WHERE id = ?', [bio, req.user.id])
    }
    if (tags !== undefined) {
      await pool.query('UPDATE users SET tags = ? WHERE id = ?', [JSON.stringify(tags), req.user.id])
    }

    res.json({ message: '资料更新成功' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: '服务器错误' })
  }
})

// 上传头像
router.post('/avatar', authRequired, avatarUpload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '请选择文件' })
    }
    const url = `/uploads/avatars/${req.file.filename}`
    await pool.query('UPDATE users SET avatar = ? WHERE id = ?', [url, req.user.id])
    res.json({ url, message: '头像上传成功' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: '上传失败' })
  }
})

// 管理员：获取待审核用户列表
router.get('/pending', authRequired, adminRequired, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, email, realname, created_at FROM users WHERE status = ? ORDER BY created_at ASC',
      ['pending']
    )
    res.json({ users: rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: '服务器错误' })
  }
})

// 管理员：审核通过用户
router.put('/approve/:id', authRequired, adminRequired, async (req, res) => {
  try {
    await pool.query('UPDATE users SET status = ? WHERE id = ?', ['approved', req.params.id])
    res.json({ message: '审核通过' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: '服务器错误' })
  }
})

// 管理员：获取所有用户列表（不含密码）
router.get('/all', authRequired, adminRequired, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, email, realname, avatar, bio, role, status, created_at FROM users ORDER BY created_at DESC'
    )
    res.json({ users: rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: '服务器错误' })
  }
})

// 仅 yuanshendawang 可提升管理员
router.put('/promote/:id', authRequired, async (req, res) => {
  try {
    if (req.user.id !== 1) return res.status(403).json({ message: '仅站长可执行此操作' })
    await pool.query('UPDATE users SET role = ? WHERE id = ?', ['admin', req.params.id])
    res.json({ message: '已提升为管理员' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: '服务器错误' })
  }
})

// 仅 yuanshendawang 可撤销管理员
router.put('/demote/:id', authRequired, async (req, res) => {
  try {
    if (req.user.id !== 1) return res.status(403).json({ message: '仅站长可执行此操作' })
    await pool.query('UPDATE users SET role = ? WHERE id = ?', ['user', req.params.id])
    res.json({ message: '已撤销管理员权限' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: '服务器错误' })
  }
})

// 管理员删除普通用户
router.delete('/:id', authRequired, adminRequired, async (req, res) => {
  try {
    const [u] = await pool.query('SELECT role FROM users WHERE id = ?', [req.params.id])
    if (!u.length) return res.status(404).json({ message: '用户不存在' })
    if (u[0].role === 'admin') return res.status(403).json({ message: '不能删除管理员' })
    await pool.query('DELETE FROM users WHERE id = ?', [req.params.id])
    res.json({ message: '用户已删除' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: '服务器错误' })
  }
})

export default router
