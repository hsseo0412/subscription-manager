import { Skeleton } from '@/components/ui/skeleton'

export default function SubscriptionSkeleton({ count = 4 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
          <div className="text-right space-y-1 flex-shrink-0">
            <Skeleton className="h-5 w-20 ml-auto" />
            <Skeleton className="h-3 w-10 ml-auto" />
          </div>
        </div>
      ))}
    </div>
  )
}
