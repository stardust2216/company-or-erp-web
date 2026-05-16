<template>
  <div class="longzhou-order-list">
    <!-- 页头 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon :size="28"><Document /></el-icon>
        </div>
        <div class="header-text">
          <h1 class="header-title">龙州塑业 - 订单管理</h1>
          <p class="header-subtitle">26-27榨季 糖袋订单录入与状态跟踪</p>
        </div>
      </div>
      <div class="header-right">
        <el-button type="primary" :icon="Plus" @click="handleAdd">新增订单</el-button>
      </div>
    </div>

    <!-- 搜索区 -->
    <el-card shadow="never" class="search-card">
      <el-form :model="searchForm" inline label-width="auto" size="default">
        <el-form-item label="客户名称">
          <el-input v-model="searchForm.customerName" placeholder="请输入客户名称" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 160px">
            <el-option label="待审核" value="pending" />
            <el-option label="生产中" value="producing" />
            <el-option label="已发货" value="shipped" />
            <el-option label="已开票" value="invoiced" />
            <el-option label="回款进度" value="paid" />
          </el-select>
        </el-form-item>
        <el-form-item label="合同编号">
          <el-input v-model="searchForm.contractNo" placeholder="请输入合同编号" clearable style="width: 180px" />
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
    <el-row :gutter="16" class="summary-cards">
      <el-col :span="6">
        <el-card shadow="hover" class="summary-card">
          <div class="card-icon pending-icon"><el-icon :size="22"><Clock /></el-icon></div>
          <div class="card-body">
            <div class="card-label">待审核</div>
            <div class="card-value">{{ statusCounts.pending }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="summary-card">
          <div class="card-icon producing-icon"><el-icon :size="22"><SetUp /></el-icon></div>
          <div class="card-body">
            <div class="card-label">生产中</div>
            <div class="card-value">{{ statusCounts.producing }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="summary-card">
          <div class="card-icon shipped-icon"><el-icon :size="22"><Van /></el-icon></div>
          <div class="card-body">
            <div class="card-label">已发货</div>
            <div class="card-value">{{ statusCounts.shipped }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="summary-card">
          <div class="card-icon stock-icon"><el-icon :size="22"><Box /></el-icon></div>
          <div class="card-body">
            <div class="card-label">剩余库存（套）</div>
            <div class="card-value">{{ totalStock }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 订单表格 -->
    <el-card shadow="never" class="table-card">
      <template #header>
        <div class="card-header">
          <span class="header-title-text">订单列表</span>
        </div>
      </template>

      <el-table :data="paginatedData" border stripe style="width: 100%" max-height="800"
        :header-cell-style="headerCellStyle" size="small" highlight-current-row>
        <el-table-column type="index" label="序号" width="55" align="center" fixed="left" />
        <el-table-column prop="customerName" label="客户名称" min-width="130" show-overflow-tooltip fixed="left" />
        <el-table-column prop="groupName" label="集团名称" min-width="130" show-overflow-tooltip />
        <el-table-column prop="contractNo" label="合同编号" min-width="150" show-overflow-tooltip />
        <el-table-column prop="productName" label="产品名称" min-width="120" show-overflow-tooltip />
        <el-table-column prop="orderQuantity" label="订单数量（套）" width="130" align="right" />
        <el-table-column prop="unitPrice" label="单价（元/套）" width="120" align="right" />
        <el-table-column prop="contractAmount" label="合同金额（元）" width="130" align="right" />
        <el-table-column label="订单状态" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remainingStock" label="剩余库存（套）" width="130" align="right" />
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link :icon="View" size="small" @click.stop="openDetail(row)">查看</el-button>
            <el-button type="warning" link :icon="Edit" size="small" @click.stop="handleEdit(row)">编辑</el-button>
            <el-button type="success" link :icon="Printer" size="small" @click.stop="handlePrint(row)">打印计划</el-button>
          </template>
        </el-table-column>
      </el-table>

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
          <el-descriptions-item label="合同编号" :span="2">{{ currentRow.contractNo }}</el-descriptions-item>
          <el-descriptions-item label="签订日期">{{ currentRow.signDate }}</el-descriptions-item>
        </el-descriptions>

        <el-divider content-position="left">产品信息</el-divider>

        <el-descriptions :column="3" border size="small" label-width="120px">
          <el-descriptions-item label="产品名称">{{ currentRow.productName }}</el-descriptions-item>
          <el-descriptions-item label="订单数量">{{ currentRow.orderQuantity }} 套</el-descriptions-item>
          <el-descriptions-item label="单价">{{ currentRow.unitPrice }} 元/套</el-descriptions-item>
          <el-descriptions-item label="合同金额">{{ currentRow.contractAmount }} 元</el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="statusTagType(currentRow.status)">{{ statusLabel(currentRow.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="剩余库存">{{ currentRow.remainingStock }} 套</el-descriptions-item>
        </el-descriptions>

        <el-divider content-position="left">产品规格</el-divider>

        <el-descriptions :column="3" border size="small" label-width="120px">
          <el-descriptions-item label="外袋规格">{{ currentRow.outerBagSpec }}</el-descriptions-item>
          <el-descriptions-item label="布筒规格">{{ currentRow.clothSpec }}</el-descriptions-item>
          <el-descriptions-item label="内袋规格">{{ currentRow.innerBagSpec }}</el-descriptions-item>
          <el-descriptions-item label="袋口">{{ formatBool(currentRow.mouthGeneral, '一般') }} {{ formatBool(currentRow.mouthFlip, '翻口') }} {{ formatBool(currentRow.mouthRing, '圈口') }}</el-descriptions-item>
          <el-descriptions-item label="袋底">{{ formatBool(currentRow.bottomConnected, '连膜车底') }} {{ formatBool(currentRow.bottomNonConnected, '非连膜车底') }}</el-descriptions-item>
          <el-descriptions-item label="印刷">{{ formatBool(currentRow.printSingle, '单面') }} {{ formatBool(currentRow.printDouble, '双面') }}</el-descriptions-item>
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
import { Document, Search, Refresh, View, Edit, Printer, Clock, SetUp, Van, Box, Plus } from '@element-plus/icons-vue'

// ============================================================
// 搜索表单
// ============================================================
const searchForm = ref({ customerName: '', status: '', contractNo: '' })
const currentPage = ref(1)
const pageSize = ref(10)

const handleSearch = () => { currentPage.value = 1 }
const handleReset = () => { searchForm.value = { customerName: '', status: '', contractNo: '' }; currentPage.value = 1 }
const handleAdd = () => { console.log('新增订单') }

// ============================================================
// 详情弹窗
// ============================================================
const detailVisible = ref(false)
const currentRow = ref<any>(null)
const openDetail = (row: any) => { currentRow.value = row; detailVisible.value = true }
const handleEdit = (row: any) => { console.log('编辑订单', row) }
const handlePrint = (row: any) => { console.log('打印生产计划单', row) }
const formatBool = (val: string, label: string) => val === '是' ? label : ''

// ============================================================
// 订单状态
// ============================================================
type OrderStatus = 'pending' | 'producing' | 'shipped' | 'invoiced' | 'paid'

const statusLabel = (status: OrderStatus): string => {
  const map: Record<OrderStatus, string> = {
    pending: '待审核',
    producing: '生产中',
    shipped: '已发货',
    invoiced: '已开票',
    paid: '回款进度'
  }
  return map[status] || status
}

const statusTagType = (status: OrderStatus): string => {
  const map: Record<OrderStatus, string> = {
    pending: 'info',
    producing: 'warning',
    shipped: 'success',
    invoiced: '',
    paid: 'danger'
  }
  return map[status] || ''
}

// ============================================================
// 数据模型
// ============================================================
interface OrderRow {
  id: number
  customerName: string
  groupName: string
  useUnit: string
  signDate: string
  unitOrderNo: string
  contractNo: string
  productName: string
  outerBagSpec: string
  clothSpec: string
  innerBagSpec: string
  mouthGeneral: string
  mouthFlip: string
  mouthRing: string
  bottomConnected: string
  bottomNonConnected: string
  printSingle: string
  printDouble: string
  orderQuantity: number
  unitPrice: number
  contractAmount: number
  status: OrderStatus
  remainingStock: number
}

// ============================================================
// Mock 数据（15条，糖袋订单）
// ============================================================
const mockData: OrderRow[] = [
  { id: 1, customerName: 'A集团', groupName: 'A集团', useUnit: 'A糖业有限公司', signDate: '2026-04-30', unitOrderNo: '1', contractNo: '2026XXXX01', productName: '一级白砂糖袋', outerBagSpec: '66*96', clothSpec: '69*108', innerBagSpec: '无', mouthGeneral: '是', mouthFlip: '否', mouthRing: '否', bottomConnected: '否', bottomNonConnected: '是', printSingle: '是', printDouble: '否', orderQuantity: 50000, unitPrice: 1.85, contractAmount: 92500, status: 'producing', remainingStock: 35000 },
  { id: 2, customerName: 'A集团', groupName: 'A集团', useUnit: 'A糖业有限公司', signDate: '2026-04-30', unitOrderNo: '2', contractNo: '2026XXXX01', productName: '二级白砂糖袋', outerBagSpec: '66*96', clothSpec: '', innerBagSpec: '', mouthGeneral: '是', mouthFlip: '否', mouthRing: '否', bottomConnected: '否', bottomNonConnected: '是', printSingle: '是', printDouble: '否', orderQuantity: 30000, unitPrice: 1.85, contractAmount: 55500, status: 'producing', remainingStock: 21000 },
  { id: 3, customerName: 'B糖业', groupName: 'B糖业集团', useUnit: 'B糖厂', signDate: '2026-05-10', unitOrderNo: 'B-001', contractNo: 'LZ20260510-B', productName: '50kg白砂糖编织袋', outerBagSpec: '55*105', clothSpec: '55*85', innerBagSpec: '52*103', mouthGeneral: '是', mouthFlip: '否', mouthRing: '否', bottomConnected: '否', bottomNonConnected: '是', printSingle: '是', printDouble: '否', orderQuantity: 80000, unitPrice: 1.92, contractAmount: 153600, status: 'shipped', remainingStock: 56000 },
  { id: 4, customerName: 'C糖业', groupName: 'C糖业集团', useUnit: 'C糖厂', signDate: '2026-05-15', unitOrderNo: 'C-001', contractNo: 'LZ20260515-C', productName: '50kg红糖编织袋', outerBagSpec: '55*105', clothSpec: '55*85', innerBagSpec: '52*103', mouthGeneral: '是', mouthFlip: '否', mouthRing: '否', bottomConnected: '否', bottomNonConnected: '是', printSingle: '是', printDouble: '否', orderQuantity: 40000, unitPrice: 1.95, contractAmount: 78000, status: 'pending', remainingStock: 40000 },
  { id: 5, customerName: 'D糖业', groupName: 'D糖业集团', useUnit: 'D糖厂', signDate: '2026-05-20', unitOrderNo: 'D-001', contractNo: 'LZ20260520-D', productName: '25kg白砂糖小袋', outerBagSpec: '45*85', clothSpec: '45*80', innerBagSpec: '42*83', mouthGeneral: '是', mouthFlip: '否', mouthRing: '否', bottomConnected: '否', bottomNonConnected: '是', printSingle: '是', printDouble: '否', orderQuantity: 50000, unitPrice: 1.55, contractAmount: 77500, status: 'pending', remainingStock: 50000 },
  { id: 6, customerName: 'E糖业', groupName: 'E糖业集团', useUnit: 'E糖厂', signDate: '2026-06-01', unitOrderNo: 'E-001', contractNo: 'LZ20260601-E', productName: '50kg赤砂糖编织袋', outerBagSpec: '55*105', clothSpec: '55*85', innerBagSpec: '52*103', mouthGeneral: '是', mouthFlip: '否', mouthRing: '否', bottomConnected: '否', bottomNonConnected: '是', printSingle: '是', printDouble: '否', orderQuantity: 60000, unitPrice: 1.88, contractAmount: 112800, status: 'producing', remainingStock: 42000 },
  { id: 7, customerName: 'F糖业', groupName: 'F糖业集团', useUnit: 'F糖厂', signDate: '2026-06-10', unitOrderNo: 'F-001', contractNo: 'LZ20260610-F', productName: '50kg白砂糖编织袋（阀口）', outerBagSpec: '55*105', clothSpec: '', innerBagSpec: '无', mouthGeneral: '否', mouthFlip: '否', mouthRing: '是', bottomConnected: '否', bottomNonConnected: '是', printSingle: '是', printDouble: '否', orderQuantity: 100000, unitPrice: 1.78, contractAmount: 178000, status: 'pending', remainingStock: 100000 },
  { id: 8, customerName: 'G糖业', groupName: 'G糖业集团', useUnit: 'G糖厂', signDate: '2026-06-15', unitOrderNo: 'G-001', contractNo: 'LZ20260615-G', productName: '50kg白砂糖编织袋', outerBagSpec: '55*105', clothSpec: '55*85', innerBagSpec: '52*103', mouthGeneral: '是', mouthFlip: '否', mouthRing: '否', bottomConnected: '否', bottomNonConnected: '是', printSingle: '是', printDouble: '否', orderQuantity: 70000, unitPrice: 1.85, contractAmount: 129500, status: 'shipped', remainingStock: 49000 },
  { id: 9, customerName: 'H糖业', groupName: 'H糖业集团', useUnit: 'H糖厂', signDate: '2026-06-20', unitOrderNo: 'H-001', contractNo: 'LZ20260620-H', productName: '50kg白砂糖编织袋（彩印）', outerBagSpec: '55*105', clothSpec: '55*85', innerBagSpec: '52*103', mouthGeneral: '是', mouthFlip: '否', mouthRing: '否', bottomConnected: '否', bottomNonConnected: '是', printSingle: '否', printDouble: '否', orderQuantity: 120000, unitPrice: 2.15, contractAmount: 258000, status: 'pending', remainingStock: 120000 },
  { id: 10, customerName: 'I糖业', groupName: 'I糖业集团', useUnit: 'I糖厂', signDate: '2026-07-01', unitOrderNo: 'I-001', contractNo: 'LZ20260701-I', productName: '1000kg集装袋（糖用）', outerBagSpec: '105*105*120', clothSpec: '105*170', innerBagSpec: '无', mouthGeneral: '否', mouthFlip: '否', mouthRing: '否', bottomConnected: '是', bottomNonConnected: '否', printSingle: '否', printDouble: '是', orderQuantity: 5000, unitPrice: 18.5, contractAmount: 92500, status: 'pending', remainingStock: 5000 },
  { id: 11, customerName: 'A集团', groupName: 'A集团', useUnit: 'A糖业有限公司', signDate: '2026-07-10', unitOrderNo: '1', contractNo: '2026XXXX02', productName: '一级白砂糖袋', outerBagSpec: '66*96', clothSpec: '69*108', innerBagSpec: '无', mouthGeneral: '是', mouthFlip: '否', mouthRing: '否', bottomConnected: '否', bottomNonConnected: '是', printSingle: '是', printDouble: '否', orderQuantity: 0, unitPrice: 1.85, contractAmount: 0, status: 'pending', remainingStock: 0 },
  { id: 12, customerName: 'J糖业', groupName: 'J糖业集团', useUnit: 'J糖厂', signDate: '2026-07-15', unitOrderNo: 'J-001', contractNo: 'LZ20260715-J', productName: '50kg白砂糖编织袋', outerBagSpec: '55*105', clothSpec: '55*85', innerBagSpec: '52*103', mouthGeneral: '是', mouthFlip: '否', mouthRing: '否', bottomConnected: '否', bottomNonConnected: '是', printSingle: '是', printDouble: '否', orderQuantity: 45000, unitPrice: 1.95, contractAmount: 87750, status: 'pending', remainingStock: 45000 },
  { id: 13, customerName: 'K糖业', groupName: 'K糖业集团', useUnit: 'K糖厂', signDate: '2026-07-20', unitOrderNo: 'K-001', contractNo: 'LZ20260720-K', productName: '50kg白砂糖编织袋', outerBagSpec: '55*105', clothSpec: '55*85', innerBagSpec: '52*103', mouthGeneral: '是', mouthFlip: '否', mouthRing: '否', bottomConnected: '否', bottomNonConnected: '是', printSingle: '是', printDouble: '否', orderQuantity: 90000, unitPrice: 1.82, contractAmount: 163800, status: 'pending', remainingStock: 90000 },
  { id: 14, customerName: 'L糖业', groupName: 'L糖业集团', useUnit: 'L糖厂', signDate: '2026-08-01', unitOrderNo: 'L-001', contractNo: 'LZ20260801-L', productName: '50kg白砂糖编织袋（涂膜单面）', outerBagSpec: '55*105', clothSpec: '55*85', innerBagSpec: '52*103', mouthGeneral: '是', mouthFlip: '否', mouthRing: '否', bottomConnected: '否', bottomNonConnected: '是', printSingle: '是', printDouble: '否', orderQuantity: 55000, unitPrice: 1.9, contractAmount: 104500, status: 'pending', remainingStock: 55000 },
  { id: 15, customerName: 'M糖业', groupName: 'M糖业集团', useUnit: 'M糖厂', signDate: '2026-08-10', unitOrderNo: 'M-001', contractNo: 'LZ20260810-M', productName: '50kg红糖编织袋', outerBagSpec: '55*105', clothSpec: '55*85', innerBagSpec: '52*103', mouthGeneral: '是', mouthFlip: '否', mouthRing: '否', bottomConnected: '否', bottomNonConnected: '是', printSingle: '是', printDouble: '否', orderQuantity: 35000, unitPrice: 1.95, contractAmount: 68250, status: 'pending', remainingStock: 35000 }
]

// ============================================================
// 过滤逻辑
// ============================================================
const filteredData = computed(() => {
  return mockData.filter((row) => {
    if (searchForm.value.customerName && !row.customerName.includes(searchForm.value.customerName)) return false
    if (searchForm.value.status && row.status !== searchForm.value.status) return false
    if (searchForm.value.contractNo && !row.contractNo.includes(searchForm.value.contractNo)) return false
    return true
  })
})

// ============================================================
// 分页数据
// ============================================================
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredData.value.slice(start, start + pageSize.value)
})

// ============================================================
// 统计
// ============================================================
const statusCounts = computed(() => {
  const data = filteredData.value
  return {
    pending: data.filter(r => r.status === 'pending').length,
    producing: data.filter(r => r.status === 'producing').length,
    shipped: data.filter(r => r.status === 'shipped').length,
    invoiced: data.filter(r => r.status === 'invoiced').length,
    paid: data.filter(r => r.status === 'paid').length
  }
})

const totalStock = computed(() => {
  return filteredData.value.reduce((s, r) => s + r.remainingStock, 0).toLocaleString('zh-CN')
})

// ============================================================
// 表头样式
// ============================================================
const headerCellStyle = () => ({
  background: '#f5f7fa', color: '#303133', fontWeight: 600, fontSize: '13px'
})
</script>

<style lang="scss" scoped>
@use '@/scss/variables' as *;

.longzhou-order-list {
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

  .search-card {
    background: #fff;
    border-radius: $border-radius-lg;
    box-shadow: $shadow-base;
    margin-bottom: $spacing-5;
    border: none;
    :deep(.el-card__body) { padding: $spacing-4 $spacing-5; }
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

        &.pending-icon { background: linear-gradient(135deg, #909399, #a6a9ad); }
        &.producing-icon { background: linear-gradient(135deg, #e6a23c, #f0a020); }
        &.shipped-icon { background: linear-gradient(135deg, #67c23a, #85ce61); }
        &.stock-icon { background: linear-gradient(135deg, #409eff, #66b1ff); }
      }

      .card-body {
        flex: 1;
        min-width: 0;
      }

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
