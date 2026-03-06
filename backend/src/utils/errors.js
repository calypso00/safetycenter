/**
 * 커스텀 에러 클래스
 */

/**
 * 기본 애플리케이션 에러
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 잘못된 요청 에러 (400)
 */
class BadRequestError extends AppError {
  constructor(message = '잘못된 요청입니다.') {
    super(message, 400);
  }
}

/**
 * 인증 에러 (401)
 */
class UnauthorizedError extends AppError {
  constructor(message = '인증이 필요합니다.') {
    super(message, 401);
  }
}

/**
 * 권한 없음 에러 (403)
 */
class ForbiddenError extends AppError {
  constructor(message = '접근 권한이 없습니다.') {
    super(message, 403);
  }
}

/**
 * 리소스 없음 에러 (404)
 */
class NotFoundError extends AppError {
  constructor(message = '요청한 리소스를 찾을 수 없습니다.') {
    super(message, 404);
  }
}

/**
 * 중복 리소스 에러 (409)
 */
class ConflictError extends AppError {
  constructor(message = '이미 존재하는 리소스입니다.') {
    super(message, 409);
  }
}

/**
 * 유효성 검사 에러 (422)
 */
class ValidationError extends AppError {
  constructor(message = '유효성 검사에 실패했습니다.', errors = null) {
    super(message, 422);
    this.errors = errors;
  }
}

/**
 * 외부 서비스 에러 (502)
 */
class ExternalServiceError extends AppError {
  constructor(message = '외부 서비스 오류가 발생했습니다.') {
    super(message, 502);
  }
}

module.exports = {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  ExternalServiceError
};