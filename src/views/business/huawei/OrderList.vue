<template>
  <div class="sulfur-order-list-page">
    <!-- 页头 -->
    <div class="page-header">
      <div class="header-badge" :style="{ background: 'linear-gradient(135deg,#f093fb,#f5576c)' }">
        <el-icon :size="28"><Goods /></el-icon>
      </div>
      <div class="header-info">
        <h1 class="page-title">华维食品 - 硫磺订单列表</h1>
        <p class="page-subtitle">硫磺产品销售合同管理 —— 26-27榨季</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>新建订单
        </el-button>
      </div>
    </div>

    <!-- 搜索筛选区 -->
    <el-card class="filter-card" shadow="never">
      <el-form :model="filterForm" inline label-width="auto">
        <el-form-item label="集团名称">
          <el-input v-model="filterForm.customerGroup" placeholder="集团名称" clearable style="width:160px" />
        </el-form-item>
        <el-form-item label="使用单位">
          <el-input v-model="filterForm.customerUnit" placeholder="使用单位" clearable style="width:140px" />
        </el-form-item>
        <el-form-item label="片区">
          <el-select v-model="filterForm.region" placeholder="全部" clearable style="width:120px">
            <el-option label="广西片区" value="guangxi" />
            <el-option label="云南片区" value="yunnan" />
            <el-option label="贵州片区" value="guizhou" />
            <el-option label="其他片区" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="合同编号">
          <el-input v-model="filterForm.contractNo" placeholder="合同编号" clearable style="width:150px" />
        </el-form-item>
        <el-form-item label="产品类型">
          <el-select v-model="filterForm.productType" placeholder="全部" clearable style="width:100px">
            <el-option label="块磺" value="block" />
            <el-option label="粒磺" value="granular" />
          </el-select>
        </el-form-item>
        <el-form-item label="合同日期">
          <el-date-picker v-model="filterForm.contractDateStart" type="date" placeholder="开始" value-format="YYYY.MM.DD" style="width:140px" />
          <span class="date-sep">~</span>
          <el-date-picker v-model="filterForm.contractDateEnd" type="date" placeholder="结束" value-format="YYYY.MM.DD" style="width:140px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查 询</el-button>
          <el-button @click="handleReset">重 置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 统计摘要 -->
    <el-card class="summary-card" shadow="never">
      <div class="summary-stats">
        <div class="stat-item">
          <span class="stat-label">订单数</span>
          <span class="stat-value">{{ summary.total }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">总数量(吨)</span>
          <span class="stat-value">{{ summary.totalQty.toLocaleString() }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">合同总额(元)</span>
          <span class="stat-value amount">{{ summary.totalAmount.toLocaleString() }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">已回款(元)</span>
          <span class="stat-value paid">{{ summary.totalPaid.toLocaleString() }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">已开票(元)</span>
          <span class="stat-value invoiced">{{ summary.totalInvoiced.toLocaleString() }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">回款率</span>
          <span class="stat-value" :class="paymentRateClass">{{ paymentRate }}%</span>
        </div>
      </div>
    </el-card>

    <!-- 数据表格 -->
    <el-card shadow="never" class="table-card">
      <el-table
        :data="tableData"
        v-loading="loading"
        stripe
        border
        :header-cell-style="{ background: '#f5f7fa', color: '#303133', fontWeight: 600 }"
        row-key="id"
        style="width:100%"
        max-height="700px"
      >
        <!-- 合同信息 -->
        <el-table-column prop="contractNo" label="合同编号" width="160" fixed />
        <el-table-column prop="contractDate" label="合同日期" width="110" />

        <!-- 客户信息 -->
        <el-table-column label="集团名称" width="150" fixed>
          <template #default="{ row }">
            <span class="customer-group">{{ row.customerGroup }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="customerUnit" label="使用单位" width="100" />
        <el-table-column label="片区" width="90" align="center">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ regionLabels[row.region as Region] }}</el-tag>
          </template>
        </el-table-column>

        <!-- 产品信息 -->
        <el-table-column label="产品类型" width="80" align="center">
          <template #default="{ row }">
            <el-tag size="small" type="warning">{{ productTypeLabels[row.productType as SulfurProductType] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="块磺(吨)" width="90" align="right">
          <template #default="{ row }">{{ row.qtyBlock || '-' }}</template>
        </el-table-column>
        <el-table-column label="粒磺(吨)" width="90" align="right">
          <template #default="{ row }">{{ row.qtyGranular || '-' }}</template>
        </el-table-column>
        <el-table-column label="合计(吨)" width="90" align="right">
          <template #default="{ row }">
            <span class="highlight">{{ row.qtyTotal.toLocaleString() }}</span>
          </template>
        </el-table-column>

        <!-- 价格信息 -->
        <el-table-column label="单价(元/吨)" width="110" align="right">
          <template #default="{ row }">{{ row.unitPrice.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="金额(元)" width="130" align="right">
          <template #default="{ row }">
            <span class="amount">{{ row.totalAmount.toLocaleString() }}</span>
          </template>
        </el-table-column>

        <el-table-column label="送货方式" width="80" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="row.deliveryMethod === 'deliver' ? 'success' : 'info'">
              {{ deliveryMethodLabels[row.deliveryMethod as DeliveryMethod] }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 状态 -->
        <el-table-column label="订单状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="statusTagTypes[row.status as SulfurOrderStatus]">
              {{ statusLabels[row.status as SulfurOrderStatus] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="付款状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="paymentTagTypes[row.paymentStatus]">
              {{ paymentLabels[row.paymentStatus as PaymentStatus] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="开票状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="invoiceTagTypes[row.invoiceStatus]">
              {{ invoiceLabels[row.invoiceStatus as InvoiceStatus] }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 回款进度 -->
        <el-table-column label="回款进度" width="140" align="center">
          <template #default="{ row }">
            <div class="progress-wrap">
              <el-progress
                :percentage="row.paymentProgress"
                :stroke-width="12"
                :status="row.paymentProgress >= 100 ? 'success' : ''"
              />
              <span class="progress-text">{{ row.paymentProgress }}%</span>
            </div>
          </template>
        </el-table-column>

        <!-- 备注 -->
        <el-table-column prop="remark" label="备注" min-width="120" show-overflow-tooltip />

        <!-- 操作 -->
        <el-table-column label="操作" width="170" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          background
        />
      </div>
    </el-card>

    <!-- 查看详情抽屉 -->
    <SulfurOrderViewDialog
      :visible="viewDialogVisible"
      :order-id="viewingOrderId"
      @close="handleViewClose"
    />

    <!-- 新建/编辑订单弹窗 -->
    <SulfurOrderForm
      :visible="editDialogVisible"
      :order-data="editOrderData"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Goods } from '@element-plus/icons-vue'
import { getSulfurOrderList, createSulfurOrder, updateSulfurOrder, deleteSulfurOrder } from '@/api/huaweiSulfurOrders'
import type { SulfurOrder, SulfurOrderInput } from '@/types/sulfurOrder'
import type { Region, SulfurProductType, DeliveryMethod, SulfurOrderStatus, PaymentStatus, InvoiceStatus } from '@/types/sulfurOrder'
import {
  REGION_LABEL,
  ORDER_STATUS_LABEL,
  ORDER_STATUS_TAG_TYPE,
  PAYMENT_STATUS_LABEL,
  INVOICE_STATUS_LABEL,
  PRODUCT_TYPE_LABEL,
  DELIVERY_METHOD_LABEL
} from '@/types/sulfurOrder'
import SulfurOrderViewDialog from './SulfurOrderViewDialog.vue'
import SulfurOrderForm from './SulfurOrderForm.vue'

// ── 标签映射 ────────────────────
const regionLabels = REGION_LABEL
const statusLabels = ORDER_STATUS_LABEL
const statusTagTypes = ORDER_STATUS_TAG_TYPE
const paymentLabels = PAYMENT_STATUS_LABEL
const paymentTagTypes: Record<string, any> = {
  unpaid: 'danger',
  partial: 'warning',
  paid: 'success'
}
const invoiceLabels = INVOICE_STATUS_LABEL
const invoiceTagTypes: Record<string, any> = {
  none: 'info',
  partial: 'warning',
  done: 'success'
}
const productTypeLabels = PRODUCT_TYPE_LABEL
const deliveryMethodLabels = DELIVERY_METHOD_LABEL

// ── 响应式状态 ────────────────────
const tableData = ref<SulfurOrder[]>([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const summary = reactive({
  total: 0,
  totalQty: 0,
  totalAmount: 0,
  totalPaid: 0,
  totalInvoiced: 0
})

// ── 查看对话框 ────────────────────
const viewDialogVisible = ref(false)
const viewingOrderId = ref<string | null>(null)

// ── 编辑对话框 ────────────────────
const editDialogVisible = ref(false)
const editingOrderId = ref<string | null>(null)
const isEdit = ref(false)

const editOrderData = computed(() => {
  if (!isEdit.value || !editingOrderId.value) return null
  return tableData.value.find(o => o.id === editingOrderId.value) || null
})

// ── 搜索条件 ────────────────────
interface FilterForm {
  region: string
  customerGroup: string
  customerUnit: string
  contractNo: string
  productType: string
  contractDateStart: string
  contractDateEnd: string
}

const filterForm = reactive<FilterForm>({
  region: '',
  customerGroup: '',
  customerUnit: '',
  contractNo: '',
  productType: '',
  contractDateStart: '',
  contractDateEnd: ''
})

// ── 回款率计算 ────────────────────
const paymentRate = computed(() => {
  if (summary.totalAmount <= 0) return 0
  return Math.round(summary.totalPaid / summary.totalAmount * 100)
})

const paymentRateClass = computed(() => {
  const rate = paymentRate.value
  if (rate >= 80) return 'high'
  if (rate >= 40) return 'mid'
  return 'low'
})

// ── 获取数据 ────────────────────
async function fetchData() {
  loading.value = true
  try {
    const params = {
      page: page.value,
      pageSize: pageSize.value,
      region: (filterForm.region as Region) || undefined,
      customerGroup: filterForm.customerGroup || undefined,
      customerUnit: filterForm.customerUnit || undefined,
      contractNo: filterForm.contractNo || undefined,
      productType: (filterForm.productType as SulfurProductType) || undefined,
      contractDateStart: filterForm.contractDateStart || undefined,
      contractDateEnd: filterForm.contractDateEnd || undefined
    }
    const res = await getSulfurOrderList(params)
    if (res.code === 0) {
      tableData.value = res.data.list
      total.value = res.data.total
      summary.total = res.data.total
      summary.totalQty = res.data.totalQty
      summary.totalAmount = res.data.totalAmount
      summary.totalPaid = res.data.totalPaid
      summary.totalInvoiced = res.data.totalInvoiced
    }
  } finally {
    loading.value = false
  }
}

// ── 监听 ────────────────────
watch([page, pageSize], () => {
  fetchData()
})

onMounted(() => {
  fetchData()
})

// ── 方法 ────────────────────
const handleSearch = () => {
  page.value = 1
  fetchData()
}

const handleReset = () => {
  filterForm.region = ''
  filterForm.customerGroup = ''
  filterForm.customerUnit = ''
  filterForm.contractNo = ''
  filterForm.productType = ''
  filterForm.contractDateStart = ''
  filterForm.contractDateEnd = ''
  page.value = 1
  fetchData()
}

const handleCreate = () => {
  isEdit.value = false
  editingOrderId.value = null
  editDialogVisible.value = true
}

const handleView = (row: SulfurOrder) => {
  viewingOrderId.value = row.id
  viewDialogVisible.value = true
}

const handleEdit = (row: SulfurOrder) => {
  isEdit.value = true
  editingOrderId.value = row.id
  editDialogVisible.value = true
}

const handleViewClose = () => {
  viewDialogVisible.value = false
  viewingOrderId.value = null
}

const handleCancel = () => {
  editDialogVisible.value = false
  editingOrderId.value = null
}

async function handleSubmit(data: SulfurOrderInput) {
  try {
    if (isEdit.value && editingOrderId.value) {
      await updateSulfurOrder(editingOrderId.value, data)
      ElMessage.success('更新成功')
    } else {
      await createSulfurOrder(data)
      ElMessage.success('新建成功')
    }
  } catch (e) {
    ElMessage.error('操作失败')
    console.error(e)
  } finally {
    editDialogVisible.value = false
    editingOrderId.value = null
    await fetchData()
  }
}

async function handleDelete(row: SulfurOrder) {
  try {
    await ElMessageBox.confirm('确定删除该订单吗？', '提示')
    const res = await deleteSulfurOrder(row.id)
    if (res.code === 0) {
      ElMessage.success('删除成功')
      await fetchData()
    }
  } catch {
    /* cancelled */
  }
}
</script>

<style lang="scss" scoped>
.sulfur-order-list-page {
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

.filter-card {
  margin-bottom: 16px;
  border-radius: 12px;

  .date-sep {
    margin: 0 6px;
    color: #999;
  }
}

.summary-card {
  margin-bottom: 16px;
  border-radius: 12px;

  .summary-stats {
    display: flex;
    gap: 32px;
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

    &.amount { color: #f56c6c; }
    &.paid { color: #67c23a; }
    &.invoiced { color: #409eff; }
    &.high { color: #67c23a; }
    &.mid { color: #e6a23c; }
    &.low { color: #f56c6c; }
  }
}

.table-card {
  border-radius: 12px;
  overflow-x: auto;

  .pagination-wrap {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}

.customer-group {
  font-weight: 500;
  color: #303133;
}

.highlight {
  color: #e6a23c;
  font-weight: 600;
}

.amount {
  color: #f56c6c;
  font-weight: 600;
}

.progress-wrap {
  display: flex;
  align-items: center;
  gap: 8px;

  .progress-text {
    font-size: 12px;
    color: #606266;
    min-width: 35px;
  }
}
</style>
