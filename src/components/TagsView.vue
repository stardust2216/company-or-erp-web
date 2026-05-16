<template>
  <div class="tags-view-container">
    <!-- Header -->
    <header class="layout-header">
      <div class="header-left">
        <div class="logo" @click="handleLogoClick">
          <div class="logo-icon-wrapper">
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="8" fill="url(#logoGrad)"/>
              <path d="M8 16L16 8L24 16L20 16L20 24L12 24L12 16Z" fill="white" fill-opacity="0.9"/>
              <defs>
                <linearGradient id="logoGrad" x1="0" y1="0" x2="32" y2="32">
                  <stop offset="0%" stop-color="#0070f3"/>
                  <stop offset="100%" stop-color="#7928ca"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span class="logo-text">Company OA</span>
        </div>
      </div>
      
      <div class="header-center">
        <el-menu
          mode="horizontal"
          :default-active="activeTopMenu"
          class="top-menu"
          :ellipsis="false"
        >
          <el-menu-item
            v-for="item in topMenus"
            :key="item.path"
            :index="item.path"
            @click="handleTopMenuClick(item)"
          >
            <el-icon><component :is="resolveMenuIcon(item.icon)" /></el-icon>
            <span>{{ item.title }}</span>
          </el-menu-item>
        </el-menu>
      </div>
      
      <div class="header-right">
        <div class="header-actions">
          <el-tooltip content="全屏" placement="bottom">
            <button
              type="button"
              class="header-action-btn"
              aria-label="全屏"
              @click="toggleFullscreen"
            >
              <el-icon :size="18"><FullScreen /></el-icon>
            </button>
          </el-tooltip>
          <el-tooltip content="消息" placement="bottom">
            <el-badge :value="3" :max="99" class="action-badge">
              <button
                type="button"
                class="header-action-btn"
                aria-label="消息"
                @click="showNotification"
              >
                <el-icon :size="18"><Bell /></el-icon>
              </button>
            </el-badge>
          </el-tooltip>
        </div>
        
        <el-dropdown @command="handleUserCommand" trigger="click">
          <div class="user-info">
            <el-avatar :size="32" class="user-avatar">
              {{ userInfo?.username?.charAt(0).toUpperCase() || 'U' }}
            </el-avatar>
            <span class="user-name">{{ userInfo?.realName || userInfo?.username || '用户' }}</span>
            <el-icon class="user-arrow"><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">
                <el-icon><User /></el-icon>
                个人中心
              </el-dropdown-item>
              <el-dropdown-item command="settings">
                <el-icon><Setting /></el-icon>
                账户设置
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <el-icon><SwitchButton /></el-icon>
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>
    
    <!-- Main Container -->
    <div class="main-container">
      <!-- Sidebar -->
      <aside class="sidebar" :class="{ 'is-collapse': isSidebarCollapsed }">
        <!-- 收缩时显示的主标签图标 -->
        <div v-if="isSidebarCollapsed" class="sidebar-collapse-logo" @click="handleLogoClick">
          <el-tooltip :content="currentTopMenuTitle" placement="right">
            <el-icon :size="22">
              <component :is="resolveMenuIcon(currentTopMenuIconName)" />
            </el-icon>
          </el-tooltip>
        </div>
        
        <el-menu
          :default-active="activeSidebarMenu"
          :collapse="isSidebarCollapsed"
          :collapse-transition="false"
          class="sidebar-menu"
          @select="handleSidebarSelect"
        >
          <template v-for="item in currentSidebarMenus" :key="item.path">
            <!-- 三级：有子菜单（公司级） -->
            <el-sub-menu
              v-if="item.children && item.children.length > 0"
              :index="item.path"
            >
              <template #title>
                <el-icon><component :is="resolveMenuIcon(item.icon)" /></el-icon>
                <span>{{ item.title }}</span>
              </template>
              <!-- 二级子项 -->
              <template v-for="child in item.children" :key="child.path">
                <!-- 子项还有子菜单（三级菜单） -->
                <el-sub-menu
                  v-if="child.children && child.children.length > 0"
                  :index="child.path"
                >
                  <template #title>
                    <el-icon><component :is="resolveMenuIcon(child.icon)" /></el-icon>
                    <span>{{ child.title }}</span>
                  </template>
                  <el-menu-item
                    v-for="leaf in child.children"
                    :key="leaf.path"
                    :index="leaf.path"
                  >
                    <el-icon><component :is="resolveMenuIcon(leaf.icon)" /></el-icon>
                    <span>{{ leaf.title }}</span>
                  </el-menu-item>
                </el-sub-menu>
                <!-- 子项无子菜单（叶子节点） -->
                <el-menu-item v-else :index="child.path">
                  <el-icon><component :is="resolveMenuIcon(child.icon)" /></el-icon>
                  <span>{{ child.title }}</span>
                </el-menu-item>
              </template>
            </el-sub-menu>
            <!-- 顶层叶子节点 -->
            <el-menu-item v-else :index="item.path">
              <el-icon><component :is="resolveMenuIcon(item.icon)" /></el-icon>
              <span>{{ item.title }}</span>
            </el-menu-item>
          </template>
        </el-menu>
        
        <div class="sidebar-toggle" @click="toggleSidebar">
          <el-icon size="18">
            <DArrowLeft v-if="!isSidebarCollapsed" />
            <DArrowRight v-else />
          </el-icon>
        </div>
      </aside>
      
      <!-- Content Area -->
      <main class="main-content" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
        <!-- Tags View -->
        <div class="tags-view-wrapper" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
          <div class="tags-view">
            <div class="tags-view-list">
              <router-link
                v-for="tag in visitedViews"
                :key="tag.path"
                :to="{ path: tag.path }"
                class="tag-item"
                :class="{ 'is-active': isActiveTag(tag) }"
                @contextmenu.prevent="openContextMenu($event, tag)"
              >
                <span class="tag-main">
                  <el-icon class="tag-icon">
                    <component :is="resolveMenuIcon(tag.icon)" />
                  </el-icon>
                  <span class="tag-title">{{ tag.title }}</span>
                </span>
                <el-icon
                  v-if="!tag.meta?.affix"
                  class="tag-close"
                  @click.prevent.stop="closeSelectedTag(tag)"
                >
                  <Close />
                </el-icon>
              </router-link>
            </div>
            
            <div class="tags-view-actions">
              <el-dropdown @command="handleTagsCommand" trigger="click">
                <el-icon class="tags-action-icon">
                  <More />
                </el-icon>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="refresh">
                      <el-icon><Refresh /></el-icon>
                      刷新
                    </el-dropdown-item>
                    <el-dropdown-item command="closeAll">
                      <el-icon><Remove /></el-icon>
                      关闭所有
                    </el-dropdown-item>
                    <el-dropdown-item command="closeOthers">
                      <el-icon><CircleClose /></el-icon>
                      关闭其他
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </div>
        
        <!-- Page Content 内容区域 -->
        <div class="page-content">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </main>
    </div>
    
    <!-- Context Menu -->
    <div
      v-if="contextMenuVisible"
      class="context-menu"
      :style="{ left: contextMenuLeft + 'px', top: contextMenuTop + 'px' }"
    >
      <div class="context-menu-item" @click="refreshSelectedTag">
        <el-icon><Refresh /></el-icon>
        刷新
      </div>
      <div class="context-menu-item" @click="closeSelectedTag(selectedTag!)">
        <el-icon><Close /></el-icon>
        关闭
      </div>
      <div class="context-menu-item" @click="closeOtherTags">
        <el-icon><CircleClose /></el-icon>
        关闭其他
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import type { Component } from 'vue'
import * as ElementPlusIcons from '@element-plus/icons-vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import {
  User,
  Setting,
  Bell,
  FullScreen,
  ArrowDown,
  Close,
  DArrowLeft,
  DArrowRight,
  Refresh,
  Remove,
  CircleClose
} from '@element-plus/icons-vue'

