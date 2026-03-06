const { errorResponse } = require('../utils/response');
const { AppError, ValidationError } = require('../utils/errors');
const config = require('../config');

/**
 * 404 Not Found 핸들러
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`요청한 경로를 찾을 수 없습니다: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * 전역 에러 핸들러
 */
const errorHandler = (err, req, res, next) => {
  // 기본 상태 코드와 메시지
  let statusCode = err.statusCode || 500;
  let message = err.message || '서버 내부 오류가 발생했습니다.';
  let errors = null;

  // 운영 환경이 아닐 때 스택 트레이스 출력
  const stack = config.server.env === 'development' ? err.stack : undefined;

  // 커스텀 에러 타입별 처리
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    
    if (err instanceof ValidationError) {
      errors = err.errors;
    }
  }

  // MySQL 중복 키 에러
  if (err.code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    message = '이미 존재하는 데이터입니다.';
    
    // 중복된 필드 추출
    if (err.sqlMessage) {
      const match = err.sqlMessage.match(/for key '(.+?)'/);
      if (match) {
        message = `이미 사용 중인 ${match[1]}입니다.`;
      }
    }
  }

  // MySQL 외래 키 제약 조건 에러
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    statusCode = 400;
    message = '참조하는 데이터가 존재하지 않습니다.';
  }

  // JWT 에러
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = '유효하지 않은 토큰입니다.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = '토큰이 만료되었습니다.';
  }

  // 유효성 검사 에러 (express-validator)
  if (err.array && typeof err.array === 'function') {
    statusCode = 422;
    errors = err.array().map(e => ({
      field: e.path || e.param,
      message: e.msg
    }));
    message = '입력값 검증에 실패했습니다.';
  }

  // 에러 로그 출력
  console.error(`[${new Date().toISOString()}] Error:`, {
    statusCode,
    message,
    path: req.originalUrl,
    method: req.method,
    stack
  });

  // 응답 전송
  return errorResponse(res, message, statusCode, errors);
};

module.exports = {
  notFoundHandler,
  errorHandler
};