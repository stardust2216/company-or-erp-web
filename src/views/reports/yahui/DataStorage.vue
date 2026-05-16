<template>
  <div class="data-storage-page">
    <!-- ====== 页头 ====== -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon :size="28"><FolderOpened /></el-icon>
        </div>
        <div class="header-text">
          <h1 class="header-title">亚辉塑业 - 数据存储总览</h1>
          <p class="header-subtitle">26-27榨季 硫磺生产经营数据总览</p>
        </div>
      </div>
    </div>

    <!-- ====== 顶部统计卡片 ====== -->
    <el-row :gutter="16" class="stat-cards">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon total-icon">
            <el-icon :size="22"><Document /></el-icon>
          </div>
          <div class="stat-body">
            <div class="stat-label">总数据表</div>
            <div class="stat-value">{{ statData.totalTables }}</div>
            <div class="stat-sub">张</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon record-icon">
            <el-icon :size="22"><List /></el-icon>
          </div>
          <div class="stat-body">
            <div class="stat-label">总记录数</div>
            <div class="stat-value">{{ statData.totalRecords }}</div>
            <div class="stat-sub">条</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon earliest-icon">
            <el-icon :size="22"><Timer /></el-icon>
          </div>
          <div class="stat-body">
            <div class="stat-label">最早数据日期</div>
            <div class="stat-value">{{ statData.earliestDate }}</div>
            <div class="stat-sub">年月</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon latest-icon">
            <el-icon :size="22"><AlarmClock /></el-icon>
          </div>
          <div class="stat-body">
            <div class="stat-label">最晚数据日期</div>
            <div class="stat-value">{{ statData.latestDate }}</div>
            <div class="stat-sub">年月</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- ====== 数据表清单 ====== -->
    <el-card shadow="never" class="table-card">
      <template #header>
        <div class="card-header">
          <span>数据表清单</span>
          <div class="header-extra">
            <el-tag type="info" effect="plain" size="small">共 {{ tableData.length }} 张数据表</el-tag>
            <el-button :icon="fullscreenIcon" text size="small" @click="toggleFullscreen" />
          </div>
        </div>
      </template>

      <el-table
        :data="pagedData"
        border
        stripe
        highlight-current-row
        max-height="800"
        style="width: 100%"
        :header-cell-style="headerCellStyle"
        size="small"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />

        <el-table-column prop="tableName" label="表名称" min-width="170" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="table-name-cell">
              <el-icon :size="16" style="margin-right: 6px; vertical-align: middle; color: #1a73e8;"><Document /></el-icon>
              {{ row.tableName }}
            </span>
          </template>
        </el-table-column>

        <el-table-column prop="dataType" label="数据类型" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="row.tagType" size="small" effect="plain">{{ row.dataType }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="recordCount" label="记录数" width="90" align="center">
          <template #default="{ row }">
            <span class="record-count">{{ row.recordCount }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="earliest" label="最早日期" width="110" align="center" />

        <el-table-column prop="latest" label="最晚日期" width="110" align="center" />

        <el-table-column prop="dimension" label="维度(月份)" width="110" align="center" />

        <el-table-column prop="lastUpdate" label="最后更新" width="120" align="center">
          <template #default="{ row }">
            <span class="update-time">{{ row.lastUpdate }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="90" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrap" style="margin-top:16px;display:flex;justify-content:flex-end">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="tableData.length"
          :page-sizes="[5, 10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          background
        />
      </div>
    </el-card>

    <!-- ====== 归档记录时间轴 ====== -->
    <el-card shadow="never" class="timeline-card">
      <template #header>
        <div class="card-header">
          <span>归档记录</span>
          <div class="header-extra">
            <el-tag type="success" effect="plain" size="small">
              <el-icon :size="12" style="margin-right: 4px;"><Refresh /></el-icon>
              自动归档中
            </el-tag>
          </div>
        </div>
      </template>

      <div class="timeline-wrapper">
        <el-timeline>
          <el-timeline-item
            v-for="(item, index) in timelineData"
            :key="index"
            :timestamp="item.date"
            placement="top"
            :type="item.type"
            :hollow="item.hollow"
            :size="item.size || 'default'"
            :color="item.color"
          >
            <div class="timeline-item">
              <span class="timeline-badge" :style="{ background: item.badgeGradient }">
                <el-icon :size="14" v-if="item.icon">
                  <component :is="item.icon" />
                </el-icon>
              </span>
              <div class="timeline-content">
                <span class="timeline-title">{{ item.title }}</span>
                <p class="timeline-desc" v-if="item.desc">{{ item.desc }}</p>
              </div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  FolderOpened,
  Document,
  List,
  Timer,
  AlarmClock,
  Refresh,
  Promotion,
  DataBoard,
  Collection,
  Upload,
  FullScreen,
  Close,
} from '@element-plus/icons-vue'

// ============================================================
// 统计数据
// ============================================================
const statData = {
  totalTables: 6,
  totalRecords: 188,
  earliestDate: '2025-05',
  latestDate: '2026-03',
}

// ============================================================
// 表格数据类型
// ============================================================
interface TableRecord {
  tableName: string
  dataType: string
  tagType: string
  recordCount: number
  earliest: string
  latest: string
  dimension: string
  lastUpdate: string
}

const tableData = ref<TableRecord[]>([
  {
    tableName: '采购合同统计表',
    dataType: '采购数据',
    tagType: 'warning',
    recordCount: 24,
    earliest: '2025-06',
    latest: '2025-11',
    dimension: '6个月',
    lastUpdate: '2025-11-18',
  },
  {
    tableName: '入库明细表',
    dataType: '入库数据',
    tagType: 'success',
    recordCount: 56,
    earliest: '2025-06',
    latest: '2025-11',
    dimension: '6个月',
    lastUpdate: '2025-11-18',
  },
  {
    tableName: '销售合同统计表',
    dataType: '销售数据',
    tagType: 'danger',
    recordCount: 18,
    earliest: '2025-06',
    latest: '2025-11',
    dimension: '6个月',
    lastUpdate: '2025-11-10',
  },
  {
    tableName: '出库明细表',
    dataType: '出库数据',
    tagType: 'primary',
    recordCount: 42,
    earliest: '2025-08',
    latest: '2026-03',
    dimension: '8个月',
    lastUpdate: '2026-03-15',
  },
  {
    tableName: '生产日报表',
    dataType: '生产数据',
    tagType: '',
    recordCount: 36,
    earliest: '2025-05',
    latest: '2026-03',
    dimension: '11个月',
    lastUpdate: '2026-03-20',
  },
  {
    tableName: '工业生产经营情况',
    dataType: '经营数据',
    tagType: 'info',
    recordCount: 12,
    earliest: '2026-01',
    latest: '2026-02',
    dimension: '2个月',
    lastUpdate: '2026-02-28',
  },
])

// ============================================================
// 分页
// ============================================================
const page = ref(1)
const pageSize = ref(10)
const pagedData = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return tableData.value.slice(start, start + pageSize.value)
})

