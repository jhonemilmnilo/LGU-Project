/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db/prisma";
import ChurchClient from "./ChurchClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function ChurchManagementPage() {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    const isBarangayAdmin = user?.role === "BARANGAY_ADMIN";

    const whereClause = isBarangayAdmin ? { barangay: user.managedBarangay } : {};

    const [churchInfo, schedules, collections] = await Promise.all([
        (prisma as any).churchInfo.findFirst({
            where: whereClause,
            include: { schedules: true }
        }),
        (prisma as any).churchSchedule.findMany({
            orderBy: [{ day: "asc" }, { time: "asc" }]
        }),
        (prisma as any).churchCollection.findMany({
            orderBy: { date: "desc" },
            take: 12
        })
    ]);

    // Ensure a church info record exists
    let activeChurch = churchInfo;
    if (!activeChurch) {
        const createData: any = {
            name: isBarangayAdmin ? `${user.managedBarangay} Parish` : "Our Lady of the Holy Rosary Parish",
            address: isBarangayAdmin ? `${user.managedBarangay}, Mapandan, Pangasinan` : "Mapandan, Pangasinan"
        };
        if (isBarangayAdmin) {
            createData.barangay = user.managedBarangay;
        }
        activeChurch = await (prisma as any).churchInfo.create({
            data: createData,
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
