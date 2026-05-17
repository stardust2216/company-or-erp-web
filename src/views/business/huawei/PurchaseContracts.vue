<!--
  ============================================================================
  华维食品 · 采购合同明细
  ----------------------------------------------------------------------------
  视觉规范：与「订单列表（OrderList.vue）」对齐，三段式布局：
    1. 顶部 Hero 品牌卡：56×56 蓝青渐变图标块 + 主副标题 + 操作按钮区，
       右侧"导出 Excel"按钮承担主要业务动作；
    2. 中部 4 张 stat-card 统计卡（同入出库明细 InventoryFlow 的视觉语言），
       承担数量 / 金额 / 平均单价 / 合同笔数四类指标；
    3. 主表 + 工具条，主表通过 max-height 控制内置滚动，避免页面整体撑高。

  数据规则（沿用之前已经按截图 1:1 录入的种子）：
    · 单一供应商「瓮福国际贸易股份有限公司」，客户名称列整列纵向合并；
    · 同一合同 (contractNo) 下可有多个分项行（不同数量/单价对应不同
      备注），分项行内的「序号 / 日期 / 合同号 / 送货方式 / 备注」列
      通过 spanMethod 合并；
    · 「数量 / 单价」两列保持逐行显示，便于查询每笔分项报价。

  与历史版本的差异：
    · 移除 el-table 的 :show-summary 行（业务方反馈底部"合计"行与
      已有统计卡片信息重复，且在多分项合同里行宽容易错位）；
    · 顶部新增 stat-card 模块，承担「合同笔数 / 采购数量 / 采购金额 /
      平均单价」四项指标。
  ============================================================================
