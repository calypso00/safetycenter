const authService = require('../services/authService');
const { successResponse, createdResponse } = require('../utils/response');
const { validationResult } = require('express-validator');

/**
 * 인증 컨트롤러
 */
class AuthController {
  /**
   * 회원가입
   * POST /api/auth/register
   */
  async register(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }

      const result = await authService.register(req.body);
      
      return createdResponse(res, result, '회원가입이 완료되었습니다.');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 로그인
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }

      const { username, password } = req.body;
      const result = await authService.login(username, password);
      
      return successResponse(res, result, '로그인 성공');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 로그아웃
   * POST /api/auth/logout
   */
  async logout(req, res, next) {
    try {
      // JWT는 클라이언트에서 삭제 처리
      return successResponse(res, null, '로그아웃 되었습니다.');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 현재 사용자 정보
   * GET /api/auth/me
   */
  async getCurrentUser(req, res, next) {
    try {
      const user = await authService.getCurrentUser(req.user.id);
      return successResponse(res, user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 토큰 갱신
   * POST /api/auth/refresh
   */
  async refreshToken(req, res, next) {
    try {
      const { userId, username } = req.user;
      const result = await authService.refreshToken(userId, username);
      
      return successResponse(res, result, '토큰이 갱신되었습니다.');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();