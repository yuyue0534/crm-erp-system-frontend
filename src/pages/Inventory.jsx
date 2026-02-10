import { useState, useEffect, useCallback } from 'react'
import { inventoryAPI } from '../api'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import EmptyState from '../components/EmptyState'
import Spinner from '../components/Spinner'
import toast from 'react-hot-toast'
import { Plus, Search, Pencil, Warehouse, AlertTriangle, CheckCircle } from 'lucide-react'

const emptyForm = { product_id: '', quantity: '', warehouse: '', location: '', min_stock: '' }

export default function Inventory() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 10

  const [modalOpen, setModalOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await inventoryAPI.list({ page, page_size: pageSize, keyword: search || undefined })
      const d = res.data
      const items = d?.data?.list ?? d?.data?.items ?? d?.data ?? []
      const t = d?.data?.total ?? d?.total ?? items.length
      setList(Array.isArray(items) ? items : [])
      setTotal(t)
    } catch {
      toast.error('获取库存列表失败')
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { loadData() }, [loadData])

  const openCreate = () => {
    setIsEdit(false)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (item) => {
    setIsEdit(true)
    setForm({
      product_id: item.product_id ?? '',
      quantity: item.quantity ?? '',
      warehouse: item.warehouse || '',
      location: item.location || '',
      min_stock: item.min_stock ?? '',
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.product_id) return toast.error('请输入产品ID')
    const payload = {
      ...form,
      product_id: Number(form.product_id),
      quantity: form.quantity !== '' ? Number(form.quantity) : 0,
      min_stock: form.min_stock !== '' ? Number(form.min_stock) : 0,
    }
    setSaving(true)
    try {
      if (isEdit) {
        await inventoryAPI.update(form.product_id, payload)
        toast.success('更新成功')
      } else {
        await inventoryAPI.create(payload)
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

  const isLowStock = (item) => item.min_stock && item.quantity <= item.min_stock

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="库存管理"
        description="查看和管理产品库存"
        action={
          <button onClick={openCreate} className="btn-primary">
            <Plus size={16} /> 新增库存
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
              placeholder="搜索产品、仓库..."
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
            icon={Warehouse}
            title="暂无库存记录"
            description="点击上方按钮创建库存记录"
            action={<button onClick={openCreate} className="btn-primary text-sm"><Plus size={14} /> 新增库存</button>}
          />
        ) : (
          <>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>产品ID</th>
                    <th>产品名称</th>
                    <th>库存数量</th>
                    <th>最低库存</th>
                    <th>仓库</th>
                    <th>库位</th>
                    <th>状态</th>
                    <th className="text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((item, i) => (
                    <tr key={item.id || item.product_id || i}>
                      <td className="font-mono text-xs">#{item.product_id}</td>
                      <td className="font-medium text-surface-900">{item.product_name || item.product?.name || '-'}</td>
                      <td className="font-medium">{item.quantity ?? 0}</td>
                      <td className="text-surface-500">{item.min_stock ?? '-'}</td>
                      <td>{item.warehouse || '-'}</td>
                      <td className="text-surface-500">{item.location || '-'}</td>
                      <td>
                        {isLowStock(item) ? (
                          <span className="badge bg-red-50 text-red-600">
                            <AlertTriangle size={12} className="mr-1" /> 低库存
                          </span>
                        ) : (
                          <span className="badge bg-emerald-50 text-emerald-600">
                            <CheckCircle size={12} className="mr-1" /> 正常
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="flex items-center justify-end">
                          <button onClick={() => openEdit(item)} className="btn-ghost"><Pencil size={15} /></button>
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
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={isEdit ? '编辑库存' : '新增库存'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">产品ID *</label>
            <input
              type="number"
              className="input-field"
              placeholder="请输入产品ID"
              value={form.product_id}
              onChange={(e) => setForm({ ...form, product_id: e.target.value })}
              disabled={isEdit}
              autoFocus={!isEdit}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">库存数量</label>
              <input type="number" className="input-field" placeholder="0" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">最低库存</label>
              <input type="number" className="input-field" placeholder="0" value={form.min_stock} onChange={(e) => setForm({ ...form, min_stock: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">仓库</label>
              <input className="input-field" placeholder="仓库名称" value={form.warehouse} onChange={(e) => setForm({ ...form, warehouse: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">库位</label>
              <input className="input-field" placeholder="库位编号" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="btn-secondary">取消</button>
            <button onClick={handleSave} className="btn-primary" disabled={saving}>{saving ? '保存中...' : '保存'}</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
