import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../db.js'
import { authRequired, JWT_SECRET } from '../middleware/auth.js'

const router = Router()

// 注册
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, realname } = req.body
    if (!username || !email || !password || !realname) {
      return res.status(400).json({ message: '请填写所有字段' })
    }
    if (password.length < 6) {
      return res.status(400).json({ message: '密码至少6位' })
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email])
    if (existing.length > 0) {
      return res.status(400).json({ message: '邮箱已被注册' })
    }

    const [nameCheck] = await pool.query('SELECT id FROM users WHERE username = ?', [username])
    if (nameCheck.length > 0) {
      return res.status(400).json({ message: '用户名已被使用' })
    }

    const hashed = await bcrypt.hash(password, 10)
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password, realname) VALUES (?, ?, ?, ?)',
      [username, email, hashed, realname]
    )

    const token = jwt.sign(
      { id: result.insertId, username, role: 'user', status: 'pending' },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({ token, message: '注册成功，等待管理员审核' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: '服务器错误' })
  }
})

// 登录
router.post('/login', async (req, res) => {
  try {
    const { login, password } = req.body
    if (!login || !password) {
      return res.status(400).json({ message: '请输入用户名/邮箱和密码' })
    }

    const [rows] = await pool.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [login, login]
    )
    if (rows.length === 0) {
      return res.status(400).json({ message: '账号或密码错误' })
    }

    const user = rows[0]
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return res.status(400).json({ message: '账号或密码错误' })
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, status: user.status },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({ token, message: '登录成功' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: '服务器错误' })
  }
})

// 获取当前用户
router.get('/me', authRequired, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, email, avatar, bio, tags, realname, role, status, created_at FROM users WHERE id = ?',
      [req.user.id]
    )
    if (rows.length === 0) {
      return res.status(404).json({ message: '用户不存在' })
    }
    res.json({ user: rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: '服务器错误' })
  }
})

export default router
