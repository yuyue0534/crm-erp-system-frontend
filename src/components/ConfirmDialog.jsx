import { AlertTriangle } from 'lucide-react'

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, loading }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-w-sm w-full bg-white rounded-2xl shadow-modal animate-slide-up p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} className="text-accent-rose" />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-semibold text-surface-900">{title || '确认操作'}</h3>
            <p className="mt-1.5 text-sm text-surface-500">{message || '确定要执行此操作吗？此操作不可撤销。'}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="btn-secondary" disabled={loading}>取消</button>
          <button onClick={onConfirm} className="btn-danger" disabled={loading}>
            {loading ? '处理中...' : '确认删除'}
          </button>
        </div>
      </div>
    </div>
  )
}