-->
<template>
  <div class="pc-page">
    <!-- ====== Hero：品牌卡片 + 主操作按钮 ====== -->
    <header class="page-hero">
      <div class="hero-left">
        <div class="hero-badge">
          <el-icon :size="28"><Tickets /></el-icon>
        </div>
        <div class="hero-info">
          <h1 class="hero-title">华维食品 - 采购合同</h1>
          <p class="hero-subtitle">硫磺、磷酸采购合同明细 · 供应商「{{ supplierName }}」</p>
        </div>
      </div>
      <div class="hero-actions">
        <!--
          导入 Excel（与订单列表 / 入出库明细相同的交互模式）：
            1) 主按钮点击 → 触发隐藏的 file input；
            2) 下拉项「选择文件导入」→ 同上；
            3) 下拉项「下载导入模板」→ 生成与导出列顺序一致的 CSV 空模板。
        -->
        <el-dropdown split-button :icon="Upload" plain @click="onImportClick">
          导入 Excel
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="onImportClick">选择文件导入</el-dropdown-item>
              <el-dropdown-item divided @click="downloadImportTemplate">下载导入模板</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <input
          ref="importInputRef"
          type="file"
          accept=".csv,.xls,.xlsx,text/csv"
          style="display: none"
          @change="handleImportFile"
        />
        <el-button :icon="Download" plain @click="exportExcel">导出 Excel</el-button>
      </div>
    </header>

    <!-- ====== 统计卡（与入出库明细 InventoryFlow 视觉一致） ====== -->
    <section class="metric-grid">
      <article class="metric-card metric-count">
        <div class="m-label">合同笔数</div>
        <div class="m-value">{{ totalContracts }} <span class="m-unit">份</span></div>
        <div class="m-hint">分项合计 {{ flatRows.length }} 条</div>
      </article>
      <article class="metric-card metric-qty">
        <div class="m-label">采购数量</div>
        <div class="m-value">{{ formatNum(totalQty) }} <span class="m-unit">吨</span></div>
        <div class="m-hint">当前筛选累计签约量</div>
      </article>
      <article class="metric-card metric-amount">
        <div class="m-label">采购金额</div>
        <div class="m-value">{{ formatMoney(totalAmount) }} <span class="m-unit">元</span></div>
        <div class="m-hint">数量 × 单价合计</div>
      </article>
      <article class="metric-card metric-avg">
        <div class="m-label">平均单价</div>
        <div class="m-value">{{ formatNum(avgPrice, 0) }} <span class="m-unit">元/吨</span></div>
        <div class="m-hint">总金额 ÷ 总数量</div>
      </article>
    </section>

    <!-- ====== 工具条（搜索 / 日期 / 导出） ====== -->
    <div class="pc-toolbar">
      <div class="pc-toolbar-left">
        <el-input
          v-model="filter.keyword"
          placeholder="搜索合同编号 / 备注"
          clearable
          :prefix-icon="Search"
          style="width: 240px"
        />
        <el-date-picker
          v-model="filter.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          unlink-panels
          clearable
          style="width: 280px"
        />
        <el-button :icon="RefreshRight" @click="resetFilter">重置</el-button>
      </div>
    </div>

    <!-- ====== 主表（已移除 show-summary 合计行） ====== -->
    <section class="pc-table-card">
      <el-table
        :data="flatRows"
        :span-method="spanMethod"
        stripe
        border
        size="default"
        empty-text="暂无采购合同记录"
        header-cell-class-name="pc-th"
        cell-class-name="pc-td"
        max-height="560"
        class="pc-table"
      >
        <el-table-column
          prop="customerName"
          label="客户名称"
          width="220"
          align="center"
        >
          <template #default="{ row }">
            <span class="pc-customer">{{ row.customerName }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="seq" label="序号" width="70" align="center" />
        <el-table-column prop="date" label="日期" width="110" align="center" />
        <el-table-column
          prop="contractNo"
          label="合同编号"
          width="160"
          align="center"
        >
          <template #default="{ row }">
            <span class="cell-strong">{{ row.contractNo }}</span>
          </template>
        </el-table-column>
        <el-table-column label="数量(吨)" width="110" align="right">
          <template #default="{ row }">{{ formatNum(row.qty) }}</template>
        </el-table-column>
        <el-table-column label="单价(元/吨)" width="120" align="right">
          <template #default="{ row }">{{ formatNum(row.unitPrice, 0) }}</template>
        </el-table-column>
        <el-table-column
          prop="deliveryMode"
          label="送货方式"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <el-tag
              v-if="row.deliveryMode"
              type="info"
              effect="plain"
              size="small"
              round
            >
              {{ row.deliveryMode }}
            </el-tag>
            <span v-else>—</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="remark"
          label="备注（糖厂清单）"
          min-width="260"
          align="left"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span class="pc-remark">{{ row.remark || '—' }}</span>
          </template>
        </el-table-column>
      </el-table>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { Search, Download, Upload, RefreshRight, Tickets } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

/**
 * 采购合同分项行
 * ---------------------------------------------------------------
 * 一份合同（contractNo）可能拆成多笔分项 —— 同一合同号下不同数量
 * 或单价对应不同糖厂清单。__subIndex / __subCount 用于 spanMethod
 * 决定纵向合并的范围。
 */
interface PurchaseItem {
  customerName: string
  contractNo: string
  seq: number
  date: string
  qty: number
  unitPrice: number
  deliveryMode: string
  remark: string
  __subIndex: number
  __subCount: number
}

const supplierName = '瓮福国际贸易股份有限公司'

/**
 * 采购合同种子数据（按用户提供的截图 1:1 录入）
 */
// 采购合同种子的行类型（提取为命名 interface，避免在 reactive 泛型中
// 嵌入对象类型字面量 —— 那会触发 babel 解析 ">>" 时的歧义报错）
interface PurchaseSeed {
  contractNo: string
  seq: number
  date: string
  deliveryMode: string
  items: Array<[number, number, string]>
}

// 使用 reactive 包裹：导入新合同时 push 到该数组会触发 flatRows 重算
const seed = reactive([
  {
    contractNo: '20251030-01',
    seq: 1,
    date: '2025.10.30',
    deliveryMode: '送到',
    items: [
      [1790, 6400, '迁江、凤凰、桂宝、石龙、峦城、良庆、石塘、天等、新凯、合山、东江'],
      [60, 6600, '云南石屏'],
    ],
  },
  {
    contractNo: '20251030-02',
    seq: 2,
    date: '2025.10.30',
    deliveryMode: '送到',
    items: [[500, 6400, '东门、龙州、龙二、田一、田二、南圩、上林、忻城、霞秀、海南']],
  },
  {
    contractNo: '20251030-03',
    seq: 3,
    date: '2025.10.30',
    deliveryMode: '送到',
    items: [[250, 6400, '香山糖厂']],
  },
  {
    contractNo: '20251030-04',
    seq: 4,
    date: '2025.10.30',
    deliveryMode: '送到',
    items: [
      [1250, 6400, '崇左、江州、北海、吉东'],
      [60, 6510, '粤北糖厂'],
      [90, 6630, '勐养糖厂'],
      [100, 6740, '芒东糖厂'],
    ],
  },
  {
    contractNo: '20251102-05',
    seq: 5,
    date: '2025.11.02',
    deliveryMode: '送到',
    items: [[150, 6400, '明阳、东江、伶俐、宾阳']],
  },
  {
    contractNo: '20260122-01',
    seq: 6,
    date: '2026.1.22',
    deliveryMode: '送到',
    items: [[120, 6800, '香山糖厂']],
  },
  {
    contractNo: '20260122-02',
    seq: 7,
    date: '2026.1.22',
    deliveryMode: '送到',
    items: [[800, 6800, '明阳、东江、伶俐、宾阳']],
  },
  {
    contractNo: '20260130-03',
    seq: 8,
    date: '2026.1.30',
    deliveryMode: '送到',
    items: [[400, 6950, '迁江、凤凰、桂宝、石龙、峦城、良庆、石塘、天等、新凯、合山、东江']],
  },
  {
    contractNo: '20260211-04',
    seq: 9,
    date: '2026.2.11',
    deliveryMode: '送到',
    items: [[200, 6800, '田一、田二、南圩、上林、忻城、霞秀、海南']],
  },
]) as PurchaseSeed[]

/** 筛选条件 */
const filter = reactive({
  keyword: '' as string,
  dateRange: [] as string[] | null,
})

function resetFilter() {
  filter.keyword = ''
  filter.dateRange = []
}

/**
 * 按筛选条件展开成扁平分项行（每个分项 = 1 行）。
 */
const flatRows = computed<PurchaseItem[]>(() => {
  const kw = filter.keyword.trim().toLowerCase()
  const [start, end] = (filter.dateRange ?? []) as string[]
  return seed
    .filter((c) => {
      if (
        kw &&
        !c.contractNo.toLowerCase().includes(kw) &&
        !c.items.some(([, , remark]) => remark.toLowerCase().includes(kw))
      ) {
        return false
      }
      if (start && end) {
        const iso = c.date.replace(/\./g, '-').padEnd(10, '-')
        if (iso < start || iso > end) return false
      }
      return true
    })
    .flatMap((c) =>
      c.items.map(([qty, price, remark], idx) => ({
        customerName: supplierName,
        contractNo: c.contractNo,
        seq: c.seq,
        date: c.date,
        qty,
        unitPrice: price,
        deliveryMode: c.deliveryMode,
        remark,
        __subIndex: idx,
        __subCount: c.items.length,
      }))
    )
})

/* ============= 顶部统计指标 ============= */
const totalQty = computed(() => flatRows.value.reduce((s, r) => s + r.qty, 0))
const totalAmount = computed(() => flatRows.value.reduce((s, r) => s + r.qty * r.unitPrice, 0))
const totalContracts = computed(() => new Set(flatRows.value.map((r) => r.contractNo)).size)
const avgPrice = computed(() =>
  totalQty.value > 0 ? totalAmount.value / totalQty.value : 0
)

/**
 * 行合并：
 *  · column 0（客户名称）：整列只在首行渲染；
 *  · column 4 / 5（数量、单价）：逐行显示；
 *  · 其它列：同合同首行 rowSpan = subCount，其它分项隐藏。
 */
function spanMethod({
  row,
  rowIndex,
  columnIndex,
}: {
  row: PurchaseItem
  rowIndex: number
  columnIndex: number
}): [number, number] {
  if (columnIndex === 0) {
    return rowIndex === 0 ? [flatRows.value.length, 1] : [0, 0]
  }
  if (columnIndex === 4 || columnIndex === 5) return [1, 1]
  return row.__subIndex === 0 ? [row.__subCount, 1] : [0, 0]
}

/** 数量 / 通用千分位格式化 */
function formatNum(n: number | null | undefined, digits = 2) {
  if (n === null || n === undefined || Number.isNaN(n)) return ''
  return n.toLocaleString('zh-CN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

/** 金额格式化（统一两位小数） */
function formatMoney(n: number) {
  return formatNum(n, 2)
}

/**
 * 简版 Excel 导出（CSV，避免引入额外依赖）
 */
function exportExcel() {
  const headers = [
    '客户名称',
    '序号',
    '日期',
    '合同编号',
    '数量(吨)',
    '单价(元/吨)',
    '送货方式',
    '备注',
  ]
  const lines = [headers.join(',')]
  flatRows.value.forEach((r) => {
    lines.push(
      [
        r.customerName,
        r.seq,
        r.date,
        r.contractNo,
        r.qty,
        r.unitPrice,
        r.deliveryMode,
        `"${r.remark}"`,
      ].join(',')
    )
  })
  const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `硫磺、磷酸采购合同_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('已导出当前筛选下的采购合同明细')
}

/* =========================================================================
   导入 Excel（轻量 CSV 导入）
   -------------------------------------------------------------------------
   与 exportExcel 完全对称：导出的 CSV 可直接二次导入。
   列顺序必须为：客户名称 / 序号 / 日期 / 合同编号 / 数量 / 单价 /
   送货方式 / 备注。
   ========================================================================= */

/** 隐藏 <input type="file"> 的引用，由"导入 Excel"按钮触发 click */
const importInputRef = ref<HTMLInputElement | null>(null)

/**
 * 下载导入模板（CSV）
 * ---------------------------------------------------------------
 * 列顺序与 exportExcel 一致；UTF-8 BOM 防止中文乱码。
 */
function downloadImportTemplate() {
  const header = [
    '客户名称', '序号', '日期', '合同编号',
    '数量', '单价', '送货方式', '备注',
  ]
  const sample = [supplierName, '1', '2026.01.01', 'PC-20260101-001',
    '100', '6800', '送到', '示例备注']
  const csv = '\uFEFF' + [header.join(','), sample.join(',')].join('\r\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = '采购合同导入模板.csv'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  ElMessage.success('已生成采购合同导入模板，请按列顺序填写后再导入')
}

/** 点击"导入 Excel"按钮 */
function onImportClick() {
  if (!importInputRef.value) return
  // 每次重置 value 以允许重复选择同一个文件
  importInputRef.value.value = ''
  importInputRef.value.click()
}

/** 简版 CSV 行解析器，支持双引号转义 */
function parseCsvLine(line: string): string[] {
  const cells: string[] = []
  let cur = ''
  let inQuote = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuote) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++ }
      else if (ch === '"') { inQuote = false }
      else { cur += ch }
    } else {
      if (ch === ',') { cells.push(cur); cur = '' }
      else if (ch === '"') { inQuote = true }
      else { cur += ch }
    }
  }
  cells.push(cur)
  return cells.map((c) => c.trim())
}

/**
 * 文件选择回调：解析 CSV → 同合同号合并分项 → push 进 seed
 */
async function handleImportFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  try {
    const text = await file.text()
    const raw = text.replace(/^\uFEFF/, '')
    const lines = raw.split(/\r?\n/).filter((l) => l.trim())
    if (lines.length < 2) {
      ElMessage.warning('文件内容为空或缺少数据行')
      return
    }
    const dataRows = lines.slice(1)
    let imported = 0

    for (const line of dataRows) {
      const cells = parseCsvLine(line)
      if (cells.length < 8) continue
      const [, seqStr, date, contractNo, qtyStr, priceStr, deliveryMode, remark] = cells
      if (!contractNo) continue

      const seq = Number(seqStr) || (seed.length + 1)
      const qty = Number(qtyStr) || 0
      const price = Number(priceStr) || 0

      // 同合同号合并：分项 push；新合同号则新建一份
      let c = seed.find((x) => x.contractNo === contractNo)
      if (!c) {
        c = { contractNo, seq, date, deliveryMode: deliveryMode || '送到', items: [] }
        seed.push(c)
      }
      c.items.push([qty, price, remark || ''])
      imported++
    }

    if (imported === 0) {
      ElMessage.warning('未解析到有效数据行，请确认列顺序与模板一致')
    } else {
      ElMessage.success(`已导入 ${imported} 条采购合同分项`)
    }
  } catch (err) {
    console.error('[PurchaseContracts] import failed:', err)
    ElMessage.error('导入失败：文件格式不正确或无法读取')
  } finally {
    input.value = ''
  }
}
</script>

<style lang="scss" scoped>
/* =========================================================================
   页面整体
   ========================================================================= */
.pc-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
}

/* =========================================================================
   Hero（与订单列表完全一致：白卡 + 蓝青渐变 badge）
   ========================================================================= */
.page-hero {
  background: #fff;
  border-radius: 12px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);

  .hero-left {
    display: flex;
    gap: 16px;
    align-items: center;
    min-width: 0;
    flex: 1;
  }
  .hero-badge {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    flex-shrink: 0;
    box-shadow: 0 4px 12px -4px rgba(79, 172, 254, 0.5);
  }
  .hero-info {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .hero-title {
    font-size: 20px;
    font-weight: 700;
    margin: 0;
    letter-spacing: 0.3px;
    color: #1a1a2e;
    line-height: 1.2;
  }
  .hero-subtitle {
    font-size: 13px;
    margin: 0;
    color: #999;
    line-height: 1.4;
  }
  .hero-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
}

/* =========================================================================
   统计卡（与 InventoryFlow.vue 的 .metric-card 同款）
   ========================================================================= */
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
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: #2f6df6;
}
.metric-count::before  { background: #67c23a; }
.metric-qty::before    { background: #2f6df6; }
.metric-amount::before { background: #e6a23c; }
.metric-avg::before    { background: #9b59b6; }
.m-label { font-size: 13px; color: #606266; }
.m-value { font-size: 22px; font-weight: 700; color: #1a1a2e; line-height: 1.2; }
.m-unit  { font-size: 13px; font-weight: 400; color: #909399; margin-left: 4px; }
.m-hint  { font-size: 12px; color: #909399; }

/* =========================================================================
   工具条
   ========================================================================= */
.pc-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: #fff;
  border-radius: 10px;
  padding: 10px 14px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
  flex-wrap: wrap;
}
.pc-toolbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

/* =========================================================================
   主表卡
   ========================================================================= */
.pc-table-card {
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
}
.pc-table {
  width: 100%;
}
:deep(.pc-th) {
  background: #f0f4ff !important;
  color: #1f2937 !important;
  font-weight: 600 !important;
  text-align: center !important;
}
:deep(.pc-td) {
  vertical-align: middle !important;
}
.pc-customer {
  font-weight: 600;
  color: #1a73e8;
  line-height: 1.5;
}
.cell-strong {
  font-weight: 600;
  color: #1f2937;
  font-variant-numeric: tabular-nums;
}
.pc-remark {
  display: inline-block;
  line-height: 1.5;
  word-break: break-all;
  color: #4b5563;
}

@media (max-width: 1100px) {
  .metric-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
