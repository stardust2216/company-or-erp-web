<template>
  <div class="longzhou-order-report">
    <!-- 页头 -->
    <div v-if="!isFullscreen" class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon :size="28"><Document /></el-icon>
        </div>
        <div class="header-text">
          <h1 class="header-title">龙州塑业 - 订单管理报表</h1>
          <p class="header-subtitle">26-27榨季 订单合同跟踪与发货明细统计表</p>
        </div>
      </div>
    </div>

    <!-- 搜索区 -->
    <el-card v-if="!isFullscreen" shadow="never" class="search-card">
      <el-form :model="searchForm" inline label-width="auto">
        <el-form-item label="客户名称">
          <el-input v-model="searchForm.customerName" placeholder="请输入客户名称" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="集团名称">
          <el-input v-model="searchForm.groupName" placeholder="请输入集团名称" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="合同编号">
          <el-input v-model="searchForm.contractNo" placeholder="请输入合同编号" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="日期区间">
          <el-date-picker v-model="searchForm.dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" style="width: 260px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 统计卡片 -->
    <el-row v-if="!isFullscreen" :gutter="16" class="summary-cards">
      <el-col :span="6">
        <el-card shadow="hover" class="summary-card">
          <div class="card-icon records-icon"><el-icon :size="22"><Document /></el-icon></div>
          <div class="card-body">
            <div class="card-label">总记录数</div>
            <div class="card-value">{{ summaryData.totalRecords }}</div>
            <div class="card-sub">合同总条数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="summary-card">
          <div class="card-icon order-icon"><el-icon :size="22"><ShoppingCart /></el-icon></div>
          <div class="card-body">
            <div class="card-label">订单数量合计（套）</div>
            <div class="card-value">{{ summaryData.totalQuantity }}</div>
            <div class="card-sub">全部订单套数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="summary-card">
          <div class="card-icon shipped-icon"><el-icon :size="22"><Van /></el-icon></div>
          <div class="card-body">
            <div class="card-label">已发货合计（套）</div>
            <div class="card-value highlight">{{ summaryData.totalShipped }}</div>
            <div class="card-sub">累计发货套数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="summary-card">
          <div class="card-icon stock-icon"><el-icon :size="22"><Box /></el-icon></div>
          <div class="card-body">
            <div class="card-label">剩余库存（套）</div>
            <div class="card-value bold">{{ summaryData.totalStock }}</div>
            <div class="card-sub">未发货+库存</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 报表表格 -->
    <el-card shadow="never" class="table-card" :class="{ 'is-fullscreen': isFullscreen }" :body-style="{ padding: detailViewVisible ? '0' : '20px' }">
      <template #header>
        <div class="card-header">
          <span class="header-title-text">龙州塑业订单管理明细表</span>
          <el-button type="primary" :icon="FullScreen" size="small" @click="toggleFullscreen">
            {{ isFullscreen ? '退出全屏' : '全屏展示' }}
          </el-button>
        </div>
      </template>

      <el-table :data="pageData" border stripe style="width: 100%" :max-height="isFullscreen ? 'calc(100vh - 140px)' : '800'" :header-cell-style="headerCellStyle" size="small" highlight-current-row @row-click="openDetail">
        <!-- 基础信息 -->
        <el-table-column type="index" label="序号" width="55" align="center" fixed="left" />
        <el-table-column prop="customerName" label="客户名称" min-width="130" show-overflow-tooltip fixed="left" />
        <el-table-column prop="groupName" label="集团名称" min-width="130" show-overflow-tooltip />
        <el-table-column prop="useUnit" label="使用单位" min-width="130" show-overflow-tooltip />
        <el-table-column prop="signDate" label="签订日期" width="110" align="center" />
        <el-table-column prop="unitOrderNo" label="使用单位订单序号" width="120" align="center" />
        <el-table-column prop="contractNo" label="合同编号" min-width="150" show-overflow-tooltip />
        <el-table-column prop="productSeq" label="产品序号" width="55" align="center" />
        <el-table-column prop="brandName" label="品牌名称" min-width="120" show-overflow-tooltip />
        <el-table-column prop="productName" label="产品名称" min-width="120" show-overflow-tooltip />

        <!-- 外袋规格 -->
        <el-table-column label="外袋规格" align="center">
          <el-table-column prop="outerBagWidthLength" label="宽度*有效长度(cm)" width="115" align="center" />
          <el-table-column prop="outerBagWeight" label="重量(g/套)" width="95" align="right" />
          <el-table-column prop="outerBagWarpTension" label="经向拉力(N)" width="100" align="right" />
          <el-table-column prop="outerBagWeftTension" label="纬向拉力(N)" width="100" align="right" />
          <el-table-column prop="outerBagDensity" label="经纬密度" width="100" align="center" />
          <el-table-column prop="outerBagColor" label="颜色" width="70" align="center" />
        </el-table-column>

        <!-- 使用布筒规格 -->
        <el-table-column label="使用布筒规格" align="center">
          <el-table-column prop="clothWidthGWeight" label="宽度*平方克重(cm*g/㎡)" width="115" align="center" />
          <el-table-column prop="clothWidthLength" label="宽度*长度(cm)" width="115" align="center" />
          <el-table-column prop="clothWeight" label="重量(g/套)" width="95" align="right" />
          <el-table-column prop="clothPressure" label="高/低压" width="90" align="center" />
          <el-table-column prop="clothMaterial" label="材质要求" width="90" align="center" />
          <el-table-column prop="clothColor" label="颜色" width="70" align="center" />
        </el-table-column>

        <!-- 内袋 -->
        <el-table-column label="内袋" align="center">
          <el-table-column prop="innerBagWidthLength" label="宽度*长度(cm)" width="115" align="center" />
          <el-table-column prop="innerBagWeight" label="重量(g/套)" width="95" align="right" />
          <el-table-column prop="innerBagFilmType" label="高低压膜" width="90" align="center" />
          <el-table-column prop="innerBagMaterial" label="材质要求" width="90" align="center" />
          <el-table-column prop="innerBagColor" label="颜色" width="70" align="center" />
        </el-table-column>

        <!-- 整套克重 -->
        <el-table-column prop="totalWeight" label="整套克重(g/套)" width="115" align="right" />

        <!-- 袋口 -->
        <el-table-column label="袋口" align="center">
          <el-table-column prop="mouthGeneral" label="一般" width="55" align="center">
            <template #default="{ row }"><el-tag v-if="row.mouthGeneral==='是'" type="info" size="small">是</el-tag><span v-else>-</span></template>
          </el-table-column>
          <el-table-column prop="mouthFlip" label="翻口" width="55" align="center">
            <template #default="{ row }"><el-tag v-if="row.mouthFlip==='是'" type="info" size="small">是</el-tag><span v-else>-</span></template>
          </el-table-column>
          <el-table-column prop="mouthRing" label="圈口" width="55" align="center">
            <template #default="{ row }"><el-tag v-if="row.mouthRing==='是'" type="info" size="small">是</el-tag><span v-else>-</span></template>
          </el-table-column>
        </el-table-column>

        <!-- 袋底 -->
        <el-table-column label="袋底" align="center">
          <el-table-column prop="bottomConnected" label="连膜车底" width="80" align="center">
            <template #default="{ row }"><el-tag v-if="row.bottomConnected==='是'" type="info" size="small">是</el-tag><span v-else>-</span></template>
          </el-table-column>
          <el-table-column prop="bottomNonConnected" label="非连膜车底" width="95" align="center">
            <template #default="{ row }"><el-tag v-if="row.bottomNonConnected==='是'" type="info" size="small">是</el-tag><span v-else>-</span></template>
          </el-table-column>
        </el-table-column>

        <!-- 印刷 -->
        <el-table-column label="印刷" align="center">
          <el-table-column prop="printSingle" label="单面" width="55" align="center">
            <template #default="{ row }"><el-tag v-if="row.printSingle==='是'" type="info" size="small">是</el-tag><span v-else>-</span></template>
          </el-table-column>
          <el-table-column prop="printDouble" label="双面" width="55" align="center">
            <template #default="{ row }"><el-tag v-if="row.printDouble==='是'" type="info" size="small">是</el-tag><span v-else>-</span></template>
          </el-table-column>
        </el-table-column>

        <!-- 订单数量与单价 -->
        <el-table-column prop="orderQuantity" label="订单数量（套）" width="115" align="right" />
        <el-table-column prop="unitPrice" label="单价（元/套）" width="110" align="right" />
        <el-table-column prop="contractAmount" label="合同金额（元）" width="120" align="right" />

        <!-- 交货地点 -->
        <el-table-column prop="deliveryLocation" label="交货地点" min-width="120" show-overflow-tooltip />

        <!-- 出货明细 -->
        <el-table-column label="出货明细" align="center">
          <el-table-column prop="shipBatch" label="使用单位出货序号" width="120" align="center" />
          <el-table-column prop="shipDate" label="出货日期" width="110" align="center" />
          <el-table-column prop="shipPieces" label="件数(件)" width="85" align="right" />
          <el-table-column prop="shipSets" label="数量(套)" width="85" align="right" />
          <el-table-column prop="shipWeight" label="重量(吨)" width="85" align="right" />
        </el-table-column>

        <!-- 承运信息 -->
        <el-table-column prop="carrierCompany" label="承运单位" min-width="120" show-overflow-tooltip />
        <el-table-column prop="carrierPlate" label="承运车号" width="110" align="center" />
        <el-table-column prop="driverName" label="司机姓名" width="100" align="center" />
        <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />

        <!-- 操作列 -->
        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link :icon="View" size="small" @click.stop="openDetail(row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="card-footer">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]" :total="filteredData.length"
          layout="total, sizes, prev, pager, next, jumper" background small />
      </div>
    </el-card>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="订单详情" width="900px" :close-on-click-modal="false" draggable>
      <template v-if="currentRow">
        <el-descriptions :column="3" border size="small" label-width="120px">
          <el-descriptions-item label="客户名称">{{ currentRow.customerName }}</el-descriptions-item>
          <el-descriptions-item label="集团名称">{{ currentRow.groupName }}</el-descriptions-item>
          <el-descriptions-item label="使用单位">{{ currentRow.useUnit }}</el-descriptions-item>
          <el-descriptions-item label="签订日期">{{ currentRow.signDate }}</el-descriptions-item>
          <el-descriptions-item label="合同编号" :span="2">{{ currentRow.contractNo }}</el-descriptions-item>
          <el-descriptions-item label="产品名称">{{ currentRow.productName }}</el-descriptions-item>
          <el-descriptions-item label="产品序号">{{ currentRow.productSeq }}</el-descriptions-item>
          <el-descriptions-item label="品牌名称">{{ currentRow.brandName }}</el-descriptions-item>
        </el-descriptions>

        <el-divider content-position="left">产品规格</el-divider>

        <el-descriptions :column="3" border size="small" label-width="120px">
          <el-descriptions-item label="外袋规格" :span="3">
            宽长：{{ currentRow.outerBagWidthLength }}cm | 重量：{{ currentRow.outerBagWeight }}g/套 | 经向拉力：{{ currentRow.outerBagWarpTension }}N | 纬向拉力：{{ currentRow.outerBagWeftTension }}N | 经纬密度：{{ currentRow.outerBagDensity }} | 颜色：{{ currentRow.outerBagColor }}
          </el-descriptions-item>
          <el-descriptions-item label="布筒规格">
            宽*克重：{{ currentRow.clothWidthGWeight }} | 宽*长：{{ currentRow.clothWidthLength }}cm | 重量：{{ currentRow.clothWeight }}g/套 | {{ currentRow.clothPressure }} | 材质：{{ currentRow.clothMaterial }} | 颜色：{{ currentRow.clothColor }}
          </el-descriptions-item>
          <el-descriptions-item label="内袋规格" :span="2">
            宽长：{{ currentRow.innerBagWidthLength }}cm | 重量：{{ currentRow.innerBagWeight }}g/套 | 高低压膜：{{ currentRow.innerBagFilmType }} | 材质：{{ currentRow.innerBagMaterial }} | 颜色：{{ currentRow.innerBagColor }}
          </el-descriptions-item>
          <el-descriptions-item label="整套克重">{{ currentRow.totalWeight }}g/套</el-descriptions-item>
          <el-descriptions-item label="袋口" :span="2">
            {{ formatBool(currentRow.mouthGeneral, '一般') }} {{ formatBool(currentRow.mouthFlip, '翻口') }} {{ formatBool(currentRow.mouthRing, '圈口') }}
          </el-descriptions-item>
          <el-descriptions-item label="袋底">
            {{ formatBool(currentRow.bottomConnected, '连膜车底') }} {{ formatBool(currentRow.bottomNonConnected, '非连膜车底') }}
          </el-descriptions-item>
          <el-descriptions-item label="印刷">
            {{ formatBool(currentRow.printSingle, '单面') }} {{ formatBool(currentRow.printDouble, '双面') }}
          </el-descriptions-item>
        </el-descriptions>

        <el-divider content-position="left">订单信息</el-divider>

        <el-descriptions :column="3" border size="small" label-width="120px">
          <el-descriptions-item label="订单数量">{{ currentRow.orderQuantity }} 套</el-descriptions-item>
          <el-descriptions-item label="单价">{{ currentRow.unitPrice }} 元/套</el-descriptions-item>
          <el-descriptions-item label="合同金额">{{ currentRow.contractAmount }} 元</el-descriptions-item>
          <el-descriptions-item label="交货地点">{{ currentRow.deliveryLocation }}</el-descriptions-item>
          <el-descriptions-item label="出货日期">{{ currentRow.shipDate }}</el-descriptions-item>
          <el-descriptions-item label="已发货（套）">{{ currentRow.shipSets }}</el-descriptions-item>
          <el-descriptions-item label="承运单位">{{ currentRow.carrierCompany }}</el-descriptions-item>
          <el-descriptions-item label="承运车号">{{ currentRow.carrierPlate }}</el-descriptions-item>
          <el-descriptions-item label="司机姓名">{{ currentRow.driverName }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="3">{{ currentRow.remark }}</el-descriptions-item>
        </el-descriptions>
      </template>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Document, Search, Refresh, ShoppingCart, Van, Box, FullScreen, View } from '@element-plus/icons-vue'

