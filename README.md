# 个人空间网站开发需求文档

# 项目简介

开发一个类似 QQ 空间的个人动态网站。

整体 UI 风格参考 `demo.html`。

网站主要用于：

- 记录生活
- 记录学习
- 记录游戏

网站风格不是传统博客，而是：

- 动态流
- 社交感
- 卡片式空间
- 毛玻璃科技风

网站核心逻辑：

- 总空间显示所有模块动态
- 生活模块只显示生活内容
- 学习模块只显示学习内容
- 游戏模块只显示游戏内容

只有站长本人可以发布动态。

其他用户：

- 只能浏览
- 点赞
- 评论

必须支持：

- 文字
- 图片
- 视频
- 音频

---

# 一、技术栈要求

## 前端

使用：

- Vue 3
- Vite
- Vue Router
- Pinia
- Axios
- TailwindCSS

## 后端

使用：

- Node.js
- Express

需要：

- JWT 登录认证
- Multer 文件上传

## 数据库

使用：

- MySQL

---

# 二、UI 风格要求

必须参考 `demo.html` 的视觉风格。

## UI 特征

- 深色渐变背景
- 蓝紫色发光背景
- 毛玻璃效果
- 半透明卡片
- 大圆角
- 柔和阴影
- hover 动画
- 卡片上浮效果
- 左侧信息栏
- 右侧动态流布局

## 页面布局

左边：

- 用户头像
- 用户昵称
- 用户简介
- 标签
- 模块导航

右边：

- 顶部栏
- 发布按钮
- 动态列表
- 内容卡片

---

# 三、网站模块

网站主要分为：

## 1. 总空间

路径：

```txt
/
```

功能：

显示：

- 生活动态
- 学习动态
- 游戏动态

总空间是聚合动态流。

例如：

```txt
[生活] 今天出去玩了
[学习] Vue 学习笔记
[游戏] 黑神话通关了
```

所有模块动态都会同步显示到总空间。

---

## 2. 生活模块

路径：

```txt
/life
```

只显示：

```txt
category = life
```

内容包括：

- 日常
- 旅游
- 美食
- 照片
- 心情
- 现实生活记录

---

## 3. 学习模块

路径：

```txt
/study
```

只显示：

```txt
category = study
```

内容包括：

- 编程
- AI
- 技术笔记
- 学习计划
- 项目开发
- 阅读记录

---

## 4. 游戏模块

路径：

```txt
/game
```

只显示：

```txt
category = game
```

内容包括：

- 游戏截图
- 游戏视频
- 通关记录
- 联机记录
- MOD
- 游戏心得

---

# 四、用户权限系统

## 1. 站长（admin）

站长拥有：

- 发布动态
- 编辑动态
- 删除动态
- 上传图片
- 上传视频
- 上传音频
- 删除评论
- 修改头像
- 修改个人资料
- 管理后台权限

---

## 2. 普通用户（user）

普通用户只能：

- 注册
- 登录
- 浏览动态
- 点赞
- 评论
- 修改自己的头像
- 修改自己的简介
- 删除自己的评论

普通用户不能：

- 发布动态
- 编辑动态
- 删除动态
- 进入后台

---

# 五、登录功能

路径：

```txt
/login
```

登录字段：

- 用户名或邮箱
- 密码

功能：

- 登录成功保存 JWT token
- 自动跳转首页
- 根据用户身份显示权限

---

# 六、注册功能

路径：

```txt
/register
```

注册字段：

- 用户名
- 邮箱
- 密码
- 确认密码

注册成功：

- 自动登录

或者：

- 跳转登录页

默认：

```txt
role = user
```

---

# 七、个人资料功能

路径：

```txt
/profile
```

用户可以修改：

- 头像
- 昵称
- 简介
- 密码

头像上传：

支持：

- jpg
- png
- webp

头像存储目录：

```txt
/uploads/avatars/
```

---

# 八、动态发布功能

只有 admin 可以发布动态。

路径：

```txt
/admin/publish
```

普通用户访问：

- 自动跳转首页

或者：

- 显示无权限页面

---

## 动态发布字段

发布动态时需要支持：

- 标题
- 正文
- 分类
- 图片上传
- 视频上传
- 音频上传

---

## 分类选项

```txt
生活
学习
游戏
```

对应：

```txt
life
study
game
```

---

# 九、动态内容支持

## 1. 文字

支持：

- 标题
- 长文本
- 换行

---

## 2. 图片

支持：

- 单图
- 多图
- 九宫格

支持：

- jpg
- png
- webp
- gif

图片支持：

- 点击预览
- 放大查看

---

## 3. 视频

支持：

- mp4
- webm

使用：

```html
<video controls>
```

功能：

- 播放
- 暂停
- 进度条
- 全屏

---

## 4. 音频

支持：

- mp3
- wav

使用：

```html
<audio controls>
```

功能：

- 播放
- 暂停
- 进度条

---

# 十、动态卡片设计

动态卡片必须参考 `demo.html`。

每张卡片包括：

- 分类标签
- 标题
- 正文
- 图片区域
- 视频区域
- 音频区域
- 发布时间
- 点赞数
- 评论数

---

## 分类颜色

生活：

```txt
绿色
```

学习：

```txt
蓝色
```

游戏：

```txt
紫色
```

---

# 十一、点赞功能

## 点赞规则

- 登录用户可以点赞
- 一个用户只能点赞一次
- 再次点击取消点赞
- 未登录点击点赞跳转登录页

