<template>
  <div class="order-stats-page">
    <!-- 页头 -->
    <div class="page-header">
      <div class="header-badge" :style="{ background: 'linear-gradient(135deg,#667eea,#764ba2)' }">
        <el-icon :size="28"><DataLine /></el-icon>
      </div>
      <div class="header-info">
        <h1 class="page-title">华维食品 - 订单统计</h1>
        <p class="page-subtitle">26-27榨季 硫磺采购销售数据统计看板</p>
      </div>
      <div class="header-actions">
        <el-radio-group v-model="period" size="small">
          <el-radio-button value="year">年度</el-radio-button>
          <el-radio-button value="month">月度</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <!-- KPI 卡片 -->
    <el-row :gutter="16" class="kpi-row">
      <el-col :span="6">
        <el-card shadow="never" class="kpi-card">
          <div class="kpi-icon blue"><ShoppingCart /></div>
          <div class="kpi-body">
            <div class="kpi-label">采购总量（吨）</div>
            <div class="kpi-value">{{ totalPurchaseQty.toLocaleString() }}</div>
            <div class="kpi-sub">采购合同 {{ purchaseContractCount }} 份</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="kpi-card">
          <div class="kpi-icon green"><TrendCharts /></div>
          <div class="kpi-body">
            <div class="kpi-label">销售总量（吨）</div>
            <div class="kpi-value">{{ totalSaleQty.toLocaleString() }}</div>
            <div class="kpi-sub">销售合同 {{ saleContractCount }} 份</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="kpi-card">
          <div class="kpi-icon orange"><Coin /></div>
          <div class="kpi-body">
            <div class="kpi-label">销售总额（元）</div>
            <div class="kpi-value">{{ totalSaleAmount.toLocaleString('zh-CN') }}</div>
            <div class="kpi-sub">平均单价 {{ avgSalePrice }} 元/吨</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="kpi-card">
          <div class="kpi-icon purple"><User /></div>
          <div class="kpi-body">
            <div class="kpi-label">合作伙伴</div>
            <div class="kpi-value">{{ supplierCount + customerCount }}</div>
            <div class="kpi-sub">{{ supplierCount }} 供应商 / {{ customerCount }} 客户</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 第一行图表 -->
    <el-row :gutter="16" class="chart-row">
      <el-col :span="12">
        <el-card shadow="never" class="chart-card">
          <template #header><span class="card-title">📊 月度采购 vs 销售（吨）</span></template>
          <div ref="compareChartRef" class="chart-box"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never" class="chart-card">
          <template #header><span class="card-title">📈 月度金额趋势（万元）</span></template>
          <div ref="trendChartRef" class="chart-box"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 第二行图表 -->
    <el-row :gutter="16" class="chart-row">
      <el-col :span="8">
        <el-card shadow="never" class="chart-card">
          <template #header><span class="card-title">🥇 供应商采购排行</span></template>
          <div ref="supplierChartRef" class="chart-box"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never" class="chart-card">
          <template #header><span class="card-title">🥇 客户销售排行</span></template>
          <div ref="customerChartRef" class="chart-box"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never" class="chart-card">
          <template #header><span class="card-title">🧩 产品类型分布</span></template>
          <div ref="productChartRef" class="chart-box"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 第三行 -->
    <el-row :gutter="16" class="chart-row">
      <el-col :span="12">
        <el-card shadow="never" class="chart-card">
          <template #header><span class="card-title">💰 单价走势（元/吨）</span></template>
          <div ref="priceChartRef" class="chart-box"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never" class="chart-card">
          <template #header><span class="card-title">📋 区域销售额分布</span></template>
          <div ref="regionChartRef" class="chart-box"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 明细表 -->
    <el-card shadow="never" class="data-table-card">
      <template #header><span class="card-title">📋 月度数据明细</span></template>
      <el-table :data="monthlyData" border stripe size="small" max-height="400">
        <el-table-column prop="month" label="月份" width="100" />
        <el-table-column prop="purchaseQty" label="采购量(吨)" width="120" align="right" />
        <el-table-column prop="purchaseAmount" label="采购金额(万元)" width="140" align="right" />
        <el-table-column prop="saleQty" label="销售量(吨)" width="120" align="right" />
        <el-table-column prop="saleAmount" label="销售金额(万元)" width="140" align="right" />
        <el-table-column prop="purchasePrice" label="采购均价(元/吨)" width="140" align="right" />
        <el-table-column prop="salePrice" label="销售均价(元/吨)" width="140" align="right" />
        <el-table-column prop="profit" label="价差(元/吨)" width="120" align="right">
          <template #default="{ row }">
            <span :style="{ color: row.profit > 0 ? '#67c23a' : '#f56c6c', fontWeight: 600 }">
              {{ row.profit > 0 ? '+' : '' }}{{ row.profit.toFixed(2) }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { DataLine, ShoppingCart, TrendCharts, Coin, User } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

// ── 时间周期切换 ────────────────
const period = ref('year')

// ── 模拟数据 ────────────────────

// 月度数据（2025.6 ~ 2026.3 共10个月）
const monthLabels = ['6月', '7月', '8月', '9月', '10月', '11月', '12月', '1月', '2月', '3月']
const monthKeys = ['2025-06', '2025-07', '2025-08', '2025-09', '2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03']

// 采购月度数据
const purchaseByMonth = [520, 480, 610, 550, 490, 530, 580, 420, 380, 450]
const saleByMonth = [500, 450, 580, 520, 460, 500, 550, 400, 350, 420]
const purchaseAmountByMonth = [132.6, 122.9, 156.8, 141.4, 126.0, 136.2, 149.1, 108.0, 97.7, 115.7]
const saleAmountByMonth = [142.5, 129.6, 166.5, 149.8, 132.5, 144.0, 158.4, 115.2, 102.9, 122.6]
const purchasePriceByMonth = [2550, 2560, 2570, 2570, 2570, 2570, 2570, 2570, 2570, 2570]
const salePriceByMonth = [2850, 2880, 2870, 2880, 2880, 2880, 2880, 2880, 2940, 2920]

// 供应商数据
const supplierData = [
  { name: '广西泰谷化学（朱博宇）', qty: 470, amount: 120.2 },
  { name: '蒋献勇', qty: 565, amount: 142.8 },
  { name: '中国外运', qty: 290, amount: 74.5 },
  { name: '广西钦州金雨伞', qty: 150, amount: 38.9 },
  { name: '北部湾港务', qty: 210, amount: 54.1 },
  { name: '上海中石化', qty: 320, amount: 82.6 }
]

// 客户数据
const customerData = [
  { name: '利方达公司', qty: 1730, amount: 497.8 },
  { name: '昆明伯明原公司', qty: 1500, amount: 420.0 },
  { name: '云南金星化工', qty: 1250, amount: 365.0 },
  { name: '贵州磷化集团', qty: 800, amount: 232.0 },
  { name: '广东南方制糖', qty: 600, amount: 174.0 }
]

// 区域数据
const regionData = [
  { name: '广西片区', value: 2230 },
  { name: '云南片区', value: 2750 },
  { name: '贵州片区', value: 800 },
  { name: '广东片区', value: 600 }
]

// ── KPI 计算 ────────────────────
const totalPurchaseQty = computed(() => purchaseByMonth.reduce((a, b) => a + b, 0))
const totalSaleQty = computed(() => saleByMonth.reduce((a, b) => a + b, 0))
const totalSaleAmount = computed(() => saleAmountByMonth.reduce((a, b) => a + b, 0) * 10000)
const avgSalePrice = computed(() => Math.round(salePriceByMonth.reduce((a, b) => a + b, 0) / salePriceByMonth.length))
const purchaseContractCount = 24
const saleContractCount = 18
const supplierCount = supplierData.length
const customerCount = customerData.length

// 月度明细数据
const monthlyData = monthKeys.map((key, i) => ({
  month: key,
  purchaseQty: purchaseByMonth[i],
  purchaseAmount: purchaseAmountByMonth[i],
  saleQty: saleByMonth[i],
  saleAmount: saleAmountByMonth[i],
  purchasePrice: purchasePriceByMonth[i],
  salePrice: salePriceByMonth[i],
  profit: salePriceByMonth[i] - purchasePriceByMonth[i]
}))

// ── Chart refs ────────────────────
const compareChartRef = ref<HTMLElement>()
const trendChartRef = ref<HTMLElement>()
const supplierChartRef = ref<HTMLElement>()
const customerChartRef = ref<HTMLElement>()
const productChartRef = ref<HTMLElement>()
const priceChartRef = ref<HTMLElement>()
const regionChartRef = ref<HTMLElement>()

const chartInstances: echarts.ECharts[] = []

function initChart(el: HTMLElement | undefined): echarts.ECharts | null {
  if (!el) return null
  const instance = echarts.init(el)
  chartInstances.push(instance)
  return instance
}

function disposeCharts() {
  chartInstances.forEach(inst => inst.dispose())
  chartInstances.length = 0
}

// ── 渲染图表 ────────────────────
function renderCompareChart() {
  const chart = initChart(compareChartRef.value)
  if (!chart) return
  chart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['采购量', '销售量'], bottom: 0 },
    grid: { left: 50, right: 20, top: 20, bottom: 40 },
    xAxis: { type: 'category', data: monthLabels, axisLabel: { fontSize: 11 } },
    yAxis: { type: 'value', name: '吨' },
    series: [
      {
        name: '采购量', type: 'bar', barWidth: 20,
        data: purchaseByMonth,
        itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#409eff' }, { offset: 1, color: '#79bbff' }
        ]) }
      },
      {
        name: '销售量', type: 'bar', barWidth: 20,
        data: saleByMonth,
        itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#67c23a' }, { offset: 1, color: '#95d475' }
        ]) }
      }
    ]
  })
}

