<?php

use App\Http\Controllers\Api\PaymentMethodController;
use App\Http\Controllers\Api\SubscriptionController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\ProfileController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


Route::prefix('auth')->middleware('throttle:auth')->group(function () {
    Route::post('register', [RegisteredUserController::class, 'store']);
    Route::post('login', [AuthenticatedSessionController::class, 'store']);

    Route::middleware('auth:sanctum')->post('logout', [AuthenticatedSessionController::class, 'destroy']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('user', function (Request $request) {
        return response()->json(['data' => $request->user()]);
    });

    Route::patch('user/profile', [ProfileController::class, 'update']);
    Route::delete('user', [ProfileController::class, 'destroy']);

    Route::apiResource('subscriptions', SubscriptionController::class)->only([
        'index', 'store', 'update', 'destroy',
    ]);

    Route::apiResource('payment-methods', PaymentMethodController::class)->only([
        'index', 'store', 'update', 'destroy',
    ]);

    Route::patch('user/password', [ProfileController::class, 'updatePassword']);
});
