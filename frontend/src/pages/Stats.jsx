import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useSubscriptionStats } from '../hooks/useSubscriptions'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const CHART_COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444',
  '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6',
]

function formatPrice(price) {
  return price.toLocaleString('ko-KR') + '원'
}

export default function Stats() {
  const { user, logout } = useAuth()
  const { data, isLoading } = useSubscriptionStats()

  const breakdown     = data?.category_breakdown ?? []
  const monthlyTotal  = data?.monthly_total ?? 0
  const annualForecast = data?.annual_forecast ?? 0

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg" />
            <span className="text-lg font-bold text-gray-900">SubManager</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
              대시보드
            </Link>
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
        <h1 className="text-xl font-bold text-gray-900">지출 통계</h1>

        {isLoading ? (
          <div className="text-center py-12 text-gray-400 text-sm">불러오는 중...</div>
        ) : breakdown.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
            <p className="text-gray-400 text-sm">활성 구독이 없습니다.</p>
            <Link to="/dashboard" className="mt-3 inline-block text-sm text-indigo-600 hover:underline">
              구독 추가하러 가기
            </Link>
          </div>
        ) : (
          <>
            {/* 요약 카드 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500">월 구독료 합계</p>
                <p className="text-2xl font-bold mt-1 text-gray-900">{formatPrice(monthlyTotal)}</p>
                <p className="text-xs text-gray-400 mt-0.5">활성 구독 기준, 1인 부담금</p>
              </div>
              <div className="bg-indigo-600 rounded-2xl p-5 text-white">
                <p className="text-sm text-indigo-200">연간 예상 지출</p>
                <p className="text-2xl font-bold mt-1">{formatPrice(annualForecast)}</p>
                <p className="text-xs text-indigo-300 mt-0.5">월 합계 × 12개월</p>
              </div>
            </div>

            {/* 카테고리별 파이 차트 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-base font-semibold text-gray-900 mb-4">카테고리별 구독료</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={breakdown}
                    dataKey="monthly_cost"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {breakdown.map((_, index) => (
                      <Cell
                        key={index}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [formatPrice(value), '월 구독료']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* 카테고리별 목록 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-base font-semibold text-gray-900 mb-3">카테고리별 상세</h2>
              <div className="space-y-2">
                {breakdown
                  .slice()
                  .sort((a, b) => b.monthly_cost - a.monthly_cost)
                  .map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                        />
                        <span className="text-sm text-gray-700">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-gray-900">{formatPrice(item.monthly_cost)}</span>
                        <span className="text-xs text-gray-400 ml-1">/월</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
