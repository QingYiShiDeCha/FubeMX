import { createGlobalState } from '@vueuse/core'

interface ConfirmOptions {
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
}

const DialogState = createGlobalState(() => {
  const open = ref(false)
  const options = ref<ConfirmOptions>({ title: '', description: '', onConfirm: () => {} })

  function confirm(opts: ConfirmOptions) {
    options.value = opts
    open.value = true
  }

  function handleConfirm() {
    options.value.onConfirm()
    open.value = false
  }

  function handleOpenChange(value: boolean) {
    open.value = value
  }

  return { open, options, confirm, handleConfirm, handleOpenChange }
})

export default DialogState
