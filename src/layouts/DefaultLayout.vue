<template>
  <div class="default-layout">
    <el-container style="min-height: 100vh">
      <el-header class="layout-header">
        <div class="header-inner">
          <span class="brand">Company ERP</span>
          <div class="header-actions">
            <el-dropdown @command="handleCommand">
              <span class="user-name">
                {{ userInfo?.realName || userInfo?.username || '用户' }}
                <el-icon><arrow-down /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </el-header>
      <el-main class="layout-main">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ArrowDown } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

const router = useRouter()
const authStore = useAuthStore()
const { userInfo } = storeToRefs(authStore)

function handleCommand(cmd: string) {
  if (cmd === 'logout') {
    authStore.logoutAction()
    router.push({ name: 'Login' })
  }
}
</script>

<style lang="scss" scoped>
.layout-header {
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  padding: 0 24px;
  height: 56px;
  display: flex;
  align-items: center;
}
.header-inner {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.brand {
  font-size: 18px;
  font-weight: 700;
  color: #0070f3;
}
.user-name {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #333;
}
.layout-main {
  background: #f5f7fa;
}
</style>
