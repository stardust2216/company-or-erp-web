<template>
  <div class="production-plan-page">
    <!-- 页头 -->
    <div class="page-header">
      <div class="header-badge" :style="{ background: 'linear-gradient(135deg,#43e97b,#38f9d7)' }">
        <el-icon :size="28"><SetUp /></el-icon>
      </div>
      <div class="header-info">
        <h1 class="page-title">华维食品 - 生产计划单</h1>
        <p class="page-subtitle">Demo 展示 — 硫磺加工生产计划示例</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="handlePrint" :disabled="!currentPlan">
          <el-icon><Printer /></el-icon> 打印
        </el-button>
        <el-button @click="goBack">返回</el-button>
      </div>
    </div>

    <!-- 选择计划 -->
    <el-card class="select-card" shadow="never">
      <el-form inline>
        <el-form-item label="选择计划单">
          <el-select v-model="selectedId" placeholder="请选择生产计划" style="width: 400px" clearable filterable>
            <el-option v-for="p in mockPlans" :key="p.id" :label="`${p.contractNo} — ${p.productName}`" :value="p.id" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 计划单内容 -->
    <div class="print-area" v-if="currentPlan">
      <el-card class="plan-card" shadow="never">
        <!-- 标题 -->
        <div class="plan-header">
          <h2 class="company-name">华维食品添加剂有限公司</h2>
          <h3 class="doc-title">硫磺加工生产计划单</h3>
          <div class="plan-meta">
            <span>计划单号：{{ planNo }}</span>
            <span>日期：{{ today }}</span>
          </div>
        </div>

        <!-- 基础信息 -->
        <el-descriptions :column="3" border size="small" class="info-section">
          <el-descriptions-item label="合同编号" :span="2">{{ currentPlan.contractNo }}</el-descriptions-item>
          <el-descriptions-item label="计划数量(吨)">{{ currentPlan.qty }}</el-descriptions-item>
          <el-descriptions-item label="产品名称">{{ currentPlan.productName }}</el-descriptions-item>
          <el-descriptions-item label="客户名称">{{ currentPlan.customer }}</el-descriptions-item>
          <el-descriptions-item label="计划生产日期">{{ currentPlan.planDate }}</el-descriptions-item>
        </el-descriptions>

        <!-- 生产任务明细表 -->
        <h4 class="table-title">生产任务明细</h4>
        <el-table :data="currentPlan.tasks" border size="small" class="task-table">
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="process" label="工序" width="140" />
          <el-table-column prop="productSpec" label="产品规格" min-width="160" />
          <el-table-column prop="qty" label="数量(吨)" width="120" align="right" />
          <el-table-column prop="operator" label="操作工" width="120" />
          <el-table-column prop="duration" label="预计工时(h)" width="120" align="center" />
          <el-table-column prop="remark" label="备注" min-width="140" />
        </el-table>

        <!-- 原料/包装要求 -->
        <el-descriptions :column="4" border size="small" class="material-section">
          <el-descriptions-item label="原料类型" :span="2">{{ currentPlan.materialType }}</el-descriptions-item>
          <el-descriptions-item label="原料数量(吨)">{{ currentPlan.materialQty }}</el-descriptions-item>
          <el-descriptions-item label="包装方式">{{ currentPlan.packaging }}</el-descriptions-item>
          <el-descriptions-item label="质量要求" :span="4">{{ currentPlan.quality }}</el-descriptions-item>
        </el-descriptions>

        <!-- 备注 + 签字 -->
        <div class="remark-row">
          <div class="remark-label">备注：</div>
          <div class="remark-content">{{ currentPlan.remark || '无' }}</div>
        </div>

        <div class="sign-row">
          <div class="sign-item">制单人：____________</div>
          <div class="sign-item">审核人：____________</div>
          <div class="sign-item">车间主任：____________</div>
          <div class="sign-item">日期：____________</div>
        </div>
      </el-card>
    </div>

    <div v-else class="empty-wrap">
      <el-empty description="请从上方下拉框选择一个生产计划" :image-size="100" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { SetUp, Printer } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const selectedId = ref('')

const today = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })

interface Task {
  process: string
  productSpec: string
  qty: number
  operator: string
  duration: number
  remark: string
}

interface ProductionPlan {
  id: string
  contractNo: string
  productName: string
  customer: string
  qty: number
  planDate: string
  materialType: string
  materialQty: number
  packaging: string
  quality: string
  remark: string
  tasks: Task[]
}

