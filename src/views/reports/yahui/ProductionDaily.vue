<template>
  <div class="production-daily-page">
    <!-- 页头 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <span class="header-icon-text">亚</span>
        </div>
        <div class="header-text">
          <h1 class="header-title">亚辉塑业 - 生产日报</h1>
          <p class="header-subtitle">8大工序产量日报</p>
        </div>
      </div>
      <div class="header-right">
        <el-date-picker
          v-model="selectedDate"
          type="date"
          placeholder="选择日期筛选"
          value-format="YYYY-MM-DD"
          size="small"
          clearable
          style="width: 180px"
        />
      </div>
    </div>

    <!-- 报表卡片 -->
    <div class="report-card">
      <el-tabs v-model="activeTab" class="report-tabs" @tab-change="onTabChange">
        <!-- ========================= Tab 1: 拉丝产量 ========================= -->
        <el-tab-pane label="拉丝产量日报表" name="lasi">
          <div class="table-wrapper">
            <el-table
              :data="lasiPageData"
              :max-height="700"
              border
              stripe
              style="width: 100%"
              :header-cell-style="headerCellStyle"
              size="small"
              highlight-current-row
            >
              <el-table-column prop="date" label="日期" width="100" align="center" fixed="left" />
              <el-table-column prop="shift" label="班次" width="70" align="center" />
              <el-table-column prop="machineNo" label="机台编号" width="100" align="center" />
              <el-table-column prop="leaderName" label="班长姓名" width="90" align="center" />
              <el-table-column prop="productName" label="产品名称" width="110" align="center" />
              <el-table-column prop="lineWidth" label="线宽(mm)" width="90" align="center" />
              <el-table-column prop="gramWeight" label="平方克重(g/㎡)" width="120" align="center" />
              <el-table-column prop="tensileForce" label="单丝拉力(牛)" width="105" align="center" />
              <el-table-column prop="color" label="颜色" width="80" align="center" />
              <el-table-column prop="granuleBag" label="粒料(包)" width="85" align="center" />
              <el-table-column prop="powderBag" label="粉料(包)" width="85" align="center" />
              <el-table-column prop="gradeBag" label="一级吨袋料(包)" width="120" align="center" />
              <el-table-column prop="masterBatch" label="母料(包)" width="85" align="center" />
              <el-table-column prop="greenBag" label="绿料(包)" width="85" align="center" />
              <el-table-column prop="yellowBag" label="黄料(包)" width="85" align="center" />
            </el-table>
          </div>
          <div class="card-footer">
            <el-pagination
              v-model:current-page="pageStates.lasi.current"
              v-model:page-size="pageStates.lasi.size"
              :page-sizes="[10, 20, 50]"
              :total="lasiFiltered.length"
              layout="total, sizes, prev, pager, next, jumper"
              background
              small
            />
          </div>
        </el-tab-pane>

        <!-- ========================= Tab 2: 圆织产量 ========================= -->
        <el-tab-pane label="圆织产量日报表" name="yuanzhi">
          <div class="table-wrapper">
            <el-table
              :data="yuanzhiPageData"
              :max-height="700"
              border
              stripe
              style="width: 100%"
              :header-cell-style="headerCellStyle"
              size="small"
              highlight-current-row
            >
              <el-table-column prop="date" label="日期" width="100" align="center" fixed="left" />
              <el-table-column prop="shift" label="班次" width="70" align="center" />
              <el-table-column prop="machineNo" label="机台号" width="90" align="center" />
              <el-table-column prop="leaderName" label="班长姓名" width="90" align="center" />
              <el-table-column prop="width" label="宽(cm)" width="80" align="center" />
              <el-table-column prop="gramWeight" label="平方克重(g/㎡)" width="120" align="center" />
              <el-table-column prop="color" label="颜色" width="80" align="center" />
              <el-table-column prop="unitPrice" label="工价(元/m)" width="100" align="center" />
              <el-table-column prop="machineRevolutions" label="机台表数(转)" width="115" align="center" />
              <el-table-column prop="foldMeters" label="折米数(m)" width="100" align="center" />
              <el-table-column prop="clothRevolutions" label="布筒转数(转)" width="115" align="center" />
              <el-table-column prop="clothLength" label="布筒长度(m)" width="105" align="center" />
              <el-table-column prop="theoreticalWeight" label="理论重量(kg)" width="115" align="center" />
              <el-table-column prop="actualWeight" label="过磅实际重量(kg)" width="140" align="center" />
              <el-table-column prop="deviation" label="偏差(±kg)" width="100" align="center" />
            </el-table>
          </div>
          <div class="card-footer">
            <el-pagination
              v-model:current-page="pageStates.yuanzhi.current"
              v-model:page-size="pageStates.yuanzhi.size"
              :page-sizes="[10, 20, 50]"
              :total="yuanzhiFiltered.length"
              layout="total, sizes, prev, pager, next, jumper"
              background
              small
            />
          </div>
        </el-tab-pane>

        <!-- ========================= Tab 3: 普印产量 ========================= -->
        <el-tab-pane label="普印产量日报表" name="puyin">
          <div class="table-wrapper">
            <el-table
              :data="puyinPageData"
              :max-height="700"
              border
              stripe
              style="width: 100%"
              :header-cell-style="headerCellStyle"
              size="small"
              highlight-current-row
            >
              <el-table-column prop="date" label="日期" width="100" align="center" fixed="left" />
              <el-table-column prop="shift" label="班次" width="70" align="center" />
              <el-table-column prop="machineNo" label="机台编号" width="100" align="center" />
              <el-table-column prop="operator" label="操作工" width="90" align="center" />
              <el-table-column prop="seq" label="序号" width="65" align="center" />
              <el-table-column prop="name" label="名称" width="150" align="center" show-overflow-tooltip />
              <el-table-column prop="singleSide" label="单面" width="70" align="center" />
              <el-table-column prop="doubleSide" label="双面" width="70" align="center" />
              <el-table-column prop="qualified" label="合格产品(条)" width="115" align="center" />
              <el-table-column prop="unqualified" label="不合格产品(条)" width="125" align="center" />
              <el-table-column prop="unitPrice" label="单价(元/条)" width="100" align="center" />
            </el-table>
          </div>
          <div class="card-footer">
            <el-pagination
              v-model:current-page="pageStates.puyin.current"
              v-model:page-size="pageStates.puyin.size"
              :page-sizes="[10, 20, 50]"
              :total="puyinFiltered.length"
              layout="total, sizes, prev, pager, next, jumper"
              background
              small
            />
          </div>
        </el-tab-pane>

        <!-- ========================= Tab 4: 彩印产量 ========================= -->
        <el-tab-pane label="彩印产量日报表" name="caiyin">
          <div class="table-wrapper">
            <el-table
              :data="caiyinPageData"
              :max-height="700"
              border
              stripe
              style="width: 100%"
              :header-cell-style="headerCellStyle"
              size="small"
              highlight-current-row
            >
              <el-table-column prop="date" label="日期" width="100" align="center" fixed="left" />
              <el-table-column prop="shift" label="班次" width="70" align="center" />
              <el-table-column prop="machineNo" label="机台编号" width="100" align="center" />
              <el-table-column prop="operator" label="操作工" width="90" align="center" />
              <el-table-column prop="seq" label="序号" width="65" align="center" />
              <el-table-column prop="name" label="名称" width="120" align="center" show-overflow-tooltip />
              <el-table-column prop="opp" label="OPP" width="70" align="center" />
              <el-table-column prop="yaMo" label="哑膜" width="70" align="center" />
              <el-table-column prop="zhuGuangMo" label="珠光膜" width="80" align="center" />
              <el-table-column prop="size" label="宽*厚(mm)" width="100" align="center" />
              <el-table-column prop="singleSide" label="单面" width="70" align="center" />
              <el-table-column prop="doubleSide" label="双面" width="70" align="center" />
              <el-table-column prop="gaiGuang" label="盖光" width="70" align="center" />
              <el-table-column prop="zheBian" label="折边" width="70" align="center" />
              <el-table-column prop="daMa" label="打码" width="70" align="center" />
              <el-table-column prop="unitPrice" label="工价(元/m)" width="100" align="center" />
              <el-table-column prop="orderQty" label="派单数量" width="90" align="center" />
              <el-table-column prop="unit" label="单位" width="65" align="center" />
              <el-table-column prop="qualified" label="合格产品(m)" width="110" align="center" />
              <el-table-column prop="unqualified" label="不合格产品(m)" width="120" align="center" />
            </el-table>
          </div>
          <div class="card-footer">
            <el-pagination
              v-model:current-page="pageStates.caiyin.current"
              v-model:page-size="pageStates.caiyin.size"
              :page-sizes="[10, 20, 50]"
              :total="caiyinFiltered.length"
              layout="total, sizes, prev, pager, next, jumper"
              background
              small
            />
          </div>
        </el-tab-pane>

        <!-- ========================= Tab 5: 涂膜产量 ========================= -->
        <el-tab-pane label="涂膜产量日报表" name="tumo">
          <div class="table-wrapper">
            <el-table
              :data="tumoPageData"
              :max-height="700"
              border
              stripe
              style="width: 100%"
              :header-cell-style="headerCellStyle"
              size="small"
              highlight-current-row
            >
              <el-table-column prop="date" label="日期" width="100" align="center" fixed="left" />
              <el-table-column prop="shift" label="班次" width="70" align="center" />
              <el-table-column prop="machineNo" label="机台编号" width="100" align="center" />
              <el-table-column prop="operator" label="操作工" width="90" align="center" />
              <el-table-column prop="customerName" label="客户名称" width="110" align="center" show-overflow-tooltip />
              <el-table-column prop="productName" label="产品名称" width="120" align="center" show-overflow-tooltip />
              <el-table-column prop="caiYinLiao" label="彩印料(包)" width="95" align="center" />
              <el-table-column prop="erFuLiao" label="二复料(包)" width="95" align="center" />
              <el-table-column prop="gao1C7A" label="高1C7A(包)" width="105" align="center" />
              <el-table-column prop="whiteMaster" label="白色母(包)" width="95" align="center" />
              <el-table-column prop="selfMade" label="自打料(包)" width="95" align="center" />
              <el-table-column prop="ifGaiGuang" label="是否盖光" width="90" align="center" />
              <el-table-column prop="coatingGram" label="涂的克重(克/平方)" width="135" align="center" />
              <el-table-column prop="qualified" label="合格产品(m)" width="110" align="center" />
            </el-table>
          </div>
          <div class="card-footer">
            <el-pagination
              v-model:current-page="pageStates.tumo.current"
              v-model:page-size="pageStates.tumo.size"
              :page-sizes="[10, 20, 50]"
              :total="tumoFiltered.length"
              layout="total, sizes, prev, pager, next, jumper"
              background
              small
            />
          </div>
        </el-tab-pane>

        <!-- ========================= Tab 6: 吹膜产量 ========================= -->
        <el-tab-pane label="吹膜产量日报表" name="chuimo">
          <div class="table-wrapper">
            <el-table
              :data="chuimoPageData"
              :max-height="700"
              border
              stripe
              style="width: 100%"
              :header-cell-style="headerCellStyle"
              size="small"
              highlight-current-row
            >
              <el-table-column prop="date" label="日期" width="100" align="center" fixed="left" />
              <el-table-column prop="shift" label="班次" width="70" align="center" />
              <el-table-column prop="machineNo" label="机台编号" width="100" align="center" />
              <el-table-column prop="operator" label="操作工" width="90" align="center" />
              <el-table-column prop="productName" label="产品名称" width="120" align="center" show-overflow-tooltip />
              <el-table-column prop="size" label="宽*长(mm)" width="100" align="center" />
              <el-table-column prop="weight" label="重量(g)" width="80" align="center" />
              <el-table-column prop="pressureLevel" label="高低压(高/低)" width="120" align="center" />
              <el-table-column prop="qualified" label="合格产品(kg)" width="115" align="center" />
              <el-table-column prop="rolls" label="卷数" width="65" align="center" />
              <el-table-column prop="selfCheckGram" label="自检每套克重(g/套)" width="145" align="center" />
              <el-table-column prop="unqualified" label="不合格产品(kg)" width="125" align="center" />
            </el-table>
          </div>
          <div class="card-footer">
            <el-pagination
              v-model:current-page="pageStates.chuimo.current"
              v-model:page-size="pageStates.chuimo.size"
              :page-sizes="[10, 20, 50]"
              :total="chuimoFiltered.length"
              layout="total, sizes, prev, pager, next, jumper"
              background
              small
            />
          </div>
        </el-tab-pane>

        <!-- ========================= Tab 7: 一体机产量 ========================= -->
        <el-tab-pane label="一体机产量日报表" name="yitiji">
          <div class="table-wrapper">
            <el-table
              :data="yitijiPageData"
              :max-height="700"
              border
              stripe
              style="width: 100%"
              :header-cell-style="headerCellStyle"
              size="small"
              highlight-current-row
            >
              <el-table-column prop="date" label="日期" width="100" align="center" fixed="left" />
              <el-table-column prop="shift" label="班次" width="70" align="center" />
              <el-table-column prop="name" label="姓名" width="80" align="center" />
              <el-table-column prop="machineNo" label="机台编号" width="100" align="center" />
              <el-table-column prop="customerName" label="客户名称" width="110" align="center" show-overflow-tooltip />
              <el-table-column prop="productName" label="产品名称" width="120" align="center" show-overflow-tooltip />
              <el-table-column prop="qieTao" label="切套" width="65" align="center" />
              <el-table-column prop="quanKou" label="圈口" width="65" align="center" />
              <el-table-column prop="danQie" label="单切" width="65" align="center" />
              <el-table-column prop="faKou" label="阀口" width="65" align="center" />
              <el-table-column prop="wasteBags" label="废袋(套)" width="85" align="center" />
              <el-table-column prop="reworkBags" label="返工袋(套)" width="95" align="center" />
              <el-table-column prop="qualified" label="合格产品(套)" width="115" align="center" />
              <el-table-column prop="unitPrice" label="单价(元/套)" width="100" align="center" />
              <el-table-column prop="laborCost" label="人工费(元)" width="100" align="center" />
            </el-table>
          </div>
          <div class="card-footer">
            <el-pagination
              v-model:current-page="pageStates.yitiji.current"
              v-model:page-size="pageStates.yitiji.size"
              :page-sizes="[10, 20, 50]"
              :total="yitijiFiltered.length"
              layout="total, sizes, prev, pager, next, jumper"
              background
              small
            />
          </div>
        </el-tab-pane>

        <!-- ========================= Tab 8: 打料产量 ========================= -->
        <el-tab-pane label="打料产量日报表" name="daliao">
          <div class="table-wrapper">
            <el-table
              :data="daliaoPageData"
              :max-height="700"
              border
              stripe
              style="width: 100%"
              :header-cell-style="headerCellStyle"
              size="small"
              highlight-current-row
            >
              <el-table-column prop="date" label="日期" width="100" align="center" fixed="left" />
              <el-table-column prop="shift" label="班次" width="70" align="center" />
              <el-table-column prop="operator" label="操作工" width="90" align="center" />
              <el-table-column prop="puBai" label="普白(包)" width="85" align="center" />
              <el-table-column prop="zaSe" label="杂色(包)" width="85" align="center" />
              <el-table-column prop="diYa" label="低压(包)" width="80" align="center" />
              <el-table-column prop="lanSeDiYa" label="蓝色低压(包)" width="110" align="center" />
              <el-table-column prop="gaoYaErJi" label="高压二级(包)" width="105" align="center" />
              <el-table-column prop="huang" label="黄(包)" width="70" align="center" />
              <el-table-column prop="zaHuang" label="杂黄(包)" width="80" align="center" />
              <el-table-column prop="lan" label="兰(包)" width="70" align="center" />
              <el-table-column prop="lv" label="绿(包)" width="70" align="center" />
              <el-table-column prop="zaLv" label="杂绿(包)" width="80" align="center" />
              <el-table-column prop="hong" label="红(包)" width="70" align="center" />
              <el-table-column prop="zaHong" label="杂红(包)" width="80" align="center" />
              <el-table-column prop="ziSe" label="紫色(包)" width="80" align="center" />
              <el-table-column prop="subtotal" label="小计(包)" width="85" align="center" />
            </el-table>
          </div>
          <div class="card-footer">
            <el-pagination
              v-model:current-page="pageStates.daliao.current"
              v-model:page-size="pageStates.daliao.size"
              :page-sizes="[10, 20, 50]"
              :total="daliaoFiltered.length"
              layout="total, sizes, prev, pager, next, jumper"
              background
              small
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

