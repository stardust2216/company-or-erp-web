<!--
  ============================================================================
  华维食品 · 销售合同明细
  ----------------------------------------------------------------------------
  对应业务原型：用户提供的 Excel 截图
  「硫磺、磷酸产品销售合同」三级分组汇总表。

  数据结构：
    集团 (groupName)
      └─ 片区 (region)
            └─ 糖厂 (factoryName)
                  └─ 合同 (seq / date / contractNo / deliveryMode / remark)
                        └─ 分项 (qty / unitPrice / amount)

  视觉规则（与截图完全一致）：
    · 合同分项行：白底；同一合同的多笔分项靠 spanMethod 合并序号/日期/
      合同号/送货方式/备注列。
    · 合同小计行（每个合同后跟一行）：浅蓝高亮。
    · 糖厂合计行（每个糖厂的末尾）：黄色高亮。
    · 集团总计行（每个集团的末尾）：紫色高亮。
    · 最末总合计行：绿色高亮。
    · 加权平均单价规则：subTotal/groupTotal/grandTotal 行的"单价"列展示
      金额 ÷ 数量；当数量为 0 时显示 #DIV/0!（与原型一致，业务方可识别）。

  本页定位为"汇总打印 + 对账核对"，编辑入口仍在「订单列表」抽屉里，
  保持唯一事实源。
  ============================================================================
-->
<template>
  <div class="sc-page">
    <!-- ====== Hero：品牌卡片 + 主操作按钮 ====== -->
    <header class="page-hero">
      <div class="hero-left">
        <div class="hero-badge">
          <el-icon :size="28"><Tickets /></el-icon>
        </div>
        <div class="hero-info">
          <h1 class="hero-title">华维食品 - 销售合同</h1>
          <p class="hero-subtitle">硫磺、磷酸销售合同明细 · 三级汇总（集团 / 片区 / 糖厂）</p>
        </div>
      </div>
      <div class="hero-actions">
        <!--
          导入 Excel（与订单列表 / 入出库明细相同的交互模式）：
            1) 主按钮点击 → 触发隐藏的 file input；
            2) 下拉项「选择文件导入」→ 同上；
            3) 下拉项「下载导入模板」→ 生成与导出列顺序一致的 CSV 空模板，
               业务方可先下模板再批量填表后导入。
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
        <!-- 隐藏的原生文件选择器；通过 ref 在 JS 里调用 click() 触发 -->
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
      <article class="metric-card metric-groups">
        <div class="m-label">集团数</div>
        <div class="m-value">{{ totals.groupCount }} <span class="m-unit">个</span></div>
        <div class="m-hint">参与统计的集团总数</div>
      </article>
      <article class="metric-card metric-factories">
        <div class="m-label">糖厂数</div>
        <div class="m-value">{{ totals.factoryCount }} <span class="m-unit">个</span></div>
        <div class="m-hint">当前筛选覆盖糖厂</div>
      </article>
      <article class="metric-card metric-qty">
        <div class="m-label">销售总量</div>
        <div class="m-value">{{ formatNum(totals.qty, 3) }} <span class="m-unit">吨</span></div>
        <div class="m-hint">合同累计签约量</div>
      </article>
      <article class="metric-card metric-amount">
        <div class="m-label">销售总额</div>
        <div class="m-value">{{ formatMoney(totals.amount) }} <span class="m-unit">元</span></div>
        <div class="m-hint">数量 × 单价合计</div>
      </article>
    </section>

    <!-- ====== 工具条 ====== -->
    <div class="sc-toolbar">
      <div class="sc-toolbar-left">
        <el-input
          v-model="filter.keyword"
          placeholder="搜索集团 / 片区 / 糖厂 / 合同号 / 备注"
          clearable
          :prefix-icon="Search"
          style="width: 280px"
        />
        <el-select
          v-model="filter.groupName"
          placeholder="全部集团"
          clearable
          style="width: 160px"
        >
          <el-option v-for="g in groupOptions" :key="g" :label="g" :value="g" />
        </el-select>
        <el-select
          v-model="filter.region"
          placeholder="全部片区"
          clearable
          style="width: 140px"
        >
          <el-option v-for="r in regionOptions" :key="r" :label="r" :value="r" />
        </el-select>
        <el-button :icon="RefreshRight" @click="resetFilter">重置</el-button>
      </div>
    </div>

    <!-- ========== 主表（限高 + 内置滚动） ========== -->
    <section class="sc-table-card">
      <el-table
        :data="flatRows"
        :span-method="spanMethod"
        :row-class-name="rowClassName"
        border
        size="default"
        header-cell-class-name="sc-th"
        cell-class-name="sc-td"
        max-height="560"
        style="width: 100%"
      >
        <el-table-column label="客户名称" align="center">
          <el-table-column prop="groupName" label="集团名称" width="120" align="center" />
          <el-table-column prop="region" label="片区" width="90" align="center" />
          <el-table-column prop="factoryName" label="糖厂名称" width="120" align="center" />
        </el-table-column>
        <el-table-column label="合同内容" align="center">
          <el-table-column prop="seqText" label="序号" width="72" align="center" />
          <el-table-column prop="date" label="日期" width="110" align="center" />
          <el-table-column prop="contractNo" label="合同编号" width="220" align="center" />
          <el-table-column label="数量(���)" width="100" align="right">
            <template #default="{ row }">{{ formatNum(row.qty, 3) }}</template>
          </el-table-column>
          <el-table-column label="单价(元/吨)" width="120" align="right">
            <template #default="{ row }">{{ formatPrice(row.unitPrice) }}</template>
          </el-table-column>
          <el-table-column label="合同金额" width="140" align="right">
            <template #default="{ row }">{{ formatMoney(row.amount) }}</template>
          </el-table-column>
          <el-table-column prop="deliveryMode" label="送货方式" width="100" align="center" />
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="160" align="left">
          <template #default="{ row }">
            <span class="sc-remark">{{ row.remark }}</span>
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

