<template>
  <div class="longzhou-production-daily">
    <!-- 页头 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon :size="28"><SetUp /></el-icon>
        </div>
        <div class="header-text">
          <h1 class="header-title">龙州塑业 - 生产日报</h1>
          <p class="header-subtitle">26-27榨季 6大工序生产数据统计</p>
        </div>
      </div>
      <div class="header-right">
        <el-date-picker v-model="selectedDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" size="default" style="width: 160px" />
      </div>
    </div>

    <!-- 工序切换 -->
    <el-card shadow="never" class="process-card">
      <template #header>
        <div class="process-header">
          <span class="header-title-text">选择工序</span>
        </div>
      </template>
      <el-radio-group v-model="activeProcess" size="large">
        <el-radio-button value="拉丝">拉丝工序</el-radio-button>
        <el-radio-button value="圆织">圆织工序</el-radio-button>
        <el-radio-button value="普印">普印工序</el-radio-button>
        <el-radio-button value="成品打包">成品打包工序</el-radio-button>
        <el-radio-button value="吹膜">吹膜工序</el-radio-button>
        <el-radio-button value="一体机">一体机工序</el-radio-button>
      </el-radio-group>
    </el-card>

    <!-- 统计摘要卡片 -->
    <el-row :gutter="16" class="summary-cards">
      <el-col :span="6">
        <el-card shadow="hover" class="summary-card">
          <div class="card-icon total-icon"><el-icon :size="22"><TrendCharts /></el-icon></div>
          <div class="card-body">
            <div class="card-label">当日总产量</div>
            <div class="card-value">{{ summaryData.totalOutput }}</div>
            <div class="card-sub">{{ summaryData.unit }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="summary-card">
          <div class="card-icon worker-icon"><el-icon :size="22"><UserFilled /></el-icon></div>
          <div class="card-body">
            <div class="card-label">操作工人数</div>
            <div class="card-value">{{ summaryData.workerCount }}</div>
            <div class="card-sub">人</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="summary-card">
          <div class="card-icon machine-icon"><el-icon :size="22"><Box /></el-icon></div>
          <div class="card-body">
            <div class="card-label">机台数量</div>
            <div class="card-value">{{ summaryData.machineCount }}</div>
            <div class="card-sub">台</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="summary-card">
          <div class="card-icon material-icon"><el-icon :size="22"><Goods /></el-icon></div>
          <div class="card-body">
            <div class="card-label">原料消耗</div>
            <div class="card-value">{{ summaryData.materialUsed }}</div>
            <div class="card-sub">包/吨</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 报表表格 -->
    <el-card shadow="never" class="table-card">
      <template #header>
        <div class="card-header">
          <span class="header-title-text">{{ activeProcess }}生产日报表</span>
        </div>
      </template>

      <!-- 拉丝工序 -->
      <el-table v-if="activeProcess === '拉丝'" :data="pageData" border stripe style="width: 100%" max-height="800" :header-cell-style="headerCellStyle" size="small">
        <el-table-column prop="date" label="日期" width="110" align="center" />
        <el-table-column prop="shift" label="班次" width="80" align="center" />
        <el-table-column prop="machineNo" label="机台编号" width="80" align="center" />
        <el-table-column prop="leaderName" label="班长姓名" width="100" align="center" />
        <el-table-column label="扁丝规格" align="center">
          <el-table-column prop="flatWidthFineness" label="宽度*纤度(mm*d)" width="130" align="center" />
          <el-table-column prop="sqWeight" label="平方克重(g/㎡)" width="120" align="right" />
          <el-table-column prop="singleTension" label="单丝拉力(N)" width="110" align="right" />
          <el-table-column prop="color" label="颜色" width="80" align="center" />
        </el-table-column>
        <el-table-column label="使用原材料数量（包）" align="center">
          <el-table-column prop="outsourceMaterial" label="外购原材料" width="110" align="right" />
          <el-table-column prop="selfMixed" label="自打料-杂色" width="110" align="right" />
          <el-table-column prop="selfWhite" label="自打料-糖白" width="110" align="right" />
        </el-table-column>
        <el-table-column label="产量" align="center">
          <el-table-column prop="qualifiedOutput" label="合格扁丝数量(吨)" width="130" align="right" />
          <el-table-column prop="wasteOutput" label="废丝数量(吨)" width="110" align="right" />
        </el-table-column>
        <el-table-column label="耗电量" align="center">
          <el-table-column prop="startMeter" label="接班电表读数" width="130" align="right" />
          <el-table-column prop="endMeter" label="下班电表读数" width="130" align="right" />
          <el-table-column prop="powerUsage" label="耗电数量(千瓦时)" width="130" align="right" />
        </el-table-column>
        <el-table-column prop="customer" label="使用客户" min-width="120" />
        <el-table-column prop="remark" label="备注" min-width="120" />
      </el-table>

      <!-- 圆织工序 -->
      <el-table v-if="activeProcess === '圆织'" :data="pageData" border stripe style="width: 100%" max-height="800" :header-cell-style="headerCellStyle" size="small">
        <el-table-column prop="date" label="日期" width="110" align="center" />
        <el-table-column prop="shift" label="班次" width="80" align="center" />
        <el-table-column prop="machineNo" label="机台编号" width="80" align="center" />
        <el-table-column prop="workerName" label="操作工姓名" width="100" align="center" />
        <el-table-column label="产品（布面）规格" align="center">
          <el-table-column prop="widthSqWeight" label="宽度*平方克重(cm*g/㎡)" width="150" align="center" />
          <el-table-column prop="color" label="颜色" width="80" align="center" />
        </el-table-column>
        <el-table-column label="个人产量" align="center">
          <el-table-column prop="startMeter" label="接班计量表转数" width="130" align="right" />
          <el-table-column prop="endMeter" label="下班计量表读数(m)" width="140" align="right" />
          <el-table-column prop="personalOutput" label="个人产量(m)" width="110" align="right" />
        </el-table-column>
        <el-table-column label="布筒产量" align="center">
          <el-table-column prop="lastClothCount" label="上次下布转数" width="120" align="right" />
          <el-table-column prop="thisClothCount" label="本次下布转数" width="120" align="right" />
          <el-table-column prop="clothOutput" label="布筒数量(m)" width="120" align="right" />
          <el-table-column prop="clothWeight" label="布筒理论重量(kg)" width="140" align="right" />
        </el-table-column>
        <el-table-column prop="customer" label="使用客户" min-width="120" />
        <el-table-column prop="remark" label="备注" min-width="120" />
      </el-table>

      <!-- 普印工序 -->
      <el-table v-if="activeProcess === '普印'" :data="pageData" border stripe style="width: 100%" max-height="800" :header-cell-style="headerCellStyle" size="small">
        <el-table-column prop="date" label="日期" width="110" align="center" />
        <el-table-column prop="shift" label="班次" width="80" align="center" />
        <el-table-column prop="machineNo" label="机台编号" width="80" align="center" />
        <el-table-column prop="workerName" label="操作工姓名" width="100" align="center" />
        <el-table-column label="客户" align="center">
          <el-table-column prop="groupName" label="集团名称" min-width="120" />
          <el-table-column prop="useUnitName" label="使用单位名称" min-width="120" />
        </el-table-column>
        <el-table-column label="产品" align="center">
          <el-table-column prop="brandName" label="品牌名称" width="100" />
          <el-table-column prop="productName" label="产品名称" min-width="120" />
        </el-table-column>
        <el-table-column label="工艺要求" align="center">
          <el-table-column prop="singleSide" label="单面" width="80" align="center" />
          <el-table-column prop="doubleSide" label="双面" width="80" align="center" />
        </el-table-column>
        <el-table-column label="印刷数量" align="center">
          <el-table-column prop="qualified" label="合格产品(套)" width="120" align="right" />
          <el-table-column prop="unqualified" label="不合格产品(套)" width="130" align="right" />
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="120" />
      </el-table>

      <!-- 成品打包工序 -->
      <el-table v-if="activeProcess === '成品打包'" :data="pageData" border stripe style="width: 100%" max-height="800" :header-cell-style="headerCellStyle" size="small">
        <el-table-column prop="date" label="日期" width="110" align="center" />
        <el-table-column prop="shift" label="班次" width="80" align="center" />
        <el-table-column prop="machineNo" label="机台编号" width="80" align="center" />
        <el-table-column prop="workerName" label="操作工姓名" width="100" align="center" />
        <el-table-column label="客户" align="center">
          <el-table-column prop="groupName" label="集团名称" min-width="120" />
          <el-table-column prop="useUnitName" label="使用单位名称" min-width="120" />
        </el-table-column>
        <el-table-column label="产品名称" align="center">
          <el-table-column prop="brandName" label="品牌名称" width="100" />
          <el-table-column prop="productName" label="产品名称" min-width="120" />
        </el-table-column>
        <el-table-column label="打包规格" align="center">
          <el-table-column prop="standardSpec" label="标准规格(300套/件)" width="130" align="right" />
          <el-table-column prop="nonStandardSpec" label="非标准规格(套/件)" width="130" align="right" />
        </el-table-column>
        <el-table-column label="计入发货数量" align="center">
          <el-table-column prop="stdPackages" label="标准包数(件)" width="120" align="right" />
          <el-table-column prop="stdSets" label="标准套数(套)" width="120" align="right" />
          <el-table-column prop="nonStdPackages" label="非标包数(件)" width="120" align="right" />
          <el-table-column prop="nonStdSets" label="非标套数(套)" width="120" align="right" />
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="120" />
      </el-table>

      <!-- 吹膜工序 -->
      <el-table v-if="activeProcess === '吹膜'" :data="pageData" border stripe style="width: 100%" max-height="800" :header-cell-style="headerCellStyle" size="small">
        <el-table-column prop="date" label="日期" width="110" align="center" />
        <el-table-column prop="shift" label="班次" width="80" align="center" />
        <el-table-column prop="machineNo" label="机台编号" width="80" align="center" />
        <el-table-column prop="workerName" label="操作工姓名" width="100" align="center" />
        <el-table-column label="产品规格" align="center">
          <el-table-column prop="widthSqWeight" label="宽度*平方克重(mm*g/㎡)" width="160" align="center" />
          <el-table-column prop="pressure" label="高低压" width="80" align="center" />
        </el-table-column>
        <el-table-column label="使用原材料数量（包）" align="center">
          <el-table-column prop="outsourceMaterial" label="外购原材料(包)" width="130" align="right" />
          <el-table-column prop="selfMixed" label="自打料(包)" width="110" align="right" />
        </el-table-column>
        <el-table-column label="产品数量" align="center">
          <el-table-column prop="qualified" label="合格产品(kg)" width="120" align="right" />
          <el-table-column prop="unqualified" label="不合格产品(kg)" width="130" align="right" />
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="120" />
      </el-table>

      <!-- 一体机工序 -->
      <el-table v-if="activeProcess === '一体机'" :data="pageData" border stripe style="width: 100%" max-height="800" :header-cell-style="headerCellStyle" size="small">
        <el-table-column prop="date" label="日期" width="110" align="center" />
        <el-table-column prop="shift" label="班次" width="80" align="center" />
        <el-table-column prop="machineNo" label="机台编号" width="80" align="center" />
        <el-table-column prop="workerName" label="操作工姓名" width="100" align="center" />
        <el-table-column label="使用产品客户名称" align="center">
          <el-table-column prop="groupName" label="集团名称" min-width="120" />
          <el-table-column prop="useUnitName" label="使用单位名称" min-width="120" />
        </el-table-column>
        <el-table-column label="产品" align="center">
          <el-table-column prop="brandName" label="品牌名称" width="100" />
          <el-table-column prop="productName" label="产品名称" min-width="120" />
        </el-table-column>
        <el-table-column label="产品规格" align="center">
          <el-table-column prop="outerBagSpec" label="外袋规格" min-width="120" />
          <el-table-column prop="innerBagSpec" label="内袋规格" min-width="120" />
          <el-table-column prop="bottomSpec" label="袋底" min-width="80" />
          <el-table-column prop="mouthSpec" label="袋口" min-width="80" />
        </el-table-column>
        <el-table-column label="产品数量" align="center">
          <el-table-column prop="qualified" label="合格产品(套)" width="120" align="right" />
          <el-table-column prop="waste" label="废袋(套)" width="100" align="right" />
          <el-table-column prop="rework" label="返工袋(套)" width="100" align="right" />
          <el-table-column prop="subtotal" label="小计(套)" width="100" align="right" />
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="120" />
      </el-table>

      <!-- 分页 -->
      <div class="card-footer">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]" :total="filteredData.length"
          layout="total, sizes, prev, pager, next, jumper" background small />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { SetUp, TrendCharts, UserFilled, Box, Goods } from '@element-plus/icons-vue'

