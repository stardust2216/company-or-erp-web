<template>
  <div class="stock-in-report-page">
    <!-- 渐变页头 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-icon">
          <el-icon :size="28"><Box /></el-icon>
        </div>
        <div class="header-text">
          <h1 class="header-title">亚辉塑业 - 入库明细报表</h1>
          <p class="header-subtitle">26-27榨季 硫磺原料采购入库明细汇总</p>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stat-cards">
      <div class="stat-card">
        <div class="stat-card-body">
          <div class="stat-label">总入库笔数</div>
          <div class="stat-value">{{ totalCount }}</div>
        </div>
        <div class="stat-card-icon stat-icon-blue">
          <el-icon :size="22"><Document /></el-icon>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-card-body">
          <div class="stat-label">总入库量(吨)</div>
          <div class="stat-value">{{ totalQuantity.toFixed(1) }}</div>
        </div>
        <div class="stat-card-icon stat-icon-green">
          <el-icon :size="22"><TrendCharts /></el-icon>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-card-body">
          <div class="stat-label">供应商数</div>
          <div class="stat-value">{{ supplierCount }}</div>
        </div>
        <div class="stat-card-icon stat-icon-orange">
          <el-icon :size="22"><User /></el-icon>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-card-body">
          <div class="stat-label">平均单价(元/吨)</div>
          <div class="stat-value">{{ avgUnitPrice.toFixed(0) }}</div>
        </div>
        <div class="stat-card-icon stat-icon-purple">
          <el-icon :size="22"><Coin /></el-icon>
        </div>
      </div>
    </div>

    <!-- 报表卡片 -->
    <div class="report-card">
      <!-- 卡片头部：tab切换 -->
      <div class="card-header">
        <el-radio-group v-model="activeTab" size="small">
          <el-radio-button value="detail" label="入库明细" />
          <el-radio-button value="summary" label="供应商汇总" />
        </el-radio-group>
        <el-button text @click="toggleFullscreen" :icon="fullscreenIcon" style="margin-left:auto;padding:0 12px;font-size:18px" />
      </div>

      <!-- 表格区域 -->
      <div class="card-body">
        <el-table
          :data="currentData"
          :max-height="800"
          border
          stripe
          style="width: 100%"
          :header-cell-style="headerCellStyle"
          size="small"
          highlight-current-row
        >
          <el-table-column
            v-for="col in currentColumns"
            :key="col.prop"
            :prop="col.prop"
            :label="col.label"
            :min-width="col.width || 120"
            :align="col.align || 'center'"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              <span v-if="col.prop === 'supplier' || col.prop === 'deliveryMethod' || col.prop === 'departurePlace'" class="text-nowrap">{{ row[col.prop] ?? '-' }}</span>
              <span v-else-if="col.type === 'amount'">{{ formatNum(row[col.prop]) }}</span>
              <span v-else>{{ row[col.prop] ?? '-' }}</span>
            </template>
          </el-table-column>
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
import { Box, Document, TrendCharts, User, Coin, FullScreen, Close } from '@element-plus/icons-vue'

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
// 列定义
// ============================================================
interface ColumnDef {
  prop: string
  label: string
  width?: number | string
  align?: 'left' | 'center' | 'right'
  type?: string
}

const detailColumns: ColumnDef[] = [
  { prop: 'supplier', label: '供货单位', width: 170 },
  { prop: 'inboundDate', label: '入库日期', width: 110 },
  { prop: 'contractNo', label: '合同编号', width: 170 },
  { prop: 'liquidSulfur', label: '液硫(吨)', width: 100, type: 'amount' },
  { prop: 'granular', label: '颗粒(吨)', width: 100, type: 'amount' },
  { prop: 'lumpy', label: '块状(吨)', width: 100, type: 'amount' },
  { prop: 'prill', label: '粒状(吨)', width: 100, type: 'amount' },
  { prop: 'totalTon', label: '合计(吨)', width: 100, type: 'amount' },
  { prop: 'unitPrice', label: '单价(元/吨)', width: 120, type: 'amount' },
  { prop: 'deliveryMethod', label: '送货方式', width: 100 },
  { prop: 'shipDate', label: '发货日期', width: 110 },
  { prop: 'departurePlace', label: '发货地点', width: 140 },
]