/** 行类型：合同分项 / 合同小计 / 糖厂合计 / 集团总计 / 总合计 */
type RowKind = 'item' | 'subTotal' | 'factoryTotal' | 'groupTotal' | 'grandTotal'

/**
 * 渲染用扁平行
 * ---------------------------------------------------------------
 * 表格里出现的每一行都映射成本结构；spanMethod 通过 __groupStart /
 * __regionStart / __factoryStart 三组标记决定纵向��并范围。
 */
interface Row {
  kind: RowKind
  groupName: string
  region: string
  factoryName: string
  /** 序号文本（小计/合计行没有数字，直接显示中文标签） */
  seqText: string
  date: string
  contractNo: string
  qty: number
  unitPrice: number
  amount: number
  deliveryMode: string
  remark: string
  /** 在所属集团里是否为首行（用于合并集团列） */
  __groupSpan: number
  __regionSpan: number
  __factorySpan: number
  __groupStart: boolean
  __regionStart: boolean
  __factoryStart: boolean
}

/** 种子里的合同分项 */
interface SeedItem {
  qty: number
  unitPrice: number
  amount: number
}
interface SeedContract {
  seq: number
  date: string
  contractNo: string
  deliveryMode: string
  remark: string
  items: SeedItem[]
}
interface SeedFactory {
  factoryName: string
  contracts: SeedContract[]
}
interface SeedRegion {
  region: string
  factories: SeedFactory[]
}
interface SeedGroup {
  groupName: string
  regions: SeedRegion[]
}

/**
 * 销售合同种子数据（按用户提供的截图 1:1 录入）
 * ---------------------------------------------------------------
 * 字段含义见 SeedContract / SeedItem。amount 直接录入，避免乘法
 * 浮点误差；最终展示按 amount 取真值，单价是显示用。
 */
