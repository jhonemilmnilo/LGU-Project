import prisma from "@/lib/db/prisma";

export async function getSystemSetting(key: string, defaultValue: string = ""): Promise<string> {
    try {
        const setting = await prisma.systemSetting.findUnique({
            where: { key }
        });
        return setting?.value || defaultValue;
    } catch (error) {
        console.error(`Error fetching system setting ${key}:`, error);
        return defaultValue;
    }
}

export async function getMultipleSystemSettings(keys: string[]): Promise<Map<string, string>> {
    try {
        const settings = await prisma.systemSetting.findMany({
            where: {
                key: { in: keys }
            }
        });
        
        const settingsMap = new Map<string, string>();
        settings.forEach(s => settingsMap.set(s.key, s.value));
        return settingsMap;
    } catch (error) {
        console.error(`Error fetching multiple system settings:`, error);
        return new Map();
    }
}

export async function isMaintenanceMode(): Promise<boolean> {
    const value = await getSystemSetting("maintenance_mode", "false");
    return value === "true";
}

