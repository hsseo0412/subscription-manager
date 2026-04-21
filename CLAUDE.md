# Subscription Manager

## 프로젝트 개요
Laravel 12 (API 서버) + React (SPA) 구성의 구독 관리 시스템.
사용자가 구독 중인 서비스를 등록/관리하고, 카드별 청구 예정액과
N분의 1 실부담금을 대시보드로 확인할 수 있다.

## 기술 스택
- Backend: Laravel 12, PHP 8.4, MySQL 8, Redis
- Frontend: React + Vite (`/frontend` 디렉터리 독립 실행, port 5173)
- 인증: Laravel Sanctum (SPA 쿠키 기반)
- 스타일: Tailwind CSS v3
- 상태관리: Zustand / TanStack Query

## 아키텍처
- Laravel은 순수 API 서버 (`/api/*`)
- React SPA는 Vite proxy로 `/api`, `/sanctum` 요청을 `localhost:8080`으로 전달
- Service/Repository 패턴 (신규 기능부터 적용)
- API 응답 형식: `{ "data": ..., "message": "..." }`

## 개발 환경 실행
```bash
# 백엔드 (Docker)
docker compose up -d

# 프론트엔드
cd frontend && npm run dev   # http://localhost:5173
```

## 세부 가이드 (서브 CLAUDE.md)
- @app/CLAUDE.md — 백엔드 컨트롤러/Service/Repository/Validation 규칙
- @frontend/CLAUDE.md — 프론트엔드 컴포넌트/상태관리/API 호출 규칙
- @database/CLAUDE.md — 마이그레이션/테이블 네이밍/DB 운영 규칙
- @routes/CLAUDE.md — 전체 API 엔드포인트 레퍼런스
- @docker/CLAUDE.md — Docker 서비스 구성 및 명령어

## 전역 개발 규칙
- `.env`는 절대 수정하지 말 것
- 커밋 메시지는 Conventional Commits 형식 + 한국어 설명
- **커밋/푸시는 사용자 확인 후에만 실행** — 구현 완료 후 반드시 먼저 물어볼 것

### 커밋 메시지 형식
```
타입: 한국어 설명

예) feat: 구독 등록 API 추가
    fix: 로그인 세션 만료 오류 수정
```

| 타입 | 용도 |
| :--- | :--- |
| `feat:` | 새 기능 |
| `fix:` | 버그 수정 |
| `refactor:` | 동작 변화 없는 코드 개선 |
| `chore:` | 설정, 의존성, 문서 등 |
| `style:` | 포맷/공백 등 코드 스타일 |