// 使用 reactive 包裹种子数组，"导入 Excel" 后追加的集团 / 合同会触发
// flatRows 计算属性重新求值，无需手动刷新表格。
// 备注：reactive([...]) as SeedGroup[] 比 reactive<SeedGroup[]>([...]) 更兼容
// babel 的 TS 解析器（避免误把内嵌泛型 ">>" 当成 JSX）。
const seed = reactive([
  {
    groupName: '南华集团',
    regions: [
      {
        region: '广西',
        factories: [
          {
            factoryName: '田东一厂',
            contracts: [
              { seq: 1, date: '2025.10.24', contractNo: '代广25-26x251022-266招', deliveryMode: '送到', remark: '',
                items: [{ qty: 30, unitPrice: 6600, amount: 198000 }] },
              { seq: 2, date: '2026.2.12', contractNo: '代广25-26x260212-505招', deliveryMode: '送到', remark: '',
                items: [{ qty: 20, unitPrice: 6900, amount: 138000 }] },
              { seq: 3, date: '2026.3.31', contractNo: '代广25-26x260212-505招补', deliveryMode: '', remark: '',
                items: [{ qty: 4.58, unitPrice: 6900, amount: 31602 }] },
            ],
          },
          {
            factoryName: '田东二厂',
            contracts: [
              { seq: 1, date: '2025.10.24', contractNo: '代广25-26x251022-262招', deliveryMode: '送到', remark: '',
                items: [{ qty: 75, unitPrice: 6600, amount: 495000 }] },
            ],
          },
          {
            factoryName: '上林糖厂',
            contracts: [
              { seq: 1, date: '2025.10.24', contractNo: '代广25-26x251022-267招', deliveryMode: '送到', remark: '',
                items: [{ qty: 40, unitPrice: 6600, amount: 264000 }] },
              { seq: 2, date: '2026.2.12', contractNo: '代广25-26x260212-503招', deliveryMode: '送到', remark: '',
                items: [{ qty: 30, unitPrice: 6900, amount: 207000 }] },
              { seq: 3, date: '2026.4.21', contractNo: '代广25-26x260212-504招补', deliveryMode: '送到', remark: '',
                items: [{ qty: 2.86, unitPrice: 6900, amount: 19734 }] },
              { seq: 4, date: '2026.3.31', contractNo: '代广25-26x260331-581招', deliveryMode: '送到', remark: '',
                items: [{ qty: 30, unitPrice: 7480, amount: 224400 }] },
            ],
          },
          {
            factoryName: '忻城糖厂',
            contracts: [
              { seq: 1, date: '2025.10.24', contractNo: '代广25-26x251022-263招', deliveryMode: '送到', remark: '',
                items: [{ qty: 30, unitPrice: 6600, amount: 198000 }] },
              { seq: 2, date: '2025.12.22', contractNo: '代广25-26x251022-264招补', deliveryMode: '送到', remark: '',
                items: [{ qty: 20, unitPrice: 6600, amount: 132000 }] },
              { seq: 3, date: '2026.2.12', contractNo: '代广25-26x260212-504招', deliveryMode: '送到', remark: '',
                items: [{ qty: 50, unitPrice: 6900, amount: 345000 }] },
            ],
          },
          {
            factoryName: '南圩糖厂',
            contracts: [
              { seq: 1, date: '2025.10.24', contractNo: '代广25-26x251022-265招', deliveryMode: '送到', remark: '',
                items: [{ qty: 60, unitPrice: 6600, amount: 396000 }] },
              { seq: 2, date: '2026.2.12', contractNo: '代广25-26x260212-506招', deliveryMode: '送到', remark: '',
                items: [{ qty: 44.5, unitPrice: 6900, amount: 307050 }] },
            ],
          },
          {
            factoryName: '东门糖厂',
            contracts: [
              { seq: 1, date: '2026.4.14', contractNo: '代广25-26x260414-604', deliveryMode: '', remark: '',
                items: [{ qty: 32, unitPrice: 7480, amount: 239360 }] },
            ],
          },
        ],
      },
      {
        region: '海南',
        factories: [
          {
            factoryName: '昌江糖厂',
            contracts: [
              { seq: 1, date: '2025.10.24', contractNo: '代海25-26x251024-271招', deliveryMode: '送到', remark: '',
                items: [{ qty: 100, unitPrice: 7800, amount: 780000 }] },
              { seq: 2, date: '2026.4.22', contractNo: '代海25-26x260422-608', deliveryMode: '', remark: '',
                items: [{ qty: 13.155, unitPrice: 8800, amount: 115764 }] },
            ],
          },
          {
            factoryName: '儋州糖厂',
            contracts: [
              { seq: 1, date: '2025.10.24', contractNo: '代海25-26x251024-272招', deliveryMode: '送到', remark: '',
                items: [{ qty: 140, unitPrice: 7800, amount: 1092000 }] },
            ],
          },
        ],
      },
    ],
  },
  {
    groupName: '东糖集团',
    regions: [
      {
        region: '广西',
        factories: [
          {
            factoryName: '迁江糖厂',
            contracts: [
              { seq: 1, date: '2025.10.17', contractNo: 'DT20251010015（临）', deliveryMode: '送到', remark: '',
                items: [{ qty: 700, unitPrice: 6600, amount: 4620000 }] },
              { seq: 2, date: '2026.1.27', contractNo: 'CD2601276935', deliveryMode: '送到', remark: '',
                items: [{ qty: 230, unitPrice: 7380, amount: 1697400 }] },
            ],
          },
          {
            factoryName: '峦城糖厂',
            contracts: [
              { seq: 1, date: '2025.10.17', contractNo: 'DT20251010017（临）', deliveryMode: '送到', remark: '',
                items: [{ qty: 240, unitPrice: 6600, amount: 1584000 }] },
            ],
          },
          {
            factoryName: '石塘糖厂',
            contracts: [
              { seq: 1, date: '2025.10.17', contractNo: 'DT20251010018（临）', deliveryMode: '送到', remark: '',
                items: [{ qty: 100, unitPrice: 6600, amount: 660000 }] },
            ],
          },
          {
            factoryName: '桂宝糖厂',
            contracts: [
              { seq: 1, date: '2025.10.17', contractNo: 'DT20251010016（临）', deliveryMode: '送到', remark: '',
                items: [{ qty: 160, unitPrice: 6600, amount: 1056000 }] },
            ],
          },
          {
            factoryName: '天等糖厂',
            contracts: [
              { seq: 1, date: '2025.10.17', contractNo: 'DT20251010019（临）', deliveryMode: '送到', remark: '',
                items: [{ qty: 210, unitPrice: 6600, amount: 1386000 }] },
              { seq: 2, date: '2026.2.3', contractNo: 'CD2602036963', deliveryMode: '送到', remark: '',
                items: [{ qty: 18, unitPrice: 7380, amount: 132840 }] },
            ],
          },
        ],
      },
      {
        region: '云南',
        factories: [
          {
            factoryName: '石屏糖厂',
            contracts: [
              { seq: 1, date: '2025.10.17', contractNo: 'DT20251010020（临）', deliveryMode: '送到', remark: '',
                items: [{ qty: 40, unitPrice: 6800, amount: 272000 }] },
              { seq: 2, date: '2026.1.27', contractNo: 'DT20260128001', deliveryMode: '送到', remark: '',
                items: [{ qty: 3, unitPrice: 7580, amount: 22740 }] },
            ],
          },
          {
            factoryName: '石龙糖厂',
            contracts: [
              { seq: 1, date: '2026.1.27', contractNo: 'CD2601276938', deliveryMode: '送到', remark: '',
                items: [{ qty: 70, unitPrice: 7380, amount: 516600 }] },
            ],
          },
        ],
      },
    ],
  },
  {
    groupName: '广农集团',
    regions: [
      {
        region: '广西',
        factories: [
          {
            factoryName: '大桥糖厂',
            contracts: [
              { seq: 1, date: '2025.11.4', contractNo: 'DQYX（购）2025-128号', deliveryMode: '送到', remark: '',
                items: [
                  { qty: 118, unitPrice: 6680, amount: 788240 },
                  { qty: 0.8, unitPrice: 7280, amount: 5824 },
                ] },
            ],
          },
          {
            factoryName: '明阳糖厂',
            contracts: [
              { seq: 1, date: '2026.2.4', contractNo: 'MYZT2026125A0810', deliveryMode: '', remark: '',
                items: [{ qty: 390, unitPrice: 7220, amount: 2815800 }] },
            ],
          },
          {
            factoryName: '东江糖厂',
            contracts: [
              { seq: 1, date: '2026.2.2', contractNo: '东江G-2026-09', deliveryMode: '', remark: '',
                items: [{ qty: 245, unitPrice: 7220, amount: 1768900 }] },
              { seq: 2, date: '2026.4.8', contractNo: '东江G-2026-19', deliveryMode: '', remark: '',
                items: [{ qty: 93, unitPrice: 7220, amount: 671460 }] },
            ],
          },
          {
            factoryName: '香山糖厂',
            contracts: [
              { seq: 1, date: '2025.11.11', contractNo: 'XS-G-(采购）-2025-071', deliveryMode: '', remark: '',
                items: [
                  { qty: 220.5, unitPrice: 6680, amount: 1472940 },
                  { qty: 4, unitPrice: 7280, amount: 29120 },
                ] },
              { seq: 2, date: '2026.1.13', contractNo: 'XS-G-(采购）-2026-008', deliveryMode: '', remark: '',
                items: [{ qty: 108, unitPrice: 7320, amount: 790560 }] },
            ],
          },
        ],
      },
    ],
  },
  {
    groupName: '中粮集团',
    regions: [
      {
        region: '广西',
        factories: [
          {
            factoryName: '崇左江州',
            contracts: [
              { seq: 1, date: '2025.11.10', contractNo: 'CTJZ-SC-FL-2025-11-006', deliveryMode: '', remark: '24-25用量为350吨',
                items: [{ qty: 0, unitPrice: 7660, amount: 7660 }] },
            ],
          },
          {
            factoryName: '崇左糖厂',
            contracts: [
              { seq: 1, date: '2025.11.10', contractNo: 'CSCZ-SC-CG-2025-11-003', deliveryMode: '', remark: '24-25用量为350吨',
                items: [{ qty: 0, unitPrice: 7660, amount: 7660 }] },
            ],
          },
          {
            factoryName: '北海糖厂',
            contracts: [
              { seq: 1, date: '2025.11.18', contractNo: 'CTBH-SC-FL-2025-11-01', deliveryMode: '', remark: '24-25用量为220吨',
                items: [{ qty: 0, unitPrice: 7660, amount: 7660 }] },
            ],
          },
        ],
      },
      {
        region: '云南',
        factories: [
          {
            factoryName: '梁河糖厂',
            contracts: [
              { seq: 1, date: '2025.11.19', contractNo: 'CSLH-JCSC-SPZJ-2025-03', deliveryMode: '', remark: '24-25用量为120吨',
                items: [{ qty: 0, unitPrice: 8160, amount: 8160 }] },
            ],
          },
        ],
      },
      {
        region: '广东',
        factories: [
          {
            factoryName: '粤北糖厂',
            contracts: [
              { seq: 1, date: '2025.11.24', contractNo: 'CTYB-SC-JC-2025-11-06', deliveryMode: '', remark: '24-25用量为15吨',
                items: [{ qty: 0, unitPrice: 7660, amount: 7660 }] },
            ],
          },
        ],
      },
    ],
  },
  {
    groupName: '合山祥星糖厂',
    regions: [{ region: '广西', factories: [{
      factoryName: '合山祥星糖厂',
      contracts: [
        { seq: 1, date: '2025.10.31', contractNo: '20251031', deliveryMode: '送到', remark: '',
          items: [{ qty: 200, unitPrice: 8100, amount: 1620000 }] },
      ],
    }] }],
  },
  {
    groupName: '初莱公司',
    regions: [{ region: '广西', factories: [{
      factoryName: '初莱公司',
      contracts: [
        { seq: 1, date: '2025.12.30', contractNo: '2025123001', deliveryMode: '送到', remark: '',
          items: [{ qty: 15, unitPrice: 7500, amount: 112500 }] },
        { seq: 2, date: '', contractNo: '口头', deliveryMode: '', remark: '',
          items: [{ qty: 29.44, unitPrice: 7500, amount: 220800 }] },
      ],
    }] }],
  },
  {
    groupName: '茂都公司',
    regions: [{ region: '广西', factories: [{
      factoryName: '茂都公司',
      contracts: [
        { seq: 1, date: '2026.5.7', contractNo: '20260507-1', deliveryMode: '自提', remark: '',
          items: [{ qty: 65, unitPrice: 7800, amount: 507000 }] },
      ],
    }] }],
  },
]) as SeedGroup[]

