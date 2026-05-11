// src/api/index.ts
// API 模块统一出口
// 按业务模块扩展，参考 auth.ts 结构新增模块即可

export * from './auth'

// ─────────────────────────────────────────────
// 预留业务模块（接入后端时在此按需扩展）
// ─────────────────────────────────────────────
// export * from './user'          // 用户管理
// export * from './training'      // 培训管理
// export * from './appraisal'     // 鉴定管理
// export * from './statistics'    // 数据统计
// export * from './schedule'      // 排班管理
