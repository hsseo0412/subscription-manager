<?php

namespace App\Services;

use App\Models\PaymentMethod;
use App\Repositories\PaymentMethodRepository;
use Illuminate\Database\Eloquent\Collection;

class PaymentMethodService
{
    public function __construct(
        private readonly PaymentMethodRepository $repo,
    ) {}

    /**
     * 로그인한 사용자의 결제수단 목록 반환
     *
     * @param int $userId
     * @return Collection
     */
    public function getUserPaymentMethods(int $userId): Collection
    {
        return $this->repo->findByUser($userId);
    }

    /**
     * 결제수단 생성
     *
     * @param int $userId
     * @param array $data
     * @return PaymentMethod
     */
    public function create(int $userId, array $data): PaymentMethod
    {
        return $this->repo->create(array_merge($data, ['user_id' => $userId]));
    }

    /**
     * 결제수단 수정
     *
     * @param PaymentMethod $paymentMethod
     * @param array $data
     * @return PaymentMethod
     */
    public function update(PaymentMethod $paymentMethod, array $data): PaymentMethod
    {
        return $this->repo->update($paymentMethod, $data);
    }

    /**
     * 결제수단 삭제 (연결된 구독의 payment_method_id는 null로 처리됨)
     *
     * @param PaymentMethod $paymentMethod
     * @return void
     */
    public function delete(PaymentMethod $paymentMethod): void
    {
        $this->repo->delete($paymentMethod);
    }
}