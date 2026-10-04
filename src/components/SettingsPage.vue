<script setup lang="ts">
import { downloadDir } from '@tauri-apps/api/path'
import { openPath } from '@tauri-apps/plugin-opener'
import { FolderOpenIcon, InfoIcon, MoonIcon, SunIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import ThemeConfig from '../states/ThemeConfig'

const themeConfig = ThemeConfig()
const appVersion = __APP_VERSION__

const openDownloadFolder = async () => {
  const p = await downloadDir()
  await openPath(p)
}
</script>

<template>
  <div class="max-w-xl divide-y overflow-hidden rounded-lg border">
    <div class="flex items-center justify-between gap-4 px-4 py-3">
      <div class="flex items-center gap-3">
        <MoonIcon class="size-4 shrink-0 text-muted-foreground" />
        <div>
          <p class="text-sm font-medium">主题外观</p>
          <p class="text-sm text-muted-foreground">
            当前为{{ themeConfig.isDark.value ? '深色' : '浅色' }}模式
          </p>
        </div>
      </div>
      <Button variant="outline" size="sm" class="gap-1.5" @click="themeConfig.toggleTheme()">
        <SunIcon v-if="themeConfig.isDark.value" />
        <MoonIcon v-else />
        切换
      </Button>
    </div>

    <div class="flex items-center justify-between gap-4 px-4 py-3">
      <div class="flex items-center gap-3">
        <InfoIcon class="size-4 shrink-0 text-muted-foreground" />
        <div>
          <p class="text-sm font-medium">版本</p>
          <p class="text-sm text-muted-foreground">V{{ appVersion }}</p>
        </div>
      </div>
      <span class="text-xs text-muted-foreground">由线上信息检测更新</span>
    </div>

    <div class="flex items-center justify-between gap-4 px-4 py-3">
      <div class="flex items-center gap-3">
        <FolderOpenIcon class="size-4 shrink-0 text-muted-foreground" />
        <div>
          <p class="text-sm font-medium">下载目录</p>
          <p class="text-sm text-muted-foreground">软件安装包与固件包压缩包的保存位置</p>
        </div>
      </div>
      <Button variant="outline" size="sm" class="gap-1.5" @click="openDownloadFolder">
        <FolderOpenIcon />
        打开
      </Button>
    </div>
  </div>
</template>
