<script setup lang="ts">
import { ExternalLinkIcon } from '@lucide/vue'
import { openUrl } from '@tauri-apps/plugin-opener'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import SoftwaresManager from '../states/SoftwaresManager'

const props = defineProps<{ s: SoftwareInfo }>()
const softwaresManager = SoftwaresManager()

const isDealing = computed(() => softwaresManager.dealing.value?.software.name === props.s.name)

const dealing = computed(() => softwaresManager.dealing.value)

function downloadSoftware() {
  softwaresManager.downloadSoftware(props.s)
}
</script>

<template>
  <div class="flex items-center gap-2">
    <template v-if="isDealing && dealing?.state === 'downloading'">
      <span class="text-xs text-muted-foreground shrink-0">正在下载</span>
      <Progress :model-value="dealing.downloadProgress" class="w-36" />
      <span class="text-xs text-muted-foreground tabular-nums w-9 text-right"
        >{{ dealing.downloadProgress }}%</span
      >
    </template>
    <template v-else>
      <Button variant="outline" size="sm" @click="downloadSoftware">下载安装包</Button>
      <Button
        v-if="props.s.faq"
        variant="link"
        size="sm"
        class="h-auto p-0 text-destructive"
        @click="() => openUrl(props.s.faq!)"
      >
        安装说明
        <ExternalLinkIcon class="size-3" />
      </Button>
    </template>
  </div>
</template>
