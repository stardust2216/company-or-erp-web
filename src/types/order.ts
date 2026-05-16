// ============================================
// 订单相关类型定义
// Company OA ERP - Core Business Module
// ============================================

import type { SubsidiaryId } from '@/constants/subsidiary'

// ── 订单状态 ─────────────────────────────────
// 待审核 | 生产中 | 已发货 | 已开票 | 已完成（回款完成）
export type OrderStatus = 'pending' | 'production' | 'shipped' | 'invoiced' | 'completed'
export type InvoiceStatus = 'none' | 'pending' | 'done'
export type PaymentBucket = '' | 'low' | 'mid' | 'high'

// ── 产品明细行 ───────────────────────────────
export interface OrderLine {
  id: string
  productName: string
  spec: string
  qty: number
  unit: string
  unitPrice: number
}

// ── 订单实体 ─────────────────────────────────
export interface Order {
  id: string
  orderNo: string
  subsidiaryId: SubsidiaryId
  customer: string
  amount: number
  status: OrderStatus
  invoiceStatus: InvoiceStatus
  paymentProgress: number
  stockRemain: number
  contact: string
  phone: string
  remark: string
  deliveryAddress: string
  expectedFinishDate: string
  lines: OrderLine[]
  createdAt: string
}

// ── 订单创建 / 更新输入 ──────────────────────
export type OrderLineInput = Omit<OrderLine, 'id'>

export interface OrderCreateInput {
  subsidiaryId: SubsidiaryId
  customer: string
  contact: string
  phone: string
  remark: string
  deliveryAddress: string
  expectedFinishDate: string
  status: OrderStatus
  invoiceStatus: InvoiceStatus
  paymentProgress: number
  lines: OrderLineInput[]
}

export type OrderUpdateInput = Partial<
  Pick<
    Order,
    | 'subsidiaryId'
    | 'customer'
    | 'contact'
    | 'phone'
    | 'remark'
    | 'deliveryAddress'
    | 'expectedFinishDate'
    | 'status'
    | 'invoiceStatus'
    | 'paymentProgress'
    | 'lines'
  >
>

// ── 订单筛选条件 ─────────────────────────────
export interface OrderFilter {
  subsidiaryId: SubsidiaryId | ''
  keyword: string
  status: OrderStatus | ''
  invoiceStatus: InvoiceStatus | ''
  paymentBucket: PaymentBucket
}

// ── 状态标签映射 ─────────────────────────────
// 5 种状态：待审核 → 生产中 → 已发货 → 已开票 → 已完成（回款完成）
export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: '待审核',
  production: '生产中',
  shipped: '已发货',
  invoiced: '已开票',
  completed: '已完成'
}

/** Element Plus Tag 类型映射：按《结构说明》区分颜色 */
export const ORDER_STATUS_TAG_TYPE: Record<OrderStatus, '' | 'warning' | 'info' | 'success' | 'danger'> = {
  pending: 'warning',      // 橙色 → 待审核
  production: 'info',      // 蓝色 → 生产中
  shipped: '',             // 默认 → 已发货
  invoiced: 'success',    // 绿色 → 已开票
  completed: ''            // 默认 → 已完成（回款完成）
}

export const INVOICE_STATUS_LABEL: Record<InvoiceStatus, string> = {
  none: '未开票',
  pending: '开票中',
  done: '已开票'
}

export const INVOICE_STATUS_TAG_TYPE: Record<InvoiceStatus, '' | 'warning' | 'info' | 'success'> = {
  none: 'info',
  pending: 'warning',
  done: 'success'
}

// ── 工具函数 ─────────────────────────────────
export function sumOrderLines(lines: OrderLine[]): number {
  return Math.round(lines.reduce((s, l) => s + l.qty * l.unitPrice, 0) * 100) / 100
}

export function paymentColor(progress: number): string {
  if (progress >= 80) return '#06d6a0'
  if (progress >= 40) return '#0070f3'
  return '#e6a23c'
}

/** 已开票及以后状态均可打印生产计划单 */
export function canPrintProductionSheet(status: OrderStatus): boolean {
  return status === 'production' || status === 'shipped' || status === 'invoiced' || status === 'completed'
}

// ============================================
// 龙州塑业 - 糖袋订单扩展类型
// 适用于：龙州塑业（糖袋业务）
// ============================================

/** 糖袋产品外袋规格 */
export interface SugarBagOuterSpec {
  /** 宽度*有效长度（cm） */
  outerSize: string
  /** 重量（g/套） */
  outerWeight: number
  /** 经向拉力（牛） */
  warpTension: number
  /** 纬向拉力（牛） */
  weftTension: number
  /** 经纬密度（经：纬） */
  density: string
}

/** 糖袋使用布筒规格 */
export interface SugarBagClothSpec {
  /** 宽度*平方克重(cm*g/㎡) */
  clothSize: string
  /** 重量（g/套） */
  clothWeight: number
}

