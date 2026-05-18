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
  create: (postId, content) => api.post(`/posts/${postId}/comments`, { content }),
  delete: (id) => api.delete(`/comments/${id}`),
}