// ============================================================
// 全屏切换
// ============================================================
const isFullscreen = ref(false)
const fullscreenIcon = computed(() => isFullscreen.value ? Close : FullScreen)
function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
  const el = document.querySelector('.data-storage-page') as HTMLElement
  if (el) {
    if (isFullscreen.value) {
      el.style.position = 'fixed'; el.style.inset = '0'; el.style.zIndex = '9999'
      el.style.background = '#f0f2f5'; el.style.padding = '20px'; el.style.overflow = 'auto'
    } else {
      el.style.position = ''; el.style.inset = ''; el.style.zIndex = ''
      el.style.background = ''; el.style.padding = ''; el.style.overflow = ''
    }
    setTimeout(() => window.dispatchEvent(new Event('resize')), 200)
  }
}

// ============================================================
// 归档记录时间轴
// ============================================================
interface TimelineItem {
  date: string
  title: string
  desc: string
  type: string
  hollow: boolean
  size?: string
  color?: string
  badgeGradient: string
  icon: any
}

const timelineData = ref<TimelineItem[]>([
  {
    date: '2026-03-20',
    title: '数据自动归档',
    desc: '26-27榨季3月份生产及经营数据已完成自动归档处理',
    type: 'primary',
    hollow: false,
    badgeGradient: 'linear-gradient(135deg, #1a73e8, #4a90e2)',
    icon: Collection,
  },
  {
    date: '2026-02-28',
    title: '2月生产经营数据更新',
    desc: '2月份硫磺生产经营相关数据已完成更新录入',
    type: '',
    hollow: false,
    badgeGradient: 'linear-gradient(135deg, #43a047, #66bb6a)',
    icon: Upload,
  },
  {
    date: '2026-01-31',
    title: '1月数据已归档',
    desc: '2026年1月份生产经营数据归档完成，共6张数据表',
    type: '',
    hollow: false,
    badgeGradient: 'linear-gradient(135deg, #fb8c00, #ffa726)',
    icon: DataBoard,
  },
  {
    date: '2025-12-31',
    title: '26-27榨季数据初始化',
    desc: '新榨季数据存储架构初始化完成，开始记录26-27榨季硫磺生产经营数据',
    type: 'info',
    hollow: true,
    badgeGradient: 'linear-gradient(135deg, #78909c, #90a4ae)',
    icon: Promotion,
  },
])

// ============================================================
// 操作方法
// ============================================================
const handleView = (row: TableRecord) => {
  ElMessage({
    type: 'success',
    message: `「${row.tableName}」数据已归档，可前往对应报表页面查看详细数据`,
    duration: 3000,
  })
}

