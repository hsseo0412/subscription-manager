<?php

namespace App\Services;

use App\Models\Subscription;
use App\Repositories\SubscriptionRepository;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;

class SubscriptionService
{
    public function __construct(
        private SubscriptionRepository $repository
    ) {}

    /**
     * 로그인한 사용자의 구독 목록 반환
     *
     * @param int         $userId
     * @param string|null $status active|paused|cancelled|null(전체)
     * @return Collection
     */
    public function getUserSubscriptions(int $userId, ?string $status = null): Collection
    {
        return $this->repository->findByUser($userId, $status);
    }

    /**
     * 새 구독 생성 (user_id를 data에 병합하여 저장)
     *
     * @param int   $userId
     * @param array $data
     * @return Subscription
     */
    public function create(int $userId, array $data): Subscription
    {
        return $this->repository->create([...$data, 'user_id' => $userId]);
    }

    /**
     * 구독 정보 수정
     *
     * @param Subscription $subscription
     * @param array        $data
     * @return Subscription
     */
    public function update(Subscription $subscription, array $data): Subscription
    {
        return $this->repository->update($subscription, $data);
    }

    /**
     * 구독 상태 변경
     *
     * @param Subscription $subscription
     * @param string       $status
     * @return Subscription
     */
    public function updateStatus(Subscription $subscription, string $status): Subscription
    {
        return $this->repository->updateStatus($subscription, $status);
    }

    /**
     * 구독 삭제
     *
     * @param Subscription $subscription
     * @return void
     */
    public function delete(Subscription $subscription): void
    {
        $this->repository->delete($subscription);
    }

    /**
     * 월 환산 총 구독료 계산
     * active 구독만 포함, N분의 1 실부담금 기준
     *
     * @param Collection $subscriptions
     * @return int
     */
    public function calcMonthlyTotal(Collection $subscriptions): int
    {
        return (int) $subscriptions
            ->filter(fn(Subscription $sub) => $sub->status === 'active')
            ->sum(function (Subscription $sub) {
                $base = $sub->billing_cycle === 'yearly'
                    ? (int) round($sub->price / 12)
                    : $sub->price;
                return (int) round($base / max(1, $sub->members));
            });
    }

    /**
     * 결제일까지 남은 일수 계산 (0 = 오늘)
     *
     * @param int $billingDate 1~31
     * @return int
     */
    public function calcDaysUntilBilling(int $billingDate): int
    {
        $today = Carbon::today();
        $year  = $today->year;
        $month = $today->month;

        // 이번 달 결제일 (말일 초과 시 해당 월 마지막 날로 조정)
        $daysInMonth  = $today->daysInMonth;
        $effectiveDay = min($billingDate, $daysInMonth);

        if ($effectiveDay >= $today->day) {
            $next = Carbon::createFromDate($year, $month, $effectiveDay);
        } else {
            // 다음 달
            $nextMonth       = $today->copy()->addMonth();
            $daysInNextMonth = $nextMonth->daysInMonth;
            $effectiveDay    = min($billingDate, $daysInNextMonth);
            $next            = Carbon::createFromDate($nextMonth->year, $nextMonth->month, $effectiveDay);
        }

        return (int) $today->diffInDays($next);
    }

    /**
     * 구독 컬렉션에 days_until_billing 속성 추가
     *
     * @param Collection $subscriptions
     * @return Collection
     */
    public function appendDdays(Collection $subscriptions): Collection
    {
        return $subscriptions->each(function (Subscription $sub) {
            $sub->setAttribute('days_until_billing', $this->calcDaysUntilBilling($sub->billing_date));
        });
    }

    /**
     * 카테고리별 지출 통계 반환 (활성 구독 기준)
     *
     * @param int $userId
     * @return array{category_breakdown: array, monthly_total: int, annual_forecast: int}
     */
    public function getStats(int $userId): array
    {
        $subscriptions = $this->repository->findActiveByUser($userId);

        $breakdown = [];
        $monthlyTotal = 0;

        foreach ($subscriptions as $sub) {
            $base = $sub->billing_cycle === 'yearly'
                ? (int) round($sub->price / 12)
                : $sub->price;
            $cost = (int) round($base / max(1, $sub->members));

            $category = ($sub->category !== null && $sub->category !== '') ? $sub->category : '기타';

            if (!isset($breakdown[$category])) {
                $breakdown[$category] = 0;
            }
            $breakdown[$category] += $cost;
            $monthlyTotal += $cost;
        }

        $categoryBreakdown = array_map(
            fn($name, $cost) => ['name' => $name, 'monthly_cost' => $cost],
            array_keys($breakdown),
            array_values($breakdown)
        );

        return [
            'category_breakdown' => array_values($categoryBreakdown),
            'monthly_total'      => $monthlyTotal,
            'annual_forecast'    => $monthlyTotal * 12,
        ];
    }
}