// ============================================================
// 全局状态
// ============================================================
const selectedDate = ref('')
const activeTab = ref('lasi')

// ============================================================
// 表头样式
// ============================================================
const headerCellStyle = () => ({
  background: '#f5f7fa',
  color: '#303133',
  fontWeight: 600,
  fontSize: '13px',
})

// ============================================================
// 分页状态（每个tab独立）
// ============================================================
interface PageState {
  current: number
  size: number
}
const initPageState = (): PageState => ({ current: 1, size: 10 })
const pageStates = reactive<Record<string, PageState>>({
  lasi: initPageState(),
  yuanzhi: initPageState(),
  puyin: initPageState(),
  caiyin: initPageState(),
  tumo: initPageState(),
  chuimo: initPageState(),
  yitiji: initPageState(),
  daliao: initPageState(),
})

function onTabChange() {
  // 切换tab时重置页码（可选：保留页码则不重置）
}

// ============================================================
// 辅助：按日期筛选 & 分页
// ============================================================
function filterByDate<T extends { date: string }>(data: T[]): T[] {
  if (!selectedDate.value) return data
  return data.filter((item) => item.date === selectedDate.value)
}

function paginate<T>(data: T[], page: number, size: number): T[] {
  const start = (page - 1) * size
  return data.slice(start, start + size)
}

