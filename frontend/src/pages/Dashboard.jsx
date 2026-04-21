import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useSubscriptions, useDeleteSubscription } from '../hooks/useSubscriptions'
import { usePaymentMethods } from '../hooks/usePaymentMethods'
import SubscriptionModal from '../components/SubscriptionModal'

const TYPE_LABELS = { card: '카드', transfer: '계좌이체', cash: '현금', etc: '기타' }

function formatPrice(price) {
  return price.toLocaleString('ko-KR') + '원'
}

function SubscriptionCard({ subscription, onEdit, onDelete }) {
  const isYearly = subscription.billing_cycle === 'yearly'

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl flex-shrink-0" style={{ backgroundColor: subscription.color || '#6366f1' }} />
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 truncate">{subscription.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            {subscription.category && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{subscription.category}</span>
            )}
            <span className="text-xs text-gray-400">매월 {subscription.billing_date}일</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="text-right">
          <p className="font-bold text-gray-900">{formatPrice(subscription.price)}</p>
          <p className="text-xs text-gray-400">{isYearly ? '/ 년' : '/ 월'}</p>
        </div>
        <div className="flex gap-1">
          <button onClick={() => onEdit(subscription)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button onClick={() => onDelete(subscription.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const { data, isLoading } = useSubscriptions()
  const { data: paymentMethods = [] } = usePaymentMethods()
  const deleteMutation = useDeleteSubscription()

  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)

  const subscriptions = data?.subscriptions ?? []
  const monthlyTotal = data?.monthly_total ?? 0

  // 결제수단별 구독 집계
  const paymentSummary = paymentMethods.map((m) => {
    const linked = subscriptions.filter((s) => s.payment_method_id === m.id)
    const total = linked.reduce((sum, s) => {
      return sum + (s.billing_cycle === 'yearly' ? Math.round(s.price / 12) : s.price)
    }, 0)
    return { ...m, count: linked.length, total }
  }).filter((m) => m.count > 0)

  const handleEdit = (subscription) => { setEditTarget(subscription); setModalOpen(true) }
  const handleAdd = () => { setEditTarget(null); setModalOpen(true) }
  const handleDelete = (id) => { if (window.confirm('이 구독을 삭제하시겠습니까?')) deleteMutation.mutate(id) }
  const handleModalClose = () => { setModalOpen(false); setEditTarget(null) }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg" />
            <span className="text-lg font-bold text-gray-900">SubManager</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/mypage" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
              {user?.name}
            </Link>
            <button onClick={logout} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
              로그아웃
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* 요약 카드 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-indigo-600 rounded-2xl p-5 text-white">
            <p className="text-sm text-indigo-200">이번 달 총 구독료</p>
            <p className="text-3xl font-bold mt-1">{formatPrice(monthlyTotal)}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">구독 서비스</p>
            <p className="text-3xl font-bold mt-1 text-gray-900">
              {subscriptions.length}<span className="text-base font-normal text-gray-400 ml-1">개</span>
            </p>
          </div>
        </div>

        {/* 결제수단별 요약 */}
        {paymentSummary.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-base font-semibold text-gray-900">결제수단별 현황</h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {paymentSummary.map((m) => (
                <div key={m.id} className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-medium text-gray-500">{TYPE_LABELS[m.type]}</span>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">
                      {m.name}{m.last4 ? ` (${m.last4})` : ''}
                    </p>
                    <p className="text-xs text-gray-400">{m.count}개 구독</p>
                  </div>
                  <p className="text-base font-bold text-gray-900">{formatPrice(m.total)}<span className="text-xs font-normal text-gray-400">/월</span></p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 구독 목록 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">구독 목록</h2>
            <button
              onClick={handleAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              추가
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-gray-400 text-sm">불러오는 중...</div>
          ) : subscriptions.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
              <p className="text-gray-400 text-sm">등록된 구독이 없습니다.</p>
              <button onClick={handleAdd} className="mt-3 text-sm text-indigo-600 hover:underline">
                첫 구독 추가하기
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {subscriptions.map((sub) => (
                <SubscriptionCard key={sub.id} subscription={sub} onEdit={handleEdit} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      </main>

      <SubscriptionModal isOpen={modalOpen} onClose={handleModalClose} editTarget={editTarget} />
    </div>
  )
}
