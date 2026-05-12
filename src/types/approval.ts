// ============================================
// 审批流程类型定义
// Company OA ERP - OA Approval Center
// ============================================

/** 审批类型 */
export type ApprovalType = 'leave' | 'travel' | 'expense'

/** 审批状态 */
export type ApprovalStatus = 'draft' | 'pending' | 'processing' | 'approved' | 'rejected'

/** 审批节点 */
export interface ApprovalNode {
  id: string
  role: string
  approverName: string
  status: 'waiting' | 'approved' | 'rejected'
  comment?: string
  handledAt?: string
}

/** 审批实体 */
export interface Approval {
  id: string
  type: ApprovalType
  title: string
  applicantName: string
  applicantDept: string
  status: ApprovalStatus
  content: string
  amount?: number
  attachments?: string[]
  nodes: ApprovalNode[]
  createdAt: string
  updatedAt: string
}

// ── 各类型表单数据 ────────────────────────────

/** 请假单 */
export interface LeaveFormData {
  type: 'annual' | 'sick' | 'personal' | 'other'
  startDate: string
  endDate: string
  days: number
  reason: string
}

/** 出差单 */
export interface TravelFormData {
  destination: string
  startDate: string
  endDate: string
  days: number
  purpose: string
  estimatedCost: number
}

/** 报销单 */
export interface ExpenseFormData {
  category: string
  amount: number
  description: string
  attachments: File[]
  date: string
}

// ── 标签映射 ─────────────────────────────────
export const APPROVAL_STATUS_LABEL: Record<ApprovalStatus, string> = {
  draft: '草稿',
  pending: '待审批',
  processing: '审批中',
  approved: '已通过',
  rejected: '已驳回'
}

export const APPROVAL_STATUS_TAG_TYPE: Record<ApprovalStatus, '' | 'warning' | 'info' | 'success' | 'danger'> = {
  draft: 'info',
  pending: 'warning',
  processing: '',
  approved: 'success',
  rejected: 'danger'
}

export const APPROVAL_TYPE_LABEL: Record<ApprovalType, string> = {
  leave: '请假',
  travel: '出差',
  expense: '报销'
}
