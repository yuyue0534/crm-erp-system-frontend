import { Inbox } from 'lucide-react'

export default function EmptyState({ icon: Icon = Inbox, title = '暂无数据', description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center mb-4">
        <Icon size={28} className="text-surface-400" />
      </div>
      <p className="font-medium text-surface-700">{title}</p>
      {description && <p className="text-sm text-surface-400 mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
