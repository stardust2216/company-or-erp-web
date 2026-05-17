<!--
  ============================================================================
  广为科技 · 数据看板抽屉
  ----------------------------------------------------------------------------
  · 销售合同（kind="sales"）与采购合同（kind="purchase"）共用本组件，
    仅文案差异通过 prop 切换；
  · 渲染纯展示，所有交互（下钻到详情）通过 emit('open-detail', id) 抛给
    父组件 OrderList.vue / Warehouse.vue 处理，看板自身不持有合同主数据；
  · 通过 v-model 控制可见性，关闭后 snapshot 由父组件保留以便快速重开。

  与父组件的契约（来自 OrderList.vue / Warehouse.vue）：
    Props:
      modelValue: boolean        — 抽屉显隐
      snapshot:   BoardSnapshot  — 由父组件构造的轻量快照（仅看板所需字段）
      kind:       'sales' | 'purchase'
    Emits:
      update:modelValue(v)       — v-model 双向绑定
      open-detail(contractId)    — 下钻：用户点击卡片要看某合同详情
  ============================================================================
-->
<template>
  <el-drawer
    :model-value="modelValue"
    direction="rtl"
    size="100%"
    :with-header="false"
    :close-on-click-modal="false"
    :before-close="(done: () => void) => { emit('update:modelValue', false); done() }"
    class="hw-board-drawer"
  >
    <div class="board-shell">
      <!-- ====== 顶部头条：标题 + 关闭按钮 + 快照时间 ====== -->
      <header class="board-header">
        <div class="header-left">
          <div class="header-badge">
            <el-icon :size="24"><DataAnalysis /></el-icon>
          </div>
          <div class="header-info">
            <h2 class="header-title">{{ titleText }}</h2>
            <p class="header-subtitle">
              快照时间：{{ snapshot?.snapshotAt || '—' }} ·
              共 {{ snapshot?.contracts.length ?? 0 }} 份合同
            </p>
          </div>
        </div>
        <el-button :icon="Close" plain @click="emit('update:modelValue', false)">关闭看板</el-button>
      </header>

      <!-- ====== KPI 概览 ====== -->
      <section class="metric-grid">
        <article class="metric-card metric-a">
          <div class="m-label">合同数</div>
          <div class="m-value">{{ totals.contractCount }} <span class="m-unit">份</span></div>
          <div class="m-hint">当前筛选结果快照</div>
        </article>
        <article class="metric-card metric-b">
          <div class="m-label">{{ qtyLabel }}</div>
          <div class="m-value">{{ formatNum(totals.qty, 3) }} <span class="m-unit">吨</span></div>
          <div class="m-hint">{{ qtyHint }}</div>
        </article>
        <article class="metric-card metric-c">
          <div class="m-label">{{ amountLabel }}</div>
          <div class="m-value">{{ formatMoney(totals.amount) }} <span class="m-unit">元</span></div>
          <div class="m-hint">{{ amountHint }}</div>
        </article>
        <article class="metric-card metric-d">
          <div class="m-label">{{ paidLabel }}</div>
          <div class="m-value">{{ formatMoney(totals.paid) }} <span class="m-unit">元</span></div>
          <div class="m-hint">回款率 {{ totals.paidRate }}%</div>
        </article>
      </section>

      <!-- ====== 分组维度：按集团聚合 ====== -->
      <section class="board-card">
        <header class="card-header">
          <h3>按集团 / 客户聚合</h3>
          <span class="muted">点击行展开成员合同</span>
        </header>
        <el-table :data="groupRows" stripe size="default" style="width: 100%">
          <el-table-column type="expand">
            <template #default="{ row }">
              <div class="expand-wrap">
                <el-table :data="row.children" size="small" border>
                  <el-table-column prop="contractNo" label="合同号" min-width="180" />
                  <el-table-column prop="factoryName" label="工厂" min-width="120" />
                  <el-table-column prop="region" label="区域" width="90" align="center" />
                  <el-table-column prop="contractDate" label="日期" width="110" align="center" />
                  <el-table-column label="数量(吨)" width="110" align="right">
                    <template #default="{ row: r }">{{ formatNum(r.contractQty, 3) }}</template>
                  </el-table-column>
                  <el-table-column label="金额" width="140" align="right">
                    <template #default="{ row: r }">{{ formatMoney(r.contractQty * r.contractPrice) }}</template>
                  </el-table-column>
                  <el-table-column label="操作" width="100" align="center" fixed="right">
                    <template #default="{ row: r }">
                      <el-button link type="primary" @click="emit('open-detail', r.id)">查看详情</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="groupName" label="集团 / 客户" min-width="160" />
          <el-table-column label="合同数" width="100" align="right">
            <template #default="{ row }">{{ row.count }}</template>
          </el-table-column>
          <el-table-column label="数量合计 (吨)" width="160" align="right">
            <template #default="{ row }">{{ formatNum(row.qty, 3) }}</template>
          </el-table-column>
          <el-table-column label="金额合计 (元)" width="180" align="right">
            <template #default="{ row }">{{ formatMoney(row.amount) }}</template>
          </el-table-column>
          <el-table-column label="占比" width="140">
            <template #default="{ row }">
              <el-progress
                :percentage="totals.amount > 0 ? Math.round((row.amount / totals.amount) * 100) : 0"
                :stroke-width="8"
              />
            </template>
          </el-table-column>
        </el-table>
      </section>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { DataAnalysis, Close } from '@element-plus/icons-vue'

