<template lang="pug">
span.ui-icon(
  :class="classes"
  :style="styles"
  aria-hidden="true"
)
  svg.ui-icon__svg(
    v-if="paths.length"
    :viewBox="VIEW_BOX"
    xmlns="http://www.w3.org/2000/svg"
  )
    path.ui-icon__path(
      v-for="(pathData, index) in paths"
      :key="`${name}-${index}`"
      :d="pathData"
      fill="none"
      stroke="currentColor"
      :stroke-width="STROKE_WIDTH"
      stroke-linecap="round"
      stroke-linejoin="round"
    )
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

type UIIconSize = 's' | 'm' | 'l'

const props = withDefaults(
  defineProps<{
    name: string
    size?: UIIconSize
    color?: string
  }>(),
  {
    size: 'm',
    color: undefined,
  },
)

const VIEW_BOX = '0 0 24 24'
const STROKE_WIDTH = 2
const CACHE_NAME = 'ui-icon-cache-v1'

/**
 * Возвращает base URL с гарантированным завершающим слешем.
 * @param baseUrl Базовый путь Vite.
 * @returns Base URL с завершающим слешем.
 */
const normalizeBaseUrl = (baseUrl: string) => baseUrl.replace(/\/?$/, '/')

/**
 * Разбирает содержимое txt-файла на массив path data.
 * @param content Содержимое txt-файла иконки.
 * @returns Список строк с атрибутом d.
 */
const parsePathData = (content: string) =>
  content
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

/**
 * Возвращает CacheStorage, если доступен в окружении.
 * @returns CacheStorage или undefined.
 */
const getCacheStorage = () => (typeof caches === 'undefined' ? undefined : caches)

/**
 * Пытается получить txt-содержимое из долговременного кэша.
 * @param url Полный URL к txt-файлу иконки.
 * @returns Содержимое txt или undefined, если кэша нет.
 */
const readCachedText = async (url: string) => {
  const cacheStorage = getCacheStorage()

  if (!cacheStorage) {
    return undefined
  }

  const cache = await cacheStorage.open(CACHE_NAME)
  const response = await cache.match(url)

  if (!response) {
    return undefined
  }

  return response.text()
}

/**
 * Сохраняет txt-содержимое в долговременный кэш.
 * @param url Полный URL к txt-файлу иконки.
 * @param text Содержимое txt.
 */
const writeCachedText = async (url: string, text: string) => {
  const cacheStorage = getCacheStorage()

  if (!cacheStorage) {
    return
  }

  const cache = await cacheStorage.open(CACHE_NAME)
  await cache.put(
    url,
    new Response(text, {
      headers: {
        'Content-Type': 'text/plain',
      },
    }),
  )
}

/**
 * Загружает набор path-данных из txt-файла, сохраняя результат в Cache Storage.
 * @param url Полный URL к txt-файлу иконки.
 * @returns Список строк с атрибутом d.
 */
const fetchIconPaths = async (url: string) => {
  const cachedText = await readCachedText(url)

  if (typeof cachedText !== 'undefined') {
    return parsePathData(cachedText)
  }

  try {
    const response = await fetch(url)
    if (!response.ok) {
      return []
    }

    const text = await response.text()
    await writeCachedText(url, text)
    return parsePathData(text)
  } catch {
    return []
  }
}

const iconUrl = computed(() => {
  const baseUrl = normalizeBaseUrl(import.meta.env.BASE_URL as string)
  return `${baseUrl}icons/${props.name}.txt`
})

const paths = ref<string[]>([])

/**
 * Загружает данные иконки и обновляет локальное состояние.
 * @returns Promise после применения данных или пропуска при смене URL.
 */
const loadPaths = async () => {
  const currentUrl = iconUrl.value
  const result = await fetchIconPaths(currentUrl)

  if (currentUrl !== iconUrl.value) {
    return
  }

  paths.value = result
}

watch(
  iconUrl,
  () => {
    void loadPaths()
  },
  { immediate: true },
)

const classes = computed(() => ({ [`ui-icon--${props.size}`]: true }))
const styles = computed(() => ({
  color: props.color,
}))
</script>

<style lang="scss">
.ui-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: inherit;

  &__svg {
    display: block;
    width: 100%;
    height: 100%;
  }

  &--s {
    width: 16px;
    height: 16px;
  }

  &--m {
    width: 20px;
    height: 20px;
  }

  &--l {
    width: 24px;
    height: 24px;
  }
}
</style>
