<template>
  <div class="stock-material-page">
    <!-- 页头 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon :size="28"><Coin /></el-icon>
        </div>
        <div class="header-text">
          <h1 class="header-title">亚辉塑业 - 原料耗用报表</h1>
          <p class="header-subtitle">26-27榨季 硫磺原料领用/耗用统计</p>
        </div>
      </div>
    </div>

    <!-- 顶部统计卡片 -->
    <el-row :gutter="16" class="summary-cards">
      <el-col :span="6">
        <el-card shadow="hover" class="summary-card">
          <div class="card-icon total-icon">
            <el-icon :size="22"><Coin /></el-icon>
          </div>
          <div class="card-body">
            <div class="card-label">原料总领用(吨)</div>
            <div class="card-value">{{ summaryData.totalReceive }}</div>
            <div class="card-sub">含所有原料</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="summary-card">
          <div class="card-icon output-icon">
            <el-icon :size="22"><DataLine /></el-icon>
          </div>
          <div class="card-body">
            <div class="card-label">总产量(吨)</div>
            <div class="card-value">{{ summaryData.totalOutput }}</div>
            <div class="card-sub">成品合计</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="summary-card">
          <div class="card-icon loss-icon">
            <el-icon :size="22"><WarningFilled /></el-icon>
          </div>
          <div class="card-body">
            <div class="card-label">总损耗(吨)</div>
            <div class="card-value highlight">{{ summaryData.totalLoss }}</div>
            <div class="card-sub">领用 - 产量</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="summary-card">
          <div class="card-icon rate-icon">
            <el-icon :size="22"><TrendCharts /></el-icon>
          </div>
          <div class="card-body">
            <div class="card-label">平均损耗率(%)</div>
            <div class="card-value">{{ summaryData.avgLossRate }}</div>
            <div class="card-sub">损耗/领用</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 报表卡片 -->
    <div class="report-card">
      <!-- 卡片头部：tab切换 -->
      <div class="card-header">
        <el-radio-group v-model="activeTab" size="small">
          <el-radio-button value="detail" label="原料耗用明细" />
          <el-radio-button value="monthly" label="月度汇总" />
        </el-radio-group>
        <el-button text @click="toggleFullscreen" :icon="fullscreenIcon" style="margin-left:auto;padding:0 12px;font-size:18px" />
      </div>

      <!-- 表格区域 -->
      <div class="card-body">
        <!-- 原料耗用明细表 -->
        <el-table
          v-if="activeTab === 'detail'"
          :data="currentData"
          :max-height="800"
          border
          stripe
          style="width: 100%"
          :header-cell-style="headerCellStyle"
          size="small"
          highlight-current-row
        >
          <el-table-column prop="date" label="日期" min-width="110" align="center" show-overflow-tooltip />
          <el-table-column prop="materialName" label="原料名称" min-width="140" align="center" show-overflow-tooltip />
          <el-table-column prop="groupName" label="组别" min-width="90" align="center" show-overflow-tooltip />
          <el-table-column prop="receiveQty" label="领取数量(吨)" min-width="120" align="center" show-overflow-tooltip />
          <el-table-column prop="handler" label="经办人" min-width="90" align="center" show-overflow-tooltip />
          <el-table-column prop="outputQty" label="产量(吨)" min-width="100" align="center" show-overflow-tooltip />
          <el-table-column prop="lossQty" label="损耗(吨)" min-width="100" align="center" show-overflow-tooltip />
          <el-table-column prop="lossRate" label="损耗率(%)" min-width="110" align="center" show-overflow-tooltip>
            <template #default="{ row }">
              <span :class="lossRateClass(row.lossRate)">{{ row.lossRate }}%</span>
            </template>
          </el-table-column>
          <el-table-column prop="leader" label="组长" min-width="90" align="center" show-overflow-tooltip />
        </el-table>

        <!-- 月度汇总表 -->
        <el-table
          v-else
          :data="currentData"
          :max-height="800"
          border
          stripe
          style="width: 100%"
          :header-cell-style="headerCellStyle"
          size="small"
          highlight-current-row
        >
          <el-table-column prop="month" label="月份" min-width="110" align="center" show-overflow-tooltip />
          <el-table-column prop="totalReceive" label="原料总领用(吨)" min-width="140" align="center" show-overflow-tooltip />
          <el-table-column prop="totalOutput" label="总产量(吨)" min-width="120" align="center" show-overflow-tooltip />
          <el-table-column prop="totalLoss" label="总损耗(吨)" min-width="120" align="center" show-overflow-tooltip />
          <el-table-column prop="avgLossRate" label="平均损耗率(%)" min-width="130" align="center" show-overflow-tooltip>
            <template #default="{ row }">
              <span :class="lossRateClass(row.avgLossRate)">{{ row.avgLossRate }}%</span>
            </template>
          </el-table-column>
          <el-table-column prop="laborCost" label="人工费(元)" min-width="120" align="center" show-overflow-tooltip />
        </el-table>
      </div>

      <!-- 分页器 -->
      <div class="card-footer">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="totalCount"
          layout="total, sizes, prev, pager, next, jumper"
          background
          small
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Coin, DataLine, WarningFilled, TrendCharts, FullScreen, Close } from '@element-plus/icons-vue'

