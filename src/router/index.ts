// ============================================
// Router Configuration
// Company OA ERP - Industrial Theme
// 重构：路由模块化，按业务域拆分到 modules/
// ============================================

import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { authUtil } from '@/utils/auth'
import { permissionUtil, type UserRole } from '@/types/auth'

// ── 路由模块 ──────────────────────────────────
import businessRoutes from './modules/business'
import tradingRoutes from './modules/trading'
import approvalRoutes from './modules/approval'
import reportRoutes from './modules/reports'
import analyticsRoutes from './modules/analytics'
import systemRoutes from './modules/system'

// ============================================
// Page Components (Lazy-loaded)
// ============================================

const Login = () => import('@/views/auth/Login.vue')
const Register = () => import('@/views/auth/Register.vue')
const Forbidden = () => import('@/views/auth/Forbidden.vue')
const NotFound = () => import('@/views/NotFound.vue')
const TagsView = () => import('@/components/TagsView.vue')
const Home = () => import('@/views/Home.vue')

// ============================================
// Public Routes (No Authentication Required)
// ============================================

const publicRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { title: '登录', requiresAuth: false, layout: 'blank' }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { title: '注册', requiresAuth: false, layout: 'blank' }
  },
  {
    path: '/forbidden',
    name: 'Forbidden',
    component: Forbidden,
    meta: { title: '无权限访问', requiresAuth: false, layout: 'blank' }
  }
]

// ============================================
// Protected Routes (Authentication Required)
// ============================================

const protectedRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    component: TagsView,
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      // Dashboard - 工作台
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Home,
        meta: { title: '工作台', icon: 'Odometer', requiresAuth: true }
      },
      // 核心业务模块（塑业生产模式）
      ...businessRoutes,
      // 贸易业务模块（化工贸易模式）
      ...tradingRoutes,
      // 审批流程模块
      ...approvalRoutes,
      // 数据报表模块
      ...reportRoutes,
      // 经营分析模块
      ...analyticsRoutes,
      // 系统管理模块
      ...systemRoutes
    ]
  }
]

// ============================================
// Error Routes
// ============================================

const errorRoutes: RouteRecordRaw[] = [
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: { title: '404 - 页面不存在', layout: 'blank' }
  }
]

// ============================================
// Router Instance
// ============================================

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...publicRoutes, ...protectedRoutes, ...errorRoutes],
  scrollBehavior: () => ({ top: 0 })
})

// ============================================
// Navigation Guards
// ============================================

router.beforeEach((to, _from, next) => {
  const title = to.meta.title as string | undefined
  document.title = title ? `${title} | Company ERP` : 'Company ERP'

  const requiresAuth = to.meta.requiresAuth as boolean | undefined

  // 检查是否需要登录
  if (requiresAuth && !authUtil.isLogin()) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  // 已登录但访问登录页，重定向到首页
  if (!requiresAuth && authUtil.isLogin() && to.name === 'Login') {
    next({ name: 'Dashboard' })
    return
  }

  // 检查角色权限
  const requiredRole = to.meta.requiredRole as UserRole | undefined
  if (requiredRole && authUtil.isLogin()) {
    const userInfo = authUtil.getUserInfo()
    if (userInfo && !permissionUtil.hasRole(userInfo.role as UserRole, requiredRole)) {
      next({ name: 'Forbidden' })
      return
    }
  }

  next()
})

export default router