// ============================================================
// 工序切换
// ============================================================
const activeProcess = ref('拉丝')
const selectedDate = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

// ============================================================
// Mock 数据（各工序）
// ============================================================
interface ProductionRecord {
  date: string
  shift: string
  machineNo: string
  workerName?: string
  leaderName?: string
  [key: string]: any
}

const mockData: ProductionRecord[] = [
  // 拉丝
  { date: '2026-07-01', shift: '白班', machineNo: '1#', leaderName: '张三', flatWidthFineness: '55*1200', sqWeight: 85, singleTension: 8.5, color: '白', outsourceMaterial: 25, selfMixed: 5, selfWhite: 20, qualifiedOutput: 4.5, wasteOutput: 0.2, startMeter: 1234, endMeter: 1380, powerUsage: 146, customer: 'A集团', remark: '' },
  { date: '2026-07-01', shift: '白班', machineNo: '2#', leaderName: '李四', flatWidthFineness: '55*1200', sqWeight: 85, singleTension: 8.5, color: '白', outsourceMaterial: 24, selfMixed: 4, selfWhite: 20, qualifiedOutput: 4.4, wasteOutput: 0.2, startMeter: 2345, endMeter: 2490, powerUsage: 145, customer: 'A集团', remark: '' },
  { date: '2026-07-01', shift: '夜班', machineNo: '3#', leaderName: '王五', flatWidthFineness: '55*1200', sqWeight: 85, singleTension: 8.5, color: '白', outsourceMaterial: 25, selfMixed: 5, selfWhite: 19, qualifiedOutput: 4.5, wasteOutput: 0.2, startMeter: 3456, endMeter: 3602, powerUsage: 146, customer: 'B糖业', remark: '' },
  // 圆织
  { date: '2026-07-01', shift: '白班', machineNo: '1#', workerName: '赵六', widthSqWeight: '55*85', color: '白', startMeter: 5000, endMeter: 5500, personalOutput: 500, lastClothCount: 100, thisClothCount: 600, clothOutput: 500, clothWeight: 42.5, customer: 'A集团', remark: '' },
  { date: '2026-07-01', shift: '白班', machineNo: '2#', workerName: '钱七', widthSqWeight: '55*85', color: '白', startMeter: 6000, endMeter: 6500, personalOutput: 500, lastClothCount: 100, thisClothCount: 600, clothOutput: 500, clothWeight: 42.5, customer: 'B糖业', remark: '' },
  // 普印
  { date: '2026-07-01', shift: '白班', machineNo: '1#', workerName: '孙八', groupName: 'A集团', useUnitName: 'A糖业', brandName: '嘉墟', productName: '一级白砂糖袋', singleSide: '是', doubleSide: '否', qualified: 5000, unqualified: 50, remark: '' },
  { date: '2026-07-01', shift: '白班', machineNo: '2#', workerName: '周九', groupName: 'B糖业', useUnitName: 'B糖厂', brandName: '嘉墟', productName: '50kg白砂糖编织袋', singleSide: '是', doubleSide: '否', qualified: 4800, unqualified: 45, remark: '' },
  // 成品打包
  { date: '2026-07-01', shift: '白班', machineNo: '1#', workerName: '吴十', groupName: 'A集团', useUnitName: 'A糖业', brandName: '嘉墟', productName: '一级白砂糖袋', standardSpec: 300, nonStandardSpec: 0, stdPackages: 10, stdSets: 3000, nonStdPackages: 0, nonStdSets: 0, remark: '' },
  // 吹膜
  { date: '2026-07-01', shift: '白班', machineNo: '1#', workerName: '郑一', widthSqWeight: '55*85', pressure: '高', outsourceMaterial: 20, selfMixed: 30, qualified: 850, unqualified: 15, remark: '' },
  // 一体机
  { date: '2026-07-01', shift: '白班', machineNo: '1#', workerName: '冯二', groupName: 'A集团', useUnitName: 'A糖业', brandName: '嘉墟', productName: '一级白砂糖袋', outerBagSpec: '55*105*120', innerBagSpec: '52*103', bottomSpec: '连膜', mouthSpec: '一般', qualified: 8000, waste: 80, rework: 20, subtotal: 8100, remark: '' }
]

