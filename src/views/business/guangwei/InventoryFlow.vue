<!--
  ============================================================================
  广为科技 · 硫磺、磷酸入出库流水视图（Plan B 形态 / 数据沿用合同子记录）
  ----------------------------------------------------------------------------
  设计原则：
    1. **视觉上是入出库流水主视图**：用户在「入出库明细」一进来默认看到的
       就是按时间倒序排列的入库 / 出库流水，方向用 tag 区分。
    2. **底层仍以合同子记录为单一事实源**：本视图本身只读，不持有独立的
       InventoryRecord 实体；所有"行编辑"都通过「查看合同」跳转到来源
       合同的详情抽屉里进行。这样避免双写口径与数据迁移成本。
    3. **跨页实时联动**：通过 contractStore 提供的模块级共享 ref，无论
       入库（采购合同 receipts）还是出库（销售合同 shipments）发生增删改，
       本视图都会自动重算。
    4. **导入采用统一"方向列"模板**：单 sheet 含方向列，导入时按方向写回
       对应合同的子表；导出同样平铺出方向列，与导入模板形状一致。

  与父组件 Warehouse.vue 的契约：
    - emit('open-purchase', contractId): 父组件负责打开本页内的合同抽屉
    - 出库行直接 router.push 到订单列表的合同详情独立路由

  注意事项：
    - contractStore.useContractStore 在 store 已存在但为空时支持"种子补齐"，
      因此本组件即便先于 OrderList.vue 调用 useContractStore('guangwei-sales')
      也不会"吞掉"销售合同的真实种子数据。
  ============================================================================