/** 筛选项 */
const filter = reactive({
  keyword: '' as string,
  groupName: '' as string,
  region: '' as string,
})

function resetFilter() {
  filter.keyword = ''
  filter.groupName = ''
  filter.region = ''
}

/** 下拉候选 */
const groupOptions = computed(() => seed.map((g) => g.groupName))
const regionOptions = computed(() => {
  const set = new Set<string>()
  seed.forEach((g) => g.regions.forEach((r) => set.add(r.region)))
  return Array.from(set)
})

/** 行号自增器 */
function emptyRow(kind: RowKind, partial: Partial<Row>): Row {
  return {
    kind,
    groupName: '',
    region: '',
    factoryName: '',
    seqText: '',
    date: '',
    contractNo: '',
    qty: 0,
    unitPrice: 0,
    amount: 0,
    deliveryMode: '',
    remark: '',
    __groupSpan: 0,
    __regionSpan: 0,
    __factorySpan: 0,
    __groupStart: false,
    __regionStart: false,
    __factoryStart: false,
    ...partial,
  }
}

/**
 * 应用筛选 → 计算扁平行 + 各级合并 span
 * ---------------------------------------------------------------
 * 步骤：
 *   1) 先按 groupName / region / keyword 三个维度过滤掉整棵子树；
 *   2) 自上而下展开每个糖厂的合同/分项；
 *   3) 在每个合同后注入"小计"行；
 *   4) 每个糖厂末尾注入"合计"行（黄色）；
 *   5) 每个集团末尾注入"总计"行（紫色）；
 *   6) 全表末尾注入"总合计"行（绿色）；
 *   7) 回填 __groupSpan / __regionSpan / __factorySpan 以驱动 spanMethod。
 */
