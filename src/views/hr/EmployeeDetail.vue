<template>
  <div class="employee-detail-container">
    <div class="detail-card">
      <div class="card-header">
        <div class="header-left">
          <div class="back-btn" @click="goBack">
            <el-icon size="20"><ArrowLeft /></el-icon>
          </div>
          <span class="header-title">员工详情</span>
        </div>
        <div class="header-right">
          <el-button @click="goBack">返回</el-button>
          <el-button type="primary" @click="handleEdit">编辑</el-button>
        </div>
      </div>
      
      <div class="card-body">
        <!-- Profile Header -->
        <div class="profile-header">
          <div class="profile-avatar">张</div>
          <div class="profile-info">
            <div class="profile-name">张三</div>
            <div class="profile-position">技术部 · 经理</div>
            <div class="profile-tags">
              <span class="tag">工号：EMP001</span>
              <span class="tag">入职：2020-01-15</span>
            </div>
          </div>
        </div>

        <!-- Basic Info -->
        <div class="info-section">
          <div class="section-title">基本信息</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">姓名</span>
              <span class="info-value">张三</span>
            </div>
            <div class="info-item">
              <span class="info-label">性别</span>
              <span class="info-value">男</span>
            </div>
            <div class="info-item">
              <span class="info-label">年龄</span>
              <span class="info-value">32岁</span>
            </div>
            <div class="info-item">
              <span class="info-label">手机号</span>
              <span class="info-value highlight">13800138001</span>
            </div>
            <div class="info-item">
              <span class="info-label">邮箱</span>
              <span class="info-value">zhangsan@company.com</span>
            </div>
            <div class="info-item">
              <span class="info-label">身份证号</span>
              <span class="info-value">*******************1234</span>
            </div>
          </div>
        </div>

        <!-- Work Info -->
        <div class="info-section">
          <div class="section-title">工作信息</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">工号</span>
              <span class="info-value">EMP001</span>
            </div>
            <div class="info-item">
              <span class="info-label">部门</span>
              <span class="info-value">技术部</span>
            </div>
            <div class="info-item">
              <span class="info-label">职位</span>
              <span class="info-value">经理</span>
            </div>
            <div class="info-item">
              <span class="info-label">入职日期</span>
              <span class="info-value">2020-01-15</span>
            </div>
            <div class="info-item">
              <span class="info-label">转正日期</span>
              <span class="info-value">2020-04-15</span>
            </div>
            <div class="info-item">
              <span class="info-label">员工状态</span>
              <span class="info-value">
                <el-tag type="success" size="small">在职</el-tag>
              </span>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="tab-section">
          <el-tabs v-model="activeTab" class="info-tabs">
            <el-tab-pane label="合同信息" name="contract">
              <div class="contract-list">
                <div class="contract-item">
                  <div class="contract-info">
                    <div class="contract-type">劳动合同（第三次续签）</div>
                    <div class="contract-period">2022-01-15 至 2027-01-14</div>
                  </div>
                  <div class="contract-status">有效</div>
                </div>
                <div class="contract-item">
                  <div class="contract-info">
                    <div class="contract-type">保密协议</div>
                    <div class="contract-period">2020-01-15 签署</div>
                  </div>
                  <div class="contract-status">有效</div>
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="紧急联系人" name="emergency">
              <div class="emergency-contact">
                <div class="contact-item">
                  <div class="contact-avatar">李</div>
                  <div class="contact-info">
                    <div class="contact-name">李小红</div>
                    <div class="contact-relation">配偶</div>
                  </div>
                  <div class="contact-phone">13900139001</div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'

const router = useRouter()
const activeTab = ref('contract')

function goBack() {
  router.back()
}

function handleEdit() {
  // TODO: Navigate to edit page
}
</script>

<style lang="scss">
@use '@/views/hr/employee-detail' as *;
</style>

<style lang="scss" scoped>
@use '@/scss/variables' as *;
@use '@/scss/mixins' as *;

.employee-detail-container {
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
</style>
