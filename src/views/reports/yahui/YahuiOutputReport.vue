<template>
  <div class="sulfur-output-report">
    <!-- 渐变badge页头 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-badge">
          <el-icon :size="28"><DataAnalysis /></el-icon>
        </div>
        <div class="header-text">
          <h1 class="header-title">亚辉塑业 - 产量产值报表</h1>
          <p class="header-subtitle">26-27榨季 硫磺产量/产值汇总统计</p>
        </div>
      </div>
    </div>

    <!-- 报表类型切换 + 日期选择器 -->
    <div class="report-toolbar">
      <el-radio-group v-model="reportType" size="default" @change="handleTypeChange">
        <el-radio-button value="daily">日报</el-radio-button>
        <el-radio-button value="monthly">月报</el-radio-button>
        <el-radio-button value="yearly">年报</el-radio-button>
      </el-radio-group>

      <div class="toolbar-actions">
        <el-date-picker
          v-if="reportType === 'daily'"
          v-model="selectedDate"
          type="date"
          placeholder="选择日期"
          value-format="YYYY-MM-DD"
          size="default"
          style="width: 160px"
        />
        <el-date-picker
          v-else-if="reportType === 'monthly'"
          v-model="selectedMonth"
          type="month"
          placeholder="选择月份"
          value-format="YYYY-MM"
          size="default"
          style="width: 160px"
        />
        <el-date-picker
          v-else
          v-model="selectedYear"
          type="year"
          placeholder="选择年份"
          value-format="YYYY"
          size="default"
          style="width: 160px"
        />
        <el-button type="primary" :icon="Search" @click="handleQuery">查询</el-button>
        <el-button plain :icon="Download" @click="handleExport">导出</el-button>
      </div>
    </div>

    <!-- 顶部4个统计卡片 -->
    <el-row :gutter="16" class="summary-cards">
      <el-col :span="6">
        <el-card shadow="hover" class="summary-card">
          <div class="card-icon total-icon">
            <el-icon :size="22"><TrendCharts /></el-icon>
          </div>
          <div class="card-body">
            <div class="card-label">总产量</div>
            <div class="card-value">{{ summaryData.totalOutput }}</div>
            <div class="card-sub">吨</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="summary-card">
          <div class="card-icon value-icon">
            <el-icon :size="22"><Money /></el-icon>
          </div>
          <div class="card-body">
            <div class="card-label">总产值</div>
            <div class="card-value">{{ summaryData.totalValue }}</div>
            <div class="card-sub">万元</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="summary-card">
          <div class="card-icon material-icon">
            <el-icon :size="22"><Box /></el-icon>
          </div>
          <div class="card-body">
            <div class="card-label">总原料消耗</div>
            <div class="card-value">{{ summaryData.totalRawMaterial }}</div>
            <div class="card-sub">吨</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="summary-card">
          <div class="card-icon loss-icon">
            <el-icon :size="22"><Warning /></el-icon>
          </div>
          <div class="card-body">
            <div class="card-label">平均损耗率</div>
            <div class="card-value">{{ summaryData.avgLossRate }}</div>
            <div class="card-sub">%</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据表格 -->
    <el-card shadow="never" class="table-card">
      <template #header>
        <div class="card-header">
          <span>{{ tableTitle }}</span>
          <div class="header-extra">
            <el-tag v-if="currentPeriod" type="info" effect="plain" size="small">
              {{ reportTypeLabel }}：{{ currentPeriod }}
            </el-tag>
            <el-button text @click="toggleFullscreen" :icon="fullscreenIcon" style="margin-left:auto;padding:0 12px;font-size:18px" />
          </div>
        </div>
      </template>

      <el-table
        :data="paginatedData"
        border
        stripe
        style="width: 100%"
        max-height="800"
        :header-cell-style="headerCellStyle"
        size="small"
        :summary-method="summaryMethod"
        show-summary
        highlight-current-row
      >
        <el-table-column type="index" label="序号" width="60" align="center" fixed />

        <!-- ==================== 日报列 ==================== -->
        <template v-if="reportType === 'daily'">
          <el-table-column prop="date" label="生产日期" width="120" align="center" />
          <el-table-column prop="output" label="产量(吨)" min-width="120" align="right">
            <template #default="{ row }">
              <span class="number-value">{{ formatNumber(row.output, 1) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="outputValue" label="产值(元)" min-width="130" align="right">
            <template #default="{ row }">
              <span class="number-value">{{ formatNumber(row.outputValue, 0) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="rawMaterial" label="原料消耗(吨)" min-width="130" align="right">
            <template #default="{ row }">
              <span class="number-value">{{ formatNumber(row.rawMaterial, 1) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="lossRate" label="损耗率(%)" width="110" align="center">
            <template #default="{ row }">
              <el-tag
                :type="row.lossRate > 4.5 ? 'danger' : row.lossRate > 3.5 ? 'warning' : 'success'"
                size="small"
                effect="plain"
              >
                {{ row.lossRate.toFixed(1) }}%
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="operators" label="操作人数" width="100" align="center" />
        </template>

        <!-- ==================== 月报列 ==================== -->
        <template v-if="reportType === 'monthly'">
          <el-table-column prop="month" label="月份" width="110" align="center" />
          <el-table-column prop="output" label="产量(吨)" min-width="120" align="right">
            <template #default="{ row }">
              <span class="number-value">{{ formatNumber(row.output, 1) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="outputValue" label="产值(万元)" min-width="130" align="right">
            <template #default="{ row }">
              <span class="number-value">{{ formatNumber(row.outputValue, 1) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="rawMaterial" label="原料总耗(吨)" min-width="130" align="right">
            <template #default="{ row }">
              <span class="number-value">{{ formatNumber(row.rawMaterial, 1) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="lossRate" label="平均损耗率(%)" width="130" align="center">
            <template #default="{ row }">
              <el-tag
                :type="row.lossRate > 4.5 ? 'danger' : row.lossRate > 3.5 ? 'warning' : 'success'"
                size="small"
                effect="plain"
              >
                {{ row.lossRate.toFixed(1) }}%
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="totalLabor" label="总人工费(元)" min-width="130" align="right">
            <template #default="{ row }">
              <span class="number-value">{{ formatNumber(row.totalLabor, 0) }}</span>
            </template>
          </el-table-column>
        </template>

        <!-- ==================== 年报列 ==================== -->
        <template v-if="reportType === 'yearly'">
          <el-table-column prop="productType" label="产品类别" width="120" align="center" />
          <el-table-column prop="output" label="年产量(吨)" min-width="130" align="right">
            <template #default="{ row }">
              <span class="number-value">{{ formatNumber(row.output, 1) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="outputValue" label="年产值(万元)" min-width="130" align="right">
            <template #default="{ row }">
              <span class="number-value">{{ formatNumber(row.outputValue, 1) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="ratio" label="占比(%)" width="140" align="center">
            <template #default="{ row }">
              <div class="ratio-cell">
                <el-progress
                  :percentage="row.ratio"
                  :stroke-width="18"
                  :text-inside="true"
                  :color="row.productType === '粒磺' ? '#409eff' : '#67c23a'"
                />
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" min-width="180" show-overflow-tooltip />
        </template>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="tableData.length"
          layout="total, sizes, prev, pager, next, jumper"
          background
          small
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  DataAnalysis,
  TrendCharts,
  Money,
  Box,
  Warning,
  Search,
  Download,
  FullScreen,
  Close,
} from '@element-plus/icons-vue'

// ============================================================
// 常量
// ============================================================
/** 粒磺单价（元/吨） */
const GRANULE_UNIT_PRICE = 4500
/** 块磺单价（元/吨） */
const BLOCK_UNIT_PRICE = 4200
  
  // ============================================================
// 类型定义
// ============================================================
/** 日报原始记录 */
interface DailyRecord {
  date: string
  granuleOutput: number
  blockOutput: number
  granuleRawMat: number
  blockRawMat: number
  operators: number
}

/** 月报原始记录 */
interface MonthlyRecord {
  month: string
  granuleOutput: number
  blockOutput: number
  granuleRawMat: number
  blockRawMat: number
  totalLabor: number
}

/** 表格行公共字段 */
interface TableRowBase {
  output: number
  outputValue: number
  rawMaterial: number
  lossRate: number
}

/** 日报表格行 */
interface DailyTableRow extends TableRowBase {
  date: string
  operators: number
}

/** 月报表格行 */
interface MonthlyTableRow extends TableRowBase {
  month: string
  totalLabor: number
}

/** 年报表格行 */
interface YearlyTableRow {
  productType: string
  output: number
  outputValue: number
  ratio: number
  remark: string
}

// ============================================================
// Mock 数据
// ============================================================

// ---- 日报 - 15条 ----
const mockDailyRecords: DailyRecord[] = [
  { date: '2026-01-05', granuleOutput: 28.5, blockOutput: 12.2, granuleRawMat: 29.69, blockRawMat: 12.64, operators: 18 },
  { date: '2026-01-06', granuleOutput: 30.2, blockOutput: 11.8, granuleRawMat: 31.46, blockRawMat: 12.23, operators: 18 },
  { date: '2026-01-07', granuleOutput: 26.7, blockOutput: 0,   granuleRawMat: 27.81, blockRawMat: 0,    operators: 9 },
  { date: '2026-01-08', granuleOutput: 32.1, blockOutput: 13.5, granuleRawMat: 33.44, blockRawMat: 13.99, operators: 19 },
  { date: '2026-01-09', granuleOutput: 29.8, blockOutput: 10.5, granuleRawMat: 31.04, blockRawMat: 10.88, operators: 17 },
  { date: '2026-01-10', granuleOutput: 31.5, blockOutput: 14.2, granuleRawMat: 32.81, blockRawMat: 14.71, operators: 18 },
  { date: '2026-01-11', granuleOutput: 27.3, blockOutput: 0,   granuleRawMat: 28.44, blockRawMat: 0,    operators: 9 },
  { date: '2026-01-12', granuleOutput: 33.6, blockOutput: 12.8, granuleRawMat: 35.00, blockRawMat: 13.26, operators: 19 },
  { date: '2026-01-13', granuleOutput: 30.5, blockOutput: 0,   granuleRawMat: 31.77, blockRawMat: 0,    operators: 10 },
  { date: '2026-01-14', granuleOutput: 28.2, blockOutput: 10.0, granuleRawMat: 29.38, blockRawMat: 10.41, operators: 16 },
  { date: '2026-01-15', granuleOutput: 30.9, blockOutput: 13.2, granuleRawMat: 32.19, blockRawMat: 13.68, operators: 18 },
  { date: '2026-01-16', granuleOutput: 25.8, blockOutput: 10.0, granuleRawMat: 26.88, blockRawMat: 10.36, operators: 15 },
  { date: '2026-01-17', granuleOutput: 31.6, blockOutput: 10.0, granuleRawMat: 32.92, blockRawMat: 10.41, operators: 17 },
  { date: '2026-01-18', granuleOutput: 29.4, blockOutput: 0,   granuleRawMat: 30.63, blockRawMat: 0,    operators: 12 },
  { date: '2026-01-19', granuleOutput: 30.6, blockOutput: 13.2, granuleRawMat: 31.88, blockRawMat: 13.68, operators: 18 },
]

// ---- 月报 - 10条 ----
const mockMonthlyRecords: MonthlyRecord[] = [
  { month: '2025-10', granuleOutput: 412.5, blockOutput: 182.3, granuleRawMat: 429.69, blockRawMat: 188.91, totalLabor: 5948 },
  { month: '2025-11', granuleOutput: 385.2, blockOutput: 170.1, granuleRawMat: 401.25, blockRawMat: 176.27, totalLabor: 5553 },
  { month: '2025-12', granuleOutput: 450.8, blockOutput: 195.6, granuleRawMat: 469.58, blockRawMat: 202.69, totalLabor: 6464 },
  { month: '2026-01', granuleOutput: 436.7, blockOutput: 120.6, granuleRawMat: 454.90, blockRawMat: 124.96, totalLabor: 5573 },
  { month: '2026-02', granuleOutput: 398.3, blockOutput: 168.9, granuleRawMat: 414.90, blockRawMat: 175.03, totalLabor: 5672 },
  { month: '2026-03', granuleOutput: 470.2, blockOutput: 205.5, granuleRawMat: 489.79, blockRawMat: 212.95, totalLabor: 6757 },
  { month: '2026-04', granuleOutput: 425.6, blockOutput: 180.2, granuleRawMat: 443.33, blockRawMat: 186.74, totalLabor: 6058 },
  { month: '2026-05', granuleOutput: 480.5, blockOutput: 210.3, granuleRawMat: 500.52, blockRawMat: 217.93, totalLabor: 6908 },
  { month: '2026-06', granuleOutput: 365.8, blockOutput: 152.6, granuleRawMat: 381.04, blockRawMat: 158.13, totalLabor: 5184 },
  { month: '2026-07', granuleOutput: 390.4, blockOutput: 168.7, granuleRawMat: 406.67, blockRawMat: 174.82, totalLabor: 5591 },
]

// ============================================================
// 响应式状态
// ============================================================
const reportType = ref<'daily' | 'monthly' | 'yearly'>('daily')
const selectedDate = ref('2026-01-10')
const selectedMonth = ref('2026-01')
const selectedYear = ref('2026')

const currentPage = ref(1)
const pageSize = ref(10)

// ============================================================
// 辅助计算
// ============================================================
const currentPeriod = computed(() => {
  if (reportType.value === 'daily') return selectedDate.value
  if (reportType.value === 'monthly') return selectedMonth.value
  return selectedYear.value
})

const reportTypeLabel = computed(() => {
  const map: Record<string, string> = { daily: '日报', monthly: '月报', yearly: '年报' }
  return map[reportType.value]
})

const tableTitle = computed(() => {
  if (reportType.value === 'daily') return '硫磺生产日报'
  if (reportType.value === 'monthly') return '硫磺生产月报'
  return '硫磺生产年报'
})

// ============================================================
// 从一条 DailyRecord 计算聚合值
// ============================================================
function calcDailyRow(rec: DailyRecord): DailyTableRow {
  const output = rec.granuleOutput + rec.blockOutput
  const outputValue = rec.granuleOutput * GRANULE_UNIT_PRICE + rec.blockOutput * BLOCK_UNIT_PRICE
  const rawMaterial = rec.granuleRawMat + rec.blockRawMat
  const lossRate = rawMaterial > 0 ? Number((((rawMaterial - output) / rawMaterial) * 100).toFixed(1)) : 0
  return {
    date: rec.date,
    output: Number(output.toFixed(1)),
    outputValue,
    rawMaterial: Number(rawMaterial.toFixed(1)),
    lossRate,
    operators: rec.operators,
  }
}

// ============================================================
// 从一条 MonthlyRecord 计算聚合值
// ============================================================
function calcMonthlyRow(rec: MonthlyRecord): MonthlyTableRow {
  const output = rec.granuleOutput + rec.blockOutput
  // 产值计算为万元
  const outputValue = (rec.granuleOutput * GRANULE_UNIT_PRICE + rec.blockOutput * BLOCK_UNIT_PRICE) / 10000
  const rawMaterial = rec.granuleRawMat + rec.blockRawMat
  const lossRate = rawMaterial > 0 ? Number((((rawMaterial - output) / rawMaterial) * 100).toFixed(1)) : 0
  return {
    month: rec.month,
    output: Number(output.toFixed(1)),
    outputValue: Number(outputValue.toFixed(1)),
    rawMaterial: Number(rawMaterial.toFixed(1)),
    lossRate,
    totalLabor: rec.totalLabor,
  }
}

// ============================================================
// 表格数据
// ============================================================
const dailyTableData = computed<DailyTableRow[]>(() => {
  const date = selectedDate.value
  const filtered = mockDailyRecords.filter((r) => r.date === date)
  if (filtered.length > 0) {
    return filtered.map(calcDailyRow)
  }
  // 若无匹配日期则显示全部
  return mockDailyRecords.map(calcDailyRow)
})

const monthlyTableData = computed<MonthlyTableRow[]>(() => {
  const month = selectedMonth.value
  const filtered = mockMonthlyRecords.filter((r) => r.month === month)
  if (filtered.length > 0) {
    return filtered.map(calcMonthlyRow)
  }
  return mockMonthlyRecords.map(calcMonthlyRow)
})

const yearlyTableData = computed<YearlyTableRow[]>(() => {
  // 从月报数据按产品汇总到年
  const year = selectedYear.value
  const records = mockMonthlyRecords.filter((r) => r.month.startsWith(year))

  let totalGranule = 0
  let totalBlock = 0
  for (const rec of records) {
    totalGranule += rec.granuleOutput
    totalBlock += rec.blockOutput
  }

  totalGranule = Number(totalGranule.toFixed(1))
  totalBlock = Number(totalBlock.toFixed(1))
  const grandTotal = totalGranule + totalBlock

  const granuleValue = Number(((totalGranule * GRANULE_UNIT_PRICE) / 10000).toFixed(1))
  const blockValue = Number(((totalBlock * BLOCK_UNIT_PRICE) / 10000).toFixed(1))

  const granuleRatio = grandTotal > 0 ? Number(((totalGranule / grandTotal) * 100).toFixed(1)) : 0
  const blockRatio = grandTotal > 0 ? Number(((totalBlock / grandTotal) * 100).toFixed(1)) : 0

  return [
    {
      productType: '粒磺',
      output: totalGranule,
      outputValue: granuleValue,
      ratio: granuleRatio,
      remark: '硫磺造粒产品，主产品',
    },
    {
      productType: '块磺',
      output: totalBlock,
      outputValue: blockValue,
      ratio: blockRatio,
      remark: '硫磺浇铸块状产品，副产品',
    },
  ]
})

const tableData = computed<(DailyTableRow | MonthlyTableRow | YearlyTableRow)[]>(() => {
  if (reportType.value === 'daily') return dailyTableData.value
  if (reportType.value === 'monthly') return monthlyTableData.value
  return yearlyTableData.value
})

// ============================================================
// 分页数据
// ============================================================
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return tableData.value.slice(start, start + pageSize.value)
})

// ============================================================
// 摘要卡片
// ============================================================
const summaryData = computed(() => {
  const rows = tableData.value

  if (rows.length === 0) {
    return { totalOutput: '0', totalValue: '0', totalRawMaterial: '0', avgLossRate: '0' }
  }

  if (reportType.value === 'yearly') {
    const yearlyRows = rows as YearlyTableRow[]
    const totalOutput = yearlyRows.reduce((s, r) => s + r.output, 0)
    const totalValue = yearlyRows.reduce((s, r) => s + r.outputValue, 0)
    return {
      totalOutput: formatNumber(totalOutput, 1),
      totalValue: formatNumber(totalValue, 1),
      totalRawMaterial: '--',
      avgLossRate: '--',
    }
  }

  if (reportType.value === 'daily') {
    const dailyRows = rows as DailyTableRow[]
    const totalOutput = dailyRows.reduce((s, r) => s + r.output, 0)
    const totalValue = dailyRows.reduce((s, r) => s + r.outputValue, 0)
    const totalRawMat = dailyRows.reduce((s, r) => s + r.rawMaterial, 0)
    const avgLoss = dailyRows.length > 0
      ? dailyRows.reduce((s, r) => s + r.lossRate, 0) / dailyRows.length
      : 0
    return {
      totalOutput: formatNumber(totalOutput, 1),
      totalValue: formatNumber(totalValue, 0),
      totalRawMaterial: formatNumber(totalRawMat, 1),
      avgLossRate: avgLoss.toFixed(1),
    }
  }

  // monthly
  const monthlyRows = rows as MonthlyTableRow[]
  const totalOutput = monthlyRows.reduce((s, r) => s + r.output, 0)
  const totalValue = monthlyRows.reduce((s, r) => s + r.outputValue, 0)
  const totalRawMat = monthlyRows.reduce((s, r) => s + r.rawMaterial, 0)
  const avgLoss = monthlyRows.length > 0
    ? monthlyRows.reduce((s, r) => s + r.lossRate, 0) / monthlyRows.length
    : 0
  return {
    totalOutput: formatNumber(totalOutput, 1),
    totalValue: formatNumber(totalValue, 1),
    totalRawMaterial: formatNumber(totalRawMat, 1),
    avgLossRate: avgLoss.toFixed(1),
  }
})

// ============================================================
// 表格合计行
// ============================================================
const summaryMethod = (param: { columns: any[]; data: any[] }) => {
  const { columns, data } = param
  const sums: string[] = []

  columns.forEach((column: any, idx: number) => {
    if (idx === 0) {
      sums[idx] = '汇总'
      return
    }

    if (reportType.value === 'daily') {
      if (column.property === 'output') {
        const total = data.reduce((s: number, r: any) => s + (Number(r.output) || 0), 0)
        sums[idx] = formatNumber(total, 1)
      } else if (column.property === 'outputValue') {
        const total = data.reduce((s: number, r: any) => s + (Number(r.outputValue) || 0), 0)
        sums[idx] = formatNumber(total, 0)
      } else if (column.property === 'rawMaterial') {
        const total = data.reduce((s: number, r: any) => s + (Number(r.rawMaterial) || 0), 0)
        sums[idx] = formatNumber(total, 1)
      } else if (column.property === 'lossRate') {
        const avg = data.length > 0
          ? data.reduce((s: number, r: any) => s + (Number(r.lossRate) || 0), 0) / data.length
          : 0
        sums[idx] = avg.toFixed(1) + '%'
      } else if (column.property === 'operators') {
        const total = data.reduce((s: number, r: any) => s + (Number(r.operators) || 0), 0)
        sums[idx] = String(total)
      } else {
        sums[idx] = ''
      }
    } else if (reportType.value === 'monthly') {
      if (column.property === 'output') {
        const total = data.reduce((s: number, r: any) => s + (Number(r.output) || 0), 0)
        sums[idx] = formatNumber(total, 1)
      } else if (column.property === 'outputValue') {
        const total = data.reduce((s: number, r: any) => s + (Number(r.outputValue) || 0), 0)
        sums[idx] = formatNumber(total, 1)
      } else if (column.property === 'rawMaterial') {
        const total = data.reduce((s: number, r: any) => s + (Number(r.rawMaterial) || 0), 0)
        sums[idx] = formatNumber(total, 1)
      } else if (column.property === 'lossRate') {
        const avg = data.length > 0
          ? data.reduce((s: number, r: any) => s + (Number(r.lossRate) || 0), 0) / data.length
          : 0
        sums[idx] = avg.toFixed(1) + '%'
      } else if (column.property === 'totalLabor') {
        const total = data.reduce((s: number, r: any) => s + (Number(r.totalLabor) || 0), 0)
        sums[idx] = formatNumber(total, 0)
      } else {
        sums[idx] = ''
      }
    } else {
      // yearly
      if (column.property === 'output') {
        const total = data.reduce((s: number, r: any) => s + (Number(r.output) || 0), 0)
        sums[idx] = formatNumber(total, 1)
      } else if (column.property === 'outputValue') {
        const total = data.reduce((s: number, r: any) => s + (Number(r.outputValue) || 0), 0)
        sums[idx] = formatNumber(total, 1)
      } else if (column.property === 'ratio') {
        sums[idx] = '100%'
      } else {
        sums[idx] = ''
      }
    }
  })

  return sums
}

// ============================================================
// 表头样式
// ============================================================
const headerCellStyle = () => ({
  background: '#f5f7fa',
  color: '#303133',
  fontWeight: 600,
  fontSize: '13px',
})

// ============================================================
// 格式化数字
// ============================================================
const formatNumber = (value: number, decimals: number = 2): string => {
  if (value === undefined || value === null) return '0'
  return value.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

// ============================================================
// 事件处理
// ============================================================
const handleTypeChange = () => {
  currentPage.value = 1
}

const handleQuery = () => {
  currentPage.value = 1
}

const handleExport = () => {
  console.log('导出硫磺产量产值报表')
}

// ============================================================
// 初始化
// ============================================================
onMounted(() => {
  // 默认状态已通过 ref 设定
})

// ============================================================
// 全屏切换
// ============================================================
const isFullscreen = ref(false)
const fullscreenIcon = computed(() => isFullscreen.value ? Close : FullScreen)
function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
  const containerClass = 'sulfur-output-report'
  const el = document.querySelector('.' + containerClass) as HTMLElement
  if (el) {
    if (isFullscreen.value) {
      el.style.position = 'fixed'; el.style.inset = '0'; el.style.zIndex = '9999'
      el.style.background = '#f0f2f5'; el.style.padding = '20px'; el.style.overflow = 'auto'
    } else {
      el.style.position = ''; el.style.inset = ''; el.style.zIndex = ''
      el.style.background = ''; el.style.padding = ''; el.style.overflow = ''
    }
    setTimeout(() => window.dispatchEvent(new Event('resize')), 200)
  }
}
</script>

<style lang="scss" scoped>
@use '@/scss/variables' as *;

$icon-bg-total: linear-gradient(135deg, #1a73e8, #4a90e2);
$icon-bg-value: linear-gradient(135deg, #e8590c, #ff922b);
$icon-bg-material: linear-gradient(135deg, #2b8a3e, #51cf66);
$icon-bg-loss: linear-gradient(135deg, #e64980, #f06595);

.sulfur-output-report {
  padding: 0 $spacing-5;
  background: $color-gray-100;
  min-height: 100vh;

  // ========== 渐变badge页头 ==========
  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-5 $spacing-6;
    background: linear-gradient(135deg, #1a73e8 0%, #4a90e2 50%, #67b8f7 100%);
    border-radius: $border-radius-lg;
    box-shadow: $shadow-sm;
    margin-bottom: $spacing-5;
    margin-top: $spacing-5;

    .header-left {
      display: flex;
      align-items: center;
      gap: $spacing-4;
    }

    .header-badge {
      width: 48px;
      height: 48px;
      border-radius: $border-radius-lg;
      background: rgba(255, 255, 255, 0.25);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      flex-shrink: 0;
    }

    .header-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .header-title {
      font-size: $font-size-xl;
      font-weight: $font-weight-bold;
      color: #fff;
      margin: 0;
      line-height: $line-height-tight;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
    }

    .header-subtitle {
      font-size: $font-size-sm;
      color: rgba(255, 255, 255, 0.85);
      margin: 0;
      line-height: $line-height-normal;
    }
  }

  // ========== 工具栏 ==========
  .report-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-4 $spacing-6;
    background: #fff;
    border-radius: $border-radius-lg;
    box-shadow: $shadow-sm;
    margin-bottom: $spacing-5;
    flex-wrap: wrap;
    gap: $spacing-3;

    .toolbar-actions {
      display: flex;
      align-items: center;
      gap: $spacing-3;
    }
  }

  // ========== 摘要卡片 ==========
  .summary-cards {
    margin-bottom: $spacing-5;

    .summary-card {
      display: flex;
      align-items: center;
      padding: $spacing-4 $spacing-5;
      transition: $transition-base;
      border: 1px solid transparent;

      &:hover {
        border-color: $color-primary-light;
        box-shadow: $shadow-md;
      }

      .card-icon {
        width: 44px;
        height: 44px;
        border-radius: $border-radius-lg;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        flex-shrink: 0;
        margin-right: $spacing-4;

        &.total-icon {
          background: $icon-bg-total;
        }
        &.value-icon {
          background: $icon-bg-value;
        }
        &.material-icon {
          background: $icon-bg-material;
        }
        &.loss-icon {
          background: $icon-bg-loss;
        }
      }

      .card-body {
        flex: 1;
        min-width: 0;
      }

      .card-label {
        font-size: $font-size-xs;
        color: $color-gray-500;
        margin-bottom: 4px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .card-value {
        font-size: $font-size-2xl;
        font-weight: $font-weight-bold;
        color: $color-gray-900;
        line-height: $line-height-tight;
        margin-bottom: 2px;
      }

      .card-sub {
        font-size: $font-size-xs;
        color: $color-gray-400;
      }
    }
  }

  // ========== 表格卡片 ==========
  .table-card {
    background: #fff;
    border-radius: $border-radius-lg;
    box-shadow: $shadow-base;
    overflow: hidden;

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-weight: $font-weight-semibold;
      color: $color-gray-900;
      font-size: $font-size-base;

      .header-extra {
        display: flex;
        align-items: center;
        gap: $spacing-2;
      }
    }

    .pagination-wrapper {
      display: flex;
      justify-content: flex-end;
      padding: $spacing-4 $spacing-5;
      border-top: 1px solid $color-gray-200;
    }

    :deep(.el-table) {
      font-size: $font-size-sm;

      .el-table__header-wrapper th {
        background: $color-gray-50;
      }

      .el-table__footer-wrapper td {
        background: #f0f5ff;
        font-weight: $font-weight-semibold;
        color: $color-gray-800;
      }
    }

    .number-value {
      font-weight: $font-weight-semibold;
      color: $color-gray-800;
      font-variant-numeric: tabular-nums;
    }

    .ratio-cell {
      padding: 4px 0;
    }
  }
}

// 全局进度条文字
:deep(.el-progress__text) {
  font-size: $font-size-xs !important;
}
</style>
