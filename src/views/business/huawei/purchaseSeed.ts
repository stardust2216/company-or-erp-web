/**
 * ============================================================================
 * 采购合同种子数据（mock）
 * ----------------------------------------------------------------------------
 * 抽取自 Warehouse.vue 内部的初始数据，独立成模块后任何先打开的页面都能
 * 通过共享 store 获得相同种子（参见 salesSeed.ts 顶部注释，动机一致）。
 * 类型采用宽松导出，由消费侧按需断言为本地的 Contract 接口。
 * ============================================================================
 */
export const purchaseSeed: Record<string, unknown>[] = [
  // c-001 主合同：瓮福国际贸易股份有限公司 — 500 吨 @ 6400 元/吨
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
      { date: '2026-03-10', carrier: '丰茂物流', vehicleNo: '贵JB5766', driver: '陆景波', idCard: '452725197706260799', qty: 31.66, price: 0, remark: '与华维公司合车' },
      { date: '2026-04-01', carrier: '丰茂物流', vehicleNo: '贵JB7828', driver: '闭开国', idCard: '452725198501020593', qty: 30, price: 0 }
    ],
    receipts: [
      { date: '2025-11-06', unit: '华维公司', receiver: '卢总', weighNo: '', qty: 32.9, price: 6400, amount: 210560, weighDiff: 0, remark: '940件小桶' },
      { date: '2025-11-10', unit: '华维公司', receiver: '卢总', weighNo: '', qty: 26.915, price: 6400, amount: 172256, weighDiff: 0, remark: '769桶' },
      { date: '2025-11-22', unit: '华维公司', receiver: '卢总', weighNo: '', qty: 32.025, price: 6400, amount: 204960, weighDiff: 0, remark: '915小桶' },
      { date: '2025-11-24', unit: '华维公司', receiver: '卢总', weighNo: '', qty: 32.025, price: 6400, amount: 204960, weighDiff: 0 },
      { date: '2025-12-10', unit: '华维公司', receiver: '卢总', weighNo: '', qty: 32.48, price: 6400, amount: 207872, weighDiff: 0, remark: '928桶' },
      { date: '2025-12-11', unit: '华维公司', receiver: '卢总', weighNo: '', qty: 32.48, price: 6400, amount: 207872, weighDiff: 0, remark: '928桶' },
      { date: '2026-01-08', unit: '华维公司', receiver: '卢总', weighNo: '', qty: 31.99, price: 6400, amount: 204736, weighDiff: 0, remark: '915件小桶' },
      { date: '2026-01-11', unit: '华维公司', receiver: '卢总', weighNo: '', qty: 32.9, price: 6400, amount: 210560, weighDiff: 0, remark: '940件小桶' },
      { date: '2026-01-29', unit: '华维公司', receiver: '卢总', weighNo: '', qty: 29.64, price: 6400, amount: 189696, weighDiff: 0 },
      { date: '2026-02-27', unit: '华维公司', receiver: '卢总', weighNo: '', qty: 29.64, price: 6400, amount: 189696, weighDiff: 0 },
      { date: '2026-03-10', unit: '华维公司', receiver: '卢总', weighNo: '', qty: 12.23, price: 6400, amount: 78272, weighDiff: 0, remark: '与华维公司合车' },
      { date: '2026-04-01', unit: '华维公司', receiver: '卢总', weighNo: '', qty: 30, price: 6400, amount: 192000, weighDiff: 0 }
    ],
    invoices: [],
    payments: [],
    remark: '合同 500 吨主单：12 批次累计到货约 384 吨；运输统一委托丰茂物流；剩余配额按月度计划继续供货。'
  },
  // c-002 续签合同：瓮福国际贸易股份有限公司 — 350 吨 @ 6400 元/吨
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
      { date: '2026-04-15', location: '瓮福', outNo: '', qty: 10.32, remark: '下香山糖厂单拉回华维厂' }
    ],
    transports: [
      { date: '2026-04-15', carrier: '丰茂物流', vehicleNo: '贵JA1502', driver: '李井明', idCard: '522724198512180017', qty: 10.32, price: 0, remark: '下香山糖厂单拉回华维厂' }
    ],
    receipts: [
      { date: '2026-04-15', unit: '华维公司', receiver: '卢总', weighNo: '', qty: 10.32, price: 6400, amount: 66048, weighDiff: -0.32, remark: '下香山糖厂拉回华维厂' }
    ],
    invoices: [],
    payments: [],
    remark: '新签 350 吨合同，首批 10.32 吨已到货，存在 0.32 吨磅差待与供应商核对。'
  },
  // c-003 开磷集团 — 100 吨 @ 6450 元/吨
  {
    id: 'c-003',
    groupName: '开磷集团',
    region: '贵州',
    factoryName: '开磷新型矿肥有限责任公司',
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
      { date: '2025-12-21', unit: '华维公司', receiver: '卢总', weighNo: '2026000088', qty: 33.18, price: 6450, amount: 214011, weighDiff: -0.02 },
      { date: '2026-01-16', unit: '华维公司', receiver: '卢总', weighNo: '2026000142', qty: 33.1, price: 6450, amount: 213495, weighDiff: 0 },
      { date: '2026-02-21', unit: '华维公司', receiver: '卢总', weighNo: '2026000219', qty: 32.85, price: 6450, amount: 211883, weighDiff: 0 }
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
  // c-004 散单：海化集团
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
      { date: '2026-03-08', unit: '华维公司', receiver: '卢总', weighNo: '2026000301', qty: 28.55, price: 6500, amount: 185575, weighDiff: -0.05, remark: '临时补货' }
    ],
    invoices: [],
    payments: [],
    remark: '无合同号散单：临时补货 28.6 吨，已签收待开票。'
  }
]
