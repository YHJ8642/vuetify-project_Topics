// src/services/marker.js
import apiService from './api'

export default {
  getMarkers() {
    return apiService.api.get('/markers')
  },

  addMarker(data) {
    return apiService.apiAuth.post('/markers', data)
  },

  deleteMarker(markerId) {
    return apiService.apiAuth.delete(`/markers/${markerId}`)
  },

  addComment(markerId, data) {
    return apiService.apiAuth.post(`/markers/${markerId}/comments`, data)
  },

  deleteComment(markerId, commentId, data) {
    // data 可以傳 userId
    return apiService.apiAuth.delete(`/markers/${markerId}/comments/${commentId}`, { data })
  },
}
