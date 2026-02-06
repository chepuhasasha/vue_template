import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import { ROUTE_NAME_HOME, ROUTE_NAME_LOGIN, ROUTE_NAME_NOT_FOUND } from '@/router/constants'
import { getSessionId } from '@/services'
import HomeView from '@/views/Home/View.vue'
import LoginView from '@/views/Login/View.vue'
import NotFoundView from '@/views/NotFound/View.vue'

export { ROUTE_NAME_HOME, ROUTE_NAME_LOGIN, ROUTE_NAME_NOT_FOUND } from '@/router/constants'

const REDIRECT_QUERY_KEY = 'redirect'
const EMPTY_VALUE = ''
const DEFAULT_REDIRECT_PATH = '/'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: ROUTE_NAME_HOME,
    component: HomeView,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/login',
    name: ROUTE_NAME_LOGIN,
    component: LoginView,
    meta: {
      guestOnly: true,
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: ROUTE_NAME_NOT_FOUND,
    component: NotFoundView,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

/**
 * Проверяет, есть ли сохраненный SID пользователя.
 * @returns true, если SID присутствует в хранилище.
 */
const hasSessionId = (): boolean => getSessionId() !== EMPTY_VALUE

router.beforeEach((to) => {
  const isAuthorized = hasSessionId()

  if (to.meta.requiresAuth && !isAuthorized) {
    const redirectTarget = to.fullPath || DEFAULT_REDIRECT_PATH

    return {
      name: ROUTE_NAME_LOGIN,
      query: {
        [REDIRECT_QUERY_KEY]: redirectTarget,
      },
    }
  }

  if (to.meta.guestOnly && isAuthorized) {
    return { name: ROUTE_NAME_HOME }
  }

  return true
})

export default router
