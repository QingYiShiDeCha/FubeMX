import { toast } from 'vue-sonner'
import PackageManager from './PackageManager'
import SoftwaresManager from './SoftwaresManager'

const OnlineInfo = createGlobalState(() => {
  const currentVersion = __APP_VERSION__
  const FubeMX = ref<FubeMXInfo_Online>()
  const packageManager = PackageManager()
  const softwareManager = SoftwaresManager()

  async function fetchInfo() {
    try {
      const res = await fetch('https://pan.baud-dance.com/d/FubeMX/info.json', {
        headers: { 'Cache-Control': 'no-cache' },
      })
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      const data: OnlineInfo = await res.json()
      console.log(data)
      // 更新 version 和 packages 的值
      FubeMX.value = data.FubeMX
      packageManager.setOnlinePackages(data.packages)
      softwareManager.setOnlineSoftwares(data.softwares)
      toast.success('列表数据已更新')
    } catch (error) {
      console.error('Failed to fetch online info:', error)
      toast.error('获取线上信息失败，请检查网络连接')
    }
  }
  return { FubeMX, fetchInfo, currentVersion }
})

export default OnlineInfo
