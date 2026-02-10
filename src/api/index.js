import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || ''

const api = axios.create({
  baseURL: `${API_BASE}/api/v1`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => {
    const resData = response.data
    // 后端返回 HTTP 200 但业务码非 200 时，转为错误抛出
    if (resData && resData.code !== undefined && resData.code !== 200) {
      const err = new Error(resData.message || '请求失败')
      err.response = { data: resData, status: resData.code }
      return Promise.reject(err)
    }
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ===================== Auth =====================
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getUserInfo: () => api.get('/user/info'),
}

// ===================== Customers =====================
export const customerAPI = {
  create: (data) => api.post('/customers', data),
  list: (params) => api.get('/customers', { params }),
  get: (id) => api.get(`/customers/${id}`),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
}

// ===================== Products =====================
export const productAPI = {
  create: (data) => api.post('/products', data),
  list: (params) => api.get('/products', { params }),
  get: (id) => api.get(`/products/${id}`),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
}

// ===================== Inventory =====================
export const inventoryAPI = {
  create: (data) => api.post('/inventory', data),
  list: (params) => api.get('/inventory', { params }),
  getByProductId: (productId) => api.get(`/inventory/product/${productId}`),
  update: (productId, data) => api.put(`/inventory/product/${productId}`, data),
}

// ===================== Orders =====================
export const orderAPI = {
  create: (data) => api.post('/orders', data),
  list: (params) => api.get('/orders', { params }),
  get: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  delete: (id) => api.delete(`/orders/${id}`),
}

export default api
