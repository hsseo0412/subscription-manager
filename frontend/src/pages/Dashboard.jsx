import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
  useSubscriptions,
  useDeleteSubscription,
  useUpdateSubscriptionStatus,
  useSubscriptionStats,
  useMonthlyHistory,
} from '../hooks/useSubscriptions'
import { usePaymentMethods } from '../hooks/usePaymentMethods'
import SubscriptionModal from '../components/SubscriptionModal'
import HeroBand from '../components/HeroBand'
import EmptyState from '../components/EmptyState'
import SubscriptionSkeleton from '../components/ui/SubscriptionSkeleton'
import StatsSkeleton from '../components/ui/StatsSkeleton'
import DdayBadge from '../components/ui/DdayBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts'
import { PlusIcon, SearchIcon, SunIcon, MoonIcon } from 'lucide-react'
import useThemeStore from '../stores/themeStore'

const TYPE_LABELS = { card: '카드', transfer: '계좌이체', cash: '현금', etc: '기타' }

function TrialBadge({ days }) {
  if (days < 0) return null
  if (days === 0) return (
    <span className="text-xs font-medium px-1.5 py-0.5 rounded-full text-red-600 bg-red-50 dark:bg-red-900/30">체험 오늘 만료</span>
  )
  if (days <= 3) return (
    <span className="text-xs font-medium px-1.5 py-0.5 rounded-full text-orange-500 bg-orange-50 dark:bg-orange-900/30">체험 D-{days}</span>
  )
  return (
    <span className="text-xs font-medium px-1.5 py-0.5 rounded-full text-violet-500 bg-violet-50 dark:bg-violet-900/30">체험 D-{days}</span>
  )
}

const CHART_COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444',
  '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6',
]

const STATUS_LABELS = { active: '활성', paused: '일시정지', cancelled: '해지' }
const STATUS_STYLES = {
  active:    'text-green-600 bg-green-50 dark:bg-green-900/20',
  paused:    'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
  cancelled: 'text-gray-400 bg-gray-100 dark:bg-gray-700',
}

const FILTER_TABS = [
  { value: undefined, label: '전체' },
  { value: 'active',    label: '활성' },
  { value: 'paused',    label: '일시정지' },
  { value: 'cancelled', label: '해지' },
]

const CATEGORIES = ['동영상', '음악', '게임', '업무', '클라우드', '쇼핑', '기타']

function formatPrice(price) {
  return price.toLocaleString('ko-KR') + '원'
}

