<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Spinner } from '@/components/ui/spinner'
import PackageManager from '../states/PackageManager'

const props = defineProps<{ version: VersionInfo }>()
const packageManager = PackageManager()

const isInstalled = computed(() => props.version.installed)

const isDealing = computed(() => packageManager.dealing.value?.version.name === props.version.name)

const dealing = computed(() => packageManager.dealing.value)

function downloadPackage() {
  packageManager.startInstall(props.version)
}
</script>

<template>
  <Badge
    v-if="isInstalled"
    variant="outline"
    class="border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
    >已安装</Badge
  >

  <div v-else-if="isDealing" class="flex items-center gap-2">
    <template v-if="dealing?.state === 'downloading'">
      <span class="text-xs text-muted-foreground shrink-0">正在下载</span>
      <Progress :model-value="dealing.downloadProgress" class="w-36" />
      <span class="text-xs text-muted-foreground tabular-nums w-9 text-right"
        >{{ dealing.downloadProgress }}%</span
      >
    </template>
    <div v-else-if="dealing?.state === 'installing'" class="flex items-center gap-2">
      <span class="text-xs text-muted-foreground">正在安装</span>
      <Spinner class="size-4" />
    </div>
  </div>

  <Button v-else variant="outline" size="sm" @click="downloadPackage">点击安装</Button>
</template>
