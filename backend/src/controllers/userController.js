const userService = require('../services/userService');
const { successResponse, noContentResponse } = require('../utils/response');

/**
 * 사용자 컨트롤러
 */
class UserController {
  /**
   * 프로필 조회
   * GET /api/users/profile
   */
  async getProfile(req, res, next) {
    try {
      const profile = await userService.getProfile(req.user.id);
      return successResponse(res, profile);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 프로필 수정
   * PUT /api/users/profile
   */
  async updateProfile(req, res, next) {
    try {
      const profile = await userService.updateProfile(req.user.id, req.body);
      return successResponse(res, profile, '프로필이 수정되었습니다.');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 회원 탈퇴
   * DELETE /api/users/account
   */
  async deleteAccount(req, res, next) {
    try {
      const { password } = req.body;
      await userService.deleteAccount(req.user.id, password);
      return successResponse(res, null, '회원 탈퇴가 완료되었습니다.');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();