// ============================================================
// 搜索表单
// ============================================================
const searchForm = ref({ customerName: '', groupName: '', contractNo: '', dateRange: null as [string, string] | null })
const currentPage = ref(1)
const pageSize = ref(10)

const handleSearch = () => { currentPage.value = 1 }
const handleReset = () => { searchForm.value = { customerName: '', groupName: '', contractNo: '', dateRange: null }; currentPage.value = 1 }

// ============================================================
// 全屏展示
// ============================================================
const isFullscreen = ref(false)
const toggleFullscreen = () => { isFullscreen.value = !isFullscreen.value }

// ============================================================
// 详情弹窗
// ============================================================
const detailVisible = ref(false)
const detailViewVisible = computed(() => detailVisible.value)
const currentRow = ref<any>(null)
const openDetail = (row: any) => { currentRow.value = row; detailVisible.value = true }
const formatBool = (val: string, label: string) => val === '是' ? label : ''

// ============================================================
// 数据模型（对应Excel订单管理表）
// ============================================================
interface OrderRow {
  customerName: string; groupName: string; useUnit: string; signDate: string
  unitOrderNo: string; contractNo: string; productSeq: number; brandName: string; productName: string
  outerBagWidthLength: string; outerBagWeight: number; outerBagWarpTension: number; outerBagWeftTension: number
  outerBagDensity: string; outerBagColor: string
  clothWidthGWeight: string; clothWidthLength: string; clothWeight: number
  clothPressure: string; clothMaterial: string; clothColor: string
  innerBagWidthLength: string; innerBagWeight: number; innerBagFilmType: string
  innerBagMaterial: string; innerBagColor: string
  totalWeight: number
  mouthGeneral: string; mouthFlip: string; mouthRing: string
  bottomConnected: string; bottomNonConnected: string
  printSingle: string; printDouble: string
  orderQuantity: number; unitPrice: number; contractAmount: number
  deliveryLocation: string
  shipBatch: string; shipDate: string; shipPieces: number; shipSets: number; shipWeight: number
  carrierCompany: string; carrierPlate: string; driverName: string; remark: string
}

