<script setup lang="ts">
import { downloadDir } from '@tauri-apps/api/path'
import { openPath } from '@tauri-apps/plugin-opener'
import { FolderOpenIcon, InfoIcon, MoonIcon, RefreshCwIcon, SunIcon } from '@lucide/vue'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Spinner } from '@/components/ui/spinner'
import ThemeConfig from '../states/ThemeConfig'
import Updater from '../states/Updater'

const themeConfig = ThemeConfig()
const appVersion = __APP_VERSION__
const updater = Updater()

const checkForUpdate = () => {
  if (updater.downloading.value) return
  updater.checkForUpdate({ silent: false })
}

const openDownloadFolder = async () => {
  try {
    await openPath(await downloadDir())
  } catch (error) {
    toast.error(`打开下载目录失败：${error}`)
  }
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
      <Button variant="outline" size="sm" class="gap-1.5" @click="themeConfig.toggleTheme($event)">
        <SunIcon v-if="themeConfig.isDark.value" />
        <MoonIcon v-else />
        切换
      </Button>
    </div>

    <div class="flex items-center justify-between gap-4 px-4 py-3">
      <div class="flex items-center gap-3">
        <InfoIcon class="size-4 shrink-0 text-muted-foreground" />
        <div class="min-w-0">
          <p class="text-sm font-medium">版本</p>
          <p class="text-sm text-muted-foreground">V{{ appVersion }}</p>
        </div>
      </div>
      <Button
        v-if="!updater.downloading.value"
        variant="outline"
        size="sm"
        class="gap-1.5"
        :disabled="updater.checking.value"
        @click="checkForUpdate"
      >
        <Spinner v-if="updater.checking.value" />
        <RefreshCwIcon v-else />
        {{ updater.checking.value ? '检查中…' : '检查更新' }}
      </Button>
      <div v-else class="flex w-40 flex-col items-end gap-1">
        <span class="text-xs text-muted-foreground">正在下载 {{ updater.progress.value }}%</span>
        <Progress :model-value="updater.progress.value" />
      </div>
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
