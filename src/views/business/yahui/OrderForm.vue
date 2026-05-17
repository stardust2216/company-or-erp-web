<template>
  <el-dialog
    :model-value="visible"
    :title="isEdit ? '编辑订单' : '新建订单'"
    width="800px"
    :close-on-click-modal="false"
    @update:model-value="$emit('cancel')"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      label-position="right"
    >
      <!-- 客户信息 -->
      <el-form-item label="客户名称" prop="customer">
        <el-input v-model="form.customer" placeholder="请输入客户名称" />
      </el-form-item>
      <el-form-item label="联系人" prop="contact">
        <el-input v-model="form.contact" placeholder="请输入联系人" />
      </el-form-item>
      <el-form-item label="联系电话" prop="phone">
        <el-input v-model="form.phone" placeholder="请输入联系电话" />
      </el-form-item>

      <!-- 产品明细 -->
      <el-divider content-position="left">产品明细</el-divider>
      <div v-for="(line, index) in form.lines" :key="index" class="line-row">
        <el-form-item
          :label="'产品' + (index + 1)"
          :prop="'lines.' + index + '.productName'"
          :rules="{ required: true, message: '请输入产品名称', trigger: 'blur' }"
        >
          <el-input v-model="line.productName" placeholder="产品名称" style="width: 180px" />
        </el-form-item>
        <el-form-item
          label="规格"
          :prop="'lines.' + index + '.spec'"
        >
          <el-input v-model="line.spec" placeholder="规格" style="width: 140px" />
        </el-form-item>
        <el-form-item
          label="数量"
          :prop="'lines.' + index + '.qty'"
          :rules="{ required: true, message: '请输入数量', trigger: 'blur' }"
        >
          <el-input-number v-model="line.qty" :min="1" style="width: 120px" />
        </el-form-item>
        <el-form-item
          label="单价"
          :prop="'lines.' + index + '.unitPrice'"
          :rules="{ required: true, message: '请输入单价', trigger: 'blur' }"
        >
          <el-input-number v-model="line.unitPrice" :min="0" :precision="2" style="width: 120px" />
        </el-form-item>
        <el-button type="danger" link @click="removeLine(index)" v-if="form.lines.length > 1">
          <el-icon><Delete /></el-icon>
        </el-button>
      </div>
      <el-button type="primary" link @click="addLine">
        <el-icon><Plus /></el-icon> 添加产品
      </el-button>

      <!-- 其他信息 -->
      <el-divider content-position="left">其他信息</el-divider>
      <el-form-item label="交货地址" prop="deliveryAddress">
        <el-input v-model="form.deliveryAddress" placeholder="请输入交货地址" />
      </el-form-item>
      <el-form-item label="期望交期" prop="expectedFinishDate">
        <el-date-picker
          v-model="form.expectedFinishDate"
          type="date"
          placeholder="选择日期"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="订单状态" prop="status">
        <el-select v-model="form.status" placeholder="请选择状态">
          <el-option
            v-for="(label, key) in ORDER_STATUS_LABEL"
            :key="key"
            :label="label"
            :value="key"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="开票状态" prop="invoiceStatus">
        <el-select v-model="form.invoiceStatus" placeholder="请选择开票状态">
          <el-option label="未开票" value="none" />
          <el-option label="开票中" value="pending" />
          <el-option label="已开票" value="done" />
        </el-select>
      </el-form-item>
      <el-form-item label="回款进度" prop="paymentProgress">
        <el-slider v-model="form.paymentProgress" :format-tooltip="(val: number) => val + '%'" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="$emit('cancel')">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import { ORDER_STATUS_LABEL, type Order, type OrderLineInput } from '@/types'

const props = defineProps<{
  visible: boolean
  orderData?: Order | null
}>()

const emit = defineEmits<{
  submit: [input: any]
  cancel: []
}>()

const isEdit = computed(() => !!props.orderData)

const formRef = ref()
const form = reactive({
  customer: '',
  contact: '',
  phone: '',
  deliveryAddress: '',
  expectedFinishDate: '',
  status: 'pending' as 'pending' | 'production' | 'shipped' | 'invoiced' | 'completed',
  invoiceStatus: 'none' as 'none' | 'pending' | 'done',
  paymentProgress: 0,
  remark: '',
  lines: [{ productName: '', spec: '', qty: 1, unitPrice: 0 }] as OrderLineInput[]
})

const rules = {
  customer: [{ required: true, message: '请输入客户名称', trigger: 'blur' }],
  contact: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
}

// 初始化表单
watch(() => props.orderData, (val) => {
  if (val) {
    form.customer = val.customer
    form.contact = val.contact
    form.phone = val.phone
    form.deliveryAddress = val.deliveryAddress
    form.expectedFinishDate = val.expectedFinishDate
    form.status = val.status
    form.invoiceStatus = val.invoiceStatus
    form.paymentProgress = val.paymentProgress
    form.remark = val.remark || ''
    form.lines = val.lines.map(l => ({
      productName: l.productName,
      spec: l.spec,
      qty: l.qty,
      unit: l.unit,
      unitPrice: l.unitPrice
    }))
  } else {
    resetForm()
  }
}, { immediate: true })

function resetForm() {
  form.customer = ''
  form.contact = ''
  form.phone = ''
  form.deliveryAddress = ''
  form.expectedFinishDate = ''
  form.status = 'pending'
  form.invoiceStatus = 'none'
  form.paymentProgress = 0
  form.remark = ''
  form.lines = [{ productName: '', spec: '', qty: 1, unit: '', unitPrice: 0 }]
}

function addLine() {
  form.lines.push({ productName: '', spec: '', qty: 1, unit: '', unitPrice: 0 })
}

function removeLine(index: number) {
  form.lines.splice(index, 1)
}

function handleSubmit() {
  formRef.value?.validate((valid: boolean) => {
    if (!valid) return
    emit('submit', { ...form })
  })
}
</script>

<style lang="scss" scoped>
.line-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
</style>
