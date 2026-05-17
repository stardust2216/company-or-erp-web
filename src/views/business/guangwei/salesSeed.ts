/**
 * ============================================================================
 * 销售合同种子数据（mock）
 * ----------------------------------------------------------------------------
 * 抽取自 OrderList.vue 内部的初始数据，独立成模块的核心动机：
 *
 *  · 之前种子数据写在 OrderList.vue 的 <script setup> 里，只有用户访问过
 *    订单列表路由、SFC 被实例化时，`useContractStore('guangwei-sales', factory)`
 *    才会用真种子填充共享 store。
 *  · 入出库流水视图 (InventoryFlow.vue) 通常会先于订单列表被打开，结果它
 *    传给 useContractStore 的空种子工厂占住了 store，导致出库流水永远为空。
 *  · 抽到独立 ts 模块后，任何先打开的页面（订单列表 / 销售合同管理 /
 *    入出库流水）都会用同一份真实种子去种 store，跨页一致。
 *
 * 类型策略：
 *  · 这里仅作为初始 mock，字段形状要兼顾 OrderList 的 Contract 与
 *    InventoryFlow 的 BaseContract，两者结构同构但字段集合不同；
 *  · 因此导出为宽松类型 `Record<string, unknown>[]`，由消费侧通过
 *    `useContractStore<Contract>('guangwei-sales', () => salesSeed as Contract[])`
 *    显式断言；避免在本文件复制粘贴一份冗长的接口声明。
 * ============================================================================
 */
