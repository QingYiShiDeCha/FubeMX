<script setup lang="ts">
import { Window } from '@tauri-apps/api/window';
import { OnlineInfo } from '../states/OnlineInfo';

const onlineInfo = OnlineInfo();
const handleDownload = async () => {
  onlineInfo.downloadPackage();
  // onlineInfo.unzipFile();
};

const appWindow = new Window('main');
const handleClose = () => {
    appWindow.close();
}

const handleMin = () => {
    appWindow.minimize(); 
}

</script>
<template>
    <div data-tauri-drag-region w-full h-2.3rem fix top-0 right-0 left-0 z-10 border-b-1 border-b-solid
        border-b-coolgray pl-1rem flex items-center select-none>
        <div flex items-center gap-2 cursor-default text-xl>
            <!-- <span i-ph-anchor-simple-thin /> -->
            <span font-bold><span text-red-6>F</span>ube<span text-blue>MX</span></span>
        </div>
        <div flex-grow></div>
        <button @click="handleDownload" class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
          下载
        </button>
        <!-- 窗口按钮 -->
        <div flex h-full>
            <div flex justify-center items-center h-full w-2.3rem class="hover:bg-[#DADADA]" @click="handleMin">
                <div i-ic:twotone-minus />
            </div>

            <div flex justify-center items-center h-full w-2.3rem class="hover:bg-red" @click="handleClose">
                <div i-material-symbols:close-rounded />
            </div>
        </div>
    </div>
</template>
