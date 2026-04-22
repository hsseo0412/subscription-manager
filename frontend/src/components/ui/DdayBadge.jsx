export default function DdayBadge({ days }) {
  if (days === 0) return <span className="text-xs font-medium px-1.5 py-0.5 rounded-full text-red-500 bg-red-50">오늘</span>
  if (days <= 3)  return <span className="text-xs font-medium px-1.5 py-0.5 rounded-full text-orange-500 bg-orange-50">D-{days}</span>
  return <span className="text-xs font-medium px-1.5 py-0.5 rounded-full text-gray-400 bg-gray-100">D-{days}</span>
}
