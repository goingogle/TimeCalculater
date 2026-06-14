<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'
import {
  Odometer,
  Clock,
  Timer,
  Setting,
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const menuItems = [
  { name: 'dashboard', path: '/', title: '概览', icon: Odometer },
  { name: 'calculator', path: '/calculator', title: '时间计算', icon: Clock },
  { name: 'tracker', path: '/tracker', title: '工时追踪', icon: Timer },
  { name: 'settings', path: '/settings', title: '设置', icon: Setting },
]

const activeIndex = computed(() => {
  return route.path === '/' ? '/' : route.path
})

function handleSelect(path: string) {
  router.push(path)
}
</script>

<template>
  <aside class="app-sidebar">
    <div class="app-sidebar__logo">
      <el-icon :size="24" color="#2B6CB0"><Clock /></el-icon>
      <span class="app-sidebar__logo-text">时间计算机</span>
    </div>
    <el-menu
      :default-active="activeIndex"
      @select="handleSelect"
      class="app-sidebar__menu"
    >
      <el-menu-item v-for="item in menuItems" :key="item.path" :index="item.path">
        <el-icon><component :is="item.icon" /></el-icon>
        <span>{{ item.title }}</span>
      </el-menu-item>
    </el-menu>
  </aside>
</template>

<style scoped>
.app-sidebar {
  width: var(--sidebar-width);
  height: 100vh;
  background: var(--color-bg-card);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}
.app-sidebar__logo {
  height: var(--header-height);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 20px;
  border-bottom: 1px solid var(--color-border);
}
.app-sidebar__logo-text {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-primary);
  white-space: nowrap;
}
.app-sidebar__menu {
  border-right: none;
  flex: 1;
}
</style>
