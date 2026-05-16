// ============================================
// 核心业务路由模块
// Company OA ERP - Business Routes
// 结构：4大子公司订单 + 客户管理 + 库存管理
// ============================================

import type { RouteRecordRaw } from 'vue-router'

const businessRoutes: RouteRecordRaw[] = [
  {
    path: 'business',
    name: 'Business',
    redirect: '/business/yahui/orders',
    meta: { title: '核心业务', icon: 'Grid', requiresAuth: true },
    children: [

      // ══════════════════════════════════════════
// 🏭 亚辉塑业（编织袋/集装袋）
// ══════════════════════════════════════════
{
  path: 'yahui',
  name: 'Yahui',
  redirect: '/business/yahui/orders',
  meta: { title: '亚辉塑业', icon: 'OfficeBuilding', requiresAuth: true, subsidiary: 'yahui' },
  children: [
    {
      path: 'orders',
      name: 'YahuiOrderList',
      component: () => import('@/views/business/yahui/OrderList.vue'),
      meta: { title: '订单列表', icon: 'Document', requiresAuth: true }
    },
    {
      path: 'production-plan',
      name: 'YahuiProductionPlan',
      component: () => import('@/views/business/yahui/ProductionPlan.vue'),
      meta: { title: '生产计划单', icon: 'SetUp', requiresAuth: true }
    },
    {
      path: 'order-stats',
      name: 'YahuiOrderStats',
      component: () => import('@/views/business/yahui/OrderStats.vue'),
      meta: { title: '订单统计', icon: 'DataLine', requiresAuth: true }
    }
  ]
},

      // ══════════════════════════════════════════
      // 🏭 龙州塑业（糖袋）
      // ══════════════════════════════════════════
      {
        path: 'longzhou',
        name: 'Longzhou',
        redirect: '/business/longzhou/orders',
        meta: { title: '龙州塑业', icon: 'OfficeBuilding', requiresAuth: true, subsidiary: 'longzhou' },
        children: [
          {
            path: 'orders',
            name: 'LongzhouOrderList',
            component: () => import('@/views/business/longzhou/OrderList.vue'),
            meta: { title: '订单列表', icon: 'Document', requiresAuth: true }
          },
          {
            path: 'orders/:id',
            name: 'LongzhouOrderDetail',
            component: () => import('@/views/business/longzhou/OrderDetail.vue'),
            meta: { title: '订单详情', requiresAuth: true, hidden: true }
          },
          {
            path: 'production-plan',
            name: 'LongzhouProductionPlan',
            component: () => import('@/views/business/longzhou/ProductionPlan.vue'),
            meta: { title: '生产计划单', icon: 'SetUp', requiresAuth: true }
          },
          {
            path: 'order-stats',
            name: 'LongzhouOrderStats',
            component: () => import('@/views/business/longzhou/OrderStats.vue'),
            meta: { title: '订单统计', icon: 'DataLine', requiresAuth: true }
          }
        ]
      },

      // ══════════════════════════════════════════
      // 🧪 华维食品添加剂（硫磺贸易）
      // ══════════════════════════════════════════
      {
        path: 'huawei',
        name: 'Huawei',
        redirect: '/business/huawei/orders',
        meta: { title: '华维食品', icon: 'OfficeBuilding', requiresAuth: true, subsidiary: 'huawei', businessType: 'trading' },
        children: [
          {
            path: 'orders',
            name: 'HuaweiOrderList',
            component: () => import('@/views/business/huawei/OrderList.vue'),
            meta: { title: '订单列表', icon: 'Document', requiresAuth: true }
          },
          {
            path: 'orders/:id',
            name: 'HuaweiOrderDetail',
            component: () => import('@/views/business/huawei/OrderDetail.vue'),
            meta: { title: '订单详情', requiresAuth: true, hidden: true }
          },
          {
            path: 'purchase-contracts',
            name: 'HuaweiPurchaseContracts',
            component: () => import('@/views/business/huawei/PurchaseContracts.vue'),
            meta: { title: '采购合同', icon: 'DocumentChecked', requiresAuth: true }
          },
          {
            path: 'sales-contracts',
            name: 'HuaweiSalesContracts',
            component: () => import('@/views/business/huawei/SalesContracts.vue'),
            meta: { title: '销售合同', icon: 'DocumentChecked', requiresAuth: true }
          },
          {
            path: 'warehouse',
            name: 'HuaweiWarehouse',
            component: () => import('@/views/business/huawei/Warehouse.vue'),
            meta: { title: '入出库明细', icon: 'Box', requiresAuth: true }
          }
        ]
      },

      // ══════════════════════════════════════════
      // 🔬 广为科技（硫磺/磷酸贸易）
      // ══════════════════════════════════════════
      {
        path: 'guangwei',
        name: 'Guangwei',
        redirect: '/business/guangwei/orders',
        meta: { title: '广为科技', icon: 'OfficeBuilding', requiresAuth: true, subsidiary: 'guangwei', businessType: 'trading' },
        children: [
          {
            path: 'orders',
            name: 'GuangweiOrderList',
            component: () => import('@/views/business/guangwei/OrderList.vue'),
            meta: { title: '订单列表', icon: 'Document', requiresAuth: true }
          },
          {
            path: 'orders/:id',
            name: 'GuangweiOrderDetail',
            component: () => import('@/views/business/guangwei/OrderDetail.vue'),
            meta: { title: '订单详情', requiresAuth: true, hidden: true }
          },
          {
            path: 'purchase-contracts',
            name: 'GuangweiPurchaseContracts',
            component: () => import('@/views/business/guangwei/PurchaseContracts.vue'),
            meta: { title: '采购合同', icon: 'DocumentChecked', requiresAuth: true }
          },
          {
            path: 'sales-contracts',
            name: 'GuangweiSalesContracts',
            component: () => import('@/views/business/guangwei/SalesContracts.vue'),
            meta: { title: '销售合同', icon: 'DocumentChecked', requiresAuth: true }
          },
          {
            path: 'warehouse',
            name: 'GuangweiWarehouse',
            component: () => import('@/views/business/guangwei/Warehouse.vue'),
            meta: { title: '入出库明细', icon: 'Box', requiresAuth: true }
          }
        ]
      },

      // ══════════════════════════════════════════
      // 👥 客户管理（全公司统一）
      // ══════════════════════════════════════════
      {
        path: 'customers',
        name: 'Customers',
        component: () => import('@/views/business/customers/CustomerList.vue'),
        meta: { title: '客户管理', icon: 'UserFilled', requiresAuth: true }
      },

      // ══════════════════════════════════════════
      // 📦 库存管理（全公司统一）
      // ══════════════════════════════════════════
      {
        path: 'inventory',
        name: 'Inventory',
        component: () => import('@/views/business/inventory/InventoryList.vue'),
        meta: { title: '库存管理', icon: 'Box', requiresAuth: true }
      }
    ]
  }
]

export default businessRoutes