// ============================================
// Types
// ============================================

interface MenuItem {
  path: string
  name: string
  title: string
  icon?: string
  children?: MenuItem[]
  meta?: Record<string, any>
}

interface TagView {
  path: string
  name: string
  title: string
  icon?: string
  meta?: Record<string, any>
}

// ============================================
// Store & Router
// ============================================

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { userInfo } = storeToRefs(authStore)

// ============================================
// State
// ============================================

const isSidebarCollapsed = ref(false)
const activeTopMenu = ref('/dashboard')
const activeSidebarMenu = ref('')

const contextMenuVisible = ref(false)
const contextMenuLeft = ref(0)
const contextMenuTop = ref(0)
const selectedTag = ref<TagView | null>(null)

const currentTopMenu = computed(() =>
  topMenus.value.find((item) => item.path === activeTopMenu.value)
)
const currentTopMenuIconName = computed(() => currentTopMenu.value?.icon || 'Odometer')
const currentTopMenuTitle = computed(() => currentTopMenu.value?.title || '工作台')

// 根据当前顶部菜单过滤侧边栏，展示当前模块的菜单项
const currentSidebarMenus = computed(() => {
  const activePath = activeTopMenu.value
  if (activePath === '/dashboard') {
    return sidebarMenus.value.filter(m => m.path === '/dashboard')
  }
  const matched = sidebarMenus.value.find(m => m.path === activePath)
  if (matched) {
    // 返回该模块的子菜单列表（展平到一层，子公司作为二级）
    return matched.children || [matched]
  }
  return sidebarMenus.value
})