function renderTrendChart() {
  const chart = initChart(trendChartRef.value)
  if (!chart) return
  chart.setOption({
    tooltip: { trigger: 'axis', valueFormatter: (v: number) => v + ' 万元' },
    legend: { data: ['采购金额', '销售金额'], bottom: 0 },
    grid: { left: 50, right: 20, top: 20, bottom: 40 },
    xAxis: { type: 'category', data: monthLabels },
    yAxis: { type: 'value', name: '万元' },
    series: [
      {
        name: '采购金额', type: 'line', smooth: true,
        data: purchaseAmountByMonth,
        lineStyle: { color: '#409eff', width: 3 },
        itemStyle: { color: '#409eff' },
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(64,158,255,0.3)' }, { offset: 1, color: 'rgba(64,158,255,0.05)' }
        ]) }
      },
      {
        name: '销售金额', type: 'line', smooth: true,
        data: saleAmountByMonth,
        lineStyle: { color: '#67c23a', width: 3 },
        itemStyle: { color: '#67c23a' },
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(103,194,58,0.3)' }, { offset: 1, color: 'rgba(103,194,58,0.05)' }
        ]) }
      }
    ]
  })
}

function renderSupplierChart() {
  const chart = initChart(supplierChartRef.value)
  if (!chart) return
  const names = supplierData.map(d => d.name).reverse()
  const vals = supplierData.map(d => d.qty).reverse()
  chart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 120, right: 30, top: 10, bottom: 10 },
    xAxis: { type: 'value', name: '吨' },
    yAxis: { type: 'category', data: names, axisLabel: { fontSize: 11 } },
    series: [{
      type: 'bar', data: vals,
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#409eff' }, { offset: 1, color: '#a0cfff' }
        ])
      },
      label: { show: true, position: 'right', formatter: (p: any) => p.value + '吨', fontSize: 11 }
    }]
  })
}

