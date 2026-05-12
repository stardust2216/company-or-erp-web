<template>
  <div class="page-container">
    <el-page-header @back="$router.back()">
      <template #content>
        <span class="page-header-title">订单详情</span>
      </template>
    </el-page-header>

    <div v-if="order" class="page-body">
      <div class="toolbar no-print">
        <el-button type="primary" @click="goEdit">编辑订单</el-button>
        <el-button
          v-if="canPrintProductionSheet(order.status)"
          type="success"
          @click="goProductionSheet"
        >
          打印生产计划单
        </el-button>
        <el-button @click="router.push({ name: 'Orders' })">返回列表</el-button>
      </div>

      <section class="block">
        <h3 class="block-title">基础信息</h3>
        <el-descriptions :column="2" border size="default">
          <el-descriptions-item label="订单号">{{ order.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="子公司">{{ subsidiaryLabel(order.subsidiaryId) }}</el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="ORDER_STATUS_TAG_TYPE[order.status]">{{ ORDER_STATUS_LABEL[order.status] }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="开票状态">
            <el-tag :type="INVOICE_STATUS_TAG_TYPE[order.invoiceStatus]">{{ INVOICE_STATUS_LABEL[order.invoiceStatus] }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="回款进度" :span="2">
            <el-progress :percentage="order.paymentProgress" :stroke-width="14" />
          </el-descriptions-item>
          <el-descriptions-item label="订单金额">¥{{ order.amount.toLocaleString() }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ order.createdAt }}</el-descriptions-item>
        </el-descriptions>
      </section>

      <section class="block">
        <h3 class="block-title">客户与交付</h3>
        <el-descriptions :column="2" border size="default">
          <el-descriptions-item label="客户名称" :span="2">{{ order.customer }}</el-descriptions-item>
          <el-descriptions-item label="联系人">{{ order.contact }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ order.phone }}</el-descriptions-item>
          <el-descriptions-item label="交货地址" :span="2">{{ order.deliveryAddress || '—' }}</el-descriptions-item>
          <el-descriptions-item label="计划完成日" :span="2">{{ order.expectedFinishDate || '—' }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ order.remark || '—' }}</el-descriptions-item>
        </el-descriptions>
      </section>

      <section class="block">
        <h3 class="block-title">产品明细（规格与数量）</h3>
        <el-table :data="order.lines" border stripe size="default" style="width: 100%">
          <el-table-column type="index" label="#" width="50" />
          <el-table-column prop="productName" label="产品名称" min-width="140" />
          <el-table-column prop="spec" label="规格要求" min-width="140" />
          <el-table-column prop="qty" label="数量" width="100" align="right" />
          <el-table-column prop="unit" label="单位" width="72" align="center" />
          <el-table-column label="单价" width="110" align="right">
            <template #default="{ row }">¥{{ row.unitPrice.toFixed(2) }}</template>
          </el-table-column>
          <el-table-column label="小计" width="120" align="right">
            <template #default="{ row }">¥{{ (row.qty * row.unitPrice).toLocaleString() }}</template>
          </el-table-column>
        </el-table>
      </section>
    </div>

    <div v-else class="page-body empty-wrap">
      <el-empty description="未找到该订单（可能已删除）">
        <el-button type="primary" @click="router.push({ name: 'Orders' })">返回订单列表</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrdersStore } from '@/stores/orders'
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_TAG_TYPE,
  INVOICE_STATUS_LABEL,
  INVOICE_STATUS_TAG_TYPE,
  canPrintProductionSheet
} from '@/types'
import { subsidiaryLabel } from '@/constants/subsidiary'

const route = useRoute()
const router = useRouter()
const ordersStore = useOrdersStore()

const orderId = computed(() => route.params.id as string)
const order = computed(() => ordersStore.getById(orderId.value))

function goEdit() {
  if (!order.value) return
  router.push({
    name: 'Orders',
    query: { edit: order.value.id }
  })
}

function goProductionSheet() {
  if (!order.value) return
  router.push({ name: 'OrderProductionSheet', params: { id: order.value.id } })
}
</script>

<style lang="scss" scoped>
@use '@/scss/variables' as *;
@use '@/scss/mixins' as *;

.page-container {
  @include custom-scrollbar;
}

.page-header-title {
  font-weight: 600;
  font-size: 16px;
  color: #1a1a2e;
}

.page-body {
  @include industrial-card;
  padding: 20px;
  margin-top: 16px;
}

.toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.block {
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
}

.block-title {
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 600;
  color: #1a1a2e;
}

.empty-wrap {
  display: flex;
  justify-content: center;
  padding: 48px 20px;
}
</style>
