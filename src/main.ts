import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import router from './router'
import './scss/main.scss'
import App from './App.vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

/**
 * 静默 ResizeObserver 良性循环警告
 * -----------------------------------------------------------------------------
 * 浏览器原生 ResizeObserver 在"同一帧内尺寸发生多次变化导致回调未能全部派发"时，
 * 会抛出 "ResizeObserver loop completed with undelivered notifications." /
 * "ResizeObserver loop limit exceeded."。这两条信息只是浏览器告诉你"我把
 * 剩余通知推迟到下一帧"，并非真正的错误，Element Plus 的 el-table / el-dialog /
 * el-image-viewer 等组件在尺寸自适应时会高频触发。
 *
 * 之所以在入口处拦截而不是在某个组件里就地处理：
 *   1. 该警告与具体业务无关，是全局基础设施层问题；
 *   2. Vite/HMR overlay 会把这类 window.error 当作真错误高亮展示，干扰开发体验；
 *   3. 仅匹配这一条消息文本，其它 ResizeObserver 相关报错仍会正常冒泡。
 *
 * 参考：https://github.com/element-plus/element-plus/issues/8835
 */
const RESIZE_OBSERVER_ERR_PATTERNS = [
  'ResizeObserver loop completed with undelivered notifications.',
  'ResizeObserver loop limit exceeded'
]

/** 判断错误消息是否属于 ResizeObserver 良性循环 */
function isResizeObserverLoopError(message: unknown): boolean {
  if (typeof message !== 'string') return false
  return RESIZE_OBSERVER_ERR_PATTERNS.some((p) => message.includes(p))
}

/*
 * 必须在「捕获阶段」拦截：Vite/HMR overlay 也是通过 window.error 监听获取
 * 错误信息的，如果只在冒泡阶段处理，overlay 仍会先看到这条警告并弹窗。
 * 设置 { capture: true } 让我们的处理函数最先执行，再 stopImmediatePropagation
 * 阻止后续监听器（包括 overlay）收到事件。
 */
window.addEventListener(
  'error',
  (event: ErrorEvent) => {
    if (isResizeObserverLoopError(event.message)) {
      event.stopImmediatePropagation()
      event.preventDefault()
    }
  },
  { capture: true }
)

window.addEventListener(
  'unhandledrejection',
  (event: PromiseRejectionEvent) => {
    const reason = event.reason
    const msg = reason instanceof Error ? reason.message : String(reason)
    if (isResizeObserverLoopError(msg)) {
      event.stopImmediatePropagation()
      event.preventDefault()
    }
  },
  { capture: true }
)

/*
 * 兜底：部分浏览器（Chrome 81+）会以 console.error 形式输出该警告，
 * 而非走 window.error；包装一次原生 console.error 把这一条吞掉，其余日志
 * 完全保持原行为，便于其它真实错误依旧可见。
 */
const originalConsoleError = console.error.bind(console)
console.error = (...args: unknown[]) => {
  if (args.length > 0 && isResizeObserverLoopError(args[0])) return
  originalConsoleError(...args)
}

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus, { locale: zhCn })

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.mount('#app')
