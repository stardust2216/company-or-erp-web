// ============================================
// Router Configuration
// Company OA ERP - Industrial Theme
// ============================================

import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { authUtil } from '@/utils/auth'

// ============================================
// Route Definitions
// ============================================

// Page Components (Lazy-loaded)
const Login = () => import('@/views/auth/Login.vue')
const Register = () => import('@/views/auth/Register.vue')
const ForgotPassword = () => import('@/views/auth/ForgotPassword.vue')
const NotFound = () => import('@/views/NotFound.vue')
const TagsView = () => import('@/components/TagsView.vue')

// Dashboard
const Home = () => import('@/views/Home.vue')

// Business Module
const Orders = () => import('@/views/business/Orders.vue')
const OrderDetail = () => import('@/views/business/OrderDetail.vue')
const Customers = () => import('@/views/business/Customers.vue')
const Inventory = () => import('@/views/business/Inventory.vue')
const Production = () => import('@/views/business/Production.vue')

// Approval Module
const ApprovalPending = () => import('@/views/approval/Pending.vue')
const ApprovalDone = () => import('@/views/approval/Done.vue')
const ApprovalMyApply = () => import('@/views/approval/MyApply.vue')
const ApprovalStart = () => import('@/views/approval/Start.vue')

// Reports Module
const OutputReport = () => import('@/views/reports/OutputReport.vue')
const DeptReport = () => import('@/views/reports/DeptReport.vue')
const CompanyReport = () => import('@/views/reports/CompanyReport.vue')

// System Module
const UserManagement = () => import('@/views/system/UserManagement.vue')
const RoleManagement = () => import('@/views/system/RoleManagement.vue')
const MenuManagement = () => import('@/views/system/MenuManagement.vue')
const DataBackup = () => import('@/views/system/DataBackup.vue')

// ============================================
// Public Routes (No Authentication Required)
// ============================================

const publicRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      title: '登录',
      requiresAuth: false,
      layout: 'blank'
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: {
      title: '注册',
      requiresAuth: false,
      layout: 'blank'
    }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPassword,
    meta: {
      title: '找回密码',
      requiresAuth: false,
      layout: 'blank'
    }
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
        meta: {
          title: '工作台',
          icon: 'Odometer',
          requiresAuth: true
        }
      },
      
      // Business - 核心业务
      {
        path: 'business',
        name: 'Business',
        redirect: '/business/orders',
        meta: {
          title: '核心业务',
          icon: 'ShoppingCart',
          requiresAuth: true
        },
        children: [
          {
            path: 'orders',
            name: 'Orders',
            component: Orders,
            meta: { title: '订单管理', icon: 'Document', requiresAuth: true }
          },
          {
            path: 'orders/:id',
            name: 'OrderDetail',
            component: OrderDetail,
            meta: { title: '订单详情', requiresAuth: true, hidden: true }
          },
          {
            path: 'customers',
            name: 'Customers',
            component: Customers,
            meta: { title: '客户管理', icon: 'UserFilled', requiresAuth: true }
          },
          {
            path: 'inventory',
            name: 'Inventory',
            component: Inventory,
            meta: { title: '库存管理', icon: 'Box', requiresAuth: true }
          },
          {
            path: 'production',
            name: 'Production',
            component: Production,
            meta: { title: '生产计划', icon: 'Briefcase', requiresAuth: true }
          }
        ]
      },
      
      // Approval - 审批流程
      {
        path: 'approval',
        name: 'Approval',
        redirect: '/approval/pending',
        meta: {
          title: '审批流程',
          icon: 'Document',
          requiresAuth: true
        },
        children: [
          {
            path: 'pending',
            name: 'ApprovalPending',
            component: ApprovalPending,
            meta: { title: '待办事项', icon: 'Clock', requiresAuth: true }
          },
          {
            path: 'done',
            name: 'ApprovalDone',
            component: ApprovalDone,
            meta: { title: '已办事项', icon: 'CircleCheck', requiresAuth: true }
          },
          {
            path: 'my-apply',
            name: 'ApprovalMyApply',
            component: ApprovalMyApply,
            meta: { title: '我的申请', icon: 'List', requiresAuth: true }
          },
          {
            path: 'start',
            name: 'ApprovalStart',
            component: ApprovalStart,
            meta: { title: '发起申请', icon: 'Edit', requiresAuth: true }
          }
        ]
      },
      
      // Reports - 数据报表
      {
        path: 'reports',
        name: 'Reports',
        redirect: '/reports/output',
        meta: {
          title: '数据报表',
          icon: 'DataLine',
          requiresAuth: true
        },
        children: [
          {
            path: 'output',
            name: 'OutputReport',
            component: OutputReport,
            meta: { title: '产量产值报表', icon: 'DataLine', requiresAuth: true }
          },
          {
            path: 'department',
            name: 'DeptReport',
            component: DeptReport,
            meta: { title: '部门订单报表', icon: 'Box', requiresAuth: true }
          },
          {
            path: 'company',
            name: 'CompanyReport',
            component: CompanyReport,
            meta: { title: '全公司报表', icon: 'Coin', requiresAuth: true }
          }
        ]
      },
      
      // System - 系统管理
      {
        path: 'system',
        name: 'System',
        redirect: '/system/users',
        meta: {
          title: '系统管理',
          icon: 'Setting',
          requiresAuth: true
        },
        children: [
          {
            path: 'users',
            name: 'UserManagement',
            component: UserManagement,
            meta: { title: '用户管理', icon: 'User', requiresAuth: true }
          },
          {
            path: 'roles',
            name: 'RoleManagement',
            component: RoleManagement,
            meta: { title: '角色管理', icon: 'Key', requiresAuth: true }
          },
          {
            path: 'menus',
            name: 'MenuManagement',
            component: MenuManagement,
            meta: { title: '菜单管理', icon: 'Menu', requiresAuth: true }
          },
          {
            path: 'backup',
            name: 'DataBackup',
            component: DataBackup,
            meta: { title: '数据备份', icon: 'Folder', requiresAuth: true }
          }
        ]
      }
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
    meta: {
      title: '404 - 页面不存在',
      layout: 'blank'
    }
  }
]

// ============================================
// Router Instance
// ============================================

const routes: RouteRecordRaw[] = [
  ...publicRoutes,
  ...protectedRoutes,
  ...errorRoutes
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

// ============================================
// Navigation Guards
// ============================================

router.beforeEach((to, _from, next) => {
  // Update document title
  const title = to.meta.title as string | undefined
  document.title = title ? `${title} | Company OA` : 'Company OA'
  
  // Check if route requires authentication
  const requiresAuth = to.meta.requiresAuth as boolean | undefined
  
  if (requiresAuth && !authUtil.isLogin()) {
    // Redirect to login with return URL
    next({
      name: 'Login',
      query: { redirect: to.fullPath }
    })
  } else if (!requiresAuth && authUtil.isLogin() && to.name === 'Login') {
    // Already logged in, redirect to dashboard
    next({ name: 'Dashboard' })
  } else {
    next()
  }
})

export default router
