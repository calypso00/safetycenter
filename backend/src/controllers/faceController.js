const faceService = require('../services/faceService');
const { successResponse, createdResponse } = require('../utils/response');

/**
 * 안면인식 컨트롤러
 */
class FaceController {
  /**
   * 안면 데이터 등록
   * POST /api/face/register
   */
  async registerFace(req, res, next) {
    try {
      // 사용자 본인 또는 관리자만 등록 가능
      const userId = req.body.user_id || req.user.id;
      const { image, face_encoding, image_path } = req.body;
      
      // 이미지 또는 face_encoding 중 하나 필요
      if (!image && !face_encoding) {
        return res.status(400).json({
          success: false,
          message: '이미지 또는 안면 인코딩 데이터가 필요합니다.'
        });
      }
      
      const result = await faceService.registerFace(userId, {
        image,
        face_encoding,
        image_path
      });
      return createdResponse(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 안면 인증
   * POST /api/face/verify
   */
  async verifyFace(req, res, next) {
    try {
      const { image, face_encoding } = req.body;
      
      // 이미지 또는 face_encoding 중 하나 필요
      if (!image && !face_encoding) {
        return res.status(400).json({
          success: false,
          message: '이미지 또는 안면 인코딩 데이터가 필요합니다.'
        });
      }
      
      // 이미지가 제공된 경우 Flask 서버 이용
      if (image) {
        const result = await faceService.verifyFace(image);
        return successResponse(res, result);
      }
      
      // face_encoding이 제공된 경우 로컬 매칭
      const result = await faceService.verifyFaceByEncoding(face_encoding);
      return successResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 안면 데이터 등록 상태 확인
   * GET /api/face/status/:userId
   */
  async getFaceStatus(req, res, next) {
    try {
      const userId = req.params.userId || req.user.id;
      const status = await faceService.getFaceStatus(userId);
      return successResponse(res, status);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 안면 데이터 삭제
   * DELETE /api/face/:userId
   */
  async deleteFace(req, res, next) {
    try {
      const userId = req.params.userId || req.user.id;
      const result = await faceService.deleteFace(userId);
      return successResponse(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 안면인식 모듈 상태 확인
   * GET /api/face/module-status
   */
  async getModuleStatus(req, res, next) {
    try {
      const status = await faceService.getModuleStatus();
      return successResponse(res, status);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 얼굴 감지
   * POST /api/face/detect
   */
  async detectFaces(req, res, next) {
    try {
      const { image } = req.body;
      
      if (!image) {
        return res.status(400).json({
          success: false,
          message: '이미지 데이터가 필요합니다.'
        });
      }
      
      const result = await faceService.detectFaces(image);
      return successResponse(res, result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FaceController();
