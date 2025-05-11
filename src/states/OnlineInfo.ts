import PackageManager from "./PackageManager";
import SoftwaresManager from "./SoftwaresManager";

const OnlineInfo = createGlobalState(() => {
    const notification = useNotification();
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
            notification.success({ title: '更新成功', content: '列表数据已更新',duration: 2500})
        } catch (error) {
            console.error('Failed to fetch online info:', error);
        }
    }
    return { FubeMX, fetchInfo }
})

export default OnlineInfo;