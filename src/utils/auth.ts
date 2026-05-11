// src/utils/auth.ts
// Token 管理工具

const TOKEN_KEY = 'erp_temp_token'
const RESET_TOKEN_KEY = 'erp_reset_token'
const USER_INFO_KEY = 'erp_user_info'

export interface UserInfo {
  username: string
  realName: string
  role: string
  userId: string | number
}

export const authUtil = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  },
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token)
  },
  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY)
  },
  isLogin(): boolean {
    return !!this.getToken()
  },

  getResetToken(): string | null {
    return sessionStorage.getItem(RESET_TOKEN_KEY)
  },
  setResetToken(t: string): void {
    sessionStorage.setItem(RESET_TOKEN_KEY, t)
  },
  removeResetToken(): void {
    sessionStorage.removeItem(RESET_TOKEN_KEY)
  },

  getUserInfo(): UserInfo | null {
    const raw = localStorage.getItem(USER_INFO_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw) as UserInfo
    } catch {
      return null
    }
  },
  setUserInfo(info: UserInfo): void {
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(info))
  },
  removeUserInfo(): void {
    localStorage.removeItem(USER_INFO_KEY)
  },

  logout(): void {
    this.removeToken()
    this.removeUserInfo()
  }
}
