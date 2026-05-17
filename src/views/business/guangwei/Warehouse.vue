<template>
  <!--
    根容器：is-fullscreen 时通过 CSS 提升为 position: fixed 覆盖整屏，
    并隐藏 hero，只保留 toolbar-card（筛选栏）+ table-card（表格），
    实现"Excel 风格"——顶部筛选 + 全屏数据表
  -->
  <div class="purchase-contracts-page" :class="{ 'is-fullscreen': isFullscreen, 'is-detail-route': isDetailRoute }">
    <!--
      ===================================================================
      列表态视图（始终渲染）
      -------------------------------------------------------------------
      与 OrderList.vue 同构：详情已由全屏抽屉承载，列表 / 筛选 / 表格
      / 分页等容器与抽屉共存于同一路由，无需再因 isDetailRoute 切换。
      ===================================================================
    -->
    <!--
      ========== 顶部品牌 Hero（极简白卡片样式） ==========
      说明：业务方要求与"广为科技 - 采购合同"页保持一致——白色卡片背景、
            仅展示图标 + 主标题 + 副标题，不再带「贸易模式」徽章 / 流程文案 /
            合同份数 / 合同总量 / 合同总额等业务数据。聚合数据交由表格底部
            合计行 + 筛选条件实时承担，避免顶部冗余 KPI 卡片占用纵向空间。
            右侧的「导入 Excel / 导出报表 / 新增合同」操作按钮按需保留。
    -->
    <header class="page-hero">
      <div class="hero-left">
        <div class="hero-badge purchase-badge">
          <el-icon :size="28"><Tickets /></el-icon>
        </div>
        <div class="hero-info">
          <h1 class="hero-title">广为科技 - 入出库明细</h1>
          <p class="hero-subtitle">硫磺、磷酸入出库流水管理 · 一站式联动采购入库与销售出库</p>
        </div>
      </div>
      <div class="hero-actions">
        <!--
          导入 Excel：
            1) 主按钮点击 → 触发隐藏 file input；
            2) 下方"下载模板"链接 → 业务方可先下载列名规范的空模板，按格式填表后再导入；
            3) accept 限定 xlsx/xls，避免上传错误格式后报错不清。
        -->
        <el-dropdown split-button :icon="Upload" plain @click="triggerImportExcel">
          导入 Excel
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="triggerImportExcel">选择文件导入</el-dropdown-item>
              <el-dropdown-item divided @click="downloadImportTemplate">下载导入模板</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <!-- 隐藏的原生文件选择器；通过 ref 在 JS 里调用 click() 触发 -->
        <input
          ref="importFileInput"
          type="file"
          accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          style="display: none"
          @change="handleImportFileChange"
        />
        <!-- 顶部"导出报表"按钮：复用 exportExcel，业务方在任意位置都能一键导出 -->
        <el-button :icon="DownloadIcon" plain :disabled="!filteredContracts.length" @click="exportExcel">导出报表</el-button>
        <el-button type="primary" :icon="Plus" @click="openContractDialog()">新增合同</el-button>
      </div>
    </header>

    <!--
      ========== 入出库流水主视图 ==========
      设计动机：
        · 入出库流水是本页的唯一主体视图，同时聚合采购合同的入库
          (receipts) 与销售合同的出库 (shipments)，按日期倒序展示。
        · 顶部四张指标卡：本月入库 / 本月出库 / 当前库存 / 异常磅差，
          让业务方在 3 秒内对仓库状态有完整心智模型。
        · 入库行点击「查看合同」 → emit open-purchase →
          handleOpenPurchaseFromFlow → openDrawer，复用原采购合同的
          抽屉（编辑、增删子记录、打印），保持唯一事实来源。
        · 出库行点击则通过路由跳转到订单列表页并自动打开对应销售合同
          抽屉，避免跨页双写。
        · 采购合同的"新增 / 导入 / 导出"等管理能力完整保留在 hero
          右侧按钮组里，不会因为去除原多级表头主表而丢失任何入口。
    -->
    <InventoryFlow @open-purchase="handleOpenPurchaseFromFlow" />

    <!--
      ========== 已停用：原"采购合同明细"筛选条 ==========
      合并视图改造后，筛选能力已由 InventoryFlow 流水视图提供（搜索、
      方向、日期、对手方筛选）。此处用 v-if="false" 暂时归档，保留所有
      ref / 方法以避免破坏旧路由 query 联动、看板视图、Excel 导入 /
      导出等内部逻辑；若后续业务确认不再使用，可整段删除。
    -->
    <section v-if="false" class="toolbar-card">
      <!-- 第一行：基础维度（关键字 / 集团 / 工厂 / 区域 / 执行状态 / 合同日期） -->
      <div class="toolbar-row">
        <el-input
          v-model="filters.keyword"
          placeholder="搜索合同编号 / 集团 / 工厂 / 发票号 / 司机"
          clearable
          :prefix-icon="Search"
          class="search-input"
        />
        <el-select v-model="filters.group" placeholder="集团" clearable class="filter-item">
          <el-option v-for="g in groupOptions" :key="g" :label="g" :value="g" />
        </el-select>
        <el-select v-model="filters.factory" placeholder="工厂" clearable class="filter-item">
          <el-option v-for="f in factoryOptions" :key="f" :label="f" :value="f" />
        </el-select>
        <el-select v-model="filters.region" placeholder="区域" clearable class="filter-item-sm">
          <el-option v-for="r in regionOptions" :key="r" :label="r" :value="r" />
        </el-select>
        <el-select v-model="filters.status" placeholder="执行状态" clearable class="filter-item">
          <el-option label="执行中" value="ongoing" />
          <el-option label="已完成" value="done" />
          <el-option label="待开票" value="pending-invoice" />
          <el-option label="待付款" value="pending-payment" />
          <el-option label="超量发货" value="overshipped" />
          <el-option label="未启动" value="not-started" />
        </el-select>
        <el-date-picker
          v-model="filters.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="合同开始"
          end-placeholder="合同结束"
          unlink-panels
          value-format="YYYY-MM-DD"
          class="date-item"
        />
      </div>

      <!-- 第二行：进阶维度（付款状态 / 数量区间 / 单价区间 / 业务异常筛选 / 操作） -->
      <div class="toolbar-row toolbar-row-advanced">
        <el-select v-model="filters.payStatus" placeholder="付款状态" clearable class="filter-item">
          <el-option label="已结清" value="settled" />
          <el-option label="部分付款" value="partial" />
          <el-option label="未付款" value="unpaid" />
          <el-option label="无开票" value="no-invoice" />
        </el-select>

        <div class="range-filter">
          <span class="range-label">数量(吨)</span>
          <el-input-number
            v-model="filters.qtyMin"
            :min="0"
            :precision="2"
            controls-position="right"
            placeholder="最小"
            class="range-num"
          />
          <span class="range-sep">—</span>
          <el-input-number
            v-model="filters.qtyMax"
            :min="0"
            :precision="2"
            controls-position="right"
            placeholder="最大"
            class="range-num"
          />
        </div>

        <div class="range-filter">
          <span class="range-label">单价(元)</span>
          <el-input-number
            v-model="filters.priceMin"
            :min="0"
            controls-position="right"
            placeholder="最小"
            class="range-num"
          />
          <span class="range-sep">—</span>
          <el-input-number
            v-model="filters.priceMax"
            :min="0"
            controls-position="right"
            placeholder="最大"
            class="range-num"
          />
        </div>

        <el-tooltip content="仅显示存在过磅差异（多 / 少）的合同" placement="top">
          <el-checkbox v-model="filters.onlyWeighDiff" class="filter-check">含磅差</el-checkbox>
        </el-tooltip>
        <el-tooltip content="仅显示接收数量 > 开票数量的合同" placement="top">
          <el-checkbox v-model="filters.onlyUninvoiced" class="filter-check">有未开票</el-checkbox>
        </el-tooltip>
        <el-tooltip content="仅显示带备注的合同" placement="top">
          <el-checkbox v-model="filters.onlyRemark" class="filter-check">有备注</el-checkbox>
        </el-tooltip>

        <div class="toolbar-actions">
          <el-tag v-if="activeFilterCount > 0" type="primary" effect="light" round size="small">
            已启用 {{ activeFilterCount }} 项筛选
          </el-tag>
          <el-button :icon="RefreshRight" @click="resetFilters">重置</el-button>
        </div>
      </div>
    </section>

    <!--
      ========== 已停用：原"采购合同明细"多级表头主表 ==========
      展示能力已由 InventoryFlow 替代；点击流水里的入库行可经
      handleOpenPurchaseFromFlow 复用原 openDrawer 抽屉编辑能力。
    -->
    <section v-if="false" class="table-card">
      <div class="table-card-header">
        <div class="table-title">
          <el-icon class="title-icon"><Tickets /></el-icon>
          <span>入出库明细表</span>
        </div>
        <div class="table-tools">
          <el-segmented
            v-model="viewMode"
            :options="[
              { label: '全部', value: 'all' },
              { label: '本月活跃', value: 'recent' },
              { label: '异常追踪', value: 'abnormal' }
            ]"
            size="small"
          />
          <el-button size="small" :icon="View" @click="openSummaryMode">看板视图</el-button>
          <!-- 导出当前筛选结果为 Excel；空集合时按钮不可用，避免下载空文件 -->
          <el-tooltip content="按当前筛选结果导出 Excel" placement="top">
            <el-button
              size="small"
              :icon="DownloadIcon"
              :disabled="!filteredContracts.length"
              @click="exportExcel"
            >
              导出
            </el-button>
          </el-tooltip>
          <!-- 浏览器原生打印；打印样式表会自动隐藏左侧导航与工具栏 -->
          <el-tooltip content="打印当前表格" placement="top">
            <el-button size="small" :icon="PrinterIcon" @click="printTable">打印</el-button>
          </el-tooltip>
          <!--
            全屏切换按钮：
              - 普通模式 → 显示"全屏"，点击进入全屏（FullScreen 图标）
              - 全屏模式 → 显示"退出全屏"，点击或按 ESC 退出（Aim 收缩图标）
          -->
          <el-tooltip
            :content="isFullscreen ? '退出全屏 (ESC)' : '全屏查看表格'"
            placement="top"
          >
            <el-button
              size="small"
              :icon="isFullscreen ? AimIcon : FullScreenIcon"
              :type="isFullscreen ? 'primary' : 'default'"
              @click="toggleFullscreen"
            >
              {{ isFullscreen ? '退出全屏' : '全屏' }}
            </el-button>
          </el-tooltip>
        </div>
      </div>

      <!--
        主表格：
          - :max-height  启用纵向滚动 + 表头吸顶固定
          - 当列宽总和超出可视区域时，el-table 会自动在 body 区域生成横向滚动条
          - scrollbar-always-on 让滚动条始终可见，便于用户感知数据规模
      -->
      <el-table
        :data="pagedFlatRows"
        :span-method="spanMethod"
        :row-class-name="flatRowClass"
        :cell-class-name="flatCellClass"
        :header-cell-class-name="headerCellClass"
        :max-height="tableMaxHeight"
        scrollbar-always-on
        border
        stripe
        size="small"
        class="contract-grid"
      >
        <!-- ========= 1. 供应商名称 ========= -->
        <el-table-column label="供应商名称" align="center" class-name="group-customer">
          <el-table-column prop="contract.groupName" label="集团" width="100" align="center">
            <template #default="{ row }">
              <span class="cell-strong">{{ row.contract.groupName }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="contract.region" label="区域" width="70" align="center">
            <template #default="{ row }">
              <span class="cell-strong">{{ row.contract.region || '—' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="contract.factoryName" label="工厂名称" width="120" align="center">
            <template #default="{ row }">
              <span class="cell-strong">{{ row.contract.factoryName }}</span>
            </template>
          </el-table-column>
        </el-table-column>

        <!-- ========= 2. 合同 ========= -->
        <el-table-column label="合同" align="center" class-name="group-contract">
          <el-table-column label="序号" width="56" align="center">
            <template #default="{ row }">
              <span class="seq">{{ row.contractSeq }}</span>
            </template>
          </el-table-column>
          <el-table-column label="日期" width="110" align="center">
            <template #default="{ row }">{{ row.contract.contractDate || '—' }}</template>
          </el-table-column>
          <el-table-column label="合同编号" min-width="200">
            <template #default="{ row }">
              <div class="contract-no-cell">
                <el-icon class="cn-icon"><Document /></el-icon>
                <span class="cn-text">{{ row.contract.contractNo || '— 无 —' }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="数量(吨)" width="100" align="right">
            <template #default="{ row }">
              <span class="num">{{ formatNum(row.contract.contractQty) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="单价(元)" width="100" align="right">
            <template #default="{ row }">
              <span class="num">{{ row.contract.contractPrice ? formatNum(row.contract.contractPrice) : '—' }}</span>
            </template>
          </el-table-column>
        </el-table-column>

        <!-- ========= 3. 实际发货量 ========= -->
        <el-table-column label="实际发货量" align="center" class-name="group-ship">
          <el-table-column label="序号" width="56" align="center">
            <template #default="{ row }">
              <span v-if="row.shipment" class="seq seq-ship">{{ row.shipIdx + 1 }}</span>
            </template>
          </el-table-column>
          <el-table-column label="日期" width="110" align="center">
            <template #default="{ row }">{{ row.shipment?.date || '' }}</template>
          </el-table-column>
          <el-table-column label="发货地点" width="100" align="center">
            <template #default="{ row }">{{ row.shipment?.location || '' }}</template>
          </el-table-column>
          <el-table-column label="出库单号" width="95" align="center">
            <template #default="{ row }">
              <span v-if="row.shipment" class="mono-mini">{{ row.shipment.outNo || '—' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="数量(吨)" width="100" align="right">
            <template #default="{ row }">
              <span v-if="row.shipment" class="num num-ship">{{ formatNum(row.shipment.qty) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="备注" min-width="120" show-overflow-tooltip>
            <template #default="{ row }">{{ row.shipment?.remark || '' }}</template>
          </el-table-column>
        </el-table-column>

        <!-- ========= 4. 运输 ========= -->
        <el-table-column label="运输" align="center" class-name="group-transport">
          <el-table-column label="序号" width="56" align="center">
            <template #default="{ row }">
              <span v-if="row.transport" class="seq seq-transport">{{ row.transportIdx + 1 }}</span>
            </template>
          </el-table-column>
          <el-table-column label="日期" width="110" align="center">
            <template #default="{ row }">{{ row.transport?.date || '' }}</template>
          </el-table-column>
          <!-- 承运单位：采购台账业务方实际只对接「丰茂物流」一家，但保留列便于多承运商扩展 -->
          <el-table-column label="承运单位" width="100" align="center">
            <template #default="{ row }">{{ row.transport?.carrier || '' }}</template>
          </el-table-column>
          <!-- 承运车号：原销售页这里被错误标记为"承运单位"，本采购页修正为正确含义 -->
          <el-table-column label="承运车号" width="105" align="center">
            <template #default="{ row }">
              <span v-if="row.transport" class="mono-mini">{{ row.transport.vehicleNo || '—' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="司机姓名" width="90" align="center">
            <template #default="{ row }">{{ row.transport?.driver || '' }}</template>
          </el-table-column>
          <el-table-column label="身份证号" width="170" align="center" show-overflow-tooltip>
            <template #default="{ row }">
              <span v-if="row.transport" class="mono-mini">{{ row.transport.idCard || '—' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="数量(吨)" width="100" align="right">
            <template #default="{ row }">
              <span v-if="row.transport" class="num">{{ formatNum(row.transport.qty) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="运输单价(元/吨)" width="120" align="right">
            <template #default="{ row }">
              <span v-if="row.transport" class="num">{{ row.transport.price ? formatNum(row.transport.price) : '—' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="备注" min-width="120" show-overflow-tooltip>
            <template #default="{ row }">{{ row.transport?.remark || '' }}</template>
          </el-table-column>
        </el-table-column>

        <!-- ========= 5. 实际接收 ========= -->
        <el-table-column label="实际接收" align="center" class-name="group-receipt">
          <el-table-column label="序号" width="56" align="center">
            <template #default="{ row }">
              <span v-if="row.receipt" class="seq seq-receipt">{{ row.receiptIdx + 1 }}</span>
            </template>
          </el-table-column>
          <el-table-column label="日期" width="110" align="center">
            <template #default="{ row }">{{ row.receipt?.date || '' }}</template>
          </el-table-column>
          <el-table-column label="接收单位(使用单位)" width="140" align="center">
            <template #default="{ row }">{{ row.receipt?.unit || '' }}</template>
          </el-table-column>
          <el-table-column label="接收人姓名" width="90" align="center">
            <template #default="{ row }">{{ row.receipt?.receiver || '' }}</template>
          </el-table-column>
          <el-table-column label="过磅单号" width="120" align="center" show-overflow-tooltip>
            <template #default="{ row }">
              <span v-if="row.receipt" class="mono-mini">{{ row.receipt.weighNo || '—' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="数量(吨)" width="100" align="right">
            <template #default="{ row }">
              <span v-if="row.receipt" class="num num-receipt">{{ formatNum(row.receipt.qty) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="单价(元)" width="90" align="right">
            <template #default="{ row }">
              <span v-if="row.receipt" class="num">{{ row.receipt.price ? formatNum(row.receipt.price) : '—' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="金额(元)" width="110" align="right">
            <template #default="{ row }">
              <span v-if="row.receipt" class="num amount-strong">{{ formatNum(row.receipt.amount) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="磅差(吨)" width="90" align="right">
            <template #default="{ row }">
              <span
                v-if="row.receipt"
                :class="['num', row.receipt.weighDiff < 0 ? 'diff-neg' : row.receipt.weighDiff > 0 ? 'diff-pos' : '']"
              >
                {{ row.receipt.weighDiff > 0 ? '+' : '' }}{{ row.receipt.weighDiff }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="备注" min-width="120" show-overflow-tooltip>
            <template #default="{ row }">{{ row.receipt?.remark || '' }}</template>
          </el-table-column>
        </el-table-column>

        <!-- ========= 6. 开票情况 ========= -->
        <el-table-column label="开票情况" align="center" class-name="group-invoice">
          <el-table-column label="序号" width="56" align="center">
            <template #default="{ row }">
              <span v-if="row.invoice" class="seq seq-invoice">{{ row.invoiceIdx + 1 }}</span>
            </template>
          </el-table-column>
          <el-table-column label="日期" width="110" align="center">
            <template #default="{ row }">{{ row.invoice?.date || '' }}</template>
          </el-table-column>
          <el-table-column label="发票编号" min-width="190" show-overflow-tooltip>
            <template #default="{ row }">
              <span v-if="row.invoice" class="mono-mini">{{ row.invoice.invoiceNo }}</span>
            </template>
          </el-table-column>
          <el-table-column label="对应合同编号" min-width="180" show-overflow-tooltip>
            <template #default="{ row }">
              <span v-if="row.invoice">{{ row.contract.contractNo || '�����' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="数量(吨)" width="100" align="right">
            <template #default="{ row }">
              <span v-if="row.invoice" class="num num-invoice">{{ formatNum(row.invoice.qty) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="单价(元/吨)" width="100" align="right">
            <template #default="{ row }">
              <span v-if="row.invoice" class="num">{{ formatNum(row.invoice.price) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="金额(元)" width="110" align="right">
            <template #default="{ row }">
              <span v-if="row.invoice" class="num amount-strong">{{ formatNum(row.invoice.amount) }}</span>
            </template>
          </el-table-column>
          <!-- 收入人列：原始单据写法可能是"电子QQ邮箱455874531"，此处拆分展示更清晰 -->
          <el-table-column label="收货人" width="170" align="center">
            <template #default="{ row }">
              <template v-if="row.invoice">
                <div class="receiver-cell" :class="'rc-' + parseReceiver(row.invoice.receiver).type">
                  <template v-if="parseReceiver(row.invoice.receiver).type === 'email'">
                    <el-tag size="small" type="info" effect="plain" round class="rc-tag">邮箱</el-tag>
                    <el-tooltip :content="parseReceiver(row.invoice.receiver).contact" placement="top">
                      <span class="rc-text mono-mini">{{ parseReceiver(row.invoice.receiver).contact }}</span>
                    </el-tooltip>
                  </template>
                  <template v-else-if="parseReceiver(row.invoice.receiver).type === 'person'">
                    <el-tag size="small" type="primary" effect="plain" round class="rc-tag">收件</el-tag>
                    <span class="rc-text">{{ parseReceiver(row.invoice.receiver).label }}</span>
                  </template>
                  <span v-else class="rc-empty">—</span>
                </div>
              </template>
            </template>
          </el-table-column>
          <el-table-column label="是否交付" width="90" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.invoice" :type="row.invoice.delivered ? 'success' : 'warning'" size="small" effect="light" round>
                {{ row.invoice.delivered ? '已交付' : '待交付' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="备注" min-width="120" show-overflow-tooltip>
            <template #default="{ row }">{{ row.invoice?.remark || '' }}</template>
          </el-table-column>
        </el-table-column>

        <!-- ========= 7. 资金支付 ========= -->
        <el-table-column label="资金支付" align="center" class-name="group-payment">
          <el-table-column label="序号" width="56" align="center">
            <template #default="{ row }">
              <span v-if="row.payment" class="seq seq-payment">{{ row.paymentIdx + 1 }}</span>
            </template>
          </el-table-column>
          <el-table-column label="日期" width="110" align="center">
            <template #default="{ row }">{{ row.payment?.date || '' }}</template>
          </el-table-column>
          <el-table-column label="金额(元)" width="120" align="right">
            <template #default="{ row }">
              <span v-if="row.payment" class="num amount-strong">{{ formatNum(row.payment.amount) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="资金支付" width="120" align="center">
            <template #default="{ row }">
              <template v-if="row.isContractFirst">
                <div class="pay-mini">
                  <div class="pay-mini-bar"><div class="pay-mini-fill" :style="{ width: payRate(row.contract) + '%' }" /></div>
                  <div class="pay-mini-txt">{{ payRate(row.contract).toFixed(0) }}%</div>
                </div>
              </template>
            </template>
          </el-table-column>
        </el-table-column>

        <!-- =========================================================
             操作列
             ---------------------------------------------------------
             设计变更（极简化）：
               1) "详情"跳转到独立的合同详情页（不再使用抽屉），
                  详情页内承担完整的"查看 + 编辑 + 子记录登记"职责；
               2) 5 类登记（收货 / 运输 / 接收 / 开票 / 付款）入口
                  已在详情页的明细 tab 内提供"+ 新增"按钮，行内列
                  不再重复暴露，避免按钮挤压导致 fixed=right 列被
                  左侧固定列遮挡（旧版"详情"曾被裁切成"羊情"）；
               3) 仅保留高频的"删除"作为危险操作，二次确认。
             ========================================================= -->
        <el-table-column label="操作" width="110" align="center" fixed="right" class-name="group-action">
          <template #default="{ row }">
            <div v-if="row.isContractFirst" class="row-actions" @click.stop>
              <el-button link type="primary" @click="openDrawer(row.contract)">详情</el-button>
              <el-button link type="danger" @click="onMoreCommand('delete', row.contract)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-bar">
        <el-pagination
          v-model:current-page="page.currentPage"
          v-model:page-size="page.pageSize"
          :total="filteredContracts.length"
          :page-sizes="[5, 10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          background
        />
      </div>
    </section>
    <!-- ↑↑↑ 列表态视图结束 ↑↑↑ -->

    <!-- ==========================================================
         Excel 导入预览对话框
         ----------------------------------------------------------
         设计要点：
           1) 业务表是「多级表头宽表」，一份合同对应多行明细
              （发货 / 运输 / 接收 / 开票 / 付款 五条业务流），
              因此预览以"合同主体"为分组单位、用展开行查看明细；
           2) 顶部统计：合同份数 + 明细总条数 + 校验通过份数；
           3) 用户可勾选/取消单份合同，灵活控制导入范围；
           4) 异常合同（缺关键字段）红底高亮并附错误原因。
         ========================================================== -->
    <el-dialog
      v-model="importDialog.visible"
      title="导入预览"
      width="1180px"
      :close-on-click-modal="false"
      class="import-preview-dialog"
    >
      <div v-if="importDialog.error" class="import-error-block">
        <el-icon :size="18" color="#e53935"><WarningFilled /></el-icon>
        <span>{{ importDialog.error }}</span>
      </div>
      <template v-else>
        <div class="import-summary-bar">
          <span class="ist-item">
            合同份数：<strong>{{ importDialog.contracts.length }}</strong> 份
          </span>
          <span class="ist-item ist-ok">
            校验通过：<strong>{{ importDialog.validCount }}</strong> 份
          </span>
          <span class="ist-item ist-err">
            异常：<strong>{{ importDialog.contracts.length - importDialog.validCount }}</strong> 份
          </span>
          <span class="ist-item">
            明细总数：发货 <strong>{{ importDialog.totalShipments }}</strong> /
            运输 <strong>{{ importDialog.totalTransports }}</strong> /
            接收 <strong>{{ importDialog.totalReceipts }}</strong> /
            开票 <strong>{{ importDialog.totalInvoices }}</strong> /
            付款 <strong>{{ importDialog.totalPayments }}</strong>
          </span>
        </div>
        <el-table
          ref="importPreviewTable"
          :data="importDialog.contracts"
          height="440"
          size="small"
          border
          :row-class-name="importRowClass"
          @selection-change="handleImportSelectionChange"
        >
          <el-table-column type="selection" width="44" :selectable="(row: ImportPreviewContract) => row.valid" />
          <el-table-column type="expand">
            <template #default="{ row }">
              <div class="import-detail-block">
                <el-tabs type="border-card" class="import-detail-tabs">
                  <el-tab-pane :label="`发货 (${row.shipments.length})`" v-if="row.shipments.length">
                    <el-table :data="row.shipments" size="small" border>
                      <el-table-column label="日期" prop="date" width="110" />
                      <el-table-column label="发货地点" prop="location" min-width="120" />
                      <el-table-column label="出库单号" prop="outNo" min-width="120" />
                      <el-table-column label="数量(吨)" prop="qty" width="90" align="right" />
                      <el-table-column label="备注" prop="remark" min-width="140" show-overflow-tooltip />
                    </el-table>
                  </el-tab-pane>
                  <el-tab-pane :label="`运输 (${row.transports.length})`" v-if="row.transports.length">
                    <el-table :data="row.transports" size="small" border>
                      <el-table-column label="日期" prop="date" width="110" />
                      <el-table-column label="承运单位" prop="carrier" width="100" />
                      <el-table-column label="承运车号" prop="vehicleNo" width="110" />
                      <el-table-column label="司机" prop="driver" width="90" />
                      <el-table-column label="身份证号" prop="idCard" min-width="170" />
                      <el-table-column label="数量(吨)" prop="qty" width="90" align="right" />
                      <el-table-column label="运输单价" prop="price" width="100" align="right" />
                      <el-table-column label="备注" prop="remark" min-width="120" show-overflow-tooltip />
                    </el-table>
                  </el-tab-pane>
                  <el-tab-pane :label="`接收 (${row.receipts.length})`" v-if="row.receipts.length">
                    <el-table :data="row.receipts" size="small" border>
                      <el-table-column label="日期" prop="date" width="110" />
                      <el-table-column label="接收单位" prop="unit" min-width="120" />
                      <el-table-column label="接收人" prop="receiver" width="90" />
                      <el-table-column label="过磅单号" prop="weighNo" min-width="120" />
                      <el-table-column label="数量(吨)" prop="qty" width="90" align="right" />
                      <el-table-column label="单价" prop="price" width="80" align="right" />
                      <el-table-column label="金额(元)" prop="amount" width="110" align="right" />
                      <el-table-column label="磅差(吨)" prop="weighDiff" width="90" align="right" />
                      <el-table-column label="备注" prop="remark" min-width="120" show-overflow-tooltip />
                    </el-table>
                  </el-tab-pane>
                  <el-tab-pane :label="`开票 (${row.invoices.length})`" v-if="row.invoices.length">
                    <el-table :data="row.invoices" size="small" border>
                      <el-table-column label="日期" prop="date" width="110" />
                      <el-table-column label="发票号码" prop="invoiceNo" min-width="200" />
                      <el-table-column label="数量(吨)" prop="qty" width="90" align="right" />
                      <el-table-column label="单价" prop="price" width="80" align="right" />
                      <el-table-column label="金额(元)" prop="amount" width="110" align="right" />
                      <el-table-column label="收票人" prop="receiver" min-width="160" />
                      <el-table-column label="是否交付" prop="delivered" width="90">
                        <template #default="{ row: r }">
                          <el-tag :type="r.delivered ? 'success' : 'info'" size="small">
                            {{ r.delivered ? '已交付' : '未交付' }}
                          </el-tag>
                        </template>
                      </el-table-column>
                      <el-table-column label="备注" prop="remark" min-width="120" show-overflow-tooltip />
                    </el-table>
                  </el-tab-pane>
                  <el-tab-pane :label="`付款 (${row.payments.length})`" v-if="row.payments.length">
                    <el-table :data="row.payments" size="small" border>
                      <el-table-column label="日期" prop="date" width="110" />
                      <el-table-column label="金额(元)" prop="amount" width="120" align="right" />
                      <el-table-column label="备注" prop="remark" min-width="120" show-overflow-tooltip />
                    </el-table>
                  </el-tab-pane>
                  <el-tab-pane label="（无明细）" v-if="!row.shipments.length && !row.transports.length && !row.receipts.length && !row.invoices.length && !row.payments.length">
                    <el-empty description="该合同未解析到任何业务明细" :image-size="60" />
                  </el-tab-pane>
                </el-tabs>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="集团" prop="groupName" min-width="100" show-overflow-tooltip />
          <el-table-column label="区域" prop="region" width="70" />
          <el-table-column label="工厂" prop="factoryName" min-width="110" show-overflow-tooltip />
          <el-table-column label="合同编号" prop="contractNo" min-width="190" show-overflow-tooltip />
          <el-table-column label="签订日期" prop="contractDate" width="100" />
          <el-table-column label="合同数量" prop="contractQty" width="86" align="right" />
          <el-table-column label="合同单价" prop="contractPrice" width="86" align="right" />
          <el-table-column label="明细" width="190">
            <template #default="{ row }">
              <div class="import-mini-counts">
                <span v-if="row.shipments.length" class="imc imc-ship">发{{ row.shipments.length }}</span>
                <span v-if="row.transports.length" class="imc imc-trans">运{{ row.transports.length }}</span>
                <span v-if="row.receipts.length" class="imc imc-recv">收{{ row.receipts.length }}</span>
                <span v-if="row.invoices.length" class="imc imc-inv">票{{ row.invoices.length }}</span>
                <span v-if="row.payments.length" class="imc imc-pay">款{{ row.payments.length }}</span>
                <span v-if="!row.shipments.length && !row.transports.length && !row.receipts.length && !row.invoices.length && !row.payments.length" class="imc imc-empty">
                  无
                </span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="校验" width="120" fixed="right">
            <template #default="{ row }">
              <el-tag v-if="row.valid" type="success" size="small">通过</el-tag>
              <el-tooltip v-else :content="row.errorMsg" placement="top">
                <el-tag type="danger" size="small">{{ row.errorMsg }}</el-tag>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
      </template>
      <template #footer>
        <el-button @click="importDialog.visible = false">取消</el-button>
        <el-button
          type="primary"
          :disabled="!importDialog.selectedCount"
          @click="confirmImport"
        >
          确认导入 {{ importDialog.selectedCount || importDialog.validCount }} 份合同
        </el-button>
      </template>
    </el-dialog>


    <!--
      ===================================================================
      合同详情 · 全屏抽屉（v4 最终方案）
      -------------------------------------------------------------------
      与 OrderList.vue 同构：行内"详情"按钮 / 采购合同看板下钻 /
      流水入库行跳合同，全部由 drawerVisible 本地态驱动，不再 router.push
      到 GuangweiWarehouseDetail，避免 TagsView 标签栏膨胀。详细设计
      讨论见 OrderList.vue 同处注释。
      ===================================================================
    -->
    <el-drawer
      v-model="drawerVisible"
      direction="rtl"
      size="100%"
      :with-header="false"
      :show-close="false"
      :close-on-click-modal="false"
      :destroy-on-close="false"
      :append-to-body="true"
      class="guangwei-fullscreen-drawer"
    >
    <section v-if="activeContract" class="contract-detail-inline">
      <div class="drawer-content">
        <!--
          顶部页面级导航条
          ----------------------------------------------------------------
          · 左侧："返回列表"按钮 + 面包屑（采购合同 / 合同编号），强调
            当前所在层级；
          · 右侧：与原抽屉一致的"编辑合同 / 关闭"操作，关闭按钮额外触发
            router 回退，让浏览器历史与视图状态保持同步。
        -->
        <div class="detail-topbar">
          <el-button text :icon="ArrowLeft" class="detail-back" @click="closeDetail">返回列表</el-button>
          <el-divider direction="vertical" />
          <span class="detail-crumb">采购合同</span>
          <span class="detail-crumb-sep">/</span>
          <span class="detail-crumb detail-crumb-current">{{ activeContract.contractNo || '— 无合同号 —' }}</span>
        </div>
        <div class="drawer-header">
          <div class="drawer-title-block">
            <div class="drawer-badge">
              <el-icon :size="22"><Tickets /></el-icon>
            </div>
            <div>
              <div class="drawer-title">{{ activeContract.contractNo || '— 无合同号 —' }}</div>
              <div class="drawer-sub">
                {{ activeContract.groupName }} · {{ activeContract.region }} · {{ activeContract.factoryName }}
              </div>
            </div>
          </div>
          <!--
            详情视图头部操作区
            ------------------------------------------------------------
            把"编辑"按钮从行内操作列下沉到详情视图，原因：
              · 行内列宽紧张时，fixed=right 列被左侧列遮挡，"详情"
                这类两字按钮会被裁切（出现"羊情"的视觉残影）；
              · 业务上"先看后改"的概率远高于"直接改"，将编辑入口收
                敛到详情视图更符合自然路径。
          -->
          <div class="drawer-actions">
            <el-button type="primary" :icon="EditIcon" @click="editFromDrawer">编辑合同</el-button>
            <el-button text :icon="Close" @click="closeDetail" />
          </div>
        </div>

        <div class="drawer-summary">
          <div class="summary-item">
            <div class="summary-label">合同日期</div>
            <div class="summary-value">{{ activeContract.contractDate || '—' }}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">合同数量</div>
            <div class="summary-value">{{ formatNum(activeContract.contractQty) }} <span class="unit">吨</span></div>
          </div>
          <div class="summary-item">
            <div class="summary-label">合同单价</div>
            <div class="summary-value">¥{{ formatNum(activeContract.contractPrice) }} <span class="unit">/吨</span></div>
          </div>
          <div class="summary-item highlight">
            <div class="summary-label">合同金额</div>
            <div class="summary-value">
              ¥{{ formatNum(activeContract.contractQty * activeContract.contractPrice) }}
            </div>
          </div>
        </div>

        <!-- 三个核心进度：发货 / 开票 / 付款；将"数值 — 进度条 — 百分比"明确分块，避免拥挤 -->
        <div class="drawer-progress">
          <!-- 发货进度 -->
          <div class="dp-item">
            <div class="dp-head">
              <span class="dp-label">
                <i class="dp-dot d-ship" />发货 / 合同量
              </span>
              <span class="dp-num">
                <strong>{{ formatNum(shipQty(activeContract)) }}</strong>
                <span class="dp-divider">/</span>
                {{ formatNum(activeContract.contractQty) }}
                <span class="dp-unit">吨</span>
              </span>
            </div>
            <div class="dp-bar-row">
              <el-progress
                class="dp-bar"
                :percentage="Math.min(100, (shipQty(activeContract) / Math.max(1, activeContract.contractQty)) * 100)"
                :stroke-width="10"
                :show-text="false"
                color="#1a73e8"
              />
              <span class="dp-percent c-ship">
                {{ ((shipQty(activeContract) / Math.max(1, activeContract.contractQty)) * 100).toFixed(1) }}%
              </span>
            </div>
          </div>

          <!-- 开票进度 -->
          <div class="dp-item">
            <div class="dp-head">
              <span class="dp-label">
                <i class="dp-dot d-invoice" />开票 / 合同量
              </span>
              <span class="dp-num">
                <strong>{{ formatNum(invoiceQty(activeContract)) }}</strong>
                <span class="dp-divider">/</span>
                {{ formatNum(activeContract.contractQty) }}
                <span class="dp-unit">吨</span>
              </span>
            </div>
            <div class="dp-bar-row">
              <el-progress
                class="dp-bar"
                :percentage="Math.min(100, (invoiceQty(activeContract) / Math.max(1, activeContract.contractQty)) * 100)"
                :stroke-width="10"
                :show-text="false"
                color="#00b8d4"
              />
              <span class="dp-percent c-invoice">
                {{ ((invoiceQty(activeContract) / Math.max(1, activeContract.contractQty)) * 100).toFixed(1) }}%
              </span>
            </div>
          </div>

          <!-- 付款率 -->
          <div class="dp-item">
            <div class="dp-head">
              <span class="dp-label">
                <i class="dp-dot d-payment" />付款 / 开票金额
              </span>
              <span class="dp-num">
                <strong>¥{{ formatNum(paymentTotal(activeContract)) }}</strong>
                <span class="dp-divider">/</span>
                ¥{{ formatNum(invoiceAmount(activeContract)) }}
              </span>
            </div>
            <div class="dp-bar-row">
              <el-progress
                class="dp-bar"
                :percentage="Math.min(100, payRate(activeContract))"
                :stroke-width="10"
                :show-text="false"
                color="#43a047"
              />
              <span class="dp-percent c-payment">{{ payRate(activeContract).toFixed(1) }}%</span>
            </div>
          </div>
        </div>

        <el-tabs v-model="activeTab" class="drawer-tabs">
          <!-- 发货 -->
          <el-tab-pane name="shipments">
            <template #label>
              <span class="tab-label">
                <el-icon><Box /></el-icon>
                发货明细
                <el-tag size="small" round>{{ activeContract.shipments.length }}</el-tag>
              </span>
            </template>
            <div class="tab-toolbar">
              <span class="tab-summary">累计 {{ formatNum(shipQty(activeContract)) }} 吨</span>
              <el-button type="primary" size="small" :icon="Plus" @click="openSubDialog('shipment')">新增发货</el-button>
            </div>
            <el-table :data="activeContract.shipments" border size="small" class="sub-table">
              <el-table-column label="序号" type="index" width="60" align="center" />
              <el-table-column label="日期" prop="date" width="110" />
              <el-table-column label="发货地点" prop="location" min-width="120" />
              <el-table-column label="出库单号" prop="outNo" width="110" />
              <el-table-column label="数量 (吨)" prop="qty" width="100" align="right">
                <template #default="{ row }">{{ formatNum(row.qty) }}</template>
              </el-table-column>
              <el-table-column label="备注" prop="remark" min-width="160" show-overflow-tooltip />
              <el-table-column label="操作" width="80" align="center">
                <template #default="{ $index }">
                  <el-button link type="danger" size="small" @click="removeSubRecord('shipments', $index)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>

          <!-- 运输 -->
          <el-tab-pane name="transports">
            <template #label>
              <span class="tab-label">
                <el-icon><Van /></el-icon>
                运输明细
                <el-tag size="small" round>{{ activeContract.transports.length }}</el-tag>
              </span>
            </template>
            <div class="tab-toolbar">
              <span class="tab-summary">合计运输 {{ formatNum(transportQty(activeContract)) }} 吨</span>
              <el-button type="primary" size="small" :icon="Plus" @click="openSubDialog('transport')">新增运输</el-button>
            </div>
            <el-table :data="activeContract.transports" border size="small" class="sub-table">
              <el-table-column label="序号" type="index" width="60" align="center" />
              <el-table-column label="日期" prop="date" width="110" />
              <el-table-column label="承运单位" prop="carrier" width="100" />
              <el-table-column label="承运车号" prop="vehicleNo" width="110" />
              <el-table-column label="司机姓名" prop="driver" width="100" />
              <el-table-column label="身份证号" prop="idCard" width="170" show-overflow-tooltip />
              <el-table-column label="数量 (吨)" prop="qty" width="100" align="right">
                <template #default="{ row }">{{ formatNum(row.qty) }}</template>
              </el-table-column>
              <el-table-column label="运输单价" prop="price" width="110" align="right">
                <template #default="{ row }">{{ row.price ? '¥' + formatNum(row.price) : '—' }}</template>
              </el-table-column>
              <el-table-column label="备注" prop="remark" min-width="120" show-overflow-tooltip />
              <el-table-column label="操作" width="80" align="center">
                <template #default="{ $index }">
                  <el-button link type="danger" size="small" @click="removeSubRecord('transports', $index)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>

          <!-- 接收 -->
          <el-tab-pane name="receipts">
            <template #label>
              <span class="tab-label">
                <el-icon><Check /></el-icon>
                ��收明细
                <el-tag size="small" round>{{ activeContract.receipts.length }}</el-tag>
              </span>
            </template>
            <div class="tab-toolbar">
              <span class="tab-summary">
                合计接收 {{ formatNum(receiptQty(activeContract)) }} 吨 ·
                金额 ¥{{ formatNum(receiptAmount(activeContract)) }}
              </span>
              <el-button type="primary" size="small" :icon="Plus" @click="openSubDialog('receipt')">新增接收</el-button>
            </div>
            <el-table :data="activeContract.receipts" border size="small" class="sub-table">
              <el-table-column label="序号" type="index" width="60" align="center" />
              <el-table-column label="日期" prop="date" width="110" />
              <el-table-column label="接收单位" prop="unit" min-width="120" />
              <el-table-column label="接收人" prop="receiver" width="100" />
              <el-table-column label="过磅单号" prop="weighNo" width="120" show-overflow-tooltip />
              <el-table-column label="数量 (吨)" prop="qty" width="100" align="right">
                <template #default="{ row }">{{ formatNum(row.qty) }}</template>
              </el-table-column>
              <el-table-column label="单价" prop="price" width="100" align="right">
                <template #default="{ row }">¥{{ formatNum(row.price) }}</template>
              </el-table-column>
              <el-table-column label="金额" prop="amount" width="120" align="right">
                <template #default="{ row }">¥{{ formatNum(row.amount) }}</template>
              </el-table-column>
              <el-table-column label="磅差 (吨)" prop="weighDiff" width="100" align="right">
                <template #default="{ row }">
                  <span :class="row.weighDiff < 0 ? 'diff-neg' : row.weighDiff > 0 ? 'diff-pos' : ''">
                    {{ row.weighDiff > 0 ? '+' : '' }}{{ row.weighDiff }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="备注" prop="remark" min-width="120" show-overflow-tooltip />
              <el-table-column label="操作" width="80" align="center">
                <template #default="{ $index }">
                  <el-button link type="danger" size="small" @click="removeSubRecord('receipts', $index)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>

          <!-- 开票 -->
          <el-tab-pane name="invoices">
            <template #label>
              <span class="tab-label">
                <el-icon><Tickets /></el-icon>
                开票情况
                <el-tag size="small" round>{{ activeContract.invoices.length }}</el-tag>
              </span>
            </template>
            <div class="tab-toolbar">
              <span class="tab-summary">
                累计开票 ¥{{ formatNum(invoiceAmount(activeContract)) }}
              </span>
              <el-button type="primary" size="small" :icon="Plus" @click="openSubDialog('invoice')">新增开票</el-button>
            </div>
            <el-table :data="activeContract.invoices" border size="small" class="sub-table">
              <el-table-column label="序号" type="index" width="60" align="center" />
              <el-table-column label="开票日期" prop="date" width="110" />
              <el-table-column label="发票号码" prop="invoiceNo" min-width="180" show-overflow-tooltip>
                <template #default="{ row }">
                  <span class="mono">{{ row.invoiceNo }}</span>
                </template>
              </el-table-column>
              <el-table-column label="数量 (吨)" prop="qty" width="100" align="right">
                <template #default="{ row }">{{ formatNum(row.qty) }}</template>
              </el-table-column>
              <el-table-column label="单价" prop="price" width="100" align="right">
                <template #default="{ row }">¥{{ formatNum(row.price) }}</template>
              </el-table-column>
              <el-table-column label="金额" prop="amount" width="120" align="right">
                <template #default="{ row }">¥{{ formatNum(row.amount) }}</template>
              </el-table-column>
              <!-- 抽屉内同样使用 parseReceiver 美化展示 -->
              <el-table-column label="接收人" prop="receiver" min-width="180">
                <template #default="{ row }">
                  <div class="receiver-cell" :class="'rc-' + parseReceiver(row.receiver).type">
                    <template v-if="parseReceiver(row.receiver).type === 'email'">
                      <el-tag size="small" type="info" effect="plain" round class="rc-tag">邮箱</el-tag>
                      <span class="rc-text mono">{{ parseReceiver(row.receiver).contact }}</span>
                    </template>
                    <template v-else-if="parseReceiver(row.receiver).type === 'person'">
                      <el-tag size="small" type="primary" effect="plain" round class="rc-tag">收件</el-tag>
                      <span class="rc-text">{{ parseReceiver(row.receiver).label }}</span>
                    </template>
                    <span v-else class="rc-empty">—</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="状态" width="100" align="center">
                <template #default="{ row }">
                  <el-tag :type="row.delivered ? 'success' : 'warning'" size="small" effect="light" round>
                    {{ row.delivered ? '已交付' : '待交付' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="备注" prop="remark" min-width="120" show-overflow-tooltip />
              <el-table-column label="操作" width="80" align="center">
                <template #default="{ $index }">
                  <el-button link type="danger" size="small" @click="removeSubRecord('invoices', $index)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>

          <!-- 付款 -->
          <el-tab-pane name="payments">
            <template #label>
              <span class="tab-label">
                <el-icon><Wallet /></el-icon>
                资金支付
                <el-tag size="small" round>{{ activeContract.payments.length }}</el-tag>
              </span>
            </template>
            <div class="tab-toolbar">
              <span class="tab-summary">
                累计付款 ¥{{ formatNum(paymentTotal(activeContract)) }}
              </span>
              <el-button type="primary" size="small" :icon="Plus" @click="openSubDialog('payment')">新增付款</el-button>
            </div>
            <el-table :data="activeContract.payments" border size="small" class="sub-table">
              <el-table-column label="序号" type="index" width="60" align="center" />
              <el-table-column label="付款日期" prop="date" width="120" />
              <el-table-column label="金额" prop="amount" align="right">
                <template #default="{ row }">
                  <span class="amount-strong">¥{{ formatNum(row.amount) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="备注" prop="remark" min-width="180" show-overflow-tooltip />
              <el-table-column label="操作" width="80" align="center">
                <template #default="{ $index }">
                  <el-button link type="danger" size="small" @click="removeSubRecord('payments', $index)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>

        <div v-if="activeContract.remark" class="drawer-remark">
          <el-icon><InfoFilled /></el-icon>
          <span>{{ activeContract.remark }}</span>
        </div>
      </div>
    </section>
    </el-drawer>

    <!--
      ============================================================
      新增 / 编辑采购合同对话框
      ------------------------------------------------------------
      表单按业务表格的 6 大模块组织：

         1) 合同信息（必填，始终展示）
        2) 实际发货量    （可选，开关启用）
        3) 运输信息       （可选，开关启用）
        4) 实际接收（验收）（可选，开关启用��
        5) 开票情况       （可选，开关启用）
        6) 资金支付       （可选，开关启用）

      设计原则：
        - 编辑模式下仅展示合同信息段；过程子记录由表格行内的"快速新增"
          按钮逐条维护，避免编辑时误覆盖历史明细。
        - 新增模式下，业务人员若签约时即知道首次发货 / 接收 / 开票等
          关键信息，可一次性勾选并填写，减少二次录入。
        - 每个可选模块包含独立 switch + 折叠卡片；关闭时跳过验证 / 不入库。
        - 金额类字段（合同金额、接收金额、开票金额）一律不由用户录入，
          由"数量 × 单价"实时计算展示，避免人工口算误差。
      ============================================================
    -->
    <el-dialog
      v-model="contractDialog.visible"
      :title="contractDialog.editing ? '编辑采购合同' : '新增采购合同'"
      width="820"
      class="contract-form-dialog"
      destroy-on-close
    >
      <el-form
        ref="contractFormRef"
        :model="contractForm"
        :rules="contractRules"
        label-width="110px"
      >
        <!-- ====================================================
             模块 1：合同信息（必填）
             ==================================================== -->
        <section class="form-section">
          <header class="section-head">
            <span class="section-badge">1</span>
            <span class="section-title">合同信息</span>
            <span class="section-tag required">必填</span>
          </header>
          <div class="section-body">
            <div class="form-row">
              <el-form-item label="集团名称" prop="groupName" class="col-2">
                <el-select v-model="contractForm.groupName" placeholder="选择/输入集团" filterable allow-create>
                  <el-option v-for="g in groupOptions" :key="g" :label="g" :value="g" />
                </el-select>
              </el-form-item>
              <el-form-item label="区域" prop="region" class="col-2">
                <el-select v-model="contractForm.region" placeholder="选择/输入区域" filterable allow-create>
                  <el-option v-for="r in regionOptions" :key="r" :label="r" :value="r" />
                  <el-option label="海南" value="海南" />
                  <el-option label="广西" value="广西" />
                  <el-option label="广东" value="广东" />
                </el-select>
              </el-form-item>
            </div>
            <el-form-item label="工厂名称" prop="factoryName">
              <el-select
                v-model="contractForm.factoryName"
                placeholder="选择/输入工厂（如 昌江糖厂、长坡糖厂）"
                filterable
                allow-create
                style="width:100%"
              >
                <el-option v-for="f in factoryOptions" :key="f" :label="f" :value="f" />
              </el-select>
            </el-form-item>
            <div class="form-row">
              <el-form-item label="合同编号" prop="contractNo" class="col-2">
                <el-input v-model="contractForm.contractNo" placeholder="如 代海25-26X251024-271招" />
              </el-form-item>
              <el-form-item label="合同日期" prop="contractDate" class="col-2">
                <el-date-picker
                  v-model="contractForm.contractDate"
                  type="date"
                  value-format="YYYY-MM-DD"
                  placeholder="选择日期"
                  style="width:100%"
                />
              </el-form-item>
            </div>
            <div class="form-row">
              <el-form-item label="合同数量(吨)" prop="contractQty" class="col-2">
                <el-input-number v-model="contractForm.contractQty" :min="0" :precision="3" controls-position="right" style="width:100%" />
              </el-form-item>
              <el-form-item label="合同单价(元)" prop="contractPrice" class="col-2">
                <el-input-number v-model="contractForm.contractPrice" :min="0" :precision="2" controls-position="right" style="width:100%" />
              </el-form-item>
            </div>
            <el-form-item label="合同金额">
              <div class="readonly-amount">
                ¥{{ formatNum(contractForm.contractQty * contractForm.contractPrice) }}
                <span class="readonly-hint">（数量 × 单价 自��计算）</span>
              </div>
            </el-form-item>
            <el-form-item label="合同备注">
              <el-input v-model="contractForm.remark" type="textarea" :rows="2" placeholder="可填写合同补充说明、付款条款、交货约定等" />
            </el-form-item>
          </div>
        </section>

        <!-- ====================================================
             模块 2 ~ 6：可选首次过程记录（仅新增模式展示）
             ==================================================== -->
        <template v-if="!contractDialog.editing">
          <!-- 2) 实际发货 -->
          <section class="form-section optional" :class="{ 'is-enabled': contractForm.enableShipment }">
            <header class="section-head">
              <span class="section-badge">2</span>
              <span class="section-title">首次发货记录</span>
              <span class="section-tag optional">可选</span>
              <el-switch v-model="contractForm.enableShipment" class="section-switch" />
            </header>
            <div v-if="contractForm.enableShipment" class="section-body">
              <div class="form-row">
                <el-form-item label="发货日期" class="col-2">
                  <el-date-picker v-model="contractForm.initialShipment.date" type="date" value-format="YYYY-MM-DD" style="width:100%" />
                </el-form-item>
                <el-form-item label="发货地点" class="col-2">
                  <el-input v-model="contractForm.initialShipment.location" placeholder="如 广为仓库" />
                </el-form-item>
              </div>
              <div class="form-row">
                <el-form-item label="出库单号" class="col-2">
                  <el-input v-model="contractForm.initialShipment.outNo" placeholder="选填" />
                </el-form-item>
                <el-form-item label="数量(吨)" class="col-2">
                  <el-input-number v-model="contractForm.initialShipment.qty" :min="0" :precision="3" controls-position="right" style="width:100%" />
                </el-form-item>
              </div>
              <el-form-item label="发货备注">
                <el-input v-model="contractForm.initialShipment.remark" type="textarea" :rows="2" />
              </el-form-item>
            </div>
          </section>

          <!-- 3) 运输信息 -->
          <section class="form-section optional" :class="{ 'is-enabled': contractForm.enableTransport }">
            <header class="section-head">
              <span class="section-badge">3</span>
              <span class="section-title">首次运输记录</span>
              <span class="section-tag optional">可选</span>
              <el-switch v-model="contractForm.enableTransport" class="section-switch" />
            </header>
            <div v-if="contractForm.enableTransport" class="section-body">
              <div class="form-row">
                <el-form-item label="运输日期" class="col-2">
                  <el-date-picker v-model="contractForm.initialTransport.date" type="date" value-format="YYYY-MM-DD" style="width:100%" />
                </el-form-item>
                <el-form-item label="承运单位" class="col-2">
                  <el-input v-model="contractForm.initialTransport.carrier" placeholder="如 丰茂物流" />
                </el-form-item>
              </div>
              <div class="form-row">
                <el-form-item label="承运车号" class="col-2">
                  <el-input v-model="contractForm.initialTransport.vehicleNo" placeholder="如 桂A12345" />
                </el-form-item>
                <el-form-item label="数量" class="col-2" style="visibility:hidden"></el-form-item>
              </div>
              <div class="form-row">
                <el-form-item label="司机姓名" class="col-2">
                  <el-input v-model="contractForm.initialTransport.driver" />
                </el-form-item>
                <el-form-item label="身份证号" class="col-2">
                  <el-input v-model="contractForm.initialTransport.idCard" maxlength="18" />
                </el-form-item>
              </div>
              <div class="form-row">
                <el-form-item label="运输数量(吨)" class="col-2">
                  <el-input-number v-model="contractForm.initialTransport.qty" :min="0" :precision="3" controls-position="right" style="width:100%" />
                </el-form-item>
                <el-form-item label="运输单价" class="col-2">
                  <el-input-number v-model="contractForm.initialTransport.price" :min="0" :precision="2" controls-position="right" style="width:100%" />
                </el-form-item>
              </div>
              <el-form-item label="运输备注">
                <el-input v-model="contractForm.initialTransport.remark" type="textarea" :rows="2" />
              </el-form-item>
            </div>
          </section>

          <!-- 4) 实际接收（验收） -->
          <section class="form-section optional" :class="{ 'is-enabled': contractForm.enableReceipt }">
            <header class="section-head">
              <span class="section-badge">4</span>
              <span class="section-title">首次接收（验收）记录</span>
              <span class="section-tag optional">可选</span>
              <el-switch v-model="contractForm.enableReceipt" class="section-switch" />
            </header>
            <div v-if="contractForm.enableReceipt" class="section-body">
              <div class="form-row">
                <el-form-item label="验收日期" class="col-2">
                  <el-date-picker v-model="contractForm.initialReceipt.date" type="date" value-format="YYYY-MM-DD" style="width:100%" />
                </el-form-item>
                <el-form-item label="接收单位" class="col-2">
                  <el-input v-model="contractForm.initialReceipt.unit" placeholder="使用单位，如 昌江糖厂" />
                </el-form-item>
              </div>
              <div class="form-row">
                <el-form-item label="接收人" class="col-2">
                  <el-input v-model="contractForm.initialReceipt.receiver" placeholder="接收人姓名" />
                </el-form-item>
                <el-form-item label="过磅单号" class="col-2">
                  <el-input v-model="contractForm.initialReceipt.weighNo" />
                </el-form-item>
              </div>
              <div class="form-row">
                <el-form-item label="接收数量(吨)" class="col-2">
                  <el-input-number v-model="contractForm.initialReceipt.qty" :min="0" :precision="3" controls-position="right" style="width:100%" />
                </el-form-item>
                <el-form-item label="接收单价" class="col-2">
                  <el-input-number v-model="contractForm.initialReceipt.price" :min="0" :precision="2" controls-position="right" style="width:100%" />
                </el-form-item>
              </div>
              <div class="form-row">
                <el-form-item label="磅差(吨)" class="col-2">
                  <el-input-number v-model="contractForm.initialReceipt.weighDiff" :precision="3" controls-position="right" style="width:100%" />
                </el-form-item>
                <el-form-item label="接收金额" class="col-2">
                  <div class="readonly-amount sm">
                    ¥{{ formatNum(contractForm.initialReceipt.qty * contractForm.initialReceipt.price) }}
                  </div>
                </el-form-item>
              </div>
              <el-form-item label="验收备注">
                <el-input v-model="contractForm.initialReceipt.remark" type="textarea" :rows="2" />
              </el-form-item>
            </div>
          </section>

          <!-- 5) 开票情况 -->
          <section class="form-section optional" :class="{ 'is-enabled': contractForm.enableInvoice }">
            <header class="section-head">
              <span class="section-badge">5</span>
              <span class="section-title">首次开票记录</span>
              <span class="section-tag optional">可选</span>
              <el-switch v-model="contractForm.enableInvoice" class="section-switch" />
            </header>
            <div v-if="contractForm.enableInvoice" class="section-body">
              <div class="form-row">
                <el-form-item label="开票日期" class="col-2">
                  <el-date-picker v-model="contractForm.initialInvoice.date" type="date" value-format="YYYY-MM-DD" style="width:100%" />
                </el-form-item>
                <el-form-item label="发票号码" class="col-2">
                  <el-input v-model="contractForm.initialInvoice.invoiceNo" />
                </el-form-item>
              </div>
              <div class="form-row">
                <el-form-item label="开票数量(吨)" class="col-2">
                  <el-input-number v-model="contractForm.initialInvoice.qty" :min="0" :precision="3" controls-position="right" style="width:100%" />
                </el-form-item>
                <el-form-item label="开票单价" class="col-2">
                  <el-input-number v-model="contractForm.initialInvoice.price" :min="0" :precision="2" controls-position="right" style="width:100%" />
                </el-form-item>
              </div>
              <div class="form-row">
                <el-form-item label="收票人" class="col-2">
                  <el-input v-model="contractForm.initialInvoice.receiver" placeholder="如 电子QQ邮箱455874531" />
                </el-form-item>
                <el-form-item label="是否交付" class="col-2">
                  <el-switch v-model="contractForm.initialInvoice.delivered" active-text="已交付" inactive-text="未交付" inline-prompt />
                </el-form-item>
              </div>
              <el-form-item label="开票金额">
                <div class="readonly-amount sm">
                  ¥{{ formatNum(contractForm.initialInvoice.qty * contractForm.initialInvoice.price) }}
                </div>
              </el-form-item>
              <el-form-item label="开票备注">
                <el-input v-model="contractForm.initialInvoice.remark" type="textarea" :rows="2" />
              </el-form-item>
            </div>
          </section>

          <!-- 6) 资金支付 -->
          <section class="form-section optional" :class="{ 'is-enabled': contractForm.enablePayment }">
            <header class="section-head">
              <span class="section-badge">6</span>
              <span class="section-title">首次付款记录</span>
              <span class="section-tag optional">可选</span>
              <el-switch v-model="contractForm.enablePayment" class="section-switch" />
            </header>
            <div v-if="contractForm.enablePayment" class="section-body">
              <div class="form-row">
                <el-form-item label="付款日期" class="col-2">
                  <el-date-picker v-model="contractForm.initialPayment.date" type="date" value-format="YYYY-MM-DD" style="width:100%" />
                </el-form-item>
                <el-form-item label="付款金额" class="col-2">
                  <el-input-number v-model="contractForm.initialPayment.amount" :min="0" :precision="2" controls-position="right" style="width:100%" />
                </el-form-item>
              </div>
              <el-form-item label="付款备注">
                <el-input v-model="contractForm.initialPayment.remark" type="textarea" :rows="2" />
              </el-form-item>
            </div>
          </section>
        </template>
      </el-form>
      <template #footer>
        <el-button @click="contractDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="saveContract">保存</el-button>
      </template>
    </el-dialog>

    <!-- ========== 子记录新增弹窗 ========== -->
    <el-dialog
      v-model="subDialog.visible"
      :title="subDialogTitle"
      width="560"
      destroy-on-close
    >
      <!-- 发货 -->
      <el-form v-if="subDialog.type === 'shipment'" :model="subForm" label-width="100px">
        <el-form-item label="日期"><el-date-picker v-model="subForm.date" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item>
        <el-form-item label="发货地点"><el-input v-model="subForm.location" placeholder="如 广为仓库" /></el-form-item>
        <el-form-item label="出库单号"><el-input v-model="subForm.outNo" placeholder="选填" /></el-form-item>
        <el-form-item label="数量 (吨)"><el-input-number v-model="subForm.qty" :precision="3" :min="0" controls-position="right" style="width:100%" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="subForm.remark" type="textarea" :rows="2" /></el-form-item>
      </el-form>
      <!-- 运输 -->
      <el-form v-else-if="subDialog.type === 'transport'" :model="subForm" label-width="100px">
        <el-form-item label="日期"><el-date-picker v-model="subForm.date" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item>
        <el-form-item label="承运单位"><el-input v-model="subForm.carrier" placeholder="如 丰茂物流" /></el-form-item>
        <el-form-item label="承运车号"><el-input v-model="subForm.vehicleNo" /></el-form-item>
        <el-form-item label="司机姓名"><el-input v-model="subForm.driver" /></el-form-item>
        <el-form-item label="身份证号"><el-input v-model="subForm.idCard" /></el-form-item>
        <el-form-item label="数量 (吨)"><el-input-number v-model="subForm.qty" :precision="3" :min="0" controls-position="right" style="width:100%" /></el-form-item>
        <el-form-item label="运输单价"><el-input-number v-model="subForm.price" :min="0" controls-position="right" style="width:100%" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="subForm.remark" type="textarea" :rows="2" /></el-form-item>
      </el-form>
      <!-- 接收 -->
      <el-form v-else-if="subDialog.type === 'receipt'" :model="subForm" label-width="100px">
        <el-form-item label="日期"><el-date-picker v-model="subForm.date" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item>
        <el-form-item label="接收单位"><el-input v-model="subForm.unit" placeholder="如 昌江糖厂" /></el-form-item>
        <el-form-item label="接收人"><el-input v-model="subForm.receiver" /></el-form-item>
        <el-form-item label="过磅单号"><el-input v-model="subForm.weighNo" /></el-form-item>
        <el-form-item label="数量 (吨)"><el-input-number v-model="subForm.qty" :precision="3" :min="0" controls-position="right" style="width:100%" /></el-form-item>
        <el-form-item label="单价"><el-input-number v-model="subForm.price" :min="0" controls-position="right" style="width:100%" /></el-form-item>
        <el-form-item label="磅差 (吨)"><el-input-number v-model="subForm.weighDiff" :precision="3" controls-position="right" style="width:100%" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="subForm.remark" type="textarea" :rows="2" /></el-form-item>
      </el-form>
      <!-- 开票 -->
      <el-form v-else-if="subDialog.type === 'invoice'" :model="subForm" label-width="100px">
        <el-form-item label="开票日期"><el-date-picker v-model="subForm.date" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item>
        <el-form-item label="发票号码"><el-input v-model="subForm.invoiceNo" /></el-form-item>
        <el-form-item label="数量 (吨)"><el-input-number v-model="subForm.qty" :precision="3" :min="0" controls-position="right" style="width:100%" /></el-form-item>
        <el-form-item label="单价"><el-input-number v-model="subForm.price" :min="0" controls-position="right" style="width:100%" /></el-form-item>
        <el-form-item label="接收人"><el-input v-model="subForm.receiver" placeholder="如 电子QQ邮箱..." /></el-form-item>
        <el-form-item label="是否交付"><el-switch v-model="subForm.delivered" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="subForm.remark" type="textarea" :rows="2" /></el-form-item>
      </el-form>
      <!-- 付款 -->
      <el-form v-else-if="subDialog.type === 'payment'" :model="subForm" label-width="100px">
        <el-form-item label="付款日期"><el-date-picker v-model="subForm.date" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item>
        <el-form-item label="金额"><el-input-number v-model="subForm.amount" :min="0" :precision="2" controls-position="right" style="width:100%" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="subForm.remark" type="textarea" :rows="2" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="subDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="saveSubRecord">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onActivated, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useContractStore } from './contractStore'
import InventoryFlow from './InventoryFlow.vue'
import {
  Tickets,
  Document,
  Box,
  Plus,
  Upload,
  Search,
  RefreshRight,
  View,
  Close,
  Van,
  Check,
  Wallet,
  InfoFilled,
  FullScreen as FullScreenIcon,
  Aim as AimIcon,
  Download as DownloadIcon,
  Printer as PrinterIcon,
  Edit as EditIcon,
  WarningFilled,
  ArrowLeft
} from '@element-plus/icons-vue'
// xlsx 用于将当前筛选结果导出为 Excel（业务方常用，可直接打开二次编辑）
import * as XLSX from 'xlsx'
import { ElMessage, ElMessageBox } from 'element-plus'
// 路由：仅用于处理外部入口（如出库流水页）通过 query.openId 带过来的合同 id，
// 看板视图改为本页 BoardDrawer，不再产生独立路由跳转
import { useRoute, useRouter } from 'vue-router'
// 看板快照类型
import type { BoardSnapshot } from './components/GuangweiBoardDrawer.vue'

const router = useRouter()
const route = useRoute()

// ===========================================================
// 数据类型定义（业务实体模型）
// -----------------------------------------------------------
// 一份"采购合同"由 5 类子记录构成：
//   发货 → 运输 → 接收 → 开票 → 资金支付
// 每一类都是数组（一份合同可以拆分多次完成）
// ===========================================================

/** 发货记录：从广为仓库仓库装车出库 */
interface ShipmentRecord {
  date: string      // 发货日期
  location: string  // 发货地点（仓库名）
  outNo: string     // 出库单号
  qty: number       // 发货数量（吨）
  remark?: string   // 备注（小桶 / 散水 等说明）
}

/**
 * 运输记录：第三方车辆承运
 * -----------------------------------------------------------------------------
 * 与销售合同的差异：
 *   - 采购合同台账里"承运单位"是独立维度（业务方实际只用一家——丰茂物流），
 *     销售侧因为多车多供应商混合，原本只记录车牌不细化承运单位；
 *   - 这里把 carrier 设为可选字段，便于历史数据兼容（旧数据没有此字段时
 *     渲染为空），新增 / 导入时统一带上。
 */
interface TransportRecord {
  date: string      // 装车日期
  carrier?: string  // 承运单位（如：丰茂物流）
  vehicleNo: string // 承运车牌
  driver: string    // 司机姓名
  idCard: string    // 司机身份证
  qty: number       // 运输数量（吨）
  price: number     // 运输单价（元/吨，0 代表本次免运费 / 未结算）
  remark?: string   // 包装方式 / 计费说明
}

/** 接收记录：我方现场过磅签收 */
interface ReceiptRecord {
  date: string      // 接收日期
  unit: string      // 接收 / 使用单位
  receiver: string  // 接收人姓名（工 / 科长 / 总）
  weighNo: string   // 过磅单号
  qty: number       // 实际接收数量（吨）
  price: number     // 接收单价（元/吨）
  amount: number    // 接收金额（元，= qty × price）
  weighDiff: number // 磅差（接收 − 发货，吨）；正 = 我方多收，负 = 我方少收
  remark?: string   // 备注
}

  /** 开票记录：开具增值税专用 / 普通发票 */
interface InvoiceRecord {
  date: string      // 开票日期
  invoiceNo: string // 发票号码（20 位）
  qty: number       // 开票数量（吨）
  price: number     // 开票单价（元/吨）
  amount: number    // 开票金额（元）
  receiver: string  // 收票人 / 收票邮箱（原始单据上的描述）
  delivered: boolean// 是否已经收到供应商发票
  remark?: string   // 备注
}

/** 资金支付记录：我方付款流水 */
interface PaymentRecord {
  date: string      // 付款日期
  amount: number    // 付款金额（元）
  remark?: string   // 备注（预付 / 尾款 / 部分付款）
}

/** 采购合同主体 */
interface Contract {
  id: string                       // 唯一标识
  groupName: string                // 集团名称
  region: string                   // 供货来源区域（海南 / 广西 / 广东 ...）
  factoryName: string              // 供应商工厂名称
  contractNo: string               // 合同编号（"" 表示散单 / 口头协议）
  contractDate: string             // 合同签订日期（YYYY-MM-DD）
  contractQty: number              // 合同数量（吨）
  contractPrice: number            // 合同单价（元/吨）
  shipments: ShipmentRecord[]      // 发货明细
  transports: TransportRecord[]    // 运输明细
  receipts: ReceiptRecord[]        // 实际接收明细
  invoices: InvoiceRecord[]        // 开票明细
  payments: PaymentRecord[]        // 资金支付明细
  remark?: string                  // 合同级备注
}

/**
 * 解析"收票人"字段（如 "电子QQ邮箱455874531"）
 * 业务上原始单据写法不规范，这里规整为 { type, label, contact } 结构，
 * 便于在表格里用图标 + 文本两段式展示，避免一长串拥挤
 *
 * @param raw 原始字符串
 * @returns 解析后的对象：type 为类别标签，label 主体姓名/邮箱前缀，contact 为可点击号码
 */
function parseReceiver(raw: string): { type: 'email' | 'person' | 'empty'; label: string; contact: string } {
  if (!raw || !raw.trim()) return { type: 'empty', label: '', contact: '' }
  const text = raw.trim()
  // 匹配 "电子(QQ)?邮箱xxxxx" / "电子邮箱xxxxx"
  const m = text.match(/^(电子QQ?邮箱|电子邮箱|邮箱)\s*([\w.\-@]+)/)
  if (m) {
    const num = m[2]
    // 纯数字推断为 QQ 邮箱
    const contact = /^\d+$/.test(num) ? `${num}@qq.com` : num
    return { type: 'email', label: '电子邮箱', contact }
  }
  return { type: 'person', label: text, contact: '' }
}

// ===========================================================
// 模拟数据（取自真实跟踪表）
// -----------------------------------------------------------
// 使用 useContractStore 把整份合同数据提升到模块级单例（详细动机见
// SalesContracts.vue 同处注释）。列表页 / 详情页两个路由共享同一份
// 合同 ref，任意一处的增删改实时联动，杜绝数据漂移。
// ===========================================================
const contracts = useContractStore<Contract>('guangwei-purchase', () => [
  // ===========================================================================
  // c-001 主合同：瓮福国际贸易股份有限公司 — 500 吨 @ 6400 元/吨
  // 数据来源：用户提供的采购台账截图（图二 + 图四）
  //   · 合同号 WFL-X-GZ-PPA-GW-20251030-02
  //   · 12 笔发货，分别从「瓮福」「开磷」两个起运点出库
  //   · 承运统一为丰茂物流，司机 / 身份证 / 车牌为图四原始数据
  //   · 全部到货 → 广为仓库 → 卢总 签收
  // ===========================================================================
  {
    id: 'c-001',
    groupName: '瓮福国际贸易股份有限公司',
    region: '贵州',
    factoryName: '瓮福（集团）有限责任公司',
    contractNo: 'WFL-X-GZ-PPA-GW-20251030-02',
    contractDate: '2025-10-30',
    contractQty: 500,
    contractPrice: 6400,
    shipments: [
      { date: '2025-11-05', location: '瓮福', outNo: '', qty: 32.9, remark: '940件小桶' },
      { date: '2025-11-09', location: '瓮福', outNo: '', qty: 26.915, remark: '769桶' },
      { date: '2025-11-21', location: '开磷', outNo: '', qty: 32.025, remark: '915小桶' },
      { date: '2025-11-23', location: '开磷', outNo: '', qty: 32.025 },
      { date: '2025-12-01', location: '瓮福', outNo: '', qty: 32.48, remark: '928桶' },
      { date: '2025-12-10', location: '瓮福', outNo: '', qty: 32.48 },
      { date: '2026-01-07', location: '瓮福', outNo: '', qty: 31.99, remark: '915件小桶' },
      { date: '2026-01-10', location: '瓮福', outNo: '', qty: 32.9, remark: '940件小桶' },
      { date: '2026-01-29', location: '瓮福', outNo: '', qty: 29.64 },
      { date: '2026-02-27', location: '瓮福', outNo: '', qty: 29.64 },
      { date: '2026-03-10', location: '瓮福', outNo: '', qty: 31.66 },
      { date: '2026-04-01', location: '瓮福', outNo: '', qty: 30 }
    ],
    transports: [
      // 全部 丰茂物流 承运，与图四数据一一对应
      { date: '2025-11-06', carrier: '丰茂物流', vehicleNo: '桂M60567', driver: '危声林', idCard: '522724198110301058', qty: 32.9, price: 0, remark: '940件小桶' },
      { date: '2025-11-10', carrier: '丰茂物流', vehicleNo: '贵H44167', driver: '罗绍平', idCard: '52270119880901375X', qty: 26.915, price: 0, remark: '769桶' },
      { date: '2025-11-22', carrier: '丰茂物流', vehicleNo: '贵E97813', driver: '王思书', idCard: '522328198102023215', qty: 32.025, price: 0, remark: '915小桶' },
      { date: '2025-11-24', carrier: '丰茂物流', vehicleNo: '贵H33421', driver: '吴儒海', idCard: '522635198709290010', qty: 32.025, price: 0 },
      { date: '2025-12-10', carrier: '丰茂物流', vehicleNo: '贵H39972', driver: '甘文勋', idCard: '522635199211250411', qty: 32.48, price: 0, remark: '928桶' },
      { date: '2025-12-11', carrier: '丰茂物流', vehicleNo: '川E62075', driver: '王云华', idCard: '522502197411133357', qty: 32.48, price: 0, remark: '928桶' },
      { date: '2026-01-08', carrier: '丰茂物流', vehicleNo: '桂M60567', driver: '危声林', idCard: '522724198110301058', qty: 31.99, price: 0, remark: '915件小桶' },
      { date: '2026-01-11', carrier: '丰茂物流', vehicleNo: '贵H43927', driver: '龙志超', idCard: '522601198111053017', qty: 32.9, price: 0, remark: '940件小桶' },
      { date: '2026-01-29', carrier: '丰茂物流', vehicleNo: '贵JB9994', driver: '邱跃武', idCard: '522724197501043135', qty: 29.64, price: 0 },
      { date: '2026-02-27', carrier: '丰茂物流', vehicleNo: '贵JA5713', driver: '兰忠成', idCard: '522724197607290214', qty: 29.64, price: 0 },
      { date: '2026-03-10', carrier: '丰茂物流', vehicleNo: '贵JB5766', driver: '陆景波', idCard: '452725197706260799', qty: 31.66, price: 0, remark: '与广为仓库合车' },
      { date: '2026-04-01', carrier: '丰茂物流', vehicleNo: '贵JB7828', driver: '闭开国', idCard: '452725198501020593', qty: 30, price: 0 }
    ],
    receipts: [
      // 全部到货 广为仓库，由卢总签收；磅差 0
      { date: '2025-11-06', unit: '广为仓库', receiver: '卢总', weighNo: '', qty: 32.9, price: 6400, amount: 210560, weighDiff: 0, remark: '940件小桶' },
      { date: '2025-11-10', unit: '广为仓库', receiver: '卢总', weighNo: '', qty: 26.915, price: 6400, amount: 172256, weighDiff: 0, remark: '769桶' },
      { date: '2025-11-22', unit: '广为仓库', receiver: '卢总', weighNo: '', qty: 32.025, price: 6400, amount: 204960, weighDiff: 0, remark: '915小桶' },
      { date: '2025-11-24', unit: '广为仓库', receiver: '卢总', weighNo: '', qty: 32.025, price: 6400, amount: 204960, weighDiff: 0 },
      { date: '2025-12-10', unit: '广为仓库', receiver: '卢总', weighNo: '', qty: 32.48, price: 6400, amount: 207872, weighDiff: 0, remark: '928桶' },
      { date: '2025-12-11', unit: '广为仓库', receiver: '卢总', weighNo: '', qty: 32.48, price: 6400, amount: 207872, weighDiff: 0, remark: '928桶' },
      { date: '2026-01-08', unit: '广为仓库', receiver: '卢总', weighNo: '', qty: 31.99, price: 6400, amount: 204736, weighDiff: 0, remark: '915件小桶' },
      { date: '2026-01-11', unit: '广为仓库', receiver: '卢总', weighNo: '', qty: 32.9, price: 6400, amount: 210560, weighDiff: 0, remark: '940件小桶' },
      { date: '2026-01-29', unit: '广为仓库', receiver: '卢总', weighNo: '', qty: 29.64, price: 6400, amount: 189696, weighDiff: 0 },
      { date: '2026-02-27', unit: '广为仓库', receiver: '卢总', weighNo: '', qty: 29.64, price: 6400, amount: 189696, weighDiff: 0 },
      { date: '2026-03-10', unit: '广为仓库', receiver: '卢总', weighNo: '', qty: 12.23, price: 6400, amount: 78272, weighDiff: 0, remark: '与广为仓库合车' },
      { date: '2026-04-01', unit: '广为仓库', receiver: '卢总', weighNo: '', qty: 30, price: 6400, amount: 192000, weighDiff: 0 }
    ],
    invoices: [],
    payments: [],
    remark: '合同 500 吨主单：12 批次累计到货约 384 吨；运输统一委托丰茂物流；剩余配额按月度计划继��供��。'
  },

  // ===========================================================================
  // c-002 续签合同：瓮福国际贸易股份有限公司 — 350 吨 @ 6400 元/吨
  //   · 合同号 WFI-X-GZ-GW-20251030-04（图二第 126 行）
  //   · 本合同已有 1 批 29.64 吨发货并签收
  // ===========================================================================
  {
    id: 'c-002',
    groupName: '瓮福国际贸易股份有限公司',
    region: '贵州',
    factoryName: '瓮福（集团）有限责任公司',
    contractNo: 'WFI-X-GZ-GW-20251030-04',
    contractDate: '2025-10-30',
    contractQty: 350,
    contractPrice: 6400,
    shipments: [
      { date: '2026-04-15', location: '瓮福', outNo: '', qty: 10.32, remark: '下香山糖厂单拉回广为厂' }
    ],
    transports: [
      { date: '2026-04-15', carrier: '丰茂物流', vehicleNo: '贵JA1502', driver: '李井明', idCard: '522724198512180017', qty: 10.32, price: 0, remark: '下香山糖厂单拉回广为厂' }
    ],
    receipts: [
      { date: '2026-04-15', unit: '广为仓库', receiver: '卢总', weighNo: '', qty: 10.32, price: 6400, amount: 66048, weighDiff: -0.32, remark: '下香山糖厂拉回广为厂' }
    ],
    invoices: [],
    payments: [],
    remark: '新签 350 吨合同，首批 10.32 吨已到货，存在 0.32 吨磅差待与供应商核对。'
  },

  // ===========================================================================
  // c-003 开磷集团 — 100 吨 @ 6450 元/吨（演示双供应商对比）
  // ===========================================================================
  {
    id: 'c-003',
    groupName: '开磷集团',
    region: '贵州',
    factoryName: '开磷新型��肥有限责任公司',
    contractNo: 'KL-PPA-2025-088',
    contractDate: '2025-12-15',
    contractQty: 100,
    contractPrice: 6450,
    shipments: [
      { date: '2025-12-20', location: '开磷', outNo: 'KL20251220', qty: 33.2, remark: '950件小桶' },
      { date: '2026-01-15', location: '开磷', outNo: 'KL20260115', qty: 33.1, remark: '945件小桶' },
      { date: '2026-02-20', location: '开磷', outNo: 'KL20260220', qty: 32.85, remark: '938件小桶' }
    ],
    transports: [
      { date: '2025-12-20', carrier: '丰茂物流', vehicleNo: '贵GA8866', driver: '陈福海', idCard: '522521198403126633', qty: 33.2, price: 0 },
      { date: '2026-01-15', carrier: '丰茂物流', vehicleNo: '贵GB1234', driver: '张志强', idCard: '522521198512137711', qty: 33.1, price: 0 },
      { date: '2026-02-20', carrier: '丰茂物流', vehicleNo: '贵GA8866', driver: '陈福海', idCard: '522521198403126633', qty: 32.85, price: 0 }
    ],
    receipts: [
      { date: '2025-12-21', unit: '广为仓库', receiver: '卢总', weighNo: '2026000088', qty: 33.18, price: 6450, amount: 214011, weighDiff: -0.02 },
      { date: '2026-01-16', unit: '广为仓库', receiver: '卢总', weighNo: '2026000142', qty: 33.1, price: 6450, amount: 213495, weighDiff: 0 },
      { date: '2026-02-21', unit: '广为仓库', receiver: '卢总', weighNo: '2026000219', qty: 32.85, price: 6450, amount: 211883, weighDiff: 0 }
    ],
    invoices: [
      { date: '2026-01-05', invoiceNo: '25522000000089371122', qty: 33.18, price: 6450, amount: 214011, receiver: '采购部', delivered: true },
      { date: '2026-02-01', invoiceNo: '26522000000012883476', qty: 33.1, price: 6450, amount: 213495, receiver: '采购部', delivered: true }
    ],
    payments: [
      { date: '2026-01-10', amount: 214011, remark: '首批货款' },
      { date: '2026-02-10', amount: 213495, remark: '第二批货款' }
    ],
    remark: '开磷新型矿肥首单：已开发票 2 张 / 已付款 2 笔，第三批待付。'
  },

  // ===========================================================================
  // c-004 散单：海化集团 — 30 吨临时补货（无正式合同号）
  // ===========================================================================
  {
    id: 'c-004',
    groupName: '海化集团',
    region: '云南',
    factoryName: '云南云天化股份',
    contractNo: '',
    contractDate: '2026-03-01',
    contractQty: 30,
    contractPrice: 6500,
    shipments: [
      { date: '2026-03-05', location: '云天化', outNo: '', qty: 28.6 }
    ],
    transports: [
      { date: '2026-03-05', carrier: '丰茂物流', vehicleNo: '云A12345', driver: '周建国', idCard: '530102197506159311', qty: 28.6, price: 320, remark: '320元/吨' }
    ],
    receipts: [
      { date: '2026-03-08', unit: '广为仓库', receiver: '卢总', weighNo: '2026000301', qty: 28.55, price: 6500, amount: 185575, weighDiff: -0.05, remark: '临时补货' }
    ],
    invoices: [],
    payments: [],
    remark: '无合同号散单：临时补货 28.6 吨，已签收待开票。'
  }
])
// ===========================================================
// 派生 / 工具函数
// -----------------------------------------------------------
// 这一组函数都是"纯函数"：输入一份合同，输出聚合后的统计值
// 命名约定：xxxQty 表示数量(吨)，xxxAmount / xxxTotal 表示金额(元)
// ===========================================================

/**
 * 数字格式化：
 *  - 1000 及以上使用 zh-CN 千分位（含中文千位符习惯）
 *  - 否则保留最多 3 位小数，避免出现"100.000"等冗余 0
 */
function formatNum(n: number): string {
  if (n === null || n === undefined || isNaN(n)) return '0'
  if (Math.abs(n) >= 1000) return n.toLocaleString('zh-CN', { maximumFractionDigits: 3 })
  return Number(n.toFixed(3)).toString()
}

/** 已发货数量（合计） */
const shipQty = (c: Contract) => c.shipments.reduce((s, r) => s + (r.qty || 0), 0)
/** 已运输数量（合计） */
const transportQty = (c: Contract) => c.transports.reduce((s, r) => s + (r.qty || 0), 0)
/** 已接收数量（合计） */
const receiptQty = (c: Contract) => c.receipts.reduce((s, r) => s + (r.qty || 0), 0)
/** 已接收金额（合计） */
const receiptAmount = (c: Contract) => c.receipts.reduce((s, r) => s + (r.amount || 0), 0)
/** 已开票数量（合计） */
const invoiceQty = (c: Contract) => c.invoices.reduce((s, r) => s + (r.qty || 0), 0)
/** 已开票金额（合计） */
const invoiceAmount = (c: Contract) => c.invoices.reduce((s, r) => s + (r.amount || 0), 0)
/** 累计付款金额（合计） */
const paymentTotal = (c: Contract) => c.payments.reduce((s, r) => s + (r.amount || 0), 0)

/**
 * 付款率：累计付款 ÷ 已开票金额，限制 0–100
 * 没有开过票时付款率定义为 0
 */
function payRate(c: Contract): number {
  const inv = invoiceAmount(c)
  if (!inv) return 0
  return Math.min(100, (paymentTotal(c) / inv) * 100)
}

/**
 * 合同执行状态判定（带优先级）：
 *  - 发货量 > 合同量 × 105%  → 超量发货（红色高亮）
 *  - 发货量 = 0              → 未启动
 *  - 发货量 < 合同量 × 99%   → 执行中
 *  - 开票量 < 发货量 × 95%   → 待开票（提醒补开发票）
 *  - 开票金额 > 0 且 付款 < 开票 × 99% → 未付款
 *  - 其余                    → 已完成
 */
function statusOf(c: Contract): { text: string; type: 'success' | 'warning' | 'danger' | 'primary' | 'info' } {
  const ship = shipQty(c)
  const inv = invoiceQty(c)
  const pay = paymentTotal(c)
  const invAmt = invoiceAmount(c)
  if (ship > c.contractQty * 1.05) return { text: '超量发货', type: 'danger' }
  if (ship === 0) return { text: '未启动', type: 'info' }
  if (ship < c.contractQty * 0.99) return { text: '执行中', type: 'primary' }
  if (inv < ship * 0.95) return { text: '待开票', type: 'warning' }
  if (invAmt > 0 && pay < invAmt * 0.99) return { text: '待付款', type: 'warning' }
  return { text: '已完成', type: 'success' }
}

// ===========================================================
// 筛选 & 分页
// -----------------------------------------------------------
// filters：所有筛选条件（基础 + 进阶）
// viewMode：表格上方的快速视图切换（全部 / 本月活跃 / 异常追踪）
// page：当前分页页码及每页大小
// ===========================================================
const filters = reactive({
  // 基础筛选
  keyword: '',                              // 全文模糊关键字（合同号 / 集团 / 工厂 / 发票号 / 司机姓名）
  group: '',                                // 集团名称
  factory: '',                              // 工厂名称
  region: '',                               // 供货来源区域（海南 / 广西 / 广东 ...）
  status: '',                               // 合同执行状态
  dateRange: [] as string[] | null,         // 合同日期区间
  // 进阶筛选
  payStatus: '' as '' | 'settled' | 'partial' | 'unpaid' | 'no-invoice', // 付款状态
  qtyMin: undefined as number | undefined,  // 合同数量下限（吨）
  qtyMax: undefined as number | undefined,  // 合同数量上限（吨）
  priceMin: undefined as number | undefined,// 合同单价下限（元/吨）
  priceMax: undefined as number | undefined,// 合同单价上限（元/吨）
  onlyWeighDiff: false,                     // 仅显示存在磅差的合同
  onlyUninvoiced: false,                    // 仅显示有未开票数量的合同
  onlyRemark: false                         // 仅显示带备注的合同
})

const viewMode = ref<'all' | 'recent' | 'abnormal'>('all')

/**
 * 流水视图入库行的「查看合同」回调
 * ---------------------------------------------------------------
 * 入库行来源于本页采购合同的 receipts 子表，因此只需根据 id 找到
 * 对应 Contract 并复用 openDrawer 抽屉，保持与表格内"详情"按钮
 * 完全一致的交互（路由跳转 / TagsView 标签追加 / 抽屉编辑能力）。
 *
 * @param id 来源采购合同的 id
 */
function handleOpenPurchaseFromFlow(id: string) {
  const target = contracts.value.find((c) => c.id === id)
  if (!target) {
    ElMessage.warning('未找到来源合同，可能已被删除')
    return
  }
  openDrawer(target)
}
const page = reactive({ currentPage: 1, pageSize: 10 })

// ===========================================================
// 表格滚动高度自适应
// -----------------------------------------------------------
// el-table 设置 max-height 后会自动启用：
//   1) 表头吸顶固定，body 区域纵向滚动
//   2) 列宽总和超出容器时，body 区域自动出现横向滚动条
// 这里根据窗口高度动态计算，确保不同分辨率下都有最佳可视区
// ===========================================================
/** 当前窗口高度（响应式，随 resize 更新） */
const viewportHeight = ref(typeof window !== 'undefined' ? window.innerHeight : 900)

// ===========================================================
// 全屏表格模式（Excel 风格）
// -----------------------------------------------------------
// 设计目标：
//   1) 表格占据整个浏览器视口，最大化数据可视区
//   2) 上方保留全部筛选项（关键字 / 维度 / 区间 / 异常筛选 / 状态等）
//   3) ESC 键退出，避免用户被困在全屏视图中
//   4) 不复制 DOM —— 仅通过 :class 切换，让现有筛选状态、表格事件等无感衔接
// ===========================================================
/** 是否处于全屏表格模式 */
const isFullscreen = ref(false)

/** 切换全屏模式 */
function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
  // 进入全屏时锁定 body 滚动，避免背景滚动条与全屏表格滚动条同时出现
  document.body.style.overflow = isFullscreen.value ? 'hidden' : ''
}

/** ESC 键退出全屏 */
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isFullscreen.value) {
    toggleFullscreen()
  }
}

/**
 * 主表格最大高度：
 * - 普通模式：视口高度 - 顶部页头/KPI/工具条/分页综合占用（约 420px）
 * - 全屏模式：视口高度 - 仅"筛选栏 + 表卡片 padding + 分页"（约 240px）
 * 最小值 420px 兜底极小屏幕。
 */
const tableMaxHeight = computed(() => {
  const reserved = isFullscreen.value ? 240 : 420
  return Math.max(420, viewportHeight.value - reserved)
})

/** 窗口尺寸变化时同步更新视口高度 */
function handleResize() {
  viewportHeight.value = window.innerHeight
}

/**
 * 处理从看板卡片下钻回来时携带的 openId
 * --------------------------------------------------------------------
 * 外部入口（如出库流水页 InventoryFlow）跳转回主表时附带 query.openId，
 * 这里负责查找对应合同并自动打开详情抽屉；处理完成后立即清空 query
 * 以避免下一次手动进入页面时被遗留参数误触发。
 */
function consumeOpenIdFromQuery() {
  const openId = route.query.openId
  if (typeof openId !== 'string' || !openId) return
  const target = contracts.value.find(c => c.id === openId)
  if (target) {
    // 看板返回中转：清理 openId 后用本地 openDrawer 打开全屏抽屉
    // —— 与行内"详情"按钮路径完全一致，且不再产生新 TagsView 标签。
    const cleaned = { ...route.query }
    delete cleaned.openId
    router.replace({ name: 'GuangweiWarehouse', query: cleaned })
    openDrawer(target)
  } else {
    ElMessage.warning('未找到对应合同，可能已被删除或筛选条件不同')
    router.replace({ name: 'GuangweiWarehouse' })
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  window.addEventListener('keydown', handleKeydown)
  consumeOpenIdFromQuery()
  // 直接以 detail 路由 URL 进入 / 浏览器刷新：onMounted 早于任何 watch，
  // 主动拉一次详情态以避免首屏空白。
  syncDetailFromRoute()
})

// keep-alive：TagsView 在列表 / 多个详情标签之间切换时组件不重新 mount，
// 但 onActivated 会触发，再次同步详情态。
onActivated(() => {
  syncDetailFromRoute()
})

watch(() => route.query.openId, (v) => {
  if (v) consumeOpenIdFromQuery()
})

// 浏览器前进 / 后退、TagsView 切回、外部链接打开均会改变 route，
// 这里集中一处 watch 把视图状态拉齐路由真相。
watch(
  () => [route.name, route.params.id] as const,
  () => syncDetailFromRoute()
)

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('keydown', handleKeydown)
  // 组件卸载时务必恢复 body 滚动，避免路由切走后页面"卡住"
  document.body.style.overflow = ''
})

// ============= 下拉枚举（基于真实数据动态生成，避免硬编码） =============
const groupOptions = computed(() => Array.from(new Set(contracts.value.map((c) => c.groupName).filter(Boolean))))
const factoryOptions = computed(() => Array.from(new Set(contracts.value.map((c) => c.factoryName).filter(Boolean))))
const regionOptions = computed(() => Array.from(new Set(contracts.value.map((c) => c.region).filter(Boolean))))

/**
 * 计算单个合同的付款状态分类，用于"付款状态"筛选项
 * - settled  ：已结清（付款 >= 开票金额 * 99%）
 * - partial  ：部分付款（已有部分付款但尚未结清）
 * - unpaid   ：已���票但���未付款
 * - no-invoice：还没开过票
 */
function payStatusOf(c: Contract): 'settled' | 'partial' | 'unpaid' | 'no-invoice' {
  const inv = invoiceAmount(c)
  const pay = paymentTotal(c)
  if (inv <= 0) return 'no-invoice'
  if (pay >= inv * 0.99) return 'settled'
  if (pay > 0) return 'partial'
  return 'unpaid'
}

/** 是否含异常磅差（任意接收记录磅差不为 0） */
function hasWeighDiff(c: Contract): boolean {
  return c.receipts.some((r) => Math.abs(r.weighDiff || 0) > 0.001)
}

/** 是否含未开票数量（接收数量 > 开票数量） */
function hasUninvoiced(c: Contract): boolean {
  return receiptQty(c) - invoiceQty(c) > 0.001
}

/**
 * 主筛选逻辑：依次应用 关键字 → 维度过滤 → 区间过滤 → 异常筛选 → 快捷视图
 */
const filteredContracts = computed(() => {
  const kw = filters.keyword.trim().toLowerCase()
  const [start, end] = (filters.dateRange ?? []) as string[]
  return contracts.value.filter((c) => {
    // —— 关键字（扩展到发票号、司机姓名也参与匹配） ——
    if (kw) {
      const hay = [
        c.contractNo, c.groupName, c.factoryName, c.region,
        ...c.invoices.map((i) => i.invoiceNo),
        ...c.transports.map((t) => t.driver)
      ].filter(Boolean).join(' ').toLowerCase()
      if (!hay.includes(kw)) return false
    }
    // —— 维度筛选 ——
    if (filters.group && c.groupName !== filters.group) return false
    if (filters.factory && c.factoryName !== filters.factory) return false
    if (filters.region && c.region !== filters.region) return false
    if (filters.status) {
      const s = statusOf(c).text
      const map: Record<string, string> = {
        ongoing: '执行中',
        done: '已完成',
        'pending-invoice': '待开票',
        'pending-payment': '待付款',
        overshipped: '超量发货',
        'not-started': '未启动'
      }
      if (s !== map[filters.status]) return false
    }
    // —— 合同日期区间 ——
    if (start && c.contractDate < start) return false
    if (end && c.contractDate > end) return false
    // —— 数量 / 单价区间 ——
    if (filters.qtyMin !== undefined && filters.qtyMin !== null && c.contractQty < filters.qtyMin) return false
    if (filters.qtyMax !== undefined && filters.qtyMax !== null && c.contractQty > filters.qtyMax) return false
    if (filters.priceMin !== undefined && filters.priceMin !== null && c.contractPrice < filters.priceMin) return false
    if (filters.priceMax !== undefined && filters.priceMax !== null && c.contractPrice > filters.priceMax) return false
    // —— 付款状态 ——
    if (filters.payStatus && payStatusOf(c) !== filters.payStatus) return false
    // —— 业务异常勾选 ——
    if (filters.onlyWeighDiff && !hasWeighDiff(c)) return false
    if (filters.onlyUninvoiced && !hasUninvoiced(c)) return false
    if (filters.onlyRemark && !(c.remark && c.remark.trim())) return false
    // —— 顶部快捷视图 ——
    if (viewMode.value === 'recent') {
      const month = new Date().toISOString().slice(0, 7)
      const hit = [...c.shipments, ...c.invoices, ...c.payments].some((r: any) => (r.date || '').startsWith(month))
      if (!hit) return false
    } else if (viewMode.value === 'abnormal') {
      const s = statusOf(c).text
      if (!['超量发货', '待开票', '待付款'].includes(s)) return false
    }
    return true
  })
})

/**
 * 已启用筛选项数量，展示在工具条右侧给用��视觉反馈
 */
const activeFilterCount = computed(() => {
  let n = 0
  if (filters.keyword.trim()) n++
  if (filters.group) n++
  if (filters.factory) n++
  if (filters.region) n++
  if (filters.status) n++
  if (filters.dateRange && filters.dateRange.length === 2) n++
  if (filters.payStatus) n++
  if (filters.qtyMin !== undefined && filters.qtyMin !== null) n++
  if (filters.qtyMax !== undefined && filters.qtyMax !== null) n++
  if (filters.priceMin !== undefined && filters.priceMin !== null) n++
  if (filters.priceMax !== undefined && filters.priceMax !== null) n++
  if (filters.onlyWeighDiff) n++
  if (filters.onlyUninvoiced) n++
  if (filters.onlyRemark) n++
  return n
})

const pagedContracts = computed(() => {
  const start = (page.currentPage - 1) * page.pageSize
  return filteredContracts.value.slice(start, start + page.pageSize)
})

watch(filteredContracts, () => { page.currentPage = 1 })

// ===========================================================
// 扁平化：把每份合同按 max(shipments,transports,receipts,invoices,payments)
// 展开成多行，用于多级表头表格的展示
// ===========================================================
interface FlatRow {
  contract: Contract
  contractSeq: number            // 当前页内该合同的序号
  contractRowIdx: number         // 此合同的第几行（0-based）
  contractRowSize: number        // 此合同总行数
  isContractFirst: boolean       // 是否是该合同的首行（用于合并）
  shipment?: ShipmentRecord
  shipIdx: number
  transport?: TransportRecord
  transportIdx: number
  receipt?: ReceiptRecord
  receiptIdx: number
  invoice?: InvoiceRecord
  invoiceIdx: number
  payment?: PaymentRecord
  paymentIdx: number
}

function buildFlatRows(list: Contract[]): FlatRow[] {
  const rows: FlatRow[] = []
  list.forEach((c, ci) => {
    const size = Math.max(
      1,
      c.shipments.length,
      c.transports.length,
      c.receipts.length,
      c.invoices.length,
      c.payments.length
    )
    for (let i = 0; i < size; i++) {
      rows.push({
        contract: c,
        contractSeq: ci + 1,
        contractRowIdx: i,
        contractRowSize: size,
        isContractFirst: i === 0,
        shipment: c.shipments[i],
        shipIdx: i,
        transport: c.transports[i],
        transportIdx: i,
        receipt: c.receipts[i],
        receiptIdx: i,
        invoice: c.invoices[i],
        invoiceIdx: i,
        payment: c.payments[i],
        paymentIdx: i
      })
    }
  })
  return rows
}

const pagedFlatRows = computed(() => buildFlatRows(pagedContracts.value))

/**
 * span-method：让"供应商名称"和"合同"两组列在同一合同内合并，
 * 同时让"资金支付"组的"付款率"列和"操作"列也合并到合同首行。
 * 注意 columnIndex 取决于实际列出现顺序（fixed=right 不影响主表索引）。
 *
 * 列布局（按 DOM 顺序）：
 *  0..2  供应商名称：集团 / 区域 / 工厂
 *  3..7  合同：序号 / 日期 / 合同编号 / 数量 / 单价
 *  8..13 实际发货
 *  14..21 运输
 *  22..31 实际接收
 *  32..41 开票情况
 *  42..45 资金支付：序号 / 日期 / 金额 / 付款率(合并)
 *  46    操作（合并）
 */
const MERGED_COLUMNS = new Set<number>([
  0, 1, 2,        // 供应商
  3, 4, 5, 6, 7,  // 合同
  45,             // 资金支付率
  46              // 操作
])

function spanMethod({ row, columnIndex }: { row: FlatRow; columnIndex: number }) {
  if (MERGED_COLUMNS.has(columnIndex)) {
    if (row.isContractFirst) return { rowspan: row.contractRowSize, colspan: 1 }
    return { rowspan: 0, colspan: 0 }
  }
  return { rowspan: 1, colspan: 1 }
}

function flatRowClass({ row, rowIndex }: { row: FlatRow; rowIndex: number }): string {
  const cls: string[] = []
  // 合同分组斑马
  const groupIdx = row.contractSeq % 2 === 0 ? 'cg-even' : 'cg-odd'
  cls.push(groupIdx)
  // 合同分隔线
  if (row.contractRowIdx === row.contractRowSize - 1) cls.push('cg-last')
  // 异常合同高亮
  const s = statusOf(row.contract).text
  if (s === '超量发货') cls.push('row-danger')
  else if (s === '待开票' || s === '待付款') cls.push('row-warn')
  if (rowIndex < 0) cls.push('')
  return cls.join(' ')
}

function flatCellClass({ row }: { row: FlatRow; columnIndex: number }): string {
  // 合同最后一行底边加粗
  if (row.contractRowIdx === row.contractRowSize - 1) return 'cell-contract-end'
  return ''
}

function headerCellClass({ rowIndex, columnIndex }: { rowIndex: number; columnIndex: number }): string {
  // 第一行（分组表头）按组着色
  if (rowIndex !== 0) return ''
  if (columnIndex === 0) return 'hdr-group hdr-customer'
  if (columnIndex === 1) return 'hdr-group hdr-contract'
  if (columnIndex === 2) return 'hdr-group hdr-ship'
  if (columnIndex === 3) return 'hdr-group hdr-transport'
  if (columnIndex === 4) return 'hdr-group hdr-receipt'
  if (columnIndex === 5) return 'hdr-group hdr-invoice'
  if (columnIndex === 6) return 'hdr-group hdr-payment'
  if (columnIndex === 7) return 'hdr-group hdr-action'
  return ''
}

function removeContractById(id: string) {
  contracts.value = contracts.value.filter((c) => c.id !== id)
  ElMessage.success('已删除该合同')
}

// ===========================================================
// 数据看板抽屉（采购合同）
// -----------------------------------------------------------
// 演进路线：
//   v1 浮层 Drawer：与详情 Drawer 同时出现导致 z-index / 滚动冲突；
//   v2 独立路由页 + sessionStorage 快照中转：进出看板会新增 TagsView
//      标签且依赖会话存储，看板 / 详情两条跳转通道维护成本高；
//   v3 当前实现：使用通用 BoardDrawer 组件，由本表持有 visible + 快照
//      两个本地态，与"行内点击详情 → 全屏抽屉"保持同款交互。
// 这样做的好处：
//   a) 看板与详情共用同一种"全屏抽屉"视觉语言，菜单栏保持干净；
//   b) 不再依赖 sessionStorage，避免隐私模式 / 配额超限风险；
//   c) 销售 / 采购两侧共用同一份组件，仅文案差异由 prop 切换。
// ===========================================================

/** 看板抽屉可见性（仅本表持有） */
const boardDrawerVisible = ref(false)
/** 看板抽屉快照：openSummaryMode 时构造，关闭抽屉时保留以便重新打开仍可见 */
const boardSnapshot = ref<BoardSnapshot | null>(null)

/**
 * 构造看板快照数据
 * --------------------------------------------------------------------
 * 仅抽取看板渲染所需字段，避免把完整合同对象（含 5 类子记录的全部明细）
 * 灌入子组件 props 触发不必要的深响应。字段需与 BoardSnapshot 类型契约
 * 一一对应。
 *
 * @param list  待投影的合同集合（一般是 filteredContracts）
 * @returns     看板组件期望的 BoardSnapshot 结构
 */
function buildBoardSnapshot(list: Contract[]): BoardSnapshot {
  return {
    snapshotAt: new Date().toLocaleString('zh-CN', { hour12: false }),
    contracts: list.map(c => ({
      id: c.id,
      factoryName: c.factoryName,
      contractNo: c.contractNo,
      groupName: c.groupName,
      region: c.region,
      contractDate: c.contractDate,
      contractQty: c.contractQty,
      contractPrice: c.contractPrice,
      shipments: (c.shipments || []).map(s => ({ qty: s.qty })),
      invoices:  (c.invoices  || []).map(i => ({ amount: i.amount })),
      payments:  (c.payments  || []).map(p => ({ amount: p.amount }))
    }))
  }
}

/**
 * 打开看板抽屉
 * --------------------------------------------------------------------
 * 若筛选结果为空则提示并阻断（业务约定"看板看的是当前筛选结果"）；
 * 否则基于 filteredContracts 当场构造快照并打开全屏抽屉。
 */
function openSummaryMode() {
  if (!filteredContracts.value.length) {
    ElMessage.warning('当前筛选结果为空，无法打开看板视图')
    return
  }
  boardSnapshot.value = buildBoardSnapshot(filteredContracts.value)
  boardDrawerVisible.value = true
}

/**
 * 看板卡片下钻：用户点击某个合同卡片
 * --------------------------------------------------------------------
 * 关闭看板抽屉后调用 openDrawer 打开该合同的详情抽屉。两段抽屉的可见性
 * 互斥，避免重叠层级。
 */
// function onBoardCardOpen(contractId: string) {
//   const target = contracts.value.find(c => c.id === contractId)
//   if (!target) {
//     ElMessage.warning('未找到对应合同，可能已被删除')
//     return
//   }
//   boardDrawerVisible.value = false
//   openDrawer(target)
// }

/**
 * 重置全部筛选项，恢复到初始展示状态
 * - 基础维度全部清空
 * - 进阶维度（数量 / 单价区间、复选框）全部清空
 * - 快捷视图回到"全部"
 */
function resetFilters() {
  filters.keyword = ''
  filters.group = ''
  filters.factory = ''
  filters.region = ''
  filters.status = ''
  filters.dateRange = []
  filters.payStatus = ''
  filters.qtyMin = undefined
  filters.qtyMax = undefined
  filters.priceMin = undefined
  filters.priceMax = undefined
  filters.onlyWeighDiff = false
  filters.onlyUninvoiced = false
  filters.onlyRemark = false
  viewMode.value = 'all'
}

// ===========================================================
// 详情视图（全屏抽屉 · 本地态驱动）
// -----------------------------------------------------------
// 与 OrderList.vue 同构（v4 方案）：行内"详情"按钮 / 采购合同看板
// 卡片下钻 / 流水入库行跳合同，一律调用 openDrawer 设置本地
// drawerVisible=true，不再 router.push 到 GuangweiWarehouseDetail，
// 因此不会向 TagsView 追加新标签页。GuangweiWarehouseDetail 路由
// 仅保留用于"直接 URL / 历史标签刷新"等兼容场景。
// ===========================================================
const drawerVisible = ref(false)
const activeContract = ref<Contract | null>(null)
const activeTab = ref('shipments')

/** 兼容旧 URL：用户通过 GuangweiWarehouseDetail 路由直接进入时为 true。 */
const isDetailRoute = computed(() => route.name === 'GuangweiWarehouseDetail')

/**
 * 打开合同详情（全屏抽屉）
 *
 * 仅维护本地态：设置 activeContract、重置 activeTab、把抽屉
 * 可见性置 true。不再发起路由跳转 —— 避免 TagsView 标签膨胀。
 *
 * @param c  目标合同
 */
function openDrawer(c: Contract) {
  activeContract.value = c
  activeTab.value = 'shipments'
  drawerVisible.value = true
}

/**
 * 关闭详情抽屉。如果当前 URL 仍停在 Detail 路由（旧 URL 兼容场景），
 * 顺手 replace 回主列表路由，保持地址栏与视图一致。
 */
function closeDetail() {
  drawerVisible.value = false
  if (isDetailRoute.value) {
    router.replace({ name: 'GuangweiWarehouse' })
  }
}

/**
 * 根据当前路由同步详情面板状态（旧 URL 兼容专用）
 *
 * 仅在 GuangweiWarehouseDetail 路由命中时生效：找到合同 → 打开
 * 抽屉 + replace 回主列表路由（避免历史栈污染）；找不到则提示
 * 并 replace 回列表。
 */
function syncDetailFromRoute() {
  if (!isDetailRoute.value) return
  const id = route.params.id
  if (typeof id !== 'string' || !id) {
    router.replace({ name: 'GuangweiWarehouse' })
    return
  }
  const target = contracts.value.find(c => c.id === id)
  if (!target) {
    ElMessage.warning('未找到对应合同，可能已被删除')
    router.replace({ name: 'GuangweiWarehouse' })
    return
  }
  activeContract.value = target
  activeTab.value = 'shipments'
  drawerVisible.value = true
  router.replace({ name: 'GuangweiWarehouse' })
}

// ===========================================================
// 新增/编辑合同
// ===========================================================
const contractDialog = reactive({ visible: false, editing: false })
const contractFormRef = ref()
// =============================================================================
// 新增 / 编辑采购合同表单
// -----------------------------------------------------------------------------
// 字段分两层：
//   A. 合同基础信息：与 Contract 接口一一对应，编辑模式下也会用到。
//   B. 首次过程记录开关 + payload：仅新增模式有效，���定保存时是否同步生成
//      首条 shipments / transports / receipts / invoices / payments 子记录。
// -----------------------------------------------------------------------------
// 之所以把这两层都放进同一个 reactive，是为了：
//   1. 让模板里的 v-model 路径短而直观（contractForm.initialShipment.qty）；
//   2. openContractDialog 重置时只需一次 Object.assign，避免多个 ref 散落；
//   3. 在 Contract 数据���构里多出来的 enable*/initial* 字段不会被写入仓库
//      （saveContract 落库时显式只取 Contract 必需字段）。
// =============================================================================

/** 工厂默认值常量集中维护，方便后续替换为配置项 / 字典服务 */
const DEFAULT_SHIPMENT_LOCATION = '广为仓库'

/** 子表单初始空值生成器：每次打开新增对话框都生成全新对象，避免引用残留 */
function createBlankSubRecords(today: string) {
  return {
    initialShipment: { date: today, location: DEFAULT_SHIPMENT_LOCATION, outNo: '', qty: 0, remark: '' },
    initialTransport: { date: today, carrier: '丰茂物流', vehicleNo: '', driver: '', idCard: '', qty: 0, price: 0, remark: '' },
    initialReceipt: { date: today, unit: '', receiver: '', weighNo: '', qty: 0, price: 0, weighDiff: 0, remark: '' },
    initialInvoice: { date: today, invoiceNo: '', qty: 0, price: 0, receiver: '', delivered: false, remark: '' },
    initialPayment: { date: today, amount: 0, remark: '' }
  }
}

const contractForm = reactive({
  // ===== A. 合同基础信息 =====
  id: '',
  groupName: '',
  region: '',
  factoryName: '',
  contractNo: '',
  contractDate: '',
  contractQty: 0,
  contractPrice: 0,
  remark: '',
  // ===== B. 首次过程记录（开关 + payload） =====
  enableShipment: false,
  enableTransport: false,
  enableReceipt: false,
  enableInvoice: false,
  enablePayment: false,
  ...createBlankSubRecords('')
})

/**
 * 合同表单校验规则
 * 业务约束：
 *   - 集团名称、工厂名称、合同日期、合同数量为最小必填项；
 *   - 区域虽未在 Contract 接口里强制 required，但业务台账筛选高度依赖该字段，
 *     这里设为必填以保证后续报表可按区域汇总。
 */
const contractRules = {
  groupName: [{ required: true, message: '请输入集团名称', trigger: 'blur' }],
  region: [{ required: true, message: '请选择或输入区域', trigger: 'change' }],
  factoryName: [{ required: true, message: '请输入工厂名称', trigger: 'blur' }],
  contractDate: [{ required: true, message: '请选择合同日期', trigger: 'change' }],
  contractQty: [{ required: true, message: '请输入合同数量', trigger: 'blur', type: 'number', min: 0 }]
}

/**
 * 打开新增 / 编辑对话框
 * @param c 传入即进入编辑模式（拷贝合同基础���段到表单），不传则重置为全新表单
 */
function openContractDialog(c?: Contract) {
  const today = new Date().toISOString().slice(0, 10)
  if (c) {
    // 编辑模式：先重置子记录开关，再覆盖合同基础字段
    Object.assign(contractForm, {
      enableShipment: false,
      enableTransport: false,
      enableReceipt: false,
      enableInvoice: false,
      enablePayment: false,
      ...createBlankSubRecords(today),
      ...c
    })
    contractDialog.editing = true
  } else {
    Object.assign(contractForm, {
      id: '',
      groupName: '',
      region: '',
      factoryName: '',
      contractNo: '',
      contractDate: today,
      contractQty: 0,
      contractPrice: 0,
      remark: '',
      enableShipment: false,
      enableTransport: false,
      enableReceipt: false,
      enableInvoice: false,
      enablePayment: false,
      ...createBlankSubRecords(today)
    })
    contractDialog.editing = false
  }
  contractDialog.visible = true
}

/**
 * 保存合同（新增或编辑）
 * - 编辑模式：仅回写合同基础字段���绝不动现有的 shipments / transports / ...
 *   等子明细数组，防止"编辑合同抬头"操作意外清空过程记录。
 * - 新增模式：合同主体落库，并按用户勾选的"启用首次..."开关，把对应的
 *   首条子记录写入对应数组。
 */
async function saveContract() {
  await contractFormRef.value?.validate?.()

  // 抽取合同基础字段，作为 Contract 接口的合法 payload
  const baseFields = {
    id: contractForm.id,
    groupName: contractForm.groupName,
    region: contractForm.region,
    factoryName: contractForm.factoryName,
    contractNo: contractForm.contractNo,
    contractDate: contractForm.contractDate,
    contractQty: contractForm.contractQty,
    contractPrice: contractForm.contractPrice,
    remark: contractForm.remark
  }

  if (contractDialog.editing && contractForm.id) {
    const idx = contracts.value.findIndex((c) => c.id === contractForm.id)
    if (idx >= 0) {
      // 显式按字段回写，保留 shipments / transports / receipts / invoices / payments
      Object.assign(contracts.value[idx], baseFields)
    }
    ElMessage.success('合同已更新')
  } else {
    // 新增：构造完整 Contract，再按开关附加首条子记录
    const newContract: Contract = {
      ...baseFields,
      id: 'c-' + Date.now(),
      shipments: contractForm.enableShipment ? [{ ...contractForm.initialShipment }] : [],
      transports: contractForm.enableTransport ? [{ ...contractForm.initialTransport }] : [],
      receipts: contractForm.enableReceipt
        ? [{
            ...contractForm.initialReceipt,
            // 接收金额：数量 × 单价，统一计算，避���人工输入误差
            amount: (contractForm.initialReceipt.qty || 0) * (contractForm.initialReceipt.price || 0)
          }]
        : [],
      invoices: contractForm.enableInvoice
        ? [{
            ...contractForm.initialInvoice,
            // 开票金额同理由 数量 × 单价 计算
            amount: (contractForm.initialInvoice.qty || 0) * (contractForm.initialInvoice.price || 0)
          }]
        : [],
      payments: contractForm.enablePayment ? [{ ...contractForm.initialPayment }] : []
    }
    contracts.value.unshift(newContract)

    // 同步给业务人员看一下到底创建了哪些过程记录
    const extras: string[] = []
    if (contractForm.enableShipment) extras.push('发货')
    if (contractForm.enableTransport) extras.push('运输')
    if (contractForm.enableReceipt) extras.push('接收')
    if (contractForm.enableInvoice) extras.push('开票')
    if (contractForm.enablePayment) extras.push('付款')
    ElMessage.success(
      extras.length
        ? `合同已创建，同步录入：${extras.join(' / ')}`
        : '合同已创建'
    )
  }
  contractDialog.visible = false
}

// ===========================================================
// 子记录新增（发货/运输/接收/开票/付款）
// ===========================================================
type SubType = 'shipment' | 'transport' | 'receipt' | 'invoice' | 'payment'
const subDialog = reactive<{ visible: boolean; type: SubType; targetId: string }>({
  visible: false,
  type: 'shipment',
  targetId: ''
})
const subForm = reactive<any>({})
const subDialogTitle = computed(() => {
  const map: Record<SubType, string> = {
    shipment: '新增发货记录',
    transport: '新增运输记录',
    receipt: '新增接收记录',
    invoice: '新增开票记录',
    payment: '新增资金支付'
  }
  return map[subDialog.type]
})

function handleQuickAdd(type: SubType, c: Contract) {
  activeContract.value = c
  openSubDialog(type)
}

// function onQuickCommand(cmd: unknown, c: Contract) {
//   handleQuickAdd(cmd as SubType, c)
// }

/**
 * 详情抽屉 -> 编辑弹窗
 * --------------------------------------------------------------------
 * 抽屉与编辑弹窗共用屏幕中央区域，同时存在会导致 z-index 堆叠 & 焦点
 * 错乱，所以先关闭抽屉再唤起编辑弹窗。activeContract 在抽屉关闭瞬间
 * 仍是当前合同引用，可以安全传入 editContract。
 */
function editFromDrawer() {
  if (!activeContract.value) return
  // 详情独立路由下，直接在当前页打开编辑对话框（el-dialog 自带遮罩，
  // 层级关系天然清晰），无需先返回列表。
  editContract(activeContract.value)
}

/**
 * 操作列"更多"下拉的统一指令分发
 * --------------------------------------------------------------------
 * 把原来的"登记"下拉（5 个登记子项）与"删除"按钮聚合到同一个菜单，
 * 让操作列从 4 个按钮压缩到 3 个，节约列宽。
 *
 * @param cmd  下拉项的 command 值：登记类（shipment / transport /
 *             receipt / invoice / payment）或 'delete'
 * @param c    当前行对应的合同
 */
function onMoreCommand(cmd: unknown, c: Contract) {
  if (cmd === 'delete') {
    ElMessageBox.confirm(
      `确定删除合同「${c.contractNo || c.factoryName}」及其全部子记录？`,
      '删除合同',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' }
    )
      .then(() => removeContractById(c.id))
      .catch(() => { /* 用户取消，无需处理 */ })
    return
  }
  handleQuickAdd(cmd as SubType, c)
}

function openSubDialog(type: SubType) {
  subDialog.type = type
  subDialog.targetId = activeContract.value?.id || ''
  const today = new Date().toISOString().slice(0, 10)
  for (const k of Object.keys(subForm)) delete subForm[k]
  const defaults: Record<SubType, any> = {
    shipment: { date: today, location: '广为仓库', outNo: '', qty: 0, remark: '' },
    transport: { date: today, carrier: '丰茂物流', vehicleNo: '', driver: '', idCard: '', qty: 0, price: 0, remark: '' },
    receipt: { date: today, unit: '', receiver: '', weighNo: '', qty: 0, price: 0, weighDiff: 0, amount: 0, remark: '' },
    invoice: { date: today, invoiceNo: '', qty: 0, price: 0, amount: 0, receiver: '', delivered: false, remark: '' },
    payment: { date: today, amount: 0, remark: '' }
  }
  Object.assign(subForm, defaults[type])
  subDialog.visible = true
}

function saveSubRecord() {
  const target = contracts.value.find((c) => c.id === subDialog.targetId)
  if (!target) return
  const payload = { ...subForm }
    // 接收 / 开票：amount 由 qty × price 计算，避免人工录入金额出错
  if (subDialog.type === 'receipt') payload.amount = (payload.qty || 0) * (payload.price || 0)
  if (subDialog.type === 'invoice') payload.amount = (payload.qty || 0) * (payload.price || 0)
  const listKey = ({
    shipment: 'shipments',
    transport: 'transports',
    receipt: 'receipts',
    invoice: 'invoices',
    payment: 'payments'
  } as const)[subDialog.type]
  ;(target[listKey] as any[]).push(payload)
  ElMessage.success('已新增')
  subDialog.visible = false
}

// ===========================================================
// 子记录删除（带确认，避免误删）
// -----------------------------------------------------------
// 抽屉内 5 类明细表的删除按钮通过此方法统一处理：
//   1) Element Plus 的 ElMessageBox.confirm 弹出二次确认
//   2) 取消时直接吞掉 Promise reject，不在控制台报错
//   3) 删除成功后 ElMessage 反馈，保证业务可感知
// ===========================================================
type SubListKey = 'shipments' | 'transports' | 'receipts' | 'invoices' | 'payments'
async function removeSubRecord(listKey: SubListKey, index: number) {
  if (!activeContract.value) return
  try {
    await ElMessageBox.confirm('确定删除该条记录？删除后不可恢复', '删除确认', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消'
    })
    ;(activeContract.value[listKey] as any[]).splice(index, 1)
    ElMessage.success('已删除')
  } catch {
    /* 用户取消，无需处理 */
  }
}

// ===========================================================
// 导出 / 打印
// -----------------------------------------------------------
// 导出策略：基于当前 filteredContracts（即筛选 + 视图 后的结果），
// 把扁平化后的 pagedFlatRows 还原成完整列宽的明细表，让业务方
// 可以拿到 Excel 二次加工 / 上报。
// ===========================================================
/** 把单个合同展平成多行（与表格"按合同分组、子表对齐"的展示一致） */
function flattenContractForExport(c: Contract): Record<string, any>[] {
  const maxRows = Math.max(
    c.shipments.length,
    c.transports.length,
    c.receipts.length,
    c.invoices.length,
    c.payments.length,
    1
  )
  const rows: Record<string, any>[] = []
  for (let i = 0; i < maxRows; i++) {
    const sh = c.shipments[i]
    const tr = c.transports[i]
    const rc = c.receipts[i]
    const iv = c.invoices[i]
    const py = c.payments[i]
    rows.push({
      // 合同信息只在第一行写，其余行留空，模拟"合并单元格"视觉
      集团名称: i === 0 ? c.groupName : '',
      区域: i === 0 ? c.region : '',
      工厂名称: i === 0 ? c.factoryName : '',
      合同编号: i === 0 ? c.contractNo : '',
      签订日期: i === 0 ? c.contractDate : '',
      '合同数量(吨)': i === 0 ? c.contractQty : '',
      '合同单价': i === 0 ? c.contractPrice : '',
      发货日期: sh?.date ?? '',
      发货地点: sh?.location ?? '',
      出库单号: sh?.outNo ?? '',
      '发货数量(吨)': sh?.qty ?? '',
      发货备注: sh?.remark ?? '',
      运输日期: tr?.date ?? '',
      承运单位: tr?.carrier ?? '',
      承运车号: tr?.vehicleNo ?? '',
      司机姓名: tr?.driver ?? '',
      身份证号: tr?.idCard ?? '',
      '运输数量(吨)': tr?.qty ?? '',
      '运输单价(元/吨)': tr?.price ?? '',
      运输备注: tr?.remark ?? '',
      接收日期: rc?.date ?? '',
      接收单位: rc?.unit ?? '',
      接收人: rc?.receiver ?? '',
      过磅单号: rc?.weighNo ?? '',
      '接收数量(吨)': rc?.qty ?? '',
      '接收单价': rc?.price ?? '',
      '接收金额': rc?.amount ?? '',
      '磅差(吨)': rc?.weighDiff ?? '',
      接收备注: rc?.remark ?? '',
      开票日期: iv?.date ?? '',
      发票号码: iv?.invoiceNo ?? '',
      '开票数量(吨)': iv?.qty ?? '',
      '开票单价': iv?.price ?? '',
      '开票金额': iv?.amount ?? '',
      是否交付: iv == null ? '' : iv.delivered ? '是' : '否',
      付款日期: py?.date ?? '',
      '付款金额': py?.amount ?? '',
      付款备注: py?.remark ?? '',
      合同备注: i === 0 ? c.remark ?? '' : ''
    })
  }
  return rows
}

/**
 * 导出当前筛选结果为 .xlsx
 * -----------------------------------------------------------
 * 关键实现说明：
 *   1) 不使用 XLSX.writeFile —— 在 v0 预览 / iframe 等受限环境下，
 *      writeFile 内部的 saveAs polyfill 会被浏览器静默阻止下载。
 *   2) 改为 XLSX.write 生成 ArrayBuffer → Blob → a.click() 主动触发，
 *      这是兼容性最好的浏览器下载链路。
 *   3) 工作表名必须 ≤ 31 字符且不含 Excel 非法字符（: \ / ? * [ ]）。
 *   4) 全流程包 try/catch，任何异常都通过 ElMessage 反馈给业务方。
 */
function exportExcel() {
  const list = filteredContracts.value
  if (!list.length) {
    ElMessage.warning('当前筛选结果为空，无可导出数据')
    return
  }

  // 用 loading message 给用户即时���馈，避免大量数据导出时误以为按钮无响应
  const loading = ElMessage({
    message: '正在生成 Excel 文件，请稍候...',
    type: 'info',
    duration: 0
  })

  try {
    const allRows: Record<string, any>[] = []
    list.forEach((c) => allRows.push(...flattenContractForExport(c)))

    const ws = XLSX.utils.json_to_sheet(allRows)
    const wb = XLSX.utils.book_new()
    // 工作表名严格控制：Excel 限制 ≤ 31 字符且不能含特殊字符
    XLSX.utils.book_append_sheet(wb, ws, '采购合同明细')

    // 生成二进制 buffer（type: 'array' 返回 ArrayBuffer，浏览器原生支持）
    const wbArrayBuffer: ArrayBuffer = XLSX.write(wb, {
      bookType: 'xlsx',
      type: 'array',
      compression: true
    })

    // 构造 Blob 并通过临时 <a> 标签触发下载
    const blob = new Blob([wbArrayBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const fileName = `硫磺、磷酸采购合同明细_${new Date().toISOString().slice(0, 10)}.xlsx`
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = fileName
    anchor.style.display = 'none'
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    // 立即释放 ObjectURL，避免内存泄漏
    setTimeout(() => URL.revokeObjectURL(url), 100)

    loading.close()
    ElMessage.success(`已导出 ${list.length} 份合同 / ${allRows.length} 行明细`)
  } catch (err) {
    loading.close()
    // 失败时把真实错误信息显示给业务方，便于上报排查
    console.error('[exportExcel] failed:', err)
    ElMessage.error(`导出失败：${(err as Error)?.message || '未知错误'}`)
  }
}

/** 浏览器原生打印（依赖打印样式表，会自动隐藏侧边栏 / 工具按钮） */
function printTable() {
  window.print()
}

// ===========================================================================
// Excel 导入功能（多级表头宽表）
// ---------------------------------------------------------------------------
// 业务表实际结构（与提供的源表 1:1 对齐）：
//   ┌───────────────┬──────────────┬──────────────┬──────────────┬──────────────┬──────────────┬───────────┐
//   │ 供应商名称(0-2) │ 合同(3-7)    │ 实际发货量   │ 运输(14-21)  │ 实际接受     │ 开票情况     │ 资金支付   │
//   │               │              │ (8-13)       │              │ (22-31)      │ (32-41)      │ (42-45)   │
//   └───────────────┴──────────────┴──────────────┴──────────────┴──────────────┴──────────────┴───────────┘
//
// 表头共两行：
//   Row 0 — 一级分组（"供应商名称" / "合同" / ...）
//   Row 1 — 二级字段（"集团名称" / "区域" / ...）
// 数据从 Row 2 开��；同一份合同可跨多行（合同主体只在首行出现，
// 后续行只填该合同下的某条明细，例如发货第 2 次、接收第 3 次等）。
//
// 解析策略：
//   1) 按行读取（XLSX `header: 1` 模式，避免重复列名被合并）；
//   2) 当行的"合同编号"/"数量"/"单价"任一非空 → 视为合同主体行，
//      创建新 Contract 并把当前指针指向它；其他行追加到指针指向的合同；
//   3) 子行分别尝试组装 5 个 sub-record（发货/运输/接收/开票/付款），
//      若关键字段（如发货的日期+数量）均为空则跳过该 sub-record；
//   4) "开票"行的"对应合同编号"字段会覆盖默认归属，避免错位。
// ===========================================================================

/** 列定义：name 是二级表头、group 是一级分组、width 用于设置列宽 */
interface ImportColumnDef {
  key: string
  name: string
  group: string
  width?: number
}

/**
 * 业务表列结构（按实际表单顺序，严格 1:1 对齐）
 * 字段顺序绝不能动 —— 导入解析依赖列索引（rowArr[i]）。
 */
const IMPORT_COLUMNS: ImportColumnDef[] = [
  // 0-2 供应商名称
  { key: 'groupName', name: '集团名称', group: '供应商名称', width: 12 },
  { key: 'region', name: '区域', group: '供应商名称', width: 8 },
  { key: 'factoryName', name: '工厂名称', group: '供应商名称', width: 12 },
  // 3-7 合同
  { key: 'contractIdx', name: '序号', group: '合同', width: 6 },
  { key: 'contractDate', name: '日期', group: '合同', width: 12 },
  { key: 'contractNo', name: '合同编号', group: '合同', width: 24 },
  { key: 'contractQty', name: '数量(吨)', group: '合同', width: 10 },
  { key: 'contractPrice', name: '单价(元)', group: '合同', width: 10 },
  // 8-13 实际发货量
  { key: 'shipIdx', name: '序号', group: '实际发货量', width: 6 },
  { key: 'shipDate', name: '日期', group: '实际发货量', width: 12 },
  { key: 'shipLocation', name: '发货地点', group: '实际发货量', width: 12 },
  { key: 'shipOutNo', name: '出库单号', group: '实际发货量', width: 14 },
  { key: 'shipQty', name: '数量', group: '实际发货量', width: 8 },
  { key: 'shipRemark', name: '备注', group: '实际发货量', width: 14 },
  // 14-22 运输
  { key: 'transIdx', name: '序号', group: '运输', width: 6 },
  { key: 'transDate', name: '日期', group: '运输', width: 12 },
  { key: 'transCarrier', name: '承运单位', group: '运输', width: 12 },
  { key: 'transVehicleNo', name: '承运车号', group: '运输', width: 11 },
  { key: 'transDriver', name: '司机姓名', group: '运输', width: 10 },
  { key: 'transIdCard', name: '身份证号', group: '运输', width: 20 },
  { key: 'transQty', name: '数量(吨)', group: '运输', width: 10 },
  { key: 'transPrice', name: '运输单价(元/吨)', group: '运输', width: 14 },
  { key: 'transRemark', name: '备注', group: '运输', width: 14 },
  // 22-31 实际接受
  { key: 'recvIdx', name: '序号', group: '实际接受', width: 6 },
  { key: 'recvDate', name: '日期', group: '实际接受', width: 12 },
  { key: 'recvUnit', name: '接收单位(��用单位)', group: '实际接受', width: 18 },
  { key: 'recvReceiver', name: '接收人姓名', group: '实际接受', width: 10 },
  { key: 'recvWeighNo', name: '过磅单号', group: '实际接受', width: 14 },
  { key: 'recvQty', name: '数量(吨)', group: '实际接受', width: 10 },
  { key: 'recvPrice', name: '单价(元)', group: '实际接受', width: 10 },
  { key: 'recvAmount', name: '金额(元)', group: '实际接受', width: 12 },
  { key: 'recvDiff', name: '磅差(吨)', group: '实际接受', width: 10 },
  { key: 'recvRemark', name: '备注', group: '实际接受', width: 14 },
  // 32-41 开票情况
  { key: 'invIdx', name: '序号', group: '开票情况', width: 6 },
  { key: 'invDate', name: '日期', group: '开票情况', width: 12 },
  { key: 'invNo', name: '发票号码', group: '开票情况', width: 22 },
  { key: 'invContractNo', name: '对应合同编号', group: '开票情况', width: 24 },
  { key: 'invQty', name: '数量(吨)', group: '开票情况', width: 10 },
  { key: 'invPrice', name: '单价(元/吨)', group: '开票情况', width: 12 },
  { key: 'invAmount', name: '金额(元)', group: '开票情况', width: 12 },
  { key: 'invReceiver', name: '接收人', group: '开票情况', width: 18 },
  { key: 'invDelivered', name: '是否交付', group: '开票情况', width: 10 },
  { key: 'invRemark', name: '备注', group: '开票情况', width: 14 },
  // 42-45 资金支付
  { key: 'payIdx', name: '序号', group: '资金支付', width: 6 },
  { key: 'payDate', name: '日期', group: '资金支付', width: 12 },
  { key: 'payAmount', name: '金额(元)', group: '资金支付', width: 12 },
  { key: 'payRemark', name: '备注', group: '资金支付', width: 14 }
]

/** 列 key → 列索引的反向映射（解析时按 key 取值，避免列序硬编码） */
const COL_INDEX: Record<string, number> = IMPORT_COLUMNS.reduce(
  (acc, c, i) => {
    acc[c.key] = i
    return acc
  },
  {} as Record<string, number>
)

/** 导入预览：一份合同 + 其所有明细 */
interface ImportPreviewContract {
  groupName: string
  region: string
  factoryName: string
  contractNo: string
  contractDate: string
  contractQty: number
  contractPrice: number
  shipments: ShipmentRecord[]
  transports: TransportRecord[]
  receipts: ReceiptRecord[]
  invoices: InvoiceRecord[]
  payments: PaymentRecord[]
  valid: boolean
  errorMsg: string
}

const importFileInput = ref<HTMLInputElement | null>(null)
const importPreviewTable = ref<any>(null)
const importDialog = reactive({
  visible: false,
  contracts: [] as ImportPreviewContract[],
  validCount: 0,
  selectedCount: 0,
  totalShipments: 0,
  totalTransports: 0,
  totalReceipts: 0,
  totalInvoices: 0,
  totalPayments: 0,
  selectedContracts: [] as ImportPreviewContract[],
  error: '' as string
})

/** 触发文件选择器 */
function triggerImportExcel() {
  // 重置 value 让用户能再次选择同名文件
  if (importFileInput.value) {
    importFileInput.value.value = ''
    importFileInput.value.click()
  }
}

// ---------------------------------------------------------------------------
// 工具函数
// ---------------------------------------------------------------------------

/** 把任意输入转为字符串（避免 number/Date 直接拼接出现 NaN/Invalid） */
function safeStr(v: any): string {
  if (v === null || v === undefined) return ''
  if (v instanceof Date) return v.toISOString().slice(0, 10)
  return String(v).trim()
}

/** 把任意输入转为数字（兼容字符串、空值、千分位写法 "221,676.00"） */
function safeNum(v: any): number {
  if (v === null || v === undefined || v === '') return 0
  const n = Number(String(v).replace(/,/g, '').trim())
  return Number.isFinite(n) ? n : 0
}

/** 把 Excel 序号日期 / 字符串日期 / Date 对象统一规整为 YYYY-MM-DD */
function normalizeDate(v: any): string {
  if (!v && v !== 0) return ''
  if (v instanceof Date) return v.toISOString().slice(0, 10)
  const s = String(v).trim()
  // 兼容 2025-12-06 / 2025.12.06 / 2025/12/06
  const m = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/)
  if (m) {
    const [, y, mo, d] = m
    return `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`
  }
  return s
}

/** 判断"是否交付"的多种业务写法 */
function parseDelivered(v: any): boolean {
  const s = safeStr(v)
  if (!s) return false
  // 业务方习惯写法：已交付 / 交付 / 已 / 是 / Y / true
  return /已交付|交付|是|Y|true|✓/i.test(s)
}

/**
 * 按 key 从行数组中取值
 * @param rowArr 一行（已展开成定长数组）
 * @param key    列 key（见 IMPORT_COLUMNS）
 */
function pick(rowArr: any[], key: string): any {
  const idx = COL_INDEX[key]
  return rowArr[idx]
}

// ---------------------------------------------------------------------------
// 模板下载（生成 双行表头 + 合并单元格 + 示例数据 的标准模板）
// ---------------------------------------------------------------------------
function downloadImportTemplate() {
  // 1) 第一行：一级分组表头（同一 group 跨多列）
  const headerLine1: string[] = []
  // 2) 第二行：二级字段表头
  const headerLine2: string[] = []
  IMPORT_COLUMNS.forEach((c) => {
    headerLine1.push(c.group)
    headerLine2.push(c.name)
  })

  // 3) 示例数据：取业务方真实数据的前两行，让用户一眼看懂列对应关系
  //    src 行 1：271招 合同主体 + 第 1 笔发货/运输/接收 + 第 1 张发票 + 第 1 笔付款
  //    src 行 2：271招 第 2 笔发货/运输/接收 + 第 2 张发票 + 第 2 笔付款（合同列留空，继承上一行合同）
  const sample: any[][] = [
    [
      '南华集团', '海南', '昌江糖厂',                          // 供应商
      1, '2025-10-24', '代海25-26X251024-271招', 100, 7800,    // 合同
      1, '2025-12-06', '广为仓库', '无', 27.72, '',            // 发货
      1, '2025-12-06', '桂N99972', '梁泽勇', '452525197307122830', 27.72, '', '792小桶',  // 运输
      '', '2025-12-18', '昌江糖厂', '陈科长', '', 27.72, 7800, 216216, 0, '',             // 接收
      1, '2025-12-22', '25452000000144953427', '代海25-26X251024-271招', 55.44, 7800, 432432, '电子QQ邮箱455874531', '已交付', '',  // 开票
      1, '2026-01-09', 432432, ''                              // 付款
    ],
    [
      '', '', '',
      '', '', '', '', '',
      2, '2025-12-06', '广为仓库', '无', 27.72, '',
      2, '2025-12-06', '桂NB8399', '陆星见', '452729198012210017', 27.72, '', '792小桶',
      '', '2025-12-18', '昌江糖厂', '陈科长', '', 27.72, 7800, 216216, 0, '',
      2, '2026-01-15', '26452000000070297246', '', 27.65, 7800, 215670, '电子QQ邮箱455874531', '已交付', '',
      2, '2026-03-06', 215670, ''
    ]
  ]

  // 4) 用 aoa_to_sheet 生成（保留重复列名）
  const aoa: any[][] = [headerLine1, headerLine2, ...sample]
  const ws = XLSX.utils.aoa_to_sheet(aoa)

  // 5) 合并一级表头：把 group 相同的连续列做横向 merge
  const merges: { s: { r: number; c: number }; e: { r: number; c: number } }[] = []
  let mergeStart = 0
  for (let i = 1; i <= IMPORT_COLUMNS.length; i++) {
    if (
      i === IMPORT_COLUMNS.length ||
      IMPORT_COLUMNS[i].group !== IMPORT_COLUMNS[mergeStart].group
    ) {
      if (i - mergeStart > 1) {
        merges.push({ s: { r: 0, c: mergeStart }, e: { r: 0, c: i - 1 } })
      }
      mergeStart = i
    }
  }
  ws['!merges'] = merges

  // 6) 列宽
  ws['!cols'] = IMPORT_COLUMNS.map((c) => ({ wch: c.width || 12 }))

  // 7) 表头行高加倍，便于阅读
  ws['!rows'] = [{ hpt: 24 }, { hpt: 22 }]

  // 8) 输出
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '采购合同导入模板')
  const buf: ArrayBuffer = XLSX.write(wb, {
    bookType: 'xlsx',
    type: 'array',
    compression: true
  })
  const blob = new Blob([buf], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = '硫磺、磷酸采购合同导入模板.xlsx'
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 100)
  ElMessage.success('模板已下载，含示例数据，请按格式填写后再导入')
}

// ---------------------------------------------------------------------------
// 文件选择 → 解析 → 预览
// ---------------------------------------------------------------------------
function handleImportFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (evt) => {
    try {
      const data = new Uint8Array(evt.target?.result as ArrayBuffer)
      // cellDates: 让日期单元格解析为 Date 对象而不是数值序号
      const wb = XLSX.read(data, { type: 'array', cellDates: true })
      const sheetName = wb.SheetNames[0]
      if (!sheetName) throw new Error('Excel 文件中没有任何工作表')
      const ws = wb.Sheets[sheetName]

      // header: 1 → 返回二维数组（避免重复列名被合并）
      // defval: '' → 缺失单元格统一为空字符串
      const matrix: any[][] = XLSX.utils.sheet_to_json(ws, {
        header: 1,
        defval: ''
      })

      if (matrix.length < 3) {
        throw new Error('文件行数不足，至少需要 2 行表头 + 1 行数据')
      }

      // 跳过前 2 行表头（业务模板固定双行表头）
      const dataRows = matrix.slice(2)
      const parsed = parseImportMatrix(dataRows)
      if (!parsed.length) {
        throw new Error('未解析到任何合同数据，请检查表头与列顺序是否与模���一致')
      }

      // 汇总统计
      importDialog.contracts = parsed
      importDialog.validCount = parsed.filter((c) => c.valid).length
      importDialog.totalShipments = parsed.reduce((s, c) => s + c.shipments.length, 0)
      importDialog.totalTransports = parsed.reduce((s, c) => s + c.transports.length, 0)
      importDialog.totalReceipts = parsed.reduce((s, c) => s + c.receipts.length, 0)
      importDialog.totalInvoices = parsed.reduce((s, c) => s + c.invoices.length, 0)
      importDialog.totalPayments = parsed.reduce((s, c) => s + c.payments.length, 0)
      importDialog.selectedContracts = []
      importDialog.selectedCount = 0
      importDialog.error = ''
      importDialog.visible = true

      // 默认全选有效行（下一 tick 等表格挂载完毕）
      nextTick(() => {
        const tableRef = importPreviewTable.value
        if (tableRef) {
          parsed.forEach((row) => {
            if (row.valid) tableRef.toggleRowSelection(row, true)
          })
        }
      })
    } catch (err) {
      console.error('[importExcel] failed:', err)
      importDialog.error = `解析失败：${(err as Error)?.message || '未知错误'}`
      importDialog.contracts = []
      importDialog.validCount = 0
      importDialog.selectedCount = 0
      importDialog.visible = true
    }
  }
  reader.onerror = () => {
    ElMessage.error('文件读取失败，请重试')
  }
  reader.readAsArrayBuffer(file)
}

/**
 * 把数据行二维数组解析为 ImportPreviewContract 数组
 * @param dataRows 不含表头的二维数据数组
 */
function parseImportMatrix(dataRows: any[][]): ImportPreviewContract[] {
  const contracts: ImportPreviewContract[] = []
  // 按合同编号快速定位（用于开票行的"对应合同编号"跨行查找）
  const contractByNo = new Map<string, ImportPreviewContract>()
  // 当前指针：最近一份合同主体（未指定对应合同编号的明细归属到它）
  let current: ImportPreviewContract | null = null
  // 供应商信息会向下继承（业务表里同一工厂的多份合同只在首行写供应商名称）
  let lastGroupName = ''
  let lastRegion = ''
  let lastFactoryName = ''

  for (const row of dataRows) {
    // 跳过完全空行
    if (!row || row.every((v) => v === '' || v === null || v === undefined)) continue

    // 1) 解析供应商信息（空则继承）
    const groupName = safeStr(pick(row, 'groupName')) || lastGroupName
    const region = safeStr(pick(row, 'region')) || lastRegion
    const factoryName = safeStr(pick(row, 'factoryName')) || lastFactoryName
    if (groupName) lastGroupName = groupName
    if (region) lastRegion = region
    if (factoryName) lastFactoryName = factoryName

    // 2) 判断是否为"合同主体行"：合同编号 + 数量 + 单价 任一非空
    const cNo = safeStr(pick(row, 'contractNo'))
    const cQty = safeNum(pick(row, 'contractQty'))
    const cPrice = safeNum(pick(row, 'contractPrice'))
    const cDate = normalizeDate(pick(row, 'contractDate'))
    const isContractRow = !!cNo || cQty > 0 || cPrice > 0

    if (isContractRow) {
      // 校验：工厂名必填，数量 > 0
      let valid = true
      let errorMsg = ''
      if (!factoryName) {
        valid = false
        errorMsg = '工厂名称为空'
      } else if (cQty <= 0) {
        valid = false
        errorMsg = '合同数量必须大于 0'
      }
      const contract: ImportPreviewContract = {
        groupName,
        region,
        factoryName,
        contractNo: cNo,
        contractDate: cDate,
        contractQty: cQty,
        contractPrice: cPrice,
        shipments: [],
        transports: [],
        receipts: [],
        invoices: [],
        payments: [],
        valid,
        errorMsg
      }
      contracts.push(contract)
      if (cNo) contractByNo.set(cNo, contract)
      current = contract
    }

    // 3) 解析发货（日期 / 数量 任一非空才视为有效）
    const shipDate = normalizeDate(pick(row, 'shipDate'))
    const shipQty = safeNum(pick(row, 'shipQty'))
    if (current && (shipDate || shipQty > 0)) {
      current.shipments.push({
        date: shipDate,
        location: safeStr(pick(row, 'shipLocation')),
        outNo: safeStr(pick(row, 'shipOutNo')),
        qty: shipQty,
        remark: safeStr(pick(row, 'shipRemark'))
      })
    }

    // 4) 解析运输
    // 注：transCarrier（承运单位）是采购合同新增的列，与销售合同不同。
    //     为兼容旧 Excel（缺少 carrier 列），缺省时回落为空字符串。
    const transDate = normalizeDate(pick(row, 'transDate'))
    const transCarrier = safeStr(pick(row, 'transCarrier'))
    const transVehicle = safeStr(pick(row, 'transVehicleNo'))
    const transQty = safeNum(pick(row, 'transQty'))
    if (current && (transDate || transCarrier || transVehicle || transQty > 0)) {
      current.transports.push({
        date: transDate,
        carrier: transCarrier,
        vehicleNo: transVehicle,
        driver: safeStr(pick(row, 'transDriver')),
        idCard: safeStr(pick(row, 'transIdCard')),
        qty: transQty,
        price: safeNum(pick(row, 'transPrice')),
        remark: safeStr(pick(row, 'transRemark'))
      })
    }

    // 5) 解析接收
    const recvDate = normalizeDate(pick(row, 'recvDate'))
    const recvUnit = safeStr(pick(row, 'recvUnit'))
    const recvQty = safeNum(pick(row, 'recvQty'))
    if (current && (recvDate || recvUnit || recvQty > 0)) {
      current.receipts.push({
        date: recvDate,
        unit: recvUnit,
        receiver: safeStr(pick(row, 'recvReceiver')),
        weighNo: safeStr(pick(row, 'recvWeighNo')),
        qty: recvQty,
        price: safeNum(pick(row, 'recvPrice')),
        amount: safeNum(pick(row, 'recvAmount')),
        weighDiff: safeNum(pick(row, 'recvDiff')),
        remark: safeStr(pick(row, 'recvRemark'))
      })
    }

    // 6) 解析开票（支持"对应合同编号"跨行归属）
    const invDate = normalizeDate(pick(row, 'invDate'))
    const invNo = safeStr(pick(row, 'invNo'))
    const invAmount = safeNum(pick(row, 'invAmount'))
    if (invDate || invNo || invAmount > 0) {
      // 优先按"对应合同编号"找；找不到则归到当前指针合同
      const targetNo = safeStr(pick(row, 'invContractNo'))
      const target = (targetNo && contractByNo.get(targetNo)) || current
      if (target) {
        target.invoices.push({
          date: invDate,
          invoiceNo: invNo,
          qty: safeNum(pick(row, 'invQty')),
          price: safeNum(pick(row, 'invPrice')),
          amount: invAmount,
          receiver: safeStr(pick(row, 'invReceiver')),
          delivered: parseDelivered(pick(row, 'invDelivered')),
          remark: safeStr(pick(row, 'invRemark'))
        })
      }
    }

    // 7) 解析付款（资金支付归属当前合同）
    const payDate = normalizeDate(pick(row, 'payDate'))
    const payAmount = safeNum(pick(row, 'payAmount'))
    if (current && (payDate || payAmount > 0)) {
      current.payments.push({
        date: payDate,
        amount: payAmount,
        remark: safeStr(pick(row, 'payRemark'))
      })
    }
  }

  return contracts
}

/** 表格选择变化 */
function handleImportSelectionChange(rows: ImportPreviewContract[]) {
  importDialog.selectedContracts = rows
  importDialog.selectedCount = rows.length
}

/** 预览表行样式：异常合同红底高亮 */
function importRowClass({ row }: { row: ImportPreviewContract }) {
  return row.valid ? '' : 'import-row-invalid'
}

/** 确认导入：把选中的合同追加到主列表 */
function confirmImport() {
  const toAdd = importDialog.selectedContracts.length
    ? importDialog.selectedContracts
    : importDialog.contracts.filter((c) => c.valid)
  if (!toAdd.length) {
    ElMessage.warning('没有可导入的数据，请勾选至少一份合同')
    return
  }
  const ts = Date.now()
  toAdd.forEach((c, idx) => {
    contracts.value.push({
      id: `imp-${ts}-${idx}`,
      groupName: c.groupName,
      region: c.region,
      factoryName: c.factoryName,
      contractNo: c.contractNo,
      contractDate: c.contractDate,
      contractQty: c.contractQty,
      contractPrice: c.contractPrice,
      shipments: c.shipments.slice(),
      transports: c.transports.slice(),
      receipts: c.receipts.slice(),
      invoices: c.invoices.slice(),
      payments: c.payments.slice()
    })
  })
  const totalDetails =
    toAdd.reduce(
      (s, c) =>
        s +
        c.shipments.length +
        c.transports.length +
        c.receipts.length +
        c.invoices.length +
        c.payments.length,
      0
    )
  importDialog.visible = false
  ElMessage.success(`成功导入 ${toAdd.length} 份合同 / ${totalDetails} 条明细`)
}

// ===========================================================
// 操作列 - 编辑入口（沿用已有 openContractDialog 的编辑分支）
// ===========================================================
function editContract(c: Contract) {
  openContractDialog(c)
}

</script>

<style lang="scss" scoped>
@use '@/scss/variables' as *;
@use '@/scss/mixins' as *;

.purchase-contracts-page {
  padding: 16px 20px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 100%;
  /* 关键：flex 子项默认 min-width: auto 会被超宽内容撑开，导致 el-table 出现横向滚动条 */
  min-width: 0;
  max-width: 100%;
  background:
    radial-gradient(1200px 400px at -10% -20%, rgba(26,115,232,0.06), transparent 60%),
    radial-gradient(800px 300px at 110% 0%, rgba(0,184,212,0.05), transparent 60%),
    #f4f6f8;
}

/* ===========================================================
 * 全屏表格模式（Excel 风格）
 * -----------------------------------------------------------
 * 通过 fixed 提升根容器到最顶层、覆盖整屏；隐藏 hero / KPI；
 * 筛选栏 sticky 贴顶，表卡片占满剩余空间。
 * z-index 2000 高于 Element Plus 默认 dialog 层级（2001 仍可正常弹出）
 * =========================================================== */
.purchase-contracts-page.is-fullscreen {
  position: fixed;
  inset: 0;
  z-index: 2000;
  padding: 0;
  gap: 0;
  overflow: hidden;
  background: #f4f6f8;

  /* 隐藏品牌区，让筛选栏顶到屏幕顶部 */
  .page-hero {
    /* 全屏 Excel 风格下隐藏 hero，让筛选栏直接置顶 */
    display: none;
  }

  /* 筛选栏在全屏下作为 Excel 风格的"上方筛选条"，圆角去除、贴边 */
  .toolbar-card {
    border-radius: 0;
    border-left: 0;
    border-right: 0;
    border-top: 0;
    /* sticky 让筛选栏在长表格滚动时始终可见（虽然表格内部有自己的滚动，仍保留以备未来扩展） */
    position: sticky;
    top: 0;
    z-index: 5;
    box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
  }

  /* 表卡片：占满筛选栏下方所有剩余空间 */
  .table-card {
    flex: 1;
    min-height: 0;            /* flex 子项收缩前提 */
    border-radius: 0;
    border-left: 0;
    border-right: 0;
    border-bottom: 0;
    display: flex;
    flex-direction: column;
  }

  /* 让 el-table 自身能够 flex 撑满表卡片剩余高度 */
  .contract-grid {
    flex: 1;
    min-height: 0;
  }
}

/* =========================================================================
   Hero（极简白卡片）
   --------------------------------------------------------------------------
   设计要点（对齐"广为科技 - 采购合同"页）：
     1. 白色卡片背景 + 极弱投影，保持中性、克制；
     2. 左侧 56×56 圆角图标块用蓝→青渐变填充（#4facfe → #00f2fe），
        与采购合同页的 header-badge 完全一致，强化品牌一致性；
     3. 文案仅保留主标题（深色 #1a1a2e）+ 副标题（灰色 #999），
        不再混入业务数据；
     4. 右侧操作按钮区使用 Element Plus 默认色板（导入/导出走 plain
        风格、新增合同走 primary 主题色），不再做反白覆盖。
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
    @include flex-center;
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
    gap: 8px;
    flex-shrink: 0;
  }
}

/* ========= Toolbar（双行筛选栏） ========= */
.toolbar-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.toolbar-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}
/* 第二行分隔虚线，提高层次 */
.toolbar-row-advanced {
  padding-top: 10px;
  border-top: 1px dashed #e2e8f0;
}
.search-input    { width: 280px; flex-shrink: 0; }
.filter-item     { width: 160px; }
.filter-item-sm  { width: 120px; }
.date-item       { width: 260px; }
.toolbar-actions { margin-left: auto; display: flex; gap: 10px; align-items: center; }

/* 数量 / 单价区间筛选项 */
.range-filter {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 10px;
  height: 32px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fafbfc;
  .range-label {
    font-size: 12px;
    color: #64748b;
    margin-right: 2px;
    font-weight: 500;
  }
  .range-num { width: 100px; }
  .range-sep { color: #94a3b8; font-size: 12px; }
  :deep(.el-input-number) {
    .el-input__wrapper {
      box-shadow: none !important;
      background: transparent;
      padding: 0;
    }
    .el-input-number__decrease,
    .el-input-number__increase { display: none; }
    .el-input__inner { text-align: left; padding: 0; }
  }
}
.filter-check {
  font-size: 13px;
  padding: 0 6px;
  :deep(.el-checkbox__label) { padding-left: 6px; color: #475569; }
}

/* ========= 表格 ========= */
.table-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 8px 16px 16px;
  /* 与父级一致，避免被超宽 el-table 撑开导致横向滚动条不出现 */
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
}
.table-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 4px 8px;
}
.table-title {
  display: flex; align-items: center; gap: 8px;
  font-size: 15px; font-weight: 600; color: #1a1a2e;
  .title-icon { color: #1a73e8; }
}
/* =========== 多级表头主表 =========== */
.contract-grid {
  font-size: 12.5px;

  /* ============= 滚动条美化 ============= */
  /* 表头吸顶后增加细微底部阴影，让 scroll 时层级感更明显 */
  :deep(.el-table__header-wrapper) {
    box-shadow: 0 1px 0 #e2e8f0;
  }
  /* Element Plus 内置滚动条容器（纵向） */
  :deep(.el-scrollbar__bar.is-vertical) {
    width: 10px;
    right: 2px;
  }
  /* Element Plus 内置滚动条容器（横向） */
  :deep(.el-scrollbar__bar.is-horizontal) {
    height: 10px;
    bottom: 2px;
  }
  /* 滚动条 thumb 颜色 + hover 反馈 */
  :deep(.el-scrollbar__thumb) {
    background-color: #cbd5e1;
    border-radius: 6px;
    opacity: 0.9;
    transition: background-color 0.2s ease;
    &:hover { background-color: #94a3b8; }
  }
  /* WebKit 原生滚动条兜底（针对 el-table 内部使用 overflow:auto 的情形） */
  :deep(.el-table__body-wrapper)::-webkit-scrollbar,
  :deep(.el-table__fixed-right .el-table__body-wrapper)::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  :deep(.el-table__body-wrapper)::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 6px;
  }
  :deep(.el-table__body-wrapper)::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 6px;
    &:hover { background: #94a3b8; }
  }
  /* 表格底部圆角与上方容器保持一致，避免滚动条贴边毛刺 */
  :deep(.el-table__inner-wrapper) {
    border-radius: 10px;
    overflow: hidden;
  }
  /* 右侧固定列在出现横向滚动时投射的左阴影更柔和 */
  :deep(.el-table__fixed-right) {
    box-shadow: -4px 0 8px -4px rgba(15, 23, 42, 0.08);
  }

  /* ----------------------------------------------------------------
     表头基础样式
     ----------------------------------------------------------------
     多层表头（父表头"供应商名称"+ 子表头集团/区域/工厂名称）会让整体
     表头区域明显比单层表头要高。为缓解视觉臃肿：
       - padding：6px 0 → 4px 0（$spacing-1），对父子两级单元格同时生效；
       - line-height：1.4 → 1.2，让每行 cell 高度更紧凑；
       - font-size：≈13px，与正文字号拉开层次的同时保持可读性。
     ---------------------------------------------------------------- */
  :deep(th.el-table__cell) {
    background: #f8fafc;
    color: #495057;
    font-weight: 600;
    padding: $spacing-1 0;
    font-size: $font-size-sm * 0.93; // ≈ 13px
    .cell {
      line-height: 1.2;
      padding-left: $spacing-2;
      padding-right: $spacing-2;
    }
  }
  /* 分组表头着色（第一级） */
  :deep(th.hdr-group) {
    color: #fff !important;
    font-weight: 700 !important;
    letter-spacing: 0.5px;
    border-bottom: 0;
  }
  :deep(th.hdr-customer)  { background: linear-gradient(180deg, #475569, #334155) !important; }
  :deep(th.hdr-contract)  { background: linear-gradient(180deg, #1a73e8, #1557b0) !important; }
  :deep(th.hdr-ship)      { background: linear-gradient(180deg, #0d9488, #0f766e) !important; }
  :deep(th.hdr-transport) { background: linear-gradient(180deg, #7c3aed, #5b21b6) !important; }
  :deep(th.hdr-receipt)   { background: linear-gradient(180deg, #0891b2, #155e75) !important; }
  :deep(th.hdr-invoice)   { background: linear-gradient(180deg, #ea580c, #c2410c) !important; }
  :deep(th.hdr-payment)   { background: linear-gradient(180deg, #16a34a, #15803d) !important; }
  :deep(th.hdr-action)    { background: linear-gradient(180deg, #1f2937, #111827) !important; }

  /* 二级表头依分组着浅底色（仅叶子表头，避免覆盖一级���变） */
  /* 统一表头底色：所有分组及叶子表头采用同一浅灰底 + 深灰字，去除原本按业务板块染色的视觉噪音 */
  :deep(.contract-grid th.el-table__cell),
  :deep(th.group-customer),
  :deep(th.group-contract),
  :deep(th.group-ship),
  :deep(th.group-transport),
  :deep(th.group-receipt),
  :deep(th.group-invoice),
  :deep(th.group-payment),
  :deep(th.group-action) {
    background: #f1f5f9 !important;
    color: #334155 !important;
  }

  /* 单元格 */
  :deep(td.el-table__cell) {
    padding: 4px 0;
    vertical-align: middle;
  }
  :deep(td.cell-contract-end) {
    border-bottom: 2px solid #cbd5e1 !important;
  }

  /* 合同分组斑马（按合同切换底色） */
  :deep(.cg-odd > td)  { background: #ffffff; }
  :deep(.cg-even > td) { background: #fbfcfe; }
  :deep(.el-table__row:hover > td) { background: #eef5ff !important; }

  /* 异常合同高亮（覆盖 hover 之外） */
  :deep(.row-warn > td)   { background: #fffaf0 !important; }
  :deep(.row-danger > td) { background: #fff5f5 !important; }

  /* 让分组列的背景与表头呼应（左侧"合同"信息块更醒目） */
  :deep(.group-customer)  { background: rgba(241, 245, 249, 0.4); }
  :deep(.group-contract)  { background: rgba(239, 246, 255, 0.5); }
  :deep(.group-ship)      { background: rgba(236, 253, 245, 0.35); }
  :deep(.group-transport) { background: rgba(245, 243, 255, 0.35); }
  :deep(.group-receipt)   { background: rgba(236, 254, 255, 0.35); }
  :deep(.group-invoice)   { background: rgba(255, 247, 237, 0.35); }
  :deep(.group-payment)   { background: rgba(240, 253, 244, 0.35); }
}

.cell-strong { font-weight: 600; color: #1a1a2e; }
.contract-no-cell {
  display: inline-flex; align-items: center; gap: 6px;
  .cn-icon { color: #1a73e8; }
  .cn-text {
    font-family: 'JetBrains Mono', Consolas, monospace;
    font-size: 12px;
    color: #1a1a2e;
    font-weight: 600;
  }
}
.mono-mini {
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-size: 11.5px;
  color: #334155;
}
.num {
  font-family: 'Inter', sans-serif;
  font-variant-numeric: tabular-nums;
  color: #1a1a2e;
  font-weight: 500;
}
.num-ship    { color: #0d9488; font-weight: 600; }
.num-receipt { color: #0891b2; font-weight: 600; }
.num-invoice { color: #ea580c; font-weight: 600; }
.amount-strong { font-weight: 700; }
.diff-neg { color: #e53935; font-weight: 600; }
.diff-pos { color: #43a047; font-weight: 600; }

/* 序号列：去除原本圆圈/胶囊色块底，统一改为加粗黑色纯文本，与"集团"列风格一致 */
.seq,
.seq-ship,
.seq-transport,
.seq-receipt,
.seq-invoice,
.seq-payment {
  background: transparent !important;
  color: #0f172a !important;
  font-weight: 700;
  font-size: 13px;
  padding: 0;
  min-width: 0;
  height: auto;
  border-radius: 0;
  display: inline;
}

/*
 * 全局收紧 el-tag.is-round 的圆角
 * ---------------------------------------------------------------
 * 与订单列表页对齐：把 round 标签从完全胶囊形（9999px）压成 6px 圆角
 * 矩形，并设置 22px 紧凑高度，���免在密集表格 / Tooltip 中显得过圆。
 * 覆盖范围：表格、Tooltip、Hero、工具栏内的所有 round 标签。
 */
:deep(.el-tag.is-round) {
  border-radius: 6px !important;
  padding: 0 8px !important;
  height: 22px;
  line-height: 20px;
}

.pay-mini {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  .pay-mini-bar {
    width: 90%; height: 4px; background: #eef1f4; border-radius: 2px; overflow: hidden;
  }
  .pay-mini-fill {
    height: 100%;
    background: linear-gradient(90deg, #16a34a, #4ade80);
    transition: width 0.3s ease;
  }
  .pay-mini-txt { font-size: 11px; color: #16a34a; font-weight: 600; }
}

.row-actions {
  /* 操作列容器：纯文字按钮等距排布；右侧预留 padding 防止"删除"被
     表格垂直滚动条压住。fixed=right 的列出现在滚动条左侧，
     这里加 padding-right 让按钮整体内缩。 */
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-2;
  padding-right: $spacing-3;
}

.pagination-bar {
  margin-top: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
/* ========= 合同详情 · 独立路由 inline 视图 ========= */
/*
 * 详情视图作为页面内容直接渲染（不再借助 el-drawer 浮层）。容器给出
 * 与列表区一致的背景，使 TagsView 在"列表 ↔ 详情"标签切换时视觉过渡
 * 平滑、无浮层闪烁。
 */
.contract-detail-inline {
  background: #f7f9fc;
  min-height: calc(100vh - 110px); /* 视口高度 - (Navbar + TagsView) */
  border-radius: 8px;
}
.drawer-content {
  padding: 24px;
  display: flex; flex-direction: column; gap: 18px;
}
/* 顶部页面级导航条：返回 + 面包屑 */
.detail-topbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 4px 12px;
  border-bottom: 1px dashed #e2e8f0;
  font-size: 13px;
  color: #64748b;
}
.detail-back { font-weight: 600; }
.detail-crumb { color: #64748b; }
.detail-crumb-sep { color: #cbd5e1; }
.detail-crumb-current {
  color: #1a1a2e;
  font-weight: 600;
}
.drawer-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
}
/* 抽屉头部右侧操作区：编辑按钮 + 关闭按钮并排 */
.drawer-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.drawer-title-block {
  display: flex; align-items: center; gap: 12px;
}
.drawer-badge {
  width: 44px; height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #1a73e8 0%, #00b8d4 100%);
  color: #fff;
  @include flex-center;
}
.drawer-title {
  font-size: 17px; font-weight: 700; color: #1a1a2e;
  font-family: 'JetBrains Mono', Consolas, monospace;
}
.drawer-sub {
  font-size: 12px; color: #868e96; margin-top: 2px;
}
.drawer-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  .summary-item {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 12px 14px;
    &.highlight {
      background: linear-gradient(135deg, rgba(26,115,232,0.08), rgba(0,184,212,0.06));
      border-color: rgba(26,115,232,0.18);
    }
  }
  .summary-label { font-size: 12px; color: #868e96; margin-bottom: 6px; }
  .summary-value {
    font-size: 18px; font-weight: 700; color: #1a1a2e;
    .unit { font-size: 12px; color: #868e96; font-weight: 400; margin-left: 2px; }
  }
}
.drawer-progress {
  display: flex; flex-direction: column; gap: 14px;
  background: #fafbfc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 16px 18px;
  .dp-item { display: flex; flex-direction: column; gap: 8px; }
  .dp-head {
    display: flex; justify-content: space-between; align-items: baseline;
    font-size: 13px;
    .dp-label {
      color: #475569;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .dp-dot {
      width: 8px; height: 8px; border-radius: 2px; display: inline-block;
    }
    .d-ship    { background: linear-gradient(180deg, #1a73e8, #1557b0); }
    .d-invoice { background: linear-gradient(180deg, #00b8d4, #00838f); }
    .d-payment { background: linear-gradient(180deg, #43a047, #2e7d32); }
    .dp-num {
      color: #1a1a2e;
      font-family: 'Inter', sans-serif;
      font-variant-numeric: tabular-nums;
      strong { font-size: 16px; font-weight: 700; color: #1a73e8; margin-right: 4px; }
      .dp-divider { margin: 0 6px; color: #cbd5e1; font-weight: 300; }
      .dp-unit { color: #94a3b8; font-size: 12px; margin-left: 6px; }
    }
  }
  /* 进度条 + 百分比一行；间距足够，不再紧贴 */
  .dp-bar-row {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .dp-bar { flex: 1; min-width: 0; }
  .dp-percent {
    flex-shrink: 0;
    min-width: 56px;
    text-align: right;
    font-size: 13px;
    font-weight: 700;
    font-family: 'Inter', sans-serif;
    font-variant-numeric: tabular-nums;
    &.c-ship    { color: #1a73e8; }
    &.c-invoice { color: #00838f; }
    &.c-payment { color: #2e7d32; }
  }
}

/* ========= 收入人单元格（避免"电子QQ邮箱455874531"长串拥挤） ========= */
.receiver-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 100%;
  min-width: 0;
  .rc-tag { flex-shrink: 0; font-weight: 500; }
  .rc-text {
    color: #1a1a2e;
    font-size: 12.5px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .rc-empty { color: #cbd5e1; }
  &.rc-email .rc-text {
    color: #0891b2;
    font-family: 'JetBrains Mono', Consolas, monospace;
    font-size: 12px;
  }
}

.drawer-tabs {
  :deep(.el-tabs__nav-wrap::after) { background-color: #e2e8f0; }
  :deep(.el-tabs__item) { font-weight: 500; }
}
.tab-label {
  display: inline-flex; align-items: center; gap: 6px;
}
.tab-toolbar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 4px 12px;
  .tab-summary { font-size: 13px; color: #495057; }
}
.sub-table {
  :deep(th.el-table__cell) {
    background: #f8fafc; color: #495057; font-weight: 600;
  }
  .mono { font-family: 'JetBrains Mono', Consolas, monospace; font-size: 12px; }
  .diff-neg { color: #e53935; font-weight: 600; }
  .diff-pos { color: #43a047; font-weight: 600; }
}

/* =====================================================================
 * 看板视图样式已迁出
 * 原 `.summary-*` 系列样式与 Drawer 模板一起迁移到
 * 通用子组件 `components/GuangweiBoardDrawer.vue`，主表不再持有相关 CSS。
 * ===================================================================== */

/* =====================================================================
 * Excel 导入预览对话框
 * ===================================================================== */
.import-preview-dialog {
  :deep(.el-dialog__body) {
    padding-top: 12px;
    padding-bottom: 12px;
  }
}
.import-error-block {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  background: #fff0f0;
  border: 1px solid #ffd6d6;
  border-radius: 8px;
  color: #c62828;
  font-size: 13px;
}
.import-summary-bar {
  display: flex;
  gap: 16px;
  padding: 10px 14px;
  margin-bottom: 12px;
  background: #f8fafc;
  border-radius: 8px;
  font-size: 13px;
  color: #475569;
  .ist-item strong {
    margin: 0 2px;
    color: #1a1a2e;
    font-weight: 600;
  }
  .ist-ok strong { color: #2e7d32; }
  .ist-err strong { color: #c62828; }
}
/* 表格内被校验为无效的行高亮红色（针对 row-class-name 注入的 class） */
:deep(.el-table tr.import-row-invalid > td) {
  background-color: #fff5f5 !important;
}

/* 明细数量小徽标：发/运/收/票/款 用语义色区分，紧凑展示 */
.import-mini-counts {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  .imc {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 30px;
    height: 20px;
    padding: 0 6px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
    color: #fff;
  }
  .imc-ship  { background: #5b8def; }
  .imc-trans { background: #14b8a6; }
  .imc-recv  { background: #f59e0b; }
  .imc-inv   { background: #8b5cf6; }
  .imc-pay   { background: #10b981; }
  .imc-empty {
    background: #f1f5f9;
    color: #94a3b8;
  }
}
/* 展开行内的明细 Tabs：紧凑、内边距更小 */
.import-detail-block {
  padding: 8px 12px;
  background: #fafbfc;
}
.import-detail-tabs {
  :deep(.el-tabs__content) { padding: 8px 0 0; }
}

/* =====================================================================
 * 打印样式：让 window.print() 输出整洁的纸面表格
 * - 隐藏侧边栏、工具条、按钮、滚动条
 * - 表格去掉 max-height 限制，让全部数据一次打印
 * ===================================================================== */
@media print {
  :deep(.el-aside),
  :deep(.app-header),
  :deep(.tags-view),
  :deep(.el-drawer),
  :deep(.el-dialog),
  .page-hero,
  .toolbar-card,
  .table-tools,
  .pagination-bar,
  .row-actions {
    display: none !important;
  }
  .purchase-contracts-page {
    background: #fff !important;
    padding: 0 !important;
  }
  .table-card {
    border: none !important;
    box-shadow: none !important;
  }
  :deep(.el-table) {
    max-height: none !important;
  }
  :deep(.el-table__body-wrapper),
  :deep(.el-scrollbar__wrap) {
    overflow: visible !important;
    max-height: none !important;
  }
}

.drawer-remark {
  margin-top: 8px;
  padding: 12px 14px;
  background: #fffaf0;
  border: 1px solid #fed7aa;
  border-radius: 10px;
  display: flex; align-items: flex-start; gap: 8px;
  font-size: 13px; color: #92400e;
  .el-icon { color: #fb8c00; margin-top: 2px; }
}

/* ========= 表单 ========= */
.form-row {
  display: flex; gap: 16px;
  .col-2 { flex: 1; min-width: 0; }
}
.readonly-amount {
  font-size: 16px; font-weight: 700; color: #1a73e8;
  font-family: 'Inter', sans-serif;
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.readonly-amount.sm {
  font-size: 14px;
}
.readonly-amount .readonly-hint {
  font-size: 12px;
  font-weight: 400;
  color: #94a3b8;
}

/* =====================================================================
 * 新��� / 编辑采购合同：分���卡片样式
 * ---------------------------------------------------------------------
 * 6 大业务模块对应 6 个 .form-section：
 *   - 第一个为合同信息（必填），边框使用主题色高亮；
 *   - 其余 5 个为可选首次过程记录，未启用时灰显，启用时高亮卡片边框。
 * ===================================================================== */
.contract-form-dialog :deep(.el-dialog__body) {
  padding-top: 8px;
  padding-bottom: 12px;
  max-height: calc(100vh - 240px);
  overflow-y: auto;
}
.form-section {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #ffffff;
  margin-bottom: 14px;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}
.form-section:last-child {
  margin-bottom: 0;
}
/* 必填段（合同信息）：主题色边框 */
.form-section:not(.optional) {
  border-color: #c7dbff;
  background: #fafcff;
}
/* 可选段未启用：浅灰静默 */
.form-section.optional {
  background: #f9fafb;
}
/* 可选段启用：恢复白底 + 主题色边框 */
.form-section.optional.is-enabled {
  border-color: #c7dbff;
  background: #ffffff;
}
.section-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border-bottom: 1px solid #eef2f7;
}
.form-section.optional:not(.is-enabled) .section-head {
  border-bottom-color: transparent;
}
.section-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #1a73e8;
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
}
.form-section.optional:not(.is-enabled) .section-badge {
  background: #cbd5e1;
}
.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}
.form-section.optional:not(.is-enabled) .section-title {
  color: #94a3b8;
}
.section-tag {
  display: inline-block;
  padding: 1px 8px;
  border-radius: 10px;
  font-size: 11px;
  line-height: 1.6;
}
.section-tag.required {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}
.section-tag.optional {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
}
.section-switch {
  margin-left: auto;
}
.section-body {
  padding: 14px 16px 4px;
}
.section-body :deep(.el-form-item) {
  margin-bottom: 14px;
}
</style>

<!--
  非 scoped 全局样式
  --------------------------------------------------------------------
  el-dropdown 的下拉菜单会��� teleport 到 <body>，scoped 样式无法命中
  其中的 el-dropdown-item。这里用一段非 scoped 样式给"删除合同"
  危险态着色。颜色取自 src/scss/_variables.scss 中的 $color-danger
  （#e53935），保持与统一设计令牌一致。
-->
<style lang="scss">
.el-dropdown-menu__item.action-delete {
  color: #e53935; // = $color-danger
  &:not(.is-disabled):hover,
  &:not(.is-disabled):focus {
    background-color: rgba(229, 57, 53, 0.08);
    color: #e53935;
  }
}

/*
 * 广为采购详情·全屏抽屉样式（非 scoped，与 OrderList.vue 同款）
 * el-drawer body 默认 16px padding 会让内部"页面级"布局产生
 * 多余白边，这里清零并设置 page 背景；同时彻底隐藏 header 占位。
 */
.guangwei-fullscreen-drawer {
  .el-drawer__body {
    padding: 0;
    background: var(--el-bg-color-page, #f5f7fa);
    overflow: auto;
  }
  .el-drawer__header {
    display: none;
  }
}
</style>
