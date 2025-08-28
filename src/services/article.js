import apiService from './api'

export default {
  create(data) {
    return apiService.apiAuth.post('/article', data)
  },
  getAll() {
    return apiService.apiAuth.get('/article/all')
  },
  get() {
    return apiService.api.get('/article')
  },
  getId(id) {
    return apiService.api.get('/article/' + id)
  },
  getUser() {
    return apiService.apiAuth.get('/article/user')
  },
  update(id, data) {
    return apiService.apiAuth.patch(`/article/${id}`, data)
  },
  remove(id) {
    return apiService.apiAuth.delete(`/article/${id}`)
  },
  updateClickCount(id, clickCount) {
    return this.update(id, { clickCount })
  }
}
