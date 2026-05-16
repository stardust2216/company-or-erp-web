// ============================================
// 龙州塑业 - 糖袋客户 Store (Pinia)
// Company OA ERP - Longzhou Business Module
// ============================================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  SugarBagCustomer,
  SugarBagCustomerInput,
  SugarBagCustomerFilter,
  SugarBagCustomerSummary
} from '@/types/customer'

export type {
  SugarBagCustomer,
  SugarBagCustomerInput,
  SugarBagCustomerFilter,
  SugarBagCustomerSummary
}

function nowStr(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

// ── Mock 种子数据 ─────────────────────────────
function seedCustomers(): SugarBagCustomer[] {
  return [
    {
      id: 'lz-cust-001', subsidiaryId: 'longzhou',
      groupName: 'A集团', companyName: 'A糖业有限公司',
      contact: '陈总', phone: '13900139001',
      groupAddress: '广西南宁市', address: '广西南宁市青秀区糖厂路1号',
      mainProduct: '白砂糖', cooperationYear: 2022, createdAt: '2022-01-15 10:00:00'
    },
    {
      id: 'lz-cust-002', subsidiaryId: 'longzhou',
      groupName: 'B集团', companyName: 'B糖业有限公司',
      contact: '李经理', phone: '13900139002',
      groupAddress: '广西崇左市', address: '广西崇左市江州区糖业大道88号',
      mainProduct: '白砂糖', cooperationYear: 2023, createdAt: '2023-03-20 14:30:00'
    },
    {
      id: 'lz-cust-003', subsidiaryId: 'longzhou',
      groupName: 'C集团', companyName: 'C糖业有限公司',
      contact: '王工', phone: '13900139003',
      groupAddress: '广西柳州市', address: '广西柳州市鱼峰区糖厂南路200号',
      mainProduct: '优级白砂糖', cooperationYear: 2021, createdAt: '2021-06-10 09:00:00'
    },
    {
      id: 'lz-cust-004', subsidiaryId: 'longzhou',
      groupName: 'D集团', companyName: 'D糖业有限公司',
      contact: '张主任', phone: '13900139004',
      groupAddress: '广西百色市', address: '广西百色市右江区工业园糖业区',
      mainProduct: '白砂糖', cooperationYear: 2024, createdAt: '2024-02-01 11:00:00'
    },
    {
      id: 'lz-cust-005', subsidiaryId: 'longzhou',
      groupName: 'E集团', companyName: 'E糖业有限公司',
      contact: '刘经理', phone: '13900139005',
      groupAddress: '广西贵港市', address: '广西贵港市港北区糖业街15号',
      mainProduct: '红糖', cooperationYear: 2023, createdAt: '2023-08-15 16:00:00'
    }
  ]
}

// ── Store ─────────────────────────────────────
export const useLongzhouCustomersStore = defineStore('longzhouCustomers', () => {
  const list = ref<SugarBagCustomer[]>(seedCustomers())

  // 按集团分组
  const customersByGroup = computed(() => {
    const map: Record<string, SugarBagCustomer[]> = {}
    list.value.forEach(c => {
      if (!map[c.groupName]) map[c.groupName] = []
      map[c.groupName].push(c)
    })
    return map
  })

  // 统计汇总
  const summary = computed<SugarBagCustomerSummary>(() => ({
    totalCustomers: list.value.length,
    totalGroups: Object.keys(customersByGroup.value).length,
    activeCustomers: list.value.filter(c => c.cooperationYear >= 2023).length,
    customersByGroup: customersByGroup.value
  }))

  function getById(id: string) {
    return list.value.find(c => c.id === id)
  }

  function filter(f: SugarBagCustomerFilter) {
    return list.value.filter(c => {
      if (f.groupName && !c.groupName.includes(f.groupName)) return false
      if (f.keyword) {
        const kw = f.keyword.toLowerCase()
        return c.companyName.toLowerCase().includes(kw) || c.groupName.toLowerCase().includes(kw)
      }
      return true
    })
  }

  function getByGroup(groupName: string) {
    return list.value.filter(c => c.groupName === groupName)
  }

  function addCustomer(data: SugarBagCustomerInput): SugarBagCustomer {
    const c: SugarBagCustomer = {
      ...data, id: `lz-cust-${Date.now()}`, createdAt: nowStr()
    }
    list.value.unshift(c)
    return c
  }

  function updateCustomer(id: string, patch: Partial<SugarBagCustomerInput>) {
    const c = list.value.find(x => x.id === id)
    if (c) Object.assign(c, patch)
  }

  function removeCustomer(id: string) {
    const i = list.value.findIndex(x => x.id === id)
    if (i !== -1) list.value.splice(i, 1)
  }

  return { list, summary, customersByGroup, getById, filter, getByGroup, addCustomer, updateCustomer, removeCustomer }
})
