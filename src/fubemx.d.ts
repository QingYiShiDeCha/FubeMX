type PackageName = string // 包名 即其压缩包以及最终安装文件夹的名称

interface PackageInfo_Online {
  serial: string
  versions: {
    version: string
    name: PackageName
  }[] // 修改类型定义，允许 versions 数组包含多个元素
}

interface FubeMXInfo_Online {
  version: string
}

interface SoftwareInfo {
  name: string // 软件名称
  version: string // 软件版本
  description: string // 软件描述
  faq?: string // 常见问题链接
  type: 'web' | 'desktop'
  download: {
    // 下载链接
    windows?: string // Windows 下载链接
    mac?: string // Mac 下载链接
    linux?: string // Linux 下载链接
  }
}

// 线上info.json文件的结构
interface OnlineInfo {
  FubeMX: FubeMXInfo_Online
  softwares: SoftwareInfo[]
  packages: PackageInfo_Online[]
}

interface VersionInfo {
  version: string
  name: PackageName
  installed: boolean // 是否已安装
}

interface PackageInfo {
  serial: string
  versions: VersionInfo[]
  newVersion?: VersionInfo
}

interface DealingPackage {
  state: 'downloading' | 'installing' | 'error' // 下载、安装、完成、错误
  version: VersionInfo
  downloadProgress: number // 下载进度
  installProgress: number // 安装进度
  error?: string // 错误信息
}

interface DealingSoftware {
  state: 'downloading' | 'error'
  software: SoftwareInfo
  downloadProgress: number // 下载进度
  error?: string // 错误信息
}

type DownloadEvent =
  | {
      event: 'started'
      data: {
        url: string
        downloadId: number
        contentLength: number
      }
    }
  | {
      event: 'progress'
      data: {
        downloadId: number
        chunkLength: number
      }
    }
  | {
      event: 'finished'
      data: {
        downloadId: number
      }
    }
