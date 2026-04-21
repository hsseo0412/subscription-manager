# Plan: subscription-crud

## Executive Summary

| 관점 | 내용 |
| :--- | :--- |
| **Problem** | 로그인 후 대시보드가 빈 화면 — 앱의 핵심 기능인 구독 관리가 없음 |
| **Solution** | 구독 CRUD API + 대시보드 UI 구현으로 실사용 가능한 상태로 완성 |
| **UX Effect** | 구독 등록/수정/삭제 + 월 총 구독료 요약 카드로 한눈에 현황 파악 |
| **Core Value** | 포트폴리오 핵심 도메인 기능 완성, 실제 서비스 수준의 CRUD 흐름 |

---

## Context Anchor

| 항목 | 내용 |
| :--- | :--- |
| **WHY** | 대시보드 빈 화면 해결, 앱 핵심 기능 구현 |
| **WHO** | 구독 서비스를 관리하려는 사용자 |
| **RISK** | Service/Repository 패턴 첫 도입 — 구조 일관성 유지 필요 |
| **SUCCESS** | 구독 등록 후 목록 실시간 반영, 요약 카드 금액 정확히 계산 |
| **SCOPE** | Backend 7개 파일 + Frontend 3개 파일 신규/수정 |

---

## 1. 요구사항

### 기능 요구사항

| ID | 요구사항 | 우선순위 |
| :--- | :--- | :--- |
| F-01 | 구독 목록 조회 (로그인 사용자 소유 데이터만) | 필수 |
| F-02 | 구독 등록 (서비스명, 금액, 결제 주기, 결제일, 카테고리) | 필수 |
| F-03 | 구독 수정 | 필수 |
| F-04 | 구독 삭제 | 필수 |
| F-05 | 대시보드 요약 카드 (이번 달 총 구독료, 구독 수) | 필수 |
| F-06 | 구독 추가/수정 모달 (React Hook Form + Zod) | 필수 |
| F-07 | 카테고리 컬러 뱃지 표시 | 선택 |
| F-08 | 메모 필드 | 선택 |

### 비기능 요구사항

- Controller → Service → Repository 패턴 준수
- API 응답 형식: `{ "data": ..., "message": "..." }`
- 서버 유효성 에러 422 → 프론트 필드별 인라인 표시
- TanStack Query로 서버 상태 관리 (목록 캐싱 + 낙관적 업데이트)

---

## 2. 범위

### Backend 신규 파일

| 파일 | 내용 |
| :--- | :--- |
| `database/migrations/XXXX_create_subscriptions_table.php` | subscriptions 테이블 |
| `app/Models/Subscription.php` | 모델 + fillable + 관계 |
| `app/Repositories/SubscriptionRepository.php` | DB 접근 레이어 |
| `app/Services/SubscriptionService.php` | 비즈니스 로직 |
| `app/Http/Controllers/Api/SubscriptionController.php` | CRUD API |
| `app/Http/Requests/SubscriptionRequest.php` | 유효성 검사 |

### Backend 수정 파일

| 파일 | 내용 |
| :--- | :--- |
| `routes/api.php` | 구독 라우트 추가 |

### Frontend 신규/수정 파일

| 파일 | 내용 |
| :--- | :--- |
| `frontend/src/hooks/useSubscriptions.js` | TanStack Query CRUD 훅 |
| `frontend/src/components/SubscriptionModal.jsx` | 등록/수정 모달 |
| `frontend/src/pages/Dashboard.jsx` | 요약 카드 + 구독 목록 UI |

---

## 3. 기술 설계

### DB 스키마 — subscriptions

```
id                bigIncrements
user_id           foreignId → users
name              string(100)          서비스명
price             unsignedInteger      월 금액 (원)
billing_cycle     enum(monthly,yearly) 결제 주기
billing_date      unsignedTinyInteger  결제일 (1~31)
category          string(50) nullable  카테고리
color             string(7) nullable   HEX 색상 (#RRGGBB)
memo              text nullable
timestamps
```

### API 엔드포인트

| Method | URL | 설명 |
| :--- | :--- | :--- |
| GET | `/api/subscriptions` | 목록 조회 |
| POST | `/api/subscriptions` | 등록 |
| PUT | `/api/subscriptions/{id}` | 수정 |
| DELETE | `/api/subscriptions/{id}` | 삭제 |

### 레이아웃 구조 (Dashboard)

```
<Navbar>
<main>
  <요약 카드 영역>
    [이번 달 총 구독료]  [구독 서비스 수]
  </요약 카드 영역>
  <구독 목록>
    [구독 카드 (이름, 금액, 결제일, 카테고리 뱃지)]
    ...
    [+ 구독 추가 버튼]
  </구독 목록>
</main>
<SubscriptionModal />  // 등록/수정 공용
```

---

## 4. 성공 기준

- [ ] `GET /api/subscriptions` — 본인 구독만 반환
- [ ] `POST /api/subscriptions` — 등록 후 목록에 즉시 반영
- [ ] 수정/삭제 후 목록 실시간 갱신
- [ ] 요약 카드: monthly 합산 + yearly/12 환산 합계 표시
- [ ] 422 에러 시 모달 내 필드별 에러 표시

---

## 5. 리스크

| 리스크 | 대응 |
| :--- | :--- |
| yearly 구독 월 환산 방식 | price/12 반올림으로 통일 |
| 타 사용자 데이터 접근 | Repository에서 user_id 필터 필수 |