const mockPlans: ProductionPlan[] = [
  {
    id: 'p1', contractNo: 'TG-HW2025005', productName: '食品级硫磺（粒状）',
    customer: '广西泰谷化学（朱博宇）', qty: 120, planDate: '2025-06-10 ~ 2025-06-20',
    materialType: '液硫', materialQty: 122, packaging: '吨袋包装',
    quality: '硫含量≥99.9%，灰分≤0.05%，酸度≤0.02%',
    remark: '优先使用钦州石化来料',
    tasks: [
      { process: '来料检验', productSpec: '液硫≥99.9%', qty: 122, operator: '陆加俭', duration: 4, remark: '取样送检' },
      { process: '造粒', productSpec: '粒状 2-4mm', qty: 120, operator: '农国宝', duration: 48, remark: '一班制' },
      { process: '筛分', productSpec: '2-4mm/4-6mm', qty: 118, operator: '陆加俭', duration: 8, remark: '过筛分级' },
      { process: '包装', productSpec: '吨袋 500kg/袋', qty: 118, operator: '包装组', duration: 16, remark: '含标签粘贴' },
      { process: '入库', productSpec: '成品仓', qty: 118, operator: '仓管', duration: 4, remark: '' }
    ]
  },
  {
    id: 'p2', contractNo: 'KM2025082601', productName: '工业硫磺（块状）',
    customer: '昆明伯明原公司（云南片区）', qty: 200, planDate: '2025-06-12 ~ 2025-06-28',
    materialType: '固硫', materialQty: 205, packaging: '散装/吨袋',
    quality: '硫含量≥99.5%，水分≤1.0%',
    remark: '云南专供，需加贴防伪标签',
    tasks: [
      { process: '原料破碎', productSpec: '块状 10-50mm', qty: 205, operator: '农国宝', duration: 32, remark: '颚式破碎机' },
      { process: '分拣', productSpec: '块状 10-50mm', qty: 200, operator: '分拣组', duration: 16, remark: '人工分拣杂质' },
      { process: '包装', productSpec: '吨袋 500kg/袋', qty: 200, operator: '包装组', duration: 24, remark: '含防伪标签' },
      { process: '质检', productSpec: '抽样检测', qty: 200, operator: '质检组', duration: 4, remark: '出具质检报告' },
      { process: '入库', productSpec: '成品仓', qty: 200, operator: '仓管', duration: 4, remark: '' }
    ]
  },
  {
    id: 'p3', contractNo: 'YX2025062001', productName: '食品级硫磺（粒状）',
    customer: '云南金星化工有限公司', qty: 150, planDate: '2025-06-20 ~ 2025-07-05',
    materialType: '液硫', materialQty: 152, packaging: '吨袋包装',
    quality: '硫含量≥99.95%，色度浅黄，粒度均匀',
    remark: '食品级产品，注意防尘',
    tasks: [
      { process: '来料检验', productSpec: '液硫≥99.95%', qty: 152, operator: '陆加俭', duration: 4, remark: '食品级专项检测' },
      { process: '造粒', productSpec: '粒状 2-4mm', qty: 150, operator: '农国宝', duration: 56, remark: '双班制' },
      { process: '冷却筛分', productSpec: '2-4mm', qty: 148, operator: '陆加俭', duration: 12, remark: '' },
      { process: '包装', productSpec: '25kg/袋', qty: 148, operator: '包装组', duration: 20, remark: '食品级PE内袋' },
      { process: '入库', productSpec: '食品级成品仓', qty: 148, operator: '仓管', duration: 4, remark: '' }
    ]
  }
]

const currentPlan = computed(() => mockPlans.find(p => p.id === selectedId.value))

const planNo = computed(() => {
  if (!currentPlan.value) return ''
  const idx = mockPlans.findIndex(p => p.id === selectedId.value) + 1
  return `YH-SC-${String(Date.now()).slice(-8)}-${String(idx).padStart(3, '0')}`
})

function handlePrint() {
  window.print()
  ElMessage.success('打印任务已发送')
}

function goBack() {
  router.back()
}
</script>

<style lang="scss" scoped>
.production-plan-page {
  padding: 20px;
  background: #f0f2f5;
  min-height: calc(100vh - 60px);
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  background: #fff;
  padding: 20px 24px;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,.06);

  .header-badge {
    width: 56px; height: 56px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    flex-shrink: 0;
  }

  .header-info { flex: 1; }

  .page-title {
    font-size: 20px; font-weight: 700; color: #1a1a2e;
    margin: 0 0 4px;
  }

  .page-subtitle {
    font-size: 13px; color: #999; margin: 0;
  }
}

.select-card {
  margin-bottom: 20px;
  border-radius: 12px;
}

.plan-card {
  border-radius: 12px;

  .plan-header {
    text-align: center;
    padding-bottom: 20px;
    border-bottom: 2px solid #e8e8e8;
    margin-bottom: 20px;

    .company-name {
      font-size: 22px; font-weight: 700;
      color: #1a1a2e;
      margin: 0 0 4px;
      letter-spacing: 2px;
    }

    .doc-title {
      font-size: 18px; font-weight: 600;
      color: #409eff;
      margin: 0 0 12px;
    }

    .plan-meta {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      color: #909399;
      padding: 0 20px;
    }
  }
}

.info-section, .material-section {
  margin-bottom: 20px;
}

.table-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px;
  padding-left: 4px;
  border-left: 3px solid #409eff;
}

.task-table {
  margin-bottom: 20px;
}

.remark-row {
  display: flex;
  gap: 8px;
  padding: 12px 0;
  border-bottom: 1px dashed #dcdfe6;
  margin-bottom: 20px;
  font-size: 14px;

  .remark-label { font-weight: 600; color: #606266; white-space: nowrap; }
  .remark-content { color: #606266; }
}

.sign-row {
  display: flex;
  justify-content: space-between;
  padding: 0 10px 20px;

  .sign-item {
    font-size: 14px;
    color: #606266;
    min-width: 140px;
    text-align: center;
  }
}

.empty-wrap {
  background: #fff;
  border-radius: 12px;
  padding: 80px 0;
  display: flex;
  justify-content: center;
}
</style>

<style lang="scss">
@media print {
  .page-header, .select-card, .header-actions { display: none !important; }

  .production-plan-page { padding: 0 !important; background: #fff !important; }
  .plan-card { box-shadow: none !important; border: none !important; border-radius: 0 !important; }

  .plan-header {
    border-bottom-color: #000 !important;
    .company-name { color: #000 !important; }
    .doc-title { color: #000 !important; }
  }

  .el-descriptions, .el-table {
    border-color: #000 !important;
    font-size: 12px !important;
  }

  .task-table { page-break-inside: avoid; }
}
</style>
