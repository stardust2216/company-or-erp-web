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

// ============================================
// 龙州塑业 - 库存扩展类型
// 适用于：龙州塑业（糖袋业务）
// ============================================

/** 糖袋布筒库存日报表 */
export interface SugarBagClothInventory {
  id: string
  subsidiaryId: 'longzhou'
  /** 报表日期 */
  reportDate: string
  /** 布筒规格（宽度*平方克重 cm*g/㎡） */
  clothSpec: string
  /** 使用客户信息 */
  customerInfo: string
  /** 生产机台号 */
  machineNumber: string
  /** 机台数 */
  machineCount: number
  /** 入库量-布筒产量 */
  inboundClothQty: number
  /** 入库量-普印工段使用量 */
  inboundPrintingQty: number
  /** 出库量-数量（个） */
  outboundQty: number
  /** 出库量-总长度（M） */
  outboundLength: number
  /** 上日库存量-数量（个） */
  prevDayQty: number
  /** 上日库存量-总长度（M） */
  prevDayLength: number
  /** 今日库存量-数量（个） */
  todayQty: number
  /** 今日库存量-总长度（M） */
  todayLength: number
  /** 存放地点名称 */
  storageLocation: string
  remark: string
}

/** 糖袋布筒库存筛选条件 */
export interface SugarBagClothInventoryFilter {
  reportDate: string
  clothSpec: string
  customerInfo: string
}

/** 糖袋布筒库存汇总 */
export interface SugarBagClothInventorySummary {
  reportDate: string
  totalPrevDayQty: number
  totalPrevDayLength: number
  totalInboundClothQty: number
  totalInboundPrintingQty: number
  totalOutboundQty: number
  totalOutboundLength: number
  totalTodayQty: number
  totalTodayLength: number
}

/** 糖袋成品库存 */
export interface SugarBagProductInventory {
  id: string
  subsidiaryId: 'longzhou'
  warehouseName: string
  /** 产品名称 */
  productName: string
  /** 外袋规格 */
  outerSpec: string
  /** 品牌名称 */
  brandName: string
  stockQty: number
  unit: string
  safeStock: number
  reservedQty: number
  /** 使用单位 */
  customer: string
  orderLinkHint: string
}

/** 糖袋库存变动日志 */
export interface SugarBagInventoryLog {
  id: string
  subsidiaryId: 'longzhou'
  orderId: string
  /** 关联产品序号 */
  productSeq: number
  productName: string
  /** 变动类型 */
  changeType: 'production' | 'shipment' | 'return' | 'adjustment'
  changeQty: number
  /** 变动前库存 */
  beforeQty: number
  /** 变动后库存 */
  afterQty: number
  operator: string
  remark: string
  createdAt: string
}
