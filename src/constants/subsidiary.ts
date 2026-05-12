/** 结构说明：子公司/业务板块（订单、报表筛选） */
export const SUBSIDIARY_IDS = ['yahui', 'longzhou', 'huawei', 'guangwei'] as const
export type SubsidiaryId = (typeof SUBSIDIARY_IDS)[number]

export const SUBSIDIARIES: Record<SubsidiaryId, { name: string; scope: string }> = {
  yahui: { name: '亚辉塑业', scope: '编织袋、PE 袋等' },
  longzhou: { name: '龙州塑业', scope: '糖袋、食品包装等' },
  huawei: { name: '华维食品添加剂', scope: '添加剂及周边包装' },
  guangwei: { name: '广为科技', scope: '硫磺袋、工业袋等' }
}

export function subsidiaryLabel(id: SubsidiaryId): string {
  return SUBSIDIARIES[id]?.name ?? id
}
