<script setup lang="ts">
import { downloadDir } from '@tauri-apps/api/path'
import { openPath } from '@tauri-apps/plugin-opener'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import SoftwaresActions from './SoftwaresActions.vue'
import SoftwaresManager from '../states/SoftwaresManager'
import ThemeConfig from '../states/ThemeConfig'

const softwaresManager = SoftwaresManager()
const themeConfig = ThemeConfig()

const data = computed(() => softwaresManager.onlineSoftwares.value)

const openDownloadFolder = async () => {
  const p = await downloadDir()
  await openPath(p)
}
</script>

<template>
  <div class="w-full h-full flex flex-col gap-4">
    <div
      class="overflow-y-auto"
      :style="{ maxHeight: themeConfig.contentHeight.value - 32 + 'px' }"
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-52">软件名称</TableHead>
            <TableHead>功能介绍</TableHead>
            <TableHead class="w-80">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="s in data" :key="s.name">
            <TableCell class="font-medium">{{ s.name }}</TableCell>
            <TableCell class="text-muted-foreground">{{ s.description }}</TableCell>
            <TableCell>
              <SoftwaresActions :s="s" />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
    <p class="text-sm text-muted-foreground text-center shrink-0">
      安装包将下载到您的
      <button class="text-primary hover:underline" @click="openDownloadFolder">下载文件夹</button>
      ，请自行安装。
    </p>
  </div>
</template>
