# Backend 개발 가이드

## 컨트롤러 규칙
- 신규 API 컨트롤러는 반드시 `app/Http/Controllers/Api/` 에 생성
- 반환 타입은 항상 `JsonResponse`
- 응답 형식: `{ "data": ..., "message": "..." }`
- 성공: 200/201, 유효성 오류: 422, 인증 오류: 401, 권한 오류: 403
- 모든 public 메서드 위에 PHPDoc 블록으로 **라우트 주소**와 **기능 설명** 필수

```php
/**
 * POST /api/auth/register
 * 신규 사용자 회원가입 처리 및 자동 로그인
 *
 * @param Request $request
 * @return JsonResponse
 */
public function store(Request $request): JsonResponse
{
    ...
}

/**
 * GET /api/subscriptions
 * 로그인한 사용자의 구독 목록 반환
 *
 * @param Request $request
 * @return JsonResponse
 */
public function index(Request $request): JsonResponse
{
    ...
}

// 응답 예시
return response()->json(['data' => $resource, 'message' => '생성되었습니다.'], 201);
return response()->json(['message' => '삭제되었습니다.']);
```

## Service / Repository 패턴
- 비즈니스 로직 → `app/Services/{Domain}Service.php`
- DB 접근 → `app/Repositories/{Domain}Repository.php`
- 컨트롤러는 Service만 호출, DB 직접 접근 금지

```
Controller → Service → Repository → Model
```

## Validation
- 메시지는 한국어로 작성
- Form Request 클래스 사용 (`app/Http/Requests/`)
- `messages()` 메서드에서 한국어 오류 메시지 반환

```php
public function messages(): array
{
    return [
        'email.required' => '이메일을 입력해주세요.',
        'email.unique'   => '이미 사용 중인 이메일입니다.',
    ];
}
```

## 인증
- Laravel Sanctum SPA 쿠키 기반 인증
- 보호된 라우트에 `auth:sanctum` 미들웨어 사용
- 프론트에서 요청 전 `/sanctum/csrf-cookie` 호출 필요

## 모델
- `$fillable` 명시 필수
- 관계 메서드는 camelCase (hasMany, belongsTo 등)
- `$casts` 배열로 타입 캐스팅 명시
