import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreatePaymentMethod, useUpdatePaymentMethod } from '../hooks/usePaymentMethods'

const schema = z.object({
  type: z.enum(['card', 'transfer', 'cash', 'etc'], { required_error: '유형을 선택해주세요.' }),
  name: z.string().min(1, '이름을 입력해주세요.').max(100),
  last4: z.string().length(4, '4자리를 입력해주세요.').optional().or(z.literal('')),
}).refine((d) => d.type !== 'card' || (d.last4 && d.last4.length === 4), {
  message: '카드 뒷 4자리를 입력해주세요.',
  path: ['last4'],
})

const TYPE_LABELS = { card: '카드', transfer: '계좌이체', cash: '현금', etc: '기타' }

export default function PaymentMethodModal({ isOpen, onClose, editTarget }) {
  const isEdit = !!editTarget
  const createMutation = useCreatePaymentMethod()
  const updateMutation = useUpdatePaymentMethod()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { type: 'card', name: '', last4: '' },
  })

  useEffect(() => {
    if (isOpen) {
      reset(editTarget ?? { type: 'card', name: '', last4: '' })
    }
  }, [isOpen, editTarget, reset])

  const selectedType = watch('type')

  const onSubmit = async (data) => {
    const payload = {
      type: data.type,
      name: data.name,
      last4: data.type === 'card' ? data.last4 : null,
    }
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: editTarget.id, ...payload })
      } else {
        await createMutation.mutateAsync(payload)
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
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 space-y-5">

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            {isEdit ? '결제수단 수정' : '결제수단 추가'}
          </h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>

          {/* 유형 선택 */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">유형 *</label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(TYPE_LABELS).map(([value, label]) => (
                <label
                  key={value}
                  className={`flex items-center justify-center py-2 rounded-lg border text-sm font-medium cursor-pointer transition-all ${
                    selectedType === value
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <input type="radio" value={value} {...register('type')} className="sr-only" />
                  {label}
                </label>
              ))}
            </div>
            {errors.type && <p className="text-xs text-red-500">{errors.type.message}</p>}
          </div>

          {/* 이름 */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {selectedType === 'card' ? '카드사명 *' : selectedType === 'transfer' ? '은행명 *' : '이름 *'}
            </label>
            <input
              type="text"
              placeholder={selectedType === 'card' ? '현대카드' : selectedType === 'transfer' ? '카카오뱅크' : ''}
              {...register('name')}
              className={inputClass(!!errors.name)}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          {/* 카드 뒷 4자리 */}
          {selectedType === 'card' && (
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">카드 뒷 4자리 *</label>
              <input
                type="text"
                maxLength={4}
                placeholder="1234"
                {...register('last4')}
                className={inputClass(!!errors.last4)}
              />
              {errors.last4 && <p className="text-xs text-red-500">{errors.last4.message}</p>}
            </div>
          )}

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