// ============================================================
// Mock 数据（15条，对应Excel结构）
// ============================================================
const mockData: OrderRow[] = [
  { customerName: 'A集团', groupName: 'A集团', useUnit: 'A糖业有限公司', signDate: '2026-04-30', unitOrderNo: '1', contractNo: '2026XXXX01', productSeq: 1, brandName: '嘉墟', productName: '一级白砂糖袋', outerBagWidthLength: '66*96', outerBagWeight: 100, outerBagWarpTension: 0, outerBagWeftTension: 0, outerBagDensity: '', outerBagColor: '', clothWidthGWeight: '69*108', clothWidthLength: '', clothWeight: 35, clothPressure: '高', clothMaterial: '', clothColor: '', innerBagWidthLength: '', innerBagWeight: 0, innerBagFilmType: '', innerBagMaterial: '', innerBagColor: '', totalWeight: 135, mouthGeneral: '是', mouthFlip: '否', mouthRing: '否', bottomConnected: '否', bottomNonConnected: '是', printSingle: '否', printDouble: '否', orderQuantity: 50000, unitPrice: 1.85, contractAmount: 92500, deliveryLocation: 'A糖厂仓库', shipBatch: '', shipDate: '', shipPieces: 0, shipSets: 0, shipWeight: 0, carrierCompany: '', carrierPlate: '', driverName: '', remark: '' },
  { customerName: 'A集团', groupName: 'A集团', useUnit: 'A糖业有限公司', signDate: '2026-04-30', unitOrderNo: '1', contractNo: '2026XXXX01', productSeq: 2, brandName: '嘉墟', productName: '二级白砂糖袋', outerBagWidthLength: '66*96', outerBagWeight: 100, outerBagWarpTension: 0, outerBagWeftTension: 0, outerBagDensity: '', outerBagColor: '', clothWidthGWeight: '', clothWidthLength: '', clothWeight: 0, clothPressure: '', clothMaterial: '', clothColor: '', innerBagWidthLength: '', innerBagWeight: 0, innerBagFilmType: '', innerBagMaterial: '', innerBagColor: '', totalWeight: 100, mouthGeneral: '是', mouthFlip: '否', mouthRing: '否', bottomConnected: '否', bottomNonConnected: '是', printSingle: '否', printDouble: '否', orderQuantity: 30000, unitPrice: 1.85, contractAmount: 55500, deliveryLocation: 'A糖厂仓库', shipBatch: '', shipDate: '', shipPieces: 0, shipSets: 0, shipWeight: 0, carrierCompany: '', carrierPlate: '', driverName: '', remark: '' },
  { customerName: 'B糖业', groupName: 'B糖业集团', useUnit: 'B糖厂', signDate: '2026-05-10', unitOrderNo: 'B-001', contractNo: 'LZ20260510-B', productSeq: 1, brandName: '嘉墟', productName: '50kg白砂糖编织袋', outerBagWidthLength: '55*105', outerBagWeight: 72, outerBagWarpTension: 850, outerBagWeftTension: 650, outerBagDensity: '40:40', outerBagColor: '白', clothWidthGWeight: '55*85', clothWidthLength: '', clothWeight: 85, clothPressure: '高', clothMaterial: 'PE新料', clothColor: '白', innerBagWidthLength: '52*103', innerBagWeight: 28, innerBagFilmType: '高', innerBagMaterial: 'PE新料', innerBagColor: '透明', totalWeight: 100, mouthGeneral: '是', mouthFlip: '否', mouthRing: '否', bottomConnected: '否', bottomNonConnected: '是', printSingle: '是', printDouble: '否', orderQuantity: 80000, unitPrice: 1.92, contractAmount: 153600, deliveryLocation: 'B糖厂仓库', shipBatch: '', shipDate: '', shipPieces: 0, shipSets: 0, shipWeight: 0, carrierCompany: '', carrierPlate: '', driverName: '', remark: '' },
  { customerName: 'C糖业', groupName: 'C糖业集团', useUnit: 'C糖厂', signDate: '2026-05-15', unitOrderNo: 'C-001', contractNo: 'LZ20260515-C', productSeq: 1, brandName: '嘉墟', productName: '50kg红糖编织袋', outerBagWidthLength: '55*105', outerBagWeight: 75, outerBagWarpTension: 900, outerBagWeftTension: 700, outerBagDensity: '42:40', outerBagColor: '红', clothWidthGWeight: '55*90', clothWidthLength: '', clothWeight: 90, clothPressure: '高', clothMaterial: 'PE新料', clothColor: '红', innerBagWidthLength: '52*103', innerBagWeight: 30, innerBagFilmType: '高', innerBagMaterial: 'PE新料', innerBagColor: '透明', totalWeight: 105, mouthGeneral: '是', mouthFlip: '否', mouthRing: '否', bottomConnected: '否', bottomNonConnected: '是', printSingle: '是', printDouble: '否', orderQuantity: 40000, unitPrice: 1.95, contractAmount: 78000, deliveryLocation: 'C糖厂仓库', shipBatch: '', shipDate: '', shipPieces: 0, shipSets: 0, shipWeight: 0, carrierCompany: '', carrierPlate: '', driverName: '', remark: '' },
  { customerName: 'D糖业', groupName: 'D糖业集团', useUnit: 'D糖厂', signDate: '2026-05-20', unitOrderNo: 'D-001', contractNo: 'LZ20260520-D', productSeq: 1, brandName: '嘉墟', productName: '25kg白砂糖小袋', outerBagWidthLength: '45*85', outerBagWeight: 55, outerBagWarpTension: 700, outerBagWeftTension: 550, outerBagDensity: '38:38', outerBagColor: '白', clothWidthGWeight: '45*80', clothWidthLength: '', clothWeight: 80, clothPressure: '低', clothMaterial: 'PE新料', clothColor: '白', innerBagWidthLength: '42*83', innerBagWeight: 22, innerBagFilmType: '低', innerBagMaterial: 'PE新料', innerBagColor: '透明', totalWeight: 77, mouthGeneral: '是', mouthFlip: '否', mouthRing: '否', bottomConnected: '否', bottomNonConnected: '是', printSingle: '是', printDouble: '否', orderQuantity: 50000, unitPrice: 1.55, contractAmount: 77500, deliveryLocation: 'D糖厂仓库', shipBatch: '', shipDate: '', shipPieces: 0, shipSets: 0, shipWeight: 0, carrierCompany: '', carrierPlate: '', driverName: '', remark: '' },
  { customerName: 'E糖业', groupName: 'E糖业集团', useUnit: 'E糖厂', signDate: '2026-06-01', unitOrderNo: 'E-001', contractNo: 'LZ20260601-E', productSeq: 1, brandName: '嘉墟', productName: '50kg赤砂糖编织袋', outerBagWidthLength: '55*105', outerBagWeight: 72, outerBagWarpTension: 850, outerBagWeftTension: 650, outerBagDensity: '40:40', outerBagColor: '棕', clothWidthGWeight: '55*85', clothWidthLength: '', clothWeight: 85, clothPressure: '高', clothMaterial: 'PE新料', clothColor: '棕', innerBagWidthLength: '52*103', innerBagWeight: 28, innerBagFilmType: '高', innerBagMaterial: 'PE新料', innerBagColor: '透明', totalWeight: 100, mouthGeneral: '是', mouthFlip: '否', mouthRing: '否', bottomConnected: '否', bottomNonConnected: '是', printSingle: '是', printDouble: '否', orderQuantity: 60000, unitPrice: 1.88, contractAmount: 112800, deliveryLocation: 'E糖厂仓库', shipBatch: '', shipDate: '', shipPieces: 0, shipSets: 0, shipWeight: 0, carrierCompany: '', carrierPlate: '', driverName: '', remark: '' },
  { customerName: 'F糖业', groupName: 'F糖业集团', useUnit: 'F糖厂', signDate: '2026-06-10', unitOrderNo: 'F-001', contractNo: 'LZ20260610-F', productSeq: 1, brandName: '嘉墟', productName: '50kg白砂糖编织袋（阀口）', outerBagWidthLength: '55*105', outerBagWeight: 80, outerBagWarpTension: 950, outerBagWeftTension: 750, outerBagDensity: '44:42', outerBagColor: '白', clothWidthGWeight: '', clothWidthLength: '', clothWeight: 0, clothPressure: '无', clothMaterial: '无', clothColor: '无', innerBagWidthLength: '无', innerBagWeight: 0, innerBagFilmType: '无', innerBagMaterial: '无', innerBagColor: '无', totalWeight: 80, mouthGeneral: '否', mouthFlip: '否', mouthRing: '是', bottomConnected: '否', bottomNonConnected: '是', printSingle: '是', printDouble: '否', orderQuantity: 100000, unitPrice: 1.78, contractAmount: 178000, deliveryLocation: 'F糖厂仓库', shipBatch: '', shipDate: '', shipPieces: 0, shipSets: 0, shipWeight: 0, carrierCompany: '', carrierPlate: '', driverName: '', remark: '自动灌装线专用' },
  { customerName: 'G糖业', groupName: 'G糖业集团', useUnit: 'G糖厂', signDate: '2026-06-15', unitOrderNo: 'G-001', contractNo: 'LZ20260615-G', productSeq: 1, brandName: '嘉墟', productName: '50kg白砂糖编织袋', outerBagWidthLength: '55*105', outerBagWeight: 72, outerBagWarpTension: 850, outerBagWeftTension: 650, outerBagDensity: '40:40', outerBagColor: '白', clothWidthGWeight: '55*85', clothWidthLength: '', clothWeight: 85, clothPressure: '高', clothMaterial: 'PE新料', clothColor: '白', innerBagWidthLength: '52*103', innerBagWeight: 28, innerBagFilmType: '高', innerBagMaterial: 'PE新料', innerBagColor: '透明', totalWeight: 100, mouthGeneral: '是', mouthFlip: '否', mouthRing: '否', bottomConnected: '否', bottomNonConnected: '是', printSingle: '是', printDouble: '否', orderQuantity: 70000, unitPrice: 1.85, contractAmount: 129500, deliveryLocation: 'G糖厂仓库', shipBatch: '', shipDate: '', shipPieces: 0, shipSets: 0, shipWeight: 0, carrierCompany: '', carrierPlate: '', driverName: '', remark: '' },
  { customerName: 'H糖业', groupName: 'H糖业集团', useUnit: 'H糖厂', signDate: '2026-06-20', unitOrderNo: 'H-001', contractNo: 'LZ20260620-H', productSeq: 1, brandName: '嘉墟', productName: '50kg白砂糖编织袋（彩印）', outerBagWidthLength: '55*105', outerBagWeight: 78, outerBagWarpTension: 900, outerBagWeftTension: 700, outerBagDensity: '42:40', outerBagColor: '白底', clothWidthGWeight: '55*90', clothWidthLength: '', clothWeight: 90, clothPressure: '高', clothMaterial: 'PE新料', clothColor: '白', innerBagWidthLength: '52*103', innerBagWeight: 30, innerBagFilmType: '高', innerBagMaterial: 'PE新料', innerBagColor: '透明', totalWeight: 108, mouthGeneral: '是', mouthFlip: '否', mouthRing: '否', bottomConnected: '否', bottomNonConnected: '是', printSingle: '否', printDouble: '否', orderQuantity: 120000, unitPrice: 2.15, contractAmount: 258000, deliveryLocation: 'H糖厂仓库', shipBatch: '', shipDate: '', shipPieces: 0, shipSets: 0, shipWeight: 0, carrierCompany: '', carrierPlate: '', driverName: '', remark: '彩印版面待确认' },
  { customerName: 'I糖业', groupName: 'I糖业集团', useUnit: 'I糖厂', signDate: '2026-07-01', unitOrderNo: 'I-001', contractNo: 'LZ20260701-I', productSeq: 1, brandName: '嘉墟', productName: '1000kg集装袋（糖用）', outerBagWidthLength: '105*105*120', outerBagWeight: 1850, outerBagWarpTension: 1800, outerBagWeftTension: 1600, outerBagDensity: '50:50', outerBagColor: '白', clothWidthGWeight: '105*170', clothWidthLength: '', clothWeight: 160, clothPressure: '高', clothMaterial: 'PP新料', clothColor: '白', innerBagWidthLength: '无', innerBagWeight: 0, innerBagFilmType: '无', innerBagMaterial: '无', innerBagColor: '无', totalWeight: 1850, mouthGeneral: '否', mouthFlip: '否', mouthRing: '否', bottomConnected: '是', bottomNonConnected: '否', printSingle: '否', printDouble: '是', orderQuantity: 5000, unitPrice: 18.5, contractAmount: 92500, deliveryLocation: 'I糖厂堆场', shipBatch: '', shipDate: '', shipPieces: 0, shipSets: 0, shipWeight: 0, carrierCompany: '', carrierPlate: '', driverName: '', remark: '吊环四向' },
  { customerName: 'J糖业', groupName: 'J糖业集团', useUnit: 'J糖厂', signDate: '2026-07-10', unitOrderNo: 'J-001', contractNo: 'LZ20260710-J', productSeq: 1, brandName: '嘉墟', productName: '50kg白砂糖编织袋', outerBagWidthLength: '55*105', outerBagWeight: 72, outerBagWarpTension: 850, outerBagWeftTension: 650, outerBagDensity: '40:40', outerBagColor: '白', clothWidthGWeight: '55*85', clothWidthLength: '', clothWeight: 85, clothPressure: '高', clothMaterial: 'PE新料', clothColor: '白', innerBagWidthLength: '52*103', innerBagWeight: 28, innerBagFilmType: '高', innerBagMaterial: 'PE新料', innerBagColor: '透明', totalWeight: 100, mouthGeneral: '是', mouthFlip: '否', mouthRing: '否', bottomConnected: '否', bottomNonConnected: '是', printSingle: '是', printDouble: '否', orderQuantity: 45000, unitPrice: 1.95, contractAmount: 87750, deliveryLocation: 'J糖厂仓库', shipBatch: '', shipDate: '', shipPieces: 0, shipSets: 0, shipWeight: 0, carrierCompany: '', carrierPlate: '', driverName: '', remark: '' },
  { customerName: 'K糖业', groupName: 'K糖业集团', useUnit: 'K糖厂', signDate: '2026-07-15', unitOrderNo: 'K-001', contractNo: 'LZ20260715-K', productSeq: 1, brandName: '嘉墟', productName: '50kg白砂糖编织袋', outerBagWidthLength: '55*105', outerBagWeight: 72, outerBagWarpTension: 850, outerBagWeftTension: 650, outerBagDensity: '40:40', outerBagColor: '白', clothWidthGWeight: '55*85', clothWidthLength: '', clothWeight: 85, clothPressure: '高', clothMaterial: 'PE新料', clothColor: '白', innerBagWidthLength: '52*103', innerBagWeight: 28, innerBagFilmType: '高', innerBagMaterial: 'PE新料', innerBagColor: '透明', totalWeight: 100, mouthGeneral: '是', mouthFlip: '否', mouthRing: '否', bottomConnected: '否', bottomNonConnected: '是', printSingle: '是', printDouble: '否', orderQuantity: 90000, unitPrice: 1.82, contractAmount: 163800, deliveryLocation: 'K糖厂仓库', shipBatch: '', shipDate: '', shipPieces: 0, shipSets: 0, shipWeight: 0, carrierCompany: '', carrierPlate: '', driverName: '', remark: '' },
  { customerName: 'L糖业', groupName: 'L糖业集团', useUnit: 'L糖厂', signDate: '2026-08-01', unitOrderNo: 'L-001', contractNo: 'LZ20260801-L', productSeq: 1, brandName: '嘉墟', productName: '50kg白砂糖编织袋（涂膜单面）', outerBagWidthLength: '55*105', outerBagWeight: 74, outerBagWarpTension: 850, outerBagWeftTension: 650, outerBagDensity: '40:40', outerBagColor: '白', clothWidthGWeight: '55*85', clothWidthLength: '', clothWeight: 85, clothPressure: '高', clothMaterial: 'PE新料', clothColor: '白', innerBagWidthLength: '52*103', innerBagWeight: 28, innerBagFilmType: '高', innerBagMaterial: 'PE新料', innerBagColor: '透明', totalWeight: 102, mouthGeneral: '是', mouthFlip: '否', mouthRing: '否', bottomConnected: '否', bottomNonConnected: '是', printSingle: '是', printDouble: '否', orderQuantity: 55000, unitPrice: 1.9, contractAmount: 104500, deliveryLocation: 'L糖厂仓库', shipBatch: '', shipDate: '', shipPieces: 0, shipSets: 0, shipWeight: 0, carrierCompany: '', carrierPlate: '', driverName: '', remark: '' },
  { customerName: 'M糖业', groupName: 'M糖业集团', useUnit: 'M糖厂', signDate: '2026-08-10', unitOrderNo: 'M-001', contractNo: 'LZ20260810-M', productSeq: 1, brandName: '嘉墟', productName: '50kg红糖编织袋', outerBagWidthLength: '55*105', outerBagWeight: 75, outerBagWarpTension: 900, outerBagWeftTension: 700, outerBagDensity: '42:40', outerBagColor: '红', clothWidthGWeight: '55*90', clothWidthLength: '', clothWeight: 90, clothPressure: '高', clothMaterial: 'PE新料', clothColor: '红', innerBagWidthLength: '52*103', innerBagWeight: 30, innerBagFilmType: '高', innerBagMaterial: 'PE新料', innerBagColor: '透明', totalWeight: 105, mouthGeneral: '是', mouthFlip: '否', mouthRing: '否', bottomConnected: '否', bottomNonConnected: '是', printSingle: '是', printDouble: '否', orderQuantity: 35000, unitPrice: 1.95, contractAmount: 68250, deliveryLocation: 'M糖厂仓库', shipBatch: '', shipDate: '', shipPieces: 0, shipSets: 0, shipWeight: 0, carrierCompany: '', carrierPlate: '', driverName: '', remark: '' },
  { customerName: 'A集团', groupName: 'A集团', useUnit: 'A糖业有限公司', signDate: '2026-08-15', unitOrderNo: '', contractNo: '2026XXXX02', productSeq: 0, brandName: '', productName: '', outerBagWidthLength: '', outerBagWeight: 0, outerBagWarpTension: 0, outerBagWeftTension: 0, outerBagDensity: '', outerBagColor: '', clothWidthGWeight: '', clothWidthLength: '', clothWeight: 0, clothPressure: '', clothMaterial: '', clothColor: '', innerBagWidthLength: '', innerBagWeight: 0, innerBagFilmType: '', innerBagMaterial: '', innerBagColor: '', totalWeight: 0, mouthGeneral: '否', mouthFlip: '否', mouthRing: '否', bottomConnected: '否', bottomNonConnected: '否', printSingle: '否', printDouble: '否', orderQuantity: 0, unitPrice: 0, contractAmount: 0, deliveryLocation: '', shipBatch: '', shipDate: '', shipPieces: 0, shipSets: 0, shipWeight: 0, carrierCompany: '', carrierPlate: '', driverName: '', remark: '' }
]

