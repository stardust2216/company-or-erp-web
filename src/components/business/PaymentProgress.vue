<template>
  <div class="payment-progress">
    <el-progress
      :percentage="percentage"
      :stroke-width="strokeWidth"
      :color="progressColor"
      :show-text="showText"
    />
    <span v-if="showLabel" class="payment-label">{{ percentage }}%</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { paymentColor } from '@/types'

const props = withDefaults(
  defineProps<{
    percentage: number
    strokeWidth?: number
    showText?: boolean
    showLabel?: boolean
  }>(),
  {
    strokeWidth: 10,
    showText: true,
    showLabel: false
  }
)

const progressColor = computed(() => paymentColor(props.percentage))
</script>

<style lang="scss" scoped>
.payment-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 140px;

  .payment-label {
    font-size: 12px;
    color: #666;
    font-weight: 500;
    flex-shrink: 0;
  }
}
</style>
