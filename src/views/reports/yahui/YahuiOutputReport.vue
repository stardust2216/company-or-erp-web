<template>
  <div class="yahui-output-report">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">亚辉塑业 - 产量产值报表</h1>
      <p class="page-description">
        对应Excel：亚辉塑业订单管理统计表A/B/C + 8个工序日报
      </p>
    </div>

    <!-- 快捷入口 -->
    <el-row :gutter="20" class="entry-cards">
      <el-col :span="8">
        <el-card class="entry-card" shadow="hover" @click="goToOrderStats">
          <div class="entry-icon">
            <el-icon><Document /></el-icon>
          </div>
          <div class="entry-title">订单统计</div>
          <div class="entry-desc">查看订单管理统计表A/B/C</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="entry-card" shadow="hover" @click="goToProduction">
          <div class="entry-icon">
            <el-icon><OfficeBuilding /></el-icon>
          </div>
          <div class="entry-title">生产报表</div>
          <div class="entry-desc">查看8个工序日报数据</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="entry-card" shadow="hover" @click="goToInventory">
          <div class="entry-icon">
            <el-icon><Box /></el-icon>
          </div>
          <div class="entry-title">库存报表</div>
          <div class="entry-desc">查看库存统计与分析</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 关键指标卡片 -->
    <el-row :gutter="20" class="stat-cards">
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-label">本月订单数</div>
          <div class="stat-value">1,286</div>
          <div class="stat-trend up">
            <el-icon><ArrowUp /></el-icon>
            <span>12.5%</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-label">本月产量(吨)</div>
          <div class="stat-value">856.32</div>
          <div class="stat-trend up">
            <el-icon><ArrowUp /></el-icon>
            <span>8.3%</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-label">本月产值(万元)</div>
          <div class="stat-value">1,256.80</div>
          <div class="stat-trend up">
            <el-icon><ArrowUp /></el-icon>
            <span>15.2%</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-label">库存周转率</div>
          <div class="stat-value">4.2</div>
          <div class="stat-trend down">
            <el-icon><ArrowDown /></el-icon>
            <span>2.1%</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据表格区域 -->
    <el-card class="data-table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>订单生产汇总表</span>
          <div class="header-actions">
            <el-date-picker
              v-model="dateRange"
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
        :data="tableData"
        stripe
        border
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="orderNo" label="订单编号" width="140" />
        <el-table-column prop="customerName" label="客户名称" min-width="150" />
        <el-table-column prop="productName" label="产品名称" min-width="150" />
        <el-table-column prop="orderQuantity" label="订单数量" width="100" align="right" />
        <el-table-column prop="completedQuantity" label="已完成" width="100" align="right" />
        <el-table-column prop="productionProcess" label="生产工序" width="120">
          <template #default="{ row }">
            <el-tag v-for="process in row.processes" :key="process" size="small" class="process-tag">
              {{ process }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="outputValue" label="产值(元)" width="120" align="right">
          <template #default="{ row }">
            {{ formatMoney(row.outputValue) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="deliveryDate" label="交货日期" width="120" />
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 工序产量统计 -->
    <el-card class="process-stats-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>8大工序产量统计</span>
          <el-radio-group v-model="timeRange" size="small">
            <el-radio-button label="day">今日</el-radio-button>
            <el-radio-button label="week">本周</el-radio-button>
            <el-radio-button label="month">本月</el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <el-row :gutter="20">
        <el-col :span="6" v-for="process in processList" :key="process.name">
          <div class="process-item">
            <div class="process-name">{{ process.name }}</div>
            <div class="process-output">{{ process.output }} <span class="unit">吨</span></div>
            <div class="process-completion">
              完成率: <span :class="process.rate >= 100 ? 'success' : 'warning'">{{ process.rate }}%</span>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Document, OfficeBuilding, Box, ArrowUp, ArrowDown, Search, Download } from '@element-plus/icons-vue'

// 日期范围
const dateRange = ref([])
const timeRange = ref('month')
const loading = ref(false)

// 分页
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(156)

// 工序列表
const processList = reactive([
  { name: '配料工序', output: 128.5, rate: 98.5 },
  { name: '挤出工序', output: 256.3, rate: 102.3 },
  { name: '压延工序', output: 189.2, rate: 95.8 },
  { name: '复合工序', output: 145.6, rate: 99.2 },
  { name: '分切工序', output: 198.4, rate: 101.5 },
  { name: '印刷工序', output: 167.8, rate: 97.6 },
  { name: '制袋工序', output: 234.5, rate: 103.2 },
  { name: '包装工序', output: 156.3, rate: 96.4 }
])

// 表格数据
const tableData = reactive([
  {
    orderNo: 'YH202405001',
    customerName: '华东塑料制品有限公司',
    productName: 'PE薄膜袋',
    orderQuantity: 50000,
    completedQuantity: 48500,
    processes: ['配料', '挤出', '制袋'],
    outputValue: 256800,
    status: '生产中',
    deliveryDate: '2024-05-20'
  },
  {
    orderNo: 'YH202405002',
    customerName: '华南包装材料厂',
    productName: 'PP编织袋',
    orderQuantity: 30000,
    completedQuantity: 30000,
    processes: ['配料', '挤出', '编织', '复合'],
    outputValue: 189500,
    status: '已完成',
    deliveryDate: '2024-05-18'
  },
  {
    orderNo: 'YH202405003',
    customerName: '北方塑料集团',
    productName: '复合膜卷材',
    orderQuantity: 80000,
    completedQuantity: 32000,
    processes: ['配料', '挤出', '压延', '复合', '分切'],
    outputValue: 456200,
    status: '生产中',
    deliveryDate: '2024-05-25'
  },
  {
    orderNo: 'YH202405004',
    customerName: '西部包装公司',
    productName: '彩色印刷袋',
    orderQuantity: 25000,
    completedQuantity: 25000,
    processes: ['配料', '挤出', '印刷', '制袋', '包装'],
    outputValue: 168900,
    status: '已完成',
    deliveryDate: '2024-05-15'
  },
  {
    orderNo: 'YH202405005',
    customerName: '江南塑业',
    productName: '食品级包装袋',
    orderQuantity: 60000,
    completedQuantity: 12000,
    processes: ['配料', '挤出', '压延', '印刷', '制袋'],
    outputValue: 325600,
    status: '生产中',
    deliveryDate: '2024-05-28'
  }
])

// 格式化金额
const formatMoney = (value) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 0
  }).format(value)
}

