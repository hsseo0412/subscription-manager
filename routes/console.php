<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// 매일 오전 9시 환율 갱신 (ECB 기준 전일 종가 반영)
Schedule::command('exchange-rates:fetch')->dailyAt('09:00');
