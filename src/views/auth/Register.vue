<template>
  <div class="register-container">
    <!-- 背景层 -->
    <div class="bg-mesh"></div>
    <div class="bg-particles">
      <div v-for="(style, i) in particleStyles" :key="i" class="particle" :style="style"></div>
    </div>
    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>
    <div class="orb orb-3"></div>

    <!-- 注册卡片 -->
    <div class="register-card">
      <!-- 品牌区 -->
      <div class="brand-area">
        <div class="brand-logo">
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="14" fill="url(#regLogoGrad)"/>
            <path d="M14 24 L24 14 L34 24 L28 24 L28 34 L20 34 L20 24 Z" fill="white" fill-opacity="0.9"/>
            <path d="M20 24 L24 20 L28 24" fill="white" fill-opacity="0.5"/>
            <defs>
              <linearGradient id="regLogoGrad" x1="0" y1="0" x2="48" y2="48">
                <stop offset="0%" stop-color="#0070f3"/>
                <stop offset="100%" stop-color="#7928ca"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div class="brand-text">
          <h1 class="brand-name">创建账户</h1>
          <p class="brand-slogan">加入 Company ERP 平台</p>
        </div>
      </div>

      <!-- 分割线 -->
      <div class="divider"><span>填写注册信息</span></div>

      <!-- 注册成功状态 -->
      <transition name="slide-fade">
        <div v-if="registerSuccess" class="success-state">
          <div class="success-circle">
            <svg viewBox="0 0 52 52">
              <circle class="s-circle" cx="26" cy="26" r="25" fill="none"/>
              <path class="s-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
          </div>
          <h3 class="success-title">注册成功！</h3>
          <p class="success-hint">欢迎加入，<strong>{{ registeredName }}</strong>！</p>
          <p class="success-count">{{ countdownSec }}s 后跳转到登录页</p>
          <button class="submit-btn" @click="goLogin">立即登录</button>
        </div>
      </transition>

      <!-- 注册表单 -->
      <transition name="slide-fade">
        <form v-if="!registerSuccess" @submit.prevent="handleRegister" class="reg-form">

          <!-- 用户名 -->
          <div class="field-wrap" :class="usernameWrapClass">
            <div class="field-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <input
              v-model="form.username"
              id="reg-username"
              type="text"
              class="field-input"
              placeholder=" "
              autocomplete="off"
              @blur="checkUsernameAvailable"
              @input="onUsernameInput"
            />
            <label for="reg-username" class="field-label">用户名</label>
            <div class="field-status">
              <span class="mini-spin" v-if="usernameChecking"></span>
              <svg v-else-if="fieldState.username === 'ok'" class="icon-ok" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <svg v-else-if="fieldState.username === 'err'" class="icon-err" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </div>
          </div>
          <p class="field-err" v-if="errors.username">{{ errors.username }}</p>
          <p class="field-ok"  v-if="fieldState.username === 'ok' && !errors.username">用户名可用 ✓</p>

          <!-- 邮箱 -->
          <div class="field-wrap" :class="{ 'has-error': errors.email, 'is-valid': fieldState.email === 'ok' }">
            <div class="field-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <input
              v-model="form.email"
              id="reg-email"
              type="email"
              class="field-input"
              placeholder=" "
              autocomplete="email"
              @blur="validateEmail"
            />
            <label for="reg-email" class="field-label">邮箱地址</label>
            <div class="field-status">
              <svg v-if="fieldState.email === 'ok'" class="icon-ok" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
          </div>
          <p class="field-err" v-if="errors.email">{{ errors.email }}</p>

          <!-- 密码 -->
          <div class="field-wrap" :class="{ 'has-error': errors.password }">
            <div class="field-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <input
              v-model="form.password"
              id="reg-password"
              :type="showPwd ? 'text' : 'password'"
              class="field-input"
              placeholder=" "
              autocomplete="new-password"
            />
            <label for="reg-password" class="field-label">密码</label>
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
          <!-- 密码强度 -->
          <div class="pwd-strength-wrap" v-if="form.password.length > 0">
            <div class="strength-bars">
              <div v-for="n in 4" :key="n" class="bar" :class="strengthBarClass(n)"></div>
            </div>
            <span class="strength-label" :class="strengthInfo.cls">{{ strengthInfo.text }}</span>
          </div>
          <p class="field-err" v-if="errors.password">{{ errors.password }}</p>

          <!-- 确认密码 -->
          <div class="field-wrap" :class="{ 'has-error': errors.confirmPassword, 'is-valid': fieldState.confirmPassword === 'ok' }">
            <div class="field-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <input
              v-model="form.confirmPassword"
              id="reg-confirm"
              :type="showPwd ? 'text' : 'password'"
              class="field-input"
              placeholder=" "
              autocomplete="new-password"
              @input="checkConfirm"
            />
            <label for="reg-confirm" class="field-label">确认密码</label>
            <div class="field-status">
              <svg v-if="fieldState.confirmPassword === 'ok'" class="icon-ok" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
          </div>
          <p class="field-err" v-if="errors.confirmPassword">{{ errors.confirmPassword }}</p>

          <!-- 用户协议 -->
          <label class="agree-row" :class="{ 'has-error': errors.agree }">
            <input type="checkbox" v-model="form.agree" />
            <span class="checkbox-custom"></span>
            <span>我已阅读并同意
              <span class="link-text">《用户协议》</span>和
              <span class="link-text">《隐私政策》</span>
            </span>
          </label>
          <p class="field-err" v-if="errors.agree">{{ errors.agree }}</p>

          <!-- 全局错误 -->
          <transition name="fade">
            <div v-if="globalError" class="global-error">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {{ globalError }}
            </div>
          </transition>

          <!-- 提交按钮 -->
          <button type="submit" class="submit-btn" :disabled="loading">
            <span class="btn-loader" v-if="loading"></span>
            <span v-else class="btn-inner">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="8.5" cy="7" r="4"/>
                <line x1="20" y1="8" x2="20" y2="14"/>
                <line x1="23" y1="11" x2="17" y2="11"/>
              </svg>
              注册账号
            </span>
          </button>
        </form>
      </transition>

      <!-- 底部登录引导 -->
      <div class="bottom-area" v-if="!registerSuccess">
        <div class="bottom-divider">
          <span></span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="8.5" cy="7" r="4"/>
          </svg>
          <span></span>
        </div>
        <div class="login-guide">
          <span>已有账号？</span>
          <span class="login-link" @click="goLogin">立即登录</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { register as apiRegister } from '@/api/auth'

