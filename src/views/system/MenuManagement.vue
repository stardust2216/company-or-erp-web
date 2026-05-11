<template>
  <div class="menu-management-container">
    <!-- 左侧菜单树 -->
    <div class="menu-tree-panel">
      <div class="panel-header">
        <div class="panel-title">
          <el-icon><Menu /></el-icon>
          <span>菜单列表</span>
        </div>
        <div class="panel-actions">
          <el-tooltip content="展开全部" placement="top">
            <el-button text @click="handleExpandAll">
              <el-icon><Expand /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="收起全部" placement="top">
            <el-button text @click="handleCollapseAll">
              <el-icon><Fold /></el-icon>
            </el-button>
          </el-tooltip>
          <el-button type="primary" @click="handleAdd(null)">
            <el-icon><Plus /></el-icon>
            新增
          </el-button>
        </div>
      </div>
      
      <div class="panel-body">
        <el-tree
          ref="treeRef"
          :data="menuData"
          node-key="id"
          :default-expand-all="false"
          :expand-on-click-node="false"
          :props="treeProps"
          highlight-current
          @node-click="handleNodeClick"
        >
          <template #default="{ data }">
            <div class="tree-node-content">
              <div class="node-icon" :class="{ 'is-folder': !data.path }">
                <el-icon v-if="data.icon"><component :is="data.icon" /></el-icon>
                <el-icon v-else><Folder /></el-icon>
              </div>
              <span class="node-label">{{ data.label }}</span>
              <span class="node-type" v-if="data.type">{{ getTypeLabel(data.type) }}</span>
            </div>
          </template>
        </el-tree>
      </div>
    </div>
    
    <!-- 右侧详情面板 -->
    <div class="menu-detail-panel">
      <!-- 空白状态 -->
      <div class="empty-state" v-if="!selectedMenu">
        <div class="empty-icon">
          <el-icon><Document /></el-icon>
        </div>
        <div class="empty-text">请从左侧选择一个菜单</div>
        <div class="empty-hint">选择菜单后可查看详情、编辑或删除</div>
      </div>
      
      <!-- 菜单详情 -->
      <div class="detail-content" v-else>
        <div class="detail-header">
          <div class="detail-title">
            <span>菜单详情</span>
          </div>
          <div class="detail-actions">
            <el-button type="primary" @click="handleEdit(selectedMenu)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="success" @click="handleAddChild(selectedMenu)">
              <el-icon><Plus /></el-icon>
              新增子菜单
            </el-button>
            <el-button type="danger" @click="handleDelete(selectedMenu)" v-if="!selectedMenu.meta?.affix">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </div>
        </div>
        
        <div class="detail-body">
          <div class="detail-item">
            <div class="detail-label">菜单名称</div>
            <div class="detail-value">{{ selectedMenu.label }}</div>
          </div>
          
          <div class="detail-item">
            <div class="detail-label">菜单类型</div>
            <div class="detail-value">
              <el-tag :type="getTypeTagType(selectedMenu.type)" size="small">
                {{ getTypeLabel(selectedMenu.type) }}
              </el-tag>
            </div>
          </div>
          
          <div class="detail-item">
            <div class="detail-label">路由路径</div>
            <div class="detail-value">{{ selectedMenu.path || '-' }}</div>
          </div>
          
          <div class="detail-item">
            <div class="detail-label">组件路径</div>
            <div class="detail-value">{{ selectedMenu.component || '-' }}</div>
          </div>
          
          <div class="detail-item">
            <div class="detail-label">菜单图标</div>
            <div class="detail-value">
              <el-icon v-if="selectedMenu.icon" class="detail-icon"><component :is="selectedMenu.icon" /></el-icon>
              <span v-else>-</span>
            </div>
          </div>
          
          <div class="detail-item">
            <div class="detail-label">排序</div>
            <div class="detail-value">{{ selectedMenu.sort ?? 0 }}</div>
          </div>
          
          <div class="detail-item">
            <div class="detail-label">状态</div>
            <div class="detail-value">
              <el-tag :type="selectedMenu.status === 1 ? 'success' : 'danger'" size="small">
                {{ selectedMenu.status === 1 ? '启用' : '禁用' }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="560px"
      :close-on-click-modal="false"
      @closed="handleDialogClosed"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        class="menu-form"
      >
        <el-form-item label="上级菜单" prop="parentId">
          <el-tree-select
            v-model="formData.parentId"
            :data="menuTreeOptions"
            :props="{ label: 'label', value: 'id', children: 'children', disabled: 'disabled' }"
            placeholder="请选择上级菜单"
            clearable
            check-strictly
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="菜单类型" prop="type">
          <el-radio-group v-model="formData.type">
            <el-radio label="dir">目录</el-radio>
            <el-radio label="menu">菜单</el-radio>
            <el-radio label="button">按钮</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="菜单名称" prop="label">
          <el-input v-model="formData.label" placeholder="请输入菜单名称" />
        </el-form-item>
        
        <el-form-item label="菜单图标" v-if="formData.type !== 'button'">
          <el-select
            v-model="formData.icon"
            placeholder="请选择图标"
            clearable
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="icon in iconOptions"
              :key="icon"
              :label="icon"
              :value="icon"
            >
              <div class="icon-option">
                <el-icon><component :is="icon" /></el-icon>
                <span>{{ icon }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="路由路径" prop="path" v-if="formData.type === 'menu'">
          <el-input v-model="formData.path" placeholder="请输入路由路径，如：/system/users" />
        </el-form-item>
        
        <el-form-item label="组件路径" prop="component" v-if="formData.type === 'menu'">
          <el-input v-model="formData.component" placeholder="请输入组件路径，如：system/UserManagement" />
        </el-form-item>
        
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" :min="0" :max="9999" :precision="0" />
        </el-form-item>
        
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Plus, Edit, Delete, Expand, Fold, Folder, Menu, Document } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'

// ============================================
// Types
// ============================================

interface MenuNode {
  id: number | string
  label: string
  type?: 'dir' | 'menu' | 'button'
  path?: string
  component?: string
  icon?: string
  sort?: number
  status?: number
  children?: MenuNode[]
  meta?: Record<string, any>
}

// ============================================
// Refs
// ============================================

const treeRef = ref()
const formRef = ref<FormInstance>()
const dialogVisible = ref(false)
const dialogTitle = ref('新增菜单')
const submitLoading = ref(false)
const isEdit = ref(false)

// ============================================
// State
// ============================================

const selectedMenu = ref<MenuNode | null>(null)

const treeProps = {
  children: 'children',
  label: 'label'
}

// 菜单数据
const menuData = ref<MenuNode[]>([
  {
    id: 1,
    label: '工作台',
    type: 'menu',
    icon: 'Odometer',
    path: '/dashboard',
    component: 'Home.vue',
    sort: 1,
    status: 1,
    meta: { affix: true }
  },
  {
    id: 2,
    label: '核心业务',
    type: 'dir',
    icon: 'ShoppingCart',
    sort: 2,
    status: 1,
    children: [
      { id: 21, label: '订单管理', type: 'menu', icon: 'Document', path: '/business/orders', component: 'business/Orders.vue', sort: 1, status: 1 },
      { id: 22, label: '客户管理', type: 'menu', icon: 'UserFilled', path: '/business/customers', component: 'business/Customers.vue', sort: 2, status: 1 },
      { id: 23, label: '库存管理', type: 'menu', icon: 'Box', path: '/business/inventory', component: 'business/Inventory.vue', sort: 3, status: 1 },
      { id: 24, label: '生产计划', type: 'menu', icon: 'Briefcase', path: '/business/production', component: 'business/Production.vue', sort: 4, status: 1 }
    ]
  },
  {
    id: 3,
    label: '审批流程',
    type: 'dir',
    icon: 'List',
    sort: 3,
    status: 1,
    children: [
      { id: 31, label: '待办事项', type: 'menu', icon: 'Clock', path: '/approval/pending', component: 'approval/Pending.vue', sort: 1, status: 1 },
      { id: 32, label: '已办事项', type: 'menu', icon: 'CircleCheck', path: '/approval/done', component: 'approval/Done.vue', sort: 2, status: 1 },
      { id: 33, label: '我的申请', type: 'menu', icon: 'Document', path: '/approval/my-apply', component: 'approval/MyApply.vue', sort: 3, status: 1 },
      { id: 34, label: '发起申请', type: 'menu', icon: 'Edit', path: '/approval/start', component: 'approval/Start.vue', sort: 4, status: 1 }
    ]
  },
  {
    id: 4,
    label: '数据报表',
    type: 'dir',
    icon: 'DataLine',
    sort: 4,
    status: 1,
    children: [
      { id: 41, label: '产量产值报表', type: 'menu', icon: 'DataLine', path: '/reports/output', component: 'reports/Output.vue', sort: 1, status: 1 },
      { id: 42, label: '部门订单报表', type: 'menu', icon: 'Box', path: '/reports/department', component: 'reports/Department.vue', sort: 2, status: 1 },
      { id: 43, label: '全公司报表', type: 'menu', icon: 'Coin', path: '/reports/company', component: 'reports/Company.vue', sort: 3, status: 1 }
    ]
  },
  {
    id: 5,
    label: '系统管理',
    type: 'dir',
    icon: 'Setting',
    sort: 5,
    status: 1,
    children: [
      { id: 51, label: '用户管理', type: 'menu', icon: 'User', path: '/system/users', component: 'system/UserManagement.vue', sort: 1, status: 1 },
      { id: 52, label: '角色管理', type: 'menu', icon: 'Key', path: '/system/roles', component: 'system/RoleManagement.vue', sort: 2, status: 1 },
      { id: 53, label: '菜单管理', type: 'menu', icon: 'Menu', path: '/system/menus', component: 'system/MenuManagement.vue', sort: 3, status: 1 },
      { id: 54, label: '数据备份', type: 'menu', icon: 'Folder', path: '/system/backup', component: 'system/Backup.vue', sort: 4, status: 1 }
    ]
  }
])

// 表单数据
const formData = reactive({
  id: '',
  parentId: '' as number | string | '',
  type: 'menu' as 'dir' | 'menu' | 'button',
  label: '',
  icon: '',
  path: '',
  component: '',
  sort: 0,
  status: 1
})

// 表单验证规则
const formRules: FormRules = {
  label: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择菜单类型', trigger: 'change' }]
}

// 图标选项
const iconOptions = [
  'Odometer', 'ShoppingCart', 'Briefcase', 'Box', 'DataLine',
  'User', 'UserFilled', 'Setting', 'Key', 'Clock', 
  'Calendar', 'List', 'CircleCheck', 'Coin', 'Warning',
  'Document', 'Edit', 'Delete', 'Folder', 'Menu',
  'HomeFilled', 'Search', 'Plus', 'Minus', 'Close',
  'Check', 'Plus', 'Refresh', 'Upload', 'Download'
]

// ============================================
// Computed
// ============================================

// 菜单树选项（用于选择上级菜单）
const menuTreeOptions = computed(() => {
  const disableNode = (nodes: MenuNode[], disabled: boolean): MenuNode[] => {
    return nodes.map(node => ({
      ...node,
      disabled: Boolean(disabled || (formData.id && String(node.id) === String(formData.id))),
      children: node.children ? disableNode(node.children, Boolean(disabled || (formData.id && String(node.id) === String(formData.id)))) : undefined
    }))
  }
  return [{ id: '', label: '顶级菜单', children: [] as MenuNode[] }, ...disableNode(menuData.value, false)]
})

// ============================================
// Methods
// ============================================

function getTypeLabel(type?: string): string {
  const map: Record<string, string> = {
    dir: '目录',
    menu: '菜单',
    button: '按钮'
  }
  return map[type || ''] || '-'
}

function getTypeTagType(type?: string): '' | 'warning' | 'success' | 'info' {
  const map: Record<string, '' | 'warning' | 'success' | 'info'> = {
    dir: 'warning',
    menu: 'success',
    button: 'info'
  }
  return map[type || ''] || ''
}

function handleNodeClick(data: MenuNode) {
  selectedMenu.value = data
}

function handleExpandAll() {
  const nodes = (treeRef.value as any)?.store?.nodesMap || {}
  Object.values(nodes).forEach((node: any) => {
    node.expanded = true
  })
}

function handleCollapseAll() {
  const nodes = (treeRef.value as any)?.store?.nodesMap || {}
  Object.values(nodes).forEach((node: any) => {
    node.expanded = false
  })
}

function handleAdd(parent: MenuNode | null) {
  isEdit.value = false
  dialogTitle.value = '新增菜单'
  Object.assign(formData, {
    id: '',
    parentId: parent?.id || '',
    type: 'menu',
    label: '',
    icon: '',
    path: '',
    component: '',
    sort: 0,
    status: 1
  })
  dialogVisible.value = true
}

function handleAddChild(parent: MenuNode) {
  handleAdd(parent)
}

function handleEdit(data: MenuNode) {
  isEdit.value = true
  dialogTitle.value = '编辑菜单'
  Object.assign(formData, {
    id: data.id as string,
    parentId: '',
    type: data.type || 'menu',
    label: data.label,
    icon: data.icon || '',
    path: data.path || '',
    component: data.component || '',
    sort: data.sort ?? 0,
    status: data.status ?? 1
  })
  dialogVisible.value = true
}

function handleDelete(data: MenuNode) {
  ElMessageBox.confirm(`确定要删除菜单"${data.label}"吗？删除后不可恢复。`, '删除确认', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 实际删除逻辑
    ElMessage.success('删除成功')
    if (selectedMenu.value?.id === data.id) {
      selectedMenu.value = null
    }
  }).catch(() => {})
}

