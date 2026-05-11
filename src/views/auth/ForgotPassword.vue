<template>
  <div class="recovery-container">
    <div class="bg-mesh"></div>
    <div class="bg-particles">
      <div v-for="(style, i) in particleStyles" :key="i" class="particle" :style="style"></div>
    </div>
    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>
    <div class="orb orb-3"></div>

    <div class="recovery-card" :class="{ shaking: isShaking }">
      <!-- 品牌区 -->
      <div class="brand-area">
        <div class="brand-logo">
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="14" fill="url(#recovLogoGrad)"/>
            <path d="M14 24 L24 14 L34 24 L28 24 L28 34 L20 34 L20 24 Z" fill="white" fill-opacity="0.9"/>
            <path d="M20 24 L24 20 L28 24" fill="white" fill-opacity="0.5"/>
            <defs>
              <linearGradient id="recovLogoGrad" x1="0" y1="0" x2="48" y2="48">
                <stop offset="0%" stop-color="#0070f3"/>
                <stop offset="100%" stop-color="#7928ca"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div class="brand-text">
          <h1 class="brand-name">找回密码</h1>
          <p class="brand-slogan">{{ stepSubtitle }}</p>
        </div>
      </div>

      <!-- 步骤条 -->
      <div class="step-bar">
        <div
          v-for="(s, idx) in steps"
          :key="idx"
          class="step-item"
          :class="{ active: currentStep === idx, done: currentStep > idx }"
        >
          <div class="step-dot">
            <svg v-if="currentStep > idx" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span v-else>{{ idx + 1 }}</span>
          </div>
          <span class="step-label">{{ s }}</span>
        </div>
        <div class="step-line">
          <div class="step-line-fill" :style="{ width: stepLineWidth }"></div>
        </div>
      </div>

      <!-- Step 0：验证账号 -->
      <transition name="slide-fade" mode="out-in">
        <div v-if="currentStep === 0" key="step0" class="step-content">
          <div class="field-wrap" :class="{ 'has-error': fieldErrors.username, 'is-valid': fieldValid.username }">
            <div class="field-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <input v-model="username" id="gb-username" type="text" class="field-input" placeholder=" " @blur="validateUsername" @keyup.enter="handleCheckAccount"/>
            <label for="gb-username" class="field-label">用户名</label>
            <div class="field-status"><svg v-if="fieldValid.username" class="icon-ok" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg></div>
          </div>
          <p v-if="fieldErrors.username" class="field-err">{{ fieldErrors.username }}</p>

          <div class="field-wrap" :class="{ 'has-error': fieldErrors.email, 'is-valid': fieldValid.email }">
            <div class="field-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
            <input v-model="email" id="gb-email" type="email" class="field-input" placeholder=" " @blur="validateEmail" @keyup.enter="handleCheckAccount"/>
            <label for="gb-email" class="field-label">绑定邮箱</label>
            <div class="field-status"><svg v-if="fieldValid.email" class="icon-ok" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg></div>
          </div>
          <p v-if="fieldErrors.email" class="field-err">{{ fieldErrors.email }}</p>

          <button @click="handleCheckAccount" class="primary-btn" :disabled="loading">
            <span class="btn-loader" v-if="loading"></span>
            <span v-else class="btn-inner">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              下一步
            </span>
          </button>
        </div>
      </transition>

      <!-- Step 1：发送验证码 -->
      <transition name="slide-fade" mode="out-in">
        <div v-if="currentStep === 1" key="step1" class="step-content">
          <div class="info-banner">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            <span>验证码将发送至：<strong>{{ maskedEmail }}</strong></span>
          </div>
          <div class="mock-notice">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>演示模式：验证码固定为 <strong>123456</strong></span>
          </div>
          <button @click="handleSendCode" class="primary-btn" :disabled="loading || countdown > 0">
            <span class="btn-loader" v-if="loading"></span>
            <span v-else class="btn-inner">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              {{ countdown > 0 ? `重新发送 (${countdown}s)` : '发送验证码' }}
            </span>
          </button>
          <button @click="currentStep = 0" class="ghost-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
            上一步
          </button>
        </div>
      </transition>

      <!-- Step 2：输入验证码 -->
      <transition name="slide-fade" mode="out-in">
        <div v-if="currentStep === 2" key="step2" class="step-content">
          <p class="code-hint">请输入收到的 6 位验证码</p>
          <div class="code-input-row">
            <input
              v-for="(_, idx) in codeDigits"
              :key="idx"
              :ref="(el) => { if (el) codeRefs[idx] = el as HTMLInputElement }"
              v-model="codeDigits[idx]"
              class="code-cell"
              type="text"
              maxlength="1"
              inputmode="numeric"
              @input="onCodeInput(idx)"
              @keydown.backspace="onCodeBackspace(idx)"
              @paste.prevent="onCodePaste"
            />
          </div>
          <button @click="handleVerifyCode" class="primary-btn" :disabled="loading || codeStr.length < 6">
            <span class="btn-loader" v-if="loading"></span>
            <span v-else class="btn-inner">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              验 证
            </span>
          </button>
          <button @click="currentStep = 1" class="ghost-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
            重新发送
          </button>
        </div>
      </transition>

      <!-- Step 3：重置密码 -->
      <transition name="slide-fade" mode="out-in">
        <div v-if="currentStep === 3" key="step3" class="step-content">
          <div class="field-wrap" :class="{ 'has-error': fieldErrors.newPassword }">
            <div class="field-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <input v-model="newPassword" id="gb-newpwd" :type="showPwd ? 'text' : 'password'" class="field-input" placeholder=" "/>
            <label for="gb-newpwd" class="field-label">新密码</label>
            <button type="button" class="pwd-eye" @click="showPwd = !showPwd">
              <svg v-if="showPwd" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
          <div class="pwd-strength-wrap" v-if="newPassword.length > 0">
            <div class="strength-bars"><div v-for="n in 4" :key="n" class="bar" :class="strengthBarClass(n)"></div></div>
            <span class="strength-label" :class="strengthInfo.cls">{{ strengthInfo.text }}</span>
          </div>
          <p v-if="fieldErrors.newPassword" class="field-err">{{ fieldErrors.newPassword }}</p>

          <div class="field-wrap" :class="{ 'has-error': fieldErrors.confirmPassword, 'is-valid': confirmOk }">
            <div class="field-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <input v-model="confirmPassword" id="gb-confirmpwd" :type="showPwd ? 'text' : 'password'" class="field-input" placeholder=" " @input="checkConfirm" @keyup.enter="handleResetPassword"/>
            <label for="gb-confirmpwd" class="field-label">确认新密码</label>
            <div class="field-status"><svg v-if="confirmOk" class="icon-ok" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg></div>
          </div>
          <p v-if="fieldErrors.confirmPassword" class="field-err">{{ fieldErrors.confirmPassword }}</p>

          <button @click="handleResetPassword" class="primary-btn" :disabled="loading">
            <span class="btn-loader" v-if="loading"></span>
            <span v-else class="btn-inner">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              确认重置
            </span>
          </button>
        </div>
      </transition>

      <!-- Step 4：成功 -->
      <transition name="slide-fade" mode="out-in">
        <div v-if="currentStep === 4" key="step4" class="step-content success-state">
          <div class="success-circle">
            <svg viewBox="0 0 52 52">
              <circle class="s-circle" cx="26" cy="26" r="25" fill="none"/>
              <path class="s-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
          </div>
          <h3 class="success-title">重置成功！</h3>
          <p class="success-hint">密码已更新，请使用新密码登录</p>
          <p class="success-count">{{ countdown }}s 后自动跳转</p>
          <button class="primary-btn" @click="goLogin">
            <span class="btn-inner">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
              立即登录
            </span>
          </button>
        </div>
      </transition>

      <!-- 全局错误 -->
      <transition name="fade">
        <div v-if="errorMsg" class="global-error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {{ errorMsg }}
        </div>
      </transition>

      <!-- 返回登录 -->
      <div class="back-link" v-if="currentStep < 4">
        <span @click="goLogin">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          返回登录
        </span>
      </div>

      <!-- 统一页脚 -->
      <div class="auth-footer">
        <div class="footer-divider"></div>
        <div class="footer-content">
          <div class="shield-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="shieldGrad" x1="0" y1="0" x2="24" y2="24">
                  <stop offset="0%" stop-color="#0070f3"/>
                  <stop offset="100%" stop-color="#7928ca"/>
                </linearGradient>
              </defs>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="url(#shieldGrad)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="rgba(0,112,243,0.1)"/>
              <path d="M9 12l2 2 4-4" stroke="#06d6a0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span>安全加密 · 保护您的隐私</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { authUtil } from '@/utils/auth'
