<template>
  <div class="yahui-order-list">
    <!-- 页头 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon :size="28"><Document /></el-icon>
        </div>
        <div class="header-text">
          <h1 class="header-title">亚辉塑业 - 订单管理</h1>
          <p class="header-subtitle">编织袋/集装袋订单录入与状态跟踪</p>
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
            <el-option label="生产中" value="production" />
            <el-option label="已发货" value="shipped" />
            <el-option label="已开票" value="invoiced" />
            <el-option label="已完成" value="completed" />
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
            <div class="card-value">{{ statusCounts.production }}</div>
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
            <div class="card-label">剩余库存（条）</div>
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
        <el-table-column prop="customer" label="客户名称" min-width="150" show-overflow-tooltip fixed="left" />
        <el-table-column prop="contractNo" label="合同编号" min-width="130" show-overflow-tooltip />
        <el-table-column prop="contact" label="联系人" width="100" show-overflow-tooltip />
        <el-table-column prop="phone" label="联系电话" width="130" />
        <el-table-column label="产品类型" width="110" align="center">
          <template #default="{ row }">{{ row.lines?.[0]?.spec?.bagType || '-' }}</template>
        </el-table-column>
        <el-table-column label="产品名称" min-width="140" show-overflow-tooltip>
          <template #default="{ row }">{{ row.lines?.[0]?.productName || '-' }}</template>
        </el-table-column>
        <el-table-column prop="totalQty" label="订单数量（条）" width="130" align="right">
          <template #default="{ row }">{{ (row.totalQty || 0).toLocaleString('zh-CN') }}</template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="合同金额（元）" width="140" align="right">
          <template #default="{ row }">{{ (row.totalAmount || 0).toLocaleString('zh-CN') }}</template>
        </el-table-column>
        <el-table-column label="订单状态" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="stockRemain" label="剩余库存（条）" width="130" align="right">
          <template #default="{ row }">{{ (row.stockRemain || 0).toLocaleString('zh-CN') }}</template>
        </el-table-column>
        <el-table-column label="回款进度" width="120" align="center">
          <template #default="{ row }">
            <el-progress :percentage="row.paymentProgress || 0" :stroke-width="8" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link :icon="View" size="small" @click.stop="openDetail(row)">查看</el-button>
            <el-button type="warning" link :icon="Edit" size="small" @click.stop="handleEdit(row)">编辑</el-button>
            <el-button type="success" link :icon="Printer" size="small" @click.stop="handlePrint(row)">打印</el-button>
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
    <el-dialog v-model="detailVisible" title="订单详情" width="960px" :close-on-click-modal="false" draggable>
      <template v-if="currentRow">
        <el-descriptions :column="3" border size="small" label-width="110px">
          <el-descriptions-item label="客户名称">{{ currentRow.customer }}</el-descriptions-item>
          <el-descriptions-item label="联系人">{{ currentRow.contact }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ currentRow.phone }}</el-descriptions-item>
          <el-descriptions-item label="交货地址" :span="2">{{ currentRow.deliveryAddress }}</el-descriptions-item>
          <el-descriptions-item label="合同编号">{{ currentRow.contractNo }}</el-descriptions-item>
          <el-descriptions-item label="签订日期">{{ currentRow.contractDate }}</el-descriptions-item>
          <el-descriptions-item label="订单总量">{{ (currentRow.totalQty || 0).toLocaleString() }} 条</el-descriptions-item>
          <el-descriptions-item label="合同总金额">{{ (currentRow.totalAmount || 0).toLocaleString() }} 元</el-descriptions-item>
          <el-descriptions-item label="剩余库存">{{ (currentRow.stockRemain || 0).toLocaleString() }} 条</el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="statusTagType(currentRow.status)" size="small">{{ statusLabel(currentRow.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="开票状态">{{ currentRow.invoiceStatus === 'done' ? '已开票' : currentRow.invoiceStatus === 'pending' ? '开票中' : '未开票' }}</el-descriptions-item>
          <el-descriptions-item label="回款进度">{{ currentRow.paymentProgress }}%</el-descriptions-item>
          <el-descriptions-item label="期望交期">{{ currentRow.expectedFinishDate }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="3">{{ currentRow.remark || '-' }}</el-descriptions-item>
        </el-descriptions>

        <el-divider content-position="left">产品明细</el-divider>

        <el-table :data="currentRow.lines || []" border size="small" style="width:100%">
          <el-table-column type="index" label="序" width="45" align="center" />
          <el-table-column prop="productName" label="产品名称" min-width="130" />
          <el-table-column prop="brandName" label="品牌" width="80" />
          <el-table-column label="产品类型" width="90" align="center">
            <template #default="{ row }">{{ row.spec?.bagType || '-' }}</template>
          </el-table-column>
          <el-table-column label="规格" min-width="180">
            <template #default="{ row: l }">
              {{ l.spec?.width || '' }}×{{ l.spec?.length || '' }}cm /
              {{ l.spec?.gramWeight || '' }}g/m² /
              {{ l.spec?.material || '' }} /
              {{ l.spec?.color || '' }}
            </template>
          </el-table-column>
          <el-table-column label="覆膜/印刷" width="120">
            <template #default="{ row: l }">
              {{ l.spec?.lamination || '' }}<template v-if="l.spec?.printColors"> / {{ l.spec?.printColors }}色</template>
            </template>
          </el-table-column>
          <el-table-column label="数量(条)" width="100" align="right">
            <template #default="{ row: l }">{{ (l.qty || 0).toLocaleString() }}</template>
          </el-table-column>
          <el-table-column label="单价(元/条)" width="100" align="right">
            <template #default="{ row: l }">{{ (l.unitPrice || 0).toFixed(2) }}</template>
          </el-table-column>
          <el-table-column label="金额(元)" width="110" align="right">
            <template #default="{ row: l }">{{ (l.amount || 0).toLocaleString() }}</template>
          </el-table-column>
        </el-table>
      </template>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button type="success" :icon="Printer" @click="currentRow && handlePrint(currentRow)">打印计划单</el-button>
      </template>
    </el-dialog>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="formVisible" :title="isEdit ? '编辑订单' : '新增订单'" width="880px" :close-on-click-modal="false" draggable>
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px" size="default">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="客户名称" prop="customer">
              <el-input v-model="form.customer" placeholder="请输入客户名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系人" prop="contact">
              <el-input v-model="form.contact" placeholder="请输入联系人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="交货地址" prop="deliveryAddress">
              <el-input v-model="form.deliveryAddress" placeholder="请输入交货地址" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="合同编号" prop="contractNo">
              <el-input v-model="form.contractNo" placeholder="请输入合同编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="签订日期" prop="contractDate">
              <el-date-picker v-model="form.contractDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="期望交期" prop="expectedFinishDate">
              <el-date-picker v-model="form.expectedFinishDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="订单状态">
              <el-select v-model="form.status" style="width:100%">
                <el-option label="待审核" value="pending" />
                <el-option label="生产中" value="production" />
                <el-option label="已发货" value="shipped" />
                <el-option label="已开票" value="invoiced" />
                <el-option label="已完成" value="completed" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="开票状态">
              <el-select v-model="form.invoiceStatus" style="width:100%">
                <el-option label="未开票" value="none" />
                <el-option label="开票中" value="pending" />
                <el-option label="已开票" value="done" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="回款进度">
              <el-slider v-model="form.paymentProgress" :format-tooltip="(v: number) => v + '%'" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input v-model="form.remark" placeholder="备注信息" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">产品明细</el-divider>

        <div v-for="(line, idx) in form.lines" :key="idx" class="line-block">
          <div class="line-header">
            <span class="line-title">产品 {{ idx + 1 }}</span>
            <el-button v-if="form.lines.length > 1" type="danger" link :icon="Delete" @click="removeLine(idx)" />
          </div>
          <el-row :gutter="12">
            <el-col :span="8">
              <el-form-item label="产品名称" label-width="80px">
                <el-input v-model="line.productName" placeholder="如：编织袋（普通）" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="品牌" label-width="60px">
                <el-input v-model="line.brandName" placeholder="如：亚辉" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="产品类型" label-width="80px">
                <el-select v-model="line.bagType" placeholder="选择类型" style="width:100%">
                  <el-option label="编织袋" value="编织袋" />
                  <el-option label="集装袋" value="集装袋" />
                  <el-option label="方底阀口袋" value="方底阀口" />
                  <el-option label="其他" value="其他" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="幅宽(cm)" label-width="80px">
                <el-input-number v-model="line.width" :min="0" style="width:100%" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="长度(cm)" label-width="80px">
                <el-input-number v-model="line.length" :min="0" style="width:100%" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="克重(g/m²)" label-width="90px">
                <el-input-number v-model="line.gramWeight" :min="0" style="width:100%" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="材质" label-width="60px">
                <el-input v-model="line.material" placeholder="如：聚丙烯PP" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="颜色" label-width="60px">
                <el-input v-model="line.color" placeholder="如：白色" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="覆膜" label-width="60px">
                <el-select v-model="line.lamination" style="width:100%">
                  <el-option label="无" value="无" />
                  <el-option label="单面覆膜" value="单面覆膜" />
                  <el-option label="双面覆膜" value="双面覆膜" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="印刷颜色" label-width="80px">
                <el-input-number v-model="line.printColors" :min="0" :max="8" style="width:100%" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="底部样式" label-width="80px">
                <el-select v-model="line.bottomStyle" style="width:100%">
                  <el-option label="缝底" value="缝底" />
                  <el-option label="热切" value="热切" />
                  <el-option label="粘合" value="粘合" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="袋口样式" label-width="80px">
                <el-select v-model="line.mouthStyle" style="width:100%">
                  <el-option label="普通" value="普通" />
                  <el-option label="阀口" value="阀口" />
                  <el-option label="折边" value="折边" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="数量(条)" label-width="80px">
                <el-input-number v-model="line.qty" :min="0" :step="1000" style="width:100%" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="单价(元/条)" label-width="90px">
                <el-input-number v-model="line.unitPrice" :min="0" :precision="2" style="width:100%" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <el-button type="primary" plain :icon="Plus" @click="addLine" style="margin-bottom:12px">添加产品</el-button>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">{{ isEdit ? '保存修改' : '提交新增' }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { Document, Search, Refresh, View, Edit, Printer, Clock, SetUp, Van, Box, Plus, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useYahuiOrdersStore } from '@/stores/yahuiOrders'
import type { WovenBagOrder } from '@/stores/yahuiOrders'
import { ORDER_STATUS_LABEL, ORDER_STATUS_TAG_TYPE } from '@/types/order'

const store = useYahuiOrdersStore()

// ============================================================
// 搜索表单
// ============================================================
const searchForm = ref({ customerName: '', status: '', contractNo: '' })
const currentPage = ref(1)
const pageSize = ref(10)

const handleSearch = () => { currentPage.value = 1 }
const handleReset = () => { searchForm.value = { customerName: '', status: '', contractNo: '' }; currentPage.value = 1 }

// ============================================================
// 详情弹窗
// ============================================================
const detailVisible = ref(false)
const currentRow = ref<WovenBagOrder | null>(null)
const openDetail = (row: WovenBagOrder) => { currentRow.value = row; detailVisible.value = true }

// ============================================================
// 订单状态
// ============================================================
const statusLabel = (status: string): string => {
  return (ORDER_STATUS_LABEL as any)[status] || status
}

const statusTagType = (status: string): string => {
  return (ORDER_STATUS_TAG_TYPE as any)[status] || ''
}

// ============================================================
// 新增/编辑弹窗
// ============================================================
const formVisible = ref(false)
const isEdit = ref(false)
const editId = ref('')
const formRef = ref<FormInstance>()

function emptyLine() {
  return {
    productName: '', brandName: '', bagType: '编织袋' as '编织袋' | '集装袋' | '方底阀口' | '其他',
    width: 0, length: 0, gramWeight: 0, material: '', color: '',
    lamination: '无' as '无' | '单面覆膜' | '双面覆膜',
    printColors: 0, bottomStyle: '缝底' as '缝底' | '热切' | '粘合',
    mouthStyle: '普通' as '普通' | '阀口' | '折边',
    qty: 0, unit: '条', unitPrice: 0
  }
}

const form = reactive({
  customer: '', contact: '', phone: '', deliveryAddress: '',
  contractDate: '', contractNo: '', expectedFinishDate: '',
  status: 'pending' as 'pending' | 'production' | 'shipped' | 'invoiced' | 'completed',
  invoiceStatus: 'none' as 'none' | 'pending' | 'done',
  paymentProgress: 0, remark: '',
  lines: [emptyLine()]
})

const formRules: FormRules = {
  customer: [{ required: true, message: '请输入客户名称', trigger: 'blur' }],
  contact: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
  contractDate: [{ required: true, message: '请选择签订日期', trigger: 'change' }],
  contractNo: [{ required: true, message: '请输入合同编号', trigger: 'blur' }]
}

const addLine = () => form.lines.push(emptyLine())
const removeLine = (idx: number) => {
  if (form.lines.length > 1) form.lines.splice(idx, 1)
}

function resetForm() {
  form.customer = ''
  form.contact = ''
  form.phone = ''
  form.deliveryAddress = ''
  form.contractDate = ''
  form.contractNo = ''
  form.expectedFinishDate = ''
  form.status = 'pending'
  form.invoiceStatus = 'none'
  form.paymentProgress = 0
  form.remark = ''
  form.lines = [emptyLine()]
}

const handleAdd = () => {
  isEdit.value = false
  editId.value = ''
  resetForm()
  formVisible.value = true
}

const handleEdit = (row: WovenBagOrder) => {
  isEdit.value = true
  editId.value = row.id
  form.customer = row.customer
  form.contact = row.contact
  form.phone = row.phone
  form.deliveryAddress = row.deliveryAddress
  form.contractNo = row.contractNo
  form.contractDate = row.contractDate
  form.expectedFinishDate = row.expectedFinishDate
  form.status = row.status
  form.invoiceStatus = row.invoiceStatus
  form.paymentProgress = row.paymentProgress
  form.remark = row.remark
  if (row.lines.length > 0) {
    form.lines = row.lines.map(l => ({
      productName: l.productName,
      brandName: l.brandName,
      bagType: l.spec?.bagType || '编织袋',
      width: l.spec?.width || 0,
      length: l.spec?.length || 0,
      gramWeight: l.spec?.gramWeight || 0,
      material: l.spec?.material || '',
      color: l.spec?.color || '',
      lamination: l.spec?.lamination || '无',
      printColors: l.spec?.printColors || 0,
      bottomStyle: l.spec?.bottomStyle || '缝底',
      mouthStyle: l.spec?.mouthStyle || '普通',
      qty: l.qty,
      unit: l.unit,
      unitPrice: l.unitPrice
    }))
  }
  formVisible.value = true
}

const submitForm = async () => {
  await formRef.value?.validate()
  if (isEdit.value && editId.value) {
    store.updateOrder(editId.value, {
      customer: form.customer,
      contact: form.contact,
      phone: form.phone,
      deliveryAddress: form.deliveryAddress,
      contractNo: form.contractNo,
      contractDate: form.contractDate,
      expectedFinishDate: form.expectedFinishDate,
      status: form.status,
      invoiceStatus: form.invoiceStatus,
      paymentProgress: form.paymentProgress,
      remark: form.remark,
      lines: form.lines.map((l, i) => ({
        productSeq: i + 1,
        brandName: l.brandName,
        productName: l.productName,
        spec: {
          bagType: l.bagType,
          width: l.width, length: l.length, gramWeight: l.gramWeight,
          material: l.material, color: l.color, lamination: l.lamination,
          printColors: l.printColors, printContent: '',
          warpTension: 0, weftTension: 0,
          bottomStyle: l.bottomStyle, mouthStyle: l.mouthStyle
        },
        qty: l.qty, unit: l.unit, unitPrice: l.unitPrice,
        amount: Math.round(l.qty * l.unitPrice * 100) / 100
      }))
    })
    ElMessage.success('订单已更新')
  } else {
    store.addOrder({
      customer: form.customer,
      contact: form.contact,
      phone: form.phone,
      deliveryAddress: form.deliveryAddress,
      contractNo: form.contractNo,
      contractDate: form.contractDate,
      expectedFinishDate: form.expectedFinishDate,
      lines: form.lines.map((l, i) => ({
        productSeq: i + 1,
        brandName: l.brandName,
        productName: l.productName,
        spec: {
          bagType: l.bagType,
          width: l.width, length: l.length, gramWeight: l.gramWeight,
          material: l.material, color: l.color, lamination: l.lamination,
          printColors: l.printColors, printContent: '',
          warpTension: 0, weftTension: 0,
          bottomStyle: l.bottomStyle, mouthStyle: l.mouthStyle
        },
        qty: l.qty, unit: l.unit, unitPrice: l.unitPrice,
        amount: Math.round(l.qty * l.unitPrice * 100) / 100
      })),
      remark: form.remark
    })
    ElMessage.success('订单已新增')
  }
  formVisible.value = false
}

// ============================================================
// 打印生产计划单
// ============================================================
const handlePrint = (row: WovenBagOrder) => {
  const printWindow = window.open('', '_blank', 'width=900,height=700')
  if (!printWindow) { ElMessage.warning('请允许弹出窗口'); return }

  const lines = row.lines || []
  const linesHtml = lines.map((l, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${l.productName || ''}</td>
      <td>${l.brandName || ''}</td>
      <td>${l.spec?.bagType || ''}</td>
      <td>${l.spec?.width || ''}×${l.spec?.length || ''}cm</td>
      <td>${l.spec?.gramWeight || ''}g/m²</td>
      <td>${l.spec?.material || ''}</td>
      <td>${l.spec?.color || ''}</td>
      <td>${l.spec?.lamination || ''}</td>
      <td>${l.spec?.bottomStyle || ''}</td>
      <td>${l.spec?.mouthStyle || ''}</td>
      <td>${(l.qty || 0).toLocaleString()}</td>
      <td>${(l.unitPrice || 0).toFixed(2)}</td>
      <td>${(l.amount || 0).toLocaleString()}</td>
    </tr>
  `).join('')

  printWindow.document.write(`<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8"/>
<title>生产计划单 - ${row.orderNo}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Microsoft YaHei', SimSun, sans-serif; font-size: 13px; color: #000; padding: 20px; }
  .title { text-align: center; font-size: 20px; font-weight: bold; margin-bottom: 6px; }
  .subtitle { text-align: center; font-size: 13px; color: #666; margin-bottom: 16px; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4px 16px; margin-bottom: 12px; border: 1px solid #999; padding: 10px; }
  .info-item { display: flex; gap: 6px; }
  .info-label { color: #666; white-space: nowrap; min-width: 80px; }
  .info-value { font-weight: 600; }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
  th { background: #e8f0fe; text-align: center; padding: 6px 4px; border: 1px solid #999; font-weight: 600; }
  td { padding: 5px 4px; border: 1px solid #ccc; text-align: center; }
  .footer { margin-top: 20px; display: flex; justify-content: space-between; font-size: 12px; }
  .sign-area { display: flex; gap: 40px; }
  .sign-item { display: flex; gap: 8px; align-items: flex-end; }
  .sign-line { border-bottom: 1px solid #000; width: 100px; height: 20px; }
  @media print { body { padding: 10px; } button { display: none; } }
</style>
</head>
<body>
  <div class="title">亚辉塑业有限公司 生产计划单</div>
  <div class="subtitle">编织袋/集装袋生产计划</div>
  <div class="info-grid">
    <div class="info-item"><span class="info-label">订单编号：</span><span class="info-value">${row.orderNo}</span></div>
    <div class="info-item"><span class="info-label">合同编号：</span><span class="info-value">${row.contractNo}</span></div>
    <div class="info-item"><span class="info-label">签订日期：</span><span class="info-value">${row.contractDate}</span></div>
    <div class="info-item"><span class="info-label">客户名称：</span><span class="info-value">${row.customer}</span></div>
    <div class="info-item"><span class="info-label">联系人：</span><span class="info-value">${row.contact}</span></div>
    <div class="info-item"><span class="info-label">期望交期：</span><span class="info-value">${row.expectedFinishDate}</span></div>
    <div class="info-item"><span class="info-label">总数量：</span><span class="info-value">${(row.totalQty || 0).toLocaleString()} 条</span></div>
    <div class="info-item"><span class="info-label">总金额：</span><span class="info-value">${(row.totalAmount || 0).toLocaleString()} 元</span></div>
    <div class="info-item"><span class="info-label">备注：</span><span class="info-value">${row.remark || ''}</span></div>
  </div>
  <table>
    <thead>
      <tr>
        <th width="35">序号</th>
        <th>产品名称</th>
        <th>品牌</th>
        <th>类型</th>
        <th>幅宽×长度</th>
        <th>克重</th>
        <th>材质</th>
        <th>颜色</th>
        <th>覆膜</th>
        <th>底部</th>
        <th>袋口</th>
        <th>数量(条)</th>
        <th>单价(元/条)</th>
        <th>金额(元)</th>
      </tr>
    </thead>
    <tbody>${linesHtml || '<tr><td colspan="14">暂无产品明细</td></tr>'}</tbody>
    <tfoot>
      <tr>
        <td colspan="11" style="text-align:right;font-weight:bold;">合计</td>
        <td style="font-weight:bold;">${(row.totalQty || 0).toLocaleString()}</td>
        <td></td>
        <td style="font-weight:bold;">${(row.totalAmount || 0).toLocaleString()}</td>
      </tr>
    </tfoot>
  </table>
  <div class="footer">
    <div class="sign-area">
      <div class="sign-item"><span>制单人：</span><div class="sign-line"></div></div>
      <div class="sign-item"><span>生产主管：</span><div class="sign-line"></div></div>
      <div class="sign-item"><span>审核人：</span><div class="sign-line"></div></div>
    </div>
    <span>打印日期：${new Date().toLocaleDateString('zh-CN')}</span>
  </div>
  <script>window.onload = function() { window.print(); }<\/script>
</body>
</html>`)
  printWindow.document.close()
}

// ============================================================
// 过滤逻辑 - 接入 Pinia store
// ============================================================
const filteredData = computed(() => {
  return store.list.filter((row) => {
    if (searchForm.value.customerName && !row.customer.includes(searchForm.value.customerName)) return false
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
    production: data.filter(r => r.status === 'production').length,
    shipped: data.filter(r => r.status === 'shipped').length,
    invoiced: data.filter(r => r.status === 'invoiced').length,
    completed: data.filter(r => r.status === 'completed').length
  }
})

const totalStock = computed(() => {
  return filteredData.value.reduce((s, r) => s + (r.stockRemain || 0), 0).toLocaleString('zh-CN')
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

.yahui-order-list {
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

// 产品明细块
.line-block {
  border: 1px solid $color-gray-200;
  border-radius: $border-radius-base;
  padding: $spacing-3 $spacing-4;
  margin-bottom: $spacing-3;
  background: $color-gray-50;

  .line-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $spacing-3;

    .line-title {
      font-weight: $font-weight-semibold;
      color: $color-primary;
      font-size: $font-size-sm;
    }
  }
}
</style>
