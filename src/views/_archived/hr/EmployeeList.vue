<template>
  <div class="employee-list-container">
    <!-- Filter Bar -->
    <div class="filter-bar">
      <div class="filter-row">
        <div class="filter-item">
          <span class="filter-label">姓名/工号</span>
          <el-input
            v-model="filterForm.keyword"
            placeholder="搜索姓名或工号"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        
        <div class="filter-item">
          <span class="filter-label">部门</span>
          <el-select v-model="filterForm.department" placeholder="请选择部门" clearable>
            <el-option label="技术部" value="tech" />
            <el-option label="销售部" value="sales" />
            <el-option label="行政部" value="admin" />
            <el-option label="财务部" value="finance" />
            <el-option label="人力资源部" value="hr" />
          </el-select>
        </div>
        
        <div class="filter-item">
          <span class="filter-label">职位</span>
          <el-select v-model="filterForm.position" placeholder="请选择职位" clearable>
            <el-option label="总经理" value="ceo" />
            <el-option label="部门经理" value="manager" />
            <el-option label="主管" value="supervisor" />
            <el-option label="专员" value="specialist" />
            <el-option label="助理" value="assistant" />
          </el-select>
        </div>
        
        <div class="filter-item">
          <span class="filter-label">状态</span>
          <el-select v-model="filterForm.status" placeholder="请选择状态" clearable>
            <el-option label="在职" value="active" />
            <el-option label="离职" value="inactive" />
            <el-option label="退休" value="retired" />
          </el-select>
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

    <!-- Employee Table -->
    <div class="employee-table-card">
      <div class="table-header">
        <div class="header-title">员工列表</div>
        <div class="header-actions">
          <el-button type="success" @click="handleExport">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增员工
          </el-button>
        </div>
      </div>
      
      <div class="employee-table">
        <el-table :data="tableData" stripe style="width: 100%">
          <el-table-column type="selection" width="55" />
          <el-table-column label="员工信息" min-width="180">
            <template #default="{ row }">
              <div class="employee-cell">
                <div class="employee-avatar">{{ row.name.charAt(0) }}</div>
                <div class="employee-info">
                  <div class="employee-name">{{ row.name }}</div>
                  <div class="employee-id">工号：{{ row.employeeId }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="department" label="部门" width="120" />
          <el-table-column prop="position" label="职位" width="100" />
          <el-table-column prop="phone" label="手机号" width="130" />
          <el-table-column prop="email" label="邮箱" width="180" />
          <el-table-column prop="entryDate" label="入职日期" width="120" />
          <el-table-column prop="status" label="状态" width="100" class="status-cell">
            <template #default="{ row }">
              <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
                {{ row.statusName }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="160" fixed="right" class="action-cell">
            <template #default="{ row }">
              <el-button type="primary" link @click="handleView(row)">查看</el-button>
              <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
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
import { Search, Refresh, Download, Plus } from '@element-plus/icons-vue'

const router = useRouter()

// Filter Form
const filterForm = reactive({
  keyword: '',
  department: '',
  position: '',
  status: ''
})

// Pagination
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 5
})

// Table Data
const tableData = ref([
  {
    id: 1,
    name: '张三',
    employeeId: 'EMP001',
    department: '技术部',
    position: '经理',
    phone: '13800138001',
    email: 'zhangsan@company.com',
    entryDate: '2020-01-15',
    status: 'active',
    statusName: '在职'
  },
  {
    id: 2,
    name: '李四',
    employeeId: 'EMP002',
    department: '销售部',
    position: '主管',
    phone: '13800138002',
    email: 'lisi@company.com',
    entryDate: '2021-03-20',
    status: 'active',
    statusName: '在职'
  },
  {
    id: 3,
    name: '王五',
    employeeId: 'EMP003',
    department: '财务部',
    position: '专员',
    phone: '13800138003',
    email: 'wangwu@company.com',
    entryDate: '2022-06-10',
    status: 'active',
    statusName: '在职'
  },
  {
    id: 4,
    name: '赵六',
    employeeId: 'EMP004',
    department: '行政部',
    position: '助理',
    phone: '13800138004',
    email: 'zhaoliu@company.com',
    entryDate: '2023-01-05',
    status: 'active',
    statusName: '在职'
  },
  {
    id: 5,
    name: '钱七',
    employeeId: 'EMP005',
    department: '人力资源部',
    position: '专员',
    phone: '13800138005',
    email: 'qianqi@company.com',
    entryDate: '2023-08-15',
    status: 'active',
    statusName: '在职'
  }
])

// Methods
function handleSearch() {
  pagination.current = 1
  // TODO: Fetch data with filter
}

function handleReset() {
  filterForm.keyword = ''
  filterForm.department = ''
  filterForm.position = ''
  filterForm.status = ''
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
  router.push(`/hr/employee/${row.id}`)
}

function handleEdit(row: any) {
  router.push(`/hr/employee/${row.id}`)
}

function handleAdd() {
  router.push('/hr/employee/new')
}

function handleExport() {
  // TODO: Export data
}
</script>

<style lang="scss">
@use '@/views/hr/employee-list' as *;
</style>

<style lang="scss" scoped>
@use '@/scss/variables' as *;
@use '@/scss/mixins' as *;

.employee-list-container {
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
  display: flex;
  gap: 8px;
}
</style>
