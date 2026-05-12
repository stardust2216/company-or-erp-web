<template>
  <div class="home-page">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <div class="welcome-info">
        <h1 class="welcome-title">早上好，{{ userInfo?.realName || userInfo?.username }} 👋</h1>
        <p class="welcome-subtitle">今天是{{ currentDate }}，祝您工作顺利！</p>
      </div>
      <div class="quick-actions">
        <el-button type="primary" @click="$router.push('/business/orders')">
          <el-icon><Plus /></el-icon>
          新建订单
        </el-button>
        <el-button type="success" @click="$router.push('/approval/start')">
          <el-icon><Edit /></el-icon>
          发起审批
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card stat-orders">
        <div class="stat-icon">
          <el-icon><Document /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.pendingOrders }}</div>
          <div class="stat-label">待审核订单</div>
        </div>
        <div class="stat-trend trend-up">
          <el-icon><Top /></el-icon>
          <span>12%</span>
        </div>
      </div>
      
      <div class="stat-card stat-production">
        <div class="stat-icon">
          <el-icon><Box /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.production }}</div>
          <div class="stat-label">生产中订单</div>
        </div>
        <div class="stat-trend trend-down">
          <el-icon><Bottom /></el-icon>
          <span>5%</span>
        </div>
      </div>
      
      <div class="stat-card stat-approval">
        <div class="stat-icon">
          <el-icon><Clock /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.pendingApprovals }}</div>
          <div class="stat-label">待审批事项</div>
        </div>
        <div class="stat-badge">需处理</div>
      </div>
      
      <div class="stat-card stat-revenue">
        <div class="stat-icon">
          <el-icon><Coin /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">¥{{ stats.monthlyRevenue }}</div>
          <div class="stat-label">本月营收(万)</div>
        </div>
        <div class="stat-trend trend-up">
          <el-icon><Top /></el-icon>
          <span>18%</span>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-grid">
      <!-- 订单趋势图 -->
      <div class="chart-card chart-main">
        <div class="chart-header">
          <h3 class="chart-title">订单趋势</h3>
          <div class="chart-actions">
            <el-radio-group v-model="orderTimeRange" size="small">
              <el-radio-button label="week">本周</el-radio-button>
              <el-radio-button label="month">本月</el-radio-button>
              <el-radio-button label="halfYear">半年</el-radio-button>
              <el-radio-button label="year">本年</el-radio-button>
            </el-radio-group>
          </div>
        </div>
        <div class="chart-body">
          <v-chart :option="orderTrendOption" autoresize style="height: 300px" />
        </div>
      </div>

      <!-- 部门业绩图 -->
      <div class="chart-card chart-side">
        <div class="chart-header">
          <h3 class="chart-title">部门业绩占比</h3>
          <span class="chart-subtitle">{{ deptChartPeriodLabel }}</span>
        </div>
        <div class="chart-body">
          <v-chart :option="deptPieOption" autoresize style="height: 280px" />
        </div>
      </div>
    </div>

    <!-- 下方区域 -->
    <div class="bottom-grid">
      <!-- 待办事项 -->
      <div class="list-card">
        <div class="card-header">
          <h3 class="card-title">
            <el-icon><Clock /></el-icon>
            待办事项
          </h3>
          <el-button type="primary" text @click="$router.push('/approval/pending')">
            查看更多
            <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
        <div class="card-body">
          <div class="todo-item" v-for="item in todoList" :key="item.id">
            <div class="todo-icon" :class="item.type">
              <el-icon><component :is="item.icon" /></el-icon>
            </div>
            <div class="todo-content">
              <div class="todo-title">{{ item.title }}</div>
              <div class="todo-desc">{{ item.desc }}</div>
            </div>
            <div class="todo-time">{{ item.time }}</div>
          </div>
          <el-empty v-if="todoList.length === 0" description="暂无待办事项" />
        </div>
      </div>

      <!-- 近期订单 -->
      <div class="list-card">
        <div class="card-header">
          <h3 class="card-title">
            <el-icon><ShoppingCart /></el-icon>
            近期订单
          </h3>
          <el-button type="primary" text @click="$router.push('/business/orders')">
            查看更多
            <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
        <div class="card-body">
          <div class="order-item" v-for="order in recentOrders" :key="order.id">
            <div class="order-info">
              <div class="order-no">{{ order.orderNo }}</div>
              <div class="order-customer">{{ order.customer }}</div>
            </div>
            <div class="order-amount">¥{{ order.amount.toLocaleString() }}</div>
            <el-tag :type="getOrderStatusType(order.status)" size="small">
              {{ getOrderStatus(order.status) }}
            </el-tag>
          </div>
          <el-empty v-if="recentOrders.length === 0" description="暂无订单记录" />
        </div>
      </div>

      <!-- 快捷入口 -->
      <div class="quick-entry-card">
        <div class="card-header">
          <h3 class="card-title">
            <el-icon><Grid /></el-icon>
            快捷入口
          </h3>
        </div>
        <div class="card-body">
          <div class="quick-entry-grid">
            <div class="entry-item" @click="$router.push('/business/orders')">
              <div class="entry-icon orders">
                <el-icon><Document /></el-icon>
              </div>
              <div class="entry-label">订单管理</div>
            </div>
            <div class="entry-item" @click="$router.push('/business/customers')">
              <div class="entry-icon customers">
                <el-icon><User /></el-icon>
              </div>
              <div class="entry-label">客户管理</div>
            </div>
            <div class="entry-item" @click="$router.push('/business/inventory')">
              <div class="entry-icon inventory">
                <el-icon><Box /></el-icon>
              </div>
              <div class="entry-label">库存管理</div>
            </div>
            <div class="entry-item" @click="$router.push('/approval/start')">
              <div class="entry-icon approval">
                <el-icon><Edit /></el-icon>
              </div>
              <div class="entry-label">发起审批</div>
            </div>
            <div class="entry-item" @click="$router.push('/reports/output')">
              <div class="entry-icon reports">
                <el-icon><DataLine /></el-icon>
              </div>
              <div class="entry-label">数据报表</div>
            </div>
            <div class="entry-item" @click="$router.push('/system/users')">
              <div class="entry-icon system">
                <el-icon><Setting /></el-icon>
              </div>
              <div class="entry-label">系统设置</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, PieChart } from 'echarts/charts'
