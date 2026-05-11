// src/api/http.ts
// Axios 封装（预留，等待后端接入时启用）
// ⚠️  当前项目运行在【伪登录 Mock 模式】，不需要 axios
// ✅  接入后端时：
//     1. npm install axios
//     2. 删除此文件，用下方注释代码重建
//     3. 在 api/auth.ts 中将 mock 实现替换为 http 调用

/*
import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

const http = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
})

http.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem('erp_temp_token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: unknown) => Promise.reject(error)
)

http.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data
    if (res.code !== undefined && res.code !== 0) {
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return res
  },
  (error: unknown) => {
    const err = error as { response?: { data?: { message?: string } }; message?: string }
    const msg = err.response?.data?.message || err.message || '网络异常，请稍后重试'
    return Promise.reject(new Error(msg))
  }
)

export default http
*/

export {}
