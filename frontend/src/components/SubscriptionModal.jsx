import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateSubscription, useUpdateSubscription } from '../hooks/useSubscriptions'
import { usePaymentMethods } from '../hooks/usePaymentMethods'
import { POPULAR_SERVICES } from '../data/popularServices'
import { SERVICE_WEBSITE_MAP } from '../data/popularServices'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

const TYPE_LABELS = { card: '카드', transfer: '계좌이체', cash: '현금', etc: '기타' }

const CURRENCIES = [
  { value: 'KRW', label: '₩ KRW' },
  { value: 'USD', label: '$ USD' },
  { value: 'EUR', label: '€ EUR' },
]

const schema = z.object({
  name:              z.string().min(1, '서비스명을 입력해주세요.').max(100),
  price:             z.coerce.number({ invalid_type_error: '금액을 입력해주세요.' }).int().min(0, '금액은 0 이상이어야 합니다.'),
  currency:          z.enum(['KRW', 'USD', 'EUR']).default('KRW'),
  billing_cycle:     z.enum(['monthly', 'yearly'], { required_error: '결제 주기를 선택해주세요.' }),
  billing_date:      z.coerce.number().int().min(1).max(31),
  billing_month:     z.coerce.number().int().min(1).max(12).optional().or(z.literal('')),
  payment_method_id: z.coerce.number({ required_error: '결제수단을 선택해주세요.' }).int().positive('결제수단을 선택해주세요.'),
  category:          z.string().max(50).optional().or(z.literal('')),
  color:             z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().or(z.literal('')),
  memo:              z.string().optional().or(z.literal('')),
  website:           z.string().url('올바른 URL 형식이어야 합니다.').optional().or(z.literal('')),
  trial_ends_at:     z.string().optional().or(z.literal('')),
  members:           z.coerce.number().int().min(1, '인원수는 1명 이상이어야 합니다.').max(99).default(1),
})

const CATEGORIES = ['동영상', '음악', '게임', '업무', '클라우드', '쇼핑', '기타']
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899']

const selectClass = (hasError) =>
  `block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition dark:text-gray-100 ${
    hasError ? 'border-red-400 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700'
  }`

