import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
  useSubscriptions,
  useDeleteSubscription,
  useUpdateSubscriptionStatus,
  useSubscriptionStats,
} from '../hooks/useSubscriptions'
import { usePaymentMethods } from '../hooks/usePaymentMethods'
import SubscriptionModal from '../components/SubscriptionModal'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const TYPE_LABELS = { card: '카드', transfer: '계좌이체', cash: '현금', etc: '기타' }

const CHART_COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444',
  '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6',
]

const STATUS_LABELS = { active: '활성', paused: '일시정지', cancelled: '해지' }
const STATUS_STYLES = {
  active:    'text-green-600 bg-green-50',
  paused:    'text-amber-600 bg-amber-50',
  cancelled: 'text-gray-400 bg-gray-100',
}

const FILTER_TABS = [
  { value: undefined, label: '전체' },
  { value: 'active',    label: '활성' },
  { value: 'paused',    label: '일시정지' },
  { value: 'cancelled', label: '해지' },
]

function formatPrice(price) {
  return price.toLocaleString('ko-KR') + '원'
}

function DdayBadge({ days }) {
  if (days === 0) return <span className="text-xs font-medium px-1.5 py-0.5 rounded-full text-red-500 bg-red-50">오늘</span>
  if (days <= 3)  return <span className="text-xs font-medium px-1.5 py-0.5 rounded-full text-orange-500 bg-orange-50">D-{days}</span>
  return <span className="text-xs font-medium px-1.5 py-0.5 rounded-full text-gray-400 bg-gray-100">D-{days}</span>
}

