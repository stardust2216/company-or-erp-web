<template>
  <div class="order-report-b">
    <div v-if="!isFullscreen" class="page-header">
      <div class="header-left">
        <div class="header-icon"><el-icon :size="28"><List /></el-icon></div>
        <div class="header-text">
          <h1 class="header-title">义乌军楚电子商务商行（湖南佬）- 订单管理表B</h1>
          <p class="header-subtitle">2026年度 订单管理明细报表</p>
        </div>
      </div>
    </div>

    <!-- 搜索区 -->
    <el-card v-if="!isFullscreen" shadow="never" class="search-card">
      <template #header>
        <span style="display:flex;align-items:center;justify-content:space-between;width:100%">
          <span>搜索条件</span>
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

    <!-- 4个统计卡片 -->
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
          <div class="card-icon contract-icon"><el-icon :size="22"><Document /></el-icon></div>
          <div class="card-body">
            <div class="card-label">合同总数</div>
            <div class="card-value">{{ summaryData.contractTotal }}</div>
            <div class="card-sub">合同数量</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="summary-card">
          <div class="card-icon category-icon"><el-icon :size="22"><Coin /></el-icon></div>
          <div class="card-body">
            <div class="card-label">总品类数</div>
            <div class="card-value highlight">{{ summaryData.categoryTotal }}</div>
            <div class="card-sub">产品品类数量</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="summary-card">
          <div class="card-icon trip-icon"><el-icon :size="22"><TrendCharts /></el-icon></div>
          <div class="card-body">
            <div class="card-label">车次合计</div>
            <div class="card-value">{{ summaryData.tripTotal }}</div>
            <div class="card-sub">车次总数量</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 表格区 -->
    <el-card shadow="never" class="table-card" :class="{ 'is-fullscreen': isFullscreen }">
      <template #header>
        <div class="card-header">
          <span>订单明细表</span>
          <el-tag type="info" effect="plain" size="small">共 {{ filteredData.length }} 条</el-tag>
          <el-button text @click="toggleFullscreen" :icon="fullscreenIcon" style="margin-left:auto;padding:0 8px;font-size:16px" />
        </div>
      </template>

      <div class="table-wrapper" :class="{ 'fullscreen-scroll': isFullscreen }">
        <el-table
          :data="paginatedData"
          border
          stripe
          style="width:100%"
          :max-height="isFullscreen ? 'calc(100vh - 140px)' : '800'"
          size="small"
          highlight-current-row
          :header-cell-style="headerCellStyle"
        >
          <!-- 客户名称（父级） -->
          <el-table-column label="客户名称" width="180" fixed="left">
            <el-table-column prop="groupName" label="集团名称" width="90" show-overflow-tooltip />
            <el-table-column prop="unitName" label="使用单位名称" width="90" show-overflow-tooltip />
          </el-table-column>

          <!-- 订单日期 -->
          <el-table-column prop="orderDate" label="订单日期" width="110" align="center" fixed="left" />

          <!-- 车次/小计 -->
          <el-table-column prop="tripNo" label="车次/小计" width="80" align="center" />

          <!-- 使用企业名称 -->
          <el-table-column prop="enterpriseName" label="使用企业名称" width="130" show-overflow-tooltip />

          <!-- 产品名称（父级） -->
          <el-table-column label="产品名称">
            <el-table-column prop="contractNo" label="合同编号" width="170" show-overflow-tooltip />
            <el-table-column prop="seq" label="序号" width="60" align="center" />
            <el-table-column prop="name" label="名称" width="70" show-overflow-tooltip />

            <!-- 外袋（父级） -->
            <el-table-column label="外袋" min-width="540">
              <el-table-column prop="outerWidthLength" label="宽度*长度（cm）" width="90" align="center" />
              <el-table-column prop="outerWeight" label="重量（g/条）" width="90" align="center" />
              <el-table-column prop="outerWarpTension" label="经向拉力/50mm（牛）" width="90" align="center" />
              <el-table-column prop="outerWeftTension" label="纬向拉力/50mm（牛）" width="90" align="center" />
              <el-table-column prop="outerDensity" label="经纬密度/100mm（经：纬）" width="90" align="center" />
              <el-table-column prop="outerColor" label="颜色" width="90" align="center" />
            </el-table-column>

            <!-- 使用布筒规格（父级） -->
            <el-table-column label="使用布筒规格" min-width="270">
              <el-table-column prop="tubeWidth" label="宽度（cm）" width="90" align="center" />
              <el-table-column prop="tubeSquareWeight" label="平方克重（g/㎡）" width="90" align="center" />
              <el-table-column prop="tubeColor" label="颜色" width="90" align="center" />
            </el-table-column>

            <!-- 内袋（父级） -->
            <el-table-column label="内袋" min-width="360">
              <el-table-column prop="innerWidthLength" label="宽度*长度（cm）" width="90" align="center" />
              <el-table-column prop="innerWeight" label="重量（g/条）" width="90" align="center" />
              <el-table-column prop="innerFilmType" label="高低压膜（高/低）" width="90" align="center" />
              <el-table-column prop="innerColor" label="颜色" width="90" align="center" />
            </el-table-column>
          </el-table-column>

          <!-- 产品规格（父级） -->
          <el-table-column label="产品规格" min-width="280">
            <el-table-column prop="totalWeight" label="整套克重（g/套）" width="100" align="center" />

            <!-- 袋口（父级） -->
            <el-table-column label="袋口" min-width="180">
              <el-table-column prop="pocketNormal" label="一般" width="60" align="center">
                <template #default="{ row }">
                  <span :class="row.pocketNormal === '✔' ? 'check-mark' : 'dash-mark'">{{ row.pocketNormal }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="pocketFlap" label="翻口" width="60" align="center">
                <template #default="{ row }">
                  <span :class="row.pocketFlap === '✔' ? 'check-mark' : 'dash-mark'">{{ row.pocketFlap }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="pocketCircle" label="圈口" width="60" align="center">
                <template #default="{ row }">
                  <span :class="row.pocketCircle === '✔' ? 'check-mark' : 'dash-mark'">{{ row.pocketCircle }}</span>
                </template>
              </el-table-column>
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
import { List, Document, Coin, TrendCharts, FullScreen, Close } from '@element-plus/icons-vue'

/* ========== 全屏切换 ========== */
const isFullscreen = ref(false)
const fullscreenIcon = computed(() => (isFullscreen.value ? Close : FullScreen))

function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
  const el = document.querySelector('.order-report-b') as HTMLElement
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

/* ========== 表头样式 ========== */
function headerCellStyle() {
  // 让多级表头居中对齐
  return { textAlign: 'center' as const }
}

/* ========== 搜索表单 ========== */
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

/* ========== 数据接口 ========== */
interface OrderRow {
  // 客户名称 -> 集团名称 / 使用单位名称
  groupName: string
  unitName: string
  // 订单日期
  orderDate: string
  // 车次/小计
  tripNo: string
  // 使用企业名称
  enterpriseName: string
  // 产品名称 -> 合同编号 / 序号 / 名称
  contractNo: string
  seq: number
  name: string
  // 外袋
  outerWidthLength: string
  outerWeight: string
  outerWarpTension: string
  outerWeftTension: string
  outerDensity: string
  outerColor: string
  // 使用布筒规格
  tubeWidth: string
  tubeSquareWeight: string
  tubeColor: string
  // 内袋
  innerWidthLength: string
  innerWeight: string
  innerFilmType: string
  innerColor: string
  // 整套克重
  totalWeight: string
  // 袋口
  pocketNormal: string
  pocketFlap: string
  pocketCircle: string
}

/* ========== Mock 数据（15条，基于Excel前15条明细行） ==========
   集团：湖南佬
   使用单位：达沃
   合同编号：YHSY-20251117001
   订单日期：2025-11-15
   车次：1
   使用企业名称：湖南佬达沃4
   品类依次：AA29, AA27, AA25, S30, S28, S26, PDP, 661, 662, 664, 663, 665, S32, S34, AA30
   外袋规格：66*96 或 56*91，布筒、内袋规格相应调整
   袋口全部为翻口（✔）
*/
const mockData: OrderRow[] = [
  {
    groupName: '湖南佬', unitName: '达沃', orderDate: '2025-11-15', tripNo: '1',
    enterpriseName: '湖南佬达沃4', contractNo: 'YHSY-20251117001', seq: 1, name: 'AA29',
    outerWidthLength: '66*96', outerWeight: '107', outerWarpTension: '-', outerWeftTension: '-',
    outerDensity: '-', outerColor: '-',
    tubeWidth: '67', tubeSquareWeight: '76', tubeColor: '透白',
    innerWidthLength: '69*108', innerWeight: '35', innerFilmType: '高', innerColor: '白',
    totalWeight: '142',
    pocketNormal: '-', pocketFlap: '✔', pocketCircle: '-',
  },
  {
    groupName: '湖南佬', unitName: '达沃', orderDate: '2025-11-15', tripNo: '1',
    enterpriseName: '湖南佬达沃4', contractNo: 'YHSY-20251117001', seq: 2, name: 'AA27',
    outerWidthLength: '66*96', outerWeight: '105', outerWarpTension: '-', outerWeftTension: '-',
    outerDensity: '-', outerColor: '-',
    tubeWidth: '66', tubeSquareWeight: '75', tubeColor: '透白',
    innerWidthLength: '69*108', innerWeight: '34', innerFilmType: '高', innerColor: '白',
    totalWeight: '140',
    pocketNormal: '-', pocketFlap: '✔', pocketCircle: '-',
  },
  {
    groupName: '湖南佬', unitName: '达沃', orderDate: '2025-11-15', tripNo: '1',
    enterpriseName: '湖南佬达沃4', contractNo: 'YHSY-20251117001', seq: 3, name: 'AA25',
    outerWidthLength: '66*96', outerWeight: '103', outerWarpTension: '-', outerWeftTension: '-',
    outerDensity: '-', outerColor: '-',
    tubeWidth: '65', tubeSquareWeight: '74', tubeColor: '透白',
    innerWidthLength: '68*106', innerWeight: '33', innerFilmType: '高', innerColor: '白',
    totalWeight: '138',
    pocketNormal: '-', pocketFlap: '✔', pocketCircle: '-',
  },
  {
    groupName: '湖南佬', unitName: '达沃', orderDate: '2025-11-15', tripNo: '1',
    enterpriseName: '湖南佬达沃4', contractNo: 'YHSY-20251117001', seq: 4, name: 'S30',
    outerWidthLength: '66*96', outerWeight: '110', outerWarpTension: '-', outerWeftTension: '-',
    outerDensity: '-', outerColor: '-',
    tubeWidth: '68', tubeSquareWeight: '78', tubeColor: '透白',
    innerWidthLength: '70*110', innerWeight: '36', innerFilmType: '高', innerColor: '白',
    totalWeight: '146',
    pocketNormal: '-', pocketFlap: '✔', pocketCircle: '-',
  },
  {
    groupName: '湖南佬', unitName: '达沃', orderDate: '2025-11-15', tripNo: '1',
    enterpriseName: '湖南佬达沃4', contractNo: 'YHSY-20251117001', seq: 5, name: 'S28',
    outerWidthLength: '66*96', outerWeight: '108', outerWarpTension: '-', outerWeftTension: '-',
    outerDensity: '-', outerColor: '-',
    tubeWidth: '67', tubeSquareWeight: '76', tubeColor: '透白',
    innerWidthLength: '69*108', innerWeight: '35', innerFilmType: '高', innerColor: '白',
    totalWeight: '143',
    pocketNormal: '-', pocketFlap: '✔', pocketCircle: '-',
  },
  {
    groupName: '湖南佬', unitName: '达沃', orderDate: '2025-11-15', tripNo: '1',
    enterpriseName: '湖南佬达沃4', contractNo: 'YHSY-20251117001', seq: 6, name: 'S26',
    outerWidthLength: '66*96', outerWeight: '106', outerWarpTension: '-', outerWeftTension: '-',
    outerDensity: '-', outerColor: '-',
    tubeWidth: '66', tubeSquareWeight: '75', tubeColor: '透白',
    innerWidthLength: '68*106', innerWeight: '34', innerFilmType: '高', innerColor: '白',
    totalWeight: '141',
    pocketNormal: '-', pocketFlap: '✔', pocketCircle: '-',
  },
  {
    groupName: '湖南佬', unitName: '达沃', orderDate: '2025-11-15', tripNo: '1',
    enterpriseName: '湖南佬达沃4', contractNo: 'YHSY-20251117001', seq: 7, name: 'PDP',
    outerWidthLength: '56*91', outerWeight: '95', outerWarpTension: '-', outerWeftTension: '-',
    outerDensity: '-', outerColor: '-',
    tubeWidth: '58', tubeSquareWeight: '72', tubeColor: '透白',
    innerWidthLength: '58*102', innerWeight: '30', innerFilmType: '高', innerColor: '白',
    totalWeight: '128',
    pocketNormal: '-', pocketFlap: '✔', pocketCircle: '-',
  },
  {
    groupName: '湖南佬', unitName: '达沃', orderDate: '2025-11-15', tripNo: '1',
    enterpriseName: '湖南佬达沃4', contractNo: 'YHSY-20251117001', seq: 8, name: '661',
    outerWidthLength: '56*91', outerWeight: '92', outerWarpTension: '-', outerWeftTension: '-',
    outerDensity: '-', outerColor: '-',
    tubeWidth: '57', tubeSquareWeight: '70', tubeColor: '透白',
    innerWidthLength: '58*100', innerWeight: '29', innerFilmType: '高', innerColor: '白',
    totalWeight: '124',
    pocketNormal: '-', pocketFlap: '✔', pocketCircle: '-',
  },
  {
    groupName: '湖南佬', unitName: '达沃', orderDate: '2025-11-15', tripNo: '1',
    enterpriseName: '湖南佬达沃4', contractNo: 'YHSY-20251117001', seq: 9, name: '662',
    outerWidthLength: '56*91', outerWeight: '90', outerWarpTension: '-', outerWeftTension: '-',
    outerDensity: '-', outerColor: '-',
    tubeWidth: '56', tubeSquareWeight: '69', tubeColor: '透白',
    innerWidthLength: '57*100', innerWeight: '28', innerFilmType: '高', innerColor: '白',
    totalWeight: '122',
    pocketNormal: '-', pocketFlap: '✔', pocketCircle: '-',
  },
  {
    groupName: '湖南佬', unitName: '达沃', orderDate: '2025-11-15', tripNo: '1',
    enterpriseName: '湖南佬达沃4', contractNo: 'YHSY-20251117001', seq: 10, name: '664',
    outerWidthLength: '56*91', outerWeight: '93', outerWarpTension: '-', outerWeftTension: '-',
    outerDensity: '-', outerColor: '-',
    tubeWidth: '57', tubeSquareWeight: '71', tubeColor: '透白',
    innerWidthLength: '58*102', innerWeight: '30', innerFilmType: '高', innerColor: '白',
    totalWeight: '126',
    pocketNormal: '-', pocketFlap: '✔', pocketCircle: '-',
  },
  {
    groupName: '湖南佬', unitName: '达沃', orderDate: '2025-11-15', tripNo: '1',
    enterpriseName: '湖南佬达沃4', contractNo: 'YHSY-20251117001', seq: 11, name: '663',
    outerWidthLength: '56*91', outerWeight: '91', outerWarpTension: '-', outerWeftTension: '-',
    outerDensity: '-', outerColor: '-',
    tubeWidth: '57', tubeSquareWeight: '70', tubeColor: '透白',
    innerWidthLength: '57*100', innerWeight: '29', innerFilmType: '高', innerColor: '白',
    totalWeight: '123',
    pocketNormal: '-', pocketFlap: '✔', pocketCircle: '-',
  },
  {
    groupName: '湖南佬', unitName: '达沃', orderDate: '2025-11-15', tripNo: '1',
    enterpriseName: '湖南佬达沃4', contractNo: 'YHSY-20251117001', seq: 12, name: '665',
    outerWidthLength: '56*91', outerWeight: '89', outerWarpTension: '-', outerWeftTension: '-',
    outerDensity: '-', outerColor: '-',
    tubeWidth: '56', tubeSquareWeight: '68', tubeColor: '透白',
    innerWidthLength: '57*100', innerWeight: '28', innerFilmType: '高', innerColor: '白',
    totalWeight: '120',
    pocketNormal: '-', pocketFlap: '✔', pocketCircle: '-',
  },
  {
    groupName: '湖南佬', unitName: '达沃', orderDate: '2025-11-15', tripNo: '1',
    enterpriseName: '湖南佬达沃4', contractNo: 'YHSY-20251117001', seq: 13, name: 'S32',
    outerWidthLength: '66*96', outerWeight: '112', outerWarpTension: '-', outerWeftTension: '-',
    outerDensity: '-', outerColor: '-',
    tubeWidth: '68', tubeSquareWeight: '79', tubeColor: '透白',
    innerWidthLength: '70*110', innerWeight: '37', innerFilmType: '高', innerColor: '白',
    totalWeight: '148',
    pocketNormal: '-', pocketFlap: '✔', pocketCircle: '-',
  },
  {
    groupName: '湖南佬', unitName: '达沃', orderDate: '2025-11-15', tripNo: '1',
    enterpriseName: '湖南佬达沃4', contractNo: 'YHSY-20251117001', seq: 14, name: 'S34',
    outerWidthLength: '66*96', outerWeight: '115', outerWarpTension: '-', outerWeftTension: '-',
    outerDensity: '-', outerColor: '-',
    tubeWidth: '69', tubeSquareWeight: '80', tubeColor: '透白',
    innerWidthLength: '70*112', innerWeight: '38', innerFilmType: '高', innerColor: '白',
    totalWeight: '152',
    pocketNormal: '-', pocketFlap: '✔', pocketCircle: '-',
  },
  {
    groupName: '湖南佬', unitName: '达沃', orderDate: '2025-11-15', tripNo: '1',
    enterpriseName: '湖南佬达沃4', contractNo: 'YHSY-20251117001', seq: 15, name: 'AA30',
    outerWidthLength: '66*96', outerWeight: '108', outerWarpTension: '-', outerWeftTension: '-',
    outerDensity: '-', outerColor: '-',
    tubeWidth: '67', tubeSquareWeight: '77', tubeColor: '透白',
    innerWidthLength: '69*110', innerWeight: '36', innerFilmType: '高', innerColor: '白',
    totalWeight: '144',
    pocketNormal: '-', pocketFlap: '✔', pocketCircle: '-',
  },
]

/* ========== 数据过滤 ========== */
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

/* ========== 分页 ========== */
const paginatedData = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredData.value.slice(start, start + pageSize.value)
})

