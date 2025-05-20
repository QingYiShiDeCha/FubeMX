import PackageManager from "./PackageManager";
import SoftwaresManager from "./SoftwaresManager";
import { compareVersion } from "../utils/version"
import { openUrl } from "@tauri-apps/plugin-opener";

const OnlineInfo = createGlobalState(() => {
    const notification = useNotification();
    const dialog = useDialog();
    const currentVersion = "0.1.0";
    const FubeMX = ref<FubeMXInfo_Online>();
    const packageManager = PackageManager()
    const softwareManager = SoftwaresManager()

    async function fetchInfo() {
        try {
            const res = await fetch('https://pan.baud-dance.com/d/FubeMX/info.json', { headers: { "Cache-Control": "no-cache" } });
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const data: OnlineInfo = await res.json();
            console.log(data)
            // 更新 version 和 packages 的值
            FubeMX.value = data.FubeMX;
            packageManager.setOnlinePackages(data.packages)
            softwareManager.setOnlineSoftwares(data.softwares)
            notification.success({ title: '更新成功', content: '列表数据已更新', duration: 2500 })

            if (compareVersion(currentVersion, FubeMX.value.version) < 0) {
                dialog.info({
                    title: '有新版本',
                    content: '当前版本为 V' + currentVersion + '，最新版本为 V' + FubeMX.value.version + '，是否更新？',
                    positiveText: '获取最新版本', negativeText: '取消',
                    onPositiveClick: () => { openUrl("https://fubemx.keysking.com") }
                })
            }
        } catch (error) {
            console.error('Failed to fetch online info:', error);
        }
    }
    return { FubeMX, fetchInfo }
})

export default OnlineInfo;