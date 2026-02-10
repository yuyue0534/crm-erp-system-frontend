export default function StatCard({ icon: Icon, label, value, color = 'brand', sub }) {
  const colorMap = {
    brand: 'bg-brand-50 text-brand-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
    violet: 'bg-violet-50 text-violet-600',
  }

  return (
    <div className="card p-5 flex items-start gap-4 hover:shadow-card-hover transition-shadow duration-300">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${colorMap[color]}`}>
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-surface-500 font-medium">{label}</p>
        <p className="text-2xl font-display font-bold text-surface-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-surface-400 mt-1">{sub}</p>}
      </div>
    </div>
  )
}
