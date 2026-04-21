<?php

namespace App\Repositories;

use App\Models\PaymentMethod;
use Illuminate\Database\Eloquent\Collection;

class PaymentMethodRepository
{
    /**
     * user_id로 결제수단 목록 조회 (생성일 오름차순)
     *
     * @param int $userId
     * @return Collection
     */
    public function findByUser(int $userId): Collection
    {
        return PaymentMethod::where('user_id', $userId)->orderBy('created_at')->get();
    }

    /**
     * 결제수단 생성
     *
     * @param array $data
     * @return PaymentMethod
     */
    public function create(array $data): PaymentMethod
    {
        return PaymentMethod::create($data);
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
        $paymentMethod->update($data);
        return $paymentMethod->fresh();
    }

    /**
     * 결제수단 삭제
     *
     * @param PaymentMethod $paymentMethod
     * @return void
     */
    public function delete(PaymentMethod $paymentMethod): void
    {
        $paymentMethod->delete();
    }
}