function resolveMenuIcon(name?: string): Component {
  if (!name) return ElementPlusIcons.Document
  const comp = (ElementPlusIcons as Record<string, Component>)[name]
  return comp || ElementPlusIcons.Document
}

// ============================================
// Menu Data - 按功能模块分类
// ============================================

const topMenus = ref<MenuItem[]>([
  { path: '/dashboard', name: 'Dashboard', title: '工作台',  icon: 'Odometer'     },
  { path: '/business',  name: 'Business',  title: '核心业务', icon: 'Grid'         },
  { path: '/approval',  name: 'Approval',  title: '审批流程', icon: 'Stamp'        },
  { path: '/reports',   name: 'Reports',   title: '数据报表', icon: 'DataLine'     },
  { path: '/analytics', name: 'Analytics', title: '经营分析', icon: 'TrendCharts'  },
  { path: '/system',    name: 'System',    title: '系统管理', icon: 'Setting'      }
])

// ── 侧边栏菜单（支持三级，按顶部菜单区分）──
const sidebarMenus = ref<MenuItem[]>([
  // ═══ 工作台 ═══════════════════════════════
  { path: '/dashboard', name: 'Dashboard', title: '工作台', icon: 'Odometer' },

  // ═══ 核心业务 ══════════════════════════════
  {
    path: '/business', name: 'Business', title: '核心业务', icon: 'Grid',
    children: [
      // 🏭 亚辉塑业
      {
        path: '/business/yahui', name: 'Yahui', title: '亚辉塑业', icon: 'OfficeBuilding',
        children: [
          { path: '/business/yahui/orders',          name: 'YahuiOrderList',      title: '订单列表',   icon: 'Document'  },
          { path: '/business/yahui/production-plan', name: 'YahuiProductionPlan', title: '生产计划单', icon: 'SetUp'     },
          { path: '/business/yahui/order-stats',     name: 'YahuiOrderStats',     title: '订单统计',   icon: 'DataLine'  }
        ]
      },
      // 🏭 龙州塑业
      {
        path: '/business/longzhou', name: 'Longzhou', title: '龙州塑业', icon: 'OfficeBuilding',
        children: [
          { path: '/business/longzhou/orders',          name: 'LongzhouOrderList',      title: '订单列表',   icon: 'Document' },
          { path: '/business/longzhou/production-plan', name: 'LongzhouProductionPlan', title: '生产计划单', icon: 'SetUp'    },
          { path: '/business/longzhou/order-stats',     name: 'LongzhouOrderStats',     title: '订单统计',   icon: 'DataLine' }
        ]
      },
      // 🧪 华维食品
      {
        path: '/business/huawei', name: 'Huawei', title: '华维食品', icon: 'OfficeBuilding',
        children: [
          { path: '/business/huawei/orders',             name: 'HuaweiOrderList',         title: '订单列表',   icon: 'Document'        },
          { path: '/business/huawei/purchase-contracts', name: 'HuaweiPurchaseContracts', title: '采购合同',   icon: 'DocumentChecked' },
          { path: '/business/huawei/sales-contracts',    name: 'HuaweiSalesContracts',    title: '销售合同',   icon: 'DocumentChecked' },
          { path: '/business/huawei/warehouse',          name: 'HuaweiWarehouse',         title: '入出库明细', icon: 'Box'             }
        ]
      },
      // 🔬 广为科技
      {
        path: '/business/guangwei', name: 'Guangwei', title: '广为科技', icon: 'OfficeBuilding',
        children: [
          { path: '/business/guangwei/orders',             name: 'GuangweiOrderList',         title: '订单列表',   icon: 'Document'        },
          { path: '/business/guangwei/purchase-contracts', name: 'GuangweiPurchaseContracts', title: '采购合同',   icon: 'DocumentChecked' },
          { path: '/business/guangwei/sales-contracts',    name: 'GuangweiSalesContracts',    title: '销售合同',   icon: 'DocumentChecked' },
          { path: '/business/guangwei/warehouse',          name: 'GuangweiWarehouse',         title: '入出库明细', icon: 'Box'             }
        ]
      },
      // 公共管理
      { path: '/business/customers', name: 'Customers', title: '客户管理', icon: 'UserFilled' },
      { path: '/business/inventory', name: 'Inventory', title: '库存管理', icon: 'Box'        }
    ]
  },

  // ═══ 审批流程 ══════════════════════════════
  {
    path: '/approval', name: 'Approval', title: '审批流程', icon: 'Stamp',
    children: [
      { path: '/approval/pending',  name: 'ApprovalPending', title: '待办事项', icon: 'Clock'       },
      { path: '/approval/done',     name: 'ApprovalDone',    title: '已办事项', icon: 'CircleCheck' },
      { path: '/approval/my-apply', name: 'ApprovalMyApply', title: '我的申请', icon: 'List'        },
      { path: '/approval/start',    name: 'ApprovalStart',   title: '发起申请', icon: 'Edit'        }
    ]
  },

  // ═══ 数据报表 ══════════════════════════════
  {
    path: '/reports', name: 'Reports', title: '数据报表', icon: 'DataLine',
    children: [
      // 🏭 亚辉塑业报表
      {
        path: '/reports/yahui', name: 'YahuiReports', title: '亚辉塑业', icon: 'OfficeBuilding',
        children: [
          { path: '/reports/yahui/order-a',          name: 'YahuiOrderReportA',    title: '订单报表A',      icon: 'Document'    },
          { path: '/reports/yahui/order-b',          name: 'YahuiOrderReportB',    title: '订单报表B',      icon: 'Document'    },
          { path: '/reports/yahui/order-c',          name: 'YahuiOrderReportC',    title: '订单报表C',      icon: 'Document'    },
          { path: '/reports/yahui/production-daily', name: 'YahuiProductionDaily', title: '生产日报(8工序)', icon: 'SetUp'       },
          { path: '/reports/yahui/stock-fabric',     name: 'YahuiStockFabric',     title: '布筒库存',       icon: 'Box'         },
          { path: '/reports/yahui/stock-material',   name: 'YahuiStockMaterial',   title: '原料库存',       icon: 'Box'         },
          { path: '/reports/yahui/data-storage',     name: 'YahuiDataStorage',     title: '数据存储',       icon: 'FolderOpened'}
        ]
      },
      // 🏭 龙州塑业报表
      {
        path: '/reports/longzhou', name: 'LongzhouReports', title: '龙州塑业', icon: 'OfficeBuilding',
        children: [
          { path: '/reports/longzhou/order',            name: 'LongzhouOrderReport',    title: '订单报表',       icon: 'Document' },
          { path: '/reports/longzhou/production-daily', name: 'LongzhouProductionDaily',title: '生产日报(6工序)', icon: 'SetUp'    },
          { path: '/reports/longzhou/stock',            name: 'LongzhouStock',          title: '库存报表',       icon: 'Box'      }
        ]
      },
      // 🧪 华维食品报表
      {
        path: '/reports/huawei', name: 'HuaweiReports', title: '华维食品', icon: 'OfficeBuilding',
        children: [
          { path: '/reports/huawei/purchase-stats',   name: 'HuaweiPurchaseStats',   title: '采购合同统计', icon: 'DocumentChecked' },
          { path: '/reports/huawei/inbound',          name: 'HuaweiInboundReport',   title: '入库明细',     icon: 'Download'        },
          { path: '/reports/huawei/sales-stats',      name: 'HuaweiSalesStats',      title: '销售合同统计', icon: 'DocumentChecked' },
          { path: '/reports/huawei/outbound',         name: 'HuaweiOutboundReport',  title: '出库明细',     icon: 'Upload'          },
          { path: '/reports/huawei/production-daily', name: 'HuaweiProductionDaily', title: '生产日报',     icon: 'SetUp'           },
          { path: '/reports/huawei/business-summary', name: 'HuaweiBusinessSummary', title: '工业生产经营', icon: 'TrendCharts'     }
        ]
      },
      // 🔬 广为科技报表
      {
        path: '/reports/guangwei', name: 'GuangweiReports', title: '广为科技', icon: 'OfficeBuilding',
        children: [
          { path: '/reports/guangwei/phosphoric-purchase', name: 'GuangweiPhosphoricPurchase', title: '磷酸采购合同', icon: 'DocumentChecked' },
          { path: '/reports/guangwei/phosphoric-sales',    name: 'GuangweiPhosphoricSales',    title: '磷酸销售合同', icon: 'DocumentChecked' },
          { path: '/reports/guangwei/purchase-detail',     name: 'GuangweiPurchaseDetail',     title: '采购明细',     icon: 'Download'        },
          { path: '/reports/guangwei/sales-detail',        name: 'GuangweiSalesDetail',        title: '销售明细',     icon: 'Upload'          }
        ]
      },
      // 🏢 全公司报表
      {
        path: '/reports/company', name: 'CompanyReports', title: '全公司报表', icon: 'DataAnalysis',
        children: [
          { path: '/reports/company/overview',    name: 'CompanyOverview',    title: '经营总览',     icon: 'Odometer'       },
          { path: '/reports/company/comparison',  name: 'CompanyComparison',  title: '四子公司对比', icon: 'ScaleToOriginal'},
          { path: '/reports/company/consolidated',name: 'CompanyConsolidated',title: '合并报表',     icon: 'Tickets'        },
          { path: '/reports/company/kpi',         name: 'CompanyKPI',         title: '核心指标看板', icon: 'Monitor'        }
        ]
      }
    ]
  },

  // ═══ 经营分析 ══════════════════════════════
  {
    path: '/analytics', name: 'Analytics', title: '经营分析', icon: 'TrendCharts',
    children: [
      { path: '/analytics/overview',   name: 'AnalyticsOverview',    title: '经营概览', icon: 'DataLine'       },
      { path: '/analytics/production', name: 'ProductionAnalysis',   title: '产量分析', icon: 'Histogram'      },
      { path: '/analytics/inventory',  name: 'InventoryAnalysis',    title: '库存分析', icon: 'PieChart'       },
      { path: '/analytics/profit',     name: 'ProfitAnalysis',       title: '利润分析', icon: 'Coin'           },
      { path: '/analytics/comparison', name: 'SubsidiaryComparison', title: '子公司对比',icon: 'ScaleToOriginal'}
    ]
  },

  // ═══ 系统管理 ══════════════════════════════
  {
    path: '/system', name: 'System', title: '系统管理', icon: 'Setting',
    children: [
      { path: '/system/users',  name: 'UserManagement', title: '用户管理', icon: 'User'   },
      { path: '/system/roles',  name: 'RoleManagement', title: '角色管理', icon: 'Key'    },
      { path: '/system/menus',  name: 'MenuManagement', title: '菜单管理', icon: 'Menu'   },
      { path: '/system/backup', name: 'DataBackup',     title: '数据备份', icon: 'Folder' }
    ]
  }
])

