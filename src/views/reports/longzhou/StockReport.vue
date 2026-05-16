<template>
  <div class="longzhou-stock-report">
    <!-- 页头 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon :size="28"><Box /></el-icon>
        </div>
        <div class="header-text">
          <h1 class="header-title">龙州塑业 - 库存报表</h1>
          <p class="header-subtitle">26-27榨季 库存数据统计</p>
        </div>
      </div>
      <div class="header-right">
        <el-date-picker v-model="selectedDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" size="default" style="width: 160px" />
      </div>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="16" class="summary-cards">
      <el-col :span="6">
        <el-card shadow="hover" class="summary-card">
          <div class="card-icon cloth-icon"><el-icon :size="22"><Box /></el-icon></div>
          <div class="card-body">
            <div class="card-label">布筒库存量</div>
            <div class="card-value">{{ summaryData.clothStock }}</div>
            <div class="card-sub">米</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="summary-card">
          <div class="card-icon output-icon"><el-icon :size="22"><TrendCharts /></el-icon></div>
          <div class="card-body">
            <div class="card-label">今日入库量</div>
            <div class="card-value">{{ summaryData.todayInput }}</div>
            <div class="card-sub">米</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="summary-card">
          <div class="card-icon output-icon"><el-icon :size="22"><Upload /></el-icon></div>
          <div class="card-body">
            <div class="card-label">今日出库量</div>
            <div class="card-value">{{ summaryData.todayOutput }}</div>
            <div class="card-sub">米</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="summary-card">
          <div class="card-icon spec-icon"><el-icon :size="22"><Collection /></el-icon></div>
          <div class="card-body">
            <div class="card-label">库存规格数</div>
            <div class="card-value">{{ summaryData.specCount }}</div>
            <div class="card-sub">种规格</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 库存表格 -->
    <el-card shadow="never" class="table-card">
      <template #header>
        <div class="card-header">
          <span class="header-title-text">布筒库存日报表</span>
          <el-button type="primary" size="small" @click="handleExport">导出</el-button>
        </div>
      </template>

      <el-table :data="pageData" border stripe style="width: 100%" max-height="800"
        :header-cell-style="headerCellStyle" size="small" show-summary :summary-method="summaryMethod">
        <el-table-column type="index" label="序号" width="55" align="center" fixed="left" />
        <el-table-column prop="date" label="日期" width="110" align="center" />
        <el-table-column prop="clothSpec" label="布筒规格" min-width="150" show-overflow-tooltip />
        <el-table-column label="使用客户信息" align="center">
          <el-table-column prop="useUnitName" label="使用单位名称" min-width="150" />
        </el-table-column>
        <el-table-column label="生产机台" align="center">
          <el-table-column prop="machineNo" label="机台号(#)" width="100" align="center" />
          <el-table-column prop="machineCount" label="机台数(台)" width="100" align="center" />
        </el-table-column>
        <el-table-column label="入库量" align="center">
          <el-table-column prop="inputCount" label="数量(个)" width="100" align="right" />
          <el-table-column prop="inputLength" label="每个布筒米数(M)" width="130" align="right" />
          <el-table-column prop="inputTotalLength" label="总长度(M)" width="120" align="right" />
        </el-table-column>
        <el-table-column label="出库量" align="center">
          <el-table-column prop="outputCount" label="数量(个)" width="100" align="right" />
          <el-table-column prop="outputLength" label="每个布筒长度(M)" width="130" align="right" />
          <el-table-column prop="outputTotalLength" label="总长度(M)" width="120" align="right" />
        </el-table-column>
        <el-table-column label="上日库存量" align="center">
          <el-table-column prop="lastDayCount" label="数量(个)" width="100" align="right" />
          <el-table-column prop="lastDayLength" label="总长度(M)" width="120" align="right" />
        </el-table-column>
        <el-table-column label="今日库存量" align="center">
          <el-table-column prop="todayCount" label="数量(个)" width="100" align="right" />
          <el-table-column prop="todayLength" label="总长度(M)" width="120" align="right" />
        </el-table-column>
        <el-table-column prop="location" label="存放地点名称" min-width="120" />
        <el-table-column prop="remark" label="备注" min-width="120" />
      </el-table>

      <div class="card-footer">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]" :total="filteredData.length"
          layout="total, sizes, prev, pager, next, jumper" background small />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Box, TrendCharts, Upload, Collection } from '@element-plus/icons-vue'

