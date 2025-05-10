import { BaseDirectory, exists, writeFile, mkdir } from "@tauri-apps/plugin-fs";
import { createGlobalState } from "@vueuse/core";
import { invoke } from "@tauri-apps/api/core"
import { ref } from "vue";
import { compareVersion } from "../utils/version";

interface PackageInfo {
    serial: string;
    versions: {
        version: string;
        file: string;
    }[]; // 修改类型定义，允许 versions 数组包含多个元素
}

interface FubeMXInfo {
    version: number;
}

interface ResponseData {
    FubeMX: FubeMXInfo
    packages: PackageInfo[];
}

const OnlineInfo = createGlobalState(() => {
    const FubeMX = ref<FubeMXInfo>();
    const packages = ref<PackageInfo[]>([]);

    async function fetchInfo() {
        try {
            const res = await fetch('https://pan.baud-dance.com/d/FubeMX/packages.json', { headers: { "Cache-Control": "no-cache" } });
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const data: ResponseData = await res.json();
            console.log(data)
            // 更新 version 和 packages 的值
            FubeMX.value = data.FubeMX;
            packages.value = data.packages;
            packages.value.forEach((item) => {
                item.versions.sort((a, b) => compareVersion(b.version, a.version))
            })
            console.log('Online info fetched successfully', packages.value);
        } catch (error) {
            console.error('Failed to fetch online info:', error);
        }
    }

    async function downloadPackage(packageName: string) {
        console.log(`https://pan.baud-dance.com/d/FubeMX/${packageName}.zip`)
        const response = await fetch(`https://pan.baud-dance.com/d/FubeMX/${packageName}.zip`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const contentLength = response.headers.get('Content-Length');
        if (!contentLength) {
            throw new Error('Content-Length header is missing');
        }
        const totalBytes = parseInt(contentLength, 10);
        let loadedBytes = 0;
        let chunks: Uint8Array[] = [];
        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error('Body reader is missing');
        }
        async function read(): Promise<void> {
            if (!reader) {
                throw new Error('Body reader is missing');
            }
            const { done, value } = await reader.read();
            if (done) {
                return;
            }
            if (value) {
                chunks.push(value);
                loadedBytes += value.length;
                console.log(`Downloaded ${loadedBytes} of ${totalBytes} bytes`);
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

        const dirExists = await exists("FubeMX", { baseDir: BaseDirectory.Home });
        if (!dirExists) {
            await mkdir("FubeMX", { baseDir: BaseDirectory.Home });
        }
        const filePath = "FubeMX/" + packageName + ".zip";

        await writeFile(filePath, chunksAll, { baseDir: BaseDirectory.Home })

        console.log('ZIP 文件已保存');
        unzipFile(`${packageName}.zip`);
    }

    async function unzipFile(fileName: string) {
        await invoke("unzip_file", { fileName });
        console.log('解压完成');
    }

    return { FubeMX, packages, fetchInfo, downloadPackage, unzipFile }
})

export default OnlineInfo;