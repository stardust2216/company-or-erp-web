<template>
  <div class="login-container">
    <!-- 动态背景 -->
    <div class="bg-mesh"></div>
    <div class="bg-particles">
      <div v-for="(style, i) in particleStyles" :key="i" class="particle" :style="style"></div>
    </div>
    <!-- 光晕圆球 -->
    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>
    <div class="orb orb-3"></div>

    <!-- 登录卡片 -->
    <div class="login-card" :class="{ shaking: isShaking }">
      <!-- 品牌区 -->
      <div class="brand-area">
        <div class="brand-logo">
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="14" fill="url(#logoGrad)"/>
            <path d="M14 24 L24 14 L34 24 L28 24 L28 34 L20 34 L20 24 Z" fill="white" fill-opacity="0.9"/>
            <path d="M20 24 L24 20 L28 24" fill="white" fill-opacity="0.5"/>
            <defs>
              <linearGradient id="logoGrad" x1="0" y1="0" x2="48" y2="48">
                <stop offset="0%" stop-color="#0070f3"/>
                <stop offset="100%" stop-color="#7928ca"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div class="brand-text">
          <h1 class="brand-name">Company ERP</h1>
          <p class="brand-slogan">企业智能管理解决方案</p>
        </div>
      </div>

      <!-- 分割线 -->
      <div class="divider"><span>账号登录</span></div>

      <!-- 角色选择 -->
      <div class="role-selector">
        <label class="role-label">选择您的角色</label>
        <div class="role-options">
          <div
            v-for="role in roleOptions"
            :key="role.value"
            class="role-option"
            :class="{ active: selectedRole === role.value }"
            @click="selectedRole = role.value"
          >
            <div class="role-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path v-if="role.value === 'employee'" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle v-if="role.value === 'employee'" cx="12" cy="7" r="4"/>
                <path v-if="role.value === 'manager'" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle v-if="role.value === 'manager'" cx="9" cy="7" r="4"/>
                <path v-if="role.value === 'manager'" d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path v-if="role.value === 'manager'" d="M16 3.13a4 4 0 0 1 0 7.75"/>
                <path v-if="role.value === 'director'" d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path v-if="role.value === 'director'" d="M2 17l10 5 10-5"/>
                <path v-if="role.value === 'director'" d="M2 12l10 5 10-5"/>
                <path v-if="role.value === 'admin'" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path v-if="role.value === 'admin'" d="M12 8v4"/>
                <path v-if="role.value === 'admin'" d="M12 16h.01"/>
              </svg>
            </div>
            <div class="role-info">
              <span class="role-name">{{ role.label }}</span>
              <span class="role-desc">{{ role.desc }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 伪登录提示 -->
      <div class="mock-tip">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span>演示模式：选择角色后，任意账号（密码≥6位）即可登录</span>
      </div>

      <!-- 表单 -->
      <form @submit.prevent="handleLogin" class="login-form">
        <!-- 用户名 -->
        <div class="field-wrap" :class="{ 'has-error': fieldErrors.username, 'is-valid': fieldValid.username }">
          <div class="field-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <input
            v-model="username"
            id="login-username"
            type="text"
            class="field-input"
            placeholder=" "
            autocomplete="username"
            @blur="validateUsername"
          />
          <label for="login-username" class="field-label">用户名</label>
          <div class="field-status">
            <svg v-if="fieldValid.username" class="icon-ok" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
        </div>
        <p v-if="fieldErrors.username" class="field-err">{{ fieldErrors.username }}</p>

        <!-- 密码 -->
        <div class="field-wrap" :class="{ 'has-error': fieldErrors.password }">
          <div class="field-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <input
            v-model="password"
            id="login-password"
            :type="showPwd ? 'text' : 'password'"
            class="field-input"
            placeholder=" "
            autocomplete="current-password"
          />
          <label for="login-password" class="field-label">密码</label>
          <button type="button" class="pwd-eye" @click="showPwd = !showPwd">
            <svg v-if="showPwd" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        </div>
        <p v-if="fieldErrors.password" class="field-err">{{ fieldErrors.password }}</p>

        <!-- 功能行 -->
        <div class="action-row">
          <label class="remember-me">
            <input type="checkbox" v-model="rememberMe" />
            <span class="checkbox-custom"></span>
            <span>记住我</span>
          </label>
          <span class="forgot-link" @click="goForgot">忘记密码？</span>
        </div>

        <!-- 全局错误 -->
        <transition name="fade">
          <div v-if="globalError" class="global-error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {{ globalError }}
          </div>
        </transition>

        <!-- 登录按钮 -->
        <button type="submit" class="login-btn" :disabled="loading">
          <span class="btn-loader" v-if="loading"></span>
          <span v-else class="btn-inner">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10 17 15 12 10 7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            登录
          </span>
        </button>
      </form>

      <!-- 底部注册引导 -->
      <div class="bottom-area">
        <div class="bottom-divider">
          <span></span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <span></span>
        </div>
        <div class="register-guide">
          <span>还没有账号？</span>
          <span class="register-link" @click="goRegister">立即注册</span>
        </div>
      </div>

      <!-- 统一页脚 -->
      <div class="auth-footer">
        <div class="footer-divider"></div>
        <div class="footer-content">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <span>安全加密 · 保护您的隐私</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { authUtil } from '@/utils/auth'
import { login as apiLogin } from '@/api/auth'
import type { UserRole } from '@/types/auth'

const router = useRouter()
const route = useRoute()

// 角色选项
const roleOptions = [
  { value: 'employee' as UserRole, label: '普通员工', desc: '发起申请、查看个人订单' },
  { value: 'manager' as UserRole, label: '部门主管', desc: '审批本部门流程、查看部门报表' },
  { value: 'director' as UserRole, label: '董事经理', desc: '接收审批各部门流程、查看全公司报表' },
  { value: 'admin' as UserRole, label: '系统管理员', desc: '用户管理、权限分配、数据备份' }
]

const selectedRole = ref<UserRole>('employee')
const username = ref<string>('')
const password = ref<string>('')
const rememberMe = ref<boolean>(false)
const showPwd = ref<boolean>(false)
const loading = ref<boolean>(false)
const isShaking = ref<boolean>(false)
const globalError = ref<string>('')

const fieldErrors = reactive<{ username: string; password: string }>({ username: '', password: '' })
const fieldValid = reactive<{ username: boolean }>({ username: false })

const validateUsername = (): void => {
  if (!username.value.trim()) {
    fieldErrors.username = '请输入用户名'
    fieldValid.username = false
  } else {
    fieldErrors.username = ''
    fieldValid.username = true
  }
}

const shake = (): void => {
  isShaking.value = true
  setTimeout(() => { isShaking.value = false }, 500)
}

const setError = (msg: string): void => {
  globalError.value = msg
  shake()
  setTimeout(() => { globalError.value = '' }, 4000)
}

const handleLogin = async (): Promise<void> => {
  fieldErrors.username = ''
  fieldErrors.password = ''
  globalError.value = ''

  if (!username.value.trim()) { fieldErrors.username = '请输入用户名'; shake(); return }
  if (!password.value) { fieldErrors.password = '请输入密码'; shake(); return }

  loading.value = true
  try {
    const res = await apiLogin({ 
      username: username.value.trim(), 
      password: password.value,
      role: selectedRole.value 
    })
    const loginData = res.data
    authUtil.setToken(loginData.token)
    authUtil.setUserInfo({
      username: loginData.username,
      realName: loginData.realName || loginData.username,
      role: selectedRole.value,
      roleName: roleOptions.find(r => r.value === selectedRole.value)?.label || '普通员工',
      userId: loginData.userId
    })
    const redirectPath = route.query.redirect as string | undefined
    router.push(redirectPath ? redirectPath : { name: 'Dashboard' })
  } catch (e) {
    setError((e as Error).message || '登录失败，请检查用户名和密码')
  } finally {
    loading.value = false
  }
}

const goRegister = () => router.push({ name: 'Register' })
const goForgot = () => router.push({ name: 'ForgotPassword' })

// 粒子样式一次性生成
const particleStyles = Array.from({ length: 25 }, () => ({
  width: `${Math.random() * 6 + 2}px`,
  height: `${Math.random() * 6 + 2}px`,
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  animationDuration: `${Math.random() * 20 + 12}s`,
  animationDelay: `${Math.random() * 8}s`,
  opacity: `${Math.random() * 0.5 + 0.2}`
}))
</script>

<style scoped lang="scss">
/* ─── 容器 ─────────────────────────────────────── */
.login-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #060818;
  overflow: hidden;
}

