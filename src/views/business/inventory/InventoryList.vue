<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">库存管理</h1>
        <p class="page-desc">按子公司与仓库查看余量；「订单联动」列为演示说明（《结构说明》库存与订单状态联动）。</p>
      </div>
    </div>
    <div class="page-body">
      <div class="filter-bar">
        <el-select v-model="filterSub" clearable placeholder="子公司" style="width: 140px">
          <el-option label="全部" value="" />
          <el-option v-for="sid in SUBSIDIARY_IDS" :key="sid" :label="SUBSIDIARIES[sid].name" :value="sid" />
        </el-select>
        <el-input v-model="keyword" clearable placeholder="物料 / 仓库" style="width: 220px" />
      </div>
      <el-table :data="filtered" stripe max-height="1000" style="width: 100%">
        <el-table-column label="子公司" width="108">
          <template #default="{ row }">{{ subsidiaryLabel(row.subsidiaryId) }}</template>
        </el-table-column>
        <el-table-column prop="warehouseName" label="仓库" width="120" />
        <el-table-column prop="skuName" label="物料" min-width="120" />
        <el-table-column prop="spec" label="规格" min-width="120" show-overflow-tooltip />
        <el-table-column prop="stockQty" label="库存数量" width="110" align="right" />
        <el-table-column prop="unit" label="单位" width="64" align="center" />
        <el-table-column prop="safeStock" label="安全库存" width="100" align="right" />
        <el-table-column prop="orderLinkHint" label="订单状态联动（演示）" min-width="200" show-overflow-tooltip />
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { SUBSIDIARIES, SUBSIDIARY_IDS, subsidiaryLabel } from '@/constants/subsidiary'
import type { SubsidiaryId } from '@/constants/subsidiary'
import { useInventoryStore } from '@/stores/inventory'

const { list } = storeToRefs(useInventoryStore())

const filterSub = ref<'' | SubsidiaryId>('')
const keyword = ref('')

const filtered = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  return list.value.filter((r) => {
    const okSub = !filterSub.value || r.subsidiaryId === filterSub.value
    const okKw =
      !kw ||
      r.skuName.toLowerCase().includes(kw) ||
      r.warehouseName.toLowerCase().includes(kw) ||
      r.spec.toLowerCase().includes(kw)
    return okSub && okKw
  })
})
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
