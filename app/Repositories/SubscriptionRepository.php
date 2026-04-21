<?php

namespace App\Repositories;

use App\Models\Subscription;
use Illuminate\Database\Eloquent\Collection;

class SubscriptionRepository
{
    /**
     * user_id로 구독 목록 조회 (billing_date 오름차순)
     *
     * @param int $userId
     * @return Collection
     */
    public function findByUser(int $userId): Collection
    {
        return Subscription::where('user_id', $userId)
            ->with('paymentMethod')
            ->orderBy('billing_date')
            ->get();
    }

    /**
     * 새 구독 레코드 생성
     *
     * @param array $data
     * @return Subscription
     */
    public function create(array $data): Subscription
    {
        return Subscription::create($data);
    }

    /**
     * 구독 레코드 수정 후 최신 상태 반환
     *
     * @param Subscription $subscription
     * @param array        $data
     * @return Subscription
     */
    public function update(Subscription $subscription, array $data): Subscription
    {
        $subscription->update($data);
        return $subscription->fresh();
    }

    /**
     * 구독 레코드 삭제
     *
     * @param Subscription $subscription
     * @return void
     */
    public function delete(Subscription $subscription): void
    {
        $subscription->delete();
    }
}
