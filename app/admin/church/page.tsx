/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db/prisma";
import ChurchClient from "./ChurchClient";

export default async function ChurchManagementPage() {
    const [churchInfo, schedules, collections] = await Promise.all([
        (prisma as any).churchInfo.findFirst({
            include: { schedules: true }
        }),
        (prisma as any).churchSchedule.findMany({
            orderBy: [{ day: "asc" }, { time: "asc" }]
        }),
        (prisma as any).churchCollection.findMany({
            orderBy: { date: "desc" },
            take: 12 // Last 12 records for the graph
        })
    ]);

    // Ensure a church info record exists
    let activeChurch = churchInfo;
    if (!activeChurch) {
        activeChurch = await (prisma as any).churchInfo.create({
            data: {
                name: "Our Lady of the Holy Rosary Parish",
                address: "Mapandan, Pangasinan"
            },
            include: { schedules: true }
        });
    }

    return (
        <ChurchClient
            initialInfo={activeChurch}
            initialSchedules={schedules}
            initialCollections={collections}
        />
    );
}