/* ========== 统计卡片 ========== */
const summaryData = computed(() => {
  const list = filteredData.value

  // 去重合同编号
  const contracts = new Set(list.map((r) => r.contractNo))
  // 去重品类（名称）
  const categories = new Set(list.map((r) => r.name))

  return {
    totalRecords: list.length,
    contractTotal: contracts.size,
    categoryTotal: categories.size,
    tripTotal: list.length, // 每条记录1车次
  }
})
</script>

<style lang="scss" scoped>
.order-report-b {
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

/* 搜索卡 */
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

/* 统计卡片 */
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

  &.records-icon { background: linear-gradient(135deg, #409eff, #79bbff); }
  &.contract-icon { background: linear-gradient(135deg, #36d1dc, #5b86e5); }
  &.category-icon { background: linear-gradient(135deg, #67c23a, #95d475); }
  &.trip-icon { background: linear-gradient(135deg, #e6a23c, #f4d19e); }
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

  &.highlight { color: #67c23a; }
}

.card-sub {
  font-size: 12px;
  color: #c0c4cc;
  margin-top: 2px;
}

/* 表格卡 */
.table-card {
  border-radius: 12px;
  border: none;

  :deep(.el-table__row:hover) {
    background-color: #ecf5ff !important;
  }

  :deep(.el-table__header-wrapper th) {
    background: #f5f7fa;
  }

  :deep(.el-table th.el-table__cell) {
    word-break: keep-all;
  }
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.table-wrapper {
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;

  &.fullscreen-scroll {
    overflow-x: auto;
    overflow-y: auto;
  }

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

.check-mark {
  color: #67c23a;
  font-weight: 700;
}

.dash-mark {
  color: #c0c4cc;
}
</style>
