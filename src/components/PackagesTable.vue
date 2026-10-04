<script setup lang="ts">
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import PackageActions from './PackageActions.vue'
import PackageManager from '../states/PackageManager'

const packageManager = PackageManager()

const data = computed(() => packageManager.packages.value)
</script>

<template>
  <div class="min-h-0 flex-1">
    <div class="max-h-full overflow-y-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow class="hover:bg-transparent">
            <TableHead class="w-48 bg-muted/50">芯片系列</TableHead>
            <TableHead class="bg-muted/50">最新版本</TableHead>
            <TableHead class="w-72 bg-muted/50">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="item in data" :key="item.serial">
            <TableCell class="px-3 py-2.5 font-medium">{{ item.serial }}</TableCell>
            <TableCell class="px-3 py-2.5 tabular-nums">{{
              item.newVersion?.version ?? '—'
            }}</TableCell>
            <TableCell class="px-3 py-2.5">
              <PackageActions v-if="item.newVersion" :version="item.newVersion" />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
