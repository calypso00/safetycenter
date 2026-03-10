# 안전체험관 자동화 시스템 - 배포 가이드

> **버전**: 1.0  
> **최종 수정일**: 2026-03-10  
> **대상**: 서버 개발자/운영 엔지니어

---

## 📋 문서 개요

이 문서는 안전체험관 자동화 시스템을 프로덕션 환경에 배포하는 방법을 설명합니다.

### 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client (Browser)                        │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Nginx (Reverse Proxy)                      │
│              SSL Termination + Static File Serving              │
│                         Ports: 80, 443                          │
└─────────────────────────────────────────────────────────────────┘
                                │
            ┌───────────────────┼───────────────────┐
            ▼                   ▼                   ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│    Frontend     │ │     Backend     │  │ Face Recognition│
│  React + Vite   │ │  Node.js API    │  │ Python Flask    │
│    Port: 80     │ │   Port: 3000    │  │  Port: 5001     │
└─────────────────┘  └─────────────────┘  └─────────────────┘
                              │
            ┌─────────────────┴─────────────────┐
            ▼                                   ▼
┌─────────────────┐                    ┌─────────────────┐
│   MySQL 8.0     │                    │  Redis (Cache)  │
│   Port: 3306    │                    │   Port: 6379    │
└─────────────────┘                    └─────────────────┘
```

---

## 🖥️ 서버 요구사항

### 최소 사양

| 구성 요소 | 사양 | 비고 |
|-----------|------|------|
| **CPU** | 4 vCore | 얼굴인식 서비스는 CPU 집약적 |
| **RAM** | 8 GB | 16 GB 권장 |
| **디스크** | 50 GB SSD | 데이터 증가에 따라 확장 필요 |
| **네트워크** | 100 Mbps | HTTPS 트래픽 처리 |

### 권장 사양

| 구성 요소 | 사양 | 비고 |
|-----------|------|------|
| **CPU** | 8 vCore | 동시 사용자 100명 이상 |
| **RAM** | 16 GB | 안정적 캐싱 및 처리 |
| **디스크** | 100 GB SSD | 백업 및 로그 저장 포함 |
| **네트워크** | 1 Gbps | 안정적인 이미지 전송 |

### 운영체제

- **권장**: Ubuntu 22.04 LTS
- **지원**: CentOS 8+, Debian 11+, RHEL 8+

---

## 📦 필수 소프트웨어

### Docker 설치

```bash
# 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# Docker 설치
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 사용자를 docker 그룹에 추가
sudo usermod -aG docker $USER
newgrp docker

# Docker Compose 플러그인 설치
sudo apt install docker-compose-plugin

# 설치 확인
docker --version
docker compose version
```

### 선택적 도구

```bash
# SSL 인증서 발급 (Let's Encrypt)
sudo apt install certbot

# 모니터링 도구
sudo apt install htop ncdu tree
```

---

## 🔐 환경 설정

### 1. 프로젝트 클론

```bash
# 프로젝트 디렉토리 생성
mkdir -p /opt/safety-system
cd /opt/safety-system

# 코드 배포 (Git 사용 시)
git clone <repository-url> .
# 또는 파일 직접 업로드 (SCP/SFTP)
```

### 2. 환경 변수 파일 생성

```bash
# 루트 .env 생성
cp .env.example .env

# 보안 키 생성 스크립트
./scripts/generate-secrets.sh
```

**scripts/generate-secrets.sh:**
```bash
#!/bin/bash
# 보안 키 자동 생성 스크립트

echo "🔐 보안 키 생성 중..."

# 강력한 비밀번호 생성
DB_ROOT_PASSWORD=$(openssl rand -base64 32)
DB_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -hex 64)
FLASK_SECRET=$(openssl rand -hex 32)
BACKEND_API_KEY=$(openssl rand -base64 32)

# .env 파일 업데이트
sed -i "s/your-secure-root-password-here/${DB_ROOT_PASSWORD}/g" .env
sed -i "s/your-secure-db-password-here/${DB_PASSWORD}/g" .env
sed -i "s/your-jwt-secret-key-minimum-64-characters-long-random-string-here/${JWT_SECRET}/g" .env
sed -i "s/your-flask-secret-key-minimum-32-characters-long/${FLASK_SECRET}/g" .env
sed -i "s/default-api-key-change-in-production/${BACKEND_API_KEY}/g" .env

