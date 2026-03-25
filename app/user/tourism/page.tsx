import prisma from "@/lib/db/prisma";
import { UserTourismView, type TourismSpot } from "./UserTourismView";

export default async function UserTourismPage({
    searchParams,
}: {
    searchParams: Promise<{ barangay?: string }>;
}) {
    const { barangay } = await searchParams;
    const isFiltered = barangay && barangay !== "All";

    const tourismSpots = await prisma.tourismSpot.findMany({
        where: { 
            isPublished: true,
            ...(isFiltered ? { barangay } : {})
        } as any,
        orderBy: { name: "asc" }
    });

    const activeBarangays = await prisma.barangayInfo.findMany({
        orderBy: { name: "asc" },
        select: { name: true }
    });

    return (
        <UserTourismView 
            initialTourism={tourismSpots as any} 
            activeBarangays={activeBarangays.map(b => b.name)}
        />
    );
}
