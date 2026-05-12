<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-header-main">
        <h1 class="page-title">客户管理</h1>
        <p class="page-desc">维护客户档案，区分子公司与业务范围（《结构说明》）。</p>
      </div>
      <el-button type="primary" @click="openCreate">
        <el-icon><Plus /></el-icon>
        新建客户
      </el-button>
    </div>
    <div class="page-body">
      <div class="filter-bar">
        <el-select v-model="filterSub" clearable placeholder="子公司" style="width: 140px">
          <el-option label="全部" value="" />
          <el-option v-for="sid in SUBSIDIARY_IDS" :key="sid" :label="SUBSIDIARIES[sid].name" :value="sid" />
        </el-select>
        <el-input v-model="keyword" clearable placeholder="公司名 / 联系人 / 电话" style="width: 240px" />
      </div>
      <el-table :data="filtered" stripe max-height="1000" style="width: 100%">
        <el-table-column prop="companyName" label="客户名称" min-width="160" show-overflow-tooltip />
        <el-table-column label="子公司" width="110">
          <template #default="{ row }">{{ subsidiaryLabel(row.subsidiaryId) }}</template>
        </el-table-column>
        <el-table-column prop="businessScope" label="业务范围" min-width="140" show-overflow-tooltip />
        <el-table-column prop="contact" label="联系人" width="96" />
        <el-table-column prop="phone" label="电话" width="120" />
        <el-table-column prop="address" label="地址" min-width="160" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="建档时间" width="160" />
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="remove(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="visible" :title="mode === 'create' ? '新建客户' : '编辑客户'" width="520px" destroy-on-close @closed="reset">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="客户名称" prop="companyName">
          <el-input v-model="form.companyName" maxlength="80" show-word-limit />
        </el-form-item>
        <el-form-item label="子公司" prop="subsidiaryId">
          <el-select v-model="form.subsidiaryId" style="width: 100%">
            <el-option v-for="sid in SUBSIDIARY_IDS" :key="sid" :label="SUBSIDIARIES[sid].name" :value="sid" />
          </el-select>
        </el-form-item>
        <el-form-item label="业务范围" prop="businessScope">
          <el-input v-model="form.businessScope" maxlength="120" show-word-limit placeholder="如：编织袋、糖袋" />
        </el-form-item>
        <el-form-item label="联系人" prop="contact">
          <el-input v-model="form.contact" maxlength="20" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="form.phone" maxlength="20" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="form.address" type="textarea" :rows="2" maxlength="200" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="submit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { storeToRefs } from 'pinia'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { SUBSIDIARIES, SUBSIDIARY_IDS, subsidiaryLabel } from '@/constants/subsidiary'
import { useCustomersStore, type Customer, type CustomerInput } from '@/stores/customers'
import type { SubsidiaryId } from '@/constants/subsidiary'

const store = useCustomersStore()
const { list } = storeToRefs(store)

const filterSub = ref<'' | SubsidiaryId>('')
const keyword = ref('')

const filtered = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  return list.value.filter((c) => {
    const okSub = !filterSub.value || c.subsidiaryId === filterSub.value
    const okKw =
      !kw ||
      c.companyName.toLowerCase().includes(kw) ||
      c.contact.toLowerCase().includes(kw) ||
      c.phone.includes(kw)
    return okSub && okKw
  })
})

const visible = ref(false)
const mode = ref<'create' | 'edit'>('create')
const editingId = ref<string | null>(null)
const formRef = ref<FormInstance>()
const form = reactive<CustomerInput>({
  companyName: '',
  subsidiaryId: SUBSIDIARY_IDS[0],
  contact: '',
  phone: '',
  businessScope: '',
  address: ''
})

const rules: FormRules = {
  companyName: [{ required: true, message: '请输入客户名称', trigger: 'blur' }],
  subsidiaryId: [{ required: true, message: '请选择子公司', trigger: 'change' }],
  contact: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入电话', trigger: 'blur' }],
  businessScope: [{ required: true, message: '请填写业务范围', trigger: 'blur' }],
  address: [{ required: true, message: '请填写地址', trigger: 'blur' }]
}

function reset() {
  editingId.value = null
  form.companyName = ''
  form.subsidiaryId = SUBSIDIARY_IDS[0]
  form.contact = ''
  form.phone = ''
  form.businessScope = ''
  form.address = ''
  formRef.value?.clearValidate()
}

function openCreate() {
  mode.value = 'create'
  reset()
  visible.value = true
}

function openEdit(row: Customer) {
  mode.value = 'edit'
  editingId.value = row.id
  form.companyName = row.companyName
  form.subsidiaryId = row.subsidiaryId
  form.contact = row.contact
  form.phone = row.phone
  form.businessScope = row.businessScope
  form.address = row.address
  visible.value = true
}

function submit() {
  formRef.value?.validate((ok) => {
    if (!ok) return
    if (mode.value === 'create') {
      store.addCustomer({ ...form })
      ElMessage.success('已添加客户')
    } else if (editingId.value) {
      store.updateCustomer(editingId.value, { ...form })
      ElMessage.success('已保存')
    }
    visible.value = false
  })
}

function remove(row: Customer) {
  ElMessageBox.confirm(`删除客户「${row.companyName}」？`, '确认', { type: 'warning' })
    .then(() => {
      store.removeCustomer(row.id)
      ElMessage.success('已删除')
    })
    .catch(() => {})
}
</script>

<style lang="scss" scoped>
@use '@/scss/variables' as *;
@use '@/scss/mixins' as *;

.page-container {
  @include custom-scrollbar;
}

.page-header {
  @include industrial-card;
  padding: 20px 24px;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0 0 8px;
}

.page-desc {
  margin: 0;
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
  max-width: 640px;
}

.page-body {
  @include industrial-card;
  padding: 20px;
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
</style>