// ============================================================
// Tab1: 拉丝产量日报表
// ============================================================
interface LasiRecord {
  date: string
  shift: string
  machineNo: string
  leaderName: string
  productName: string
  lineWidth: string
  gramWeight: number
  tensileForce: number
  color: string
  granuleBag: number
  powderBag: number
  gradeBag: number
  masterBatch: number
  greenBag: number
  yellowBag: number
}

const lasiMock: LasiRecord[] = [
  { date: '2026-05-16', shift: '白班', machineNo: 'LS-01', leaderName: '张建国', productName: '高强丝', lineWidth: '2.8', gramWeight: 75, tensileForce: 4.5, color: '白色', granuleBag: 20, powderBag: 5, gradeBag: 2, masterBatch: 1, greenBag: 0, yellowBag: 0 },
  { date: '2026-05-16', shift: '中班', machineNo: 'LS-02', leaderName: '李德华', productName: '普通丝', lineWidth: '3.2', gramWeight: 82, tensileForce: 3.8, color: '白色', granuleBag: 18, powderBag: 4, gradeBag: 1, masterBatch: 1, greenBag: 0, yellowBag: 0 },
  { date: '2026-05-15', shift: '白班', machineNo: 'LS-01', leaderName: '张建国', productName: '平丝', lineWidth: '2.5', gramWeight: 70, tensileForce: 4.2, color: '白色', granuleBag: 22, powderBag: 6, gradeBag: 2, masterBatch: 1, greenBag: 0, yellowBag: 0 },
  { date: '2026-05-15', shift: '夜班', machineNo: 'LS-03', leaderName: '王伟民', productName: '高强丝', lineWidth: '2.8', gramWeight: 76, tensileForce: 4.6, color: '白色', granuleBag: 19, powderBag: 5, gradeBag: 1, masterBatch: 1, greenBag: 0, yellowBag: 0 },
  { date: '2026-05-14', shift: '中班', machineNo: 'LS-02', leaderName: '李德华', productName: '加捻丝', lineWidth: '3.0', gramWeight: 80, tensileForce: 4.0, color: '本白', granuleBag: 21, powderBag: 5, gradeBag: 2, masterBatch: 0, greenBag: 0, yellowBag: 0 },
]

