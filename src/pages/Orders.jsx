import { useState, useEffect, useCallback } from 'react'
import { orderAPI } from '../api'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'
import Spinner from '../components/Spinner'
import toast from 'react-hot-toast'
import { Plus, Search, Eye, Trash2, ShoppingCart, RefreshCw } from 'lucide-react'

const statusOptions = [
  { value: 'pending', label: '待处理', color: 'bg-amber-50 text-amber-700' },
  { value: 'confirmed', label: '已确认', color: 'bg-blue-50 text-blue-700' },
  { value: 'shipped', label: '已发货', color: 'bg-violet-50 text-violet-700' },
  { value: 'completed', label: '已完成', color: 'bg-emerald-50 text-emerald-700' },
  { value: 'cancelled', label: '已取消', color: 'bg-red-50 text-red-700' },
]

const getStatusInfo = (status) => statusOptions.find((s) => s.value === status) || statusOptions[0]

const emptyForm = {
  customer_id: '',
  items: [{ product_id: '', quantity: 1, price: '' }],
  notes: '',
}

export default function Orders() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 10

  const [createOpen, setCreateOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [detail, setDetail] = useState(null)
  const [statusTarget, setStatusTarget] = useState(null)
  const [newStatus, setNewStatus] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await orderAPI.list({ page, page_size: pageSize, keyword: search || undefined })
      const d = res.data
      const items = d?.data?.list ?? d?.data?.items ?? d?.data ?? []
      const t = d?.data?.total ?? d?.total ?? items.length
      setList(Array.isArray(items) ? items : [])
      setTotal(t)
    } catch {
      toast.error('获取订单列表失败')
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { loadData() }, [loadData])

  // --- Items management in create form ---
  const addItem = () => {
    setForm({ ...form, items: [...form.items, { product_id: '', quantity: 1, price: '' }] })
  }

  const removeItem = (idx) => {
    if (form.items.length <= 1) return
    setForm({ ...form, items: form.items.filter((_, i) => i !== idx) })
  }

  const updateItem = (idx, field, value) => {
    const items = [...form.items]
    items[idx] = { ...items[idx], [field]: value }
    setForm({ ...form, items })
  }

  const handleCreate = async () => {
    if (!form.customer_id) return toast.error('请输入客户ID')
    if (form.items.some((it) => !it.product_id)) return toast.error('请填写所有产品ID')
    const payload = {
      customer_id: Number(form.customer_id),
      items: form.items.map((it) => ({
        product_id: Number(it.product_id),
        quantity: Number(it.quantity) || 1,
        price: Number(it.price) || 0,
      })),
      notes: form.notes,
    }
    setSaving(true)
    try {
      await orderAPI.create(payload)
      toast.success('订单创建成功')
      setCreateOpen(false)
      setForm(emptyForm)
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.message || '创建失败')
    } finally {
      setSaving(false)
    }
  }

  const openDetail = async (item) => {
    try {
      const res = await orderAPI.get(item.id)
      setDetail(res.data?.data || res.data)
    } catch {
      setDetail(item)
    }
    setDetailOpen(true)
  }

  const openStatusModal = (item) => {
    setStatusTarget(item)
    setNewStatus(item.status || 'pending')
    setStatusOpen(true)
  }

  const handleStatusUpdate = async () => {
    if (!statusTarget) return
    setSaving(true)
    try {
      await orderAPI.updateStatus(statusTarget.id, { status: newStatus })
      toast.success('状态更新成功')
      setStatusOpen(false)
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.message || '更新失败')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleting) return
    setSaving(true)
    try {
      await orderAPI.delete(deleting)
      toast.success('删除成功')
      setConfirmOpen(false)
      setDeleting(null)
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.message || '删除失败')
    } finally {
      setSaving(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="订单管理"
        description="管理所有订单信息"
        action={
          <button onClick={() => { setForm(emptyForm); setCreateOpen(true) }} className="btn-primary">
            <Plus size={16} /> 新建订单
          </button>
        }
      />

      <div className="card mb-5">
        <div className="p-4">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              className="input-field pl-10"
              placeholder="搜索订单号、客户..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <Spinner />
        ) : list.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="暂无订单"
            description="点击上方按钮创建第一个订单"
            action={<button onClick={() => setCreateOpen(true)} className="btn-primary text-sm"><Plus size={14} /> 新建订单</button>}
          />
        ) : (
          <>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>订单号</th>
                    <th>客户</th>
                    <th>金额</th>
                    <th>状态</th>
                    <th>创建时间</th>
                    <th className="text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((item) => {
                    const si = getStatusInfo(item.status)
                    return (
                      <tr key={item.id}>
                        <td className="font-mono text-xs">#{item.id || item.order_no}</td>
                        <td className="font-medium text-surface-900">{item.customer_name || item.customer_id || '-'}</td>
                        <td className="font-medium">¥{Number(item.total_amount || item.amount || 0).toFixed(2)}</td>
                        <td><span className={`badge ${si.color}`}>{si.label}</span></td>
                        <td className="text-surface-500 text-xs">{item.created_at ? new Date(item.created_at).toLocaleString('zh-CN') : '-'}</td>
                        <td>
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => openDetail(item)} className="btn-ghost" title="详情"><Eye size={15} /></button>
                            <button onClick={() => openStatusModal(item)} className="btn-ghost" title="更新状态"><RefreshCw size={15} /></button>
                            <button
                              onClick={() => { setDeleting(item.id); setConfirmOpen(true) }}
                              className="btn-ghost text-accent-rose hover:bg-red-50"
                              title="删除"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-surface-100">
                <span className="text-xs text-surface-400">共 {total} 条记录</span>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="btn-ghost text-xs disabled:opacity-40">上一页</button>
                  <span className="text-xs text-surface-500 px-2">{page} / {totalPages}</span>
                  <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages} className="btn-ghost text-xs disabled:opacity-40">下一页</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Order Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="新建订单" width="max-w-2xl">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">客户ID *</label>
            <input
              type="number"
              className="input-field"
              placeholder="请输入客户ID"
              value={form.customer_id}
              onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
              autoFocus
            />
          </div>

          {/* Order items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-surface-700">订单明细</label>
              <button onClick={addItem} className="text-xs text-brand-600 hover:text-brand-700 font-medium">+ 添加商品</button>
            </div>
            <div className="space-y-3">
              {form.items.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-surface-50 rounded-xl">
                  <div className="flex-1 grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-surface-500 mb-1 block">产品ID *</label>
                      <input type="number" className="input-field text-sm py-2" placeholder="ID" value={item.product_id} onChange={(e) => updateItem(idx, 'product_id', e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs text-surface-500 mb-1 block">数量</label>
                      <input type="number" min="1" className="input-field text-sm py-2" placeholder="1" value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs text-surface-500 mb-1 block">单价</label>
                      <input type="number" step="0.01" className="input-field text-sm py-2" placeholder="0.00" value={item.price} onChange={(e) => updateItem(idx, 'price', e.target.value)} />
                    </div>
                  </div>
                  {form.items.length > 1 && (
                    <button onClick={() => removeItem(idx)} className="mt-5 p-1 text-surface-400 hover:text-accent-rose transition-colors">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">备注</label>
            <textarea className="input-field resize-none" rows={2} placeholder="订单备注" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setCreateOpen(false)} className="btn-secondary">取消</button>
            <button onClick={handleCreate} className="btn-primary" disabled={saving}>{saving ? '提交中...' : '提交订单'}</button>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="订单详情" width="max-w-2xl">
        {detail && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-display font-semibold text-lg text-surface-900">
                  订单 #{detail.id || detail.order_no}
                </p>
                <p className="text-sm text-surface-500">
                  客户: {detail.customer_name || detail.customer_id || '-'}
                </p>
              </div>
              <span className={`badge text-sm ${getStatusInfo(detail.status).color}`}>
                {getStatusInfo(detail.status).label}
              </span>
            </div>

            {/* Order items detail */}
            {detail.items && detail.items.length > 0 && (
              <div className="border-t border-surface-100 pt-4">
                <h4 className="text-sm font-medium text-surface-700 mb-3">订单明细</h4>
                <div className="table-container rounded-xl border border-surface-100 overflow-hidden">
                  <table>
                    <thead>
                      <tr>
                        <th>产品</th>
                        <th>数量</th>
                        <th>单价</th>
                        <th>小计</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.items.map((it, i) => (
                        <tr key={i}>
                          <td>{it.product_name || it.product_id}</td>
                          <td>{it.quantity}</td>
                          <td>¥{Number(it.price || 0).toFixed(2)}</td>
                          <td className="font-medium">¥{(Number(it.price || 0) * Number(it.quantity || 0)).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="border-t border-surface-100 pt-4 flex items-center justify-between">
              <span className="text-sm text-surface-500">
                创建时间: {detail.created_at ? new Date(detail.created_at).toLocaleString('zh-CN') : '-'}
              </span>
              <span className="font-display font-bold text-lg text-surface-900">
                合计: ¥{Number(detail.total_amount || detail.amount || 0).toFixed(2)}
              </span>
            </div>

            {detail.notes && (
              <div className="border-t border-surface-100 pt-4">
                <p className="text-xs text-surface-400 mb-1">备注</p>
                <p className="text-sm text-surface-600">{detail.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Status Update Modal */}
      <Modal open={statusOpen} onClose={() => setStatusOpen(false)} title="更新订单状态">
        <div className="space-y-4">
          <p className="text-sm text-surface-500">
            订单 <span className="font-mono font-medium text-surface-700">#{statusTarget?.id || statusTarget?.order_no}</span> 当前状态为
            <span className={`badge ml-2 ${getStatusInfo(statusTarget?.status).color}`}>{getStatusInfo(statusTarget?.status).label}</span>
          </p>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">选择新状态</label>
            <div className="grid grid-cols-2 gap-2">
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setNewStatus(opt.value)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all border-2 ${
                    newStatus === opt.value
                      ? 'border-brand-500 bg-brand-50 text-brand-700'
                      : 'border-surface-200 hover:border-surface-300 text-surface-600'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setStatusOpen(false)} className="btn-secondary">取消</button>
            <button onClick={handleStatusUpdate} className="btn-primary" disabled={saving}>{saving ? '更新中...' : '确认更新'}</button>
          </div>
        </div>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => { setConfirmOpen(false); setDeleting(null) }}
        onConfirm={handleDelete}
        title="删除订单"
        message="确定要删除该订单吗？此操作不可恢复。"
        loading={saving}
      />
    </div>
  )
}