// ============================================
// Tags View State
// ============================================

const visitedViews = ref<TagView[]>([])

// ============================================
// Methods
// ============================================

function handleLogoClick() {
  router.push('/dashboard')
}

function handleTopMenuClick(item: MenuItem) {
  activeTopMenu.value = item.path
  if (item.path === '/dashboard') {
    router.push('/dashboard')
    return
  }
  // 找到该模块在 sidebarMenus 中的条目，跳到第一个叶子节点
  const sidebarItem = sidebarMenus.value.find(m => m.path === item.path)
  if (sidebarItem?.children?.length) {
    const first = sidebarItem.children[0]
    if (first.children?.length) {
      router.push(first.children[0].path)
    } else {
      router.push(first.path)
    }
  } else {
    router.push(item.path)
  }
}

function handleSidebarSelect(index: string) {
  activeSidebarMenu.value = index
  router.push(index)
}

function toggleSidebar() {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

function showNotification() {
  // TODO: Show notification panel
}

function handleUserCommand(cmd: string) {
  switch (cmd) {
    case 'logout':
      authStore.logoutAction()
      router.push({ name: 'Login' })
      break
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      router.push('/system/settings')
      break
  }
}

function handleTagsCommand(cmd: string) {
  switch (cmd) {
    case 'refresh':
      refreshSelectedTag()
      break
    case 'closeAll':
      closeAllTags()
      break
    case 'closeOthers':
      closeOtherTags()
      break
  }
}

// Tag View Methods
function isActiveTag(tag: TagView): boolean {
  return tag.path === route.path
}

function addVisitedView(view: TagView) {
  const existing = visitedViews.value.find((v) => v.path === view.path)
  if (existing) {
    if (view.title) existing.title = view.title
    if (view.icon && !existing.icon) existing.icon = view.icon
    return
  }
  visitedViews.value.push({ ...view })
}

function closeSelectedTag(view: TagView) {
  const index = visitedViews.value.findIndex(v => v.path === view.path)
  if (index !== -1) {
    visitedViews.value.splice(index, 1)
    if (isActiveTag(view)) {
      const nextTag = visitedViews.value[index] || visitedViews.value[index - 1]
      if (nextTag) {
        router.push(nextTag.path)
      } else {
        router.push('/dashboard')
      }
    }
  }
  contextMenuVisible.value = false
}

function closeAllTags() {
  visitedViews.value = visitedViews.value.filter(v => v.meta?.affix)
  router.push('/dashboard')
  contextMenuVisible.value = false
}

function closeOtherTags() {
  visitedViews.value = visitedViews.value.filter(v => v.meta?.affix || v.path === route.path)
  contextMenuVisible.value = false
}

function refreshSelectedTag() {
  router.replace(route.fullPath)
  contextMenuVisible.value = false
}

function openContextMenu(event: MouseEvent, tag: TagView) {
  selectedTag.value = tag
  contextMenuLeft.value = event.clientX
  contextMenuTop.value = event.clientY
  contextMenuVisible.value = true
}

function closeContextMenu() {
  contextMenuVisible.value = false
}

// ============================================
// Watchers
// ============================================

watch(() => route.path, (newPath) => {
  // hidden: true 的动态路由（如订单详情）不添加为标签，不影响侧边栏高亮
  const isHidden = route.meta?.hidden === true

  if (!isHidden) {
    addVisitedView({
      path: newPath,
      name: route.name as string || '',
      title: (route.meta.title as string) || getMenuTitle(newPath),
      icon: (route.meta.icon as string) || getMenuIcon(newPath),
      meta: route.meta
    })
    activeSidebarMenu.value = newPath
  } else {
    // 详情页：侧边栏高亮保持父级列表页（去掉最后一段路径）
    const parentPath = newPath.replace(/\/[^/]+$/, '')
    activeSidebarMenu.value = parentPath
  }

  // 更新顶部菜单选中状态
  const topMenu = topMenus.value.find(m => newPath.startsWith(m.path))
  if (topMenu) {
    activeTopMenu.value = topMenu.path
  }
})

// 根据路径获取菜单标题（支持三级）
function getMenuTitle(path: string): string {
  for (const menu of sidebarMenus.value) {
    if (menu.path === path) return menu.title
    if (menu.children) {
      for (const child of menu.children) {
        if (child.path === path) return child.title
        if (child.children) {
          for (const leaf of child.children) {
            if (leaf.path === path) return leaf.title
          }
        }
      }
    }
  }
  return route.meta.title as string || '未命名'
}

function getMenuIcon(path: string): string | undefined {
  for (const menu of sidebarMenus.value) {
    if (menu.path === path) return menu.icon
    if (menu.children) {
      for (const child of menu.children) {
        if (child.path === path) return child.icon
        if (child.children) {
          for (const leaf of child.children) {
            if (leaf.path === path) return leaf.icon
          }
        }
      }
    }
  }
  return route.meta.icon as string | undefined
}

watch(contextMenuVisible, (val) => {
  if (val) {
    document.addEventListener('click', closeContextMenu)
  } else {
    document.removeEventListener('click', closeContextMenu)
  }
})

// ============================================
// Lifecycle
// ============================================

onMounted(() => {
  const isHidden = route.meta?.hidden === true

  if (!isHidden) {
    // Add current route to visited views
    addVisitedView({
      path: route.path,
      name: route.name as string || '',
      title: (route.meta.title as string) || getMenuTitle(route.path),
      icon: (route.meta.icon as string) || getMenuIcon(route.path),
      meta: route.meta
    })
    activeSidebarMenu.value = route.path
  } else {
    // 详情页：侧边栏高亮父级列表页
    const parentPath = route.path.replace(/\/[^/]+$/, '')
    activeSidebarMenu.value = parentPath
  }
  
  // 设置顶部菜单
  const topMenu = topMenus.value.find(m => route.path.startsWith(m.path))
  if (topMenu) {
    activeTopMenu.value = topMenu.path
  }
})
</script>

<style lang="scss">
@use '@/scss/variables' as *;
@use '@/scss/mixins' as *;

// ============================================
// Layout Variables
// ============================================

$header-height: 60px;
$tags-view-height: 42px;
$sidebar-width: 240px;
$sidebar-collapsed-width: 64px;

// ============================================
// Tags View Container
// ============================================

.tags-view-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f0f2f5;
  @include custom-scrollbar;
}

