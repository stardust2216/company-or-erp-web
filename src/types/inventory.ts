// ============================================
// 库存管理类型定义
// Company OA ERP - Core Business Module
// ============================================

import type { SubsidiaryId } from '@/constants/subsidiary'

/** 库存明细行 —— 与订单联动 */
export interface InventoryRow {
  id: string
  subsidiaryId: SubsidiaryId
  warehouseName: string
  skuName: string
  spec: string
  /** 实际库存余量 */
  stockQty: number
  unit: string
  /** 安全库存阈值，低于此值标红提醒 */
  safeStock: number
  /** 被订单锁定（预留）的数量 */
  reservedQty: number
  /** 与订单状态联动说明 */
  orderLinkHint: string
}

/** 库存变动记录（入出库明细） */
export interface InventoryLog {
  id: string
  subsidiaryId: SubsidiaryId
  orderId: string
  skuName: string
  changeQty: number
  type: 'in' | 'out'
  remark: string
  createdAt: string
}