const flatRows = computed<Row[]>(() => {
  const kw = filter.keyword.trim().toLowerCase()
  const rows: Row[] = []
  let grand = { qty: 0, amount: 0 }

  for (const g of seed) {
    if (filter.groupName && g.groupName !== filter.groupName) continue

    const groupRowsStart = rows.length
    let groupAgg = { qty: 0, amount: 0, factories: 0 }

    for (const r of g.regions) {
      if (filter.region && r.region !== filter.region) continue

      for (const f of r.factories) {
        // 关键字筛选：糖厂内任一合同号 / 备注 / 糖厂名命中即保留
        if (kw) {
          const hit = [
            g.groupName, r.region, f.factoryName,
            ...f.contracts.flatMap((c) => [c.contractNo, c.remark]),
          ].some((s) => s.toLowerCase().includes(kw))
          if (!hit) continue
        }

        const factoryRowsStart = rows.length
        let factoryAgg = { qty: 0, amount: 0 }

        for (const c of f.contracts) {
          for (const it of c.items) {
            rows.push(emptyRow('item', {
              groupName: g.groupName, region: r.region, factoryName: f.factoryName,
              seqText: String(c.seq), date: c.date, contractNo: c.contractNo,
              qty: it.qty, unitPrice: it.unitPrice, amount: it.amount,
              deliveryMode: c.deliveryMode, remark: c.remark,
            }))
          }
          // 合同小计行
          const subQty = c.items.reduce((s, x) => s + x.qty, 0)
          const subAmount = c.items.reduce((s, x) => s + x.amount, 0)
          rows.push(emptyRow('subTotal', {
            groupName: g.groupName, region: r.region, factoryName: f.factoryName,
            seqText: '小计', contractNo: c.contractNo,
            qty: subQty,
            unitPrice: subQty > 0 ? subAmount / subQty : NaN,
            amount: subAmount,
            deliveryMode: c.deliveryMode, remark: c.remark,
          }))
          factoryAgg.qty += subQty
          factoryAgg.amount += subAmount
        }

        // 糖厂合计行
        rows.push(emptyRow('factoryTotal', {
          groupName: g.groupName, region: r.region, factoryName: f.factoryName,
          seqText: '合计',
          qty: factoryAgg.qty,
          unitPrice: factoryAgg.qty > 0 ? factoryAgg.amount / factoryAgg.qty : NaN,
          amount: factoryAgg.amount,
        }))

        // 回填工厂 span
        const factorySpan = rows.length - factoryRowsStart
        rows[factoryRowsStart].__factoryStart = true
        rows[factoryRowsStart].__factorySpan = factorySpan

        groupAgg.qty += factoryAgg.qty
        groupAgg.amount += factoryAgg.amount
        groupAgg.factories += 1
      }
    }

    // 该集团本次筛选没有任何糖厂留下 → 跳过总计行
    if (groupAgg.factories === 0) continue

    // 集团总计行
    rows.push(emptyRow('groupTotal', {
      groupName: g.groupName,
      seqText: '总计',
      qty: groupAgg.qty,
      unitPrice: groupAgg.qty > 0 ? groupAgg.amount / groupAgg.qty : NaN,
      amount: groupAgg.amount,
    }))

    // 回填集团 span
    const groupSpan = rows.length - groupRowsStart
    rows[groupRowsStart].__groupStart = true
    rows[groupRowsStart].__groupSpan = groupSpan

    grand.qty += groupAgg.qty
    grand.amount += groupAgg.amount
  }

  // 总合计
  if (rows.length > 0) {
    rows.push(emptyRow('grandTotal', {
      groupName: '', seqText: '总合计',
      qty: grand.qty,
      unitPrice: grand.qty > 0 ? grand.amount / grand.qty : NaN,
      amount: grand.amount,
    }))
  }

  // region 列的合并：相邻同片区行合并；regionStart 第一行承担 regionSpan
  // 这里基于已经构建好的 rows 二次扫描，识别每段 (groupName + region) 的边界
  let regionStart = -1
  let regionKey = ''
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    if (row.kind === 'groupTotal' || row.kind === 'grandTotal') {
      // 关闭上一个 region 段
      if (regionStart >= 0) {
        rows[regionStart].__regionStart = true
        rows[regionStart].__regionSpan = i - regionStart
      }
      regionStart = -1
      regionKey = ''
      continue
    }
    const key = `${row.groupName}|${row.region}`
    if (key !== regionKey) {
      if (regionStart >= 0) {
        rows[regionStart].__regionStart = true
        rows[regionStart].__regionSpan = i - regionStart
      }
      regionStart = i
      regionKey = key
    }
  }
  // 收尾（如果以普通行结束）
  if (regionStart >= 0) {
    rows[regionStart].__regionStart = true
    rows[regionStart].__regionSpan = rows.length - regionStart
  }

  return rows
})

