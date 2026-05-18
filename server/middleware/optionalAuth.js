import jwt from 'jsonwebtoken'
import { JWT_SECRET } from './auth.js'

export function optionalAuth(req, res, next) {
  const header = req.headers.authorization
  if (header && header.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(header.split(' ')[1], JWT_SECRET)
    } catch { /* token invalid, ignore */ }
  }
  next()
}
