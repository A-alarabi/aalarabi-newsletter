import { cn } from '@/lib/utils'

interface BadgeProps {
  status: 'draft' | 'published'
  className?: string
}

export default function Badge({ status, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
        status === 'published'
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          : 'bg-gray-100 text-gray-600 border border-gray-200',
        className
      )}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full',
          status === 'published' ? 'bg-emerald-500' : 'bg-gray-400'
        )}
      />
      {status === 'published' ? 'منشور' : 'مسودة'}
    </span>
  )
}
