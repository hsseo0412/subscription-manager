<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SubscriptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'          => ['required', 'string', 'max:100'],
            'price'         => ['required', 'integer', 'min:0'],
            'billing_cycle' => ['required', 'in:monthly,yearly'],
            'billing_date'  => ['required', 'integer', 'min:1', 'max:31'],
            'billing_month' => ['nullable', 'required_if:billing_cycle,yearly', 'integer', 'min:1', 'max:12'],
            'category'      => ['nullable', 'string', 'max:50'],
            'color'         => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'memo'               => ['nullable', 'string', 'max:500'],
            'payment_method_id'  => ['required', 'integer', 'exists:payment_methods,id'],
            'status'             => ['sometimes', 'in:active,paused,cancelled'],
            'members'            => ['sometimes', 'integer', 'min:1', 'max:99'],
            'website'            => ['nullable', 'url', 'max:255'],
            'trial_ends_at'      => ['nullable', 'date'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'          => '서비스명을 입력해주세요.',
            'name.max'               => '서비스명은 100자 이하여야 합니다.',
            'price.required'         => '금액을 입력해주세요.',
            'price.integer'          => '금액은 숫자여야 합니다.',
            'price.min'              => '금액은 0 이상이어야 합니다.',
            'billing_cycle.required' => '결제 주기를 선택해주세요.',
            'billing_cycle.in'       => '결제 주기는 monthly 또는 yearly여야 합니다.',
            'billing_date.required'  => '결제일을 입력해주세요.',
            'billing_date.min'       => '결제일은 1일 이상이어야 합니다.',
            'billing_date.max'       => '결제일은 31일 이하여야 합니다.',
            'billing_month.required_if' => '연간 결제는 결제 월을 선택해주세요.',
            'billing_month.min'      => '결제 월은 1~12월 사이여야 합니다.',
            'billing_month.max'      => '결제 월은 1~12월 사이여야 합니다.',
            'color.regex'            => '색상은 #RRGGBB 형식이어야 합니다.',
            'memo.max'               => '메모는 500자 이하여야 합니다.',
            'payment_method_id.required' => '결제수단을 선택해주세요.',
            'payment_method_id.exists'   => '유효하지 않은 결제수단입니다.',
            'status.in'              => '유효하지 않은 상태값입니다.',
            'members.min'            => '인원수는 1명 이상이어야 합니다.',
            'members.max'            => '인원수는 99명 이하여야 합니다.',
            'website.url'            => '올바른 URL 형식이어야 합니다.',
            'website.max'            => 'URL은 255자 이하여야 합니다.',
            'trial_ends_at.date'     => '유효한 날짜를 입력해주세요.',
        ];
    }
}
