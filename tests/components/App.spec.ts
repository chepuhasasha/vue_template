import { render, screen, fireEvent } from '@testing-library/vue'
import { beforeEach, describe, it, expect } from 'vitest'
import App from '@/App.vue'
import components from '@/components'
import { getTestId } from '../helpers'

const renderApp = () =>
  render(App, {
    global: {
      plugins: [components],
      stubs: {
        RouterView: { template: '<div />' },
      },
    },
  })

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('переключает язык по кнопке', async () => {
    renderApp()

    const languageButton = screen.getByTestId(getTestId('header-language-toggle'))

    expect(languageButton).toHaveTextContent('EN')

    await fireEvent.click(languageButton)

    expect(languageButton).toHaveTextContent('RU')

    await fireEvent.click(languageButton)

    expect(languageButton).toHaveTextContent('EN')
  })
})
