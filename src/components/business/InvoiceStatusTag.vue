<template>
  <el-tag
    :type="tagType"
    :size="size"
    :effect="effect"
  >
    {{ label }}
  </el-tag>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { INVOICE_STATUS_LABEL, INVOICE_STATUS_TAG_TYPE, type InvoiceStatus } from '@/types'

const props = withDefaults(
  defineProps<{
    status: InvoiceStatus
    size?: '' | 'small' | 'large'
    effect?: 'dark' | 'light' | 'plain'
  }>(),
  {
    size: 'small',
    effect: 'light'
  }
)

const label = computed(() => INVOICE_STATUS_LABEL[props.status])
const tagType = computed(() => INVOICE_STATUS_TAG_TYPE[props.status])
</script>
