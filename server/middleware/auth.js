import jwt from 'jsonwebtoken'
import pool from '../db.js'

const JWT_SECRET = process.env.JWT_SECRET || 'person_web_secret_key_2026'

export function authRequired(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: '请先登录' })
  }
  try {
    req.user = jwt.verify(header.split(' ')[1], JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ message: '登录已过期，请重新登录' })
  }
}

export function adminRequired(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: '无权限' })
  }
  next()
}

export async function approvedRequired(req, res, next) {
  // 从数据库查询最新状态，避免JWT中缓存的过期状态
  try {
    const [rows] = await pool.query('SELECT role, status FROM users WHERE id = ?', [req.user.id])
    if (!rows.length) return res.status(404).json({ message: '用户不存在' })
    if (rows[0].role === 'admin') return next()
    if (rows[0].status !== 'approved') {
      return res.status(403).json({ message: '账号尚未通过审核，点赞和评论功能暂不可用' })
    }
    next()
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: '服务器错误' })
  }
}

export { JWT_SECRET }