import { checkAccount, sendVerifyCode, verifyCode, resetPassword } from '@/api/auth'

const router = useRouter()

const steps = ['验证账号', '发送验证码', '输入验证码', '重置密码']
const currentStep = ref<number>(0)
const isShaking   = ref<boolean>(false)

const stepLineWidth = computed<string>(() => {
  const pct = currentStep.value === 4 ? 100 : (currentStep.value / (steps.length - 1)) * 100
  return `${pct}%`
})
const stepSubtitle = computed<string>(() => {
  const map = ['请输入您的账号信息', '我们将向您的邮箱发送验证码', '请输入收到的 6 位验证码', '请设置您的新密码', '密码已重置成功']
  return map[currentStep.value] ?? ''
})

const username        = ref<string>('')
const email           = ref<string>('')
const maskedEmail     = ref<string>('')
const newPassword     = ref<string>('')
const confirmPassword = ref<string>('')
const showPwd         = ref<boolean>(false)
const loading         = ref<boolean>(false)
const errorMsg        = ref<string>('')
const countdown       = ref<number>(0)
let   countdownTimer: ReturnType<typeof setInterval> | null = null

const fieldErrors = ref({ username: '', email: '', newPassword: '', confirmPassword: '' })
const fieldValid  = ref({ username: false, email: false })
const confirmOk   = ref<boolean>(false)

