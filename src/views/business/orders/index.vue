<template>
  <div class="orders-index">
    <div class="page-header">
      <h1 class="page-title">订单管理</h1>
      <p class="page-desc">请选择子公司进入对应的订单管理系统</p>
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
          <div class="card-products">
            <el-tag v-for="p in sub.products" :key="p" size="small" effect="plain">
              {{ p }}
            </el-tag>
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
import { ArrowRight } from '@element-plus/icons-vue'

const router = useRouter()

const subsidiaries = [
  {
    id: 'yahui',
    name: '亚辉塑业',
    desc: '承接各种编织袋、集装袋订单',
    icon: 'OfficeBuilding',
    products: ['编织袋', '集装袋', '吨袋']
  },
  {
    id: 'longzhou',
    name: '龙州塑业',
    desc: '专注糖袋、食品袋生产',
    icon: 'Sugar',
    products: ['糖袋', '食品袋', '彩印袋']
  },
  {
    id: 'huawei',
    name: '华维食品添加剂',
    desc: '硫磺原料贸易业务',
    icon: 'Food',
    products: ['硫磺', '添加剂']
  },
  {
    id: 'guangwei',
    name: '广为科技',
    desc: '硫磺、磷酸贸易业务',
    icon: 'Brush',
    products: ['硫磺', '磷酸']
  }
]

const goToSubsidiary = (id: string) => {
  router.push({ name: `${id.charAt(0).toUpperCase() + id.slice(1)}Orders` })
}
</script>

<style scoped lang="scss">
.orders-index {
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

.card-products {
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