const lasiFiltered = computed(() => filterByDate(lasiMock))
const lasiPageData = computed(() => paginate(lasiFiltered.value, pageStates.lasi.current, pageStates.lasi.size))

// ============================================================
// Tab2: 圆织产量日报表
// ============================================================
interface YuanzhiRecord {
  date: string
  shift: string
  machineNo: string
  leaderName: string
  width: number
  gramWeight: number
  color: string
  unitPrice: number
  machineRevolutions: number
  foldMeters: number
  clothRevolutions: number
  clothLength: number
  theoreticalWeight: number
  actualWeight: number
  deviation: number
}

const yuanzhiMock: YuanzhiRecord[] = [
  { date: '2026-05-16', shift: '白班', machineNo: 'YZ-01', leaderName: '刘大伟', width: 65, gramWeight: 85, color: '白色', unitPrice: 0.85, machineRevolutions: 12500, foldMeters: 6250, clothRevolutions: 4800, clothLength: 2400, theoreticalWeight: 510, actualWeight: 505, deviation: -5 },
  { date: '2026-05-16', shift: '中班', machineNo: 'YZ-02', leaderName: '陈志强', width: 70, gramWeight: 90, color: '白色', unitPrice: 0.90, machineRevolutions: 11800, foldMeters: 5900, clothRevolutions: 4500, clothLength: 2250, theoreticalWeight: 495, actualWeight: 500, deviation: 5 },
  { date: '2026-05-15', shift: '白班', machineNo: 'YZ-01', leaderName: '刘大伟', width: 65, gramWeight: 85, color: '白色', unitPrice: 0.85, machineRevolutions: 13000, foldMeters: 6500, clothRevolutions: 5000, clothLength: 2500, theoreticalWeight: 531, actualWeight: 528, deviation: -3 },
  { date: '2026-05-15', shift: '夜班', machineNo: 'YZ-03', leaderName: '赵永强', width: 75, gramWeight: 88, color: '本白', unitPrice: 0.88, machineRevolutions: 11200, foldMeters: 5600, clothRevolutions: 4200, clothLength: 2100, theoreticalWeight: 462, actualWeight: 458, deviation: -4 },
  { date: '2026-05-14', shift: '中班', machineNo: 'YZ-02', leaderName: '陈志强', width: 70, gramWeight: 90, color: '白色', unitPrice: 0.90, machineRevolutions: 12000, foldMeters: 6000, clothRevolutions: 4600, clothLength: 2300, theoreticalWeight: 506, actualWeight: 510, deviation: 4 },
]

