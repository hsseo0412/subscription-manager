import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateSubscription, useUpdateSubscription } from '../hooks/useSubscriptions'

const schema = z.object({
  name:          z.string().min(1, '서비스명을 입력해주세요.').max(100),
  price:         z.coerce.number({ invalid_type_error: '금액을 입력해주세요.' }).int().min(0, '금액은 0 이상이어야 합니다.'),
  billing_cycle: z.enum(['monthly', 'yearly'], { required_error: '결제 주기를 선택해주세요.' }),
  billing_date:  z.coerce.number().int().min(1).max(31),
  category:      z.string().max(50).optional().or(z.literal('')),
  color:         z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().or(z.literal('')),
  memo:          z.string().optional().or(z.literal('')),
})

const CATEGORIES = ['동영상', '음악', '게임', '업무', '클라우드', '쇼핑', '기타']
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899']

export default function SubscriptionModal({ isOpen, onClose, editTarget }) {
  const isEdit = !!editTarget
  const createMutation = useCreateSubscription()
  const updateMutation = useUpdateSubscription()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      billing_cycle: 'monthly',
      billing_date: 1,
      color: '#6366f1',
    },
  })

  useEffect(() => {
    if (isOpen) {
      reset(
        editTarget ?? {
          name: '', price: '', billing_cycle: 'monthly',
          billing_date: 1, category: '', color: '#6366f1', memo: '',
        }
      )
    }
  }, [isOpen, editTarget, reset])

  const selectedColor = watch('color')

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: editTarget.id, ...data })
      } else {
        await createMutation.mutateAsync(data)
      }
      onClose()
    } catch (err) {
      if (err.response?.status === 422) {
        const serverErrors = err.response.data.errors || {}
        Object.entries(serverErrors).forEach(([field, messages]) => {
          setError(field, { message: messages[0] })
        })
      }
    }
  }

  if (!isOpen) return null

  const inputClass = (hasError) =>
    `block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
      hasError ? 'border-red-400 bg-red-50' : 'border-gray-300'
    }`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-5">

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            {isEdit ? '구독 수정' : '구독 추가'}
          </h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>

          {/* 서비스명 */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">서비스명 *</label>
            <input type="text" placeholder="Netflix" {...register('name')} className={inputClass(!!errors.name)} />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          {/* 금액 + 결제 주기 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">금액 (원) *</label>
              <input type="number" min="0" placeholder="17000" {...register('price')} className={inputClass(!!errors.price)} />
              {errors.price && <p className="text-xs text-red-500">{errors.price.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">결제 주기 *</label>
              <select {...register('billing_cycle')} className={inputClass(!!errors.billing_cycle)}>
                <option value="monthly">매월</option>
                <option value="yearly">매년</option>
              </select>
            </div>
          </div>

          {/* 결제일 + 카테고리 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">결제일 *</label>
              <input type="number" min="1" max="31" placeholder="1" {...register('billing_date')} className={inputClass(!!errors.billing_date)} />
              {errors.billing_date && <p className="text-xs text-red-500">{errors.billing_date.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">카테고리</label>
              <select {...register('category')} className={inputClass(false)}>
                <option value="">선택 안 함</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* 색상 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">색상</label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setValue('color', c)}
                  className={`w-7 h-7 rounded-full transition-transform ${selectedColor === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* 메모 */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">메모</label>
            <textarea rows={2} placeholder="추가 메모" {...register('memo')} className={inputClass(false) + ' resize-none'} />
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {isSubmitting ? '저장 중...' : isEdit ? '수정' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
