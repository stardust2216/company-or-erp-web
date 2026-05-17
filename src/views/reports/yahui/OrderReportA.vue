<template>
  <div class="order-report-a">
    <!-- 页头 -->
    <div v-if="!isFullscreen" class="page-header">
      <div class="header-left">
        <div class="header-icon"><el-icon :size="28"><Document /></el-icon></div>
        <div class="header-text">
          <h1 class="header-title">亚辉塑业 - 统计表A</h1>
          <p class="header-subtitle">亚辉塑业订单管理 — 统计表A（2026年）</p>
        </div>
      </div>
    </div>

    <!-- 搜索区 -->
    <el-card v-if="!isFullscreen" shadow="never" class="search-card">
      <template #header>
        <span style="display:flex;align-items:center;justify-content:space-between;width:100%">
          <span style="font-weight:600;font-size:14px">搜索条件</span>
          <el-button text @click="toggleFullscreen" :icon="fullscreenIcon" size="small" />
        </span>
      </template>
      <el-form :model="searchForm" inline label-width="85px" size="default">
        <el-form-item label="集团名称">
          <el-input v-model="searchForm.groupName" placeholder="集团名称" clearable style="width:180px" />
        </el-form-item>
        <el-form-item label="合同编号">
          <el-input v-model="searchForm.contractNo" placeholder="合同编号" clearable style="width:180px" />
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始"
            end-placeholder="结束"
            value-format="YYYY-MM-DD"
            style="width:260px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查 询</el-button>
          <el-button @click="handleReset">重 置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 统计卡片 -->
    <el-row v-if="!isFullscreen" :gutter="16" class="summary-cards">
      <el-col :span="6">
        <el-card shadow="hover" class="summary-card">
          <div class="card-icon records-icon"><el-icon :size="22"><List /></el-icon></div>
          <div class="card-body">
            <div class="card-label">总记录数</div>
            <div class="card-value">{{ summaryData.totalRecords }}</div>
            <div class="card-sub">订单明细条数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="summary-card">
          <div class="card-icon qty-icon"><el-icon :size="22"><Box /></el-icon></div>
          <div class="card-body">
            <div class="card-label">订单总数（套）</div>
            <div class="card-value">{{ summaryData.totalQty }}</div>
            <div class="card-sub">订单数量合计</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="summary-card">
          <div class="card-icon amount-icon"><el-icon :size="22"><Coin /></el-icon></div>
          <div class="card-body">
            <div class="card-label">总金额（元）</div>
            <div class="card-value">{{ summaryData.totalAmount }}</div>
            <div class="card-sub">金额合计（含单价行）</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="summary-card">
          <div class="card-icon client-icon"><el-icon :size="22"><User /></el-icon></div>
          <div class="card-body">
            <div class="card-label">涉及客户数</div>
            <div class="card-value highlight">{{ summaryData.clientCount }}</div>
            <div class="card-sub">不同集团数量</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 表格 -->
    <el-card shadow="never" class="table-card" :class="{ 'is-fullscreen': isFullscreen }">
      <template #header>
        <div class="card-header">
          <span style="font-weight:600;font-size:14px">订单明细表</span>
          <el-tag type="info" effect="plain" size="small">共 {{ filteredData.length }} 条</el-tag>
          <el-button text @click="toggleFullscreen" :icon="fullscreenIcon" style="margin-left:auto;padding:0 8px;font-size:16px" />
        </div>
      </template>

      <div class="table-scroll-wrapper">
        <el-table
          :data="paginatedData"
          border
          stripe
          style="width:100%"
          :max-height="isFullscreen ? 'calc(100vh - 140px)' : '800'"
          size="small"
          highlight-current-row
          default-expand-all
          show-header
        >
        <!-- Level 1 序号 -->
        <el-table-column type="index" label="序号" width="55" align="center" fixed="left" />

        <!-- Level 1 客户名称 -->
        <el-table-column label="客户名称" align="center">
          <!-- Level 2 -->
          <el-table-column prop="groupName" label="集团名称" width="140" show-overflow-tooltip />
          <el-table-column prop="useUnit" label="使用单位名称" width="140" show-overflow-tooltip />
        </el-table-column>

        <!-- Level 1 订单日期 -->
        <el-table-column prop="orderDate" label="订单日期" width="110" align="center" />

        <!-- Level 1 订单合同 -->
        <el-table-column label="订单合同" align="center">
          <!-- Level 2 -->
          <el-table-column prop="orderSeq" label="使用单位订单序号" width="140" align="center" />
          <el-table-column prop="contractNo" label="合同编号" width="180" show-overflow-tooltip />
        </el-table-column>

        <!-- Level 1 合同产品 -->
        <el-table-column label="合同产品" align="center">
          <!-- Level 2 -->
          <el-table-column prop="innerSeq" label="序号" width="60" align="center" />
          <el-table-column prop="productName" label="产品名称" width="200" show-overflow-tooltip />
        </el-table-column>

        <!-- Level 1 订单数量（套） -->
        <el-table-column prop="orderQty" label="订单数量（套）" width="120" align="right">
          <template #default="{ row }">
            {{ row.orderQty !== null && row.orderQty !== undefined ? row.orderQty.toLocaleString() : '-' }}
          </template>
        </el-table-column>

        <!-- Level 1 单价（元/套） -->
        <el-table-column prop="unitPrice" label="单价（元/套）" width="120" align="right">
          <template #default="{ row }">
            {{ row.unitPrice !== null && row.unitPrice !== undefined ? row.unitPrice.toLocaleString() : '-' }}
          </template>
        </el-table-column>

        <!-- Level 1 产品规格 -->
        <el-table-column label="产品规格" align="center">
          <!-- Level 2 外袋 -->
          <el-table-column label="外袋" align="center">
            <!-- Level 3 -->
            <el-table-column prop="bagWidth" label="宽度*有效长度（cm）" width="130" align="center" show-overflow-tooltip />
            <el-table-column prop="weight" label="重量（g/套）" width="100" align="center" />
            <el-table-column prop="warpTensile" label="经向拉力（牛）" width="100" align="center" />
            <el-table-column prop="weftTensile" label="纬向拉力（牛）" width="100" align="center" />
            <el-table-column prop="density" label="经纬密度（经：纬）" width="120" align="center" />
            <el-table-column prop="color" label="颜色" width="80" align="center" />
          </el-table-column>
        </el-table-column>
      </el-table>
      </div>

      <div class="pagination-wrap">
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
import { ref, computed } from 'vue'
import { Document, List, Box, Coin, User, FullScreen, Close } from '@element-plus/icons-vue'

