<script setup lang="ts">
import SoftwaresManager from '../states/SoftwaresManager';
import { openUrl } from '@tauri-apps/plugin-opener';

const props = defineProps<{ s: SoftwareInfo }>()
const softwaresManager = SoftwaresManager();

const isDealing = computed(() => {
    return softwaresManager.dealing.value?.software.name === props.s.name;
})

function downloadSoftware() {
    softwaresManager.downloadSoftware(props.s);
}
</script>

<template>
    <div flex>
        <div v-if="isDealing">
            <div v-if="softwaresManager.dealing.value?.state == 'downloading'" flex>
                <span mr-1rem> 正在下载</span>
                <div w-10rem>
                    <NProgress type="line" :percentage="softwaresManager.dealing.value.downloadProgress"
                        indicator-placement="inside" />
                </div>
            </div>
        </div>
        <div v-else flex gap-2>
            <NButton type="info" size="small" @click="downloadSoftware">下载安装包</NButton>
            <span v-if="props.s.faq" text-red-6 hover:underline cursor-pointer @click="() => openUrl(props.s.faq!)">安装说明</span>
        </div>
    </div>
</template>