const yuanzhiFiltered = computed(() => filterByDate(yuanzhiMock))
const yuanzhiPageData = computed(() => paginate(yuanzhiFiltered.value, pageStates.yuanzhi.current, pageStates.yuanzhi.size))

// ============================================================
// Tab3: 普印产量日报表
// ============================================================
interface PuyinRecord {
  date: string
  shift: string
  machineNo: string
  operator: string
  seq: number
  name: string
  singleSide: string
  doubleSide: string
  qualified: number
  unqualified: number
  unitPrice: number
}

const puyinMock: PuyinRecord[] = [
  { date: '2026-05-16', shift: '白班', machineNo: 'PY-01', operator: '周明', seq: 1, name: '编织袋(50kg)', singleSide: '单面', doubleSide: '', qualified: 8500, unqualified: 120, unitPrice: 0.18 },
  { date: '2026-05-16', shift: '中班', machineNo: 'PY-02', operator: '吴海', seq: 2, name: '化肥袋', singleSide: '', doubleSide: '双面', qualified: 6200, unqualified: 85, unitPrice: 0.25 },
  { date: '2026-05-15', shift: '白班', machineNo: 'PY-01', operator: '周明', seq: 1, name: '编织袋(25kg)', singleSide: '单面', doubleSide: '', qualified: 9200, unqualified: 95, unitPrice: 0.15 },
  { date: '2026-05-15', shift: '夜班', machineNo: 'PY-03', operator: '郑辉', seq: 3, name: '饲料袋', singleSide: '', doubleSide: '双面', qualified: 7800, unqualified: 110, unitPrice: 0.22 },
  { date: '2026-05-14', shift: '中班', machineNo: 'PY-02', operator: '吴海', seq: 2, name: '化肥袋', singleSide: '', doubleSide: '双面', qualified: 6500, unqualified: 90, unitPrice: 0.25 },
]