function handleSubmit() {
  formRef.value?.validate(async (valid) => {
    if (!valid) return
    
    submitLoading.value = true
    try {
      // 实际提交逻辑
      await new Promise(resolve => setTimeout(resolve, 500))
      ElMessage.success(isEdit.value ? '修改成功' : '新增成功')
      dialogVisible.value = false
    } catch {
      ElMessage.error('操作失败')
    } finally {
      submitLoading.value = false
    }
  })
}

function handleDialogClosed() {
  formRef.value?.resetFields()
}
</script>

<style lang="scss" scoped>
@use '@/scss/variables' as *;
@use '@/scss/mixins' as *;

.menu-management-container {
  display: flex;
  gap: 16px;
  height: calc(100vh - 60px - 42px - 32px);
  min-height: 500px;
}

// ============================================
// 左侧菜单树面板
// ============================================

.menu-tree-panel {
  width: 360px;
  flex-shrink: 0;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e8e8e8;
  flex-shrink: 0;
  
  .panel-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    font-weight: 600;
    color: #1a1a2e;
    
    .el-icon {
      color: #0070f3;
      font-size: 18px;
    }
  }
  
  .panel-actions {
    display: flex;
    gap: 4px;
    
    .el-button {
      padding: 6px 8px;
    }
  }
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  @include custom-scrollbar;
  
  .el-tree {
    background: transparent;
    
    :deep(.el-tree-node__content) {
      height: 40px;
      border-radius: 8px;
      margin-bottom: 4px;
      transition: all 0.2s;
      
      &:hover {
        background: #f5f7fa;
      }
      
      &.is-current {
        background: rgba(0, 112, 243, 0.08);
        
        .tree-node-content .node-label {
          color: #0070f3;
          font-weight: 500;
        }
      }
    }
    
    :deep(.el-tree-node__expand-icon) {
      color: #999;
    }
  }
}

