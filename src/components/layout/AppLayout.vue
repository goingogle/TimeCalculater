<script setup lang="ts">
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'
</script>

<template>
  <div class="app-layout">
    <AppSidebar />
    <div class="app-layout__main">
      <AppHeader />
      <div class="app-layout__content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}
.app-layout__main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.app-layout__content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: var(--color-bg);
}
</style>
