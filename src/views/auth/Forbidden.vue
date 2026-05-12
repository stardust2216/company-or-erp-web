<template>
  <div class="forbidden-container">
    <div class="forbidden-content">
      <div class="error-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 8v4"/>
          <path d="M12 16h.01"/>
        </svg>
      </div>
      <h1 class="error-code">403</h1>
      <h2 class="error-title">无权限访问</h2>
      <p class="error-desc">
        您当前的角色 <strong>{{ currentRoleName }}</strong> 没有权限访问此页面<br/>
        如需访问，请联系系统管理员调整权限
      </p>
      <div class="action-buttons">
        <el-button type="primary" @click="goBack">
          <el-icon><ArrowLeft/></el-icon>
          返回上一页
        </el-button>
        <el-button @click="goHome">
          <el-icon><HomeFilled/></el-icon>
          返回工作台
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ArrowLeft, HomeFilled } from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()

const currentRoleName = computed(() => authStore.currentRoleName)

const goBack = () => router.back()
const goHome = () => router.push({ name: 'Dashboard' })
</script>

<style scoped lang="scss">
.forbidden-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #060818;
  padding: 20px;
}

.forbidden-content {
  text-align: center;
  color: #fff;
}

.error-icon {
  width: 120px;
  height: 120px;
  margin: 0 auto 24px;
  background: rgba(255, 193, 7, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 60px;
    height: 60px;
    color: #ffc107;
  }
}

.error-code {
  font-size: 96px;
  font-weight: 700;
  margin: 0 0 8px;
  background: linear-gradient(135deg, #ffc107, #ff9800);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  line-height: 1;
}

.error-title {
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 16px;
  color: rgba(255, 255, 255, 0.9);
}

.error-desc {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.8;
  margin: 0 0 32px;
  
  strong {
    color: #ffc107;
  }
}

.action-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  
  .el-button {
    padding: 12px 24px;
    font-size: 14px;
  }
}
</style>
