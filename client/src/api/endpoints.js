import api from './index'

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/user/profile', data),
  uploadAvatar: (data) => api.post('/user/avatar', data),
}

export const postAPI = {
  list: (params) => api.get('/posts', { params }),
  detail: (id) => api.get(`/posts/${id}`),
  create: (data) => api.post('/posts', data),
  update: (id, data) => api.put(`/posts/${id}`, data),
  delete: (id) => api.delete(`/posts/${id}`),
}

export const uploadAPI = {
  image: (data) => api.post('/upload/image', data),
  video: (data) => api.post('/upload/video', data),
  audio: (data) => api.post('/upload/audio', data),
  avatar: (data) => api.post('/upload/avatar', data),
}

export const likeAPI = {
  like: (id) => api.post(`/posts/${id}/like`),
  unlike: (id) => api.delete(`/posts/${id}/like`),
}

export const commentAPI = {
  list: (postId) => api.get(`/posts/${postId}/comments`),
  create: (postId, data) => api.post(`/posts/${postId}/comments`, data),
  delete: (id) => api.delete(`/comments/${id}`),
}

export const discussAPI = {
  list: () => api.get('/discuss'),
  detail: (id) => api.get(`/discuss/${id}`),
  create: (data) => api.post('/discuss', data),
  reply: (id, content) => api.post(`/discuss/${id}/reply`, { content }),
  delete: (id) => api.delete(`/discuss/${id}`),
  like: (id) => api.post(`/discuss/${id}/like`),
  unlike: (id) => api.delete(`/discuss/${id}/like`),
}

export const userAPI = {
  pending: () => api.get('/user/pending'),
  all: () => api.get('/user/all'),
  approve: (id) => api.put(`/user/approve/${id}`),
  promote: (id) => api.put(`/user/promote/${id}`),
  demote: (id) => api.put(`/user/demote/${id}`),
  delete: (id) => api.delete(`/user/${id}`),
}