const puyinFiltered = computed(() => filterByDate(puyinMock))
const puyinPageData = computed(() => paginate(puyinFiltered.value, pageStates.puyin.current, pageStates.puyin.size))

// ============================================================
// Tab4: 彩印产量日报表
// ============================================================
interface CaiyinRecord {
  date: string
  shift: string
  machineNo: string
  operator: string
  seq: number
  name: string
  opp: string
  yaMo: string
  zhuGuangMo: string
  size: string
  singleSide: string
  doubleSide: string
  gaiGuang: string
  zheBian: string
  daMa: string
  unitPrice: number
  orderQty: number
  unit: string
  qualified: number
  unqualified: number
}

const caiyinMock: CaiyinRecord[] = [
  { date: '2026-05-16', shift: '白班', machineNo: 'CY-01', operator: '杨帆', seq: 1, name: '彩印米袋', opp: 'OPP', yaMo: '', zhuGuangMo: '', size: '400*0.08', singleSide: '单面', doubleSide: '', gaiGuang: '', zheBian: '', daMa: '', unitPrice: 0.35, orderQty: 5000, unit: 'm', qualified: 4850, unqualified: 50 },
  { date: '2026-05-16', shift: '中班', machineNo: 'CY-02', operator: '林彩霞', seq: 2, name: '彩印饲料袋', opp: '', yaMo: '哑膜', zhuGuangMo: '', size: '500*0.10', singleSide: '', doubleSide: '双面', gaiGuang: '盖光', zheBian: '', daMa: '', unitPrice: 0.48, orderQty: 8000, unit: 'm', qualified: 7820, unqualified: 65 },
  { date: '2026-05-15', shift: '白班', machineNo: 'CY-01', operator: '杨帆', seq: 1, name: '彩印米袋', opp: 'OPP', yaMo: '', zhuGuangMo: '', size: '400*0.08', singleSide: '单面', doubleSide: '', gaiGuang: '', zheBian: '', daMa: '', unitPrice: 0.35, orderQty: 6000, unit: 'm', qualified: 5920, unqualified: 45 },
  { date: '2026-05-15', shift: '夜班', machineNo: 'CY-03', operator: '黄艳', seq: 3, name: '彩印化肥袋', opp: '', yaMo: '', zhuGuangMo: '珠光膜', size: '450*0.09', singleSide: '单面', doubleSide: '', gaiGuang: '', zheBian: '折边', daMa: '打码', unitPrice: 0.42, orderQty: 7000, unit: 'm', qualified: 6880, unqualified: 55 },
  { date: '2026-05-14', shift: '中班', machineNo: 'CY-02', operator: '林彩霞', seq: 2, name: '彩印饲料袋', opp: '', yaMo: '哑膜', zhuGuangMo: '', size: '500*0.10', singleSide: '', doubleSide: '双面', gaiGuang: '盖光', zheBian: '', daMa: '', unitPrice: 0.48, orderQty: 7500, unit: 'm', qualified: 7350, unqualified: 60 },
]

const caiyinFiltered = computed(() => filterByDate(caiyinMock))
const caiyinPageData = computed(() => paginate(caiyinFiltered.value, pageStates.caiyin.current, pageStates.caiyin.size))

// ============================================================
// Tab5: 涂膜产量日报表
// ============================================================
interface TumoRecord {
  date: string
  shift: string
  machineNo: string
  operator: string
  customerName: string
  productName: string
  caiYinLiao: number
  erFuLiao: number
  gao1C7A: number
  whiteMaster: number
  selfMade: number
  ifGaiGuang: string
  coatingGram: number
  qualified: number
}