const codeDigits = ref<string[]>(['', '', '', '', '', ''])
const codeRefs   = ref<HTMLInputElement[]>([])
const codeStr    = computed<string>(() => codeDigits.value.join(''))

const validateUsername = (): void => {
  if (!username.value.trim()) { fieldErrors.value.username = '请输入用户名'; fieldValid.value.username = false }
  else { fieldErrors.value.username = ''; fieldValid.value.username = true }
}
const validateEmail = (): void => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email.value.trim()) { fieldErrors.value.email = '请输入绑定邮箱'; fieldValid.value.email = false }
  else if (!re.test(email.value.trim())) { fieldErrors.value.email = '邮箱格式不正确'; fieldValid.value.email = false }
  else { fieldErrors.value.email = ''; fieldValid.value.email = true }
}
const checkConfirm = (): void => {
  if (confirmPassword.value && confirmPassword.value === newPassword.value) {
    fieldErrors.value.confirmPassword = ''; confirmOk.value = true
  } else if (confirmPassword.value) {
    fieldErrors.value.confirmPassword = '两次密码不一致'; confirmOk.value = false
  }
}

const pwdStrength = computed<number>(() => {
  const p = newPassword.value
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
  const map = [{ text: '', cls: '' }, { text: '弱', cls: 'weak' }, { text: '一般', cls: 'fair' }, { text: '良好', cls: 'good' }, { text: '强', cls: 'strong' }]
  return map[pwdStrength.value] ?? map[0]
})
const strengthBarClass = (n: number): string => {
  if (n > pwdStrength.value) return ''
  return ['', 'weak', 'fair', 'good', 'strong'][pwdStrength.value] || ''
}

