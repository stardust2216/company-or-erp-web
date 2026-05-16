<template>
  <div class="sulfur-stock-report">
    <!-- 页头 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon :size="28"><Box /></el-icon>
        </div>
        <div class="header-text">
          <h1 class="header-title">亚辉塑业 - 硫磺库存日报</h1>
          <p class="header-subtitle">26-27榨季 硫磺原料及产品库存日报</p>
        </div>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="report-toolbar">
      <div class="toolbar-left">
        <span class="toolbar-label">报表日期</span>
        <el-date-picker
          v-model="selectedDate"
          type="date"
          placeholder="选择日期"
          value-format="YYYY-MM-DD"
          size="default"
          style="width: 160px"
          @change="handleDateChange"
        />
        <el-button type="primary" :icon="Search" @click="handleQuery">查询</el-button>
      </div>
    </div>

    <!-- 统计摘要卡片 -->
    <el-row :gutter="16" class="summary-cards">
      <el-col :span="6">
        <el-card shadow="hover" class="summary-card">
          <div class="card-icon total-icon">
            <el-icon :size="22"><DataLine /></el-icon>
          </div>
          <div class="card-body">
            <div class="card-label">今日总库存(吨)</div>
            <div class="card-value">{{ formatNumber(summaryData.totalStock) }}</div>
            <div class="card-sub">各类硫磺库存合计</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="summary-card">
          <div class="card-icon inbound-icon">
            <el-icon :size="22"><Top /></el-icon>
          </div>
          <div class="card-body">
            <div class="card-label">本日总入库(吨)</div>
            <div class="card-value highlight">{{ formatNumber(summaryData.totalInbound) }}</div>
            <div class="card-sub">今日入库量合计</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="summary-card">
          <div class="card-icon outbound-icon">
            <el-icon :size="22"><Bottom /></el-icon>
          </div>
          <div class="card-body">
            <div class="card-label">本日总出库(吨)</div>
            <div class="card-value muted">{{ formatNumber(summaryData.totalOutbound) }}</div>
            <div class="card-sub">今日出库量合计</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="summary-card">
          <div class="card-icon count-icon">
            <el-icon :size="22"><Grid /></el-icon>
          </div>
          <div class="card-body">
            <div class="card-label">库存种类数</div>
            <div class="card-value">{{ summaryData.categoryCount }}</div>
            <div class="card-sub">{{ summaryData.categoryDetail }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据表格 -->
    <el-card shadow="never" class="table-card">
      <template #header>
        <div class="card-header">
          <span>硫磺库存明细表</span>
          <div class="header-extra">
            <el-tag type="info" effect="plain" size="small">
              日报：{{ selectedDate }}
            </el-tag>
            <el-button text @click="toggleFullscreen" :icon="fullscreenIcon" style="margin-left:auto;padding:0 12px;font-size:18px" />
          </div>
        </div>
      </template>

      <el-table
        :data="pagedData"
        border
        stripe
        style="width: 100%"
        max-height="800"
        :header-cell-style="headerCellStyle"
        size="small"
        show-summary
        :summary-method="summaryMethod"
        highlight-current-row
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="date" label="日期" width="110" align="center" />
        <el-table-column prop="materialName" label="原料名称/产品名称" min-width="160" />
        <el-table-column prop="yesterdayStock" label="上日库存(吨)" width="130" align="right">
          <template #default="{ row }">
            <span class="number-cell">{{ formatNumber(row.yesterdayStock) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="dailyInbound" label="本日入库(吨)" width="130" align="right">
          <template #default="{ row }">
            <span class="number-cell inbound">{{ formatNumber(row.dailyInbound) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="dailyOutbound" label="本日出库(吨)" width="130" align="right">
          <template #default="{ row }">
            <span class="number-cell outbound">{{ formatNumber(row.dailyOutbound) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="todayStock" label="今日库存(吨)" width="130" align="right">
          <template #default="{ row }">
            <span class="number-cell today">{{ formatNumber(row.todayStock) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="storageLocation" label="存放地点" min-width="140" />
        <el-table-column prop="remark" label="备注" min-width="160" show-overflow-tooltip />
      </el-table>

      <!-- 分页 -->
      <div class="table-footer">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="filteredData.length"
          layout="total, sizes, prev, pager, next, jumper"
          background
          small
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Box, DataLine, Top, Bottom, Grid, Search, FullScreen, Close } from '@element-plus/icons-vue'

// ============================================================
// 类型定义
// ============================================================
interface SulfurStockRecord {
  date: string
  materialName: string
  category: string
  yesterdayStock: number
  dailyInbound: number
  dailyOutbound: number
  todayStock: number
  storageLocation: string
  remark: string
}

// ============================================================
// Mock 数据（15条，涵盖液硫、固硫、粒磺、块磺）
// 库存逻辑：今日库存 = 上日库存 + 本日入库 - 本日出库
// ============================================================
const mockRecords: SulfurStockRecord[] = [
  // ---- 液硫 ----
  { date: '2026-05-15', materialName: '液硫 - 1#储罐', category: '液硫', yesterdayStock: 120.5, dailyInbound: 30.0, dailyOutbound: 8.5, todayStock: 142.0, storageLocation: '液硫储罐区', remark: '采购到货30吨，生产领用8.5吨' },
  { date: '2026-05-15', materialName: '液硫 - 2#储罐', category: '液硫', yesterdayStock: 95.0, dailyInbound: 25.0, dailyOutbound: 12.0, todayStock: 108.0, storageLocation: '液硫储罐区', remark: '采购到货25吨，生产领用12吨' },
  { date: '2026-05-15', materialName: '液硫 - 3#储罐', category: '液硫', yesterdayStock: 78.0, dailyInbound: 20.0, dailyOutbound: 6.5, todayStock: 91.5, storageLocation: '液硫储罐区', remark: '采购到货20吨，生产领用6.5吨' },
  { date: '2026-05-15', materialName: '液硫 - 4#储罐', category: '液硫', yesterdayStock: 110.0, dailyInbound: 28.0, dailyOutbound: 10.0, todayStock: 128.0, storageLocation: '液硫储罐区', remark: '采购到货28吨，生产领用10吨' },
  // ---- 固硫 ----
  { date: '2026-05-15', materialName: '固硫 - 块磺堆场A', category: '固硫', yesterdayStock: 200.0, dailyInbound: 50.0, dailyOutbound: 15.0, todayStock: 235.0, storageLocation: '固硫堆场A区', remark: '原料入库50吨，粉碎领用15吨' },
  { date: '2026-05-15', materialName: '固硫 - 块磺堆场B', category: '固硫', yesterdayStock: 150.0, dailyInbound: 40.0, dailyOutbound: 10.0, todayStock: 180.0, storageLocation: '固硫堆场B区', remark: '原料入库40吨，粉碎领用10吨' },
  { date: '2026-05-15', materialName: '固硫 - 粉磺仓库', category: '固硫', yesterdayStock: 85.0, dailyInbound: 20.0, dailyOutbound: 8.0, todayStock: 97.0, storageLocation: '粉磺仓库', remark: '粉碎入库20吨，生产领用8吨' },
  { date: '2026-05-15', materialName: '固硫 - 块磺堆场C', category: '固硫', yesterdayStock: 60.0, dailyInbound: 15.0, dailyOutbound: 5.0, todayStock: 70.0, storageLocation: '固硫堆场C区', remark: '原料入库15吨，粉碎领用5吨' },
  // ---- 粒磺 ----
  { date: '2026-05-15', materialName: '粒磺 - 1#料仓', category: '粒磺', yesterdayStock: 65.0, dailyInbound: 15.0, dailyOutbound: 5.0, todayStock: 75.0, storageLocation: '粒磺料仓', remark: '造粒入库15吨，包装领用5吨' },
  { date: '2026-05-15', materialName: '粒磺 - 2#料仓', category: '粒磺', yesterdayStock: 45.0, dailyInbound: 12.0, dailyOutbound: 4.0, todayStock: 53.0, storageLocation: '粒磺料仓', remark: '造粒入库12吨，包装领用4吨' },
  { date: '2026-05-15', materialName: '粒磺 - 包装线', category: '粒磺', yesterdayStock: 30.0, dailyInbound: 10.0, dailyOutbound: 3.0, todayStock: 37.0, storageLocation: '粒磺包装车间', remark: '包装成品入库10吨，发货3吨' },
  { date: '2026-05-15', materialName: '粒磺 - 中间仓', category: '粒磺', yesterdayStock: 25.0, dailyInbound: 8.0, dailyOutbound: 2.5, todayStock: 30.5, storageLocation: '粒磺中间仓', remark: '半成品入库8吨，转料2.5吨' },
  // ---- 块磺 ----
  { date: '2026-05-15', materialName: '块磺 - 1#仓库', category: '块磺', yesterdayStock: 180.0, dailyInbound: 45.0, dailyOutbound: 12.0, todayStock: 213.0, storageLocation: '块磺仓库1#', remark: '原料入库45吨，销售出库12吨' },
  { date: '2026-05-15', materialName: '块磺 - 2#仓库', category: '块磺', yesterdayStock: 120.0, dailyInbound: 30.0, dailyOutbound: 8.0, todayStock: 142.0, storageLocation: '块磺仓库2#', remark: '原料入库30吨，销售出库8吨' },
  { date: '2026-05-15', materialName: '块磺 - 待加工区', category: '块磺', yesterdayStock: 40.0, dailyInbound: 12.0, dailyOutbound: 4.0, todayStock: 48.0, storageLocation: '块磺待加工区', remark: '原料入库12吨，粉碎领用4吨' },
]

// ============================================================
// 响应式状态
// ============================================================
const selectedDate = ref('2026-05-15')
const currentPage = ref(1)
const pageSize = ref(10)

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
// 过滤数据（按日期筛选）
// ============================================================
const filteredData = computed<SulfurStockRecord[]>(() => {
  return mockRecords.filter((r) => r.date === selectedDate.value)
})

// ============================================================
// 分页数据
// ============================================================
const pagedData = computed<SulfurStockRecord[]>(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredData.value.slice(start, end)
})

// ============================================================
// 摘要卡片数据
// ============================================================
const summaryData = computed(() => {
  const records = filteredData.value

  const totalStock = records.reduce((sum, r) => sum + r.todayStock, 0)
  const totalInbound = records.reduce((sum, r) => sum + r.dailyInbound, 0)
  const totalOutbound = records.reduce((sum, r) => sum + r.dailyOutbound, 0)

  const categories = new Set(records.map((r) => r.category))
  const categoryCount = categories.size
  const categoryDetail = Array.from(categories).join('、')

  return {
    totalStock: Number(totalStock.toFixed(2)),
    totalInbound: Number(totalInbound.toFixed(2)),
    totalOutbound: Number(totalOutbound.toFixed(2)),
    categoryCount,
    categoryDetail,
  }
})

// ============================================================
// 表格合计行
// ============================================================
const summaryMethod = (param: { columns: any[]; data: any[] }) => {
  const { columns, data } = param
  const sums: string[] = []

  columns.forEach((column: any, _: number) => {
    if (column.property === 'index' || !column.property) {
      sums[_] = ''
      return
    }
    if (column.property === 'date' || column.property === 'materialName' || column.property === 'storageLocation' || column.property === 'remark') {
      sums[_] = column.property === 'date' ? '' : column.property === 'materialName' ? '合计' : ''
      return
    }
    if (['yesterdayStock', 'dailyInbound', 'dailyOutbound', 'todayStock'].includes(column.property)) {
      const total = data.reduce((sum: number, row: any) => sum + (Number(row[column.property]) || 0), 0)
      sums[_] = formatNumber(Number(total.toFixed(2)))
      return
    }
    sums[_] = ''
  })

  return sums
}

// ============================================================
// 格式化数字
// ============================================================
const formatNumber = (value: number): string => {
  if (value === undefined || value === null) return '0.00'
  return value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// ============================================================
// 事件处理
// ============================================================
const handleDateChange = () => {
  currentPage.value = 1
}

const handleQuery = () => {
  currentPage.value = 1
}

const handlePageChange = () => {
  // 无需额外处理
}

const handleSizeChange = () => {
  currentPage.value = 1
}

// ============================================================
// 全屏切换
// ============================================================
const isFullscreen = ref(false)
const fullscreenIcon = computed(() => isFullscreen.value ? Close : FullScreen)
function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
  const containerClass = 'sulfur-stock-report'
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
$icon-bg-inbound: linear-gradient(135deg, #43a047, #66bb6a);
$icon-bg-outbound: linear-gradient(135deg, #fb8c00, #ffa726);
$icon-bg-count: linear-gradient(135deg, #78909c, #90a4ae);

.sulfur-stock-report {
  padding: 0 $spacing-5;
  background: $color-gray-100;
  min-height: 100vh;

  // ========== 页头 ==========
  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-5 $spacing-6;
    background: #fff;
    border-radius: $border-radius-lg;
    box-shadow: $shadow-sm;
    margin-bottom: $spacing-5;
    margin-top: $spacing-5;

    .header-left {
      display: flex;
      align-items: center;
      gap: $spacing-4;
    }

    .header-icon {
      width: 48px;
      height: 48px;
      border-radius: $border-radius-lg;
      background: linear-gradient(135deg, $color-primary, $color-secondary);
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
      color: $color-gray-900;
      margin: 0;
      line-height: $line-height-tight;
    }

    .header-subtitle {
      font-size: $font-size-sm;
      color: $color-gray-500;
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

    .toolbar-left {
      display: flex;
      align-items: center;
      gap: $spacing-3;
    }

    .toolbar-label {
      font-size: $font-size-sm;
      color: $color-gray-700;
      font-weight: $font-weight-medium;
      white-space: nowrap;
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
        &.inbound-icon {
          background: $icon-bg-inbound;
        }
        &.outbound-icon {
          background: $icon-bg-outbound;
        }
        &.count-icon {
          background: $icon-bg-count;
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

        &.highlight {
          color: $color-success;
        }
        &.muted {
          color: $color-warning;
        }
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

    .number-cell {
      font-weight: $font-weight-semibold;
      font-family: $font-family-mono;
      font-size: $font-size-sm;

      &.inbound {
        color: $color-success;
      }
      &.outbound {
        color: $color-warning;
      }
      &.today {
        color: $color-primary;
      }
    }

    .table-footer {
      padding: $spacing-3 $spacing-5;
      display: flex;
      justify-content: flex-end;
      border-top: 1px solid $color-gray-200;
      background: $color-gray-50;
    }
  }
}
</style>
