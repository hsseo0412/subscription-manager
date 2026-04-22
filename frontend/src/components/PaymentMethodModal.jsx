import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreatePaymentMethod, useUpdatePaymentMethod } from '../hooks/usePaymentMethods'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEdit ? '결제수단 수정' : '결제수단 추가'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1" noValidate>
          {/* 유형 선택 */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">유형 *</label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(TYPE_LABELS).map(([value, label]) => (
                <label
                  key={value}
                  className={`flex items-center justify-center py-2 rounded-lg border text-sm font-medium cursor-pointer transition-all ${
                    selectedType === value
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
                      : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {selectedType === 'card' ? '카드사명 *' : selectedType === 'transfer' ? '은행명 *' : '이름 *'}
            </label>
            <Input
              type="text"
              placeholder={selectedType === 'card' ? '현대카드' : selectedType === 'transfer' ? '카카오뱅크' : ''}
              {...register('name')}
              className={errors.name ? 'border-red-400 bg-red-50' : ''}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          {/* 카드 뒷 4자리 */}
          {selectedType === 'card' && (
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">카드 뒷 4자리 *</label>
              <Input
                type="text"
                maxLength={4}
                placeholder="1234"
                {...register('last4')}
                className={errors.last4 ? 'border-red-400 bg-red-50' : ''}
              />
              {errors.last4 && <p className="text-xs text-red-500">{errors.last4.message}</p>}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? '저장 중...' : isEdit ? '수정' : '추가'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
