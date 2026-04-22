import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'

export default function EmptyState({ onAdd }) {
  return (
    <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200">
      <svg className="mx-auto w-16 h-16 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <h3 className="mt-4 text-base font-semibold text-gray-700">구독을 추가해보세요</h3>
      <p className="mt-1 text-sm text-gray-400">넷플릭스, 스포티파이 등 구독 중인 서비스를 등록하세요.</p>
      <Button onClick={onAdd} size="sm" className="mt-5">
        <PlusIcon className="w-4 h-4 mr-1.5" />
        첫 구독 추가하기
      </Button>
    </div>
  )
}