---

## 点赞接口

```txt
POST /api/posts/:id/like
DELETE /api/posts/:id/like
```

---

# 十二、评论功能

## 评论规则

- 登录用户可以评论
- 未登录用户点击评论时跳转登录页
- 普通用户只能删除自己的评论
- admin 可以删除所有评论

---

## 评论显示内容

每条评论需要显示：

- 用户头像
- 用户昵称
- 评论内容
- 评论时间

---

## 评论功能要求

### 1. 发布评论

登录用户可以：

- 输入评论内容
- 点击发送评论
- 评论成功后实时刷新评论列表

未登录用户：

- 点击评论输入框
- 点击发送按钮

时：

- 自动跳转登录页

---

### 2. 删除评论

普通用户：

- 只能删除自己的评论

admin：

- 可以删除所有评论

---

## 评论数据结构示例

```js
{
  id: 1,
  postId: 12,
  userId: 5,
  username: "星野",
  avatar: "/uploads/avatars/avatar.png",
  content: "这个页面真的很好看。",
  createdAt: "2026-05-17 21:30:00"
}
```

---

## 评论接口设计

### 获取评论列表

```txt
GET /api/posts/:id/comments
```

### 发布评论

```txt
POST /api/posts/:id/comments
```

### 删除评论

```txt
DELETE /api/comments/:id
```

---

## 评论 UI 要求

评论区域风格需要参考 demo.html：

- 毛玻璃背景
- 半透明卡片
- 大圆角
- hover 动画
- 深色科技风

---

## 评论输入框要求

需要支持：

- 多行输入
- Enter 发送
- Shift + Enter 换行

---

## 评论安全要求

后端必须：

- 验证 JWT
- 验证用户身份
- 防止未登录用户评论
- 防止用户删除别人的评论
- 防止空评论提交

---

# 十三、文件上传功能

上传目录：

```txt
uploads/
├── images/
├── videos/
├── audios/
└── avatars/
```

上传使用：

```txt
Multer
```

---

# 十四、数据库设计

## users 表

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  avatar VARCHAR(255),
  bio TEXT,
  role ENUM('admin', 'user') DEFAULT 'user',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## posts 表

```sql
CREATE TABLE posts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(100) NOT NULL,
  content TEXT,
  category ENUM('life', 'study', 'game') NOT NULL,
  author_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## post_media 表

```sql
CREATE TABLE post_media (
  id INT PRIMARY KEY AUTO_INCREMENT,
  post_id INT NOT NULL,
  type ENUM('image', 'video', 'audio') NOT NULL,
  url VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## comments 表

```sql
CREATE TABLE comments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## likes 表

```sql
CREATE TABLE likes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_like (post_id, user_id)
);
```

---

# 十五、接口设计

## 用户接口

```txt
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
PUT /api/user/profile
POST /api/user/avatar
```

---

## 动态接口

```txt
GET /api/posts
GET /api/posts?category=life
GET /api/posts?category=study
GET /api/posts?category=game
GET /api/posts/:id

POST /api/posts
PUT /api/posts/:id
DELETE /api/posts/:id
```

---

## 上传接口

```txt
POST /api/upload/image
POST /api/upload/video
POST /api/upload/audio
POST /api/upload/avatar
```

---

## 评论接口

```txt
GET /api/posts/:id/comments
POST /api/posts/:id/comments
DELETE /api/comments/:id
```

---

## 点赞接口

```txt
POST /api/posts/:id/like
DELETE /api/posts/:id/like
```

---

# 十六、前端目录结构

```txt
src/
├── components/
│   ├── Layout/
│   ├── Post/
│   ├── User/
│   └── Common/
│
├── views/
│   ├── Home.vue
│   ├── Life.vue
│   ├── Study.vue
│   ├── Game.vue
│   ├── Login.vue
│   ├── Register.vue
│   ├── Profile.vue
│   ├── PostDetail.vue
│   └── AdminPublish.vue
│
├── router/
├── stores/
├── api/
└── main.js
```

---

# 十七、权限控制要求

## 前端权限控制

普通用户：

- 不显示发布按钮
- 不显示后台入口
- 不允许进入后台页面

未登录用户：

- 不显示评论输入框
- 点赞时跳转登录页

---

## 后端权限控制

必须验证 JWT。

以下接口必须 admin：

```txt
POST /api/posts
PUT /api/posts/:id
DELETE /api/posts/:id
```

评论删除：

- admin 可以删除所有评论
- user 只能删除自己的评论

---

# 十八、开发顺序

## 第一阶段

完成：

- UI
- 页面布局
- 假数据动态流

---

## 第二阶段

完成：

- 登录
- 注册
- 用户状态

---

## 第三阶段

完成：

- Express 后端
- MySQL
- JWT

---

## 第四阶段

完成：

- 图片上传
- 视频上传
- 音频上传

---

## 第五阶段

完成：

- 评论
- 点赞
- 个人资料

---

## 第六阶段

完成：

- 响应式
- 动画
- UI 优化

---

# 十九、最终目标

最终效果：

- 类 QQ 空间
- 类个人社交空间
- 毛玻璃科技风
- 支持动态流
- 支持图片视频音频
- 支持点赞评论
- 支持账号系统
- 支持个人资料
- 总空间聚合所有内容
- 模块独立分类展示

后期可扩展：

- 留言板
- 音乐播放器
- 相册
- 访客记录
- 背景音乐
- 动态主题
- 私信系统