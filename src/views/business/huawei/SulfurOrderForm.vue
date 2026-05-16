<template>
  <el-dialog
    :model-value="visible"
    :title="isEdit ? '编辑订单' : '新建订单'"
    width="680px"
    :close-on-click-modal="false"
    @close="handleCancel"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="120px"
      class="order-form"
    >
      <!-- 基本信息 -->
      <div class="form-section">
        <div class="section-title">基本信息</div>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="合同编号" prop="contractNo">
              <el-input v-model="form.contractNo" placeholder="请输入合同编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="合同日期" prop="contractDate">
              <el-date-picker
                v-model="form.contractDate"
                type="date"
                value-format="YYYY.MM.DD"
                placeholder="选择日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="集团名称" prop="customerGroup">
              <el-input v-model="form.customerGroup" placeholder="请输入集团名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="使用单位" prop="customerUnit">
              <el-input v-model="form.customerUnit" placeholder="请输入使用单位" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="片区" prop="region">
              <el-select v-model="form.region" placeholder="请选择片区" style="width: 100%">
                <el-option label="广西片区" value="guangxi" />
                <el-option label="云南片区" value="yunnan" />
                <el-option label="贵州片区" value="guizhou" />
                <el-option label="其他片区" value="other" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="送货方式" prop="deliveryMethod">
              <el-radio-group v-model="form.deliveryMethod">
                <el-radio value="self_pickup">自提</el-radio>
                <el-radio value="deliver">送到</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 产品信息 -->
      <div class="form-section">
        <div class="section-title">产品信息</div>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="产品类型" prop="productType">
              <el-radio-group v-model="form.productType">
                <el-radio value="block">块磺</el-radio>
                <el-radio value="granular">粒磺</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单价(元/吨)" prop="unitPrice">
              <el-input-number
                v-model="form.unitPrice"
                :min="0"
                :precision="2"
                :step="100"
                placeholder="请输入单价"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="块磺数量(吨)">
              <el-input-number
                v-model="form.qtyBlock"
                :min="0"
                :precision="2"
                :step="10"
                placeholder="块磺数量"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="粒磺数量(吨)">
              <el-input-number
                v-model="form.qtyGranular"
                :min="0"
                :precision="2"
                :step="10"
                placeholder="粒磺数量"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="合计数量(吨)">
              <el-input :model-value="totalQty" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="合同金额(元)">
              <el-input :model-value="totalAmount" disabled />
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 财务信息 -->
      <div class="form-section">
        <div class="section-title">财务信息</div>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="回款进度(%)" prop="paymentProgress">
              <el-slider
                v-model="form.paymentProgress"
                :min="0"
                :max="100"
                :step="5"
                show-input
                :show-input-controls="false"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="已付金额(元)">
              <el-input-number
                v-model="form.paidAmount"
                :min="0"
                :precision="2"
                :step="10000"
                placeholder="已付金额"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="开票状态" prop="invoiceStatus">
              <el-select v-model="form.invoiceStatus" placeholder="请选择" style="width: 100%">
                <el-option label="未开票" value="none" />
                <el-option label="部分开票" value="partial" />
                <el-option label="已开票" value="done" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="已开票金额(元)">
              <el-input-number
                v-model="form.invoicedAmount"
                :min="0"
                :precision="2"
                :step="10000"
                placeholder="已开票金额"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 备注 -->
      <div class="form-section">
        <div class="section-title">备注</div>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </div>
    </el-form>

    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">
        {{ isEdit ? '保存' : '创建' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { SulfurOrder, SulfurOrderInput } from '@/types/sulfurOrder'

const props = defineProps<{
  visible: boolean
  orderData: SulfurOrder | null
}>()

const emit = defineEmits<{
  submit: [data: SulfurOrderInput]
  cancel: []
}>()

const formRef = ref<FormInstance>()
const submitting = ref(false)

// 是否编辑模式
const isEdit = computed(() => !!props.orderData)

// 表单数据
interface OrderFormData {
  contractNo: string
  contractDate: string
  region: 'guangxi' | 'yunnan' | 'guizhou' | 'other'
  customerGroup: string
  customerUnit: string
  productType: 'block' | 'granular'
  qtyBlock: number
  qtyGranular: number
  unitPrice: number
  deliveryMethod: 'self_pickup' | 'deliver'
  paymentProgress: number
  paymentStatus: 'unpaid' | 'partial' | 'paid'
  invoiceStatus: 'none' | 'partial' | 'done'
  paidAmount: number
  invoicedAmount: number
  remark: string
}

const defaultForm: OrderFormData = {
  contractNo: '',
  contractDate: '',
  region: 'guangxi',
  customerGroup: '',
  customerUnit: '',
  productType: 'granular',
  qtyBlock: 0,
  qtyGranular: 0,
  unitPrice: 0,
  deliveryMethod: 'self_pickup',
  paymentProgress: 0,
  paymentStatus: 'unpaid',
  invoiceStatus: 'none',
  paidAmount: 0,
  invoicedAmount: 0,
  remark: ''
}

const form = reactive<OrderFormData>({ ...defaultForm })

// 计算属性
const totalQty = computed(() => {
  return (form.qtyBlock + form.qtyGranular).toLocaleString()
})

const totalAmount = computed(() => {
  const total = (form.qtyBlock + form.qtyGranular) * form.unitPrice
  return total.toLocaleString()
})

// 表单验证规则
const rules: FormRules = {
  contractNo: [{ required: true, message: '请输入合同编号', trigger: 'blur' }],
  contractDate: [{ required: true, message: '请选择合同日期', trigger: 'change' }],
  customerGroup: [{ required: true, message: '请输入集团名称', trigger: 'blur' }],
  customerUnit: [{ required: true, message: '请输入使用单位', trigger: 'blur' }],
  region: [{ required: true, message: '请选择片区', trigger: 'change' }],
  unitPrice: [{ required: true, message: '请输入单价', trigger: 'blur' }]
}

// 监听 props 变化，填充表单
watch(() => props.orderData, (newData) => {
  if (newData) {
    // 编辑模式：填充现有数据
    form.contractNo = newData.contractNo
    form.contractDate = newData.contractDate
    form.region = newData.region
    form.customerGroup = newData.customerGroup
    form.customerUnit = newData.customerUnit
    form.productType = newData.productType as 'block' | 'granular'
    form.qtyBlock = newData.qtyBlock
    form.qtyGranular = newData.qtyGranular
    form.unitPrice = newData.unitPrice
    form.deliveryMethod = newData.deliveryMethod
    form.paymentProgress = newData.paymentProgress
    form.invoiceStatus = newData.invoiceStatus
    form.paidAmount = newData.paidAmount
    form.invoicedAmount = newData.invoicedAmount
    form.remark = newData.remark
  } else {
    // 新建模式：重置表单
    resetForm()
  }
}, { immediate: true })

// 重置表单
function resetForm() {
  Object.assign(form, defaultForm)
  formRef.value?.clearValidate()
}

// 提交
async function handleSubmit() {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    const submitData: SulfurOrderInput = {
      contractNo: form.contractNo,
      contractDate: form.contractDate,
      region: form.region,
      customerGroup: form.customerGroup,
      customerUnit: form.customerUnit,
      productType: form.productType,
      qtyBlock: form.qtyBlock,
      qtyGranular: form.qtyGranular,
      unitPrice: form.unitPrice,
      deliveryMethod: form.deliveryMethod,
      paymentProgress: form.paymentProgress,
      invoiceStatus: form.invoiceStatus,
      paidAmount: form.paidAmount,
      invoicedAmount: form.invoicedAmount,
      remark: form.remark
    }

    emit('submit', submitData)
  } catch (e) {
    // 验证失败
  } finally {
    submitting.value = false
  }
}

// 取消
function handleCancel() {
  emit('cancel')
}
</script>

<style lang="scss" scoped>
.order-form {
  .form-section {
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px dashed #ebeef5;

    &:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }

    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 16px;
      padding-left: 8px;
      border-left: 3px solid #409eff;
    }
  }
}
</style>