// ── 数据接口 ─────────────────────
interface OrderRow {
  groupName: string            // 集团名称
  useUnit: string              // 使用单位名称
  orderDate: string            // 订单日期
  orderSeq: number | null      // 使用单位订单序号
  contractNo: string           // 合同编号
  innerSeq: number             // 序号(内层)
  productName: string          // 产品名称
  orderQty: number             // 订单数量（套）
  unitPrice: number | null     // 单价（元/套）
  bagWidth: string             // 宽度*有效长度（cm）
  weight: string               // 重量（g/套）
  warpTensile: string          // 经向拉力（牛）
  weftTensile: string          // 纬向拉力（牛）
  density: string              // 经纬密度（经：纬）
  color: string                // 颜色
}

// ── 全屏切换 ─────────────────────
const isFullscreen = ref(false)
const fullscreenIcon = computed(() => (isFullscreen.value ? Close : FullScreen))
function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
  const el = document.querySelector('.order-report-a') as HTMLElement
  if (!el) return
  if (isFullscreen.value) {
    el.style.position = 'fixed'
    el.style.inset = '0'
    el.style.zIndex = '9999'
    el.style.background = '#f0f2f5'
    el.style.padding = '20px'
    el.style.overflow = 'auto'
  } else {
    el.style.position = ''
    el.style.inset = ''
    el.style.zIndex = ''
    el.style.background = ''
    el.style.padding = ''
    el.style.overflow = ''
  }
  setTimeout(() => window.dispatchEvent(new Event('resize')), 200)
}

