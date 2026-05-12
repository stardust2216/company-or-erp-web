// ============================================
// 经营分析路由模块
// Company OA ERP - Analytics Routes
// ============================================

import type { RouteRecordRaw } from 'vue-router'

const analyticsRoutes: RouteRecordRaw[] = [
  {
    path: 'analytics',
    name: 'Analytics',
    redirect: '/analytics/overview',
    meta: {
      title: '经营分析',
      icon: 'TrendCharts',
      requiresAuth: true,
      // 仅主管及以上可见
      requiredRole: 'manager'
    },
    children: [
      {
        path: 'overview',
        name: 'AnalyticsOverview',
        component: () => import('@/views/analytics/Overview.vue'),
        meta: { 
          title: '经营概览', 
          icon: 'DataLine', 
          requiresAuth: true,
          requiredRole: 'manager'
        }
      },
      {
        path: 'production',
        name: 'ProductionAnalysis',
        component: () => import('@/views/analytics/ProductionAnalysis.vue'),
        meta: { 
          title: '产量分析', 
          icon: 'Histogram', 
          requiresAuth: true,
          requiredRole: 'manager'
        }
      },
      {
        path: 'inventory',
        name: 'InventoryAnalysis',
        component: () => import('@/views/analytics/InventoryAnalysis.vue'),
        meta: { 
          title: '库存分析', 
          icon: 'PieChart', 
          requiresAuth: true,
          requiredRole: 'manager'
        }
      },
      {
        path: 'profit',
        name: 'ProfitAnalysis',
        component: () => import('@/views/analytics/ProfitAnalysis.vue'),
        meta: { 
          title: '利润分析', 
          icon: 'Coin', 
          requiresAuth: true,
          requiredRole: 'director'
        }
      },
      {
        path: 'comparison',
        name: 'SubsidiaryComparison',
        component: () => import('@/views/analytics/SubsidiaryComparison.vue'),
        meta: { 
          title: '子公司对比', 
          icon: 'ScaleToOriginal', 
          requiresAuth: true,
          requiredRole: 'director'
        }
      }
    ]
  }
]

export default analyticsRoutes
