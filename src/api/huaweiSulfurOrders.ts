// src/api/huaweiSulfurOrders.ts
// 华维食品硫磺订单管理 API 接口
// ⚠️  当前运行在【Mock 模式】，所有数据均为内存态，刷新即重置

import type {
  SulfurOrder,
  SulfurOrderInput,
  SulfurProductType,
  Region
} from '@/types/sulfurOrder'

// ─────────────────────────────────────────────
// 类型定义
// ─────────────────────────────────────────────

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface OrderListParams {
  page?: number
  pageSize?: number
  region?: Region | ''
  customerGroup?: string
  customerUnit?: string
  contractNo?: string
  contractDateStart?: string
  contractDateEnd?: string
  productType?: SulfurProductType | ''
}

export interface OrderListResult {
  list: SulfurOrder[]
  total: number
  page: number
  pageSize: number
  // 统计
  totalQty: number
  totalAmount: number
  totalPaid: number
  totalInvoiced: number
}

// ─────────────────────────────────────────────
// Mock 数据初始化（从Excel导入的示例数据）
// ─────────────────────────────────────────────

const initMockData: SulfurOrder[] = [
  {
    id: 'hw-001',
    contractNo: 'HW20250826',
    contractDate: '2025.8.26',
    region: 'guangxi',
    customerGroup: '利方达公司',
    customerUnit: '利方达',
    productType: 'granular',
    qtyBlock: 0,
    qtyGranular: 500,
    qtyTotal: 500,
    actualShipped: 500,
    unitPrice: 2735,
    totalAmount: 1367500,
    deliveryMethod: 'self_pickup',
    status: 'completed',
    paymentStatus: 'paid',
    paymentProgress: 100,
    invoiceStatus: 'done',
    paidAmount: 1367500,
    invoicedAmount: 1367500,
    remark: '',
    createdAt: '2025-08-26',
    updatedAt: '2026-02-27'
  },
  {
    id: 'hw-002',
    contractNo: 'KM2025082601',
    contractDate: '2025.8.26',
    region: 'yunnan',
    customerGroup: '昆明伯明原公司',
    customerUnit: '伯明原',
    productType: 'granular',
    qtyBlock: 0,
    qtyGranular: 500,
    qtyTotal: 500,
    actualShipped: 500,
    unitPrice: 2950,
    totalAmount: 1475000,
    deliveryMethod: 'deliver',
    status: 'completed',
    paymentStatus: 'paid',
    paymentProgress: 100,
    invoiceStatus: 'done',
    paidAmount: 1475000,
    invoicedAmount: 1475000,
    remark: '',
    createdAt: '2025-08-26',
    updatedAt: '2026-03-24'
  },
  {
    id: 'hw-003',
    contractNo: 'KM2025090301',
    contractDate: '2025.9.3',
    region: 'yunnan',
    customerGroup: '昆明伯明原公司',
    customerUnit: '伯明原',
    productType: 'granular',
    qtyBlock: 0,
    qtyGranular: 500,
    qtyTotal: 500,
    actualShipped: 500,
    unitPrice: 3300,
    totalAmount: 1650000,
    deliveryMethod: 'deliver',
    status: 'completed',
    paymentStatus: 'paid',
    paymentProgress: 100,
    invoiceStatus: 'done',
    paidAmount: 1650000,
    invoicedAmount: 1650000,
    remark: '',
    createdAt: '2025-09-03',
    updatedAt: '2026-03-24'
  },
  {
    id: 'hw-004',
    contractNo: 'KM202602270103',
    contractDate: '2026.2.27',
    region: 'yunnan',
    customerGroup: '昆明伯明原公司',
    customerUnit: '伯明原',
    productType: 'granular',
    qtyBlock: 0,
    qtyGranular: 300,
    qtyTotal: 300,
    actualShipped: 300,
    unitPrice: 4450,
    totalAmount: 1335000,
    deliveryMethod: 'self_pickup',
    status: 'shipped',
    paymentStatus: 'partial',
    paymentProgress: 60,
    invoiceStatus: 'done',
    paidAmount: 800000,
    invoicedAmount: 1335000,
    remark: '',
    createdAt: '2026-02-27',
    updatedAt: '2026-04-01'
  },
  {
    id: 'hw-005',
    contractNo: 'KM2026026032404',
    contractDate: '2026.3.24',
    region: 'yunnan',
    customerGroup: '昆明伯明原公司',
    customerUnit: '伯明原',
    productType: 'granular',
    qtyBlock: 0,
    qtyGranular: 220,
    qtyTotal: 220,
    actualShipped: 0,
    unitPrice: 5950,
    totalAmount: 1309000,
    deliveryMethod: 'self_pickup',
    status: 'inProduction',
    paymentStatus: 'unpaid',
    paymentProgress: 0,
    invoiceStatus: 'none',
    paidAmount: 0,
    invoicedAmount: 0,
    remark: '',
    createdAt: '2026-03-24',
    updatedAt: '2026-04-01'
  },
  {
    id: 'hw-006',
    contractNo: '口头',
    contractDate: '2026.4.1',
    region: 'yunnan',
    customerGroup: '昆明伯明原公司',
    customerUnit: '伯明原',
    productType: 'granular',
    qtyBlock: 0,
    qtyGranular: 33,
    qtyTotal: 33,
    actualShipped: 0,
    unitPrice: 6550,
    totalAmount: 216150,
    deliveryMethod: 'self_pickup',
    status: 'pending',
    paymentStatus: 'unpaid',
    paymentProgress: 0,
    invoiceStatus: 'none',
    paidAmount: 0,
    invoicedAmount: 0,
    remark: '口头订单',
    createdAt: '2026-04-01',
    updatedAt: '2026-04-01'
  },
  {
    id: 'hw-007',
    contractNo: 'HW2026041501',
    contractDate: '2026.4.15',
    region: 'guangxi',
    customerGroup: '利方达公司',
    customerUnit: '利方达',
    productType: 'block',
    qtyBlock: 100,
    qtyGranular: 0,
    qtyTotal: 100,
    actualShipped: 0,
    unitPrice: 4200,
    totalAmount: 420000,
    deliveryMethod: 'deliver',
    status: 'pending',
    paymentStatus: 'unpaid',
    paymentProgress: 0,
    invoiceStatus: 'none',
    paidAmount: 0,
    invoicedAmount: 0,
    remark: '块磺新订单',
    createdAt: '2026-04-15',
    updatedAt: '2026-04-15'
  }
]