/** 看板快照中的合同条目（只持看板所需字段，避免深响应） */
export interface BoardSnapshotContract {
  id: string
  factoryName: string
  contractNo: string
  groupName: string
  region: string
  contractDate: string
  contractQty: number
  contractPrice: number
  shipments: Array<{ qty: number }>
  invoices: Array<{ amount: number }>
  payments: Array<{ amount: number }>
}

/** 看板抽屉的快照结构（由父组件构造、按需传入） */
export interface BoardSnapshot {
  snapshotAt: string
  contracts: BoardSnapshotContract[]
}

const props = defineProps<{
  modelValue: boolean
  snapshot: BoardSnapshot | null
  kind: 'sales' | 'purchase'
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'open-detail', contractId: string): void
}>()

/** 销售 / 采购侧的文案差异统一在此映射，避免在模板里散落三元表达式 */
const titleText = computed(() =>
  props.kind === 'sales' ? '销售合同数据看板' : '采购合同数据看板'
)
const qtyLabel = computed(() =>
  props.kind === 'sales' ? '签约数量' : '采购数量'
)
const qtyHint = computed(() =>
  props.kind === 'sales' ? '合同签约总量（吨）' : '合同采购总量（吨）'
)
const amountLabel = computed(() =>
  props.kind === 'sales' ? '签约金额' : '采购金额'
)
const amountHint = computed(() =>
  props.kind === 'sales' ? '数量 × 单价合计' : '数量 × 单价合计'
)
const paidLabel = computed(() =>
  props.kind === 'sales' ? '已回款' : '已付款'
)

/**
 * KPI 汇总
 * --------------------------------------------------------------------
 * 销售侧：payments 表示客户已回款金额；
 * 采购侧：payments 同样表示广为已付款金额（沿用同一字段口径）。
 */
const totals = computed(() => {
  const list = props.snapshot?.contracts ?? []
  let qty = 0
  let amount = 0
  let paid = 0
  for (const c of list) {
    qty += c.contractQty || 0
    amount += (c.contractQty || 0) * (c.contractPrice || 0)
    paid += (c.payments || []).reduce((s, p) => s + (p.amount || 0), 0)
  }
  const paidRate = amount > 0 ? Math.round((paid / amount) * 100) : 0
  return {
    contractCount: list.length,
    qty,
    amount,
    paid,
    paidRate,
  }
})

/** 按 groupName 聚合的行（含 children 供 expand 展开使用） */
const groupRows = computed(() => {
  const list = props.snapshot?.contracts ?? []
  const map = new Map<string, {
    groupName: string
    count: number
    qty: number
    amount: number
    children: BoardSnapshotContract[]
  }>()
  for (const c of list) {
    const key = c.groupName || '未分组'
    if (!map.has(key)) {
      map.set(key, { groupName: key, count: 0, qty: 0, amount: 0, children: [] })
    }
    const g = map.get(key)!
    g.count += 1
    g.qty += c.contractQty || 0
    g.amount += (c.contractQty || 0) * (c.contractPrice || 0)
    g.children.push(c)
  }
  return Array.from(map.values()).sort((a, b) => b.amount - a.amount)
})

/** 千分位 + 指定小数位的数字格式化 */
function formatNum(n: number, digits = 2) {
  if (!Number.isFinite(n)) return '0'
  return n.toLocaleString('zh-CN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

/** 金额格式化（统一保留两位小数） */
function formatMoney(n: number) {
  return formatNum(n, 2)
}
</script>

<style lang="scss" scoped>
/* =========================================================================
   抽屉根容器：去除默认头部，使用自定义 board-header
   ========================================================================= */
:deep(.hw-board-drawer .el-drawer__body) {
  padding: 0;
  background: #f4f6f8;
}

.board-shell {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 24px 32px;
  min-height: 100%;
}

/* ===== 顶部头条 ===== */
.board-header {
  background: #fff;
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);

  .header-left { display: flex; align-items: center; gap: 14px; min-width: 0; }
  .header-badge {
    width: 48px; height: 48px;
    border-radius: 12px;
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    display: flex; align-items: center; justify-content: center;
    color: #fff;
    box-shadow: 0 4px 12px -4px rgba(79, 172, 254, 0.5);
  }
  .header-title {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: #1a1a2e;
    line-height: 1.2;
  }
  .header-subtitle {
    margin: 4px 0 0;
    font-size: 12px;
    color: #909399;
    line-height: 1.4;
  }
}

/* ===== KPI 概览 ===== */
.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.metric-card {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 10px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: relative;
  overflow: hidden;
}
.metric-card::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 4px;
  background: #2f6df6;
}
.metric-a::before { background: #67c23a; }
.metric-b::before { background: #2f6df6; }
.metric-c::before { background: #e6a23c; }
.metric-d::before { background: #9b59b6; }
.m-label { font-size: 13px; color: #606266; }
.m-value { font-size: 22px; font-weight: 700; color: #1a1a2e; line-height: 1.2; }
.m-unit  { font-size: 13px; font-weight: 400; color: #909399; margin-left: 4px; }
.m-hint  { font-size: 12px; color: #909399; }

/* ===== 分组表卡片 ===== */
.board-card {
  background: #fff;
  border-radius: 12px;
  padding: 14px 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);

  .card-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 10px;
    h3 { margin: 0; font-size: 15px; font-weight: 600; color: #1a1a2e; }
    .muted { font-size: 12px; color: #909399; }
  }
}
.expand-wrap { padding: 10px 20px 16px; background: #fafbfc; }

@media (max-width: 1100px) {
  .metric-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
