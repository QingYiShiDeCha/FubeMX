<script setup lang="ts">
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import DialogState from '../states/Dialog'

const dialog = DialogState()
</script>

<template>
  <AlertDialog :open="dialog.open.value" @update:open="dialog.handleOpenChange">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{{ dialog.options.value.title }}</AlertDialogTitle>
        <AlertDialogDescription>{{ dialog.options.value.description }}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>{{ dialog.options.value.cancelText ?? '取消' }}</AlertDialogCancel>
        <AlertDialogAction @click="dialog.handleConfirm">
          {{ dialog.options.value.confirmText ?? '确定' }}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
