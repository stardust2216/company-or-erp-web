<template>
  <div class="huawei-procurement-report">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">华维食品添加剂 - 采购销售报表</h1>
      <p class="page-description">
        对应Excel：硫磺采购合同统计表、入库明细、销售合同统计表、出库明细
      </p>
    </div>

    <!-- 快捷入口 -->
    <el-row :gutter="20" class="entry-cards">
      <el-col :span="8">
        <el-card class="entry-card" shadow="hover" @click="goToPurchase">
          <div class="entry-icon">
            <el-icon><ShoppingCart /></el-icon>
          </div>
          <div class="entry-title">采购合同统计</div>
          <div class="entry-desc">查看硫磺采购合同统计表</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="entry-card" shadow="hover" @click="goToSales">
          <div class="entry-icon">
            <el-icon><Sell /></el-icon>
          </div>
          <div class="entry-title">销售合同统计</div>
          <div class="entry-desc">查看销售合同统计表</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="entry-card" shadow="hover" @click="goToStock">
          <div class="entry-icon">
            <el-icon><Box /></el-icon>
          </div>
          <div class="entry-title">入出库明细</div>
          <div class="entry-desc">查看入库/出库明细数据</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 关键指标卡片 -->
    <el-row :gutter="20" class="stat-cards">
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-label">本月采购额(万元)</div>
          <div class="stat-value">586.50</div>
          <div class="stat-trend up">
            <el-icon><ArrowUp /></el-icon>
            <span>15.8%</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-label">本月销售额(万元)</div>
          <div class="stat-value">723.80</div>
          <div class="stat-trend up">
            <el-icon><ArrowUp /></el-icon>
            <span>22.5%</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-label">库存数量(吨)</div>
          <div class="stat-value">256.8</div>
          <div class="stat-trend down">
            <el-icon><ArrowDown /></el-icon>
            <span>5.2%</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-label">毛利率</div>
          <div class="stat-value">18.6%</div>
          <div class="stat-trend up">
            <el-icon><ArrowUp /></el-icon>
            <span>2.3%</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 采购合同统计表 -->
    <el-card class="data-table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>硫磺采购合同统计表</span>
          <div class="header-actions">
            <el-date-picker
              v-model="purchaseDateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              size="small"
            />
            <el-button type="primary" size="small" :icon="Search">查询</el-button>
            <el-button size="small" :icon="Download">导出</el-button>
          </div>
        </div>
      </template>

      <el-table
        :data="purchaseData"
        stripe
        border
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="contractNo" label="合同编号" width="140" />
        <el-table-column prop="supplierName" label="供应商名称" min-width="180" />
        <el-table-column prop="productName" label="产品名称" width="120" />
        <el-table-column prop="specification" label="规格型号" width="100" />
        <el-table-column prop="quantity" label="采购数量(吨)" width="110" align="right" />
        <el-table-column prop="unitPrice" label="单价(元)" width="100" align="right">
          <template #default="{ row }">
            {{ formatMoney(row.unitPrice) }}
          </template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="合同金额(元)" width="130" align="right">
          <template #default="{ row }">
            {{ formatMoney(row.totalAmount) }}
          </template>
        </el-table-column>
        <el-table-column prop="signDate" label="签订日期" width="120" />
        <el-table-column prop="deliveryDate" label="交货日期" width="120" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getContractStatusType(row.status)" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="purchasePage"
          v-model:page-size="purchasePageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="purchaseTotal"
          @size-change="handlePurchaseSizeChange"
          @current-change="handlePurchaseCurrentChange"
        />
      </div>
    </el-card>

    <!-- 销售合同统计表 -->
    <el-card class="data-table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>销售合同统计表</span>
          <div class="header-actions">
            <el-date-picker
              v-model="salesDateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              size="small"
            />
            <el-button type="primary" size="small" :icon="Search">查询</el-button>
            <el-button size="small" :icon="Download">导出</el-button>
          </div>
        </div>
      </template>

      <el-table
        :data="salesData"
        stripe
        border
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="contractNo" label="合同编号" width="140" />
        <el-table-column prop="customerName" label="客户名称" min-width="180" />
        <el-table-column prop="productName" label="产品名称" width="120" />
        <el-table-column prop="specification" label="规格型号" width="100" />
        <el-table-column prop="quantity" label="销售数量(吨)" width="110" align="right" />
        <el-table-column prop="unitPrice" label="单价(元)" width="100" align="right">
          <template #default="{ row }">
            {{ formatMoney(row.unitPrice) }}
          </template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="合同金额(元)" width="130" align="right">
          <template #default="{ row }">
            {{ formatMoney(row.totalAmount) }}
          </template>
        </el-table-column>
        <el-table-column prop="signDate" label="签订日期" width="120" />
        <el-table-column prop="deliveryDate" label="交货日期" width="120" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getContractStatusType(row.status)" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="salesPage"
          v-model:page-size="salesPageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="salesTotal"
          @size-change="handleSalesSizeChange"
          @current-change="handleSalesCurrentChange"
        />
      </div>
    </el-card>

    <!-- 入出库明细 -->
    <el-card class="data-table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>入出库明细</span>
          <div class="header-actions">
            <el-radio-group v-model="stockType" size="small">
              <el-radio-button label="all">全部</el-radio-button>
              <el-radio-button label="in">入库</el-radio-button>
              <el-radio-button label="out">出库</el-radio-button>
            </el-radio-group>
            <el-date-picker
              v-model="stockDateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              size="small"
              style="margin-left: 12px;"
            />
            <el-button type="primary" size="small" :icon="Search" style="margin-left: 12px;">查询</el-button>
            <el-button size="small" :icon="Download">导出</el-button>
          </div>
        </div>
      </template>

      <el-table
        :data="filteredStockData"
        stripe
        border
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="type" label="类型" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.type === '入库' ? 'success' : 'warning'" size="small">
              {{ row.type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="documentNo" label="单据编号" width="140" />
        <el-table-column prop="contractNo" label="关联合同" width="140" />
        <el-table-column prop="partyName" label="往来单位" min-width="180" />
        <el-table-column prop="productName" label="产品名称" width="120" />
        <el-table-column prop="quantity" label="数量(吨)" width="100" align="right" />
        <el-table-column prop="warehouse" label="仓库" width="120" />
        <el-table-column prop="operator" label="操作员" width="100" />
        <el-table-column prop="operateTime" label="操作时间" width="160" />
        <el-table-column prop="remark" label="备注" min-width="150" />
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="stockPage"
          v-model:page-size="stockPageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="stockTotal"
          @size-change="handleStockSizeChange"
          @current-change="handleStockCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ShoppingCart, Sell, Box, ArrowUp, ArrowDown, Search, Download } from '@element-plus/icons-vue'

// 加载状态
const loading = ref(false)

// 日期范围
const purchaseDateRange = ref([])
const salesDateRange = ref([])
const stockDateRange = ref([])
const stockType = ref('all')

// 分页 - 采购
const purchasePage = ref(1)
const purchasePageSize = ref(20)
const purchaseTotal = ref(86)

// 分页 - 销售
const salesPage = ref(1)
const salesPageSize = ref(20)
const salesTotal = ref(112)

// 分页 - 入出库
const stockPage = ref(1)
const stockPageSize = ref(20)
const stockTotal = ref(256)

// 采购合同数据
const purchaseData = reactive([
  {
    contractNo: 'HWCG202405001',
    supplierName: '山东硫磺化工有限公司',
    productName: '工业硫磺',
    specification: '99.9%',
    quantity: 50,
    unitPrice: 2850,
    totalAmount: 142500,
    signDate: '2024-05-01',
    deliveryDate: '2024-05-10',
    status: '已完成'
  },
  {
    contractNo: 'HWCG202405002',
    supplierName: '江苏精细化工集团',
    productName: '食品级硫磺',
    specification: '99.95%',
    quantity: 30,
    unitPrice: 3200,
    totalAmount: 96000,
    signDate: '2024-05-05',
    deliveryDate: '2024-05-15',
    status: '执行中'
  },
  {
    contractNo: 'HWCG202405003',
    supplierName: '河北化工原料有限公司',
    productName: '工业硫磺',
    specification: '99.5%',
    quantity: 80,
    unitPrice: 2680,
    totalAmount: 214400,
    signDate: '2024-05-08',
    deliveryDate: '2024-05-20',
    status: '执行中'
  },
  {
    contractNo: 'HWCG202405004',
    supplierName: '天津港化工贸易公司',
    productName: '橡胶用硫磺',
    specification: '99.8%',
    quantity: 45,
    unitPrice: 2950,
    totalAmount: 132750,
    signDate: '2024-05-12',
    deliveryDate: '2024-05-25',
    status: '待执行'
  },
  {
    contractNo: 'HWCG202405005',
    supplierName: '辽宁石油化工集团',
    productName: '工业硫磺',
    specification: '99.9%',
    quantity: 60,
    unitPrice: 2780,
    totalAmount: 166800,
    signDate: '2024-05-15',
    deliveryDate: '2024-05-28',
    status: '待执行'
  }
])

// 销售合同数据
const salesData = reactive([
  {
    contractNo: 'HWXS202405001',
    customerName: '广东食品添加剂有限公司',
    productName: '食品级硫磺',
    specification: '99.95%',
    quantity: 20,
    unitPrice: 3850,
    totalAmount: 77000,
    signDate: '2024-05-02',
    deliveryDate: '2024-05-12',
    status: '已完成'
  },
  {
    contractNo: 'HWXS202405002',
    customerName: '浙江橡胶制品厂',
    productName: '橡胶用硫磺',
    specification: '99.8%',
    quantity: 35,
    unitPrice: 3450,
    totalAmount: 120750,
    signDate: '2024-05-06',
    deliveryDate: '2024-05-18',
    status: '执行中'
  },
  {
    contractNo: 'HWXS202405003',
    customerName: '福建化工贸易有限公司',
    productName: '工业硫磺',
    specification: '99.9%',
    quantity: 50,
    unitPrice: 3280,
    totalAmount: 164000,
    signDate: '2024-05-09',
    deliveryDate: '2024-05-22',
    status: '执行中'
  },
  {
    contractNo: 'HWXS202405004',
    customerName: '江西农药生产企业',
    productName: '工业硫磺',
    specification: '99.5%',
    quantity: 40,
    unitPrice: 3150,
    totalAmount: 126000,
    signDate: '2024-05-11',
    deliveryDate: '2024-05-24',
    status: '待执行'
  },
  {
    contractNo: 'HWXS202405005',
    customerName: '湖南造纸化工厂',
    productName: '工业硫磺',
    specification: '99.5%',
    quantity: 55,
    unitPrice: 3080,
    totalAmount: 169400,
    signDate: '2024-05-14',
    deliveryDate: '2024-05-26',
    status: '待执行'
  }
])

// 入出库明细数据
const stockData = reactive([
  {
    type: '入库',
    documentNo: 'HWRK202405001',
    contractNo: 'HWCG202405001',
    partyName: '山东硫磺化工有限公司',
    productName: '工业硫磺',
    quantity: 50,
    warehouse: '1号仓库',
    operator: '张三',
    operateTime: '2024-05-10 09:30:00',
    remark: '采购入库'
  },
  {
    type: '出库',
    documentNo: 'HWCK202405001',
    contractNo: 'HWXS202405001',
    partyName: '广东食品添加剂有限公司',
    productName: '食品级硫磺',
    quantity: 20,
    warehouse: '2号仓库',
    operator: '李四',
    operateTime: '2024-05-12 14:20:00',
    remark: '销售出库'
  },
  {
    type: '入库',
    documentNo: 'HWRK202405002',
    contractNo: 'HWCG202405002',
    partyName: '江苏精细化工集团',
    productName: '食品级硫磺',
    quantity: 30,
    warehouse: '2号仓库',
    operator: '张三',
    operateTime: '2024-05-15 10:15:00',
    remark: '采购入库'
  },
  {
    type: '出库',
    documentNo: 'HWCK202405002',
    contractNo: 'HWXS202405002',
    partyName: '浙江橡胶制品厂',
    productName: '橡胶用硫磺',
    quantity: 35,
    warehouse: '1号仓库',
    operator: '李四',
    operateTime: '2024-05-18 16:45:00',
    remark: '销售出库'
  },
  {
    type: '入库',
    documentNo: 'HWRK202405003',
    contractNo: 'HWCG202405003',
    partyName: '河北化工原料有限公司',
    productName: '工业硫磺',
    quantity: 40,
    warehouse: '1号仓库',
    operator: '张三',
    operateTime: '2024-05-20 11:00:00',
    remark: '采购入库-部分'
  }
])

// 过滤后的入出库数据
const filteredStockData = computed(() => {
  if (stockType.value === 'all') {
    return stockData
  }
  return stockData.filter(item => {
    if (stockType.value === 'in') {
      return item.type === '入库'
    } else {
      return item.type === '出库'
    }
  })
})

// 格式化金额
const formatMoney = (value) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 0
  }).format(value)
}

