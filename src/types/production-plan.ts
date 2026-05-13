// ============================================
// 生产计划单类型定义（Step 5 预留模板接口）
// Company OA ERP - Core Business Module
// ============================================

import type { SubsidiaryId } from '@/constants/subsidiary'
import type { OrderStatus } from './order'

/** 生产计划单状态 */
export type PlanStatus = 'draft' | 'printed' | 'archived'

/** 生产计划单实体 */
export interface ProductionPlan {
  id: string
  /** 关联订单 ID */
  orderId: string
  /** 子公司 */
  subsidiaryId: SubsidiaryId
  /** 计划单编号（打印用） */
  planNo: string
  /** 产品名称（来自订单明细） */
  productName: string
  /** 规格要求（来自订单明细） */
  spec: string
  /** 计划生产数量 */
  planQty: number
  unit: string
  /** 订单状态快照 */
  orderStatus: OrderStatus
  /** 计划单状态 */
  status: PlanStatus
  /** 生产要求/备注（可打印区域） */
  productionNote: string
  /** 打印次数 */
  printCount: number
  /** 最新打印时间 */
  lastPrintAt: string
  createdAt: string
}

/** 计划单创建输入 */
export interface ProductionPlanInput {
  orderId: string
  subsidiaryId: SubsidiaryId
  productName: string
  spec: string
  planQty: number
  unit: string
  productionNote: string
}

/** 计划单更新输入 */
export type ProductionPlanUpdateInput = Partial<
  Pick<ProductionPlan, 'planQty' | 'unit' | 'productionNote' | 'status'>
>

// ============================================
// 打印模板预留接口（Step 5）
// ============================================

/** 打印模板配置 —— 预留，Step 5 实现具体排版 */
export interface PrintTemplateConfig {
  /** 模板名称 */
  name: string
  /** 是否显示公司 LOGO */
  showLogo: boolean
  /** 是否显示二维码 */
  showQRCode: boolean
  /** 自定义页眉 HTML（预留） */
  headerHtml: string
  /** 自定义页脚 HTML（预留） */
  footerHtml: string
}

/** 默认模板配置 */
export const DEFAULT_PRINT_CONFIG: PrintTemplateConfig = {
  name: '标准生产计划单',
  showLogo: true,
  showQRCode: false,
  headerHtml: '',
  footerHtml: '',
}

/** 根据订单状态判断是否可打印（复用 order.ts 的逻辑） */
export function canGeneratePlan(status: OrderStatus): boolean {
  // 生产中 / 已发货 / 已开票 / 已完成 均可生成计划单
  return status === 'production' || status === 'shipped' || status === 'invoiced' || status === 'completed'
}
