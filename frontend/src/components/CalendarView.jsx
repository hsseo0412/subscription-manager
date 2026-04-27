import { useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { toKrw } from '../hooks/useExchangeRates'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
const MONTH_NAMES = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']

function formatKrw(amount) {
  return amount.toLocaleString('ko-KR') + '원'
}

export default function CalendarView({ subscriptions = [], paymentMap = {}, rates, onEdit }) {
  const now = new Date()
  const [year, setYear]   = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth()) // 0-indexed

  const todayDate  = now.getDate()
  const todayMonth = now.getMonth()
  const todayYear  = now.getFullYear()

  const lastDay      = new Date(year, month + 1, 0).getDate()
  const firstWeekday = new Date(year, month, 1).getDay()

  // Group non-cancelled subs by clamped billing_date
  const subsByDay = {}
  subscriptions.forEach((sub) => {
    if (sub.status === 'cancelled') return
    // Yearly subs with billing_month only appear in their billing month
    if (sub.billing_cycle === 'yearly' && sub.billing_month != null) {
      if (sub.billing_month - 1 !== month) return
    }
    const day = Math.min(sub.billing_date, lastDay)
    subsByDay[day] = [...(subsByDay[day] ?? []), sub]
  })

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }

  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  // Leading empty cells + day cells
  const cells = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: lastDay }, (_, i) => i + 1),
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
      {/* Month navigation */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
        <button
          onClick={prevMonth}
          className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </button>
        <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
          {year}년 {MONTH_NAMES[month]}
        </span>
        <button
          onClick={nextMonth}
          className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-700">
        {WEEKDAYS.map((wd, i) => (
          <div
            key={wd}
            className={`text-center text-xs font-medium py-2 ${
              i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400 dark:text-gray-500'
            }`}
          >
            {wd}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7">
        {cells.map((day, idx) => {
          if (day === null) {
            return (
              <div
                key={`empty-${idx}`}
                className="min-h-[90px] border-r border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30"
              />
            )
          }

          const isToday   = day === todayDate && month === todayMonth && year === todayYear
          const daySubs   = subsByDay[day] ?? []
          const visible   = daySubs.slice(0, 3)
          const overflow  = daySubs.length - 3

          return (
            <div
              key={day}
              className={`min-h-[90px] border-r border-b border-gray-100 dark:border-gray-700 p-1.5 flex flex-col gap-1 ${
                isToday ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
              }`}
            >
              {/* Date number */}
              <span
                className={`text-xs font-semibold self-end w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0 ${
                  isToday
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {day}
              </span>

              {/* Subscription chips */}
              {visible.map((sub) => {
                const currency = sub.currency ?? 'KRW'
                const priceKrw = toKrw(sub.price, currency, rates)
                const pm       = paymentMap[sub.payment_method_id]
                const isYearly = sub.billing_cycle === 'yearly'
                const isPaused = sub.status === 'paused'
                const color    = sub.color || '#6366f1'

                return (
                  <button
                    key={sub.id}
                    onClick={() => onEdit(sub)}
                    title={`${sub.name} — ${formatKrw(priceKrw)}`}
                    className={`w-full text-left rounded px-1.5 py-1 text-xs transition-opacity hover:opacity-70 ${isPaused ? 'opacity-50' : ''}`}
                    style={{
                      backgroundColor: color + '1a',
                      borderLeft: `2px solid ${color}`,
                    }}
                  >
                    <p className="font-medium truncate leading-tight" style={{ color }}>
                      {sub.name}
                      {isYearly && (
                        <span className="ml-1 text-[10px] opacity-60">연간</span>
                      )}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 truncate leading-tight">
                      {formatKrw(priceKrw)}
                    </p>
                    {pm && (
                      <p className="text-gray-400 truncate leading-tight">
                        {pm.name}{pm.last4 ? ` (${pm.last4})` : ''}
                      </p>
                    )}
                  </button>
                )
              })}

              {overflow > 0 && (
                <span className="text-[10px] text-gray-400 px-1">+{overflow}개 더</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
