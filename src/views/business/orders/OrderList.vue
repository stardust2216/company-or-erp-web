<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-header-main">
        <h1 class="page-title">订单管理</h1>
        <p class="page-desc">按《结构说明》：子公司维度、订单状态、开票与回款筛选；支持产品明细与生产计划单。</p>
      </div>
      <div class="page-actions">
        <el-button type="primary" @click="openCreateDialog">
          <el-icon><Plus /></el-icon>
          新建订单
        </el-button>
      </div>
    </div>
    <div class="page-body">
      <div class="filter-bar">
        <el-select v-model="queryDraft.subsidiaryId" clearable placeholder="子公司" style="width: 140px">
          <el-option label="全部子公司" value="" />
          <el-option v-for="sid in SUBSIDIARY_IDS" :key="sid" :label="SUBSIDIARIES[sid].name" :value="sid" />
        </el-select>
        <el-input
          v-model="queryDraft.keyword"
          clearable
          placeholder="订单号 / 客户名称"
          style="width: 220px"
          @keyup.enter="applyQuery"
        />
        <el-select v-model="queryDraft.status" clearable placeholder="订单状态" style="width: 130px">
          <el-option label="全部状态" value="" />
          <el-option label="待审核" value="pending" />
          <el-option label="生产中" value="production" />
          <el-option label="已完成" value="completed" />
          <el-option label="已发货" value="shipped" />
        </el-select>
        <el-select v-model="queryDraft.invoiceStatus" clearable placeholder="开票状态" style="width: 120px">
          <el-option label="全部" value="" />
          <el-option label="未开票" value="none" />
          <el-option label="开票中" value="pending" />
          <el-option label="已开票" value="done" />
        </el-select>
        <el-select v-model="queryDraft.paymentBucket" clearable placeholder="回款进度" style="width: 130px">
          <el-option label="全部" value="" />
          <el-option label="0% ~ 39%" value="low" />
          <el-option label="40% ~ 69%" value="mid" />
          <el-option label="70% ~ 100%" value="high" />
        </el-select>
        <el-button type="primary" @click="applyQuery">查询</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </div>
      <div class="table-section">
        <el-table :data="pagedOrders" stripe max-height="1000" style="width: 100%">
          <el-table-column prop="orderNo" label="订单号" min-width="148" />
          <el-table-column label="子公司" width="108">
            <template #default="{ row }">{{ subsidiaryLabel(row.subsidiaryId) }}</template>
          </el-table-column>
          <el-table-column prop="customer" label="客户名称" min-width="140" show-overflow-tooltip />
          <el-table-column label="金额" min-width="112" align="right">
            <template #default="{ row }">¥{{ row.amount.toLocaleString() }}</template>
          </el-table-column>
          <el-table-column label="订单状态" width="96" align="center">
            <template #default="{ row }">
              <el-tag :type="ORDER_STATUS_TAG_TYPE[row.status as OrderStatus]">{{ ORDER_STATUS_LABEL[row.status as OrderStatus] }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="开票" width="88" align="center">
            <template #default="{ row }">
              <el-tag size="small" :type="INVOICE_STATUS_TAG_TYPE[row.invoiceStatus as InvoiceStatus]">
                {{ INVOICE_STATUS_LABEL[row.invoiceStatus as InvoiceStatus] }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="回款" min-width="120">
            <template #default="{ row }">
              <el-progress :percentage="row.paymentProgress" :stroke-width="10" :color="paymentColor(row.paymentProgress)" />
            </template>
          </el-table-column>
          <el-table-column prop="contact" label="联系人" width="88" />
          <el-table-column prop="createdAt" label="创建时间" width="160" />
          <el-table-column label="操作" width="248" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="goDetail(row.id)">查看</el-button>
              <el-button type="primary" link @click="openEditDialog(row)">编辑</el-button>
              <el-button
                v-if="canPrintProductionSheet(row.status)"
                type="primary"
                link
                @click="goProductionSheet(row.id)"
              >
                计划单
              </el-button>
              <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination-bar">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="filteredTotal"
            :pager-count="7"
            layout="total, sizes, prev, pager, next, jumper"
            background
            @size-change="onPageSizeChange"
          />
        </div>
      </div>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'create' ? '新建订单' : '编辑订单'"
      width="780px"
      top="6vh"
      destroy-on-close
      @closed="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
        <el-form-item v-if="dialogMode === 'edit'" label="订单号">
          <el-input v-model="form.orderNo" disabled />
        </el-form-item>
        <el-form-item label="子公司" prop="subsidiaryId">
          <el-select v-model="form.subsidiaryId" placeholder="请选择子公司" style="width: 100%">
            <el-option v-for="sid in SUBSIDIARY_IDS" :key="sid" :label="`${SUBSIDIARIES[sid].name}（${SUBSIDIARIES[sid].scope}）`" :value="sid" />
          </el-select>
        </el-form-item>
        <el-form-item label="客户名称" prop="customer">
          <el-input v-model="form.customer" maxlength="80" show-word-limit placeholder="客户名称" />
        </el-form-item>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="交货地址" prop="deliveryAddress">
              <el-input v-model="form.deliveryAddress" maxlength="120" placeholder="收货地址" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="计划完成" prop="expectedFinishDate">
              <el-input v-model="form.expectedFinishDate" placeholder="如 2024-06-30" maxlength="20" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="产品明细" required>
          <div class="lines-wrap">
            <el-table :data="formLines" border size="small" style="width: 100%">
              <el-table-column label="产品名称" min-width="120">
                <template #default="{ row }">
                  <el-input v-model="row.productName" placeholder="名称" maxlength="60" />
                </template>
              </el-table-column>
              <el-table-column label="规格" min-width="100">
                <template #default="{ row }">
                  <el-input v-model="row.spec" placeholder="规格" maxlength="80" />
                </template>
              </el-table-column>
              <el-table-column label="数量" width="100">
                <template #default="{ row }">
                  <el-input-number v-model="row.qty" :min="0" :max="9999999" :controls="false" style="width: 100%" />
                </template>
              </el-table-column>
              <el-table-column label="单位" width="72">
                <template #default="{ row }">
                  <el-input v-model="row.unit" maxlength="6" />
                </template>
              </el-table-column>
              <el-table-column label="单价" width="110">
                <template #default="{ row }">
                  <el-input-number v-model="row.unitPrice" :min="0" :precision="2" :controls="false" style="width: 100%" />
                </template>
              </el-table-column>
              <el-table-column label="" width="56" align="center">
                <template #default="{ $index }">
                  <el-button v-if="formLines.length > 1" type="danger" link @click="removeLine($index)">删</el-button>
                </template>
              </el-table-column>
            </el-table>
            <div class="lines-toolbar">
              <el-button type="primary" text @click="addLine">+ 增加一行</el-button>
              <span class="line-total">明细合计：<b>¥{{ lineTotal.toLocaleString() }}</b></span>
            </div>
          </div>
        </el-form-item>
        <el-row :gutter="12">
          <el-col :span="8">
            <el-form-item label="订单状态" prop="status">
              <el-select v-model="form.status" placeholder="状态" style="width: 100%">
                <el-option label="待审核" value="pending" />
                <el-option label="生产中" value="production" />
                <el-option label="已完成" value="completed" />
                <el-option label="已发货" value="shipped" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="开票状态" prop="invoiceStatus">
              <el-select v-model="form.invoiceStatus" style="width: 100%">
                <el-option label="未开票" value="none" />
                <el-option label="开票中" value="pending" />
                <el-option label="已开票" value="done" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="回款进度">
              <el-slider v-model="form.paymentProgress" :marks="{ 0: '0', 50: '50', 100: '100' }" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="联系人" prop="contact">
          <el-input v-model="form.contact" maxlength="20" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" maxlength="20" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="2" maxlength="200" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { SUBSIDIARIES, SUBSIDIARY_IDS, subsidiaryLabel, type SubsidiaryId } from '@/constants/subsidiary'
import { useOrdersStore, type Order, type OrderStatus, type InvoiceStatus, type OrderLine } from '@/stores/orders'
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_TAG_TYPE,
  INVOICE_STATUS_LABEL,
  INVOICE_STATUS_TAG_TYPE,
  canPrintProductionSheet,
  sumOrderLines
} from '@/types'

const router = useRouter()
const route = useRoute()
const ordersStore = useOrdersStore()
const { list } = storeToRefs(ordersStore)

type PaymentBucket = '' | 'low' | 'mid' | 'high'

const queryDraft = reactive({
  subsidiaryId: '' as '' | (typeof SUBSIDIARY_IDS)[number],
  keyword: '',
  status: '' as '' | OrderStatus,
  invoiceStatus: '' as '' | InvoiceStatus,
  paymentBucket: '' as PaymentBucket
})

const queryApplied = reactive({ ...queryDraft })

function matchPaymentBucket(p: number, bucket: PaymentBucket) {
  if (!bucket) return true
  if (bucket === 'low') return p < 40
  if (bucket === 'mid') return p >= 40 && p < 70
  if (bucket === 'high') return p >= 70
  return true
}

const displayedOrders = computed(() => {
  const kw = queryApplied.keyword.trim().toLowerCase()
  const st = queryApplied.status
  const sub = queryApplied.subsidiaryId
  const inv = queryApplied.invoiceStatus
  const bucket = queryApplied.paymentBucket
  return list.value.filter((o) => {
    const byKw =
      !kw ||
      o.orderNo.toLowerCase().includes(kw) ||
      o.customer.toLowerCase().includes(kw)
    const byStatus = !st || o.status === st
    const bySub = !sub || o.subsidiaryId === sub
    const byInv = !inv || o.invoiceStatus === inv
    const byPay = matchPaymentBucket(o.paymentProgress, bucket)
    return byKw && byStatus && bySub && byInv && byPay
  })
})

const filteredTotal = computed(() => displayedOrders.value.length)

const currentPage = ref(1)
const pageSize = ref(10)

const pagedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return displayedOrders.value.slice(start, start + pageSize.value)
})