// ── 搜索 ─────────────────────────
const searchForm = ref({
  groupName: '',
  contractNo: '',
  dateRange: null as [string, string] | null,
})
const page = ref(1)
const pageSize = ref(10)

function handleSearch() {
  page.value = 1
}
function handleReset() {
  searchForm.value = { groupName: '', contractNo: '', dateRange: null }
  page.value = 1
}

// ── Mock 数据（基于Excel前15条明细）─
const mockData: OrderRow[] = [
  {
    groupName: '广西添美农业科技',
    useUnit: '武鸣添美',
    orderDate: '2026-05-02',
    orderSeq: 1,
    contractNo: 'YHSY-20260502001',
    innerSeq: 1,
    productName: '美绿星0.16%LCSCA单标25kg',
    orderQty: 6000,
    unitPrice: 2.1,
    bagWidth: '45*79',
    weight: '93',
    warpTensile: '≥565',
    weftTensile: '≥535',
    density: '-',
    color: '白色',
  },
  {
    groupName: '广西添美农业科技',
    useUnit: '武鸣添美',
    orderDate: '2026-05-04',
    orderSeq: 2,
    contractNo: 'YHSY-20260504001',
    innerSeq: 1,
    productName: '粒比粒0.5% SDSCA 50kg',
    orderQty: 6000,
    unitPrice: 3.35,
    bagWidth: '60*98',
    weight: '163',
    warpTensile: '≥665',
    weftTensile: '≥635',
    density: '-',
    color: '白色',
  },
  {
    groupName: '广西添美农业科技',
    useUnit: '武鸣添美',
    orderDate: '2026-05-04',
    orderSeq: 2,
    contractNo: 'YHSY-20260504001',
    innerSeq: 2,
    productName: '添美LCSCA 50kg 35% 15-5-15',
    orderQty: 3000,
    unitPrice: 2.84,
    bagWidth: '60*98',
    weight: '129',
    warpTensile: '≥665',
    weftTensile: '≥635',
    density: '-',
    color: '白色',
  },
  {
    groupName: '广西添美',
    useUnit: '丁当凯侨',
    orderDate: '2026-05-06',
    orderSeq: 1,
    contractNo: 'YHSY-20260506001',
    innerSeq: 1,
    productName: '糖袋内膜60*117*38',
    orderQty: 4737,
    unitPrice: 10,
    bagWidth: '-',
    weight: '-',
    warpTensile: '-',
    weftTensile: '-',
    density: '-',
    color: '-',
  },
  {
    groupName: '广西添美',
    useUnit: '丁当凯侨',
    orderDate: '2026-05-06',
    orderSeq: 2,
    contractNo: 'YHSY-20260506001',
    innerSeq: 2,
    productName: '低压内膜49*94*17',
    orderQty: 2000,
    unitPrice: null,
    bagWidth: '-',
    weight: '-',
    warpTensile: '-',
    weftTensile: '-',
    density: '-',
    color: '-',
  },
  {
    groupName: '小马快跑食材供应链',
    useUnit: '-',
    orderDate: '2026-05-02',
    orderSeq: 1,
    contractNo: 'YHSY-20260502001',
    innerSeq: 1,
    productName: '空白袋',
    orderQty: 5000,
    unitPrice: 1.5,
    bagWidth: '50*90',
    weight: '90',
    warpTensile: '≥565',
    weftTensile: '≥535',
    density: '-',
    color: '白色',
  },
  {
    groupName: '小马快跑',
    useUnit: '-',
    orderDate: '2026-05-08',
    orderSeq: 2,
    contractNo: 'YHSY-20260508001',
    innerSeq: 1,
    productName: '空白袋',
    orderQty: 5000,
    unitPrice: 1.5,
    bagWidth: '45*79',
    weight: '74',
    warpTensile: '≥565',
    weftTensile: '≥535',
    density: '-',
    color: '白色',
  },
  {
    groupName: '小马快跑',
    useUnit: '-',
    orderDate: '2026-05-09',
    orderSeq: 3,
    contractNo: 'YHSY-20260509001',
    innerSeq: 1,
    productName: '空白袋',
    orderQty: 4000,
    unitPrice: 1.5,
    bagWidth: '45*79',
    weight: '74',
    warpTensile: '≥565',
    weftTensile: '≥535',
    density: '-',
    color: '白色',
  },
  {
    groupName: '小马快跑',
    useUnit: '-',
    orderDate: '2026-05-12',
    orderSeq: 4,
    contractNo: 'YHSY-20260512001',
    innerSeq: 1,
    productName: '空白袋',
    orderQty: 6000,
    unitPrice: 1.5,
    bagWidth: '50*90',
    weight: '90',
    warpTensile: '≥565',
    weftTensile: '≥535',
    density: '-',
    color: '白色',
  },
  // --- 以下为补充的5条数据（风格与上游一致）---
  {
    groupName: '小马快跑',
    useUnit: '-',
    orderDate: '2026-05-15',
    orderSeq: 5,
    contractNo: 'YHSY-20260515001',
    innerSeq: 1,
    productName: '空白袋',
    orderQty: 5000,
    unitPrice: 1.5,
    bagWidth: '50*90',
    weight: '90',
    warpTensile: '≥565',
    weftTensile: '≥535',
    density: '-',
    color: '白色',
  },
  {
    groupName: '广西添美农业科技',
    useUnit: '武鸣添美',
    orderDate: '2026-05-18',
    orderSeq: 3,
    contractNo: 'YHSY-20260518001',
    innerSeq: 1,
    productName: '美绿星0.16%LCSCA单标25kg',
    orderQty: 8000,
    unitPrice: 2.1,
    bagWidth: '45*79',
    weight: '93',
    warpTensile: '≥565',
    weftTensile: '≥535',
    density: '-',
    color: '白色',
  },
  {
    groupName: '广西添美',
    useUnit: '丁当凯侨',
    orderDate: '2026-05-20',
    orderSeq: 3,
    contractNo: 'YHSY-20260520001',
    innerSeq: 1,
    productName: '糖袋内膜60*117*38',
    orderQty: 3000,
    unitPrice: 10,
    bagWidth: '-',
    weight: '-',
    warpTensile: '-',
    weftTensile: '-',
    density: '-',
    color: '-',
  },
  {
    groupName: '小马快跑',
    useUnit: '-',
    orderDate: '2026-05-22',
    orderSeq: 6,
    contractNo: 'YHSY-20260522001',
    innerSeq: 1,
    productName: '空白袋',
    orderQty: 7000,
    unitPrice: 1.5,
    bagWidth: '60*98',
    weight: '163',
    warpTensile: '≥665',
    weftTensile: '≥635',
    density: '-',
    color: '白色',
  },
  {
    groupName: '广西添美农业科技',
    useUnit: '武鸣添美',
    orderDate: '2026-05-25',
    orderSeq: 4,
    contractNo: 'YHSY-20260525001',
    innerSeq: 1,
    productName: '粒比粒0.5% SDSCA 50kg',
    orderQty: 5000,
    unitPrice: 3.35,
    bagWidth: '60*98',
    weight: '163',
    warpTensile: '≥665',
    weftTensile: '≥635',
    density: '-',
    color: '白色',
  },
  {
    groupName: '广西添美',
    useUnit: '丁当凯侨',
    orderDate: '2026-05-28',
    orderSeq: 4,
    contractNo: 'YHSY-20260528001',
    innerSeq: 1,
    productName: '低压内膜49*94*17',
    orderQty: 1500,
    unitPrice: null,
    bagWidth: '-',
    weight: '-',
    warpTensile: '-',
    weftTensile: '-',
    density: '-',
    color: '-',
  },
]