type FieldState = 'ok' | 'err' | ''

const router = useRouter()

const form = reactive<{
  username: string
  email: string
  password: string
  confirmPassword: string
  agree: boolean
}>({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  agree: false
})

const errors = reactive<Record<string, string>>({ username: '', email: '', password: '', confirmPassword: '', agree: '' })
const fieldState = reactive<{ username: FieldState; email: FieldState; confirmPassword: FieldState }>({ username: '', email: '', confirmPassword: '' })
const loading          = ref<boolean>(false)
const usernameChecking = ref<boolean>(false)
const globalError      = ref<string>('')
const registerSuccess  = ref<boolean>(false)
const registeredName   = ref<string>('')
const showPwd          = ref<boolean>(false)
const countdownSec     = ref<number>(3)
let   countdownTimer: ReturnType<typeof setInterval> | null = null

onUnmounted(() => { if (countdownTimer) clearInterval(countdownTimer) })

// ── 用户名实时检测 ─────────────────────────────
let usernameTimer: ReturnType<typeof setTimeout> | null = null
const onUsernameInput = (): void => {
  fieldState.username = ''
  errors.username = ''
  if (usernameTimer) clearTimeout(usernameTimer)
  if (form.username.length >= 2) {
    usernameTimer = setTimeout(checkUsernameAvailable, 600)
  }
}
const checkUsernameAvailable = async (): Promise<void> => {
  const val = form.username.trim()
  if (!val)        { errors.username = '请输入用户名'; fieldState.username = 'err'; return }
  if (val.length < 3)  { errors.username = '用户名至少 3 个字符'; fieldState.username = 'err'; return }
  if (val.length > 32) { errors.username = '用户名最多 32 个字符'; fieldState.username = 'err'; return }
  if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(val)) {
    errors.username = '用户名只能包含字母、数字、下划线或中文'
    fieldState.username = 'err'; return
  }
  usernameChecking.value = true
  try {
    await new Promise<void>(r => setTimeout(r, 300))
    errors.username = ''
    fieldState.username = 'ok'
  } catch {
    errors.username = '检测失败，请稍后重试'; fieldState.username = 'err'
  } finally {
    usernameChecking.value = false
  }
}

