#!/bin/bash
# =============================================================================
# 안전체험관 자동화 시스템 - 보안 키 생성 스크립트
# =============================================================================
# 사용법: ./scripts/generate-secrets.sh
# 설명: .env 파일에 필요한 보안 키를 자동으로 생성합니다.
# =============================================================================

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 프로젝트 루트 디렉토리
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$PROJECT_ROOT/.env"

echo -e "${BLUE}🔐 안전체험관 시스템 - 보안 키 생성${NC}"
echo "========================================"

# .env.example 파일 확인
if [ ! -f "$PROJECT_ROOT/.env.example" ]; then
    echo -e "${RED}❌ .env.example 파일을 찾을 수 없습니다.${NC}"
    exit 1
fi

# .env 파일이 없으면 복사
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}⚠️  .env 파일이 없습니다. .env.example에서 복사합니다.${NC}"
    cp "$PROJECT_ROOT/.env.example" "$ENV_FILE"
fi

echo -e "${BLUE}📝 보안 키 생성 중...${NC}"

# 보안 키 생성 함수
generate_secret() {
    local length=$1
    openssl rand -base64 "$length" | tr -d '\n' | cut -c1-$length
}

generate_hex() {
    local length=$1
    openssl rand -hex "$((length/2))"
}

# 강력한 비밀번호 생성
DB_ROOT_PASSWORD=$(generate_secret 32)
DB_PASSWORD=$(generate_secret 32)
JWT_SECRET=$(generate_hex 64)
FLASK_SECRET=$(generate_hex 32)
BACKEND_API_KEY=$(generate_secret 32)

echo -e "${GREEN}✅ 보안 키 생성 완료${NC}"

# .env 파일 업데이트
echo -e "${BLUE}📝 .env 파일 업데이트 중...${NC}"

# sed로 값 교체 (macOS와 Linux 호환)
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/DB_ROOT_PASSWORD=.*/DB_ROOT_PASSWORD=${DB_ROOT_PASSWORD}/g" "$ENV_FILE"
    sed -i '' "s/DB_PASSWORD=.*/DB_PASSWORD=${DB_PASSWORD}/g" "$ENV_FILE"
    sed -i '' "s/JWT_SECRET=.*/JWT_SECRET=${JWT_SECRET}/g" "$ENV_FILE"
    sed -i '' "s/FLASK_SECRET=.*/FLASK_SECRET=${FLASK_SECRET}/g" "$ENV_FILE"
    sed -i '' "s/BACKEND_API_KEY=.*/BACKEND_API_KEY=${BACKEND_API_KEY}/g" "$ENV_FILE"
else
    # Linux
    sed -i "s/DB_ROOT_PASSWORD=.*/DB_ROOT_PASSWORD=${DB_ROOT_PASSWORD}/g" "$ENV_FILE"
    sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=${DB_PASSWORD}/g" "$ENV_FILE"
    sed -i "s/JWT_SECRET=.*/JWT_SECRET=${JWT_SECRET}/g" "$ENV_FILE"
    sed -i "s/FLASK_SECRET=.*/FLASK_SECRET=${FLASK_SECRET}/g" "$ENV_FILE"
    sed -i "s/BACKEND_API_KEY=.*/BACKEND_API_KEY=${BACKEND_API_KEY}/g" "$ENV_FILE"
fi

echo -e "${GREEN}✅ .env 파일 업데이트 완료${NC}"
echo ""
echo -e "${YELLOW}⚠️  중요: 생성된 키는 안전한 곳에 백업하세요!${NC}"
echo ""
echo "생성된 키 미리보기:"
echo "  DB_ROOT_PASSWORD: ${DB_ROOT_PASSWORD:0:10}..."
echo "  DB_PASSWORD: ${DB_PASSWORD:0:10}..."
echo "  JWT_SECRET: ${JWT_SECRET:0:10}..."
echo "  FLASK_SECRET: ${FLASK_SECRET:0:10}..."
echo ""
echo -e "${BLUE}📋 다음 단계:${NC}"
echo "  1. .env 파일을 열어 나머지 설정을 확인하세요."
echo "  2. CORS_ORIGIN과 VITE_API_URL을 실제 도메인으로 변경하세요."
echo "  3. SSL 인증서를 준비하세요."
echo ""
echo -e "${GREEN}🚀 배포 준비가 완료되었습니다!${NC}"
