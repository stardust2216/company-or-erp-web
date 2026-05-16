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

// ============================================
// 龙州塑业 - 客户扩展类型
// 适用于：龙州塑业（糖袋业务）
// ============================================

/** 龙州塑业糖袋客户实体 */
export interface SugarBagCustomer {
  id: string
  subsidiaryId: 'longzhou'
  /** 集团名称 */
  groupName: string
  /** 使用单位（具体糖厂） */
  companyName: string
  contact: string
  phone: string
  /** 集团地址 */
  groupAddress: string
  /** 使用单位地址 */
  address: string
  /** 主要产品类型 */
  mainProduct: string
  /** 合作起始年份 */
  cooperationYear: number
  createdAt: string
}

/** 龙州塑业糖袋客户输入 */
export type SugarBagCustomerInput = Omit<SugarBagCustomer, 'id' | 'createdAt'>

/** 糖袋客户筛选条件 */
export interface SugarBagCustomerFilter {
  groupName: string
  keyword: string
}

/** 糖袋客户统计 */
export interface SugarBagCustomerSummary {
  totalCustomers: number
  totalGroups: number
  activeCustomers: number
  /** 按集团分组的客户列表 */
  customersByGroup: Record<string, SugarBagCustomer[]>
}
