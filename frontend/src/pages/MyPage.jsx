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
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  PlusIcon,
  ChevronLeftIcon,
  UserIcon,
  LockIcon,
  CreditCardIcon,
  LandmarkIcon,
  WalletIcon,
  MoreHorizontalIcon,
  PencilIcon,
  Trash2Icon,
  SunIcon,
  MoonIcon,
} from 'lucide-react'
import useThemeStore from '../stores/themeStore'

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
const TYPE_ICON_BG = {
  card:     'bg-blue-50 text-blue-600',
  transfer: 'bg-green-50 text-green-600',
  cash:     'bg-yellow-50 text-yellow-600',
  etc:      'bg-gray-100 text-gray-500',
}

function PaymentTypeIcon({ type }) {
  const cls = 'w-4 h-4'
  if (type === 'card')     return <CreditCardIcon className={cls} />
  if (type === 'transfer') return <LandmarkIcon className={cls} />
  if (type === 'cash')     return <WalletIcon className={cls} />
  return <MoreHorizontalIcon className={cls} />
}

export default function MyPage() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useThemeStore()
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

  const initials = user?.name ? user.name[0].toUpperCase() : '?'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* 내비게이션 */}
      <nav className="bg-white dark:bg-gray-900 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link
              to="/dashboard"
              className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">마이 페이지</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? '라이트 모드' : '다크 모드'}
              className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              {theme === 'dark' ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
            </button>
            <button onClick={logout} className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
              로그아웃
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 pt-8 pb-16 space-y-5">

        {/* 프로필 헤더 카드 */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-bold text-white">{initials}</span>
          </div>
          <div className="min-w-0">
            <p className="text-lg font-bold text-gray-900 dark:text-white truncate">{user?.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>

        {/* 프로필 수정 */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
              <UserIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200">프로필 수정</h2>
          </div>

          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-3" noValidate>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">이름</label>
              <Input
                type="text"
                {...profileForm.register('name')}
                className={profileForm.formState.errors.name ? 'border-red-400 bg-red-50' : ''}
              />
              {profileForm.formState.errors.name && (
                <p className="text-xs text-red-500">{profileForm.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">이메일</label>
              <Input
                type="email"
                value={user?.email ?? ''}
                disabled
                className="bg-gray-50 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400">이메일은 변경할 수 없습니다.</p>
            </div>
            {profileMsg && (
              <p className={`text-sm ${profileMsg.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>{profileMsg.text}</p>
            )}
            <Button type="submit" disabled={profileForm.formState.isSubmitting} className="w-full">
              {profileForm.formState.isSubmitting ? '저장 중...' : '저장'}
            </Button>
          </form>
        </div>

        {/* 비밀번호 변경 */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
              <LockIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200">비밀번호 변경</h2>
          </div>

          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-3" noValidate>
            {[
              { name: 'current_password', label: '현재 비밀번호' },
              { name: 'password', label: '새 비밀번호' },
              { name: 'password_confirmation', label: '새 비밀번호 확인' },
            ].map(({ name, label }) => {
              const { onBlur: rhfOnBlur, ...rest } = passwordForm.register(name)
              return (
                <div key={name} className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
                  <Input
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
                    className={passwordForm.formState.errors[name] ? 'border-red-400 bg-red-50' : ''}
                  />
                  {passwordForm.formState.errors[name] && (
                    <p className="text-xs text-red-500">{passwordForm.formState.errors[name].message}</p>
                  )}
                </div>
              )
            })}
            {passwordMsg && (
              <p className={`text-sm ${passwordMsg.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>{passwordMsg.text}</p>
            )}
            <Button type="submit" disabled={passwordForm.formState.isSubmitting} className="w-full">
              {passwordForm.formState.isSubmitting ? '변경 중...' : '비밀번호 변경'}
            </Button>
          </form>
        </div>

        {/* 결제수단 관리 */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                <CreditCardIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200">결제수단 관리</h2>
            </div>
            <Button size="sm" onClick={() => { setEditTarget(null); setPmModalOpen(true) }}>
              <PlusIcon className="w-3.5 h-3.5 mr-1" />
              추가
            </Button>
          </div>

          {paymentMethods.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
              <CreditCardIcon className="mx-auto w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
              <p className="text-sm text-gray-400">등록된 결제수단이 없습니다.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {paymentMethods.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center gap-3 p-3.5 border border-gray-100 dark:border-gray-800 rounded-xl hover:border-indigo-100 dark:hover:border-indigo-900 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${TYPE_ICON_BG[m.type]}`}>
                    <PaymentTypeIcon type={m.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                      {m.name}{m.last4 ? ` (${m.last4})` : ''}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{TYPE_LABELS[m.type]}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => { setEditTarget(m); setPmModalOpen(true) }}
                      title="수정"
                      className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <PencilIcon className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeletePaymentMethod(m.id)}
                      title="삭제"
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2Icon className="w-3.5 h-3.5" />
                    </button>
                  </div>
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
