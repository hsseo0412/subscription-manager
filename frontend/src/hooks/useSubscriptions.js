import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/axios'

const QUERY_KEY = ['subscriptions']

/** GET /api/subscriptions — 구독 목록 + monthly_total 반환 */
async function fetchSubscriptions() {
  const { data } = await api.get('/api/subscriptions')
  return data.data
}

/** 구독 목록 조회 훅 (TanStack Query) */
export function useSubscriptions() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchSubscriptions,
  })
}

/** POST /api/subscriptions — 새 구독 등록, 성공 시 목록 갱신 */
export function useCreateSubscription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => api.post('/api/subscriptions', payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}

/** PUT /api/subscriptions/:id — 구독 수정, 성공 시 목록 갱신 */
export function useUpdateSubscription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }) => api.put(`/api/subscriptions/${id}`, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}

/** DELETE /api/subscriptions/:id — 구독 삭제, 성공 시 목록 갱신 */
export function useDeleteSubscription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.delete(`/api/subscriptions/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}
