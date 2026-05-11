<template>
  <div class="workflow-list-container">
    <!-- Filter Bar -->
    <div class="filter-bar">
      <div class="filter-row">
        <div class="filter-item">
          <span class="filter-label">状态</span>
          <el-select v-model="filterForm.status" placeholder="请选择状态" clearable>
            <el-option label="全部" value="" />
            <el-option label="待审批" value="pending" />
            <el-option label="审批中" value="processing" />
            <el-option label="已通过" value="approved" />
            <el-option label="已驳回" value="rejected" />
          </el-select>
        </div>
        
        <div class="filter-item">
          <span class="filter-label">类型</span>
          <el-select v-model="filterForm.type" placeholder="请选择类型" clearable>
            <el-option label="全部" value="" />
            <el-option label="请假申请" value="leave" />
            <el-option label="采购申请" value="purchase" />
            <el-option label="报销申请" value="expense" />
            <el-option label="加班申请" value="overtime" />
          </el-select>
        </div>
        
        <div class="filter-item">
          <span class="filter-label">关键词</span>
          <el-input
            v-model="filterForm.keyword"
            placeholder="搜索申请标题"
            clearable
            style="width: 200px"
          />
        </div>
        
        <div class="filter-item">
          <span class="filter-label">日期</span>
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </div>
        
        <div class="filter-actions">
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </div>
      </div>
    </div>

    <!-- Workflow Table -->
    <div class="workflow-table-card">
      <div class="table-header">
        <div class="header-title">申请列表</div>
        <div class="header-actions">
          <el-button type="primary" @click="goToStart">
            <el-icon><Plus /></el-icon>
            发起申请
          </el-button>
        </div>
      </div>
      
      <div class="workflow-table">
        <el-table :data="tableData" stripe style="width: 100%">
          <el-table-column type="selection" width="55" />
          <el-table-column prop="title" label="申请标题" min-width="200">
            <template #default="{ row }">
              <div class="workflow-title-cell">
                <div class="workflow-icon" :class="row.type">
                  <el-icon><Document /></el-icon>
                </div>
                <span>{{ row.title }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="typeName" label="类型" width="120" />
          <el-table-column prop="applicant" label="申请人" width="100" />
          <el-table-column prop="department" label="部门" width="120" />
          <el-table-column prop="createTime" label="申请时间" width="180" />
          <el-table-column prop="status" label="状态" width="100" class="status-cell">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small">
                {{ row.statusName }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="160" fixed="right" class="action-cell">
            <template #default="{ row }">
              <el-button type="primary" link @click="handleView(row)">查看</el-button>
              <el-button type="primary" link @click="handleProcess(row)" v-if="row.status === 'pending'">处理</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <div class="table-pagination">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Refresh, Plus, Document } from '@element-plus/icons-vue'

const router = useRouter()

// Filter Form
const filterForm = reactive({
  status: '',
  type: '',
  keyword: '',
  dateRange: []
})

// Pagination
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

// Table Data
const tableData = ref([
  {
    id: 1,
    title: '请假申请 - 年假',
    type: 'leave',
    typeName: '请假申请',
    applicant: '张三',
    department: '技术部',
    createTime: '2024-01-15 10:30:00',
    status: 'pending',
    statusName: '待审批'
  },
  {
    id: 2,
    title: '采购申请 - 办公设备',
    type: 'purchase',
    typeName: '采购申请',
    applicant: '李四',
    department: '行政部',
    createTime: '2024-01-15 09:15:00',
    status: 'processing',
    statusName: '审批中'
  },
  {
    id: 3,
    title: '报销申请 - 出差费用',
    type: 'expense',
    typeName: '报销申请',
    applicant: '王五',
    department: '销售部',
    createTime: '2024-01-14 16:45:00',
    status: 'approved',
    statusName: '已通过'
  },
  {
    id: 4,
    title: '加班申请',
    type: 'overtime',
    typeName: '加班申请',
    applicant: '赵六',
    department: '技术部',
    createTime: '2024-01-14 14:20:00',
    status: 'rejected',
    statusName: '已驳回'
  },
  {
    id: 5,
    title: '请假申请 - 事假',
    type: 'leave',
    typeName: '请假申请',
    applicant: '钱七',
    department: '财务部',
    createTime: '2024-01-13 11:00:00',
    status: 'approved',
    statusName: '已通过'
  }
])

// Methods
function getStatusType(status: string) {
  const typeMap: Record<string, string> = {
    pending: 'warning',
    processing: 'primary',
    approved: 'success',
    rejected: 'danger'
  }
  return typeMap[status] || 'info'
}

function handleSearch() {
  pagination.current = 1
  // TODO: Fetch data with filter
}

function handleReset() {
  filterForm.status = ''
  filterForm.type = ''
  filterForm.keyword = ''
  filterForm.dateRange = []
  handleSearch()
}

function handleSizeChange(val: number) {
  pagination.pageSize = val
  handleSearch()
}

function handleCurrentChange(val: number) {
  pagination.current = val
  handleSearch()
}

function handleView(row: any) {
  router.push(`/workflow/detail/${row.id}`)
}

function handleProcess(row: any) {
  router.push(`/workflow/detail/${row.id}`)
}

function goToStart() {
  router.push('/workflow/start')
}
</script>

<style lang="scss">
@use '@/views/workflow/workflow-list' as *;
</style>

<style lang="scss" scoped>
@use '@/scss/variables' as *;
@use '@/scss/mixins' as *;

.workflow-list-container {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.filter-actions {
  margin-left: auto;
}
</style>
