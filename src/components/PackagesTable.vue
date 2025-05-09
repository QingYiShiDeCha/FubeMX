<script setup lang="ts">
import NButton from 'naive-ui/es/button/src/Button'
import ThemeConfig from '../states/ThemeConfig';
const themeConfig = ThemeConfig();

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
                    onClick: () => { }
                },
                { default: () => '安装' }
            )
        }
    },
]

const data = [
    { serial: 'STM32F103', version: 'V1.0.0' },
    { serial: 'STM32F103', version: 'V1.0.0' },
    { serial: 'STM32F103', version: 'V1.0.0' },
    { serial: 'STM32F103', version: 'V1.0.0' },
    { serial: 'STM32F103', version: 'V1.0.0' },
    { serial: 'STM32F103', version: 'V1.0.0' },
    { serial: 'STM32F103', version: 'V1.0.0' },
    { serial: 'STM32F103', version: 'V1.0.0' },
    { serial: 'STM32F103', version: 'V1.0.0' },
    { serial: 'STM32F103', version: 'V1.0.0' },
    { serial: 'STM32F103', version: 'V1.0.0' },
    { serial: 'STM32F103', version: 'V1.0.0' },
    { serial: 'STM32F103', version: 'V1.0.0' },
    { serial: 'STM32F103', version: 'V1.0.0' },
    { serial: 'STM32F103', version: 'V1.0.0' },
    { serial: 'STM32F103', version: 'V1.0.0' },
    { serial: 'STM32F103', version: 'V1.0.0' },
    { serial: 'STM32F103', version: 'V1.0.0' },
    { serial: 'STM32F103', version: 'V1.0.0' },
    { serial: 'STM32F103', version: 'V1.0.0' },
    { serial: 'STM32F103', version: 'V1.0.0' },
    { serial: 'STM32F103', version: 'V1.0.0' },
    { serial: 'STM32F103', version: 'V1.0.0' },
    { serial: 'STM32F103', version: 'V1.0.0' },
    { serial: 'STM32F103', version: 'V1.0.0' },
    { serial: 'STM32F103', version: 'V1.0.0' },
    { serial: 'STM32F103', version: 'V1.0.0' },
    { serial: 'STM32F103', version: 'V1.0.0' },
    { serial: 'STM32F103', version: 'V1.0.0' },
    { serial: 'STM32F103', version: 'V1.0.0' },

]



</script>
<template>
    <div class="w-full h-full flex flex-col">
        <n-data-table size="small" :columns="columns" :data="data" :bordered="false"
            :max-height="themeConfig.contentHeight" />
    </div>
</template>