// ============================================
// Header
// ============================================

.layout-header {
  height: $header-height;
  background: #ffffff;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  padding: 0 0;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.header-left {
  width: $sidebar-width;
  flex-shrink: 0;
  padding: 0 16px;
  border-right: 1px solid #e8e8e8;
  transition: width 0.3s ease;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 0.8;
  }
  
  .logo-icon-wrapper {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    overflow: hidden;
    flex-shrink: 0;
    
    svg {
      width: 100%;
      height: 100%;
    }
  }
  
  .logo-text {
    font-size: 18px;
    font-weight: 700;
    background: linear-gradient(135deg, #0070f3 0%, #7928ca 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.5px;
  }
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
  overflow: hidden;
  
  .top-menu {
    border-bottom: none;
    background: transparent;
    
    .el-menu-item {
      height: $header-height;
      line-height: $header-height;
      padding: 0 20px;
      font-size: 14px;
      color: #666;
      border-bottom: 3px solid transparent;
      transition: all 0.2s ease;
      
      .el-icon {
        margin-right: 6px;
        font-size: 16px;
      }
      
      &:hover {
        color: #0070f3;
        background: rgba(0, 112, 243, 0.04);
      }
      
      &.is-active {
        color: #0070f3;
        border-bottom-color: #0070f3;
        background: rgba(0, 112, 243, 0.06);
        
        .el-icon {
          color: #0070f3;
        }
      }
    }
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 20px 0 16px;
  flex-shrink: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  
  .action-badge {
    display: inline-flex;
    align-items: center;
    
    :deep(.el-badge__content) {
      background: #f56c6c;
      border: none;
    }
  }
  
  .header-action-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    padding: 0;
    margin: 0;
    border: none;
    border-radius: 8px;
    background: transparent;
    cursor: pointer;
    color: #606266;
    transition: color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease;
    
    &:hover {
      color: #0070f3;
      background: rgba(0, 112, 243, 0.1);
      box-shadow: 0 1px 4px rgba(0, 112, 243, 0.12);
    }
    
    &:focus-visible {
      outline: none;
      color: #0070f3;
      background: rgba(0, 112, 243, 0.12);
      box-shadow: 0 0 0 2px rgba(0, 112, 243, 0.35);
    }
    
    &:active {
      transform: scale(0.94);
      background: rgba(0, 112, 243, 0.14);
    }
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 8px;
  transition: background-color 0.2s;
  
  &:hover {
    background: #f5f7fa;
  }
  
  .user-avatar {
    background: linear-gradient(135deg, #0070f3 0%, #7928ca 100%);
    font-size: 14px;
    font-weight: 600;
    color: #fff;
  }
  
  .user-name {
    font-size: 14px;
    color: #333;
    font-weight: 500;
  }
  
  .user-arrow {
    font-size: 12px;
    color: #999;
  }
}

// ============================================
// Main Container
// ============================================

.main-container {
  display: flex;
  margin-top: $header-height;
  min-height: calc(100vh - $header-height);
  overflow-x: hidden
}

// ============================================
// Sidebar
// ============================================

.sidebar {
  width: $sidebar-width;
  background: #ffffff;
  border-right: 1px solid #e8e8e8;
  position: fixed;
  top: $header-height;
  left: 0;
  bottom: 0;
  overflow-x: hidden;
  overflow-y: auto;
  transition: width 0.3s ease;
  z-index: 100;
  @include custom-scrollbar;
  
  &.is-collapse {
    width: $sidebar-collapsed-width;
    
    .sidebar-menu {
      width: $sidebar-collapsed-width;
    }
    
    .el-menu-item,
    .el-sub-menu__title {
      padding-left: 20px !important;
      justify-content: center;
      
      span:not(.el-icon) {
        display: none;
      }
    }
    
    .el-sub-menu .el-menu {
      display: none;
    }
    
    .sidebar-toggle {
      justify-content: center;
    }
  }
}

.sidebar-collapse-logo {
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #0070f3;
  border-bottom: 1px solid #e8e8e8;
  transition: background-color 0.2s ease, color 0.2s ease;
  
  &:hover {
    background: rgba(0, 112, 243, 0.08);
    color: #0051cc;
  }
}

.sidebar-menu {
  border-right: none;
  height: calc(100vh - $header-height - 44px);
  
  .el-menu-item,
  .el-sub-menu__title {
    height: 48px;
    line-height: 48px;
    font-size: 14px;
    color: #333;
    margin: 2px 8px;
    border-radius: 8px;
    padding-left: 16px !important;
    padding-right: 16px !important;
    
    .el-icon {
      margin-right: 10px;
      font-size: 18px;
      color: #999;
      flex-shrink: 0;
    }
    
    &:hover {
      background-color: #f5f7fa;
      color: #333;
      
      .el-icon {
        color: #666;
      }
    }
  }
  
  .el-sub-menu {
    // 二级菜单项
    > .el-menu {
      > .el-menu-item,
      > .el-sub-menu > .el-sub-menu__title {
        height: 44px;
        line-height: 44px;
        font-size: 13px;
        margin: 1px 8px;
        padding-left: 40px !important;
      }
    }
    // 三级菜单项
    .el-sub-menu {
      .el-menu-item {
        height: 40px;
        line-height: 40px;
        font-size: 12px;
        margin: 1px 8px;
        padding-left: 56px !important;
        color: #666;
        
        &:hover {
          color: #0070f3;
          background: rgba(0, 112, 243, 0.05);
        }
        
        &.is-active {
          color: #0070f3;
          background: rgba(0, 112, 243, 0.08);
          font-weight: 500;
        }
      }
    }
  }
  
  .el-menu-item.is-active {
    color: #0070f3;
    background-color: rgba(0, 112, 243, 0.08);
    
    .el-icon {
      color: #0070f3;
    }
  }
  
  .el-sub-menu__title.is-active {
    color: #0070f3;
    background-color: rgba(0, 112, 243, 0.08);
    
    .el-icon {
      color: #0070f3;
    }
  }
}

.sidebar-toggle {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafbfc;
  border-top: 1px solid #e8e8e8;
  cursor: pointer;
  transition: background-color 0.2s;
  color: #666;
  
  &:hover {
    background: #f0f2f5;
    color: #0070f3;
  }
}

// ============================================
// Main Content
// ============================================

.main-content {
  flex: 1;
  margin-left: $sidebar-width;
  margin-top: $tags-view-height;
  min-height: calc(100vh - $header-height - $tags-view-height);
  transition: margin-left 0.3s ease;
  @include custom-scrollbar;
  
  &.sidebar-collapsed {
    margin-left: $sidebar-collapsed-width;
  }
}

// ============================================
// Tags View
// ============================================

.tags-view-wrapper {
  position: fixed;
  top: $header-height;
  left: $sidebar-width;
  right: 0;
  height: $tags-view-height;
  background: #ffffff;
  border-bottom: 1px solid #e8e8e8;
  z-index: 99;
  transition: left 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  
  &.sidebar-collapsed {
    left: $sidebar-collapsed-width;
  }
}

.tags-view {
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 8px;
}

.tags-view-list {
  display: flex;
  align-items: center;
  height: 32px;
  overflow-x: auto;
  flex: 1;
  gap: 6px;
  @include custom-scrollbar;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
}

.tag-item {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 10px 0 12px;
  font-size: 12px;
  color: #666;
  background: #f5f7fa;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
  
  .tag-main {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }
  
  .tag-icon {
    font-size: 14px;
    flex-shrink: 0;
    color: #909399;
    transition: color 0.2s;
  }
  
  &:hover {
    color: #0070f3;
    background: rgba(0, 112, 243, 0.06);
    border-color: rgba(0, 112, 243, 0.2);
    
    .tag-icon {
      color: #0070f3;
    }
  }
  
  &.is-active {
    color: #ffffff;
    background: linear-gradient(135deg, #0070f3, #0051cc);
    border-color: #0070f3;
    box-shadow: 0 2px 6px rgba(0, 112, 243, 0.3);
    
    .tag-icon {
      color: rgba(255, 255, 255, 0.95);
    }
    
    .tag-close {
      color: rgba(255, 255, 255, 0.8);
      
      &:hover {
        color: #ffffff;
        background: rgba(255, 255, 255, 0.2);
      }
    }
  }
  
  .tag-title {
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .tag-close {
    margin-left: 6px;
    padding: 2px;
    border-radius: 4px;
    font-size: 12px;
    color: #999;
    transition: all 0.2s;
    
    &:hover {
      background: rgba(0, 0, 0, 0.08);
    }
  }
}

.tags-view-actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  
  .tags-action-icon {
    width: 32px;
    height: 32px;
    line-height: 32px;
    text-align: center;
    color: white;
    background-color: #0070f3;
    padding: 6px;
    cursor: pointer;
    border-radius: 6px;
    font-size: 18px;
    transition: all 0.2s;
    
    &:hover {
      background: #f5f7fa;
      color: #0070f3;
    }
  }
}

// ============================================
// Page Content
// ============================================

.page-content {
  padding: 16px;
  width: 100%;
  min-height: calc(100vh - $header-height - $tags-view-height);
  background: #f0f2f5;
  overflow-x: auto;
}

// ============================================
// Context Menu
// ============================================

.context-menu {
  position: fixed;
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  padding: 4px 0;
  z-index: 2000;
  
  .context-menu-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    font-size: 13px;
    color: #333;
    cursor: pointer;
    transition: background-color 0.2s;
    
    .el-icon {
      font-size: 14px;
      color: #666;
    }
    
    &:hover {
      background: #f5f7fa;
      color: #0070f3;
      
      .el-icon {
        color: #0070f3;
      }
    }
  }
}

// ============================================
// Page Transitions
// ============================================

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