/* ─── 网格背景 ───────────────────────────────────  */
.bg-mesh {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
  background-size: 60px 60px;
}

/* ─── 光晕圆球 ───────────────────────────────────  */
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  animation: orbFloat ease-in-out infinite;
}
.orb-1 { width: 500px; height: 500px; background: radial-gradient(circle, rgba(0,112,243,0.35), transparent 70%); top: -100px; left: -100px; animation-duration: 14s; }
.orb-2 { width: 400px; height: 400px; background: radial-gradient(circle, rgba(121,40,202,0.3), transparent 70%); bottom: -80px; right: -80px; animation-duration: 18s; animation-delay: -4s; }
.orb-3 { width: 300px; height: 300px; background: radial-gradient(circle, rgba(0,200,200,0.2), transparent 70%); top: 50%; left: 60%; animation-duration: 22s; animation-delay: -8s; }
@keyframes orbFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -30px) scale(1.05); }
  66% { transform: translate(-20px, 20px) scale(0.95); }
}

/* ─── 粒子 ───────────────────────────────────────  */
.bg-particles { position: absolute; inset: 0; pointer-events: none; }
.particle {
  position: absolute;
  background: rgba(255,255,255,0.7);
  border-radius: 50%;
  animation: floatUp linear infinite;
  filter: blur(0.5px);
}
@keyframes floatUp {
  0% { transform: translateY(0) translateX(0); opacity: 0; }
  10% { opacity: 0.4; }
  90% { opacity: 0.2; }
  100% { transform: translateY(-100vh) translateX(15px); opacity: 0; }
}