function renderCustomerChart() {
  const chart = initChart(customerChartRef.value)
  if (!chart) return
  const names = customerData.map(d => d.name).reverse()
  const vals = customerData.map(d => d.qty).reverse()
  chart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 110, right: 30, top: 10, bottom: 10 },
    xAxis: { type: 'value', name: '吨' },
    yAxis: { type: 'category', data: names, axisLabel: { fontSize: 11 } },
    series: [{
      type: 'bar', data: vals,
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#67c23a' }, { offset: 1, color: '#b3e19d' }
        ])
      },
      label: { show: true, position: 'right', formatter: (p: any) => p.value + '吨', fontSize: 11 }
    }]
  })
}

function renderProductChart() {
  const chart = initChart(productChartRef.value)
  if (!chart) return
  chart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c}吨 ({d}%)' },
    legend: { bottom: 0, orient: 'horizontal' },
    series: [{
      type: 'pie', radius: ['40%', '70%'], center: ['50%', '45%'],
      data: [
        { name: '粒磺', value: 3580, itemStyle: { color: '#409eff' } },
        { name: '块磺', value: 1250, itemStyle: { color: '#67c23a' } },
        { name: '液硫（原料）', value: 1860, itemStyle: { color: '#e6a23c' } },
        { name: '固硫（原料）', value: 1010, itemStyle: { color: '#f56c6c' } }
      ],
      label: { formatter: '{b}\n{d}%', fontSize: 11 },
      emphasis: {
        itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.2)' }
      }
    }]
  })
}

