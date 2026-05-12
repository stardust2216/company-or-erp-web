// ============================================
// 库存管理类型定义
// Company OA ERP - Core Business Module
// ============================================

import type { SubsidiaryId } from '@/constants/subsidiary'

export interface InventoryRow {
  id: string
  subsidiaryId: SubsidiaryId
  warehouseName: string
  skuName: string
  spec: string
  stockQty: number
  unit: string
  safeStock: number
  /** 与订单状态联动说明 */
  orderLinkHint: string
}
