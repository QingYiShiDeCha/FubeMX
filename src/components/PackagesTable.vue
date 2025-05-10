<script setup lang="ts">
import NButton from 'naive-ui/es/button/src/Button'
import ThemeConfig from '../states/ThemeConfig';
import OnlineInfo from '../states/OnlineInfo';
const themeConfig = ThemeConfig();
const onlineInfo = OnlineInfo();

function downloadPackage(file: string) {
    console.log(file);
   onlineInfo.downloadPackage(file); 
}

const columns = [
    { title: '芯片系列', key: 'serial' },
    { title: '最新版本', key: 'version' },
    {
        title: '操作', key: 'actions',
        render: (row: any) => {
            return h(
                NButton,
                {
                    strong: true,
                    tertiary: true,
                    size: 'small',
                    onClick: () => downloadPackage(row.file) 
                },
                { default: () => '安装' }
            )
        }
    },
]

const data = computed(() => {
    if (onlineInfo.packages.value.length === 0) {
        return [];
    }
    return onlineInfo.packages.value.map((item) => {
        return {
            serial: item.serial,
            version: item.versions.length > 0 ? item.versions[0].version : '暂无',
            file: item.versions.length > 0? item.versions[0].file : ''
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