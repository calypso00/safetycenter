-- ============================================
-- 안전체험관 자동화 시스템 - 데이터베이스 스키마
-- ============================================
-- 생성일: 2026-02-25
-- 데이터베이스: MySQL 8.0+
-- ============================================

-- 데이터베이스 생성 (필요시)
-- CREATE DATABASE IF NOT EXISTS safety_experience_db
-- CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- USE safety_experience_db;

-- ============================================
-- 외래키 제약조건 활성화
-- ============================================
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- 기존 테이블 삭제 (초기화 시)
-- ============================================
DROP TABLE IF EXISTS ADMIN_LOGS;
DROP TABLE IF EXISTS BOARD_COMMENTS;
DROP TABLE IF EXISTS BOARD_POSTS;
DROP TABLE IF EXISTS EXPERIENCE_LOGS;
DROP TABLE IF EXISTS RESERVATIONS;
DROP TABLE IF EXISTS FACE_DATA;
DROP TABLE IF EXISTS PROGRAMS;
DROP TABLE IF EXISTS USERS;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- 1. USERS - 사용자 정보 테이블
-- ============================================
CREATE TABLE USERS (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '사용자 고유 ID',
    email VARCHAR(100) NOT NULL UNIQUE COMMENT '이메일 (로그인 ID)',
    password VARCHAR(255) NOT NULL COMMENT '암호화된 비밀번호',
    name VARCHAR(100) NOT NULL COMMENT '사용자 이름',
    phone VARCHAR(20) COMMENT '연락처',
    birth_date DATE COMMENT '생년월일',
    gender ENUM('male', 'female', 'other') COMMENT '성별',
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user' COMMENT '권한',
    is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT '활성 상태',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='사용자 정보';

-- USERS 인덱스
CREATE INDEX idx_users_email ON USERS(email);
CREATE INDEX idx_users_name ON USERS(name);
CREATE INDEX idx_users_role ON USERS(role);
CREATE INDEX idx_users_is_active ON USERS(is_active);
CREATE INDEX idx_users_created_at ON USERS(created_at);

-- ============================================
-- 2. FACE_DATA - 안면인식 데이터 테이블
-- ============================================
CREATE TABLE FACE_DATA (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '안면데이터 고유 ID',
    user_id BIGINT NOT NULL COMMENT '사용자 ID',
    face_encoding TEXT NOT NULL COMMENT '안면 인코딩 데이터 (JSON)',
    image_path VARCHAR(255) COMMENT '저장된 이미지 경로',
    registered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '등록일시',
    is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT '활성 상태',
    FOREIGN KEY (user_id) REFERENCES USERS(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='안면인식 데이터';

-- FACE_DATA 인덱스
CREATE INDEX idx_face_data_user_id ON FACE_DATA(user_id);
CREATE INDEX idx_face_data_is_active ON FACE_DATA(is_active);

-- ============================================
-- 3. PROGRAMS - 체험 프로그램 테이블
-- ============================================
CREATE TABLE PROGRAMS (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '프로그램 고유 ID',
    name VARCHAR(100) NOT NULL COMMENT '프로그램명',
    description TEXT COMMENT '프로그램 설명',
    duration_minutes INT NOT NULL DEFAULT 60 COMMENT '소요 시간 (분)',
    capacity INT NOT NULL DEFAULT 20 COMMENT '수용 인원',
    location VARCHAR(100) COMMENT '체험 장소',
    status ENUM('active', 'inactive', 'maintenance') NOT NULL DEFAULT 'active' COMMENT '상태',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='체험 프로그램';

-- PROGRAMS 인덱스
CREATE INDEX idx_programs_status ON PROGRAMS(status);
CREATE INDEX idx_programs_name ON PROGRAMS(name);

-- ============================================
-- 4. RESERVATIONS - 예약 정보 테이블
-- ============================================
CREATE TABLE RESERVATIONS (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '예약 고유 ID',
    user_id BIGINT NOT NULL COMMENT '사용자 ID',
    program_id BIGINT NOT NULL COMMENT '프로그램 ID',
    reservation_date DATE NOT NULL COMMENT '예약 일자',
    time_slot TIME NOT NULL COMMENT '예약 시간대',
    status ENUM('pending', 'confirmed', 'cancelled', 'completed') NOT NULL DEFAULT 'pending' COMMENT '예약 상태',
    participant_count INT NOT NULL DEFAULT 1 COMMENT '참여 인원',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    FOREIGN KEY (user_id) REFERENCES USERS(id) ON DELETE CASCADE,
    FOREIGN KEY (program_id) REFERENCES PROGRAMS(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='예약 정보';

-- RESERVATIONS 인덱스
CREATE INDEX idx_reservations_user_id ON RESERVATIONS(user_id);
CREATE INDEX idx_reservations_program_id ON RESERVATIONS(program_id);
CREATE INDEX idx_reservations_date ON RESERVATIONS(reservation_date);
CREATE INDEX idx_reservations_status ON RESERVATIONS(status);
CREATE INDEX idx_reservations_date_time ON RESERVATIONS(reservation_date, time_slot);

-- ============================================
-- 5. EXPERIENCE_LOGS - 체험 기록 테이블
-- ============================================
CREATE TABLE EXPERIENCE_LOGS (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '기록 고유 ID',
    user_id BIGINT NOT NULL COMMENT '사용자 ID',
    program_id BIGINT NOT NULL COMMENT '프로그램 ID',
    reservation_id BIGINT COMMENT '예약 ID',
    check_in_time DATETIME NOT NULL COMMENT '입장 시간',
    check_out_time DATETIME COMMENT '퇴장 시간',
    duration INT COMMENT '체류 시간 (분)',
    entry_method ENUM('face', 'manual') NOT NULL DEFAULT 'face' COMMENT '입장 방식',
    notes TEXT COMMENT '비고',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    FOREIGN KEY (user_id) REFERENCES USERS(id) ON DELETE CASCADE,
    FOREIGN KEY (program_id) REFERENCES PROGRAMS(id) ON DELETE CASCADE,
    FOREIGN KEY (reservation_id) REFERENCES RESERVATIONS(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='체험 기록';

-- EXPERIENCE_LOGS 인덱스
CREATE INDEX idx_experience_logs_user_id ON EXPERIENCE_LOGS(user_id);
CREATE INDEX idx_experience_logs_program_id ON EXPERIENCE_LOGS(program_id);
CREATE INDEX idx_experience_logs_check_in_time ON EXPERIENCE_LOGS(check_in_time);
CREATE INDEX idx_experience_logs_created_at ON EXPERIENCE_LOGS(created_at);

-- ============================================
-- 6. BOARD_POSTS - 게시글 테이블
-- ============================================
CREATE TABLE BOARD_POSTS (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '게시글 고유 ID',
    user_id BIGINT NOT NULL COMMENT '작성자 ID',
    title VARCHAR(200) NOT NULL COMMENT '제목',
    content TEXT NOT NULL COMMENT '내용',
    category ENUM('inquiry', 'notice', 'faq') NOT NULL DEFAULT 'inquiry' COMMENT '카테고리',
    views INT NOT NULL DEFAULT 0 COMMENT '조회수',
    status ENUM('pending', 'answered', 'closed') NOT NULL DEFAULT 'pending' COMMENT '상태',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    FOREIGN KEY (user_id) REFERENCES USERS(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='게시글';

-- BOARD_POSTS 인덱스
CREATE INDEX idx_board_posts_user_id ON BOARD_POSTS(user_id);
CREATE INDEX idx_board_posts_category ON BOARD_POSTS(category);
CREATE INDEX idx_board_posts_status ON BOARD_POSTS(status);
CREATE INDEX idx_board_posts_created_at ON BOARD_POSTS(created_at);

-- ============================================
-- 7. BOARD_COMMENTS - 댓글 테이블
-- ============================================
CREATE TABLE BOARD_COMMENTS (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '댓글 고유 ID',
    post_id BIGINT NOT NULL COMMENT '게시글 ID',
    user_id BIGINT NOT NULL COMMENT '작성자 ID',
    content TEXT NOT NULL COMMENT '내용',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    FOREIGN KEY (post_id) REFERENCES BOARD_POSTS(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES USERS(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='댓글';

-- BOARD_COMMENTS 인덱스
CREATE INDEX idx_board_comments_post_id ON BOARD_COMMENTS(post_id);
CREATE INDEX idx_board_comments_user_id ON BOARD_COMMENTS(user_id);
CREATE INDEX idx_board_comments_created_at ON BOARD_COMMENTS(created_at);

-- ============================================
-- 8. ADMIN_LOGS - 관리자 로그 테이블
-- ============================================
CREATE TABLE ADMIN_LOGS (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '로그 고유 ID',
    admin_id BIGINT NOT NULL COMMENT '관리자 ID',
    action VARCHAR(50) NOT NULL COMMENT '수행 작업',
    target_type VARCHAR(50) COMMENT '대상 타입 (user, program, reservation 등)',
    target_id BIGINT COMMENT '대상 ID',
    details TEXT COMMENT '상세 내용',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    FOREIGN KEY (admin_id) REFERENCES USERS(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='관리자 로그';

-- ADMIN_LOGS 인덱스
CREATE INDEX idx_admin_logs_admin_id ON ADMIN_LOGS(admin_id);
CREATE INDEX idx_admin_logs_action ON ADMIN_LOGS(action);
CREATE INDEX idx_admin_logs_target ON ADMIN_LOGS(target_type, target_id);
CREATE INDEX idx_admin_logs_created_at ON ADMIN_LOGS(created_at);

-- ============================================
-- 스키마 생성 완료
-- ============================================
