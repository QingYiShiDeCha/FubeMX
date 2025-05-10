type PackageName = string; // 包名 即其压缩包以及最终安装文件夹的名称

interface PackageInfo_Online {
    serial: string;
    versions: {
        version: string;
        name: PackageName;
    }[]; // 修改类型定义，允许 versions 数组包含多个元素
}

interface FubeMXInfo_Online {
    version: number;
}

// 线上info.json文件的结构
interface OnlineInfo {
    FubeMX: FubeMXInfo_Online
    packages: PackageInfo_Online[];
}

interface VersionInfo {
    version: string;
    name: PackageName;
    installed: boolean; // 是否已安装 
}

interface PackageInfo {
    serial: string;
    versions: VersionInfo[];
    newVersion?: VersionInfo;
}

interface DealingPackage {
    state: 'downloading' | 'installing' | 'error'; // 下载、安装、完成、错误
    version: VersionInfo;
    downloadProgress: number; // 下载进度
    installProgress: number; // 安装进度
    error?: string; // 错误信息
}