/** Hero 统计 */
const totals = computed(() => {
  const grand = flatRows.value.find((r) => r.kind === 'grandTotal')
  const factoryCount = flatRows.value.filter((r) => r.kind === 'factoryTotal').length
  const groupCount = flatRows.value.filter((r) => r.kind === 'groupTotal').length
  return {
    qty: grand?.qty ?? 0,
    amount: grand?.amount ?? 0,
    factoryCount,
    groupCount,
  }
})

/** 行级样式：依据 kind 给底色 */
function rowClassName({ row }: { row: Row }) {
  return `sc-row-${row.kind}`
}

/**
 * 合并单元格规则
 *  · 0 集团名称：仅在 __groupStart 行 rowspan=__groupSpan；
 *  · 1 片区：仅在 __regionStart 行 rowspan=__regionSpan；
 *  · 2 糖厂：仅在 __factoryStart 行 rowspan=__factorySpan；
 *  · "总合计"行整行合并到底部（除"备注"列），把数字往左挤齐；这里
 *    为了保持表头列宽不动，仅对前三列合并、其余列保持本格。
 */
function spanMethod({
  row,
  columnIndex,
}: {
  row: Row
  columnIndex: number
}): [number, number] {
  if (row.kind === 'grandTotal') {
    // 总合计：把前 3 列合并成一个"总合计"标签格
    if (columnIndex === 0) return [1, 3]
    if (columnIndex === 1 || columnIndex === 2) return [0, 0]
    return [1, 1]
  }
  if (row.kind === 'groupTotal') {
    // 集团总计：region / factory 列并入 group 名所在格
    if (columnIndex === 0) return [1, 3]
    if (columnIndex === 1 || columnIndex === 2) return [0, 0]
    return [1, 1]
  }
  if (row.kind === 'factoryTotal') {
    // 糖厂合计：合并 region / factory 不动，因为它们正常承担 span
    if (columnIndex === 0) return row.__groupStart ? [row.__groupSpan, 1] : [0, 1]
    if (columnIndex === 1) return row.__regionStart ? [row.__regionSpan, 1] : [0, 1]
    if (columnIndex === 2) return row.__factoryStart ? [row.__factorySpan, 1] : [0, 1]
    return [1, 1]
  }
  // item / subTotal：按 group / region / factory 的 start 标志合并
  if (columnIndex === 0) return row.__groupStart ? [row.__groupSpan, 1] : [0, 1]
  if (columnIndex === 1) return row.__regionStart ? [row.__regionSpan, 1] : [0, 1]
  if (columnIndex === 2) return row.__factoryStart ? [row.__factorySpan, 1] : [0, 1]
  return [1, 1]
}