// 获取状态类型
const getStatusType = (status) => {
  const statusMap = {
    '已完成': 'success',
    '生产中': 'primary',
    '待生产': 'info',
    '已暂停': 'warning',
    '已取消': 'danger'
  }
  return statusMap[status] || 'info'
}

// 分页事件
const handleSizeChange = (val) => {
  pageSize.value = val
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}

// 快捷入口跳转
const goToOrderStats = () => {
  console.log('跳转到订单统计')
}

const goToProduction = () => {
  console.log('跳转到生产报表')
}

const goToInventory = () => {
  console.log('跳转到库存报表')
}
</script>

<style lang="scss" scoped>
.yahui-output-report {
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

  .data-table-card,
  .process-stats-card {
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
        gap: 12px;
      }
    }

    .process-tag {
      margin-right: 4px;
      margin-bottom: 4px;
    }

    .pagination-wrapper {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }

  .process-stats-card {
    .process-item {
      background-color: #f5f7fa;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
      margin-bottom: 16px;

      .process-name {
        font-size: 14px;
        color: #606266;
        margin-bottom: 8px;
      }

      .process-output {
        font-size: 24px;
        font-weight: 700;
        color: #409eff;
        margin-bottom: 8px;

        .unit {
          font-size: 14px;
          font-weight: 400;
          color: #909399;
        }
      }

      .process-completion {
        font-size: 13px;
        color: #606266;

        .success {
          color: #67c23a;
          font-weight: 600;
        }

        .warning {
          color: #e6a23c;
          font-weight: 600;
        }
      }
    }
  }
}
</style>
