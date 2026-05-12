<template>
  <div class="attendance-container">
    <!-- Stats Card -->
    <div class="stats-card">
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-value success">22</div>
          <div class="stat-label">本月出勤天数</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">0</div>
          <div class="stat-label">迟到次数</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">0</div>
          <div class="stat-label">早退次数</div>
        </div>
        <div class="stat-item">
          <div class="stat-value danger">1</div>
          <div class="stat-label">缺卡次数</div>
        </div>
      </div>
    </div>

    <!-- Check In Card -->
    <div class="checkin-card">
      <div class="card-header">
        <div class="header-title">今日打卡</div>
        <div class="current-date">{{ currentDateStr }}</div>
      </div>
      <div class="card-body">
        <div class="checkin-content">
          <div class="checkin-item">
            <div class="checkin-time">{{ currentTime }}</div>
            <div class="checkin-label">上班打卡</div>
            <div class="checkin-btn" :class="morningRecord ? 'disabled' : 'punch-in'" @click="handlePunchIn">
              {{ morningRecord ? morningRecord : '上班打卡' }}
            </div>
          </div>
          
          <div class="checkin-divider"></div>
          
          <div class="checkin-item">
            <div class="checkin-time">{{ currentTime }}</div>
            <div class="checkin-label">下班打卡</div>
            <div class="checkin-btn" :class="afternoonRecord || !morningRecord ? 'disabled' : 'punch-out'" @click="handlePunchOut" :disabled="!morningRecord">
              {{ afternoonRecord ? afternoonRecord : '下班打卡' }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Calendar Card -->
    <div class="calendar-card">
      <div class="card-header">
        <div class="header-title">考勤日历</div>
        <div class="header-actions">
          <el-button-group>
            <el-button @click="prevMonth">
              <el-icon><ArrowLeft /></el-icon>
            </el-button>
            <el-button>{{ currentYear }}年{{ currentMonth + 1 }}月</el-button>
            <el-button @click="nextMonth">
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </el-button-group>
        </div>
      </div>
      <div class="card-body">
        <div class="attendance-calendar">
          <div class="calendar-header">
            <div class="header-cell" v-for="day in weekDays" :key="day">{{ day }}</div>
          </div>
          <div class="calendar-grid">
            <div
              v-for="(day, index) in calendarDays"
              :key="index"
              class="calendar-cell"
              :class="{
                'other-month': !day.currentMonth,
                'today': day.isToday,
                'has-record': day.hasRecord,
                'late': day.isLate,
                'absent': day.isAbsent
              }"
            >
              {{ day.date }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Records -->
    <div class="record-section">
      <div class="section-title">打卡记录</div>
      <div class="record-table">
        <div class="record-item" v-for="record in recentRecords" :key="record.date">
          <div class="record-date">{{ record.date }}</div>
          <div class="record-time">
            <div class="time-item">
              <span class="time-label">上班</span>
              <span class="time-value" :class="record.morningStatus">{{ record.morning }}</span>
            </div>
            <div class="time-item">
              <span class="time-label">下班</span>
              <span class="time-value" :class="record.afternoonStatus">{{ record.afternoon }}</span>
            </div>
          </div>
          <div class="record-status">
            <el-tag :type="getStatusType(record.status)" size="small">
              {{ record.statusName }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// Current Date/Time
const currentTime = ref('')
const currentDateStr = ref('')
const morningRecord = ref('')
const afternoonRecord = ref('')

// Calendar State
const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth())
const weekDays = ['日', '一', '二', '三', '四', '五', '六']

// Calendar Days
const calendarDays = computed(() => {
  const days = []
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
  const startWeek = firstDay.getDay()
  const endWeek = lastDay.getDay()
  
  // Previous month days
  for (let i = startWeek - 1; i >= 0; i--) {
    const date = new Date(currentYear.value, currentMonth.value, -i)
    days.push({
      date: date.getDate(),
      currentMonth: false,
      isToday: false,
      hasRecord: false,
      isLate: false,
      isAbsent: false
    })
  }
  
  // Current month days
  const today = new Date()
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(currentYear.value, currentMonth.value, i)
    const isToday = date.toDateString() === today.toDateString()
    days.push({
      date: i,
      currentMonth: true,
      isToday,
      hasRecord: Math.random() > 0.3,
      isLate: Math.random() > 0.8,
      isAbsent: Math.random() > 0.9
    })
  }
  
  // Next month days
  for (let i = 1; i < 7 - endWeek; i++) {
    days.push({
      date: i,
      currentMonth: false,
      isToday: false,
      hasRecord: false,
      isLate: false,
      isAbsent: false
    })
  }
  
  return days
})

// Recent Records
const recentRecords = ref([
  { date: '2024-01-15', morning: '08:58', morningStatus: 'normal', afternoon: '18:05', afternoonStatus: 'normal', status: 'normal', statusName: '正常' },
  { date: '2024-01-14', morning: '09:15', morningStatus: 'late', afternoon: '18:02', afternoonStatus: 'normal', status: 'late', statusName: '迟到' },
  { date: '2024-01-13', morning: '08:55', morningStatus: 'normal', afternoon: '18:00', afternoonStatus: 'normal', status: 'normal', statusName: '正常' },
  { date: '2024-01-12', morning: '08:59', morningStatus: 'normal', afternoon: '17:58', afternoonStatus: 'normal', status: 'normal', statusName: '正常' },
  { date: '2024-01-11', morning: '09:02', morningStatus: 'normal', afternoon: '18:03', afternoonStatus: 'normal', status: 'normal', statusName: '正常' }
])

// Methods
function updateTime() {
  const now = new Date()
  currentTime.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  currentDateStr.value = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 星期${['日', '一', '二', '三', '四', '五', '六'][now.getDay()]}`
}

function handlePunchIn() {
  if (morningRecord.value) return
  morningRecord.value = currentTime.value
  ElMessage.success('上班打卡成功')
}

function handlePunchOut() {
  if (afternoonRecord.value || !morningRecord.value) return
  afternoonRecord.value = currentTime.value
  ElMessage.success('下班打卡成功')
}

function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

function getStatusType(status: string) {
  const typeMap: Record<string, string> = {
    normal: 'success',
    late: 'warning',
    absent: 'danger'
  }
  return typeMap[status] || 'info'
}

let timer: number

onMounted(() => {
  updateTime()
  timer = window.setInterval(updateTime, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style lang="scss">
@use '@/views/hr/attendance' as *;
</style>

<style lang="scss" scoped>
@use '@/scss/variables' as *;
@use '@/scss/mixins' as *;

.attendance-container {
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
