const Program = require('../models/Program');
const { NotFoundError, BadRequestError } = require('../utils/errors');

/**
 * 프로그램 서비스
 */
class ProgramService {
  /**
   * 프로그램 목록 조회
   * @param {Object} options - 조회 옵션
   * @returns {Promise<Object>} 프로그램 목록
   */
  async getPrograms(options = {}) {
    const { page = 1, limit = 10, isActive = true } = options;
    
    const { programs, total } = await Program.findAll({ page, limit, isActive });
    
    return {
      programs: programs.map(program => ({
        id: program.id,
        name: program.name,
        description: program.description,
        duration_minutes: program.duration_minutes,
        capacity: program.capacity,
        location: program.location,
        is_active: program.status === 'active',
        status: program.status,
        created_at: program.created_at
      })),
      total,
      page,
      limit
    };
  }

  /**
   * 프로그램 상세 조회
   * @param {number} programId - 프로그램 ID
   * @returns {Promise<Object>} 프로그램 상세 정보
   */
  async getProgramById(programId) {
    const program = await Program.findById(programId);
    if (!program) {
      throw new NotFoundError('프로그램을 찾을 수 없습니다.');
    }

    return {
      id: program.id,
      name: program.name,
      description: program.description,
      duration_minutes: program.duration_minutes,
      capacity: program.capacity,
      location: program.location,
      is_active: program.status === 'active',
      status: program.status,
      created_at: program.created_at
    };
  }

  /**
   * 예약 가능 시간 조회
   * @param {number} programId - 프로그램 ID
   * @param {string} date - 날짜 (YYYY-MM-DD)
   * @returns {Promise<Object>} 예약 가능 시간 정보
   */
  async getAvailableSlots(programId, date) {
    const program = await Program.findById(programId);
    if (!program) {
      throw new NotFoundError('프로그램을 찾을 수 없습니다.');
    }

    // 기본 시간 슬롯 (9시 ~ 18시, 1시간 단위)
    const timeSlots = [];
    for (let hour = 9; hour < 18; hour++) {
      const time = `${hour.toString().padStart(2, '0')}:00`;
      const reservedCount = await Program.getReservedCount(programId, date, time);
      const availableCount = program.capacity - reservedCount;
      
      timeSlots.push({
        time,
        reserved_count: reservedCount,
        available_count: Math.max(0, availableCount),
        is_available: availableCount > 0
      });
    }

    return {
      program_id: programId,
      program_name: program.name,
      capacity: program.capacity,
      date,
      time_slots: timeSlots
    };
  }

  /**
   * 프로그램 생성 (관리자용)
   * @param {Object} programData - 프로그램 데이터
   * @returns {Promise<Object>} 생성된 프로그램
   */
  async createProgram(programData) {
    const { name, description, duration_minutes, capacity, location } = programData;

    if (!name) {
      throw new BadRequestError('프로그램명은 필수입니다.');
    }

    const programId = await Program.create({
      name,
      description,
      duration_minutes,
      capacity,
      location
    });

    return this.getProgramById(programId);
  }

  /**
   * 프로그램 수정 (관리자용)
   * @param {number} programId - 프로그램 ID
   * @param {Object} updateData - 수정할 데이터
   * @returns {Promise<Object>} 수정된 프로그램
   */
  async updateProgram(programId, updateData) {
    const program = await Program.findById(programId);
    if (!program) {
      throw new NotFoundError('프로그램을 찾을 수 없습니다.');
    }

    await Program.update(programId, updateData);

    return this.getProgramById(programId);
  }

  /**
   * 프로그램 삭제 (관리자용)
   * @param {number} programId - 프로그램 ID
   * @returns {Promise<boolean>} 삭제 성공 여부
   */
  async deleteProgram(programId) {
    const program = await Program.findById(programId);
    if (!program) {
      throw new NotFoundError('프로그램을 찾을 수 없습니다.');
    }

    return Program.deactivate(programId);
  }
}

module.exports = new ProgramService();