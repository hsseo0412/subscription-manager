<?php

namespace App\Services;

use App\Models\Subscription;
use App\Repositories\SubscriptionRepository;
use Illuminate\Database\Eloquent\Collection;

class SubscriptionService
{
    public function __construct(
        private SubscriptionRepository $repository
    ) {}

    /**
     * 로그인한 사용자의 구독 목록 반환
     *
     * @param int $userId
     * @return Collection
     */
    public function getUserSubscriptions(int $userId): Collection
    {
        return $this->repository->findByUser($userId);
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
     * 월 환산 총 구독료 계산 (yearly는 /12 반올림)
     */
    public function calcMonthlyTotal(Collection $subscriptions): int
    {
        return $subscriptions->sum(function (Subscription $sub) {
            return $sub->billing_cycle === 'yearly'
                ? (int) round($sub->price / 12)
                : $sub->price;
        });
    }
}
