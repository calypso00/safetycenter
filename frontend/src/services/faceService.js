import api from './api';

/**
 * 안면인식 서비스
 * 
 * 참고: api.js의 응답 인터셉터에서 이미 response.data를 반환하므로
 * 여기서는 추가로 .data를 접근하지 않습니다.
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
    // api.post는 이미 response.data를 반환함
    return await api.post('/face/register', data);
  },

  /**
   * 얼굴 인증
   * @param {string} image - Base64 인코딩된 이미지
   * @returns {Promise} 인증 결과
   */
  async verifyFace(image) {
    return await api.post('/face/verify', { image });
  },

  /**
   * 얼굴 감지
   * @param {string} image - Base64 인코딩된 이미지
   * @returns {Promise} 감지 결과
   */
  async detectFaces(image) {
    return await api.post('/face/detect', { image });
  },

  /**
   * 얼굴 등록 상태 확인
   * @param {number} userId - 사용자 ID (선택사항)
   * @returns {Promise} 등록 상태
   */
  async getFaceStatus(userId) {
    const url = userId ? `/face/status/${userId}` : '/face/status';
    return await api.get(url);
  },

  /**
   * 얼굴 데이터 삭제
   * @param {number} userId - 사용자 ID (선택사항)
   * @returns {Promise} 삭제 결과
   */
  async deleteFace(userId) {
    const url = userId ? `/face/${userId}` : '/face';
    return await api.delete(url);
  },

  /**
   * 안면인식 모듈 상태 확인
   * @returns {Promise} 모듈 상태
   */
  async getModuleStatus() {
    return await api.get('/face/module-status');
  }
};

export default faceService;
