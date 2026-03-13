const adminService = require('../services/adminService');
const { successResponse, paginatedResponse } = require('../utils/response');
const { BadRequestError, ConflictError, NotFoundError } = require('../utils/errors');
const db = require('../config/database');
const { hashPassword } = require('../utils/password');

/**
 * 관리자 컨트롤러
 */
class AdminController {
  /**
   * 대시보드 데이터
   * GET /api/admin/dashboard
   */
  async getDashboard(req, res, next) {
    try {
      const dashboard = await adminService.getDashboard();
      return successResponse(res, dashboard);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 전체 통계
   * GET /api/admin/stats
   */
  async getStats(req, res, next) {
    try {
      const { start_date, end_date } = req.query;
      
      // 기본값: 최근 30일
      const endDate = end_date || new Date().toISOString().split('T')[0];
      const startDate = start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const stats = await adminService.getStats(startDate, endDate);
      return successResponse(res, stats);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 사용자 목록
   * GET /api/admin/users
   */
  async getUserList(req, res, next) {
    try {
      const { page, limit, search, role, is_active } = req.query;
      const result = await adminService.getUserList({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        search,
        role,
        isActive: is_active === 'true' ? true : is_active === 'false' ? false : null
      });
      
      return paginatedResponse(
        res,
        result.users,
        result.page,
        result.limit,
        result.total
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * 사용자 상세
   * GET /api/admin/users/:id
   */
  async getUserDetail(req, res, next) {
    try {
      const user = await adminService.getUserDetail(req.params.id);
      return successResponse(res, user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 전체 예약 목록
   * GET /api/admin/reservations
   */
  async getReservationList(req, res, next) {
    try {
      const { page, limit, status, date, program_id } = req.query;
      const result = await adminService.getReservationList({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        status,
        date,
        programId: program_id
      });
      
      return paginatedResponse(
        res,
        result.reservations,
        result.page,
        result.limit,
        result.total
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * 예약 정보 수정
   * PUT /api/admin/reservations/:id
   */
  async updateReservation(req, res, next) {
    try {
      const reservationId = parseInt(req.params.id);
      const { status, reservation_date, time_slot, participant_count } = req.body;

      // 예약 존재 확인
      const existingReservation = await adminService.getReservationById(reservationId);
      if (!existingReservation) {
        throw new NotFoundError('예약을 찾을 수 없습니다.');
      }

      // 수정할 데이터 구성
      const updateData = {};
      
      if (status !== undefined) {
        // 유효한 상태 값인지 확인
        const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
        if (!validStatuses.includes(status)) {
          throw new BadRequestError('유효하지 않은 상태 값입니다.');
        }
        updateData.status = status;
      }
      
      if (reservation_date !== undefined) {
        updateData.reservation_date = reservation_date;
      }
      
      if (time_slot !== undefined) {
        updateData.time_slot = time_slot;
      }
      
      if (participant_count !== undefined) {
        const count = parseInt(participant_count);
        if (isNaN(count) || count < 1 || count > 100) {
          throw new BadRequestError('인원은 1명 이상 100명 이하로 입력해주세요.');
        }
        updateData.participant_count = count;
      }

      if (Object.keys(updateData).length === 0) {
        throw new BadRequestError('수정할 항목이 없습니다.');
      }

      await adminService.updateReservation(reservationId, updateData);

      return successResponse(res, {
        message: '예약 정보가 수정되었습니다.'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 전체 체험 기록 목록
   * GET /api/admin/experiences
   */
  async getExperienceList(req, res, next) {
    try {
      const { page, limit, date, program_id, user_id } = req.query;
      const result = await adminService.getExperienceList({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        date,
        programId: program_id,
        userId: user_id
      });
      
      return paginatedResponse(
        res,
        result.logs,
        result.page,
        result.limit,
        result.total
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * 일별 통계
   * GET /api/admin/stats/daily
   */
  async getDailyStats(req, res, next) {
    try {
      const { start_date, end_date } = req.query;
      
      const endDate = end_date || new Date().toISOString().split('T')[0];
      const startDate = start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const stats = await adminService.getDailyStats(startDate, endDate);
      return successResponse(res, stats);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 프로그램별 통계
   * GET /api/admin/stats/programs
   */
  async getProgramStats(req, res, next) {
    try {
      const { start_date, end_date } = req.query;
      
      const endDate = end_date || new Date().toISOString().split('T')[0];
      const startDate = start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const stats = await adminService.getProgramStats(startDate, endDate);
      return successResponse(res, stats);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 단일 사용자 생성
   * POST /api/admin/users
   */
  async createUser(req, res, next) {
    try {
      const { username, password, name, phone, email, role = 'user' } = req.body;

      // 필수 필드 검증
      if (!username || !password || !name || !email) {
        throw new BadRequestError('아이디, 비밀번호, 이름, 이메일은 필수 입력 항목입니다.');
      }

      // 사용자명 중복 확인
      const existingUser = await db.query(
        'SELECT id FROM users WHERE username = ?',
        [username]
      );
      if (existingUser.length > 0) {
        throw new ConflictError('이미 사용 중인 아이디입니다.');
      }

      // 이메일 중복 확인
      const existingEmail = await db.query(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );
      if (existingEmail.length > 0) {
        throw new ConflictError('이미 사용 중인 이메일입니다.');
      }

      // 비밀번호 해시화
      const passwordHash = await hashPassword(password);

      // 사용자 생성
      const result = await db.query(
        `INSERT INTO users (username, password_hash, name, phone, email, role)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [username, passwordHash, name, phone || null, email, role]
      );

      return successResponse(res, {
        id: result.insertId,
        username,
        name,
        email,
        role,
        message: '사용자가 성공적으로 등록되었습니다.'
      }, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 단체 사용자 생성 (CSV 또는 일괄 입력)
   * POST /api/admin/users/bulk
   */
  async createBulkUsers(req, res, next) {
    try {
      const { users } = req.body;

      if (!users || !Array.isArray(users) || users.length === 0) {
        throw new BadRequestError('등록할 사용자 목록이 필요합니다.');
      }

      // 최대 100명까지 가능
      if (users.length > 100) {
        throw new BadRequestError('한 번에 최대 100명까지 등록 가능합니다.');
      }

      const results = {
        success: [],
        failed: []
      };

      for (const userData of users) {
        const { username, password, name, phone, email, role = 'user' } = userData;

        // 필수 필드 검증
        if (!username || !password || !name || !email) {
          results.failed.push({
            username: username || '(없음)',
            reason: '필수 입력 항목 누락'
          });
          continue;
        }

        try {
          // 사용자명 중복 확인
          const existingUser = await db.query(
            'SELECT id FROM users WHERE username = ?',
            [username]
          );
          if (existingUser.length > 0) {
            results.failed.push({
              username,
              reason: '이미 사용 중인 아이디'
            });
            continue;
          }

          // 이메일 중복 확인
          const existingEmail = await db.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
          );
          if (existingEmail.length > 0) {
            results.failed.push({
              username,
              reason: '이미 사용 중인 이메일'
            });
            continue;
          }

          // 비밀번호 해시화
          const passwordHash = await hashPassword(password);

          // 사용자 생성
          const result = await db.query(
            `INSERT INTO users (username, password_hash, name, phone, email, role)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [username, passwordHash, name, phone || null, email, role]
          );

          results.success.push({
            id: result.insertId,
            username,
            name,
            email
          });
        } catch (error) {
          results.failed.push({
            username,
            reason: error.message
          });
        }
      }

      return successResponse(res, {
        total: users.length,
        success_count: results.success.length,
        failed_count: results.failed.length,
        results
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 사용자 정보 수정
   * PUT /api/admin/users/:id
   */
  async updateUser(req, res, next) {
    try {
      const userId = parseInt(req.params.id);
      const { name, phone, email, role, is_active } = req.body;

      // 사용자 존재 확인
      const existingUser = await db.query(
        'SELECT id, username FROM users WHERE id = ?',
        [userId]
      );
      if (existingUser.length === 0) {
        throw new NotFoundError('사용자를 찾을 수 없습니다.');
      }

      // 이메일 중복 확인 (본인 제외)
      if (email) {
        const existingEmail = await db.query(
          'SELECT id FROM users WHERE email = ? AND id != ?',
          [email, userId]
        );
        if (existingEmail.length > 0) {
          throw new ConflictError('이미 사용 중인 이메일입니다.');
        }
      }

      // 수정할 데이터 구성
      const updateFields = [];
      const updateValues = [];

      if (name !== undefined) {
        updateFields.push('name = ?');
        updateValues.push(name);
      }
      if (phone !== undefined) {
        updateFields.push('phone = ?');
        updateValues.push(phone || null);
      }
      if (email !== undefined) {
        updateFields.push('email = ?');
        updateValues.push(email);
      }
      if (role !== undefined) {
        updateFields.push('role = ?');
        updateValues.push(role);
      }
      if (is_active !== undefined) {
        updateFields.push('is_active = ?');
        updateValues.push(is_active);
      }

      if (updateFields.length === 0) {
        throw new BadRequestError('수정할 항목이 없습니다.');
      }

      updateValues.push(userId);

      await db.query(
        `UPDATE users SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`,
        updateValues
      );

      return successResponse(res, {
        message: '사용자 정보가 수정되었습니다.'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 사용자 삭제 (비활성화)
   * DELETE /api/admin/users/:id
   */
  async deleteUser(req, res, next) {
    try {
      const userId = parseInt(req.params.id);

      // 사용자 존재 확인
      const existingUser = await db.query(
        'SELECT id FROM users WHERE id = ?',
        [userId]
      );
      if (existingUser.length === 0) {
        throw new NotFoundError('사용자를 찾을 수 없습니다.');
      }

      // 사용자 비활성화 (실제 삭제 대신)
      await db.query(
        'UPDATE users SET is_active = FALSE, updated_at = NOW() WHERE id = ?',
        [userId]
      );

      return successResponse(res, {
        message: '사용자가 비활성화되었습니다.'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();