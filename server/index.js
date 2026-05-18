import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { optionalAuth } from './middleware/optionalAuth.js'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/user.js'
import postRoutes from './routes/posts.js'
import commentRoutes from './routes/comments.js'
import likeRoutes from './routes/likes.js'
import uploadRoutes from './routes/upload.js'
import discussRoutes from './routes/discuss.js'
import messageRoutes from './routes/messages.js'

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static('uploads'))
app.use(optionalAuth)

// 路由
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/posts', postRoutes)
app.use('/api', commentRoutes)
app.use('/api', likeRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/discuss', discussRoutes)
app.use('/api/messages', messageRoutes)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
