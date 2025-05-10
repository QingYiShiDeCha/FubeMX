import { compareVersion } from "../utils/version";
import { BaseDirectory, exists, writeFile, mkdir, remove } from "@tauri-apps/plugin-fs";
import { invoke } from "@tauri-apps/api/core";
import { c } from "naive-ui";

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
            notification.error({ title: '下载错误', content: '正在安装其他固件包，带宽有限，请稍后再试' })
            return;
        }
        dealing.value = { state: 'downloading', version: v, downloadProgress: 0, installProgress: 0 }
        await downloadPackage(v)
        if (dealing.value.state === 'error') {
            notification.error({ title: '下载错误', content: dealing.value.error })
            clearDealing();
            return;
        }
        dealing.value = { ...dealing.value!, state: 'installing' }
        try {
            await invoke("unzip_file", { fileName: v.name + ".zip" });
        } catch (error) {
            console.error('Failed to unzip file:', error);
            dealing.value = { ...dealing.value!, state: 'error', error: '解压错误' }
            notification.error({ title: '安装错误', content: dealing.value.error })
            clearDealing();
            return;
        }
        clearDealing();
        await refreshLocalPackages();
    }
    /**
     * 下载固件包 固件包压缩包会被下载到Home目录的FubeMX文件夹下
     * @param v 固件包信息
     */
    async function downloadPackage(v: VersionInfo) {
        const name = v.name;
        // 1. 检查是否已有同名的压缩包，有则删除
        if (await exists("FubeMX/" + name + ".zip", { baseDir: BaseDirectory.Home })) {
            await remove("FubeMX/" + name + ".zip", { baseDir: BaseDirectory.Home })
        }
        // 2. 下载压缩包
        const response = await fetch(`https://pan.baud-dance.com/d/FubeMX/${name}.zip`);
        if (!response.ok) {
            dealing.value = { ...dealing.value!, state: 'error', error: 'HTTP error! status: ' + response.status }
            return;
        }
        const contentLength = response.headers.get('Content-Length');
        if (!contentLength) {
            dealing.value = { ...dealing.value!, state: 'error', error: 'Content-Length header is missing' }
            return;
        }
        const totalBytes = parseInt(contentLength, 10);
        let loadedBytes = 0;
        let chunks: Uint8Array[] = [];
        const reader = response.body?.getReader();
        if (!reader) {
            dealing.value = { ...dealing.value!, state: 'error', error: 'Body reader is missing' }
            return;
        }
        async function read(): Promise<void> {
            if (!reader) {
                dealing.value = { ...dealing.value!, state: 'error', error: 'Body reader is missing' }
                return;
            }
            const { done, value } = await reader.read();
            if (done) {
                return;
            }
            if (value) {
                chunks.push(value);
                loadedBytes += value.length;
                dealing.value = { ...dealing.value!, downloadProgress: Math.round(loadedBytes / totalBytes * 100)   }
            }
            return await read();

        }
        await read();
        let chunksAll = new Uint8Array(loadedBytes);
        let offset = 0;
        for (let chunk of chunks) {
            chunksAll.set(chunk, offset);
            offset += chunk.length;
        }

        // 3. 写入压缩包到本地
        const dirExists = await exists("FubeMX", { baseDir: BaseDirectory.Home });
        if (!dirExists) {
            await mkdir("FubeMX", { baseDir: BaseDirectory.Home });
        }
        const filePath = "FubeMX/" + name + ".zip";

        await writeFile(filePath, chunksAll, { baseDir: BaseDirectory.Home })

    }
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