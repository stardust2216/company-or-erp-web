// src/stores/auth.ts
// Pinia 认证状态管理

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authUtil, type UserInfo } from '@/utils/auth'
import { login as apiLogin, type LoginPayload } from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(authUtil.getToken())
  const userInfo = ref<UserInfo | null>(authUtil.getUserInfo())

  const isLoggedIn = computed(() => !!token.value)

  async function loginAction(payload: LoginPayload) {
    const res = await apiLogin(payload)
    const data = res.data
    token.value = data.token
    userInfo.value = {
      username: data.username,
      realName: data.realName,
      role: data.role,
      userId: data.userId
    }
    authUtil.setToken(data.token)
    authUtil.setUserInfo(userInfo.value)
  }

  function logoutAction() {
    token.value = null
    userInfo.value = null
    authUtil.logout()
  }

  return { token, userInfo, isLoggedIn, loginAction, logoutAction }
})