export default function SubscriptionModal({ isOpen, onClose, editTarget }) {
  const isEdit = !!editTarget
  const { data: paymentMethods = [] } = usePaymentMethods()

  const [search, setSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedService, setSelectedService] = useState(null)
  const comboboxRef = useRef(null)

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
    defaultValues: { billing_cycle: 'monthly', billing_date: 1, color: '#6366f1', members: 1, currency: 'KRW' },
  })

  useEffect(() => {
    if (isOpen) {
      setSearch('')
      setShowDropdown(false)
      setSelectedService(null)
      reset(
        editTarget
          ? {
              ...editTarget,
              currency:       editTarget.currency       ?? 'KRW',
              billing_month:  editTarget.billing_month  ?? '',
              category:       editTarget.category       ?? '',
              color:          editTarget.color          ?? '#6366f1',
              memo:           editTarget.memo           ?? '',
              website:        editTarget.website        ?? '',
              trial_ends_at:  editTarget.trial_ends_at?.slice(0, 10) ?? '',
            }
          : { name: '', price: '', currency: 'KRW', billing_cycle: 'monthly', billing_date: 1, category: '', color: '#6366f1', memo: '', members: 1, trial_ends_at: '' }
      )
    }
  }, [isOpen, editTarget, reset])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (comboboxRef.current && !comboboxRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filtered = POPULAR_SERVICES.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleServiceSelect = (service) => {
    setSelectedService(service)
    setSearch('')
    setShowDropdown(false)
    setValue('name', service.name, { shouldValidate: true })
    setValue('color', service.color)
    setValue('category', service.category)
    setValue('website', service.website ?? '')
  }

  const handleClearService = () => {
    setSelectedService(null)
    setSearch('')
    setValue('name', '')
    setValue('color', '#6366f1')
    setValue('category', '')
    setValue('website', '')
  }

  const selectedColor    = watch('color')
  const watchedCycle     = watch('billing_cycle')
  const watchedPrice     = watch('price') || 0
  const watchedMembers   = watch('members') || 1
  const watchedCurrency  = watch('currency') || 'KRW'
  const currencySymbol   = watchedCurrency === 'USD' ? '$' : watchedCurrency === 'EUR' ? '€' : '₩'

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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{isEdit ? '구독 수정' : '구독 추가'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* 인기 서비스 검색 — 등록 모드만 */}
          {!isEdit && (
            <div className="space-y-1" ref={comboboxRef}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">인기 서비스 검색</label>

              {selectedService ? (
                <div className="flex items-center gap-2 px-3 py-2 border border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: selectedService.color }} />
                  <span className="text-sm font-medium text-indigo-800 dark:text-indigo-300 flex-1">{selectedService.name}</span>
                  <span className="text-xs text-indigo-500 bg-indigo-100 dark:bg-indigo-900/50 px-2 py-0.5 rounded-full">{selectedService.category}</span>
                  <button type="button" onClick={handleClearService} className="text-indigo-400 hover:text-indigo-600 ml-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Input
                    type="text"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setShowDropdown(true) }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Netflix, Spotify..."
                  />
                  {showDropdown && (
                    <ul className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filtered.length > 0 ? (
                        filtered.map((service) => (
                          <li key={service.id}>
                            <button
                              type="button"
                              onMouseDown={() => handleServiceSelect(service)}
                              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: service.color }} />
                              <span className="text-sm text-gray-800 dark:text-gray-200 flex-1">{service.name}</span>
                              <span className="text-xs text-gray-400">{service.category}</span>
                            </button>
                          </li>
                        ))
                      ) : (
                        <li className="px-3 py-3 text-sm text-gray-400 text-center">검색 결과 없음</li>
                      )}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* 카테고리 */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">카테고리</label>
              <select {...register('category')} className={selectClass(false)}>
                <option value="">선택 안 함</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* 서비스명 */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">서비스명 *</label>
              <Input
                type="text"
                placeholder="위에서 선택하거나 직접 입력하세요"
                {...register('name')}
                className={errors.name ? 'border-red-400 bg-red-50' : ''}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>

            {/* 결제수단 */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">결제수단 *</label>
              <select {...register('payment_method_id')} className={selectClass(!!errors.payment_method_id)}>
                <option value="">선택해주세요</option>
                {paymentMethods.map((m) => (
                  <option key={m.id} value={m.id}>
                    {TYPE_LABELS[m.type]} · {m.name}{m.last4 ? ` (${m.last4})` : ''}
                  </option>
                ))}
              </select>
              {errors.payment_method_id && <p className="text-xs text-red-500">{errors.payment_method_id.message}</p>}
              {paymentMethods.length === 0 && (
                <p className="text-xs text-amber-500">마이 페이지에서 결제수단을 먼저 등록해주세요.</p>
              )}
            </div>

            {/* 결제 주기 + 결제일 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">결제 주기 *</label>
                <select {...register('billing_cycle')} className={selectClass(!!errors.billing_cycle)}>
                  <option value="monthly">매월</option>
                  <option value="yearly">매년</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {watchedCycle === 'yearly' ? '결제 월 / 일 *' : '결제일 *'}
                </label>
                {watchedCycle === 'yearly' ? (
                  <div className="flex gap-1.5">
                    <select {...register('billing_month')} className={selectClass(!!errors.billing_month)}>
                      <option value="">월</option>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <option key={m} value={m}>{m}월</option>
                      ))}
                    </select>
                    <Input
                      type="number"
                      min="1"
                      max="31"
                      placeholder="일"
                      {...register('billing_date')}
                      className={`w-16 ${errors.billing_date ? 'border-red-400 bg-red-50' : ''}`}
                    />
                  </div>
                ) : (
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    placeholder="1"
                    {...register('billing_date')}
                    className={errors.billing_date ? 'border-red-400 bg-red-50' : ''}
                  />
                )}
                {errors.billing_month && <p className="text-xs text-red-500">{errors.billing_month.message}</p>}
                {errors.billing_date && <p className="text-xs text-red-500">{errors.billing_date.message}</p>}
              </div>
            </div>

            {/* 통화 + 금액 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">통화</label>
                <select {...register('currency')} className={selectClass(false)}>
                  {CURRENCIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">금액 *</label>
                <Input
                  type="number"
                  min="0"
                  placeholder={watchedCurrency === 'KRW' ? '17000' : '9.99'}
                  {...register('price')}
                  className={errors.price ? 'border-red-400 bg-red-50' : ''}
                />
                {errors.price && <p className="text-xs text-red-500">{errors.price.message}</p>}
                {watchedMembers > 1 && watchedPrice > 0 && (
                  <p className="text-xs text-indigo-500">
                    1인: {currencySymbol}{Math.round(watchedPrice / watchedMembers).toLocaleString('ko-KR')}
                  </p>
                )}
              </div>
            </div>

            {/* 인원수 */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">인원수</label>
              <Input
                type="number"
                min="1"
                max="99"
                placeholder="1"
                {...register('members')}
                className={errors.members ? 'border-red-400 bg-red-50' : ''}
              />
              {errors.members && <p className="text-xs text-red-500">{errors.members.message}</p>}
              <p className="text-xs text-gray-400">여러 명이 나눠서 결제할 경우 입력하세요.</p>
            </div>

            {/* 무료체험 종료일 */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">무료체험 종료일</label>
              <Input
                type="date"
                {...register('trial_ends_at')}
                className={errors.trial_ends_at ? 'border-red-400 bg-red-50' : ''}
              />
              {errors.trial_ends_at && <p className="text-xs text-red-500">{errors.trial_ends_at.message}</p>}
              <p className="text-xs text-gray-400">무료체험 중인 경우 종료일을 입력하면 카드에 표시됩니다.</p>
            </div>

            {/* 색상 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">색상</label>
              <div className="flex gap-2 items-center">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setValue('color', c)}
                    className={`w-7 h-7 rounded-full transition-transform ${selectedColor === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
                {selectedColor && !COLORS.includes(selectedColor) && (
                  <span
                    className="w-7 h-7 rounded-full ring-2 ring-offset-2 ring-gray-400 scale-110 inline-block"
                    style={{ backgroundColor: selectedColor }}
                  />
                )}
              </div>
            </div>

            {/* 홈페이지 URL */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">홈페이지 URL</label>
              <Input
                type="url"
                placeholder="https://example.com"
                {...register('website')}
                className={errors.website ? 'border-red-400 bg-red-50' : ''}
              />
              {errors.website && <p className="text-xs text-red-500">{errors.website.message}</p>}
            </div>

            {/* 메모 */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">메모</label>
              <Textarea
                rows={2}
                placeholder="추가 메모"
                {...register('memo')}
                className="resize-none"
              />
            </div>

            {/* 버튼 */}
            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                취소
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? '저장 중...' : isEdit ? '수정' : '추가'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
