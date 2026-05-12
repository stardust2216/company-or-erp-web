// ============================================
// 贸易业务路由模块
// Company OA ERP - Trading Routes (化工贸易模式)
// ============================================

import type { RouteRecordRaw } from 'vue-router'

const tradingRoutes: RouteRecordRaw[] = [
  {
    path: 'trading',
    name: 'Trading',
    redirect: '/trading/procurement/contracts',
    meta: {
      title: '贸易业务',
      icon: 'ShoppingBag',
      requiresAuth: true,
      // 贸易模块仅对化工类子公司可见
      businessType: 'trading'
    },
    children: [
      {
        path: 'procurement',
        name: 'Procurement',
        redirect: '/trading/procurement/contracts',
        meta: { title: '采购管理', icon: 'ShoppingCart', requiresAuth: true },
        children: [
          {
            path: 'contracts',
            name: 'PurchaseContracts',
            component: () => import('@/views/trading/procurement/Contract.vue'),
            meta: { title: '采购合同', icon: 'Document', requiresAuth: true }
          },
          {
            path: 'inbound',
            name: 'PurchaseInbound',
            component: () => import('@/views/trading/procurement/Inbound.vue'),
            meta: { title: '入库明细', icon: 'Box', requiresAuth: true }
          },
          {
            path: 'suppliers',
            name: 'Suppliers',
            component: () => import('@/views/trading/procurement/Supplier.vue'),
            meta: { title: '供应商管理', icon: 'UserFilled', requiresAuth: true }
          }
        ]
      },
      {
        path: 'sales',
        name: 'Sales',
        redirect: '/trading/sales/contracts',
        meta: { title: '销售管理', icon: 'Sell', requiresAuth: true },
        children: [
          {
            path: 'contracts',
            name: 'SalesContracts',
            component: () => import('@/views/trading/sales/Contract.vue'),
            meta: { title: '销售合同', icon: 'DocumentChecked', requiresAuth: true }
          },
          {
            path: 'outbound',
            name: 'SalesOutbound',
            component: () => import('@/views/trading/sales/Outbound.vue'),
            meta: { title: '出库明细', icon: 'Truck', requiresAuth: true }
          },
          {
            path: 'customers',
            name: 'TradingCustomers',
            component: () => import('@/views/trading/sales/Customer.vue'),
            meta: { title: '客户管理', icon: 'User', requiresAuth: true }
          }
        ]
      }
    ]
  }
]

export default tradingRoutes
