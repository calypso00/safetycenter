const User = require('../models/User');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken, generateRefreshToken } = require('../utils/jwt');
const { ConflictError, UnauthorizedError, BadRequestError } = require('../utils/errors');

/**
 * 인증 서비스
 */
class AuthService {
  /**
   * 회원가입
   * @param {Object} userData - 사용자 데이터
   * @returns {Promise<Object>} 생성된 사용자 정보와 토큰
   */
  async register(userData) {
    const { username, password, name, phone, email } = userData;

    // 필수 필드 검증
    if (!username || !password || !name) {
      throw new BadRequestError('필수 항목을 모두 입력해주세요.');
    }

    // 사용자명 중복 확인
    const existingUsername = await User.findByUsername(username);
    if (existingUsername) {
      throw new ConflictError('이미 사용 중인 아이디입니다.');
    }

    // 이메일 중복 확인
    if (email) {
      const existingEmail = await User.findByEmail(email);
      if (existingEmail) {
        throw new ConflictError('이미 사용 중인 이메일입니다.');
      }
    }

    // 비밀번호 암호화
    const passwordHash = await hashPassword(password);

    // 사용자 생성
    const userId = await User.create({
      username,
      password_hash: passwordHash,
      name,
      phone,
      email
    });

    // 토큰 생성
    const token = generateToken({ userId, username });
    const refreshToken = generateRefreshToken({ userId, username });

    return {
      user: {
        id: userId,
        username,
        name,
        email,
        phone
      },
      accessToken: token,
      refreshToken
    };
  }

  /**
   * 로그인
   * @param {string} username - 사용자명
   * @param {string} password - 비밀번호
   * @returns {Promise<Object>} 사용자 정보와 토큰
   */
  async login(username, password) {
    // 사용자 조회
    const user = await User.findByUsername(username);
    if (!user) {
      throw new UnauthorizedError('아이디 또는 비밀번호가 올바르지 않습니다.');
    }

    // 비밀번호 확인
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('아이디 또는 비밀번호가 올바르지 않습니다.');
    }

    // 활성 상태 확인
    if (!user.is_active) {
      throw new UnauthorizedError('비활성화된 계정입니다.');
    }

    // 토큰 생성
    const token = generateToken({ userId: user.id, username: user.username });
    const refreshToken = generateRefreshToken({ userId: user.id, username: user.username });

    return {
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
      accessToken: token,
      refreshToken
    };
  }

  /**
   * 현재 사용자 정보 조회
   * @param {number} userId - 사용자 ID
   * @returns {Promise<Object>} 사용자 정보
   */
  async getCurrentUser(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new UnauthorizedError('사용자를 찾을 수 없습니다.');
    }

    return {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      created_at: user.created_at
    };
  }

  /**
   * 토큰 갱신
   * @param {number} userId - 사용자 ID
   * @param {string} username - 사용자명
   * @returns {Promise<Object>} 새 토큰
   */
  async refreshToken(userId, username) {
    const user = await User.findById(userId);
    if (!user || !user.is_active) {
      throw new UnauthorizedError('유효하지 않은 사용자입니다.');
    }

    const token = generateToken({ userId, username });
    const refreshToken = generateRefreshToken({ userId, username });

    return { accessToken: token, refreshToken };
  }
}

module.exports = new AuthService();