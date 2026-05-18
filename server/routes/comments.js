import { Router } from 'express'
import pool from '../db.js'
import { authRequired, approvedRequired } from '../middleware/auth.js'

const router = Router()

// 获取评论（含媒体和点赞信息）
router.get('/posts/:postId/comments', async (req, res) => {
  try {
    const userId = req.user?.id || 0
    const [rows] = await pool.query(
      `SELECT c.*, u.username, u.avatar, u.id AS user_id,
        (SELECT COUNT(*) FROM likes WHERE post_id = c.post_id) AS liked_by_user
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.post_id = ?
       ORDER BY c.created_at ASC`,
      [req.params.postId]
    )
    for (const c of rows) {
      const [media] = await pool.query('SELECT * FROM comment_media WHERE comment_id = ?', [c.id])
      c.images = media.filter(m => m.type === 'image')
      c.videos = media.filter(m => m.type === 'video')
      c.audios = media.filter(m => m.type === 'audio')
    }
    res.json({ comments: rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: '服务器错误' })
  }
})

// 发布评论（支持媒体）
router.post('/posts/:postId/comments', authRequired, approvedRequired, async (req, res) => {
  try {
    const { content, images, videos, audios } = req.body
    if ((!content || !content.trim()) && !images?.length && !videos?.length && !audios?.length) {
      return res.status(400).json({ message: '评论内容不能为空' })
    }

    const [result] = await pool.query(
      'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
      [req.params.postId, req.user.id, (content || '').trim()]
    )
    const commentId = result.insertId

    if (images?.length) {
      const vals = images.map(url => [commentId, 'image', url])
      await pool.query('INSERT INTO comment_media (comment_id, type, url) VALUES ?', [vals])
    }
    if (videos?.length) {
      const vals = videos.map(url => [commentId, 'video', url])
      await pool.query('INSERT INTO comment_media (comment_id, type, url) VALUES ?', [vals])
    }
    if (audios?.length) {
      const vals = audios.map(url => [commentId, 'audio', url])
      await pool.query('INSERT INTO comment_media (comment_id, type, url) VALUES ?', [vals])
    }

    const [rows] = await pool.query(
      `SELECT c.*, u.username, u.avatar, u.id AS user_id
       FROM comments c JOIN users u ON c.user_id = u.id
       WHERE c.id = ?`,
      [commentId]
    )
    const comment = rows[0]
    const [media] = await pool.query('SELECT * FROM comment_media WHERE comment_id = ?', [commentId])
    comment.images = media.filter(m => m.type === 'image')
    comment.videos = media.filter(m => m.type === 'video')
    comment.audios = media.filter(m => m.type === 'audio')

    res.status(201).json({ comment })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: '服务器错误' })
  }
})

// 删除评论
router.delete('/comments/:id', authRequired, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM comments WHERE id = ?', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ message: '评论不存在' })

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
