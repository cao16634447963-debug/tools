import axios from 'axios'
import { message } from 'antd'
import { useAuthStore } from '../store/auth'

// 创建 axios 实例
// 开发时通过 Vite proxy 将 /api 转发到后端（见 vite.config.ts）
// 生产环境由 nginx 反向代理到后端
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  timeout: 10000,
})

// 请求拦截：自动携带 Token
request.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截：剥离外层、统一错误处理、401 自动登出
request.interceptors.response.use(
  (response) => {
    // 后端统一返回 { code, message, data } 或裸数据，这里直接返回 data 部分
    const body = response.data
    if (body && typeof body === 'object' && 'data' in body && 'code' in body) {
      return body.data
    }
    return body
  },
  (error) => {
    const status = error.response?.status
    const msg =
      error.response?.data?.message || error.message || '网络请求失败'
    if (status === 401) {
      localStorage.removeItem('token')
      useAuthStore.getState().logout()
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    } else {
      message.error(msg)
    }
    return Promise.reject(error)
  },
)

export default request
