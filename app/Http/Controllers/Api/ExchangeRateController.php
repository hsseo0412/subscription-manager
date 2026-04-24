<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ExchangeRateService;
use Illuminate\Http\JsonResponse;

class ExchangeRateController extends Controller
{
    public function __construct(
        private ExchangeRateService $service
    ) {}

    /**
     * GET /api/exchange-rates
     * 현재 환율 정보 반환 (KRW 기준, 1 외화 = N 원)
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => $this->service->getRates(),
        ]);
    }
}
