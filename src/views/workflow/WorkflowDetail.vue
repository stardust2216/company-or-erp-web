<template>
  <div class="workflow-detail-container">
    <div class="detail-card">
      <div class="card-header">
        <div class="header-left">
          <div class="back-btn" @click="goBack">
            <el-icon size="20"><ArrowLeft /></el-icon>
          </div>
          <span class="header-title">申请详情</span>
        </div>
        <div class="header-right">
          <el-button @click="goBack">返回</el-button>
          <el-button type="primary" @click="handlePrint">打印</el-button>
        </div>
      </div>
      
      <div class="card-body">
        <!-- Basic Info -->
        <div class="info-section">
          <div class="section-title">基本信息</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">申请标题</span>
              <span class="info-value highlight">请假申请 - 年假</span>
            </div>
            <div class="info-item">
              <span class="info-label">申请类型</span>
              <span class="info-value">请假申请</span>
            </div>
            <div class="info-item">
              <span class="info-label">申请人</span>
              <span class="info-value">张三</span>
            </div>
            <div class="info-item">
              <span class="info-label">所属部门</span>
              <span class="info-value">技术部</span>
            </div>
            <div class="info-item">
              <span class="info-label">申请时间</span>
              <span class="info-value">2024-01-15 10:30:00</span>
            </div>
            <div class="info-item">
              <span class="info-label">当前状态</span>
              <span class="info-value">
                <el-tag type="warning" size="small">待审批</el-tag>
              </span>
            </div>
          </div>
        </div>

        <!-- Application Content -->
        <div class="info-section">
          <div class="section-title">申请内容</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">请假类型</span>
              <span class="info-value">年假</span>
            </div>
            <div class="info-item">
              <span class="info-label">开始日期</span>
              <span class="info-value">2024-01-20</span>
            </div>
            <div class="info-item">
              <span class="info-label">结束日期</span>
              <span class="info-value">2024-01-22</span>
            </div>
            <div class="info-item">
              <span class="info-label">共计天数</span>
              <span class="info-value">3天</span>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div class="description-section">
          <div class="section-title">申请说明</div>
          <div class="description-content">
            因个人事务需要处理，特申请年假3天。假期期间将安排好手头工作，确保不影响项目进度。如有紧急情况可随时联系。
          </div>
        </div>

        <!-- Attachments -->
        <div class="attachments-section">
          <div class="section-title">附件</div>
          <div class="attachment-list">
            <div class="attachment-item">
              <el-icon class="attachment-icon"><Document /></el-icon>
              <span class="attachment-name">请假申请表.pdf</span>
            </div>
          </div>
        </div>

        <!-- Process Timeline -->
        <div class="process-section">
          <div class="section-title">审批流程</div>
          <div class="process-timeline">
            <div class="timeline-item">
              <div class="timeline-dot approved">
                <el-icon><Check /></el-icon>
              </div>
              <div class="timeline-content">
                <div class="timeline-header">
                  <span class="timeline-title">提交申请</span>
                  <span class="timeline-time">2024-01-15 10:30:00</span>
                </div>
                <div class="timeline-body">
                  <div class="approver-info">
                    <span class="approver-name">张三</span>
                    <span class="approver-dept">技术部</span>
                  </div>
                  提交了请假申请
                </div>
              </div>
            </div>
            
            <div class="timeline-item">
              <div class="timeline-dot pending current">
                <el-icon><User /></el-icon>
              </div>
              <div class="timeline-content">
                <div class="timeline-header">
                  <span class="timeline-title">部门主管审批</span>
                  <span class="timeline-time">待审批</span>
                </div>
                <div class="timeline-body">
                  <div class="approver-info">
                    <span class="approver-name">李经理</span>
                    <span class="approver-dept">技术部</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="timeline-item">
              <div class="timeline-dot pending">
                <el-icon><User /></el-icon>
              </div>
              <div class="timeline-content">
                <div class="timeline-header">
                  <span class="timeline-title">人事审批</span>
                  <span class="timeline-time">待审批</span>
                </div>
                <div class="timeline-body">
                  <div class="approver-info">
                    <span class="approver-name">人事专员</span>
                    <span class="approver-dept">人力资源部</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action -->
        <div class="action-section">
          <el-button @click="goBack">返回</el-button>
          <el-button type="success" @click="handleApprove">通过</el-button>
          <el-button type="danger" @click="handleReject">驳回</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ArrowLeft, Check, User, Document } from '@element-plus/icons-vue'

const router = useRouter()

function goBack() {
  router.back()
}

function handlePrint() {
  window.print()
}

function handleApprove() {
  // TODO: Implement approve logic
}

function handleReject() {
  // TODO: Implement reject logic
}
</script>

<style lang="scss">
@use '@/views/workflow/workflow-detail' as *;
</style>

<style lang="scss" scoped>
@use '@/scss/variables' as *;
@use '@/scss/mixins' as *;

.workflow-detail-container {
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