// ── 筛选 ─────────────────────────
const filteredData = computed(() => {
  let list = [...mockData]
  const s = searchForm.value
  if (s.groupName) {
    list = list.filter((r) => r.groupName.includes(s.groupName))
  }
  if (s.contractNo) {
    list = list.filter((r) => r.contractNo.includes(s.contractNo))
  }
  if (s.dateRange) {
    const [start, end] = s.dateRange
    list = list.filter((r) => r.orderDate >= start && r.orderDate <= end)
  }
  return list
})

const paginatedData = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredData.value.slice(start, start + pageSize.value)
})

// ── 统计 ─────────────────────────
const summaryData = computed(() => {
  const list = filteredData.value
  const totalRecords = list.length
  const totalQty = list.reduce((s, r) => s + (r.orderQty || 0), 0)
  const totalAmount = list.reduce((s, r) => s + (r.orderQty || 0) * (r.unitPrice || 0), 0)
  const uniqueClients = new Set(list.map((r) => r.groupName))
  return {
    totalRecords,
    totalQty: totalQty.toLocaleString(),
    totalAmount: totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    clientCount: uniqueClients.size,
  }
})
</script>

<style lang="scss" scoped>
.order-report-a {
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
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;
    flex: 1;
  }

  .header-icon {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: #fff;
    flex-shrink: 0;
  }

  .header-title {
    font-size: 20px;
    font-weight: 700;
    color: #1a1a2e;
    margin: 0 0 4px;
  }

  .header-subtitle {
    font-size: 13px;
    color: #999;
    margin: 0;
  }
}