const summaryColumns: ColumnDef[] = [
  { prop: 'supplier', label: '供货单位', width: 190 },
  { prop: 'totalInbound', label: '总入库(吨)', width: 120, type: 'amount' },
  { prop: 'liquidSulfur', label: '液硫(吨)', width: 110, type: 'amount' },
  { prop: 'granular', label: '颗粒(吨)', width: 110, type: 'amount' },
  { prop: 'batchCount', label: '总批次', width: 90 },
  { prop: 'avgPrice', label: '平均单价(元/吨)', width: 140, type: 'amount' },
  { prop: 'totalAmount', label: '总金额(万元)', width: 130, type: 'amount' },
]

// ============================================================
// Mock 数据 - 入库明细
// ============================================================
interface DetailRow {
  supplier: string
  inboundDate: string
  contractNo: string
  liquidSulfur: number
  granular: number
  lumpy: number
  prill: number
  totalTon: number
  unitPrice: number
  deliveryMethod: string
  shipDate: string
  departurePlace: string
}

const detailData: DetailRow[] = [
  { supplier: '广西泰谷化学(朱博宇)', inboundDate: '2026-11-01', contractNo: 'HT-HF-2026-001', liquidSulfur: 500.5, granular: 0, lumpy: 0, prill: 0, totalTon: 500.5, unitPrice: 1850, deliveryMethod: '送货上门', shipDate: '2026-10-28', departurePlace: '广西防城港' },
  { supplier: '广西泰谷化学(朱博宇)', inboundDate: '2026-11-05', contractNo: 'HT-HF-2026-002', liquidSulfur: 480.0, granular: 20.5, lumpy: 0, prill: 0, totalTon: 500.5, unitPrice: 1830, deliveryMethod: '送货上门', shipDate: '2026-11-02', departurePlace: '广西防城港' },
  { supplier: '蒋献勇', inboundDate: '2026-11-08', contractNo: 'HT-HF-2026-003', liquidSulfur: 520.0, granular: 0, lumpy: 0, prill: 0, totalTon: 520.0, unitPrice: 1860, deliveryMethod: '自提', shipDate: '2026-11-05', departurePlace: '广西钦州' },
  { supplier: '中国外运', inboundDate: '2026-11-12', contractNo: 'HT-HF-2026-004', liquidSulfur: 0, granular: 200.0, lumpy: 0, prill: 0, totalTon: 200.0, unitPrice: 1920, deliveryMethod: '送货上门', shipDate: '2026-11-09', departurePlace: '广西钦州港' },
  { supplier: '广西钦州金雨伞', inboundDate: '2026-11-15', contractNo: 'HT-HF-2026-005', liquidSulfur: 460.0, granular: 0, lumpy: 0, prill: 0, totalTon: 460.0, unitPrice: 1840, deliveryMethod: '自提', shipDate: '2026-11-12', departurePlace: '广西钦州' },
  { supplier: '北部湾港务', inboundDate: '2026-11-18', contractNo: 'HT-HF-2026-006', liquidSulfur: 0, granular: 180.0, lumpy: 0, prill: 0, totalTon: 180.0, unitPrice: 1950, deliveryMethod: '送货上门', shipDate: '2026-11-15', departurePlace: '广西北海' },
  { supplier: '广西泰谷化学(朱博宇)', inboundDate: '2026-11-20', contractNo: 'HT-HF-2026-007', liquidSulfur: 510.0, granular: 30.0, lumpy: 0, prill: 0, totalTon: 540.0, unitPrice: 1850, deliveryMethod: '送货上门', shipDate: '2026-11-17', departurePlace: '广西防城港' },
  { supplier: '蒋献勇', inboundDate: '2026-11-23', contractNo: 'HT-HF-2026-008', liquidSulfur: 490.0, granular: 0, lumpy: 0, prill: 0, totalTon: 490.0, unitPrice: 1870, deliveryMethod: '自提', shipDate: '2026-11-20', departurePlace: '广西钦州' },
  { supplier: '中国外运', inboundDate: '2026-11-26', contractNo: 'HT-HF-2026-009', liquidSulfur: 0, granular: 220.0, lumpy: 0, prill: 0, totalTon: 220.0, unitPrice: 1900, deliveryMethod: '送货上门', shipDate: '2026-11-23', departurePlace: '广西钦州港' },
  { supplier: '广西泰谷化学(朱博宇)', inboundDate: '2026-11-29', contractNo: 'HT-HF-2026-010', liquidSulfur: 530.0, granular: 0, lumpy: 0, prill: 0, totalTon: 530.0, unitPrice: 1860, deliveryMethod: '送货上门', shipDate: '2026-11-26', departurePlace: '广西防城港' },
  { supplier: '广西钦州金雨伞', inboundDate: '2026-12-02', contractNo: 'HT-HF-2026-011', liquidSulfur: 470.0, granular: 0, lumpy: 0, prill: 0, totalTon: 470.0, unitPrice: 1840, deliveryMethod: '自提', shipDate: '2026-11-29', departurePlace: '广西钦州' },
  { supplier: '北部湾港务', inboundDate: '2026-12-05', contractNo: 'HT-HF-2026-012', liquidSulfur: 0, granular: 190.0, lumpy: 0, prill: 0, totalTon: 190.0, unitPrice: 1930, deliveryMethod: '送货上门', shipDate: '2026-12-02', departurePlace: '广西北海' },
  { supplier: '蒋献勇', inboundDate: '2026-12-08', contractNo: 'HT-HF-2026-013', liquidSulfur: 505.0, granular: 0, lumpy: 0, prill: 0, totalTon: 505.0, unitPrice: 1860, deliveryMethod: '自提', shipDate: '2026-12-05', departurePlace: '广西钦州' },
  { supplier: '中国外运', inboundDate: '2026-12-11', contractNo: 'HT-HF-2026-014', liquidSulfur: 0, granular: 210.0, lumpy: 0, prill: 0, totalTon: 210.0, unitPrice: 1910, deliveryMethod: '送货上门', shipDate: '2026-12-08', departurePlace: '广西钦州港' },
  { supplier: '广西泰谷化学(朱博宇)', inboundDate: '2026-12-14', contractNo: 'HT-HF-2026-015', liquidSulfur: 525.0, granular: 25.0, lumpy: 0, prill: 0, totalTon: 550.0, unitPrice: 1850, deliveryMethod: '送货上门', shipDate: '2026-12-11', departurePlace: '广西防城港' },
]

