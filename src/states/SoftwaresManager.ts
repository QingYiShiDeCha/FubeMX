import { toast } from 'vue-sonner'
import { downloadDir } from '@tauri-apps/api/path'
import { invoke, Channel } from '@tauri-apps/api/core'

const SoftwaresManager = createGlobalState(() => {
  const onlineSoftwares = ref<SoftwareInfo[]>([])

  const dealing = ref<DealingSoftware>()

  function setOnlineSoftwares(list: SoftwareInfo[]) {
    onlineSoftwares.value = list
  }

  function getSoftwareFileName(url: string) {
    const s = url.split('/')
    return s[s.length - 1]
  }

  async function downloadSoftware(s: SoftwareInfo) {
    const name = getSoftwareFileName(s.download.windows!)
    console.log(name)
    if (dealing.value) {
      toast.error('正在安装其他软件，带宽有限，请稍后再试')
      return
    }
    dealing.value = { state: 'downloading', software: s, downloadProgress: 0 }

    const downloadPath = (await downloadDir()) + '/' + name
    const onEvent = new Channel<DownloadEvent>()
    let total = 0
    onEvent.onmessage = (event) => {
      if (event.event == 'started') {
        total = event.data.contentLength
      } else if (event.event == 'progress') {
        dealing.value!.downloadProgress = Math.round((100 * event.data.chunkLength) / total)
      } else if (event.event == 'finished') {
        clearDealing()
        toast.success(`软件已下载到 ${downloadPath}`)
      }
    }
    await invoke('download_file', {
      url: s.download.windows!,
      savePath: downloadPath,
      onEvent: onEvent,
    })
  }

  function clearDealing() {
    dealing.value = undefined
  }
  return { onlineSoftwares, setOnlineSoftwares, downloadSoftware, dealing }
})

export default SoftwaresManager