// ============================================================
// 过滤逻辑
// ============================================================
const filteredData = computed(() => {
  return mockData.filter((row) => {
    if (searchForm.value.customerName && !row.customerName.includes(searchForm.value.customerName)) return false
    if (searchForm.value.groupName && !row.groupName.includes(searchForm.value.groupName)) return false
    if (searchForm.value.contractNo && !row.contractNo.includes(searchForm.value.contractNo)) return false
    if (searchForm.value.dateRange) {
      const [start, end] = searchForm.value.dateRange
      if (row.signDate < start || row.signDate > end) return false
    }
    return true
  })
})

// ============================================================
// 分页数据
// ============================================================
const pageData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredData.value.slice(start, start + pageSize.value)
})

// ============================================================
// 统计卡片
// ============================================================
const summaryData = computed(() => {
  const data = filteredData.value.filter(r => r.orderQuantity > 0)
  const totalRecords = data.length
  const totalQuantity = data.reduce((s, r) => s + r.orderQuantity, 0)
  const totalShipped = data.reduce((s, r) => s + r.shipSets, 0)
  const totalStock = data.reduce((s, r) => s + (r.orderQuantity - r.shipSets), 0)
  return {
    totalRecords,
    totalQuantity: formatNumber(totalQuantity),
    totalShipped: formatNumber(totalShipped),
    totalStock: formatNumber(totalStock)
  }
})

