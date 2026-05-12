// ============================================
// Auth Store (Pinia)
// Company OA ERP - 支持角色权限管理
// ============================================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authUtil, type AuthUserInfo } from '@/utils/auth'
import type { UserRole } from '@/types/auth'
import { ROLE_CONFIG, permissionUtil } from '@/types/auth'

export const useAuthStore = defineStore('auth', () => {
  // ── State ──────────────────────────────────
  const token = ref<string>(authUtil.getToken() || '')
  const userInfo = ref<AuthUserInfo | null>(authUtil.getUserInfo())

  // ── Getters ────────────────────────────────
  const isLogin = computed(() => !!token.value && !!userInfo.value)
  
  const currentRole = computed<UserRole | null>(() => {
    return userInfo.value?.role || null
  })

  const currentRoleName = computed<string>(() => {
    return userInfo.value?.roleName || '访客'
  })

  const roleLevel = computed<number>(() => {
    if (!userInfo.value) return 0
    return ROLE_CONFIG[userInfo.value.role].level
  })

  // 权限检查方法
  const hasRole = (requiredRole: UserRole): boolean => {
    if (!userInfo.value) return false
    return permissionUtil.hasRole(userInfo.value.role, requiredRole)
  }

  const isManagerOrAbove = computed(() => {
    if (!userInfo.value) return false
    return permissionUtil.isManagerOrAbove(userInfo.value.role)
  })

  const isDirectorOrAbove = computed(() => {
    if (!userInfo.value) return false
    return permissionUtil.isDirectorOrAbove(userInfo.value.role)
  })

  const isAdmin = computed(() => {
    return userInfo.value?.role === 'admin'
  })

  // ── Actions ────────────────────────────────
  
  /** 设置登录状态 */
  function setLogin(newToken: string, newUserInfo: AuthUserInfo) {
    token.value = newToken
    userInfo.value = newUserInfo
    authUtil.setToken(newToken)
    authUtil.setUserInfo(newUserInfo)
  }

  /** 退出登录 */
  function logout() {
    token.value = ''
    userInfo.value = null
    authUtil.clearAuth()
  }

  /** 退出登录（别名） */
  function logoutAction() {
    logout()
  }

  /** 更新用户信息 */
  function updateUserInfo(partial: Partial<AuthUserInfo>) {
    if (userInfo.value) {
      userInfo.value = { ...userInfo.value, ...partial }
      authUtil.setUserInfo(userInfo.value)
    }
  }

  return {
    // State
    token,
    userInfo,
    // Getters
    isLogin,
    currentRole,
    currentRoleName,
    roleLevel,
    isManagerOrAbove,
    isDirectorOrAbove,
    isAdmin,
    // Actions
    setLogin,
    logout,
    logoutAction,
    updateUserInfo,
    hasRole
  }
})
