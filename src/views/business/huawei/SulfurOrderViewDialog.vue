<template>
  <el-drawer
    :model-value="visible"
    title="订单详情"
    size="720px"
    direction="rtl"
    :show-close="true"
    @close="handleClose"
  >
    <div class="order-view-content" v-loading="loading" element-loading-text="加载中...">
      <template v-if="orderData">
        <!-- 1. 合同基本信息 -->
        <div class="info-section">
          <div class="section-title">合同基本信息</div>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="合同编号">{{ orderData.contractNo }}</el-descriptions-item>
            <el-descriptions-item label="合同日期">{{ orderData.contractDate }}</el-descriptions-item>
            <el-descriptions-item label="集团名称">{{ orderData.customerGroup }}</el-descriptions-item>
            <el-descriptions-item label="使用单位">{{ orderData.customerUnit }}</el-descriptions-item>
            <el-descriptions-item label="片区">
              <el-tag size="small">{{ regionLabel }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="送货方式">
              <el-tag size="small" :type="orderData.deliveryMethod === 'deliver' ? 'success' : 'info'">
                {{ deliveryMethodLabel }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 2. 产品信息 -->
        <div class="info-section">
          <div class="section-title">产品信息</div>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="产品类型">
              <el-tag size="small" type="warning">{{ productTypeLabel }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="单价（元/吨）">{{ orderData.unitPrice.toLocaleString() }}</el-descriptions-item>
            <el-descriptions-item label="块磺数量（吨）">{{ orderData.qtyBlock }}</el-descriptions-item>
            <el-descriptions-item label="粒磺数量（吨）">{{ orderData.qtyGranular }}</el-descriptions-item>
            <el-descriptions-item label="合计数量（吨）">
              <span class="highlight">{{ orderData.qtyTotal.toLocaleString() }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="实际发货（吨）">{{ orderData.actualShipped }}</el-descriptions-item>
            <el-descriptions-item label="合同金额（元）" :span="2">
              <span class="highlight amount">{{ orderData.totalAmount.toLocaleString() }}</span>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 3. 订单状态 -->
        <div class="info-section">
          <div class="section-title">订单状态</div>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="订单状态">
              <el-tag size="small" :type="statusTagType">{{ statusLabel }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="付款状态">
              <el-tag size="small" :type="paymentTagType">{{ paymentLabel }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="开票状态">
              <el-tag size="small" :type="invoiceTagType">{{ invoiceLabel }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="回款进度">
              <div class="progress-item">
                <el-progress :percentage="orderData.paymentProgress" :stroke-width="10" :status="progressStatus" style="width: 150px;" />
                <span class="progress-text">{{ orderData.paymentProgress }}%</span>
              </div>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 4. 财务信息 -->
        <div class="info-section">
          <div class="section-title">财务信息</div>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="已付金额（元）">
              <span class="amount paid">{{ orderData.paidAmount.toLocaleString() }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="未付金额（元）">
              <span class="amount unpaid">{{ (orderData.totalAmount - orderData.paidAmount).toLocaleString() }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="已开票金额（元）">
              <span class="amount invoiced">{{ orderData.invoicedAmount.toLocaleString() }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="未开票金额（元）">
              <span class="amount uninvoiced">{{ (orderData.totalAmount - orderData.invoicedAmount).toLocaleString() }}</span>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 5. 备注 -->
        <div class="info-section" v-if="orderData.remark">
          <div class="section-title">备注</div>
          <div class="remark-content">{{ orderData.remark }}</div>
        </div>

        <!-- 6. 时间信息 -->
        <div class="info-section">
          <div class="section-title">时间信息</div>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="创建时间">{{ orderData.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ orderData.updatedAt }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </template>

      <el-empty v-else-if="!loading" description="未找到该订单" />
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { getSulfurOrderDetail } from '@/api/huaweiSulfurOrders'
import type { SulfurOrder } from '@/types/sulfurOrder'
import {
  REGION_LABEL,
  ORDER_STATUS_LABEL,
  ORDER_STATUS_TAG_TYPE,
  PAYMENT_STATUS_LABEL,
  INVOICE_STATUS_LABEL,
  PRODUCT_TYPE_LABEL,
  DELIVERY_METHOD_LABEL
} from '@/types/sulfurOrder'

const props = defineProps<{
  visible: boolean
  orderId: string | null
}>()

const emit = defineEmits<{
  close: []
}>()

const loading = ref(false)
const orderData = ref<SulfurOrder | null>(null)

// 标签映射
const regionLabel = computed(() => orderData.value ? REGION_LABEL[orderData.value.region] : '-')
const statusLabel = computed(() => orderData.value ? ORDER_STATUS_LABEL[orderData.value.status] : '-')
const statusTagType = computed(() => orderData.value ? ORDER_STATUS_TAG_TYPE[orderData.value.status] : 'info')
const paymentLabel = computed(() => orderData.value ? PAYMENT_STATUS_LABEL[orderData.value.paymentStatus] : '-')
const paymentTagType = computed(() => {
  if (!orderData.value) return 'info'
  const map: Record<string, string> = { unpaid: 'danger', partial: 'warning', paid: 'success' }
  return map[orderData.value.paymentStatus] as any || 'info'
})
const invoiceLabel = computed(() => orderData.value ? INVOICE_STATUS_LABEL[orderData.value.invoiceStatus] : '-')
const invoiceTagType = computed(() => {
  if (!orderData.value) return 'info'
  const map: Record<string, string> = { none: 'info', partial: 'warning', done: 'success' }
  return map[orderData.value.invoiceStatus] as any || 'info'
})
const productTypeLabel = computed(() => orderData.value ? PRODUCT_TYPE_LABEL[orderData.value.productType] : '-')
const deliveryMethodLabel = computed(() => orderData.value ? DELIVERY_METHOD_LABEL[orderData.value.deliveryMethod] : '-')

// 进度状态
const progressStatus = computed(() => {
  const p = orderData.value?.paymentProgress || 0
  if (p >= 100) return 'success'
  if (p > 0) return ''
  return 'exception'
})

// 加载数据
async function loadData() {
  if (!props.orderId) {
    orderData.value = null
    return
  }

  loading.value = true
  try {
    const res = await getSulfurOrderDetail(props.orderId)
    if (res.code === 0 && res.data) {
      orderData.value = res.data
    } else {
      orderData.value = null
    }
  } catch (e) {
    console.error('加载订单详情失败:', e)
    orderData.value = null
  } finally {
    loading.value = false
  }
}

// 监听变化
watch(() => props.orderId, () => {
  if (props.visible) {
    loadData()
  }
}, { immediate: true })

watch(() => props.visible, (val) => {
  if (val && props.orderId) {
    loadData()
  }
})

function handleClose() {
  emit('close')
}
</script>

<style lang="scss" scoped>
.order-view-content {
  padding: 0 4px;

  .info-section {
    margin-bottom: 20px;

    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 12px;
      padding-left: 8px;
      border-left: 3px solid #409eff;
    }
  }
}

.highlight {
  color: #e6a23c;
  font-weight: 600;
  font-size: 16px;
}

.amount {
  font-weight: 600;
  font-size: 15px;

  &.paid { color: #67c23a; }
  &.unpaid { color: #f56c6c; }
  &.invoiced { color: #409eff; }
  &.uninvoiced { color: #909399; }
}

.progress-item {
  display: flex;
  align-items: center;
  gap: 8px;

  .progress-text {
    font-size: 13px;
    color: #606266;
  }
}

.remark-content {
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}
</style>
