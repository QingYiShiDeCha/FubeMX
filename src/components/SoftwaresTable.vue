<script setup lang="ts">
import ThemeConfig from '../states/ThemeConfig';
import SoftwaresManager from '../states/SoftwaresManager';
import SoftwaresActions from './SoftwaresActions.vue';
import { downloadDir } from '@tauri-apps/api/path';
import { openPath } from '@tauri-apps/plugin-opener';
const themeConfig = ThemeConfig();
const softwaresManager = SoftwaresManager();
const columns = [
    { title: '软件名称', key: 'name', resizable: true, width: 200 },
    { title: '功能介绍', key: 'description' },
    {
        title: '操作', key: 'actions',
        width: 290,
        render: (row: any) => h(
            "div",
            { class: "flex items-baseline gap-2" },
            {
                default: () => [
                    h(SoftwaresActions, {
                        s: row,
                    }),
                ]
            }
        )
    },
]

const data = computed(() => {
    return softwaresManager.onlineSoftwares.value
})

const openDownloadFolder = async () => {
    const p = await downloadDir();
    console.log('open download folder', p);
    await openPath(p);
}
</script>

<template>
    <div class="w-full h-full flex flex-col">
        <n-data-table size="small" :columns="columns" :data="data" :bordered="false"
            :max-height="themeConfig.contentHeight.value" />
        <span mx-auto mt-5>安装包将下载到您的<a text-blue cursor-pointer @click="openDownloadFolder">下载文件夹</a>，请自行安装。</span>
    </div>
</template>