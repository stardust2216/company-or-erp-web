<template>
  <el-tag
    :type="tagType"
    :size="size"
    :effect="effect"
    :round="round"
  >
    {{ label }}
  </el-tag>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ORDER_STATUS_LABEL, ORDER_STATUS_TAG_TYPE, type OrderStatus } from '@/types'

const props = withDefaults(
  defineProps<{
    status: OrderStatus
    size?: '' | 'small' | 'large'
    effect?: 'dark' | 'light' | 'plain'
    round?: boolean
  }>(),
  {
    size: '',
    effect: 'light',
    round: false
  }
)

const label = computed(() => ORDER_STATUS_LABEL[props.status])
const tagType = computed(() => ORDER_STATUS_TAG_TYPE[props.status])
</script>
