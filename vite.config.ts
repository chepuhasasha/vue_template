import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv, type PluginOption } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

const normalizeBasePath = (value: string) => {
  const trimmed = value.trim()

  if (!trimmed || trimmed === '/') {
    return '/'
  }

  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`

  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`
}

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd())
  const basePath = normalizeBasePath(env.VITE_BASE_URL ?? env.BASE_URL ?? '/')
  const nodeEnv = env.VITE_NODE_ENV ?? mode
  const plugins: PluginOption[] = [vue()]

  if (command === 'serve') {
    const devToolsPlugin = vueDevTools()
    if (devToolsPlugin) {
      plugins.push(devToolsPlugin)
    }
  }

  return {
    base: basePath,
    plugins,
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(nodeEnv),
      'process.env': '{}',
    },
  }
})
