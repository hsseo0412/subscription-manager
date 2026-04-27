# Subscription Manager

구독 중인 서비스를 등록·관리하고, 결제일별 캘린더 뷰·카드별 청구 예정액·N분의 1 실부담금·다중 통화 환산을 대시보드로 한눈에 확인하는 구독 관리 시스템.

## 주요 기능

- **구독 CRUD** — 서비스명·금액·결제일·카테고리·메모·색상 등록/수정/삭제
- **다중 통화** — KRW / USD / EUR 지원, frankfurter.app 환율 Redis 1일 캐시 + 원화 자동 환산
- **결제 수단 관리** — 카드·계좌이체·현금 등록, 카드별 월 청구 예정액 집계
- **N분의 1 공동 구독** — 멤버 수 입력 시 1인 실부담금 자동 계산
- **무료 체험 D-day 추적** — 체험 만료일 기반 D-day 뱃지, 합계에서 자동 제외
- **대시보드 통계** — 카테고리별 파이 차트, 월별 지출 추이 에어리어 차트
- **캘린더 뷰** — 결제일 기준 월간 달력, 목록/캘린더 뷰 토글
- **다크 모드** — 수동 토글, 전체 페이지 일관 적용
- **세션 인증** — Laravel Sanctum SPA 쿠키 방식, 세션 만료 자동 리다이렉트

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

| 그룹 | 엔드포인트 |
|------|-----------|
| 인증 | 회원가입 · 로그인 · 로그아웃 |
| 사용자 | 내 정보 조회 · 프로필 수정 · 비밀번호 변경 · 계정 삭제 |
| 구독 | CRUD · 상태 변경 · 통계 · 월별 이력 |
| 결제 수단 | CRUD |
| 환율 | 조회 (Redis 캐시) |

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