// ============================================================
// 表头样式
// ============================================================
const headerCellStyle = () => ({
  background: '#f5f7fa',
  color: '#303133',
  fontWeight: 600,
  fontSize: '13px',
})
</script>

<style lang="scss" scoped>
@use '@/scss/variables' as *;

$icon-bg-total: linear-gradient(135deg, #1a73e8, #4a90e2);
$icon-bg-record: linear-gradient(135deg, #43a047, #66bb6a);
$icon-bg-earliest: linear-gradient(135deg, #fb8c00, #ffa726);
$icon-bg-latest: linear-gradient(135deg, #5c6bc0, #7c8cdb);

.data-storage-page {
  padding: 0 $spacing-5;
  background: $color-gray-100;
  min-height: 100vh;

  // ========== 页头 ==========
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

    .header-icon {
      width: 48px;
      height: 48px;
      border-radius: $border-radius-lg;
      background: linear-gradient(135deg, $color-primary, $color-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      flex-shrink: 0;
    }

    .header-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .header-title {
      font-size: $font-size-xl;
      font-weight: $font-weight-bold;
      color: $color-gray-900;
      margin: 0;
      line-height: $line-height-tight;
    }

    .header-subtitle {
      font-size: $font-size-sm;
      color: $color-gray-500;
      margin: 0;
      line-height: $line-height-normal;
    }
  }

  // ========== 统计卡片 ==========
  .stat-cards {
    margin-bottom: $spacing-5;

    .stat-card {
      display: flex;
      align-items: center;
      padding: $spacing-4 $spacing-5;
      transition: $transition-base;
      border: 1px solid transparent;

      &:hover {
        border-color: $color-primary-light;
        box-shadow: $shadow-md;
      }

      .stat-icon {
        width: 44px;
        height: 44px;
        border-radius: $border-radius-lg;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        flex-shrink: 0;
        margin-right: $spacing-4;

        &.total-icon {
          background: $icon-bg-total;
        }
        &.record-icon {
          background: $icon-bg-record;
        }
        &.earliest-icon {
          background: $icon-bg-earliest;
        }
        &.latest-icon {
          background: $icon-bg-latest;
        }
      }

      .stat-body {
        flex: 1;
        min-width: 0;
      }

      .stat-label {
        font-size: $font-size-xs;
        color: $color-gray-500;
        margin-bottom: 4px;
      }

      .stat-value {
        font-size: $font-size-2xl;
        font-weight: $font-weight-bold;
        color: $color-gray-900;
        line-height: $line-height-tight;
        margin-bottom: 2px;
      }

      .stat-sub {
        font-size: $font-size-xs;
        color: $color-gray-400;
      }
    }
  }

  // ========== 数据表卡片 ==========
  .table-card {
    background: #fff;
    border-radius: $border-radius-lg;
    box-shadow: $shadow-base;
    overflow: hidden;
    margin-bottom: $spacing-5;

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-weight: $font-weight-semibold;
      color: $color-gray-900;
      font-size: $font-size-base;

      .header-extra {
        display: flex;
        align-items: center;
        gap: $spacing-2;
      }
    }

    :deep(.el-table) {
      font-size: $font-size-sm;

      .el-table__header-wrapper th {
        background: $color-gray-50;
      }
    }

    .table-name-cell {
      display: inline-flex;
      align-items: center;

      .el-icon {
        flex-shrink: 0;
      }
    }

    .record-count {
      font-weight: $font-weight-semibold;
      color: $color-primary;
    }

    .update-time {
      color: $color-gray-600;
    }
  }

  // ========== 归档记录时间轴卡片 ==========
  .timeline-card {
    background: #fff;
    border-radius: $border-radius-lg;
    box-shadow: $shadow-base;
    overflow: hidden;
    margin-bottom: $spacing-5;

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-weight: $font-weight-semibold;
      color: $color-gray-900;
      font-size: $font-size-base;

      .header-extra {
        display: flex;
        align-items: center;
        gap: $spacing-2;
      }
    }

    .timeline-wrapper {
      padding: $spacing-4 $spacing-6;
    }

    .timeline-item {
      display: flex;
      align-items: flex-start;
      gap: $spacing-3;
    }

    .timeline-badge {
      width: 32px;
      height: 32px;
      border-radius: $border-radius-lg;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .timeline-content {
      flex: 1;
      min-width: 0;
    }

    .timeline-title {
      font-size: $font-size-sm;
      font-weight: $font-weight-medium;
      color: $color-gray-900;
      display: block;
      margin-bottom: 4px;
    }

    .timeline-desc {
      font-size: $font-size-xs;
      color: $color-gray-500;
      margin: 0;
      line-height: $line-height-normal;
    }

    // 覆盖 el-timeline-item 默认样式
    :deep(.el-timeline-item) {
      padding-bottom: $spacing-6;

      .el-timeline-item__timestamp {
        font-size: $font-size-xs;
        color: $color-gray-400;
      }
    }
  }
}
</style>
