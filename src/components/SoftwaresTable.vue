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

const softwaresManager = SoftwaresManager()

const data = computed(() => softwaresManager.onlineSoftwares.value)

const openDownloadFolder = async () => {
  const p = await downloadDir()
  await openPath(p)
}
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col gap-3">
    <div class="min-h-0 flex-1">
      <div class="max-h-full overflow-y-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow class="hover:bg-transparent">
              <TableHead class="w-52 bg-muted/50">软件名称</TableHead>
              <TableHead class="bg-muted/50">功能介绍</TableHead>
              <TableHead class="w-80 bg-muted/50">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="s in data" :key="s.name">
              <TableCell class="px-3 py-2.5 font-medium">{{ s.name }}</TableCell>
              <TableCell class="px-3 py-2.5 text-muted-foreground">
                {{ s.description }}
              </TableCell>
              <TableCell class="px-3 py-2.5">
                <SoftwaresActions :s="s" />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
    <p class="shrink-0 text-sm text-muted-foreground">
      安装包将下载到您的
      <button class="text-primary hover:underline" @click="openDownloadFolder">下载文件夹</button>
      ，请自行安装。
    </p>
  </div>
</template>
