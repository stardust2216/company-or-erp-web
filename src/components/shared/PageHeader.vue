<template>
  <div class="page-header-wrp">
    <div class="page-header-main">
      <h1 class="page-title">{{ title }}</h1>
      <p v-if="description" class="page-desc">{{ description }}</p>
      <slot name="extra" />
    </div>
    <div v-if="$slots.actions" class="page-actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<style lang="scss" scoped>
@use '@/scss/variables' as *;
@use '@/scss/mixins' as *;

.page-header-wrp {
  @include industrial-card;
  padding: 20px 24px;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;

  .page-header-main {
    min-width: 0;
  }

  .page-title {
    font-size: 18px;
    font-weight: 600;
    color: #1a1a2e;
    margin: 0 0 8px;
  }

  .page-desc {
    margin: 0;
    font-size: 13px;
    color: #606266;
    line-height: 1.5;
    max-width: 720px;
  }
}
</style>
