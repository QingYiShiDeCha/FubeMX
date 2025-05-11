import { compareVersion } from "../utils/version";
import { Channel, invoke } from "@tauri-apps/api/core";
import { downloadDir, homeDir } from "@tauri-apps/api/path";

const PackageManager = createGlobalState(() => {
    const notification = useNotification();
    // packages列表, 来自线上
    const onLinePackages = ref<PackageInfo_Online[]>([]);

    function setOnlinePackages(list: PackageInfo_Online[]) {
        onLinePackages.value = list;
    }

    // 本地已安装的固件包文件夹名称，从Repository文件夹分析
    const localPackages = ref<PackageName[]>([]);

    // 正在处理(下载、安装)的固件包信息
    const dealing = ref<DealingPackage>();

    // 最终完善的packages列表，包含已安装的信息
    const packages = computed(() => {
        return onLinePackages.value.map((item) => {
            const versions = item.versions.map((version) => {
                return { ...version, installed: localPackages.value.includes(version.name) }
            })
            versions.sort((a, b) => compareVersion(b.version, a.version))
            const newVersion = versions.length > 0 ? versions[0] : undefined
            return { ...item, versions, newVersion }
        })
    })

    /**
     * 开始安装，当用户点击安装按钮时调用
     * @param v 固件包信息
     */
    async function startInstall(v: VersionInfo) {
        if (dealing.value) {
            notification.error({ title: '下载错误', content: '正在安装其他固件包，带宽有限，请稍后再试', duration: 2500 })
            return;
        }
        dealing.value = { state: 'downloading', version: v, downloadProgress: 0, installProgress: 0 }
        await downloadPackage(v)
        if (dealing.value.state === 'error') {
            notification.error({ title: '下载错误', content: dealing.value.error, duration: 2500 })
            clearDealing();
            return;
        }
        dealing.value = { ...dealing.value!, state: 'installing' }
        try {
            const downloadPath = await downloadDir();
            const repositoryPath = await homeDir() + "/STM32Cube/Repository";
            await invoke("unzip_file", { fileName: v.name + ".zip", downloadPath, repositoryPath });
        } catch (error) {
            console.error('Failed to unzip file:', error);
            dealing.value = { ...dealing.value!, state: 'error', error: '解压错误' }
            notification.error({ title: '安装错误', content: dealing.value.error, duration: 2500 })
            clearDealing();
            return;
        }
        clearDealing();
        await refreshLocalPackages();
    }

    const downloadPackage = (v: VersionInfo) => new Promise<void>(async (resolve, _) => {
        const name = v.name + ".zip";
        const downloadPath = await downloadDir() + "/" + name;
        const url = `https://pan.baud-dance.com/d/FubeMX/${name}`
        const onEvent = new Channel<DownloadEvent>();
        let total = 0;
        onEvent.onmessage = (event) => {
            if (event.event == 'started') {
                total = event.data.contentLength;
            } else if (event.event == 'progress') {
                dealing.value!.downloadProgress = Math.round(100 * event.data.chunkLength / total);
            } else if (event.event == 'finished') {
                resolve();
            }
        }
        await invoke('download_file', { url, savePath: downloadPath, onEvent: onEvent })
    })

    /**
     * 清除正在处理的固件包信息
     */
    function clearDealing() {
        dealing.value = undefined;
    }

    async function refreshLocalPackages() {
        localPackages.value = await invoke("get_installed_package") as PackageName[];
        console.log(localPackages.value);
    }
    refreshLocalPackages()
    return { packages, setOnlinePackages, dealing, startInstall, refreshLocalPackages }
})

export default PackageManager;