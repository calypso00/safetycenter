#!/bin/bash
# =============================================================================
# 안전체험관 자동화 시스템 - 백업 스크립트
# =============================================================================
# 사용법: ./scripts/backup.sh
# 설명: 데이터베이스와 중요 파일을 백업합니다.
# =============================================================================

set -e

# 설정
BACKUP_DIR="/opt/backups/safety-system"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RETENTION_DAYS=7
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="safety_backup_${DATE}"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 백업 디렉토리 생성
mkdir -p "$BACKUP_DIR"

echo -e "${BLUE}💾 백업 시작: ${DATE}${NC}"
echo "========================================"

# 1. 데이터베이스 백업
echo -e "${BLUE}🗄️  데이터베이스 백업 중...${NC}"

# 환경 변수 로드
if [ -f "$PROJECT_ROOT/.env" ]; then
    export $(grep -v '^#' "$PROJECT_ROOT/.env" | xargs)
fi

DB_CONTAINER="safety-mysql"
DB_NAME="safety_experience"
DB_USER="${DB_USER:-safety}"
DB_PASSWORD="${DB_PASSWORD:-}"

if docker ps | grep -q "$DB_CONTAINER"; then
    docker exec "$DB_CONTAINER" mysqldump -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" > "$BACKUP_DIR/${BACKUP_NAME}_database.sql"
    echo -e "${GREEN}✅ 데이터베이스 백업 완료${NC}"
else
    echo -e "${YELLOW}⚠️  MySQL 컨테이너가 실행 중이 아닙니다.${NC}"
fi

# 2. 환경 설정 파일 백업
echo -e "${BLUE}⚙️  설정 파일 백업 중...${NC}"
tar -czf "$BACKUP_DIR/${BACKUP_NAME}_config.tar.gz" \
    -C "$PROJECT_ROOT" \
    .env \
    docker-compose.yml \
    frontend/nginx.conf \
    frontend/certs/ 2>/dev/null || true
echo -e "${GREEN}✅ 설정 파일 백업 완료${NC}"

# 3. 얼굴인식 데이터 백업 (있는 경우)
echo -e "${BLUE}👤 얼굴인식 데이터 백업 중...${NC}"
FACE_DATA_VOLUME="safety-system_face_data"
if docker volume inspect "$FACE_DATA_VOLUME" > /dev/null 2>&1; then
    docker run --rm -v "$FACE_DATA_VOLUME:/data" -v "$BACKUP_DIR:/backup" alpine \
        tar -czf "/backup/${BACKUP_NAME}_face_data.tar.gz" -C /data .
    echo -e "${GREEN}✅ 얼굴인식 데이터 백업 완료${NC}"
else
    echo -e "${YELLOW}⚠️  얼굴인식 데이터 볼륨이 없습니다.${NC}"
fi

# 4. 백업 목록 생성
echo -e "${BLUE}📋 백업 목록 생성 중...${NC}"
ls -lh "$BACKUP_DIR/${BACKUP_NAME}"* > "$BACKUP_DIR/${BACKUP_NAME}_filelist.txt"
echo -e "${GREEN}✅ 백업 목록 생성 완료${NC}"

# 5. 오래된 백업 정리
echo -e "${BLUE}🧹 오래된 백업 정리 중...${NC}"
find "$BACKUP_DIR" -name "safety_backup_*" -type f -mtime +$RETENTION_DAYS -delete
echo -e "${GREEN}✅ ${RETENTION_DAYS}일 이상된 백업 삭제 완료${NC}"

# 백업 요약
echo ""
echo -e "${GREEN}🎉 백업 완료!${NC}"
echo "========================================"
echo "백업 위치: $BACKUP_DIR"
echo "백업 파일:"
ls -lh "$BACKUP_DIR/${BACKUP_NAME}"* 2>/dev/null || echo "  (파일 없음)"
echo ""
echo -e "${YELLOW}💡 복원 방법:${NC}"
echo "  데이터베이스: docker exec -i safety-mysql mysql -u safety -p safety_experience < backup_file.sql"
echo "  설정 파일: tar -xzf backup_file.tar.gz"
echo ""
