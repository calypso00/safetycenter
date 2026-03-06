const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * JWT 토큰 생성
 * @param {Object} payload - 토큰에 담을 데이터
 * @returns {string} 생성된 토큰
 */
const generateToken = (payload) => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  });
};

/**
 * 리프레시 토큰 생성
 * @param {Object} payload - 토큰에 담을 데이터
 * @returns {string} 생성된 리프레시 토큰
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.refreshExpiresIn
  });
};

/**
 * 토큰 검증
 * @param {string} token - 검증할 토큰
 * @returns {Object} 디코딩된 페이로드
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('토큰이 만료되었습니다.');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('유효하지 않은 토큰입니다.');
    }
    throw error;
  }
};

/**
 * 토큰 디코딩 (검증 없이)
 * @param {string} token - 디코딩할 토큰
 * @returns {Object} 디코딩된 페이로드
 */
const decodeToken = (token) => {
  return jwt.decode(token);
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  decodeToken
};