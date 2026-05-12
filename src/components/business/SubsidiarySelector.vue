<template>
  <el-select
    :model-value="modelValue"
    :placeholder="placeholder"
    :clearable="clearable"
    :style="{ width: width }"
    @update:model-value="handleChange"
  >
    <el-option
      v-for="opt in optionsList"
      :key="opt.value"
      :label="opt.label"
      :value="opt.value"
    />
  </el-select>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SubsidiaryId } from '@/constants/subsidiary'
import { SUBSIDIARY_IDS, SUBSIDIARIES } from '@/constants/subsidiary'

export type SubsidiaryValue = SubsidiaryId | ''

const props = withDefaults(
  defineProps<{
    modelValue: SubsidiaryValue
    placeholder?: string
    width?: string
    clearable?: boolean
    /** 是否显示"全部"选项 */
    showAll?: boolean
  }>(),
  {
    placeholder: '选择子公司',
    width: '160px',
    clearable: true,
    showAll: true
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: SubsidiaryValue]
}>()

const optionsList = computed(() => {
  const list: { label: string; value: SubsidiaryValue }[] = []
  if (props.showAll) {
    list.push({ label: '全部子公司', value: '' })
  }
  SUBSIDIARY_IDS.forEach((id) => {
    list.push({
      label: `${SUBSIDIARIES[id].name}（${SUBSIDIARIES[id].scope}）`,
      value: id
    })
  })
  return list
})

function handleChange(value: SubsidiaryValue) {
  emit('update:modelValue', value ?? '')
}
</script>