/* ─── 登录卡片 ───────────────────────────────────  */
.login-card {
  position: relative;
  width: 480px;
  padding: 40px 40px 32px;
  background: rgba(255,255,255,0.055);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 28px;
  border: 1px solid rgba(255,255,255,0.12);
  box-shadow: 0 0 0 1px rgba(255,255,255,0.05), 0 30px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1);
  z-index: 10;
  transition: box-shadow 0.3s ease;
  &:hover { box-shadow: 0 0 0 1px rgba(255,255,255,0.08), 0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.15); }
  &.shaking { animation: shake 0.45s ease; }
}
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-8px); }
  40% { transform: translateX(8px); }
  60% { transform: translateX(-5px); }
  80% { transform: translateX(5px); }
}

/* ─── 品牌区 ─────────────────────────────────────  */
.brand-area { display: flex; align-items: center; gap: 14px; margin-bottom: 24px; }
.brand-logo svg { width: 48px; height: 48px; border-radius: 14px; filter: drop-shadow(0 4px 12px rgba(0,112,243,0.4)); }
.brand-name { font-size: 20px; font-weight: 700; margin: 0 0 3px; background: linear-gradient(135deg, #fff 30%, #88bbff); -webkit-background-clip: text; background-clip: text; color: transparent; letter-spacing: 0.5px; }
.brand-slogan { font-size: 12px; color: rgba(255,255,255,0.45); margin: 0; letter-spacing: 0.3px; }

/* ─── 分割线 ─────────────────────────────────────  */
.divider {
  display: flex; align-items: center; gap: 12px; margin-bottom: 20px;
  &::before, &::after { content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.1); }
  span { font-size: 12px; color: rgba(255,255,255,0.35); white-space: nowrap; letter-spacing: 1px; }
}

/* ─── 角色选择器 ─────────────────────────────────  */
.role-selector {
  margin-bottom: 20px;
}
.role-label {
  display: block;
  font-size: 13px;
  color: rgba(255,255,255,0.5);
  margin-bottom: 12px;
  letter-spacing: 0.5px;
}
.role-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.role-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: rgba(255,255,255,0.05);
  border: 1.5px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
  &:hover {
    background: rgba(255,255,255,0.08);
    border-color: rgba(255,255,255,0.2);
  }
  &.active {
    background: rgba(0,112,243,0.15);
    border-color: rgba(0,112,243,0.6);
    box-shadow: 0 0 0 3px rgba(0,112,243,0.1);
  }
}
.role-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.1);
  border-radius: 10px;
  flex-shrink: 0;
  svg { width: 18px; height: 18px; color: rgba(255,255,255,0.7); }
  .active & {
    background: rgba(0,112,243,0.25);
    svg { color: #55ccff; }
  }
}
.role-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.role-name {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255,255,255,0.9);
}
.role-desc {
  font-size: 11px;
  color: rgba(255,255,255,0.45);
  line-height: 1.3;
}

