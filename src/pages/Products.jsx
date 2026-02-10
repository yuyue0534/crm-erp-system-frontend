import { useState, useEffect, useCallback } from 'react'
import { productAPI } from '../api'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'
import Spinner from '../components/Spinner'
import toast from 'react-hot-toast'
import { Plus, Search, Pencil, Trash2, Package, Eye } from 'lucide-react'

const emptyForm = { name: '', sku: '', description: '', price: '', cost: '', category: '', unit: '' }

export default function Products() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 10

  const [modalOpen, setModalOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [detail, setDetail] = useState(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await productAPI.list({ page, page_size: pageSize, keyword: search || undefined })
      const d = res.data
      const items = d?.data?.list ?? d?.data?.items ?? d?.data ?? []
      const t = d?.data?.total ?? d?.total ?? items.length
      setList(Array.isArray(items) ? items : [])
      setTotal(t)
    } catch {
      toast.error('获取产品列表失败')
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { loadData() }, [loadData])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (item) => {
    setEditingId(item.id)
    setForm({
      name: item.name || '',
      sku: item.sku || '',
      description: item.description || '',
      price: item.price ?? '',
      cost: item.cost ?? '',
      category: item.category || '',
      unit: item.unit || '',
    })
    setModalOpen(true)
  }

  const openDetail = async (item) => {
    try {
      const res = await productAPI.get(item.id)
      setDetail(res.data?.data || res.data)
    } catch {
      setDetail(item)
    }
    setDetailOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('请输入产品名称')
    const payload = {
      ...form,
      price: form.price !== '' ? Number(form.price) : 0,
      cost: form.cost !== '' ? Number(form.cost) : 0,
    }
    setSaving(true)
    try {
      if (editingId) {
        await productAPI.update(editingId, payload)
        toast.success('更新成功')
      } else {
        await productAPI.create(payload)
        toast.success('创建成功')
      }
      setModalOpen(false)
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.message || '操作失败')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleting) return
    setSaving(true)
    try {
      await productAPI.delete(deleting)
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
        title="产品管理"
        description="管理所有产品信息"
        action={
          <button onClick={openCreate} className="btn-primary">
            <Plus size={16} /> 新增产品
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
              placeholder="搜索产品名称、SKU、分类..."
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
            icon={Package}
            title="暂无产品"
            description="点击上方按钮创建第一个产品"
            action={<button onClick={openCreate} className="btn-primary text-sm"><Plus size={14} /> 新增产品</button>}
          />
        ) : (
          <>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>产品名称</th>
                    <th>SKU</th>
                    <th>分类</th>
                    <th>售价</th>
                    <th>成本</th>
                    <th className="text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((item) => (
                    <tr key={item.id}>
                      <td className="font-medium text-surface-900">{item.name}</td>
                      <td className="font-mono text-xs text-surface-500">{item.sku || '-'}</td>
                      <td>
                        {item.category ? (
                          <span className="badge bg-surface-100 text-surface-600">{item.category}</span>
                        ) : '-'}
                      </td>
                      <td className="font-medium">¥{Number(item.price || 0).toFixed(2)}</td>
                      <td className="text-surface-500">¥{Number(item.cost || 0).toFixed(2)}</td>
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openDetail(item)} className="btn-ghost"><Eye size={15} /></button>
                          <button onClick={() => openEdit(item)} className="btn-ghost"><Pencil size={15} /></button>
                          <button
                            onClick={() => { setDeleting(item.id); setConfirmOpen(true) }}
                            className="btn-ghost text-accent-rose hover:bg-red-50"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? '编辑产品' : '新增产品'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">产品名称 *</label>
            <input className="input-field" placeholder="请输入产品名称" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">SKU</label>
              <input className="input-field" placeholder="产品编号" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">分类</label>
              <input className="input-field" placeholder="产品分类" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">售价</label>
              <input type="number" step="0.01" className="input-field" placeholder="0.00" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">成本</label>
              <input type="number" step="0.01" className="input-field" placeholder="0.00" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">单位</label>
              <input className="input-field" placeholder="个/台/件" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">描述</label>
            <textarea className="input-field resize-none" rows={3} placeholder="产品描述" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="btn-secondary">取消</button>
            <button onClick={handleSave} className="btn-primary" disabled={saving}>{saving ? '保存中...' : '保存'}</button>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="产品详情">
        {detail && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Package size={22} />
              </div>
              <div>
                <p className="font-display font-semibold text-surface-900 text-lg">{detail.name}</p>
                {detail.sku && <p className="text-sm text-surface-500 font-mono">SKU: {detail.sku}</p>}
              </div>
            </div>
            <div className="border-t border-surface-100 pt-4 grid grid-cols-2 gap-4">
              <div><p className="text-xs text-surface-400">售价</p><p className="font-medium">¥{Number(detail.price || 0).toFixed(2)}</p></div>
              <div><p className="text-xs text-surface-400">成本</p><p className="font-medium">¥{Number(detail.cost || 0).toFixed(2)}</p></div>
              <div><p className="text-xs text-surface-400">分类</p><p>{detail.category || '-'}</p></div>
              <div><p className="text-xs text-surface-400">单位</p><p>{detail.unit || '-'}</p></div>
            </div>
            {detail.description && (
              <div className="border-t border-surface-100 pt-4">
                <p className="text-xs text-surface-400 mb-1">描述</p>
                <p className="text-sm text-surface-600">{detail.description}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => { setConfirmOpen(false); setDeleting(null) }}
        onConfirm={handleDelete}
        title="删除产品"
        message="确定要删除该产品吗？此操作不可恢复。"
        loading={saving}
      />
    </div>
  )
}