// ============================================================
// Mock 数据 - 供应商汇总
// ============================================================
interface SummaryRow {
  supplier: string
  totalInbound: number
  liquidSulfur: number
  granular: number
  batchCount: number
  avgPrice: number
  totalAmount: number
}

const summaryData: SummaryRow[] = [
  { supplier: '广西泰谷化学(朱博宇)', totalInbound: 2621.0, liquidSulfur: 2545.5, granular: 75.5, batchCount: 4, avgPrice: 1847.5, totalAmount: 484.3 },
  { supplier: '蒋献勇', totalInbound: 1515.0, liquidSulfur: 1515.0, granular: 0, batchCount: 3, avgPrice: 1863.3, totalAmount: 282.3 },
  { supplier: '中国外运', totalInbound: 630.0, liquidSulfur: 0, granular: 630.0, batchCount: 3, avgPrice: 1910.0, totalAmount: 120.3 },
  { supplier: '广西钦州金雨伞', totalInbound: 930.0, liquidSulfur: 930.0, granular: 0, batchCount: 2, avgPrice: 1840.0, totalAmount: 171.1 },
  { supplier: '北部湾港务', totalInbound: 370.0, liquidSulfur: 0, granular: 370.0, batchCount: 2, avgPrice: 1940.0, totalAmount: 71.8 },
]

