// ============================================
// 龙州塑业 - 生产计划 Store (Pinia)
// Company OA ERP - Longzhou Business Module
// 工序：拉丝 → 圆织 → 普印 → 打包/吹膜/一体机
// ============================================

import { defineStore } from 'pinia'
import { ref } from 'vue'
import type {
  LongzhouProcessType,
  LongzhouProductionPlan,
  LongzhouDailyReport,
  LongzhouPlanCreateInput,
  LongzhouProductionSummary,
  LasixianRecord,
  YuanzhiRecord,
  PuyinRecord,
  DabaoRecord,
  ChuimoRecord,
  YitijiRecord
} from '@/types/production-plan'

export type {
  LongzhouProcessType,
  LongzhouProductionPlan,
  LongzhouDailyReport,
  LongzhouPlanCreateInput,
  LongzhouProductionSummary,
  LasixianRecord,
  YuanzhiRecord,
  PuyinRecord,
  DabaoRecord,
  ChuimoRecord,
  YitijiRecord
}

function genPlanNo(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `LZP-${y}${m}-${String(Math.floor(Math.random() * 9000) + 1000)}`
}

function nowStr(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

// ── Mock 种子数据 - 生产计划单 ──────────────────
function seedPlans(): LongzhouProductionPlan[] {
  return [
    {
      id: 'lz-plan-001', orderId: 'lz-ord-001', sugarBagOrderId: 'lz-ord-001',
      subsidiaryId: 'longzhou', planNo: 'LZP-202604-1001',
      productName: '一级白砂糖袋', brandName: '嘉墟', spec: '66*96',
      planQty: 150000, unit: '套', customer: 'A糖业有限公司',
      orderStatus: 'production', status: 'printed',
      processProgress: { lasixian: true, yuanzhi: true, puyin: true, dabao: false, chuimo: false, yitiji: false },
      processRecords: {
        lasixian: [
          { id: 'lz-la-001', planId: 'lz-plan-001', reportDate: '2026-05-10', shift: '早班', machineNo: '#1', leaderName: '黄班长', workerName: '张师傅', flatWireSpec: '2.5*120', gramWeight: 45, wireTension: 8, color: '白色', materialOutside: 20, materialSelf: 15, qualifiedOutput: 2.5, wasteOutput: 0.15, elecStart: 1234, elecEnd: 1298, customer: 'A糖业', remark: '' }
        ],
        yuanzhi: [
          { id: 'lz-yz-001', planId: 'lz-plan-001', reportDate: '2026-05-12', shift: '早班', machineNo: '#3', workerName: '李师傅', clothSpec: '66*45', color: '白色', meterStart: 5000, meterEnd: 5500, personalOutput: 500, prevClothTurns: 2000, currClothTurns: 2500, clothOutput: 4800, customer: 'A糖业', remark: '' }
        ],
        puyin: [
          { id: 'lz-py-001', planId: 'lz-plan-001', reportDate: '2026-05-15', shift: '早班', machineNo: '#2', workerName: '王师傅', groupName: 'A集团', customerName: 'A糖业有限公司', seq: 1, brandName: '嘉墟', productName: '一级白砂糖', reqSingleSide: true, reqDoubleSide: false, printQty: 30000, remark: '' }
        ]
      },
      printCount: 1, lastPrintAt: '2026-05-08 10:00:00', createdAt: '2026-05-08 09:00:00'
    },
    {
      id: 'lz-plan-002', orderId: 'lz-ord-003', sugarBagOrderId: 'lz-ord-003',
      subsidiaryId: 'longzhou', planNo: 'LZP-202605-2001',
      productName: '一级白砂糖袋', brandName: '凤凰', spec: '68*98',
      planQty: 180000, unit: '套', customer: 'B糖业有限公司',
      orderStatus: 'shipped', status: 'printed',
      processProgress: { lasixian: true, yuanzhi: true, puyin: true, dabao: true, chuimo: false, yitiji: false },
      processRecords: {
        lasixian: [
          { id: 'lz-la-002', planId: 'lz-plan-002', reportDate: '2026-05-18', shift: '早班', machineNo: '#2', leaderName: '陈班长', workerName: '刘师傅', flatWireSpec: '2.5*125', gramWeight: 48, wireTension: 9, color: '白色', materialOutside: 22, materialSelf: 18, qualifiedOutput: 2.8, wasteOutput: 0.12, elecStart: 2345, elecEnd: 2412, customer: 'B糖业', remark: '' }
        ],
        yuanzhi: [
          { id: 'lz-yz-002', planId: 'lz-plan-002', reportDate: '2026-05-20', shift: '早班', machineNo: '#5', workerName: '赵师傅', clothSpec: '68*48', color: '白色', meterStart: 8000, meterEnd: 8600, personalOutput: 600, prevClothTurns: 3000, currClothTurns: 3600, clothOutput: 5600, customer: 'B糖业', remark: '' }
        ],
        puyin: [
          { id: 'lz-py-002', planId: 'lz-plan-002', reportDate: '2026-05-22', shift: '早班', machineNo: '#3', workerName: '孙师傅', groupName: 'B集团', customerName: 'B糖业有限公司', seq: 1, brandName: '凤凰', productName: '一级白砂糖', reqSingleSide: true, reqDoubleSide: true, printQty: 60000, remark: '' }
        ],
        dabao: [
          { id: 'lz-db-001', planId: 'lz-plan-002', reportDate: '2026-05-24', shift: '早班', machineNo: '#1', workerName: '周师傅', groupName: 'B集团', customerName: 'B糖业有限公司', brandName: '凤凰', productName: '一级白砂糖', standardSpec: '300套/件', nonStandardSpec: '', countingShipment: 200, notCountingShipment: 0, remark: '' }
        ]
      },
      printCount: 2, lastPrintAt: '2026-05-20 14:30:00', createdAt: '2026-05-17 09:00:00'
    }
  ]
}

// ── Mock 种子数据 - 拉丝日报 ────────────────────
function seedLasixianRecords(): LasixianRecord[] {
  const records: LasixianRecord[] = []
  const shifts: Array<'早班' | '中班' | '晚班'> = ['早班', '中班', '晚班']
  const machines = ['#1', '#2', '#3', '#4']
  const colors = ['白色', '蓝色', '黄色']

  for (let d = 20; d <= 26; d++) {
    shifts.forEach((shift, si) => {
      machines.forEach((machine, mi) => {
        records.push({
          id: `lz-la-d${d}-s${si}-m${mi}`,
          planId: '', reportDate: `2026-05-${String(d).padStart(2, '0')}`,
          shift, machineNo: machine, leaderName: `黄班长${(mi % 2) + 1}`,
          workerName: `张师傅${mi + 1}`, flatWireSpec: '2.5*120', gramWeight: 45 + mi,
          wireTension: 8 + (mi % 3), color: colors[mi % colors.length],
          materialOutside: 18 + mi * 2, materialSelf: 12 + mi,
          qualifiedOutput: 2.3 + mi * 0.2, wasteOutput: 0.1 + mi * 0.02,
          elecStart: 1000 + d * 100 + si * 10, elecEnd: 1050 + d * 100 + si * 10 + mi,
          customer: ['A糖业', 'B糖业', 'C糖业', 'D糖业'][mi], remark: ''
        })
      })
    })
  }
  return records
}

// ── Store ─────────────────────────────────────
export const useLongzhouProductionStore = defineStore('longzhouProduction', () => {
  const plans = ref<LongzhouProductionPlan[]>(seedPlans())
  const lasixianRecords = ref<LasixianRecord[]>(seedLasixianRecords())
  const yuanzhiRecords = ref<YuanzhiRecord[]>([])
  const puyinRecords = ref<PuyinRecord[]>([])
  const dabaoRecords = ref<DabaoRecord[]>([])
  const chuimoRecords = ref<ChuimoRecord[]>([])
  const yitijiRecords = ref<YitijiRecord[]>([])

  // 按工序获取日报记录
  function getRecordsByProcess(process: LongzhouProcessType): any[] {
    switch (process) {
      case 'lasixian': return lasixianRecords.value
      case 'yuanzhi': return yuanzhiRecords.value
      case 'puyin': return puyinRecords.value
      case 'dabao': return dabaoRecords.value
      case 'chuimo': return chuimoRecords.value
      case 'yitiji': return yitijiRecords.value
      default: return []
    }
  }

  // 按日期筛选记录
  function getRecordsByDate(process: LongzhouProcessType, date: string) {
    return getRecordsByProcess(process).filter(r => r.reportDate === date)
  }

  // 生产统计汇总
  function getSummary(process: LongzhouProcessType, date: string): LongzhouProductionSummary {
    const records = getRecordsByDate(process, date)
    const machines = [...new Set(records.map(r => r.machineNo))]
    const customers = [...new Set(records.map(r => (r as any).customer || (r as any).customerName || ''))]

    let totalOutput = 0
    if (process === 'lasixian') {
      totalOutput = records.reduce((s: number, r: LasixianRecord) => s + r.qualifiedOutput, 0)
    } else if (process === 'yuanzhi') {
      totalOutput = records.reduce((s: number, r: YuanzhiRecord) => s + r.clothOutput, 0)
    } else if (process === 'puyin') {
      totalOutput = records.reduce((s: number, r: PuyinRecord) => s + r.printQty, 0)
    } else if (process === 'dabao') {
      totalOutput = records.reduce((s: number, r: DabaoRecord) => s + r.countingShipment, 0)
    }

    // 按客户分组
    const outputByCustomer: Record<string, number> = {}
    customers.forEach(c => { outputByCustomer[c] = 0 })
    records.forEach(r => {
      const c = (r as any).customer || (r as any).customerName || ''
      if (c && process === 'dabao') {
        outputByCustomer[c] += (r as DabaoRecord).countingShipment
      }
    })

    return {
      reportDate: date, processType: process,
      totalOutput: Math.round(totalOutput * 100) / 100,
      workerCount: records.length,
      machineCount: machines.length,
      materialConsumption: process === 'lasixian'
        ? records.reduce((s: number, r: LasixianRecord) => s + r.materialOutside + r.materialSelf, 0)
        : 0,
      outputByCustomer,
      outputByMachine: machines.reduce((acc, m) => ({ ...acc, [m]: 0 }), {})
    }
  }

  function getPlanById(id: string) {
    return plans.value.find(p => p.id === id)
  }

  function getPlanByOrderId(orderId: string) {
    return plans.value.find(p => p.orderId === orderId)
  }

  function createPlan(input: LongzhouPlanCreateInput): LongzhouProductionPlan {
    const plan: LongzhouProductionPlan = {
      id: `lz-plan-${Date.now()}`, orderId: '', sugarBagOrderId: input.sugarBagOrderId,
      subsidiaryId: 'longzhou', planNo: genPlanNo(),
      productName: input.productName, brandName: input.brandName, spec: input.spec,
      planQty: input.planQty, unit: input.unit, customer: input.customer,
      orderStatus: 'pending', status: 'draft',
      processProgress: { lasixian: false, yuanzhi: false, puyin: false, dabao: false, chuimo: false, yitiji: false },
      processRecords: {},
      printCount: 0, lastPrintAt: '', createdAt: nowStr()
    }
    plans.value.unshift(plan)
    return plan
  }

  function updateProcessProgress(planId: string, process: LongzhouProcessType, completed: boolean) {
    const plan = plans.value.find(p => p.id === planId)
    if (plan) {
      plan.processProgress[process] = completed
    }
  }

  function addProcessRecord(process: LongzhouProcessType, record: any) {
    const records = getRecordsByProcess(process)
    records.push({ ...record, id: `lz-${process.slice(0, 2)}-${Date.now()}` })

    // 更新对应计划的工序进度
    if (record.planId) {
      updateProcessProgress(record.planId, process, true)
    }
  }

  function printPlan(planId: string) {
    const plan = plans.value.find(p => p.id === planId)
    if (plan) {
      plan.printCount++
      plan.lastPrintAt = nowStr()
      plan.status = 'printed'
    }
  }

  return {
    plans, lasixianRecords, yuanzhiRecords, puyinRecords, dabaoRecords, chuimoRecords, yitijiRecords,
    getRecordsByProcess, getRecordsByDate, getSummary,
    getPlanById, getPlanByOrderId, createPlan, updateProcessProgress, addProcessRecord, printPlan
  }
})
