// ============================================
// 认证授权类型定义
// Company OA ERP - Auth Types
// ============================================

/** 用户角色类型 */
export type UserRole = 'employee' | 'manager' | 'director' | 'admin'

/** 角色信息 */
export interface RoleInfo {
  value: UserRole
  label: string
  desc: string
  level: number // 权限等级，用于权限判断
}

/** 角色配置 */
export const ROLE_CONFIG: Record<UserRole, RoleInfo> = {
  employee: {
    value: 'employee',
    label: '普通员工',
    desc: '发起申请、查看个人订单',
    level: 1
  },
  manager: {
    value: 'manager',
    label: '部门主管',
    desc: '审批本部门流程、查看部门报表',
    level: 2
  },
  director: {
    value: 'director',
    label: '董事经理',
    desc: '接收审批各部门流程、查看全公司报表',
    level: 3
  },
  admin: {
    value: 'admin',
    label: '系统管理员',
    desc: '用户管理、权限分配、数据备份',
    level: 99
  }
}

/** 用户信息 */
export interface UserInfo {
  userId: string
  username: string
  realName: string
  role: UserRole
  roleName: string
  department?: string
  subsidiaryId?: string
  avatar?: string
}

/** 登录请求 */
export interface LoginRequest {
  username: string
  password: string
  role?: UserRole
}

/** 登录响应 */
export interface LoginResponse {
  token: string
  userId: string
  username: string
  realName?: string
  role: UserRole
}

/** 权限检查工具 */
export const permissionUtil = {
  /** 检查用户是否有指定角色 */
  hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
    return ROLE_CONFIG[userRole].level >= ROLE_CONFIG[requiredRole].level
  },

  /** 检查用户是否有指定等级或更高 */
  hasLevel(userRole: UserRole, minLevel: number): boolean {
    return ROLE_CONFIG[userRole].level >= minLevel
  },

  /** 是否是管理员 */
  isAdmin(userRole: UserRole): boolean {
    return userRole === 'admin'
  },

  /** 是否是主管及以上 */
  isManagerOrAbove(userRole: UserRole): boolean {
    return ROLE_CONFIG[userRole].level >= ROLE_CONFIG.manager.level
  },

  /** 是否是董事及以上 */
  isDirectorOrAbove(userRole: UserRole): boolean {
    return ROLE_CONFIG[userRole].level >= ROLE_CONFIG.director.level
  }
}
