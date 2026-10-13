<script setup lang="ts">
import { RefreshCwIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import AppSidebar from './components/AppSidebar.vue'
import AppToolbar from './components/AppToolbar.vue'
import OnlineInfo from './states/OnlineInfo'

const route = useRoute()
const onlineInfo = OnlineInfo()

onlineInfo.fetchInfo()
</script>

<template>
  <div class="flex h-screen flex-col overflow-hidden bg-background text-foreground">
    <AppToolbar />
    <div class="flex min-h-0 flex-1">
      <AppSidebar />
      <main class="flex min-w-0 flex-1 flex-col">
        <header class="flex shrink-0 items-center justify-between px-6 pt-5 pb-3">
          <h1 class="text-base font-semibold">{{ route.meta.title }}</h1>
          <Button variant="outline" size="sm" class="gap-1.5" @click="onlineInfo.fetchInfo()">
            <RefreshCwIcon />
            刷新
          </Button>
        </header>
        <div class="flex min-h-0 flex-1 flex-col px-6 pb-5">
          <RouterView />
        </div>
      </main>
    </div>
  </div>
</template>
