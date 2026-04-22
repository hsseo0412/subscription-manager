import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/axios'

const BASE_KEY = 'subscriptions'

/** GET /api/subscriptions — 구독 목록 + monthly_total 반환 */
async function fetchSubscriptions(status) {
  const params = status ? { status } : {}
  const { data } = await api.get('/api/subscriptions', { params })
  return data.data
}

/** GET /api/subscriptions/stats — 카테고리별 지출 통계 */
async function fetchStats() {
  const { data } = await api.get('/api/subscriptions/stats')
  return data.data
}

/** 구독 목록 조회 훅 (status 필터 선택적) */
export function useSubscriptions(status) {
  return useQuery({
    queryKey: [BASE_KEY, status ?? 'all'],
    queryFn: () => fetchSubscriptions(status),
  })
}

/** 카테고리별 지출 통계 훅 */
export function useSubscriptionStats() {
  return useQuery({
    queryKey: [BASE_KEY, 'stats'],
    queryFn: fetchStats,
  })
}

/** POST /api/subscriptions — 새 구독 등록, 성공 시 목록 갱신 */
export function useCreateSubscription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => api.post('/api/subscriptions', payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [BASE_KEY] }),
  })
}

/** PUT /api/subscriptions/:id — 구독 수정, 성공 시 목록 갱신 */
export function useUpdateSubscription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }) => api.put(`/api/subscriptions/${id}`, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [BASE_KEY] }),
  })
}

/** PATCH /api/subscriptions/:id/status — 구독 상태 변경 */
export function useUpdateSubscriptionStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }) => api.patch(`/api/subscriptions/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [BASE_KEY] }),
  })
}

/** DELETE /api/subscriptions/:id — 구독 삭제, 성공 시 목록 갱신 */
export function useDeleteSubscription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.delete(`/api/subscriptions/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [BASE_KEY] }),
  })
}
