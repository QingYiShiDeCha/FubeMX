<script setup lang="ts">
import PackageManager from '../states/PackageManager';
import OnlineInfo from '../states/OnlineInfo';
import { NProgress, NSpin } from 'naive-ui';
const props = defineProps<{ version: VersionInfo }>()
const packageManager = PackageManager();
const onlineInfo = OnlineInfo();


const isInstalled = computed(() => {
    return props.version.installed;
})

const isDealing = computed(() => {
    return packageManager.dealing.value?.version.name === props.version.name;
})

function downloadPackage() {
    packageManager.startInstall(props.version);
}
</script>

<template>
    <div flex>
        <NTag type="success" v-if="isInstalled">已安装</NTag>
        <div v-else-if="isDealing">
            <div v-if="packageManager.dealing.value?.state == 'downloading'" flex>
                <span mr-1rem> 正在下载</span>
                <div w-10rem>
                    <NProgress type="line" :percentage="packageManager.dealing.value.downloadProgress"
                        indicator-placement="inside" />
                </div>
            </div>
            <div v-else-if="packageManager.dealing.value?.state == 'installing'" flex>
                <span mr-1rem>正在安装 </span>
                <NSpin size="small" />
            </div>
        </div>
        <NButton v-else type="info" size="small" @click="downloadPackage">点击安装</NButton>
    </div>
</template>