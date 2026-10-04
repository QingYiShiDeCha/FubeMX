import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { resolve, join } from 'node:path'
import pkg from './package.json'

// https://vite.dev/config/
export default defineConfig({
  clearScreen: false,
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [
    vue(),
    tailwindcss(),
    AutoImport({
      include: [
        /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
        /\.vue$/,
        /\.vue\?vue/, // .vue
        /\.vue\.[tj]sx?\?vue/, // .vue (vue-loader with experimentalInlineMatchResource enabled)
        /\.md$/, // .md
      ],
      dts: true,
      imports: ['vue', '@vueuse/core'],
    }),
  ],
  envPrefix: ['VITE_', 'TAURI_ENV_*'],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@assets': join(__dirname, 'src/assets'),
    },
  },
})
