<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PaymentMethodRequest;
use App\Models\PaymentMethod;
use App\Services\PaymentMethodService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentMethodController extends Controller
{
    public function __construct(
        private readonly PaymentMethodService $service,
    ) {}

    /**
     * GET /api/payment-methods
     * 로그인한 사용자의 결제수단 목록 반환
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $methods = $this->service->getUserPaymentMethods($request->user()->id);
        return response()->json(['data' => $methods]);
    }

    /**
     * POST /api/payment-methods
     * 결제수단 등록
     *
     * @param PaymentMethodRequest $request
     * @return JsonResponse
     */
    public function store(PaymentMethodRequest $request): JsonResponse
    {
        $method = $this->service->create($request->user()->id, $request->validated());
        return response()->json(['data' => $method, 'message' => '결제수단이 등록되었습니다.'], 201);
    }

    /**
     * PUT /api/payment-methods/{paymentMethod}
     * 결제수단 수정 (본인 소유 확인)
     *
     * @param PaymentMethodRequest $request
     * @param PaymentMethod $paymentMethod
     * @return JsonResponse
     */
    public function update(PaymentMethodRequest $request, PaymentMethod $paymentMethod): JsonResponse
    {
        if ($paymentMethod->user_id !== $request->user()->id) {
            return response()->json(['message' => '접근 권한이 없습니다.'], 403);
        }

        $method = $this->service->update($paymentMethod, $request->validated());
        return response()->json(['data' => $method, 'message' => '결제수단이 수정되었습니다.']);
    }

    /**
     * DELETE /api/payment-methods/{paymentMethod}
     * 결제수단 삭제 (본인 소유 확인, 연결 구독은 결제수단 null 처리)
     *
     * @param Request $request
     * @param PaymentMethod $paymentMethod
     * @return JsonResponse
     */
    public function destroy(Request $request, PaymentMethod $paymentMethod): JsonResponse
    {
        if ($paymentMethod->user_id !== $request->user()->id) {
            return response()->json(['message' => '접근 권한이 없습니다.'], 403);
        }

        $this->service->delete($paymentMethod);
        return response()->json(['message' => '결제수단이 삭제되었습니다.']);
    }
}
