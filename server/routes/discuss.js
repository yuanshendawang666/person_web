import { Router } from 'express'
import pool from '../db.js'
import { authRequired, approvedRequired } from '../middleware/auth.js'

const router = Router()

// 讨论列表
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT d.*, u.username, u.avatar,
        (SELECT COUNT(*) FROM discussion_replies WHERE discussion_id = d.id) AS reply_count
       FROM discussions d
       JOIN users u ON d.user_id = u.id
       ORDER BY d.created_at DESC`
    )
    res.json({ discussions: rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: '服务器错误' })
  }
})

// 讨论详情
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT d.*, u.username, u.avatar
       FROM discussions d JOIN users u ON d.user_id = u.id
       WHERE d.id = ?`,
      [req.params.id]
    )
    if (rows.length === 0) return res.status(404).json({ message: '不存在' })
    const [replies] = await pool.query(
      `SELECT r.*, u.username, u.avatar
       FROM discussion_replies r JOIN users u ON r.user_id = u.id
       WHERE r.discussion_id = ? ORDER BY r.created_at ASC`,
      [req.params.id]
    )
    res.json({ discussion: rows[0], replies })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: '服务器错误' })
  }
})

// 发帖
router.post('/', authRequired, approvedRequired, async (req, res) => {
  try {
    const { title, content } = req.body
    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ message: '标题和内容不能为空' })
    }
    const [r] = await pool.query(
      'INSERT INTO discussions (title, content, user_id) VALUES (?, ?, ?)',
      [title.trim(), content.trim(), req.user.id]
    )
    res.status(201).json({ id: r.insertId, message: '发布成功' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: '服务器错误' })
  }
})

// 回复
router.post('/:id/reply', authRequired, approvedRequired, async (req, res) => {
  try {
    const { content } = req.body
    if (!content?.trim()) return res.status(400).json({ message: '内容不能为空' })
    const [r] = await pool.query(
      'INSERT INTO discussion_replies (discussion_id, user_id, content) VALUES (?, ?, ?)',
      [req.params.id, req.user.id, content.trim()]
    )
    res.status(201).json({ id: r.insertId })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: '服务器错误' })
  }
})

// 删帖 (admin 或作者)
router.delete('/:id', authRequired, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT user_id FROM discussions WHERE id = ?', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ message: '不存在' })
    if (req.user.role !== 'admin' && req.user.id !== rows[0].user_id) {
      return res.status(403).json({ message: '无权限' })
    }
    await pool.query('DELETE FROM discussions WHERE id = ?', [req.params.id])
    res.json({ message: '删除成功' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: '服务器错误' })
  }
})

export default router
