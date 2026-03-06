const User = require('../models/User');
const { hashPassword, comparePassword } = require('../utils/password');
const { NotFoundError, BadRequestError, ConflictError } = require('../utils/errors');

/**
 * 사용자 서비스
 */
class UserService {
  /**
   * 프로필 조회
   * @param {number} userId - 사용자 ID
   * @returns {Promise<Object>} 사용자 프로필
   */
  async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('사용자를 찾을 수 없습니다.');
    }

    return {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at
    };
  }

  /**
   * 프로필 수정
   * @param {number} userId - 사용자 ID
   * @param {Object} updateData - 수정할 데이터
   * @returns {Promise<Object>} 수정된 프로필
   */
  async updateProfile(userId, updateData) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('사용자를 찾을 수 없습니다.');
    }

    // 이메일 중복 확인
    if (updateData.email && updateData.email !== user.email) {
      const existingEmail = await User.findByEmail(updateData.email);
      if (existingEmail) {
        throw new ConflictError('이미 사용 중인 이메일입니다.');
      }
    }

    // 비밀번호 변경
    if (updateData.new_password) {
      if (!updateData.current_password) {
        throw new BadRequestError('현재 비밀번호를 입력해주세요.');
      }

      const isPasswordValid = await comparePassword(updateData.current_password, user.password_hash);
      if (!isPasswordValid) {
        throw new BadRequestError('현재 비밀번호가 올바르지 않습니다.');
      }

      updateData.password_hash = await hashPassword(updateData.new_password);
      delete updateData.new_password;
      delete updateData.current_password;
    }

    // 업데이트
    await User.update(userId, updateData);

    return this.getProfile(userId);
  }

  /**
   * 회원 탈퇴
   * @param {number} userId - 사용자 ID
   * @param {string} password - 비밀번호 확인
   * @returns {Promise<boolean>} 탈퇴 성공 여부
   */
  async deleteAccount(userId, password) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('사용자를 찾을 수 없습니다.');
    }

    // 비밀번호 확인
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      throw new BadRequestError('비밀번호가 올바르지 않습니다.');
    }

    // 계정 비활성화
    return User.deactivate(userId);
  }

  /**
   * 사용자 목록 조회 (관리자용)
   * @param {Object} options - 조회 옵션
   * @returns {Promise<Object>} 사용자 목록
   */
  async getUserList(options) {
    const { users, total } = await User.findAll(options);
    
    return {
      users: users.map(user => ({
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        is_active: user.is_active,
        created_at: user.created_at
      })),
      total
    };
  }
}

module.exports = new UserService();