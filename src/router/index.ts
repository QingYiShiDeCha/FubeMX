import { createRouter, createWebHashHistory } from 'vue-router'
import AppContent from '@/AppContent.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: AppContent,
      children: [
        { path: '', redirect: '/softwares' },
        {
          path: 'softwares',
          name: 'softwares',
          component: () => import('@/components/SoftwaresTable.vue'),
          meta: { title: '软件安装' },
        },
        {
          path: 'packages',
          name: 'packages',
          component: () => import('@/components/PackagesTable.vue'),
          meta: { title: '固件包管理' },
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('@/components/SettingsPage.vue'),
          meta: { title: '设置' },
        },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/softwares' },
  ],
})

export default router
