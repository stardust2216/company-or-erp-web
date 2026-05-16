// ============================================
// 生产计划单类型定义（Step 5 预留模板接口）
// Company OA ERP - Core Business Module
// ============================================

import type { SubsidiaryId } from '@/constants/subsidiary'
import type { OrderStatus } from './order'

/** 生产计划单状态 */
export type PlanStatus = 'draft' | 'printed' | 'archived'

/** 生产计划单实体 */
export interface ProductionPlan {
  id: string
  /** 关联订单 ID */
  orderId: string
  /** 子公司 */
  subsidiaryId: SubsidiaryId
  /** 计划单编号（打印用） */
  planNo: string
  /** 产品名称（来自订单明细） */
  productName: string
  /** 规格要求（来自订单明细） */
  spec: string
  /** 计划生产数量 */
  planQty: number
  unit: string
  /** 订单状态快照 */
  orderStatus: OrderStatus
  /** 计划单状态 */
  status: PlanStatus
  /** 生产要求/备注（可打印区域） */
  productionNote: string
  /** 打印次数 */
  printCount: number
  /** 最新打印时间 */
  lastPrintAt: string
  createdAt: string
}

/** 计划单创建输入 */
export interface ProductionPlanInput {
  orderId: string
  subsidiaryId: SubsidiaryId
  productName: string
  spec: string
  planQty: number
  unit: string
  productionNote: string
}

/** 计划单更新输入 */
export type ProductionPlanUpdateInput = Partial<
  Pick<ProductionPlan, 'planQty' | 'unit' | 'productionNote' | 'status'>
>

// ============================================
// 打印模板预留接口（Step 5）
// ============================================

/** 打印模板配置 —— 预留，Step 5 实现具体排版 */
export interface PrintTemplateConfig {
  /** 模板名称 */
  name: string
  /** 是否显示公司 LOGO */
  showLogo: boolean
  /** 是否显示二维码 */
  showQRCode: boolean
  /** 自定义页眉 HTML（预留） */
  headerHtml: string
  /** 自定义页脚 HTML（预留） */
  footerHtml: string
}

/** 默认模板配置 */
export const DEFAULT_PRINT_CONFIG: PrintTemplateConfig = {
  name: '标准生产计划单',
  showLogo: true,
  showQRCode: false,
  headerHtml: '',
  footerHtml: '',
}

/** 根据订单状态判断是否可打印（复用 order.ts 的逻辑） */
export function canGeneratePlan(status: OrderStatus): boolean {
  // 生产中 / 已发货 / 已开票 / 已完成 均可生成计划单
  return status === 'production' || status === 'shipped' || status === 'invoiced' || status === 'completed'
}

// ============================================
// 龙州塑业 - 生产计划扩展类型
// 适用于：龙州塑业（糖袋业务）
// 工序：拉丝 → 圆织 → 普印 → 打包/吹膜/一体机
// ============================================

/** 龙州塑业生产工序枚举 */
export type LongzhouProcessType =
  | 'lasixian'    // 拉丝
  | 'yuanzhi'     // 圆织
  | 'puyin'       // 普印
  | 'dabao'       // 成品打包
  | 'chuimo'      // 吹膜
  | 'yitiji'      // 一体机

/** 工序标签映射 */
export const LONGZHOU_PROCESS_LABEL: Record<LongzhouProcessType, string> = {
  lasixian: '拉丝',
  yuanzhi: '圆织',
  puyin: '普印',
  dabao: '成品打包',
  chuimo: '吹膜',
  yitiji: '一体机'
}

/** 拉丝工序记录 */
export interface LasixianRecord {
  id: string
  planId: string
  reportDate: string
  /** 班次 */
  shift: '早班' | '中班' | '晚班'
  /** 机台编号 */
  machineNo: string
  /** 班长姓名 */
  leaderName: string
  /** 操作工姓名 */
  workerName: string
  /** 扁丝规格-宽度*纤度(mm*d) */
  flatWireSpec: string
  /** 扁丝规格-平方克重（g/㎡） */
  gramWeight: number
  /** 扁丝规格-单丝拉力（牛） */
  wireTension: number
  /** 扁丝规格-颜色 */
  color: string
  /** 使用原材料-外购（包） */
  materialOutside: number
  /** 使用原材料-自打料（包） */
  materialSelf: number
  /** 产量-合格扁丝数量（吨） */
  qualifiedOutput: number
  /** 产量-废丝数量（吨） */
  wasteOutput: number
  /** 耗电量-接班时电表读数（千瓦/时） */
  elecStart: number
  /** 耗电量-下班时电表读数（千瓦/时） */
  elecEnd: number
  /** 使用客户 */
  customer: string
  remark: string
}

/** 圆织工序记录 */
export interface YuanzhiRecord {
  id: string
  planId: string
  reportDate: string
  shift: '早班' | '中班' | '晚班'
  machineNo: string
  workerName: string
  /** 产品规格-宽度*平方克重(cm*g/㎡) */
  clothSpec: string
  /** 产品规格-颜色 */
  color: string
  /** 接班计量表转数（转） */
  meterStart: number
  /** 下班计量表读数（m) */
  meterEnd: number
  /** 个人产量（米） */
  personalOutput: number
  /** 上次下布转数 */
  prevClothTurns: number
  /** 本次下布转数 */
  currClothTurns: number
  /** 布筒产量 */
  clothOutput: number
  customer: string
  remark: string
}