.tree-node-content {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  padding-right: 8px;
  
  .node-icon {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    background: rgba(0, 112, 243, 0.08);
    color: #0070f3;
    @include flex-center;
    font-size: 14px;
    flex-shrink: 0;
    
    &.is-folder {
      background: rgba(251, 140, 0, 0.08);
      color: #fb8c00;
    }
  }
  
  .node-label {
    flex: 1;
    font-size: 13px;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .node-type {
    font-size: 11px;
    color: #999;
    flex-shrink: 0;
  }
}

// ============================================
// 右侧详情面板
// ============================================

.menu-detail-panel {
  flex: 1;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

// 空白状态
.empty-state {
  flex: 1;
  @include flex-center;
  flex-direction: column;
  color: #999;
  
  .empty-icon {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: #f5f7fa;
    @include flex-center;
    margin-bottom: 16px;
    
    .el-icon {
      font-size: 36px;
      color: #ccc;
    }
  }
  
  .empty-text {
    font-size: 16px;
    color: #666;
    margin-bottom: 8px;
  }
  
  .empty-hint {
    font-size: 13px;
    color: #999;
  }
}

// 详情内容
.detail-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e8e8e8;
  
  .detail-title {
    font-size: 15px;
    font-weight: 600;
    color: #1a1a2e;
  }
  
  .detail-actions {
    display: flex;
    gap: 8px;
  }
}

.detail-body {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  @include custom-scrollbar;
}

.detail-item {
  display: flex;
  padding: 16px 0;
  border-bottom: 1px dashed #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
  
  .detail-label {
    width: 100px;
    flex-shrink: 0;
    font-size: 13px;
    color: #999;
  }
  
  .detail-value {
    flex: 1;
    font-size: 14px;
    color: #333;
    display: flex;
    align-items: center;
    
    .detail-icon {
      margin-right: 6px;
      font-size: 18px;
      color: #0070f3;
    }
  }
}

// ============================================
// 对话框表单
// ============================================

.menu-form {
  padding: 8px 0;
  
  .icon-option {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .el-icon {
      font-size: 16px;
    }
  }
}
</style>
