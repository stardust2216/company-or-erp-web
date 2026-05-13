// ============================================
// 客户管理类型定义
// Company OA ERP - Core Business Module
// ============================================

import type { SubsidiaryId } from '@/constants/subsidiary'

/** 业务类型：生产型（塑业）/ 贸易型（化工） */
export type BusinessType = 'production' | 'trading'

export interface Customer {
  id: string
  companyName: string
  subsidiaryId: SubsidiaryId
  /** 业务类型，方便按生产/贸易筛选客户 */
  businessType: BusinessType
  contact: string
  phone: string
  businessScope: string
  address: string
  createdAt: string
}

export type CustomerInput = Omit<Customer, 'id' | 'createdAt'>
