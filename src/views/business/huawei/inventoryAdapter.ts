// ============================================================================
// 华维食品 · 硫磺、磷酸库存联动适配器
// ----------------------------------------------------------------------------
// 背景：
//   需求文档要求"订单状态需与库存余量联动"。当前业务结构下：
//     · 入库台账 = 入出库明细页（Warehouse.vue，store key = huawei-purchase）
//       的 receipts 子表 —— 即"华维公司仓库实际接收入库量"。
//     · 出库台账 = 订单列表页（OrderList.vue，store key = huawei-sales）的
//       shipments 子表 —— 即"从华维公司仓库装车发出去客户的量"。
//   两侧均通过 useContractStore 提升到模块级单例 ref，因此可在适配器里
//   直接读取并派生为响应式的 computed 库存指标。
//
//   适配器只读不写，业务侧用 const inv = usePhosphoricAcidInventory()
//   即可拿到 { totalIn, totalOut, balance } 三个 computed Ref。
//
// 关键设计 —— 为什么使用 peekContractStore 而不是 useContractStore：
//   useContractStore(key, factory) 在 store 首次访问时会立刻执行 factory
//   并把结果 ref 注册到模块级 Map。如果适配器在业务 SFC 之前调用了
//   useContractStore('huawei-purchase', () => [])，那么"采购"store 会
//   被永久注册为空数组；后续 Warehouse.vue 再调用 useContractStore
//   并传入真正种子时，Map 命中、工厂直接跳过 —— 业务页面数据被吞掉。
//
//   peekContractStore 只查不建，未注册时返回 undefined：
//     · 业务页面尚未挂载过 → 派生指标自动按 0 计算，UI 不会爆栈；
//     · 业务页面挂载后 → 共享 ref 已经存在，computed 立即生效，跨页联动。
// ============================================================================

import { computed, type ComputedRef } from 'vue'
import { peekContractStore } from './contractStore'

/** 适配器的最小返回结构 —— 让上层只关心三项核心指标即可。 */
export interface PhosphoricAcidInventory {
  /** 累计入库量（吨）= Σ 入出库明细页 receipts.qty */
  totalIn: ComputedRef<number>
  /** 累计出库量（吨）= Σ 订单列表页 shipments.qty */
  totalOut: ComputedRef<number>
  /** 当前库存余量（吨）= totalIn - totalOut（允许出现负数，提示业务异常） */
  balance: ComputedRef<number>
}

/**
 * 适配器入口：派生磷酸当前库存余量。
 *
 * 约定：
 *   - 入库 store 的合同结构包含 `receipts: { qty: number }[]`；
 *   - 出库 store 的合同结构包含 `shipments: { qty: number }[]`；
 *   - 不做品类拆分（华维食品当前只经营磷酸一类原料）。
 *
 * @returns 三个 computed —— 在 setup 内直接 `.value` 读取。
 */
export function usePhosphoricAcidInventory(): PhosphoricAcidInventory {
  const totalIn = computed(() => {
    // 入库侧：取入出库明细页（采购合同）的共享 ref；尚未注册视为 0。
    const purchases = peekContractStore<{ receipts: { qty?: number }[] }>('huawei-purchase')
    if (!purchases) return 0
    return purchases.value.reduce(
      (sum, c) => sum + (c.receipts?.reduce((s, r) => s + (r.qty || 0), 0) ?? 0),
      0
    )
  })

  const totalOut = computed(() => {
    // 出库侧：取订单列表页（销售合同）的共享 ref；尚未注册视为 0。
    const sales = peekContractStore<{ shipments: { qty?: number }[] }>('huawei-sales')
    if (!sales) return 0
    return sales.value.reduce(
      (sum, c) => sum + (c.shipments?.reduce((s, sh) => s + (sh.qty || 0), 0) ?? 0),
      0
    )
  })

  const balance = computed(() => totalIn.value - totalOut.value)

  return { totalIn, totalOut, balance }
}
