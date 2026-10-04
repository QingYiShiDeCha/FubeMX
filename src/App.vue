<script setup lang="ts">
import AppContent from './AppContent.vue'
import ConfirmDialog from './components/ConfirmDialog.vue'
import { Toaster } from '@/components/ui/sonner'
</script>

<template>
  <AppContent />
  <Toaster position="bottom-right" />
  <ConfirmDialog />
</template>
