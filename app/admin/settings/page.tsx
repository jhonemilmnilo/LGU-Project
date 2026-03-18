import prisma from "@/lib/db/prisma";
import { SettingsClient } from "./SettingsClient";
import { Suspense } from "react";

export default async function SettingsPage() {
    // Sequential fetch to avoid "MaxClientsInSessionMode" error on some DB providers
    const settingsList = await prisma.systemSetting.findMany();
    const slides = await prisma.heroSlide.findMany({
        orderBy: { order: 'asc' }
    });

    // Convert settings list to a key-value object
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const settings = settingsList.reduce((acc: any, curr: { key: string; value: string }) => {
        acc[curr.key] = curr.value;
        return acc;
    }, {});

    return (
        <div className="p-8">
            <Suspense fallback={<div>Loading Settings...</div>}>
                <SettingsClient 
                    settings={settings} 
                    slides={slides} 
                />
            </Suspense>
        </div>
    );
}
