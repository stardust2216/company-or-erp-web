<template>
  <div class="industry-report">
    <!-- 渐变页头 -->
    <div class="gradient-header">
      <div class="header-content">
        <div class="header-badge">
          <el-icon :size="26"><DataBoard /></el-icon>
        </div>
        <div class="header-text">
          <h1 class="header-title">亚辉塑业 - 工业生产经营情况</h1>
          <p class="header-subtitle">26-27榨季 硫磺工业生产经营数据</p>
        </div>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="report-toolbar">
      <el-radio-group v-model="viewMode" size="default">
        <el-radio-button value="production">生产经营表</el-radio-button>
        <el-radio-button value="monthly">月度对比</el-radio-button>
      </el-radio-group>

      <div class="toolbar-actions">
        <el-date-picker
          v-model="selectedMonth"
          type="month"
          placeholder="选择月份"
          value-format="YYYY-MM"
          size="default"
          style="width: 160px"
        />
        <el-button type="primary" :icon="Search" @click="handleQuery">查询</el-button>
        <el-button plain :icon="Download" @click="handleExport">导出</el-button>
      </div>
    </div>

    <!-- 4个统计卡片 -->
    <el-row :gutter="16" class="summary-cards">
      <el-col :span="6">
        <el-card shadow="hover" class="summary-card">
          <div class="card-icon card-icon--total">
            <el-icon :size="22"><TrendCharts /></el-icon>
          </div>
          <div class="card-body">
            <div class="card-label">总产量（吨）</div>
            <div class="card-value">{{ summaryData.totalOutput }}</div>
            <div class="card-sub">选定周期合计</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="summary-card">
          <div class="card-icon card-icon--value">
            <el-icon :size="22"><Money /></el-icon>
          </div>
          <div class="card-body">
            <div class="card-label">总产值（千元）</div>
            <div class="card-value">{{ summaryData.totalProductionValue }}</div>
            <div class="card-sub">选定周期合计</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="summary-card">
          <div class="card-icon card-icon--sales">
            <el-icon :size="22"><ShoppingCart /></el-icon>
          </div>
          <div class="card-body">
            <div class="card-label">总销量（吨）</div>
            <div class="card-value">{{ summaryData.totalSales }}</div>
            <div class="card-sub">选定周期合计</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="summary-card">
          <div class="card-icon card-icon--power">
            <el-icon :size="22"><Lightning /></el-icon>
          </div>
          <div class="card-body">
            <div class="card-label">总用电量（万千瓦时）</div>
            <div class="card-value">{{ summaryData.totalPower }}</div>
            <div class="card-sub">选定周期合计</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 生产经营表 -->
    <el-card v-show="viewMode === 'production'" shadow="never" class="table-card">
      <template #header>
        <div class="card-header">
          <span>工业生产经营报表</span>
          <div class="header-extra">
            <el-tag v-if="selectedMonth" type="info" effect="plain" size="small">
              {{ selectedMonth }}
            </el-tag>
            <el-button :icon="fullscreenIcon" text size="small" @click="toggleFullscreen" />
          </div>
        </div>
      </template>

      <el-table
        :data="productionTableData"
        border
        stripe
        highlight-current-row
        max-height="800"
        style="width: 100%"
        :header-cell-style="headerCellStyle"
        size="small"
        :summary-method="productionSummaryMethod"
        show-summary
        :default-sort="{ prop: 'output', order: 'descending' }"
      >
        <el-table-column type="index" label="序号" width="60" align="center" fixed />
        <el-table-column prop="productName" label="产品名称" min-width="140" fixed />
        <el-table-column prop="unit" label="计量单位" width="90" align="center" />
        <el-table-column prop="unitPrice" label="单价（元/吨）" width="140" align="right">
          <template #default="{ row }">
            <span>{{ row.unitPrice !== null ? formatNumber(row.unitPrice) + ' ' : '—' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="output" label="产量(吨)" width="120" align="right">
          <template #default="{ row }">
            <span>{{ row.output !== null ? formatNumber(row.output) : '—' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="productionValue" label="产值(千元)" width="130" align="right">
          <template #default="{ row }">
            <span>{{ row.productionValue !== null ? formatNumber(row.productionValue) : '—' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="salesVolume" label="销售量(吨)" width="120" align="right">
          <template #default="{ row }">
            <span>{{ row.salesVolume !== null ? formatNumber(row.salesVolume) : '—' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="salesValue" label="销售产值(千元)" width="145" align="right">
          <template #default="{ row }">
            <span>{{ row.salesValue !== null ? formatNumber(row.salesValue) : '—' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="exportValue" label="其中出口(千元)" width="145" align="right">
          <template #default="{ row }">
            <span>{{ row.exportValue !== null ? formatNumber(row.exportValue) : '—' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="powerUsage" label="用电量(万千瓦时)" width="150" align="right">
          <template #default="{ row }">
            <span>{{ row.powerUsage !== null ? formatNumber(row.powerUsage) : '—' }}</span>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="prodPage"
          v-model:page-size="prodPageSize"
          :page-sizes="[10, 20, 50]"
          :total="productionTableData.length"
          layout="total, sizes, prev, pager, next, jumper"
          background
          small
        />
      </div>
    </el-card>

    <!-- 月度对比表 -->
    <el-card v-show="viewMode === 'monthly'" shadow="never" class="table-card">
      <template #header>
        <div class="card-header">
          <span>月度对比报表</span>
          <div class="header-extra">
            <el-tag type="info" effect="plain" size="small">
              2025-10 至 2026-03
            </el-tag>
            <el-button :icon="fullscreenIcon" text size="small" @click="toggleFullscreen" />
          </div>
        </div>
      </template>

      <el-table
        :data="monthlyTableData"
        border
        stripe
        highlight-current-row
        max-height="800"
        style="width: 100%"
        :header-cell-style="headerCellStyle"
        size="small"
        :summary-method="monthlySummaryMethod"
        show-summary
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="month" label="月份" width="120" align="center" />
        <el-table-column prop="totalOutput" label="总产量(吨)" min-width="130" align="right">
          <template #default="{ row }">
            <span class="num-value">{{ formatNumber(row.totalOutput) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="totalProductionValue" label="总产值(千元)" min-width="140" align="right">
          <template #default="{ row }">
            <span class="num-value">{{ formatNumber(row.totalProductionValue) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="totalSalesVolume" label="总销量(吨)" min-width="130" align="right">
          <template #default="{ row }">
            <span class="num-value">{{ formatNumber(row.totalSalesVolume) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="totalSalesValue" label="销售产值(千元)" min-width="145" align="right">
          <template #default="{ row }">
            <span class="num-value">{{ formatNumber(row.totalSalesValue) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="totalPowerUsage" label="用电量(万千瓦时)" min-width="150" align="right">
          <template #default="{ row }">
            <span class="num-value">{{ formatNumber(row.totalPowerUsage) }}</span>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="monthlyPage"
          v-model:page-size="monthlyPageSize"
          :page-sizes="[10, 20, 50]"
          :total="monthlyTableData.length"
          layout="total, sizes, prev, pager, next, jumper"
          background
          small
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  DataBoard,
  TrendCharts,
  Money,
  ShoppingCart,
  Lightning,
  Search,
  Download,
  FullScreen,
  Close,
} from '@element-plus/icons-vue'

// ============================================================
// 类型定义
// ============================================================
interface ProductionRow {
  productName: string
  unit: string
  unitPrice: number | null
  output: number | null
  productionValue: number | null
  salesVolume: number | null
  salesValue: number | null
  exportValue: number | null
  powerUsage: number | null
  isSummary: boolean
}

interface MonthlyRow {
  month: string
  totalOutput: number
  totalProductionValue: number
  totalSalesVolume: number
  totalSalesValue: number
  totalPowerUsage: number
}

// ============================================================
// 状态
// ============================================================
const viewMode = ref<'production' | 'monthly'>('production')
const selectedMonth = ref('2026-03')
const prodPage = ref(1)
const prodPageSize = ref(10)
const monthlyPage = ref(1)
const monthlyPageSize = ref(10)

// ============================================================
// 全屏切换
// ============================================================
const isFullscreen = ref(false)
const fullscreenIcon = computed(() => isFullscreen.value ? Close : FullScreen)
function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
  const el = document.querySelector('.industry-report') as HTMLElement
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

// ============================================================
// Mock - 生产经营表数据（5条）
// ============================================================
const mockProductionData: ProductionRow[] = [
  {
    productName: '食品级粒磺',
    unit: '吨',
    unitPrice: 4521,
    output: 12500,
    productionValue: 56512.5,
    salesVolume: 11800,
    salesValue: 53347.8,
    exportValue: 0,
    powerUsage: 86.5,
    isSummary: false,
  },
  {
    productName: '食品级块磺',
    unit: '吨',
    unitPrice: 4280,
    output: 3200,
    productionValue: 13696,
    salesVolume: 3000,
    salesValue: 12840,
    exportValue: 0,
    powerUsage: 22.3,
    isSummary: false,
  },
  {
    productName: '工业硫磺(粒)',
    unit: '吨',
    unitPrice: 3850,
    output: 6800,
    productionValue: 26180,
    salesVolume: 6200,
    salesValue: 23870,
    exportValue: 0,
    powerUsage: 45.6,
    isSummary: false,
  },
  {
    productName: '工业硫磺(块)',
    unit: '吨',
    unitPrice: 3650,
    output: 2800,
    productionValue: 10220,
    salesVolume: 2600,
    salesValue: 9490,
    exportValue: 0,
    powerUsage: 18.2,
    isSummary: false,
  },
  {
    productName: '合计',
    unit: '—',
    unitPrice: null,
    output: 25300,
    productionValue: 106608.5,
    salesVolume: 23600,
    salesValue: 99547.8,
    exportValue: 0,
    powerUsage: 172.6,
    isSummary: true,
  },
]

// ============================================================
// Mock - 月度对比数据（2025-10 至 2026-03）
// ============================================================
const mockMonthlyData: MonthlyRow[] = [
  { month: '2025-10', totalOutput: 21500, totalProductionValue: 90580, totalSalesVolume: 19800, totalSalesValue: 84520, totalPowerUsage: 148.3 },
  { month: '2025-11', totalOutput: 22800, totalProductionValue: 96240, totalSalesVolume: 21000, totalSalesValue: 89760, totalPowerUsage: 155.7 },
  { month: '2025-12', totalOutput: 24100, totalProductionValue: 101520, totalSalesVolume: 22500, totalSalesValue: 95800, totalPowerUsage: 162.4 },
  { month: '2026-01', totalOutput: 23600, totalProductionValue: 99480, totalSalesVolume: 21800, totalSalesValue: 93150, totalPowerUsage: 158.9 },
  { month: '2026-02', totalOutput: 21800, totalProductionValue: 91860, totalSalesVolume: 20200, totalSalesValue: 86340, totalPowerUsage: 145.2 },
  { month: '2026-03', totalOutput: 25300, totalProductionValue: 106608.5, totalSalesVolume: 23600, totalSalesValue: 99547.8, totalPowerUsage: 172.6 },
]

// ============================================================
// 计算属性
// ============================================================
const productionTableData = computed(() => {
  // 模拟：根据选中月份返回数据（此处直接返回mock）
  return mockProductionData
})

const monthlyTableData = computed(() => {
  return mockMonthlyData
})

// ============================================================
// 顶部4个统计卡片数据
// ============================================================
const summaryData = computed(() => {
  let totalOutput: number
  let totalProductionValue: number
  let totalSales: number
  let totalPower: number

  if (viewMode.value === 'production') {
    // 取合计行的数据
    const summaryRow = mockProductionData.find((r) => r.isSummary)
    totalOutput = summaryRow?.output ?? 0
    totalProductionValue = summaryRow?.productionValue ?? 0
    totalSales = summaryRow?.salesVolume ?? 0
    totalPower = summaryRow?.powerUsage ?? 0
  } else {
    totalOutput = mockMonthlyData.reduce((s, r) => s + r.totalOutput, 0)
    totalProductionValue = mockMonthlyData.reduce((s, r) => s + r.totalProductionValue, 0)
    totalSales = mockMonthlyData.reduce((s, r) => s + r.totalSalesVolume, 0)
    totalPower = mockMonthlyData.reduce((s, r) => s + r.totalPowerUsage, 0)
  }

  return {
    totalOutput: formatNumber(totalOutput),
    totalProductionValue: formatNumber(totalProductionValue),
    totalSales: formatNumber(totalSales),
    totalPower: formatNumber(totalPower),
  }
})

// ============================================================
// 生产经营表 - 合计行
// ============================================================
const productionSummaryMethod = (param: { columns: any[]; data: any[] }) => {
  const { columns } = param
  // 直接返回mock中的合计行
  const summaryRow = mockProductionData.find((r) => r.isSummary)
  if (!summaryRow) return columns.map(() => '')

  return columns.map((col: any) => {
    if (!col.property) return ''
    switch (col.property) {
      case 'productName':
        return '合计'
      case 'output':
        return formatNumber(summaryRow.output ?? 0)
      case 'productionValue':
        return formatNumber(summaryRow.productionValue ?? 0)
      case 'salesVolume':
        return formatNumber(summaryRow.salesVolume ?? 0)
      case 'salesValue':
        return formatNumber(summaryRow.salesValue ?? 0)
      case 'exportValue':
        return formatNumber(summaryRow.exportValue ?? 0)
      case 'powerUsage':
        return formatNumber(summaryRow.powerUsage ?? 0)
      default:
        return ''
    }
  })
}

// ============================================================
// 月度对比表 - 合计行
// ============================================================
const monthlySummaryMethod = (param: { columns: any[]; data: MonthlyRow[] }) => {
  const { columns, data } = param
  return columns.map((col: any) => {
    if (!col.property) return ''
    switch (col.property) {
      case 'month':
        return '合计'
      case 'totalOutput':
        return formatNumber(data.reduce((s, r) => s + r.totalOutput, 0))
      case 'totalProductionValue':
        return formatNumber(data.reduce((s, r) => s + r.totalProductionValue, 0))
      case 'totalSalesVolume':
        return formatNumber(data.reduce((s, r) => s + r.totalSalesVolume, 0))
      case 'totalSalesValue':
        return formatNumber(data.reduce((s, r) => s + r.totalSalesValue, 0))
      case 'totalPowerUsage':
        return formatNumber(data.reduce((s, r) => s + r.totalPowerUsage, 0))
      default:
        return ''
    }
  })
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
const formatNumber = (value: number): string => {
  if (value === undefined || value === null) return '0'
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value)
}

// ============================================================
// 事件
// ============================================================
const handleQuery = () => {
  // mock：实际场景根据 selectedMonth 过滤数据
}

const handleExport = () => {
  console.log('导出报表')
}
</script>

<style lang="scss" scoped>
@use '@/scss/variables' as *;

.industry-report {
  padding: 0 $spacing-5;
  background: $color-gray-100;
  min-height: 100vh;

  // ========== 渐变页头 ==========
  .gradient-header {
    background: linear-gradient(135deg, #4facfe, #00f2fe);
    border-radius: 12px;
    padding: $spacing-5 $spacing-6;
    margin-top: $spacing-5;
    margin-bottom: $spacing-5;
    box-shadow: $shadow-sm;

    .header-content {
      display: flex;
      align-items: center;
      gap: $spacing-4;
    }

    .header-badge {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      flex-shrink: 0;
      backdrop-filter: blur(4px);
    }

    .header-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .header-title {
      font-size: 20px;
      font-weight: 700;
      color: #fff;
      margin: 0;
      line-height: 1.3;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    .header-subtitle {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.85);
      margin: 0;
      line-height: 1.4;
    }
  }

  // ========== 工具栏 ==========
  .report-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-4 $spacing-6;
    background: #fff;
    border-radius: 12px;
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

  // ========== 统计卡片 ==========
  .summary-cards {
    margin-bottom: $spacing-5;

    .summary-card {
      display: flex;
      align-items: center;
      padding: $spacing-4 $spacing-5;
      transition: $transition-base;
      border: 1px solid transparent;
      border-radius: 12px;

      &:hover {
        border-color: $color-primary-light;
        box-shadow: $shadow-md;
      }

      .card-icon {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        flex-shrink: 0;
        margin-right: $spacing-4;

        &--total {
          background: linear-gradient(135deg, #1a73e8, #4a90e2);
        }
        &--value {
          background: linear-gradient(135deg, #43a047, #66bb6a);
        }
        &--sales {
          background: linear-gradient(135deg, #fb8c00, #ffa726);
        }
        &--power {
          background: linear-gradient(135deg, #8e24aa, #ab47bc);
        }
      }

      .card-body {
        flex: 1;
        min-width: 0;
      }

      .card-label {
        font-size: 12px;
        color: $color-gray-500;
        margin-bottom: 4px;
        letter-spacing: 0.5px;
      }

      .card-value {
        font-size: 22px;
        font-weight: 700;
        color: $color-gray-900;
        line-height: 1.2;
        margin-bottom: 2px;
      }

      .card-sub {
        font-size: 12px;
        color: $color-gray-400;
      }
    }
  }

  // ========== 表格卡片 ==========
  .table-card {
    background: #fff;
    border-radius: 12px;
    box-shadow: $shadow-base;
    overflow: hidden;
    margin-bottom: $spacing-5;

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-weight: 600;
      color: $color-gray-900;
      font-size: $font-size-base;

      .header-extra {
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }

    :deep(.el-table) {
      font-size: $font-size-sm;

      .el-table__header-wrapper th {
        background: $color-gray-50;
      }

      .el-table__footer-wrapper td {
        background: #f0f5ff;
        font-weight: 700;
        color: $color-gray-800;
      }
    }

    .pagination-wrapper {
      display: flex;
      justify-content: flex-end;
      padding: $spacing-3 $spacing-4;
      border-top: 1px solid $color-gray-200;
    }

    .num-value {
      font-weight: 600;
      color: $color-gray-800;
    }
  }
}
</style>
