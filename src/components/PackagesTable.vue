<script setup lang="ts">
import ThemeConfig from '../states/ThemeConfig';
import PackageManager from '../states/PackageManager';
import PackageActions from './PackageActions.vue';
const themeConfig = ThemeConfig();
const packageManager = PackageManager();

const columns = [
    { title: '芯片系列', key: 'serial' },
    { title: '最新版本', key: 'newVersion.version' },
    {
        title: '操作', key: 'actions',
        render: (row: any) => h(PackageActions, { version: row.newVersion })
    },
]

const data = computed(() => {
    if (packageManager.packages.value.length === 0) {
        return [];
    }
    return packageManager.packages.value.map((item) => {
        return {
            serial: item.serial,
            newVersion: item.newVersion,
        }
    })
})



</script>
<template>
    <div class="w-full h-full flex flex-col">
        <n-data-table size="small" :columns="columns" :data="data" :bordered="false"
            :max-height="themeConfig.contentHeight.value" />
    </div>
</template>