import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../../hooks/useAuth'

const schema = z
  .object({
    name: z.string().min(1, '이름을 입력해주세요.').max(50, '이름은 50자 이하여야 합니다.'),
    email: z.string().email('올바른 이메일 형식이 아닙니다.'),
    password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다.'),
    password_confirmation: z.string().min(1, '비밀번호 확인을 입력해주세요.'),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['password_confirmation'],
  })

function PasswordStrength({ password }) {
  if (!password) return null

  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length

  const labels = ['', '약함', '보통', '강함', '매우 강함']
  const colors = ['', 'bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-500']

  return (
    <div className="space-y-1 mt-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${i <= score ? colors[score] : 'bg-gray-200'}`}
          />
        ))}
      </div>
      {score > 0 && (
        <p className={`text-xs ${score <= 1 ? 'text-red-500' : score === 2 ? 'text-yellow-600' : 'text-green-600'}`}>
          비밀번호 강도: {labels[score]}
        </p>
      )}
    </div>
  )
}

export default function Register() {
  const { register: registerUser } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), mode: 'onBlur' })

  const passwordValue = watch('password', '')

  const onSubmit = async (data) => {
    try {
      await registerUser(data)
    } catch (err) {
      if (err.response?.status === 422) {
        const serverErrors = err.response.data.errors || {}
        Object.entries(serverErrors).forEach(([field, messages]) => {
          setError(field, { message: messages[0] })
        })
      } else {
        setError('root', { message: '회원가입에 실패했습니다. 다시 시도해주세요.' })
      }
    }
  }

  const inputClass = (hasError) =>
    `block w-full rounded-lg border px-3 py-2.5 text-sm shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition dark:text-gray-100 ${
      hasError ? 'border-red-400 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600 dark:bg-gray-800'
    }`

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-950 dark:to-gray-900 px-4 py-8">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 space-y-6">

        {/* 헤더 */}
        <div className="text-center space-y-1">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl mx-auto flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">계정 만들기</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">구독 관리를 시작하세요</p>
        </div>

        {/* Google 가입 (UI only) */}
        <button
          type="button"
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Google로 계속하기
        </button>

        {/* 구분선 */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          <span className="text-xs text-gray-400 dark:text-gray-500">또는</span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>

          {errors.root && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {errors.root.message}
            </div>
          )}

          {/* 이름 */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">이름</label>
            <input
              type="text"
              autoComplete="name"
              placeholder="홍길동"
              {...register('name')}
              className={inputClass(!!errors.name)}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          {/* 이메일 */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">이메일</label>
            <input
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              {...register('email')}
              className={inputClass(!!errors.email)}
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>

          {/* 비밀번호 */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">비밀번호</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="8자 이상 입력해주세요"
                {...register('password')}
                className={inputClass(!!errors.password) + ' pr-10'}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            <PasswordStrength password={passwordValue} />
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>

          {/* 비밀번호 확인 */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">비밀번호 확인</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="비밀번호를 다시 입력해주세요"
                {...register('password_confirmation')}
                className={inputClass(!!errors.password_confirmation) + ' pr-10'}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showConfirm ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password_confirmation && (
              <p className="text-xs text-red-500">{errors.password_confirmation.message}</p>
            )}
          </div>

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
          >
            {isSubmitting && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {isSubmitting ? '가입 중...' : '회원가입'}
          </button>
        </form>

        {/* 하단 링크 */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}