function onPageSizeChange() {
  currentPage.value = 1
}

watch(filteredTotal, (n) => {
  const maxPage = Math.max(1, Math.ceil(n / pageSize.value))
  if (currentPage.value > maxPage) {
    currentPage.value = maxPage
  }
})

function applyQuery() {
  Object.assign(queryApplied, queryDraft)
  currentPage.value = 1
}

function resetQuery() {
  queryDraft.subsidiaryId = ''
  queryDraft.keyword = ''
  queryDraft.status = ''
  queryDraft.invoiceStatus = ''
  queryDraft.paymentBucket = ''
  Object.assign(queryApplied, queryDraft)
  currentPage.value = 1
}

function paymentColor(p: number) {
  if (p >= 80) return '#06d6a0'
  if (p >= 40) return '#0070f3'
  return '#e6a23c'
}

const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const editingId = ref<string | null>(null)
const submitting = ref(false)
const formRef = ref<FormInstance>()
const formLines = ref<OrderLine[]>([])

const form = reactive({
  orderNo: '',
  subsidiaryId: '' as '' | typeof SUBSIDIARY_IDS[number],
  customer: '',
  contact: '',
  phone: '',
  remark: '',
  deliveryAddress: '',
  expectedFinishDate: '',
  status: 'pending' as OrderStatus,
  invoiceStatus: 'none' as InvoiceStatus,
  paymentProgress: 0
})

