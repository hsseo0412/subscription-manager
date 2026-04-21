# Plan: auth-page-redesign

## Executive Summary

| 관점 | 내용 |
| :--- | :--- |
| **Problem** | 현재 로그인/회원가입 페이지가 기본 기능만 구현되어 있어 모바일 UX 및 포트폴리오 완성도가 낮음 |
| **Solution** | React Hook Form + Zod 기반 중앙 카드 레이아웃으로 모던 인증 UX 구현 |
| **UX Effect** | 실시간 유효성 검사, 비밀번호 토글, 소셜 로그인 UI, 모바일 퍼스트 반응형 대응 |
| **Core Value** | 실제 서비스 수준의 인증 UX로 포트폴리오 완성도 향상 |

---

## Context Anchor

| 항목 | 내용 |
| :--- | :--- |
| **WHY** | 포트폴리오 완성도 향상 및 모던 인증 UX 제공 |
| **WHO** | 구독 관리 앱 사용자 (모바일 포함) |
| **RISK** | React Hook Form/Zod 패키지 추가로 번들 크기 소폭 증가 |
| **SUCCESS** | 모바일/데스크탑 모두 자연스러운 레이아웃, 유효성 검사 즉시 피드백 |
| **SCOPE** | frontend/src/pages/auth/ 2개 파일 + package.json |

---

## 1. 요구사항

### 기능 요구사항

| ID | 요구사항 | 우선순위 |
| :--- | :--- | :--- |
| F-01 | 중앙 카드 레이아웃 (반응형, 모바일 퍼스트) | 필수 |
| F-02 | React Hook Form + Zod 폼 관리로 교체 | 필수 |
| F-03 | 비밀번호 표시/숨김 토글 (눈 아이콘) | 필수 |
| F-04 | 실시간 유효성 검사 (이메일 형식, 비밀번호 강도) | 필수 |
| F-05 | Google 소셜 로그인 버튼 UI (실제 연동 제외) | 선택 |
| F-06 | 비밀번호 찾기 링크 (페이지는 추후 구현) | 선택 |
| F-07 | 로딩 중 버튼 비활성화 + 스피너 | 필수 |
| F-08 | API 에러 인라인 표시 (서버 422 응답 처리) | 필수 |

### 비기능 요구사항

- 모바일 (375px) ~ 데스크탑 (1280px) 자연스러운 반응형
- 기존 백엔드 API 변경 없음 (`/api/auth/login`, `/api/auth/register`)
- 기존 `useAuth` 훅 인터페이스 유지

---

## 2. 범위

### 수정 파일

| 파일 | 변경 내용 |
| :--- | :--- |
| `frontend/src/pages/auth/Login.jsx` | 전면 재작성 |
| `frontend/src/pages/auth/Register.jsx` | 전면 재작성 |
| `frontend/package.json` | react-hook-form, zod, @hookform/resolvers 추가 |

### 제외 범위

- 백엔드 API 변경 없음
- 비밀번호 찾기 실제 기능 구현 제외 (링크 UI만)
- 소셜 로그인 실제 연동 제외 (버튼 UI만)
- `useAuth.js`, `authStore.js`, `axios.js` 변경 없음

---

## 3. 기술 설계 요약

### 패키지 추가

```bash
npm install react-hook-form zod @hookform/resolvers
```

### Zod 스키마 (공통)

```js
// 로그인
const loginSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다.'),
  password: z.string().min(1, '비밀번호를 입력해주세요.'),
})

// 회원가입
const registerSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요.').max(50),
  email: z.string().email('올바른 이메일 형식이 아닙니다.'),
  password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다.'),
  password_confirmation: z.string(),
}).refine((d) => d.password === d.password_confirmation, {
  message: '비밀번호가 일치하지 않습니다.',
  path: ['password_confirmation'],
})
```

### 레이아웃 구조

```
<전체 화면 배경>
  <중앙 카드 (max-w-md, shadow, rounded-2xl)>
    <로고 + 타이틀>
    <Google 버튼> (UI only)
    <구분선 "또는">
    <폼 필드들>
    <제출 버튼>
    <하단 링크 (비밀번호 찾기 / 페이지 이동)>
  </중앙 카드>
</전체 화면 배경>
```

---

## 4. 성공 기준

- [ ] 모바일(375px)에서 스크롤 없이 자연스럽게 표시
- [ ] 이메일 형식 오류 시 즉시 피드백 (onBlur 또는 onChange)
- [ ] 비밀번호 토글로 표시/숨김 전환 가능
- [ ] 로그인/회원가입 API 연동 정상 작동 유지
- [ ] 서버 유효성 오류(422) 필드별 인라인 표시

---

## 5. 리스크

| 리스크 | 대응 |
| :--- | :--- |
| react-hook-form 도입으로 기존 에러 처리 방식 변경 | 서버 에러는 `setError()` 로 수동 주입 |
| Zod 스키마와 서버 유효성 불일치 | 클라이언트는 UX용, 서버 검사가 최종 기준 |
