<template>
  <div class="page-container">
    <el-page-header @back="$router.back()" content="订单详情" />
    <div class="page-body" style="margin-top: 16px">
      <el-empty description="订单详情页" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/scss/variables' as *;
@use '@/scss/mixins' as *;

.page-container {
  @include custom-scrollbar;
}

.page-body {
  @include industrial-card;
  padding: 20px;
}
</style>
