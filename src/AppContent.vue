<script setup lang="ts">
import { RefreshCwIcon } from '@lucide/vue';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OnlineInfo from './states/OnlineInfo';
import PackagesTable from './components/PackagesTable.vue';
import SoftwaresTable from './components/SoftwaresTable.vue';
import Toolbar from './components/Toolbar.vue';

const onlineInfo = OnlineInfo();
const activeTab = ref('software');

onlineInfo.fetchInfo();
</script>

<template>
    <div class="h-screen flex flex-col overflow-hidden bg-background text-foreground relative">
        <Toolbar />
        <Tabs v-model="activeTab" class="mx-4 mt-3 flex flex-1 min-h-0 flex-col gap-3">
            <TabsList class="self-start">
                <TabsTrigger value="software">软件安装</TabsTrigger>
                <TabsTrigger value="packages">固件包管理</TabsTrigger>
                <TabsTrigger value="settings">FubeMX设置</TabsTrigger>
            </TabsList>
            <TabsContent value="software" class="flex-1 min-h-0">
                <SoftwaresTable />
            </TabsContent>
            <TabsContent value="packages" class="flex-1 min-h-0">
                <PackagesTable />
            </TabsContent>
            <TabsContent value="settings" class="flex-1 min-h-0" />
        </Tabs>
        <Button variant="secondary" size="icon" class="absolute right-4 bottom-4 rounded-full"
            title="刷新列表" @click="onlineInfo.fetchInfo()">
            <RefreshCwIcon />
        </Button>
    </div>
</template>
