import { render, screen, fireEvent } from '@testing-library/vue'
import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, it, expect } from 'vitest'
import HomeView from '@/views/Home/View.vue'
import components from '@/components'
import router, { ROUTE_NAME_HOME, ROUTE_NAME_LOGIN } from '@/router'
import { getSessionId } from '@/services'
import { getTestId } from '../helpers'

const STORED_SESSION_ID = 'sid-demo'

const renderHome = async () => {
  await router.replace({ name: ROUTE_NAME_HOME })
  await router.isReady()

  return render(HomeView, {
    global: {
      plugins: [components, router],
    },
  })
}

describe('HomeView', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('показывает sid и завершает сессию при выходе', async () => {
    localStorage.setItem('session-id', STORED_SESSION_ID)

    await renderHome()

    expect(screen.getByTestId(getTestId('home-session-value'))).toHaveTextContent(STORED_SESSION_ID)

    await fireEvent.click(screen.getByTestId(getTestId('home-logout')))
    await flushPromises()

    expect(getSessionId()).toBe('')
    expect(router.currentRoute.value.name).toBe(ROUTE_NAME_LOGIN)
  })
})
