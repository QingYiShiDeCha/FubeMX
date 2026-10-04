<script setup lang="ts">
import { Window } from '@tauri-apps/api/window';
import { MinusIcon, MoonIcon, SunIcon, XIcon } from '@lucide/vue';
import ThemeConfig from '../states/ThemeConfig';

const appWindow = new Window('main');
const themeConfig = ThemeConfig();
</script>

<template>
    <div data-tauri-drag-region
        class="w-full h-10 shrink-0 flex items-center select-none border-b bg-background pl-4">
        <div class="flex items-center text-lg cursor-default">
            <span class="font-bold tracking-tight">Fube<span class="font-normal text-muted-foreground">MX</span></span>
        </div>
        <div class="flex-grow"></div>
        <div class="flex h-full items-stretch">
            <button class="w-11 flex items-center justify-center transition-colors hover:bg-accent hover:text-accent-foreground"
                title="切换主题" @click="themeConfig.toggleTheme()">
                <SunIcon v-if="themeConfig.isDark.value" class="size-4" />
                <MoonIcon v-else class="size-4" />
            </button>
            <button class="w-11 flex items-center justify-center transition-colors hover:bg-accent hover:text-accent-foreground"
                title="最小化" @click="appWindow.minimize()">
                <MinusIcon class="size-4" />
            </button>
            <button class="w-11 flex items-center justify-center transition-colors hover:bg-destructive hover:text-destructive-foreground"
                title="关闭" @click="appWindow.close()">
                <XIcon class="size-4" />
            </button>
        </div>
    </div>
</template>
