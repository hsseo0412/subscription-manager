# Frontend 개발 가이드

## 디렉터리 규칙
```
src/
├── pages/        ← 라우트와 1:1 매핑되는 페이지 컴포넌트
│   └── auth/     ← 인증 관련 페이지
├── components/   ← 재사용 UI 컴포넌트
│   └── ui/       ← 버튼, 인풋 등 기본 UI
├── hooks/        ← 커스텀 훅 (use 접두어 필수)
├── stores/       ← Zustand 전역 상태
└── lib/          ← axios 등 외부 라이브러리 설정
```

## API 호출 규칙
- 반드시 `src/lib/axios.js`의 `api` 인스턴스 사용 (직접 axios import 금지)
- 인증이 필요한 첫 요청 전에 `getCsrfCookie()` 호출 (login/register)
- 에러 처리: 422 → `err.response.data.errors`, 401 → 로그인 페이지 이동

```js
import api, { getCsrfCookie } from '../lib/axios'

await getCsrfCookie()
const { data } = await api.post('/api/auth/login', credentials)
```

## 상태 관리
- **서버 데이터** (API 응답) → TanStack Query (`useQuery`, `useMutation`)
- **클라이언트 전역 상태** (유저 정보 등) → Zustand (`src/stores/`)
- 컴포넌트 로컬 상태 → `useState`

## 인증 상태
- 유저 정보는 `useAuthStore` (Zustand, localStorage persist)
- 인증 훅은 `src/hooks/useAuth.js` 사용
- PrivateRoute / GuestRoute는 `src/App.jsx`에서 관리

## 컴포넌트 규칙
- 파일명 PascalCase, 함수명 PascalCase
- default export 사용
- props 타입이 복잡하면 상단에 JSDoc 주석
- Tailwind CSS만 사용 (인라인 style 금지)

## 라우팅
- React Router v6 사용
- 라우트 정의는 `src/App.jsx`에서 중앙 관리
- 인증 필요 페이지 → `<PrivateRoute>` 래핑
- 비로그인 전용 페이지 → `<GuestRoute>` 래핑