// ============================================================
// Tab 切换
// ============================================================
const activeTab = ref('detail')
const currentPage = ref(1)
const pageSize = ref(10)

watch(activeTab, () => {
  currentPage.value = 1
})

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
// 损耗率颜色
// ============================================================
const lossRateClass = (rate: number) => {
  if (rate > 5) return 'loss-rate-high'
  if (rate > 3.5) return 'loss-rate-mid'
  return 'loss-rate-low'
}

// ============================================================
// 组长列表
// ============================================================
// ============================================================
// Mock 数据 - 原料耗用明细
// ============================================================
const mockDetailData: any[] = [
  { date: '2026-10-05', materialName: '硫磺(颗粒)', groupName: '硫磺组', receiveQty: 28.5, handler: '韦珍军', outputQty: 27.3, lossRate: 4.21, leader: '农国宝' },
  { date: '2026-10-06', materialName: '硫磺(片状)', groupName: '硫磺组', receiveQty: 25.0, handler: '何建武', outputQty: 24.1, lossRate: 3.60, leader: '农国宝' },
  { date: '2026-10-07', materialName: '硫磺(颗粒)', groupName: '粉碎组', receiveQty: 32.0, handler: '冯桂光', outputQty: 30.8, lossRate: 3.75, leader: '陆加俭' },
  { date: '2026-10-08', materialName: '硫磺(片状)', groupName: '粉碎组', receiveQty: 22.0, handler: '蓝灵丰', outputQty: 21.0, lossRate: 4.55, leader: '陆加俭' },
  { date: '2026-10-09', materialName: '硫磺(颗粒)', groupName: '硫磺组', receiveQty: 30.0, handler: '许利妹', outputQty: 28.9, lossRate: 3.67, leader: '农国宝' },
  { date: '2026-10-10', materialName: '硫磺(片状)', groupName: '硫磺组', receiveQty: 26.5, handler: '韦珍军', outputQty: 25.5, lossRate: 3.77, leader: '农国宝' },
  { date: '2026-10-11', materialName: '硫磺(颗粒)', groupName: '粉碎组', receiveQty: 35.0, handler: '何建武', outputQty: 33.6, lossRate: 4.00, leader: '陆加俭' },
  { date: '2026-10-12', materialName: '硫磺(片状)', groupName: '粉碎组', receiveQty: 20.0, handler: '冯桂光', outputQty: 19.2, lossRate: 4.00, leader: '陆加俭' },
  { date: '2026-10-13', materialName: '硫磺(颗粒)', groupName: '硫磺组', receiveQty: 31.0, handler: '蓝灵丰', outputQty: 29.5, lossRate: 4.84, leader: '农国宝' },
  { date: '2026-10-14', materialName: '硫磺(片状)', groupName: '硫磺组', receiveQty: 24.0, handler: '许利妹', outputQty: 23.2, lossRate: 3.33, leader: '农国宝' },
  { date: '2026-10-15', materialName: '硫磺(颗粒)', groupName: '粉碎组', receiveQty: 29.0, handler: '韦珍军', outputQty: 27.8, lossRate: 4.14, leader: '陆加俭' },
  { date: '2026-10-16', materialName: '硫磺(片状)', groupName: '粉碎组', receiveQty: 27.0, handler: '何建武', outputQty: 26.1, lossRate: 3.33, leader: '陆加俭' },
  { date: '2026-10-17', materialName: '硫磺(颗粒)', groupName: '硫磺组', receiveQty: 33.0, handler: '冯桂光', outputQty: 31.7, lossRate: 3.94, leader: '农国宝' },
  { date: '2026-10-18', materialName: '硫磺(片状)', groupName: '硫磺组', receiveQty: 23.0, handler: '蓝灵丰', outputQty: 22.0, lossRate: 4.35, leader: '农国宝' },
  { date: '2026-10-19', materialName: '硫磺(颗粒)', groupName: '粉碎组', receiveQty: 34.0, handler: '许利妹', outputQty: 32.5, lossRate: 4.41, leader: '陆加俭' },
]

// 补充 lossQty 字段
mockDetailData.forEach((item: any) => {
  item.lossQty = parseFloat((item.receiveQty - item.outputQty).toFixed(2))
})

