<template>
  <div class="placeholder-page">
    <div class="page-header">
      <div class="header-badge" :style="{ background: 'linear-gradient(135deg,#4facfe,#00f2fe)' }">
        <el-icon :size="28"><component :is="iconComp" /></el-icon>
      </div>
      <div class="header-info">
        <h1 class="page-title">华维食品 - 工业生产经营</h1>
        <p class="page-subtitle">工业生产经营情况报表</p>
      </div>
    </div>
    <div class="coming-soon">
      <el-empty description="功能开发中，敬请期待" :image-size="120">
        <template #image>
          <el-icon :size="80" color="#c0c4cc"><component :is="iconComp" /></el-icon>
        </template>
        <el-button type="primary" plain @click="$router.back()">返回上一页</el-button>
      </el-empty>
    </div>
  </div>
</template>
<script setup lang="ts">
import * as Icons from '@element-plus/icons-vue'
const iconComp = (Icons as any)['TrendCharts']
</script>
<style lang="scss" scoped>
.placeholder-page { padding: 20px; }
.page-header { display:flex; align-items:center; gap:16px; margin-bottom:24px; background:#fff; padding:20px 24px; border-radius:12px; box-shadow:0 1px 4px rgba(0,0,0,.06); }
.header-badge { width:56px; height:56px; border-radius:14px; display:flex; align-items:center; justify-content:center; color:#fff; flex-shrink:0; }
.page-title { font-size:20px; font-weight:700; color:#1a1a2e; margin:0 0 4px; }
.page-subtitle { font-size:13px; color:#999; margin:0; }
.coming-soon { background:#fff; border-radius:12px; padding:60px 0; display:flex; justify-content:center; align-items:center; }
</style>
