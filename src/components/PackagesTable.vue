<script setup lang="ts">
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import PackageActions from './PackageActions.vue';
import PackageManager from '../states/PackageManager';
import ThemeConfig from '../states/ThemeConfig';

const packageManager = PackageManager();
const themeConfig = ThemeConfig();

const data = computed(() => packageManager.packages.value);
</script>

<template>
    <div class="w-full h-full overflow-y-auto" :style="{ maxHeight: themeConfig.contentHeight.value + 'px' }">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead class="w-48">芯片系列</TableHead>
                    <TableHead>最新版本</TableHead>
                    <TableHead class="w-72">操作</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow v-for="item in data" :key="item.serial">
                    <TableCell class="font-medium">{{ item.serial }}</TableCell>
                    <TableCell class="tabular-nums">{{ item.newVersion?.version ?? '—' }}</TableCell>
                    <TableCell>
                        <PackageActions v-if="item.newVersion" :version="item.newVersion" />
                    </TableCell>
                </TableRow>
            </TableBody>
        </Table>
    </div>
</template>