// ─────────────────────────────────────────────
// Mock 延迟
// ─────────────────────────────────────────────

const mockDelay = (ms = 400) => new Promise<void>((resolve) => setTimeout(resolve, ms))

// ─────────────────────────────────────────────
// 内存态数据池
// ─────────────────────────────────────────────

class SulfurOrderStore {
  private orders: SulfurOrder[]

  constructor() {
    this.orders = JSON.parse(JSON.stringify(initMockData))
  }

  getList(): SulfurOrder[] {
    return this.orders
  }

  getById(id: string): SulfurOrder | undefined {
    return this.orders.find(o => o.id === id)
  }

  create(data: SulfurOrderInput): SulfurOrder {
    const qtyBlock = data.qtyBlock || 0
    const qtyGranular = data.qtyGranular || 0
    const totalAmount = Math.round((qtyBlock + qtyGranular) * data.unitPrice * 100) / 100

    const newOrder: SulfurOrder = {
      id: `hw-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      contractNo: data.contractNo || '',
      contractDate: data.contractDate || new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
      region: data.region || 'guangxi',
      customerGroup: data.customerGroup || '',
      customerUnit: data.customerUnit || '',
      productType: data.productType || 'granular',
      qtyBlock,
      qtyGranular,
      qtyTotal: qtyBlock + qtyGranular,
      actualShipped: 0,
      unitPrice: data.unitPrice || 0,
      totalAmount,
      deliveryMethod: data.deliveryMethod || 'self_pickup',
      status: 'pending',
      paymentStatus: 'unpaid',
      paymentProgress: data.paymentProgress || 0,
      invoiceStatus: data.invoiceStatus || 'none',
      paidAmount: data.paidAmount || 0,
      invoicedAmount: data.invoicedAmount || 0,
      remark: data.remark || '',
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10)
    }
    this.orders.push(newOrder)
    return newOrder
  }

  update(id: string, data: Partial<SulfurOrderInput>): SulfurOrder | null {
    const order = this.orders.find(o => o.id === id)
    if (!order) return null

    // 更新字段
    if (data.contractNo !== undefined) order.contractNo = data.contractNo
    if (data.contractDate !== undefined) order.contractDate = data.contractDate
    if (data.region !== undefined) order.region = data.region
    if (data.customerGroup !== undefined) order.customerGroup = data.customerGroup
    if (data.customerUnit !== undefined) order.customerUnit = data.customerUnit
    if (data.productType !== undefined) order.productType = data.productType
    if (data.qtyBlock !== undefined) order.qtyBlock = data.qtyBlock
    if (data.qtyGranular !== undefined) order.qtyGranular = data.qtyGranular
    if (data.unitPrice !== undefined) order.unitPrice = data.unitPrice
    if (data.deliveryMethod !== undefined) order.deliveryMethod = data.deliveryMethod
    if (data.paymentProgress !== undefined) order.paymentProgress = data.paymentProgress
    if (data.invoiceStatus !== undefined) order.invoiceStatus = data.invoiceStatus
    if (data.paidAmount !== undefined) order.paidAmount = data.paidAmount
    if (data.invoicedAmount !== undefined) order.invoicedAmount = data.invoicedAmount
    if (data.remark !== undefined) order.remark = data.remark

    // 重新计算
    order.qtyTotal = order.qtyBlock + order.qtyGranular
    order.totalAmount = Math.round(order.qtyTotal * order.unitPrice * 100) / 100
    order.paymentStatus = order.paymentProgress <= 0 ? 'unpaid' : order.paymentProgress >= 100 ? 'paid' : 'partial'

    order.updatedAt = new Date().toISOString().slice(0, 10)
    return order
  }

  updateStatus(id: string, status: SulfurOrder['status']): SulfurOrder | null {
    const order = this.orders.find(o => o.id === id)
    if (!order) return null
    order.status = status
    order.updatedAt = new Date().toISOString().slice(0, 10)
    return order
  }

  remove(id: string): boolean {
    const index = this.orders.findIndex(o => o.id === id)
    if (index < 0) return false
    this.orders.splice(index, 1)
    return true
  }
}

const orderStore = new SulfurOrderStore()

// ─────────────────────────────────────────────
// API 接口
// ─────────────────────────────────────────────

/**
 * 获取订单列表（支持分页 + 筛选）
 */
export async function getSulfurOrderList(params: OrderListParams = {}): Promise<ApiResponse<OrderListResult>> {
  await mockDelay(400)

  const {
    page = 1,
    pageSize = 10,
    region,
    customerGroup,
    customerUnit,
    contractNo,
    contractDateStart,
    contractDateEnd,
    productType
  } = params

  let list = orderStore.getList()

  // 筛选
  if (region) {
    list = list.filter(o => o.region === region)
  }
  if (customerGroup) {
    const kw = customerGroup.toLowerCase()
    list = list.filter(o => o.customerGroup.toLowerCase().includes(kw))
  }
  if (customerUnit) {
    const kw = customerUnit.toLowerCase()
    list = list.filter(o => o.customerUnit.toLowerCase().includes(kw))
  }
  if (contractNo) {
    list = list.filter(o => o.contractNo.toLowerCase().includes(contractNo.toLowerCase()))
  }
  if (contractDateStart) {
    list = list.filter(o => o.contractDate >= contractDateStart)
  }
  if (contractDateEnd) {
    list = list.filter(o => o.contractDate <= contractDateEnd)
  }
  if (productType) {
    list = list.filter(o => o.productType === productType)
  }

  // 统计
  const totalQty = list.reduce((s, o) => s + o.qtyTotal, 0)
  const totalAmount = list.reduce((s, o) => s + o.totalAmount, 0)
  const totalPaid = list.reduce((s, o) => s + o.paidAmount, 0)
  const totalInvoiced = list.reduce((s, o) => s + o.invoicedAmount, 0)

  // 分页
  const total = list.length
  const start = (page - 1) * pageSize
  const paged = list.slice(start, start + pageSize)

  return {
    code: 0,
    message: 'ok',
    data: {
      list: paged,
      total,
      page,
      pageSize,
      totalQty,
      totalAmount,
      totalPaid,
      totalInvoiced
    }
  }
}

/**
 * 获取单个订单详情
 */
export async function getSulfurOrderDetail(id: string): Promise<ApiResponse<SulfurOrder | null>> {
  await mockDelay(300)
  const order = orderStore.getById(id)
  if (!order) {
    return { code: 404, message: '订单不存在', data: null }
  }
  return { code: 0, message: 'ok', data: order }
}

/**
 * 新建订单
 */
export async function createSulfurOrder(data: SulfurOrderInput): Promise<ApiResponse<SulfurOrder>> {
  await mockDelay(500)
  const newOrder = orderStore.create(data)
  return { code: 0, message: '创建成功', data: newOrder }
}

/**
 * 更新订单
 */
export async function updateSulfurOrder(id: string, data: Partial<SulfurOrderInput>): Promise<ApiResponse<SulfurOrder>> {
  await mockDelay(500)
  const updated = orderStore.update(id, data)
  if (!updated) {
    return { code: 404, message: '订单不存在', data: null as any }
  }
  return { code: 0, message: '更新成功', data: updated }
}

/**
 * 更新订单状态
 */
export async function updateSulfurOrderStatus(id: string, status: SulfurOrder['status']): Promise<ApiResponse<SulfurOrder>> {
  await mockDelay(300)
  const updated = orderStore.updateStatus(id, status)
  if (!updated) {
    return { code: 404, message: '订单不存在', data: null as any }
  }
  return { code: 0, message: '更新成功', data: updated }
}

/**
 * 删除订单
 */
export async function deleteSulfurOrder(id: string): Promise<ApiResponse<void>> {
  await mockDelay(300)
  const ok = orderStore.remove(id)
  if (!ok) {
    return { code: 404, message: '订单不存在', data: undefined }
  }
  return { code: 0, message: '删除成功', data: undefined }
}