// ============================================================
// 工具函数
// ============================================================
const formatNumber = (value: number): string => {
  if (value === undefined || value === null || isNaN(value)) return '0'
  return new Intl.NumberFormat('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value)
}

const headerCellStyle = () => ({
  background: '#f5f7fa', color: '#303133', fontWeight: 600, fontSize: '13px'
})
</script>

<style lang="scss" scoped>
@use '@/scss/variables' as *;

$icon-bg-records: linear-gradient(135deg, #1a73e8, #4a90e2);
$icon-bg-order: linear-gradient(135deg, #00bcd4, #26c6da);
$icon-bg-shipped: linear-gradient(135deg, #fb8c00, #ffa726);
$icon-bg-stock: linear-gradient(135deg, #43a047, #66bb6a);

.longzhou-order-report {
  padding: 0 $spacing-5;
  background: $color-gray-100;
  min-height: 100vh;

  .page-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: $spacing-5 $spacing-6; background: #fff;
    border-radius: $border-radius-lg; box-shadow: $shadow-sm;
    margin-bottom: $spacing-5; margin-top: $spacing-5;
    .header-left { display: flex; align-items: center; gap: $spacing-4; }
    .header-icon {
      width: 48px; height: 48px; border-radius: $border-radius-lg;
      background: linear-gradient(135deg, #e8590c, #ff8f00);
      display: flex; align-items: center; justify-content: center; color: #fff; flex-shrink: 0;
    }
    .header-text { display: flex; flex-direction: column; gap: 2px; }
    .header-title { font-size: $font-size-xl; font-weight: $font-weight-bold; color: $color-gray-900; margin: 0; line-height: $line-height-tight; }
    .header-subtitle { font-size: $font-size-sm; color: $color-gray-500; margin: 0; line-height: $line-height-normal; }
  }

  .search-card {
    background: #fff; border-radius: $border-radius-lg; box-shadow: $shadow-base;
    margin-bottom: $spacing-5; border: none;
    :deep(.el-card__body) { padding: $spacing-4 $spacing-5; }
  }

  .summary-cards {
    margin-bottom: $spacing-5;
    .summary-card {
      display: flex; align-items: center; padding: $spacing-4 $spacing-5;
      transition: $transition-base; border: 1px solid transparent;
      &:hover { border-color: $color-primary-light; box-shadow: $shadow-md; }
      .card-icon {
        width: 44px; height: 44px; border-radius: $border-radius-lg;
        display: flex; align-items: center; justify-content: center; color: #fff; flex-shrink: 0; margin-right: $spacing-4;
        &.records-icon { background: $icon-bg-records; }
        &.order-icon { background: $icon-bg-order; }
        &.shipped-icon { background: $icon-bg-shipped; }
        &.stock-icon { background: $icon-bg-stock; }
      }
      .card-body { flex: 1; min-width: 0; }
      .card-label { font-size: $font-size-xs; color: $color-gray-500; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
      .card-value { font-size: $font-size-2xl; font-weight: $font-weight-bold; color: $color-gray-900; line-height: $line-height-tight; margin-bottom: 2px;
        &.highlight { color: $color-warning; }
        &.bold { color: $color-gray-900; }
      }
      .card-sub { font-size: $font-size-xs; color: $color-gray-400; }
    }
  }

  .table-card {
    background: #fff; border-radius: $border-radius-lg; box-shadow: $shadow-base; overflow: hidden;
    &.is-fullscreen {
      border-radius: 0; position: fixed; top: 60px; left: 240px; right: 0; bottom: 0; z-index: 100;
      .card-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: $spacing-2; padding: $spacing-3 $spacing-5; border-bottom: 1px solid $color-gray-200; background: #fff; }
      :deep(.el-table) { height: calc(100vh - 60px - 50px) !important; }
    }
    .card-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: $spacing-2;
      .header-title-text { font-weight: $font-weight-semibold; color: $color-gray-900; font-size: $font-size-base; }
    }
    :deep(.el-table) { font-size: $font-size-sm; .el-table__header-wrapper th { background: $color-gray-50; } }
    .card-footer { padding: $spacing-3 $spacing-5; display: flex; justify-content: flex-end; border-top: 1px solid $color-gray-200; background: $color-gray-50; }
  }
}
</style>
