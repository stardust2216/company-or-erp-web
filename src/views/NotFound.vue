<template>
  <div class="not-found">
    <h1>404</h1>
    <p>页面不存在</p>
    <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
  </div>
</template>

<style lang="scss" scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: #060818;
  color: #fff;
  h1 { font-size: 96px; margin: 0; background: linear-gradient(135deg, #0070f3, #7928ca); -webkit-background-clip: text; background-clip: text; color: transparent; }
  p { color: rgba(255,255,255,0.6); font-size: 18px; margin: 0; }
}
</style>
