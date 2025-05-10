<script setup lang="ts">
import PackagesTable from './components/PackagesTable.vue';
import Toolbar from './components/Toolbar.vue';
import OnlineInfo from './states/OnlineInfo';

const onlineInfo = OnlineInfo();


// function fetchInfo() {
//   onlineInfo.fetchInfo();
// }
onlineInfo.fetchInfo();

</script>

<template>
    <div class="w-screen h-screen overflow-hidden box-border bg-#F2F2F2">
        <Toolbar />
        <div mx-3 ref="tabbarEl" relative>
            <n-tabs type="line" animated>
                <n-tab-pane name="software" tab="软件安装">
                    <PackagesTable />
                </n-tab-pane>
                <n-tab-pane name="packages" tab="固件包管理">
                    <PackagesTable />
                </n-tab-pane>
                <n-tab-pane name="settings" tab="FubeMX设置">

                </n-tab-pane>
            </n-tabs>
        </div>
    </div>
</template>
