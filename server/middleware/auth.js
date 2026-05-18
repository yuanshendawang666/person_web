import jwt from 'jsonwebtoken'

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

export function approvedRequired(req, res, next) {
  if (req.user?.role === 'admin') return next()
  if (req.user?.status !== 'approved') {
    return res.status(403).json({ message: '账号尚未通过审核，点赞和评论功能暂不可用' })
  }
  next()
}

export { JWT_SECRET }
