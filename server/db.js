import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const db = new Database(join(__dirname, 'person_web.db'))
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// 初始化表结构
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    avatar TEXT DEFAULT NULL,
    bio TEXT,
    tags TEXT DEFAULT '[]',
    realname TEXT DEFAULT '',
    role TEXT DEFAULT 'user' CHECK(role IN ('admin','user')),
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending','approved')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    category TEXT NOT NULL CHECK(category IN ('life','study','game')),
    author_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS post_media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('image','video','audio')),
    url TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, user_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS discussions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS discussion_replies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    discussion_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (discussion_id) REFERENCES discussions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_id INTEGER NOT NULL,
    to_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (to_id) REFERENCES users(id) ON DELETE CASCADE
  );
`)

// 迁移：为已有表添加新列（忽略已存在的错误）
try { db.exec('ALTER TABLE users ADD COLUMN tags TEXT DEFAULT \'[]\'') } catch {}
try { db.exec('ALTER TABLE users ADD COLUMN realname TEXT DEFAULT \'\'') } catch {}

// 插入默认管理员
const existing = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@example.com')
if (!existing) {
  const hash = bcrypt.hashSync('@580d20061131', 10)
  db.prepare('INSERT INTO users (username, email, password, realname, role, status, bio) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
    'yuanshendawang', 'admin@example.com', hash, '站长', 'admin', 'approved', '记录生活、学习与游戏。'
  )
}

// 兼容 mysql2 的 query 接口包装
function query(sql, params = []) {
  const trimmed = sql.trim().toUpperCase()
  const isSelect = trimmed.startsWith('SELECT') || trimmed.startsWith('WITH')

  if (isSelect) {
    const rows = db.prepare(sql).all(...params)
    return [rows]
  } else {
    const result = db.prepare(sql).run(...params)
    return [{ insertId: result.lastInsertRowid, affectedRows: result.changes }]
  }
}

// 批量插入支持
function batchInsert(sql, valueRows) {
  const stmt = db.prepare(sql)
  const insertMany = db.transaction((rows) => {
    for (const row of rows) {
      stmt.run(...row)
    }
  })
  insertMany(valueRows)
  return [{ affectedRows: valueRows.length }]
}

// 包装 pool.query
const pool = {
  query(sql, params = []) {
    if (sql.includes('VALUES ?') && Array.isArray(params[0]) && Array.isArray(params[0][0])) {
      const placeholders = params[0][0].map(() => '?').join(',')
      const baseSql = sql.replace('VALUES ?', `VALUES (${placeholders})`)
      return batchInsert(baseSql, params[0])
    }
    return query(sql, params)
  }
}

export default pool
