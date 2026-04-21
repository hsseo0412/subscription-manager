<?php

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->statefulApi();
    })
    ->withExceptions(function (Exceptions $exceptions): void {

        // 모든 예외를 로그로 기록
        $exceptions->report(function (Throwable $e) {
            Log::error('[Exception] ' . get_class($e) . ': ' . $e->getMessage(), [
                'file'    => $e->getFile() . ':' . $e->getLine(),
                'url'     => request()?->fullUrl(),
                'method'  => request()?->method(),
                'user_id' => request()?->user()?->id,
            ]);
        });

        // 인증 오류 → 401
        $exceptions->render(function (AuthenticationException $e, Request $request) {
            if ($request->expectsJson()) {
                Log::warning('[Auth] Unauthenticated', [
                    'url'    => $request->fullUrl(),
                    'method' => $request->method(),
                ]);
                return response()->json(['message' => '로그인이 필요합니다.'], 401);
            }
        });

        // 권한 오류 → 403
        $exceptions->render(function (AuthorizationException $e, Request $request) {
            if ($request->expectsJson()) {
                Log::warning('[Auth] Forbidden', [
                    'url'     => $request->fullUrl(),
                    'method'  => $request->method(),
                    'user_id' => $request->user()?->id,
                ]);
                return response()->json(['message' => '접근 권한이 없습니다.'], 403);
            }
        });

        // 그 외 서버 오류 → 500
        $exceptions->render(function (Throwable $e, Request $request) {
            if ($request->expectsJson()) {
                return response()->json(['message' => '서버 오류가 발생했습니다.'], 500);
            }
        });

    })->create();