// ============================================================
// 日期选择
// ============================================================
const selectedDate = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

// ============================================================
// 数据模型
// ============================================================
interface StockRecord {
  id: number
  date: string
  clothSpec: string
  useUnitName: string
  machineNo: string
  machineCount: number
  inputCount: number
  inputLength: number
  inputTotalLength: number
  outputCount: number
  outputLength: number
  outputTotalLength: number
  lastDayCount: number
  lastDayLength: number
  todayCount: number
  todayLength: number
  location: string
  remark: string
}

// ============================================================
// Mock 数据
// ============================================================
const mockData: StockRecord[] = [
  { id: 1, date: '2026-07-01', clothSpec: '55*85', useUnitName: 'A集团', machineNo: '1#', machineCount: 2, inputCount: 500, inputLength: 500, inputTotalLength: 250000, outputCount: 480, outputLength: 500, outputTotalLength: 240000, lastDayCount: 1000, lastDayLength: 500000, todayCount: 1020, todayLength: 510000, location: 'A仓库', remark: '' },
  { id: 2, date: '2026-07-01', clothSpec: '55*90', useUnitName: 'A集团', machineNo: '2#', machineCount: 1, inputCount: 300, inputLength: 500, inputTotalLength: 150000, outputCount: 280, outputLength: 500, outputTotalLength: 140000, lastDayCount: 600, lastDayLength: 300000, todayCount: 620, todayLength: 310000, location: 'A仓库', remark: '' },
  { id: 3, date: '2026-07-01', clothSpec: '55*85', useUnitName: 'B糖业', machineNo: '3#', machineCount: 2, inputCount: 450, inputLength: 500, inputTotalLength: 225000, outputCount: 420, outputLength: 500, outputTotalLength: 210000, lastDayCount: 900, lastDayLength: 450000, todayCount: 930, todayLength: 465000, location: 'B仓库', remark: '' },
  { id: 4, date: '2026-07-01', clothSpec: '66*96', useUnitName: 'A集团', machineNo: '4#', machineCount: 1, inputCount: 200, inputLength: 500, inputTotalLength: 100000, outputCount: 180, outputLength: 500, outputTotalLength: 90000, lastDayCount: 400, lastDayLength: 200000, todayCount: 420, todayLength: 210000, location: 'A仓库', remark: '大规格' },
  { id: 5, date: '2026-07-01', clothSpec: '45*80', useUnitName: 'C糖业', machineNo: '5#', machineCount: 1, inputCount: 350, inputLength: 500, inputTotalLength: 175000, outputCount: 320, outputLength: 500, outputTotalLength: 160000, lastDayCount: 700, lastDayLength: 350000, todayCount: 730, todayLength: 365000, location: 'C仓库', remark: '' },
  { id: 6, date: '2026-07-01', clothSpec: '55*85', useUnitName: 'D糖业', machineNo: '6#', machineCount: 2, inputCount: 420, inputLength: 500, inputTotalLength: 210000, outputCount: 400, outputLength: 500, outputTotalLength: 200000, lastDayCount: 850, lastDayLength: 425000, todayCount: 870, todayLength: 435000, location: 'D仓库', remark: '' },
  { id: 7, date: '2026-07-01', clothSpec: '55*90', useUnitName: 'E糖业', machineNo: '7#', machineCount: 1, inputCount: 280, inputLength: 500, inputTotalLength: 140000, outputCount: 260, outputLength: 500, outputTotalLength: 130000, lastDayCount: 550, lastDayLength: 275000, todayCount: 570, todayLength: 285000, location: 'E仓库', remark: '' },
  { id: 8, date: '2026-07-01', clothSpec: '55*85', useUnitName: 'F糖业', machineNo: '8#', machineCount: 2, inputCount: 480, inputLength: 500, inputTotalLength: 240000, outputCount: 450, outputLength: 500, outputTotalLength: 225000, lastDayCount: 950, lastDayLength: 475000, todayCount: 980, todayLength: 490000, location: 'F仓库', remark: '' },
  { id: 9, date: '2026-07-01', clothSpec: '105*170', useUnitName: 'I糖业', machineNo: '9#', machineCount: 1, inputCount: 80, inputLength: 500, inputTotalLength: 40000, outputCount: 70, outputLength: 500, outputTotalLength: 35000, lastDayCount: 150, lastDayLength: 75000, todayCount: 160, todayLength: 80000, location: 'I仓库', remark: '集装袋用' },
  { id: 10, date: '2026-07-01', clothSpec: '55*85', useUnitName: 'G糖业', machineNo: '10#', machineCount: 1, inputCount: 400, inputLength: 500, inputTotalLength: 200000, outputCount: 380, outputLength: 500, outputTotalLength: 190000, lastDayCount: 800, lastDayLength: 400000, todayCount: 820, todayLength: 410000, location: 'G仓库', remark: '' }
]