// ── 邮箱校验 ──────────────────────────────────
const validateEmail = (): void => {
  const val = form.email.trim()
  if (!val) { errors.email = '请输入邮箱地址'; fieldState.email = ''; return }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) { errors.email = '邮箱格式不正确'; fieldState.email = ''; return }
  errors.email = ''; fieldState.email = 'ok'
}

// ── 确认密码联动 ───────────────────────────────
const checkConfirm = (): void => {
  if (!form.confirmPassword) { errors.confirmPassword = ''; fieldState.confirmPassword = ''; return }
  if (form.confirmPassword !== form.password) {
    errors.confirmPassword = '两次密码不一致'; fieldState.confirmPassword = 'err'
  } else {
    errors.confirmPassword = ''; fieldState.confirmPassword = 'ok'
  }
}

// ── 密码强度 ───────────────────────────────────
const pwdStrength = computed<number>(() => {
  const p = form.password
  if (!p) return 0
  let s = 0
  if (p.length >= 6)  s++
  if (p.length >= 10) s++
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++
  if (/[0-9]/.test(p)) s++
  if (/[^A-Za-z0-9]/.test(p)) s++
  return Math.min(s, 4)
})
const strengthInfo = computed(() => {
  const map = [
    { text: '',   cls: '' },
    { text: '弱', cls: 'weak' },
    { text: '一般', cls: 'fair' },
    { text: '良好', cls: 'good' },
    { text: '强',  cls: 'strong' }
  ]
  return map[pwdStrength.value] ?? map[0]
})
const strengthBarClass = (n: number): string => {
  if (n > pwdStrength.value) return ''
  return ['', 'weak', 'fair', 'good', 'strong'][pwdStrength.value] || ''
}

// ── 用户名字段样式 ─────────────────────────────
const usernameWrapClass = computed(() => ({
  'has-error':  fieldState.username === 'err',
  'is-valid':   fieldState.username === 'ok',
  'is-loading': usernameChecking.value
}))

// ── 提交注册 ───────────────────────────────────
const setError = (msg: string): void => {
  globalError.value = msg
  setTimeout(() => { globalError.value = '' }, 4000)
}

const handleRegister = async (): Promise<void> => {
  Object.keys(errors).forEach(k => { errors[k] = '' })
  globalError.value = ''

  let hasErr = false
  if (!form.username.trim()) { errors.username = '请输入用户名'; hasErr = true }
  else if (fieldState.username === 'err') { hasErr = true }
  if (!form.email.trim())    { errors.email = '请输入邮箱'; hasErr = true }
  else if (fieldState.email !== 'ok') { validateEmail(); if (errors.email) hasErr = true }
  if (!form.password)        { errors.password = '请输入密码'; hasErr = true }
  else if (form.password.length < 6) { errors.password = '密码长度不能少于 6 位'; hasErr = true }
  if (!form.confirmPassword) { errors.confirmPassword = '请确认密码'; hasErr = true }
  else if (form.password !== form.confirmPassword) { errors.confirmPassword = '两次密码不一致'; hasErr = true }
  if (!form.agree) { errors.agree = '请先阅读并同意用户协议'; hasErr = true }
  if (hasErr) return

  loading.value = true
  try {
    await apiRegister({
      username: form.username.trim(),
      email:    form.email.trim(),
      password: form.password
    })
    registeredName.value = form.username.trim()
    registerSuccess.value = true
    countdownTimer = setInterval(() => {
      countdownSec.value--
      if (countdownSec.value <= 0) {
        if (countdownTimer) clearInterval(countdownTimer)
        router.push({ name: 'Login' })
      }
    }, 1000)
  } catch (e) {
    setError((e as Error).message)
  } finally {
    loading.value = false
  }
}

