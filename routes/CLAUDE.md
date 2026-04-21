# API 엔드포인트 레퍼런스

## 기본 정보
- Base URL: `http://localhost:8080/api`
- 인증 방식: Sanctum SPA 쿠키 (세션 기반)
- 요청 헤더: `Accept: application/json`, `X-Requested-With: XMLHttpRequest`
- 응답 형식: `{ "data": ..., "message": "..." }`

## 인증 API

### POST /api/auth/register
회원가입
```json
// Request
{ "name": "홍길동", "email": "user@example.com", "password": "password", "password_confirmation": "password" }

// Response 201
{ "data": { "id": 1, "name": "홍길동", "email": "user@example.com" }, "message": "회원가입이 완료되었습니다." }
```

### POST /api/auth/login
로그인 (요청 전 /sanctum/csrf-cookie 호출 필요)
```json
// Request
{ "email": "user@example.com", "password": "password" }

// Response 200
{ "data": { "id": 1, "name": "홍길동", "email": "user@example.com" }, "message": "로그인되었습니다." }
```

### POST /api/auth/logout `[인증 필요]`
로그아웃
```json
// Response 200
{ "message": "로그아웃되었습니다." }
```

## 사용자 API

### GET /api/user `[인증 필요]`
현재 로그인 사용자 정보 반환
```json
// Response 200
{ "data": { "id": 1, "name": "홍길동", "email": "user@example.com" } }
```

### PATCH /api/user/profile `[인증 필요]`
프로필 수정
```json
// Request
{ "name": "홍길동", "email": "new@example.com" }

// Response 200
{ "data": { ... }, "message": "프로필이 업데이트되었습니다." }
```

### DELETE /api/user `[인증 필요]`
계정 삭제
```json
// Request
{ "password": "현재비밀번호" }

// Response 200
{ "message": "계정이 삭제되었습니다." }
```

## 구독 API `[인증 필요]`

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/subscriptions` | 목록 조회 (monthly_total 포함) |
| POST | `/api/subscriptions` | 등록 → 201 |
| PUT | `/api/subscriptions/{id}` | 수정 (타인 403) → 200 |
| DELETE | `/api/subscriptions/{id}` | 삭제 (타인 403) → 200 |

### 필드 명세
| 필드 | 타입 | 필수 | 비고 |
|------|------|------|------|
| `name` | string | ✅ | 최대 255자 |
| `price` | integer | ✅ | 원 단위, 0 이상 |
| `billing_cycle` | enum | ✅ | `monthly` / `yearly` |
| `billing_date` | integer | ✅ | 1~31 |
| `category` | string | - | |
| `color` | string | - | 예: `#E50914` |
| `memo` | string | - | 최대 500자 |

`monthly_total`: monthly는 price 합산, yearly는 price/12 반올림 후 합산

## 신규 라우트 추가 규칙
- 인증 불필요: `Route::post('...', [...])` (api.php 상단 그룹)
- 인증 필요: `Route::middleware('auth:sanctum')->group(...)` 내부에 추가
- 컨트롤러: `app/Http/Controllers/Api/` 에 생성
- 외부 노출 엔드포인트에 브루트포스 위험이 있으면 `throttle:auth` 미들웨어 적용 (AppServiceProvider에서 limiter 정의)