/* ─── 伪登录提示 ─────────────────────────────────  */
.mock-tip {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 12px;
  color: rgba(255,200,100,0.9);
  background: rgba(255,200,0,0.07);
  border: 1px solid rgba(255,200,0,0.2);
  border-radius: 10px;
  padding: 10px 12px;
  margin-bottom: 20px;
  svg { width: 14px; height: 14px; flex-shrink: 0; color: #ffd166; margin-top: 1px; }
}

/* ─── 字段包裹 ───────────────────────────────────  */
.field-wrap {
  position: relative;
  display: flex;
  align-items: center;
  height: 54px;
  background: rgba(255,255,255,0.07);
  border: 1.5px solid rgba(255,255,255,0.12);
  border-radius: 14px;
  transition: border-color 0.25s ease, background 0.25s ease, box-shadow 0.25s ease;
  margin-bottom: 16px;
  &:focus-within { border-color: rgba(0,170,255,0.7); background: rgba(0,170,255,0.06); box-shadow: 0 0 0 3px rgba(0,170,255,0.15); }
  &.has-error { border-color: rgba(255,107,107,0.7); box-shadow: 0 0 0 3px rgba(255,107,107,0.12); margin-bottom: 4px; }
  &.is-valid { border-color: rgba(6,214,160,0.55); }
}
.field-icon { width: 44px; display: flex; justify-content: center; align-items: center; flex-shrink: 0; svg { width: 18px; height: 18px; color: rgba(255,255,255,0.35); transition: color 0.2s; } }
.field-wrap:focus-within .field-icon svg { color: rgba(0,170,255,0.7); }
.field-input {
  flex: 1; height: 100%; padding: 18px 8px 4px; background: none; border: none; outline: none; font-size: 15px; color: #fff; line-height: 1;
  &::placeholder { color: transparent; }
}
.field-label {
  position: absolute; left: 44px; top: 50%; transform: translateY(-50%); font-size: 14px; color: rgba(255,255,255,0.4); pointer-events: none;
  transition: top 0.2s ease, font-size 0.2s ease, color 0.2s ease, transform 0.2s ease; line-height: 1;
}
.field-input:focus ~ .field-label,
.field-input:not(:placeholder-shown) ~ .field-label {
  top: 10px; transform: none; font-size: 11px; color: #55ccff; letter-spacing: 0.3px;
}
.field-status { width: 38px; display: flex; justify-content: center; align-items: center; flex-shrink: 0; }
.icon-ok { width: 16px; height: 16px; color: #06d6a0; animation: popIn 0.2s ease; }
@keyframes popIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.pwd-eye {
  width: 38px; height: 100%; background: none; border: none; cursor: pointer; color: rgba(255,255,255,0.4);
  padding: 0; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  svg { width: 17px; height: 17px; }
  &:hover { color: rgba(255,255,255,0.85); }
}
.field-err { font-size: 12px; color: #ff7e7e; margin: 0 0 12px 6px; animation: fadeSlideIn 0.2s ease; line-height: 1.4; }
@keyframes fadeSlideIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }

/* ─── 功能行 ─────────────────────────────────────  */
.action-row { display: flex; justify-content: space-between; align-items: center; margin: 0 0 20px; }
.remember-me {
  display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px; color: rgba(255,255,255,0.6); user-select: none;
  input[type='checkbox'] { display: none; }
}
.checkbox-custom {
  width: 16px; height: 16px; border: 1.5px solid rgba(255,255,255,0.3); border-radius: 5px;
  display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s;
}
.remember-me input:checked + .checkbox-custom {
  background: linear-gradient(135deg, #0070f3, #7928ca); border-color: transparent;
  &::after { content: ''; width: 8px; height: 5px; border-left: 2px solid #fff; border-bottom: 2px solid #fff; transform: rotate(-45deg) translate(1px, -1px); display: block; }
}
.forgot-link { font-size: 13px; color: rgba(100,180,255,0.8); cursor: pointer; transition: color 0.2s; &:hover { color: #88ccff; text-decoration: underline; } }

/* ─── 全局错误 ───────────────────────────────────  */
.fade-enter-active, .fade-leave-active { transition: all 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-6px); }
.global-error {
  display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: rgba(255,80,80,0.12);
  border: 1px solid rgba(255,80,80,0.3); border-radius: 12px; color: #ff8080; font-size: 13px; margin-bottom: 16px;
  svg { width: 16px; height: 16px; flex-shrink: 0; }
}

/* ─── 登录按钮 ───────────────────────────────────  */
.login-btn {
  width: 100%; padding: 15px 0; border: none; border-radius: 40px;
  background: linear-gradient(135deg, #0070f3, #7928ca); color: #fff; font-size: 16px; font-weight: 700;
  cursor: pointer; position: relative; overflow: hidden; transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0,112,243,0.4); letter-spacing: 1px; display: flex; align-items: center; justify-content: center; gap: 8px;
  &::after { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent); opacity: 0; transition: opacity 0.3s; }
  &:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,112,243,0.6); &::after { opacity: 1; } }
  &:active:not(:disabled) { transform: translateY(1px); }
  &:disabled { opacity: 0.55; cursor: not-allowed; }
}
.btn-inner { display: flex; align-items: center; gap: 8px; svg { width: 18px; height: 18px; } }
.btn-loader { width: 20px; height: 20px; border: 2.5px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ─── 底部区域 ───────────────────────────────────  */
.bottom-area { margin-top: 22px; }
.bottom-divider {
  display: flex; align-items: center; gap: 10px; margin-bottom: 14px;
  span { flex: 1; height: 1px; background: rgba(255,255,255,0.08); }
  svg { width: 14px; height: 14px; color: rgba(255,255,255,0.2); flex-shrink: 0; }
}
.register-guide { text-align: center; font-size: 13px; color: rgba(255,255,255,0.45); span:first-child { margin-right: 4px; } }
.register-link { color: rgba(100,180,255,0.85); cursor: pointer; font-weight: 600; transition: all 0.2s; &:hover { color: #88ccff; text-decoration: underline; } }

/* ─── 统一页脚 ───────────────────────────────────  */
.auth-footer { margin-top: 20px; }
.footer-divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent); margin-bottom: 14px; }
.footer-content {
  display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 11px; color: rgba(255,255,255,0.3);
  svg { width: 12px; height: 12px; opacity: 0.6; }
}

/* ─── 响应式 ─────────────────────────────────────  */
@media (max-width: 520px) {
  .login-card { width: 92%; padding: 32px 20px 24px; }
  .brand-name { font-size: 18px; }
  .role-options { grid-template-columns: 1fr; }
}
</style>