const goLogin = () => router.push({ name: 'Login' })

const particleStyles = Array.from({ length: 25 }, () => ({
  width:             `${Math.random() * 6 + 2}px`,
  height:            `${Math.random() * 6 + 2}px`,
  left:              `${Math.random() * 100}%`,
  top:               `${Math.random() * 100}%`,
  animationDuration: `${Math.random() * 20 + 12}s`,
  animationDelay:    `${Math.random() * 8}s`,
  opacity:           `${Math.random() * 0.5 + 0.2}`
}))
</script>

<style scoped lang="scss">
.register-container {
  position: relative; display: flex; justify-content: center; align-items: center;
  min-height: 100vh; background: #060818; overflow: hidden; padding: 40px 0;
}
.bg-mesh {
  position: absolute; inset: 0;
  background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
  background-size: 60px 60px;
}
.orb { position: absolute; border-radius: 50%; filter: blur(80px); animation: orbFloat ease-in-out infinite; }
.orb-1 { width: 500px; height: 500px; background: radial-gradient(circle, rgba(0,112,243,0.35), transparent 70%); top: -100px; left: -100px; animation-duration: 14s; }
.orb-2 { width: 400px; height: 400px; background: radial-gradient(circle, rgba(121,40,202,0.3), transparent 70%); bottom: -80px; right: -80px; animation-duration: 18s; animation-delay: -4s; }
.orb-3 { width: 300px; height: 300px; background: radial-gradient(circle, rgba(0,200,200,0.2), transparent 70%); top: 50%; left: 60%; animation-duration: 22s; animation-delay: -8s; }
@keyframes orbFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(25px, -25px) scale(1.04); }
  66% { transform: translate(-18px, 18px) scale(0.96); }
}
.bg-particles { position: absolute; inset: 0; pointer-events: none; }
.particle { position: absolute; background: rgba(255,255,255,0.7); border-radius: 50%; animation: floatUp linear infinite; filter: blur(0.5px); }
@keyframes floatUp {
  0%   { transform: translateY(0) translateX(0); opacity: 0; }
  10%  { opacity: 0.35; }
  90%  { opacity: 0.15; }
  100% { transform: translateY(-100vh) translateX(15px); opacity: 0; }
}
.register-card {
  position: relative; width: 440px; padding: 44px 42px 36px; background: rgba(255,255,255,0.055);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-radius: 28px;
  border: 1px solid rgba(255,255,255,0.12);
  box-shadow: 0 0 0 1px rgba(255,255,255,0.05), 0 30px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1);
  z-index: 10;
  &:hover { box-shadow: 0 0 0 1px rgba(255,255,255,0.08), 0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.15); }
}
.brand-area { display: flex; align-items: center; gap: 14px; margin-bottom: 28px; }
.brand-logo svg { width: 48px; height: 48px; border-radius: 14px; filter: drop-shadow(0 4px 12px rgba(0,112,243,0.4)); }
.brand-name { font-size: 20px; font-weight: 700; margin: 0 0 3px; background: linear-gradient(135deg, #fff 30%, #88bbff); -webkit-background-clip: text; background-clip: text; color: transparent; }
.brand-slogan { font-size: 12px; color: rgba(255,255,255,0.45); margin: 0; letter-spacing: 0.3px; }
.divider {
  display: flex; align-items: center; gap: 12px; margin-bottom: 24px;
  &::before, &::after { content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.1); }
  span { font-size: 12px; color: rgba(255,255,255,0.35); white-space: nowrap; letter-spacing: 1px; }
}
.field-wrap {
  position: relative; display: flex; align-items: center; height: 56px;
  background: rgba(255,255,255,0.07); border: 1.5px solid rgba(255,255,255,0.12);
  border-radius: 14px; transition: border-color 0.25s ease, background 0.25s ease, box-shadow 0.25s ease; margin-bottom: 20px;
  &:focus-within { border-color: rgba(0,170,255,0.7); background: rgba(0,170,255,0.06); box-shadow: 0 0 0 3px rgba(0,170,255,0.15); }
  &.has-error  { border-color: rgba(255,107,107,0.7); box-shadow: 0 0 0 3px rgba(255,107,107,0.12); margin-bottom: 4px; }
  &.is-valid   { border-color: rgba(6,214,160,0.55); }
  &.is-loading { border-color: rgba(255,200,50,0.5); }
}
.field-icon { width: 44px; display: flex; justify-content: center; align-items: center; flex-shrink: 0; svg { width: 18px; height: 18px; color: rgba(255,255,255,0.35); transition: color 0.2s; } }
.field-wrap:focus-within .field-icon svg { color: rgba(0,170,255,0.7); }
.field-input { flex: 1; height: 100%; padding: 18px 8px 4px; background: none; border: none; outline: none; font-size: 15px; color: #fff; line-height: 1; &::placeholder { color: transparent; } }
.field-label { position: absolute; left: 44px; top: 50%; transform: translateY(-50%); font-size: 14px; color: rgba(255,255,255,0.4); pointer-events: none; transition: top 0.2s ease, font-size 0.2s ease, color 0.2s ease, transform 0.2s ease; line-height: 1; }
.field-input:focus ~ .field-label,
.field-input:not(:placeholder-shown) ~ .field-label { top: 10px; transform: none; font-size: 11px; color: #55ccff; letter-spacing: 0.3px; }
.field-status { width: 38px; flex-shrink: 0; display: flex; justify-content: center; align-items: center; }
.icon-ok  { width: 16px; height: 16px; color: #06d6a0; animation: popIn 0.2s ease; }
.icon-err { width: 16px; height: 16px; color: #ff6b6b; animation: popIn 0.2s ease; }
@keyframes popIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.mini-spin { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.2); border-top-color: #55ccff; border-radius: 50%; animation: spin 0.7s linear infinite; }
.pwd-eye { width: 38px; height: 100%; background: none; border: none; cursor: pointer; color: rgba(255,255,255,0.4); padding: 0; display: flex; align-items: center; justify-content: center; flex-shrink: 0; svg { width: 17px; height: 17px; } &:hover { color: rgba(255,255,255,0.85); } }
.field-err { font-size: 12px; color: #ff7e7e; margin: 0 0 16px 6px; animation: fadeSlideIn 0.2s ease; line-height: 1.4; }
.field-ok  { font-size: 12px; color: #06d6a0; margin: 0 0 16px 6px; animation: fadeSlideIn 0.2s ease; }
@keyframes fadeSlideIn { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:translateY(0); } }
.pwd-strength-wrap { display: flex; align-items: center; gap: 10px; margin: -16px 0 16px; }
.strength-bars { display: flex; gap: 5px; }
.bar { width: 36px; height: 4px; background: rgba(255,255,255,0.1); border-radius: 4px; transition: background 0.3s ease; &.weak { background: #ff6b6b; } &.fair { background: #ffd166; } &.good { background: #06d6a0; } &.strong { background: #0070f3; } }
.strength-label { font-size: 12px; &.weak { color: #ff6b6b; } &.fair { color: #ffd166; } &.good { color: #06d6a0; } &.strong { color: #55aaff; } }
.agree-row {
  display: flex; align-items: flex-start; gap: 8px; font-size: 13px; color: rgba(255,255,255,0.6); cursor: pointer; user-select: none; margin: 8px 0 6px;
  input[type='checkbox'] { display: none; }
  &.has-error { color: #ff8080; .checkbox-custom { border-color: rgba(255,107,107,0.6); } }
}
.checkbox-custom { width: 16px; height: 16px; flex-shrink: 0; margin-top: 1px; border: 1.5px solid rgba(255,255,255,0.3); border-radius: 5px; display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s; }
.agree-row input:checked + .checkbox-custom { background: linear-gradient(135deg, #0070f3, #7928ca); border-color: transparent; &::after { content: ''; width: 8px; height: 5px; border-left: 2px solid #fff; border-bottom: 2px solid #fff; transform: rotate(-45deg) translate(1px, -1px); display: block; } }
.link-text { color: rgba(100,220,255,0.85); cursor: pointer; &:hover { text-decoration: underline; color: #88ddff; } }
.fade-enter-active, .fade-leave-active { transition: all 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-6px); }
.global-error { display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: rgba(255,80,80,0.12); border: 1px solid rgba(255,80,80,0.3); border-radius: 12px; color: #ff8080; font-size: 13px; margin-bottom: 14px; svg { width: 16px; height: 16px; flex-shrink: 0; } }
.submit-btn {
  width: 100%; padding: 15px 0; border: none; border-radius: 40px; background: linear-gradient(135deg, #0070f3, #7928ca);
  color: #fff; font-size: 16px; font-weight: 700; cursor: pointer; position: relative; overflow: hidden;
  transition: all 0.3s ease; box-shadow: 0 4px 20px rgba(0,112,243,0.4); display: flex; align-items: center; justify-content: center; gap: 8px; letter-spacing: 1px; margin-top: 12px;
  &::after { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent); opacity: 0; transition: opacity 0.3s; }
  &:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,112,243,0.6); &::after { opacity: 1; } }
  &:active:not(:disabled) { transform: translateY(1px); }
  &:disabled { opacity: 0.55; cursor: not-allowed; }
}
.btn-inner { display: flex; align-items: center; gap: 8px; svg { width: 18px; height: 18px; } }
.btn-loader { width: 20px; height: 20px; border: 2.5px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.slide-fade-enter-active, .slide-fade-leave-active { transition: all 0.4s ease; }
.slide-fade-enter-from { opacity: 0; transform: translateX(30px); }
.slide-fade-leave-to   { opacity: 0; transform: translateX(-30px); }
.success-state { display: flex; flex-direction: column; align-items: center; padding: 12px 0 8px; text-align: center; }
.success-circle { width: 80px; height: 80px; margin-bottom: 20px; svg { width: 100%; height: 100%; } }
.s-circle { stroke: #0070f3; stroke-width: 2; stroke-dasharray: 166; stroke-dashoffset: 166; animation: drawCircle 0.8s ease forwards; }
.s-check  { stroke: #06d6a0; stroke-width: 2.5; stroke-dasharray: 48; stroke-dashoffset: 48; animation: drawCheck 0.5s 0.6s ease forwards; }
@keyframes drawCircle { to { stroke-dashoffset: 0; } }
@keyframes drawCheck  { to { stroke-dashoffset: 0; } }
.success-title { font-size: 24px; font-weight: 700; color: #06d6a0; margin: 0 0 10px; }
.success-hint  { font-size: 15px; color: rgba(255,255,255,0.75); margin: 0 0 8px; strong { color: #fff; } }
.success-count { font-size: 13px; color: rgba(255,255,255,0.4); margin: 0 0 24px; }
.bottom-area { margin-top: 20px; }
.bottom-divider { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; span { flex: 1; height: 1px; background: rgba(255,255,255,0.08); } svg { width: 14px; height: 14px; color: rgba(255,255,255,0.2); flex-shrink: 0; } }
.login-guide { text-align: center; font-size: 13px; color: rgba(255,255,255,0.45); span:first-child { margin-right: 4px; } }
.login-link { color: rgba(100,220,255,0.85); cursor: pointer; font-weight: 600; transition: all 0.2s; &:hover { color: #88ddff; text-decoration: underline; } }
@media (max-width: 500px) {
  .register-card { width: 88%; padding: 32px 22px 24px; }
  .brand-name { font-size: 18px; }
  .bar { width: 28px; }
}
</style>