// ============================================================
// 过滤和分页
// ============================================================
const filteredData = computed(() => {
  // 根据工序返回对应数据
  return mockData
})

const pageData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredData.value.slice(start, start + pageSize.value)
})

// 切换工序重置页码
watch(activeProcess, () => { currentPage.value = 1 })

// ============================================================
// 统计摘要
// ============================================================
const summaryData = computed(() => {
  const data = filteredData.value
  return {
    totalOutput: '850',
    unit: '米/吨',
    workerCount: data.length,
    machineCount: new Set(data.map(r => r.machineNo)).size,
    materialUsed: '120'
  }
})

// ============================================================
// 表头样式
// ============================================================
const headerCellStyle = () => ({
  background: '#f5f7fa', color: '#303133', fontWeight: 600, fontSize: '13px'
})
</script>

<style lang="scss" scoped>
@use '@/scss/variables' as *;

.longzhou-production-daily {
  padding: 0 $spacing-5;
  background: $color-gray-100;
  min-height: 100vh;

  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-5 $spacing-6;
    background: linear-gradient(135deg, #e8590c 0%, #ff8f00 100%);
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
      background: rgba(255, 255, 255, 0.25);
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
      color: #fff;
      margin: 0;
      line-height: $line-height-tight;
    }

    .header-subtitle {
      font-size: $font-size-sm;
      color: rgba(255, 255, 255, 0.85);
      margin: 0;
      line-height: $line-height-normal;
    }
  }

  .process-card {
    background: #fff;
    border-radius: $border-radius-lg;
    box-shadow: $shadow-base;
    margin-bottom: $spacing-5;

    :deep(.el-card__body) { padding: $spacing-4 $spacing-5; }

    .process-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      .header-title-text { font-weight: $font-weight-semibold; color: $color-gray-900; font-size: $font-size-base; }
    }
  }

  .summary-cards {
    margin-bottom: $spacing-5;

    .summary-card {
      display: flex;
      align-items: center;
      padding: $spacing-4 $spacing-5;
      transition: $transition-base;
      border: 1px solid transparent;
      &:hover { border-color: $color-primary-light; box-shadow: $shadow-md; }

      .card-icon {
        width: 44px;
        height: 44px;
        border-radius: $border-radius-lg;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        flex-shrink: 0;
        margin-right: $spacing-4;

        &.total-icon { background: linear-gradient(135deg, $color-primary, $color-primary-light); }
        &.worker-icon { background: linear-gradient(135deg, $color-success, #66bb6a); }
        &.machine-icon { background: linear-gradient(135deg, #e65100, $color-warning); }
        &.material-icon { background: linear-gradient(135deg, $color-secondary, #7986cb); }
      }

      .card-body { flex: 1; min-width: 0; }

      .card-label {
        font-size: $font-size-xs;
        color: $color-gray-500;
        margin-bottom: 4px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .card-value {
        font-size: $font-size-2xl;
        font-weight: $font-weight-bold;
        color: $color-gray-900;
        line-height: $line-height-tight;
        margin-bottom: 2px;
      }

      .card-sub {
        font-size: $font-size-xs;
        color: $color-gray-400;
      }
    }
  }

  .table-card {
    background: #fff;
    border-radius: $border-radius-lg;
    box-shadow: $shadow-base;
    overflow: hidden;

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: $spacing-2;
      .header-title-text { font-weight: $font-weight-semibold; color: $color-gray-900; font-size: $font-size-base; }
    }

    :deep(.el-table) {
      font-size: $font-size-sm;
      .el-table__header-wrapper th { background: $color-gray-50; }
    }

    .card-footer {
      padding: $spacing-3 $spacing-5;
      display: flex;
      justify-content: flex-end;
      border-top: 1px solid $color-gray-200;
      background: $color-gray-50;
    }
  }
}
</style>
