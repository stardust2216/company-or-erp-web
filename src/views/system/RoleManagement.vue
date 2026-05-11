<template>
  <div class="role-management-container">
    <div class="role-list">
      <!-- Super Admin Role -->
      <div class="role-card">
        <div class="card-header">
          <div class="role-info">
            <div class="role-icon super-admin">
              <el-icon><Key /></el-icon>
            </div>
            <div class="role-details">
              <div class="role-name">超级管理员</div>
              <div class="role-code">super_admin</div>
            </div>
          </div>
          <div class="role-actions">
            <el-button type="primary" link @click="handleEdit('super_admin')">
              <el-icon><Edit /></el-icon>
            </el-button>
          </div>
        </div>
        <div class="card-body">
          <div class="role-desc">
            拥有系统最高权限，可管理所有模块和用户，请谨慎分配。
          </div>
          <div class="role-stats">
            <div class="stat-item">
              <el-icon class="stat-icon"><User /></el-icon>
              <span class="stat-value">1</span>
              <span style="color: #999">人</span>
            </div>
            <div class="stat-item">
              <el-icon class="stat-icon"><Lock /></el-icon>
              <span class="stat-value">全部</span>
              <span style="color: #999">权限</span>
            </div>
          </div>
          <div class="role-tags">
            <span class="permission-tag" v-for="perm in ['全部', '用户管理', '角色管理', '系统设置']" :key="perm">
              {{ perm }}
            </span>
          </div>
        </div>
      </div>

      <!-- Admin Role -->
      <div class="role-card">
        <div class="card-header">
          <div class="role-info">
            <div class="role-icon admin">
              <el-icon><Setting /></el-icon>
            </div>
            <div class="role-details">
              <div class="role-name">系统管理员</div>
              <div class="role-code">admin</div>
            </div>
          </div>
          <div class="role-actions">
            <el-button type="primary" link @click="handleEdit('admin')">
              <el-icon><Edit /></el-icon>
            </el-button>
          </div>
        </div>
        <div class="card-body">
          <div class="role-desc">
            负责系统日常运维和用户管理，拥有大部分系统权限。
          </div>
          <div class="role-stats">
            <div class="stat-item">
              <el-icon class="stat-icon"><User /></el-icon>
              <span class="stat-value">5</span>
              <span style="color: #999">人</span>
            </div>
            <div class="stat-item">
              <el-icon class="stat-icon"><Lock /></el-icon>
              <span class="stat-value">25</span>
              <span style="color: #999">权限</span>
            </div>
          </div>
          <div class="role-tags">
            <span class="permission-tag" v-for="perm in ['用户管理', '审批管理', '考勤管理', '数据查看']" :key="perm">
              {{ perm }}
            </span>
          </div>
        </div>
      </div>

      <!-- User Role -->
      <div class="role-card">
        <div class="card-header">
          <div class="role-info">
            <div class="role-icon user">
              <el-icon><UserFilled /></el-icon>
            </div>
            <div class="role-details">
              <div class="role-name">普通用户</div>
              <div class="role-code">user</div>
            </div>
          </div>
          <div class="role-actions">
            <el-button type="primary" link @click="handleEdit('user')">
              <el-icon><Edit /></el-icon>
            </el-button>
          </div>
        </div>
        <div class="card-body">
          <div class="role-desc">
            公司普通员工，拥有基本的工作流程操作权限。
          </div>
          <div class="role-stats">
            <div class="stat-item">
              <el-icon class="stat-icon"><User /></el-icon>
              <span class="stat-value">50</span>
              <span style="color: #999">人</span>
            </div>
            <div class="stat-item">
              <el-icon class="stat-icon"><Lock /></el-icon>
              <span class="stat-value">15</span>
              <span style="color: #999">权限</span>
            </div>
          </div>
          <div class="role-tags">
            <span class="permission-tag" v-for="perm in ['发起申请', '查看流程', '考勤打卡', '个人信息']" :key="perm">
              {{ perm }}
            </span>
          </div>
        </div>
      </div>

      <!-- Add Role -->
      <div class="add-role-card" @click="handleAdd">
        <el-icon class="add-icon"><Plus /></el-icon>
        <span class="add-text">新增角色</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Key, Setting, UserFilled, User, Lock, Edit, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

function handleEdit(role: string) {
  ElMessage.info(`编辑角色: ${role}`)
}

function handleAdd() {
  ElMessage.info('新增角色')
}
</script>

<style lang="scss">
@use '@/views/system/role-management' as *;
</style>

<style lang="scss" scoped>
@use '@/scss/variables' as *;
@use '@/scss/mixins' as *;

.role-management-container {
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
</style>
