// ============================================
// useFormDialog - 表单弹窗通用 Composables
// Company OA ERP - Core Business Module
// ============================================

import { ref, reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'

export interface UseFormDialogOptions<TForm, TSubmitResult = void> {
  /** 表单初始值工厂 */
  initialForm: () => TForm
  /** 表单校验规则 */
  rules?: FormRules
  /** 提交处理函数 */
  onSubmit: (form: TForm, mode: 'create' | 'edit', editingId: string | null) => Promise<TSubmitResult>
  /** 成功消息 */
  successCreateMsg?: string
  successEditMsg?: string
}

/**
 * 通用创建/编辑表单弹窗 Composable
 *
 * @example
 * ```ts
 * const { dialogVisible, openCreate, openEdit, submitForm, ... } = useFormDialog({
 *   initialForm: () => ({ name: '', phone: '' }),
 *   rules: { name: [{ required: true }] },
 *   onSubmit: async (form, mode, id) => {
 *     if (mode === 'create') store.addCustomer(form)
 *     else store.updateCustomer(id!, form)
 *   }
 * })
 * ```
 */
export function useFormDialog<TForm extends Record<string, unknown>, TSubmitResult = void>(
  options: UseFormDialogOptions<TForm, TSubmitResult>
) {
  const { initialForm, onSubmit, successCreateMsg = '创建成功', successEditMsg = '保存成功' } = options

  const dialogVisible = ref(false)
  const mode = ref<'create' | 'edit'>('create')
  const editingId = ref<string | null>(null)
  const submitting = ref(false)
  const formRef = ref<FormInstance>()
  const form = reactive(initialForm()) as TForm

  function resetForm() {
    editingId.value = null
    const fresh = initialForm()
    Object.keys(fresh).forEach((key) => {
      ;(form as Record<string, unknown>)[key] = (fresh as Record<string, unknown>)[key]
    })
    formRef.value?.clearValidate()
  }

  /** 打开新建弹窗 */
  function openCreate() {
    mode.value = 'create'
    resetForm()
    dialogVisible.value = true
  }

  /** 打开编辑弹窗 */
  function openEdit(id: string, data: TForm) {
    mode.value = 'edit'
    editingId.value = id
    const fresh = initialForm()
    Object.keys(fresh).forEach((key) => {
      ;(form as Record<string, unknown>)[key] = (data as Record<string, unknown>)[key]
    })
    formRef.value?.clearValidate()
    dialogVisible.value = true
  }

  /** 提交表单 */
  async function submitForm() {
    const valid = await formRef.value?.validate().catch(() => false)
    if (!valid) return

    submitting.value = true
    try {
      await onSubmit({ ...form }, mode.value, editingId.value)
      ElMessage.success(mode.value === 'create' ? successCreateMsg : successEditMsg)
      dialogVisible.value = false
    } catch (err) {
      ElMessage.error((err as Error).message || '操作失败')
    } finally {
      submitting.value = false
    }
  }

  return {
    // 状态
    dialogVisible,
    mode,
    editingId,
    submitting,
    formRef,
    form,
    // 方法
    openCreate,
    openEdit,
    submitForm,
    resetForm
  }
}
