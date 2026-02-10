import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { customerAPI, productAPI, inventoryAPI, orderAPI } from '../api'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import Spinner from '../components/Spinner'
import { Users, Package, Warehouse, ShoppingCart, TrendingUp, ArrowRight } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [recentOrders, setRecentOrders] = useState([])

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setLoading(true)
    try {
      const [custRes, prodRes, invRes, ordRes] = await Promise.allSettled([
        customerAPI.list({ page: 1, page_size: 1 }),
        productAPI.list({ page: 1, page_size: 1 }),
        inventoryAPI.list({ page: 1, page_size: 1 }),
        orderAPI.list({ page: 1, page_size: 5 }),
      ])

      const getTotal = (res) => {
        if (res.status !== 'fulfilled') return 0
        const d = res.value.data
        return d?.data?.total ?? d?.total ?? (Array.isArray(d?.data) ? d.data.length : 0)
      }

      const getList = (res) => {
        if (res.status !== 'fulfilled') return []
        const d = res.value.data
        return d?.data?.list ?? d?.data?.items ?? d?.data ?? []
      }

      setStats({
        customers: getTotal(custRes),
        products: getTotal(prodRes),
        inventory: getTotal(invRes),
        orders: getTotal(ordRes),
      })
      setRecentOrders(Array.isArray(getList(ordRes)) ? getList(ordRes).slice(0, 5) : [])
    } catch {
      setStats({ customers: 0, products: 0, inventory: 0, orders: 0 })
    } finally {
      setLoading(false)
    }
  }

  const statusColor = (status) => {
    const map = {
      pending: 'bg-amber-50 text-amber-700',
      confirmed: 'bg-blue-50 text-blue-700',
      shipped: 'bg-violet-50 text-violet-700',
      completed: 'bg-emerald-50 text-emerald-700',
      cancelled: 'bg-red-50 text-red-700',
    }
    return map[status] || 'bg-surface-100 text-surface-600'
  }

  const statusLabel = (status) => {
    const map = {
      pending: '待处理',
      confirmed: '已确认',
      shipped: '已发货',
      completed: '已完成',
      cancelled: '已取消',
    }
    return map[status] || status
  }

  if (loading) return <Spinner />

  const quickLinks = [
    { label: '新增客户', path: '/customers', color: 'text-brand-600 bg-brand-50 hover:bg-brand-100' },
    { label: '新增产品', path: '/products', color: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' },
    { label: '创建订单', path: '/orders', color: 'text-violet-600 bg-violet-50 hover:bg-violet-100' },
    { label: '查看库存', path: '/inventory', color: 'text-amber-600 bg-amber-50 hover:bg-amber-100' },
  ]

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={`你好，${user?.username || '用户'} 👋`}
        description="欢迎使用 CRM+ERP 管理系统，以下是您的业务概览"
      />

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users} label="客户总数" value={stats?.customers ?? 0} color="brand" />
        <StatCard icon={Package} label="产品总数" value={stats?.products ?? 0} color="emerald" />
        <StatCard icon={Warehouse} label="库存记录" value={stats?.inventory ?? 0} color="amber" />
        <StatCard icon={ShoppingCart} label="订单总数" value={stats?.orders ?? 0} color="violet" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-surface-400" />
              <h3 className="font-display font-semibold text-surface-800">最近订单</h3>
            </div>
            <button onClick={() => navigate('/orders')} className="btn-ghost text-xs">
              查看全部 <ArrowRight size={14} />
            </button>
          </div>
          {recentOrders.length > 0 ? (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>订单号</th>
                    <th>客户</th>
                    <th>金额</th>
                    <th>状态</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o, i) => (
                    <tr key={o.id || i}>
                      <td className="font-mono text-xs">#{o.id || o.order_no || '-'}</td>
                      <td>{o.customer_name || o.customer_id || '-'}</td>
                      <td className="font-medium">¥{Number(o.total_amount || o.amount || 0).toFixed(2)}</td>
                      <td>
                        <span className={`badge ${statusColor(o.status)}`}>{statusLabel(o.status)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-sm text-surface-400">暂无订单数据</div>
          )}
        </div>

        {/* Quick links */}
        <div className="card p-5">
          <h3 className="font-display font-semibold text-surface-800 mb-4">快捷操作</h3>
          <div className="space-y-2.5">
            {quickLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${link.color}`}
              >
                {link.label}
                <ArrowRight size={14} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
