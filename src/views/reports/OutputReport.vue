<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">产量产值报表</h1>
    </div>
    <div class="page-body">
      <el-empty description="产量产值报表页面开发中" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/scss/variables' as *;
@use '@/scss/mixins' as *;

.page-container { @include custom-scrollbar; }
.page-header {
  @include industrial-card;
  padding: 20px 24px;
  margin-bottom: 16px;
  .page-title { font-size: 18px; font-weight: 600; color: #1a1a2e; margin: 0; }
}
.page-body { @include industrial-card; padding: 20px; }
</style>
