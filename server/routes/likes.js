import { Router } from 'express'
import pool from '../db.js'
import { authRequired, approvedRequired } from '../middleware/auth.js'

const router = Router()

// 点赞
router.post('/posts/:id/like', authRequired, approvedRequired, async (req, res) => {
  try {
    const [existing] = await pool.query(
      'SELECT id FROM likes WHERE post_id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    )
    if (existing.length > 0) {
      return res.status(400).json({ message: '已经点赞过了' })
    }

    await pool.query(
      'INSERT INTO likes (post_id, user_id) VALUES (?, ?)',
      [req.params.id, req.user.id]
    )

    const [count] = await pool.query(
      'SELECT COUNT(*) AS count FROM likes WHERE post_id = ?',
      [req.params.id]
    )

    res.json({ liked: true, like_count: count[0].count })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: '服务器错误' })
  }
})

// 取消点赞
router.delete('/posts/:id/like', authRequired, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM likes WHERE post_id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    )

    const [count] = await pool.query(
      'SELECT COUNT(*) AS count FROM likes WHERE post_id = ?',
      [req.params.id]
    )

    res.json({ liked: false, like_count: count[0].count })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: '服务器错误' })
  }
})

export default router
