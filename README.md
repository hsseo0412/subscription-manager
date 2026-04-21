# Subscription Manager

구독 중인 서비스를 등록/관리하고, 카드별 청구 예정액과 N분의 1 실부담금을 대시보드로 확인하는 구독 관리 시스템.

## 기술 스택

**Backend**
- Laravel 12 / PHP 8.4
- MySQL 8 / Redis
- Laravel Sanctum (SPA 인증)

**Frontend**
- React 18 + Vite
- Zustand (클라이언트 상태)
- TanStack Query (서버 상태)
- Tailwind CSS v3

**인프라**
- Docker / Docker Compose
- Nginx

## 시작하기

### 사전 요구사항
- Docker & Docker Compose
- Node.js 18+

### 설치

```bash
# 1. 저장소 클론
git clone https://github.com/hsseo0412/subscription-manager.git
cd subscription-manager

# 2. 환경 변수 설정
cp .env.example .env
# .env에서 APP_KEY 생성
docker compose run --rm app php artisan key:generate

# 3. 백엔드 컨테이너 실행
docker compose up -d

# 4. DB 마이그레이션
docker compose exec app php artisan migrate

# 5. 프론트엔드 설치 및 실행
cd frontend
cp .env.example .env
npm install
npm run dev
```

### 접속
| 서비스 | URL |
|--------|-----|
| 프론트엔드 | http://localhost:5173 |
| 백엔드 API | http://localhost:8080/api |

## 프로젝트 구조

```
subscription-manager/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Api/        # 도메인 API 컨트롤러
│   │   │   └── Auth/       # 인증 컨트롤러
│   │   └── Requests/
│   ├── Services/           # 비즈니스 로직
│   └── Repositories/       # DB 접근 추상화
├── frontend/
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── hooks/
│       ├── stores/
│       └── lib/
├── docker/
│   ├── nginx/
│   └── php/
└── docker-compose.yml
```

## API 엔드포인트

| Method | Endpoint | 인증 | 설명 |
|--------|----------|:----:|------|
| POST | `/api/auth/register` | | 회원가입 |
| POST | `/api/auth/login` | | 로그인 |
| POST | `/api/auth/logout` | ✓ | 로그아웃 |
| GET | `/api/user` | ✓ | 내 정보 조회 |
| PATCH | `/api/user/profile` | ✓ | 프로필 수정 |
| DELETE | `/api/user` | ✓ | 계정 삭제 |

## 주요 명령어

```bash
# 컨테이너 관리
docker compose up -d
docker compose down

# Artisan
docker compose exec app php artisan migrate
docker compose exec app php artisan route:list
docker compose exec app php artisan config:clear

# 프론트엔드
cd frontend && npm run dev    # 개발 서버
cd frontend && npm run build  # 프로덕션 빌드
```
