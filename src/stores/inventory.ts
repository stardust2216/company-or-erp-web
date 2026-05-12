// ============================================
// 库存 Store (Pinia)
// Company OA ERP - Core Business Module
// 重构：类型迁移至 @/types
// ============================================

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { type InventoryRow } from '@/types'

export type { InventoryRow }

function seed(): InventoryRow[] {
  return [
    { id: 'inv-01', subsidiaryId: 'yahui', warehouseName: '南宁中心仓', skuName: 'PE 编织袋', spec: '50kg 覆膜', stockQty: 42000, unit: '条', safeStock: 10000, orderLinkHint: '3 笔待审核订单预留约 8000 条' },
    { id: 'inv-02', subsidiaryId: 'yahui', warehouseName: '南宁中心仓', skuName: '集装袋', spec: '1 吨', stockQty: 1200, unit: '条', safeStock: 300, orderLinkHint: '生产中订单占用 200 条' },
    { id: 'inv-03', subsidiaryId: 'longzhou', warehouseName: '龙州主仓', skuName: '白砂糖袋', spec: '50kg', stockQty: 28000, unit: '条', safeStock: 8000, orderLinkHint: '生产中订单占用约 5000 条' },
    { id: 'inv-04', subsidiaryId: 'longzhou', warehouseName: '龙州分仓', skuName: '水泥袋', spec: '50kg 阀口', stockQty: 56000, unit: '条', safeStock: 15000, orderLinkHint: '与在制订单同步扣减（演示）' },
    { id: 'inv-05', subsidiaryId: 'huawei', warehouseName: '黄埔仓', skuName: '添加剂内膜袋', spec: '25kg 食品级', stockQty: 15000, unit: '条', safeStock: 5000, orderLinkHint: '已完成订单已出库' },
    { id: 'inv-06', subsidiaryId: 'guangwei', warehouseName: '华东仓', skuName: '硫磺袋', spec: '25kg 防潮', stockQty: 88000, unit: '条', safeStock: 20000, orderLinkHint: '已发货订单在途，未减本地账（演示）' },
    { id: 'inv-07', subsidiaryId: 'guangwei', warehouseName: '华东仓', skuName: '化工吨袋', spec: 'B 型', stockQty: 2100, unit: '条', safeStock: 400, orderLinkHint: '生产中订单锁定 300 条' },
    { id: 'inv-08', subsidiaryId: 'yahui', warehouseName: '柳州分仓', skuName: '打包带', spec: 'PP', stockQty: 620, unit: '卷', safeStock: 200, orderLinkHint: '安全库存以下，建议补货' }
  ]
}

export const useInventoryStore = defineStore('inventory', () => {
  const list = ref<InventoryRow[]>(seed())
  return { list }
})
