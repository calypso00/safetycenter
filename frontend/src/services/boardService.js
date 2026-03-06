import api from './api';

const boardService = {
  // 게시글 목록 조회
  getPosts: async (params = {}) => {
    return api.get('/board/posts', { params });
  },

  // 게시글 작성
  createPost: async (postData) => {
    return api.post('/board/posts', postData);
  },

  // 게시글 상세 조회
  getPostById: async (id) => {
    return api.get(`/board/posts/${id}`);
  },

  // 게시글 수정
  updatePost: async (id, postData) => {
    return api.put(`/board/posts/${id}`, postData);
  },

  // 게시글 삭제
  deletePost: async (id) => {
    return api.delete(`/board/posts/${id}`);
  },

  // 댓글 목록 조회
  getComments: async (postId) => {
    return api.get(`/board/posts/${postId}/comments`);
  },

  // 댓글 작성
  createComment: async (postId, commentData) => {
    return api.post(`/board/posts/${postId}/comments`, commentData);
  },

  // 댓글 삭제
  deleteComment: async (commentId) => {
    return api.delete(`/board/comments/${commentId}`);
  },
};

export default boardService;
