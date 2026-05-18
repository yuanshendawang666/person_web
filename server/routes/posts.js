import { Router } from 'express'
import pool from '../db.js'
import { authRequired } from '../middleware/auth.js'

const router = Router()

function getMediaQuery(userId) {
  return `
    SELECT p.*, u.username, u.avatar AS author_avatar,
      (SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS like_count,
      (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comment_count,
      (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ?) AS liked_by_user
    FROM posts p
    JOIN users u ON p.author_id = u.id
  `
}

// 获取动态列表
router.get('/', async (req, res) => {
  try {
    const { category, sort } = req.query
    const userId = req.user?.id || 0
    let sql = getMediaQuery(userId)
    const params = [userId]

    if (category && ['life', 'study', 'game'].includes(category)) {
      sql += ' WHERE p.category = ?'
      params.push(category)
    }

    const sortMap = {
      'time_desc': 'p.created_at DESC',
      'time_asc': 'p.created_at ASC',
      'likes_desc': 'like_count DESC',
      'likes_asc': 'like_count ASC',
      'comments_desc': 'comment_count DESC',
      'comments_asc': 'comment_count ASC',
    }
    sql += ' ORDER BY ' + (sortMap[sort] || 'p.created_at DESC')

    const [posts] = await pool.query(sql, params)

    // 为每个动态加载媒体
    for (const post of posts) {
      const [media] = await pool.query('SELECT * FROM post_media WHERE post_id = ?', [post.id])
      post.images = media.filter(m => m.type === 'image')
      post.videos = media.filter(m => m.type === 'video')
      post.audios = media.filter(m => m.type === 'audio')
      post.liked_by_user = post.liked_by_user > 0
    }

    res.json({ posts })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: '服务器错误' })
  }
})

// 获取动态详情
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user?.id || 0
    const [rows] = await pool.query(
      `${getMediaQuery(userId)} WHERE p.id = ?`,
      [userId, req.params.id]
    )
    if (rows.length === 0) {
      return res.status(404).json({ message: '动态不存在' })
    }
    const post = rows[0]
    const [media] = await pool.query('SELECT * FROM post_media WHERE post_id = ?', [post.id])
    post.images = media.filter(m => m.type === 'image')
    post.videos = media.filter(m => m.type === 'video')
    post.audios = media.filter(m => m.type === 'audio')
    post.liked_by_user = post.liked_by_user > 0

    res.json({ post })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: '服务器错误' })
  }
})

// 发布动态（仅站长 yuanshendawang）
router.post('/', authRequired, async (req, res) => {
  if (req.user.id !== 1) return res.status(403).json({ message: '仅站长可发布动态' })
  try {
    const { title, content, category, images, videos, audios } = req.body
    if (!title || !category) {
      return res.status(400).json({ message: '标题和分类为必填' })
    }

    const [result] = await pool.query(
      'INSERT INTO posts (title, content, category, author_id) VALUES (?, ?, ?, ?)',
      [title, content || '', category, req.user.id]
    )
    const postId = result.insertId

    if (images?.length) {
      const vals = images.map(url => [postId, 'image', url])
      await pool.query('INSERT INTO post_media (post_id, type, url) VALUES ?', [vals])
    }
    if (videos?.length) {
      const vals = videos.map(url => [postId, 'video', url])
      await pool.query('INSERT INTO post_media (post_id, type, url) VALUES ?', [vals])
    }
    if (audios?.length) {
      const vals = audios.map(url => [postId, 'audio', url])
      await pool.query('INSERT INTO post_media (post_id, type, url) VALUES ?', [vals])
    }

    res.status(201).json({ id: postId, message: '发布成功' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: '服务器错误' })
  }
})

// 删除动态（仅站长）
router.delete('/:id', authRequired, async (req, res) => {
  if (req.user.id !== 1) return res.status(403).json({ message: '仅站长可删除动态' })
  try {
    await pool.query('DELETE FROM posts WHERE id = ?', [req.params.id])
    res.json({ message: '删除成功' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: '服务器错误' })
  }
})

export default router
