<template>
  <div class="longzhou-order-stats">
    <!-- 页头 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon :size="28"><DataLine /></el-icon>
        </div>
        <div class="header-text">
          <h1 class="header-title">龙州塑业 - 订单统计</h1>
          <p class="header-subtitle">26-27榨季 订单数据分析</p>
        </div>
      </div>
      <div class="header-right">
        <el-date-picker v-model="selectedYear" type="year" placeholder="选择年份" value-format="YYYY" size="default" style="width: 160px" />
      </div>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="16" class="summary-cards">
      <el-col :span="6">
        <el-card shadow="hover" class="summary-card">
          <div class="card-icon total-icon"><el-icon :size="22"><Document /></el-icon></div>
          <div class="card-body">
            <div class="card-label">订单总数</div>
            <div class="card-value">{{ statsData.totalOrders }}</div>
            <div class="card-sub">个订单</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="summary-card">
          <div class="card-icon quantity-icon"><el-icon :size="22"><Box /></el-icon></div>
          <div class="card-body">
            <div class="card-label">总订单数量</div>
            <div class="card-value">{{ statsData.totalQuantity }}</div>
            <div class="card-sub">套</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="summary-card">
          <div class="card-icon amount-icon"><el-icon :size="22"><Money /></el-icon></div>
          <div class="card-body">
            <div class="card-label">总合同金额</div>
            <div class="card-value">{{ statsData.totalAmount }}</div>
            <div class="card-sub">万元</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="summary-card">
          <div class="card-icon customer-icon"><el-icon :size="22"><User /></el-icon></div>
          <div class="card-body">
            <div class="card-label">客户数</div>
            <div class="card-value">{{ statsData.customerCount }}</div>
            <div class="card-sub">个客户</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 状态分布 + 月度趋势 -->
    <el-row :gutter="16" class="chart-row">
      <el-col :span="12">
        <el-card shadow="never" class="chart-card">
          <template #header><span>订单状态分布</span></template>
          <div ref="statusChartRef" style="height: 300px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never" class="chart-card">
          <template #header><span>月度订单趋势</span></template>
          <div ref="trendChartRef" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 客户排名 -->
    <el-card shadow="never" class="table-card">
      <template #header><span>客户订单排名</span></template>
      <el-table :data="customerRanking" border stripe style="width: 100%" size="small" :header-cell-style="headerCellStyle">
        <el-table-column type="index" label="排名" width="70" align="center" />
        <el-table-column prop="customerName" label="客户名称" min-width="150" />
        <el-table-column prop="orderCount" label="订单数" width="100" align="center" />
        <el-table-column prop="totalQuantity" label="订单数量（套）" width="150" align="right" />
        <el-table-column prop="totalAmount" label="合同金额（万元）" width="160" align="right" />
        <el-table-column label="占比" width="120" align="center">
          <template #default="{ row }">
            <el-progress :percentage="row.ratio" :stroke-width="14" />
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { DataLine, Document, Box, Money, User } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

const selectedYear = ref('2026')

// ============================================================
// Mock 统计数据
// ============================================================
const statsData = computed(() => {
  return {
    totalOrders: 15,
    totalQuantity: '640,500',
    totalAmount: '128.5',
    customerCount: 8
  }
})

interface CustomerRank {
  customerName: string
  orderCount: number
  totalQuantity: number
  totalAmount: number
  ratio: number
}

const customerRanking = ref<CustomerRank[]>([
  { customerName: 'A集团', orderCount: 2, totalQuantity: 80000, totalAmount: 37.0, ratio: 28.5 },
  { customerName: 'B糖业', orderCount: 1, totalQuantity: 80000, totalAmount: 30.7, ratio: 23.9 },
  { customerName: 'E糖业', orderCount: 1, totalQuantity: 60000, totalAmount: 22.6, ratio: 17.6 },
  { customerName: 'F糖业', orderCount: 1, totalQuantity: 100000, totalAmount: 35.6, ratio: 27.7 },
  { customerName: 'G糖业', orderCount: 1, totalQuantity: 70000, totalAmount: 25.9, ratio: 20.2 }
])

const statusChartRef = ref<HTMLElement>()
const trendChartRef = ref<HTMLElement>()

// ============================================================
// 初始化图表
// ============================================================
onMounted(() => {
  nextTick(() => {
    initStatusChart()
    initTrendChart()
  })
})

const initStatusChart = () => {
  if (!statusChartRef.value) return
  const chart = echarts.init(statusChartRef.value)
  chart.setOption({
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      label: { formatter: '{b}: {c}个 ({d}%)' },
      data: [
        { value: 10, name: '待审核', itemStyle: { color: '#909399' } },
        { value: 2, name: '生产中', itemStyle: { color: '#e6a23c' } },
        { value: 2, name: '已发货', itemStyle: { color: '#67c23a' } },
        { value: 0, name: '已开票', itemStyle: { color: '#409eff' } },
        { value: 0, name: '回款进度', itemStyle: { color: '#f56c6c' } }
      ]
    }]
  })
}

const initTrendChart = () => {
  if (!trendChartRef.value) return
  const chart = echarts.init(trendChartRef.value)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['订单数量（套）', '合同金额（万元）'], bottom: 0 },
    xAxis: { type: 'category', data: ['5月', '6月', '7月', '8月'] },
    yAxis: [
      { type: 'value', name: '订单数量（套）' },
      { type: 'value', name: '合同金额（万元）', position: 'right' }
    ],
    series: [
      { name: '订单数量（套）', type: 'bar', data: [110000, 260000, 210000, 60500], itemStyle: { color: '#e8590c' } },
      { name: '合同金额（万元）', type: 'line', yAxisIndex: 1, data: [20.3, 48.7, 39.6, 19.9], itemStyle: { color: '#409eff' } }
    ]
  })
}

// ============================================================
// 表头样式
// ============================================================
const headerCellStyle = () => ({
  background: '#f5f7fa', color: '#303133', fontWeight: 600, fontSize: '13px'
})
</script>

<style lang="scss" scoped>
@use '@/scss/variables' as *;

.longzhou-order-stats {
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
      background: linear-gradient(135deg, #e8590c, #f08200);
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

  .summary-cards {
    margin-bottom: $spacing-5;

    .summary-card {
      display: flex;
      align-items: center;
      padding: $spacing-4 $spacing-5;
      transition: $transition-base;
      border: 1px solid transparent;
      &:hover { border-color: $color-primary-light; box-shadow: $shadow-md; }

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

        &.total-icon { background: linear-gradient(135deg, #1a73e8, #4a90e2); }
        &.quantity-icon { background: linear-gradient(135deg, #00bcd4, #26c6da); }
        &.amount-icon { background: linear-gradient(135deg, #e8590c, #ff922b); }
        &.customer-icon { background: linear-gradient(135deg, #43a047, #66bb6a); }
      }

      .card-body { flex: 1; min-width: 0; }

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

  .chart-row {
    margin-bottom: $spacing-5;

    .chart-card {
      border-radius: $border-radius-lg;
      box-shadow: $shadow-base;
      overflow: hidden;
    }
  }

  .table-card {
    background: #fff;
    border-radius: $border-radius-lg;
    box-shadow: $shadow-base;
    overflow: hidden;

    :deep(.el-table) {
      font-size: $font-size-sm;
      .el-table__header-wrapper th { background: $color-gray-50; }
    }
  }
}
</style>
