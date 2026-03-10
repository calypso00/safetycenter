#!/bin/bash
# =============================================================================
# 안전체험관 자동화 시스템 - 헬스체크 스크립트
# =============================================================================
# 사용법: ./scripts/health-check.sh
# 설명: 모든 서비스의 상태를 확인합니다.
# =============================================================================

set -e

# 설정
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TIMEOUT=10

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 상태 변수
ALL_HEALTHY=true

echo -e "${BLUE}🔍 시스템 헬스체크${NC}"
echo "========================================"
echo ""

# 환경 변수 로드
if [ -f "$PROJECT_ROOT/.env" ]; then
    export $(grep -v '^#' "$PROJECT_ROOT/.env" | xargs)
fi

# 도메인 설정 (기본값)
DOMAIN="${CORS_ORIGIN:-http://localhost}"
DOMAIN=${DOMAIN#http://}
DOMAIN=${DOMAIN#https://}
DOMAIN=${DOMAIN%%/*}

echo -e "${BLUE}📡 도메인: $DOMAIN${NC}"
echo ""

# 1. Docker 컨테이너 상태 확인
echo -e "${BLUE}🐳 Docker 컨테이너 상태 확인${NC}"
echo "----------------------------------------"

CONTAINERS=("safety-mysql" "safety-redis" "safety-backend" "safety-face-recognition" "safety-frontend")

for container in "${CONTAINERS[@]}"; do
    if docker ps --format "{{.Names}}" | grep -q "^${container}$"; then
        STATUS=$(docker inspect --format='{{.State.Status}}' "$container" 2>/dev/null || echo "unknown")
        HEALTH=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null || echo "none")
        
        if [ "$STATUS" == "running" ]; then
            if [ "$HEALTH" == "healthy" ] || [ "$HEALTH" == "none" ]; then
                echo -e "  ${GREEN}✅${NC} $container: $STATUS ($HEALTH)"
            else
                echo -e "  ${YELLOW}⚠️${NC}  $container: $STATUS ($HEALTH)"
                ALL_HEALTHY=false
            fi
        else
            echo -e "  ${RED}❌${NC} $container: $STATUS"
            ALL_HEALTHY=false
        fi
    else
        echo -e "  ${RED}❌${NC} $container: NOT FOUND"
        ALL_HEALTHY=false
    fi
done

echo ""

# 2. HTTP 엔드포인트 확인
echo -e "${BLUE}🌐 HTTP 엔드포인트 확인${NC}"
echo "----------------------------------------"

# Backend API 헬스체크
if curl -sf --max-time $TIMEOUT "http://localhost:3000/api/health" > /dev/null 2>&1; then
    echo -e "  ${GREEN}✅${NC} Backend API (http://localhost:3000/api/health)"
else
    echo -e "  ${RED}❌${NC} Backend API (http://localhost:3000/api/health)"
    ALL_HEALTHY=false
fi

# Face Recognition 헬스체크
if curl -sf --max-time $TIMEOUT "http://localhost:5001/health" > /dev/null 2>&1; then
    echo -e "  ${GREEN}✅${NC} Face Recognition (http://localhost:5001/health)"
else
    echo -e "  ${RED}❌${NC} Face Recognition (http://localhost:5001/health)"
    ALL_HEALTHY=false
fi

# Frontend 확인
if curl -sf --max-time $TIMEOUT "http://localhost" > /dev/null 2>&1; then
    echo -e "  ${GREEN}✅${NC} Frontend (http://localhost)"
else
    echo -e "  ${RED}❌${NC} Frontend (http://localhost)"
    ALL_HEALTHY=false
fi

# HTTPS 확인 (인증서가 있는 경우)
if [ -f "$PROJECT_ROOT/frontend/certs/cert.pem" ]; then
    if curl -sfk --max-time $TIMEOUT "https://localhost" > /dev/null 2>&1; then
        echo -e "  ${GREEN}✅${NC} Frontend HTTPS (https://localhost)"
    else
        echo -e "  ${YELLOW}⚠️${NC}  Frontend HTTPS (https://localhost) - 인증서 문제 가능"
    fi
fi

echo ""

# 3. 데이터베이스 연결 확인
echo -e "${BLUE}🗄️  데이터베이스 연결 확인${NC}"
echo "----------------------------------------"

if docker exec safety-mysql mysqladmin -u safety -p"${DB_PASSWORD}" ping > /dev/null 2>&1; then
    echo -e "  ${GREEN}✅${NC} MySQL 연결 정상"
else
    echo -e "  ${RED}❌${NC} MySQL 연결 실패"
    ALL_HEALTHY=false
fi

echo ""

# 4. 디스크 사용량 확인
echo -e "${BLUE}💾 디스크 사용량 확인${NC}"
echo "----------------------------------------"

DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 80 ]; then
    echo -e "  ${GREEN}✅${NC} 루트 디스크: ${DISK_USAGE}% 사용 중"
else
    echo -e "  ${YELLOW}⚠️${NC}  루트 디스크: ${DISK_USAGE}% 사용 중 (정리 권장)"
fi

echo ""

# 5. 메모리 사용량 확인
echo -e "${BLUE}🧠 메모리 사용량 확인${NC}"
echo "----------------------------------------"

MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
if [ "$MEMORY_USAGE" -lt 80 ]; then
    echo -e "  ${GREEN}✅${NC} 메모리: ${MEMORY_USAGE}% 사용 중"
else
    echo -e "  ${YELLOW}⚠️${NC}  메모리: ${MEMORY_USAGE}% 사용 중 (확장 권장)"
fi

echo ""

# 최종 결과
echo "========================================"
if [ "$ALL_HEALTHY" = true ]; then
    echo -e "${GREEN}🎉 모든 시스템이 정상 작동 중입니다!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  일부 시스템에 문제가 발견되었습니다.${NC}"
    echo ""
    echo -e "${YELLOW}💡 로그 확인:${NC}"
    echo "  docker compose logs -f [서비스명]"
    exit 1
fi
