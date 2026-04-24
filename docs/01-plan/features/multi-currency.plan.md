---
template: plan
version: 1.3
feature: multi-currency
date: 2026-04-24
author: hsseo0412
project: subscription-manager
status: Draft
---

# multi-currency Planning Document

> **Summary**: 구독 등록 시 KRW 외 USD/EUR 통화 선택 지원 — 환율 API(frankfurter.app) 하루 1회 Redis 캐시, 대시보드 합계는 항상 원화 기준
>
> **Project**: subscription-manager
> **Author**: hsseo0412
> **Date**: 2026-04-24
> **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 해외 구독 서비스(Netflix USD, Adobe EUR 등) 등록 시 통화 선택이 불가해 원화 금액으로 수동 환산해 입력해야 하는 불편함 |
| **Solution** | 구독에 currency 필드 추가, 무료 환율 API(frankfurter.app)를 하루 1회 Redis에 캐시하여 원화 자동 환산 |
| **Function/UX Effect** | 구독 등록 시 통화 선택 → 카드에 원가(USD 9.99) + 원화 환산가(₩13,800) 병행 표시 → 대시보드 합계는 항상 원화 기준 |
| **Core Value** | 해외 구독 서비스까지 정확히 추적 가능한 글로벌 구독 관리 도구로 확장 |

---

## Context Anchor

| Key | Value |
|-----|-------|
| **WHY** | 해외 구독(USD/EUR) 등록 시 수동 환산 불편 → 실제 지출 파악 어려움 |
| **WHO** | Netflix, Adobe, Spotify 등 해외 서비스 구독자 |
| **RISK** | frankfurter.app 외부 API 장애 시 환율 데이터 공백 발생 가능 → 캐시 만료 시 최후 저장 값 사용 |
| **SUCCESS** | USD/EUR 구독 카드에 원화 환산가 표시, 대시보드 monthly_total에 외화 구독 정확히 반영 |
| **SCOPE** | Phase 1: 백엔드(DB + 환율서비스 + 환산로직), Phase 2: 프론트(통화선택 UI + 카드표시) |

---

## 1. Overview

### 1.1 Purpose

구독 서비스 등록 시 KRW 이외의 통화(USD, EUR)를 선택할 수 있도록 하고, 외부 환율 API를 통해 원화로 자동 환산하여 대시보드의 합계 금액 및 통계에 정확히 반영한다.

### 1.2 Background

현재 `price` 컬럼은 원화(KRW)만 가정하고 설계되어 있다. 해외 서비스를 등록하는 사용자는 달러 금액을 직접 원화로 환산해 입력해야 하며, 환율 변동 시 업데이트가 필요하다. frankfurter.app은 완전 무료(API 키 불필요)이며 ECB(유럽중앙은행) 기준 환율을 제공한다.

### 1.3 Related Documents

- `app/Services/SubscriptionService.php` — 월 총액 계산 로직
- `app/Http/Requests/SubscriptionRequest.php` — 입력 검증
- `app/Models/Subscription.php` — 구독 모델
- `database/migrations/` — DB 마이그레이션
- `frontend/src/components/SubscriptionModal.jsx` — 구독 등록/수정 폼

---

## 2. Scope

### 2.1 In Scope

- [x] DB: `subscriptions` 테이블에 `currency` 컬럼 추가 (enum: KRW/USD/EUR, default: KRW)
- [x] `ExchangeRateService`: frankfurter.app API 호출 + Redis 캐시 (TTL 24h)
- [x] Artisan Command: `exchange-rates:fetch` — 환율 갱신 커맨드
- [x] Laravel Scheduler: 매일 오전 9시 자동 실행
- [x] `SubscriptionService`: `calcMonthlyTotal()`, `getStats()`, `getMonthlyHistory()` 원화 환산 적용
- [x] `GET /api/exchange-rates`: 현재 환율 정보 반환 (프론트 표시용)
- [x] `SubscriptionRequest`: currency 필드 검증 추가
- [x] 프론트 `SubscriptionModal`: 통화 선택 UI (KRW/USD/EUR)
- [x] 프론트 구독 카드: 외화 구독 시 원가 + 원화 환산가 병행 표시
- [x] 프론트 `useExchangeRates` 훅: 환율 조회 (TanStack Query)