const tumoMock: TumoRecord[] = [
  { date: '2026-05-16', shift: '白班', machineNo: 'TM-01', operator: '孙志刚', customerName: '中化化肥', productName: '涂膜编织袋', caiYinLiao: 8, erFuLiao: 3, gao1C7A: 2, whiteMaster: 1, selfMade: 0, ifGaiGuang: '是', coatingGram: 15, qualified: 5200 },
  { date: '2026-05-16', shift: '中班', machineNo: 'TM-02', operator: '钱峰', customerName: '云天化', productName: '涂膜饲料袋', caiYinLiao: 6, erFuLiao: 4, gao1C7A: 1, whiteMaster: 1, selfMade: 2, ifGaiGuang: '否', coatingGram: 12, qualified: 4800 },
  { date: '2026-05-15', shift: '白班', machineNo: 'TM-01', operator: '孙志刚', customerName: '中化化肥', productName: '涂膜编织袋', caiYinLiao: 10, erFuLiao: 3, gao1C7A: 2, whiteMaster: 1, selfMade: 0, ifGaiGuang: '是', coatingGram: 15, qualified: 5600 },
  { date: '2026-05-15', shift: '夜班', machineNo: 'TM-03', operator: '冯超', customerName: '史丹利', productName: '涂膜复合袋', caiYinLiao: 7, erFuLiao: 5, gao1C7A: 2, whiteMaster: 1, selfMade: 1, ifGaiGuang: '是', coatingGram: 18, qualified: 4950 },
  { date: '2026-05-14', shift: '中班', machineNo: 'TM-02', operator: '钱峰', customerName: '云天化', productName: '涂膜饲料袋', caiYinLiao: 5, erFuLiao: 3, gao1C7A: 1, whiteMaster: 0, selfMade: 2, ifGaiGuang: '否', coatingGram: 12, qualified: 5100 },
]

const tumoFiltered = computed(() => filterByDate(tumoMock))
const tumoPageData = computed(() => paginate(tumoFiltered.value, pageStates.tumo.current, pageStates.tumo.size))

// ============================================================
// Tab6: 吹膜产量日报表
// ============================================================
interface ChuimoRecord {
  date: string
  shift: string
  machineNo: string
  operator: string
  productName: string
  size: string
  weight: number
  pressureLevel: string
  qualified: number
  rolls: number
  selfCheckGram: number
  unqualified: number
}

const chuimoMock: ChuimoRecord[] = [
  { date: '2026-05-16', shift: '白班', machineNo: 'CM-01', operator: '何建国', productName: 'PE薄膜', size: '600*0.05', weight: 25, pressureLevel: '低', qualified: 850, rolls: 34, selfCheckGram: 12.5, unqualified: 15 },
  { date: '2026-05-16', shift: '中班', machineNo: 'CM-02', operator: '唐磊', productName: 'POF收缩膜', size: '500*0.03', weight: 18, pressureLevel: '高', qualified: 720, rolls: 28, selfCheckGram: 9.8, unqualified: 20 },
  { date: '2026-05-15', shift: '白班', machineNo: 'CM-01', operator: '何建国', productName: 'PE薄膜', size: '600*0.05', weight: 25, pressureLevel: '低', qualified: 920, rolls: 38, selfCheckGram: 12.5, unqualified: 12 },
  { date: '2026-05-15', shift: '夜班', machineNo: 'CM-03', operator: '曹明', productName: 'CPP薄膜', size: '550*0.04', weight: 22, pressureLevel: '高', qualified: 780, rolls: 30, selfCheckGram: 11.2, unqualified: 18 },
  { date: '2026-05-14', shift: '中班', machineNo: 'CM-02', operator: '唐磊', productName: 'POF收缩膜', size: '500*0.03', weight: 18, pressureLevel: '高', qualified: 690, rolls: 26, selfCheckGram: 9.8, unqualified: 22 },
]

const chuimoFiltered = computed(() => filterByDate(chuimoMock))
const chuimoPageData = computed(() => paginate(chuimoFiltered.value, pageStates.chuimo.current, pageStates.chuimo.size))

// ============================================================
// Tab7: 一体机产量日报表
// ============================================================
interface YitijiRecord {
  date: string
  shift: string
  name: string
  machineNo: string
  customerName: string
  productName: string
  qieTao: number
  quanKou: number
  danQie: number
  faKou: number
  wasteBags: number
  reworkBags: number
  qualified: number
  unitPrice: number
  laborCost: number
}

const yitijiMock: YitijiRecord[] = [
  { date: '2026-05-16', shift: '白班', name: '徐明', machineNo: 'YTJ-01', customerName: '新希望', productName: '一体成型袋', qieTao: 3200, quanKou: 2800, danQie: 0, faKou: 0, wasteBags: 35, reworkBags: 20, qualified: 3150, unitPrice: 0.55, laborCost: 1732.5 },
  { date: '2026-05-16', shift: '中班', name: '高强', machineNo: 'YTJ-02', customerName: '海大集团', productName: '阀口袋', qieTao: 0, quanKou: 0, danQie: 2400, faKou: 2600, wasteBags: 28, reworkBags: 15, qualified: 4980, unitPrice: 0.62, laborCost: 3087.6 },
  { date: '2026-05-15', shift: '白班', name: '徐明', machineNo: 'YTJ-01', customerName: '新希望', productName: '一体成型袋', qieTao: 3500, quanKou: 3100, danQie: 0, faKou: 0, wasteBags: 30, reworkBags: 18, qualified: 3450, unitPrice: 0.55, laborCost: 1897.5 },
  { date: '2026-05-15', shift: '夜班', name: '罗勇', machineNo: 'YTJ-03', customerName: '通威股份', productName: '一体阀口袋', qieTao: 0, quanKou: 0, danQie: 1800, faKou: 2200, wasteBags: 22, reworkBags: 12, qualified: 3980, unitPrice: 0.58, laborCost: 2308.4 },
  { date: '2026-05-14', shift: '中班', name: '高强', machineNo: 'YTJ-02', customerName: '海大集团', productName: '阀口袋', qieTao: 0, quanKou: 0, danQie: 2200, faKou: 2500, wasteBags: 25, reworkBags: 14, qualified: 4480, unitPrice: 0.62, laborCost: 2777.6 },
]

