<template>
  <div class="table-section">
    <slot name="table" />
    <div v-if="showPagination" class="pagination-bar">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="pageSizes"
        :total="total"
        :pager-count="7"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @size-change="onPageSizeChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  currentPage: number
  pageSize: number
  total: number
  pageSizes?: number[]
  showPagination?: boolean
}>()

const emit = defineEmits<{
  'size-change': []
}>()

function onPageSizeChange() {
  emit('size-change')
}
</script>

<style lang="scss" scoped>
.table-section {
  min-width: 0;
}

.pagination-bar {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  padding-top: 4px;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
