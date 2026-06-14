import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: () => import('@/components/layout/AppLayout.vue'),
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('@/views/DashboardView.vue'),
          meta: { title: '概览', icon: 'Odometer' },
        },
        {
          path: 'calculator',
          name: 'calculator',
          component: () => import('@/views/CalculatorView.vue'),
          meta: { title: '时间计算', icon: 'Clock' },
        },
        {
          path: 'tracker',
          name: 'tracker',
          component: () => import('@/views/TrackerView.vue'),
          meta: { title: '工时追踪', icon: 'Timer' },
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('@/views/SettingsView.vue'),
          meta: { title: '设置', icon: 'Setting' },
        },
      ],
    },
  ],
})

export default router
