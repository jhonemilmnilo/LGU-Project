import prisma from "@/lib/db/prisma";
import { UserAccommodationView, type Accommodation } from "./UserAccommodationView";

export default async function UserAccommodationPage() {
    const accommodations = await prisma.accommodation.findMany({
        orderBy: { createdAt: "desc" },
    });

    const activeBarangays = await prisma.barangayInfo.findMany({
        orderBy: { name: "asc" },
        select: { name: true }
    });

    return (
        <UserAccommodationView 
            initialAccommodations={accommodations as any} 
            activeBarangays={activeBarangays.map(b => b.name)}
        />
    );
}
