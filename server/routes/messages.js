import { Router } from 'express'
import pool from '../db.js'
import { authRequired, approvedRequired } from '../middleware/auth.js'

const router = Router()

// 获取会话列表（最近一条消息聚合）
router.get('/', authRequired, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.username, u.avatar,
        (SELECT content FROM messages
         WHERE (from_id = ? AND to_id = u.id) OR (from_id = u.id AND to_id = ?)
         ORDER BY created_at DESC LIMIT 1) AS last_msg,
        (SELECT created_at FROM messages
         WHERE (from_id = ? AND to_id = u.id) OR (from_id = u.id AND to_id = ?)
         ORDER BY created_at DESC LIMIT 1) AS last_time,
        (SELECT COUNT(*) FROM messages
         WHERE from_id = u.id AND to_id = ? AND is_read = 0) AS unread
       FROM messages m
       JOIN users u ON (CASE WHEN m.from_id = ? THEN m.to_id ELSE m.from_id END) = u.id
       WHERE m.from_id = ? OR m.to_id = ?
       GROUP BY u.id
       ORDER BY last_time DESC`,
      [req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id]
    )
    res.json({ conversations: rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: '服务器错误' })
  }
})

// 获取与某用户的聊天记录
router.get('/:userId', authRequired, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT m.*, u.username, u.avatar
       FROM messages m JOIN users u ON m.from_id = u.id
       WHERE (m.from_id = ? AND m.to_id = ?) OR (m.from_id = ? AND m.to_id = ?)
       ORDER BY m.created_at ASC`,
      [req.user.id, req.params.userId, req.params.userId, req.user.id]
    )
    // 标记已读
    await pool.query(
      'UPDATE messages SET is_read = 1 WHERE from_id = ? AND to_id = ? AND is_read = 0',
      [req.params.userId, req.user.id]
    )
    res.json({ messages: rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: '服务器错误' })
  }
})

// 发送消息
router.post('/', authRequired, approvedRequired, async (req, res) => {
  try {
    const { to_id, content } = req.body
    if (!to_id || !content?.trim()) return res.status(400).json({ message: '内容不能为空' })
    const [r] = await pool.query(
      'INSERT INTO messages (from_id, to_id, content) VALUES (?, ?, ?)',
      [req.user.id, to_id, content.trim()]
    )
    res.status(201).json({ id: r.insertId, created_at: new Date().toISOString() })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: '服务器错误' })
  }
})

export default router
