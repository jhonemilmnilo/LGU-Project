import prisma from "@/lib/db/prisma";
import { UserTourismView, type TourismSpot } from "./UserTourismView";

export default async function UserTourismPage() {
    const tourismSpots = await prisma.tourismSpot.findMany({
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
