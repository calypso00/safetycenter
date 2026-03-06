const FaceData = require('../models/FaceData');
const User = require('../models/User');
const { NotFoundError, BadRequestError, ConflictError, ExternalServiceError } = require('../utils/errors');
const config = require('../config');
const axios = require('axios');

/**
 * 안면인식 서비스
 * Flask 안면인식 서버와 통신하여 안면인식 기능 제공
 */
class FaceService {
  constructor() {
    // Flask 서버 URL
    this.flaskServerUrl = config.faceRecognition.url;
    
    // Axios 인스턴스 생성
    this.httpClient = axios.create({
      baseURL: this.flaskServerUrl,
      timeout: 30000, // 30초 타임아웃
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Flask 서버 상태 확인
   * @returns {Promise<Object>} 서버 상태
   */
  async checkFlaskServerHealth() {
    try {
      const response = await this.httpClient.get('/health');
      return {
        status: 'online',
        ...response.data
      };
    } catch (error) {
      return {
        status: 'offline',
        message: '안면인식 서버에 연결할 수 없습니다.'
      };
    }
  }

  /**
   * 안면 데이터 등록
   * @param {number} userId - 사용자 ID
   * @param {Object} faceData - 안면 데이터
   * @returns {Promise<Object>} 등록 결과
   */
  async registerFace(userId, faceData) {
    const { image, image_path = null } = faceData;

    // 사용자 확인
    const user = await User.findById(userId);
    if (!user || !user.is_active) {
      throw new NotFoundError('사용자를 찾을 수 없습니다.');
    }

    if (!image) {
      throw new BadRequestError('이미지 데이터가 필요합니다.');
    }

    try {
      // Flask 서버로 얼굴 등록 요청
      const response = await this.httpClient.post('/register', {
        user_id: userId,
        image: image
      });

      if (!response.data.success) {
        throw new BadRequestError(response.data.message || '얼굴 등록에 실패했습니다.');
      }

      // 데이터베이스에 얼굴 인코딩 저장
      const faceEncoding = response.data.face_encoding;
      
      // 이미 등록된 안면 데이터가 있는지 확인
      const existingFace = await FaceData.findByUserId(userId);
      
      if (existingFace) {
        // 기존 데이터 업데이트
        await FaceData.updateByUserId(userId, { 
          face_encoding: faceEncoding, 
          image_path 
        });
      } else {
        // 새 안면 데이터 등록
        await FaceData.create({
          user_id: userId,
          face_encoding: faceEncoding,
          image_path
        });
      }

      return {
        message: existingFace ? '안면 데이터가 업데이트되었습니다.' : '안면 데이터가 등록되었습니다.',
        user_id: userId
      };
    } catch (error) {
      if (error instanceof BadRequestError || error instanceof NotFoundError) {
        throw error;
      }
      
      // Flask 서버 통신 오류
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        throw new ExternalServiceError('안면인식 서버에 연결할 수 없습니다.');
      }
      
      throw new ExternalServiceError(error.response?.data?.message || '안면인식 서버 오류가 발생했습니다.');
    }
  }

  /**
   * 안면 인증 (Flask 서버 이용)
   * @param {string} image - Base64 인코딩된 이미지
   * @returns {Promise<Object>} 인증 결과
   */
  async verifyFace(image) {
    if (!image) {
      throw new BadRequestError('이미지 데이터가 필요합니다.');
    }

    try {
      // Flask 서버로 얼굴 인증 요청
      const response = await this.httpClient.post('/verify', {
        image: image
      });

      if (!response.data.success) {
        throw new NotFoundError(response.data.message || '일치하는 사용자를 찾을 수 없습니다.');
      }

      const { user_id, confidence } = response.data;

      // 사용자 정보 조회
      const user = await User.findById(user_id);
      if (!user || !user.is_active) {
        throw new NotFoundError('사용자를 찾을 수 없습니다.');
      }

      return {
        success: true,
        message: '안면 인증 성공',
        user: {
          user_id: user.id,
          user_name: user.name,
          username: user.username,
          confidence: confidence
        }
      };
    } catch (error) {
      if (error instanceof BadRequestError || error instanceof NotFoundError) {
        throw error;
      }
      
      // Flask 서버 통신 오류
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        throw new ExternalServiceError('안면인식 서버에 연결할 수 없습니다.');
      }
      
      throw new ExternalServiceError(error.response?.data?.message || '안면인식 서버 오류가 발생했습니다.');
    }
  }

  /**
   * 안면 데이터 등록 상태 확인
   * @param {number} userId - 사용자 ID
   * @returns {Promise<Object>} 등록 상태
   */
  async getFaceStatus(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('사용자를 찾을 수 없습니다.');
    }

    const faceData = await FaceData.findByUserId(userId);
    
    return {
      user_id: userId,
      is_registered: !!faceData,
      registered_at: faceData ? faceData.registered_at : null
    };
  }

  /**
   * 안면 데이터 삭제
   * @param {number} userId - 사용자 ID
   * @returns {Promise<Object>} 삭제 결과
   */
  async deleteFace(userId) {
    const faceData = await FaceData.findByUserId(userId);
    if (!faceData) {
      throw new NotFoundError('등록된 안면 데이터가 없습니다.');
    }

    try {
      // Flask 서버에서 얼굴 데이터 삭제
      await this.httpClient.delete(`/delete/${userId}`);
    } catch (error) {
      // Flask 서버 오류는 로그만 남기고 DB 삭제는 진행
      console.warn('Flask server delete failed:', error.message);
    }

    // 데이터베이스에서 삭제
    await FaceData.deactivateByUserId(userId);

    return {
      message: '안면 데이터가 삭제되었습니다.',
      user_id: userId
    };
  }

  /**
   * 안면 인코딩 간 거리 계산 (로컬 계산용)
   * @param {Array} encoding1 - 첫 번째 인코딩
   * @param {Array} encoding2 - 두 번째 인코딩
   * @returns {number} 유클리드 거리
   */
  calculateDistance(encoding1, encoding2) {
    if (!Array.isArray(encoding1) || !Array.isArray(encoding2)) {
      return 1;
    }

    if (encoding1.length !== encoding2.length) {
      return 1;
    }

    let sum = 0;
    for (let i = 0; i < encoding1.length; i++) {
      const diff = encoding1[i] - encoding2[i];
      sum += diff * diff;
    }

    return Math.sqrt(sum);
  }

  /**
   * 안면인식 모듈 상태 확인
   * @returns {Promise<Object>} 모듈 상태
   */
  async getModuleStatus() {
    const healthStatus = await this.checkFlaskServerHealth();
    
    return {
      status: healthStatus.status,
      url: this.flaskServerUrl,
      message: healthStatus.status === 'online' 
        ? '안면인식 모듈이 정상 작동 중입니다.' 
        : '안면인식 모듈에 연결할 수 없습니다.',
      details: healthStatus
    };
  }

  /**
   * 이미지에서 얼굴 감지
   * @param {string} image - Base64 인코딩된 이미지
   * @returns {Promise<Object>} 감지 결과
   */
  async detectFaces(image) {
    if (!image) {
      throw new BadRequestError('이미지 데이터가 필요합니다.');
    }

    try {
      const response = await this.httpClient.post('/detect', {
        image: image
      });

      return {
        success: true,
        faces_detected: response.data.faces_detected,
        locations: response.data.locations
      };
    } catch (error) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        throw new ExternalServiceError('안면인식 서버에 연결할 수 없습니다.');
      }
      
      throw new ExternalServiceError(error.response?.data?.message || '얼굴 감지 중 오류가 발생했습니다.');
    }
  }
}

module.exports = new FaceService();
