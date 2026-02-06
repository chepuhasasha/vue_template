import { render, screen, fireEvent, within } from '@testing-library/vue'
import { flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory, type Router } from 'vue-router'
import { defineComponent } from 'vue'
import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest'
import LoginView from '@/views/Login/View.vue'
import components from '@/components'
import { ROUTE_NAME_HOME, ROUTE_NAME_LOGIN } from '@/router/constants'
import { AUTH_ERROR_INVALID_CREDENTIALS } from '@/services'
import { getTestId } from '../helpers'

const LOGIN_VALUE = 'demo'
const PASSWORD_VALUE = 'secret'
const INVALID_LOGIN_VALUE = 'invalid'
const STORED_SESSION_ID = 'sid-demo'
const REDIRECT_PATH = '/profile'
const HTTP_STATUS_OK = 200
const HTTP_STATUS_UNAUTHORIZED = 401

const StubView = defineComponent({ template: '<div />' })

const createTestRouter = () =>
  createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: ROUTE_NAME_HOME, component: StubView },
      { path: '/login', name: ROUTE_NAME_LOGIN, component: StubView },
      { path: '/profile', name: 'profile', component: StubView },
    ],
  })

let router: Router

const createResponse = (options: { ok: boolean; status: number; payload: unknown }): Response =>
  ({
    ok: options.ok,
    status: options.status,
    json: vi.fn().mockResolvedValue(options.payload),
  }) as unknown as Response

const mockFetch = (options: { ok: boolean; status: number; payload: unknown }) => {
  const fetchMock = vi.fn().mockResolvedValue(createResponse(options))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

const renderLogin = async () => {
  await router.replace({ name: ROUTE_NAME_LOGIN })
  await router.isReady()

  return render(LoginView, {
    global: {
      plugins: [components, router],
    },
  })
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('LoginView', () => {
  beforeEach(async () => {
    localStorage.clear()
    router = createTestRouter()
    await router.replace({ name: ROUTE_NAME_LOGIN })
    await router.isReady()
  })

  it('рендерит заголовок и подсказку', async () => {
    await renderLogin()

    expect(screen.getByTestId(getTestId('login-title'))).toHaveTextContent('Sign in')
    expect(screen.getByTestId(getTestId('login-hint'))).toBeInTheDocument()
  })

  it('переключает видимость пароля', async () => {
    await renderLogin()

    const passwordRoot = screen.getByTestId(getTestId({ id: 'login', suffix: 'password-input' }))
    const passwordInput = within(passwordRoot).getByTestId(
      getTestId({ id: 'ui-input', suffix: 'control' }),
    )
    const toggleButton = screen.getByTestId(getTestId({ id: 'login', suffix: 'password-toggle' }))

    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(toggleButton).toHaveAttribute('aria-pressed', 'false')

    await fireEvent.click(toggleButton)

    expect(passwordInput).toHaveAttribute('type', 'text')
    expect(toggleButton).toHaveAttribute('aria-pressed', 'true')

    await fireEvent.click(toggleButton)

    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('не редиректит, если сессии нет', async () => {
    await renderLogin()
    await flushPromises()

    expect(router.currentRoute.value.name).toBe(ROUTE_NAME_LOGIN)
  })

  it('редиректит на главную, если сессия уже есть', async () => {
    localStorage.setItem('session-id', STORED_SESSION_ID)

    await renderLogin()
    await flushPromises()

    expect(router.currentRoute.value.name).toBe(ROUTE_NAME_HOME)
  })

  it('не отправляет запрос, если форма пустая', async () => {
    const fetchMock = mockFetch({
      ok: true,
      status: HTTP_STATUS_OK,
      payload: { sid: STORED_SESSION_ID },
    })

    await renderLogin()

    const form = screen.getByTestId(getTestId('login-form'))

    await fireEvent.submit(form)

    const authCalls = fetchMock.mock.calls.filter(([url]) => String(url).includes('/auth/login'))

    expect(authCalls).toHaveLength(0)
  })

  it('редиректит на главную после успешного входа', async () => {
    mockFetch({ ok: true, status: HTTP_STATUS_OK, payload: { sid: STORED_SESSION_ID } })

    await renderLogin()

    const submitButton = screen.getByTestId(getTestId({ id: 'login', suffix: 'submit' }))

    const loginRoot = screen.getByTestId(getTestId({ id: 'login', suffix: 'login-input' }))
    const passwordRoot = screen.getByTestId(getTestId({ id: 'login', suffix: 'password-input' }))
    const loginInput = within(loginRoot).getByTestId(
      getTestId({ id: 'ui-input', suffix: 'control' }),
    )
    const passwordInput = within(passwordRoot).getByTestId(
      getTestId({ id: 'ui-input', suffix: 'control' }),
    )

    await fireEvent.update(loginInput, LOGIN_VALUE)
    await fireEvent.update(passwordInput, PASSWORD_VALUE)

    await fireEvent.click(submitButton)
    await flushPromises()

    expect(router.currentRoute.value.name).toBe(ROUTE_NAME_HOME)
  })

  it('редиректит на путь из query после успешного входа', async () => {
    mockFetch({ ok: true, status: HTTP_STATUS_OK, payload: { sid: STORED_SESSION_ID } })

    await router.replace({ name: ROUTE_NAME_LOGIN, query: { redirect: REDIRECT_PATH } })
    await router.isReady()

    await render(LoginView, {
      global: {
        plugins: [components, router],
      },
    })

    const submitButton = screen.getByTestId(getTestId({ id: 'login', suffix: 'submit' }))

    const loginRoot = screen.getByTestId(getTestId({ id: 'login', suffix: 'login-input' }))
    const passwordRoot = screen.getByTestId(getTestId({ id: 'login', suffix: 'password-input' }))
    const loginInput = within(loginRoot).getByTestId(
      getTestId({ id: 'ui-input', suffix: 'control' }),
    )
    const passwordInput = within(passwordRoot).getByTestId(
      getTestId({ id: 'ui-input', suffix: 'control' }),
    )

    await fireEvent.update(loginInput, LOGIN_VALUE)
    await fireEvent.update(passwordInput, PASSWORD_VALUE)

    await fireEvent.click(submitButton)
    await flushPromises()

    expect(router.currentRoute.value.path).toBe(REDIRECT_PATH)
  })

  it('показывает ошибку при неверных данных', async () => {
    mockFetch({
      ok: false,
      status: HTTP_STATUS_UNAUTHORIZED,
      payload: { code: AUTH_ERROR_INVALID_CREDENTIALS },
    })

    await renderLogin()

    const submitButton = screen.getByTestId(getTestId({ id: 'login', suffix: 'submit' }))
    const loginRoot = screen.getByTestId(getTestId({ id: 'login', suffix: 'login-input' }))
    const passwordRoot = screen.getByTestId(getTestId({ id: 'login', suffix: 'password-input' }))
    const loginInput = within(loginRoot).getByTestId(
      getTestId({ id: 'ui-input', suffix: 'control' }),
    )
    const passwordInput = within(passwordRoot).getByTestId(
      getTestId({ id: 'ui-input', suffix: 'control' }),
    )

    await fireEvent.update(loginInput, INVALID_LOGIN_VALUE)
    await fireEvent.update(passwordInput, PASSWORD_VALUE)
    await fireEvent.click(submitButton)

    expect(await screen.findByTestId(getTestId('login-error'))).toBeInTheDocument()
  })
})
