// src/services/favorite.js
import apiService from './api'

export default {
  getAll() {
    return apiService.apiAuth.get('/favorites')
  },
  add(postId) {
    return apiService.apiAuth.post('/favorites', { postId })
  },
  remove(favoriteId) {
    return apiService.apiAuth.delete(`/favorites/${favoriteId}`)
  }
}
