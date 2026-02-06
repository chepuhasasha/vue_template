import { beforeEach, describe, it, expect } from 'vitest'
import router from '@/router'
import { ROUTE_NAME_HOME, ROUTE_NAME_LOGIN, ROUTE_NAME_NOT_FOUND } from '@/router/constants'

const STORED_SESSION_ID = 'sid-demo'

const navigateTo = async (path: string) => {
  await router.push(path)
  await router.isReady()
}

describe('router guards', () => {
  beforeEach(async () => {
    localStorage.clear()
    await router.replace({ name: ROUTE_NAME_LOGIN })
    await router.isReady()
  })

  it('редиректит гостя на логин при переходе на защищенную страницу', async () => {
    await navigateTo('/')

    expect(router.currentRoute.value.name).toBe(ROUTE_NAME_LOGIN)
    expect(router.currentRoute.value.query.redirect).toBe('/')
  })

  it('разрешает доступ к защищенной странице при наличии сессии', async () => {
    localStorage.setItem('session-id', STORED_SESSION_ID)

    await navigateTo('/')

    expect(router.currentRoute.value.name).toBe(ROUTE_NAME_HOME)
  })

  it('редиректит авторизованного пользователя с логина на главную', async () => {
    localStorage.setItem('session-id', STORED_SESSION_ID)

    await navigateTo('/')
    await navigateTo('/login')

    expect(router.currentRoute.value.name).toBe(ROUTE_NAME_HOME)
  })

  it('разрешает гостю оставаться на странице логина', async () => {
    await navigateTo('/login')

    expect(router.currentRoute.value.name).toBe(ROUTE_NAME_LOGIN)
  })

  it('открывает страницу 404 для неизвестного маршрута', async () => {
    await navigateTo('/missing-page')

    expect(router.currentRoute.value.name).toBe(ROUTE_NAME_NOT_FOUND)
  })
})
