<template>
  <div class="workflow-start-container">
    <div class="start-card">
      <div class="card-header">
        <div class="header-left">
          <div class="back-btn" @click="goBack">
            <el-icon size="20"><ArrowLeft /></el-icon>
          </div>
          <span class="header-title">发起申请</span>
        </div>
      </div>
      
      <div class="card-body">
        <!-- Workflow Type Selection -->
        <div class="type-selection">
          <div class="section-title">选择申请类型</div>
          <div class="type-grid">
            <div
              class="type-item"
              :class="{ active: form.type === 'leave' }"
              @click="form.type = 'leave'"
            >
              <el-icon class="type-icon"><Calendar /></el-icon>
              <span class="type-name">请假申请</span>
            </div>
            <div
              class="type-item"
              :class="{ active: form.type === 'purchase' }"
              @click="form.type = 'purchase'"
            >
              <el-icon class="type-icon"><ShoppingCart /></el-icon>
              <span class="type-name">采购申请</span>
            </div>
            <div
              class="type-item"
              :class="{ active: form.type === 'expense' }"
              @click="form.type = 'expense'"
            >
              <el-icon class="type-icon"><Money /></el-icon>
              <span class="type-name">报销申请</span>
            </div>
            <div
              class="type-item"
              :class="{ active: form.type === 'overtime' }"
              @click="form.type = 'overtime'"
            >
              <el-icon class="type-icon"><Clock /></el-icon>
              <span class="type-name">加班申请</span>
            </div>
          </div>
        </div>

        <!-- Leave Form -->
        <template v-if="form.type === 'leave'">
          <div class="form-section">
            <div class="section-title">请假信息</div>
            <div class="form-grid">
              <div class="form-item">
                <div class="form-label">
                  请假类型<span class="required">*</span>
                </div>
                <el-select v-model="form.leaveType" placeholder="请选择请假类型" style="width: 100%">
                  <el-option label="年假" value="annual" />
                  <el-option label="事假" value="personal" />
                  <el-option label="病假" value="sick" />
                  <el-option label="婚假" value="marriage" />
                  <el-option label="产假" value="maternity" />
                </el-select>
              </div>
              <div class="form-item">
                <div class="form-label">
                  申请天数<span class="required">*</span>
                </div>
                <el-input-number v-model="form.days" :min="1" :max="30" style="width: 100%" />
              </div>
              <div class="form-item">
                <div class="form-label">
                  开始日期<span class="required">*</span>
                </div>
                <el-date-picker
                  v-model="form.startDate"
                  type="date"
                  placeholder="选择开始日期"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
              </div>
              <div class="form-item">
                <div class="form-label">
                  结束日期<span class="required">*</span>
                </div>
                <el-date-picker
                  v-model="form.endDate"
                  type="date"
                  placeholder="选择结束日期"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
              </div>
              <div class="form-item full-width">
                <div class="form-label">
                  请假原因<span class="required">*</span>
                </div>
                <el-input
                  v-model="form.reason"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入请假原因"
                />
              </div>
            </div>
          </div>
        </template>

        <!-- Purchase Form -->
        <template v-else-if="form.type === 'purchase'">
          <div class="form-section">
            <div class="section-title">采购信息</div>
            <div class="form-grid">
              <div class="form-item">
                <div class="form-label">
                  物品名称<span class="required">*</span>
                </div>
                <el-input v-model="form.itemName" placeholder="请输入物品名称" />
              </div>
              <div class="form-item">
                <div class="form-label">
                  预算金额<span class="required">*</span>
                </div>
                <el-input v-model="form.amount" placeholder="请输入预算金额">
                  <template #prepend>¥</template>
                </el-input>
              </div>
              <div class="form-item full-width">
                <div class="form-label">
                  采购原因<span class="required">*</span>
                </div>
                <el-input
                  v-model="form.reason"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入采购原因"
                />
              </div>
            </div>
          </div>
        </template>

        <!-- Expense Form -->
        <template v-else-if="form.type === 'expense'">
          <div class="form-section">
            <div class="section-title">报销信息</div>
            <div class="form-grid">
              <div class="form-item">
                <div class="form-label">
                  费用类型<span class="required">*</span>
                </div>
                <el-select v-model="form.expenseType" placeholder="请选择费用类型" style="width: 100%">
                  <el-option label="差旅费" value="travel" />
                  <el-option label="交通费" value="transport" />
                  <el-option label="餐饮费" value="meal" />
                  <el-option label="办公费" value="office" />
                  <el-option label="其他" value="other" />
                </el-select>
              </div>
              <div class="form-item">
                <div class="form-label">
                  报销金额<span class="required">*</span>
                </div>
                <el-input v-model="form.amount" placeholder="请输入报销金额">
                  <template #prepend>¥</template>
                </el-input>
              </div>
              <div class="form-item full-width">
                <div class="form-label">
                  费用说明<span class="required">*</span>
                </div>
                <el-input
                  v-model="form.reason"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入费用说明"
                />
              </div>
            </div>
          </div>
        </template>

        <!-- Overtime Form -->
        <template v-else-if="form.type === 'overtime'">
          <div class="form-section">
            <div class="section-title">加班信息</div>
            <div class="form-grid">
              <div class="form-item">
                <div class="form-label">
                  加班日期<span class="required">*</span>
                </div>
                <el-date-picker
                  v-model="form.overtimeDate"
                  type="date"
                  placeholder="选择加班日期"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
              </div>
              <div class="form-item">
                <div class="form-label">
                  加班时长<span class="required">*</span>
                </div>
                <el-select v-model="form.hours" placeholder="请选择加班时长" style="width: 100%">
                  <el-option label="2小时" value="2" />
                  <el-option label="4小时" value="4" />
                  <el-option label="6小时" value="6" />
                  <el-option label="8小时" value="8" />
                </el-select>
              </div>
              <div class="form-item full-width">
                <div class="form-label">
                  加班原因<span class="required">*</span>
                </div>
                <el-input
                  v-model="form.reason"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入加班原因"
                />
              </div>
            </div>
          </div>
        </template>

        <!-- Approval Flow Preview -->
        <div class="approval-preview">
          <div class="preview-title">审批流程预览</div>
          <div class="preview-flow">
            <div class="flow-item">
              <div class="flow-avatar">张</div>
              <span>张三</span>
            </div>
            <el-icon class="flow-arrow"><ArrowRight /></el-icon>
            <div class="flow-item">
              <div class="flow-avatar">李</div>
              <span>李经理</span>
            </div>
            <el-icon class="flow-arrow"><ArrowRight /></el-icon>
            <div class="flow-item">
              <div class="flow-avatar">人</div>
              <span>人事专员</span>
            </div>
          </div>
        </div>

        <!-- Submit Section -->
        <div class="submit-section">
          <el-button @click="goBack">取消</el-button>
          <el-button type="primary" @click="handleSubmit">提交申请</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Calendar, ShoppingCart, Money, Clock, ArrowRight } from '@element-plus/icons-vue'

const router = useRouter()

const form = reactive({
  type: 'leave',
  leaveType: '',
  days: 1,
  startDate: '',
  endDate: '',
  reason: '',
  itemName: '',
  amount: '',
  expenseType: '',
  overtimeDate: '',
  hours: ''
})

function goBack() {
  router.back()
}

function handleSubmit() {
  if (!form.type) {
    ElMessage.warning('请选择申请类型')
    return
  }
  if (!form.reason) {
    ElMessage.warning('请填写申请原因')
    return
  }
  
  ElMessage.success('申请已提交')
  router.push('/workflow/list')
}
</script>

<style lang="scss">
@use '@/views/workflow/workflow-start' as *;
</style>

<style lang="scss" scoped>
@use '@/scss/variables' as *;
@use '@/scss/mixins' as *;

.workflow-start-container {
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