-->
<template>
  <div class="flow-view">
    <!-- ============ 指标概览（4 张小卡） ============ -->
    <div class="metric-grid">
      <div class="metric-card metric-in">
        <div class="m-label">累计入库</div>
        <div class="m-value">{{ formatNum(totalIn) }} <span class="m-unit">吨</span></div>
        <div class="m-hint">来源：采购合同 receipts</div>
      </div>
      <div class="metric-card metric-out">
        <div class="m-label">累计出库</div>
        <div class="m-value">{{ formatNum(totalOut) }} <span class="m-unit">吨</span></div>
        <div class="m-hint">来源：销售合同 shipments</div>
      </div>
      <div class="metric-card metric-balance" :class="{ 'is-shortage': balance < 0 }">
        <div class="m-label">当前余量</div>
        <div class="m-value">{{ formatNum(balance) }} <span class="m-unit">吨</span></div>
        <div class="m-hint">{{ balance < 0 ? '已出 > 已入，请核对入库' : '入库 − 出库' }}</div>
      </div>
      <div class="metric-card metric-count">
        <div class="m-label">流水条数</div>
        <div class="m-value">{{ flowRows.length }} <span class="m-unit">条</span></div>
        <div class="m-hint">入 {{ inCount }} / 出 {{ outCount }}</div>
      </div>
    </div>

    <!-- ============ 工具条 ============ -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-radio-group v-model="filters.direction" size="default">
          <el-radio-button label="all">全部</el-radio-button>
          <el-radio-button label="in">入库</el-radio-button>
          <el-radio-button label="out">出库</el-radio-button>
        </el-radio-group>
        <el-date-picker
          v-model="filters.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          unlink-panels
          clearable
          style="width: 260px"
        />
        <el-input
          v-model="filters.partner"
          placeholder="对手方关键字"
          clearable
          :prefix-icon="SearchIcon"
          style="width: 180px"
        />
        <el-input
          v-model="filters.contractNo"
          placeholder="合同号关键字"
          clearable
          :prefix-icon="SearchIcon"
          style="width: 200px"
        />
        <el-button :icon="RefreshRightIcon" @click="resetFilters">重置</el-button>
      </div>
      <div class="toolbar-right">
        <el-dropdown split-button :icon="UploadIcon" plain @click="triggerImport">
          <span>导入流水</span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="triggerImport">选择文件导入</el-dropdown-item>
              <el-dropdown-item divided @click="downloadTemplate">下载导入模板</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <input
          ref="fileInputRef"
          type="file"
          accept=".xlsx,.xls"
          style="display: none"
          @change="handleFileChange"
        />
        <el-button :icon="DownloadIcon" plain :disabled="!filteredRows.length" @click="exportFlow">
          导出流水
        </el-button>
      </div>
    </div>

    <!-- ============ 流水表格 ============ -->
    <el-table
      :data="pagedRows"
      stripe
      border
      size="default"
      :max-height="tableMaxHeight"
      empty-text="暂无入出库流水，可通过『导入流水』或前往合同页登记子记录"
      class="flow-table"
    >
      <el-table-column label="日期" prop="date" width="110" align="center" sortable />
      <el-table-column label="方向" width="80" align="center">
        <template #default="{ row }">
          <el-tag
            :type="row.direction === 'in' ? 'success' : 'primary'"
            effect="light"
            round
            size="small"
          >
            {{ row.direction === 'in' ? '入库' : '出库' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="合同号" prop="contractNo" min-width="180" show-overflow-tooltip>
        <template #default="{ row }">
          <span class="cell-strong">{{ row.contractNo || '—' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="对手方" prop="partner" min-width="150" show-overflow-tooltip />
      <el-table-column label="车号 / 单号" prop="vehicleNo" width="130" align="center">
        <template #default="{ row }">{{ row.vehicleNo || '—' }}</template>
      </el-table-column>
      <el-table-column label="数量(吨)" prop="qty" width="100" align="right" sortable>
        <template #default="{ row }">{{ formatNum(row.qty) }}</template>
      </el-table-column>
      <el-table-column label="单价(元)" prop="price" width="100" align="right">
        <template #default="{ row }">{{ row.price ? formatNum(row.price) : '—' }}</template>
      </el-table-column>
      <el-table-column label="金额(元)" prop="amount" width="120" align="right">
        <template #default="{ row }">{{ row.amount ? formatNum(row.amount) : '—' }}</template>
      </el-table-column>
      <el-table-column label="磅差(吨)" width="90" align="right">
        <template #default="{ row }">
          <span :class="{ 'diff-pos': row.weighDiff > 0, 'diff-neg': row.weighDiff < 0 }">
            {{ row.weighDiff ? formatNum(row.weighDiff) : '—' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="备注" prop="remark" min-width="150" show-overflow-tooltip />
      <el-table-column label="操作" width="110" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="jumpToContract(row)">
            查看合同
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- ============ 分页 ============ -->
    <el-pagination
      v-model:current-page="page.currentPage"
      v-model:page-size="page.pageSize"
      :total="filteredRows.length"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      background
      class="flow-pagination"
    />

    <!-- ============ 导入预览对话框 ============ -->
    <el-dialog
      v-model="importDialog.visible"
      title="导入入出库流水"
      width="720px"
      :close-on-click-modal="false"
    >
      <template v-if="importDialog.error">
        <el-alert :title="importDialog.error" type="error" :closable="false" show-icon />
      </template>
      <template v-else-if="importDialog.preview.length">
        <el-alert
          :title="`已解析 ${importDialog.preview.length} 条流水（入库 ${importDialog.inCount} / 出库 ${importDialog.outCount}），下方为前 10 条预览：`"
          type="success"
          :closable="false"
          show-icon
          style="margin-bottom: 12px"
        />
        <el-table :data="importDialog.preview.slice(0, 10)" size="small" border max-height="320">
          <el-table-column label="方向" width="70" align="center">
            <template #default="{ row }">
              <el-tag :type="row.direction === 'in' ? 'success' : 'primary'" size="small" round>
                {{ row.direction === 'in' ? '入库' : '出库' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="date" label="日期" width="100" />
          <el-table-column prop="contractNo" label="合同号" min-width="150" show-overflow-tooltip />
          <el-table-column prop="partner" label="对手方" min-width="120" show-overflow-tooltip />
          <el-table-column prop="qty" label="数量(吨)" width="90" align="right" />
          <el-table-column prop="price" label="单价(元)" width="90" align="right" />
        </el-table>
        <template v-if="importDialog.warnings.length">
          <el-alert
            :title="`另有 ${importDialog.warnings.length} 行因合同号未匹配被跳过，确认后将忽略`"
            type="warning"
            :closable="false"
            show-icon
            style="margin-top: 12px"
          />
        </template>
      </template>
      <template #footer>
        <el-button @click="importDialog.visible = false">取消</el-button>
        <el-button
          type="primary"
          :disabled="!importDialog.preview.length"
          @click="confirmImport"
        >
          确认写入（{{ importDialog.preview.length }} 条）
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  ElButton,
  ElTable,
  ElTableColumn,
  ElTag,
  ElInput,
  ElDatePicker,
  ElRadioGroup,
  ElRadioButton,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElPagination,
  ElDialog,
  ElAlert,
  ElMessage,
} from 'element-plus'
import {
  Search as SearchIcon,
  RefreshRight as RefreshRightIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
} from '@element-plus/icons-vue'
import * as XLSX from 'xlsx'
import { useContractStore } from './contractStore'
import { salesSeed } from './salesSeed'
import { purchaseSeed } from './purchaseSeed'

// ---------------------------------------------------------------------------
// 与父组件之间的事件契约
// ---------------------------------------------------------------------------
const emit = defineEmits<{
  /**
   * 用户在入库行点击「查看合同」时触发；父组件应根据 contractId 打开
   * 本页内（采购）合同的详情抽屉。
   */
  (e: 'open-purchase', contractId: string): void
}>()

const router = useRouter()

// ---------------------------------------------------------------------------
// 共享 store（与两个业务 SFC 同 key，依赖 contractStore 的"种子补齐"机制
// 处理"流水视图先于业务 SFC 挂载"的边界情况）
// ---------------------------------------------------------------------------
interface SubReceipt {
  date: string
  unit?: string
  receiver?: string
  weighNo?: string
  qty: number
  price?: number
  amount?: number
  weighDiff?: number
  remark?: string
}
interface SubShipment {
  date: string
  location?: string
  outNo?: string
  qty: number
  remark?: string
}
interface BaseContract {
  id: string
  contractNo: string
  factoryName: string
  contractPrice?: number
  receipts?: SubReceipt[]
  shipments?: SubShipment[]
}

// 入库侧：本页业务的采购合同
// 入出库流水可能先于 Warehouse.vue / OrderList.vue 被挂载（用户直接从菜单进入
// 「入出库明细」时即如此），如果这里只用空种子注册，等用户切到其它页面再回来，
// contractStore 的种子补齐机制虽然能纠正，但首屏会"空 3 秒"。
// 因此直接把已抽离的 salesSeed / purchaseSeed 作为种子工厂传入，保证：
//   1) 任何先打开的页面都用同一份真数据种 store；
//   2) 已被业务 SFC 修改过（非空）的 store，会被工厂的 lazy-call 机制跳过，
//      不会发生"用初始 mock 覆盖业务方编辑结果"的回写事故。
const purchases = useContractStore<BaseContract>(
  'guangwei-purchase',
  () => purchaseSeed as unknown as BaseContract[]
)
// 出库侧：订单列表页的销售合同
const sales = useContractStore<BaseContract>(
  'guangwei-sales',
  () => salesSeed as unknown as BaseContract[]
)

// ---------------------------------------------------------------------------
// 流水行模型
// ---------------------------------------------------------------------------
interface FlowRow {
  /** 唯一行键 = direction + contractId + 子表 index，用于 v-for / 排序稳定 */
  key: string
  direction: 'in' | 'out'
  date: string
  contractId: string
  contractNo: string
  /** 对手方：入库 = 供应商工厂名；出库 = 客户工厂名 */
  partner: string
  /** 车号 / 单号：入库取过磅单号，出库取出库单号 */
  vehicleNo: string
  qty: number
  price: number
  amount: number
  weighDiff: number
  remark: string
}

/** 把采购合同的 receipts 展平为入库流水 */
function buildInRows(list: BaseContract[]): FlowRow[] {
  const rows: FlowRow[] = []
  list.forEach((c) => {
    (c.receipts || []).forEach((r, i) => {
      rows.push({
        key: `in-${c.id}-${i}`,
        direction: 'in',
        date: r.date || '',
        contractId: c.id,
        contractNo: c.contractNo || '',
        partner: c.factoryName || '',
        vehicleNo: r.weighNo || '',
        qty: r.qty || 0,
        price: r.price || 0,
        amount: r.amount || (r.qty || 0) * (r.price || 0),
        weighDiff: r.weighDiff || 0,
        remark: r.remark || '',
      })
    })
  })
  return rows
}

/** 把销售合同的 shipments 展平为出库流水（金额按合同单价估算） */
function buildOutRows(list: BaseContract[]): FlowRow[] {
  const rows: FlowRow[] = []
  list.forEach((c) => {
    const unitPrice = c.contractPrice || 0
    ;(c.shipments || []).forEach((s, i) => {
      rows.push({
        key: `out-${c.id}-${i}`,
        direction: 'out',
        date: s.date || '',
        contractId: c.id,
        contractNo: c.contractNo || '',
        partner: c.factoryName || '',
        vehicleNo: s.outNo || '',
        qty: s.qty || 0,
        price: unitPrice,
        amount: (s.qty || 0) * unitPrice,
        weighDiff: 0,
        remark: s.remark || '',
      })
    })
  })
  return rows
}

const flowRows = computed<FlowRow[]>(() => {
  const all = [...buildInRows(purchases.value), ...buildOutRows(sales.value)]
  // 按日期倒序，方便业务方第一眼看到最新流水
  return all.sort((a, b) => (a.date < b.date ? 1 : -1))
})

// ---------------------------------------------------------------------------
// 指标
// ---------------------------------------------------------------------------
const totalIn = computed(() =>
  buildInRows(purchases.value).reduce((s, r) => s + r.qty, 0)
)
const totalOut = computed(() =>
  buildOutRows(sales.value).reduce((s, r) => s + r.qty, 0)
)
const balance = computed(() => totalIn.value - totalOut.value)
const inCount = computed(() => flowRows.value.filter((r) => r.direction === 'in').length)
const outCount = computed(() => flowRows.value.filter((r) => r.direction === 'out').length)

// ---------------------------------------------------------------------------
// 过滤与分页
// ---------------------------------------------------------------------------
const filters = reactive<{
  direction: 'all' | 'in' | 'out'
  dateRange: [string, string] | null
  partner: string
  contractNo: string
}>({
  direction: 'all',
  dateRange: null,
  partner: '',
  contractNo: '',
})

const filteredRows = computed<FlowRow[]>(() => {
  return flowRows.value.filter((r) => {
    if (filters.direction !== 'all' && r.direction !== filters.direction) return false
    if (filters.dateRange && filters.dateRange.length === 2) {
      const [start, end] = filters.dateRange
      if (start && r.date < start) return false
      if (end && r.date > end) return false
    }
    if (filters.partner && !r.partner.toLowerCase().includes(filters.partner.toLowerCase())) {
      return false
    }
    if (
      filters.contractNo &&
      !r.contractNo.toLowerCase().includes(filters.contractNo.toLowerCase())
    ) {
      return false
    }
    return true
  })
})

const page = reactive({ currentPage: 1, pageSize: 20 })
const pagedRows = computed(() => {
  const start = (page.currentPage - 1) * page.pageSize
  return filteredRows.value.slice(start, start + page.pageSize)
})

const tableMaxHeight = ref(560)

function resetFilters() {
  filters.direction = 'all'
  filters.dateRange = null
  filters.partner = ''
  filters.contractNo = ''
  page.currentPage = 1
}

// ---------------------------------------------------------------------------
// 跳转到来源合同
// ---------------------------------------------------------------------------
function jumpToContract(row: FlowRow) {
  if (row.direction === 'in') {
    // 入库 → 本页内打开采购合同抽屉
    emit('open-purchase', row.contractId)
  } else {
    // 出库 → 跳到"订单列表"页并通过 query.openId 告诉它要打开哪份
    // 销售合同。订单列表的 consumeOpenIdFromQuery 会接管：清掉
    // openId 后用本地全屏抽屉直接打开详情，不再产生新 TagsView 标签。
    router.push({ name: 'GuangweiOrderList', query: { openId: row.contractId } })
  }
}

// ---------------------------------------------------------------------------
// 工具函数
// ---------------------------------------------------------------------------
function formatNum(n: number): string {
  if (!Number.isFinite(n)) return '—'
  if (Math.abs(n) >= 1000) return n.toLocaleString('zh-CN', { maximumFractionDigits: 2 })
  return String(Number(n.toFixed(3)))
}

// ---------------------------------------------------------------------------
// 导出 Excel（单 sheet，列与导入模板完全对齐）
// ---------------------------------------------------------------------------
const EXPORT_HEADERS = [
  '方向',
  '日期',
  '合同号',
  '对手方',
  '车号/单号',
  '数量(吨)',
  '单价(元)',
  '金额(元)',
  '磅差(吨)',
  '备注',
]

function exportFlow() {
  const list = filteredRows.value
  if (!list.length) {
    ElMessage.warning('当前筛选结果为空，无可导出数据')
    return
  }
  const loading = ElMessage({
    message: '正在生成 Excel 文件，请稍候...',
    type: 'info',
    duration: 0,
  })
  try {
    const rows = list.map((r) => ({
      方向: r.direction === 'in' ? '入库' : '出库',
      日期: r.date,
      合同号: r.contractNo,
      对手方: r.partner,
      '车号/单号': r.vehicleNo,
      '数量(吨)': r.qty,
      '单价(元)': r.price || '',
      '金额(元)': r.amount || '',
      '磅差(吨)': r.weighDiff || '',
      备注: r.remark || '',
    }))
    const ws = XLSX.utils.json_to_sheet(rows, { header: EXPORT_HEADERS })
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '入出库流水')

    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array', compression: true })
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const fileName = `硫磺、磷酸入出库流水_${new Date().toISOString().slice(0, 10)}.xlsx`
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = fileName
    anchor.style.display = 'none'
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    setTimeout(() => URL.revokeObjectURL(url), 100)

    loading.close()
    ElMessage.success(`已导出 ${rows.length} 条流水`)
  } catch (err) {
    loading.close()
    console.error('[InventoryFlow.exportFlow] failed:', err)
    ElMessage.error(`导出失败：${(err as Error)?.message || '未知错误'}`)
  }
}

// ---------------------------------------------------------------------------
// 下载导入模板
// ---------------------------------------------------------------------------
function downloadTemplate() {
  // 用一行示例数据帮助业务方理解每个字段格式
  const sample = [
    {
      方向: '入库',
      日期: '2026-04-15',
      合同号: 'WFL-X-GZ-PPA-GW-20251030-02',
      对手方: '瓮福国际贸易股份有限公司',
      '车号/单号': 'GW-2026-0415-01',
      '数量(吨)': 10.32,
      '单价(元)': 6400,
      '金额(元)': 66048,
      '磅差(吨)': -0.32,
      备注: '示例：入库写回采购合同 receipts',
    },
    {
      方向: '出库',
      日期: '2026-04-20',
      合同号: 'HW-S-2026-001',
      对手方: '昌江糖厂',
      '车号/单号': 'OUT-20260420-A',
      '数量(吨)': 5.0,
      '单价(元)': 7800,
      '金额(元)': 39000,
      '磅差(吨)': '',
      备注: '示例：出库写回销售合同 shipments',
    },
  ]
  const ws = XLSX.utils.json_to_sheet(sample, { header: EXPORT_HEADERS })
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '入出库流水模板')

  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array', compression: true })
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = '硫磺、磷酸入出库流水_导入模板.xlsx'
  anchor.style.display = 'none'
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  setTimeout(() => URL.revokeObjectURL(url), 100)
}

// ---------------------------------------------------------------------------
// 导入解析（含预览确认）
// ---------------------------------------------------------------------------
interface ParsedRow {
  direction: 'in' | 'out'
  date: string
  contractNo: string
  partner: string
  vehicleNo: string
  qty: number
  price: number
  amount: number
  weighDiff: number
  remark: string
  /** 目标合同（解析时由合同号匹配得到��� */
  targetContractId: string
}

const fileInputRef = ref<HTMLInputElement | null>(null)

const importDialog = reactive<{
  visible: boolean
  preview: ParsedRow[]
  warnings: string[]
  error: string
  inCount: number
  outCount: number
}>({
  visible: false,
  preview: [],
  warnings: [],
  error: '',
  inCount: 0,
  outCount: 0,
})

function triggerImport() {
  fileInputRef.value?.click()
}

function safeStr(v: unknown): string {
  if (v === null || v === undefined) return ''
  if (v instanceof Date) return v.toISOString().slice(0, 10)
  return String(v).trim()
}
function safeNum(v: unknown): number {
  if (v === null || v === undefined || v === '') return 0
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function handleFileChange(ev: Event) {
  const input = ev.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = e.target?.result
      const wb = XLSX.read(data, { type: 'array', cellDates: true })
      const ws = wb.Sheets[wb.SheetNames[0]]
      if (!ws) throw new Error('文件中未找到任何工作表')
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, {
        defval: '',
        raw: false,
      })
      if (!rows.length) throw new Error('文件中没有数据行（至少需要 1 行表头 + 1 行数据）')

      const preview: ParsedRow[] = []
      const warnings: string[] = []
      let inCount = 0
      let outCount = 0

      rows.forEach((raw, idx) => {
        const dirRaw = safeStr(raw['方向'])
        if (!dirRaw) return // 整行空忽略
        const direction: 'in' | 'out' | null =
          dirRaw.includes('入') ? 'in' : dirRaw.includes('出') ? 'out' : null
        if (!direction) {
          warnings.push(`第 ${idx + 2} 行：方向「${dirRaw}」无法识别，需为「入库」或「出库」`)
          return
        }
        const contractNo = safeStr(raw['合同号'])
        if (!contractNo) {
          warnings.push(`第 ${idx + 2} 行：合同号为空，已跳过`)
          return
        }
        // 按方向到对应 store 找匹配合同
        const pool = direction === 'in' ? purchases.value : sales.value
        const target = pool.find((c) => c.contractNo === contractNo)
        if (!target) {
          warnings.push(
            `第 ${idx + 2} 行：方向「${dirRaw}」对应的合同号「${contractNo}」未在${
              direction === 'in' ? '采购' : '销售'
            }合同中找到，已跳过`
          )
          return
        }
        const qty = safeNum(raw['数量(吨)'])
        const price = safeNum(raw['单价(元)'])
        const amount = safeNum(raw['金额(元)']) || qty * price
        preview.push({
          direction,
          date: safeStr(raw['日期']),
          contractNo,
          partner: safeStr(raw['对手方']) || target.factoryName,
          vehicleNo: safeStr(raw['车号/单号']),
          qty,
          price,
          amount,
          weighDiff: safeNum(raw['磅差(吨)']),
          remark: safeStr(raw['备注']),
          targetContractId: target.id,
        })
        if (direction === 'in') inCount++
        else outCount++
      })

      if (!preview.length && !warnings.length) {
        throw new Error('未能解析出任何有效流水行')
      }

      importDialog.preview = preview
      importDialog.warnings = warnings
      importDialog.inCount = inCount
      importDialog.outCount = outCount
      importDialog.error = ''
      importDialog.visible = true
    } catch (err) {
      importDialog.preview = []
      importDialog.warnings = []
      importDialog.error = `解析失败：${(err as Error)?.message || '未知错误'}`
      importDialog.visible = true
    } finally {
      // 允许同一文件再次选择
      if (fileInputRef.value) fileInputRef.value.value = ''
    }
  }
  reader.readAsArrayBuffer(file)
}

function confirmImport() {
  const rows = importDialog.preview
  if (!rows.length) return
  // 按方向分发：入库 → 写回采购合同 receipts；出库 → 写回销售合同 shipments
  rows.forEach((r) => {
    if (r.direction === 'in') {
      const c = purchases.value.find((x) => x.id === r.targetContractId)
      if (!c) return
      if (!c.receipts) c.receipts = []
      c.receipts.push({
        date: r.date,
        unit: r.partner,
        receiver: '',
        weighNo: r.vehicleNo,
        qty: r.qty,
        price: r.price,
        amount: r.amount,
        weighDiff: r.weighDiff,
        remark: r.remark,
      })
    } else {
      const c = sales.value.find((x) => x.id === r.targetContractId)
      if (!c) return
      if (!c.shipments) c.shipments = []
      c.shipments.push({
        date: r.date,
        location: '广为仓库',
        outNo: r.vehicleNo,
        qty: r.qty,
        remark: r.remark,
      })
    }
  })
  ElMessage.success(`已写入 ${rows.length} 条流水（入库 ${importDialog.inCount} / 出库 ${importDialog.outCount}）`)
  importDialog.visible = false
  importDialog.preview = []
  importDialog.warnings = []
}
</script>

<style lang="scss" scoped>
.flow-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ===== 指标卡 ===== */
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
.metric-in::before { background: #67c23a; }
.metric-out::before { background: #2f6df6; }
.metric-balance::before { background: #e6a23c; }
.metric-balance.is-shortage::before { background: #e53935; }
.metric-count::before { background: #909399; }
.m-label { font-size: 13px; color: #606266; }
.m-value { font-size: 22px; font-weight: 700; color: #1a1a2e; line-height: 1.2; }
.m-unit { font-size: 13px; font-weight: 400; color: #909399; margin-left: 4px; }
.m-hint { font-size: 12px; color: #909399; }
.metric-balance.is-shortage .m-value { color: #b91c1c; }

/* ===== 工具条 ===== */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  padding: 12px 16px;
  border-radius: 10px;
  border: 1px solid #ebeef5;
  flex-wrap: wrap;
  gap: 12px;
}
.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

/* ===== 表格 ===== */
.flow-table {
  background: #fff;
  border-radius: 10px;
}
.cell-strong { font-weight: 600; color: #1a1a2e; }
.diff-pos { color: #67c23a; font-weight: 600; }
.diff-neg { color: #e53935; font-weight: 600; }

/* ===== 分页 ===== */
.flow-pagination {
  justify-content: flex-end;
  padding: 4px 0;
}

/* ===== 收紧 round 标签圆角，对齐其他视图 ===== */
:deep(.el-tag.is-round) {
  border-radius: 6px !important;
  padding: 0 8px !important;
  height: 22px;
  line-height: 20px;
}

@media (max-width: 1100px) {
  .metric-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