const shake = (): void => { isShaking.value = true; setTimeout(() => { isShaking.value = false }, 500) }
const setError = (msg: string): void => { errorMsg.value = msg; shake(); setTimeout(() => { errorMsg.value = '' }, 4000) }
const startCountdown = (seconds = 60): void => {
  countdown.value = seconds
  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0 && countdownTimer) clearInterval(countdownTimer)
  }, 1000)
}
onUnmounted(() => { if (countdownTimer) clearInterval(countdownTimer) })

const handleCheckAccount = async (): Promise<void> => {
  validateUsername(); validateEmail()
  if (fieldErrors.value.username || fieldErrors.value.email) { shake(); return }
  loading.value = true
  try {
    await checkAccount({ username: username.value.trim(), email: email.value.trim() })
    const parts = email.value.trim().split('@')
    maskedEmail.value = (parts[0]?.[0] ?? '') + '***@' + (parts[1] ?? '')
    currentStep.value = 1
  } catch (e) { setError((e as Error).message) }
  finally { loading.value = false }
}

const handleSendCode = async (): Promise<void> => {
  loading.value = true
  try {
    await sendVerifyCode({ email: email.value.trim() })
    currentStep.value = 2
    startCountdown(60)
  } catch (e) { setError((e as Error).message) }
  finally { loading.value = false }
}

const onCodeInput = (idx: number): void => {
  const val = codeDigits.value[idx]
  if (val && idx < 5) codeRefs.value[idx + 1]?.focus()
}
const onCodeBackspace = (idx: number): void => {
  if (!codeDigits.value[idx] && idx > 0) {
    codeDigits.value[idx - 1] = ''
    codeRefs.value[idx - 1]?.focus()
  }
}
const onCodePaste = (e: ClipboardEvent): void => {
  const text = (e.clipboardData?.getData('text') ?? '').replace(/\D/g, '').slice(0, 6)
  text.split('').forEach((ch, i) => { codeDigits.value[i] = ch })
  codeRefs.value[Math.min(text.length, 5)]?.focus()
}

const handleVerifyCode = async (): Promise<void> => {
  if (codeStr.value.length < 6) return setError('请输入完整的 6 位验证码')
  loading.value = true
  try {
    const res = await verifyCode({ email: email.value.trim(), code: codeStr.value })
    const token = res.data
    authUtil.setResetToken(token)
    currentStep.value = 3
  } catch (e) {
    setError((e as Error).message)
    codeDigits.value = ['', '', '', '', '', '']
    codeRefs.value[0]?.focus()
  } finally { loading.value = false }
}

