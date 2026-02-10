import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(false)

  const isAuthenticated = !!token

  const login = useCallback(async (credentials) => {
    setLoading(true)
    try {
      const res = await authAPI.login(credentials)
      const data = res.data?.data || res.data
      const newToken = data.token || data.access_token
      const userInfo = data.user || { username: credentials.username }

      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(userInfo))
      setToken(newToken)
      setUser(userInfo)
      toast.success('登录成功')
      return true
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || '登录失败'
      toast.error(msg)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (data) => {
    setLoading(true)
    try {
      await authAPI.register(data)
      toast.success('注册成功，请登录')
      return true
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || '注册失败'
      toast.error(msg)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
    toast.success('已退出登录')
  }, [])

  const fetchUserInfo = useCallback(async () => {
    if (!token) return
    try {
      const res = await authAPI.getUserInfo()
      const info = res.data?.data || res.data
      setUser(info)
      localStorage.setItem('user', JSON.stringify(info))
    } catch {
      // silent fail
    }
  }, [token])

  useEffect(() => {
    if (token) fetchUserInfo()
  }, []) // eslint-disable-line

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
