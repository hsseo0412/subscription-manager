---
template: plan
version: 1.3
feature: payment-calendar
date: 2026-04-27
author: hsseo0412
project: subscription-manager
status: Draft
---

# Plan: payment-calendar

## Executive Summary

| 관점 | 내용 |
| :--- | :--- |
| **Problem** | 대시보드 목록 뷰만으로는 "이번 달 몇 일에 뭐가 결제되는지" 한눈에 파악하기 어려움 |
| **Solution** | 대시보드에 목록/캘린더 뷰 토글 추가 — 월별 캘린더에 결제 예정 구독을 날짜 셀에 표시 |
| **UX Effect** | 결제일·서비스명·금액·카드 정보를 캘린더 형태로 시각화, 이번 달 지출 흐름을 직관적으로 파악 |
| **Core Value** | 구독 관리의 시간 축 가시성 확보 — "언제 얼마가 나가는가"를 즉시 인지 |

---

## Context Anchor

| 항목 | 내용 |
| :--- | :--- |
| **WHY** | 목록 뷰는 개별 구독 관리에 최적, 캘린더 뷰는 월간 지출 흐름 파악에 최적 — 두 뷰 병존 필요 |
| **WHO** | 매달 구독 결제가 여러 건인 사용자 (N개 이상 구독 관리) |
| **RISK** | 기존 Dashboard.jsx 비대화 — 뷰 분기 로직으로 컴포넌트 복잡도 증가 |
| **SUCCESS** | 캘린더 뷰에서 결제일별 구독 확인 가능, 목록 뷰와 동일 필터 상태 공유 |
| **SCOPE** | Frontend 전용 (새 API 불필요) — 기존 useSubscriptions 훅 데이터 재사용 |

---

## 1. 요구사항

### 기능 요구사항

| ID | 요구사항 | 우선순위 |
| :--- | :--- | :--- |
| F-01 | 대시보드 상단에 목록/캘린더 뷰 토글 버튼 추가 | 필수 |
| F-02 | 캘린더 뷰: 현재 월 기준 달력 그리드 렌더링 | 필수 |
| F-03 | 각 날짜 셀에 해당 billing_date 구독 카드 표시 (서비스명, 금액) | 필수 |
| F-04 | 구독 카드에 카드 정보(결제 수단) 표시 | 필수 |
| F-05 | 오늘 날짜 셀 하이라이트 | 필수 |
| F-06 | 이전/다음 월 이동 (← →) | 필수 |
| F-07 | cancelled 상태 구독은 캘린더에서 제외 (또는 흐리게) | 필수 |
| F-08 | 날짜 셀 구독 클릭 시 기존 수정 모달 오픈 | 선택 |
| F-09 | yearly 구독은 해당 billing_date 셀에 "연간" 뱃지 표시 | 선택 |

### 비기능 요구사항

- 새 API 엔드포인트 불필요 — 기존 `useSubscriptions()` 데이터 재사용
- 뷰 토글 상태는 컴포넌트 로컬 `useState` 관리 (URL 파라미터 불필요)
- 캘린더 외부 라이브러리 미사용 — 순수 Tailwind CSS 그리드로 구현
- 기존 다크모드 대응 (dark: 클래스 일관성 유지)
- 기존 상태 필터(전체/활성/일시정지/해지) 및 검색은 캘린더 뷰에도 동일 적용

---

## 2. 범위

### 신규 파일

| 파일 | 내용 |
| :--- | :--- |
| `frontend/src/components/CalendarView.jsx` | 달력 그리드 + 결제 셀 컴포넌트 |

### 수정 파일

| 파일 | 변경 내용 |
| :--- | :--- |
| `frontend/src/pages/Dashboard.jsx` | 뷰 토글 UI 추가, CalendarView 조건부 렌더링 |

### 변경 없는 파일

- Backend 전체 (API 변경 없음)
- `useSubscriptions.js`, `usePaymentMethods.js` (데이터 재사용)
- `SubscriptionModal.jsx` (수정 모달 재사용)

---

## 3. 기술 설계

### 캘린더 데이터 모델

```js
// billing_date(1~31) 기준으로 구독을 날짜 맵으로 그룹화
const subscriptionsByDay = subscriptions.reduce((acc, sub) => {
  if (sub.status === 'cancelled') return acc
  const day = sub.billing_date
  acc[day] = [...(acc[day] ?? []), sub]
  return acc
}, {})
```

### 캘린더 그리드 구조

```
<CalendarView month={currentMonth} year={currentYear}>
  <MonthHeader>  ← 2026년 4월  [← →]
  <WeekdayRow>   ← 일 월 화 수 목 금 토
  <DayGrid>
    <DayCell date={N}>
      {subscriptionsByDay[N]?.map(sub =>
        <SubscriptionChip name sub.name amount toKrw(sub.price) card />
      )}
    </DayCell>
    ...
  </DayGrid>
</CalendarView>
```

### 뷰 토글 위치 (Dashboard.jsx)

```
[HeroBand]
[Stats 요약 카드]
[검색 + 필터 탭]  ←── 기존 UI 유지
[  목록 | 캘린더  ]  ←── 뷰 토글 버튼 추가 (탭 우측)
[목록 뷰 OR 캘린더 뷰]  ←── 조건부 렌더링
```

### SubscriptionChip 표시 정보

| 항목 | 표시 방식 |
| :--- | :--- |
| 서비스명 | 색상 점 + 서비스명 (truncate) |
| 금액 | 원화 환산 금액 (외화는 ₩환산액) |
| 카드 | 결제 수단 이름 (없으면 생략) |
| 연간 구독 | `연간` 뱃지 |

---

## 4. 성공 기준

- [ ] 목록 → 캘린더 토글 시 현재 월 달력 렌더링
- [ ] 각 날짜 셀에 해당일 결제 구독 칩 표시 (서비스명 + 금액 + 카드)
- [ ] 오늘 날짜 셀 하이라이트
- [ ] 이전/다음 월 이동 정상 동작
- [ ] cancelled 구독 캘린더에서 제외
- [ ] 다크모드 정상 표시
- [ ] 기존 검색/필터 캘린더 뷰에도 반영

---

## 5. 리스크

| 리스크 | 대응 |
| :--- | :--- |
| 결제일 31일 → 월말일 처리 | 해당 월 마지막 날로 clamp (예: 2월은 28/29일) |
| 하루에 구독이 많을 때 셀 넘침 | 최대 3개 표시 후 "+N개" 접힘 처리 |
| Dashboard.jsx 비대화 | CalendarView를 별도 컴포넌트로 완전 분리 |
| 외화 금액 환율 미로드 시 | `toKrw` fallback(원가 그대로) 그대로 활용 |