const handleResetPassword = async (): Promise<void> => {
  if (!newPassword.value)           return setError('请输入新密码')
  if (newPassword.value.length < 6) return setError('密码长度不能少于 6 位')
  if (newPassword.value !== confirmPassword.value) return setError('两次密码输入不一致')
  const resetToken = authUtil.getResetToken()
  if (!resetToken) return setError('重置令牌已失效，请重新验证')
  loading.value = true
  try {
    await resetPassword({ token: resetToken, newPassword: newPassword.value, confirmPassword: confirmPassword.value })
    currentStep.value = 4
    authUtil.removeResetToken()
    startCountdown(5)
    setTimeout(() => router.push({ name: 'Login' }), 5000)
  } catch (e) { setError((e as Error).message) }
  finally { loading.value = false }
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
.recovery-container { position: relative; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #060818; overflow: hidden; }
.bg-mesh { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px); background-size: 60px 60px; }
.orb { position: absolute; border-radius: 50%; filter: blur(80px); animation: orbFloat ease-in-out infinite; }
.orb-1 { width: 500px; height: 500px; background: radial-gradient(circle, rgba(0,112,243,0.35), transparent 70%); top: -100px; left: -100px; animation-duration: 14s; }
.orb-2 { width: 400px; height: 400px; background: radial-gradient(circle, rgba(121,40,202,0.3), transparent 70%); bottom: -80px; right: -80px; animation-duration: 18s; animation-delay: -4s; }
.orb-3 { width: 300px; height: 300px; background: radial-gradient(circle, rgba(0,200,200,0.2), transparent 70%); top: 50%; left: 60%; animation-duration: 22s; animation-delay: -8s; }
@keyframes orbFloat { 0%, 100% { transform: translate(0, 0) scale(1); } 33% { transform: translate(30px, -30px) scale(1.05); } 66% { transform: translate(-20px, 20px) scale(0.95); } }
.bg-particles { position: absolute; inset: 0; pointer-events: none; }
.particle { position: absolute; background: rgba(255,255,255,0.7); border-radius: 50%; animation: floatUp linear infinite; filter: blur(0.5px); }
@keyframes floatUp { 0% { transform: translateY(0) translateX(0); opacity: 0; } 10% { opacity: 0.4; } 90% { opacity: 0.2; } 100% { transform: translateY(-100vh) translateX(15px); opacity: 0; } }
.recovery-card {
  position: relative; width: 440px; padding: 44px 42px 36px; background: rgba(255,255,255,0.055);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-radius: 28px; border: 1px solid rgba(255,255,255,0.12);
  box-shadow: 0 0 0 1px rgba(255,255,255,0.05), 0 30px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1); z-index: 10; transition: box-shadow 0.3s ease;
  &:hover { box-shadow: 0 0 0 1px rgba(255,255,255,0.08), 0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.15); }
  &.shaking { animation: shake 0.45s ease; }
}
@keyframes shake { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-8px); } 40% { transform: translateX(8px); } 60% { transform: translateX(-5px); } 80% { transform: translateX(5px); } }
.brand-area { display: flex; align-items: center; gap: 14px; margin-bottom: 28px; }
.brand-logo svg { width: 48px; height: 48px; border-radius: 14px; filter: drop-shadow(0 4px 12px rgba(0,112,243,0.4)); }
.brand-name { font-size: 20px; font-weight: 700; margin: 0 0 3px; background: linear-gradient(135deg, #fff 30%, #88bbff); -webkit-background-clip: text; background-clip: text; color: transparent; letter-spacing: 0.5px; }
.brand-slogan { font-size: 12px; color: rgba(255,255,255,0.45); margin: 0; letter-spacing: 0.3px; }
.step-bar { position: relative; display: flex; justify-content: space-between; margin-bottom: 28px; padding: 0 4px; }
.step-line { position: absolute; top: 14px; left: 24px; right: 24px; height: 2px; background: rgba(255,255,255,0.1); border-radius: 2px; z-index: 0; overflow: hidden; }
.step-line-fill { height: 100%; background: linear-gradient(90deg, #0070f3, #7928ca); transition: width 0.5s ease; border-radius: 2px; }
.step-item { display: flex; flex-direction: column; align-items: center; gap: 6px; z-index: 1; }
.step-dot { width: 28px; height: 28px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.4); transition: all 0.3s ease; svg { width: 13px; height: 13px; } }
.step-label { font-size: 11px; color: rgba(255,255,255,0.35); white-space: nowrap; transition: color 0.3s; }
.step-item.active .step-dot { border-color: #0070f3; background: rgba(0,112,243,0.2); color: #55aaff; box-shadow: 0 0 10px rgba(0,112,243,0.45); }
.step-item.active .step-label { color: #55aaff; font-weight: 600; }
.step-item.done .step-dot { border-color: #06d6a0; background: rgba(6,214,160,0.2); color: #06d6a0; box-shadow: 0 0 8px rgba(6,214,160,0.3); }
.step-item.done .step-label { color: #06d6a0; }
.slide-fade-enter-active, .slide-fade-leave-active { transition: all 0.3s ease; }
.slide-fade-enter-from { opacity: 0; transform: translateX(24px); }
.slide-fade-leave-to   { opacity: 0; transform: translateX(-24px); }
.fade-enter-active, .fade-leave-active { transition: all 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-6px); }
.step-content { min-height: 120px; }
.field-wrap {
  position: relative; display: flex; align-items: center; height: 56px; background: rgba(255,255,255,0.07); border: 1.5px solid rgba(255,255,255,0.12); border-radius: 14px; transition: border-color 0.25s ease, background 0.25s ease, box-shadow 0.25s ease; margin-bottom: 20px;
  &:focus-within { border-color: rgba(0,170,255,0.7); background: rgba(0,170,255,0.06); box-shadow: 0 0 0 3px rgba(0,170,255,0.15); }
  &.has-error { border-color: rgba(255,107,107,0.7); box-shadow: 0 0 0 3px rgba(255,107,107,0.12); margin-bottom: 4px; }
  &.is-valid  { border-color: rgba(6,214,160,0.55); }
}
.field-icon { width: 44px; display: flex; justify-content: center; align-items: center; flex-shrink: 0; svg { width: 18px; height: 18px; color: rgba(255,255,255,0.35); transition: color 0.2s; } }
.field-wrap:focus-within .field-icon svg { color: rgba(0,170,255,0.7); }
.field-input { flex: 1; height: 100%; padding: 18px 8px 4px; background: none; border: none; outline: none; font-size: 15px; color: #fff; line-height: 1; &::placeholder { color: transparent; } }
.field-label { position: absolute; left: 44px; top: 50%; transform: translateY(-50%); font-size: 14px; color: rgba(255,255,255,0.4); pointer-events: none; transition: top 0.2s ease, font-size 0.2s ease, color 0.2s ease, transform 0.2s ease; line-height: 1; }
.field-input:focus ~ .field-label, .field-input:not(:placeholder-shown) ~ .field-label { top: 10px; transform: none; font-size: 11px; color: #55ccff; letter-spacing: 0.3px; }
.field-status { width: 38px; display: flex; justify-content: center; align-items: center; flex-shrink: 0; }
.icon-ok { width: 16px; height: 16px; color: #06d6a0; animation: popIn 0.2s ease; }
@keyframes popIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.pwd-eye { width: 38px; height: 100%; background: none; border: none; cursor: pointer; color: rgba(255,255,255,0.4); padding: 0; display: flex; align-items: center; justify-content: center; flex-shrink: 0; svg { width: 17px; height: 17px; } &:hover { color: rgba(255,255,255,0.85); } }
.field-err { font-size: 12px; color: #ff7e7e; margin: 0 0 16px 6px; animation: fadeSlideIn 0.2s ease; line-height: 1.4; }
@keyframes fadeSlideIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
.pwd-strength-wrap { display: flex; align-items: center; gap: 10px; margin: -16px 0 16px; }
.strength-bars { display: flex; gap: 5px; }
.bar { width: 36px; height: 4px; background: rgba(255,255,255,0.1); border-radius: 4px; transition: background 0.3s ease; &.weak { background: #ff6b6b; } &.fair { background: #ffd166; } &.good { background: #06d6a0; } &.strong { background: #0070f3; } }
.strength-label { font-size: 12px; &.weak { color: #ff6b6b; } &.fair { color: #ffd166; } &.good { color: #06d6a0; } &.strong { color: #55aaff; } }
.info-banner { display: flex; align-items: center; gap: 10px; background: rgba(0,112,243,0.1); border: 1px solid rgba(0,112,243,0.3); border-radius: 14px; padding: 12px 16px; color: rgba(255,255,255,0.85); font-size: 14px; margin-bottom: 16px; svg { width: 20px; height: 20px; flex-shrink: 0; color: #55aaff; } strong { color: #88ccff; } }
.mock-notice { display: flex; align-items: center; gap: 8px; font-size: 12px; color: rgba(255,200,100,0.85); background: rgba(255,200,0,0.08); border: 1px solid rgba(255,200,0,0.2); border-radius: 10px; padding: 8px 12px; margin-bottom: 20px; svg { width: 14px; height: 14px; flex-shrink: 0; color: #ffd166; } strong { color: #ffd166; } }
.code-hint { font-size: 13px; color: rgba(255,255,255,0.5); text-align: center; margin: 0 0 16px; }
.code-input-row { display: flex; gap: 10px; justify-content: center; margin-bottom: 24px; }
.code-cell { width: 46px; height: 54px; background: rgba(255,255,255,0.07); border: 1.5px solid rgba(255,255,255,0.12); border-radius: 14px; color: #fff; font-size: 22px; font-weight: 700; text-align: center; outline: none; transition: all 0.2s ease; &:focus { border-color: rgba(0,112,243,0.7); box-shadow: 0 0 0 3px rgba(0,112,243,0.2); background: rgba(0,112,243,0.08); } &:not(:placeholder-shown) { border-color: rgba(6,214,160,0.5); } }
.global-error { display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: rgba(255,80,80,0.12); border: 1px solid rgba(255,80,80,0.3); border-radius: 12px; color: #ff8080; font-size: 13px; margin-top: 8px; svg { width: 16px; height: 16px; flex-shrink: 0; } }
.primary-btn {
  width: 100%; padding: 15px 0; border: none; border-radius: 40px; background: linear-gradient(135deg, #0070f3, #7928ca);
  color: #fff; font-size: 16px; font-weight: 700; cursor: pointer; position: relative; overflow: hidden; transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0,112,243,0.4); letter-spacing: 1px; display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 12px;
  &::after { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent); opacity: 0; transition: opacity 0.3s; }
  &:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,112,243,0.6); &::after { opacity: 1; } }
  &:active:not(:disabled) { transform: translateY(1px); }
  &:disabled { opacity: 0.55; cursor: not-allowed; }
}
.btn-inner { display: flex; align-items: center; gap: 8px; svg { width: 17px; height: 17px; } }
.btn-loader { width: 20px; height: 20px; border: 2.5px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.ghost-btn { width: 100%; padding: 12px 0; background: transparent; border: 1.5px solid rgba(255,255,255,0.15); border-radius: 40px; font-size: 14px; color: rgba(255,255,255,0.55); cursor: pointer; transition: all 0.25s ease; margin-bottom: 12px; display: flex; align-items: center; justify-content: center; gap: 6px; svg { width: 16px; height: 16px; } &:hover { border-color: rgba(255,255,255,0.4); color: rgba(255,255,255,0.9); background: rgba(255,255,255,0.06); } }
.success-state { display: flex; flex-direction: column; align-items: center; padding: 12px 0; text-align: center; }
.success-circle { width: 80px; height: 80px; margin-bottom: 20px; svg { width: 100%; height: 100%; } }
.s-circle { stroke: #0070f3; stroke-width: 2; stroke-dasharray: 166; stroke-dashoffset: 166; animation: drawCircle 0.8s ease forwards; }
.s-check  { stroke: #06d6a0; stroke-width: 2.5; stroke-dasharray: 48; stroke-dashoffset: 48; animation: drawCheck 0.5s 0.6s ease forwards; }
@keyframes drawCircle { to { stroke-dashoffset: 0; } }
@keyframes drawCheck  { to { stroke-dashoffset: 0; } }
.success-title { font-size: 24px; font-weight: 700; color: #06d6a0; margin: 0 0 10px; }
.success-hint  { font-size: 14px; color: rgba(255,255,255,0.65); margin: 0 0 6px; }
.success-count { font-size: 12px; color: rgba(255,255,255,0.35); margin: 0 0 24px; }
.back-link { text-align: center; margin-top: 18px; span { display: inline-flex; align-items: center; gap: 4px; font-size: 13px; color: rgba(255,255,255,0.45); cursor: pointer; transition: color 0.2s; svg { width: 14px; height: 14px; } &:hover { color: #88ccff; } } }
.auth-footer { margin-top: 20px; }
.footer-divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent); margin-bottom: 12px; }
.footer-content { display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 11px; color: rgba(255,255,255,0.35); }
.shield-icon { width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; svg { width: 100%; height: 100%; } }
@media (max-width: 500px) {
  .recovery-card { width: 88%; padding: 32px 22px 24px; }
  .brand-name { font-size: 18px; }
  .code-cell { width: 38px; height: 46px; font-size: 18px; }
  .step-label { font-size: 10px; }
}
</style>