.search-card {
  margin-bottom: 16px;
  border-radius: 12px;
  border: none;

  :deep(.el-form) {
    display: flex;
    flex-wrap: wrap;
    align-items: center;

    .el-form-item {
      margin-bottom: 0;
      margin-right: 16px;
    }
  }
}

.summary-cards {
  margin-bottom: 16px;
}

.summary-card {
  border-radius: 12px;
  border: 1px solid transparent;
  transition: all 0.25s ease;

  &:hover {
    border-color: #a0cfff;
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
  }

  :deep(.el-card__body) {
    display: flex;
    align-items: center;
    padding: 20px;
  }
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: #fff;
  flex-shrink: 0;

  &.records-icon {
    background: linear-gradient(135deg, #409eff, #79bbff);
  }
  &.qty-icon {
    background: linear-gradient(135deg, #e6a23c, #f4d19e);
  }
  &.amount-icon {
    background: linear-gradient(135deg, #36d1dc, #5b86e5);
  }
  &.client-icon {
    background: linear-gradient(135deg, #67c23a, #95d475);
  }
}

.card-body {
  margin-left: 16px;
  flex: 1;
}

.card-label {
  font-size: 13px;
  color: #909399;
  margin-bottom: 4px;
}

.card-value {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a2e;
  line-height: 1.2;

  &.highlight {
    color: #409eff;
  }
}

.card-sub {
  font-size: 12px;
  color: #c0c4cc;
  margin-top: 2px;
}

.table-card {
  border-radius: 12px;
  border: none;

  :deep(.el-table__row:hover) {
    background-color: #ecf5ff !important;
  }

  :deep(.el-table__header-wrapper th) {
    background: #f5f7fa;
  }
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.table-scroll-wrapper {
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;

  :deep(.el-table) {
    width: max-content !important;
    min-width: 100% !important;
  }
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  padding: 16px 0 4px;
}

.is-fullscreen {
  border-radius: 0;
  margin: 0;
}
</style>