### 2.2 Out of Scope

- JPY, GBP 등 기타 통화 지원 (추후 확장 고려 구조로만 설계)
- 환율 히스토리 저장 / 과거 환율로 재계산
- 사용자별 기준 통화 변경 (항상 KRW 기준)
- 실시간 환율 갱신 (하루 1회 캐시로 충분)

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | `subscriptions` 테이블에 `currency` 컬럼 추가 (KRW/USD/EUR, default KRW) | High | Pending |
| FR-02 | `ExchangeRateService`: frankfurter.app에서 USD→KRW, EUR→KRW 환율 조회 | High | Pending |
| FR-03 | 환율 데이터를 Redis에 24h TTL로 캐시 | High | Pending |
| FR-04 | Laravel Scheduler에서 매일 9시 환율 갱신 커맨드 실행 | High | Pending |
| FR-05 | `calcMonthlyTotal()`: currency별 환율 적용 후 원화 합산 | High | Pending |
| FR-06 | `getStats()`, `getMonthlyHistory()`: 동일하게 원화 환산 적용 | High | Pending |
| FR-07 | `GET /api/exchange-rates`: `{USD: 1380.5, EUR: 1510.3}` 형태 반환 | Medium | Pending |
| FR-08 | `SubscriptionRequest`: currency 필드 유효성 검증 (`in:KRW,USD,EUR`) | High | Pending |
| FR-09 | 구독 모달: 통화 선택 드롭다운 추가 (기본 KRW) | High | Pending |
| FR-10 | 구독 카드: USD/EUR 구독은 원가(USD 9.99) + 원화(₩13,800) 함께 표시 | Medium | Pending |
| FR-11 | API 장애 시 캐시된 최후 환율 사용 (fallback), 없으면 고정값 사용 | Medium | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| 가용성 | 환율 API 장애 시 기존 캐시 또는 fallback 환율로 서비스 유지 | 수동 테스트 (API 차단) |
| 성능 | 환율 조회: Redis 캐시 히트 시 1ms 이내 | Redis MONITOR |
| 정확성 | 환율 데이터: 매일 ECB 기준 최신값 사용 | 대조 확인 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] USD 통화로 구독 등록 시 저장 및 카드 표시 정상
- [ ] 대시보드 monthly_total에 USD/EUR 구독 원화 환산 반영됨
- [ ] Redis에 환율 캐시 저장 확인 (`docker compose exec redis redis-cli GET exchange_rates`)
- [ ] Laravel Scheduler에 `exchange-rates:fetch` 등록 확인
- [ ] 기존 KRW 구독 동작 이상 없음

### 4.2 Quality Criteria

- [ ] API 장애 시 fallback 환율로 정상 작동
- [ ] 브라우저 콘솔 에러 없음

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| frankfurter.app API 장애/서비스 종료 | High | Low | Redis TTL 초과 시 hardcoded fallback 환율 사용 (USD=1380, EUR=1500) |
| Redis 미실행 시 캐시 불가 | Medium | Low | Redis 미연결 시 매 요청마다 API 호출로 degraded 운영 |
| 환율 변동이 큰 경우 하루 1회로 부정확 | Low | Medium | 개인 구독 관리 수준에서 허용 범위 — 실시간 필요 없음 |
| 기존 데이터 currency 기본값 처리 | Medium | High | 마이그레이션 default 'KRW' 설정으로 기존 구독 모두 KRW 처리 |

---

## 6. Impact Analysis

### 6.1 Changed Resources

| Resource | Type | Change Description |
|----------|------|--------------------|
| `subscriptions` 테이블 | DB Schema | `currency` 컬럼 추가 (enum, default KRW) |
| `Subscription` 모델 | Model | `$fillable`, `$casts` currency 추가 |
| `SubscriptionService` | Service | 환율 적용 원화 환산 로직 추가 |
| `SubscriptionRequest` | Validation | currency 필드 검증 추가 |
| `api.php` | Route | `GET /api/exchange-rates` 엔드포인트 추가 |
| `SubscriptionModal.jsx` | Component | 통화 선택 UI 추가 |
| 구독 카드 컴포넌트 | Component | 외화 표시 로직 추가 |

### 6.2 Current Consumers

