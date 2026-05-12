// ============================================
// 系统管理路由模块
// Company OA ERP - System Routes
// ============================================

import type { RouteRecordRaw } from 'vue-router'

const systemRoutes: RouteRecordRaw[] = [
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
        component: () => import('@/views/system/UserManagement.vue'),
        meta: { title: '用户管理', icon: 'User', requiresAuth: true }
      },
      {
        path: 'roles',
        name: 'RoleManagement',
        component: () => import('@/views/system/RoleManagement.vue'),
        meta: { title: '角色管理', icon: 'Key', requiresAuth: true }
      },
      {
        path: 'menus',
        name: 'MenuManagement',
        component: () => import('@/views/system/MenuManagement.vue'),
        meta: { title: '菜单管理', icon: 'Menu', requiresAuth: true }
      },
      {
        path: 'backup',
        name: 'DataBackup',
        component: () => import('@/views/system/DataBackup.vue'),
        meta: { title: '数据备份', icon: 'Folder', requiresAuth: true }
      }
    ]
  }
]

export default systemRoutes
