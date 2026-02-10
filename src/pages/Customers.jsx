import { useState, useEffect, useCallback } from 'react'
import { customerAPI } from '../api'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'
import Spinner from '../components/Spinner'
import toast from 'react-hot-toast'
import { Plus, Search, Pencil, Trash2, Users, Eye, Mail, Phone, Building2 } from 'lucide-react'

const emptyForm = { name: '', company: '', email: '', phone: '', address: '', notes: '' }

export default function Customers() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 10

  // Modal states
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
      const res = await customerAPI.list({ page, page_size: pageSize, keyword: search || undefined })
      const d = res.data
      const items = d?.data?.list ?? d?.data?.items ?? d?.data ?? []
      const t = d?.data?.total ?? d?.total ?? items.length
      setList(Array.isArray(items) ? items : [])
      setTotal(t)
    } catch {
      toast.error('获取客户列表失败')
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
      company: item.company || '',
      email: item.email || '',
      phone: item.phone || '',
      address: item.address || '',
      notes: item.notes || '',
    })
    setModalOpen(true)
  }

  const openDetail = async (item) => {
    try {
      const res = await customerAPI.get(item.id)
      setDetail(res.data?.data || res.data)
    } catch {
      setDetail(item)
    }
    setDetailOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('请输入客户名称')
    setSaving(true)
    try {
      if (editingId) {
        await customerAPI.update(editingId, form)
        toast.success('更新成功')
      } else {
        await customerAPI.create(form)
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
      await customerAPI.delete(deleting)
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
        title="客户管理"
        description="管理所有客户信息"
        action={
          <button onClick={openCreate} className="btn-primary">
            <Plus size={16} /> 新增客户
          </button>
        }
      />

      {/* Search */}
      <div className="card mb-5">
        <div className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              className="input-field pl-10"
              placeholder="搜索客户名称、公司、邮箱..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <Spinner />
        ) : list.length === 0 ? (
          <EmptyState
            icon={Users}
            title="暂无客户"
            description="点击上方按钮创建第一个客户"
            action={<button onClick={openCreate} className="btn-primary text-sm"><Plus size={14} /> 新增客户</button>}
          />
        ) : (
          <>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>客户名称</th>
                    <th>公司</th>
                    <th>邮箱</th>
                    <th>电话</th>
                    <th className="text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((item) => (
                    <tr key={item.id}>
                      <td className="font-medium text-surface-900">{item.name}</td>
                      <td>{item.company || '-'}</td>
                      <td className="text-surface-500">{item.email || '-'}</td>
                      <td className="text-surface-500">{item.phone || '-'}</td>
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openDetail(item)} className="btn-ghost" title="详情">
                            <Eye size={15} />
                          </button>
                          <button onClick={() => openEdit(item)} className="btn-ghost" title="编辑">
                            <Pencil size={15} />
                          </button>
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
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-surface-100">
                <span className="text-xs text-surface-400">共 {total} 条记录</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page <= 1}
                    className="btn-ghost text-xs disabled:opacity-40"
                  >
                    上一页
                  </button>
                  <span className="text-xs text-surface-500 px-2">{page} / {totalPages}</span>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page >= totalPages}
                    className="btn-ghost text-xs disabled:opacity-40"
                  >
                    下一页
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? '编辑客户' : '新增客户'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">客户名称 *</label>
            <input
              className="input-field"
              placeholder="请输入客户名称"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">公司</label>
            <input
              className="input-field"
              placeholder="请输入公司名称"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">邮箱</label>
              <input
                type="email"
                className="input-field"
                placeholder="example@mail.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">电话</label>
              <input
                className="input-field"
                placeholder="请输入电话号码"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">地址</label>
            <input
              className="input-field"
              placeholder="请输入地址"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">备注</label>
            <textarea
              className="input-field resize-none"
              rows={3}
              placeholder="可选备注信息"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="btn-secondary">取消</button>
            <button onClick={handleSave} className="btn-primary" disabled={saving}>
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="客户详情">
        {detail && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 font-display font-bold text-lg">
                {(detail.name || 'C')[0]}
              </div>
              <div>
                <p className="font-display font-semibold text-surface-900 text-lg">{detail.name}</p>
                {detail.company && (
                  <p className="flex items-center gap-1.5 text-sm text-surface-500">
                    <Building2 size={13} /> {detail.company}
                  </p>
                )}
              </div>
            </div>
            <div className="border-t border-surface-100 pt-4 space-y-3">
              {detail.email && (
                <p className="flex items-center gap-2 text-sm text-surface-600">
                  <Mail size={14} className="text-surface-400" /> {detail.email}
                </p>
              )}
              {detail.phone && (
                <p className="flex items-center gap-2 text-sm text-surface-600">
                  <Phone size={14} className="text-surface-400" /> {detail.phone}
                </p>
              )}
              {detail.address && (
                <p className="text-sm text-surface-600"><span className="text-surface-400">地址：</span>{detail.address}</p>
              )}
              {detail.notes && (
                <p className="text-sm text-surface-600"><span className="text-surface-400">备注：</span>{detail.notes}</p>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => { setConfirmOpen(false); setDeleting(null) }}
        onConfirm={handleDelete}
        title="删除客户"
        message="确定要删除该客户吗？此操作不可恢复。"
        loading={saving}
      />
    </div>
  )
}
