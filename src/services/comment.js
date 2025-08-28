import apiService from './api'

export default {
  // 取得某篇文章的留言
  getComments(articleId) {
    return apiService.api.get(`/articles/${articleId}/comments`)
  },

  // 新增留言（需要登入）
  addComment(articleId, data) {
    return apiService.apiAuth.post(`/articles/${articleId}/comments`, data)
  },
  // 刪除留言（需要登入）
  // ...existing code...
  deleteComment(articleId, commentId) {
    return apiService.apiAuth.delete(`/articles/${articleId}/comments/${commentId}`)
  }
  // ...existing code...
}
