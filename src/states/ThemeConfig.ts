import { createGlobalState, useDark } from '@vueuse/core'

const ThemeConfig = createGlobalState(() => {
  const isDark = useDark({
    storageKey: 'fubemx-theme',
    selector: 'html',
    valueDark: 'dark',
    valueLight: '',
  })

  const theme = computed<'light' | 'dark'>(() => (isDark.value ? 'dark' : 'light'))

  function toggleTheme() {
    isDark.value = !isDark.value
  }

  return { isDark, theme, toggleTheme }
})

export default ThemeConfig
