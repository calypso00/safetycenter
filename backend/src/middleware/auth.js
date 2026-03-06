const { verifyToken } = require('../utils/jwt');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');
const db = require('../config/database');

/**
 * JWT 토큰 인증 미들웨어
 */
const authenticate = async (req, res, next) => {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('로그인이 필요합니다.');
    }

    const token = authHeader.split(' ')[1];
    
    // 토큰 검증
    const decoded = verifyToken(token);
    
    // 사용자 정보 조회
    const users = await db.query(
      'SELECT id, username, name, email, phone, role, is_active FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      throw new UnauthorizedError('존재하지 않는 사용자입니다.');
    }

    const user = users[0];

    if (!user.is_active) {
      throw new ForbiddenError('비활성화된 계정입니다.');
    }

    // 요청 객체에 사용자 정보 저장
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * 관리자 권한 확인 미들웨어
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return next(new UnauthorizedError('인증이 필요합니다.'));
  }

  if (req.user.role !== 'admin') {
    return next(new ForbiddenError('관리자 권한이 필요합니다.'));
  }

  next();
};

/**
 * 선택적 인증 미들웨어 (토큰이 있으면 검증, 없어도 통과)
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    const users = await db.query(
      'SELECT id, username, name, email, phone, role, is_active FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length > 0 && users[0].is_active) {
      req.user = users[0];
    }
    
    next();
  } catch (error) {
    // 토큰이 유효하지 않아도 계속 진행
    next();
  }
};

/**
 * 본인 또는 관리자 권한 확인
 */
const requireOwnerOrAdmin = (req, res, next) => {
  const targetUserId = parseInt(req.params.userId || req.params.id, 10);
  
  if (!req.user) {
    return next(new UnauthorizedError('인증이 필요합니다.'));
  }

  if (req.user.role === 'admin' || req.user.id === targetUserId) {
    return next();
  }

  return next(new ForbiddenError('접근 권한이 없습니다.'));
};

module.exports = {
  authenticate,
  requireAdmin,
  optionalAuth,
  requireOwnerOrAdmin
};