import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  LayoutDashboard,
  Users,
  Package,
  Warehouse,
  ShoppingCart,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Boxes,
} from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: '仪表盘', end: true },
  { to: '/customers', icon: Users, label: '客户管理' },
  { to: '/products', icon: Package, label: '产品管理' },
  { to: '/inventory', icon: Warehouse, label: '库存管理' },
  { to: '/orders', icon: ShoppingCart, label: '订单管理' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex bg-surface-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 h-screen w-[260px]
          bg-surface-900 text-white flex flex-col
          transform transition-transform duration-300 ease-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Logo area */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-white/10 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
            <Boxes size={18} className="text-white" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight">CRM+ERP</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20'
                    : 'text-surface-300 hover:bg-white/8 hover:text-white'
                }`
              }
            >
              <item.icon size={18} className="flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              <ChevronRight size={14} className="opacity-0 group-hover:opacity-50 transition-opacity" />
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-brand-500/30 flex items-center justify-center text-brand-300 font-semibold text-sm">
              {(user?.username || 'U')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.username || '用户'}</p>
              <p className="text-xs text-surface-400 truncate">{user?.email || ''}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-surface-400 hover:text-white"
              title="退出登录"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-xl border-b border-surface-100 flex items-center px-4 lg:px-8 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 hover:bg-surface-100 rounded-xl transition-colors"
          >
            <Menu size={20} className="text-surface-600" />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
