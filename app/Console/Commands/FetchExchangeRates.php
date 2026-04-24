<?php

namespace App\Console\Commands;

use App\Services\ExchangeRateService;
use Illuminate\Console\Command;

class FetchExchangeRates extends Command
{
    protected $signature   = 'exchange-rates:fetch';
    protected $description = 'frankfurter.app에서 환율을 조회하고 Redis에 캐시합니다.';

    public function __construct(
        private ExchangeRateService $service
    ) {
        parent::__construct();
    }

    /**
     * 환율 갱신 커맨드 실행
     *
     * @return int
     */
    public function handle(): int
    {
        $rates = $this->service->refresh();

        $this->info('[ExchangeRate] 환율 갱신 완료');
        foreach ($rates as $currency => $krw) {
            $this->line("  {$currency} → ₩" . number_format($krw));
        }

        return Command::SUCCESS;
    }
}
