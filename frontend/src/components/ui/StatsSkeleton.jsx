import { Skeleton } from '@/components/ui/skeleton'

export default function StatsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-6">
        <Skeleton className="w-40 h-40 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2.5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 px-4 py-3">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-5 w-24" />
          </div>
        ))}
      </div>
    </div>
  )
}
