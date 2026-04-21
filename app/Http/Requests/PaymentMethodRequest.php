<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PaymentMethodRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', 'in:card,transfer,cash,etc'],
            'name' => ['required', 'string', 'max:100'],
            'last4' => ['nullable', 'string', 'digits:4', 'required_if:type,card'],
        ];
    }

    public function messages(): array
    {
        return [
            'type.required'        => '결제수단 유형을 선택해주세요.',
            'type.in'              => '유효하지 않은 결제수단 유형입니다.',
            'name.required'        => '결제수단 이름을 입력해주세요.',
            'name.max'             => '이름은 100자 이하여야 합니다.',
            'last4.digits'         => '카드 번호 뒷 4자리를 입력해주세요.',
            'last4.required_if'    => '카드는 뒷 4자리를 입력해주세요.',
        ];
    }
}