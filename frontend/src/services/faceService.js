import api from './api';

/**
 * 안면인식 서비스
 */
const faceService = {
  /**
   * 얼굴 등록
   * @param {number} userId - 사용자 ID (선택사항, 본인 등록 시 불필요)
   * @param {string} image - Base64 인코딩된 이미지
   * @returns {Promise} 등록 결과
   */
  async registerFace(userId, image) {
    const data = { image };
    if (userId) {
      data.user_id = userId;
    }
    const response = await api.post('/face/register', data);
    return response.data;
  },

  /**
   * 얼굴 인증
   * @param {string} image - Base64 인코딩된 이미지
   * @returns {Promise} 인증 결과
   */
  async verifyFace(image) {
    const response = await api.post('/face/verify', { image });
    return response.data;
  },

  /**
   * 얼굴 감지
   * @param {string} image - Base64 인코딩된 이미지
   * @returns {Promise} 감지 결과
   */
  async detectFaces(image) {
    const response = await api.post('/face/detect', { image });
    return response.data;
  },

  /**
   * 얼굴 등록 상태 확인
   * @param {number} userId - 사용자 ID (선택사항)
   * @returns {Promise} 등록 상태
   */
  async getFaceStatus(userId) {
    const url = userId ? `/face/status/${userId}` : '/face/status';
    const response = await api.get(url);
    return response.data;
  },

  /**
   * 얼굴 데이터 삭제
   * @param {number} userId - 사용자 ID (선택사항)
   * @returns {Promise} 삭제 결과
   */
  async deleteFace(userId) {
    const url = userId ? `/face/${userId}` : '/face';
    const response = await api.delete(url);
    return response.data;
  },

  /**
   * 안면인식 모듈 상태 확인
   * @returns {Promise} 모듈 상태
   */
  async getModuleStatus() {
    const response = await api.get('/face/module-status');
    return response.data;
  }
};

export default faceService;
