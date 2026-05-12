// ============================================
// 订单相关类型定义
// Company OA ERP - Core Business Module
// ============================================

import type { SubsidiaryId } from '@/constants/subsidiary'

// ── 订单状态 ─────────────────────────────────
export type OrderStatus = 'pending' | 'production' | 'completed' | 'shipped'
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
export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: '待审核',
  production: '生产中',
  completed: '已完成',
  shipped: '已发货'
}

/** Element Plus Tag 类型映射：按《结构说明》区分颜色 */
export const ORDER_STATUS_TAG_TYPE: Record<OrderStatus, '' | 'warning' | 'info' | 'success' | 'danger'> = {
  pending: 'warning',      // 橙色 → 待处理
  production: 'info',      // 蓝色 → 进行中
  completed: 'success',    // 绿色 → 已完成
  shipped: ''              // 默认 → 已发货
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

export function canPrintProductionSheet(status: OrderStatus): boolean {
  return status === 'production' || status === 'completed' || status === 'shipped'
}
