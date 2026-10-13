<script setup lang="ts">
import ConfirmDialog from './components/ConfirmDialog.vue'
import { Toaster } from '@/components/ui/sonner'
</script>

<template>
  <div class="contents">
    <RouterView />
    <Toaster position="bottom-right" />
    <ConfirmDialog />
  </div>
</template>
