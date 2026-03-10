#!/bin/bash
# =============================================================================
# 안전체험관 자동화 시스템 - 배포 스크립트
# =============================================================================
# 사용법: ./scripts/deploy.sh [옵션]
# 옵션:
#   --skip-backup    백업을 건너뜁니다
#   --force          확인 없이 강제 실행
# =============================================================================

set -e

# 설정
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SKIP_BACKUP=false
FORCE=false

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 인수 파싱
while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-backup)
            SKIP_BACKUP=true
            shift
            ;;
        --force)
            FORCE=true
            shift
            ;;
        *)
            echo -e "${RED}❌ 알 수 없는 옵션: $1${NC}"
            exit 1
            ;;
    esac
done

cd "$PROJECT_ROOT"

echo -e "${BLUE}🚀 안전체험관 시스템 배포${NC}"
echo "========================================"
echo ""

# 확인 (force 모드가 아닌 경우)
if [ "$FORCE" = false ]; then
    echo -e "${YELLOW}⚠️  프로덕션 서버에 배포하시겠습니까?${NC}"
    read -p "계속하시려면 'yes'를 입력하세요: " CONFIRM
    if [ "$CONFIRM" != "yes" ]; then
        echo -e "${RED}❌ 배포가 취소되었습니다.${NC}"
        exit 1
    fi
    echo ""
fi

# 1. 사전 체크
echo -e "${BLUE}🔍 사전 체크${NC}"
echo "----------------------------------------"

# .env 파일 확인
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ .env 파일이 없습니다.${NC}"
    echo "  cp .env.example .env"
    exit 1
fi
echo -e "  ${GREEN}✅${NC} .env 파일 존재"

# SSL 인증서 확인
if [ ! -f "frontend/certs/cert.pem" ] || [ ! -f "frontend/certs/key.pem" ]; then
    echo -e "${YELLOW}⚠️${NC}  SSL 인증서가 없습니다. (테스트용 자체 서명 인증서를 생성합니다)"
    mkdir -p frontend/certs
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout frontend/certs/key.pem \
        -out frontend/certs/cert.pem \
        -subj "/C=KR/ST=Seoul/L=Seoul/O=Safety/CN=localhost" 2>/dev/null || true
else
    echo -e "  ${GREEN}✅${NC} SSL 인증서 존재"
fi

# Docker 확인
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker가 설치되어 있지 않습니다.${NC}"
    exit 1
fi
echo -e "  ${GREEN}✅${NC} Docker 설치됨"

echo ""

# 2. 백업
echo -e "${BLUE}💾 백업${NC}"
echo "----------------------------------------"
if [ "$SKIP_BACKUP" = true ]; then
    echo -e "${YELLOW}⚠️  백업을 건너뜁니다.${NC}"
else
    ./scripts/backup.sh || echo -e "${YELLOW}⚠️  백업 실패 (계속 진행)${NC}"
fi
echo ""

# 3. 코드 업데이트
echo -e "${BLUE}📥 코드 업데이트${NC}"
echo "----------------------------------------"

if [ -d ".git" ]; then
    git fetch origin
    git pull origin main || git pull origin master
    echo -e "  ${GREEN}✅${NC} Git 업데이트 완료"
else
    echo -e "  ${YELLOW}⚠️${NC}  Git 저장소가 아닙니다. 수동으로 코드를 업데이트하세요."
fi

echo ""

# 4. 컨테이너 중지
echo -e "${BLUE}🛑 기존 컨테이너 중지${NC}"
echo "----------------------------------------"
docker compose down --remove-orphans
echo -e "  ${GREEN}✅${NC} 컨테이너 중지 완료"
echo ""

# 5. 이미지 빌드 및 시작
echo -e "${BLUE}🏗️  이미지 빌드 및 시작${NC}"
echo "----------------------------------------"
docker compose up -d --build
echo -e "  ${GREEN}✅${NC} 컨테이너 시작 완료"
echo ""

# 6. 헬스체크
echo -e "${BLUE}🔍 헬스체크${NC}"
echo "----------------------------------------"
echo "서비스 시작 대기 중... (30초)"
sleep 30

if ./scripts/health-check.sh; then
    echo ""
    echo -e "${GREEN}🎉 배포 완료!${NC}"
    echo "========================================"
    echo ""
    echo "시스템 정보:"
    docker compose ps
    echo ""
    echo -e "${BLUE}🌐 접속 주소:${NC}"
    echo "  - Frontend: https://localhost"
    echo "  - Backend API: http://localhost:3000/api"
    echo ""
else
    echo ""
    echo -e "${RED}⚠️  배포 후 헬스체크 실패${NC}"
    echo "========================================"
    echo ""
    echo -e "${YELLOW}💡 문제 해결:${NC}"
    echo "  docker compose logs -f"
    exit 1
fi

# 7. 정리
echo -e "${BLUE}🧹 사용하지 않는 리소스 정리${NC}"
echo "----------------------------------------"
docker image prune -f
docker volume prune -f
echo -e "  ${GREEN}✅${NC} 정리 완료"
echo ""

echo -e "${GREEN}✨ 모든 작업이 완료되었습니다!${NC}"
