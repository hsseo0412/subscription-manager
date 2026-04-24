<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ExchangeRateService
{
    private const CACHE_KEY = 'exchange_rates';
    private const CACHE_TTL = 86400; // 24h

    // API 장애 시 사용할 fallback 환율
    private const FALLBACK_RATES = [
        'USD' => 1380,
        'EUR' => 1500,
    ];

    /**
     * 환율 데이터 반환 (캐시 우선, 없으면 API 조회)
     * KRW 기준 1 외화 = N 원
     *
     * @return array<string, int>  ['USD' => 1380, 'EUR' => 1500]
     */
    public function getRates(): array
    {
        return Cache::remember(self::CACHE_KEY, self::CACHE_TTL, function () {
            return $this->fetchFromApi();
        });
    }

    /**
     * 외화 금액을 원화로 환산
     *
     * @param int    $amount   원래 통화 금액
     * @param string $currency KRW|USD|EUR
     * @return int 원화 환산 금액
     */
    public function toKrw(int $amount, string $currency): int
    {
        if ($currency === 'KRW') {
            return $amount;
        }

        $rates = $this->getRates();
        $rate  = $rates[$currency] ?? (self::FALLBACK_RATES[$currency] ?? 1);

        return (int) round($amount * $rate);
    }

    /**
     * frankfurter.app API에서 USD/EUR → KRW 환율 조회
     * 실패 시 fallback 환율 반환
     *
     * @return array<string, int>
     */
    public function fetchFromApi(): array
    {
        try {
            $response = Http::timeout(5)->get('https://api.frankfurter.app/latest', [
                'from' => 'USD',
                'to'   => 'KRW,EUR',
            ]);

            if (!$response->successful()) {
                Log::warning('[ExchangeRate] API 응답 실패, fallback 사용', ['status' => $response->status()]);
                return self::FALLBACK_RATES;
            }

            $data  = $response->json();
            $rates = $data['rates'] ?? [];

            $usdToKrw = isset($rates['KRW']) ? (int) round($rates['KRW']) : self::FALLBACK_RATES['USD'];

            // EUR→KRW = USD→KRW / USD→EUR
            $eurToKrw = (isset($rates['EUR']) && $rates['EUR'] > 0)
                ? (int) round($usdToKrw / $rates['EUR'])
                : self::FALLBACK_RATES['EUR'];

            return ['USD' => $usdToKrw, 'EUR' => $eurToKrw];
        } catch (\Throwable $e) {
            Log::warning('[ExchangeRate] API 호출 예외, fallback 사용', ['error' => $e->getMessage()]);
            return self::FALLBACK_RATES;
        }
    }

    /**
     * 캐시를 초기화하고 최신 환율로 갱신
     *
     * @return array<string, int>
     */
    public function refresh(): array
    {
        Cache::forget(self::CACHE_KEY);
        $rates = $this->fetchFromApi();
        Cache::put(self::CACHE_KEY, $rates, self::CACHE_TTL);

        return $rates;
    }
}
