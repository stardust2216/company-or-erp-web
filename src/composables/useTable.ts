// ============================================
// useTable - 表格分页 + 筛选通用 Composables
// Company OA ERP - Core Business Module
// ============================================

import { ref, computed, watch, type Ref } from 'vue'

export interface UseTableOptions<T> {
  /** 初始每页条数 */
  pageSize?: number
  /** 数据源（响应式） */
  dataSource: Ref<T[]>
  /** 自定义筛选函数，默认不过滤（返回全部） */
  filterFn?: (item: T) => boolean
}

/**
 * 通用表格分页 + 筛选 Composable
 * 
 * @example
 * ```ts
 * const store = useOrdersStore()
 * const { list } = storeToRefs(store)
 * const { pagedData, currentPage, pageSize, total, ... } = useTable({
 *   dataSource: list,
 *   filterFn: (o) => o.status === 'pending'
 * })
 * ```
 */
export function useTable<T>(options: UseTableOptions<T>) {
  const { dataSource, filterFn, pageSize: initialPageSize = 10 } = options

  const currentPage = ref(1)
  const pageSize = ref(initialPageSize)
  const pageSizes = [10, 20, 50, 100]

  // 筛选后数据
  const filteredData = computed(() => {
    if (!filterFn) return dataSource.value
    return dataSource.value.filter(filterFn)
  })

  // 总数
  const total = computed(() => filteredData.value.length)

  // 分页切片
  const pagedData = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredData.value.slice(start, start + pageSize.value)
  })

  // 筛选条件变化时回到第 1 页
  watch(total, (newTotal) => {
    const maxPage = Math.max(1, Math.ceil(newTotal / pageSize.value))
    if (currentPage.value > maxPage) {
      currentPage.value = maxPage
    }
  })

  function onPageSizeChange() {
    currentPage.value = 1
  }

  function resetPage() {
    currentPage.value = 1
  }

  return {
    // 状态
    currentPage,
    pageSize,
    pageSizes,
    total,
    filteredData,
    pagedData,
    // 方法
    onPageSizeChange,
    resetPage
  }
}
