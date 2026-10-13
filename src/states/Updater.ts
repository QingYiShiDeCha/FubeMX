import { check } from '@tauri-apps/plugin-updater'
import { relaunch } from '@tauri-apps/plugin-process'
import { toast } from 'vue-sonner'
import DialogState from './Dialog'

const Updater = createGlobalState(() => {
  const dialog = DialogState()

  const checking = ref(false)
  const downloading = ref(false)
  const progress = ref(0)

  async function checkForUpdate(options: { silent?: boolean } = {}) {
    const { silent = true } = options
    if (checking.value || downloading.value) return

    checking.value = true
    try {
      const update = await check()
      if (!update) {
        if (!silent) toast.info('当前已是最新版本')
        return
      }

      dialog.confirm({
        title: `发现新版本 V${update.version}`,
        description: update.body || '是否更新到最新版本？',
        confirmText: '立即更新',
        cancelText: '稍后再说',
        onConfirm: () => {
          downloadAndInstall(update)
        },
      })
    } catch (error) {
      console.error('检查更新失败:', error)
      if (!silent) toast.error(`检查更新失败：${error}`)
    } finally {
      checking.value = false
    }
  }

  async function downloadAndInstall(update: Awaited<ReturnType<typeof check>>) {
    if (!update) return
    downloading.value = true
    progress.value = 0

    let total = 0
    let downloaded = 0
    try {
      await update.downloadAndInstall((event) => {
        switch (event.event) {
          case 'Started':
            total = event.data.contentLength ?? 0
            break
          case 'Progress':
            downloaded += event.data.chunkLength
            if (total > 0) progress.value = Math.round((100 * downloaded) / total)
            break
          case 'Finished':
            progress.value = 100
            break
        }
      })

      dialog.confirm({
        title: '更新已就绪',
        description: '新版本已安装完成，是否立即重启应用？',
        confirmText: '立即重启',
        cancelText: '稍后自行重启',
        onConfirm: () => {
          relaunch()
        },
      })
    } catch (error) {
      console.error('更新下载失败:', error)
      toast.error(`更新下载失败：${error}`)
    } finally {
      downloading.value = false
    }
  }

  return { checking, downloading, progress, checkForUpdate }
})

export default Updater
