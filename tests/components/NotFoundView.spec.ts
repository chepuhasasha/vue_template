import { render, screen, fireEvent } from '@testing-library/vue'
import { flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory, type Router } from 'vue-router'
import { defineComponent } from 'vue'
import { beforeEach, describe, it, expect } from 'vitest'
import NotFoundView from '@/views/NotFound/View.vue'
import components from '@/components'
import { ROUTE_NAME_HOME, ROUTE_NAME_NOT_FOUND } from '@/router/constants'
import { getTestId } from '../helpers'

const NOT_FOUND_CODE = '404'
const UNKNOWN_PATH_SEGMENT = 'missing-page'

const StubView = defineComponent({ template: '<div />' })

const createTestRouter = () =>
  createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: ROUTE_NAME_HOME, component: StubView },
      { path: '/:pathMatch(.*)*', name: ROUTE_NAME_NOT_FOUND, component: NotFoundView },
    ],
  })

let router: Router

const renderNotFound = async () => {
  await router.replace({
    name: ROUTE_NAME_NOT_FOUND,
    params: { pathMatch: [UNKNOWN_PATH_SEGMENT] },
  })
  await router.isReady()

  return render(NotFoundView, {
    global: {
      plugins: [components, router],
    },
  })
}

describe('NotFoundView', () => {
  beforeEach(() => {
    router = createTestRouter()
  })

  it('показывает текст и возвращает на главную', async () => {
    await renderNotFound()

    expect(screen.getByTestId(getTestId('not-found-code'))).toHaveTextContent(NOT_FOUND_CODE)
    expect(screen.getByTestId(getTestId('not-found-title'))).toHaveTextContent('Page not found')
    expect(screen.getByTestId(getTestId('not-found-subtitle'))).toBeInTheDocument()

    await fireEvent.click(screen.getByTestId(getTestId('not-found-home')))
    await flushPromises()

    expect(router.currentRoute.value.name).toBe(ROUTE_NAME_HOME)
  })
})
