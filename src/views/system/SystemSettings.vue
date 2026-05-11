<template>
  <div class="system-settings-container">
    <div class="settings-card">
      <div class="card-header">
        <div class="header-title">系统设置</div>
      </div>
      
      <div class="card-body">
        <div class="settings-layout">
          <!-- Settings Nav -->
          <div class="settings-nav">
            <div class="nav-list">
              <div
                v-for="item in navList"
                :key="item.key"
                class="nav-item"
                :class="{ active: activeNav === item.key }"
                @click="activeNav = item.key"
              >
                <el-icon class="nav-icon"><component :is="item.icon" /></el-icon>
                <span>{{ item.label }}</span>
              </div>
            </div>
          </div>
          
          <!-- Settings Content -->
          <div class="settings-content">
            <!-- Basic Settings -->
            <template v-if="activeNav === 'basic'">
              <div class="settings-section">
                <div class="section-title">基本信息</div>
                <div class="setting-form">
                  <div class="form-item">
                    <label class="form-label">系统名称</label>
                    <el-input v-model="settings.systemName" placeholder="请输入系统名称" style="width: 400px" />
                    <div class="form-hint">系统名称将显示在浏览器标签页和登录页面</div>
                  </div>
                  <div class="form-item">
                    <label class="form-label">系统Logo</label>
                    <el-upload
                      class="logo-uploader"
                      action="#"
                      :show-file-list="false"
                    >
                      <img v-if="settings.logo" :src="settings.logo" class="logo" />
                      <el-icon v-else class="logo-uploader-icon"><Plus /></el-icon>
                    </el-upload>
                  </div>
                </div>
              </div>
            </template>

            <!-- Appearance Settings -->
            <template v-if="activeNav === 'appearance'">
              <div class="settings-section">
                <div class="section-title">主题设置</div>
                <div class="setting-item">
                  <div class="setting-info">
                    <div class="setting-label">界面主题</div>
                    <div class="setting-desc">选择系统界面的显示主题</div>
                  </div>
                  <div class="setting-control">
                    <el-radio-group v-model="settings.theme">
                      <el-radio label="light">浅色</el-radio>
                      <el-radio label="dark">深色</el-radio>
                      <el-radio label="auto">跟随系统</el-radio>
                    </el-radio-group>
                  </div>
                </div>
              </div>
              
              <div class="settings-section">
                <div class="section-title">导航设置</div>
                <div class="setting-item">
                  <div class="setting-info">
                    <div class="setting-label">折叠侧边栏</div>
                    <div class="setting-desc">点击侧边栏切换按钮时自动折叠菜单</div>
                  </div>
                  <div class="setting-control">
                    <el-switch v-model="settings.sidebarCollapsed" />
                  </div>
                </div>
                <div class="setting-item">
                  <div class="setting-info">
                    <div class="setting-label">固定头部</div>
                    <div class="setting-desc">将顶部导航栏固定在页面顶部</div>
                  </div>
                  <div class="setting-control">
                    <el-switch v-model="settings.fixedHeader" />
                  </div>
                </div>
              </div>
            </template>

            <!-- Security Settings -->
            <template v-if="activeNav === 'security'">
              <div class="settings-section">
                <div class="section-title">密码设置</div>
                <div class="setting-item">
                  <div class="setting-info">
                    <div class="setting-label">密码强度</div>
                    <div class="setting-desc">设置用户密码的最小强度要求</div>
                  </div>
                  <div class="setting-control">
                    <el-select v-model="settings.passwordStrength" style="width: 150px">
                      <el-option label="低" value="low" />
                      <el-option label="中" value="medium" />
                      <el-option label="高" value="high" />
                    </el-select>
                  </div>
                </div>
                <div class="setting-item">
                  <div class="setting-info">
                    <div class="setting-label">密码有效期</div>
                    <div class="setting-desc">强制用户定期更换密码（天）</div>
                  </div>
                  <div class="setting-control">
                    <el-input-number v-model="settings.passwordExpiry" :min="0" :max="365" />
                  </div>
                </div>
              </div>
              
              <div class="settings-section">
                <div class="section-title">登录设置</div>
                <div class="setting-item">
                  <div class="setting-info">
                    <div class="setting-label">登录失败锁定</div>
                    <div class="setting-desc">连续登录失败次数后锁定账户</div>
                  </div>
                  <div class="setting-control">
                    <el-input-number v-model="settings.maxLoginAttempts" :min="3" :max="10" />
                  </div>
                </div>
                <div class="setting-item">
                  <div class="setting-info">
                    <div class="setting-label">会话超时</div>
                    <div class="setting-desc">用户无操作自动退出时间（分钟）</div>
                  </div>
                  <div class="setting-control">
                    <el-input-number v-model="settings.sessionTimeout" :min="5" :max="120" :step="5" />
                  </div>
                </div>
              </div>
            </template>

            <!-- Notification Settings -->
            <template v-if="activeNav === 'notification'">
              <div class="settings-section">
                <div class="section-title">消息通知</div>
                <div class="setting-item">
                  <div class="setting-info">
                    <div class="setting-label">邮件通知</div>
                    <div class="setting-desc">通过邮件发送重要通知</div>
                  </div>
                  <div class="setting-control">
                    <el-switch v-model="settings.emailNotification" />
                  </div>
                </div>
                <div class="setting-item">
                  <div class="setting-info">
                    <div class="setting-label">站内消息</div>
                    <div class="setting-desc">在系统中显示通知消息</div>
                  </div>
                  <div class="setting-control">
                    <el-switch v-model="settings.inAppNotification" />
                  </div>
                </div>
                <div class="setting-item">
                  <div class="setting-info">
                    <div class="setting-label">短信通知</div>
                    <div class="setting-desc">通过短信发送重要通知</div>
                  </div>
                  <div class="setting-control">
                    <el-switch v-model="settings.smsNotification" />
                  </div>
                </div>
              </div>
            </template>

            <!-- About -->
            <template v-if="activeNav === 'about'">
              <div class="settings-section">
                <div class="section-title">系统信息</div>
                <div class="info-list">
                  <div class="info-item">
                    <span class="info-label">系统名称</span>
                    <span class="info-value">Company OA ERP</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">版本号</span>
                    <span class="info-value">v1.0.0</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">构建时间</span>
                    <span class="info-value">2024-01-15</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">前端框架</span>
                    <span class="info-value">Vue 3 + TypeScript</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">UI框架</span>
                    <span class="info-value">Element Plus</span>
                  </div>
                </div>
              </div>
              
              <div class="settings-section">
                <div class="section-title">危险操作</div>
                <div class="danger-zone">
                  <div class="danger-title">数据操作不可逆，请谨慎操作</div>
                  <div class="danger-item">
                    <div class="danger-info">
                      <div class="danger-label">清除缓存</div>
                      <div class="danger-desc">清除系统运行时缓存数据</div>
                    </div>
                    <el-button type="danger" size="small">执行</el-button>
                  </div>
                  <div class="danger-item">
                    <div class="danger-info">
                      <div class="danger-label">系统重置</div>
                      <div class="danger-desc">重置系统所有配置为默认值</div>
                    </div>
                    <el-button type="danger" size="small">执行</el-button>
                  </div>
                </div>
              </div>
            </template>

            <!-- Save Button -->
            <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e8e8e8;">
              <el-button type="primary" @click="handleSave">保存设置</el-button>
              <el-button @click="handleReset">重置</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import {
  Plus
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const activeNav = ref('basic')

const navList = [
  { key: 'basic', label: '基本设置', icon: 'Setting' },
  { key: 'appearance', label: '界面设置', icon: 'Brush' },
  { key: 'security', label: '安全设置', icon: 'Lock' },
  { key: 'notification', label: '通知设置', icon: 'Bell' },
  { key: 'about', label: '关于系统', icon: 'InfoFilled' }
]

const settings = reactive({
  systemName: 'Company OA ERP',
  logo: '',
  theme: 'light',
  sidebarCollapsed: false,
  fixedHeader: true,
  passwordStrength: 'medium',
  passwordExpiry: 90,
  maxLoginAttempts: 5,
  sessionTimeout: 30,
  emailNotification: true,
  inAppNotification: true,
  smsNotification: false
})

function handleSave() {
  ElMessage.success('设置保存成功')
}

function handleReset() {
  ElMessage.info('设置已重置')
}
</script>

<style lang="scss">
@use '@/views/system/system-settings' as *;
</style>

<style lang="scss" scoped>
@use '@/scss/variables' as *;
@use '@/scss/mixins' as *;

.system-settings-container {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.logo-uploader {
  width: 100px;
  height: 100px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.2s;
  
  &:hover {
    border-color: #1a73e8;
  }
  
  .logo {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  
  .logo-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 100%;
    height: 100%;
    @include flex-center;
  }
}
</style>
