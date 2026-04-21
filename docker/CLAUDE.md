# Docker 환경 가이드

## 서비스 구성
| 서비스 | 이미지 | 포트 | 설명 |
|--------|--------|------|------|
| app | php:8.4-fpm (custom) | - | Laravel PHP-FPM |
| nginx | nginx:alpine | 8080:80 | 웹서버 |
| mysql | mysql:8.0 | 3306:3306 | DB |
| redis | redis:alpine | 6379:6379 | 캐시/세션/큐 |

## 주요 명령어
```bash
# 컨테이너 시작/중지
docker compose up -d
docker compose down

# Laravel Artisan
docker compose exec app php artisan migrate
docker compose exec app php artisan db:seed
docker compose exec app php artisan cache:clear
docker compose exec app php artisan config:clear
docker compose exec app php artisan route:list

# 컨테이너 내부 접속
docker compose exec app bash
docker compose exec mysql mysql -u laravel -p

# 로그 확인
docker compose logs -f app
docker compose logs -f nginx
```

## 설정 파일 위치
- PHP 설정: `docker/php/php.ini`
- PHP Dockerfile: `docker/php/Dockerfile`
- Nginx 설정: `docker/nginx/default.conf`

## 주의 사항
- Docker 설정 파일 수정 후 `docker compose build app` 재빌드 필요
- MySQL 포트(3306)는 로컬과 충돌 가능 — 로컬 MySQL 실행 중이면 중지 필요
- Redis 인증 없음 (개발 환경 전용)