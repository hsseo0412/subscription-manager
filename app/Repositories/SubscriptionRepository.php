<?php

namespace App\Repositories;

use App\Models\Subscription;
use Illuminate\Database\Eloquent\Collection;

class SubscriptionRepository
{
    /**
     * user_id로 구독 목록 조회 (billing_date 오름차순)
     * status 파라미터가 있으면 해당 상태만 필터링
     *
     * @param int         $userId
     * @param string|null $status active|paused|cancelled
     * @return Collection
     */
    public function findByUser(int $userId, ?string $status = null): Collection
    {
        return Subscription::where('user_id', $userId)
            ->when($status !== null, fn($q) => $q->where('status', $status))
            ->with('paymentMethod')
            ->orderBy('billing_date')
            ->get();
    }

    /**
     * user_id로 활성(active) 구독만 조회 — 통계 전용
     *
     * @param int $userId
     * @return Collection
     */
    public function findActiveByUser(int $userId): Collection
    {
        return Subscription::where('user_id', $userId)
            ->where('status', 'active')
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
     * 구독 상태 업데이트
     *
     * @param Subscription $subscription
     * @param string       $status
     * @return Subscription
     */
    public function updateStatus(Subscription $subscription, string $status): Subscription
    {
        return $this->update($subscription, ['status' => $status]);
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