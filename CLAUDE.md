# Subscription Manager

## 프로젝트 개요
Laravel 12 (API 서버) + React (SPA) 구성의 구독 관리 시스템.
사용자가 구독 중인 서비스를 등록/관리하고, 카드별 청구 예정액과
N분의 1 실부담금을 대시보드로 확인할 수 있다.

## 기술 스택
- Backend: Laravel 12, PHP 8.4, MySQL 8, Redis
- Frontend: React + Vite (별도 디렉터리 /frontend)
- 인증: Laravel Sanctum (SPA)
- 스타일: Tailwind CSS
- 상태관리: Zustand
- 서버상태: TanStack Query

## 아키텍처
- Laravel은 순수 API 서버 (/api/*)
- React는 /frontend 디렉터리에서 독립 실행 (port 5173)
- Service/Repository 패턴 사용
- API 응답 형식 통일 (ApiResponse)

## 디렉터리 구조
app/
├── Http/Controllers/Api/
├── Services/
├── Repositories/
└── Models/
frontend/
├── src/
│   ├── pages/
│   ├── components/
│   ├── hooks/
│   └── stores/

## 개발 규칙
- .env는 절대 수정하지 말 것
- 마이그레이션 롤백 전에 반드시 확인
- 한국어 validation 메시지 사용
- API 응답은 항상 ApiResponse 사용
- 커밋 메시지는 한국어로