function SubscriptionCard({ subscription, paymentMethod, onEdit, onDelete, onStatusChange }) {
  const isYearly  = subscription.billing_cycle === 'yearly'
  const perPerson = subscription.members > 1
    ? Math.round((isYearly ? Math.round(subscription.price / 12) : subscription.price) / subscription.members)
    : null

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 space-y-2 ${subscription.status === 'cancelled' ? 'opacity-60' : ''}`}>
      {/* 1행: 색상 점 + 서비스명/상태 + 금액 */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex-shrink-0 mt-0.5" style={{ backgroundColor: subscription.color || '#6366f1' }} />
        <div className="flex-1 min-w-0 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{subscription.name}</p>
            {subscription.memo && (
              <p className="text-xs text-gray-400 truncate mt-0.5" title={subscription.memo}>
                {subscription.memo}
              </p>
            )}
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">
              {formatPrice(subscription.price)} <span className="font-normal text-gray-400">{isYearly ? '/ 년' : '/ 월'}</span>
            </p>
            {paymentMethod && (
              <p className="text-xs text-gray-400 mt-0.5">
                {TYPE_LABELS[paymentMethod.type] ?? paymentMethod.type} · {paymentMethod.name}{paymentMethod.last4 ? ` (${paymentMethod.last4})` : ''}
              </p>
            )}
            {perPerson && (
              <p className="text-xs text-indigo-400">1인 {formatPrice(perPerson)}</p>
            )}
          </div>
        </div>
      </div>

      {/* 2행: 메타 정보 + 액션 버튼 */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
          {subscription.category && (
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">{subscription.category}</span>
          )}
          <span className="text-xs text-gray-400">
            {isYearly && subscription.billing_month
              ? `매년 ${subscription.billing_month}월 ${subscription.billing_date}일`
              : `매월 ${subscription.billing_date}일`}
          </span>
          {subscription.days_until_billing != null && subscription.status === 'active' && (
            <DdayBadge days={subscription.days_until_billing} />
          )}
          {subscription.days_until_trial_end != null && (
            <TrialBadge days={subscription.days_until_trial_end} />
          )}
        </div>
        <div className="flex gap-1 items-center flex-shrink-0">
          <select
            value={subscription.status}
            onChange={(e) => onStatusChange(subscription.id, e.target.value)}
            title="구독 상태 변경"
            className="text-xs border border-gray-200 dark:border-gray-600 rounded-lg pl-1.5 pr-7 py-1 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-400"
          >
            <option value="active">활성</option>
            <option value="paused">일시정지</option>
            <option value="cancelled">해지</option>
          </select>
          {subscription.website ? (
            <a
              href={subscription.website}
              target="_blank"
              rel="noopener noreferrer"
              title="홈페이지 방문"
              className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          ) : (
            <span title="홈페이지 주소가 등록되지 않아 이용 불가" className="p-1.5 text-gray-200 cursor-not-allowed rounded-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </span>
          )}
          <button title="수정" onClick={() => onEdit(subscription)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button title="삭제" onClick={() => onDelete(subscription.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
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
  const { logout } = useAuth()
  const { theme, toggleTheme } = useThemeStore()
  const [statusFilter, setStatusFilter] = useState(undefined)
  const { data, isLoading } = useSubscriptions(statusFilter)
  const { data: paymentMethods = [] } = usePaymentMethods()
  const { data: statsData } = useSubscriptionStats()
  const { data: historyData } = useMonthlyHistory()
  const deleteMutation = useDeleteSubscription()
  const statusMutation = useUpdateSubscriptionStatus()

  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortKey, setSortKey] = useState('billing_date')
  const [categoryFilter, setCategoryFilter] = useState('')

  const paymentMap     = Object.fromEntries(paymentMethods.map(m => [m.id, m]))
  const subscriptions  = data?.subscriptions ?? []
  const monthlyTotal   = data?.monthly_total ?? 0
  const breakdown      = statsData?.category_breakdown ?? []
  const annualForecast = statsData?.annual_forecast ?? 0
  const activeCount    = subscriptions.filter((s) => s.status === 'active').length

  const nextBillingSub = subscriptions
    .filter((s) => s.status === 'active' && s.days_until_billing != null)
    .sort((a, b) => a.days_until_billing - b.days_until_billing)[0] ?? null

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const paymentSummary = paymentMethods.map((m) => {
    const linked = subscriptions.filter((s) => {
      if (s.payment_method_id !== m.id || s.status !== 'active') return false
      if (s.trial_ends_at) {
        const trialEnd = new Date(s.trial_ends_at); trialEnd.setHours(0, 0, 0, 0)
        if (trialEnd >= today) return false
      }
      return true
    })
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

  const handleEdit         = (sub) => { setEditTarget(sub); setModalOpen(true) }
  const handleAdd          = () => { setEditTarget(null); setModalOpen(true) }
  const handleDelete       = (id) => { if (window.confirm('이 구독을 삭제하시겠습니까?')) deleteMutation.mutate(id) }
  const handleModalClose   = () => { setModalOpen(false); setEditTarget(null) }
  const handleStatusChange = (id, status) => statusMutation.mutate({ id, status })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* 내비게이션 */}
      <nav className="bg-white dark:bg-gray-900 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg" />
            <span className="text-lg font-bold text-gray-900 dark:text-white">SubManager</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? '라이트 모드' : '다크 모드'}
              className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              {theme === 'dark' ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
            </button>
            <Link to="/mypage" className="text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              마이페이지
            </Link>
            <button onClick={logout} className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
              로그아웃
            </button>
          </div>
        </div>
      </nav>

      {/* 히어로 배너 */}
      <HeroBand
        monthlyTotal={monthlyTotal}
        activeCount={activeCount}
        annualForecast={annualForecast}
        nextBillingSub={nextBillingSub}
      />

      {/* 메인 2컬럼 레이아웃 */}
      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">

        {/* 좌측: 구독 목록 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">구독 목록</h2>
            <Button onClick={handleAdd} size="sm">
              <PlusIcon className="w-4 h-4 mr-1" />
              추가
            </Button>
          </div>

          {/* 검색 + 정렬 */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="서비스명 검색"
                className="pl-9 h-9 text-sm"
              />
            </div>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg pl-3 pr-8 py-1.5 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="billing_date">결제일순</option>
              <option value="price">금액높은순</option>
              <option value="name">이름순</option>
            </select>
          </div>

          {/* 카테고리 필터 — 모바일: pill 가로 스크롤 / 데스크탑: select */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide lg:hidden">
            {['전체', ...CATEGORIES].map((c) => {
              const isActive = c === '전체' ? categoryFilter === '' : categoryFilter === c
              return (
                <button
                  key={c}
                  onClick={() => setCategoryFilter(c === '전체' ? '' : c)}
                  className={`flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {c}
                </button>
              )
            })}
          </div>
          <div className="hidden lg:block">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg pl-3 pr-8 py-1.5 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 w-auto"
            >
              <option value="">전체 카테고리</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* 상태 필터 탭 */}
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.label}
                onClick={() => setStatusFilter(tab.value)}
                className={`flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  statusFilter === tab.value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 목록 본문 */}
          {isLoading ? (
            <SubscriptionSkeleton count={4} />
          ) : subscriptions.length === 0 && !statusFilter ? (
            <EmptyState onAdd={handleAdd} />
          ) : displayed.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
              <p className="text-gray-400 text-sm">검색 결과가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {displayed.map((sub) => (
                <SubscriptionCard
                  key={sub.id}
                  subscription={sub}
                  paymentMethod={paymentMap[sub.payment_method_id]}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </div>

        {/* 우측: 통계 사이드바 */}
        <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          {!statsData ? (
            <StatsSkeleton />
          ) : (
            <>
              {/* 카테고리별 지출 */}
              {breakdown.length > 0 && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">카테고리별 지출</h2>
                  <div className="flex flex-col items-center gap-4">
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie data={breakdown} dataKey="monthly_cost" nameKey="name" cx="50%" cy="50%" outerRadius={70}>
                          {breakdown.map((_, index) => (
                            <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [value.toLocaleString('ko-KR') + '원', '월 구독료']} />
                      </PieChart>
                    </ResponsiveContainer>
                    <ul className="w-full space-y-1.5">
                      {breakdown.slice().sort((a, b) => b.monthly_cost - a.monthly_cost).map((item, index) => (
                        <li key={item.name} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                            <span className="text-gray-700 dark:text-gray-300">{item.name}</span>
                          </div>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{item.monthly_cost.toLocaleString('ko-KR')}원</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* 월별 지출 추이 */}
              {historyData && historyData.some(h => h.total > 0) && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">월별 지출 추이</h2>
                  <ResponsiveContainer width="100%" height={150}>
                    <AreaChart data={historyData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                      <defs>
                        <linearGradient id="historyGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis
                        tickFormatter={(v) => v >= 10000 ? `${Math.round(v / 10000)}만` : `${Math.round(v / 1000)}천`}
                        tick={{ fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                        width={32}
                      />
                      <Tooltip formatter={(v) => [`${v.toLocaleString('ko-KR')}원`, '월 구독료']} />
                      <Area
                        type="monotone"
                        dataKey="total"
                        stroke="#6366f1"
                        fill="url(#historyGradient)"
                        strokeWidth={2}
                        dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }}
                        activeDot={{ r: 5 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* 결제수단별 현황 */}
              {paymentSummary.length > 0 && (
                <div className="space-y-2">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">결제수단별 현황</h2>
                  {paymentSummary.map((m) => (
                    <div key={m.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm px-4 py-3 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{TYPE_LABELS[m.type]}</span>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5">
                          {m.name}{m.last4 ? ` (${m.last4})` : ''}
                        </p>
                        <p className="text-xs text-gray-400">{m.count}개 구독</p>
                      </div>
                      <p className="text-base font-bold text-gray-900 dark:text-gray-100">
                        {formatPrice(m.total)}<span className="text-xs font-normal text-gray-400">/월</span>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <SubscriptionModal isOpen={modalOpen} onClose={handleModalClose} editTarget={editTarget} />
    </div>
  )
}
