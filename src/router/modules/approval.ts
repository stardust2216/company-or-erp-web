// ============================================
// 审批流程路由模块
// Company OA ERP - Approval Routes
// ============================================

import type { RouteRecordRaw } from 'vue-router'

const approvalRoutes: RouteRecordRaw[] = [
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
        component: () => import('@/views/approval/Pending.vue'),
        meta: { title: '待办事项', icon: 'Clock', requiresAuth: true }
      },
      {
        path: 'done',
        name: 'ApprovalDone',
        component: () => import('@/views/approval/Done.vue'),
        meta: { title: '已办事项', icon: 'CircleCheck', requiresAuth: true }
      },
      {
        path: 'my-apply',
        name: 'ApprovalMyApply',
        component: () => import('@/views/approval/MyApply.vue'),
        meta: { title: '我的申请', icon: 'List', requiresAuth: true }
      },
      {
        path: 'start',
        name: 'ApprovalStart',
        component: () => import('@/views/approval/Start.vue'),
        meta: { title: '发起申请', icon: 'Edit', requiresAuth: true }
      }
    ]
  }
]

export default approvalRoutes