function renderPriceChart() {
  const chart = initChart(priceChartRef.value)
  if (!chart) return
  chart.setOption({
    tooltip: { trigger: 'axis', valueFormatter: (v: number) => v + ' 元/吨' },
    legend: { data: ['采购均价', '销售均价'], bottom: 0 },
    grid: { left: 50, right: 50, top: 20, bottom: 40 },
    xAxis: { type: 'category', data: monthLabels },
    yAxis: { type: 'value', name: '元/吨', min: 2400 },
    series: [
      {
        name: '采购均价', type: 'line', smooth: true,
        data: purchasePriceByMonth,
        lineStyle: { color: '#f56c6c', width: 2 },
        itemStyle: { color: '#f56c6c' },
        symbol: 'circle', symbolSize: 8
      },
      {
        name: '销售均价', type: 'line', smooth: true,
        data: salePriceByMonth,
        lineStyle: { color: '#67c23a', width: 2 },
        itemStyle: { color: '#67c23a' },
        symbol: 'diamond', symbolSize: 10
      },
      {
        name: '价差', type: 'bar', barWidth: 12,
        yAxisIndex: 0,
        data: salePriceByMonth.map((s, i) => s - purchasePriceByMonth[i]),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#e6a23c' }, { offset: 1, color: '#f4d19e' }
          ])
        }
      }
    ]
  })
}

function renderRegionChart() {
  const chart = initChart(regionChartRef.value)
  if (!chart) return
  chart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c}吨 ({d}%)' },
    legend: { bottom: 0, orient: 'horizontal' },
    series: [{
      type: 'pie', radius: ['30%', '60%'],
      center: ['50%', '45%'],
      roseType: 'radius',
      data: regionData.map(d => ({
        name: d.name,
        value: d.value,
        itemStyle: {
          color: d.name.includes('广西') ? '#409eff' :
                 d.name.includes('云南') ? '#67c23a' :
                 d.name.includes('贵州') ? '#e6a23c' : '#f56c6c'
        }
      })),
      label: { formatter: '{b}\n{d}%', fontSize: 11 }
    }]
  })
}

// ── 窗口大小变化自适应 ────────────
let resizeHandler: (() => void) | null = null

onMounted(() => {
  renderCompareChart()
  renderTrendChart()
  renderSupplierChart()
  renderCustomerChart()
  renderProductChart()
  renderPriceChart()
  renderRegionChart()

  resizeHandler = () => chartInstances.forEach(inst => inst.resize())
  window.addEventListener('resize', resizeHandler)
})

onUnmounted(() => {
  if (resizeHandler) window.removeEventListener('resize', resizeHandler)
  disposeCharts()
})

watch(period, () => {
  // 重新渲染（模拟数据不变化，仅做演示）
  disposeCharts()
  renderCompareChart()
  renderTrendChart()
  renderSupplierChart()
  renderCustomerChart()
  renderProductChart()
  renderPriceChart()
  renderRegionChart()
})
</script>

<style lang="scss" scoped>
.order-stats-page {
  padding: 20px;
  background: #f0f2f5;
  min-height: calc(100vh - 60px);
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  background: #fff;
  padding: 20px 24px;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,.06);

  .header-badge {
    width: 56px; height: 56px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    flex-shrink: 0;
  }

  .header-info { flex: 1; }

  .page-title {
    font-size: 20px; font-weight: 700; color: #1a1a2e;
    margin: 0 0 4px;
  }

  .page-subtitle {
    font-size: 13px; color: #999; margin: 0;
  }
}

.kpi-row {
  margin-bottom: 16px;
}

.kpi-card {
  border-radius: 12px;
  ::v-deep(.el-card__body) { display: flex; align-items: center; padding: 20px; }
}

.kpi-icon {
  width: 48px; height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #fff;
  flex-shrink: 0;

  &.blue { background: linear-gradient(135deg, #409eff, #79bbff); }
  &.green { background: linear-gradient(135deg, #67c23a, #95d475); }
  &.orange { background: linear-gradient(135deg, #e6a23c, #f4d19e); }
  &.purple { background: linear-gradient(135deg, #9c27b0, #ce93d8); }
}

.kpi-body {
  margin-left: 16px;
  flex: 1;
}

.kpi-label {
  font-size: 13px;
  color: #909399;
  margin-bottom: 4px;
}

.kpi-value {
  font-size: 26px;
  font-weight: 700;
  color: #1a1a2e;
  line-height: 1.2;
}

.kpi-sub {
  font-size: 12px;
  color: #c0c4cc;
  margin-top: 2px;
}

.chart-row {
  margin-bottom: 16px;
}

.chart-card {
  border-radius: 12px;
  margin-bottom: 0;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.chart-box {
  width: 100%;
  height: 320px;
}

.data-table-card {
  border-radius: 12px;
}
</style>
