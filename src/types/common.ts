// ============================================
// 通用类型定义
// Company OA ERP - Shared Types
// ============================================

import type { SubsidiaryId } from '@/constants/subsidiary'

// ── API 响应 ──────────────────────────────────
export interface ApiResponse<T = unknown> {
  code: number
  data: T
  message: string
}

export interface PaginatedData<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// ── 分页参数 ──────────────────────────────────
export interface PaginationParams {
  page: number
  pageSize: number
}

// ── 全局子公司筛选器 ──────────────────────────
export type SubsidiaryFilterValue = SubsidiaryId | ''

// ── 菜单项类型 ─────────────────────────────────
export interface MenuItem {
  path: string
  name: string
  title: string
  icon?: string
  children?: MenuItem[]
  meta?: Record<string, unknown>
}

// ── 标签页项 ─────────────────────────────────
export interface TagView {
  path: string
  name: string
  title: string
  icon?: string
  meta?: Record<string, unknown>
}
