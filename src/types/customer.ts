// ============================================
// 客户管理类型定义
// Company OA ERP - Core Business Module
// ============================================

import type { SubsidiaryId } from '@/constants/subsidiary'

export interface Customer {
  id: string
  companyName: string
  subsidiaryId: SubsidiaryId
  contact: string
  phone: string
  businessScope: string
  address: string
  createdAt: string
}

export type CustomerInput = Omit<Customer, 'id' | 'createdAt'>
