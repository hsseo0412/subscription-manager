<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SubscriptionRequest;
use App\Models\Subscription;
use App\Services\SubscriptionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    public function __construct(
        private SubscriptionService $service
    ) {}

    /**
     * GET /api/subscriptions
     * 로그인 사용자의 구독 목록 및 월 총액 반환
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $subscriptions = $this->service->getUserSubscriptions($request->user()->id);
        $monthlyTotal  = $this->service->calcMonthlyTotal($subscriptions);

        return response()->json([
            'data' => [
                'subscriptions'  => $subscriptions,
                'monthly_total'  => $monthlyTotal,
            ],
        ]);
    }

    /**
     * POST /api/subscriptions
     * 구독 등록
     *
     * @param SubscriptionRequest $request
     * @return JsonResponse
     */
    public function store(SubscriptionRequest $request): JsonResponse
    {
        $subscription = $this->service->create(
            $request->user()->id,
            $request->validated()
        );

        return response()->json([
            'data'    => $subscription,
            'message' => '구독이 등록되었습니다.',
        ], 201);
    }

    /**
     * PUT /api/subscriptions/{subscription}
     * 구독 수정
     *
     * @param SubscriptionRequest $request
     * @param Subscription $subscription
     * @return JsonResponse
     */
    public function update(SubscriptionRequest $request, Subscription $subscription): JsonResponse
    {
        if ($subscription->user_id !== $request->user()->id) {
            return response()->json(['message' => '권한이 없습니다.'], 403);
        }

        $subscription = $this->service->update($subscription, $request->validated());

        return response()->json([
            'data'    => $subscription,
            'message' => '구독이 수정되었습니다.',
        ]);
    }

    /**
     * DELETE /api/subscriptions/{subscription}
     * 구독 삭제
     *
     * @param Request $request
     * @param Subscription $subscription
     * @return JsonResponse
     */
    public function destroy(Request $request, Subscription $subscription): JsonResponse
    {
        if ($subscription->user_id !== $request->user()->id) {
            return response()->json(['message' => '권한이 없습니다.'], 403);
        }

        $this->service->delete($subscription);

        return response()->json(['message' => '구독이 삭제되었습니다.']);
    }
}