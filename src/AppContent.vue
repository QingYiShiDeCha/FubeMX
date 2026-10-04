<script setup lang="ts">
import { RefreshCwIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import AppSidebar from './components/AppSidebar.vue'
import AppToolbar from './components/AppToolbar.vue'
import OnlineInfo from './states/OnlineInfo'
import PackagesTable from './components/PackagesTable.vue'
import SettingsPage from './components/SettingsPage.vue'
import SoftwaresTable from './components/SoftwaresTable.vue'

const onlineInfo = OnlineInfo()
const activePage = ref('softwares')

const titles: Record<string, string> = {
  softwares: '软件安装',
  packages: '固件包管理',
  settings: '设置',
}
const title = computed(() => titles[activePage.value] ?? '')

onlineInfo.fetchInfo()
</script>

<template>
  <div class="flex h-screen flex-col overflow-hidden bg-background text-foreground">
    <AppToolbar />
    <div class="flex min-h-0 flex-1">
      <AppSidebar v-model="activePage" />
      <main class="flex min-w-0 flex-1 flex-col">
        <header class="flex shrink-0 items-center justify-between px-6 pt-5 pb-3">
          <h1 class="text-base font-semibold">{{ title }}</h1>
          <Button variant="outline" size="sm" class="gap-1.5" @click="onlineInfo.fetchInfo()">
            <RefreshCwIcon />
            刷新
          </Button>
        </header>
        <div class="flex min-h-0 flex-1 flex-col px-6 pb-5">
          <SoftwaresTable v-if="activePage === 'softwares'" />
          <PackagesTable v-else-if="activePage === 'packages'" />
          <SettingsPage v-else />
        </div>
      </main>
    </div>
  </div>
</template>
