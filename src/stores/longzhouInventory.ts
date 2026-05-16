// ============================================
// 龙州塑业 - 库存 Store (Pinia)
// Company OA ERP - Longzhou Business Module
// ============================================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  SugarBagClothInventory,
  SugarBagClothInventoryFilter,
  SugarBagClothInventorySummary,
  SugarBagProductInventory,
  SugarBagInventoryLog
} from '@/types/inventory'

export type {
  SugarBagClothInventory,
  SugarBagClothInventoryFilter,
  SugarBagClothInventorySummary,
  SugarBagProductInventory,
  SugarBagInventoryLog
}

function nowStr(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

// ── Mock 种子数据 - 布筒库存 ───────────────────
function seedClothInventory(): SugarBagClothInventory[] {
  return [
    {
      id: 'lz-cloth-001', subsidiaryId: 'longzhou', reportDate: '2026-05-26',
      clothSpec: '66*45', customerInfo: 'A糖业', machineNumber: '#1/#2/#3', machineCount: 3,
      inboundClothQty: 4500, inboundPrintingQty: 3200, outboundQty: 2800, outboundLength: 168000,
      prevDayQty: 3200, prevDayLength: 192000, todayQty: 4900, todayLength: 294000,
      storageLocation: '龙州仓库A区', remark: ''
    },
    {
      id: 'lz-cloth-002', subsidiaryId: 'longzhou', reportDate: '2026-05-26',
      clothSpec: '68*48', customerInfo: 'B糖业', machineNumber: '#4/#5', machineCount: 2,
      inboundClothQty: 3200, inboundPrintingQty: 2100, outboundQty: 1800, outboundLength: 108000,
      prevDayQty: 2400, prevDayLength: 144000, todayQty: 3800, todayLength: 228000,
      storageLocation: '龙州仓库B区', remark: ''
    },
    {
      id: 'lz-cloth-003', subsidiaryId: 'longzhou', reportDate: '2026-05-26',
      clothSpec: '65*42', customerInfo: 'C糖业', machineNumber: '#6', machineCount: 1,
      inboundClothQty: 1800, inboundPrintingQty: 1200, outboundQty: 1500, outboundLength: 90000,
      prevDayQty: 1800, prevDayLength: 108000, todayQty: 2100, todayLength: 126000,
      storageLocation: '龙州仓库C区', remark: ''
    },
    {
      id: 'lz-cloth-004', subsidiaryId: 'longzhou', reportDate: '2026-05-26',
      clothSpec: '67*46', customerInfo: 'D糖业', machineNumber: '#7/#8/#9', machineCount: 3,
      inboundClothQty: 5200, inboundPrintingQty: 3800, outboundQty: 3200, outboundLength: 192000,
      prevDayQty: 2800, prevDayLength: 168000, todayQty: 4800, todayLength: 288000,
      storageLocation: '龙州仓库D区', remark: ''
    },
    {
      id: 'lz-cloth-005', subsidiaryId: 'longzhou', reportDate: '2026-05-25',
      clothSpec: '66*45', customerInfo: 'A糖业', machineNumber: '#1/#2/#3', machineCount: 3,
      inboundClothQty: 4200, inboundPrintingQty: 3000, outboundQty: 2500, outboundLength: 150000,
      prevDayQty: 3000, prevDayLength: 180000, todayQty: 4700, todayLength: 282000,
      storageLocation: '龙州仓库A区', remark: ''
    }
  ]
}

// ── Mock 种子数据 - 成品库存 ───────────────────
function seedProductInventory(): SugarBagProductInventory[] {
  return [
    {
      id: 'lz-prod-001', subsidiaryId: 'longzhou', warehouseName: '龙州主仓',
      productName: '一级白砂糖袋', outerSpec: '66*96', brandName: '嘉墟',
      stockQty: 120000, unit: '套', safeStock: 30000, reservedQty: 15000,
      customer: 'A糖业有限公司', orderLinkHint: '订单 LZD-202604-1001 生产中'
    },
    {
      id: 'lz-prod-002', subsidiaryId: 'longzhou', warehouseName: '龙州主仓',
      productName: '二级白砂糖袋', outerSpec: '66*96', brandName: '嘉墟',
      stockQty: 90000, unit: '套', safeStock: 25000, reservedQty: 0,
      customer: 'A糖业有限公司', orderLinkHint: '待发货'
    },
    {
      id: 'lz-prod-003', subsidiaryId: 'longzhou', warehouseName: '龙州分仓',
      productName: '一级白砂糖袋', outerSpec: '68*98', brandName: '凤凰',
      stockQty: 110000, unit: '套', safeStock: 28000, reservedQty: 8000,
      customer: 'B糖业有限公司', orderLinkHint: '订单 LZD-202605-2001 部分发货'
    },
    {
      id: 'lz-prod-004', subsidiaryId: 'longzhou', warehouseName: '龙州分仓',
      productName: '优级白砂糖袋', outerSpec: '65*95', brandName: '金穗',
      stockQty: 0, unit: '套', safeStock: 20000, reservedQty: 0,
      customer: 'C糖业有限公司', orderLinkHint: '已全部发货'
    }
  ]
}

// ── Store ─────────────────────────────────────
export const useLongzhouInventoryStore = defineStore('longzhouInventory', () => {
  const clothInventory = ref<SugarBagClothInventory[]>(seedClothInventory())
  const productInventory = ref<SugarBagProductInventory[]>(seedProductInventory())
  const inventoryLogs = ref<SugarBagInventoryLog[]>([])

  // 布筒库存统计
  const clothSummary = computed<SugarBagClothInventorySummary | null>(() => {
    if (clothInventory.value.length === 0) return null
    const latest = clothInventory.value[0]
    return {
      reportDate: latest.reportDate,
      totalPrevDayQty: clothInventory.value.reduce((s, i) => s + i.prevDayQty, 0),
      totalPrevDayLength: clothInventory.value.reduce((s, i) => s + i.prevDayLength, 0),
      totalInboundClothQty: clothInventory.value.reduce((s, i) => s + i.inboundClothQty, 0),
      totalInboundPrintingQty: clothInventory.value.reduce((s, i) => s + i.inboundPrintingQty, 0),
      totalOutboundQty: clothInventory.value.reduce((s, i) => s + i.outboundQty, 0),
      totalOutboundLength: clothInventory.value.reduce((s, i) => s + i.outboundLength, 0),
      totalTodayQty: clothInventory.value.reduce((s, i) => s + i.todayQty, 0),
      totalTodayLength: clothInventory.value.reduce((s, i) => s + i.todayLength, 0)
    }
  })

  // 成品库存预警
  const lowStockItems = computed(() =>
    productInventory.value.filter(i => i.stockQty < i.safeStock)
  )

  function filterClothInventory(f: SugarBagClothInventoryFilter) {
    return clothInventory.value.filter(i => {
      if (f.reportDate && i.reportDate !== f.reportDate) return false
      if (f.clothSpec && !i.clothSpec.includes(f.clothSpec)) return false
      if (f.customerInfo && !i.customerInfo.includes(f.customerInfo)) return false
      return true
    })
  }

  function addClothInventory(data: Omit<SugarBagClothInventory, 'id'>): SugarBagClothInventory {
    const item: SugarBagClothInventory = { ...data, id: `lz-cloth-${Date.now()}` }
    clothInventory.value.unshift(item)
    return item
  }

  function addInventoryLog(data: Omit<SugarBagInventoryLog, 'id' | 'createdAt'>): SugarBagInventoryLog {
    const log: SugarBagInventoryLog = { ...data, id: `lz-log-${Date.now()}`, createdAt: nowStr() }
    inventoryLogs.value.unshift(log)
    return log
  }

  function updateProductStock(id: string, changeQty: number, changeType: SugarBagInventoryLog['changeType']) {
    const item = productInventory.value.find(x => x.id === id)
    if (!item) return
    const beforeQty = item.stockQty
    item.stockQty = Math.max(0, item.stockQty + changeQty)
    item.reservedQty = Math.max(0, item.reservedQty + (changeType === 'shipment' ? -changeQty : changeQty))

    // 记录日志
    addInventoryLog({
      subsidiaryId: 'longzhou', orderId: '', productSeq: 0, productName: item.productName,
      changeType, changeQty, beforeQty, afterQty: item.stockQty, operator: 'system', remark: ''
    })
  }

  return {
    clothInventory, productInventory, inventoryLogs, clothSummary, lowStockItems,
    filterClothInventory, addClothInventory, addInventoryLog, updateProductStock
  }
})
