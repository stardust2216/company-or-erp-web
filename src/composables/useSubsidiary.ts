// ============================================
// useSubsidiary - 子公司筛选 Composables
// Company OA ERP - Core Business Module
// ============================================

import { ref, watch } from 'vue'
import type { SubsidiaryId } from '@/constants/subsidiary'
import { SUBSIDIARY_IDS, SUBSIDIARIES } from '@/constants/subsidiary'

export type { SubsidiaryId }

export interface UseSubsidiaryOptions {
  /** 初始选中（空串 = 全部） */
  initialValue?: SubsidiaryId | ''
  /** 选中变化回调 */
  onChange?: (value: SubsidiaryId | '') => void
}

/**
 * 子公司筛选器 Composable
 * 用于订单列表、报表、库存等需要按子公司筛选的场景
 */
export function useSubsidiary(options: UseSubsidiaryOptions = {}) {
  const { initialValue = '', onChange } = options

  const selected = ref<SubsidiaryId | ''>(initialValue)
  const ids = [...SUBSIDIARY_IDS]
  const options_ = [
    { label: '全部子公司', value: '' as const },
    ...ids.map((id) => ({
      label: `${SUBSIDIARIES[id].name}（${SUBSIDIARIES[id].scope}）`,
      value: id
    }))
  ]

  if (onChange) {
    watch(selected, onChange)
  }

  return {
    selected,
    ids,
    options: options_,
    reset: () => { selected.value = '' }
  }
}

export { SUBSIDIARY_IDS, SUBSIDIARIES }
