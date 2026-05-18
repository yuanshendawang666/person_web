import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'home', component: () => import('../views/Home.vue') },
  { path: '/life', name: 'life', component: () => import('../views/Life.vue') },
  { path: '/study', name: 'study', component: () => import('../views/Study.vue') },
  { path: '/game', name: 'game', component: () => import('../views/Game.vue') },
  { path: '/login', name: 'login', component: () => import('../views/Login.vue') },
  { path: '/register', name: 'register', component: () => import('../views/Register.vue') },
  { path: '/profile', name: 'profile', component: () => import('../views/Profile.vue') },
  { path: '/post/:id', name: 'postDetail', component: () => import('../views/PostDetail.vue') },
  { path: '/admin/publish', name: 'publish', component: () => import('../views/AdminPublish.vue'), meta: { requiresAdmin: true } },
  { path: '/admin/users', name: 'adminUsers', component: () => import('../views/AdminUsers.vue'), meta: { requiresAdmin: true } },
  { path: '/discuss', name: 'discuss', component: () => import('../views/Discuss.vue') },
  { path: '/discuss/:id', name: 'discussDetail', component: () => import('../views/DiscussDetail.vue') },
  { path: '/messages', name: 'messages', component: () => import('../views/Messages.vue') },
  { path: '/messages/:id', name: 'messageChat', component: () => import('../views/MessageChat.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
