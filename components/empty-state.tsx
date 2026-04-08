import { cn } from '@/lib/utils'
import { Inbox } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-14 text-center', className)}>
      <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500">
        <Inbox className="h-5 w-5" />
      </div>
      <h3 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h3>
      {description && <p className="mt-1 max-w-xs text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
