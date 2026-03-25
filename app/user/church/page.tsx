import prisma from "@/lib/db/prisma";
import { UserChurchView } from "./UserChurchView";

export default async function UserChurchPage(props: { searchParams: Promise<{ barangay?: string }> }) {
    const params = await props.searchParams;
    const barangay = params.barangay;
    const isFiltered = barangay && barangay !== "All";
    
    // Determine the active church context
    const whereClause = isFiltered ? { barangay } : { OR: [{ barangay: null }, { barangay: "" }] };
    
    const churchInfo = await (prisma as any).churchInfo.findFirst({
        where: whereClause,
        include: { schedules: true }
    });

    if (!churchInfo) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <p className="text-slate-500 font-black italic uppercase tracking-tighter text-xl">Spiritual Center Not Found</p>
                <a href="/user/church" className="text-blue-600 font-bold italic underline">Return to Main Parish</a>
            </div>
        );
    }

    // Fetch available sectors for the switcher (only those that actually have records)
    const availableSectors = await (prisma as any).churchInfo.findMany({
        where: { 
            NOT: [
                { barangay: null },
                { barangay: "" }
            ]
        },
        select: { barangay: true },
        orderBy: { barangay: "asc" }
    });

    const [schedules, collections] = await Promise.all([
        (prisma as any).churchSchedule.findMany({
            where: { churchInfoId: churchInfo.id },
            orderBy: [{ day: "asc" }, { time: "asc" }]
        }),
        (prisma as any).churchCollection.findMany({
            where: { churchInfoId: churchInfo.id },
            orderBy: { date: "desc" }
        })
    ]);

    return (
        <UserChurchView 
            info={churchInfo} 
            schedules={schedules} 
            collections={collections} 
            availableBarangays={availableSectors.map((s: any) => s.barangay)}
            currentBarangay={barangay}
        />
    );
}
