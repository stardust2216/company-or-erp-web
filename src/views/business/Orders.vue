<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">订单管理</h1>
      <div class="page-actions">
        <el-button type="primary">
          <el-icon><Plus /></el-icon>
          新建订单
        </el-button>
      </div>
    </div>
    <div class="page-body">
      <div class="filter-bar">
        <el-input placeholder="搜索订单号/客户名" style="width: 200px" />
        <el-select placeholder="订单状态" style="width: 120px">
          <el-option label="全部" value="" />
          <el-option label="待审核" value="pending" />
          <el-option label="生产中" value="production" />
          <el-option label="已完成" value="completed" />
        </el-select>
        <el-button type="primary">查询</el-button>
        <el-button>重置</el-button>
      </div>
      <el-table :data="[]" stripe style="width: 100%">
        <el-table-column prop="orderNo" label="订单号" />
        <el-table-column prop="customer" label="客户名称" />
        <el-table-column prop="amount" label="订单金额" />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default>
            <el-button type="primary" link>查看</el-button>
            <el-button type="primary" link>编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'

function getStatusType(status: string): '' | 'warning' | 'info' | 'success' {
  const map: Record<string, '' | 'warning' | 'info' | 'success'> = {
    pending: 'warning',
    production: 'info',
    completed: 'success'
  }
  return map[status] || ''
}

function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: '待审核',
    production: '生产中',
    completed: '已完成'
  }
  return map[status] || status
}
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
  align-items: center;
  
  .page-title {
    font-size: 18px;
    font-weight: 600;
    color: #1a1a2e;
    margin: 0;
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
}
</style>