import { 
  TitleComponent, 
  TooltipComponent, 
  LegendComponent,
  GridComponent 
} from 'echarts/components'
import VChart from 'vue-echarts'
import { 
  Plus, Edit, Document, Box, Clock, Coin, Top, Bottom,
  ArrowRight, ShoppingCart, Grid, User, DataLine, Setting
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

// 注册 ECharts 组件
use([
  CanvasRenderer,
  LineChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

// Store
const authStore = useAuthStore()
const { userInfo } = storeToRefs(authStore)

// 当前日期
const currentDate = computed(() => {
  const now = new Date()
  return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${['周日', '周一', '周二', '周三', '周四', '周五', '周六'][now.getDay()]}`
})

// 订单趋势时间范围（与部门业绩联动）
type OrderTimeRange = 'week' | 'month' | 'halfYear' | 'year'

const orderTimeRange = ref<OrderTimeRange>('month')

/** 伪数据：各时间维度下的订单趋势（横轴 + 双折线） */
const mockOrderTrendByRange: Record<
  OrderTimeRange,
  { categories: string[]; orders: number[]; completed: number[] }
> = {
  week: {
    categories: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    orders: [42, 55, 48, 61, 73, 38, 29],
    completed: [36, 48, 42, 54, 65, 32, 24]
  },
  month: {
    categories: ['第1周', '第2周', '第3周', '第4周'],
    orders: [186, 214, 198, 236],
    completed: [162, 188, 172, 205]
  },
  halfYear: {
    categories: ['1月', '2月', '3月', '4月', '5月', '6月'],
    orders: [820, 765, 902, 880, 940, 1010],
    completed: [710, 668, 788, 762, 815, 876]
  },
  year: {
    categories: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    orders: [720, 680, 810, 790, 860, 920, 880, 910, 870, 940, 980, 1050],
    completed: [620, 590, 700, 685, 740, 795, 760, 780, 750, 810, 840, 900]
  }
}

/** 伪数据：与左侧时间范围对应的部门业绩（万元，饼图数值） */
const mockDeptPerformanceByRange: Record<
  OrderTimeRange,
  { value: number; name: string; color: string }[]
> = {
  week: [
    { value: 8.6, name: '销售一部', color: '#0070f3' },
    { value: 6.2, name: '销售二部', color: '#06d6a0' },
    { value: 4.1, name: '销售三部', color: '#ff9500' },
    { value: 2.4, name: '其他', color: '#8c8c8c' }
  ],
  month: [
    { value: 45, name: '销售一部', color: '#0070f3' },
    { value: 28, name: '销售二部', color: '#06d6a0' },
    { value: 15, name: '销售三部', color: '#ff9500' },
    { value: 12, name: '其他', color: '#8c8c8c' }
  ],
  halfYear: [
    { value: 128, name: '销售一部', color: '#0070f3' },
    { value: 96, name: '销售二部', color: '#06d6a0' },
    { value: 62, name: '销售三部', color: '#ff9500' },
    { value: 41, name: '其他', color: '#8c8c8c' }
  ],
  year: [
    { value: 286, name: '销售一部', color: '#0070f3' },
    { value: 198, name: '销售二部', color: '#06d6a0' },
    { value: 142, name: '销售三部', color: '#ff9500' },
    { value: 84, name: '其他', color: '#8c8c8c' }
  ]
}

const deptChartPeriodLabel = computed(() => {
  const map: Record<OrderTimeRange, string> = {
    week: '本周',
    month: '本月',
    halfYear: '近半年',
    year: '本年'
  }
  return map[orderTimeRange.value]
})

// 统计数据
const stats = ref({
  pendingOrders: 12,
  production: 28,
  pendingApprovals: 5,
  monthlyRevenue: 156.8
})

// 待办事项
const todoList = ref([
  { id: 1, type: 'approval', icon: 'Clock', title: '审批订单-2024001', desc: '亚辉塑业编织袋订单', time: '10分钟前' },
  { id: 2, type: 'order', icon: 'Document', title: '处理生产计划', desc: '龙州塑业糖袋生产', time: '30分钟前' },
  { id: 3, type: 'warning', icon: 'Warning', title: '库存预警', desc: '原材料不足', time: '1小时前' }
])

// 近期订单
const recentOrders = ref([
  { id: 1, orderNo: 'ORD-20240501-001', customer: '亚辉塑业有限公司', amount: 128000, status: 'pending' },
  { id: 2, orderNo: 'ORD-20240501-002', customer: '龙州塑业有限公司', amount: 85600, status: 'production' },
  { id: 3, orderNo: 'ORD-20240501-003', customer: '华维食品添加剂', amount: 42300, status: 'completed' }
])

// 订单趋势图配置（随时间范围切换伪数据）
const orderTrendOption = computed(() => {
  const { categories, orders, completed } = mockOrderTrendByRange[orderTimeRange.value]
  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e8e8e8',
      textStyle: { color: '#333' }
    },
    legend: {
      data: ['订单数', '完成数'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: categories,
      axisLine: { lineStyle: { color: '#e8e8e8' } },
      axisLabel: { color: '#666' }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#f5f5f5' } },
      axisLabel: { color: '#666' }
    },
    series: [
      {
        name: '订单数',
        type: 'line',
        smooth: true,
        data: orders,
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(0, 112, 243, 0.3)' },
              { offset: 1, color: 'rgba(0, 112, 243, 0.05)' }
            ]
          }
        },
        lineStyle: { color: '#0070f3', width: 2 },
        itemStyle: { color: '#0070f3' }
      },
      {
        name: '完成数',
        type: 'line',
        smooth: true,
        data: completed,
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(6, 214, 160, 0.3)' },
              { offset: 1, color: 'rgba(6, 214, 160, 0.05)' }
            ]
          }
        },
        lineStyle: { color: '#06d6a0', width: 2 },
        itemStyle: { color: '#06d6a0' }
      }
    ]
  }
})

// 部门业绩饼图（与左侧时间范围联动）
const deptPieOption = computed(() => {
  const rows = mockDeptPerformanceByRange[orderTimeRange.value]
  return {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}万 ({d}%)',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e8e8e8',
      textStyle: { color: '#333' }
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: { color: '#666' }
    },
    series: [
      {
        name: '部门业绩',
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 14, fontWeight: 'bold' }
        },
        data: rows.map((d) => ({
          value: d.value,
          name: d.name,
          itemStyle: { color: d.color }
        }))
      }
    ]
  }
})

// 获取订单状态
function getOrderStatus(status: string): string {
  const map: Record<string, string> = {
    pending: '待审核',
    production: '生产中',
    completed: '已完成',
    shipped: '已发货'
  }
  return map[status] || status
}

function getOrderStatusType(status: string): '' | 'warning' | 'success' | 'info' {
  const map: Record<string, '' | 'warning' | 'success' | 'info'> = {
    pending: 'warning',
    production: 'info',
    completed: 'success',
    shipped: ''
  }
  return map[status] || ''
}
</script>

<style lang="scss" scoped>
@use '@/scss/variables' as *;
@use '@/scss/mixins' as *;

.home-page {
  padding: 0;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

// ============================================
// 欢迎区域
// ============================================

.welcome-section {
  @include industrial-card;
  padding: 24px 28px;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #0070f3 0%, #0051cc 100%);
  border: none;
  
  .welcome-title {
    font-size: 24px;
    font-weight: 600;
    color: #fff;
    margin: 0 0 8px;
  }
  
  .welcome-subtitle {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
    margin: 0;
  }
  
  .quick-actions {
    display: flex;
    gap: 12px;
    
    .el-button {
      padding: 12px 24px;
      font-weight: 500;
      
      &:first-child {
        background: #fff;
        color: #0070f3;
        border-color: #fff;
        
        &:hover {
          background: rgba(255, 255, 255, 0.9);
        }
      }
      
      &:last-child {
        background: rgba(255, 255, 255, 0.15);
        color: #fff;
        border-color: rgba(255, 255, 255, 0.3);
        
        &:hover {
          background: rgba(255, 255, 255, 0.25);
        }
      }
    }
  }
}

// ============================================
// 统计卡片
// ============================================

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.stat-card {
  @include industrial-card;
  padding: 20px;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
  
  .stat-icon {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    @include flex-center;
    font-size: 24px;
    margin-right: 16px;
    flex-shrink: 0;
  }
  
  .stat-content {
    flex: 1;
    
    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: #1a1a2e;
      line-height: 1.2;
    }
    
    .stat-label {
      font-size: 13px;
      color: #999;
      margin-top: 4px;
    }
  }
  
  .stat-trend {
    position: absolute;
    top: 16px;
    right: 16px;
    display: flex;
    align-items: center;
    gap: 2px;
    font-size: 12px;
    padding: 4px 8px;
    border-radius: 4px;
    
    &.trend-up {
      color: #06d6a0;
      background: rgba(6, 214, 160, 0.1);
    }
    
    &.trend-down {
      color: #ff6b6b;
      background: rgba(255, 107, 107, 0.1);
    }
  }
  
  .stat-badge {
    position: absolute;
    top: 16px;
    right: 16px;
    font-size: 11px;
    color: #ff9500;
    background: rgba(255, 149, 0, 0.1);
    padding: 4px 8px;
    border-radius: 4px;
  }
  
  &.stat-orders .stat-icon {
    background: rgba(0, 112, 243, 0.1);
    color: #0070f3;
  }
  
  &.stat-production .stat-icon {
    background: rgba(6, 214, 160, 0.1);
    color: #06d6a0;
  }
  
  &.stat-approval .stat-icon {
    background: rgba(255, 149, 0, 0.1);
    color: #ff9500;
  }
  
  &.stat-revenue .stat-icon {
    background: rgba(121, 40, 202, 0.1);
    color: #7928ca;
  }
}

// ============================================
// 图表区域
// ============================================

.charts-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.chart-card {
  @include industrial-card;
  
  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #f0f0f0;
    
    .chart-title {
      font-size: 15px;
      font-weight: 600;
      color: #1a1a2e;
      margin: 0;
    }
    
    .chart-subtitle {
      font-size: 12px;
      color: #8c8c8c;
      font-weight: 500;
      padding: 4px 10px;
      background: #f5f7fa;
      border-radius: 6px;
    }
  }
  
  .chart-body {
    padding: 16px;
  }
}

// ============================================
// 下方区域
// ============================================

.bottom-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
}

.list-card,
.quick-entry-card {
  @include industrial-card;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #f0f0f0;
    
    .card-title {
      font-size: 15px;
      font-weight: 600;
      color: #1a1a2e;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
      
      .el-icon {
        color: #0070f3;
      }
    }
  }
  
  .card-body {
    padding: 12px;
    max-height: 320px;
    overflow-y: auto;
    @include custom-scrollbar;
  }
}

// 待办事项
.todo-item {
  display: flex;
  align-items: flex-start;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  transition: background 0.2s;
  
  &:hover {
    background: #f8f9fa;
  }
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .todo-icon {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    @include flex-center;
    margin-right: 12px;
    flex-shrink: 0;
    
    &.approval {
      background: rgba(255, 149, 0, 0.1);
      color: #ff9500;
    }
    
    &.order {
      background: rgba(0, 112, 243, 0.1);
      color: #0070f3;
    }
    
    &.warning {
      background: rgba(255, 107, 107, 0.1);
      color: #ff6b6b;
    }
  }
  
  .todo-content {
    flex: 1;
    min-width: 0;
    
    .todo-title {
      font-size: 13px;
      font-weight: 500;
      color: #333;
      margin-bottom: 4px;
    }
    
    .todo-desc {
      font-size: 12px;
      color: #999;
      @include text-ellipsis;
    }
  }
  
  .todo-time {
    font-size: 11px;
    color: #bbb;
    flex-shrink: 0;
  }
}

// 近期订单
.order-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  transition: background 0.2s;
  
  &:hover {
    background: #f8f9fa;
  }
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .order-info {
    flex: 1;
    min-width: 0;
    
    .order-no {
      font-size: 13px;
      font-weight: 500;
      color: #333;
      margin-bottom: 4px;
    }
    
    .order-customer {
      font-size: 12px;
      color: #999;
      @include text-ellipsis;
    }
  }
  
  .order-amount {
    font-size: 14px;
    font-weight: 600;
    color: #0070f3;
    margin: 0 12px;
  }
}

// 快捷入口
.quick-entry-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 4px;
}

.entry-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 8px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f5f7fa;
    transform: translateY(-2px);
  }
  
  .entry-icon {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    @include flex-center;
    font-size: 20px;
    margin-bottom: 8px;
    
    &.orders { background: rgba(0, 112, 243, 0.1); color: #0070f3; }
    &.customers { background: rgba(6, 214, 160, 0.1); color: #06d6a0; }
    &.inventory { background: rgba(121, 40, 202, 0.1); color: #7928ca; }
    &.approval { background: rgba(255, 149, 0, 0.1); color: #ff9500; }
    &.reports { background: rgba(255, 107, 107, 0.1); color: #ff6b6b; }
    &.system { background: rgba(140, 140, 140, 0.1); color: #8c8c8c; }
  }
  
  .entry-label {
    font-size: 12px;
    color: #666;
  }
}
</style>
