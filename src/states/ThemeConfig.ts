import { createGlobalState, useDark, useWindowSize } from "@vueuse/core";

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

    const toolbarHeight = 40;
    const tabbarHeight = 80;

    const { height } = useWindowSize()

    const contentHeight = computed(() => height.value - toolbarHeight - tabbarHeight)

    return { isDark, theme, toggleTheme, toolbarHeight, tabbarHeight, contentHeight }
})

export default ThemeConfig;
