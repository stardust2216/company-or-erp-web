// src/api/auth.ts
// 认证相关接口预留文件
// ⚠️  当前运行在【伪登录模式】，所有接口均使用 mock 实现
// ✅  接入真实后端时：取消注释 http 调用，删除对应 mock 实现即可

// import http from './http'

// ─────────────────────────────────────────────
// 类型定义
// ─────────────────────────────────────────────
export interface LoginPayload {
  username: string
  password: string
}

export interface LoginResult {
  token: string
  username: string
  realName: string
  role: string
  userId: string | number
}

export interface RegisterPayload {
  username: string
  email: string
  password: string
}

export interface CheckAccountPayload {
  username: string
  email: string
}

export interface SendCodePayload {
  email: string
}

export interface VerifyCodePayload {
  email: string
  code: string
}

export interface ResetPasswordPayload {
  token: string
  newPassword: string
  confirmPassword: string
}

export interface ChangePasswordPayload {
  oldPassword: string
  newPassword: string
}

export interface UpdateUserInfoPayload {
  realName?: string
  email?: string
}

// ─────────────────────────────────────────────
// Mock 工具
// ─────────────────────────────────────────────
const mockDelay = (ms = 800) => new Promise<void>((resolve) => setTimeout(resolve, ms))

/** 模拟用户数据库（内存态，刷新即清空） */
const mockUsers: Record<string, { password: string; email: string; realName: string; role: string }> = {
  admin: { password: 'admin123', email: 'admin@example.com', realName: '系统管理员', role: '管理员' },
  demo: { password: 'demo123', email: 'demo@example.com', realName: '演示用户', role: '普通用户' }
}

// ─────────────────────────────────────────────
// 接口实现（当前：Mock；接入后端：换成 http 调用）
// ─────────────────────────────────────────────

/**
 * 用户登录
 * 伪登录规则：用户名/密码 均为 admin/admin123 或 demo/demo123
 * 或：用户名非空、密码 ≥ 6 位时，视为演示登录
 */
export async function login(data: LoginPayload): Promise<{ data: LoginResult }> {
  // ── 接入真实后端时替换为: return http.post('/auth/login', data)
  await mockDelay()
  const user = mockUsers[data.username]
  if (user && user.password === data.password) {
    return {
      data: {
        token: `mock_token_${Date.now()}`,
        username: data.username,
        realName: user.realName,
        role: user.role,
        userId: Math.random().toString(36).slice(2)
      }
    }
  }
  // 宽松模式：任意用户名 + 6位以上密码也能登录
  if (data.username.trim() && data.password.length >= 6) {
    return {
      data: {
        token: `mock_token_${Date.now()}`,
        username: data.username.trim(),
        realName: data.username.trim(),
        role: '普通用户',
        userId: Math.random().toString(36).slice(2)
      }
    }
  }
  throw new Error('用户名或密码错误')
}

/**
 * 用户注册
 */
export async function register(data: RegisterPayload): Promise<void> {
  // ── 接入真实后端时替换为: return http.post('/auth/register', data)
  await mockDelay()
  if (mockUsers[data.username]) {
    throw new Error('用户名已存在，请更换用户名')
  }
  mockUsers[data.username] = {
    password: data.password,
    email: data.email,
    realName: data.username,
    role: '普通用户'
  }
}

/**
 * 校验账号是否存在（找回密码第一步）
 */
export async function checkAccount(data: CheckAccountPayload): Promise<void> {
  // ── 接入真实后端时替换为: return http.post('/auth/check-account', data)
  await mockDelay(600)
  const user = mockUsers[data.username]
  if (!user || user.email !== data.email) {
    throw new Error('账号或绑定邮箱不匹配，请检查后重试')
  }
}

/**
 * 发送验证码
 */
export async function sendVerifyCode(data: SendCodePayload): Promise<void> {
  // ── 接入真实后端时替换为: return http.post('/auth/send-code', data)
  await mockDelay()
  console.log(`[Mock] 验证码已发送至 ${data.email}，固定验证码为：123456`)
}

/**
 * 验证验证码，成功返回重置 token
 */
export async function verifyCode(data: VerifyCodePayload): Promise<{ data: string }> {
  // ── 接入真实后端时替换为: return http.post('/auth/verify-code', data)
  await mockDelay(500)
  if (data.code !== '123456') {
    throw new Error('验证码错误，请检查后重试')
  }
  return { data: `reset_token_${Date.now()}` }
}

/**
 * 重置密码
 */
export async function resetPassword(data: ResetPasswordPayload): Promise<void> {
  // ── 接入真实后端时替换为: return http.post('/auth/reset-password', data)
  await mockDelay()
  // Mock 中直接成功
  console.log('[Mock] 密码重置成功，新密码：', data.newPassword)
}

/**
 * 获取当前用户信息
 */
export async function getUserInfo(): Promise<LoginResult> {
  // ── 接入真实后端时替换为: return http.get('/auth/user-info')
  await mockDelay(300)
  const raw = localStorage.getItem('erp_user_info')
  if (raw) return JSON.parse(raw)
  throw new Error('未登录或登录已过期')
}

/**
 * 修改密码（需登录）
 */
export async function changePassword(data: ChangePasswordPayload): Promise<void> {
  // ── 接入真实后端时替换为: return http.post('/auth/change-password', data)
  await mockDelay()
  console.log('[Mock] 密码修改成功', data)
}

/**
 * 更新用户信息（需登录）
 */
export async function updateUserInfo(data: UpdateUserInfoPayload): Promise<void> {
  // ── 接入真实后端时替换为: return http.put('/auth/user-info', data)
  await mockDelay()
  console.log('[Mock] 用户信息更新成功', data)
}
