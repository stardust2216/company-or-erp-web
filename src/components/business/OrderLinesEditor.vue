<template>
  <div class="lines-wrap">
    <el-table :data="lines" border size="small" style="width: 100%">
      <el-table-column label="产品名称" min-width="120">
        <template #default="{ row }">
          <el-input v-if="editable" v-model="row.productName" placeholder="名称" maxlength="60" />
          <span v-else>{{ row.productName || '—' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="规格" min-width="100">
        <template #default="{ row }">
          <el-input v-if="editable" v-model="row.spec" placeholder="规格" maxlength="80" />
          <span v-else>{{ row.spec || '—' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="数量" width="100">
        <template #default="{ row }">
          <el-input-number
            v-if="editable"
            v-model="row.qty"
            :min="0"
            :max="9999999"
            :controls="false"
            style="width: 100%"
          />
          <span v-else class="num">{{ row.qty }}</span>
        </template>
      </el-table-column>
      <el-table-column label="单位" width="72">
        <template #default="{ row }">
          <el-input v-if="editable" v-model="row.unit" maxlength="6" />
          <span v-else>{{ row.unit }}</span>
        </template>
      </el-table-column>
      <el-table-column label="单价" width="110">
        <template #default="{ row }">
          <el-input-number
            v-if="editable"
            v-model="row.unitPrice"
            :min="0"
            :precision="2"
            :controls="false"
            style="width: 100%"
          />
          <span v-else class="num">¥{{ row.unitPrice.toFixed(2) }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="showAmount" label="小计" width="110">
        <template #default="{ row }">
          <span class="num">¥{{ (row.qty * row.unitPrice).toLocaleString() }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="editable && lines.length > 1" label="" width="56" align="center">
        <template #default="{ $index }">
          <el-button type="danger" link @click="removeLine($index)">删</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="lines-toolbar">
      <el-button v-if="editable" type="primary" text @click="addLine">+ 增加一行</el-button>
      <span class="line-total">
        明细合计：<b>¥{{ lineTotal.toLocaleString() }}</b>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { OrderLine } from '@/types'
import { sumOrderLines } from '@/types'

const props = withDefaults(
  defineProps<{
    lines: OrderLine[]
    editable?: boolean
    showAmount?: boolean
  }>(),
  {
    editable: false,
    showAmount: false
  }
)

const emit = defineEmits<{
  'update:lines': [value: OrderLine[]]
}>()

const localLines = ref<OrderLine[]>([...props.lines])

watch(() => props.lines, (val) => {
  localLines.value = [...val]
}, { deep: true })

const lines = computed(() => localLines.value)

const lineTotal = computed(() => sumOrderLines(lines.value))

function emptyLine(): OrderLine {
  return {
    id: `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    productName: '', spec: '', qty: 0, unit: '条', unitPrice: 0
  }
}

function addLine() {
  localLines.value.push(emptyLine())
  emit('update:lines', [...localLines.value])
}

function removeLine(index: number) {
  localLines.value.splice(index, 1)
  emit('update:lines', [...localLines.value])
}
</script>

<style lang="scss" scoped>
.lines-wrap {
  width: 100%;
}

.lines-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  flex-wrap: wrap;
  gap: 8px;
}

.line-total {
  font-size: 13px;
  color: #606266;
  b { color: #0070f3; }
}

.num {
  font-variant-numeric: tabular-nums;
}
</style>