export const salesSeed: Record<string, unknown>[] = [
  {
    id: 'c-001',
    groupName: '南华集团',
    region: '海南',
    factoryName: '昌江糖厂',
    contractNo: '代海25-26X251024-271招',
    contractDate: '2025-10-24',
    contractQty: 100,
    contractPrice: 7800,
    shipments: [
      { date: '2025-12-06', location: '广为仓库', outNo: '无', qty: 27.72 },
      { date: '2025-12-06', location: '广为仓库', outNo: '无', qty: 27.72 },
      { date: '2025-11-23', location: '广为仓库', outNo: '无', qty: 27.65, remark: '790件小桶' },
      { date: '2026-02-03', location: '广为仓库', outNo: '无', qty: 26.6, remark: '760件小桶（超出合同量）' },
      { date: '2026-03-02', location: '广为仓库', outNo: '无', qty: 3.465, remark: '只收 99 桶' }
    ],
    transports: [
      { date: '2025-12-06', vehicleNo: '桂N99972', driver: '梁泽勇', idCard: '452525197307122830', qty: 27.72, price: 0, remark: '792小桶' },
      { date: '2025-12-06', vehicleNo: '桂NB8399', driver: '陆星见', idCard: '452729198012210017', qty: 27.72, price: 0, remark: '792件小桶' },
      { date: '2025-12-23', vehicleNo: '桂KA8376', driver: '黄成海', idCard: '452523197809028016', qty: 27.65, price: 0, remark: '小桶' },
      { date: '2026-02-03', vehicleNo: '桂N99972', driver: '梁泽勇', idCard: '452525197307122830', qty: 26.6, price: 0, remark: '760件小桶' },
      { date: '2026-03-03', vehicleNo: '桂AW7351', driver: '简全业', idCard: '452727197908200017', qty: 3.465, price: 0, remark: '只收99桶' }
    ],
    receipts: [
      { date: '2025-12-18', unit: '昌江糖厂', receiver: '陈科长', weighNo: '', qty: 27.72, price: 7800, amount: 216216, weighDiff: 0 },
      { date: '2025-12-18', unit: '昌江糖厂', receiver: '陈科长', weighNo: '', qty: 27.72, price: 7800, amount: 216216, weighDiff: 0 },
      { date: '2026-01-05', unit: '昌江糖厂', receiver: '陈科长', weighNo: '', qty: 27.65, price: 7800, amount: 215670, weighDiff: 0 },
      { date: '2026-02-08', unit: '昌江糖厂', receiver: '陈科长', weighNo: '', qty: 26.6, price: 7800, amount: 207480, weighDiff: 0, remark: '700件小桶' },
      // 3.465 吨原计划发往昌江柜子，因昌江不需要而临时改发到长坡，最终只收 99 桶
      { date: '2026-03-24', unit: '昌江糖厂', receiver: '陈科长', weighNo: '', qty: 3.47, price: 0, amount: 0, weighDiff: 0, remark: '发到昌江柜子，因昌江不用改到长坡，只收 99 桶；3.465 吨已发陈科长核对' }
    ],
    invoices: [
      { date: '2025-12-22', invoiceNo: '25452000000144953427', qty: 55.44, price: 7800, amount: 432432, receiver: '电子QQ邮箱455874531', delivered: true },
      { date: '2026-01-15', invoiceNo: '26452000000070297246', qty: 27.65, price: 7800, amount: 215670, receiver: '电子QQ邮箱455874531', delivered: true }
    ],
    payments: [
      { date: '2026-01-09', amount: 432432 },
      { date: '2026-03-06', amount: 215670 }
    ],
    remark: '26.6 吨已超出合同数量，等后续定价后再开票；另有 16.91 吨待开票数量已登记。'
  },
  {
    id: 'c-002',
    groupName: '南华集团',
    region: '海南',
    factoryName: '长坡糖厂',
    contractNo: '代海25-26X251024-272招',
    contractDate: '2025-10-24',
    contractQty: 140,
    contractPrice: 7800,
    shipments: [
      { date: '2025-11-21', location: '广为仓库', outNo: '无', qty: 27.475 },
      { date: '2025-11-21', location: '广为仓库', outNo: '无', qty: 27.51 },
      { date: '2025-12-23', location: '广为仓库', outNo: '无', qty: 27.09, remark: '774件小桶' },
      { date: '2026-01-25', location: '广为仓库', outNo: '无', qty: 27.125, remark: '775件' },
      { date: '2026-03-02', location: '广为仓库', outNo: '无', qty: 20.215 }
    ],
    transports: [
      { date: '2025-11-21', vehicleNo: '桂AF5899', driver: '岑海东', idCard: '452132198210173355', qty: 27.475, price: 0, remark: '小桶' },
      { date: '2025-11-21', vehicleNo: '桂FD9966', driver: '琴永峰', idCard: '452132198005023315', qty: 27.51, price: 0, remark: '小桶' },
      { date: '2025-12-23', vehicleNo: '桂AM9008', driver: '胡文康', idCard: '452123197406052212', qty: 27.09, price: 0, remark: '小桶' },
      { date: '2026-01-25', vehicleNo: '桂NC2757', driver: '黄茂恩', idCard: '452820219681010213X', qty: 27.125, price: 0, remark: '小桶' },
      { date: '2026-03-03', vehicleNo: '桂AW7351', driver: '简全业', idCard: '452727197908200017', qty: 20.215, price: 0, remark: '700小桶/下昌江99桶' }
    ],
    receipts: [
      { date: '2025-11-30', unit: '长坡糖厂', receiver: '吴科长', weighNo: '2017006984', qty: 28.84, price: 7800, amount: 224952, weighDiff: -1.365 },
      { date: '2025-12-02', unit: '长坡糖厂', receiver: '吴科长', weighNo: '20170006996', qty: 28.82, price: 7800, amount: 224796, weighDiff: -1.31 },
      { date: '2025-12-30', unit: '长坡糖厂', receiver: '吴科长', weighNo: '2017007383', qty: 28.42, price: 7800, amount: 221676, weighDiff: -1.33 },
      { date: '2026-02-02', unit: '长坡糖厂', receiver: '吴科长', weighNo: '2017008058', qty: 28.44, price: 7800, amount: 221832, weighDiff: -1.315, remark: '儋州长坡南华糖业有限公司' },
      { date: '2026-04-03', unit: '长坡糖厂', receiver: '吴科长', weighNo: '', qty: 21.34, price: 7800, amount: 166452, weighDiff: -1.125, remark: '散装装小桶；21.34 吨已发吴科核对，数量正确，但因是旧桶，要看生产质检过后才能确定要不要，暂不能开发票' }
    ],
    invoices: [
      { date: '2025-12-03', invoiceNo: '25452000000137028542', qty: 57.66, price: 7800, amount: 449748, receiver: '电子QQ邮箱455874531', delivered: true },
      { date: '2026-01-05', invoiceNo: '26452000000010375156', qty: 28.42, price: 7800, amount: 221676, receiver: '电子QQ邮箱455874531', delivered: true },
      { date: '2026-02-03', invoiceNo: '26452000000197892736', qty: 28.44, price: 7800, amount: 221832, receiver: '电子QQ邮箱455874531', delivered: true }
    ],
    payments: [
      { date: '2025-12-18', amount: 449748 },
      { date: '2026-01-26', amount: 221676 },
      { date: '2026-03-27', amount: 221832 }
    ],
    remark: '21.34 吨为旧桶产品，等质检通过后方可开票。'
  },
  {
    id: 'c-003',
    groupName: '广农集团',
    region: '广西',
    factoryName: '大桥糖厂',
    contractNo: 'DQYX(购)2025-128号-补充',
    contractDate: '2025-11-04',
    contractQty: 0.8,
    contractPrice: 7280,
    shipments: [
      { date: '2025-11-14', location: '广为仓库', outNo: '无', qty: 0.805 },
      { date: '2026-02-14', location: '广为仓库', outNo: '', qty: 12.96 }
    ],
    transports: [
      { date: '2025-11-14', vehicleNo: '桂F77979', driver: '赵武军', idCard: '452130196909183010', qty: 0.805, price: 41, remark: '小桶' },
      { date: '2026-02-14', vehicleNo: '桂F77979', driver: '赵武军', idCard: '452130196909183010', qty: 12.96, price: 0 }
    ],
    receipts: [
      { date: '2025-11-15', unit: '大桥糖厂', receiver: '杨工', weighNo: '', qty: 0.81, price: 7280, amount: 5860.4, weighDiff: 0 },
      { date: '2026-02-14', unit: '东江糖厂', receiver: '覃工', weighNo: '', qty: 12.96, price: 7220, amount: 93571.2, weighDiff: 0 }
    ],
    invoices: [
      { date: '2025-11-17', invoiceNo: '25452000000128562427', qty: 0.805, price: 7280, amount: 5860.4, receiver: '何经理', delivered: true },
      { date: '2026-02-25', invoiceNo: '26452000000288675976', qty: 44.62, price: 7220, amount: 322156.4, receiver: '覃科长', delivered: true }
    ],
    payments: []
  },
  {
    id: 'c-004',
    groupName: '南陵集团',
    region: '广西',
    factoryName: '香山糖厂',
    contractNo: 'XS-G-(采用)-2025-071-1',
    contractDate: '2025-11-11',
    contractQty: 4,
    contractPrice: 7280,
    shipments: [
      { date: '2025-11-11', location: '广为仓库', outNo: '无', qty: 3.99, remark: '114件小桶' },
      { date: '2026-01-22', location: '广为仓库', outNo: '', qty: 3.16 },
      { date: '2026-04-09', location: '广为仓库', outNo: '无', qty: 16.66 },
      { date: '2026-04-12', location: '广为仓库', outNo: '', qty: 7.92, remark: '500元/车吨桶来回' }
    ],
    transports: [
      { date: '2025-11-11', vehicleNo: '桂F77979', driver: '赵武军', idCard: '452130196909183010', qty: 3.99, price: 35, remark: '小桶' },
      { date: '2026-01-21', vehicleNo: '桂F78908', driver: '赵武军', idCard: '452130196909183010', qty: 3.16, price: 0, remark: '散水' },
      { date: '2026-04-09', vehicleNo: '桂F78908', driver: '赵武军', idCard: '452130196909183010', qty: 16.66, price: 0, remark: '散水' },
      { date: '2026-04-12', vehicleNo: '桂A8Y99E', driver: '方子英', idCard: '452126197508070912', qty: 7.92, price: 0, remark: '散水' }
    ],
    receipts: [
      { date: '2025-11-11', unit: '香山糖厂', receiver: '刘工', weighNo: '', qty: 3.99, price: 7280, amount: 29047.2, weighDiff: 0 },
      { date: '2026-01-22', unit: '香山糖厂', receiver: '李工', weighNo: '3277', qty: 3.15, price: 7320, amount: 23058, weighDiff: 0.01 },
      { date: '2026-04-09', unit: '香山糖厂', receiver: '刘工', weighNo: '4555', qty: 16.66, price: 7320, amount: 121951.2, weighDiff: 0 },
      { date: '2026-04-12', unit: '香山糖厂', receiver: '刘工', weighNo: '4589', qty: 7.92, price: 7320, amount: 57974.4, weighDiff: 0 }
    ],
    invoices: [
      { date: '2025-11-18', invoiceNo: '25452000000128718013', qty: 3.99, price: 7280, amount: 29047.2, receiver: '刘工', delivered: true },
      { date: '2026-02-13', invoiceNo: '26452000000262996681', qty: 31.72, price: 7320, amount: 232190.4, receiver: '刘工', delivered: true }
    ],
    payments: []
  },
  // c-005 初莱公司 东达糖厂 正式合同
  {
    id: 'c-005',
    groupName: '初莱公司',
    region: '广西',
    factoryName: '东达糖厂',
    contractNo: '2025123001',
    contractDate: '2025-12-30',
    contractQty: 15,
    contractPrice: 7500,
    shipments: [
      { date: '2025-12-31', location: '广为仓库', outNo: '', qty: 10.04, remark: '274件小桶 9.591' },
      { date: '2026-01-12', location: '广为仓库', outNo: '', qty: 10.06, remark: '275件小桶 9.625' },
      { date: '2026-01-24', location: '广为仓库', outNo: '', qty: 10.04, remark: '273件小桶' },
      { date: '2026-02-08', location: '广为仓库', outNo: '', qty: 7.24, remark: '200件小桶' }
    ],
    transports: [
      { date: '2025-12-31', vehicleNo: '桂K612K8', driver: '叶品昌', idCard: '4521262198904120613', qty: 10.04, price: 2800, remark: '2800元/车，拉空桶回来' },
      { date: '2026-01-12', vehicleNo: '桂F78908', driver: '赵武军', idCard: '452130196909183010', qty: 10.06, price: 121, remark: '121元/吨，拉空桶回来' },
      { date: '2026-01-24', vehicleNo: '桂L98173', driver: '陆权贵', idCard: '452624198306091378', qty: 10.04, price: 122, remark: '122元/吨，拉空桶回来' },
      { date: '2026-02-08', vehicleNo: '赣CF2E80', driver: '喻海波', idCard: '362222197906048436', qty: 7.24, price: 1100, remark: '1100元/车，单程' }
    ],
    receipts: [
      { date: '2026-01-01', unit: '东达糖厂', receiver: '王总', weighNo: '', qty: 10.06, price: 7500, amount: 75450, weighDiff: -0.02 },
      { date: '2026-01-13', unit: '东达糖厂', receiver: '王总', weighNo: '', qty: 10.02, price: 7500, amount: 75150, weighDiff: 0.04 },
      { date: '2026-01-25', unit: '东达糖厂', receiver: '王总', weighNo: '', qty: 10.02, price: 7500, amount: 75150, weighDiff: 0.02 },
      { date: '2026-02-08', unit: '东达糖厂', receiver: '王总', weighNo: '', qty: 7.24, price: 7500, amount: 54300, weighDiff: 0 }
    ],
    invoices: [
      { date: '2026-02-27', invoiceNo: '26452000000305432941', qty: 30.1, price: 7500, amount: 225750, receiver: '王总', delivered: true }
    ],
    payments: [
      { date: '2025-12-30', amount: 50000, remark: '签约预付款' },
      { date: '2026-01-12', amount: 130000 },
      { date: '2026-01-22', amount: 100000 },
      { date: '2026-02-10', amount: 100000 }
    ],
    remark: '合同量 15 吨已严重超发（实际 37.38 吨），按双方约定继续供货并按现行价开票。'
  },
  {
    id: 'c-006',
    groupName: '中粮集团',
    region: '广东',
    factoryName: '粤北糖厂',
    contractNo: '',
    contractDate: '2026-04-19',
    contractQty: 24.12,
    contractPrice: 7660,
    shipments: [{ date: '2026-04-19', location: '广为仓库', outNo: '无', qty: 24.12 }],
    transports: [{ date: '2026-04-20', vehicleNo: '桂BJ7369', driver: '梁智勇', idCard: '450211198706240816', qty: 24.12, price: 0, remark: '散水' }],
    receipts: [{ date: '2026-03-21', unit: '粤北糖厂', receiver: '曾工', weighNo: '1138', qty: 24.08, price: 7660, amount: 184452.8, weighDiff: 0.04, remark: '利方达旧酸/旧酸' }],
    invoices: [],
    payments: []
  },
  // c-007 初莱公司 东达糖厂 口头合同
  {
    id: 'c-007',
    groupName: '初莱公司',
    region: '广西',
    factoryName: '东达糖厂',
    contractNo: '口头',
    contractDate: '2026-02-28',
    contractQty: 30,
    contractPrice: 7500,
    shipments: [
      { date: '2026-03-11', location: '广为仓库', outNo: '', qty: 7.1, remark: '200件小桶' },
      { date: '2026-03-29', location: '广为仓库', outNo: '', qty: 5.42, remark: '150件小桶' }
    ],
    transports: [
      { date: '2026-03-11', vehicleNo: '桂A5K96H', driver: '黄新明', idCard: '452129198203171011', qty: 7.1, price: 0, remark: '小桶' },
      { date: '2026-03-29', vehicleNo: '桂A7R8R3', driver: '李志善', idCard: '452126197412121519', qty: 5.42, price: 0, remark: '小桶' }
    ],
    receipts: [
      { date: '2026-03-12', unit: '东达糖厂', receiver: '王总', weighNo: '', qty: 7.1, price: 7500, amount: 53250, weighDiff: 0 },
      { date: '2026-03-30', unit: '东达糖厂', receiver: '王总', weighNo: '', qty: 5.42, price: 7500, amount: 40650, weighDiff: 0 }
    ],
    invoices: [],
    payments: [
      { date: '2026-03-11', amount: 100000, remark: '王总回款' }
    ],
    remark: '口头协议续单，目前累计发货 12.52 吨，尚未开具发票。'
  },
  {
    id: 'c-008',
    groupName: '利方达公司',
    region: '广西',
    factoryName: '利方达',
    contractNo: '无',
    contractDate: '2025-11-26',
    contractQty: 1.225,
    contractPrice: 0,
    shipments: [{ date: '2025-11-27', location: '广为仓库', outNo: '', qty: 1.225 }],
    transports: [{ date: '2025-11-27', vehicleNo: '桂L98173', driver: '陆权贵', idCard: '452624198306091378', qty: 1.225, price: 0, remark: '小桶' }],
    receipts: [{ date: '2025-11-26', unit: '利方达', receiver: '方总', weighNo: '', qty: 1.23, price: 0, amount: 0, weighDiff: 0 }],
    invoices: [],
    payments: []
  },
  // c-009 南圩糖厂 散单
  {
    id: 'c-009',
    groupName: '散单客户',
    region: '广西',
    factoryName: '南圩糖厂',
    contractNo: '',
    contractDate: '2026-04-02',
    contractQty: 13.06,
    contractPrice: 6900,
    shipments: [
      { date: '2026-04-02', location: '广为仓库', outNo: '', qty: 13.06 }
    ],
    transports: [
      { date: '2026-04-02', vehicleNo: '桂L98173', driver: '陆权贵', idCard: '452624198306091378', qty: 13.06, price: 0, remark: '散水' }
    ],
    receipts: [
      { date: '2026-04-03', unit: '南圩糖厂', receiver: '陆科长', weighNo: '2017000041', qty: 13.06, price: 6900, amount: 90114, weighDiff: 0 }
    ],
    invoices: [],
    payments: [],
    remark: '无合同号散单：客户南圩糖厂，单价 6900 元/吨，已接收待开票。'
  }
]
