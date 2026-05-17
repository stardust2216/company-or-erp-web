<template>
  <div class="order-report-c">
    <!-- 页头 -->
    <div v-if="!isFullscreen" class="page-header">
      <div class="header-left">
        <div class="header-icon"><el-icon :size="28"><Document /></el-icon></div>
        <div class="header-text">
          <h1 class="header-title">亚辉塑业 - 统计表C</h1>
          <p class="header-subtitle">亚辉塑业订单管理 — 统计表C（2026年）</p>
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
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="summary-card">
          <div class="card-icon order-icon"><el-icon :size="22"><SoldOut /></el-icon></div>
          <div class="card-body">
            <div class="card-label">订单总数（套）</div>
            <div class="card-value">{{ summaryData.totalOrderQty }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="summary-card">
          <div class="card-icon ship-icon"><el-icon :size="22"><Box /></el-icon></div>
          <div class="card-body">
            <div class="card-label">累计发货（套）</div>
            <div class="card-value">{{ summaryData.totalShipSets }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="summary-card">
          <div class="card-icon stock-icon"><el-icon :size="22"><TrendCharts /></el-icon></div>
          <div class="card-body">
            <div class="card-label">剩余库存（套）</div>
            <div class="card-value highlight">{{ summaryData.totalRemaining }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 表格卡片 -->
    <el-card shadow="never" class="table-card" :class="{ 'is-fullscreen': isFullscreen }">
      <template #header>
        <div class="card-header">
          <span style="font-weight:600;font-size:14px">亚辉塑业订单管理 — 统计表C（2026年）</span>
          <el-tag type="info" effect="plain" size="small">共 {{ filteredData.length }} 条</el-tag>
          <div style="margin-left:auto" />
          <el-button text @click="toggleFullscreen" :icon="fullscreenIcon" size="small" style="font-size:16px;padding:0 8px" />
        </div>
      </template>
      <div class="table-scroll-wrapper">
        <el-table
          :data="paginatedData"
          border
          stripe
          size="small"
          highlight-current-row
          style="width: 100%"
          header-row-class-name="multi-header-row"
        >
          <!-- ====== 客户名称 ====== -->
          <el-table-column label="客户名称" align="center">
            <el-table-column prop="groupName" label="集团名称" width="120" show-overflow-tooltip />
            <el-table-column prop="unitName" label="使用单位名称" width="120" show-overflow-tooltip />
          </el-table-column>

          <!-- ====== 订单日期 ====== -->
          <el-table-column prop="orderDate" label="订单日期" width="110" align="center" />

          <!-- ====== 订单合同 ====== -->
          <el-table-column label="订单合同" align="center">
            <el-table-column prop="orderSeq" label="使用单位订单序号" width="95" align="center" />
            <el-table-column prop="contractNo" label="合同编号" width="140" show-overflow-tooltip />
          </el-table-column>

          <!-- ====== 产品 ====== -->
          <el-table-column label="产品" align="center">
            <el-table-column prop="seq" label="序号" width="55" align="center" />
            <el-table-column prop="productName" label="产品名称" width="170" show-overflow-tooltip />
          </el-table-column>

          <!-- ====== 产品规格 → 外袋 ====== -->
          <el-table-column label="产品规格" align="center">
            <el-table-column label="外袋" align="center">
              <el-table-column prop="outerBagSize" label="宽度*长度（cm）" width="115" />
              <el-table-column prop="outerBagWeight" label="重量（g/套）" width="95" align="right" />
              <el-table-column prop="warpTensile" label="经向拉力（牛）" width="105" />
              <el-table-column prop="weftTensile" label="纬向拉力（牛）" width="105" />
              <el-table-column prop="density" label="经纬密度（经：纬）" width="125" />
              <el-table-column prop="outerBagColor" label="颜色" width="70" align="center" />
            </el-table-column>

            <!-- ====== 使用布筒规格 ====== -->
            <el-table-column label="使用布筒规格" align="center">
              <el-table-column prop="tubeWidth" label="宽度（cm）" width="85" align="right" />
              <el-table-column prop="tubeGsm" label="平方克重（g/㎡）" width="120" />
              <el-table-column prop="tubeColor" label="颜色" width="70" align="center" />
            </el-table-column>

            <!-- ====== 内袋 ====== -->
            <el-table-column label="内袋" align="center">
              <el-table-column prop="innerBagSize" label="宽度*长度（cm）" width="115" />
              <el-table-column prop="innerBagWeight" label="重量（g/套）" width="95" align="right" />
              <el-table-column prop="filmType" label="高低压膜（高/低）" width="130" />
              <el-table-column prop="materialReq" label="材质要求" width="100" />
              <el-table-column prop="innerBagColor" label="颜色" width="70" align="center" />
            </el-table-column>

            <!-- ====== 整套重量（g/套） ====== -->
            <el-table-column prop="totalWeight" label="整套重量（g/套）" width="120" align="right" />

            <!-- ====== 袋口 ====== -->
            <el-table-column label="袋口" align="center">
              <el-table-column prop="openingGeneral" label="一般" width="55" align="center">
                <template #default="{ row }"><span class="cell-check">{{ row.openingGeneral ? '☑' : '☐' }}</span></template>
              </el-table-column>
              <el-table-column prop="openingFlip" label="翻口" width="55" align="center">
                <template #default="{ row }"><span class="cell-check">{{ row.openingFlip ? '☑' : '☐' }}</span></template>
              </el-table-column>
              <el-table-column prop="openingRing" label="圈口" width="55" align="center">
                <template #default="{ row }"><span class="cell-check">{{ row.openingRing ? '☑' : '☐' }}</span></template>
              </el-table-column>
              <el-table-column prop="openingValve" label="阀口" width="55" align="center">
                <template #default="{ row }"><span class="cell-check">{{ row.openingValve ? '☑' : '☐' }}</span></template>
              </el-table-column>
            </el-table-column>

            <!-- ====== 袋边 ====== -->
            <el-table-column label="袋边" align="center">
              <el-table-column prop="edgeFold" label="折边" width="55" align="center">
                <template #default="{ row }"><span class="cell-check">{{ row.edgeFold ? '☑' : '☐' }}</span></template>
              </el-table-column>
              <el-table-column prop="edgeShift" label="移边" width="55" align="center">
                <template #default="{ row }"><span class="cell-check">{{ row.edgeShift ? '☑' : '☐' }}</span></template>
              </el-table-column>
            </el-table-column>

            <!-- ====== 袋底 ====== -->
            <el-table-column label="袋底" align="center">
              <el-table-column prop="bottomConnected" label="连膜车底" width="80" align="center">
                <template #default="{ row }"><span class="cell-check">{{ row.bottomConnected ? '☑' : '☐' }}</span></template>
              </el-table-column>
              <el-table-column prop="bottomSeparate" label="非连膜车底" width="90" align="center">
                <template #default="{ row }"><span class="cell-check">{{ row.bottomSeparate ? '☑' : '☐' }}</span></template>
              </el-table-column>
              <el-table-column prop="bottomSingle" label="单折" width="55" align="center">
                <template #default="{ row }"><span class="cell-check">{{ row.bottomSingle ? '☑' : '☐' }}</span></template>
              </el-table-column>
              <el-table-column prop="bottomDouble" label="双折" width="55" align="center">
                <template #default="{ row }"><span class="cell-check">{{ row.bottomDouble ? '☑' : '☐' }}</span></template>
              </el-table-column>
            </el-table-column>

            <!-- ====== 印刷 ====== -->
            <el-table-column label="印刷" align="center">
              <el-table-column prop="printSingle" label="单面" width="55" align="center">
                <template #default="{ row }"><span class="cell-check">{{ row.printSingle ? '☑' : '☐' }}</span></template>
              </el-table-column>
              <el-table-column prop="printDouble" label="双面" width="55" align="center">
                <template #default="{ row }"><span class="cell-check">{{ row.printDouble ? '☑' : '☐' }}</span></template>
              </el-table-column>
            </el-table-column>

            <!-- ====== 涂膜 ====== -->
            <el-table-column label="涂膜" align="center">
              <el-table-column prop="filmSingleSide" label="单面" width="55" align="center">
                <template #default="{ row }"><span class="cell-check">{{ row.filmSingleSide ? '☑' : '☐' }}</span></template>
              </el-table-column>
              <el-table-column prop="filmDoubleSide" label="双面" width="55" align="center">
                <template #default="{ row }"><span class="cell-check">{{ row.filmDoubleSide ? '☑' : '☐' }}</span></template>
              </el-table-column>
            </el-table-column>

            <!-- ====== 彩印 ====== -->
            <el-table-column label="彩印" align="center">
              <el-table-column prop="colorSingle" label="单面" width="55" align="center">
                <template #default="{ row }"><span class="cell-check">{{ row.colorSingle ? '☑' : '☐' }}</span></template>
              </el-table-column>
              <el-table-column prop="colorDouble" label="双面" width="55" align="center">
                <template #default="{ row }"><span class="cell-check">{{ row.colorDouble ? '☑' : '☐' }}</span></template>
              </el-table-column>
            </el-table-column>
          </el-table-column>

          <!-- ====== 订单数量（套） ====== -->
          <el-table-column prop="orderQty" label="订单数量（套）" width="110" align="right" />

          <!-- ====== 单价（元/套） ====== -->
          <el-table-column prop="unitPrice" label="单价（元/套）" width="105" align="right" />

          <!-- ====== 是否开具发票（是/否） ====== -->
          <el-table-column prop="invoiceFlag" label="是否开具发票（是/否）" width="145" align="center" />

          <!-- ====== 合同要求交货期限和地点 ====== -->
          <el-table-column label="合同要求交货期限和地点" align="center">
            <el-table-column prop="deliveryDate" label="日期" width="110" align="center" />
            <el-table-column prop="deliveryRemark" label="备注" width="120" show-overflow-tooltip />
            <el-table-column prop="deliveryLocation" label="交货地点" width="100" />
          </el-table-column>

          <!-- ====== 生产计划 ====== -->
          <el-table-column label="生产计划" align="center">
            <el-table-column prop="tubeFinishTime" label="布卷完成时间" width="120" align="center" />
            <el-table-column prop="productFinishTime" label="产品（一体机）完成时间" width="155" align="center" />
          </el-table-column>

          <!-- ====== 发货明细 → 发货情况 ====== -->
          <el-table-column label="发货明细" align="center">
            <el-table-column label="发货情况" align="center">
              <el-table-column prop="shipBatch" label="发货批次" width="80" align="center" />
              <el-table-column prop="shipDate" label="日期" width="110" align="center" />
              <el-table-column prop="shipPieces" label="件数（件）" width="85" align="right" />
              <el-table-column prop="shipSets" label="套数（套）" width="85" align="right" />
              <el-table-column prop="shipRemark" label="备注" width="160" show-overflow-tooltip />
              <el-table-column prop="shipCompany" label="运输公司" width="110" />
              <el-table-column prop="shipFreight" label="运费" width="75" align="right" />
            </el-table-column>
          </el-table-column>

          <!-- ====== 累计发货（套） ====== -->
          <el-table-column label="累计发货（套）" align="center">
            <el-table-column prop="totalShipPieces" label="件数（件）" width="85" align="right" />
            <el-table-column prop="totalShipSets" label="总数量（套）" width="100" align="right" />
          </el-table-column>

          <!-- ====== 订单完成进度 ====== -->
          <el-table-column prop="completionRate" label="订单完成进度" width="110" align="center" />

          <!-- ====== 剩余库存（套） ====== -->
          <el-table-column prop="remainingStock" label="剩余库存（套）" width="110" align="right" />
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
import { SoldOut, Document, List, Box, TrendCharts, FullScreen, Close } from '@element-plus/icons-vue'

// ====== 全屏切换 ======
const isFullscreen = ref(false)
const fullscreenIcon = computed(() => (isFullscreen.value ? Close : FullScreen))
function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
  const el = document.querySelector('.order-report-c') as HTMLElement
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

// ====== 搜索表单 ======
const searchForm = ref({
  groupName: '',
  contractNo: '',
  dateRange: null as [string, string] | null,
})
const page = ref(1)
const pageSize = ref(15)

function handleSearch() {
  page.value = 1
}
function handleReset() {
  searchForm.value = { groupName: '', contractNo: '', dateRange: null }
  page.value = 1
}

// ====== 数据接口 ======
interface OrderRowC {
  groupName: string
  unitName: string
  orderDate: string
  orderSeq: number | string
  contractNo: string
  seq: number | string
  productName: string
  // 外袋
  outerBagSize: string
  outerBagWeight: number | string
  warpTensile: string
  weftTensile: string
  density: string
  outerBagColor: string
  // 使用布筒规格
  tubeWidth: number | string
  tubeGsm: string
  tubeColor: string
  // 内袋
  innerBagSize: string
  innerBagWeight: number | string
  filmType: string
  materialReq: string
  innerBagColor: string
  // 整套重量
  totalWeight: number | string
  // 袋口
  openingGeneral: boolean
  openingFlip: boolean
  openingRing: boolean
  openingValve: boolean
  // 袋边
  edgeFold: boolean
  edgeShift: boolean
  // 袋底
  bottomConnected: boolean
  bottomSeparate: boolean
  bottomSingle: boolean
  bottomDouble: boolean
  // 印刷
  printSingle: boolean
  printDouble: boolean
  // 涂膜
  filmSingleSide: boolean
  filmDoubleSide: boolean
  // 彩印
  colorSingle: boolean
  colorDouble: boolean
  // 订单信息
  orderQty: number
  unitPrice: number | string
  invoiceFlag: string
  // 合同要求交货期限和地点
  deliveryDate: string
  deliveryRemark: string
  deliveryLocation: string
  // 生产计划
  tubeFinishTime: string
  productFinishTime: string
  // 发货情况
  shipBatch: number | string
  shipDate: string
  shipPieces: number | string
  shipSets: number | string
  shipRemark: string
  shipCompany: string
  shipFreight: number | string
  // 累计发货（套）
  totalShipPieces: number | string
  totalShipSets: number | string
  // 订单完成进度 / 剩余库存
  completionRate: string
  remainingStock: string
}

// ====== Mock 数据（基于Excel真实数据） ======
const mockData: OrderRowC[] = [
  {
    // Row4: 腾五金, Order1, Product1
    groupName: '腾五金', unitName: '',
    orderDate: '2026-05-04',
    orderSeq: 1, contractNo: '',
    seq: 1, productName: '56*80布筒杂色开边',
    outerBagSize: '', outerBagWeight: '', warpTensile: '≥565', weftTensile: '≥535', density: '', outerBagColor: '',
    tubeWidth: 56, tubeGsm: '80', tubeColor: '杂色',
    innerBagSize: '', innerBagWeight: '', filmType: '', materialReq: '', innerBagColor: '',
    totalWeight: 0,
    openingGeneral: false, openingFlip: false, openingRing: false, openingValve: false,
    edgeFold: false, edgeShift: false,
    bottomConnected: false, bottomSeparate: false, bottomSingle: false, bottomDouble: false,
    printSingle: false, printDouble: false,
    filmSingleSide: false, filmDoubleSide: false,
    colorSingle: false, colorDouble: false,
    orderQty: 764, unitPrice: 7.8, invoiceFlag: '否',
    deliveryDate: '2026-05-05', deliveryRemark: '', deliveryLocation: '',
    tubeFinishTime: '', productFinishTime: '',
    shipBatch: 1, shipDate: '2026-05-05', shipPieces: 3, shipSets: 764,
    shipRemark: '291.5KG+204.5KG+268KG', shipCompany: '桂AAP3866', shipFreight: '',
    totalShipPieces: '', totalShipSets: '',
    completionRate: '1', remainingStock: '',
  },
  {
    // Row5: 腾五金, Order1, Product2
    groupName: '腾五金', unitName: '',
    orderDate: '',
    orderSeq: 1, contractNo: '',
    seq: 2, productName: '66*80杂色开边',
    outerBagSize: '66*170', outerBagWeight: 80, warpTensile: '≥665', weftTensile: '≥635', density: '', outerBagColor: '',
    tubeWidth: '', tubeGsm: '', tubeColor: '',
    innerBagSize: '', innerBagWeight: '', filmType: '', materialReq: '', innerBagColor: '',
    totalWeight: 80,
    openingGeneral: false, openingFlip: false, openingRing: false, openingValve: false,
    edgeFold: false, edgeShift: false,
    bottomConnected: false, bottomSeparate: false, bottomSingle: false, bottomDouble: false,
    printSingle: false, printDouble: false,
    filmSingleSide: false, filmDoubleSide: false,
    colorSingle: false, colorDouble: false,
    orderQty: 833.5, unitPrice: 8, invoiceFlag: '否',
    deliveryDate: '2026-05-05', deliveryRemark: '', deliveryLocation: '',
    tubeFinishTime: '', productFinishTime: '',
    shipBatch: 1, shipDate: '2026-05-05', shipPieces: 20, shipSets: 833.5,
    shipRemark: '16件*200条+3件*300条+1件*306条', shipCompany: '桂AAP3866', shipFreight: '',
    totalShipPieces: '', totalShipSets: '',
    completionRate: '1', remainingStock: '10件',
  },
  {
    // Row6: 腾五金, Order2, Product1
    groupName: '腾五金', unitName: '',
    orderDate: '2026-05-07',
    orderSeq: 2, contractNo: '',
    seq: 1, productName: '66*80杂色开边',
    outerBagSize: '66*170', outerBagWeight: 80, warpTensile: '≥665', weftTensile: '≥635', density: '', outerBagColor: '',
    tubeWidth: '', tubeGsm: '', tubeColor: '',
    innerBagSize: '', innerBagWeight: '', filmType: '', materialReq: '', innerBagColor: '',
    totalWeight: 80,
    openingGeneral: false, openingFlip: false, openingRing: false, openingValve: false,
    edgeFold: false, edgeShift: false,
    bottomConnected: false, bottomSeparate: false, bottomSingle: false, bottomDouble: false,
    printSingle: false, printDouble: false,
    filmSingleSide: false, filmDoubleSide: false,
    colorSingle: false, colorDouble: false,
    orderQty: 5000, unitPrice: 8, invoiceFlag: '否',
    deliveryDate: '', deliveryRemark: '备货', deliveryLocation: '',
    tubeFinishTime: '', productFinishTime: '',
    shipBatch: '', shipDate: '', shipPieces: '', shipSets: '',
    shipRemark: '', shipCompany: '', shipFreight: '',
    totalShipPieces: '', totalShipSets: '',
    completionRate: '', remainingStock: '',
  },
  {
    // Row7: 勋哥, Order1, Product1
    groupName: '勋哥', unitName: '',
    orderDate: '2026-05-04',
    orderSeq: 1, contractNo: '',
    seq: 1, productName: '凯之隆 阀口袋',
    outerBagSize: '50*80', outerBagWeight: 60, warpTensile: '≥565', weftTensile: '≥535', density: '', outerBagColor: '',
    tubeWidth: 51, tubeGsm: '58', tubeColor: '白',
    innerBagSize: '', innerBagWeight: '', filmType: '', materialReq: '', innerBagColor: '',
    totalWeight: 60,
    openingGeneral: false, openingFlip: false, openingRing: false, openingValve: false,
    edgeFold: false, edgeShift: false,
    bottomConnected: false, bottomSeparate: false, bottomSingle: false, bottomDouble: false,
    printSingle: false, printDouble: false,
    filmSingleSide: false, filmDoubleSide: false,
    colorSingle: false, colorDouble: false,
    orderQty: 10000, unitPrice: '', invoiceFlag: '否',
    deliveryDate: '2026-05-09', deliveryRemark: '', deliveryLocation: '',
    tubeFinishTime: '', productFinishTime: '',
    shipBatch: '', shipDate: '', shipPieces: '', shipSets: '',
    shipRemark: '', shipCompany: '', shipFreight: '',
    totalShipPieces: '', totalShipSets: '',
    completionRate: '0', remainingStock: '',
  },
  {
    // Row8: 勋哥, same order, 改版版费
    groupName: '勋哥', unitName: '',
    orderDate: '',
    orderSeq: 1, contractNo: '',
    seq: '', productName: '改版版费',
    outerBagSize: '', outerBagWeight: '', warpTensile: '', weftTensile: '', density: '', outerBagColor: '',
    tubeWidth: '', tubeGsm: '', tubeColor: '',
    innerBagSize: '', innerBagWeight: '', filmType: '', materialReq: '', innerBagColor: '',
    totalWeight: 0,
    openingGeneral: false, openingFlip: false, openingRing: false, openingValve: false,
    edgeFold: false, edgeShift: false,
    bottomConnected: false, bottomSeparate: false, bottomSingle: false, bottomDouble: false,
    printSingle: false, printDouble: false,
    filmSingleSide: false, filmDoubleSide: false,
    colorSingle: false, colorDouble: false,
    orderQty: 1, unitPrice: '', invoiceFlag: '否',
    deliveryDate: '2026-05-09', deliveryRemark: '', deliveryLocation: '',
    tubeFinishTime: '', productFinishTime: '',
    shipBatch: 1, shipDate: '', shipPieces: 1, shipSets: 1,
    shipRemark: '改版版费', shipCompany: '', shipFreight: '',
    totalShipPieces: '', totalShipSets: '',
    completionRate: '1', remainingStock: '',
  },
  {
    // Row9: 王艳妮
    groupName: '王艳妮', unitName: '',
    orderDate: '2026-05-04',
    orderSeq: 1, contractNo: '',
    seq: 1, productName: '空白袋',
    outerBagSize: '46*70', outerBagWeight: 39, warpTensile: '≥565', weftTensile: '≥535', density: '', outerBagColor: '',
    tubeWidth: 46, tubeGsm: '58', tubeColor: '白',
    innerBagSize: '49*84', innerBagWeight: 17, filmType: '低', materialReq: '低压新料', innerBagColor: '',
    totalWeight: 56,
    openingGeneral: false, openingFlip: false, openingRing: false, openingValve: false,
    edgeFold: false, edgeShift: false,
    bottomConnected: false, bottomSeparate: false, bottomSingle: false, bottomDouble: false,
    printSingle: false, printDouble: false,
    filmSingleSide: false, filmDoubleSide: false,
    colorSingle: false, colorDouble: false,
    orderQty: 5000, unitPrice: 0.77, invoiceFlag: '否',
    deliveryDate: '', deliveryRemark: '', deliveryLocation: '',
    tubeFinishTime: '', productFinishTime: '',
    shipBatch: '', shipDate: '', shipPieces: '', shipSets: '',
    shipRemark: '', shipCompany: '', shipFreight: '',
    totalShipPieces: '', totalShipSets: '',
    completionRate: '0', remainingStock: '',
  },
  {
    // Row10: 大富豪
    groupName: '大富豪', unitName: '',
    orderDate: '2026-05-07',
    orderSeq: 1, contractNo: '',
    seq: 1, productName: '地民高强度聚乙烯吹塑薄膜',
    outerBagSize: '', outerBagWeight: '', warpTensile: '≥565', weftTensile: '≥535', density: '', outerBagColor: '',
    tubeWidth: 35, tubeGsm: '59', tubeColor: '透明',
    innerBagSize: '', innerBagWeight: '', filmType: '', materialReq: '', innerBagColor: '',
    totalWeight: 0,
    openingGeneral: false, openingFlip: false, openingRing: false, openingValve: false,
    edgeFold: false, edgeShift: false,
    bottomConnected: false, bottomSeparate: false, bottomSingle: false, bottomDouble: false,
    printSingle: false, printDouble: false,
    filmSingleSide: false, filmDoubleSide: false,
    colorSingle: false, colorDouble: false,
    orderQty: 0, unitPrice: 15.95, invoiceFlag: '否',
    deliveryDate: '', deliveryRemark: '', deliveryLocation: '',
    tubeFinishTime: '', productFinishTime: '',
    shipBatch: '', shipDate: '', shipPieces: '', shipSets: '',
    shipRemark: '', shipCompany: '', shipFreight: '',
    totalShipPieces: '', totalShipSets: '',
    completionRate: '', remainingStock: '',
  },
  {
    // Row11: 张蕴
    groupName: '张蕴', unitName: '',
    orderDate: '2026-05-08',
    orderSeq: 1, contractNo: '',
    seq: 1, productName: '空白袋',
    outerBagSize: '46*70', outerBagWeight: 44, warpTensile: '≥565', weftTensile: '≥535', density: '', outerBagColor: '',
    tubeWidth: 46, tubeGsm: '65D', tubeColor: '白',
    innerBagSize: '49*78', innerBagWeight: 25, filmType: '低', materialReq: '低压新料', innerBagColor: '',
    totalWeight: 69,
    openingGeneral: false, openingFlip: false, openingRing: false, openingValve: false,
    edgeFold: false, edgeShift: false,
    bottomConnected: false, bottomSeparate: false, bottomSingle: false, bottomDouble: false,
    printSingle: false, printDouble: false,
    filmSingleSide: false, filmDoubleSide: false,
    colorSingle: false, colorDouble: false,
    orderQty: 20000, unitPrice: 0.75, invoiceFlag: '否',
    deliveryDate: '2026-05-15', deliveryRemark: '', deliveryLocation: '',
    tubeFinishTime: '', productFinishTime: '',
    shipBatch: '', shipDate: '', shipPieces: '', shipSets: '',
    shipRemark: '', shipCompany: '', shipFreight: '',
    totalShipPieces: '', totalShipSets: '',
    completionRate: '0', remainingStock: '',
  },
  // 补充更多有数据的客户行
  {
    groupName: '广西添美农业', unitName: '武鸣添美',
    orderDate: '2026-05-04',
    orderSeq: 1, contractNo: 'YHSY-20260504001',
    seq: 1, productName: '粒比粒0.5% SDSCA 50kg',
    outerBagSize: '60*98', outerBagWeight: 163, warpTensile: '≥665', weftTensile: '≥635', density: '', outerBagColor: '白色',
    tubeWidth: 60, tubeGsm: '80', tubeColor: '半透',
    innerBagSize: '63*115', innerBagWeight: 34, filmType: '低', materialReq: '全新料', innerBagColor: '白',
    totalWeight: 197,
    openingGeneral: false, openingFlip: false, openingRing: false, openingValve: false,
    edgeFold: false, edgeShift: false,
    bottomConnected: false, bottomSeparate: false, bottomSingle: false, bottomDouble: true,
    printSingle: false, printDouble: false,
    filmSingleSide: false, filmDoubleSide: true,
    colorSingle: false, colorDouble: true,
    orderQty: 6000, unitPrice: 3.35, invoiceFlag: '否',
    deliveryDate: '2026-05-14', deliveryRemark: '', deliveryLocation: '',
    tubeFinishTime: '', productFinishTime: '',
    shipBatch: '', shipDate: '', shipPieces: '', shipSets: '',
    shipRemark: '', shipCompany: '', shipFreight: '',
    totalShipPieces: '', totalShipSets: '',
    completionRate: '0', remainingStock: '',
  },
  {
    groupName: '广西添美农业', unitName: '武鸣添美',
    orderDate: '2026-05-04',
    orderSeq: 1, contractNo: 'YHSY-20260504001',
    seq: 2, productName: '添美LCSCA 50kg 35% 15-5-15',
    outerBagSize: '60*98', outerBagWeight: 129, warpTensile: '≥665', weftTensile: '≥635', density: '', outerBagColor: '白色',
    tubeWidth: 60, tubeGsm: '80', tubeColor: '半透',
    innerBagSize: '63*115', innerBagWeight: 34, filmType: '低', materialReq: '全新料', innerBagColor: '白',
    totalWeight: 163,
    openingGeneral: false, openingFlip: false, openingRing: false, openingValve: false,
    edgeFold: false, edgeShift: false,
    bottomConnected: false, bottomSeparate: false, bottomSingle: false, bottomDouble: true,
    printSingle: false, printDouble: false,
    filmSingleSide: false, filmDoubleSide: true,
    colorSingle: false, colorDouble: true,
    orderQty: 3000, unitPrice: 2.84, invoiceFlag: '否',
    deliveryDate: '2026-05-10', deliveryRemark: '', deliveryLocation: '',
    tubeFinishTime: '', productFinishTime: '',
    shipBatch: '', shipDate: '', shipPieces: '', shipSets: '',
    shipRemark: '', shipCompany: '', shipFreight: '',
    totalShipPieces: '', totalShipSets: '',
    completionRate: '0', remainingStock: '',
  },
  {
    groupName: '广西添美农业', unitName: '丁当凯侨',
    orderDate: '2026-05-06',
    orderSeq: 1, contractNo: 'YHSY-20260506001',
    seq: 1, productName: '糖袋内膜60*117*38',
    outerBagSize: '', outerBagWeight: '', warpTensile: '', weftTensile: '', density: '', outerBagColor: '',
    tubeWidth: '', tubeGsm: '', tubeColor: '',
    innerBagSize: '60*117', innerBagWeight: 38, filmType: '低', materialReq: '', innerBagColor: '',
    totalWeight: 38,
    openingGeneral: false, openingFlip: false, openingRing: false, openingValve: false,
    edgeFold: false, edgeShift: false,
    bottomConnected: false, bottomSeparate: false, bottomSingle: false, bottomDouble: false,
    printSingle: false, printDouble: false,
    filmSingleSide: false, filmDoubleSide: false,
    colorSingle: false, colorDouble: false,
    orderQty: 4737, unitPrice: 10, invoiceFlag: '否',
    deliveryDate: '2026-05-06', deliveryRemark: '', deliveryLocation: '',
    tubeFinishTime: '', productFinishTime: '',
    shipBatch: '', shipDate: '', shipPieces: '', shipSets: '',
    shipRemark: '', shipCompany: '', shipFreight: '',
    totalShipPieces: '', totalShipSets: '',
    completionRate: '0', remainingStock: '',
  },
  {
    groupName: '广西添美农业', unitName: '丁当凯侨',
    orderDate: '2026-05-06',
    orderSeq: 2, contractNo: 'YHSY-20260506001',
    seq: 2, productName: '低压内膜49*94*17',
    outerBagSize: '', outerBagWeight: '', warpTensile: '', weftTensile: '', density: '', outerBagColor: '',
    tubeWidth: '', tubeGsm: '', tubeColor: '',
    innerBagSize: '49*94', innerBagWeight: 17, filmType: '低', materialReq: '', innerBagColor: '',
    totalWeight: 17,
    openingGeneral: false, openingFlip: false, openingRing: false, openingValve: false,
    edgeFold: false, edgeShift: false,
    bottomConnected: false, bottomSeparate: false, bottomSingle: false, bottomDouble: false,
    printSingle: false, printDouble: false,
    filmSingleSide: false, filmDoubleSide: false,
    colorSingle: false, colorDouble: false,
    orderQty: 2000, unitPrice: 0, invoiceFlag: '否',
    deliveryDate: '2026-05-10', deliveryRemark: '', deliveryLocation: '',
    tubeFinishTime: '', productFinishTime: '',
    shipBatch: '', shipDate: '', shipPieces: '', shipSets: '',
    shipRemark: '', shipCompany: '', shipFreight: '',
    totalShipPieces: '', totalShipSets: '',
    completionRate: '0', remainingStock: '',
  },
  {
    groupName: '小马快跑', unitName: '',
    orderDate: '2026-05-02',
    orderSeq: 1, contractNo: 'YHSY-20260502001',
    seq: 1, productName: '空白袋',
    outerBagSize: '50*90', outerBagWeight: 90, warpTensile: '≥565', weftTensile: '≥535', density: '', outerBagColor: '白色',
    tubeWidth: 50, tubeGsm: '70B', tubeColor: '半透',
    innerBagSize: '53*100', innerBagWeight: 30, filmType: '高', materialReq: '全新料', innerBagColor: '白',
    totalWeight: 120,
    openingGeneral: false, openingFlip: false, openingRing: true, openingValve: false,
    edgeFold: false, edgeShift: false,
    bottomConnected: false, bottomSeparate: false, bottomSingle: false, bottomDouble: true,
    printSingle: false, printDouble: false,
    filmSingleSide: false, filmDoubleSide: true,
    colorSingle: false, colorDouble: false,
    orderQty: 5000, unitPrice: 1.5, invoiceFlag: '否',
    deliveryDate: '2026-05-10', deliveryRemark: '', deliveryLocation: '',
    tubeFinishTime: '', productFinishTime: '',
    shipBatch: '', shipDate: '', shipPieces: '', shipSets: '',
    shipRemark: '', shipCompany: '', shipFreight: '',
    totalShipPieces: '', totalShipSets: '',
    completionRate: '0', remainingStock: '',
  },
  {
    groupName: '小马快跑', unitName: '',
    orderDate: '2026-05-05',
    orderSeq: 2, contractNo: 'YHSY-20260505001',
    seq: 1, productName: '高强袋',
    outerBagSize: '55*95', outerBagWeight: 105, warpTensile: '≥665', weftTensile: '≥635', density: '', outerBagColor: '白色',
    tubeWidth: 55, tubeGsm: '80', tubeColor: '半透',
    innerBagSize: '58*105', innerBagWeight: 35, filmType: '低', materialReq: '全新料', innerBagColor: '白',
    totalWeight: 140,
    openingGeneral: false, openingFlip: false, openingRing: false, openingValve: true,
    edgeFold: false, edgeShift: false,
    bottomConnected: false, bottomSeparate: false, bottomSingle: false, bottomDouble: true,
    printSingle: false, printDouble: true,
    filmSingleSide: false, filmDoubleSide: true,
    colorSingle: false, colorDouble: true,
    orderQty: 8000, unitPrice: 2.2, invoiceFlag: '是',
    deliveryDate: '2026-05-18', deliveryRemark: '', deliveryLocation: '南宁',
    tubeFinishTime: '2026-05-12', productFinishTime: '2026-05-16',
    shipBatch: 1, shipDate: '2026-05-18', shipPieces: 10, shipSets: 8000,
    shipRemark: '', shipCompany: '桂A12345', shipFreight: 500,
    totalShipPieces: 10, totalShipSets: 8000,
    completionRate: '1', remainingStock: '',
  },
]

// ====== 搜索过滤 ======
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

// ====== 分页 ======
const paginatedData = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredData.value.slice(start, start + pageSize.value)
})

// ====== 汇总统计 ======
const summaryData = computed(() => {
  const list = filteredData.value
  const orderQty = list.reduce((s, r) => s + (r.orderQty || 0), 0)
  const shipSets = list.reduce((s, r) => s + (Number(r.totalShipSets) || 0), 0)
  const remaining = list.reduce((s, r) => {
    const v = String(r.remainingStock).replace(/[^\d.]/g, '')
    return s + (parseFloat(v) || 0)
  }, 0)
  return {
    totalRecords: list.length,
    totalOrderQty: orderQty.toLocaleString('zh-CN'),
    totalShipSets: shipSets.toLocaleString('zh-CN'),
    totalRemaining: remaining.toLocaleString('zh-CN'),
  }
})
</script>

<style lang="scss" scoped>
.order-report-c {
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
  &.order-icon {
    background: linear-gradient(135deg, #36d1dc, #5b86e5);
  }
  &.ship-icon {
    background: linear-gradient(135deg, #e6a23c, #f4d19e);
  }
  &.stock-icon {
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
.table-card {
  border-radius: 12px;
  border: none;
  overflow: visible;
  :deep(.el-table__row:hover) {
    background-color: #ecf5ff !important;
  }
  :deep(.el-table__header-wrapper th) {
    background: #f5f7fa;
  }
  :deep(.multi-header-row th) {
    .cell {
      white-space: pre-line;
      line-height: 1.3;
      text-align: center;
    }
  }
}
.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
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
.cell-check {
  font-size: 14px;
  color: #606266;
}
/* ====== 水平滚动容器 ====== */
.table-scroll-wrapper {
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  display: block;

  :deep(.el-table) {
    width: max-content !important;
    min-width: 100% !important;
  }

  &::-webkit-scrollbar {
    height: 10px;
  }
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 5px;
  }
  &::-webkit-scrollbar-thumb {
    background: #c0c4cc;
    border-radius: 5px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #909399;
  }
}
</style>
