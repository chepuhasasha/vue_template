/// <reference types="vite/client" />
/// <reference types="vitest" />

interface ImportMetaEnv {
  readonly VITE_BASE_URL?: string
  readonly VITE_DISABLE_TEST_ID?: string
  readonly VITE_TEST_ID_PREFIX?: string
  readonly VITE_NODE_ENV?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