const lineTotal = computed(() => sumOrderLines(formLines.value))

const formRules: FormRules = {
  subsidiaryId: [{ required: true, message: '请选择子公司', trigger: 'change' }],
  customer: [{ required: true, message: '请输入客户名称', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  invoiceStatus: [{ required: true, message: '请选择开票状态', trigger: 'change' }],
  contact: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }]
}

function emptyLine(): OrderLine {
  return {
    id: `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    productName: '',
    spec: '',
    qty: 0,
    unit: '条',
    unitPrice: 0
  }
}

function resetForm() {
  editingId.value = null
  form.orderNo = ''
  form.subsidiaryId = SUBSIDIARY_IDS[0]
  form.customer = ''
  form.contact = ''
  form.phone = ''
  form.remark = ''
  form.deliveryAddress = ''
  form.expectedFinishDate = ''
  form.status = 'pending'
  form.invoiceStatus = 'none'
  form.paymentProgress = 0
  formLines.value = [emptyLine()]
  formRef.value?.clearValidate()
}

function addLine() {
  formLines.value.push(emptyLine())
}

function removeLine(index: number) {
  formLines.value.splice(index, 1)
}

function openCreateDialog() {
  dialogMode.value = 'create'
  resetForm()
  dialogVisible.value = true
}

function openEditDialog(row: Order) {
  dialogMode.value = 'edit'
  editingId.value = row.id
  form.orderNo = row.orderNo
  form.subsidiaryId = row.subsidiaryId
  form.customer = row.customer
  form.contact = row.contact
  form.phone = row.phone
  form.remark = row.remark
  form.deliveryAddress = row.deliveryAddress
  form.expectedFinishDate = row.expectedFinishDate
  form.status = row.status
  form.invoiceStatus = row.invoiceStatus
  form.paymentProgress = row.paymentProgress
  formLines.value = row.lines.map((l) => ({ ...l }))
  dialogVisible.value = true
}

function validateLines(): boolean {
  const rows = formLines.value
  if (!rows.length) {
    ElMessage.warning('请至少保留一行产品明细')
    return false
  }
  for (const r of rows) {
    if (!r.productName?.trim()) {
      ElMessage.warning('请填写每行的产品名称')
      return false
    }
    if (!r.qty || r.qty <= 0) {
      ElMessage.warning('数量须大于 0')
      return false
    }
    if (r.unitPrice == null || r.unitPrice < 0) {
      ElMessage.warning('单价不能为负')
      return false
    }
  }
  if (lineTotal.value <= 0) {
    ElMessage.warning('明细合计金额须大于 0')
    return false
  }
  return true
}

function submitForm() {
  formRef.value?.validate((ok) => {
    if (!ok || !validateLines()) return
    submitting.value = true
    try {
      if (dialogMode.value === 'create') {
        ordersStore.addOrder({
          subsidiaryId: form.subsidiaryId as SubsidiaryId,
          customer: form.customer,
          contact: form.contact,
          phone: form.phone,
          remark: form.remark,
          deliveryAddress: form.deliveryAddress,
          expectedFinishDate: form.expectedFinishDate,
          status: form.status,
          invoiceStatus: form.invoiceStatus,
          paymentProgress: form.paymentProgress,
          lines: formLines.value.map(({ id, productName, spec, qty, unit, unitPrice }) => ({
            id, productName, spec, qty, unit, unitPrice
          }))
        })
        ElMessage.success('订单已创建')
      } else if (editingId.value) {
        ordersStore.updateOrder(editingId.value, {
          subsidiaryId: form.subsidiaryId as SubsidiaryId,
          customer: form.customer,
          contact: form.contact,
          phone: form.phone,
          remark: form.remark,
          deliveryAddress: form.deliveryAddress,
          expectedFinishDate: form.expectedFinishDate,
          status: form.status,
          invoiceStatus: form.invoiceStatus,
          paymentProgress: form.paymentProgress,
          lines: formLines.value.map(({ id, productName, spec, qty, unit, unitPrice }) => ({
            id, productName, spec, qty, unit, unitPrice
          }))
        })
        ElMessage.success('已保存修改')
      }
      dialogVisible.value = false
    } finally {
      submitting.value = false
    }
  })
}

function goDetail(id: string) {
  router.push({ name: 'OrderDetail', params: { id } })
}

function goProductionSheet(id: string) {
  router.push({ name: 'OrderProductionSheet', params: { id } })
}

function handleDelete(row: Order) {
  ElMessageBox.confirm(`确定删除订单「${row.orderNo}」吗？`, '删除确认', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消'
  })
    .then(() => {
      ordersStore.removeOrder(row.id)
      ElMessage.success('已删除')
    })
    .catch(() => {})
}

watch(
  () => route.query.edit,
  (id) => {
    if (typeof id !== 'string' || !id) return
    const row = ordersStore.getById(id)
    if (row) openEditDialog(row)
    router.replace({ path: route.path, query: {} })
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
@use '@/scss/variables' as *;
@use '@/scss/mixins' as *;

.page-container {
  @include custom-scrollbar;
}

.page-header {
  @include industrial-card;
  padding: 20px 24px;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;

  .page-header-main {
    min-width: 0;
  }

  .page-title {
    font-size: 18px;
    font-weight: 600;
    color: #1a1a2e;
    margin: 0 0 8px;
  }

  .page-desc {
    margin: 0;
    font-size: 13px;
    color: #606266;
    line-height: 1.5;
    max-width: 720px;
  }
}

.page-body {
  @include industrial-card;
  padding: 20px;
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  align-items: center;
}

.table-section {
  min-width: 0;
}

.pagination-bar {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  padding-top: 4px;
  flex-wrap: wrap;
  gap: 8px;
}

.lines-wrap {
  width: 100%;
}

.lines-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  flex-wrap: wrap;
  gap: 8px;
}

.line-total {
  font-size: 13px;
  color: #606266;
  b {
    color: #0070f3;
  }
}
</style>