// ============================================================
// 过滤和分页
// ============================================================
const filteredData = computed(() => {
  if (!selectedDate.value) return mockData
  return mockData.filter(r => r.date === selectedDate.value)
})

const pageData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredData.value.slice(start, start + pageSize.value)
})

// ============================================================
// 统计摘要
// ============================================================
const summaryData = computed(() => {
  const data = filteredData.value
  const totalInput = data.reduce((s, r) => s + r.inputTotalLength, 0)
  const totalOutput = data.reduce((s, r) => s + r.outputTotalLength, 0)
  const totalStock = data.reduce((s, r) => s + r.todayLength, 0)
  return {
    clothStock: (totalStock / 10000).toFixed(1) + '万',
    todayInput: (totalInput / 10000).toFixed(1) + '万',
    todayOutput: (totalOutput / 10000).toFixed(1) + '万',
    specCount: new Set(data.map(r => r.clothSpec)).size
  }
})

// ============================================================
// 合计行
// ============================================================
const summaryMethod = (param: { columns: any[]; data: any[] }) => {
  const { columns, data } = param
  const sums: string[] = []

  columns.forEach((column: any, idx: number) => {
    if (idx === 0) {
      sums[idx] = '合计'
      return
    }
    if (idx === 1) {
      sums[idx] = ''
      return
    }

    const properties = ['inputCount', 'inputTotalLength', 'outputCount', 'outputTotalLength', 'lastDayCount', 'lastDayLength', 'todayCount', 'todayLength']
    const prop = column.property
    if (properties.includes(prop)) {
      const total = data.reduce((s: number, r: any) => s + (Number(r[prop]) || 0), 0)
      sums[idx] = total.toLocaleString()
    } else {
      sums[idx] = ''
    }
  })

  return sums
}

// ============================================================
// 导出
// ============================================================
const handleExport = () => {
  console.log('导出库存报表')
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

.longzhou-stock-report {
  padding: 0 $spacing-5;
  background: $color-gray-100;
  min-height: 100vh;

  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-5 $spacing-6;
    background: linear-gradient(135deg, #e8590c 0%, #ff8f00 100%);
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
      background: rgba(255, 255, 255, 0.25);
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
    }

    .header-subtitle {
      font-size: $font-size-sm;
      color: rgba(255, 255, 255, 0.85);
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

        &.cloth-icon { background: linear-gradient(135deg, #1a73e8, #4a90e2); }
        &.output-icon { background: linear-gradient(135deg, #43a047, #66bb6a); }
        &.spec-icon { background: linear-gradient(135deg, #e8590c, #ff922b); }
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

  .table-card {
    background: #fff;
    border-radius: $border-radius-lg;
    box-shadow: $shadow-base;
    overflow: hidden;

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: $spacing-2;
      .header-title-text { font-weight: $font-weight-semibold; color: $color-gray-900; font-size: $font-size-base; }
    }

    :deep(.el-table) {
      font-size: $font-size-sm;
      .el-table__header-wrapper th { background: $color-gray-50; }
      .el-table__footer-wrapper td { background: #f0f5ff; font-weight: $font-weight-semibold; color: $color-gray-800; }
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
