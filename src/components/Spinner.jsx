export default function Spinner({ size = 'md' }) {
  const sizeMap = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }
  return (
    <div className="flex items-center justify-center py-12">
      <div className={`${sizeMap[size]} border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin`} />
    </div>
  )
}
