<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">生产计划</h1>
        <p class="page-desc">汇总已进入生产及之后环节的订单，可跳转打印《生产计划单》（与订单详情一致）。</p>
      </div>
    </div>
    <div class="page-body">
      <el-table v-if="productionOrders.length" :data="productionOrders" stripe max-height="1000" style="width: 100%">
        <el-table-column prop="orderNo" label="订单号" min-width="148" />
        <el-table-column label="子公司" width="108">
          <template #default="{ row }">{{ subsidiaryLabel(row.subsidiaryId) }}</template>
        </el-table-column>
        <el-table-column prop="customer" label="客户" min-width="140" show-overflow-tooltip />
        <el-table-column label="状态" width="96" align="center">
          <template #default="{ row }">
            <el-tag :type="ORDER_STATUS_TAG_TYPE[row.status as OrderStatus]">{{ ORDER_STATUS_LABEL[row.status as OrderStatus] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="expectedFinishDate" label="计划完成" width="110" />
        <el-table-column label="主产品" min-width="160" show-overflow-tooltip>
          <template #default="{ row }">{{ row.lines[0]?.productName || '\u2014' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="goDetail(row.id)">订单详情</el-button>
            <el-button type="success" link @click="goSheet(row.id)">计划单</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-else description="当前没有生产中及后续环节的订单" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { subsidiaryLabel } from '@/constants/subsidiary'
import { useOrdersStore } from '@/stores/orders'
import { ORDER_STATUS_LABEL, ORDER_STATUS_TAG_TYPE, type OrderStatus } from '@/types'

const router = useRouter()
const { list } = storeToRefs(useOrdersStore())

const productionOrders = computed(() =>
  list.value.filter((o) => o.status === 'production' || o.status === 'completed' || o.status === 'shipped')
)

function goDetail(id: string) {
  router.push({ name: 'OrderDetail', params: { id } })
}

function goSheet(id: string) {
  router.push({ name: 'OrderProductionSheet', params: { id } })
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
</style>
