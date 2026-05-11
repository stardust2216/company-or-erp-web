<template>
  <div class="user-management-container">
    <!-- Filter Bar -->
    <div class="filter-bar">
      <div class="filter-row">
        <div class="filter-item">
          <span class="filter-label">关键词</span>
          <el-input
            v-model="filterForm.keyword"
            placeholder="搜索用户名/邮箱"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        
        <div class="filter-item">
          <span class="filter-label">角色</span>
          <el-select v-model="filterForm.role" placeholder="请选择角色" clearable>
            <el-option label="超级管理员" value="super_admin" />
            <el-option label="系统管理员" value="admin" />
            <el-option label="普通用户" value="user" />
          </el-select>
        </div>
        
        <div class="filter-item">
          <span class="filter-label">状态</span>
          <el-select v-model="filterForm.status" placeholder="请选择状态" clearable>
            <el-option label="启用" value="1" />
            <el-option label="禁用" value="0" />
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

    <!-- User Table -->
    <div class="user-table-card">
      <div class="table-header">
        <div class="header-title">用户列表</div>
        <div class="header-actions">
          <el-button type="success" @click="handleExport">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增用户
          </el-button>
        </div>
      </div>
      
      <div class="user-table">
        <el-table :data="tableData" stripe style="width: 100%">
          <el-table-column type="selection" width="55" />
          <el-table-column label="用户信息" min-width="200">
            <template #default="{ row }">
              <div class="user-cell">
                <div class="user-avatar">{{ row.username.charAt(0).toUpperCase() }}</div>
                <div class="user-info">
                  <div class="user-name">{{ row.username }}</div>
                  <div class="user-email">{{ row.email }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="realName" label="姓名" width="120" />
          <el-table-column prop="department" label="部门" width="120" />
          <el-table-column label="角色" width="180" class="role-cell">
            <template #default="{ row }">
              <el-tag v-for="role in row.roles" :key="role" :type="getRoleType(role)" size="small">
                {{ getRoleName(role) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="phone" label="手机号" width="130" />
          <el-table-column prop="lastLogin" label="最后登录" width="180" />
          <el-table-column prop="status" label="状态" width="80" class="status-cell">
            <template #default="{ row }">
              <el-switch
                v-model="row.status"
                :active-value="1"
                :inactive-value="0"
                @change="handleStatusChange(row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right" class="action-cell">
            <template #default="{ row }">
              <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
              <el-button type="primary" link @click="handleAssignRole(row)">分配角色</el-button>
              <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
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
import { Search, Refresh, Download, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// Filter Form
const filterForm = reactive({
  keyword: '',
  role: '',
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
    username: 'admin',
    realName: '系统管理员',
    email: 'admin@company.com',
    phone: '13800138000',
    department: '信息中心',
    roles: ['super_admin'],
    lastLogin: '2024-01-15 09:30:00',
    status: 1
  },
  {
    id: 2,
    username: 'manager',
    realName: '张经理',
    email: 'manager@company.com',
    phone: '13800138001',
    department: '技术部',
    roles: ['admin'],
    lastLogin: '2024-01-15 08:45:00',
    status: 1
  },
  {
    id: 3,
    username: 'user1',
    realName: '张三',
    email: 'zhangsan@company.com',
    phone: '13800138002',
    department: '技术部',
    roles: ['user'],
    lastLogin: '2024-01-14 18:20:00',
    status: 1
  },
  {
    id: 4,
    username: 'user2',
    realName: '李四',
    email: 'lisi@company.com',
    phone: '13800138003',
    department: '销售部',
    roles: ['user'],
    lastLogin: '2024-01-14 17:30:00',
    status: 0
  },
  {
    id: 5,
    username: 'user3',
    realName: '王五',
    email: 'wangwu@company.com',
    phone: '13800138004',
    department: '财务部',
    roles: ['user'],
    lastLogin: '2024-01-13 16:00:00',
    status: 1
  }
])

// Methods
function getRoleName(role: string) {
  const roleMap: Record<string, string> = {
    super_admin: '超级管理员',
    admin: '系统管理员',
    user: '普通用户'
  }
  return roleMap[role] || role
}

function getRoleType(role: string) {
  const typeMap: Record<string, string> = {
    super_admin: 'danger',
    admin: 'warning',
    user: ''
  }
  return typeMap[role] || ''
}

function handleSearch() {
  pagination.current = 1
}

function handleReset() {
  filterForm.keyword = ''
  filterForm.role = ''
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

function handleAdd() {
  // TODO: Open add dialog
}

function handleEdit(_row: any) {
  // TODO: Open edit dialog
}

function handleAssignRole(_row: any) {
  // TODO: Open assign role dialog
}

function handleDelete(_row: any) {
  ElMessageBox.confirm('确定要删除该用户吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {})
}

function handleStatusChange(row: any) {
  ElMessage.success(`用户${row.status === 1 ? '启用' : '禁用'}成功`)
}

function handleExport() {
  // TODO: Export data
}
</script>

<style lang="scss">
@use '@/scss/variables' as *;
@use '@/scss/mixins' as *;

.user-management-container {
  @include custom-scrollbar;
}

// Filter Bar
.filter-bar {
  @include industrial-card;
  padding: 16px 20px;
  margin-bottom: 16px;
  
  .filter-row {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: flex-end;
    
    .filter-item {
      display: flex;
      flex-direction: column;
      gap: 6px;
      
      .filter-label {
        font-size: 13px;
        color: #666;
      }
      
      .el-input,
      .el-select {
        width: 160px;
      }
    }
  }
}

// User Table Card
.user-table-card {
  @include industrial-card;
  
  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #e8e8e8;
    
    .header-title {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }
    
    .header-actions {
      display: flex;
      gap: 8px;
    }
  }
}

// Table Styles
.user-table {
  .el-table {
    .user-cell {
      display: flex;
      align-items: center;
      gap: 14px;
      
      .user-avatar {
        width: 50px;
        height: 50px;
        border-radius: 10px;
        background: linear-gradient(135deg, #0070f3 0%, #7928ca 100%);
        color: #fff;
        @include flex-center;
        font-size: 18px;
        font-weight: 600;
        flex-shrink: 0;
      }
      
      .user-info {
        .user-name {
          font-size: 14px;
          font-weight: 600;
          color: #1a1a2e;
          margin-bottom: 4px;
        }
        
        .user-email {
          font-size: 12px;
          color: #666;
        }
      }
    }
    
    .role-cell {
      .el-tag {
        border-radius: 3px;
        margin-right: 4px;
        
        &:last-child {
          margin-right: 0;
        }
      }
    }
    
    .status-cell {
      .el-tag {
        border-radius: 3px;
      }
    }
    
    .action-cell {
      .el-button {
        padding: 4px 8px;
      }
    }
  }
}

// Pagination
.table-pagination {
  display: flex;
  justify-content: flex-end;
  padding: 16px 20px;
  border-top: 1px solid #e8e8e8;
}
</style>

<style lang="scss" scoped>
@use '@/scss/variables' as *;
@use '@/scss/mixins' as *;

.user-management-container {
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
