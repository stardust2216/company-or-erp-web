<template>
  <div class="filter-bar-wrp">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.filter-bar-wrp {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  align-items: center;
}
</style>
