<template>
  <div class="longzhou-order-detail">
    <div class="page-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" @click="goBack">返回</el-button>
        <h1 class="header-title">订单详情</h1>
      </div>
      <div class="header-right">
        <el-button type="warning" :icon="Edit" @click="handleEdit">编辑</el-button>
        <el-button type="success" :icon="Printer" @click="handlePrint">打印生产计划单</el-button>
        <el-button type="primary" :icon="Select" @click="handleApprove" v-if="orderData?.status === 'pending'">审核通过</el-button>
      </div>
    </div>

    <el-row :gutter="20" v-if="orderData">
      <!-- 基本信息 -->
      <el-col :span="16">
        <el-card shadow="never" class="info-card">
          <template #header><span>基本信息</span></template>
          <el-descriptions :column="2" border size="default">
            <el-descriptions-item label="客户名称">{{ orderData.customerName }}</el-descriptions-item>
            <el-descriptions-item label="集团名称">{{ orderData.groupName }}</el-descriptions-item>
            <el-descriptions-item label="使用单位">{{ orderData.useUnit }}</el-descriptions-item>
            <el-descriptions-item label="签订日期">{{ orderData.signDate }}</el-descriptions-item>
            <el-descriptions-item label="合同编号" :span="2">{{ orderData.contractNo }}</el-descriptions-item>
            <el-descriptions-item label="订单状态">
              <el-tag :type="statusTagType(orderData.status)">{{ statusLabel(orderData.status) }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="订单数量">{{ orderData.orderQuantity }} 套</el-descriptions-item>
            <el-descriptions-item label="单价">{{ orderData.unitPrice }} 元/套</el-descriptions-item>
            <el-descriptions-item label="合同金额">{{ orderData.contractAmount }} 元</el-descriptions-item>
            <el-descriptions-item label="剩余库存">{{ orderData.remainingStock }} 套</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 产品规格 -->
        <el-card shadow="never" class="info-card">
          <template #header><span>产品规格</span></template>
          <el-descriptions :column="2" border size="default">
            <el-descriptions-item label="产品名称">{{ orderData.productName }}</el-descriptions-item>
            <el-descriptions-item label="外袋规格">{{ orderData.outerBagSpec }}</el-descriptions-item>
            <el-descriptions-item label="布筒规格">{{ orderData.clothSpec }}</el-descriptions-item>
            <el-descriptions-item label="内袋规格">{{ orderData.innerBagSpec }}</el-descriptions-item>
            <el-descriptions-item label="袋口" :span="2">
              {{ formatBool(orderData.mouthGeneral, '一般') }} {{ formatBool(orderData.mouthFlip, '翻口') }} {{ formatBool(orderData.mouthRing, '圈口') }}
            </el-descriptions-item>
            <el-descriptions-item label="袋底" :span="2">
              {{ formatBool(orderData.bottomConnected, '连膜车底') }} {{ formatBool(orderData.bottomNonConnected, '非连膜车底') }}
            </el-descriptions-item>
            <el-descriptions-item label="印刷" :span="2">
              {{ formatBool(orderData.printSingle, '单面') }} {{ formatBool(orderData.printDouble, '双面') }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>

      <!-- 状态跟踪 -->
      <el-col :span="8">
        <el-card shadow="never" class="status-card">
          <template #header><span>状态跟踪</span></template>
          <el-steps :active="statusStep" finish-status="success" direction="vertical">
            <el-step title="待审核" description="订单已提交，等待审核" />
            <el-step title="生产中" description="订单已进入生产环节" />
            <el-step title="已发货" description="订单已发货" />
            <el-step title="已开票" description="发票已开具" />
            <el-step title="回款进度" description="跟踪回款情况" />
          </el-steps>
        </el-card>

        <!-- 库存联动信息 -->
        <el-card shadow="never" class="stock-card">
          <template #header><span>库存联动</span></template>
          <el-descriptions :column="1" border size="small">
            <el-descriptions-item label="订单数量">{{ orderData.orderQuantity }} 套</el-descriptions-item>
            <el-descriptions-item label="已发货量">{{ orderData.orderQuantity - orderData.remainingStock }} 套</el-descriptions-item>
            <el-descriptions-item label="剩余库存">
              <span :class="{ 'text-danger': orderData.remainingStock < 1000 }">{{ orderData.remainingStock }} 套</span>
            </el-descriptions-item>
            <el-descriptions-item label="库存预警">
              <el-tag :type="orderData.remainingStock < 1000 ? 'danger' : 'success'" size="small">
                {{ orderData.remainingStock < 1000 ? '库存不足' : '库存充足' }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Edit, Printer, Select } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const orderId = computed(() => route.params.id)

// Mock 订单数据（与 OrderList 对应）
interface OrderDetail {
  id: number
  customerName: string
  groupName: string
  useUnit: string
  signDate: string
  unitOrderNo: string
  contractNo: string
  productName: string
  outerBagSpec: string
  clothSpec: string
  innerBagSpec: string
  mouthGeneral: string
  mouthFlip: string
  mouthRing: string
  bottomConnected: string
  bottomNonConnected: string
  printSingle: string
  printDouble: string
  orderQuantity: number
  unitPrice: number
  contractAmount: number
  status: 'pending' | 'producing' | 'shipped' | 'invoiced' | 'paid'
  remainingStock: number
}

const orderData = ref<OrderDetail | null>(null)

// 模拟加载数据
const mockDetail: Record<number, OrderDetail> = {
  1: { id: 1, customerName: 'A集团', groupName: 'A集团', useUnit: 'A糖业有限公司', signDate: '2026-04-30', unitOrderNo: '1', contractNo: '2026XXXX01', productName: '一级白砂糖袋', outerBagSpec: '66*96', clothSpec: '69*108', innerBagSpec: '无', mouthGeneral: '是', mouthFlip: '否', mouthRing: '否', bottomConnected: '否', bottomNonConnected: '是', printSingle: '是', printDouble: '否', orderQuantity: 50000, unitPrice: 1.85, contractAmount: 92500, status: 'producing', remainingStock: 35000 },
  2: { id: 2, customerName: 'A集团', groupName: 'A集团', useUnit: 'A糖业有限公司', signDate: '2026-04-30', unitOrderNo: '2', contractNo: '2026XXXX01', productName: '二级白砂糖袋', outerBagSpec: '66*96', clothSpec: '', innerBagSpec: '', mouthGeneral: '是', mouthFlip: '否', mouthRing: '否', bottomConnected: '否', bottomNonConnected: '是', printSingle: '是', printDouble: '否', orderQuantity: 30000, unitPrice: 1.85, contractAmount: 55500, status: 'producing', remainingStock: 21000 }
}

orderData.value = mockDetail[Number(orderId.value)] || null

// 状态相关
const statusStep = computed(() => {
  if (!orderData.value) return 0
  const map: Record<string, number> = { pending: 0, producing: 1, shipped: 2, invoiced: 3, paid: 4 }
  return map[orderData.value.status] ?? 0
})

const statusLabel = (status: string): string => {
  const map: Record<string, string> = { pending: '待审核', producing: '生产中', shipped: '已发货', invoiced: '已开票', paid: '回款进度' }
  return map[status] || status
}

const statusTagType = (status: string): string => {
  const map: Record<string, string> = { pending: 'info', producing: 'warning', shipped: 'success', invoiced: '', paid: 'danger' }
  return map[status] || ''
}

const formatBool = (val: string, label: string) => val === '是' ? label : ''

// 操作
const goBack = () => router.push('/business/longzhou/orders')
const handleEdit = () => console.log('编辑订单')
const handlePrint = () => console.log('打印生产计划单')
const handleApprove = () => { if (orderData.value) orderData.value.status = 'producing' }
</script>

<style lang="scss" scoped>
@use '@/scss/variables' as *;

.longzhou-order-detail {
  padding: 0 $spacing-5;
  background: $color-gray-100;
  min-height: 100vh;

  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-5 $spacing-6;
    background: #fff;
    border-radius: $border-radius-lg;
    box-shadow: $shadow-sm;
    margin-bottom: $spacing-5;
    margin-top: $spacing-5;

    .header-left {
      display: flex;
      align-items: center;
      gap: $spacing-4;
    }

    .header-title {
      font-size: $font-size-xl;
      font-weight: $font-weight-bold;
      color: $color-gray-900;
      margin: 0;
    }
  }

  .info-card,
  .status-card,
  .stock-card {
    margin-bottom: $spacing-5;
    border-radius: $border-radius-lg;
    box-shadow: $shadow-base;
  }

  .text-danger {
    color: $color-danger;
    font-weight: $font-weight-bold;
  }
}
</style>
