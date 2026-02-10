import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Boxes, ArrowRight, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const ok = await login(form)
    if (ok) navigate('/')
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel - decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-surface-900 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600/20 via-transparent to-violet-600/10" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-violet-500/8 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-md text-center px-8">
          <div className="w-16 h-16 rounded-2xl bg-brand-500 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-brand-500/30">
            <Boxes size={32} className="text-white" />
          </div>
          <h1 className="font-display font-bold text-4xl text-white mb-4">CRM+ERP System</h1>
          <p className="text-surface-400 text-lg leading-relaxed">
            轻量级客户关系与企业资源管理平台，助力业务高效运转
          </p>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md animate-fade-in">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center">
              <Boxes size={20} className="text-white" />
            </div>
            <span className="font-display font-bold text-xl">CRM+ERP</span>
          </div>

          <h2 className="font-display font-bold text-3xl text-surface-900">欢迎回来</h2>
          <p className="mt-2 text-surface-500">登录您的账户以继续</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">用户名</label>
              <input
                type="text"
                className="input-field"
                placeholder="请输入用户名"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">密码</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  className="input-field pr-10"
                  placeholder="请输入密码"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full h-11" disabled={loading}>
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>登录 <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-surface-500">
            还没有账户？{' '}
            <Link to="/register" className="text-brand-600 font-medium hover:text-brand-700 transition-colors">
              立即注册
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
