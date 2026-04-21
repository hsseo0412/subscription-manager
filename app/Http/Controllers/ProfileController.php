<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    /**
     * PATCH /api/user/profile
     * 로그인한 사용자의 이름/이메일 프로필 수정
     *
     * @param ProfileUpdateRequest $request
     * @return JsonResponse
     */
    public function update(ProfileUpdateRequest $request): JsonResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return response()->json([
            'data' => $request->user(),
            'message' => '프로필이 업데이트되었습니다.',
        ]);
    }

    /**
     * PATCH /api/user/password
     * 현재 비밀번호 확인 후 새 비밀번호로 변경
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function updatePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => ['required', 'current_password'],
            'password'         => ['required', 'string', 'min:8', 'confirmed'],
        ], [
            'current_password.current_password' => '현재 비밀번호가 올바르지 않습니다.',
            'password.required'                 => '새 비밀번호를 입력해주세요.',
            'password.min'                      => '비밀번호는 8자 이상이어야 합니다.',
            'password.confirmed'                => '비밀번호 확인이 일치하지 않습니다.',
        ]);

        $request->user()->update([
            'password' => Hash::make($request->password),
        ]);

        return response()->json(['message' => '비밀번호가 변경되었습니다.']);
    }

    /**
     * DELETE /api/user
     * 비밀번호 확인 후 현재 계정 삭제
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function destroy(Request $request): JsonResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();
        Auth::logout();
        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => '계정이 삭제되었습니다.']);
    }
}
