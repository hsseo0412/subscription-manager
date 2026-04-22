import DdayBadge from './ui/DdayBadge'

function formatPrice(price) {
  return price.toLocaleString('ko-KR') + '원'
}

export default function HeroBand({ monthlyTotal, activeCount, annualForecast, nextBillingSub }) {
  return (
    <section className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <p className="text-indigo-200 text-sm">이번 달 총 구독료</p>
          <p className="text-4xl sm:text-5xl font-extrabold tracking-tight mt-1">{formatPrice(monthlyTotal)}</p>
          <div className="flex gap-4 mt-3 text-sm text-indigo-200">
            <span>활성 구독 <strong className="text-white">{activeCount}개</strong></span>
            <span>연간 예상 <strong className="text-white">{formatPrice(annualForecast)}</strong></span>
          </div>
        </div>
        {nextBillingSub && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-4 text-center min-w-[148px] flex-shrink-0">
            <DdayBadge days={nextBillingSub.days_until_billing} />
            <p className="text-white font-semibold mt-2 text-sm">{nextBillingSub.name}</p>
            <p className="text-indigo-200 text-xs mt-0.5">
              {nextBillingSub.billing_month
                ? `${nextBillingSub.billing_month}월 ${nextBillingSub.billing_date}일`
                : `매월 ${nextBillingSub.billing_date}일`}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