/** 普印工序记录 */
export interface PuyinRecord {
  id: string
  planId: string
  reportDate: string
  shift: '早班' | '中班' | '晚班'
  machineNo: string
  workerName: string
  /** 集团名称 */
  groupName: string
  /** 使用单位名称 */
  customerName: string
  /** 序号 */
  seq: number
  /** 品牌名称 */
  brandName: string
  /** 产品名称 */
  productName: string
  /** 工艺要求-单面 */
  reqSingleSide: boolean
  /** 工艺要求-双面 */
  reqDoubleSide: boolean
  /** 印刷数量 */
  printQty: number
  remark: string
}

/** 成品打包工序记录 */
export interface DabaoRecord {
  id: string
  planId: string
  reportDate: string
  shift: '早班' | '中班' | '晚班'
  machineNo: string
  workerName: string
  /** 集团名称 */
  groupName: string
  /** 使用单位名称 */
  customerName: string
  /** 品牌名称 */
  brandName: string
  /** 产品名称 */
  productName: string
  /** 打包规格-标准（300套/件） */
  standardSpec: string
  /** 打包规格-非标准（n套/件） */
  nonStandardSpec: string
  /** 计入发货数量 */
  countingShipment: number
  /** 不计入发货数量 */
  notCountingShipment: number
  remark: string
}

/** 吹膜工序记录 */
export interface ChuimoRecord {
  id: string
  planId: string
  reportDate: string
  shift: '早班' | '中班' | '晚班'
  machineNo: string
  workerName: string
  /** 产品规格-宽度*平方克重（mm*g/㎡） */
  filmSpec: string
  /** 产品规格-高低压 */
  pressure: '高压' | '低压'
  /** 使用原材料-外购（包） */
  materialOutside: number
  /** 使用原材料-自打料（包） */
  materialSelf: number
  /** 产品数量 */
  outputQty: number
  remark: string
}

/** 一体机工序记录 */
export interface YitijiRecord {
  id: string
  planId: string
  reportDate: string
  shift: '早班' | '中班' | '晚班'
  machineNo: string
  workerName: string
  /** 集团名称 */
  groupName: string
  /** 使用单位名称 */
  customerName: string
  /** 品牌名称 */
  brandName: string
  /** 产品名称 */
  productName: string
  /** 产品规格-外袋 */
  outerSpec: string
  /** 产品规格-内袋 */
  innerSpec: string
  /** 产品规格-袋底 */
  bottomSpec: string
  /** 产品数量 */
  outputQty: number
  remark: string
}

/** 龙州塑业生产日报记录（通用结构） */
export interface LongzhouDailyReport {
  id: string
  subsidiaryId: 'longzhou'
  processType: LongzhouProcessType
  reportDate: string
  /** 当日总产量 */
  totalOutput: number
  /** 操作工人数 */
  workerCount: number
  /** 机台数量 */
  machineCount: number
  /** 原料消耗（包） */
  materialConsumption: number
  createdAt: string
}

/** 龙州塑业生产计划单 */
export interface LongzhouProductionPlan {
  id: string
  orderId: string
  /** 关联糖袋订单 */
  sugarBagOrderId: string
  subsidiaryId: 'longzhou'
  planNo: string
  /** 产品名称 */
  productName: string
  /** 品牌名称 */
  brandName: string
  /** 产品规格 */
  spec: string
  /** 计划生产数量 */
  planQty: number
  unit: string
  /** 客户名称 */
  customer: string
  /** 订单状态快照 */
  orderStatus: OrderStatus
  status: PlanStatus
  /** 工序进度 */
  processProgress: {
    lasixian: boolean
    yuanzhi: boolean
    puyin: boolean
    dabao: boolean
    chuimo: boolean
    yitiji: boolean
  }
  /** 各工序记录 */
  processRecords: {
    lasixian?: LasixianRecord[]
    yuanzhi?: YuanzhiRecord[]
    puyin?: PuyinRecord[]
    dabao?: DabaoRecord[]
    chuimo?: ChuimoRecord[]
    yitiji?: YitijiRecord[]
  }
  printCount: number
  lastPrintAt: string
  createdAt: string
}

/** 龙州塑业生产计划单创建输入 */
export interface LongzhouPlanCreateInput {
  sugarBagOrderId: string
  productName: string
  brandName: string
  spec: string
  planQty: number
  unit: string
  customer: string
  productionNote: string
}

/** 龙州塑业生产统计汇总 */
export interface LongzhouProductionSummary {
  reportDate: string
  processType: LongzhouProcessType
  totalOutput: number
  workerCount: number
  machineCount: number
  materialConsumption: number
  /** 按客户分组产量 */
  outputByCustomer: Record<string, number>
  /** 按机台分组产量 */
  outputByMachine: Record<string, number>
}
