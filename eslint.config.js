import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import globals from 'globals'

export default defineConfigWithVueTs(
  {
    name: 'fubemx/ignores',
    ignores: [
      'dist/**',
      'src-tauri/**',
      'auto-imports.d.ts',
      'components.d.ts',
      // 由 shadcn-vue CLI 生成，升级组件时会被整体覆盖，不参与格式化与 lint
      'src/components/ui/**',
    ],
  },

  {
    name: 'fubemx/source-files',
    files: ['**/*.{ts,mts,cts,tsx,vue}'],
  },

  js.configs.recommended,
  pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommended,
  skipFormatting,

  {
    name: 'fubemx/globals',
    files: ['**/*.{ts,mts,cts,tsx,vue}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  }
)
