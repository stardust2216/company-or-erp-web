// ============================================
// 华维食品硫磺订单类型定义
// 基于【销售合同】26-27榨季华维食品硫磺销售合同统计表
// ============================================

// ── 订单状态 ─────────────────────────────────
export type SulfurOrderStatus = 'draft' | 'pending' | 'inProduction' | 'shipped' | 'invoiced' | 'completed'
export type InvoiceStatus = 'none' | 'partial' | 'done'
export type PaymentStatus = 'unpaid' | 'partial' | 'paid'

// ── 产品类型 ─────────────────────────────────
export type SulfurProductType = 'block' | 'granular' | 'mixed'

// ── 送货方式 ─────────────────────────────────
export type DeliveryMethod = 'self_pickup' | 'deliver'

// ── 片区 ─────────────────────────────────────
export type Region = 'guangxi' | 'yunnan' | 'guizhou' | 'other'

export const REGION_LABEL: Record<Region, string> = {
  guangxi: '广西片区',
  yunnan: '云南片区',
  guizhou: '贵州片区',
  other: '其他片区'
}

// ── 订单主体 ─────────────────────────────────
export interface SulfurOrder {
  id: string
  // 合同基本信息
  contractNo: string          // 合同编号
  contractDate: string        // 合同日期 格式: YYYY.MM.DD
  region: Region              // 片区
  customerGroup: string        // 集团名称
  customerUnit: string         // 使用单位

  // 产品信息
  productType: SulfurProductType // 产品类型：块磺/粒磺
  qtyBlock: number            // 块磺数量（吨）
  qtyGranular: number         // 粒磺数量（吨）
  qtyTotal: number            // 合计数量（吨）
  actualShipped: number       // 实际发货数量（吨）

  // 价格信息
  unitPrice: number           // 单价（元/吨）
  totalAmount: number         // 金额（元）

  // 送货方式
  deliveryMethod: DeliveryMethod // 送货方式：自提/送到

  // 状态
  status: SulfurOrderStatus
  paymentStatus: PaymentStatus // 回款状态
  paymentProgress: number    // 回款进度 0-100
  invoiceStatus: InvoiceStatus // 开票状态

  // 金额
  paidAmount: number          // 已付款金额
  invoicedAmount: number      // 已开票金额

  // 备注
  remark: string

  // 时间戳
  createdAt: string
  updatedAt: string
}

// ── 创建/编辑输入 ──────────────────────────────
export interface SulfurOrderInput {
  contractNo: string
  contractDate: string
  region: Region
  customerGroup: string
  customerUnit: string
  productType: SulfurProductType
  qtyBlock: number
  qtyGranular: number
  unitPrice: number
  deliveryMethod: DeliveryMethod
  paymentProgress: number
  invoiceStatus: InvoiceStatus
  paidAmount: number
  invoicedAmount: number
  remark: string
}

// ── 订单状态映射 ───────────────────────────────
export const ORDER_STATUS_LABEL: Record<SulfurOrderStatus, string> = {
  draft: '草稿',
  pending: '待审核',
  inProduction: '生产中',
  shipped: '已发货',
  invoiced: '已开票',
  completed: '已完成'
}

export const ORDER_STATUS_TAG_TYPE: Record<SulfurOrderStatus, '' | 'info' | 'warning' | 'success' | 'danger'> = {
  draft: 'info',
  pending: 'warning',
  inProduction: 'info',
  shipped: '',
  invoiced: 'success',
  completed: 'success'
}

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  unpaid: '未回款',
  partial: '部分回款',
  paid: '已回款'
}

export const INVOICE_STATUS_LABEL: Record<InvoiceStatus, string> = {
  none: '未开票',
  partial: '部分开票',
  done: '已开票'
}

export const PRODUCT_TYPE_LABEL: Record<SulfurProductType, string> = {
  block: '块磺',
  granular: '粒磺',
  mixed: '混合'
}

export const DELIVERY_METHOD_LABEL: Record<DeliveryMethod, string> = {
  self_pickup: '自提',
  deliver: '送到'
}

// ── 工具函数 ─────────────────────────────────
export function calcTotalAmount(qtyBlock: number, qtyGranular: number, unitPrice: number): number {
  return Math.round((qtyBlock + qtyGranular) * unitPrice * 100) / 100
}

export function getPaymentStatus(progress: number): PaymentStatus {
  if (progress <= 0) return 'unpaid'
  if (progress >= 100) return 'paid'
  return 'partial'
}

export function getInvoiceStatus(invoicedAmount: number, totalAmount: number): InvoiceStatus {
  if (invoicedAmount <= 0) return 'none'
  if (invoicedAmount >= totalAmount) return 'done'
  return 'partial'
}
