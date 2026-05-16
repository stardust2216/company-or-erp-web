// ============================================
// 数据报表路由模块
// Company OA ERP - Reports Routes
// 结构：4大子公司报表 + 全公司报表
// ============================================

import type { RouteRecordRaw } from 'vue-router'

const reportRoutes: RouteRecordRaw[] = [
  {
    path: 'reports',
    name: 'Reports',
    redirect: '/reports/yahui',
    meta: { title: '数据报表', icon: 'DataLine', requiresAuth: true },
    children: [

      // ══════════════════════════════════════════
      // 🏭 亚辉塑业报表
      // ══════════════════════════════════════════
      {
        path: 'yahui',
        name: 'YahuiReports',
        redirect: '/reports/yahui/order-a',
        meta: { title: '亚辉塑业', icon: 'OfficeBuilding', requiresAuth: true, subsidiary: 'yahui' },
        children: [
          // 采购/销售/出库
          {
            path: 'order-a',
            name: 'YahuiOrderReportA',
            component: () => import('@/views/reports/yahui/OrderReportA.vue'),
            meta: { title: '采购合同报表', icon: 'Document', requiresAuth: true }
          },
          {
            path: 'order-b',
            name: 'YahuiOrderReportB',
            component: () => import('@/views/reports/yahui/OrderReportB.vue'),
            meta: { title: '销售合同报表', icon: 'Document', requiresAuth: true }
          },
          {
            path: 'order-c',
            name: 'YahuiOrderReportC',
            component: () => import('@/views/reports/yahui/OrderReportC.vue'),
            meta: { title: '出库明细报表', icon: 'Document', requiresAuth: true }
          },
          {
            path: 'stock-in',
            name: 'YahuiStockInReport',
            component: () => import('@/views/reports/yahui/StockInReport.vue'),
            meta: { title: '入库明细报表', icon: 'Download', requiresAuth: true }
          },
          // 生产报表
          {
            path: 'production-daily',
            name: 'YahuiProductionDaily',
            component: () => import('@/views/reports/yahui/ProductionDaily.vue'),
            meta: { title: '生产日报（硫磺）', icon: 'SetUp', requiresAuth: true }
          },
          {
            path: 'output-report',
            name: 'YahuiOutputReport',
            component: () => import('@/views/reports/yahui/YahuiOutputReport.vue'),
            meta: { title: '产量产值报表', icon: 'DataAnalysis', requiresAuth: true }
          },
          // 库存报表
          {
            path: 'stock-fabric',
            name: 'YahuiStockFabric',
            component: () => import('@/views/reports/yahui/StockFabric.vue'),
            meta: { title: '硫磺库存日报', icon: 'Box', requiresAuth: true }
          },
          {
            path: 'stock-material',
            name: 'YahuiStockMaterial',
            component: () => import('@/views/reports/yahui/StockMaterial.vue'),
            meta: { title: '原料耗用报表', icon: 'Box', requiresAuth: true }
          },
          // 工业生产经营
          {
            path: 'industry',
            name: 'YahuiIndustryReport',
            component: () => import('@/views/reports/yahui/IndustryReport.vue'),
            meta: { title: '工业生产经营', icon: 'DataBoard', requiresAuth: true }
          },
          // 数据存储
          {
            path: 'data-storage',
            name: 'YahuiDataStorage',
            component: () => import('@/views/reports/yahui/DataStorage.vue'),
            meta: { title: '数据存储', icon: 'FolderOpened', requiresAuth: true }
          }
        ]
      },

      // ══════════════════════════════════════════
      // 🏭 龙州塑业报表（8项）
      // ══════════════════════════════════════════
      {
        path: 'longzhou',
        name: 'LongzhouReports',
        redirect: '/reports/longzhou/order',
        meta: { title: '龙州塑业', icon: 'OfficeBuilding', requiresAuth: true, subsidiary: 'longzhou' },
        children: [
          {
            path: 'order',
            name: 'LongzhouOrderReport',
            component: () => import('@/views/reports/longzhou/OrderReport.vue'),
            meta: { title: '订单报表', icon: 'Document', requiresAuth: true }
          },
          {
            path: 'production-daily',
            name: 'LongzhouProductionDaily',
            component: () => import('@/views/reports/longzhou/ProductionDaily.vue'),
            meta: { title: '生产日报（6工序）', icon: 'SetUp', requiresAuth: true }
          },
          {
            path: 'stock',
            name: 'LongzhouStock',
            component: () => import('@/views/reports/longzhou/StockReport.vue'),
            meta: { title: '库存报表', icon: 'Box', requiresAuth: true }
          }
        ]
      },

      // ══════════════════════════════════════════
      // 🧪 华维硫磺报表（6项）
      // ══════════════════════════════════════════
      {
        path: 'huawei',
        name: 'HuaweiReports',
        redirect: '/reports/huawei/purchase-stats',
        meta: { title: '华维食品', icon: 'OfficeBuilding', requiresAuth: true, subsidiary: 'huawei' },
        children: [
          {
            path: 'purchase-stats',
            name: 'HuaweiPurchaseStats',
            component: () => import('@/views/reports/huawei/PurchaseStats.vue'),
            meta: { title: '采购合同统计', icon: 'DocumentChecked', requiresAuth: true }
          },
          {
            path: 'inbound',
            name: 'HuaweiInboundReport',
            component: () => import('@/views/reports/huawei/InboundReport.vue'),
            meta: { title: '入库明细', icon: 'Download', requiresAuth: true }
          },
          {
            path: 'sales-stats',
            name: 'HuaweiSalesStats',
            component: () => import('@/views/reports/huawei/SalesStats.vue'),
            meta: { title: '销售合同统计', icon: 'DocumentChecked', requiresAuth: true }
          },
          {
            path: 'outbound',
            name: 'HuaweiOutboundReport',
            component: () => import('@/views/reports/huawei/OutboundReport.vue'),
            meta: { title: '出库明细', icon: 'Upload', requiresAuth: true }
          },
          {
            path: 'production-daily',
            name: 'HuaweiProductionDaily',
            component: () => import('@/views/reports/huawei/ProductionDaily.vue'),
            meta: { title: '生产日报', icon: 'SetUp', requiresAuth: true }
          },
          {
            path: 'business-summary',
            name: 'HuaweiBusinessSummary',
            component: () => import('@/views/reports/huawei/BusinessSummary.vue'),
            meta: { title: '工业生产经营', icon: 'TrendCharts', requiresAuth: true }
          }
        ]
      },

      // ══════════════════════════════════════════
      // 🔬 广为科技报表（4项）
      // ══════════════════════════════════════════
      {
        path: 'guangwei',
        name: 'GuangweiReports',
        redirect: '/reports/guangwei/phosphoric-purchase',
        meta: { title: '广为科技', icon: 'OfficeBuilding', requiresAuth: true, subsidiary: 'guangwei' },
        children: [
          {
            path: 'phosphoric-purchase',
            name: 'GuangweiPhosphoricPurchase',
            component: () => import('@/views/reports/guangwei/PhosphoricPurchase.vue'),
            meta: { title: '磷酸采购合同', icon: 'DocumentChecked', requiresAuth: true }
          },
          {
            path: 'phosphoric-sales',
            name: 'GuangweiPhosphoricSales',
            component: () => import('@/views/reports/guangwei/PhosphoricSales.vue'),
            meta: { title: '磷酸销售合同', icon: 'DocumentChecked', requiresAuth: true }
          },
          {
            path: 'purchase-detail',
            name: 'GuangweiPurchaseDetail',
            component: () => import('@/views/reports/guangwei/PurchaseDetail.vue'),
            meta: { title: '采购明细', icon: 'Download', requiresAuth: true }
          },
          {
            path: 'sales-detail',
            name: 'GuangweiSalesDetail',
            component: () => import('@/views/reports/guangwei/SalesDetail.vue'),
            meta: { title: '销售明细', icon: 'Upload', requiresAuth: true }
          }
        ]
      },

      // ══════════════════════════════════════════
      // 🏢 全公司报表（董事经理+）
      // ══════════════════════════════════════════
      {
        path: 'company',
        name: 'CompanyReports',
        redirect: '/reports/company/overview',
        meta: { title: '全公司报表', icon: 'DataAnalysis', requiresAuth: true, requiredRole: 'director' },
        children: [
          {
            path: 'overview',
            name: 'CompanyOverview',
            component: () => import('@/views/reports/company/CompanyOverview.vue'),
            meta: { title: '经营总览', icon: 'Odometer', requiresAuth: true, requiredRole: 'director' }
          },
          {
            path: 'comparison',
            name: 'CompanyComparison',
            component: () => import('@/views/reports/company/CompanyComparison.vue'),
            meta: { title: '四子公司对比', icon: 'ScaleToOriginal', requiresAuth: true, requiredRole: 'director' }
          },
          {
            path: 'consolidated',
            name: 'CompanyConsolidated',
            component: () => import('@/views/reports/company/CompanyConsolidated.vue'),
            meta: { title: '合并报表', icon: 'Tickets', requiresAuth: true, requiredRole: 'director' }
          },
          {
            path: 'kpi',
            name: 'CompanyKPI',
            component: () => import('@/views/reports/company/CompanyKPI.vue'),
            meta: { title: '核心指标看板', icon: 'Monitor', requiresAuth: true, requiredRole: 'director' }
          }
        ]
      }
    ]
  }
]

export default reportRoutes
