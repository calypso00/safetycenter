-- ============================================
-- 안전체험관 테스트 데이터
-- safetytest 사용자용 예약 및 체험 기록
-- ============================================

-- safetytest 사용자 확인 및 생성 (비밀번호: 12345678)
-- 비밀번호는 bcrypt 해시값으로 저장됨
INSERT INTO USERS (
    email,
    password,
    name,
    phone,
    birth_date,
    gender,
    role,
    is_active
) VALUES (
    'safetytest@test.com',
    '$2b$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ12',
    '테스트 사용자',
    '010-1234-5678',
    '1995-05-15',
    'male',
    'user',
    TRUE
) ON DUPLICATE KEY UPDATE
    name = '테스트 사용자',
    phone = '010-1234-5678',
    is_active = TRUE;

-- safetytest 사용자 ID 가져오기
SET @test_user_id = (SELECT id FROM USERS WHERE email = 'safetytest@test.com');

-- ============================================
-- 1. 예약 데이터 생성
-- ============================================

-- 프로그램 ID 가져오기
SET @program1_id = (SELECT id FROM PROGRAMS WHERE name = '화재대피체험' LIMIT 1);
SET @program2_id = (SELECT id FROM PROGRAMS WHERE name = '지진대피체험' LIMIT 1);
SET @program3_id = (SELECT id FROM PROGRAMS WHERE name = '응급처치체험' LIMIT 1);

-- 예약 1: 화재대피체험 (대기중)
INSERT INTO RESERVATIONS (
    user_id,
    program_id,
    reservation_date,
    time_slot,
    participant_count,
    status,
    created_at
) VALUES (
    @test_user_id,
    @program1_id,
    DATE_ADD(CURDATE(), INTERVAL 7 DAY),
    '10:00:00',
    2,
    'pending',
    NOW()
);

-- 예약 2: 지진대피체험 (확정됨)
INSERT INTO RESERVATIONS (
    user_id,
    program_id,
    reservation_date,
    time_slot,
    participant_count,
    status,
    created_at
) VALUES (
    @test_user_id,
    @program2_id,
    DATE_ADD(CURDATE(), INTERVAL 14 DAY),
    '14:00:00',
    1,
    'confirmed',
    DATE_SUB(NOW(), INTERVAL 3 DAY)
);

-- 예약 3: 응급처치체험 (완료됨 - 과거 예약)
INSERT INTO RESERVATIONS (
    user_id,
    program_id,
    reservation_date,
    time_slot,
    participant_count,
    status,
    created_at
) VALUES (
    @test_user_id,
    @program3_id,
    DATE_SUB(CURDATE(), INTERVAL 7 DAY),
    '11:00:00',
    3,
    'completed',
    DATE_SUB(NOW(), INTERVAL 14 DAY)
);

-- ============================================
-- 2. 체험 기록 데이터 생성
-- ============================================

-- 완료된 예약의 ID 가져오기
SET @completed_reservation_id = (SELECT id FROM RESERVATIONS 
                                  WHERE user_id = @test_user_id 
                                  AND status = 'completed' 
                                  ORDER BY id DESC LIMIT 1);

-- 체험 기록 1: 응급처치체험 완료
INSERT INTO EXPERIENCE_LOGS (
    user_id,
    program_id,
    reservation_id,
    entry_time,
    exit_time,
    duration_seconds,
    entry_method,
    notes,
    created_at
) VALUES (
    @test_user_id,
    @program3_id,
    @completed_reservation_id,
    DATE_SUB(NOW(), INTERVAL 7 DAY),
    DATE_SUB(NOW(), INTERVAL 7 DAY) + INTERVAL 90 MINUTE,
    5400,
    'manual',
    '응급처치 교육 완료',
    DATE_SUB(NOW(), INTERVAL 7 DAY)
);

-- 체험 기록 2: 화재대피체험 (과거 체험)
INSERT INTO EXPERIENCE_LOGS (
    user_id,
    program_id,
    reservation_id,
    entry_time,
    exit_time,
    duration_seconds,
    entry_method,
    notes,
    created_at
) VALUES (
    @test_user_id,
    @program1_id,
    NULL,
    DATE_SUB(NOW(), INTERVAL 30 DAY),
    DATE_SUB(NOW(), INTERVAL 30 DAY) + INTERVAL 60 MINUTE,
    3600,
    'face',
    '얼굴 인식 입장',
    DATE_SUB(NOW(), INTERVAL 30 DAY)
);

-- 체험 기록 3: 지진대피체험 (과거 체험)
INSERT INTO EXPERIENCE_LOGS (
    user_id,
    program_id,
    reservation_id,
    entry_time,
    exit_time,
    duration_seconds,
    entry_method,
    notes,
    created_at
) VALUES (
    @test_user_id,
    @program2_id,
    NULL,
    DATE_SUB(NOW(), INTERVAL 60 DAY),
    DATE_SUB(NOW(), INTERVAL 60 DAY) + INTERVAL 50 MINUTE,
    3000,
    'manual',
    '단체 체험',
    DATE_SUB(NOW(), INTERVAL 60 DAY)
);

-- 결과 확인
SELECT '테스트 데이터 생성 완료' AS result;
SELECT 
    u.name AS user_name,
    u.email,
    COUNT(DISTINCT r.id) AS reservation_count,
    COUNT(DISTINCT el.id) AS experience_count
FROM USERS u
LEFT JOIN RESERVATIONS r ON u.id = r.user_id
LEFT JOIN EXPERIENCE_LOGS el ON u.id = el.user_id
WHERE u.email = 'safetytest@test.com'
GROUP BY u.id;
