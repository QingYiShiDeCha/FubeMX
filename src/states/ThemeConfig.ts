import { createGlobalState, useDark } from '@vueuse/core'

type DocumentWithViewTransition = Document & {
  startViewTransition?: (updateCallback: () => void) => unknown
}

const ThemeConfig = createGlobalState(() => {
  const isDark = useDark({
    storageKey: 'fubemx-theme',
    selector: 'html',
    valueDark: 'dark',
    valueLight: '',
  })

  const theme = computed<'light' | 'dark'>(() => (isDark.value ? 'dark' : 'light'))

  function toggleTheme(event?: MouseEvent) {
    const apply = () => {
      isDark.value = !isDark.value
    }

    const doc = document as DocumentWithViewTransition
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!doc.startViewTransition || prefersReducedMotion) {
      apply()
      return
    }

    // 以点击位置为圆心做圆形揭示动画，未提供事件时从右上角展开
    const x = event?.clientX ?? window.innerWidth
    const y = event?.clientY ?? 0
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    )

    const root = document.documentElement
    root.style.setProperty('--theme-x', `${x}px`)
    root.style.setProperty('--theme-y', `${y}px`)
    root.style.setProperty('--theme-radius', `${radius}px`)

    doc.startViewTransition(apply)
  }

  return { isDark, theme, toggleTheme }
})

export default ThemeConfig
