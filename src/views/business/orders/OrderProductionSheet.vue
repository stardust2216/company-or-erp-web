<template>
  <div class="production-sheet">
    <div class="no-print toolbar">
      <el-button @click="router.back()">返回</el-button>
      <el-button type="primary" @click="doPrint">打印 / 导出 PDF</el-button>
      <span class="hint">建议使用 A4 纵向打印；打印时自动隐藏侧栏与顶栏。</span>
    </div>

    <template v-if="order">
      <header class="sheet-head">
        <h1>生产计划单</h1>
        <div class="meta">
          <span>订单号：{{ order.orderNo }}</span>
          <span>子公司：{{ subsidiaryLabel(order.subsidiaryId) }}</span>
          <span>客户：{{ order.customer }}</span>
        </div>
        <div class="meta">
          <span>交货地址：{{ order.deliveryAddress || '—' }}</span>
          <span>计划完成：{{ order.expectedFinishDate || '—' }}</span>
          <span>制表日期：{{ printDate }}</span>
        </div>
      </header>

      <table class="grid">
        <thead>
          <tr>
            <th style="width: 8%">序号</th>
            <th style="width: 22%">产品名称</th>
            <th style="width: 22%">规格要求</th>
            <th style="width: 10%">数量</th>
            <th style="width: 8%">单位</th>
            <th style="width: 12%">单价(元)</th>
            <th style="width: 12%">金额(元)</th>
            <th style="width: 6%">备注</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(line, idx) in order.lines" :key="line.id">
            <td>{{ idx + 1 }}</td>
            <td>{{ line.productName }}</td>
            <td>{{ line.spec }}</td>
            <td class="num">{{ line.qty }}</td>
            <td>{{ line.unit }}</td>
            <td class="num">{{ line.unitPrice.toFixed(2) }}</td>
            <td class="num">{{ (line.qty * line.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</td>
            <td></td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="6" class="right">合计</td>
            <td class="num strong">¥{{ order.amount.toLocaleString() }}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>

      <section class="sign">
        <div>生产负责人签字：_______________</div>
        <div>质检签字：_______________</div>
        <div>仓库发料签字：_______________</div>
      </section>

      <p class="foot-note">本单据依据《结构说明》生产计划单要求生成，仅供车间与仓储协同使用（演示数据）。</p>
    </template>

    <el-empty v-else class="no-print" description="未找到订单" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrdersStore } from '@/stores/orders'
import { subsidiaryLabel } from '@/constants/subsidiary'

const route = useRoute()
const router = useRouter()
const ordersStore = useOrdersStore()

const order = computed(() => ordersStore.getById(route.params.id as string))

const printDate = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})

function doPrint() {
  window.print()
}
</script>

<style lang="scss" scoped>
.production-sheet {
  max-width: 900px;
  margin: 0 auto;
}

.no-print.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  .hint {
    font-size: 12px;
    color: #909399;
  }
}

.sheet-head {
  text-align: center;
  margin-bottom: 20px;
  h1 {
    margin: 0 0 12px;
    font-size: 22px;
    letter-spacing: 4px;
  }
  .meta {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 16px 24px;
    font-size: 13px;
    color: #333;
    margin-top: 6px;
  }
}

.grid {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  th,
  td {
    border: 1px solid #333;
    padding: 8px 6px;
    text-align: left;
  }
  th {
    background: #f5f5f5;
    font-weight: 600;
  }
  .num {
    text-align: right;
  }
  .right {
    text-align: right;
    font-weight: 600;
  }
  .strong {
    font-weight: 700;
  }
}

.sign {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-top: 36px;
  font-size: 13px;
  flex-wrap: wrap;
}

.foot-note {
  margin-top: 28px;
  font-size: 12px;
  color: #666;
  line-height: 1.6;
}
</style>

<style lang="scss">
/* 打印时隐藏布局框架，突出计划单（与 TagsView 根类名配合） */
@media print {
  .tags-view-container .layout-header,
  .tags-view-container .sidebar,
  .tags-view-container .tags-view-wrapper {
    display: none !important;
  }
  .tags-view-container .main-content {
    margin-left: 0 !important;
    margin-top: 0 !important;
    min-height: auto !important;
  }
  .tags-view-container .page-content {
    padding: 12px !important;
    background: #fff !important;
  }
  .no-print {
    display: none !important;
  }
}
</style>