// ============================================================
// Mock 数据 - 月度汇总
// ============================================================
const mockMonthlyData: any[] = [
  { month: '2026-10', totalReceive: 295.0, totalOutput: 283.2, totalLoss: 11.80, avgLossRate: 4.00, laborCost: 45200 },
  { month: '2026-11', totalReceive: 310.5, totalOutput: 298.8, totalLoss: 11.70, avgLossRate: 3.77, laborCost: 46800 },
  { month: '2026-12', totalReceive: 288.0, totalOutput: 277.5, totalLoss: 10.50, avgLossRate: 3.65, laborCost: 43500 },
  { month: '2027-01', totalReceive: 325.0, totalOutput: 312.0, totalLoss: 13.00, avgLossRate: 4.00, laborCost: 48900 },
  { month: '2027-02', totalReceive: 280.5, totalOutput: 270.0, totalLoss: 10.50, avgLossRate: 3.74, laborCost: 42100 },
  { month: '2027-03', totalReceive: 342.0, totalOutput: 328.5, totalLoss: 13.50, avgLossRate: 3.95, laborCost: 51300 },
  { month: '2027-04', totalReceive: 298.0, totalOutput: 287.0, totalLoss: 11.00, avgLossRate: 3.69, laborCost: 44800 },
]

// ============================================================
// 顶部统计卡片数据
// ============================================================
const summaryData = computed(() => {
  let totalReceive = 0
  let totalOutput = 0
  if (activeTab.value === 'detail') {
    mockDetailData.forEach((item: any) => {
      totalReceive += item.receiveQty
      totalOutput += item.outputQty
    })
  } else {
    mockMonthlyData.forEach((item: any) => {
      totalReceive += item.totalReceive
      totalOutput += item.totalOutput
    })
  }
  const totalLoss = totalReceive - totalOutput
  const avgLossRate = totalReceive > 0 ? parseFloat(((totalLoss / totalReceive) * 100).toFixed(2)) : 0
  return {
    totalReceive: parseFloat(totalReceive.toFixed(2)),
    totalOutput: parseFloat(totalOutput.toFixed(2)),
    totalLoss: parseFloat(totalLoss.toFixed(2)),
    avgLossRate,
  }
})

// ============================================================
// 计算属性
// ============================================================
const currentData = computed(() => {
  const data = activeTab.value === 'detail' ? mockDetailData : mockMonthlyData
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return data.slice(start, end)
})

const totalCount = computed(() => {
  return (activeTab.value === 'detail' ? mockDetailData : mockMonthlyData).length
})

// ============================================================
// 全屏切换
// ============================================================
const isFullscreen = ref(false)
const fullscreenIcon = computed(() => isFullscreen.value ? Close : FullScreen)
function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
  const containerClass = 'stock-material-page'
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

.stock-material-page {
  padding: 0 $spacing-5;
  background: $color-gray-100;
  min-height: 100vh;

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
      background: linear-gradient(135deg, #e67e22, #d35400);
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

  // 统计卡片
  .summary-cards {
    margin-bottom: $spacing-5;

    .summary-card {
      border-radius: $border-radius-lg;
      transition: all $transition-base;
      border: none;

      &:hover {
        transform: translateY(-2px);
        box-shadow: $shadow-md;
      }

      :deep(.el-card__body) {
        display: flex;
        align-items: center;
        padding: $spacing-4 $spacing-5;
        gap: $spacing-4;
      }

      .card-icon {
        width: 48px;
        height: 48px;
        border-radius: $border-radius-lg;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .total-icon {
        background: linear-gradient(135deg, #e67e22, #f39c12);
        color: #fff;
      }

      .output-icon {
        background: linear-gradient(135deg, #1a73e8, #4a90e2);
        color: #fff;
      }

      .loss-icon {
        background: linear-gradient(135deg, #e53935, #ef5350);
        color: #fff;
      }

      .rate-icon {
        background: linear-gradient(135deg, #43a047, #66bb6a);
        color: #fff;
      }

      .card-body {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;

        .card-label {
          font-size: $font-size-xs;
          color: $color-gray-500;
          line-height: $line-height-normal;
          white-space: nowrap;
        }

        .card-value {
          font-size: $font-size-2xl;
          font-weight: $font-weight-bold;
          color: $color-gray-900;
          line-height: $line-height-tight;

          &.highlight {
            color: $color-danger;
          }
        }

        .card-sub {
          font-size: $font-size-xs;
          color: $color-gray-400;
          line-height: $line-height-normal;
        }
      }
    }
  }

  // 报表卡片
  .report-card {
    background: #fff;
    border-radius: $border-radius-lg;
    box-shadow: $shadow-base;
    overflow: hidden;

    .card-header {
      padding: $spacing-3 $spacing-5;
      background: $color-gray-50;
      border-bottom: 1px solid $color-gray-200;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: $spacing-2;
    }

    .card-body {
      padding: $spacing-4;
      overflow-x: auto;

      :deep(.el-table) {
        font-size: $font-size-sm;

        .el-table__header-wrapper th {
          background: $color-gray-50;
        }
      }
    }

    .card-footer {
      padding: $spacing-3 $spacing-5;
      display: flex;
      justify-content: flex-end;
      border-top: 1px solid $color-gray-200;
      background: $color-gray-50;
    }
  }
}

// 损耗率颜色
.loss-rate-low {
  color: $color-success;
  font-weight: $font-weight-medium;
}

.loss-rate-mid {
  color: $color-warning;
  font-weight: $font-weight-medium;
}

.loss-rate-high {
  color: $color-danger;
  font-weight: $font-weight-bold;
}
</style>
