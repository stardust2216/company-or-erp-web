// ============================================
// 订单 Store (Pinia)
// Company OA ERP - Core Business Module
// 重构：类型迁移至 @/types，Store 专注状态管理
// ============================================

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { SUBSIDIARY_IDS } from '@/constants/subsidiary'
import {
  type Order,
  type OrderCreateInput,
  type OrderUpdateInput,
  type OrderStatus,
  type OrderLine,
  type InvoiceStatus,
  sumOrderLines
} from '@/types'

// 重新导出类型，保持向后兼容
export type {
  Order,
  OrderCreateInput,
  OrderUpdateInput,
  OrderStatus,
  OrderLine,
  InvoiceStatus
}
export { sumOrderLines }

function genOrderNo(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `ORD-${y}${m}${day}-${String(Math.floor(Math.random() * 9000) + 1000)}`
}

function nowStr(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function lineId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

function mkLines(
  prefix: string,
  rows: { productName: string; spec: string; qty: number; unit: string; unitPrice: number }[]
): OrderLine[] {
  return rows.map((r, i) => ({
    id: `${prefix}-L${i + 1}`,
    productName: r.productName,
    spec: r.spec,
    qty: r.qty,
    unit: r.unit,
    unitPrice: r.unitPrice
  }))
}

// ── 种子数据（演示用，接入后端后删除）───────────────────
function seedOrders(): Order[] {
  const fixed: Order[] = [
    {
      id: 'ord-seed-01', orderNo: 'ORD-20240510-1021', subsidiaryId: 'yahui',
      customer: '亚辉塑业有限公司', amount: 0, status: 'pending', invoiceStatus: 'none',
      paymentProgress: 0, stockRemain: 0, contact: '张志远', phone: '13800138001', remark: 'PE 编织袋 5000 条',
      deliveryAddress: '广西南宁市西乡塘区物流园 A3', expectedFinishDate: '2024-05-28',
      lines: mkLines('s01', [
        { productName: 'PE 编织袋', spec: '50kg 覆膜', qty: 5000, unit: '条', unitPrice: 12.8 },
        { productName: '打包带', spec: 'PP 材质', qty: 200, unit: '卷', unitPrice: 140 }
      ]), createdAt: '2024-05-10 09:15:22'
    },
    {
      id: 'ord-seed-02', orderNo: 'ORD-20240511-2156', subsidiaryId: 'longzhou',
      customer: '龙州塑业有限公司', amount: 0, status: 'production', invoiceStatus: 'pending',
      paymentProgress: 35, stockRemain: 5200, contact: '李敏', phone: '13900139002', remark: '糖袋定制色',
      deliveryAddress: '广西崇左市龙州县工业园', expectedFinishDate: '2024-05-25',
      lines: mkLines('s02', [{ productName: '白砂糖袋', spec: '50kg 黄条', qty: 8000, unit: '条', unitPrice: 10.7 }]),
      createdAt: '2024-05-11 11:02:08'
    },
    {
      id: 'ord-seed-03', orderNo: 'ORD-20240509-0882', subsidiaryId: 'huawei',
      customer: '华维食品添加剂', amount: 0, status: 'completed', invoiceStatus: 'done',
      paymentProgress: 100, stockRemain: 0, contact: '王工', phone: '13700137003', remark: '',
      deliveryAddress: '广东省广州市黄埔区化工路 88 号', expectedFinishDate: '2024-05-15',
      lines: mkLines('s03', [{ productName: '添加剂内膜袋', spec: '25kg 食品级', qty: 6000, unit: '条', unitPrice: 7.05 }]),
      createdAt: '2024-05-09 14:40:00'
    },
    {
      id: 'ord-seed-04', orderNo: 'ORD-20240512-3301', subsidiaryId: 'yahui',
      customer: '南方包装集团', amount: 0, status: 'pending', invoiceStatus: 'none',
      paymentProgress: 10, stockRemain: 0, contact: '陈总', phone: '13600136004', remark: '加急，月底前交货',
      deliveryAddress: '深圳市宝安区松岗街道', expectedFinishDate: '2024-05-30',
      lines: mkLines('s04', [
        { productName: '集装袋', spec: '1 吨 吊带加强', qty: 400, unit: '条', unitPrice: 520 },
        { productName: '内膜', spec: '配套', qty: 400, unit: '套', unitPrice: 120 }
      ]), createdAt: '2024-05-12 08:30:15'
    },
    {
      id: 'ord-seed-05', orderNo: 'ORD-20240508-7740', subsidiaryId: 'longzhou',
      customer: '晨光农膜科技', amount: 0, status: 'shipped', invoiceStatus: 'done',
      paymentProgress: 85, stockRemain: 1200, contact: '赵磊', phone: '13500135005', remark: '已发物流单号 SF1234567890',
      deliveryAddress: '云南省昆明市官渡区', expectedFinishDate: '2024-05-18',
      lines: mkLines('s05', [{ productName: '农膜', spec: '12m 宽 0.08mm', qty: 12000, unit: '㎡', unitPrice: 5.1 }]),
      createdAt: '2024-05-08 16:22:33'
    },
    {
      id: 'ord-seed-06', orderNo: 'ORD-20240507-5512', subsidiaryId: 'guangwei',
      customer: '恒通化工有限公司', amount: 0, status: 'production', invoiceStatus: 'pending',
      paymentProgress: 50, stockRemain: 450, contact: '刘芳', phone: '13400134006', remark: '吨袋 B 型',
      deliveryAddress: '山东省淄博市临淄区', expectedFinishDate: '2024-06-02',
      lines: mkLines('s06', [{ productName: '化工吨袋', spec: 'B 型 双吊环', qty: 900, unit: '条', unitPrice: 218 }]),
      createdAt: '2024-05-07 10:05:44'
    },
    {
      id: 'ord-seed-07', orderNo: 'ORD-20240506-9901', subsidiaryId: 'huawei',
      customer: '绿野农业科技', amount: 0, status: 'completed', invoiceStatus: 'done',
      paymentProgress: 100, stockRemain: 0, contact: '周洋', phone: '13300133007', remark: '',
      deliveryAddress: '湖南省长沙市望城区', expectedFinishDate: '2024-05-12',
      lines: mkLines('s07', [{ productName: '化肥袋', spec: '50kg 彩印', qty: 12000, unit: '条', unitPrice: 2.875 }]),
      createdAt: '2024-05-06 13:18:09'
    },
    {
      id: 'ord-seed-08', orderNo: 'ORD-20240505-4410', subsidiaryId: 'guangwei',
      customer: '海联进出口', amount: 0, status: 'shipped', invoiceStatus: 'done',
      paymentProgress: 92, stockRemain: 1600, contact: '吴经理', phone: '13200132008', remark: '出口报关资料已寄',
      deliveryAddress: '上海市浦东新区外高桥', expectedFinishDate: '2024-05-20',
      lines: mkLines('s08', [
        { productName: '硫磺袋', spec: '25kg 防潮', qty: 20000, unit: '条', unitPrice: 11.2 },
        { productName: '托盘缠绕膜', spec: '50cm', qty: 100, unit: '卷', unitPrice: 180 }
      ]), createdAt: '2024-05-05 09:50:00'
    },
    {
      id: 'ord-seed-09', orderNo: 'ORD-20240504-2288', subsidiaryId: 'yahui',
      customer: '鑫达塑料制品厂', amount: 0, status: 'pending', invoiceStatus: 'none',
      paymentProgress: 0, stockRemain: 0, contact: '郑华', phone: '13100131009', remark: '样品确认后再量产',
      deliveryAddress: '广西南宁市江南区', expectedFinishDate: '2024-06-10',
      lines: mkLines('s09', [{ productName: '样品袋', spec: '按图纸', qty: 500, unit: '条', unitPrice: 57.8 }]),
      createdAt: '2024-05-04 15:33:21'
    },
    {
      id: 'ord-seed-10', orderNo: 'ORD-20240503-6677', subsidiaryId: 'longzhou',
      customer: '宏泰建材批发', amount: 0, status: 'production', invoiceStatus: 'none',
      paymentProgress: 28, stockRemain: 14400, contact: '孙杰', phone: '13000130010', remark: '',
      deliveryAddress: '贵州省贵阳市南明区', expectedFinishDate: '2024-05-22',
      lines: mkLines('s10', [{ productName: '水泥袋', spec: '50kg 阀口', qty: 20000, unit: '条', unitPrice: 3.8 }]),
      createdAt: '2024-05-03 11:11:11'
    }
  ]

  fixed.forEach((o) => { o.amount = sumOrderLines(o.lines) })

  const statuses: OrderStatus[] = ['pending', 'production', 'completed', 'shipped']
  const inv: InvoiceStatus[] = ['none', 'pending', 'done']
  const extra: Order[] = []

  for (let i = 11; i <= 62; i++) {
    const month = String((i % 9) + 1).padStart(2, '0')
    const day = String((i * 5) % 27 + 1).padStart(2, '0')
    const sub = SUBSIDIARY_IDS[i % 4]
    const lines = mkLines(`sx${i}`, [
      { productName: `标准包装袋 ${i}`, spec: '50kg 通用', qty: 2000 + (i % 8) * 500, unit: '条', unitPrice: 3.2 + (i % 5) * 0.15 }
    ])
    extra.push({
      id: `ord-seed-${i}`, orderNo: `ORD-202405${month}-${5200 + i}`,
      subsidiaryId: sub, customer: `演示客户 ${i} 有限公司`, amount: sumOrderLines(lines),
      status: statuses[i % 4], invoiceStatus: inv[i % 3],
      paymentProgress: Math.min(100, (i * 7) % 101),
      stockRemain: Math.floor((lines[0]?.qty || 0) * (Math.random() * 0.5)),
      contact: `联系人${i}`, phone: `138${String(10000000 + i).slice(-8)}`,
      remark: i % 6 === 0 ? '附合同扫描件' : '',
      deliveryAddress: '广西南宁市（演示地址）',
      expectedFinishDate: `2024-06-${String((i % 20) + 1).padStart(2, '0')}`,
      lines, createdAt: `2024-${month}-${day} ${String(8 + (i % 10)).padStart(2, '0')}:30:00`
    })
  }

  return [...fixed, ...extra]
}

// ── Store ─────────────────────────────────────
export const useOrdersStore = defineStore('orders', () => {
  const list = ref<Order[]>(seedOrders())

  function getById(id: string) { return list.value.find((o) => o.id === id) }

  function addOrder(input: OrderCreateInput) {
    const lines: OrderLine[] = input.lines.map((r, i) => ({
      id: lineId(`n${i}`), ...r
    }))
    const order: Order = {
      id: `ord-${Date.now()}`, orderNo: genOrderNo(),
      subsidiaryId: input.subsidiaryId, customer: input.customer,
      amount: sumOrderLines(lines), status: input.status,
      invoiceStatus: input.invoiceStatus,
      paymentProgress: Math.min(100, Math.max(0, input.paymentProgress)),
      stockRemain: input.lines[0]?.qty || 0,
      contact: input.contact, phone: input.phone,
      remark: input.remark || '', deliveryAddress: input.deliveryAddress || '',
      expectedFinishDate: input.expectedFinishDate || '', lines,
      createdAt: nowStr()
    }
    list.value.unshift(order)
    return order
  }

  function updateOrder(id: string, patch: OrderUpdateInput) {
    const o = list.value.find((x) => x.id === id)
    if (!o) return
    if (patch.subsidiaryId !== undefined) o.subsidiaryId = patch.subsidiaryId
    if (patch.customer !== undefined) o.customer = patch.customer
    if (patch.contact !== undefined) o.contact = patch.contact
    if (patch.phone !== undefined) o.phone = patch.phone
    if (patch.remark !== undefined) o.remark = patch.remark
    if (patch.deliveryAddress !== undefined) o.deliveryAddress = patch.deliveryAddress
    if (patch.expectedFinishDate !== undefined) o.expectedFinishDate = patch.expectedFinishDate
    if (patch.status !== undefined) o.status = patch.status
    if (patch.invoiceStatus !== undefined) o.invoiceStatus = patch.invoiceStatus
    if (patch.paymentProgress !== undefined) {
      o.paymentProgress = Math.min(100, Math.max(0, patch.paymentProgress))
    }
    if (patch.lines !== undefined) {
      o.lines = patch.lines.map((r, i) => ({
        id: (r as OrderLine).id || lineId(`u${i}`), productName: r.productName,
        spec: r.spec, qty: r.qty, unit: r.unit, unitPrice: r.unitPrice
      }))
      o.amount = sumOrderLines(o.lines)
    }
  }

  function removeOrder(id: string) {
    const i = list.value.findIndex((x) => x.id === id)
    if (i !== -1) list.value.splice(i, 1)
  }

  return { list, getById, addOrder, updateOrder, removeOrder }
})
