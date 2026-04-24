import { useQuery } from '@tanstack/react-query'
import api from '../lib/axios'

async function fetchExchangeRates() {
  const { data } = await api.get('/api/exchange-rates')
  return data.data // { USD: 1380, EUR: 1500 }
}

/** GET /api/exchange-rates — 현재 환율 조회 (KRW 기준, 하루 1회 갱신) */
export function useExchangeRates() {
  return useQuery({
    queryKey: ['exchange-rates'],
    queryFn: fetchExchangeRates,
    staleTime: 1000 * 60 * 60, // 1h — 서버에서 24h 캐시되므로 프론트도 오래 유지
    retry: false,
  })
}

/** 외화 금액을 원화로 환산하는 유틸 */
export function toKrw(amount, currency, rates) {
  if (!rates || currency === 'KRW') return amount
  const rate = rates[currency] ?? 1
  return Math.round(amount * rate)
}