const yitijiFiltered = computed(() => filterByDate(yitijiMock))
const yitijiPageData = computed(() => paginate(yitijiFiltered.value, pageStates.yitiji.current, pageStates.yitiji.size))

// ============================================================
// Tab8: 打料产量日报表
// ============================================================
interface DaliaoRecord {
  date: string
  shift: string
  operator: string
  puBai: number
  zaSe: number
  diYa: number
  lanSeDiYa: number
  gaoYaErJi: number
  huang: number
  zaHuang: number
  lan: number
  lv: number
  zaLv: number
  hong: number
  zaHong: number
  ziSe: number
  subtotal: number
}

const daliaoMock: DaliaoRecord[] = [
  { date: '2026-05-16', shift: '白班', operator: '马文才', puBai: 15, zaSe: 8, diYa: 12, lanSeDiYa: 5, gaoYaErJi: 10, huang: 3, zaHuang: 2, lan: 4, lv: 3, zaLv: 1, hong: 2, zaHong: 1, ziSe: 1, subtotal: 67 },
  { date: '2026-05-16', shift: '中班', operator: '段志平', puBai: 18, zaSe: 6, diYa: 10, lanSeDiYa: 4, gaoYaErJi: 8, huang: 2, zaHuang: 1, lan: 3, lv: 2, zaLv: 0, hong: 1, zaHong: 0, ziSe: 0, subtotal: 55 },
  { date: '2026-05-15', shift: '白班', operator: '马文才', puBai: 20, zaSe: 10, diYa: 14, lanSeDiYa: 6, gaoYaErJi: 12, huang: 4, zaHuang: 2, lan: 5, lv: 4, zaLv: 2, hong: 3, zaHong: 1, ziSe: 1, subtotal: 84 },
  { date: '2026-05-15', shift: '夜班', operator: '彭大海', puBai: 12, zaSe: 5, diYa: 8, lanSeDiYa: 3, gaoYaErJi: 6, huang: 2, zaHuang: 1, lan: 2, lv: 1, zaLv: 0, hong: 1, zaHong: 0, ziSe: 0, subtotal: 41 },
  { date: '2026-05-14', shift: '中班', operator: '段志平', puBai: 16, zaSe: 7, diYa: 11, lanSeDiYa: 4, gaoYaErJi: 9, huang: 3, zaHuang: 1, lan: 3, lv: 2, zaLv: 1, hong: 2, zaHong: 1, ziSe: 0, subtotal: 60 },
]

const daliaoFiltered = computed(() => filterByDate(daliaoMock))
const daliaoPageData = computed(() => paginate(daliaoFiltered.value, pageStates.daliao.current, pageStates.daliao.size))
</script>

<style lang="scss" scoped>
@use '@/scss/variables' as *;

.production-daily-page {
  padding: 0 $spacing-5;
  background: $color-gray-100;
  min-height: 100vh;

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
      background: linear-gradient(135deg, #1a73e8, #4a90e2);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      flex-shrink: 0;

      .header-icon-text {
        font-size: $font-size-xl;
        font-weight: $font-weight-bold;
      }
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

  .report-card {
    background: #fff;
    border-radius: $border-radius-xl;
    box-shadow: $shadow-base;
    overflow: hidden;
    padding: $spacing-4;

    :deep(.el-tabs__header) {
      margin-bottom: $spacing-4;
      padding: 0 $spacing-2;
    }

    :deep(.el-tabs__item) {
      font-size: $font-size-sm;
      font-weight: $font-weight-medium;
      height: 40px;
      line-height: 40px;
    }

    .table-wrapper {
      width: 100%;
      max-width: 100%;
      overflow-x: auto;

      :deep(.el-table) {
        width: max-content !important;
        min-width: 100% !important;
        font-size: $font-size-sm;

        .el-table__header-wrapper th {
          background: $color-gray-50;
        }

        .el-table__body-wrapper {
          &::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
          &::-webkit-scrollbar-thumb {
            background: $color-gray-300;
            border-radius: 3px;
          }
        }
      }
    }

    .card-footer {
      padding: $spacing-3 $spacing-4;
      display: flex;
      justify-content: flex-end;
      border-top: 1px solid $color-gray-200;
      background: $color-gray-50;
      margin-top: $spacing-4;
      border-radius: 0 0 $border-radius-lg $border-radius-lg;
    }
  }
}
</style>
