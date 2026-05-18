import { Router } from 'express'
import pool from '../db.js'
import { authRequired, approvedRequired } from '../middleware/auth.js'

const router = Router()

// 获取评论
router.get('/posts/:postId/comments', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.*, u.username, u.avatar
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.post_id = ?
       ORDER BY c.created_at ASC`,
      [req.params.postId]
    )
    res.json({ comments: rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: '服务器错误' })
  }
})

// 发布评论
router.post('/posts/:postId/comments', authRequired, approvedRequired, async (req, res) => {
  try {
    const { content } = req.body
    if (!content || !content.trim()) {
      return res.status(400).json({ message: '评论内容不能为空' })
    }

    const [result] = await pool.query(
      'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
      [req.params.postId, req.user.id, content.trim()]
    )

    const [rows] = await pool.query(
      `SELECT c.*, u.username, u.avatar
       FROM comments c JOIN users u ON c.user_id = u.id
       WHERE c.id = ?`,
      [result.insertId]
    )

    res.status(201).json({ comment: rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: '服务器错误' })
  }
})

// 删除评论
router.delete('/comments/:id', authRequired, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM comments WHERE id = ?', [req.params.id])
    if (rows.length === 0) {
      return res.status(404).json({ message: '评论不存在' })
    }

    const comment = rows[0]
    if (req.user.role !== 'admin' && req.user.id !== comment.user_id) {
      return res.status(403).json({ message: '无权限删除此评论' })
    }

    await pool.query('DELETE FROM comments WHERE id = ?', [req.params.id])
    res.json({ message: '评论已删除' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: '服务器错误' })
  }
})

export default router
