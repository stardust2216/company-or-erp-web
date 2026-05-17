// ============================================================================
// 合同共享存储（采购 / 销售）
// ----------------------------------------------------------------------------
// 背景：
//   主表（SalesContracts.vue / PurchaseContracts.vue）与"合同详情"独立路由
//   实际上是同一份 SFC 被路由命中两次（route.name 不同），TagsView 因此为
//   每一个合同 id 单独追加一个标签页，业务方在新标签里也能看到完整列表态
//   的编辑能力。但 `<script setup>` 顶层的 `const contracts = ref([...])`
//   在每个组件实例里都会被独立执行，导致：
//     · 列表页修改合同 → 详情页那份 contracts 仍然是初始 seed；
//     · 详情页新增 / 删除子记录 → 列表页看不到变化。
//
// 解决方案：
//   把"种子数据 + ref"提升到模块级单例，所有路由实例共享同一个 Ref。
//   Vue 的响应式系统天然支持跨组件共享 ref（与 Pinia 同源），无需引入
//   外部 store 库；同时保持改动局部，避免触及业务文件四千行的核心逻辑。
//
// 用法：
//   const contracts = useContractStore<Contract>('guangwei-sales', () => [...seed])
//   后续所有 contracts.value.xxx 调用与原写法完全一致。
// ============================================================================

import { ref, type Ref } from 'vue'

/** 模块级注册表：按业务键缓存共享的 ref，确保跨实例只有一份。 */
const stores = new Map<string, Ref<unknown[]>>()

/**
 * 获取一个模块级共享的列表 ref
 *
 * 行为约定：
 *   1. 同一个 key 首次访问时执行 seedFactory，把结果填入新建的 ref。
 *   2. 同一个 key 后续访问时：
 *      · 如果当前 ref 已经非空，直接返回（用户的增删改不会被覆盖）；
 *      · 如果当前 ref 是空数组且本次 seedFactory 返回了非空种子，
 *        则用真种子"补种"——避免"先用空数组占位、后来的真种子被
 *        永久跳过"的幽灵清空 bug（见下方 peekContractStore 注释）。
 *
 * @param key          业务唯一键（如 `guangwei-sales`、`guangwei-purchase`），
 *                     不同业务用不同 key 防止串数据。
 * @param seedFactory  首次创建时调用一次以生成初始数据；返回值会成为
 *                     ref 的初始 value。使用工厂而非直接传数组是为了避免
 *                     在导入本模块时就大量构造数据，导致冷启动变慢。
 * @returns            该业务的共享 Ref<T[]>
 */
export function useContractStore<T>(key: string, seedFactory: () => T[]): Ref<T[]> {
  let existing = stores.get(key) as Ref<T[]> | undefined
  if (!existing) {
    existing = ref<T[]>(seedFactory()) as Ref<T[]>
    stores.set(key, existing as Ref<unknown[]>)
    return existing
  }
  // 已注册但仍为空：尝试用本次的种子补齐，仅当种子非空时生效
  if (existing.value.length === 0) {
    const seed = seedFactory()
    if (seed && seed.length > 0) {
      existing.value = seed
    }
  }
  return existing
}

/**
 * 只读模式访问 store —— 不会创建新条目
 * ---------------------------------------------------------------
 * 适用于"跨页派生指标"（如库存联动适配器），调用方既不知道也不应该
 * 关心目标 store 的真实种子数据；如果对应业务 SFC 还没被加载，
 * 直接返回 undefined，由上层做空安全。
 *
 * 这样可以避免"先于业务 SFC 调用 useContractStore(key, () => [])"
 * 导致业务种子工厂被跳过的"幽灵清空"问题。
 *
 * @param key 业务唯一键
 * @returns   已注册的共享 Ref<T[]>；尚未注册则为 undefined
 */
export function peekContractStore<T>(key: string): Ref<T[]> | undefined {
  return stores.get(key) as Ref<T[]> | undefined
}
