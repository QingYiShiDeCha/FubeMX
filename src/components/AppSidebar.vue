<script setup lang="ts">
import { AppWindowIcon, BoxesIcon, SettingsIcon } from '@lucide/vue'

const route = useRoute()

const items = [
  { path: '/softwares', label: '软件安装', icon: AppWindowIcon },
  { path: '/packages', label: '固件包管理', icon: BoxesIcon },
  { path: '/settings', label: '设置', icon: SettingsIcon },
]
</script>

<template>
  <nav class="flex h-full w-48 shrink-0 flex-col gap-1 border-r bg-muted/30 p-3">
    <RouterLink
      v-for="item in items"
      :key="item.path"
      :to="item.path"
      class="flex items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
      :class="
        route.path.startsWith(item.path)
          ? 'bg-accent font-medium text-accent-foreground'
          : 'text-muted-foreground'
      "
    >
      <component :is="item.icon" class="size-4 shrink-0" />
      {{ item.label }}
    </RouterLink>
  </nav>
</template>
