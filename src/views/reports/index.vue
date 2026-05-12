<template>
  <div class="reports-index">
    <div class="page-header">
      <h1 class="page-title">数据报表</h1>
      <p class="page-desc">请选择子公司进入对应的数据报表系统</p>
    </div>
    
    <div class="subsidiary-cards">
      <div 
        v-for="sub in subsidiaries" 
        :key="sub.id"
        class="subsidiary-card"
        :class="sub.id"
        @click="goToSubsidiary(sub.id)"
      >
        <div class="card-icon">
          <el-icon :size="40">
            <component :is="sub.icon" />
          </el-icon>
        </div>
        <div class="card-content">
          <h3 class="card-title">{{ sub.name }}</h3>
          <p class="card-desc">{{ sub.desc }}</p>
          <div class="card-reports">
            <el-tag v-for="r in sub.reports" :key="r" size="small" effect="plain">
              {{ r }}
            </el-tag>
          </div>
        </div>
        <div class="card-arrow">
          <el-icon><ArrowRight /></el-icon>
        </div>
      </div>

      <!-- 全公司报表 - 董事经理权限 -->
      <div 
        v-if="isManager"
        class="subsidiary-card company-wide"
        @click="goToCompanyReport"
      >
        <div class="card-icon">
          <el-icon :size="40"><TrendCharts /></el-icon>
        </div>
        <div class="card-content">
          <h3 class="card-title">全公司报表</h3>
          <p class="card-desc">综合各子公司数据汇总分析</p>
          <div class="card-reports">
            <el-tag size="small" effect="plain">综合统计</el-tag>
            <el-tag size="small" effect="plain">财务汇总</el-tag>
            <el-tag size="small" effect="plain">经营分析</el-tag>
          </div>
        </div>
        <div class="card-arrow">
          <el-icon><ArrowRight /></el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ArrowRight, TrendCharts } from '@element-plus/icons-vue'

const router = useRouter()

const isManager = true

const subsidiaries = [
  {
    id: 'yahui',
    name: '亚辉塑业报表',
    desc: '编织袋、集装袋订单及生产数据统计',
    icon: 'OfficeBuilding',
    reports: ['订单统计', '生产报表', '财务报表']
  },
  {
    id: 'longzhou',
    name: '龙州塑业报表',
    desc: '糖袋、食品袋订单及生产数据统计',
    icon: 'Sugar',
    reports: ['订单统计', '生产报表', '财务报表']
  },
  {
    id: 'huawei',
    name: '华维硫磺报表',
    desc: '硫磺原料贸易数据统计分析',
    icon: 'Food',
    reports: ['贸易统计', '库存报表', '财务报表']
  },
  {
    id: 'guangwei',
    name: '广为科技报表',
    desc: '硫磺、磷酸贸易数据统计分析',
    icon: 'Brush',
    reports: ['贸易统计', '库存报表', '财务报表']
  }
]

const goToSubsidiary = (id: string) => {
  router.push({ name: `${id.charAt(0).toUpperCase() + id.slice(1)}Reports` })
}

const goToCompanyReport = () => {
  router.push({ name: 'CompanyReports' })
}
</script>

<style scoped lang="scss">
.reports-index {
  padding: 20px;
}

.page-header {
  margin-bottom: 30px;
  
  .page-title {
    font-size: 24px;
    font-weight: 600;
    margin: 0 0 8px;
    color: #1a1a2e;
  }
  
  .page-desc {
    color: #666;
    margin: 0;
  }
}

.subsidiary-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.subsidiary-card {
  display: flex;
  align-items: center;
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e4e7ed;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
  
  &.yahui {
    border-left: 4px solid #0070f3;
    .card-icon { color: #0070f3; background: rgba(0, 112, 243, 0.1); }
  }
  
  &.longzhou {
    border-left: 4px solid #06d6a0;
    .card-icon { color: #06d6a0; background: rgba(6, 214, 160, 0.1); }
  }
  
  &.huawei {
    border-left: 4px solid #ff6b6b;
    .card-icon { color: #ff6b6b; background: rgba(255, 107, 107, 0.1); }
  }
  
  &.guangwei {
    border-left: 4px solid #ffd166;
    .card-icon { color: #ffd166; background: rgba(255, 209, 102, 0.1); }
  }

  &.company-wide {
    border-left: 4px solid #8b5cf6;
    .card-icon { color: #8b5cf6; background: rgba(139, 92, 246, 0.1); }
  }
}

.card-icon {
  width: 70px;
  height: 70px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 6px;
  color: #1a1a2e;
}

.card-desc {
  font-size: 13px;
  color: #666;
  margin: 0 0 10px;
}

.card-reports {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.card-arrow {
  color: #999;
  font-size: 20px;
}

@media (max-width: 768px) {
  .subsidiary-cards {
    grid-template-columns: 1fr;
  }
}
</style>
