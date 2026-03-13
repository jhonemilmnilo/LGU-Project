import prisma from "@/lib/db/prisma";
import { SettingsClient } from "./SettingsClient";

export default async function SettingsPage() {
    // Fetch all system settings andSlides
    const [settingsList, slides] = await Promise.all([
        prisma.systemSetting.findMany(),
        prisma.heroSlide.findMany({
            orderBy: { order: 'asc' }
        })
    ]);

    // Convert settings list to a key-value object
    const settings = settingsList.reduce((acc: any, curr: { key: string; value: string }) => {
        acc[curr.key] = curr.value;
        return acc;
    }, {});

    return (
        <div className="p-8">
            <SettingsClient 
                settings={settings} 
                slides={slides} 
            />
        </div>
    );
}
