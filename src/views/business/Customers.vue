<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">客户管理</h1>
      <div class="page-actions">
        <el-button type="primary">
          <el-icon><Plus /></el-icon>
          新建客户
        </el-button>
      </div>
    </div>
    <div class="page-body">
      <el-empty description="客户管理页面开发中" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
</script>

<style lang="scss" scoped>
@use '@/scss/variables' as *;
@use '@/scss/mixins' as *;

.page-container { @include custom-scrollbar; }
.page-header {
  @include industrial-card;
  padding: 20px 24px;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .page-title { font-size: 18px; font-weight: 600; color: #1a1a2e; margin: 0; }
}
.page-body { @include industrial-card; padding: 20px; }
</style>