// 获取合同状态类型
const getContractStatusType = (status) => {
  const statusMap = {
    '已完成': 'success',
    '执行中': 'primary',
    '待执行': 'info',
    '已终止': 'danger'
  }
  return statusMap[status] || 'info'
}

// 分页事件 - 采购
const handlePurchaseSizeChange = (val) => {
  purchasePageSize.value = val
}

const handlePurchaseCurrentChange = (val) => {
  purchasePage.value = val
}

// 分页事件 - 销售
const handleSalesSizeChange = (val) => {
  salesPageSize.value = val
}

const handleSalesCurrentChange = (val) => {
  salesPage.value = val
}

// 分页事件 - 入出库
const handleStockSizeChange = (val) => {
  stockPageSize.value = val
}

const handleStockCurrentChange = (val) => {
  stockPage.value = val
}

// 快捷入口跳转
const goToPurchase = () => {
  console.log('跳转到采购合同统计')
}

const goToSales = () => {
  console.log('跳转到销售合同统计')
}

const goToStock = () => {
  console.log('跳转到入出库明细')
}
</script>

<style lang="scss" scoped>
.huawei-procurement-report {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;

  .page-header {
    margin-bottom: 24px;

    .page-title {
      font-size: 24px;
      font-weight: 600;
      color: #303133;
      margin: 0 0 8px 0;
    }

    .page-description {
      font-size: 14px;
      color: #909399;
      margin: 0;
    }
  }

  .entry-cards {
    margin-bottom: 24px;

    .entry-card {
      cursor: pointer;
      transition: all 0.3s;
      text-align: center;
      padding: 20px;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
      }

      .entry-icon {
        font-size: 48px;
        color: #409eff;
        margin-bottom: 12px;

        .el-icon {
          font-size: 48px;
        }
      }

      .entry-title {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 8px;
      }

      .entry-desc {
        font-size: 13px;
        color: #909399;
      }
    }
  }

  .stat-cards {
    margin-bottom: 24px;

    .stat-card {
      text-align: center;
      padding: 20px;

      .stat-label {
        font-size: 14px;
        color: #909399;
        margin-bottom: 12px;
      }

      .stat-value {
        font-size: 28px;
        font-weight: 700;
        color: #303133;
        margin-bottom: 8px;
      }

      .stat-trend {
        font-size: 13px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;

        &.up {
          color: #67c23a;
        }

        &.down {
          color: #f56c6c;
        }

        .el-icon {
          font-size: 12px;
        }
      }
    }
  }

  .data-table-card {
    margin-bottom: 24px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
      color: #303133;

      .header-actions {
        display: flex;
        align-items: center;
      }
    }

    .pagination-wrapper {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>
