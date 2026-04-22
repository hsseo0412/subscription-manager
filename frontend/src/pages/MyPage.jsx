import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import api from '../lib/axios'
import { useAuth } from '../hooks/useAuth'
import useAuthStore from '../stores/authStore'
import { usePaymentMethods, useDeletePaymentMethod } from '../hooks/usePaymentMethods'
import PaymentMethodModal from '../components/PaymentMethodModal'

const profileSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요.'),
})

const passwordSchema = z.object({
  current_password:      z.string().min(1, '현재 비밀번호를 입력해주세요.'),
  password:              z.string().min(8, '8자 이상 입력해주세요.'),
  password_confirmation: z.string().min(1, '비밀번호 확인을 입력해주세요.'),
}).refine((d) => d.password === d.password_confirmation, {
  message: '비밀번호가 일치하지 않습니다.',
  path: ['password_confirmation'],
})

const TYPE_LABELS = { card: '카드', transfer: '계좌이체', cash: '현금', etc: '기타' }
const TYPE_COLORS = { card: 'bg-blue-100 text-blue-700', transfer: 'bg-green-100 text-green-700', cash: 'bg-yellow-100 text-yellow-700', etc: 'bg-gray-100 text-gray-600' }

export default function MyPage() {
  const { user, logout } = useAuth()
  const { data: paymentMethods = [] } = usePaymentMethods()
  const deleteMutation = useDeletePaymentMethod()

  const [pmModalOpen, setPmModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [profileMsg, setProfileMsg] = useState(null)
  const [passwordMsg, setPasswordMsg] = useState(null)

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? '' },
  })

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    mode: 'onBlur',
    defaultValues: { current_password: '', password: '', password_confirmation: '' },
  })

  const onProfileSubmit = async (data) => {
    try {
      await api.patch('/api/user/profile', data)
      useAuthStore.getState().setUser({ ...user, name: data.name })
      setProfileMsg({ type: 'success', text: '프로필이 업데이트되었습니다.' })
    } catch (err) {
      if (err.response?.status === 422) {
        const errors = err.response.data.errors || {}
        Object.entries(errors).forEach(([field, messages]) => {
          profileForm.setError(field, { message: messages[0] })
        })
      } else {
        setProfileMsg({ type: 'error', text: '업데이트에 실패했습니다.' })
      }
    }
  }

  const onPasswordSubmit = async (data) => {
    try {
      await api.patch('/api/user/password', data)
      setPasswordMsg({ type: 'success', text: '비밀번호가 변경되었습니다.' })
      passwordForm.reset()
    } catch (err) {
      if (err.response?.status === 422) {
        const errors = err.response.data.errors || {}
        Object.entries(errors).forEach(([field, messages]) => {
          passwordForm.setError(field, { message: messages[0] })
        })
      } else {
        setPasswordMsg({ type: 'error', text: '비밀번호 변경에 실패했습니다.' })
      }
    }
  }

  const handleDeletePaymentMethod = async (id) => {
    if (!confirm('결제수단을 삭제하면 연결된 구독의 결제수단 정보가 초기화됩니다. 삭제하시겠습니까?')) return
    await deleteMutation.mutateAsync(id)
  }

  const inputClass = (hasError) =>
    `block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
      hasError ? 'border-red-400 bg-red-50' : 'border-gray-300'
    }`

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link
              to="/dashboard"
              className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-lg font-bold text-gray-900">마이 페이지</h1>
          </div>
          <button onClick={logout} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            로그아웃
          </button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 pt-8 pb-16 space-y-6">

        {/* 프로필 수정 */}
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-800">프로필 수정</h2>
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-3" noValidate>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">이름</label>
              <input type="text" {...profileForm.register('name')} className={inputClass(!!profileForm.formState.errors.name)} />
              {profileForm.formState.errors.name && <p className="text-xs text-red-500">{profileForm.formState.errors.name.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">이메일</label>
              <input
                type="email"
                value={user?.email ?? ''}
                disabled
                className="block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400">이메일은 변경할 수 없습니다.</p>
            </div>
            {profileMsg && (
              <p className={`text-sm ${profileMsg.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>{profileMsg.text}</p>
            )}
            <button
              type="submit"
              disabled={profileForm.formState.isSubmitting}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {profileForm.formState.isSubmitting ? '저장 중...' : '저장'}
            </button>
          </form>
        </div>

        {/* 비밀번호 변경 */}
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-800">비밀번호 변경</h2>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-3" noValidate>
            {[
              { name: 'current_password', label: '현재 비밀번호' },
              { name: 'password', label: '새 비밀번호' },
              { name: 'password_confirmation', label: '새 비밀번호 확인' },
            ].map(({ name, label }) => {
              const { onBlur: rhfOnBlur, ...rest } = passwordForm.register(name)
              return (
                <div key={name} className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">{label}</label>
                  <input
                    type="password"
                    {...rest}
                    onBlur={async (e) => {
                      rhfOnBlur(e)
                      if (name === 'current_password') {
                        const val = passwordForm.getValues('current_password')
                        if (!val) return
                        try {
                          await api.post('/api/user/password/check', { current_password: val })
                          passwordForm.clearErrors('current_password')
                        } catch {
                          passwordForm.setError('current_password', { message: '현재 비밀번호와 일치하지 않습니다.' })
                        }
                      }
                    }}
                    className={inputClass(!!passwordForm.formState.errors[name])}
                  />
                  {passwordForm.formState.errors[name] && <p className="text-xs text-red-500">{passwordForm.formState.errors[name].message}</p>}
                </div>
              )
            })}
            {passwordMsg && (
              <p className={`text-sm ${passwordMsg.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>{passwordMsg.text}</p>
            )}
            <button
              type="submit"
              disabled={passwordForm.formState.isSubmitting}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {passwordForm.formState.isSubmitting ? '변경 중...' : '비밀번호 변경'}
            </button>
          </form>
        </div>

        {/* 결제수단 관리 */}
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-800">결제수단 관리</h2>
            <button
              onClick={() => { setEditTarget(null); setPmModalOpen(true) }}
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              추가
            </button>
          </div>

          {paymentMethods.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">등록된 결제수단이 없습니다.</p>
          ) : (
            <ul className="space-y-2">
              {paymentMethods.map((m) => (
                <li key={m.id} className="flex items-center gap-3 px-4 py-3 border border-gray-100 rounded-xl">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_COLORS[m.type]}`}>
                    {TYPE_LABELS[m.type]}
                  </span>
                  <span className="text-sm text-gray-800 flex-1">
                    {m.name}{m.last4 ? ` (${m.last4})` : ''}
                  </span>
                  <button
                    onClick={() => { setEditTarget(m); setPmModalOpen(true) }}
                    className="text-xs text-gray-400 hover:text-indigo-600 transition-colors"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDeletePaymentMethod(m.id)}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                  >
                    삭제
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>

      <PaymentMethodModal
        isOpen={pmModalOpen}
        onClose={() => { setPmModalOpen(false); setEditTarget(null) }}
        editTarget={editTarget}
      />
    </div>
  )
}
