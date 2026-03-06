/**
 * API 응답 포맷 유틸리티
 */

/**
 * 성공 응답
 * @param {Object} res - Express response 객체
 * @param {*} data - 응답 데이터
 * @param {string} message - 응답 메시지
 * @param {number} statusCode - HTTP 상태 코드
 */
const successResponse = (res, data = null, message = '요청이 성공했습니다.', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    code: statusCode,
    message,
    data
  });
};

/**
 * 페이지네이션 응답
 * @param {Object} res - Express response 객체
 * @param {Array} data - 데이터 배열
 * @param {number} page - 현재 페이지
 * @param {number} limit - 페이지당 항목 수
 * @param {number} total - 전체 항목 수
 * @param {string} message - 응답 메시지
 */
const paginatedResponse = (res, data, page, limit, total, message = '요청이 성공했습니다.') => {
  const totalPages = Math.ceil(total / limit);
  return res.status(200).json({
    success: true,
    code: 200,
    message,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages
    }
  });
};

/**
 * 에러 응답
 * @param {Object} res - Express response 객체
 * @param {string} message - 에러 메시지
 * @param {number} statusCode - HTTP 상태 코드
 * @param {Array} errors - 상세 에러 목록
 */
const errorResponse = (res, message = '요청 처리 중 오류가 발생했습니다.', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    code: statusCode,
    message
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * 생성 성공 응답 (201)
 * @param {Object} res - Express response 객체
 * @param {*} data - 생성된 데이터
 * @param {string} message - 응답 메시지
 */
const createdResponse = (res, data, message = '생성되었습니다.') => {
  return successResponse(res, data, message, 201);
};

/**
 * 삭제 성공 응답 (204)
 * @param {Object} res - Express response 객체
 */
const noContentResponse = (res) => {
  return res.status(204).send();
};

module.exports = {
  successResponse,
  paginatedResponse,
  errorResponse,
  createdResponse,
  noContentResponse
};