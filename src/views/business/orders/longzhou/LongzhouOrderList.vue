<template>
  <div class="order-list">
    <div class="page-header">
      <div>
        <h1 class="page-title">龙州塑业 - 订单管理</h1>
        <p class="page-desc">糖袋、食品袋订单管理（对应Excel：龙州塑料26-27订单管理表）</p>
      </div>
      <el-button type="primary" @click="handleCreate">
        <el-icon><Plus /></el-icon>新建订单
      </el-button>
    </div>

    <el-card class="filter-card">
      <el-form :model="filterForm" inline>
        <el-form-item label="订单状态">
          <el-select v-model="filterForm.status" placeholder="全部状态" clearable>
            <el-option label="待审核" value="pending" />
            <el-option label="生产中" value="production" />
            <el-option label="已完成" value="completed" />
            <el-option label="已发货" value="shipped" />
          </el-select>
        </el-form-item>
        <el-form-item label="产品类型">
          <el-select v-model="filterForm.productType" placeholder="全部产品" clearable>
            <el-option label="糖袋" value="sugar_bag" />
            <el-option label="食品袋" value="food_bag" />
            <el-option label="彩印袋" value="color_print_bag" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="filterForm.keyword" placeholder="订单号/客户名" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <el-table :data="orderList" v-loading="loading" stripe>
        <el-table-column prop="orderNo" label="订单号" width="160" />
        <el-table-column prop="customer" label="客户名称" min-width="150" />
        <el-table-column label="产品信息" min-width="200">
          <template #default="{ row }">
            <div v-for="(line, idx) in row.lines.slice(0, 2)" :key="idx" class="product-line">
              {{ line.productName }} {{ line.spec }} x {{ line.qty }}{{ line.unit }}
            </div>
            <el-tag v-if="row.lines.length > 2" size="small">+{{ row.lines.length - 2 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" width="120">
          <template #default="{ row }">¥{{ row.amount.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <OrderStatusTag :status="row.status" />
          </template>
        </el-table-column>
        <el-table-column prop="expectedFinishDate" label="计划完成" width="110" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="success" @click="handleProductionSheet(row)">计划单</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus } from '@element-plus/icons-vue'
import { useOrdersStore } from '@/stores/orders'
import { storeToRefs } from 'pinia'
import OrderStatusTag from '@/components/business/OrderStatusTag.vue'

const router = useRouter()
const ordersStore = useOrdersStore()
const { list: orderList } = storeToRefs(ordersStore)

const loading = ref(false)
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

const filterForm = reactive({
  status: '',
  productType: '',
  keyword: ''
})

onMounted(() => {
  // 筛选龙州塑业的订单
  total.value = orderList.value.filter(o => o.subsidiaryId === 'longzhou').length
})

const handleSearch = () => {
  // 实现搜索逻辑
}

const handleReset = () => {
  filterForm.status = ''
  filterForm.productType = ''
  filterForm.keyword = ''
}

const handleCreate = () => {
  // 新建订单
}

const handleView = (row: any) => {
  router.push({ name: 'LongzhouOrderDetail', params: { id: row.id } })
}

const handleEdit = (_row: any) => {
  // 编辑订单
}

const handleProductionSheet = (row: any) => {
  router.push({ name: 'OrderProductionSheet', params: { id: row.id } })
}
</script>

<style scoped lang="scss">
.order-list {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  .page-title {
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 6px;
  }

  .page-desc {
    color: #666;
    font-size: 13px;
    margin: 0;
  }
}

.filter-card {
  margin-bottom: 20px;
}

.product-line {
  font-size: 13px;
  color: #606266;
  margin-bottom: 4px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
