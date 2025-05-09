import presetIcons from '@unocss/preset-icons'
import { defineConfig } from 'unocss'
import presetAttributify from '@unocss/preset-attributify'
import presetMini from '@unocss/preset-mini'


export default defineConfig({
  presets: [
    presetMini({ /* options */ }),
    presetIcons({ /* options */ }),
    presetAttributify({ /* options */}),
  ],
})