// ============================================
// 客户 Store (Pinia)
// Company OA ERP - Core Business Module
// 重构：类型迁移至 @/types
// ============================================

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { type Customer, type CustomerInput } from '@/types'

export type { Customer, CustomerInput }

/** 根据子公司 ID 判断业务类型 */
function getBusinessType(subsidiaryId: string): 'production' | 'trading' {
  if (subsidiaryId === 'huawei' || subsidiaryId === 'guangwei') return 'trading'
  return 'production'
}

function seed(): Customer[] {
  return [
    { id: 'cust-01', companyName: '亚辉塑业有限公司', subsidiaryId: 'yahui', businessType: getBusinessType('yahui'), contact: '张志远', phone: '13800138001', businessScope: '编织袋、集装袋', address: '广西南宁市西乡塘区', createdAt: '2023-06-01 10:00:00' },
    { id: 'cust-02', companyName: '龙州塑业有限公司', subsidiaryId: 'longzhou', businessType: getBusinessType('longzhou'), contact: '李敏', phone: '13900139002', businessScope: '糖袋、食品袋', address: '广西崇左市龙州县', createdAt: '2023-07-12 11:20:00' },
    { id: 'cust-03', companyName: '华维食品添加剂', subsidiaryId: 'huawei', businessType: getBusinessType('huawei'), contact: '王工', phone: '13700137003', businessScope: '添加剂包装', address: '广州市黄埔区', createdAt: '2023-08-05 09:30:00' },
    { id: 'cust-04', companyName: '广为科技（演示）', subsidiaryId: 'guangwei', businessType: getBusinessType('guangwei'), contact: '周经理', phone: '13600001111', businessScope: '硫磺袋、工业袋', address: '深圳市南山区', createdAt: '2024-01-10 14:00:00' },
    { id: 'cust-05', companyName: '南方包装集团', subsidiaryId: 'yahui', businessType: getBusinessType('yahui'), contact: '陈总', phone: '13600136004', businessScope: '大宗包装', address: '深圳市宝安区', createdAt: '2024-02-18 16:45:00' },
    { id: 'cust-06', companyName: '海联进出口', subsidiaryId: 'guangwei', businessType: getBusinessType('guangwei'), contact: '吴经理', phone: '13200132008', businessScope: '出口包装', address: '上海市浦东新区', createdAt: '2024-03-01 08:50:00' }
  ]
}

export const useCustomersStore = defineStore('customers', () => {
  const list = ref<Customer[]>(seed())

  function getById(id: string) { return list.value.find((c) => c.id === id) }

  function addCustomer(data: CustomerInput) {
    const c: Customer = { ...data, id: `cust-${Date.now()}`, createdAt: new Date().toISOString().slice(0, 19).replace('T', ' ') }
    list.value.unshift(c)
    return c
  }

  function updateCustomer(id: string, patch: Partial<CustomerInput>) {
    const c = list.value.find((x) => x.id === id)
    if (c) Object.assign(c, patch)
  }

  function removeCustomer(id: string) {
    const i = list.value.findIndex((x) => x.id === id)
    if (i !== -1) list.value.splice(i, 1)
  }

  return { list, getById, addCustomer, updateCustomer, removeCustomer }
})
