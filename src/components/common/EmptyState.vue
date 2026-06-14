<script setup lang="ts">
import { Document } from '@element-plus/icons-vue'
</script>

<template>
  <div class="empty-state">
    <el-icon :size="48" color="#CBD5E0"><Document /></el-icon>
    <p class="empty-state__text">暂无数据</p>
    <p class="empty-state__hint">开始使用后，数据将在这里显示</p>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}
.empty-state__text {
  margin-top: 16px;
  font-size: 16px;
  color: var(--color-text-secondary);
}
.empty-state__hint {
  margin-top: 8px;
  font-size: 13px;
  color: #A0AEC0;
}
</style>