echo "✅ 보안 키 생성 완료"
echo "📝 .env 파일을 확인하고 추가 설정을 완료하세요"
```

### 3. 필수 환경 변수 목록

| 변수명 | 설명 | 예시 값 |
|--------|------|---------|
| `DB_ROOT_PASSWORD` | MySQL 루트 비밀번호 | `changeme-strong-password` |
| `DB_PASSWORD` | 애플리케이션 DB 비밀번호 | `app-db-password` |
| `JWT_SECRET` | JWT 서명 키 (64자 이상) | `64-char-hex-string...` |
| `FLASK_SECRET` | Flask 세션 키 | `32-char-hex-string...` |
| `CORS_ORIGIN` | 허용된 오리진 | `https://safety.example.com` |
| `VITE_API_URL` | 프론트엔드 API URL | `https://safety.example.com/api` |

---

## 🌐 SSL 인증서 설정

### 방법 1: Let's Encrypt (권장)

```bash
# 1. 인증서 발급
sudo certbot certonly --standalone \
  -d safety.example.com \
  -d www.safety.example.com

# 2. 인증서 복사
sudo cp /etc/letsencrypt/live/safety.example.com/fullchain.pem \
  frontend/certs/cert.pem
sudo cp /etc/letsencrypt/live/safety.example.com/privkey.pem \
  frontend/certs/key.pem

# 3. 권한 설정
sudo chmod 644 frontend/certs/cert.pem
sudo chmod 600 frontend/certs/key.pem
sudo chown $USER:$USER frontend/certs/*

# 4. 자동 갱신 설정
sudo certbot renew --dry-run
echo "0 3 * * * root certbot renew --quiet && cp /etc/letsencrypt/live/safety.example.com/*.pem /opt/safety-system/frontend/certs/" | sudo tee -a /etc/crontab
```

### 방법 2: 자체 서명 인증서 (테스트용)

```bash
cd frontend/certs
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout key.pem -out cert.pem \
  -subj "/C=KR/ST=Seoul/L=Seoul/O=Safety/OU=IT/CN=safety.example.com"
```

### 방법 3: 기존 인증서 사용

```bash
# 기존 인증서를 frontend/certs/ 디렉토리에 복사
cp /path/to/existing/cert.pem frontend/certs/cert.pem
cp /path/to/existing/key.pem frontend/certs/key.pem
```

---

## 🚀 배포 실행

### 1. Nginx 설정 수정

`frontend/nginx.conf` 파일의 `server_name`을 실제 도메인으로 변경:

```nginx
server {
    listen 80;
    server_name safety.example.com www.safety.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name safety.example.com www.safety.example.com;
    # ... SSL 설정
}
```

### 2. Docker Compose 실행

```bash
# 프로젝트 루트에서 실행
cd /opt/safety-system

# 전체 스택 빌드 및 시작
docker compose up -d --build

# 특정 서비스만 실행
docker compose up -d mysql redis  # DB 먼저 시작
docker compose up -d backend      # 백엔드 시작
docker compose up -d face-recognition  # 얼굴인식 시작
docker compose up -d frontend     # 프론트엔드 시작
```

### 3. 배포 상태 확인

```bash
# 컨테이너 상태 확인
docker compose ps

# 로그 확인
docker compose logs -f [서비스명]
# 예: docker compose logs -f backend

# 리소스 사용량
docker stats

# 헬스체크
curl -f https://safety.example.com/api/health || echo "❌ 헬스체크 실패"
```

---

## 🗄️ 데이터베이스 초기화

### 자동 초기화 (Docker Compose)

`docker-compose.yml`에 이미 설정되어 있음:
- `database/init.sql` → 초기 데이터베이스 생성
- `database/schema.sql` → 테이블 스키마

### 수동 초기화

```bash
# SQL 파일 직접 실행
docker exec -i safety-mysql mysql -u root -p${DB_ROOT_PASSWORD} < database/schema.sql

# 관리자 계정 생성
docker exec -i safety-mysql mysql -u safety -p${DB_PASSWORD} safety_experience << EOF
INSERT INTO users (email, password_hash, name, phone, role, status)
VALUES (
  'admin@safety.com',
  '\$2a\$10\$...',  -- bcrypt 해시
  '시스템 관리자',
  '010-0000-0000',
  'admin',
  'active'
);
EOF
```

---

## 🔒 보안 설정

### 1. 방화벽 (UFW)

```bash
# UFW 활성화
sudo ufw default deny incoming
sudo ufw default allow outgoing

# 필수 포트 허용
sudo ufw allow ssh        # SSH 접속
sudo ufw allow http       # HTTP (80)
sudo ufw allow https      # HTTPS (443)

# 선택적: 관리 포트 (IP 제한 권장)
sudo ufw allow from 192.168.1.0/24 to any port 3306  # MySQL (낭부만)

# 방화벽 활성화
sudo ufw enable
sudo ufw status verbose
```

### 2. Docker 보안 설정

```bash
# /etc/docker/daemon.json 생성
sudo tee /etc/docker/daemon.json > /dev/null << EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3",
    "labels": "production_status",
    "env": "OS_ENVIRONMENT"
  },
  "live-restore": true,
  "userland-proxy": false,
  "no-new-privileges": true
}
EOF

sudo systemctl restart docker
```

