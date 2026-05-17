// ============================================
// 亚辉塑业 - 编织袋/集装袋订单 Store (Pinia)
// Company OA ERP - Yahui Business Module
// ============================================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  WovenBagOrder,
  WovenBagOrderLine,
  WovenBagOrderCreateInput,
  WovenBagOrderUpdateInput,
  WovenBagOrderFilter,
  WovenBagOrderSummary
} from '@/types/order'

export type {
  WovenBagOrder,
  WovenBagOrderLine,
  WovenBagOrderFilter,
  WovenBagOrderSummary
}

function genOrderNo(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `YHD-${y}${m}-${String(Math.floor(Math.random() * 9000) + 1000)}`
}

function lineId(): string {
  return `YHL-${Math.random().toString(36).slice(2, 9)}`
}

function nowStr(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

// ── Mock 种子数据 ─────────────────────────────
function seedOrders(): WovenBagOrder[] {
  const orders: WovenBagOrder[] = [
    {
      id: 'yh-ord-001',
      orderNo: 'YHD-202604-1001',
      subsidiaryId: 'yahui',
      customer: '浙江化工集团有限公司',
      contact: '李经理',
      phone: '0571-88886666',
      deliveryAddress: '浙江省杭州市余杭区化工路88号',
      contractNo: 'YH-2026-001',
      contractDate: '2026-04-15',
      lines: [
        {
          id: 'yh-ord-001-L1',
          productSeq: 1,
          brandName: '亚辉',
          productName: '编织袋（普通）',
          spec: {
            bagType: '编织袋', width: 58, length: 95, gramWeight: 80,
            material: '聚丙烯PP', color: '白色', lamination: '无',
            printColors: 2, printContent: '公司Logo+产品名称',
            warpTension: 500, weftTension: 400, bottomStyle: '缝底', mouthStyle: '普通'
          },
          qty: 50000, unit: '条', unitPrice: 1.2, amount: 60000
        },
        {
          id: 'yh-ord-001-L2',
          productSeq: 2,
          brandName: '亚辉',
          productName: '方底阀口袋',
          spec: {
            bagType: '方底阀口', width: 50, length: 80, gramWeight: 90,
            material: '聚丙烯PP', color: '白色', lamination: '单面覆膜',
            printColors: 3, printContent: '注册商标+规格参数',
            warpTension: 550, weftTension: 450, bottomStyle: '粘合', mouthStyle: '阀口'
          },
          qty: 30000, unit: '条', unitPrice: 1.8, amount: 54000
        }
      ],
      totalQty: 80000, totalAmount: 114000, shippedQty: 30000, stockRemain: 50000,
      expectedFinishDate: '2026-05-30',
      status: 'production', invoiceStatus: 'none', paymentProgress: 30, remark: '首批3万条已发',
      createdAt: '2026-04-15 09:00:00'
    },
    {
      id: 'yh-ord-002',
      orderNo: 'YHD-202605-1001',
      subsidiaryId: 'yahui',
      customer: '江苏建材贸易公司',
      contact: '王总',
      phone: '025-76543210',
      deliveryAddress: '江苏省南京市江宁区建材大道128号',
      contractNo: 'YH-2026-002',
      contractDate: '2026-05-10',
      lines: [
        {
          id: 'yh-ord-002-L1',
          productSeq: 1,
          brandName: '亚辉',
          productName: '集装袋（导电型）',
          spec: {
            bagType: '集装袋', width: 90, length: 110, gramWeight: 180,
            material: '聚丙烯PP+导电丝', color: '灰色', lamination: '双面覆膜',
            printColors: 4, printContent: 'UN标记+产品信息+警示标识',
            warpTension: 2000, weftTension: 1800, bottomStyle: '缝底', mouthStyle: '阀口'
          },
          qty: 5000, unit: '条', unitPrice: 28.0, amount: 140000
        }
      ],
      totalQty: 5000, totalAmount: 140000, shippedQty: 0, stockRemain: 5000,
      expectedFinishDate: '2026-06-20',
      status: 'pending', invoiceStatus: 'none', paymentProgress: 0, remark: '集装袋需定制模具',
      createdAt: '2026-05-10 14:30:00'
    },
    {
      id: 'yh-ord-003',
      orderNo: 'YHD-202605-1002',
      subsidiaryId: 'yahui',
      customer: '广东塑料制品厂',
      contact: '陈主管',
      phone: '020-34567890',
      deliveryAddress: '广东省佛山市顺德区塑料工业园A座',
      contractNo: 'YH-2026-003',
      contractDate: '2026-05-18',
      lines: [
        {
          id: 'yh-ord-003-L1',
          productSeq: 1,
          brandName: '亚辉',
          productName: '编织袋（覆膜）',
          spec: {
            bagType: '编织袋', width: 60, length: 100, gramWeight: 95,
            material: '聚丙烯PP', color: '蓝色', lamination: '单面覆膜',
            printColors: 2, printContent: '品牌标识',
            warpTension: 520, weftTension: 420, bottomStyle: '热切', mouthStyle: '折边'
          },
          qty: 80000, unit: '条', unitPrice: 1.5, amount: 120000
        }
      ],
      totalQty: 80000, totalAmount: 120000, shippedQty: 80000, stockRemain: 0,
      expectedFinishDate: '2026-06-01',
      status: 'completed', invoiceStatus: 'done', paymentProgress: 100, remark: '全部交货完成',
      createdAt: '2026-05-18 10:00:00'
    },
    {
      id: 'yh-ord-004',
      orderNo: 'YHD-202605-1003',
      subsidiaryId: 'yahui',
      customer: '福建食品包装公司',
      contact: '张经理',
      phone: '0591-87654321',
      deliveryAddress: '福建省福州市仓山区工业路200号',
      contractNo: 'YH-2026-004',
      contractDate: '2026-05-22',
      lines: [
        {
          id: 'yh-ord-004-L1',
          productSeq: 1,
          brandName: '亚辉',
          productName: '编织袋（食品级）',
          spec: {
            bagType: '编织袋', width: 55, length: 90, gramWeight: 75,
            material: '聚丙烯PP（食品级）', color: '白色', lamination: '无',
            printColors: 1, printContent: '食品级标识',
            warpTension: 480, weftTension: 380, bottomStyle: '缝底', mouthStyle: '普通'
          },
          qty: 60000, unit: '条', unitPrice: 1.1, amount: 66000
        }
      ],
      totalQty: 60000, totalAmount: 66000, shippedQty: 20000, stockRemain: 40000,
      expectedFinishDate: '2026-06-15',
      status: 'shipped', invoiceStatus: 'pending', paymentProgress: 50, remark: '分批交货',
      createdAt: '2026-05-22 11:30:00'
    },
    {
      id: 'yh-ord-005',
      orderNo: 'YHD-202605-1004',
      subsidiaryId: 'yahui',
      customer: '山东化肥股份有限公司',
      contact: '刘工',
      phone: '0531-99887766',
      deliveryAddress: '山东省济南市历下区化工中路66号',
      contractNo: 'YH-2026-005',
      contractDate: '2026-05-25',
      lines: [
        {
          id: 'yh-ord-005-L1',
          productSeq: 1,
          brandName: '亚辉',
          productName: '方底阀口袋（耐高温）',
          spec: {
            bagType: '方底阀口', width: 52, length: 85, gramWeight: 100,
            material: '聚丙烯PP+耐高温母料', color: '黄色', lamination: '单面覆膜',
            printColors: 3, printContent: '耐高温标识+产品名称',
            warpTension: 580, weftTension: 480, bottomStyle: '粘合', mouthStyle: '阀口'
          },
          qty: 40000, unit: '条', unitPrice: 2.2, amount: 88000
        }
      ],
      totalQty: 40000, totalAmount: 88000, shippedQty: 0, stockRemain: 40000,
      expectedFinishDate: '2026-07-10',
      status: 'pending', invoiceStatus: 'none', paymentProgress: 0, remark: '新签订单',
      createdAt: '2026-05-25 16:00:00'
    }
  ]

  return orders
}

// ── Store ─────────────────────────────────────
export const useYahuiOrdersStore = defineStore('yahuiOrders', () => {
  const list = ref<WovenBagOrder[]>(seedOrders())

  // 统计汇总
  const summary = computed<WovenBagOrderSummary>(() => {
    const s: WovenBagOrderSummary = {
      totalOrders: list.value.length,
      totalQty: 0, totalAmount: 0, shippedQty: 0, stockRemain: 0,
      pendingCount: 0, productionCount: 0, shippedCount: 0, invoicedCount: 0, completedCount: 0
    }
    list.value.forEach(o => {
      s.totalQty += o.totalQty
      s.totalAmount += o.totalAmount
      s.shippedQty += o.shippedQty
      s.stockRemain += o.stockRemain
      switch (o.status) {
        case 'pending': s.pendingCount++; break
        case 'production': s.productionCount++; break
        case 'shipped': s.shippedCount++; break
        case 'invoiced': s.invoicedCount++; break
        case 'completed': s.completedCount++; break
      }
    })
    return s
  })

  function getById(id: string) {
    return list.value.find(o => o.id === id)
  }

  function filter(f: WovenBagOrderFilter) {
    return list.value.filter(o => {
      if (f.customer && !o.customer.includes(f.customer)) return false
      if (f.contractNo && !o.contractNo.includes(f.contractNo)) return false
      if (f.status && o.status !== f.status) return false
      if (f.dateRange) {
        const d = o.contractDate
        if (d < f.dateRange[0] || d > f.dateRange[1]) return false
      }
      return true
    })
  }

  function addOrder(input: WovenBagOrderCreateInput): WovenBagOrder {
    const lines: WovenBagOrderLine[] = input.lines.map((r, i) => ({
      id: lineId(),
      productSeq: i + 1,
      brandName: r.brandName,
      productName: r.productName,
      spec: r.spec,
      qty: r.qty,
      unit: r.unit,
      unitPrice: r.unitPrice,
      amount: r.amount
    }))
    const totalQty = lines.reduce((s, l) => s + l.qty, 0)
    const totalAmount = lines.reduce((s, l) => s + l.amount, 0)

    const order: WovenBagOrder = {
      id: `yh-ord-${Date.now()}`, orderNo: genOrderNo(),
      subsidiaryId: 'yahui',
      customer: input.customer, contact: input.contact, phone: input.phone,
      deliveryAddress: input.deliveryAddress,
      contractNo: input.contractNo, contractDate: input.contractDate,
      lines, totalQty, totalAmount, shippedQty: 0, stockRemain: totalQty,
      expectedFinishDate: input.expectedFinishDate,
      status: 'pending', invoiceStatus: 'none', paymentProgress: 0,
      remark: input.remark || '', createdAt: nowStr()
    }
    list.value.unshift(order)
    return order
  }

  function updateOrder(id: string, patch: WovenBagOrderUpdateInput) {
    const o = list.value.find(x => x.id === id)
    if (!o) return
    if (patch.customer !== undefined) o.customer = patch.customer
    if (patch.contact !== undefined) o.contact = patch.contact
    if (patch.phone !== undefined) o.phone = patch.phone
    if (patch.deliveryAddress !== undefined) o.deliveryAddress = patch.deliveryAddress
    if (patch.contractNo !== undefined) o.contractNo = patch.contractNo
    if (patch.contractDate !== undefined) o.contractDate = patch.contractDate
    if (patch.expectedFinishDate !== undefined) o.expectedFinishDate = patch.expectedFinishDate
    if (patch.status !== undefined) o.status = patch.status
    if (patch.invoiceStatus !== undefined) o.invoiceStatus = patch.invoiceStatus
    if (patch.paymentProgress !== undefined) o.paymentProgress = Math.min(100, Math.max(0, patch.paymentProgress))
    if (patch.lines !== undefined) {
      o.lines = patch.lines
      o.totalQty = patch.lines.reduce((s, l) => s + l.qty, 0)
      o.totalAmount = patch.lines.reduce((s, l) => s + l.amount, 0)
    }
    if (patch.remark !== undefined) o.remark = patch.remark
  }

  function removeOrder(id: string) {
    const i = list.value.findIndex(x => x.id === id)
    if (i !== -1) list.value.splice(i, 1)
  }

  return { list, summary, getById, filter, addOrder, updateOrder, removeOrder }
})
