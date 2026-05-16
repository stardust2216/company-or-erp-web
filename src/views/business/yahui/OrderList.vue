<template>
  <div class="hw-order-page">
    <!-- 页头 -->
    <div class="page-header">
      <div class="header-badge" :style="{ background: 'linear-gradient(135deg, #f093fb, #f5576c)' }">
        <el-icon :size="28"><List /></el-icon>
      </div>
      <div class="header-info">
        <h1 class="page-title">华维食品 - 硫磺订单管理</h1>
        <p class="page-subtitle">26-27榨季 硫磺采购销售数据总览</p>
      </div>
    </div>

    <!-- 统计摘要卡片 -->
    <el-card class="summary-card" shadow="never">
      <div class="summary-stats">
        <div class="stat-item">
          <span class="stat-label">当前视图</span>
          <span class="stat-value">{{ currentTabLabel }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">记录数</span>
          <span class="stat-value">{{ filteredData.length }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">总数量（吨）</span>
          <span class="stat-value">{{ totalQuantity.toLocaleString('zh-CN', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">总金额（元）</span>
          <span class="stat-value">{{ totalAmount.toLocaleString('zh-CN', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">客户数</span>
          <span class="stat-value">{{ uniqueCustomerCount }}</span>
        </div>
      </div>
    </el-card>

    <!-- 表格卡片 -->
    <el-card shadow="never" class="table-card">
      <template #header>
        <div class="table-header">
          <el-radio-group v-model="activeTab" size="large">
            <el-radio-button value="purchase">采购合同</el-radio-button>
            <el-radio-button value="stockIn">入库明细</el-radio-button>
            <el-radio-button value="sale">销售合同</el-radio-button>
            <el-radio-button value="stockOut">出库明细</el-radio-button>
          </el-radio-group>
          <el-button :icon="fullscreenIcon" text size="small" @click="toggleFullscreen" />
        </div>
      </template>

      <!-- ==================== 采购合同 ==================== -->
      <el-table
        v-if="activeTab === 'purchase'"
        :data="pagedData"
        stripe
        border
        highlight-current-row
        :header-cell-style="{ background: '#f5f7fa', color: '#303133', fontWeight: 600 }"
        max-height="800"
        style="width:100%"
      >
        <el-table-column prop="contractNo" label="合同编号" width="170" fixed />
        <el-table-column prop="supplier" label="供应商（集团名称）" min-width="180" />
        <el-table-column prop="date" label="日期" width="110" />
        <el-table-column label="液硫数量（吨）" width="130" align="right">
          <template #default="{ row }">{{ (row.liquidSulfur || 0).toLocaleString('zh-CN', {minimumFractionDigits: 2}) }}</template>
        </el-table-column>
        <el-table-column label="固硫数量（吨）" width="130" align="right">
          <template #default="{ row }">{{ (row.solidSulfur || 0).toLocaleString('zh-CN', {minimumFractionDigits: 2}) }}</template>
        </el-table-column>
        <el-table-column label="合计（吨）" width="120" align="right">
          <template #default="{ row }">{{ ((row.liquidSulfur || 0) + (row.solidSulfur || 0)).toLocaleString('zh-CN', {minimumFractionDigits: 2}) }}</template>
        </el-table-column>
        <el-table-column label="合同单价（元/吨）" width="150" align="right">
          <template #default="{ row }">{{ (row.unitPrice || 0).toLocaleString('zh-CN') }}</template>
        </el-table-column>
        <el-table-column label="实收数量（吨）" width="130" align="right">
          <template #default="{ row }">{{ (row.actualReceived || 0).toLocaleString('zh-CN', {minimumFractionDigits: 2}) }}</template>
        </el-table-column>
        <el-table-column label="结算单价（元/吨）" width="150" align="right">
          <template #default="{ row }">{{ (row.settlementPrice || 0).toLocaleString('zh-CN') }}</template>
        </el-table-column>
        <el-table-column prop="deliveryMethod" label="送货方式" width="120" />
      </el-table>

      <!-- ==================== 入库明细 ==================== -->
      <el-table
        v-if="activeTab === 'stockIn'"
        :data="pagedData"
        stripe
        border
        highlight-current-row
        :header-cell-style="{ background: '#f5f7fa', color: '#303133', fontWeight: 600 }"
        max-height="800"
        style="width:100%"
      >
        <el-table-column prop="supplier" label="供货单位" width="170" fixed />
        <el-table-column prop="date" label="日期" width="110" />
        <el-table-column prop="contractNo" label="合同编号" width="170" />
        <el-table-column label="液硫（吨）" width="110" align="right">
          <template #default="{ row }">{{ (row.liquidSulfur || 0).toLocaleString('zh-CN', {minimumFractionDigits: 2}) }}</template>
        </el-table-column>
        <el-table-column label="颗粒（吨）" width="110" align="right">
          <template #default="{ row }">{{ (row.granular || 0).toLocaleString('zh-CN', {minimumFractionDigits: 2}) }}</template>
        </el-table-column>
        <el-table-column label="合计（吨）" width="110" align="right">
          <template #default="{ row }">{{ ((row.liquidSulfur || 0) + (row.granular || 0)).toLocaleString('zh-CN', {minimumFractionDigits: 2}) }}</template>
        </el-table-column>
        <el-table-column label="单价（元/吨）" width="130" align="right">
          <template #default="{ row }">{{ (row.unitPrice || 0).toLocaleString('zh-CN') }}</template>
        </el-table-column>
        <el-table-column prop="deliveryMethod" label="送货方式" width="120" />
        <el-table-column prop="shipDate" label="发货日期" width="110" />
        <el-table-column prop="shipLocation" label="发货地点" width="140" />
        <el-table-column label="实收液硫（吨）" width="130" align="right">
          <template #default="{ row }">{{ (row.actualLiquid || 0).toLocaleString('zh-CN', {minimumFractionDigits: 2}) }}</template>
        </el-table-column>
        <el-table-column label="实收合计（吨）" width="130" align="right">
          <template #default="{ row }">{{ (row.actualTotal || 0).toLocaleString('zh-CN', {minimumFractionDigits: 2}) }}</template>
        </el-table-column>
      </el-table>

      <!-- ==================== 销售合同 ==================== -->
      <el-table
        v-if="activeTab === 'sale'"
        :data="pagedData"
        stripe
        border
        highlight-current-row
        :header-cell-style="{ background: '#f5f7fa', color: '#303133', fontWeight: 600 }"
        max-height="800"
        style="width:100%"
      >
        <el-table-column prop="groupName" label="集团名称" width="170" fixed />
        <el-table-column prop="region" label="片区" width="110" />
        <el-table-column prop="endUser" label="使用单位" min-width="180" />
        <el-table-column prop="date" label="日期" width="110" />
        <el-table-column prop="contractNo" label="合同编号" width="170" />
        <el-table-column label="粒磺（吨）" width="110" align="right">
          <template #default="{ row }">{{ (row.granularSulfur || 0).toLocaleString('zh-CN', {minimumFractionDigits: 2}) }}</template>
        </el-table-column>
        <el-table-column label="合计（吨）" width="110" align="right">
          <template #default="{ row }">{{ (row.granularSulfur || 0).toLocaleString('zh-CN', {minimumFractionDigits: 2}) }}</template>
        </el-table-column>
        <el-table-column label="单价（元/吨）" width="130" align="right">
          <template #default="{ row }">{{ (row.unitPrice || 0).toLocaleString('zh-CN') }}</template>
        </el-table-column>
        <el-table-column label="金额（元）" width="150" align="right">
          <template #default="{ row }">{{ ((row.granularSulfur || 0) * (row.unitPrice || 0)).toLocaleString('zh-CN', {minimumFractionDigits: 2}) }}</template>
        </el-table-column>
        <el-table-column prop="deliveryMethod" label="送货方式" width="120" />
      </el-table>

      <!-- ==================== 出库明细 ==================== -->
      <el-table
        v-if="activeTab === 'stockOut'"
        :data="pagedData"
        stripe
        border
        highlight-current-row
        :header-cell-style="{ background: '#f5f7fa', color: '#303133', fontWeight: 600 }"
        max-height="800"
        style="width:100%"
      >
        <el-table-column prop="groupName" label="集团名称" width="170" fixed />
        <el-table-column prop="region" label="片区" width="110" />
        <el-table-column prop="factoryName" label="工厂名称" min-width="180" />
        <el-table-column prop="date" label="日期" width="110" />
        <el-table-column prop="contractNo" label="合同编号" width="170" />
        <el-table-column label="粒状（吨）" width="110" align="right">
          <template #default="{ row }">{{ (row.granular || 0).toLocaleString('zh-CN', {minimumFractionDigits: 2}) }}</template>
        </el-table-column>
        <el-table-column label="合计（吨）" width="110" align="right">
          <template #default="{ row }">{{ (row.granular || 0).toLocaleString('zh-CN', {minimumFractionDigits: 2}) }}</template>
        </el-table-column>
        <el-table-column label="单价（元/吨）" width="130" align="right">
          <template #default="{ row }">{{ (row.unitPrice || 0).toLocaleString('zh-CN') }}</template>
        </el-table-column>
        <el-table-column label="金额（元）" width="150" align="right">
          <template #default="{ row }">{{ ((row.granular || 0) * (row.unitPrice || 0)).toLocaleString('zh-CN', {minimumFractionDigits: 2}) }}</template>
        </el-table-column>
        <el-table-column prop="deliveryMethod" label="自提/送货" width="120" />
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrap" style="margin-top:20px;display:flex;justify-content:flex-end">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="filteredData.length"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          background
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { List, FullScreen, Close } from '@element-plus/icons-vue'

// ── Tab 切换 ─────────────────────
type TabKey = 'purchase' | 'stockIn' | 'sale' | 'stockOut'
const activeTab = ref<TabKey>('purchase')

const tabLabelMap: Record<TabKey, string> = {
  purchase: '采购合同',
  stockIn: '入库明细',
  sale: '销售合同',
  stockOut: '出库明细'
}
const currentTabLabel = computed(() => tabLabelMap[activeTab.value])

// ── 分页 ────────────────────────
const page = ref(1)
const pageSize = ref(10)

// ── 模拟数据接口 ────────────────

// 通用行类型（所有表共用）
interface DataRow {
  [key: string]: any
}

// 各表数据源
const purchaseData = ref<DataRow[]>([])
const stockInData = ref<DataRow[]>([])
const saleData = ref<DataRow[]>([])
const stockOutData = ref<DataRow[]>([])

// 当前表格数据
const filteredData = computed(() => {
  const map: Record<string, DataRow[]> = {
    purchase: purchaseData.value,
    stockIn: stockInData.value,
    sale: saleData.value,
    stockOut: stockOutData.value
  }
  return map[activeTab.value] || []
})

// 当前页数据
const pagedData = computed(() => {
  const data = filteredData.value
  const start = (page.value - 1) * pageSize.value
  return data.slice(start, start + pageSize.value)
})

// ── 切换 Tab 重置页码 ──────────
watch(activeTab, () => {
  page.value = 1
})

// ── 全屏切换 ───────────────────
const isFullscreen = ref(false)
const fullscreenIcon = computed(() => isFullscreen.value ? Close : FullScreen)
function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
  const el = document.querySelector('.hw-order-page') as HTMLElement
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

// ── 统计摘要（计算属性）─────────

// 总数量（吨）：取各表的核心数量字段
function extractQuantity(item: DataRow): number {
  if ('liquidSulfur' in item && 'solidSulfur' in item && !('granular' in item)) {
    // 采购合同
    return (item.liquidSulfur || 0) + (item.solidSulfur || 0)
  }
  if ('liquidSulfur' in item && 'granular' in item && !('granularSulfur' in item)) {
    // 入库明细
    return (item.liquidSulfur || 0) + (item.granular || 0)
  }
  if ('granularSulfur' in item) {
    // 销售合同
    return item.granularSulfur || 0
  }
  if ('granular' in item && !('granularSulfur' in item)) {
    // 出库明细
    return item.granular || 0
  }
  return 0
}

const totalQuantity = computed(() => {
  return filteredData.value.reduce((sum, item) => sum + extractQuantity(item), 0)
})

// 总金额
function extractAmount(item: DataRow): number {
  if ('granularSulfur' in item) {
    // 销售合同
    return (item.granularSulfur || 0) * (item.unitPrice || 0)
  }
  if ('granular' in item && !('granularSulfur' in item)) {
    // 出库明细
    return (item.granular || 0) * (item.unitPrice || 0)
  }
  if ('liquidSulfur' in item && 'solidSulfur' in item && !('granular' in item)) {
    // 采购合同
    return ((item.liquidSulfur || 0) + (item.solidSulfur || 0)) * (item.unitPrice || 0)
  }
  if ('liquidSulfur' in item && 'granular' in item) {
    // 入库明细
    return ((item.liquidSulfur || 0) + (item.granular || 0)) * (item.unitPrice || 0)
  }
  return 0
}

const totalAmount = computed(() => {
  return filteredData.value.reduce((sum, item) => sum + extractAmount(item), 0)
})

// 客户数
function extractCustomer(item: DataRow): string {
  if ('supplier' in item) return item.supplier || ''
  if ('groupName' in item) return item.groupName || ''
  if ('endUser' in item) return item.endUser || ''
  return ''
}

const uniqueCustomerCount = computed(() => {
  const set = new Set(filteredData.value.map(item => extractCustomer(item)))
  set.delete('')
  return set.size
})

// ===================================================================
//  MOCK 数据（15条各表）
// ===================================================================

purchaseData.value = [
  { contractNo: 'TG-HW2025005', supplier: '广西泰谷化学（朱博宇）', date: '2025-06-10', liquidSulfur: 120, solidSulfur: 0, unitPrice: 2550, actualReceived: 118.5, settlementPrice: 2550, deliveryMethod: '送货上门' },
  { contractNo: 'TG-HW2025006', supplier: '广西泰谷化学（朱博宇）', date: '2025-07-05', liquidSulfur: 80, solidSulfur: 0, unitPrice: 2560, actualReceived: 79.2, settlementPrice: 2560, deliveryMethod: '送货上门' },
  { contractNo: 'JX-HW2025001', supplier: '蒋献勇', date: '2025-06-15', liquidSulfur: 200, solidSulfur: 0, unitPrice: 2510, actualReceived: 198.0, settlementPrice: 2510, deliveryMethod: '送货上门' },
  { contractNo: 'JX-HW2025002', supplier: '蒋献勇', date: '2025-08-20', liquidSulfur: 150, solidSulfur: 0, unitPrice: 2530, actualReceived: 148.6, settlementPrice: 2530, deliveryMethod: '自提' },
  { contractNo: 'ZN-HW2025001', supplier: '中国外运', date: '2025-06-01', liquidSulfur: 100, solidSulfur: 0, unitPrice: 2580, actualReceived: 100.0, settlementPrice: 2580, deliveryMethod: '送货上门' },
  { contractNo: 'ZN-HW2025002', supplier: '中国外运', date: '2025-07-12', liquidSulfur: 80, solidSulfur: 0, unitPrice: 2570, actualReceived: 79.8, settlementPrice: 2570, deliveryMethod: '送货上门' },
  { contractNo: 'JYS-HW2025001', supplier: '广西钦州金雨伞', date: '2025-06-20', liquidSulfur: 60, solidSulfur: 0, unitPrice: 2590, actualReceived: 60.0, settlementPrice: 2590, deliveryMethod: '自提' },
  { contractNo: 'JYS-HW2025002', supplier: '广西钦州金雨伞', date: '2025-09-05', liquidSulfur: 50, solidSulfur: 0, unitPrice: 2590, actualReceived: 49.5, settlementPrice: 2590, deliveryMethod: '自提' },
  { contractNo: 'TG-HW2025007', supplier: '广西泰谷化学（朱博宇）', date: '2025-08-10', liquidSulfur: 90, solidSulfur: 0, unitPrice: 2540, actualReceived: 89.4, settlementPrice: 2540, deliveryMethod: '送货上门' },
  { contractNo: 'JX-HW2025003', supplier: '蒋献勇', date: '2025-09-15', liquidSulfur: 130, solidSulfur: 0, unitPrice: 2520, actualReceived: 128.8, settlementPrice: 2520, deliveryMethod: '送货上门' },
  { contractNo: 'TG-HW2025008', supplier: '广西泰谷化学（朱博宇）', date: '2025-09-25', liquidSulfur: 70, solidSulfur: 0, unitPrice: 2550, actualReceived: 69.6, settlementPrice: 2550, deliveryMethod: '自提' },
  { contractNo: 'ZN-HW2025003', supplier: '中国外运', date: '2025-10-08', liquidSulfur: 110, solidSulfur: 0, unitPrice: 2560, actualReceived: 110.0, settlementPrice: 2560, deliveryMethod: '送货上门' },
  { contractNo: 'JYS-HW2025003', supplier: '广西钦州金雨伞', date: '2025-10-20', liquidSulfur: 40, solidSulfur: 0, unitPrice: 2590, actualReceived: 39.8, settlementPrice: 2590, deliveryMethod: '自提' },
  { contractNo: 'TG-HW2025009', supplier: '广西泰谷化学（朱博宇）', date: '2025-11-05', liquidSulfur: 100, solidSulfur: 0, unitPrice: 2570, actualReceived: 99.2, settlementPrice: 2570, deliveryMethod: '送货上门' },
  { contractNo: 'JX-HW2025004', supplier: '蒋献勇', date: '2025-11-18', liquidSulfur: 85, solidSulfur: 0, unitPrice: 2530, actualReceived: 84.5, settlementPrice: 2530, deliveryMethod: '送货上门' }
]

stockInData.value = [
  { supplier: '广西泰谷化学（朱博宇）', date: '2025-06-12', contractNo: 'TG-HW2025005', liquidSulfur: 31.5, granular: 0, unitPrice: 2550, deliveryMethod: '送货上门', shipDate: '2025-06-11', shipLocation: '钦州石化', actualLiquid: 31.2, actualTotal: 31.2 },
  { supplier: '广西泰谷化学（朱博宇）', date: '2025-06-18', contractNo: 'TG-HW2025005', liquidSulfur: 32.0, granular: 0, unitPrice: 2550, deliveryMethod: '送货上门', shipDate: '2025-06-17', shipLocation: '钦州石化', actualLiquid: 31.8, actualTotal: 31.8 },
  { supplier: '广西泰谷化学（朱博宇）', date: '2025-07-08', contractNo: 'TG-HW2025006', liquidSulfur: 31.8, granular: 0, unitPrice: 2560, deliveryMethod: '送货上门', shipDate: '2025-07-07', shipLocation: '钦州石化', actualLiquid: 31.5, actualTotal: 31.5 },
  { supplier: '广西泰谷化学（朱博宇）', date: '2025-07-15', contractNo: 'TG-HW2025006', liquidSulfur: 32.0, granular: 0, unitPrice: 2560, deliveryMethod: '送货上门', shipDate: '2025-07-14', shipLocation: '钦州石化', actualLiquid: 31.9, actualTotal: 31.9 },
  { supplier: '蒋献勇', date: '2025-06-17', contractNo: 'JX-HW2025001', liquidSulfur: 32.2, granular: 0, unitPrice: 2510, deliveryMethod: '送货上门', shipDate: '2025-06-16', shipLocation: '钦州石化', actualLiquid: 32.0, actualTotal: 32.0 },
  { supplier: '蒋献勇', date: '2025-06-25', contractNo: 'JX-HW2025001', liquidSulfur: 31.6, granular: 0, unitPrice: 2510, deliveryMethod: '送货上门', shipDate: '2025-06-24', shipLocation: '钦州石化', actualLiquid: 31.4, actualTotal: 31.4 },
  { supplier: '蒋献勇', date: '2025-08-22', contractNo: 'JX-HW2025002', liquidSulfur: 32.0, granular: 0, unitPrice: 2530, deliveryMethod: '自提', shipDate: '2025-08-21', shipLocation: '钦州石化', actualLiquid: 31.8, actualTotal: 31.8 },
  { supplier: '中国外运', date: '2025-06-03', contractNo: 'ZN-HW2025001', liquidSulfur: 31.5, granular: 0, unitPrice: 2580, deliveryMethod: '送货上门', shipDate: '2025-06-02', shipLocation: '钦州石化', actualLiquid: 31.5, actualTotal: 31.5 },
  { supplier: '中国外运', date: '2025-06-10', contractNo: 'ZN-HW2025001', liquidSulfur: 32.0, granular: 0, unitPrice: 2580, deliveryMethod: '送货上门', shipDate: '2025-06-09', shipLocation: '钦州石化', actualLiquid: 32.0, actualTotal: 32.0 },
  { supplier: '中国外运', date: '2025-07-14', contractNo: 'ZN-HW2025002', liquidSulfur: 31.8, granular: 0, unitPrice: 2570, deliveryMethod: '送货上门', shipDate: '2025-07-13', shipLocation: '钦州石化', actualLiquid: 31.6, actualTotal: 31.6 },
  { supplier: '广西泰谷化学（朱博宇）', date: '2025-08-12', contractNo: 'TG-HW2025007', liquidSulfur: 32.0, granular: 0, unitPrice: 2540, deliveryMethod: '送货上门', shipDate: '2025-08-11', shipLocation: '钦州石化', actualLiquid: 31.9, actualTotal: 31.9 },
  { supplier: '广西泰谷化学（朱博宇）', date: '2025-08-20', contractNo: 'TG-HW2025007', liquidSulfur: 31.5, granular: 0, unitPrice: 2540, deliveryMethod: '送货上门', shipDate: '2025-08-19', shipLocation: '钦州石化', actualLiquid: 31.3, actualTotal: 31.3 },
  { supplier: '蒋献勇', date: '2025-09-17', contractNo: 'JX-HW2025003', liquidSulfur: 32.0, granular: 0, unitPrice: 2520, deliveryMethod: '送货上门', shipDate: '2025-09-16', shipLocation: '钦州石化', actualLiquid: 31.7, actualTotal: 31.7 },
  { supplier: '蒋献勇', date: '2025-09-25', contractNo: 'JX-HW2025003', liquidSulfur: 31.8, granular: 0, unitPrice: 2520, deliveryMethod: '送货上门', shipDate: '2025-09-24', shipLocation: '钦州石化', actualLiquid: 31.5, actualTotal: 31.5 },
  { supplier: '中国外运', date: '2025-10-10', contractNo: 'ZN-HW2025003', liquidSulfur: 32.0, granular: 0, unitPrice: 2560, deliveryMethod: '送货上门', shipDate: '2025-10-09', shipLocation: '钦州石化', actualLiquid: 32.0, actualTotal: 32.0 }
]

saleData.value = [
  { groupName: '利方达公司', region: '广西片区', endUser: '广西利方达农业科技', date: '2025-06-15', contractNo: 'HW20250826', granularSulfur: 500, unitPrice: 2850, deliveryMethod: '送货上门' },
  { groupName: '利方达公司', region: '广西片区', endUser: '广西利方达农业科技', date: '2025-07-20', contractNo: 'HW20250827', granularSulfur: 450, unitPrice: 2880, deliveryMethod: '送货上门' },
  { groupName: '利方达公司', region: '广西片区', endUser: '广西利方达农业科技', date: '2025-08-25', contractNo: 'HW20250828', granularSulfur: 400, unitPrice: 2860, deliveryMethod: '自提' },
  { groupName: '昆明伯明原公司', region: '云南片区', endUser: '云南伯明原化工', date: '2025-06-10', contractNo: 'KM2025082601', granularSulfur: 400, unitPrice: 2735, deliveryMethod: '送货上门' },
  { groupName: '昆明伯明原公司', region: '云南片区', endUser: '云南伯明原化工', date: '2025-07-15', contractNo: 'KM2025082602', granularSulfur: 350, unitPrice: 2750, deliveryMethod: '送货上门' },
  { groupName: '昆明伯明原公司', region: '云南片区', endUser: '云南伯明原化工', date: '2025-08-20', contractNo: 'KM2025082603', granularSulfur: 380, unitPrice: 2740, deliveryMethod: '自提' },
  { groupName: '昆明伯明原公司', region: '云南片区', endUser: '云南伯明原化工', date: '2025-09-10', contractNo: 'KM2025082604', granularSulfur: 420, unitPrice: 2760, deliveryMethod: '送货上门' },
  { groupName: '云南金星化工', region: '云南片区', endUser: '云南金星化工有限公司', date: '2025-06-20', contractNo: 'YX2025062001', granularSulfur: 350, unitPrice: 2950, deliveryMethod: '送货上门' },
  { groupName: '云南金星化工', region: '云南片区', endUser: '云南金星化工有限公司', date: '2025-07-25', contractNo: 'YX2025072501', granularSulfur: 300, unitPrice: 2930, deliveryMethod: '送货上门' },
  { groupName: '云南金星化工', region: '云南片区', endUser: '云南金星化工有限公司', date: '2025-08-30', contractNo: 'YX2025083001', granularSulfur: 320, unitPrice: 2940, deliveryMethod: '自提' },
  { groupName: '利方达公司', region: '广西片区', endUser: '广西利方达农业科技', date: '2025-09-15', contractNo: 'HW20250915', granularSulfur: 380, unitPrice: 2870, deliveryMethod: '送货上门' },
  { groupName: '昆明伯明原公司', region: '云南片区', endUser: '云南伯明原化工', date: '2025-10-05', contractNo: 'KM2025100501', granularSulfur: 360, unitPrice: 2770, deliveryMethod: '送货上门' },
  { groupName: '云南金星化工', region: '云南片区', endUser: '云南金星化工有限公司', date: '2025-10-15', contractNo: 'YX2025101501', granularSulfur: 280, unitPrice: 2950, deliveryMethod: '自提' },
  { groupName: '利方达公司', region: '广西片区', endUser: '广西利方达农业科技', date: '2025-10-28', contractNo: 'HW20251028', granularSulfur: 500, unitPrice: 2890, deliveryMethod: '送货上门' },
  { groupName: '昆明伯明原公司', region: '云南片区', endUser: '云南伯明原化工', date: '2025-11-10', contractNo: 'KM2025111001', granularSulfur: 340, unitPrice: 2780, deliveryMethod: '送货上门' }
]

stockOutData.value = [
  { groupName: '利方达公司', region: '广西片区', factoryName: '广西利方达农业科技', date: '2025-06-18', contractNo: 'HW20250826', granular: 150, unitPrice: 2850, deliveryMethod: '送货' },
  { groupName: '利方达公司', region: '广西片区', factoryName: '广西利方达农业科技', date: '2025-06-25', contractNo: 'HW20250826', granular: 200, unitPrice: 2850, deliveryMethod: '送货' },
  { groupName: '利方达公司', region: '广西片区', factoryName: '广西利方达农业科技', date: '2025-07-22', contractNo: 'HW20250827', granular: 180, unitPrice: 2880, deliveryMethod: '送货' },
  { groupName: '利方达公司', region: '广西片区', factoryName: '广西利方达农业科技', date: '2025-08-10', contractNo: 'HW20250827', granular: 200, unitPrice: 2880, deliveryMethod: '自提' },
  { groupName: '昆明伯明原公司', region: '云南片区', factoryName: '云南伯明原化工', date: '2025-06-12', contractNo: 'KM2025082601', granular: 180, unitPrice: 2735, deliveryMethod: '送货' },
  { groupName: '昆明伯明原公司', region: '云南片区', factoryName: '云南伯明原化工', date: '2025-06-20', contractNo: 'KM2025082601', granular: 150, unitPrice: 2735, deliveryMethod: '送货' },
  { groupName: '昆明伯明原公司', region: '云南片区', factoryName: '云南伯明原化工', date: '2025-07-18', contractNo: 'KM2025082602', granular: 200, unitPrice: 2750, deliveryMethod: '送货' },
  { groupName: '昆明伯明原公司', region: '云南片区', factoryName: '云南伯明原化工', date: '2025-08-22', contractNo: 'KM2025082603', granular: 160, unitPrice: 2740, deliveryMethod: '自提' },
  { groupName: '云南金星化工', region: '云南片区', factoryName: '云南金星化工有限公司', date: '2025-06-22', contractNo: 'YX2025062001', granular: 150, unitPrice: 2950, deliveryMethod: '送货' },
  { groupName: '云南金星化工', region: '云南片区', factoryName: '云南金星化工有限公司', date: '2025-07-28', contractNo: 'YX2025072501', granular: 180, unitPrice: 2930, deliveryMethod: '送货' },
  { groupName: '云南金星化工', region: '云南片区', factoryName: '云南金星化工有限公司', date: '2025-09-02', contractNo: 'YX2025083001', granular: 160, unitPrice: 2940, deliveryMethod: '自提' },
  { groupName: '利方达公司', region: '广西片区', factoryName: '广西利方达农业科技', date: '2025-09-18', contractNo: 'HW20250915', granular: 200, unitPrice: 2870, deliveryMethod: '送货' },
  { groupName: '昆明伯明原公司', region: '云南片区', factoryName: '云南伯明原化工', date: '2025-10-08', contractNo: 'KM2025100501', granular: 180, unitPrice: 2770, deliveryMethod: '送货' },
  { groupName: '昆明伯明原公司', region: '云南片区', factoryName: '云南伯明原化工', date: '2025-10-18', contractNo: 'KM2025100501', granular: 160, unitPrice: 2770, deliveryMethod: '自提' },
  { groupName: '利方达公司', region: '广西片区', factoryName: '广西利方达农业科技', date: '2025-11-01', contractNo: 'HW20251028', granular: 250, unitPrice: 2890, deliveryMethod: '送货' }
]
</script>

<style lang="scss" scoped>
.hw-order-page {
  padding: 20px;
  background: #f0f2f5;
  min-height: calc(100vh - 60px);
  width: 100%;
  box-sizing: border-box;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  background: #fff;
  padding: 20px 24px;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, .06);

  .header-badge {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    flex-shrink: 0;
  }

  .header-info {
    flex: 1;
  }

  .page-title {
    font-size: 20px;
    font-weight: 700;
    color: #1a1a2e;
    margin: 0 0 4px;
  }

  .page-subtitle {
    font-size: 13px;
    color: #999;
    margin: 0;
  }
}

.summary-card {
  margin-bottom: 16px;
  border-radius: 12px;

  .summary-stats {
    display: flex;
    gap: 48px;
    flex-wrap: wrap;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 100px;
  }

  .stat-label {
    font-size: 13px;
    color: #999;
    margin-bottom: 4px;
  }

  .stat-value {
    font-size: 22px;
    font-weight: 700;
    color: #303133;
  }
}

.table-card {
  border-radius: 12px;
  overflow-x: auto;

  .table-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}
</style>