### 3. 파일 권한 설정

```bash
# 프로젝트 디렉토리 권한
sudo chown -R root:root /opt/safety-system
sudo chmod -R 755 /opt/safety-system

# 민감한 파일 보호
sudo chmod 600 /opt/safety-system/.env
sudo chmod 600 /opt/safety-system/frontend/certs/key.pem
sudo chmod 644 /opt/safety-system/frontend/certs/cert.pem
```

---

## 📊 모니터링 및 로깅

### 1. 로그 확인

```bash
# 실시간 로그
docker compose logs -f --tail=100

# 특정 서비스 로그
docker compose logs -f backend

# 특정 시간 로그
docker compose logs --since="2026-03-10T10:00:00" backend

# 로그 파일 위치
/var/lib/docker/containers/<container-id>/<container-id>-json.log
```

### 2. 리소스 모니터링

```bash
# Docker 리소스 사용량
docker stats --no-stream

# 시스템 리소스
htop
free -h
df -h
```

### 3. 로그 로테이션

`/etc/logrotate.d/docker-container`:
```
/var/lib/docker/containers/*/*.log {
  rotate 7
  daily
  compress
  delaycompress
  missingok
  notifempty
  create 0644 root root
}
```

---

## 🔄 업데이트 및 롤백

### 업데이트 절차

```bash
# 1. 백업
cd /opt/safety-system
./scripts/backup.sh

# 2. 최신 코드 가져오기
git pull origin main

# 3. 컨테이너 중지
docker compose down

# 4. 이미지 재빌드 및 시작
docker compose up -d --build

# 5. 헬스체크
./scripts/health-check.sh

# 6. 사용하지 않는 이미지 정리
docker image prune -f
docker volume prune -f
```

### 롤백 절차

```bash
# 이전 버전으로 롤백
git log --oneline -10
git checkout <이전-커밋-해시>

docker compose down
docker compose up -d --build
```

### 무중단 배포 (Blue-Green)

```bash
# Blue-Green 배포 스크립트
#!/bin/bash
# scripts/blue-green-deploy.sh

CURRENT=$(docker compose ps -q backend)
COMPOSE_PROJECT_NAME=safety-green docker compose up -d backend

# 헬스체크
sleep 10
curl -f http://localhost:3001/api/health || exit 1

# 트래픽 전환 (Nginx upstream 변경)
sudo nginx -s reload

# 이전 컨테이너 제거
docker stop $CURRENT
```

---

## 🚨 문제 해결

### 일반적인 문제

| 증상 | 원인 | 해결 방법 |
|------|------|-----------|
| `port is already allocated` | 포트 중복 | `sudo lsof -i :443` 후 프로세스 종료 |
| `permission denied` | 파일 권한 | `sudo chown -R $USER:$USER .` |
| DB 연결 실패 | 네트워크/비밀번호 | `docker compose logs mysql` 확인 |
| 얼굴인식 502 에러 | 메모리 부족 | Docker 메모리 제한 확인 |
| SSL 오류 | 인증서 문제 | `openssl x509 -in cert.pem -text -noout` |

### 디버깅 명령어

```bash
# 컨테이너 낶부 접속
docker exec -it safety-backend sh
docker exec -it safety-mysql mysql -u safety -p

# 네트워크 확인
docker network inspect safety-network

# 볼륨 확인
docker volume ls
docker volume inspect safety-system_mysql_data

# 프로세스 확인
docker top safety-backend
```

---

## 📋 체크리스트

### 배포 전

- [ ] 서버 사양 충족 확인 (CPU 4코어, RAM 8GB)
- [ ] 도메인 DNS 설정 완료
- [ ] 방화벽 포트 개방 (80, 443)
- [ ] SSL 인증서 준비
- [ ] `.env` 파일 모든 값 설정
- [ ] 백업 스크립트 테스트

### 배포 후

- [ ] 모든 컨테이너 정상 실행 (`docker compose ps`)
- [ ] HTTPS 접속 확인
- [ ] API 헬스체크 통과 (`/api/health`)
- [ ] DB 연결 확인
- [ ] 얼굴인식 서비스 응답 확인
- [ ] 관리자 로그인 테스트
- [ ] 로그 로테이션 설정
- [ ] 모니터링 알림 설정

---

## 📞 지원 및 문의

- **기술 지원**: dev-team@example.com
- **긴급 연락**: +82-2-1234-5678
- **문서**: https://wiki.example.com/safety-system

---

## 📝 변경 이력

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|-----------|--------|
| 1.0 | 2026-03-10 | 초기 문서 작성 | DevOps Team |
