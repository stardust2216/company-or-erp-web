// ============================================
// 龙州塑业 - 糖袋订单 Store (Pinia)
// Company OA ERP - Longzhou Business Module
// ============================================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  SugarBagOrder,
  SugarBagOrderLine,
  SugarBagDelivery,
  SugarBagCarrier,
  SugarBagOrderCreateInput,
  SugarBagOrderUpdateInput,
  SugarBagOrderFilter,
  SugarBagOrderSummary
} from '@/types/order'

export type {
  SugarBagOrder,
  SugarBagOrderLine,
  SugarBagDelivery,
  SugarBagCarrier,
  SugarBagOrderFilter,
  SugarBagOrderSummary
}

function genOrderNo(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `LZD-${y}${m}-${String(Math.floor(Math.random() * 9000) + 1000)}`
}

function lineId(): string {
  return `LZL-${Math.random().toString(36).slice(2, 9)}`
}

function nowStr(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

// ── Mock 种子数据 ─────────────────────────────
function seedOrders(): SugarBagOrder[] {
  const orders: SugarBagOrder[] = [
    {
      id: 'lz-ord-001',
      orderNo: 'LZD-202604-1001',
      subsidiaryId: 'longzhou',
      groupName: 'A集团',
      customer: 'A糖业有限公司',
      contractDate: '2026-04-30',
      customerContractSeq: 1,
      contractNo: '2026XXXX01',
      lines: [
        {
          id: 'lz-ord-001-L1',
          productSeq: 1,
          brandName: '嘉墟',
          productName: '一级白砂糖',
          outerSpec: { outerSize: '66*96', outerWeight: 100, warpTension: 0, weftTension: 0, density: '' },
          clothSpec: { clothSize: '', clothWeight: 0 },
          innerSpec: { innerSize: '69*108', innerWeight: 35, pressure: '低压', material: '', color: '' },
          otherSpec: { totalWeight: 135, bagMouthNormal: '是', bagMouthFlip: '', bagMouthRing: '', bagBottomConnected: '是', bagBottomNonConnected: '', bagBottomSingleFold: '', bagBottomDoubleFold: '', printSingle: '是', printDouble: '' },
          qtyPackages: 500, qtySets: 150000, qtyWeight: 20.25, unitPrice: 0.9, amount: 135000
        }
      ],
      deliveries: [
        { deliverySeq: 1, deliveryDate: '2026-05-10', deliveryPackages: 100, deliverySets: 30000, deliveryWeight: 4.05 }
      ],
      carrier: { carrierName: '龙州物流', vehicleNumber: '桂F12345', driverName: '张师傅' },
      totalQty: 150000, totalAmount: 135000, shippedQty: 30000, stockRemain: 120000,
      status: 'production', invoiceStatus: 'none', paymentProgress: 20, remark: '分批交货',
      createdAt: '2026-04-30 10:00:00'
    },
    {
      id: 'lz-ord-002',
      orderNo: 'LZD-202604-1002',
      subsidiaryId: 'longzhou',
      groupName: 'A集团',
      customer: 'A糖业有限公司',
      contractDate: '2026-04-30',
      customerContractSeq: 2,
      contractNo: '2026XXXX01',
      lines: [
        {
          id: 'lz-ord-002-L1',
          productSeq: 2,
          brandName: '嘉墟',
          productName: '二级白砂糖',
          outerSpec: { outerSize: '66*96', outerWeight: 100, warpTension: 0, weftTension: 0, density: '' },
          clothSpec: { clothSize: '', clothWeight: 0 },
          innerSpec: { innerSize: '69*108', innerWeight: 35, pressure: '低压', material: '', color: '' },
          otherSpec: { totalWeight: 100, bagMouthNormal: '是', bagMouthFlip: '', bagMouthRing: '', bagBottomConnected: '是', bagBottomNonConnected: '', bagBottomSingleFold: '', bagBottomDoubleFold: '', printSingle: '是', printDouble: '' },
          qtyPackages: 300, qtySets: 90000, qtyWeight: 12.15, unitPrice: 0.85, amount: 76500
        }
      ],
      deliveries: [],
      totalQty: 90000, totalAmount: 76500, shippedQty: 0, stockRemain: 90000,
      status: 'pending', invoiceStatus: 'none', paymentProgress: 0, remark: '',
      createdAt: '2026-04-30 10:30:00'
    },
    {
      id: 'lz-ord-003',
      orderNo: 'LZD-202605-2001',
      subsidiaryId: 'longzhou',
      groupName: 'B集团',
      customer: 'B糖业有限公司',
      contractDate: '2026-05-15',
      customerContractSeq: 1,
      contractNo: '2026XXXX02',
      lines: [
        {
          id: 'lz-ord-003-L1',
          productSeq: 1,
          brandName: '凤凰',
          productName: '一级白砂糖',
          outerSpec: { outerSize: '68*98', outerWeight: 105, warpTension: 0, weftTension: 0, density: '' },
          clothSpec: { clothSize: '', clothWeight: 0 },
          innerSpec: { innerSize: '71*110', innerWeight: 38, pressure: '高压', material: '', color: '' },
          otherSpec: { totalWeight: 143, bagMouthNormal: '是', bagMouthFlip: '', bagMouthRing: '', bagBottomConnected: '', bagBottomNonConnected: '是', bagBottomSingleFold: '是', bagBottomDoubleFold: '', printSingle: '', printDouble: '是' },
          qtyPackages: 600, qtySets: 180000, qtyWeight: 25.74, unitPrice: 0.92, amount: 165600
        }
      ],
      deliveries: [
        { deliverySeq: 1, deliveryDate: '2026-05-20', deliveryPackages: 200, deliverySets: 60000, deliveryWeight: 8.58 }
      ],
      carrier: { carrierName: '崇左运输', vehicleNumber: '桂F67890', driverName: '李师傅' },
      totalQty: 180000, totalAmount: 165600, shippedQty: 60000, stockRemain: 120000,
      status: 'shipped', invoiceStatus: 'pending', paymentProgress: 40, remark: '首批已发',
      createdAt: '2026-05-15 09:00:00'
    },
    {
      id: 'lz-ord-004',
      orderNo: 'LZD-202605-2002',
      subsidiaryId: 'longzhou',
      groupName: 'C集团',
      customer: 'C糖业有限公司',
      contractDate: '2026-05-18',
      customerContractSeq: 1,
      contractNo: '2026XXXX03',
      lines: [
        {
          id: 'lz-ord-004-L1',
          productSeq: 1,
          brandName: '金穗',
          productName: '优级白砂糖',
          outerSpec: { outerSize: '65*95', outerWeight: 98, warpTension: 0, weftTension: 0, density: '' },
          clothSpec: { clothSize: '', clothWeight: 0 },
          innerSpec: { innerSize: '68*106', innerWeight: 32, pressure: '低压', material: '', color: '' },
          otherSpec: { totalWeight: 130, bagMouthNormal: '是', bagMouthFlip: '', bagMouthRing: '', bagBottomConnected: '是', bagBottomNonConnected: '', bagBottomSingleFold: '', bagBottomDoubleFold: '', printSingle: '是', printDouble: '' },
          qtyPackages: 400, qtySets: 120000, qtyWeight: 15.6, unitPrice: 0.88, amount: 105600
        }
      ],
      deliveries: [
        { deliverySeq: 1, deliveryDate: '2026-05-25', deliveryPackages: 400, deliverySets: 120000, deliveryWeight: 15.6 }
      ],
      carrier: { carrierName: '南宁物流', vehicleNumber: '桂A11111', driverName: '王师傅' },
      totalQty: 120000, totalAmount: 105600, shippedQty: 120000, stockRemain: 0,
      status: 'invoiced', invoiceStatus: 'done', paymentProgress: 60, remark: '已全部发货',
      createdAt: '2026-05-18 14:00:00'
    },
    {
      id: 'lz-ord-005',
      orderNo: 'LZD-202605-2003',
      subsidiaryId: 'longzhou',
      groupName: 'D集团',
      customer: 'D糖业有限公司',
      contractDate: '2026-05-20',
      customerContractSeq: 1,
      contractNo: '2026XXXX04',
      lines: [
        {
          id: 'lz-ord-005-L1',
          productSeq: 1,
          brandName: '银鸥',
          productName: '一级白砂糖',
          outerSpec: { outerSize: '67*97', outerWeight: 102, warpTension: 0, weftTension: 0, density: '' },
          clothSpec: { clothSize: '', clothWeight: 0 },
          innerSpec: { innerSize: '70*108', innerWeight: 36, pressure: '低压', material: '', color: '' },
          otherSpec: { totalWeight: 138, bagMouthNormal: '是', bagMouthFlip: '', bagMouthRing: '', bagBottomConnected: '是', bagBottomNonConnected: '', bagBottomSingleFold: '', bagBottomDoubleFold: '', printSingle: '是', printDouble: '' },
          qtyPackages: 550, qtySets: 165000, qtyWeight: 22.77, unitPrice: 0.91, amount: 150150
        }
      ],
      deliveries: [],
      totalQty: 165000, totalAmount: 150150, shippedQty: 0, stockRemain: 165000,
      status: 'pending', invoiceStatus: 'none', paymentProgress: 0, remark: '新签合同',
      createdAt: '2026-05-20 11:00:00'
    }
  ]

  return orders
}

// ── Store ─────────────────────────────────────
export const useLongzhouOrdersStore = defineStore('longzhouOrders', () => {
  const list = ref<SugarBagOrder[]>(seedOrders())

  // 统计汇总
  const summary = computed<SugarBagOrderSummary>(() => {
    const s: SugarBagOrderSummary = {
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

  function filter(f: SugarBagOrderFilter) {
    return list.value.filter(o => {
      if (f.groupName && !o.groupName.includes(f.groupName)) return false
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

  function addOrder(input: SugarBagOrderCreateInput): SugarBagOrder {
    const lines: SugarBagOrderLine[] = input.lines.map((r, i) => ({
      id: lineId(),
      productSeq: i + 1,
      brandName: r.brandName,
      productName: r.productName,
      outerSpec: r.outerSpec,
      clothSpec: r.clothSpec,
      innerSpec: r.innerSpec,
      otherSpec: r.otherSpec,
      qtyPackages: r.qtyPackages,
      qtySets: r.qtySets,
      qtyWeight: r.qtyWeight,
      unitPrice: r.unitPrice,
      amount: r.amount
    }))
    const totalQty = lines.reduce((s, l) => s + l.qtySets, 0)
    const totalAmount = lines.reduce((s, l) => s + l.amount, 0)

    const order: SugarBagOrder = {
      id: `lz-ord-${Date.now()}`, orderNo: genOrderNo(),
      subsidiaryId: 'longzhou', groupName: input.groupName, customer: input.customer,
      contractDate: input.contractDate, customerContractSeq: input.customerContractSeq,
      contractNo: input.contractNo, lines, deliveries: [],
      carrier: input.carrier,
      totalQty, totalAmount, shippedQty: 0, stockRemain: totalQty,
      status: 'pending', invoiceStatus: 'none', paymentProgress: 0,
      remark: input.remark || '', createdAt: nowStr()
    }
    list.value.unshift(order)
    return order
  }

  function updateOrder(id: string, patch: SugarBagOrderUpdateInput) {
    const o = list.value.find(x => x.id === id)
    if (!o) return
    if (patch.groupName !== undefined) o.groupName = patch.groupName
    if (patch.customer !== undefined) o.customer = patch.customer
    if (patch.status !== undefined) o.status = patch.status
    if (patch.invoiceStatus !== undefined) o.invoiceStatus = patch.invoiceStatus
    if (patch.paymentProgress !== undefined) o.paymentProgress = Math.min(100, Math.max(0, patch.paymentProgress))
    if (patch.deliveries !== undefined) {
      o.deliveries = patch.deliveries
      o.shippedQty = patch.deliveries.reduce((s, d) => s + d.deliverySets, 0)
      o.stockRemain = o.totalQty - o.shippedQty
    }
    if (patch.remark !== undefined) o.remark = patch.remark
  }

  function addDelivery(orderId: string, delivery: SugarBagDelivery) {
    const o = list.value.find(x => x.id === orderId)
    if (!o) return
    o.deliveries.push(delivery)
    o.shippedQty = o.deliveries.reduce((s, d) => s + d.deliverySets, 0)
    o.stockRemain = o.totalQty - o.shippedQty
  }

  function removeOrder(id: string) {
    const i = list.value.findIndex(x => x.id === id)
    if (i !== -1) list.value.splice(i, 1)
  }

  return { list, summary, getById, filter, addOrder, updateOrder, addDelivery, removeOrder }
})
