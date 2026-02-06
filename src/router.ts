import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import AboutView from '@/views/About/View.vue'
import HomeView from '@/views/Home/View.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/about',
    name: 'about',
    component: AboutView,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
