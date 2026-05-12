<template>
  <div class="leave-container">
    <!-- Leave Stats -->
    <div class="leave-stats">
      <div class="stat-card">
        <div class="stat-icon annual">
          <el-icon><Calendar /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-label">年假</div>
          <div class="stat-value">10<span>天</span> / 15天</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon sick">
          <el-icon><FirstAidKit /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-label">病假</div>
          <div class="stat-value">0<span>天</span> / 10天</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon personal">
          <el-icon><User /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-label">事假</div>
          <div class="stat-value">2<span>天</span> / 5天</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon remain">
          <el-icon><Clock /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-label">剩余假期</div>
          <div class="stat-value">23<span>天</span></div>
        </div>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="filter-bar">
      <div class="filter-row">
        <div class="filter-item">
          <span class="filter-label">请假类型</span>
          <el-select v-model="filterForm.type" placeholder="请选择类型" clearable>
            <el-option label="全部" value="" />
            <el-option label="年假" value="annual" />
            <el-option label="病假" value="sick" />
            <el-option label="事假" value="personal" />
          </el-select>
        </div>
        
        <div class="filter-item">
          <span class="filter-label">状态</span>
          <el-select v-model="filterForm.status" placeholder="请选择状态" clearable>
            <el-option label="全部" value="" />
            <el-option label="待审批" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已驳回" value="rejected" />
          </el-select>
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
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </div>
      </div>
    </div>

    <!-- Leave Table -->
    <div class="leave-table-card">
      <div class="table-header">
        <div class="header-title">请假记录</div>
        <div class="header-actions">
          <el-button type="primary" @click="goToApply">
            <el-icon><Plus /></el-icon>
            新增请假
          </el-button>
        </div>
      </div>
      
      <div class="leave-table">
        <el-table :data="tableData" stripe style="width: 100%">
          <el-table-column type="selection" width="55" />
          <el-table-column label="请假类型" width="140">
            <template #default="{ row }">
              <div class="leave-type-cell">
                <div class="type-icon" :class="row.type">
                  <el-icon><Calendar /></el-icon>
                </div>
                <span class="type-name">{{ row.typeName }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="startDate" label="开始日期" width="120" />
          <el-table-column prop="endDate" label="结束日期" width="120" />
          <el-table-column prop="days" label="天数" width="80" />
          <el-table-column prop="reason" label="请假原因" min-width="200" show-overflow-tooltip />
          <el-table-column prop="createTime" label="申请时间" width="160" />
          <el-table-column prop="status" label="状态" width="100" class="status-cell">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small">
                {{ row.statusName }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right" class="action-cell">
            <template #default="{ row }">
              <el-button type="primary" link @click="handleView(row)">查看</el-button>
              <el-button type="danger" link v-if="row.status === 'pending'" @click="handleCancel(row)">取消</el-button>
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
import { Calendar, FirstAidKit, User, Clock, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()

// Filter Form
const filterForm = reactive({
  type: '',
  status: '',
  dateRange: []
})

// Pagination
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 3
})

// Table Data
const tableData = ref([
  {
    id: 1,
    type: 'annual',
    typeName: '年假',
    startDate: '2024-01-20',
    endDate: '2024-01-22',
    days: 3,
    reason: '因个人事务需要处理',
    createTime: '2024-01-15 10:30:00',
    status: 'pending',
    statusName: '待审批'
  },
  {
    id: 2,
    type: 'sick',
    typeName: '病假',
    startDate: '2024-01-08',
    endDate: '2024-01-08',
    days: 1,
    reason: '身体不适',
    createTime: '2024-01-08 08:00:00',
    status: 'approved',
    statusName: '已通过'
  },
  {
    id: 3,
    type: 'personal',
    typeName: '事假',
    startDate: '2024-01-05',
    endDate: '2024-01-05',
    days: 1,
    reason: '家中有事',
    createTime: '2024-01-03 14:20:00',
    status: 'approved',
    statusName: '已通过'
  }
])

// Methods
function getStatusType(status: string) {
  const typeMap: Record<string, string> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  }
  return typeMap[status] || 'info'
}

function handleSearch() {
  pagination.current = 1
}

function handleReset() {
  filterForm.type = ''
  filterForm.status = ''
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

function handleCancel(_row: any) {
  ElMessageBox.confirm('确定要取消该请假申请吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('请假申请已取消')
  }).catch(() => {})
}

function goToApply() {
  router.push('/workflow/start')
}
</script>

<style lang="scss">
@use '@/views/hr/leave-management' as *;
</style>

<style lang="scss" scoped>
@use '@/scss/variables' as *;
@use '@/scss/mixins' as *;

.leave-container {
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
  display: flex;
  gap: 8px;
}
</style>
