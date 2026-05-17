<template>
  <div class="longzhou-production-plan">
    <!-- 页头 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon :size="28"><SetUp /></el-icon>
        </div>
        <div class="header-text">
          <h1 class="header-title">龙州塑业 - 生产计划单</h1>
          <p class="header-subtitle">根据订单内容生成可打印的生产计划单</p>
        </div>
      </div>
      <div class="header-right">
        <el-button type="primary" :icon="Plus" @click="handleAdd">新增计划单</el-button>
        <el-button :icon="Printer" @click="handlePrint">打印计划单</el-button>
      </div>
    </div>

    <!-- 搜索区 -->
    <el-card shadow="never" class="search-card">
      <el-form :model="searchForm" inline label-width="auto" size="default">
        <el-form-item label="计划单号">
          <el-input v-model="searchForm.planNo" placeholder="请输入计划单号" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="订单编号">
          <el-input v-model="searchForm.orderNo" placeholder="请输入订单编号" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 160px">
            <el-option label="待安排" value="pending" />
            <el-option label="生产中" value="producing" />
            <el-option label="已完成" value="completed" />
          </el-select>
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

    <!-- 计划单表格 -->
    <el-card shadow="never" class="table-card">
      <template #header>
        <div class="card-header">
          <span class="header-title-text">生产计划单列表</span>
        </div>
      </template>

      <el-table :data="paginatedData" border stripe style="width: 100%" max-height="800"
        :header-cell-style="headerCellStyle" size="small" highlight-current-row>
        <el-table-column type="index" label="序号" width="55" align="center" fixed="left" />
        <el-table-column prop="planNo" label="计划单号" min-width="160" show-overflow-tooltip fixed="left" />
        <el-table-column prop="orderNo" label="关联订单号" min-width="160" show-overflow-tooltip />
        <el-table-column prop="customerName" label="客户名称" min-width="130" />
        <el-table-column prop="productName" label="产品名称" min-width="150" />
        <el-table-column prop="spec" label="规格" min-width="120" />
        <el-table-column prop="quantity" label="计划数量（套）" width="140" align="right" />
        <el-table-column prop="workshop" label="生产车间" width="120" align="center" />
        <el-table-column prop="process" label="工序" min-width="150" show-overflow-tooltip />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'completed' ? 'success' : row.status === 'producing' ? 'warning' : 'info'" size="small">
              {{ row.status === 'completed' ? '已完成' : row.status === 'producing' ? '生产中' : '待安排' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="planDate" label="计划日期" width="110" align="center" />
        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link :icon="View" size="small" @click.stop="openDetail(row)">查看</el-button>
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

    <!-- 详情/打印预览弹窗 -->
    <el-dialog v-model="detailVisible" title="生产计划单" width="900px" :close-on-click-modal="false" draggable>
      <template v-if="currentRow">
        <div class="print-content" id="print-content">
          <div class="print-header">
            <h2>龙州塑业 - 生产计划单</h2>
            <p>计划单号：{{ currentRow.planNo }}</p>
          </div>
          <el-descriptions :column="2" border size="small" label-width="120px">
            <el-descriptions-item label="计划单号">{{ currentRow.planNo }}</el-descriptions-item>
            <el-descriptions-item label="关联订单号">{{ currentRow.orderNo }}</el-descriptions-item>
            <el-descriptions-item label="客户名称">{{ currentRow.customerName }}</el-descriptions-item>
            <el-descriptions-item label="计划日期">{{ currentRow.planDate }}</el-descriptions-item>
            <el-descriptions-item label="产品名称" :span="2">{{ currentRow.productName }}</el-descriptions-item>
            <el-descriptions-item label="规格">{{ currentRow.spec }}</el-descriptions-item>
            <el-descriptions-item label="计划数量">{{ currentRow.quantity }} 套</el-descriptions-item>
            <el-descriptions-item label="生产车间">{{ currentRow.workshop }}</el-descriptions-item>
            <el-descriptions-item label="工序">{{ currentRow.process }}</el-descriptions-item>
            <el-descriptions-item label="备注" :span="2">{{ currentRow.remark }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </template>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button type="primary" :icon="Printer" @click="handlePrint">打印</el-button>
      </template>
    </el-dialog>
    <!-- 新增计划单弹窗 -->
    <el-dialog v-model="addFormVisible" title="新增生产计划单" width="720px" :close-on-click-modal="false" draggable>
      <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="100px" size="default">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="关联订单" prop="orderNo">
              <el-select v-model="addForm.orderNo" placeholder="请选择关联订单" clearable filterable style="width:100%" @change="onOrderSelect">
                <el-option v-for="opt in orderOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="计划日期" prop="planDate">
              <el-date-picker v-model="addForm.planDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户名称" prop="customerName">
              <el-input v-model="addForm.customerName" placeholder="客户名称（自动填充）" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="产品名称" prop="productName">
              <el-input v-model="addForm.productName" placeholder="产品名称（自动填充）" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="规格">
              <el-input v-model="addForm.spec" placeholder="规格（如：55*105）" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="计划数量" prop="quantity">
              <el-input-number v-model="addForm.quantity" :min="0" :step="1000" placeholder="套" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="生产车间" prop="workshop">
              <el-select v-model="addForm.workshop" placeholder="请选择车间" style="width:100%">
                <el-option label="拉丝车间" value="拉丝车间" />
                <el-option label="圆织车间" value="圆织车间" />
                <el-option label="吹膜车间" value="吹膜车间" />
                <el-option label="一体机车间" value="一体机车间" />
                <el-option label="普印车间" value="普印车间" />
                <el-option label="涂膜车间" value="涂膜车间" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="生产工序">
              <el-input v-model="addForm.process" placeholder="如：拉丝→圆织→普印→打包" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input v-model="addForm.remark" type="textarea" :rows="2" placeholder="备注信息" clearable />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="addFormVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAddForm">确认新增</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { SetUp, Plus, Printer, View, Search, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useLongzhouOrdersStore } from '@/stores/longzhouOrders'

const orderStore = useLongzhouOrdersStore()

// ============================================================
// 搜索表单
// ============================================================
const searchForm = ref({ planNo: '', orderNo: '', status: '' })
const currentPage = ref(1)
const pageSize = ref(10)

const handleSearch = () => { currentPage.value = 1 }
const handleReset = () => { searchForm.value = { planNo: '', orderNo: '', status: '' }; currentPage.value = 1 }

// ============================================================
// 新增计划单弹窗
// ============================================================
const addFormVisible = ref(false)
const addFormRef = ref<FormInstance>()
const addForm = reactive({
  orderNo: '', customerName: '', productName: '', spec: '',
  quantity: 0, workshop: '', process: '', planDate: '', remark: ''
})
const addFormRules: FormRules = {
  customerName: [{ required: true, message: '请输入客户名称', trigger: 'blur' }],
  productName: [{ required: true, message: '请输入产品名称', trigger: 'blur' }],
  workshop: [{ required: true, message: '请输入生产车间', trigger: 'blur' }],
  planDate: [{ required: true, message: '请选择计划日期', trigger: 'change' }]
}
const orderOptions = computed(() => orderStore.list.map(o => ({
  value: o.orderNo,
  label: `${o.orderNo} - ${o.customer}`,
  customer: o.customer,
  product: o.lines?.[0]?.productName || '',
  spec: o.lines?.[0]?.outerSpec?.outerSize || ''
})))
function onOrderSelect(val: string) {
  const opt = orderOptions.value.find(o => o.value === val)
  if (opt) { addForm.customerName = opt.customer; addForm.productName = opt.product; addForm.spec = opt.spec }
}
const handleAdd = () => {
  Object.assign(addForm, { orderNo: '', customerName: '', productName: '', spec: '', quantity: 0, workshop: '', process: '', planDate: '', remark: '' })
  addFormVisible.value = true
}
const submitAddForm = async () => {
  await addFormRef.value?.validate()
  const planNo = `LZ-PP-${new Date().getFullYear()}${String(localPlans.value.length + 1).padStart(3, '0')}`
  localPlans.value.unshift({ id: Date.now(), planNo, orderNo: addForm.orderNo, customerName: addForm.customerName, productName: addForm.productName, spec: addForm.spec, quantity: addForm.quantity, workshop: addForm.workshop, process: addForm.process, status: 'pending', planDate: addForm.planDate, remark: addForm.remark })
  ElMessage.success('生产计划单已新增')
  addFormVisible.value = false
}

// ============================================================
// 打印计划单
// ============================================================
const handlePrint = (row?: any) => {
  const target = row || currentRow.value
  if (!target) return
  const pw = window.open('', '_blank', 'width=900,height=680')
  if (!pw) { ElMessage.warning('请允许弹出窗口以打印'); return }
  pw.document.write(`<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"/><title>生产计划单 - ${target.planNo}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Microsoft YaHei',SimSun,sans-serif;font-size:13px;padding:24px}.company{text-align:center;font-size:22px;font-weight:bold;margin-bottom:4px}.title{text-align:center;font-size:17px;font-weight:bold;margin-bottom:16px;letter-spacing:2px}.info{border:1px solid #999;margin-bottom:12px}.info-row{display:flex;border-bottom:1px solid #ccc}.info-row:last-child{border-bottom:none}.info-cell{padding:7px 12px;flex:1;border-right:1px solid #ccc;display:flex;gap:6px}.info-cell:last-child{border-right:none}.label{color:#666;white-space:nowrap}.value{font-weight:600}table{width:100%;border-collapse:collapse;font-size:12px}th{background:#e8f0fe;text-align:center;padding:7px 6px;border:1px solid #999}td{padding:6px;border:1px solid #ccc;text-align:center}.footer{margin-top:24px;display:flex;justify-content:space-between;font-size:12px}.signs{display:flex;gap:48px}.sign{display:flex;flex-direction:column;gap:6px;align-items:center}.sign-line{border-bottom:1px solid #000;width:100px;height:24px}@media print{body{padding:10px}}</style>
</head><body>
<div class="company">龙州塑业有限公司</div>
<div class="title">生产计划单</div>
<div class="info">
<div class="info-row"><div class="info-cell"><span class="label">计划单号：</span><span class="value">${target.planNo}</span></div><div class="info-cell"><span class="label">关联订单：</span><span class="value">${target.orderNo}</span></div><div class="info-cell"><span class="label">计划日期：</span><span class="value">${target.planDate}</span></div></div>
<div class="info-row"><div class="info-cell"><span class="label">客户名称：</span><span class="value">${target.customerName}</span></div><div class="info-cell"><span class="label">产品名称：</span><span class="value">${target.productName}</span></div><div class="info-cell"><span class="label">规格：</span><span class="value">${target.spec}</span></div></div>
<div class="info-row"><div class="info-cell"><span class="label">计划数量：</span><span class="value">${(target.quantity||0).toLocaleString()} 套</span></div><div class="info-cell"><span class="label">生产车间：</span><span class="value">${target.workshop}</span></div><div class="info-cell"><span class="label">状态：</span><span class="value">${target.status==='completed'?'已完成':target.status==='producing'?'生产中':'待安排'}</span></div></div>
<div class="info-row"><div class="info-cell" style="flex:3"><span class="label">生产工序：</span><span class="value">${target.process}</span></div><div class="info-cell"><span class="label">备注：</span><span class="value">${target.remark||'-'}</span></div></div>
</div>
<table><thead><tr><th width="40">序</th><th>工序名称</th><th width="120">负责人</th><th width="120">计划完成时间</th><th width="80">完成数量</th><th width="80">质检</th><th>备注</th></tr></thead>
<tbody>${(target.process||'待安排').split('→').map((s: string, i: number) => `<tr><td>${i+1}</td><td>${s.trim()}</td><td></td><td></td><td></td><td></td><td></td></tr>`).join('')}</tbody></table>
<div class="footer"><div class="signs"><div class="sign"><div class="sign-line"></div><span>制单人</span></div><div class="sign"><div class="sign-line"></div><span>生产主管</span></div><div class="sign"><div class="sign-line"></div><span>审核人</span></div></div><span>打印时间：${new Date().toLocaleString('zh-CN')}</span></div>
<script>window.onload=function(){window.print()}<\/script></body></html>`)
  pw.document.close()
}

// ============================================================
// 详情弹窗
// ============================================================
const detailVisible = ref(false)
const currentRow = ref<any>(null)
const openDetail = (row: any) => { currentRow.value = row; detailVisible.value = true }

// ============================================================
// 数据模型
// ============================================================
interface ProductionPlanRow {
  id: number
  planNo: string
  orderNo: string
  customerName: string
  productName: string
  spec: string
  quantity: number
  workshop: string
  process: string
  status: 'pending' | 'producing' | 'completed'
  planDate: string
  remark: string
}

// ============================================================
// 本地计划单数据（含初始 Mock 数据）
// ============================================================
const localPlans = ref<ProductionPlanRow[]>([
  { id: 1, planNo: 'LZ-PP-2026001', orderNo: '2026XXXX01', customerName: 'A集团', productName: '一级白砂糖袋', spec: '66*96', quantity: 50000, workshop: '拉丝车间', process: '拉丝→圆织→普印→打包', status: 'producing', planDate: '2026-05-01', remark: '第一批' },
  { id: 2, planNo: 'LZ-PP-2026002', orderNo: '2026XXXX01', customerName: 'A集团', productName: '二级白砂糖袋', spec: '66*96', quantity: 30000, workshop: '拉丝车间', process: '拉丝→圆织→普印→打包', status: 'producing', planDate: '2026-05-05', remark: '第一批' },
  { id: 3, planNo: 'LZ-PP-2026003', orderNo: 'LZ20260510-B', customerName: 'B糖业', productName: '50kg白砂糖编织袋', spec: '55*105', quantity: 80000, workshop: '吹膜车间', process: '吹膜→制袋→打包', status: 'pending', planDate: '2026-05-10', remark: '' },
  { id: 4, planNo: 'LZ-PP-2026004', orderNo: 'LZ20260515-C', customerName: 'C糖业', productName: '50kg红糖编织袋', spec: '55*105', quantity: 40000, workshop: '一体机车间', process: '一体机工段→打包', status: 'pending', planDate: '2026-05-15', remark: '' },
  { id: 5, planNo: 'LZ-PP-2026005', orderNo: 'LZ20260520-D', customerName: 'D糖业', productName: '25kg白砂糖小袋', spec: '45*85', quantity: 50000, workshop: '拉丝车间', process: '拉丝→圆织→普印→打包', status: 'pending', planDate: '2026-05-20', remark: '' },
  { id: 6, planNo: 'LZ-PP-2026006', orderNo: 'LZ20260601-E', customerName: 'E糖业', productName: '50kg赤砂糖编织袋', spec: '55*105', quantity: 60000, workshop: '拉丝车间', process: '拉丝→圆织→普印→打包', status: 'producing', planDate: '2026-06-01', remark: '' },
  { id: 7, planNo: 'LZ-PP-2026007', orderNo: 'LZ20260610-F', customerName: 'F糖业', productName: '50kg白砂糖编织袋（阀口）', spec: '55*105', quantity: 100000, workshop: '一体机车间', process: '一体机工段→打包', status: 'pending', planDate: '2026-06-10', remark: '阀口专用' },
  { id: 8, planNo: 'LZ-PP-2026008', orderNo: 'LZ20260615-G', customerName: 'G糖业', productName: '50kg白砂糖编织袋', spec: '55*105', quantity: 70000, workshop: '拉丝车间', process: '拉丝→圆织→普印→打包', status: 'completed', planDate: '2026-06-15', remark: '已完成' },
  { id: 9, planNo: 'LZ-PP-2026009', orderNo: 'LZ20260620-H', customerName: 'H糖业', productName: '50kg白砂糖编织袋（彩印）', spec: '55*105', quantity: 120000, workshop: '普印车间', process: '彩印→打包', status: 'pending', planDate: '2026-06-20', remark: '彩印版面待确认' },
  { id: 10, planNo: 'LZ-PP-2026010', orderNo: 'LZ20260701-I', customerName: 'I糖业', productName: '1000kg集装袋（糖用）', spec: '105*105*120', quantity: 5000, workshop: '圆织车间', process: '圆织→涂膜→打包', status: 'pending', planDate: '2026-07-01', remark: '加厚型' },
  { id: 11, planNo: 'LZ-PP-2026011', orderNo: 'LZ20260710-J', customerName: 'J糖业', productName: '50kg白砂糖编织袋', spec: '55*105', quantity: 45000, workshop: '拉丝车间', process: '拉丝→圆织→普印→打包', status: 'pending', planDate: '2026-07-10', remark: '' },
  { id: 12, planNo: 'LZ-PP-2026012', orderNo: 'LZ20260715-K', customerName: 'K糖业', productName: '50kg白砂糖编织袋', spec: '55*105', quantity: 90000, workshop: '拉丝车间', process: '拉丝→圆织→普印→打包', status: 'pending', planDate: '2026-07-15', remark: '' },
  { id: 13, planNo: 'LZ-PP-2026013', orderNo: 'LZ20260801-L', customerName: 'L糖业', productName: '50kg白砂糖编织袋（涂膜单面）', spec: '55*105', quantity: 55000, workshop: '涂膜车间', process: '涂膜→打包', status: 'pending', planDate: '2026-08-01', remark: '' },
  { id: 14, planNo: 'LZ-PP-2026014', orderNo: 'LZ20260810-M', customerName: 'M糖业', productName: '50kg红糖编织袋', spec: '55*105', quantity: 35000, workshop: '拉丝车间', process: '拉丝→圆织→普印→打包', status: 'pending', planDate: '2026-08-10', remark: '' },
  { id: 15, planNo: 'LZ-PP-2026015', orderNo: '2026XXXX02', customerName: 'A集团', productName: '一级白砂糖袋', spec: '66*96', quantity: 0, workshop: '拉丝车间', process: '拉丝→圆织→普印→打包', status: 'pending', planDate: '2026-08-15', remark: '待确认' }
])

// ============================================================
// 过滤逻辑
// ============================================================
const filteredData = computed(() => {
  return localPlans.value.filter((row) => {
    if (searchForm.value.planNo && !row.planNo.includes(searchForm.value.planNo)) return false
    if (searchForm.value.orderNo && !row.orderNo.includes(searchForm.value.orderNo)) return false
    if (searchForm.value.status && row.status !== searchForm.value.status) return false
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
// 表头样式
// ============================================================
const headerCellStyle = () => ({
  background: '#f5f7fa', color: '#303133', fontWeight: 600, fontSize: '13px'
})
</script>

<style lang="scss" scoped>
@use '@/scss/variables' as *;

.longzhou-production-plan {
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

  .print-content {
    padding: $spacing-6;
    .print-header {
      text-align: center;
      margin-bottom: $spacing-6;
      h2 { font-size: 20px; margin-bottom: $spacing-2; }
      p { color: $color-gray-500; }
    }
  }
}
</style>