/** 糖袋内袋规格 */
export interface SugarBagInnerSpec {
  /** 宽度*长度（cm） */
  innerSize: string
  /** 重量（g/套） */
  innerWeight: number
  /** 高/低压 */
  pressure: '高压' | '低压'
  /** 材质要求 */
  material: string
  /** 颜色 */
  color: string
}

/** 整套克重、袋口、袋底、印刷 */
export interface SugarBagOtherSpec {
  /** 整套克重（g/套） */
  totalWeight: number
  /** 袋口-一般 */
  bagMouthNormal: string
  /** 袋口-翻口 */
  bagMouthFlip: string
  /** 袋口-圈口 */
  bagMouthRing: string
  /** 袋底-连膜车底 */
  bagBottomConnected: string
  /** 袋底-非连膜车底 */
  bagBottomNonConnected: string
  /** 袋底-单折 */
  bagBottomSingleFold: string
  /** 袋底-双折 */
  bagBottomDoubleFold: string
  /** 印刷-单面 */
  printSingle: string
  /** 印刷-双面 */
  printDouble: string
}

/** 糖袋订单产品明细 */
export interface SugarBagOrderLine {
  id: string
  /** 产品序号 */
  productSeq: number
  /** 品牌名称 */
  brandName: string
  /** 产品名称 */
  productName: string
  /** 外袋规格 */
  outerSpec: SugarBagOuterSpec
  /** 使用布筒 */
  clothSpec: SugarBagClothSpec
  /** 内袋规格 */
  innerSpec: SugarBagInnerSpec
  /** 其他规格（克重、袋口、袋底、印刷） */
  otherSpec: SugarBagOtherSpec
  /** 订单数量-件数（包） */
  qtyPackages: number
  /** 订单数量-数量（套） */
  qtySets: number
  /** 订单数量-重量（吨） */
  qtyWeight: number
  /** 单价（元/套） */
  unitPrice: number
  /** 金额（元） */
  amount: number
}

/** 出货明细 */
export interface SugarBagDelivery {
  /** 使用单位出货序号 */
  deliverySeq: number
  /** 出货日期 */
  deliveryDate: string
  /** 出货数量-件数（件） */
  deliveryPackages: number
  /** 出货数量-数量（套） */
  deliverySets: number
  /** 出货数量-重量（吨） */
  deliveryWeight: number
}

/** 承运信息 */
export interface SugarBagCarrier {
  /** 承运单位 */
  carrierName: string
  /** 承运车号 */
  vehicleNumber: string
  /** 司机姓名 */
  driverName: string
}

/** 龙州塑业糖袋订单实体 */
export interface SugarBagOrder {
  id: string
  orderNo: string
  subsidiaryId: 'longzhou'
  /** 集团名称 */
  groupName: string
  /** 使用单位（客户） */
  customer: string
  /** 合同签订日期 */
  contractDate: string
  /** 使用单位合同序号 */
  customerContractSeq: number
  /** 合同编号 */
  contractNo: string
  /** 产品明细列表 */
  lines: SugarBagOrderLine[]
  /** 出货明细列表 */
  deliveries: SugarBagDelivery[]
  /** 承运信息 */
  carrier?: SugarBagCarrier
  /** 订单总数量（套） */
  totalQty: number
  /** 订单总金额（元） */
  totalAmount: number
  /** 已出货数量（套） */
  shippedQty: number
  /** 剩余库存（套） */
  stockRemain: number
  /** 订单状态 */
  status: OrderStatus
  /** 开票状态 */
  invoiceStatus: InvoiceStatus
  /** 回款进度（%） */
  paymentProgress: number
  /** 备注 */
  remark: string
  createdAt: string
}

/** 龙州塑业糖袋订单创建输入 */
export interface SugarBagOrderCreateInput {
  groupName: string
  customer: string
  contractDate: string
  customerContractSeq: number
  contractNo: string
  lines: Omit<SugarBagOrderLine, 'id'>[]
  carrier?: Omit<SugarBagCarrier, never>
  remark: string
}

/** 龙州塑业糖袋订单更新输入 */
export type SugarBagOrderUpdateInput = Partial<
  Pick<
    SugarBagOrder,
    | 'groupName'
    | 'customer'
    | 'contractDate'
    | 'contractNo'
    | 'lines'
    | 'deliveries'
    | 'carrier'
    | 'status'
    | 'invoiceStatus'
    | 'paymentProgress'
    | 'remark'
  >
>

/** 糖袋订单筛选条件 */
export interface SugarBagOrderFilter {
  groupName: string
  customer: string
  contractNo: string
  status: OrderStatus | ''
  dateRange: [string, string] | null
}

/** 糖袋订单统计汇总 */
export interface SugarBagOrderSummary {
  totalOrders: number
  totalQty: number
  totalAmount: number
  shippedQty: number
  stockRemain: number
  pendingCount: number
  productionCount: number
  shippedCount: number
  invoicedCount: number
  completedCount: number
}