function SubscriptionCard({ subscription, onEdit, onDelete, onStatusChange }) {
  const isYearly     = subscription.billing_cycle === 'yearly'
  const perPerson    = subscription.members > 1
    ? Math.round((isYearly ? Math.round(subscription.price / 12) : subscription.price) / subscription.members)
    : null

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-between gap-4 ${subscription.status === 'cancelled' ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl flex-shrink-0" style={{ backgroundColor: subscription.color || '#6366f1' }} />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-gray-900 truncate">{subscription.name}</p>
            <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full flex-shrink-0 ${STATUS_STYLES[subscription.status]}`}>
              {STATUS_LABELS[subscription.status]}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {subscription.category && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{subscription.category}</span>
            )}
            <span className="text-xs text-gray-400">매월 {subscription.billing_date}일</span>
            {subscription.days_until_billing != null && subscription.status === 'active' && (
              <DdayBadge days={subscription.days_until_billing} />
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="text-right">
          <p className="font-bold text-gray-900">{formatPrice(subscription.price)}</p>
          <p className="text-xs text-gray-400">{isYearly ? '/ 년' : '/ 월'}</p>
          {perPerson && (
            <p className="text-xs text-indigo-400">1인 {formatPrice(perPerson)}</p>
          )}
        </div>
        <div className="flex gap-1 items-center">
          {subscription.website && (
            <a
              href={subscription.website}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
          <select
            value={subscription.status}
            onChange={(e) => onStatusChange(subscription.id, e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-1.5 py-1 text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
          >
            <option value="active">활성</option>
            <option value="paused">일시정지</option>
            <option value="cancelled">해지</option>
          </select>
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
  const [statusFilter, setStatusFilter] = useState(undefined)
  const { data, isLoading } = useSubscriptions(statusFilter)
  const { data: paymentMethods = [] } = usePaymentMethods()
  const { data: statsData } = useSubscriptionStats()
  const deleteMutation = useDeleteSubscription()
  const statusMutation = useUpdateSubscriptionStatus()

  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortKey, setSortKey] = useState('billing_date')
  const [categoryFilter, setCategoryFilter] = useState('')

  const subscriptions  = data?.subscriptions ?? []
  const monthlyTotal   = data?.monthly_total ?? 0
  const breakdown      = statsData?.category_breakdown ?? []
  const annualForecast = statsData?.annual_forecast ?? 0

  // 결제수단별 집계 — active 구독만 포함
  const paymentSummary = paymentMethods.map((m) => {
    const linked = subscriptions.filter((s) => s.payment_method_id === m.id && s.status === 'active')
    const total  = linked.reduce((sum, s) => {
      const base = s.billing_cycle === 'yearly' ? Math.round(s.price / 12) : s.price
      return sum + Math.round(base / Math.max(1, s.members || 1))
    }, 0)
    return { ...m, count: linked.length, total }
  }).filter((m) => m.count > 0)

  const displayed = subscriptions
    .filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter((s) => !categoryFilter || s.category === categoryFilter)
    .sort((a, b) => {
      if (sortKey === 'price') return b.price - a.price
      if (sortKey === 'name')  return a.name.localeCompare(b.name, 'ko')
      return a.billing_date - b.billing_date
    })

  const handleEdit        = (subscription) => { setEditTarget(subscription); setModalOpen(true) }
  const handleAdd         = () => { setEditTarget(null); setModalOpen(true) }
  const handleDelete      = (id) => { if (window.confirm('이 구독을 삭제하시겠습니까?')) deleteMutation.mutate(id) }
  const handleModalClose  = () => { setModalOpen(false); setEditTarget(null) }
  const handleStatusChange = (id, status) => statusMutation.mutate({ id, status })

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
              마이페이지
            </Link>
            <button onClick={logout} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
              로그아웃
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 pt-8 pb-16 space-y-6">

        {/* 요약 카드 */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-indigo-600 rounded-2xl p-5 text-white">
            <p className="text-sm text-indigo-200">이번 달 총 구독료</p>
            <p className="text-2xl font-bold mt-1">{formatPrice(monthlyTotal)}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">활성 구독</p>
            <p className="text-2xl font-bold mt-1 text-gray-900">
              {subscriptions.filter((s) => s.status === 'active').length}
              <span className="text-base font-normal text-gray-400 ml-1">개</span>
            </p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">연간 예상 지출</p>
            <p className="text-2xl font-bold mt-1 text-gray-900">{formatPrice(annualForecast)}</p>
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

        {/* 카테고리별 지출 */}
        {breakdown.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-base font-semibold text-gray-900">카테고리별 지출</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-6">
              <div className="flex-shrink-0">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie
                      data={breakdown}
                      dataKey="monthly_cost"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                    >
                      {breakdown.map((_, index) => (
                        <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value.toLocaleString('ko-KR') + '원', '월 구독료']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="flex-1 space-y-1.5">
                {breakdown.slice().sort((a, b) => b.monthly_cost - a.monthly_cost).map((item, index) => (
                  <li key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                      <span className="text-gray-700">{item.name}</span>
                    </div>
                    <span className="font-medium text-gray-900">{item.monthly_cost.toLocaleString('ko-KR')}원</span>
                  </li>
                ))}
              </ul>
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

          {/* 검색 + 정렬 */}
          <div className="flex gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg pl-3 pr-8 py-1.5 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="">전체 카테고리</option>
              {['동영상', '음악', '게임', '업무', '클라우드', '쇼핑', '기타'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="서비스명 검색"
                className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
              />
            </div>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg pl-3 pr-8 py-1.5 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="billing_date">결제일순</option>
              <option value="price">금액높은순</option>
              <option value="name">이름순</option>
            </select>
          </div>

          {/* 상태 필터 탭 */}
          <div className="flex gap-1">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.label}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  statusFilter === tab.value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-gray-400 text-sm">불러오는 중...</div>
          ) : subscriptions.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
              <p className="text-gray-400 text-sm">등록된 구독이 없습니다.</p>
              {!statusFilter && (
                <button onClick={handleAdd} className="mt-3 text-sm text-indigo-600 hover:underline">
                  첫 구독 추가하기
                </button>
              )}
            </div>
          ) : displayed.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
              <p className="text-gray-400 text-sm">검색 결과가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {displayed.map((sub) => (
                <SubscriptionCard
                  key={sub.id}
                  subscription={sub}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <SubscriptionModal isOpen={modalOpen} onClose={handleModalClose} editTarget={editTarget} />
    </div>
  )
}
