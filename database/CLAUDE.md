# Database 개발 가이드

## 마이그레이션 규칙
- 마이그레이션 롤백 전에 반드시 데이터 영향도 확인
- 파일명: `YYYY_MM_DD_HHMMSS_동사_테이블명_컬럼명.php`
- 컬럼 추가/수정은 새 마이그레이션 파일로 (기존 파일 수정 금지)

```bash
# 마이그레이션 실행
docker compose exec app php artisan migrate

# 롤백 (주의: 데이터 손실 가능)
docker compose exec app php artisan migrate:rollback
```

## 테이블 네이밍
- 테이블명: snake_case 복수형 (`subscriptions`, `payment_cards`)
- 피벗 테이블: 두 테이블명 알파벳순 조합 (`card_subscription`)
- 인덱스명: `테이블명_컬럼명_index`

## 컬럼 규칙
- PK: `id` (bigIncrements)
- 외래키: `{참조테이블단수}_id` (예: `user_id`, `card_id`)
- 타임스탬프: `timestamps()` 항상 포함
- 소프트삭제 필요 시: `softDeletes()`
- 금액 컬럼: `unsignedInteger` 또는 `decimal(10, 2)` (float 사용 금지)

## 주요 테이블 (구현 예정)
| 테이블 | 설명 |
|--------|------|
| users | 사용자 |
| subscriptions | 구독 서비스 |
| payment_cards | 결제 카드 |
| card_subscription | 카드-구독 피벗 |

## Seeder
- 개발용 더미 데이터는 `DatabaseSeeder.php`에서 호출
- Factory 파일은 `database/factories/` 에 작성

```bash
docker compose exec app php artisan db:seed
```