/** ===== 工具方法 ===== */
function formatNum(n: number | null | undefined, digits = 2) {
  if (n === null || n === undefined || Number.isNaN(n)) return ''
  return n.toLocaleString('zh-CN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}
function formatPrice(n: number) {
  if (!Number.isFinite(n)) return '#DIV/0!'
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function formatMoney(n: number) {
  if (!Number.isFinite(n)) return ''
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/** 简版导出（CSV） */
function exportExcel() {
  const headers = ['集团名称', '片区', '糖厂名称', '序号', '日期', '合同编号', '数量(吨)', '单价(元/吨)', '合同金额', '送货方式', '备注']
  const lines = [headers.join(',')]
  flatRows.value.forEach((r) => {
    lines.push([
      r.groupName,
      r.region,
      r.factoryName,
      r.seqText,
      r.date,
      r.contractNo,
      Number.isFinite(r.qty) ? r.qty : '',
      Number.isFinite(r.unitPrice) ? r.unitPrice.toFixed(2) : '',
      Number.isFinite(r.amount) ? r.amount.toFixed(2) : '',
      r.deliveryMode,
      `"${r.remark}"`,
    ].join(','))
  })
  const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `硫磺、磷酸销售合同_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('已导出当前筛选下的销售合同明细')
}

/* =========================================================================
   导入 Excel（轻量 CSV 导入）
   -------------------------------------------------------------------------
   设计目标：与 exportExcel 完全对称，使业务方"导出 → 编辑 → 再导入"形成闭环。
   - 不引入额外依赖：仅支持 UTF-8 BOM 的 CSV（导出文件即可直接二次导入）；
   - 列顺序必须与 exportExcel 一致：集团 / 片区 / 糖厂 / 序号 / 日期 /
     合同号 / 数量 / 单价 / 金额 / 送货方式 / 备注；
   - 合同号相同的行会被合并为同一份合同的多笔分项，与种子结构对齐；
   - 解析失败 / 列数不足 / 数字非法时给出明确错误提示，保留原数据不变。
   ========================================================================= */

/** 隐藏 <input type="file"> 的引用，由"导入 Excel"按钮触发 click */
const importInputRef = ref<HTMLInputElement | null>(null)

/**
 * 下载导入模板（CSV）
 * ---------------------------------------------------------------
 * 列顺序与 exportExcel 完全一致，业务方下载后填写即可一键导入。
 * 采用 UTF-8 BOM 前缀，确保 WPS / Excel 打开不出现中文乱码。
 */
function downloadImportTemplate() {
  const header = [
    '集团', '片区', '糖厂', '序号', '日期',
    '合同号', '数量', '单价', '金额', '送货方式', '备注',
  ]
  // 给一行示例数据，让用户对照列含义
  const sample = ['示例集团', '广西', '示例糖厂', '1', '2026.01.01',
    'SC-20260101-001', '20', '6900', '138000', '送到', '示例备注']
  const csv = '\uFEFF' + [header.join(','), sample.join(',')].join('\r\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = '销售合同导入模板.csv'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  ElMessage.success('已生成销售合同导入模板，请按列顺序填写后再导入')
}

/** 点击"导入 Excel"按钮 */
function onImportClick() {
  if (!importInputRef.value) return
  // 每次重置 value 以允许重复选择同一个文件
  importInputRef.value.value = ''
  importInputRef.value.click()
}

/**
 * 解析单行 CSV，简化版：仅支持双引号包裹的字段内逗号转义
 * @param line 原始 CSV 行
 * @returns    切分后的字段数组
 */
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
 * 处理文件选择回调：读取 CSV → 解析 → 合并到 seed
 */
async function handleImportFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  try {
    const text = await file.text()
    // 去 BOM
    const raw = text.replace(/^\uFEFF/, '')
    const lines = raw.split(/\r?\n/).filter((l) => l.trim())
    if (lines.length < 2) {
      ElMessage.warning('文件内容为空或缺少数据行')
      return
    }
    // 跳过表头
    const dataRows = lines.slice(1)
    let imported = 0

    for (const line of dataRows) {
      const cells = parseCsvLine(line)
      if (cells.length < 11) continue
      const [groupName, region, factoryName, seqText, date, contractNo,
             qtyStr, priceStr, amountStr, deliveryMode, remark] = cells
      if (!groupName || !contractNo) continue

      const qty = Number(qtyStr) || 0
      const unitPrice = Number(priceStr) || 0
      const amount = Number(amountStr) || qty * unitPrice
      const seq = Number(seqText) || 1

      // 三级定位：集团 → 片区 → 糖厂；不存在则按序追加
      let g = seed.find((x) => x.groupName === groupName)
      if (!g) { g = { groupName, regions: [] }; seed.push(g) }
      let r = g.regions.find((x) => x.region === region)
      if (!r) { r = { region: region || '默认片区', factories: [] }; g.regions.push(r) }
      let f = r.factories.find((x) => x.factoryName === factoryName)
      if (!f) { f = { factoryName: factoryName || '默认糖厂', contracts: [] }; r.factories.push(f) }

      // 同合同号合并：分项追加；新合同号则新建一份
      let c = f.contracts.find((x) => x.contractNo === contractNo)
      if (!c) {
        c = { seq, date, contractNo, deliveryMode, remark, items: [] }
        f.contracts.push(c)
      }
      c.items.push({ qty, unitPrice, amount })
      imported++
    }

    if (imported === 0) {
      ElMessage.warning('未解析到有效数据行，请确认列顺序与模板一致')
    } else {
      ElMessage.success(`已导入 ${imported} 条销售合同分项`)
    }
  } catch (err) {
    console.error('[SalesContracts] import failed:', err)
    ElMessage.error('导入失败：文件格式不正确或无法读取')
  } finally {
    input.value = ''
  }
}
</script>

<style lang="scss" scoped>
/*
 * 视觉规范与 OrderList / InventoryFlow / PurchaseContracts 对齐：
 *   · 顶部 Hero 品牌卡（与订单列表完全一致）+ 4 张 stat-card 统计卡
 *     （与入出库明细完全一致），承担"集团数 / 糖厂数 / 销售总量 /
 *     销售总额"等汇总信息；
 *   · 表内分级配色（小计 / 合计 / 总计 / 总合计）完整保留，
 *     见 .sc-row-* 规则；
 *   · 表格通过 max-height 控制内置滚动，避免页面整体撑高。
 */
.sc-page {
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
.metric-groups::before    { background: #67c23a; }
.metric-factories::before { background: #2f6df6; }
.metric-qty::before       { background: #e6a23c; }
.metric-amount::before    { background: #9b59b6; }
.m-label { font-size: 13px; color: #606266; }
.m-value { font-size: 22px; font-weight: 700; color: #1a1a2e; line-height: 1.2; }
.m-unit  { font-size: 13px; font-weight: 400; color: #909399; margin-left: 4px; }
.m-hint  { font-size: 12px; color: #909399; }

@media (max-width: 1100px) {
  .metric-grid { grid-template-columns: repeat(2, 1fr); }
}

/* ===== 工具条 ===== */
.sc-toolbar {
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
.sc-toolbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

/* ===== 主表 ===== */
.sc-table-card {
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
}
:deep(.sc-th) {
  background: #f0f4ff !important;
  color: #1f2937 !important;
  font-weight: 600 !important;
  text-align: center !important;
}
:deep(.sc-td) { vertical-align: middle !important; }

/* 行类型着色（按原型截图配色）
 *   · 合同分项：白
 *   · 小计：浅蓝
 *   · 糖厂合计：黄
 *   · 集团总计：紫
 *   · 总合计：绿
 * 用 :deep 是因为 row-class-name 注入到 tr 上，单元格 td 是子选择器。
 */
:deep(.sc-row-subTotal > td) {
  background: #d6eaff !important;
  color: #1f3a8a !important;
}
:deep(.sc-row-factoryTotal > td) {
  background: #fff7c2 !important;
  color: #92400e !important;
  font-weight: 600 !important;
}
:deep(.sc-row-groupTotal > td) {
  background: #e9d8fd !important;
  color: #5b21b6 !important;
  font-weight: 700 !important;
}
:deep(.sc-row-grandTotal > td) {
  background: #c7f0a3 !important;
  color: #1f2937 !important;
  font-weight: 700 !important;
  font-size: 15px !important;
}
.sc-remark {
  display: inline-block; line-height: 1.5; white-space: normal; word-break: break-all;
}
</style>
