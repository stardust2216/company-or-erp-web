<template>
  <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
    <el-form-item v-if="mode === 'edit'" label="订单号">
      <el-input :model-value="orderNo" disabled />
    </el-form-item>

    <el-form-item label="子公司" prop="subsidiaryId">
      <SubsidiarySelector v-model="form.subsidiaryId" width="100%" :show-all="false" />
    </el-form-item>

    <el-form-item label="客户名称" prop="customer">
      <el-input v-model="form.customer" maxlength="80" show-word-limit placeholder="客户名称" />
    </el-form-item>

    <el-row :gutter="12">
      <el-col :span="12">
        <el-form-item label="交货地址" prop="deliveryAddress">
          <el-input v-model="form.deliveryAddress" maxlength="120" placeholder="收货地址" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="计划完成" prop="expectedFinishDate">
          <el-input v-model="form.expectedFinishDate" placeholder="如 2024-06-30" maxlength="20" />
        </el-form-item>
      </el-col>
    </el-row>

    <!-- 产品明细 -->
    <el-form-item label="产品明细" required>
      <OrderLinesEditor
        v-model:lines="form.lines"
        editable
      />
    </el-form-item>

    <el-row :gutter="12">
      <el-col :span="8">
        <el-form-item label="订单状态" prop="status">
          <el-select v-model="form.status" placeholder="状态" style="width: 100%">
            <el-option
              v-for="s in statusOptions"
              :key="s.value"
              :label="s.label"
              :value="s.value"
            />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="开票状态" prop="invoiceStatus">
          <el-select v-model="form.invoiceStatus" style="width: 100%">
            <el-option label="未开票" value="none" />
            <el-option label="开票中" value="pending" />
            <el-option label="已开票" value="done" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="回款进度">
          <el-slider v-model="form.paymentProgress" :marks="{ 0: '0', 50: '50', 100: '100' }" />
        </el-form-item>
      </el-col>
    </el-row>

    <el-form-item label="联系人" prop="contact">
      <el-input v-model="form.contact" maxlength="20" />
    </el-form-item>
    <el-form-item label="联系电话" prop="phone">
      <el-input v-model="form.phone" maxlength="20" />
    </el-form-item>
    <el-form-item label="备注" prop="remark">
      <el-input v-model="form.remark" type="textarea" :rows="2" maxlength="200" show-word-limit />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { Order, OrderLine } from '@/types'
import { ORDER_STATUS_LABEL } from '@/types'
import type { SubsidiaryId } from '@/constants/subsidiary'
import { SUBSIDIARY_IDS } from '@/constants/subsidiary'
import SubsidiarySelector from '@/components/business/SubsidiarySelector.vue'
import OrderLinesEditor from '@/components/business/OrderLinesEditor.vue'

export interface OrderFormData {
  subsidiaryId: SubsidiaryId | ''
  customer: string
  contact: string
  phone: string
  remark: string
  deliveryAddress: string
  expectedFinishDate: string
  status: string
  invoiceStatus: string
  paymentProgress: number
  lines: OrderLine[]
}

const props = defineProps<{
  mode: 'create' | 'edit'
  orderNo?: string
}>()

const emit = defineEmits<{
  submit: [data: OrderFormData]
  cancel: []
}>()

const formRef = ref<FormInstance>()

const statusOptions = Object.entries(ORDER_STATUS_LABEL).map(([value, label]) => ({ value, label }))

const form = reactive<OrderFormData>({
  subsidiaryId: SUBSIDIARY_IDS[0],
  customer: '',
  contact: '',
  phone: '',
  remark: '',
  deliveryAddress: '',
  expectedFinishDate: '',
  status: 'pending',
  invoiceStatus: 'none',
  paymentProgress: 0,
  lines: [emptyLine()]
})

const formRules: FormRules = {
  subsidiaryId: [{ required: true, message: '请选择子公司', trigger: 'change' }],
  customer: [{ required: true, message: '请输入客户名称', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  invoiceStatus: [{ required: true, message: '请选择开票状态', trigger: 'change' }],
  contact: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }]
}

function emptyLine(): OrderLine {
  return {
    id: `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    productName: '', spec: '', qty: 0, unit: '条', unitPrice: 0
  }
}

function reset() {
  form.subsidiaryId = SUBSIDIARY_IDS[0]
  form.customer = ''
  form.contact = ''
  form.phone = ''
  form.remark = ''
  form.deliveryAddress = ''
  form.expectedFinishDate = ''
  form.status = 'pending'
  form.invoiceStatus = 'none'
  form.paymentProgress = 0
  form.lines = [emptyLine()]
  formRef.value?.clearValidate()
}

function loadOrder(order: Order) {
  form.subsidiaryId = order.subsidiaryId
  form.customer = order.customer
  form.contact = order.contact
  form.phone = order.phone
  form.remark = order.remark
  form.deliveryAddress = order.deliveryAddress
  form.expectedFinishDate = order.expectedFinishDate
  form.status = order.status
  form.invoiceStatus = order.invoiceStatus
  form.paymentProgress = order.paymentProgress
  form.lines = order.lines.map((l) => ({ ...l }))
}

async function validate(): Promise<boolean> {
  const ok = await formRef.value?.validate().catch(() => false)
  if (!ok) return false

  if (!form.lines.length) {
    return false
  }
  for (const r of form.lines) {
    if (!r.productName?.trim()) return false
    if (!r.qty || r.qty <= 0) return false
    if (r.unitPrice == null || r.unitPrice < 0) return false
  }
  return true
}

defineExpose({ validate, reset, loadOrder, formRef })
</script>
