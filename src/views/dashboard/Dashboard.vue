<template>
  <div class="dashboard-container">
    <!-- Welcome Section -->
    <div class="welcome-section">
      <div class="welcome-content">
        <div class="welcome-text">
          <h2>欢迎回来，{{ userInfo?.realName || userInfo?.username || '用户' }}！</h2>
          <p>今天是个好日子，祝您工作顺利！</p>
        </div>
        <div class="welcome-date">
          <div class="date">{{ currentDate }}</div>
          <div class="weather">☀️</div>
        </div>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon primary">
          <el-icon><Document /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-label">待审批</div>
          <div class="stat-value">12</div>
          <div class="stat-change up">↑ 较上月 +5</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon success">
          <el-icon><CircleCheck /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-label">已完成</div>
          <div class="stat-value">156</div>
          <div class="stat-change up">↑ 较上月 +23</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon warning">
          <el-icon><Clock /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-label">我的任务</div>
          <div class="stat-value">8</div>
          <div class="stat-change down">↓ 较上月 -2</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon danger">
          <el-icon><Bell /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-label">未读消息</div>
          <div class="stat-value">3</div>
          <div class="stat-change">今日新增</div>
        </div>
      </div>
    </div>

    <!-- Content Grid -->
    <div class="content-grid">
      <!-- Recent Workflows -->
      <div class="panel-card">
        <div class="panel-header">
          <div class="panel-title">
            <el-icon><Document /></el-icon>
            最近审批
          </div>
          <div class="panel-actions">
            <el-button type="primary" link @click="goToWorkflow">
              查看全部
              <el-icon class="el-icon--right"><ArrowRight /></el-icon>
            </el-button>
          </div>
        </div>
        <div class="panel-body">
          <div class="workflow-list">
            <div class="workflow-item" v-for="item in recentWorkflows" :key="item.id">
              <div class="workflow-icon" :class="item.status">
                <el-icon><Document /></el-icon>
              </div>
              <div class="workflow-info">
                <div class="workflow-title">{{ item.title }}</div>
                <div class="workflow-meta">{{ item.applicant }} · {{ item.time }}</div>
              </div>
              <div class="workflow-status" :class="item.status">
                {{ item.statusText }}
              </div>
              <div class="workflow-action">
                <el-button type="primary" link size="small">处理</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions & Notices -->
      <div>
        <!-- Quick Actions -->
        <div class="panel-card" style="margin-bottom: 16px;">
          <div class="panel-header">
            <div class="panel-title">
              <el-icon><Lightning /></el-icon>
              快捷操作
            </div>
          </div>
          <div class="panel-body">
            <div class="quick-actions">
              <div class="action-item" @click="goToWorkflowStart">
                <el-icon class="action-icon"><Edit /></el-icon>
                <span class="action-text">发起申请</span>
              </div>
              <div class="action-item" @click="goToLeave">
                <el-icon class="action-icon"><Calendar /></el-icon>
                <span class="action-text">请假申请</span>
              </div>
              <div class="action-item" @click="goToAttendance">
                <el-icon class="action-icon"><Clock /></el-icon>
                <span class="action-text">考勤打卡</span>
              </div>
              <div class="action-item" @click="goToEmployee">
                <el-icon class="action-icon"><User /></el-icon>
                <span class="action-text">员工查询</span>
              </div>
            </div>
          </div>
        </div>

        <!-- System Notices -->
        <div class="panel-card">
          <div class="panel-header">
            <div class="panel-title">
              <el-icon><Bell /></el-icon>
              系统公告
            </div>
          </div>
          <div class="panel-body">
            <div class="notice-list">
              <div class="notice-item" v-for="notice in notices" :key="notice.id">
                <div class="notice-badge" :class="notice.type">
                  {{ notice.type === 'important' ? '重' : '通' }}
                </div>
                <div class="notice-content">
                  <div class="notice-title">{{ notice.title }}</div>
                  <div class="notice-date">{{ notice.date }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import {
  Document,
  CircleCheck,
  Clock,
  Bell,
  ArrowRight,
  Lightning,
  Edit,
  Calendar,
  User
} from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()
const { userInfo } = storeToRefs(authStore)

// Current Date
const currentDate = computed(() => {
  const now = new Date()
  return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][now.getDay()]}`
})

// Recent Workflows
const recentWorkflows = ref([
  { id: 1, title: '请假申请 - 年假', applicant: '张三', time: '10分钟前', status: 'pending', statusText: '待审批' },
  { id: 2, title: '采购申请 - 办公设备', applicant: '李四', time: '30分钟前', status: 'pending', statusText: '待审批' },
  { id: 3, title: '报销申请 - 出差费用', applicant: '王五', time: '1小时前', status: 'approved', statusText: '已通过' },
  { id: 4, title: '加班申请', applicant: '赵六', time: '2小时前', status: 'rejected', statusText: '已驳回' }
])

// Notices
const notices = ref([
  { id: 1, title: '系统将于本周六进行升级维护', date: '2024-01-15', type: 'important' },
  { id: 2, title: '2024年春节放假通知', date: '2024-01-10', type: 'normal' },
  { id: 3, title: '考勤规则调整通知', date: '2024-01-08', type: 'normal' }
])

// Navigation Methods
function goToWorkflow() {
  router.push('/workflow/list')
}

function goToWorkflowStart() {
  router.push('/workflow/start')
}

function goToLeave() {
  router.push('/hr/leave')
}

function goToAttendance() {
  router.push('/hr/attendance')
}

function goToEmployee() {
  router.push('/hr/employee')
}
</script>

<style lang="scss">
@use '@/views/dashboard/dashboard' as *;
</style>

<style lang="scss" scoped>
@use '@/scss/variables' as *;
@use '@/scss/mixins' as *;

.dashboard-container {
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