| Resource | Operation | Code Path | Impact |
|----------|-----------|-----------|--------|
| `calcMonthlyTotal()` | READ | `SubscriptionController::index()` | 환율 환산 로직 추가 — 기존 KRW는 동일 |
| `getStats()` | READ | `SubscriptionController::stats()` | 동일하게 원화 환산 적용 |
| `getMonthlyHistory()` | READ | `SubscriptionController::history()` | 동일하게 원화 환산 적용 |
| `SubscriptionRequest` | VALIDATE | `store()`, `update()` | currency 필드 추가 — 기존 필드 영향 없음 |

### 6.3 Verification

- [ ] 기존 KRW 구독 CRUD 정상 동작
- [ ] 기존 monthly_total 계산값 동일 (KRW 구독만 있을 때)
- [ ] 기존 차트/통계 데이터 정상 표시

---

## 7. Architecture Considerations

### 7.1 Project Level

**Dynamic** — 기존 Service/Repository 패턴 유지. 신규 Service 1개(`ExchangeRateService`), Command 1개 추가.

### 7.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| 환율 API | exchangerate-api.com / frankfurter.app / fixer.io | frankfurter.app | API 키 불필요, 완전 무료, ECB 기준으로 신뢰성 충분 |
| 환율 저장 위치 | Redis only / DB + Redis / 없음(매번 API) | Redis only (24h TTL) | DB 부담 없음, 스케줄러로 갱신 |
| price 저장 방식 | 원화 환산 후 저장 / 원래 통화 그대로 저장 | 원래 통화 그대로 저장 | 환율 변동 시 재계산 가능, 정보 손실 없음 |
| Fallback 환율 | 없음(에러) / hardcoded 기본값 | hardcoded 기본값 (USD=1380, EUR=1500) | 개인 구독 관리 수준에서 서비스 중단보다 부정확한 값이 낫다 |
| 환산 위치 | DB 저장 시 / API 응답 시 / 둘 다 | API 응답 시 (서비스 레이어) | DB 저장값 보존, 환율 업데이트 자동 반영 |

### 7.3 환율 API 상세

```
GET https://api.frankfurter.app/latest?from=USD&to=KRW,EUR
→ {"amount":1,"base":"USD","date":"2026-04-24","rates":{"EUR":0.887,"KRW":1380.5}}

GET https://api.frankfurter.app/latest?from=EUR&to=KRW
→ {"amount":1,"base":"EUR","date":"2026-04-24","rates":{"KRW":1506.2}}
```

Redis 저장 형식:
```json
{
  "rates": {"USD": 1380.5, "EUR": 1506.2},
  "date": "2026-04-24",
  "fetched_at": "2026-04-24T09:00:00Z"
}
```

---

## 8. Convention Prerequisites

### 8.1 적용 규칙

- Service 패턴: `app/Services/ExchangeRateService.php`
- Command: `app/Console/Commands/FetchExchangeRates.php`
- Controller: `app/Http/Controllers/Api/ExchangeRateController.php`
- 환율 캐시 키: `exchange_rates` (Redis)
- 마이그레이션: `YYYY_MM_DD_HHMMSS_add_currency_to_subscriptions_table.php`

### 8.2 환경변수 (추가 불필요)

frankfurter.app은 API 키 불필요. 별도 환경변수 추가 없음.

---

## 9. Implementation Order

### Phase 1 — 백엔드 (우선)
1. Migration: `currency` 컬럼 추가
2. `Subscription` 모델 업데이트
3. `SubscriptionRequest` currency 검증 추가
4. `ExchangeRateService` 구현 (API 호출 + Redis 캐시)
5. Artisan Command `exchange-rates:fetch` 구현
6. Scheduler 등록 (`app/Console/Kernel.php`)
7. `SubscriptionService` 환율 환산 로직 추가
8. `ExchangeRateController` + 라우트 추가

### Phase 2 — 프론트엔드
1. `useExchangeRates` 훅 구현
2. `SubscriptionModal` 통화 선택 UI 추가
3. 구독 카드 외화 표시 로직 추가

---

## 10. Next Steps

1. [ ] `/pdca do multi-currency` — 구현 시작
2. [ ] `/pdca analyze multi-currency` — 갭 분석

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-24 | Initial draft | hsseo0412 |
