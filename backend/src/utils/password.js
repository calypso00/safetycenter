const bcrypt = require('bcrypt');

const SALT_ROUNDS = 12;  // OWASP 권장값 (보안 강화)

/**
 * 비밀번호 해시 생성
 * @param {string} password - 원본 비밀번호
 * @returns {Promise<string>} 해시된 비밀번호
 */
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
};

/**
 * 비밀번호 검증
 * @param {string} password - 원본 비밀번호
 * @param {string} hashedPassword - 해시된 비밀번호
 * @returns {Promise<boolean>} 일치 여부
 */
const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

module.exports = {
  hashPassword,
  comparePassword
};