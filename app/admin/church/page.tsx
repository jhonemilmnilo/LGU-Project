 
import prisma from "@/lib/db/prisma";
import ChurchClient from "./ChurchClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function ChurchManagementPage(props: { searchParams: Promise<{ barangay?: string }> }) {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    const isBarangayAdmin = user?.role === "BARANGAY_ADMIN";
    const isAdmin = user?.role === "ADMIN";

    const params = await props.searchParams;
    const selectedBarangay = isBarangayAdmin ? user.managedBarangay : params.barangay;

    // Use { barangay: null } for Global context if not a Barangay Admin and no barangay is selected
    const whereClause = isBarangayAdmin ? { barangay: user.managedBarangay } : (selectedBarangay ? { barangay: selectedBarangay } : { barangay: null });

    // 1. Fetch available barangays for the switcher
    const activeBarangays = isAdmin ? await (prisma as any).barangayInfo.findMany({
        orderBy: { name: "asc" },
        select: { name: true }
    }) : [];

    // 2. Fetch or create church info
    let activeChurch = await prisma.churchInfo.findFirst({
        where: whereClause,
        include: { schedules: true }
    });

    // Fallback for legacy record if Global context is missing ("" instead of null)
    if (!activeChurch && !isBarangayAdmin && !selectedBarangay) {
        activeChurch = await prisma.churchInfo.findFirst({
            where: { barangay: "" },
            include: { schedules: true }
        });
    }
    
    // Auto-create for Barangay Admin or if it's the first time visiting Global context
    if (!activeChurch) {
        const createData: any = {
            name: isBarangayAdmin ? "" : "Our Lady of the Holy Rosary Parish",
            address: "",
            barangay: isBarangayAdmin ? user.managedBarangay : (selectedBarangay || null)
        };
        activeChurch = await prisma.churchInfo.create({
            data: createData,
            include: { schedules: true }
        });
    }

    if (!activeChurch) {
        return <div className="p-8 text-center font-bold text-red-600 italic">Critical Error: Church profile could not be initialized.</div>;
    }

    // 3. Fetch scoped data
    const [schedules, collections] = await Promise.all([
        (prisma as any).churchSchedule.findMany({
            where: { churchInfoId: activeChurch.id },
            orderBy: [{ day: "asc" }, { time: "asc" }]
        }),
        (prisma as any).churchCollection.findMany({
            where: { churchInfoId: activeChurch.id },
            orderBy: { date: "desc" },
            take: 12
        })
    ]);

    return (
        <ChurchClient
            key={activeChurch.id}
            initialInfo={activeChurch}
            initialSchedules={schedules}
            initialCollections={collections}
            isAdmin={isAdmin}
            availableBarangays={activeBarangays.map((b: any) => b.name)}
            currentBarangay={selectedBarangay}
        />
    );
}
