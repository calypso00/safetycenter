const mysql = require('mysql2/promise');
const config = require('./index');

// 연결 풀 생성
const pool = mysql.createPool({
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  database: config.database.name,
  waitForConnections: config.database.waitForConnections,
  connectionLimit: config.database.connectionLimit,
  queueLimit: config.database.queueLimit
});

// 데이터베이스 연결 테스트
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ 데이터베이스 연결 성공');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ 데이터베이스 연결 실패:', error.message);
    return false;
  }
};

// 쿼리 실행 헬퍼 함수
const query = async (sql, params = []) => {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('SQL 실행 오류:', error.message);
    throw error;
  }
};

// 트랜잭션 시작
const beginTransaction = async () => {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  return connection;
};

// 트랜잭션 커밋
const commit = async (connection) => {
  await connection.commit();
  connection.release();
};

// 트랜잭션 롤백
const rollback = async (connection) => {
  await connection.rollback();
  connection.release();
};

module.exports = {
  pool,
  testConnection,
  query,
  beginTransaction,
  commit,
  rollback
};