// ============================================================
// 计算属性
// ============================================================
const currentColumns = computed(() => {
  return activeTab.value === 'detail' ? detailColumns : summaryColumns
})

const currentDataSource = computed(() => {
  return activeTab.value === 'detail' ? detailData : summaryData
})

const currentData = computed(() => {
  const data = currentDataSource.value
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return data.slice(start, end)
})

const totalCount = computed(() => {
  return currentDataSource.value.length
})

// ============================================================
// 统计卡片计算
// ============================================================
const totalQuantity = computed(() => {
  return detailData.reduce((sum, row) => sum + row.totalTon, 0)
})

const supplierCount = computed(() => {
  const set = new Set(detailData.map((r) => r.supplier))
  return set.size
})

const avgUnitPrice = computed(() => {
  if (detailData.length === 0) return 0
  const sum = detailData.reduce((s, r) => s + r.unitPrice, 0)
  return sum / detailData.length
})

// ============================================================
// 工具函数
// ============================================================
const formatNum = (val: number | string | undefined | null): string => {
  if (val === undefined || val === null) return '-'
  const num = typeof val === 'string' ? parseFloat(val) : val
  if (isNaN(num)) return '-'
  if (Number.isInteger(num)) return num.toLocaleString('zh-CN')
  return num.toLocaleString('zh-CN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

// ============================================================
// 全屏切换
// ============================================================
const isFullscreen = ref(false)
const fullscreenIcon = computed(() => isFullscreen.value ? Close : FullScreen)
function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
  const containerClass = 'stock-in-report-page'
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

.stock-in-report-page {
  padding: 0 $spacing-5;
  background: $color-gray-100;
  min-height: 100vh;

  // ========== 渐变页头 ==========
  .page-header {
    padding: $spacing-5 $spacing-6;
    background: linear-gradient(135deg, #36d1dc, #5b86e5);
    border-radius: $border-radius-lg;
    margin-bottom: $spacing-5;
    margin-top: $spacing-5;
    box-shadow: 0 4px 16px rgba(91, 134, 229, 0.3);

    .header-content {
      display: flex;
      align-items: center;
      gap: $spacing-4;
    }

    .header-icon {
      width: 48px;
      height: 48px;
      border-radius: $border-radius-lg;
      background: rgba(255, 255, 255, 0.2);
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
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
    }

    .header-subtitle {
      font-size: $font-size-sm;
      color: rgba(255, 255, 255, 0.85);
      margin: 0;
      line-height: $line-height-normal;
    }
  }

  // ========== 统计卡片 ==========
  .stat-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: $spacing-5;
    margin-bottom: $spacing-5;

    .stat-card {
      background: #fff;
      border-radius: $border-radius-lg;
      padding: $spacing-4 $spacing-5;
      box-shadow: $shadow-base;
      display: flex;
      align-items: center;
      justify-content: space-between;
      transition: transform 0.2s, box-shadow 0.2s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: $shadow-md;
      }

      .stat-card-body {
        .stat-label {
          font-size: $font-size-xs;
          color: $color-gray-500;
          margin-bottom: 4px;
        }

        .stat-value {
          font-size: $font-size-2xl;
          font-weight: $font-weight-bold;
          color: $color-gray-900;
          line-height: 1.2;
        }
      }

      .stat-card-icon {
        width: 42px;
        height: 42px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .stat-icon-blue {
        background: rgba(64, 158, 255, 0.10);
        color: #409eff;
      }
      .stat-icon-green {
        background: rgba(103, 194, 58, 0.10);
        color: #67c23a;
      }
      .stat-icon-orange {
        background: rgba(230, 162, 60, 0.10);
        color: #e6a23c;
      }
      .stat-icon-purple {
        background: rgba(159, 129, 235, 0.10);
        color: #9f81eb;
      }
    }
  }

  // ========== 报表卡片 ==========
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

      .text-nowrap {
        white-space: nowrap;
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
</style>
